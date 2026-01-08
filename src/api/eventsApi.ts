import { supabase } from '@/services/supabaseClient'

export type CalendarEvent = {
  id: string
  title: string
  description: string | null
  start_at: string
  end_at: string | null
  created_at: string
  updated_at: string
}

export async function listMyEvents(params?: { from?: string; to?: string }) {
  let q = supabase
    .from('events')
    .select('id,title,description,start_at,end_at,created_at,updated_at')
    .order('start_at', { ascending: true })

  if (params?.from) q = q.gte('start_at', params.from)
  if (params?.to) q = q.lte('start_at', params.to)

  const { data, error } = await q
  if (error) throw error

  return (data ?? []) as CalendarEvent[]
}
