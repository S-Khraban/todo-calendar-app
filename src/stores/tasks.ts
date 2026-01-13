import { defineStore } from 'pinia'
import type { Task, TaskStatus, TaskPriority } from '@/types'
import { supabase } from '@/services/supabaseClient'

type DbTaskRow = {
  id: string
  title: string | null
  status: string | null
  due_date: string | null
  end_date: string | null
  description: string | null
  category_id: string | null
  start_time: string | null
  end_time: string | null
  priority: string | null
}

const extractLegacyEndDate = (description?: string | null) => {
  if (!description) return null
  const m = description.match(/endDate:(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : null
}

const stripLegacyEndDate = (description?: string | null) => {
  if (!description) return null
  const next = description.replace(/endDate:\d{4}-\d{2}-\d{2}/g, '').trim()
  return next.length ? next : null
}

const toAppTask = (row: DbTaskRow): Task => {
  const status = (row.status ?? 'todo') as TaskStatus
  const priority = (row.priority ?? 'low') as TaskPriority

  return {
    id: row.id,
    title: row.title ?? 'Task',
    status,
    date: row.due_date ?? '',
    endDate: row.end_date ?? extractLegacyEndDate(row.description) ?? null,
    description: stripLegacyEndDate(row.description),
    categoryId: row.category_id ?? null,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    priority,
  }
}

const selectFields =
  'id,title,status,due_date,end_date,description,category_id,start_time,end_time,priority'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
    isLoading: false,
    error: '' as string,
  }),

  getters: {
    tasksByDate: (state) => (date: string) =>
      state.tasks.filter((t) => {
        const start = t.date
        const end = t.endDate ?? t.date
        return start <= date && date <= end
      }),
  },

  actions: {
    async loadFromSupabase() {
      this.error = ''
      this.isLoading = true

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(selectFields)
          .order('created_at', { ascending: false })

        if (error) throw error
        this.tasks = ((data ?? []) as DbTaskRow[]).map(toAppTask)
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load tasks'
        this.tasks = []
      } finally {
        this.isLoading = false
      }
    },

    async load() {
      await this.loadFromSupabase()
    },

    async addTask(payload: Omit<Task, 'id' | 'status'>) {
      this.error = ''

      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr

      const owner_id = userData.user?.id
      if (!owner_id) throw new Error('Not authenticated')

      const title = payload.title?.trim() || 'Task'
      const due_date = payload.date || null
      const rawDescription = (payload.description ?? null) as string | null
      const end_date = (payload.endDate ?? null) ?? extractLegacyEndDate(rawDescription)
      const description = stripLegacyEndDate(rawDescription)

      const category_id = payload.categoryId ?? null
      const start_time = payload.startTime ?? null
      const end_time = payload.endTime ?? null
      const priority = (payload.priority ?? 'low') as string

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          owner_id,
          title,
          status: 'todo',
          due_date,
          end_date,
          description,
          category_id,
          start_time,
          end_time,
          priority,
        })
        .select(selectFields)
        .single()

      if (error) throw error
      this.tasks.unshift(toAppTask(data as DbTaskRow))
    },

    async updateTask(updated: Task) {
      this.error = ''

      const title = updated.title?.trim() || 'Task'
      const due_date = updated.date || null
      const rawDescription = (updated.description ?? null) as string | null
      const end_date = (updated.endDate ?? null) ?? extractLegacyEndDate(rawDescription)
      const description = stripLegacyEndDate(rawDescription)

      const category_id = updated.categoryId ?? null
      const start_time = updated.startTime ?? null
      const end_time = updated.endTime ?? null
      const priority = (updated.priority ?? 'low') as string

      const { data, error } = await supabase
        .from('tasks')
        .update({
          title,
          status: updated.status,
          due_date,
          end_date,
          description,
          category_id,
          start_time,
          end_time,
          priority,
        })
        .eq('id', updated.id)
        .select(selectFields)
        .single()

      if (error) throw error

      const next = toAppTask(data as DbTaskRow)
      this.tasks = this.tasks.map((t) => (t.id === updated.id ? next : t))
    },

    async toggleStatus(id: string) {
      this.error = ''

      const current = this.tasks.find((t) => t.id === id)
      if (!current) return

      const nextStatus: TaskStatus = current.status === 'done' ? 'todo' : 'done'

      const { data, error } = await supabase
        .from('tasks')
        .update({ status: nextStatus })
        .eq('id', id)
        .select(selectFields)
        .single()

      if (error) throw error

      const next = toAppTask(data as DbTaskRow)
      this.tasks = this.tasks.map((t) => (t.id === id ? next : t))
    },

    async removeTask(id: string) {
      this.error = ''

      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error

      this.tasks = this.tasks.filter((t) => t.id !== id)
    },
  },
})
