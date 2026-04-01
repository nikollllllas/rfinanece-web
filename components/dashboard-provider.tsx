"use client";

import type React from "react";

import { createContext, useContext, useState, useCallback } from "react";
import { type DashboardData } from "@/lib/api-types";
import { useDashboardControllerGetSummary } from "@/lib/api/dashboard/hooks/use-dashboard-controller-get-summary";
import { kubbClientConfig } from "@/lib/kubb-client";
import { useToast } from "@/hooks/use-toast";

interface DashboardContextType {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
  selectedMonth: string;
  refreshDashboardData: () => Promise<void>;
  setSelectedMonth: (month: string) => void;
}

const DashboardContext = createContext<DashboardContextType>({
  dashboardData: null,
  isLoading: false,
  error: null,
  selectedMonth: "",
  refreshDashboardData: async () => {},
  setSelectedMonth: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  });
  const { toast } = useToast();
  const dashboardQuery = useDashboardControllerGetSummary(
    { month: selectedMonth },
    { client: kubbClientConfig },
  );
  const fetchDashboardData = useCallback(async () => {
    try {
      await dashboardQuery.refetch();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to fetch dashboard data",
        variant: "destructive",
      });
    }
  }, [dashboardQuery, toast]);

  return (
    <DashboardContext.Provider
      value={{
        dashboardData: (dashboardQuery.data ?? null) as DashboardData | null,
        isLoading: dashboardQuery.isLoading,
        error: (dashboardQuery.error as Error | null) ?? null,
        selectedMonth,
        refreshDashboardData: fetchDashboardData,
        setSelectedMonth,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
