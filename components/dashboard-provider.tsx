"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { getDashboardData, type DashboardData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DashboardContextType {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
  refreshDashboardData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType>({
  dashboardData: null,
  isLoading: false,
  error: null,
  refreshDashboardData: async () => {},
});

export const useDashboard = () => useContext(DashboardContext);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const timestamp = new Date().getTime();
      const data = await getDashboardData(`?t=${timestamp}`);
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
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        isLoading,
        error,
        refreshDashboardData: fetchDashboardData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
