<script setup lang="ts">
import { computed } from 'vue';
import { useTasksStore } from '@/stores/tasks';

const tasksStore = useTasksStore();

const today = new Date();

const startOfWeek = new Date(today);
const day = startOfWeek.getDay() || 7;
startOfWeek.setDate(startOfWeek.getDate() - (day - 1));

const weekDays = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(startOfWeek);
  d.setDate(startOfWeek.getDate() + i);
  const iso = d.toISOString().slice(0, 10);
  const label = d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
  return { iso, label };
});

const tasksByDay = computed(() =>
  weekDays.map((day) => {
    const tasks = tasksStore.tasksByDate(day.iso).slice().sort((a, b) => {
      const aTime = a.startTime || '00:00';
      const bTime = b.startTime || '00:00';
      return aTime.localeCompare(bTime);
    });
    return { day, tasks };
  })
);

const todayIso = today.toISOString().slice(0, 10);
</script>

<template>
  <div class="page-container">
    <h1>
      Weekly overview
    </h1>

    <div
      class="grid gap-3 text-[13px] md:grid-cols-4 lg:grid-cols-7"
    >
      <div
        v-for="col in tasksByDay"
        :key="col.day.iso"
        :class="[
          'rounded-xl p-3 border bg-app-surface flex flex-col gap-2 min-h-28 shadow-sm',
          col.day.iso === todayIso
            ? 'border-brand-primary bg-brand-primarySoft/60'
            : 'border-border-soft'
        ]"
      >
        <div
          :class="[
            'font-semibold mb-1',
            col.day.iso === todayIso ? 'text-brand-primary' : 'text-text-primary'
          ]"
        >
          {{ col.day.label }}
        </div>

        <div
          v-if="col.tasks.length === 0"
          class="text-text-muted text-xs"
        >
          No tasks
        </div>

        <ul
          v-else
          class="list-none p-0 m-0 flex flex-col gap-1"
        >
          <li
            v-for="task in col.tasks"
            :key="task.id"
            class="rounded-md px-2 py-1 bg-app-surfaceSoft"
          >
            <div
              v-if="task.startTime || task.endTime"
              class="text-[11px] text-text-muted mb-0.5"
            >
              {{ task.startTime || '??:??' }} – {{ task.endTime || '...' }}
            </div>

            <div
              :class="[
                'text-[13px]',
                task.status === 'done'
                  ? 'line-through text-text-muted'
                  : 'text-text-primary'
              ]"
            >
              {{ task.title }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
