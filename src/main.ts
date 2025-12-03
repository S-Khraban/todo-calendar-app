import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from '@/router';

import './style.css';
import 'uno.css';

import { useTasksStore } from '@/stores/tasks';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const tasksStore = useTasksStore(pinia);
tasksStore.load();

app.mount('#app');
