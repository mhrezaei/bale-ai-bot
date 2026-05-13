// File Path: src/core/db.js

const mongoose = require('mongoose');
const config = require('../config/env');
const logger = require('../utils/logger.util');

/**
 * Database Core Module
 * Engineered for high-concurrency environments (Bot Webhooks + BullMQ Workers).
 * Manages the connection pool and provides orchestrated Graceful Shutdown capabilities.
 */
class DatabaseService {
    constructor() {
        this.isConnected = false;
    }

    /**
     * Establishes the connection to MongoDB with optimal pooling settings.
     * @returns {Promise<void>}
     */
    async connect() {
        if (this.isConnected) return;

        if (!config.mongoUri) {
            logger.error('[FATAL ERROR] MONGO_URI is missing in the environment variables.');
            process.exit(1); // Fail-fast if database credentials are not provided
        }

        try {
            // Enforce strict query for Mongoose 7+ compatibility and safety against injection-like issues
            mongoose.set('strictQuery', true);

            // Connect to MongoDB using the URI from config
            const conn = await mongoose.connect(config.mongoUri, {
                // --- Connection Pooling for High Concurrency ---
                // Max concurrent connections: Optimized to handle Telegram webhooks and BullMQ jobs simultaneously
                maxPoolSize: 50,
                // Maintain minimum connections for faster initial response times
                minPoolSize: 10,

                // --- Timeout & Reliability Settings ---
                serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
                socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            });

            this.isConnected = true;
            logger.info(`[Database] MongoDB Connected Successfully: ${conn.connection.host}:${conn.connection.port}`);
        } catch (error) {
            logger.error(`[FATAL ERROR] MongoDB Connection Failed: ${error.message}`);
            // We throw the error up to index.js to handle the process exit centrally
            throw error;
        }
    }

    /**
     * Closes the MongoDB connection gracefully.
     * Crucial to be called by the orchestrator (index.js) during app shutdown (SIGINT/SIGTERM)
     * to prevent data corruption.
     * @returns {Promise<void>}
     */
    async disconnect() {
        if (!this.isConnected) return;

        try {
            await mongoose.connection.close();
            this.isConnected = false;
            logger.info('[Database] MongoDB connection closed gracefully.');
        } catch (error) {
            logger.error(`[Database] Error during disconnection: ${error.message}`);
        }
    }
}

const dbInstance = new DatabaseService();

// ==========================================
// 📡 Connection Event Listeners
// ==========================================
// Monitoring connection state for runtime debugging and stability

mongoose.connection.on('disconnected', () => {
    logger.warn('[Database] MongoDB Disconnected. Auto-reconnect is handled natively by Mongoose.');
    dbInstance.isConnected = false;
});

mongoose.connection.on('reconnected', () => {
    logger.info('[Database] MongoDB Reconnected successfully.');
    dbInstance.isConnected = true;
});

mongoose.connection.on('error', (err) => {
    logger.error(`[Database] MongoDB Runtime Error: ${err.message}`);
});

module.exports = dbInstance;