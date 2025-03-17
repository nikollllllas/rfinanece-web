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

// Sample data - in a real app, this would come from your database
const data = [
  { name: "Casa", value: 1200, color: "#8884d8" },
  { name: "Comida", value: 450, color: "#82ca9d" },
  { name: "Transporte", value: 300, color: "#ffc658" },
  { name: "Entretenimento", value: 250, color: "#ff8042" },
  { name: "Utilidades", value: 220, color: "#0088fe" },
  { name: "Outros", value: 220, color: "#00C49F" },
];

export default function ExpensesByCategory() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
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
          {data.map((entry, index) => (
            <Cell
              key={`cell-${
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                index
              }`}
              fill={entry.color}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
