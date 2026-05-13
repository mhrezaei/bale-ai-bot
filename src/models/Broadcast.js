// File Path: src/models/Broadcast.js

const mongoose = require('mongoose');

/**
 * Broadcast Model
 * Stores system-wide announcements sent by administrators.
 * Designed to handle large-scale message distribution with progress tracking.
 */
const BroadcastSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
        description: 'The administrator who created and initiated this broadcast'
    },
    messageText: {
        type: String,
        required: true,
        description: 'The formatted Markdown text of the announcement'
    },
    photoId: {
        type: String,
        default: null,
        description: 'The Bale file_id of the attached image, if any'
    },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
        default: 'PENDING',
        index: true,
        description: 'Current delivery status of the broadcast campaign'
    },
    totalRecipients: {
        type: Number,
        default: 0,
        description: 'Total number of users targeted for this broadcast'
    },
    successCount: {
        type: Number,
        default: 0,
        description: 'Total number of users who successfully received the message'
    },
    failureCount: {
        type: Number,
        default: 0,
        description: 'Total number of failed deliveries (e.g., user blocked the bot)'
    },
    viewCount: {
        type: Number,
        default: 0,
        description: 'Analytics: Total number of users who interacted with the broadcast'
    }
}, {
    timestamps: true
});

/**
 * Indexes for administrative reporting and performance.
 * Optimized for sorting by creation date.
 */
BroadcastSchema.index({ createdAt: -1 });

const Broadcast = mongoose.model('Broadcast', BroadcastSchema);

module.exports = Broadcast;