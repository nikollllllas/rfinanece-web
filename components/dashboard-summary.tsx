"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/components/dashboard-provider";

export function DashboardSummary() {
  const { dashboardData, isLoading, error } = useDashboard();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[100px]" />
        <Skeleton className="h-[100px]" />
        <Skeleton className="h-[100px]" />
        <Skeleton className="h-[100px]" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="rounded-md border border-destructive p-4 text-center">
        <p className="text-destructive">
          Erro ao carregar dados do painel. Por favor, tente novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(dashboardData.summary.balance)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatChange(dashboardData.summary.savings.change)} em relação ao
            mês anterior
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ganhos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(dashboardData.summary.income.amount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatChange(dashboardData.summary.income.change)} em relação ao
            mês anterior
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(dashboardData.summary.expenses.amount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatChange(dashboardData.summary.expenses.change)} em relação ao
            mês anterior
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Economia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(dashboardData.summary.savings.amount)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatChange(dashboardData.summary.savings.change)} em relação ao
            mês anterior
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
