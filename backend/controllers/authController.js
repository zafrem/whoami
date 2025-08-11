const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Helper function to get location data from IP
const getLocationFromIP = async (ip) => {
  try {
    // In production, you might want to use a real IP geolocation service
    // For now, we'll return a simple structure
    return {
      ip: ip,
      country: 'Unknown',
      city: 'Unknown',
      timestamp: new Date()
    };
  } catch (error) {
    return {
      ip: ip,
      country: 'Unknown',
      city: 'Unknown',
      timestamp: new Date()
    };
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, birthYear } = req.body;

    const existingUser = await User.findOne({
      where: {
        $or: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email ? 'Email already exists' : 'Username already exists'
      });
    }

    // Get location data from IP
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const locationData = await getLocationFromIP(clientIP);

    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      birthYear: birthYear ? parseInt(birthYear) : null,
      lastLoginLocation: locationData
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.scope('withPassword').findOne({
      where: { email, isActive: true }
    });

    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get location data from IP and update user
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const locationData = await getLocationFromIP(clientIP);

    await user.update({ 
      lastLogin: new Date(),
      lastLoginLocation: locationData
    });

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, username } = req.body;
    const updates = {};

    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (username !== undefined) {
      const existingUser = await User.findOne({
        where: { username, id: { $ne: req.user.id } }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      updates.username = username;
    }

    await req.user.update(updates);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.scope('withPassword').findByPk(req.user.id);

    if (!(await user.validatePassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    await user.update({ password: newPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};