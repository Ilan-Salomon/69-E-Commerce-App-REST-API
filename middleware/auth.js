const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]  // Expected format: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided.' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' })
    }
    req.user = user  // user info from token payload
    next()
  })
}

module.exports = authenticateToken
