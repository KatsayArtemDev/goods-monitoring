import {
    clearNewGoodData,
    selectFirstGoodData,
    selectNewGoodData,
    updateFirstGoodData,
    updateNewGoodData,
} from '../controllers/goods-data.js';
import { NewGoodDataReceived } from '../models/good.js';

export default async function updateData(
    urlId: string,
    updGoodData: NewGoodDataReceived,
) {
    const [firstGoodData, newGoodData] = await Promise.all([
        selectFirstGoodData(urlId),
        selectNewGoodData(urlId),
    ]);

    const { sale_price, name, screenshot } = updGoodData;

    if (
        !firstGoodData ||
        !newGoodData ||
        (!firstGoodData.sale_price && !sale_price)
    ) {
        return;
    }

    const updData = {
        url_id: urlId,
        sale_price,
        screenshot,
    };

    if (!firstGoodData.sale_price) {
        await updateFirstGoodData(updData);
        return;
    }

    if (
        firstGoodData.sale_price === sale_price &&
        newGoodData.sale_price &&
        newGoodData.screenshot
    ) {
        await clearNewGoodData(urlId);
        return;
    }

    if (
        (sale_price !== null && newGoodData.sale_price === sale_price) ||
        firstGoodData.sale_price === sale_price
    ) {
        return;
    }

    try {
        await updateNewGoodData({
            ...updData,
            name,
        });
    } catch {
        return;
    }

    if (!sale_price || firstGoodData.sale_price <= sale_price) {
        return;
    }

    return firstGoodData;
}
