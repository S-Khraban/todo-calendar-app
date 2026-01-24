<template>
  <nav class="pd4u-navbar">
    <div class="pd4u-container pd4u-navbar__inner">
      <div class="pd4u-navbar__logo">
        PD4U
      </div>

      <div class="pd4u-navbar__right">
        <div class="pd4u-navbar__links">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="pd4u-navbar__link"
            :class="{ 'pd4u-navbar__link--active': isActive(link.to) }"
          >
            {{ t(link.labelKey) }}
          </RouterLink>
        </div>

        <div class="pd4u-navbar__auth">
          <BaseButton
            variant="ghost"
            size="sm"
            aria-haspopup="dialog"
            :aria-expanded="isAuthOpen"
            @click="toggleAuth"
            class="pd4u-auth-btn"
          >
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="t('navbar.avatarAlt')"
              class="pd4u-auth-avatar"
              referrerpolicy="no-referrer"
            />
            <span v-else class="pd4u-auth-btn__dot" />
          </BaseButton>

          <AuthPopover
            v-model="isAuthOpen"
            @close="closeAuth"
          />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AuthPopover from '@/components/molecules/AuthPopover.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { supabase } from '@/services/supabaseClient'

const route = useRoute()
const { t } = useI18n()

const links = [
  { to: '/date', labelKey: 'navbar.links.today' },
  { to: '/week', labelKey: 'navbar.links.week' },
  { to: '/calendar', labelKey: 'navbar.links.calendar' },
  { to: '/tasks', labelKey: 'navbar.links.allTasks' },
] as const

const toLocalIso = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const todayIso = toLocalIso(new Date())

const isActive = (to: string) => {
  if (to === '/date') {
    if (route.path === '/date') return true
    if (route.name === 'date' && route.params.date === todayIso) return true
    return false
  }
  return route.path === to
}

const isAuthOpen = ref(false)

const toggleAuth = () => {
  isAuthOpen.value = !isAuthOpen.value
}

const closeAuth = () => {
  isAuthOpen.value = false
}

const avatarUrl = ref<string>('')

const pickAvatarFromUser = (user: any) =>
  user?.user_metadata?.avatar_url ||
  user?.user_metadata?.picture ||
  user?.identities?.[0]?.identity_data?.avatar_url ||
  user?.identities?.[0]?.identity_data?.picture ||
  ''

const syncAvatar = async () => {
  const { data } = await supabase.auth.getUser()
  avatarUrl.value = pickAvatarFromUser(data?.user)
}

onMounted(async () => {
  await syncAvatar()

  supabase.auth.onAuthStateChange((_event, session) => {
    avatarUrl.value = pickAvatarFromUser(session?.user)
  })
})
</script>

<style scoped>
.pd4u-navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background-color: var(--pd4u-nav-bg, #ffffff);
  border-bottom: 1px solid var(--pd4u-border-subtle, #e5e7eb);
}

.pd4u-navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 10px;
}

.pd4u-navbar__logo {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.04em;
  color: #111827;
}

.pd4u-navbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pd4u-navbar__links {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pd4u-navbar__link {
  font-size: 14px;
  color: var(--pd4u-text-muted, #6b7280);
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.pd4u-navbar__link:hover {
  color: var(--pd4u-text-main, #111827);
}

.pd4u-navbar__link--active {
  color: var(--pd4u-primary-border, #2563eb);
  border-color: var(--pd4u-primary-border, #2563eb);
  font-weight: 500;
}

.pd4u-navbar__auth {
  position: relative;
  display: flex;
  align-items: center;
}

.pd4u-auth-btn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pd4u-auth-btn__dot {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pd4u-auth-btn__dot::before {
  content: '👤';
  font-size: 18px;
  line-height: 1;
}

.pd4u-auth-avatar {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  object-fit: cover;
  display: block;
}
</style>
