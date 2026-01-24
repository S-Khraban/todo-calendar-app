<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCategoriesStore } from '@/stores/categories'
import { supabase } from '@/services/supabaseClient'
import GroupsTab from '@/components/organisms/GroupsTab.vue'

type TabKey = 'settings' | 'groups' | 'categories'

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'settings', label: 'Settings' },
  { key: 'groups', label: 'Groups' },
  { key: 'categories', label: 'Categories' },
]

const activeTab = ref<TabKey>('settings')

const userEmail = ref('—')
const userName = ref('—')
const isAuthLoading = ref(false)

const loadUser = async () => {
  isAuthLoading.value = true

  const { data } = await supabase.auth.getUser()
  const user = data.user

  userEmail.value = user?.email ?? '—'
  userName.value =
    user?.user_metadata?.display_name
    ?? user?.user_metadata?.full_name
    ?? '—'

  isAuthLoading.value = false
}

const logout = async () => {
  await supabase.auth.signOut()
}

const categoriesStore = useCategoriesStore()

const showDefault = ref(true)

const filteredCategories = computed(() => {
  const list = categoriesStore.categories
  const visible = showDefault.value ? list : list.filter(c => !c.is_default)

  const custom = visible.filter(c => !c.is_default)
  const defaults = visible.filter(c => c.is_default)

  return [...custom, ...defaults]
})

const newCategoryName = ref('')

const createCategory = async () => {
  const name = newCategoryName.value.trim()
  if (!name) return
  await categoriesStore.createCategory(name)
  if (!categoriesStore.error) newCategoryName.value = ''
}

const startEditId = ref<string | null>(null)
const editName = ref('')

const startRename = (id: string, currentName: string) => {
  startEditId.value = id
  editName.value = currentName
}

const cancelRename = () => {
  startEditId.value = null
  editName.value = ''
}

const applyRename = async (id: string) => {
  const name = editName.value.trim()
  if (!name) return
  await categoriesStore.renameCategory(id, name)
  cancelRename()
}

const removeCategory = async (id: string) => {
  await categoriesStore.deleteCategory(id)
}

const toggleHidden = async (id: string, next: boolean) => {
  await categoriesStore.toggleHidden(id, next)
}

watch(activeTab, async tab => {
  if (tab === 'categories' && categoriesStore.categories.length === 0) {
    await categoriesStore.fetchCategories()
  }
})

type ThemeMode = 'light' | 'dark' | 'auto'
const themeMode = ref<ThemeMode>('auto')

const THEME_KEY = 'todo_theme_mode'

const loadTheme = () => {
  const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null
  themeMode.value = saved ?? 'auto'
}

const saveTheme = () => {
  localStorage.setItem(THEME_KEY, themeMode.value)
}

type FontSizeMode = 's' | 'm' | 'l'
const fontSize = ref<FontSizeMode>('m')

const FONT_SIZE_KEY = 'todo_font_size'

const fontSizePx: Record<FontSizeMode, string> = {
  s: '14px',
  m: '16px',
  l: '18px',
}

const applyFontSize = () => {
  document.documentElement.style.fontSize = fontSizePx[fontSize.value]
}

const loadFontSize = () => {
  const saved = localStorage.getItem(FONT_SIZE_KEY) as FontSizeMode | null
  fontSize.value = saved ?? 'm'
  applyFontSize()
}

const saveFontSize = () => {
  localStorage.setItem(FONT_SIZE_KEY, fontSize.value)
  applyFontSize()
}

const route = useRoute()
const router = useRouter()

const applyRedirectIfAuthed = async () => {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (!redirect) return

  const { data } = await supabase.auth.getSession()
  if (data.session) {
    router.replace(redirect)
  }
}

onMounted(async () => {
  loadTheme()
  loadFontSize()
  await loadUser()
  await applyRedirectIfAuthed()
})
</script>

<template>
  <main class="user">
    <header class="user__header">
      <div>
        <h1 class="user__title">User Center</h1>
        <p class="user__subtitle">Manage profile, categories, groups and settings</p>
      </div>
    </header>

    <nav class="tabs" role="tablist" aria-label="User page tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tabs__btn"
        :class="{ 'tabs__btn--active': activeTab === t.key }"
        type="button"
        role="tab"
        :aria-selected="activeTab === t.key"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </button>
    </nav>

    <section class="panel">
      <div v-if="activeTab === 'settings'" class="section">
        <h2 class="section__title">Settings</h2>

        <div class="card">
          <div class="row">
            <span class="label">Name</span>
            <span class="value">{{ isAuthLoading ? 'Loading…' : userName }}</span>
          </div>

          <div class="row">
            <span class="label">Email</span>
            <span class="value">{{ isAuthLoading ? 'Loading…' : userEmail }}</span>
          </div>

          <div class="actions">
            <button class="btn" type="button" @click="logout">Logout</button>
          </div>

          <div class="row">
            <span class="label">Theme</span>

            <select v-model="themeMode" class="select" @change="saveTheme">
              <option value="auto">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div class="row">
            <span class="label">Font size</span>

            <select v-model="fontSize" class="select" @change="saveFontSize">
              <option value="s">S</option>
              <option value="m">M</option>
              <option value="l">L</option>
            </select>
          </div>

          <div class="row">
            <span class="label">Language</span>
            <span class="value muted">Later (uk/en)</span>
          </div>

        </div>
      </div>

      <div v-else-if="activeTab === 'groups'" class="section">
        <GroupsTab />
      </div>

      <div v-else class="section">
        <h2 class="section__title">Categories</h2>

        <div class="card">
          <div class="toolbar">
            <label class="toggle">
              <input type="checkbox" v-model="showDefault" />
              <span>Show default</span>
            </label>
          </div>

          <div class="create">
            <input
              v-model="newCategoryName"
              class="input"
              type="text"
              placeholder="New category name"
              :disabled="categoriesStore.isCreating"
              @keydown.enter="createCategory"
            />
            <button
              class="btn"
              type="button"
              :disabled="categoriesStore.isCreating || !newCategoryName.trim()"
              @click="createCategory"
            >
              {{ categoriesStore.isCreating ? 'Creating…' : 'Create' }}
            </button>
          </div>

          <div v-if="categoriesStore.isLoading" class="muted">Loading…</div>
          <div v-else-if="categoriesStore.error" class="error">{{ categoriesStore.error }}</div>

          <ul class="list" v-else>
            <li v-for="c in filteredCategories" :key="c.id" class="list__item">
              <div class="left">
                <span class="name" :class="{ muted: c.is_hidden }">{{ c.name }}</span>
                <span v-if="c.is_default" class="pill">def</span>
                <span v-if="c.is_hidden" class="pill pill--muted">hidden</span>
              </div>

              <div class="right">
                <template v-if="startEditId === c.id">
                  <input v-model="editName" class="input input--sm" type="text" />
                  <button class="btn btn--sm" type="button" @click="applyRename(c.id)">Save</button>
                  <button class="btn btn--ghost btn--sm" type="button" @click="cancelRename">Cancel</button>
                </template>

                <template v-else>
                  <button class="btn btn--ghost btn--sm" type="button" @click="startRename(c.id, c.name)">
                    Rename
                  </button>

                  <button
                    class="btn btn--ghost btn--sm"
                    type="button"
                    @click="toggleHidden(c.id, !c.is_hidden)"
                  >
                    {{ c.is_hidden ? 'Show' : 'Hide' }}
                  </button>

                  <button
                    class="btn btn--danger btn--sm"
                    type="button"
                    :disabled="c.is_default"
                    @click="removeCategory(c.id)"
                    title="Default categories are protected"
                  >
                    Delete
                  </button>
                </template>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.user {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.user__header {
  margin-bottom: 16px;
}

.user__title {
  font-size: 28px;
  line-height: 1.2;
  margin: 0;
}

.user__subtitle {
  margin: 6px 0 0;
  opacity: 0.7;
}

.tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 16px 0;
}

.tabs__btn {
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
}

.tabs__btn--active {
  border-color: rgba(0, 0, 0, 0.45);
  font-weight: 600;
}

.panel {
  margin-top: 12px;
}

.section__title {
  margin: 0 0 12px;
  font-size: 18px;
}

.card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 14px;
  padding: 14px;
}

.row {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.row:last-child {
  border-bottom: none;
}

.label {
  opacity: 0.7;
}

.value {
  word-break: break-word;
}

.actions {
  margin-top: 12px;
}

.hint {
  margin-top: 10px;
  opacity: 0.7;
  font-size: 13px;
}

.toolbar {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.create {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  margin-bottom: 12px;
}

.input,
.select {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: transparent;
}

.input--sm {
  padding: 6px 10px;
  border-radius: 8px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list__item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.left {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.name {
  font-weight: 600;
}

.right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.pill {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  opacity: 0.9;
}

.pill--muted {
  opacity: 0.6;
}

.btn {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: transparent;
  cursor: pointer;
}

.btn--ghost {
  background: transparent;
}

.btn--danger {
  border-color: rgba(255, 0, 0, 0.35);
}

.btn--sm {
  padding: 6px 10px;
  border-radius: 8px;
}

.muted {
  opacity: 0.7;
}

.error {
  color: #b00020;
}

.placeholder {
  margin-top: 10px;
}

.ph-row {
  height: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.06);
  margin-bottom: 10px;
}
</style>
