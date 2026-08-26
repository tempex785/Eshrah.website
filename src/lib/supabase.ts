import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PayCourse {
  id: string;
  title: string;
  description: string;
  price: string;
  image_url: string;
  semester: string;
  features: string[];
  created_at: string;
}

export interface FreeCourse {
  id: string;
  title: string;
  description: string;
  image_url: string;
  semester: string;
  features: string[];
  created_at: string;
}
