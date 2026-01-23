import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabaseClient'
import { GROUP_COLORS } from '@/constants/groupColors'

export type GroupRole = 'owner' | 'admin' | 'member'

export type GroupListItem = {
  groupId: string
  name: string
  role: GroupRole
  color: string
}

export type GroupInviteItem = {
  id: string
  token: string
  groupId: string
  groupName: string
  email: string
  expiresAt: string
  inviterId: string | null
  inviterEmail: string | null
  inviterName: string | null
}

export type GroupMemberItem = {
  userId: string
  email: string | null
  name: string | null
  role: GroupRole
}

type MyGroupRow = {
  group_id: string
  name: string
  color: string | null
  role: GroupRole
}

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref<GroupListItem[]>([])
  const invites = ref<GroupInviteItem[]>([])
  const membersByGroupId = ref<Record<string, GroupMemberItem[]>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchMyGroups = async () => {
    isLoading.value = true
    error.value = null

    const { data, error: e } = await supabase.rpc('get_my_groups')

    if (e) {
      error.value = e.message
      groups.value = []
      isLoading.value = false
      return
    }

    const rows = (data ?? []) as MyGroupRow[]

    groups.value = rows.map((r) => ({
      groupId: r.group_id,
      name: r.name,
      role: r.role,
      color: r.color ?? GROUP_COLORS[0],
    }))

    isLoading.value = false
  }

  const fetchInvites = async () => {
    isLoading.value = true
    error.value = null

    const { data, error: e } = await supabase.rpc('get_my_group_invites')

    if (e) {
      error.value = e.message
      invites.value = []
      isLoading.value = false
      return
    }

    invites.value = (data ?? []).map((row: any) => ({
      id: row.id,
      token: row.token,
      groupId: row.group_id,
      groupName: row.group_name ?? 'Unknown',
      email: row.email,
      expiresAt: row.expires_at,
      inviterId: null,
      inviterEmail: row.inviter_email ?? null,
      inviterName: row.inviter_name ?? row.inviter_email ?? null,
    }))

    isLoading.value = false
  }

  const createGroup = async (name: string, color?: string) => {
    isLoading.value = true
    error.value = null

    const { data, error: e } = await supabase.rpc('create_group', {
      p_name: name,
      p_color: color ?? GROUP_COLORS[0],
    })

    if (e) {
      error.value = e.message
      isLoading.value = false
      return null
    }

    await fetchMyGroups()
    isLoading.value = false
    return data as string
  }

  const createInvite = async (groupId: string, email: string) => {
    isLoading.value = true
    error.value = null

    const { data, error: e } = await supabase.rpc('create_group_invite', {
      p_group_id: groupId,
      p_email: email,
      p_expires_in_hours: 168,
    })

    if (e) {
      error.value = e.message
      isLoading.value = false
      return null
    }

    isLoading.value = false
    return data as { token: string }
  }

  const acceptInvite = async (token: string) => {
    isLoading.value = true
    error.value = null

    const { error: e } = await supabase.rpc('accept_group_invite', { p_token: token })

    if (e) {
      error.value = e.message
      isLoading.value = false
      return false
    }

    await Promise.all([fetchMyGroups(), fetchInvites()])
    isLoading.value = false
    return true
  }

  const declineInvite = async (token: string) => {
    isLoading.value = true
    error.value = null

    const { error: e } = await supabase.rpc('decline_group_invite', { p_token: token })

    if (e) {
      error.value = e.message
      isLoading.value = false
      return false
    }

    await fetchInvites()
    isLoading.value = false
    return true
  }

  const deleteGroup = async (groupId: string) => {
    isLoading.value = true
    error.value = null

    const { error: e } = await supabase.from('groups').delete().eq('id', groupId)

    if (e) {
      error.value = e.message
      isLoading.value = false
      return false
    }

    groups.value = groups.value.filter((g) => g.groupId !== groupId)
    delete membersByGroupId.value[groupId]

    isLoading.value = false
    return true
  }

  const fetchGroupMembers = async (groupId: string, force = false) => {
    if (!force && membersByGroupId.value[groupId]?.length) {
      return { ok: true as const, data: membersByGroupId.value[groupId]! }
    }

    const { data, error: e } = await supabase.rpc('get_group_members', { p_group_id: groupId })

    if (e) return { ok: false as const, error: e.message, data: [] as GroupMemberItem[] }

    const mapped: GroupMemberItem[] = (data ?? []).map((row: any) => ({
      userId: row.user_id,
      email: row.email ?? null,
      name: row.name ?? row.full_name ?? null,
      role: row.role as GroupRole,
    }))

    membersByGroupId.value[groupId] = mapped
    return { ok: true as const, data: mapped }
  }

  const updateGroup = async (groupId: string, payload: { name?: string; color?: string }) => {
    const name = payload.name?.trim()
    const patch: Record<string, any> = {}

    if (name) patch.name = name
    if (payload.color) patch.color = payload.color

    if (Object.keys(patch).length === 0) return { ok: true as const }

    const { error: e } = await supabase.from('groups').update(patch).eq('id', groupId)

    if (e) return { ok: false as const, error: e.message }

    const g = groups.value.find((x) => x.groupId === groupId)
    if (g) {
      if (name) g.name = name
      if (payload.color) g.color = payload.color
    }

    return { ok: true as const }
  }

  const renameGroup = async (groupId: string, name: string) => {
    if (!name) return { ok: false as const, error: 'Name is required' }
    return updateGroup(groupId, { name })
  }

  const setMemberRole = async (groupId: string, userId: string, role: GroupRole) => {
    const { error: e } = await supabase.rpc('set_group_member_role', {
      p_group_id: groupId,
      p_user_id: userId,
      p_role: role,
    })

    if (e) return { ok: false as const, error: e.message }

    const list = membersByGroupId.value[groupId]
    if (list) {
      const m = list.find((x) => x.userId === userId)
      if (m) m.role = role
    }

    await fetchMyGroups()
    return { ok: true as const }
  }

  const transferOwnership = async (groupId: string, newOwnerId: string) => {
    const { error: e } = await supabase.rpc('transfer_group_ownership', {
      p_group_id: groupId,
      p_new_owner_id: newOwnerId,
    })

    if (e) return { ok: false as const, error: e.message }

    await Promise.all([fetchMyGroups(), fetchGroupMembers(groupId, true)])
    return { ok: true as const }
  }

  return {
    groups,
    invites,
    membersByGroupId,
    isLoading,
    error,
    fetchMyGroups,
    fetchInvites,
    createGroup,
    createInvite,
    acceptInvite,
    declineInvite,
    deleteGroup,
    fetchGroupMembers,
    updateGroup,
    renameGroup,
    setMemberRole,
    transferOwnership,
  }
})
