const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '10m' // 10 minutes default
  });
};

// Helper function to merge IP location data with GPS location data
const mergeLocationData = async (ipLocationData, geoLocation) => {
  const mergedData = {
    ...ipLocationData,
    source: 'ip'
  };

  if (geoLocation && geoLocation.coords) {
    mergedData.gps = {
      latitude: geoLocation.coords.latitude,
      longitude: geoLocation.coords.longitude,
      accuracy: geoLocation.coords.accuracy,
      timestamp: geoLocation.timestamp
    };
    mergedData.source = 'hybrid';

    // Try to get more precise location from coordinates using reverse geocoding
    try {
      const reverseGeoData = await getLocationFromCoordinates(
        geoLocation.coords.latitude, 
        geoLocation.coords.longitude
      );
      
      if (reverseGeoData && reverseGeoData.country && reverseGeoData.city) {
        mergedData.country = reverseGeoData.country;
        mergedData.city = reverseGeoData.city;
        mergedData.region = reverseGeoData.region || mergedData.city;
        mergedData.source = 'gps';
      }
    } catch (error) {
      console.log('Reverse geocoding failed, keeping IP location data:', error.message);
    }
  }

  return mergedData;
};

// Helper function to get location from GPS coordinates
const getLocationFromCoordinates = async (lat, lon) => {
  try {
    // Use OpenStreetMap Nominatim for reverse geocoding (free service)
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`);
    const data = await response.json();
    
    if (data && data.address) {
      return {
        country: data.address.country || 'Unknown',
        city: data.address.city || data.address.town || data.address.village || 'Unknown',
        region: data.address.state || data.address.region || data.address.county || null,
        fullAddress: data.display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

// Helper function to get location data from IP
const getLocationFromIP = async (ip) => {
  try {
    // Handle localhost and private IPs
    if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        ip: ip || 'localhost',
        country: 'Local',
        city: 'Development',
        timestamp: new Date()
      };
    }

    // Use ip-api.com for free geolocation (up to 1000 requests/month)
    // For production, consider upgrading to a paid service like MaxMind or IPStack
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,regionName`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        ip: ip,
        country: data.country || 'Unknown',
        city: data.city || data.regionName || 'Unknown',
        timestamp: new Date()
      };
    } else {
      return {
        ip: ip,
        country: 'Unknown',
        city: 'Unknown',
        timestamp: new Date()
      };
    }
  } catch (error) {
    console.error('Location lookup error:', error);
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
    const { username, email, password, firstName, lastName, birthYear, geoLocation } = req.body;

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

    // Get location data from IP and merge with GPS data if provided
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const ipLocationData = await getLocationFromIP(clientIP);
    
    // Merge IP location with GPS location if provided
    const locationData = await mergeLocationData(ipLocationData, geoLocation);

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
        lastName: user.lastName,
        role: user.role,
        isPro: user.isPro
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, geoLocation } = req.body;

    const user = await User.scope('withPassword').findOne({
      where: { email, isActive: true }
    });

    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get location data from IP and merge with GPS data if provided
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const ipLocationData = await getLocationFromIP(clientIP);
    
    // Merge IP location with GPS location if provided
    const locationData = await mergeLocationData(ipLocationData, geoLocation);

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
        role: user.role,
        isPro: user.isPro
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
        lastLoginLocation: req.user.lastLoginLocation,
        createdAt: req.user.createdAt,
        role: req.user.role,
        isPro: req.user.isPro
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

const refresh = async (req, res) => {
  try {
    const { userId, geoLocation } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findByPk(userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Get location data from IP and merge with GPS data if provided
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const ipLocationData = await getLocationFromIP(clientIP);
    
    // Merge IP location with GPS location if provided
    const locationData = await mergeLocationData(ipLocationData, geoLocation);
    
    await user.update({
      lastLogin: new Date(),
      lastLoginLocation: locationData
    });

    const token = generateToken(user.id);

    res.json({
      message: 'Token refreshed successfully',
      token,
      expiresIn: 10 * 60, // 10 minutes in seconds
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isPro: user.isPro
      }
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Server error during token refresh' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refresh
};