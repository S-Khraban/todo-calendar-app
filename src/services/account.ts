import { supabase } from '@/services/supabaseClient'

export const deleteMyAccount = async () => {
  const { data, error } = await supabase.functions.invoke('delete-account')

  if (error) {
    throw error
  }

  if (!data?.ok) {
    throw new Error('Delete account failed')
  }

  await supabase.auth.signOut()
}
