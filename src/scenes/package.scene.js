// File Path: src/scenes/package.scene.js

const { Scenes, Markup } = require('telegraf');
const PackageService = require('../services/PackageService');
const lang = require('../locales/fa');
const logger = require('../utils/logger.util');

/**
 * Package Creation Wizard Scene
 * Step-by-step flow for Master Admin to create a new token package.
 * Includes data sanitization and business logic validations.
 */
const packageWizard = new Scenes.WizardScene(
    'ADMIN_PACKAGE_CREATE_SCENE',

    // ==========================================
    // STEP 1: Ask for Package Title
    // ==========================================
    async (ctx) => {
        try {
            // Provide a cancel button to safely exit the wizard
            const keyboard = Markup.keyboard([
                [lang.buttons.general.cancel]
            ]).resize();

            await ctx.reply(lang.adminPackages.wizard.title, keyboard);
            return ctx.wizard.next();
        } catch (error) {
            logger.error('[PackageWizard] Error in Step 1:', error);
            return ctx.scene.leave();
        }
    },

    // ==========================================
    // STEP 2: Validate Title & Ask for Token Amount
    // ==========================================
    async (ctx) => {
        try {
            const text = ctx.message?.text;

            if (text === lang.buttons.general.cancel || text?.startsWith('/')) {
                await ctx.reply('✖️ عملیات لغو شد.', Markup.removeKeyboard());
                return ctx.scene.leave();
            }

            if (!text || text.length < 2) {
                // Return explicitly to keep the user in the current step
                return ctx.reply(lang.errors.invalidInput);
            }

            // Save title to session state
            ctx.scene.state.title = text;

            await ctx.reply(lang.adminPackages.wizard.amount);
            return ctx.wizard.next();
        } catch (error) {
            logger.error('[PackageWizard] Error in Step 2:', error);
            return ctx.scene.leave();
        }
    },

    // ==========================================
    // STEP 3: Validate Tokens & Ask for Price
    // ==========================================
    async (ctx) => {
        try {
            const text = ctx.message?.text;

            if (text === lang.buttons.general.cancel || text?.startsWith('/')) {
                await ctx.reply('✖️ عملیات لغو شد.', Markup.removeKeyboard());
                return ctx.scene.leave();
            }

            // Parse token amount (sanitize middleware already converted Persian digits to English)
            const tokens = parseInt(text, 10);

            if (isNaN(tokens) || tokens <= 0) {
                return ctx.reply(lang.errors.invalidNumber);
            }

            // Save tokens to session state
            ctx.scene.state.tokenAmount = tokens;

            await ctx.reply(lang.adminPackages.wizard.price);
            return ctx.wizard.next();
        } catch (error) {
            logger.error('[PackageWizard] Error in Step 3:', error);
            return ctx.scene.leave();
        }
    },

    // ==========================================
    // STEP 4: Validate Price & Show Review
    // ==========================================
    async (ctx) => {
        try {
            const text = ctx.message?.text;

            if (text === lang.buttons.general.cancel || text?.startsWith('/')) {
                await ctx.reply('✖️ عملیات لغو شد.', Markup.removeKeyboard());
                return ctx.scene.leave();
            }

            const price = parseInt(text, 10);

            // Business Logic: Minimum price is 50,000 Toman
            if (isNaN(price) || price < 50000) {
                return ctx.reply('❌ مبلغ نامعتبر است. دقت کنید که حداقل قیمت باید ۵۰,۰۰۰ تومان باشد.');
            }

            ctx.scene.state.priceIrt = price;

            // Show final review with Confirm/Cancel keyboard
            const keyboard = Markup.keyboard([
                [lang.buttons.general.confirm, lang.buttons.general.cancel]
            ]).resize();

            await ctx.reply(lang.adminPackages.wizard.review(ctx.scene.state), keyboard);
            return ctx.wizard.next();
        } catch (error) {
            logger.error('[PackageWizard] Error in Step 4:', error);
            return ctx.scene.leave();
        }
    },

    // ==========================================
    // STEP 5: Save to Database
    // ==========================================
    async (ctx) => {
        try {
            const text = ctx.message?.text;

            if (text === lang.buttons.general.cancel || text?.startsWith('/')) {
                await ctx.reply('✖️ عملیات لغو شد.', Markup.removeKeyboard());
                return ctx.scene.leave();
            }

            if (text !== lang.buttons.general.confirm) {
                return ctx.reply(lang.errors.invalidInput);
            }

            // Acknowledge loading state
            const loadingMsg = await ctx.reply('⏳ در حال ثبت در سیستم...').catch(() => null);

            // Create package via Service
            await PackageService.createPackage(
                ctx.scene.state.title,
                ctx.scene.state.tokenAmount,
                ctx.scene.state.priceIrt
            );

            if (loadingMsg) {
                ctx.deleteMessage(loadingMsg.message_id).catch(() => {});
            }

            await ctx.reply(lang.adminPackages.wizard.success, Markup.removeKeyboard());

            // Clean exit
            return ctx.scene.leave();
        } catch (error) {
            logger.error('[PackageWizard] Error creating package:', error);
            await ctx.reply(lang.errors.general, Markup.removeKeyboard()).catch(() => {});
            return ctx.scene.leave();
        }
    }
);

module.exports = packageWizard;