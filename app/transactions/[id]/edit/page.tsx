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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { getTransaction, updateTransaction } from "@/lib/api";
import { useCategories } from "@/hooks/use-categories";

export default function EditTransactionPage() {
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

  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [transactionType, setTransactionType] = useState<"GASTO" | "GANHO">(
    "GASTO"
  );
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState("");
  const [notes, setNotes] = useState("");

  // Load transaction data
  useEffect(() => {
    if (!id) {
      setError(new Error("ID da transação inválido"));
      setIsLoading(false);
      return;
    }

    async function loadTransaction() {
      try {
        setIsLoading(true);
        const data = await getTransaction(id);
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
      } finally {
        setIsLoading(false);
      }
    }

    loadTransaction();
  }, [id, toast]);

  const filteredCategories = categories.filter(
    (category) => category.type === transactionType || category.type === "AMBOS"
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id) {
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

      await updateTransaction(id, transactionData);

      toast({
        title: "Transação atualizada",
        description: "Sua transação foi atualizada com sucesso.",
      });

      router.push(`/transactions/${id}`);
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

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 md:px-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/transactions/${id}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Link>
            </Button>
            <div className="ml-4 flex items-center gap-2 font-semibold">
              <span className="text-lg">Editar Transação</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2">Carregando transação...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 md:px-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/transactions">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Link>
            </Button>
            <div className="ml-4 flex items-center gap-2 font-semibold">
              <span className="text-lg">Editar Transação</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 flex justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Erro</CardTitle>
              <CardDescription>
                Não foi possível carregar a transação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>A transação pode ter sido excluída ou ocorreu um erro.</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/transactions">Voltar para Transações</Link>
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
            <Link href={`/transactions/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <div className="ml-4 flex items-center gap-2 font-semibold">
            <span className="text-lg">Editar Transação</span>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Editar Transação</CardTitle>
            <CardDescription>
              Atualize os detalhes da sua transação
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Transação</Label>
                <RadioGroup
                  value={transactionType}
                  className="flex gap-4"
                  onValueChange={(value) =>
                    setTransactionType(value as "GASTO" | "GANHO")
                  }
                  name="type"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="GASTO" id="expense" />
                    <Label htmlFor="expense" className="cursor-pointer">
                      Gasto
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="GANHO" id="income" />
                    <Label htmlFor="income" className="cursor-pointer">
                      Ganho
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
                {/* Hidden input to include date in form submission */}
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push(`/transactions/${id}`)}
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
