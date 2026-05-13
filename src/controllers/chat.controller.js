// File Path: src/controllers/chat.controller.js

const { Markup } = require('telegraf');
const { addAiJob } = require('../queues/openai.queue');
const ChatService = require('../services/ChatService');
const lang = require('../locales/fa');
const logger = require('../utils/logger.util');

/**
 * Chat Controller
 * Orchestrates the primary AI conversational experience.
 * Handles context gathering, rate limitations, and dispatches to BullMQ.
 * Strictly uses locales/fa.js for all Persian texts to maintain a Single Source of Truth.
 */
class ChatController {

    /**
     * Primary handler for all incoming user messages.
     */
    async handleIncomingMessage(ctx) {
        try {
            const user = ctx.state.user;
            const message = ctx.message;

            // 1. Guard Clause: Block non-text messages gracefully
            if (!message.text) {
                return ctx.reply(lang.chat.onlyText).catch(() => {});
            }

            // 2. Token Economy Check: Ensure user has sufficient balance
            if (user.creditBalance <= 0) {
                const buyKeyboard = Markup.inlineKeyboard([
                    [Markup.button.callback(lang.buttons.userMenu.buy, 'store_show_packages')]
                ]);
                return ctx.reply(lang.chat.outOfTokens, buyKeyboard).catch(() => {});
            }

            // 3. User Feedback: Send a temporary "thinking" message
            const thinkingMsg = await ctx.reply(lang.chat.thinking).catch(() => null);

            // 4. Context Gathering: Fetch the last 6 messages (3 conversational turns)
            const conversationContext = await ChatService.getConversationContext(user._id, 6);

            // Add the current user message to the context
            conversationContext.push({
                role: 'user',
                content: message.text
            });

            // Log the user's message in the database explicitly
            await ChatService.logMessage({
                userId: user._id,
                messageId: message.message_id,
                role: 'user',
                content: message.text
            });

            // 5. Dispatch to Background Worker (Using the System Prompt from locales)
            await addAiJob({
                userId: user._id.toString(),
                baleId: user.baleId,
                context: conversationContext,
                systemPrompt: lang.chat.systemPrompt,
                messageId: message.message_id
            });

            // 6. Cleanup: Delete the "thinking..." message
            if (thinkingMsg) {
                setTimeout(() => {
                    ctx.deleteMessage(thinkingMsg.message_id).catch(() => {});
                }, 1500);
            }

        } catch (error) {
            logger.error(`[ChatController] Error processing message from ${ctx.from?.id}:`, error);
            return ctx.reply(lang.chat.error).catch(() => {});
        }
    }

    /**
     * Clears the user's conversation history from the database.
     */
    async clearHistory(ctx) {
        try {
            const userId = ctx.state.user._id;
            await ChatService.clearHistory(userId);

            return ctx.reply(lang.chat.cleared).catch(() => {});
        } catch (error) {
            logger.error(`[ChatController] Error clearing history for ${ctx.from?.id}:`, error);
            return ctx.reply(lang.errors.general).catch(() => {});
        }
    }
}

module.exports = new ChatController();