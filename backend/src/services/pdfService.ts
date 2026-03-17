import PDFDocument from 'pdfkit'
import { supabase } from '../config/supabase.js'

interface Audit {
  id: string
  website_url: string
  status: string
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

interface Violation {
  page_url: string
  violation_type: string
  impact: string
  wcag_criterion: string
  description: string
  ai_explanation: string | null
  ai_fix_steps: string | null
  affected_elements: number
}

export class PDFService {
  async generateAuditReport(auditId: string): Promise<Buffer> {
    // Fetch audit data
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('*')
      .eq('id', auditId)
      .single()

    if (auditError || !audit) {
      throw new Error('Audit not found')
    }

    // Fetch violations
    const { data: violations, error: violationsError } = await supabase
      .from('violations')
      .select('*')
      .eq('audit_id', auditId)
      .order('impact', { ascending: false })

    if (violationsError) {
      throw new Error('Failed to fetch violations')
    }

    return this.createPDF(audit as Audit, violations as Violation[] || [])
  }

  private createPDF(audit: Audit, violations: Violation[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Header
      doc.fontSize(24).fillColor('#2563eb').text('AuditFlow', { align: 'left' })
      doc.moveDown(0.5)
      doc.fontSize(20).fillColor('#000').text('Accessibility Audit Report')
      doc.moveDown(0.3)
      doc.fontSize(10).fillColor('#666').text(`Generated on ${new Date().toLocaleDateString()}`)
      doc.moveDown(1.5)

      // Website Info
      doc.fontSize(14).fillColor('#000').text('Website:', { continued: true })
      doc.fontSize(12).fillColor('#2563eb').text(` ${audit.website_url}`)
      doc.moveDown(0.3)
      doc.fontSize(12).fillColor('#666')
        .text(`Scan Date: ${new Date(audit.created_at).toLocaleDateString()}`)
      doc.moveDown(1.5)

      // Summary Section
      doc.fontSize(16).fillColor('#000').text('Summary')
      doc.moveDown(0.5)

      // Summary Box
      const summaryY = doc.y
      doc.roundedRect(50, summaryY, 495, 100, 5).fillAndStroke('#f3f4f6', '#e5e7eb')

      doc.fillColor('#000')
      doc.fontSize(10).text(`WCAG Score: ${audit.wcag_score?.toFixed(1) || 'N/A'}`, 70, summaryY + 20)
      doc.text(`Level: ${audit.wcag_level || 'N/A'}`, 70, summaryY + 40)
      doc.text(`Pages Scanned: ${audit.pages_scanned}`, 270, summaryY + 20)
      doc.text(`Total Violations: ${audit.total_violations}`, 270, summaryY + 40)

      doc.moveDown(6)

      // Violation Breakdown
      doc.fontSize(14).fillColor('#000').text('Violation Breakdown')
      doc.moveDown(0.5)

      const breakdownY = doc.y
      const barWidth = 100

      // Critical
      this.drawViolationBar(doc, 70, breakdownY, 'Critical', audit.critical_count, '#dc2626')
      // Serious
      this.drawViolationBar(doc, 70, breakdownY + 25, 'Serious', audit.serious_count, '#ea580c')
      // Moderate
      this.drawViolationBar(doc, 70, breakdownY + 50, 'Moderate', audit.moderate_count, '#ca8a04')
      // Minor
      this.drawViolationBar(doc, 70, breakdownY + 75, 'Minor', audit.minor_count, '#2563eb')

      doc.moveDown(8)

      // Violations Details
      if (violations.length > 0) {
        doc.addPage()
        doc.fontSize(16).fillColor('#000').text('Detailed Violations')
        doc.moveDown(1)

        violations.forEach((violation, index) => {
          // Check if we need a new page
          if (doc.y > 650) {
            doc.addPage()
          }

          // Violation number and type
          doc.fontSize(14).fillColor('#000').font('Helvetica-Bold')
            .text(`${index + 1}. ${this.formatViolationType(violation.violation_type)}`)
          doc.font('Helvetica')
          doc.moveDown(0.3)

          // Impact badge and WCAG
          const impactColor = this.getImpactColor(violation.impact)
          doc.fontSize(10).fillColor(impactColor).font('Helvetica-Bold')
            .text(`⚠ ${violation.impact.toUpperCase()} PRIORITY`, { continued: true })
          doc.fillColor('#666').font('Helvetica')
            .text(`  |  WCAG ${violation.wcag_criterion}`)
          doc.moveDown(0.5)

          // WHAT'S THE PROBLEM - More prominent section
          doc.fontSize(11).fillColor('#dc2626').font('Helvetica-Bold')
            .text('❌ WHAT\'S THE PROBLEM:')
          doc.font('Helvetica')
          doc.moveDown(0.3)

          doc.fontSize(10)
          const problemY = doc.y
          const problemHeight = Math.ceil(doc.heightOfString(violation.description, { width: 475 })) + 20

          doc.roundedRect(50, problemY, 495, problemHeight, 3).fillAndStroke('#fef2f2', '#fecaca')
          doc.fillColor('#000')
            .text(violation.description, 60, problemY + 10, { width: 475 })

          doc.y = problemY + problemHeight + 5
          doc.moveDown(0.5)

          // WHY THIS MATTERS
          if (violation.ai_explanation) {
            doc.fontSize(11).fillColor('#2563eb').font('Helvetica-Bold')
              .text('💡 WHY THIS MATTERS:')
            doc.font('Helvetica')
            doc.moveDown(0.2)

            const whyY = doc.y
            const whyHeight = doc.heightOfString(violation.ai_explanation, { width: 475 }) + 20
            doc.roundedRect(50, whyY, 495, whyHeight, 3).fillAndStroke('#eff6ff', '#bfdbfe')
            doc.fontSize(9).fillColor('#1e3a8a')
              .text(violation.ai_explanation, 60, whyY + 10, { width: 475 })

            doc.y = whyY + whyHeight + 5
            doc.moveDown(0.5)
          }

          // HOW TO FIX IT - More prominent with step-by-step
          if (violation.ai_fix_steps) {
            doc.fontSize(11).fillColor('#059669').font('Helvetica-Bold')
              .text('✅ HOW TO FIX IT:')
            doc.font('Helvetica')
            doc.moveDown(0.2)

            const fixY = doc.y

            // Parse steps if they contain numbered items or bullet points
            const fixSteps = this.parseFixSteps(violation.ai_fix_steps)
            let fixContent = ''

            if (fixSteps.length > 1) {
              fixSteps.forEach((step, i) => {
                fixContent += `${i + 1}. ${step}\n\n`
              })
            } else {
              fixContent = violation.ai_fix_steps
            }

            const fixHeight = doc.heightOfString(fixContent, { width: 475 }) + 20
            doc.roundedRect(50, fixY, 495, fixHeight, 3).fillAndStroke('#f0fdf4', '#86efac')
            doc.fontSize(9).fillColor('#064e3b')
              .text(fixContent, 60, fixY + 10, { width: 475 })

            doc.y = fixY + fixHeight + 5
            doc.moveDown(0.5)
          }

          // IMPACT INFO BOX
          const infoY = doc.y
          doc.roundedRect(50, infoY, 495, 35, 3).fillAndStroke('#f9fafb', '#d1d5db')

          doc.fontSize(8).fillColor('#000').font('Helvetica-Bold')
            .text('📍 Location:', 60, infoY + 8)
          doc.font('Helvetica').fillColor('#374151')
            .text(this.truncateUrl(violation.page_url, 60), 120, infoY + 8)

          doc.fontSize(8).fillColor('#000').font('Helvetica-Bold')
            .text('🔢 Affected Elements:', 60, infoY + 22)
          doc.font('Helvetica').fillColor('#374151')
            .text(`${violation.affected_elements} instance${violation.affected_elements !== 1 ? 's' : ''}`, 165, infoY + 22)

          doc.y = infoY + 40
          doc.moveDown(0.5)

          // Separator
          doc.strokeColor('#e5e7eb').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke()
          doc.moveDown(1.5)
        })
      } else {
        doc.fontSize(12).fillColor('#059669')
          .text('No violations found! Your website meets WCAG standards.')
      }

      doc.end()
    })
  }

  private drawViolationBar(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    label: string,
    count: number,
    color: string
  ) {
    const barWidth = 60
    const maxBarWidth = 200

    // Label
    doc.fontSize(10).fillColor('#000').text(`${label}:`, x, y)

    // Bar background
    doc.roundedRect(x + 80, y - 2, maxBarWidth, 14, 2).fillAndStroke('#f3f4f6', '#e5e7eb')

    // Bar fill (proportional to count, max 100)
    if (count > 0) {
      const fillWidth = Math.min((count / 20) * maxBarWidth, maxBarWidth)
      doc.roundedRect(x + 80, y - 2, fillWidth, 14, 2).fill(color)
    }

    // Count
    doc.fontSize(10).fillColor('#000').text(count.toString(), x + 290, y)
  }

  private getImpactColor(impact: string): string {
    switch (impact.toLowerCase()) {
      case 'critical':
        return '#dc2626'
      case 'serious':
        return '#ea580c'
      case 'moderate':
        return '#ca8a04'
      case 'minor':
        return '#2563eb'
      default:
        return '#6b7280'
    }
  }

  private formatViolationType(type: string): string {
    // Convert kebab-case or snake_case to Title Case
    return type
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private parseFixSteps(fixText: string): string[] {
    // Try to split by numbered items (1., 2., etc.) or bullet points
    const steps = fixText.split(/\n+(?=\d+\.|\-|\*|•)/).filter(s => s.trim())

    if (steps.length > 1) {
      return steps.map(step => step.replace(/^\d+\.\s*|\-\s*|\*\s*|•\s*/, '').trim())
    }

    // If no clear steps, try splitting by sentences for long text
    if (fixText.length > 200) {
      return fixText.split(/\.\s+/).filter(s => s.trim()).map(s => s + '.')
    }

    return [fixText]
  }

  private truncateUrl(url: string, maxLength: number): string {
    if (url.length <= maxLength) return url

    try {
      const urlObj = new URL(url)
      const path = urlObj.pathname + urlObj.search
      if (path.length > maxLength - 10) {
        return urlObj.hostname + path.substring(0, maxLength - urlObj.hostname.length - 10) + '...'
      }
      return urlObj.hostname + path
    } catch {
      return url.substring(0, maxLength) + '...'
    }
  }
}
