interface Pattern {
    domain: string;
    topDomain: '.ru';
    subdomain?: string;
    isQueryImportant?: boolean;
    regExp: RegExp;
    secondRegExp?: RegExp;
}

const PATTERNS: Pattern[] = [
    {
        domain: 'wildberries',
        topDomain: '.ru',
        regExp: /www\.wildberries\.ru\/catalog\/\d+\/detail.aspx/,
    },
    // {
    //     domain: 'ozon',
    //     topDomain: '.ru',
    //     subdomain: 'www',
    //     regExp: '^(https?:\\/\\/)?(?:www\\.)?ozon\\.ru\\/product\\/[a-zA-Z0-9%_-]+\\/?(?:\\?.*)?$',
    //     secondRegExp: '^(https?:\\/\\/)?ozon\\.ru\\/t\\/[a-zA-Z0-9]{7}$',
    // },
    {
        domain: 'litres',
        topDomain: '.ru',
        regExp: /www\.litres\.ru\/(audiobook|book)\/[a-z0-9-]+\/[a-zA-Z0-9%_-]+/,
        secondRegExp: /litres\.ru\/\d+/,
    },
    {
        domain: 'labirint',
        topDomain: '.ru',
        regExp: /www\.labirint\.ru\/books\/\d+/,
    },
    {
        domain: 'vseinstrumenti',
        topDomain: '.ru',
        regExp: /www\.vseinstrumenti\.ru\/product\/[a-zA-Z0-9%_-]+/,
    },
    {
        domain: 'poryadok',
        topDomain: '.ru',
        regExp: /(?:[a-z]+\.)?poryadok\.ru\/catalog\/[a-zA-Z0-9%_-]+\/\d+/,
    },
];

const REG_EXP_URL_PATTERN = /(https?:\/\/\S+)/g;

export { Pattern, PATTERNS, REG_EXP_URL_PATTERN };
