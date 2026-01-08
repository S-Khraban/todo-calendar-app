import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import WeekPage from '@/pages/WeekPage.vue'
import CalendarPage from '@/pages/CalendarPage.vue'
import AllTasksPage from '@/pages/AllTasksPage.vue'
import DatePage from '@/pages/TodayPage.vue'
import UserPage from '@/pages/UserPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/week',
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
    path: '/date/:date?',
    name: 'date',
    component: DatePage,
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: AllTasksPage,
  },
  {
    path: '/user',
    name: 'user',
    component: UserPage,
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('@/pages/AuthCallbackPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
