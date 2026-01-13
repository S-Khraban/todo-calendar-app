<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/tasks'
import { useCategoriesStore } from '@/stores/categories'
import type { Task, TaskStatus } from '@/types'
import TaskModal from '@/components/organisms/TaskModal.vue'
import DayTasksList from '@/components/organisms/DayTasksList.vue'
import { toLocalIso, formatMonthLabel } from '@/utils/date'
import BaseButton from '@/components/ui/BaseButton.vue'

const tasksStore = useTasksStore()
const categoriesStore = useCategoriesStore()
const { visibleCategories } = storeToRefs(categoriesStore)

onMounted(async () => {
  await categoriesStore.fetchCategories()
})

const categoryMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  for (const c of visibleCategories.value ?? []) {
    map[c.id] = c.name
  }
  return map
})

const today = new Date()
const todayIso = toLocalIso(today)

const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDate = ref<string>(todayIso)

const monthLabel = computed(() => formatMonthLabel(currentMonth.value))

const weekDaysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type DayCell = {
  iso: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  hasInProgress: boolean
  hasOverdue: boolean
  showTodo: boolean
}

const monthDays = computed<DayCell[]>(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstOfMonth = new Date(year, month, 1)

  let weekDay = firstOfMonth.getDay()
  if (weekDay === 0) weekDay = 7
  const daysBefore = weekDay - 1

  const nextMonthFirst = new Date(year, month + 1, 1)
  const daysInMonth = Math.round(
    (nextMonthFirst.getTime() - firstOfMonth.getTime()) / (1000 * 60 * 60 * 24),
  )

  const totalCellsRaw = daysBefore + daysInMonth
  const rows = Math.max(4, Math.ceil(totalCellsRaw / 7))
  const totalCells = rows * 7

  const firstCellDate = new Date(firstOfMonth)
  firstCellDate.setDate(firstOfMonth.getDate() - daysBefore)

  const cells: DayCell[] = []

  for (let i = 0; i < totalCells; i += 1) {
    const d = new Date(firstCellDate)
    d.setDate(firstCellDate.getDate() + i)

    const iso = toLocalIso(d)
    const isCurrentMonth = d.getMonth() === month
    const isToday = iso === todayIso

    const tasksForDay = tasksStore.tasksByDate(iso)

    const hasTodo = tasksForDay.some(t => t.status === 'todo')
    const hasInProgress = tasksForDay.some(t => t.status === 'in_progress')
    const hasOverdue = iso < todayIso && tasksForDay.some(t => t.status !== 'done')

    const showTodo = hasTodo && !hasOverdue

    cells.push({
      iso,
      dayNumber: d.getDate(),
      isCurrentMonth,
      isToday,
      hasInProgress,
      hasOverdue,
      showTodo,
    })
  }

  return cells
})

type TaskPriority = 'low' | 'medium' | 'high'

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const getPriority = (p?: TaskPriority) => p ?? 'low'

const selectedTasks = computed(() =>
  tasksStore
    .tasksByDate(selectedDate.value)
    .slice()
    .sort((a, b) => {
      const pa = priorityOrder[getPriority(a.priority)]
      const pb = priorityOrder[getPriority(b.priority)]
      if (pa !== pb) return pa - pb

      const aTime = a.startTime || '00:00'
      const bTime = b.startTime || '00:00'
      return aTime.localeCompare(bTime)
    }),
)

const changeMonth = (delta: number) => {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() + delta)
  currentMonth.value = d
}

const selectDay = (iso: string) => {
  selectedDate.value = iso
}

const goToToday = () => {
  currentMonth.value = new Date(today.getFullYear(), today.getMonth(), 1)
  selectedDate.value = todayIso
}

const isTaskModalOpen = ref(false)
const editingTask = ref<Task | null>(null)
const modalDate = ref<string>(selectedDate.value)

type SavePayload = {
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
}

const openCreate = () => {
  modalDate.value = selectedDate.value
  editingTask.value = null
  isTaskModalOpen.value = true
}

const openEdit = (task: Task) => {
  modalDate.value = task.date
  editingTask.value = task
  isTaskModalOpen.value = true
}

const handleSaveTask = async (payload: SavePayload) => {
  if (payload.id) {
    const existing = tasksStore.tasks.find(t => t.id === payload.id)
    if (!existing) return

    const updated: Task = {
      ...existing,
      title: payload.title.trim() || existing.title,
      description: payload.description ?? null,
      date: payload.date,
      endDate: payload.endDate ?? null,
      startTime: payload.startTime,
      endTime: payload.endTime,
      categoryId: payload.categoryId ?? null,
      status: payload.status,
      priority: payload.priority ?? existing.priority ?? 'low',
    }

    await tasksStore.updateTask(updated)
    return
  }

  await tasksStore.addTask({
    title: payload.title.trim(),
    description: payload.description ?? null,
    date: payload.date,
    endDate: payload.endDate ?? null,
    startTime: payload.startTime,
    endTime: payload.endTime,
    categoryId: payload.categoryId ?? null,
    priority: payload.priority ?? 'low',
  } as any)
}

const handleToggleStatus = (id: string) => {
  tasksStore.toggleStatus(id)
}
</script>

<template>
  <div class="page-container">
    <div class="flex items-center justify-between mb-4 gap-3">
      <h1 class="text-xl font-semibold text-text-primary">Tasks calendar</h1>

      <BaseButton size="sm" variant="outline" @click="goToToday">Today</BaseButton>
    </div>

    <div class="rounded-lg border border-border-soft bg-app-surface shadow-sm p-3 md:p-4">
      <div class="flex items-center justify-between mb-3 text-sm">
        <BaseButton variant="outline" size="sm" @click="changeMonth(-1)">‹ Previous</BaseButton>

        <div class="font-semibold capitalize text-text-primary text-sm md:text-base">
          {{ monthLabel }}
        </div>

        <BaseButton variant="outline" size="sm" @click="changeMonth(1)">Next ›</BaseButton>
      </div>

      <div class="calendar-inner">
        <div
          class="grid grid-cols-7 gap-1 text-[11px] md:text-[12px] text-center mb-1 text-text-muted uppercase tracking-wide"
        >
          <div v-for="w in weekDaysShort" :key="w" class="py-1">
            {{ w }}
          </div>
        </div>

        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="day in monthDays"
            :key="day.iso"
            type="button"
            @click="selectDay(day.iso)"
            :class="[
              'calendar-day relative flex flex-col items-center justify-between rounded-md border text-[13px] cursor-pointer select-none transition bg-app-surface',
              selectedDate === day.iso
                ? 'border-2 border-brand-primary bg-brand-primarySoft/70'
                : 'border border-border-soft',
              day.isToday ? 'ring-1 ring-brand-primary/60' : '',
              day.isCurrentMonth ? 'opacity-100' : 'opacity-50 bg-app-surfaceSoft',
            ]"
          >
            <div class="mt-1">
              <div
                class="flex items-center justify-center w-7 h-7 rounded-full"
                :class="[
                  day.isToday && !(selectedDate === day.iso)
                    ? 'bg-brand-primarySoft text-brand-primary'
                    : 'text-text-primary',
                ]"
              >
                {{ day.dayNumber }}
              </div>
            </div>

            <div class="mb-1 flex items-center justify-center gap-0.5 h-3">
              <span v-if="day.hasOverdue" class="calendar-indicator calendar-indicator--square" />
              <span
                v-if="day.hasInProgress"
                class="calendar-indicator calendar-indicator--triangle"
              />
              <span v-if="day.showTodo" class="calendar-indicator calendar-indicator--circle" />
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <DayTasksList
        :date-label="selectedDate"
        :tasks="selectedTasks"
        :category-map="categoryMap"
        @add="openCreate"
        @edit="openEdit"
        @toggle-status="handleToggleStatus"
      />
    </div>

    <TaskModal
      v-model="isTaskModalOpen"
      :task="editingTask"
      :default-date="modalDate"
      @save="handleSaveTask"
    />
  </div>
</template>

<style src="./CalendarPage.css" scoped />
