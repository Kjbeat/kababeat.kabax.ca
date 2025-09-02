import { logger } from './logger';

export function testEmailConfig() {
  const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD ? '***' : 'MISSING'
  };
  

  logger.info('📧 Email Configuration Test:');
  logger.info(`Host: ${smtpConfig.host}`);
  logger.info(`Port: ${smtpConfig.port}`);
  logger.info(`User: ${smtpConfig.user}`);
  logger.info(`Pass: ${smtpConfig.password}`);

  // Check if all required fields are present
  const missingFields = [];
  if (!process.env.SMTP_HOST) missingFields.push('SMTP_HOST');
  if (!process.env.SMTP_PORT) missingFields.push('SMTP_PORT');
  if (!process.env.SMTP_USER) missingFields.push('SMTP_USER');
  if (!process.env.SMTP_PASSWORD) missingFields.push('SMTP_PASSWORD');

  if (missingFields.length > 0) {
    logger.error('❌ Missing email configuration fields:');
    missingFields.forEach(field => {
      logger.error(`   - ${field}`);
    });
    logger.error('Please add these fields to your .env file');
    return false;
  }

  logger.info('✅ All email configuration fields present');
  return true;
}

export function getEmailConfig() {
  return {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    // Brevo-specific settings
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 60000,     // 60 seconds
  };
}
