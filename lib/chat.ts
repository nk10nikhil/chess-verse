"use client"

import { nanoid } from "nanoid"

export async function connectToChat(gameId: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    // Instead of directly checking for cookies, we'll rely on the socket connection
    // which will handle authentication on the server-side

    // In a real app, this would connect to a WebSocket server with authentication
    // For this example, we'll simulate the connection with auth check
    checkAuthentication()
      .then(isAuthenticated => {
        if (!isAuthenticated) {
          reject(new Error("Not authenticated"))
          return
        }

        const socket = simulateChatWebSocket(gameId)

        socket.onopen = () => {
          resolve(socket)
        }

        socket.onerror = (error) => {
          reject(error)
        }
      })
      .catch(error => {
        reject(new Error("Authentication check failed"))
      })
  })
}

// Helper function to check authentication status
async function checkAuthentication(): Promise<boolean> {
  try {
    // Make a request to your API to check authentication status
    const response = await fetch('/api/auth/check', {
      method: 'GET',
      credentials: 'include' // This ensures cookies are sent with the request
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.authenticated
  } catch (error) {
    console.error("Authentication check failed:", error)
    return false
  }
}

export async function sendChatMessage(gameId: string, message: string): Promise<boolean> {
  // In a real app, this would send a message via the WebSocket
  // For this example, we'll simulate sending a message
  return true
}

// This is a simulation of a WebSocket for the example
// In a real app, you would connect to a real WebSocket server
function simulateChatWebSocket(gameId: string): WebSocket {
  const mockSocket: any = {
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
    send: (data: string) => {
      const parsedData = JSON.parse(data)

      // Simulate responses based on the message type
      if (parsedData.type === "chatMessage") {
        setTimeout(() => {
          if (mockSocket.onmessage) {
            // Echo the message back
            mockSocket.onmessage({
              data: JSON.stringify({
                type: "chatMessage",
                message: {
                  id: nanoid(),
                  sender: "You",
                  message: parsedData.message,
                  timestamp: new Date().toISOString(),
                },
              }),
            })

            // Simulate opponent response
            setTimeout(() => {
              if (mockSocket.onmessage) {
                mockSocket.onmessage({
                  data: JSON.stringify({
                    type: "chatMessage",
                    message: {
                      id: nanoid(),
                      sender: "Opponent",
                      message: simulateResponse(parsedData.message),
                      timestamp: new Date().toISOString(),
                    },
                  }),
                })
              }
            }, 2000)
          }
        }, 100)
      }
    },
    close: () => {
      if (mockSocket.onclose) {
        mockSocket.onclose()
      }
    },
  }

  // Simulate connection and initial chat history
  setTimeout(() => {
    if (mockSocket.onopen) {
      mockSocket.onopen()
    }

    if (mockSocket.onmessage) {
      // Send chat history
      mockSocket.onmessage({
        data: JSON.stringify({
          type: "chatHistory",
          messages: simulateChatHistory(),
        }),
      })
    }
  }, 500)

  return mockSocket as WebSocket
}

function simulateChatHistory() {
  // Generate some sample chat messages
  const now = new Date()
  return [
    {
      id: nanoid(),
      sender: "System",
      message: "Game started. Good luck!",
      timestamp: new Date(now.getTime() - 300000).toISOString(),
    },
    {
      id: nanoid(),
      sender: "Opponent",
      message: "Hi, good luck and have fun!",
      timestamp: new Date(now.getTime() - 240000).toISOString(),
    },
    {
      id: nanoid(),
      sender: "You",
      message: "Thanks, you too!",
      timestamp: new Date(now.getTime() - 210000).toISOString(),
    },
  ]
}

function simulateResponse(message: string): string {
  // Generate a simple response based on the message
  if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
    return "Hello there!"
  } else if (message.toLowerCase().includes("good move")) {
    return "Thanks! I've been practicing."
  } else if (message.toLowerCase().includes("good game") || message.toLowerCase().includes("gg")) {
    return "Good game indeed!"
  } else if (message.includes("?")) {
    return "I'm not sure, let's focus on the game."
  } else {
    const responses = [
      "Interesting move...",
      "Hmm, let me think about my next move.",
      "This is a good game!",
      "Are you enjoying the match?",
      "I need to be careful here.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }
}
