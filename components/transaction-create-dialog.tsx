"use client";

import type React from "react";
import { useState } from "react";
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
import { type TransactionData } from "@/lib/api-types";
import { useTransactionsControllerCreate } from "@/lib/api/transactions/hooks/use-transactions-controller-create";
import { kubbClientConfig } from "@/lib/kubb-client";
import {
  INSTALLMENT_MAX,
  INSTALLMENT_MIN_SPLIT,
  splitInstallmentAmounts,
} from "@/lib/installment-utils";
import { formatCurrency } from "@/lib/utils";
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

type ExpensePaymentMethod = "PIX" | "DEBITO" | "CREDITO";

export const TransactionCreateDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: TransactionCreateDialogProps) => {
  const { toast } = useToast();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const createMutation = useTransactionsControllerCreate({
    client: kubbClientConfig,
  });

  const [transactionType, setTransactionType] = useState<"GANHO" | "GASTO">(
    "GASTO"
  );
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState("");
  const [notes, setNotes] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod>("PIX");
  const [creditInstallments, setCreditInstallments] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter(
    (category) =>
      category.type === transactionType || category.type === "AMBOS"
  );

  const totalNum = Number.parseFloat(amount);
  const isCreditSplit =
    transactionType === "GASTO" &&
    paymentMethod === "CREDITO" &&
    creditInstallments >= INSTALLMENT_MIN_SPLIT;
  const parcelAmounts =
    isCreditSplit && !Number.isNaN(totalNum) && totalNum > 0
      ? splitInstallmentAmounts(totalNum, creditInstallments)
      : [];
  const firstParcel = parcelAmounts[0];
  const lastParcel = parcelAmounts[parcelAmounts.length - 1];
  const showParcelPreview =
    isCreditSplit && parcelAmounts.length > 0 && firstParcel !== undefined;
  const dateLabel =
    isCreditSplit && showParcelPreview ? "Primeira parcela" : "Data";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const transactionData: TransactionData = {
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

      if (transactionType === "GASTO") {
        transactionData.paymentMethod = paymentMethod;
        if (
          paymentMethod === "CREDITO" &&
          creditInstallments >= INSTALLMENT_MIN_SPLIT
        ) {
          transactionData.installmentCount = creditInstallments;
        }
      }

      await createMutation.mutateAsync({ data: transactionData as any });

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
      setPaymentMethod("PIX");
      setCreditInstallments(1);

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
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

  const handleTypeChange = (value: string) => {
    setTransactionType(value as "GANHO" | "GASTO");
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
                onValueChange={handleTypeChange}
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
                  aria-describedby={
                    showParcelPreview ? "installment-preview" : undefined
                  }
                />
              </div>
            </div>

            {transactionType === "GASTO" ? (
              <div className="space-y-3">
                <Label>Meio de pagamento</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => {
                    setPaymentMethod(v as ExpensePaymentMethod);
                    if (v !== "CREDITO") {
                      setCreditInstallments(1);
                    }
                  }}
                  className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
                  name="paymentMethod"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PIX" id="pay-pix" />
                    <Label htmlFor="pay-pix" className="cursor-pointer">
                      Pix
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="DEBITO" id="pay-debito" />
                    <Label htmlFor="pay-debito" className="cursor-pointer">
                      Débito
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CREDITO" id="pay-credito" />
                    <Label htmlFor="pay-credito" className="cursor-pointer">
                      Crédito
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "CREDITO" ? (
                  <div className="space-y-2">
                    <Label htmlFor="credit-installments">Parcelas</Label>
                    <Select
                      value={String(creditInstallments)}
                      onValueChange={(v) =>
                        setCreditInstallments(Number.parseInt(v, 10))
                      }
                      name="creditInstallments"
                    >
                      <SelectTrigger id="credit-installments" className="w-full">
                        <SelectValue placeholder="Número de parcelas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">À vista (1x)</SelectItem>
                        {Array.from(
                          { length: INSTALLMENT_MAX - 1 },
                          (_, i) => i + INSTALLMENT_MIN_SPLIT
                        ).map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}x
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                {showParcelPreview ? (
                  <div
                    id="installment-preview"
                    className="rounded-md border bg-muted/50 px-3 py-2 text-sm"
                    role="status"
                  >
                    <p className="font-medium text-foreground">
                      Valor da parcela: {formatCurrency(firstParcel)}
                    </p>
                    {lastParcel !== undefined && lastParcel !== firstParcel ? (
                      <p className="mt-1 text-muted-foreground">
                        Última parcela: {formatCurrency(lastParcel)} (ajuste de
                        centavos)
                      </p>
                    ) : null}
                    <p className="mt-1 text-muted-foreground">
                      Total: {formatCurrency(totalNum)}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="date">{dateLabel}</Label>
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
              <Label htmlFor="tag">Status</Label>
              <Select
                name="tag"
                value={tag || "none"}
                onValueChange={(value) =>
                  setTag(
                    value === "none"
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
};
