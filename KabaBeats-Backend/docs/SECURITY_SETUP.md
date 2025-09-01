# Security Setup Guide for KabaBeats Backend

## 🔐 JWT Secrets Generated

Your JWT secrets have been successfully generated! Here are the secure secrets for each environment:

### Development Environment
```bash
JWT_SECRET=8b6273744745c03180e4f1ed5b51f6c88b4c64d1a9c8792530985a9d3cb9a70f
JWT_REFRESH_SECRET=c2cf44088316f2e8f10149244733e9988ae2fc9c4b25b9639a180f9c3a5e045d
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Production Environment
```bash
JWT_SECRET=183f6c9349ea3e80deb110d93f0a8b714eaad8013065f37bf303829ad4043d7b73dadf9719cd2f0a1b8909481d0ac3dd6fa035efd8937822ecbe8b29cbef90d2
JWT_REFRESH_SECRET=95b5ad50f1cf5af7282eec6785ab5f91b25cac4c7d95d48b988053c652984a523123ff418b3a86780a9a0b2959660f870a85d6e0bc90c4cf0dc3d0092fb0c4bd
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Test Environment
```bash
JWT_SECRET=59706983263bf1888a8c81e0eb5c0e60b5ad613966f054aa8ddca69756c41706
JWT_REFRESH_SECRET=6cee9cd32524dbf61fc78b5e732ea29bebb112f9d6f77a77b33e0fddfe2b343e
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=24h
```

### Additional Security Secrets
```bash
ENCRYPTION_KEY=25c70c200c05c478ffc2864c562d9003a7eed192200b2ba4fa3371735d57dc80
SESSION_SECRET=5f14067b1adb94d0c166089e3268444d8149c3fdf40b7d22433668bf2b53e76c
API_KEY_SECRET=26bb7dc97c63979381bf0c91c8389ccbb67dd63d7e8211e906d1ac8ddece148f
WEBHOOK_SECRET=0ee636892aadea60cf94f1299715263805a70a742f5d14da8a8026c246e12339
```

## 🚀 Quick Setup

### 1. Create Environment File
```bash
# Copy the template to create your .env file
npm run setup:env

# Or manually copy
cp env.template .env
```

### 2. Update Your .env File
Edit the `.env` file and replace the placeholder values with your actual credentials:

```bash
# Database - Replace with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/kababeats?retryWrites=true&w=majority

# Cloudflare R2 - Replace with your R2 credentials
CLOUDFLARE_R2_ACCESS_KEY_ID=your_actual_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_actual_r2_secret_access_key
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# Google OAuth - Replace with your Google OAuth credentials
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
```

## 🔒 Security Best Practices

### 1. Environment File Security
- ✅ **Never commit .env files to version control**
- ✅ **Use different secrets for each environment**
- ✅ **Store production secrets in secure secret management systems**
- ✅ **Rotate secrets regularly (every 90 days)**

### 2. JWT Configuration
- **Access Token**: 15 minutes (short-lived for security)
- **Refresh Token**: 7 days (longer-lived for user convenience)
- **Secret Length**: 64 characters (cryptographically secure)
- **Algorithm**: HS256 (HMAC with SHA-256)

### 3. Production Security Checklist
- [ ] Use HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Enable request logging
- [ ] Set up monitoring and alerting
- [ ] Use environment-specific secrets
- [ ] Enable database encryption
- [ ] Set up backup strategies

## 🛡️ Security Features Implemented

### Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Password hashing** using bcrypt with salt rounds
- **Google OAuth integration** for social login
- **Role-based access control** (RBAC) ready
- **Session management** with secure cookies

### Data Protection
- **Input validation** using Joi schemas
- **SQL injection prevention** (MongoDB with proper queries)
- **XSS protection** with proper sanitization
- **CSRF protection** with secure tokens
- **Rate limiting** to prevent abuse

### Media Security
- **Presigned URLs** for secure file access
- **File type validation** for uploads
- **Size limits** to prevent abuse
- **Virus scanning** ready (can be added)
- **Watermarking** for content protection

## 🔧 Environment-Specific Configuration

### Development
```bash
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_MAX_REQUESTS=1000
```

### Production
```bash
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_MAX_REQUESTS=100
```

### Testing
```bash
NODE_ENV=test
LOG_LEVEL=error
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX_REQUESTS=10000
```

## 📋 Secret Management

### For Development
- Store secrets in `.env` file (never commit)
- Use different secrets for each developer
- Rotate secrets monthly

### For Production
- Use AWS Secrets Manager, Azure Key Vault, or similar
- Implement secret rotation automation
- Monitor secret usage and access
- Use environment-specific secret stores

### For CI/CD
- Store secrets in CI/CD environment variables
- Use encrypted secret files
- Implement secret scanning in pipelines
- Audit secret access regularly

## 🚨 Security Monitoring

### Logging
- **Authentication attempts** (success/failure)
- **API access patterns** (rate limiting triggers)
- **File upload activities** (size, type, frequency)
- **Database operations** (queries, errors)
- **System errors** (crashes, exceptions)

### Alerts
- **Failed login attempts** (brute force detection)
- **Unusual API usage** (potential attacks)
- **Large file uploads** (abuse detection)
- **Database errors** (performance issues)
- **System resource usage** (capacity planning)

## 🔄 Secret Rotation

### Manual Rotation
```bash
# Generate new secrets
npm run generate:secrets

# Update your .env file with new secrets
# Restart your application
```

### Automated Rotation
- Set up scheduled jobs to rotate secrets
- Use secret management services with auto-rotation
- Implement zero-downtime secret updates
- Monitor rotation success/failure

## 📞 Security Contacts

### In Case of Security Issues
1. **Immediate**: Disable affected services
2. **Investigation**: Review logs and access patterns
3. **Containment**: Rotate compromised secrets
4. **Recovery**: Restore from clean backups
5. **Prevention**: Update security measures

### Security Audit Checklist
- [ ] Review all environment variables
- [ ] Check for hardcoded secrets in code
- [ ] Verify HTTPS configuration
- [ ] Test authentication flows
- [ ] Validate input sanitization
- [ ] Review database permissions
- [ ] Check file upload security
- [ ] Test rate limiting
- [ ] Verify logging configuration
- [ ] Review error handling

## 🎯 Next Steps

1. **Set up your .env file** with actual credentials
2. **Configure your database** (MongoDB Atlas)
3. **Set up Cloudflare R2** for media storage
4. **Configure Google OAuth** for social login
5. **Test the authentication flow**
6. **Set up monitoring and alerting**
7. **Plan for secret rotation**

---

**Remember**: Security is an ongoing process, not a one-time setup. Regularly review and update your security measures to stay protected against evolving threats.
