# Guía del repositorio

## Proyecto y ejecución

Pipeline Neuro es una aplicación web de aprendizaje de idiomas construida con HTML, CSS y JavaScript, con manifiesto PWA y service worker. No hay un manifiesto de paquetes ni comandos de compilación o pruebas configurados en la raíz.

Para probarla, sirve la raíz mediante un servidor HTTP local; si Python está disponible, puede usarse `python -m http.server 8000`. Abre `http://localhost:8000`. El manifiesto y las listas de caché contienen rutas absolutas desde `/`.

## Estructura

- `index.html`: página principal y orden explícito de carga de scripts.
- `css/style.css`: estilos de la aplicación.
- `js/app.js`: inicialización y coordinación de módulos.
- `js/database.js`: persistencia local de usuarios, configuración y aprendizaje; base `PipelineDB`.
- `js/core/`: gestores compartidos de idiomas, niveles, progreso y otras funciones.
- `js/ui/`: interfaz dividida por funcionalidad; temas, espacio y caracteres separan lógica, renderizado y acciones.
- `js/ui.js`: proxy de la interfaz.
- Otros archivos de `js/`: pipeline de aprendizaje, gramática, fonética, tutores y modos de estudio.
- `service-worker.js` y `manifest.json`: caché, funcionamiento offline e instalación PWA.
- `data/`, `icons/` y `screenshots/`: datos y recursos estáticos.

## Criterios de cambio

Conserva el estilo y las convenciones del módulo editado, incluidos los nombres en español. Mantén UTF-8 para textos, tildes y caracteres de los idiomas estudiados.

Respeta el orden de scripts y sus dependencias globales en `index.html`. Comprueba qué módulos se cargan realmente antes de modificar una funcionalidad. No introduzcas un framework, bundler o sistema de paquetes salvo que el trabajo lo requiera.

Protege los datos persistidos: los cambios en el esquema de la base deben contemplar la migración de datos existentes. No uses el borrado del almacenamiento como solución habitual a errores.

Cuando cambien recursos cacheados, revisa las listas y la estrategia de versión de `service-worker.js`. Evita cambios de versión ajenos a la tarea.

## Verificación

Realiza comprobaciones proporcionales al cambio. Para JavaScript, puede usarse `node --check ruta/al/archivo.js` si Node está disponible; esta comprobación solo valida sintaxis.

Para cambios de comportamiento, comprueba en el navegador el arranque y el flujo afectado, y revisa errores de consola. Verifica persistencia tras recargar cuando corresponda. Para cambios PWA, comprueba también el comportamiento del service worker y offline. Distingue las comprobaciones realizadas de las que no pudieron ejecutarse.

## Project-specific rules

- Preserve the existing application logic unless a change is explicitly required.
- Do not remove existing functionality.
- Before changing a large function, inspect where it is used elsewhere in the project.
- Keep the existing code style and structure whenever possible.
- Avoid unnecessary refactors when fixing a specific issue.

### Internationalization / UI rules

- The UI must support Spanish, English, and Simplified Chinese.
- All user-visible UI text must use the existing internationalization system.
- Do not leave new hardcoded visible text inside HTML or JavaScript.
- Reuse existing translation keys when appropriate instead of creating duplicates.
- When adding a new visible string, add the corresponding translations for Spanish, English, and Simplified Chinese.
- Do not translate text that is intentionally shown in its native or source language.
- Preserve dynamic values, placeholders, variables, HTML structure, and event handlers when internationalizing text.
- Check modal dialogs, buttons, tooltips, labels, status messages, generated HTML, alerts, and dynamically created UI text.
- When modifying translations, verify that all three languages contain equivalent entries.

### Safety when editing the project

- Make the smallest change necessary to complete the requested task.
- Do not modify unrelated files.
- Do not rename functions, IDs, CSS classes, translation keys, or variables unless necessary.
- Do not change public behavior or existing workflows unless explicitly requested.
- If a change could affect multiple parts of the application, inspect the references before editing.
- After making changes, review the diff for accidental or unrelated modifications.
