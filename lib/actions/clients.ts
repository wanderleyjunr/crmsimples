'use server'

import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import { clientSchema } from '@/lib/validations/client'
import type { Client } from '@/types/database'

export async function resolveAvatarUrls<T extends { avatar_url: string | null }>(
  supabase: Awaited<ReturnType<typeof createSupabaseClient>>,
  items: T[]
): Promise<T[]> {
  const withAvatars = items.filter(i => i.avatar_url)
  if (withAvatars.length === 0) return items

  const paths = withAvatars.map(i => i.avatar_url!)
  const { data } = await supabase.storage
    .from('client-avatars')
    .createSignedUrls(paths, 3600)

  if (!data) return items

  const urlMap = new Map<string, string>()
  data.forEach(item => {
    if (item.signedUrl && item.path) {
      urlMap.set(item.path, item.signedUrl)
    }
  })

  return items.map(item => {
    if (item.avatar_url && urlMap.has(item.avatar_url)) {
      return { ...item, avatar_url: urlMap.get(item.avatar_url)! }
    }
    return item
  })
}

export async function getAvatarUrl(storagePath: string): Promise<string | null> {
  const supabase = await createSupabaseClient()
  const { data } = await supabase.storage
    .from('client-avatars')
    .createSignedUrl(storagePath, 3600)
  return data?.signedUrl ?? null
}

export interface GetClientsParams {
  search?: string
  page?: number
  perPage?: number
  sortBy?: 'name' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

export async function getClients(params: GetClientsParams = {}) {
  const {
    search,
    page = 1,
    perPage = 10,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params

  const supabase = await createSupabaseClient()

  let query = supabase.from('clients').select('*', { count: 'exact' })

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const from = (page - 1) * perPage
  const to = from + perPage - 1
  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) throw new Error(error.message)

  const clients = await resolveAvatarUrls(supabase, (data || []) as Client[])
  return { data: clients, count: count || 0 }
}

export async function getClientById(id: string) {
  const supabase = await createSupabaseClient()

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !client) return null

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false })

  const [resolvedClient] = await resolveAvatarUrls(supabase, [client as Client])
  return { client: resolvedClient, tasks: tasks || [] }
}

export async function deleteClient(id: string) {
  const supabase = await createSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: client } = await supabase
    .from('clients')
    .select('avatar_url, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!client) throw new Error('Cliente não encontrado')

  if (client.avatar_url) {
    await supabase.storage.from('client-avatars').remove([client.avatar_url])
  }

  const { error } = await supabase.from('clients').delete().eq('id', id).eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/clients')
}

export async function createClient(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Não autorizado' }

  const raw = {
    name: formData.get('name') as string,
    email: (formData.get('email') as string) || '',
    phone: (formData.get('phone') as string) || '',
    cep: (formData.get('cep') as string) || '',
    street: (formData.get('street') as string) || '',
    number: (formData.get('number') as string) || '',
    complement: (formData.get('complement') as string) || '',
    neighborhood: (formData.get('neighborhood') as string) || '',
    city: (formData.get('city') as string) || '',
    state: (formData.get('state') as string) || '',
  }

  const parsed = clientSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const { data: validData } = parsed

  const { data: newClient, error: insertError } = await supabase
    .from('clients')
    .insert({
      user_id: user.id,
      name: validData.name,
      email: validData.email || null,
      phone: validData.phone || null,
      cep: validData.cep || null,
      street: validData.street || null,
      number: validData.number || null,
      complement: validData.complement || null,
      neighborhood: validData.neighborhood || null,
      city: validData.city || null,
      state: validData.state || null,
    })
    .select('id')
    .single()

  if (insertError || !newClient) {
    return { error: insertError?.message ?? 'Erro ao criar cliente' }
  }

  const avatarFile = formData.get('avatar') as File | null
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('client-avatars')
      .upload(path, avatarFile, { contentType: avatarFile.type, upsert: false })

    if (!uploadError) {
      await supabase
        .from('clients')
        .update({ avatar_url: path })
        .eq('id', newClient.id)
    }
  }

  revalidatePath('/clients')
  redirect(`/clients/${newClient.id}`)
}

export async function updateClient(id: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Não autorizado' }

  const raw = {
    name: formData.get('name') as string,
    email: (formData.get('email') as string) || '',
    phone: (formData.get('phone') as string) || '',
    cep: (formData.get('cep') as string) || '',
    street: (formData.get('street') as string) || '',
    number: (formData.get('number') as string) || '',
    complement: (formData.get('complement') as string) || '',
    neighborhood: (formData.get('neighborhood') as string) || '',
    city: (formData.get('city') as string) || '',
    state: (formData.get('state') as string) || '',
  }

  const parsed = clientSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const { data: validData } = parsed

  // Handle avatar update
  let avatarUrl: string | undefined
  const avatarFile = formData.get('avatar') as File | null
  if (avatarFile && avatarFile.size > 0) {
    // Fetch existing avatar to delete
    const { data: existing } = await supabase
      .from('clients')
      .select('avatar_url')
      .eq('id', id)
      .single()

    if (existing?.avatar_url) {
      await supabase.storage.from('client-avatars').remove([existing.avatar_url])
    }

    const ext = avatarFile.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('client-avatars')
      .upload(path, avatarFile, { contentType: avatarFile.type, upsert: false })

    if (!uploadError) {
      avatarUrl = path
    }
  }

  const updatePayload: Record<string, string | null> = {
    name: validData.name,
    email: validData.email || null,
    phone: validData.phone || null,
    cep: validData.cep || null,
    street: validData.street || null,
    number: validData.number || null,
    complement: validData.complement || null,
    neighborhood: validData.neighborhood || null,
    city: validData.city || null,
    state: validData.state || null,
  }
  if (avatarUrl !== undefined) {
    updatePayload.avatar_url = avatarUrl
  }

  const { error: updateError } = await supabase
    .from('clients')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  redirect(`/clients/${id}`)
}
