-- Ejecutar después de schema.sql
insert into storage.buckets (id,name,public)
values
('company-assets','company-assets',false),
('product-images','product-images',true),
('order-files','order-files',false)
on conflict (id) do update set public=excluded.public;

-- Los archivos privados requieren usuario autenticado.
create policy "authenticated read company assets"
on storage.objects for select to authenticated
using (bucket_id='company-assets');

create policy "authenticated upload company assets"
on storage.objects for insert to authenticated
with check (bucket_id='company-assets');

create policy "authenticated read order files"
on storage.objects for select to authenticated
using (bucket_id='order-files');

create policy "authenticated upload order files"
on storage.objects for insert to authenticated
with check (bucket_id='order-files');

create policy "authenticated read product images"
on storage.objects for select to public
using (bucket_id='product-images');

create policy "admin upload product images"
on storage.objects for insert to authenticated
with check (bucket_id='product-images');
