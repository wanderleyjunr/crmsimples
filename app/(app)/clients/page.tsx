import { getClients } from '@/lib/actions/clients'
import { ClientsTable } from '@/components/tables/clients-table'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface ClientsPageProps {
  searchParams: Promise<{
    search?: string
    page?: string
    sort?: string
    order?: string
  }>
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1

  const { data: clients, count } = await getClients({
    search: params.search,
    page,
    perPage: 10,
    sortBy: (params.sort as 'name' | 'created_at') || 'created_at',
    sortOrder: (params.order as 'asc' | 'desc') || 'desc',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            {count} cliente{count !== 1 ? 's' : ''} cadastrado{count !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/clients/new" className={buttonVariants()}>
          <Plus className="size-4 mr-2" />
          Novo Cliente
        </Link>
      </div>
      <ClientsTable
        clients={clients}
        totalCount={count}
        currentPage={page}
        search={params.search}
      />
    </div>
  )
}
