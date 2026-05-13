// File Path: src/index.js

/**
 * =======================================================
 * AI ASSISTANT SYSTEM - ENTERPRISE BOOTSTRAP
 * =======================================================
 * Application Entry Point.
 * Orchestrates MongoDB, Redis, BullMQ Workers, Express Web Server, and the Telegraf Bot.
 * Uses Webhooks for high-performance updates from Bale Messenger.
 */

const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/env');
const db = require('./core/db');
const redisClient = require('./core/redis');
const bot = require('./core/bot');
const logger = require('./utils/logger.util');

// --- Import Background Workers ---
// Importing them instantiates the BullMQ workers so they start listening to Redis queues
const openaiWorker = require('./workers/openai.worker');
const broadcastWorker = require('./workers/broadcast.worker');

const app = express();
const PORT = config.port || 3000;

// A secure, randomized path for the webhook to prevent malicious external requests
const WEBHOOK_PATH = `/api/webhook/bale/${config.botToken}`;

/**
 * Main Bootstrap Function
 */
const bootstrap = async () => {
    logger.info('\n=============================================');
    logger.info('🚀 Starting AI Assistant Bot & Worker Node... ');
    logger.info('=============================================\n');

    try {
        // 1. Initialize MongoDB
        await db.connect();
        logger.info('✅ [System] MongoDB initialized successfully.');

        // 2. Wait for Redis connection to be fully ready
        if (redisClient.status !== 'ready') {
            logger.info('⏳ [System] Waiting for Redis connection...');
            await new Promise((resolve) => redisClient.once('ready', resolve));
        }
        logger.info('✅ [System] Redis Cache & BullMQ layer is ready.');

        // 3. Workers are already initialized via imports. Just logging their status.
        logger.info('✅ [System] Background Workers (OpenAI & Broadcast) are active.');

        // 4. Configure Express Web Server & Webhook
        app.use(express.json()); // Essential for parsing incoming Bale webhook payloads

        // Let Telegraf handle the requests coming to this secure path
        app.use(bot.webhookCallback(WEBHOOK_PATH));

        // Basic health check route for your monitoring tools
        app.get('/health', (req, res) => res.status(200).send('OK'));

        // 5. Start Express Server
        const server = app.listen(PORT, async () => {
            logger.info(`✅ [System] Express Web Server running on port ${PORT}`);

            // 6. Tell Bale API to send updates to our Webhook URL
            if (config.webhookDomain) {
                const fullWebhookUrl = `${config.webhookDomain}${WEBHOOK_PATH}`;
                await bot.telegram.setWebhook(fullWebhookUrl);
                logger.info(`🎉 [System] Webhook successfully set to: ${config.webhookDomain}`);

                const botInfo = await bot.telegram.getMe();
                logger.info(`🤖 [System] Bot connected successfully as: @${botInfo.username}\n`);
            } else {
                logger.warn('⚠️ [System] "webhookDomain" is missing in .env. Bot will NOT receive updates via webhook.');
                // Fallback to polling for local development if webhook is not set
                logger.info('⏳ [System] Falling back to long-polling mode for local development...');
                await bot.telegram.deleteWebhook();
                bot.launch();
            }
        });

        // Attach server to process for graceful shutdown
        process.server = server;

    } catch (error) {
        logger.error('❌ [FATAL ERROR] Application Bootstrap Failed:', error);
        process.exit(1);
    }
};

/**
 * Graceful Shutdown Logic
 * Prevents data corruption by closing all connections safely.
 */
const gracefulShutdown = async (signal) => {
    logger.warn(`\n⚠️ [${signal}] Graceful shutdown initiated...`);

    try {
        // 1. Stop Express Server (stop accepting new requests)
        if (process.server) {
            process.server.close(() => logger.info('🛑 [Shutdown] Web server closed.'));
        }

        // 2. Stop BullMQ Workers to prevent orphaned jobs
        if (openaiWorker) await openaiWorker.close();
        if (broadcastWorker) await broadcastWorker.close();
        logger.info('🛑 [Shutdown] Background workers closed safely.');

        // 3. Close Redis Connection
        if (redisClient) {
            await redisClient.quit();
            logger.info('🛑 [Shutdown] Redis connection closed.');
        }

        // 4. Close MongoDB Connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close(false);
            logger.info('🛑 [Shutdown] MongoDB connection closed.');
        }

        logger.info('💤 [Shutdown] System exited safely.');
        process.exit(0);
    } catch (error) {
        logger.error('❌ [Shutdown Error] Force exiting...', error);
        process.exit(1);
    }
};

// Listen for termination signals (PM2, Docker, Ctrl+C)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (err) => {
    logger.error('❌ [Uncaught Exception]:', err);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Start the Engine
bootstrap();