module.exports = {
    apps: [
        {
            name: 'vpn-bot-production',       // Process name in PM2 process list
            script: './src/index.js',           // Path to the main executable bot file
            instances: 1,                     // Telegram bots (Polling mode) MUST run as a single instance to prevent duplicate message processing
            exec_mode: 'fork',                // Execution mode (fork is required for 1 instance)
            autorestart: true,                // Automatically restart the application if it crashes
            watch: false,                     // Must be false in production to prevent unintended restarts on file changes
            max_memory_restart: '1G',         // Auto-restart if memory exceeds 1GB to prevent memory leak crashes

            // Production Environment Variables injection
            env_production: {
                NODE_ENV: 'production',
                DOTENV_CONFIG_PATH: '.env.production' // Instruct dotenv to load the specific production environment file
            },

            // Centralized Logging Configuration
            error_file: './logs/pm2-error.log',     // Path to error logs
            out_file: './logs/pm2-out.log',         // Path to standard output logs
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',// Standard timestamp format for logs
            merge_logs: true                        // Merge logs from different instances/restarts into the same file
        }
    ]
};