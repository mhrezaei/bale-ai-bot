// File Path: src/scenes/broadcast.scene.js

const { Scenes, Markup } = require('telegraf');
const User = require('../models/User');
const BroadcastService = require('../services/BroadcastService');
const { addCampaignJobs } = require('../queues/broadcast.queue');
const lang = require('../locales/fa');
const logger = require('../utils/logger.util');

/**
 * Broadcast Wizard Scene
 * Multi-step flow for the Master Admin to compose, preview, and dispatch mass messages.
 * Integrates directly with BullMQ to prevent blocking the event loop.
 */
const broadcastWizard = new Scenes.WizardScene(
    'BROADCAST_SCENE',

    // ==========================================
    // STEP 1: Prompt for Message Input
    // ==========================================
    async (ctx) => {
        try {
            const keyboard = Markup.keyboard([
                [lang.buttons.general.cancel]
            ]).resize();

            await ctx.reply(lang.broadcast.start, keyboard);
            return ctx.wizard.next();
        } catch (error) {
            logger.error('[Broadcast Scene] Error in Step 1:', error);
            return ctx.scene.leave();
        }
    },

    // ==========================================
    // STEP 2: Capture Input & Show Preview
    // ==========================================
    async (ctx) => {
        try {
            const message = ctx.message;

            // Handle Cancellation explicitly
            if (message?.text === lang.buttons.general.cancel || message?.text?.startsWith('/')) {
                await ctx.reply('✖️ عملیات ارسال همگانی لغو شد.', Markup.removeKeyboard());
                return ctx.scene.leave();
            }

            let messageText = '';
            let photoId = null;

            // 1. Extract content based on message type
            if (message.photo) {
                // Get the highest resolution photo (last element in the array)
                photoId = message.photo[message.photo.length - 1].file_id;
                messageText = message.caption || ''; // Caption is optional
            } else if (message.text) {
                messageText = message.text;
            } else {
                // Guard: Reject unsupported media types (video, voice, document, etc.)
                return ctx.reply('❌ فرمت پیام پشتیبانی نمی‌شود. لطفاً فقط یک متن یا یک عکس (همراه با کپشن) ارسال کنید.');
            }

            // 2. Save content to scene state for the final step
            ctx.scene.state.messageText = messageText;
            ctx.scene.state.photoId = photoId;

            // 3. Render Preview for the Admin
            const keyboard = Markup.keyboard([
                [lang.buttons.broadcast.confirmSend],
                [lang.buttons.general.cancel]
            ]).resize();

            await ctx.reply(lang.broadcast.preview);

            if (photoId) {
                await ctx.replyWithPhoto(photoId, { caption: messageText, reply_markup: keyboard });
            } else {
                await ctx.reply(messageText, { reply_markup: keyboard });
            }

            return ctx.wizard.next();

        } catch (error) {
            logger.error('[Broadcast Scene] Error in Step 2:', error);
            await ctx.reply(lang.errors.general, Markup.removeKeyboard()).catch(() => {});
            return ctx.scene.leave();
        }
    },

    // ==========================================
    // STEP 3: Confirm Dispatch & Enqueue Jobs
    // ==========================================
    async (ctx) => {
        try {
            const text = ctx.message?.text;

            // Handle Cancellation
            if (text === lang.buttons.general.cancel || text?.startsWith('/')) {
                await ctx.reply('✖️ عملیات لغو شد.', Markup.removeKeyboard());
                return ctx.scene.leave();
            }

            // Validate confirmation button
            if (text !== lang.buttons.broadcast.confirmSend) {
                return ctx.reply(lang.errors.invalidInput);
            }

            // 1. Acknowledge and show loading
            const loadingMsg = await ctx.reply(lang.broadcast.sending, Markup.removeKeyboard()).catch(() => null);

            // 2. Fetch all active users from the database who have interacted with the bot
            // We only need _id and baleId for the queue payload to minimize memory usage
            const users = await User.find({ isActive: true }).select('_id baleId');

            if (!users || users.length === 0) {
                if (loadingMsg) ctx.deleteMessage(loadingMsg.message_id).catch(() => {});
                await ctx.reply('❌ هیچ کاربری برای ارسال یافت نشد.');
                return ctx.scene.leave();
            }

            const { messageText, photoId } = ctx.scene.state;
            const adminId = ctx.state.user._id;

            // 3. Create a Campaign Record in the Database
            const campaign = await BroadcastService.createCampaign(adminId, messageText, photoId, users.length);

            // 4. Dispatch the massive payload to BullMQ
            // This happens instantly and offloads the heavy network requests to the background worker
            await addCampaignJobs(campaign._id, users, messageText, photoId);

            // 5. Cleanup and Success Message
            if (loadingMsg) {
                ctx.deleteMessage(loadingMsg.message_id).catch(() => {});
            }
            await ctx.reply(lang.broadcast.success(users.length));

            return ctx.scene.leave();

        } catch (error) {
            logger.error('[Broadcast Scene] Error in Step 3:', error);
            await ctx.reply(lang.errors.general, Markup.removeKeyboard()).catch(() => {});
            return ctx.scene.leave();
        }
    }
);

module.exports = broadcastWizard;