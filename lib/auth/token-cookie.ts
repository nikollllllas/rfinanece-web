"use client"

import {
  AUTH_COOKIE_MAX_AGE_SEC,
  AUTH_COOKIE_NAME,
} from "@/lib/auth/constants"

export const getAuthTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") {
    return null
  }
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]*)`),
  )
  const raw = match?.[1]
  if (!raw || raw.length === 0) {
    return null
  }
  try {
    return decodeURIComponent(raw)
  } catch {
    return null
  }
}

export const setAuthTokenCookie = (token: string): void => {
  if (typeof document === "undefined") {
    return
  }
  const secure = process.env.NODE_ENV === "production"
  const value = encodeURIComponent(token)
  const flags = [
    `${AUTH_COOKIE_NAME}=${value}`,
    "path=/",
    `max-age=${AUTH_COOKIE_MAX_AGE_SEC}`,
    "SameSite=Lax",
  ]
  if (secure) {
    flags.push("Secure")
  }
  document.cookie = flags.join("; ")
}

export const clearAuthTokenCookie = (): void => {
  if (typeof document === "undefined") {
    return
  }
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`
}
