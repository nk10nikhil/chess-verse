import type { Metadata } from "next"
import { ChessBoard } from "@/components/chess-board"
import { GameInfo } from "@/components/game-info"
import { GameChat } from "@/components/game-chat"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Chess Game",
  description: "Play chess in real-time",
}

type Props = {
  params: { id: string }
}

export default async function GamePage({ params }: Props) {
  // Correctly handle dynamic params in Next.js 14
  const { id } = await Promise.resolve(params)

  return (
    <div className="container py-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <ChessBoard gameId={id} />
        </div>
        <div className="space-y-6">
          <GameInfo gameId={id} />
          <GameChat gameId={id} />
        </div>
      </div>
    </div>
  )
}
