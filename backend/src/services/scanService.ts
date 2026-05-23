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
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 })
        } catch (gotoError: any) {
          console.warn(`networkidle2 crawl timeout for ${url}, falling back to load:`, gotoError.message)
          await page.goto(url, { waitUntil: 'load', timeout: 15000 })
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
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 })
      } catch (gotoError: any) {
        console.warn(`networkidle2 scan timeout for ${url}, falling back to load:`, gotoError.message)
        await page.goto(url, { waitUntil: 'load', timeout: 15000 })
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
    // Evade bot detection with a realistic User-Agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36')
    
    // Set typical browser viewport size to prevent mobile-only/empty renders
    await page.setViewport({ width: 1280, height: 800 })
    
    // Set extra HTTP headers to look like a standard browser request
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Connection': 'keep-alive',
      'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'Upgrade-Insecure-Requests': '1'
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
      
      const { title, bodyText, elementCount } = pageInfo;
      
      // Check for bot challenge or security check indicators
      const challengeTerms = [
        'cloudflare',
        'checking your browser',
        'security check',
        'access denied',
        'please enable js',
        'please enable javascript',
        'ddos protection',
        'bot protection',
        'captcha'
      ];
      
      const lowerTitle = title.toLowerCase();
      const lowerBody = bodyText.toLowerCase();
      
      const isChallenge = challengeTerms.some(term => 
        lowerTitle.includes(term) || lowerBody.includes(term)
      );
      
      if (isChallenge) {
        throw new Error(`Bot challenge or security check detected on page: "${title}"`);
      }
      
      // Ensure the page has reasonable structural elements
      if (elementCount < 5) {
        throw new Error(`Loaded page has virtually empty DOM (only ${elementCount} elements inside body)`);
      }
      
      // Ensure we don't have a blank body with extremely low content
      if (!bodyText.trim() && elementCount < 10) {
        throw new Error(`Page body is empty and has very few elements (${elementCount})`);
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
