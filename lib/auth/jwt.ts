import jwt from "jsonwebtoken"
import type { Role } from "@prisma/client"
import { JWT_EXPIRATION } from "@/lib/auth/constants"

type JwtPayload = {
  userId: string
  email: string
  role: Role
}

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not configured")
  }
  return secret
}

export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRATION,
  })

export const verifyToken = (token: string) => jwt.verify(token, getJwtSecret()) as JwtPayload
