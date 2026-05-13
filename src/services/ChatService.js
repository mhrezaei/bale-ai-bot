// File Path: src/services/ChatService.js

const MessageLog = require('../models/MessageLog');

/**
 * ChatService
 * Handles conversation history, context retrieval for OpenAI, and message logging.
 * Keeps the controllers clean and strictly adheres to the Single Responsibility Principle.
 */
class ChatService {
    /**
     * Logs a single message (either from the user, assistant, or system) to the database.
     * @param {Object} params - The message parameters
     * @param {string} params.userId - MongoDB ObjectId of the user
     * @param {number} params.messageId - The Bale message_id
     * @param {number} [params.replyToMessageId] - Optional ID of the replied message
     * @param {string} [params.type='TEXT'] - Content type (TEXT, IMAGE, SYSTEM)
     * @param {string} params.role - Role in the conversation (user, assistant, system)
     * @param {string} params.content - The actual text content
     * @param {string} [params.model='gpt-4o-mini'] - The AI model used
     * @param {Object} [params.tokens={}] - Token usage details
     * @returns {Promise<Object>} The saved message log document
     */
    async logMessage({ userId, messageId, replyToMessageId = null, type = 'TEXT', role, content, model = 'gpt-4o-mini', tokens = {} }) {
        return MessageLog.create({
            user: userId,
            messageId,
            replyToMessageId,
            type,
            role,
            content,
            model,
            tokens: {
                prompt: tokens.prompt || 0,
                completion: tokens.completion || 0,
                total: tokens.total || 0
            }
        });
    }

    /**
     * Retrieves the recent conversation context formatted exactly for the OpenAI API.
     * @param {string} userId - MongoDB ObjectId of the user
     * @param {number} limit - Number of messages to retrieve (default: 6 for preserving 3 Q&A pairs)
     * @returns {Promise<Array>} Array of message objects mapped to { role, content }
     */
    async getConversationContext(userId, limit = 6) {
        // Fetch the last N messages for the user, sorted by newest first
        const logs = await MessageLog.find({ user: userId, type: 'TEXT' })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('role content -_id');

        // Reverse the array so the oldest message in the context array comes first (required by OpenAI)
        const context = logs.reverse().map(log => ({
            role: log.role,
            content: log.content
        }));

        return context;
    }

    /**
     * Clears or archives the conversation history for a specific user.
     * Useful when the user issues a command like /clear to start a fresh context.
     * @param {string} userId - MongoDB ObjectId
     * @returns {Promise<Object>} Mongoose deletion result
     */
    async clearHistory(userId) {
        return MessageLog.deleteMany({ user: userId });
    }

    /**
     * Calculates the total token usage for a specific user across all interactions.
     * Uses MongoDB Aggregation Pipeline for maximum performance.
     * @param {string} userId - MongoDB ObjectId
     * @returns {Promise<number>} Total sum of tokens used
     */
    async getTotalTokenUsage(userId) {
        const result = await MessageLog.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, total: { $sum: '$tokens.total' } } }
        ]);

        return result.length > 0 ? result[0].total : 0;
    }
}

module.exports = new ChatService();