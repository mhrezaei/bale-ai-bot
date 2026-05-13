const { Markup } = require('telegraf'); // [ADDED] Required for rendering inline keyboards
const config = require('../config/env');
const numberUtils = require('./number.utils');
const lang = require('../locales/fa'); // [NEW] Centralized language and templates

/**
 * Notifier Utility
 * A comprehensive message broker for sending alerts, audit logs, and interactive
 * notifications to both the Master Admin and Resellers.
 * Designed to be non-blocking, fail-safe, and fully decoupled from controllers.
 */
class NotifierUtil {
    constructor() {
        this.bot = null;
        this.adminId = config.adminTelegramId;
    }

    /**
     * Initializes the notifier with the active Telegraf bot instance.
     * @param {Object} botInstance - The initialized Telegraf bot instance.
     */
    init(botInstance) {
        this.bot = botInstance;
        console.log(`[Notifier] 🔔 Audit & Alert System initialized. Target Admin: ${this.adminId}`);
    }

    // ==========================================
    // 📨 CORE SENDER METHODS (PRIVATE)
    // ==========================================

    /**
     * Base method to send a text message safely.
     * @param {number|string} targetId - Telegram Chat ID (Admin or Reseller).
     * @param {string} text - Formatted Markdown text.
     * @param {Object} options - Extra Telegram API options (e.g., reply_markup).
     */
    async _sendSafeMessage(targetId, text, options = {}) {
        if (!this.bot || !targetId) return;

        try {
            await this.bot.telegram.sendMessage(targetId, text, {
                parse_mode: 'Markdown',
                ...options
            });
        } catch (error) {
            console.error(`[Notifier] Failed to send message to ${targetId}:`, error.message);
        }
    }

    /**
     * Base method to send a photo with a caption safely.
     * @param {number|string} targetId - Telegram Chat ID.
     * @param {string|Object} photoData - Telegram File ID or Buffer Object.
     * @param {string} caption - Formatted Markdown caption.
     * @param {Object} options - Extra Telegram API options (e.g., reply_markup).
     */
    async _sendSafePhoto(targetId, photoData, caption, options = {}) {
        if (!this.bot || !targetId) return;

        try {
            await this.bot.telegram.sendPhoto(targetId, photoData, {
                caption: caption,
                parse_mode: 'Markdown',
                ...options
            });
        } catch (error) {
            console.error(`[Notifier] Failed to send photo to ${targetId}:`, error.message);
        }
    }

    // ==========================================
    // 👑 ADMIN ALERTS & AUDITS
    // ==========================================

    /**
     * Sends an interactive receipt approval request to the Admin.
     */
    async sendReceiptToAdmin(transactionId, resellerName, amount, photoFileId) {
        const caption = lang.finance.adminReceiptAlert(resellerName, amount);

        // Pure JSON inline keyboard to avoid Telegraf Markup dependency
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: lang.buttons.finance.approveReceipt, callback_data: `approve_receipt_${transactionId}` },
                        { text: lang.buttons.finance.rejectReceipt, callback_data: `reject_receipt_${transactionId}` }
                    ]
                ]
            }
        };

        return this._sendSafePhoto(this.adminId, photoFileId, caption, options);
    }

    /**
     * Alerts the admin when a server goes offline (Triggered by Health Worker).
     */
    async alertServerDown(serverName, errorMessage) {
        const text = lang.alerts.serverDown(serverName, errorMessage);
        return this._sendSafeMessage(this.adminId, text, { disable_notification: false }); // Critical alerts are NOT silent
    }

    /**
     * Alerts the admin when a server recovers.
     */
    async alertServerRecovered(serverName) {
        const text = lang.alerts.serverRecovered(serverName);
        return this._sendSafeMessage(this.adminId, text, { disable_notification: false });
    }

    /**
     * Logs general client actions (Creation, Edition, Deletion) silently to Admin.
     */
    async logClientAction(actionName, resellerName, clientEmail, detailsText) {
        const text = lang.adminLogs.clientAction(actionName, resellerName, clientEmail, detailsText);
        return this._sendSafeMessage(this.adminId, text, { disable_notification: true });
    }

    /**
     * [NEW] Dedicated logger for financial transactions to avoid "N/A" account fields.
     */
    async logFinanceAction(actionName, resellerName, amountText) {
        const text = lang.adminLogs.financeAction(actionName, resellerName, amountText);
        return this._sendSafeMessage(this.adminId, text, { disable_notification: true });
    }

    /**
     * Logs single client creations explicitly to prevent Wizard crashes.
     */
    async logClientCreation(resellerName, clientEmail, detailsText) {
        return this.logClientAction('ساخت کانفیگ جدید', resellerName, clientEmail, detailsText);
    }

    /**
     * Logs Bulk test creations explicitly to prevent Wizard crashes.
     */
    async logBulkCreation(resellerName, count, volume) {
        const details = `تعداد: ${numberUtils.toPersianDigits(count)} عدد\nحجم هرکدام: ${numberUtils.toPersianDigits(volume)} گیگابایت`;
        return this.logClientAction('ساخت تست گروهی (Bulk)', resellerName, 'چندین اکانت', details);
    }

    /**
     * Logs critical system/worker errors to the Admin.
     */
    async logSystemError(context, errorMessage) {
        const text = `⚠️ **خطای سیستمی در بخش: ${context}**\n\n\`${errorMessage}\``;
        return this._sendSafeMessage(this.adminId, text, { disable_notification: true });
    }

    // ==========================================
    // 💼 RESELLER & CLIENT NOTIFICATIONS
    // ==========================================

    /**
     * Notifies the reseller about the status of their submitted receipt.
     */
    async notifyReceiptResult(resellerTelegramId, isApproved, amount) {
        const text = isApproved
            ? lang.finance.receiptApproved(amount)
            : lang.finance.receiptRejected;

        return this._sendSafeMessage(resellerTelegramId, text);
    }

    /**
     * Alerts the reseller when an account is automatically disabled or hits a limit.
     */
    async notifyResellerAction(resellerTelegramId, actionTitle, message) {
        const text = `🔔 **اطلاعیه سرویس: ${actionTitle}**\n\n${message}`;
        return this._sendSafeMessage(resellerTelegramId, text);
    }

    /**
     * Alerts the reseller if a financial rollback occurred (e.g., config creation failed).
     */
    async notifyRollback(resellerTelegramId, clientEmail, refundedAmount, currency = 'IRT') {
        const text = lang.alerts.rollback(clientEmail, refundedAmount, currency);
        return this._sendSafeMessage(resellerTelegramId, text);
    }

    /**
     * Asynchronously sends the final generated Config and QR code to the user.
     * Called by the Worker after a successful X-UI panel creation.
     * Upgraded to include Action Buttons (Share & Manage).
     */
    async sendAsyncConfigDelivery(targetTelegramId, qrBuffer, captionMessage, clientEmail = '') {
        try {
            if (!this.bot) return;

            // Build interactive buttons dynamically
            const buttons = [
                // Text sharing button (Inline Query)
                [Markup.button.switchToChat('اشتراک‌گذاری متنی 📤', `\n${captionMessage}`)]
            ];

            // Append manage button if email context is provided
            if (clientEmail) {
                buttons.push([Markup.button.callback('مدیریت این کانفیگ ⚙️', `manage_client:${clientEmail}:1`)]);
            }

            const options = {
                ...Markup.inlineKeyboard(buttons)
            };

            return this._sendSafePhoto(targetTelegramId, { source: qrBuffer }, captionMessage, options);
        } catch (error) {
            console.error(`[Notifier] Failed to send async config delivery to ${targetTelegramId}:`, error.message);
        }
    }
}

module.exports = new NotifierUtil();