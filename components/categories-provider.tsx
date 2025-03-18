"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error("Falha ao carregar categorias");
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Um erro desconhecido aconteceu")
      );
      console.error("Erro ao carregar categorisa:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
