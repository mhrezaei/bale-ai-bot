const redisClient = require('../core/redis');

/**
 * Checks if the given IP has exceeded the allowed request limit.
 * Implements a fixed-window rate limiting algorithm using Redis.
 *
 * @param {string} ip - The client's IP address.
 * @param {number} limit - Maximum allowed requests (default: 10).
 * @param {number} windowSeconds - The time window in seconds (default: 60).
 * @returns {Promise<boolean>} Returns true if the request is allowed, false if blocked.
 */
const checkRateLimit = async (ip, limit = 10, windowSeconds = 60) => {
    // If no IP is provided, allow the request but log the anomaly.
    if (!ip) {
        console.warn('[Security] Rate limiter called without a valid IP address.');
        return true;
    }

    try {
        const redisKey = `hedioum:rate_limit:sub:${ip}`;

        // Increment the request count for this specific IP
        const currentCount = await redisClient.incr(redisKey);

        // If this is the first request in the window, set the expiration TTL
        if (currentCount === 1) {
            await redisClient.expire(redisKey, windowSeconds);
        }

        // Check if the current count exceeds our strict limit
        if (currentCount > limit) {
            console.warn(`[Security] IP ${ip} has been rate-limited. Exceeded ${limit} requests per ${windowSeconds}s.`);
            return false;
        }

        return true;
    } catch (error) {
        // Fail-Open Strategy: Allow request to pass if Redis goes down.
        // It is better to temporarily lose rate-limiting than to block real users.
        console.error('[Security] Redis Rate Limiter encountered an error:', error.message);
        return true;
    }
};

module.exports = { checkRateLimit };