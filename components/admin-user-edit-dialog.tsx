"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUsersControllerUpdateByAdmin } from "@/lib/api/users/hooks/use-users-controller-update-by-admin"
import type { UpdateUserByAdminDto } from "@/lib/api/schemas/update-user-by-admin-dto"
import { getApiErrorMessage } from "@/lib/errors/get-api-error-message"
import { kubbClientConfig } from "@/lib/kubb-client"
import type { AdminUser, UserRole } from "@/lib/users/admin-user"

type AdminUserEditDialogProps = {
  open: boolean
  user: AdminUser | null
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AdminUserEditDialog({ open, user, onOpenChange, onSuccess }: AdminUserEditDialogProps) {
  const updateMutation = useUsersControllerUpdateByAdmin({
    client: kubbClientConfig,
  })
  const [formData, setFormData] = useState<UpdateUserByAdminDto>({
    name: "",
    email: "",
    role: "USER",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      return
    }

    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    })
  }, [user])

  const isSaving = updateMutation.isPending

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!user) {
      return
    }

    try {
      await updateMutation.mutateAsync({
        data: formData,
        id: user.id,
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Não foi possível atualizar o usuário."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
          <DialogDescription>Atualize os dados de cadastro do usuário.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="admin-user-edit-name">Nome</Label>
            <Input
              id="admin-user-edit-name"
              value={formData.name ?? ""}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nome completo"
              required
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-user-edit-email">Email</Label>
            <Input
              id="admin-user-edit-email"
              type="email"
              value={formData.email ?? ""}
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              placeholder="usuario@email.com"
              required
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-user-edit-role">Perfil</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData((current) => ({ ...current, role: value as UserRole }))}
              disabled={isSaving}
            >
              <SelectTrigger id="admin-user-edit-role">
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
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || !user}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
