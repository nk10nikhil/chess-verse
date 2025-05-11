"use server"
import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"
import { getCurrentUser } from "./auth"
import { nanoid } from "nanoid"

export async function createGame() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("You must be logged in to create a game")
    }

    const { db } = await connectToDatabase()

    // Generate a unique room ID
    const roomId = nanoid(10)

    // Create a new game
    const result = await db.collection("games").insertOne({
      roomId,
      createdBy: new ObjectId(user.id),
      createdAt: new Date(),
      status: "waiting",
      players: {
        white: {
          id: new ObjectId(user.id),
          username: user.username,
        },
        black: null,
      },
      board: initializeChessBoard(),
      currentTurn: "white",
      moves: [],
      lastMoveAt: new Date(),
    })

    if (!result.insertedId) {
      throw new Error("Failed to create game")
    }

    return roomId
  } catch (error) {
    console.error("Create game error:", error)
    throw error
  }
}

export async function joinGame(roomId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("You must be logged in to join a game")
    }

    const { db } = await connectToDatabase()

    // Find the game
    const game = await db.collection("games").findOne({ roomId })

    if (!game) {
      return false
    }

    // Check if the game is already full
    if (game.players.white && game.players.black) {
      return false
    }

    // Check if the user is already in the game
    if (
      (game.players.white && game.players.white.id.toString() === user.id) ||
      (game.players.black && game.players.black.id.toString() === user.id)
    ) {
      return true
    }

    // Join as the available color
    const color = game.players.white ? "black" : "white"

    // Update the game
    const result = await db.collection("games").updateOne(
      { roomId },
      {
        $set: {
          [`players.${color}`]: {
            id: new ObjectId(user.id),
            username: user.username,
          },
          status: game.players.white ? "playing" : "waiting",
        },
      },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error("Join game error:", error)
    throw error
  }
}

export async function findRandomGame() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("You must be logged in to find a game")
    }

    const { db } = await connectToDatabase()

    // Find a game that's waiting for a player
    const game = await db.collection("games").findOne({
      status: "waiting",
      "players.white.id": { $ne: new ObjectId(user.id) },
      "players.black": null,
    })

    if (game) {
      // Join this game
      await joinGame(game.roomId)
      return game.roomId
    }

    // No game found, create a new one
    return await createGame()
  } catch (error) {
    console.error("Find random game error:", error)
    throw error
  }
}

export async function getActiveGames() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return []
    }

    const { db } = await connectToDatabase()

    // Find games where the user is a player and the game is active
    const games = await db
      .collection("games")
      .find({
        $or: [{ "players.white.id": new ObjectId(user.id) }, { "players.black.id": new ObjectId(user.id) }],
        status: { $in: ["waiting", "playing"] },
      })
      .sort({ lastMoveAt: -1 })
      .toArray()

    return games.map((game) => {
      const isWhite = game.players.white?.id.toString() === user.id
      const opponent = isWhite
        ? game.players.black?.username || "Waiting for opponent"
        : game.players.white?.username || "Waiting for opponent"

      return {
        id: game.roomId,
        opponent,
        lastMoveAt: game.lastMoveAt.toISOString(),
        yourTurn: game.currentTurn === (isWhite ? "white" : "black"),
      }
    })
  } catch (error) {
    console.error("Get active games error:", error)
    return []
  }
}

export async function getGameInfo(gameId: string) {
  try {
    const { db } = await connectToDatabase()

    // Find the game
    const game = await db.collection("games").findOne({ roomId: gameId })

    if (!game) {
      return null
    }

    // Calculate time elapsed
    const startTime = game.players.black ? game.players.black.joinedAt || game.createdAt : null
    let timeElapsed = "Not started"

    if (startTime) {
      const elapsedMs = Date.now() - startTime.getTime()
      const minutes = Math.floor(elapsedMs / 60000)
      const seconds = Math.floor((elapsedMs % 60000) / 1000)
      timeElapsed = `${minutes}m ${seconds}s`
    }

    return {
      whitePlayer: game.players.white?.username || "Waiting...",
      blackPlayer: game.players.black?.username || "Waiting...",
      startedAt: startTime ? startTime.toISOString() : null,
      moves: game.moves.length,
      timeElapsed,
    }
  } catch (error) {
    console.error("Get game info error:", error)
    return null
  }
}

function initializeChessBoard() {
  // Create an 8x8 chess board with pieces in their starting positions
  const board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // Initialize the board with pieces
  // This is a simplified representation - in a real app, you'd have more detailed piece objects

  // Set up pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { piece: { type: "pawn", color: "black" }, position: `${String.fromCharCode(97 + i)}7` }
    board[6][i] = { piece: { type: "pawn", color: "white" }, position: `${String.fromCharCode(97 + i)}2` }
  }

  // Set up rooks
  board[0][0] = { piece: { type: "rook", color: "black" }, position: "a8" }
  board[0][7] = { piece: { type: "rook", color: "black" }, position: "h8" }
  board[7][0] = { piece: { type: "rook", color: "white" }, position: "a1" }
  board[7][7] = { piece: { type: "rook", color: "white" }, position: "h1" }

  // Set up knights
  board[0][1] = { piece: { type: "knight", color: "black" }, position: "b8" }
  board[0][6] = { piece: { type: "knight", color: "black" }, position: "g8" }
  board[7][1] = { piece: { type: "knight", color: "white" }, position: "b1" }
  board[7][6] = { piece: { type: "knight", color: "white" }, position: "g1" }

  // Set up bishops
  board[0][2] = { piece: { type: "bishop", color: "black" }, position: "c8" }
  board[0][5] = { piece: { type: "bishop", color: "black" }, position: "f8" }
  board[7][2] = { piece: { type: "bishop", color: "white" }, position: "c1" }
  board[7][5] = { piece: { type: "bishop", color: "white" }, position: "f1" }

  // Set up queens
  board[0][3] = { piece: { type: "queen", color: "black" }, position: "d8" }
  board[7][3] = { piece: { type: "queen", color: "white" }, position: "d1" }

  // Set up kings
  board[0][4] = { piece: { type: "king", color: "black" }, position: "e8" }
  board[7][4] = { piece: { type: "king", color: "white" }, position: "e1" }

  // Fill empty squares
  for (let i = 2; i < 6; i++) {
    for (let j = 0; j < 8; j++) {
      const file = String.fromCharCode(97 + j)
      const rank = 8 - i
      board[i][j] = { piece: null, position: `${file}${rank}` }
    }
  }

  return board
}
