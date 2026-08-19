// ============================================================
// APP v22.7 - DEFINITIVA CON PERSISTENCIA ASEGURADA
// Y MODO ONDAS CRUZADAS - CORREGIDO
// ============================================================

class App {
    constructor() {
        this.inicializada = false;
        this._iniciando = false;
        this._initDone = false;
        this._dbReady = false;
        this._registrando = false;
        this._guardandoDatos = false;
        this._reintentosIdiomas = 0;
        this._maxReintentosIdiomas = 5;
        this._validandoIdioma = false;
        this._usuarioCargado = false;
        this._datosCargados = false;
        this._recuperandoDatos = false;
        this._esperandoDB = false;
        this._tiempoEsperaDB = 0;
        this._maxTiempoEsperaDB = 8000;
        this._checkInterval = null;
        this._intentosRecuperacion = 0;
        this._maxIntentosRecuperacion = 5;
        this._cargaOverlayMostrado = false;
        this._dbInicializada = false;
        this._intentosDB = 0;
        this._maxIntentosDB = 15;
        this._cargaCompletada = false;
        this._eventosGlobalesRegistrados = false;
        this._seleccionModoTutorRegistro = 'flexible';
        
        // Control de verificación mensual de Groq
        this._ULTIMA_VERIFICACION_KEY = 'pipeline_ultima_verificacion_groq';
        this._VERIFICACION_INTERVALO_MS = 30 * 24 * 60 * 60 * 1000;
        this._verificacionRealizada = false;
        this._verificandoVersion = false;
        this._verificandoRuta = false;
        this._verificandoTutor = false;
        
        // Asegurar que el Modo Elipse existe globalmente
        if (typeof modoElipse !== 'undefined' && modoElipse) {
            window.modoElipse = modoElipse;
        }
        
        // 🔥 MODO ONDAS CRUZADAS
        if (typeof modoOndasCruzadas !== 'undefined' && modoOndasCruzadas) {
            window.modoOndasCruzadas = modoOndasCruzadas;
        }
        if (typeof UIOndasCruzadas !== 'undefined' && UIOndasCruzadas) {
            window.UIOndasCruzadas = UIOndasCruzadas;
        }
        
        this._IDIOMAS_CONOCIDOS = {
            'espaÃ±ol': 'es', 'espanol': 'es', 'castellano': 'es', 'spanish': 'es',
            'inglÃ©s': 'en', 'ingles': 'en', 'english': 'en',
            'chino': 'zh', 'mandarÃ­n': 'zh', 'mandarin': 'zh', 'chinese': 'zh',
            'japonÃ©s': 'ja', 'japones': 'ja', 'japanese': 'ja',
            'coreano': 'ko', 'korean': 'ko',
            'francÃ©s': 'fr', 'frances': 'fr', 'french': 'fr',
            'alemÃ¡n': 'de', 'aleman': 'de', 'german': 'de',
            'italiano': 'it', 'italian': 'it',
            'portuguÃ©s': 'pt', 'portugues': 'pt', 'portuguese': 'pt',
            'ruso': 'ru', 'russian': 'ru',
            'Ã¡rabe': 'ar', 'arabe': 'ar', 'arabic': 'ar',
            'hindi': 'hi',
            'urdu': 'ur', 'persa': 'fa', 'farsi': 'fa', 'turco': 'tr', 'turkish': 'tr',
            'vietnamita': 'vi', 'vietnamese': 'vi', 'tailandÃ©s': 'th', 'thai': 'th',
            'griego': 'el', 'greek': 'el', 'hebreo': 'he', 'hebrew': 'he',
            'polaco': 'pl', 'polish': 'pl', 'ucraniano': 'uk', 'ukrainian': 'uk',
            'rumano': 'ro', 'romanian': 'ro', 'holandÃ©s': 'nl', 'dutch': 'nl',
            'sueco': 'sv', 'swedish': 'sv', 'noruego': 'no', 'norwegian': 'no',
            'danÃ©s': 'da', 'danish': 'da', 'finlandÃ©s': 'fi', 'finnish': 'fi',
            'irlandÃ©s': 'ga', 'irish': 'ga', 'galÃ©s': 'cy', 'welsh': 'cy',
            'checo': 'cs', 'czech': 'cs', 'eslovaco': 'sk', 'slovak': 'sk',
            'hÃºngaro': 'hu', 'hungarian': 'hu', 'bÃºlgaro': 'bg', 'bulgarian': 'bg',
            'serbio': 'sr', 'serbian': 'sr', 'croata': 'hr', 'croatian': 'hr',
            'estonio': 'et', 'estonian': 'et', 'letÃ³n': 'lv', 'latvian': 'lv',
            'lituano': 'lt', 'lithuanian': 'lt', 'maltÃ©s': 'mt', 'maltese': 'mt',
            'islandÃ©s': 'is', 'icelandic': 'is', 'albanÃ©s': 'sq', 'albanian': 'sq',
            'georgiano': 'ka', 'georgian': 'ka', 'armenio': 'hy', 'armenian': 'hy',
            'mongol': 'mn', 'mongolian': 'mn', 'tibetano': 'bo', 'tibetan': 'bo',
            'camboyano': 'km', 'khmer': 'km', 'laosiano': 'lo', 'lao': 'lo',
            'birmano': 'my', 'burmese': 'my', 'tagalo': 'tl', 'tagalog': 'tl',
            'indonesio': 'id', 'indonesian': 'id', 'malayo': 'ms', 'malay': 'ms',
            'suajili': 'sw', 'swahili': 'sw', 'amÃ¡rico': 'am', 'amharic': 'am',
            'hausa': 'ha', 'yoruba': 'yo', 'igbo': 'ig', 'zulÃº': 'zu', 'zulu': 'zu',
            'afrikÃ¡ans': 'af', 'afrikaans': 'af'
        };

        this._NOMBRES_IDIOMAS = {
            'es': 'EspaÃ±ol', 'en': 'InglÃ©s', 'zh': 'Chino', 'ja': 'JaponÃ©s',
            'ko': 'Coreano', 'fr': 'FrancÃ©s', 'de': 'AlemÃ¡n', 'it': 'Italiano',
            'pt': 'PortuguÃ©s', 'ru': 'Ruso', 'ar': 'Ãrabe', 'hi': 'Hindi',
            'ur': 'Urdu', 'fa': 'Persa', 'tr': 'Turco', 'vi': 'Vietnamita',
            'th': 'TailandÃ©s', 'el': 'Griego', 'he': 'Hebreo', 'pl': 'Polaco',
            'uk': 'Ucraniano', 'ro': 'Rumano', 'nl': 'HolandÃ©s', 'sv': 'Sueco',
            'no': 'Noruego', 'da': 'DanÃ©s', 'fi': 'FinlandÃ©s', 'ga': 'IrlandÃ©s',
            'cy': 'GalÃ©s', 'cs': 'Checo', 'sk': 'Eslovaco', 'hu': 'HÃºngaro',
            'bg': 'BÃºlgaro', 'sr': 'Serbio', 'hr': 'Croata', 'et': 'Estonio',
            'lv': 'LetÃ³n', 'lt': 'Lituano', 'mt': 'MaltÃ©s', 'is': 'IslandÃ©s',
            'sq': 'AlbanÃ©s', 'ka': 'Georgiano', 'hy': 'Armenio', 'mn': 'Mongol',
            'bo': 'Tibetano', 'km': 'Camboyano', 'lo': 'Laosiano', 'my': 'Birmano',
            'tl': 'Tagalo', 'id': 'Indonesio', 'ms': 'Malayo', 'sw': 'Suajili',
            'am': 'AmÃ¡rico', 'ha': 'Hausa', 'yo': 'Yoruba', 'ig': 'Igbo',
            'zu': 'ZulÃº', 'af': 'AfrikÃ¡ans'
        };
    }

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
            console.log('✅ Verificaciones Groq ya realizadas este mes');
            return;
        }

        console.log('🚀 Ejecutando verificaciones mensuales de Groq...');
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
                            window.uiCore.mostrarToast(`🔄 ${exitos} idioma(s) actualizado(s)`, 'success');
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Error verificando versiones:', e);
                }
            }
            this._verificandoVersion = false;

            try {
                if (window.LearningPath) {
                    await window.LearningPath.generarRuta();
                }
            } catch (e) {
                console.warn('⚠️ Error generando ruta:', e);
            }
            this._verificandoRuta = false;

            try {
                if (window.tutorNeuro && window.tutorNeuro._recomendarSiguienteTema) {
                    window.tutorNeuro._recomendarSiguienteTema();
                }
            } catch (e) {
                console.warn('⚠️ Error en recomendaciÃ³n del tutor:', e);
            }
            this._verificandoTutor = false;

            this._guardarFechaVerificacion();
            this._verificacionRealizada = true;
            console.log('✅ Verificaciones mensuales completadas');

        } catch (error) {
            console.error('❌ Error en verificaciones:', error);
            this._verificandoVersion = false;
            this._verificandoRuta = false;
            this._verificandoTutor = false;
        }
    }

    _validarIdiomaLocal(texto, tipo = 'nativo') {
        if (!texto || texto.trim().length < 2) {
            return {
                original: texto || '',
                idiomaFinal: texto || '',
                valido: false,
                mensaje: '❌ Por favor, escribe un idioma vÃ¡lido.',
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
                mensaje: `✅ ${nombre} (${codigo})`,
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
                mensaje: `✏️ Â¿Quisiste decir "${nombre}"?`,
                corregido: true,
                codigo: codigo,
                sugerido: mejorMatch
            };
        }

        return {
            original: texto.trim(),
            idiomaFinal: texto.trim(),
            valido: false,
            mensaje: `❌ "${texto.trim()}" no es un idioma vÃ¡lido. Prueba con: EspaÃ±ol, InglÃ©s, Chino, etc.`,
            corregido: false
        };
    }

    _calcularSimilitud(a, b) {
        if (a === b) return 1;
        if (a.length === 0 || b.length === 0) return 0;
        
        const normalize = (str) => {
            return str.normalize('NFKD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-ZÃ¡Ã©Ã­Ã³ÃºÃ±Ã¼ÃÃ‰ÃÃ“ÃšÃ‘Ãœ\s]/g, '')
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

    async init() {
        if (this._iniciando || this._initDone) return;
        this._iniciando = true;

        try {
            console.log('🧠 Iniciando Pipeline v22.7 con persistencia asegurada y Ondas Cruzadas...');

            this._mostrarPantallaCarga('Inicializando...');

            console.log('📀 Inicializando Database...');
            this._esperandoDB = true;
            this._dbReady = false;
            
            try {
                await this._inicializarDBConReintentos();
                this._dbReady = true;
                this._dbInicializada = true;
                console.log('✅ Database inicializada correctamente');
            } catch (dbError) {
                console.error('❌ Error crÃ­tico inicializando DB:', dbError);
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

            if (window.validadorIdiomas) {
                console.log('✅ Validador de idiomas disponible');
            }

            let usuario = null;
            let apiKey = null;
            let idiomaActivoPersistido = null;
            
            if (this._dbReady) {
                try {
                    usuario = await db.getUsuario();
                    if (usuario && usuario.nombre) {
                        console.log('✅ Usuario encontrado en IndexedDB:', usuario.nombre);
                        this._usuarioCargado = true;
                        if (usuario.idiomaActivo) {
                            idiomaActivoPersistido = usuario.idiomaActivo;
                        }
                        this._saveUsuarioLocalStorage(usuario);
                    }
                    try {
                        apiKey = await db.obtenerApiKey();
                        if (apiKey) localStorage.setItem('pipeline_api_key', apiKey);
                    } catch (e) {}
                } catch (e) {
                    console.warn('⚠️ Error obteniendo usuario de IndexedDB:', e);
                }
            }

            if (!usuario || !usuario.nombre) {
                const localUser = this._getUsuarioLocalStorage();
                if (localUser && localUser.nombre) {
                    console.log('📦 Usuario recuperado desde localStorage:', localUser.nombre);
                    usuario = localUser;
                    this._usuarioCargado = true;
                    if (this._dbReady) {
                        try {
                            await db.guardarUsuario(usuario);
                            const localApiKey = localStorage.getItem('pipeline_api_key');
                            if (localApiKey) await db.guardarApiKey(localApiKey);
                        } catch (e) {}
                    }
                }
            }

            if (!apiKey) {
                apiKey = localStorage.getItem('pipeline_api_key');
            }

            if (usuario && usuario.nombre) {
                console.log('👤 Usuario cargado:', usuario.nombre);
                
                if (usuario.idiomasObjetivo && usuario.idiomasObjetivo.length > 0) {
                    await this._forzarCargaIdiomas(usuario);
                    
                    if (idiomaActivoPersistido) {
                        const existe = usuario.idiomasObjetivo.some(i => i.idioma === idiomaActivoPersistido);
                        if (existe) {
                            console.log(`📍 Activando idioma persistido: ${idiomaActivoPersistido}`);
                            await gestorIdiomas.cambiarIdioma(idiomaActivoPersistido);
                        } else if (usuario.idiomasObjetivo.length > 0) {
                            await gestorIdiomas.cambiarIdioma(usuario.idiomasObjetivo[0].idioma);
                        }
                    } else if (usuario.idiomasObjetivo.length > 0) {
                        await gestorIdiomas.cambiarIdioma(usuario.idiomasObjetivo[0].idioma);
                    }
                } else {
                    console.warn('⚠️ Usuario sin idiomas objetivo');
                }
                
                this._registrarEventosGlobales();
                await this._iniciarModulosYUI(usuario);
                this._showMainScreen(usuario);
                this._setupPersistenciaCritica();
                this._setupOrientationHandler();
                
                if (window.UICaracteres) {
                    try {
                        await window.UICaracteres.init(window.uiCore);
                    } catch (e) {}
                }
                
                if (window.LearningPath && typeof window.LearningPath.init === 'function') {
                    try {
                        await window.LearningPath.init(window.uiCore);
                    } catch (e) {}
                }
                
                if (window.tutorNeuro && typeof window.tutorNeuro.initTutor === 'function') {
                    try {
                        await window.tutorNeuro.initTutor();
                    } catch (e) {}
                }
                
                // 🌌 INICIALIZAR MODO ELIPSE CON CARGA DE DATOS
                if (window.modoElipse && typeof window.modoElipse.init === 'function') {
                    try {
                        await window.modoElipse.init(window.uiCore);
                        console.log('🌌 Modo Elipse inicializado');
                        
                        if (typeof window.modoElipse.cargarDatos === 'function') {
                            const datos = await window.modoElipse.cargarDatos();
                            console.log(`🌌 Datos del Modo Elipse cargados: ${datos.length} ondas`);
                        }
                    } catch (e) {
                        console.warn('⚠️ Error inicializando Modo Elipse:', e);
                    }
                }
                
                // 🔥 INICIALIZAR MODO ONDAS CRUZADAS
                if (window.modoOndasCruzadas && typeof window.modoOndasCruzadas.init === 'function') {
                    try {
                        await window.modoOndasCruzadas.init(window.uiCore);
                        console.log('🌊 Modo Ondas Cruzadas inicializado');
                    } catch (e) {
                        console.warn('⚠️ Error inicializando Modo Ondas Cruzadas:', e);
                    }
                }
                
                if (window.UIOndasCruzadas && typeof window.UIOndasCruzadas.init === 'function') {
                    try {
                        await window.UIOndasCruzadas.init(window.uiCore);
                        console.log('🌊 UI Ondas Cruzadas inicializada');
                    } catch (e) {
                        console.warn('⚠️ Error inicializando UI Ondas Cruzadas:', e);
                    }
                }
                
                // Inicializar UI Elipse
                if (window.UIClipse && typeof window.UIClipse.init === 'function') {
                    try {
                        await window.UIClipse.init(window.uiCore);
                        console.log('🌌 UI Elipse inicializada');
                    } catch (e) {
                        console.warn('⚠️ Error inicializando UI Elipse:', e);
                    }
                }
                
                setTimeout(async () => {
                    await this._ejecutarVerificacionesGroq();
                }, 5000);
                
                setTimeout(async () => {
                    if (window.UIBackup) {
                        try {
                            await window.UIBackup.verificarBackupAutomatico(true);
                        } catch (e) {}
                    }
                }, 5000);
                
                setTimeout(() => {
                    this._actualizarUICompleta();
                    this._datosCargados = true;
                    this._cargaCompletada = true;
                    this._ocultarPantallaCarga();
                }, 500);
                
                this.inicializada = true;
                this._initDone = true;
                console.log('✅ App iniciada correctamente con Ondas Cruzadas');
                return;
            }

            console.log('👤 No hay usuario, mostrando registro');
            this._ocultarPantallaCarga();
            this._showRegisterScreen();

        } catch (error) {
            console.error('❌ Error crÃ­tico en init:', error);
            const localUser = this._getUsuarioLocalStorage();
            if (localUser && localUser.nombre) {
                try {
                    await this._iniciarConLocalStorage(localUser);
                    return;
                } catch (e) {}
            }
            this._ocultarPantallaCarga();
            this._showError(error);
        } finally {
            this._iniciando = false;
            if (this._checkInterval) {
                clearInterval(this._checkInterval);
                this._checkInterval = null;
            }
        }
    }

    _registrarEventosGlobales() {
        if (this._eventosGlobalesRegistrados) return;
        this._eventosGlobalesRegistrados = true;
        
        console.log('🔗 Registrando eventos globales...');
        
        window.addEventListener('versionIdiomaActualizada', (e) => {
            if (window.UITemas) setTimeout(() => window.UITemas._renderTemas(), 300);
            if (window.UIConfig && window.UIConfig._recargarConfiguracion) {
                setTimeout(() => window.UIConfig._recargarConfiguracion(), 500);
            }
        });
        
        window.addEventListener('idiomaCambiado', async (e) => {
            const idioma = e.detail?.idioma;
            console.log(`📢 App recibiÃ³ idiomaCambiado: ${idioma}`);
            
            if (window.UITemas) {
                window.UITemas._temaCompletadoCache = {};
                window.UITemas._nivelDesbloqueadoCache = {};
                window.UITemas._temasCompletadosPorIdioma = {};
            }
            
            await this._actualizarUICompleta();
            this._guardarDatosCriticos();
            
            if (window.vigiaGramatical) {
                try {
                    await window.vigiaGramatical.initGramatical();
                    await window.vigiaGramatical._actualizarEdadGramatical(idioma);
                } catch (e) {}
            }
            
            if (window.UICaracteres && window.UICaracteres.estaDisponible()) {
                try {
                    await window.UICaracteres.cargar(window.uiCore);
                } catch (e) {}
            }
            
            if (window.LearningPath) {
                setTimeout(async () => {
                    try {
                        await window.LearningPath.generarRuta(true);
                    } catch (e) {}
                }, 2000);
            }
            
            if (window.tutorNeuro && window.tutorNeuro._recomendarSiguienteTema) {
                setTimeout(() => {
                    try {
                        window.tutorNeuro._recomendarSiguienteTema();
                    } catch (e) {}
                }, 3000);
            }
            
            if (window.UITemas) {
                setTimeout(() => window.UITemas._renderTemas(), 300);
            }
            
            // 🌌 RECARGAR MÃ“DULO ELIPSE
            if (window.UIClipse) {
                setTimeout(() => {
                    try {
                        window.UIClipse.cargar(window.uiCore);
                    } catch (e) {}
                }, 500);
            }
            
            // 🌊 RECARGAR MÃ“DULO ONDAS CRUZADAS - FORZAR RECARGA COMPLETA
            if (window.UIOndasCruzadas) {
                try {
                    console.log('🌊 Forzando recarga de Ondas Cruzadas por cambio de idioma...');
                    // Marcar datos como no cargados
                    window.UIOndasCruzadas._datosCargados = false;
                    // Recargar datos y renderizar
                    await window.UIOndasCruzadas._cargarDatos();
                    window.UIOndasCruzadas._renderizarPanel();
                } catch (error) {
                    console.warn('⚠️ Error recargando Ondas Cruzadas:', error);
                }
            }
        });
        
        window.addEventListener('modoInversoChange', async () => {
            if (window.UIStudy && window.UIStudy._renderizarFraseInteractiva) {
                window.UIStudy._renderizarFraseInteractiva();
            }
            if (window.uiCore && window.uiCore._actualizarModoInversoBtn) {
                window.uiCore._actualizarModoInversoBtn();
            }
        });
        
        window.addEventListener('favoritoActualizado', async () => {
            if (window.UIDashboard) {
                await window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }
            if (window.UIEspacio) {
                await window.UIEspacio._renderizarMiEspacio();
            }
            if (window.uiCore && window.uiCore._actualizarEspacioStats) {
                window.uiCore._actualizarEspacioStats();
            }
        });
        
        window.addEventListener('cambioNivel', async () => {
            if (window.UIConfig && window.UIConfig._actualizarNivelHeader) {
                window.UIConfig._actualizarNivelHeader();
            }
            if (window.UIDashboard) {
                await window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }
            if (window.LearningPath) {
                setTimeout(async () => {
                    try {
                        await window.LearningPath.generarRuta(true);
                    } catch (e) {}
                }, 2000);
            }
            if (window.tutorNeuro && window.tutorNeuro._recomendarSiguienteTema) {
                setTimeout(() => {
                    try {
                        window.tutorNeuro._recomendarSiguienteTema();
                    } catch (e) {}
                }, 3000);
            }
            if (window.UITemas) {
                setTimeout(() => window.UITemas._renderTemas(), 300);
            }
        });
        
        window.addEventListener('idiomaAgregado', async (e) => {
            if (window.UIConfig && window.UIConfig._recargarConfiguracion) {
                await window.UIConfig._recargarConfiguracion();
            }
            if (window.UIDashboard) {
                await window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }
            if (window.UITemas) {
                window.UITemas._renderTemas();
            }
            if (window.vigiaGramatical) {
                try {
                    await window.vigiaGramatical.initGramatical();
                } catch (e) {}
            }
            if (window.tutorNeuro) {
                setTimeout(async () => {
                    try {
                        await window.tutorNeuro._construirMapaAprendizaje();
                    } catch (e) {}
                }, 2000);
            }
            if (window.UITemas) {
                setTimeout(() => window.UITemas._renderTemas(), 300);
            }
        });
        
        window.addEventListener('idiomaEliminado', async (e) => {
            if (window.UIConfig && window.UIConfig._recargarConfiguracion) {
                await window.UIConfig._recargarConfiguracion();
            }
            if (window.UIDashboard) {
                await window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }
            if (window.UITemas) {
                window.UITemas._renderTemas();
            }
            if (window.tutorNeuro) {
                setTimeout(async () => {
                    try {
                        await window.tutorNeuro._construirMapaAprendizaje();
                    } catch (e) {}
                }, 2000);
            }
        });
        
        window.addEventListener('vigiaGramaticalActualizado', () => {
            if (window.UIGrammar) {
                window.UIGrammar._cargarGramatica();
            }
        });
        
        window.addEventListener('familiaCaracteresGenerada', () => {
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }
            if (window.UICaracteres) {
                window.UICaracteres.cargar(window.uiCore);
            }
        });
        
        // 🌌 EVENTOS DEL MODO ELIPSE
        window.addEventListener('elipseOndaGenerada', (e) => {
            console.log('🌌 App detectÃ³ elipseOndaGenerada:', e.detail);
            if (window.modoElipse) {
                window.modoElipse._guardarEstadoElipse();
            }
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }
            if (window.UIClipse) {
                setTimeout(() => {
                    try {
                        window.UIClipse.cargar(window.uiCore);
                    } catch (e) {}
                }, 500);
            }
            if (window.UITemas) {
                setTimeout(() => window.UITemas._renderTemas(), 500);
            }
            // 🌊 Sincronizar Ondas Cruzadas
            if (window.modoOndasCruzadas) {
                setTimeout(() => {
                    window.modoOndasCruzadas.sincronizarConElipse(e.detail?.temaId);
                }, 500);
            }
        });
        
        window.addEventListener('elipseOndaCompletada', (e) => {
            console.log('🌌 App detectÃ³ elipseOndaCompletada:', e.detail);
            if (window.modoElipse) {
                window.modoElipse._guardarEstadoElipse();
            }
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }
            if (window.UIClipse) {
                setTimeout(() => {
                    try {
                        window.UIClipse.cargar(window.uiCore);
                    } catch (e) {}
                }, 500);
            }
        });
        
        window.addEventListener('elipseTemaSeleccionado', (e) => {
            console.log('🌌 App detectÃ³ elipseTemaSeleccionado:', e.detail);
            if (window.modoElipse) {
                window.modoElipse._guardarEstadoElipse();
            }
        });
        
        // 🌊 EVENTOS DEL MODO ONDAS CRUZADAS
        window.addEventListener('ondasCruzadasGenerada', (e) => {
            console.log('🌊 App detectÃ³ ondasCruzadasGenerada:', e.detail);
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }
            if (window.UIOndasCruzadas) {
                setTimeout(() => {
                    try {
                        window.UIOndasCruzadas.cargar(window.uiCore);
                    } catch (e) {}
                }, 500);
            }
            if (window.UIClipse) {
                setTimeout(() => {
                    try {
                        window.UIClipse.cargar(window.uiCore);
                    } catch (e) {}
                }, 500);
            }
        });
        
        window.addEventListener('ondasCruzadasSincronizadas', (e) => {
            console.log('🌊 App detectÃ³ ondasCruzadasSincronizadas:', e.detail);
            if (window.UIOndasCruzadas) {
                setTimeout(() => {
                    try {
                        window.UIOndasCruzadas.cargar(window.uiCore);
                    } catch (e) {}
                }, 500);
            }
        });
        
        // Eventos del balanceador
        window.addEventListener('balanceadorModeloCambiado', (e) => {
            if (window.uiCore) {
                window.uiCore.mostrarToast(`âš–ï¸ Modelo activo: ${e.detail?.modelo}`, 'info');
            }
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }
        });
        
        window.addEventListener('balanceadorEstadoActualizado', () => {
            if (window.uiCore && window.uiCore._actualizarIndicadorBalanceador) {
                window.uiCore._actualizarIndicadorBalanceador();
            }
        });
        
        window.addEventListener('tokensActualizados', (e) => {
            if (window.uiCore && window.uiCore._actualizarIndicadorTokens) {
                window.uiCore._actualizarIndicadorTokens(e.detail);
            }
            if (window.uiCore) {
                window.uiCore._actualizarActividad();
            }
        });
        
        console.log('✅ Eventos globales registrados (incluyendo Ondas Cruzadas)');
    }

    async _inicializarDBConReintentos() {
        return new Promise((resolve, reject) => {
            let intentos = 0;
            const intentar = async () => {
                try {
                    if (typeof db === 'undefined' || !db) throw new Error('Database no definida');
                    await db.init();
                    if (db.db && db.db.name === 'PipelineDB') {
                        console.log(`✅ Database inicializada en intento ${intentos + 1}`);
                        resolve();
                        return;
                    }
                    throw new Error('Database no inicializada');
                } catch (e) {
                    intentos++;
                    if (intentos >= this._maxIntentosDB) {
                        reject(new Error(`No se pudo inicializar IndexedDB: ${e.message}`));
                    } else {
                        console.log(`⏳ Esperando IndexedDB... intento ${intentos}/${this._maxIntentosDB}`);
                        setTimeout(intentar, Math.min(1000, 200 * intentos));
                    }
                }
            };
            intentar();
        });
    }

    _mostrarPantallaCarga(mensaje = 'Cargando...') {
        if (this._cargaOverlayMostrado) return;
        this._cargaOverlayMostrado = true;
        
        const overlay = document.createElement('div');
        overlay.id = 'cargaOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: var(--bg, #f5f6fa); z-index: 99999;
            display: flex; justify-content: center; align-items: center; flex-direction: column;
            font-family: var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            transition: opacity 0.5s ease;
        `;
        overlay.innerHTML = `
            <div style="text-align:center;max-width:400px;padding:20px;">
                <div style="font-size:64px;margin-bottom:16px;animation: pulse 1.5s ease-in-out infinite;">🧠</div>
                <h2 style="font-size:28px;font-weight:800;background:linear-gradient(135deg, #6C5CE7, #00CEC9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;">Pipeline Neuro</h2>
                <p style="color:var(--gray);font-size:16px;margin-bottom:16px;">${mensaje}</p>
                <div style="width:280px;height:4px;background:var(--light);border-radius:2px;margin:0 auto;overflow:hidden;">
                    <div style="height:100%;background:linear-gradient(90deg, #6C5CE7, #00CEC9);border-radius:2px;animation: loadingProgress 1.5s ease-in-out infinite;"></div>
                </div>
                <div style="margin-top:8px;font-size:12px;color:var(--gray-light);" id="cargaStatus">Inicializando sistema...</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    _ocultarPantallaCarga() {
        const overlay = document.getElementById('cargaOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 500);
        }
        this._cargaOverlayMostrado = false;
    }

    async _iniciarConLocalStorage(usuario) {
        console.log('🔄 Iniciando en modo localStorage (emergencia)');
        try {
            this._mostrarPantallaCarga('Recuperando datos de emergencia...');
            if (usuario.idiomasObjetivo && usuario.idiomasObjetivo.length > 0) {
                gestorIdiomas.idiomas = [];
                for (const item of usuario.idiomasObjetivo) {
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
                const saved = localStorage.getItem('pipeline_idioma_activo');
                if (saved && gestorIdiomas.idiomas.some(i => i.idioma === saved)) {
                    gestorIdiomas.idiomaActivo = saved;
                } else {
                    gestorIdiomas.idiomaActivo = usuario.idiomasObjetivo[0].idioma;
                }
                localStorage.setItem('pipeline_idioma_activo', gestorIdiomas.idiomaActivo);
            }
            this._registrarEventosGlobales();
            await this._iniciarModulosYUI(usuario);
            this._showMainScreen(usuario);
            this._setupPersistenciaCritica();
            this._setupOrientationHandler();
            
            if (window.LearningPath && typeof window.LearningPath.init === 'function') {
                try { await window.LearningPath.init(window.uiCore); } catch (e) {}
            }
            if (window.tutorNeuro && typeof window.tutorNeuro.initTutor === 'function') {
                try { await window.tutorNeuro.initTutor(); } catch (e) {}
            }
            
            // 🌌 INICIALIZAR MODO ELIPSE EN MODO EMERGENCIA
            if (window.modoElipse && typeof window.modoElipse.init === 'function') {
                try {
                    await window.modoElipse.init(window.uiCore);
                    if (typeof window.modoElipse.cargarDatos === 'function') {
                        await window.modoElipse.cargarDatos();
                    }
                    console.log('🌌 Modo Elipse inicializado en modo emergencia');
                } catch (e) {
                    console.warn('⚠️ Error inicializando Modo Elipse en emergencia:', e);
                }
            }
            
            // 🌊 INICIALIZAR MODO ONDAS CRUZADAS EN MODO EMERGENCIA
            if (window.modoOndasCruzadas && typeof window.modoOndasCruzadas.init === 'function') {
                try {
                    await window.modoOndasCruzadas.init(window.uiCore);
                    console.log('🌊 Modo Ondas Cruzadas inicializado en modo emergencia');
                } catch (e) {
                    console.warn('⚠️ Error inicializando Modo Ondas Cruzadas en emergencia:', e);
                }
            }
            if (window.UIOndasCruzadas && typeof window.UIOndasCruzadas.init === 'function') {
                try {
                    await window.UIOndasCruzadas.init(window.uiCore);
                } catch (e) {}
            }
            
            if (window.UIClipse && typeof window.UIClipse.init === 'function') {
                try {
                    await window.UIClipse.init(window.uiCore);
                } catch (e) {}
            }
            
            setTimeout(async () => { await this._ejecutarVerificacionesGroq(); }, 5000);
            setTimeout(async () => {
                if (window.UIBackup) {
                    try { await window.UIBackup.verificarBackupAutomatico(true); } catch (e) {}
                }
            }, 5000);
            
            setTimeout(() => {
                this._actualizarUICompleta();
                this._datosCargados = true;
                this._cargaCompletada = true;
                this._ocultarPantallaCarga();
            }, 500);
            
            this.inicializada = true;
            this._initDone = true;
            console.log('✅ App iniciada en modo localStorage con Ondas Cruzadas');
        } catch (e) {
            console.error('❌ Error en modo localStorage:', e);
            this._ocultarPantallaCarga();
            this._showError(e);
        }
    }

    _setupPersistenciaCritica() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this._guardarDatosCriticos();
                if (window.UIBackup) {
                    window.UIBackup._generarBackupLocal(true).catch(() => {});
                }
            }
        });

        window.addEventListener('beforeunload', () => {
            this._guardarDatosCriticos();
            if (window.UIBackup) {
                window.UIBackup._generarBackupLocal(true).catch(() => {});
            }
        });

        setInterval(() => { this._guardarDatosCriticos(); }, 15000);
    }

    async _guardarDatosCriticos() {
        if (this._guardandoDatos) return;
        this._guardandoDatos = true;
        try {
            const usuario = this._getUsuarioLocalStorage();
            if (!usuario) { this._guardandoDatos = false; return; }
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo?.() || localStorage.getItem('pipeline_idioma_activo');
            if (idiomaActivo) usuario.idiomaActivo = idiomaActivo;
            if (this._dbReady && db) {
                try {
                    await db.guardarUsuario(usuario);
                    const apiKey = localStorage.getItem('pipeline_api_key');
                    if (apiKey) await db.guardarApiKey(apiKey);
                } catch (e) {}
            }
            this._saveUsuarioLocalStorage(usuario);
            if (gestorIdiomas && gestorIdiomas.idiomaActivo) {
                localStorage.setItem('pipeline_idioma_activo', gestorIdiomas.idiomaActivo);
                localStorage.setItem('pipeline_idiomas', JSON.stringify(gestorIdiomas.idiomas));
            }
            if (gestorFavoritos) {
                try {
                    await gestorFavoritos.guardarFavoritos();
                    await gestorFavoritos._guardarGrupos();
                } catch (e) {}
            }
            // 🌊 Guardar estado de Ondas Cruzadas
            if (window.modoOndasCruzadas) {
                try {
                    window.modoOndasCruzadas._guardarDatos();
                } catch (e) {}
            }
        } catch (e) { console.warn('⚠️ Error guardando datos:', e); }
        finally { this._guardandoDatos = false; }
    }

    _getUsuarioLocalStorage() {
        try {
            const data = localStorage.getItem('pipeline_usuario');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed && parsed.nombre && parsed.idiomasObjetivo?.length > 0) {
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

    _showMainScreen(usuario) {
        const registroScreen = document.getElementById('registroScreen');
        const mainScreen = document.getElementById('mainScreen');
        if (registroScreen) { registroScreen.style.display = 'none'; registroScreen.classList.remove('active'); }
        if (mainScreen) { mainScreen.style.display = 'block'; mainScreen.classList.add('active'); mainScreen.scrollTop = 0; }
        const userName = document.getElementById('userName');
        if (userName) userName.textContent = usuario.nombre;
        const dashUser = document.getElementById('dashUserName');
        if (dashUser) dashUser.textContent = usuario.nombre;
        setTimeout(() => this._loadDashboard(), 300);
        console.log('✅ Dashboard mostrado');
    }

    _showRegisterScreen() {
        const registroScreen = document.getElementById('registroScreen');
        const mainScreen = document.getElementById('mainScreen');
        if (registroScreen) { registroScreen.style.display = 'flex'; registroScreen.classList.add('active'); }
        if (mainScreen) { mainScreen.style.display = 'none'; mainScreen.classList.remove('active'); }
        this._setupRegisterForm();
        console.log('📝 Pantalla de registro mostrada');
    }

    _setupRegisterForm() {
        const form = document.getElementById('registroForm');
        if (!form) { console.warn('⚠️ Formulario de registro no encontrado'); return; }
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this._registrando) { console.log('⏳ Registro en proceso'); return; }
            this._registrando = true;
            try { await this._handleRegister(e); }
            catch (error) { console.error('❌ Error en registro:', error); this._showError(error); }
            finally { this._registrando = false; }
        });
        console.log('✅ Formulario de registro configurado');
    }

    async _handleRegister(event) {
        console.log('📝 Procesando registro...');

        try {
            const nombreInput = document.getElementById('nombre');
            const idiomaNativoInput = document.getElementById('idiomaNativo');
            const apiKeyInput = document.getElementById('apiKey');
            
            const nombre = nombreInput?.value?.trim() || '';
            let idiomaNativo = idiomaNativoInput?.value?.trim() || '';
            const apiKey = apiKeyInput?.value?.trim() || '';
            
            let idiomas = this._getIdiomas();

            console.log('📝 Datos capturados:', { 
                nombre, idiomaNativo, 
                idiomas: idiomas.map(i => i.idioma + ' (' + i.nivel + ')'),
                apiKey: apiKey ? '***' : 'No' 
            });

            if (!nombre) { await this._showToast('❌ El nombre es obligatorio', 'error'); return; }
            if (!idiomaNativo) { await this._showToast('❌ El idioma nativo es obligatorio', 'error'); return; }
            if (idiomas.length === 0) { await this._showToast('❌ Debes aÃ±adir al menos un idioma objetivo', 'error'); return; }
            if (!apiKey || !apiKey.startsWith('gsk_')) {
                await this._showToast('❌ API Key invÃ¡lida. Debe comenzar con "gsk_"', 'error');
                return;
            }

            try {
                await db.guardarApiKey(apiKey);
                localStorage.setItem('pipeline_api_key', apiKey);
                console.log('✅ API Key guardada');
            } catch (e) {
                await this._showToast('❌ Error guardando API Key: ' + e.message, 'error');
                return;
            }

            let validacionNativo = null;
            let usarGroq = false;
            
            if (window.validadorIdiomas && window.vigia && window.vigia.enLinea && window.vigia._apiKeyValidada) {
                try {
                    validacionNativo = await window.validadorIdiomas.validar(idiomaNativo, 'nativo');
                    usarGroq = true;
                    console.log('🔍 ValidaciÃ³n con Groq para nativo:', validacionNativo);
                } catch (e) {
                    console.warn('⚠️ Error en validadorIdiomas, usando fallback local:', e);
                }
            }

            if (!validacionNativo) {
                validacionNativo = this._validarIdiomaLocal(idiomaNativo, 'nativo');
                console.log('📌 Usando validaciÃ³n LOCAL para nativo:', validacionNativo);
            }

            if (!validacionNativo.valido) {
                let mensaje = `❌ "${idiomaNativo}" no es un idioma vÃ¡lido.`;
                if (validacionNativo.mensaje) {
                    mensaje += `\n\n${validacionNativo.mensaje}`;
                }
                const sugerencias = this._obtenerSugerenciasIdiomas(idiomaNativo);
                if (sugerencias.length > 0) {
                    mensaje += `\n\nðŸ’¡ Â¿Quisiste decir: ${sugerencias.join(', ')}?`;
                }
                await this._showToast(mensaje, 'error');
                return;
            }

            if (validacionNativo.corregido && validacionNativo.sugerido) {
                const aceptar = await this._showConfirm(
                    `🔍 Sugerencia: "${idiomaNativo}" → **"${validacionNativo.idiomaFinal}"**\n\n${validacionNativo.mensaje || ''}\n\n¿Usar "${validacionNativo.idiomaFinal}"?`,
                    '✏️ CorrecciÃ³n de idioma'
                );
                if (aceptar) {
                    idiomaNativo = validacionNativo.idiomaFinal;
                    if (idiomaNativoInput) idiomaNativoInput.value = idiomaNativo;
                } else {
                    return;
                }
            }

            const idiomasValidados = [];
            for (const item of idiomas) {
                let validacion = null;
                
                if (window.validadorIdiomas && window.vigia && window.vigia.enLinea && window.vigia._apiKeyValidada) {
                    try {
                        validacion = await window.validadorIdiomas.validar(item.idioma, 'objetivo');
                        console.log(`🔍 ValidaciÃ³n con Groq para "${item.idioma}":`, validacion);
                    } catch (e) {
                        console.warn(`⚠️ Error en validadorIdiomas para "${item.idioma}", usando fallback local:`, e);
                    }
                }

                if (!validacion) {
                    validacion = this._validarIdiomaLocal(item.idioma, 'objetivo');
                    console.log(`📌 Usando validaciÃ³n LOCAL para "${item.idioma}":`, validacion);
                }

                if (!validacion.valido) {
                    let mensaje = `❌ "${item.idioma}" no es un idioma vÃ¡lido.`;
                    if (validacion.mensaje) {
                        mensaje += `\n\n${validacion.mensaje}`;
                    }
                    const sugerencias = this._obtenerSugerenciasIdiomas(item.idioma);
                    if (sugerencias.length > 0) {
                        mensaje += `\n\nðŸ’¡ Â¿Quisiste decir: ${sugerencias.join(', ')}?`;
                    }
                    await this._showToast(mensaje, 'error');
                    return;
                }

                let idiomaFinal = validacion.idiomaFinal;
                
                if (validacion.corregido && validacion.sugerido) {
                    const aceptar = await this._showConfirm(
                        `🔍 Sugerencia: "${item.idioma}" → **"${idiomaFinal}"**\n\n${validacion.mensaje || ''}\n\n¿Usar "${idiomaFinal}"?`,
                        '✏️ CorrecciÃ³n de idioma'
                    );
                    if (aceptar) {
                        const rows = document.querySelectorAll('.idioma-row');
                        for (const row of rows) {
                            const input = row.querySelector('.idioma-input');
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

            const usuario = {
                nombre: nombre,
                idiomaNativo: idiomaNativo,
                idiomasObjetivo: idiomas,
                nivel: idiomas[0]?.nivel || 'B1',
                idiomaActivo: idiomas[0]?.idioma || '',
                fechaRegistro: new Date().toISOString(),
                version: '22.7'
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

            if (window.validadorIdiomas) {
                try {
                    await window.validadorIdiomas.guardar(idiomaNativo, 'nativo');
                    for (const item of idiomas) {
                        await window.validadorIdiomas.guardar(item.idioma, 'objetivo');
                    }
                    console.log(`✅ Idiomas validados y guardados: nativo="${idiomaNativo}", objetivos=${idiomas.map(i => i.idioma).join(', ')}`);
                } catch (e) {
                    console.warn('⚠️ Error guardando idiomas en validador:', e);
                }
            }

            const modoTutor = localStorage.getItem('pipeline_tutor_modo') || 'flexible';
            if (window.tutorNeuro) {
                try {
                    window.tutorNeuro.setModo(modoTutor);
                    console.log(`🧠 Modo Tutor configurado: ${modoTutor}`);
                } catch (e) {
                    console.warn('⚠️ Error guardando modo del tutor:', e);
                }
            } else {
                localStorage.setItem('pipeline_tutor_modo', modoTutor);
            }

            console.log('✅ Registro completado para:', usuario.nombre);

            await new Promise(resolve => setTimeout(resolve, 300));
            await gestorIdiomas.init();
            
            let idiomasCargados = gestorIdiomas.getIdiomas();
            if (idiomasCargados.length === 0) {
                await this._forzarCargaIdiomas(usuario);
            }

            this._registrarEventosGlobales();
            await window.uiCore.init();
            await this._initModules();
            await this._mostrarBienvenida(usuario);
            this._showMainScreen(usuario);
            this._setupPersistenciaCritica();
            this._setupOrientationHandler();
            
            if (window.LearningPath && typeof window.LearningPath.init === 'function') {
                try { await window.LearningPath.init(window.uiCore); } catch (e) {}
            }
            if (window.tutorNeuro && typeof window.tutorNeuro.initTutor === 'function') {
                try { await window.tutorNeuro.initTutor(); } catch (e) {}
            }
            
            // 🌌 INICIALIZAR MODO ELIPSE DESPUÃ‰S DEL REGISTRO
            if (window.modoElipse && typeof window.modoElipse.init === 'function') {
                try {
                    await window.modoElipse.init(window.uiCore);
                    if (typeof window.modoElipse.cargarDatos === 'function') {
                        await window.modoElipse.cargarDatos();
                    }
                    console.log('🌌 Modo Elipse inicializado despuÃ©s del registro');
                } catch (e) {
                    console.warn('⚠️ Error inicializando Modo Elipse despuÃ©s del registro:', e);
                }
            }
            
            // 🌊 INICIALIZAR MODO ONDAS CRUZADAS DESPUÃ‰S DEL REGISTRO
            if (window.modoOndasCruzadas && typeof window.modoOndasCruzadas.init === 'function') {
                try {
                    await window.modoOndasCruzadas.init(window.uiCore);
                    console.log('🌊 Modo Ondas Cruzadas inicializado despuÃ©s del registro');
                } catch (e) {
                    console.warn('⚠️ Error inicializando Modo Ondas Cruzadas despuÃ©s del registro:', e);
                }
            }
            
            if (window.UIOndasCruzadas && typeof window.UIOndasCruzadas.init === 'function') {
                try {
                    await window.UIOndasCruzadas.init(window.uiCore);
                } catch (e) {}
            }
            
            if (window.UIClipse && typeof window.UIClipse.init === 'function') {
                try {
                    await window.UIClipse.init(window.uiCore);
                } catch (e) {}
            }
            
            setTimeout(async () => { await this._ejecutarVerificacionesGroq(); }, 5000);
            
            setTimeout(async () => {
                if (window.UIBackup) {
                    try { await window.UIBackup.verificarBackupAutomatico(true); } catch (e) {}
                }
            }, 5000);
            
            setTimeout(() => {
                this._actualizarUICompleta();
                const finalIdiomas = gestorIdiomas.getIdiomas();
                console.log('📊 Estado final de idiomas:', finalIdiomas.map(i => i.idioma + ' (' + i.nivel + ')'));
                if (window.vigiaGramatical) {
                    window.vigiaGramatical.initGramatical().then(() => {
                        console.log('✅ VigÃ­a Gramatical inicializado');
                    }).catch(e => {});
                }
                // 🌌 RECARGAR MÃ“DULO ELIPSE
                if (window.UIClipse) {
                    setTimeout(() => {
                        try {
                            window.UIClipse.cargar(window.uiCore);
                        } catch (e) {}
                    }, 1000);
                }
                // 🌊 RECARGAR MÃ“DULO ONDAS CRUZADAS
                if (window.UIOndasCruzadas) {
                    setTimeout(() => {
                        try {
                            window.UIOndasCruzadas.cargar(window.uiCore);
                        } catch (e) {}
                    }, 1200);
                }
            }, 500);

        } catch (error) {
            console.error('❌ Error en registro:', error);
            await this._showToast('❌ Error: ' + error.message, 'error');
        }
    }

    _obtenerSugerenciasIdiomas(texto) {
        if (!texto || texto.trim().length < 2) return [];
        
        const textoLower = texto.trim().toLowerCase();
        const sugerencias = [];
        const idiomasKeys = Object.keys(this._IDIOMAS_CONOCIDOS);
        
        for (const idioma of idiomasKeys) {
            const idiomaNormalizado = idioma.normalize('NFKC').toLowerCase();
            const similitud = this._calcularSimilitud(textoLower, idiomaNormalizado);
            if (similitud > 0.5 && similitud < 0.9) {
                const codigo = this._IDIOMAS_CONOCIDOS[idioma];
                const nombre = this._NOMBRES_IDIOMAS[codigo] || this._capitalizar(idioma);
                sugerencias.push(nombre);
            }
        }
        
        return sugerencias.slice(0, 3);
    }

    _getIdiomas() {
        const rows = document.querySelectorAll('.idioma-row');
        const idiomas = [];
        rows.forEach(row => {
            const input = row.querySelector('.idioma-input');
            const select = row.querySelector('.nivel-select');
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
            if (!usuario.idiomasObjetivo?.length) { console.warn('⚠️ No hay idiomas objetivo'); return false; }
            if (gestorIdiomas.idiomas.length === 0) { gestorIdiomas.idiomas = []; }
            for (const item of usuario.idiomasObjetivo) {
                const idioma = item.idioma;
                const nivel = item.nivel || 'B1';
                const existe = gestorIdiomas.idiomas.some(i => i.idioma === idioma);
                if (existe) continue;
                let stats = { totalFrases: 0, frasesCompletadas: 0, progreso: 0 };
                try {
                    const frases = await db.obtenerFrasesPorIdioma(idioma);
                    const progreso = await db.obtenerTodoProgreso();
                    let completadas = 0;
                    for (const f of frases) {
                        const p = progreso.find(pr => pr.fraseId === f.id);
                        if (p && (p.estado === 'completada' || p.rcn >= 4)) completadas++;
                    }
                    stats = {
                        totalFrases: frases.length,
                        frasesCompletadas: completadas,
                        progreso: frases.length > 0 ? Math.round((completadas / frases.length) * 100) : 0
                    };
                } catch (e) {}
                const historias = await db.obtenerHistoriasPorIdioma(idioma);
                const temas = await db.obtenerTemasPorIdioma(idioma);
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
                const saved = localStorage.getItem('pipeline_idioma_activo');
                if (saved && gestorIdiomas.idiomas.some(i => i.idioma === saved)) {
                    gestorIdiomas.idiomaActivo = saved;
                } else if (usuario.idiomaActivo && gestorIdiomas.idiomas.some(i => i.idioma === usuario.idiomaActivo)) {
                    gestorIdiomas.idiomaActivo = usuario.idiomaActivo;
                } else {
                    gestorIdiomas.idiomaActivo = usuario.idiomasObjetivo[0].idioma;
                }
                localStorage.setItem('pipeline_idioma_activo', gestorIdiomas.idiomaActivo);
            }
            console.log('✅ Idiomas cargados:', gestorIdiomas.idiomas.map(i => i.idioma));
            return true;
        } catch (e) {
            console.error('❌ Error forzando carga:', e);
            return false;
        }
    }

    async _iniciarModulosYUI(usuario) {
        console.log('🔄 Iniciando mÃ³dulos y UI...');
        if (usuario.idiomasObjetivo) {
            for (const item of usuario.idiomasObjetivo) {
                const existe = gestorIdiomas.idiomas.some(i => i.idioma === item.idioma);
                if (!existe) {
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
            }
            if (usuario.idiomasObjetivo.length > 0) {
                const saved = localStorage.getItem('pipeline_idioma_activo');
                if (saved && gestorIdiomas.idiomas.some(i => i.idioma === saved)) {
                    gestorIdiomas.idiomaActivo = saved;
                } else if (usuario.idiomaActivo && gestorIdiomas.idiomas.some(i => i.idioma === usuario.idiomaActivo)) {
                    gestorIdiomas.idiomaActivo = usuario.idiomaActivo;
                } else {
                    gestorIdiomas.idiomaActivo = usuario.idiomasObjetivo[0].idioma;
                }
                localStorage.setItem('pipeline_idioma_activo', gestorIdiomas.idiomaActivo);
            }
        }
        if (typeof window.uiCore !== 'undefined' && window.uiCore.init) {
            await window.uiCore.init();
        }
        await this._initModules();
        if (pipeline) {
            const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
            await pipeline.cargarFrasesPorIdioma(idiomaActivo);
            await pipeline.cargarProgreso();
        }
        if (window.vigiaGramatical) {
            try { await window.vigiaGramatical.initGramatical(); } catch (e) {}
        }
        if (window.LearningPath && typeof window.LearningPath.init === 'function') {
            try { await window.LearningPath.init(window.uiCore); } catch (e) {}
        }
        if (window.tutorNeuro && typeof window.tutorNeuro.initTutor === 'function') {
            try { await window.tutorNeuro.initTutor(); } catch (e) {}
        }
        // 🌌 INICIALIZAR MODO ELIPSE
        if (window.modoElipse && typeof window.modoElipse.init === 'function') {
            try {
                await window.modoElipse.init(window.uiCore);
                if (typeof window.modoElipse.cargarDatos === 'function') {
                    await window.modoElipse.cargarDatos();
                }
                console.log('🌌 Modo Elipse inicializado en _iniciarModulosYUI');
            } catch (e) {
                console.warn('⚠️ Error inicializando Modo Elipse:', e);
            }
        }
        // 🌊 INICIALIZAR MODO ONDAS CRUZADAS
        if (window.modoOndasCruzadas && typeof window.modoOndasCruzadas.init === 'function') {
            try {
                await window.modoOndasCruzadas.init(window.uiCore);
                console.log('🌊 Modo Ondas Cruzadas inicializado en _iniciarModulosYUI');
            } catch (e) {
                console.warn('⚠️ Error inicializando Modo Ondas Cruzadas:', e);
            }
        }
        if (window.UIOndasCruzadas && typeof window.UIOndasCruzadas.init === 'function') {
            try {
                await window.UIOndasCruzadas.init(window.uiCore);
            } catch (e) {}
        }
        if (window.UIClipse && typeof window.UIClipse.init === 'function') {
            try {
                await window.UIClipse.init(window.uiCore);
            } catch (e) {}
        }
    }

    async _initModules() {
        console.log('🔄 Inicializando mÃ³dulos...');
        try { await pipeline.init(); console.log('✅ Pipeline iniciado'); } catch (e) { console.warn('⚠️ Pipeline fallÃ³:', e); }
        try { await gramatica.init(); console.log('✅ GramÃ¡tica iniciada'); } catch (e) { console.warn('⚠️ GramÃ¡tica fallÃ³:', e); }
        try { await vigia.init(); console.log('✅ VigÃ­a iniciado'); } catch (e) { console.warn('⚠️ VigÃ­a fallÃ³:', e); }
        try { await centinela.init(); console.log('✅ Centinela iniciado'); } catch (e) { console.warn('⚠️ Centinela fallÃ³:', e); }
        try { await gestorNiveles.init(); console.log('✅ Gestor de Niveles iniciado'); } catch (e) { console.warn('⚠️ Gestor de Niveles fallÃ³:', e); }
        
        // 🌌 INICIALIZAR MODO ELIPSE - CON CARGA DE DATOS
        try {
            if (window.modoElipse && typeof window.modoElipse.init === 'function') {
                await window.modoElipse.init(window.uiCore);
                console.log('🌌 Modo Elipse inicializado');
                
                if (typeof window.modoElipse.cargarDatos === 'function') {
                    const datos = await window.modoElipse.cargarDatos();
                    console.log(`🌌 Datos del Modo Elipse cargados: ${datos.length} ondas`);
                }
            }
        } catch (e) { 
            console.warn('⚠️ Modo Elipse fallÃ³:', e); 
        }
        
        // 🌊 INICIALIZAR MODO ONDAS CRUZADAS - CON CARGA DE DATOS
        try {
            if (window.modoOndasCruzadas && typeof window.modoOndasCruzadas.init === 'function') {
                await window.modoOndasCruzadas.init(window.uiCore);
                console.log('🌊 Modo Ondas Cruzadas inicializado');
                
                if (typeof window.modoOndasCruzadas._cargarDatos === 'function') {
                    await window.modoOndasCruzadas._cargarDatos();
                }
            }
        } catch (e) { 
            console.warn('⚠️ Modo Ondas Cruzadas fallÃ³:', e); 
        }
        
        // Inicializar UI Elipse
        try {
            if (window.UIClipse && typeof window.UIClipse.init === 'function') {
                await window.UIClipse.init(window.uiCore);
                console.log('🌌 UI Elipse inicializada');
            }
        } catch (e) {
            console.warn('⚠️ UI Elipse fallÃ³:', e);
        }
        
        // Inicializar UI Ondas Cruzadas
        try {
            if (window.UIOndasCruzadas && typeof window.UIOndasCruzadas.init === 'function') {
                await window.UIOndasCruzadas.init(window.uiCore);
                console.log('🌊 UI Ondas Cruzadas inicializada');
            }
        } catch (e) {
            console.warn('⚠️ UI Ondas Cruzadas fallÃ³:', e);
        }
        
        if (window.balanceadorGroq && !window.balanceadorGroq._initDone) {
            try { await window.balanceadorGroq.init(); } catch (e) { console.warn('⚠️ Error inicializando balanceador:', e); }
        }
        console.log('✅ Todos los mÃ³dulos inicializados (incluyendo Ondas Cruzadas)');
    }

    async _actualizarUICompleta() {
        try {
            const overlay = document.getElementById('cargaOverlay');
            if (overlay) overlay.remove();
            this._cargaOverlayMostrado = false;
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            if (window.uiCore && window.uiCore._actualizarIndicadoresSeguro) {
                window.uiCore._actualizarIndicadoresSeguro();
            }
            if (window.UIDashboard) {
                await window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }
            if (window.UIConfig && window.UIConfig._actualizarNivelHeader) {
                window.UIConfig._actualizarNivelHeader();
            }
            if (window.UIConfig && window.UIConfig._recargarConfiguracion) {
                await window.UIConfig._recargarConfiguracion();
            }
            if (window.UIGrammar) {
                if (window.vigiaGramatical && !window.vigiaGramatical._gramaticalInitDone) {
                    await window.vigiaGramatical.initGramatical();
                }
                window.UIGrammar._cargarGramatica();
            }
            if (window.UITemas) {
                window.UITemas._renderTemas();
            }
            if (window.UIEspacio) {
                await window.UIEspacio._renderizarMiEspacio();
            }
            if (window.UIStudy && window.UIStudy._renderizarFraseInteractiva) {
                window.UIStudy._renderizarFraseInteractiva();
            }
            if (window.UICaracteres && window.UICaracteres.estaDisponible()) {
                try { await window.UICaracteres.cargar(window.uiCore); } catch (e) {}
            }
            if (window.UIDashboard) {
                await window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }
            if (window.tutorNeuro && window.tutorNeuro._recomendarSiguienteTema) {
                setTimeout(() => { try { window.tutorNeuro._recomendarSiguienteTema(); } catch (e) {} }, 2000);
            }
            if (window.uiCore && window.uiCore._actualizarIndicadorBalanceador) {
                window.uiCore._actualizarIndicadorBalanceador();
            }
            // 🌌 RECARGAR MÃ“DULO ELIPSE
            if (window.UIClipse) {
                try {
                    await window.UIClipse.cargar(window.uiCore);
                } catch (e) {}
            }
            // 🌊 RECARGAR MÃ“DULO ONDAS CRUZADAS
            if (window.UIOndasCruzadas) {
                try {
                    await window.UIOndasCruzadas.cargar(window.uiCore);
                } catch (e) {}
            }
        } catch (e) { console.warn('⚠️ Error actualizando UI:', e); }
    }

    async _loadDashboard() {
        try {
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            let stats = { totalFrases: 0, totalPalabras: 0, progreso: 0, neuroScore: 0 };
            if (this._dbReady && db && db.db) {
                try {
                    stats = await db.obtenerEstadisticasNeuro(idiomaActivo);
                } catch (e) {}
            }
            if (window.UIDashboard) {
                window.UIDashboard._actualizarTarjetaStudy(stats);
                window.UIDashboard._actualizarTarjetaGrammar(stats);
                window.UIDashboard._actualizarTarjetaVigia();
            }
            if (window.uiCore && window.uiCore._actualizarIndicadoresSeguro) {
                window.uiCore._actualizarIndicadoresSeguro();
            }
        } catch (error) { console.warn('⚠️ Error cargando dashboard:', error); }
    }

    async _mostrarBienvenida(usuario) {
        console.log('🎉 Mostrando bienvenida para:', usuario.nombre);
        let mensajeMotivador = '🌟 Â¡Comienza tu viaje de aprendizaje!';
        try {
            if (vigia && vigia.enLinea) {
                const prompt = `
                    Eres un asistente motivacional. El usuario ${usuario.nombre} acaba de registrarse.
                    Idiomas: ${usuario.idiomasObjetivo.map(i => i.idioma + ' (' + i.nivel + ')').join(', ')}
                    Genera un mensaje motivador corto (mÃ¡x 30 palabras).
                `;
                const respuesta = await vigia._consultarGroq(prompt, 'text');
                if (respuesta && respuesta.length > 5) mensajeMotivador = respuesta.trim();
            }
        } catch (e) {}
        const overlay = document.createElement('div');
        overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);backdrop-filter:blur(10px);z-index:99999;display:flex;justify-content:center;align-items:center;animation:fadeIn 0.5s ease;`;
        overlay.innerHTML = `
            <div style="background:#fff;border-radius:24px;padding:40px 32px;max-width:420px;width:92%;text-align:center;animation:scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 30px 80px rgba(0,0,0,0.35);">
                <div style="font-size:72px;margin-bottom:16px;">🎉</div>
                <h2 style="font-size:28px;font-weight:800;background:linear-gradient(135deg,#6C5CE7,#00CEC9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;">Â¡Bienvenido, ${usuario.nombre}!</h2>
                <p style="font-size:16px;color:#636E72;margin-bottom:16px;">${mensajeMotivador}</p>
                <button onclick="this.closest('div[style]').parentElement.remove()" style="width:100%;padding:14px;background:linear-gradient(135deg,#6C5CE7,#00CEC9);color:white;border:none;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;">🚀 Â¡Comenzar!</button>
            </div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 8000);
        return new Promise(resolve => {
            const checkModal = setInterval(() => {
                if (!document.body.contains(overlay)) { clearInterval(checkModal); resolve(); }
            }, 200);
        });
    }

    _showToast(mensaje, tipo = 'info') {
        return new Promise((resolve) => {
            if (window.uiCore && window.uiCore.mostrarToast) {
                window.uiCore.mostrarToast(mensaje, tipo);
                resolve();
            } else { alert(mensaje); resolve(); }
        });
    }

    _showConfirm(mensaje, titulo) {
        return new Promise((resolve) => {
            if (window.uiCore && window.uiCore.confirm) {
                window.uiCore.confirm(mensaje, titulo).then(resolve);
            } else { resolve(confirm(mensaje)); }
        });
    }

    _showError(error) {
        console.error('❌ Mostrando error:', error);
        if (typeof window.uiCore !== 'undefined' && window.uiCore.mostrarToast) {
            window.uiCore.mostrarToast('❌ Error: ' + (error.message || 'Error desconocido'), 'error');
            return;
        }
        document.body.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;padding:20px;text-align:center;flex-direction:column;background:#f5f6fa;font-family:sans-serif;">
                <div style="font-size:64px;margin-bottom:16px;">❌</div>
                <h1 style="font-size:24px;color:#FF7675;margin-bottom:8px;">Error al iniciar</h1>
                <p style="color:#636E72;max-width:400px;">${error.message || 'Error desconocido'}</p>
                <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
                    <button onclick="location.reload()" style="padding:12px 24px;background:#6C5CE7;color:#fff;border:none;border-radius:12px;font-size:16px;cursor:pointer;">🔄 Reintentar</button>
                    <button onclick="localStorage.clear();location.reload();" style="padding:12px 24px;background:#FF7675;color:#fff;border:none;border-radius:12px;font-size:16px;cursor:pointer;">🗑️ Limpiar localStorage</button>
                </div>
                <div style="margin-top:16px;font-size:12px;color:var(--gray-light);">Si el problema persiste, abre la consola (F12) y revisa los errores.</div>
            </div>
        `;
    }

    _setupOrientationHandler() {
        let timeout = null;
        const handle = () => {
            if (this._initDone) return;
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                const usuario = this._getUsuarioLocalStorage();
                if (usuario) {
                    const mainScreen = document.getElementById('mainScreen');
                    const registroScreen = document.getElementById('registroScreen');
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
}

document.addEventListener('DOMContentLoaded', () => {
    if (window._appInitialized) return;
    window._appInitialized = true;
    console.log('🚀 Iniciando App v22.7 con persistencia asegurada y Ondas Cruzadas...');
    if (typeof db === 'undefined') {
        console.error('❌ Database no definida');
        document.body.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;padding:20px;text-align:center;flex-direction:column;background:#f5f6fa;font-family:sans-serif;">
                <div style="font-size:64px;margin-bottom:16px;">⚠️</div>
                <h1 style="font-size:24px;color:#FF7675;margin-bottom:8px;">Error de Carga</h1>
                <p style="color:#636E72;max-width:400px;">No se pudo cargar el mÃ³dulo de base de datos.</p>
                <button onclick="location.reload()" style="margin-top:20px;padding:12px 24px;background:#6C5CE7;color:#fff;border:none;border-radius:12px;font-size:16px;cursor:pointer;">🔄 Reintentar</button>
            </div>
        `;
        return;
    }
    window.app = new App();
    window.app.init();
});

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

console.log('✅ App v22.7 - DEFINITIVA CON PERSISTENCIA ASEGURADA Y ONDAS CRUZADAS');
console.log('  🌌 InicializaciÃ³n del Modo Elipse con carga de datos');
console.log('  🌊 InicializaciÃ³n del Modo Ondas Cruzadas');
console.log('  🔥 Carga de datos desde localStorage e IndexedDB');
console.log('  🔥 RecuperaciÃ³n automÃ¡tica al iniciar');
console.log('  🔥 Eventos de persistencia: beforeunload, visibilitychange');
console.log('  🔥 Guardado automÃ¡tico cada 3 segundos');
console.log('  🔥 Eventos de sincronizaciÃ³n entre Elipse y Ondas Cruzadas');
console.log('  ✅ SincronizaciÃ³n automÃ¡tica de Ondas Cruzadas al cambiar de idioma');
console.log('  ✅ EstadÃ­sticas en tiempo real en Ondas Cruzadas');
console.log('  ✅ Todas las funcionalidades originales preservadas');