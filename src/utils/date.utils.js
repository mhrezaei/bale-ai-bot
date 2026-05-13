const moment = require('moment-jalaali');

/**
 * DateUtils
 * Centralized Date & Time Management.
 * Wraps moment-jalaali to decouple external libraries from core business logic.
 */
class DateUtils {
    /**
     * Converts standard English digits to Persian digits.
     * @param {string|number} str
     * @returns {string} The string containing Persian digits
     */
    toPersianDigits(str) {
        if (str === null || str === undefined) return '';
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return str.toString().replace(/\d/g, x => persianDigits[x]);
    }

    /**
     * Formats a timestamp or Date object to Shamsi format.
     * Handles unlimited (0) and pending activation (< 0) timestamps used by X-UI.
     * @param {Date|number} timestamp - The Date object or epoch milliseconds
     * @param {string} format - Default is 'jYYYY/jMM/jDD HH:mm'
     * @param {boolean} usePersianDigits - If true, converts output digits to Persian
     * @returns {string} Formatted date string
     */
    formatShamsi(timestamp, format = 'jYYYY/jMM/jDD HH:mm', usePersianDigits = true) {
        // 0 means unlimited expiry in X-UI
        if (timestamp === 0) return 'نامحدود';

        // Negative timestamps represent "Start on Initial Use" before the first connection
        if (timestamp < 0) return 'در انتظار اتصال';

        const formattedDate = moment(timestamp).format(format);
        return usePersianDigits ? this.toPersianDigits(formattedDate) : formattedDate;
    }

    /**
     * Calculates the exact Gregorian Start and End Date objects for a specific Shamsi month.
     * Critical for MongoDB aggregation queries ($gte, $lte).
     * @param {number|string} jYear - e.g., 1403
     * @param {number|string} jMonth - e.g., 05
     * @returns {Object} { start: Date, end: Date }
     */
    getShamsiMonthBounds(jYear, jMonth) {
        const start = moment(`${jYear}/${jMonth}/01`, 'jYYYY/jMM/jDD').startOf('day').toDate();
        const end = moment(`${jYear}/${jMonth}/01`, 'jYYYY/jMM/jDD').endOf('jMonth').toDate();
        return { start, end };
    }

    /**
     * Returns a Date object exactly N days ago from the current moment.
     * Used for building time-series data charts.
     * @param {number} days
     * @returns {Date}
     */
    getPastDate(days) {
        return moment().subtract(days, 'days').toDate();
    }

    /**
     * Gets a formatted Shamsi date string for N days ago.
     * @param {number} daysAgo
     * @param {string} format
     * @returns {string}
     */
    getPastShamsiDateString(daysAgo, format = 'jYYYY-jMM-jDD') {
        return moment().subtract(daysAgo, 'days').format(format);
    }

    /**
     * Calculates a future epoch timestamp based on the number of days provided.
     * Useful for setting expiry times during client creation or extension.
     * @param {number} days - Number of days to add. Pass 0 for unlimited.
     * @returns {number} Epoch timestamp in milliseconds
     */
    addDaysToNow(days) {
        if (!days || days === 0) return 0; // Unlimited
        return Date.now() + (days * 24 * 60 * 60 * 1000);
    }
}

module.exports = new DateUtils();