import {
    fetchFindCheaper,
    fetchSingle,
    FindCheaperParameters,
    SingleParameters,
} from '../browser-page.js';

const PARAMETERS = {
    css: `
        [data-qa="full-header"], [id^="adfox"], .tooltip, [show-popular-categories="true"], [show-header=""] {
            display: none;
        }
    `,
};

function convertPrice(salePrice: string | undefined) {
    if (salePrice) {
        return Number(salePrice.replace(/\D/g, ''));
    }

    return null;
}

async function getVseinstrumentiData(url: string) {
    const parameters: SingleParameters = {
        selectorName: '[data-qa="get-product-title"]',
        selectorPrice: '[data-qa="price-now"]',
        ...PARAMETERS,
    };

    const browserData = await fetchSingle(url, parameters);
    if (!browserData) {
        return;
    }

    return {
        name: browserData.name.trim(),
        sale_price: convertPrice(browserData.salePrice),
        screenshot: browserData.screenshot,
    };
}

async function findCheaperVseinstrumenti(_: string, search: string) {
    const url = `https://www.vseinstrumenti.ru/search/?what=${search}`;

    const parameters: FindCheaperParameters = {
        selectorNotFound: '[data-qa="search-phrase"]',
        selectorLink: 'a[data-qa="product-name"]',
        selectorName: 'a[data-qa="product-name"] > span',
        selectorPrice: '[data-qa="product-price-current"]',
        ...PARAMETERS,
    };

    const browserData = await fetchFindCheaper(url, parameters);
    if (!browserData) {
        return;
    }

    const { name, salePrice, link, screenshot } = browserData;

    return {
        url,
        platform: 'vseinstrumenti',
        link,
        name: name.trim(),
        sale_price: convertPrice(salePrice),
        screenshot,
    };
}

export { getVseinstrumentiData, findCheaperVseinstrumenti };
