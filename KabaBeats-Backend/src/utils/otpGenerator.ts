/**
 * Generates a 7-digit OTP code
 * @returns {string} 7-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

/**
 * Generates OTP expiration time (15 minutes from now)
 * @returns {Date} Expiration date
 */
export function generateOTPExpiration(): Date {
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 15); // 15 minutes
  return expiration;
}

/**
 * Checks if OTP is expired
 * @param {Date} expirationDate - The expiration date of the OTP
 * @returns {boolean} True if expired, false otherwise
 */
export function isOTPExpired(expirationDate: Date): boolean {
  return new Date() > expirationDate;
}
