const { Scenes, Markup } = require('telegraf');
const Broadcast = require('../models/Broadcast');
const User = require('../models/User');
const lang = require('../locales/fa');

/**
 * Broadcast Wizard Scene
 * Guides the Admin through creating a system-wide announcement.
 * Handles text, photos, previews, and bulk database updates.
 */
const broadcastScene = new Scenes.WizardScene(
    'BROADCAST_SCENE',

    // ==========================================
    // STEP 1: Init and Prompt for Message
    // ==========================================
    async (ctx) => {
        try {
            let adminDbId = ctx.state.user._id;

            // [FIX] Auto-Healing for "Memory Fallback" Admins
            // If the admin doesn't exist in MongoDB (only in ENV/Memory), create them instantly.
            if (!adminDbId) {
                let adminUser = await User.findOne({ telegramId: ctx.from.id });
                if (!adminUser) {
                    adminUser = await User.create({
                        telegramId: ctx.from.id,
                        name: ctx.from.first_name || 'Master Admin',
                        role: 'ADMIN',
                        isActive: true
                    });
                    console.log(`[BroadcastScene] Auto-created Master Admin document in MongoDB for ID: ${ctx.from.id}`);
                }
                adminDbId = adminUser._id;
            }

            // Store the solid database ID in wizard state
            ctx.wizard.state.adminId = adminDbId;

            await ctx.reply(lang.broadcast.wizardStart, {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback(lang.buttons.broadcast.cancel, 'cancel_broadcast')]
                ])
            });
            return ctx.wizard.next();
        } catch (error) {
            console.error('[BroadcastScene] Step 1 Error:', error);
            return ctx.scene.leave();
        }
    },

    // ==========================================
    // STEP 2: Receive Input and Show Preview
    // ==========================================
    async (ctx) => {
        try {
            // Handle Cancel Button
            if (ctx.callbackQuery && ctx.callbackQuery.data === 'cancel_broadcast') {
                await ctx.answerCbQuery().catch(() => {});
                await ctx.deleteMessage().catch(() => {});
                await ctx.reply('❌ عملیات ارسال پیام همگانی لغو شد.');
                return ctx.scene.leave();
            }

            // Ignore non-message updates
            if (!ctx.message) return;

            let text = '';
            let photoId = null;

            // Extract Photo and Caption
            if (ctx.message.photo) {
                // Telegram sends multiple sizes, the last one is the highest resolution
                photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
                text = ctx.message.caption || '';
            }
            // Extract pure Text
            else if (ctx.message.text) {
                text = ctx.message.text;
            }

            // Validation: Ensure there is at least some text/caption
            if (!text.trim()) {
                return ctx.reply('⚠️ پیام شما فاقد متن است. لطفاً حتماً یک متن (یا عکس همراه با کپشن) ارسال کنید:');
            }

            // Store in wizard state for the final step
            ctx.wizard.state.broadcastData = { text, photoId };

            // Render Preview
            const previewHeader = lang.broadcast.preview;
            const msgBody = `${lang.broadcast.mandatoryTitle}${text}\n\n━━━━━━━━━━━━━━━━━━━━\n${previewHeader}`;

            const keyboard = Markup.inlineKeyboard([
                [Markup.button.callback(lang.buttons.broadcast.confirmSend, 'confirm_broadcast')],
                [Markup.button.callback(lang.buttons.broadcast.cancel, 'cancel_broadcast')]
            ]);

            if (photoId) {
                await ctx.replyWithPhoto(photoId, { caption: msgBody, parse_mode: 'Markdown', ...keyboard });
            } else {
                await ctx.reply(msgBody, { parse_mode: 'Markdown', ...keyboard });
            }

            return ctx.wizard.next();
        } catch (error) {
            console.error('[BroadcastScene] Step 2 Error:', error);
            await ctx.reply(lang.errors.general);
            return ctx.scene.leave();
        }
    },

    // ==========================================
    // STEP 3: Confirm and Execute Bulk Update
    // ==========================================
    async (ctx) => {
        try {
            if (!ctx.callbackQuery) return; // Only accept inline button presses here

            const action = ctx.callbackQuery.data;
            await ctx.answerCbQuery().catch(() => {});

            if (action === 'cancel_broadcast') {
                await ctx.editMessageReplyMarkup({ inline_keyboard: [] }).catch(() => {});
                await ctx.reply('❌ عملیات ارسال پیام همگانی لغو شد.');
                return ctx.scene.leave();
            }

            if (action === 'confirm_broadcast') {
                // Remove buttons to prevent double-clicking
                await ctx.editMessageReplyMarkup({ inline_keyboard: [] }).catch(() => {});
                await ctx.reply(lang.broadcast.sending);

                // Fetch data safely from the wizard state
                const { text, photoId } = ctx.wizard.state.broadcastData;
                const adminId = ctx.wizard.state.adminId; // Retrieved from Step 1

                // 1. Create the Broadcast record in the Database
                const broadcast = await Broadcast.create({
                    adminId: adminId,
                    messageText: text,
                    photoId: photoId
                });

                // 2. Perform a Bulk Update (Push to Queue) for all ACTIVE, NON-GHOST Resellers
                const updateResult = await User.updateMany(
                    {
                        role: 'RESELLER',
                        isActive: true,
                        isGhost: false
                    },
                    {
                        $push: { unreadBroadcasts: broadcast._id }
                    }
                );

                // 3. Notify Admin of Success
                await ctx.reply(lang.broadcast.success(updateResult.modifiedCount), { parse_mode: 'Markdown' });
                return ctx.scene.leave();
            }

        } catch (error) {
            console.error('[BroadcastScene] Step 3 Error:', error);
            await ctx.reply(lang.errors.general);
            return ctx.scene.leave();
        }
    }
);

module.exports = broadcastScene;