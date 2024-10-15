const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  console.log('Request headers:', req.headers); // Log all headers for debugging

  const authHeader = req.headers['authorization']; // Access the authorization header
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token (Bearer token)

  console.log('Incoming token:', token); // Log the incoming token for debugging

  // If no token is provided, return an error
  if (!token) {
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' }); // If token is invalid
    }

    req.user = user; // Store the decoded token information in the request
    next(); // Move to the next middleware or route
  });
};

module.exports = authenticateToken;
