"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Loader2, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { useBudgets, useBudgetProgress } from "@/hooks/use-budgets";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
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
import { BudgetEditDialog } from "@/components/budget-edit-dialog";

// Update the BudgetCard component to include edit and delete buttons
function BudgetCard({
  budget,
  onDeleted,
}: {
  budget: any;
  onDeleted?: () => void;
}) {
  const { progress, isLoading, error } = useBudgetProgress(budget.id);
  const router = useRouter();
  const { toast } = useToast();
  const { removeBudget } = useBudgets();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateString));
  };

  // Format budget period
  const formatPeriod = (period: string) => {
    const periods: Record<string, string> = {
      DIÁRIO: "Diário",
      SEMANAL: "Semanal",
      MENSAL: "Mensal",
      QUARTENAL: "Trimestral",
      ANUAL: "Anual",
      PERSONALIZADO: "Personalizado",
    };
    return periods[period] || period;
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await removeBudget(budget.id);
      toast({
        title: "Sucesso",
        description: "Orçamento excluído com sucesso",
      });
      if (onDeleted) onDeleted();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Falha ao excluir orçamento",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {budget.category?.name || "Carregando..."}
            </CardTitle>
            <span className="text-sm font-medium">...</span>
          </div>
          <CardDescription>
            {formatCurrency(Number(budget.amount))} •{" "}
            {formatPeriod(budget.period)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {budget.category?.name || "Erro"}
          </CardTitle>
          <CardDescription>
            {formatCurrency(Number(budget.amount))} •{" "}
            {formatPeriod(budget.period)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">
            Erro ao carregar progresso
          </div>
        </CardContent>
      </Card>
    );
  }

  const { percentage, isOverBudget } = progress;

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{budget.category?.name}</CardTitle>
            <span
              className={`text-sm font-medium ${
                isOverBudget ? "text-red-500" : ""
              }`}
            >
              {percentage}%
            </span>
          </div>
          <CardDescription>
            {formatCurrency(Number(budget.amount))} •{" "}
            {formatPeriod(budget.period)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress
            value={percentage}
            className={`h-2 ${isOverBudget ? "bg-red-100" : "bg-gray-100"}`}
            indicatorClassName={
              isOverBudget ? "bg-red-500" : budget.category?.color
            }
          />
          <div className="mt-2 text-xs text-muted-foreground flex justify-between">
            <span>
              Válido a partir de: {formatDate(budget.startDate.toString())}
            </span>
            {isOverBudget && (
              <span className="text-red-500">Acima do orçamento</span>
            )}
          </div>
          <div className="mt-1 text-sm">
            <span className={isOverBudget ? "text-red-500 font-medium" : ""}>
              {formatCurrency(progress.current)} /{" "}
              {formatCurrency(Number(budget.amount))}
            </span>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente este orçamento.
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
        </CardContent>
      </Card>

      <BudgetEditDialog
        budgetId={budget.id}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={onDeleted}
      />
    </>
  );
}

export default function BudgetsPage() {
  const { budgets, isLoading, error, refreshBudgets } = useBudgets();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBudgetChanged = () => {
    refreshBudgets();
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 md:px-6">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-lg">Orçamentos</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button asChild size="sm">
                <Link href="/budgets/new">
                  <Plus className="mr-1 h-4 w-4" />
                  Novo Orçamento
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2">Carregando orçamentos...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-lg">Orçamentos</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/budgets/new">
                <Plus className="mr-1 h-4 w-4" />
                Novo Orçamento
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        {error ? (
          <div className="rounded-md border border-destructive p-4 text-center">
            <p className="text-destructive">
              Erro ao carregar orçamentos. Por favor, tente novamente.
            </p>
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <p className="text-muted-foreground mb-4">
              Nenhum orçamento encontrado.
            </p>
            <Button asChild>
              <Link href="/budgets/new">
                <Plus className="mr-1 h-4 w-4" />
                Criar Novo Orçamento
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <BudgetCard
                key={`${budget.id}-${refreshKey}`}
                budget={budget}
                onDeleted={handleBudgetChanged}
              />
            ))}

            <Card className="flex flex-col items-center justify-center p-6 border-dashed">
              <Button asChild variant="outline" className="h-auto p-8 w-full">
                <Link
                  href="/budgets/new"
                  className="flex flex-col items-center gap-2"
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-lg font-medium">Novo Orçamento</span>
                  <span className="text-sm text-muted-foreground text-center">
                    Crie um novo orçamento
                  </span>
                </Link>
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
