// Database connection utility for serverless functions
const { Sequelize } = require('sequelize');

// Create a singleton connection to avoid connection pooling issues
let sequelize;

const getSequelize = () => {
  if (!sequelize) {
    sequelize = new Sequelize(process.env.DATABASE_URL || process.env.POSTGRES_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 2,        // Reduced for serverless
        min: 0,        // Allow 0 connections when idle
        acquire: 3000, // Faster acquisition
        idle: 1000,    // Shorter idle time
        evict: 1000    // Cleanup idle connections faster
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false
    });
  }
  return sequelize;
};

// Helper function to connect with retry logic for cold starts
const connectWithRetry = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await getSequelize().authenticate();
      return getSequelize();
    } catch (error) {
      console.log(`Database connection attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error;
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

module.exports = { getSequelize, connectWithRetry };