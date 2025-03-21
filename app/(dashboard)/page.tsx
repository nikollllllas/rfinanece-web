"use client";

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
import { DashboardProvider } from "@/components/dashboard-provider";
import { DashboardSummary } from "@/components/dashboard-summary";
import { useState } from "react";
import { TransactionCreateDialog } from "@/components/transaction-create-dialog";

export default function Dashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <DashboardProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 md:px-6">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-lg">Painel</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Nova Transação
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <DashboardSummary />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Visão Financeira</CardTitle>
                <CardDescription>
                  Sua atividade financeira nos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialOverview />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
                <CardDescription>
                  Detalhamento das suas gastos mensais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpensesByCategory />
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
                <BudgetProgress />
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
                <RecentTransactions />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <TransactionCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </DashboardProvider>
  );
}
