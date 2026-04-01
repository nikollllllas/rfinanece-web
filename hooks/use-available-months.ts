"use client"

import { useTransactionsControllerListMonths } from "@/lib/api/transactions/hooks/use-transactions-controller-list-months"
import { kubbClientConfig } from "@/lib/kubb-client"

export function useAvailableMonths() {
  const monthsQuery = useTransactionsControllerListMonths({
    client: kubbClientConfig,
  })

  return {
    months: (monthsQuery.data ?? []) as string[],
    isLoading: monthsQuery.isLoading,
    error: monthsQuery.error as Error | null,
  }
}
