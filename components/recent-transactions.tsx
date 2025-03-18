"use client";

import { ArrowDownIcon, ArrowUpIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/use-transactions";

export default function RecentTransactions() {
  const { transactions, isLoading, error } = useTransactions();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Carregando transações...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Erro ao carregar transações.</p>
      </div>
    );
  }

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (recentTransactions.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentTransactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full",
                transaction.type === "GANHO" ? "bg-green-100" : "bg-red-100"
              )}
            >
              {transaction.type === "GANHO" ? (
                <ArrowUpIcon className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowDownIcon className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">
                {transaction.category?.name || "Sem categoria"} •{" "}
                {formatDate(transaction.date.toString())}
              </p>
            </div>
          </div>
          <div
            className={cn(
              "font-medium",
              transaction.type === "GANHO" ? "text-green-600" : "text-red-600"
            )}
          >
            {transaction.type === "GANHO" ? "+" : "-"}
            {formatCurrency(Number(transaction.amount))}
          </div>
        </div>
      ))}
    </div>
  );
}
