import { Suspense } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FinancialOverview from "@/components/financial-overview";
import RecentTransactions from "@/components/recent-transactions";
import BudgetProgress from "@/components/budget-progress";
import ExpensesByCategory from "@/components/expenses-by-category";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardData } from "@/lib/api";

async function DashboardData() {
  const dashboardData = await getDashboardData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "-";
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <>
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
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
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
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.summary.expenses.amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatChange(dashboardData.summary.expenses.change)} em relação
              ao mês anterior
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
    </>
  );
}

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-lg">Painel</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/transactions/new">
                <Plus className="mr-1 h-4 w-4" />
                Nova Transação
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
            </div>
          }
        >
          <DashboardData />
        </Suspense>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Visão Financeira</CardTitle>
              <CardDescription>
                Sua atividade financeira nos últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                <FinancialOverview />
              </Suspense>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
              <CardDescription>
                Detalhamento das suas despesas mensais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                <ExpensesByCategory />
              </Suspense>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Progresso do Orçamento</CardTitle>
              <CardDescription>
                Acompanhe suas metas de orçamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                <BudgetProgress />
              </Suspense>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>
                  Suas últimas atividades financeiras
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/transactions">Ver Todas</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                <RecentTransactions />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
