# Docker Deployment Guide

This guide covers how to deploy and manage the Personality Survey Platform using Docker containers.

## 🐳 Overview

The application provides both **production** and **development** Docker configurations:

- **Production**: Optimized builds with Nginx, PostgreSQL, and production Node.js
- **Development**: Hot-reload enabled with volume mounting for live code changes

## 📋 Prerequisites

- **Docker** (v20.10 or higher)
- **Docker Compose** (v2.0 or higher)
- **8GB RAM** minimum for comfortable operation
- **2GB** free disk space

### Installation Links
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows/macOS)
- [Docker Engine](https://docs.docker.com/engine/install/) (Linux)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repository>
cd whoami

# Copy environment template
cp .env.example .env
# Edit .env with your configuration
```

### 2. Production Deployment

```bash
# Start all services in production mode
./start.sh --docker --mode production

# Or manually with docker-compose
docker-compose up --build -d
```

### 3. Development Setup

```bash
# Start in development mode with hot-reload
./start.sh --docker --mode development

# Or manually
docker-compose -f docker-compose.dev.yml up --build
```

### 4. Access Application

- **Production**: http://localhost
- **Development**: http://localhost:8080
- **API**: http://localhost:3000 (prod) or http://localhost:3001 (dev)

## 📁 Docker Configuration Files

### Production (`docker-compose.yml`)
- **Frontend**: Nginx serving built Vue.js app on port 80/443
- **Backend**: Node.js API server on port 3000
- **Database**: PostgreSQL 14 with persistent volumes

### Development (`docker-compose.dev.yml`)
- **Frontend**: Vite dev server on port 8080 with hot-reload
- **Backend**: Nodemon for auto-restart on port 3001
- **Database**: PostgreSQL 14 on port 5433
- **Volumes**: Source code mounted for live editing

## 🛠 Service Details

### Database Service
```yaml
# Production database
ports: 5432:5432
volumes: postgres_data:/var/lib/postgresql/data

# Development database  
ports: 5433:5432
volumes: postgres_dev_data:/var/lib/postgresql/data
```

**Environment Variables:**
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password

### Backend Service
```yaml
# Production
ports: 3000:3000
depends_on: database (with health check)

# Development
ports: 3001:3000
volumes: ./backend:/app (live reload)
command: npm run dev
```

**Environment Variables:**
- `NODE_ENV`: production/development
- `JWT_SECRET`: Secret key for JWT tokens
- `DB_HOST`: Database host (service name in Docker)
- `CORS_ORIGIN`: Allowed frontend origin

### Frontend Service
```yaml
# Production
ports: 80:80, 443:443
nginx: Serves built static files + API proxy

# Development  
ports: 8080:8080
vite: Development server with HMR
volumes: ./frontend:/app (live reload)
```

## ⚙️ Environment Configuration

### Required Environment Variables

Create `.env` file in project root:

```env
# Security
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Database
POSTGRES_DB=personality_survey
POSTGRES_USER=survey_user
POSTGRES_PASSWORD=secure_password_here

# Frontend
VITE_API_BASE_URL=http://localhost:3000/api
CORS_ORIGIN=http://localhost

# Optional: SSL (for production)
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

### Development vs Production Differences

| Setting | Development | Production |
|---------|------------|------------|
| Frontend Port | 8080 | 80 |
| Backend Port | 3001 | 3000 |
| Database Port | 5433 | 5432 |
| Build Optimization | No | Yes |
| Hot Reload | Yes | No |
| Volume Mounts | Source code | None |
| Nginx | No | Yes |

## 🔧 Management Commands

### Using Scripts (Recommended)

```bash
# Start services
./start.sh --docker                    # Development mode
./start.sh --docker --mode production  # Production mode
./start.sh --docker --detached        # Background mode

# Check status
./status.sh

# Stop services  
./stop.sh --docker                    # Stop containers
./stop.sh --docker --clean           # Stop + remove volumes
./stop.sh --docker --force           # Force stop everything
```

### Using Docker Compose Directly

```bash
# Production
docker-compose up -d              # Start in background
docker-compose logs -f            # View logs
docker-compose down               # Stop services
docker-compose down -v            # Stop + remove volumes

# Development
docker-compose -f docker-compose.dev.yml up
docker-compose -f docker-compose.dev.yml down

# Build without cache
docker-compose build --no-cache
```

### Individual Service Management

```bash
# Restart specific service
docker-compose restart backend

# View service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# Execute commands in containers
docker-compose exec backend npm run seed
docker-compose exec database psql -U survey_user -d personality_survey
```

## 📊 Monitoring and Logs

### Health Checks

All services include health checks:
- **Backend**: `curl http://localhost:3000/api/health`
- **Frontend**: `curl http://localhost/`  
- **Database**: `pg_isready -U survey_user -d personality_survey`

### Log Management

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Logs for specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100

# Logs since specific time
docker-compose logs --since 30m
```

### Container Resource Usage

```bash
# View resource usage
docker stats

# Container information
docker ps
docker-compose ps

# Service status
./status.sh
```

## 🗂 Volume Management

### Data Persistence

Production volumes:
- `postgres_data`: Database files
- `nginx_logs`: Web server logs (if configured)

Development volumes:
- `postgres_dev_data`: Development database
- Source code mounted as bind volumes

### Backup Database

```bash
# Create backup
docker-compose exec database pg_dump -U survey_user -d personality_survey > backup.sql

# Restore backup
docker-compose exec -T database psql -U survey_user -d personality_survey < backup.sql
```

### Reset Database

```bash
# Remove database volume (DATA LOSS!)
./stop.sh --docker --clean

# Or manually
docker-compose down -v
docker volume rm whoami_postgres_data
```

## 🔒 Security Considerations

### Production Security

1. **Environment Variables**:
   ```bash
   # Use strong passwords
   POSTGRES_PASSWORD=$(openssl rand -base64 32)
   JWT_SECRET=$(openssl rand -base64 64)
   ```

2. **SSL Configuration**:
   ```bash
   mkdir -p nginx/ssl
   # Add your SSL certificates
   cp your-cert.pem nginx/ssl/cert.pem
   cp your-key.pem nginx/ssl/key.pem
   ```

3. **Network Security**:
   ```yaml
   # docker-compose.yml
   networks:
     survey-network:
       driver: bridge
       internal: true  # Isolate from external networks
   ```

### Firewall Rules

```bash
# Allow only necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 3000/tcp  # Block direct API access
ufw deny 5432/tcp  # Block direct DB access
```

## 🚀 Production Deployment

### Server Requirements

**Minimum Specs:**
- 2 CPU cores
- 4GB RAM  
- 20GB disk space
- Ubuntu 20.04+ / CentOS 8+ / Docker-compatible OS

**Recommended Specs:**
- 4 CPU cores
- 8GB RAM
- 50GB SSD
- Load balancer for high availability

### Deployment Steps

1. **Server Setup**:
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Add user to docker group
   sudo usermod -aG docker $USER
   ```

2. **Deploy Application**:
   ```bash
   git clone <repository>
   cd whoami
   
   # Configure environment
   cp .env.example .env
   nano .env  # Edit with production values
   
   # Start services
   ./start.sh --docker --mode production --detached
   ```

3. **Set up Reverse Proxy** (optional):
   ```nginx
   # /etc/nginx/sites-available/personality-survey
   server {
       listen 80;
       server_name your-domain.com;
       location / {
           proxy_pass http://localhost:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Monitoring Setup

```bash
# Set up log rotation
echo '
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
' > /etc/logrotate.d/docker

# Health check cron job
echo '*/5 * * * * curl -f http://localhost/api/health || systemctl restart docker' | crontab -
```

## 🔧 Troubleshooting

### Common Issues

**Container Won't Start**
```bash
# Check logs
docker-compose logs service-name

# Check resource usage
docker stats

# Rebuild without cache
docker-compose build --no-cache
```

**Database Connection Failed**
```bash
# Check if database is ready
docker-compose exec database pg_isready -U survey_user

# Check environment variables
docker-compose exec backend env | grep DB_

# Reset database
./stop.sh --docker --clean
./start.sh --docker
```

**Port Already in Use**
```bash
# Find process using port
lsof -ti:3000
netstat -tulpn | grep :3000

# Kill process
kill -9 $(lsof -ti:3000)
```

**Permission Issues**
```bash
# Fix ownership
sudo chown -R $USER:$USER .

# Fix Docker permissions
sudo chmod 666 /var/run/docker.sock
```

### Performance Issues

**High Memory Usage**
```bash
# Limit container resources
docker-compose -f docker-compose.yml -f docker-compose.override.yml up

# docker-compose.override.yml
services:
  backend:
    mem_limit: 512m
  frontend:
    mem_limit: 256m
```

**Slow Database**
```bash
# Optimize PostgreSQL
docker-compose exec database psql -U survey_user -d personality_survey
# Run: VACUUM ANALYZE;
```

### Debug Mode

```bash
# Development debugging
docker-compose -f docker-compose.dev.yml up --build

# Enable debug logging
NODE_ENV=development DEBUG=* docker-compose up

# Shell access
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec database psql -U survey_user
```

## 🔄 Updates and Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Or using script
./stop.sh --docker
./start.sh --docker --mode production --detached
```

### Database Migrations

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed new data
docker-compose exec backend npm run seed
```

### Clean Up

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Complete cleanup
docker system prune -a
```

## 📱 Development Workflow

### Hot Reload Development

```bash
# Start development environment
./start.sh --docker --mode development

# Make changes to code - containers auto-reload
# Frontend: Changes reflect immediately
# Backend: Server restarts on file changes
```

### Testing in Docker

```bash
# Run tests in container
docker-compose exec backend npm test
docker-compose exec frontend npm run test

# Run linting
docker-compose exec backend npm run lint
docker-compose exec frontend npm run lint
```

### Database Management

```bash
# Connect to database
docker-compose exec database psql -U survey_user -d personality_survey_dev

# Reset development database
./stop.sh --docker --clean
./start.sh --docker --mode development

# Import test data
docker-compose exec backend npm run seed
```

---

## 📞 Support

For Docker-related issues:

1. Check container logs: `docker-compose logs [service]`
2. Verify environment configuration
3. Ensure Docker has sufficient resources
4. Check port conflicts
5. Review the troubleshooting section above

**Useful Commands Reference:**
```bash
./start.sh --docker --help     # Start options
./stop.sh --docker --help      # Stop options  
./status.sh                     # System status
docker-compose ps               # Container status
docker-compose logs -f          # Follow logs
```