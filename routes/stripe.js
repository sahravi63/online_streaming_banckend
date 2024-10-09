const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Set your Stripe secret key
const authenticateToken = require('../middleware/authenticateToken');
const Video = require('../db/Video'); // Import Video model
const router = express.Router();

// Create Checkout Session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: video.title,
            description: 'Access to video: ' + video.title,
          },
          unit_amount: video.paymentAmount * 100, // Convert to cents
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
