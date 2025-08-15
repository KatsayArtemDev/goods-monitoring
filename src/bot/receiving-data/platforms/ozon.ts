// import browserPage, {
//     BrowserParameters, fetchFindCheaper,
//     fetchSingle,
//     FindCheaperParameters,
//     SingleParameters,
// } from '../browser-page.js';
// import { NewGoodDataReceived } from '../../models/good.js';
//
// const domain = '.ozon.ru';
//
// const cookies: {
//     name: string;
//     value: string;
//     domain: string;
//     path: string;
//     secure?: boolean;
// }[] = [
//     {
//         name: '__Secure-access-token',
//         value: '4.0.v6tMJ_LUSqiB84lbC5t8ZQ.88.AWma2HZi0QTut3HoDzn3FRXZ9oR8EitR-G1na9NqFhnAD0GCvY0G7xidym15yQAk9Q..20240518110750.bInWyflyzbcWHA9XYH2nNymqpFJlJPCiU9GStuHeiWE',
//         domain,
//         path: '/',
//         secure: true,
//     },
//     {
//         name: 'abt_data',
//         value: '1cf22975ebe76e6ae2d930f4e520ee3c:d3fe15be05e7e0c4076381bfb5e0e6a5423e228298a5acb455402b41e48e66b29d0c28e7e8f0e8e514a06c92946b43cc16b7f9dc5101cf98b2588397181631f59bf0acbcf1d9bbc88696490d2c89ba3b2b14105ac122bf4898823c0791d2882afee60098a8fd78b6bf3cd189c485cefccc077b27d6098dcba25f57f481dd3c99fffafe1054fc0fc465b66cffd7c239cd214824b5b966a69faf293325a529bd84c0bfbf32558e7a6d1507737ab3aa371833c48fa1a3cc126eaa2af3043f681d51ed5af6b9d185d9d0a597b2cfa486a47153b8564e3916af632777e528cadcc9c3',
//         domain,
//         path: '/',
//         secure: true,
//     },
//     {
//         name: 'is_cookies_accepted',
//         value: '1',
//         domain: 'www.ozon.ru',
//         path: '/',
//     },
//     {
//         name: 'guest',
//         value: 'true',
//         domain,
//         path: '/',
//     },
//     {
//         name: 'is_adult_confirmed',
//         value: 'true',
//         domain,
//         path: '/',
//     },
//     {
//         name: 'adult_user_birthdate',
//         value: '1998-08-20',
//         domain,
//         path: '/',
//     },
//     {
//         name: 'is_alco_adult_confirmed',
//         value: 'true',
//         domain,
//         path: '/',
//     },
// ];
//
// const PARAMETERS = {
//     css: `
//         header {
//             display: none;
//         }
//         [data-widget="cookieBubble"] {
//             display: none;
//         }
//         .vue-portal-target {
//             display: none;
//         }
//         .ka {
//             display: none;
//         }
//     `,
//     cookies,
//     waitForTimeout: 2500,
// };
//
// function convertPrice(salePrice: string | undefined) {
//     if (salePrice) {
// eslint-disable-next-line no-irregular-whitespace
//         return Number(salePrice.split(' ').join('').trim().slice(0, -1));
//     }
//
//     return null;
// }
//
// async function getOzonData(url: string) {
//     const parameters: SingleParameters = {
//         selectorName: 'div[data-widget="webProductHeading"] > h1',
//         secondSelectorName: '[data-widget="webOutOfStock"] p',
//         selectorPrice:
//             '[data-widget="webPrice"] > div > div > div span:contains("₽")',
//         ...PARAMETERS,
//     };
//
//     const browserData = await fetchSingle(url, parameters);
//     if (!browserData) {
//         return;
//     }
//
//     const res: NewGoodDataReceived = {
//         name: browserData.name.trim(),
//         sale_price: convertPrice(browserData.salePrice),
//         screenshot: browserData.screenshot,
//     };
//
//     return res;
// }
//
// async function findCheaperOzon(category: string, search: string) {
//     const url = `https://www.wildberries.ru/catalog/0/search.aspx?search=${category} ${search}`;
//
//     const parameters: FindCheaperParameters = {
//         selectorNotFound: '.not-found-search__title',
//         selectorLink: 'a.product-card__link',
//         selectorName: '.product-card__name',
//         selectorPrice: '.price__wrap > ins',
//         isSimilarGoodsAfterSearch: true,
//         ...PARAMETERS,
//     };
//
//     const browserData = await fetchFindCheaper(url, parameters);
//     if (!browserData) {
//         return;
//     }
//
//     const { name, salePrice, link, screenshot } = browserData;
//
//     return {
//         url,
//         platform: 'ozon',
//         link,
//         name: name
//             .replace(/<span\s*class="[^"]*"\s*>\s*\/\s*<\/span>/g, '')
//             .trim(),
//         sale_price: convertPrice(salePrice),
//         screenshot,
//     };
// }
//
// export { getOzonData, findCheaperOzon };
