import { CallbackQueryContext, Composer, InputFile } from 'grammy';
import { GOODS_KEYBOARD_TEMPLATE } from '../../reply-markup/templates.js';
import { MainContext } from '../../../init.js';
import {
    countAvailableUrls,
    removeGood,
    selectGood,
    selectUrlId,
} from '../../../controllers/goods.js';
import handleError from '../error.js';
import {
    removeNewGoodData,
    removeFirstGoodData,
    selectNewGoodData,
    selectFirstGoodData,
} from '../../../controllers/goods-data.js';
import {
    ADD_ANOTHER_GOOD_INLINE_KEYBOARD,
    GOODS_REMOVE_INLINE_KEYBOARD,
} from '../../reply-markup/inline-keyboards.js';
import { formatPrice, formatTime } from '../../../libs/formatting.js';
import { priceLineNewGood } from '../../../libs/price-line.js';

export const goods = new Composer<MainContext>();

const { remove, details } = GOODS_KEYBOARD_TEMPLATE;

async function getUrlFromMessage(ctx: CallbackQueryContext<MainContext>) {
    const message = ctx.callbackQuery.message;

    if (!message || !message.caption_entities) {
        return;
    }

    const captionWithUrl = message.caption_entities.find(
        (caption) => caption.type === 'text_link',
    );

    if (!captionWithUrl || !('url' in captionWithUrl)) {
        return;
    }

    return captionWithUrl.url;
}

goods.callbackQuery(remove, async (ctx) => {
    await ctx.answerCallbackQuery('Удаляем товар');

    const url = await getUrlFromMessage(ctx);

    if (!url) {
        await handleError(ctx);
        return;
    }

    const userId = ctx.from.id;

    const urlId = await selectUrlId(userId, url);
    if (!urlId) {
        await handleError(ctx);
        return;
    }

    const firstGoodData = await selectFirstGoodData(urlId);
    if (!firstGoodData) {
        await handleError(ctx);
        return;
    }

    const newGoodData = await selectNewGoodData(urlId);
    if (!newGoodData) {
        await handleError(ctx);
        return;
    }

    try {
        await removeGood(urlId);
        await removeFirstGoodData(urlId);
        await removeNewGoodData(urlId);
    } catch {
        await handleError(ctx);
        return;
    }

    const availableUrlsNum = await countAvailableUrls(userId);

    const goodDataPhoto = new InputFile(
        newGoodData.screenshot || firstGoodData.screenshot,
    );

    let price: null | number;
    if (newGoodData.screenshot) {
        price = newGoodData.sale_price;
    } else {
        price = firstGoodData.sale_price;
    }

    const response = `
📋 <b>${newGoodData.name}</b>

${priceLineNewGood(price)}

🌐 <a href="${url}">Ссылка на товар</a>

🗑 <b>Товар был успешно удалён!</b>

📎 Актуальное число доступных ссылок: <b>${availableUrlsNum}</b>
    `;

    await ctx.replyWithPhoto(goodDataPhoto, {
        reply_markup: ADD_ANOTHER_GOOD_INLINE_KEYBOARD,
        caption: response,
    });

    await ctx.editMessageReplyMarkup(undefined);
});

goods.callbackQuery(details, async (ctx) => {
    await ctx.answerCallbackQuery('Отправляем подробную информацию по товару');

    const url = await getUrlFromMessage(ctx);
    if (!url) {
        await handleError(ctx);
        return;
    }

    const userId = ctx.from.id;

    const urlId = await selectUrlId(userId, url);
    if (!urlId) {
        await handleError(ctx);
        return;
    }

    const good = await selectGood(urlId);
    if (!good) {
        await handleError(ctx);
        return;
    }

    const firstGoodData = await selectFirstGoodData(urlId);
    if (!firstGoodData || !firstGoodData.sale_price) {
        await handleError(ctx);
        return;
    }

    const newGoodData = await selectNewGoodData(urlId);
    if (!newGoodData || !newGoodData.screenshot) {
        await handleError(ctx);
        return;
    }

    const prevGoodDataPhoto = new InputFile(firstGoodData.screenshot);
    const newGoodDataPhoto = new InputFile(newGoodData.screenshot);

    let priceLine = `├ 💰 Первоначальная цена: <b>${formatPrice(firstGoodData.sale_price)}\n├ 😔 Товара нет в наличии</b>`;
    if (newGoodData.sale_price) {
        priceLine = `├ 💰 Цена: <b>${formatPrice(firstGoodData.sale_price)} → ${formatPrice(newGoodData.sale_price)}</b>`;
    }

    let priceDynamicsLine = '';
    if (firstGoodData.sale_price && newGoodData.sale_price) {
        if (newGoodData.sale_price > firstGoodData.sale_price) {
            priceDynamicsLine = `├ 📈 `;
        } else {
            priceDynamicsLine = `├ 📉 `;
        }

        priceDynamicsLine += `Разница в цене: <b>${formatPrice(newGoodData.sale_price - firstGoodData.sale_price)}</b>`;
    }

    const response = `
📋 <b>${newGoodData.name}</b>

<b><u>Обновление</u></b>
${priceLine}${priceDynamicsLine ? '\n' + priceDynamicsLine : ''}
└ ⌛️ Дата последнего обновления: ${formatTime(good.updated_at)}

🌐 <a href="${good.url}">Ссылка товара на ${good.platform}</a>
    `;

    await ctx.replyWithMediaGroup([
        {
            type: 'photo',
            media: prevGoodDataPhoto,
            caption: response,
            parse_mode: 'HTML',
        },
        { type: 'photo', media: newGoodDataPhoto },
    ]);

    await ctx.editMessageReplyMarkup({
        reply_markup: GOODS_REMOVE_INLINE_KEYBOARD,
    });
});
