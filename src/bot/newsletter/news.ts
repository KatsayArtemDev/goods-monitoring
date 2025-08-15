import { Api, InputFile } from 'grammy';
import { selectAllUsers } from '../controllers/users.js';
import logger from '../logger.js';

export default async function newsletter(api: Api) {
    const allUsersIds = await selectAllUsers();
    if (!allUsersIds) {
        return;
    }

    const promo = new InputFile(
        './src/bot/configurations/templates/images/promo.mp4',
    );
    const caption = `
<b>купи ДЕШЕВЛЕ ⚡️ переходит на следующий уровень и становится лучшим решением для экономии!</b>

🔥 <u>Новые возможности для тех, кто не хочет ждать:</u>

<b>По одному названию бот найдёт, где купить товар дешевле уже сейчас!</b>
<i>📎 Добавить > 🔎 Найти дешевле</i>

🎁 <u>Появилась возможность получать ещё больше выгоды:</u>

<b>Подстроим бота под Вас, чтобы его использование было максимально прибыльным!</b>
<i>👑️ Подписка > 💰 Больше выгоды</i>

<b>Поддерживая проект можно ускорить выход новых платформ!</b>
<i>⚙️ Дополнительно > 💸 Помочь проекту</i>

💯 <b>Экономьте на покупках не тратя время!</b>
`;

    for (const { user_id } of allUsersIds) {
        try {
            await api.sendVideo(user_id, promo, {
                caption,
                supports_streaming: true,
            });
        } catch (error) {
            logger.error(
                `Sending newsletter | userId: ${user_id}, error: ${error}`,
            );
        }
    }
}
