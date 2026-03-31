import { type NextRequest, NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { addMonths } from "date-fns"
import { prisma } from "@/lib/db"
import { splitInstallmentAmounts, INSTALLMENT_MAX, INSTALLMENT_MIN_SPLIT } from "@/lib/installment-utils"
import type { PaymentMethod } from "@prisma/client"
import { z } from "zod"

const transactionSchema = z
  .object({
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
    paymentMethod: z.enum(["PIX", "DEBITO", "CREDITO"]).optional(),
    installmentCount: z
      .number()
      .int()
      .min(INSTALLMENT_MIN_SPLIT)
      .max(INSTALLMENT_MAX)
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "GANHO") {
      return
    }

    if (data.paymentMethod && data.paymentMethod !== "CREDITO" && data.installmentCount !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Parcelamento só é permitido para pagamento no crédito",
        path: ["installmentCount"],
      })
    }

    if (data.paymentMethod === "CREDITO" && data.installmentCount !== undefined) {
      if (data.installmentCount < INSTALLMENT_MIN_SPLIT) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Parcelas devem ser pelo menos ${INSTALLMENT_MIN_SPLIT}`,
          path: ["installmentCount"],
        })
      }
    }
  })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validationResult = transactionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "Erro de validação", details: validationResult.error.format() }, { status: 400 })
    }

    const raw = validationResult.data

    const category = await prisma.category.findUnique({
      where: { id: raw.categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    }

    const paymentMethod: PaymentMethod | undefined | null =
      raw.type === "GANHO" ? null : raw.paymentMethod ?? null

    const installmentCount =
      raw.type === "GANHO" || paymentMethod !== "CREDITO" ? undefined : raw.installmentCount

    const isInstallmentGroup =
      raw.type === "GASTO" &&
      paymentMethod === "CREDITO" &&
      installmentCount !== undefined &&
      installmentCount >= INSTALLMENT_MIN_SPLIT

    if (isInstallmentGroup && installmentCount !== undefined) {
      const groupId = randomUUID()
      const parcelAmounts = splitInstallmentAmounts(Number(raw.amount), installmentCount)

      const transactions = await prisma.$transaction(
        parcelAmounts.map((parcelAmount, index) =>
          prisma.transaction.create({
            data: {
              description: raw.description,
              amount: parcelAmount,
              date: addMonths(raw.date, index),
              type: raw.type,
              categoryId: raw.categoryId,
              notes: raw.notes,
              tag: raw.tag,
              paymentMethod: "CREDITO",
              installmentGroupId: groupId,
              installmentIndex: index + 1,
              installmentCount,
            },
            include: { category: true },
          }),
        ),
      )

      return NextResponse.json({ transactions }, { status: 201 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        description: raw.description,
        amount: raw.amount,
        date: raw.date,
        type: raw.type,
        categoryId: raw.categoryId,
        notes: raw.notes,
        tag: raw.tag,
        paymentMethod: paymentMethod ?? undefined,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({ transactions: [transaction] }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Falha ao criar transação" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")

    const whereClause: Record<string, unknown> = {}
    if (month) {
      const [year, monthNum] = month.split("-").map(Number)
      const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0))
      const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999))
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json({
      transactions,
    })
  } catch {
    return NextResponse.json({ error: "Erro ao buscar transação" }, { status: 500 })
  }
}
