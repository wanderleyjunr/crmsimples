import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import { getTaskById, getClientsForSelect, updateTask } from '@/lib/actions/tasks'
import { buttonVariants } from '@/components/ui/button'
import { TaskForm } from '@/components/forms/task-form'
import { cn } from '@/lib/utils'

interface EditTaskPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params
  const [task, clients] = await Promise.all([
    getTaskById(id),
    getClientsForSelect(),
  ])

  if (!task) notFound()

  async function handleUpdate(formData: FormData) {
    'use server'
    return updateTask(id, formData)
  }

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
          <h1 className="text-2xl font-semibold text-foreground">Editar Tarefa</h1>
          <p className="text-sm text-muted-foreground truncate max-w-sm">
            {task.title}
          </p>
        </div>
      </div>

      <div className="max-w-2xl rounded-xl border border-border bg-white p-6">
        <TaskForm
          clients={clients}
          onSubmit={handleUpdate}
          isEdit
          defaultValues={{
            title: task.title,
            description: task.description ?? '',
            status: task.status,
            priority: task.priority,
            due_date: task.due_date ?? '',
            client_id: task.client_id ?? '',
          }}
        />
      </div>
    </div>
  )
}
