# Correcciones críticas y de prioridad alta

Este paquete contiene cambios de código para probar localmente con VSCode y Live Server. No incluye commits ni push.

## Instalación

1. Haz una copia de seguridad del proyecto actual.
2. Descomprime el ZIP en una carpeta temporal.
3. Copia sus carpetas `js/` y el `index.html` sobre el proyecto, conservando la estructura.
4. No sobrescribas `AGENTS.md` si tu copia contiene reglas o cambios propios.
5. Abre `index.html` mediante Live Server (el service worker requiere HTTP; no abras el archivo con `file://`).

## Verificación funcional

- Crear o restaurar un tema y comprobar que usuario, idioma y datos sobreviven a una recarga.
- Crear varias historias del mismo tema y verificar que la siguiente generación recibe el historial acumulado.
- Generar/importar una Elipse y comprobar que incluye todas las historias anteriores del tema, excluyendo Ondas Cruzadas.
- Generar/importar una Onda Cruzada y comprobar que conserva el tema/idioma correcto y no altera la secuencia normal de Elipse.
- Generar otra historia usando el mismo nombre de tema desde ambos generadores y comprobar que el JSON contiene `contexto_narrativo_acumulado`, con resúmenes de historias, continuidad de personajes y hechos, además del vocabulario existente.
- Responder una frase escrita y una tarjeta de caracteres; comprobar que cada progreso queda en su almacén independiente.
- Marcar una historia como completada manualmente y comprobar que no se falsea el RCN de sus frases.
- Exportar un backup, restaurarlo y confirmar que los IDs y las relaciones tema-historia-frase permanecen intactos.

## Validación técnica realizada

Se ejecutó `node --check` sobre todos los JavaScript modificados, incluido `index.html` mediante revisión estructural básica. No se ejecutó un navegador ni se generaron commits.
