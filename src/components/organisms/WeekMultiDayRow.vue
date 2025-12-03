<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types'

const props = defineProps<{
  weekStartIso: string
  weekEndIso: string
  tasks: Task[]
}>()

const toDate = (iso: string) => new Date(`${iso}T00:00:00`)

const diffInDays = (later: Date, earlier: Date) =>
  Math.round((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24))

const formatDate = (iso: string) => {
  const d = toDate(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear()).slice(2)
  return `${day}.${month}.${year}`
}

const weekStartDate = computed(() => toDate(props.weekStartIso))
const weekEndDate = computed(() => toDate(props.weekEndIso))

const longEvents = computed(() => {
  const weekStart = weekStartDate.value
  const weekEnd = weekEndDate.value

  return props.tasks
    .filter(task => task.endDate && task.endDate !== task.date)
    .filter(task => {
      const taskStart = toDate(task.date)
      const taskEnd = toDate(task.endDate as string)
      return taskEnd >= weekStart && taskStart <= weekEnd
    })
    .map(task => {
      const taskStart = toDate(task.date)
      const taskEnd = toDate(task.endDate as string)

      const clampedStart = taskStart < weekStart ? weekStart : taskStart
      const clampedEnd = taskEnd > weekEnd ? weekEnd : taskEnd

      const startIdx = diffInDays(clampedStart, weekStart)
      const endIdx = diffInDays(clampedEnd, weekStart)

      const dateRange =
        task.date === task.endDate
          ? formatDate(task.date)
          : `${formatDate(task.date)} – ${formatDate(task.endDate as string)}`

      const hasTime = task.startTime || task.endTime
      const timeRange = hasTime
        ? `${task.startTime || '??:??'} – ${task.endTime || '...'}`
        : null

      return {
        id: task.id,
        title: task.title,
        startCol: startIdx + 1,
        endCol: endIdx + 2,
        dateRange,
        timeRange,
      }
    })
})
</script>

<template>
  <div
    v-if="longEvents.length"
    class="pd4u-week-long__grid"
  >
    <div
      v-for="event in longEvents"
      :key="event.id"
      class="pd4u-week-long__event"
      :style="{ gridColumn: event.startCol + ' / ' + event.endCol }"
    >
      <div class="pd4u-week-long__title">
        {{ event.title }}
      </div>

      <div class="pd4u-week-long__meta">
        <span>{{ event.dateRange }}</span>
        <span v-if="event.timeRange">
          • {{ event.timeRange }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pd4u-week-long__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 12px;
}

.pd4u-week-long__event {
  background-color: #dbeafe;
  border: 1px solid #2563eb;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: #1d4ed8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pd4u-week-long__title {
  font-weight: 500;
  line-height: 1.2;
}

.pd4u-week-long__meta {
  font-size: 11px;
  color: #1f2937;
}
</style>
