# VisionVoice - Production Deployment Guide

## ✅ Pre-Deployment Checklist

### Environment Setup

- [ ] Copy `.env.example` to `.env` in root directory
- [ ] Copy `server/.env.example` to `server/.env`
- [ ] Set `MONGODB_URI` to your production MongoDB connection string
- [ ] Set `GEMINI_API_KEY` to your valid Google Gemini API key
- [ ] Set `MURF_API_KEY` to your valid Murf.ai API key
- [ ] Set `FRONTEND_ORIGIN` to your production domain (e.g., `https://app.yourdomain.com`)
- [ ] Set `NODE_ENV=production` in `server/.env`
- [ ] Verify PORT is set (default: 5000)

### Database

- [ ] MongoDB cluster is created and accessible
- [ ] Connection string includes authentication credentials
- [ ] Database has sufficient quota for production load
- [ ] Regular backups are configured
- [ ] Replica set or cluster is enabled for high availability

### API Keys & Credentials

- [ ] GEMINI_API_KEY is valid and has sufficient quota
  - Test: `curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_KEY -H "Content-Type: application/json" -d '{"contents":[{"parts":[{"text":"test"}]}]}'`
- [ ] MURF_API_KEY is valid
  - Test voice generation after deployment
- [ ] All keys are stored in `.env` (never commit to git)
- [ ] Keys are rotated regularly (quarterly recommended)

### Build & Compilation

- [ ] Run `npm install` in root directory
- [ ] Run `npm install` in `server/` directory
- [ ] Run `npm run build` - should complete without errors
  - Output: `dist/` folder with minified assets
  - CSS: ~19 KB gzipped
  - JS: ~172 KB gzipped
- [ ] Verify `dist/index.html` exists
- [ ] Verify `dist/assets/` contains CSS and JS files

### Server Validation

- [ ] Run `node --check server/index.js` - no syntax errors
- [ ] Run `node --check server/src/app.js` - validates Express app
- [ ] Run `node --check server/src/config/env.js` - validates env config
- [ ] All required modules are installed: `express`, `cors`, `dotenv`, `mongoose`

### Security

- [ ] `.env` files are in `.gitignore`
- [ ] No secrets are hardcoded in source
- [ ] CORS origin is restricted to your domain (not `*`)
- [ ] HTTPS is enforced on production (use reverse proxy/CDN)
- [ ] Security headers are enabled (X-Content-Type-Options, X-Frame-Options, etc.)
- [ ] Input validation is active (base64 image max 6MB)
- [ ] Rate limiting is recommended (implement via reverse proxy)

### Network & Infrastructure

- [ ] Port 5000 is open (or configured port)
- [ ] Firewall allows inbound connections on API port
- [ ] Reverse proxy (Nginx/Apache) is configured to:
  - Enforce HTTPS
  - Handle compression
  - Balance load (if multiple instances)
  - Cache static assets `/health` endpoint
- [ ] SSL/TLS certificate is valid
- [ ] Domain DNS records point to server

### Monitoring & Logging

- [ ] Logging service is ready (console logs go to stdout)
- [ ] Application monitors request timing
- [ ] Error tracking (Sentry/DataDog) is optionally configured
- [ ] Health check endpoint is tested: `GET /health`
  - Expected response: `{ "status": "ready", "timestamp": "..." }`
- [ ] Database connection is monitored

### File Permissions & Ownership

- [ ] Application files are owned by app user (not root)
- [ ] `node_modules` is not world-readable
- [ ] `.env` file permissions are `600` (read/write owner only)
- [ ] `dist/` folder has correct read permissions

---

## 🚀 Deployment Steps

### 1. Prepare Server

```bash
# SSH into your production server
ssh user@your-domain.com

# Clone repository (or pull latest)
git clone <repo-url> /app/visionvoice
cd /app/visionvoice

# Install dependencies
npm install
cd server && npm install && cd ..
```

### 2. Configure Environment

```bash
# Create .env files
cp .env.example .env
cp server/.env.example server/.env

# Edit .env with production values
nano .env
nano server/.env

# Set permissions
chmod 600 .env server/.env
```

### 3. Build Frontend

```bash
npm run build

# Verify build succeeded
ls -la dist/assets/ | wc -l  # should show multiple files
```

### 4. Start Server (Development Testing)

```bash
cd server
npm start
```

**Expected output:**

```
[2024-XX-XX] Database connection failed. Retrying...
[2024-XX-XX] Connection attempt 1/3 failed. Retrying in 2000ms...
[2024-XX-XX] MongoDB connected (attempt 1/3)
[2024-XX-XX] Database connected successfully.
VisionVoice API ready on port 5000 (production)
```

### 5. Test Health Endpoint

```bash
# In another terminal
curl http://localhost:5000/health
```

**Expected response:**

```json
{ "status": "ready", "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ" }
```

### 6. Set Up Process Management (Recommended: PM2)

```bash
npm install -g pm2

# Create ecosystem config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "visionvoice-api",
    script: "./server/index.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production"
    },
    error_file: "./logs/error.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z"
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Monitor
pm2 logs visionvoice-api
```

### 7. Configure Reverse Proxy (Nginx)

```nginx
upstream visionvoice_api {
  server localhost:5000;
}

server {
  listen 443 ssl http2;
  server_name api.yourdomain.com;

  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  # Security headers
  add_header Strictransport-Security "max-age=31536000" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;

  # Compression
  gzip on;
  gzip_types application/json text/javascript;

  # API routes
  location /api/ {
    proxy_pass http://visionvoice_api;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
  }

  # Health check
  location /health {
    proxy_pass http://visionvoice_api;
    access_log off;
  }
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name api.yourdomain.com;
  return 301 https://$server_name$request_uri;
}
```

---

## 📊 Production Environment Variables Reference

| Variable            | Required   | Example                                              | Notes                                 |
| ------------------- | ---------- | ---------------------------------------------------- | ------------------------------------- |
| `NODE_ENV`          | Yes        | `production`                                         | Controls error verbosity & validation |
| `PORT`              | No         | `5000`                                               | API server port                       |
| `MONGODB_URI`       | **Yes**    | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` | Production MongoDB                    |
| `GEMINI_API_KEY`    | **Yes**    | (your key)                                           | Google Generative AI                  |
| `GEMINI_MODEL`      | No         | `gemini-2.5-flash`                                   | Model version                         |
| `MURF_API_KEY`      | No         | (your key)                                           | Murf.ai TTS (optional)                |
| `MURF_VOICE_ID`     | No         | `en-US-natalie`                                      | TTS voice                             |
| `FRONTEND_ORIGIN`   | Yes        | `https://app.yourdomain.com`                         | CORS whitelist                        |
| `MAX_IMAGE_BYTES`   | No         | `6291456`                                            | Max upload size (6MB)                 |
| `VITE_API_BASE_URL` | Yes (.env) | `https://api.yourdomain.com`                         | Frontend API endpoint                 |

---

## 🔍 Post-Deployment Verification

### 1. API Health

```bash
curl -i https://api.yourdomain.com/health
```

- Should return 200 with `{"status":"ready"}`

### 2. CORS Check

```bash
curl -i -H "Origin: https://app.yourdomain.com" https://api.yourdomain.com/health
```

- Should have `Access-Control-Allow-Origin` header

### 3. Image Upload Test

```bash
# Create test image
node -e "const fs=require('fs'); fs.writeFileSync('test.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');"

# Convert to base64
base64 -w 0 test.png > test.b64

# Send test request
curl -X POST https://api.yourdomain.com/api/add-object \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{"name":"test","image":"data:image/png;base64,'"$(cat test.b64)"'"}'
```

### 4. Log Monitoring

```bash
# Check server logs
pm2 logs visionvoice-api

# Expected healthy output:
# [timestamp] GET /health
# [timestamp] POST /api/add-object
```

### 5. Database Connection

```bash
# Test MongoDB connection
mongo mongodb+srv://user:pass@cluster.mongodb.net
```

- Should connect without authentication errors

---

## ⚠️ Troubleshooting

### "MONGODB_URI is required"

- Check `.env` file exists in `server/` directory
- Verify `MONGODB_URI` variable is set
- Ensure connection string is URL-encoded (especially password)

### "GEMINI_API_KEY is missing"

- Verify API key is valid at https://console.cloud.google.com
- Check quota hasn't been exceeded
- Confirm key has `generativelanguage.googleapis.com` API enabled

### "CORS origin not allowed"

- Verify `FRONTEND_ORIGIN` in `server/.env` matches your domain
- For multiple domains: `FRONTEND_ORIGIN=domain1.com,domain2.com`
- Check reverse proxy isn't stripping headers

### "Cannot connect to database"

- Verify MongoDB credentials in connection string
- Check firewall allows IP address
- Ensure MongoDB cluster IP whitelist includes server
- Test connection: `mongo <CONNECTION_STRING>`

### High Memory Usage

- Check for memory leaks: `pm2 monit`
- Restart process: `pm2 restart visionvoice-api`
- Consider increasing Node.js `--max-old-space-size=4096`

---

## 📈 Performance Tuning

### Node.js

```bash
# Increase memory for large image processing
node --max-old-space-size=4096 server/index.js
```

### Database

- Enable MongoDB connection pooling (default: 10)
- Configure read preference for replicas
- Enable compression in connection string

### API Response Caching

- Cache personal objects queries (5 min TTL)
- Cache user profile queries (10 min TTL)
- Implement Redis layer for distributed caching

### Rate Limiting (via Nginx)

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
  limit_req zone=api_limit burst=20 nodelay;
  # ... other config
}
```

---

## 🔐 Security Hardening

- [ ] Enable HTTPS/TLS only
- [ ] Set `Strict-Transport-Security` header (HSTS)
- [ ] Configure rate limiting per IP
- [ ] Monitor failed authentication attempts
- [ ] Implement DDoS protection (CloudFlare, AWS Shield)
- [ ] Regular security audits (`npm audit`)
- [ ] Log all API access for audit trail
- [ ] Implement request ID tracking for debugging
- [ ] Use environment-specific credentials

---

## 📞 Support & Monitoring

- **Logs**: PM2 logs, server stderr/stdout
- **Health**: GET `/health` endpoint
- **Database**: MongoDB connection & metrics
- **API Keys**: Monitor quota usage in respective dashboards
- **Performance**: Monitor response times via reverse proxy logs

---

**Last Updated**: 2024-03-18  
**Version**: 1.0.0
