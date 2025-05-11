import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicPath = path === "/" || path === "/login" || path === "/register"

  const token = request.cookies.get("session")?.value || ""

  // Redirect to login if accessing protected route without session
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to dashboard if accessing login/register with session
  if (isPublicPath && token && path !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*", "/game/:path*"],
}
