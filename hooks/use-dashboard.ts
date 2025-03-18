"use client"

import { useCallback, useEffect, useState } from "react"
import { type DashboardData, getDashboardData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getDashboardData()
      setDashboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    dashboardData,
    isLoading,
    error,
    refreshDashboardData: fetchDashboardData,
  }
}

