import { MainContext } from '../../init.js';
import {
    addPromoUsedByUser,
    checkIfExpired,
    checkIfPromoUsed,
    selectIsPromoUsed,
    selectPromo,
    sendNewReview,
    updateIsPromoCodeUsed,
    updatePromoTotalUsage,
} from '../../controllers/routes.js';
import {
    ADD_KEYBOARD,
    ADDITIONAL_KEYBOARD,
    SUBSCRIBE_KEYBOARD,
} from '../reply-markup/keyboards.js';
import { BACK_KEYBOARD_TEMPLATE } from '../reply-markup/templates.js';
import {
    updateUserDiscount,
    updateUserUrlsLimit,
    updateUserTimeframe,
} from '../../controllers/subscriptions.js';
import handleError from './error.js';
import { THANKS_FOR_REVIEW } from '../templates/additional.js';
import convertTimeframe from '../../libs/converts/timeframe.js';
import {
    ADD_SECTION_KEYBOARD_MESSAGE,
    ADDITIONAL_KEYBOARD_MESSAGE,
} from '../templates/keyboard/home.js';
import { formatTime } from '../../libs/formatting.js';
import { handleSingle } from '../../worker/url.js';
import {
    FIND_CHEAPER_GIVES_ADVICE,
    FIND_CHEAPER_CATEGORIES_1,
    FIND_CHEAPER_CATEGORIES_2,
} from '../templates/add.js';
import { CATEGORIES } from '../../worker/templates/categories.js';
import { InlineKeyboard } from 'grammy';

async function handleReview(ctx: MainContext) {
    if (!ctx.from || !ctx.message || !ctx.message.text) return;

    ctx.session.step = 'main';

    const description = ctx.message.text;

    if (description === BACK_KEYBOARD_TEMPLATE.toAdditional) {
        await ctx.reply(ADDITIONAL_KEYBOARD_MESSAGE, {
            reply_markup: ADDITIONAL_KEYBOARD,
        });
        return;
    }

    try {
        await sendNewReview(ctx.from.id, description);
    } catch {
        await handleError(ctx);
        return;
    }

    await ctx.reply(THANKS_FOR_REVIEW, {
        reply_markup: ADDITIONAL_KEYBOARD,
    });
}

async function discount(userId: number, bonus: string) {
    const response = await updateUserDiscount(userId, Number(bonus));
    if (!response) {
        return;
    }

    if (response === 'more') {
        return 'Текущая скидка выше, чем по промокоду';
    }

    if (response === 'equal') {
        return 'Скидка по промокоду такая же как и у Вас';
    }

    return `Отлично! Вы использовали промокод! Ваша скидка: ${bonus}%`;
}

async function urls(userId: number, bonus: string) {
    const response = await updateUserUrlsLimit(userId, Number(bonus));
    if (!response) {
        return;
    }

    return `Отлично! Вы использовали промокод! Ваше число ссылок: ${response}`;
}

async function timeframe(userId: number, bonus: string) {
    const response = await updateUserTimeframe(userId, bonus);
    if (!response) {
        return;
    }

    if (response === 'more') {
        return 'Тякущая частота просмотра выше, чем по промокоду';
    }

    if (response === 'equal') {
        return 'Частота просмотра по промокоду такая же как и у Вас';
    }

    return `Отлично! промокод активирован! Время проверки: ${convertTimeframe(bonus)}`;
}

async function handlePromotionalCode(ctx: MainContext) {
    if (!ctx.from || !ctx.message || !ctx.message.text) return;

    ctx.session.step = 'main';
    const promotionalCode = await selectPromo(ctx.message.text);

    if (!promotionalCode) {
        await ctx.reply('Your promotional code is incorrect', {
            reply_markup: SUBSCRIBE_KEYBOARD,
        });
        return;
    }

    const {
        promotional_id,
        bonus_name,
        bonus,
        is_for_new,
        total_usage,
        usage_limit,
        duration_in_days,
    } = promotionalCode;

    const isExpired = await checkIfExpired(promotional_id);
    if (!isExpired) {
        await ctx.reply('Your promo code has expired', {
            reply_markup: SUBSCRIBE_KEYBOARD,
        });
        return;
    }

    if (total_usage === usage_limit) {
        await ctx.reply(
            'Your promo code has been used the maximum number of times',
            {
                reply_markup: SUBSCRIBE_KEYBOARD,
            },
        );
        return;
    }

    const userId = ctx.from.id;

    const isUsed = await checkIfPromoUsed(userId, promotional_id);
    if (isUsed) {
        await ctx.reply('You used this promotional code before', {
            reply_markup: SUBSCRIBE_KEYBOARD,
        });
        return;
    }

    const isUserUsedPromo = await selectIsPromoUsed(userId);
    if (isUserUsedPromo) {
        if (is_for_new) {
            await ctx.reply('This promotional code only for new users', {
                reply_markup: SUBSCRIBE_KEYBOARD,
            });
            return;
        }
    } else {
        try {
            await updateIsPromoCodeUsed(userId);
        } catch {
            await handleError(ctx);
            return;
        }
    }

    let response: string | undefined;
    switch (bonus_name) {
        case 'discount':
            response = await discount(userId, bonus);
            break;
        case 'urls':
            response = await urls(userId, bonus);
            break;
        case 'timeframe':
            response = await timeframe(userId, bonus);
    }

    try {
        await updatePromoTotalUsage(promotional_id);
    } catch {
        await handleError(ctx);
        return;
    }

    const endedAt = await addPromoUsedByUser(
        userId,
        promotional_id,
        duration_in_days,
    );
    if (!endedAt) {
        await handleError(ctx);
        return;
    }

    let formatEndedAt = formatTime(endedAt, { month: 'long', day: 'numeric' });

    if (duration_in_days >= 365) {
        const year = endedAt.getFullYear();
        formatEndedAt += ` ${year} года`;
    }

    if (!response) {
        await handleError(ctx);
        return;
    }

    await ctx.reply(response + ` до ${formatEndedAt}`);

    await ctx.reply('to_subscribe', {
        reply_markup: SUBSCRIBE_KEYBOARD,
    });
}

async function isBackToAdding(description: string, ctx: MainContext) {
    if (description === BACK_KEYBOARD_TEMPLATE.toAdd) {
        await ctx.reply(ADD_SECTION_KEYBOARD_MESSAGE, {
            reply_markup: ADD_KEYBOARD,
        });
        return true;
    }
    return false;
}

async function addFindCheaper(ctx: MainContext) {
    if (!ctx.from || !ctx.message || !ctx.message.text) return;

    ctx.session.step = 'main';

    const description = ctx.message.text;
    if (await isBackToAdding(description, ctx)) {
        return;
    }

    await ctx.reply(FIND_CHEAPER_GIVES_ADVICE, {
        reply_markup: ADD_KEYBOARD,
    });

    let categoriesText = '\n<u>Магазины по категориям:</u>';
    const rows = CATEGORIES.map((category) => {
        categoriesText += `\n<b>${category.name}</b>`;
        for (const platform of category.platforms) {
            categoriesText += `\n∘ ${platform}`;
        }
        return [InlineKeyboard.text(category.name)];
    });

    categoriesText += '\n\n😎 <u>Скоро появятся магазины с электроникой</u>\n';

    await ctx.reply(
        FIND_CHEAPER_CATEGORIES_1 + categoriesText + FIND_CHEAPER_CATEGORIES_2,
        {
            reply_markup: InlineKeyboard.from(rows),
            reply_parameters: { message_id: ctx.message.message_id },
        },
    );
}

async function addSingle(ctx: MainContext) {
    if (!ctx.from || !ctx.message || !ctx.message.text) return;
    ctx.session.step = 'main';

    if (await isBackToAdding(ctx.message.text, ctx)) {
        return;
    }

    await handleSingle(ctx);

    await ctx.reply(ADD_SECTION_KEYBOARD_MESSAGE, {
        reply_markup: ADD_KEYBOARD,
    });
}

export { handleReview, handlePromotionalCode, addFindCheaper, addSingle };
