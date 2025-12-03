<script setup lang="ts">
import DateBadge from '@/components/atoms/DateBadge.vue'

const props = defineProps<{
  days: {
    date: string
    day: number
    isToday: boolean
    isSelected: boolean
    isOutOfMonth: boolean
    hasTasks: boolean
  }[]
}>()

const emit = defineEmits<{
  (e: 'select', date: string): void
}>()

const onSelect = (date: string) => emit('select', date)
</script>

<template>
  <div class="pd4u-calendar-grid">
    <div class="pd4u-calendar-grid__header">
      <div v-for="d in ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']" :key="d" class="pd4u-calendar-grid__weekday">
        {{ d }}
      </div>
    </div>

    <div class="pd4u-calendar-grid__body">
      <button
        v-for="day in props.days"
        :key="day.date"
        class="pd4u-calendar-grid__cell"
        @click="onSelect(day.date)"
      >
        <DateBadge
          :day="day.day"
          :is-today="day.isToday"
          :is-selected="day.isSelected"
          :is-out-of-month="day.isOutOfMonth"
          :has-tasks="day.hasTasks"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.pd4u-calendar-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pd4u-calendar-grid__header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  color: var(--pd4u-text-muted, #6b7280);
  padding-inline: 4px;
}

.pd4u-calendar-grid__weekday {
  padding-block: 2px;
}

.pd4u-calendar-grid__body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.pd4u-calendar-grid__cell {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
</style>
