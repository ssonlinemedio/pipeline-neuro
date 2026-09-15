# Auditoría de viabilidad de Supabase

## Conclusión ejecutiva

Supabase es viable para Pipeline Neuro como servicio opcional de autenticación,
backup y sincronización. IndexedDB debe continuar siendo la base operativa y la
aplicación debe funcionar sin cuenta, sin conexión y aunque Supabase no esté
disponible.

La estrategia recomendada es no subir a Supabase las historias predefinidas,
frases, palabras ni recursos pesados de `data/`. El contenido se distribuye con
la PWA y se reconstruye localmente. Supabase almacena únicamente el estado del
usuario sobre ese contenido.

## Qué se sincroniza

- Estado de temas e historias predefinidas.
- RCN, fase SRS, fechas de repaso y dominio por unidad de aprendizaje.
- Favoritos y estado portable de `MisTemas`.
- Estado semántico de Elipse y Ondas Cruzadas: progreso, unidades completadas,
  puntuaciones y configuración mínima necesaria.
- Historias creadas por el usuario y su estado, como categoría independiente.

No se sincronizan sesiones efímeras, snapshots completos, audio, TTS, cachés,
voces, API keys ni estados temporales de interfaz.

## Identidad estable del contenido

Los IDs autoincrementales actuales de IndexedDB no sirven como identidad
multidispositivo. Cada recurso predefinido sincronizable necesita una clave
lógica estable, independiente del dispositivo, por ejemplo:

```text
tema:    zh-hsk1-tema-viajes
historia: zh-hsk1-historia-003
frase:   zh-hsk1-historia-003-frase-014
```

La clave lógica debe complementarse con una versión del contenido. No se debe
usar el hash del texto como única identidad, porque una corrección textual no
debe borrar el progreso existente.

## Recuperación e importación masiva

El flujo de recuperación recomendado es:

```text
importar data/
  -> normalizar catálogo local
  -> conservar/crear contenido por clave estable
  -> descargar estados del usuario
  -> asociar estados por clave estable y versión
  -> reconstruir IndexedDB
```

La importación debe ser idempotente y no sobrescribir estados de aprendizaje.
El `pull` remoto se ejecuta después de que el catálogo local esté disponible.

## Sincronización

La UI no debe llamar directamente a Supabase. La arquitectura objetivo es:

```text
UI -> Repository -> IndexedDB -> Sync Engine -> Supabase
```

El Sync Engine debe usar una cola local persistente, operaciones idempotentes,
`updatedAt`, `version`, `syncStatus` y tombstones (`deletedAt`). El estudio no
debe esperar a una petición remota. La primera versión puede usar Last Write
Wins, documentando sus limitaciones.

## Plan gratuito

El plan gratuito es suficiente para una primera comunidad si solo se sincroniza
estado personal. El riesgo no es el número de peticiones, sino descargar datos
completos repetidamente, almacenar sesiones detalladas o subir el contenido
predefinido duplicado. Deben monitorizarse tamaño de base de datos, egress y
usuarios activos. El proyecto gratuito puede pausarse tras inactividad y no debe
considerarse la única copia de seguridad.

## Orden recomendado de implementación

1. Inventariar stores, relaciones y escritores actuales.
2. Definir claves estables y versión del catálogo.
3. Separar contenido, estado sincronizable y estado exclusivamente local.
4. Añadir repositories sin cambiar el comportamiento offline.
5. Implementar Sync Engine para historias propias y progreso principal.
6. Añadir Auth opcional y migración local inicial.
7. Incorporar progresivamente temas, Elipse y Ondas Cruzadas.

No se recomienda introducir inicialmente Storage, Realtime ni Edge Functions.

## Simulación de dos usuarios y dos dispositivos

Se ejecutó `tests/supabase-sync-simulation.cjs` con dos dispositivos del usuario
A, un dispositivo del usuario B, modo offline, reconexión y actualizaciones
repetidas de la misma unidad. Resultado: `PASS`.

- La cola conserva cambios offline.
- Las actualizaciones repetidas se agrupan.
- La reconexión vacía correctamente la cola.
- Dos dispositivos pueden sincronizar el mismo usuario.
- El `user_id` se toma de la sesión autenticada y distingue a los usuarios.

Esta prueba es una simulación del contrato del cliente; todavía no sustituye
una prueba real contra el proyecto Supabase ni una prueba visual en navegador.
