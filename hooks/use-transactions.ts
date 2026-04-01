"use client"

import { useCallback } from "react"
import { type Transaction, type TransactionData } from "@/lib/api-types"
import { useTransactionsControllerList } from "@/lib/api/transactions/hooks/use-transactions-controller-list"
import { useTransactionsControllerCreate } from "@/lib/api/transactions/hooks/use-transactions-controller-create"
import { useTransactionsControllerUpdate } from "@/lib/api/transactions/hooks/use-transactions-controller-update"
import { useTransactionsControllerRemove } from "@/lib/api/transactions/hooks/use-transactions-controller-remove"
import { kubbClientConfig } from "@/lib/kubb-client"
import { useToast } from "@/hooks/use-toast"

export function useTransactions(month?: string) {
  const { toast } = useToast()
  const transactionsQuery = useTransactionsControllerList(
    month ? { month } : undefined,
    { client: kubbClientConfig },
  )
  const createMutation = useTransactionsControllerCreate({
    client: kubbClientConfig,
  })
  const updateMutation = useTransactionsControllerUpdate({
    client: kubbClientConfig,
  })
  const removeMutation = useTransactionsControllerRemove({
    client: kubbClientConfig,
  })
  const queryData = transactionsQuery.data as any
  const transactions = (Array.isArray(queryData) ? queryData : queryData?.transactions ?? []) as Transaction[]

  const fetchTransactions = useCallback(async () => {
    try {
      await transactionsQuery.refetch()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch transactions",
        variant: "destructive",
      })
    }
  }, [transactionsQuery, toast])

  const addTransaction = useCallback(
    async (data: TransactionData) => {
      try {
        const payload = {
          ...data,
          date: typeof data.date === "string" ? data.date : data.date.toISOString(),
        }
        const created = await createMutation.mutateAsync({ data: payload as any })
        await fetchTransactions()
        toast({
          title: "Success",
          description: "Transaction created successfully",
        })
        return (Array.isArray(created) ? created[0] : created) as Transaction
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to create transaction",
          variant: "destructive",
        })
        throw err
      }
    },
    [createMutation, toast, fetchTransactions],
  )

  const editTransaction = useCallback(
    async (id: string, data: Partial<TransactionData>) => {
      try {
        const payload = {
          ...data,
          ...(data.date
            ? { date: typeof data.date === "string" ? data.date : data.date.toISOString() }
            : {}),
        }
        const updatedTransaction = await updateMutation.mutateAsync({ id, data: payload as any })
        await fetchTransactions()
        toast({
          title: "Success",
          description: "Transaction updated successfully",
        })
        return updatedTransaction
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to update transaction",
          variant: "destructive",
        })
        throw err
      }
    },
    [updateMutation, toast, fetchTransactions],
  )

  const removeTransaction = useCallback(
    async (id: string) => {
      try {
        await removeMutation.mutateAsync({ id })
        await fetchTransactions()
        toast({
          title: "Success",
          description: "Transaction deleted successfully",
        })
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to delete transaction",
          variant: "destructive",
        })
        throw err
      }
    },
    [removeMutation, toast, fetchTransactions],
  )

  return {
    transactions,
    isLoading: transactionsQuery.isLoading,
    error: (transactionsQuery.error as Error | null) ?? null,
    refreshTransactions: fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
  }
}

