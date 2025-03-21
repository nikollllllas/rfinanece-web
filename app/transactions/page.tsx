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
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import type { Transaction } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TransactionEditDialog } from "@/components/transaction-edit-dialog";
import { Badge } from "@/components/ui/badge";
import { TransactionCreateDialog } from "@/components/transaction-create-dialog";
import { InlineTagEditor } from "@/components/inline-tag-editor";

export default function TransactionsPage() {
  const {
    transactions,
    isLoading,
    error,
    removeTransaction,
    refreshTransactions,
  } = useTransactions();
  const { categories } = useCategories();
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("AMBOS");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [tagFilter, setTagFilter] = useState("all");
  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateString));
  };

  const handleTransactionChanged = () => {
    refreshTransactions();
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (!transactions) return;

    let result = [...transactions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(query) ||
          t.category?.name.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== "AMBOS") {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter((t) => t.categoryId === categoryFilter);
    }

    if (tagFilter !== "all") {
      if (tagFilter === "none") {
        result = result.filter((t) => !t.tag);
      } else {
        result = result.filter((t) => t.tag === tagFilter);
      }
    }

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
  }, [
    transactions,
    searchQuery,
    typeFilter,
    categoryFilter,
    tagFilter,
    sortOrder,
    refreshKey,
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-lg">Transações</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              Nova Transação
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
                defaultValue="AMBOS"
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tipo de Transação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AMBOS">Todas as Transações</SelectItem>
                  <SelectItem value="GANHO">Ganhos</SelectItem>
                  <SelectItem value="GASTO">Gastos</SelectItem>
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
                defaultValue="all"
                value={tagFilter}
                onValueChange={setTagFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="none">Sem Status</SelectItem>
                  <SelectItem value="FALTA">Falta</SelectItem>
                  <SelectItem value="PAGO">Pago</SelectItem>
                  <SelectItem value="DEVOLVER">Devolver</SelectItem>
                  <SelectItem value="ECONOMIA">Economia</SelectItem>
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
              <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                Adicionar Nova Transação
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
                    <TableHead>Tag</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={`${transaction.id}-${refreshKey}`}>
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        {transaction.category?.name || "Sem categoria"}
                      </TableCell>
                      <TableCell>
                        {formatDate(transaction.date.toString())}
                      </TableCell>
                      <TableCell>
                        <InlineTagEditor
                          transactionId={transaction.id}
                          currentTag={transaction.tag ?? null}
                          onSuccess={handleTransactionChanged}
                        />
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
                            {transaction.type === "GANHO" ? "+" : "-"}
                            {formatCurrency(Number(transaction.amount))}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setEditingTransactionId(transaction.id)
                            }
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Tem certeza?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isso excluirá
                                  permanentemente esta transação.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    removeTransaction(transaction.id)
                                  }
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* Edit Dialog */}
      {editingTransactionId && (
        <TransactionEditDialog
          transactionId={editingTransactionId}
          open={!!editingTransactionId}
          onOpenChange={(open) => {
            if (!open) setEditingTransactionId(null);
          }}
          onSuccess={handleTransactionChanged}
        />
      )}

      <TransactionCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleTransactionChanged}
      />
    </div>
  );
}
