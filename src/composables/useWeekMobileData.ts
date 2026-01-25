import { computed } from 'vue'
import type { Ref } from 'vue'
import type { Task } from '@/types'

type UIPriority = 'low' | 'medium' | 'high'

type WeekDay = {
  iso: string
  weekday: string
  dayNumber: number
}

const priorityOrder: Record<UIPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const getPriority = (p?: UIPriority) => p ?? 'low'

const isoToDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

const isIsoInRange = (iso: string, startIso: string, endIso: string) => {
  const x = isoToDate(iso).getTime()
  const a = isoToDate(startIso).getTime()
  const b = isoToDate(endIso).getTime()
  return x >= Math.min(a, b) && x <= Math.max(a, b)
}

export const useWeekMobileData = (
  weekDays: Ref<WeekDay[]>,
  allTasks: Ref<Task[]>,
) => {
  const singleDayByIso = computed<Record<string, Task[]>>(() => {
    const map: Record<string, Task[]> = {}

    for (const day of weekDays.value) {
      map[day.iso] = allTasks.value
        .filter(t => !t.endDate || t.endDate === t.date)
        .filter(t => t.date === day.iso)
        .slice()
        .sort((a, b) => {
          const pa = priorityOrder[getPriority(a.priority as UIPriority | undefined)]
          const pb = priorityOrder[getPriority(b.priority as UIPriority | undefined)]
          if (pa !== pb) return pa - pb
          return (a.startTime || '00:00').localeCompare(b.startTime || '00:00')
        })
    }

    return map
  })

  const multiDayByIso = computed<Record<string, Task[]>>(() => {
    const map: Record<string, Task[]> = {}

    for (const day of weekDays.value) {
      map[day.iso] = allTasks.value
        .filter(t => !!t.endDate && t.endDate !== t.date)
        .filter(t => isIsoInRange(day.iso, t.date, t.endDate!))
        .slice()
        .sort((a, b) => {
          const pa = priorityOrder[getPriority(a.priority as UIPriority | undefined)]
          const pb = priorityOrder[getPriority(b.priority as UIPriority | undefined)]
          if (pa !== pb) return pa - pb
          return (a.startTime || '00:00').localeCompare(b.startTime || '00:00')
        })
    }

    return map
  })

  return {
    singleDayByIso,
    multiDayByIso,
  }
}
