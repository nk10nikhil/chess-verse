import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST() {
  try {
    // Get cookie store with await
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session")?.value

    if (sessionId) {
      const { db } = await connectToDatabase()
      await db.collection("sessions").deleteOne({ _id: sessionId })
    }

    // Delete the cookie using the awaited cookie store
    (await cookies()).delete("session")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API sign out error:", error)
    return NextResponse.json({ success: false, error: "Failed to sign out" }, { status: 500 })
  }
}
