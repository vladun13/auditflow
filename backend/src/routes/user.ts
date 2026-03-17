import express from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'

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
      return res.status(500).json({ error: error.message })
    }

    res.json({ credits: data.credits })
  } catch (error) {
    console.error('Error fetching credits:', error)
    res.status(500).json({ error: 'Failed to fetch credits' })
  }
})

export default router
