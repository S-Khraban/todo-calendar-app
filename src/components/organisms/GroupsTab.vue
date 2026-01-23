<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGroupsStore, type GroupRole } from '@/stores/groups'
import CreateGroupModal from '@/components/organisms/CreateGroupModal.vue'
import InviteMemberModal from '@/components/organisms/InviteMemberModal.vue'
import DeleteGroupModal from '@/components/organisms/DeleteGroupModal.vue'
import GroupSettingsModal from '@/components/organisms/GroupSettingsModal.vue'
import { GROUP_COLORS } from '@/constants/groupColors'
import { withAlpha } from '@/utils/color'

type GroupColor = (typeof GROUP_COLORS)[number]

const groupsStore = useGroupsStore()
const { groups, invites, isLoading, error } = storeToRefs(groupsStore)

const isCreateOpen = ref(false)
const isInviteOpen = ref(false)
const isDeleteOpen = ref(false)
const isSettingsOpen = ref(false)

const activeInviteGroupId = ref<string | null>(null)
const activeInviteGroupName = ref('')
const lastInviteToken = ref<string | null>(null)

const activeDeleteGroupId = ref<string | null>(null)
const activeDeleteGroupName = ref('')

const activeSettingsGroupId = ref<string | null>(null)
const activeSettingsGroupName = ref('')
const activeSettingsGroupColor = ref<GroupColor>(GROUP_COLORS[0])
const activeSettingsMyRole = ref<GroupRole>('member')

onMounted(() => {
  groupsStore.fetchMyGroups()
  groupsStore.fetchInvites()
})

const roleLabel = (role: GroupRole) =>
  role === 'owner' ? 'Owner' : role === 'admin' ? 'Admin' : 'Member'

const canInvite = (role: GroupRole) => role === 'owner' || role === 'admin'
const canDelete = (role: GroupRole) => role === 'owner'
const canManage = (role: GroupRole) => role === 'owner' || role === 'admin'

const groupStyle = (color: string) => ({
  backgroundColor: withAlpha(color, 0.1),
  borderColor: color,
})

const openCreate = () => (isCreateOpen.value = true)

const handleCreateSubmit = async (payload: { name: string; color: GroupColor }) => {
  const id = await groupsStore.createGroup(payload.name, payload.color)
  if (id) isCreateOpen.value = false
}

const openInvite = (groupId: string, groupName: string) => {
  activeInviteGroupId.value = groupId
  activeInviteGroupName.value = groupName
  lastInviteToken.value = null
  isInviteOpen.value = true
}

const inviteLink = computed(() =>
  lastInviteToken.value ? `${window.location.origin}/invite/${lastInviteToken.value}` : null
)

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

const openSettings = (groupId: string, groupName: string, myRole: GroupRole, groupColor: GroupColor) => {
  activeSettingsGroupId.value = groupId
  activeSettingsGroupName.value = groupName
  activeSettingsGroupColor.value = groupColor
  activeSettingsMyRole.value = myRole
  isSettingsOpen.value = true
}

const acceptInvite = async (token: string) => {
  await groupsStore.acceptInvite(token)
}

const declineInvite = async (token: string) => {
  await groupsStore.declineInvite(token)
}

const inviteSubtitle = (inv: any) =>
  `${inv.inviterEmail ? `Invited by ${inv.inviterEmail}` : 'Invited by Unknown'} • Pending`
</script>

<template>
  <section>
    <header class="groups-header">
      <h2 class="groups-title">Groups</h2>
      <button type="button" class="btn" :disabled="isLoading" @click="openCreate">
        Create group
      </button>
    </header>

    <p v-if="isLoading">Loading...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <div v-else>
      <div v-if="invites.length" class="invites">
        <h3 class="invites-title">Invites ({{ invites.length }})</h3>

        <ul class="invites-list">
          <li v-for="inv in invites" :key="inv.id" class="invite-item">
            <div>
              <div class="invite-name">{{ inv.groupName }}</div>
              <div class="invite-meta">{{ inviteSubtitle(inv) }}</div>
            </div>

            <div class="actions">
              <button type="button" class="btn" :disabled="isLoading" @click="declineInvite(inv.token)">
                Decline
              </button>
              <button type="button" class="btn" :disabled="isLoading" @click="acceptInvite(inv.token)">
                Accept
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="groups.length === 0" class="empty">
        You are not a member of any group yet.
      </div>

      <ul v-else class="groups-list">
        <li
          v-for="g in groups"
          :key="g.groupId"
          class="group-item"
          :style="groupStyle(g.color)"
        >
          <div class="group-left">
            <div class="group-color" :style="{ backgroundColor: g.color }" />
            <div>
              <div class="group-name">{{ g.name }}</div>
              <div class="group-role">{{ roleLabel(g.role) }}</div>
            </div>
          </div>

          <div class="actions">
            <button
              v-if="canManage(g.role)"
              type="button"
              class="btn"
              :disabled="isLoading"
              @click="openSettings(g.groupId, g.name, g.role, g.color as GroupColor)"
            >
              Settings
            </button>

            <button
              type="button"
              class="btn"
              :disabled="isLoading || !canInvite(g.role)"
              @click="openInvite(g.groupId, g.name)"
            >
              Invite
            </button>

            <button
              v-if="canDelete(g.role)"
              type="button"
              class="btn btn-danger"
              :disabled="isLoading"
              @click="openDelete(g.groupId, g.name)"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
    </div>

    <CreateGroupModal v-model="isCreateOpen" :loading="isLoading" @submit="handleCreateSubmit" />
    <InviteMemberModal
      v-model="isInviteOpen"
      :loading="isLoading"
      :group-name="activeInviteGroupName"
      :invite-link="inviteLink"
      @submit="handleInviteSubmit"
    />
    <DeleteGroupModal
      v-model="isDeleteOpen"
      :loading="isLoading"
      :group-name="activeDeleteGroupName"
      @confirm="confirmDelete"
    />
    <GroupSettingsModal
      v-model="isSettingsOpen"
      :group-id="activeSettingsGroupId"
      :group-name="activeSettingsGroupName"
      :group-color="activeSettingsGroupColor"
      :my-role="activeSettingsMyRole"
      :loading="isLoading"
      @updated="groupsStore.fetchMyGroups()"
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

.invites-list,
.groups-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: grid;
  gap: 10px;
}

.invite-item,
.group-item {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-left {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.group-color {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.15);
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
