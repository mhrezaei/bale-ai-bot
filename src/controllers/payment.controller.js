// File Path: src/controllers/payment.controller.js

const { Markup } = require('telegraf');
const UserService = require('../services/UserService');
const PackageService = require('../services/PackageService');
const PaymentService = require('../services/PaymentService');
const ActionLogService = require('../services/ActionLogService');
const baleGateway = require('../gateways/bale.gateway');
const lang = require('../locales/fa');
const logger = require('../utils/logger.util');

/**
 * Payment Controller
 * Orchestrates the checkout process, KYC (phone number collection),
 * and handles webhooks from payment gateways (like Bale Wallet).
 */
class PaymentController {

    // ==========================================
    // 🛒 STORE & KYC FLOW
    // ==========================================

    /**
     * Entry point when user clicks "Buy Tokens".
     * Checks if the user has a phone number registered.
     */
    async showStore(ctx) {
        try {
            const user = ctx.state.user;

            // 1. KYC Check: Demand phone number before showing packages
            if (!user.phoneNumber) {
                const phoneKeyboard = Markup.keyboard([
                    [Markup.button.contactRequest('📱 ارسال شماره موبایل')]
                ]).resize().oneTime();

                return ctx.reply('برای صدور فاکتور و خرید توکن، لطفاً ابتدا شماره موبایل خود را با استفاده از دکمه زیر تایید کنید:', phoneKeyboard);
            }

            // 2. Fetch active packages from DB
            const packages = await PackageService.getPackages(true);

            if (!packages || packages.length === 0) {
                return ctx.reply(lang.store.empty).catch(() => {});
            }

            // 3. Render Packages Keyboard
            const buttons = packages.map(pkg => [
                Markup.button.callback(`📦 ${pkg.title} - ${lang.formatMoney(pkg.priceIrt)} تومان`, `select_pkg:${pkg._id}`)
            ]);

            const keyboard = Markup.inlineKeyboard(buttons);
            return ctx.reply(lang.store.title, keyboard).catch(() => {});

        } catch (error) {
            logger.error('[PaymentController] Error showing store:', error);
            return ctx.reply(lang.errors.general).catch(() => {});
        }
    }

    /**
     * Handles the receipt of the user's phone number via contact keyboard.
     */
    async handleContact(ctx) {
        try {
            const contact = ctx.message.contact;
            const user = ctx.state.user;

            // Security check: Ensure they are sending their own phone number
            if (contact.user_id && contact.user_id !== user.baleId) {
                return ctx.reply('❌ شماره ارسال شده متعلق به حساب شما نیست. لطفاً مجدداً تلاش کنید.');
            }

            // Update user in DB
            await UserService.updateUser(user._id, { phoneNumber: contact.phone_number });

            // Remove the custom keyboard and send them back to the store
            await ctx.reply('✅ شماره موبایل شما با موفقیت ثبت شد.', Markup.removeKeyboard());
            return this.showStore(ctx);

        } catch (error) {
            logger.error('[PaymentController] Error saving contact:', error);
            return ctx.reply(lang.errors.general);
        }
    }

    // ==========================================
    // 💳 CHECKOUT & GATEWAY SELECTION
    // ==========================================

    /**
     * Displays payment methods for the selected package.
     */
    async selectPackage(ctx, packageId) {
        try {
            const pkg = await PackageService.getPackageById(packageId);

            const keyboard = Markup.inlineKeyboard([
                [Markup.button.callback(lang.buttons.paymentGateways.baleWallet, `pay_bale:${pkg._id}`)],
                [Markup.button.callback(lang.buttons.paymentGateways.receipt, `pay_receipt:${pkg._id}`)],
                [Markup.button.callback(lang.buttons.general.cancel, 'cancel_action')]
            ]);

            return ctx.editMessageText(lang.store.packageDetails(pkg), {
                reply_markup: keyboard.reply_markup,
                parse_mode: 'Markdown'
            });

        } catch (error) {
            logger.error(`[PaymentController] Error selecting package ${packageId}:`, error);
            return ctx.answerCbQuery(lang.errors.general, { show_alert: true });
        }
    }

    /**
     * Initiates the Bale Wallet payment flow.
     */
    async initBalePayment(ctx, packageId) {
        try {
            const user = ctx.state.user;
            const pkg = await PackageService.getPackageById(packageId);

            // 1. Create a Pending Transaction in the DB
            const transaction = await PaymentService.createBaleTransaction(
                user._id,
                pkg.priceIrt,
                pkg.tokenAmount
            );

            // 2. Remove the inline keyboard to prevent double-clicking
            await ctx.editMessageReplyMarkup({ inline_keyboard: [] }).catch(() => {});

            // 3. Send the Invoice via Bale Gateway
            await baleGateway.sendInvoice(ctx, transaction._id, pkg.title, pkg.priceIrt);

        } catch (error) {
            logger.error('[PaymentController] Error initializing Bale payment:', error);
            return ctx.reply(lang.errors.general);
        }
    }

    // ==========================================
    // 🔄 BALE WALLET WEBHOOKS
    // ==========================================

    /**
     * Handles the PreCheckoutQuery.
     * Must be answered within 10 seconds.
     */
    async handlePreCheckoutQuery(ctx) {
        const query = ctx.preCheckoutQuery;
        const transactionId = query.invoice_payload; // This is our DB Transaction _id

        try {
            // Ideally, we could check if the transaction is still valid/pending in DB.
            // For performance and ensuring a <10s response, if payload exists, we approve it.
            if (!transactionId) {
                return ctx.answerPreCheckoutQuery(false, "تراکنش نامعتبر است.");
            }

            // Tell Bale we are ready to process the payment
            return ctx.answerPreCheckoutQuery(true);
        } catch (error) {
            logger.error('[PaymentController] Error handling PreCheckout:', error);
            return ctx.answerPreCheckoutQuery(false, "خطای سیستمی رخ داد.");
        }
    }

    /**
     * Handles the SuccessfulPayment update after the user pays in Bale.
     */
    async handleSuccessfulPayment(ctx) {
        const payment = ctx.message.successful_payment;
        const transactionId = payment.invoice_payload;
        const baleChargeId = payment.provider_payment_charge_id || payment.telegram_payment_charge_id;

        try {
            // 1. Verify and process the payment in our DB (This safely adds tokens)
            const transaction = await PaymentService.verifyBalePayment(transactionId, baleChargeId);

            // 2. Log the user action
            // CRITICAL FIX: Changed from BALE_WALLET_SUCCESS to WALLET_PAYMENT_SUCCESS to match CONSTANTS
            await ActionLogService.logUserAction(transaction.user, 'WALLET_PAYMENT_SUCCESS', {
                amount: transaction.amountIrt,
                chargeId: baleChargeId
            });

            // 3. Send success receipt to the user
            return ctx.reply(lang.payment.success(transaction.amountIrt, transaction.tokenAmount));

        } catch (error) {
            logger.error(`[PaymentController] Failed to verify successful payment ${transactionId}:`, error);

            // Note: Money has been deducted from user's Bale wallet at this point!
            // If DB verification fails (e.g. timeout), it must be logged and handled manually or reversed.
            return ctx.reply(lang.payment.failed);
        }
    }
}

module.exports = new PaymentController();