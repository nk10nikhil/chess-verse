import type React from "react"
import { NavBar } from "@/components/nav-bar"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // Handle invalid session case
  if (user && 'invalidSession' in user) {
    // We need to clear the invalid session cookie
    // Create a route handler action to handle cookie clearing
    await handleInvalidSession()
    redirect("/login")
  }

  if (!user) {
    redirect("/login")
  }

  return (
    <>
      <NavBar />
      {children}
    </>
  )
}

// This is a server action that's allowed to modify cookies
async function handleInvalidSession() {
  "use server"

  // Clear the session cookie
  cookies().delete("session")
}
