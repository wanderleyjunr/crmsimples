'use client'

import * as React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'

import type { TaskWithClient } from '@/types/database'
import { cn, formatDueDate, getInitials } from '@/lib/utils'
import { deleteTask, updateTaskStatus } from '@/lib/actions/tasks'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'

interface TasksTableProps {
  tasks: TaskWithClient[]
  totalCount: number
  currentPage: number
  search?: string
}

const STATUS_CYCLE: Record<string, string> = {
  todo: 'doing',
  doing: 'done',
  done: 'todo',
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'A Fazer',
  doing: 'Em Andamento',
  done: 'Concluída',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
}

const ITEMS_PER_PAGE = 10

const columnHelper = createColumnHelper<TaskWithClient>()

export function TasksTable({
  tasks,
  totalCount,
  currentPage,
  search,
}: TasksTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParamsHook = useSearchParams()

  const [searchValue, setSearchValue] = React.useState(search ?? '')
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParamsHook.toString())
      if (searchValue) {
        params.set('search', searchValue)
      } else {
        params.delete('search')
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue]) // eslint-disable-line react-hooks/exhaustive-deps

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParamsHook.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteTask(deleteId)
      toast.success('Tarefa excluída com sucesso')
    } catch {
      toast.error('Erro ao excluir tarefa')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  async function handleStatusCycle(id: string, currentStatus: string) {
    const nextStatus = STATUS_CYCLE[currentStatus] ?? 'todo'
    setUpdatingStatus(id)
    try {
      await updateTaskStatus(id, nextStatus)
      toast.success(`Status atualizado para "${STATUS_LABELS[nextStatus]}"`)
    } catch {
      toast.error('Erro ao atualizar status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: any[] = [
    columnHelper.accessor('title', {
      header: 'Título',
      cell: ({ getValue, row }) => (
        <Link
          href={`/tasks/${row.original.id}/edit`}
          className="font-medium text-foreground hover:underline line-clamp-1"
        >
          {getValue()}
        </Link>
      ),
    }),
    columnHelper.display({
      id: 'client',
      header: 'Cliente',
      cell: ({ row }) => {
        const client = row.original.client
        if (!client) return <span className="text-muted-foreground">—</span>
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              {client.avatar_url && (
                <AvatarImage src={client.avatar_url} alt={client.name} />
              )}
              <AvatarFallback className="text-xs">
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate max-w-[120px]">
              {client.name}
            </span>
          </div>
        )
      },
      meta: { className: 'hidden md:table-cell' },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue, row }) => {
        const status = getValue()
        const isUpdating = updatingStatus === row.original.id
        return (
          <button
            type="button"
            onClick={() => handleStatusCycle(row.original.id, status)}
            disabled={isUpdating}
            className="disabled:opacity-50 cursor-pointer"
            title={`Clique para avançar: ${STATUS_LABELS[STATUS_CYCLE[status] ?? 'todo']}`}
          >
            <Badge variant={status as 'todo' | 'doing' | 'done'}>
              {STATUS_LABELS[status] ?? status}
            </Badge>
          </button>
        )
      },
    }),
    columnHelper.accessor('priority', {
      header: 'Prioridade',
      cell: ({ getValue }) => {
        const priority = getValue()
        return (
          <Badge variant={priority as 'low' | 'medium' | 'high'}>
            {PRIORITY_LABELS[priority] ?? priority}
          </Badge>
        )
      },
      meta: { className: 'hidden sm:table-cell' },
    }),
    columnHelper.accessor('due_date', {
      header: 'Prazo',
      cell: ({ getValue }) => {
        const date = getValue()
        if (!date) return <span className="text-muted-foreground text-xs">—</span>
        const { text, isOverdue, isToday } = formatDueDate(date)
        return (
          <span
            className={cn(
              'text-xs',
              isOverdue && 'text-red-600 font-medium',
              isToday && 'text-amber-600 font-medium',
              !isOverdue && !isToday && 'text-muted-foreground'
            )}
          >
            {text}
          </span>
        )
      },
      meta: { className: 'hidden sm:table-cell' },
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const task = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Ações" />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href={`/tasks/${task.id}/edit`} />}>
                <Pencil className="size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDeleteId(task.id)}
              >
                <Trash2 className="size-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 48,
    }),
  ]

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: totalCount,
  })

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <>
      <div className="space-y-4">
        {/* Search */}
        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar por título..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-white">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        (header.column.columnDef.meta as { className?: string } | undefined)
                          ?.className
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="py-16">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                        <CheckSquare className="size-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Nenhuma tarefa encontrada
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Comece criando sua primeira tarefa
                        </p>
                      </div>
                      <Link
                        href="/tasks/new"
                        className={buttonVariants({ size: 'sm' })}
                      >
                        Nova tarefa
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          (
                            cell.column.columnDef.meta as
                              | { className?: string }
                              | undefined
                          )?.className
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de{' '}
              {totalCount}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Anterior
              </Button>
              <span className="px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A tarefa será removida permanentemente.
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
    </>
  )
}
