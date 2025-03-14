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

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-lg">RFinances</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/transactions/new">
                <Plus className="mr-1 h-4 w-4" />
                Nova transação
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Balanço total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$12,580.00</div>
              <p className="text-xs text-muted-foreground">
                +2.5% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ganhos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$4,200.00</div>
              <p className="text-xs text-muted-foreground">
                +5.2% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$2,640.00</div>
              <p className="text-xs text-muted-foreground">
                -1.8% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Economias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$1,560.00</div>
              <p className="text-xs text-muted-foreground">
                +12.3% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Visão geral</CardTitle>
              <CardDescription>
                Atividade financeira nos últimos 6 meses
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
              <CardTitle>Gastos por categoria</CardTitle>
              <CardDescription>Separado por gastos mensais</CardDescription>
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
              <CardTitle>Orçamentos</CardTitle>
              <CardDescription>
                Acompanhe seus limites de orçamento
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
                  Seus últimos registros
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/transactions">Ver tudo</Link>
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
