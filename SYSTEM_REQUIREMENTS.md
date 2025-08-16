# System Requirements - Whoami Personality Survey Platform

## Overview

The Whoami Personality Survey Platform is a full-stack web application built with Vue.js 3 frontend and Node.js backend, supporting multiple deployment scenarios including local development, Docker containers, and cloud deployment (Vercel + Neon PostgreSQL).

## Hardware Requirements

### Minimum Requirements
- **CPU**: 1 core, 1 GHz processor
- **RAM**: 512 MB available memory
- **Storage**: 500 MB free disk space
- **Network**: Broadband internet connection

### Recommended Requirements
- **CPU**: 2+ cores, 2.4 GHz processor
- **RAM**: 2 GB available memory
- **Storage**: 2 GB free disk space
- **Network**: High-speed internet connection

## Software Requirements

### Development Environment

#### Required Software
- **Node.js**: Version 16.0 or higher
  - Includes npm package manager
  - Required for both frontend and backend development
- **PostgreSQL**: Version 12.0 or higher
  - Required for local database
  - Alternative: Use Neon PostgreSQL for cloud deployment
- **Git**: Latest version
  - Required for source code management

#### Optional Software
- **Docker**: Version 20.0 or higher + Docker Compose
  - For containerized deployment
- **Docker Compose**: Version 2.0 or higher
  - For multi-container orchestration

### Production Environment

#### Cloud Deployment (Recommended)
- **Vercel**: For frontend and serverless API hosting
- **Neon PostgreSQL**: For managed database hosting
- **Node.js**: Version 18.x (handled by Vercel runtime)

#### Self-Hosted Deployment
- **Operating System**: Linux (Ubuntu 20.04+), macOS, or Windows Server
- **Node.js**: Version 18.0 or higher
- **PostgreSQL**: Version 12.0 or higher
- **Nginx**: Version 1.18+ (for production frontend serving)
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)

## Platform Support

### Operating Systems
- **Linux**: Ubuntu 18.04+, Debian 10+, CentOS 7+, RHEL 8+
- **macOS**: 10.15 Catalina or higher
- **Windows**: Windows 10, Windows Server 2019+

### Browsers (Frontend)
- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+

## Dependencies

### Backend Dependencies (Node.js)
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "express-rate-limit": "^6.7.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "sequelize": "^6.32.1",
  "pg": "^8.11.0",
  "joi": "^17.9.2",
  "dotenv": "^16.3.1"
}
```

### Frontend Dependencies (Vue.js)
```json
{
  "vue": "^3.3.4",
  "vue-router": "^4.2.4",
  "pinia": "^2.1.6",
  "axios": "^1.4.0",
  "vue-i18n": "^9.2.2",
  "chart.js": "^4.3.0",
  "tailwindcss": "^3.3.0"
}
```

### API Dependencies (Vercel Functions)
```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "pg": "^8.11.3",
  "sequelize": "^6.35.0"
}
```

## Database Requirements

### PostgreSQL Configuration
- **Version**: PostgreSQL 12.0 or higher
- **Storage**: Minimum 100 MB, recommended 1 GB+
- **Connections**: Minimum 5 concurrent connections
- **Character Set**: UTF-8
- **Extensions**: No special extensions required

### Database Schema
- **Tables**: Users, Surveys, Results, admin tables
- **Estimated Size**: ~10 MB for base schema + survey data
- **Growth Rate**: ~1 KB per survey result

## Network Requirements

### Ports
- **Frontend Development**: 8080 (default Vite dev server)
- **Backend Development**: 3000 (default Express server)
- **PostgreSQL**: 5432 (default)
- **Production (Docker)**: 80 (HTTP), 443 (HTTPS)

### External Services
- **Vercel**: For cloud deployment and CDN
- **Neon**: For managed PostgreSQL hosting
- **npm registry**: For package installation

## Environment Variables

### Required Variables
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_64_character_random_secret

# Optional
NODE_ENV=production|development
PORT=3000
JWT_EXPIRE=7d
CORS_ORIGIN=https://yourdomain.com
```

## Performance Requirements

### Response Times
- **Page Load**: < 3 seconds (first visit)
- **API Responses**: < 500ms (typical)
- **Survey Submission**: < 1 second

### Throughput
- **Concurrent Users**: 100+ (with proper scaling)
- **Survey Completions**: 1000+ per day
- **API Requests**: 10,000+ per day

### Resource Usage
- **Memory**: ~50 MB per Node.js process
- **CPU**: Low usage during normal operation
- **Bandwidth**: ~2 MB per user session

## Security Requirements

### Authentication
- **JWT Tokens**: 64-character secret minimum
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Token-based authentication

### Network Security
- **HTTPS**: Required for production
- **CORS**: Configured for frontend domain
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: All API endpoints validated

### Data Protection
- **Database**: SSL connections enforced
- **Passwords**: Hashed and salted
- **Environment**: Secrets in environment variables only

## Deployment Options

### 1. Local Development
```bash
# Prerequisites
node --version    # >= 16.0
npm --version     # >= 8.0
psql --version    # >= 12.0

# Setup commands
npm install       # In both frontend/ and backend/
npm run dev       # Start development servers
```

### 2. Docker Deployment
```bash
# Prerequisites
docker --version         # >= 20.0
docker-compose --version # >= 2.0

# Setup commands
docker-compose up -d     # Start all services
```

### 3. Cloud Deployment (Vercel + Neon)
```bash
# Prerequisites
- Vercel account (free tier available)
- Neon PostgreSQL account (free tier available)
- GitHub repository

# Setup
- Connect repo to Vercel
- Configure environment variables
- Deploy automatically on git push
```

## Backup and Recovery

### Database Backup
```bash
# Local PostgreSQL
pg_dump personality_survey > backup.sql

# Neon PostgreSQL
# Use Neon dashboard or CLI tools
```

### Application Data
- **Survey Configurations**: JSON files in `/backend/surveys/`
- **User Data**: Stored in PostgreSQL database
- **Static Assets**: Served from CDN (Vercel)

## Monitoring and Maintenance

### Health Checks
- **Backend**: `/api/health` endpoint
- **Frontend**: Root URL availability
- **Database**: Connection status monitoring

### Log Files
- **Application Logs**: Console output (stdout/stderr)
- **Access Logs**: Web server logs
- **Error Tracking**: Console error logging

### Updates
- **Dependencies**: Regular npm audit and updates
- **Security**: Monitor security advisories
- **Database**: Schema migrations as needed

## Scaling Considerations

### Horizontal Scaling
- **Frontend**: CDN distribution (automatic with Vercel)
- **API**: Serverless functions (automatic with Vercel)
- **Database**: Read replicas (available with Neon Pro)

### Vertical Scaling
- **Memory**: Increase Node.js heap size if needed
- **CPU**: Use PM2 cluster mode for multi-core utilization
- **Database**: Upgrade Neon compute resources

## Troubleshooting

### Common Issues
1. **Database Connection**: Verify PostgreSQL service and credentials
2. **CORS Errors**: Check CORS_ORIGIN environment variable
3. **Build Failures**: Verify Node.js version and clear npm cache
4. **Cold Starts**: Normal for serverless deployments (2-3 seconds)

### Support Resources
- Application logs via console/terminal
- Health check endpoints for service status
- Database connection testing via psql
- Network connectivity testing via curl

---

**This document covers all system requirements for successful deployment and operation of the Whoami Personality Survey Platform.**