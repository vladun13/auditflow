import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Admin client — uses service_role key, bypasses RLS. Never expose to frontend.
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Auth client — uses anon key, subject to RLS. Used for password verification.
export const authClient = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
