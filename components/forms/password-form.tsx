'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validations/settings'
import { changePassword } from '@/lib/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(values: ChangePasswordInput) {
    const formData = new FormData()
    formData.set('newPassword', values.newPassword)
    formData.set('confirmPassword', values.confirmPassword)

    const result = await changePassword(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Senha alterada com sucesso!')
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">Nova senha</Label>
        <Input
          id="newPassword"
          type="password"
          placeholder="Mínimo 6 caracteres"
          aria-invalid={!!errors.newPassword}
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <p className="text-xs text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Repita a nova senha"
          aria-invalid={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Alterando...' : 'Alterar senha'}
        </Button>
      </div>
    </form>
  )
}
