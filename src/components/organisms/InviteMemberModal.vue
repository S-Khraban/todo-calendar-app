<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  loading?: boolean
  groupName?: string
  inviteLink?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', email: string): void
}>()

const email = ref('')
const copied = ref(false)
const localError = ref<string | null>(null)

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      email.value = ''
      copied.value = false
      localError.value = null
    }
  }
)

watch(
  () => props.inviteLink,
  async (next) => {
    copied.value = false
    localError.value = null
    if (next) {
      try {
        await navigator.clipboard.writeText(next)
        copied.value = true
      } catch {
        copied.value = false
      }
    }
  }
)

const canSubmit = computed(() => email.value.trim().length > 0)
const hasInvite = computed(() => !!props.inviteLink)

const close = () => emit('update:modelValue', false)

const submit = () => {
  localError.value = null
  const trimmed = email.value.trim()
  if (!trimmed) return
  emit('submit', trimmed)
}

const copyInvite = async () => {
  localError.value = null
  if (!props.inviteLink) return
  try {
    await navigator.clipboard.writeText(props.inviteLink)
    copied.value = true
  } catch {
    copied.value = false
    localError.value = 'Copy failed'
  }
}
</script>

<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal">
      <h3 class="modal-title">
        Invite member<span v-if="groupName"> to {{ groupName }}</span>
      </h3>

      <p v-if="localError" class="error">{{ localError }}</p>

      <template v-if="hasInvite">
        <p class="success">Invite created.</p>

        <label class="field">
          <span class="field__label">Invite link</span>
          <input class="input" type="text" :value="inviteLink ?? ''" readonly />
        </label>

        <div class="modal-actions">
          <button type="button" class="btn" @click="close">Close</button>
          <button type="button" class="btn btn-primary" @click="copyInvite">
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </div>
      </template>

      <template v-else>
        <label class="field">
          <span class="field__label">Email</span>
          <input
            v-model="email"
            class="input"
            type="email"
            placeholder="name@example.com"
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
            Invite
          </button>
        </div>
      </template>
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

.success {
  margin: 0 0 12px;
  opacity: 0.85;
}

.error {
  margin: 0 0 12px;
  color: #b00020;
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
