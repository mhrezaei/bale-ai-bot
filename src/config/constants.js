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
        PENDING: 'PENDING',
        APPROVED: 'APPROVED',
        REJECTED: 'REJECTED',

        // Online Payment Gateway Statuses
        SUCCESS: 'SUCCESS',
        FAILED: 'FAILED',
        CANCELED: 'CANCELED'
    },

    // --- System & User Event Types (For ActionLog) ---
    EVENT_TYPES: {
        // Admin Operations
        RECEIPT_APPROVED: 'RECEIPT_APPROVED',
        RECEIPT_REJECTED: 'RECEIPT_REJECTED',
        USER_BANNED: 'USER_BANNED',
        USER_UNBANNED: 'USER_UNBANNED',
        MANUAL_CHARGE: 'MANUAL_CHARGE',

        // User Behaviors & System Triggers
        NEW_USER_REGISTERED: 'NEW_USER_REGISTERED',
        WALLET_PAYMENT_SUCCESS: 'WALLET_PAYMENT_SUCCESS',
        ZARINPAL_PAYMENT_SUCCESS: 'ZARINPAL_PAYMENT_SUCCESS',
        SYSTEM_ERROR: 'SYSTEM_ERROR',
        AI_PROMPT_FAILED: 'AI_PROMPT_FAILED',
        REVIEW_REQUESTED: 'REVIEW_REQUESTED'
    },

    // --- Default Limits and Quotas ---
    DEFAULTS: {
        FREE_CREDIT_TOKENS: 2000, // Initial free tokens
        LOG_TTL_DAYS: 60          // Time-To-Live for system action logs
    },

    // --- AI & OpenAI Settings ---
    AI: {
        DEFAULT_MODEL: 'gpt-5.4-mini', // The most cost-effective model
        ROLES: {
            SYSTEM: 'system',
            USER: 'user',
            ASSISTANT: 'assistant'
        }
    },

    // --- Queue & Worker Settings (BullMQ) ---
    WORKER: {
        MAX_RETRIES: 3,           // Max retries for failed API calls
        RETRY_DELAY_MS: 5000      // 5 seconds delay between retries
    }
};

module.exports = CONSTANTS;