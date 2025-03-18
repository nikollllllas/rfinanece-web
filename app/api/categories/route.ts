import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  color: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, "Formato de cor inválido")
    .default("#000000"),
  icon: z.string().optional(),
  type: z.enum(["GANHO", "GASTO", "AMBOS"]).optional(),
  isDefault: z.boolean().default(false),
})

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate request data
    const validationResult = categorySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: "Erro de validação", details: validationResult.error.format() }, { status: 400 })
    }

    const data = validationResult.data

    // Check if a category with this name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name },
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Uma categoria com este nome já existe" }, { status: 409 })
    }

    // Create the category
    const category = await prisma.category.create({
      data,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar categoria:", error)
    return NextResponse.json({ error: "Falha ao criar categoria" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return NextResponse.json({ error: "Falha ao buscar categorias" }, { status: 500 })
  }
}

