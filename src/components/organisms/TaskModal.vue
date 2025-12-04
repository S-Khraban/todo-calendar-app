<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { Task, TaskCategory, TaskStatus } from '@/types';

const props = defineProps<{
  modelValue: boolean;
  task: Task | null;
  defaultDate: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (
    e: 'save',
    payload: {
      id?: string;
      title: string;
      description?: string;
      date: string;
      endDate?: string;
      startTime?: string;
      endTime?: string;
      category: TaskCategory;
      status: TaskStatus;
    },
  ): void;
}>();

const form = reactive({
  title: '',
  description: '',
  date: props.defaultDate,
  endDate: props.defaultDate,
  startTime: '',
  endTime: '',
  category: 'work' as TaskCategory,
  status: 'todo' as TaskStatus,
});

const isEdit = computed(() => !!props.task);

watch(
  () => props.task,
  (task) => {
    if (!task) {
      form.title = '';
      form.description = '';
      form.date = props.defaultDate;
      form.endDate = props.defaultDate;
      form.startTime = '';
      form.endTime = '';
      form.category = 'work';
      form.status = 'todo';
      return;
    }

    form.title = task.title;
    form.description = task.description ?? '';
    form.date = task.date;
    form.endDate = task.endDate ?? task.date;
    form.startTime = task.startTime ?? '';
    form.endTime = task.endTime ?? '';
    form.category = task.category;
    form.status = task.status;
  },
  { immediate: true },
);

watch(
  () => props.defaultDate,
  (date) => {
    if (!props.task) {
      form.date = date;
      form.endDate = date;
    }
  },
);

const close = () => {
  emit('update:modelValue', false);
};

const onSubmit = () => {
  if (!form.title.trim()) return;

  emit('save', {
    id: props.task?.id,
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    date: form.date,
    endDate: form.endDate && form.endDate !== form.date ? form.endDate : undefined,
    startTime: form.startTime || undefined,
    endTime: form.endTime || undefined,
    category: form.category,
    status: form.status,
  });

  close();
};
</script>

<template>
  <teleport to="body">
    <div
      v-if="modelValue"
      class="tm-backdrop"
      @click.self="close"
    >
      <div class="tm-modal">
        <header class="tm-header">
          <h2 class="tm-title">
            {{ isEdit ? 'Редагувати задачу' : 'Нова задача' }}
          </h2>
          <button
            type="button"
            class="tm-close"
            @click="close"
          >
            ×
          </button>
        </header>

        <form class="tm-body" @submit.prevent="onSubmit">
          <label class="tm-field">
            <span class="tm-label">Назва</span>
            <input
              v-model="form.title"
              type="text"
              class="tm-input"
              placeholder="Що потрібно зробити?"
              required
            />
          </label>

          <label class="tm-field">
            <span class="tm-label">Опис (необовʼязково)</span>
            <textarea
              v-model="form.description"
              class="tm-textarea"
              rows="3"
              placeholder="Деталі задачі"
            />
          </label>

          <div class="tm-row">
            <label class="tm-field">
              <span class="tm-label">Початкова дата</span>
              <input
                v-model="form.date"
                type="date"
                class="tm-input"
              />
            </label>

            <label class="tm-field">
              <span class="tm-label">Кінцева дата</span>
              <input
                v-model="form.endDate"
                type="date"
                class="tm-input"
              />
            </label>
          </div>

          <div class="tm-row">
            <label class="tm-field">
              <span class="tm-label">Початок</span>
              <input
                v-model="form.startTime"
                type="time"
                class="tm-input"
              />
            </label>

            <label class="tm-field">
              <span class="tm-label">Кінець</span>
              <input
                v-model="form.endTime"
                type="time"
                class="tm-input"
              />
            </label>
          </div>

          <div class="tm-row">
            <label class="tm-field">
              <span class="tm-label">Категорія</span>
              <select v-model="form.category" class="tm-input">
                <option value="work">Робота</option>
                <option value="study">Навчання</option>
                <option value="rest">Дозвілля</option>
                <option value="holiday">Свята</option>
                <option value="other">Інше</option>
              </select>
            </label>

            <label class="tm-field">
              <span class="tm-label">Статус</span>
              <select v-model="form.status" class="tm-input">
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>

          <footer class="tm-footer">
            <button
              type="button"
              class="tm-btn tm-btn-secondary"
              @click="close"
            >
              Скасувати
            </button>
            <button
              type="submit"
              class="tm-btn tm-btn-primary"
            >
              {{ isEdit ? 'Зберегти' : 'Створити' }}
            </button>
          </footer>
        </form>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.tm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.tm-modal {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow:
    0 10px 15px -3px rgba(15, 23, 42, 0.2),
    0 4px 6px -2px rgba(15, 23, 42, 0.15);
  padding: 16px 18px 18px;
  box-sizing: border-box;
}

.tm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.tm-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.tm-close {
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 999px;
}

.tm-close:hover {
  background: #f3f4f6;
}

.tm-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tm-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.tm-label {
  color: #4b5563;
}

.tm-input,
.tm-textarea {
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 13px;
  font-family: inherit;
  box-sizing: border-box;
}

.tm-input:focus,
.tm-textarea:focus {
  outline: 2px solid #4f46e5;
  outline-offset: 1px;
  border-color: #4f46e5;
}

.tm-textarea {
  resize: vertical;
}

.tm-row {
  display: flex;
  gap: 8px;
}

.tm-row .tm-field {
  flex: 1;
}

.tm-footer {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.tm-btn {
  border-radius: 999px;
  border: 1px solid transparent;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.tm-btn-primary {
  background: #4f46e5;
  color: #ffffff;
}

.tm-btn-primary:hover {
  background: #4338ca;
}

.tm-btn-secondary {
  background: #f3f4f6;
  color: #111827;
}

.tm-btn-secondary:hover {
  background: #e5e7eb;
}
</style>
