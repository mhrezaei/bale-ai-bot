// File Path: src/middlewares/rateLimit.middleware.js

const rateLimitUtil = require('../utils/rateLimit.util');
const logger = require('../utils/logger.util');

/**
 * Rate Limit Middleware
 * Acts as a shield against spam and potential DDoS attacks at the bot level.
 * Uses the Redis-backed RateLimitUtil to track user request frequency.
 */
const rateLimitMiddleware = async (ctx, next) => {
    // 1. Skip validation if the update lacks a user context
    if (!ctx.from || !ctx.from.id) {
        return next();
    }

    const userId = ctx.from.id;

    try {
        // 2. Check the rate limit.
        // Settings: Maximum 15 messages per 60 seconds window.
        // This is generous enough for normal conversations but strictly blocks automated spam.
        const isAllowed = await rateLimitUtil.checkUserRateLimit(userId, 15, 60);

        if (!isAllowed) {
            // Log the spam attempt (Util already logs it, but we can add context if needed)

            // Notify the user gently.
            // We use .catch() to silently ignore if the user blocked the bot right after spamming.
            await ctx.reply('⚠️ شما پیام‌های زیادی را در زمان کوتاهی ارسال کرده‌اید. لطفاً یک دقیقه صبر کنید و مجدداً تلاش نمایید.').catch(() => {});

            // CRITICAL: Halt the middleware chain. Do NOT call next().
            return;
        }

        // 3. User is within limits, proceed to the next middleware/controller
        return next();

    } catch (error) {
        logger.error(`[RateLimit Middleware] Core error for user ${userId}:`, error);

        // Fail-Open Strategy: If our Redis rate-limiter fails, do not punish the user.
        // It is better to temporarily allow traffic than to block legitimate users globally.
        return next();
    }
};

module.exports = rateLimitMiddleware;