"use client"

import { useCallback, useEffect, useState } from "react"
import {
  type Transaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type TransactionData,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function useTransactions(month?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (month) params.append('month', month)

      const response = await fetch(`/api/transactions?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      
      const data = await response.json()
      setTransactions(data.transactions)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch transactions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [month, toast])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = useCallback(
    async (data: TransactionData) => {
      try {
        const newTransaction = await createTransaction(data)
        setTransactions((prev) => [newTransaction, ...prev])
        toast({
          title: "Success",
          description: "Transaction created successfully",
        })
        return newTransaction
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to create transaction",
          variant: "destructive",
        })
        throw err
      }
    },
    [toast],
  )

  const editTransaction = useCallback(
    async (id: string, data: Partial<TransactionData>) => {
      try {
        const updatedTransaction = await updateTransaction(id, data)
        setTransactions((prev) => prev.map((transaction) => (transaction.id === id ? updatedTransaction : transaction)))
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
    [toast],
  )

  const removeTransaction = useCallback(
    async (id: string) => {
      try {
        await deleteTransaction(id)
        setTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
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
    [toast],
  )

  return {
    transactions,
    isLoading,
    error,
    refreshTransactions: fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
  }
}

