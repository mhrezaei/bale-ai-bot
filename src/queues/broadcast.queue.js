// File Path: src/queues/broadcast.queue.js

const { Queue } = require('bullmq');
const redisClient = require('../core/redis');
const logger = require('../utils/logger.util');

/**
 * Broadcast Queue
 * Manages mass messaging campaigns.
 * Designed to handle thousands of messages by breaking them down into
 * individual jobs to respect Bale/Telegram rate limits.
 */

const BROADCAST_QUEUE_NAME = 'broadcast-messages';

const broadcastQueue = new Queue(BROADCAST_QUEUE_NAME, {
    connection: redisClient,
    defaultJobOptions: {
        // Only retry on network errors, not on user blocks (handled in worker)
        attempts: 3,
        backoff: {
            type: 'fixed',
            delay: 3000,
        },
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 1000 },
    }
});

/**
 * Adds a massive batch of messages to the queue efficiently.
 * Used by the BroadcastController when an Admin initiates a campaign.
 * @param {string} campaignId - The ID of the broadcast campaign in DB.
 * @param {Array<Object>} users - Array of user objects containing their Bale IDs.
 * @param {string} messageText - The formatted text to send.
 * @param {string|null} photoId - Optional photo file_id.
 * @returns {Promise<void>}
 */
const addCampaignJobs = async (campaignId, users, messageText, photoId = null) => {
    try {
        // Map users to BullMQ Job objects for bulk insertion (highly optimized)
        const jobs = users.map(user => ({
            name: 'send-broadcast',
            data: {
                campaignId: campaignId.toString(),
                userId: user._id.toString(),
                baleId: user.baleId,
                messageText,
                photoId
            }
        }));

        await broadcastQueue.addBulk(jobs);
        logger.info(`[BroadcastQueue] Successfully queued ${jobs.length} messages for campaign ${campaignId}`);
    } catch (error) {
        logger.error(`[BroadcastQueue] Failed to add campaign jobs for ${campaignId}:`, error);
        throw error;
    }
};

module.exports = {
    broadcastQueue,
    addCampaignJobs
};