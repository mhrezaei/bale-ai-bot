/**
 * Number & Currency Utility
 * Refactored for safe destructuring. No 'this' context required.
 * Handles digit conversions, byte calculations, and financial formatting.
 */

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

const toEnglishDigits = (input) => {
    if (input === null || input === undefined) return "";
    return input.toString()
        .replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d))
        .replace(/[٠-٩]/g, (d) => ARABIC_DIGITS.indexOf(d));
};

const toPersianDigits = (input) => {
    if (input === null || input === undefined) return "";
    return input.toString().replace(/[0-9]/g, (d) => PERSIAN_DIGITS[d]);
};

const gbToBytes = (gb) => {
    const cleanGb = parseFloat(toEnglishDigits(gb));
    if (isNaN(cleanGb)) return 0;
    return Math.floor(cleanGb * 1024 * 1024 * 1024);
};

const bytesToGB = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return 0;
    const gb = bytes / (1024 * 1024 * 1024);
    return parseFloat(gb.toFixed(decimals));
};

const formatBytes = (bytes, decimals = 1) => {
    if (bytes === 0 || !bytes) return toPersianDigits("0 B");
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
    return `${toPersianDigits(value)} ${sizes[i]}`;
};

const formatMoney = (amount) => {
    if (amount === null || amount === undefined) return '0';
    const cleanAmount = toEnglishDigits(amount);
    const parsed = parseFloat(cleanAmount);
    if (isNaN(parsed)) return '0';
    return parsed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseSafeInt = (val) => {
    const parsed = parseInt(toEnglishDigits(val), 10);
    return isNaN(parsed) ? 0 : parsed;
};

const parseSafeFloat = (val) => {
    const parsed = parseFloat(toEnglishDigits(val));
    return isNaN(parsed) ? 0 : parsed;
};

module.exports = {
    toEnglishDigits,
    toPersianDigits,
    gbToBytes,
    bytesToGB,
    formatBytes,
    formatMoney,
    parseSafeInt,
    parseSafeFloat
};