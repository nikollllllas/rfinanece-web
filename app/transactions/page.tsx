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
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatCurrency, formatDate, formatMonthDisplay } from "@/lib/utils"
import { useTransactions } from "@/hooks/use-transactions"
import { useAvailableMonths } from "@/hooks/use-available-months";
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
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const {
    transactions,
    isLoading,
    error,
    removeTransaction,
    refreshTransactions,
  } = useTransactions(selectedMonth)
  
  const { months: availableMonths } = useAvailableMonths()
  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTransactionChanged = () => {
    refreshTransactions();
    setRefreshKey((prev) => prev + 1);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
  }

  const SkeletonTable = () => (
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
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-20 md:h-14 items-center px-4 py-2 md:py-0 md:px-6 flex-col md:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-lg">Transações</span>
          </div>
          <div className="md:ml-auto flex items-center gap-2 flex-col md:flex-row">
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {formatMonthDisplay(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)} className="hidden md:block">
              Nova Transação
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col gap-4">
          {isLoading && transactions.length === 0 ? (
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
          ) : transactions.length === 0 ? (
            <div className="rounded-md border p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhuma transação encontrada para {formatMonthDisplay(selectedMonth)}.
              </p>
              <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                Adicionar Nova Transação
              </Button>
            </div>
          ) : (
            <>
              {isLoading ? <SkeletonTable /> : (
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
                    {transactions.map((transaction) => (
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
                    <TableRow className="w-full">
                      <TableCell colSpan={4} className="text-right">
                        <span className="font-medium">
                          Total de Gastos: {' '}
                        </span>
                        <span>
                          {formatCurrency(transactions.reduce((acc, transaction) => acc + Number(transaction.category?.type === "GASTO" ? transaction.amount : 0), 0))}
                        </span>
                      </TableCell>
                      <TableCell colSpan={2} className="text-right">
                        <span className="font-medium">
                          Total movimentado no mês: {' '}
                        </span>
                        <span>
                          {formatCurrency(transactions.reduce((acc, transaction) => acc + Number(transaction.amount), 0))}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                </div>
              )}
            </>
          )}
        </div>
      </main>

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
