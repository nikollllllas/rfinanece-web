"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";

export default function FinancialOverview() {
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
        <span className="ml-2">Carregando dados financeiros...</span>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p className="text-destructive">Erro ao carregar dados financeiros.</p>
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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={dashboardData.monthlyData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `R$${value}`} />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), undefined]}
          labelFormatter={(label) => `Mês: ${label}`}
        />
        <Legend
          payload={[
            { value: "GANHOs", type: "line", color: "#8884d8" },
            { value: "Gastos", type: "line", color: "#ff7300" },
            { value: "Economia", type: "line", color: "#82ca9d" },
          ]}
        />
        <Line
          type="monotone"
          dataKey="income"
          name="GANHOs"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          name="Gastos"
          stroke="#ff7300"
        />
        <Line
          type="monotone"
          dataKey="savings"
          name="Economia"
          stroke="#82ca9d"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
