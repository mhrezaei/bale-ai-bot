// File Path: src/config/constants.js

/**
 * Application Constants
 * Centralized configuration for AI Bot magic numbers, enums, and default limits.
 * Prevents hardcoding values across different services and models.
 */
const CONSTANTS = {
    // --- User Roles ---
    ROLES: {
        ADMIN: 'ADMIN',
        USER: 'USER'
    },

    // --- Transaction & Receipt Statuses ---
    TRANSACTION_STATUS: {
        // Manual Receipt Statuses
        PENDING: 'PENDING',       // Receipt submitted, waiting for admin approval
        APPROVED: 'APPROVED',     // Receipt approved by admin
        REJECTED: 'REJECTED',     // Receipt rejected by admin

        // Future Online Payment Gateway (ZarinPal) Statuses
        SUCCESS: 'SUCCESS',       // Online payment successful
        FAILED: 'FAILED',         // Online payment failed
        CANCELED: 'CANCELED'      // Online payment canceled by user
    },

    // --- Default Limits and Quotas ---
    DEFAULTS: {
        FREE_CREDIT_TOKENS: 2000, // Initial free tokens granted upon phone number verification
        LOG_TTL_DAYS: 30          // Time-To-Live for system action logs
    },

    // --- AI & OpenAI Settings ---
    AI: {
        DEFAULT_MODEL: 'gpt-4o-mini', // The most cost-effective model for text generation
        ROLES: {
            SYSTEM: 'system',
            USER: 'user',
            ASSISTANT: 'assistant'
        }
    },

    // --- Queue & Worker Settings (BullMQ) ---
    WORKER: {
        MAX_RETRIES: 3,           // Max retries for failed OpenAI API calls via BullMQ
        RETRY_DELAY_MS: 5000      // 5 seconds delay between retries
    }
};

module.exports = CONSTANTS;