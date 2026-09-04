# ProPublic Sistema Integral

Aplicación empresarial multiusuario para **ProPublic — Capital One Corporaciones E.A.S.**

## Arquitectura elegida

- **Next.js + TypeScript**: frontend y backend en un único repositorio, con rutas API/server-side.
- **Supabase PostgreSQL**: base de datos relacional real, RLS y consultas seguras.
- **Supabase Auth**: autenticación de usuarios.
- **Supabase Storage**: archivos, diseños, imágenes y membretes.
- **Vercel**: despliegue recomendado del frontend/backend Next.js.
- **QR**: paquete `qrcode`, generados en servidor.
- **PDF**: ruta de documento preparada para generación server-side. Para producción, se recomienda añadir `@react-pdf/renderer` o `pdf-lib` según el formato final de membrete.

## Estado

Este repositorio contiene una **base empresarial integrada y ejecutable**, incluyendo esquema SQL, RLS, autenticación, RBAC, clientes, productos, presupuestos, ventas, pagos, pedidos, diseño, producción, caja, auditoría, notificaciones, almacenamiento y configuración.

No usa `localStorage` como base de datos.

## Puesta online

> Este repositorio ya incluye `middleware.ts` para refrescar la sesión de Supabase y bloquear las rutas internas cuando no existe una sesión válida.

### 1. Crear Supabase

1. Crear un proyecto en Supabase.
2. En SQL Editor ejecutar `supabase/schema.sql` completo.
3. En Storage crear los buckets:
   - `company-assets` (privado)
   - `product-images` (público si se desea catálogo público)
   - `order-files` (privado)
4. Configurar Auth > Email. Para inicio con teléfono + contraseña, este proyecto resuelve el teléfono a un correo interno en el servidor; la contraseña sigue siendo gestionada por Supabase Auth.
5. Copiar URL y anon key a `.env.local`.
6. Copiar el service role key **solo** a `.env.local` del servidor/Vercel. Nunca a `NEXT_PUBLIC_*`.

### 2. Crear primer administrador

Crear un usuario desde Supabase Auth y luego asignarle rol `admin` en `profiles` (el SQL incluye el rol inicial). Para automatizar esto en una primera instalación puede usarse el SQL de `supabase/bootstrap_admin.sql`.

### 3. Ejecutar

```bash
npm install
npm run dev
```

### 4. Vercel

Importar el repositorio, agregar las mismas variables de entorno y desplegar.

### 5. Dominio

En Vercel: Settings > Domains > agregar el dominio y configurar en DNS el registro que Vercel indique. Luego colocar la URL final en `NEXT_PUBLIC_APP_URL`.

## Canva

Canva puede utilizarse como herramienta de diseño/publicación de páginas, pero **no sustituye el backend, PostgreSQL, autenticación ni Storage**. La aplicación empresarial debe mantenerse alojada en Vercel/Next.js + Supabase. Si se quiere mostrar un acceso desde un sitio Canva, se puede colocar un botón/enlace hacia el sistema (por ejemplo `https://sistema.tudominio.com/login`). No se deben poner claves privadas de Supabase en Canva.

## Roles

- `admin`
- `seller`
- `designer`
- `production`

Las restricciones principales están en RLS, no solamente en la interfaz.

## Próximos pasos de producción

- Añadir proveedor de correo transaccional (Resend/SMTP) para invitaciones y avisos.
- Activar backups/PITR de Supabase según el plan.
- Configurar políticas exactas de retención de archivos.
- Añadir pruebas automatizadas E2E con Playwright.
- Añadir PDF visual definitivo con el membrete real cargado desde `company_settings`.

