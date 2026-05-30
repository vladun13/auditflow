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
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-zygote',
          '--single-process',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-background-networking',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-first-run',
          '--safebrowsing-disable-auto-update',
          '--js-flags=--max-old-space-size=256',
        ]
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

      if (scanResults.length === 0) {
        throw new Error('No pages could be scanned — all pages failed to load or timed out')
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
        await this.configurePage(page)
        
        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
        } catch {
          try {
            await page.goto(url, { waitUntil: 'load', timeout: 30000 })
          } catch {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
          }
        }

        // Validate the page content before extracting links
        await this.validatePageContent(page, url)

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
      await this.configurePage(page)
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
      } catch {
        try {
          await page.goto(url, { waitUntil: 'load', timeout: 30000 })
        } catch {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
        }
      }

      // Wait briefly for JS-rendered content to settle
      await new Promise(resolve => setTimeout(resolve, 2500))

      // Validate page content before scanning
      await this.validatePageContent(page, url)

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
        const nodeCount = violation.nodes?.length || 1

        // Count by impact per affected element (not just per violation type)
        if (impact === 'critical') criticalCount += nodeCount
        else if (impact === 'serious') seriousCount += nodeCount
        else if (impact === 'moderate') moderateCount += nodeCount
        else minorCount += nodeCount

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

  private async configurePage(page: any) {
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36')
    await page.setViewport({ width: 1280, height: 800 })
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Connection': 'keep-alive',
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'Upgrade-Insecure-Requests': '1'
    })

    // Block images, fonts, media and tracking — not needed for axe-core, saves ~50-100MB per page
    await page.setRequestInterception(true)
    page.on('request', (req: any) => {
      const type = req.resourceType()
      if (['image', 'media', 'font', 'stylesheet'].includes(type)) {
        req.abort()
      } else {
        req.continue()
      }
    })
  }

  private async validatePageContent(page: any, url: string) {
    try {
      const pageInfo = await page.evaluate(() => {
        const title = document.title;
        const bodyText = document.body ? document.body.innerText : '';
        const elementCount = document.body ? document.body.querySelectorAll('*').length : 0;
        return { title, bodyText, elementCount };
      });

      const { title, elementCount } = pageInfo;

      // Only treat as a bot challenge if the page is nearly empty AND the title signals a block.
      // A real content page with thousands of elements can legitimately mention "cloudflare" etc.
      const blockTitles = [
        'checking your browser',
        'just a moment',
        'access denied',
        'ddos protection',
        'security check',
        'attention required',
        'please wait',
      ];
      const lowerTitle = title.toLowerCase();
      const isEmptyChallenge = elementCount < 30 && blockTitles.some(t => lowerTitle.includes(t));

      if (isEmptyChallenge) {
        throw new Error(`Bot challenge detected: "${title}" — this site blocks automated scanners`);
      }

      if (elementCount < 5) {
        throw new Error(`Page has virtually empty DOM (${elementCount} elements) — likely failed to load`);
      }

    } catch (error: any) {
      console.error(`Page validation failed for ${url}:`, error.message);
      throw new Error(`Failed to load valid page content for ${url}: ${error.message}`);
    }
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
