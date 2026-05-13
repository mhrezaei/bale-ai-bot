// File Path: src/controllers/admin.controller.js

const { Markup } = require('telegraf');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Package = require('../models/Package');
const ActionLog = require('../models/ActionLog');
const UserService = require('../services/UserService');
const PaymentService = require('../services/PaymentService');
const ActionLogService = require('../services/ActionLogService');
const notifier = require('../utils/notifier.util');
const lang = require('../locales/fa');
const logger = require('../utils/logger.util');
const dateUtils = require('../utils/date.util');

/**
 * Admin Controller
 * The central command center for the Master Admin.
 * Handles dashboard statistics, receipt approvals, package CRUD, and system logs.
 */
class AdminController {

    // ==========================================
    // 📊 DASHBOARD & CORE
    // ==========================================

    /**
     * Displays the Admin Dashboard with live statistics.
     * Includes the "Infinite Token" trick for the admin account.
     */
    async showDashboard(ctx) {
        try {
            const admin = ctx.state.user;

            // 1. [THE TRICK]: Ensure Admin always has practically infinite tokens (1 Billion)
            // This allows the admin to test the AI without ever running out of balance or breaking the ChatController logic.
            if (admin.creditBalance < 100000000) {
                admin.creditBalance = 1000000000;
                await admin.save();
                logger.info(`[AdminController] Auto-replenished Master Admin tokens to 1 Billion.`);
            }

            const name = admin.firstName || 'مدیر';

            // 2. Fetch live statistics using efficient Mongoose counts/aggregations
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const totalUsers = await User.countDocuments();

            // Fast aggregation for today's successful transactions (Income)
            const todayIncomeAgg = await Transaction.aggregate([
                { $match: { status: 'SUCCESS', createdAt: { $gte: startOfDay } } },
                { $group: { _id: null, total: { $sum: '$amountIrt' } } }
            ]);
            const todayIncome = todayIncomeAgg.length > 0 ? todayIncomeAgg[0].total : 0;

            const pendingReceiptsCount = await Transaction.countDocuments({ type: 'RECEIPT', status: 'PENDING' });

            const stats = {
                totalUsers,
                todayRequests: admin.successfulAiRequests || 0, // Using admin's own count as a placeholder, or fetch from system total if available
                todayIncome,
                pendingReceipts: pendingReceiptsCount
            };

            // 3. Render Dashboard Keyboard
            const keyboard = Markup.keyboard([
                [lang.buttons.adminMenu.receipts, lang.buttons.adminMenu.packages],
                [lang.buttons.adminMenu.broadcast, lang.buttons.adminMenu.users],
                [lang.buttons.adminMenu.logs || '📋 گزارشات سیستم', lang.buttons.userMenu.chat]
            ]).resize();

            return ctx.reply(lang.welcome.admin(name, stats), keyboard).catch(() => {});

        } catch (error) {
            logger.error('[AdminController] Error loading dashboard:', error);
            return ctx.reply(lang.errors.general).catch(() => {});
        }
    }

    // ==========================================
    // 📋 SYSTEM LOGS (MONITORING)
    // ==========================================

    /**
     * Fetches and formats the 10 most recent system actions.
     */
    async showRecentLogs(ctx) {
        try {
            // Fetch the last 10 logs using the ActionLog Service
            const logs = await ActionLog.find().sort({ createdAt: -1 }).limit(10).populate('user', 'baleId');

            if (!logs || logs.length === 0) {
                return ctx.reply(lang.adminLogs.empty).catch(() => {});
            }

            let text = lang.adminLogs.title;

            logs.forEach((log, index) => {
                const dateStr = dateUtils.formatShamsi(log.createdAt, 'jMM/jDD HH:mm');
                const baleId = log.user ? log.user.baleId : 'سیستم';
                // Convert metadata object to string safely
                const details = log.metadata ? JSON.stringify(log.metadata).substring(0, 50) : 'بدون جزئیات';

                text += lang.adminLogs.item(index + 1, log.action, baleId, details, dateStr);
            });

            return ctx.reply(text).catch(() => {});
        } catch (error) {
            logger.error('[AdminController] Error showing logs:', error);
            return ctx.reply(lang.errors.general).catch(() => {});
        }
    }

    // ==========================================
    // 🧾 RECEIPT MANAGEMENT
    // ==========================================

    /**
     * Lists all pending manual receipts (Card-to-Card) for admin review.
     */
    async showPendingReceipts(ctx) {
        try {
            const pendingTxs = await Transaction.find({ type: 'RECEIPT', status: 'PENDING' }).populate('user');

            if (!pendingTxs || pendingTxs.length === 0) {
                return ctx.reply('✅ هیچ فیش در انتظاری وجود ندارد.').catch(() => {});
            }

            await ctx.reply(`تعداد ${lang.toPersianDigits(pendingTxs.length)} فیش در انتظار بررسی است. در حال دریافت تصاویر...`);

            // Loop through and send each receipt with Approve/Reject buttons
            for (const tx of pendingTxs) {
                const keyboard = Markup.inlineKeyboard([
                    [
                        Markup.button.callback(lang.buttons.adminReceiptActions.approve, `adm_app_rec:${tx._id}`),
                        Markup.button.callback(lang.buttons.adminReceiptActions.reject, `adm_rej_rec:${tx._id}`)
                    ]
                ]);

                const userName = `${tx.user.firstName} ${tx.user.lastName || ''}`.trim();
                const caption = lang.receipt.adminAlert(userName, tx.amountIrt);

                try {
                    await ctx.replyWithPhoto(tx.referenceId, { caption, reply_markup: keyboard.reply_markup });
                } catch (imgError) {
                    // Fallback if photo was deleted from Telegram servers
                    await ctx.reply(`⚠️ تصویر فیش منقضی شده است.\n\n${caption}`, keyboard);
                }
            }

        } catch (error) {
            logger.error('[AdminController] Error fetching pending receipts:', error);
            return ctx.reply(lang.errors.general).catch(() => {});
        }
    }

    /**
     * Handles the inline button click to approve or reject a receipt.
     * @param {Object} ctx - Telegraf context
     * @param {string} transactionId - MongoDB Transaction ID
     * @param {boolean} isApproved - true for Approve, false for Reject
     */
    async handleReceiptDecision(ctx, transactionId, isApproved) {
        try {
            const tx = await Transaction.findById(transactionId).populate('user');
            if (!tx || tx.status !== 'PENDING') {
                return ctx.answerCbQuery('⚠️ این تراکنش قبلاً بررسی شده یا وجود ندارد.', { show_alert: true });
            }

            if (isApproved) {
                // 1. Process payment and add tokens
                await PaymentService.verifyManualReceipt(transactionId, 'APPROVED_BY_ADMIN');

                // 2. Notify the user
                await notifier.sendMessageToUser(tx.user.baleId, lang.receipt.approvedAlert(tx.amountIrt));

                // 3. Update the admin UI message
                await ctx.editMessageCaption(`✅ **تایید شد**\nمبلغ: ${tx.amountIrt} تومان به حساب کاربر افزوده شد.`, { parse_mode: 'Markdown' }).catch(() => {});

            } else {
                // 1. Reject transaction
                tx.status = 'FAILED';
                tx.trackingCode = 'REJECTED_BY_ADMIN';
                await tx.save();

                // 2. Notify the user
                await notifier.sendMessageToUser(tx.user.baleId, lang.receipt.rejectedAlert(tx.amountIrt));

                // 3. Update the admin UI message
                await ctx.editMessageCaption(`❌ **رد شد**\nاین فیش توسط شما تایید نشد.`, { parse_mode: 'Markdown' }).catch(() => {});
            }

        } catch (error) {
            logger.error(`[AdminController] Error handling receipt ${transactionId}:`, error);
            return ctx.answerCbQuery(lang.errors.general, { show_alert: true });
        }
    }

    // ==========================================
    // 📦 PACKAGE (TOKEN) CRUD MANAGEMENT
    // ==========================================

    /**
     * Lists all packages with inline buttons for management.
     */
    async listPackages(ctx) {
        try {
            const packages = await Package.find().sort({ priceIrt: 1 });

            // Create "Add New" button as the main message keyboard or top inline
            const topKeyboard = Markup.inlineKeyboard([
                [Markup.button.callback('➕ تعریف بسته جدید', 'adm_pkg_create')]
            ]);

            await ctx.reply(lang.adminPackages.listTitle || 'مدیریت بسته‌ها', topKeyboard);

            if (!packages || packages.length === 0) {
                return ctx.reply(lang.adminPackages.empty).catch(() => {});
            }

            for (const pkg of packages) {
                const statusText = pkg.isActive ? '🟢 فعال' : '🔴 غیرفعال';
                const toggleAction = pkg.isActive ? `adm_pkg_off:${pkg._id}` : `adm_pkg_on:${pkg._id}`;

                const keyboard = Markup.inlineKeyboard([
                    [
                        Markup.button.callback(pkg.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی', toggleAction),
                        Markup.button.callback('🗑 حذف', `adm_pkg_del:${pkg._id}`)
                    ]
                ]);

                const text = `📦 **${pkg.title}**\nوضعیت: ${statusText}\nتوکن: ${lang.formatMoney(pkg.tokenAmount)}\nقیمت: ${lang.formatMoney(pkg.priceIrt)} تومان`;
                await ctx.reply(text, { reply_markup: keyboard.reply_markup, parse_mode: 'Markdown' });
            }

        } catch (error) {
            logger.error('[AdminController] Error listing packages:', error);
            return ctx.reply(lang.errors.general).catch(() => {});
        }
    }

    /**
     * Toggles a package's active status (Hide/Show in store).
     */
    async togglePackageStatus(ctx, packageId, makeActive) {
        try {
            await Package.findByIdAndUpdate(packageId, { isActive: makeActive });
            await ctx.answerCbQuery('✅ وضعیت بسته تغییر کرد.', { show_alert: true });

            // Refresh the list seamlessly
            ctx.deleteMessage().catch(() => {});
            return this.listPackages(ctx);
        } catch (error) {
            logger.error(`[AdminController] Error toggling package ${packageId}:`, error);
            return ctx.answerCbQuery(lang.errors.general);
        }
    }

    /**
     * Deletes a package permanently.
     */
    async deletePackage(ctx, packageId) {
        try {
            await Package.findByIdAndDelete(packageId);
            await ctx.answerCbQuery('✅ بسته با موفقیت حذف شد.', { show_alert: true });
            ctx.deleteMessage().catch(() => {});
        } catch (error) {
            logger.error(`[AdminController] Error deleting package ${packageId}:`, error);
            return ctx.answerCbQuery(lang.errors.general);
        }
    }
}

module.exports = new AdminController();