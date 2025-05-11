"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getActiveGames } from "@/lib/game"

type Game = {
  id: string
  opponent: string
  lastMoveAt: string
  yourTurn: boolean
}

export function ActiveGames() {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadGames() {
      try {
        const activeGames = await getActiveGames()
        setGames(activeGames)
      } catch (error) {
        console.error("Failed to load active games:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadGames()
    // Set up polling to refresh games every 30 seconds
    const interval = setInterval(loadGames, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Games</CardTitle>
          <CardDescription>Your ongoing chess matches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading your games...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Games</CardTitle>
        <CardDescription>Your ongoing chess matches</CardDescription>
      </CardHeader>
      <CardContent>
        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <p className="text-muted-foreground">You don't have any active games</p>
            <Link href="/dashboard">
              <Button variant="outline">Start a New Game</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">vs. {game.opponent}</p>
                  <p className="text-sm text-muted-foreground">
                    Last move: {new Date(game.lastMoveAt).toLocaleString()}
                  </p>
                </div>
                <Link href={`/game/${game.id}`}>
                  <Button variant={game.yourTurn ? "default" : "outline"}>
                    {game.yourTurn ? "Your Turn" : "Continue"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
