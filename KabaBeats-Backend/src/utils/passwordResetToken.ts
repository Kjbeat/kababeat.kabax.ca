import crypto from 'crypto';

/**
 * Generate a secure password reset token
 * @returns {string} A random 32-byte hex string
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate password reset token expiration date
 * @returns {Date} Date 1 hour from now
 */
export function generatePasswordResetExpiration(): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1); // 1 hour from now
  return expiration;
}

/**
 * Check if password reset token is expired
 * @param {Date} expirationDate - The expiration date to check
 * @returns {boolean} True if expired, false if still valid
 */
export function isPasswordResetTokenExpired(expirationDate: Date): boolean {
  return new Date() > expirationDate;
}
