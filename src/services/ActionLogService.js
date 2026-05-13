// File Path: src/services/ActionLogService.js

const ActionLog = require('../models/ActionLog');
const CONSTANTS = require('../config/constants');
const logger = require('../utils/logger.util');

/**
 * ActionLogService
 * Dedicated service for recording and retrieving operational audit trails.
 * Ensures all critical administrative and system events are safely persisted.
 * Implements a fail-safe strategy so logging failures do not disrupt core business flows.
 */
class ActionLogService {
    /**
     * Logs an administrative action (e.g., approving a receipt, banning a user).
     * @param {string} adminId - MongoDB ObjectId of the admin performing the action.
     * @param {string} eventType - From CONSTANTS.EVENT_TYPES.
     * @param {Object} [targets={}] - Optional target user or transaction IDs.
     * @param {string} [targets.targetUserId] - User affected by the action.
     * @param {string} [targets.targetTransactionId] - Transaction affected.
     * @param {Object} [metadata={}] - Additional contextual data.
     * @returns {Promise<Object|null>} The created ActionLog document, or null if failed.
     */
    async logAdminAction(adminId, eventType, targets = {}, metadata = {}) {
        try {
            return await ActionLog.create({
                actorId: adminId,
                eventType,
                targetUserId: targets.targetUserId || null,
                targetTransactionId: targets.targetTransactionId || null,
                metadata
            });
        } catch (error) {
            logger.error(`[ActionLogService] Failed to log admin action (${eventType}):`, error);
            // Fail-safe: Do not throw error to prevent disrupting the admin's main action.
            return null;
        }
    }

    /**
     * Logs a system-level event (e.g., OpenAI API critical error, webhook failures).
     * System events have no specific actor (actorId is null).
     * @param {string} eventType - From CONSTANTS.EVENT_TYPES.
     * @param {Object} [metadata={}] - Additional contextual data detailing the system event.
     * @returns {Promise<Object|null>}
     */
    async logSystemEvent(eventType, metadata = {}) {
        try {
            return await ActionLog.create({
                actorId: null,
                eventType,
                metadata
            });
        } catch (error) {
            logger.error(`[ActionLogService] Failed to log system event (${eventType}):`, error);
            return null;
        }
    }

    /**
     * Logs a user-driven event (e.g., new registration, successful online payment).
     * @param {string} userId - MongoDB ObjectId of the user triggering the event.
     * @param {string} eventType - From CONSTANTS.EVENT_TYPES.
     * @param {Object} [metadata={}] - Additional contextual data.
     * @returns {Promise<Object|null>}
     */
    async logUserAction(userId, eventType, metadata = {}) {
        try {
            return await ActionLog.create({
                actorId: userId,
                eventType,
                targetUserId: userId, // The user is the primary target of their own action
                metadata
            });
        } catch (error) {
            logger.error(`[ActionLogService] Failed to log user action (${eventType}):`, error);
            return null;
        }
    }

    /**
     * Retrieves a paginated list of action logs for the admin dashboard.
     * Populates actor and target details for immediate UI presentation.
     * @param {number} page - Current page number.
     * @param {number} limit - Items per page.
     * @param {Object} [filter={}] - MongoDB query filters (e.g., by eventType or actorId).
     * @returns {Promise<Object>} Object containing { logs, total, totalPages, currentPage }
     */
    async getLogs(page = 1, limit = 50, filter = {}) {
        try {
            const skip = (page - 1) * limit;

            const [logs, total] = await Promise.all([
                ActionLog.find(filter)
                    .populate('actorId', 'firstName lastName phoneNumber role')
                    .populate('targetUserId', 'firstName lastName phoneNumber')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                ActionLog.countDocuments(filter)
            ]);

            return {
                logs,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            };
        } catch (error) {
            logger.error('[ActionLogService] Error fetching logs:', error);
            // Here we throw the error because this is an explicit data retrieval request (read operation)
            throw error;
        }
    }
}

module.exports = new ActionLogService();