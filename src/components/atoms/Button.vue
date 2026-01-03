<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
  },
)
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled"
    class="pd4u-button"
    :class="[
      `pd4u-button--${props.variant}`,
      `pd4u-button--${props.size}`,
      { 'pd4u-button--disabled': props.disabled },
    ]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<style scoped>
.pd4u-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  border-radius: var(--pd4u-radius-sm, 6px);
  border-width: 1px;
  border-style: solid;

  padding-inline: var(--pd4u-button-padding-x-md, 14px);
  padding-block: var(--pd4u-button-padding-y-md, 6px);

  font-size: var(--pd4u-font-size-sm, 14px);
  line-height: 1.2;
  font-weight: 500;
  font-family: var(--pd4u-font-family, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);

  cursor: pointer;
  white-space: nowrap;

  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.05s ease;
}

/* variants */
.pd4u-button--primary {
  background-color: var(--pd4u-primary-bg, #3b82f6);
  border-color: var(--pd4u-primary-border, #2563eb);
  color: var(--pd4u-primary-text, #ffffff);
}

.pd4u-button--primary:hover:not(.pd4u-button--disabled) {
  background-color: var(--pd4u-primary-bg-hover, #2563eb);
  border-color: var(--pd4u-primary-border-hover, #1d4ed8);
}

.pd4u-button--secondary {
  background-color: var(--pd4u-secondary-bg, #ffffff);
  border-color: var(--pd4u-secondary-border, #d1d5db);
  color: var(--pd4u-secondary-text, #111827);
}

.pd4u-button--secondary:hover:not(.pd4u-button--disabled) {
  background-color: var(--pd4u-secondary-bg-hover, #f3f4f6);
}

.pd4u-button--ghost {
  background-color: transparent;
  border-color: transparent;
  color: var(--pd4u-ghost-text, #374151);
}

.pd4u-button--ghost:hover:not(.pd4u-button--disabled) {
  background-color: var(--pd4u-ghost-bg-hover, #f3f4f6);
}

/* sizes */
.pd4u-button--sm {
  padding-inline: var(--pd4u-button-padding-x-sm, 10px);
  padding-block: var(--pd4u-button-padding-y-sm, 4px);
  font-size: var(--pd4u-font-size-xs, 13px);
}

.pd4u-button--md {
  padding-inline: var(--pd4u-button-padding-x-md, 14px);
  padding-block: var(--pd4u-button-padding-y-md, 6px);
  font-size: var(--pd4u-font-size-sm, 14px);
}

/* disabled */
.pd4u-button--disabled {
  opacity: 0.6;
  cursor: default;
  box-shadow: none;
}
</style>
