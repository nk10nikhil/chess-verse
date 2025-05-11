import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">Username</div>
                <div>{user.username}</div>

                <div className="font-medium">Email</div>
                <div>{user.email}</div>
              </div>

              <div className="pt-4">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/profile/edit">Edit Profile</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Game Statistics</CardTitle>
            <CardDescription>Your chess performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">Games Played</div>
                <div>{user.stats?.gamesPlayed || 0}</div>

                <div className="font-medium">Wins</div>
                <div>{user.stats?.wins || 0}</div>

                <div className="font-medium">Losses</div>
                <div>{user.stats?.losses || 0}</div>

                <div className="font-medium">Draws</div>
                <div>{user.stats?.draws || 0}</div>

                <div className="font-medium">Win Rate</div>
                <div>
                  {user.stats?.gamesPlayed ? `${Math.round((user.stats.wins / user.stats.gamesPlayed) * 100)}%` : "0%"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
