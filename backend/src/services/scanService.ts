import puppeteer from 'puppeteer'
import { AxePuppeteer } from '@axe-core/puppeteer'
import { supabase } from '../config/supabase.js'

interface ScanResult {
  pageUrl: string
  violations: any[]
}

export class ScanService {
  async scanWebsite(auditId: string, websiteUrl: string, crawlDepth: number) {
    let browser

    try {
      // Update audit status to scanning
      await supabase
        .from('audits')
        .update({ status: 'scanning' })
        .eq('id', auditId)

      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })

      const pagesToScan = await this.crawlWebsite(browser, websiteUrl, crawlDepth)
      const scanResults: ScanResult[] = []

      for (const pageUrl of pagesToScan) {
        try {
          const violations = await this.scanPage(browser, pageUrl)
          scanResults.push({ pageUrl, violations })
        } catch (error) {
          console.error(`Error scanning ${pageUrl}:`, error)
        }
      }

      // Process and save results
      await this.saveResults(auditId, scanResults)

      // Update audit status to completed
      await supabase
        .from('audits')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          pages_scanned: scanResults.length
        })
        .eq('id', auditId)

    } catch (error) {
      console.error('Scan error:', error)

      // Mark audit as failed
      await supabase
        .from('audits')
        .update({ status: 'failed' })
        .eq('id', auditId)

      throw error
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  }

  private async crawlWebsite(browser: any, startUrl: string, maxPages: number): Promise<string[]> {
    const visited = new Set<string>()
    const toVisit = [startUrl]
    const baseUrl = new URL(startUrl)

    while (visited.size < maxPages && toVisit.length > 0) {
      const url = toVisit.shift()!

      if (visited.has(url)) continue
      visited.add(url)

      try {
        const page = await browser.newPage()
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 })

        // Extract same-domain links
        if (visited.size < maxPages) {
          const links = await page.evaluate((baseDomain: string) => {
            const anchors = Array.from(document.querySelectorAll('a[href]'))
            return anchors
              .map(a => (a as HTMLAnchorElement).href)
              .filter(href => {
                try {
                  const url = new URL(href)
                  return url.hostname === baseDomain
                } catch {
                  return false
                }
              })
          }, baseUrl.hostname)

          // Add new links to visit
          for (const link of links) {
            if (!visited.has(link) && visited.size + toVisit.length < maxPages) {
              toVisit.push(link)
            }
          }
        }

        await page.close()
      } catch (error) {
        console.error(`Error crawling ${url}:`, error)
      }
    }

    return Array.from(visited).slice(0, maxPages)
  }

  private async scanPage(browser: any, url: string) {
    const page = await browser.newPage()

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 })

      const results = await new AxePuppeteer(page)
        .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa'])
        .analyze()

      await page.close()

      return results.violations
    } catch (error) {
      await page.close()
      throw error
    }
  }

  private async saveResults(auditId: string, scanResults: ScanResult[]) {
    let criticalCount = 0
    let seriousCount = 0
    let moderateCount = 0
    let minorCount = 0
    const violations: any[] = []

    for (const result of scanResults) {
      for (const violation of result.violations) {
        const impact = violation.impact || 'minor'

        // Count by impact
        if (impact === 'critical') criticalCount++
        else if (impact === 'serious') seriousCount++
        else if (impact === 'moderate') moderateCount++
        else minorCount++

        violations.push({
          audit_id: auditId,
          page_url: result.pageUrl,
          violation_type: violation.id,
          impact,
          wcag_criterion: violation.tags?.find((tag: string) => tag.startsWith('wcag'))?.replace('wcag', '') || 'N/A',
          description: violation.description,
          affected_elements: violation.nodes?.length || 1,
          ai_explanation: null, // Will be filled by AI service
          ai_fix_steps: null,
          estimated_fix_hours: null
        })
      }
    }

    // Save violations to database
    if (violations.length > 0) {
      const { error } = await supabase
        .from('violations')
        .insert(violations)

      if (error) {
        console.error('Error saving violations:', error)
        throw error
      }
    }

    // Calculate WCAG score
    const wcagScore = this.calculateWCAGScore(criticalCount, seriousCount, moderateCount, minorCount)
    const wcagLevel = this.determineWCAGLevel(wcagScore)

    // Update audit with counts and score
    await supabase
      .from('audits')
      .update({
        total_violations: violations.length,
        critical_count: criticalCount,
        serious_count: seriousCount,
        moderate_count: moderateCount,
        minor_count: minorCount,
        wcag_score: wcagScore,
        wcag_level: wcagLevel
      })
      .eq('id', auditId)
  }

  private calculateWCAGScore(critical: number, serious: number, moderate: number, minor: number): number {
    let score = 100 - (critical * 10) - (serious * 5) - (moderate * 2) - (minor * 1)
    return Math.max(0, score)
  }

  private determineWCAGLevel(score: number): string | null {
    if (score >= 95) return 'AAA'
    if (score >= 85) return 'AA'
    if (score >= 70) return 'A'
    return null
  }
}
