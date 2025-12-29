<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'solid' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md'

type Props = {
  as?: 'button' | 'a'
  type?: 'button' | 'submit' | 'reset'
  href?: string
  disabled?: boolean
  loading?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  type: 'button',
  href: undefined,
  disabled: false,
  loading: false,
  variant: 'solid',
  size: 'md',
})

const emit = defineEmits<{
  (e: 'click', ev: MouseEvent): void
}>()

const isDisabled = computed(() => props.disabled || props.loading)

const base =
  'inline-flex items-center justify-center rounded-md select-none transition ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-3.5 text-xs',
}

const variants: Record<ButtonVariant, string> = {
  solid:
    'border border-border-soft bg-brand-primary text-white ' +
    'hover:bg-brand-primary/90 active:scale-[0.99]',
  outline:
    'border border-border-soft bg-white text-text-primary ' +
    'hover:bg-app-surfaceSoft active:scale-[0.99]',
  ghost:
    'border border-transparent bg-transparent text-text-primary ' +
    'hover:bg-app-surfaceSoft active:scale-[0.99]',
}

const classes = computed(() => [
  base,
  sizes[props.size],
  variants[props.variant],
])

const onClick = (e: MouseEvent) => {
  if (isDisabled.value) return
  emit('click', e)
}
</script>

<template>
  <component
    :is="as"
    :type="as === 'button' ? type : undefined"
    :href="as === 'a' ? href : undefined"
    :disabled="as === 'button' ? isDisabled : undefined"
    :aria-disabled="as === 'a' ? isDisabled : undefined"
    :class="classes"
    @click="onClick"
  >
    <span
      v-if="loading"
      class="i-carbon:circle-dash animate-spin mr-2 text-[14px]"
    />
    <slot />
  </component>
</template>
