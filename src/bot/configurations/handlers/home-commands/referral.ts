import { Composer } from 'grammy';
import { MainContext } from '../../../init.js';
import { selectReferralLink } from '../../../controllers/users.js';
import { REFERRAL_KEYBOARD_TEMPLATE } from '../../reply-markup/templates.js';
import { PREPARED_REFERRAL } from '../../templates/referral.js';

export const referral = new Composer<MainContext>();

referral.callbackQuery(REFERRAL_KEYBOARD_TEMPLATE.prepared, async (ctx) => {
    await ctx.answerCallbackQuery('Отправляем сообщение');
    await ctx.reply('↓ Скопируйте сообщение ниже с приглашением ↓');

    const referralLink = await selectReferralLink(ctx.from.id);
    const link = `https://t.me/${process.env.BOT_USERNAME}?start=${referralLink}`;

    await ctx.reply(
        PREPARED_REFERRAL +
            `\n🎁 <a href="${link}">Переходя по ссылке друга</a>, <b>дополнительно получите +3 ссылки для аккаунта</b>\n\n<i>📣 Вы также можете приглашать своих друзей, чтобы увеличить лимит товаров</i>`,
    );
});
