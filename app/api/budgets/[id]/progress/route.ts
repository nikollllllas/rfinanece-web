import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import type { RouteHandlerContext } from "@/app/api/_types/types"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns"

export async function GET(request: NextRequest, context: RouteHandlerContext) {
  try {
    const id = context.params.id

    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })

    if (!budget) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    }

    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (budget.period) {
      case "DIÁRIO":
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        break
      case "SEMANAL":
        startDate = startOfWeek(now, { weekStartsOn: 0 })
        endDate = endOfWeek(now, { weekStartsOn: 0 })
        break
      case "MENSAL":
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case "QUARTENAL":
        startDate = startOfQuarter(now)
        endDate = endOfQuarter(now)
        break
      case "ANUAL":
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      case "PERSONALIZADO":
        startDate = budget.startDate
        endDate = budget.endDate || now
        break
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        categoryId: budget.categoryId,
        type: "GASTO",
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const totalSpent = transactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0)

    return NextResponse.json({
      current: totalSpent,
      max: Number(budget.amount),
      period: budget.period,
      categoryName: budget.category.name,
      categoryColor: budget.category.color,
      startDate: startDate,
      endDate: endDate,
    })
  } catch (error) {
    console.error("Erro ao buscar progresso de gastos:", error)
    return NextResponse.json({ error: "Falha ao buscar progresso de gastos" }, { status: 500 })
  }
}

