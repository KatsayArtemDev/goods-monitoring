import { Composer } from 'grammy';
import { BACK_KEYBOARD_TEMPLATE } from '../reply-markup/templates.js';
import {
    HOME_KEYBOARD,
    SUBSCRIBE_KEYBOARD,
} from '../reply-markup/keyboards.js';
import { MainContext } from '../../init.js';
import {
    HOME_KEYBOARD_MESSAGE,
    SUBSCRIBE_KEYBOARD_MESSAGE,
} from '../templates/keyboard/home.js';

export const back = new Composer<MainContext>();

const { toHome, toSubscribe } = BACK_KEYBOARD_TEMPLATE;

back.hears(toHome, async (ctx) => {
    if (!ctx.from) return;

    await ctx.reply(HOME_KEYBOARD_MESSAGE, { reply_markup: HOME_KEYBOARD });
});

back.hears(toSubscribe, async (ctx) => {
    if (!ctx.from) return;

    await ctx.reply(SUBSCRIBE_KEYBOARD_MESSAGE, {
        reply_markup: SUBSCRIBE_KEYBOARD,
    });
});
