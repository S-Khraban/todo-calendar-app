<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { GROUP_COLORS } from '@/constants/groupColors'

type GroupColor = (typeof GROUP_COLORS)[number]

interface Props {
  modelValue: boolean
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', payload: { name: string; color: GroupColor }): void
}>()

const name = ref('')
const color = ref<GroupColor>(GROUP_COLORS[0])

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      name.value = ''
      color.value = GROUP_COLORS[0]
    }
  }
)

const canSubmit = computed(() => name.value.trim().length > 0)

const close = () => {
  if (props.loading) return
  emit('update:modelValue', false)
}

const submit = () => {
  if (props.loading) return
  const trimmed = name.value.trim()
  if (!trimmed) return
  emit('submit', { name: trimmed, color: color.value })
}

const onKeydown = (e: KeyboardEvent) => {
  if (!props.modelValue) return
  if (e.key === 'Escape') close()
  if (e.key === 'Enter') submit()
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

      <div class="field">
        <span class="field__label">Color</span>

        <div class="color-presets">
          <button
            v-for="c in GROUP_COLORS"
            :key="c"
            type="button"
            class="color-dot"
            :class="{ 'color-dot--active': color === c }"
            :style="{ backgroundColor: c }"
            :disabled="loading"
            @click="color = c"
          />
        </div>
      </div>

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
          {{ loading ? 'Creating…' : 'Create' }}
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
  margin-bottom: 10px;
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

.color-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-dot {
  width: 32px;
  height: 24px;
  min-width: 32px;
  min-height: 24px;
  padding: 0;
  display: inline-flex;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  box-sizing: border-box;
}

.color-dot--active {
  border-color: #111827;
  transform: scale(1.05);
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
