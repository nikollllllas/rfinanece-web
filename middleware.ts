import { NextResponse, type NextRequest } from "next/server"
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants"

const publicPaths = ["/login"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApiPath = pathname.startsWith("/api/")
  const isApiAuthPath = pathname.startsWith("/api/auth/")
  const isStaticPath =
    pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.includes(".")
  const isPublicPath = publicPaths.includes(pathname)

  if (isApiPath || isApiAuthPath || isStaticPath) {
    return NextResponse.next()
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    if (isPublicPath) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
