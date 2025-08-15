import { Bot, Context, session, SessionFlavor } from 'grammy';
import { parseMode } from '@grammyjs/parse-mode';
import handleStart from './configurations/handlers/start.js';
import { home } from './configurations/handlers/home.js';
import { subscribe } from './configurations/handlers/home-commands/subscribe.js';
import { back } from './configurations/handlers/back.js';
import { goods } from './configurations/handlers/home-commands/goods.js';
import { add } from './configurations/handlers/home-commands/add.js';
import { additional } from './configurations/handlers/home-commands/additional.js';
import { referral } from './configurations/handlers/home-commands/referral.js';
import { Router } from '@grammyjs/router';
import executableUrls from './worker/executable.js';
import {
    addFindCheaper,
    addSingle,
    handlePromotionalCode,
    handleReview,
} from './configurations/handlers/routes.js';
import { error } from './configurations/handlers/error.js';
import { clearCache, initializeBrowser } from './browser.js';
import logger from './logger.js';
import { handleSingle } from './worker/url.js';
// import newsletter from './newsletter/news.js';

interface SessionData {
    step: 'main' | 'review' | 'promotional_code' | 'single' | 'find_cheaper';
    timeUntilNextGettingAllGoods: number;
}
export type MainContext = Context & SessionFlavor<SessionData>;

export default async function botInit(token: string) {
    await initializeBrowser();

    const bot = new Bot<MainContext>(token);

    bot.use(
        session({
            initial: (): SessionData => ({
                step: 'main',
                timeUntilNextGettingAllGoods: 0,
            }),
        }),
    );
    const router = new Router<MainContext>((ctx) => ctx.session.step);
    bot.use(router);

    bot.catch((error) => {
        logger.error('bot caught errors: ' + error);
    });

    bot.api.config.use(parseMode('HTML'));

    bot.command('start', async (ctx) => await handleStart(ctx));

    bot.on('::url', async (ctx) => await handleSingle(ctx));

    bot.use(back);

    bot.use(home);
    bot.use(goods);
    bot.use(subscribe);
    bot.use(add);
    bot.use(additional);
    bot.use(referral);
    bot.use(error);

    const reviewRoute = router.route('review');
    reviewRoute.on('message:text', async (ctx) => await handleReview(ctx));

    const promotionalCode = router.route('promotional_code');
    promotionalCode.on(
        'message:text',
        async (ctx) => await handlePromotionalCode(ctx),
    );

    const findCheaper = router.route('find_cheaper');
    findCheaper.on('message:text', async (ctx) => await addFindCheaper(ctx));

    const single = router.route('single');
    single.on('message:text', async (ctx) => await addSingle(ctx));

    await executableUrls(bot.api);
    setInterval(
        async () => {
            await executableUrls(bot.api);

            const date = new Date();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            if (hours === 3 && minutes <= 30) {
                await clearCache();
            }
        },
        30 * 60 * 1000,
    );

    void bot.start();
    logger.info('bot is started');

    // await newsletter(bot.api);
}
