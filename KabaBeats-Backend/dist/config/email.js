"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEmailConfig = testEmailConfig;
exports.getEmailConfig = getEmailConfig;
const logger_1 = require("./logger");
function testEmailConfig() {
    const smtpConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD ? '***' : 'MISSING'
    };
    logger_1.logger.info('📧 Email Configuration Test:');
    logger_1.logger.info(`Host: ${smtpConfig.host}`);
    logger_1.logger.info(`Port: ${smtpConfig.port}`);
    logger_1.logger.info(`User: ${smtpConfig.user}`);
    logger_1.logger.info(`Pass: ${smtpConfig.password}`);
    const missingFields = [];
    if (!process.env.SMTP_HOST)
        missingFields.push('SMTP_HOST');
    if (!process.env.SMTP_PORT)
        missingFields.push('SMTP_PORT');
    if (!process.env.SMTP_USER)
        missingFields.push('SMTP_USER');
    if (!process.env.SMTP_PASSWORD)
        missingFields.push('SMTP_PASSWORD');
    if (missingFields.length > 0) {
        logger_1.logger.error('❌ Missing email configuration fields:');
        missingFields.forEach(field => {
            logger_1.logger.error(`   - ${field}`);
        });
        logger_1.logger.error('Please add these fields to your .env file');
        return false;
    }
    logger_1.logger.info('✅ All email configuration fields present');
    return true;
}
function getEmailConfig() {
    return {
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
    };
}
//# sourceMappingURL=email.js.map