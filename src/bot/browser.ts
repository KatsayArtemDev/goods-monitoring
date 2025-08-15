import { Browser } from 'playwright';
import { chromium } from 'playwright-extra';
import logger from './logger.js';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(
    stealthPlugin({
        enabledEvasions: new Set([
            'iframe.contentWindow',
            'navigator.webdriver',
        ]),
    }),
);

let newBrowser: Browser | null = null;

export async function initializeBrowser() {
    newBrowser = await chromium.launch();
    logger.info('browser is initialized');
}

export function getBrowser() {
    if (!newBrowser) {
        throw new Error(
            'Browser not initialized. Call initializeBrowser() first',
        );
    }

    return newBrowser;
}

export async function clearCache() {
    if (newBrowser) {
        await newBrowser.close();
    }

    newBrowser = await chromium.launch();
    logger.info('browser is cleared cache');
}

process.on('exit', async () => {
    if (newBrowser) {
        await newBrowser.close();
    }
});
