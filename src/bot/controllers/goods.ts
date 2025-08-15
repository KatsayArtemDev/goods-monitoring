import pool from '../db.js';
import { Good } from '../models/good.js';
import { Rows } from '../models/base.js';
import { userCheckIn } from './users.js';
import logger from '../logger.js';

async function countAllUserGoods(userId: number) {
    const selectGoods = 'select count(*) from goods where user_id = $1';

    try {
        const { rows }: Rows<{ count: string }[]> = await pool.query(
            selectGoods,
            [userId],
        );

        return Number(rows[0].count);
    } catch (error) {
        logger.error('DB | count all user goods: ' + error);
        return;
    }
}

async function selectUserUrlsLimit(userId: number) {
    const selectUrls =
        'select urls_limit from users_options where user_id = $1';

    let urlsLimit = 0;
    try {
        const { rows }: Rows<{ urls_limit: number }[]> = await pool.query(
            selectUrls,
            [userId],
        );
        urlsLimit = rows[0].urls_limit;
    } catch (error) {
        logger.error('DB | select user urls limit: ' + error);
        return;
    }

    return urlsLimit;
}

async function selectUserTimeframe(userId: number) {
    const select = 'select timeframe from users_options where user_id = $1';

    let activeTimeframe = '';
    try {
        const { rows }: Rows<{ timeframe: string }[]> = await pool.query(
            select,
            [userId],
        );
        activeTimeframe = rows[0].timeframe;
    } catch (error) {
        logger.error('DB | select user timeframe: ' + error);
        return;
    }

    return activeTimeframe;
}

async function checkIfAvailableUrlsLimitReached(userId: number) {
    const userUrlsNum = await countAllUserGoods(userId);
    if (!userUrlsNum && userUrlsNum !== 0) {
        return;
    }

    if (userUrlsNum === 0) {
        return false;
    }

    const urlsLimit = await selectUserUrlsLimit(userId);
    if (!urlsLimit) {
        return;
    }

    return urlsLimit - userUrlsNum === 0;
}

async function countAvailableUrls(userId: number) {
    const userUrlsNum = await countAllUserGoods(userId);
    if (userUrlsNum === undefined) {
        return;
    }

    const urlsLimit = await selectUserUrlsLimit(userId);
    if (!urlsLimit) {
        return;
    }

    return urlsLimit - userUrlsNum;
}

async function selectGood(urlId: string) {
    const select = 'select * from goods where url_id = $1';

    let goods: Good;
    try {
        const { rows }: Rows<Good[]> = await pool.query(select, [urlId]);
        goods = rows[0];
    } catch (error) {
        logger.error('DB | select good: ' + error);
        return;
    }

    return goods;
}

async function selectAllGoods(userId: number) {
    const select = `select * from goods where user_id = $1 order by created_at`;

    try {
        const { rows }: Rows<Good[]> = await pool.query(select, [userId]);
        return rows;
    } catch (error) {
        logger.error('DB | select all goods: ' + error);
        return;
    }
}

async function selectUrlId(userId: number, url: string) {
    const select = 'select url_id from goods where user_id = $1 and url = $2';

    let urlId: string | undefined;
    try {
        const { rows }: Rows<{ url_id?: string }[] | []> = await pool.query(
            select,
            [userId, url],
        );

        if (rows.length > 0) {
            urlId = rows[0].url_id;
        }
    } catch (error) {
        logger.error('DB | select url id: ' + error);
        return;
    }

    return urlId;
}

async function addNewGood(userId: number, platform: string, url: string) {
    const checkIn = await userCheckIn(userId);
    if (!checkIn) {
        return;
    }

    const insert = `insert into goods (user_id, platform, url, check_in) values ($1, $2, $3, ${checkIn}) returning url_id, created_at, check_in`;

    try {
        const {
            rows,
        }: Rows<{ url_id: string; created_at: Date; check_in: Date }[]> =
            await pool.query(insert, [userId, platform, url]);

        return rows[0];
    } catch (error) {
        logger.error('DB | add new good: ' + error);
        return;
    }
}

async function selectTimeNeededGoods() {
    const select =
        "select * from goods where check_in <= current_timestamp + interval '30 minutes'";

    try {
        const { rows }: Rows<Good[]> = await pool.query(select);
        return rows;
    } catch (error) {
        logger.error('DB | select time needed goods: ' + error);
        return;
    }
}

async function updateGoodCheckInAndUpdatedAt(
    userId: number,
    urlId: string,
    updatedAt: Date,
) {
    const checkIn = await userCheckIn(userId);
    if (!checkIn) {
        return;
    }

    const update = `update goods set check_in = ${checkIn}, updated_at = $2 where url_id = $1`;

    try {
        await pool.query(update, [urlId, updatedAt]);
    } catch (error) {
        logger.error('DB | update good check in: ' + error);
    }
}

async function removeGood(urlId: string) {
    const remove = 'delete from goods where url_id = $1';

    try {
        await pool.query(remove, [urlId]);
    } catch (error) {
        logger.error('DB | remove good: ' + error);
    }
}

export {
    checkIfAvailableUrlsLimitReached,
    countAvailableUrls,
    selectGood,
    selectAllGoods,
    selectUrlId,
    addNewGood,
    selectUserUrlsLimit,
    selectUserTimeframe,
    selectTimeNeededGoods,
    updateGoodCheckInAndUpdatedAt,
    removeGood,
};
