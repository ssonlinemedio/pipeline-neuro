// ============================================================
// GESTOR DE IDIOMAS v2.4 - CON ACTUALIZACIÓN DE VERSIONES VÍA GROQ
// ============================================================

class GestorIdiomas {
    constructor() {
        this.idiomas = [];
        this.idiomaActivo = null;
        this.idiomasNativos = [];
        this.idiomaNativoActivo = null;
        this._initDone = false;
        this._cargando = false;
        this._cargaFallida = false;
        this._idiomasJeroglificos = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        this._palabrasPorNivelFallback = {
            'A1': 500,
            'A2': 1000,
            'B1': 2000,
            'B2': 4000,
            'C1': 8000,
            'C2': 16000
        };
        
        // ============================================================
        // VERSIONES DE ESTÁNDAR POR IDIOMA
        // ============================================================
        this._VERSIONES_ESTANDAR = {
            'zh': {
                'v2.0': { nombre: 'HSK 2.0 (Clásico)', descripcion: '150 palabras en A1, 300 en A2', palabras: { 'A1': 150, 'A2': 300, 'B1': 600, 'B2': 1200, 'C1': 2500, 'C2': 5000 } },
                'v3.0': { nombre: 'HSK 3.0 (Nuevo)', descripcion: '500 palabras en A1, 1200 en A2', palabras: { 'A1': 500, 'A2': 1200, 'B1': 2500, 'B2': 5000, 'C1': 10000, 'C2': 20000 } }
            },
            'chino': {
                'v2.0': { nombre: 'HSK 2.0 (Clásico)', descripcion: '150 palabras en A1', palabras: { 'A1': 150, 'A2': 300, 'B1': 600, 'B2': 1200, 'C1': 2500, 'C2': 5000 } },
                'v3.0': { nombre: 'HSK 3.0 (Nuevo)', descripcion: '500 palabras en A1', palabras: { 'A1': 500, 'A2': 1200, 'B1': 2500, 'B2': 5000, 'C1': 10000, 'C2': 20000 } }
            },
            'chinese': {
                'v2.0': { nombre: 'HSK 2.0 (Classic)', descripcion: '150 words in A1', palabras: { 'A1': 150, 'A2': 300, 'B1': 600, 'B2': 1200, 'C1': 2500, 'C2': 5000 } },
                'v3.0': { nombre: 'HSK 3.0 (New)', descripcion: '500 words in A1', palabras: { 'A1': 500, 'A2': 1200, 'B1': 2500, 'B2': 5000, 'C1': 10000, 'C2': 20000 } }
            },
            'mandarín': {
                'v2.0': { nombre: 'HSK 2.0 (Clásico)', descripcion: '150 palabras en A1', palabras: { 'A1': 150, 'A2': 300, 'B1': 600, 'B2': 1200, 'C1': 2500, 'C2': 5000 } },
                'v3.0': { nombre: 'HSK 3.0 (Nuevo)', descripcion: '500 palabras en A1', palabras: { 'A1': 500, 'A2': 1200, 'B1': 2500, 'B2': 5000, 'C1': 10000, 'C2': 20000 } }
            },
            'mandarin': {
                'v2.0': { nombre: 'HSK 2.0 (Classic)', descripcion: '150 words in A1', palabras: { 'A1': 150, 'A2': 300, 'B1': 600, 'B2': 1200, 'C1': 2500, 'C2': 5000 } },
                'v3.0': { nombre: 'HSK 3.0 (New)', descripcion: '500 words in A1', palabras: { 'A1': 500, 'A2': 1200, 'B1': 2500, 'B2': 5000, 'C1': 10000, 'C2': 20000 } }
            },
            'ja': {
                'v1.0': { nombre: 'JLPT (N5-N1)', descripcion: '800 palabras en N5', palabras: { 'A1': 800, 'A2': 1500, 'B1': 3000, 'B2': 6000, 'C1': 10000, 'C2': 20000 } }
            },
            'japonés': {
                'v1.0': { nombre: 'JLPT (N5-N1)', descripcion: '800 palabras en N5', palabras: { 'A1': 800, 'A2': 1500, 'B1': 3000, 'B2': 6000, 'C1': 10000, 'C2': 20000 } }
            },
            'japanese': {
                'v1.0': { nombre: 'JLPT (N5-N1)', descripcion: '800 words in N5', palabras: { 'A1': 800, 'A2': 1500, 'B1': 3000, 'B2': 6000, 'C1': 10000, 'C2': 20000 } }
            },
            'ko': {
                'v1.0': { nombre: 'TOPIK (Level 1-6)', descripcion: '800 palabras en Level 1', palabras: { 'A1': 800, 'A2': 1500, 'B1': 3000, 'B2': 6000, 'C1': 10000, 'C2': 20000 } }
            },
            'coreano': {
                'v1.0': { nombre: 'TOPIK (Level 1-6)', descripcion: '800 palabras en Level 1', palabras: { 'A1': 800, 'A2': 1500, 'B1': 3000, 'B2': 6000, 'C1': 10000, 'C2': 20000 } }
            },
            'korean': {
                'v1.0': { nombre: 'TOPIK (Level 1-6)', descripcion: '800 words in Level 1', palabras: { 'A1': 800, 'A2': 1500, 'B1': 3000, 'B2': 6000, 'C1': 10000, 'C2': 20000 } }
            },
            'es': {
                'v1.0': { nombre: 'DELE (A1-C2)', descripcion: 'Estándar MCER', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'español': {
                'v1.0': { nombre: 'DELE (A1-C2)', descripcion: 'Estándar MCER', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'spanish': {
                'v1.0': { nombre: 'DELE (A1-C2)', descripcion: 'MCER Standard', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'en': {
                'v1.0': { nombre: 'CEFR (A1-C2)', descripcion: 'Estándar MCER', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'inglés': {
                'v1.0': { nombre: 'CEFR (A1-C2)', descripcion: 'Estándar MCER', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'english': {
                'v1.0': { nombre: 'CEFR (A1-C2)', descripcion: 'MCER Standard', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'fr': {
                'v1.0': { nombre: 'DELF/DALF (A1-C2)', descripcion: 'Estándar MCER', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'francés': {
                'v1.0': { nombre: 'DELF/DALF (A1-C2)', descripcion: 'Estándar MCER', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'french': {
                'v1.0': { nombre: 'DELF/DALF (A1-C2)', descripcion: 'MCER Standard', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'de': {
                'v1.0': { nombre: 'Goethe (A1-C2)', descripcion: 'Estándar MCER', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'alemán': {
                'v1.0': { nombre: 'Goethe (A1-C2)', descripcion: 'Estándar MCER', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'german': {
                'v1.0': { nombre: 'Goethe (A1-C2)', descripcion: 'MCER Standard', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'it': {
                'v1.0': { nombre: 'CELI/CILS (A1-C2)', descripcion: 'Estándar MCER', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'italiano': {
                'v1.0': { nombre: 'CELI/CILS (A1-C2)', descripcion: 'Estándar MCER', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'italian': {
                'v1.0': { nombre: 'CELI/CILS (A1-C2)', descripcion: 'MCER Standard', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'pt': {
                'v1.0': { nombre: 'CAPLE (A1-C2)', descripcion: 'Estándar MCER', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'portugués': {
                'v1.0': { nombre: 'CAPLE (A1-C2)', descripcion: 'Estándar MCER', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'portuguese': {
                'v1.0': { nombre: 'CAPLE (A1-C2)', descripcion: 'MCER Standard', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'ru': {
                'v1.0': { nombre: 'TORFL (A1-C2)', descripcion: 'Estándar MCER', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'ruso': {
                'v1.0': { nombre: 'TORFL (A1-C2)', descripcion: 'Estándar MCER', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            },
            'russian': {
                'v1.0': { nombre: 'TORFL (A1-C2)', descripcion: 'MCER Standard', palabras: { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 } }
            }
        };
        
        // Versión por defecto para cada idioma
        this._VERSION_DEFECTO = {
            'zh': 'v3.0',
            'chino': 'v3.0',
            'chinese': 'v3.0',
            'mandarín': 'v3.0',
            'mandarin': 'v3.0',
            'ja': 'v1.0',
            'japonés': 'v1.0',
            'japanese': 'v1.0',
            'ko': 'v1.0',
            'coreano': 'v1.0',
            'korean': 'v1.0',
            'es': 'v1.0',
            'español': 'v1.0',
            'spanish': 'v1.0',
            'en': 'v1.0',
            'inglés': 'v1.0',
            'english': 'v1.0',
            'fr': 'v1.0',
            'francés': 'v1.0',
            'french': 'v1.0',
            'de': 'v1.0',
            'alemán': 'v1.0',
            'german': 'v1.0',
            'it': 'v1.0',
            'italiano': 'v1.0',
            'italian': 'v1.0',
            'pt': 'v1.0',
            'portugués': 'v1.0',
            'portuguese': 'v1.0',
            'ru': 'v1.0',
            'ruso': 'v1.0',
            'russian': 'v1.0',
            'default': 'v1.0'
        };
        
        // ============================================================
        // CACHÉ DE VERSIONES OBTENIDAS DE GROQ
        // ============================================================
        this._cacheVersiones = {};
        this._versionesActualizando = new Set();
        this._colaActualizacion = [];
        this._ultimaActualizacionGlobal = 0;
        this._intervaloActualizacion = 86400000; // 24 horas
        
        this._ultimaCarga = 0;
        this._cargaEnProgreso = false;
        this._cacheIdiomas = null;
        this._intentosCarga = 0;
        this._maxIntentosCarga = 5;
        this._recargandoIdioma = false;
        this._loadingOverlay = null;
        
        // Cargar caché de versiones desde localStorage
        this._cargarCacheVersiones();
    }

    // ============================================================
    // CACHÉ DE VERSIONES
    // ============================================================

    _cargarCacheVersiones() {
        try {
            const data = localStorage.getItem('pipeline_cache_versiones_idiomas');
            if (data) {
                const parsed = JSON.parse(data);
                this._cacheVersiones = parsed.versiones || {};
                this._ultimaActualizacionGlobal = parsed.ultimaActualizacion || 0;
                console.log('📦 Caché de versiones cargada:', Object.keys(this._cacheVersiones));
            }
        } catch (e) {
            console.warn('⚠️ Error cargando caché de versiones:', e);
        }
    }

    _guardarCacheVersiones() {
        try {
            localStorage.setItem('pipeline_cache_versiones_idiomas', JSON.stringify({
                versiones: this._cacheVersiones,
                ultimaActualizacion: this._ultimaActualizacionGlobal,
                fecha: new Date().toISOString()
            }));
        } catch (e) {
            console.warn('⚠️ Error guardando caché de versiones:', e);
        }
    }

    // ============================================================
    // OBTENER IDIOMA BASE (NORMALIZADO)
    // ============================================================

    _obtenerIdiomaBase(idioma) {
        if (!idioma) return 'default';
        const idiomaLower = idioma.toLowerCase().trim();
        
        const mapeo = {
            'zh': 'zh', 'chino': 'zh', 'chinese': 'zh',
            'mandarín': 'zh', 'mandarin': 'zh',
            'ja': 'ja', 'japonés': 'ja', 'japanese': 'ja',
            'ko': 'ko', 'coreano': 'ko', 'korean': 'ko',
            'es': 'es', 'español': 'es', 'spanish': 'es',
            'en': 'en', 'inglés': 'en', 'english': 'en',
            'fr': 'fr', 'francés': 'fr', 'french': 'fr',
            'de': 'de', 'alemán': 'de', 'german': 'de',
            'it': 'it', 'italiano': 'it', 'italian': 'it',
            'pt': 'pt', 'portugués': 'pt', 'portuguese': 'pt',
            'ru': 'ru', 'ruso': 'ru', 'russian': 'ru'
        };
        
        if (mapeo[idiomaLower]) return mapeo[idiomaLower];
        
        for (const [key, value] of Object.entries(mapeo)) {
            if (idiomaLower.includes(key) || key.includes(idiomaLower)) {
                return value;
            }
        }
        
        return 'default';
    }

    _getNombreIdioma(idioma) {
        const nombres = {
            'zh': 'Chino', 'chino': 'Chino', 'chinese': 'Chino',
            'ja': 'Japonés', 'japonés': 'Japonés', 'japanese': 'Japonés',
            'ko': 'Coreano', 'coreano': 'Coreano', 'korean': 'Coreano',
            'es': 'Español', 'español': 'Español', 'spanish': 'Español',
            'en': 'Inglés', 'inglés': 'Inglés', 'english': 'Inglés',
            'fr': 'Francés', 'francés': 'Francés', 'french': 'Francés',
            'de': 'Alemán', 'alemán': 'Alemán', 'german': 'Alemán',
            'it': 'Italiano', 'italiano': 'Italiano', 'italian': 'Italiano',
            'pt': 'Portugués', 'portugués': 'Portugués', 'portuguese': 'Portugués',
            'ru': 'Ruso', 'ruso': 'Ruso', 'russian': 'Ruso'
        };
        return nombres[idioma] || idioma;
    }

    // ============================================================
    // OBTENER ÚLTIMA VERSIÓN VÍA GROQ
    // ============================================================

    async _obtenerUltimaVersionDesdeGroq(idioma) {
        if (!window.vigia || !window.vigia.enLinea || !window.vigia._apiKeyValidada) {
            console.warn('⚠️ Vigía offline, no se puede obtener última versión');
            return null;
        }

        const idiomaBase = this._obtenerIdiomaBase(idioma);
        
        if (this._versionesActualizando.has(idiomaBase)) {
            console.log(`⏳ Ya hay una petición para "${idioma}" en curso`);
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!this._versionesActualizando.has(idiomaBase)) {
                        clearInterval(checkInterval);
                        resolve(this._cacheVersiones[idiomaBase] || null);
                    }
                }, 200);
            });
        }

        this._versionesActualizando.add(idiomaBase);

        try {
            console.log(`🔍 Buscando última versión para "${idioma}" en Groq...`);
            
            const nombreIdioma = this._getNombreIdioma(idioma);
            
            const prompt = `
Eres un experto en lingüística y certificaciones de idiomas.

Idioma: "${nombreIdioma}" (${idioma})

Tu tarea es identificar la ÚLTIMA VERSIÓN del estándar oficial para este idioma.

INFORMACIÓN IMPORTANTE:
1. Para CHINO: La última versión es HSK 3.0 (2021), que reemplaza al HSK 2.0 (2009)
   - HSK 3.0 tiene MÁS palabras: A1=500, A2=1200, B1=2500, B2=5000, C1=10000, C2=20000
   - HSK 2.0 tiene: A1=150, A2=300, B1=600, B2=1200, C1=2500, C2=5000

2. Para JAPONÉS: JLPT (N5-N1) sigue siendo el estándar
   - A1=800, A2=1500, B1=3000, B2=6000, C1=10000, C2=20000

3. Para COREANO: TOPIK sigue siendo el estándar
   - A1=800, A2=1500, B1=3000, B2=6000, C1=10000, C2=20000

4. Para otros idiomas, usa el estándar MCER (CEFR) con:
   - A1=500, A2=1000, B1=2000, B2=4000, C1=8000, C2=16000

Responde SOLO en formato JSON:
{
    "idioma": "${idioma}",
    "version_actual": "v3.0",
    "nombre_version": "HSK 3.0 (2021)",
    "descripcion": "Nuevo estándar con más vocabulario",
    "palabras_por_nivel": {
        "A1": 500,
        "A2": 1200,
        "B1": 2500,
        "B2": 5000,
        "C1": 10000,
        "C2": 20000
    },
    "fecha_actualizacion": "2021",
    "es_ultima": true,
    "reemplaza_a": "v2.0"
}`;

            const resultado = await window.vigia._consultarGroq(prompt, 'json');
            
            if (resultado && resultado.version_actual) {
                this._cacheVersiones[idiomaBase] = {
                    version: resultado.version_actual,
                    nombre: resultado.nombre_version || resultado.version_actual,
                    descripcion: resultado.descripcion || '',
                    palabras: resultado.palabras_por_nivel || {},
                    fecha: resultado.fecha_actualizacion || new Date().toISOString(),
                    esUltima: resultado.es_ultima !== false,
                    reemplazaA: resultado.reemplaza_a || null,
                    obtenido: Date.now(),
                    fuente: 'groq'
                };
                
                this._guardarCacheVersiones();
                console.log(`✅ Última versión para "${idioma}": ${resultado.nombre_version || resultado.version_actual}`);
                return this._cacheVersiones[idiomaBase];
            }
            
            return null;
            
        } catch (error) {
            console.error(`❌ Error obteniendo versión para "${idioma}":`, error);
            return null;
        } finally {
            this._versionesActualizando.delete(idiomaBase);
        }
    }

    // ============================================================
    // ACTUALIZAR VERSIÓN DE UN IDIOMA
    // ============================================================

    async actualizarVersionIdioma(idioma, forzar = false) {
        const idiomaBase = this._obtenerIdiomaBase(idioma);
        
        if (!forzar) {
            const cache = this._cacheVersiones[idiomaBase];
            if (cache && (Date.now() - cache.obtenido) < this._intervaloActualizacion) {
                console.log(`📌 Versión de "${idioma}" está actualizada (${new Date(cache.obtenido).toLocaleString()})`);
                return cache;
            }
        }
        
        const version = await this._obtenerUltimaVersionDesdeGroq(idioma);
        
        if (version) {
            const info = this.idiomas.find(i => i.idioma === idioma);
            if (info) {
                const versionAnterior = info.versionEstandar;
                info.versionEstandar = version.version;
                info._nombre_version = version.nombre;
                info.nivelRequerido = version.palabras[info.nivel] || info.nivelRequerido;
                
                await this._guardarIdiomasEnDB();
                localStorage.setItem('pipeline_idiomas', JSON.stringify(this.idiomas));
                
                console.log(`✅ Versión de "${idioma}" actualizada: ${versionAnterior} → ${version.version}`);
                
                window.dispatchEvent(new CustomEvent('versionIdiomaActualizada', {
                    detail: { 
                        idioma, 
                        versionAnterior, 
                        versionNueva: version.version,
                        nombreVersion: version.nombre,
                        palabras: version.palabras
                    }
                }));
            }
        }
        
        return version;
    }

    // ============================================================
    // ACTUALIZAR TODOS LOS IDIOMAS
    // ============================================================

    async actualizarTodasLasVersiones(forzar = false) {
        if (this._actualizandoTodas) {
            console.log('⏳ Ya hay una actualización en curso');
            return null;
        }
        
        this._actualizandoTodas = true;
        const resultados = [];
        const idiomas = this.idiomas.map(i => i.idioma);
        
        for (const idioma of idiomas) {
            try {
                const version = await this.actualizarVersionIdioma(idioma, forzar);
                resultados.push({ idioma, version, exito: !!version });
                await new Promise(r => setTimeout(r, 500));
            } catch (e) {
                resultados.push({ idioma, error: e.message, exito: false });
            }
        }
        
        this._ultimaActualizacionGlobal = Date.now();
        this._guardarCacheVersiones();
        this._actualizandoTodas = false;
        
        return resultados;
    }

    // ============================================================
    // VERIFICAR ACTUALIZACIONES DISPONIBLES
    // ============================================================

    async verificarActualizacionesDisponibles() {
        const actualizaciones = [];
        
        for (const info of this.idiomas) {
            const idiomaBase = this._obtenerIdiomaBase(info.idioma);
            const cache = this._cacheVersiones[idiomaBase];
            
            if (cache && cache.version && cache.version !== info.versionEstandar) {
                actualizaciones.push({
                    idioma: info.idioma,
                    versionActual: info.versionEstandar,
                    versionNueva: cache.version,
                    nombreVersion: cache.nombre,
                    descripcion: cache.descripcion
                });
            }
        }
        
        return actualizaciones;
    }

    // ============================================================
    // OBTENER INFORMACIÓN DE VERSIONES (PÚBLICO)
    // ============================================================

    obtenerVersionesDisponibles(idioma) {
        const idiomaBase = this._obtenerIdiomaBase(idioma);
        const versiones = this._VERSIONES_ESTANDAR[idiomaBase];
        
        if (!versiones) {
            return [{ id: 'v1.0', nombre: 'Estándar', descripcion: 'Estándar MCER', palabras: {} }];
        }
        
        return Object.keys(versiones).map(v => ({
            id: v,
            nombre: versiones[v].nombre || v,
            descripcion: versiones[v].descripcion || '',
            palabras: versiones[v].palabras || {}
        }));
    }

    obtenerNombreVersion(idioma, version) {
        const idiomaBase = this._obtenerIdiomaBase(idioma);
        const versiones = this._VERSIONES_ESTANDAR[idiomaBase];
        if (versiones && versiones[version]) {
            return versiones[version].nombre || version;
        }
        return version;
    }

    obtenerDescripcionVersion(idioma, version) {
        const idiomaBase = this._obtenerIdiomaBase(idioma);
        const versiones = this._VERSIONES_ESTANDAR[idiomaBase];
        if (versiones && versiones[version]) {
            return versiones[version].descripcion || '';
        }
        return '';
    }

    obtenerVersionActiva(idioma) {
        const info = this.idiomas.find(i => i.idioma === idioma);
        if (info && info.versionEstandar) {
            return info.versionEstandar;
        }
        const idiomaBase = this._obtenerIdiomaBase(idioma);
        return this._VERSION_DEFECTO[idiomaBase] || this._VERSION_DEFECTO['default'];
    }

    _obtenerVersionDefecto(idioma) {
        const idiomaBase = this._obtenerIdiomaBase(idioma);
        return this._VERSION_DEFECTO[idiomaBase] || this._VERSION_DEFECTO['default'];
    }

    _obtenerPalabrasPorVersion(idioma, version, nivel) {
        const idiomaBase = this._obtenerIdiomaBase(idioma);
        const versiones = this._VERSIONES_ESTANDAR[idiomaBase];
        
        if (versiones && versiones[version] && versiones[version].palabras && versiones[version].palabras[nivel]) {
            return versiones[version].palabras[nivel];
        }
        
        return this._palabrasPorNivelFallback[nivel] || 2000;
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init() {
        if (this._initDone) return this;
        
        try {
            console.log('🌍 Gestor de Idiomas v2.4: Inicializando...');
            
            const localIdiomas = this._cargarDesdeLocalStorage();
            if (localIdiomas && localIdiomas.length > 0) {
                this.idiomas = localIdiomas;
                const saved = localStorage.getItem('pipeline_idioma_activo');
                if (saved && this.idiomas.some(i => i.idioma === saved)) {
                    this.idiomaActivo = saved;
                } else if (this.idiomas.length > 0) {
                    this.idiomaActivo = this.idiomas[0].idioma;
                }
                console.log('🌍 Idiomas cargados desde localStorage:', this.idiomas.map(i => i.idioma));
            }
            
            const localNativos = this._cargarNativosDesdeLocalStorage();
            if (localNativos && localNativos.length > 0) {
                this.idiomasNativos = localNativos;
                this.idiomaNativoActivo = localNativos.find(n => n.esActivo) || localNativos[0] || null;
                console.log('🌍 Idiomas nativos cargados desde localStorage:', this.idiomasNativos.map(i => i.nombre));
            }
            
            if (!this._cargaFallida) {
                try {
                    await this._cargarIdiomas();
                    await this._cargarIdiomasNativos();
                } catch (e) {
                    console.warn('⚠️ Error cargando desde IndexedDB:', e);
                    this._cargaFallida = true;
                }
            }
            
            if (this.idiomaActivo) {
                localStorage.setItem('pipeline_idioma_activo', this.idiomaActivo);
                await this._guardarIdiomaActivoEnDB(this.idiomaActivo);
            }
            
            this._initDone = true;
            console.log('🌍 Gestor de Idiomas v2.4 inicializado');
            
            // 🔥 Verificar actualizaciones en background al iniciar
            setTimeout(() => {
                this._verificarActualizacionesEnBackground();
            }, 3000);
            
        } catch (e) {
            console.warn('⚠️ Error iniciando Gestor de Idiomas:', e);
            this._initDone = true;
        }
        
        return this;
    }

    // ============================================================
    // VERIFICAR ACTUALIZACIONES EN BACKGROUND
    // ============================================================

    async _verificarActualizacionesEnBackground() {
        if (!window.vigia || !window.vigia.enLinea) return;
        if (this.idiomas.length === 0) return;
        
        try {
            console.log('🔍 Verificando actualizaciones de versiones en background...');
            const actualizaciones = await this.verificarActualizacionesDisponibles();
            
            if (actualizaciones.length > 0) {
                console.log(`📢 ${actualizaciones.length} actualizaciones disponibles en background`);
                for (const act of actualizaciones) {
                    console.log(`   🌍 ${act.idioma}: ${act.versionActual} → ${act.versionNueva} (${act.nombreVersion})`);
                }
                
                // No actualizar automáticamente en background, solo notificar
                if (window.uiCore) {
                    window.uiCore.mostrarToast(`📢 ${actualizaciones.length} actualizaciones de idiomas disponibles`, 'info');
                }
            }
        } catch (e) {
            console.warn('⚠️ Error verificando actualizaciones en background:', e);
        }
    }

    // ============================================================
    // CARGA DESDE LOCALSTORAGE
    // ============================================================

    _cargarDesdeLocalStorage() {
        try {
            const data = localStorage.getItem('pipeline_idiomas');
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
            return null;
        } catch (e) {
            console.warn('⚠️ Error cargando idiomas desde localStorage:', e);
            return null;
        }
    }

    _cargarNativosDesdeLocalStorage() {
        try {
            const data = localStorage.getItem('pipeline_idiomas_nativos');
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
            const usuario = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
            if (usuario && usuario.idiomaNativo) {
                const nativoDefecto = {
                    id: 'nativo_defecto',
                    nombre: usuario.idiomaNativo,
                    esActivo: true
                };
                localStorage.setItem('pipeline_idiomas_nativos', JSON.stringify([nativoDefecto]));
                return [nativoDefecto];
            }
            return null;
        } catch (e) {
            console.warn('⚠️ Error cargando idiomas nativos desde localStorage:', e);
            return null;
        }
    }

    // ============================================================
    // CARGA DESDE INDEXEDDB
    // ============================================================

    async _cargarIdiomas() {
        if (this._cargaEnProgreso) {
            console.log('⏳ Carga de idiomas en progreso, esperando...');
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!this._cargaEnProgreso) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
        }
        
        this._cargaEnProgreso = true;
        
        try {
            const ahora = Date.now();
            if (ahora - this._ultimaCarga < 5000 && this.idiomas.length > 0) {
                console.log('📦 Usando caché de idiomas (carga reciente)');
                this._cargaEnProgreso = false;
                return;
            }
            
            let usuario = null;
            try {
                usuario = await db.getUsuario();
            } catch (e) {
                console.warn('⚠️ Error obteniendo usuario de IndexedDB:', e);
                this._cargaEnProgreso = false;
                return;
            }
            
            if (!usuario || !usuario.idiomasObjetivo || usuario.idiomasObjetivo.length === 0) {
                console.log('ℹ️ No hay idiomas en IndexedDB');
                this._cargaEnProgreso = false;
                return;
            }
            
            const idiomaActivoDB = usuario.idiomaActivo || usuario.idiomasObjetivo[0]?.idioma || null;
            
            const nuevosIdiomas = [];
            for (const item of usuario.idiomasObjetivo) {
                const idioma = item.idioma;
                const nivel = item.nivel || 'B1';
                
                const existe = nuevosIdiomas.some(i => i.idioma === idioma);
                if (!existe) {
                    const existente = this.idiomas.find(i => i.idioma === idioma);
                    const esJeroglifico = this._esJeroglifico(idioma);
                    
                    const versionEstandar = item.versionEstandar || this._obtenerVersionDefecto(idioma);
                    const nombreVersion = item._nombre_version || this.obtenerNombreVersion(idioma, versionEstandar);
                    
                    let stats = { frases: 0, completadas: 0, progreso: 0 };
                    try {
                        const frases = await db.obtenerFrasesPorIdioma(idioma);
                        const progresos = await db.obtenerProgresoPorIdioma(idioma);
                        const completadas = progresos.filter(p => p.estado === 'completada' || p.rcn >= 4).length;
                        stats = {
                            frases: frases.length,
                            completadas: completadas,
                            progreso: frases.length > 0 ? Math.round((completadas / frases.length) * 100) : 0
                        };
                    } catch (e) {
                        console.warn(`⚠️ Error obteniendo estadísticas para ${idioma}:`, e);
                    }
                    
                    const nivelRequerido = this._obtenerPalabrasPorVersion(idioma, versionEstandar, nivel);
                    
                    nuevosIdiomas.push({
                        idioma: idioma,
                        nivel: nivel,
                        versionEstandar: versionEstandar,
                        _nombre_version: nombreVersion,
                        progreso: existente?.progreso || stats.progreso || 0,
                        frasesCompletadas: existente?.frasesCompletadas || stats.completadas || 0,
                        totalFrases: existente?.totalFrases || stats.frases || 0,
                        totalHistorias: existente?.totalHistorias || 0,
                        totalTemas: existente?.totalTemas || 0,
                        esJeroglifico: esJeroglifico,
                        palabrasAprendidas: existente?.palabrasAprendidas || 0,
                        palabrasTotales: existente?.palabrasTotales || 0,
                        coberturaNivel: existente?.coberturaNivel || 0,
                        nivelRequerido: nivelRequerido,
                        palabrasPendientes: existente?.palabrasPendientes || 0,
                        listoParaExamen: existente?.listoParaExamen || false,
                        puedeHacerExamen: existente?.puedeHacerExamen || false,
                        razonesExamen: existente?.razonesExamen || []
                    });
                }
            }
            
            this.idiomas = nuevosIdiomas;
            this._ultimaCarga = Date.now();
            
            if (idiomaActivoDB && this.idiomas.some(i => i.idioma === idiomaActivoDB)) {
                this.idiomaActivo = idiomaActivoDB;
                localStorage.setItem('pipeline_idioma_activo', idiomaActivoDB);
                console.log(`📍 Idioma activo desde DB: ${idiomaActivoDB}`);
            } else if (this.idiomas.length > 0 && !this.idiomaActivo) {
                this.idiomaActivo = this.idiomas[0].idioma;
                localStorage.setItem('pipeline_idioma_activo', this.idiomaActivo);
            }
            
            localStorage.setItem('pipeline_idiomas', JSON.stringify(this.idiomas));
            
            console.log(`📊 ${this.idiomas.length} idiomas cargados desde IndexedDB`);
            
        } catch (e) {
            console.warn('⚠️ Error cargando idiomas desde IndexedDB:', e);
            this._cargaFallida = true;
        } finally {
            this._cargaEnProgreso = false;
        }
    }

    async _cargarIdiomasNativos() {
        try {
            const usuario = await db.getUsuario();
            if (usuario && usuario.idiomasNativos) {
                this.idiomasNativos = usuario.idiomasNativos;
                this.idiomaNativoActivo = this.idiomasNativos.find(n => n.esActivo) || this.idiomasNativos[0] || null;
                localStorage.setItem('pipeline_idiomas_nativos', JSON.stringify(this.idiomasNativos));
                return;
            }
            if (usuario && usuario.idiomaNativo) {
                const nativoDefecto = {
                    id: 'nativo_defecto',
                    nombre: usuario.idiomaNativo,
                    esActivo: true
                };
                this.idiomasNativos = [nativoDefecto];
                this.idiomaNativoActivo = nativoDefecto;
                usuario.idiomasNativos = this.idiomasNativos;
                await db.guardarUsuario(usuario);
                localStorage.setItem('pipeline_idiomas_nativos', JSON.stringify(this.idiomasNativos));
            }
        } catch (e) {
            console.warn('⚠️ Error cargando idiomas nativos:', e);
        }
    }

    // ============================================================
    // GUARDAR EN DB
    // ============================================================

    async _guardarIdiomasEnDB() {
        try {
            const usuario = await db.getUsuario();
            if (!usuario) return;
            
            usuario.idiomasObjetivo = this.idiomas.map(i => ({
                idioma: i.idioma,
                nivel: i.nivel,
                versionEstandar: i.versionEstandar,
                _nombre_version: i._nombre_version
            }));
            
            usuario.idiomaActivo = this.idiomaActivo;
            await db.guardarUsuario(usuario);
            console.log('✅ Idiomas guardados en IndexedDB');
        } catch (e) {
            console.warn('⚠️ Error guardando idiomas en IndexedDB:', e);
        }
    }

    async _guardarIdiomaActivoEnDB(idioma) {
        try {
            const usuario = await db.getUsuario();
            if (!usuario) return;
            usuario.idiomaActivo = idioma;
            await db.guardarUsuario(usuario);
        } catch (e) {
            console.warn(`⚠️ Error guardando idioma activo en DB:`, e);
        }
    }

    // ============================================================
    // VERIFICAR SI ES JEROGLÍFICO
    // ============================================================

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._idiomasJeroglificos.some(item => 
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
    }

    // ============================================================
    // PANTALLA DE CARGA
    // ============================================================

    _mostrarPantallaCarga(mensaje = 'Cambiando de idioma...') {
        const existing = document.getElementById('cargaOverlay');
        if (existing) existing.remove();
        
        const overlay = document.createElement('div');
        overlay.id = 'cargaOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg, #f5f6fa);
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            font-family: var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            transition: opacity 0.5s ease;
        `;
        overlay.innerHTML = `
            <div style="text-align:center;max-width:400px;padding:20px;">
                <div style="font-size:64px;margin-bottom:16px;animation: pulse 1.5s ease-in-out infinite;">🧠</div>
                <h2 style="font-size:28px;font-weight:800;background:linear-gradient(135deg, #6C5CE7, #00CEC9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;">
                    Pipeline Neuro
                </h2>
                <p style="color:var(--gray);font-size:16px;margin-bottom:16px;">${mensaje}</p>
                <div style="width:280px;height:4px;background:var(--light);border-radius:2px;margin:0 auto;overflow:hidden;">
                    <div style="height:100%;background:linear-gradient(90deg, #6C5CE7, #00CEC9);border-radius:2px;animation: loadingProgress 1.5s ease-in-out infinite;"></div>
                </div>
                <div style="margin-top:8px;font-size:12px;color:var(--gray-light);" id="cargaStatus">Preparando datos...</div>
            </div>
        `;
        
        if (!document.getElementById('cargaStyles')) {
            const styles = document.createElement('style');
            styles.id = 'cargaStyles';
            styles.textContent = `
                @keyframes loadingProgress {
                    0% { width: 10%; margin-left: 0%; }
                    50% { width: 70%; margin-left: 15%; }
                    100% { width: 10%; margin-left: 80%; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(overlay);
        this._loadingOverlay = overlay;
        
        setTimeout(() => {
            const status = document.getElementById('cargaStatus');
            if (status) status.textContent = 'Cargando frases...';
        }, 500);
        
        setTimeout(() => {
            const status = document.getElementById('cargaStatus');
            if (status) status.textContent = 'Cargando gramática...';
        }, 1000);
        
        setTimeout(() => {
            const status = document.getElementById('cargaStatus');
            if (status) status.textContent = 'Preparando módulos...';
        }, 1500);
    }

    _ocultarPantallaCarga() {
        const overlay = document.getElementById('cargaOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) overlay.remove();
            }, 500);
        }
        this._loadingOverlay = null;
    }

    // ============================================================
    // GUARDAR ESTADO DEL IDIOMA
    // ============================================================

    async _guardarEstadoIdioma(idioma) {
        try {
            console.log(`💾 Guardando estado del idioma "${idioma}"...`);
            
            const info = this.idiomas.find(i => i.idioma === idioma);
            if (!info) {
                console.warn(`⚠️ No se encontró información para "${idioma}"`);
                return;
            }
            
            const stats = await db.obtenerEstadisticasNeuro(idioma);
            
            info.progreso = stats.progreso || 0;
            info.frasesCompletadas = stats.progreso || 0;
            info.totalFrases = stats.totalFrases || 0;
            info.rcnPromedio = stats.rcnPromedio || 0;
            info.eficiencia = stats.eficiencia || 0;
            info.neuroScore = stats.neuroScore || 0;
            
            localStorage.setItem('pipeline_idiomas', JSON.stringify(this.idiomas));
            
            console.log(`✅ Estado guardado para "${idioma}": ${stats.totalFrases} frases, ${stats.progreso}% completado`);
            
        } catch (e) {
            console.warn(`⚠️ Error guardando estado de "${idioma}":`, e);
        }
    }

    // ============================================================
    // APLICAR IDIOMA ACTIVO CON RECARGA COMPLETA
    // ============================================================

    async _aplicarIdiomaActivo() {
        const idioma = this.idiomaActivo;
        if (!idioma) {
            console.warn('⚠️ No hay idioma activo para aplicar');
            return;
        }
        
        const info = this.idiomas.find(i => i.idioma === idioma);
        if (!info) {
            console.warn(`⚠️ No se encontró información para "${idioma}"`);
            return;
        }
        
        console.log(`🌍 Aplicando idioma: ${idioma} (${info.nivel})`);
        console.log(`   📊 Estado: ${info.totalFrases} frases, ${info.progreso}% completado`);
        console.log(`   📌 Versión: ${info._nombre_version || info.versionEstandar}`);
        
        this._mostrarPantallaCarga(`Cargando ${idioma}...`);
        
        try {
            if (pipeline) {
                pipeline.idiomaObjetivo = idioma;
                pipeline.nivel = info.nivel;
                try {
                    await pipeline.recargarParaIdioma(idioma);
                    console.log(`✅ Pipeline recargado para "${idioma}" (${pipeline.frases?.length || 0} frases)`);
                } catch (e) {
                    console.warn('⚠️ Error recargando pipeline:', e);
                }
            }
            
            if (gramatica) {
                try {
                    await gramatica.cargarPalabras();
                    await gramatica.agrupar();
                    console.log(`✅ Gramática recargada para "${idioma}" (${gramatica.palabras?.length || 0} palabras)`);
                } catch (e) {
                    console.warn('⚠️ Error recargando gramática:', e);
                }
            }
            
            if (modoInverso) {
                try {
                    const nativoActivo = this.obtenerIdiomaNativoActivo();
                    if (nativoActivo) {
                        modoInverso._idiomaNativo = nativoActivo.nombre;
                    }
                    modoInverso._idiomaObjetivo = idioma;
                } catch (e) {
                    console.warn('⚠️ Error actualizando modo inverso:', e);
                }
            }
            
            try {
                const stats = await db.obtenerEstadisticasNeuro(idioma);
                info.progreso = stats.progreso || 0;
                info.frasesCompletadas = stats.progreso || 0;
                info.totalFrases = stats.totalFrases || 0;
                info.rcnPromedio = stats.rcnPromedio || 0;
                info.eficiencia = stats.eficiencia || 0;
                info.neuroScore = stats.neuroScore || 0;
                localStorage.setItem('pipeline_idiomas', JSON.stringify(this.idiomas));
                console.log(`📊 Estadísticas actualizadas para "${idioma}"`);
            } catch (e) {
                console.warn('⚠️ Error actualizando estadísticas:', e);
            }
            
            await this._guardarIdiomaActivoEnDB(idioma);
            
            if (window.uiCore) {
                window.uiCore._actualizarIndicadoresSeguro();
                window.uiCore._actualizarEspacioStats();
                
                if (window.UIDashboard) {
                    await window.UIDashboard._cargarDashboardInicial(window.uiCore);
                }
                
                if (window.UIConfig && window.UIConfig._recargarConfiguracion) {
                    await window.UIConfig._recargarConfiguracion();
                }
                
                if (window.UIStudy) {
                    window.UIStudy._renderizarFraseInteractiva();
                }
                
                if (window.UITemas) {
                    window.UITemas._renderTemas();
                }
                
                if (window.UIGrammar) {
                    window.UIGrammar._cargarGramatica();
                }
                
                if (window.UIEspacio) {
                    await window.UIEspacio._renderizarMiEspacio();
                }
            }
            
            console.log(`✅ Idioma "${idioma}" aplicado correctamente`);
            
        } catch (e) {
            console.error(`❌ Error aplicando idioma "${idioma}":`, e);
        } finally {
            setTimeout(() => {
                this._ocultarPantallaCarga();
            }, 800);
        }
    }

    // ============================================================
    // CAMBIAR IDIOMA (PRINCIPAL)
    // ============================================================

    async cambiarIdioma(idioma, callback) {
        if (this._cargando) {
            console.warn('⏳ Ya hay un cambio de idioma en progreso');
            return false;
        }
        
        const existe = this.idiomas.some(i => i.idioma === idioma);
        if (!existe) {
            console.warn(`⚠️ Idioma "${idioma}" no encontrado`);
            return false;
        }
        
        this._cargando = true;
        const idiomaAnterior = this.idiomaActivo;
        this.idiomaActivo = idioma;
        localStorage.setItem('pipeline_idioma_activo', idioma);
        
        try {
            if (idiomaAnterior && idiomaAnterior !== idioma) {
                await this._guardarEstadoIdioma(idiomaAnterior);
            }
            
            await this._guardarIdiomaActivoEnDB(idioma);
            await this._aplicarIdiomaActivo();
            
            window.dispatchEvent(new CustomEvent('idiomaCambiado', {
                detail: { 
                    idioma: idioma,
                    idiomaAnterior: idiomaAnterior,
                    info: this.idiomas.find(i => i.idioma === idioma)
                }
            }));
            
            console.log(`✅ Idioma cambiado a "${idioma}" y persistido en DB`);
            
            if (callback) callback(true);
            this._cargando = false;
            return true;
            
        } catch (e) {
            console.error('❌ Error cambiando idioma:', e);
            this._cargando = false;
            if (callback) callback(false);
            return false;
        }
    }

    // ============================================================
    // MÉTODOS PARA IDIOMAS NATIVOS
    // ============================================================

    async obtenerIdiomasNativos() {
        if (this.idiomasNativos.length > 0) return this.idiomasNativos;
        await this._cargarIdiomasNativos();
        return this.idiomasNativos;
    }

    async guardarIdiomasNativos(idiomasNativos) {
        try {
            const usuario = await db.getUsuario();
            if (!usuario) return;
            
            usuario.idiomasNativos = idiomasNativos;
            const activo = idiomasNativos.find(i => i.esActivo);
            if (activo) {
                usuario.idiomaNativo = activo.nombre;
            }
            
            await db.guardarUsuario(usuario);
            localStorage.setItem('pipeline_idiomas_nativos', JSON.stringify(idiomasNativos));
            
            this.idiomasNativos = idiomasNativos;
            this.idiomaNativoActivo = activo || idiomasNativos[0] || null;
            
            if (modoInverso && this.idiomaNativoActivo) {
                modoInverso._idiomaNativo = this.idiomaNativoActivo.nombre;
            }
            
            console.log('✅ Idiomas nativos guardados:', idiomasNativos.map(i => i.nombre));
            
        } catch (e) {
            console.warn('⚠️ Error guardando idiomas nativos:', e);
        }
    }

    obtenerIdiomaNativoActivo() {
        return this.idiomaNativoActivo || this.idiomasNativos.find(i => i.esActivo) || this.idiomasNativos[0] || null;
    }

    async cambiarIdiomaNativo(idNativo) {
        const nativos = await this.obtenerIdiomasNativos();
        const nuevosNativos = nativos.map(n => ({
            ...n,
            esActivo: n.id === idNativo
        }));
        await this.guardarIdiomasNativos(nuevosNativos);
        
        window.dispatchEvent(new CustomEvent('idiomaNativoCambiado', {
            detail: { idiomaNativo: this.idiomaNativoActivo }
        }));
        
        return this.idiomaNativoActivo;
    }

    // ============================================================
    // RECARGAR IDIOMA ACTIVO
    // ============================================================

    async recargarIdiomaActivo() {
        if (!this.idiomaActivo) return;
        console.log(`🔄 Recargando idioma activo: ${this.idiomaActivo}`);
        await this._cargarIdiomas();
        await this._aplicarIdiomaActivo();
    }

    // ============================================================
    // MÉTODOS DE CONSULTA
    // ============================================================

    getIdiomaActivo() {
        return this.idiomaActivo;
    }

    getIdiomas() {
        return this.idiomas;
    }

    getInfoIdioma(idioma) {
        return this.idiomas.find(i => i.idioma === idioma);
    }

    getInfoActivo() {
        return this.idiomas.find(i => i.idioma === this.idiomaActivo);
    }

    // ============================================================
    // CAMBIAR NIVEL
    // ============================================================

    async cambiarNivel(idioma, nuevoNivel) {
        const info = this.idiomas.find(i => i.idioma === idioma);
        if (!info) return false;
        
        const nivelesValidos = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        if (!nivelesValidos.includes(nuevoNivel)) {
            console.warn(`⚠️ Nivel "${nuevoNivel}" inválido`);
            return false;
        }
        
        const nivelAnterior = info.nivel;
        info.nivel = nuevoNivel;
        
        const version = info.versionEstandar || this._obtenerVersionDefecto(idioma);
        const nivelRequerido = this._obtenerPalabrasPorVersion(idioma, version, nuevoNivel);
        info.nivelRequerido = nivelRequerido;
        
        try {
            const usuario = await db.getUsuario();
            if (usuario && usuario.idiomasObjetivo) {
                const idx = usuario.idiomasObjetivo.findIndex(i => i.idioma === idioma);
                if (idx >= 0) {
                    usuario.idiomasObjetivo[idx].nivel = nuevoNivel;
                    await db.guardarUsuario(usuario);
                }
            }
        } catch (e) {
            console.warn('⚠️ Error guardando nivel en IndexedDB:', e);
        }
        
        try {
            const usuarioLocal = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
            if (usuarioLocal.idiomasObjetivo) {
                const idx = usuarioLocal.idiomasObjetivo.findIndex(i => i.idioma === idioma);
                if (idx >= 0) {
                    usuarioLocal.idiomasObjetivo[idx].nivel = nuevoNivel;
                    localStorage.setItem('pipeline_usuario', JSON.stringify(usuarioLocal));
                }
            }
        } catch (e) {
            console.warn('⚠️ Error guardando nivel en localStorage:', e);
        }
        
        localStorage.setItem('pipeline_idiomas', JSON.stringify(this.idiomas));
        
        if (idioma === this.idiomaActivo && pipeline) {
            pipeline.nivel = nuevoNivel;
        }
        
        window.dispatchEvent(new CustomEvent('nivelIdiomaCambiado', {
            detail: { 
                idioma, 
                nivelAnterior,
                nivelNuevo: nuevoNivel,
                palabrasRequeridas: nivelRequerido
            }
        }));
        
        console.log(`✅ Nivel de "${idioma}" cambiado de ${nivelAnterior} a ${nuevoNivel}`);
        console.log(`   📊 Palabras requeridas: ${nivelRequerido}`);
        return true;
    }

    // ============================================================
    // AÑADIR IDIOMA (CON ACTUALIZACIÓN DE VERSIÓN EN BACKGROUND)
    // ============================================================

    async añadirIdioma(idioma, nivel) {
        const existe = this.idiomas.some(i => i.idioma === idioma);
        if (existe) {
            console.warn(`⚠️ Idioma "${idioma}" ya existe`);
            return false;
        }
        
        const nivelesValidos = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const nivelFinal = nivel || 'B1';
        if (!nivelesValidos.includes(nivelFinal)) {
            console.warn(`⚠️ Nivel "${nivelFinal}" inválido, usando B1`);
            nivel = 'B1';
        }
        
        const esJeroglifico = this._esJeroglifico(idioma);
        const versionDefecto = this._obtenerVersionDefecto(idioma);
        const nombreVersion = this.obtenerNombreVersion(idioma, versionDefecto);
        
        // Versión por defecto (se actualizará en background)
        const versionFinal = versionDefecto;
        const nivelRequerido = this._obtenerPalabrasPorVersion(idioma, versionFinal, nivelFinal);
        
        this.idiomas.push({ 
            idioma, 
            nivel: nivelFinal,
            versionEstandar: versionFinal,
            _nombre_version: nombreVersion,
            progreso: 0, 
            frasesCompletadas: 0, 
            totalFrases: 0,
            totalHistorias: 0,
            totalTemas: 0,
            esJeroglifico,
            palabrasAprendidas: 0,
            palabrasTotales: 0,
            coberturaNivel: 0,
            nivelRequerido: nivelRequerido,
            palabrasPendientes: nivelRequerido,
            listoParaExamen: false,
            puedeHacerExamen: false,
            razonesExamen: []
        });
        
        if (this.idiomas.length === 1) {
            this.idiomaActivo = idioma;
            localStorage.setItem('pipeline_idioma_activo', idioma);
            await this._guardarIdiomaActivoEnDB(idioma);
        }
        
        try {
            const usuario = await db.getUsuario();
            if (usuario) {
                if (!usuario.idiomasObjetivo) usuario.idiomasObjetivo = [];
                usuario.idiomasObjetivo.push({ 
                    idioma, 
                    nivel: nivelFinal, 
                    versionEstandar: versionFinal,
                    _nombre_version: nombreVersion
                });
                await db.guardarUsuario(usuario);
            }
        } catch (e) {
            console.warn('⚠️ Error guardando idioma en IndexedDB:', e);
        }
        
        try {
            const usuarioLocal = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
            if (!usuarioLocal.idiomasObjetivo) usuarioLocal.idiomasObjetivo = [];
            usuarioLocal.idiomasObjetivo.push({ 
                idioma, 
                nivel: nivelFinal, 
                versionEstandar: versionFinal,
                _nombre_version: nombreVersion
            });
            localStorage.setItem('pipeline_usuario', JSON.stringify(usuarioLocal));
            localStorage.setItem('pipeline_idiomas', JSON.stringify(this.idiomas));
        } catch (e) {
            console.warn('⚠️ Error guardando idioma en localStorage:', e);
        }
        
        window.dispatchEvent(new CustomEvent('idiomaAgregado', {
            detail: { 
                idioma: idioma, 
                nivel: nivelFinal, 
                version: versionFinal,
                nombre_version: nombreVersion
            }
        }));
        
        console.log(`✅ Idioma "${idioma}" (${nivelFinal}) añadido correctamente`);
        console.log(`   📌 Versión: ${nombreVersion} (${versionFinal})`);
        console.log(`   📊 Palabras requeridas: ${nivelRequerido}`);
        
        // 🔥 ACTUALIZAR VERSIÓN EN BACKGROUND
        if (window.vigia && window.vigia.enLinea) {
            setTimeout(async () => {
                try {
                    console.log(`🔍 Buscando última versión para "${idioma}" en background...`);
                    const version = await this._obtenerUltimaVersionDesdeGroq(idioma);
                    if (version && version.version && version.version !== versionFinal) {
                        const info = this.idiomas.find(i => i.idioma === idioma);
                        if (info) {
                            const versionAnterior = info.versionEstandar;
                            info.versionEstandar = version.version;
                            info._nombre_version = version.nombre;
                            info.nivelRequerido = version.palabras[info.nivel] || info.nivelRequerido;
                            
                            await this._guardarIdiomasEnDB();
                            localStorage.setItem('pipeline_idiomas', JSON.stringify(this.idiomas));
                            
                            console.log(`✅ "${idioma}" actualizado a ${version.nombre} (${version.version})`);
                            
                            if (window.uiCore) {
                                window.uiCore.mostrarToast(`🔄 "${idioma}" actualizado a ${version.nombre}`, 'success');
                            }
                            
                            window.dispatchEvent(new CustomEvent('versionIdiomaActualizada', {
                                detail: { 
                                    idioma, 
                                    versionAnterior, 
                                    versionNueva: version.version,
                                    nombreVersion: version.nombre,
                                    palabras: version.palabras
                                }
                            }));
                        }
                    } else {
                        console.log(`ℹ️ "${idioma}" ya tiene la última versión`);
                    }
                } catch (e) {
                    console.warn(`⚠️ No se pudo obtener la última versión para "${idioma}" en background:`, e.message);
                }
            }, 1000);
        } else {
            console.log(`📡 Vigía offline. "${idioma}" se quedará con la versión por defecto.`);
        }
        
        return true;
    }

    // ============================================================
    // ELIMINAR IDIOMA
    // ============================================================

    async eliminarIdioma(idioma) {
        const idx = this.idiomas.findIndex(i => i.idioma === idioma);
        if (idx < 0) return false;
        
        if (this.idiomas.length === 1) {
            console.warn('⚠️ No se puede eliminar el último idioma');
            return false;
        }
        
        this.idiomas.splice(idx, 1);
        
        if (this.idiomaActivo === idioma) {
            this.idiomaActivo = this.idiomas[0].idioma;
            localStorage.setItem('pipeline_idioma_activo', this.idiomaActivo);
            await this._guardarIdiomaActivoEnDB(this.idiomaActivo);
            await this._aplicarIdiomaActivo();
        }
        
        try {
            const usuario = await db.getUsuario();
            if (usuario && usuario.idiomasObjetivo) {
                usuario.idiomasObjetivo = usuario.idiomasObjetivo.filter(i => i.idioma !== idioma);
                await db.guardarUsuario(usuario);
            }
        } catch (e) {
            console.warn('⚠️ Error eliminando idioma de IndexedDB:', e);
        }
        
        try {
            const usuarioLocal = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
            if (usuarioLocal.idiomasObjetivo) {
                usuarioLocal.idiomasObjetivo = usuarioLocal.idiomasObjetivo.filter(i => i.idioma !== idioma);
                localStorage.setItem('pipeline_usuario', JSON.stringify(usuarioLocal));
            }
            localStorage.setItem('pipeline_idiomas', JSON.stringify(this.idiomas));
        } catch (e) {
            console.warn('⚠️ Error eliminando idioma de localStorage:', e);
        }
        
        window.dispatchEvent(new CustomEvent('idiomaEliminado', {
            detail: { idioma }
        }));
        
        console.log(`🗑️ Idioma "${idioma}" eliminado`);
        return true;
    }

    // ============================================================
    // CAMBIAR VERSIÓN DEL ESTÁNDAR (MANUAL)
    // ============================================================

    async cambiarVersionIdioma(idioma, nuevaVersion) {
        const info = this.idiomas.find(i => i.idioma === idioma);
        if (!info) {
            console.warn(`⚠️ Idioma "${idioma}" no encontrado`);
            return false;
        }
        
        const versionesDisponibles = this.obtenerVersionesDisponibles(idioma);
        const versionValida = versionesDisponibles.some(v => v.id === nuevaVersion);
        if (!versionValida) {
            console.warn(`⚠️ Versión "${nuevaVersion}" no válida para ${idioma}`);
            return false;
        }
        
        const versionAnterior = info.versionEstandar;
        info.versionEstandar = nuevaVersion;
        info._nombre_version = this.obtenerNombreVersion(idioma, nuevaVersion);
        
        const nivelRequerido = this._obtenerPalabrasPorVersion(idioma, nuevaVersion, info.nivel);
        info.nivelRequerido = nivelRequerido;
        
        try {
            const usuario = await db.getUsuario();
            if (usuario && usuario.idiomasObjetivo) {
                const idx = usuario.idiomasObjetivo.findIndex(i => i.idioma === idioma);
                if (idx >= 0) {
                    usuario.idiomasObjetivo[idx].versionEstandar = nuevaVersion;
                    usuario.idiomasObjetivo[idx]._nombre_version = info._nombre_version;
                    await db.guardarUsuario(usuario);
                }
            }
        } catch (e) {
            console.warn('⚠️ Error guardando versión en IndexedDB:', e);
        }
        
        localStorage.setItem('pipeline_idiomas', JSON.stringify(this.idiomas));
        
        window.dispatchEvent(new CustomEvent('versionIdiomaCambiada', {
            detail: { 
                idioma: idioma,
                versionAnterior: versionAnterior,
                versionNueva: nuevaVersion,
                palabrasRequeridas: nivelRequerido,
                nombreVersion: info._nombre_version
            }
        }));
        
        console.log(`✅ Versión de "${idioma}" cambiada de ${versionAnterior} a ${nuevaVersion}`);
        console.log(`   📊 Palabras requeridas: ${nivelRequerido}`);
        console.log(`   📌 Nombre: ${info._nombre_version}`);
        return true;
    }

    // ============================================================
    // RECUPERAR IDIOMAS EN CASO DE FALLO
    // ============================================================

    async recuperarIdiomas() {
        console.log('🔄 Intentando recuperar idiomas...');
        
        try {
            const localIdiomas = this._cargarDesdeLocalStorage();
            if (localIdiomas && localIdiomas.length > 0) {
                this.idiomas = localIdiomas;
                const saved = localStorage.getItem('pipeline_idioma_activo');
                if (saved && this.idiomas.some(i => i.idioma === saved)) {
                    this.idiomaActivo = saved;
                } else if (this.idiomas.length > 0) {
                    this.idiomaActivo = this.idiomas[0].idioma;
                }
                console.log('✅ Idiomas recuperados desde localStorage:', this.idiomas.map(i => i.idioma));
                return true;
            }
            
            try {
                await this._cargarIdiomas();
                if (this.idiomas.length > 0) {
                    console.log('✅ Idiomas recuperados desde IndexedDB:', this.idiomas.map(i => i.idioma));
                    return true;
                }
            } catch (e) {
                console.warn('⚠️ Error recuperando desde IndexedDB:', e);
            }
            
            console.warn('⚠️ No se pudieron recuperar idiomas');
            return false;
            
        } catch (e) {
            console.error('❌ Error en recuperarIdiomas:', e);
            return false;
        }
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

if (!window.gestorIdiomas) {
    window.gestorIdiomas = new GestorIdiomas();
    console.log('✅ Gestor de Idiomas v2.4 - Con actualización de versiones vía Groq');
    console.log('  🔍 Actualización automática en background al añadir idioma');
    console.log('  📦 Caché de versiones para modo offline');
    console.log('  🔄 Botón de actualización manual en Configuración');
}