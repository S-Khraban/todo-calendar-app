import { supabase } from '@/services/supabaseClient'

export type Task = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
}

export async function listMyTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('id,title,description,status,priority,due_date')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Task[]
}

export async function createTask(payload: {
  title: string
  description?: string | null
  due_date?: string | null
  priority?: string
}) {
  const { data: userData } = await supabase.auth.getUser()
  const owner_id = userData.user?.id
  if (!owner_id) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      owner_id,
      title: payload.title,
      description: payload.description ?? null,
      due_date: payload.due_date ?? null,
      priority: payload.priority ?? 'normal',
    })
    .select('id,title,description,status,priority,due_date')
    .single()

  if (error) throw error
  return data as Task
}
