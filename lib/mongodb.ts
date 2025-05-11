import { MongoClient, type Db, ServerApiVersion } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable")
  }

  const options = {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 5, // Maintain at least 5 socket connections
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI, options)
    await client.connect()

    // Verify connection
    await client.db("admin").command({ ping: 1 })
    console.log("Connected successfully to MongoDB Atlas")

    const db = client.db("chess_game")

    // Create indexes for better query performance
    await createIndexes(db)

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw new Error("Failed to connect to database")
  }
}

async function createIndexes(db: Db) {
  try {
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

    console.log("Database indexes created successfully")
  } catch (error) {
    console.error("Error creating indexes:", error)
    // Don't throw here, as we want the connection to succeed even if index creation fails
  }
}
