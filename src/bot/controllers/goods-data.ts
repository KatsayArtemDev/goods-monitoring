import pool from '../db.js';
import { FirstGoodData, NewGoodData } from '../models/good.js';
import { Rows } from '../models/base.js';
import logger from '../logger.js';

async function createFirstGoodData(firstGoodData: FirstGoodData) {
    const insertNewData =
        'insert into first_goods_data (url_id, sale_price, screenshot) values ($1, $2, $3)';

    try {
        await pool.query(insertNewData, Object.values(firstGoodData));
    } catch (error) {
        logger.error('DB | create first good data: ' + error);
    }
}

async function createNewGoodData(urlId: string, name: string) {
    const insertNewData =
        'insert into new_goods_data (url_id, name) values ($1, $2)';

    try {
        await pool.query(insertNewData, [urlId, name]);
    } catch (error) {
        logger.error('DB | create new good data: ' + error);
    }
}

async function selectFirstGoodData(urlId: string) {
    const select = 'select * from first_goods_data where url_id = $1';

    try {
        const { rows }: Rows<FirstGoodData[]> = await pool.query(select, [
            urlId,
        ]);
        return rows[0];
    } catch (error) {
        logger.error('DB | select first good data: ' + error);
        return;
    }
}

async function selectNewGoodData(urlId: string) {
    const select = 'select * from new_goods_data where url_id = $1';

    try {
        const { rows }: Rows<NewGoodData[]> = await pool.query(select, [urlId]);
        return rows[0];
    } catch (error) {
        logger.error('DB | select new good data: ' + error);
        return;
    }
}

async function selectNewGoodsData(urlIds: string[]) {
    const select = 'select * from new_goods_data where url_id = any($1)';

    try {
        const { rows }: Rows<NewGoodData[]> = await pool.query(select, [
            urlIds,
        ]);
        return rows;
    } catch (error) {
        logger.error('DB | select new goods data: ' + error);
        return;
    }
}

async function selectFirstGoodsData(urlIds: string[]) {
    const select = 'select * from first_goods_data where url_id = any($1)';

    try {
        const { rows }: Rows<FirstGoodData[]> = await pool.query(select, [
            urlIds,
        ]);
        return rows;
    } catch (error) {
        logger.error('DB | select first goods data: ' + error);
        return;
    }
}

async function updateFirstGoodData(firstGoodData: FirstGoodData) {
    const update =
        'update first_goods_data set sale_price = $2, screenshot = $3 where url_id = $1';

    try {
        await pool.query(update, Object.values(firstGoodData));
    } catch (error) {
        logger.error('DB | update first good data: ' + error);
    }
}

async function updateNewGoodData(newGoodData: NewGoodData) {
    const update =
        'update new_goods_data set sale_price = $2, screenshot = $3, name = $4 where url_id = $1';

    try {
        await pool.query(update, Object.values(newGoodData));
    } catch (error) {
        logger.error('DB | update new good data: ' + error);
    }
}

async function removeFirstGoodData(urlId: string) {
    const remove = 'delete from first_goods_data where url_id = $1';

    try {
        await pool.query(remove, [urlId]);
    } catch (error) {
        logger.error('DB | remove first good data: ' + error);
    }
}

async function removeNewGoodData(urlId: string) {
    const remove = 'delete from new_goods_data where url_id = $1';

    try {
        await pool.query(remove, [urlId]);
    } catch (error) {
        logger.error('DB | remove new good data: ' + error);
    }
}

async function clearNewGoodData(urlId: string) {
    const remove =
        'update new_goods_data set sale_price = null, screenshot = null where url_id = $1';

    try {
        await pool.query(remove, [urlId]);
    } catch (error) {
        logger.error('DB | clear new good data: ' + error);
    }
}

export {
    createFirstGoodData,
    createNewGoodData,
    selectFirstGoodData,
    selectNewGoodData,
    selectFirstGoodsData,
    selectNewGoodsData,
    updateFirstGoodData,
    updateNewGoodData,
    removeFirstGoodData,
    removeNewGoodData,
    clearNewGoodData,
};
