<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/services/supabaseClient'
import { useGroupsStore } from '@/stores/groups'

const route = useRoute()
const router = useRouter()
const groupsStore = useGroupsStore()

const token = computed(() => String(route.params.token ?? '').trim())

const isCheckingAuth = ref(true)
const isAuthed = ref(false)

const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  isAuthed.value = !!data.session
  isCheckingAuth.value = false

  if (!isAuthed.value) {
    router.replace({ name: 'user', query: { redirect: route.fullPath } })
    return
  }

  await groupsStore.fetchInvites()

  const hasInvite = groupsStore.invites.some(
    (i) => i.token === token.value
  )

  if (!hasInvite) {
    error.value = 'Invite not found, expired, or not for your account.'
  }
})

const accept = async () => {
  error.value = null

  if (!token.value) {
    error.value = 'Invalid invite token.'
    return
  }

  if (!isAuthed.value) {
    router.replace({ name: 'user', query: { redirect: route.fullPath } })
    return
  }

  isLoading.value = true
  const ok = await groupsStore.acceptInvite(token.value)
  isLoading.value = false

  if (!ok) {
    error.value = groupsStore.error ?? 'Failed to accept invite'
    return
  }

  success.value = true
  router.replace({ name: 'user' })
}

const decline = async () => {
  error.value = null

  if (!token.value) {
    error.value = 'Invalid invite token.'
    return
  }

  isLoading.value = true
  const ok = await groupsStore.declineInvite(token.value)
  isLoading.value = false

  if (!ok) {
    error.value = groupsStore.error ?? 'Failed to decline invite'
    return
  }

  router.replace({ name: 'user' })
}
</script>

<template>
  <section class="invite">
    <h1 class="invite__title">Group invitation</h1>

    <p v-if="isCheckingAuth" class="invite__text">Checking session...</p>

    <template v-else>
      <p v-if="!isAuthed" class="invite__text">Redirecting to sign in...</p>

      <template v-else>
        <p v-if="error" class="invite__error">{{ error }}</p>
        <p v-else-if="success" class="invite__success">
          Joined successfully. Redirecting...
        </p>
        <p v-else class="invite__text">
          Accept or decline the invitation to join the group.
        </p>

        <div v-if="!success" class="actions">
          <button
            type="button"
            class="btn"
            :disabled="isLoading"
            @click="decline"
          >
            Decline
          </button>

          <button
            type="button"
            class="btn"
            :disabled="isLoading"
            @click="accept"
          >
            {{ isLoading ? 'Processing...' : 'Accept' }}
          </button>
        </div>
      </template>
    </template>
  </section>
</template>

<style scoped>
.invite {
  max-width: 560px;
  margin: 24px auto;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
}

.invite__title {
  margin: 0 0 10px;
}

.invite__text {
  margin: 0 0 12px;
  opacity: 0.8;
}

.invite__error {
  margin: 0 0 12px;
  color: #b00020;
}

.invite__success {
  margin: 0 0 12px;
  opacity: 0.9;
}

.actions {
  display: inline-flex;
  gap: 8px;
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
</style>
