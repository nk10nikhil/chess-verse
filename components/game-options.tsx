"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createGame, joinGame, findRandomGame } from "@/lib/game"

export function GameOptions() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [roomId, setRoomId] = useState("")

  async function handleCreateGame() {
    setIsLoading(true)
    setError("")
    try {
      const gameId = await createGame()
      router.push(`/game/${gameId}`)
    } catch (error) {
      setError("Failed to create game. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleJoinGame(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const success = await joinGame(roomId)
      if (success) {
        router.push(`/game/${roomId}`)
      } else {
        setError("Invalid room ID or room is full.")
      }
    } catch (error) {
      setError("Failed to join game. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRandomGame() {
    setIsLoading(true)
    setError("")
    try {
      const gameId = await findRandomGame()
      router.push(`/game/${gameId}`)
    } catch (error) {
      setError("Failed to find a random game. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Play Chess</CardTitle>
        <CardDescription>Create a new game or join an existing one</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="join">Join</TabsTrigger>
            <TabsTrigger value="random">Random</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="pt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a new private game and invite a friend to play with you.
              </p>
              <Button onClick={handleCreateGame} disabled={isLoading} className="w-full">
                {isLoading ? "Creating..." : "Create New Game"}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="join" className="pt-4">
            <form onSubmit={handleJoinGame} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Joining..." : "Join Game"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="random" className="pt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Find a random opponent to play with immediately.</p>
              <Button onClick={handleRandomGame} disabled={isLoading} className="w-full">
                {isLoading ? "Finding..." : "Find Random Opponent"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  )
}
