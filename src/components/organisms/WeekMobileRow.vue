<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties, PropType } from 'vue'
import type { Task } from '@/types'
import { getTaskStatusEmoji } from '@/shared/taskStatusEmoji'

export type WeekDay = {
  iso: string
  weekday: string
  dayNumber: number
}

type UIPriority = 'low' | 'medium' | 'high'

const props = defineProps({
  day: { type: Object as PropType<WeekDay>, required: true },
  tasks: { type: Array as PropType<Task[]>, default: () => [] },
  multiDayTasks: { type: Array as PropType<Task[]>, default: () => [] },
  isToday: { type: Boolean, default: false },

  emptyLabel: { type: String, required: true },

  taskStyle: {
    type: Function as PropType<(task: Task) => CSSProperties>,
    default: () => ({}),
  },

  getPriority: {
    type: Function as PropType<(task: Task) => UIPriority>,
    default: (task: Task) => ((task as any).priority as UIPriority) ?? 'low',
  },
})

const emit = defineEmits<{
  (e: 'open-day', iso: string): void
  (e: 'edit-task', task: Task): void
}>()

const hasMultiDay = computed(() => (props.multiDayTasks?.length ?? 0) > 0)

const openDay = () => emit('open-day', props.day.iso)
const editTask = (task: Task) => emit('edit-task', task)

const isHigh = (task: Task) => props.getPriority(task) === 'high'
</script>

<template>
  <div
    class="wmr"
    :class="[{ 'wmr--today': isToday, 'wmr--hasMulti': hasMultiDay }]"
  >
    <button type="button" class="wmr__day" @click="openDay">
      <span class="wmr__weekday">{{ day.weekday }}</span>
      <span class="wmr__num">{{ day.dayNumber }}</span>
    </button>

    <div class="wmr__tasks" @click="openDay">
      <div v-if="tasks.length === 0" class="wmr__empty">
        {{ emptyLabel }}
      </div>

      <ul v-else class="wmr__list">
        <li
          v-for="task in tasks"
          :key="task.id"
          class="wmr__pill"
          :style="taskStyle(task)"
          @click.stop="editTask(task)"
        >
          <span class="wmr__emoji" aria-hidden="true">{{ getTaskStatusEmoji(task.status) }}</span>

          <span v-if="isHigh(task)" class="wmr__star" aria-hidden="true">★</span>

          <span class="wmr__title">{{ task.title }}</span>
        </li>
      </ul>
    </div>

    <div v-if="hasMultiDay" class="wmr__multi">
      <ul class="wmr__multiList">
        <li
          v-for="task in multiDayTasks"
          :key="task.id"
          class="wmr__multiPill"
          :style="taskStyle(task)"
          @click.stop="editTask(task)"
        >
          <span class="wmr__multiIcon" aria-hidden="true">↔</span>
          <span class="wmr__multiTitle">{{ task.title }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.wmr {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 10px;
  align-items: start;
  padding: 8px 0;
}

.wmr--hasMulti {
  grid-template-columns: 54px 1fr 120px;
}

.wmr__day {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.wmr__weekday {
  font-size: 12px;
  font-weight: 700;
  color: var(--pd4u-text-muted, #6b7280);
  text-transform: uppercase;
}

.wmr__num {
  font-size: 12px;
  font-weight: 600;
  color: var(--pd4u-text-muted, #6b7280);
}

.wmr--today .wmr__weekday,
.wmr--today .wmr__num {
  color: #2563eb;
}

.wmr__tasks {
  min-height: 34px;
  cursor: pointer;
}

.wmr__empty {
  font-size: 12px;
  color: var(--pd4u-text-muted, #6b7280);
}

.wmr__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column; 
  gap: 8px;
}

.wmr__pill {
  width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  border: 1px solid rgba(15, 23, 42, 0.18);
  background: #fff;
  font-size: 12px;
  line-height: 1;
  max-width: 100%;
  cursor: pointer;
}

.wmr__emoji {
  flex: 0 0 auto;
}

.wmr__star {
  font-size: 11px;
  color: var(--pd4u-priority-high, #f59e0b);
  transform: translateY(-1px);
  flex: 0 0 auto;
}

.wmr__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wmr__multi {
  display: flex;
  justify-content: flex-end;
}

.wmr__multiList {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.wmr__multiPill {
  width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  border: 1px solid rgba(15, 23, 42, 0.18);
  background: #fff;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
}

.wmr__multiIcon {
  opacity: 0.7;
  flex: 0 0 auto;
}

.wmr__multiTitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
