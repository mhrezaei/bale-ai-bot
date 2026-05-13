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
        index: true,
        description: 'Unique identifier provided by Bale platform'
    },
    phoneNumber: {
        type: String,
        required: false, // KYC is delayed until checkout
        unique: true,
        sparse: true, // Allows multiple users to have null values in a unique index
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
        min: 0,
        description: 'Current available tokens for AI usage.'
    },
    totalTokensUsed: {
        type: Number,
        default: 0,
        description: 'Cumulative sum of all tokens consumed.'
    },
    totalMoneySpent: {
        type: Number,
        default: 0,
        description: 'Total money (in IRT) the user has spent.'
    },
    successfulAiRequests: {
        type: Number,
        default: 0,
        description: 'Counter for successful AI interactions.'
    },
    hasAskedReview: {
        type: Boolean,
        default: false,
        description: 'Flag for review request logic.'
    },
    isActive: {
        type: Boolean,
        default: true,
        description: 'Account status flag.'
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);

module.exports = User;