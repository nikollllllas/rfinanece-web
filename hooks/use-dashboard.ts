"use client"

import { type DashboardData } from "@/lib/api-types"
import { useDashboardControllerGetSummary } from "@/lib/api/dashboard/hooks/use-dashboard-controller-get-summary"
import { kubbClientConfig } from "@/lib/kubb-client"
import { useToast } from "@/hooks/use-toast"

export function useDashboard() {
  const { toast } = useToast()
  const dashboardQuery = useDashboardControllerGetSummary(undefined, {
    client: kubbClientConfig,
  })

  return {
    dashboardData: (dashboardQuery.data ?? null) as DashboardData | null,
    isLoading: dashboardQuery.isLoading,
    error: (dashboardQuery.error as Error | null) ?? null,
    refreshDashboardData: async () => {
      try {
        await dashboardQuery.refetch()
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch dashboard data",
          variant: "destructive",
        })
      }
    },
  }
}

