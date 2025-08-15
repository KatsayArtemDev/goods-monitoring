import pool from '../db.js';
import { PromotionalCode } from '../models/promotional-code.js';
import { Rows } from '../models/base.js';
import logger from '../logger.js';

async function sendNewReview(user_id: number, description: string) {
    const insertGoods =
        'insert into reviews (user_id, description) values ($1, $2)';

    try {
        await pool.query(insertGoods, [user_id, description]);
    } catch (error) {
        logger.error('DB | send new review: ' + error);
    }
}

// async function sendNewIdea

async function selectPromo(promotionalCode: string) {
    const select =
        'select * from promotional_codes where promotional_code = $1';

    let promotionalCodeBody: PromotionalCode | undefined;
    try {
        const { rows }: Rows<PromotionalCode[]> = await pool.query(select, [
            promotionalCode,
        ]);
        promotionalCodeBody = rows[0];
    } catch (error) {
        logger.error('DB | select promotional code: ' + error);
    }

    if (!promotionalCodeBody) {
        return;
    }

    return promotionalCodeBody;
}

async function checkIfExpired(promotionalId: number) {
    const select =
        "select count(*) from promotional_codes where promotional_id = $1 and (ended_at is null or ended_at > current_timestamp)";

    try {
        const { rows }: Rows<{ count: string }[]> = await pool.query(select, [
            promotionalId,
        ]);
        return Number(rows[0].count) > 0;
    } catch (error) {
        logger.error('DB | check if expired: ' + error);
        return;
    }
}

async function addPromoUsedByUser(
    userId: number,
    promotionalId: number,
    durationInDays: number,
) {
    const endedAt = `current_timestamp + interval '${durationInDays} day'`;
    const insert = `insert into promotional_codes_usage (user_id, promotional_id, ended_at) values ($1, $2, ${endedAt}) returning ended_at`;

    try {
        const { rows }: Rows<{ ended_at: Date }[]> = await pool.query(insert, [
            userId,
            promotionalId,
        ]);
        return rows[0].ended_at;
    } catch (error) {
        logger.error('DB | add promotional code used by user: ' + error);
        return;
    }
}

async function checkIfPromoUsed(userId: number, promotionalId: number) {
    const select =
        'select count(*) from promotional_codes_usage where user_id = $1 and promotional_id = $2';

    try {
        const { rows }: Rows<{ count: string }[]> = await pool.query(select, [
            userId,
            promotionalId,
        ]);
        return Number(rows[0].count) > 0;
    } catch (error) {
        logger.error('DB | check if promotional code used: ' + error);
        return;
    }
}

async function selectIsPromoUsed(userId: number) {
    const select = 'select is_promo_used from users where user_id = $1';

    let isPromoUsed = false;
    try {
        const { rows }: Rows<{ is_promo_used: boolean }[]> = await pool.query(
            select,
            [userId],
        );
        isPromoUsed = rows[0].is_promo_used;
    } catch (error) {
        logger.error('DB | select is promotional code used: ' + error);
    }

    return isPromoUsed;
}

async function updateIsPromoCodeUsed(userId: number) {
    const update = 'update users set is_promo_used = true where user_id = $1';

    try {
        await pool.query(update, [userId]);
    } catch (error) {
        logger.error('DB | update is promotional code used: ' + error);
    }
}

async function updatePromoTotalUsage(promotionalId: number) {
    const update =
        'update promotional_codes set total_usage = total_usage + 1 where promotional_id = $1';

    try {
        await pool.query(update, [promotionalId]);
    } catch (error) {
        logger.error('DB | update promotional code total usage: ' + error);
    }
}

async function removeReplacedPromo(userId: number) {
    const select =
        'select promotional_id from promotional_codes_usage where user_id = $1';

    let replacedPromotionalCodeId = '';
    try {
        const { rows }: Rows<{ promotional_id: string }[]> = await pool.query(
            select,
            [userId],
        );
        replacedPromotionalCodeId = rows[0].promotional_id;
    } catch (error) {
        logger.error(
            'DB | remove replaced promotional code (select): ' + error,
        );
        return;
    }

    const remove =
        'delete from promotional_codes_usage where user_id = $1 and promotional_id = $2';
    try {
        await pool.query(remove, [userId, replacedPromotionalCodeId]);
    } catch (error) {
        logger.error(
            'DB | remove replaced promotional code (delete): ' + error,
        );
    }
}

async function removeReplacedTimeframeIfExist(userId: number) {
    const select = `select promo.promotional_id
                    from promotional_codes_usage promo_usage, promotional_codes promo
                    where user_id = $1
                      and promo.promotional_id = promo_usage.promotional_id
                      and promo.bonus_name = 'timeframe'`;

    let promotionalId: number | null;
    try {
        const { rows }: Rows<{ promotional_id: number }[]> = await pool.query(
            select,
            [userId],
        );
        promotionalId = rows[0].promotional_id;
    } catch (error) {
        logger.error(
            'DB | remove replaced timeframe if exist (select): ' + error,
        );
        return;
    }

    if (!promotionalId) {
        return;
    }

    const remove =
        'delete from promotional_codes_usage where user_id = $1 and promotional_id = $2';

    try {
        await pool.query(remove, [userId, promotionalId]);
    } catch (error) {
        logger.error(
            'DB | remove replaced timeframe if exist (delete): ' + error,
        );
        return;
    }
}

export {
    sendNewReview,
    selectPromo,
    checkIfExpired,
    checkIfPromoUsed,
    selectIsPromoUsed,
    addPromoUsedByUser,
    updateIsPromoCodeUsed,
    updatePromoTotalUsage,
    removeReplacedPromo,
    removeReplacedTimeframeIfExist,
};
