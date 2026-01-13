
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  title: string
  status: TaskStatus
  date: string
  endDate?: string | null
  startTime?: string
  endTime?: string
  description?: string | null
  categoryId: string | null
  priority?: TaskPriority
}
