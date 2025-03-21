import type { TransactionType, CategoryType, BudgetPeriod } from "@prisma/client"

export interface TransactionData {
  description: string
  amount: number
  date: Date | string
  type: TransactionType
  categoryId: string
  notes?: string
  tag?: "FALTA" | "PAGO" | "DEVOLVER" | "ECONOMIA" | null
}

export interface Transaction extends TransactionData {
  id: string
  createdAt: string
  updatedAt: string
  category?: Category
}

export interface CategoryData {
  name: string
  color: string
  icon?: string
  type?: CategoryType
  isDefault?: boolean
}

export interface Category extends CategoryData {
  id: string
  createdAt: string
  updatedAt: string
}

// Budget Types
export interface BudgetData {
  amount: number
  period: BudgetPeriod
  startDate: Date | string
  endDate?: Date | string | null
  categoryId: string
}

export interface Budget extends BudgetData {
  id: string
  createdAt: string
  updatedAt: string
  category?: Category
}

export interface DashboardSummary {
  income: { amount: number; change: number }
  expenses: { amount: number; change: number }
  savings: { amount: number; change: number }
  balance: number
}

export interface CategoryExpense {
  name: string
  value: number
  color: string
}

export interface BudgetProgress {
  id: string
  category: string
  current: number
  max: number
  color: string
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
  savings: number
}

export interface DashboardData {
  summary: DashboardSummary
  expensesByCategory: CategoryExpense[]
  recentTransactions: Transaction[]
  budgets: BudgetProgress[]
  monthlyData: MonthlyData[]
}

export class ApiError extends Error {
  status: number
  details?: any

  constructor(message: string, status: number, details?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(errorData.error || `API error: ${response.status}`, response.status, errorData.details)
  }
  return response.json()
}

// ==================== TRANSACTION API FUNCTIONS ====================

export async function createTransaction(data: TransactionData): Promise<Transaction> {
  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  return handleResponse<Transaction>(response)
}

export async function getTransactions(): Promise<Transaction[]> {
  const response = await fetch("/api/transactions")
  return handleResponse<Transaction[]>(response)
}

export async function getTransaction(id: string): Promise<Transaction> {
  const response = await fetch(`/api/transactions/${id}`)
  return handleResponse<Transaction>(response)
}

export async function updateTransaction(id: string, data: Partial<TransactionData>): Promise<Transaction> {
  const response = await fetch(`/api/transactions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  return handleResponse<Transaction>(response)
}

export async function deleteTransaction(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
  })

  return handleResponse<{ message: string }>(response)
}

// ==================== CATEGORY API FUNCTIONS ====================

export async function createCategory(data: CategoryData): Promise<Category> {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  return handleResponse<Category>(response)
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories")
  return handleResponse<Category[]>(response)
}

export async function getCategory(id: string): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`)
  return handleResponse<Category>(response)
}

export async function updateCategory(id: string, data: Partial<CategoryData>): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  return handleResponse<Category>(response)
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  })

  return handleResponse<{ message: string }>(response)
}

// ==================== BUDGET API FUNCTIONS ====================

export async function createBudget(data: BudgetData): Promise<Budget> {
  const response = await fetch("/api/budgets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  return handleResponse<Budget>(response)
}

export async function getBudgets(): Promise<Budget[]> {
  const response = await fetch("/api/budgets")
  return handleResponse<Budget[]>(response)
}

export async function getBudget(id: string): Promise<Budget> {
  const response = await fetch(`/api/budgets/${id}`)
  return handleResponse<Budget>(response)
}

export async function updateBudget(id: string, data: Partial<BudgetData>): Promise<Budget> {
  const response = await fetch(`/api/budgets/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  return handleResponse<Budget>(response)
}

export async function deleteBudget(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/budgets/${id}`, {
    method: "DELETE",
  })

  return handleResponse<{ message: string }>(response)
}

// ==================== DASHBOARD API FUNCTIONS ====================

export async function getDashboardData(queryParams = ""): Promise<DashboardData> {
  const url = process.env.NODE_ENV === 'production' ? `https://rfinance.vercel.app/api/dashboard${queryParams}` : `http://localhost:3000/api/dashboard${queryParams}`
  const response = await fetch(url, { method: 'GET' })
  return handleResponse<DashboardData>(response)
}


