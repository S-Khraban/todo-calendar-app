<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { Task, TaskStatus } from '@/types'
import { useCategoriesStore } from '@/stores/categories'
import { useGroupsStore } from '@/stores/groups'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

type TaskPriority = 'low' | 'medium' | 'high'
type TaskScope = 'personal' | 'group'

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
      groupId: string | null
      assignedUserId?: string | null
    },
  ): void
}>()

const categoriesStore = useCategoriesStore()
const groupsStore = useGroupsStore()

const { visibleCategories } = storeToRefs(categoriesStore)
const { groups, membersByGroupId } = storeToRefs(groupsStore)

const categories = computed(() => visibleCategories.value ?? [])

const myGroups = computed(() =>
  (groups.value ?? []).map(g => ({
    id: g.groupId,
    name: g.name,
    role: g.role,
  })),
)

const form = reactive({
  scope: 'personal' as TaskScope,
  groupId: '' as string,
  assignedUserId: '' as string,

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

const selectedGroup = computed(() => myGroups.value.find(g => g.id === form.groupId) ?? null)

const canAssign = computed(() => {
  if (form.scope !== 'group') return false
  const role = selectedGroup.value?.role
  return role === 'owner' || role === 'admin'
})

const groupMembers = computed(() => {
  if (!form.groupId) return []
  return membersByGroupId.value?.[form.groupId] ?? []
})

const ensureDefaultCategory = () => {
  if (form.scope === 'group') {
    form.categoryId = ''
    return
  }

  const list = categories.value
  if (!list.length) return
  if (form.categoryId && list.some(c => c.id === form.categoryId)) return
  form.categoryId = list[0]!.id
}

const normalizeScope = async () => {
  if (form.scope === 'personal') {
    form.groupId = ''
    form.assignedUserId = ''
    ensureDefaultCategory()
    return
  }

  if (!myGroups.value.length) {
    form.scope = 'personal'
    form.groupId = ''
    form.assignedUserId = ''
    ensureDefaultCategory()
    return
  }

  if (!form.groupId) {
    form.groupId = myGroups.value[0]!.id
  }

  if (form.groupId) {
    await groupsStore.fetchGroupMembers(form.groupId, true)
  }

  if (!canAssign.value) {
    form.assignedUserId = ''
  }

  form.categoryId = ''
}

watch(
  () => props.modelValue,
  async open => {
    if (!open) return
    await Promise.all([categoriesStore.fetchCategories(), groupsStore.fetchMyGroups()])
    ensureDefaultCategory()
    await normalizeScope()
  },
  { immediate: true },
)

watch(
  () => form.scope,
  async () => {
    if (!props.modelValue) return
    const prevAssigned = form.assignedUserId
    await normalizeScope()
    if (form.scope === 'group' && canAssign.value) form.assignedUserId = prevAssigned
  },
)

watch(
  () => form.groupId,
  async (gid, prev) => {
    if (!props.modelValue || form.scope !== 'group' || !gid) return
    if (prev && gid !== prev) form.assignedUserId = ''
    await groupsStore.fetchGroupMembers(gid, true)
    if (!canAssign.value) form.assignedUserId = ''
  },
)

watch(
  () => props.task,
  async task => {
    if (!task) {
      form.scope = 'personal'
      form.groupId = ''
      form.assignedUserId = ''
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

    const groupId = (task as any).groupId ?? (task as any).group_id ?? null
    const assignedUserId = (task as any).assignedUserId ?? (task as any).assigned_user_id ?? null

    form.scope = groupId ? 'group' : 'personal'
    form.groupId = groupId ?? ''
    form.assignedUserId = assignedUserId ?? ''
    form.title = task.title
    form.description = task.description ?? ''
    form.date = task.date
    form.endDate = task.endDate ?? task.date
    form.startTime = task.startTime ?? ''
    form.endTime = task.endTime ?? ''
    form.categoryId = groupId ? '' : (task.categoryId ?? '')
    form.status = task.status
    form.priority = (task.priority ?? 'low') as TaskPriority

    ensureDefaultCategory()

    if (form.scope === 'group') {
      await normalizeScope()
    }
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

const close = () => emit('update:modelValue', false)
const setOpen = (v: boolean) => emit('update:modelValue', v)

const onSubmit = () => {
  if (!form.title.trim()) return

  const isGroup = form.scope === 'group'
  const groupId = isGroup ? (form.groupId || null) : null

  emit('save', {
    id: props.task?.id,
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    date: form.date,
    endDate: form.endDate !== form.date ? form.endDate : undefined,
    startTime: form.startTime || undefined,
    endTime: form.endTime || undefined,
    categoryId: isGroup ? null : (form.categoryId || null),
    status: form.status,
    priority: form.priority,
    groupId,
    assignedUserId: isGroup && canAssign.value ? (form.assignedUserId || null) : null,
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
        <div class="tm-field">
          <div class="tm-label">Тип задачі</div>
          <select v-model="form.scope" class="tm-native" :disabled="isEdit">
            <option value="personal">Моя</option>
            <option value="group" :disabled="!myGroups.length">Групова</option>
          </select>
        </div>

        <div v-if="form.scope === 'group'" class="tm-row">
          <div class="tm-field">
            <div class="tm-label">Група</div>
            <select v-model="form.groupId" class="tm-native" :disabled="isEdit || !myGroups.length">
              <option v-for="g in myGroups" :key="g.id" :value="g.id">
                {{ g.name }}
              </option>
            </select>
          </div>

          <div class="tm-field">
            <div class="tm-label">Відповідальний</div>
            <select v-model="form.assignedUserId" class="tm-native" :disabled="!canAssign">
              <option value="">Не призначено</option>
              <option v-for="m in groupMembers" :key="m.userId" :value="m.userId">
                {{ m.name ?? m.email ?? m.userId }}
              </option>
            </select>
          </div>
        </div>

        <BaseInput v-model="form.title" label="Назва" placeholder="Що потрібно зробити?" required />

        <div class="tm-field">
          <div class="tm-label">Опис (необовʼязково)</div>
          <textarea v-model="form.description" class="tm-textarea" rows="3" placeholder="Деталі задачі" />
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

        <div v-if="form.scope !== 'group'" class="tm-row">
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

        <div v-else class="tm-row">
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
