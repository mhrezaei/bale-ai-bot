const User = require('../models/User');

/**
 * UserService - Core Business Logic for User Identity & Access Management (IAM).
 * Optimized for Multi-Server Architecture, Ghost Users, and Role-Based Access Control.
 */
class UserService {

    // ============================================================================
    // CORE USER MANAGEMENT (CREATE, READ, UPDATE)
    // ============================================================================

    /**
     * Creates a new user or re-activates a suspended one.
     * Supports both Telegram users and Ghost (Proxy) users.
     */
    async createUser(userData) {
        const { telegramId, role, name, resellerCode, isGhost = false } = userData;
        const upperResellerCode = resellerCode.toUpperCase();

        // Check if code already exists (for another user)
        const codeExists = await User.findOne({ resellerCode: upperResellerCode });

        if (isGhost) {
            if (codeExists) throw new Error('RESELLER_CODE_EXISTS');

            // Create purely ghost user (telegramId is intentionally undefined to trigger sparse index)
            return await User.create({
                role,
                name,
                resellerCode: upperResellerCode,
                isGhost: true,
                isActive: true
            });
        }

        // For Telegram Users: Upsert logic
        // If a user with this telegramId exists, update them. Otherwise, create.
        if (codeExists && codeExists.telegramId !== telegramId) {
            throw new Error('RESELLER_CODE_EXISTS');
        }

        return await User.findOneAndUpdate(
            { telegramId },
            {
                role,
                name,
                resellerCode: upperResellerCode,
                isGhost: false,
                isActive: true
            },
            {
                upsert: true,
                returnDocument: 'after',
                runValidators: true
            }
        );
    }

    async getUserByTelegramId(telegramId) {
        return await User.findOne({ telegramId, isActive: true });
    }

    async getUserByResellerCode(resellerCode) {
        return await User.findOne({
            resellerCode: resellerCode.toUpperCase(),
            isActive: true
        });
    }

    async getAllResellers(includeGhosts = true) {
        const query = { role: 'RESELLER', isActive: true };
        if (!includeGhosts) {
            query.isGhost = false;
        }
        return await User.find(query).sort({ createdAt: -1 });
    }

    async updateUser(userId, updateData) {
        // Prevent accidental modification of critical fields directly
        delete updateData.walletBalance;

        if (updateData.resellerCode) {
            updateData.resellerCode = updateData.resellerCode.toUpperCase();
        }

        return await User.findByIdAndUpdate(
            userId,
            updateData,
            { returnDocument: 'after', runValidators: true }
        );
    }

    async isCodeUnique(code, excludeUserId = null) {
        const query = {
            resellerCode: code.toUpperCase()
        };

        if (excludeUserId) {
            query._id = { $ne: excludeUserId };
        }

        const existing = await User.findOne(query);
        return !existing;
    }

    // ============================================================================
    // SERVER ACCESS MANAGEMENT (MULTI-SERVER ACL)
    // ============================================================================

    /**
     * Checks if a reseller is authorized to create clients on a specific server.
     * @returns {Promise<boolean>}
     */
    async checkServerAccess(userId, serverId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        if (!user.isActive) throw new Error('User is suspended');

        // Business Rule: Empty array means the user is a VIP/Global reseller
        // who has access to ALL active servers.
        if (!user.allowedServers || user.allowedServers.length === 0) {
            return true;
        }

        return user.allowedServers.includes(serverId);
    }

    /**
     * Completely overrides the allowed servers list for a user.
     * Pass an empty array [] to grant global access.
     */
    async assignServers(userId, serverIdsArray) {
        return await User.findByIdAndUpdate(
            userId,
            { $set: { allowedServers: serverIdsArray } },
            { returnDocument: 'after' }
        );
    }

    /**
     * Grants access to a single specific server.
     * Uses $addToSet to prevent duplicate IDs in the array.
     */
    async grantServerAccess(userId, serverId) {
        return await User.findByIdAndUpdate(
            userId,
            { $addToSet: { allowedServers: serverId } },
            { returnDocument: 'after' }
        );
    }

    /**
     * Revokes access from a single specific server.
     */
    async revokeServerAccess(userId, serverId) {
        return await User.findByIdAndUpdate(
            userId,
            { $pull: { allowedServers: serverId } },
            { returnDocument: 'after' }
        );
    }

    /**
     * Gets a fully populated list of servers the user has access to.
     */
    async getUserAllowedServers(userId) {
        const user = await User.findById(userId).populate('allowedServers');
        if (!user) throw new Error('User not found');

        return user.allowedServers; // Returns an array of Server objects
    }
}

module.exports = new UserService();