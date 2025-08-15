import { Browser, Page, Response } from 'playwright';
import { getBrowser } from '../browser.js';
import logger from '../logger.js';

export interface BrowserParameters {
    css?: string;
    cookies?: {
        name: string;
        value: string;
        domain: string;
        path: string;
        secure?: boolean;
    }[];
    clickSelector?: string;
    waitForSelector?: string;
    waitForTimeout?: number;
}

export interface SingleParameters extends BrowserParameters {
    selectorName: string;
    secondSelectorName?: string;
    selectorPrice: string;
    secondSelectorPrice?: string;
}

export interface FindCheaperParameters extends SingleParameters {
    searchData?: {
        searchText: string;
        searchInput: string;
        searchButton: string;
    };
    isSimilarGoodsAfterSearch?: boolean;
    selectorNotFound: string;
    selectorName: string;
    selectorPrice: string;
    selectorLink: string;
}

function replaceJquery(selector: string) {
    return selector
        .replace(/:contains\(("?)(.+?)("?)\)/g, ':has-text("$2")')
        .replace(/:not\("(.+?)"\)/g, ':not($1)');
}

async function getElementInnerHTML(
    page: Page,
    selector: string,
    timeout?: number,
) {
    try {
        const pageAfterWait = await page.waitForSelector(selector, {
            timeout: timeout || 2500,
        });
        return await pageAfterWait.innerHTML();
    } catch {
        return;
    }
}

async function clickOnElement(page: Page, selector: string) {
    try {
        const element = await page.waitForSelector(selector, {
            timeout: 1000,
        });
        await element.click();
    } catch {
        return;
    }
}

async function fetchSingleElementsData(
    page: Page,
    parameters: SingleParameters,
) {
    const {
        selectorName,
        selectorPrice,
        secondSelectorName,
        secondSelectorPrice,
    } = parameters;

    let name = await getElementInnerHTML(page, selectorName);
    if (!name && secondSelectorName) {
        name = await getElementInnerHTML(page, secondSelectorName);
    }

    let salePrice = await getElementInnerHTML(page, selectorPrice);
    if (!salePrice && secondSelectorPrice) {
        salePrice = await getElementInnerHTML(page, secondSelectorPrice);
    }

    return { name, salePrice };
}

async function fetchGroupElementsData(
    page: Page,
    parameters: FindCheaperParameters,
) {
    const {
        isSimilarGoodsAfterSearch,
        selectorName,
        selectorNotFound,
        selectorPrice,
        selectorLink,
    } = parameters;

    const name = await getElementInnerHTML(page, selectorName, 1500);
    if (isSimilarGoodsAfterSearch || !name) {
        const isNotFound = Boolean(
            await getElementInnerHTML(page, selectorNotFound, 500),
        );
        if (isNotFound || !name) {
            return true;
        }
    }

    const salePrice = await getElementInnerHTML(page, selectorPrice, 500);
    const link = await page.locator(selectorLink).first().getAttribute('href');
    if (!link) {
        return;
    }

    return { name, salePrice, link };
}

async function addParameters(page: Page, parameters: BrowserParameters) {
    const { waitForTimeout, waitForSelector, css } = parameters;

    if (waitForTimeout) {
        await page.waitForTimeout(waitForTimeout);
    }

    if (waitForSelector) {
        await page.waitForSelector(waitForSelector);
    }

    if (css) {
        await page.addStyleTag({ content: css });
    }
}

async function openUrl(page: Page, url: string) {
    let response;
    try {
        response = await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.startsWith('page.goto: net::ERR_ABORTED')
        ) {
            await page.waitForTimeout(5000);
        }

        logger.error('browser could not open the url: ' + error);
    }

    if (response === null) {
        logger.error('response page goto equal null');
        return;
    }

    return response;
}

async function browserPage(url: string, parameters: BrowserParameters) {
    const newBrowser: Browser = getBrowser();

    const context = await newBrowser.newContext({
        userAgent:
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    });

    if (parameters.cookies) {
        await context.addCookies(parameters.cookies);
    }

    const page = await context.newPage();

    const response = await openUrl(page, url);
    if (!response) {
        await page.close();
        return;
    }

    await addParameters(page, parameters);

    if (parameters.clickSelector) {
        await clickOnElement(page, parameters.clickSelector);
    }

    return { page, response };
}

async function searchByInput(
    page: Page,
    selectorSearchInput: string,
    searchText: string,
    selectorSearchButton: string,
) {
    await page.locator(selectorSearchInput).first().fill(searchText);
    await page.locator(selectorSearchButton).click();
    await page.waitForTimeout(1500);
}

async function selectDataFromSingleCard(
    page: Page,
    response: Response,
    url: string,
    parameters: SingleParameters,
) {
    parameters.selectorName = replaceJquery(parameters.selectorName);
    parameters.selectorPrice = replaceJquery(parameters.selectorPrice);

    const { name, salePrice } = await fetchSingleElementsData(page, parameters);

    if (!name) {
        const status = response.status();
        logger.error(
            `browser could not fetch the page | status: ${status} | url: ${url}`,
        );

        await page.close();
        return;
    }

    const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: 70,
    });

    await page.close();

    if (!salePrice) {
        return { name, salePrice: undefined, screenshot };
    }

    return { name, salePrice, screenshot };
}

async function fetchSingle(url: string, parameters: SingleParameters) {
    const pageData = await browserPage(url, parameters);
    if (!pageData) {
        return;
    }

    const { page, response } = pageData;

    return await selectDataFromSingleCard(page, response, url, parameters);
}

async function fetchFindCheaper(
    url: string,
    parameters: FindCheaperParameters,
) {
    const pageData = await browserPage(url, parameters);
    if (!pageData) {
        return;
    }

    const { page, response } = pageData;

    if (parameters.searchData) {
        const { searchText, searchInput, searchButton } = parameters.searchData;
        await searchByInput(page, searchInput, searchText, searchButton);
    }

    parameters.selectorNotFound = replaceJquery(parameters.selectorNotFound);
    parameters.selectorName = replaceJquery(parameters.selectorName);
    parameters.selectorPrice = replaceJquery(parameters.selectorPrice);
    parameters.selectorLink = replaceJquery(parameters.selectorLink);

    const data = await fetchGroupElementsData(page, parameters);
    if (!data) {
        const status = response.status();
        logger.error(
            `browser could not fetch the page for search | status: ${status} | url: ${url}`,
        );
    }

    if (!data || data === true) {
        await page.close();
        return;
    }

    const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: 70,
    });

    await page.close();

    return { ...data, screenshot };
}

export { fetchSingle, fetchFindCheaper };
