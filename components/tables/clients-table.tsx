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
import { MoreHorizontal, Eye, Pencil, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'

import type { Client } from '@/types/database'
import { cn, formatPhone, formatRelativeDate, getInitials } from '@/lib/utils'
import { deleteClient } from '@/lib/actions/clients'
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

interface ClientsTableProps {
  clients: Client[]
  totalCount: number
  currentPage: number
  search?: string
}

const columnHelper = createColumnHelper<Client>()

const ITEMS_PER_PAGE = 10

export function ClientsTable({
  clients,
  totalCount,
  currentPage,
  search,
}: ClientsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParamsHook = useSearchParams()

  const [searchValue, setSearchValue] = React.useState(search ?? '')
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  // Debounced search — 300ms
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
      await deleteClient(deleteId)
      toast.success('Cliente excluído com sucesso')
    } catch {
      toast.error('Erro ao excluir cliente')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  // useReactTable accepts ColumnDef<TData, any>[] — let TS infer from columnHelper
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: any[] = [
    columnHelper.display({
      id: 'avatar',
      header: '',
      cell: ({ row }) => {
        const client = row.original
        return (
          <Avatar className="size-8">
            {client.avatar_url && (
              <AvatarImage src={client.avatar_url} alt={client.name} />
            )}
            <AvatarFallback className="text-xs">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>
        )
      },
      size: 40,
    }),
    columnHelper.accessor('name', {
      header: 'Nome',
      cell: ({ getValue, row }) => (
        <Link
          href={`/clients/${row.original.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue() ?? '—'}</span>
      ),
      meta: { className: 'hidden md:table-cell' },
    }),
    columnHelper.accessor('phone', {
      header: 'Telefone',
      cell: ({ getValue }) => {
        const phone = getValue()
        return (
          <span className="text-muted-foreground">
            {phone ? formatPhone(phone) : '—'}
          </span>
        )
      },
      meta: { className: 'hidden md:table-cell' },
    }),
    columnHelper.display({
      id: 'location',
      header: 'Cidade/UF',
      cell: ({ row }) => {
        const { city, state } = row.original
        const location = [city, state].filter(Boolean).join(' / ')
        return (
          <span className="text-muted-foreground">{location || '—'}</span>
        )
      },
    }),
    columnHelper.display({
      id: 'created_at',
      header: 'Cadastrado',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {formatRelativeDate(row.original.created_at)}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const client = row.original
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
              <DropdownMenuItem render={<Link href={`/clients/${client.id}`} />}>
                <Eye className="size-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={`/clients/${client.id}/edit`} />}
              >
                <Pencil className="size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDeleteId(client.id)}
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
    data: clients,
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
            placeholder="Buscar por nome ou email..."
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
                        <Users className="size-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Nenhum cliente cadastrado
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Comece adicionando seu primeiro cliente
                        </p>
                      </div>
                      <Link
                        href="/clients/new"
                        className={buttonVariants({ size: 'sm' })}
                      >
                        Adicionar cliente
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
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cliente e todos os seus dados
              serão removidos permanentemente.
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
