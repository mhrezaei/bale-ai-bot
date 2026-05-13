const Redis = require('ioredis');
const config = require('../config/env');

/**
 * Redis Core Module
 * Implements the Singleton pattern to provide a shared Redis connection across the app.
 * Ensures efficient connection multiplexing for BullMQ, distributed locks, and sessions.
 */
class RedisService {
    constructor() {
        this.connection = null;
        this.isReady = false;
    }

    /**
     * Initializes and returns the Redis connection.
     * Configured with robust retry strategies and error handling.
     * @returns {Redis} The ioredis instance
     */
    getConnection() {
        if (this.connection) {
            return this.connection;
        }

        const redisOptions = {
            host: config.redis.host,
            port: config.redis.port,
            db: config.redis.db,
            password: config.redis.password, // Added to support production security

            // Maximum number of times to retry a failed connection
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                console.log(`[Redis] Retrying connection... Attempt: ${times}`);
                return delay;
            },
            // Reconnect even after fatal errors
            reconnectOnError: (err) => {
                const targetError = 'READONLY';
                if (err.message.includes(targetError)) {
                    return true;
                }
                return false;
            },
            // Performance optimization: disable ready check if speed is priority
            maxRetriesPerRequest: null, // Required by BullMQ to handle blocking commands
        };

        this.connection = new Redis(redisOptions);

        // --- Event Listeners for Operational Monitoring ---

        this.connection.on('connect', () => {
            console.log(`[Redis] Successfully connected to ${config.redis.host}:${config.redis.port}`);
        });

        this.connection.on('ready', () => {
            this.isReady = true;
            console.log(`[Redis] Connection is ready for operations on DB ${config.redis.db}`);
        });

        this.connection.on('error', (err) => {
            console.error(`[Redis] Connection Error: ${err.message}`);
        });

        this.connection.on('close', () => {
            this.isReady = false;
            console.warn('[Redis] Connection closed.');
        });

        return this.connection;
    }

    /**
     * Gracefully closes the connection during app shutdown.
     */
    async shutdown() {
        if (this.connection) {
            await this.connection.quit();
            console.log('[Redis] Connection gracefully closed.');
        }
    }
}

// Exporting a singleton instance to be shared across the entire backend platform
module.exports = new RedisService().getConnection();