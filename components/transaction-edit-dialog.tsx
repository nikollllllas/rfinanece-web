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
import { useTransactionsControllerGetById } from "@/lib/api/transactions/hooks/use-transactions-controller-get-by-id";
import { useTransactionsControllerUpdate } from "@/lib/api/transactions/hooks/use-transactions-controller-update";
import { kubbClientConfig } from "@/lib/kubb-client";
import {
  getInstallmentSuffix,
  getPaymentMethodLabel,
} from "@/lib/installment-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
  const updateMutation = useTransactionsControllerUpdate({
    client: kubbClientConfig,
  });
  const transactionQuery = useTransactionsControllerGetById(transactionId, {
    query: { enabled: open && Boolean(transactionId) },
    client: kubbClientConfig,
  });

  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [transactionType, setTransactionType] = useState<"GANHO" | "GASTO">(
    "GASTO"
  );
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState("");
  const [notes, setNotes] = useState("");
  const [tag, setTag] = useState<
    "FALTA" | "PAGO" | "DEVOLVER" | "ECONOMIA" | null
  >(null);

  useEffect(() => {
    if (!transactionQuery.data) return;
    const data = transactionQuery.data as any;
    setTransaction(data);
    setTransactionType(data.type);
    setDescription(data.description);
    setAmount(String(data.amount));
    setDate(new Date(data.date));
    setCategoryId(data.categoryId);
    setNotes(data.notes || "");
    setTag(data.tag || null);
    setError(null);
    setIsLoading(false);
  }, [transactionQuery.data]);

  useEffect(() => {
    if (!open) return;
    setIsLoading(transactionQuery.isLoading);
    if (transactionQuery.error) {
      setError(transactionQuery.error as Error);
      toast({
        title: "Erro",
        description: "Falha ao carregar detalhes da transação",
        variant: "destructive",
      });
      onOpenChange(false);
    }
  }, [open, transactionQuery.isLoading, transactionQuery.error, toast, onOpenChange]);

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
        tag: tag || null,
      };

      await updateMutation.mutateAsync({
        id: transactionId,
        data: transactionData as any,
      });

      toast({
        title: "Transação atualizada",
        description: "Sua transação foi atualizada com sucesso.",
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
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

  // Get tag badge variant
  const getTagVariant = (tag: string | null) => {
    switch (tag) {
      case "FALTA":
        return "destructive";
      case "PAGO":
        return "success";
      case "DEVOLVER":
        return "warning";
      case "ECONOMIA":
        return "success";
      default:
        return "outline";
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

              {transaction &&
              transaction.type === "GASTO" &&
              (transaction.paymentMethod ||
                transaction.installmentGroupId) ? (
                <div
                  className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
                  role="region"
                  aria-label="Informações de pagamento"
                >
                  {getPaymentMethodLabel(transaction.paymentMethod) ? (
                    <p>
                      Meio de pagamento:{" "}
                      <span className="font-medium text-foreground">
                        {getPaymentMethodLabel(transaction.paymentMethod)}
                      </span>
                    </p>
                  ) : null}
                  {getInstallmentSuffix(
                    transaction.installmentIndex,
                    transaction.installmentCount
                  ) ? (
                    <p className={transaction.paymentMethod ? "mt-1" : ""}>
                      Parcela{" "}
                      <span className="font-medium text-foreground">
                        {getInstallmentSuffix(
                          transaction.installmentIndex,
                          transaction.installmentCount
                        )}
                      </span>
                      {" "}
                      (alterar esta linha não muda as demais parcelas)
                    </p>
                  ) : null}
                </div>
              ) : null}

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
                <Label htmlFor="tag">Tag</Label>
                <Select
                  name="tag"
                  value={tag || ""}
                  onValueChange={(value) =>
                    setTag(
                      value === ""
                        ? null
                        : (value as "FALTA" | "PAGO" | "DEVOLVER" | "ECONOMIA")
                    )
                  }
                >
                  <SelectTrigger id="tag">
                    <SelectValue placeholder="Selecione uma tag (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Nenhum</SelectItem>
                    <SelectItem value="FALTA">
                      <Badge variant="destructive">Falta</Badge>
                    </SelectItem>
                    <SelectItem value="PAGO">
                      <Badge variant="success">Pago</Badge>
                    </SelectItem>
                    <SelectItem value="DEVOLVER">
                      <Badge variant="warning">Devolver</Badge>
                    </SelectItem>
                    <SelectItem value="ECONOMIA">
                      <Badge variant="success">Economia</Badge>
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
