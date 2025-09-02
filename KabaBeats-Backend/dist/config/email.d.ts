export declare function testEmailConfig(): boolean;
export declare function getEmailConfig(): {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string | undefined;
        pass: string | undefined;
    };
    tls: {
        rejectUnauthorized: boolean;
    };
    connectionTimeout: number;
    greetingTimeout: number;
    socketTimeout: number;
};
//# sourceMappingURL=email.d.ts.map