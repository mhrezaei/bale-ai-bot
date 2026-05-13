// File Path: src/utils/crypto.util.js

const crypto = require('crypto');
const config = require('../config/env');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // Initialization Vector length is always 16 bytes for AES algorithms

/**
 * Crypto Utility
 * Provides robust AES-256-CBC encryption/decryption for sensitive data.
 * Ensures that if the database is compromised, sensitive credentials remain secure.
 */
class CryptoUtil {
    constructor() {
        if (!config.encryptionKey) {
            console.error('[FATAL] ENCRYPTION_KEY is missing in the environment variables.');
            process.exit(1);
        }

        // [BEST PRACTICE] Instead of strictly checking for a 32-byte string and crashing,
        // we use SHA-256 to hash the provided environment key.
        // This guarantees a consistent and secure 32-byte buffer regardless of the input string length.
        this.key = crypto.createHash('sha256').update(String(config.encryptionKey)).digest();
    }

    /**
     * Encrypts a plain text string.
     * @param {string} text - The plain text to encrypt.
     * @returns {string} The encrypted text in format: iv:encryptedData
     */
    encrypt(text) {
        if (!text) return text;

        try {
            const iv = crypto.randomBytes(IV_LENGTH);
            const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
            let encrypted = cipher.update(String(text), 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // Store both Initialization Vector (IV) and the encrypted data separated by a colon
            return `${iv.toString('hex')}:${encrypted}`;
        } catch (error) {
            console.error('[CryptoUtil] Encryption failed:', error.message);
            throw new Error('Encryption processing failed.');
        }
    }

    /**
     * Decrypts an encrypted string back to plain text.
     * @param {string} encryptedText - The encrypted string (format: iv:encryptedData).
     * @returns {string} The decrypted plain text.
     */
    decrypt(encryptedText) {
        // Return original text if it's empty, not a string, or lacks the custom separator format
        if (!encryptedText || typeof encryptedText !== 'string' || !encryptedText.includes(':')) {
            return encryptedText;
        }

        try {
            const textParts = encryptedText.split(':');
            const iv = Buffer.from(textParts.shift(), 'hex');
            const encryptedData = Buffer.from(textParts.join(':'), 'hex');

            const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('[CryptoUtil] Decryption failed:', error.message);
            throw new Error('Decryption processing failed. Invalid key or corrupted data.');
        }
    }
}

module.exports = new CryptoUtil();