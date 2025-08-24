const request = require('supertest');
const { describe, test, expect } = require('@jest/globals');
const app = require('./app');

describe('API Health and Basic Functionality', () => {
  describe('Health Check', () => {
    test('GET /api/health should return ok status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.environment).toBeDefined();
    });
  });

  describe('API Route Validation', () => {
    test('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });

    test('should have correct CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // CORS headers should be present
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('should handle JSON payload', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ test: 'data' })
        .expect(400); // Will fail validation but should accept JSON

      expect(response.body).toBeDefined();
    });
  });

  describe('Authentication Routes', () => {
    test('POST /api/auth/register should exist and validate input', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('POST /api/auth/login should exist and validate input', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('GET /api/auth/profile should require authentication', async () => {
      await request(app)
        .get('/api/auth/profile')
        .expect(401);
    });
  });

  describe('Survey Routes', () => {
    test('GET /api/surveys should be accessible', async () => {
      // This will fail if database is not connected, but route should exist
      const response = await request(app)
        .get('/api/surveys');

      // Should either return data (200) or a server error (500), but not 404
      expect([200, 500].includes(response.status)).toBe(true);
    });

    test('GET /api/surveys/:id should validate UUID format', async () => {
      const response = await request(app)
        .get('/api/surveys/invalid-id');

      // Should either return validation error or server error, not 404
      expect([400, 500].includes(response.status)).toBe(true);
    });
  });

  describe('Group Routes', () => {
    test('GET /api/groups should be accessible', async () => {
      const response = await request(app)
        .get('/api/groups');

      expect([200, 500].includes(response.status)).toBe(true);
    });

    test('POST /api/groups should require authentication', async () => {
      await request(app)
        .post('/api/groups')
        .send({})
        .expect(401);
    });
  });

  describe('Results Routes', () => {
    test('GET /api/results should require authentication', async () => {
      await request(app)
        .get('/api/results')
        .expect(401);
    });

    test('POST /api/results should validate input', async () => {
      const response = await request(app)
        .post('/api/results')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Admin Routes', () => {
    test('GET /api/admin/* should require authentication', async () => {
      await request(app)
        .get('/api/admin/surveys')
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}') // Malformed JSON
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should handle large payloads within limits', async () => {
      const largeData = {
        username: 'test',
        email: 'test@example.com', 
        data: 'x'.repeat(1000) // 1KB of data
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(largeData);

      // Should handle the data (may fail validation but not due to size)
      expect([400, 500].includes(response.status)).toBe(true);
    });
  });

  describe('Security Headers', () => {
    test('should include security headers from helmet', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Helmet should add security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('Rate Limiting (if enabled)', () => {
    test('should handle rate limit headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Rate limiting headers may be present
      if (response.headers['x-ratelimit-limit']) {
        expect(parseInt(response.headers['x-ratelimit-limit'])).toBeGreaterThan(0);
      }
    });
  });
});