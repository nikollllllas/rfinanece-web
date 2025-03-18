"use client"

import type React from "react"

// Assuming you already have this file from shadcn/ui
// If not, this is a simplified version

import { useState, useCallback } from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
  id?: string
  action?: React.ReactNode // Add this line
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(
    ({ title, description, variant = "default", duration = 5000, action }: Omit<ToastProps, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, title, description, variant, duration, action }])

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, duration)
    },
    [],
  )

  return { toast, toasts }
}

