const redis = require('../core/redis');

/**
 * Redis Session Middleware
 * Custom lightweight session manager for Telegraf.
 * Persists user state in Redis with a 2-hour sliding expiration.
 * Ensures state recovery after bot restarts.
 */
class RedisSessionMiddleware {
    constructor(options = {}) {
        this.ttl = options.ttl || 7200; // Default: 2 hours (7200 seconds)
        this.keyPrefix = options.keyPrefix || 'session';
    }

    /**
     * Middleware generator function for Telegraf.
     */
    middleware() {
        return async (ctx, next) => {
            // 1. Skip if no user ID is present (e.g. some system updates)
            if (!ctx.from || !ctx.from.id) {
                return next();
            }

            const userId = ctx.from.id;
            const sessionKey = `${this.keyPrefix}:${userId}`;

            try {
                // 2. Fetch session from Redis
                const storedSession = await redis.get(sessionKey);

                // If exists, parse it; otherwise, start with an empty object
                ctx.session = storedSession ? JSON.parse(storedSession) : {};

                // 3. Execute the rest of the middleware chain / controllers
                await next();

                // 4. Persistence Check
                // If session is now empty (e.g. cleared by a scene), delete from Redis
                if (!ctx.session || Object.keys(ctx.session).length === 0) {
                    await redis.del(sessionKey);
                    return;
                }

                // 5. Save updated session with sliding expiration (TTL)
                // This resets the 2-hour timer on every successful interaction
                await redis.setex(sessionKey, this.ttl, JSON.stringify(ctx.session));

            } catch (error) {
                console.error(`[RedisSession] Middleware Error for User ${userId}:`, error.message);
                // Fallback: Proceed with empty session to prevent bot crashing
                ctx.session = {};
                await next();
            }
        };
    }
}

const sessionManager = new RedisSessionMiddleware();
module.exports = sessionManager.middleware();