"use client"

import { useCallback, useEffect, useState } from "react"
import { type Budget, getBudgets, createBudget, updateBudget, deleteBudget, replicateBudgets, type BudgetData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getBudgets()
      setBudgets(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch budgets",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchBudgets()
  }, [])

  const addBudget = useCallback(
    async (data: BudgetData) => {
      try {
        const newBudget = await createBudget(data)
        setBudgets((prev) => [...prev, newBudget])
        toast({
          title: "Sucesso",
          description: "Orçamento criado com sucesso",
        })
        return newBudget
      } catch (err) {
        toast({
          title: "Erro",
          description: err instanceof Error ? err.message : "Falha ao criar orçamento",
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  const editBudget = useCallback(
    async (id: string, data: Partial<BudgetData>) => {
      try {
        const updatedBudget = await updateBudget(id, data)
        setBudgets((prev) => prev.map((budget) => (budget.id === id ? updatedBudget : budget)))
        toast({
          title: "Sucesso",
          description: "Orçamento atualizado com sucesso",
        })
        return updatedBudget
      } catch (err) {
        toast({
          title: "Erro",
          description: err instanceof Error ? err.message : "Falha ao atualizar orçamento",
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  const removeBudget = useCallback(
    async (id: string) => {
      try {
        await deleteBudget(id)
        setBudgets((prev) => prev.filter((budget) => budget.id !== id))
        toast({
          title: "Sucesso",
          description: "Orçamento excluído com sucesso",
        })
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to delete budget",
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  const replicateBudgetsFromPreviousMonth = useCallback(
    async (targetMonth: string) => {
      try {
        const result = await replicateBudgets(targetMonth)
        setBudgets((prev) => [...prev, ...result.budgets])
        toast({
          title: "Sucesso!",
          description: result.message,
        })
        return result.budgets
      } catch (err) {
        toast({
          title: "Erro...",
          description: err instanceof Error ? err.message : "Failed to replicate budgets",
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  return {
    budgets,
    isLoading,
    error,
    refreshBudgets: fetchBudgets,
    addBudget,
    editBudget,
    removeBudget,
    replicateBudgetsFromPreviousMonth,
    getBudgetById: useCallback((id: string) => budgets.find((b) => b.id === id), [budgets]),
    getBudgetsByCategory: useCallback(
      (categoryId: string) => budgets.filter((b) => b.categoryId === categoryId),
      [budgets],
    ),
  }
}

export function useBudgetProgress(budgetId: string) {
  const [progress, setProgress] = useState<{ current: number; percentage: number; isOverBudget: boolean }>({
    current: 0,
    percentage: 0,
    isOverBudget: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBudgetProgress = useCallback(async () => {
    if (!budgetId) return
    
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/budgets/${budgetId}/progress`)
      if (!response.ok) {
        throw new Error("Failed to fetch budget progress")
      }
      const data = await response.json()
      setProgress({
        current: data.current,
        percentage: Math.min(Math.round((data.current / data.max) * 100), 100),
        isOverBudget: data.current > data.max,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
    } finally {
      setIsLoading(false)
    }
  }, [budgetId])

  useEffect(() => {
    fetchBudgetProgress()
  }, [fetchBudgetProgress])

  return { progress, isLoading, error }
}

