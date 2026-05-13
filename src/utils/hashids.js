const Hashids = require('hashids');

// Initialize Hashids with the system encryption key to ensure hashes cannot be reversed.
// Enforcing a minimum length of 6 characters for short, clean URLs.
const hashids = new Hashids(process.env.ENCRYPTION_KEY || 'Hedioum-Fallback-Salt', 6);

/**
 * Encodes a MongoDB ObjectId (24-character hex string) into a short hashid.
 *
 * @param {string} hexId - The MongoDB ObjectId string.
 * @returns {string|null} The generated short hash string.
 */
const encodeId = (hexId) => {
    if (!hexId) return null;
    try {
        return hashids.encodeHex(hexId);
    } catch (error) {
        console.error('[Hashids] Error encoding hex:', error.message);
        return null;
    }
};

/**
 * Decodes a short hashid back into the original MongoDB ObjectId hex string.
 *
 * @param {string} hash - The short hash string.
 * @returns {string|null} The original MongoDB ObjectId, or null if invalid.
 */
const decodeId = (hash) => {
    if (!hash) return null;
    try {
        const decodedHex = hashids.decodeHex(hash);
        // Ensure the decoded result matches the exact length of a valid MongoDB ObjectId
        if (!decodedHex || decodedHex.length !== 24) return null;
        return decodedHex;
    } catch (error) {
        console.error('[Hashids] Error decoding hash:', error.message);
        return null;
    }
};

module.exports = { encodeId, decodeId };