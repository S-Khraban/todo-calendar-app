<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TaskItem from '@/components/molecules/TaskItem.vue'
import { useGroupsStore } from '@/stores/groups'
import { withAlpha } from '@/utils/color'

type TaskPriority = 'low' | 'medium' | 'high'

type TaskItemData = {
  id: string | number
  title: string
  startDate: string
  endDate?: string | null
  isCompleted: boolean
  isToday?: boolean
  priority?: TaskPriority
  groupId?: string | null
}

const props = defineProps<{
  tasks: TaskItemData[]
  emptyLabel?: string
}>()

const emit = defineEmits<{
  (e: 'toggleCompleted', payload: { id: string | number; value: boolean }): void
  (e: 'edit', id: string | number): void
  (e: 'delete', id: string | number): void
}>()

const { t } = useI18n()

const groupsStore = useGroupsStore()

const groupColorById = computed(() => {
  const m = new Map<string, string>()
  groupsStore.groups.forEach((g) => m.set(g.groupId, g.color))
  return m
})

const getGroupColor = (groupId?: string | null) => {
  if (!groupId) return null
  return groupColorById.value.get(groupId) ?? null
}

const getGroupBg = (groupId?: string | null) => {
  const c = getGroupColor(groupId)
  return c ? withAlpha(c, 0.1) : null
}

const handleToggle = (payload: { id: string | number; value: boolean }) => {
  emit('toggleCompleted', payload)
}

const handleEdit = (id: string | number) => {
  emit('edit', id)
}

const handleDelete = (id: string | number) => {
  emit('delete', id)
}
</script>

<template>
  <div class="pd4u-task-list">
    <div v-if="!props.tasks.length" class="pd4u-task-list__empty">
      {{ props.emptyLabel || t('tasks.empty') }}
    </div>

    <div v-else class="pd4u-task-list__items">
      <div
        v-for="task in props.tasks"
        :key="task.id"
        class="pd4u-task-list__row"
        :style="{
          '--group-bg': getGroupBg(task.groupId) || '',
          '--group-accent': getGroupColor(task.groupId) || '',
        }"
      >
        <TaskItem
          :id="task.id"
          :title="task.title"
          :start-date="task.startDate"
          :end-date="task.endDate"
          :is-completed="task.isCompleted"
          :is-today="task.isToday"
          :priority="task.priority"
          @toggle-completed="handleToggle"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pd4u-task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pd4u-task-list__items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pd4u-task-list__row {
  border-radius: 10px;
  overflow: hidden;
}

.pd4u-task-list__empty {
  padding: 12px 10px;
  border-radius: var(--pd4u-radius-sm, 8px);
  border: 1px dashed var(--pd4u-card-border, #e5e7eb);
  background-color: var(--pd4u-empty-bg, #f9fafb);
  font-size: var(--pd4u-font-size-sm, 14px);
  color: var(--pd4u-text-muted, #6b7280);
}
</style>
