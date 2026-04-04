"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Pencil, RefreshCcw, Search, ShieldAlert, UserPlus, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminUserCreateDialog } from "@/components/admin-user-create-dialog"
import { AdminUserEditDialog } from "@/components/admin-user-edit-dialog"
import { AdminUserResetPasswordDialog } from "@/components/admin-user-reset-password-dialog"
import { useAuthControllerMe } from "@/lib/api/auth/hooks/use-auth-controller-me"
import { parseCurrentUser } from "@/lib/auth/current-user"
import { useUsersControllerList, usersControllerListQueryKey } from "@/lib/api/users/hooks/use-users-controller-list"
import { kubbClientConfig } from "@/lib/kubb-client"
import { getApiErrorMessage } from "@/lib/errors/get-api-error-message"
import { parseAdminUsersList, type AdminUser } from "@/lib/users/admin-user"
import { useQueryClient } from "@tanstack/react-query"

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const meQuery = useAuthControllerMe({
    client: kubbClientConfig,
    query: {
      retry: false,
    },
  })

  const currentUser = parseCurrentUser(meQuery.data)
  const isAdmin = currentUser?.role === "ADMIN"

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
    }, 350)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [searchTerm])

  const usersQuery = useUsersControllerList(
    {
      page: 1,
      perPage: 100,
      search: debouncedSearchTerm || undefined,
    },
    {
      client: kubbClientConfig,
      query: {
        retry: false,
      },
    },
  )

  const users = useMemo(() => parseAdminUsersList(usersQuery.data), [usersQuery.data])

  const filteredUsers = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    if (!normalized) {
      return users
    }

    return users.filter(
      (user) => user.name.toLowerCase().includes(normalized) || user.email.toLowerCase().includes(normalized),
    )
  }, [users, searchTerm])

  const handleRefreshList = async () => {
    await queryClient.invalidateQueries({
      queryKey: usersControllerListQueryKey(),
    })
  }

  const handleMutationSuccess = async () => {
    await handleRefreshList()
  }

  if (meQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 text-amber-900">
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Acesso restrito</h1>
          </div>
          <p className="text-sm">
            Esta área é exclusiva para administradores. Caso precise desse acesso, solicite a atualização do seu perfil.
          </p>
        </div>
      </div>
    )
  }

  const usersErrorMessage = usersQuery.error
    ? getApiErrorMessage(
        usersQuery.error,
        "Não foi possível carregar os usuários. Verifique se o endpoint GET /v1/users está disponível na API.",
      )
    : ""

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:px-6">
          <div>
            <h1 className="text-lg font-semibold">Usuários</h1>
            <p className="text-sm text-muted-foreground">Gerencie acessos e permissões dos usuários da plataforma.</p>
          </div>
          <div className="md:ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={handleRefreshList} disabled={usersQuery.isFetching}>
              {usersQuery.isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Atualizar
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo usuário
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="mb-4 flex items-center gap-2 rounded-md border bg-background px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            className="border-0 px-0 shadow-none focus-visible:ring-0"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nome ou email"
            aria-label="Buscar usuário por nome ou email"
          />
        </div>

        {usersErrorMessage ? (
          <div className="rounded-md border border-destructive p-4 text-sm text-destructive">{usersErrorMessage}</div>
        ) : null}

        {!usersErrorMessage && usersQuery.isLoading ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-56" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="ml-auto h-8 w-24" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        {!usersErrorMessage && !usersQuery.isLoading && filteredUsers.length === 0 ? (
          <div className="rounded-md border p-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhum usuário encontrado para o filtro informado." : "Nenhum usuário disponível para exibição."}
            </p>
          </div>
        ) : null}

        {!usersErrorMessage && !usersQuery.isLoading && filteredUsers.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                        {user.role === "ADMIN" ? "Administrador" : "Usuário"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPasswordUser(user)}>
                          <KeyRound className="mr-2 h-4 w-4" />
                          Senha
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </main>

      <AdminUserCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleMutationSuccess}
      />

      <AdminUserEditDialog
        open={Boolean(editingUser)}
        user={editingUser}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUser(null)
          }
        }}
        onSuccess={handleMutationSuccess}
      />

      <AdminUserResetPasswordDialog
        open={Boolean(passwordUser)}
        user={passwordUser}
        onOpenChange={(open) => {
          if (!open) {
            setPasswordUser(null)
          }
        }}
      />
    </div>
  )
}
