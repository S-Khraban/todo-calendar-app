import { defineStore } from 'pinia';
import type { Task } from '@/types';

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
  }),

  getters: {
    tasksByDate: (state) => (date: string) =>
      state.tasks.filter((t) => {
        const start = t.date;
        const end = t.endDate ?? t.date;
        return start <= date && date <= end;
      }),
  },

  actions: {
    addTask(payload: Omit<Task, 'id' | 'status'>) {
      const task: Task = {
        id: String(Date.now()),
        status: 'todo',
        ...payload,
      };
      this.tasks.push(task);
      this.save();
    },

    updateTask(updated: Task) {
      this.tasks = this.tasks.map((t) =>
        t.id === updated.id ? updated : t
      );
      this.save();
    },

    toggleStatus(id: string) {
      this.tasks = this.tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'done' ? 'todo' : 'done' }
          : t
      );
      this.save();
    },

    removeTask(id: string) {
      this.tasks = this.tasks.filter((t) => t.id !== id);
      this.save();
    },

    save() {
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    },

    load() {
      const raw = localStorage.getItem('tasks');
      if (raw) {
        this.tasks = JSON.parse(raw);
      }
    },
  },
});
