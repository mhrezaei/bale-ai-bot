// File Path: src/utils/notifier.util.js

const { Markup } = require('telegraf');
const config = require('../config/env');
const numberUtils = require('./number.util');

/**
 * Notifier Utility
 * A robust message broker for sending alerts, audit logs, and transaction
 * notifications to both the Master Admin and Bot Users.
 * Designed to be non-blocking and fully decoupled from controllers.
 */
class NotifierUtil {
    constructor() {
        this.bot = null;
        this.adminId = config.adminBaleId;
    }

    /**
     * Initializes the notifier with the active Telegraf bot instance.
     * Must be called once during bot startup.
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
     * @param {number|string} targetId - Bale Chat ID.
     * @param {string} text - Formatted Markdown text.
     * @param {Object} options - Extra Telegram/Bale API options.
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
     * Base method to send a photo safely.
     * @param {number|string} targetId - Bale Chat ID.
     * @param {string} photoFileId - Bale File ID for the photo.
     * @param {string} caption - Formatted Markdown caption.
     * @param {Object} options - Extra Telegram/Bale API options.
     */
    async _sendSafePhoto(targetId, photoFileId, caption, options = {}) {
        if (!this.bot || !targetId || !photoFileId) return;

        try {
            await this.bot.telegram.sendPhoto(targetId, photoFileId, {
                caption: caption,
                parse_mode: 'Markdown',
                ...options
            });
        } catch (error) {
            console.error(`[Notifier] Failed to send photo to ${targetId}:`, error.message);
        }
    }

    // ==========================================
    // 👑 ADMIN ALERTS
    // ==========================================

    /**
     * Alerts the admin when a new user registers in the bot.
     * @param {string} name - User's name.
     * @param {string} phone - User's phone number.
     */
    async alertNewUser(name, phone) {
        const text = `👤 **کاربر جدید ثبت‌نام کرد**\n\nنام: ${name}\nموبایل: \`${phone}\``;
        return this._sendSafeMessage(this.adminId, text, { disable_notification: true });
    }

    /**
     * Sends an interactive manual receipt approval request to the Admin.
     * @param {string} transactionId - DB Transaction ID.
     * @param {string} userName - The user who sent the receipt.
     * @param {number} amount - The transaction amount.
     * @param {string} photoFileId - The Bale file_id of the receipt photo.
     */
    async sendReceiptToAdmin(transactionId, userName, amount, photoFileId) {
        const formattedAmount = numberUtils.formatNumberWithCommas(amount);
        const caption = `💳 **فیش بانکی جدید**\n\nکاربر: ${userName}\nمبلغ: ${formattedAmount} تومان\n\nلطفاً تایید یا رد کنید:`;

        const options = Markup.inlineKeyboard([
            [
                Markup.button.callback('✅ تایید فیش', `approve_receipt:${transactionId}`),
                Markup.button.callback('❌ رد فیش', `reject_receipt:${transactionId}`)
            ]
        ]);

        return this._sendSafePhoto(this.adminId, photoFileId, caption, options);
    }

    /**
     * Alerts the admin when an online payment (Bale Wallet or ZarinPal) is successfully completed.
     * @param {string} userName - The user who paid.
     * @param {number} amount - The paid amount.
     * @param {string} method - 'BALE_WALLET' or 'ZARINPAL'.
     */
    async alertSuccessfulPayment(userName, amount, method) {
        const formattedAmount = numberUtils.formatNumberWithCommas(amount);
        const gatewayName = method === 'BALE_WALLET' ? 'کیف پول بله' : 'زرین‌پال';
        const text = `💰 **پرداخت آنلاین موفق**\n\nکاربر: ${userName}\nمبلغ: ${formattedAmount} تومان\nدرگاه: ${gatewayName}`;
        return this._sendSafeMessage(this.adminId, text, { disable_notification: true });
    }

    /**
     * Logs critical system errors to the Admin.
     * @param {string} context - Where the error happened (e.g., 'OpenAI API').
     * @param {string} errorMessage - The exact error message.
     */
    async logSystemError(context, errorMessage) {
        const text = `⚠️ **خطای سیستمی در بخش: ${context}**\n\n\`${errorMessage}\``;
        return this._sendSafeMessage(this.adminId, text, { disable_notification: false });
    }

    // ==========================================
    // 👤 USER NOTIFICATIONS
    // ==========================================

    /**
     * Notifies the user about the result of their submitted receipt.
     * @param {number|string} targetTelegramId - User's Bale ID.
     * @param {boolean} isApproved - True if approved, false if rejected.
     * @param {number} amount - Transaction amount.
     * @param {string} [adminNote] - Optional reason for rejection.
     */
    async notifyReceiptResult(targetTelegramId, isApproved, amount, adminNote = null) {
        const formattedAmount = numberUtils.formatNumberWithCommas(amount);
        let text = '';

        if (isApproved) {
            text = `✅ **فیش شما تایید شد!**\n\nمبلغ ${formattedAmount} تومان به حساب شما منظور شد و توکن‌های مربوطه حساب گردید. از دستیار هوشمند خود لذت ببرید.`;
        } else {
            text = `❌ **فیش شما رد شد.**\n\nمبلغ فیش: ${formattedAmount} تومان\n\n`;
            if (adminNote) {
                text += `دلایل رد شدن:\n_${adminNote}_`;
            } else {
                text += `به دلیل ناخوانا بودن یا عدم تطابق، فیش شما مورد تایید قرار نگرفت.`;
            }
        }

        return this._sendSafeMessage(targetTelegramId, text);
    }

    /**
     * General function to send a direct message to a specific user.
     * Useful for sending announcements or warnings.
     * @param {number|string} targetTelegramId - User's Bale ID.
     * @param {string} message - Formatted Markdown text.
     */
    async sendMessageToUser(targetTelegramId, message) {
        return this._sendSafeMessage(targetTelegramId, message);
    }
}

module.exports = new NotifierUtil();