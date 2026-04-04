"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthControllerResetPassword } from "@/lib/api/auth/hooks/use-auth-controller-reset-password"
import { getApiErrorMessage } from "@/lib/errors/get-api-error-message"
import { kubbClientConfig } from "@/lib/kubb-client"

export default function ResetPasswordPage() {
  const resetPasswordMutation = useAuthControllerResetPassword({
    client: kubbClientConfig,
  })
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const isSubmitting = resetPasswordMutation.isPending

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const tokenFromUrl = new URLSearchParams(window.location.search).get("token")
    if (!tokenFromUrl) {
      return
    }

    setToken(tokenFromUrl)
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    if (password.length < 6) {
      setErrorMessage("A senha precisa ter no mínimo 6 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não conferem.")
      return
    }

    try {
      await resetPasswordMutation.mutateAsync({
        data: {
          token,
          password,
        },
      })
      setSuccessMessage("Senha redefinida com sucesso. Faça login com sua nova senha.")
      setPassword("")
      setConfirmPassword("")
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Não foi possível redefinir a senha."))
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle>Redefinir senha</CardTitle>
          <CardDescription>
            Informe o token de recuperação e sua nova senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="reset-password-token">Token de recuperação</Label>
              <Input
                id="reset-password-token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Cole aqui o token recebido"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-password-new">Nova senha</Label>
              <Input
                id="reset-password-new"
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo de 6 caracteres"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-password-confirm">Confirmar nova senha</Label>
              <Input
                id="reset-password-confirm"
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repita a nova senha"
                required
                disabled={isSubmitting}
              />
            </div>

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Redefinir senha"
              )}
            </Button>
          </form>

          <Button asChild variant="link" className="mt-4 px-0">
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
