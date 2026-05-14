import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
})

export const changePasswordSchema = z.object({
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme sua senha'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
