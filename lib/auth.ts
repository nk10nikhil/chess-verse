"use server"

import { cookies } from "next/headers"
import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"
import { hash, compare } from "bcrypt"
import { z } from "zod"

// Validation schemas
const emailSchema = z.string().email("Invalid email format")
const passwordSchema = z.string().min(8, "Password must be at least 8 characters")
const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")

type User = {
  _id: ObjectId
  username: string
  email: string
  password: string
  createdAt: Date
}

export async function signIn({ email, password }: { email: string; password: string }) {
  try {
    // Validate input
    const validatedEmail = emailSchema.parse(email)

    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ email: validatedEmail })

    if (!user) {
      return false
    }

    const passwordMatch = await compare(password, user.password)
    if (!passwordMatch) {
      return false
    }

    // Create a session
    const sessionId = new ObjectId().toString()
    const expires = new Date()
    expires.setDate(expires.getDate() + 7) // 7 days from now

    await db.collection("sessions").insertOne({
      _id: sessionId,
      userId: user._id,
      expires,
      createdAt: new Date(),
    })

    try {
      // Update last login time with explicit error handling
      await db.collection("users").updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date() } }
      )
    } catch (updateError) {
      console.error("Error updating last login time:", updateError)
      // Continue the sign-in process even if this fails
    }

    // Set the session cookie with awaited cookies function
    (await cookies()).set("session", sessionId, {
      httpOnly: true,
      expires,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return true
  } catch (error) {
    console.error("Sign in error:", error)
    return false
  }
}

export async function register({
  username,
  email,
  password,
}: {
  username: string
  email: string
  password: string
}) {
  try {
    // Validate input
    const validatedUsername = usernameSchema.parse(username)
    const validatedEmail = emailSchema.parse(email)
    const validatedPassword = passwordSchema.parse(password)

    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ email: validatedEmail }, { username: validatedUsername }],
    })

    if (existingUser) {
      return false
    }

    // Hash the password
    const hashedPassword = await hash(validatedPassword, 10)

    // Create the user
    const result = await db.collection("users").insertOne({
      username: validatedUsername,
      email: validatedEmail,
      password: hashedPassword,
      createdAt: new Date(),
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    })

    if (!result.insertedId) {
      return false
    }

    // Create a session
    const sessionId = new ObjectId().toString()
    const expires = new Date()
    expires.setDate(expires.getDate() + 7) // 7 days from now

    await db.collection("sessions").insertOne({
      _id: sessionId,
      userId: result.insertedId,
      expires,
      createdAt: new Date(),
    })

      // Set the session cookie with awaited cookies function
      (await cookies()).set("session", sessionId, {
        httpOnly: true,
        expires,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })

    return true
  } catch (error) {
    console.error("Registration error:", error)
    return false
  }
}

export async function signOut() {
  try {
    // Get cookies correctly using await
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session")?.value

    if (sessionId) {
      const { db } = await connectToDatabase()
      await db.collection("sessions").deleteOne({ _id: sessionId })
    }

    // Delete cookie with awaited cookies function
    (await cookies()).delete("session")

    return true
  } catch (error) {
    console.error("Sign out error:", error)
    return false
  }
}

export async function getCurrentUser() {
  try {
    // Get cookies correctly using await
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session")?.value

    if (!sessionId) {
      return null
    }

    const { db } = await connectToDatabase()
    const session = await db.collection("sessions").findOne({
      _id: sessionId,
      expires: { $gt: new Date() },
    })

    if (!session) {
      // We should NOT modify cookies here - this is not in a Server Action or Route Handler
      // Instead, return a flag indicating the cookie should be cleared
      return { invalidSession: true }
    }

    const user = await db.collection("users").findOne({ _id: session.userId }, { projection: { password: 0 } })

    if (!user) {
      // Same here - don't modify cookies
      return { invalidSession: true }
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      stats: {
        gamesPlayed: user.gamesPlayed || 0,
        wins: user.wins || 0,
        losses: user.losses || 0,
        draws: user.draws || 0,
      },
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}
