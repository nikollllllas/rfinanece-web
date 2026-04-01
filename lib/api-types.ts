import type { CategoryType, PaymentMethod, TransactionType } from "@prisma/client"

export interface TransactionData {
  description: string
  amount: number
  date: Date | string
  type: TransactionType
  categoryId: string
  notes?: string
  tag?: "FALTA" | "PAGO" | "DEVOLVER" | "ECONOMIA" | null
  paymentMethod?: PaymentMethod | null
  installmentCount?: number
}

export interface CategoryData {
  name: string
  color: string
  icon?: string
  type?: CategoryType
  isDefault?: boolean
}

export interface BudgetData {
  amount: number
  budgetMonth: string
  categoryId: string
}

export interface ApiErrorLike extends Error {
  status?: number
  details?: unknown
}

export type Transaction = any
export type Category = any
export type Budget = any
export type DashboardData = any

