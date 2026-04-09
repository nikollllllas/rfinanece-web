"use client";

import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { DashboardData } from "@/lib/api-types";
import { formatCurrency } from "@/lib/utils";
import { useCategories } from "@/hooks/use-categories";

interface BudgetProgressProps {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
}

export default function BudgetProgress({
  dashboardData,
  isLoading,
  error,
}: BudgetProgressProps) {
  const { categories } = useCategories();

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
      {dashboardData.budgets.map((budget: any) => {
        const percentage = Math.min(
          Math.round((budget.current / budget.max) * 100),
          100,
        );
        const isOverBudget = budget.current > budget.max;
        const categoryType = (budget.categoryType ??
          categories.find((category) => category.name === budget.category)
            ?.type) as "GANHO" | "GASTO" | "AMBOS" | undefined;
        let track = "bg-gray-200"
        let indicatorColor = "bg-gray-400"
        let textColor = "text-muted-foreground"
        let showOverBudgetWarning = false

        if (categoryType === "GASTO") {
          track = "bg-red-200"
          textColor = "text-red-600"
          indicatorColor = isOverBudget ? "bg-red-500" : "bg-red-400"
          showOverBudgetWarning = isOverBudget
        } else if (categoryType === "GANHO") {
          track = "bg-green-200"
          textColor = "text-green-600"
          indicatorColor = isOverBudget ? "bg-green-500" : "bg-green-400"
        } else if (categoryType === "AMBOS") {
          track = "bg-yellow-200"
          textColor = "text-yellow-600"
          indicatorColor = isOverBudget ? "bg-yellow-500" : "bg-yellow-400"
          showOverBudgetWarning = isOverBudget
        }

        return (
          <div key={budget.id} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{budget.category}</span>
              <span className={textColor}>
                {formatCurrency(budget.current)} / {formatCurrency(budget.max)}
                {showOverBudgetWarning && " (Acima do orçamento)"}
              </span>
            </div>
            <Progress
              value={percentage}
              className={`h-2 ${track}`}
              indicatorClassName={indicatorColor}
            />
          </div>
        );
      })}
    </div>
  );
}
