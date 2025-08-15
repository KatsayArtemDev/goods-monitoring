export interface UserSubscription {
    discount: number | null;
    timeframe: string;
    urls_limit: number;
    goods_count: string;
    subscription_name: string;
    payment_periods_level: number;
    price: number;
    end_timestamp: Date | null;
}
