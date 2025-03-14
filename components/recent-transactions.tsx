"use client"

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const transactions = [
  {
    id: "1",
    description: "Mercado",
    amount: -120.5,
    date: "2023-06-15",
    category: "Comida",
  },
  {
    id: "2",
    description: "Salário",
    amount: 2500.0,
    date: "2023-06-10",
    category: "Ganhos",
  },
  {
    id: "3",
    description: "Conta de Luz",
    amount: -85.2,
    date: "2023-06-08",
    category: "Utilidades",
  },
  {
    id: "4",
    description: "Venda de Caneca",
    amount: 50,
    date: "2023-06-05",
    category: "Ganho",
  },
  {
    id: "5",
    description: "Alameda 81",
    amount: -65.3,
    date: "2023-06-03",
    category: "Comida",
  },
]

export default function RecentTransactions() {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full",
                transaction.amount > 0 ? "bg-green-100" : "bg-red-100",
              )}
            >
              {transaction.amount > 0 ? (
                <ArrowUpIcon className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowDownIcon className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">
                {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className={cn("font-medium", transaction.amount > 0 ? "text-green-600" : "text-red-600")}>
            {transaction.amount > 0 ? "+" : "-"}R${Math.abs(transaction.amount).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  )
}

