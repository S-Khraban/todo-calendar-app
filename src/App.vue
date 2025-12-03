<template>
  <div min-h-screen bg-app-bg text-text-primary>
    <nav
      sticky
      top-0
      z-10
      flex
      gap-3
      px-8
      py-3
      border-b
      border-border-soft
      bg="white/80"
      backdrop-blur
    >
      <RouterLink to="/today" class="nav-link">Today</RouterLink>
      <RouterLink to="/week" class="nav-link">Week</RouterLink>
      <RouterLink to="/calendar" class="nav-link">Calendar</RouterLink>
      <RouterLink to="/tasks" class="nav-link">All Tasks</RouterLink>
      <RouterLink to="/profile" class="nav-link">Profile</RouterLink>
    </nav>

    <main class="page-container">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style>
.nav-link {
  @apply px-3 py-1.5 rounded-full text-sm text-text-muted border border-transparent transition;
}
.nav-link:hover {
  @apply bg-app-surfaceSoft text-text-primary;
}
.nav-link.router-link-active {
  @apply bg-brand-primary text-white font-medium shadow border-transparent;
}
</style>
