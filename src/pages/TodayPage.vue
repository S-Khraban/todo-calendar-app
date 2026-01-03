<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useTasksStore } from '@/stores/tasks';
import type { TaskCategory, Task } from '@/types';
import TaskModal from '@/components/organisms/TaskModal.vue';
import { toLocalIso, formatFullDateUA } from '@/utils/date';

const tasksStore = useTasksStore();
const route = useRoute();

const todayIso = toLocalIso(new Date());

type TaskPriority = 'low' | 'medium' | 'high';

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const getPriority = (p?: TaskPriority) => p ?? 'low';

const currentDate = computed(() => {
  const param = route.params.date as string | undefined;
  return param || todayIso;
});

const tasksForDate = computed(() =>
  tasksStore
    .tasksByDate(currentDate.value)
    .slice()
    .sort((a, b) => {
      const pa = priorityOrder[getPriority(a.priority as TaskPriority | undefined)];
      const pb = priorityOrder[getPriority(b.priority as TaskPriority | undefined)];
      if (pa !== pb) return pa - pb;

      return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
    }),
);

const currentDateLabel = computed(() => formatFullDateUA(currentDate.value));

const hasTasks = computed(() => tasksForDate.value.length > 0);

const isTaskModalOpen = ref(false);
const editingTask = ref<Task | null>(null);
const modalDate = ref(currentDate.value);

type SavePayload = {
  id?: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  category: TaskCategory;
  status: Task['status'];
  priority?: TaskPriority;
};

const openCreate = () => {
  modalDate.value = currentDate.value;
  editingTask.value = null;
  isTaskModalOpen.value = true;
};

const openEdit = (task: Task) => {
  modalDate.value = task.date;
  editingTask.value = task;
  isTaskModalOpen.value = true;
};

const handleSaveTask = (payload: SavePayload) => {
  if (payload.id) {
    const existing = tasksStore.tasks.find(t => t.id === payload.id);
    if (!existing) return;

    const updated: Task = {
      ...existing,
      title: payload.title.trim() || existing.title,
      description: payload.description,
      date: payload.date,
      endDate: payload.endDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      category: payload.category,
      status: payload.status,
      priority: payload.priority ?? (existing.priority as TaskPriority | undefined) ?? 'low',
    };

    tasksStore.updateTask(updated);
  } else {
    const newTask: Omit<Task, 'id'> = {
      title: payload.title.trim(),
      description: payload.description,
      date: payload.date,
      endDate: payload.endDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      category: payload.category,
      status: payload.status,
      priority: payload.priority ?? 'low',
    };

    tasksStore.addTask(newTask);
  }
};

const toggleStatus = (task: Task) => {
  tasksStore.toggleStatus(task.id);
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
      <button
        type="button"
        class="px-4 py-2 rounded-md bg-brand-primary text-white text-sm cursor-pointer"
        @click="openCreate"
      >
        Add task
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
          :class="[
            getPriority(task.priority as TaskPriority | undefined) === 'high' ? 'ring-1 ring-amber-400/60 border-amber-300/60' : '',
            getPriority(task.priority as TaskPriority | undefined) === 'medium' ? 'border-border-soft/80' : '',
          ]"
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
                'truncate',
                getPriority(task.priority as TaskPriority | undefined) === 'medium' ? 'font-semibold' : 'font-medium',
                task.status === 'done'
                  ? 'line-through text-text-muted'
                  : 'text-text-primary',
              ]"
            >
              <span
                v-if="getPriority(task.priority as TaskPriority | undefined) === 'high'"
                class="mr-1 text-amber-500"
                aria-hidden="true"
              >★</span>
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
            type="button"
            class="text-xs text-brand-primary"
            @click="openEdit(task)"
          >
            Edit
          </button>
        </li>
      </ul>
    </section>

    <TaskModal
      v-model="isTaskModalOpen"
      :task="editingTask"
      :default-date="modalDate"
      @save="handleSaveTask"
    />
  </div>
</template>
