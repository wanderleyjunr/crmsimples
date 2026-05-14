import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200, 'Título muito longo'),
  description: z.string().max(2000).optional().or(z.literal('')),
  status: z.enum(['todo', 'doing', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional().or(z.literal('')),
  client_id: z.string().uuid().optional().or(z.literal('')),
})

export type TaskInput = z.infer<typeof taskSchema>
