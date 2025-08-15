export interface Good {
    user_id: string;
    url_id: string;
    platform: string;
    url: string;
    created_at: Date;
    check_in: Date;
    updated_at: Date;
}

export interface BrowserNewGoodData
    extends Omit<NewGoodDataReceived, 'sale_price'> {
    salePrice: string | undefined;
}

export interface FindCheaperData extends NewGoodDataReceived {
    url: string;
    platform: string;
    link: string;
}

export interface NewGoodDataReceived extends Omit<FirstGoodData, 'url_id'> {
    name: string;
}

export interface NewGoodData extends Omit<FirstGoodData, 'screenshot'> {
    name: string;
    screenshot?: Buffer;
}

export interface FirstGoodData {
    url_id: string;
    sale_price: number | null;
    screenshot: Buffer;
}
