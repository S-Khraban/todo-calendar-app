<script setup lang="ts">
import { reactive, watch } from 'vue'
import Input from '@/components/atoms/Input.vue'
import Button from '@/components/atoms/Button.vue'

type TaskFormValue = {
  title: string
  startDate: string
  endDate?: string | null
}

const props = withDefaults(
  defineProps<{
    initialValue?: TaskFormValue
    submitLabel?: string
    showCancel?: boolean
  }>(),
  {
    submitLabel: 'Add task',
    showCancel: false,
  }
)

const emit = defineEmits<{
  (e: 'submit', payload: TaskFormValue): void
  (e: 'cancel'): void
}>()

const form = reactive<TaskFormValue>({
  title: props.initialValue?.title || '',
  startDate: props.initialValue?.startDate || '',
  endDate: props.initialValue?.endDate || null,
})

watch(
  () => props.initialValue,
  value => {
    if (!value) return
    form.title = value.title
    form.startDate = value.startDate
    form.endDate = value.endDate ?? null
  },
  { deep: true }
)

const onSubmit = () => {
  if (!form.title.trim() || !form.startDate) return

  emit('submit', {
    title: form.title.trim(),
    startDate: form.startDate,
    endDate: form.endDate || null,
  })
}

const onCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form class="pd4u-task-form" @submit.prevent="onSubmit">
    <div class="pd4u-task-form__row">
      <label class="pd4u-task-form__label">
        Task
      </label>

      <Input
        v-model="form.title"
        placeholder="What do you plan?"
        autocomplete="off"
      />
    </div>

    <div class="pd4u-task-form__row pd4u-task-form__row--inline">
      <div class="pd4u-task-form__field">
        <label class="pd4u-task-form__label">
          From
        </label>

        <Input
          v-model="form.startDate"
          type="date"
        />
      </div>

      <div class="pd4u-task-form__field">
        <label class="pd4u-task-form__label">
          To
        </label>

        <Input
          v-model="form.endDate"
          type="date"
        />
      </div>
    </div>

    <div class="pd4u-task-form__actions">
      <Button type="submit" variant="primary" size="sm">
        {{ props.submitLabel }}
      </Button>

      <Button
        v-if="props.showCancel"
        type="button"
        variant="ghost"
        size="sm"
        @click="onCancel"
      >
        Cancel
      </Button>
    </div>
  </form>
</template>

<style scoped>
.pd4u-task-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--pd4u-radius-md, 10px);
  background-color: var(--pd4u-card-bg, #ffffff);
  border: 1px solid var(--pd4u-card-border, #e5e7eb);
  box-sizing: border-box;
}

.pd4u-task-form__row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pd4u-task-form__row--inline {
  flex-direction: row;
  gap: 8px;
}

.pd4u-task-form__field {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pd4u-task-form__label {
  font-size: 12px;
  color: var(--pd4u-text-muted, #6b7280);
}

.pd4u-task-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}
</style>
