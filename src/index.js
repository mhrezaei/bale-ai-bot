/**
 * =======================================================
 * HEDIOUM VPN SYSTEM - ENTERPRISE BOOTSTRAP (BOT & WORKERS)
 * =======================================================
 * Application Entry Point.
 * Orchestrates MongoDB, Redis, BullMQ Workers, and the Telegraf Bot.
 * Implements strict startup order and graceful shutdown procedures.
 */

const mongoose = require('mongoose');
const db = require('./core/db');
const redisClient = require('./core/redis'); // Singleton Redis Connection
const bot = require('./core/bot');

// --- Import Workers ---
// We import them here, but we will explicitly start the Cron-based ones after DB connection
const clientWorker = require('./workers/client.worker');     // BullMQ worker (starts automatically on instantiate)
const healthWorker = require('./workers/health.worker');     // Cron-based
const syncWorker = require('./workers/sync.worker');         // Cron-based
const balancerWorker = require('./workers/balancer.worker'); // Cron-based

/**
 * Main Bootstrap Function
 * Ensures sequential loading of all critical infrastructure components.
 */
const bootstrap = async () => {
    console.log('\n=============================================');
    console.log('🚀 Starting Hedioum Bot & Worker Node... ');
    console.log('=============================================\n');

    try {
        // 1. Initialize MongoDB (Critical Dependency)
        await db.connect();
        console.log('✅ [System] MongoDB initialized successfully.');

        // 2. Redis Check (Ensure connection is ready for Sessions & BullMQ)
        if (redisClient.status !== 'ready') {
            console.log('⏳ [System] Waiting for Redis connection...');
            await new Promise((resolve) => redisClient.once('ready', resolve));
        }
        console.log('✅ [System] Redis Cache & Queue layer is ready.');

        // 3. Start Background Workers
        // CRITICAL: Must be started AFTER databases are fully connected
        console.log('⏳ [System] Starting background workers...');
        healthWorker.start();
        syncWorker.start();
        balancerWorker.start();
        console.log('✅ [System] Background Workers started successfully.');

        // 4. Launch Telegraf Bot
        // We use non-blocking launch to prevent hanging on network proxy issues
        bot.launch({ dropPendingUpdates: true })
            .then(() => console.log('✅ [System] Bot is now actively polling Telegram.'))
            .catch((err) => {
                console.error('❌ [FATAL] Bot Launch failed:', err.message);
                gracefulShutdown('BOT_CRASH');
            });

        // 5. Verify Bot Identity
        // If the proxy is disabled and the network is restricted, this might throw an error.
        // Handled by the catch block to prevent running a zombie process.
        const botInfo = await bot.telegram.getMe();
        console.log(`🎉 [System] Bot connected successfully as: @${botInfo.username}\n`);

    } catch (error) {
        console.error('❌ [FATAL ERROR] Application Bootstrap Failed:');
        console.error(error.message);
        process.exit(1);
    }
};

/**
 * Graceful Shutdown Logic
 * Ensures all connections and jobs are safely closed before exiting.
 * Prevents memory leaks and orphaned database locks.
 */
const gracefulShutdown = async (signal) => {
    console.log(`\n⚠️ [${signal}] Graceful shutdown initiated...`);

    try {
        // 1. Stop Telegram Bot polling
        if (bot) bot.stop(signal);
        console.log('🛑 [Shutdown] Bot polling stopped.');

        // 2. Stop BullMQ Worker to prevent orphaned jobs
        if (clientWorker) {
            await clientWorker.close();
            console.log('🛑 [Shutdown] BullMQ Client worker closed safely.');
        }

        // 3. Close Redis Connection
        if (redisClient) {
            await redisClient.quit();
            console.log('🛑 [Shutdown] Redis connection closed.');
        }

        // 4. Close MongoDB Connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close(false);
            console.log('🛑 [Shutdown] MongoDB connection closed.');
        }

        console.log('💤 [Shutdown] System exited safely.');
        process.exit(0);
    } catch (error) {
        console.error('❌ [Shutdown Error] Force exiting...', error);
        process.exit(1);
    }
};

// Listen for termination signals from PM2, Docker, or Node.js (Ctrl+C)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions globally to prevent silent crashes
process.on('uncaughtException', (err) => {
    console.error('❌ [Uncaught Exception]:', err);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Start the Engine
bootstrap();