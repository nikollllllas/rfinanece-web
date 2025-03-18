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
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { getCategory, updateCategory } from "@/lib/api";

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const [category, setCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<"GANHO" | "GASTO" | "AMBOS">("GASTO");
  const [color, setColor] = useState("#000000");
  const [icon, setIcon] = useState("");

  // Load category data
  useEffect(() => {
    if (!id) {
      setError(new Error("ID da categoria inválido"));
      setIsLoading(false);
      return;
    }

    async function loadCategory() {
      try {
        setIsLoading(true);
        const data = await getCategory(id);
        setCategory(data);

        // Set form values
        setName(data.name);
        setType(data.type || "GASTO");
        setColor(data.color);
        setIcon(data.icon || "");
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Falha ao carregar categoria")
        );
        toast({
          title: "Erro",
          description: "Falha ao carregar detalhes da categoria",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadCategory();
  }, [id, toast]);

  const presetColors = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#84cc16", // lime
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#d946ef", // fuchsia
    "#ec4899", // pink
    "#64748b", // slate
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id) {
      toast({
        title: "Erro",
        description: "ID da categoria inválido",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const categoryData = {
        name,
        type,
        color,
        icon: icon || undefined,
      };

      await updateCategory(id, categoryData);

      toast({
        title: "Categoria atualizada",
        description: "Sua categoria foi atualizada com sucesso.",
      });

      router.push("/categories");
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Falha ao atualizar categoria",
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
              <Link href="/categories">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Link>
            </Button>
            <div className="ml-4 flex items-center gap-2 font-semibold">
              <span className="text-lg">Editar Categoria</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2">Carregando categoria...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 md:px-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/categories">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Link>
            </Button>
            <div className="ml-4 flex items-center gap-2 font-semibold">
              <span className="text-lg">Editar Categoria</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 flex justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Erro</CardTitle>
              <CardDescription>
                Não foi possível carregar a categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>A categoria pode ter sido excluída ou ocorreu um erro.</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/categories">Voltar para Categorias</Link>
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
            <Link href="/categories">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <div className="ml-4 flex items-center gap-2 font-semibold">
            <span className="text-lg">Editar Categoria</span>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Editar Categoria</CardTitle>
            <CardDescription>Atualize os detalhes da categoria</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="ex: Alimentação, Transporte, Salário"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={category.isDefault}
                />
                {category.isDefault && (
                  <p className="text-xs text-muted-foreground">
                    Esta é uma categoria padrão. O nome não pode ser alterado.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Categoria</Label>
                <Select
                  required
                  name="type"
                  value={type}
                  onValueChange={(value) =>
                    setType(value as "GANHO" | "GASTO" | "AMBOS")
                  }
                  disabled={category.isDefault}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GANHO">Ganho</SelectItem>
                    <SelectItem value="GASTO">Gasto</SelectItem>
                    <SelectItem value="AMBOS">Ambos</SelectItem>
                  </SelectContent>
                </Select>
                {category.isDefault && (
                  <p className="text-xs text-muted-foreground">
                    Esta é uma categoria padrão. O tipo não pode ser alterado.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <div className="flex-1 grid grid-cols-6 gap-2">
                    {presetColors.map((presetColor) => (
                      <button
                        key={presetColor}
                        type="button"
                        className="w-6 h-6 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        style={{ backgroundColor: presetColor }}
                        onClick={() => setColor(presetColor)}
                        aria-label={`Selecionar cor ${presetColor}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Ícone (Opcional)</Label>
                <Input
                  id="icon"
                  name="icon"
                  placeholder="Nome do ícone (ex: Home, ShoppingBag)"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use nomes de ícones do Lucide React (ShoppingBag, Home, Car,
                  etc.)
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/categories")}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
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
