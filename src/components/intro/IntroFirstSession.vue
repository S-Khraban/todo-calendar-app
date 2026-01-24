<template>
  <transition name="intro-fade">
    <div v-if="visible" class="intro" aria-label="PD4U intro">
      <div class="intro__backdrop"></div>

      <div class="intro__stage">
        <div class="intro__tile intro__tile--p">P</div>
        <div class="intro__tile intro__tile--d">D</div>
        <div class="intro__tile intro__tile--4">4</div>
        <div class="intro__tile intro__tile--u">U</div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const SESSION_KEY = 'pd4u_intro_seen'

const visible = ref(false)

onMounted(() => {
  const seen = sessionStorage.getItem(SESSION_KEY) === '1'
  if (seen) return

  sessionStorage.setItem(SESSION_KEY, '1')
  visible.value = true

  window.setTimeout(() => {
    visible.value = false
  }, 3000)
})
</script>

<style scoped>
.intro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.intro__backdrop {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background: rgba(10, 12, 16, 0.35);
}

.intro__stage {
  position: relative;
  width: 144px;
  height: 144px;
  z-index: 1;
  transform: translateZ(0);
}

.intro__tile {
  position: absolute;
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 0;

  font-weight: 800;
  font-size: 32px;
  line-height: 1;
  letter-spacing: 0.02em;

  opacity: 0;

  animation:
    intro-in 320ms cubic-bezier(0.2, 0.9, 0.2, 1) 80ms both,
    intro-hold 600ms linear 400ms both,
    intro-out 2000ms cubic-bezier(0.2, 0.85, 0.2, 1) 1600ms both;
}

.intro__tile--p {
  background: #1d4ed8;
  color: rgba(255, 255, 255, 0.95);
  top: 0;
  left: 0;
  --ox: -140px;
  --oy: -120px;
  --or: -260deg;
}

.intro__tile--d {
  background: #facc15;
  color: rgba(14, 18, 24, 0.9);
  top: 0;
  left: 72px;
  --ox: 150px;
  --oy: -110px;
  --or: 240deg;
}

.intro__tile--4 {
  background: #ef4444;
  color: rgba(255, 255, 255, 0.95);
  top: 72px;
  left: 0;
  --ox: -150px;
  --oy: 140px;
  --or: 260deg;
}

.intro__tile--u {
  background: #22c55e;
  color: rgba(255, 255, 255, 0.95);
  top: 72px;
  left: 72px;
  --ox: 150px;
  --oy: 140px;
  --or: -240deg;
}

@keyframes intro-in {
  0% {
    opacity: 0;
    transform: translate(0px, 0px) scale(0.88);
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform: translate(0px, 0px) scale(1);
    filter: blur(0);
  }
}

@keyframes intro-hold {
  0% {
    opacity: 1;
    transform: translate(0px, 0px) scale(1);
  }
  100% {
    opacity: 1;
    transform: translate(0px, 0px) scale(1);
  }
}

@keyframes intro-out {
  0% {
    opacity: 1;
    transform: translate(0px, 0px) rotate(0deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--ox), var(--oy)) rotate(var(--or)) scale(0.92);
  }
}

.intro-fade-enter-active,
.intro-fade-leave-active {
  transition: opacity 240ms ease;
}

.intro-fade-enter-from,
.intro-fade-leave-to {
  opacity: 0;
}
</style>
