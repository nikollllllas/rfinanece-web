import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const budgetSchema = z.object({
  amount: z
    .number()
    .or(z.string().transform((val) => Number.parseFloat(val)))
    .refine((val) => !isNaN(val), { message: "Amount must be a valid number" }),
  budgetMonth: z.string().regex(/^\d{4}-\d{2}$/, "Formato de mês inválido (YYYY-MM)"),
  categoryId: z.string().uuid("Categoria inválida"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validationResult = budgetSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "Erro de validação", details: validationResult.error.format() }, { status: 400 })
    }

    const data = validationResult.data

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    }

    const existingBudget = await prisma.budget.findFirst({
      where: {
        categoryId: data.categoryId,
        budgetMonth: data.budgetMonth,
      },
    })

    if (existingBudget) {
      return NextResponse.json({ error: "Já existe um orçamento para essa categoria neste mês" }, { status: 409 })
    }

    // Create the budget
    const budget = await prisma.budget.create({
      data: {
        amount: data.amount,
        budgetMonth: data.budgetMonth,
        categoryId: data.categoryId,
      },
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar carteira:", error)
    return NextResponse.json({ error: "Falha ao criar carteira" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")

    const whereClause: any = {}
    if (month) {
      whereClause.budgetMonth = month
    }

    const budgets = await prisma.budget.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        budgetMonth: "desc",
      },
    })

    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Erro ao buscar carteiras:", error)
    return NextResponse.json({ error: "Erro ao falhar carteiras" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, targetMonth } = body

    if (action === "replicate") {
      if (!targetMonth) {
        return NextResponse.json({ error: "Mês de destino é obrigatório" }, { status: 400 })
      }

      if (!targetMonth.match(/^\d{4}-\d{2}$/)) {
        return NextResponse.json({ error: "Formato de mês inválido (YYYY-MM)" }, { status: 400 })
      }

      const [year, month] = targetMonth.split('-').map(Number)
      const prevDate = new Date(year, month - 2)
      const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`

      const previousBudgets = await prisma.budget.findMany({
        where: {
          budgetMonth: prevMonth,
        },
        include: {
          category: true,
        },
      })

      if (previousBudgets.length === 0) {
        return NextResponse.json({ error: `Nenhum orçamento encontrado para ${prevMonth}` }, { status: 404 })
      }

      const existingBudgets = await prisma.budget.findMany({
        where: {
          budgetMonth: targetMonth,
        },
      })

      if (existingBudgets.length > 0) {
        return NextResponse.json({ error: `Já existem orçamentos para ${targetMonth}` }, { status: 409 })
      }

      const newBudgets = await Promise.all(
        previousBudgets.map(async (budget) => {
          return prisma.budget.create({
            data: {
              amount: budget.amount,
              budgetMonth: targetMonth,
              categoryId: budget.categoryId,
            },
            include: {
              category: true,
            },
          })
        })
      )

      return NextResponse.json({
        message: `${newBudgets.length} orçamentos replicados com sucesso`,
        budgets: newBudgets,
      })
    }

    return NextResponse.json({ error: "Ação não reconhecida" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao replicar orçamentos:", error)
    return NextResponse.json({ error: "Falha ao replicar orçamentos" }, { status: 500 })
  }
}

