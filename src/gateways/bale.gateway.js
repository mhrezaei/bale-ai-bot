// File Path: src/gateways/bale.gateway.js

const config = require('../config/env');
const logger = require('../utils/logger.util');
// We use fetch (native in Node 18+) or axios for custom HTTP requests if needed
const axios = require('axios');

/**
 * Bale Wallet Payment Gateway
 * Handles the communication with Bale's e-wallet system.
 * Converts Toman to Rial internally as required by Bale API.
 */
class BaleGateway {
    /**
     * Generates and sends an invoice to the chat using Telegraf's replyWithInvoice.
     * @param {Object} ctx - Telegraf context.
     * @param {string} transactionId - MongoDB Transaction ID (used as payload).
     * @param {string} packageTitle - Name of the product.
     * @param {number} amountToman - Price in Toman.
     */
    async sendInvoice(ctx, transactionId, packageTitle, amountToman) {
        try {
            // Bale requires the amount in Rial (IRR) and as an Integer
            const amountRial = Math.floor(amountToman * 10);

            const invoice = {
                title: packageTitle.substring(0, 32), // Bale limit: 32 chars
                description: 'شارژ حساب و دریافت توکن دستیار هوشمند'.substring(0, 255), // Bale limit: 255 chars
                payload: transactionId.toString(), // The secret tracking ID
                provider_token: config.baleWalletToken || 'WALLET-TEST-1111111111111111', // Add this to env.js
                currency: 'IRR',
                prices: [{ label: 'مبلغ قابل پرداخت', amount: amountRial }]
            };

            await ctx.replyWithInvoice(invoice);
        } catch (error) {
            logger.error('[BaleGateway] Error sending invoice:', error);
            throw error;
        }
    }

    /**
     * Custom HTTP call to inquire about a specific transaction status.
     * Not natively supported by Telegraf, hence the raw HTTP request.
     * @param {string} transactionId - The Bale transaction ID.
     * @returns {Promise<Object>} The transaction status object.
     */
    async inquireTransaction(transactionId) {
        try {
            const response = await axios.post(
                `https://tapi.bale.ai/bot${config.botToken}/inquireTransaction`,
                { transaction_id: transactionId }
            );
            return response.data.result;
        } catch (error) {
            logger.error(`[BaleGateway] Error inquiring transaction ${transactionId}:`, error);
            return null;
        }
    }
}

module.exports = new BaleGateway();