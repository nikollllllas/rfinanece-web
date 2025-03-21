"use client";

import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useDashboard } from "@/components/dashboard-provider";

export default function BudgetProgress() {
  const { dashboardData, isLoading, error } = useDashboard();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando orçamentos...</span>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p className="text-destructive">Erro ao carregar dados de orçamento.</p>
      </div>
    );
  }

  if (dashboardData.budgets.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p className="text-muted-foreground">Nenhum orçamento definido.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dashboardData.budgets.map((budget) => {
        const percentage = Math.min(
          Math.round((budget.current / budget.max) * 100),
          100
        );
        const isOverBudget = budget.current > budget.max;

        return (
          <div key={budget.id} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{budget.category}</span>
              <span className={isOverBudget ? "text-red-500 font-medium" : ""}>
                {formatCurrency(budget.current)} / {formatCurrency(budget.max)}
                {isOverBudget && " (Acima do orçamento)"}
              </span>
            </div>
            <Progress
              value={percentage}
              className={`h-2 ${isOverBudget ? "bg-red-100" : "bg-gray-100"}`}
              indicatorClassName={isOverBudget ? "bg-red-500" : budget.color}
            />
          </div>
        );
      })}
    </div>
  );
}
