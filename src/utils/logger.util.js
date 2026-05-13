// File Path: src/utils/logger.util.js

const winston = require('winston');
const path = require('path');

/**
 * Winston Logger Configuration
 * Provides enterprise-grade logging with different levels (error, warn, info, http, debug).
 * Logs are output to the console with colors for development,
 * and written to JSON files for production monitoring and debugging.
 */

// Define the standard JSON log formatting for files
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // Crucial: Include full stack trace for errors
    winston.format.splat(),
    winston.format.json()
);

// Define a custom, more readable format for console output (Development mode)
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} [${level}]: ${stack || message}`;
    })
);

// Create the core logger instance
const logger = winston.createLogger({
    // In production, only log 'info' and above. In development, log 'debug' and above.
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'bale-ai-bot' },
    transports: [
        // Write all logs with level 'error' and below to 'logs/error.log'
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'error.log'),
            level: 'error'
        }),
        // Write all logs with level 'info' and below to 'logs/combined.log'
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'combined.log')
        })
    ],
    // Prevent the application from crashing if the logger fails
    exitOnError: false
});

// If we are not in production, log to the console with the colorized format
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

module.exports = logger;