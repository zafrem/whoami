# API Documentation - Whoami Personality Survey Platform

This document provides comprehensive documentation for all API endpoints available in the Whoami Personality Survey Platform.

## 🔗 Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.vercel.app/api`

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Types
- **Required**: Endpoint requires valid JWT token
- **Optional**: Endpoint works with or without token (provides different data based on auth status)
- **Public**: No authentication required

## 📊 Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Optional detailed error information"
}
```

## 🛠 Health Check

### GET /health
Check API service status and environment information.

**Authentication**: Public

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "uptime": 1234567
}
```

## 🧪 Testing

The API includes comprehensive unit tests covering all endpoints and functionality:

### Running Tests
```bash
# Backend API Tests
cd backend
npx jest                           # Run all tests
npx jest --watch                   # Run tests in watch mode  
npx jest tests/api.simple.test.js  # Run specific test file
npx jest --coverage                # Run tests with coverage report

# Frontend Component Tests
cd frontend
npm test                          # Run all frontend tests
npm run test:ui                   # Run tests with UI
npm run test:run                  # Run tests once and exit
```

### Test Coverage
- **API Endpoints**: All routes tested for proper responses and error handling
- **Authentication**: JWT token validation and authorization checks
- **Survey Operations**: Survey retrieval, question loading, and result submission
- **Group Management**: Group creation, joining, and analytics
- **Admin Functions**: Administrative operations and access control
- **Error Handling**: Malformed requests, validation errors, and server errors
- **Security**: CORS headers, rate limiting, and input sanitization

---

## 👤 Authentication Endpoints

### POST /auth/register
Register a new user account.

**Authentication**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "username": "myusername"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "myusername",
      "role": "user"
    },
    "token": "jwt-token-here"
  }
}
```

### POST /auth/login
Authenticate user and get access token.

**Authentication**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "myusername",
      "role": "user"
    },
    "token": "jwt-token-here"
  }
}
```

### POST /auth/refresh
Refresh JWT token.

**Authentication**: Public

**Request Body**:
```json
{
  "refreshToken": "refresh-token-here"
}
```

### GET /auth/profile
Get current user profile.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "myusername",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /auth/profile
Update user profile.

**Authentication**: Required

**Request Body**:
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

### PUT /auth/change-password
Change user password.

**Authentication**: Required

**Request Body**:
```json
{
  "currentPassword": "currentPassword123",
  "newPassword": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

---

## 📋 Survey Endpoints

### GET /surveys
Get all available surveys.

**Authentication**: Public

**Query Parameters**:
- `language` (optional): Filter by language (en, ko)
- `category` (optional): Filter by survey category

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "MBTI Personality Assessment",
      "description": "Discover your Myers-Briggs personality type",
      "category": "personality",
      "language": "en",
      "questionCount": 60,
      "estimatedTime": 15,
      "isActive": true
    }
  ]
}
```

### GET /surveys/:id
Get specific survey details.

**Authentication**: Public

**Parameters**:
- `id`: Survey ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "MBTI Personality Assessment",
    "description": "Comprehensive MBTI assessment",
    "category": "personality",
    "language": "en",
    "instructions": "Answer each question honestly...",
    "questionCount": 60,
    "estimatedTime": 15,
    "isActive": true
  }
}
```

### GET /surveys/:id/questions
Get survey questions.

**Authentication**: Public

**Parameters**:
- `id`: Survey ID

**Response**:
```json
{
  "success": true,
  "data": {
    "surveyId": 1,
    "questions": [
      {
        "id": "q1",
        "text": "You feel more energized by being around people",
        "type": "scale",
        "options": [
          { "value": 1, "text": "Strongly Disagree" },
          { "value": 2, "text": "Disagree" },
          { "value": 3, "text": "Neutral" },
          { "value": 4, "text": "Agree" },
          { "value": 5, "text": "Strongly Agree" }
        ]
      }
    ]
  }
}
```

### GET /surveys/:id/stats
Get survey statistics.

**Authentication**: Public

**Parameters**:
- `id`: Survey ID

**Response**:
```json
{
  "success": true,
  "data": {
    "totalResponses": 1250,
    "averageCompletionTime": 12.5,
    "completionRate": 0.87,
    "demographics": {
      "byAge": { "18-25": 450, "26-35": 520, "36-45": 180, "45+": 100 },
      "byGender": { "male": 600, "female": 580, "other": 70 }
    }
  }
}
```

### POST /surveys
Create new survey (Admin only).

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "title": "New Survey",
  "description": "Survey description",
  "category": "personality",
  "language": "en",
  "questions": [
    {
      "id": "q1",
      "text": "Question text",
      "type": "scale",
      "options": [...]
    }
  ]
}
```

### PUT /surveys/:id
Update existing survey (Admin only).

**Authentication**: Required (Admin)

**DELETE /surveys/:id
Delete survey (Admin only).

**Authentication**: Required (Admin)

---

## 📊 Results Endpoints

### POST /results
Submit survey results.

**Authentication**: Optional

**Request Body**:
```json
{
  "surveyId": 1,
  "answers": [
    { "questionId": "q1", "value": 4 },
    { "questionId": "q2", "value": 2 }
  ],
  "demographics": {
    "age": 25,
    "gender": "female"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "resultId": "abc123def456",
    "surveyTitle": "MBTI Personality Assessment",
    "personality": {
      "type": "ENFP",
      "dimensions": {
        "E": 65, "I": 35,
        "N": 72, "S": 28,
        "F": 58, "T": 42,
        "P": 61, "J": 39
      }
    },
    "description": "The Campaigner - Enthusiastic, creative...",
    "shareUrl": "https://app.com/results/abc123def456"
  }
}
```

### GET /results
Get user's survey results.

**Authentication**: Required

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "abc123def456",
        "surveyTitle": "MBTI Personality Assessment",
        "personality": { "type": "ENFP" },
        "completedAt": "2024-01-01T00:00:00.000Z",
        "shareUrl": "https://app.com/results/abc123def456"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### GET /results/:id
Get specific result details.

**Authentication**: Optional

**Parameters**:
- `id`: Result ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "abc123def456",
    "surveyTitle": "MBTI Personality Assessment",
    "personality": {
      "type": "ENFP",
      "dimensions": {
        "E": 65, "I": 35,
        "N": 72, "S": 28,
        "F": 58, "T": 42,
        "P": 61, "J": 39
      }
    },
    "description": "Detailed personality description...",
    "strengths": ["Creative", "Enthusiastic", "People-focused"],
    "weaknesses": ["Disorganized", "Unfocused", "Overly emotional"],
    "careers": ["Marketing", "Teaching", "Counseling"],
    "compatibleTypes": ["INTJ", "INFJ"],
    "completedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /results/:resultId1/compare/:resultId2
Compare two personality results.

**Authentication**: Required

**Parameters**:
- `resultId1`: First result ID
- `resultId2`: Second result ID

**Response**:
```json
{
  "success": true,
  "data": {
    "comparison": {
      "compatibility": 0.78,
      "similarities": ["Both are intuitive", "Both prefer flexibility"],
      "differences": ["Introversion vs Extraversion", "Thinking vs Feeling"],
      "relationship": {
        "type": "Complementary",
        "description": "These types often work well together...",
        "tips": ["Communicate openly", "Respect differences"]
      }
    },
    "result1": { "type": "ENFP", "dimensions": {...} },
    "result2": { "type": "INTJ", "dimensions": {...} }
  }
}
```

### GET /results/:id/export
Export result data.

**Authentication**: Required

**Parameters**:
- `id`: Result ID

**Query Parameters**:
- `format`: Export format (pdf, json, csv)

**Response**: File download or JSON data

---

## 👥 Group Endpoints

### GET /groups
Get all public groups.

**Authentication**: Public

**Query Parameters**:
- `scope` (optional): Filter by scope (public, private)
- `page` (optional): Page number
- `limit` (optional): Groups per page

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Startup Team Assessment",
      "description": "Personality assessment for our startup team",
      "scope": "public",
      "memberCount": 8,
      "createdBy": "john_doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /groups/user
Get user's groups.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "ownedGroups": [...],
    "memberGroups": [...]
  }
}
```

### GET /groups/:id
Get specific group details.

**Authentication**: Public (limited info) / Required (full access)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Startup Team Assessment",
    "description": "Team personality assessment",
    "scope": "public",
    "members": [
      {
        "id": 1,
        "username": "john_doe",
        "joinedAt": "2024-01-01T00:00:00.000Z",
        "hasCompletedSurvey": true,
        "personalityType": "ENFP"
      }
    ],
    "surveys": [
      {
        "id": 1,
        "title": "MBTI Assessment",
        "completionRate": 0.75
      }
    ],
    "analytics": {
      "memberCount": 8,
      "completionRate": 0.75,
      "personalityDistribution": {
        "ENFP": 2, "INTJ": 1, "ESFJ": 3, "ISTP": 2
      }
    }
  }
}
```

### POST /groups
Create new group.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "My Team Assessment",
  "description": "Personality assessment for my team",
  "scope": "public",
  "surveyId": 1
}
```

### POST /groups/:id/join
Join a group.

**Authentication**: Required

**Parameters**:
- `id`: Group ID

### DELETE /groups/:id/leave
Leave a group.

**Authentication**: Required

### DELETE /groups/:id
Delete a group (owner only).

**Authentication**: Required

### POST /groups/:id/match
Perform LLM-powered group matching analysis.

**Authentication**: Required

**Parameters**:
- `id`: Group ID

**Response**:
```json
{
  "success": true,
  "data": {
    "matchingId": "match_123",
    "analysis": {
      "teamCompatibility": 0.82,
      "strengths": ["Diverse thinking styles", "Balanced personality mix"],
      "challenges": ["Communication preferences vary", "Decision-making conflicts"],
      "recommendations": [
        "Establish clear communication protocols",
        "Assign roles based on personality strengths"
      ],
      "pairings": [
        {
          "member1": "john_doe",
          "member2": "jane_smith",
          "compatibility": 0.91,
          "relationship": "Highly compatible working pair"
        }
      ]
    }
  }
}
```

### GET /groups/:id/matching-history
Get group matching history.

**Authentication**: Required

---

## 🔧 Admin Endpoints

All admin endpoints require authentication and admin role.

### GET /admin/dashboard
Get admin dashboard statistics.

**Authentication**: Required (Admin)

**Response**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 1250,
      "totalSurveys": 8,
      "totalResults": 3400,
      "totalGroups": 45
    },
    "recentActivity": [...],
    "systemHealth": {
      "database": "healthy",
      "api": "healthy",
      "llm": "healthy"
    }
  }
}
```

### GET /admin/surveys
Get all surveys for management.

**Authentication**: Required (Admin)

### POST /admin/surveys
Create new survey.

**Authentication**: Required (Admin)

### PUT /admin/surveys/:id
Update survey.

**Authentication**: Required (Admin)

### DELETE /admin/surveys/:id
Delete survey.

**Authentication**: Required (Admin)

### GET /admin/users
Get all users for management.

**Authentication**: Required (Admin)

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Users per page
- `search` (optional): Search by email/username

### PUT /admin/users/:id
Update user details.

**Authentication**: Required (Admin)

### GET /admin/groups
Get all groups for management.

**Authentication**: Required (Admin)

### GET /admin/llm-configs
Get LLM configurations.

**Authentication**: Required (Admin)

### POST /admin/llm-configs
Create LLM configuration.

**Authentication**: Required (Admin)

### PUT /admin/llm-configs/:id
Update LLM configuration.

**Authentication**: Required (Admin)

### DELETE /admin/llm-configs/:id
Delete LLM configuration.

**Authentication**: Required (Admin)

### POST /admin/llm-configs/:id/test
Test LLM configuration.

**Authentication**: Required (Admin)

### GET /admin/llm-logs
Get LLM usage logs.

**Authentication**: Required (Admin)

### GET /admin/llm-logs/:id
Get specific LLM log details.

**Authentication**: Required (Admin)

---

## 📊 Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default**: 100 requests per 15 minutes per IP
- **Admin endpoints**: May have different limits
- **Anonymous endpoints**: May have stricter limits

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## 📝 Examples

### Complete Survey Flow Example

```javascript
// 1. Get available surveys
const surveys = await fetch('/api/surveys');

// 2. Get specific survey questions
const questions = await fetch('/api/surveys/1/questions');

// 3. Submit survey responses
const result = await fetch('/api/results', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    surveyId: 1,
    answers: [
      { questionId: 'q1', value: 4 },
      { questionId: 'q2', value: 2 }
    ]
  })
});

// 4. Get detailed results
const detailedResult = await fetch(`/api/results/${result.data.resultId}`);
```

### Group Management Example

```javascript
// 1. Create a group
const group = await fetch('/api/groups', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({
    name: 'My Team',
    description: 'Team personality assessment',
    scope: 'public',
    surveyId: 1
  })
});

// 2. Join the group (other users)
await fetch(`/api/groups/${group.data.id}/join`, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token }
});

// 3. Perform group matching
const matching = await fetch(`/api/groups/${group.data.id}/match`, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token }
});
```

---

This API documentation covers all available endpoints in the Whoami Personality Survey Platform. For additional support or questions, please refer to the main documentation or contact the development team.