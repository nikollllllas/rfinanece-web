import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { RouteHandlerContext } from "../../_types/types"

const transactionUpdateSchema = z.object({
  description: z.string().min(1, "Insira uma descrição").optional(),
  amount: z
    .number()
    .or(z.string().transform((val) => Number.parseFloat(val)))
    .refine((val) => !isNaN(val), { message: "Valor precisa ser um número" })
    .optional(),
  date: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
  type: z.enum(["GANHO", "GASTO"]).optional(),
  categoryId: z.string().uuid("Categoria inválida").optional(),
  notes: z.string().optional().nullable(),
})

export async function GET(request: NextRequest,context: RouteHandlerContext) {
  try {
    const id = context.params.id

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Erro ao buscar dados:", error)
    return NextResponse.json({ error: "Erro ao buscar transação" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest,context: RouteHandlerContext) {
  try {
    const id = context.params.id
    const body = await request.json()

    const validationResult = transactionUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "Erro de validação", details: validationResult.error.format() }, { status: 400 })
    }

    const data = validationResult.data

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      })

      if (!category) {
        return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
      }
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error("Erro ao atualizar transação:", error)
    return NextResponse.json({ error: "Falha ao atualizar transação" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest,context: RouteHandlerContext) {
  try {
    const id = context.params.id

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }

    await prisma.transaction.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Transação apagada com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro ao apagar transação:", error)
    return NextResponse.json({ error: "Falha ao apagar transação" }, { status: 500 })
  }
}

