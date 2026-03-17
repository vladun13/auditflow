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
    variantId: process.env.LEMONSQUEEZY_VARIANT_ID_BASIC!,
    credits: 1,
    name: 'Basic',
    price: 149
  },
  pro: {
    variantId: process.env.LEMONSQUEEZY_VARIANT_ID_PRO!,
    credits: 5,
    name: 'Pro',
    price: 299
  },
  enterprise: {
    variantId: process.env.LEMONSQUEEZY_VARIANT_ID_ENTERPRISE!,
    credits: 15,
    name: 'Enterprise',
    price: 499
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

    // Update payment record
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('stripe_session_id', order_id)
      .single()

    if (payment && payment.status === 'pending') {
      // Update payment status
      await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('stripe_session_id', order_id)

      // Add credits to user
      await supabase
        .from('users')
        .update({
          credits: supabase.raw(`credits + ${payment.credits_added}`)
        })
        .eq('id', req.user!.id)

      res.json({
        success: true,
        credits_added: payment.credits_added,
        message: 'Payment successful'
      })
    } else if (payment && payment.status === 'completed') {
      res.json({ success: true, message: 'Payment already processed' })
    } else {
      res.status(404).json({ error: 'Payment not found' })
    }
  } catch (error) {
    console.error('Payment confirmation error:', error)
    res.status(500).json({ error: 'Failed to confirm payment' })
  }
})

// Lemon Squeezy webhook endpoint (for production)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-signature'] as string

    if (!signature) {
      return res.status(400).send('Missing signature')
    }

    // Verify webhook signature using HMAC SHA256
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
    const hmac = crypto.createHmac('sha256', secret)
    const digest = hmac.update(req.body).digest('hex')

    if (signature !== digest) {
      console.error('Invalid webhook signature')
      return res.status(400).send('Invalid signature')
    }

    // Parse the webhook payload
    const event = JSON.parse(req.body.toString())

    // Handle order_created event
    if (event.meta?.event_name === 'order_created') {
      const orderId = event.data?.id

      if (!orderId) {
        return res.status(400).send('Missing order ID')
      }

      // Update payment record
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('stripe_session_id', orderId)
        .single()

      if (payment && payment.status === 'pending') {
        await supabase
          .from('payments')
          .update({ status: 'completed' })
          .eq('stripe_session_id', orderId)

        // Add credits
        await supabase
          .from('users')
          .update({
            credits: supabase.raw(`credits + ${payment.credits_added}`)
          })
          .eq('id', payment.user_id)
      }
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(400).send('Webhook error')
  }
})

export default router
