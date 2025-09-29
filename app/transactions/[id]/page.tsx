"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getTransaction, deleteTransaction } from "@/lib/api";
import { useCategories } from "@/hooks/use-categories";
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

export default function TransactionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { categories } = useCategories();

  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Ensure id is a string
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

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

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await deleteTransaction(id);
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso",
      });
      router.push("/transactions");
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao excluir transação",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  const category = transaction?.categoryId
    ? categories.find((c) => c.id === transaction.categoryId)
    : null;

  if (isLoading) {
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
              <span className="text-lg">Detalhes da Transação</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2">Carregando detalhes da transação...</p>
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
              <span className="text-lg">Detalhes da Transação</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 flex justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Erro</CardTitle>
              <CardDescription>
                Não foi possível carregar os detalhes da transação
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
            <Link href="/transactions">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <div className="ml-4 flex items-center gap-2 font-semibold">
            <span className="text-lg">Detalhes da Transação</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/transactions/${id}/edit`}>
                <Pencil className="mr-1 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-1 h-4 w-4" />
                      Excluir
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente esta transação.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">
                  {transaction.description}
                </CardTitle>
                <CardDescription>
                  {new Intl.DateTimeFormat("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(transaction.date))}
                </CardDescription>
              </div>
              <div
                className={cn(
                  "text-2xl font-bold",
                  transaction.type === "GANHO"
                    ? "text-green-600"
                    : "text-red-600"
                )}
              >
                {transaction.type === "GANHO" ? "+" : "-"}
                {formatCurrency(Math.abs(Number(transaction.amount)))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Tipo
                </h3>
                <p className="font-medium">
                  {transaction.type === "GANHO" ? "GANHO" : "Gasto"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Categoria
                </h3>
                <div className="flex items-center">
                  {category && (
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                  <p className="font-medium">
                    {category?.name || "Desconhecida"}
                  </p>
                </div>
              </div>
            </div>

            {transaction.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Observações
                  </h3>
                  <p className="whitespace-pre-wrap">{transaction.notes}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Criado em
                </h3>
                <p>
                  {new Intl.DateTimeFormat("pt-BR", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  }).format(new Date(transaction.createdAt))}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Última Atualização
                </h3>
                <p>
                  {new Intl.DateTimeFormat("pt-BR", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  }).format(new Date(transaction.updatedAt))}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/transactions">Voltar para Transações</Link>
            </Button>
            <Button asChild>
              <Link href={`/transactions/${id}/edit`}>
                <Pencil className="mr-1 h-4 w-4" />
                Editar Transação
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
