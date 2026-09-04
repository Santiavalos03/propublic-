# Plan de pruebas de aceptación — ProPublic Sistema Integral

1. Auth: login por email y teléfono; usuario inactivo rechazado.
2. RBAC: vendedor A no puede leer presupuestos del vendedor B (RLS).
3. Diseñador no puede leer cajas/pagos administrativos que no le correspondan.
4. Producción no puede modificar ventas ni pagos.
5. Código de cliente único y secuencial.
6. Precios por cantidad: seleccionar el tramo aplicable.
7. Presupuesto: subtotal + IVA 10%, descuento y total.
8. Descuento: cliente correcto, activo, fechas válidas y límite de usos.
9. Consulta pública: presupuesto accesible por número/token sin exponer datos privados innecesarios.
10. Pagos: múltiples pagos y saldo = total - pagos.
11. Pedido: estados y reproceso conservan historial.
12. Diseño: V1/V2/V3 no se sobrescriben.
13. Auditoría: actor, acción, módulo, registro y fecha.
14. Realtime: pedidos, diseño, producción y notificaciones.
15. Storage: archivos sensibles en bucket privado.
16. Responsive: 360px, 768px y escritorio.

Las pruebas E2E automatizadas deben ejecutarse contra un proyecto Supabase de staging antes de producción.
