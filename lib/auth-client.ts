"use client"

// Client-side auth functions
export async function signOut() {
  try {
    const response = await fetch("/api/auth/signout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      return true
    }
    return false
  } catch (error) {
    console.error("Sign out error:", error)
    return false
  }
}
