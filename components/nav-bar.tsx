"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"
import { useState } from "react"
import { Menu, X, CastleIcon as ChessKnight, User, Home, LogOut } from "lucide-react"

export function NavBar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <ChessKnight className="h-6 w-6" />
            <span className="font-bold">Chess Game</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end md:justify-between">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className={`transition-colors hover:text-foreground/80 ${isActive("/dashboard") ? "text-foreground" : "text-foreground/60"}`}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              className={`transition-colors hover:text-foreground/80 ${isActive("/dashboard/profile") ? "text-foreground" : "text-foreground/60"}`}
            >
              Profile
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="hidden md:flex" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>

            <Button variant="outline" size="icon" className="md:hidden" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="container py-4 space-y-2">
            <Link href="/dashboard" className="flex items-center py-2" onClick={() => setIsMenuOpen(false)}>
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/dashboard/profile" className="flex items-center py-2" onClick={() => setIsMenuOpen(false)}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
            <Button variant="ghost" className="flex items-center w-full justify-start px-2" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
