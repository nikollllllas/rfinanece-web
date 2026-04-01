const { PrismaClient, Role } = require("@prisma/client")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

async function upsertUser({ name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 10)

  return prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role },
    create: { name, email, passwordHash, role },
  })
}

async function main() {
  await upsertUser({
    name: "Administrador",
    email: "admin@rfinance.local",
    password: "Admin@123",
    role: Role.ADMIN,
  })

  await upsertUser({
    name: "Usuário Padrão",
    email: "user@rfinance.local",
    password: "User@123",
    role: Role.USER,
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error("Seed failed:", error)
    await prisma.$disconnect()
    process.exit(1)
  })
