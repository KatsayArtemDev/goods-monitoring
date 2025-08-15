import {
    fetchFindCheaper,
    fetchSingle,
    FindCheaperParameters,
    SingleParameters,
} from '../browser-page.js';

const PARAMETERS = {
    css: `
        .geoip-popup, .new-user-timer {
            visibility: hidden;
        }
        #header, .gifts-band, .information-panel {
            display: none;
        }
    `,
};

function convertPrice(salePrice: string | undefined) {
    if (salePrice) {
        return Number(salePrice.replace(' ', '').match(/(\d+)/)![0]);
    }

    return null;
}

async function getPoryadokData(url: string) {
    const parameters: SingleParameters = {
        selectorName: 'h1[itemprop="name"]',
        selectorPrice: '.price',
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

async function findCheaperPoryadok(_: string, search: string) {
    const url = `https://poryadok.ru/search/?q=${search}`;

    const parameters: FindCheaperParameters = {
        selectorNotFound: '.search-page__empty-result-notification',
        selectorLink: 'a.product-tile__title',
        selectorName: 'a.product-tile__title > span',
        selectorPrice: '.product-tile__pricing-price--current',
        ...PARAMETERS,
    };

    const browserData = await fetchFindCheaper(url, parameters);
    if (!browserData) {
        return;
    }

    const { name, salePrice, link, screenshot } = browserData;

    return {
        url,
        platform: 'poryadok',
        link,
        name: name.trim(),
        sale_price: convertPrice(salePrice),
        screenshot,
    };
}

export { getPoryadokData, findCheaperPoryadok };
