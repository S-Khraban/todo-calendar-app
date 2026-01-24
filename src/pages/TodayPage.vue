<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useTasksStore } from '@/stores/tasks'
import { useCategoriesStore } from '@/stores/categories'
import { useGroupsStore } from '@/stores/groups'
import type { Task, TaskStatus, TaskPriority } from '@/types'
import TaskModal from '@/components/organisms/TaskModal.vue'
import TasksFilters from '@/components/organisms/TasksFilters.vue'
import { toLocalIso, formatFullDateUA } from '@/utils/date'
import BaseButton from '@/components/ui/BaseButton.vue'
import { withAlpha } from '@/utils/color'

const tasksStore = useTasksStore()
const categoriesStore = useCategoriesStore()
const groupsStore = useGroupsStore()

const { visibleCategories } = storeToRefs(categoriesStore)
const { groups } = storeToRefs(groupsStore)
const route = useRoute()
const router = useRouter()

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

const groupColorMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  for (const g of groups.value ?? []) {
    map[g.groupId] = g.color
  }
  return map
})

const getTaskGroupId = (task: Task) =>
  (task as any).groupId ?? (task as any).group_id ?? null

const getTaskGroupColor = (task: Task) => {
  const groupId = getTaskGroupId(task)
  if (!groupId) return null
  return groupColorMap.value[groupId] ?? null
}

const taskRowStyle = (task: Task) => {
  const color = getTaskGroupColor(task)
  if (!color) return {}
  return {
    backgroundColor: withAlpha(color, 0.1),
    borderColor: color,
  }
}

const getBadgeLabel = (task: Task) => {
  const groupId = getTaskGroupId(task)
  if (groupId) return groupMap.value[groupId] ?? 'Group'
  const id = task.categoryId ?? null
  if (!id) return '—'
  return categoryMap.value[id] ?? '—'
}

const todayIso = toLocalIso(new Date())

type UIPrio = 'low' | 'medium' | 'high'
const priorityOrder: Record<UIPrio, number> = { high: 0, medium: 1, low: 2 }
const getPriority = (p?: UIPrio) => p ?? 'low'

const currentDate = computed(() => {
  const param = route.params.date as string | undefined
  return param || todayIso
})

const addDaysIso = (iso: string, delta: number) => {
  const parts = iso.split('-')

  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])

  const safeYear = Number.isFinite(year) ? year : 1970
  const safeMonth = Number.isFinite(month) ? month - 1 : 0
  const safeDay = Number.isFinite(day) ? day : 1

  const date = new Date(safeYear, safeMonth, safeDay)
  date.setDate(date.getDate() + delta)

  return toLocalIso(date)
}

const goToDate = (iso: string) => {
  router.push({ name: 'date', params: { date: iso } })
}

const goPrevDay = () => goToDate(addDaysIso(currentDate.value, -1))
const goNextDay = () => goToDate(addDaysIso(currentDate.value, 1))
const goToToday = () => goToDate(todayIso)

const baseTasksForDate = computed(() =>
  tasksStore
    .tasksByDate(currentDate.value)
    .slice()
    .sort((a, b) => {
      const pa = priorityOrder[getPriority(a.priority as UIPrio | undefined)]
      const pb = priorityOrder[getPriority(b.priority as UIPrio | undefined)]
      if (pa !== pb) return pa - pb
      return (a.startTime || '00:00').localeCompare(b.startTime || '00:00')
    }),
)

const filteredTasks = ref<Task[]>([])
watch(
  () => baseTasksForDate.value,
  v => {
    filteredTasks.value = v
  },
  { immediate: true },
)

const currentDateLabel = computed(() => formatFullDateUA(currentDate.value))
const hasTasks = computed(() => filteredTasks.value.length > 0)

const isTaskModalOpen = ref(false)
const editingTask = ref<Task | null>(null)
const modalDate = ref(currentDate.value)

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
  modalDate.value = currentDate.value
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

const toggleStatus = (task: Task) => {
  tasksStore.toggleStatus(task.id)
}
</script>

<template>
  <div class="page-container">
    <header class="mb-4 space-y-2">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-xl font-semibold text-text-primary">
          Tasks for {{ currentDateLabel }}
        </h1>

        <div class="flex items-center gap-2 shrink-0">
          <BaseButton size="sm" variant="outline" @click="goPrevDay">← Prev</BaseButton>
          <BaseButton size="sm" variant="outline" @click="goToToday">Today</BaseButton>
          <BaseButton size="sm" variant="outline" @click="goNextDay">Next →</BaseButton>
        </div>
      </div>

      <p class="text-sm text-text-muted">
        {{ hasTasks ? 'Here are your tasks for this day.' : 'No tasks yet, add one below.' }}
      </p>
    </header>

    <TasksFilters
      :tasks="baseTasksForDate"
      @update:filteredTasks="filteredTasks = $event"
    />

<section class="mb-6 flex flex-wrap items-center justify-center gap-3">
  <button
    type="button"
    class="px-4 py-2 rounded-md bg-brand-primary text-white text-sm cursor-pointer"
    @click="openCreate"
  >
    Add task
  </button>
</section>

    <section>
      <div v-if="filteredTasks.length === 0" class="text-sm text-text-muted">
        No tasks for this day.
      </div>

      <ul v-else class="flex flex-col gap-2 text-sm">
        <li
          v-for="task in filteredTasks"
          :key="task.id"
          class="flex items-center gap-3 px-3 py-2 rounded-md border shadow-sm"
          :style="taskRowStyle(task)"
          :class="[
            getPriority(task.priority as UIPrio | undefined) === 'high'
              ? 'ring-1 ring-amber-400/60'
              : '',
          ]"
        >
          <input
            type="checkbox"
            :checked="task.status === 'done'"
            class="cursor-pointer"
            @change="toggleStatus(task)"
          />

          <div class="flex-1 min-w-0">
            <div
              :class="[
                'truncate',
                getPriority(task.priority as UIPrio | undefined) === 'medium'
                  ? 'font-semibold'
                  : 'font-medium',
                task.status === 'done'
                  ? 'line-through text-text-muted'
                  : 'text-text-primary',
              ]"
            >
              <span
                v-if="getPriority(task.priority as UIPrio | undefined) === 'high'"
                class="mr-1 text-amber-500"
              >
                ★
              </span>
              {{ task.title }}
            </div>

            <div class="text-xs text-text-muted mt-0.5">
              <span v-if="task.startTime || task.endTime">
                {{ task.startTime || '??:??' }} – {{ task.endTime || '...' }}
              </span>
              <span v-else>No time</span>
            </div>
          </div>

          <span class="text-[11px] px-2 py-0.5 rounded-full bg-brand-primarySoft text-brand-primary shrink-0">
            {{ getBadgeLabel(task) }}
          </span>

          <button type="button" class="text-xs text-brand-primary" @click="openEdit(task)">
            Edit
          </button>
        </li>
      </ul>
    </section>

    <TaskModal
      v-model="isTaskModalOpen"
      :task="editingTask"
      :default-date="modalDate"
      @save="handleSaveTask"
    />
  </div>
</template>
