import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    // Test database connection
    const { db } = await connectToDatabase()
    const result = await db.command({ ping: 1 })

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        message: "Chess game API is running",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message: "Database connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
