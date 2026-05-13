// File Path: src/services/OpenAiService.js

const { OpenAI } = require('openai');
const config = require('../config/env');
const CONSTANTS = require('../config/constants');
const logger = require('../utils/logger.util');

/**
 * OpenAiService
 * Manages strictly the communication with the OpenAI API.
 * Handles chat completions, image generations, and parses token usage.
 * Designed to be thread-safe and robust for usage inside BullMQ workers.
 */
class OpenAiService {
    constructor() {
        // Ensure API key exists before initializing
        if (!config.openAiApiKey) {
            logger.error('[FATAL] OPENAI_API_KEY is missing in the environment variables.');
            process.exit(1);
        }

        // Initialize the official OpenAI client
        this.client = new OpenAI({
            apiKey: config.openAiApiKey,
            // Automatically retry failed requests (e.g., network blips)
            maxRetries: CONSTANTS.WORKER.MAX_RETRIES || 3,
            // Abort requests that take longer than 30 seconds to prevent worker thread blocking
            timeout: 30000,
        });
    }

    /**
     * Sends a conversation context to OpenAI and retrieves the completion response.
     * @param {Array} contextArray - Array of messages: [{ role: 'user', content: '...' }, ...]
     * @param {string} [systemPrompt=''] - Optional system instructions to guide the AI's behavior
     * @param {number} [temperature=0.7] - Controls randomness (0.0 to 2.0)
     * @returns {Promise<Object>} Formatted object containing the text response and token usage
     */
    async generateChatCompletion(contextArray, systemPrompt = '', temperature = 0.7) {
        // Deep copy the context to avoid mutating the original array passed by reference
        const messages = [...contextArray];

        // Inject the system prompt at the very beginning if provided
        if (systemPrompt && systemPrompt.trim() !== '') {
            messages.unshift({
                role: CONSTANTS.AI.ROLES.SYSTEM,
                content: systemPrompt
            });
        }

        try {
            const response = await this.client.chat.completions.create({
                model: CONSTANTS.AI.DEFAULT_MODEL,
                messages: messages,
                temperature: temperature,
                // max_tokens can be specified here if you want to strictly limit output length
            });

            const choice = response.choices[0];
            const usage = response.usage;

            return {
                isSuccess: true,
                content: choice.message.content,
                tokens: {
                    prompt: usage.prompt_tokens,
                    completion: usage.completion_tokens,
                    total: usage.total_tokens
                },
                finishReason: choice.finish_reason // e.g., 'stop', 'length', 'content_filter'
            };

        } catch (error) {
            return this._handleError(error, 'Chat Completion');
        }
    }

    /**
     * Placeholder method for future Image Generation feature (DALL-E 3).
     * @param {string} prompt - The user's image request
     * @returns {Promise<Object>}
     */
    async generateImage(prompt) {
        try {
            const response = await this.client.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
            });

            return {
                isSuccess: true,
                imageUrl: response.data[0].url
            };
        } catch (error) {
            return this._handleError(error, 'Image Generation');
        }
    }

    /**
     * Internal method to standardize error logging and formatting from the OpenAI API.
     * @param {Object} error - The caught error object
     * @param {string} context - Where the error occurred
     * @returns {Object} Standardized failed response object
     * @private
     */
    _handleError(error, context) {
        let errorMessage = 'An unknown error occurred while communicating with OpenAI.';

        if (error instanceof OpenAI.APIError) {
            // Log structured API errors
            logger.error(`[OpenAiService] ${context} API Error:`, {
                status: error.status,
                name: error.name,
                message: error.message
            });
            errorMessage = error.message;
        } else {
            // Log network or other generic errors
            logger.error(`[OpenAiService] ${context} Generic Error:`, error);
            errorMessage = error.message || String(error);
        }

        return {
            isSuccess: false,
            error: errorMessage,
            content: null,
            tokens: { prompt: 0, completion: 0, total: 0 }
        };
    }
}

module.exports = new OpenAiService();