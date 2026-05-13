// File Path: src/utils/hashids.util.js

const HashidsUtil = require('hashids/cjs'); // Using /cjs to ensure broad compatibility
const config = require('../config/env');

/**
 * Hashids Utility
 * Used for obfuscating MongoDB ObjectIds (24-character hex strings) into short, URL-safe hashes.
 * Excellent for generating Referral Links, Invoice IDs, or public-facing tracking codes.
 */

// Initialize Hashids with the centralized system encryption key to ensure hashes cannot be reversed by attackers.
// Enforcing a minimum length of 6 characters for short, clean URLs.
const hashids = new HashidsUtil(config.encryptionKey || 'BaleAiBot-Fallback-Salt-2026', 6);

class HashidsUtil {
    /**
     * Encodes a MongoDB ObjectId (24-character hex string) into a short hashid.
     *
     * @param {string} hexId - The MongoDB ObjectId string.
     * @returns {string|null} The generated short hash string.
     */
    encodeId(hexId) {
        if (!hexId || typeof hexId !== 'string') return null;
        try {
            return hashids.encodeHex(hexId);
        } catch (error) {
            console.error('[HashidsUtil] Error encoding hex:', error.message);
            return null;
        }
    }

    /**
     * Decodes a short hashid back into the original MongoDB ObjectId hex string.
     *
     * @param {string} hash - The short hash string.
     * @returns {string|null} The original MongoDB ObjectId, or null if invalid.
     */
    decodeId(hash) {
        if (!hash || typeof hash !== 'string') return null;
        try {
            const decodedHex = hashids.decodeHex(hash);
            // Ensure the decoded result matches the exact length of a valid MongoDB ObjectId
            if (!decodedHex || decodedHex.length !== 24) return null;
            return decodedHex;
        } catch (error) {
            console.error('[HashidsUtil] Error decoding hash:', error.message);
            return null;
        }
    }
}

module.exports = new HashidsUtil();