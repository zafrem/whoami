# Deployment Guide - Vercel + Neon

This guide covers deploying your Whoami personality survey platform to Vercel (frontend + API) with Neon PostgreSQL database.

## 🚀 Quick Deployment

### Prerequisites
- GitHub account
- Vercel account (free tier)
- Neon account (free tier)

### Step 1: Set up Neon Database

1. **Create Neon Account**: Visit [neon.tech](https://neon.tech) and sign up
2. **Create Database**: 
   - Create a new project named "whoami-personality"
   - Select region closest to your users
   - Copy the connection string

3. **Get Connection Details**:
   ```
   Database URL: postgresql://username:password@hostname/database
   ```

### Step 2: Deploy to Vercel

1. **Fork/Clone Repository**:
   ```bash
   git clone <your-repo>
   cd whoami
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repo
   - Select the `whoami` folder as root

3. **Configure Environment Variables** in Vercel Dashboard:
   ```env
   # Database (from Neon)
   DATABASE_URL=postgresql://your_connection_string_here
   POSTGRES_URL=postgresql://your_connection_string_here
   
   # JWT Secret (generate a random 64-character string)
   JWT_SECRET=your_super_secure_random_jwt_secret_at_least_64_characters_long
   JWT_EXPIRE=7d
   
   # Node Environment
   NODE_ENV=production
   ```

4. **Deploy**:
   - Click "Deploy" in Vercel
   - Wait for build to complete

### Step 3: Initialize Database

After deployment, initialize your database:

1. **Run Migration** (one-time setup):
   - Go to your Vercel dashboard
   - Find your deployment
   - Go to Functions tab
   - Create a temporary function or use Vercel CLI:

   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy and run migration
   vercel --prod
   node frontend/api/migrate.js
   ```

   Or visit: `https://your-app.vercel.app/api/migrate` (if you create a migration endpoint)

## 🛠 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Secret key for JWT tokens (64+ chars) | `your_very_long_secret_key` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_EXPIRE` | `7d` | Token expiration time |
| `NODE_ENV` | `production` | Environment mode |

## 📊 Free Tier Limitations

### Vercel Free Limits
- ✅ Unlimited static deployments
- ✅ 100GB bandwidth/month
- ✅ 100GB-hrs serverless function execution
- ⚠️ 10-second function timeout
- ⚠️ Cold start delays (1-3 seconds)

### Neon Free Limits
- ✅ 512MB database storage
- ✅ 1 database per project
- ✅ 100 hours compute/month
- ⚠️ Auto-suspend after 5 minutes idle
- ⚠️ Cold start delays (2-3 seconds)

## 🔧 Optimizations for Free Tier

### 1. **Handle Cold Starts Gracefully**

The app includes `ColdStartLoader` component that:
- Shows engaging loading states
- Displays fun facts while waiting
- Provides progress feedback
- Manages user expectations

### 2. **Database Connection Optimization**

```javascript
// Connection pooling optimized for serverless
pool: {
  max: 2,        // Reduced for serverless
  min: 0,        // Allow 0 connections when idle  
  acquire: 3000, // Faster acquisition
  idle: 1000     // Shorter idle time
}
```

### 3. **API Timeout Handling**

```javascript
// Extended timeout for cold starts
timeout: 30000, // 30 seconds
```

## 🚀 Production Optimizations

### Database Indexing

```sql
-- Add indexes for better performance
CREATE INDEX idx_results_user_id ON "Results" ("userId");
CREATE INDEX idx_results_survey_id ON "Results" ("surveyId");
CREATE INDEX idx_surveys_category ON "Surveys" ("category");
CREATE INDEX idx_surveys_language ON "Surveys" ("language");
```

### Monitoring Setup

Add health check endpoint:

```javascript
// frontend/api/health.js
export default async function handler(req, res) {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
```

## 🔒 Security Checklist

### Environment Variables
- ✅ Strong JWT secret (64+ characters)
- ✅ No secrets in code
- ✅ Database credentials in environment only

### API Security
- ✅ CORS properly configured
- ✅ Input validation on all endpoints
- ✅ Authentication middleware
- ✅ Rate limiting implemented

### Database Security
- ✅ SSL connections enforced
- ✅ Parameterized queries (Sequelize ORM)
- ✅ No direct SQL injection vectors

## 📱 Custom Domain Setup

1. **Add Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**:
   ```env
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **SSL Certificate**:
   - Automatically provided by Vercel
   - No additional configuration needed

## 🐛 Troubleshooting

### Common Issues

#### Function Timeout
```
Error: Function execution timed out
```
**Solution**: Cold start issue, retry request

#### Database Connection Failed
```
Error: Connection refused
```
**Solutions**:
1. Check Neon database is not suspended
2. Verify connection string in environment variables
3. Ensure database has active compute hours

#### Build Failed
```
Error: Module not found
```
**Solutions**:
1. Check `package.json` in `/frontend/api/`
2. Verify all dependencies are listed
3. Clear Vercel build cache

### Health Checks

Visit these URLs to verify deployment:
- `https://your-app.vercel.app/api/health`
- `https://your-app.vercel.app/api/surveys`

## 📈 Scaling Beyond Free Tier

### When to Upgrade

**Vercel Pro ($20/month)**:
- More bandwidth and compute
- Team collaboration
- Advanced analytics

**Neon Pro ($19/month)**:
- More storage and compute hours
- Always-on compute (no cold starts)
- Database branching

### Migration Path

1. **Upgrade Neon first** (eliminates cold starts)
2. **Monitor Vercel usage** in dashboard
3. **Upgrade Vercel** when hitting limits

## 🚦 Go Live Checklist

- [ ] Neon database created and configured
- [ ] Environment variables set in Vercel
- [ ] Database migrated and seeded
- [ ] Health endpoints responding
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring set up
- [ ] Backup strategy planned

## 📞 Support

### Deployment Issues
1. Check Vercel Functions logs
2. Verify environment variables
3. Test API endpoints individually
4. Check Neon database status

### Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Vue.js Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**Ready to deploy! 🚀**

Your personality survey platform will be live at:
`https://your-project-name.vercel.app`