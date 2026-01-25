<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useTasksStore } from '@/stores/tasks'
import { useCategoriesStore } from '@/stores/categories'
import { useGroupsStore } from '@/stores/groups'
import type { Task, TaskStatus, TaskPriority } from '@/types'
import TaskModal from '@/components/organisms/TaskModal.vue'
import DayTasksList from '@/components/organisms/DayTasksList.vue'
import TasksFilters from '@/components/organisms/TasksFilters.vue'
import { toLocalIso, formatMonthLabel } from '@/utils/date'
import BaseButton from '@/components/ui/BaseButton.vue'
import { getTaskStatusEmoji } from '@/shared/taskStatusEmoji'

const { t, locale } = useI18n()

const tasksStore = useTasksStore()
const categoriesStore = useCategoriesStore()
const groupsStore = useGroupsStore()

const { visibleCategories } = storeToRefs(categoriesStore)
const { groups } = storeToRefs(groupsStore)

onMounted(async () => {
  await Promise.all([
    categoriesStore.fetchCategories(),
    groupsStore.fetchMyGroups(),
    tasksStore.load(),
  ])
})

const categoryMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  for (const c of visibleCategories.value ?? []) {
    map[c.id] = c.name
  }
  return map
})

const groupMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  for (const g of groups.value ?? []) {
    map[g.groupId] = g.name
  }
  return map
})

const getBadgeLabel = (task: Task) => {
  const groupId = (task as any).groupId ?? (task as any).group_id ?? null
  if (groupId) return groupMap.value[groupId] ?? t('common.group')

  const id = task.categoryId ?? null
  if (!id) return t('common.none')
  return categoryMap.value[id] ?? t('common.none')
}

const today = new Date()
const todayIso = toLocalIso(today)

const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDate = ref<string>(todayIso)

const monthLabel = computed(() =>
  formatMonthLabel(currentMonth.value, locale.value),
)

const weekDaysShort = computed(() => [
  t('calendar.weekdays.mon'),
  t('calendar.weekdays.tue'),
  t('calendar.weekdays.wed'),
  t('calendar.weekdays.thu'),
  t('calendar.weekdays.fri'),
  t('calendar.weekdays.sat'),
  t('calendar.weekdays.sun'),
])

type DayCell = {
  iso: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  emojiTodo: string
  emojiInProgress: string
  emojiOverdue: string
}

type UIPriority = 'low' | 'medium' | 'high'

const priorityOrder: Record<UIPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const getPriority = (p?: UIPriority) => p ?? 'low'

const filteredAllTasks = ref<Task[]>([])
const onFilteredUpdate = (flat: Task[]) => {
  filteredAllTasks.value = flat
}

const filteredTasksByDate = computed<Record<string, Task[]>>(() => {
  const map: Record<string, Task[]> = {}
  for (const tt of filteredAllTasks.value) {
    const key = tt.date
    if (!map[key]) map[key] = []
    map[key]!.push(tt)
  }
  return map
})

const getFilteredTasksForDay = (iso: string) =>
  filteredTasksByDate.value[iso] ?? []

const monthDays = computed<DayCell[]>(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstOfMonth = new Date(year, month, 1)

  let weekDay = firstOfMonth.getDay()
  if (weekDay === 0) weekDay = 7
  const daysBefore = weekDay - 1

  const nextMonthFirst = new Date(year, month + 1, 1)
  const daysInMonth = Math.round(
    (nextMonthFirst.getTime() - firstOfMonth.getTime()) /
      (1000 * 60 * 60 * 24),
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

    const tasksForDay = getFilteredTasksForDay(iso)

    const hasTodo = tasksForDay.some(tt => tt.status === 'todo')
    const hasInProgress = tasksForDay.some(
      tt => tt.status === 'in_progress',
    )
    const hasOverdue =
      iso < todayIso && tasksForDay.some(tt => tt.status !== 'done')

    cells.push({
      iso,
      dayNumber: d.getDate(),
      isCurrentMonth,
      isToday,
      emojiTodo: hasTodo && !hasOverdue ? getTaskStatusEmoji('todo') : '',
      emojiInProgress: hasInProgress
        ? getTaskStatusEmoji('in_progress')
        : '',
      emojiOverdue: hasOverdue ? getTaskStatusEmoji('overdue') : '',
    })
  }

  return cells
})

const baseSelectedTasks = computed(() =>
  tasksStore
    .tasksByDate(selectedDate.value)
    .slice()
    .sort((a, b) => {
      const pa = priorityOrder[getPriority(a.priority as UIPriority | undefined)]
      const pb = priorityOrder[getPriority(b.priority as UIPriority | undefined)]
      if (pa !== pb) return pa - pb

      const aTime = a.startTime || '00:00'
      const bTime = b.startTime || '00:00'
      return aTime.localeCompare(bTime)
    }),
)

const selectedFilteredTasks = computed(() => {
  const list = getFilteredTasksForDay(selectedDate.value)
  const set = new Set(list.map(tt => tt.id))
  return baseSelectedTasks.value.filter(tt => set.has(tt.id))
})

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
  groupId: string | null
  assignedUserId?: string | null
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
    await tasksStore.updateTask(payload)
    return
  }
  await tasksStore.addTask(payload)
}

const handleToggleStatus = (id: string) => {
  tasksStore.toggleStatus(id)
}
</script>

<template>
  <div class="page-container">
    <div class="calendar-filters-row">
      <TasksFilters
        :tasks="tasksStore.tasks"
        @update:filteredTasks="onFilteredUpdate($event)"
      />
      <BaseButton size="sm" variant="outline" @click="goToToday">
        {{ t('calendar.actions.today') }}
      </BaseButton>
    </div>

    <div class="rounded-lg border border-border-soft bg-app-surface shadow-sm p-3 md:p-4">
      <div class="flex items-center justify-between mb-3 text-sm">
        <BaseButton variant="outline" size="sm" @click="changeMonth(-1)">
          {{ t('calendar.actions.prev') }}
        </BaseButton>

        <div class="font-semibold capitalize text-text-primary text-sm md:text-base">
          {{ monthLabel }}
        </div>

        <BaseButton variant="outline" size="sm" @click="changeMonth(1)">
          {{ t('calendar.actions.next') }}
        </BaseButton>
      </div>

      <div class="calendar-inner">
        <div class="grid grid-cols-7 gap-1 text-[11px] md:text-[12px] text-center mb-1 text-text-muted uppercase tracking-wide">
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
                class="flex items-center justify-center w-6 h-6 rounded-full"
                :class="[
                  day.isToday && !(selectedDate === day.iso)
                    ? 'bg-brand-primarySoft text-brand-primary'
                    : 'text-text-primary',
                ]"
              >
                {{ day.dayNumber }}
              </div>
            </div>

            <div class="calendar-markers">
              <span v-if="day.emojiOverdue" class="calendar-marker">
                {{ day.emojiOverdue }}
              </span>
              <span v-if="day.emojiInProgress" class="calendar-marker">
                {{ day.emojiInProgress }}
              </span>
              <span v-if="day.emojiTodo" class="calendar-marker">
                {{ day.emojiTodo }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <DayTasksList
        :date-label="selectedDate"
        :tasks="selectedFilteredTasks"
        :category-map="categoryMap"
        :get-badge-label="getBadgeLabel"
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

<style scoped>
.calendar-filters-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.calendar-filters-row > :first-child {
  flex: 1;
}

.calendar-inner {
  max-width: 560px;
  margin: 0 auto;
}

.calendar-day {
  aspect-ratio: 1 / 0.5;
}

.calendar-markers {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 16px;
}

.calendar-marker {
  line-height: 1;
  font-size: 14px;
}

@media (max-width: 600px) {
  .calendar-markers {
    height: 14px;
  }

  .calendar-marker {
    font-size: 11px;
  }
}
</style>
