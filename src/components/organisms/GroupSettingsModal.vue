<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGroupsStore, type GroupMemberItem, type GroupRole } from '@/stores/groups'
import { GROUP_COLORS } from '@/constants/groupColors'

type GroupColor = (typeof GROUP_COLORS)[number]

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  groupId: string | null
  groupName: string
  groupColor?: string
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
const colorDraft = ref<GroupColor>(GROUP_COLORS[0])
const members = ref<GroupMemberItem[]>([])
const localLoading = ref(false)
const localError = ref<string | null>(null)

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const canManage = computed(() => props.myRole === 'owner' || props.myRole === 'admin')

const close = () => {
  isOpen.value = false
  tab.value = 'group'
  localError.value = null
}

const loadMembers = async () => {
  if (!props.groupId) return
  localLoading.value = true
  localError.value = null

  try {
    const res = await groupsStore.fetchGroupMembers(props.groupId)

    if (!res.ok) {
      localError.value = res.error ?? t('groups.errors.loadMembers')
      members.value = []
      return
    }

    members.value = res.data
  } catch (e: any) {
    localError.value = e?.message ?? t('groups.errors.loadMembers')
    members.value = []
  } finally {
    localLoading.value = false
  }
}

const initDrafts = () => {
  nameDraft.value = props.groupName
  const incoming = (props.groupColor || GROUP_COLORS[0]) as string
  colorDraft.value = (GROUP_COLORS.includes(incoming as GroupColor)
    ? (incoming as GroupColor)
    : GROUP_COLORS[0]) as GroupColor
}

const openInit = async () => {
  initDrafts()
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
  () => {
    if (props.modelValue) initDrafts()
  }
)

watch(
  () => props.groupColor,
  () => {
    if (props.modelValue) initDrafts()
  }
)

const canEditMember = (m: GroupMemberItem) => {
  if (props.myRole === 'owner') return true
  if (props.myRole === 'admin') return m.role !== 'owner'
  return false
}

const roleOptions = (m: GroupMemberItem): GroupRole[] => {
  if (m.role === 'owner') return ['owner']
  if (props.myRole === 'owner') return ['admin', 'member']
  if (props.myRole === 'admin') return ['admin', 'member']
  return [m.role]
}

const saveGroup = async () => {
  if (!props.groupId) return
  localError.value = null
  localLoading.value = true

  try {
    const ok = await groupsStore.updateGroup(props.groupId, {
      name: nameDraft.value.trim(),
      color: colorDraft.value,
    })

    if (!ok.ok) {
      localError.value = ok.error ?? t('groups.errors.updateGroup')
      return
    }

    emit('updated')
  } catch (e: any) {
    localError.value = e?.message ?? t('groups.errors.updateGroup')
  } finally {
    localLoading.value = false
  }
}

const setRole = async (userId: string, role: GroupRole) => {
  if (!props.groupId) return
  if (role === 'owner') {
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
      localError.value = res.error ?? t('groups.errors.updateRole')
      return
    }
    emit('updated')
    await loadMembers()
  } catch (e: any) {
    members.value = prev
    localError.value = e?.message ?? t('groups.errors.updateRole')
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
        <div class="title">{{ t('groups.settings.title') }}</div>
        <button type="button" class="icon-btn" @click="close">✕</button>
      </header>

      <div v-if="!canManage" class="error">
        {{ t('groups.settings.onlyOwnerAdmin') }}
      </div>

      <div v-else>
        <div class="tabs">
          <button type="button" class="tab" :class="{ active: tab === 'group' }" @click="tab = 'group'">
            {{ t('groups.settings.tabs.group') }}
          </button>
          <button type="button" class="tab" :class="{ active: tab === 'members' }" @click="tab = 'members'">
            {{ t('groups.settings.tabs.members') }}
          </button>
        </div>

        <div v-if="localError" class="error">{{ localError }}</div>

        <div v-if="tab === 'group'" class="panel">
          <label class="label">{{ t('groups.settings.nameLabel') }}</label>
          <input
            class="input"
            type="text"
            :disabled="props.loading || localLoading"
            v-model="nameDraft"
            :placeholder="t('groups.settings.namePlaceholder')"
          />

          <label class="label" style="margin-top: 12px;">{{ t('groups.settings.colorLabel') }}</label>
          <div class="color-presets">
            <button
              v-for="c in GROUP_COLORS"
              :key="c"
              type="button"
              class="color-dot"
              :class="{ 'color-dot--active': colorDraft === c }"
              :style="{ backgroundColor: c }"
              :disabled="props.loading || localLoading"
              @click="colorDraft = c"
            />
          </div>

          <div class="row">
            <button
              type="button"
              class="btn"
              :disabled="props.loading || localLoading || !nameDraft.trim()"
              @click="saveGroup"
            >
              {{ t('common.actions.save') }}
            </button>
            <button type="button" class="btn" :disabled="props.loading || localLoading" @click="loadMembers">
              {{ t('common.actions.refresh') }}
            </button>
          </div>
        </div>

        <div v-else class="panel">
          <div class="members-head">
            <div class="muted">{{ t('groups.settings.membersTitle') }}</div>
            <button type="button" class="btn" :disabled="props.loading || localLoading" @click="loadMembers">
              {{ t('common.actions.refresh') }}
            </button>
          </div>

          <div v-if="localLoading" class="muted">{{ t('common.states.loading') }}</div>

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
                    {{ t(`groups.roles.${r}`) }}
                  </option>
                </select>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <footer class="foot">
        <button type="button" class="btn" @click="close">{{ t('common.actions.close') }}</button>
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
</style>
