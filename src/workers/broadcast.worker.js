// File Path: src/workers/broadcast.worker.js

const { Worker } = require('bullmq');
const redisClient = require('../core/redis');
const BroadcastService = require('../services/BroadcastService');
const bot = require('../core/bot'); // Direct bot import to access raw Telegram API for error handling
const logger = require('../utils/logger.util');

/**
 * Broadcast Worker
 * Processes mass messaging queues safely.
 * Includes explicit error handling for blocked users (403) vs Rate Limits (429).
 */

const broadcastWorker = new Worker('broadcast-messages', async (job) => {
    const { campaignId, baleId, messageText, photoId } = job.data;

    try {
        // 1. Dispatch message using the raw bot instance
        if (photoId) {
            await bot.telegram.sendPhoto(baleId, photoId, {
                caption: messageText,
                parse_mode: 'Markdown'
            });
        } else {
            await bot.telegram.sendMessage(baleId, messageText, {
                parse_mode: 'Markdown'
            });
        }

        // 2. Mark as success in the database campaign tracker
        await BroadcastService.incrementProgress(campaignId, true);

    } catch (error) {
        // Bale/Telegram specific error codes
        const errorCode = error.response ? error.response.error_code : null;

        if (errorCode === 403) {
            // User blocked the bot. This is a permanent failure for this user.
            // We record the failure in the DB, but we DO NOT throw the error
            // so BullMQ doesn't waste resources retrying it.
            logger.warn(`[BroadcastWorker] User ${baleId} blocked the bot. Skipping.`);
            await BroadcastService.incrementProgress(campaignId, false);
            return;
        }

        if (errorCode === 400) {
            // Bad request (e.g., deleted account, invalid ID)
            logger.warn(`[BroadcastWorker] Invalid chat/user for ${baleId}. Skipping.`);
            await BroadcastService.incrementProgress(campaignId, false);
            return;
        }

        // If it's a network error (500) or Rate Limit (429), we DO throw the error.
        // BullMQ will catch it, wait (backoff delay), and retry this specific job.
        logger.error(`[BroadcastWorker] Temporary failure for user ${baleId}: ${error.message}`);
        throw error;
    }
}, {
    connection: redisClient,
    // Rate Limiting: Max 20 messages per second to strictly obey platform limits
    limiter: {
        max: 20,
        duration: 1000
    },
    // Concurrent processing limits
    concurrency: 10
});

// Event monitoring
broadcastWorker.on('failed', async (job, err) => {
    // This event fires if the job failed completely after ALL retry attempts
    if (job.attemptsMade >= job.opts.attempts) {
        logger.error(`[BroadcastWorker] Job ${job.id} permanently failed after retries.`);
        await BroadcastService.incrementProgress(job.data.campaignId, false);
    }
});

module.exports = broadcastWorker;