// File Path: src/services/UserService.js

const User = require('../models/User');
const CONSTANTS = require('../config/constants');

/**
 * UserService
 * Handles all core business logic related to Users.
 * Follows the Single Responsibility Principle (SRP).
 * Includes generous methods for CRUD, token economy, RBAC, and analytics.
 */
class UserService {
    // ==========================================
    // 👤 CORE USER & AUTH METHODS
    // ==========================================

    /**
     * Finds an existing user by Bale ID or registers a new one.
     * @param {Object} baleUserObj - The user object from Bale WebAppData or Message
     * @param {string} phoneNumber - The user's verified phone number
     * @returns {Promise<Object>} The User document
     */
    async findOrCreateUser(baleUserObj, phoneNumber) {
        let user = await User.findOne({ baleId: baleUserObj.id });

        if (!user) {
            // Build payload dynamically to avoid passing explicit 'null' values to sparse indexes
            const payload = {
                baleId: baleUserObj.id,
                firstName: baleUserObj.first_name || 'کاربر',
                lastName: baleUserObj.last_name || null,
                username: baleUserObj.username || null,
                // Assign ADMIN role automatically if the ID matches the master admin in config
                role: baleUserObj.id === require('../config/env').adminBaleId
                    ? CONSTANTS.ROLES.ADMIN
                    : CONSTANTS.ROLES.USER,
                creditBalance: CONSTANTS.DEFAULTS.FREE_CREDIT_TOKENS
            };

            // CRITICAL FIX: Only add phoneNumber if it has a truthy value.
            if (phoneNumber) {
                payload.phoneNumber = phoneNumber;
            }

            user = await User.create(payload);
        }
        return user;
    }

    /**
     * Retrieves a user by their Bale ID.
     * @param {number} baleId
     * @returns {Promise<Object|null>}
     */
    async getUserByBaleId(baleId) {
        return User.findOne({ baleId });
    }

    /**
     * Retrieves a user by their internal MongoDB ObjectId.
     * @param {string} userId
     * @returns {Promise<Object|null>}
     */
    async getUserById(userId) {
        return User.findById(userId);
    }

    /**
     * Updates general user information (e.g., profile changes).
     * @param {string} userId - MongoDB ObjectId
     * @param {Object} updateData - Key-value pairs to update
     * @returns {Promise<Object>} Updated User document
     */
    async updateUser(userId, updateData) {
        // Modern Mongoose standard: returnDocument: 'after' replaces new: true
        return User.findByIdAndUpdate(userId, updateData, { returnDocument: 'after' });
    }

    // ==========================================
    // 💰 TOKEN ECONOMY & FINANCE METHODS
    // ==========================================

    /**
     * Retrieves the current token balance of a user.
     * @param {string} userId
     * @returns {Promise<number>} Current balance
     */
    async getUserBalance(userId) {
        const user = await User.findById(userId).select('creditBalance');
        return user ? user.creditBalance : 0;
    }

    /**
     * Deducts tokens after a successful AI interaction.
     * Also updates the total tokens used for analytics.
     * @param {string} userId
     * @param {number} tokensToDeduct
     * @returns {Promise<Object>} Updated User document
     */
    async deductTokens(userId, tokensToDeduct) {
        return User.findByIdAndUpdate(
            userId,
            {
                $inc: {
                    creditBalance: -Math.abs(tokensToDeduct),
                    totalTokensUsed: Math.abs(tokensToDeduct)
                }
            },
            { returnDocument: 'after' }
        );
    }

    /**
     * Adds tokens to a user's balance (e.g., after a successful purchase).
     * @param {string} userId
     * @param {number} tokensToAdd
     * @returns {Promise<Object>} Updated User document
     */
    async addTokens(userId, tokensToAdd) {
        return User.findByIdAndUpdate(
            userId,
            { $inc: { creditBalance: Math.abs(tokensToAdd) } },
            { returnDocument: 'after' }
        );
    }

    /**
     * Tracks the financial LTV (Lifetime Value) of the user.
     * @param {string} userId
     * @param {number} amountIrt - Amount paid in IRT
     * @returns {Promise<Object>} Updated User document
     */
    async addMoneySpent(userId, amountIrt) {
        return User.findByIdAndUpdate(
            userId,
            { $inc: { totalMoneySpent: Math.abs(amountIrt) } },
            { returnDocument: 'after' }
        );
    }

    // ==========================================
    // 📈 BEHAVIOR & METRICS METHODS
    // ==========================================

    /**
     * Increments the successful AI requests counter.
     * @param {string} userId
     * @returns {Promise<Object>} Updated User document
     */
    async incrementSuccessfulRequests(userId) {
        return User.findByIdAndUpdate(
            userId,
            { $inc: { successfulAiRequests: 1 } },
            { returnDocument: 'after' }
        );
    }

    /**
     * Marks the user as having been asked for a review.
     * @param {string} userId
     * @returns {Promise<Object>} Updated User document
     */
    async markReviewAsked(userId) {
        return User.findByIdAndUpdate(
            userId,
            { hasAskedReview: true },
            { returnDocument: 'after' }
        );
    }

    // ==========================================
    // 🛡️ ADMIN & MODERATION METHODS
    // ==========================================

    /**
     * Promotes a regular user to an Administrator.
     * @param {string} userId
     * @returns {Promise<Object>}
     */
    async promoteToAdmin(userId) {
        return User.findByIdAndUpdate(
            userId,
            { role: CONSTANTS.ROLES.ADMIN },
            { returnDocument: 'after' }
        );
    }

    /**
     * Bans a user from using the bot.
     * @param {string} userId
     * @returns {Promise<Object>}
     */
    async banUser(userId) {
        return User.findByIdAndUpdate(
            userId,
            { isActive: false },
            { returnDocument: 'after' }
        );
    }

    /**
     * Unbans a previously banned user.
     * @param {string} userId
     * @returns {Promise<Object>}
     */
    async unbanUser(userId) {
        return User.findByIdAndUpdate(
            userId,
            { isActive: true },
            { returnDocument: 'after' }
        );
    }

    // ==========================================
    // 📊 QUERY, SEARCH & DASHBOARD METHODS
    // ==========================================

    /**
     * Retrieves a paginated list of users.
     * @param {number} page
     * @param {number} limit
     * @param {Object} filter - Optional MongoDB query filters
     * @returns {Promise<Object>} { users, total, totalPages }
     */
    async getAllUsers(page = 1, limit = 20, filter = {}) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(filter)
        ]);

        return {
            users,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    }

    /**
     * Searches for users by phone number, name, or Bale ID.
     * @param {string} query
     * @param {number} limit
     * @returns {Promise<Array>} List of matching users
     */
    async searchUsers(query, limit = 10) {
        const searchRegex = new RegExp(query, 'i');
        const filter = {
            $or: [
                { phoneNumber: searchRegex },
                { firstName: searchRegex },
                { lastName: searchRegex }
            ]
        };

        if (!isNaN(query)) {
            filter.$or.push({ baleId: Number(query) });
        }

        return User.find(filter).limit(limit).sort({ createdAt: -1 });
    }

    /**
     * Retrieves the top users based on total tokens consumed.
     * @param {number} limit
     * @returns {Promise<Array>}
     */
    async getTopConsumers(limit = 10) {
        return User.find({ totalTokensUsed: { $gt: 0 } })
            .sort({ totalTokensUsed: -1 })
            .limit(limit)
            .select('firstName lastName phoneNumber totalTokensUsed creditBalance');
    }

    /**
     * Retrieves the total count of users in the system.
     * @param {Object} filter - Optional filters
     * @returns {Promise<number>}
     */
    async getUsersCount(filter = {}) {
        return User.countDocuments(filter);
    }
}

module.exports = new UserService();