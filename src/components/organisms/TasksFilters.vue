<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoriesStore } from '@/stores/categories'
import { useGroupsStore } from '@/stores/groups'
import type { Task, TaskStatus } from '@/types'

type ScopeFilter = 'all' | 'group' | 'personal'
type StatusFilter = TaskStatus | 'all' | 'overdue'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'update:filteredTasks', tasks: Task[]): void
  (e: 'update:scope', v: ScopeFilter): void
  (e: 'update:groupId', v: string): void
  (e: 'update:categoryId', v: string): void
  (e: 'update:status', v: StatusFilter): void
  (e: 'reset'): void
}>()

const categoriesStore = useCategoriesStore()
const groupsStore = useGroupsStore()

const { visibleCategories } = storeToRefs(categoriesStore)
const { groups } = storeToRefs(groupsStore)

onMounted(async () => {
  await Promise.all([categoriesStore.fetchCategories(), groupsStore.fetchMyGroups()])
})

const scope = ref<ScopeFilter>('all')
const status = ref<StatusFilter>('all')
const groupId = ref<string>('all')
const categoryId = ref<string>('all')

const categoryOptions = computed(() => visibleCategories.value ?? [])
const groupOptions = computed(() => (groups.value ?? []).map(g => ({ id: g.groupId, name: g.name })))

const getTaskGroupId = (t: Task) => ((t as any).groupId ?? (t as any).group_id ?? null) as string | null
const isGroupTask = (t: Task) => !!getTaskGroupId(t)

const toIsoDay = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const todayIso = toIsoDay(new Date())

const isOverdueTask = (t: Task) => {
  const end = (t.endDate ?? t.date) as string | undefined
  if (!end) return false
  return end < todayIso && t.status !== 'done'
}

const filteredTasks = computed(() => {
  let list = props.tasks

  if (status.value === 'overdue') {
    list = list.filter(t => isOverdueTask(t))
  } else if (status.value !== 'all') {
    list = list.filter(t => t.status === status.value)
  }

  if (scope.value === 'group') {
    list = list.filter(t => isGroupTask(t))
    if (groupId.value !== 'all') {
      list = list.filter(t => getTaskGroupId(t) === groupId.value)
    }
  }

  if (scope.value === 'personal') {
    list = list.filter(t => !isGroupTask(t))
    if (categoryId.value !== 'all') {
      list = list.filter(t => (t.categoryId ?? null) === categoryId.value)
    }
  }

  return list
})

watch(
  () => [props.tasks, scope.value, status.value, groupId.value, categoryId.value],
  () => {
    emit('update:filteredTasks', filteredTasks.value)
    emit('update:scope', scope.value)
    emit('update:status', status.value)
    emit('update:groupId', groupId.value)
    emit('update:categoryId', categoryId.value)
  },
  { immediate: true },
)

watch(
  () => scope.value,
  v => {
    if (v === 'group') categoryId.value = 'all'
    if (v === 'personal') groupId.value = 'all'
  },
)

const resetFilters = () => {
  scope.value = 'all'
  status.value = 'all'
  groupId.value = 'all'
  categoryId.value = 'all'
  emit('reset')
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 mb-4 text-sm">
    <label class="flex items-center gap-2">
      <span class="text-text-muted">Status:</span>
      <select
        v-model="status"
        class="px-2 py-1 rounded-md border border-border-soft bg-white text-text-primary"
      >
        <option value="all">All</option>
        <option value="todo">Planned</option>
        <option value="in_progress">In progress</option>
        <option value="done">Done</option>
        <option value="overdue">Overdue</option>
      </select>
    </label>

    <label class="flex items-center gap-2">
      <span class="text-text-muted">Type:</span>
      <select
        v-model="scope"
        class="px-2 py-1 rounded-md border border-border-soft bg-white text-text-primary"
      >
        <option value="all">All</option>
        <option value="group">Group</option>
        <option value="personal">Personal</option>
      </select>
    </label>

    <label v-if="scope === 'group'" class="flex items-center gap-2">
      <span class="text-text-muted">Group:</span>
      <select
        v-model="groupId"
        class="px-2 py-1 rounded-md border border-border-soft bg-white text-text-primary"
        :disabled="groupOptions.length === 0"
      >
        <option value="all">All groups</option>
        <option v-for="g in groupOptions" :key="g.id" :value="g.id">
          {{ g.name }}
        </option>
      </select>
    </label>

    <label v-if="scope === 'personal'" class="flex items-center gap-2">
      <span class="text-text-muted">Category:</span>
      <select
        v-model="categoryId"
        class="px-2 py-1 rounded-md border border-border-soft bg-white text-text-primary"
        :disabled="categoryOptions.length === 0"
      >
        <option value="all">All categories</option>
        <option v-for="c in categoryOptions" :key="c.id" :value="c.id">
          {{ c.name }}
        </option>
      </select>
    </label>

    <button
      type="button"
      class="px-3 py-1.5 rounded-md border border-border-soft bg-white text-text-primary hover:bg-app-surfaceSoft"
      @click="resetFilters"
    >
      🔄 Reset filters
    </button>
  </div>
</template>
