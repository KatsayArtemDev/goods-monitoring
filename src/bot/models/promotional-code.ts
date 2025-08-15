export type BonusName = 'discount' | 'timeframe' | 'urls';

export interface PromotionalCode {
    promotional_id: number;
    promotional_code: string;
    bonus_name: BonusName;
    bonus: string;
    is_for_new: boolean;
    created_at: Date;
    ended_at: Date;
    total_usage: number;
    usage_limit: number;
    duration_in_days: number;
}

export interface ProfilePromotionalCodeData {
    promotional_code: string;
    bonus_name: BonusName;
    bonus: string;
    ended_at: Date;
}
