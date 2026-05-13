// File Path: src/middlewares/sanitize.middleware.js

const numberUtils = require('../utils/number.utils');
const logger = require('../utils/logger.util');

/**
 * Sanitization Middleware
 * Intercepts incoming messages and normalizes user input globally.
 * Automatically converts Persian and Arabic numbers to standard English digits.
 * This prevents NaN processing errors in scenes, validation logic, and database operations.
 */
const sanitizeMiddleware = async (ctx, next) => {
    try {
        // Only process standard text messages
        if (ctx.message && typeof ctx.message.text === 'string') {
            // Overwrite the original text directly.
            // This is CRITICAL so that Telegraf's built-in methods (Wizards, Regex matchers)
            // automatically work with normalized numbers without requiring manual conversion in every controller.
            ctx.message.text = numberUtils.toEnglishDigits(ctx.message.text);

            // Store it in state for explicit access if needed by downstream controllers
            ctx.state.cleanText = ctx.message.text;
        }

        // Also sanitize inline query data if applicable (e.g., user typing numbers in inline search)
        if (ctx.inlineQuery && typeof ctx.inlineQuery.query === 'string') {
            ctx.inlineQuery.query = numberUtils.toEnglishDigits(ctx.inlineQuery.query);
        }

    } catch (error) {
        // We log the error but DO NOT throw it, ensuring the bot remains responsive
        logger.error('[Sanitize Middleware] Error during normalization:', error);
    }

    // Always continue to the next middleware regardless of sanitization result
    return next();
};

module.exports = sanitizeMiddleware;