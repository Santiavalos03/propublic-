-- Después de crear el usuario administrador en Supabase Auth:
-- Reemplace EMAIL_AQUI por el correo del usuario.
update public.profiles
set role='admin', status='active'
where email='EMAIL_AQUI';
