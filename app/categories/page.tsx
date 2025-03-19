"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@/hooks/use-categories";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
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
import { Badge } from "@/components/ui/badge";
import { CategoryEditDialog } from "@/components/category-edit-dialog";

export default function CategoriesPage() {
  const { categories, isLoading, error, removeCategory, refreshCategories } =
    useCategories();
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await removeCategory(id);
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir a categoria. Ela pode estar sendo usada em transações.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCategoryChanged = () => {
    refreshCategories();
    setRefreshKey((prev) => prev + 1);
  };

  // Get category type label
  const getCategoryTypeLabel = (type: string | undefined) => {
    switch (type) {
      case "GANHO":
        return "Ganho";
      case "GASTO":
        return "Gasto";
      case "AMBOS":
        return "Ambos";
      default:
        return "Desconhecido";
    }
  };

  // Get category type color
  const getCategoryTypeColor = (type: string | undefined) => {
    switch (type) {
      case "GANHO":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case "GASTO":
        return "bg-red-100 text-red-800 hover:bg-red-100/80";
      case "AMBOS":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 md:px-6">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-lg">Categorias</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button asChild size="sm">
                <Link href="/categories/new">
                  <Plus className="mr-1 h-4 w-4" />
                  Nova Categoria
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2">Carregando categorias...</p>
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
            <span className="text-lg">Categorias</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/categories/new">
                <Plus className="mr-1 h-4 w-4" />
                Nova Categoria
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        {error ? (
          <div className="rounded-md border border-destructive p-4 text-center">
            <p className="text-destructive">
              Erro ao carregar categorias. Por favor, tente novamente.
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <p className="text-muted-foreground mb-4">
              Nenhuma categoria encontrada.
            </p>
            <Button asChild>
              <Link href="/categories/new">
                <Plus className="mr-1 h-4 w-4" />
                Criar Nova Categoria
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card
                key={`${category.id}-${refreshKey}`}
                className="overflow-hidden flex flex-col justify-between"
              >
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <Badge className={getCategoryTypeColor(category.type)}>
                    {getCategoryTypeLabel(category.type)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCategoryId(category.id)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={!!deletingId || category.isDefault}
                        >
                          {deletingId === category.id ? (
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
                            permanentemente a categoria &quot;
                            {category.name}&quot;.
                            {category.isDefault && (
                              <p className="mt-2 text-destructive font-semibold">
                                Esta é uma categoria padrão e não pode ser
                                excluída.
                              </p>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(category.id)}
                            className="bg-destructive text-destructive-foreground"
                            disabled={category.isDefault}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="flex flex-col items-center justify-center p-6 border-dashed">
              <Button asChild variant="outline" className="h-auto p-8 w-full">
                <Link
                  href="/categories/new"
                  className="flex flex-col items-center gap-2"
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-lg font-medium">Nova Categoria</span>
                  <span className="text-sm text-muted-foreground text-center">
                    Crie uma nova categoria
                  </span>
                </Link>
              </Button>
            </Card>
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      {editingCategoryId && (
        <CategoryEditDialog
          categoryId={editingCategoryId}
          open={!!editingCategoryId}
          onOpenChange={(open) => {
            if (!open) setEditingCategoryId(null);
          }}
          onSuccess={handleCategoryChanged}
        />
      )}
    </div>
  );
}
