import { Composer } from 'grammy';
import { ADDITIONAL_KEYBOARD_TEMPLATE } from '../../reply-markup/templates.js';
import { BACK_TO_ADDITIONAL_KEYBOARD } from '../../reply-markup/keyboards.js';
import { MainContext } from '../../../init.js';
import { userProfile, updateUser } from '../../../controllers/users.js';
import handleError from '../error.js';
import {
    ABOUT,
    DICTIONARY,
    DONATION,
    REVIEW,
    SUPPORT,
} from '../../templates/additional.js';
import {
    DICTIONARY_INLINE_KEYBOARD,
    INSTRUCTION_INLINE_KEYBOARD,
    MORE_ABOUT_SUBSCRIBE_INLINE_KEYBOARD,
} from '../../reply-markup/inline-keyboards.js';

export const additional = new Composer<MainContext>();

const { account, about, donation, review, support, dictionary } =
    ADDITIONAL_KEYBOARD_TEMPLATE;

additional.hears(account, async (ctx) => {
    if (!ctx.from) return;

    const userId = ctx.from.id;
    const profile = await userProfile(userId);
    if (!profile) {
        await handleError(ctx);
        return;
    }

    const { first_name, is_premium, language_code, username } = ctx.from;

    if (
        first_name !== profile.first_name ||
        is_premium !== profile.is_premium ||
        language_code !== profile.language_code ||
        username !== profile.username
    ) {
        profile.first_name = first_name;
        profile.is_premium = is_premium || false;
        profile.language_code = language_code;
        profile.username = username;

        try {
            await updateUser(
                userId,
                first_name,
                is_premium || false,
                language_code,
                username,
            );
        } catch {
            await handleError(ctx);
            return;
        }
    }

    let name = profile.first_name;
    if (profile.username) {
        name = '@' + profile.username;
    }

    let response = `
👤 Пользователь: ${name}

👑 Ваша подписка: <b>${profile.subscription_name}</b>
`;

    if (profile.total_saving) {
        response += `\n💰 Экономия с ботом: <b>${profile.total_saving}</b>`;
    }

    if (Number(profile.referral_links_usage_count)) {
        response += `\n📣 Приглашено пользователей: <b>${profile.referral_links_usage_count}</b>\n`;
    } else {
        response += '\n😔 Нет приглашённых пользователей\n';
    }

    // TODO: make all goods counter

    if (Number(profile.promotional_codes_usage_count)) {
        response += `\n🎁 Число активных промокодов: <b>${profile.promotional_codes_usage_count}</b>\n`;
    } else {
        response += '\n🔎 Нет активных промокодов\n';
    }

    await ctx.reply(response, {
        reply_markup: MORE_ABOUT_SUBSCRIBE_INLINE_KEYBOARD,
    });
});

additional.hears(about, async (ctx) => {
    await ctx.reply(ABOUT, { reply_markup: DICTIONARY_INLINE_KEYBOARD });
});

additional.callbackQuery(dictionary, async (ctx) => {
    await ctx.answerCallbackQuery('Отправляем словарик');
    await ctx.reply(DICTIONARY, { reply_markup: INSTRUCTION_INLINE_KEYBOARD });
});

additional.hears(donation, async (ctx) => {
    await ctx.reply(DONATION);
});

additional.hears(review, async (ctx) => {
    if (!ctx.message) return;

    ctx.session.step = 'review';

    await ctx.reply(REVIEW, {
        reply_markup: BACK_TO_ADDITIONAL_KEYBOARD,
    });
});

additional.hears(support, async (ctx) => {
    await ctx.reply(SUPPORT);
});
