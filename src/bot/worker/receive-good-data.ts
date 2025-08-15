import {
    findCheaperWildberries,
    getWildberriesData,
} from '../receiving-data/platforms/wildberries.js';
import {
    findCheaperLabirint,
    getLabirintData,
} from '../receiving-data/platforms/labirint.js';
import { FindCheaperData, NewGoodDataReceived } from '../models/good.js';
import {
    findCheaperLitres,
    getLitresData,
} from '../receiving-data/platforms/litres.js';
import {
    findCheaperVseinstrumenti,
    getVseinstrumentiData,
} from '../receiving-data/platforms/vseinstrumenti.js';
import {
    findCheaperPoryadok,
    getPoryadokData,
} from '../receiving-data/platforms/poryadok.js';

interface PlatformData {
    single: (url: string) => Promise<NewGoodDataReceived | undefined>;
    findCheaper: (
        category: string,
        search: string,
    ) => Promise<FindCheaperData | undefined>;
}

const platformDataRetrievalFunctions: Record<string, PlatformData> = {
    wildberries: {
        single: getWildberriesData,
        findCheaper: findCheaperWildberries,
    },
    labirint: {
        single: getLabirintData,
        findCheaper: findCheaperLabirint,
    },
    litres: {
        single: getLitresData,
        findCheaper: findCheaperLitres,
    },
    vseinstrumenti: {
        single: getVseinstrumentiData,
        findCheaper: findCheaperVseinstrumenti,
    },
    poryadok: {
        single: getPoryadokData,
        findCheaper: findCheaperPoryadok,
    },
};

export function receiveCheaperGoodData(
    platform: string,
    category: string,
    search: string,
) {
    if (platform in platformDataRetrievalFunctions) {
        return platformDataRetrievalFunctions[platform].findCheaper(
            category,
            search,
        );
    }

    return;
}

export async function receiveNewGoodData(platform: string, url: string) {
    if (platform in platformDataRetrievalFunctions) {
        return platformDataRetrievalFunctions[platform].single(url);
    }

    return;
}
