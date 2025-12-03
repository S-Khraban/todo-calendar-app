<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import type { Task, TaskCategory } from '@/types'
import TaskForm from '@/components/organisms/TaskForm.vue'
import TaskList from '@/components/organisms/TaskList.vue'

const tasksStore = useTasksStore()

const today = new Date().toISOString().slice(0, 10)

type TaskFormPayload = {
  title: string
  date: string
  endDate: string
  startTime: string
  endTime: string
  category: TaskCategory
}

type TaskListItem = {
  id: string | number
  title: string
  startDate: string
  endDate?: string | null
  isCompleted: boolean
  isToday?: boolean
}

const editingId = ref<string | null>(null)
const editInitialValue = ref<Partial<TaskFormPayload> | null>(null)

const tasksForToday = computed(() =>
  tasksStore.tasksByDate(today).slice().sort((a, b) => {
    const aTime = a.startTime || '00:00'
    const bTime = b.startTime || '00:00'
    return aTime.localeCompare(bTime)
  }),
)

const taskListItems = computed<TaskListItem[]>(() =>
  tasksForToday.value.map(task => ({
    id: task.id,
    title: task.title,
    startDate: task.date,
    endDate: task.endDate ?? task.date,
    isCompleted: task.status === 'done',
    isToday: true,
  })),
)

const handleCreate = (payload: TaskFormPayload) => {
  const start = payload.date || today
  const end = payload.endDate || start

  tasksStore.addTask({
    title: payload.title,
    date: start,
    endDate: end,
    category: payload.category,
    startTime: payload.startTime || undefined,
    endTime: payload.endTime || undefined,
  })
}

const startEditById = (id: string | number) => {
  const task = tasksStore.tasks.find(t => t.id === id)
  if (!task) return

  editingId.value = task.id
  editInitialValue.value = {
    title: task.title,
    date: task.date,
    endDate: task.endDate ?? task.date,
    startTime: task.startTime ?? '',
    endTime: task.endTime ?? '',
    category: task.category,
  }
}

const handleCancelEdit = () => {
  editingId.value = null
  editInitialValue.value = null
}

const handleUpdate = (payload: TaskFormPayload) => {
  if (!editingId.value) return

  const original = tasksStore.tasks.find(t => t.id === editingId.value)
  if (!original) {
    handleCancelEdit()
    return
  }

  const start = payload.date || original.date
  const end = payload.endDate || original.endDate || start

  const updated: Task = {
    ...original,
    title: payload.title.trim() || original.title,
    category: payload.category,
    startTime: payload.startTime || undefined,
    endTime: payload.endTime || undefined,
    date: start,
    endDate: end,
  }

  tasksStore.updateTask(updated)
  handleCancelEdit()
}

const handleToggleCompleted = (payload: { id: string | number; value: boolean }) => {
  tasksStore.toggleStatus(String(payload.id))
}
</script>

<template>
  <div class="page-container">
    <header class="mb-4">
      <h1>
        Today
      </h1>
      <p class="text-sm text-text-muted">
        {{ today }}
      </p>
    </header>

    <TaskForm
      v-if="!editingId"
      submit-label="Add task"
      @submit="handleCreate"
    />

    <TaskForm
      v-else
      :initial-value="editInitialValue || undefined"
      submit-label="Save"
      :show-cancel="true"
      @submit="handleUpdate"
      @cancel="handleCancelEdit"
    />

    <div v-if="tasksForToday.length === 0" class="text-text-muted text-sm">
      No tasks for today yet 🙂
    </div>

    <TaskList
      v-else
      :tasks="taskListItems"
      @toggle-completed="handleToggleCompleted"
      @edit="startEditById"
    />
  </div>
</template>
