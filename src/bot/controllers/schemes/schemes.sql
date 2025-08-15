create database goods_monitoring
;

set timezone to 'UTC'
;

show timezone;

create extension if not exists "uuid-ossp"
;

-- TODO: Сделать табличку с выпавшими из проверки из-за ошибок страниц и тех, которые не получилось скачать (из доступно списка)

create table users(
    user_id bigint not null,
--     is_blocked
    first_name varchar(255) not null,
    username varchar(255) unique,
    language_code varchar(255),
    is_premium boolean,
    is_bot bool not null default false,
    started_at timestamp with time zone,
    total_donations integer default 0,
    total_saving integer default 0,
    referral_link varchar(5) default substring(md5(random()::text), 1, 5),
    used_referral_link varchar(5),
    is_promo_used bool not null default false,
    primary key (user_id, referral_link)
)
;

create table users_payments(
    user_id bigint not null,
    subscription_id integer not null,
    urls_limit integer not null,
    timeframe varchar(255) not null,
    discount integer,
    price integer not null,
    paid_at timestamp default current_timestamp,
    start_timestamp timestamp with time zone,
    end_timestamp timestamp with time zone,
    timestamp_price_level integer not null default 0
);

-- TODO: объединить user_id в массив, чтобы одни и те же ссылки не копились в бд
create table goods(
    user_id bigint not null,
    url_id uuid default uuid_generate_v4(),
    platform varchar(255),
    url text not null,
    created_at timestamp default current_timestamp,
    check_in timestamp with time zone not null,
    updated_at timestamp default current_timestamp,
    primary key (url_id)
)
;

create table first_goods_data(
    url_id uuid not null,
    sale_price integer,
    screenshot bytea not null,
    primary key (url_id)
)
;

create table new_goods_data(
    url_id uuid not null,
    sale_price integer,
    name text not null,
    screenshot bytea,
    primary key (url_id)
)
;

create table subscriptions(
    user_id bigint not null,
    subscription_id integer default 1,
    start_timestamp timestamp with time zone,
    end_timestamp timestamp with time zone,
    payment_periods_level integer not null default 0,
    price integer not null default 0,
    discount integer,
    primary key (user_id)
)
;

create table users_options(
    user_id bigint not null,
    urls_limit integer not null default 3,
    timeframe varchar(255) not null default '1/day',
    primary key (user_id)
)
;

create table subscriptions_price_list(
    subscription_id serial,
    subscription_name varchar(255),
    url_id integer not null,
    timeframe_id integer not null,
    month_price integer,
    half_year_price integer,
    year_price integer,
    primary key (subscription_id)
)
;

create table urls_price_list(
    url_id serial,
    urls_limit integer not null,
    primary key (url_id)
)
;

create table timeframe_price_list(
    timeframe_id serial,
    timeframe varchar(255) not null,
    primary key (timeframe_id)
)
;

create table promotional_codes_usage(
    user_id bigint not null,
    promotional_id integer not null,
    started_at timestamp default current_timestamp,
    ended_at timestamp with time zone not null
);

create table promotional_codes(
    promotional_id serial,
    promotional_code varchar(255) not null,
    bonus_name varchar(255) not null,
    bonus varchar(255) not null,
    created_at timestamp default current_timestamp,
    ended_at timestamp with time zone,
    total_usage integer default 0,
    usage_limit integer,
    duration_in_days integer not null default 0,
    primary key (promotional_id)
)
;

create table ideas(
    user_id bigint not null,
    description text,
    created_at timestamp default current_timestamp
)
;

create table reviews(
    user_id bigint not null,
    description text,
    created_at timestamp default current_timestamp
)
;

create table interest_in_paid(
    user_id bigint not null,
    quantity integer default 1,
    created_at timestamp default current_timestamp,
    updated_at timestamp,
    primary key (user_id)
);

INSERT INTO goods (user_id, platform, url, check_in)
VALUES
    (3, 'wb', 'test', CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '20 minutes'),  -- Within 30 minutes
    (4, 'wb', 'test 2', CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '40 minutes');

select * from goods where check_in <= current_timestamp + interval '30 minute';
select current_timestamp + interval '1 week' / 2;

select first_name
     , username
     , total_donations
     , total_saving
     , (select count(*) from users where used_referral_link = u.referral_link) links_usage_count
     , (select subscription_name
        from subscriptions_price_list pl
        join subscriptions sub on sub.subscription_id = pl.subscription_id
        where user_id = 1022006478) subscription_name
from users u
where user_id = 1022006478;

select subscription_name
from subscriptions_price_list pl
join subscriptions sub on sub.subscription_id = pl.subscription_id
where user_id = 1022006478;

select (select promotional_code, bonus
        from promotional_codes
        where promotional_id = promo.promotional_id)
     , ended_at
from promotional_codes_usage promo
where user_id = 1022006478
  and ended_at > current_timestamp at time zone 'UTC'
group by ended_at, (select promotional_code, bonus
        from promotional_codes
        where promotional_id = promo.promotional_id);

select
    promo.promotional_code,
    promo.bonus,
    promo_usage.ended_at
from promotional_codes promo
join promotional_codes_usage promo_usage on promo.promotional_id = promo_usage.promotional_id
where promo_usage.user_id = 1022006478
  and promo_usage.ended_at > current_timestamp at time zone 'UTC';

update promotional_codes set total_usage = total_usage + 1 where promotional_id = 1;

select discount
     , payment_periods_level
     , start_timestamp
     , end_timestamp
     , options.urls_limit
     , options.timeframe
     , subscription_name
     , (select count(*) from goods where user_id = 1022006478) goods_count
from subscriptions sub
   , subscriptions_price_list price_list
   , users_options options
where sub.subscription_id = price_list.subscription_id
  and options.user_id = sub.user_id
  and sub.user_id = 1022006478;

select count(promo.promotional_id),
       promo.promotional_id
from promotional_codes_usage promo_usage, promotional_codes promo
where user_id = 1022006478
  and promo.bonus_name = 'timeframe'
  and promo_usage.ended_at = (select min(ended_at) from promotional_codes_usage)
  and promo.promotional_id = promo_usage.promotional_id
group by promo.promotional_id;

select promo.promotional_id
from promotional_codes_usage promo_usage, promotional_codes promo
where user_id = 1022006478
  and promo.promotional_id = promo_usage.promotional_id
  and promo.bonus_name = 'timeframe';

select first_name
     , username
     , language_code
     , is_premium
     , total_donations
     , total_saving
     , (select count(*) from users where used_referral_link = u.referral_link) referral_links_usage_count
     , (select subscription_name
        from subscriptions_price_list price_list, subscriptions sub
        where user_id = 1022006478
          and sub.subscription_id = price_list.subscription_id) subscription_name
     , (select count(*) from promotional_codes_usage where user_id = 1022006478) promotional_codes_usage_count
from users u
where user_id = 1022006478;