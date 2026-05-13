const { Markup } = require('telegraf');
const Broadcast = require('../models/Broadcast');
const User = require('../models/User');
const clientController = require('./ClientController');
const lang = require('../locales/fa');
const dateUtils = require('../utils/date.utils');

/**
 * BroadcastController
 * Manages the flow of system-wide announcements.
 * Handles both the Admin initiation and Reseller acknowledgment logic.
 */
class BroadcastController {

    /**
     * Starts the Broadcast creation scene for Admins
     */
    async startBroadcast(ctx) {
        try {
            return await ctx.scene.enter('BROADCAST_SCENE');
        } catch (error) {
            console.error('[BroadcastController] Start Scene Error:', error);
            await ctx.reply(lang.errors.general);
        }
    }

    /**
     * Handles the Reseller's acknowledgment of a mandatory broadcast
     * Called when the 'ack_bc:id' inline button is clicked.
     */
    async acknowledgeMessage(ctx, broadcastId) {
        try {
            // 1. [CRITICAL FIX] Stop the loading spinner IMMEDIATELY before doing anything else
            if (ctx.callbackQuery) {
                await ctx.answerCbQuery('✅ پیام تایید شد.').catch(() => {});
            }

            const user = ctx.state.user;

            // 2. Remove the broadcast ID from the user's unread queue
            const index = user.unreadBroadcasts.indexOf(broadcastId);
            if (index > -1) {
                user.unreadBroadcasts.splice(index, 1);
                // Save user changes immediately to prevent infinite loops if something fails below
                await user.save();
            }

            // 3. Increment the global view count for this specific broadcast safely
            await Broadcast.findByIdAndUpdate(broadcastId, { $inc: { viewCount: 1 } }).catch(() => {});

            // 4. Update the message UI (Add "Acknowledged" stamp)
            const now = new Date();
            const dateStr = dateUtils.formatShamsi(now.getTime(), 'jYYYY/jMM/jDD', true);
            const timeStr = dateUtils.formatShamsi(now.getTime(), 'HH:mm', true);
            const ackText = lang.broadcast.acknowledged(dateStr, timeStr);

            if (ctx.callbackQuery && ctx.callbackQuery.message) {
                const msg = ctx.callbackQuery.message;
                const originalText = msg.caption || msg.text || '';
                const newText = `${originalText}\n\n${ackText}`;

                // [CRITICAL FIX] Proper try-catch block for Telegram API edits
                // If the user deleted the chat history, this will fail safely without crashing the bot
                try {
                    if (msg.photo) {
                        await ctx.editMessageCaption(newText, { parse_mode: 'Markdown' });
                    } else {
                        await ctx.editMessageText(newText, { parse_mode: 'Markdown' });
                    }
                } catch (editError) {
                    console.warn(`[BroadcastController] Failed to edit acknowledged message (User may have deleted chat): ${editError.message}`);
                    // We continue execution even if edit fails
                }
            }

            // 5. Check if there are MORE unread messages in the queue
            if (user.unreadBroadcasts.length > 0) {
                const nextBroadcastId = user.unreadBroadcasts[0];
                const nextBroadcast = await Broadcast.findById(nextBroadcastId);

                // If for some reason the next broadcast was deleted from DB, safely ignore and proceed
                if (nextBroadcast) {
                    const messageText = lang.broadcast.mandatoryTitle + nextBroadcast.messageText;
                    const keyboard = Markup.inlineKeyboard([
                        [Markup.button.callback(lang.buttons.broadcast.acknowledge, `ack_bc:${nextBroadcast._id}`)]
                    ]);

                    try {
                        if (nextBroadcast.photoId) {
                            return await ctx.replyWithPhoto(nextBroadcast.photoId, {
                                caption: messageText,
                                parse_mode: 'Markdown',
                                ...keyboard
                            });
                        } else {
                            return await ctx.reply(messageText, {
                                parse_mode: 'Markdown',
                                ...keyboard
                            });
                        }
                    } catch (sendError) {
                        console.error('[BroadcastController] Failed to send next broadcast in queue:', sendError.message);
                        // If sending fails (e.g. user blocked bot), we drop the event.
                        return;
                    }
                } else {
                    // Fallback: cleanup corrupted ID from queue and try again
                    user.unreadBroadcasts.shift();
                    await user.save();
                }
            }

            // 6. Queue is completely empty! Send the user directly to their main dashboard.
            // We set 'isFreshDashboard' to true to force a NEW message instead of editing,
            // this keeps the acknowledged broadcast visible in the chat history above the dashboard.
            ctx.state.isFreshDashboard = true;
            return await clientController.showDashboard(ctx);

        } catch (error) {
            console.error('[BroadcastController] Acknowledge Error:', error);
            await ctx.reply(lang.errors.general).catch(() => {});
        }
    }
}

module.exports = new BroadcastController();