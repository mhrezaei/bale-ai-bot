// File Path: src/middlewares/auth.middleware.js

const UserService = require('../services/UserService');
const config = require('../config/env');
const logger = require('../utils/logger.util');

/**
 * Authentication & Authorization Middleware
 * Ensures every interactor is registered in the database via UserService.
 * Handles Master Admin overrides (Anti-Lockout) and safely blocks banned users.
 */
const authMiddleware = async (ctx, next) => {
    try {
        // 1. Basic safety check for system/network updates that lack a 'from' context
        if (!ctx.from || !ctx.from.id) {
            return next();
        }

        const baleId = ctx.from.id;

        // 2. Fetch or Create the User
        // We pass 'null' for the phone number because KYC is only required during checkout/payment
        let user = await UserService.findOrCreateUser(ctx.from, null);

        // 3. Master Admin High-Priority Override (Anti-Lockout Mechanism)
        // Ensures the Master Admin is NEVER locked out, even if their isActive flag is set to false in DB
        if (baleId === config.adminBaleId) {
            user.role = 'ADMIN'; // Force role just in case
            user.isActive = true; // Override potential bans

            ctx.state.user = user;
            return next();
        }

        // 4. Banned User Check
        if (!user.isActive) {
            logger.warn(`[Security] Blocked interaction from banned user: ${baleId}`);
            return ctx.reply('⛔️ دسترسی شما به دستیار هوشمند مسدود شده است.\n\nدر صورت اشتباه یا نیاز به پیگیری، لطفاً با پشتیبانی سیستم در ارتباط باشید.').catch(() => {});
        }

        // 5. Attach User to Context and Proceed to the next middleware/controller
        ctx.state.user = user;
        return next();

    } catch (error) {
        logger.error('[Security] Authentication Middleware Error:', error);
        // User-friendly fallback error message
        return ctx.reply('⚠️ خطای سیستمی در پردازش اطلاعات کاربری. لطفاً لحظاتی دیگر تلاش کنید.').catch(() => {});
    }
};

module.exports = authMiddleware;