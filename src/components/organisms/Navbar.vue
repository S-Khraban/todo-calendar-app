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
            {{ link.label }}
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
            <span class="pd4u-auth-btn__dot" />
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AuthPopover from '@/components/molecules/AuthPopover.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()

const links = [
  { to: '/date', label: 'Today' },
  { to: '/week', label: 'Week' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/tasks', label: 'All Tasks' },
]

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
</script>

<style src="./Navbar.css" scoped />
