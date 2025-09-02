"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const database_1 = require("@/config/database");
const logger_1 = require("@/config/logger");
const redis_1 = require("@/config/redis");
const errorHandler_1 = require("@/utils/errorHandler");
const notFoundHandler_1 = require("@/utils/notFoundHandler");
const auth_routes_1 = __importDefault(require("@/routes/v1/auth.routes"));
const user_routes_1 = __importDefault(require("@/routes/v1/user.routes"));
const beat_routes_1 = __importDefault(require("@/routes/v1/beat.routes"));
const playlist_routes_1 = __importDefault(require("@/routes/v1/playlist.routes"));
const media_routes_1 = __importDefault(require("@/routes/v1/media.routes"));
const browse_routes_1 = __importDefault(require("@/routes/v1/browse.routes"));
const connection_routes_1 = __importDefault(require("@/routes/v1/connection.routes"));
const creator_routes_1 = __importDefault(require("@/routes/v1/creator.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3000;
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/beats', beat_routes_1.default);
app.use('/api/v1/playlists', playlist_routes_1.default);
app.use('/api/v1/media', media_routes_1.default);
app.use('/api/v1/browse', browse_routes_1.default);
app.use('/api/v1/connections', connection_routes_1.default);
app.use('/api/v1/creators', creator_routes_1.default);
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        await (0, redis_1.initializeRedis)();
        app.use('/graphql', (req, res, next) => {
            res.json({ message: 'GraphQL endpoint coming soon', status: 'under development' });
        });
        httpServer.listen(PORT, () => {
            logger_1.logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
            logger_1.logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
            logger_1.logger.info(`🔮 GraphQL endpoint available at http://localhost:${PORT}/graphql`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    await (0, redis_1.shutdownRedis)();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    await (0, redis_1.shutdownRedis)();
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map