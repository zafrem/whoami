const bcrypt = require('bcryptjs');
const { connectWithRetry } = require('../_db');
const { initModels } = require('../_models');
const { cors, authenticate, runMiddleware, handleError } = require('../_middleware');

export default async function handler(req, res) {
  try {
    // Handle CORS
    await runMiddleware(req, res, cors);
    
    // Connect to database
    await connectWithRetry();
    
    if (req.method === 'GET') {
      // Get profile
      await runMiddleware(req, res, authenticate);
      
      const userData = {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        createdAt: req.user.createdAt
      };

      res.status(200).json({ user: userData });
      
    } else if (req.method === 'PUT') {
      // Update profile
      await runMiddleware(req, res, authenticate);
      
      const { firstName, lastName, username } = req.body;
      const updateData = {};

      if (firstName !== undefined) updateData.firstName = firstName?.trim() || null;
      if (lastName !== undefined) updateData.lastName = lastName?.trim() || null;
      if (username !== undefined) {
        if (!username || username.length < 3) {
          return res.status(400).json({ error: 'Username must be at least 3 characters' });
        }
        updateData.username = username;
      }

      // Check for username uniqueness if updating
      if (username && username !== req.user.username) {
        const { User } = initModels();
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
          return res.status(409).json({ error: 'Username already taken' });
        }
      }

      // Update user
      await req.user.update(updateData);

      const userData = {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      };

      res.status(200).json({ user: userData });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    handleError(res, error, 'Profile operation failed');
  }
}