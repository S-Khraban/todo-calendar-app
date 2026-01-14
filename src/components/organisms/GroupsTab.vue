<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useGroupsStore } from '@/stores/groups'
import CreateGroupModal from '@/components/organisms/CreateGroupModal.vue'
import InviteMemberModal from '@/components/organisms/InviteMemberModal.vue'

const groupsStore = useGroupsStore()

const isCreateOpen = ref(false)
const isInviteOpen = ref(false)
const activeInviteGroupId = ref<string | null>(null)
const activeInviteGroupName = ref<string>('')

const lastInviteToken = ref<string | null>(null)

onMounted(() => {
  groupsStore.fetchMyGroups()
})

const roleLabel = (role: string) => {
  if (role === 'owner') return 'Owner'
  if (role === 'admin') return 'Admin'
  return 'Member'
}

const openCreate = () => {
  isCreateOpen.value = true
}

const handleCreateSubmit = async (name: string) => {
  const id = await groupsStore.createGroup(name)
  if (id) isCreateOpen.value = false
}

const canInvite = (role: string) => role === 'owner' || role === 'admin'

const openInvite = (groupId: string, groupName: string) => {
  activeInviteGroupId.value = groupId
  activeInviteGroupName.value = groupName
  lastInviteToken.value = null
  isInviteOpen.value = true
}

const inviteLink = computed(() => {
  if (!lastInviteToken.value) return null
  return `${window.location.origin}/invite/${lastInviteToken.value}`
})

const handleInviteSubmit = async (email: string) => {
  if (!activeInviteGroupId.value) return
  const res = await groupsStore.createInvite(activeInviteGroupId.value, email)
  lastInviteToken.value = res?.token ?? null
}
</script>

<template>
  <section>
    <header class="groups-header">
      <h2 class="groups-title">Groups</h2>
      <button
        type="button"
        class="btn"
        :disabled="groupsStore.isLoading"
        @click="openCreate"
      >
        Create group
      </button>
    </header>

    <p v-if="groupsStore.isLoading">Loading...</p>
    <p v-else-if="groupsStore.error" class="error">
      {{ groupsStore.error }}
    </p>

    <div v-else-if="groupsStore.groups.length === 0" class="empty">
      You are not a member of any group yet.
    </div>

    <ul v-else class="groups-list">
      <li v-for="g in groupsStore.groups" :key="g.groupId" class="group-item">
        <div>
          <div class="group-name">{{ g.name }}</div>
          <div class="group-role">{{ roleLabel(g.role) }}</div>
        </div>

        <button
          type="button"
          class="btn"
          :disabled="groupsStore.isLoading || !canInvite(g.role)"
          :title="canInvite(g.role) ? 'Invite member' : 'Only owner/admin can invite'"
          @click="openInvite(g.groupId, g.name)"
        >
          Invite
        </button>
      </li>
    </ul>

    <CreateGroupModal
      v-model="isCreateOpen"
      :loading="groupsStore.isLoading"
      @submit="handleCreateSubmit"
    />

    <InviteMemberModal
      v-model="isInviteOpen"
      :loading="groupsStore.isLoading"
      :group-name="activeInviteGroupName"
      :invite-link="inviteLink"
      @submit="handleInviteSubmit"
    />
  </section>
</template>

<style scoped>
.groups-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.groups-title {
  margin: 0;
}

.groups-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: grid;
  gap: 10px;
}

.group-item {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-name {
  font-weight: 600;
}

.group-role {
  opacity: 0.7;
  font-size: 12px;
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

.error {
  color: #b00020;
}

.empty {
  opacity: 0.7;
}
</style>
