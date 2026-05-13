const numberUtils = require('../utils/number.utils');
const dateUtils = require('../utils/date.utils');

/**
 * Persian Locales & Message Templates
 * Single Source of Truth for all Bot Texts, UI elements, and Notifications.
 * Upgraded to support Async/Queue messaging and Rollback alerts.
 */

// --- Mapping Utils (100% Bulletproof Wrappers) ---
const formatBytes = (bytes) => numberUtils.formatBytes ? numberUtils.formatBytes(bytes) : (bytes + ' B');
const toPersianDigits = (str) => numberUtils.toPersianDigits ? numberUtils.toPersianDigits(str) : str;
const toJalali = (ts, format, usePersian) => dateUtils.formatShamsi ? dateUtils.formatShamsi(ts, format, usePersian) : ts;

module.exports = {
    // ==========================================
    // 🏠 DASHBOARDS & WELCOME
    // ==========================================
    welcome: {
        admin: (name, stats) =>
            `👑 **مدیریت کل سیستم (Master Admin)**\n\n` +
            `سلام \`${name}\` عزیز، به پنل مدیریت خوش آمدید.\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📊 فروش امروز: \`${toPersianDigits(stats.todaySalesGB)} GB\`\n` +
            `💰 درآمد امروز: \`${toPersianDigits(numberUtils.formatMoney(stats.todayIncome))} تومان\`\n` +
            `👥 تعداد نمایندگان: \`${toPersianDigits(stats.resellerCount)}\`\n` +
            `🖥 سرورهای فعال: \`${toPersianDigits(stats.activeServers)}\`\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `لطفاً از منوی زیر جهت مدیریت سیستم استفاده کنید.`,

        reseller: (name, finance) =>
            `💎 **پنل مدیریت خدمات (نماینده)**\n\n` +
            `سلام \`${name}\` عزیز، خوش آمدید.\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `💳 سهمیه کل: \`${toPersianDigits(finance.totalQuota)} GB\`\n` +
            `⏳ سهمیه باقیمانده: \`${toPersianDigits(finance.remainingQuota)} GB\`\n` +
            `🔴 بدهی ریالی: \`${toPersianDigits(numberUtils.formatMoney(finance.debtIRT))} تومان\`\n` +
            `🔴 بدهی ارزی: \`${toPersianDigits(finance.debtEUR)} یورو\`\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `جهت مدیریت سرویس‌های خود از منوی زیر استفاده نمایید.`
    },

    // ==========================================
    // 🚀 CLIENT CONFIGURATION & SUMMARY
    // ==========================================
    clientConfig: (data) => {
        const { email, totalGB, expiryTime, panelLink, subLink } = data;

        // totalGB is passed as bytes from ClientController
        let quota = 'نامحدود';
        if (totalGB > 0) {
            quota = toPersianDigits(formatBytes(totalGB));
        }

        // Handle Expiry gracefully (including relative times for newly created tests)
        let expiration = 'نامحدود';
        if (expiryTime > 0) {
            expiration = toJalali(expiryTime, 'jYYYY/jMM/jDD HH:mm', true);
        } else if (expiryTime < 0) {
            const days = Math.abs(expiryTime) / (1000 * 60 * 60 * 24);
            expiration = `${toPersianDigits(days)} روز (پس از اولین اتصال)`;
        }

        return (
            `🚀 **سرویس شما آماده شد!**\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `👤 **نام اکانت:** \`${email}\`\n` +
            `📊 **حجم کل:** \`${quota}\`\n` +
            `📅 **اعتبار:** \`${expiration}\`\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `📱 **دریافت اتصال و آموزش:**\n` +
            `برای دریافت لینک‌های اتصال و مشاهده وضعیت سرویس خود، لطفاً وارد پنل کاربری شوید:\n` +
            `*(برای باز کردن این لینک نیازی به فیلترشکن نیست)*\n` +
            `🔗 [ورود به پنل کاربری اختصاصی](${panelLink})\n\n` +
            `📋 کپی لینک پنل: \`${panelLink}\`\n\n` +
            `📑 **لینک اشتراک (Subscription):**\n` +
            `\`${subLink}\` \n\n` +
            `⚠️ *برای کپی کردن لینک‌ها، کافیست روی آن‌ها لمس کنید.*\n\n` +
            `📣 **[عضویت در کانال اطلاع‌رسانی](https://t.me/+ZLquStCHA7k2MDZk)**`
        );
    },

    clientSummary: (data) => {
        const { email, enable, up, down, total, expiryTime, reseller, isTest } = data;

        const totalUsed = (Number(up) || 0) + (Number(down) || 0);
        const usedGB = (totalUsed / (1024 ** 3)).toFixed(2);
        const limitBytes = Number(total) || 0;
        const limitGB = limitBytes > 0 ? (limitBytes / (1024 ** 3)).toFixed(2) + ' GB' : 'نامحدود';

        let timeStr = 'نامحدود';
        if (expiryTime > 0) {
            const now = Date.now();
            if (now > expiryTime) {
                timeStr = 'منقضی شده ❌';
            } else {
                const daysLeft = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
                timeStr = `${toPersianDigits(daysLeft)} روز باقی‌مانده`;
            }
        } else if (expiryTime < 0) {
            const daysLeft = Math.abs(expiryTime) / (1000 * 60 * 60 * 24);
            timeStr = `${toPersianDigits(daysLeft)} روز (پس از اولین اتصال)`;
        }

        return `👤 **مدیریت اکانت:** \`${email}\`\n` +
            `👥 نماینده: \`${reseller || 'نامشخص'}\` ${isTest ? '🧪 (تستی)' : ''}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🔌 وضعیت: ${enable ? '🟢 فعال' : '🔴 غیرفعال'}\n` +
            `📊 حجم کل: \`${toPersianDigits(limitGB)}\`\n` +
            `📉 مصرف شده: \`${toPersianDigits(usedGB)} GB\`\n` +
            `⏳ زمان اعتبار: \`${timeStr}\`\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `جهت اعمال تغییرات از دکمه‌های زیر استفاده کنید:`;
    },

    clientList: (page, totalPages, totalCount) =>
        `📄 **لیست کانفیگ‌ها**\n` +
        `تعداد کل: \`${toPersianDigits(totalCount)} عدد\`\n` +
        `صفحه ${toPersianDigits(page)} از ${toPersianDigits(totalPages)}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `جهت مدیریت روی کانفیگ مورد نظر کلیک کنید:`,

    // ==========================================
    // 🖥 SERVER MANAGEMENT & WIZARDS
    // ==========================================
    serverManagement: {
        listTitle: '🖥 **مدیریت سرورهای متصل**\n\n',
        emptyList: 'هیچ سروری در سیستم ثبت نشده است.',
        selectToManage: 'جهت مدیریت، روی سرور مورد نظر کلیک کنید:\n',
        details: (data) =>
            `🖥 **جزئیات سرور**\n\n` +
            `🏷 نام: \`${data.name}\`\n` +
            `🔌 وضعیت: ${data.statusFa}\n` +
            `💰 قیمت پایه: \`${data.formattedPrice} ${data.currency}\`\n` +
            `🌐 پورت اتصال: \`${toPersianDigits(data.port)}\`\n` +
            `🔗 آدرس پایه ساب: \`${data.subBaseUrl || 'ثبت نشده'}\`\n` +
            `🎯 اینباندهای اصلی: \`${toPersianDigits(data.mainInbounds.join('، ')) || 'ثبت نشده'}\`\n` +
            `🧪 اینباندهای تست: \`${toPersianDigits(data.testInbounds.join('، ')) || 'ثبت نشده'}\`\n\n` +
            `جهت اعمال تغییرات از منوی زیر استفاده کنید:`,
        deleteWarning: '⚠️ **هشدار امنیتی**\n\nآیا از حذف کامل این سرور از سیستم اطمینان دارید؟\n*(این عمل غیرقابل بازگشت است)*',
        deleteSuccess: '✅ سرور با موفقیت حذف شد.',
        deleteError: '❌ خطا در حذف سرور.'
    },

    serverWizard: {
        enterName: `🖥 **گام اول: نام سرور**\n\nیک نام برای این سرور انتخاب کنید (مثلاً: \`🇩🇪 آلمان - Hetzner\`):`,
        enterUrl: `🌐 **گام دوم: آدرس پنل**\n\nآدرس دقیق پنل را بفرستید.\n*(اگر پنل شما Path اختصاصی دارد حتماً وارد کنید)*\n\nمثال:\n\`https://ai.domain.com:2053/mypath/\``,
        enterUsername: `👤 **گام سوم: نام کاربری**\n\nنام کاربری (Username) پنل X-UI را وارد کنید:`,
        enterPassword: `🔑 **گام چهارم: رمز عبور**\n\nرمز عبور (Password) پنل را وارد کنید:`,
        enterCurrency: `💵 **گام پنجم: واحد پولی**\n\nواحد پولی این سرور را انتخاب کنید:`,
        enterPrice: (currency) => `💰 **گام ششم: قیمت پایه**\n\nقیمت پایه هر گیگابایت روی این سرور را (به ${currency}) وارد کنید:`,
        enterMainInbounds: `🎯 **گام هفتم: شناسه اینباندهای اصلی**\n\nشماره (ID) اینباندهایی که برای ساخت کانفیگ‌های اصلی استفاده می‌شوند را وارد کنید.\n*(اگر چند مورد است، با کاما جدا کنید. مثال: \`1, 3, 5\`)*`,
        enterTestInbounds: `🧪 **گام هشتم: شناسه اینباندهای تست**\n\nشماره (ID) اینباندهایی که برای ساخت کانفیگ‌های تست (رایگان) استفاده می‌شوند را وارد کنید.\n*(مثال: \`2, 4\`)*`,
        enterSubUrl: `🔗 **گام نهم: آدرس پایه‌ی سابسکریپشن**\n\n` +
            `آدرس پایه (Base URL) سابسکریپشن این سرور را وارد کنید. این آدرس برای تولید و ذخیره (کش) سریع لینک‌های اشتراک در دیتابیس استفاده می‌شود.\n\n` +
            `*(توجه: حتماً با http یا https شروع شود و در صورت داشتن پورت، آن را ذکر کنید. مثال: \`https://customer.solarfund.ir:33121/subscription/\`)*\n\n` +
            `اگر تمایل دارید این فیلد خالی بماند، از دکمه‌ی "رد شدن" استفاده کنید.`,
        testing: `🔄 در حال تست اتصال به سرور و اعتبارسنجی لاگین...`,
        testFailed: (status, url) => `❌ **خطا در اتصال به پنل!**\nآدرس، یوزرنیم یا پسورد اشتباه است.\n\nکد خطا: \`${status}\`\nتارگت تست: \`${url}\``,
        testTimeout: (url) => `❌ **اتصال با تایم‌اوت مواجه شد (Timeout).**\nسرور خاموش است، پورت بسته است یا پشت فایروال قرار دارد.\n\nتارگت تست: \`${url}\``,
        review: (data) =>
            `✅ **ارتباط با سرور با موفقیت برقرار شد.**\n\n` +
            `🧐 **تایید اطلاعات نهایی:**\n` +
            `🖥 نام: \`${data.name}\`\n` +
            `🌐 آدرس: \`${data.host}\`\n` +
            `👤 کاربری: \`${data.username}\`\n` +
            `🔗 آدرس ساب: \`${data.subBaseUrl || 'ندارد'}\`\n` +
            `💰 قیمت پایه: \`${data.formattedPrice} ${data.currency}\`\n` +
            `🎯 اینباندهای اصلی: \`${toPersianDigits(data.mainInbounds.join('، ')) || 'ندارد'}\`\n` +
            `🧪 اینباندهای تست: \`${toPersianDigits(data.testInbounds.join('، ')) || 'ندارد'}\`\n\n` +
            `آیا اطلاعات فوق جهت ذخیره در سیستم تایید است؟`,
        success: (name) => `🎉 سرور **"${name}"** با موفقیت اضافه و به مدار متصل شد.`
    },

    // ==========================================
    // 👥 RESELLER MANAGEMENT & WIZARDS
    // ==========================================
    resellerManagement: {
        listTitle: '👥 **مدیریت نمایندگان**\n\n',
        emptyList: 'هیچ نماینده‌ای در سیستم ثبت نشده است.',
        selectToManage: 'جهت مدیریت، روی نماینده مورد نظر کلیک کنید:\n',
        details: (data) =>
            `👥 **مدیریت نماینده:** \`${data.name}\`\n` +
            `🆔 کد پیشوند: \`${data.resellerCode}\`\n` +
            `نوع اکانت: ${data.isGhost ? '👻 ارواح (سفارشی)' : '👤 کاربری تلگرام'}\n` +
            `وضعیت: ${data.statusFa}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `⏳ سقف اعتبار: \`${toPersianDigits(data.totalQuota)} GB\`\n` +
            `🔴 بدهی ریالی: \`${toPersianDigits(numberUtils.formatMoney(data.debtIRT))} تومان\`\n` +
            `🔴 بدهی ارزی: \`${toPersianDigits(numberUtils.formatMoney(data.debtEUR))} یورو\`\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `💵 تعرفه اختصاصی تومان: \`${data.tariffIRT ? toPersianDigits(numberUtils.formatMoney(data.tariffIRT)) : 'پیش‌فرض سرور'}\`\n` +
            `💶 تعرفه اختصاصی یورو: \`${data.tariffEUR ? toPersianDigits(numberUtils.formatMoney(data.tariffEUR)) : 'پیش‌فرض سرور'}\`\n` +
            `🧪 محدودیت اکانت تست (روزانه): \`${toPersianDigits(data.testLimit)}\` عدد\n\n` +
            `جهت اعمال تغییرات از منوی زیر استفاده کنید:`,
        suspendWarning: (name) => `⚠️ **هشدار سیستم**\n\nآیا از مسدودسازی نماینده \`${name}\` اطمینان دارید؟`,
        activateWarning: (name) => `⚠️ **هشدار سیستم**\n\nآیا از فعال‌سازی مجدد نماینده \`${name}\` اطمینان دارید؟`,
        statusChanged: (isActive) => isActive ? '✅ نماینده با موفقیت فعال شد.' : '🚫 نماینده مسدود شد.',

        txHistoryTitle: (name, page, totalPages) => `📚 **سوابق تراکنش‌های:** \`${name}\`\n📄 صفحه ${toPersianDigits(page)} از ${toPersianDigits(totalPages)}\n━━━━━━━━━━━━━━━━━━━━\n`,
        txEmpty: 'هیچ تراکنشی برای این نماینده ثبت نشده است.',
        txItem: (tx) => `🔹 **نوع:** ${tx.typeFa}\n💰 **مبلغ:** \`${tx.amountFa} ${tx.currency}\`\n📅 **تاریخ:** \`${tx.dateFa}\` - ⏰ \`${tx.timeFa}\`\n📝 **توضیحات:** ${tx.desc}\n━━━━━━━━━━━━━━━━━━━━\n`,
        txTypesMap: {
            BUY: 'خرید کانفیگ/ترافیک 🛒',
            RENEW: 'تمدید سرویس 🔄',
            ADD_VOLUME: 'افزایش حجم 📊',
            REFUND: 'بازگشت وجه (مرجوعی) 🔙',
            SETTLEMENT: 'تسویه حساب / شارژ 💳',
            ADJUSTMENT: 'اصلاحیه دستی ⚙️'
        }
    },

    resellerWizard: {
        pickType: `👥 **گام اول: نوع نماینده**\n\nلطفاً نوع کاربری را مشخص کنید:\n\n👤 **کاربر تلگرامی:** شخصاً از طریق ربات کانفیگ می‌سازد.\n👻 **نماینده ارواح:** اکانت تلگرام ندارد و شما (ادمین) به نام او کانفیگ صادر می‌کنید.`,
        enterId: `🆔 **گام دوم: شناسه تلگرامی**\n\nلطفاً Telegram ID (آیدی عددی) نماینده را وارد کنید:`,
        enterName: `👤 **گام سوم: نام نمایشی**\n\nیک نام نمایشی برای این نماینده وارد کنید (مثلاً: \`فروشگاه علی\`):`,
        enterCode: `🔑 **گام چهارم: کد پیشوند**\n\nیک کد ۲ تا ۸ حرفی (انگلیسی) برای پیشوند کانفیگ‌های این نماینده انتخاب کنید (مثلاً: \`ALI\`):`,
        enterQuota: (current) => `📊 **گام پنجم: سقف اعتبار (GB)**\n\nمقدار اعتباری که این نماینده مجاز به فروش است را به گیگابایت وارد کنید.\n${current ? `اعتبار فعلی: \`${toPersianDigits(current)} GB\`\n` : ''}`,
        enterTariffIRT: (current) => `💵 **گام ششم: تعرفه اختصاصی (تومان)**\n\nاگر این نماینده قیمت متفاوتی برای سرورهای تومانی دارد، قیمت هر گیگ را وارد کنید.\n*(جهت استفاده از قیمت پیش‌فرض سرورها، عدد \`0\` را بفرستید)*\n${current ? `تعرفه فعلی: \`${toPersianDigits(numberUtils.formatMoney(current))}\`\n` : ''}`,
        enterTariffEUR: (current) => `💶 **گام هفتم: تعرفه اختصاصی (یورو)**\n\nقیمت اختصاصی برای هر گیگ در سرورهای یورویی را وارد کنید.\n*(جهت استفاده از قیمت پیش‌فرض سرورها، عدد \`0\` را بفرستید)*\n${current ? `تعرفه فعلی: \`${toPersianDigits(numberUtils.formatMoney(current))}\`\n` : ''}`,
        enterTestLimit: (current) => `🧪 **گام هشتم: محدودیت تست روزانه**\n\nحداکثر تعداد اکانت تستی که این نماینده می‌تواند در یک روز صادر کند را وارد کنید:\n${current ? `محدودیت فعلی: \`${toPersianDigits(current)}\`\n` : ''}`,
        saving: `🔄 در حال پردازش و ثبت اطلاعات نماینده...`,
        review: (data) =>
            `🧐 **تایید نهایی اطلاعات نماینده:**\n\n` +
            `👤 نام: \`${data.name}\`\n` +
            `نوع: ${data.isGhost ? '👻 ارواح (بدون تلگرام)' : '👤 کاربر تلگرامی'}\n` +
            `🆔 آیدی تلگرام: \`${data.telegramId || 'ندارد'}\`\n` +
            `🔑 کد پیشوند: \`${data.resellerCode}\`\n` +
            `📊 سقف اعتبار: \`${toPersianDigits(data.quota)} GB\`\n` +
            `💵 تعرفه تومان: \`${data.tariffIRT ? toPersianDigits(numberUtils.formatMoney(data.tariffIRT)) : 'پیش‌فرض سرور'}\`\n` +
            `💶 تعرفه یورو: \`${data.tariffEUR ? toPersianDigits(numberUtils.formatMoney(data.tariffEUR)) : 'پیش‌فرض سرور'}\`\n` +
            `🧪 تست روزانه: \`${toPersianDigits(data.testLimit)}\` عدد\n\n` +
            `آیا اطلاعات تایید است؟`,
        success: (name) => `🎉 نماینده **"${name}"** با موفقیت در سیستم ثبت و فعال شد.`
    },

    // ==========================================
    // 💳 FINANCE & ACCOUNTING
    // ==========================================
    finance: {
        adminDashboard: `💰 **پنل جامع مالی مدیریت**\n\nاز این بخش می‌توانید گزارشات کلان مالی سیستم را مشاهده کرده و پرداختی‌های نمایندگان را تایید یا رد کنید.`,
        resellerDashboard: `💳 **حسابداری و امور مالی**\n\nشما می‌توانید صورت‌حساب‌های تسویه‌نشده خود را مشاهده کرده و با ارسال فیش واریزی، حساب خود را شارژ کنید.`,
        sendReceipt: `🧾 **ثبت فیش واریزی**\n\nلطفاً عکس واضح فیش واریزی خود را ارسال کنید.\n*(همچنین در کپشن عکس، مبلغ دقیق واریزی به تومان را بنویسید)*`,
        receiptSubmitted: `✅ **فیش شما با موفقیت ثبت شد!**\nپس از بررسی و تایید ادمین، مبلغ به کیف پول شما اضافه خواهد شد.`,
        adminReceiptAlert: (resellerName, amount) => `🔔 **درخواست شارژ جدید**\n\nنماینده: \`${resellerName}\`\nمبلغ اعلامی: \`${toPersianDigits(amount)} تومان\`\n\nآیا این تراکنش را تایید می‌کنید؟`,
        receiptApproved: (amount) => `🎉 **تایید فیش واریزی**\nمبلغ \`${toPersianDigits(numberUtils.formatMoney(amount))} تومان\` به حساب کاربری شما افزوده شد.`,
        receiptRejected: `❌ **رد فیش واریزی**\nفیش واریزی اخیر شما توسط مدیریت تایید نشد. در صورت نیاز به پشتیبانی پیام دهید.`
    },

    // ==========================================
    // 📊 REPORTS & ANALYTICS
    // ==========================================
    reports: {
        menuTitle: `📊 **گزارش عملکرد روزانه**\n\nلطفاً روز مورد نظر را جهت دریافت ریز تراکنش‌ها انتخاب کنید:`,
        dailyTitle: (dateName, dateStr) => `📅 **گزارش فعالیت:** \`${dateName}\` (${toPersianDigits(dateStr)})\n━━━━━━━━━━━━━━━━━━━━\n`,

        // Formats a single transaction line dynamically (Shortened for 1-line display)
        txItem: (index, typeFa, target, volume, amountStr, currency) => {
            const volStr = volume ? ` | \`${toPersianDigits(volume)}GB\`` : '';
            const targetStr = target ? `\`${target}\`` : 'کیف پول';
            const formattedAmount = numberUtils.formatMoney ? numberUtils.formatMoney(amountStr) : amountStr;
            return `\`${toPersianDigits(index)}-\` **${typeFa}** | ${targetStr}${volStr} | \`${toPersianDigits(formattedAmount)}\`\n`;
        },

        // Enhanced Footer with Financial Balance (IRT & EUR)
        footer: (total, limit, sumIRT, sumEUR) => {
            let text = `\n━━━━━━━━━━━━━━━━━━━━\n`;
            text += `📊 تعداد کل: \`${toPersianDigits(total)} مورد\``;
            if (total > limit) {
                text += ` *(نمایش ${toPersianDigits(limit)} مورد اخیر)*`;
            }

            // IRT Balance
            const irtVal = Math.abs(sumIRT);
            const irtSign = sumIRT > 0 ? '(🔴 کسر شده)' : (sumIRT < 0 ? '(🟢 اضافه شده)' : '(⚪️ بدون تغییر)');
            text += `\n💰 تراز (تومان): \`${toPersianDigits(numberUtils.formatMoney(irtVal))} تومان\` ${irtSign}`;

            // EUR Balance (only show if there's activity in EUR)
            if (sumEUR !== 0) {
                const eurVal = Math.abs(sumEUR);
                const eurSign = sumEUR > 0 ? '(🔴 کسر شده)' : (sumEUR < 0 ? '(🟢 اضافه شده)' : '(⚪️ بدون تغییر)');
                text += `\n💶 تراز (یورو): \`${toPersianDigits(numberUtils.formatMoney(eurVal))} یورو\` ${eurSign}`;
            }

            return text;
        },

        empty: `موردی برای نمایش در این روز وجود ندارد.`,

        // Concise mapping specifically for the daily 1-line report
        types: {
            BUY: 'خرید',
            RENEW: 'تمدید',
            ADD_VOLUME: 'افزایش',
            REFUND: 'حذف',
            SETTLEMENT: 'شارژ',
            ADJUSTMENT: 'اصلاحیه'
        }
    },

    // ==========================================
    // 📢 BROADCAST SYSTEM [NEW]
    // ==========================================
    broadcast: {
        wizardStart: `📢 **ارسال پیام همگانی**\n\nلطفاً متن اطلاعیه خود را تایپ کرده و ارسال کنید.\n*(همچنین می‌توانید یک تصویر را همراه با کپشن ارسال نمایید. دقت کنید که فقط متن یا یک تک عکس پشتیبانی می‌شود)*\n\nجهت انصراف از دکمه زیر استفاده کنید.`,
        preview: `🧐 **پیش‌نمایش اطلاعیه:**\n\nآیا از ثبت این پیام همگانی برای تمام نمایندگان (ارسال اجباری) اطمینان دارید؟`,
        sending: `⏳ در حال پردازش و ثبت اطلاعیه در سیستم...`,
        success: (count) => `🎉 اطلاعیه با موفقیت در سیستم ثبت شد و برای \`${toPersianDigits(count)}\` نماینده در صف مشاهده اجباری قرار گرفت.`,
        noResellers: `❌ هیچ نماینده فعالی در سیستم یافت نشد.`,
        mandatoryTitle: `📢 **اطلاعیه مدیریت (نیازمند تایید)**\n━━━━━━━━━━━━━━━━━━━━\n\n`,
        acknowledged: (dateStr, timeStr) => `✅ خوانده شده در تاریخ \`${toPersianDigits(dateStr)}\` - ساعت \`${toPersianDigits(timeStr)}\`\n━━━━━━━━━━━━━━━━━━━━`
    },

    // ==========================================
    // 🛠 CLIENT WIZARDS (CREATION & EDIT)
    // ==========================================
    createClient: {
        pickServer: `🌍 **گام اول: انتخاب موقعیت**\n\nلطفاً سرور مورد نظر خود را انتخاب کنید:`,
        pickOwner: `👤 **گام دوم: انتخاب مالک**\n\nاین کانفیگ از حساب و اعتبار کدام نماینده (یا خودتان) کسر و ثبت شود؟`,
        enterName: `👤 **گام سوم: نام اکانت**\n\nیک نام انگلیسی معتبر برای کاربر وارد کنید:`,
        pickVolume: `📊 **گام چهارم: انتخاب حجم**\n\nترافیک مورد نیاز را انتخاب کرده یا مقدار دلخواه را (به گیگابایت) وارد کنید:`,
        pickTime: `⏳ **گام پنجم: مدت اعتبار**\n\nمدت زمان سرویس را مشخص کنید:`,
        review: (data) =>
            `🧐 **بازبینی نهایی سفارش**\n\n` +
            `🌍 سرور: \`${data.serverName}\` \n` +
            `👤 نام: \`${data.email}\` \n` +
            `📊 حجم: \`${toPersianDigits(data.volume)} GB\` \n` +
            `⏳ اعتبار: \`${data.days === 0 ? 'نامحدود' : toPersianDigits(data.days) + ' روز'}\` \n\n` +
            `آیا از ساخت این کانفیگ اطمینان دارید؟`,
        creating: `⏳ **درخواست شما در صف پردازش قرار گرفت.**\n\nعملیات ساخت روی سرور در حال انجام است. تا لحظاتی دیگر، پیام حاوی لینک‌های اتصال به صورت خودکار برای شما ارسال خواهد شد.`
    },

    createTestBulk: {
        pickServer: `🖥 **گام اول: انتخاب سرور**\n\nلطفاً سرور مورد نظر برای اکانت‌های تست را انتخاب کنید:`,
        pickOwner: `👤 **گام دوم: انتخاب مالک**\n\nاین اکانت‌های تست از سهمیه روزانه کدام نماینده (یا خودتان) ثبت شود؟`,
        enterCount: `🔢 **گام سوم: تعداد اکانت**\n\nچند عدد اکانت تست نیاز دارید؟ (نهایت ۱۰ عدد)`,
        enterVolume: `📊 **گام چهارم: حجم اکانت (GB)**\n\nحجم هر اکانت چقدر باشد؟ (مثلاً \`0.5\` یا \`1\`)`,
        review: (data) =>
            `🧐 **پیش‌نمایش ساخت تست گروهی**\n\n` +
            `👤 مالک: \`${data.ownerName}\`\n` +
            `🔢 تعداد: \`${toPersianDigits(data.count)} عدد\`\n` +
            `📊 حجم هر کدام: \`${toPersianDigits(data.volume)} GB\`\n` +
            `⏳ اعتبار: \`۴۸ ساعت\` *(شروع پس از اولین اتصال)*\n\n` +
            `آیا از ساخت اطمینان دارید؟`,
        creating: `⏳ **درخواست تست گروهی در صف پردازش قرار گرفت.**\n\nعملیات ساخت روی سرور آغاز شده است. لطفاً منتظر دریافت پیام تایید نهایی باشید.`,
        success: (count) => `✅ عملیات با موفقیت پایان یافت. (${toPersianDigits(count)} اکانت ساخته شد)`,
        fail: `❌ متاسفانه هیچکدام از اکانت‌ها ساخته نشدند. لطفاً وضعیت سرور را بررسی کنید.`,
        limitReached: (used, limit, requested) => `❌ **محدودیت روزانه:**\nشما امروز ${toPersianDigits(used)} اکانت تست ساخته‌اید. سقف مجاز شما ${toPersianDigits(limit)} اکانت در روز است. امکان ساخت ${toPersianDigits(requested)} اکانت جدید وجود ندارد.`
    },

    editClient: {
        start: (email) => `📝 **مدیریت کلاینت:** \`${email}\` \n\nجهت تغییرات، از دکمه‌های زیر استفاده کنید:`,
        enterVolume: (current) =>
            `📊 **تغییر حجم سرویس**\n\n` +
            `حجم فعلی اکانت: \`${toPersianDigits(current)} GB\`\n\n` +
            `🔹 **برای افزایش حجم:** مقدار دلخواه را وارد کنید (مثلاً \`5\` برای 5 گیگ افزایش)\n` +
            `🔸 **برای کاهش حجم:** عدد منفی وارد کنید (مثلاً \`-2\` برای 2 گیگ کاهش)\n\n` +
            `لطفاً عدد مورد نظر را ارسال کنید:`,
        enterDays: () => `⏳ **تمدید زمان**\n\nلطفاً تعداد روزهایی که می‌خواهید به اعتبار کاربر اضافه شود را وارد کنید:`,
        queued: `⏳ در حال ثبت تغییرات در صف پردازش...`
    },

    deleteClient: {
        confirmFullRefund: (email, quota) =>
            `⚠️ **تایید حذف کانفیگ**\n\n` +
            `کانفیگ \`${email}\` مصرفی کمتر از ۲۰۰ مگابایت (حجم تست) داشته است. با حذف این کانفیگ، کل ترافیک اولیه (\`${toPersianDigits(quota)} GB\`) و مبلغ کسر شده، به کیف پول شما باز خواهد گشت.\n\n` +
            `آیا از حذف کامل این کانفیگ اطمینان دارید؟`,

        confirmPartialRefund: (email, consumed, remaining, amount, currency) =>
            `⚠️ **تایید حذف با کسر مصرف**\n\n` +
            `کانفیگ \`${email}\` تا این لحظه \`${toPersianDigits(consumed)} GB\` مصرف داشته است.\n` +
            `در صورت حذف، مقدار \`${toPersianDigits(remaining)} GB\` ترافیک باقیمانده (معادل \`${toPersianDigits(numberUtils.formatMoney(amount))} ${currency === 'IRT' ? 'تومان' : 'یورو'}\`) به کیف پول شما باز می‌گردد.\n\n` +
            `آیا از حذف این کانفیگ اطمینان دارید؟`,

        deleting: `⏳ در حال حذف کانفیگ و بازگشت وجه...`
    },

    // ==========================================
    // 📝 ADMIN SYSTEM LOGS
    // ==========================================
    adminLogs: {
        clientAction: (action, by, email, details) =>
            `📝 **گزارش سیستم:** ${action}\n\n` +
            `👤 توسط: \`${by}\`\n` +
            `👤 اکانت: \`${email}\`\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `${details}`,

        financeAction: (action, by, amountText) =>
            `💳 **گزارش مالی:** ${action}\n\n` +
            `👤 توسط نماینده: \`${by}\`\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `💰 مبلغ: \`${toPersianDigits(amountText)}\`\n` +
            `⏳ منتظر بررسی در بخش فیش‌ها.`
    },

    // ==========================================
    // ⚠️ ERRORS & VALIDATIONS
    // ==========================================
    errors: {
        general: `❌ متاسفانه پردازش درخواست شما با مشکل مواجه شد. لطفاً مجدداً تلاش کنید.`,
        serverTimeout: `⚠️ سرور مقصد در حال حاضر پاسخگو نیست. لطفاً دقایقی دیگر مجدداً تلاش کنید.`,
        insufficientQuota: `🚫 **موجودی ناکافی!**\nسهمیه/اعتبار شما برای انجام این عملیات کافی نیست. لطفاً نسبت به تسویه حساب اقدام نمایید.`,
        duplicateName: `❌ این نام قبلاً در سیستم ثبت شده است. لطفاً نام دیگری انتخاب کنید.`,
        deleteDeniedRule: `⚠️ **محدودیت حذف**\n\nحجم مصرفی این کاربر بیش از ۱۰۰ مگابایت می‌باشد، بنابراین امکان حذف کامل آن وجود ندارد.\nشما می‌توانید جهت جلوگیری از مصرف بیشتر، کاربر را **غیرفعال** کرده و یا حجم آن را کاهش دهید.`,
        volumeBelowConsumed: (consumed) => `❌ **خطای منطقی!**\nشما نمی‌توانید حجم اکانت را کمتر از مقداری که تا الان مصرف شده (${toPersianDigits(consumed)} GB) تنظیم کنید.`,
        unauthorized: `🚫 شما دسترسی لازم برای استفاده از این بخش را ندارید.`,
        adminDbError: (err) => `🔴 خطای دیتابیس:\n\`${err}\``,
        adminWorkerError: (err) => `🔴 خطای کارگر پس‌زمینه:\n\`${err}\``,

        featureInDevelopment: `⚙️ این بخش در حال توسعه می‌باشد و به‌زودی در دسترس قرار می‌گیرد.`,
        editNotSupported: `🛡 **محدودیت امنیتی**\n\nجهت حفظ یکپارچگی اطلاعات پنل، قابلیت ویرایش مستقیم مسدود است. لطفاً سرور را حذف کرده و مجدداً با اطلاعات جدید اضافه نمایید.`,
        invalidId: `❌ آیدی وارد شده نامعتبر است. لطفاً فقط یک عدد معتبر ارسال کنید:`,
        invalidCode: `❌ کد نامعتبر است. لطفاً فقط از حروف انگلیسی و اعداد (۲ تا ۸ کاراکتر) استفاده کنید:`,
        duplicateCode: `❌ این کد (پیشوند) قبلاً توسط نماینده دیگری ثبت شده است. لطفاً کد دیگری انتخاب کنید:`,
        invalidNumber: `❌ مقدار وارد شده نامعتبر است. لطفاً یک عدد معتبر بفرستید:`,
        invalidUrl: `❌ آدرس وارد شده نامعتبر است. حتماً باید با http:// یا https:// شروع شود:`
    },

    // ==========================================
    // 🔔 SYSTEM NOTIFIER (ALERTS)
    // ==========================================
    alerts: {
        serverDown: (serverName, error) =>
            `🔴 **آلرت قطعی سرور** 🔴\n\n` +
            `سرور \`${serverName}\` پس از ۳ بار تلاش، پاسخی نداد و در وضعیت **OFFLINE** قرار گرفت.\n\n` +
            `📌 **جزئیات خطا:** \`${error}\`\n` +
            `⚠️ فروش روی این سرور تا زمان رفع مشکل متوقف شد.`,

        serverRecovered: (serverName) =>
            `🟢 **بازگشت به مدار**\n\nسرور \`${serverName}\` مجدداً در دسترس قرار گرفت و وضعیت آن به **ACTIVE** تغییر یافت.`,

        rollback: (clientEmail, refundedAmount, currency) =>
            `⚠️ **خطای شبکه در ارتباط با سرور**\n\n` +
            `متاسفانه عملیات روی کانفیگ \`${clientEmail}\` به دلیل اختلال ارتباطی با سرور مقصد با شکست مواجه شد و به حالت قبل بازگشت.\n\n` +
            `مبلغ \`${toPersianDigits(numberUtils.formatMoney(refundedAmount))} ${currency === 'IRT' ? 'تومان' : 'یورو'}\` فوراً به کیف پول شما برگشت داده شد. لطفاً دقایقی دیگر مجدداً تلاش کنید.`
    },

    // ==========================================
    // 🔘 SYSTEM ACTIONS & BUTTONS
    // ==========================================
    actions: {
        success: '✅ عملیات با موفقیت انجام شد.',
        failed: '❌ عملیات با خطا مواجه شد.'
    },

    buttons: {
        general: {
            cancel: '❌ انصراف',
            confirm: '✅ تایید و ذخیره',
            retry: '🔄 تست مجدد',
            skip: '⏭ بدون تغییر (رد شدن)'
        },
        resellerType: {
            telegram: '👤 کاربر تلگرامی',
            ghost: '👻 نماینده ارواح (بدون اکانت)'
        },
        admin: {
            createClient: '➕ ساخت کانفیگ اصلی',
            createTestBulk: '🧪 ساخت تست گروهی',
            listClients: '👥 لیست کاربران',
            financeAdmin: '💰 حسابداری کل',
            manageServers: '🖥 مدیریت سرورها',
            manageResellers: '👥 نمایندگان',
            systemHealth: '📈 مانیتورینگ سیستم',
            broadcast: '📢 پیام همگانی',
            pendingReceipts: '🧾 فیش‌های در انتظار'
        },
        broadcast: {
            acknowledge: '✅ خواندم و تایید',
            confirmSend: '📢 تایید و ارسال همگانی',
            cancel: '❌ انصراف'
        },
        serverActions: {
            addServer: '➕ افزودن سرور جدید',
            editServer: '✏️ ویرایش سرور',
            deleteServer: '🗑 حذف سرور',
            enterMaintenance: '🟠 ورود به تعمیرات',
            exitMaintenance: '🟢 فعال‌سازی مجدد',
            confirmDelete: '⚠️ بله، حذف شود'
        },
        resellerActions: {
            addReseller: '➕ افزودن نماینده جدید',
            editReseller: '✏️ ویرایش تنظیمات',
            charge: '💳 شارژ / تسویه حساب',
            txHistory: '📚 سوابق تراکنش‌ها',
            suspend: '🚫 مسدود کردن',
            activate: '✅ فعال‌سازی',
            confirmAction: '⚠️ بله، انجام شود'
        },
        reseller: {
            createClient: '➕ ساخت کانفیگ اصلی',
            createTestBulk: '🧪 ساخت تست گروهی',
            myClients: '👥 لیست کانفیگ‌ها',
            finance: '💳 حسابداری و مالی',
            serverStatus: '📡 وضعیت شبکه',
            reports: '📊 گزارش عملکرد'
        },
        clientActions: {
            editVolume: '📊 تغییر حجم',
            editTime: '⏳ تمدید',
            toggleStatus: '🔌 قطع / وصل',
            delete: '🗑 حذف اکانت',
            confirmDelete: '⚠️ بله، کانفیگ حذف شود',
            getConfig: '📩 لینک اتصال',
            share: '📤 ارسال برای کاربر'
        },
        wizard: {
            time1Month: '۱ ماهه (۳۰ روز)',
            time2Months: '۲ ماهه (۶۰ روز)',
            time3Months: '۳ ماهه (۹۰ روز)',
            unlimited: '♾ نامحدود',
            cancel: '✖️ لغو عملیات',
            confirm: '✅ تایید و ساخت'
        },
        finance: {
            submitReceipt: '🧾 ثبت پرداختی (فیش)',
            unsettledInvoices: '📜 فاکتورهای تسویه‌نشده',
            transactionHistory: '📚 سوابق تراکنش‌ها',
            approveReceipt: '✅ تایید و شارژ',
            rejectReceipt: '❌ رد فیش'
        },
        navigation: {
            back: '🔙 بازگشت',
            nextPage: 'صفحه بعد ◀️',
            prevPage: '▶️ صفحه قبل',
            close: 'بستن ❌'
        }
    }
};