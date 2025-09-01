#!/usr/bin/env node

const crypto = require('crypto');

/**
 * Generate cryptographically secure random strings for JWT secrets
 */
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate JWT secrets for different environments
 */
function generateJWTSecrets() {
  const secrets = {
    development: {
      JWT_SECRET: generateSecret(32),
      JWT_REFRESH_SECRET: generateSecret(32),
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    },
    production: {
      JWT_SECRET: generateSecret(64),
      JWT_REFRESH_SECRET: generateSecret(64),
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    },
    test: {
      JWT_SECRET: generateSecret(32),
      JWT_REFRESH_SECRET: generateSecret(32),
      JWT_ACCESS_EXPIRES_IN: '1h',
      JWT_REFRESH_EXPIRES_IN: '24h',
    }
  };

  return secrets;
}

/**
 * Generate additional security secrets
 */
function generateSecuritySecrets() {
  return {
    ENCRYPTION_KEY: generateSecret(32),
    SESSION_SECRET: generateSecret(32),
    API_KEY_SECRET: generateSecret(32),
    WEBHOOK_SECRET: generateSecret(32),
  };
}

/**
 * Main function
 */
function main() {
  console.log('🔐 Generating JWT Secrets for KabaBeats Backend\n');
  
  const jwtSecrets = generateJWTSecrets();
  const securitySecrets = generateSecuritySecrets();
  
  console.log('📋 JWT Secrets by Environment:');
  console.log('================================\n');
  
  Object.entries(jwtSecrets).forEach(([env, secrets]) => {
    console.log(`🌍 ${env.toUpperCase()} Environment:`);
    console.log(`   JWT_SECRET=${secrets.JWT_SECRET}`);
    console.log(`   JWT_REFRESH_SECRET=${secrets.JWT_REFRESH_SECRET}`);
    console.log(`   JWT_ACCESS_EXPIRES_IN=${secrets.JWT_ACCESS_EXPIRES_IN}`);
    console.log(`   JWT_REFRESH_EXPIRES_IN=${secrets.JWT_REFRESH_EXPIRES_IN}`);
    console.log('');
  });
  
  console.log('🔒 Additional Security Secrets:');
  console.log('================================\n');
  
  Object.entries(securitySecrets).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  
  console.log('\n📝 Environment File Template:');
  console.log('==============================\n');
  
  // Generate .env template
  const envTemplate = `# KabaBeats Backend Environment Variables
# Generated on ${new Date().toISOString()}

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kababeats?retryWrites=true&w=majority
MONGODB_TEST_URI=mongodb+srv://username:password@cluster.mongodb.net/kababeats-test?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=${jwtSecrets.development.JWT_SECRET}
JWT_REFRESH_SECRET=${jwtSecrets.development.JWT_REFRESH_SECRET}
JWT_ACCESS_EXPIRES_IN=${jwtSecrets.development.JWT_ACCESS_EXPIRES_IN}
JWT_REFRESH_EXPIRES_IN=${jwtSecrets.development.JWT_REFRESH_EXPIRES_IN}

# Security Secrets
ENCRYPTION_KEY=${securitySecrets.ENCRYPTION_KEY}
SESSION_SECRET=${securitySecrets.SESSION_SECRET}
API_KEY_SECRET=${securitySecrets.API_KEY_SECRET}
WEBHOOK_SECRET=${securitySecrets.WEBHOOK_SECRET}

# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET_NAME=kababeats-media
CLOUDFLARE_R2_REGION=auto

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Server Configuration
PORT=3000
NODE_ENV=development
API_VERSION=v1

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Media Processing
FFMPEG_PATH=ffmpeg
FFPROBE_PATH=ffprobe
TEMP_DIR=temp
CDN_BASE_URL=https://your-cdn-domain.com

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@kababeats.com

# Redis Configuration (Optional - for caching)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
NEW_RELIC_LICENSE_KEY=your_new_relic_key
`;

  console.log(envTemplate);
  
  console.log('\n⚠️  Security Notes:');
  console.log('==================');
  console.log('1. Keep these secrets secure and never commit them to version control');
  console.log('2. Use different secrets for each environment (dev, staging, production)');
  console.log('3. Rotate secrets regularly (every 90 days recommended)');
  console.log('4. Store production secrets in a secure secret management system');
  console.log('5. Use environment-specific .env files (.env.development, .env.production)');
  console.log('\n✅ Secrets generated successfully!');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateSecret,
  generateJWTSecrets,
  generateSecuritySecrets
};
