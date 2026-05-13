const QRCode = require('qrcode');

/**
 * QR Code Utility
 * Generates QR Codes in-memory as Buffers for Telegram transmission.
 * No files are saved to disk, ensuring fast and clean execution.
 */
class QrUtils {
    /**
     * Generates a QR code buffer from a text/link.
     * @param {string} text - The link to convert to QR
     * @returns {Promise<Buffer>} The image buffer ready for Telegram upload
     */
    async generateQRBuffer(text) {
        try {
            if (!text) {
                throw new Error('No text provided for QR generation.');
            }

            const buffer = await QRCode.toBuffer(text, {
                // Changed from 'H' to 'M':
                // VLESS links are very long. 'H' makes the matrix too dense and hard to scan.
                errorCorrectionLevel: 'M',
                margin: 2,
                width: 400,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });

            return buffer;
        } catch (error) {
            console.error('[QR Utility] Failed to generate QR Code:', error.message);
            throw error; // Re-throw so the controller can handle the error gracefully
        }
    }
}

module.exports = new QrUtils();