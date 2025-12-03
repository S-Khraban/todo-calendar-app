<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTasksStore } from '@/stores/tasks'
import DateBadge from '@/components/atoms/DateBadge.vue'
import WeekMultiDayRow from '@/components/organisms/WeekMultiDayRow.vue'

const tasksStore = useTasksStore()
const router = useRouter()

const toLocalIso = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const today = new Date()
const todayIso = toLocalIso(today)

const startOfWeek = new Date(today)
const weekdayIndex = startOfWeek.getDay() || 7
startOfWeek.setDate(startOfWeek.getDate() - (weekdayIndex - 1))

type WeekDay = {
  iso: string
  weekday: string
  dayNumber: number
}

const weekDays: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(startOfWeek)
  d.setDate(startOfWeek.getDate() + i)

  const iso = toLocalIso(d)
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
  const dayNumber = d.getDate()

  return { iso, weekday, dayNumber }
})

const weekStartIso = weekDays[0]!.iso
const weekEndIso = weekDays[6]!.iso

const tasksByDay = computed(() =>
  weekDays.map(dayInfo => {
    const tasks = tasksStore
      .tasksByDate(dayInfo.iso)
      .filter(task => !(task.endDate && task.endDate !== task.date))
      .slice()
      .sort((a, b) => {
        const aTime = a.startTime || '00:00'
        const bTime = b.startTime || '00:00'
        return aTime.localeCompare(bTime)
      })

    return { day: dayInfo, tasks }
  }),
)

const openDay = (iso: string) => {
  router.push({ name: 'date', params: { date: iso } })
}
</script>

<template>
  <div class="page-container">
    <h1>Weekly overview</h1>

    <div class="pd4u-week-row">
      <div
        v-for="day in weekDays"
        :key="day.iso"
        class="pd4u-week-header"
        @click="openDay(day.iso)"
      >
        <span
          :class="[
            'pd4u-week-header__weekday',
            day.iso === todayIso ? 'text-brand-primary' : 'text-text-muted',
          ]"
        >
          {{ day.weekday }}
        </span>

        <DateBadge
          :day="day.dayNumber"
          :is-today="day.iso === todayIso"
          :has-tasks="tasksStore.tasksByDate(day.iso).length > 0"
        />
      </div>
    </div>

    <WeekMultiDayRow
      :week-start-iso="weekStartIso"
      :week-end-iso="weekEndIso"
      :tasks="tasksStore.tasks"
    />

    <div class="pd4u-week-cells">
      <div
        v-for="col in tasksByDay"
        :key="col.day.iso"
        class="pd4u-week-cell"
        :class="{ 'pd4u-week-cell--today': col.day.iso === todayIso }"
        @click="openDay(col.day.iso)"
      >
        <div
          v-if="col.tasks.length === 0"
          class="pd4u-week-empty"
        >
          No tasks
        </div>

        <ul
          v-else
          class="pd4u-week-tasks"
        >
          <li
            v-for="task in col.tasks"
            :key="task.id"
            class="pd4u-week-task"
          >
            <div
              v-if="task.startTime || task.endTime"
              class="pd4u-week-task__time"
            >
              {{ task.startTime || '??:??' }} – {{ task.endTime || '...' }}
            </div>

            <div
              :class="[
                'pd4u-week-task__title',
                task.status === 'done'
                  ? 'line-through text-text-muted'
                  : 'text-text-primary',
              ]"
            >
              {{ task.title }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pd4u-week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;
}

.pd4u-week-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.pd4u-week-header__weekday {
  font-size: 12px;
  font-weight: 600;
}

.pd4u-week-cells {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  font-size: 13px;
}

.pd4u-week-cell {
  border-radius: 12px;
  border: 1px solid var(--pd4u-card-border, #e5e7eb);
  background-color: var(--pd4u-card-bg, #ffffff);
  padding: 8px;
  min-height: 80px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}

.pd4u-week-cell--today {
  border-color: #2563eb;
  background-color: #eff6ff;
}

.pd4u-week-empty {
  font-size: 12px;
  color: var(--pd4u-text-muted, #6b7280);
}

.pd4u-week-tasks {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pd4u-week-task {
  border-radius: 8px;
  padding: 4px 6px;
  background-color: var(--pd4u-empty-bg, #f9fafb);
}

.pd4u-week-task__time {
  font-size: 11px;
  color: var(--pd4u-text-muted, #6b7280);
  margin-bottom: 2px;
}

.pd4u-week-task__title {
  font-size: 13px;
}
</style>
