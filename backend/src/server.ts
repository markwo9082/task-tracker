import app from './app';
import config from './config/env';
import logger from './config/logger';
import prisma from './config/database';

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${config.nodeEnv} mode`);
  logger.info(`API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, closing server gracefully`);

  server.close(async () => {
    logger.info('HTTP server closed');

    // Close database connection
    await prisma.$disconnect();
    logger.info('Database connection closed');

    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

export default server;
