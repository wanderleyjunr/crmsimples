'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { updateProfileSchema, changePasswordSchema } from '@/lib/validations/settings'

export async function updateProfile(formData: FormData) {
  const raw = { name: formData.get('name') as string }
  const parsed = updateProfileSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    data: { display_name: parsed.data.name }
  })

  if (error) return { error: 'Erro ao atualizar perfil' }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const raw = {
    newPassword: formData.get('newPassword') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }
  const parsed = changePasswordSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  })

  if (error) return { error: 'Erro ao alterar senha' }
  return { success: true }
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Delete all avatars from storage
  const { data: files } = await supabase.storage
    .from('client-avatars')
    .list(user.id)

  if (files && files.length > 0) {
    const paths = files.map(f => `${user.id}/${f.name}`)
    await supabase.storage.from('client-avatars').remove(paths)
  }

  // Delete user via admin API (requires SUPABASE_SERVICE_ROLE_KEY)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceRoleKey) {
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )
    await adminSupabase.auth.admin.deleteUser(user.id)
  }

  // Sign out and redirect
  await supabase.auth.signOut()
  redirect('/login')
}
