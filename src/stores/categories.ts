import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabaseClient'

export interface Category {
  id: string
  name: string
  color: string | null
  icon: string | null
  is_default: boolean
  is_hidden: boolean
  created_at: string
}

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const isLoading = ref(false)
  const isCreating = ref(false)
  const error = ref<string | null>(null)

  const visibleCategories = computed(() =>
    categories.value.filter(c => !c.is_hidden)
  )

  const fetchCategories = async () => {
    isLoading.value = true
    error.value = null

    const { data, error: err } = await supabase
      .from('categories')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at')

    if (err) {
      error.value = err.message
    } else {
      categories.value = data ?? []
    }

    isLoading.value = false
  }

  const createCategory = async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return

    if (isCreating.value) return
    isCreating.value = true
    error.value = null

    const { error: err } = await supabase
      .from('categories')
      .insert({ name: trimmed })

    if (err) {
      error.value = err.message
      isCreating.value = false
      return
    }

    await fetchCategories()
    isCreating.value = false
  }

  const renameCategory = async (id: string, name: string) => {
    const { error: err } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)

    if (err) throw err
    await fetchCategories()
  }

  const deleteCategory = async (id: string) => {
    const { error: err } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (err) throw err
    await fetchCategories()
  }

  const toggleHidden = async (id: string, isHidden: boolean) => {
    const { error: err } = await supabase
      .from('categories')
      .update({ is_hidden: isHidden })
      .eq('id', id)

    if (err) throw err
    await fetchCategories()
  }

  const resetToDefault = async () => {
    const { error: err } = await supabase
      .from('categories')
      .delete()
      .eq('is_default', false)

    if (err) throw err
    await fetchCategories()
  }

  return {
    categories,
    visibleCategories,
    isLoading,
    isCreating,
    error,
    fetchCategories,
    createCategory,
    renameCategory,
    deleteCategory,
    toggleHidden,
    resetToDefault,
  }
})
