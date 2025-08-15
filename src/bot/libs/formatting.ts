function formatTime(dateTime: Date, options?: Intl.DateTimeFormatOptions) {
    if (!options) {
        options = {
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        };
    }

    return new Intl.DateTimeFormat('ru-RU', options).format(dateTime);
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(price);
}

export { formatTime, formatPrice };
