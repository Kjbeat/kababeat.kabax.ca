"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("@/config/logger");
const email_1 = require("@/config/email");
class EmailService {
    constructor() {
        this.transporter = null;
    }
    getTransporter() {
        if (!this.transporter) {
            (0, email_1.testEmailConfig)();
            this.transporter = nodemailer_1.default.createTransport((0, email_1.getEmailConfig)());
        }
        return this.transporter;
    }
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: `"KabaBeats" <${process.env.SMTP_SENDER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                headers: {
                    'X-Mailer': 'KabaBeats',
                    'X-Priority': '3',
                },
            };
            logger_1.logger.info(`Attempting to send email to: ${options.to}`);
            const info = await this.getTransporter().sendMail(mailOptions);
            logger_1.logger.info(`✅ Email sent successfully to ${options.to} - Message ID: ${info.messageId}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to send email:', {
                to: options.to,
                subject: options.subject,
                error: error.message,
                code: error.code,
                response: error.response,
            });
            if (error.code === 'EAUTH') {
                throw new Error('SMTP authentication failed. Please check your Brevo credentials.');
            }
            else if (error.code === 'ECONNECTION') {
                throw new Error('Failed to connect to Brevo SMTP server.');
            }
            else if (error.response?.includes('535')) {
                throw new Error('Brevo authentication failed. Please verify your SMTP key and sender email.');
            }
            else {
                throw new Error(`Failed to send email: ${error.message}`);
            }
        }
    }
    generateOTPEmailHTML(otp, username, email) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your KabaBeats Account</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #6366f1;
            margin-bottom: 10px;
          }
          .otp-code {
            background-color: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #495057;
            font-family: 'Courier New', monospace;
          }
          .instructions {
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎵 KabaBeats</div>
            <h1>Verify Your Account</h1>
          </div>
          
          <p>Hi ${username},</p>
          
          <p>Welcome to KabaBeats! To complete your account setup and start creating amazing beats, please verify your email address using the code below:</p>
          
          <div class="otp-code">${otp}</div>
          
          <div class="instructions">
            <strong>Instructions:</strong>
            <ul>
              <li>Enter this 7-digit code in the verification page</li>
              <li>The code will expire in 15 minutes</li>
              <li>If you didn't create an account, please ignore this email</li>
            </ul>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> Never share this verification code with anyone. KabaBeats will never ask for your verification code via phone or email.
          </div>
          
          <p>Once verified, you'll have access to:</p>
          <ul>
            <li>🎼 Upload and share your beats</li>
            <li>🎧 Discover new music from creators worldwide</li>
            <li>💬 Connect with the music community</li>
            <li>🎨 Customize your profile and themes</li>
          </ul>
          
          <div class="footer">
            <p>This email was sent to ${email}</p>
            <p>© 2024 KabaBeats. All rights reserved.</p>
            <p>If you have any questions, contact us at support@kababeats.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    generateOTPEmailText(otp, username, email) {
        return `
KabaBeats - Verify Your Account

Hi ${username},

Welcome to KabaBeats! To complete your account setup, please verify your email address using the code below:

Verification Code: ${otp}

Instructions:
- Enter this 7-digit code in the verification page
- The code will expire in 15 minutes
- If you didn't create an account, please ignore this email

Security Notice: Never share this verification code with anyone. KabaBeats will never ask for your verification code via phone or email.

Once verified, you'll have access to:
- Upload and share your beats
- Discover new music from creators worldwide
- Connect with the music community
- Customize your profile and themes

This email was sent to ${email}
© 2024 KabaBeats. All rights reserved.
If you have any questions, contact us at support@kababeats.com
    `;
    }
    generatePasswordResetEmailHTML(resetToken, username, email, user) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your KabaBeats Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #6366f1;
            margin-bottom: 10px;
          }
          .reset-button {
            display: inline-block;
            background-color: #6366f1;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            transition: background-color 0.3s;
          }
          .reset-button:hover {
            background-color: #4f46e5;
          }
          .instructions {
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
          .token-display {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 10px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            word-break: break-all;
            color: #495057;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎵 KabaBeats</div>
            <h1>Reset Your Password</h1>
          </div>
          
          <p>Hi ${username},</p>
          
          <p>We received a request to ${user?.password ? 'reset your password' : 'set a password'} for your KabaBeats account. If you made this request, click the button below to ${user?.password ? 'reset' : 'set'} your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="reset-button">Reset My Password</a>
          </div>
          
          <div class="instructions">
            <strong>Alternative Method:</strong>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <div class="token-display">${resetUrl}</div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request a password reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
              <li>KabaBeats will never ask for your password via email</li>
            </ul>
          </div>
          
          <p>If you continue to have problems accessing your account, please contact our support team.</p>
          
          <div class="footer">
            <p>This email was sent to ${email}</p>
            <p>© 2024 KabaBeats. All rights reserved.</p>
            <p>If you have any questions, contact us at support@kababeats.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    generatePasswordResetEmailText(resetToken, username, email, user) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        return `
KabaBeats - Reset Your Password

Hi ${username},

We received a request to ${user?.password ? 'reset your password' : 'set a password'} for your KabaBeats account. If you made this request, use the link below to ${user?.password ? 'reset' : 'set'} your password:

Reset Link: ${resetUrl}

Instructions:
- Click the link above or copy and paste it into your browser
- This link will expire in 1 hour
- If you didn't request a password reset, please ignore this email

Security Notice:
- Never share this link with anyone
- KabaBeats will never ask for your password via email
- If you continue to have problems, contact our support team

This email was sent to ${email}
© 2024 KabaBeats. All rights reserved.
If you have any questions, contact us at support@kababeats.com
    `;
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=emailService.js.map