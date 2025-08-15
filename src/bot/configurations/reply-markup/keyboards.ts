import { Keyboard } from 'grammy';
import {
    ADD_KEYBOARD_TEMPLATE,
    ADDITIONAL_KEYBOARD_TEMPLATE,
    BACK_KEYBOARD_TEMPLATE,
    HOME_KEYBOARD_TEMPLATE,
    SUBSCRIBE_KEYBOARD_TEMPLATE,
} from './templates.js';

const { goods, add, subscribe, additional, referral } = HOME_KEYBOARD_TEMPLATE;

// TODO: Посмотреть на .request_users
const HOME_KEYBOARD = new Keyboard()
    .text(goods)
    .text(add)
    .row()
    .text(subscribe)
    .text(additional)
    .row()
    .text(referral)
    .resized();

const { toHome, toAdd, toAdditional } = BACK_KEYBOARD_TEMPLATE;

const BACK_TO_ADDING_KEYBOARD = new Keyboard().text(toAdd).resized();

const BACK_TO_ADDITIONAL_KEYBOARD = new Keyboard().text(toAdditional).resized();

const { singleChecking, findCheaper } = ADD_KEYBOARD_TEMPLATE;

const ADD_KEYBOARD = new Keyboard()
    .text(findCheaper)
    .row()
    .text(singleChecking)
    .row()
    .text(toHome)
    .resized();

const { userSubscribe, subscribeName, promotionalCode } =
    SUBSCRIBE_KEYBOARD_TEMPLATE;

const SUBSCRIBE_KEYBOARD = new Keyboard()
    .text(userSubscribe)
    .row()
    .text(subscribeName)
    .row()
    .text(toHome)
    .text(promotionalCode)
    .resized();

const { account, about, donation, review, support } =
    ADDITIONAL_KEYBOARD_TEMPLATE;

const ADDITIONAL_KEYBOARD = new Keyboard()
    .text(account)
    .text(about)
    .row()
    .text(donation)
    .text(review)
    .row()
    .text(toHome)
    .text(support)
    .resized();

// const ADDITIONAL_INLINE_KEYBOARD = new InlineKeyboard().text(
//     ADDITIONAL_KEYBOARD_TEMPLATE.donation,
// );

export {
    HOME_KEYBOARD,
    BACK_TO_ADDING_KEYBOARD,
    BACK_TO_ADDITIONAL_KEYBOARD,
    ADD_KEYBOARD,
    SUBSCRIBE_KEYBOARD,
    ADDITIONAL_KEYBOARD,
};
