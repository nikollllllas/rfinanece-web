"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getDashboardData, type DashboardData } from "@/lib/api";
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  });
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = `?month=${selectedMonth}`;
      const data = await getDashboardData(queryParams);
      setDashboardData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        isLoading,
        error,
        selectedMonth,
        refreshDashboardData: fetchDashboardData,
        setSelectedMonth,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
