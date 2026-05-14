'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { taskSchema } from '@/lib/validations/task'
import type { TaskWithClient } from '@/types/database'

export interface GetTasksParams {
  search?: string
  status?: string
  priority?: string
  clientId?: string
  page?: number
  perPage?: number
  sortBy?: 'due_date' | 'created_at' | 'priority'
  sortOrder?: 'asc' | 'desc'
}

export async function getTasks(params: GetTasksParams = {}) {
  const {
    search,
    status,
    priority,
    clientId,
    page = 1,
    perPage = 10,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params

  const supabase = await createClient()

  let query = supabase
    .from('tasks')
    .select('*, client:clients(id, name, avatar_url)', { count: 'exact' })

  if (search) query = query.ilike('title', `%${search}%`)
  if (status && status !== 'all') query = query.eq('status', status)
  if (priority && priority !== 'all') query = query.eq('priority', priority)
  if (clientId) query = query.eq('client_id', clientId)

  query = query.order(sortBy, { ascending: sortOrder === 'asc', nullsFirst: false })

  const from = (page - 1) * perPage
  query = query.range(from, from + perPage - 1)

  const { data, count, error } = await query
  if (error) throw new Error(error.message)

  return { data: (data || []) as TaskWithClient[], count: count || 0 }
}

export async function getTaskById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*, client:clients(id, name, avatar_url)')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as TaskWithClient
}

export async function createTask(formData: FormData): Promise<{ error?: string }> {
  const raw = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    status: formData.get('status') as string,
    priority: formData.get('priority') as string,
    due_date: formData.get('due_date') as string,
    client_id: formData.get('client_id') as string,
  }

  const parsed = taskSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const insertData: Record<string, unknown> = {
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    status: parsed.data.status,
    priority: parsed.data.priority,
    due_date: parsed.data.due_date || null,
    client_id: parsed.data.client_id || null,
  }

  const { error } = await supabase.from('tasks').insert(insertData)
  if (error) return { error: 'Erro ao criar tarefa' }

  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  redirect('/tasks')
}

export async function updateTask(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const raw = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    status: formData.get('status') as string,
    priority: formData.get('priority') as string,
    due_date: formData.get('due_date') as string,
    client_id: formData.get('client_id') as string,
  }

  const parsed = taskSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('tasks')
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      due_date: parsed.data.due_date || null,
      client_id: parsed.data.client_id || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: 'Erro ao atualizar tarefa' }

  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  redirect('/tasks')
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/tasks')
  revalidatePath('/dashboard')
}

export async function updateTaskStatus(id: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase.from('tasks').update({ status }).eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/tasks')
  revalidatePath('/dashboard')
}

export async function getClientsForSelect() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clients')
    .select('id, name, avatar_url')
    .order('name')
  return data || []
}
