const ALL_CATEGORIES = ['Книги', 'Дом и ремонт'];
const ALL_PLATFORMS = [
    'wildberries',
    'labirint',
    'litres',
    'vseinstrumenti',
    'poryadok',
];

const CATEGORIES = [
    // { name: 'Электроника', platforms: ['wildberries'] },
    { name: 'Книги', platforms: ['wildberries', 'labirint', 'litres'] },
    // { name: 'Одежда и обувь', platforms: ['wildberries'] },
    {
        name: 'Дом и ремонт',
        platforms: ['wildberries', 'vseinstrumenti', 'poryadok'],
    },
];

export { ALL_CATEGORIES, ALL_PLATFORMS, CATEGORIES };
