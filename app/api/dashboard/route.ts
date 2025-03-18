import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export async function GET() {
  try {
    const today = new Date()
    const currentMonthStart = startOfMonth(today)
    const currentMonthEnd = endOfMonth(today)
    const previousMonthStart = startOfMonth(subMonths(today, 1))
    const previousMonthEnd = endOfMonth(subMonths(today, 1))

    const currentMonthTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      include: {
        category: true,
      },
    })

    const previousMonthTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
    })

    // Calculate totals for current month
    const currentMonthIncome = currentMonthTransactions
      .filter((t) => t.type === "GANHO")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const currentMonthExpenses = currentMonthTransactions
      .filter((t) => t.type === "GASTO")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const currentMonthSavings = currentMonthIncome - currentMonthExpenses

    // Calculate totals for previous month
    const previousMonthIncome = previousMonthTransactions
      .filter((t) => t.type === "GANHO")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const previousMonthExpenses = previousMonthTransactions
      .filter((t) => t.type === "GASTO")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const previousMonthSavings = previousMonthIncome - previousMonthExpenses

    const incomeChange =
      previousMonthIncome === 0 ? 100 : ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100

    const expensesChange =
      previousMonthExpenses === 0 ? 0 : ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100

    const savingsChange =
      previousMonthSavings === 0
        ? 100
        : ((currentMonthSavings - previousMonthSavings) / Math.abs(previousMonthSavings)) * 100

    const expensesByCategory = currentMonthTransactions
      .filter((t) => t.type === "GASTO")
      .reduce(
        (acc, t) => {
          const categoryName = t.category.name
          if (!acc[categoryName]) {
            acc[categoryName] = {
              name: categoryName,
              value: 0,
              color: t.category.color,
            }
          }
          acc[categoryName].value += Number(t.amount)
          return acc
        },
        {} as Record<string, { name: string; value: number; color: string }>,
      )

    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: {
        date: "desc",
      },
      include: {
        category: true,
      },
    })

    const budgets = await prisma.budget.findMany({
      where: {
        period: "MENSAL",
        startDate: {
          lte: today,
        },
        OR: [
          {
            endDate: {
              gte: today,
            },
          },
          {
            endDate: null,
          },
        ],
      },
      include: {
        category: true,
      },
    })

    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const categoryExpenses = await prisma.transaction.aggregate({
          where: {
            categoryId: budget.categoryId,
            type: "GASTO",
            date: {
              gte: currentMonthStart,
              lte: currentMonthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        })

        const current = Number(categoryExpenses._sum.amount || 0)
        const max = Number(budget.amount)

        return {
          id: budget.id,
          category: budget.category.name,
          current,
          max,
          color: budget.category.color,
        }
      }),
    )

    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)

      const monthTransactions = await prisma.transaction.findMany({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      })

      const monthIncome = monthTransactions
        .filter((t) => t.type === "GANHO")
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const monthExpenses = monthTransactions
        .filter((t) => t.type === "GASTO")
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const monthSavings = monthIncome - monthExpenses

      monthlyData.push({
        month: format(monthDate, "MMM"),
        income: monthIncome,
        expenses: monthExpenses,
        savings: monthSavings,
      })
    }

    return NextResponse.json({
      summary: {
        income: {
          amount: currentMonthIncome,
          change: incomeChange,
        },
        expenses: {
          amount: currentMonthExpenses,
          change: expensesChange,
        },
        savings: {
          amount: currentMonthSavings,
          change: savingsChange,
        },
        balance: currentMonthIncome - currentMonthExpenses,
      },
      expensesByCategory: Object.values(expensesByCategory),
      recentTransactions,
      budgets: budgetsWithProgress,
      monthlyData,
    })
  } catch (error) {
    console.error("Erro ao buscar dados da dashboard:", error)
    return NextResponse.json({ error: "Falha ao buscar dados da dashboard" }, { status: 500 })
  }
}

