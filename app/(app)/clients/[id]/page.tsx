import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Mail, Phone, MapPin, CalendarClock, CheckSquare } from 'lucide-react'

import { getClientById } from '@/lib/actions/clients'
import { ClientDetailActions } from '@/components/tables/client-detail-actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getInitials, formatPhone, formatDate, formatDueDate } from '@/lib/utils'
import type { Task, TaskStatus } from '@/types/database'

interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

const statusLabel: Record<TaskStatus, string> = {
  todo: 'A fazer',
  doing: 'Em andamento',
  done: 'Concluída',
}

const statusVariant: Record<TaskStatus, 'todo' | 'doing' | 'done'> = {
  todo: 'todo',
  doing: 'doing',
  done: 'done',
}

type ClientData = NonNullable<Awaited<ReturnType<typeof getClientById>>>['client']

function buildAddressLines(client: ClientData): string[] {
  const lines: string[] = []

  const streetParts = [client.street, client.number, client.complement].filter(Boolean)
  if (streetParts.length) lines.push(streetParts.join(', '))

  if (client.neighborhood) lines.push(client.neighborhood)

  const cityParts = [client.city, client.state].filter(Boolean)
  if (cityParts.length) lines.push(cityParts.join(' – '))

  if (client.cep) lines.push(`CEP ${client.cep}`)

  return lines
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params
  const result = await getClientById(id)

  if (!result) notFound()

  const { client, tasks } = result
  const addressLines = buildAddressLines(client)
  const hasAddress = addressLines.length > 0

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-20 shrink-0">
            {client.avatar_url && (
              <AvatarImage src={client.avatar_url} alt={client.name} />
            )}
            <AvatarFallback className="text-xl">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {client.name}
            </h1>
            <div className="mt-1 space-y-0.5">
              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Mail className="size-3.5" />
                  {client.email}
                </a>
              )}
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Phone className="size-3.5" />
                  {formatPhone(client.phone)}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/clients/${client.id}/edit`}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Editar
          </Link>
          <ClientDetailActions clientId={client.id} clientName={client.name} />
        </div>
      </div>

      {/* Address card */}
      {hasAddress && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4 text-muted-foreground" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <address className="not-italic space-y-0.5 text-sm text-muted-foreground">
              {addressLines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </address>
          </CardContent>
        </Card>
      )}

      {/* Tasks section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckSquare className="size-4 text-muted-foreground" />
          <h2 className="text-base font-medium text-foreground">
            Tarefas deste cliente
          </h2>
          <span className="text-sm text-muted-foreground">({tasks.length})</span>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/30 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma tarefa vinculada a este cliente
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-white divide-y divide-border">
            {tasks.map((task: Task) => {
              const due = task.due_date ? formatDueDate(task.due_date) : null
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant={statusVariant[task.status]}>
                      {statusLabel[task.status]}
                    </Badge>
                    <span
                      className={`text-sm font-medium truncate ${
                        task.status === 'done'
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  {due && (
                    <div className="flex items-center gap-1 shrink-0">
                      <CalendarClock className="size-3.5 text-muted-foreground" />
                      <span
                        className={`text-xs ${
                          due.isOverdue
                            ? 'text-destructive font-medium'
                            : due.isToday
                            ? 'text-amber-600 font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {due.text}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Meta */}
      <p className="text-xs text-muted-foreground">
        Cadastrado em {formatDate(client.created_at)}
      </p>
    </div>
  )
}
