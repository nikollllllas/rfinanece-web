import { parseAdminUser } from "@/lib/users/admin-user"

export const parseCurrentUser = (payload: unknown) => {
  if (typeof payload !== "object" || payload === null) {
    return null
  }

  const withUser = payload as { user?: unknown }
  return parseAdminUser(withUser.user)
}
