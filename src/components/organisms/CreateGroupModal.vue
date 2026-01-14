<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', name: string): void
}>()

const name = ref('')

watch(
  () => props.modelValue,
  (open) => {
    if (open) name.value = ''
  }
)

const canSubmit = computed(() => name.value.trim().length > 0)

const close = () => emit('update:modelValue', false)

const submit = () => {
  const trimmed = name.value.trim()
  if (!trimmed) return
  emit('submit', trimmed)
}
</script>

<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal">
      <h3 class="modal-title">Create group</h3>

      <label class="field">
        <span class="field__label">Name</span>
        <input
          v-model="name"
          class="input"
          type="text"
          placeholder="e.g. Family, Team, Poker"
          :disabled="loading"
          @keydown.enter.prevent="submit"
        />
      </label>

      <div class="modal-actions">
        <button type="button" class="btn" :disabled="loading" @click="close">
          Cancel
        </button>

        <button
          type="button"
          class="btn btn-primary"
          :disabled="loading || !canSubmit"
          @click="submit"
        >
          Create
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
  margin: 0 0 12px;
}

.field {
  display: grid;
  gap: 6px;
}

.field__label {
  font-size: 12px;
  opacity: 0.7;
}

.input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
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

.btn-primary {
  border-color: #1a73e8;
}
</style>
