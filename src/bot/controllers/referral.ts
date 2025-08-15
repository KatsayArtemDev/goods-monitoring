import { Rows } from '../models/base.js';
import { Referral } from '../models/referral.js';
import pool from '../db.js';
import logger from '../logger.js';

async function selectReferralLinkOwner(referralLink: string) {
    const select =
        'select user_id, username, first_name from users where referral_link = $1';

    try {
        const { rows }: Rows<Referral[]> = await pool.query(select, [
            referralLink,
        ]);
        return rows[0];
    } catch (error) {
        logger.error('DB | select referral link owner: ' + error);
        return;
    }
}

export { selectReferralLinkOwner };
