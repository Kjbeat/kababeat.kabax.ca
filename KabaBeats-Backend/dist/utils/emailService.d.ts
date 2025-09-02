interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
declare class EmailService {
    private transporter;
    constructor();
    private getTransporter;
    sendEmail(options: EmailOptions): Promise<void>;
    generateOTPEmailHTML(otp: string, username: string, email: string): string;
    generateOTPEmailText(otp: string, username: string, email: string): string;
    generatePasswordResetEmailHTML(resetToken: string, username: string, email: string, user?: any): string;
    generatePasswordResetEmailText(resetToken: string, username: string, email: string, user?: any): string;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=emailService.d.ts.map