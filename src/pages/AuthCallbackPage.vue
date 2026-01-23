<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabaseClient'

const router = useRouter()

onMounted(async () => {
  const url = new URL(window.location.href)

  const nextRaw = url.searchParams.get('next')
  const next = nextRaw ? decodeURIComponent(nextRaw) : '/week'

  const code = url.searchParams.get('code')

  if (!code) {
    await router.replace('/user')
    return
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    await router.replace('/user')
    return
  }

  await router.replace(next)
})
</script>

<template>
  <div class="auth-callback">Signing you in…</div>
</template>

<style scoped>
.auth-callback {
  min-height: 60vh;
  display: grid;
  place-items: center;
  color: var(--text-primary, #111827);
}
</style>
