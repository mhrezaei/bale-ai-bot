// File Path: src/core/bot.js

const { Telegraf } = require('telegraf');
const { EventEmitter } = require('events');
const config = require('../config/env');
const notifier = require('../utils/notifier.util');
const logger = require('../utils/logger.util');
const lang = require('../locales/fa');

// ==========================================
// 🔌 IMPORTS: MIDDLEWARES, CONTROLLERS, SCENES
// ==========================================
// Middlewares
const redisSession = require('../middlewares/redis-session.middleware');
const sanitizeMiddleware = require('../middlewares/sanitize.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const rateLimitMiddleware = require('../middlewares/rateLimit.middleware');

// Controllers
const userController = require('../controllers/user.controller');
const chatController = require('../controllers/chat.controller');
const paymentController = require('../controllers/payment.controller');
const adminController = require('../controllers/admin.controller');

// Scenes (Stage)
const { stage } = require('../scenes');

// ==========================================
// ⚙️ SYSTEM OPTIMIZATION & CONFIGURATION
// ==========================================

// Prevent Memory Leak Warnings for high-concurrency event handling
EventEmitter.defaultMaxListeners = 100;

// Initialize Telegraf with Bale API Root
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
// 🔗 MIDDLEWARE CHAIN (ORDER IS CRITICAL)
// ==========================================

// 1. Global Error Catcher (Prevents bot crash on middleware failures)
bot.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        logger.error(`[Bot Middleware] Error processing update ${ctx.updateType}:`, err);
    }
});

// 2. Redis Session Management (Recovers state across restarts)
bot.use(redisSession);

// 3. Command Interceptor (Escape Scene Traps safely)
bot.use(async (ctx, next) => {
    if (ctx.message && ctx.message.text && ctx.message.text.startsWith('/')) {
        if (ctx.scene && typeof ctx.scene.leave === 'function') {
            await ctx.scene.leave().catch(() => {});
        }
    }
    return next();
});

// 4. Sanitize Input (Converts Persian/Arabic numbers to English for DB safety)
bot.use(sanitizeMiddleware);

// 5. Anti-Spam (Rate Limiting based on User ID)
// CRITICAL: Placed BEFORE Auth. Redis is much faster than MongoDB.
// This blocks spammers in-memory before they can trigger database queries.
bot.use(rateLimitMiddleware);

// 6. Authentication & KYC (Loads user from DB, handles Banned users & Master Admin)
bot.use(authMiddleware);

// 7. Inject Scenes (Wizards for Receipts, Packages, Broadcasts, etc.)
bot.use(stage.middleware());

// ==========================================
// 🎮 GLOBAL COMMANDS & ROUTING
// ==========================================

// Register Global Commands Menu in Bale UI
bot.telegram.setMyCommands([
    { command: 'start', description: '🏠 شروع و منوی اصلی' },
    { command: 'chat', description: '💬 چت با هوش مصنوعی' },
    { command: 'buy', description: '💳 خرید توکن' },
    { command: 'profile', description: '👤 پروفایل و موجودی' },
    { command: 'reset', description: '🔄 بازگشت به منوی اصلی' }
]).catch(e => logger.error('[Bot Core] Failed to set global commands:', e));

// --- Base Commands ---
bot.start((ctx) => {
    if (ctx.state.user.role === 'ADMIN') {
        return adminController.showDashboard(ctx);
    }
    return userController.showMainMenu(ctx);
});

bot.command('reset', (ctx) => {
    ctx.reply('🔄 عملیات لغو شد و به منوی اصلی بازگشتید.').catch(() => {});
    if (ctx.state.user.role === 'ADMIN') return adminController.showDashboard(ctx);
    return userController.showMainMenu(ctx);
});

bot.command('chat', (ctx) => ctx.reply('سلام! لطفاً درخواست یا سوال خود را همینجا تایپ کنید تا بررسی کنم. 🧠'));
bot.command('buy', (ctx) => paymentController.showStore(ctx));
bot.command('profile', (ctx) => userController.showProfile(ctx));

// --- User Menu Keyboard Routing ---
bot.hears(lang.buttons.userMenu.chat, (ctx) => ctx.reply('لطفاً درخواست یا سوال خود را تایپ کنید تا بررسی کنم. 🧠'));
bot.hears(lang.buttons.userMenu.profile, (ctx) => userController.showProfile(ctx));
bot.hears(lang.buttons.userMenu.buy, (ctx) => paymentController.showStore(ctx));
bot.hears(lang.buttons.userMenu.clearHistory, (ctx) => chatController.clearHistory(ctx));
bot.hears(lang.buttons.userMenu.support, (ctx) => userController.showSupport(ctx));

// --- Admin Menu Keyboard Routing ---
bot.hears(lang.buttons.adminMenu.receipts, (ctx) => {
    if (ctx.state.user.role === 'ADMIN') return adminController.showPendingReceipts(ctx);
});
bot.hears(lang.buttons.adminMenu.packages, (ctx) => {
    if (ctx.state.user.role === 'ADMIN') return adminController.listPackages(ctx);
});
bot.hears(lang.buttons.adminMenu.logs, (ctx) => {
    if (ctx.state.user.role === 'ADMIN') return adminController.showRecentLogs(ctx);
});
bot.hears(lang.buttons.adminMenu.users, (ctx) => {
    if (ctx.state.user.role === 'ADMIN') return ctx.reply(lang.errors.featureInDevelopment);
});
bot.hears(lang.buttons.adminMenu.broadcast, (ctx) => {
    if (ctx.state.user.role === 'ADMIN') return ctx.scene.enter('BROADCAST_SCENE');
});

// ==========================================
// 🖱 INLINE BUTTON ACTIONS (CALLBACKS)
// ==========================================

// Global Cancel Action
bot.action('cancel_action', (ctx) => {
    ctx.deleteMessage().catch(() => {});
    return ctx.answerCbQuery('عملیات لغو شد.', { show_alert: false });
});

// --- Store & Payments ---
bot.action(/^select_pkg:(.+)$/, (ctx) => paymentController.selectPackage(ctx, ctx.match[1]));
bot.action(/^pay_bale:(.+)$/, (ctx) => paymentController.initBalePayment(ctx, ctx.match[1]));
bot.action(/^pay_receipt:(.+)$/, (ctx) => {
    ctx.deleteMessage().catch(() => {});
    return ctx.scene.enter('RECEIPT_SCENE', { packageId: ctx.match[1] });
});

// --- Admin Actions ---
bot.action(/^adm_app_rec:(.+)$/, (ctx) => {
    if (ctx.state.user.role === 'ADMIN') return adminController.handleReceiptDecision(ctx, ctx.match[1], true);
});
bot.action(/^adm_rej_rec:(.+)$/, (ctx) => {
    if (ctx.state.user.role === 'ADMIN') return adminController.handleReceiptDecision(ctx, ctx.match[1], false);
});
bot.action('adm_pkg_create', (ctx) => {
    if (ctx.state.user.role === 'ADMIN') return ctx.scene.enter('ADMIN_PACKAGE_CREATE_SCENE');
});
bot.action(/^adm_pkg_on:(.+)$/, (ctx) => {
    if (ctx.state.user.role === 'ADMIN') return adminController.togglePackageStatus(ctx, ctx.match[1], true);
});
bot.action(/^adm_pkg_off:(.+)$/, (ctx) => {
    if (ctx.state.user.role === 'ADMIN') return adminController.togglePackageStatus(ctx, ctx.match[1], false);
});
bot.action(/^adm_pkg_del:(.+)$/, (ctx) => {
    if (ctx.state.user.role === 'ADMIN') return adminController.deletePackage(ctx, ctx.match[1]);
});

// ==========================================
// 📞 SPECIAL EVENT LISTENERS
// ==========================================

// Contact Share (KYC)
bot.on('contact', (ctx) => paymentController.handleContact(ctx));

// Bale Wallet Webhooks (Handled seamlessly alongside text messages)
bot.on('pre_checkout_query', (ctx) => paymentController.handlePreCheckoutQuery(ctx));
bot.on('successful_payment', (ctx) => paymentController.handleSuccessfulPayment(ctx));

// ==========================================
// 💬 FALLBACK: AI CHAT HANDLER
// ==========================================
// MUST BE AT THE VERY BOTTOM! Catches any text that wasn't a command or menu button.
bot.on('text', async (ctx) => {
    // Prevent active scenes/wizards from leaking text into the AI Chat Engine
    if (ctx.scene && ctx.scene.current) return;

    // Route all natural conversation to the AI Chat Controller
    return chatController.handleIncomingMessage(ctx);
});

// ==========================================
// 🚨 GLOBAL ERROR HANDLING
// ==========================================
bot.catch((err, ctx) => {
    // Suppress Telegraf's noisy network retry errors to keep logs clean
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