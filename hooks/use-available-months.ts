"use client"

import { useState, useEffect } from "react"

export function useAvailableMonths() {
  const [months, setMonths] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/transactions/months')
        if (!response.ok) {
          throw new Error('Failed to fetch available months')
        }
        const data = await response.json()
        setMonths(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An unknown error occurred"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchMonths()
  }, [])

  return { months, isLoading, error }
}
