"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Loader2 } from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";

export default function ExpensesByCategory() {
  const [mounted, setMounted] = useState(false);
  const { dashboardData, isLoading, error } = useDashboard();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados de gastos...</span>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p className="text-destructive">Erro ao carregar dados de gastos.</p>
      </div>
    );
  }

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // If no expense data is available
  if (dashboardData.expensesByCategory.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p className="text-muted-foreground">
          Nenhuma gasto registrada neste período.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={dashboardData.expensesByCategory}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {dashboardData.expensesByCategory.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), "Valor"]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
