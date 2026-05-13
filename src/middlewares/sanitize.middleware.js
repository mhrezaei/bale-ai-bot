const numberUtils = require('../utils/number.utils');

/**
 * Sanitization Middleware
 * Intercepts incoming Telegram messages and normalizes user input.
 * Automatically converts Persian and Arabic numbers to standard English digits.
 * This prevents processing errors in scenes, number validation, and database operations.
 */
const sanitizeMiddleware = async (ctx, next) => {
    try {
        // Only process standard text messages from users
        if (ctx.message && ctx.message.text) {

            // Overwrite the original text directly.
            // This is CRITICAL so that Telegraf's built-in methods (like Wizards and Regex matching)
            // automatically work with normalized numbers without requiring manual conversion in every controller.
            ctx.message.text = numberUtils.toEnglishDigits(ctx.message.text);

            // Optionally store it in state for explicit access
            ctx.state.cleanText = ctx.message.text;
        }
    } catch (error) {
        console.error('[Sanitize Middleware] Error during normalization:', error.message);
    }

    // Always continue to the next middleware regardless of sanitization result
    return next();
};

module.exports = sanitizeMiddleware;