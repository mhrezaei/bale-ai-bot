const config = require('../config/env');
const User = require('../models/User');
const CONSTANTS = require('../config/constants');

/**
 * Authentication & Authorization Middleware
 * Strictly controls access to the bot and populates ctx.state with the User document.
 * Prevents unauthorized access and integrates with MongoDB for relational integrity.
 */
const authMiddleware = async (ctx, next) => {
    try {
        // 1. Basic safety check for update types that don't have a 'from' field
        if (!ctx.from || !ctx.from.id) {
            return;
        }

        const telegramId = ctx.from.id;

        // 2. Fetch active user from the database
        // We need the actual Mongoose document so ctx.state.user._id is available for Services
        let user = await User.findOne({ telegramId: telegramId, isActive: true });

        // 3. Master Admin Logic (High Priority Override)
        if (telegramId === config.adminTelegramId) {
            if (!user) {
                // Fallback mechanism in case the admin document is accidentally deleted or not seeded yet
                console.warn('[Security] Master Admin not found in DB. Using memory fallback.');
                user = {
                    telegramId: telegramId,
                    role: CONSTANTS.ROLES.ADMIN,
                    name: 'Master Admin',
                    resellerCode: 'ADM'
                };
            } else {
                // Ensure the role is strictly set to ADMIN for the session
                user.role = CONSTANTS.ROLES.ADMIN;
            }

            ctx.state.user = user;
            return next();
        }

        // 4. Active Reseller Logic
        if (user) {
            ctx.state.user = user;
            return next();
        }

        // 5. Unauthorized Access Handling
        // Log unauthorized attempt for security monitoring
        console.warn(`[Security] Unauthorized access attempt by ID: ${telegramId} (@${ctx.from.username || 'N/A'})`);

        // Requirement: Respond with a specific deceptive message to turn away random users
        return ctx.reply('بات غیر فعال است.').catch(() => {});

    } catch (error) {
        console.error('[Security] Authentication Middleware Error:', error.message);
        // Fallback error message. We don't use fa.js here to keep the middleware decoupled.
        return ctx.reply('⚠️ خطای سیستمی در احراز هویت. لطفا لحظاتی دیگر تلاش کنید.').catch(() => {});
    }
};

module.exports = authMiddleware;