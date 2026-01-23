<script setup lang="ts">
import { computed } from 'vue'
import Checkbox from '@/components/atoms/Checkbox.vue'
import Button from '@/components/atoms/Button.vue'
import DateBadge from '@/components/atoms/DateBadge.vue'

type TaskPriority = 'low' | 'medium' | 'high'

const props = defineProps<{
  id: string | number
  title: string
  startDate: string
  endDate?: string | null
  isCompleted: boolean
  isToday?: boolean
  priority?: TaskPriority
}>()

const emit = defineEmits<{
  (e: 'toggleCompleted', payload: { id: string | number; value: boolean }): void
  (e: 'edit', id: string | number): void
  (e: 'delete', id: string | number): void
}>()

const isLongTerm = computed(() => (props.endDate ? props.endDate !== props.startDate : false))

const isHigh = computed(() => props.priority === 'high')
const isMedium = computed(() => props.priority === 'medium')

const handleToggle = (value: boolean) => {
  emit('toggleCompleted', { id: props.id, value })
}

const handleEdit = () => emit('edit', props.id)
const handleDelete = () => emit('delete', props.id)
</script>

<template>
  <div
    class="pd4u-task-item"
    :class="{
      'pd4u-task-item--high': isHigh,
      'pd4u-task-item--medium': isMedium,
    }"
  >
    <div class="pd4u-task-item__main">
      <Checkbox :model-value="isCompleted" @update:model-value="handleToggle">
        <span
          class="pd4u-task-item__title"
          :class="{
            'pd4u-task-item__title--done': isCompleted,
            'pd4u-task-item__title--medium': isMedium,
          }"
        >
          <span v-if="isHigh" class="pd4u-task-item__star">★</span>
          {{ title }}
        </span>
      </Checkbox>
    </div>

    <div class="pd4u-task-item__meta">
      <div class="pd4u-task-item__dates">
        <DateBadge :day="new Date(startDate).getDate()" :is-today="isToday" />

        <span v-if="isLongTerm" class="pd4u-task-item__date-range">
          →
          <DateBadge :day="endDate ? new Date(endDate).getDate() : ''" />
        </span>
      </div>

      <div class="pd4u-task-item__actions">
        <Button variant="ghost" size="sm" @click="handleEdit">Edit</Button>
        <Button variant="ghost" size="sm" @click="handleDelete">Del</Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pd4u-task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 8px 10px;
  border-radius: var(--pd4u-radius-sm, 8px);
  background-color: var(--group-bg, #fff);
  border: 1px solid var(--group-accent, #e5e7eb);

  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.pd4u-task-item--high {
  box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.35);
}

.pd4u-task-item__main {
  flex: 1 1 auto;
  min-width: 0;
}

.pd4u-task-item__meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pd4u-task-item__dates {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pd4u-task-item__date-range {
  font-size: 12px;
  color: var(--pd4u-text-muted, #6b7280);
}

.pd4u-task-item__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pd4u-task-item__title {
  font-size: var(--pd4u-font-size-sm, 14px);
  color: var(--pd4u-text-main, #111827);
  word-break: break-word;
}

.pd4u-task-item__star {
  margin-right: 6px;
  font-size: 12px;
  color: var(--pd4u-priority-high, #f59e0b);
}

.pd4u-task-item__title--medium {
  font-weight: 600;
}

.pd4u-task-item__title--done {
  text-decoration: line-through;
  color: var(--pd4u-text-muted, #9ca3af);
}
</style>
