// File Path: src/controllers/user.controller.js

const { Markup } = require('telegraf');
const lang = require('../locales/fa');
const logger = require('../utils/logger.util');

/**
 * User Controller
 * Handles the main menu navigation, profile viewing, and basic user routing.
 */
class UserController {

    /**
     * Handles the /start command.
     * Displays the welcome message and the main persistent keyboard.
     */
    async showMainMenu(ctx) {
        try {
            const user = ctx.state.user;
            const name = user.firstName || 'کاربر';

            // Construct the persistent bottom keyboard
            const keyboard = Markup.keyboard([
                [lang.buttons.userMenu.chat],
                [lang.buttons.userMenu.profile, lang.buttons.userMenu.buy],
                [lang.buttons.userMenu.clearHistory, lang.buttons.userMenu.support]
            ]).resize(); // resize() ensures the keyboard fits nicely on mobile screens

            return ctx.reply(lang.welcome.user(name, user.creditBalance), keyboard).catch(() => {});
        } catch (error) {
            logger.error(`[UserController] Error showing main menu for ${ctx.from?.id}:`, error);
            return ctx.reply(lang.errors.general).catch(() => {});
        }
    }

    /**
     * Displays the user's profile statistics.
     */
    async showProfile(ctx) {
        try {
            const user = ctx.state.user;

            const profileData = {
                baleId: user.baleId,
                phone: user.phoneNumber,
                creditBalance: user.creditBalance,
                totalTokensUsed: user.totalTokensUsed,
                successfulRequests: user.successfulAiRequests // Matched with the User Schema
            };

            return ctx.reply(lang.profile.summary(profileData)).catch(() => {});
        } catch (error) {
            logger.error(`[UserController] Error showing profile for ${ctx.from?.id}:`, error);
            return ctx.reply(lang.errors.general).catch(() => {});
        }
    }

    /**
     * Displays support information.
     */
    async showSupport(ctx) {
        try {
            // This is a simple static message. If it grows, we can move it to fa.js
            const supportText = `📞 **پشتیبانی سیستم**\n\nدر صورت بروز هرگونه مشکل در پرداخت یا سوال درباره نحوه استفاده از دستیار هوشمند، لطفاً به آیدی زیر پیام دهید:\n\n💬 پشتیبانی: @Admin_ID`;
            return ctx.reply(supportText).catch(() => {});
        } catch (error) {
            logger.error(`[UserController] Error showing support for ${ctx.from?.id}:`, error);
        }
    }
}

module.exports = new UserController();