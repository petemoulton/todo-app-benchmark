/**
 * Server entry point
 */
import app from './app.js';
import { testConnection, closePool } from './utils/db.js';

const PORT = process.env.PORT || 3000;

/**
 * Start the server
 */
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    console.log('✅ Database connection established');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📈 Stats: http://localhost:${PORT}/api/stats`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n🔄 Shutting down gracefully...');
      server.close(async () => {
        await closePool();
        console.log('✅ Server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { startServer };
