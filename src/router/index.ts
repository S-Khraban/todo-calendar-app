import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

import TodayPage from '../pages/TodayPage.vue';
import CalendarPage from '../pages/CalendarPage.vue';
import AllTasksPage from '../pages/AllTasksPage.vue';
import WeekPage from '../pages/WeekPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/today',
  },
  {
    path: '/today',
    name: 'today',
    component: TodayPage,
  },
  {
    path: '/week',
    name: 'week',
    component: WeekPage,
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: CalendarPage,
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: AllTasksPage,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
