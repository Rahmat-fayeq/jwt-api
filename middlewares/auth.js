const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token.split(' ')[1],process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      console.error('JWT verification failed:', err);
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = decodedToken;
    next();
  });
};

module.exports = { verifyToken };
