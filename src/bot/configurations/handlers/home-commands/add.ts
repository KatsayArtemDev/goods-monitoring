import { Composer, InputFile } from 'grammy';
import {
    ADD_KEYBOARD_TEMPLATE,
    HOME_KEYBOARD_TEMPLATE,
} from '../../reply-markup/templates.js';
import { MainContext } from '../../../init.js';
import {
    ADD_GOOD_INLINE_KEYBOARD,
    GOOD_LIMIT_REACHED_INLINE_KEYBOARD,
    INSTRUCTION_DEVICE_SELECTION_INLINE_KEYBOARD,
    INSTRUCTION_INLINE_KEYBOARD,
} from '../../reply-markup/inline-keyboards.js';
import { countAvailableUrls } from '../../../controllers/goods.js';
import {
    ADD_FIND_CHEAPER_KEYBOARD_MESSAGE,
    ADD_KEYBOARD_MESSAGE,
    ADD_SINGLE_KEYBOARD_MESSAGE,
    INSTRUCTION_KEYBOARD_MESSAGE,
    SINGLE_ADD_MESSAGE,
} from '../../templates/keyboard/home.js';
import {
    FIND_CHEAPER,
    INSTRUCTION_FIRST_STEP,
    MOBILE_INSTRUCTION,
} from '../../templates/add.js';
import {
    ADD_KEYBOARD,
    BACK_TO_ADDING_KEYBOARD,
} from '../../reply-markup/keyboards.js';
import {
    ALL_CATEGORIES,
    ALL_PLATFORMS,
} from '../../../worker/templates/categories.js';
import { handleFindCheaper, saveNewGoodData } from '../../../worker/url.js';

export const add = new Composer<MainContext>();

// TODO: Проверить нужна ли кнопка check, пока не исользуется
const {
    check,
    addAnother,
    findCheaper,
    singleChecking,
    instruction,
    instructionApple,
    instructionAndroid,
} = ADD_KEYBOARD_TEMPLATE;

add.hears(findCheaper, async (ctx) => {
    await ctx.reply(ADD_FIND_CHEAPER_KEYBOARD_MESSAGE, {
        reply_markup: BACK_TO_ADDING_KEYBOARD,
    });

    ctx.session.step = 'find_cheaper';

    const screenshot = new InputFile(
        './src/bot/configurations/templates/images/find-cheaper.jpg',
    );

    await ctx.replyWithPhoto(screenshot, { caption: FIND_CHEAPER });
});

add.hears(singleChecking, async (ctx) => {
    await ctx.reply(ADD_SINGLE_KEYBOARD_MESSAGE, {
        reply_markup: BACK_TO_ADDING_KEYBOARD,
    });

    ctx.session.step = 'single';

    const screenshotAdd = new InputFile(
        './src/bot/configurations/templates/images/single-add.jpg',
    );
    const screenshotUpdate = new InputFile(
        './src/bot/configurations/templates/images/single-update.jpg',
    );

    await ctx.replyWithMediaGroup([
        {
            type: 'photo',
            media: screenshotAdd,
            caption: SINGLE_ADD_MESSAGE,
            parse_mode: 'HTML',
        },
        { type: 'photo', media: screenshotUpdate },
    ]);

    await ctx.reply(INSTRUCTION_KEYBOARD_MESSAGE, {
        reply_markup: INSTRUCTION_INLINE_KEYBOARD,
    });
});

add.callbackQuery(ALL_CATEGORIES, async (ctx) => {
    await ctx.answerCallbackQuery('Начало поиска');
    await ctx.editMessageReplyMarkup({ reply_markup: undefined });
    await handleFindCheaper(ctx);
});

add.callbackQuery(ALL_PLATFORMS, async (ctx) => {
    const { message, data } = ctx.callbackQuery;

    if (
        !message ||
        !message.reply_to_message ||
        !message.reply_to_message.caption_entities
    ) {
        return;
    }

    let url: string | undefined;
    for (const mes of message.reply_to_message.caption_entities) {
        if (
            mes.type === 'text_link' &&
            mes.length === 15 &&
            mes.url &&
            mes.url.includes(data)
        ) {
            url = mes.url;
        }
    }
    if (!url) {
        return;
    }

    return await saveNewGoodData(ctx.from.id, { url, domain: data }, ctx);
});

add.callbackQuery(check, async (ctx) => {
    await ctx.answerCallbackQuery('Проверяем доступное число ссылок');
    const userId = ctx.from.id;

    const availableUrlsNum = await countAvailableUrls(userId);
    if (!availableUrlsNum && availableUrlsNum !== 0) {
        return;
    }

    if (availableUrlsNum === 0) {
        await ctx.reply(
            // TODO: get from template
            'Достигнут лимит по ссылкам',
            { reply_markup: GOOD_LIMIT_REACHED_INLINE_KEYBOARD },
        );
        return;
    }

    await ctx.reply(`👉 <b> Число доступных ссылок: ${availableUrlsNum}</b>`, {
        reply_markup: ADD_GOOD_INLINE_KEYBOARD,
    });
});

add.callbackQuery([HOME_KEYBOARD_TEMPLATE.add, addAnother], async (ctx) => {
    await ctx.answerCallbackQuery('Переключение клавиатуры');

    await ctx.reply(ADD_KEYBOARD_MESSAGE, {
        reply_markup: ADD_KEYBOARD,
        link_preview_options: {
            is_disabled: true,
        },
    });
});

add.callbackQuery(instruction, async (ctx) => {
    await ctx.answerCallbackQuery('Отправляем инструкцию');

    const screenshot = new InputFile(
        './src/bot/configurations/templates/images/url.png',
    );

    await ctx.replyWithPhoto(screenshot, {
        caption: INSTRUCTION_FIRST_STEP,
        reply_markup: INSTRUCTION_DEVICE_SELECTION_INLINE_KEYBOARD,
    });
});

add.callbackQuery(instructionApple, async (ctx) => {
    await ctx.answerCallbackQuery('Отправляем инструкцию для Apple');

    const screenshotShare = new InputFile(
        './src/bot/configurations/templates/images/apple-share.png',
    );
    const screenshotShareWithTg = new InputFile(
        './src/bot/configurations/templates/images/apple-share-with-tg.png',
    );

    await ctx.replyWithMediaGroup([
        {
            type: 'photo',
            media: screenshotShare,
            caption: MOBILE_INSTRUCTION,
            parse_mode: 'HTML',
        },
        { type: 'photo', media: screenshotShareWithTg },
    ]);
});

add.callbackQuery(instructionAndroid, async (ctx) => {
    await ctx.answerCallbackQuery('Отправляем инструкцию для Android');

    const screenshotShare = new InputFile(
        './src/bot/configurations/templates/images/android-share.png',
    );
    const screenshotShareWithTg = new InputFile(
        './src/bot/configurations/templates/images/android-share-with-tg.png',
    );

    await ctx.replyWithMediaGroup([
        {
            type: 'photo',
            media: screenshotShare,
            caption: MOBILE_INSTRUCTION,
            parse_mode: 'HTML',
        },
        { type: 'photo', media: screenshotShareWithTg },
    ]);
});
