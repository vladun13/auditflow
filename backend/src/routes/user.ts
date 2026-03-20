import express from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { supabase, authClient } from '../config/supabase.js'

const router = express.Router()

// Get user credits
router.get('/credits', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('credits')
      .eq('id', req.user!.id)
      .single()

    if (error) {
      console.error('Error fetching credits:', error)
      return res.status(500).json({ error: 'Failed to fetch credits' })
    }

    if (req.user!.isAdmin) {
      return res.json({ credits: null, isAdmin: true })
    }

    res.json({ credits: data.credits, isAdmin: false })
  } catch (error) {
    console.error('Error fetching credits:', error)
    res.status(500).json({ error: 'Failed to fetch credits' })
  }
})

// Get user profile
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('email, credits, created_at')
      .eq('id', req.user!.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return res.status(500).json({ error: 'Failed to fetch profile' })
    }

    // full_name is stored in Supabase auth user_metadata (no schema migration needed)
    const { data: authUser } = await supabase.auth.admin.getUserById(req.user!.id)
    const full_name = authUser?.user?.user_metadata?.full_name ?? ''

    res.json({
      email: userData.email,
      full_name,
      credits: userData.credits,
      created_at: userData.created_at,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update user profile
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { full_name } = req.body

    if (typeof full_name !== 'string') {
      return res.status(400).json({ error: 'Invalid profile data' })
    }

    const trimmed = full_name.trim().slice(0, 120) // reasonable max length

    const { error } = await supabase.auth.admin.updateUserById(req.user!.id, {
      user_metadata: { full_name: trimmed },
    })

    if (error) {
      console.error('Error updating profile:', error)
      return res.status(500).json({ error: 'Failed to update profile' })
    }

    res.json({ full_name: trimmed })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Change password
router.put('/password', authenticate, async (req: AuthRequest, res) => {
  try {
    const { current_password, new_password } = req.body

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (new_password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    // Verify current password by attempting sign-in with user's email
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', req.user!.id)
      .single()

    if (!userData?.email) {
      return res.status(500).json({ error: 'Failed to verify credentials' })
    }

    const { error: signInError } = await authClient.auth.signInWithPassword({
      email: userData.email,
      password: current_password,
    })

    if (signInError) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    // Update password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(req.user!.id, {
      password: new_password,
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      return res.status(500).json({ error: 'Failed to update password' })
    }

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
    res.status(500).json({ error: 'Failed to update password' })
  }
})

// Get credit history — synthesized from payments (credits added) and audits (credits spent)
router.get('/credit-history', authenticate, async (req: AuthRequest, res) => {
  try {
    const [paymentsResult, auditsResult] = await Promise.all([
      supabase
        .from('payments')
        .select('id, credits_added, amount, created_at, status')
        .eq('user_id', req.user!.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false }),

      supabase
        .from('audits')
        .select('id, website_url, status, created_at')
        .eq('user_id', req.user!.id)
        .in('status', ['completed', 'failed'])
        .order('created_at', { ascending: false }),
    ])

    if (paymentsResult.error) {
      console.error('Error fetching payments for credit history:', paymentsResult.error)
      return res.status(500).json({ error: 'Failed to fetch credit history' })
    }

    if (auditsResult.error) {
      console.error('Error fetching audits for credit history:', auditsResult.error)
      return res.status(500).json({ error: 'Failed to fetch credit history' })
    }

    // Map payments to credit history entries (credits added)
    const purchaseEntries = (paymentsResult.data ?? []).map((p) => ({
      id: `payment-${p.id}`,
      type: 'purchase' as const,
      amount: p.credits_added,
      description: `Purchased ${p.credits_added} credit${p.credits_added !== 1 ? 's' : ''}`,
      created_at: p.created_at,
    }))

    // Map completed audits to credit history entries (credits spent)
    const scanEntries = (auditsResult.data ?? [])
      .filter((a) => a.status === 'completed')
      .map((a) => ({
        id: `audit-${a.id}`,
        type: 'scan' as const,
        amount: -1,
        description: `Scan: ${a.website_url}`,
        created_at: a.created_at,
      }))

    // Merge and sort by date descending
    const history = [...purchaseEntries, ...scanEntries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    res.json(history)
  } catch (error) {
    console.error('Error fetching credit history:', error)
    res.status(500).json({ error: 'Failed to fetch credit history' })
  }
})

export default router
