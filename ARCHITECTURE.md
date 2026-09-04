# Arquitectura técnica

## Producción recomendada

Browser → Vercel/Next.js → Supabase Auth + PostgreSQL + Storage + Realtime.

### Frontend
Next.js App Router + TypeScript. La interfaz usa Server Components para consultas y Client Components solo donde hay interacción.

### Backend
Route Handlers de Next.js para operaciones sensibles. `SUPABASE_SERVICE_ROLE_KEY` existe únicamente en el servidor para operaciones administrativas como resolución de teléfono/invitaciones.

### Datos
PostgreSQL con relaciones normalizadas y Row Level Security. La interfaz no es la barrera de seguridad: las políticas RLS también limitan el acceso.

### Archivos
Supabase Storage:
- `company-assets`: logo/membrete, privado.
- `product-images`: imágenes del catálogo.
- `order-files`: diseños y documentos, privado.

### Identidad ProPublic
Se incorporaron los recursos gráficos proporcionados en `public/` como punto de partida para la identidad visual.
