const request = require('supertest');
const { describe, test, expect, beforeEach } = require('@jest/globals');
const app = require('./app');
const { User, Group } = require('../models');
const bcrypt = require('bcryptjs');

describe('Group API Endpoints', () => {
  let testUser;
  let authToken;
  let testGroup;

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    testUser = await User.create({
      username: 'groupuser',
      email: 'group@example.com',
      password: hashedPassword,
      firstName: 'Group',
      lastName: 'User',
      isActive: true,
      role: 'user'
    });

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'group@example.com',
        password: 'TestPassword123!'
      });
    
    authToken = loginResponse.body.token;

    // Create test group
    testGroup = await Group.create({
      name: 'Test Group',
      description: 'A test group for unit testing',
      maxParticipants: 5,
      currentParticipants: 1,
      matchingType: '1:N',
      isActive: true,
      isPublic: false,
      createdBy: testUser.id
    });
  });

  describe('GET /api/groups', () => {
    test('should return all active groups', async () => {
      const response = await request(app)
        .get('/api/groups')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.groups).toBeDefined();
      expect(Array.isArray(response.body.groups)).toBe(true);
      expect(response.body.total).toBeDefined();
      expect(typeof response.body.total).toBe('number');

      if (response.body.groups.length > 0) {
        const group = response.body.groups[0];
        expect(group).toHaveProperty('id');
        expect(group).toHaveProperty('name');
        expect(group).toHaveProperty('maxParticipants');
        expect(group).toHaveProperty('currentParticipants');
        expect(group).toHaveProperty('matchingType');
      }
    });

    test('should support pagination', async () => {
      // Create more groups
      for (let i = 0; i < 15; i++) {
        await Group.create({
          name: `Test Group ${i}`,
          description: `Test group ${i}`,
          maxParticipants: 5,
          matchingType: '1:N',
          createdBy: testUser.id,
          isActive: true
        });
      }

      const response = await request(app)
        .get('/api/groups?limit=10&offset=5')
        .expect(200);

      expect(response.body.groups.length).toBeLessThanOrEqual(10);
    });

    test('should filter public groups only when specified', async () => {
      // Create public group
      await Group.create({
        name: 'Public Test Group',
        description: 'A public test group',
        maxParticipants: 10,
        matchingType: '1:1',
        isPublic: true,
        isActive: true,
        createdBy: testUser.id
      });

      const response = await request(app)
        .get('/api/groups?publicOnly=true')
        .expect(200);

      response.body.groups.forEach(group => {
        expect(group.isPublic).toBe(true);
      });
    });
  });

  describe('POST /api/groups', () => {
    test('should create a new group successfully', async () => {
      const newGroup = {
        name: 'New Test Group',
        description: 'A new test group',
        maxParticipants: 8,
        matchingType: '1:1',
        isPublic: false
      };

      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newGroup)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe(newGroup.name);
      expect(response.body.description).toBe(newGroup.description);
      expect(response.body.maxParticipants).toBe(newGroup.maxParticipants);
      expect(response.body.matchingType).toBe(newGroup.matchingType);
      expect(response.body.createdBy).toBe(testUser.id);
      expect(response.body.currentParticipants).toBe(1); // Creator is automatically added

      // Verify in database
      const createdGroup = await Group.findByPk(response.body.id);
      expect(createdGroup).toBeTruthy();
      expect(createdGroup.name).toBe(newGroup.name);
    });

    test('should create group with retention time', async () => {
      const groupWithRetention = {
        name: 'Temporary Group',
        description: 'A group with retention time',
        maxParticipants: 5,
        matchingType: '1:N',
        retentionHours: 24
      };

      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(groupWithRetention)
        .expect(201);

      expect(response.body.retentionHours).toBe(24);
      expect(response.body.expiresAt).toBeDefined();
      expect(new Date(response.body.expiresAt)).toBeInstanceOf(Date);
    });

    test('should create public group with scope criteria', async () => {
      const publicGroup = {
        name: 'Public Group',
        description: 'A public group with criteria',
        maxParticipants: 10,
        matchingType: '1:N',
        isPublic: true,
        publicScope: {
          countries: ['United States', 'Canada'],
          minAge: 18,
          maxAge: 65,
          regions: ['California', 'New York']
        }
      };

      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(publicGroup)
        .expect(201);

      expect(response.body.isPublic).toBe(true);
      expect(response.body.publicScope).toBeDefined();
      expect(response.body.publicScope.countries).toEqual(publicGroup.publicScope.countries);
      expect(response.body.publicScope.minAge).toBe(publicGroup.publicScope.minAge);
    });

    test('should fail without authentication', async () => {
      const newGroup = {
        name: 'Unauthorized Group',
        maxParticipants: 5,
        matchingType: '1:N'
      };

      await request(app)
        .post('/api/groups')
        .send(newGroup)
        .expect(401);
    });

    test('should validate group data', async () => {
      const invalidGroup = {
        // Missing required fields
        maxParticipants: 1, // Too low
        matchingType: 'invalid'
      };

      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidGroup)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should validate retention time limits', async () => {
      const invalidRetentionGroup = {
        name: 'Invalid Retention',
        maxParticipants: 5,
        matchingType: '1:N',
        retentionHours: 500 // Exceeds 2 weeks (336 hours)
      };

      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRetentionGroup)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });
  });

  describe('GET /api/groups/:id', () => {
    test('should return specific group by ID', async () => {
      const response = await request(app)
        .get(`/api/groups/${testGroup.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(testGroup.id);
      expect(response.body.name).toBe(testGroup.name);
      expect(response.body.creator).toBeDefined();
      expect(response.body.creator.username).toBe(testUser.username);
    });

    test('should return group with member hashes for privacy', async () => {
      const response = await request(app)
        .get(`/api/groups/${testGroup.id}`)
        .expect(200);

      expect(response.body.memberHashes).toBeDefined();
      expect(Array.isArray(response.body.memberHashes)).toBe(true);
    });

    test('should return 404 for non-existent group', async () => {
      const nonExistentId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
      
      await request(app)
        .get(`/api/groups/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('POST /api/groups/:id/join', () => {
    let secondUser;
    let secondAuthToken;

    beforeEach(async () => {
      // Create second user to join group
      const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
      secondUser = await User.create({
        username: 'joiner',
        email: 'joiner@example.com',
        password: hashedPassword,
        firstName: 'Group',
        lastName: 'Joiner',
        isActive: true
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'joiner@example.com',
          password: 'TestPassword123!'
        });
      
      secondAuthToken = loginResponse.body.token;
    });

    test('should allow user to join group', async () => {
      const response = await request(app)
        .post(`/api/groups/${testGroup.id}/join`)
        .set('Authorization', `Bearer ${secondAuthToken}`)
        .expect(200);

      expect(response.body.message).toContain('joined');

      // Verify group participant count increased
      await testGroup.reload();
      expect(testGroup.currentParticipants).toBe(2);
    });

    test('should prevent joining full group', async () => {
      // Fill up the group
      await testGroup.update({ 
        currentParticipants: testGroup.maxParticipants 
      });

      const response = await request(app)
        .post(`/api/groups/${testGroup.id}/join`)
        .set('Authorization', `Bearer ${secondAuthToken}`)
        .expect(400);

      expect(response.body.error).toContain('full');
    });

    test('should prevent joining same group twice', async () => {
      // Join once
      await request(app)
        .post(`/api/groups/${testGroup.id}/join`)
        .set('Authorization', `Bearer ${secondAuthToken}`)
        .expect(200);

      // Try to join again
      const response = await request(app)
        .post(`/api/groups/${testGroup.id}/join`)
        .set('Authorization', `Bearer ${secondAuthToken}`)
        .expect(400);

      expect(response.body.error).toContain('already');
    });

    test('should fail without authentication', async () => {
      await request(app)
        .post(`/api/groups/${testGroup.id}/join`)
        .expect(401);
    });
  });

  describe('DELETE /api/groups/:id', () => {
    test('should allow creator to delete group', async () => {
      const response = await request(app)
        .delete(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('deleted');

      // Verify group is deleted
      const deletedGroup = await Group.findByPk(testGroup.id);
      expect(deletedGroup).toBeNull();
    });

    test('should prevent non-creator from deleting group', async () => {
      // Create another user
      const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: hashedPassword,
        firstName: 'Other',
        lastName: 'User',
        isActive: true
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@example.com',
          password: 'TestPassword123!'
        });

      const response = await request(app)
        .delete(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .expect(403);

      expect(response.body.error).toContain('permission');
    });

    test('should fail without authentication', async () => {
      await request(app)
        .delete(`/api/groups/${testGroup.id}`)
        .expect(401);
    });
  });

  describe('Group Expiration Logic', () => {
    test('should respect group expiration for access', async () => {
      // Create expired group
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1); // 1 hour ago

      const expiredGroup = await Group.create({
        name: 'Expired Group',
        description: 'This group has expired',
        maxParticipants: 5,
        matchingType: '1:N',
        retentionHours: 1,
        expiresAt: pastDate,
        createdBy: testUser.id,
        isActive: true
      });

      // Test expiration method
      expect(expiredGroup.isExpired()).toBe(true);
      
      // Creator should still have access
      expect(expiredGroup.canUserAccess(testUser.id)).toBe(true);
      
      // Other users should not have access
      expect(expiredGroup.canUserAccess('other-user-id')).toBe(false);
    });

    test('should allow access to non-expired groups', async () => {
      // Create future-expiring group
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 24); // 24 hours from now

      const activeGroup = await Group.create({
        name: 'Active Group',
        description: 'This group is still active',
        maxParticipants: 5,
        matchingType: '1:N',
        retentionHours: 24,
        expiresAt: futureDate,
        createdBy: testUser.id,
        isActive: true
      });

      expect(activeGroup.isExpired()).toBe(false);
      expect(activeGroup.canUserAccess(testUser.id)).toBe(true);
      expect(activeGroup.canUserAccess('other-user-id')).toBe(true);
    });

    test('should handle groups without expiration', async () => {
      const permanentGroup = await Group.create({
        name: 'Permanent Group',
        description: 'This group never expires',
        maxParticipants: 5,
        matchingType: '1:N',
        // No retentionHours or expiresAt
        createdBy: testUser.id,
        isActive: true
      });

      expect(permanentGroup.isExpired()).toBe(false);
      expect(permanentGroup.canUserAccess(testUser.id)).toBe(true);
      expect(permanentGroup.canUserAccess('other-user-id')).toBe(true);
    });
  });
});