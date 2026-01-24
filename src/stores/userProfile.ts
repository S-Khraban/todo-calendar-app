import { defineStore } from 'pinia'
import { ref } from 'vue'

type UserProfileState = {
  name: string
  avatarDataUrl: string | null
}

const LS_KEY = 'pd4u_user_profile_v1'

const loadFromLS = (): UserProfileState => {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { name: '', avatarDataUrl: null }
    const parsed = JSON.parse(raw) as Partial<UserProfileState>
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      avatarDataUrl: typeof parsed.avatarDataUrl === 'string' ? parsed.avatarDataUrl : null,
    }
  } catch {
    return { name: '', avatarDataUrl: null }
  }
}

const saveToLS = (state: UserProfileState) => {
  localStorage.setItem(LS_KEY, JSON.stringify(state))
}

export const useUserProfileStore = defineStore('userProfile', () => {
  const initial = loadFromLS()

  const name = ref<string>(initial.name)
  const avatarDataUrl = ref<string | null>(initial.avatarDataUrl)

  const setName = (v: string) => {
    name.value = v
    saveToLS({ name: name.value, avatarDataUrl: avatarDataUrl.value })
  }

  const setAvatar = (dataUrl: string | null) => {
    avatarDataUrl.value = dataUrl
    saveToLS({ name: name.value, avatarDataUrl: avatarDataUrl.value })
  }

  const resetLocalProfile = () => {
    name.value = ''
    avatarDataUrl.value = null
    localStorage.removeItem(LS_KEY)
  }

  return {
    name,
    avatarDataUrl,
    setName,
    setAvatar,
    resetLocalProfile,
  }
})
