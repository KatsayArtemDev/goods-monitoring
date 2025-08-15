const HOME_KEYBOARD_TEMPLATE = {
    goods: '🛍 Мои товары',
    add: '📎 Добавить',
    subscribe: '👑️ Подписка',
    additional: '⚙️ Дополнительно',
    referral: '📣 Пригласить друга',
};

const BACK_KEYBOARD_TEMPLATE = {
    toHome: '⬅️ Вернуться',
    toAdd: '⬅️ Вернуться к добавлению',
    toSubscribe: '⬅️️ Вернуться к подпискам',
    toAdditional: '⬅️️ Вернуться к дополнительным',
};

const GOODS_KEYBOARD_TEMPLATE = {
    allGoods: '🛒 Все товары',
    // analytics: 'Аналитика',

    // inline Если в подписке ещё есть место для ссылок
    details: '🔍 Подробнее',
    remove: '🗑 Перестать просматривать',

    // При условии малой активности на бесплатных раздачах. Можно сделать подписки на другие каналы за платку.
    // free: 'Больше доступных товаров'
};

const ADD_KEYBOARD_TEMPLATE = {
    // Inline
    check: '🛍 Число доступных товаров',
    addAnother: '📎 Добавить другой товар',

    findCheaper: '🔎 Найти дешевле',
    singleChecking: '🛍 Один товар',

    instruction: '💡 Инструкция',
    instructionApple: '🍎 Apple',
    instructionAndroid: '🤖 Android',
};

const SUBSCRIBE_KEYBOARD_TEMPLATE = {
    userSubscribe: '⭐️ Моя подписка',
    subscribeName: '️👑 Готовые подписки',
    promotionalCode: '🎁 Ввести промокод',

    // urls: 'Ссылки',
    // timeframe: 'Проверка',
    moreAboutSubscribe: '👑 Подробнее о подписке',
    stopRenewal: '🛑 Отлючить автопродление',

    buy: '💰 Больше выгоды',
};

const READY_SUBSCRIPTION_KEYBOARD_TEMPLATE = {
    firstLevel: '🔥 Стандартная',
    secondLevel: '🌟 Расширенная',
    thirdLevel: '⚡️ Премиальная',
};

const PAYMENT_REGULARITY_KEYBOARD_TEMPLATE = {
    month: 'Месяц → 79₽',
    halfYear: 'Полгода → 399₽ (-15%)',
    year: 'Год → 759₽ (-20%)',
};

const ADDITIONAL_KEYBOARD_TEMPLATE = {
    account: '👤 Мой профиль',
    about: '⚡ О боте',
    donation: '💸 Помочь проекту',
    // idea: 'Предложить идею',
    review: '📝 Написать отзыв',
    support: '🤝️ Тех. поддержка',

    dictionary: '📖 Словарик бота',

    // Сделать канал по новым обновлениям в боте
    // channel: 'Знать всё первым'
};

const REFERRAL_KEYBOARD_TEMPLATE = {
    // inline
    prepared: '⭐️ Заготовленный текст',
};

const GOOD_LIMIT_REACHED_TEMPLATE = {
    edit: '📝 Редактировать список',
    update: '🔎 Обновить подписку',
};

export {
    HOME_KEYBOARD_TEMPLATE,
    BACK_KEYBOARD_TEMPLATE,
    GOODS_KEYBOARD_TEMPLATE,
    ADD_KEYBOARD_TEMPLATE,
    SUBSCRIBE_KEYBOARD_TEMPLATE,
    READY_SUBSCRIPTION_KEYBOARD_TEMPLATE,
    PAYMENT_REGULARITY_KEYBOARD_TEMPLATE,
    ADDITIONAL_KEYBOARD_TEMPLATE,
    REFERRAL_KEYBOARD_TEMPLATE,
    GOOD_LIMIT_REACHED_TEMPLATE,
};
