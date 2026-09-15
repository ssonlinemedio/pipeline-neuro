# Supabase

Backend opcional de Pipeline Neuro. El contenido predefinido de `data/` no se
sube: las tablas guardan el estado del usuario mediante claves estables para
reaplicarlo después de una importación local.

Aplicación prevista:

1. Revisar y ejecutar la migración en el SQL Editor de Supabase.
2. Confirmar RLS y probar aislamiento entre dos usuarios.
3. No incluir nunca la `service_role key` en el frontend.
4. Implementar después el cliente, Auth y la migración local inicial.

## Administradores

El primer administrador se declara manualmente en el SQL Editor con la
sentencia comentada al final de `003_catalog_moderation.sql`, usando el correo
de la cuenta Supabase administradora. Nunca se asigna el rol desde el frontend.
Las propuestas de usuarios permanecen pendientes hasta su aprobación.
