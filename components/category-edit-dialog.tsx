"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCategory, updateCategory } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryEditDialogProps {
  categoryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CategoryEditDialog({
  categoryId,
  open,
  onOpenChange,
  onSuccess,
}: CategoryEditDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [category, setCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<"GANHO" | "GASTO" | "AMBOS">("GASTO");
  const [color, setColor] = useState("#000000");
  const [icon, setIcon] = useState("");

  // Load category data
  useEffect(() => {
    if (!open || !categoryId) return;

    async function loadCategory() {
      try {
        setIsLoading(true);
        const data = await getCategory(categoryId);
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
        onOpenChange(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategory();
  }, [categoryId, open, toast, onOpenChange]);

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

    if (!categoryId) {
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

      await updateCategory(categoryId, categoryData);

      toast({
        title: "Categoria atualizada",
        description: "Sua categoria foi atualizada com sucesso.",
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Atualize os detalhes da categoria
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2">Carregando categoria...</p>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-destructive">Erro ao carregar categoria</p>
            <Button className="mt-4" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="ex: Alimentação, Transporte, Salário"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={category?.isDefault}
                />
                {category?.isDefault && (
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
                  disabled={category?.isDefault}
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
                {category?.isDefault && (
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
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
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
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
