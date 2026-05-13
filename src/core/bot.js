const { Telegraf, Scenes } = require('telegraf');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { EventEmitter } = require('events');
const fetch = require('node-fetch');
const config = require('../config/env');
const notifier = require('../utils/notifier.util');
const lang = require('../locales/fa');
const CONSTANTS = require('../config/constants');

// Middlewares
const authMiddleware = require('../middlewares/auth.middleware');
const sanitizeMiddleware = require('../middlewares/sanitize.middleware');
const redisSession = require('../middlewares/redis-session.middleware');
const broadcastMiddleware = require('../middlewares/broadcast.middleware');

// Controllers
const adminController = require('../controllers/AdminController');
const clientController = require('../controllers/ClientController');
const reportController = require('../controllers/ReportController');
const broadcastController = require('../controllers/BroadcastController');

// Scenes
const addResellerScene = require('../scenes/ResellerScene');
const editClientScene = require('../scenes/EditClientScene');
const createClientScene = require('../scenes/CreateClientScene');
const createTestBulkScene = require('../scenes/CreateTestBulkScene');
const serverScene = require('../scenes/ServerScene');
const financeScenes = require('../scenes/FinanceScene');
const broadcastScene = require('../scenes/BroadcastScene');

/**
 * Bot Core Initialization - Multi-Server & Redis Persistence Ready
 * Integrates all Controllers, Middlewares, and Scenes into a unified event loop.
 */

// OPTIMIZATION: Fix EventEmitter Memory Leak Warnings
EventEmitter.defaultMaxListeners = 100;

// 1. SOCKS5 AGENT SETUP (DNS LEAK PREVENTION)
let proxyAgent;
if (config.proxy && config.proxy.url) {
    try {
        let proxyUrl = config.proxy.url;
        // Force 'socks5h://' to resolve Telegram DNS remotely through the proxy, preventing ENOTFOUND
        if (proxyUrl.startsWith('socks5://')) {
            proxyUrl = proxyUrl.replace('socks5://', 'socks5h://');
        }

        proxyAgent = new SocksProxyAgent(proxyUrl);
        proxyAgent.setMaxListeners(100);
        console.log(`[Bot Core] 🛡️ SOCKS5(h) Agent ready for Telegram API.`);
    } catch (error) {
        console.error('[FATAL] SOCKS5 Proxy Error:', error.message);
        process.exit(1);
    }
}

// 2. STAGE CONFIGURATION
const stage = new Scenes.Stage([
    addResellerScene,
    editClientScene,
    createClientScene,
    createTestBulkScene,
    serverScene,
    broadcastScene,
    ...financeScenes
]);

// 3. TELEGRAF CONFIGURATION
// Dynamically build configuration options based on proxy availability
const telegrafOptions = {
    handlerTimeout: 90_000 // Important for slow Panel connections
};

if (proxyAgent) {
    telegrafOptions.telegram = {
        agent: proxyAgent,
        fetch: (url, options) => fetch(url, { ...options, agent: proxyAgent })
    };
}

const bot = new Telegraf(config.botToken, telegrafOptions);

// Explicitly set agent for backward compatibility with some Telegraf internal calls
if (proxyAgent) {
    bot.telegram.options.agent = proxyAgent;
} else {
    console.log(`[Bot Core] 🌐 Proxy disabled. Connecting directly to Telegram API.`);
}

// 4. INITIALIZE AUDIT SYSTEM & GLOBAL COMMANDS
notifier.init(bot);

// Register Global Commands directly with Telegram API on boot.
// This ensures the "Menu" button appears universally for all users without needing to trigger /start
bot.telegram.setMyCommands([
    { command: 'start', description: '🏠 داشبورد اصلی' },
    { command: 'reset', description: '🔄 ریست و لغو عملیات' },
    { command: 'today', description: '📊 گزارش امروز' },
    { command: 'create', description: '➕ ساخت اکانت' },
    { command: 'test', description: '🧪 ساخت اکانت تست' }
]).then(() => {
    console.log('[Bot Core] 📋 Global commands menu registered successfully.');
}).catch((e) => {
    console.error('[Bot Core] ❌ Failed to set global commands:', e.message);
});

// 5. MIDDLEWARE CHAIN
// ORDER IS CRITICAL!
bot.use(redisSession);         // 1. Fetch Session from Redis
bot.use(sanitizeMiddleware);   // 2. Sanitize Persian/Arabic input
bot.use(authMiddleware);       // 3. Authenticate & load DB User
bot.use(broadcastMiddleware);  // 4. Intercept Unread Broadcasts

// CRITICAL FIX: Command Interceptor - Escape Scene Traps
// Halts any active wizard/scene if the user sends a command starting with '/'
bot.use(async (ctx, next) => {
    if (ctx.message && ctx.message.text && ctx.message.text.startsWith('/')) {
        if (ctx.scene && typeof ctx.scene.leave === 'function') {
            await ctx.scene.leave().catch(() => {});
        }
        // Safely reset session to an empty object so Telegraf can recreate the scene state
        ctx.session = {};
    }
    return next();
});

bot.use(stage.middleware());   // 5. Inject Scene Management

// 6. COMMAND HANDLERS

// Dashboard
bot.start(async (ctx) => {
    const { role } = ctx.state.user;

    if (role === CONSTANTS.ROLES.ADMIN) {
        return adminController.showDashboard(ctx);
    } else if (role === CONSTANTS.ROLES.RESELLER) {
        return clientController.showDashboard(ctx);
    }
});

// Reset and Cancel
bot.command('reset', async (ctx) => {
    await ctx.reply('🔄 تمام عملیات‌های نیمه‌کاره لغو شد و نشست شما ریست گردید.');
    return ctx.state.user.role === CONSTANTS.ROLES.ADMIN
        ? adminController.showDashboard(ctx)
        : clientController.showDashboard(ctx);
});

// Today's Report (Direct bypass to index '0')
bot.command('today', async (ctx) => {
    // Generate daily report for "0" days ago (Today)
    if (ctx.state.user.role === CONSTANTS.ROLES.RESELLER || ctx.state.user.role === CONSTANTS.ROLES.ADMIN) {
        return reportController.generateDailyReport(ctx, '0');
    }
});

// Quick Create Main Account
bot.command('create', async (ctx) => {
    if (ctx.state.user.role === CONSTANTS.ROLES.RESELLER || ctx.state.user.role === CONSTANTS.ROLES.ADMIN) {
        return ctx.scene.enter('CREATE_CLIENT_SCENE');
    }
});

// Quick Create Test Account
bot.command('test', async (ctx) => {
    if (ctx.state.user.role === CONSTANTS.ROLES.RESELLER || ctx.state.user.role === CONSTANTS.ROLES.ADMIN) {
        return ctx.scene.enter('CREATE_TEST_BULK_SCENE');
    }
});


// --- 7. ADMIN ACTION HANDLERS ---

// 7.1 Dashboard & Core Actions
bot.action('admin_dashboard', (ctx) => adminController.showDashboard(ctx));
bot.action('admin_system_health', (ctx) => ctx.answerCbQuery(lang.errors?.featureInDevelopment || 'بخش مانیتورینگ در حال توسعه است.', { show_alert: true }));
bot.action('admin_broadcast', (ctx) => broadcastController.startBroadcast(ctx));

// 7.2 Multi-Server Management
bot.action('admin_manage_servers', (ctx) => adminController.listServers(ctx));
bot.action('admin_add_server', (ctx) => ctx.scene.enter('ADD_SERVER_SCENE'));
bot.action(/^admin_manage_srv_(.+)$/, (ctx) => adminController.manageSingleServer(ctx, ctx.match[1]));
bot.action(/^admin_srv_toggle_(.+)$/, (ctx) => adminController.toggleServerStatus(ctx, ctx.match[1]));
bot.action(/^admin_srv_del_conf_(.+)$/, (ctx) => adminController.confirmDeleteServer(ctx, ctx.match[1]));
bot.action(/^admin_srv_del_do_(.+)$/, (ctx) => adminController.deleteServer(ctx, ctx.match[1]));
bot.action(/^admin_srv_edit_(.+)$/, (ctx) => ctx.scene.enter('ADD_SERVER_SCENE', { editServerId: ctx.match[1] }));

// 7.3 Reseller Management
bot.action('admin_manage_resellers', (ctx) => adminController.listResellers(ctx));
bot.action('admin_add_reseller', (ctx) => ctx.scene.enter('ADD_RESELLER_SCENE'));

bot.action(/^admin_manage_res_(.+)$/, (ctx) => adminController.manageSingleReseller(ctx, ctx.match[1]));
bot.action(/^admin_confirm_del_res_(.+)$/, (ctx) => adminController.confirmDeleteReseller(ctx, ctx.match[1]));
bot.action(/^admin_final_del_res_(.+)$/, (ctx) => adminController.handleDeleteReseller(ctx, ctx.match[1]));
bot.action(/^admin_res_edit_(.+)$/, (ctx) => ctx.scene.enter('ADD_RESELLER_SCENE', { editResellerId: ctx.match[1] }));
bot.action(/^admin_res_tx_(.+)_(\d+)$/, (ctx) => adminController.showResellerTransactions(ctx, ctx.match[1], parseInt(ctx.match[2], 10)));

// 7.4 Financial & Audit Actions
bot.action('admin_finance_hub', (ctx) => adminController.showFinanceHub(ctx));
bot.action('admin_pending_receipts', (ctx) => adminController.showPendingReceipts(ctx));
bot.action(/^approve_receipt_(.+)$/, (ctx) => adminController.handleReceiptDecision(ctx, ctx.match[1], true));
bot.action(/^reject_receipt_(.+)$/, (ctx) => adminController.handleReceiptDecision(ctx, ctx.match[1], false));

bot.action(/^admin_charge_reseller_(.+)$/, (ctx) => ctx.scene.enter('ADMIN_CHARGE_SCENE', { editResellerId: ctx.match[1] }));

// 7.5 Client Creation Flows
bot.action('admin_start_create', (ctx) => adminController.startCreateClient(ctx));
bot.action('admin_start_bulk_test', (ctx) => adminController.startBulkTest(ctx));
bot.action('admin_list_clients', (ctx) => clientController.showListMenu(ctx));

// --- 8. RESELLER & SHARED CLIENT ACTION HANDLERS ---

bot.action('reseller_dashboard', (ctx) => clientController.showDashboard(ctx));
bot.action('reseller_start_create', (ctx) => ctx.scene.enter('CREATE_CLIENT_SCENE'));
bot.action('reseller_start_bulk_test', (ctx) => ctx.scene.enter('CREATE_TEST_BULK_SCENE'));
bot.action('reseller_list_clients', (ctx) => clientController.showListMenu(ctx));
bot.action('reseller_finance', (ctx) => ctx.scene.enter('SUBMIT_RECEIPT_SCENE'));

// --- Reports Actions ---
bot.action('reseller_reports', (ctx) => reportController.showReportMenu(ctx));
bot.action(/^rep_day:(\d)$/, (ctx) => reportController.generateDailyReport(ctx, ctx.match[1]));

// --- Broadcast Acknowledgment ---
bot.action(/^ack_bc:(.+)$/, (ctx) => broadcastController.acknowledgeMessage(ctx, ctx.match[1]));

bot.action(/^cl_page:(\d):(\d+)$/, (ctx) => {
    return clientController.listClients(ctx, {
        isTest: ctx.match[1] === '1',
        page: parseInt(ctx.match[2])
    });
});

bot.action(/^manage_client:(.+):(\d)$/, async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    const isFromPhoto = ctx.callbackQuery?.message?.photo !== undefined;
    return clientController.showClientActions(ctx, ctx.match[1], ctx.match[2], isFromPhoto);
});

bot.action(/^cl_get_config:(.+):(\d)$/, (ctx) => {
    return clientController.sendClientConfig(ctx, ctx.match[1], ctx.match[2]);
});

bot.action(/^cl_edit_init:(.+):(\d)$/, (ctx) => {
    return clientController.initEdit(ctx, ctx.match[1], ctx.match[2]);
});

bot.action(/^cl_confirm_toggle:(.+):(\d)$/, (ctx) => {
    return clientController.confirmToggle(ctx, ctx.match[1], ctx.match[2]);
});

bot.action(/^cl_do_toggle:(.+):(\d)$/, (ctx) => {
    return clientController.toggleClientStatus(ctx, ctx.match[1], ctx.match[2]);
});

bot.action(/^cl_confirm_del:(.+):(\d)$/, (ctx) => {
    return clientController.confirmDelete(ctx, ctx.match[1], ctx.match[2]);
});

bot.action(/^cl_do_del:(.+):(\d)$/, (ctx) => {
    return clientController.deleteClient(ctx, ctx.match[1], ctx.match[2]);
});

// --- 9. MESSAGE HANDLERS ---
bot.on('text', async (ctx) => {
    if (ctx.scene.current) return;

    if (ctx.state.user.role === CONSTANTS.ROLES.ADMIN || ctx.state.user.role === CONSTANTS.ROLES.RESELLER) {
        const text = ctx.message.text;
        if (!text.startsWith('/')) {
            return clientController.handleClientSearch(ctx, text);
        }
    }
});

// --- 10. GLOBAL ERROR HANDLING ---
bot.catch((err, ctx) => {
    // Ignore Telegraf's noisy "next() called multiple times" error usually caused by Network Timeout Retries
    if (err.message && err.message.includes('next() called multiple times')) {
        return;
    }

    console.error(`[Bot Error] Update: ${ctx.updateType} | ${err.message}`);

    try {
        if (ctx.reply && !err.message.includes('ETIMEDOUT') && !err.message.includes('socket hang up') && !err.message.includes('ENOTFOUND') && !err.message.includes('message to edit not found')) {
            ctx.reply(lang.errors?.general || '❌ خطای شبکه یا خطای غیرمنتظره در پردازش.').catch(() => {});
        }
    } catch (e) {}
});

// --- 11. GRACEFUL STOP ---
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;