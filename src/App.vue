<template>
  <div class="min-h-screen bg-app-bg text-text-primary">
    <Navbar />

    <main class="pd4u-container py-6">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/organisms/Navbar.vue'
</script>

<style>
.pd4u-container {
  width: 100%;
  max-width: 1200px;
  min-width: 320px;
  margin-inline: auto;
  padding-inline: 16px;
}

@media (min-width: 768px) {
  .pd4u-container {
    padding-inline: 24px;
  }
}

@media (min-width: 1200px) {
  .pd4u-container {
    padding-inline: 32px;
  }
}
</style>
