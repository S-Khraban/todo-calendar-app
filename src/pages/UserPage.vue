<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n'
import { useCategoriesStore } from '@/stores/categories'
import { supabase } from '@/services/supabaseClient'
import GroupsTab from '@/components/organisms/GroupsTab.vue'

type TabKey = 'settings' | 'groups' | 'categories'

const { t, locale } = useI18n()

const tabs: Array<{ key: TabKey; labelKey: string }> = [
  { key: 'settings', labelKey: 'user.tabs.settings' },
  { key: 'groups', labelKey: 'user.tabs.groups' },
  { key: 'categories', labelKey: 'user.tabs.categories' },
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

type FontSizeMode = 's' | 'm' | 'l'
const fontSize = ref<FontSizeMode>('m')

const FONT_SIZE_KEY = 'todo_font_size'

const fontSizePx: Record<FontSizeMode, string> = {
  s: '11px',
  m: '18px',
  l: '24px',
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

const LOCALE_KEY = 'todo_locale'

const loadLocale = () => {
  const saved = localStorage.getItem(LOCALE_KEY) as 'en' | 'uk' | null
  if (saved) setLocale(saved)
}

const saveLocale = (next: 'en' | 'uk') => {
  setLocale(next)
  localStorage.setItem(LOCALE_KEY, next)
}

const onChangeLocale = (e: Event) => {
  const v = (e.target as HTMLSelectElement).value as 'en' | 'uk'
  saveLocale(v)
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
  loadFontSize()
  loadLocale()
  await loadUser()
  await applyRedirectIfAuthed()
})
</script>

<template>
  <main class="user">
    <header class="user__header">
      <div>
        <h1 class="user__title">{{ t('user.title') }}</h1>
        <p class="user__subtitle">{{ t('user.subtitle') }}</p>
      </div>
    </header>

    <nav class="tabs" role="tablist" aria-label="User page tabs">
      <button
        v-for="tt in tabs"
        :key="tt.key"
        class="tabs__btn"
        :class="{ 'tabs__btn--active': activeTab === tt.key }"
        type="button"
        role="tab"
        :aria-selected="activeTab === tt.key"
        @click="activeTab = tt.key"
      >
        {{ t(tt.labelKey) }}
      </button>
    </nav>

    <section class="panel">
      <div v-if="activeTab === 'settings'" class="section">
        <h2 class="section__title">{{ t('user.tabs.settings') }}</h2>

        <div class="card">
          <div class="row">
            <span class="label">{{ t('user.settings.name') }}</span>
            <span class="value">{{ isAuthLoading ? t('common.loading') : userName }}</span>
          </div>

          <div class="row">
            <span class="label">{{ t('user.settings.email') }}</span>
            <span class="value">{{ isAuthLoading ? t('common.loading') : userEmail }}</span>
          </div>

          <div class="actions">
            <button class="btn" type="button" @click="logout">{{ t('user.settings.logout') }}</button>
          </div>

          <div class="row row--2">
            <div class="field">
              <span class="label">{{ t('user.settings.fontSize') }}</span>

              <select v-model="fontSize" class="select" @change="saveFontSize">
                <option value="s">S</option>
                <option value="m">M</option>
                <option value="l">L</option>
              </select>
            </div>

            <div class="field">
              <span class="label">{{ t('user.settings.language') }}</span>

              <select class="select" :value="locale" @change="onChangeLocale">
                <option value="en">EN</option>
                <option value="uk">UA</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'groups'" class="section">
        <GroupsTab />
      </div>

      <div v-else class="section">
        <h2 class="section__title">{{ t('user.tabs.categories') }}</h2>

        <div class="card">
          <div class="toolbar">
            <label class="toggle">
              <input type="checkbox" v-model="showDefault" />
              <span>{{ t('user.categories.showDefault') }}</span>
            </label>
          </div>

          <div class="create">
            <input
              v-model="newCategoryName"
              class="input"
              type="text"
              :placeholder="t('user.categories.newPlaceholder')"
              :disabled="categoriesStore.isCreating"
              @keydown.enter="createCategory"
            />
            <button
              class="btn"
              type="button"
              :disabled="categoriesStore.isCreating || !newCategoryName.trim()"
              @click="createCategory"
            >
              {{ categoriesStore.isCreating ? t('common.creating') : t('common.create') }}
            </button>
          </div>

          <div v-if="categoriesStore.isLoading" class="muted">{{ t('common.loading') }}</div>
          <div v-else-if="categoriesStore.error" class="error">{{ categoriesStore.error }}</div>

          <ul class="list" v-else>
            <li v-for="c in filteredCategories" :key="c.id" class="list__item">
              <div class="left">
                <span class="name" :class="{ muted: c.is_hidden }">{{ c.name }}</span>
                <span v-if="c.is_default" class="pill">{{ t('user.categories.defaultPill') }}</span>
                <span v-if="c.is_hidden" class="pill pill--muted">{{ t('user.categories.hiddenPill') }}</span>
              </div>

              <div class="right">
                <template v-if="startEditId === c.id">
                  <input v-model="editName" class="input input--sm" type="text" />
                  <button class="btn btn--sm" type="button" @click="applyRename(c.id)">{{ t('common.save') }}</button>
                  <button class="btn btn--ghost btn--sm" type="button" @click="cancelRename">{{ t('common.cancel') }}</button>
                </template>

                <template v-else>
                  <button class="btn btn--ghost btn--sm" type="button" @click="startRename(c.id, c.name)">
                    {{ t('user.categories.rename') }}
                  </button>

                  <button
                    class="btn btn--ghost btn--sm"
                    type="button"
                    @click="toggleHidden(c.id, !c.is_hidden)"
                  >
                    {{ c.is_hidden ? t('user.categories.show') : t('user.categories.hide') }}
                  </button>

                  <button
                    class="btn btn--danger btn--sm"
                    type="button"
                    :disabled="c.is_default"
                    @click="removeCategory(c.id)"
                    :title="t('user.categories.deleteHint')"
                  >
                    {{ t('user.categories.delete') }}
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

.row--2 {
  grid-template-columns: 1fr 1fr;
  align-items: start;
  border-bottom: none;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.label {
  opacity: 0.7;
}

.value {
  word-break: break-word;
}

.actions {
  margin-top: 12px;
  margin-bottom: 10px;
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

@media (max-width: 520px) {
  .row--2 {
    grid-template-columns: 1fr;
  }
}
</style>
