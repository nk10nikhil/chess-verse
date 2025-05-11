"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, RefreshCw } from "lucide-react"
import { getGameInfo } from "@/lib/game"
import { Button } from "@/components/ui/button"

type GameInfo = {
  whitePlayer: string
  blackPlayer: string
  startedAt: string
  moves: number
  timeElapsed: string
}

export function GameInfo({ gameId }: { gameId: string }) {
  const [info, setInfo] = useState<GameInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    async function loadGameInfo() {
      try {
        console.log("GameInfo: Loading game info for game ID:", gameId);
        setError(null)

        // Wait for the game to be ready in the database
        const gameInfo = await getGameInfo(gameId)

        if (gameInfo) {
          console.log("GameInfo: Successfully loaded game info");
          setInfo(gameInfo)
        } else {
          console.warn("GameInfo: Game info not found");
          // If game info is null but we're still waiting for the game to start
          // Don't set an error, just show the loading state with "Waiting for game..."
          if (retryCount < 3) {
            setError("Game information not available yet. Retrying...")
          } else {
            setError("Could not load game information. The game may not exist.")
          }
        }
      } catch (error) {
        console.error("GameInfo: Failed to load game info:", error)
        setError("Failed to load game information")
      } finally {
        setIsLoading(false)
      }
    }

    loadGameInfo()
    const interval = setInterval(loadGameInfo, 10000)
    return () => clearInterval(interval)
  }, [gameId, retryCount])

  const handleRetry = () => {
    setIsLoading(true)
    setRetryCount(prev => prev + 1)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-sm text-muted-foreground">Loading game information...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">{error}</p>
          <Button size="sm" variant="outline" onClick={handleRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!info) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">Waiting for game to initialize...</p>
          <Button size="sm" variant="outline" onClick={handleRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white text-black">
                White
              </Badge>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="text-sm">{info.whitePlayer || "Waiting..."}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-black text-white">
                Black
              </Badge>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="text-sm">{info.blackPlayer || "Waiting..."}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-3 mt-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Started:</span>
              </div>
              <div className="text-right">
                {info.startedAt ? new Date(info.startedAt).toLocaleString() : "Not started"}
              </div>

              <div>Moves:</div>
              <div className="text-right">{info.moves}</div>

              <div>Time elapsed:</div>
              <div className="text-right">{info.timeElapsed}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
