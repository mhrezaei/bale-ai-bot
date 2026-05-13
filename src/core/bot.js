// File Path: src/core/bot.js

const { Telegraf, Scenes, session } = require('telegraf');
const { EventEmitter } = require('events');
const config = require('../config/env');
const notifier = require('../utils/notifier.util');
const logger = require('../utils/logger.util');
// const CONSTANTS = require('../config/constants'); // Will be used when controllers are linked

// ==========================================
// 🔌 IMPORTS (To be activated in later phases)
// ==========================================
// Middlewares
// const authMiddleware = require('../middlewares/auth.middleware');
// const rateLimitMiddleware = require('../middlewares/rateLimit.middleware');

// Controllers
// const chatController = require('../controllers/chat.controller');
// const paymentController = require('../controllers/payment.controller');
// const adminController = require('../controllers/admin.controller');

// Scenes
// const { stage } = require('../scenes');

// ==========================================
// ⚙️ SYSTEM OPTIMIZATION & CONFIGURATION
// ==========================================

// Prevent Memory Leak Warnings for high-concurrency event handling
EventEmitter.defaultMaxListeners = 100;

// Initialize Telegraf with Bale API Root
// Telegraf natively supports standard Telegram API. By overriding apiRoot,
// we redirect all requests to Bale Messenger's servers.
const bot = new Telegraf(config.botToken, {
    telegram: {
        apiRoot: 'https://tapi.bale.ai',
    },
    // Prevent the bot from hanging infinitely if Bale API is temporarily slow
    handlerTimeout: 90000
});

// Initialize the global notifier system with the bot instance
notifier.init(bot);

// ==========================================
// 🔗 MIDDLEWARE CHAIN (Structure setup)
// ==========================================

// 1. Session Management (We use native memory session for now, can be upgraded to RedisSession later)
bot.use(session());

// 2. Global Error Catcher Middleware
bot.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        logger.error(`[Bot Middleware] Error processing update ${ctx.updateType}:`, err);
        // We do not send error messages directly to the user here to avoid spamming them,
        // but it is logged securely for the Admin to review.
    }
});

// 3. Command Interceptor (Escape Scene Traps)
// If a user is stuck in a wizard (like entering a receipt) and sends a command like /start,
// this middleware safely cancels the wizard and processes the command.
bot.use(async (ctx, next) => {
    if (ctx.message && ctx.message.text && ctx.message.text.startsWith('/')) {
        if (ctx.scene && typeof ctx.scene.leave === 'function') {
            await ctx.scene.leave().catch(() => {});
        }
    }
    return next();
});

// ==========================================
// 🎮 GLOBAL COMMANDS & HANDLERS (Placeholders)
// ==========================================

// Register Global Commands Menu in Bale
bot.telegram.setMyCommands([
    { command: 'start', description: '🏠 شروع و منوی اصلی' },
    { command: 'chat', description: '💬 چت با هوش مصنوعی' },
    { command: 'buy', description: '💳 خرید توکن' },
    { command: 'profile', description: '👤 پروفایل و موجودی' },
    { command: 'reset', description: '🔄 لغو عملیات فعلی' }
]).then(() => {
    logger.info('[Bot Core] 📋 Global commands menu registered successfully on Bale.');
}).catch((e) => {
    logger.error('[Bot Core] ❌ Failed to set global commands:', e.message);
});

bot.start(async (ctx) => {
    await ctx.reply('سلام! من دستیار هوشمند شما در پیام‌رسان بله هستم. در حال حاضر در حال بروزرسانی سیستم می‌باشم. 🚀');
    // Future Implementation:
    // return chatController.showMainMenu(ctx);
});

// ==========================================
// 🚨 GLOBAL ERROR HANDLING
// ==========================================
bot.catch((err, ctx) => {
    // Ignore harmless timeout errors caused by network latency
    if (err.message && (err.message.includes('next() called multiple times') || err.message.includes('ETIMEDOUT'))) {
        return;
    }
    logger.error(`[Bot Error] Unhandled exception for update ${ctx.updateType}:`, err);
});

// ==========================================
// 🛑 GRACEFUL SHUTDOWN
// ==========================================
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;