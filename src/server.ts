import 'dotenv/config';
import botInit from './bot/init.js';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    throw new Error('Bot token not specified');
}

void botInit(BOT_TOKEN);
