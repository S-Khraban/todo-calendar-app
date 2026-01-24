<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { supabase } from '@/services/supabaseClient'

const { t } = useI18n()
const router = useRouter()

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

const goToUserPage = () => {
  close()
  router.push('/user')
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
      :aria-label="t('auth.popover.ariaLabel')"
      tabindex="-1"
    >
      <div class="auth-popover__header">
        <div class="auth-popover__title">
          {{ t('auth.popover.title') }}
        </div>

        <button
          type="button"
          class="auth-popover__close"
          :aria-label="t('common.close')"
          @click="close"
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
          {{ t('auth.popover.continueWithGoogle') }}
        </button>

        <template v-else>
          <button
            type="button"
            class="auth-popover__action"
            :disabled="isLoading"
            @click="goToUserPage"
          >
            {{ t('auth.popover.userProfile') }}
          </button>

          <button
            type="button"
            class="auth-popover__action auth-popover__action--ghost"
            :disabled="isLoading"
            @click="disconnect"
          >
            {{ t('auth.popover.disconnect') }}
          </button>
        </template>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.auth-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 240px;
  border: 1px solid var(--border-soft, #e5e7eb);
  background: var(--app-surface, #fff);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 10px;
  outline: none;
  z-index: 50;
}

.auth-popover__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 6px 10px;
  border-bottom: 1px solid var(--border-soft, #e5e7eb);
}

.auth-popover__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.auth-popover__close {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--border-soft, #e5e7eb);
  background: var(--app-surface, #fff);
  cursor: pointer;
}

.auth-popover__close:hover {
  background: var(--app-surface-soft, #f3f4f6);
}

.auth-popover__body {
  padding: 10px 6px 6px;
  display: grid;
  gap: 8px;
}

.auth-popover__action {
  width: 100%;
  padding: 9px 10px;
  border-radius: 10px;
  border: 1px solid var(--border-soft, #e5e7eb);
  background: var(--brand-primary-soft, rgba(37, 99, 235, 0.12));
  color: var(--text-primary, #111827);
  font-size: 13px;
  cursor: pointer;
}

.auth-popover__action:hover {
  filter: brightness(0.98);
}

.auth-popover__action--ghost {
  background: var(--app-surface, #fff);
}

.auth-popover__action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
