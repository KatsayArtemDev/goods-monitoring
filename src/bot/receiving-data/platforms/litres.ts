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
        header, [data-testid="cookieAcceptPopup"], [class^="HeaderDesktop_headerGap"], #playerPortal, [class^="Search_heading"] {
            display: none;
        }
    `,
};

function convertPrice(salePrice: string | undefined) {
    if (salePrice) {
        return Math.round(
            Number(salePrice.replace(/[^\d,]/g, '').replace(',', '.')),
        );
    }

    return null;
}

async function getLitresData(url: string) {
    const parameters: SingleParameters = {
        selectorName: 'h1[class^="BookCard_book__mainInfo__title"]',
        selectorPrice:
            '[data-testid="book-sale-block__PPD--wrapper"] [class^="SaleBlock_block__price"] strong',
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

async function findCheaperLitres(_: string, search: string) {
    const url = `https://www.litres.ru/search/?q=${search}`;

    const parameters: FindCheaperParameters = {
        selectorNotFound: 'h1[class^="SearchTitle_empty__title"]',
        selectorLink: 'a[data-testid="art__title"]',
        selectorName: 'p[class^="ArtInfo_title"]',
        selectorPrice:
            'strong[class^="ArtPriceFooter_ArtPriceFooterPrices__final"]',
        waitForTimeout: 3000,
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
        platform: 'litres',
        link: `https://www.litres.ru${link}`,
        name,
        sale_price: convertPrice(salePrice),
        screenshot,
    };
}

export { getLitresData, findCheaperLitres };
