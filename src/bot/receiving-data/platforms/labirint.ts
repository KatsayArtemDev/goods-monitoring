import { NewGoodDataReceived } from '../../models/good.js';
import {
    fetchFindCheaper,
    fetchSingle,
    FindCheaperParameters,
    SingleParameters,
} from '../browser-page.js';

const PARAMETERS = {
    css: `
        body {
            width: 100% !important;
        }
        .top-header, .cookie-policy {
            display: none;
        }
        .top-margin {
            margin: 0
        }
    `,
};

async function getLabirintData(url: string) {
    const parameters: SingleParameters = {
        waitForSelector: '.book-img-cover',
        selectorName: '#product-title > h1',
        selectorPrice: '.buying-price-val-number',
        secondSelectorPrice: '.buying-pricenew-val-number',
        ...PARAMETERS,
    };

    const browserData = await fetchSingle(url, parameters);
    if (!browserData) {
        return;
    }

    let sale_price: number | null = null;
    if (browserData.salePrice) {
        sale_price = Number(browserData.salePrice);
    }

    const res: NewGoodDataReceived = {
        name: browserData.name,
        sale_price,
        screenshot: browserData.screenshot,
    };

    return res;
}

async function findCheaperLabirint(_: string, search: string) {
    const url = `https://www.labirint.ru/search/${search}/?stype=0`;

    const parameters: FindCheaperParameters = {
        selectorNotFound: '.search-error',
        selectorLink: 'a.product-card__name',
        selectorName: 'a.product-card__name',
        selectorPrice: '.product-card__price-current',
        isSimilarGoodsAfterSearch: true,
        ...PARAMETERS,
    };

    const browserData = await fetchFindCheaper(url, parameters);
    if (!browserData) {
        return;
    }

    const { name, salePrice, link, screenshot } = browserData;

    let sale_price: number | null = null;
    if (salePrice) {
        sale_price = Number(salePrice.replace(/\D/g, ''));
    }

    return {
        url,
        platform: 'labirint',
        link: `https://www.labirint.ru${link}`,
        name: name.trim(),
        sale_price,
        screenshot,
    };
}

export { getLabirintData, findCheaperLabirint };
