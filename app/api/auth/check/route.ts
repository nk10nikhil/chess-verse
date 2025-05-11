"use server"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
    try {
        // Use cookies() correctly in an async context
        const cookieStore = await cookies()
        const sessionId = cookieStore.get("session")?.value

        if (!sessionId) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        const { db } = await connectToDatabase()
        const session = await db.collection("sessions").findOne({
            _id: sessionId,
            expires: { $gt: new Date() },
        })

        if (!session) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        return NextResponse.json({ authenticated: true }, { status: 200 })
    } catch (error) {
        console.error("Authentication check error:", error)
        return NextResponse.json(
            { error: "Authentication check failed" },
            { status: 500 }
        )
    }
}