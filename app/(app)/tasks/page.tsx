import Link from 'next/link'
import { Plus } from 'lucide-react'

import { getTasks } from '@/lib/actions/tasks'
import { buttonVariants } from '@/components/ui/button'
import { TasksTable } from '@/components/tables/tasks-table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TasksPageProps {
  searchParams: Promise<{
    search?: string
    page?: string
    status?: string
    priority?: string
    sort?: string
    order?: string
  }>
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const status = params.status ?? 'all'

  const { data: tasks, count } = await getTasks({
    search: params.search,
    status,
    priority: params.priority,
    page,
    perPage: 10,
    sortBy: (params.sort as 'due_date' | 'created_at' | 'priority') || 'created_at',
    sortOrder: (params.order as 'asc' | 'desc') || 'desc',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tarefas</h1>
          <p className="text-sm text-muted-foreground">
            {count} tarefa{count !== 1 ? 's' : ''} encontrada{count !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/tasks/new" className={buttonVariants()}>
          <Plus className="size-4 mr-2" />
          Nova Tarefa
        </Link>
      </div>

      <StatusTabs current={status} />

      <TasksTable
        tasks={tasks}
        totalCount={count}
        currentPage={page}
        search={params.search}
      />
    </div>
  )
}

function StatusTabs({ current }: { current: string }) {
  const tabs = [
    { value: 'all', label: 'Todas' },
    { value: 'todo', label: 'A Fazer' },
    { value: 'doing', label: 'Em Andamento' },
    { value: 'done', label: 'Concluídas' },
  ]

  return (
    <Tabs value={current}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            render={<Link href={`/tasks?status=${tab.value}`} />}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
