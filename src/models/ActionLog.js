// File Path: src/models/ActionLog.js

const mongoose = require('mongoose');
const CONSTANTS = require('../config/constants');

/**
 * ActionLog Schema (Operational Audit Trail)
 * Tracks system activities, admin operations, and user behaviors.
 * Implements strict MongoDB TTL to keep the database lightweight.
 */
const ActionLogSchema = new mongoose.Schema({
    // --- Actor (Who triggered the event?) ---
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        default: null,
        description: 'Reference to the User/Admin who triggered the action. Null if system-triggered.'
    },

    // --- Target (What/Who was affected?) ---
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        default: null,
        description: 'Reference to the user affected by this action (e.g., banned user, receipt owner).'
    },
    targetTransactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        index: true,
        default: null,
        description: 'Reference to the transaction involved (e.g., approved/rejected receipt).'
    },

    // --- Event Details ---
    eventType: {
        type: String,
        required: true,
        enum: Object.values(CONSTANTS.EVENT_TYPES),
        index: true,
        description: 'The category of the event for filtering and auditing.'
    },

    // --- Flexible Context Data ---
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        description: 'Dynamic JSON payload containing extra details (e.g., error messages, request latency).'
    },

    // --- TTL (Auto-Purge) Field ---
    expireAt: {
        type: Date,
        // MongoDB automatically drops the document when Date.now() >= expireAt
        index: { expires: 0 },
        // Using a dynamic default function to evaluate the date at the exact time of insertion
        default: () => {
            const ttlDays = CONSTANTS.DEFAULTS.LOG_TTL_DAYS || 30;
            return new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
        }
    }
}, {
    timestamps: true
});

// Compound index for analyzing specific events triggered by specific actors efficiently
ActionLogSchema.index({ actorId: 1, eventType: 1, createdAt: -1 });

const ActionLog = mongoose.model('ActionLog', ActionLogSchema);

module.exports = ActionLog;