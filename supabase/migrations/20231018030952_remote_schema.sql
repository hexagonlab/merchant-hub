alter table "storage"."objects" add constraint "objects_owner_fkey" FOREIGN KEY (owner) REFERENCES auth.users(id) not valid;

alter table "storage"."objects" validate constraint "objects_owner_fkey";

create policy "merchant storage authenticated user select insert 1qo9sqw_0"
on "storage"."objects"
as permissive
for select
to authenticated
using ((bucket_id = 'merchant'::text));


create policy "merchant storage authenticated user select insert 1qo9sqw_1"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'merchant'::text));



