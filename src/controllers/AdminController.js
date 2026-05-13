const Server = require('../models/Server');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const reportService = require('../services/ReportService');
const financeService = require('../services/FinanceService');
const notifier = require('../utils/notifier.util');
const numberUtils = require('../utils/number.utils');
const dateUtils = require('../utils/date.utils');
const lang = require('../locales/fa');
const CONSTANTS = require('../config/constants');
const { Markup } = require('telegraf');

/**
 * AdminController - Master Admin Logic Engine.
 * Handles server management, reseller accounting, and financial audits.
 * Upgraded to support Subscription Caching metadata in the view layer.
 * Includes clean-up UI logic for Receipt Auditing flows.
 */
class AdminController {

    async showDashboard(ctx) {
        try {
            const { name } = ctx.state.user;

            const stats = {
                todaySalesGB: await reportService.getMonthlyRevenue(new Date().getFullYear(), new Date().getMonth() + 1, 'GB'),
                todayIncome: await reportService.getMonthlyRevenue(new Date().getFullYear(), new Date().getMonth() + 1, 'IRT'),
                resellerCount: await User.countDocuments({ role: CONSTANTS.ROLES.RESELLER, isActive: true }),
                activeServers: await Server.countDocuments({ status: CONSTANTS.SERVER_STATUS.ACTIVE })
            };

            const welcomeMessage = lang.welcome.admin(name, stats);
            const btns = lang.buttons.admin;

            // Restructured Dashboard based on Operational Priorities
            const keyboard = Markup.inlineKeyboard([
                // 1. Creation Priority
                [
                    Markup.button.callback(btns.createClient, 'admin_start_create'),
                    Markup.button.callback(btns.createTestBulk, 'admin_start_bulk_test')
                ],
                // 2. Client Management
                [Markup.button.callback(btns.listClients, 'admin_list_clients')],
                // 3. Financial & Accounting
                [
                    Markup.button.callback(btns.financeAdmin, 'admin_finance_hub'),
                    Markup.button.callback(btns.pendingReceipts, 'admin_pending_receipts')
                ],
                // 4. Reporting & Ops
                [
                    Markup.button.callback(btns.broadcast, 'admin_broadcast'),
                    Markup.button.callback(btns.systemHealth, 'admin_system_health')
                ],
                // 5. Infrastructure & Resellers (Lowest Priority for daily use)
                [
                    Markup.button.callback(btns.manageServers, 'admin_manage_servers'),
                    Markup.button.callback(btns.manageResellers, 'admin_manage_resellers')
                ]
            ]);

            if (ctx.state.isFreshDashboard || !ctx.callbackQuery) {
                return await ctx.reply(welcomeMessage, { parse_mode: 'Markdown', ...keyboard });
            }
            return await ctx.editMessageText(welcomeMessage, { parse_mode: 'Markdown', ...keyboard });
        } catch (error) {
            console.error('[AdminController] Dashboard Error:', error.message);
            return ctx.reply(lang.errors.general);
        }
    }

    // ==========================================
    // 🖥 Server Management Actions
    // ==========================================

    async listServers(ctx) {
        try {
            const servers = await Server.find().sort({ createdAt: -1 });
            let text = lang.serverManagement.listTitle;
            const buttons = [];

            if (servers.length === 0) {
                text += lang.serverManagement.emptyList;
            } else {
                text += lang.serverManagement.selectToManage;
                servers.forEach((srv) => {
                    const statusIcon = srv.status === 'ACTIVE' ? '🟢' : (srv.status === 'MAINTENANCE' ? '🟠' : '🔴');
                    buttons.push([Markup.button.callback(`${statusIcon} ${srv.name}`, `admin_manage_srv_${srv._id}`)]);
                });
            }

            buttons.push([Markup.button.callback(lang.buttons.serverActions.addServer, 'admin_add_server')]);
            buttons.push([Markup.button.callback(lang.buttons.navigation.back, 'admin_dashboard')]);

            if (ctx.state.isFreshDashboard || !ctx.callbackQuery) {
                await ctx.reply(text, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
            } else {
                await ctx.editMessageText(text, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
            }
        } catch (error) {
            console.error('[AdminController] listServers Error:', error);
            await ctx.answerCbQuery(lang.errors.general, { show_alert: true });
        }
    }

    async manageSingleServer(ctx, serverId) {
        try {
            const server = await Server.findById(serverId);
            if (!server) return ctx.answerCbQuery(lang.errors.general, { show_alert: true });

            const statusFa = server.status === 'ACTIVE' ? '🟢 فعال' : (server.status === 'MAINTENANCE' ? '🟠 در حال تعمیر' : '🔴 خاموش');
            const formattedPrice = numberUtils.toPersianDigits(numberUtils.formatMoney(server.pricePerGB));

            const serverData = {
                name: server.name,
                statusFa: statusFa,
                formattedPrice: formattedPrice,
                currency: server.currency,
                port: server.port,
                subBaseUrl: server.subBaseUrl || '',
                mainInbounds: server.mainInbounds || [],
                testInbounds: server.testInbounds || []
            };

            const text = lang.serverManagement.details(serverData);
            const toggleBtnText = server.status === 'ACTIVE' ? lang.buttons.serverActions.enterMaintenance : lang.buttons.serverActions.exitMaintenance;

            const buttons = [
                [Markup.button.callback(toggleBtnText, `admin_srv_toggle_${server._id}`)],
                [Markup.button.callback(lang.buttons.serverActions.editServer, `admin_srv_edit_${server._id}`)],
                [Markup.button.callback(lang.buttons.serverActions.deleteServer, `admin_srv_del_conf_${server._id}`)],
                [Markup.button.callback(lang.buttons.navigation.back, 'admin_manage_servers')]
            ];

            if (ctx.state.isFreshDashboard || !ctx.callbackQuery) {
                await ctx.reply(text, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
            } else {
                await ctx.editMessageText(text, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
            }
        } catch (error) {
            console.error('[AdminController] manageSingleServer Error:', error);
        }
    }

    async toggleServerStatus(ctx, serverId) {
        try {
            const server = await Server.findById(serverId);
            if (!server) return ctx.answerCbQuery(lang.errors.general, { show_alert: true });

            const newStatus = server.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
            server.status = newStatus;
            await server.save();

            await ctx.answerCbQuery('وضعیت سرور تغییر یافت.', { show_alert: false });
            return this.manageSingleServer(ctx, serverId);
        } catch (error) {
            console.error('[AdminController] toggleServer Error:', error);
            await ctx.answerCbQuery(lang.errors.general, { show_alert: true });
        }
    }

    async confirmDeleteServer(ctx, serverId) {
        try {
            const buttons = [
                [Markup.button.callback(lang.buttons.serverActions.confirmDelete, `admin_srv_del_do_${serverId}`)],
                [Markup.button.callback(lang.buttons.navigation.back, `admin_manage_srv_${serverId}`)]
            ];
            await ctx.editMessageText(lang.serverManagement.deleteWarning, {
                parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons)
            });
        } catch (error) {
            await ctx.answerCbQuery(lang.errors.general, { show_alert: true });
        }
    }

    async deleteServer(ctx, serverId) {
        try {
            await Server.findByIdAndDelete(serverId);
            await ctx.answerCbQuery(lang.serverManagement.deleteSuccess, { show_alert: true });
            return this.listServers(ctx);
        } catch (error) {
            console.error('[AdminController] deleteServer Error:', error);
            await ctx.answerCbQuery(lang.serverManagement.deleteError, { show_alert: true });
        }
    }

    // ============================================================================
    // 👥 RESELLER MANAGEMENT
    // ============================================================================

    async listResellers(ctx) {
        try {
            const resellers = await User.find({ role: CONSTANTS.ROLES.RESELLER }).sort({ createdAt: -1 });
            let text = lang.resellerManagement.listTitle;
            const buttons = [];

            if (resellers.length === 0) {
                text += lang.resellerManagement.emptyList;
            } else {
                text += lang.resellerManagement.selectToManage;
                resellers.forEach((res) => {
                    const statusIcon = res.isActive ? '🟢' : '🔴';
                    const ghostIcon = res.isGhost ? '👻 ' : '';
                    buttons.push([Markup.button.callback(`${statusIcon} ${ghostIcon}${res.name} (${res.resellerCode})`, `admin_manage_res_${res._id}`)]);
                });
            }

            buttons.push([Markup.button.callback(lang.buttons.resellerActions.addReseller, 'admin_add_reseller')]);
            buttons.push([Markup.button.callback(lang.buttons.navigation.back, 'admin_dashboard')]);

            if (ctx.state.isFreshDashboard || !ctx.callbackQuery) {
                await ctx.reply(text, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
            } else {
                await ctx.editMessageText(text, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
            }
        } catch (error) {
            console.error('[AdminController] listResellers Error:', error);
            await ctx.answerCbQuery(lang.errors.general, { show_alert: true }).catch(() => {});
        }
    }

    async manageSingleReseller(ctx, resellerId) {
        try {
            const reseller = await User.findById(resellerId);
            if (!reseller) return ctx.answerCbQuery(lang.errors.general, { show_alert: true });

            const getDebt = (currency) => {
                if (!reseller.debts) return 0;
                return reseller.debts.get ? (reseller.debts.get(currency) || 0) : (reseller.debts[currency] || 0);
            };

            const data = {
                name: reseller.name,
                resellerCode: reseller.resellerCode,
                isGhost: reseller.isGhost,
                statusFa: reseller.isActive ? '🟢 فعال' : '🔴 مسدود',
                totalQuota: reseller.totalQuotaGB || 0,
                debtIRT: getDebt('IRT'),
                debtEUR: getDebt('EUR'),
                tariffIRT: reseller.customTariffs?.IRT,
                tariffEUR: reseller.customTariffs?.EUR,
                testLimit: reseller.dailyTestLimit || 10
            };

            const message = lang.resellerManagement.details(data);
            const toggleBtnTxt = reseller.isActive ? lang.buttons.resellerActions.suspend : lang.buttons.resellerActions.activate;

            const keyboard = Markup.inlineKeyboard([
                [Markup.button.callback(lang.buttons.resellerActions.charge, `admin_charge_reseller_${reseller._id}`)],
                [Markup.button.callback(lang.buttons.resellerActions.txHistory, `admin_res_tx_${reseller._id}_1`)],
                [Markup.button.callback(lang.buttons.resellerActions.editReseller, `admin_res_edit_${reseller._id}`)],
                [Markup.button.callback(toggleBtnTxt, `admin_confirm_del_res_${reseller._id}`)],
                [Markup.button.callback(lang.buttons.navigation.back, 'admin_manage_resellers')]
            ]);

            if (ctx.state.isFreshDashboard || !ctx.callbackQuery) {
                await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
            } else {
                await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
            }
        } catch (error) {
            console.error('[AdminController] manageSingleReseller Error:', error);
            await ctx.reply(lang.errors.general);
        }
    }

    async confirmDeleteReseller(ctx, resellerId) {
        try {
            const user = await User.findById(resellerId);
            if (!user) return ctx.answerCbQuery(lang.errors.general, { show_alert: true });

            const warningText = user.isActive
                ? lang.resellerManagement.suspendWarning(user.name)
                : lang.resellerManagement.activateWarning(user.name);

            const buttons = [
                [Markup.button.callback(lang.buttons.resellerActions.confirmAction, `admin_final_del_res_${resellerId}`)],
                [Markup.button.callback(lang.buttons.navigation.back, `admin_manage_res_${resellerId}`)]
            ];

            await ctx.editMessageText(warningText, {
                parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons)
            });
        } catch (error) {
            await ctx.answerCbQuery(lang.errors.general, { show_alert: true });
        }
    }

    async handleDeleteReseller(ctx, resellerId) {
        try {
            const user = await User.findById(resellerId);
            if (!user) return ctx.answerCbQuery('نماینده یافت نشد', { show_alert: true });

            user.isActive = !user.isActive;
            await user.save();

            await ctx.answerCbQuery(lang.resellerManagement.statusChanged(user.isActive), { show_alert: true });

            return this.listResellers(ctx);
        } catch (error) {
            console.error('[AdminController] handleDeleteReseller Error:', error);
            await ctx.answerCbQuery(lang.errors.general, { show_alert: true }).catch(() => {});
        }
    }

    async showResellerTransactions(ctx, resellerId, page = 1) {
        try {
            const limit = 5;
            const skip = (page - 1) * limit;

            const [reseller, totalTxs, transactions] = await Promise.all([
                User.findById(resellerId),
                Transaction.countDocuments({ resellerId }),
                Transaction.find({ resellerId }).sort({ createdAt: -1 }).skip(skip).limit(limit)
            ]);

            if (!reseller) return ctx.answerCbQuery(lang.errors.general, { show_alert: true });

            const totalPages = Math.ceil(totalTxs / limit) || 1;
            let message = lang.resellerManagement.txHistoryTitle(reseller.name, page, totalPages);

            if (transactions.length === 0) {
                message += lang.resellerManagement.txEmpty;
            } else {
                transactions.forEach((tx) => {
                    const txData = {
                        typeFa: lang.resellerManagement.txTypesMap[tx.type] || tx.type,
                        amountFa: numberUtils.toPersianDigits(numberUtils.formatMoney(Math.abs(tx.amount))),
                        currency: tx.currency === 'IRT' ? 'تومان' : 'یورو',
                        dateFa: dateUtils.formatShamsi ? dateUtils.formatShamsi(tx.createdAt, 'jYYYY/jMM/jDD') : 'N/A',
                        timeFa: dateUtils.formatShamsi ? dateUtils.formatShamsi(tx.createdAt, 'HH:mm') : 'N/A',
                        desc: tx.description || 'ثبت سیستمی'
                    };
                    message += lang.resellerManagement.txItem(txData);
                });
            }

            const navButtons = [];
            if (page > 1) {
                navButtons.push(Markup.button.callback(lang.buttons.navigation.prevPage, `admin_res_tx_${resellerId}_${page - 1}`));
            }
            if (page < totalPages) {
                navButtons.push(Markup.button.callback(lang.buttons.navigation.nextPage, `admin_res_tx_${resellerId}_${page + 1}`));
            }

            const keyboard = Markup.inlineKeyboard([
                navButtons,
                [Markup.button.callback(lang.buttons.navigation.back, `admin_manage_res_${resellerId}`)]
            ]);

            await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });

        } catch (error) {
            console.error('[AdminController] showResellerTransactions Error:', error);
            await ctx.answerCbQuery(lang.errors.general, { show_alert: true });
        }
    }

    // ============================================================================
    // 💰 FINANCIAL MANAGEMENT
    // ============================================================================

    async showFinanceHub(ctx) {
        try {
            const resellers = await User.find({ role: CONSTANTS.ROLES.RESELLER });

            const topDebtors = resellers
                .map(r => ({ name: r.name, debtIRT: r.debts?.get ? (r.debts.get('IRT') || 0) : 0 }))
                .sort((a, b) => b.debtIRT - a.debtIRT)
                .slice(0, 30);

            let message = `💰 **داشبورد مالی کل**\n\n`;
            message += `🚨 **بدهکارترین نمایندگان:**\n`;

            topDebtors.forEach(res => {
                if (res.debtIRT > 0) {
                    message += `▪️ ${res.name}: \`${numberUtils.toPersianDigits(numberUtils.formatMoney(res.debtIRT))} تومان\`\n`;
                }
            });

            const keyboard = Markup.inlineKeyboard([
                [Markup.button.callback('📈 مشاهده نمودار فروش ۳۰ روزه', 'admin_finance_chart')],
                [Markup.button.callback('📜 کل تراکنش‌های سیستم', 'admin_global_tx_history')],
                [Markup.button.callback(lang.buttons.navigation.back, 'admin_dashboard')]
            ]);

            if (ctx.state.isFreshDashboard || !ctx.callbackQuery) {
                await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
            } else {
                await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
            }
        } catch (error) {
            await ctx.reply(lang.errors.general);
        }
    }

    // ============================================================================
    // 🧾 RECEIPT AUDIT (SEQUENTIAL FLOW)
    // ============================================================================

    async showPendingReceipts(ctx) {
        try {
            const pendingTx = await Transaction.findOne({
                type: 'SETTLEMENT',
                status: 'PENDING'
            }).sort({ createdAt: -1 }).populate('resellerId');

            if (!pendingTx) {
                // Cleanly reply if no more receipts, avoiding Telegram photo edit errors
                if (ctx.callbackQuery) await ctx.deleteMessage().catch(() => {});

                return ctx.reply("✅ **تمام فیش‌ها بررسی شده‌اند.**", {
                    parse_mode: 'Markdown',
                    ...Markup.inlineKeyboard([[Markup.button.callback(lang.buttons.navigation.back, 'admin_dashboard')]])
                });
            }

            const resellerName = pendingTx.resellerId?.name || 'Unknown';
            const amount = pendingTx.amount;
            const fileId = pendingTx.metadata?.receiptFileId;

            // Delete the trigger message (dashboard or previous notification) to keep chat clean
            if (ctx.callbackQuery) await ctx.deleteMessage().catch(() => {});

            await notifier.sendReceiptToAdmin(pendingTx._id, resellerName, amount, fileId);

        } catch (error) {
            console.error('[AdminController] Audit Flow Error:', error);
            await ctx.reply(lang.errors.general);
        }
    }

    async handleReceiptDecision(ctx, transactionId, isApproved) {
        try {
            const tx = await Transaction.findById(transactionId).populate('resellerId');
            if (!tx || tx.status !== 'PENDING') {
                await ctx.deleteMessage().catch(() => {});
                return ctx.answerCbQuery("تراکنش قبلاً پردازش شده است.", { show_alert: true });
            }

            if (isApproved) {
                await financeService.settleDebt(tx.resellerId._id, Math.abs(tx.amount), tx.currency, transactionId);

                // [FIX] Update transaction status to SUCCESS to prevent infinite loops
                tx.status = 'SUCCESS';
                await tx.save();

                await notifier.notifyReceiptResult(tx.resellerId.telegramId, true, Math.abs(tx.amount));
                await ctx.answerCbQuery("✅ فیش تایید و حساب شارژ شد.");
            } else {
                tx.status = 'FAILED';
                await tx.save();
                await notifier.notifyReceiptResult(tx.resellerId.telegramId, false, Math.abs(tx.amount));
                await ctx.answerCbQuery("❌ فیش رد شد.");
            }

            // Delete the processed receipt photo to prevent clutter and accidental double-clicks
            await ctx.deleteMessage().catch(() => {});

            // Auto-load the next pending receipt
            return this.showPendingReceipts(ctx);
        } catch (error) {
            await ctx.reply(lang.errors.general);
        }
    }

    // ============================================================================
    // 🔧 CLIENT CREATION FLOW WRAPPERS (FOR ADMIN)
    // ============================================================================

    async startCreateClient(ctx) {
        return ctx.scene.enter('CREATE_CLIENT_SCENE', { isTest: false });
    }

    async startBulkTest(ctx) {
        return ctx.scene.enter('CREATE_TEST_BULK_SCENE');
    }

    async showClientManagement(ctx) {
        const clientController = require('./ClientController');
        return clientController.showListMenu(ctx);
    }
}

module.exports = new AdminController();