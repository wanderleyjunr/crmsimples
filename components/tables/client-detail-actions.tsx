'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { deleteClient } from '@/lib/actions/clients'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ClientDetailActionsProps {
  clientId: string
  clientName: string
}

export function ClientDetailActions({
  clientId,
  clientName,
}: ClientDetailActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteClient(clientId)
      toast.success('Cliente excluído com sucesso')
      router.push('/clients')
    } catch {
      toast.error('Erro ao excluir cliente')
      setDeleting(false)
      setOpen(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant="destructive" size="sm" />}
      >
        <Trash2 className="size-4 mr-2" />
        Excluir
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir <strong>{clientName}</strong>? Esta
            ação não pode ser desfeita e todos os dados do cliente serão
            removidos permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
