import Link from 'next/link'
import { Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getDashboardData } from '@/lib/actions/dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, getGreeting, getInitials, formatRelativeDate, formatDueDate } from '@/lib/utils'
import type { TaskWithClient, Client } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuário'

  const {
    totalClients,
    todoCount,
    doingCount,
    doneCount,
    overdueCount,
    upcomingTasks,
    recentClients,
  } = await getDashboardData()

  const pendingCount = todoCount + doingCount

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aqui está um resumo do seu CRM.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Clientes */}
        <Card className="rounded-card">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Users className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground leading-none">{totalClients}</span>
                <span className="text-sm text-muted-foreground mt-1">Total Clientes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarefas Pendentes */}
        <Card className="rounded-card">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Clock className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground leading-none">{pendingCount}</span>
                <span className="text-sm text-muted-foreground mt-1">Tarefas Pendentes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Concluídas */}
        <Card className="rounded-card">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground leading-none">{doneCount}</span>
                <span className="text-sm text-muted-foreground mt-1">Concluídas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atrasadas */}
        <Card className="rounded-card">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                overdueCount > 0
                  ? "bg-red-100 text-red-600"
                  : "bg-zinc-100 text-zinc-500"
              )}>
                <AlertTriangle className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "text-2xl font-bold leading-none",
                  overdueCount > 0 ? "text-red-600" : "text-foreground"
                )}>{overdueCount}</span>
                <span className="text-sm text-muted-foreground mt-1">Atrasadas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Próximas Tarefas — 2/3 */}
        <Card className="rounded-card lg:col-span-2">
          <CardContent className="pt-6">
            <h2 className="font-semibold text-foreground mb-4">Próximas Tarefas</h2>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma tarefa pendente</p>
            ) : (
              <ul className="divide-y divide-border">
                {(upcomingTasks as TaskWithClient[]).map((task) => {
                  const due = task.due_date ? formatDueDate(task.due_date) : null
                  return (
                    <li key={task.id}>
                      <Link
                        href={`/tasks/${task.id}/edit`}
                        className="flex items-center gap-3 py-3 hover:bg-muted/40 transition-colors rounded-lg px-2 -mx-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {task.client?.name ?? 'Sem cliente'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={task.status}>{
                            task.status === 'todo' ? 'A fazer'
                            : task.status === 'doing' ? 'Em andamento'
                            : 'Concluída'
                          }</Badge>
                          {due && (
                            <span className={cn(
                              "text-xs font-medium",
                              due.isOverdue ? "text-red-600"
                              : due.isToday ? "text-amber-600"
                              : "text-muted-foreground"
                            )}>
                              {due.text}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Clientes Recentes — 1/3 */}
        <Card className="rounded-card">
          <CardContent className="pt-6">
            <h2 className="font-semibold text-foreground mb-4">Clientes Recentes</h2>
            {recentClients.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum cliente</p>
            ) : (
              <ul className="divide-y divide-border">
                {(recentClients as Client[]).map((client) => (
                  <li key={client.id}>
                    <Link
                      href={`/clients/${client.id}`}
                      className="flex items-center gap-3 py-3 hover:bg-muted/40 transition-colors rounded-lg px-2 -mx-2"
                    >
                      <Avatar size="sm">
                        {client.avatar_url && (
                          <AvatarImage src={client.avatar_url} alt={client.name} />
                        )}
                        <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                        {client.email && (
                          <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatRelativeDate(client.created_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
