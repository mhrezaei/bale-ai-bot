// File Path: src/core/redis.js

const Redis = require('ioredis');
const config = require('../config/env');
const logger = require('../utils/logger.util');

/**
 * Redis Core Connection
 * Provides a highly resilient, singleton Redis connection using ioredis.
 * Node.js module caching naturally enforces the Singleton pattern here.
 */

const redisOptions = {
    host: config.redis?.host || '127.0.0.1',
    port: config.redis?.port || 6379,
    db: config.redis?.db || 0,
    password: config.redis?.password || undefined,

    // [CRITICAL FOR BULLMQ]
    // Must be set to null so that blocking commands (like BRPOPLPUSH used by workers)
    // do not timeout and retry infinitely, causing memory leaks.
    maxRetriesPerRequest: null,

    // Advanced retry strategy for network blips (Exponential backoff capped at 3 seconds)
    retryStrategy: (times) => {
        const delay = Math.min(times * 100, 3000);
        logger.warn(`[Redis] Retrying connection... Attempt: ${times} (Delay: ${delay}ms)`);
        return delay;
    },

    // Reconnect on specific target errors automatically
    reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            logger.warn('[Redis] Reconnecting due to READONLY error.');
            return true;
        }
        return false;
    }
};

// Instantiate the Redis client
const redisClient = new Redis(redisOptions);

// ==========================================
// 📡 Event Listeners for Operational Monitoring
// ==========================================

redisClient.on('connect', () => {
    logger.info(`[Redis] Successfully connected to ${redisOptions.host}:${redisOptions.port}`);
});

redisClient.on('ready', () => {
    logger.info(`[Redis] Connection is ready for operations on DB ${redisOptions.db}`);
});

redisClient.on('error', (err) => {
    // We only log the error. ioredis handles the reconnection automatically via retryStrategy
    logger.error(`[Redis] Connection Error: ${err.message}`);
});

redisClient.on('close', () => {
    logger.warn('[Redis] Connection closed.');
});

// Exporting the raw ioredis instance directly.
// To gracefully shut down in index.js, simply call: await redisClient.quit();
module.exports = redisClient;