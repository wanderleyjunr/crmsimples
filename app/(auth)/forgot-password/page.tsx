'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { forgotPassword } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setError(null)
    setIsLoading(true)
    const formData = new FormData()
    formData.append('email', data.email)

    const result = await forgotPassword(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      setSuccess(true)
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          Informe seu email para receber as instruções de recuperação
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl">
              Email de recuperação enviado! Verifique sua caixa de entrada.
            </div>
            <div className="text-center text-sm">
              <Link href="/login" className="text-[#0064E0] hover:underline">
                Voltar para o login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar email de recuperação'}
            </Button>
            <div className="text-center text-sm">
              <Link href="/login" className="text-[#0064E0] hover:underline">
                Voltar para o login
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
