"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { getBudget, updateBudget } from "@/lib/api";

export default function EditBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Ensure id is a string
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const [budget, setBudget] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<string>("MONTHLY");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showEndDate, setShowEndDate] = useState(false);

  // Load budget data
  useEffect(() => {
    if (!id) {
      setError(new Error("ID do orçamento inválido"));
      setIsLoading(false);
      return;
    }

    async function loadBudget() {
      try {
        setIsLoading(true);
        const data = await getBudget(id);
        setBudget(data);

        // Set form values
        setAmount(String(data.amount));
        setPeriod(data.period);
        setCategoryId(data.categoryId);
        setStartDate(new Date(data.startDate));

        if (data.endDate) {
          setEndDate(new Date(data.endDate));
          setShowEndDate(true);
        }

        // Show end date field if period is CUSTOM
        setShowEndDate(data.period === "PERSONALIZADO");
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Falha ao carregar orçamento")
        );
        toast({
          title: "Erro",
          description: "Falha ao carregar detalhes do orçamento",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadBudget();
  }, [id, toast]);

  const expenseCategories = categories.filter(
    (category) => category.type === "GASTO" || category.type === "AMBOS"
  );

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    setShowEndDate(value === "CUSTOM");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id) {
      toast({
        title: "Erro",
        description: "ID do orçamento inválido",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const budgetData = {
        amount: Number.parseFloat(amount),
        period: period as any,
        startDate: startDate.toISOString(),
        endDate: showEndDate && endDate ? endDate.toISOString() : null,
        categoryId,
      };

      await updateBudget(id, budgetData);

      toast({
        title: "Orçamento atualizado",
        description: "Seu orçamento foi atualizado com sucesso.",
      });

      router.push("/budgets");
    } catch (error) {
      console.error("Erro ao atualizar orçamento:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Falha ao atualizar orçamento",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
              <span className="text-lg">Editar Orçamento</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2">Carregando orçamento...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !budget) {
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
              <span className="text-lg">Editar Orçamento</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 flex justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Erro</CardTitle>
              <CardDescription>
                Não foi possível carregar o orçamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>O orçamento pode ter sido excluído ou ocorreu um erro.</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/budgets">Voltar para Orçamentos</Link>
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

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
            <span className="text-lg">Editar Orçamento</span>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Editar Orçamento</CardTitle>
            <CardDescription>
              Atualize os detalhes do seu orçamento
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  required
                  name="category"
                  value={categoryId}
                  onValueChange={setCategoryId}
                >
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
                  <span className="absolute left-3 top-2.5">R$</span>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    className="pl-9"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Período</Label>
                <Select
                  required
                  name="period"
                  value={period}
                  onValueChange={handlePeriodChange}
                >
                  <SelectTrigger id="period">
                    <SelectValue placeholder="Selecione um período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Diário</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                    <SelectItem value="CUSTOM">Personalizado</SelectItem>
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
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || categoriesLoading}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
