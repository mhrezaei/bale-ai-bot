// File Path: src/utils/date.utils.js

const moment = require('jalali-moment');

/**
 * DateUtils
 * Centralized Date & Time Management for the AI Assistant.
 * Ensures the database stores pure UTC Date objects, while the application
 * always presents dates in the 'Asia/Tehran' timezone and Jalali (Shamsi) calendar.
 */
class DateUtils {
    /**
     * Converts standard English digits to Persian digits.
     * @param {string|number} str - The string containing English digits
     * @returns {string} The string with Persian digits
     */
    toPersianDigits(str) {
        if (str === null || str === undefined) return '';
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return str.toString().replace(/\d/g, x => persianDigits[x]);
    }

    /**
     * Formats a MongoDB UTC Date object or epoch timestamp to a Shamsi string.
     * Automatically handles the conversion to local Tehran time (due to server TZ).
     * @param {Date|number|string} date - The UTC Date object or timestamp
     * @param {string} format - Default format 'jYYYY/jMM/jDD HH:mm'
     * @param {boolean} usePersianDigits - If true, outputs in Persian typography
     * @returns {string} Formatted Jalali date string
     */
    formatShamsi(date, format = 'jYYYY/jMM/jDD HH:mm', usePersianDigits = true) {
        if (!date) return '';

        // Convert the input to a jalali-moment object and format it
        const formattedDate = moment(date).locale('fa').format(format);
        return usePersianDigits ? this.toPersianDigits(formattedDate) : formattedDate;
    }

    /**
     * Generates a "Time Ago" or "Time Left" string in Persian.
     * Useful for showing when a user last interacted or when their token package expires.
     * @param {Date|number} date - The target date
     * @returns {string} Human-readable relative time in Persian
     */
    timeAgoPersian(date) {
        if (!date) return '';
        return moment(date).locale('fa').fromNow();
    }

    /**
     * Calculates the exact UTC Date bounds (Start and End) for a specific Shamsi month.
     * Critical for MongoDB aggregation queries (e.g., fetching total AI usage for "Mordad").
     * @param {number|string} jYear - Jalali year (e.g., 1403)
     * @param {number|string} jMonth - Jalali month (e.g., 05)
     * @returns {Object} { start: Date, end: Date } - Pure UTC Date objects for DB queries
     */
    getShamsiMonthBounds(jYear, jMonth) {
        // Parse the first day of the Jalali month
        const startOfMonth = moment(`${jYear}/${jMonth}/01`, 'jYYYY/jMM/jDD');

        // Start of day in UTC
        const start = startOfMonth.startOf('day').toDate();
        // End of the Jalali month in UTC
        const end = startOfMonth.endOf('jMonth').toDate();

        return { start, end };
    }

    /**
     * Returns a pure UTC Date object exactly N days ago from now.
     * Essential for building time-series data charts in the Admin Dashboard.
     * @param {number} days - Number of days to subtract
     * @returns {Date} UTC Date object
     */
    getPastDate(days) {
        return moment().subtract(days, 'days').toDate();
    }

    /**
     * Returns a pure UTC Date object N days in the future.
     * Useful if you implement time-limited subscription packages in the future.
     * @param {number} days - Number of days to add
     * @returns {Date} UTC Date object
     */
    addDaysToNow(days) {
        if (!days) return new Date();
        return moment().add(days, 'days').toDate();
    }
}

module.exports = new DateUtils();