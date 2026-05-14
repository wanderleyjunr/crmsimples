'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { loginSchema, signupSchema, forgotPasswordSchema } from '@/lib/validations/auth'

export interface ActionResult {
  error?: string
  success?: boolean
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: 'Email ou senha inválidos' }
  }

  redirect('/dashboard')
}

export async function signUp(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const parsed = signupSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.name,
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este email já está cadastrado' }
    }
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }

  redirect('/dashboard')
}

export async function forgotPassword(formData: FormData): Promise<ActionResult> {
  const raw = { email: formData.get('email') as string }

  const parsed = forgotPasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email)

  if (error) {
    return { error: 'Erro ao enviar email de recuperação' }
  }

  return { success: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
