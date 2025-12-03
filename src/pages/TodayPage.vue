<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTasksStore } from '@/stores/tasks';
import type { TaskCategory, Task } from '@/types';

const tasksStore = useTasksStore();

const today = new Date().toISOString().slice(0, 10);

const newTitle = ref('');
const newCategory = ref<TaskCategory>('work');
const startTime = ref('');
const endTime = ref('');
const newDate = ref(today);
const newEndDate = ref(today);

const editingId = ref<string | null>(null);
const editTitle = ref('');
const editCategory = ref<TaskCategory>('work');
const editStartTime = ref('');
const editEndTime = ref('');
const editDate = ref(today);
const editEndDate = ref(today);

const tasksForToday = computed(() =>
  tasksStore.tasksByDate(today).slice().sort((a, b) => {
    const aTime = a.startTime || '00:00';
    const bTime = b.startTime || '00:00';
    return aTime.localeCompare(bTime);
  })
);

const handleAdd = () => {
  if (!newTitle.value.trim()) return;

  const start = newDate.value || today;
  const end = newEndDate.value || start;

  tasksStore.addTask({
    title: newTitle.value.trim(),
    date: start,
    endDate: end,
    category: newCategory.value,
    startTime: startTime.value || undefined,
    endTime: endTime.value || undefined,
  });

  newTitle.value = '';
  startTime.value = '';
  endTime.value = '';
  newDate.value = today;
  newEndDate.value = today;
  newCategory.value = 'work';
};

const startEdit = (task: Task) => {
  editingId.value = task.id;
  editTitle.value = task.title;
  editCategory.value = task.category;
  editStartTime.value = task.startTime || '';
  editEndTime.value = task.endTime || '';
  editDate.value = task.date;
  editEndDate.value = task.endDate ?? task.date;
};

const cancelEdit = () => {
  editingId.value = null;
};

const saveEdit = () => {
  if (!editingId.value) return;

  const original = tasksStore.tasks.find((t) => t.id === editingId.value);
  if (!original) {
    editingId.value = null;
    return;
  }

  const start = editDate.value || original.date;
  const end = editEndDate.value || original.endDate || start;

  const updated: Task = {
    ...original,
    title: editTitle.value.trim() || original.title,
    category: editCategory.value,
    startTime: editStartTime.value || undefined,
    endTime: editEndTime.value || undefined,
    date: start,
    endDate: end,
  };

  tasksStore.updateTask(updated);
  editingId.value = null;
};
</script>

<template>
  <div class="page-container">
    <header class="mb-4">
      <h1>
        Today
      </h1>
      <p class="text-sm text-text-muted">
        {{ today }}
      </p>
    </header>

    <form
      @submit.prevent="handleAdd"
      class="flex flex-wrap gap-2 items-center mb-6 bg-app-surface border border-border-soft rounded-2xl p-3 shadow-sm"
    >
      <input
        v-model="newTitle"
        type="text"
        placeholder="New task..."
        class="flex-1 min-w-40 px-3 py-2 rounded-md border border-border-soft bg-white text-sm text-text-primary placeholder:text-text-muted focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
      />

      <input
        v-model="startTime"
        type="time"
        class="w-26 px-2 py-2 rounded-md border border-border-soft bg-white text-sm focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
      />

      <input
        v-model="endTime"
        type="time"
        class="w-26 px-2 py-2 rounded-md border border-border-soft bg-white text-sm focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
      />

      <input
        v-model="newDate"
        type="date"
        class="w-38 px-2 py-2 rounded-md border border-border-soft bg-white text-sm focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
      />

      <input
        v-model="newEndDate"
        type="date"
        class="w-38 px-2 py-2 rounded-md border border-border-soft bg-white text-sm focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
      />

      <select
        v-model="newCategory"
        class="w-34 px-2 py-2 rounded-md border border-border-soft bg-white text-sm text-text-primary focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
      >
        <option value="work">Work</option>
        <option value="study">Study</option>
        <option value="rest">Rest</option>
        <option value="holiday">Holiday</option>
        <option value="other">Other</option>
      </select>

      <button
        type="submit"
        class="w-10 h-10 flex items-center justify-center rounded-md bg-brand-primary text-white text-lg font-semibold cursor-pointer hover:bg-brand-primary/90 active:translate-y-0.5 transition shadow-sm"
      >
        +
      </button>
    </form>

    <div v-if="tasksForToday.length === 0" class="text-text-muted text-sm">
      No tasks for today yet 🙂
    </div>

    <ul
      v-else
      class="flex flex-col gap-3 list-none p-0 m-0"
    >
      <li
        v-for="task in tasksForToday"
        :key="task.id"
        class="flex items-start gap-3 p-4 rounded-xl border border-border-soft bg-app-surface shadow-sm"
      >
        <input
          type="checkbox"
          :checked="task.status === 'done'"
          @change="tasksStore.toggleStatus(task.id)"
          class="mt-1 cursor-pointer"
        />

        <div class="flex-1 space-y-1">
          <div v-if="editingId === task.id">
            <div class="flex flex-wrap gap-2 mb-2">
              <input
                v-model="editTitle"
                type="text"
                class="flex-1 min-w-40 px-3 py-2 rounded-md border border-border-soft bg-white text-sm text-text-primary focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
              />

              <input
                v-model="editStartTime"
                type="time"
                class="w-26 px-2 py-2 rounded-md border border-border-soft bg-white text-sm focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
              />

              <input
                v-model="editEndTime"
                type="time"
                class="w-26 px-2 py-2 rounded-md border border-border-soft bg-white text-sm focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
              />

              <input
                v-model="editDate"
                type="date"
                class="w-38 px-2 py-2 rounded-md border border-border-soft bg-white text-sm focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
              />

              <input
                v-model="editEndDate"
                type="date"
                class="w-38 px-2 py-2 rounded-md border border-border-soft bg-white text-sm focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
              />

              <select
                v-model="editCategory"
                class="w-34 px-2 py-2 rounded-md border border-border-soft bg-white text-sm text-text-primary focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
              >
                <option value="work">Work</option>
                <option value="study">Study</option>
                <option value="rest">Rest</option>
                <option value="holiday">Holiday</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                @click="saveEdit"
                class="px-3 py-1.5 rounded-md text-xs font-medium bg-brand-primary text-white cursor-pointer hover:bg-brand-primary/90 active:translate-y-0.5 transition"
              >
                Save
              </button>
              <button
                type="button"
                @click="cancelEdit"
                class="px-3 py-1.5 rounded-md text-xs font-medium border border-border-soft bg-app-surface cursor-pointer hover:bg-app-surfaceSoft active:translate-y-0.5 transition"
              >
                Cancel
              </button>
            </div>
          </div>

          <div v-else>
            <div
              :class="[
                'text-sm',
                task.status === 'done'
                  ? 'line-through text-text-muted'
                  : 'text-text-primary'
              ]"
            >
              {{ task.title }}
            </div>

            <div
              v-if="task.startTime || task.endTime"
              class="text-xs text-text-muted"
            >
              {{ task.startTime || '??:??' }} – {{ task.endTime || '...' }}
            </div>

            <div class="text-xs text-text-muted">
              {{ task.date }}
              <span v-if="task.endDate && task.endDate !== task.date">
                → {{ task.endDate }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-end gap-2">
          <span
            class="text-[11px] px-2 py-0.5 rounded-full bg-brand-primarySoft text-brand-primary capitalize"
          >
            {{ task.category }}
          </span>

          <button
            v-if="editingId !== task.id"
            type="button"
            @click="startEdit(task)"
            class="text-[11px] text-brand-primary hover:text-brand-primary/80 cursor-pointer"
          >
            Edit
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
