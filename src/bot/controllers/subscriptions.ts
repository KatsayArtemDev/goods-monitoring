import pool from '../db.js';
import { Rows } from '../models/base.js';
import {
    removeReplacedPromo,
    removeReplacedTimeframeIfExist,
} from './routes.js';
import { selectUserTimeframe, selectUserUrlsLimit } from './goods.js';
import logger from '../logger.js';

async function updateUserDiscount(userId: number, discount: number) {
    const select = 'select discount from subscriptions where user_id = $1';

    let userDiscount = 0;
    try {
        const { rows }: Rows<{ discount: number }[]> = await pool.query(
            select,
            [userId],
        );
        userDiscount = rows[0].discount;
    } catch (error) {
        logger.error('DB | update user discount (select): ' + error);
        return;
    }

    if (userDiscount > discount) {
        return 'more';
    }

    if (userDiscount === discount) {
        return 'equal';
    }

    if (userDiscount !== 0) {
        try {
            await removeReplacedPromo(userId);
        } catch {
            return;
        }
    }

    const update = 'update subscriptions set discount = $2 where user_id = $1';

    try {
        await pool.query(update, [userId, discount]);
    } catch (error) {
        logger.error('DB | update user discount (update): ' + error);
        return;
    }

    return 'less';
}

async function updateUserUrlsLimit(userId: number, bonusUrlsLimit: number) {
    const currentUrlsLimit = await selectUserUrlsLimit(userId);
    if (!currentUrlsLimit) {
        return;
    }

    const update =
        'update users_options set urls_limit = $2 where user_id = $1';

    const updUrlsLimit = currentUrlsLimit + bonusUrlsLimit;
    try {
        await pool.query(update, [userId, updUrlsLimit]);
    } catch (error) {
        logger.error('DB | update user urls limit: ' + error);
        return;
    }

    return updUrlsLimit;
}

async function updateUserTimeframe(userId: number, bonusTimeframe: string) {
    const activeTimeframe = await selectUserTimeframe(userId);
    if (!activeTimeframe) {
        return;
    }

    const selectTimeframeId =
        'select timeframe_id from timeframe_price_list where timeframe = $1';

    let activeTimeframeLevel = 0;
    try {
        const { rows }: Rows<{ timeframe_id: number }[]> = await pool.query(
            selectTimeframeId,
            [activeTimeframe],
        );
        activeTimeframeLevel = rows[0].timeframe_id;
    } catch (error) {
        logger.error(
            'DB | update user timeframe (selectTimeframeId): ' + error,
        );
        return;
    }

    const selectBonusTimeframe =
        'select timeframe_id from timeframe_price_list where timeframe = $1';

    let bonusTimeframeLevel = 0;
    try {
        const { rows }: Rows<{ timeframe_id: number }[]> = await pool.query(
            selectBonusTimeframe,
            [bonusTimeframe],
        );
        bonusTimeframeLevel = rows[0].timeframe_id;
    } catch (error) {
        logger.error(
            'DB | update user timeframe (selectBonusTimeframe): ' + error,
        );
        return;
    }

    if (activeTimeframeLevel > bonusTimeframeLevel) {
        return 'more';
    }

    if (activeTimeframeLevel === bonusTimeframeLevel) {
        return 'equal';
    }

    try {
        await removeReplacedTimeframeIfExist(userId);
    } catch {
        return;
    }

    const update = 'update users_options set timeframe = $2 where user_id = $1';

    try {
        await pool.query(update, [userId, bonusTimeframe]);
    } catch (error) {
        logger.error('DB | update user timeframe (update): ' + error);
        return;
    }

    return 'less';
}

async function checkIfUserWasInterestedInPaid(userId: number) {
    const select = 'select count(*) from interest_in_paid where user_id = $1';

    try {
        const { rows }: Rows<{ count: string }[]> = await pool.query(select, [
            userId,
        ]);
        return Number(rows[0].count) > 0;
    } catch (error) {
        logger.error('DB | check if user was interested in paid: ' + error);
        return;
    }
}

async function addNewInterestedInPaidUser(userId: number) {
    const insert = 'insert into interest_in_paid (user_id) values ($1)';

    try {
        await pool.query(insert, [userId]);
    } catch (error) {
        logger.error('DB | add new interested in paid user: ' + error);
    }
}

async function updateCounterInterestedInPaidUser(userId: number) {
    const updateAt = new Date();
    const insert =
        'update interest_in_paid set quantity = quantity + 1, updated_at = $2 where user_id = $1';

    try {
        await pool.query(insert, [userId, updateAt]);
    } catch (error) {
        logger.error('DB | add new interested in paid user: ' + error);
    }
}

export {
    updateUserDiscount,
    updateUserUrlsLimit,
    updateUserTimeframe,
    checkIfUserWasInterestedInPaid,
    addNewInterestedInPaidUser,
    updateCounterInterestedInPaidUser,
};
