"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, RefreshCw, AlertCircle } from "lucide-react"
import { connectToChat } from "@/lib/chat"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ChatMessage = {
  id: string
  sender: string
  message: string
  timestamp: string
}

export function GameChat({ gameId }: { gameId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isConnecting, setIsConnecting] = useState(true)
  const [connectError, setConnectError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const connect = async () => {
      try {
        setIsConnecting(true)
        setConnectError(null)
        console.log("GameChat: Connecting to chat for game:", gameId);

        const socket = await connectToChat(gameId)
        console.log("GameChat: Chat socket connected successfully");
        socketRef.current = socket

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log("GameChat: Message received:", data.type);

            if (data.type === "chatHistory") {
              setMessages(data.messages)
              setIsConnecting(false)
            } else if (data.type === "chatMessage") {
              setMessages((prev) => [...prev, data.message])
            } else if (data.type === "error") {
              console.error("GameChat: Error from server:", data.message);
              setConnectError(data.message)
              setIsConnecting(false)
            }
          } catch (error) {
            console.error("GameChat: Error parsing message:", error);
            setConnectError("Error processing chat data")
            setIsConnecting(false)
          }
        }

        socket.onclose = () => {
          console.log("GameChat: Socket closed")
          if (isConnecting) {
            setConnectError("Chat connection closed unexpectedly")
            setIsConnecting(false)
          }
        }

        socket.onerror = (error) => {
          console.error("GameChat: Socket error:", error)
          setConnectError("Error connecting to chat")
          setIsConnecting(false)
        }
      } catch (error: any) {
        console.error("GameChat: Failed to connect to chat:", error)
        setConnectError(error.message || "Failed to connect to chat")
        setIsConnecting(false)
      }
    }

    connect()

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [gameId, retryCount])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && socketRef.current) {
      socketRef.current.send(
        JSON.stringify({
          type: "chatMessage",
          message: newMessage.trim(),
        }),
      )
      setNewMessage("")
    }
  }

  const handleRetryConnection = () => {
    setRetryCount(prev => prev + 1)
  }

  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="pb-2">
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3">
        {connectError ? (
          <div className="h-full flex flex-col justify-center">
            <Alert variant="destructive" className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{connectError}</AlertDescription>
            </Alert>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryConnection}
              className="w-full mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        ) : isConnecting ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
            <p className="text-sm text-muted-foreground">Connecting to chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium">{msg.sender}</span>
                  <span className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm">{msg.message}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isConnecting || !!connectError}
          />
          <Button type="submit" size="icon" disabled={isConnecting || !!connectError || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
