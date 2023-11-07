
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."branches" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "city_id" smallint,
    "district_id" smallint,
    "addr" "text",
    "name" "text",
    "email" "text",
    "phone" "text",
    "product_id" bigint,
    "merchant_id" bigint,
    "bank_code" "text",
    "bank_account" "text",
    "bank_acc_name" "text"
);

ALTER TABLE "public"."branches" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."branches_of_merchant_user"() RETURNS SETOF "public"."branches"
    LANGUAGE "plpgsql"
    AS $$
  declare auth_merchant_id bigint;
  begin
    -- find merchant_id of authenticated user --
    select merchant_id
    into auth_merchant_id
    from merchant_user
    where merchant_user.user_id = auth.uid();

    -- calculate sum of unique buyers
    return query select *
    from branches
    where merchant_id = auth_merchant_id;
  end;
$$;

ALTER FUNCTION "public"."branches_of_merchant_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."calculate_amounts"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE 
    total_rate DECIMAL(5, 2);
    interest_rate DECIMAL(5, 2) := 0.2;
    acquirer_rate DECIMAL(5, 2) := 2.4;
    issuer_rate DECIMAL(5, 2) := 0.4;
    merchant_amount DECIMAL(10, 2);
    fee_amount DECIMAL(10, 2);
    acquirer_amount DECIMAL(10, 2);
    issuer_amount DECIMAL(10, 2);
    base_fee_amount DECIMAL(10, 2);
BEGIN
    total_rate := interest_rate + acquirer_rate + issuer_rate;

    merchant_amount := 10000 * (100 - total_rate) / 100;
    fee_amount := 10000 * total_rate / 100;
    acquirer_amount := 10000 * acquirer_rate / 100;
    issuer_amount := 10000 * issuer_rate / 100;
    base_fee_amount := 10000 * interest_rate / 100;
END;
$$;

ALTER FUNCTION "public"."calculate_amounts"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_permission"("p_table_name" "text", "p_event" "text", "is_own_row" boolean) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
 declare
 p_can_insert integer;
 p_can_update integer;
 p_can_delete integer;
 p_can_select integer;
 begin
 select p.can_insert,
 p.can_update, p.can_delete, p.can_select into p_can_insert, p_can_update, p_can_delete, p_can_select  from user_role r
  left join role_permission p on r.role = p.role_name
 where r.user_id = auth.uid() and p.table_name=p_table_name;
IF p_event = 'SELECT' then
  --select all row
  IF p_can_select = 2 then return true;
  ELSEIF p_can_select = 1 and is_own_row = true then return true;
  ELSE RETURN FALSE;
  END IF;
ELSEIF p_event = 'INSERT' then
  --select all row
  IF p_can_insert >= 1 then return true;
  ELSE RETURN FALSE;
  END IF;
ELSEIF p_event = 'UPDATE' then
  --select all row
  IF p_can_update = 2 then return true;
  ELSEIF p_can_update = 1 and is_own_row = true then return true;
  ELSE RETURN FALSE;
  END IF;
ELSEIF p_event = 'DELETE' then
  --select all row
  IF p_can_delete = 2 then return true;
  ELSEIF p_can_delete = 1 and is_own_row = true then return true;
  ELSE RETURN FALSE;
  END IF;
ELSE
  return false;
END IF;
 end;
 $$;

ALTER FUNCTION "public"."check_permission"("p_table_name" "text", "p_event" "text", "is_own_row" boolean) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."fc_create_delete_history"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
  insert into public.delete_history(table_name, id_value, table_data)
  values(TG_TABLE_NAME, old.id, row_to_json(old));
  return old;
end$$;

ALTER FUNCTION "public"."fc_create_delete_history"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."fc_get_all_table"() RETURNS TABLE("tablename" "text")
    LANGUAGE "sql"
    AS $$
SELECT tablename  FROM pg_catalog.pg_tables WHERE schemaname = 'public' order by 1;
$$;

ALTER FUNCTION "public"."fc_get_all_table"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_admin_dashboard"() RETURNS TABLE("r_user_all" integer, "r_user_last_month" integer, "r_merchant_all" integer, "r_merchant_last_month" integer, "r_bbsb_all" integer, "r_bbsb_last_month" integer, "r_paid_all" numeric, "r_paid_last_month" numeric)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  last_month DATE := NOW() - INTERVAL '1 month';
BEGIN
return query
  select 
  cast(sum(user_all) as integer) r_user_all,
  cast(sum(user_last_month) as integer) r_user_last_month,
  cast(sum(merchant_all) as integer) r_merchant_all,
  cast(sum(merchant_last_month) as integer) r_merchant_last_month,
  cast(sum(bbsb_all) as integer) r_bbsb_all,
  cast(sum(bbsb_last_month) as integer) r_bbsb_last_month,
  cast(sum(paid_all) as numeric) r_paid_all,
  cast(sum(paid_last_month) as numeric) r_paid_last_month
from (select count(*) user_all, sum( case when created_at >= last_month then 1 else 0 end) user_last_month, 0 merchant_all, 0 merchant_last_month, 0 bbsb_all, 0 bbsb_last_month, 0 paid_all, 0 paid_last_month from user_profiles p 
union
select 0 user_all, 0 user_last_month, count(*) merchant_all, sum( case when created_at >= last_month then 1 else 0 end) merchant_last_month, 0 bbsb_all, 0 bbsb_last_month, 0 paid_all, 0 paid_last_month  from merchants
union 
select 0 user_all, 0 user_last_month, 0 merchant_all,  0 merchant_last_month,  count(*) bbsb_all, sum( case when created_at >= last_month then 1 else 0 end) bbsb_last_month, 0 paid_all, 0 paid_last_month from lenders
union
select 0 user_all, 0 user_last_month, 0 merchant_all,  0 merchant_last_month, 0 bbsb_all, 0 bbsb_last_month, sum(amount) paid_all, sum( case when created_at >= NOW() - INTERVAL '1 month' then amount else 0 end) paid_last_month  from payment_invoices where status = 'PAID'
) c;
END;
$$;

ALTER FUNCTION "public"."get_admin_dashboard"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_settlement_list"("user_id" "text") RETURNS "record"
    LANGUAGE "plpgsql"
    AS $$
declare 
get_settlement_list record;
begin 
  select ps.id, ps.created_at, ps.created_by, ps.total_amount, ps.fee_amount, ps.settlement_type, ps.job_id,
ps.base_fee_amount, ps.acquirer_amount, ps.issuer_amount, ps.status, ps.merchant_amount,
l.name as lender_name, l1.name as issuer_lender_name, m.name as merchant_name, b.name as branch_name
  from payment_settlements as ps
left join lenders as l on ps.bbsb_id = l.id
left join lenders as l1 on ps.issuer_bbsb_id = l1.id
left join merchants as m on ps.merchant_id = m.id
left join branches as b on ps.merchant_branch_id = b.id
into get_settlement_list where ps.created_by::text = user_id;
  
  return get_settlement_list;
end;
$$;

ALTER FUNCTION "public"."get_settlement_list"("user_id" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."getroles"("p_user_id" "uuid") RETURNS TABLE("role_name" "text", "role_desc" "text", "table_name" "text", "can_insert" integer, "can_select" integer, "can_update" integer, "can_delete" integer, "checked" integer)
    LANGUAGE "sql"
    AS $$
select 
  r.name role_name,
  r.description role_desc,
  p.table_name,
  p.can_insert,
  p.can_select,
  p.can_update,
  p.can_delete,
  case when k.role is not null then 1 else 0 end checked
 from roles r 
 left join (select role from user_role where user_id = p_user_id) k on r.name = k.role
  left join role_permission p on r.name = p.role_name
  where r.user_type = ( select user_type from user_profiles up where up.user_id = p_user_id)
  order by r.name, p.table_name;
  $$;

ALTER FUNCTION "public"."getroles"("p_user_id" "uuid") OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."payment_invoices" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "qr_data" "text",
    "amount" numeric,
    "merchant_branch_id" bigint,
    "product_id" bigint,
    "status" "text",
    "lender_id" bigint,
    "invoice_id" bigint,
    "qr_type" "text",
    "buyer_fname" "text",
    "buyer_lname" "text",
    "buyer_id_number" "text",
    "buyer_phone" "text",
    "lender_settlement_id" bigint,
    "merchant_settlement_id" bigint,
    "merchant_amount" numeric,
    "fee_amount" numeric,
    "merchant_id" bigint,
    "acquirer_amount" numeric,
    "issuer_amount" numeric,
    "base_fee_amount" numeric,
    "issuer_lender_id" bigint,
    "job_id" bigint
);

ALTER TABLE "public"."payment_invoices" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."pay_qr_invoice"("code" "text", "issuer_lender_id" bigint, "first_name" "text", "last_name" "text", "id_number" "text", "phone_number" "text") RETURNS "public"."payment_invoices"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    selected_invoice invoices%ROWTYPE;
    merchant_amount decimal(10,2);
    fee_amount decimal(10,2);
    acquirer_amount decimal(10,2);
    issuer_amount decimal(10,2);
    base_fee_amount decimal(10,2);
    total_rate numeric;
    payment_invoice_row payment_invoices%ROWTYPE;
    current_product products%ROWTYPE;
BEGIN
    -- Fetch the invoice data and assign it to the selected_invoice variable
    SELECT INTO selected_invoice *
    FROM invoices
    WHERE qr_data = uuid(code) and status = 'NEW';

    -- Check if the selected_invoice is not null (i.e., the invoice with the given QR code exists)
    IF selected_invoice IS NOT NULL THEN
        -- Fetch the interest_rate from the products table based on the product_id in the invoice
        SELECT INTO current_product *
        FROM products
        WHERE id = selected_invoice.product_id;

        -- Calculate merchant_amount and fee_amount
        total_rate := current_product.interest_rate + current_product.acquirer_rate + current_product.issuer_rate;
        merchant_amount := selected_invoice.amount * (100 - total_rate) / 100;
        fee_amount := selected_invoice.amount * total_rate / 100;
        acquirer_amount := selected_invoice.amount * current_product.acquirer_rate / 100;
        issuer_amount := selected_invoice.amount * current_product.issuer_rate / 100;
        base_fee_amount := selected_invoice.amount * current_product.interest_rate / 100;

        raise notice 'fee amount %', fee_amount::numeric;

        -- Insert payment information into the payment_invoices table
        INSERT INTO payment_invoices (
            qr_data,
            amount,
            merchant_branch_id,
            product_id,
            status,
            lender_id,
            invoice_id,
            qr_type,
            buyer_fname,
            buyer_lname,
            buyer_id_number,
            buyer_phone,
            merchant_amount,
            fee_amount,
            acquirer_amount,
            issuer_amount,
            issuer_lender_id,
            base_fee_amount
        )
        VALUES (
            code,
            selected_invoice.amount,
            selected_invoice.merchant_branch_id,
            selected_invoice.product_id,
            'CONFIRMED',
            selected_invoice.lender_id,
            selected_invoice.id,
            selected_invoice.qr_type,
            first_name,
            last_name,
            id_number,
            phone_number,
            merchant_amount,
            fee_amount,
            acquirer_amount,
            issuer_amount,
            issuer_lender_id,
            base_fee_amount
        ) RETURNING * INTO payment_invoice_row;

        UPDATE INVOICES SET status = 'CONFIRMED' WHERE qr_data = uuid(code);

    ELSE
        -- The invoice with the provided QR code does not exist; handle this case as needed
        RAISE EXCEPTION 'Invoice with QR code % does not exist.', code;
    END IF;

    -- Commit the transaction

    RETURN payment_invoice_row;
END;
$$;

ALTER FUNCTION "public"."pay_qr_invoice"("code" "text", "issuer_lender_id" bigint, "first_name" "text", "last_name" "text", "id_number" "text", "phone_number" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."settled_amount"() RETURNS SETOF "public"."payment_invoices"
    LANGUAGE "plpgsql"
    AS $$
  declare auth_merchant_id numeric;
  declare is_merchant_admin boolean;
  begin
    -- check user role --
    select exists
    (
      select *
      from user_role
      where user_id = auth.uid() and role = 'merchant_admin'
    ) into is_merchant_admin;

    -- find merchant_id of authenticated user --
    select merchant_id
    into auth_merchant_id
    from merchant_user
    where merchant_user.user_id = auth.uid() limit 1;

    if is_merchant_admin then
      -- all branch data of authenticated user's merchant
      return query select *
      from payment_invoices
      where status = 'CONFIRMED' and merchant_id = auth_merchant_id;
    else
      -- single branch data of authenticated user's merchant
      return query select *
      from payment_invoices
      where status = 'CONFIRMED' and merchant_branch_id in 
          (select merchant_branch_id 
            from merchant_branch_user
            where user_id = auth.uid() and merchant_id = auth_merchant_id
            );
     end if;
  end;
$$;

ALTER FUNCTION "public"."settled_amount"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."test_unsettlement"() RETURNS SETOF "public"."payment_invoices"
    LANGUAGE "plpgsql"
    AS $$
  declare auth_merchant_id numeric;
  declare is_merchant_admin boolean;
  begin
    -- check user role --
    select exists
    (
      select *
      from user_role
      where user_id = auth.uid() and role = 'merchant_admin'
    ) into is_merchant_admin;

    -- find merchant_id of authenticated user --
    select merchant_id
    into auth_merchant_id
    from merchant_user
    where merchant_user.user_id = auth.uid() limit 1;

    if is_merchant_admin then
      -- all branch data of authenticated user's merchant
      return query select *
      from payment_invoices
      where status != 'CONFIRMED' and merchant_id = auth_merchant_id;
    else
      -- single branch data of authenticated user's merchant
      return query select *
      from payment_invoices
      where status != 'CONFIRMED' and merchant_branch_id in 
          (select merchant_branch_id 
            from merchant_branch_user
            where user_id = auth.uid() and merchant_id = auth_merchant_id
            );
     end if;
  end;
$$;

ALTER FUNCTION "public"."test_unsettlement"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."total_buyers"() RETURNS SETOF "public"."payment_invoices"
    LANGUAGE "plpgsql"
    AS $$
  declare auth_merchant_id numeric;
  declare is_merchant_admin boolean;
  begin
    -- check user role --
    select exists
    (
      select *
      from user_role
      where user_id = auth.uid() and role = 'merchant_admin'
    ) into is_merchant_admin;

    -- find merchant_id of authenticated user --
    select merchant_id
    into auth_merchant_id
    from merchant_user
    where merchant_user.user_id = auth.uid() limit 1;

    if is_merchant_admin then
      -- all branch data of authenticated user's merchant
      return query select *
      from payment_invoices
      where status != 'NEW' and merchant_id = auth_merchant_id;
    else
      -- single branch data of authenticated user's merchant
      return query select *
      from payment_invoices
      where status != 'NEW' and merchant_branch_id in 
          (select merchant_branch_id 
            from merchant_branch_user
            where user_id = auth.uid() and merchant_id = auth_merchant_id
            );
     end if;
  end;
$$;

ALTER FUNCTION "public"."total_buyers"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."total_fee_amount"() RETURNS SETOF "public"."payment_invoices"
    LANGUAGE "plpgsql"
    AS $$
  declare auth_lender_id bigint;
  declare t_amount numeric;
  begin
    
    select lender_id
    into auth_lender_id
    from lender_user
    where lender_user.user_id = auth.uid();

    return query (select fee_amount, created_at
    from payment_invoices
    where status != 'CONFIRMED'
    and lender_id = auth_lender_id);
  end;
$$;

ALTER FUNCTION "public"."total_fee_amount"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."total_lend_amount"() RETURNS SETOF "public"."payment_invoices"
    LANGUAGE "plpgsql"
    AS $$
  declare auth_lender_id bigint;
  declare t_amount numeric;
  begin
    
    select lender_id
    into auth_lender_id
    from lender_user
    where lender_user.user_id = auth.uid();

    return query (select amount, created_at
    from payment_invoices
    where status != 'CONFIRMED'
    and lender_id = auth_lender_id);
  end;
$$;

ALTER FUNCTION "public"."total_lend_amount"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."total_received_amount"() RETURNS SETOF "public"."payment_invoices"
    LANGUAGE "plpgsql"
    AS $$
  declare auth_lender_id bigint;
  declare t_amount numeric;
  begin
    
    select lender_id
    into auth_lender_id
    from lender_user
    where lender_user.user_id = auth.uid();

    return query select *
    from payment_invoices
    where status != 'CONFIRMED'
    and lender_id = auth_lender_id;
  end;
$$;

ALTER FUNCTION "public"."total_received_amount"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."total_sales"() RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
  declare auth_merchant_id bigint;
  declare amount numeric;
  begin
    -- find merchant_id of authenticated user --
    select merchant_id
    into auth_merchant_id
    from merchant_user
    where merchant_user.user_id = auth.uid();

    -- calculate sum of unsettled amount
    select SUM(merchant_amount) 
    into amount
    from payment_invoices
    where status = 'PAID'
    and merchant_id = auth_merchant_id;

    return amount;
  end;
$$;

ALTER FUNCTION "public"."total_sales"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."unsettled_amount"() RETURNS SETOF "public"."payment_invoices"
    LANGUAGE "plpgsql"
    AS $$
  declare auth_merchant_id numeric;
  declare is_merchant_admin boolean;
  begin
    -- check user role --
    select exists
    (
      select *
      from user_role
      where user_id = auth.uid() and role = 'merchant_admin'
    ) into is_merchant_admin;

    -- find merchant_id of authenticated user --
    select merchant_id
    into auth_merchant_id
    from merchant_user
    where merchant_user.user_id = auth.uid() limit 1;

    if is_merchant_admin then
      -- all branch data of authenticated user's merchant
      return query select *
      from payment_invoices
      where status != 'CONFIRMED' and merchant_id = auth_merchant_id;
    else
      -- single branch data of authenticated user's merchant
      return query select *
      from payment_invoices
      where status != 'CONFIRMED' and merchant_branch_id in 
          (select merchant_branch_id 
            from merchant_branch_user
            where user_id = auth.uid() and merchant_id = auth_merchant_id
            );
     end if;
  end;
$$;

ALTER FUNCTION "public"."unsettled_amount"() OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."amount" (
    "sum" numeric
);

ALTER TABLE "public"."amount" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."banks" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "name_mn" "text" NOT NULL
);

ALTER TABLE "public"."banks" OWNER TO "postgres";

ALTER TABLE "public"."banks" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bank_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."batch_job_execution" (
    "job_execution_id" bigint NOT NULL,
    "version" bigint,
    "job_instance_id" bigint NOT NULL,
    "create_time" timestamp without time zone NOT NULL,
    "start_time" timestamp without time zone,
    "end_time" timestamp without time zone,
    "status" character varying(10),
    "exit_code" character varying(2500),
    "exit_message" character varying(2500),
    "last_updated" timestamp without time zone
);

ALTER TABLE "public"."batch_job_execution" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."batch_job_execution_context" (
    "job_execution_id" bigint NOT NULL,
    "short_context" character varying(2500) NOT NULL,
    "serialized_context" "text"
);

ALTER TABLE "public"."batch_job_execution_context" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."batch_job_execution_params" (
    "job_execution_id" bigint NOT NULL,
    "parameter_name" character varying(100) NOT NULL,
    "parameter_type" character varying(100) NOT NULL,
    "parameter_value" character varying(2500),
    "identifying" character(1) NOT NULL
);

ALTER TABLE "public"."batch_job_execution_params" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."batch_job_execution_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."batch_job_execution_seq" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."batch_job_instance" (
    "job_instance_id" bigint NOT NULL,
    "version" bigint,
    "job_name" character varying(100) NOT NULL,
    "job_key" character varying(32) NOT NULL
);

ALTER TABLE "public"."batch_job_instance" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."batch_job_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."batch_job_seq" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."batch_step_execution" (
    "step_execution_id" bigint NOT NULL,
    "version" bigint NOT NULL,
    "step_name" character varying(100) NOT NULL,
    "job_execution_id" bigint NOT NULL,
    "create_time" timestamp without time zone NOT NULL,
    "start_time" timestamp without time zone,
    "end_time" timestamp without time zone,
    "status" character varying(10),
    "commit_count" bigint,
    "read_count" bigint,
    "filter_count" bigint,
    "write_count" bigint,
    "read_skip_count" bigint,
    "write_skip_count" bigint,
    "process_skip_count" bigint,
    "rollback_count" bigint,
    "exit_code" character varying(2500),
    "exit_message" character varying(2500),
    "last_updated" timestamp without time zone
);

ALTER TABLE "public"."batch_step_execution" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."batch_step_execution_context" (
    "step_execution_id" bigint NOT NULL,
    "short_context" character varying(2500) NOT NULL,
    "serialized_context" "text"
);

ALTER TABLE "public"."batch_step_execution_context" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."batch_step_execution_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."batch_step_execution_seq" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."lenders" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "name" "text",
    "id_number" "text",
    "status" "text",
    "email" "text",
    "phone" "text",
    "city_id" smallint,
    "district_id" smallint,
    "addr" "text"
);

ALTER TABLE "public"."lenders" OWNER TO "postgres";

ALTER TABLE "public"."lenders" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bbsb_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."lender_merchant" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "merchant_branch_id" bigint,
    "acquire_fee" numeric,
    "lender_id" bigint
);

ALTER TABLE "public"."lender_merchant" OWNER TO "postgres";

ALTER TABLE "public"."lender_merchant" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bbsb_merchant_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."lender_user" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "lender_id" bigint,
    "user_id" "uuid"
);

ALTER TABLE "public"."lender_user" OWNER TO "postgres";

ALTER TABLE "public"."lender_user" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bbsb_user_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."cities" (
    "id" smallint NOT NULL,
    "name" "text"
);

ALTER TABLE "public"."cities" OWNER TO "postgres";

ALTER TABLE "public"."cities" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cities_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."clients" (
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "client_id" character varying NOT NULL,
    "client_secret" character varying NOT NULL,
    "name" character varying,
    "env_type" character varying DEFAULT 'SANDBOX'::character varying,
    "lender_id" bigint,
    "merchant_id" bigint,
    "merchant_branch_id" bigint,
    "client_type" character varying DEFAULT 'LENDER'::character varying
);

ALTER TABLE "public"."clients" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."delete_history" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "table_name" "text",
    "id_value" "text",
    "deleted_by" "uuid" DEFAULT "auth"."uid"(),
    "description" "text",
    "table_data" "json"
);

ALTER TABLE "public"."delete_history" OWNER TO "postgres";

ALTER TABLE "public"."delete_history" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."delete_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."dictionaries" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "table_name" "text",
    "column_name" "text",
    "column_value" "text",
    "display_value" "text"
);

ALTER TABLE "public"."dictionaries" OWNER TO "postgres";

ALTER TABLE "public"."dictionaries" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."dictionaries_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."districts" (
    "id" smallint NOT NULL,
    "name" "text",
    "city_id" smallint
);

ALTER TABLE "public"."districts" OWNER TO "postgres";

ALTER TABLE "public"."districts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."districts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE "public"."payment_invoices" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."dynamic_qr_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "qr_data" "uuid" DEFAULT "gen_random_uuid"(),
    "amount" numeric,
    "merchant_branch_id" bigint,
    "product_id" bigint,
    "status" "text",
    "lender_id" bigint,
    "qr_type" "text",
    "merchant_id" bigint
);

ALTER TABLE "public"."invoices" OWNER TO "postgres";

ALTER TABLE "public"."invoices" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."dynamic_qr_request_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."merchant_branch_user" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "merchant_branch_id" bigint,
    "merchant_id" bigint
);

ALTER TABLE "public"."merchant_branch_user" OWNER TO "postgres";

ALTER TABLE "public"."merchant_branch_user" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."merchant_branch_user_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE "public"."branches" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."merchant_branchs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."merchant_document" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "merchant_id" bigint,
    "document_type" "text",
    "file_path" "text",
    "file_name" "text"
);

ALTER TABLE "public"."merchant_document" OWNER TO "postgres";

ALTER TABLE "public"."merchant_document" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."merchant_document_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."merchant_secondary_lender" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "merchant_id" bigint,
    "lender_id" bigint,
    "created_by" "uuid" DEFAULT "auth"."uid"()
);

ALTER TABLE "public"."merchant_secondary_lender" OWNER TO "postgres";

ALTER TABLE "public"."merchant_secondary_lender" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."merchant_secondary_lender_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."merchant_settlements" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "total_amount" numeric
);

ALTER TABLE "public"."merchant_settlements" OWNER TO "postgres";

ALTER TABLE "public"."merchant_settlements" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."merchant_settlement_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."merchant_user" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "merchant_id" bigint,
    "user_id" "uuid"
);

ALTER TABLE "public"."merchant_user" OWNER TO "postgres";

ALTER TABLE "public"."merchant_user" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."merchant_user_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."merchants" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "name" "text" NOT NULL,
    "id_number" "text",
    "status" "text",
    "lender_id" bigint,
    "phone" "text",
    "email" "text",
    "city_id" smallint,
    "district_id" smallint,
    "addr" "text",
    "product_id" bigint,
    "is_retail" smallint DEFAULT '1'::smallint NOT NULL,
    "industry" "text",
    "postal_code" "text"
);

ALTER TABLE "public"."merchants" OWNER TO "postgres";

ALTER TABLE "public"."merchants" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."merchants_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."payment_settlements" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "total_amount" numeric,
    "fee_amount" numeric,
    "lender_id" bigint,
    "merchant_branch_id" bigint,
    "settlement_type" "text",
    "merchant_id" bigint,
    "job_id" bigint,
    "base_fee_amount" numeric,
    "acquirer_amount" numeric,
    "issuer_amount" numeric,
    "status" "text" DEFAULT 'NEW'::"text",
    "issuer_lender_id" bigint,
    "merchant_amount" numeric
);

ALTER TABLE "public"."payment_settlements" OWNER TO "postgres";

ALTER TABLE "public"."payment_settlements" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."payment_settlement_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."payment_transactions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "amount" numeric,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "payment_settlement_id" bigint,
    "description" "text",
    "start_balance" numeric,
    "end_balance" numeric
);

ALTER TABLE "public"."payment_transactions" OWNER TO "postgres";

ALTER TABLE "public"."payment_transactions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."payment_transaction_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."product_lender" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "product_id" bigint,
    "lender_id" bigint
);

ALTER TABLE "public"."product_lender" OWNER TO "postgres";

ALTER TABLE "public"."product_lender" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."product_lender_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "name" "text",
    "status" "text" DEFAULT 'NEW'::"text",
    "is_deleted" smallint DEFAULT '0'::smallint,
    "interest_rate" numeric,
    "acquirer_rate" numeric,
    "issuer_rate" numeric,
    "termlen" smallint DEFAULT '0'::smallint
);

ALTER TABLE "public"."products" OWNER TO "postgres";

ALTER TABLE "public"."products" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."products_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."role_permission" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "role_name" "text",
    "table_name" "text",
    "can_insert" smallint,
    "can_update" smallint,
    "can_delete" smallint,
    "can_select" smallint
);

ALTER TABLE "public"."role_permission" OWNER TO "postgres";

ALTER TABLE "public"."role_permission" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."role_permission_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."roles" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "user_type" "text"
);

ALTER TABLE "public"."roles" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."settlement_list" AS
 SELECT "ps"."id",
    "ps"."created_at",
    "ps"."created_by",
    "ps"."total_amount",
    "ps"."fee_amount",
    "ps"."settlement_type",
    "ps"."job_id",
    "ps"."base_fee_amount",
    "ps"."acquirer_amount",
    "ps"."issuer_amount",
    "ps"."status",
    "ps"."merchant_amount",
    "l"."name" AS "lender_name",
    "l1"."name" AS "issuer_lender_name",
    "m"."name" AS "merchant_name",
    "b"."name" AS "branch_name"
   FROM (((("public"."payment_settlements" "ps"
     LEFT JOIN "public"."lenders" "l" ON (("ps"."lender_id" = "l"."id")))
     LEFT JOIN "public"."lenders" "l1" ON (("ps"."issuer_lender_id" = "l1"."id")))
     LEFT JOIN "public"."merchants" "m" ON (("ps"."merchant_id" = "m"."id")))
     LEFT JOIN "public"."branches" "b" ON (("ps"."merchant_branch_id" = "b"."id")));

ALTER TABLE "public"."settlement_list" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."tokens" (
    "token" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "client_id" character varying NOT NULL,
    "user_id" "uuid" NOT NULL,
    "expired_at" timestamp with time zone
);

ALTER TABLE "public"."tokens" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."unsettlement" AS
 SELECT "min"("pi"."created_at") AS "created_at",
    "pi"."lender_id",
    "l"."name" AS "lender_name",
    "l1"."name" AS "issuer_lender_name",
    "m"."name" AS "merchant_name",
    "b"."name" AS "branch_name",
    "sum"("pi"."amount") AS "total_amount",
    "sum"("pi"."merchant_amount") AS "total_merchant_amount",
    "sum"("pi"."fee_amount") AS "total_fee_amount",
    "sum"("pi"."acquirer_amount") AS "total_acquirer_amount",
    "sum"("pi"."issuer_amount") AS "total_issuer_amount",
    "sum"("pi"."base_fee_amount") AS "total_base_fee_amount"
   FROM (((("public"."payment_invoices" "pi"
     LEFT JOIN "public"."lenders" "l" ON (("l"."id" = "pi"."lender_id")))
     LEFT JOIN "public"."merchants" "m" ON (("m"."id" = "pi"."merchant_id")))
     LEFT JOIN "public"."branches" "b" ON (("b"."id" = "pi"."merchant_branch_id")))
     LEFT JOIN "public"."lenders" "l1" ON (("l1"."id" = "pi"."lender_id")))
  WHERE ("pi"."status" = 'CONFIRMED'::"text")
  GROUP BY "pi"."lender_id", "pi"."issuer_lender_id", "pi"."merchant_id", "pi"."merchant_branch_id", "l"."name", "l1"."name", "m"."name", "b"."name";

ALTER TABLE "public"."unsettlement" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "id_number" "text",
    "fname" "text",
    "lname" "text",
    "user_type" "text",
    "phone" "text",
    "email" "text"
);

ALTER TABLE "public"."user_profiles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_role" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "user_id" "uuid",
    "role" "text"
);

ALTER TABLE "public"."user_role" OWNER TO "postgres";

ALTER TABLE "public"."user_role" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_role_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."banks"
    ADD CONSTRAINT "bank_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."batch_job_execution_context"
    ADD CONSTRAINT "batch_job_execution_context_pkey" PRIMARY KEY ("job_execution_id");

ALTER TABLE ONLY "public"."batch_job_execution"
    ADD CONSTRAINT "batch_job_execution_pkey" PRIMARY KEY ("job_execution_id");

ALTER TABLE ONLY "public"."batch_job_instance"
    ADD CONSTRAINT "batch_job_instance_pkey" PRIMARY KEY ("job_instance_id");

ALTER TABLE ONLY "public"."batch_step_execution_context"
    ADD CONSTRAINT "batch_step_execution_context_pkey" PRIMARY KEY ("step_execution_id");

ALTER TABLE ONLY "public"."batch_step_execution"
    ADD CONSTRAINT "batch_step_execution_pkey" PRIMARY KEY ("step_execution_id");

ALTER TABLE ONLY "public"."lender_merchant"
    ADD CONSTRAINT "bbsb_merchant_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."lenders"
    ADD CONSTRAINT "bbsb_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."lender_user"
    ADD CONSTRAINT "bbsb_user_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."lender_user"
    ADD CONSTRAINT "bbsb_user_un" UNIQUE ("lender_id", "user_id");

ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("user_id", "client_id");

ALTER TABLE ONLY "public"."delete_history"
    ADD CONSTRAINT "delete_history_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."dictionaries"
    ADD CONSTRAINT "dictionaries_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."districts"
    ADD CONSTRAINT "districts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "dynamic_qr_request_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."payment_invoices"
    ADD CONSTRAINT "dynamic_qr_request_pkey_1" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."batch_job_instance"
    ADD CONSTRAINT "job_inst_un" UNIQUE ("job_name", "job_key");

ALTER TABLE ONLY "public"."merchant_branch_user"
    ADD CONSTRAINT "merchant_branch_user_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "merchant_branchs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."merchant_document"
    ADD CONSTRAINT "merchant_document_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."merchant_secondary_lender"
    ADD CONSTRAINT "merchant_secondary_lender_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."merchant_secondary_lender"
    ADD CONSTRAINT "merchant_secondary_lender_un" UNIQUE ("merchant_id", "lender_id");

ALTER TABLE ONLY "public"."merchant_settlements"
    ADD CONSTRAINT "merchant_settlement_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."merchant_user"
    ADD CONSTRAINT "merchant_user_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."merchant_user"
    ADD CONSTRAINT "merchant_user_un" UNIQUE ("merchant_id", "user_id");

ALTER TABLE ONLY "public"."merchants"
    ADD CONSTRAINT "merchants_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."payment_settlements"
    ADD CONSTRAINT "payment_settlement_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transaction_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."product_lender"
    ADD CONSTRAINT "product_lender_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."product_lender"
    ADD CONSTRAINT "product_lender_un" UNIQUE ("product_id", "lender_id");

ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."role_permission"
    ADD CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."role_permission"
    ADD CONSTRAINT "role_permission_un" UNIQUE ("role_name", "table_name");

ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("name");

ALTER TABLE ONLY "public"."tokens"
    ADD CONSTRAINT "tokens_pkey" PRIMARY KEY ("token");

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profile_pkey" PRIMARY KEY ("user_id");

ALTER TABLE ONLY "public"."user_role"
    ADD CONSTRAINT "user_role_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX "dictionaries_table_name_column_name_column_value_idx" ON "public"."dictionaries" USING "btree" ("table_name", "column_name", "column_value");

CREATE UNIQUE INDEX "user_role_user_id_role_idx" ON "public"."user_role" USING "btree" ("user_id", "role");

CREATE OR REPLACE TRIGGER "tr_branch_delete_history" AFTER DELETE ON "public"."branches" FOR EACH ROW EXECUTE FUNCTION "public"."fc_create_delete_history"();

CREATE OR REPLACE TRIGGER "tr_lender_merchant_delete_history" AFTER DELETE ON "public"."lender_merchant" FOR EACH ROW EXECUTE FUNCTION "public"."fc_create_delete_history"();

CREATE OR REPLACE TRIGGER "tr_lender_user_delete_history" AFTER DELETE ON "public"."lender_user" FOR EACH ROW EXECUTE FUNCTION "public"."fc_create_delete_history"();

CREATE OR REPLACE TRIGGER "tr_merchant_branch_user_delete_history" AFTER DELETE ON "public"."merchant_branch_user" FOR EACH ROW EXECUTE FUNCTION "public"."fc_create_delete_history"();

CREATE OR REPLACE TRIGGER "tr_merchant_secondary_lender_delete_history" AFTER DELETE ON "public"."merchant_secondary_lender" FOR EACH ROW EXECUTE FUNCTION "public"."fc_create_delete_history"();

CREATE OR REPLACE TRIGGER "tr_merchant_user_delete_history" AFTER DELETE ON "public"."merchant_user" FOR EACH ROW EXECUTE FUNCTION "public"."fc_create_delete_history"();

CREATE OR REPLACE TRIGGER "tr_product_lender_delete_history" AFTER DELETE ON "public"."product_lender" FOR EACH ROW EXECUTE FUNCTION "public"."fc_create_delete_history"();

CREATE OR REPLACE TRIGGER "tr_role_permission_delete_history" AFTER DELETE ON "public"."role_permission" FOR EACH ROW EXECUTE FUNCTION "public"."fc_create_delete_history"();

CREATE OR REPLACE TRIGGER "tr_user_profiles_delete_history" AFTER DELETE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."fc_create_delete_history"();

CREATE OR REPLACE TRIGGER "tr_user_role_delete_history" AFTER DELETE ON "public"."user_role" FOR EACH ROW EXECUTE FUNCTION "public"."fc_create_delete_history"();

ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id");

ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id");

ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."districts"
    ADD CONSTRAINT "districts_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id");

ALTER TABLE ONLY "public"."districts"
    ADD CONSTRAINT "districts_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id");

ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("user_id");

ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."lenders"("id");

ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_merchant_branch_id_fkey" FOREIGN KEY ("merchant_branch_id") REFERENCES "public"."branches"("id");

ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id");

ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");

ALTER TABLE ONLY "public"."batch_job_execution_context"
    ADD CONSTRAINT "job_exec_ctx_fk" FOREIGN KEY ("job_execution_id") REFERENCES "public"."batch_job_execution"("job_execution_id");

ALTER TABLE ONLY "public"."batch_job_execution_params"
    ADD CONSTRAINT "job_exec_params_fk" FOREIGN KEY ("job_execution_id") REFERENCES "public"."batch_job_execution"("job_execution_id");

ALTER TABLE ONLY "public"."batch_step_execution"
    ADD CONSTRAINT "job_exec_step_fk" FOREIGN KEY ("job_execution_id") REFERENCES "public"."batch_job_execution"("job_execution_id");

ALTER TABLE ONLY "public"."batch_job_execution"
    ADD CONSTRAINT "job_inst_exec_fk" FOREIGN KEY ("job_instance_id") REFERENCES "public"."batch_job_instance"("job_instance_id");

ALTER TABLE ONLY "public"."lender_user"
    ADD CONSTRAINT "lender_user_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."lenders"("id");

ALTER TABLE ONLY "public"."lender_user"
    ADD CONSTRAINT "lender_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id");

ALTER TABLE ONLY "public"."lenders"
    ADD CONSTRAINT "lenders_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id");

ALTER TABLE ONLY "public"."lenders"
    ADD CONSTRAINT "lenders_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("user_id");

ALTER TABLE ONLY "public"."lenders"
    ADD CONSTRAINT "lenders_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id");

ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "merchant_branch_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("user_id");

ALTER TABLE ONLY "public"."merchant_branch_user"
    ADD CONSTRAINT "merchant_branch_user_merchant_branch_id_fkey" FOREIGN KEY ("merchant_branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."merchant_branch_user"
    ADD CONSTRAINT "merchant_branch_user_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."merchant_branch_user"
    ADD CONSTRAINT "merchant_branch_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."merchant_document"
    ADD CONSTRAINT "merchant_document_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id");

ALTER TABLE ONLY "public"."merchant_secondary_lender"
    ADD CONSTRAINT "merchant_secondary_lender_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("user_id");

ALTER TABLE ONLY "public"."merchant_secondary_lender"
    ADD CONSTRAINT "merchant_secondary_lender_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."lenders"("id");

ALTER TABLE ONLY "public"."merchant_secondary_lender"
    ADD CONSTRAINT "merchant_secondary_lender_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id");

ALTER TABLE ONLY "public"."merchant_user"
    ADD CONSTRAINT "merchant_user_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."merchant_user"
    ADD CONSTRAINT "merchant_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."merchants"
    ADD CONSTRAINT "merchants_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id");

ALTER TABLE ONLY "public"."merchants"
    ADD CONSTRAINT "merchants_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("user_id");

ALTER TABLE ONLY "public"."merchants"
    ADD CONSTRAINT "merchants_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id");

ALTER TABLE ONLY "public"."merchants"
    ADD CONSTRAINT "merchants_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."lenders"("id");

ALTER TABLE ONLY "public"."merchants"
    ADD CONSTRAINT "merchants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");

ALTER TABLE ONLY "public"."payment_invoices"
    ADD CONSTRAINT "payment_invoices_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id");

ALTER TABLE ONLY "public"."payment_invoices"
    ADD CONSTRAINT "payment_invoices_issuer_lender_id_fkey" FOREIGN KEY ("issuer_lender_id") REFERENCES "public"."lenders"("id");

ALTER TABLE ONLY "public"."payment_invoices"
    ADD CONSTRAINT "payment_invoices_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."lenders"("id");

ALTER TABLE ONLY "public"."payment_invoices"
    ADD CONSTRAINT "payment_invoices_lender_settlement_id_fkey" FOREIGN KEY ("lender_settlement_id") REFERENCES "public"."payment_settlements"("id");

ALTER TABLE ONLY "public"."payment_invoices"
    ADD CONSTRAINT "payment_invoices_merchant_branch_id_fkey" FOREIGN KEY ("merchant_branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."payment_invoices"
    ADD CONSTRAINT "payment_invoices_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."payment_invoices"
    ADD CONSTRAINT "payment_invoices_merchant_settlement_id_fkey" FOREIGN KEY ("merchant_settlement_id") REFERENCES "public"."payment_settlements"("id");

ALTER TABLE ONLY "public"."payment_invoices"
    ADD CONSTRAINT "payment_invoices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");

ALTER TABLE ONLY "public"."payment_settlements"
    ADD CONSTRAINT "payment_settlements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("user_id");

ALTER TABLE ONLY "public"."payment_settlements"
    ADD CONSTRAINT "payment_settlements_issuer_lender_id_fkey" FOREIGN KEY ("issuer_lender_id") REFERENCES "public"."lenders"("id");

ALTER TABLE ONLY "public"."payment_settlements"
    ADD CONSTRAINT "payment_settlements_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."lenders"("id");

ALTER TABLE ONLY "public"."payment_settlements"
    ADD CONSTRAINT "payment_settlements_merchant_branch_id_fkey" FOREIGN KEY ("merchant_branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."payment_settlements"
    ADD CONSTRAINT "payment_settlements_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id");

ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_payment_settlement_id_fkey" FOREIGN KEY ("payment_settlement_id") REFERENCES "public"."payment_settlements"("id");

ALTER TABLE ONLY "public"."product_lender"
    ADD CONSTRAINT "product_lender_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."lenders"("id");

ALTER TABLE ONLY "public"."product_lender"
    ADD CONSTRAINT "product_lender_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");

ALTER TABLE ONLY "public"."role_permission"
    ADD CONSTRAINT "role_permission_role_name_fkey" FOREIGN KEY ("role_name") REFERENCES "public"."roles"("name");

ALTER TABLE ONLY "public"."batch_step_execution_context"
    ADD CONSTRAINT "step_exec_ctx_fk" FOREIGN KEY ("step_execution_id") REFERENCES "public"."batch_step_execution"("step_execution_id");

ALTER TABLE ONLY "public"."user_role"
    ADD CONSTRAINT "user_role_role_fkey" FOREIGN KEY ("role") REFERENCES "public"."roles"("name");

CREATE POLICY "AUTHENTICATED" ON "public"."product_lender" TO "authenticated" USING (true);

CREATE POLICY "AUTHENTICATED USER CAN INSERT" ON "public"."delete_history" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Allow user delete their owned branch" ON "public"."branches" FOR DELETE USING (("auth"."uid"() = "created_by"));

CREATE POLICY "Allow user to update their owned branch" ON "public"."branches" FOR UPDATE USING ("public"."check_permission"('branches'::"text", 'UPDATE'::"text", ("auth"."uid"() = "created_by"))) WITH CHECK ("public"."check_permission"('branches'::"text", 'UPDATE'::"text", ("auth"."uid"() = "created_by")));

CREATE POLICY "DICTIONARIES ONLY SELECT AUTH USERS" ON "public"."dictionaries" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."tokens" FOR SELECT USING (true);

CREATE POLICY "PL LENDER_INSERT_MERCHANTS" ON "public"."merchants" FOR INSERT TO "authenticated" WITH CHECK (("public"."check_permission"('merchants'::"text", 'UPDATE'::"text", ("auth"."uid"() IN ( SELECT "lender_user"."user_id"
   FROM "public"."lender_user"
  WHERE ("lender_user"."lender_id" = "merchants"."lender_id")))) = true));

CREATE POLICY "PL LENDER_SELECT_PAYMENT_SETTLEMENTS" ON "public"."payment_settlements" FOR SELECT TO "authenticated" USING (("public"."check_permission"('payment_settlements'::"text", 'SELECT'::"text", ("auth"."uid"() IN ( SELECT "lender_user"."user_id"
   FROM "public"."lender_user"
  WHERE ("lender_user"."lender_id" = "payment_settlements"."issuer_lender_id")))) = true));

CREATE POLICY "PL LENDER_UPDATE_MERCHANT" ON "public"."merchants" FOR UPDATE TO "authenticated" WITH CHECK (("public"."check_permission"('merchants'::"text", 'UPDATE'::"text", ("auth"."uid"() IN ( SELECT "lender_user"."user_id"
   FROM "public"."lender_user"
  WHERE ("lender_user"."lender_id" = "merchants"."lender_id")))) = true));

CREATE POLICY "PL MERCHANTS SELECT" ON "public"."merchants" FOR SELECT TO "authenticated" USING (("public"."check_permission"('merchants'::"text", 'SELECT'::"text", ("auth"."uid"() IN ( SELECT "lender_user"."user_id"
   FROM "public"."lender_user"
  WHERE ("lender_user"."lender_id" = "merchants"."lender_id")))) = true));

CREATE POLICY "PL MERCHANT_SECONDARY_LENDER DELETE" ON "public"."merchant_secondary_lender" FOR DELETE TO "authenticated" USING (("public"."check_permission"('merchant_secondary_lender'::"text", 'DELETE'::"text", ("auth"."uid"() IN ( SELECT "merchant_user"."user_id"
   FROM "public"."merchant_user"
  WHERE ("merchant_user"."merchant_id" = "merchant_secondary_lender"."merchant_id")))) = true));

CREATE POLICY "PL MERCHANT_SECONDARY_LENDER INSERT" ON "public"."merchant_secondary_lender" FOR INSERT TO "authenticated" WITH CHECK ("public"."check_permission"('merchant_secondary_lender'::"text", 'INSERT'::"text", true));

CREATE POLICY "PL MERCHANT_SECONDARY_LENDER SELECT" ON "public"."merchant_secondary_lender" FOR SELECT TO "authenticated" USING (("public"."check_permission"('merchant_secondary_lender'::"text", 'SELECT'::"text", ("auth"."uid"() IN ( SELECT "merchant_user"."user_id"
   FROM "public"."merchant_user"
  WHERE ("merchant_user"."merchant_id" = "merchant_secondary_lender"."merchant_id")))) = true));

CREATE POLICY "PL SELECT_ACQUIRER_PINVOICES" ON "public"."payment_invoices" FOR SELECT TO "authenticated" USING (("public"."check_permission"('payment_invoices'::"text", 'SELECT'::"text", ("auth"."uid"() IN ( SELECT "lender_user"."user_id"
   FROM "public"."lender_user"
  WHERE ("lender_user"."lender_id" = "payment_invoices"."lender_id")))) = true));

CREATE POLICY "PL SELECT_ISSUER_PINVOICES" ON "public"."payment_invoices" FOR SELECT TO "authenticated" USING (("public"."check_permission"('payment_invoices'::"text", 'SELECT'::"text", ("auth"."uid"() IN ( SELECT "lender_user"."user_id"
   FROM "public"."lender_user"
  WHERE ("lender_user"."lender_id" = "payment_invoices"."issuer_lender_id")))) = true));

CREATE POLICY "Read access to all authenticated user" ON "public"."districts" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "allow users to insert their merchant's branch" ON "public"."branches" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "merchant_user"."user_id"
   FROM "public"."merchant_user"
  WHERE ("merchant_user"."merchant_id" = "branches"."merchant_id"))));

ALTER TABLE "public"."delete_history" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."dictionaries" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enable users to view their merchant's branches" ON "public"."branches" FOR SELECT TO "authenticated" USING ("public"."check_permission"('branches'::"text", 'SELECT'::"text", ("auth"."uid"() IN ( SELECT "merchant_user"."user_id"
   FROM "public"."merchant_user"
  WHERE ("merchant_user"."merchant_id" = "branches"."merchant_id")))));

ALTER TABLE "public"."merchant_secondary_lender" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."merchant_settlements" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."merchants" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."payment_invoices" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."branches" TO "anon";
GRANT ALL ON TABLE "public"."branches" TO "authenticated";
GRANT ALL ON TABLE "public"."branches" TO "service_role";

GRANT ALL ON FUNCTION "public"."branches_of_merchant_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."branches_of_merchant_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."branches_of_merchant_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."calculate_amounts"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_amounts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_amounts"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."check_permission"("p_table_name" "text", "p_event" "text", "is_own_row" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."check_permission"("p_table_name" "text", "p_event" "text", "is_own_row" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."check_permission"("p_table_name" "text", "p_event" "text", "is_own_row" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_permission"("p_table_name" "text", "p_event" "text", "is_own_row" boolean) TO "service_role";

REVOKE ALL ON FUNCTION "public"."fc_create_delete_history"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fc_create_delete_history"() TO "anon";
GRANT ALL ON FUNCTION "public"."fc_create_delete_history"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fc_create_delete_history"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."fc_get_all_table"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."fc_get_all_table"() TO "anon";
GRANT ALL ON FUNCTION "public"."fc_get_all_table"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fc_get_all_table"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_admin_dashboard"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_dashboard"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_dashboard"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_settlement_list"("user_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_settlement_list"("user_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_settlement_list"("user_id" "text") TO "service_role";

REVOKE ALL ON FUNCTION "public"."getroles"("p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."getroles"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."getroles"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."getroles"("p_user_id" "uuid") TO "service_role";

GRANT ALL ON TABLE "public"."payment_invoices" TO "anon";
GRANT ALL ON TABLE "public"."payment_invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_invoices" TO "service_role";

REVOKE ALL ON FUNCTION "public"."pay_qr_invoice"("code" "text", "issuer_lender_id" bigint, "first_name" "text", "last_name" "text", "id_number" "text", "phone_number" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."pay_qr_invoice"("code" "text", "issuer_lender_id" bigint, "first_name" "text", "last_name" "text", "id_number" "text", "phone_number" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."pay_qr_invoice"("code" "text", "issuer_lender_id" bigint, "first_name" "text", "last_name" "text", "id_number" "text", "phone_number" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pay_qr_invoice"("code" "text", "issuer_lender_id" bigint, "first_name" "text", "last_name" "text", "id_number" "text", "phone_number" "text") TO "service_role";

REVOKE ALL ON FUNCTION "public"."settled_amount"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."settled_amount"() TO "anon";
GRANT ALL ON FUNCTION "public"."settled_amount"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."settled_amount"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."test_unsettlement"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."test_unsettlement"() TO "anon";
GRANT ALL ON FUNCTION "public"."test_unsettlement"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_unsettlement"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."total_buyers"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."total_buyers"() TO "anon";
GRANT ALL ON FUNCTION "public"."total_buyers"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."total_buyers"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."total_fee_amount"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."total_fee_amount"() TO "anon";
GRANT ALL ON FUNCTION "public"."total_fee_amount"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."total_fee_amount"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."total_lend_amount"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."total_lend_amount"() TO "anon";
GRANT ALL ON FUNCTION "public"."total_lend_amount"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."total_lend_amount"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."total_received_amount"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."total_received_amount"() TO "anon";
GRANT ALL ON FUNCTION "public"."total_received_amount"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."total_received_amount"() TO "service_role";

GRANT ALL ON FUNCTION "public"."total_sales"() TO "anon";
GRANT ALL ON FUNCTION "public"."total_sales"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."total_sales"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."unsettled_amount"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."unsettled_amount"() TO "anon";
GRANT ALL ON FUNCTION "public"."unsettled_amount"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."unsettled_amount"() TO "service_role";

GRANT ALL ON TABLE "public"."amount" TO "anon";
GRANT ALL ON TABLE "public"."amount" TO "authenticated";
GRANT ALL ON TABLE "public"."amount" TO "service_role";

GRANT ALL ON TABLE "public"."banks" TO "anon";
GRANT ALL ON TABLE "public"."banks" TO "authenticated";
GRANT ALL ON TABLE "public"."banks" TO "service_role";

GRANT ALL ON SEQUENCE "public"."bank_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bank_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bank_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."batch_job_execution" TO "anon";
GRANT ALL ON TABLE "public"."batch_job_execution" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_job_execution" TO "service_role";

GRANT ALL ON TABLE "public"."batch_job_execution_context" TO "anon";
GRANT ALL ON TABLE "public"."batch_job_execution_context" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_job_execution_context" TO "service_role";

GRANT ALL ON TABLE "public"."batch_job_execution_params" TO "anon";
GRANT ALL ON TABLE "public"."batch_job_execution_params" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_job_execution_params" TO "service_role";

GRANT ALL ON SEQUENCE "public"."batch_job_execution_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."batch_job_execution_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."batch_job_execution_seq" TO "service_role";

GRANT ALL ON TABLE "public"."batch_job_instance" TO "anon";
GRANT ALL ON TABLE "public"."batch_job_instance" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_job_instance" TO "service_role";

GRANT ALL ON SEQUENCE "public"."batch_job_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."batch_job_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."batch_job_seq" TO "service_role";

GRANT ALL ON TABLE "public"."batch_step_execution" TO "anon";
GRANT ALL ON TABLE "public"."batch_step_execution" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_step_execution" TO "service_role";

GRANT ALL ON TABLE "public"."batch_step_execution_context" TO "anon";
GRANT ALL ON TABLE "public"."batch_step_execution_context" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_step_execution_context" TO "service_role";

GRANT ALL ON SEQUENCE "public"."batch_step_execution_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."batch_step_execution_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."batch_step_execution_seq" TO "service_role";

GRANT ALL ON TABLE "public"."lenders" TO "anon";
GRANT ALL ON TABLE "public"."lenders" TO "authenticated";
GRANT ALL ON TABLE "public"."lenders" TO "service_role";

GRANT ALL ON SEQUENCE "public"."bbsb_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bbsb_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bbsb_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."lender_merchant" TO "anon";
GRANT ALL ON TABLE "public"."lender_merchant" TO "authenticated";
GRANT ALL ON TABLE "public"."lender_merchant" TO "service_role";

GRANT ALL ON SEQUENCE "public"."bbsb_merchant_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bbsb_merchant_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bbsb_merchant_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."lender_user" TO "anon";
GRANT ALL ON TABLE "public"."lender_user" TO "authenticated";
GRANT ALL ON TABLE "public"."lender_user" TO "service_role";

GRANT ALL ON SEQUENCE "public"."bbsb_user_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bbsb_user_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bbsb_user_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."cities" TO "anon";
GRANT ALL ON TABLE "public"."cities" TO "authenticated";
GRANT ALL ON TABLE "public"."cities" TO "service_role";

GRANT ALL ON SEQUENCE "public"."cities_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cities_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cities_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";

GRANT ALL ON TABLE "public"."delete_history" TO "anon";
GRANT ALL ON TABLE "public"."delete_history" TO "authenticated";
GRANT ALL ON TABLE "public"."delete_history" TO "service_role";

GRANT ALL ON SEQUENCE "public"."delete_history_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."delete_history_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."delete_history_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."dictionaries" TO "anon";
GRANT ALL ON TABLE "public"."dictionaries" TO "authenticated";
GRANT ALL ON TABLE "public"."dictionaries" TO "service_role";

GRANT ALL ON SEQUENCE "public"."dictionaries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."dictionaries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."dictionaries_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."districts" TO "anon";
GRANT ALL ON TABLE "public"."districts" TO "authenticated";
GRANT ALL ON TABLE "public"."districts" TO "service_role";

GRANT ALL ON SEQUENCE "public"."districts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."districts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."districts_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."dynamic_qr_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."dynamic_qr_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."dynamic_qr_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";

GRANT ALL ON SEQUENCE "public"."dynamic_qr_request_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."dynamic_qr_request_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."dynamic_qr_request_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."merchant_branch_user" TO "anon";
GRANT ALL ON TABLE "public"."merchant_branch_user" TO "authenticated";
GRANT ALL ON TABLE "public"."merchant_branch_user" TO "service_role";

GRANT ALL ON SEQUENCE "public"."merchant_branch_user_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."merchant_branch_user_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."merchant_branch_user_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."merchant_branchs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."merchant_branchs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."merchant_branchs_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."merchant_document" TO "anon";
GRANT ALL ON TABLE "public"."merchant_document" TO "authenticated";
GRANT ALL ON TABLE "public"."merchant_document" TO "service_role";

GRANT ALL ON SEQUENCE "public"."merchant_document_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."merchant_document_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."merchant_document_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."merchant_secondary_lender" TO "anon";
GRANT ALL ON TABLE "public"."merchant_secondary_lender" TO "authenticated";
GRANT ALL ON TABLE "public"."merchant_secondary_lender" TO "service_role";

GRANT ALL ON SEQUENCE "public"."merchant_secondary_lender_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."merchant_secondary_lender_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."merchant_secondary_lender_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."merchant_settlements" TO "anon";
GRANT ALL ON TABLE "public"."merchant_settlements" TO "authenticated";
GRANT ALL ON TABLE "public"."merchant_settlements" TO "service_role";

GRANT ALL ON SEQUENCE "public"."merchant_settlement_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."merchant_settlement_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."merchant_settlement_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."merchant_user" TO "anon";
GRANT ALL ON TABLE "public"."merchant_user" TO "authenticated";
GRANT ALL ON TABLE "public"."merchant_user" TO "service_role";

GRANT ALL ON SEQUENCE "public"."merchant_user_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."merchant_user_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."merchant_user_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."merchants" TO "anon";
GRANT ALL ON TABLE "public"."merchants" TO "authenticated";
GRANT ALL ON TABLE "public"."merchants" TO "service_role";

GRANT ALL ON SEQUENCE "public"."merchants_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."merchants_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."merchants_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."payment_settlements" TO "anon";
GRANT ALL ON TABLE "public"."payment_settlements" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_settlements" TO "service_role";

GRANT ALL ON SEQUENCE "public"."payment_settlement_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payment_settlement_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payment_settlement_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."payment_transactions" TO "anon";
GRANT ALL ON TABLE "public"."payment_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_transactions" TO "service_role";

GRANT ALL ON SEQUENCE "public"."payment_transaction_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payment_transaction_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payment_transaction_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."product_lender" TO "anon";
GRANT ALL ON TABLE "public"."product_lender" TO "authenticated";
GRANT ALL ON TABLE "public"."product_lender" TO "service_role";

GRANT ALL ON SEQUENCE "public"."product_lender_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_lender_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_lender_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";

GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."role_permission" TO "anon";
GRANT ALL ON TABLE "public"."role_permission" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permission" TO "service_role";

GRANT ALL ON SEQUENCE "public"."role_permission_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."role_permission_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."role_permission_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";

GRANT ALL ON TABLE "public"."settlement_list" TO "anon";
GRANT ALL ON TABLE "public"."settlement_list" TO "authenticated";
GRANT ALL ON TABLE "public"."settlement_list" TO "service_role";

GRANT ALL ON TABLE "public"."tokens" TO "anon";
GRANT ALL ON TABLE "public"."tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."tokens" TO "service_role";

GRANT ALL ON TABLE "public"."unsettlement" TO "anon";
GRANT ALL ON TABLE "public"."unsettlement" TO "authenticated";
GRANT ALL ON TABLE "public"."unsettlement" TO "service_role";

GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";

GRANT ALL ON TABLE "public"."user_role" TO "anon";
GRANT ALL ON TABLE "public"."user_role" TO "authenticated";
GRANT ALL ON TABLE "public"."user_role" TO "service_role";

GRANT ALL ON SEQUENCE "public"."user_role_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_role_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_role_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
