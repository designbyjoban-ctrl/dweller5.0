create policy if not exists admin_full on storage.objects for all
  using (public.is_admin()) with check (public.is_admin());

create policy if not exists tenant_read_list on storage.objects for select
using (
  bucket_id in ('inspection_photos','shared_docs') and
  (storage.foldername(name))[1] = 'tenancy' and
  exists (
    select 1 from public.tenancies t
    where t.tenant_user_id = auth.uid()
      and t.id::text = (storage.foldername(name))[2]
  )
);

create policy if not exists tenant_upload on storage.objects for insert
with check (
  bucket_id in ('inspection_photos','shared_docs') and
  (storage.foldername(name))[1] = 'tenancy' and
  exists (
    select 1 from public.tenancies t
    where t.tenant_user_id = auth.uid()
      and t.id::text = (storage.foldername(name))[2]
  )
);

create policy if not exists tenant_no_delete on storage.objects for delete using (false);
