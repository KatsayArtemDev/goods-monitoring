export default function convertPaymentPeriodsLevel(
    paymentPeriodsLevel: number,
) {
    let ruPaymentLevel = 'месяц';

    if (paymentPeriodsLevel === 2) {
        ruPaymentLevel = 'полгода';
    }

    if (paymentPeriodsLevel === 3) {
        ruPaymentLevel = 'год';
    }

    return ruPaymentLevel;
}
