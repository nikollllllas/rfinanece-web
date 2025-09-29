import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const months = await prisma.$queryRaw<Array<{ month: string }>>`
      SELECT DISTINCT TO_CHAR(date, 'YYYY-MM') as month
      FROM transactions
      ORDER BY month DESC
    `

    return NextResponse.json(months.map(m => m.month))
  } catch (error) {
    console.error("Erro ao buscar meses disponíveis:", error)
    return NextResponse.json({ error: "Erro ao buscar meses disponíveis" }, { status: 500 })
  }
}
