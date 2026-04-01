"use client"

import { useCallback } from "react"
import { type Category, type CategoryData } from "@/lib/api-types"
import { useCategoriesControllerList } from "@/lib/api/categories/hooks/use-categories-controller-list"
import { useCategoriesControllerCreate } from "@/lib/api/categories/hooks/use-categories-controller-create"
import { useCategoriesControllerUpdate } from "@/lib/api/categories/hooks/use-categories-controller-update"
import { useCategoriesControllerRemove } from "@/lib/api/categories/hooks/use-categories-controller-remove"
import { kubbClientConfig } from "@/lib/kubb-client"
import { useToast } from "@/hooks/use-toast"

export function useCategories() {
  const { toast } = useToast()
  const categoriesQuery = useCategoriesControllerList({
    client: kubbClientConfig,
  })
  const createMutation = useCategoriesControllerCreate({
    client: kubbClientConfig,
  })
  const updateMutation = useCategoriesControllerUpdate({
    client: kubbClientConfig,
  })
  const removeMutation = useCategoriesControllerRemove({
    client: kubbClientConfig,
  })

  const categories = (categoriesQuery.data ?? []) as Category[]

  const addCategory = useCallback(
    async (data: CategoryData) => {
      try {
        const newCategory = await createMutation.mutateAsync({ data })
        await categoriesQuery.refetch()
        toast({
          title: "Success",
          description: "Category created successfully",
        })
        return newCategory
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to create category",
          variant: "destructive",
        })
        throw err
      }
    },
    [createMutation, categoriesQuery, toast],
  )

  const editCategory = useCallback(
    async (id: string, data: Partial<CategoryData>) => {
      try {
        const updatedCategory = await updateMutation.mutateAsync({ id, data })
        await categoriesQuery.refetch()
        toast({
          title: "Success",
          description: "Category updated successfully",
        })
        return updatedCategory
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to update category",
          variant: "destructive",
        })
        throw err
      }
    },
    [updateMutation, categoriesQuery, toast],
  )

  const removeCategory = useCallback(
    async (id: string) => {
      try {
        await removeMutation.mutateAsync({ id })
        await categoriesQuery.refetch()
        toast({
          title: "Success",
          description: "Category deleted successfully",
        })
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to delete category",
          variant: "destructive",
        })
        throw err
      }
    },
    [removeMutation, categoriesQuery, toast],
  )

  return {
    categories,
    isLoading: categoriesQuery.isLoading,
    error: (categoriesQuery.error as Error | null) ?? null,
    refreshCategories: async () => {
      await categoriesQuery.refetch()
    },
    addCategory,
    editCategory,
    removeCategory,
    // Helper functions
    getCategoryById: useCallback((id: string) => categories.find((c) => c.id === id), [categories]),
    getIncomeCategories: useCallback(
      () => categories.filter((c) => c.type === "GANHO" || c.type === "AMBOS"),
      [categories],
    ),
    getExpenseCategories: useCallback(
      () => categories.filter((c) => c.type === "GASTO" || c.type === "AMBOS"),
      [categories],
    ),
  }
}

