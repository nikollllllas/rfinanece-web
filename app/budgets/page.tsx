"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useBudgets } from "@/hooks/use-budget";
import { useCategories } from "@/hooks/use-categories";
import { Budget } from "@prisma/client";

export default function BudgetsPage() {
  const { budgets, isLoading, error } = useBudgets();
  const { categories } = useCategories();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateString));
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Sem categoria";
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || "#000000";
  };

  const formatPeriod = (period: string) => {
    const periods: Record<string, string> = {
      DIÁRIO: "Diário",
      SEMANAL: "Semanal",
      MENSAL: "Mensal",
      QUARTENAL: "Trimestral",
      ANUAL: "Anual",
      PERSONALIZADO: "Personalizado",
    };
    return periods[period] || period;
  };

  const calculateProgress = (budget: any) => {
    // In a real app, you would calculate this based on actual transactions
    // For now, we'll use a random value between 0 and 150% of the budget
    const current = Math.random() * Number(budget.amount) * 1.5;
    return {
      current,
      percentage: Math.min(
        Math.round((current / Number(budget.amount)) * 100),
        100
      ),
      isOverBudget: current > Number(budget.amount),
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 md:px-6">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-lg">Orçamentos</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button asChild size="sm">
                <Link href="/budgets/new">
                  <Plus className="mr-1 h-4 w-4" />
                  Novo Orçamento
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2">Carregando orçamentos...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-lg">Orçamentos</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/budgets/new">
                <Plus className="mr-1 h-4 w-4" />
                Novo Orçamento
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        {error ? (
          <div className="rounded-md border border-destructive p-4 text-center">
            <p className="text-destructive">
              Erro ao carregar orçamentos. Por favor, tente novamente.
            </p>
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <p className="text-muted-foreground mb-4">
              Nenhum orçamento encontrado.
            </p>
            <Button asChild>
              <Link href="/budgets/new">
                <Plus className="mr-1 h-4 w-4" />
                Criar Novo Orçamento
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => {
              const progress = calculateProgress(budget);
              const isOverBudget = progress.isOverBudget;
              const percentage = progress.percentage;

              return (
                <Card key={budget.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        {getCategoryName(budget.categoryId)}
                      </CardTitle>
                      <span
                        className={`text-sm font-medium ${
                          isOverBudget ? "text-red-500" : ""
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <CardDescription>
                      {formatCurrency(Number(budget.amount))} •{" "}
                      {formatPeriod(budget.period)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={percentage}
                      className={`h-2 ${
                        isOverBudget ? "bg-red-100" : "bg-gray-100"
                      }`}
                      indicatorClassName={
                        isOverBudget
                          ? "bg-red-500"
                          : getCategoryColor(budget.categoryId)
                      }
                    />
                    <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                      <span>
                        Válido a partir de:{" "}
                        {formatDate(budget.startDate.toString())}
                      </span>
                      {isOverBudget && (
                        <span className="text-red-500">Acima do orçamento</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Card className="flex flex-col items-center justify-center p-6 border-dashed">
              <Button asChild variant="outline" className="h-auto p-8 w-full">
                <Link
                  href="/budgets/new"
                  className="flex flex-col items-center gap-2"
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-lg font-medium">Novo Orçamento</span>
                  <span className="text-sm text-muted-foreground text-center">
                    Crie um novo orçamento
                  </span>
                </Link>
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
