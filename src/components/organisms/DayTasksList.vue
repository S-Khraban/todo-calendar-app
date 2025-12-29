<script setup lang="ts">
import type { Task } from '@/types';

const { dateLabel, tasks } = defineProps<{
  dateLabel: string;
  tasks: Task[];
}>();

const emit = defineEmits<{
  (e: 'add'): void;
  (e: 'edit', task: Task): void;
  (e: 'toggle-status', id: string): void;
}>();

const handleToggle = (id: string) => {
  emit('toggle-status', id);
};

const handleEdit = (task: Task) => {
  emit('edit', task);
};
</script>

<template>
  <section>
    <div class="flex items-center justify-between mb-2 gap-3">
      <h2 class="text-base font-semibold text-text-primary">
        Tasks for {{ dateLabel }}
      </h2>

      <button
        type="button"
        class="px-3 py-1.5 rounded-md bg-brand-primary text-white text-xs cursor-pointer"
        @click="emit('add')"
      >
        Add task
      </button>
    </div>

    <div
      v-if="tasks.length === 0"
      class="text-text-muted text-sm"
    >
      No tasks for this day.
    </div>

    <ul
      v-else
      class="list-none p-0 m-0 flex flex-col gap-2 text-sm"
    >
      <li
        v-for="task in tasks"
        :key="task.id"
        class="flex items-center gap-3 px-3 py-2 rounded-md border border-border-soft bg-app-surface shadow-sm cursor-pointer"
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
              'font-medium truncate',
              task.status === 'done'
                ? 'line-through text-text-muted'
                : 'text-text-primary'
            ]"
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

        <span
          class="text-[11px] px-2 py-0.5 rounded-full bg-brand-primarySoft text-brand-primary shrink-0"
        >
          {{ task.category }}
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
</style>
