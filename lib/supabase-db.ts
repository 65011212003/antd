import { supabase } from './supabase';

export interface Todo {
  id: number;
  user_id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  due_date?: string;
  favorite: boolean;
  tags?: string[];
  subtasks?: { id: number; title: string; completed: boolean }[];
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  user_id: string;
  action: string;
  todo_title: string;
  type: 'add' | 'edit' | 'complete' | 'delete';
  created_at: string;
}

// Fetch all todos for the current user
export const fetchTodos = async () => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Todo[];
};

// Create a new todo
export const createTodo = async (todo: Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('todos')
    .insert([{ ...todo, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data as Todo;
};

// Update a todo
export const updateTodo = async (id: number, updates: Partial<Todo>) => {
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Todo;
};

// Delete a todo
export const deleteTodo = async (id: number) => {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Fetch all activities for the current user
export const fetchActivities = async () => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data as Activity[];
};

// Create a new activity
export const createActivity = async (activity: Omit<Activity, 'id' | 'user_id' | 'created_at'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('activities')
    .insert([{ ...activity, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data as Activity;
};

// Initialize database (create tables if they don't exist) - for development only
export const initializeDatabase = async () => {
  try {
    // Check if tables exist by trying to query them
    const { error: todosError } = await supabase.from('todos').select('id').limit(1);
    const { error: activitiesError } = await supabase.from('activities').select('id').limit(1);
    const { error: profilesError } = await supabase.from('profiles').select('id').limit(1);

    if (todosError || activitiesError || profilesError) {
      console.warn('Some tables may not exist. Please run the SQL setup script in Supabase.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database initialization check failed:', error);
    return false;
  }
};
