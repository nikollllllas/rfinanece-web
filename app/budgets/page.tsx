import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

// Sample data - in a real app, this would come from your database
const budgets = [
  {
    id: "1",
    category: "Casa",
    current: 1200,
    max: 1300,
    color: "bg-blue-500",
  },
  {
    id: "2",
    category: "Comida",
    current: 450,
    max: 500,
    color: "bg-green-500",
  },
  {
    id: "3",
    category: "Transporte",
    current: 300,
    max: 350,
    color: "bg-yellow-500",
  },
  {
    id: "4",
    category: "Entretenimento",
    current: 250,
    max: 200,
    color: "bg-red-500",
  },
  {
    id: "5",
    category: "Utilidades",
    current: 220,
    max: 250,
    color: "bg-purple-500",
  },
  {
    id: "6",
    category: "Comprinhas",
    current: 180,
    max: 300,
    color: "bg-indigo-500",
  },
  {
    id: "7",
    category: "Saúde",
    current: 120,
    max: 200,
    color: "bg-pink-500",
  },
  {
    id: "8",
    category: "Educação",
    current: 80,
    max: 150,
    color: "bg-teal-500",
  },
];

export default function BudgetsPage() {
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
                Novo orçamento
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const percentage = Math.min(
              Math.round((budget.current / budget.max) * 100),
              100
            );
            const isOverBudget = budget.current > budget.max;

            return (
              <Card key={budget.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{budget.category}</CardTitle>
                    <span
                      className={`text-sm font-medium R${
                        isOverBudget ? "text-red-500" : ""
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>
                  <CardDescription>
                    R${budget.current} de R${budget.max} orçado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={percentage}
                    className={`h-2 R${
                      isOverBudget ? "bg-red-100" : "bg-gray-100"
                    }`}
                    indicatorClassName={
                      isOverBudget ? "bg-red-500" : budget.color
                    }
                  />
                  <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                    <span
                      className={cn("visible", {
                        hidden: isOverBudget,
                      })}
                    >
                      Restante: R${Math.max(budget.max - budget.current, 0)}
                    </span>
                    {isOverBudget && (
                      <span className="text-red-500">
                        Passou: R${(budget.current - budget.max).toFixed(2)}
                      </span>
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
                <span className="text-lg font-medium">
                  Adicionar novo orçamento
                </span>
                <span className="text-sm text-muted-foreground text-center">
                  Criar novo orçamento para acompanhar seus gastos
                </span>
              </Link>
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
