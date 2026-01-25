<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  loading: boolean
  groupName: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm'): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const close = () => {
  isOpen.value = false
}
</script>

<template>
  <div v-if="isOpen" class="overlay" @click.self="close">
    <div class="modal" role="dialog" aria-modal="true" aria-label="Leave group modal">
      <header class="head">
        <div class="title">{{ t('groups.leave.title') }}</div>
        <button type="button" class="icon-btn" :disabled="loading" @click="close">✕</button>
      </header>

      <div class="body">
        <p class="text">
          {{ t('groups.leave.text', { group: groupName }) }}
        </p>
        <p class="warn">
          {{ t('groups.leave.warning') }}
        </p>
      </div>

      <footer class="foot">
        <button type="button" class="btn" :disabled="loading" @click="close">
          {{ t('common.actions.cancel') }}
        </button>
        <button type="button" class="btn btn-danger" :disabled="loading" @click="$emit('confirm')">
          {{ t('groups.leave.confirm') }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 50;
}

.modal {
  width: min(480px, 100%);
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ddd;
  overflow: hidden;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #eee;
}

.title {
  font-weight: 700;
}

.icon-btn {
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
}

.body {
  padding: 12px 14px 6px;
}

.text {
  margin: 0;
}

.warn {
  margin: 10px 0 0;
  color: #b00020;
  opacity: 0.95;
  font-size: 13px;
}

.foot {
  padding: 12px 14px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.btn-danger {
  border-color: rgba(255, 0, 0, 0.35);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
