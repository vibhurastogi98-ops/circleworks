# CircleWorks API - Setup Guide

Complete setup instructions for the CircleWorks REST API backend.

## System Requirements

- **Node.js:** 18.0.0 or higher
- **npm:** 8.0.0 or higher (or yarn)
- **PostgreSQL:** 14.0 or higher
- **Redis:** 7.0 or higher
- **Elasticsearch:** 8.0+ (optional, for search features)
- **Docker:** (optional, for containerized setup)

## Quick Start (Docker)

### Prerequisites
- Docker & Docker Compose

### Step 1: Setup Database & Services

```bash
cd backend
docker-compose up -d
```

This starts:
- PostgreSQL database
- Redis cache
- Elasticsearch (optional)
- API server (with hot reload)

### Step 2: Initialize Database

In a new terminal:

```bash
docker exec circleworks-api npm run db:push
docker exec circleworks-api npm run db:seed
```

### Step 3: Access API

- **API Server:** http://localhost:3001
- **Swagger Docs:** http://localhost:3001/docs
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

**Test Credentials:**
```
Email: admin@circleworks.com
Password: AdminPass123!
```

## Local Setup (Without Docker)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Setup PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb circleworks
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql-14
sudo -u postgres createdb circleworks
```

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Follow installer
- Create database named `circleworks`

### Step 3: Setup Redis

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

**Windows:**
- Download from https://github.com/microsoftarchive/redis/releases
- Or use WSL (Windows Subsystem for Linux)

### Step 4: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and update:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/circleworks
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

### Step 5: Initialize Database

```bash
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Seed with sample data
```

### Step 6: Start Development Server

```bash
npm run start:dev
```

Server will start at `http://localhost:3001`

## Verification

### 1. Health Check
```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 15.234
}
```

### 2. Test Authentication

```bash
# Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@circleworks.com",
    "password": "AdminPass123!"
  }'
```

### 3. Access Swagger Documentation

Open browser to: http://localhost:3001/docs

## Environment Variables

Create `.env` file with:

```env
# API
API_PORT=3001
API_ENV=development
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/circleworks

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRATION=900
JWT_REFRESH_EXPIRATION=604800

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3 (for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=circleworks-uploads

# Email (Postmark)
SMTP_HOST=smtp.postmark.com
SMTP_PORT=587
SMTP_USER=your-postmark-token
SMTP_FROM=noreply@circleworks.com

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# CORS
CORS_ORIGIN=http://localhost:3000,https://app.circleworks.com

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Elasticsearch
ELASTICSEARCH_HOST=localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
```

## Database Migrations

### Create New Migration
```bash
npm run db:migrate -- --name add_new_feature
```

### Apply Migrations
```bash
npm run db:push
```

### Reset Database (⚠️ WARNING: Deletes all data)
```bash
npm run db:reset
```

## Running Tests

```bash
# All tests
npm test

# Watch mode (re-run on changes)
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

## Building for Production

### Local Build
```bash
npm run build
npm run start:prod
```

### Docker Build
```bash
docker build -t circleworks-api:latest .
docker run -p 3001:3001 --env-file .env circleworks-api:latest
```

### Deployment Platforms

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

**AWS ECS:**
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag circleworks-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/circleworks:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/circleworks:latest
```

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
1. Ensure PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in .env
3. Create database if missing: `createdb circleworks`

### Port Already in Use
```
Error: listen EADDRINUSE :::3001
```

**Solution:**
```bash
# Kill process on port 3001
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
# or specify different port:
API_PORT=3002 npm run start:dev
```

### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
1. Ensure Redis is running: `redis-cli ping` (should return PONG)
2. Start Redis: `redis-server` or `brew services start redis`

### Module Not Found
```
Error: Cannot find module '@/prisma/prisma.service'
```

**Solution:**
```bash
npm run db:generate
npm install
```

## Development Workflow

### 1. Create New Feature Module

```bash
mkdir -p src/modules/my-feature/{controllers,services,dtos}

# Create files with proper structure
```

### 2. Add Database Model

Edit `prisma/schema.prisma`:
```prisma
model MyFeature {
  id    String    @id @default(cuid())
  name  String
  companyId String
  company Company  @relation(fields: [companyId], references: [id])
  
  @@index([companyId])
}
```

### 3. Create Migration
```bash
npm run db:migrate -- --name add_my_feature
```

### 4. Implement Service & Controller

See `src/modules/employees/` for structure example.

### 5. Test Endpoint

Use Swagger UI at http://localhost:3001/docs

## Common Commands

```bash
# Development
npm run start:dev           # Start with hot reload
npm run lint              # Run ESLint
npm run format            # Format code with Prettier

# Database
npm run db:generate       # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate dev   # Create & run migrations
npm run db:reset         # Reset database (⚠️)
npm run db:seed          # Seed sample data

# Testing
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:cov        # Coverage report
npm run test:e2e        # E2E tests

# Build & Deploy
npm run build            # Build for production
npm run start:prod       # Run production build
```

## Resources

- **NestJS Docs:** https://docs.nestjs.com
- **Prisma Docs:** https://www.prisma.io/docs
- **API Documentation:** http://localhost:3001/docs (after starting server)
- **GitHub:** https://github.com/circleworks/api

## Support

For issues or questions:
- 📧 Email: support@circleworks.com
- 📚 Docs: https://circleworks.com/docs
- 💬 Discord: https://discord.gg/circleworks

---

**Happy coding! 🚀**
