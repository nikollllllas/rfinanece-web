type ApiLikeError = {
  response?: {
    data?: {
      message?: string | string[]
    }
  }
  message?: string
}

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) {
    return fallback
  }

  const apiError = error as ApiLikeError
  const message = apiError.response?.data?.message

  if (Array.isArray(message)) {
    return message[0] ?? fallback
  }

  if (typeof message === "string" && message.length > 0) {
    return message
  }

  if (typeof apiError.message === "string" && apiError.message.length > 0) {
    return apiError.message
  }

  return fallback
}
