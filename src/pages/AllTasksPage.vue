<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/tasks'
import { useCategoriesStore } from '@/stores/categories'
import { useGroupsStore } from '@/stores/groups'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import Button from '@/components/atoms/Button.vue'
import TaskModal from '@/components/organisms/TaskModal.vue'
import TasksFilters from '@/components/organisms/TasksFilters.vue'
import { toLocalIso, formatIsoShort } from '@/utils/date'
import { withAlpha } from '@/utils/color'

const tasksStore = useTasksStore()
const categoriesStore = useCategoriesStore()
const groupsStore = useGroupsStore()

const { visibleCategories } = storeToRefs(categoriesStore)
const { groups } = storeToRefs(groupsStore)

onMounted(async () => {
  await Promise.all([categoriesStore.fetchCategories(), groupsStore.fetchMyGroups(), tasksStore.load()])
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
  ((task as any).groupId ?? (task as any).group_id ?? null) as string | null

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

  const categoryId = task.categoryId ?? null
  if (!categoryId) return '—'
  return categoryMap.value[categoryId] ?? '—'
}

type UIPriority = 'low' | 'medium' | 'high'

const priorityOrder: Record<UIPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const getPriority = (p?: UIPriority) => p ?? 'low'

const todayIso = toLocalIso(new Date())

const isTaskModalOpen = ref(false)
const editingTask = ref<Task | null>(null)
const modalDate = ref<string>(todayIso)

const baseTasks = computed(() =>
  tasksStore.tasks
    .slice()
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)

      const pa = priorityOrder[getPriority(a.priority as UIPriority | undefined)]
      const pb = priorityOrder[getPriority(b.priority as UIPriority | undefined)]
      if (pa !== pb) return pa - pb

      const aTime = a.startTime || '00:00'
      const bTime = b.startTime || '00:00'
      return aTime.localeCompare(bTime)
    }),
)

const filteredTasks = ref<Task[]>([])

watch(
  () => baseTasks.value,
  v => {
    filteredTasks.value = v
  },
  { immediate: true },
)

const onFilteredUpdate = (flat: Task[]) => {
  const set = new Set(flat.map(t => t.id))
  filteredTasks.value = baseTasks.value.filter(t => set.has(t.id))
}

const openCreate = () => {
  modalDate.value = todayIso
  editingTask.value = null
  isTaskModalOpen.value = true
}

const startEdit = (task: Task) => {
  modalDate.value = task.date
  editingTask.value = task
  isTaskModalOpen.value = true
}

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

const handleSaveTask = async (payload: SavePayload) => {
  if (payload.id) {
    await tasksStore.updateTask(payload as any)
    return
  }

  await tasksStore.addTask(payload as any)
}
</script>

<template>
  <div class="page-container">
    <div class="flex items-center justify-between mb-4 gap-3">
      <h1>All tasks</h1>

      <Button type="button" size="sm" variant="primary" @click="openCreate">
        Add task
      </Button>
    </div>

    <div class="mb-5">
      <TasksFilters :tasks="baseTasks" @update:filteredTasks="onFilteredUpdate($event)" />
    </div>

    <div v-if="filteredTasks.length === 0" class="text-text-muted text-sm">
      No tasks for current filters.
    </div>

    <ul v-else class="list-none p-0 m-0 flex flex-col gap-2 text-sm">
      <li
        v-for="task in filteredTasks"
        :key="task.id"
        class="grid grid-cols-[1fr,auto] gap-2 items-center px-2 py-1.5 rounded-md border cursor-pointer"
        :style="taskRowStyle(task)"
        :class="[
          getPriority(task.priority as UIPriority | undefined) === 'high' ? 'ring-1 ring-amber-400/50' : '',
          getPriority(task.priority as UIPriority | undefined) === 'medium' ? 'border-border-soft/80' : '',
        ]"
        @click="startEdit(task)"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-2 min-w-0">
            <div
              :class="[
                'truncate leading-5',
                getPriority(task.priority as UIPriority | undefined) === 'medium' ? 'font-semibold' : 'font-medium',
                task.status === 'done' ? 'line-through text-text-muted' : 'text-text-primary',
              ]"
            >
              <span
                v-if="getPriority(task.priority as UIPriority | undefined) === 'high'"
                class="mr-1 text-amber-500"
                aria-hidden="true"
                >★</span
              >
              {{ task.title }}
            </div>

            <span class="shrink-0 text-[11px] text-text-muted">
              {{ formatIsoShort(task.date) }}
              <span v-if="task.endDate && task.endDate !== task.date">→ {{ formatIsoShort(task.endDate) }}</span>
            </span>

            <span v-if="task.startTime || task.endTime" class="shrink-0 text-[11px] text-text-muted">
              • {{ task.startTime || '??:??' }}–{{ task.endTime || '...' }}
            </span>

            <span class="shrink-0 text-[11px] text-text-muted">
              • <span class="capitalize">{{ task.status.replace('_', ' ') }}</span>
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-brand-primarySoft text-brand-primary leading-4">
            {{ getBadgeLabel(task) }}
          </span>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            class="border-none bg-transparent text-[11px] text-rose-500 hover:text-rose-400 cursor-pointer px-0 py-0 h-auto leading-4"
            @click.stop="tasksStore.removeTask(task.id)"
          >
            Delete
          </Button>
        </div>
      </li>
    </ul>

    <TaskModal v-model="isTaskModalOpen" :task="editingTask" :default-date="modalDate" @save="handleSaveTask" />
  </div>
</template>
