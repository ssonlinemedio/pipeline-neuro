// ============================================================
// MÓDULO DE FONÉTICA v2.0 - SIN PETICIONES A GROQ
// ============================================================

class ModuloFonetica {
    constructor() {
        this._initDone = false;
        this._cacheTranscripciones = {};
        this._idiomaNativo = 'es';
        this._idiomaObjetivo = 'en';
        this._transcripcionesGeneradas = new Set();
        this._ultimaGeneracion = 0;
        this._tiempoCache = 3600000; // 1 hora
        
        // Mapeo de reglas de pronunciación por idioma nativo
        this._REGLAS_PRONUNCIACION = {
            'es': this._reglasEspañol.bind(this),
            'en': this._reglasIngles.bind(this),
            'fr': this._reglasFrances.bind(this),
            'de': this._reglasAleman.bind(this),
            'it': this._reglasItaliano.bind(this),
            'pt': this._reglasPortugues.bind(this),
            'ru': this._reglasRuso.bind(this),
            'default': this._reglasGenericas.bind(this)
        };
        
        // Símbolos fonéticos comunes
        this._SIMBOLOS_FONETICOS = {
            'a': 'a', 'á': 'a', 'e': 'e', 'é': 'e', 'i': 'i', 'í': 'i',
            'o': 'o', 'ó': 'o', 'u': 'u', 'ú': 'u', 'ü': 'u',
            'b': 'b', 'c': 'k/s', 'd': 'd', 'f': 'f', 'g': 'g',
            'h': 'j', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm',
            'n': 'n', 'ñ': 'ny', 'p': 'p', 'q': 'k', 'r': 'r',
            's': 's', 't': 't', 'v': 'b', 'w': 'u', 'x': 'ks',
            'y': 'y', 'z': 'θ/s'
        };
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init() {
        if (this._initDone) return this;
        
        console.log('🔊 Módulo de Fonética v2.0: Inicializando (MODO OFFLINE - SIN GROQ)...');
        
        try {
            // Cargar idioma nativo del usuario
            const usuario = await db.getUsuario();
            if (usuario) {
                this._idiomaNativo = usuario.idiomaNativo || 'es';
                const infoActivo = gestorIdiomas?.getInfoActivo();
                if (infoActivo) {
                    this._idiomaObjetivo = infoActivo.idioma || 'en';
                }
            }
            
            // Cargar caché de transcripciones
            this._cargarCache();
            
            // Suscribirse a cambios de idioma
            window.addEventListener('idiomaCambiado', (e) => {
                this._idiomaObjetivo = e.detail?.idioma || 'en';
                this._limpiarCache();
            });
            
            window.addEventListener('idiomaNativoCambiado', (e) => {
                this._idiomaNativo = e.detail?.idiomaNativo?.nombre || 'es';
                this._limpiarCache();
            });
            
            this._initDone = true;
            console.log(`✅ Módulo de Fonética v2.0 inicializado (SIN GROQ)`);
            console.log(`   📌 Nativo: ${this._idiomaNativo} → Objetivo: ${this._idiomaObjetivo}`);
            
        } catch (error) {
            console.warn('⚠️ Error inicializando fonética:', error);
            this._initDone = true;
        }
        
        return this;
    }

    // ============================================================
    // CARGAR/GUARDAR CACHÉ
    // ============================================================

    _cargarCache() {
        try {
            const data = localStorage.getItem('pipeline_cache_fonetica');
            if (data) {
                const parsed = JSON.parse(data);
                this._cacheTranscripciones = parsed.transcripciones || {};
                console.log(`📦 Caché de fonética cargada: ${Object.keys(this._cacheTranscripciones).length} entradas`);
            }
        } catch (e) {
            console.warn('⚠️ Error cargando caché de fonética:', e);
        }
    }

    _guardarCache() {
        try {
            localStorage.setItem('pipeline_cache_fonetica', JSON.stringify({
                transcripciones: this._cacheTranscripciones,
                ultimaActualizacion: Date.now()
            }));
        } catch (e) {
            console.warn('⚠️ Error guardando caché de fonética:', e);
        }
    }

    _limpiarCache() {
        this._cacheTranscripciones = {};
        this._guardarCache();
        console.log('🧹 Caché de fonética limpiada');
    }

    // ============================================================
    // VERIFICAR SI UN IDIOMA ES JEROGLÍFICO
    // ============================================================

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const jeroglificos = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        const idiomaLower = idioma.toLowerCase().trim();
        return jeroglificos.some(item => 
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
    }

    // ============================================================
    // OBTENER TRANSCRIPCIÓN FONÉTICA (PRINCIPAL - SIN GROQ)
    // ============================================================

    async obtenerTranscripcion(texto, idioma, nivel = 'B1', forzar = false) {
        if (!texto) return '';
        
        const idiomaLower = idioma.toLowerCase().trim();
        const esJeroglifico = this._esJeroglifico(idiomaLower);
        
        // Si es jeroglífico y ya tiene pinyin, devolverlo
        if (esJeroglifico) {
            return null; // Devolver null para que el sistema use el pinyin existente
        }
        
        // Para idiomas alfabéticos, generar transcripción
        const key = `${texto}_${idiomaLower}_${this._idiomaNativo}`;
        
        // Verificar caché
        if (!forzar && this._cacheTranscripciones[key]) {
            return this._cacheTranscripciones[key];
        }
        
        // 🔥 SOLO OFFLINE - SIN GROQ
        const transcripcion = this._generarOffline(texto, idioma);
        this._cacheTranscripciones[key] = transcripcion;
        this._guardarCache();
        
        return transcripcion;
    }

    // ============================================================
    // GENERACIÓN OFFLINE CON REGLAS
    // ============================================================

    _generarOffline(texto, idioma) {
        const idiomaLower = idioma.toLowerCase().trim();
        
        // Intentar usar reglas específicas del idioma
        if (this._REGLAS_PRONUNCIACION[idiomaLower]) {
            return this._REGLAS_PRONUNCIACION[idiomaLower](texto);
        }
        
        // Fallback a reglas genéricas
        return this._reglasGenericas(texto);
    }

    // ============================================================
    // REGLAS DE PRONUNCIACIÓN POR IDIOMA
    // ============================================================

    // --- ESPAÑOL ---
    _reglasEspañol(texto) {
        // Mapeo de sonidos del inglés al español
        const mapeo = {
            'a': 'a', 'b': 'b', 'c': 'k', 'd': 'd', 'e': 'e',
            'f': 'f', 'g': 'g', 'h': 'j', 'i': 'i', 'j': 'j',
            'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o',
            'p': 'p', 'q': 'k', 'r': 'r', 's': 's', 't': 't',
            'u': 'u', 'v': 'b', 'w': 'u', 'x': 'ks', 'y': 'y',
            'z': 'z'
        };
        return this._transcribirConMapeo(texto, mapeo);
    }

    // --- INGLÉS ---
    _reglasIngles(texto) {
        // Para nativos ingleses, transcripción fonética básica
        const mapeo = {
            'a': 'æ', 'e': 'ɛ', 'i': 'ɪ', 'o': 'ɒ', 'u': 'ʌ',
            'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'g',
            'h': 'h', 'j': 'dʒ', 'k': 'k', 'l': 'l', 'm': 'm',
            'n': 'n', 'p': 'p', 'q': 'kw', 'r': 'r', 's': 's',
            't': 't', 'v': 'v', 'w': 'w', 'x': 'ks', 'y': 'j',
            'z': 'z'
        };
        return this._transcribirConMapeo(texto, mapeo);
    }

    // --- FRANCÉS ---
    _reglasFrances(texto) {
        const mapeo = {
            'a': 'a', 'e': 'ə', 'i': 'i', 'o': 'o', 'u': 'y',
            'b': 'b', 'c': 's/k', 'd': 'd', 'f': 'f', 'g': 'g/ʒ',
            'h': '∅', 'j': 'ʒ', 'k': 'k', 'l': 'l', 'm': 'm',
            'n': 'n', 'p': 'p', 'q': 'k', 'r': 'ʁ', 's': 's',
            't': 't', 'v': 'v', 'w': 'w', 'x': 'ks', 'y': 'j',
            'z': 'z'
        };
        return this._transcribirConMapeo(texto, mapeo);
    }

    // --- ALEMÁN ---
    _reglasAleman(texto) {
        const mapeo = {
            'a': 'a', 'e': 'e', 'i': 'ɪ', 'o': 'ɔ', 'u': 'ʊ',
            'ä': 'ɛ', 'ö': 'ø', 'ü': 'y',
            'b': 'b', 'c': 'ts/k', 'd': 'd', 'f': 'f', 'g': 'g',
            'h': 'h', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm',
            'n': 'n', 'p': 'p', 'q': 'kv', 'r': 'ʁ', 's': 'z/s',
            't': 't', 'v': 'v', 'w': 'v', 'x': 'ks', 'y': 'y',
            'z': 'ts'
        };
        return this._transcribirConMapeo(texto, mapeo);
    }

    // --- ITALIANO ---
    _reglasItaliano(texto) {
        const mapeo = {
            'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u',
            'b': 'b', 'c': 'k/tʃ', 'd': 'd', 'f': 'f', 'g': 'g/dʒ',
            'h': '∅', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm',
            'n': 'n', 'p': 'p', 'q': 'kw', 'r': 'r', 's': 's',
            't': 't', 'v': 'v', 'w': 'w', 'x': 'ks', 'y': 'j',
            'z': 'dz/ts'
        };
        return this._transcribirConMapeo(texto, mapeo);
    }

    // --- PORTUGUÉS ---
    _reglasPortugues(texto) {
        const mapeo = {
            'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u',
            'ã': 'ɐ̃', 'õ': 'õ',
            'b': 'b', 'c': 'k/s', 'd': 'd', 'f': 'f', 'g': 'g',
            'h': '∅', 'j': 'ʒ', 'k': 'k', 'l': 'l', 'm': 'm',
            'n': 'n', 'p': 'p', 'q': 'k', 'r': 'ʁ', 's': 's',
            't': 't', 'v': 'v', 'w': 'w', 'x': 'ʃ', 'y': 'j',
            'z': 'z'
        };
        return this._transcribirConMapeo(texto, mapeo);
    }

    // --- RUSO ---
    _reglasRuso(texto) {
        const mapeo = {
            'а': 'a', 'е': 'je', 'ё': 'jo', 'и': 'i', 'о': 'o',
            'у': 'u', 'ы': 'ɨ', 'э': 'e', 'ю': 'ju', 'я': 'ja',
            'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'ж': 'ʐ',
            'з': 'z', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
            'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'tʃ', 'ш': 'ʃ',
            'щ': 'ɕː', 'ъ': '∅', 'ы': 'ɨ', 'ь': '∅', 'э': 'e',
            'ю': 'ju', 'я': 'ja'
        };
        return this._transcribirConMapeo(texto, mapeo);
    }

    // --- REGLAS GENÉRICAS ---
    _reglasGenericas(texto) {
        // Transcripción simple letra por letra
        let resultado = '';
        for (const char of texto.toLowerCase()) {
            if (this._SIMBOLOS_FONETICOS[char]) {
                resultado += this._SIMBOLOS_FONETICOS[char];
            } else {
                resultado += char;
            }
        }
        return resultado;
    }

    // ============================================================
    // TRANSCRIBIR CON MAPEO
    // ============================================================

    _transcribirConMapeo(texto, mapeo) {
        let resultado = '';
        for (const char of texto) {
            const lower = char.toLowerCase();
            if (mapeo[lower]) {
                resultado += mapeo[lower];
            } else {
                resultado += char;
            }
        }
        return resultado;
    }

    // ============================================================
    // OBTENER NOMBRE DE IDIOMA
    // ============================================================

    _getNombreIdioma(idioma) {
        const nombres = {
            'es': 'Español', 'en': 'Inglés', 'fr': 'Francés',
            'de': 'Alemán', 'it': 'Italiano', 'pt': 'Portugués',
            'zh': 'Chino', 'ja': 'Japonés', 'ko': 'Coreano',
            'ru': 'Ruso', 'ar': 'Árabe', 'hi': 'Hindi'
        };
        return nombres[idioma] || idioma;
    }

    // ============================================================
    // GENERAR TRANSCRIPCIÓN PARA FRASE
    // ============================================================

    async generarTranscripcionFrase(frase) {
        if (!frase) return '';
        
        const idioma = frase.idioma || this._idiomaObjetivo || 'es';
        const texto = frase.original || '';
        const nivel = frase.nivel || 'B1';
        const esJeroglifico = this._esJeroglifico(idioma);
        
        // Si es jeroglífico, usar pinyin existente
        if (esJeroglifico) {
            return frase.pinyinCompleto || frase.segmentacion?.pinyin || '';
        }
        
        // Para idiomas alfabéticos, generar transcripción offline
        return this.obtenerTranscripcion(texto, idioma, nivel);
    }

    // ============================================================
    // GENERAR TRANSCRIPCIÓN PARA PALABRA
    // ============================================================

    async generarTranscripcionPalabra(palabra) {
        if (!palabra) return '';
        
        const idioma = palabra.idioma || this._idiomaObjetivo || 'es';
        const texto = palabra.palabra || palabra.hanzi || '';
        const nivel = palabra.nivel || 'B1';
        const esJeroglifico = this._esJeroglifico(idioma);
        
        // Si es jeroglífico, usar pinyin existente
        if (esJeroglifico) {
            return palabra.pinyin || '';
        }
        
        // Para idiomas alfabéticos, generar transcripción offline
        return this.obtenerTranscripcion(texto, idioma, nivel);
    }

    // ============================================================
    // MÉTODO PARA RENDERIZAR TRANSCRIPCIÓN EN UI
    // ============================================================

    renderizarTranscripcion(transcripcion, esJeroglifico = false) {
        if (!transcripcion) return '';
        
        const icono = esJeroglifico ? '🔊' : '🎤';
        
        return `
            <div class="transcripcion-fonetica" style="
                font-size: 15px;
                color: var(--gray-light);
                margin-top: 4px;
                letter-spacing: 1px;
                font-weight: 400;
                padding: 4px 12px;
                background: var(--bg);
                border-radius: 8px;
                display: inline-block;
                border: 1px solid var(--light);
                font-family: var(--font);
            ">
                ${icono} ${transcripcion}
            </div>
        `;
    }

    // ============================================================
    // MÉTODO PARA RENDERIZAR EN CARD DE ESTUDIO
    // ============================================================

    renderizarTranscripcionEstudio(transcripcion, esJeroglifico = false) {
        if (!transcripcion) return '';
        
        const icono = esJeroglifico ? '🔊' : '🎤';
        const bg = esJeroglifico ? 'var(--primary)08' : 'var(--secondary)08';
        const border = esJeroglifico ? 'var(--primary)30' : 'var(--secondary)30';
        
        return `
            <div class="transcripcion-estudio" style="
                font-size: 16px;
                color: ${esJeroglifico ? 'var(--primary)' : 'var(--secondary)'};
                margin-top: 6px;
                letter-spacing: 1.5px;
                font-weight: 500;
                padding: 6px 16px;
                background: ${bg};
                border-radius: 10px;
                display: inline-block;
                border: 1px solid ${border};
                font-family: var(--font);
            ">
                ${icono} ${transcripcion}
            </div>
        `;
    }

    // ============================================================
    // OBTENER ESTADÍSTICAS DEL MÓDULO
    // ============================================================

    getEstadisticas() {
        return {
            initDone: this._initDone,
            idiomaNativo: this._idiomaNativo,
            idiomaObjetivo: this._idiomaObjetivo,
            cacheSize: Object.keys(this._cacheTranscripciones).length,
            cacheSizeKB: Math.round(JSON.stringify(this._cacheTranscripciones).length / 1024),
            ultimaGeneracion: this._ultimaGeneracion
        };
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

const fonetica = new ModuloFonetica();

console.log('✅ Módulo de Fonética v2.0 - SIN GROQ');
console.log('  🔥 ELIMINADAS todas las peticiones a Groq');
console.log('  📝 Solo usa transcripciones del JSON importado');
console.log('  🎯 Fallback offline con reglas fonéticas');
console.log('  📦 Caché de transcripciones para rendimiento');
console.log('  🌍 Soporte para múltiples idiomas nativos');