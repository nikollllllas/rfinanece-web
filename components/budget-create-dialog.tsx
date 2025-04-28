"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCategories } from "@/hooks/use-categories"
import { createBudget } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BudgetCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function BudgetCreateDialog({ open, onOpenChange, onSuccess }: BudgetCreateDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { categories, isLoading: categoriesLoading } = useCategories()

  const [amount, setAmount] = useState("")
  const [period, setPeriod] = useState<string>("MENSAL")
  const [categoryId, setCategoryId] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [showEndDate, setShowEndDate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const expenseCategories = categories.filter((category) => category.type === "GASTO" || category.type === "AMBOS")

  const handlePeriodChange = (value: string) => {
    setPeriod(value)
    setShowEndDate(value === "PERSONALIZADO")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const budgetData = {
        amount: Number.parseFloat(amount),
        period: period as any,
        startDate: startDate.toISOString(),
        endDate: showEndDate && endDate ? endDate.toISOString() : undefined,
        categoryId,
      }

      await createBudget(budgetData)

      toast({
        title: "Orçamento criado",
        description: "Seu orçamento foi criado com sucesso.",
      })

      setAmount("")
      setPeriod("MENSAL")
      setCategoryId("")
      setStartDate(new Date())
      setEndDate(undefined)
      setShowEndDate(false)

      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Erro ao criar orçamento:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao criar orçamento",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Orçamento</DialogTitle>
          <DialogDescription>Defina um limite de gastos para uma categoria</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select required name="category" value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>
                      Carregando categorias...
                    </SelectItem>
                  ) : expenseCategories.length > 0 ? (
                    expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Nenhuma categoria disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor do Orçamento</Label>
              <div className="relative">
                <span className="absolute left-3 top-1.5">R$</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  className="pl-9"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Select required name="period" value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger id="period">
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIARIO">Diário</SelectItem>
                  <SelectItem value="SEMANAL">Semanal</SelectItem>
                  <SelectItem value="MENSAL">Mensal</SelectItem>
                  <SelectItem value="QUARTENAL">Trimestral</SelectItem>
                  <SelectItem value="ANUAL">Anual</SelectItem>
                  <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <DatePicker date={startDate} setDate={(newDate) => newDate && setStartDate(newDate)} />
              <input type="hidden" name="startDate" value={startDate.toISOString()} />
            </div>

            {showEndDate && (
              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Término</Label>
                <DatePicker date={endDate} setDate={setEndDate} />
                {endDate && <input type="hidden" name="endDate" value={endDate.toISOString()} />}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || categoriesLoading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Orçamento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
