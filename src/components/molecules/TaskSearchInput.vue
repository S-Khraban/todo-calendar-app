<template>
  <div class="task-search">
    <BaseInput
      v-model="model"
      :label="t('tasks.search.label')"
      :placeholder="t('tasks.search.placeholder')"
      name="tasks-search"
      autocomplete="off"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseInput from '@/components/ui/BaseInput.vue'

const { t } = useI18n()

const modelValue = defineModel<string>({ default: '' })

const model = computed({
  get: () => modelValue.value,
  set: v => {
    modelValue.value = v
  },
})
</script>

<style scoped>
.task-search {
  max-width: 360px;
}
</style>
