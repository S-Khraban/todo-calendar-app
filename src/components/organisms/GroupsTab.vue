<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useGroupsStore } from '@/stores/groups'
import CreateGroupModal from '@/components/organisms/CreateGroupModal.vue'
import InviteMemberModal from '@/components/organisms/InviteMemberModal.vue'
import DeleteGroupModal from '@/components/organisms/DeleteGroupModal.vue'

const groupsStore = useGroupsStore()

const isCreateOpen = ref(false)
const isInviteOpen = ref(false)
const isDeleteOpen = ref(false)

const activeInviteGroupId = ref<string | null>(null)
const activeInviteGroupName = ref<string>('')

const lastInviteToken = ref<string | null>(null)

const activeDeleteGroupId = ref<string | null>(null)
const activeDeleteGroupName = ref<string>('')

onMounted(() => {
  groupsStore.fetchMyGroups()
  groupsStore.fetchInvites()
})

const roleLabel = (role: string) => {
  if (role === 'owner') return 'Owner'
  if (role === 'admin') return 'Admin'
  return 'Member'
}

const canInvite = (role: string) => role === 'owner' || role === 'admin'
const canDelete = (role: string) => role === 'owner'

const openCreate = () => {
  isCreateOpen.value = true
}

const handleCreateSubmit = async (name: string) => {
  const id = await groupsStore.createGroup(name)
  if (id) isCreateOpen.value = false
}

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

const openDelete = (groupId: string, groupName: string) => {
  activeDeleteGroupId.value = groupId
  activeDeleteGroupName.value = groupName
  isDeleteOpen.value = true
}

const confirmDelete = async () => {
  if (!activeDeleteGroupId.value) return
  const ok = await groupsStore.deleteGroup(activeDeleteGroupId.value)
  if (ok) {
    isDeleteOpen.value = false
    activeDeleteGroupId.value = null
    activeDeleteGroupName.value = ''
  }
}

const acceptInvite = async (token: string) => {
  await groupsStore.acceptInvite(token)
}

const declineInvite = async (token: string) => {
  await groupsStore.declineInvite(token)
}

const inviteSubtitle = (inv: any) => {
  const by = inv.inviterEmail ? `Invited by ${inv.inviterEmail}` : 'Invited by Unknown'
  const status = 'Pending'
  return `${by} • ${status}`
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

    <div v-else>
      <div v-if="groupsStore.invites.length" class="invites">
        <h3 class="invites-title">Invites ({{ groupsStore.invites.length }})</h3>

        <ul class="invites-list">
          <li v-for="inv in groupsStore.invites" :key="inv.id" class="invite-item">
            <div>
              <div class="invite-name">{{ inv.groupName }}</div>
              <div class="invite-meta">{{ inviteSubtitle(inv) }}</div>
            </div>

            <div class="actions">
              <button
                type="button"
                class="btn"
                :disabled="groupsStore.isLoading"
                @click="declineInvite(inv.token)"
              >
                Decline
              </button>

              <button
                type="button"
                class="btn"
                :disabled="groupsStore.isLoading"
                @click="acceptInvite(inv.token)"
              >
                Accept
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="groupsStore.groups.length === 0" class="empty">
        You are not a member of any group yet.
      </div>

      <ul v-else class="groups-list">
        <li v-for="g in groupsStore.groups" :key="g.groupId" class="group-item">
          <div>
            <div class="group-name">{{ g.name }}</div>
            <div class="group-role">{{ roleLabel(g.role) }}</div>
          </div>

          <div class="actions">
            <button
              type="button"
              class="btn"
              :disabled="groupsStore.isLoading || !canInvite(g.role)"
              :title="canInvite(g.role) ? 'Invite member' : 'Only owner/admin can invite'"
              @click="openInvite(g.groupId, g.name)"
            >
              Invite
            </button>

            <button
              v-if="canDelete(g.role)"
              type="button"
              class="btn btn-danger"
              :disabled="groupsStore.isLoading"
              @click="openDelete(g.groupId, g.name)"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </div>

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

    <DeleteGroupModal
      v-model="isDeleteOpen"
      :loading="groupsStore.isLoading"
      :group-name="activeDeleteGroupName"
      @confirm="confirmDelete"
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

.invites {
  margin-top: 12px;
}

.invites-title {
  margin: 0 0 8px;
  font-size: 14px;
  opacity: 0.9;
}

.invites-list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  display: grid;
  gap: 10px;
}

.invite-item {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.invite-name {
  font-weight: 600;
}

.invite-meta {
  opacity: 0.7;
  font-size: 12px;
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

.btn-danger {
  border-color: rgba(255, 0, 0, 0.35);
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
