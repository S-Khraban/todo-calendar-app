<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types'
import { storeToRefs } from 'pinia'
import { useGroupsStore } from '@/stores/groups'
import { withAlpha } from '@/utils/color'

const { dateLabel, tasks, categoryMap, getBadgeLabel } = defineProps<{
  dateLabel: string
  tasks: Task[]
  categoryMap: Record<string, string>
  getBadgeLabel?: (task: Task) => string
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'edit', task: Task): void
  (e: 'toggle-status', id: string): void
}>()

const groupsStore = useGroupsStore()
const { groups } = storeToRefs(groupsStore)

const groupColorMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  for (const g of groups.value ?? []) {
    map[g.groupId] = g.color
  }
  return map
})

const getTaskGroupId = (task: Task) => (task as any).groupId ?? (task as any).group_id ?? null

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

const handleToggle = (id: string) => {
  emit('toggle-status', id)
}

const handleEdit = (task: Task) => {
  emit('edit', task)
}

const priorityOrder: Record<NonNullable<Task['priority']>, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const getPriority = (p?: Task['priority']) => p ?? 'low'

const sortedTasks = computed(() => {
  return [...tasks].sort((a, b) => {
    const pa = priorityOrder[getPriority(a.priority)]
    const pb = priorityOrder[getPriority(b.priority)]
    if (pa !== pb) return pa - pb

    const aDone = a.status === 'done' ? 1 : 0
    const bDone = b.status === 'done' ? 1 : 0
    return aDone - bDone
  })
})

const getCategoryLabel = (task: Task) => {
  const id = task.categoryId
  if (!id) return '—'
  return categoryMap[id] ?? '—'
}

const getLabel = (task: Task) => {
  return getBadgeLabel ? getBadgeLabel(task) : getCategoryLabel(task)
}
</script>

<template>
  <section>
    <div class="flex items-center justify-between mb-2 gap-3">
      <h2 class="text-base font-semibold text-text-primary">Tasks for {{ dateLabel }}</h2>

      <button
        type="button"
        class="px-3 py-1.5 rounded-md bg-brand-primary text-white text-xs cursor-pointer"
        @click="emit('add')"
      >
        Add task
      </button>
    </div>

    <div v-if="sortedTasks.length === 0" class="text-text-muted text-sm">
      No tasks for this day.
    </div>

    <ul v-else class="list-none p-0 m-0 flex flex-col gap-2 text-sm">
      <li
        v-for="task in sortedTasks"
        :key="task.id"
        class="flex items-center gap-3 px-3 py-2 rounded-md border shadow-sm cursor-pointer"
        :style="taskRowStyle(task)"
        :class="[
          getPriority(task.priority) === 'high' ? 'ring-1 ring-amber-400/60' : '',
          getPriority(task.priority) === 'medium' ? 'border-border-soft/80' : '',
        ]"
        @click="handleEdit(task)"
      >
        <input
          type="checkbox"
          :checked="task.status === 'done'"
          @click.stop
          @change="handleToggle(task.id)"
          class="cursor-pointer"
        />

        <div class="flex-1 min-w-0">
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
            <span v-if="task.startTime || task.endTime">
              {{ task.startTime || '??:??' }} – {{ task.endTime || '...' }}
            </span>
            <span v-else>No time</span>
          </div>
        </div>

        <span class="text-[11px] px-2 py-0.5 rounded-full bg-brand-primarySoft text-brand-primary shrink-0">
          {{ getLabel(task) }}
        </span>
      </li>
    </ul>
  </section>
</template>
