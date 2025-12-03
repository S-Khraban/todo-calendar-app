<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useTasksStore } from '@/stores/tasks';
import type { TaskCategory, Task } from '@/types';

const tasksStore = useTasksStore();
const route = useRoute();

const formatLocalDateToIso = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const todayIso = formatLocalDateToIso(new Date());

const currentDate = computed(() => {
  const param = route.params.date as string | undefined;
  return param || todayIso;
});

const newTitle = ref('');
const newCategory = ref<TaskCategory>('work');
const startTime = ref('');
const endTime = ref('');
const newDate = ref(currentDate.value);
const newEndDate = ref(currentDate.value);

const editingId = ref<string | null>(null);
const editingTitle = ref('');
const editingStartTime = ref('');
const editingEndTime = ref('');
const editingCategory = ref<TaskCategory>('work');
const editingStatus = ref<Task['status']>('todo');

const tasksForDate = computed(() =>
  tasksStore
    .tasksByDate(currentDate.value)
    .slice()
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00')),
);

const currentDateLabel = computed(() => {
  const iso = currentDate.value;

  const [y, m, d] = iso.split('-').map(Number);

  const year = y || new Date().getFullYear();
  const month = m ? m - 1 : new Date().getMonth();
  const day = d || new Date().getDate();

  const date = new Date(year, month, day);

  return date.toLocaleDateString('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

const hasTasks = computed(() => tasksForDate.value.length > 0);

const resetForm = () => {
  newTitle.value = '';
  newCategory.value = 'work';
  startTime.value = '';
  endTime.value = '';
  newDate.value = currentDate.value;
  newEndDate.value = currentDate.value;
};

const addTask = () => {
  const title = newTitle.value.trim();
  if (!title) return;

  const payload: Omit<Task, 'id'> = {
    title,
    date: newDate.value,
    endDate: newEndDate.value || undefined,
    startTime: startTime.value || undefined,
    endTime: endTime.value || undefined,
    category: newCategory.value,
    status: 'todo',
  };

  tasksStore.addTask(payload);
  resetForm();
};

const startEdit = (task: Task) => {
  editingId.value = task.id;
  editingTitle.value = task.title;
  editingStartTime.value = task.startTime || '';
  editingEndTime.value = task.endTime || '';
  editingCategory.value = task.category;
  editingStatus.value = task.status;
};

const cancelEdit = () => {
  editingId.value = null;
};

const saveEdit = (task: Task) => {
  if (!editingId.value) return;

  const updated: Task = {
    ...task,
    title: editingTitle.value.trim() || task.title,
    startTime: editingStartTime.value || undefined,
    endTime: editingEndTime.value || undefined,
    category: editingCategory.value,
    status: editingStatus.value,
  };

  tasksStore.updateTask(updated);
  editingId.value = null;
};

const toggleStatus = (task: Task) => {
  const next: Task['status'] =
    task.status === 'todo'
      ? 'in_progress'
      : task.status === 'in_progress'
      ? 'done'
      : 'todo';

  const updated: Task = { ...task, status: next };
  tasksStore.updateTask(updated);
};
</script>

<template>
  <div class="page-container">
    <header class="mb-4 space-y-1">
      <h1 class="text-xl font-semibold text-text-primary">
        Tasks for {{ currentDateLabel }}
      </h1>
      <p class="text-sm text-text-muted">
        {{ hasTasks ? 'Here are your tasks for this day.' : 'No tasks yet, add one below.' }}
      </p>
    </header>

    <section class="mb-6 flex flex-wrap items-center gap-3">
      <input
        v-model="newTitle"
        type="text"
        placeholder="New task"
        class="border border-border-soft rounded-md px-3 py-2 text-sm flex-1 min-w-[180px]"
      />

      <input
        v-model="startTime"
        type="time"
        class="border border-border-soft rounded-md px-2 py-1 text-sm"
      />

      <input
        v-model="endTime"
        type="time"
        class="border border-border-soft rounded-md px-2 py-1 text-sm"
      />

      <select
        v-model="newCategory"
        class="border border-border-soft rounded-md px-2 py-1 text-sm"
      >
        <option value="work">Work</option>
        <option value="personal">Personal</option>
        <option value="family">Family</option>
        <option value="other">Other</option>
      </select>

      <button
        type="button"
        class="px-3 py-2 rounded-md bg-brand-primary text-white text-sm cursor-pointer"
        @click="addTask"
      >
        Add
      </button>
    </section>

    <section>
      <div
        v-if="tasksForDate.length === 0"
        class="text-sm text-text-muted"
      >
        No tasks for this day.
      </div>

      <ul
        v-else
        class="flex flex-col gap-2 text-sm"
      >
        <li
          v-for="task in tasksForDate"
          :key="task.id"
          class="flex items-center gap-3 px-3 py-2 rounded-md border border-border-soft bg-app-surface shadow-sm"
        >
          <input
            type="checkbox"
            :checked="task.status === 'done'"
            class="cursor-pointer"
            @change="toggleStatus(task)"
          />

          <div class="flex-1 min-w-0">
            <div
              :class="[
                'font-medium truncate',
                task.status === 'done'
                  ? 'line-through text-text-muted'
                  : 'text-text-primary',
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

          <button
            v-if="editingId !== task.id"
            type="button"
            class="text-xs text-brand-primary"
            @click="startEdit(task)"
          >
            Edit
          </button>

          <div
            v-else
            class="flex gap-2"
          >
            <button
              type="button"
              class="text-xs text-brand-primary"
              @click="saveEdit(task)"
            >
              Save
            </button>
            <button
              type="button"
              class="text-xs text-text-muted"
              @click="cancelEdit"
            >
              Cancel
            </button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
