// File Path: src/middlewares/redis-session.middleware.js

const redisClient = require('../core/redis');
const logger = require('../utils/logger.util');

/**
 * Redis Session Middleware
 * Custom, lightweight session manager optimized for Telegraf.
 * Persists user state (e.g., active scenes, wizard steps) in Redis with a sliding expiration.
 * Ensures complete state recovery even if the Node.js server restarts.
 */
class RedisSessionMiddleware {
    constructor(options = {}) {
        // Default TTL: 2 hours (7200 seconds).
        // Gives the user enough time to complete a payment or a wizard step before timing out.
        this.ttl = options.ttl || 7200;

        // Prefix to avoid key collisions in Redis database
        this.keyPrefix = options.keyPrefix || 'bale_ai_bot:session';
    }

    /**
     * Middleware generator function for Telegraf.
     */
    middleware() {
        return async (ctx, next) => {
            // 1. Skip if the update has no user context (e.g., channel posts or pure system updates)
            if (!ctx.from || !ctx.from.id) {
                return next();
            }

            const userId = ctx.from.id;
            const sessionKey = `${this.keyPrefix}:${userId}`;

            try {
                // 2. Fetch session state from Redis
                const storedSession = await redisClient.get(sessionKey);

                // Safely parse JSON, default to empty object if corrupted or missing
                if (storedSession) {
                    try {
                        ctx.session = JSON.parse(storedSession);
                    } catch (parseError) {
                        logger.warn(`[RedisSession] Corrupted session data for user ${userId}. Resetting.`);
                        ctx.session = {};
                    }
                } else {
                    ctx.session = {};
                }

                // 3. Execute the rest of the middleware chain and controllers
                await next();

                // 4. Persistence Check
                // If session is explicitly set to null or became empty (e.g., after ctx.scene.leave())
                if (!ctx.session || Object.keys(ctx.session).length === 0) {
                    await redisClient.del(sessionKey);
                    return;
                }

                // 5. Save the updated session back to Redis
                // using setex (Set with Expiration) to reset the sliding TTL timer
                await redisClient.setex(sessionKey, this.ttl, JSON.stringify(ctx.session));

            } catch (error) {
                logger.error(`[RedisSession] Middleware core error for user ${userId}:`, error);

                // Fail-safe: Initialize memory session so the bot doesn't completely crash for this user
                ctx.session = ctx.session || {};
                await next();
            }
        };
    }
}

const sessionManager = new RedisSessionMiddleware();
module.exports = sessionManager.middleware();