"use client"

import { useState, useCallback } from "react"
import { ApiError } from "@/lib/api"

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: ApiError) => void
}

export function useApi<T, P = any>(apiFunction: (params: P) => Promise<T>, options: UseApiOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const execute = useCallback(
    async (params: P) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await apiFunction(params)
        setData(result)
        options.onSuccess?.(result)
        return result
      } catch (err) {
        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError(err instanceof Error ? err.message : "An unknown error occurred", 500)

        setError(apiError)
        options.onError?.(apiError)
        throw apiError
      } finally {
        setIsLoading(false)
      }
    },
    [apiFunction, options],
  )

  return {
    data,
    isLoading,
    error,
    execute,
  }
}

