// File Path: src/services/BroadcastService.js

const Broadcast = require('../models/Broadcast');
const logger = require('../utils/logger.util');

/**
 * BroadcastService
 * Manages the lifecycle of mass messaging campaigns (Broadcasts).
 * Follows SRP by handling only the data layer and state management.
 * Actual message dispatching must be handled by a dedicated background worker (e.g., BullMQ)
 * to prevent blocking the Node.js event loop and to strictly adhere to API rate limits.
 */
class BroadcastService {
    /**
     * Creates a new broadcast campaign and initializes it in a PENDING state.
     * @param {string} adminId - MongoDB ObjectId of the admin creating the campaign.
     * @param {string} messageText - The text content to broadcast (Markdown formatted).
     * @param {string|null} [photoId=null] - Optional Bale file_id for an attached image.
     * @param {number} [totalRecipients=0] - Estimated number of users targeted for this campaign.
     * @returns {Promise<Object>} The newly created Broadcast document.
     */
    async createCampaign(adminId, messageText, photoId = null, totalRecipients = 0) {
        try {
            return await Broadcast.create({
                adminId,
                messageText,
                photoId,
                totalRecipients,
                status: 'PENDING'
            });
        } catch (error) {
            logger.error('[BroadcastService] Error creating campaign:', error);
            throw error;
        }
    }

    /**
     * Updates the overall execution status of a broadcast campaign.
     * @param {string} campaignId - MongoDB ObjectId of the campaign.
     * @param {string} status - New status ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED').
     * @returns {Promise<Object>} The updated Broadcast document.
     */
    async updateCampaignStatus(campaignId, status) {
        try {
            const updatedCampaign = await Broadcast.findByIdAndUpdate(
                campaignId,
                { status },
                { new: true }
            );
            if (!updatedCampaign) {
                throw new Error('Campaign not found.');
            }
            return updatedCampaign;
        } catch (error) {
            logger.error(`[BroadcastService] Error updating campaign ${campaignId} status to ${status}:`, error);
            throw error;
        }
    }

    /**
     * Atomically increments the success or failure count during the dispatch process.
     * Designed to be called safely and concurrently by worker threads without race conditions.
     * @param {string} campaignId - MongoDB ObjectId of the campaign.
     * @param {boolean} isSuccess - True if message was successfully delivered to a user.
     * @returns {Promise<void>}
     */
    async incrementProgress(campaignId, isSuccess) {
        try {
            const incrementField = isSuccess ? { successCount: 1 } : { failureCount: 1 };
            await Broadcast.updateOne(
                { _id: campaignId },
                { $inc: incrementField }
            );
        } catch (error) {
            // Fail-safe strategy: log the error but do not crash the background worker
            logger.error(`[BroadcastService] Error incrementing progress for campaign ${campaignId}:`, error);
        }
    }

    /**
     * Atomically increments the view/interaction count.
     * Useful if tracking engagement via inline button clicks embedded in the broadcast message.
     * @param {string} campaignId - MongoDB ObjectId of the campaign.
     * @returns {Promise<void>}
     */
    async incrementViewCount(campaignId) {
        try {
            await Broadcast.updateOne(
                { _id: campaignId },
                { $inc: { viewCount: 1 } }
            );
        } catch (error) {
            logger.error(`[BroadcastService] Error incrementing view count for campaign ${campaignId}:`, error);
        }
    }

    /**
     * Retrieves a paginated list of broadcast campaigns for the Admin Dashboard.
     * @param {number} page - Current page number.
     * @param {number} limit - Items per page.
     * @returns {Promise<Object>} { campaigns, total, totalPages, currentPage }
     */
    async getCampaigns(page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;

            const [campaigns, total] = await Promise.all([
                Broadcast.find()
                    .populate('adminId', 'firstName lastName phoneNumber')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Broadcast.countDocuments()
            ]);

            return {
                campaigns,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            };
        } catch (error) {
            logger.error('[BroadcastService] Error fetching campaigns:', error);
            throw error;
        }
    }

    /**
     * Retrieves a specific campaign by its ID for detailed reporting and analytics.
     * @param {string} campaignId - MongoDB ObjectId of the campaign.
     * @returns {Promise<Object>} The detailed Broadcast document.
     */
    async getCampaignById(campaignId) {
        try {
            const campaign = await Broadcast.findById(campaignId).populate('adminId', 'firstName lastName');
            if (!campaign) {
                throw new Error('Campaign not found.');
            }
            return campaign;
        } catch (error) {
            logger.error(`[BroadcastService] Error fetching campaign ${campaignId}:`, error);
            throw error;
        }
    }

    /**
     * Safely deletes a campaign from the database.
     * Strictly prevents deletion if the campaign is currently being processed by workers.
     * @param {string} campaignId - MongoDB ObjectId of the campaign.
     * @returns {Promise<Object>} The deleted document.
     */
    async deleteCampaign(campaignId) {
        try {
            const campaign = await Broadcast.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found.');
            }

            if (campaign.status === 'PROCESSING') {
                throw new Error('Cannot delete a campaign that is currently being processed by workers.');
            }

            return await Broadcast.findByIdAndDelete(campaignId);
        } catch (error) {
            logger.error(`[BroadcastService] Error deleting campaign ${campaignId}:`, error);
            throw error;
        }
    }
}

module.exports = new BroadcastService();