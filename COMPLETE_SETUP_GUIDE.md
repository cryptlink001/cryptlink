# 🚀 Complete CryptLink Setup Guide

## 📋 Step-by-Step Credential Setup

Follow these exact steps to get all required credentials for CryptLink deployment.

---

## 🗄️ 1. PostgreSQL Database (Supabase)

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub or Google
4. Verify your email

### Step 2: Create Database
1. Click **"New Project"**
2. Choose organization (create one if needed)
3. Project settings:
   ```
   Project Name: cryptlink-db
   Database Password: CryptLink2024!Secure
   Region: Choose nearest to you
   Pricing plan: Free
   ```
4. Click **"Create new project"**
5. Wait for database to be ready (2-3 minutes)

### Step 3: Get Database Credentials
1. Go to **Settings** → **Database**
2. Copy **Connection string**:
   ```
   jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
3. Copy **Connection parameters**:
   ```
   Host: aws-0-us-east-1.pooler.supabase.com
   Port: 6543
   Database: postgres
   Username: postgres
   Password: CryptLink2024!Secure
   ```

---

## 🔄 2. Redis Cache (Upstash)

### Step 1: Create Upstash Account
1. Go to [upstash.com](https://upstash.com)
2. Click **"Sign up"**
3. Use GitHub or email
4. Verify email

### Step 2: Create Redis Database
1. Click **"Create Database"**
2. Database settings:
   ```
   Database Name: cryptlink-redis
   Region: Choose nearest
   Enable TLS: Yes
   ```
3. Click **"Create"**

### Step 3: Get Redis Credentials
1. Go to **Details** tab
2. Copy **REST URL**:
   ```
   https://cryptlink-redis.upstash.io
   ```
3. Copy **REST Token**:
   ```
   your_upstash_token_here
   ```
4. Copy **Connection Info**:
   ```
   Host: cryptlink-redis.upstash.io
   Port: 6379
   Password: your_upstash_token_here
   ```

---

## 📁 3. Cloud Storage (Cloudflare R2)

### Step 1: Create Cloudflare Account
1. Go to [cloudflare.com](https://cloudflare.com)
2. Click **"Sign up"**
3. Use email and verify
4. Choose free plan

### Step 2: Enable R2 Storage
1. Go to **R2 Object Storage** (left menu)
2. Click **"Get started"**
3. Accept terms (no credit card needed for free tier)

### Step 3: Create Storage Bucket
1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```
2. Login to Cloudflare:
   ```bash
   wrangler login
   ```
3. Create bucket:
   ```bash
   wrangler r2 bucket create cryptlink-media
   ```
4. Verify bucket:
   ```bash
   wrangler r2 bucket list
   ```

### Step 4: Get API Credentials
1. Go to **My Profile** → **API Tokens**
2. Click **"Create token"**
3. Token settings:
   ```
   Token name: CryptLink R2 Access
   Permissions: Custom token
   Account: Your account
   Zone Resources: All zones
   Permission scopes:
     - R2:Edit
   ```
4. Click **"Continue to summary"**
5. Copy **Token ID** and **Token Secret**

---

## 🌐 4. Backend Hosting (Railway)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click **"Sign up"**
3. Use GitHub (recommended)
4. Verify email

### Step 2: Prepare Code
1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial CryptLink commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/cryptlink.git
   git push -u origin main
   ```

### Step 3: Deploy Backend
1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Select your `cryptlink` repository
3. Configure deployment:
   ```
   Build Command: ./mvnw clean install
   Start Command: java -jar target/cryptlink-0.0.1-SNAPSHOT.jar
   ```
4. Click **"Deploy"**

### Step 4: Configure Environment Variables
1. Go to your project → **Settings** → **Variables**
2. Add these variables:

   **Database:**
   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:6543/postgres
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=CryptLink2024!Secure
   ```

   **Redis:**
   ```
   SPRING_DATA_REDIS_HOST=cryptlink-redis.upstash.io
   SPRING_DATA_REDIS_PORT=6379
   SPRING_DATA_REDIS_PASSWORD=your_upstash_token_here
   ```

   **JWT:**
   ```
   JWT_SECRET=CryptLinkSuperSecureJWTSecretKey2024!Minimum256BitsLongForProduction
   JWT_EXPIRATION=86400000
   JWT_REFRESH_EXPIRATION=604800000
   ```

   **Storage:**
   ```
   CLOUD_STORAGE_PROVIDER=cloudflare_r2
   CLOUD_STORAGE_BUCKET=cryptlink-media
   CLOUD_STORAGE_ACCESS_KEY=your_r2_token_id
   CLOUD_STORAGE_SECRET_KEY=your_r2_token_secret
   ```

   **CORS:**
   ```
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```

3. Click **"Deploy"** again to apply changes

### Step 5: Get Backend URL
1. Go to **Settings** → **Networking**
2. Copy your Railway URL:
   ```
   https://cryptlink-api-production.up.railway.app
   ```

---

## 🌍 5. Frontend Hosting (Vercel)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign up"**
3. Use GitHub (recommended)
4. Verify email

### Step 2: Deploy Frontend
1. Click **"New Project"**
2. Import your GitHub repository
3. Configure settings:
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```
4. Click **"Deploy"**

### Step 3: Configure Environment Variables
1. Go to project → **Settings** → **Environment Variables**
2. Add these variables:
   ```
   REACT_APP_API_URL=https://cryptlink-api-production.up.railway.app/api
   REACT_APP_WS_URL=wss://cryptlink-api-production.up.railway.app/ws
   REACT_APP_ENV=production
   REACT_APP_DEBUG=false
   ```
3. Click **"Redeploy"**

### Step 4: Get Frontend URL
1. Copy your Vercel URL from dashboard:
   ```
   https://cryptlink-frontend.vercel.app
   ```

---

## 📧 6. Email Service (Optional - Gmail SMTP)

### Step 1: Enable 2FA on Gmail
1. Go to Google Account settings
2. Enable **2-Step Verification**
3. Go to **Security** → **App Passwords**
4. Generate new app password:
   ```
   App: Mail
   Device: CryptLink
   ```
5. Copy the generated password

### Step 2: Add Email Variables to Railway
Add these to your Railway environment variables:
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_generated_app_password
MAIL_FROM=noreply@cryptlink.app
```

---

## 🔐 7. Generate Secure JWT Secret

Run this command to generate a secure JWT secret:
```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Example output:**
```
xY9zK2mN8pQ5vR7wE3tA6sD4fG1hJ9kL0=
```

---

## 📝 8. Complete Environment Files

### Backend (.env)
```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:6543/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=CryptLink2024!Secure

# Redis
SPRING_DATA_REDIS_HOST=cryptlink-redis.upstash.io
SPRING_DATA_REDIS_PORT=6379
SPRING_DATA_REDIS_PASSWORD=your_upstash_token_here

# JWT
JWT_SECRET=xY9zK2mN8pQ5vR7wE3tA6sD4fG1hJ9kL0=
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Storage
CLOUD_STORAGE_PROVIDER=cloudflare_r2
CLOUD_STORAGE_BUCKET=cryptlink-media
CLOUD_STORAGE_ACCESS_KEY=your_r2_token_id
CLOUD_STORAGE_SECRET_KEY=your_r2_token_secret

# CORS
ALLOWED_ORIGINS=https://cryptlink-frontend.vercel.app

# Email (optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@cryptlink.app
```

### Frontend (.env)
```bash
REACT_APP_API_URL=https://cryptlink-api-production.up.railway.app/api
REACT_APP_WS_URL=wss://cryptlink-api-production.up.railway.app/ws
REACT_APP_ENV=production
REACT_APP_DEBUG=false
```

---

## 🚀 9. Final Deployment Steps

### Step 1: Update CORS
1. Go to Railway → **Variables**
2. Update `ALLOWED_ORIGINS` with your actual Vercel URL
3. Redeploy

### Step 2: Test Application
1. Visit your Vercel URL
2. Test signup/login
3. Test messaging
4. Test file uploads

### Step 3: Configure Custom Domain (Optional)
1. **Frontend**: Vercel → Settings → Domains
2. **Backend**: Railway → Settings → Networking
3. Update DNS records as instructed

---

## 🎯 10. Verification Checklist

Before going live, verify:

- [ ] Database connection works
- [ ] Redis connection works
- [ ] JWT authentication works
- [ ] File uploads work
- [ ] Real-time messaging works
- [ ] All environment variables set
- [ ] CORS properly configured
- [ ] HTTPS enabled everywhere
- [ ] Error monitoring set up

---

## 🆘 Troubleshooting

### Common Issues & Solutions

**Database Connection Error:**
```bash
# Test connection manually
psql "jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:6543/postgres?user=postgres&password=CryptLink2024!Secure"
```

**Redis Connection Error:**
```bash
# Test Redis connection
curl -H "Authorization: Bearer your_upstash_token" https://cryptlink-redis.upstash.io/ping
```

**CORS Error:**
- Check `ALLOWED_ORIGINS` includes your frontend URL
- Verify no trailing slashes
- Check case sensitivity

**JWT Error:**
- Ensure JWT secret is at least 256 bits
- Check for special characters in secret
- Verify environment variable name

---

## 💰 Cost Summary (All Free Tiers)

| Service | Free Tier Limits | Monthly Cost |
|---------|------------------|--------------|
| Supabase | 500MB DB, 50MB storage, 2GB bandwidth | $0 |
| Upstash | 10K commands/day, 256MB storage | $0 |
| Cloudflare R2 | 10GB storage, 1M class A operations | $0 |
| Railway | 500 hours/month, 100MB storage | $0 |
| Vercel | 100GB bandwidth, 100 builds | $0 |

**Total Monthly Cost: $0**

---

## 🎉 You're Ready!

Your CryptLink application is now fully deployed with:
- ✅ Secure PostgreSQL database
- ✅ Fast Redis cache
- ✅ Cloud file storage
- ✅ Real-time WebSocket messaging
- ✅ Advanced privacy features
- ✅ Cyberpunk UI design
- ✅ Production-ready security

**Your app is live at:** `https://cryptlink-frontend.vercel.app`

For support, check the GitHub repository or community forums! 🚀
