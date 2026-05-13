// File Path: src/models/MessageLog.js

const mongoose = require('mongoose');

/**
 * MessageLog Schema
 * Stores the history of all interactions between users and the AI assistant.
 * Used for maintaining conversation context, auditing tokens, and future feature scaling.
 */
const MessageLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
        description: 'Reference to the User who sent or received the message'
    },
    messageId: {
        type: Number,
        required: true,
        index: true,
        description: 'The message_id provided by the Bale platform'
    },
    replyToMessageId: {
        type: Number,
        default: null,
        index: true, // Indexed to facilitate conversation threading and context retrieval
        description: 'The ID of the message this message is replying to'
    },
    type: {
        type: String,
        enum: ['TEXT', 'IMAGE', 'SYSTEM'],
        default: 'TEXT',
        description: 'The type of content (e.g., TEXT for chat, IMAGE for generation)'
    },
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true,
        description: 'The role of the message author in the OpenAI conversation context'
    },
    content: {
        type: String,
        required: true,
        description: 'The actual text content of the message'
    },
    model: {
        type: String,
        default: 'gpt-4o-mini',
        description: 'The specific AI model version used for this interaction'
    },
    tokens: {
        prompt: {
            type: Number,
            default: 0,
            description: 'Tokens used in the input prompt'
        },
        completion: {
            type: Number,
            default: 0,
            description: 'Tokens used in the AI response'
        },
        total: {
            type: Number,
            default: 0,
            description: 'Sum of prompt and completion tokens'
        }
    }
}, {
    // Manages createdAt and updatedAt, useful for analyzing response times
    timestamps: true
});

/**
 * Compound index to quickly fetch the conversation history for a specific user.
 * Sorting by createdAt helps in retrieving context in the correct chronological order.
 */
MessageLogSchema.index({ user: 1, createdAt: -1 });

const MessageLog = mongoose.model('MessageLog', MessageLogSchema);

module.exports = MessageLog;