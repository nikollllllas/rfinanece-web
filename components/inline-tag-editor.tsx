"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { updateTransaction } from "@/lib/api";

interface InlineTagEditorProps {
  transactionId: string;
  currentTag: string | null;
  onSuccess?: () => void;
}

export function InlineTagEditor({
  transactionId,
  currentTag,
  onSuccess,
}: InlineTagEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const tagOptions = [
    { value: null, label: "Sem status", variant: "gray" },
    { value: "FALTA", label: "Falta", variant: "destructive" },
    {
      value: "PAGO",
      label: "Pago",
      variant: "success",
    },
    {
      value: "DEVOLVER",
      label: "Devolver",
      variant: "warning",
    },
    { value: "ECONOMIA", label: "Economia", variant: "success" },
  ];

  const getCurrentTagDisplay = () => {
    const tagOption = tagOptions.find((option) => option.value === currentTag);
    if (!tagOption) return null;

    return <Badge variant={tagOption.variant as any}>{tagOption.label}</Badge>;
  };

  const handleTagChange = async (
    newTag: "FALTA" | "PAGO" | "DEVOLVER" | "ECONOMIA" | null
  ) => {
    if (newTag === currentTag) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateTransaction(transactionId, { tag: newTag });

      toast({
        title: "Status atualizado",
        description: "O status da transação foi atualizado com sucesso.",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Falha ao atualizar status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {isUpdating ? (
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-xs">Atualizando...</span>
        </div>
      ) : (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2 flex items-center gap-1 hover:bg-accent",
                !currentTag && "text-muted-foreground"
              )}
            >
              {getCurrentTagDisplay()}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-fit space-y-1">
            {tagOptions.map((option) => (
              <DropdownMenuItem
                key={option.value || "none"}
                disabled={option.value === currentTag}
                className={cn(
                  "flex items-center gap-2 cursor-pointer p-0",
                  option.value === currentTag && "bg-accent"
                )}
                onClick={() =>
                  handleTagChange(
                    option.value as
                      | "FALTA"
                      | "PAGO"
                      | "DEVOLVER"
                      | "ECONOMIA"
                      | null
                  )
                }
              >
                <Badge variant={option.variant as any} className="flex gap-1 w-full rounded justify-between"> 
                  {option.label}
                  {option.value === currentTag && <Check className="size-3" />}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
