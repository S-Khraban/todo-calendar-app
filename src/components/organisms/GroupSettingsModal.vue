<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { supabase } from '@/services/supabaseClient'
import { useGroupsStore, type GroupMemberItem, type GroupRole } from '@/stores/groups'

const props = defineProps<{
  modelValue: boolean
  groupId: string | null
  groupName: string
  myRole: GroupRole
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'updated'): void
}>()

const groupsStore = useGroupsStore()

const tab = ref<'group' | 'members'>('group')
const nameDraft = ref('')
const members = ref<GroupMemberItem[]>([])
const localLoading = ref(false)
const localError = ref<string | null>(null)
const myUserId = ref<string | null>(null)
const confirmTransferUserId = ref<string | null>(null)

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const canManage = computed(() => props.myRole === 'owner' || props.myRole === 'admin')

const close = () => {
  isOpen.value = false
  tab.value = 'group'
  localError.value = null
  confirmTransferUserId.value = null
}

const loadMe = async () => {
  const { data } = await supabase.auth.getUser()
  myUserId.value = data.user?.id ?? null
}

const loadMembers = async () => {
  if (!props.groupId) return
  localLoading.value = true
  localError.value = null

  try {
    const res = await groupsStore.fetchGroupMembers(props.groupId)

    if (!res.ok) {
      localError.value = res.error ?? 'Failed to load members'
      members.value = []
      return
    }

    members.value = res.data
  } catch (e: any) {
    localError.value = e?.message ?? 'Failed to load members'
    members.value = []
  } finally {
    localLoading.value = false
  }
}

const openInit = async () => {
  nameDraft.value = props.groupName
  await loadMe()
  await loadMembers()
}

watch(
  () => props.modelValue,
  async (v) => {
    if (v) await openInit()
  }
)

watch(
  () => props.groupName,
  (v) => {
    nameDraft.value = v
  }
)

const canEditMember = (m: GroupMemberItem) => {
  if (props.myRole === 'owner') return true
  if (props.myRole === 'admin') return m.role !== 'owner'
  return false
}

const roleOptions = (m: GroupMemberItem): GroupRole[] => {
  if (props.myRole === 'owner') return ['owner', 'admin', 'member']
  if (props.myRole === 'admin') return m.role === 'owner' ? ['owner'] : ['admin', 'member']
  return [m.role]
}

const saveName = async () => {
  if (!props.groupId) return
  localError.value = null
  localLoading.value = true

  try {
    const ok = await groupsStore.renameGroup(props.groupId, nameDraft.value.trim())
    if (!ok.ok) {
      localError.value = ok.error ?? 'Failed to rename group'
      return
    }
    emit('updated')
  } catch (e: any) {
    localError.value = e?.message ?? 'Failed to rename group'
  } finally {
    localLoading.value = false
  }
}

const setRole = async (userId: string, role: GroupRole) => {
  if (!props.groupId) return
  if (role === 'owner') {
    localError.value = 'Cannot change owner role. Use transfer ownership.'
    await loadMembers()
    return
  }

  localError.value = null
  const prev = members.value
  members.value = members.value.map((m) => (m.userId === userId ? { ...m, role } : m))

  try {
    const res = await groupsStore.setMemberRole(props.groupId, userId, role)
    if (!res.ok) {
      members.value = prev
      localError.value = res.error ?? 'Failed to update role'
      return
    }
    emit('updated')
    await loadMembers()
  } catch (e: any) {
    members.value = prev
    localError.value = e?.message ?? 'Failed to update role'
  }
}

const canTransferOwnership = (m: GroupMemberItem) => {
  if (props.myRole !== 'owner') return false
  if (!myUserId.value) return false
  if (m.userId === myUserId.value) return false
  return m.role !== 'owner'
}

const askTransfer = (userId: string) => {
  confirmTransferUserId.value = userId
}

const cancelTransfer = () => {
  confirmTransferUserId.value = null
}

const confirmTransfer = async () => {
  if (!props.groupId || !confirmTransferUserId.value) return
  localError.value = null
  localLoading.value = true

  try {
    const res = await groupsStore.transferOwnership(props.groupId, confirmTransferUserId.value)
    if (!res.ok) {
      localError.value = res.error ?? 'Failed to transfer ownership'
      return
    }
    confirmTransferUserId.value = null
    emit('updated')
    await loadMembers()
  } catch (e: any) {
    localError.value = e?.message ?? 'Failed to transfer ownership'
  } finally {
    localLoading.value = false
  }
}

onMounted(() => {
  if (props.modelValue) openInit()
})
</script>

<template>
  <div v-if="isOpen" class="overlay" @click.self="close">
    <div class="modal">
      <header class="head">
        <div class="title">Group settings</div>
        <button type="button" class="icon-btn" @click="close">✕</button>
      </header>

      <div v-if="!canManage" class="error">
        Only owner/admin can manage this group.
      </div>

      <div v-else>
        <div class="tabs">
          <button
            type="button"
            class="tab"
            :class="{ active: tab === 'group' }"
            @click="tab = 'group'"
          >
            Group
          </button>
          <button
            type="button"
            class="tab"
            :class="{ active: tab === 'members' }"
            @click="tab = 'members'"
          >
            Members
          </button>
        </div>

        <div v-if="localError" class="error">{{ localError }}</div>

        <div v-if="tab === 'group'" class="panel">
          <label class="label">Group name</label>
          <input
            class="input"
            type="text"
            :disabled="props.loading || localLoading"
            v-model="nameDraft"
            placeholder="Group name"
          />

          <div class="row">
            <button
              type="button"
              class="btn"
              :disabled="props.loading || localLoading || !nameDraft.trim()"
              @click="saveName"
            >
              Save
            </button>
            <button
              type="button"
              class="btn"
              :disabled="props.loading || localLoading"
              @click="loadMembers"
            >
              Refresh
            </button>
          </div>
        </div>

        <div v-else class="panel">
          <div class="members-head">
            <div class="muted">Members</div>
            <button
              type="button"
              class="btn"
              :disabled="props.loading || localLoading"
              @click="loadMembers"
            >
              Refresh
            </button>
          </div>

          <div v-if="localLoading" class="muted">Loading...</div>

          <ul v-else class="members">
            <li v-for="m in members" :key="m.userId" class="member">
              <div class="left">
                <div class="name">{{ m.name ?? m.email ?? m.userId }}</div>
                <div class="meta">{{ m.email ?? '' }}</div>
              </div>

              <div class="right">
                <select
                  class="select"
                  :disabled="props.loading || localLoading || !canEditMember(m) || m.role === 'owner'"
                  :value="m.role"
                  @change="setRole(m.userId, ($event.target as HTMLSelectElement).value as GroupRole)"
                >
                  <option v-for="r in roleOptions(m)" :key="r" :value="r">
                    {{ r }}
                  </option>
                </select>

                <button
                  v-if="canTransferOwnership(m)"
                  type="button"
                  class="btn"
                  :disabled="props.loading || localLoading"
                  @click="askTransfer(m.userId)"
                >
                  Transfer
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <footer class="foot">
        <button type="button" class="btn" @click="close">Close</button>
      </footer>
    </div>

    <div v-if="confirmTransferUserId" class="confirm-overlay" @click.self="cancelTransfer">
      <div class="confirm">
        <div class="confirm-title">Transfer ownership?</div>
        <div class="confirm-text">
          You will lose owner permissions and become admin.
        </div>
        <div class="confirm-actions">
          <button
            type="button"
            class="btn"
            :disabled="props.loading || localLoading"
            @click="cancelTransfer"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-danger"
            :disabled="props.loading || localLoading"
            @click="confirmTransfer"
          >
            Transfer
          </button>
        </div>
      </div>
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
  width: min(720px, 100%);
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

.tabs {
  display: flex;
  gap: 8px;
  padding: 12px 14px 0;
}

.tab {
  padding: 8px 10px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
}

.tab.active {
  border-color: #bbb;
  font-weight: 600;
}

.panel {
  padding: 12px 14px 14px;
}

.label {
  display: block;
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 6px;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.row {
  display: inline-flex;
  gap: 8px;
  margin-top: 10px;
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

.members-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.members {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.member {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.left {
  min-width: 0;
}

.name {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 420px;
}

.meta {
  opacity: 0.7;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 420px;
}

.right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.select {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
}

.error {
  color: #b00020;
  padding: 10px 14px;
}

.muted {
  opacity: 0.7;
}

.foot {
  padding: 12px 14px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 60;
}

.confirm {
  width: min(420px, 100%);
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ddd;
  padding: 14px;
}

.confirm-title {
  font-weight: 700;
}

.confirm-text {
  margin-top: 6px;
  opacity: 0.8;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
</style>
