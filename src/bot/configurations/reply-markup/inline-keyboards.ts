import {
    ADD_KEYBOARD_TEMPLATE,
    ADDITIONAL_KEYBOARD_TEMPLATE,
    GOOD_LIMIT_REACHED_TEMPLATE,
    GOODS_KEYBOARD_TEMPLATE,
    HOME_KEYBOARD_TEMPLATE,
    PAYMENT_REGULARITY_KEYBOARD_TEMPLATE,
    READY_SUBSCRIPTION_KEYBOARD_TEMPLATE,
    REFERRAL_KEYBOARD_TEMPLATE,
    SUBSCRIBE_KEYBOARD_TEMPLATE,
} from './templates.js';
import { InlineKeyboard } from 'grammy';

const { details, remove } = GOODS_KEYBOARD_TEMPLATE;

const GOODS_REMOVE_INLINE_KEYBOARD = new InlineKeyboard().text(remove, remove);

const GOODS_REMOVE_WITH_DETAILS_INLINE_KEYBOARD = new InlineKeyboard()
    .text(details, details)
    .row()
    .text(remove, remove);

const { check, instruction, instructionApple, instructionAndroid } =
    ADD_KEYBOARD_TEMPLATE;

const CHECK_AVAILABLE_URLS_INLINE_KEYBOARD = new InlineKeyboard().text(
    check,
    check,
);

const INSTRUCTION_INLINE_KEYBOARD = new InlineKeyboard().text(
    instruction,
    instruction,
);

const INSTRUCTION_DEVICE_SELECTION_INLINE_KEYBOARD = new InlineKeyboard()
    .text(instructionApple, instructionApple)
    .text(instructionAndroid, instructionAndroid);

const { prepared } = REFERRAL_KEYBOARD_TEMPLATE;

const REFERRAL_INLINE_KEYBOARD = new InlineKeyboard().text(prepared, prepared);

// const ADDITIONAL_INLINE_KEYBOARD = new InlineKeyboard().text(
//     ADDITIONAL_KEYBOARD_TEMPLATE.donation,
// );

const { moreAboutSubscribe, stopRenewal, buy } = SUBSCRIBE_KEYBOARD_TEMPLATE;

const MORE_ABOUT_SUBSCRIBE_INLINE_KEYBOARD = new InlineKeyboard().text(
    moreAboutSubscribe,
    moreAboutSubscribe,
);

const STOP_SUBSCRIPTION_RENEWAL_INLINE_KEYBOARD = new InlineKeyboard().text(
    stopRenewal,
    stopRenewal,
);

const BUY_INLINE_KEYBOARD = new InlineKeyboard().text(buy, buy);

const { edit, update } = GOOD_LIMIT_REACHED_TEMPLATE;

const GOOD_LIMIT_REACHED_INLINE_KEYBOARD = new InlineKeyboard().text(
    edit,
    edit,
);
// .text(update, update);

const { firstLevel, secondLevel, thirdLevel } =
    READY_SUBSCRIPTION_KEYBOARD_TEMPLATE;

const READY_SUBSCRIPTION_INLINE_KEYBOARD = new InlineKeyboard()
    .text(firstLevel, firstLevel)
    .row()
    .text(secondLevel, secondLevel)
    .row()
    .text(thirdLevel, thirdLevel);

const { month, halfYear, year } = PAYMENT_REGULARITY_KEYBOARD_TEMPLATE;

const TIMELINE_SUBSCRIPTION_INLINE_KEYBOARD = new InlineKeyboard()
    .text(month)
    .row()
    .text(halfYear)
    .row()
    .text(year);

const UPDATE_SUBSCRIPTION_INLINE_KEYBOARD = new InlineKeyboard().text(
    update,
    update,
);

const { add } = HOME_KEYBOARD_TEMPLATE;

const ADD_GOOD_INLINE_KEYBOARD = new InlineKeyboard().text(add, add);

const { addAnother } = ADD_KEYBOARD_TEMPLATE;

const ADD_ANOTHER_GOOD_INLINE_KEYBOARD = new InlineKeyboard().text(
    addAnother,
    addAnother,
);

const { dictionary } = ADDITIONAL_KEYBOARD_TEMPLATE;

const DICTIONARY_INLINE_KEYBOARD = new InlineKeyboard().text(
    dictionary,
    dictionary,
);

export {
    GOODS_REMOVE_INLINE_KEYBOARD,
    GOODS_REMOVE_WITH_DETAILS_INLINE_KEYBOARD,
    CHECK_AVAILABLE_URLS_INLINE_KEYBOARD,
    BUY_INLINE_KEYBOARD,
    INSTRUCTION_INLINE_KEYBOARD,
    INSTRUCTION_DEVICE_SELECTION_INLINE_KEYBOARD,
    REFERRAL_INLINE_KEYBOARD,
    MORE_ABOUT_SUBSCRIBE_INLINE_KEYBOARD,
    STOP_SUBSCRIPTION_RENEWAL_INLINE_KEYBOARD,
    GOOD_LIMIT_REACHED_INLINE_KEYBOARD,
    UPDATE_SUBSCRIPTION_INLINE_KEYBOARD,
    READY_SUBSCRIPTION_INLINE_KEYBOARD,
    TIMELINE_SUBSCRIPTION_INLINE_KEYBOARD,
    ADD_GOOD_INLINE_KEYBOARD,
    ADD_ANOTHER_GOOD_INLINE_KEYBOARD,
    DICTIONARY_INLINE_KEYBOARD,
};
