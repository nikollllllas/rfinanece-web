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
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { createCategory } from "@/lib/api";

export default function NewCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [color, setColor] = useState("#6366f1"); // Default color

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const categoryData = {
        name: formData.get("name") as string,
        color: formData.get("color") as string,
        type: formData.get("type") as "GANHO" | "GASTO" | "AMBOS",
        icon: (formData.get("icon") as string) || undefined,
        isDefault: false,
      };

      await createCategory(categoryData);

      toast({
        title: "Categoria criada",
        description: "Sua categoria foi criada com sucesso.",
      });

      router.push("/categories");
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Falha ao criar categoria",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Common colors for financial categories
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
            <span className="text-lg">Nova Categoria</span>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Adicionar Nova Categoria</CardTitle>
            <CardDescription>
              Crie uma categoria para organizar suas transações
            </CardDescription>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Categoria</Label>
                <Select required name="type" defaultValue="GASTO">
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GANHO">Ganho</SelectItem>
                    <SelectItem value="GASTO">Gasto</SelectItem>
                    <SelectItem value="AMBOS">Ambos</SelectItem>
                  </SelectContent>
                </Select>
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
                        className="w-6 h-6 rounded-full border border-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Categoria"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
