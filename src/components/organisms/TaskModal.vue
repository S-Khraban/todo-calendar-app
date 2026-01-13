<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { Task, TaskStatus } from '@/types'
import { useCategoriesStore } from '@/stores/categories'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

type TaskPriority = 'low' | 'medium' | 'high'

const props = defineProps<{
  modelValue: boolean
  task: Task | null
  defaultDate: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (
    e: 'save',
    payload: {
      id?: string
      title: string
      description?: string
      date: string
      endDate?: string
      startTime?: string
      endTime?: string
      categoryId: string | null
      status: TaskStatus
      priority?: TaskPriority
    },
  ): void
}>()

const categoriesStore = useCategoriesStore()
const { visibleCategories } = storeToRefs(categoriesStore)

const categories = computed(() => visibleCategories.value ?? [])

const form = reactive({
  title: '',
  description: '',
  date: props.defaultDate,
  endDate: props.defaultDate,
  startTime: '',
  endTime: '',
  categoryId: '' as string,
  status: 'todo' as TaskStatus,
  priority: 'low' as TaskPriority,
})

const isEdit = computed(() => !!props.task)

const ensureDefaultCategory = () => {
  const list = categories.value ?? []
  if (list.length === 0) return

  const exists = form.categoryId && list.some(c => c.id === form.categoryId)
  if (exists) return

  form.categoryId = list[0]!.id
}

watch(
  () => props.modelValue,
  async isOpen => {
    if (!isOpen) return
    await categoriesStore.fetchCategories()
    ensureDefaultCategory()
  },
  { immediate: true },
)

watch(
  () => props.task,
  task => {
    if (!task) {
      form.title = ''
      form.description = ''
      form.date = props.defaultDate
      form.endDate = props.defaultDate
      form.startTime = ''
      form.endTime = ''
      form.categoryId = ''
      form.status = 'todo'
      form.priority = 'low'
      ensureDefaultCategory()
      return
    }

    form.title = task.title
    form.description = task.description ?? ''
    form.date = task.date
    form.endDate = task.endDate ?? task.date
    form.startTime = task.startTime ?? ''
    form.endTime = task.endTime ?? ''
    form.categoryId = task.categoryId ?? ''
    form.status = task.status
    form.priority = (task.priority ?? 'low') as TaskPriority
    ensureDefaultCategory()
  },
  { immediate: true },
)

watch(
  () => props.defaultDate,
  date => {
    if (!props.task) {
      form.date = date
      form.endDate = date
    }
  },
)

const close = () => {
  emit('update:modelValue', false)
}

const setOpen = (v: boolean) => {
  emit('update:modelValue', v)
}

const onSubmit = () => {
  if (!form.title.trim()) return

  emit('save', {
    id: props.task?.id,
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    date: form.date,
    endDate: form.endDate && form.endDate !== form.date ? form.endDate : undefined,
    startTime: form.startTime || undefined,
    endTime: form.endTime || undefined,
    categoryId: form.categoryId || null,
    status: form.status,
    priority: form.priority,
  })

  close()
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="isEdit ? 'Редагувати задачу' : 'Нова задача'"
    max-width="md"
    @update:model-value="setOpen"
    @close="close"
  >
    <div class="tm-scroll">
      <form class="tm-form" @submit.prevent="onSubmit">
        <BaseInput v-model="form.title" label="Назва" placeholder="Що потрібно зробити?" required />

        <div class="tm-field">
          <div class="tm-label">Опис (необовʼязково)</div>
          <textarea
            v-model="form.description"
            class="tm-textarea"
            rows="3"
            placeholder="Деталі задачі"
          />
        </div>

        <div class="tm-row">
          <div class="tm-field">
            <div class="tm-label">Початкова дата</div>
            <input v-model="form.date" type="date" class="tm-native" />
          </div>

          <div class="tm-field">
            <div class="tm-label">Кінцева дата</div>
            <input v-model="form.endDate" type="date" class="tm-native" />
          </div>
        </div>

        <div class="tm-row">
          <div class="tm-field">
            <div class="tm-label">Початок</div>
            <input v-model="form.startTime" type="time" class="tm-native" />
          </div>

          <div class="tm-field">
            <div class="tm-label">Кінець</div>
            <input v-model="form.endTime" type="time" class="tm-native" />
          </div>
        </div>

        <div class="tm-row">
          <div class="tm-field">
            <div class="tm-label">Категорія</div>
            <select v-model="form.categoryId" class="tm-native" :disabled="!categories.length">
              <option value="" disabled>Оберіть категорію</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="tm-field">
            <div class="tm-label">Статус</div>
            <select v-model="form.status" class="tm-native">
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <div class="tm-field">
          <div class="tm-label">Пріоритет</div>
          <select v-model="form.priority" class="tm-native">
            <option value="low">Низький</option>
            <option value="medium">Середній</option>
            <option value="high">Високий ★</option>
          </select>
        </div>

        <div class="tm-footer">
          <BaseButton variant="ghost" type="button" @click="close">Скасувати</BaseButton>
          <BaseButton variant="solid" type="submit">
            {{ isEdit ? 'Зберегти' : 'Створити' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<style src="./TaskModal.css" scoped />
