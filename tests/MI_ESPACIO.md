# Verificación de Mi Espacio

Rama: `mejorar-miEspacio`.

El rediseño conserva la biblioteca por nivel/familia, los detalles y las acciones
de importación, exportación y ejercicios. Añade una sesión de hasta diez frases
guardadas del idioma activo, priorizando nuevas y vencidas. Las métricas superiores
usan toda la colección del idioma, aunque la búsqueda reduzca los resultados.
La práctica registrada requiere respuestas en `repasosExitosos` o `repasosFallidos`;
abrir una frase no cuenta como practicarla. No equivale a dominio.

Correcciones relacionadas: elementos sin clasificar visibles; progreso de palabras
separado del de frases; dominio calculado incluyendo elementos sin práctica;
consulta de rachas sin escrituras; estudio de familia limitado al nivel e idioma
de la colección; búsqueda con espera breve, foco conservado y paginación reiniciada.

## Comprobaciones realizadas

- `node --test tests/mi-espacio.cjs`: seis pruebas con datos aislados.
- Sintaxis de los JavaScript modificados y `git diff --check`.
- Navegador: vista con contenido y vacía, búsqueda sin coincidencias, limpiar
  filtros y botón de práctica; interfaz en español, inglés y chino simplificado.
- Revisión visual en 1280 px y 390 px. Sin errores de consola en la prueba aislada.

`tests/mi-espacio.html` carga los componentes reales con proveedores de datos
ficticios y sustituye el destino de estudio por un contador. No usa IndexedDB.
Sirve para revisar composición e interacciones de la portada, no valida los
modales de importación ni una sesión SRS completa contra los datos del usuario.
Abrir mediante Live Server. Los controles ES/EN/中文 cambian el idioma de interfaz
del origen de pruebas; el contenido pedagógico permanece en su idioma.

Antes de publicar: probar desde la aplicación real con la colección existente,
completar una sesión, regresar a Mi Espacio y verificar el progreso tras recargar.
Revisar también importación/exportación y el nuevo caché del service worker.
Esta rama no cambia el esquema de IndexedDB. Los phrasal verbs quedan fuera.
