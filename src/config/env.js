// File Path: src/config/env.js

const path = require('path');

// Determine which .env file to load based on the NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: path.resolve(process.cwd(), envFile) });

/**
 * Ensures a required environment variable is present.
 * Halts the application execution if a critical variable is missing.
 * * @param {string} key - The environment variable key to check.
 * @returns {string} The value of the environment variable.
 */
const requireEnv = (key) => {
    const value = process.env[key];
    if (!value) {
        console.error(`[FATAL ERROR] Missing required environment variable: ${key}`);
        process.exit(1);
    }
    return value;
};

const config = {
    // --- Core Bale Bot Settings ---
    baleBotToken: requireEnv('BALE_BOT_TOKEN'),
    adminBaleId: parseInt(requireEnv('ADMIN_BALE_ID'), 10),

    // --- AI Assistant Settings ---
    openAiApiKey: requireEnv('OPENAI_API_KEY'),

    // --- Payment Gateway Settings ---
    // ZarinPal Merchant ID is optional for the MVP phase (manual receipt verification)
    zarinpalMerchantId: process.env.ZARINPAL_MERCHANT_ID || null,

    // --- Database Settings ---
    mongoUri: requireEnv('MONGO_URI'),

    // --- Security Settings ---
    encryptionKey: requireEnv('ENCRYPTION_KEY'),

    // --- Web Dashboard Settings ---
    // Port to listen on and the public-facing URL
    webPort: parseInt(process.env.WEB_PORT || '3110', 10),
    clientBaseUrl: process.env.CLIENT_BASE_URL || 'http://localhost:3110',

    // --- Redis Settings (CRITICAL for Rate Limiting, BullMQ, and Conversation State) ---
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0', 10),
    }
};

module.exports = config;