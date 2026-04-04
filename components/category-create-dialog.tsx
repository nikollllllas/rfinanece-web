"use client";

import type React from "react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { categoriesControllerCreate } from "@/lib/api/categories/categories-controller-create";
import { kubbClientConfig } from "@/lib/kubb-client";
import { CategoryColorPicker } from "@/components/category-color-picker";
import { CategoryIconPicker } from "@/components/category-icon-picker";

interface CategoryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CategoryCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: CategoryCreateDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"GANHO" | "GASTO" | "AMBOS">("GASTO");
  const [color, setColor] = useState("#6366f1");
  const [icon, setIcon] = useState("");

  const resetForm = () => {
    setName("");
    setType("GASTO");
    setColor("#6366f1");
    setIcon("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await categoriesControllerCreate(
        {
          name,
          color,
          type,
          icon: icon || undefined,
          isDefault: false,
        } as any,
        kubbClientConfig
      );

      toast({
        title: "Categoria criada",
        description: "Sua categoria foi criada com sucesso.",
      });

      handleOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Falha ao criar categoria",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Crie uma nova categoria para organizar suas transações.
          </DialogDescription>
        </DialogHeader>

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
                onChange={(event) => setName(event.target.value)}
                disabled={isSaving}
              />
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
                disabled={isSaving}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <CategoryColorPicker color={color} onColorChange={setColor} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Ícone (Opcional)</Label>
              <CategoryIconPicker icon={icon} onIconChange={setIcon} />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => handleOpenChange(false)}
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
                "Salvar Categoria"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
