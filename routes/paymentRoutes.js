const express = require('express');
const Razorpay = require('razorpay');
const authenticateToken = require('../middleware/authenticateToken'); // Import your middleware

const router = express.Router();

// Create Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post('/create-razorpay-order', authenticateToken, async (req, res) => {
  const { sessionName, amount, currency, receipt } = req.body;

  if (!sessionName || !amount || !currency || !receipt) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const options = {
      amount,
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json({ orderId: order.id, amount });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Error creating Razorpay order', error: error.message });
  }
});

module.exports = router;
