import pool from '../db.js';
import { Profile } from '../models/user.js';
import { Rows } from '../models/base.js';
import { ProfilePromotionalCodeData } from '../models/promotional-code.js';
import { UserSubscription } from '../models/subscription.js';
import { selectUserTimeframe } from './goods.js';
import logger from '../logger.js';

async function checkIfUserExist(userId: number) {
    const select = 'select count(*) from users where user_id = $1';

    try {
        const { rows }: Rows<{ count: string }[]> = await pool.query(select, [
            userId,
        ]);
        return Number(rows[0].count) > 0;
    } catch (error) {
        logger.error('DB | check if user exist: ' + error);
        return;
    }
}

async function addNewUser(
    userId: number,
    firstName: string,
    usedReferralLink: string,
    isPremium: boolean,
    isBot: boolean,
    username?: string,
    languageCode?: string,
) {
    const insertUser =
        'insert into users (user_id, first_name, username, language_code, is_premium, is_bot, used_referral_link) values ($1, $2, $3, $4, $5, $6, $7)';

    try {
        await pool.query(insertUser, [
            userId,
            firstName,
            username,
            languageCode,
            isPremium,
            isBot,
            usedReferralLink,
        ]);
    } catch (error) {
        logger.error('DB | add new user (insertUser): ' + error);
        return;
    }

    const insertSubscription =
        'insert into subscriptions (user_id) values ($1)';

    try {
        await pool.query(insertSubscription, [userId]);
    } catch (error) {
        logger.error('DB | add new user (insertSubscription): ' + error);
        return;
    }

    const insertUserOptions = 'insert into users_options (user_id) values ($1)';

    try {
        await pool.query(insertUserOptions, [userId]);
    } catch (error) {
        logger.error('DB | add new user (insertUserOptions): ' + error);
    }
}

async function updateUser(
    userId: number,
    firstName: string,
    isPremium: boolean,
    languageCode?: string,
    username?: string,
) {
    const update =
        'update users set first_name = $2, is_premium = $3, language_code = $4, username = $5 where user_id = $1';

    try {
        await pool.query(update, [
            userId,
            firstName,
            isPremium,
            languageCode,
            username,
        ]);
    } catch (error) {
        logger.error('DB | update user: ' + error);
    }
}

async function userProfile(userId: number) {
    const select = `select first_name
                         , username
                         , language_code
                         , is_premium
                         , total_donations
                         , total_saving
                         , (select count(*) from users where used_referral_link = u.referral_link) referral_links_usage_count
                         , (select subscription_name
                            from subscriptions_price_list price_list, subscriptions sub
                            where user_id = $1
                              and sub.subscription_id = price_list.subscription_id) subscription_name
                         , (select count(*) from promotional_codes_usage where user_id = $1) promotional_codes_usage_count
                    from users u
                    where user_id = $1`;

    try {
        const { rows }: Rows<Profile[]> = await pool.query(select, [userId]);
        return rows[0];
    } catch (error) {
        logger.error('DB | user profile: ' + error);
        return;
    }
}

async function userSubscription(userId: number) {
    const selectProfile = `select discount
                                , payment_periods_level
                                , price
                                , start_timestamp
                                , end_timestamp
                                , options.urls_limit
                                , options.timeframe
                                , subscription_name
                                , (select count(*) from goods where user_id = $1) goods_count
                        from subscriptions sub
                            , subscriptions_price_list price_list
                            , users_options options
                        where sub.subscription_id = price_list.subscription_id
                            and options.user_id = sub.user_id
                            and sub.user_id = $1`;

    let userSubscription: UserSubscription;
    try {
        const { rows }: Rows<UserSubscription[]> = await pool.query(
            selectProfile,
            [userId],
        );
        userSubscription = rows[0];
    } catch (error) {
        logger.error('DB | user subscription (selectProfile): ' + error);
        return;
    }

    const selectActivePromoCodes = `select promo.promotional_code
                                               , promo.bonus_name
                                               , promo.bonus
                                               , promo_usage.ended_at
                                          from promotional_codes promo
                                          join promotional_codes_usage promo_usage 
                                              on promo.promotional_id = promo_usage.promotional_id
                                          where promo_usage.user_id = $1`;

    let activePromotionalCodes: ProfilePromotionalCodeData[];
    try {
        const { rows }: Rows<ProfilePromotionalCodeData[]> = await pool.query(
            selectActivePromoCodes,
            [userId],
        );
        activePromotionalCodes = rows;
    } catch (error) {
        logger.error(
            'DB | user subscription (selectActivePromoCodes): ' + error,
        );
        return;
    }

    return {
        ...userSubscription,
        activePromotionalCodes,
    };
}

async function userCheckIn(userId: number) {
    const activeTimeframe = await selectUserTimeframe(userId);
    if (!activeTimeframe) {
        return;
    }

    const timeframeData = activeTimeframe.split('/');
    const times = Number(timeframeData[0]);

    let checkIn = 'current_timestamp + ';
    switch (timeframeData[1]) {
        case 'month':
            checkIn += `interval '1 month' / ${times}`;
            break;
        case 'week':
            checkIn += `interval '1 week' / ${times}`;
            break;
        case 'day':
            checkIn += `interval '1 day' / ${times}`;
            break;
        default:
            checkIn += "interval '99 year'";
    }

    return checkIn;
}

async function selectReferralLink(userId: number) {
    const select = 'select referral_link from users where user_id = $1';

    try {
        const { rows }: Rows<{ referral_link: string }[]> = await pool.query(
            select,
            [userId],
        );
        return rows[0].referral_link;
    } catch (error) {
        logger.error('DB | select referral link: ' + error);
        return;
    }
}

async function selectAllUsers() {
    const select = 'select user_id from users';

    try {
        const { rows }: Rows<{ user_id: string }[]> = await pool.query(select);
        return rows;
    } catch (error) {
        logger.error('DB | select all users ids: ' + error);
        return;
    }
}

export {
    checkIfUserExist,
    addNewUser,
    updateUser,
    userProfile,
    userSubscription,
    userCheckIn,
    selectReferralLink,
    selectAllUsers,
};
