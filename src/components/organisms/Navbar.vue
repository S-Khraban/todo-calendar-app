<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const links = [
  { to: '/date', label: 'Today' },
  { to: '/week', label: 'Week' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/tasks', label: 'All Tasks' },
]

const toLocalIso = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const todayIso = toLocalIso(new Date())

const isActive = (to: string) => {
  if (to === '/date') {
    if (route.path === '/date') return true
    if (route.name === 'today') return true
    if (route.name === 'date' && route.params.date === todayIso) return true
    return false
  }

  return route.path === to
}
</script>

<template>
  <nav class="pd4u-navbar">
    <div class="pd4u-navbar__inner">
      <div class="pd4u-navbar__logo">
        PD4U
      </div>

      <div class="pd4u-navbar__links">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="pd4u-navbar__link"
          :class="{ 'pd4u-navbar__link--active': isActive(link.to) }"
        >
          {{ link.label }}
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.pd4u-navbar {
  width: 100%;
  border-bottom: 1px solid var(--pd4u-border-subtle, #e5e7eb);
  background-color: var(--pd4u-nav-bg, #ffffff);
  box-sizing: border-box;
}

.pd4u-navbar__inner {
  max-width: var(--pd4u-max-width, 1400px);
  margin: 0 auto;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.pd4u-navbar__logo {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.04em;
  color: #111827 !important;
  background: none !important;
}

.pd4u-navbar__links {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pd4u-navbar__link {
  font-size: 14px;
  color: var(--pd4u-text-muted, #6b7280);
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.pd4u-navbar__link:hover {
  color: var(--pd4u-text-main, #111827);
}

.pd4u-navbar__link--active {
  color: var(--pd4u-primary-border, #2563eb);
  border-color: var(--pd4u-primary-border, #2563eb);
  font-weight: 500;
}
</style>
