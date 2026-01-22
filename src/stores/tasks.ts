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
  group_id: string | null
  assigned_user_id: string | null
  groups?: { name: string | null }[] | null
}

type ModalTaskPayload = {
  id?: string
  title: string
  description?: string
  date: string
  endDate?: string
  startTime?: string
  endTime?: string
  categoryId: string | null
  status: TaskStatus
  priority?: TaskPriority
  groupId: string | null
  assignedUserId?: string | null
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

const normalizeNullableUuid = (v: string | null | undefined) => (v && v.trim() ? v : null)

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
    groupId: row.group_id ?? null,
    assignedUserId: row.assigned_user_id ?? null,
    groupName: row.groups?.[0]?.name ?? null,
  } as Task
}

const selectFields =
  'id,title,status,due_date,end_date,description,category_id,start_time,end_time,priority,group_id,assigned_user_id,groups(name)'

const dbRowFromModal = (payload: ModalTaskPayload) => {
  const title = payload.title?.trim() || 'Task'
  const due_date = payload.date || null
  const rawDescription = (payload.description ?? null) as string | null
  const end_date = (payload.endDate ?? null) ?? extractLegacyEndDate(rawDescription)
  const description = stripLegacyEndDate(rawDescription)

  const group_id = normalizeNullableUuid(payload.groupId)
  const category_id = group_id ? null : payload.categoryId ?? null

  const start_time = payload.startTime ?? null
  const end_time = payload.endTime ?? null
  const priority = (payload.priority ?? 'low') as string
  const assigned_user_id = group_id ? normalizeNullableUuid(payload.assignedUserId) : null

  return {
    title,
    status: payload.status ?? 'todo',
    due_date,
    end_date,
    description,
    category_id,
    start_time,
    end_time,
    priority,
    group_id,
    assigned_user_id,
  }
}

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
        const end = (t as any).endDate ?? t.date
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

    async addTask(payload: ModalTaskPayload) {
      this.error = ''

      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr) throw userErr

        const owner_id = userData.user?.id
        if (!owner_id) throw new Error('Not authenticated')

        const row = dbRowFromModal(payload)

        const { data, error } = await supabase
          .from('tasks')
          .insert({
            owner_id,
            ...row,
          })
          .select(selectFields)
          .single()

        if (error) throw error
        this.tasks.unshift(toAppTask(data as DbTaskRow))
        return true
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to add task'
        console.error('addTask error:', {
          message: e?.message,
          code: e?.code,
          details: e?.details,
          hint: e?.hint,
        })
        return false
      }
    },

    async updateTask(payload: ModalTaskPayload) {
      if (!payload.id) return false
      this.error = ''

      try {
        const row = dbRowFromModal(payload)

        const patch: Partial<DbTaskRow> = {
          title: row.title,
          status: row.status,
          due_date: row.due_date,
          end_date: row.end_date,
          description: row.description,
          category_id: row.category_id,
          start_time: row.start_time,
          end_time: row.end_time,
          priority: row.priority,
        }

        const { error } = await supabase.from('tasks').update(patch).eq('id', payload.id)
        if (error) throw error

        const { data, error: e2 } = await supabase
          .from('tasks')
          .select(selectFields)
          .eq('id', payload.id)
          .single()

        if (e2) throw e2

        const next = toAppTask(data as DbTaskRow)
        this.tasks = this.tasks.map((t) => (t.id === payload.id ? next : t))
        return true
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to update task'
        console.error('updateTask error:', {
          message: e?.message,
          code: e?.code,
          details: e?.details,
          hint: e?.hint,
        })
        return false
      }
    },

    async loadPersonal() {
      this.error = ''
      this.isLoading = true

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(selectFields)
          .is('group_id', null)
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

    async loadByGroup(groupId: string) {
      this.error = ''
      this.isLoading = true

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(selectFields)
          .eq('group_id', groupId)
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

    async toggleStatus(id: string) {
      this.error = ''

      try {
        const current = this.tasks.find((t) => t.id === id)
        if (!current) return false

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
        return true
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to update status'
        console.error('toggleStatus error:', {
          message: e?.message,
          code: e?.code,
          details: e?.details,
          hint: e?.hint,
        })
        return false
      }
    },

    async removeTask(id: string) {
      this.error = ''

      try {
        const { error } = await supabase.from('tasks').delete().eq('id', id)
        if (error) throw error

        this.tasks = this.tasks.filter((t) => t.id !== id)
        return true
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to remove task'
        console.error('removeTask error:', {
          message: e?.message,
          code: e?.code,
          details: e?.details,
          hint: e?.hint,
        })
        return false
      }
    },
  },
})
