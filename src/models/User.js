const mongoose = require('mongoose');

/**
 * User Schema
 * Handles Master Admins, Resellers, and Ghost (Proxy) Users.
 * Implements Unified Volume Quota, Multi-Currency Debt Ledger, and Custom Tariffs.
 * Upgraded with Broadcast Interception Queue (unreadBroadcasts).
 */
const userSchema = new mongoose.Schema(
    {
        // --- Identity & Authentication ---
        telegramId: {
            type: Number,
            unique: true,
            sparse: true, // Allows null for Ghost users
            index: true,
        },
        isGhost: {
            type: Boolean,
            default: false,
            index: true,
        },
        role: {
            type: String,
            enum: ['ADMIN', 'RESELLER'],
            required: true,
            default: 'RESELLER',
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        resellerCode: {
            type: String,
            trim: true,
            uppercase: true,
            unique: true,
            sparse: true,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        // --- Custom Pricing (Tariffs) ---
        // Allows overriding the default server prices for specific VIP resellers
        customTariffs: {
            IRT: {
                type: Number,
                default: null, // If null, the system uses the default IRT Server price
            },
            EUR: {
                type: Number,
                default: null, // If null, the system uses the default EUR Server price
            }
        },

        // --- Multi-Server Access Control ---
        allowedServers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Server',
            }
        ],

        // --- Quota & Volume Management ---
        totalQuotaGB: {
            type: Number,
            default: 0, // The total gross capacity granted to the reseller by Admin
        },
        allocatedQuotaGB: {
            type: Number,
            default: 0, // The sum of GBs assigned to active configs (Regardless of actual end-user usage)
        },

        // --- Multi-Currency Debt Ledger ---
        // Automatically populated by FinanceService when quota is allocated
        // Example: { "IRT": 2500000, "EUR": 45 }
        debts: {
            type: Map,
            of: Number,
            default: {},
        },

        // --- Marketing & Testing Limits ---
        dailyTestLimit: {
            type: Number,
            default: 10, // Max free test accounts allowed per day (Bypasses Quota & Debt)
        },

        // ==========================================
        // 📢 NEW: Broadcast & Interception System
        // ==========================================
        unreadBroadcasts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Broadcast',
            description: 'Queue of mandatory announcements the user has not yet acknowledged'
        }]
    },
    {
        timestamps: true,
    }
);

// Compound index for fast Admin dashboard queries
userSchema.index({ role: 1, isActive: 1 });

/**
 * Virtual Field: remainingQuota
 * Calculates the exact available capacity for creating new configs.
 */
userSchema.virtual('remainingQuota').get(function() {
    return this.totalQuotaGB - this.allocatedQuotaGB;
});

// Ensure virtuals are included when converting documents to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);