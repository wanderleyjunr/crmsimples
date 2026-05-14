'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

import { taskSchema, type TaskInput } from '@/lib/validations/task'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface ClientOption {
  id: string
  name: string
}

interface TaskFormProps {
  defaultValues?: Partial<TaskInput>
  clients: ClientOption[]
  onSubmit: (formData: FormData) => Promise<{ error?: string }>
  isEdit?: boolean
}

export function TaskForm({
  defaultValues,
  clients,
  onSubmit,
  isEdit = false,
}: TaskFormProps) {
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      status: defaultValues?.status ?? 'todo',
      priority: defaultValues?.priority ?? 'medium',
      due_date: defaultValues?.due_date ?? '',
      client_id: defaultValues?.client_id ?? '',
    },
  })

  const statusValue = watch('status')
  const priorityValue = watch('priority')
  const clientIdValue = watch('client_id')

  function handleFormSubmit(data: TaskInput) {
    setServerError(null)
    const formData = new FormData()
    formData.set('title', data.title)
    formData.set('description', data.description ?? '')
    formData.set('status', data.status)
    formData.set('priority', data.priority)
    formData.set('due_date', data.due_date ?? '')
    formData.set('client_id', data.client_id ?? '')

    startTransition(async () => {
      const result = await onSubmit(formData)
      if (result?.error) {
        setServerError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Título */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ex: Enviar proposta comercial"
          aria-invalid={!!errors.title}
          {...register('title')}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Detalhes sobre a tarefa..."
          rows={4}
          aria-invalid={!!errors.description}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Status */}
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            value={statusValue}
            onValueChange={(val) =>
              setValue('status', (val ?? 'todo') as TaskInput['status'], { shouldValidate: true })
            }
          >
            <SelectTrigger id="status" className="w-full" aria-invalid={!!errors.status}>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">A Fazer</SelectItem>
              <SelectItem value="doing">Em Andamento</SelectItem>
              <SelectItem value="done">Concluída</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-xs text-destructive">{errors.status.message}</p>
          )}
        </div>

        {/* Prioridade */}
        <div className="space-y-1.5">
          <Label htmlFor="priority">Prioridade</Label>
          <Select
            value={priorityValue}
            onValueChange={(val) =>
              setValue('priority', (val ?? 'medium') as TaskInput['priority'], { shouldValidate: true })
            }
          >
            <SelectTrigger id="priority" className="w-full" aria-invalid={!!errors.priority}>
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="text-xs text-destructive">{errors.priority.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Prazo */}
        <div className="space-y-1.5">
          <Label htmlFor="due_date">Prazo</Label>
          <Input
            id="due_date"
            type="date"
            aria-invalid={!!errors.due_date}
            {...register('due_date')}
          />
          {errors.due_date && (
            <p className="text-xs text-destructive">{errors.due_date.message}</p>
          )}
        </div>

        {/* Cliente */}
        <div className="space-y-1.5">
          <Label htmlFor="client_id">Cliente</Label>
          <Select
            value={clientIdValue ?? ''}
            onValueChange={(val) =>
              setValue('client_id', val === '__none__' || val === null ? '' : val, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="client_id" className="w-full" aria-invalid={!!errors.client_id}>
              <SelectValue placeholder="Selecione um cliente (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Nenhum cliente</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.client_id && (
            <p className="text-xs text-destructive">{errors.client_id.message}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEdit
              ? 'Salvando...'
              : 'Criando...'
            : isEdit
              ? 'Salvar alterações'
              : 'Criar tarefa'}
        </Button>
        <Link
          href="/tasks"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            isPending && 'pointer-events-none opacity-50'
          )}
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
