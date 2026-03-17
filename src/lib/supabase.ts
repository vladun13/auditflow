import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Database = {
  users: {
    id: string
    email: string
    credits: number
    created_at: string
  }
  audits: {
    id: string
    user_id: string
    website_url: string
    status: 'pending' | 'scanning' | 'completed' | 'failed'
    pages_scanned: number
    total_violations: number
    critical_count: number
    serious_count: number
    moderate_count: number
    minor_count: number
    wcag_score: number | null
    wcag_level: string | null
    created_at: string
    completed_at: string | null
  }
  violations: {
    id: string
    audit_id: string
    page_url: string
    violation_type: string
    impact: 'critical' | 'serious' | 'moderate' | 'minor'
    wcag_criterion: string
    description: string
    ai_explanation: string | null
    ai_fix_steps: string | null
    affected_elements: number
    estimated_fix_hours: number | null
    created_at: string
  }
  payments: {
    id: string
    user_id: string
    stripe_session_id: string
    amount: number
    credits_added: number
    status: 'pending' | 'completed' | 'failed'
    created_at: string
  }
}
