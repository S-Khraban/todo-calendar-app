<script setup lang="ts">
import { reactive, watch } from 'vue'
import Input from '@/components/atoms/Input.vue'
import Button from '@/components/atoms/Button.vue'
import type { TaskCategory } from '@/types'

type TaskFormValue = {
  title: string
  date: string
  endDate: string
  startTime: string
  endTime: string
  category: TaskCategory
}

const props = withDefaults(
  defineProps<{
    initialValue?: Partial<TaskFormValue>
    submitLabel?: string
    showCancel?: boolean
  }>(),
  {
    submitLabel: 'Add task',
    showCancel: false,
  },
)

const emit = defineEmits<{
  (e: 'submit', payload: TaskFormValue): void
  (e: 'cancel'): void
}>()

const today = new Date().toISOString().slice(0, 10)

const form = reactive<TaskFormValue>({
  title: props.initialValue?.title ?? '',
  date: props.initialValue?.date ?? today,
  endDate: props.initialValue?.endDate ?? today,
  startTime: props.initialValue?.startTime ?? '',
  endTime: props.initialValue?.endTime ?? '',
  category: props.initialValue?.category ?? 'work',
})

watch(
  () => props.initialValue,
  value => {
    if (!value) return
    form.title = value.title ?? ''
    form.date = value.date ?? today
    form.endDate = value.endDate ?? form.date
    form.startTime = value.startTime ?? ''
    form.endTime = value.endTime ?? ''
    form.category = value.category ?? 'work'
  },
  { deep: true },
)

const onSubmit = () => {
  if (!form.title.trim()) return

  emit('submit', {
    title: form.title.trim(),
    date: form.date || today,
    endDate: form.endDate || form.date || today,
    startTime: form.startTime,
    endTime: form.endTime,
    category: form.category,
  })
}

const onCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form
    class="flex flex-wrap gap-2 items-center mb-6 bg-app-surface border border-border-soft rounded-2xl p-3 shadow-sm"
    @submit.prevent="onSubmit"
  >
    <Input
      v-model="form.title"
      type="text"
      placeholder="New task..."
      class="flex-1 min-w-40"
      autocomplete="off"
    />

    <Input
      v-model="form.startTime"
      type="time"
      class="w-26"
    />

    <Input
      v-model="form.endTime"
      type="time"
      class="w-26"
    />

    <Input
      v-model="form.date"
      type="date"
      class="w-38"
    />

    <Input
      v-model="form.endDate"
      type="date"
      class="w-38"
    />

    <select
      v-model="form.category"
      class="w-34 px-2 py-2 rounded-md border border-border-soft bg-white text-sm text-text-primary focus:(outline-none border-brand-primary ring-1 ring-brand-primary/50)"
    >
      <option value="work">Work</option>
      <option value="study">Study</option>
      <option value="rest">Rest</option>
      <option value="holiday">Holiday</option>
      <option value="other">Other</option>
    </select>

    <Button
      type="submit"
      variant="primary"
      size="sm"
      class="w-10 h-10 flex items-center justify-center text-lg font-semibold"
    >
      {{ props.submitLabel }}
    </Button>

    <Button
      v-if="props.showCancel"
      type="button"
      variant="ghost"
      size="sm"
      class="ml-auto"
      @click="onCancel"
    >
      Cancel
    </Button>
  </form>
</template>
