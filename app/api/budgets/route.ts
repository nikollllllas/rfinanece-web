import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const budgetSchema = z.object({
  amount: z
    .number()
    .or(z.string().transform((val) => Number.parseFloat(val)))
    .refine((val) => !isNaN(val), { message: "Amount must be a valid number" }),
    period: z.enum(["DIÁRIO", "SEMANAL", "MENSAL", "QUARTENAL", "ANUAL", "PERSONALIZADO"]),
  startDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  endDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .optional()
    .nullable(),
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
        period: data.period,
        startDate: data.startDate,
      },
    })

    if (existingBudget) {
      return NextResponse.json({ error: "Uma carteira para esse período e categoria" }, { status: 409 })
    }

    // Create the budget
    const budget = await prisma.budget.create({
      data: {
        amount: data.amount,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        categoryId: data.categoryId,
      },
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar carteira:", error)
    return NextResponse.json({ error: "Falha ao criar carteira" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        category: true,
      },
      orderBy: {
        startDate: "desc",
      },
    })

    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Erro ao buscar carteiras:", error)
    return NextResponse.json({ error: "Erro ao falhar carteiras" }, { status: 500 })
  }
}

