import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';

import { connectDatabase } from '@/config/database';
import { logger } from '@/config/logger';
import { errorHandler } from '@/utils/errorHandler';
import { notFoundHandler } from '@/utils/notFoundHandler';

// Import routes
import authRoutes from '@/routes/v1/auth.routes';
import userRoutes from '@/routes/v1/user.routes';
import beatRoutes from '@/routes/v1/beat.routes';
import playlistRoutes from '@/routes/v1/playlist.routes';
import mediaRoutes from '@/routes/v1/media.routes';
import browseRoutes from '@/routes/v1/browse.routes';
import connectionRoutes from '@/routes/v1/connection.routes';
import creatorRoutes from '@/routes/v1/creator.routes';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/beats', beatRoutes);
app.use('/api/v1/playlists', playlistRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/browse', browseRoutes);
app.use('/api/v1/connections', connectionRoutes);
app.use('/api/v1/creators', creatorRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // GraphQL setup temporarily disabled - will be implemented later
    // const graphqlServer = await createGraphQLServer();
    
    // Add GraphQL endpoint placeholder
    app.use('/graphql', (req, res, next) => {
      res.json({ message: 'GraphQL endpoint coming soon', status: 'under development' });
    });
    
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
      logger.info(`🔮 GraphQL endpoint available at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
