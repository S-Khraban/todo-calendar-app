<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'

interface Props {
  modelValue: boolean
  loading?: boolean
  groupName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const title = computed(() =>
  props.groupName ? `Delete "${props.groupName}"?` : 'Delete group?'
)

const close = () => {
  if (props.loading) return
  emit('update:modelValue', false)
}

const confirm = () => {
  if (props.loading) return
  emit('confirm')
}

const onKeydown = (e: KeyboardEvent) => {
  if (!props.modelValue) return
  if (e.key === 'Escape') close()
  if (e.key === 'Enter') confirm()
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
  }
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal" role="dialog" aria-modal="true">
      <h3 class="modal-title">{{ title }}</h3>

      <p class="modal-text">
        This action cannot be undone. The group, its members, and related tasks will be deleted.
      </p>

      <div class="modal-actions">
        <button type="button" class="btn" :disabled="loading" @click="close">
          Cancel
        </button>

        <button
          type="button"
          class="btn btn-danger"
          :disabled="loading"
          @click="confirm"
        >
          {{ loading ? 'Deleting…' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 50;
}

.modal {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #ddd;
}

.modal-title {
  margin: 0 0 10px;
}

.modal-text {
  margin: 0;
  opacity: 0.8;
  line-height: 1.4;
}

.modal-actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  border-color: rgba(255, 0, 0, 0.35);
}
</style>
