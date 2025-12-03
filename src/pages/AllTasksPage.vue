<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import type { TaskCategory, TaskStatus, Task } from '@/types'
import Input from '@/components/atoms/Input.vue'
import Button from '@/components/atoms/Button.vue'
import Checkbox from '@/components/atoms/Checkbox.vue'

const tasksStore = useTasksStore()

const categoryFilter = ref<TaskCategory | 'all'>('all')
const statusFilter = ref<TaskStatus | 'all'>('all')

const editingId = ref<string | null>(null)
const editTitle = ref('')
const editCategory = ref<TaskCategory>('work')
const editStartTime = ref('')
const editEndTime = ref('')
const editDate = ref('')
const editEndDate = ref('')

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

const formatDate = (date: string) => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear()).slice(2)
  return `${day}.${month}.${year}`
}

const startEdit = (task: Task) => {
  editingId.value = task.id
  editTitle.value = task.title
  editCategory.value = task.category
  editStartTime.value = task.startTime || ''
  editEndTime.value = task.endTime || ''
  editDate.value = task.date
  editEndDate.value = task.endDate ?? task.date
}

const cancelEdit = () => {
  editingId.value = null
}

const saveEdit = () => {
  if (!editingId.value) return

  const original = tasksStore.tasks.find(t => t.id === editingId.value)
  if (!original) {
    editingId.value = null
    return
  }

  const start = editDate.value || original.date
  const end = editEndDate.value || original.endDate || start

  const updated: Task = {
    ...original,
    title: editTitle.value.trim() || original.title,
    category: editCategory.value,
    startTime: editStartTime.value || undefined,
    endTime: editEndTime.value || undefined,
    date: start,
    endDate: end,
  }

  tasksStore.updateTask(updated)
  editingId.value = null
}
</script>

<template>
  <div class="page-container">
    <h1>All tasks</h1>

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

    <div v-if="filteredTasks.length === 0" class="text-text-muted text-sm">
      No tasks for current filters.
    </div>

    <ul v-else class="list-none p-0 m-0 flex flex-col gap-2 text-sm">
      <li
        v-for="task in filteredTasks"
        :key="task.id"
        class="grid grid-cols-[auto,1fr,auto] gap-2 items-start px-3 py-2 rounded-md border border-border-soft bg-app-surface shadow-sm"
      >
        <Checkbox
          :model-value="task.status === 'done'"
          @update:model-value="() => tasksStore.toggleStatus(task.id)"
        />

        <div>
          <div v-if="editingId === task.id">
            <div class="flex flex-wrap gap-2 mb-2">
              <Input v-model="editTitle" type="text" class="flex-1 min-w-52" />
              <Input v-model="editStartTime" type="time" class="w-26" />
              <Input v-model="editEndTime" type="time" class="w-26" />
              <Input v-model="editDate" type="date" class="w-38" />
              <Input v-model="editEndDate" type="date" class="w-38" />

              <select
                v-model="editCategory"
                class="w-34 px-2 py-1 rounded-md border border-border-soft bg-white text-sm text-text-primary focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
              >
                <option value="work">Work</option>
                <option value="study">Study</option>
                <option value="rest">Rest</option>
                <option value="holiday">Holiday</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="flex gap-2">
              <Button type="button" size="sm" variant="primary" @click="saveEdit">
                Save
              </Button>

              <Button type="button" size="sm" variant="ghost" @click="cancelEdit">
                Cancel
              </Button>
            </div>
          </div>

          <div v-else>
            <div
              :class="[
                'font-medium',
                task.status === 'done'
                  ? 'line-through text-text-muted'
                  : 'text-text-primary',
              ]"
            >
              {{ task.title }}
            </div>

            <div class="text-xs text-text-muted mt-0.5">
              {{ formatDate(task.date) }}
              <span v-if="task.endDate && task.endDate !== task.date">
                → {{ formatDate(task.endDate) }}
              </span>
              <span v-if="task.startTime || task.endTime">
                • {{ task.startTime || '??:??' }} – {{ task.endTime || '...' }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-end gap-1">
          <span class="text-[11px] px-2 py-0.5 rounded-full bg-brand-primarySoft text-brand-primary">
            {{ task.category }}
          </span>

          <Button
            v-if="editingId !== task.id"
            type="button"
            size="sm"
            variant="ghost"
            class="border-none bg-transparent text-[11px] text-brand-primary hover:text-brand-primary/80 cursor-pointer px-0"
            @click="startEdit(task)"
          >
            Edit
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            class="border-none bg-transparent text-[11px] text-rose-500 hover:text-rose-400 cursor-pointer px-0"
            @click="tasksStore.removeTask(task.id)"
          >
            Delete
          </Button>
        </div>
      </li>
    </ul>
  </div>
</template>
