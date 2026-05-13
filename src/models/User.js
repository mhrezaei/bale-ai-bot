// File Path: src/models/User.js

const mongoose = require('mongoose');
const CONSTANTS = require('../config/constants');

/**
 * User Schema
 * Defines the structure for storing user data, authentication, and token economy.
 * Follows Mongoose best practices with proper indexing and data validation.
 */
const UserSchema = new mongoose.Schema({
    baleId: {
        type: Number,
        required: true,
        unique: true,
        index: true, // Crucial for fast lookups during incoming bot updates
        description: 'Unique identifier provided by Bale platform'
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        index: true, // Crucial for login and manual receipt tracking
        description: 'User phone number retrieved via contact request'
    },
    firstName: {
        type: String,
        required: true,
        description: 'First name retrieved from Bale profile or contact'
    },
    lastName: {
        type: String,
        default: null,
        description: 'Last name retrieved from Bale profile or contact'
    },
    username: {
        type: String,
        default: null,
        description: 'Username retrieved from Bale profile'
    },
    role: {
        type: String,
        enum: Object.values(CONSTANTS.ROLES),
        default: CONSTANTS.ROLES.USER,
        description: 'Role-Based Access Control (RBAC) - e.g., ADMIN, USER'
    },
    creditBalance: {
        type: Number,
        default: CONSTANTS.DEFAULTS.FREE_CREDIT_TOKENS,
        min: 0, // Prevents negative balance
        description: 'Current available tokens for AI usage. Initiated with free credits.'
    },
    totalTokensUsed: {
        type: Number,
        default: 0,
        description: 'Cumulative sum of all tokens consumed by the user for analytics'
    },
    totalMoneySpent: {
        type: Number,
        default: 0,
        description: 'Total money (in IRT) the user has spent successfully. Used for calculating User Lifetime Value (LTV).'
    },
    successfulAiRequests: {
        type: Number,
        default: 0,
        description: 'Counter for successful AI interactions. Used to trigger the askReview method at 5.'
    },
    hasAskedReview: {
        type: Boolean,
        default: false,
        description: 'Flag to prevent spamming the review request after the first successful prompt'
    },
    isActive: {
        type: Boolean,
        default: true,
        description: 'Flag to indicate if the user account is active or banned by the admin'
    }
}, {
    // Automatically manages createdAt and updatedAt fields
    timestamps: true
});

// Create compound index if needed in the future, but single indexes on baleId and phoneNumber are sufficient for now.
const User = mongoose.model('User', UserSchema);

module.exports = User;