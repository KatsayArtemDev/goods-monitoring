import {
    fetchFindCheaper,
    fetchSingle,
    FindCheaperParameters,
    SingleParameters,
} from '../browser-page.js';
import { NewGoodDataReceived } from '../../models/good.js';

const PARAMETERS = {
    css: `
        .cookies, header {
            display: none;
        }
    `,
    waitForTimeout: 1500,
};

function convertPrice(salePrice: string | undefined) {
    if (salePrice) {
        return Number(salePrice.split('&nbsp;').join('').trim().slice(0, -1));
    }

    return null;
}

async function getWildberriesData(url: string) {
    const parameters: SingleParameters = {
        clickSelector: '.j-confirm',
        waitForSelector: '.slide__content',
        selectorName: '.product-page__title',
        selectorPrice: '.price-block__final-price',
        ...PARAMETERS,
    };

    const browserData = await fetchSingle(url, parameters);
    if (!browserData) {
        return;
    }

    const res: NewGoodDataReceived = {
        name: browserData.name,
        sale_price: convertPrice(browserData.salePrice),
        screenshot: browserData.screenshot,
    };

    return res;
}

async function findCheaperWildberries(category: string, search: string) {
    const url = `https://www.wildberries.ru/catalog/0/search.aspx?search=${category} ${search}`;

    const parameters: FindCheaperParameters = {
        selectorNotFound: '.not-found-search__title',
        selectorLink: 'a.product-card__link',
        selectorName: '.product-card__name',
        selectorPrice: '.price__wrap > ins',
        isSimilarGoodsAfterSearch: true,
        ...PARAMETERS,
    };

    const browserData = await fetchFindCheaper(url, parameters);
    if (!browserData) {
        return;
    }

    const { name, salePrice, link, screenshot } = browserData;

    return {
        url,
        platform: 'wildberries',
        link,
        name: name
            .replace(/<span\s*class="[^"]*"\s*>\s*\/\s*<\/span>/g, '')
            .trim(),
        sale_price: convertPrice(salePrice),
        screenshot,
    };
}

export { getWildberriesData, findCheaperWildberries };
