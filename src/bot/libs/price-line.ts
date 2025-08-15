import { formatPrice, formatTime } from './formatting.js';

function priceLineNewGood(price: number | null) {
    if (price) {
        return `💰 Цена: <b>${formatPrice(price)}</b>`;
    }

    return '😔 Товара нет в наличии';
}

function priceLineCheckGood(
    firstPrice: number | null,
    newPrice: number | null,
    created_at: Date,
    isNewScreenExist: boolean,
) {
    if (!firstPrice) {
        return `└ ⌛️ Дата добавления: ${formatTime(created_at)}

😔 Товара нет в наличии

<u>Проверка</u>`;
    }

    if (!newPrice) {
        if (isNewScreenExist) {
            return `├ 💰 Цена: <b>${formatPrice(firstPrice)}</b>
└ ⌛️ Дата добавления: ${formatTime(created_at)}

😔 Товара нет в наличии

<u>Проверка</u>`;
        } else {
            return `├ 💰 Цена: <b>${formatPrice(firstPrice)}</b>
└ ⌛️ Дата добавления: ${formatTime(created_at)}

<u>Проверка</u>`;
        }
    }

    return `├ 💰 Цена: <b>${formatPrice(firstPrice)}</b>
└ ⌛️ Дата добавления: ${formatTime(created_at)}

<u>Проверка</u>
├ 💰 Цена: <b>${formatPrice(newPrice!)}</b>`;
}

export { priceLineNewGood, priceLineCheckGood };
