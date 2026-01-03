<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabaseClient'

const router = useRouter()

onMounted(async () => {
  await supabase.auth.getSession()
  await router.replace('/')
})
</script>

<template>
  <div class="auth-callback">
    Signing you in…
  </div>
</template>

<style scoped>
.auth-callback {
  min-height: 60vh;
  display: grid;
  place-items: center;
  color: var(--text-primary, #111827);
}
</style>
