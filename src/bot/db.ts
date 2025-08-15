import pg from 'pg';
import logger from './logger.js';

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE } = process.env;

if (!DB_USER || !DB_PASSWORD || !DB_HOST || !DB_PORT || !DB_DATABASE) {
    logger.error('database configurations not specified');
}

const pool = new pg.Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_DATABASE,
    password: DB_PASSWORD,
    port: Number(DB_PORT),
    // idleTimeoutMillis: 60000
});

pool.on('error', (err) => {
    logger.error('unexpected error on idle client' + err);
});

export default pool;
