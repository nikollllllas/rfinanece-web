import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const transactionSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z
    .number()
    .or(z.string().transform((val) => Number.parseFloat(val)))
    .refine((val) => !isNaN(val), { message: "Valor precisa ser umnúmero válido" }),
  date: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  type: z.enum(["GANHO", "GASTO"]),
  categoryId: z.string().uuid("Categoria inválida"),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validationResult = transactionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "Erro de validação", details: validationResult.error.format() }, { status: 400 })
    }

    const data = validationResult.data

    // Check if the category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        date: data.date,
        type: data.type,
        categoryId: data.categoryId,
        notes: data.notes,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar transação:", error)
    return NextResponse.json({ error: "Falha ao criar transação" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Erro ao buscar transação:", error)
    return NextResponse.json({ error: "Erro ao buscar transação" }, { status: 500 })
  }
}

