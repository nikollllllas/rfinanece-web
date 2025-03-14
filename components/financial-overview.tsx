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

const data = [
  { month: "Jan", ganhos: 3200, gastos: 1800, economia: 1400 },
  { month: "Fev", ganhos: 3500, gastos: 2100, economia: 1400 },
  { month: "Mar", ganhos: 3100, gastos: 1900, economia: 1200 },
  { month: "Abr", ganhos: 3800, gastos: 2300, economia: 1500 },
  { month: "Mai", ganhos: 4000, gastos: 2500, economia: 1500 },
  { month: "Jun", ganhos: 4200, gastos: 2640, economia: 1560 },
];

export default function FinancialOverview() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          formatter={(value) => [`$${value}`, undefined]}
          labelFormatter={(label) => `Mês: ${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="ganhos"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="gastos" stroke="#ff0000" />
        <Line type="monotone" dataKey="economia" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
}
