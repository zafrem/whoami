const request = require('supertest');
const { describe, test, expect, beforeEach } = require('@jest/globals');
const app = require('./app');
const { User, Survey, Result } = require('../models');
const bcrypt = require('bcryptjs');

describe('Results API Endpoints', () => {
  let testUser;
  let testSurvey;
  let authToken;
  let testResult;

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    testUser = await User.create({
      username: 'resultuser',
      email: 'result@example.com',
      password: hashedPassword,
      firstName: 'Result',
      lastName: 'User',
      isActive: true,
      role: 'user'
    });

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'result@example.com',
        password: 'TestPassword123!'
      });
    
    authToken = loginResponse.body.token;

    // Create test survey
    testSurvey = await Survey.create({
      name: { en: 'Result Test Survey', ko: '결과 테스트 설문조사' },
      description: { en: 'A survey for testing results', ko: '결과 테스트용 설문조사' },
      category: 'test',
      language: 'en',
      questionsJson: [
        {
          id: 'q1',
          text: 'I enjoy social gatherings',
          type: 'scale',
          options: [
            { text: 'Strongly Disagree', value: 1 },
            { text: 'Disagree', value: 2 },
            { text: 'Neutral', value: 3 },
            { text: 'Agree', value: 4 },
            { text: 'Strongly Agree', value: 5 }
          ],
          priority: 1
        },
        {
          id: 'q2',
          text: 'I prefer working alone',
          type: 'scale',
          options: [
            { text: 'Strongly Disagree', value: 1 },
            { text: 'Disagree', value: 2 },
            { text: 'Neutral', value: 3 },
            { text: 'Agree', value: 4 },
            { text: 'Strongly Agree', value: 5 }
          ],
          priority: 2
        }
      ],
      analysisJson: {
        traits: ['extraversion', 'introversion'],
        scoring: {
          extraversion: { q1: 1, q2: -1 },
          introversion: { q1: -1, q2: 1 }
        },
        descriptions: {
          extraversion: {
            high: 'You are highly extraverted',
            medium: 'You are moderately extraverted',
            low: 'You are not very extraverted'
          },
          introversion: {
            high: 'You are highly introverted',
            medium: 'You are moderately introverted', 
            low: 'You are not very introverted'
          }
        }
      },
      estimatedTime: 3,
      difficulty: 'easy',
      baseId: 'result-test-survey',
      isActive: true
    });

    // Create test result
    testResult = await Result.create({
      surveyId: testSurvey.id,
      userId: testUser.id,
      answersJson: {
        q1: 4,
        q2: 2
      },
      resultsJson: {
        scores: {
          extraversion: 75,
          introversion: 25
        },
        analysis: {
          primaryTrait: 'extraversion',
          description: 'You are highly extraverted and enjoy social interactions.'
        }
      },
      timeSpent: 120, // 2 minutes
      isCompleted: true,
      sessionId: 'test-session-123'
    });
  });

  describe('POST /api/results', () => {
    test('should submit survey results successfully', async () => {
      const resultData = {
        surveyId: testSurvey.id,
        answers: {
          q1: 5,
          q2: 1
        },
        timeSpent: 180,
        sessionId: 'new-session-456'
      };

      const response = await request(app)
        .post('/api/results')
        .set('Authorization', `Bearer ${authToken}`)
        .send(resultData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.surveyId).toBe(testSurvey.id);
      expect(response.body.userId).toBe(testUser.id);
      expect(response.body.timeSpent).toBe(resultData.timeSpent);
      expect(response.body.isCompleted).toBe(true);
      expect(response.body.results).toBeDefined();
      expect(response.body.results.scores).toBeDefined();

      // Verify analysis was performed
      expect(response.body.results.scores.extraversion).toBeDefined();
      expect(response.body.results.scores.introversion).toBeDefined();
    });

    test('should submit anonymous results without authentication', async () => {
      const resultData = {
        surveyId: testSurvey.id,
        answers: {
          q1: 3,
          q2: 3
        },
        timeSpent: 90,
        sessionId: 'anonymous-session-789'
      };

      const response = await request(app)
        .post('/api/results')
        .send(resultData)
        .expect(201);

      expect(response.body.userId).toBeNull();
      expect(response.body.sessionId).toBe(resultData.sessionId);
      expect(response.body.results).toBeDefined();
    });

    test('should validate required fields', async () => {
      const invalidResultData = {
        // Missing surveyId and answers
        timeSpent: 60
      };

      const response = await request(app)
        .post('/api/results')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidResultData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should handle non-existent survey', async () => {
      const resultData = {
        surveyId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        answers: { q1: 1 },
        timeSpent: 60
      };

      const response = await request(app)
        .post('/api/results')
        .set('Authorization', `Bearer ${authToken}`)
        .send(resultData)
        .expect(404);

      expect(response.body.error).toContain('Survey not found');
    });

    test('should perform analysis correctly', async () => {
      const resultData = {
        surveyId: testSurvey.id,
        answers: {
          q1: 5, // High extraversion
          q2: 1  // Low introversion (high extraversion)
        },
        timeSpent: 150
      };

      const response = await request(app)
        .post('/api/results')
        .set('Authorization', `Bearer ${authToken}`)
        .send(resultData)
        .expect(201);

      const scores = response.body.results.scores;
      
      // Extraversion should be high (q1: 5*1 + q2: 1*-1 = 4, normalized to high score)
      expect(scores.extraversion).toBeGreaterThan(scores.introversion);
      
      // Primary trait should be extraversion
      expect(response.body.results.analysis.primaryTrait).toBe('extraversion');
    });
  });

  describe('GET /api/results', () => {
    test('should return user results with authentication', async () => {
      const response = await request(app)
        .get('/api/results')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.total).toBeDefined();
      
      if (response.body.results.length > 0) {
        const result = response.body.results[0];
        expect(result.userId).toBe(testUser.id);
        expect(result).toHaveProperty('surveyName');
        expect(result).toHaveProperty('completedAt');
      }
    });

    test('should support pagination', async () => {
      // Create additional results
      for (let i = 0; i < 15; i++) {
        await Result.create({
          surveyId: testSurvey.id,
          userId: testUser.id,
          answersJson: { q1: 3, q2: 3 },
          resultsJson: { scores: {} },
          timeSpent: 60,
          isCompleted: true,
          sessionId: `session-${i}`
        });
      }

      const response = await request(app)
        .get('/api/results?limit=10&offset=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.results.length).toBeLessThanOrEqual(10);
    });

    test('should filter by survey ID', async () => {
      const response = await request(app)
        .get(`/api/results?surveyId=${testSurvey.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.results.forEach(result => {
        expect(result.surveyId).toBe(testSurvey.id);
      });
    });

    test('should require authentication', async () => {
      await request(app)
        .get('/api/results')
        .expect(401);
    });
  });

  describe('GET /api/results/:id', () => {
    test('should return specific result by ID', async () => {
      const response = await request(app)
        .get(`/api/results/${testResult.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testResult.id);
      expect(response.body.surveyId).toBe(testSurvey.id);
      expect(response.body.answers).toBeDefined();
      expect(response.body.results).toBeDefined();
      expect(response.body.survey).toBeDefined();
      expect(response.body.survey.name).toBe('Result Test Survey');
    });

    test('should prevent access to other users results', async () => {
      // Create another user
      const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: hashedPassword,
        isActive: true
      });

      const otherLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@example.com',
          password: 'TestPassword123!'
        });

      const response = await request(app)
        .get(`/api/results/${testResult.id}`)
        .set('Authorization', `Bearer ${otherLoginResponse.body.token}`)
        .expect(404); // Should not find result owned by different user

      expect(response.body.error).toContain('not found');
    });

    test('should return 404 for non-existent result', async () => {
      const nonExistentId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
      
      await request(app)
        .get(`/api/results/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/results/:id/export', () => {
    test('should export result as JSON', async () => {
      const response = await request(app)
        .get(`/api/results/${testResult.id}/export?format=json`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.result).toBeDefined();
      expect(response.body.survey).toBeDefined();
      expect(response.body.exportedAt).toBeDefined();
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('should export result as CSV', async () => {
      const response = await request(app)
        .get(`/api/results/${testResult.id}/export?format=csv`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(typeof response.text).toBe('string');
      expect(response.text).toContain('Question,Answer');
      expect(response.headers['content-type']).toMatch(/text\/csv/);
    });

    test('should default to JSON format', async () => {
      const response = await request(app)
        .get(`/api/results/${testResult.id}/export`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('POST /api/results/compare', () => {
    let secondResult;

    beforeEach(async () => {
      secondResult = await Result.create({
        surveyId: testSurvey.id,
        userId: testUser.id,
        answersJson: { q1: 2, q2: 4 },
        resultsJson: {
          scores: { extraversion: 30, introversion: 70 },
          analysis: { primaryTrait: 'introversion' }
        },
        timeSpent: 100,
        isCompleted: true,
        sessionId: 'compare-session'
      });
    });

    test('should compare two results successfully', async () => {
      const compareData = {
        resultId1: testResult.id,
        resultId2: secondResult.id
      };

      const response = await request(app)
        .post('/api/results/compare')
        .set('Authorization', `Bearer ${authToken}`)
        .send(compareData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.result1).toBeDefined();
      expect(response.body.result2).toBeDefined();
      expect(response.body.comparison).toBeDefined();
      expect(response.body.comparison.scoreDifferences).toBeDefined();
      expect(response.body.comparison.compatibility).toBeDefined();
    });

    test('should calculate score differences correctly', async () => {
      const compareData = {
        resultId1: testResult.id,
        resultId2: secondResult.id
      };

      const response = await request(app)
        .post('/api/results/compare')
        .set('Authorization', `Bearer ${authToken}`)
        .send(compareData)
        .expect(200);

      const differences = response.body.comparison.scoreDifferences;
      
      // testResult: extraversion 75, introversion 25
      // secondResult: extraversion 30, introversion 70
      expect(Math.abs(differences.extraversion)).toBe(45); // |75-30|
      expect(Math.abs(differences.introversion)).toBe(45); // |25-70|
    });

    test('should prevent comparing results from different users', async () => {
      // Create result from different user
      const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
      const otherUser = await User.create({
        username: 'compareuser',
        email: 'compare@example.com',
        password: hashedPassword,
        isActive: true
      });

      const otherResult = await Result.create({
        surveyId: testSurvey.id,
        userId: otherUser.id,
        answersJson: { q1: 3 },
        resultsJson: { scores: {} },
        isCompleted: true
      });

      const compareData = {
        resultId1: testResult.id,
        resultId2: otherResult.id
      };

      const response = await request(app)
        .post('/api/results/compare')
        .set('Authorization', `Bearer ${authToken}`)
        .send(compareData)
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('Result Analysis Engine', () => {
    test('should handle edge cases in scoring', async () => {
      const extremeData = {
        surveyId: testSurvey.id,
        answers: {
          q1: 1, // Minimum
          q2: 5  // Maximum
        },
        timeSpent: 60
      };

      const response = await request(app)
        .post('/api/results')
        .set('Authorization', `Bearer ${authToken}`)
        .send(extremeData)
        .expect(201);

      const scores = response.body.results.scores;
      
      // Should handle extreme values correctly
      expect(scores.extraversion).toBeDefined();
      expect(scores.introversion).toBeDefined();
      expect(scores.extraversion).toBeGreaterThanOrEqual(0);
      expect(scores.extraversion).toBeLessThanOrEqual(100);
      expect(scores.introversion).toBeGreaterThanOrEqual(0);
      expect(scores.introversion).toBeLessThanOrEqual(100);
    });

    test('should provide appropriate descriptions based on scores', async () => {
      const highExtraversionData = {
        surveyId: testSurvey.id,
        answers: { q1: 5, q2: 1 },
        timeSpent: 60
      };

      const response = await request(app)
        .post('/api/results')
        .set('Authorization', `Bearer ${authToken}`)
        .send(highExtraversionData)
        .expect(201);

      const analysis = response.body.results.analysis;
      expect(analysis.primaryTrait).toBe('extraversion');
      expect(analysis.descriptions.extraversion).toBeDefined();
      expect(typeof analysis.descriptions.extraversion).toBe('string');
    });
  });
});