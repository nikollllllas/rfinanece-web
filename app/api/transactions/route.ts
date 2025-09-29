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
  tag: z.enum(["FALTA", "PAGO", "DEVOLVER", "ECONOMIA"]).nullable().optional(),
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
    
    const transaction = await prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.amount,
        date: data.date,
        type: data.type,
        categoryId: data.categoryId,
        notes: data.notes,
        tag: data.tag,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar transação:", error)
    return NextResponse.json({ error: "Falha ao criar transação" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    const whereClause: any = {}
    if (month) {
      // Use UTC dates to avoid timezone issues
      const [year, monthNum] = month.split('-').map(Number)
      const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0))
      const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999))
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const totalCount = await prisma.transaction.count({
      where: whereClause,
    })

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
      skip: offset,
      take: limit,
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar transação:", error)
    return NextResponse.json({ error: "Erro ao buscar transação" }, { status: 500 })
  }
}

