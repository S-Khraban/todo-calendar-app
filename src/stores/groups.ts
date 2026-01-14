import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabaseClient'

type GroupRole = 'owner' | 'admin' | 'member'

export type GroupListItem = {
  groupId: string
  name: string
  role: GroupRole
}

type GroupMemberRow = {
  role: GroupRole
  group_id: string
  groups: { id: string; name: string } | null
}

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref<GroupListItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchMyGroups = async () => {
    isLoading.value = true
    error.value = null

    const { data, error: e } = await supabase
      .from('group_members')
      .select('role, group_id, groups:group_id(id, name)')
      .order('created_at', { ascending: false })

    console.log('fetchMyGroups raw', { data, e })

    if (e) {
      error.value = e.message
      groups.value = []
      isLoading.value = false
      return
    }

    groups.value = (data as unknown as GroupMemberRow[] ?? [])
      .map((row) => {
        const g = row.groups
        if (!g?.id) return null

        return {
          groupId: g.id,
          name: g.name,
          role: row.role,
        }
      })
      .filter((v): v is GroupListItem => v !== null)

    isLoading.value = false
  }

  const createGroup = async (name: string) => {
    isLoading.value = true
    error.value = null

    const { data, error: e } = await supabase.rpc('create_group', {
      p_name: name,
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

  return { groups, isLoading, error, fetchMyGroups, createGroup, createInvite }
})
