"use client"

import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUsersControllerCreate } from "@/lib/api/users/hooks/use-users-controller-create"
import type { CreateUserDto } from "@/lib/api/schemas/create-user-dto"
import { getApiErrorMessage } from "@/lib/errors/get-api-error-message"
import { kubbClientConfig } from "@/lib/kubb-client"
import type { UserRole } from "@/lib/users/admin-user"

type AdminUserCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const initialFormData: CreateUserDto = {
  name: "",
  email: "",
  password: "",
  role: "USER",
}

export function AdminUserCreateDialog({ open, onOpenChange, onSuccess }: AdminUserCreateDialogProps) {
  const createMutation = useUsersControllerCreate({
    client: kubbClientConfig,
  })
  const [formData, setFormData] = useState<CreateUserDto>(initialFormData)
  const [error, setError] = useState("")

  const isSaving = createMutation.isPending

  const resetForm = () => {
    setFormData(initialFormData)
    setError("")
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm()
    }

    onOpenChange(nextOpen)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    try {
      await createMutation.mutateAsync({ data: formData })
      handleOpenChange(false)
      onSuccess?.()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Não foi possível criar o usuário."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
          <DialogDescription>Crie um novo usuário com perfil de acesso.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="admin-user-create-name">Nome</Label>
            <Input
              id="admin-user-create-name"
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nome completo"
              required
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-user-create-email">Email</Label>
            <Input
              id="admin-user-create-email"
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              placeholder="usuario@email.com"
              required
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-user-create-password">Senha</Label>
            <Input
              id="admin-user-create-password"
              type="password"
              minLength={6}
              value={formData.password}
              onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
              placeholder="Mínimo de 6 caracteres"
              required
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-user-create-role">Perfil</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData((current) => ({ ...current, role: value as UserRole }))}
              disabled={isSaving}
            >
              <SelectTrigger id="admin-user-create-role">
                <SelectValue placeholder="Selecione um perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Usuário</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Criar usuário"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
