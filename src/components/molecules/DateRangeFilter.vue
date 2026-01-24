<template>
  <div class="date-range">
    <BaseInput
      v-model="fromModel"
      type="date"
      :label="t('filters.dateRange.from')"
      name="date-range-from"
    />

    <BaseInput
      v-model="toModel"
      type="date"
      :label="t('filters.dateRange.to')"
      name="date-range-to"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseInput from '@/components/ui/BaseInput.vue'

const { t } = useI18n()

const props = defineProps<{
  from: string
  to: string
}>()

const emit = defineEmits<{
  (e: 'update:from', v: string): void
  (e: 'update:to', v: string): void
}>()

const fromModel = computed({
  get: () => props.from,
  set: v => emit('update:from', v),
})

const toModel = computed({
  get: () => props.to,
  set: v => emit('update:to', v),
})
</script>

<style scoped>
.date-range {
  display: contents;
}
</style>
