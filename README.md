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
[demo](./image/demo.gif)

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

```bash
# Clone repository
git clone <repository-url>
cd whoami/frontend

# Install dependencies
npm install

# Start development server (with mock data)
npm run dev
```

The application will be available at `http://localhost:8080`

---

For detailed documentation including API endpoints, configuration options, deployment guides, and development instructions, please visit the [Wiki](../../wiki).