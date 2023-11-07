set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.settled_amount()
 RETURNS SETOF payment_invoices
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.test_unsettlement()
 RETURNS SETOF payment_invoices
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.total_buyers()
 RETURNS SETOF payment_invoices
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.unsettled_amount()
 RETURNS SETOF payment_invoices
 LANGUAGE plpgsql
AS $function$
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
$function$
;


