export type TaskStatus = 'todo' | 'doing' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  avatar_url: string | null
  cep: string | null
  street: string | null
  number: string | null
  complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  client_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TaskWithClient extends Task {
  client: Pick<Client, 'id' | 'name' | 'avatar_url'> | null
}

export interface ClientWithTaskCount extends Client {
  task_count: number
}
