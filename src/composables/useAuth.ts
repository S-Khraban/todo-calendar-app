import { onMounted, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/services/supabaseClient'

const user = ref<User | null>(null)
const isReady = ref(false)

export function useAuth() {
  const init = async () => {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })

    isReady.value = true
  }

  onMounted(() => {
    if (!isReady.value) init()
  })

  return { user, isReady }
}
