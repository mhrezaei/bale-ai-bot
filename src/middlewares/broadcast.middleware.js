const { Markup } = require('telegraf');
const Broadcast = require('../models/Broadcast');
// [NEW] Import the controller directly to bypass Telegraf's router and Scene traps
const broadcastController = require('../controllers/BroadcastController');

/**
 * Broadcast Middleware (Interceptor)
 * Forces Resellers to acknowledge pending broadcast messages before continuing.
 * Drops any other incoming requests until the queue is cleared.
 */
module.exports = async (ctx, next) => {
    // 1. Ensure user is loaded (Middleware order is critical: must run after auth)
    const user = ctx.state.user;

    // Bypass if user is not a reseller, or if their queue is empty
    if (!user || user.role === 'ADMIN' || !user.unreadBroadcasts || user.unreadBroadcasts.length === 0) {
        return next();
    }

    // 2. [CRITICAL FIX] Handle the Acknowledge action DIRECTLY here to bypass Scene traps!
    // If the user clicks the acknowledge button, we do not let the update reach the router or active scenes.
    if (ctx.callbackQuery && ctx.callbackQuery.data && ctx.callbackQuery.data.startsWith('ack_bc:')) {
        const broadcastId = ctx.callbackQuery.data.split(':')[1];

        // Forcefully eject the user from any stuck or active scenes to prevent routing dead-ends
        if (ctx.scene && typeof ctx.scene.leave === 'function') {
            await ctx.scene.leave().catch(() => {});
        }

        // Execute the controller logic directly and halt further middleware chain execution
        return await broadcastController.acknowledgeMessage(ctx, broadcastId);
    }

    try {
        // 3. Fetch the oldest unread broadcast (First-In-First-Out)
        const broadcastId = user.unreadBroadcasts[0];
        const broadcast = await Broadcast.findById(broadcastId);

        if (!broadcast) {
            // Failsafe: If the broadcast was hard-deleted from DB by Admin, remove from user's queue silently
            user.unreadBroadcasts.shift();
            await user.save();
            return next();
        }

        // 4. Intercept the user's action
        if (ctx.callbackQuery) {
            // Stop the loading spinner of whatever button they clicked and show an alert
            await ctx.answerCbQuery('⚠️ جهت ادامه، لطفاً پیام‌های مدیریت را مطالعه و تایید کنید.', { show_alert: true }).catch(() => {});
        }

        // 5. Render the mandatory message safely
        const messageText = `📢 **اطلاعیه مدیریت (نیازمند تایید)**\n━━━━━━━━━━━━━━━━━━━━\n\n${broadcast.messageText}`;

        // Use a compact callback_data ('ack_bc') to stay well under Telegram's 64-byte limit
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('✅ خواندم و تایید', `ack_bc:${broadcast._id}`)]
        ]);

        try {
            if (broadcast.photoId) {
                await ctx.replyWithPhoto(broadcast.photoId, {
                    caption: messageText,
                    parse_mode: 'Markdown',
                    ...keyboard
                });
            } else {
                await ctx.reply(messageText, {
                    parse_mode: 'Markdown',
                    ...keyboard
                });
            }
        } catch (tgError) {
            // [CRITICAL FIX] If bot is blocked (403) or message deleted (400), do not crash and do not call next()
            console.error(`[Broadcast Middleware] Failed to send mandatory msg to user ${user.telegramId}: ${tgError.message}`);
            // We just halt execution. The user won't get the message, but the bot won't crash or loop.
            return;
        }

        // CRITICAL: We DO NOT call next(). This halts the event chain entirely.
        return;

    } catch (error) {
        console.error('[Broadcast Middleware] Core Error:', error.message);
        // Fallback gracefully to avoid locking the user out entirely on an unexpected DB error
        return next();
    }
};