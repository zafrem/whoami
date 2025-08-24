const { sequelize } = require('../models');

// Setup test environment
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Use test database settings
  process.env.DB_NAME = 'personality_survey_test';
  process.env.RATE_LIMIT_MAX = '10000'; // Disable rate limiting for tests
  
  // Sync database for tests
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
});

// Clean up after each test
afterEach(async () => {
  // Clear all tables but keep structure
  const models = Object.values(sequelize.models);
  
  for (const model of models) {
    await model.destroy({ where: {}, truncate: true });
  }
});