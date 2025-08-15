import { pino, destination } from 'pino';
import { formatTime } from './libs/formatting.js';

const logger = pino(
    {
        timestamp: () => `,"time":"${formatTime(new Date())}"`,
        base: { pid: undefined },
    },
    destination('./logs/goods-monitoring.log'),
);

export default logger;
