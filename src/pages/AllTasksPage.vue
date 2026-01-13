<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '@/stores/tasks'
import { useCategoriesStore } from '@/stores/categories'
import type { TaskStatus, Task } from '@/types'
import Button from '@/components/atoms/Button.vue'
import TaskModal from '@/components/organisms/TaskModal.vue'
import { toLocalIso, formatIsoShort } from '@/utils/date'

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

const getCategoryLabel = (categoryId: string | null) => {
  if (!categoryId) return '—'
  return categoryMap.value[categoryId] ?? '—'
}

const statusFilter = ref<TaskStatus | 'all'>('all')
const todayIso = toLocalIso(new Date())

const isTaskModalOpen = ref(false)
const editingTask = ref<Task | null>(null)
const modalDate = ref<string>(todayIso)

type TaskPriority = 'low' | 'medium' | 'high'

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

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const getPriority = (p?: TaskPriority) => p ?? 'low'

const filteredTasks = computed(() => {
  return tasksStore.tasks
    .filter(task => {
      if (statusFilter.value !== 'all' && task.status !== statusFilter.value) {
        return false
      }
      return true
    })
    .slice()
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date)
      }

      const pa = priorityOrder[getPriority(a.priority)]
      const pb = priorityOrder[getPriority(b.priority)]
      if (pa !== pb) return pa - pb

      const aTime = a.startTime || '00:00'
      const bTime = b.startTime || '00:00'
      return aTime.localeCompare(bTime)
    })
})

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
</script>

<template>
  <div class="page-container">
    <div class="flex items-center justify-between mb-4 gap-3">
      <h1>All tasks</h1>

      <Button type="button" size="sm" variant="primary" @click="openCreate">
        Add task
      </Button>
    </div>

    <div class="flex flex-wrap gap-3 mb-5 text-sm">
      <label class="flex items-center gap-1">
        <span>Status:</span>
        <select
          v-model="statusFilter"
          class="ml-1 px-2 py-1 rounded-md border border-border-soft bg-white text-text-primary text-sm focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
        >
          <option value="all">All</option>
          <option value="todo">Planned</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </label>
    </div>

    <div v-if="filteredTasks.length === 0" class="text-text-muted text-sm">
      No tasks for current filters.
    </div>

    <ul v-else class="list-none p-0 m-0 flex flex-col gap-2 text-sm">
      <li
        v-for="task in filteredTasks"
        :key="task.id"
        class="grid grid-cols-[1fr,auto] gap-2 items-start px-3 py-2 rounded-md border border-border-soft bg-app-surface shadow-sm cursor-pointer"
        :class="[
          getPriority(task.priority) === 'high' ? 'ring-1 ring-amber-400/60 border-amber-300/60' : '',
          getPriority(task.priority) === 'medium' ? 'border-border-soft/80' : '',
        ]"
        @click="startEdit(task)"
      >
        <div class="min-w-0">
          <div
            :class="[
              'truncate',
              getPriority(task.priority) === 'medium' ? 'font-semibold' : 'font-medium',
              task.status === 'done' ? 'line-through text-text-muted' : 'text-text-primary',
            ]"
          >
            <span
              v-if="getPriority(task.priority) === 'high'"
              class="mr-1 text-amber-500"
              aria-hidden="true"
              >★</span
            >
            {{ task.title }}
          </div>

          <div class="text-xs text-text-muted mt-0.5">
            {{ formatIsoShort(task.date) }}
            <span v-if="task.endDate && task.endDate !== task.date">
              → {{ formatIsoShort(task.endDate) }}
            </span>
            <span v-if="task.startTime || task.endTime">
              • {{ task.startTime || '??:??' }} – {{ task.endTime || '...' }}
            </span>
          </div>

          <div class="mt-0.5 text-[11px] text-text-muted">
            Status:
            <span class="capitalize">{{ task.status.replace('_', ' ') }}</span>
          </div>
        </div>

        <div class="flex flex-col items-end gap-1">
          <span class="text-[11px] px-2 py-0.5 rounded-full bg-brand-primarySoft text-brand-primary">
            {{ getCategoryLabel(task.categoryId) }}
          </span>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            class="border-none bg-transparent text-[11px] text-rose-500 hover:text-rose-400 cursor-pointer px-0"
            @click.stop="tasksStore.removeTask(task.id)"
          >
            Delete
          </Button>
        </div>
      </li>
    </ul>

    <TaskModal
      v-model="isTaskModalOpen"
      :task="editingTask"
      :default-date="modalDate"
      @save="handleSaveTask"
    />
  </div>
</template>
