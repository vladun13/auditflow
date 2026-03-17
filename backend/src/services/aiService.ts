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
    const prompt = `I found this accessibility violation in a website:
- Type: ${violationType}
- Impact: ${violationExample.impact}
- WCAG: ${violationExample.wcag_criterion}
- Description: ${violationExample.description}
- Affected elements: ${violationExample.affected_elements} instances

Please provide:
1. A plain English explanation (1-2 sentences) of what this issue is and why it matters for accessibility
2. Step-by-step fix instructions (be specific and actionable)
3. Estimated hours to fix (be realistic: 0.5 - 8 hours range)
4. Tools/libraries that can help (optional)

Format your response as JSON with keys: explanation, fix_steps, estimated_hours, tools`

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const response = message.content[0]
      if (response.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      // Parse JSON response
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

      // Return fallback
      return {
        explanation: 'This accessibility issue may prevent some users from accessing content.',
        fix_steps: 'Please review the WCAG guidelines for this criterion and update your code accordingly.',
        estimated_hours: 1.0
      }
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
