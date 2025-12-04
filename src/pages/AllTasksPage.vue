<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import type { TaskCategory, TaskStatus, Task } from '@/types'
import Button from '@/components/atoms/Button.vue'
import TaskModal from '@/components/organisms/TaskModal.vue'
import { toLocalIso, formatIsoShort } from '@/utils/date'

const tasksStore = useTasksStore()

const categoryFilter = ref<TaskCategory | 'all'>('all')
const statusFilter = ref<TaskStatus | 'all'>('all')

const todayIso = toLocalIso(new Date())

const isTaskModalOpen = ref(false)
const editingTask = ref<Task | null>(null)
const modalDate = ref<string>(todayIso)

type SavePayload = {
  id?: string
  title: string
  description?: string
  date: string
  endDate?: string
  startTime?: string
  endTime?: string
  category: TaskCategory
  status: TaskStatus
}

const filteredTasks = computed(() => {
  return tasksStore.tasks
    .filter(task => {
      if (categoryFilter.value !== 'all' && task.category !== categoryFilter.value) {
        return false
      }

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

const handleSaveTask = (payload: SavePayload) => {
  if (payload.id) {
    const existing = tasksStore.tasks.find(t => t.id === payload.id)
    if (!existing) return

    const updated: Task = {
      ...existing,
      title: payload.title.trim() || existing.title,
      description: payload.description,
      date: payload.date,
      endDate: payload.endDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      category: payload.category,
      status: payload.status,
    }

    tasksStore.updateTask(updated)
  } else {
    const newTask: Omit<Task, 'id'> = {
      title: payload.title.trim(),
      description: payload.description,
      date: payload.date,
      endDate: payload.endDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      category: payload.category,
      status: payload.status,
    }

    tasksStore.addTask(newTask)
  }
}
</script>

<template>
  <div class="page-container">
    <div class="flex items-center justify-between mb-4 gap-3">
      <h1>All tasks</h1>

      <Button
        type="button"
        size="sm"
        variant="primary"
        @click="openCreate"
      >
        Add task
      </Button>
    </div>

    <div class="flex flex-wrap gap-3 mb-5 text-sm">
      <label class="flex items-center gap-1">
        <span>Category:</span>
        <select
          v-model="categoryFilter"
          class="ml-1 px-2 py-1 rounded-md border border-border-soft bg-white text-text-primary text-sm focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
        >
          <option value="all">All</option>
          <option value="work">Work</option>
          <option value="study">Study</option>
          <option value="rest">Rest</option>
          <option value="holiday">Holiday</option>
          <option value="other">Other</option>
        </select>
      </label>

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

    <div
      v-if="filteredTasks.length === 0"
      class="text-text-muted text-sm"
    >
      No tasks for current filters.
    </div>

    <ul
      v-else
      class="list-none p-0 m-0 flex flex-col gap-2 text-sm"
    >
      <li
        v-for="task in filteredTasks"
        :key="task.id"
        class="grid grid-cols-[1fr,auto] gap-2 items-start px-3 py-2 rounded-md border border-border-soft bg-app-surface shadow-sm cursor-pointer"
        @click="startEdit(task)"
      >
        <div class="min-w-0">
          <div
            :class="[
              'font-medium truncate',
              task.status === 'done'
                ? 'line-through text-text-muted'
                : 'text-text-primary',
            ]"
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
            {{ task.category }}
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
