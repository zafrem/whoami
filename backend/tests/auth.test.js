const request = require('supertest');
const { describe, test, expect, beforeEach } = require('@jest/globals');
const app = require('./app');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

describe('Authentication API Endpoints', () => {
  let testUser;
  const validUserData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    birthYear: 1990
  };

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash(validUserData.password, 10);
    testUser = await User.create({
      username: validUserData.username,
      email: validUserData.email,
      password: hashedPassword,
      firstName: validUserData.firstName,
      lastName: validUserData.lastName,
      birthYear: validUserData.birthYear,
      isActive: true,
      role: 'user'
    });
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'NewPassword123!',
        firstName: 'New',
        lastName: 'User',
        birthYear: 1995
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe(newUser.username);
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user).not.toHaveProperty('password'); // Password should not be returned
      expect(response.body.token).toBeDefined();

      // Verify user was created in database
      const createdUser = await User.findOne({ where: { email: newUser.email } });
      expect(createdUser).toBeTruthy();
      expect(createdUser.username).toBe(newUser.username);
    });

    test('should fail with duplicate username', async () => {
      const duplicateUser = {
        username: validUserData.username, // Already exists
        email: 'different@example.com',
        password: 'Password123!',
        firstName: 'Duplicate',
        lastName: 'User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(400);
    });

    test('should fail with duplicate email', async () => {
      const duplicateUser = {
        username: 'differentuser',
        email: validUserData.email, // Already exists
        password: 'Password123!',
        firstName: 'Duplicate',
        lastName: 'User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(400);
    });

    test('should fail with invalid email format', async () => {
      const invalidUser = {
        username: 'testuser2',
        email: 'invalid-email',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    test('should fail with weak password', async () => {
      const weakPasswordUser = {
        username: 'testuser3',
        email: 'test3@example.com',
        password: '123', // Too weak
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    test('should fail with missing required fields', async () => {
      const incompleteUser = {
        username: 'testuser4',
        // Missing email and password
        firstName: 'Test',
        lastName: 'User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(incompleteUser)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const loginData = {
        email: validUserData.email,
        password: validUserData.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(validUserData.email);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.token).toBeDefined();

      // Verify token is a valid JWT format (3 parts separated by dots)
      const tokenParts = response.body.token.split('.');
      expect(tokenParts.length).toBe(3);
    });

    test('should fail with incorrect password', async () => {
      const loginData = {
        email: validUserData.email,
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });

    test('should fail with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: validUserData.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });

    test('should fail with inactive user', async () => {
      // Deactivate user
      await testUser.update({ isActive: false });

      const loginData = {
        email: validUserData.email,
        password: validUserData.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toContain('Account is inactive');
    });

    test('should update lastLogin on successful login', async () => {
      const originalLastLogin = testUser.lastLogin;

      await request(app)
        .post('/api/auth/login')
        .send({
          email: validUserData.email,
          password: validUserData.password
        })
        .expect(200);

      // Reload user from database
      await testUser.reload();
      expect(testUser.lastLogin).not.toBe(originalLastLogin);
      expect(testUser.lastLogin).toBeInstanceOf(Date);
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken;

    beforeEach(async () => {
      // Get auth token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUserData.email,
          password: validUserData.password
        });
      
      authToken = response.body.token;
    });

    test('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(validUserData.email);
      expect(response.body.user.username).toBe(validUserData.username);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.error).toContain('Access denied');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toContain('Invalid token');
    });

    test('should fail with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.error).toContain('Access denied');
    });
  });

  describe('PUT /api/auth/profile', () => {
    let authToken;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUserData.email,
          password: validUserData.password
        });
      
      authToken = response.body.token;
    });

    test('should update user profile successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        birthYear: 1985
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.user.firstName).toBe(updateData.firstName);
      expect(response.body.user.lastName).toBe(updateData.lastName);
      expect(response.body.user.birthYear).toBe(updateData.birthYear);

      // Verify in database
      await testUser.reload();
      expect(testUser.firstName).toBe(updateData.firstName);
      expect(testUser.lastName).toBe(updateData.lastName);
      expect(testUser.birthYear).toBe(updateData.birthYear);
    });

    test('should fail to update email (should not be allowed)', async () => {
      const updateData = {
        email: 'newemail@example.com'
      };

      await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200); // Should succeed but email should not change

      await testUser.reload();
      expect(testUser.email).toBe(validUserData.email); // Email unchanged
    });

    test('should fail without authentication', async () => {
      const updateData = {
        firstName: 'Updated'
      };

      await request(app)
        .put('/api/auth/profile')
        .send(updateData)
        .expect(401);
    });
  });

  describe('Password Security', () => {
    test('should hash password correctly during registration', async () => {
      const newUser = {
        username: 'secureuser',
        email: 'secure@example.com',
        password: 'SecurePassword123!',
        firstName: 'Secure',
        lastName: 'User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      const createdUser = await User.findOne({ where: { email: newUser.email } });
      
      // Password should be hashed, not plain text
      expect(createdUser.password).not.toBe(newUser.password);
      expect(createdUser.password.length).toBeGreaterThan(50); // Bcrypt hashes are long
      
      // Should be able to verify the password
      const isValid = await bcrypt.compare(newUser.password, createdUser.password);
      expect(isValid).toBe(true);
    });
  });
});