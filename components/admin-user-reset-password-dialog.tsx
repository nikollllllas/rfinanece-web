"use client"

import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUsersControllerAdminResetPassword } from "@/lib/api/users/hooks/use-users-controller-admin-reset-password"
import { getApiErrorMessage } from "@/lib/errors/get-api-error-message"
import { kubbClientConfig } from "@/lib/kubb-client"
import type { AdminUser } from "@/lib/users/admin-user"

type AdminUserResetPasswordDialogProps = {
  open: boolean
  user: AdminUser | null
  onOpenChange: (open: boolean) => void
}

export function AdminUserResetPasswordDialog({ open, user, onOpenChange }: AdminUserResetPasswordDialogProps) {
  const resetMutation = useUsersControllerAdminResetPassword({
    client: kubbClientConfig,
  })
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const isSaving = resetMutation.isPending

  const resetState = () => {
    setPassword("")
    setConfirmPassword("")
    setError("")
    setIsSuccess(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState()
    }

    onOpenChange(nextOpen)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsSuccess(false)

    if (!user) {
      return
    }

    if (password.length < 6) {
      setError("A senha precisa ter no mínimo 6 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.")
      return
    }

    try {
      await resetMutation.mutateAsync({
        id: user.id,
        data: { password },
      })
      setIsSuccess(true)
      setPassword("")
      setConfirmPassword("")
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Não foi possível redefinir a senha."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Redefinir senha</DialogTitle>
          <DialogDescription>
            {user ? `Defina uma nova senha para ${user.name}.` : "Defina uma nova senha para o usuário selecionado."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="admin-user-reset-password">Nova senha</Label>
            <Input
              id="admin-user-reset-password"
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo de 6 caracteres"
              required
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-user-reset-confirm-password">Confirmar senha</Label>
            <Input
              id="admin-user-reset-confirm-password"
              type="password"
              minLength={6}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repita a nova senha"
              required
              disabled={isSaving}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {isSuccess ? (
            <p className="text-sm text-emerald-600">Senha redefinida com sucesso. Tokens de recuperação antigos foram invalidados.</p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => handleOpenChange(false)}>
              Fechar
            </Button>
            <Button type="submit" disabled={isSaving || !user}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar nova senha"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
