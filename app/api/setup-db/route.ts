import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

// This is a utility endpoint to set up the database collections and indexes
// It should be secured in production or removed after initial setup
export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Create collections if they don't exist
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    const requiredCollections = ["users", "sessions", "games", "chat_messages"]

    for (const collection of requiredCollections) {
      if (!collectionNames.includes(collection)) {
        await db.createCollection(collection)
        console.log(`Created collection: ${collection}`)
      }
    }

    // Create indexes for users collection
    await db.collection("users").createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { username: 1 }, unique: true },
    ])

    // Create indexes for sessions collection
    await db.collection("sessions").createIndexes([
      { key: { userId: 1 } },
      { key: { expires: 1 }, expireAfterSeconds: 0 }, // TTL index for auto-expiration
    ])

    // Create indexes for games collection
    await db
      .collection("games")
      .createIndexes([
        { key: { roomId: 1 }, unique: true },
        { key: { "players.white.id": 1 } },
        { key: { "players.black.id": 1 } },
        { key: { status: 1 } },
        { key: { createdAt: 1 } },
      ])

    // Create indexes for chat messages
    await db.collection("chat_messages").createIndexes([{ key: { gameId: 1 } }, { key: { timestamp: 1 } }])

    return NextResponse.json({
      status: "success",
      message: "Database setup completed successfully",
      collections: requiredCollections,
    })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Database setup failed",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
