import logger from '../../logger.js';

export default function convertTimeframe(timeframe: string) {
    const timeframeData = timeframe.split('/');
    const times = Number(timeframeData[0]);

    let ruTimeframe = '';
    switch (timeframeData[1]) {
        case 'day':
            ruTimeframe = 'день';
            break;
        case 'week':
            ruTimeframe = 'неделю';
            break;
        case 'month':
            ruTimeframe = 'месяц';
            break;
        default:
            logger.error('convert timeframe failed to recognize timeframe');
    }

    let ruTimes = ' раза в ';
    if (times === 1) {
        ruTimes = ' раз в ';
    }

    return timeframeData[0] + ruTimes + ruTimeframe;
}
