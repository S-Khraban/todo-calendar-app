<script setup lang="ts">
import { computed, useAttrs } from 'vue'

type Props = {
  modelValue?: string
  label?: string
  hint?: string
  error?: string
  placeholder?: string
type?: 'number' | 'text' | 'email' | 'password' | 'search' | 'date'
  disabled?: boolean
  readonly?: boolean
  size?: 'sm' | 'md'
  leftIcon?: string
  rightIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  hint: '',
  error: '',
  placeholder: '',
  type: 'text',
  disabled: false,
  readonly: false,
  size: 'md',
  leftIcon: '',
  rightIcon: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'blur', ev: FocusEvent): void
  (e: 'focus', ev: FocusEvent): void
  (e: 'enter', ev: KeyboardEvent): void
  (e: 'click-left', ev: MouseEvent): void
  (e: 'click-right', ev: MouseEvent): void
}>()

const attrs = useAttrs()

const sizeClass = computed(() => (props.size === 'sm' ? 'h-9' : 'h-10'))
const padLeft = computed(() => (props.leftIcon ? 'pl-10' : 'pl-3.5'))
const padRight = computed(() => (props.rightIcon ? 'pr-10' : 'pr-3.5'))

const fieldClass = computed(() => [
  'w-full rounded-md border bg-white text-text-primary placeholder:text-text-muted/80 transition',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/35 focus-visible:border-brand-primary/40',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  props.error ? 'border-red-500/60' : 'border-border-soft hover:border-border-strong/70',
  props.readonly ? 'bg-app-surfaceSoft' : '',
  sizeClass.value,
  padLeft.value,
  padRight.value,
  'text-[13px]',
])

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement | null
  emit('update:modelValue', target?.value ?? '')
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') emit('enter', e)
}

const onLeftClick = (e: MouseEvent) => emit('click-left', e)
const onRightClick = (e: MouseEvent) => emit('click-right', e)
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-xs font-medium text-text-primary mb-1">
      {{ label }}
    </label>

    <div class="relative">
      <button
        v-if="leftIcon"
        type="button"
        class="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md text-text-muted hover:bg-app-surfaceSoft"
        :aria-label="`${label || 'input'} left action`"
        tabindex="-1"
        @click="onLeftClick"
      >
        <span :class="leftIcon" />
      </button>

      <input
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="fieldClass"
        v-bind="attrs"
        @input="onInput"
        @keydown="onKeydown"
        @blur="(e) => emit('blur', e)"
        @focus="(e) => emit('focus', e)"
      >

      <button
        v-if="rightIcon"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md text-text-muted hover:bg-app-surfaceSoft"
        :aria-label="`${label || 'input'} right action`"
        tabindex="-1"
        @click="onRightClick"
      >
        <span :class="rightIcon" />
      </button>
    </div>

    <div v-if="error" class="mt-1 text-[11px] text-red-600">
      {{ error }}
    </div>
    <div v-else-if="hint" class="mt-1 text-[11px] text-text-muted">
      {{ hint }}
    </div>
  </div>
</template>
