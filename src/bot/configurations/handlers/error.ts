import { MainContext } from '../../init.js';
import { Composer } from 'grammy';
import { HOME_KEYBOARD } from '../reply-markup/keyboards.js';
import { ERROR, WRONG_MESSAGE } from '../templates/base.js';

export const error = new Composer<MainContext>();

export default async function handleError(ctx: MainContext) {
    await ctx.reply(ERROR);
}

error.on('message', async (ctx) => {
    if (!ctx.from) return;

    await ctx.reply(WRONG_MESSAGE, {
        reply_markup: HOME_KEYBOARD,
    });
});
