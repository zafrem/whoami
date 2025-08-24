# Whoami - Personality Survey Platform

A comprehensive multilingual personality assessment web application supporting MBTI, Political Compass, Big Five, and Investment Risk Tolerance surveys. Built with Vue.js 3 frontend and Vercel serverless functions with Neon PostgreSQL backend.

## ✨ Features

- **Multiple Survey Types**: MBTI, Political Compass, Big Five, Investment Risk Tolerance
- **Multilingual Support**: Full support for English and Korean languages
- **User Management**: Complete authentication system with profiles and result history
- **Progressive Interface**: Real-time progress saving and intuitive survey experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Guest Mode**: Anonymous survey taking without registration
- **Analytics & Export**: Comprehensive result analytics and export functionality
- **Group Management**: Create and manage survey groups for team assessments
- **Admin Dashboard**: Full administrative interface for platform management
- **LLM Integration**: AI-powered analysis and insights for survey results
- **Comprehensive Testing**: Full unit test coverage for both backend APIs and frontend components

## Demo
![demo](./image/demo.gif)

## How to Run

### Production Deployment

1. **Deploy to Vercel**: Connect your GitHub repository to Vercel
2. **Create Neon Database**: Get a free PostgreSQL database at [neon.tech](https://neon.tech)
3. **Configure Environment Variables**:
   ```env
   DATABASE_URL=postgresql://username:password@hostname/database
   JWT_SECRET=your_64_character_random_jwt_secret_key_here
   ```
4. **Initialize Database**: Visit `/api/migrate-db` endpoint once after deployment

### Local Development

#### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd whoami

# Start the application (automatically installs dependencies)
./start.sh
```

The application will be available at:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000`
- Health Check: `http://localhost:3000/api/health`

#### Available Commands

**Start Application:**
```bash
./start.sh                    # Start in development mode (native)
./start.sh --docker           # Start using Docker containers
./start.sh --mode production  # Start in production mode
./start.sh --detached         # Start in background mode
```

**Stop Application:**
```bash
./stop.sh                     # Stop native processes
./stop.sh --docker            # Stop Docker containers
./stop.sh --force             # Force kill all processes
```

#### Manual Setup (Alternative)

If you prefer manual setup:

```bash
# Backend setup
cd backend
npm install
cp .env.example .env          # Configure your environment
npm run dev                   # Start backend on port 3000

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev                   # Start frontend on port 8080
```

#### Environment Configuration

The backend requires a `.env` file. Copy from `.env.example` and configure:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=personality_survey
DB_USER=postgres
DB_PASSWORD=password

# CORS Configuration
CORS_ORIGIN=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

#### Testing

**Frontend Tests**
```bash
cd frontend
npm test                      # Run all frontend unit tests
npm run test:ui              # Run tests with UI
npm run test:run             # Run tests once and exit
```

**Backend Tests**
```bash
cd backend
npx jest                     # Run all backend API tests
npx jest --watch             # Run tests in watch mode
npx jest tests/api.simple.test.js  # Run specific test file
```

**Test Coverage**
- Frontend: Comprehensive Vue component testing with Vitest
- Backend: API endpoint testing with Jest and Supertest
- Both test suites include mocking, error handling, and integration tests

#### Troubleshooting

- **CORS Errors**: Ensure `CORS_ORIGIN` in `backend/.env` matches your frontend URL
- **WebSocket Errors**: The improved start scripts prevent most WebSocket frame errors
- **Port Conflicts**: Use `./stop.sh --force` to kill processes on conflicting ports
- **Database Issues**: Ensure PostgreSQL is running (start script handles this automatically)
- **Test Database**: Backend tests require a test database configuration

---

# Others My Projects
- Red (Who am I?) : [This Project](https://github.com/zafrem/Who-am-I/blob/main/README.md)
- Orange (How did I live?) : [Life History](https://github.com/zafrem/How-did-I-live/blob/main/README.md)
- Yellow (What am I not seeing?)
- Green (What should I choose?)
- Blue (How shall I live?)
- Indigo (What do I need to heal?)
- Violet (What is my next aligned step?)


## 📚 Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](./SETUP.md) | Complete development environment setup guide |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment with Vercel + Neon |
| [DOCKER.md](./DOCKER.md) | Docker containerization and deployment |
| [SYSTEM_REQUIREMENTS.md](./SYSTEM_REQUIREMENTS.md) | Hardware/software requirements and dependencies |
| [API.md](./API.md) | Complete API documentation and endpoints |
| [USER.md](./USER.md) | User guide and feature documentation |
| [ADMIN.md](./ADMIN.md) | Administrative interface and management guide |

For additional detailed documentation including configuration options and advanced guides, please visit the [Wiki](../../wiki).
