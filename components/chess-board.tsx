"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, RotateCcw, Flag, LogIn, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { connectToGame } from "@/lib/game-socket"

type Piece = {
  type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king"
  color: "white" | "black"
}

type Square = {
  piece: Piece | null
  position: string
}

type GameState = {
  board: Square[][]
  currentTurn: "white" | "black"
  playerColor: "white" | "black"
  status: "waiting" | "playing" | "checkmate" | "stalemate" | "draw"
  winner: "white" | "black" | "draw" | null
  check: boolean
  lastMove: { from: string; to: string } | null
}

export function ChessBoard({ gameId }: { gameId: string }) {
  const router = useRouter()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [possibleMoves, setPossibleMoves] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<"auth" | "server" | "connection" | "unknown" | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Connect to the game
    const connect = async () => {
      try {
        setIsConnecting(true)
        console.log("Attempting to connect to game:", gameId);

        // Check if we're authenticated first
        try {
          const authResponse = await fetch('/api/auth/check', {
            method: 'GET',
            credentials: 'include'
          });
          const authData = await authResponse.json();
          console.log("Authentication check result:", authData);

          if (!authData.authenticated) {
            setError("Not authenticated. Please log in to play.");
            setErrorType("auth");
            setIsConnecting(false);
            return;
          }
        } catch (authErr) {
          console.error("Authentication check failed:", authErr);
        }

        const socket = await connectToGame(gameId)
        console.log("Game socket connected successfully");
        socketRef.current = socket

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log("Received game message:", data.type);

            if (data.type === "gameState") {
              console.log("Game state received:", data.state.status);
              setGameState(data.state)
              setIsConnecting(false)
            } else if (data.type === "error") {
              console.error("Game error received:", data.message);
              setError(data.message)
              setErrorType("server")
            } else if (data.type === "possibleMoves") {
              setPossibleMoves(data.moves)
            }
          } catch (parseError) {
            console.error("Error parsing message:", parseError, event.data);
            setError("Error processing game data. Please try refreshing.");
            setErrorType("unknown");
          }
        }

        socket.onclose = () => {
          console.log("Socket closed")
          if (isConnecting) {
            setError("Connection closed unexpectedly. The server might be down.")
            setErrorType("connection")
            setIsConnecting(false)
          }
        }

        socket.onerror = (error) => {
          console.error("Socket error:", error)
          setError("Connection error. Please try refreshing the page.")
          setErrorType("connection")
          setIsConnecting(false)
        }
      } catch (error: any) {
        console.error("Failed to connect to game:", error)

        // Check error message to determine specific error type
        if (error.message === "Not authenticated") {
          setError("You must be logged in to play. Please sign in to continue.")
          setErrorType("auth")
        } else if (error.message === "Authentication check failed") {
          setError("Failed to verify your login status. Please try logging in again.")
          setErrorType("auth")
        } else {
          setError(`Failed to connect to the game: ${error.message || "Unknown error"}`)
          setErrorType("unknown")
        }

        setIsConnecting(false)
      }
    }

    connect()

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [gameId])

  const handleSquareClick = (position: string) => {
    if (!gameState || gameState.status !== "playing" || gameState.currentTurn !== gameState.playerColor) {
      return
    }

    if (selectedSquare === null) {
      // First click - select a piece
      const [file, rank] = position.split("")
      const fileIndex = file.charCodeAt(0) - 97
      const rankIndex = 8 - Number.parseInt(rank)
      const square = gameState.board[rankIndex][fileIndex]

      if (square.piece && square.piece.color === gameState.playerColor) {
        setSelectedSquare(position)
        // Request possible moves from server
        if (socketRef.current) {
          socketRef.current.send(
            JSON.stringify({
              type: "getPossibleMoves",
              position,
            }),
          )
        }
      }
    } else if (selectedSquare === position) {
      // Clicked the same square again - deselect
      setSelectedSquare(null)
      setPossibleMoves([])
    } else {
      // Second click - attempt to move
      if (possibleMoves.includes(position)) {
        if (socketRef.current) {
          socketRef.current.send(
            JSON.stringify({
              type: "move",
              from: selectedSquare,
              to: position,
            }),
          )
        }
        setSelectedSquare(null)
        setPossibleMoves([])
      } else {
        // Clicked an invalid destination
        setSelectedSquare(null)
        setPossibleMoves([])
      }
    }
  }

  const handleResign = () => {
    if (confirm("Are you sure you want to resign?")) {
      if (socketRef.current) {
        socketRef.current.send(
          JSON.stringify({
            type: "resign",
          }),
        )
      }
    }
  }

  if (isConnecting) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Connecting to game...</p>
          <p className="text-sm text-muted-foreground">Please wait while we establish a connection.</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unable to Connect to Chess Game</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{error}</p>
          <div className="flex gap-3 mt-2">
            {errorType === "auth" && (
              <Button onClick={() => router.push("/login")} size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
            <Button onClick={() => router.refresh()} size="sm" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Connection
            </Button>
            <Button onClick={() => router.push("/dashboard")} size="sm" variant="outline">
              Return to Dashboard
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (!gameState) {
    return (
      <Card className="p-8 flex items-center justify-center chess-gradient shadow-glass">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Game not found</p>
          <p className="text-sm text-muted-foreground mb-4">This game may have ended or doesn't exist.</p>
          <Button onClick={() => router.push("/dashboard")} className="shadow-md hover:shadow-lg transition-all">
            Return to Dashboard
          </Button>
        </div>
      </Card>
    )
  }

  const isPlayerTurn = gameState.currentTurn === gameState.playerColor
  const boardOrientation = gameState.playerColor === "white" ? "normal" : "flipped"

  return (
    <div className="space-y-4">
      {gameState.status !== "waiting" && gameState.status !== "playing" && (
        <Alert variant={gameState.winner === gameState.playerColor ? "default" : "destructive"}>
          <AlertTitle>
            {gameState.winner === gameState.playerColor
              ? "You won!"
              : gameState.winner === "draw"
                ? "Game ended in a draw"
                : "You lost"}
          </AlertTitle>
          <AlertDescription>
            {gameState.status === "checkmate"
              ? "Checkmate! The king is captured."
              : gameState.status === "stalemate"
                ? "Stalemate! No legal moves available."
                : "The game has ended."}
          </AlertDescription>
        </Alert>
      )}

      {gameState.status === "waiting" && (
        <Alert>
          <AlertTitle>Waiting for opponent</AlertTitle>
          <AlertDescription>
            Share this game ID with your friend: <span className="font-bold">{gameId}</span>
          </AlertDescription>
        </Alert>
      )}

      {gameState.status === "playing" && gameState.check && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Check!</AlertTitle>
          <AlertDescription>Your king is in check. Make a move to protect it.</AlertDescription>
        </Alert>
      )}

      <div className="relative rounded-xl overflow-hidden shadow-xl">
        <div className="absolute inset-0 chess-pattern opacity-5"></div>
        <div className="relative">
          <div className={`px-4 py-3 bg-gradient-to-r from-chess-dark/90 to-chess-dark/70 text-white flex justify-between items-center ${boardOrientation === "flipped" ? "" : "rounded-t-xl"}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                {gameState.playerColor === "white" ? "B" : "W"}
              </div>
              <div>
                <div className="font-medium">Opponent</div>
                <div className="text-xs opacity-80">
                  {gameState.currentTurn !== gameState.playerColor ? "Making a move..." : "Waiting for your move"}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {!isPlayerTurn && <div className="animate-pulse h-2 w-2 rounded-full bg-green-400 mr-2"></div>}
            </div>
          </div>

          <div
            className={`grid grid-cols-8 shadow-inner ${boardOrientation === "flipped" ? "rotate-180" : ""}`}
          >
            {gameState.board.map((row, rankIndex) =>
              row.map((square, fileIndex) => {
                const file = String.fromCharCode(97 + fileIndex)
                const rank = 8 - rankIndex
                const position = `${file}${rank}`
                const isLight = (rankIndex + fileIndex) % 2 === 0
                const isSelected = selectedSquare === position
                const isPossibleMove = possibleMoves.includes(position)
                const isLastMoveFrom = gameState.lastMove && gameState.lastMove.from === position
                const isLastMoveTo = gameState.lastMove && gameState.lastMove.to === position

                return (
                  <div
                    key={position}
                    className={`
                      aspect-square flex items-center justify-center relative transition-all duration-200
                      ${isLight ? "bg-chess-light" : "bg-chess-dark"} 
                      ${isSelected ? "ring-2 ring-chess-selected ring-inset" : ""}
                      ${isPossibleMove ? "cursor-pointer hover:bg-chess-possibleMove/20" : ""}
                      ${isLastMoveFrom ? "bg-chess-lastMove/30" : ""}
                      ${isLastMoveTo ? "bg-chess-lastMove/60" : ""}
                      ${boardOrientation === "flipped" ? "rotate-180" : ""}
                      ${square.piece && square.piece.color === gameState.playerColor
                        ? "cursor-pointer hover:bg-chess-selected/10"
                        : "cursor-pointer"}
                    `}
                    onClick={() => handleSquareClick(position)}
                  >
                    {square.piece && (
                      <div className={`w-5/6 h-5/6 flex items-center justify-center`}>
                        {renderPiece(square.piece)}
                      </div>
                    )}

                    {fileIndex === 0 && (
                      <span className={`absolute left-1 top-1 text-xs font-semibold ${isLight ? "text-chess-dark/70" : "text-chess-light/70"}`}>
                        {rank}
                      </span>
                    )}
                    {rankIndex === 7 && (
                      <span className={`absolute right-1 bottom-1 text-xs font-semibold ${isLight ? "text-chess-dark/70" : "text-chess-light/70"}`}>
                        {file}
                      </span>
                    )}

                    {isPossibleMove && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          className={`${square.piece
                              ? "w-full h-full border-2 border-chess-possibleMove/60 rounded-md"
                              : "w-3 h-3 bg-chess-possibleMove/60 rounded-full"
                            }`}
                        ></div>
                      </div>
                    )}
                  </div>
                )
              }),
            )}
          </div>

          <div className={`px-4 py-3 bg-gradient-to-r from-chess-dark/70 to-chess-dark/90 text-white flex justify-between items-center ${boardOrientation === "flipped" ? "rounded-t-xl" : "rounded-b-xl"}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                {gameState.playerColor === "white" ? "W" : "B"}
              </div>
              <div>
                <div className="font-medium">You</div>
                <div className="text-xs opacity-80">Playing as {gameState.playerColor}</div>
              </div>
            </div>
            <div className="flex items-center">
              {isPlayerTurn && <div className="animate-pulse h-2 w-2 rounded-full bg-green-400 mr-2"></div>}
              <div className="text-sm font-medium">{isPlayerTurn ? "Your turn" : "Opponent's turn"}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {gameState.status === "playing" && (
            <Button variant="destructive" size="sm" onClick={handleResign}>
              <Flag className="mr-2 h-4 w-4" />
              Resign
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function renderPiece(piece: Piece) {
  const pieceSymbols: Record<string, React.ReactNode> = {
    "white-pawn": (
      <svg width="45" height="45" viewBox="0 0 45 45">
        <g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 22,9 C 19.79,9 18,10.79 18,13 C 18,13.89 18.29,14.71 18.78,15.38 C 16.83,16.5 15.5,18.59 15.5,21 C 15.5,23.03 16.44,24.84 17.91,26.03 C 14.91,27.09 10.5,31.58 10.5,39.5 L 33.5,39.5 C 33.5,31.58 29.09,27.09 26.09,26.03 C 27.56,24.84 28.5,23.03 28.5,21 C 28.5,18.59 27.17,16.5 25.22,15.38 C 25.71,14.71 26,13.89 26,13 C 26,10.79 24.21,9 22,9 z" />
        </g>
      </svg>
    ),
    "black-pawn": (
      <svg width="45" height="45" viewBox="0 0 45 45">
        <g fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 22,9 C 19.79,9 18,10.79 18,13 C 18,13.89 18.29,14.71 18.78,15.38 C 16.83,16.5 15.5,18.59 15.5,21 C 15.5,23.03 16.44,24.84 17.91,26.03 C 14.91,27.09 10.5,31.58 10.5,39.5 L 33.5,39.5 C 33.5,31.58 29.09,27.09 26.09,26.03 C 27.56,24.84 28.5,23.03 28.5,21 C 28.5,18.59 27.17,16.5 25.22,15.38 C 25.71,14.71 26,13.89 26,13 C 26,10.79 24.21,9 22,9 z" />
        </g>
      </svg>
    ),
    "white-rook": (
      <svg width="45" height="45" viewBox="0 0 45 45">
        <g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
          <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
          <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
          <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
          <path d="M 31,17 L 31,29.5 L 33,32 L 14,32 L 16,29.5 L 16,17" />
          <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" />
        </g>
      </svg>
    ),
    "black-rook": (
      <svg width="45" height="45" viewBox="0 0 45 45">
        <g fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
          <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
          <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
          <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
          <path d="M 31,17 L 31,29.5 L 33,32 L 14,32 L 16,29.5 L 16,17" />
          <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" />
          <path d="M 11,14 L 34,14" fill="none" stroke="#fff" strokeWidth="1" />
        </g>
      </svg>
    ),
    "white-knight": (
      <svg width="45" height="45" viewBox="0 0 45 45">
        <g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
          <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" />
          <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" />
          <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" />
        </g>
      </svg>
    ),
    "black-knight": (
      <svg width="45" height="45" viewBox="0 0 45 45">
        <g fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
          <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" />
          <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" />
          <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" />
          <path d="M 24.55,10.4 L 24.25,11.5 L 24.55,12.5 L 25.4,11.75 L 24.55,10.4 z" fill="#fff" />
          <path d="M 10.5,30 C 10.5,30 9,30 9,30 C 9,27 9,26 9,26 C 9,26 11,26 11,26 L 10.5,30 z" fill="#fff" />
        </g>
      </svg>
    ),
    "white-bishop": (
      <svg width="45" height="45" viewBox="0 0 45 45">
        <g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <g fill="#fff" strokeLinecap="butt">
            <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z" />
            <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
            <path d="M 25 8 A 2.5 2.5 0 1 1  20,8 A 2.5 2.5 0 1 1  25 8 z" />
          </g>
          <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" fill="none" stroke="#000" strokeLinejoin="miter" />
        </g>
      </svg>
    ),
    "black-bishop": (
      <svg width="45" height="45" viewBox="0 0 45 45">
        <g fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <g fill="#000" strokeLinecap="butt">
            <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z" />
            <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
            <path d="M 25 8 A 2.5 2.5 0 1 1  20,8 A 2.5 2.5 0 1 1  25 8 z" />
          </g>
          <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" fill="none" stroke="#fff" strokeLinejoin="miter" />
        </g>
      </svg>
    ),
    "white-queen": (
      <svg width="45" height="45" viewBox="0 0 45 45">
        <g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z" />
          <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" />
          <path d="M 11.5,30 C 15,29 30,29 33.5,30" fill="none" />
          <path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" fill="none" />
          <circle cx="6" cy="12" r="2" />
          <circle cx="14" cy="9" r="2" />
          <circle cx="22.5" cy="8" r="2" />
          <circle cx="31" cy="9" r="2" />
          <circle cx="39" cy="12" r="2" />
        </g>
      </svg>
    ),
    "black-queen": (
      <svg width="45" height="45" viewBox="0 0 45 45">
        <g fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z" />
          <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" />
          <path d="M 11.5,30 C 15,29 30,29 33.5,30" fill="none" stroke="#fff" />
          <path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" fill="none" stroke="#fff" />
          <circle cx="6" cy="12" r="2" />
          <circle cx="14" cy="9" r="2" />
          <circle cx="22.5" cy="8" r="2" />
          <circle cx="31" cy="9" r="2" />
          <circle cx="39" cy="12" r="2" />
        </g>
      </svg>
    ),
    "white-king": (
      <svg width="45" height="45" viewBox="0 0 45 45">
        <g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 22.5,11.63 L 22.5,6" />
          <path d="M 20,8 L 25,8" />
          <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
          <path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37" />
          <path d="M 12.5,30 C 18,27 27,27 32.5,30" />
          <path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5" />
          <path d="M 12.5,37 C 18,34 27,34 32.5,37" />
        </g>
      </svg>
    ),
    "black-king": (
      <svg width="45" height="45" viewBox="0 0 45 45">
        <g fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 22.5,11.63 L 22.5,6" fill="none" stroke="#fff" />
          <path d="M 20,8 L 25,8" fill="none" stroke="#fff" />
          <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
          <path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37" />
          <path d="M 12.5,30 C 18,27 27,27 32.5,30" fill="none" stroke="#fff" />
          <path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5" fill="none" stroke="#fff" />
          <path d="M 12.5,37 C 18,34 27,34 32.5,37" fill="none" stroke="#fff" />
        </g>
      </svg>
    )
  };

  const key = `${piece.color}-${piece.type}`;
  return pieceSymbols[key] || `${key}`;
}
