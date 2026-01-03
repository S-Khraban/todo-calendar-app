<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    placeholder?: string
    type?: string
    disabled?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: '',
    type: 'text',
    disabled: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <input
    class="pd4u-input"
    :class="{ 'pd4u-input--disabled': props.disabled }"
    :type="props.type"
    :value="props.modelValue ?? ''"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    @input="onInput"
    v-bind="$attrs"
  />
</template>

<style scoped>
.pd4u-input {
  width: 100%;
  padding-inline: var(--pd4u-input-padding-x, 12px);
  padding-block: var(--pd4u-input-padding-y, 8px);

  border-radius: var(--pd4u-radius-sm, 6px);
  border: 1px solid var(--pd4u-input-border, #d1d5db);

  background-color: var(--pd4u-input-bg, #ffffff);
  color: var(--pd4u-input-text, #111827);

  font-size: var(--pd4u-font-size-sm, 14px);
  font-family: var(--pd4u-font-family, system-ui);

  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.pd4u-input:focus {
  outline: none;
  border-color: var(--pd4u-primary-border, #2563eb);
  box-shadow: 0 0 0 2px var(--pd4u-primary-shadow, rgba(37, 99, 235, 0.25));
}

.pd4u-input--disabled {
  background-color: var(--pd4u-input-bg-disabled, #f3f4f6);
  color: var(--pd4u-input-text-disabled, #9ca3af);
  cursor: default;
}
</style>
