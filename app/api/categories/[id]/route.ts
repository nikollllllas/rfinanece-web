import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Define validation schema for category updates
const categoryUpdateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  color: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, "Formato de cor inválido")
    .optional(),
  icon: z.string().optional().nullable(),
  type: z.enum(["GANHO", "GASTO", "AMBOS"]).optional(),
  isDefault: z.boolean().optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Erro ao buscar categoria:", error)
    return NextResponse.json({ error: "Falha ao buscar categoria" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Validate request data
    const validationResult = categoryUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "Erro de validação", details: validationResult.error.format() }, { status: 400 })
    }

    const data = validationResult.data

    // Check if the category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    }

    // If it's a default category, prevent changing name and type
    if (existingCategory.isDefault) {
      delete data.name
      delete data.type
      delete data.isDefault
    }

    // If name is being updated, check for uniqueness
    if (data.name && data.name !== existingCategory.name) {
      const categoryWithSameName = await prisma.category.findUnique({
        where: { name: data.name },
      })

      if (categoryWithSameName) {
        return NextResponse.json({ error: "Uma categoria com este nome já existe" }, { status: 409 })
      }
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data,
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error)
    return NextResponse.json({ error: "Falha ao atualizar categoria" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if the category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    }

    // Check if this is a default category
    if (existingCategory.isDefault) {
      return NextResponse.json({ error: "Não é possível excluir uma categoria padrão" }, { status: 403 })
    }

    // Check if there are transactions using this category
    const transactionsCount = await prisma.transaction.count({
      where: { categoryId: id },
    })

    if (transactionsCount > 0) {
      return NextResponse.json(
        {
          error: "Não é possível excluir uma categoria que possui transações. Reatribua ou exclua as transações primeiro.",
        },
        { status: 409 },
      )
    }

    // Check if there are budgets using this category
    const budgetsCount = await prisma.budget.count({
      where: { categoryId: id },
    })

    if (budgetsCount > 0) {
      return NextResponse.json(
        {
          error: "Não é possível excluir uma categoria que possui orçamentos. Reatribua ou exclua os orçamentos primeiro.",
        },
        { status: 409 },
      )
    }

    // Delete the category
    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Categoria excluída com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro ao excluir categoria:", error)
    return NextResponse.json({ error: "Falha ao excluir categoria" }, { status: 500 })
  }
}

