import {
    selectTimeNeededGoods,
    updateGoodCheckInAndUpdatedAt,
} from '../controllers/goods.js';
import { Api, InputFile } from 'grammy';
import { receiveNewGoodData } from './receive-good-data.js';
import { formatPrice, formatTime } from '../libs/formatting.js';
import logger from '../logger.js';
import { Good } from '../models/good.js';
import updateData from './update-data.js';

async function executeSingle(good: Good) {
    const newGoodData = await receiveNewGoodData(good.platform, good.url);

    try {
        await updateGoodCheckInAndUpdatedAt(
            Number(good.user_id),
            good.url_id,
            new Date(),
        );
    } catch (error) {
        return;
    }

    if (!newGoodData) {
        return;
    }

    const firstGoodData = await updateData(good.url_id, newGoodData);

    if (
        !firstGoodData ||
        !newGoodData.sale_price ||
        !firstGoodData.sale_price
    ) {
        return;
    }

    const firstScreenshot = new InputFile(firstGoodData.screenshot);
    const newScreenshot = new InputFile(newGoodData.screenshot);

    const caption = `
📋 <b>${newGoodData.name}</b>

<b><u>Обновление</u></b>
├ 💰 Цена: <b>${formatPrice(firstGoodData.sale_price)} → ${formatPrice(newGoodData.sale_price)}</b>
├ 📉 Разница в цене: <b>${formatPrice(newGoodData.sale_price - firstGoodData.sale_price)}</b>
└ ⌛️ Дата обновления: ${formatTime(good.check_in)}

🌐 <a href="${good.url}">Ссылка товара на ${good.platform}</a>
`;
    return { firstScreenshot, newScreenshot, caption };
}

export default async function executableUrls(api: Api) {
    const goods = await selectTimeNeededGoods();
    if (!goods) {
        return;
    }

    if (goods.length === 0) {
        return;
    }

    for (const good of goods) {
        const checkIn = new Date(good.check_in).getTime();
        const currentTime = new Date().getTime();
        let timeDifference = checkIn - currentTime;

        if (timeDifference < 0) {
            logger.warn('good viewing has expired | good id: ' + good.url_id);
            timeDifference = 7000;
        }

        setTimeout(async () => {
            const data = await executeSingle(good);
            if (!data) {
                return;
            }

            await api.sendMediaGroup(good.user_id, [
                {
                    media: data.firstScreenshot,
                    type: 'photo',
                    caption: data.caption,
                    parse_mode: 'HTML',
                },
                { media: data.newScreenshot, type: 'photo' },
            ]);
        }, timeDifference - 5000);
    }
}
