"use client"

import { Progress } from "@/components/ui/progress"

// Sample data - in a real app, this would come from your database
const budgets = [
  {
    category: "Casa",
    current: 1200,
    max: 1300,
    color: "bg-blue-500",
  },
  {
    category: "Mercado",
    current: 450,
    max: 500,
    color: "bg-green-500",
  },
  {
    category: "Comida",
    current: 100,
    max: 210,
    color: "bg-green-500",
  },
  {
    category: "Transporte",
    current: 300,
    max: 350,
    color: "bg-yellow-500",
  },
  {
    category: "Entretenimento",
    current: 250,
    max: 200,
    color: "bg-red-500",
  },
  {
    category: "Utilidades",
    current: 220,
    max: 250,
    color: "bg-purple-500",
  },
]

export default function BudgetProgress() {
  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const percentage = Math.min(Math.round((budget.current / budget.max) * 100), 100)
        const isOverBudget = budget.current > budget.max

        return (
          <div key={budget.category} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{budget.category}</span>
              <span className={isOverBudget ? "text-red-500 font-medium" : ""}>
                R${budget.current} / R${budget.max}
                {isOverBudget && " (Acima do orçamento)"}
              </span>
            </div>
            <Progress
              value={percentage}
              className={`h-2 ${isOverBudget ? "bg-red-100" : "bg-gray-100"}`}
              indicatorClassName={isOverBudget ? "bg-red-500" : budget.color}
            />
          </div>
        )
      })}
    </div>
  )
}

