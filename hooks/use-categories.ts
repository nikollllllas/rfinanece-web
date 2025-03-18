"use client"

import { useCallback, useEffect, useState } from "react"
import {
  type Category,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryData,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch categories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const addCategory = useCallback(
    async (data: CategoryData) => {
      try {
        const newCategory = await createCategory(data)
        setCategories((prev) => [...prev, newCategory])
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
    [toast],
  )

  const editCategory = useCallback(
    async (id: string, data: Partial<CategoryData>) => {
      try {
        const updatedCategory = await updateCategory(id, data)
        setCategories((prev) => prev.map((category) => (category.id === id ? updatedCategory : category)))
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
    [toast],
  )

  const removeCategory = useCallback(
    async (id: string) => {
      try {
        await deleteCategory(id)
        setCategories((prev) => prev.filter((category) => category.id !== id))
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
    [toast],
  )

  return {
    categories,
    isLoading,
    error,
    refreshCategories: fetchCategories,
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

