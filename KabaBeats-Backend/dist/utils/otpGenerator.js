"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
exports.generateOTPExpiration = generateOTPExpiration;
exports.isOTPExpired = isOTPExpired;
function generateOTP() {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
}
function generateOTPExpiration() {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15);
    return expiration;
}
function isOTPExpired(expirationDate) {
    return new Date() > expirationDate;
}
//# sourceMappingURL=otpGenerator.js.map