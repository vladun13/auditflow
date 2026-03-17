import express from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'
import { ScanService } from '../services/scanService.js'
import { AIService } from '../services/aiService.js'
import { PDFService } from '../services/pdfService.js'

const router = express.Router()
const scanService = new ScanService()
const aiService = new AIService()
const pdfService = new PDFService()

// Create new audit
router.post('/create', authenticate, async (req: AuthRequest, res) => {
  try {
    const { website_url, crawl_depth } = req.body

    if (!website_url || !crawl_depth) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate URL
    try {
      new URL(website_url)
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' })
    }

    // Check user credits
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', req.user!.id)
      .single()

    if (userError || !user) {
      return res.status(500).json({ error: 'Failed to check credits' })
    }

    if (user.credits < 1) {
      return res.status(402).json({ error: 'Insufficient credits' })
    }

    // Create audit
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        user_id: req.user!.id,
        website_url,
        status: 'pending'
      })
      .select()
      .single()

    if (auditError) {
      return res.status(500).json({ error: auditError.message })
    }

    res.status(201).json({
      audit_id: audit.id,
      status: 'pending',
      message: 'Audit created successfully'
    })
  } catch (error) {
    console.error('Error creating audit:', error)
    res.status(500).json({ error: 'Failed to create audit' })
  }
})

// Start scan
router.post('/:id/scan', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // Verify audit belongs to user
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single()

    if (auditError || !audit) {
      return res.status(404).json({ error: 'Audit not found' })
    }

    if (audit.status !== 'pending') {
      return res.status(400).json({ error: 'Audit already started or completed' })
    }

    // Deduct credit
    const { data: userData } = await supabase
      .from('users')
      .select('credits')
      .eq('id', req.user!.id)
      .single()

    if (userData) {
      await supabase
        .from('users')
        .update({ credits: userData.credits - 1 })
        .eq('id', req.user!.id)
    }

    // Start scan in background (don't await)
    setImmediate(async () => {
      try {
        await scanService.scanWebsite(id, audit.website_url, 3) // Default crawl depth
        await aiService.generateRecommendations(id)
      } catch (error) {
        console.error('Background scan error:', error)
      }
    })

    res.json({
      audit_id: id,
      status: 'scanning',
      message: 'Scan started',
      estimated_time_seconds: 180
    })
  } catch (error) {
    console.error('Error starting scan:', error)
    res.status(500).json({ error: 'Failed to start scan' })
  }
})

// Get audit details
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // Fetch audit
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single()

    if (auditError || !audit) {
      return res.status(404).json({ error: 'Audit not found' })
    }

    // Fetch violations if completed
    if (audit.status === 'completed') {
      const { data: violations, error: violationsError } = await supabase
        .from('violations')
        .select('*')
        .eq('audit_id', id)
        .order('impact', { ascending: false })

      if (!violationsError) {
        audit.violations = violations
      }
    }

    res.json(audit)
  } catch (error) {
    console.error('Error fetching audit:', error)
    res.status(500).json({ error: 'Failed to fetch audit' })
  }
})

// List user audits
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data: audits, error } = await supabase
      .from('audits')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(audits)
  } catch (error) {
    console.error('Error fetching audits:', error)
    res.status(500).json({ error: 'Failed to fetch audits' })
  }
})

// Delete audit
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('audits')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ message: 'Audit deleted successfully' })
  } catch (error) {
    console.error('Error deleting audit:', error)
    res.status(500).json({ error: 'Failed to delete audit' })
  }
})

// Download PDF report
router.get('/:id/report/pdf', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // Verify audit belongs to user
    const { data: audit, error } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single()

    if (error || !audit) {
      return res.status(404).json({ error: 'Audit not found' })
    }

    if (audit.status !== 'completed') {
      return res.status(400).json({ error: 'Audit not completed yet' })
    }

    // Generate PDF
    const pdfBuffer = await pdfService.generateAuditReport(id)

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="auditflow-report-${id}.pdf"`)
    res.setHeader('Content-Length', pdfBuffer.length)

    // Send PDF
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error generating PDF:', error)
    res.status(500).json({ error: 'Failed to generate PDF' })
  }
})

export default router
