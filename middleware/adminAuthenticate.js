const jwt = require('jsonwebtoken');
const User = require('../db/User');

const adminAuthenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token

  if (!token) {
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT token
    const user = await User.findById(decoded.id); // Find user by decoded token ID

    // Check if user is admin
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    req.user = user; // Store the user information in the request
    next(); // Move to the next middleware
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(403).json({ error: 'Invalid token or unauthorized access.' });
  }
};

module.exports = adminAuthenticate;
