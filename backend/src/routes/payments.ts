import express from 'express'
import crypto from 'crypto'
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Initialize Lemon Squeezy
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  onError: (error) => console.error('Lemon Squeezy Error:', error),
})

const plans = {
  basic: {
    variantId: process.env.LEMONSQUEEZY_VARIANT_ID_STARTER ?? process.env.LEMONSQUEEZY_VARIANT_ID_BASIC!,
    credits: 50,
    name: 'Starter',
    price: 29,
    maxPages: 10,
  },
  pro: {
    variantId: process.env.LEMONSQUEEZY_VARIANT_ID_PRO!,
    credits: 150,
    name: 'Pro',
    price: 79,
    maxPages: 30,
  },
  enterprise: {
    variantId: process.env.LEMONSQUEEZY_VARIANT_ID_ENTERPRISE!,
    credits: 400,
    name: 'Enterprise',
    price: 149,
    maxPages: 0, // 0 = unlimited
  }
}

// Create checkout session
router.post('/checkout', authenticate, async (req: AuthRequest, res) => {
  try {
    const { plan } = req.body

    if (!plan || !plans[plan as keyof typeof plans]) {
      return res.status(400).json({ error: 'Invalid plan' })
    }

    const selectedPlan = plans[plan as keyof typeof plans]

    // Get user email
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', req.user!.id)
      .single()

    // Create Lemon Squeezy checkout
    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      selectedPlan.variantId,
      {
        checkoutData: {
          email: userData?.email || req.user!.email,
          custom: {
            user_id: req.user!.id,
            credits: selectedPlan.credits.toString(),
            plan: plan
          }
        },
        productOptions: {
          redirectUrl: `${process.env.FRONTEND_URL}/payment/success`,
        },
        checkoutOptions: {
          embed: false,
          media: true,
          logo: true,
        },
        expiresAt: null,
        preview: false,
        testMode: process.env.NODE_ENV === 'development'
      }
    )

    if (checkout.error) {
      throw new Error(checkout.error.message)
    }

    // Create payment record
    await supabase
      .from('payments')
      .insert({
        user_id: req.user!.id,
        stripe_session_id: checkout.data?.data.id!, // Using same column for checkout ID
        amount: selectedPlan.price * 100, // Store in cents
        credits_added: selectedPlan.credits,
        status: 'pending'
      })

    res.json({ url: checkout.data?.data.attributes.url })
  } catch (error) {
    console.error('Lemon Squeezy checkout error:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

// Confirm payment success
router.get('/success/:order_id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { order_id } = req.params

    // Fetch payment and verify it belongs to the authenticated user (IDOR fix)
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('stripe_session_id', order_id)
      .eq('user_id', req.user!.id)  // enforce ownership
      .single()

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    if (payment.status === 'completed') {
      return res.json({ success: true, message: 'Payment already processed' })
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment cannot be confirmed' })
    }

    // Validate credits_added is a safe positive integer before using in raw SQL
    const creditsToAdd = Math.floor(Number(payment.credits_added))
    if (!Number.isInteger(creditsToAdd) || creditsToAdd <= 0 || creditsToAdd > 500) {
      console.error('Invalid credits_added value in payment record:', payment.credits_added)
      return res.status(500).json({ error: 'Failed to confirm payment' })
    }

    // Update payment status
    await supabase
      .from('payments')
      .update({ status: 'completed' })
      .eq('stripe_session_id', order_id)
      .eq('user_id', req.user!.id)

    // Add credits and update plan — read current value then update.
    // Double-processing is prevented by the payment.status === 'pending' check above.
    const { data: currentUser } = await supabase
      .from('users')
      .select('credits')
      .eq('id', req.user!.id)
      .single()

    // Derive plan tier from the payment's credits_added amount
    const grantedPlan = Object.entries(plans).find(
      ([, p]) => p.credits === creditsToAdd
    )
    const planName = grantedPlan ? grantedPlan[0] : 'basic'
    const maxPages = grantedPlan ? grantedPlan[1].maxPages : 5

    await supabase
      .from('users')
      .update({
        credits: (currentUser?.credits ?? 0) + creditsToAdd,
        plan: planName,
        max_pages_per_scan: maxPages,
      })
      .eq('id', req.user!.id)

    res.json({
      success: true,
      credits_added: creditsToAdd,
      message: 'Payment successful'
    })
  } catch (error) {
    console.error('Payment confirmation error:', error)
    res.status(500).json({ error: 'Failed to confirm payment' })
  }
})

// Lemon Squeezy webhook endpoint (for production)
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-signature'] as string

    if (!signature) {
      return res.status(400).send('Missing signature')
    }

    // Verify webhook signature using HMAC SHA256 with timing-safe comparison
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
    const hmac = crypto.createHmac('sha256', secret)
    const digest = hmac.update(req.body).digest('hex')

    // Use timingSafeEqual to prevent timing attacks
    const sigBuffer = Buffer.from(signature, 'hex')
    const digestBuffer = Buffer.from(digest, 'hex')
    const signatureValid =
      sigBuffer.length === digestBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, digestBuffer)

    if (!signatureValid) {
      console.error('Invalid webhook signature')
      return res.status(400).send('Invalid signature')
    }

    // Parse the webhook payload
    const event = JSON.parse(req.body.toString())

    // Handle order_created event
    if (event.meta?.event_name === 'order_created') {
      const orderId = String(event.data?.id)
      const customData = event.meta?.custom_data as Record<string, string> | undefined
      const userId = customData?.user_id
      const creditsStr = customData?.credits
      const planKey = customData?.plan

      if (!userId || !creditsStr || !orderId) {
        console.error('Webhook missing required fields', { userId, creditsStr, orderId })
        return res.status(400).send('Missing required webhook data')
      }

      const creditsToAdd = Math.floor(Number(creditsStr))
      if (!Number.isInteger(creditsToAdd) || creditsToAdd <= 0 || creditsToAdd > 500) {
        console.error('Invalid credits amount in webhook custom data:', creditsStr)
        return res.status(400).send('Invalid credits amount')
      }

      // Idempotency: skip if this order was already processed
      const { data: existing } = await supabase
        .from('payments')
        .select('id, status')
        .eq('stripe_session_id', orderId)
        .eq('user_id', userId)
        .single()

      if (existing?.status === 'completed') {
        return res.json({ received: true })
      }

      // Find and mark the pending checkout record as completed
      const { data: pendingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', userId)
        .eq('credits_added', creditsToAdd)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (pendingPayment) {
        await supabase
          .from('payments')
          .update({ status: 'completed', stripe_session_id: orderId })
          .eq('id', pendingPayment.id)
      } else {
        await supabase.from('payments').insert({
          user_id: userId,
          stripe_session_id: orderId,
          amount: Math.round((event.data?.attributes?.total ?? 0)),
          credits_added: creditsToAdd,
          status: 'completed',
        })
      }

      // Add credits to user
      const { data: webhookUser } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single()

      const planEntry = Object.entries(plans).find(([key]) => key === planKey)
      const webhookPlanName = planEntry ? planEntry[0] : 'basic'
      const webhookMaxPages = planEntry ? planEntry[1].maxPages : 5

      await supabase
        .from('users')
        .update({
          credits: (webhookUser?.credits ?? 0) + creditsToAdd,
          plan: webhookPlanName,
          max_pages_per_scan: webhookMaxPages,
        })
        .eq('id', userId)

      console.log(`Webhook: added ${creditsToAdd} credits to user ${userId}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(400).send('Webhook error')
  }
})

// Payment history
router.get('/history', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('id, amount, credits_added, status, created_at')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payment history:', error)
      return res.status(500).json({ error: 'Failed to fetch payment history' })
    }

    const mapped = (payments ?? []).map((p) => ({
      id: p.id,
      amount: p.amount, // in cents
      credits_added: p.credits_added,
      status: p.status,
      created_at: p.created_at,
      plan: p.credits_added === 50 ? 'Starter' : p.credits_added === 150 ? 'Pro' : p.credits_added === 400 ? 'Enterprise' : 'Unknown',
    }))

    res.json(mapped)
  } catch (error) {
    console.error('Error fetching payment history:', error)
    res.status(500).json({ error: 'Failed to fetch payment history' })
  }
})

// Subscription info — AuditFlow is pay-as-you-go, no recurring subscriptions
router.get('/subscription', authenticate, async (_req: AuthRequest, res) => {
  res.json({ subscription: null, plan: 'pay_as_you_go' })
})

export default router
