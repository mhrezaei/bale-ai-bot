// File Path: src/services/PaymentService.js

const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const UserService = require('./UserService');
const CONSTANTS = require('../config/constants');
const logger = require('../utils/logger.util');

/**
 * PaymentService
 * Handles all financial logic, receipt approvals, and gateway verifications.
 * Implements Mongoose Sessions (ACID Transactions) to ensure absolute data consistency
 * between the Transaction logs and User balances.
 */
class PaymentService {
    // ==========================================
    // 🧾 MANUAL RECEIPT METHODS
    // ==========================================

    /**
     * Creates a new pending transaction for a manually uploaded bank receipt.
     * @param {string} userId - The MongoDB ObjectId of the user.
     * @param {number} amountIrt - The paid amount in IRT.
     * @param {number} tokenAmount - The tokens to be credited.
     * @param {string} photoFileId - The Bale file_id of the receipt photo.
     * @returns {Promise<Object>} The created Transaction document.
     */
    async createReceiptTransaction(userId, amountIrt, tokenAmount, photoFileId) {
        try {
            return await Transaction.create({
                user: userId,
                amountIrt,
                tokenAmount,
                paymentMethod: 'RECEIPT',
                status: CONSTANTS.TRANSACTION_STATUS.PENDING,
                receiptPhotoId: photoFileId
            });
        } catch (error) {
            logger.error('[PaymentService] Error creating receipt transaction:', error);
            throw error;
        }
    }

    /**
     * Approves a pending receipt and securely credits the user's balance.
     * Uses MongoDB transactions to guarantee atomicity.
     * @param {string} transactionId - The ID of the pending transaction.
     * @returns {Promise<Object>} The updated transaction document.
     */
    async approveManualReceipt(transactionId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find the transaction and ensure it is currently PENDING (Idempotency Check)
            const transaction = await Transaction.findOne({
                _id: transactionId,
                status: CONSTANTS.TRANSACTION_STATUS.PENDING,
                paymentMethod: 'RECEIPT'
            }).session(session);

            if (!transaction) {
                throw new Error('Transaction not found or already processed.');
            }

            // Update Transaction Status
            transaction.status = CONSTANTS.TRANSACTION_STATUS.APPROVED;
            await transaction.save({ session });

            // Credit User Balance & Update LTV
            await UserService.addTokens(transaction.user, transaction.tokenAmount);
            await UserService.addMoneySpent(transaction.user, transaction.amountIrt);

            await session.commitTransaction();
            return transaction;
        } catch (error) {
            await session.abortTransaction();
            logger.error(`[PaymentService] Error approving receipt ${transactionId}:`, error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Rejects a pending receipt and records the admin's note.
     * @param {string} transactionId - The ID of the pending transaction.
     * @param {string} adminNote - The reason for rejection.
     * @returns {Promise<Object>} The updated transaction document.
     */
    async rejectManualReceipt(transactionId, adminNote) {
        try {
            const transaction = await Transaction.findOneAndUpdate(
                {
                    _id: transactionId,
                    status: CONSTANTS.TRANSACTION_STATUS.PENDING,
                    paymentMethod: 'RECEIPT'
                },
                {
                    status: CONSTANTS.TRANSACTION_STATUS.REJECTED,
                    adminNote: adminNote
                },
                { new: true }
            );

            if (!transaction) {
                throw new Error('Transaction not found or already processed.');
            }

            return transaction;
        } catch (error) {
            logger.error(`[PaymentService] Error rejecting receipt ${transactionId}:`, error);
            throw error;
        }
    }

    // ==========================================
    // 💼 BALE WALLET GATEWAY METHODS
    // ==========================================

    /**
     * Creates a pending transaction for a Bale Wallet payment.
     * The returned transaction _id should be used as the 'payload' when generating the invoice link.
     * @param {string} userId - User ID.
     * @param {number} amountIrt - Amount in Toman.
     * @param {number} tokenAmount - Tokens to credit.
     * @returns {Promise<Object>}
     */
    async createBaleTransaction(userId, amountIrt, tokenAmount) {
        try {
            return await Transaction.create({
                user: userId,
                amountIrt,
                tokenAmount,
                paymentMethod: 'BALE_WALLET',
                status: CONSTANTS.TRANSACTION_STATUS.PENDING
            });
        } catch (error) {
            logger.error('[PaymentService] Error creating Bale transaction:', error);
            throw error;
        }
    }

    /**
     * Verifies a successful Bale Wallet payment.
     * Matches the payload (transaction ID) and ensures no double-spending.
     * @param {string} transactionPayload - The transaction _id embedded in the invoice.
     * @param {string} baleChargeId - The unique charge ID provided by Bale upon success.
     * @returns {Promise<Object>}
     */
    async verifyBalePayment(transactionPayload, baleChargeId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const transaction = await Transaction.findOne({
                _id: transactionPayload,
                status: CONSTANTS.TRANSACTION_STATUS.PENDING,
                paymentMethod: 'BALE_WALLET'
            }).session(session);

            if (!transaction) {
                throw new Error('Invalid Bale transaction payload or already verified.');
            }

            // Check if this specific charge ID has already been recorded (Safety measure)
            const existingCharge = await Transaction.findOne({ baleChargeId }).session(session);
            if (existingCharge) {
                throw new Error('Bale Charge ID has already been processed.');
            }

            transaction.status = CONSTANTS.TRANSACTION_STATUS.SUCCESS;
            transaction.baleChargeId = baleChargeId;
            await transaction.save({ session });

            await UserService.addTokens(transaction.user, transaction.tokenAmount);
            await UserService.addMoneySpent(transaction.user, transaction.amountIrt);

            await session.commitTransaction();
            return transaction;
        } catch (error) {
            await session.abortTransaction();
            logger.error(`[PaymentService] Error verifying Bale payment ${baleChargeId}:`, error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    // ==========================================
    // 💳 ZARINPAL GATEWAY METHODS
    // ==========================================

    /**
     * Creates a pending transaction for a ZarinPal payment.
     * @param {string} userId
     * @param {number} amountIrt
     * @param {number} tokenAmount
     * @param {string} authority - The authority code returned by ZarinPal init API.
     * @returns {Promise<Object>}
     */
    async createZarinpalTransaction(userId, amountIrt, tokenAmount, authority) {
        try {
            return await Transaction.create({
                user: userId,
                amountIrt,
                tokenAmount,
                paymentMethod: 'ZARINPAL',
                status: CONSTANTS.TRANSACTION_STATUS.PENDING,
                zarinpalAuthority: authority
            });
        } catch (error) {
            logger.error('[PaymentService] Error creating Zarinpal transaction:', error);
            throw error;
        }
    }

    /**
     * Verifies the ZarinPal callback.
     * @param {string} authority - The authority code from the callback URL.
     * @param {string} refId - The reference ID provided by ZarinPal after verification.
     * @returns {Promise<Object>}
     */
    async verifyZarinpalPayment(authority, refId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const transaction = await Transaction.findOne({
                zarinpalAuthority: authority,
                status: CONSTANTS.TRANSACTION_STATUS.PENDING,
                paymentMethod: 'ZARINPAL'
            }).session(session);

            if (!transaction) {
                throw new Error('Invalid ZarinPal authority or already verified.');
            }

            transaction.status = CONSTANTS.TRANSACTION_STATUS.SUCCESS;
            transaction.zarinpalRefId = refId;
            await transaction.save({ session });

            await UserService.addTokens(transaction.user, transaction.tokenAmount);
            await UserService.addMoneySpent(transaction.user, transaction.amountIrt);

            await session.commitTransaction();
            return transaction;
        } catch (error) {
            await session.abortTransaction();
            logger.error(`[PaymentService] Error verifying ZarinPal payment (Authority: ${authority}):`, error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    // ==========================================
    // ⚙️ MANUAL SYSTEM CHARGES (ORCHESTRATOR)
    // ==========================================

    /**
     * Processes a direct manual charge by the Admin.
     * Bypasses the Transaction collection and acts directly on the User model.
     * @param {string} targetUserId - The MongoDB ObjectId of the user.
     * @param {number} amountIrt - The equivalent fiat amount (for reporting LTV).
     * @param {number} tokenAmount - Tokens to inject.
     * @returns {Promise<void>}
     */
    async processManualCharge(targetUserId, amountIrt, tokenAmount) {
        try {
            await UserService.addTokens(targetUserId, tokenAmount);
            if (amountIrt > 0) {
                await UserService.addMoneySpent(targetUserId, amountIrt);
            }
            // Note: Auditing this action (who did it) is delegated to the ActionLogService/Controller
        } catch (error) {
            logger.error(`[PaymentService] Error processing manual charge for user ${targetUserId}:`, error);
            throw error;
        }
    }

    // ==========================================
    // 🔍 UTILITY & REPORTING METHODS
    // ==========================================

    /**
     * Fetches paginated pending transactions (typically for Admin dashboard to review receipts).
     * @param {number} page
     * @param {number} limit
     * @returns {Promise<Object>} { transactions, total }
     */
    async getPendingReceipts(page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const filter = {
                status: CONSTANTS.TRANSACTION_STATUS.PENDING,
                paymentMethod: 'RECEIPT'
            };

            const [transactions, total] = await Promise.all([
                Transaction.find(filter).populate('user', 'firstName lastName phoneNumber').sort({ createdAt: 1 }).skip(skip).limit(limit),
                Transaction.countDocuments(filter)
            ]);

            return { transactions, total, totalPages: Math.ceil(total / limit) };
        } catch (error) {
            logger.error('[PaymentService] Error fetching pending receipts:', error);
            throw error;
        }
    }

    /**
     * Generic method to mark a transaction as failed (e.g., if ZarinPal verification fails).
     * @param {string} transactionId
     * @returns {Promise<Object>}
     */
    async markTransactionFailed(transactionId) {
        return Transaction.findByIdAndUpdate(
            transactionId,
            { status: CONSTANTS.TRANSACTION_STATUS.FAILED },
            { new: true }
        );
    }

    /**
     * Generic method to mark a transaction as canceled (e.g., user hits cancel on gateway).
     * @param {string} transactionId
     * @returns {Promise<Object>}
     */
    async markTransactionCanceled(transactionId) {
        return Transaction.findByIdAndUpdate(
            transactionId,
            { status: CONSTANTS.TRANSACTION_STATUS.CANCELED },
            { new: true }
        );
    }
}

module.exports = new PaymentService();