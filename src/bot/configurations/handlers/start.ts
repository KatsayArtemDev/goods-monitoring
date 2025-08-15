import { CommandContext } from 'grammy';
import { HOME_KEYBOARD } from '../reply-markup/keyboards.js';
import { checkIfUserExist, addNewUser } from '../../controllers/users.js';
import { MainContext } from '../../init.js';
import { ADDING_AT_START, START, START_ERROR } from '../templates/base.js';
import { ONLY_FOR_NEW } from '../templates/referral.js';
import { updateUserUrlsLimit } from '../../controllers/subscriptions.js';
import { selectReferralLinkOwner } from '../../controllers/referral.js';
import { ADD_KEYBOARD_MESSAGE } from '../templates/keyboard/home.js';
import { INSTRUCTION_INLINE_KEYBOARD } from '../reply-markup/inline-keyboards.js';
import { selectUserUrlsLimit } from '../../controllers/goods.js';
import handleError from './error.js';

export default async function handleStart(ctx: CommandContext<MainContext>) {
    if (!ctx.from) return;

    const userId = ctx.from.id;
    const referralLink = ctx.match;

    const isExist = await checkIfUserExist(ctx.from.id);
    if (!isExist && isExist !== false) {
        await ctx.reply(START_ERROR);
        return;
    }

    if (!isExist) {
        const { first_name, username, language_code, is_premium, is_bot } =
            ctx.from;

        try {
            await addNewUser(
                userId,
                first_name,
                referralLink,
                is_premium || false,
                is_bot,
                username,
                language_code,
            );
        } catch {
            await handleError(ctx);
            return;
        }
    }

    const urlsLimit = await selectUserUrlsLimit(userId);
    if (!urlsLimit) {
        return;
    }

    const urlsLimitText = `
👑 <b>Число ссылок доступное к добавлению уже сейчас <u>${urlsLimit}</u></b> 🎁`;

    await ctx.reply(START + urlsLimitText, {
        reply_markup: HOME_KEYBOARD,
    });

    await ctx.reply(ADDING_AT_START + ADD_KEYBOARD_MESSAGE, {
        reply_markup: INSTRUCTION_INLINE_KEYBOARD,
        link_preview_options: {
            is_disabled: true,
        },
    });

    if (!referralLink) {
        return;
    }

    if (isExist) {
        await ctx.reply(ONLY_FOR_NEW, {
            reply_markup: HOME_KEYBOARD,
        });

        return;
    }

    const bonusUrlsLimit = 3;

    const updInvitedUserUrlsLimit = await updateUserUrlsLimit(
        userId,
        bonusUrlsLimit,
    );
    if (!updInvitedUserUrlsLimit) {
        return;
    }

    const userInviter = await selectReferralLinkOwner(referralLink);
    if (!userInviter) {
        return;
    }

    const { user_id, username, first_name } = userInviter;

    const updInviterUserUrlsLimit = await updateUserUrlsLimit(
        Number(user_id),
        bonusUrlsLimit,
    );
    if (!updInviterUserUrlsLimit) {
        return;
    }

    let name = first_name;
    if (username) {
        name = '@' + username;
    }

    const response = `
🎉 <b>Вы были приглашены пользователем:</b> ${name}

🎁 Бонус за вступление по приглашению <b>+${bonusUrlsLimit} ссылки!</b>

📎 Число доступных для Вас ссылок: <b>${updInvitedUserUrlsLimit}</b>

💰 <b><u>Выгодных покупок!</u></b>
    `;

    await ctx.reply(response, {
        reply_markup: HOME_KEYBOARD,
    });
}
