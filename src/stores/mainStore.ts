import { defineStore } from 'pinia';

export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export const useMainStore = defineStore('main', {
  state: () => ({
    todos: [] as Todo[],
  }),

  actions: {
    addTodo(text: string) {
      this.todos.push({
        id: Date.now(),
        text,
        done: false,
      });
    },

    toggleTodo(id: number) {
      const t = this.todos.find(todo => todo.id === id);
      if (t) t.done = !t.done;
    },
  },
});
