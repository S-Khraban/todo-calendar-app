<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    disabled?: boolean
  }>(),
  {
    modelValue: false,
    disabled: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<template>
  <label class="pd4u-checkbox">
    <input
      type="checkbox"
      class="pd4u-checkbox__input"
      :checked="props.modelValue"
      :disabled="props.disabled"
      @change="onChange"
    />
    <span
      class="pd4u-checkbox__box"
      :class="{ 'pd4u-checkbox__box--checked': props.modelValue }"
    >
      <span v-if="props.modelValue" class="pd4u-checkbox__checkmark">✓</span>
    </span>

    <span class="pd4u-checkbox__label">
      <slot />
    </span>
  </label>
</template>

<style scoped>
.pd4u-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  font-size: var(--pd4u-font-size-sm, 14px);
  font-family: var(--pd4u-font-family, system-ui);
  color: var(--pd4u-text-main, #111827);

  cursor: pointer;
}

/* ховаємо нативний чекбокс */
.pd4u-checkbox__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.pd4u-checkbox__box {
  width: 18px;
  height: 18px;
  border-radius: var(--pd4u-radius-xs, 4px);
  border: 1px solid var(--pd4u-input-border, #d1d5db);
  background-color: var(--pd4u-input-bg, #ffffff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.pd4u-checkbox__box--checked {
  background-color: var(--pd4u-primary-bg, #2563eb);
  border-color: var(--pd4u-primary-border, #1d4ed8);
}

.pd4u-checkbox__checkmark {
  font-size: 12px;
  line-height: 1;
  color: var(--pd4u-primary-checkmark, #ffffff);
}

.pd4u-checkbox__label {
  line-height: 1.3;
}
</style>
