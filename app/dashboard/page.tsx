import type { Metadata } from "next"
import { GameOptions } from "@/components/game-options"
import { ActiveGames } from "@/components/active-games"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your chess dashboard",
}

export default function DashboardPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <GameOptions />
        <ActiveGames />
      </div>
    </div>
  )
}
