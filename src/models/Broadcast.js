const mongoose = require('mongoose');

/**
 * Broadcast Model
 * Stores system-wide announcements sent by administrators.
 */
const broadcastSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        description: 'The admin who created and sent this broadcast'
    },
    messageText: {
        type: String,
        required: true,
        description: 'The formatted text of the announcement'
    },
    photoId: {
        type: String,
        default: null,
        description: 'Telegram file_id of the attached image, if any'
    },
    viewCount: {
        type: Number,
        default: 0,
        description: 'Analytics: Total number of resellers who have acknowledged this broadcast'
    }
}, { timestamps: true });

// Index for sorting broadcasts chronologically (useful for admin reports)
broadcastSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Broadcast', broadcastSchema);