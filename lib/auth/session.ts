import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import type { Role } from "@prisma/client"
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants"
import { verifyToken } from "@/lib/auth/jwt"

export type AuthUser = {
  userId: string
  email: string
  role: Role
}

export const getAuthUserFromRequest = (request: NextRequest): AuthUser | null => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    return null
  }

  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

export const requireAuth = (request: NextRequest) => {
  const user = getAuthUserFromRequest(request)
  if (!user) {
    return { error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) }
  }
  return { user }
}

export const requireRole = (user: AuthUser, allowedRoles: Role[]) => {
  if (allowedRoles.includes(user.role)) {
    return null
  }
  return NextResponse.json({ error: "Sem permissão para executar esta ação" }, { status: 403 })
}
