// ============================================================
// APP v23.7 - PARCHE DE EMERGENCIA: CONEXIÓN VIGÍA Y LIMPIEZA
// ============================================================

class App {
    constructor() {
        // Flags de estado
        this.inicializada = false;
        this._iniciando = false;
        this._initDone = false;
        this._dbReady = false;
        this._registrando = false;
        this._guardandoDatos = false;
        this._usuarioCargado = false;
        this._datosCargados = false;
        this._recuperandoDatos = false;
        this._esperandoDB = false;
        this._dbInicializada = false;
        this._cargaCompletada = false;
        this._eventosGlobalesRegistrados = false;
        this._registroCompletado = false;
        this._cargaMostrada = false;
        this._registroOculto = false;
        this._dashboardRenderizado = false;
        this._modulosEsencialesListos = false;
        this._dashboardMostrado = false;
        
        // Timeouts y reintentos
        this._tiempoEsperaDB = 0;
        this._maxTiempoEsperaDB = 5000;
        this._intentosRecuperacion = 0;
        this._maxIntentosRecuperacion = 3;
        this._intentosDB = 0;
        this._maxIntentosDB = 10;
        this._reintentosIdiomas = 0;
        this._maxReintentosIdiomas = 3;
        this._cargaProgress = 0;
        
        // Control de verificacion mensual
        this._ULTIMA_VERIFICACION_KEY = 'pipeline_ultima_verificacion_groq';
        this._VERIFICACION_INTERVALO_MS = 30 * 24 * 60 * 60 * 1000;
        this._verificacionRealizada = false;
        this._verificandoVersion = false;
        this._verificandoRuta = false;
        this._verificandoTutor = false;
        
        // Timers
        this._cargaInterval = null;
        this._cargaTimeout = null;
        this._checkInterval = null;
        this._recargaTimeout = null;
        
        // Reconexión automática de Vigia
        this._reconectandoVigia = false;
        this._ultimaReconexionVigia = 0;
        this._intervaloReconexionVigia = null;
        this._reintentosVigia = 0;
        this._maxReintentosVigia = 5;
        
        // 🔥 NUEVO: Control de bucles infinitos
        this._inicializandoModulos = false;
        this._ultimoIntentoModulo = 0;
        this._intentosModulo = 0;
        this._maxIntentosModulo = 5;
        this._modulosInicializados = new Set();
        
        // Asegurar modos globales
        if (typeof modoElipse !== 'undefined' && modoElipse) {
            window.modoElipse = modoElipse;
        }
        if (typeof modoOndasCruzadas !== 'undefined' && modoOndasCruzadas) {
            window.modoOndasCruzadas = modoOndasCruzadas;
        }
        if (typeof UIOndasCruzadas !== 'undefined' && UIOndasCruzadas) {
            window.UIOndasCruzadas = UIOndasCruzadas;
        }

        // Diccionarios de idiomas
        this._IDIOMAS_CONOCIDOS = {
            'espanol': 'es', 'castellano': 'es', 'spanish': 'es',
            'ingles': 'en', 'english': 'en',
            'chino': 'zh', 'mandarin': 'zh', 'chinese': 'zh',
            'japones': 'ja', 'japanese': 'ja',
            'coreano': 'ko', 'korean': 'ko',
            'frances': 'fr', 'french': 'fr',
            'aleman': 'de', 'german': 'de',
            'italiano': 'it', 'italian': 'it',
            'portugues': 'pt', 'portuguese': 'pt',
            'ruso': 'ru', 'russian': 'ru',
            'arabe': 'ar', 'arabic': 'ar',
            'hindi': 'hi',
            'urdu': 'ur', 'persa': 'fa', 'farsi': 'fa', 'turco': 'tr', 'turkish': 'tr',
            'vietnamita': 'vi', 'vietnamese': 'vi', 'tailandes': 'th', 'thai': 'th',
            'griego': 'el', 'greek': 'el', 'hebreo': 'he', 'hebrew': 'he',
            'polaco': 'pl', 'polish': 'pl', 'ucraniano': 'uk', 'ukrainian': 'uk',
            'rumano': 'ro', 'romanian': 'ro', 'holandes': 'nl', 'dutch': 'nl',
            'sueco': 'sv', 'swedish': 'sv', 'noruego': 'no', 'norwegian': 'no',
            'danes': 'da', 'danish': 'da', 'finlandes': 'fi', 'finnish': 'fi',
            'irlandes': 'ga', 'irish': 'ga', 'gales': 'cy', 'welsh': 'cy',
            'checo': 'cs', 'czech': 'cs', 'eslovaco': 'sk', 'slovak': 'sk',
            'hungaro': 'hu', 'hungarian': 'hu', 'bulgaro': 'bg', 'bulgarian': 'bg',
            'serbio': 'sr', 'serbian': 'sr', 'croata': 'hr', 'croatian': 'hr',
            'estonio': 'et', 'estonian': 'et', 'leton': 'lv', 'latvian': 'lv',
            'lituano': 'lt', 'lithuanian': 'lt', 'maltes': 'mt', 'maltese': 'mt',
            'islandes': 'is', 'icelandic': 'is', 'albanes': 'sq', 'albanian': 'sq',
            'georgiano': 'ka', 'georgian': 'ka', 'armenio': 'hy', 'armenian': 'hy',
            'mongol': 'mn', 'mongolian': 'mn', 'tibetano': 'bo', 'tibetan': 'bo',
            'camboyano': 'km', 'khmer': 'km', 'laosiano': 'lo', 'lao': 'lo',
            'birmano': 'my', 'burmese': 'my', 'tagalo': 'tl', 'tagalog': 'tl',
            'indonesio': 'id', 'indonesian': 'id', 'malayo': 'ms', 'malay': 'ms',
            'suajili': 'sw', 'swahili': 'sw', 'amarico': 'am', 'amharic': 'am',
            'hausa': 'ha', 'yoruba': 'yo', 'igbo': 'ig', 'zulu': 'zu',
            'afrikaans': 'af'
        };

        this._NOMBRES_IDIOMAS = {
            'es': 'Espanol', 'en': 'Ingles', 'zh': 'Chino', 'ja': 'Japones',
            'ko': 'Coreano', 'fr': 'Frances', 'de': 'Aleman', 'it': 'Italiano',
            'pt': 'Portugues', 'ru': 'Ruso', 'ar': 'Arabe', 'hi': 'Hindi',
            'ur': 'Urdu', 'fa': 'Persa', 'tr': 'Turco', 'vi': 'Vietnamita',
            'th': 'Tailandes', 'el': 'Griego', 'he': 'Hebreo', 'pl': 'Polaco',
            'uk': 'Ucraniano', 'ro': 'Rumano', 'nl': 'Holandes', 'sv': 'Sueco',
            'no': 'Noruego', 'da': 'Danes', 'fi': 'Finlandes', 'ga': 'Irlandes',
            'cy': 'Gales', 'cs': 'Checo', 'sk': 'Eslovaco', 'hu': 'Hungaro',
            'bg': 'Bulgaro', 'sr': 'Serbio', 'hr': 'Croata', 'et': 'Estonio',
            'lv': 'Leton', 'lt': 'Lituano', 'mt': 'Maltes', 'is': 'Islandes',
            'sq': 'Albanes', 'ka': 'Georgiano', 'hy': 'Armenio', 'mn': 'Mongol',
            'bo': 'Tibetano', 'km': 'Camboyano', 'lo': 'Laosiano', 'my': 'Birmano',
            'tl': 'Tagalo', 'id': 'Indonesio', 'ms': 'Malayo', 'sw': 'Suajili',
            'am': 'Amarico', 'ha': 'Hausa', 'yo': 'Yoruba', 'ig': 'Igbo',
            'zu': 'Zulu', 'af': 'Afrikaans'
        };
        
        // 🔥 NUEVO: Control de idioma válido
        this._idiomaValido = false;
        this._idiomaCorregido = null;
    }

    // ============================================================
    // 🔥 NUEVO: LIMPIAR DATOS RESIDUALES DE IDIOMAS
    // ============================================================

    _limpiarDatosResidualesIdiomas() {
        console.log('🧹 Limpiando datos residuales de idiomas...');
        
        try {
            // Limpiar claves de idioma en localStorage
            const clavesAEliminar = [
                'pipeline_idioma_activo',
                'pipeline_idiomas',
                'pipeline_idiomas_nativos',
                'pipeline_cache_versiones_idiomas',
                'pipeline_ultima_verificacion_groq'
            ];
            
            for (const clave of clavesAEliminar) {
                if (localStorage.getItem(clave)) {
                    localStorage.removeItem(clave);
                    console.log(`  🗑️ Eliminada clave: ${clave}`);
                }
            }
            
            // Limpiar idiomas en IndexedDB
            if (this._dbReady && db) {
                try {
                    const usuario = db.getUsuario();
                    if (usuario) {
                        usuario.idiomasObjetivo = [];
                        usuario.idiomaActivo = null;
                        usuario.idiomaNativo = null;
                        db.guardarUsuario(usuario);
                        console.log('  🗑️ Idiomas limpiados en IndexedDB');
                    }
                } catch (e) {
                    console.warn('  ⚠️ Error limpiando idiomas en IndexedDB:', e);
                }
            }
            
            // Limpiar gestorIdiomas
            if (window.gestorIdiomas) {
                window.gestorIdiomas.idiomas = [];
                window.gestorIdiomas.idiomaActivo = null;
                window.gestorIdiomas.idiomasNativos = [];
                window.gestorIdiomas.idiomaNativoActivo = null;
                window.gestorIdiomas._cacheVersiones = {};
                console.log('  🗑️ gestorIdiomas limpiado');
            }
            
            console.log('✅ Datos residuales de idiomas limpiados');
        } catch (e) {
            console.warn('⚠️ Error limpiando datos residuales:', e);
        }
    }

    // ============================================================
    // 🔥 NUEVO: FORZAR CONEXIÓN DE VIGÍA
    // ============================================================

    async _forzarConexionVigia(apiKey) {
        console.log('📡 Forzando conexión de Vigía...');
        
        if (!window.vigia) {
            console.error('❌ Vigía no disponible');
            return false;
        }
        
        try {
            // Establecer API Key
            if (apiKey) {
                window.vigia.apiKey = apiKey;
                localStorage.setItem('pipeline_api_key', apiKey);
                if (this._dbReady && db) {
                    await db.guardarApiKey(apiKey);
                }
            }
            
            // Forzar reconexión manual
            if (typeof window.vigia.reconectarManual === 'function') {
                const resultado = await window.vigia.reconectarManual();
                if (resultado && resultado.exito) {
                    console.log('✅ Vigía reconectado exitosamente');
                    return true;
                }
            }
            
            // Fallback: init
            if (typeof window.vigia.init === 'function') {
                await window.vigia.init();
                if (window.vigia.enLinea) {
                    console.log('✅ Vigía conectado via init');
                    return true;
                }
            }
            
            // Fallback: probar conexión directamente
            if (typeof window.vigia._probarConexion === 'function') {
                const exito = await window.vigia._probarConexion();
                if (exito) {
                    window.vigia.enLinea = true;
                    console.log('✅ Vigía conectado via prueba directa');
                    return true;
                }
            }
            
            console.warn('⚠️ No se pudo conectar Vigía');
            return false;
            
        } catch (error) {
            console.error('❌ Error forzando conexión de Vigía:', error);
            return false;
        }
    }

    // ============================================================
    // 🔥 NUEVO: DETENER BUCLES INFINITOS
    // ============================================================

    _detenerBuclesInfinitos() {
        console.log('🛑 Verificando bucles infinitos...');
        
        // Detener intervalos sospechosos
        const intervalos = [
            this._cargaInterval,
            this._checkInterval,
            this._recargaTimeout,
            this._intervaloReconexionVigia
        ];
        
        for (const interval of intervalos) {
            if (interval) {
                clearInterval(interval);
                console.log('  🛑 Intervalo detenido');
            }
        }
        
        // Limpiar timeouts
        if (this._cargaTimeout) {
            clearTimeout(this._cargaTimeout);
            this._cargaTimeout = null;
        }
        
        // Resetear flags de sincronización
        if (window.modoElipse) {
            window.modoElipse._sincronizando = false;
            window.modoElipse._sincronizacionPendiente = false;
            window.modoElipse._colaSincronizacion = [];
            console.log('  🛑 ModoElipse: sincronización reseteadas');
        }
        
        if (window.modoOndasCruzadas) {
            window.modoOndasCruzadas._sincronizando = false;
            window.modoOndasCruzadas._colaSincronizacion = [];
            console.log('  🛑 ModoOndasCruzadas: sincronización reseteadas');
        }
        
        if (window.UIOndasCruzadas) {
            if (window.UIOndasCruzadas._cargando) {
                window.UIOndasCruzadas._cargando = false;
            }
            console.log('  🛑 UIOndasCruzadas: carga reseteada');
        }
        
        if (window.UIClipse) {
            if (window.UIClipse._cargando) {
                window.UIClipse._cargando = false;
            }
            console.log('  🛑 UIClipse: carga reseteada');
        }
        
        this._inicializandoModulos = false;
        this._intentosModulo = 0;
        console.log('✅ Bucles infinitos detenidos');
    }

    // ============================================================
    // VERIFICACIÓN ESTRICTA DE REGISTRO
    // ============================================================

    _verificarRegistroCompleto() {
        const faltan = [];
        
        let usuarioLocal = null;
        let apiKeyLocal = null;
        
        try {
            const usuarioData = localStorage.getItem('pipeline_usuario');
            if (usuarioData) {
                usuarioLocal = JSON.parse(usuarioData);
            }
            apiKeyLocal = localStorage.getItem('pipeline_api_key');
        } catch (e) {
            console.warn('⚠️ Error leyendo localStorage:', e);
        }
        
        let usuarioDB = null;
        let apiKeyDB = null;
        
        if (this._dbReady && db && db.db) {
            try {
                if (this._usuarioCargado) {
                    usuarioDB = true;
                }
            } catch (e) {
                console.warn('⚠️ Error verificando DB:', e);
            }
        }
        
        const nombreLocal = usuarioLocal?.nombre;
        const nombreDB = this._usuarioCargado ? true : false;
        
        if (!nombreLocal && !nombreDB) {
            faltan.push('nombre');
        }
        
        const nativoLocal = usuarioLocal?.idiomaNativo;
        const nativoDB = this._usuarioCargado ? true : false;
        
        if (!nativoLocal && !nativoDB) {
            faltan.push('idioma_nativo');
        }
        
        const idiomasLocal = usuarioLocal?.idiomasObjetivo;
        const idiomasDB = this._usuarioCargado ? true : false;
        
        if ((!idiomasLocal || idiomasLocal.length === 0) && !idiomasDB) {
            faltan.push('idiomas_objetivo');
        }
        
        if (!apiKeyLocal && !this._apiKeyCargada) {
            faltan.push('api_key');
        }
        
        if (!usuarioLocal && !this._usuarioCargado) {
            return { completo: false, faltan: ['nombre', 'idioma_nativo', 'idiomas_objetivo', 'api_key'] };
        }
        
        return {
            completo: faltan.length === 0,
            faltan: faltan
        };
    }

    // ============================================================
    // VERIFICACIONES GROQ
    // ============================================================

    _debeEjecutarVerificacionGroq() {
        try {
            const ultimaVerificacion = localStorage.getItem(this._ULTIMA_VERIFICACION_KEY);
            if (!ultimaVerificacion) return true;
            const diferencia = Date.now() - parseInt(ultimaVerificacion);
            return diferencia > this._VERIFICACION_INTERVALO_MS;
        } catch (e) {
            return true;
        }
    }

    _guardarFechaVerificacion() {
        try {
            localStorage.setItem(this._ULTIMA_VERIFICACION_KEY, String(Date.now()));
        } catch (e) {}
    }

    async _ejecutarVerificacionesGroq() {
        if (this._verificandoVersion || this._verificandoRuta || this._verificandoTutor) return;
        if (!this._debeEjecutarVerificacionGroq()) {
            console.log('Verificaciones Groq ya realizadas este mes');
            return;
        }

        console.log('Ejecutando verificaciones mensuales de Groq...');
        this._verificandoVersion = true;
        this._verificandoRuta = true;
        this._verificandoTutor = true;

        try {
            if (window.vigia && window.vigia.enLinea && window.gestorIdiomas) {
                try {
                    const resultados = await window.gestorIdiomas.actualizarTodasLasVersiones(false);
                    if (resultados && resultados.length > 0) {
                        const exitos = resultados.filter(r => r.exito).length;
                        if (exitos > 0 && window.uiCore) {
                            window.uiCore.mostrarToast(exitos + ' idioma(s) actualizado(s)', 'success');
                        }
                    }
                } catch (e) {
                    console.warn('Error verificando versiones:', e);
                }
            }
            this._verificandoVersion = false;

            try {
                if (window.LearningPath) {
                    await window.LearningPath.generarRuta();
                }
            } catch (e) {
                console.warn('Error generando ruta:', e);
            }
            this._verificandoRuta = false;

            try {
                if (window.tutorNeuro && typeof window.tutorNeuro._recomendarSiguienteTema === 'function') {
                    window.tutorNeuro._recomendarSiguienteTema();
                }
            } catch (e) {
                console.warn('Error en recomendacion del tutor:', e);
            }
            this._verificandoTutor = false;

            this._guardarFechaVerificacion();
            this._verificacionRealizada = true;
            console.log('Verificaciones mensuales completadas');

        } catch (error) {
            console.error('Error en verificaciones:', error);
            this._verificandoVersion = false;
            this._verificandoRuta = false;
            this._verificandoTutor = false;
        }
    }

    // ============================================================
    // VALIDACION DE IDIOMAS
    // ============================================================

    _validarIdiomaLocal(texto, tipo) {
        if (!texto || texto.trim().length < 2) {
            return {
                original: texto || '',
                idiomaFinal: texto || '',
                valido: false,
                mensaje: 'Por favor, escribe un idioma valido.',
                corregido: false
            };
        }

        const textoNormalizado = texto.trim().normalize('NFKC').toLowerCase();
        const idiomasKeys = Object.keys(this._IDIOMAS_CONOCIDOS);
        
        const exacto = idiomasKeys.find(i => i === textoNormalizado);
        if (exacto) {
            const codigo = this._IDIOMAS_CONOCIDOS[exacto];
            const nombre = this._NOMBRES_IDIOMAS[codigo] || this._capitalizar(exacto);
            return {
                original: texto.trim(),
                idiomaFinal: nombre,
                valido: true,
                mensaje: nombre + ' (' + codigo + ')',
                corregido: false,
                codigo: codigo
            };
        }

        let mejorMatch = null;
        let mejorSimilitud = 0;
        const umbralMinimo = 0.6;

        for (const idioma of idiomasKeys) {
            const idiomaNormalizado = idioma.normalize('NFKC').toLowerCase();
            const similitud = this._calcularSimilitud(textoNormalizado, idiomaNormalizado);
            if (similitud > mejorSimilitud && similitud > umbralMinimo) {
                mejorSimilitud = similitud;
                mejorMatch = idioma;
            }
        }

        if (mejorMatch) {
            const codigo = this._IDIOMAS_CONOCIDOS[mejorMatch];
            const nombre = this._NOMBRES_IDIOMAS[codigo] || this._capitalizar(mejorMatch);
            return {
                original: texto.trim(),
                idiomaFinal: nombre,
                valido: true,
                mensaje: 'Quisiste decir "' + nombre + '"?',
                corregido: true,
                codigo: codigo,
                sugerido: mejorMatch
            };
        }

        return {
            original: texto.trim(),
            idiomaFinal: texto.trim(),
            valido: false,
            mensaje: '"' + texto.trim() + '" no es un idioma valido.',
            corregido: false
        };
    }

    _calcularSimilitud(a, b) {
        if (a === b) return 1;
        if (a.length === 0 || b.length === 0) return 0;
        
        const normalize = (str) => {
            return str.normalize('NFKD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z\s]/g, '')
                .toLowerCase();
        };
        
        const aNorm = normalize(a);
        const bNorm = normalize(b);
        
        if (aNorm === bNorm) return 1;
        
        const matrix = [];
        for (let i = 0; i <= aNorm.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= bNorm.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= aNorm.length; i++) {
            for (let j = 1; j <= bNorm.length; j++) {
                const cost = aNorm[i-1] === bNorm[j-1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i-1][j] + 1,
                    matrix[i][j-1] + 1,
                    matrix[i-1][j-1] + cost
                );
            }
        }
        const distancia = matrix[aNorm.length][bNorm.length];
        const maxLen = Math.max(aNorm.length, bNorm.length);
        return 1 - (distancia / maxLen);
    }

    _capitalizar(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    // ============================================================
    // PANTALLA DE CARGA
    // ============================================================

    _ocultarPantallaRegistro() {
        if (this._registroOculto) return;
        this._registroOculto = true;
        
        const registroScreen = document.getElementById('registroScreen');
        if (registroScreen) {
            registroScreen.style.display = 'none';
            registroScreen.classList.remove('active');
            registroScreen.style.opacity = '0';
            registroScreen.style.pointerEvents = 'none';
        }
        
        const form = document.getElementById('registroForm');
        if (form) {
            form.style.display = 'none';
            form.style.opacity = '0';
            form.style.pointerEvents = 'none';
        }
    }

    _mostrarPantallaCargaInmediata(mensaje) {
        this._ocultarPantallaRegistro();
        
        if (this._cargaMostrada) {
            if (mensaje) {
                const msgEl = document.getElementById('cargaMensaje');
                if (msgEl) msgEl.textContent = mensaje;
            }
            return;
        }
        
        this._cargaMostrada = true;
        this._cargaProgress = 0;
        
        const oldOverlay = document.getElementById('cargaOverlay');
        if (oldOverlay) {
            oldOverlay.remove();
        }
        
        const overlay = document.createElement('div');
        overlay.id = 'cargaOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(108, 92, 231, 0.95);
            backdrop-filter: blur(12px);
            z-index: 99999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.4s ease;
            padding: 20px;
            font-family: var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        `;

        overlay.innerHTML = `
            <div style="
                background: white;
                border-radius: 28px;
                padding: 35px 40px;
                max-width: 460px;
                width: 100%;
                text-align: center;
                box-shadow: 0 40px 100px rgba(0,0,0,0.35);
                animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            ">
                <div style="
                    width: 72px;
                    height: 72px;
                    margin: 0 auto 16px;
                    background: linear-gradient(135deg, #6C5CE7, #A29BFE);
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    color: white;
                    box-shadow: 0 12px 48px rgba(108,92,231,0.35);
                    animation: pulse 2s ease-in-out infinite;
                ">
                    <i class="fas fa-brain"></i>
                </div>
                
                <h2 style="
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--dark, #2D3436);
                    margin: 0 0 4px 0;
                ">
                    ${mensaje || 'Iniciando...'}
                </h2>
                
                <p style="
                    font-size: 13px;
                    color: var(--gray, #636E72);
                    margin: 0 0 16px 0;
                    min-height: 20px;
                ">
                    <span id="cargaMensaje">Preparando tu experiencia...</span>
                </p>
                
                <div style="
                    width: 100%;
                    height: 6px;
                    background: var(--bg, #f0f0f0);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 10px;
                ">
                    <div id="cargaProgressBar" style="
                        height: 100%;
                        width: 0%;
                        background: linear-gradient(90deg, #6C5CE7, #00CEC9, #00B894);
                        border-radius: 3px;
                        transition: width 0.6s ease;
                    "></div>
                </div>
                
                <div style="
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    color: var(--gray-light, #b2bec3);
                ">
                    <span id="cargaModuloActual">Inicializando...</span>
                    <span id="cargaPorcentaje">0%</span>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this._iniciarAnimacionCarga();
    }

    _iniciarAnimacionCarga() {
        let tiempo = 0;
        
        if (this._cargaInterval) clearInterval(this._cargaInterval);
        if (this._cargaTimeout) clearTimeout(this._cargaTimeout);

        this._cargaInterval = setInterval(() => {
            tiempo++;
            
            let pct = Math.min(85, tiempo * 15);
            
            if (this._modulosEsencialesListos) {
                pct = Math.min(100, pct + 15);
            }
            
            if (this._dashboardRenderizado) {
                pct = 100;
            }

            this._cargaProgress = Math.min(100, pct);
            
            const barra = document.getElementById('cargaProgressBar');
            const pctEl = document.getElementById('cargaPorcentaje');
            if (barra) barra.style.width = this._cargaProgress + '%';
            if (pctEl) pctEl.textContent = Math.round(this._cargaProgress) + '%';

            const msgEl = document.getElementById('cargaMensaje');
            if (msgEl) {
                if (this._cargaProgress < 30) {
                    msgEl.textContent = 'Preparando sistema...';
                } else if (this._cargaProgress < 60) {
                    msgEl.textContent = 'Cargando tu perfil...';
                } else if (this._cargaProgress < 85) {
                    msgEl.textContent = 'Preparando dashboard...';
                } else {
                    msgEl.textContent = 'Listo!';
                }
            }

            if (this._cargaProgress >= 100 && this._dashboardRenderizado) {
                this._ocultarPantallaCargaYMostrarDashboard();
            }
        }, 200);

        this._cargaTimeout = setTimeout(() => {
            console.log('⏰ Timeout de carga (3s), mostrando dashboard...');
            if (this._cargaInterval) {
                clearInterval(this._cargaInterval);
                this._cargaInterval = null;
            }
            this._cargaCompletada = true;
            this._modulosEsencialesListos = true;
            this._dashboardRenderizado = true;
            this._ocultarPantallaCargaYMostrarDashboard();
        }, 3000);
    }

    _ocultarPantallaCargaYMostrarDashboard() {
        if (this._cargaInterval) {
            clearInterval(this._cargaInterval);
            this._cargaInterval = null;
        }
        if (this._cargaTimeout) {
            clearTimeout(this._cargaTimeout);
            this._cargaTimeout = null;
        }

        const barra = document.getElementById('cargaProgressBar');
        const pctEl = document.getElementById('cargaPorcentaje');
        if (barra) barra.style.width = '100%';
        if (pctEl) pctEl.textContent = '100%';

        const overlay = document.getElementById('cargaOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.4s ease';
            setTimeout(function() {
                if (overlay.parentNode) overlay.remove();
            }, 400);
        }

        this._cargaMostrada = false;
        this._cargaCompletada = true;

        this._mostrarDashboard();
        
        // === RECONEXIÓN DE VIGIA DESPUÉS DE MOSTRAR DASHBOARD ===
        setTimeout(() => {
            this._reconectarVigiaAutomaticamente();
        }, 500);
    }

    // ============================================================
    // MOSTRAR DASHBOARD (CON VERIFICACIÓN DE REGISTRO)
    // ============================================================

    _mostrarDashboard() {
        if (this._dashboardMostrado) return;
        
        const verificacion = this._verificarRegistroCompleto();
        
        if (!verificacion.completo) {
            console.warn('⚠️ Registro incompleto, mostrando pantalla de registro. Faltan:', verificacion.faltan);
            this._showRegisterScreen();
            return;
        }
        
        this._dashboardMostrado = true;
        
        const registroScreen = document.getElementById('registroScreen');
        const mainScreen = document.getElementById('mainScreen');
        
        if (registroScreen) {
            registroScreen.style.display = 'none';
            registroScreen.classList.remove('active');
            registroScreen.style.opacity = '0';
            registroScreen.style.pointerEvents = 'none';
        }
        
        if (mainScreen) {
            mainScreen.style.display = 'block';
            mainScreen.classList.add('active');
            mainScreen.scrollTop = 0;
        }

        const usuario = this._getUsuarioLocalStorage();
        if (usuario) {
            const userName = document.getElementById('userName');
            if (userName) userName.textContent = usuario.nombre;
            const dashUser = document.getElementById('dashUserName');
            if (dashUser) dashUser.textContent = usuario.nombre;
        }

        console.log('✅ Dashboard mostrado correctamente');
    }

    // ============================================================
    // RECONEXIÓN AUTOMÁTICA DE VIGIA (MEJORADA)
    // ============================================================

    async _reconectarVigiaAutomaticamente() {
        if (this._reconectandoVigia) {
            console.log('⏳ Reconexión de Vigia ya en progreso...');
            return;
        }
        
        if (Date.now() - this._ultimaReconexionVigia < 3000) {
            console.log('⏳ Demasiado pronto para reconectar Vigia (throttle)');
            return;
        }
        
        if (this._reintentosVigia >= this._maxReintentosVigia) {
            console.log('⚠️ Máximos reintentos de Vigia alcanzados (' + this._maxReintentosVigia + '). Esperando 60s...');
            setTimeout(() => {
                this._reintentosVigia = 0;
                this._reconectarVigiaAutomaticamente();
            }, 60000);
            return;
        }
        
        try {
            if (typeof window.vigia === 'undefined' || !window.vigia) {
                console.log('⚠️ Vigia no disponible');
                return;
            }
            
            if (window.vigia.enLinea === true) {
                console.log('✅ Vigia ya está conectado');
                this._reintentosVigia = 0;
                return;
            }
            
            this._reconectandoVigia = true;
            this._ultimaReconexionVigia = Date.now();
            this._reintentosVigia++;
            
            console.log('🔄 Intentando reconexión automática de Vigia (intento ' + this._reintentosVigia + '/' + this._maxReintentosVigia + ')...');
            
            // 🔥 FORZAR RECONEXIÓN CON API KEY
            const apiKey = localStorage.getItem('pipeline_api_key');
            if (apiKey) {
                window.vigia.apiKey = apiKey;
            }
            
            let conectado = false;
            
            // Métodos de reconexión
            const metodos = [
                { fn: window.vigia.reconectarManual, nombre: 'reconectarManual' },
                { fn: window.vigia.iniciar, nombre: 'iniciar' },
                { fn: window.vigia.conectar, nombre: 'conectar' },
                { fn: window.vigia.init, nombre: 'init' }
            ];
            
            for (const metodo of metodos) {
                if (typeof metodo.fn === 'function') {
                    try {
                        console.log(`  🔄 Intentando ${metodo.nombre}...`);
                        const resultado = await metodo.fn.call(window.vigia);
                        if (resultado && (resultado === true || resultado.exito === true)) {
                            conectado = true;
                            break;
                        }
                        if (window.vigia.enLinea === true) {
                            conectado = true;
                            break;
                        }
                    } catch (e) {
                        console.warn(`  ⚠️ ${metodo.nombre} falló:`, e.message);
                    }
                }
            }
            
            // Último recurso: probar conexión directa
            if (!conectado && typeof window.vigia._probarConexion === 'function') {
                try {
                    console.log('  🔄 Intentando prueba directa...');
                    const exito = await window.vigia._probarConexion();
                    if (exito) {
                        window.vigia.enLinea = true;
                        conectado = true;
                    }
                } catch (e) {
                    console.warn('  ⚠️ Prueba directa falló:', e.message);
                }
            }
            
            if (conectado) {
                console.log('✅ Vigia reconectado automáticamente');
                this._reintentosVigia = 0;
                this._actualizarIndicadorVigia();
                
                if (window.uiCore && window.uiCore.mostrarToast) {
                    window.uiCore.mostrarToast('🔄 Vigia reconectado automáticamente', 'success');
                }
                
                // Notificar al balanceador
                if (window.balanceadorGroq) {
                    await window.balanceadorGroq.forzarReconexion();
                }
            } else {
                console.warn('⚠️ No se pudo reconectar Vigia');
                setTimeout(() => {
                    this._reconectarVigiaAutomaticamente();
                }, 5000);
            }
            
        } catch (error) {
            console.warn('⚠️ Error en reconexión automática de Vigia:', error.message);
            setTimeout(() => {
                this._reconectarVigiaAutomaticamente();
            }, 5000);
        } finally {
            this._reconectandoVigia = false;
        }
    }

    _actualizarIndicadorVigia() {
        try {
            const dot = document.getElementById('vigiaActivityDot');
            const bar = document.getElementById('vigiaActivityBar');
            const tooltip = document.getElementById('vigiaTooltip');
            const value = document.getElementById('vigiaActivityValue');
            
            if (dot) {
                dot.className = 'activity-status-dot online';
            }
            
            if (bar) {
                bar.className = 'activity-bar-fill vigia online';
                bar.style.width = '85%';
            }
            
            if (tooltip) {
                tooltip.textContent = 'Vigía: 🟢 Conectado automáticamente';
            }
            
            if (value) {
                value.textContent = '85%';
            }
            
            const indicator = document.getElementById('balanceadorModeloIndicator');
            if (indicator) {
                const dotEl = indicator.querySelector('.balanceador-dot');
                const nombre = indicator.querySelector('.balanceador-nombre');
                const estado = indicator.querySelector('.balanceador-estado');
                
                if (dotEl) {
                    dotEl.className = 'balanceador-dot prioritario';
                }
                if (nombre) {
                    nombre.className = 'balanceador-nombre prioritario';
                    nombre.textContent = 'Vigia Auto';
                }
                if (estado) {
                    estado.className = 'balanceador-estado prioritario';
                    estado.textContent = '✅ Conectado';
                }
            }
        } catch (e) {
            console.warn('⚠️ Error actualizando indicador de Vigia:', e);
        }
    }

    // ============================================================
    // INICIALIZACION PRINCIPAL - CORREGIDA
    // ============================================================

    async init() {
        if (this._iniciando || this._initDone) return;
        this._iniciando = true;

        try {
            console.log('🚀 Iniciando Pipeline v23.7 - Parche de emergencia...');
            
            // 🔥 DETENER BUCLES INFINITOS AL INICIO
            this._detenerBuclesInfinitos();
            
            // 🔥 LIMPIAR DATOS RESIDUALES DE IDIOMAS
            this._limpiarDatosResidualesIdiomas();

            const verificacion = this._verificarRegistroCompleto();
            
            if (!verificacion.completo) {
                console.log('📝 Registro incompleto, mostrando pantalla de registro. Faltan:', verificacion.faltan);
                this._showRegisterScreen();
                this._iniciando = false;
                return;
            }

            const usuarioLocal = this._getUsuarioLocalStorage();
            
            if (usuarioLocal && usuarioLocal.nombre) {
                this._mostrarPantallaCargaInmediata('Hola ' + usuarioLocal.nombre);
            } else {
                console.warn('⚠️ Verificación pasó pero no hay usuario en localStorage, mostrando registro');
                this._showRegisterScreen();
                this._iniciando = false;
                return;
            }

            console.log('📀 Inicializando Database...');
            this._esperandoDB = true;
            this._dbReady = false;
            
            try {
                await Promise.race([
                    this._inicializarDBConReintentos(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout DB (3s)')), 3000)
                    )
                ]);
                this._dbReady = true;
                this._dbInicializada = true;
                console.log('✅ Database inicializada');
            } catch (dbError) {
                console.warn('⚠️ Error inicializando DB, usando localStorage:', dbError.message);
                this._dbReady = false;
                this._dbInicializada = false;
            }
            this._esperandoDB = false;

            if (window.balanceadorGroq) {
                try {
                    await window.balanceadorGroq.init();
                    console.log('✅ Balanceador de carga inicializado');
                } catch (e) {
                    console.warn('⚠️ Error inicializando balanceador:', e);
                }
            }

            let usuario = null;
            let apiKey = null;
            let idiomaActivoPersistido = null;
            
            usuario = this._getUsuarioLocalStorage();
            if (usuario && usuario.nombre) {
                console.log('👤 Usuario encontrado en localStorage:', usuario.nombre);
                this._usuarioCargado = true;
                if (usuario.idiomaActivo) {
                    idiomaActivoPersistido = usuario.idiomaActivo;
                }
            }
            
            apiKey = localStorage.getItem('pipeline_api_key');
            if (apiKey) {
                this._apiKeyCargada = true;
                console.log('🔑 API Key encontrada en localStorage');
            }
            
            if (this._dbReady) {
                try {
                    const usuarioDB = await db.getUsuario();
                    if (usuarioDB && usuarioDB.nombre) {
                        if (!usuario || !usuario.nombre) {
                            usuario = usuarioDB;
                            this._usuarioCargado = true;
                            this._saveUsuarioLocalStorage(usuario);
                            console.log('👤 Usuario recuperado desde IndexedDB:', usuario.nombre);
                        }
                        if (usuarioDB.idiomaActivo && !idiomaActivoPersistido) {
                            idiomaActivoPersistido = usuarioDB.idiomaActivo;
                        }
                    }
                    if (!apiKey) {
                        const apiKeyDB = await db.obtenerApiKey();
                        if (apiKeyDB) {
                            apiKey = apiKeyDB;
                            localStorage.setItem('pipeline_api_key', apiKey);
                            this._apiKeyCargada = true;
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Error obteniendo usuario de IndexedDB:', e);
                }
            }

            const verificacionFinal = this._verificarRegistroCompleto();
            if (!verificacionFinal.completo) {
                console.warn('⚠️ Registro incompleto después de carga, mostrando registro. Faltan:', verificacionFinal.faltan);
                this._showRegisterScreen();
                this._iniciando = false;
                return;
            }

            if (!usuario || !usuario.nombre || !usuario.idiomasObjetivo || usuario.idiomasObjetivo.length === 0) {
                console.log('👤 No hay usuario valido, mostrando registro');
                this._showRegisterScreen();
                this._iniciando = false;
                return;
            }

            console.log('👤 Usuario cargado:', usuario.nombre);
            
            // 🔥 FORZAR CARGA DE IDIOMAS CORRECTOS
            try {
                await Promise.race([
                    this._forzarCargaIdiomas(usuario),
                    new Promise((resolve) => setTimeout(resolve, 2000))
                ]);
            } catch (e) {
                console.warn('⚠️ Error cargando idiomas:', e);
            }
            
            // 🔥 FORZAR IDIOMA ACTIVO CORRECTO
            if (usuario.idiomasObjetivo && usuario.idiomasObjetivo.length > 0) {
                const primerIdioma = usuario.idiomasObjetivo[0].idioma;
                if (idiomaActivoPersistido && usuario.idiomasObjetivo.some(i => i.idioma === idiomaActivoPersistido)) {
                    console.log('📍 Activando idioma persistido:', idiomaActivoPersistido);
                    if (window.gestorIdiomas) {
                        try {
                            await gestorIdiomas.cambiarIdioma(idiomaActivoPersistido);
                        } catch (e) {
                            console.warn('⚠️ Error activando idioma persistido, usando primero:', e);
                            await gestorIdiomas.cambiarIdioma(primerIdioma);
                        }
                    }
                } else if (window.gestorIdiomas) {
                    console.log('📍 Activando primer idioma:', primerIdioma);
                    try {
                        await gestorIdiomas.cambiarIdioma(primerIdioma);
                    } catch (e) {
                        console.warn('⚠️ Error activando primer idioma:', e);
                    }
                }
            }
            
            this._registrarEventosGlobales();
            
            if (typeof window.uiCore !== 'undefined' && window.uiCore.init) {
                try {
                    await Promise.race([
                        window.uiCore.init(),
                        new Promise((resolve) => setTimeout(resolve, 1500))
                    ]);
                    console.log('✅ UI Core inicializado');
                } catch (e) {
                    console.warn('⚠️ UI Core fallo:', e);
                }
            }
            
            if (window.pipeline) {
                try {
                    await Promise.race([
                        pipeline.cargarFrasesPorIdioma(gestorIdiomas?.getIdiomaActivo() || 'es'),
                        new Promise((resolve) => setTimeout(resolve, 1500))
                    ]);
                    await pipeline.cargarProgreso();
                    console.log('✅ Pipeline cargado');
                } catch (e) {
                    console.warn('⚠️ Pipeline fallo:', e);
                }
            }
            
            this._modulosEsencialesListos = true;
            
            console.log('📊 Renderizando dashboard...');
            try {
                await this._renderizarDashboardInmediato(usuario);
                this._dashboardRenderizado = true;
                this._datosCargados = true;
                console.log('✅ Dashboard renderizado');
            } catch (e) {
                console.error('❌ Error renderizando dashboard:', e);
                this._dashboardRenderizado = true;
            }
            
            console.log('📊 Mostrando dashboard...');
            this._ocultarPantallaCargaYMostrarDashboard();
            
            // 🔥 INICIAR MÓDULOS EN SEGUNDO PLANO CON CONTROL DE BUCLE
            this._iniciarModulosEnSegundoPlano(usuario);
            
            // 🔥 FORZAR CONEXIÓN DE VIGÍA DESPUÉS DE UNOS SEGUNDOS
            setTimeout(async () => {
                if (apiKey) {
                    await this._forzarConexionVigia(apiKey);
                } else {
                    console.warn('⚠️ No hay API Key para conectar Vigía');
                }
            }, 2000);
            
            // Intervalo de reconexión periódica
            if (this._intervaloReconexionVigia) {
                clearInterval(this._intervaloReconexionVigia);
            }
            this._intervaloReconexionVigia = setInterval(() => {
                if (window.vigia && !window.vigia.enLinea) {
                    console.log('🔄 Vigia desconectado (intervalo), intentando reconexión automática...');
                    this._reconectarVigiaAutomaticamente();
                }
            }, 30000);
            
            setTimeout(() => {
                if (window.app) window.app._ejecutarVerificacionesGroq();
            }, 3000);
            
            setTimeout(() => {
                if (window.UIBackup) {
                    try {
                        window.UIBackup.verificarBackupAutomatico(true);
                    } catch (e) {}
                }
            }, 4000);
            
            this.inicializada = true;
            this._initDone = true;
            console.log('✅ App iniciada correctamente');

        } catch (error) {
            console.error('❌ Error en init:', error);
            const localUser = this._getUsuarioLocalStorage();
            if (localUser && localUser.nombre) {
                try {
                    await this._iniciarConLocalStorage(localUser);
                    return;
                } catch (e) {}
            }
            this._showError(error);
        } finally {
            this._iniciando = false;
            if (this._checkInterval) {
                clearInterval(this._checkInterval);
                this._checkInterval = null;
            }
        }
    }

    // ============================================================
    // RENDERIZAR DASHBOARD INMEDIATO
    // ============================================================

    async _renderizarDashboardInmediato(usuario) {
        try {
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            
            let stats = { totalFrases: 0, totalPalabras: 0, progreso: 0, neuroScore: 0 };
            if (this._dbReady && db && db.db) {
                try {
                    stats = await Promise.race([
                        db.obtenerEstadisticasNeuro(idiomaActivo),
                        new Promise((resolve) => setTimeout(() => resolve(stats), 1000))
                    ]);
                } catch (e) {
                    console.warn('⚠️ Error obteniendo stats:', e);
                }
            }
            
            if (window.UIDashboard) {
                try {
                    await Promise.race([
                        window.UIDashboard.init(window.uiCore),
                        new Promise((resolve) => setTimeout(resolve, 1000))
                    ]);
                    await window.UIDashboard._cargarDashboardInicial(window.uiCore);
                    console.log('✅ Dashboard renderizado v25.0');
                } catch (e) {
                    console.warn('⚠️ Error en UIDashboard:', e);
                    this._renderizarDashboardFallback(usuario, stats);
                }
            } else {
                this._renderizarDashboardFallback(usuario, stats);
            }
            
            if (window.uiCore && window.uiCore._actualizarIndicadoresSeguro) {
                window.uiCore._actualizarIndicadoresSeguro();
            }
            
        } catch (e) {
            console.warn('⚠️ Error renderizando dashboard:', e);
            this._renderizarDashboardFallback(usuario, { totalFrases: 0, progreso: 0 });
        }
    }

    _renderizarDashboardFallback(usuario, stats) {
        const dashboardGrid = document.getElementById('dashboardGrid');
        if (!dashboardGrid) return;
        
        const progreso = stats?.progreso || 0;
        const totalFrases = stats?.totalFrases || 0;
        
        dashboardGrid.innerHTML = `
            <div style="grid-column:1/-1;padding:20px;text-align:center;background:var(--white);border-radius:16px;border:2px solid var(--light);">
                <div style="font-size:48px;margin-bottom:12px;">📊</div>
                <h2 style="font-size:20px;font-weight:700;color:var(--dark);margin:0 0 4px 0;">
                    Panel de Control
                </h2>
                <p style="font-size:14px;color:var(--gray);margin:0 0 8px 0;">
                    Bienvenido, <strong>${usuario?.nombre || 'Usuario'}</strong>
                </p>
                <div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin-top:12px;">
                    <div style="text-align:center;">
                        <div style="font-size:24px;font-weight:800;color:var(--primary);">${progreso}%</div>
                        <div style="font-size:11px;color:var(--gray);">Progreso</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:24px;font-weight:800;color:var(--secondary);">${totalFrases}</div>
                        <div style="font-size:11px;color:var(--gray);">Frases</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:24px;font-weight:800;color:var(--warning);">${usuario?.idiomasObjetivo?.[0]?.nivel || 'A1'}</div>
                        <div style="font-size:11px;color:var(--gray);">Nivel</div>
                    </div>
                </div>
                <div style="margin-top:12px;">
                    <button onclick="window.uiCore.irAModulo('study')" style="padding:10px 24px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">
                        <i class="fas fa-graduation-cap"></i> Comenzar a Estudiar
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================================
    // INICIAR MODULOS EN SEGUNDO PLANO (CON CONTROL DE BUCLE)
    // ============================================================

    _iniciarModulosEnSegundoPlano(usuario) {
        console.log('🔄 Iniciando módulos en segundo plano...');
        
        if (this._inicializandoModulos) {
            console.log('⏳ Ya hay una inicialización de módulos en curso');
            return;
        }
        
        this._inicializandoModulos = true;
        this._ultimoIntentoModulo = Date.now();
        this._intentosModulo = 0;
        
        // === RECONEXIÓN AUTOMÁTICA DE VIGIA (INMEDIATA) ===
        setTimeout(() => {
            this._reconectarVigiaAutomaticamente();
        }, 300);
        
        // === FALLBACK: RECONEXIÓN DE VIGIA DESPUÉS DE 3s ===
        setTimeout(() => {
            if (window.vigia && !window.vigia.enLinea) {
                console.log('🔄 Fallback: Reconectando Vigia después de 3s...');
                this._reconectarVigiaAutomaticamente();
            }
        }, 3000);
        
        // === FALLBACK FINAL: RECONEXIÓN DESPUÉS DE 8s ===
        setTimeout(() => {
            if (window.vigia && !window.vigia.enLinea) {
                console.log('🔄 Fallback final: Reconectando Vigia después de 8s...');
                this._reconectarVigiaAutomaticamente();
            }
        }, 8000);
        
        // Módulos - con control de bucle
        const modulos = [
            { name: 'vigiaGramatical', fn: () => window.vigiaGramatical?.initGramatical?.() },
            { name: 'LearningPath', fn: () => window.LearningPath?.init?.(window.uiCore) },
            { name: 'UICaracteres', fn: () => window.UICaracteres?.init?.(window.uiCore) },
            { name: 'UIConfig', fn: () => window.UIConfig?._recargarConfiguracion?.() },
            { name: 'UIGrammar', fn: () => window.UIGrammar?._cargarGramatica?.() },
            { name: 'UITemas', fn: () => window.UITemas?._renderTemas?.() },
            { name: 'UIEspacio', fn: () => window.UIEspacio?._renderizarMiEspacio?.() },
            { name: 'tutorNeuro', fn: () => window.tutorNeuro?.initTutor?.() },
            { name: 'modoElipse', fn: () => window.modoElipse?.init?.(window.uiCore) },
            { name: 'modoOndasCruzadas', fn: () => window.modoOndasCruzadas?.init?.(window.uiCore) },
            { name: 'UIClipse', fn: () => window.UIClipse?.init?.(window.uiCore) },
            { name: 'UIOndasCruzadas', fn: () => window.UIOndasCruzadas?.init?.(window.uiCore) }
        ];
        
        const modulosFiltrados = modulos.filter(m => !this._modulosInicializados.has(m.name));
        
        if (modulosFiltrados.length === 0) {
            console.log('✅ Todos los módulos ya están inicializados');
            this._inicializandoModulos = false;
            return;
        }
        
        console.log(`📦 Inicializando ${modulosFiltrados.length} módulos...`);
        
        let moduloIndex = 0;
        const self = this;
        
        function iniciarSiguienteModulo() {
            if (moduloIndex >= modulosFiltrados.length) {
                console.log('✅ Todos los módulos inicializados correctamente');
                self._inicializandoModulos = false;
                return;
            }
            
            const modulo = modulosFiltrados[moduloIndex];
            const nombre = modulo.name;
            
            try {
                console.log(`  🔄 Inicializando ${nombre}...`);
                const resultado = modulo.fn();
                if (resultado && typeof resultado.then === 'function') {
                    resultado.catch((e) => {
                        console.warn(`  ⚠️ ${nombre} falló (no crítico):`, e.message || e);
                    });
                }
                self._modulosInicializados.add(nombre);
            } catch (e) {
                console.warn(`  ⚠️ ${nombre} falló (no crítico):`, e.message || e);
                // No añadir a inicializados para intentar de nuevo
            }
            
            moduloIndex++;
            
            // Pequeña pausa entre módulos
            setTimeout(iniciarSiguienteModulo, 200);
        }
        
        // Iniciar después de 1s
        setTimeout(iniciarSiguienteModulo, 1000);
    }

    // ============================================================
    // METODOS AUXILIARES
    // ============================================================

    _registrarEventosGlobales() {
        if (this._eventosGlobalesRegistrados) return;
        this._eventosGlobalesRegistrados = true;
        console.log('🔗 Eventos globales registrados');
    }

    async _inicializarDBConReintentos() {
        var self = this;
        return new Promise(function(resolve, reject) {
            var intentos = 0;
            var intentar = function() {
                try {
                    if (typeof db === 'undefined' || !db) throw new Error('Database no definida');
                    db.init().then(function() {
                        if (db.db && db.db.name === 'PipelineDB') {
                            console.log('✅ Database inicializada en intento', intentos + 1);
                            resolve();
                            return;
                        }
                        throw new Error('Database no inicializada');
                    }).catch(function(e) {
                        intentos++;
                        if (intentos >= self._maxIntentosDB) {
                            reject(new Error('No se pudo inicializar IndexedDB: ' + e.message));
                        } else {
                            console.log('⏳ Esperando IndexedDB... intento', intentos, '/', self._maxIntentosDB);
                            setTimeout(intentar, Math.min(800, 150 * intentos));
                        }
                    });
                } catch (e) {
                    intentos++;
                    if (intentos >= self._maxIntentosDB) {
                        reject(new Error('No se pudo inicializar IndexedDB: ' + e.message));
                    } else {
                        console.log('⏳ Esperando IndexedDB... intento', intentos, '/', self._maxIntentosDB);
                        setTimeout(intentar, Math.min(800, 150 * intentos));
                    }
                }
            };
            intentar();
        });
    }

    async _iniciarConLocalStorage(usuario) {
        console.log('🔄 Iniciando en modo localStorage (emergencia)');
        try {
            this._mostrarPantallaCargaInmediata('Recuperando datos...');
            
            // 🔥 LIMPIAR Y RECONSTRUIR IDIOMAS
            if (usuario.idiomasObjetivo && usuario.idiomasObjetivo.length > 0 && window.gestorIdiomas) {
                gestorIdiomas.idiomas = [];
                for (var i = 0; i < usuario.idiomasObjetivo.length; i++) {
                    var item = usuario.idiomasObjetivo[i];
                    gestorIdiomas.idiomas.push({
                        idioma: item.idioma,
                        nivel: item.nivel || 'B1',
                        progreso: 0,
                        frasesCompletadas: 0,
                        totalFrases: 0,
                        totalHistorias: 0,
                        totalTemas: 0,
                        esJeroglifico: gestorIdiomas._esJeroglifico(item.idioma)
                    });
                }
                var saved = localStorage.getItem('pipeline_idioma_activo');
                if (saved && gestorIdiomas.idiomas.some(function(i) { return i.idioma === saved; })) {
                    gestorIdiomas.idiomaActivo = saved;
                } else {
                    gestorIdiomas.idiomaActivo = usuario.idiomasObjetivo[0].idioma;
                }
                localStorage.setItem('pipeline_idioma_activo', gestorIdiomas.idiomaActivo);
            }
            
            this._registrarEventosGlobales();
            this._setupPersistenciaCritica();
            this._setupOrientationHandler();
            
            if (typeof window.uiCore !== 'undefined' && window.uiCore.init) {
                try {
                    await window.uiCore.init();
                } catch (e) {}
            }
            
            await this._renderizarDashboardInmediato(usuario);
            this._dashboardRenderizado = true;
            this._datosCargados = true;
            this._modulosEsencialesListos = true;
            this._ocultarPantallaCargaYMostrarDashboard();
            
            this._iniciarModulosEnSegundoPlano(usuario);
            
            setTimeout(function() { 
                if (window.app) window.app._ejecutarVerificacionesGroq(); 
            }, 3000);
            
            this.inicializada = true;
            this._initDone = true;
            console.log('✅ App iniciada en modo localStorage');
        } catch (e) {
            console.error('❌ Error en modo localStorage:', e);
            this._ocultarPantallaCargaYMostrarDashboard();
            this._showError(e);
        }
    }

    _setupPersistenciaCritica() {
        var self = this;
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') {
                self._guardarDatosCriticos();
            }
        });

        window.addEventListener('beforeunload', function() {
            self._guardarDatosCriticos();
        });

        setInterval(function() { self._guardarDatosCriticos(); }, 30000);
    }

    async _guardarDatosCriticos() {
        if (this._guardandoDatos) return;
        this._guardandoDatos = true;
        try {
            var usuario = this._getUsuarioLocalStorage();
            if (!usuario) { this._guardandoDatos = false; return; }
            var idiomaActivo = gestorIdiomas?.getIdiomaActivo?.() || localStorage.getItem('pipeline_idioma_activo');
            if (idiomaActivo) usuario.idiomaActivo = idiomaActivo;
            if (this._dbReady && db) {
                try {
                    await db.guardarUsuario(usuario);
                    var apiKey = localStorage.getItem('pipeline_api_key');
                    if (apiKey) await db.guardarApiKey(apiKey);
                } catch (e) {}
            }
            this._saveUsuarioLocalStorage(usuario);
            if (gestorIdiomas && gestorIdiomas.idiomaActivo) {
                localStorage.setItem('pipeline_idioma_activo', gestorIdiomas.idiomaActivo);
            }
        } catch (e) { console.warn('⚠️ Error guardando datos:', e); }
        finally { this._guardandoDatos = false; }
    }

    _getUsuarioLocalStorage() {
        try {
            var data = localStorage.getItem('pipeline_usuario');
            if (data) {
                var parsed = JSON.parse(data);
                if (parsed && parsed.nombre && parsed.idiomasObjetivo && parsed.idiomasObjetivo.length > 0) {
                    return parsed;
                }
            }
            return null;
        } catch (e) { return null; }
    }

    _saveUsuarioLocalStorage(usuario) {
        try {
            if (!usuario || !usuario.nombre) return false;
            localStorage.setItem('pipeline_usuario', JSON.stringify(usuario));
            return true;
        } catch (e) { return false; }
    }

    // ============================================================
    // REGISTRO - CORREGIDO
    // ============================================================

    _showRegisterScreen() {
        var registroScreen = document.getElementById('registroScreen');
        var mainScreen = document.getElementById('mainScreen');
        
        if (registroScreen) {
            registroScreen.style.display = 'flex';
            registroScreen.classList.add('active');
            registroScreen.style.opacity = '1';
            registroScreen.style.pointerEvents = 'auto';
        }
        
        if (mainScreen) {
            mainScreen.style.display = 'none';
            mainScreen.classList.remove('active');
        }
        
        var form = document.getElementById('registroForm');
        if (form) {
            form.style.display = '';
            form.style.opacity = '1';
            form.style.pointerEvents = 'auto';
        }
        
        this._registroOculto = false;
        this._dashboardMostrado = false;
        this._setupRegisterForm();
        console.log('📝 Pantalla de registro mostrada');
    }

    _setupRegisterForm() {
        var form = document.getElementById('registroForm');
        if (!form) { console.warn('⚠️ Formulario de registro no encontrado'); return; }
        var newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        var self = this;
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (self._registrando) { console.log('⏳ Registro en proceso'); return; }
            self._registrando = true;
            self._handleRegister(e).then(function() {
                self._registrando = false;
            }).catch(function(error) {
                console.error('❌ Error en registro:', error);
                self._showError(error);
                self._registrando = false;
            });
        });
        console.log('✅ Formulario de registro configurado');
    }

    async _handleRegister(event) {
        console.log('📝 Procesando registro...');

        try {
            var nombreInput = document.getElementById('nombre');
            var idiomaNativoInput = document.getElementById('idiomaNativo');
            var apiKeyInput = document.getElementById('apiKey');
            
            var nombre = nombreInput?.value?.trim() || '';
            var idiomaNativo = idiomaNativoInput?.value?.trim() || '';
            var apiKey = apiKeyInput?.value?.trim() || '';
            
            var idiomas = this._getIdiomas();

            if (!nombre) { await this._showToast('El nombre es obligatorio', 'error'); return; }
            if (!idiomaNativo) { await this._showToast('El idioma nativo es obligatorio', 'error'); return; }
            if (idiomas.length === 0) { await this._showToast('Debes anadir al menos un idioma objetivo', 'error'); return; }
            if (!apiKey || !apiKey.startsWith('gsk_')) {
                await this._showToast('API Key invalida. Debe comenzar con "gsk_"', 'error');
                return;
            }

            // 🔥 GUARDAR API KEY PRIMERO
            try {
                await db.guardarApiKey(apiKey);
                localStorage.setItem('pipeline_api_key', apiKey);
                this._apiKeyCargada = true;
                console.log('✅ API Key guardada');
            } catch (e) {
                await this._showToast('Error guardando API Key: ' + e.message, 'error');
                return;
            }

            // 🔥 FORZAR CONEXIÓN DE VIGÍA CON LA API KEY
            await this._forzarConexionVigia(apiKey);

            var validacionNativo = this._validarIdiomaLocal(idiomaNativo, 'nativo');
            
            if (!validacionNativo.valido) {
                await this._showToast('"' + idiomaNativo + '" no es un idioma valido.', 'error');
                return;
            }

            if (validacionNativo.corregido && validacionNativo.sugerido) {
                var aceptar = await this._showConfirm(
                    'Sugerencia: "' + idiomaNativo + '" → "' + validacionNativo.idiomaFinal + '"\n\nUsar "' + validacionNativo.idiomaFinal + '"?',
                    'Correccion de idioma'
                );
                if (aceptar) {
                    idiomaNativo = validacionNativo.idiomaFinal;
                    if (idiomaNativoInput) idiomaNativoInput.value = idiomaNativo;
                } else {
                    return;
                }
            }

            var idiomasValidados = [];
            for (var i = 0; i < idiomas.length; i++) {
                var item = idiomas[i];
                var validacion = this._validarIdiomaLocal(item.idioma, 'objetivo');

                if (!validacion.valido) {
                    await this._showToast('"' + item.idioma + '" no es un idioma valido.', 'error');
                    return;
                }

                var idiomaFinal = validacion.idiomaFinal;
                
                if (validacion.corregido && validacion.sugerido) {
                    var aceptar2 = await this._showConfirm(
                        'Sugerencia: "' + item.idioma + '" → "' + idiomaFinal + '"\n\nUsar "' + idiomaFinal + '"?',
                        'Correccion de idioma'
                    );
                    if (aceptar2) {
                        var rows = document.querySelectorAll('.idioma-row');
                        for (var j = 0; j < rows.length; j++) {
                            var input = rows[j].querySelector('.idioma-input');
                            if (input && input.value.trim() === item.idioma) {
                                input.value = idiomaFinal;
                            }
                        }
                    } else {
                        return;
                    }
                }
                
                idiomasValidados.push({
                    idioma: idiomaFinal,
                    nivel: item.nivel
                });
            }
            
            idiomas = idiomasValidados;

            var usuario = {
                nombre: nombre,
                idiomaNativo: idiomaNativo,
                idiomasObjetivo: idiomas,
                nivel: idiomas[0]?.nivel || 'B1',
                idiomaActivo: idiomas[0]?.idioma || '',
                fechaRegistro: new Date().toISOString(),
                version: '23.7'
            };

            this._saveUsuarioLocalStorage(usuario);
            
            if (this._dbReady) {
                try {
                    await db.guardarUsuario(usuario);
                    await db.guardarApiKey(apiKey);
                    console.log('✅ Datos guardados en IndexedDB');
                } catch (e) {
                    console.warn('⚠️ IndexedDB no disponible:', e);
                }
            }

            var modoTutor = localStorage.getItem('pipeline_tutor_modo') || 'flexible';
            if (window.tutorNeuro) {
                try {
                    window.tutorNeuro.setModo(modoTutor);
                    console.log('🧠 Modo Tutor configurado:', modoTutor);
                } catch (e) {}
            }

            console.log('✅ Registro completado para:', usuario.nombre);
            
            this._usuarioCargado = true;
            this._apiKeyCargada = true;

            this._mostrarPantallaCargaInmediata('Preparando tu experiencia...');

            await new Promise(function(resolve) { setTimeout(resolve, 300); });
            
            if (window.gestorIdiomas) {
                await gestorIdiomas.init();
            }
            
            var idiomasCargados = gestorIdiomas?.getIdiomas?.() || [];
            if (idiomasCargados.length === 0) {
                await this._forzarCargaIdiomas(usuario);
            }

            this._registrarEventosGlobales();
            
            if (typeof window.uiCore !== 'undefined' && window.uiCore.init) {
                await window.uiCore.init();
            }
            
            if (window.pipeline) {
                try {
                    await pipeline.cargarFrasesPorIdioma(gestorIdiomas?.getIdiomaActivo() || 'es');
                    await pipeline.cargarProgreso();
                } catch (e) {}
            }
            
            this._setupPersistenciaCritica();
            this._setupOrientationHandler();
            
            console.log('📊 Renderizando dashboard...');
            await this._renderizarDashboardInmediato(usuario);
            this._dashboardRenderizado = true;
            this._datosCargados = true;
            this._modulosEsencialesListos = true;
            
            console.log('✅ Dashboard renderizado, mostrando...');
            this._ocultarPantallaCargaYMostrarDashboard();
            
            this._iniciarModulosEnSegundoPlano(usuario);
            
            // 🔥 FORZAR RECONEXIÓN DE VIGÍA NUEVAMENTE
            setTimeout(() => {
                this._reconectarVigiaAutomaticamente();
            }, 1500);
            
            await this._mostrarBienvenida(usuario);
            
            setTimeout(function() { 
                if (window.app) window.app._ejecutarVerificacionesGroq(); 
            }, 3000);
            
            setTimeout(function() {
                if (window.UIBackup) {
                    try { window.UIBackup.verificarBackupAutomatico(true); } catch (e) {}
                }
            }, 4000);

        } catch (error) {
            console.error('❌ Error en registro:', error);
            await this._showToast('Error: ' + error.message, 'error');
            this._dashboardRenderizado = true;
            this._ocultarPantallaCargaYMostrarDashboard();
        }
    }

    _getIdiomas() {
        var rows = document.querySelectorAll('.idioma-row');
        var idiomas = [];
        rows.forEach(function(row) {
            var input = row.querySelector('.idioma-input');
            var select = row.querySelector('.nivel-select');
            if (input && input.value.trim()) {
                idiomas.push({
                    idioma: input.value.trim(),
                    nivel: select ? select.value : 'B1'
                });
            }
        });
        return idiomas;
    }

    async _forzarCargaIdiomas(usuario) {
        try {
            console.log('🔄 Forzando carga de idiomas para:', usuario.nombre);
            if (!usuario.idiomasObjetivo || usuario.idiomasObjetivo.length === 0) { return false; }
            if (!window.gestorIdiomas) return false;
            
            // 🔥 LIMPIAR IDIOMAS EXISTENTES PRIMERO
            if (gestorIdiomas.idiomas.length > 0) {
                gestorIdiomas.idiomas = [];
            }
            
            for (var i = 0; i < usuario.idiomasObjetivo.length; i++) {
                var item = usuario.idiomasObjetivo[i];
                var idioma = item.idioma;
                var nivel = item.nivel || 'B1';
                
                var stats = { totalFrases: 0, frasesCompletadas: 0, progreso: 0 };
                
                if (this._dbReady && db) {
                    try {
                        var frases = await db.obtenerFrasesPorIdioma(idioma);
                        var progreso = await db.obtenerTodoProgreso();
                        var completadas = 0;
                        for (var j = 0; j < frases.length; j++) {
                            var f = frases[j];
                            var p = progreso.find(function(pr) { return pr.fraseId === f.id; });
                            if (p && (p.estado === 'completada' || p.rcn >= 4)) completadas++;
                        }
                        stats = {
                            totalFrases: frases.length,
                            frasesCompletadas: completadas,
                            progreso: frases.length > 0 ? Math.round((completadas / frases.length) * 100) : 0
                        };
                    } catch (e) {}
                }
                
                var historias = this._dbReady && db ? await db.obtenerHistoriasPorIdioma(idioma) : [];
                var temas = this._dbReady && db ? await db.obtenerTemasPorIdioma(idioma) : [];
                
                gestorIdiomas.idiomas.push({
                    idioma: idioma,
                    nivel: nivel,
                    progreso: stats.progreso || 0,
                    frasesCompletadas: stats.frasesCompletadas || 0,
                    totalFrases: stats.totalFrases || 0,
                    totalHistorias: historias.length || 0,
                    totalTemas: temas.length || 0,
                    esJeroglifico: gestorIdiomas._esJeroglifico(idioma)
                });
            }
            
            if (usuario.idiomasObjetivo.length > 0) {
                var saved = localStorage.getItem('pipeline_idioma_activo');
                var primerIdioma = usuario.idiomasObjetivo[0].idioma;
                if (saved && gestorIdiomas.idiomas.some(function(idi) { return idi.idioma === saved; })) {
                    gestorIdiomas.idiomaActivo = saved;
                } else if (usuario.idiomaActivo && gestorIdiomas.idiomas.some(function(idi) { return idi.idioma === usuario.idiomaActivo; })) {
                    gestorIdiomas.idiomaActivo = usuario.idiomaActivo;
                } else {
                    gestorIdiomas.idiomaActivo = primerIdioma;
                }
                localStorage.setItem('pipeline_idioma_activo', gestorIdiomas.idiomaActivo);
            }
            
            console.log('✅ Idiomas cargados:', gestorIdiomas.idiomas.map(function(idi) { return idi.idioma; }));
            return true;
        } catch (e) {
            console.error('❌ Error forzando carga:', e);
            return false;
        }
    }

    // ============================================================
    // UTILIDADES UI
    // ============================================================

    async _mostrarBienvenida(usuario) {
        console.log('🎉 Mostrando bienvenida para:', usuario.nombre);
        var mensajeMotivador = 'Comienza tu viaje de aprendizaje!';
        try {
            if (window.vigia && window.vigia.enLinea) {
                var prompt = 'Eres un asistente motivacional. El usuario ' + usuario.nombre + ' acaba de registrarse. Idiomas: ' + usuario.idiomasObjetivo.map(function(i) { return i.idioma + ' (' + i.nivel + ')'; }).join(', ') + ' Genera un mensaje motivador corto (max 30 palabras).';
                var respuesta = await window.vigia._consultarGroq(prompt, 'text');
                if (respuesta && respuesta.length > 5) mensajeMotivador = respuesta.trim();
            }
        } catch (e) {}
        
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);backdrop-filter:blur(10px);z-index:99999;display:flex;justify-content:center;align-items:center;animation:fadeIn 0.5s ease;';
        overlay.innerHTML = '<div style="background:#fff;border-radius:24px;padding:40px 32px;max-width:420px;width:92%;text-align:center;animation:scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 30px 80px rgba(0,0,0,0.35);"><div style="font-size:72px;margin-bottom:16px;">🎉</div><h2 style="font-size:28px;font-weight:800;background:linear-gradient(135deg,#6C5CE7,#00CEC9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;">Bienvenido, ' + usuario.nombre + '!</h2><p style="font-size:16px;color:#636E72;margin-bottom:16px;">' + mensajeMotivador + '</p><button onclick="this.closest(\'div[style]\').parentElement.remove()" style="width:100%;padding:14px;background:linear-gradient(135deg,#6C5CE7,#00CEC9);color:white;border:none;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;">Comenzar!</button></div>';
        document.body.appendChild(overlay);
        setTimeout(function() { if (overlay.parentNode) overlay.remove(); }, 8000);
        return new Promise(function(resolve) {
            var checkModal = setInterval(function() {
                if (!document.body.contains(overlay)) { clearInterval(checkModal); resolve(); }
            }, 200);
        });
    }

    _showToast(mensaje, tipo) {
        return new Promise(function(resolve) {
            if (window.uiCore && window.uiCore.mostrarToast) {
                window.uiCore.mostrarToast(mensaje, tipo);
                resolve();
            } else { alert(mensaje); resolve(); }
        });
    }

    _showConfirm(mensaje, titulo) {
        return new Promise(function(resolve) {
            if (window.uiCore && window.uiCore.confirm) {
                window.uiCore.confirm(mensaje, titulo).then(resolve);
            } else { resolve(confirm(mensaje)); }
        });
    }

    _showError(error) {
        console.error('❌ Mostrando error:', error);
        if (typeof window.uiCore !== 'undefined' && window.uiCore.mostrarToast) {
            window.uiCore.mostrarToast('Error: ' + (error.message || 'Error desconocido'), 'error');
            return;
        }
        document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;padding:20px;text-align:center;flex-direction:column;background:#f5f6fa;font-family:sans-serif;"><div style="font-size:64px;margin-bottom:16px;">❌</div><h1 style="font-size:24px;color:#FF7675;margin-bottom:8px;">Error al iniciar</h1><p style="color:#636E72;max-width:400px;">' + (error.message || 'Error desconocido') + '</p><div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;"><button onclick="location.reload()" style="padding:12px 24px;background:#6C5CE7;color:#fff;border:none;border-radius:12px;font-size:16px;cursor:pointer;">Reintentar</button><button onclick="localStorage.clear();location.reload();" style="padding:12px 24px;background:#FF7675;color:#fff;border:none;border-radius:12px;font-size:16px;cursor:pointer;">Limpiar localStorage</button></div><div style="margin-top:16px;font-size:12px;color:var(--gray-light);">Si el problema persiste, abre la consola (F12) y revisa los errores.</div></div>';
    }

    _setupOrientationHandler() {
        var self = this;
        var timeout = null;
        var handle = function() {
            if (self._initDone) return;
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(function() {
                var usuario = self._getUsuarioLocalStorage();
                if (usuario) {
                    var mainScreen = document.getElementById('mainScreen');
                    var registroScreen = document.getElementById('registroScreen');
                    if (mainScreen && !mainScreen.classList.contains('active')) {
                        mainScreen.classList.add('active');
                    }
                    if (registroScreen && registroScreen.classList.contains('active')) {
                        registroScreen.classList.remove('active');
                    }
                }
                timeout = null;
            }, 300);
        };
        window.addEventListener('orientationchange', handle);
        window.addEventListener('resize', handle);
    }

    destroy() {
        if (this._intervaloReconexionVigia) {
            clearInterval(this._intervaloReconexionVigia);
            this._intervaloReconexionVigia = null;
        }
        if (this._cargaInterval) {
            clearInterval(this._cargaInterval);
            this._cargaInterval = null;
        }
        if (this._cargaTimeout) {
            clearTimeout(this._cargaTimeout);
            this._cargaTimeout = null;
        }
        if (this._recargaTimeout) {
            clearTimeout(this._recargaTimeout);
            this._recargaTimeout = null;
        }
    }
}

// ============================================================
// INICIALIZACION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    if (window._appInitialized) return;
    window._appInitialized = true;
    console.log('🚀 Iniciando App v23.7 - Parche de emergencia...');
    
    if (typeof db === 'undefined') {
        console.error('❌ Database no definida');
        document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;padding:20px;text-align:center;flex-direction:column;background:#f5f6fa;font-family:sans-serif;"><div style="font-size:64px;margin-bottom:16px;">⚠️</div><h1 style="font-size:24px;color:#FF7675;margin-bottom:8px;">Error de Carga</h1><p style="color:#636E72;max-width:400px;">No se pudo cargar el modulo de base de datos.</p><button onclick="location.reload()" style="margin-top:20px;padding:12px 24px;background:#6C5CE7;color:#fff;border:none;border-radius:12px;font-size:16px;cursor:pointer;">Reintentar</button></div>';
        return;
    }
    
    window.app = new App();
    window.app.init();
});

// Exponer instancias globales
window.db = db;
window.vigia = vigia;
window.centinela = centinela;
window.pipeline = pipeline;
window.gramatica = gramatica;
window.ui = window.uiCore;
window.gestorNiveles = gestorNiveles;
window.gestorIdiomas = gestorIdiomas;
window.modoInverso = modoInverso;
window.tutorNeuro = tutorNeuro;
window.balanceadorGroq = balanceadorGroq;
window.modoElipse = modoElipse;
window.modoOndasCruzadas = modoOndasCruzadas;
window.UIOndasCruzadas = UIOndasCruzadas;

console.log('✅ App v23.7 - PARCHE DE EMERGENCIA');
console.log('  🔥 Limpia datos residuales de idiomas');
console.log('  🔥 Forza conexión de Vigía');
console.log('  🔥 Detiene bucles infinitos');
console.log('  🔥 Control de inicialización de módulos');
console.log('  🔥 Verificación estricta de registro');
console.log('  🚀 Dashboard visible ~2-3 segundos');