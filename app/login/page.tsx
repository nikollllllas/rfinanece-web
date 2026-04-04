"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react"
import { useAuthControllerLogin } from "@/lib/api/auth/hooks/use-auth-controller-login"
import { setAuthTokenCookie } from "@/lib/auth/token-cookie"
import { getApiErrorMessage } from "@/lib/errors/get-api-error-message"
import { kubbClientConfig } from "@/lib/kubb-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
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
      setError(getApiErrorMessage(err, "Erro de conexão. Tente novamente."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sky-50 px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-40px] top-[-80px] h-[300px] w-[300px] rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-60px] h-[300px] w-[300px] rounded-full bg-blue-200/50 blur-3xl" />
      </div>

      <section className="relative mx-auto w-full max-w-md">
        <Card className="w-full border-sky-200/70 bg-white/90 shadow-lg backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-sky-900">Entrar no RFinance</CardTitle>
            <CardDescription className="text-sky-700/80">
              Use seu email e senha para acessar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label className="text-sky-900" htmlFor="login-email">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seu@email.com"
                    className="border-sky-100 bg-transparent pl-10 text-black placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sky-900" htmlFor="login-password">
                    Senha
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-sky-700 hover:text-sky-900 hover:underline"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="login-password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Sua senha"
                    className="border-sky-100 bg-transparent pl-10 pr-10 text-black placeholder:text-slate-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((current) => !current)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <Button className="w-full bg-sky-600 hover:bg-sky-700" disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
