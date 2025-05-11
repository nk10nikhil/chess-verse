import type { ObjectId } from "mongodb"

// User schema
export type User = {
  _id: ObjectId
  username: string
  email: string
  password: string
  createdAt: Date
  updatedAt?: Date
  lastLogin?: Date
  gamesPlayed?: number
  wins?: number
  losses?: number
  draws?: number
}

// Session schema
export type Session = {
  _id: string
  userId: ObjectId
  expires: Date
  createdAt: Date
}

// Chess piece type
export type ChessPiece = {
  type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king"
  color: "white" | "black"
  hasMoved?: boolean
}

// Square on the chess board
export type BoardSquare = {
  piece: ChessPiece | null
  position: string
}

// Move history
export type Move = {
  from: string
  to: string
  piece: ChessPiece
  capturedPiece?: ChessPiece | null
  isCheck?: boolean
  isCheckmate?: boolean
  isPromotion?: boolean
  promotedTo?: ChessPiece["type"]
  timestamp: Date
}

// Game schema
export type Game = {
  _id: ObjectId
  roomId: string
  createdBy: ObjectId
  createdAt: Date
  updatedAt: Date
  lastMoveAt: Date
  status: "waiting" | "playing" | "checkmate" | "stalemate" | "draw" | "resigned"
  players: {
    white: {
      id: ObjectId
      username: string
      joinedAt?: Date
    } | null
    black: {
      id: ObjectId
      username: string
      joinedAt?: Date
    } | null
  }
  board: BoardSquare[][]
  currentTurn: "white" | "black"
  moves: Move[]
  winner?: "white" | "black" | "draw" | null
  check?: boolean
  chat?: {
    id: string
    sender: string
    message: string
    timestamp: Date
  }[]
}

// Chat message schema
export type ChatMessage = {
  id: string
  gameId: string
  userId: ObjectId
  username: string
  message: string
  timestamp: Date
}
