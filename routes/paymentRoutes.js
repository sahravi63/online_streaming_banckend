const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Set your Stripe secret key
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Create Checkout Session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Yoga Session Subscription',
            description: 'Subscribe to the yoga session.',
          },
          unit_amount: 5000, // Price in cents ($50)
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Error creating checkout session' });
  }
});

module.exports = router;
