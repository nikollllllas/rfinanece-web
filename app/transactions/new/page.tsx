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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DatePicker } from "@/components/ui/date-picker";

export default function NewTransactionPage() {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState("expense");
  const [date, setDate] = useState<Date>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save the transaction to your database here

    // Navigate back to transactions page
    router.push("/transactions");
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
            <span className="text-lg">Nova transação</span>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Adicionar Nova transação</CardTitle>
            <CardDescription>
              Registre uma nova transação para manter seu orçamento atualizado.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de transação</Label>
                <RadioGroup
                  defaultValue="expense"
                  className="flex gap-4"
                  onValueChange={setTransactionType}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense" className="cursor-pointer">
                      Gasto
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
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
                  placeholder="ex: Mercado, Salário..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    R$
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 flex flex-col">
                <Label htmlFor="date">Data</Label>
                <DatePicker
                  date={date}
                  setDate={(newDate) => newDate && setDate(newDate)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  required
                  defaultValue={
                    transactionType === "income" ? "income" : "food"
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Seleciona uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionType === "income" ? (
                      <>
                        <SelectItem value="income">Ganho</SelectItem>
                        <SelectItem value="salary">Salário</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="investment">
                          Investimentos
                        </SelectItem>
                        <SelectItem value="gift">Presente</SelectItem>
                        <SelectItem value="other_income">Outros</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="food">Comida</SelectItem>
                        <SelectItem value="housing">Casa</SelectItem>
                        <SelectItem value="transportation">
                          Transporte
                        </SelectItem>
                        <SelectItem value="utilities">Utilidades</SelectItem>
                        <SelectItem value="entertainment">
                          Entretenimento
                        </SelectItem>
                        <SelectItem value="shopping">Comprinhas</SelectItem>
                        <SelectItem value="health">Saúde</SelectItem>
                        <SelectItem value="education">Educação</SelectItem>
                        <SelectItem value="personal">Pessoal</SelectItem>
                        <SelectItem value="other_expense">Outros</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Input id="notes" placeholder="Detalhes adicionais..." />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/transactions")}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar transação</Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
