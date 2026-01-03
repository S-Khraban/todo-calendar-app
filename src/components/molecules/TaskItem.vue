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

const isLongTerm = computed(() => {
  if (!props.endDate) return false
  return props.endDate !== props.startDate
})

const isHigh = computed(() => props.priority === 'high')
const isMedium = computed(() => props.priority === 'medium')

const handleToggle = (value: boolean) => {
  emit('toggleCompleted', { id: props.id, value })
}

const handleEdit = () => {
  emit('edit', props.id)
}

const handleDelete = () => {
  emit('delete', props.id)
}
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
      <Checkbox :model-value="props.isCompleted" @update:model-value="handleToggle">
        <span
          class="pd4u-task-item__title"
          :class="{
            'pd4u-task-item__title--done': props.isCompleted,
            'pd4u-task-item__title--medium': isMedium,
          }"
        >
          <span v-if="isHigh" class="pd4u-task-item__star" aria-hidden="true">★</span>
          {{ props.title }}
        </span>
      </Checkbox>
    </div>

    <div class="pd4u-task-item__meta">
      <div class="pd4u-task-item__dates">
        <DateBadge
          :day="new Date(props.startDate).getDate()"
          :is-today="props.isToday"
        />

        <span v-if="isLongTerm" class="pd4u-task-item__date-range">
          →
          <DateBadge
            :day="props.endDate ? new Date(props.endDate).getDate() : ''"
          />
        </span>
      </div>

      <div class="pd4u-task-item__actions">
        <Button
          variant="ghost"
          size="sm"
          @click="handleEdit"
        >
          Edit
        </Button>

        <Button
          variant="ghost"
          size="sm"
          @click="handleDelete"
        >
          Del
        </Button>
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
  background-color: var(--pd4u-card-bg, #ffffff);
  border: 1px solid var(--pd4u-card-border, #e5e7eb);

  box-sizing: border-box;
}

.pd4u-task-item--high {
  border-color: var(--pd4u-priority-high-border, #fbbf24);
  box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.35);
}

.pd4u-task-item--medium {
  border-color: var(--pd4u-priority-medium-border, #d1d5db);
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
  display: inline-block;
  margin-right: 6px;
  font-size: 12px;
  line-height: 1;
  color: var(--pd4u-priority-high, #f59e0b);
  transform: translateY(-1px);
}

.pd4u-task-item__title--medium {
  font-weight: 600;
}

.pd4u-task-item__title--done {
  text-decoration: line-through;
  color: var(--pd4u-text-muted, #9ca3af);
}
</style>
