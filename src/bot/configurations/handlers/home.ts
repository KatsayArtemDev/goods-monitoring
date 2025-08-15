import { Composer, InlineKeyboard, InputFile } from 'grammy';
import {
    GOOD_LIMIT_REACHED_TEMPLATE,
    GOODS_KEYBOARD_TEMPLATE,
    HOME_KEYBOARD_TEMPLATE,
    SUBSCRIBE_KEYBOARD_TEMPLATE,
} from '../reply-markup/templates.js';
import {
    ADD_KEYBOARD,
    ADDITIONAL_KEYBOARD,
} from '../reply-markup/keyboards.js';
import {
    ADD_GOOD_INLINE_KEYBOARD,
    BUY_INLINE_KEYBOARD,
    GOODS_REMOVE_INLINE_KEYBOARD,
    GOODS_REMOVE_WITH_DETAILS_INLINE_KEYBOARD,
    REFERRAL_INLINE_KEYBOARD,
} from '../reply-markup/inline-keyboards.js';
import { MainContext } from '../../init.js';
import {
    selectReferralLink,
    userSubscription,
} from '../../controllers/users.js';
import {
    REFERRAL_FIRST_PART,
    REFERRAL_SECOND_PART,
} from '../templates/referral.js';
import {
    ADD_KEYBOARD_MESSAGE,
    ADD_SECTION_KEYBOARD_MESSAGE,
    ADDITIONAL_KEYBOARD_MESSAGE,
} from '../templates/keyboard/home.js';
import handleError from './error.js';
import { formatTime } from '../../libs/formatting.js';
import { FirstGoodData, NewGoodData } from '../../models/good.js';
import { countAvailableUrls, selectAllGoods } from '../../controllers/goods.js';
import {
    selectFirstGoodsData,
    selectNewGoodsData,
} from '../../controllers/goods-data.js';
import { NO_GOODS, WAITING_UNTIL_NEXT_CALL } from '../templates/goods.js';
import logger from '../../logger.js';
import { priceLineCheckGood } from '../../libs/price-line.js';
import { BonusName } from '../../models/promotional-code.js';
import timeframe from '../../libs/converts/timeframe.js';
import convertTimeframe from '../../libs/converts/timeframe.js';
import convertPaymentPeriodsLevel from '../../libs/converts/payment-periods-level.js';

interface GoodsMessages {
    user_id: string;
    url_id: string;
    platform: string;
    url: string;
    created_at: Date;
    check_in: Date;
    updated_at: Date;
    first: FirstGoodData;
    new: NewGoodData;
}

async function sendGoodsMessages(
    ctx: MainContext,
    mergedGoodsData: GoodsMessages[],
    userId: number,
) {
    for (const good of mergedGoodsData) {
        const response = `
📋 <b>${good.new.name}</b>

<u>Добавление</u>
${priceLineCheckGood(good.first.sale_price, good.new.sale_price, good.created_at, Boolean(good.new.screenshot))}
├ ⌛️️ Дата последней: ${formatTime(good.updated_at)}
└ 🔎️ Дата следующей: ${formatTime(good.check_in)}

🌐 <a href="${good.url}">Ссылка товара на ${good.platform}</a>
`;

        const newGoodDataPhoto = new InputFile(
            good.new.screenshot || good.first.screenshot,
        );

        let keyboard: InlineKeyboard;
        if (good.new.screenshot) {
            keyboard = GOODS_REMOVE_WITH_DETAILS_INLINE_KEYBOARD;
        } else {
            keyboard = GOODS_REMOVE_INLINE_KEYBOARD;
        }

        await ctx.replyWithPhoto(newGoodDataPhoto, {
            caption: response,
            reply_markup: keyboard,
        });
    }

    const availableUrlsNum = await countAvailableUrls(userId);
    if (!availableUrlsNum && availableUrlsNum !== 0) {
        return;
    }

    // TODO: add text 114 line and activate keyboard after adding subscription
    // Также Вы всегда можете обновить свой тариф, выбрав один из готовых варианов подписок. Не понравились? Вы всегда можете всё настроить под себя выбрав нужное! 😉

    if (availableUrlsNum === 0) {
        await ctx.reply(
            `Вы достигли лимита по ссылкам. Отредактируйте список, нажав на кнопку "${GOODS_KEYBOARD_TEMPLATE.remove}" или пригласите новых пользователей, тогда у Вас будет больше ссылок`,
            // { reply_markup: UPDATE_SUBSCRIPTION_INLINE_KEYBOARD },
        );
        return;
    }

    await ctx.reply(`👉 <b> Число доступных ссылок: ${availableUrlsNum}</b>`, {
        reply_markup: ADD_GOOD_INLINE_KEYBOARD,
    });
}

async function handleSendingMessages(
    ctx: MainContext,
    mergedGoodsData: GoodsMessages[],
    userId: number,
) {
    try {
        await sendGoodsMessages(ctx, mergedGoodsData, userId);
    } catch (error) {
        logger.error('sending goods messages: ' + error);
    }
}

async function sendAllGoodsData(ctx: MainContext) {
    if (!ctx.from) return;

    const userId = ctx.from.id;
    const goods = await selectAllGoods(userId);
    if (!goods) {
        await handleError(ctx);
        return;
    }

    if (goods.length === 0) {
        await ctx.reply(NO_GOODS, {
            reply_markup: ADD_GOOD_INLINE_KEYBOARD,
        });
        return;
    }

    const customSession = ctx.session;
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - customSession.timeUntilNextGettingAllGoods;

    const pause = 30000;
    if (timeDiff < pause) {
        const totalSeconds = Math.floor((pause - timeDiff) / 1000);
        const seconds = totalSeconds % 60;

        await ctx.reply(WAITING_UNTIL_NEXT_CALL + seconds);
        return;
    }

    customSession.timeUntilNextGettingAllGoods = currentTime;

    const allUrlIds = goods.map((good) => good.url_id);

    const firstGoodsData = await selectFirstGoodsData(allUrlIds);
    if (!firstGoodsData) {
        await handleError(ctx);
        return;
    }

    const newGoodsData = await selectNewGoodsData(allUrlIds);
    if (!newGoodsData) {
        await handleError(ctx);
        return;
    }

    const mergedGoodsData = goods.map((good) => {
        const firstGoodData = firstGoodsData.find(
            (reqGoodData) => good.url_id === reqGoodData.url_id,
        );

        const newGoodData = newGoodsData.find(
            (reqGoodData) => good.url_id === reqGoodData.url_id,
        );

        return { ...good, first: firstGoodData!, new: newGoodData! };
    });

    void handleSendingMessages(ctx, mergedGoodsData, userId);
}

export const home = new Composer<MainContext>();

const { goods, add, subscribe, additional, referral } = HOME_KEYBOARD_TEMPLATE;

home.hears(goods, async (ctx) => await sendAllGoodsData(ctx));

home.callbackQuery(GOOD_LIMIT_REACHED_TEMPLATE.edit, async (ctx) => {
    await ctx.answerCallbackQuery(
        'Отправляем все доступные товары для редактирования',
    );

    await ctx.editMessageReplyMarkup(undefined);

    await sendAllGoodsData(ctx);
});

const { moreAboutSubscribe } = SUBSCRIBE_KEYBOARD_TEMPLATE;

function bonusUpdate(bonusName: BonusName, bonus: string) {
    let updBonus = '';
    switch (bonusName) {
        case 'discount':
            updBonus = `скидка на подписку ${bonus}%`;
            break;
        case 'urls':
            updBonus = `ссылки +${bonus}`;
            break;
        case 'timeframe':
            updBonus = 'проверка товара ' + timeframe(bonus);
    }

    return updBonus;
}

async function sendUserSubscribeData(ctx: MainContext) {
    if (!ctx.from) return;
    const userId = ctx.from.id;

    // TODO: inline key upgrade subscription

    const subscription = await userSubscription(userId);
    if (!subscription) {
        await handleError(ctx);
        return;
    }

    const {
        discount,
        timeframe,
        urls_limit,
        goods_count,
        subscription_name,
        payment_periods_level,
        price,
        end_timestamp,
        activePromotionalCodes,
    } = subscription;

    const availableLinksNumber = urls_limit - Number(goods_count);

    let response = `
👑 Активная подписка: <b>${subscription_name}</b>

👀 Регулярность проверки товаров: <b>${convertTimeframe(timeframe)}</b>

📎 Всего ссылок: <b>${urls_limit}</b>
├ Число использованных ссылок: <b>${goods_count}</b>
└ Досутно к использованию: <b>${availableLinksNumber}</b>
`;

    if (price && payment_periods_level && end_timestamp) {
        const options: Intl.DateTimeFormatOptions = {
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        };

        const endFormattedTime = formatTime(end_timestamp, options);

        response += `
⚡️ Цена подписки: ${price}₽
├ ⏳ Регулярность оплаты: ${convertPaymentPeriodsLevel(payment_periods_level)}
└ 👑 Дата следующей оплаты: ${endFormattedTime}
`;
    }

    if (discount) {
        response += `\n🎉 Есть активная скидка на подписку <b>${discount}</b>%\n`;
    }

    if (activePromotionalCodes.length === 0) {
        response += '\n🎁 Активных промокодов нет\n';
    } else {
        const currentYear = new Date().getFullYear();
        for (const activePromotionalCode of activePromotionalCodes) {
            const { promotional_code, bonus_name, bonus, ended_at } =
                activePromotionalCode;

            let formatEndedAt = formatTime(ended_at, {
                month: 'long',
                day: 'numeric',
            });

            const year = ended_at.getFullYear();
            if (year - currentYear > 365) {
                formatEndedAt += ` ${year} года`;
            }

            const updBonus = bonusUpdate(bonus_name, bonus);
            response += `\n🎁 Название актиного промокода: ${promotional_code}\n├ Бонус по промокоду: ${updBonus}\n└ Промокод активен до ${formatEndedAt}\n`;
        }
    }

    await ctx.reply(response, {
        reply_markup: BUY_INLINE_KEYBOARD,
    });
}

home.hears(subscribe, async (ctx) => await sendUserSubscribeData(ctx));

home.callbackQuery(moreAboutSubscribe, async (ctx) => {
    await ctx.answerCallbackQuery('Отправляем данные о подписке');

    await sendUserSubscribeData(ctx);
});

home.hears(add, async (ctx) => {
    if (!ctx.from) return;

    await ctx.reply(ADD_SECTION_KEYBOARD_MESSAGE, {
        reply_markup: ADD_KEYBOARD,
    });

    await ctx.reply(ADD_KEYBOARD_MESSAGE, {
        reply_markup: ADD_KEYBOARD,
        link_preview_options: {
            is_disabled: true,
        },
    });
});

// home.hears(subscribe, async (ctx) => {
//     if (!ctx.from) return;
//
//     await ctx.reply(SUBSCRIBE_KEYBOARD_MESSAGE, {
//         reply_markup: SUBSCRIBE_KEYBOARD,
//     });
// });

home.hears(additional, async (ctx) => {
    if (!ctx.from) return;

    await ctx.reply(ADDITIONAL_KEYBOARD_MESSAGE, {
        reply_markup: ADDITIONAL_KEYBOARD,
    });
});

home.hears(referral, async (ctx) => {
    if (!ctx.from) return;

    const referralLink = await selectReferralLink(ctx.from.id);

    const url = `https://t.me/${process.env.BOT_USERNAME}?start=${referralLink}`;

    const response =
        REFERRAL_FIRST_PART +
        `<b>Ваша уникальная ссылка:</b> <code>${url}</code>` +
        REFERRAL_SECOND_PART;

    await ctx.reply(response, {
        reply_markup: REFERRAL_INLINE_KEYBOARD,
    });
});
