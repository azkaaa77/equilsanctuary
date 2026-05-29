import { createClient } from '@supabase/supabase-js';

/**
 * 🔒 EQUILIBRIUM CORE ENGINE
 * Project ID: hefxirhoujncojbgeuwm
 * Status: ACTIVE
 */
export const supabaseUrl = 'https://hefxirhoujncojbgeuwm.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZnhpcmhvdWpuY29qYmdldXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTI2NzYsImV4cCI6MjA5NDU4ODY3Nn0.0lIAoxx_PDK_EQIFCU0jwjZhpdbpc7AJdYZnjHbyHzw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
