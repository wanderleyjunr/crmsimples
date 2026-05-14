'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardData() {
  const supabase = await createClient()

  const [clientsResult, tasksResult, overdueTasks, upcomingTasks, recentClients] = await Promise.all([
    // Total clients
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    // All tasks for status counts
    supabase.from('tasks').select('status'),
    // Overdue tasks (due_date < today AND status != done)
    supabase.from('tasks')
      .select('*')
      .lt('due_date', new Date().toISOString().split('T')[0])
      .neq('status', 'done')
      .order('due_date', { ascending: true }),
    // Next 5 upcoming tasks
    supabase.from('tasks')
      .select('*, client:clients(id, name, avatar_url)')
      .neq('status', 'done')
      .not('due_date', 'is', null)
      .gte('due_date', new Date().toISOString().split('T')[0])
      .order('due_date', { ascending: true })
      .limit(5),
    // Last 5 clients
    supabase.from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const tasks = tasksResult.data || []
  const todoCount = tasks.filter(t => t.status === 'todo').length
  const doingCount = tasks.filter(t => t.status === 'doing').length
  const doneCount = tasks.filter(t => t.status === 'done').length

  return {
    totalClients: clientsResult.count || 0,
    todoCount,
    doingCount,
    doneCount,
    overdueCount: (overdueTasks.data || []).length,
    upcomingTasks: (upcomingTasks.data || []),
    recentClients: (recentClients.data || []),
  }
}
