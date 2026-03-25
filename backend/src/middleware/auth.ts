import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase.js'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    isAdmin: boolean
  }
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.error('Auth getUser error:', error?.message, error?.status)
      return res.status(401).json({ error: 'Invalid token' })
    }

    const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    req.user = {
      id: user.id,
      email: user.email!,
      isAdmin: adminEmails.includes(user.email!.toLowerCase()) || user.user_metadata?.role === 'admin',
    }

    next()
  } catch (error) {
    console.error('Auth error:', error)
    res.status(401).json({ error: 'Unauthorized' })
  }
}
