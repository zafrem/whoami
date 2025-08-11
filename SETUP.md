# Setup Guide - Personality Survey Platform

This guide will walk you through setting up the Personality Survey Platform on your local development environment.

## 📋 Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (version 16 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify: `node --version` and `npm --version`

- **PostgreSQL** (version 12 or higher)
  - Download from [postgresql.org](https://www.postgresql.org/download/)
  - Verify: `psql --version`

- **Git**
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify: `git --version`

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
# Clone the repository (replace with your actual repository URL)
git clone <your-repository-url>
cd whoami
```

### Step 2: Database Setup

#### Create PostgreSQL Database

1. **Start PostgreSQL service** (if not already running)

2. **Connect to PostgreSQL**:
   ```bash
   # Using psql command line
   psql -U postgres
   ```

3. **Create database and user**:
   ```sql
   -- Create the database
   CREATE DATABASE personality_survey;
   
   -- Create a user (optional, you can use postgres user)
   CREATE USER survey_user WITH PASSWORD 'your_secure_password';
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE personality_survey TO survey_user;
   
   -- Exit psql
   \q
   ```

### Step 3: Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment configuration**:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```

4. **Edit the `.env` file** with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_EXPIRE=7d

   # Database configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=personality_survey
   DB_USER=survey_user
   DB_PASSWORD=your_secure_password

   # CORS configuration
   CORS_ORIGIN=http://localhost:8080

   # Rate limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   ```

   **Important**: Replace the following with your own values:
   - `JWT_SECRET`: Generate a secure random string (at least 32 characters)
   - `DB_USER` and `DB_PASSWORD`: Match what you set up in PostgreSQL

5. **Seed the database** with sample surveys:
   ```bash
   npm run seed
   ```
   
   This will:
   - Create all necessary database tables
   - Insert sample surveys (MBTI, Political Compass, Big Five, Investment Risk)

6. **Start the backend server**:
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   Database connection established successfully.
   Database synchronized.
   🌱 Seeding completed (if running for the first time)
   Server is running on port 3000
   ```

### Step 4: Frontend Setup

1. **Open a new terminal** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   VITE v4.x.x ready in xxxx ms
   
   ➜  Local:   http://localhost:8080/
   ➜  Network: use --host to expose
   ```

### Step 5: Verify Installation

1. **Open your browser** and go to `http://localhost:8080`

2. **You should see**:
   - The PersonalityHub homepage
   - A main logo/image in the center
   - Navigation with Login/Register buttons (top-right)

3. **Test the application**:
   - Click on a survey to start taking it
   - Register a new account
   - Complete a survey
   - View your results

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Error

**Error**: `Unable to connect to the database`

**Solutions**:
1. Ensure PostgreSQL is running:
   ```bash
   # On macOS with Homebrew
   brew services start postgresql
   
   # On Ubuntu/Debian
   sudo service postgresql start
   
   # On Windows
   # Start PostgreSQL service from Services panel
   ```

2. Verify database credentials in `.env` file
3. Check if the database exists:
   ```bash
   psql -U your_user -d personality_survey -c "SELECT 1;"
   ```

#### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solutions**:
1. Kill the process using the port:
   ```bash
   # Find process using port 3000
   lsof -ti:3000
   
   # Kill the process
   kill -9 $(lsof -ti:3000)
   ```

2. Or change the port in `.env`:
   ```env
   PORT=3001
   ```

#### JWT Secret Error

**Error**: `JWT_SECRET is required`

**Solution**: Ensure you have a strong JWT secret in your `.env` file:
```env
JWT_SECRET=your_very_long_and_random_secret_key_here_at_least_32_characters
```

#### Frontend Build Errors

**Error**: Various npm/dependency errors

**Solutions**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Ensure Node.js version compatibility (use Node 16+):
   ```bash
   node --version
   ```

### Verification Commands

Run these commands to verify everything is working:

```bash
# Check backend health
curl http://localhost:3000/api/health

# Check if surveys are loaded
curl http://localhost:3000/api/surveys

# Check frontend is serving
curl http://localhost:8080
```

## 🛠 Development Tips

### Useful Commands

```bash
# Backend (run from /backend directory)
npm run dev          # Start with auto-reload
npm run seed         # Re-seed database
npm run migrate      # Run database migrations

# Frontend (run from /frontend directory)
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check code quality
```

### Development Workflow

1. **Backend changes**: The server will auto-reload with nodemon
2. **Frontend changes**: Vite will hot-reload in the browser
3. **Database changes**: Re-run `npm run seed` if you modify survey data

### Adding New Surveys

1. Create a new JSON file in `backend/surveys/`
2. Follow the existing survey structure
3. Run `npm run seed` to add it to the database

## 🌐 Production Deployment

For production deployment:

1. **Set environment variables**:
   ```env
   NODE_ENV=production
   DB_HOST=your_production_db_host
   # ... other production values
   ```

2. **Build frontend**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Start backend**:
   ```bash
   cd backend
   npm start
   ```

## 📞 Getting Help

If you encounter issues:

1. Check the [main README.md](README.md) for additional information
2. Look at the error logs in the console
3. Verify all prerequisites are properly installed
4. Check that all environment variables are set correctly

## ✅ Next Steps

Once setup is complete:

1. **Explore the application**: Take a few surveys to understand the functionality
2. **Review the code**: Familiarize yourself with the project structure
3. **Customize**: Modify surveys, styling, or add new features
4. **Deploy**: Follow production deployment guidelines when ready

---

**Setup complete! 🎉 Start exploring your personality survey platform!**