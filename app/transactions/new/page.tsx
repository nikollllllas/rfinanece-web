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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from "@/components/ui/date-picker";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createTransaction } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/use-categories";

export default function NewTransactionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [transactionType, setTransactionType] = useState("GANHO");
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const filteredCategories = categories.filter(
    (category) => category.type === transactionType || category.type === "AMBOS"
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const transactionData = {
        description: formData.get("description") as string,
        amount: Number.parseFloat(formData.get("amount") as string),
        date: date.toISOString(),
        type: transactionType as "GANHO" | "GASTO",
        categoryId: formData.get("category") as string,
        notes: (formData.get("notes") as string) || undefined,
      };

      await createTransaction(transactionData);

      toast({
        title: "Transação criada",
        description: "Sua transação foi criada com sucesso.",
      });

      router.push("/transactions");
      router.refresh(); // Atualiza a página para mostrar a nova transação
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Falha ao criar transação",
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
            <Link href="/transactions">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <div className="ml-4 flex items-center gap-2 font-semibold">
            <span className="text-lg">Nova Transação</span>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Adicionar Nova Transação</CardTitle>
            <CardDescription>Registre uma nova ganho ou gasto</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Transação</Label>
                <RadioGroup
                  defaultValue="GASTO"
                  className="flex gap-4"
                  onValueChange={setTransactionType}
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <DatePicker
                  date={date}
                  setDate={(newDate) => newDate && setDate(newDate)}
                />
                {/* Input oculto para incluir a data no envio do formulário */}
                <input type="hidden" name="date" value={date.toISOString()} />
              </div>

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
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Detalhes adicionais..."
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/transactions")}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || categoriesLoading}>
                {isLoading ? "Salvando..." : "Salvar Transação"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
