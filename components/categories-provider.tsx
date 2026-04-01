"use client";

import type React from "react";

import { createContext, useContext } from "react";
import { useCategoriesControllerList } from "@/lib/api/categories/hooks/use-categories-controller-list";
import { kubbClientConfig } from "@/lib/kubb-client";

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  type?: "GANHO" | "GASTO" | "AMBOS";
}

interface CategoriesContextType {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType>({
  categories: [],
  isLoading: false,
  error: null,
  refreshCategories: async () => {},
});

export const useCategories = () => useContext(CategoriesContext);

export function CategoriesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoriesQuery = useCategoriesControllerList({
    client: kubbClientConfig,
  });
  const categories = (categoriesQuery.data ?? []) as Category[];
  const isLoading = categoriesQuery.isLoading;
  const error = (categoriesQuery.error as Error | null) ?? null;
  const fetchCategories = async () => {
    await categoriesQuery.refetch();
  };

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        isLoading,
        error,
        refreshCategories: fetchCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}
