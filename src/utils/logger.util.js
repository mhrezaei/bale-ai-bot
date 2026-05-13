// File Path: src/utils/logger.util.js

const winston = require('winston');
const path = require('path');

/**
 * Winston Logger Configuration
 * Adjusted for Docker environments to always output to the console
 * while maintaining standard log files.
 */

// Format for standard JSON log files
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Readable format for console output
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} [${level}]: ${stack || message}`;
    })
);

// Create the core logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'bale-ai-bot' },
    transports: [
        // Write all errors to error.log
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'error.log'),
            level: 'error'
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'combined.log')
        }),
        // CRITICAL: Always log to the console in both dev and production
        // so Docker logs can capture the stdout/stderr stream.
        new winston.transports.Console({
            format: consoleFormat
        })
    ],
    exitOnError: false
});

module.exports = logger;