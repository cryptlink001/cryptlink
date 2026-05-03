# 🔑 CryptLink Credentials & Setup Guide

## 📋 Required Credentials Overview

To deploy CryptLink, you'll need credentials for these services:

### 🗄️ Database
- **PostgreSQL** (Supabase/ElephantSQL)
- **Connection String**
- **Username & Password**

### 🔄 Cache
- **Redis** (Upstash/Redis Cloud)
- **Connection URL**
- **Password**

### 📁 Storage
- **Cloudflare R2** or **Supabase Storage**
- **Access Key**
- **Secret Key**
- **Bucket Name**

### 🌐 Hosting
- **Railway** (Backend)
- **Vercel** (Frontend)
- **API Tokens**

### 📧 Email (Optional)
- **SMTP Server** (Gmail/SendGrid)
- **Email & Password**

---

## 🔧 Step-by-Step Setup

### 1. Database Setup (PostgreSQL)

#### Option A: Supabase (Recommended - Free)
1. **Sign Up**: Go to [supabase.com](https://supabase.com)
2. **Create Project**: 
   - Project name: `cryptlink-db`
   - Database password: `create_secure_password_123`
   - Region: Choose nearest to your users
3. **Get Credentials**:
   ```
   Database URL: jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres
   Username: postgres
   Password: your_created_password
   ```
4. **Update Backend .env**:
   ```bash
   SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=your_created_password
   ```

#### Option B: ElephantSQL (Free)
1. **Sign Up**: [elephantsql.com](https://www.elephantsql.com)
2. **Create Instance**: Choose "Tiny Turtle" (free tier)
3. **Get Details**: From dashboard > Details
4. **Connection String**: Copy JDBC URL

### 2. Redis Setup

#### Option A: Upstash (Recommended - Free)
1. **Sign Up**: [upstash.com](https://upstash.com)
2. **Create Database**: 
   - Region: Choose nearest
   - Name: `cryptlink-redis`
3. **Get Connection Details**:
   ```
   REST URL: https://your-redis-url.upstash.io
   Token: your_redis_token
   Port: 6379
   ```
4. **Update Backend .env**:
   ```bash
   SPRING_DATA_REDIS_HOST=your-redis-url.upstash.io
   SPRING_DATA_REDIS_PORT=6379
   SPRING_DATA_REDIS_PASSWORD=your_redis_token
   ```

#### Option B: Redis Cloud (Free)
1. **Sign Up**: [redis.com](https://redis.com)
2. **Create Free Database**: 30MB free tier
3. **Get Connection Details**

### 3. Cloud Storage Setup

#### Option A: Cloudflare R2 (Recommended - Free)
1. **Sign Up**: [cloudflare.com](https://cloudflare.com)
2. **Enable R2**: In dashboard > R2 Object Storage
3. **Create Bucket**:
   ```bash
   # Install wrangler
   npm install -g wrangler
   
   # Login
   wrangler login
   
   # Create bucket
   wrangler r2 bucket create cryptlink-media
   ```
4. **Get API Tokens**:
   - Go to Dashboard > My Profile > API Tokens
   - Create "Custom token" with R2 permissions
5. **Update Backend .env**:
   ```bash
   CLOUD_STORAGE_ACCESS_KEY=your_r2_access_key
   CLOUD_STORAGE_SECRET_KEY=your_r2_secret_key
   CLOUD_STORAGE_BUCKET=cryptlink-media
   ```

#### Option B: Supabase Storage
1. **Enable Storage**: In Supabase dashboard
2. **Create Bucket**: `cryptlink-media`
3. **Get API Keys**: From Settings > API

### 4. Backend Deployment (Railway)

1. **Sign Up**: [railway.app](https://railway.app)
2. **Create New Project**:
   - Deploy from GitHub repo
   - Or upload files directly
3. **Configure Environment Variables**:
   ```bash
   # Database
   SPRING_DATASOURCE_URL=your_postgres_url
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=your_db_password
   
   # Redis
   SPRING_DATA_REDIS_HOST=your_redis_host
   SPRING_DATA_REDIS_PORT=6379
   SPRING_DATA_REDIS_PASSWORD=your_redis_password
   
   # JWT (Generate new secure key)
   JWT_SECRET=your_generated_256_bit_key
   
   # CORS
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
4. **Get Backend URL**: From Railway dashboard

### 5. Frontend Deployment (Vercel)

1. **Sign Up**: [vercel.com](https://vercel.com)
2. **Import Project**: From GitHub
3. **Configure Environment Variables**:
   ```bash
   REACT_APP_API_URL=https://your-backend.railway.app/api
   REACT_APP_WS_URL=wss://your-backend.railway.app/ws
   REACT_APP_ENV=production
   ```
4. **Deploy**: Click "Deploy"

### 6. Email Setup (Optional)

#### Gmail SMTP
1. **Enable 2FA**: In Google account settings
2. **Create App Password**:
   - Go to Google Account > Security > App Passwords
   - Generate new app password
3. **Update Backend .env**:
   ```bash
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_generated_app_password
   ```

---

## 🔐 Security Best Practices

### 1. Generate Secure JWT Secret

```bash
# Method 1: OpenSSL
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Example output**: `xY9zK2mN8pQ5vR7wE3tA6sD4fG1hJ9kL0=`

### 2. Database Password

```bash
# Generate strong password
openssl rand -base64 16
# Example: B7fK9mN2pQ5vR8wE3tA6sD4fG1hJ9kL
```

### 3. Environment File Security

```bash
# Set proper permissions
chmod 600 .env

# Add to .gitignore
echo ".env" >> .gitignore
echo "*.key" >> .gitignore
echo "*.pem" >> .gitignore
```

---

## 📝 Environment Variables Template

### Backend (.env)

```bash
# ===========================================
# CRYPTLINK BACKEND ENVIRONMENT VARIABLES
# ===========================================

# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/cryptlink
SPRING_DATASOURCE_USERNAME=cryptlink_user
SPRING_DATASOURCE_PASSWORD=your_secure_db_password

# Redis Configuration
SPRING_DATA_REDIS_HOST=your-redis-host
SPRING_DATA_REDIS_PORT=6379
SPRING_DATA_REDIS_PASSWORD=your_redis_password

# JWT Configuration (IMPORTANT: Generate new secure key)
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_256_bits_long
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.vercel.app,https://yourdomain.com

# Cloud Storage (Cloudflare R2)
CLOUD_STORAGE_PROVIDER=cloudflare_r2
CLOUD_STORAGE_BUCKET=cryptlink-media
CLOUD_STORAGE_ACCESS_KEY=your_r2_access_key
CLOUD_STORAGE_SECRET_KEY=your_r2_secret_key

# Email Configuration (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@cryptlink.app

# Application Configuration
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod

# Logging
LOG_LEVEL=INFO
```

### Frontend (.env)

```bash
# ===========================================
# CRYPTLINK FRONTEND ENVIRONMENT VARIABLES
# ===========================================

# Backend API URL
REACT_APP_API_URL=https://your-backend.railway.app/api

# WebSocket URL
REACT_APP_WS_URL=wss://your-backend.railway.app/ws

# Environment
REACT_APP_ENV=production

# Debug Mode (set to false in production)
REACT_APP_DEBUG=false
```

---

## 🚀 Quick Deployment Checklist

### ✅ Pre-Deployment Checks

- [ ] Generate secure JWT secret
- [ ] Set up PostgreSQL database
- [ ] Configure Redis cache
- [ ] Create cloud storage bucket
- [ ] Test all API endpoints locally
- [ ] Verify CORS configuration
- [ ] Check environment variables

### ✅ Deployment Steps

1. **Backend**:
   - [ ] Push code to GitHub
   - [ ] Create Railway project
   - [ ] Add environment variables
   - [ ] Deploy and test health endpoint

2. **Frontend**:
   - [ ] Connect Vercel to GitHub
   - [ ] Add environment variables
   - [ ] Deploy and test

3. **Post-Deployment**:
   - [ ] Test authentication flow
   - [ ] Test file uploads
   - [ ] Test real-time features
   - [ ] Configure custom domain
   - [ ] Set up monitoring

### ✅ Security Checklist

- [ ] Change all default passwords
- [ ] Enable HTTPS everywhere
- [ ] Configure proper CORS
- [ ] Set up rate limiting
- [ ] Enable database SSL
- [ ] Monitor for security updates

---

## 🆘 Troubleshooting Common Issues

### 1. Database Connection Errors

```bash
# Test connection manually
psql "jdbc:postgresql://your-host:5432/cryptlink?user=postgres&password=your_password"

# Common fixes:
# - Check firewall settings
# - Verify SSL configuration
# - Ensure database is running
```

### 2. Redis Connection Issues

```bash
# Test Redis connection
redis-cli -u redis://your-host:6379 -a your_password ping

# Common fixes:
# - Check Redis URL format
# - Verify password
# - Ensure Redis is running
```

### 3. CORS Errors

```bash
# Check backend logs for CORS errors
# Verify ALLOWED_ORIGINS includes your frontend URL
# Test with curl:
curl -H "Origin: https://yourdomain.com" https://your-backend.railway.app/api/health
```

### 4. JWT Token Issues

```bash
# Verify JWT secret is at least 256 bits
echo -n "$JWT_SECRET" | wc -c

# Should output 32 or more
```

---

## 📞 Getting Help

### Resources
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Upstash Docs**: [docs.upstash.com](https://docs.upstash.com)

### Community Support
- **GitHub Issues**: Create issue in repository
- **Discord**: Join development community
- **Stack Overflow**: Tag with `cryptlink`

---

## 🎯 Next Steps

After successful deployment:

1. **Monitor Performance**: Set up uptime monitoring
2. **Backup Strategy**: Configure database backups
3. **Analytics**: Add user analytics
4. **Scaling**: Prepare for increased traffic
5. **Security Audit**: Regular security reviews

---

## 📄 License & Attribution

This project is open-source. When deploying:
- Keep attribution notices
- Comply with license terms
- Consider contributing back improvements

---

**🎉 Congratulations! Your CryptLink instance is now ready to use!**

For additional support, check the GitHub repository or community forums.
