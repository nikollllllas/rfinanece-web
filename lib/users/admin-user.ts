export type UserRole = "ADMIN" | "USER"

export type AdminUser = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

type ListEnvelope = {
  items?: unknown
  data?: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isUserRole = (value: unknown): value is UserRole => value === "ADMIN" || value === "USER"

const parseString = (value: unknown) => (typeof value === "string" ? value : "")

export const parseAdminUser = (value: unknown): AdminUser | null => {
  if (!isRecord(value)) {
    return null
  }

  if (!isUserRole(value.role)) {
    return null
  }

  const id = parseString(value.id)
  const name = parseString(value.name)
  const email = parseString(value.email)
  const createdAt = parseString(value.createdAt)
  const updatedAt = parseString(value.updatedAt)

  if (!id || !name || !email) {
    return null
  }

  return {
    id,
    name,
    email,
    role: value.role,
    createdAt,
    updatedAt,
  }
}

export const parseAdminUsersList = (value: unknown): AdminUser[] => {
  if (!Array.isArray(value)) {
    if (typeof value === "object" && value !== null) {
      const envelope = value as ListEnvelope
      const candidateList = envelope.items ?? envelope.data
      if (Array.isArray(candidateList)) {
        return candidateList.map(parseAdminUser).filter((user): user is AdminUser => user !== null)
      }
    }
    return []
  }

  return value.map(parseAdminUser).filter((user): user is AdminUser => user !== null)
}
