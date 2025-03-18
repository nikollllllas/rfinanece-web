"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Plus,
  Search,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import type { Transaction } from "@/lib/api";

export default function TransactionsPage() {
  const { transactions, isLoading, error } = useTransactions();
  const { categories } = useCategories();
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  // Format currency in Brazilian Real
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  // Format date in Brazilian format
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateString));
  };

  // Filter and sort transactions
  useEffect(() => {
    if (!transactions) return;

    let result = [...transactions];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.category?.name.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((t) => t.categoryId === categoryFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "highest":
          return Number(b.amount) - Number(a.amount);
        case "lowest":
          return Number(a.amount) - Number(b.amount);
        default:
          return 0;
      }
    });

    setFilteredTransactions(result);
  }, [transactions, searchQuery, typeFilter, categoryFilter, sortOrder]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-lg">Transações</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/transactions/new">
                <Plus className="mr-1 h-4 w-4" />
                Nova Transação
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar transações..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                defaultValue="all"
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tipo de Transação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Transações</SelectItem>
                  <SelectItem value="INCOME">GANHOs</SelectItem>
                  <SelectItem value="EXPENSE">Gastos</SelectItem>
                </SelectContent>
              </Select>
              <Select
                defaultValue="all"
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                defaultValue="newest"
                value={sortOrder}
                onValueChange={setSortOrder}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Ordenar Por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais Recentes</SelectItem>
                  <SelectItem value="oldest">Mais Antigas</SelectItem>
                  <SelectItem value="highest">Maior Valor</SelectItem>
                  <SelectItem value="lowest">Menor Valor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Carregando transações...</span>
            </div>
          ) : error ? (
            <div className="rounded-md border border-destructive p-4 text-center">
              <p className="text-destructive">
                Erro ao carregar transações. Por favor, tente novamente.
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="rounded-md border p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhuma transação encontrada.
              </p>
              <Button asChild>
                <Link href="/transactions/new">
                  <Plus className="mr-1 h-4 w-4" />
                  Adicionar Nova Transação
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        {transaction.category?.name || "Sem categoria"}
                      </TableCell>
                      <TableCell>
                        {formatDate(transaction.date.toString())}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {transaction.type === "GANHO" ? (
                            <ArrowUpIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={cn(
                              "font-medium",
                              transaction.type === "GANHO"
                                ? "text-green-600"
                                : "text-red-600"
                            )}
                          >
                            {transaction.type === "GANHO" ? "+" : ""}
                            {formatCurrency(Number(transaction.amount))}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
