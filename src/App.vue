<template>
  <div class="min-h-screen bg-app-bg text-text-primary">
    <Navbar />

    <main class="pd4u-container py-6">
      <RouterView v-if="session" />
      <div v-else class="auth-gate" aria-label="Please sign in">
        Please sign in to continue
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Session } from '@supabase/supabase-js'
import Navbar from '@/components/organisms/Navbar.vue'
import { supabase } from '@/services/supabaseClient'

const session = ref<Session | null>(null)

let unsubscribe: (() => void) | null = null

onMounted(async () => {
  session.value = (await supabase.auth.getSession()).data.session

  const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })

  unsubscribe = data.subscription.unsubscribe
})

onBeforeUnmount(() => {
  unsubscribe?.()
})
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

.auth-gate {
  min-height: 60vh;
  display: grid;
  place-items: center;
  color: var(--text-secondary, #6b7280);
  font-size: 14px;
}
</style>
