// File Path: src/queues/openai.queue.js

const { Queue } = require('bullmq');
const redisClient = require('../core/redis');
const logger = require('../utils/logger.util');

/**
 * OpenAI Queue
 * Manages the asynchronous flow of AI requests.
 * This ensures the bot remains responsive while the AI processes heavy completions.
 * Utilizing the existing singleton Redis connection for efficiency.
 */

const OPENAI_QUEUE_NAME = 'openai-completions';

// Initialize the Queue with BullMQ
// We pass the ioredis instance directly to BullMQ
const openaiQueue = new Queue(OPENAI_QUEUE_NAME, {
    connection: redisClient,
    defaultJobOptions: {
        // Attempts to retry the job if the OpenAI API fails (e.g., rate limits or network blips)
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000, // Wait 5 seconds before first retry
        },
        // Automatically remove completed/failed jobs from Redis after a while to save memory
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
    }
});

/**
 * Adds a new AI request to the processing queue.
 * @param {Object} data - { userId, baleId, context, systemPrompt, messageId }
 * @returns {Promise<Object>} The created job instance
 */
const addAiJob = async (data) => {
    try {
        const job = await openaiQueue.add('process-completion', data);
        logger.info(`[OpenAiQueue] Job added: ${job.id} for User: ${data.userId}`);
        return job;
    } catch (error) {
        logger.error('[OpenAiQueue] Failed to add job to queue:', error);
        throw error;
    }
};

module.exports = {
    openaiQueue,
    addAiJob
};