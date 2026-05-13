// File Path: src/utils/rateLimit.util.js

const redisClient = require('../core/redis');

/**
 * RateLimit Utility
 * Provides strict rate limiting for Web APIs (IP-based) and Bot interactions (User-based).
 * Includes an advanced Concurrency Lock mechanism to prevent users from spamming the AI
 * while a previous prompt is still being processed.
 */
class RateLimitUtil {
    /**
     * Checks if a web client IP has exceeded the allowed request limit.
     * Prevents DDoS attacks on Webhook or Next.js endpoints.
     * @param {string} ip - The client's IP address
     * @param {number} limit - Maximum allowed requests (default: 20)
     * @param {number} windowSeconds - Time window in seconds (default: 60)
     * @returns {Promise<boolean>} True if allowed, false if blocked
     */
    async checkIpRateLimit(ip, limit = 20, windowSeconds = 60) {
        if (!ip) {
            console.warn('[Security] IP Rate limiter called without a valid IP.');
            return true;
        }

        try {
            const redisKey = `bale_ai_bot:rate_limit:ip:${ip}`;
            const currentCount = await redisClient.incr(redisKey);

            if (currentCount === 1) {
                await redisClient.expire(redisKey, windowSeconds);
            }

            if (currentCount > limit) {
                console.warn(`[Security] IP ${ip} rate-limited (${limit} req/${windowSeconds}s).`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('[Security] IP Rate Limiter error:', error.message);
            // Fail-open strategy: Do not block users if Redis momentarily fails
            return true;
        }
    }

    /**
     * Checks if a bot user has exceeded the general allowed message limit.
     * Prevents users from sending thousands of messages in a minute (Spam control).
     * @param {number|string} userId - The user's Bale ID
     * @param {number} limit - Maximum allowed messages (default: 30)
     * @param {number} windowSeconds - Time window in seconds (default: 60)
     * @returns {Promise<boolean>} True if allowed, false if blocked
     */
    async checkUserRateLimit(userId, limit = 30, windowSeconds = 60) {
        if (!userId) return true;

        try {
            const redisKey = `bale_ai_bot:rate_limit:user:${userId}`;
            const currentCount = await redisClient.incr(redisKey);

            if (currentCount === 1) {
                await redisClient.expire(redisKey, windowSeconds);
            }

            if (currentCount > limit) {
                console.warn(`[Security] User ${userId} rate-limited (${limit} msg/${windowSeconds}s).`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('[Security] User Rate Limiter error:', error.message);
            return true;
        }
    }

    /**
     * Acquires a concurrency lock for a user.
     * Strictly used to prevent the user from sending new prompts while the AI is thinking.
     * @param {number|string} userId - The user's Bale ID
     * @param {number} timeoutSeconds - Maximum time to hold the lock (default: 60s) to prevent permanent freezing
     * @returns {Promise<boolean>} True if lock was acquired, false if user is already locked
     */
    async acquireUserLock(userId, timeoutSeconds = 60) {
        if (!userId) return false;

        try {
            const redisKey = `bale_ai_bot:lock:user:${userId}`;
            // SETNX: Set the key only if it does not exist (NX) with an expiration (EX)
            // If the key already exists, Redis returns null and no lock is acquired.
            const result = await redisClient.set(redisKey, 'locked', 'EX', timeoutSeconds, 'NX');

            // If result is 'OK', the lock was successfully acquired for this exact request
            return result === 'OK';
        } catch (error) {
            console.error('[Security] Acquire User Lock error:', error.message);
            // Safe fallback: assume locked to prevent massive parallel calls to OpenAI if Redis acts up
            return false;
        }
    }

    /**
     * Releases the concurrency lock for a user after AI processing completes or encounters an error.
     * Must be called in a "finally" block in the controller.
     * @param {number|string} userId - The user's Bale ID
     * @returns {Promise<void>}
     */
    async releaseUserLock(userId) {
        if (!userId) return;

        try {
            const redisKey = `bale_ai_bot:lock:user:${userId}`;
            await redisClient.del(redisKey);
        } catch (error) {
            console.error('[Security] Release User Lock error:', error.message);
        }
    }
}

module.exports = new RateLimitUtil();