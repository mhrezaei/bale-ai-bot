const mongoose = require('mongoose');
const config = require('../config/env');

// --- SENIOR HMR FIX (MONKEY PATCHING) ---
// Since we share Mongoose models between the standard Node.js Bot and Next.js,
// we cannot modify the model files directly to add "mongoose.models.X || mongoose.model(...)".
// Instead, we safely intercept the model registration at the connection level.
if (!mongoose.isPatchedByHedioum) {
    const originalModel = mongoose.model.bind(mongoose);
    mongoose.model = function(name, schema, collection, skipInit) {
        // If the model is already compiled in the cache (due to Next.js HMR), return it safely.
        if (mongoose.models[name]) {
            return mongoose.models[name];
        }
        // Otherwise, compile it normally.
        return originalModel(name, schema, collection, skipInit);
    };
    mongoose.isPatchedByHedioum = true;
}
// ----------------------------------------

const MONGODB_URI = config.mongoUri;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGO_URI environment variable inside .env');
}

/**
 * Global cache to prevent connections growing exponentially
 * during Next.js API/Route compilation in development.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('[Next.js] 🟢 Connected to MongoDB');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

module.exports = dbConnect;