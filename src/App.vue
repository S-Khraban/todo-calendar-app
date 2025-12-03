<template>
  <div min-h-screen bg-app-bg text-text-primary>
    <Navbar />

    <main class="page-container">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/organisms/Navbar.vue'
</script>

<style>
.page-container {
  @apply px-8 py-6 max-w-3xl mx-auto w-full;
}
</style>
