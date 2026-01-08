import { defineStore } from 'pinia';
import type { Task } from '@/types';
import { supabase } from '@/services/supabaseClient';

type DbTaskRow = {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  end_date: string | null;
  description: string | null;
};

const extractLegacyEndDate = (description?: string | null) => {
  if (!description) return null;
  const m = description.match(/endDate:(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
};

const stripLegacyEndDate = (description?: string | null) => {
  if (!description) return null;
  const next = description.replace(/endDate:\d{4}-\d{2}-\d{2}/g, '').trim();
  return next.length ? next : null;
};

const toAppTask = (row: DbTaskRow): Task => {
  return {
    id: row.id,
    status: (row.status as Task['status']) ?? 'todo',
    title: row.title as any,
    date: (row.due_date ?? '') as any,
    endDate: (row.end_date ?? extractLegacyEndDate(row.description) ?? null) as any,
  } as Task;
};

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
    isLoading: false,
    error: '' as string,
  }),

  getters: {
    tasksByDate: (state) => (date: string) =>
      state.tasks.filter((t) => {
        const start = (t as any).date;
        const end = (t as any).endDate ?? (t as any).date;
        return start <= date && date <= end;
      }),
  },

  actions: {
    reset() {
      this.tasks = [];
      this.isLoading = false;
      this.error = '';
    },

    async loadFromSupabase() {
      this.error = '';
      this.isLoading = true;

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id,title,status,due_date,end_date,description')
          .order('created_at', { ascending: false });

        if (error) throw error;

        this.tasks = ((data ?? []) as DbTaskRow[]).map(toAppTask);
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load tasks';
        this.tasks = [];
      } finally {
        this.isLoading = false;
      }
    },

    async load() {
      await this.loadFromSupabase();
    },

    async addTask(payload: Omit<Task, 'id' | 'status'>) {

      console.log('[tasksStore] addTask NEW VERSION', payload)
      this.error = '';

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;

      const owner_id = userData.user?.id;
      if (!owner_id) throw new Error('Not authenticated');

      const title = ((payload as any).title ?? (payload as any).name ?? 'Task') as string;
      const due_date = ((payload as any).date ?? null) as string | null;

      const rawDescription = ((payload as any).description ?? null) as string | null;

      const end_date =
        (((payload as any).endDate ?? null) as string | null) ??
        extractLegacyEndDate(rawDescription);

      const description = stripLegacyEndDate(rawDescription);

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          owner_id,
          title,
          status: 'todo',
          due_date,
          end_date,
          description,
        })
        .select('id,title,status,due_date,end_date,description')
        .single();

      if (error) throw error;

      this.tasks.unshift(toAppTask(data as DbTaskRow));
    },

    async updateTask(updated: Task) {
      this.error = '';

      const title = ((updated as any).title ?? (updated as any).name ?? 'Task') as string;
      const due_date = (((updated as any).date ?? null) as string | null) ?? null;

      const rawDescription = ((updated as any).description ?? null) as string | null;

      const end_date =
        (((updated as any).endDate ?? null) as string | null) ??
        extractLegacyEndDate(rawDescription);

      const description = stripLegacyEndDate(rawDescription);

      const { data, error } = await supabase
        .from('tasks')
        .update({
          title,
          status: (updated as any).status,
          due_date,
          end_date,
          description,
        })
        .eq('id', updated.id)
        .select('id,title,status,due_date,end_date,description')
        .single();

      if (error) throw error;

      const next = toAppTask(data as DbTaskRow);
      this.tasks = this.tasks.map((t) => (t.id === updated.id ? next : t));
    },

    async toggleStatus(id: string) {
      this.error = '';

      const current = this.tasks.find((t) => t.id === id);
      if (!current) return;

      const nextStatus = (current as any).status === 'done' ? 'todo' : 'done';

      const { data, error } = await supabase
        .from('tasks')
        .update({ status: nextStatus })
        .eq('id', id)
        .select('id,title,status,due_date,end_date,description')
        .single();

      if (error) throw error;

      const next = toAppTask(data as DbTaskRow);
      this.tasks = this.tasks.map((t) => (t.id === id ? next : t));
    },

    async removeTask(id: string) {
      this.error = '';

      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;

      this.tasks = this.tasks.filter((t) => t.id !== id);
    },

    save() {},
  },
});
