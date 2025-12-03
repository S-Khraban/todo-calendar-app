<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTasksStore } from '@/stores/tasks';

const tasksStore = useTasksStore();

const today = new Date();
const todayIso = today.toISOString().slice(0, 10);

const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1));
const selectedDate = ref<string>(todayIso);

const monthLabel = computed(() =>
  currentMonth.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
);

const weekDaysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const monthDays = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  const firstOfMonth = new Date(year, month, 1);

  let weekDay = firstOfMonth.getDay();
  if (weekDay === 0) weekDay = 7;
  const daysBefore = weekDay - 1;

  const nextMonthFirst = new Date(year, month + 1, 1);
  const daysInMonth = Math.round(
    (nextMonthFirst.getTime() - firstOfMonth.getTime()) / (1000 * 60 * 60 * 24)
  );

  const totalCellsRaw = daysBefore + daysInMonth;
  const rows = Math.max(4, Math.ceil(totalCellsRaw / 7));
  const totalCells = rows * 7;

  const firstCellDate = new Date(firstOfMonth);
  firstCellDate.setDate(firstOfMonth.getDate() - daysBefore);

  const cells = [];

  for (let i = 0; i < totalCells; i += 1) {
    const d = new Date(firstCellDate);
    d.setDate(firstCellDate.getDate() + i);

    const iso = d.toISOString().slice(0, 10);
    const isCurrentMonth = d.getMonth() === month;
    const isToday = iso === todayIso;
    const hasTasks = tasksStore.tasksByDate(iso).length > 0;

    cells.push({
      iso,
      dayNumber: d.getDate(),
      isCurrentMonth,
      isToday,
      hasTasks,
    });
  }

  return cells;
});

const selectedTasks = computed(() =>
  tasksStore
    .tasksByDate(selectedDate.value)
    .slice()
    .sort((a, b) => {
      const aTime = a.startTime || '00:00';
      const bTime = b.startTime || '00:00';
      return aTime.localeCompare(bTime);
    })
);

const changeMonth = (delta: number) => {
  const d = new Date(currentMonth.value);
  d.setMonth(d.getMonth() + delta);
  currentMonth.value = d;
};

const selectDay = (iso: string) => {
  selectedDate.value = iso;
};

const goToToday = () => {
  currentMonth.value = new Date(today.getFullYear(), today.getMonth(), 1);
  selectedDate.value = todayIso;
};
</script>

<template>
  <div class="page-container">
    <div class="flex items-center justify-between mb-4 gap-3">
      <h1 class="text-xl font-semibold text-text-primary">
        Tasks calendar
      </h1>

      <button
        type="button"
        @click="goToToday"
        class="px-3 py-1.5 rounded-md border border-border-soft bg-white text-xs text-text-primary cursor-pointer hover:bg-app-surfaceSoft"
      >
        Today
      </button>
    </div>

    <div
      class="rounded-lg border border-border-soft bg-app-surface shadow-sm p-3 md:p-4"
    >
      <div class="flex items-center justify-between mb-3 text-sm">
        <button
          type="button"
          @click="changeMonth(-1)"
          class="px-3 py-1.5 rounded-md border border-border-soft bg-white text-text-primary cursor-pointer hover:bg-app-surfaceSoft"
        >
          ‹ Previous
        </button>

        <div class="font-semibold capitalize text-text-primary text-sm md:text-base">
          {{ monthLabel }}
        </div>

        <button
          type="button"
          @click="changeMonth(1)"
          class="px-3 py-1.5 rounded-md border border-border-soft bg-white text-text-primary cursor-pointer hover:bg-app-surfaceSoft"
        >
          Next ›
        </button>
      </div>

      <div class="calendar-inner">
        <div
          class="grid grid-cols-7 gap-1 text-[11px] md:text-[12px] text-center mb-1 text-text-muted uppercase tracking-wide"
        >
          <div
            v-for="w in weekDaysShort"
            :key="w"
            class="py-1"
          >
            {{ w }}
          </div>
        </div>

        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="day in monthDays"
            :key="day.iso"
            type="button"
            @click="selectDay(day.iso)"
            :class="[
              'calendar-day relative flex flex-col items-center justify-between rounded-md border text-[13px] cursor-pointer select-none transition bg-app-surface',
              selectedDate === day.iso
                ? 'border-2 border-brand-primary bg-brand-primarySoft/70'
                : 'border border-border-soft',
              day.isToday ? 'ring-1 ring-brand-primary/60' : '',
              day.isCurrentMonth ? 'opacity-100' : 'opacity-50 bg-app-surfaceSoft'
            ]"
          >
            <div class="mt-1">
              <div
                class="flex items-center justify-center w-7 h-7 rounded-full"
                :class="[
                  day.isToday && !(selectedDate === day.iso)
                    ? 'bg-brand-primarySoft text-brand-primary'
                    : 'text-text-primary'
                ]"
              >
                {{ day.dayNumber }}
              </div>
            </div>

            <span
              v-if="day.hasTasks"
              class="mb-1 w-1.5 h-1.5 rounded-full bg-brand-accent"
            />
          </button>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-base font-semibold text-text-primary mb-2">
        Tasks for {{ selectedDate }}
      </h2>

      <div
        v-if="selectedTasks.length === 0"
        class="text-text-muted text-sm"
      >
        No tasks for this day.
      </div>

      <ul
        v-else
        class="list-none p-0 m-0 flex flex-col gap-2 text-sm"
      >
        <li
          v-for="task in selectedTasks"
          :key="task.id"
          class="flex items-center gap-3 px-3 py-2 rounded-md border border-border-soft bg-app-surface shadow-sm"
        >
          <input
            type="checkbox"
            :checked="task.status === 'done'"
            @change="tasksStore.toggleStatus(task.id)"
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
    </div>
  </div>
</template>

<style scoped>
.calendar-inner {
  max-width: 560px;
  margin: 0 auto;
}

/* квадратні клітинки */
.calendar-day {
  aspect-ratio: 1 / 1;
}
</style>
