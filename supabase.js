import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite's env variables (which reads from .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check configuration state
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase configuration missing! Please create a .env file based on .env.example with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

// Export the initialized Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
