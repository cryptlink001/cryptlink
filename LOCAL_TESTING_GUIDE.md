# 🧪 CryptLink Local Testing Guide

## 🎯 **Step-by-Step Local Testing**

### **1. Prerequisites Check**

#### **Java Installation**
```bash
# Check Java version (should be 17+)
java -version

# If not installed, download from:
# https://adoptium.net/
```

#### **Node.js Installation**
```bash
# Check Node.js version (should be 18+)
node --version
npm --version

# If not installed, download from:
# https://nodejs.org/
```

#### **Git Installation**
```bash
# Check Git version
git --version

# If not installed, download from:
# https://git-scm.com/
```

---

### **2. Backend Testing**

#### **Step 2.1: Navigate to Backend Directory**
```bash
cd d:\CryptLink\backend
```

#### **Step 2.2: Test Database Connection**
```bash
# Test your Supabase connection with this SQL:
# Copy and paste the contents of test_connection.sql into your Supabase SQL Editor
```

#### **Step 2.3: Build the Backend**
```bash
# Clean and build the project
mvn clean install -DskipTests

# If mvn is not recognized, use:
.\mvnw.cmd clean install -DskipTests
```

#### **Step 2.4: Start the Backend Server**
```bash
# Start the application
mvn spring-boot:run

# Or using Maven wrapper:
.\mvnw.cmd spring-boot:run
```

#### **Step 2.5: Verify Backend is Running**
Open your browser and go to:
```
http://localhost:8080/api/health
```

**Expected Response:**
```json
{
  "status": "UP",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### **Step 2.6: Test API Endpoints**
```bash
# Test authentication endpoint
curl -X GET http://localhost:8080/api/auth/me

# Test user registration
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "displayName": "Test User"
  }'
```

---

### **3. Frontend Testing**

#### **Step 3.1: Navigate to Frontend Directory**
```bash
# Open new terminal window
cd d:\CryptLink\frontend
```

#### **Step 3.2: Install Dependencies**
```bash
npm install
```

#### **Step 3.3: Start the Frontend**
```bash
npm start
```

#### **Step 3.4: Verify Frontend is Running**
Open your browser and go to:
```
http://localhost:3000
```

**Expected:** CryptLink login page should load with cyberpunk UI

---

### **4. Integration Testing**

#### **Step 4.1: Test User Registration**
1. Go to `http://localhost:3000/signup`
2. Fill in the registration form
3. Click "Sign Up"
4. Verify you're redirected to login page

#### **Step 4.2: Test User Login**
1. Go to `http://localhost:3000/login`
2. Enter your credentials
3. Click "Login"
4. Verify you're redirected to main app

#### **Step 4.3: Test Real-time Features**
1. Open two browser windows
2. Log in with different users
3. Send messages between users
4. Verify real-time message delivery

#### **Step 4.4: Test File Upload**
1. Go to the post creator
2. Upload an image
3. Verify it's processed and displayed

---

### **5. Troubleshooting Common Issues**

#### **Backend Issues**

**Issue: Port 8080 already in use**
```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process
taskkill /PID <PID> /F

# Or change port in application.properties:
server.port=8081
```

**Issue: Database connection failed**
```bash
# Check your .env file
cat backend/.env

# Verify Supabase credentials
# Test connection in Supabase SQL Editor
```

**Issue: Redis connection failed**
```bash
# Test Redis connection
curl -H "Authorization: Bearer your_redis_token" \
     https://crack-roughly-113743.upstash.io/ping

# Expected response: PONG
```

#### **Frontend Issues**

**Issue: Port 3000 already in use**
```bash
# Kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port:
npm start -- --port=3001
```

**Issue: API connection failed**
```bash
# Check frontend .env file
cat frontend/.env

# Verify backend is running
curl http://localhost:8080/api/health
```

**Issue: WebSocket connection failed**
```bash
# Check browser console for WebSocket errors
# Verify backend WebSocket configuration
```

---

### **6. Performance Testing**

#### **Test Database Performance**
```bash
# Create test data
curl -X POST http://localhost:8080/api/test/create-data

# Test query performance
curl -X GET http://localhost:8080/api/test/performance
```

#### **Test Redis Performance**
```bash
# Test Redis operations
curl -X POST http://localhost:8080/api/test/redis-performance
```

#### **Test WebSocket Performance**
```bash
# Test message throughput
curl -X POST http://localhost:8080/api/test/websocket-performance
```

---

### **7. Security Testing**

#### **Test Authentication**
```bash
# Test JWT token validation
curl -H "Authorization: Bearer invalid_token" \
     http://localhost:8080/api/auth/me

# Expected: 401 Unauthorized
```

#### **Test Input Validation**
```bash
# Test SQL injection protection
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin'; DROP TABLE users; --"}'

# Expected: 400 Bad Request
```

#### **Test CORS Configuration**
```bash
# Test CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:8080/api/auth/register

# Expected: CORS headers present
```

---

### **8. Logging and Debugging**

#### **Enable Debug Logging**
Add to `application.properties`:
```properties
logging.level.com.cryptlink=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.springframework.security=DEBUG
```

#### **Check Application Logs**
```bash
# View real-time logs
tail -f logs/cryptlink.log

# Or check console output
```

#### **Frontend Debugging**
```bash
# Enable React dev tools
npm install --save-dev react-devtools

# Check browser console
# Use React DevTools extension
```

---

### **9. Test Results Checklist**

- [ ] Backend starts successfully on port 8080
- [ ] Frontend starts successfully on port 3000
- [ ] Database connection works
- [ ] Redis connection works
- [ ] User registration works
- [ ] User login works
- [ ] JWT authentication works
- [ ] Real-time messaging works
- [ ] File upload works
- [ ] API endpoints respond correctly
- [ ] WebSocket connection works
- [ ] CORS headers are correct
- [ ] Error handling works
- [ ] Security measures are active

---

### **10. Ready for Deployment**

If all tests pass, your CryptLink application is ready for deployment!

**Next Steps:**
1. Commit your changes to Git
2. Deploy to Railway (backend)
3. Deploy to Vercel (frontend)
4. Update production URLs

**Your local testing is complete!** 🎉
