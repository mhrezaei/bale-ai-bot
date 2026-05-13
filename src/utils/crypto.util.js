const crypto = require('crypto');
const config = require('../config/env'); // Bind to the centralized configuration system

// Load encryption key from environment configuration
const ENCRYPTION_KEY = config.encryptionKey;
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // IV length is always 16 bytes for AES algorithms

/**
 * Crypto Utility
 * Provides robust AES-256-CBC encryption/decryption for sensitive data (e.g., server passwords).
 * Ensures that if the database is compromised, the credentials remain secure.
 */
class CryptoUtil {
    constructor() {
        // Ensure the encryption key is exactly 32 bytes long
        if (!ENCRYPTION_KEY || Buffer.from(ENCRYPTION_KEY).length !== 32) {
            console.error('[FATAL] ENCRYPTION_KEY is missing or not exactly 32 bytes long in .env');
            process.exit(1);
        }
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
            const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // Store both IV and the encrypted data separated by a colon
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
        // Return original text if empty or lacks the custom separator format
        if (!encryptedText || !encryptedText.includes(':')) return encryptedText;

        try {
            const textParts = encryptedText.split(':');
            const iv = Buffer.from(textParts.shift(), 'hex');
            const encryptedData = Buffer.from(textParts.join(':'), 'hex');

            const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
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