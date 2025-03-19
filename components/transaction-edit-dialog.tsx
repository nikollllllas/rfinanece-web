"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/use-categories";
import { getTransaction, updateTransaction } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TransactionEditDialogProps {
  transactionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TransactionEditDialog({
  transactionId,
  open,
  onOpenChange,
  onSuccess,
}: TransactionEditDialogProps) {
  const { toast } = useToast();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Form state
  const [transactionType, setTransactionType] = useState<"GANHO" | "GASTO">(
    "GASTO"
  );
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState("");
  const [notes, setNotes] = useState("");

  // Load transaction data
  useEffect(() => {
    if (!open || !transactionId) return;

    async function loadTransaction() {
      try {
        setIsLoading(true);
        const data = await getTransaction(transactionId);
        setTransaction(data);

        // Set form values
        setTransactionType(data.type);
        setDescription(data.description);
        setAmount(String(data.amount));
        setDate(new Date(data.date));
        setCategoryId(data.categoryId);
        setNotes(data.notes || "");
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Falha ao carregar transação")
        );
        toast({
          title: "Erro",
          description: "Falha ao carregar detalhes da transação",
          variant: "destructive",
        });
        onOpenChange(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadTransaction();
  }, [transactionId, open, toast, onOpenChange]);

  const filteredCategories = categories.filter(
    (category) => category.type === transactionType || category.type === "AMBOS"
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!transactionId) {
      toast({
        title: "Erro",
        description: "ID da transação inválido",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const transactionData = {
        description,
        amount: Number.parseFloat(amount),
        date: date.toISOString(),
        type: transactionType,
        categoryId,
        notes: notes || undefined,
      };

      await updateTransaction(transactionId, transactionData);

      toast({
        title: "Transação atualizada",
        description: "Sua transação foi atualizada com sucesso.",
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Falha ao atualizar transação",
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
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>
            Atualize os detalhes da sua transação
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2">Carregando transação...</p>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-destructive">Erro ao carregar transação</p>
            <Button className="mt-4" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Transação</Label>
                <RadioGroup
                  value={transactionType}
                  className="flex gap-4"
                  onValueChange={(value) =>
                    setTransactionType(value as "GANHO" | "GASTO")
                  }
                  name="type"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="GASTO" id="GASTO" />
                    <Label htmlFor="GASTO" className="cursor-pointer">
                      Despesa
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="GANHO" id="GANHO" />
                    <Label htmlFor="GANHO" className="cursor-pointer">
                      Receita
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="ex: Compras no supermercado"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
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
                <Label htmlFor="date">Data</Label>
                <DatePicker
                  date={date}
                  setDate={(newDate) => newDate && setDate(newDate)}
                />
                <input type="hidden" name="date" value={date.toISOString()} />
              </div>

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
                    ) : filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
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
                <Label htmlFor="notes">Observações (Opcional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Detalhes adicionais..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
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
