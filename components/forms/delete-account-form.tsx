'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { deleteAccount } from '@/lib/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'

export function DeleteAccountForm() {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const isConfirmed = confirmation === 'EXCLUIR'

  async function handleDelete() {
    if (!isConfirmed) return
    setIsDeleting(true)

    try {
      const result = await deleteAccount()
      if (result?.error) {
        toast.error(result.error)
        setIsDeleting(false)
      }
      // On success, deleteAccount() redirects to /login — no further action needed
    } catch {
      toast.error('Erro ao excluir conta. Tente novamente.')
      setIsDeleting(false)
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) setConfirmation('')
    setOpen(next)
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">Excluir minha conta</p>
        <p className="text-sm text-muted-foreground">
          Remove permanentemente sua conta e todos os dados associados, incluindo clientes,
          tarefas e arquivos. Esta ação não pode ser desfeita.
        </p>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger
          render={
            <Button variant="destructive" size="sm" className="shrink-0" />
          }
        >
          Excluir conta
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta permanentemente</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. Todos os seus clientes, tarefas e arquivos serão
              deletados. Para confirmar, digite <strong>EXCLUIR</strong> abaixo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5 py-2">
            <Label htmlFor="confirm-delete">Confirmação</Label>
            <Input
              id="confirm-delete"
              placeholder="Digite EXCLUIR"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              aria-invalid={confirmation.length > 0 && !isConfirmed}
            />
          </div>

          <DialogFooter>
            <Button
              variant="destructive"
              size="sm"
              disabled={!isConfirmed || isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? 'Excluindo...' : 'Confirmar exclusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
