export type CategoryType = "GANHO" | "GASTO" | "AMBOS"

export type TransactionType = "GANHO" | "GASTO"

export type PaymentMethod = "PIX" | "DEBITO" | "CREDITO"

export type TransactionTag = "FALTA" | "PAGO" | "DEVOLVER" | "ECONOMIA"

export interface TransactionData {
  description: string
  amount: number
  date: Date | string
  type: TransactionType
  categoryId: string
  notes?: string
  tag?: TransactionTag | null
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
