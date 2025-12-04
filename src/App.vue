<template>
  <div class="min-h-screen bg-app-bg text-text-primary">
    <Navbar />

    <main class="app-shell">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/organisms/Navbar.vue'
</script>

<style>
.app-shell {
  @apply w-full mx-auto;
  max-width: 1400px;
  min-width: 320px;
  padding-inline: 16px;
  padding-block: 24px;
}

@media (min-width: 768px) {
  .app-shell {
    padding-inline: 24px;
  }
}

@media (min-width: 1200px) {
  .app-shell {
    padding-inline: 32px;
  }
}
</style>
