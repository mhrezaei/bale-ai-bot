const mongoose = require('mongoose');
const config = require('../config/env');

/**
 * Database Core Module
 * Upgraded for high-concurrency environments (BullMQ workers) and
 * orchestrated Graceful Shutdown.
 */
class DatabaseService {
    constructor() {
        this.isConnected = false;
    }

    /**
     * Establishes the connection to MongoDB with optimal pooling settings.
     */
    async connect() {
        if (this.isConnected) return;

        try {
            // Enforce strict query for Mongoose 7+ compatibility and safety
            mongoose.set('strictQuery', true);

            // Connect to MongoDB using the URI from config
            const conn = await mongoose.connect(config.mongoUri, {
                // --- Connection Pooling for High Concurrency ---
                maxPoolSize: 50, // Max concurrent connections (Optimized for BullMQ + Bot)
                minPoolSize: 10, // Maintain minimum connections for faster response times

                // --- Timeout Settings ---
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            this.isConnected = true;
            console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}:${conn.connection.port}`);
        } catch (error) {
            console.error(`[FATAL ERROR] MongoDB Connection Failed: ${error.message}`);
            // We throw the error up to index.js to handle the process exit centrally
            throw error;
        }
    }

    /**
     * Closes the MongoDB connection gracefully.
     * To be called by the orchestrator (index.js) during app shutdown.
     */
    async disconnect() {
        if (!this.isConnected) return;

        try {
            await mongoose.connection.close();
            this.isConnected = false;
            console.log('[Database] MongoDB connection closed gracefully.');
        } catch (error) {
            console.error(`[Database] Error during disconnection: ${error.message}`);
        }
    }
}

const dbInstance = new DatabaseService();

// --- Connection Event Listeners ---
// Monitoring connection state for runtime debugging
mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB Disconnected. Auto-reconnect is handled natively by Mongoose.');
    dbInstance.isConnected = false;
});

mongoose.connection.on('reconnected', () => {
    console.log('[Database] MongoDB Reconnected successfully.');
    dbInstance.isConnected = true;
});

mongoose.connection.on('error', (err) => {
    console.error(`[Database] MongoDB Runtime Error: ${err.message}`);
});

module.exports = dbInstance;