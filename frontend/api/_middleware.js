// Middleware utilities for serverless functions
const jwt = require('jsonwebtoken');
const { initModels } = require('./_models');

// CORS middleware
const cors = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'https://whoami-personality.vercel.app', // Your production domain
    process.env.CORS_ORIGIN
  ].filter(Boolean);

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept-Language');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
};

// Rate limiting (simplified for serverless)
const rateLimit = () => {
  // In production, you might want to use external rate limiting
  // like Redis or a rate limiting service
  return (req, res, next) => {
    // Basic rate limiting logic could go here
    next();
  };
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { User } = initModels();
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Optional authentication (for routes that work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { User } = initModels();
      const user = await User.findByPk(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore errors for optional auth
  }
  
  next();
};

// Helper to run middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Error handler
const handleError = (res, error, defaultMessage = 'Internal server error') => {
  console.error('API Error:', error);
  
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ 
      error: 'Validation error',
      details: error.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Record already exists' });
  }
  
  res.status(500).json({ error: defaultMessage });
};

module.exports = {
  cors,
  rateLimit,
  authenticate,
  optionalAuth,
  runMiddleware,
  handleError
};