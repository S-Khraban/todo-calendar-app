<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/services/supabaseClient'

const modelValue = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'close'): void
}>()

const panelRef = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const session = ref<Session | null>(null)

let unsubscribe: (() => void) | null = null

const close = () => {
  modelValue.value = false
  emit('close')
}

const signInWithGoogle = async () => {
  if (isLoading.value) return
  isLoading.value = true

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) isLoading.value = false
}

const disconnect = async () => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    await supabase.auth.signOut()
    close()
  } finally {
    isLoading.value = false
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (!modelValue.value) return
  if (e.key === 'Escape') close()
}

const onClickOutside = (e: MouseEvent) => {
  if (!modelValue.value) return
  const el = panelRef.value
  if (!el) return
  const target = e.target as Node
  if (!el.contains(target)) close()
}

onMounted(async () => {
  session.value = (await supabase.auth.getSession()).data.session

  const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })
  unsubscribe = data.subscription.unsubscribe

  window.addEventListener('keydown', onKeydown)
  window.addEventListener('mousedown', onClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('mousedown', onClickOutside)
  unsubscribe?.()
})

watch(modelValue, v => {
  if (v) requestAnimationFrame(() => panelRef.value?.focus())
})
</script>

<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      ref="panelRef"
      class="auth-popover"
      role="dialog"
      aria-label="Authorization"
      tabindex="-1"
    >
      <div class="auth-popover__header">
        <div class="auth-popover__title">Authorization</div>

        <button
          type="button"
          class="auth-popover__close"
          @click="close"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div class="auth-popover__body">
        <button
          v-if="!session"
          type="button"
          class="auth-popover__action"
          :disabled="isLoading"
          @click="signInWithGoogle"
        >
          Continue with Google
        </button>

        <button
          v-if="session"
          type="button"
          class="auth-popover__action auth-popover__action--ghost"
          :disabled="isLoading"
          @click="disconnect"
        >
          Disconnect
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped src="./AuthPopover.css"></style>
