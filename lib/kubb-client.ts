"use client"

import { AxiosHeaders } from "axios"
import {
  axiosInstance,
  setConfig,
} from "@kubb/plugin-client/clients/axios"
import { getAuthTokenFromCookie } from "@/lib/auth/token-cookie"

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
  withCredentials: false,
}

let didRegisterAuthInterceptor = false

export const initKubbClient = () => {
  setConfig(kubbClientConfig)
  axiosInstance.defaults.baseURL = apiBaseUrl
  axiosInstance.defaults.withCredentials = false

  if (didRegisterAuthInterceptor) {
    return
  }
  didRegisterAuthInterceptor = true

  axiosInstance.interceptors.request.use((config) => {
    const token = getAuthTokenFromCookie()
    if (token) {
      config.headers = AxiosHeaders.from(config.headers).set(
        "Authorization",
        `Bearer ${token}`,
      )
    }
    return config
  })
}
