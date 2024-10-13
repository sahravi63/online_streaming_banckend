const express = require('express');
const authenticateToken = require('../middleware/authenticateToken'); // Adjust the path to your middleware
const adminAuthenticate = require('../middleware/adminAuthenticate'); // Ensure this path is correct
const User = require('../db/User'); // Adjust the path to your User model

const router = express.Router();

// Get User Subscription - Only requires authentication, not admin
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.subscriptions) return res.status(404).json({ error: 'Subscription not found' });

    res.status(200).json({ subscriptions: user.subscriptions });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upgrade or Renew Subscription - Users can upgrade if the plan has expired
router.post('/upgrade/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check if the subscription has expired (endDate is in the past)
    const currentDate = new Date();
    const subscription = user.subscription;
    
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    // Allow renewal if the plan is expired
    if (subscription.endDate && currentDate > subscription.endDate) {
      // User can renew or upgrade their subscription
      user.subscription.plan = 'Premium';  // Allow user to select a new plan dynamically
      user.subscription.status = 'Active';
      user.subscription.startDate = new Date();
      user.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      await user.save();
      return res.status(200).json({ message: 'Subscription renewed successfully', subscription: user.subscription });
    } else {
      // If the plan is active, ensure admin privileges are required
      return res.status(403).json({ error: 'Plan is still active. Admin privileges are required to upgrade.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error during upgrade.' });
  }
});

// Cancel Subscription - Admin access required
router.post('/cancel/:userId', authenticateToken, adminAuthenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.subscription.status = 'Cancelled';
    user.subscription.endDate = new Date(); // Set end date to current time

    await user.save();
    res.status(200).json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error during cancellation.' });
  }
});

module.exports = router;
