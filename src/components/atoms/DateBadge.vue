<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    day: number | string
    isToday?: boolean
    isSelected?: boolean
    isOutOfMonth?: boolean
    hasTasks?: boolean
  }>(),
  {
    isToday: false,
    isSelected: false,
    isOutOfMonth: false,
    hasTasks: false,
  }
)
</script>

<template>
  <div
    class="pd4u-date-badge"
    :class="{
      'pd4u-date-badge--today': props.isToday,
      'pd4u-date-badge--selected': props.isSelected,
      'pd4u-date-badge--out': props.isOutOfMonth,
      'pd4u-date-badge--has-tasks': props.hasTasks,
    }"
  >
    <span class="pd4u-date-badge__label">
      {{ props.day }}
    </span>
  </div>
</template>

<style scoped>
.pd4u-date-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 32px;
  min-height: 32px;

  border-radius: var(--pd4u-radius-sm, 6px);
  border: 1px solid var(--pd4u-date-border, #e5e7eb);

  background-color: var(--pd4u-date-bg, #f3f4f6);
  color: var(--pd4u-date-text, #111827);

  font-size: var(--pd4u-font-size-sm, 14px);
  font-weight: 500;
  font-family: var(--pd4u-font-family, system-ui);

  box-sizing: border-box;
  cursor: default;
}

.pd4u-date-badge__label {
  color: var(--pd4u-date-number, #2563eb);
}

.pd4u-date-badge--today {
  border-color: var(--pd4u-today-border, #2563eb);
  box-shadow: 0 0 0 1px var(--pd4u-today-border, #2563eb);
}

.pd4u-date-badge--selected {
  background-color: var(--pd4u-selected-bg, #2563eb);
  border-color: var(--pd4u-selected-border, #1d4ed8);
}

.pd4u-date-badge--selected .pd4u-date-badge__label {
  color: var(--pd4u-selected-text, #ffffff);
}

.pd4u-date-badge--out {
  opacity: 0.45;
}

.pd4u-date-badge--has-tasks {
  position: relative;
}

.pd4u-date-badge--has-tasks::after {
  content: '';
  position: absolute;
  bottom: 3px;
  right: 5px;
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background-color: var(--pd4u-has-tasks-dot, #10b981);
}
</style>
