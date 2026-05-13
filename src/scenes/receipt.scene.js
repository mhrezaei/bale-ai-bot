// File Path: src/scenes/receipt.scene.js

const { Scenes, Markup } = require('telegraf');
const PackageService = require('../services/PackageService');
const PaymentService = require('../services/PaymentService');
const notifier = require('../utils/notifier.util');
const lang = require('../locales/fa');
const logger = require('../utils/logger.util');

/**
 * Manual Receipt (Card-to-Card) Wizard Scene
 * Isolates the user context to exclusively wait for a photo upload.
 * Prevents text inputs from leaking into the AI Chat Controller.
 */
const receiptWizard = new Scenes.WizardScene(
    'RECEIPT_SCENE',

    // ==========================================
    // STEP 1: Initialization & Prompt
    // ==========================================
    async (ctx) => {
        try {
            // Retrieve the packageId passed from the PaymentController
            const packageId = ctx.scene.state.packageId;

            if (!packageId) {
                await ctx.reply(lang.errors.general);
                return ctx.scene.leave();
            }

            // Fetch package details to guarantee price accuracy (prevent client-side manipulation)
            const pkg = await PackageService.getPackageById(packageId);

            // Save package details in the scene's memory for Step 2
            ctx.scene.state.pkg = pkg;

            // Display the target card number and amount (from fa.js) with a Cancel button
            const keyboard = Markup.keyboard([
                [lang.buttons.general.cancel]
            ]).resize();

            await ctx.reply(lang.receipt.start(pkg.priceIrt), keyboard);

            // Move to Step 2
            return ctx.wizard.next();

        } catch (error) {
            logger.error('[Receipt Scene] Error in Step 1:', error);
            await ctx.reply(lang.errors.general).catch(() => {});
            return ctx.scene.leave();
        }
    },

    // ==========================================
    // STEP 2: Wait for Photo Upload
    // ==========================================
    async (ctx) => {
        try {
            const message = ctx.message;

            // Handle Cancellation explicitly
            if (message?.text === lang.buttons.general.cancel || message?.text?.startsWith('/')) {
                await ctx.reply(lang.payment.canceled, Markup.removeKeyboard());
                return ctx.scene.leave();
            }

            // Validation: Ensure the user actually sent a photo
            if (!message?.photo) {
                // Return explicitly WITHOUT advancing the wizard step, forcing them to send a photo
                return ctx.reply(lang.receipt.invalidInput);
            }

            const user = ctx.state.user;
            const pkg = ctx.scene.state.pkg;

            // Telegram sends an array of photos (different compressions). We take the largest one.
            const photoFileId = message.photo[message.photo.length - 1].file_id;

            // 1. Create a Pending Transaction in the Database
            const transaction = await PaymentService.createReceiptTransaction(
                user._id,
                pkg.priceIrt,
                pkg.tokenAmount,
                photoFileId
            );

            // 2. Notify the Master Admin immediately with the photo and Action Buttons
            const fullName = `${user.firstName} ${user.lastName || ''}`.trim();
            await notifier.sendReceiptToAdmin(
                transaction._id.toString(),
                fullName,
                pkg.priceIrt,
                photoFileId
            );

            // 3. Confirm success to the user and clean up the UI
            await ctx.reply(lang.receipt.submitted, Markup.removeKeyboard());

            // Exit the wizard
            return ctx.scene.leave();

        } catch (error) {
            logger.error('[Receipt Scene] Error in Step 2:', error);
            await ctx.reply(lang.errors.general, Markup.removeKeyboard()).catch(() => {});
            return ctx.scene.leave();
        }
    }
);

module.exports = receiptWizard;