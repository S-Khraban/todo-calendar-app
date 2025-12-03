<script setup lang="ts">
import { ref } from 'vue';
import { useMainStore } from '../stores/mainStore';

const store = useMainStore();
const newTodo = ref('');

function add() {
  const value = newTodo.value.trim();
  if (!value) return;

  store.addTodo(value);
  newTodo.value = '';
}
</script>

<template>
  <div class="home">
    <h1>Todo + Calendar App</h1>

    <form @submit.prevent="add">
      <input v-model="newTodo" placeholder="Нова задача..." />
      <button>Додати</button>
    </form>

    <ul class="todo-list">
      <li
        v-for="t in store.todos"
        :key="t.id"
        :class="{ done: t.done }"
        @click="store.toggleTodo(t.id)"
      >
        {{ t.text }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.home {
  max-width: 600px;
  margin: 40px auto;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  cursor: pointer;
  border-radius: 4px;
}

.todo-list li.done {
  text-decoration: line-through;
  opacity: 0.6;
}
</style>
