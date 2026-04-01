import bcrypt from "bcrypt"

export const hashPassword = async (password: string) => bcrypt.hash(password, 10)
export const verifyPassword = async (password: string, passwordHash: string) => bcrypt.compare(password, passwordHash)
