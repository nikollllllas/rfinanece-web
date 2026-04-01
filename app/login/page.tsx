"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthControllerLogin } from "@/lib/api/auth/hooks/use-auth-controller-login"
import { setAuthTokenCookie } from "@/lib/auth/token-cookie"
import { kubbClientConfig } from "@/lib/kubb-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const loginMutation = useAuthControllerLogin({
    client: kubbClientConfig,
  })

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const payload = await loginMutation.mutateAsync({
        data: { email, password },
      })
      if (
        payload &&
        typeof payload === "object" &&
        "accessToken" in payload &&
        typeof (payload as { accessToken: unknown }).accessToken === "string"
      ) {
        setAuthTokenCookie((payload as { accessToken: string }).accessToken)
      }

      router.replace("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Entrar no RFinance</CardTitle>
          <CardDescription>Use seu email e senha para acessar sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              required
            />
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              required
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
