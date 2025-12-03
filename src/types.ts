export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskCategory = 'work' | 'study' | 'rest' | 'holiday' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;

  date: string;      // стартова дата (YYYY-MM-DD)
  endDate?: string;  // кінцева дата (якщо довгострокова задача)

  startTime?: string; // '09:30'
  endTime?: string;   // '11:00'

  category: TaskCategory;
  status: TaskStatus;
  priority?: 'low' | 'medium' | 'high';
}
