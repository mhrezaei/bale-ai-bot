const mongoose = require('mongoose');
const dbConnect = require('./mongoose');
const { decodeId } = require('../utils/hashids.util');
const Client = require('../models/Client');
const TrafficLog = require('../models/TrafficLog');

/**
 * Service to fetch and format subscription details and traffic charts.
 */
const getSubscriptionProfile = async (hashId) => {
    try {
        const realId = decodeId(hashId);
        if (!realId) return null;

        await dbConnect();

        const client = await Client.findById(realId).lean();
        if (!client) return null;

        // Calculate the date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Extract timestamp mathematically from the ObjectId structure
        const thirtyDaysAgoObjectId = mongoose.Types.ObjectId.createFromTime(Math.floor(thirtyDaysAgo.getTime() / 1000));

        const trafficStats = await TrafficLog.aggregate([
            {
                $match: {
                    clientId: client._id,
                    _id: { $gte: thirtyDaysAgoObjectId }
                }
            },
            {
                $group: {
                    // Bulletproof Math-based 15-minute grouping!
                    // Converts ObjectId to exact Milliseconds, groups them, and returns a UNIX Timestamp.
                    _id: {
                        $subtract: [
                            { $toLong: { $toDate: "$_id" } },
                            { $mod: [ { $toLong: { $toDate: "$_id" } }, 1000 * 60 * 15 ] }
                        ]
                    },
                    totalDownload: { $sum: "$downDelta" },
                    totalUpload: { $sum: "$upDelta" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        return JSON.parse(JSON.stringify({
            profile: client,
            chartData: trafficStats
        }));

    } catch (error) {
        console.error('[Subscription] Error fetching profile:', error.message);
        return null;
    }
};

module.exports = { getSubscriptionProfile };