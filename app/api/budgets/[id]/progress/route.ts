import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import type { Params } from "@/app/api/_types/types"
import { startOfMonth, endOfMonth } from "date-fns"

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params

    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })

    if (!budget) {
      return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 })
    }

    const [year, month] = budget.budgetMonth.split('-').map(Number)
    const startDate = startOfMonth(new Date(year, month - 1))
    const endDate = endOfMonth(new Date(year, month - 1))

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
    const percentage = Number(budget.amount) > 0 ? (totalSpent / Number(budget.amount)) * 100 : 0
    const isOverBudget = totalSpent > Number(budget.amount)

    return NextResponse.json({
      current: totalSpent,
      max: Number(budget.amount),
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      isOverBudget,
      budgetMonth: budget.budgetMonth,
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

