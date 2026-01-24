import type { Task } from '@/types'

export const TASK_STATUS_EMOJI: Record<string, string> = {
  todo: '⚠️',
  in_progress: '▶️',
  done: '✅',
  overdue: '🔖',
}

export const getTaskStatusEmoji = (status: Task['status']) =>
  TASK_STATUS_EMOJI[String(status)] ?? ''
