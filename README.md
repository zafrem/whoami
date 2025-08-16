# Whoami - Personality Survey Platform

A multilingual personality assessment web application supporting MBTI, Political Compass, Big Five, and Investment Risk Tolerance surveys. Built with Vue.js 3 frontend and Vercel serverless functions with Neon PostgreSQL backend.

## Features

- Multiple personality survey types with multilingual support (English/Korean)
- User authentication and result history tracking
- Progressive survey interface with real-time progress saving
- Responsive design for desktop and mobile
- Guest mode for anonymous survey taking
- Result analytics and export functionality

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

#### Troubleshooting

- **CORS Errors**: Ensure `CORS_ORIGIN` in `backend/.env` matches your frontend URL
- **WebSocket Errors**: The improved start scripts prevent most WebSocket frame errors
- **Port Conflicts**: Use `./stop.sh --force` to kill processes on conflicting ports
- **Database Issues**: Ensure PostgreSQL is running (start script handles this automatically)

---

# Others My Projects
- Red (Who am I?) : [This Project](https://github.com/zafrem/Who-am-I/blob/main/README.md)
- Orange (How did I live?) : [Life History](https://github.com/zafrem/How-did-I-live/blob/main/README.md)
- Yellow
- Green
- Blue
- Indigo
- Violet


For detailed documentation including API endpoints, configuration options, deployment guides, and development instructions, please visit the [Wiki](../../wiki).
