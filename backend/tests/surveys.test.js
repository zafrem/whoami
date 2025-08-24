const request = require('supertest');
const { describe, test, expect, beforeEach } = require('@jest/globals');
const app = require('./app');
const { Survey } = require('../models');

describe('Survey API Endpoints', () => {
  let testSurvey;
  
  beforeEach(async () => {
    // Create test survey data
    testSurvey = await Survey.create({
      name: { 
        en: 'Test Survey', 
        ko: '테스트 설문조사' 
      },
      description: { 
        en: 'A test survey for unit testing',
        ko: '단위 테스트용 설문조사' 
      },
      category: 'test',
      language: 'en',
      questionsJson: [
        {
          id: 'q1',
          text: 'Test question 1',
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
          text: 'Test question 2',
          type: 'multiple',
          options: [
            { text: 'Option A', value: 'a' },
            { text: 'Option B', value: 'b' },
            { text: 'Option C', value: 'c' }
          ],
          priority: 2
        }
      ],
      analysisJson: {
        traits: ['test_trait_1', 'test_trait_2'],
        scoring: {
          test_trait_1: { q1: 1, q2: 0.5 },
          test_trait_2: { q1: 0.5, q2: 1 }
        }
      },
      estimatedTime: 5,
      difficulty: 'easy',
      tags: ['test', 'unit-testing'],
      baseId: 'test-survey',
      isActive: true,
      surveyTypes: {
        simple: { time: 2, questions: 1, difficulty: 'easy' },
        full: { time: 5, questions: 2, difficulty: 'easy' }
      }
    });
  });

  describe('GET /api/surveys', () => {
    test('should return all active surveys', async () => {
      const response = await request(app)
        .get('/api/surveys?active=true')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const survey = response.body[0];
      expect(survey).toHaveProperty('id');
      expect(survey).toHaveProperty('name');
      expect(survey).toHaveProperty('description');
      expect(survey).toHaveProperty('category');
      expect(survey).toHaveProperty('estimatedTime');
    });

    test('should filter surveys by category', async () => {
      const response = await request(app)
        .get('/api/surveys?category=test&active=true')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(survey => {
        expect(survey.category).toBe('test');
      });
    });

    test('should return all surveys when active=all', async () => {
      // Create inactive survey
      await Survey.create({
        name: { en: 'Inactive Survey' },
        description: { en: 'An inactive test survey' },
        category: 'test',
        language: 'en',
        questionsJson: [{ id: 'q1', text: 'Test', type: 'scale', priority: 1 }],
        analysisJson: { traits: [] },
        isActive: false
      });

      const response = await request(app)
        .get('/api/surveys?active=all')
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/surveys/:id', () => {
    test('should return specific survey by ID', async () => {
      const response = await request(app)
        .get(`/api/surveys/${testSurvey.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(testSurvey.id);
      expect(response.body.name).toBe('Test Survey');
      expect(response.body.isActive).toBe(true);
      expect(response.body).toHaveProperty('baseId');
      expect(response.body).toHaveProperty('surveyTypes');
    });

    test('should return 404 for non-existent survey', async () => {
      const nonExistentId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
      
      await request(app)
        .get(`/api/surveys/${nonExistentId}`)
        .expect(404);
    });

    test('should include questions when includeQuestions=true', async () => {
      const response = await request(app)
        .get(`/api/surveys/${testSurvey.id}?includeQuestions=true`)
        .expect(200);

      expect(response.body).toHaveProperty('questionsJson');
      expect(response.body).toHaveProperty('analysisJson');
      expect(Array.isArray(response.body.questionsJson)).toBe(true);
      expect(response.body.questionsJson.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/surveys/:id/questions', () => {
    test('should return survey questions with default type (full)', async () => {
      const response = await request(app)
        .get(`/api/surveys/${testSurvey.id}/questions`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(testSurvey.id);
      expect(response.body.type).toBe('full');
      expect(response.body.questions).toBeDefined();
      expect(Array.isArray(response.body.questions)).toBe(true);
      expect(response.body.questions.length).toBe(2);
    });

    test('should return filtered questions for simple type', async () => {
      const response = await request(app)
        .get(`/api/surveys/${testSurvey.id}/questions?type=simple`)
        .expect(200);

      expect(response.body.type).toBe('simple');
      expect(response.body.questions.length).toBe(1); // Only priority 1 questions
      expect(response.body.estimatedTime).toBe(2);
    });

    test('should return all questions for full type', async () => {
      const response = await request(app)
        .get(`/api/surveys/${testSurvey.id}/questions?type=full`)
        .expect(200);

      expect(response.body.type).toBe('full');
      expect(response.body.questions.length).toBe(2); // All questions
      expect(response.body.estimatedTime).toBe(5);
    });

    test('should return 404 for non-existent survey', async () => {
      const nonExistentId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
      
      await request(app)
        .get(`/api/surveys/${nonExistentId}/questions`)
        .expect(404);
    });
  });

  describe('GET /api/surveys/:id/stats', () => {
    test('should return survey statistics', async () => {
      const response = await request(app)
        .get(`/api/surveys/${testSurvey.id}/stats`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toHaveProperty('totalResponses');
      expect(response.body).toHaveProperty('avgCompletionTime');
      expect(typeof response.body.totalResponses).toBe('number');
    });

    test('should return 404 for non-existent survey', async () => {
      const nonExistentId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
      
      await request(app)
        .get(`/api/surveys/${nonExistentId}/stats`)
        .expect(404);
    });
  });

  describe('Survey Model Methods', () => {
    test('should get localized name correctly', () => {
      expect(testSurvey.getLocalizedName('en')).toBe('Test Survey');
      expect(testSurvey.getLocalizedName('ko')).toBe('테스트 설문조사');
      expect(testSurvey.getLocalizedName('fr')).toBe('Test Survey'); // fallback to English
    });

    test('should get localized description correctly', () => {
      expect(testSurvey.getLocalizedDescription('en')).toBe('A test survey for unit testing');
      expect(testSurvey.getLocalizedDescription('ko')).toBe('단위 테스트용 설문조사');
      expect(testSurvey.getLocalizedDescription('fr')).toBe('A test survey for unit testing'); // fallback
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed survey ID', async () => {
      await request(app)
        .get('/api/surveys/invalid-uuid')
        .expect(500); // Should handle UUID validation error
    });

    test('should handle invalid query parameters', async () => {
      const response = await request(app)
        .get('/api/surveys?active=invalid')
        .expect(200); // Should default to active=true

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Language Support', () => {
    beforeEach(async () => {
      // Create Korean version of survey
      await Survey.create({
        name: { 
          en: 'Korean Test Survey', 
          ko: '한국어 테스트 설문조사' 
        },
        description: { 
          en: 'Korean language test survey',
          ko: '한국어 언어 테스트 설문조사' 
        },
        category: 'test',
        language: 'ko',
        questionsJson: [
          {
            id: 'q1',
            text: '테스트 질문 1',
            type: 'scale',
            priority: 1
          }
        ],
        analysisJson: { traits: [] },
        baseId: 'test-survey-ko',
        isActive: true
      });
    });

    test('should return English surveys by default', async () => {
      const response = await request(app)
        .get('/api/surveys?active=true')
        .expect(200);

      const englishSurveys = response.body.filter(s => s.name === 'Test Survey');
      expect(englishSurveys.length).toBeGreaterThan(0);
    });

    test('should return Korean surveys with Accept-Language header', async () => {
      const response = await request(app)
        .get('/api/surveys?active=true')
        .set('Accept-Language', 'ko-KR')
        .expect(200);

      const koreanSurveys = response.body.filter(s => s.name === '한국어 테스트 설문조사');
      expect(koreanSurveys.length).toBeGreaterThan(0);
    });
  });
});