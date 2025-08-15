import { Composer } from 'grammy';
import { MainContext } from '../../../init.js';
import { SUBSCRIBE_KEYBOARD_TEMPLATE } from '../../reply-markup/templates.js';
import {
    addNewInterestedInPaidUser,
    checkIfUserWasInterestedInPaid,
    updateCounterInterestedInPaidUser,
} from '../../../controllers/subscriptions.js';
import handleError from '../error.js';
import { BUY } from '../../templates/subscribe.js';

export const subscribe = new Composer<MainContext>();

const { buy } = SUBSCRIBE_KEYBOARD_TEMPLATE;

subscribe.callbackQuery(buy, async (ctx) => {
    const userId = ctx.from.id;

    const isUserWasInterestedInPaid =
        await checkIfUserWasInterestedInPaid(userId);
    if (!isUserWasInterestedInPaid && isUserWasInterestedInPaid !== false) {
        await handleError(ctx);
        return;
    }

    if (isUserWasInterestedInPaid) {
        await updateCounterInterestedInPaidUser(userId);
    } else {
        await addNewInterestedInPaidUser(userId);
    }

    await ctx.reply(BUY);
});

// subscribe.hears(subscribeName, async (ctx) => {
//     await ctx.reply(READY_SUBSCRIPTION, {
//         reply_markup: READY_SUBSCRIPTION_INLINE_KEYBOARD,
//     });
// });
//
// const { firstLevel, secondLevel, thirdLevel } =
//     READY_SUBSCRIPTION_KEYBOARD_TEMPLATE;
//
// subscribe.callbackQuery(firstLevel, async (ctx) => {
//     await ctx.answerCallbackQuery('Отправляем подписку: ' + firstLevel);
//     await ctx.reply(firstLevel + FIRST_LEVEL_SUBSCRIPTION, {
//         reply_markup: TIMELINE_SUBSCRIPTION_INLINE_KEYBOARD,
//     });
// });
//
// subscribe.callbackQuery(secondLevel, async (ctx) => {
//     await ctx.answerCallbackQuery('Отправляем подписку: ' + secondLevel);
//     await ctx.reply(secondLevel + SECOND_LEVEL_SUBSCRIPTION, {
//         reply_markup: TIMELINE_SUBSCRIPTION_INLINE_KEYBOARD,
//     });
// });
//
// subscribe.callbackQuery(thirdLevel, async (ctx) => {
//     await ctx.answerCallbackQuery('Отправляем подписку: ' + thirdLevel);
//     await ctx.reply(thirdLevel + THIRD_LEVEL_SUBSCRIPTION, {
//         reply_markup: TIMELINE_SUBSCRIPTION_INLINE_KEYBOARD,
//     });
// });
//
// subscribe.hears(promotionalCode, async (ctx) => {
//     ctx.session.step = 'promotional_code';
//
//     await ctx.reply('Напишите промокод', {
//         reply_markup: BACK_TO_SUBSCRIBE_KEYBOARD,
//     });
// });
