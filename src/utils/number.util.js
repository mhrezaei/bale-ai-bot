// File Path: src/utils/number.util.js

/**
 * Number & Currency Utility
 * Refactored specifically for the AI Assistant bot.
 * Handles digit conversions (Persian/Arabic to English) for safe user input parsing,
 * and formats numbers/currency for UI display.
 * Note: This utility is used for bot logic (e.g., payments, package selection)
 * and does NOT alter the actual text prompts sent to the OpenAI API.
 */

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/**
 * Converts Persian and Arabic digits in a string to standard English digits.
 * Essential for accurately parsing user inputs from custom keyboards (e.g., recharge amounts).
 * @param {string|number} input - The raw input from the user
 * @returns {string} The normalized string with English digits
 */
const toEnglishDigits = (input) => {
    if (input === null || input === undefined) return "";
    return input.toString()
        .replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d))
        .replace(/[٠-٩]/g, (d) => ARABIC_DIGITS.indexOf(d));
};

/**
 * Converts standard English digits to Persian digits for UI display.
 * @param {string|number} input - The number to convert
 * @returns {string} The string containing Persian digits
 */
const toPersianDigits = (input) => {
    if (input === null || input === undefined) return "";
    return input.toString().replace(/[0-9]/g, (d) => PERSIAN_DIGITS[d]);
};

/**
 * Formats a number by adding comma separators (e.g., 1000000 -> 1,000,000).
 * Generalized to work for both currency (Toman) and Token amounts.
 * @param {number|string} amount - The amount to format
 * @returns {string} The formatted string with commas
 */
const formatNumberWithCommas = (amount) => {
    if (amount === null || amount === undefined) return '0';
    const cleanAmount = toEnglishDigits(amount);
    const parsed = parseFloat(cleanAmount);
    if (isNaN(parsed)) return '0';
    return parsed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Safely parses an integer from user input, handling Persian/Arabic digits.
 * Returns 0 if the parsing fails, preventing NaN errors in DB or logic.
 * @param {string|number} val - The input value
 * @returns {number} The safely parsed integer
 */
const parseSafeInt = (val) => {
    const parsed = parseInt(toEnglishDigits(val), 10);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Safely parses a float from user input, handling Persian/Arabic digits.
 * Returns 0 if the parsing fails.
 * @param {string|number} val - The input value
 * @returns {number} The safely parsed float
 */
const parseSafeFloat = (val) => {
    const parsed = parseFloat(toEnglishDigits(val));
    return isNaN(parsed) ? 0 : parsed;
};

module.exports = {
    toEnglishDigits,
    toPersianDigits,
    formatNumberWithCommas,
    parseSafeInt,
    parseSafeFloat
};