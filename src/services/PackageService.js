// File Path: src/services/PackageService.js

const Package = require('../models/Package');
const logger = require('../utils/logger.util');

/**
 * PackageService
 * Handles all business logic related to token packages.
 * Follows the Single Responsibility Principle by isolating package management
 * from payment processing.
 */
class PackageService {
    /**
     * Retrieves a list of packages.
     * @param {boolean} onlyActive - If true, returns only packages available for purchase.
     * @returns {Promise<Array>} List of package documents.
     */
    async getPackages(onlyActive = true) {
        try {
            const filter = onlyActive ? { isActive: true } : {};
            // Sorting by price ascending makes it easier for UI presentation
            return await Package.find(filter).sort({ priceIrt: 1 });
        } catch (error) {
            logger.error('[PackageService] Error fetching packages:', error);
            throw error;
        }
    }

    /**
     * Retrieves a specific package by its ID.
     * Crucial for validating the package details during the payment generation process.
     * Prevents client-side price manipulation.
     * @param {string} packageId - The MongoDB ObjectId of the package.
     * @returns {Promise<Object>} The package document.
     * @throws {Error} If the package does not exist.
     */
    async getPackageById(packageId) {
        try {
            const pkg = await Package.findById(packageId);
            if (!pkg) {
                throw new Error('Package not found.');
            }
            return pkg;
        } catch (error) {
            logger.error(`[PackageService] Error fetching package ${packageId}:`, error);
            throw error;
        }
    }

    /**
     * Creates a new package. Primarily used by the Admin Dashboard.
     * @param {Object} packageData - { title, priceIrt, tokenAmount, isActive }
     * @returns {Promise<Object>} The newly created package document.
     */
    async createPackage(packageData) {
        try {
            return await Package.create(packageData);
        } catch (error) {
            logger.error('[PackageService] Error creating package:', error);
            throw error;
        }
    }

    /**
     * Updates an existing package (e.g., price change or disabling).
     * @param {string} packageId - The MongoDB ObjectId.
     * @param {Object} updateData - Data to update.
     * @returns {Promise<Object>} The updated package document.
     */
    async updatePackage(packageId, updateData) {
        try {
            const updatedPkg = await Package.findByIdAndUpdate(packageId, updateData, { new: true });
            if (!updatedPkg) {
                throw new Error('Package not found for update.');
            }
            return updatedPkg;
        } catch (error) {
            logger.error(`[PackageService] Error updating package ${packageId}:`, error);
            throw error;
        }
    }

    /**
     * Deletes a package from the database.
     * Note: In financial systems, it is generally recommended to use "Soft Delete"
     * (setting isActive to false) to preserve historical integrity, but hard delete is provided here.
     * @param {string} packageId - The MongoDB ObjectId.
     * @returns {Promise<Object>} The deleted document.
     */
    async deletePackage(packageId) {
        try {
            return await Package.findByIdAndDelete(packageId);
        } catch (error) {
            logger.error(`[PackageService] Error deleting package ${packageId}:`, error);
            throw error;
        }
    }
}

module.exports = new PackageService();