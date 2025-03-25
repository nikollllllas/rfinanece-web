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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/use-categories";
import { createTransaction } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface TransactionCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TransactionCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: TransactionCreateDialogProps) {
  const { toast } = useToast();
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Form state
  const [transactionType, setTransactionType] = useState<"GANHO" | "GASTO">(
    "GASTO"
  );
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState("");
  const [notes, setNotes] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter(
    (category) => category.type === transactionType || category.type === "AMBOS"
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const transactionData = {
        description,
        amount: Number.parseFloat(amount),
        date: date.toISOString(),
        type: transactionType,
        categoryId,
        notes: notes || undefined,
        tag: tag as
          | "FALTA"
          | "PAGO"
          | "DEVOLVER"
          | "ECONOMIA"
          | null
          | undefined,
      };

      await createTransaction(transactionData);

      toast({
        title: "Transação criada",
        description: "Sua transação foi criada com sucesso.",
      });

      setDescription("");
      setAmount("");
      setDate(new Date());
      setCategoryId("");
      setNotes("");
      setTag(null);

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Falha ao criar transação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Registre uma nova receita ou despesa
          </DialogDescription>
        </DialogHeader>

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

            {/* Tag field */}
            <div className="space-y-2">
              <Label htmlFor="tag">Status</Label>
              <Select
                name="tag"
                value={tag || "none"}
                onValueChange={(value) =>
                  setTag(
                    value === ""
                      ? null
                      : (value as "FALTA" | "PAGO" | "DEVOLVER" | "ECONOMIA")
                  )
                }
              >
                <SelectTrigger id="tag">
                  <SelectValue placeholder="Selecione um status (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="FALTA">
                    <div className="flex items-center">
                      <Badge variant="destructive" className="mr-2">
                        Falta
                      </Badge>
                      <span>Pendente</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PAGO">
                    <div className="flex items-center">
                      <Badge variant="success" className="mr-2 bg-green-500">
                        Pago
                      </Badge>
                      <span>Pago</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="DEVOLVER">
                    <div className="flex items-center">
                      <Badge variant="warning" className="mr-2 bg-yellow-500">
                        Devolver
                      </Badge>
                      <span>Devolver</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ECONOMIA">
                    <div className="flex items-center">
                      <Badge variant="secondary" className="mr-2">
                        Economia
                      </Badge>
                      <span>Economia</span>
                    </div>
                  </SelectItem>
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
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || categoriesLoading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Transação"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
