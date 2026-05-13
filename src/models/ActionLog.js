const mongoose = require('mongoose');
const CONSTANTS = require('../config/constants');

/**
 * ActionLog Schema (Operational Audit Trail)
 * Tracks system activities, worker statuses, and user interactions.
 * Financial tracking has been delegated entirely to Transaction.js.
 * Implements strict MongoDB TTL to keep the database lightweight.
 */
const actionLogSchema = new mongoose.Schema(
    {
        // --- Actor (Who triggered the event?) ---
        resellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true, // Can be null if triggered by System Worker (Orphan configs)
        },

        // --- Target (What was affected?) ---
        serverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Server',
            index: true,
        },
        clientEmail: {
            type: String,
            trim: true,
            index: true,
        },

        // --- Event Details ---
        eventType: {
            type: String,
            required: true,
            // Using the central constants file to prevent typos
            enum: Object.values(CONSTANTS.EVENT_TYPES),
            index: true,
        },

        // --- Flexible Data (Worker & Queue Context) ---
        /**
         * metadata stores operational context:
         * e.g., { status: 'PENDING', error: 'Connection Timeout', jobId: 'CREATE_123' }
         */
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        },

        // --- TTL (Auto-Purge) Field ---
        expireAt: {
            type: Date,
            // MongoDB automatically drops the document when Date.now() >= expireAt
            index: { expires: 0 },
            // [FIX] Removed the problematic pre-save hook.
            // Using a dynamic default function is strictly safer for Mongoose Model.create()
            // and completely eliminates the "next is not a function" crash during Bulk creation.
            default: () => {
                const ttlDays = (CONSTANTS.DEFAULTS && CONSTANTS.DEFAULTS.LOG_TTL_DAYS) ? CONSTANTS.DEFAULTS.LOG_TTL_DAYS : 90;
                return new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
            }
        }
    },
    {
        timestamps: true,
    }
);

// ==========================================
// Performance Indexes
// ==========================================
// Optimized for querying a specific reseller's recent operational history
actionLogSchema.index({ resellerId: 1, createdAt: -1 });

module.exports = mongoose.model('ActionLog', actionLogSchema);