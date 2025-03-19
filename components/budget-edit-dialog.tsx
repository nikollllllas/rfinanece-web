"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/use-categories";
import { getBudget, updateBudget } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BudgetEditDialogProps {
  budgetId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BudgetEditDialog({
  budgetId,
  open,
  onOpenChange,
  onSuccess,
}: BudgetEditDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const [budget, setBudget] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<string>("MENSAL");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showEndDate, setShowEndDate] = useState(false);

  // Load budget data
  useEffect(() => {
    if (!open || !budgetId) return;

    async function loadBudget() {
      try {
        setIsLoading(true);
        const data = await getBudget(budgetId);
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
        onOpenChange(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadBudget();
  }, [budgetId, open, toast, onOpenChange]);

  // Filter to only expense categories
  const expenseCategories = categories.filter(
    (category) => category.type === "GASTO" || category.type === "AMBOS"
  );

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    setShowEndDate(value === "PERSONALIZADO");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!budgetId) {
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

      await updateBudget(budgetId, budgetData);

      toast({
        title: "Orçamento atualizado",
        description: "Seu orçamento foi atualizado com sucesso.",
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Orçamento</DialogTitle>
          <DialogDescription>
            Atualize os detalhes do seu orçamento
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2">Carregando orçamento...</p>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-destructive">Erro ao carregar orçamento</p>
            <Button className="mt-4" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
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
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
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
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
