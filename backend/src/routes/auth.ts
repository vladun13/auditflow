import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// These routes are handled by Supabase on the frontend
// Backend auth routes are mainly for verification

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
