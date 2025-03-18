import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const budgetUpdateSchema = z.object({
  amount: z
    .number()
    .or(z.string().transform((val) => Number.parseFloat(val)))
    .refine((val) => !isNaN(val), { message: "Valor precisa ser um número" })
    .optional(),
  period: z.enum(["DIÁRIO", "SEMANAL", "MENSAL", "QUARTENAL", "ANUAL", "PERSONALIZADO"]).optional(),
  startDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .optional()
    .nullable(),
  categoryId: z.string().uuid("Categoria inválida").optional(),
})

export async function GET(request: NextRequest, props: { params: { id: string } }) {
  try {
    const id = props.params.id

    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })

    if (!budget) {
      return NextResponse.json({ error: "Carteira não encontrada" }, { status: 404 })
    }

    return NextResponse.json(budget)
  } catch (error) {
    console.error("Erro ao buscar carteira:", error)
    return NextResponse.json({ error: "Falha ao buscar carteira" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, props: { params: { id: string } }) {
  try {
    const id = props.params.id
    const body = await request.json()

    const validationResult = budgetUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "Erro de Validação", details: validationResult.error.format() }, { status: 400 })
    }

    const data = validationResult.data

    const existingBudget = await prisma.budget.findUnique({
      where: { id },
    })

    if (!existingBudget) {
      return NextResponse.json({ error: "Carteira não encontrada" }, { status: 404 })
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      })

      if (!category) {
        return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
      }
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    })

    return NextResponse.json(updatedBudget)
  } catch (error) {
    console.error("Erro ao atualizar carteira:", error)
    return NextResponse.json({ error: "Falha ao atualizar carteira" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, props: { params: { id: string } }) {
  try {
    const id = props.params.id

    const existingBudget = await prisma.budget.findUnique({
      where: { id },
    })

    if (!existingBudget) {
      return NextResponse.json({ error: "Carteira não encontrada" }, { status: 404 })
    }

    await prisma.budget.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Carteira apagada com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro ao deletar carteira:", error)
    return NextResponse.json({ error: "Falha ao apagar carteira" }, { status: 500 })
  }
}

