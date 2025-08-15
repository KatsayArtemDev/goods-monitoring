import { CallbackQueryContext, InlineKeyboard, InputFile } from 'grammy';
import { PATTERNS, REG_EXP_URL_PATTERN } from './templates/patterns.js';
import {
    addNewGood,
    checkIfAvailableUrlsLimitReached,
    selectGood,
    selectUrlId,
} from '../controllers/goods.js';
import {
    ADD_ANOTHER_GOOD_INLINE_KEYBOARD,
    CHECK_AVAILABLE_URLS_INLINE_KEYBOARD,
    GOOD_LIMIT_REACHED_INLINE_KEYBOARD,
} from '../configurations/reply-markup/inline-keyboards.js';
import {
    createFirstGoodData,
    createNewGoodData,
    selectFirstGoodData,
    selectNewGoodData,
} from '../controllers/goods-data.js';
import {
    receiveCheaperGoodData,
    receiveNewGoodData,
} from './receive-good-data.js';
import { MainContext } from '../init.js';
import handleError from '../configurations/handlers/error.js';
import { HOME_KEYBOARD } from '../configurations/reply-markup/keyboards.js';
import { formatPrice, formatTime } from '../libs/formatting.js';
import { LIMIT_REACHED } from '../configurations/templates/goods.js';
import {
    FIND_CHEAPER_ADD,
    FIND_CHEAPER_NOT_FOUND,
    INCORRECT_URL,
    URL_NOT_DEFINED,
    WAITING_TO_RECEIVE,
} from '../configurations/templates/add.js';
import { priceLineCheckGood, priceLineNewGood } from '../libs/price-line.js';
import logger from '../logger.js';
import { CATEGORIES } from './templates/categories.js';
import { FindCheaperData } from '../models/good.js';
import { InputMediaPhoto } from 'grammy/types';

interface fetchedData extends Omit<FindCheaperData, 'sale_price'> {
    sale_price: number;
}

async function isLimitReached(userId: number, ctx: MainContext) {
    const isReached = await checkIfAvailableUrlsLimitReached(userId);
    if (!isReached && isReached !== false) {
        await handleError(ctx);
        return;
    }

    return isReached;
}

async function goodExit(urlId: string, ctx: MainContext) {
    const good = await selectGood(urlId);
    if (!good) {
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

    const caption = `
📋 Поисковой запрос: <b>${newGoodData.name}</b>

<u>Добавление</u>
${priceLineCheckGood(firstGoodData.sale_price, newGoodData.sale_price, good.created_at, Boolean(newGoodData.screenshot))}
└ 🔎 Дата следущей проверки: ${formatTime(good.check_in)}

🌐 <a href="${good.url}">Ссылка товара на ${good.platform}</a>
`;

    const newGoodDataPhoto = new InputFile(
        newGoodData.screenshot || firstGoodData.screenshot,
    );
    await ctx.replyWithPhoto(newGoodDataPhoto, {
        caption,
        reply_markup: ADD_ANOTHER_GOOD_INLINE_KEYBOARD,
    });
}

function isUrlValid(userUrl: string) {
    const { protocol, hostname, pathname } = new URL(userUrl);
    if (protocol !== 'https:') {
        return;
    }

    const urlParts = hostname + pathname;

    const correctPattern = PATTERNS.find((pattern) =>
        hostname.includes(pattern.domain + pattern.topDomain),
    );

    if (!correctPattern) {
        return;
    }

    const { domain, regExp, secondRegExp } = correctPattern;

    const isValid = regExp.test(urlParts);
    if (!isValid) {
        if (secondRegExp) {
            const isValidSecond = secondRegExp.test(urlParts);
            if (!isValidSecond) {
                return;
            }
        } else {
            return;
        }
    }

    return { url: 'https://' + urlParts, domain };
}

async function handleFindCheaper(ctx: CallbackQueryContext<MainContext>) {
    const { data: name, message } = ctx.callbackQuery;

    if (
        !message ||
        !message.reply_to_message ||
        !message.reply_to_message.text
    ) {
        await handleError(ctx);
        return;
    }

    const searchName = message.reply_to_message.text;

    const category = CATEGORIES.find((category) => category.name === name);
    if (!category) {
        await handleError(ctx);
        return;
    }

    let percent = 0;
    const percentStep = 100 / category.platforms.length;

    const { message_id } = await ctx.reply(`0% [▱▱▱▱▱▱▱▱▱▱] 100%`);
    const allFetchedData: fetchedData[] = [];
    for (const platform of category.platforms) {
        const fetchedData = await receiveCheaperGoodData(
            platform,
            category.name,
            searchName,
        );

        percent += Math.round(percentStep);
        await ctx.api.editMessageText(
            ctx.from.id,
            message_id,
            `${percent}% [${Array(Math.ceil(percent / 10))
                .fill('▰')
                .join('')}${Array(10 - Math.ceil(percent / 10))
                .fill('▱')
                .join('')}] 100%`,
        );

        if (fetchedData && fetchedData.sale_price) {
            const { url, platform, link, name, sale_price, screenshot } =
                fetchedData;
            allFetchedData.push({
                url,
                platform,
                link,
                name,
                sale_price,
                screenshot,
            });
        }
    }

    await ctx.api.editMessageText(
        ctx.from.id,
        message_id,
        `100% [▰▰▰▰▰▰▰▰▰▰] 100%`,
    );

    const data = allFetchedData.sort((a, b) => a.sale_price - b.sale_price);

    const media: InputMediaPhoto[] = [];
    const keyboardButtons: { text: string; data: string }[] = [];
    let caption = `По Вашему запросу следущие результаты в категории: ${name}`;
    for (let i = 0; i < data.length; i++) {
        if (i === 3) {
            break;
        }

        caption += `

 <b>№ ${i + 1} ${data[i].platform}</b>
├ 🔎 <a href="${data[i].url}">Ссылка поиска</a>
├ 📋 <b>${data[i].name}</b>
├ 💰 <b>${formatPrice(data[i].sale_price)}</b>
└ 🌐 <a href="${data[i].link}">Ссылка на товар</a>`;

        media.push({ type: 'photo', media: new InputFile(data[i].screenshot) });
        keyboardButtons.push({
            text: `№ ${i + 1} ${data[i].platform}`,
            data: data[i].platform,
        });
    }

    await ctx.api.deleteMessage(ctx.from.id, message_id);

    if (media.length === 0) {
        await ctx.reply(FIND_CHEAPER_NOT_FOUND);
        return;
    }

    media[0] = {
        type: 'photo',
        media: media[0].media,
        caption,
        parse_mode: 'HTML',
    };
    const mediaMessage = await ctx.replyWithMediaGroup(media);

    const rows = keyboardButtons.map(({ text, data }) => {
        return [InlineKeyboard.text(text, data)];
    });

    await ctx.reply(FIND_CHEAPER_ADD, {
        reply_parameters: { message_id: mediaMessage[0].message_id },
        reply_markup: InlineKeyboard.from(rows),
    });
}

interface correctData {
    url: string;
    domain: string;
}

async function saveNewGoodData(
    userId: number,
    correctData: correctData,
    ctx: MainContext,
) {
    const urlId = await selectUrlId(userId, correctData.url);
    if (urlId) {
        await goodExit(urlId, ctx);
        return;
    }

    await ctx.reply(WAITING_TO_RECEIVE, {
        reply_markup: HOME_KEYBOARD,
    });

    const newGoodData = await receiveNewGoodData(
        correctData.domain,
        correctData.url,
    );
    if (!newGoodData) {
        await handleError(ctx);
        return;
    }

    const createdGoodData = await addNewGood(
        userId,
        correctData.domain,
        correctData.url,
    );
    if (!createdGoodData) {
        await handleError(ctx);
        return;
    }

    const { url_id, created_at, check_in } = createdGoodData;
    const { name, sale_price, screenshot } = newGoodData;

    try {
        await createFirstGoodData({
            url_id,
            sale_price,
            screenshot,
        });
        await createNewGoodData(url_id, name);
    } catch {
        await handleError(ctx);
        return;
    }

    const preparedText = `
📋 <b>${newGoodData.name}</b>

<b><u>Добавление</u></b>
├ ${priceLineNewGood(newGoodData.sale_price)}
└ ⌛️ Дата добавления: ${formatTime(created_at)}

🔎 Дата следущей проверки: ${formatTime(check_in)}

🌐 <a href="${correctData.url}">Ссылка товара на ${correctData.domain}</a>
    `;

    await ctx.replyWithPhoto(new InputFile(newGoodData.screenshot), {
        caption: preparedText,
        reply_markup: CHECK_AVAILABLE_URLS_INLINE_KEYBOARD,
    });
}

async function handleSingle(ctx: MainContext) {
    if (!ctx.from || !ctx.message || !ctx.message.text) return;
    const userId = ctx.from.id;

    const isReached = await isLimitReached(userId, ctx);
    if (isReached) {
        await ctx.reply(LIMIT_REACHED, {
            reply_markup: GOOD_LIMIT_REACHED_INLINE_KEYBOARD,
        });
        return;
    }

    let userUrl = ctx.message.text.trim();
    const matchedUrl = userUrl.match(REG_EXP_URL_PATTERN);
    if (!matchedUrl) {
        await ctx.reply(URL_NOT_DEFINED);
        return;
    }
    userUrl = matchedUrl[0];

    const correctData = isUrlValid(userUrl);
    if (!correctData) {
        await ctx.reply(INCORRECT_URL);
        logger.error('INCORRECT_URL | url from user: ' + userUrl);
        return;
    }

    return await saveNewGoodData(userId, correctData, ctx);
}

export { handleFindCheaper, saveNewGoodData, handleSingle };
