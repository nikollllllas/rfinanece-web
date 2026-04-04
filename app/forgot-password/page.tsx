"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthControllerForgotPassword } from "@/lib/api/auth/hooks/use-auth-controller-forgot-password"
import { getApiErrorMessage } from "@/lib/errors/get-api-error-message"
import { kubbClientConfig } from "@/lib/kubb-client"

type ForgotPasswordResult = {
  message?: string
}

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useAuthControllerForgotPassword({
    client: kubbClientConfig,
  })
  const [email, setEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const isSubmitting = forgotPasswordMutation.isPending

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage("")

    try {
      const response = (await forgotPasswordMutation.mutateAsync({ data: { email } })) as ForgotPasswordResult
      setSuccessMessage(
        response?.message ??
          "Se existir uma conta com este e-mail, enviaremos as instruções de recuperação.",
      )
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível enviar a solicitação."))
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sky-50 px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-40px] top-[-80px] h-[300px] w-[300px] rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-60px] h-[300px] w-[300px] rounded-full bg-blue-200/50 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-sky-200/70 bg-white/90 shadow-lg backdrop-blur">
        <CardHeader className="space-y-2">
          <CardTitle className="text-sky-900">Recuperar senha</CardTitle>
          <CardDescription className="text-sky-700/80">
            Informe seu email para receber instruções de redefinição.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-sky-900" htmlFor="forgot-password-email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="forgot-password-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  className="border-sky-100 bg-transparent pl-10 text-black placeholder:text-slate-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
            ) : null}
            {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

            <Button className="w-full bg-sky-600 hover:bg-sky-700" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar instruções"
              )}
            </Button>
          </form>

          <Button asChild variant="link" className="mt-4 px-0 text-sky-700 hover:text-sky-900">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
