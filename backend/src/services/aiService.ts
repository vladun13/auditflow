import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../config/supabase.js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

interface AIRecommendation {
  explanation: string
  fix_steps: string
  estimated_hours: number
  tools?: string
}

export class AIService {
  async generateRecommendations(auditId: string) {
    try {
      // Fetch all violations for this audit
      const { data: violations, error } = await supabase
        .from('violations')
        .select('*')
        .eq('audit_id', auditId)

      if (error || !violations || violations.length === 0) {
        console.log('No violations to process')
        return
      }

      // Group violations by type to avoid duplicate API calls
      const violationsByType = new Map<string, any[]>()
      for (const violation of violations) {
        const type = violation.violation_type
        if (!violationsByType.has(type)) {
          violationsByType.set(type, [])
        }
        violationsByType.get(type)!.push(violation)
      }

      // Process each unique violation type
      for (const [type, instances] of violationsByType) {
        try {
          // Check cache first
          const cached = await this.getFromCache(type)
          let recommendation: AIRecommendation

          if (cached) {
            recommendation = cached
          } else {
            // Generate new recommendation
            recommendation = await this.generateRecommendation(type, instances[0])
            // Cache it
            await this.saveToCache(type, recommendation)
          }

          // Update all violations of this type
          for (const violation of instances) {
            await supabase
              .from('violations')
              .update({
                ai_explanation: recommendation.explanation,
                ai_fix_steps: recommendation.fix_steps,
                estimated_fix_hours: recommendation.estimated_hours
              })
              .eq('id', violation.id)
          }
        } catch (error) {
          console.error(`Error processing violation type ${type}:`, error)
        }
      }

      console.log(`Generated AI recommendations for audit ${auditId}`)
    } catch (error) {
      console.error('Error generating AI recommendations:', error)
      throw error
    }
  }

  private async generateRecommendation(violationType: string, violationExample: any): Promise<AIRecommendation> {
    const prompt = `You are an accessibility engineer. A WCAG audit found this violation on a real website:

Violation ID: ${violationType}
Impact: ${violationExample.impact}
WCAG criterion: ${violationExample.wcag_criterion}
Page: ${violationExample.page_url}
Axe-core description: ${violationExample.description}
Number of affected elements: ${violationExample.affected_elements}

Respond with a JSON object containing exactly these keys:

"explanation" — 1-2 plain-English sentences: what the problem is and why it matters for real users (screen reader users, keyboard users, low-vision users, etc.).

"fix_steps" — A numbered list of concrete steps a developer must take to fix this. Each step must be specific to the violation type "${violationType}". Include the exact HTML attribute, CSS property, or code change required. Show a before/after code snippet where it makes the fix clearer. Do NOT say "review WCAG guidelines" or give vague advice — tell the developer exactly what to change in their code.

"estimated_hours" — Realistic float (0.5–8) for a developer to fix all instances.

"tools" — Optional: specific tools or libraries that help (e.g. "axe DevTools browser extension", "eslint-plugin-jsx-a11y").

Return only valid JSON, no prose outside the JSON object.`

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const response = message.content[0]
      if (response.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not parse JSON from Claude response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        explanation: parsed.explanation || 'No explanation available',
        fix_steps: parsed.fix_steps || 'No fix steps available',
        estimated_hours: parseFloat(parsed.estimated_hours) || 1.0,
        tools: parsed.tools
      }
    } catch (error) {
      console.error('Claude API error:', error)
      return this.getFallback(violationType, violationExample)
    }
  }

  private getFallback(violationType: string, violation: any): AIRecommendation {
    const fallbacks: Record<string, Omit<AIRecommendation, 'estimated_hours'>> = {
      'color-contrast': {
        explanation: 'Text does not have enough contrast against its background, making it hard to read for low-vision users.',
        fix_steps: '1. Open browser DevTools and inspect the failing element.\n2. Check the computed color and background-color values.\n3. Use the WebAIM Contrast Checker (webaim.org/resources/contrastchecker) to find a passing color pair.\n4. Update your CSS: for body text, aim for at least 4.5:1 ratio; for large text (18px+ or 14px bold), at least 3:1.\nExample fix:\n  Before: color: #999999; background: #ffffff; (ratio 2.85:1 — FAIL)\n  After:  color: #767676; background: #ffffff; (ratio 4.54:1 — PASS)',
        tools: 'WebAIM Contrast Checker, axe DevTools, Colour Contrast Analyser'
      },
      'image-alt': {
        explanation: 'Images are missing alt text, so screen reader users receive no information about what the image shows.',
        fix_steps: '1. Find every <img> tag that is missing an alt attribute.\n2. For informative images, add a descriptive alt that conveys the meaning: <img src="chart.png" alt="Bar chart showing 40% increase in Q3 revenue">\n3. For purely decorative images, add an empty alt: <img src="divider.png" alt="">\n4. Never use the filename or "image of" as the alt value.',
        tools: 'eslint-plugin-jsx-a11y (rule: alt-text)'
      },
      'button-name': {
        explanation: 'Buttons have no accessible name, so screen reader users cannot tell what the button does.',
        fix_steps: '1. Add visible text inside the button: <button>Submit form</button>\n2. For icon-only buttons, add aria-label: <button aria-label="Close dialog"><svg ...></svg></button>\n3. Alternatively use aria-labelledby pointing to a visible label element.\n4. Never leave a button with only a generic icon and no text or aria-label.',
        tools: 'eslint-plugin-jsx-a11y (rule: interactive-supports-focus)'
      },
      'link-name': {
        explanation: 'Links have no accessible name, meaning screen reader users cannot determine where the link goes.',
        fix_steps: '1. Add descriptive visible text inside the link: <a href="/report">Download report</a>\n2. For icon-only links, add aria-label: <a href="/home" aria-label="Go to homepage"><svg ...></svg></a>\n3. Avoid generic text like "click here" or "read more" — be specific about the destination.',
        tools: 'eslint-plugin-jsx-a11y (rule: anchor-has-content)'
      },
      'label': {
        explanation: 'Form inputs are missing labels, so screen reader users cannot identify what data to enter.',
        fix_steps: '1. Add a <label> element and associate it with the input using htmlFor/for:\n  <label for="email">Email address</label>\n  <input type="email" id="email">\n2. Or wrap the input in the label:\n  <label>Email address <input type="email"></label>\n3. As a last resort for visually hidden labels, use aria-label on the input directly.',
        tools: 'eslint-plugin-jsx-a11y (rule: label-has-associated-control)'
      },
    }

    const specific = fallbacks[violationType]
    if (specific) {
      return { ...specific, estimated_hours: 1.0 }
    }

    // Generic fallback with at least the violation description
    return {
      explanation: `This ${violation.impact}-impact accessibility issue (${violationType}) may prevent some users from accessing content on your page.`,
      fix_steps: `1. Search your codebase for elements matching the violation type: "${violationType}".\n2. Axe-core description: ${violation.description}\n3. Look up the fix for WCAG criterion ${violation.wcag_criterion} at https://www.w3.org/WAI/WCAG21/quickref/ for exact code requirements.\n4. Apply the fix to all ${violation.affected_elements} affected element(s) on this page.`,
      estimated_hours: 1.0
    }
  }

  private async getFromCache(violationType: string): Promise<AIRecommendation | null> {
    const { data, error } = await supabase
      .from('claude_cache')
      .select('*')
      .eq('violation_type', violationType)
      .single()

    if (error || !data) {
      return null
    }

    return {
      explanation: data.explanation,
      fix_steps: data.fix_steps,
      estimated_hours: data.estimated_hours,
      tools: data.tools
    }
  }

  private async saveToCache(violationType: string, recommendation: AIRecommendation) {
    await supabase
      .from('claude_cache')
      .upsert({
        violation_type: violationType,
        explanation: recommendation.explanation,
        fix_steps: recommendation.fix_steps,
        estimated_hours: recommendation.estimated_hours,
        tools: recommendation.tools
      })
  }
}
