import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

import { getClientsForSelect, createTask } from '@/lib/actions/tasks'
import { buttonVariants } from '@/components/ui/button'
import { TaskForm } from '@/components/forms/task-form'
import { cn } from '@/lib/utils'

interface NewTaskPageProps {
  searchParams: Promise<{
    client_id?: string
  }>
}

export default async function NewTaskPage({ searchParams }: NewTaskPageProps) {
  const params = await searchParams
  const clients = await getClientsForSelect()

  const defaultValues = params.client_id
    ? { client_id: params.client_id }
    : undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/tasks"
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
          aria-label="Voltar para tarefas"
        >
          <ChevronLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Nova Tarefa</h1>
          <p className="text-sm text-muted-foreground">
            Preencha os dados para criar uma nova tarefa
          </p>
        </div>
      </div>

      <div className="max-w-2xl rounded-xl border border-border bg-white p-6">
        <TaskForm
          clients={clients}
          onSubmit={createTask}
          defaultValues={defaultValues}
        />
      </div>
    </div>
  )
}
