"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/use-categories";
import { createBudget } from "@/lib/api";

export default function NewBudgetPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState("MENSAL");
  const [showEndDate, setShowEndDate] = useState(false);

  const expenseCategories = categories.filter(
    (category) => category.type === "GASTO" || category.type === "AMBOS"
  );

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    setShowEndDate(value === "CUSTOM");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const budgetData = {
        amount: Number.parseFloat(formData.get("amount") as string),
        period: period as any,
        startDate: startDate.toISOString(),
        endDate: showEndDate && endDate ? endDate.toISOString() : undefined,
        categoryId: formData.get("category") as string,
      };

      await createBudget(budgetData);

      toast({
        title: "Orçamento criado",
        description: "Seu orçamento foi criado com sucesso.",
      });

      router.push("/budgets");
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Falha ao criar orçamento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/budgets">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <div className="ml-4 flex items-center gap-2 font-semibold">
            <span className="text-lg">Novo Orçamento</span>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Adicionar Novo Orçamento</CardTitle>
            <CardDescription>
              Defina um limite de gastos para uma categoria
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select required name="category">
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        Carregando categorias...
                      </SelectItem>
                    ) : expenseCategories.length > 0 ? (
                      expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Nenhuma categoria disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor do Orçamento</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    R$
                  </span>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Período</Label>
                <Select
                  required
                  name="period"
                  defaultValue="MONTHLY"
                  onValueChange={handlePeriodChange}
                >
                  <SelectTrigger id="period">
                    <SelectValue placeholder="Selecione um período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIÁRIO">Diário</SelectItem>
                    <SelectItem value="SEMANAL">Semanal</SelectItem>
                    <SelectItem value="MENSAL">Mensal</SelectItem>
                    <SelectItem value="QUARTENAL">Trimestral</SelectItem>
                    <SelectItem value="ANUAL">Anual</SelectItem>
                    <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início</Label>
                <DatePicker
                  date={startDate}
                  setDate={(newDate) => newDate && setStartDate(newDate)}
                />
                <input
                  type="hidden"
                  name="startDate"
                  value={startDate.toISOString()}
                />
              </div>

              {showEndDate && (
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data de Término</Label>
                  <DatePicker date={endDate} setDate={setEndDate} />
                  {endDate && (
                    <input
                      type="hidden"
                      name="endDate"
                      value={endDate.toISOString()}
                    />
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/budgets")}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || categoriesLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Orçamento"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
