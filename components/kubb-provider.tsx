"use client"

import { useEffect, type ReactNode } from "react"
import { initKubbClient } from "@/lib/kubb-client"

export const KubbProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    initKubbClient()
  }, [])

  return <>{children}</>
}

