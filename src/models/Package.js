// File Path: src/models/Package.js

const mongoose = require('mongoose');

/**
 * Package Schema
 * Defines the subscription or token packages available for users to purchase.
 * Allows dynamic pricing and package management directly from the database without altering code.
 */
const PackageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        description: 'The display name of the package (e.g., Basic, Pro, Ultra)'
    },
    priceIrt: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
        description: 'The price of the package in Iranian Toman (IRT)'
    },
    tokenAmount: {
        type: Number,
        required: true,
        min: [1, 'Token amount must be greater than 0'],
        description: 'The total number of AI tokens credited to the user upon purchase'
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true, // Indexed to quickly fetch only active packages for the UI
        description: 'Determines if the package is currently visible and available for purchase'
    }
}, {
    timestamps: true
});

/**
 * Static method to seed default packages into the database.
 * This should be called once during the database connection initialization.
 * It prevents the need for manual data entry when deploying to a new environment.
 */
PackageSchema.statics.seedDefaults = async function() {
    try {
        const count = await this.countDocuments();
        if (count === 0) {
            const defaultPackages = [
                { title: 'بسته پایه', priceIrt: 50000, tokenAmount: 100000 },
                { title: 'بسته استاندارد', priceIrt: 100000, tokenAmount: 250000 },
                { title: 'بسته حرفه‌ای', priceIrt: 200000, tokenAmount: 600000 }
            ];
            await this.insertMany(defaultPackages);
            console.log('[DB INITIALIZATION] Default sales packages seeded successfully.');
        }
    } catch (error) {
        console.error('[DB ERROR] Failed to seed default packages:', error.message);
    }
};

const Package = mongoose.model('Package', PackageSchema);

module.exports = Package;