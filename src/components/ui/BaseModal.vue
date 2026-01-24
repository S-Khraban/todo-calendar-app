<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type Props = {
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg'
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
}

const modelValue = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<Props>(), {
  title: '',
  maxWidth: 'md',
  closeOnBackdrop: true,
  closeOnEsc: true,
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const panelRef = ref<HTMLElement | null>(null)
const lastActiveEl = ref<HTMLElement | null>(null)

const widthClass = computed(() => {
  if (props.maxWidth === 'sm') return 'w-[92vw] max-w-[360px]'
  if (props.maxWidth === 'lg') return 'w-[92vw] max-w-[720px]'
  return 'w-[92vw] max-w-[520px]'
})

const close = () => {
  modelValue.value = false
  emit('close')
}

const onBackdropClick = () => {
  if (!props.closeOnBackdrop) return
  close()
}

const onKeydown = (e: KeyboardEvent) => {
  if (!modelValue.value) return

  if (props.closeOnEsc && e.key === 'Escape') {
    e.preventDefault()
    close()
    return
  }

  if (e.key !== 'Tab') return

  const panel = panelRef.value
  if (!panel) return

  const focusables = panel.querySelectorAll<HTMLElement>(
    'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
  )

  if (focusables.length === 0) {
    e.preventDefault()
    panel.focus()
    return
  }

  const first = focusables.item(0)
  const last = focusables.item(focusables.length - 1)
  const active = document.activeElement as HTMLElement | null

  if (!first || !last) {
    e.preventDefault()
    panel.focus()
    return
  }

  if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus()
  } else if (e.shiftKey && active === first) {
    e.preventDefault()
    last.focus()
  }
}

const lockScroll = () => {
  document.documentElement.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.documentElement.style.overflow = ''
}

watch(modelValue, v => {
  if (v) {
    lastActiveEl.value = document.activeElement as HTMLElement | null
    lockScroll()
    requestAnimationFrame(() => panelRef.value?.focus())
  } else {
    unlockScroll()
    requestAnimationFrame(() => lastActiveEl.value?.focus())
  }
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  unlockScroll()
})
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[2000] grid place-items-center"
        role="dialog"
        aria-modal="true"
        :aria-label="title || 'Modal'"
      >
        <div
          class="absolute inset-0 bg-black/35"
          @click="onBackdropClick"
        />

        <div
          ref="panelRef"
          tabindex="-1"
          :class="[
            'relative rounded-xl border border-border-soft bg-app-surface shadow-lg outline-none',
            widthClass,
          ]"
        >
          <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-border-soft">
            <div class="text-sm font-semibold text-text-primary">
              <slot name="title">
                {{ title }}
              </slot>
            </div>

            <div class="flex items-center gap-2">
              <slot name="header-actions" />

              <button
                type="button"
                class="h-8 w-8 inline-flex items-center justify-center rounded border border-border-soft bg-white text-[10px] leading-none text-text-primary hover:bg-app-surfaceSoft"
                aria-label="Close"
                @click="close"
              >
                <span class="block leading-none -mt-[1px]">✕</span>
              </button>
            </div>
          </div>

          <div class="px-4 py-4">
            <slot />
          </div>

          <div v-if="$slots.footer" class="px-4 pb-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.14s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
