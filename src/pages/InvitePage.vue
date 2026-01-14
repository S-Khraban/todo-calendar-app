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
  const { error: e } = await supabase.rpc('accept_group_invite', {
    p_token: token.value,
  })
  isLoading.value = false

  if (e) {
    error.value = e.message
    return
  }

  success.value = true
  await groupsStore.fetchMyGroups()
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
        <p v-else-if="success" class="invite__success">Joined successfully.</p>
        <p v-else class="invite__text">Accept the invitation to join the group.</p>

        <button
          type="button"
          class="btn"
          :disabled="isLoading || success"
          @click="accept"
        >
          {{ isLoading ? 'Accepting...' : 'Accept' }}
        </button>
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
