"use client"

import { setConfig } from "@kubb/plugin-client/clients/axios"

/** Produção hospedada no Render; sobrescreva com NEXT_PUBLIC_API_BASE_URL para API local. */
const DEFAULT_API_BASE_URL = "https://rfinance-api.onrender.com"

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "")

const rawFromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
const apiBaseUrl =
  rawFromEnv && rawFromEnv.length > 0
    ? normalizeBaseUrl(rawFromEnv)
    : DEFAULT_API_BASE_URL

export const kubbClientConfig = {
  baseURL: apiBaseUrl,
  withCredentials: true,
}

export const initKubbClient = () => {
  setConfig(kubbClientConfig)
}

