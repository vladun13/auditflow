// Centralized type definitions

export interface Audit {
  id: string
  website_url: string
  status: 'pending' | 'scanning' | 'completed' | 'failed'
  wcag_score: number | null
  wcag_level: string | null
  total_violations: number
  critical_count: number
  serious_count: number
  moderate_count: number
  minor_count: number
  pages_scanned: number
  created_at: string
  completed_at: string | null
  violations?: Violation[]
}

export interface Violation {
  id: string
  page_url: string
  violation_type: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  wcag_criterion: string
  description: string
  ai_explanation: string | null
  ai_fix_steps: string | null
  affected_elements: number
  estimated_fix_hours: number | null
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface UserCredits {
  credits: number
  plan: string | null
  max_pages_per_scan: number | null
}

export interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  plan: string
  credits: number
  created_at: string
}

export interface CreditHistory {
  id: string
  amount: number
  type: 'purchase' | 'usage' | 'refund' | 'bonus'
  description: string
  balance_after: number
  created_at: string
}

export interface Subscription {
  id: string
  plan: string
  status: 'active' | 'cancelled' | 'expired' | 'past_due'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

export type ViewType = 'dashboard' | 'scan' | 'reports'
