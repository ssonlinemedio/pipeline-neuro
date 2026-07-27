// ============================================================
// APP v20.1 - CON ACTUALIZACIÓN DE VERSIONES VÍA GROQ
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
        
        this._idiomasComunes = [
            'español', 'espanol', 'castellano',
            'inglés', 'ingles', 'english',
            'chino', 'mandarín', 'mandarin', 'chinese',
            'japonés', 'japones', 'japanese',
            'coreano', 'korean',
            'francés', 'frances', 'french',
            'alemán', 'aleman', 'german',
            'italiano', 'italian',
            'portugués', 'portugues', 'portuguese',
            'ruso', 'russian',
            'árabe', 'arabe', 'arabic',
            'hindi', 'urdu', 'persa', 'turco', 'vietnamita', 'tailandés',
            'griego', 'greek', 'hebreo', 'hebrew', 'polaco', 'polish',
            'ucraniano', 'ukrainian', 'rumano', 'romanian', 'holandés', 'dutch',
            'sueco', 'swedish', 'noruego', 'norwegian', 'danés', 'danish',
            'finlandés', 'finnish', 'irlandés', 'irish', 'galés', 'welsh'
        ];
    }

    async init() {
        if (this._iniciando || this._initDone) return;
        this._iniciando = true;

        try {
            console.log('🧠 Iniciando Pipeline v20.1...');

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
                console.error('❌ Error crítico inicializando DB:', dbError);
                this._dbReady = false;
                this._dbInicializada = false;
            }
            this._esperandoDB = false;

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
                            console.log(`📍 Idioma activo persistido en DB: ${idiomaActivoPersistido}`);
                        }
                        
                        this._saveUsuarioLocalStorage(usuario);
                    }
                    
                    try {
                        apiKey = await db.obtenerApiKey();
                        if (apiKey) {
                            localStorage.setItem('pipeline_api_key', apiKey);
                        }
                    } catch (e) {
                        console.warn('⚠️ Error obteniendo API Key de IndexedDB:', e);
                    }
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
                            if (localApiKey) {
                                await db.guardarApiKey(localApiKey);
                            }
                            console.log('💾 Datos migrados de localStorage a IndexedDB');
                        } catch (e) {
                            console.warn('⚠️ Error migrando datos a IndexedDB:', e);
                        }
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
                        } else {
                            console.warn(`⚠️ Idioma persistido "${idiomaActivoPersistido}" no existe`);
                            if (usuario.idiomasObjetivo.length > 0) {
                                await gestorIdiomas.cambiarIdioma(usuario.idiomasObjetivo[0].idioma);
                            }
                        }
                    } else if (usuario.idiomasObjetivo.length > 0) {
                        const primerIdioma = usuario.idiomasObjetivo[0].idioma;
                        console.log(`📍 Usando primer idioma como activo: ${primerIdioma}`);
                        await gestorIdiomas.cambiarIdioma(primerIdioma);
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
                        console.log('✅ Módulo de Caracteres inicializado');
                    } catch (e) {
                        console.warn('⚠️ Error inicializando módulo de caracteres:', e);
                    }
                }
                
                if (window.LearningPath && typeof window.LearningPath.init === 'function') {
                    try {
                        await window.LearningPath.init(window.uiCore);
                        console.log('🧭 Learning Path inicializado');
                    } catch (e) {
                        console.warn('⚠️ Error inicializando Learning Path:', e);
                    }
                }
                
                if (window.tutorNeuro && typeof window.tutorNeuro.initTutor === 'function') {
                    try {
                        await window.tutorNeuro.initTutor();
                        console.log('🧠 Tutor Neuro inicializado');
                    } catch (e) {
                        console.warn('⚠️ Error inicializando Tutor Neuro:', e);
                    }
                }
                
                // 🔥 ACTUALIZAR VERSIONES EN BACKGROUND
                if (window.vigia && window.vigia.enLinea && window.gestorIdiomas) {
                    setTimeout(async () => {
                        try {
                            console.log('🔍 Verificando últimas versiones de idiomas en background...');
                            const resultados = await window.gestorIdiomas.actualizarTodasLasVersiones(false);
                            if (resultados && resultados.length > 0) {
                                const exitos = resultados.filter(r => r.exito).length;
                                if (exitos > 0) {
                                    console.log(`✅ ${exitos} idiomas actualizados a la última versión`);
                                    if (window.uiCore) {
                                        window.uiCore.mostrarToast(`🔄 ${exitos} idioma(s) actualizado(s) a la última versión`, 'success');
                                    }
                                    // Recargar temas si hay actualizaciones
                                    if (window.UITemas) {
                                        setTimeout(() => {
                                            window.UITemas._renderTemas();
                                        }, 500);
                                    }
                                }
                            }
                        } catch (e) {
                            console.warn('⚠️ Error verificando versiones en background:', e);
                        }
                    }, 5000);
                }
                
                setTimeout(async () => {
                    if (window.UIBackup) {
                        console.log('🤖 Verificando backup automático al inicio...');
                        try {
                            await window.UIBackup.verificarBackupAutomatico(true);
                        } catch (e) {
                            console.warn('⚠️ Error en backup automático al inicio:', e);
                        }
                    }
                }, 5000);
                
                setTimeout(async () => {
                    try {
                        if (window.LearningPath) {
                            await window.LearningPath.generarRuta();
                            console.log('🧭 Ruta de aprendizaje generada automáticamente');
                        }
                    } catch (e) {
                        console.warn('⚠️ Error generando ruta inicial:', e);
                    }
                }, 3000);
                
                setTimeout(() => {
                    if (window.tutorNeuro && window.tutorNeuro._recomendarSiguienteTema) {
                        try {
                            window.tutorNeuro._recomendarSiguienteTema();
                            console.log('🧠 Tutor Neuro: Recomendación inicial generada');
                        } catch (e) {
                            console.warn('⚠️ Error en recomendación inicial del tutor:', e);
                        }
                    }
                }, 4000);
                
                setTimeout(() => {
                    this._actualizarUICompleta();
                    this._datosCargados = true;
                    this._cargaCompletada = true;
                    this._ocultarPantallaCarga();
                }, 500);
                
                this.inicializada = true;
                this._initDone = true;
                console.log('✅ App iniciada correctamente con datos cargados');
                return;
            }

            console.log('👤 No hay usuario, mostrando registro');
            this._ocultarPantallaCarga();
            this._showRegisterScreen();

        } catch (error) {
            console.error('❌ Error crítico en init:', error);
            
            const localUser = this._getUsuarioLocalStorage();
            if (localUser && localUser.nombre) {
                console.log('🔄 Recuperación de emergencia con localStorage');
                try {
                    await this._iniciarConLocalStorage(localUser);
                    return;
                } catch (e) {
                    console.error('❌ Falla la recuperación de emergencia:', e);
                }
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

    // ============================================================
    // REGISTRAR EVENTOS GLOBALES
    // ============================================================

    _registrarEventosGlobales() {
        if (this._eventosGlobalesRegistrados) return;
        this._eventosGlobalesRegistrados = true;
        
        console.log('🔗 Registrando eventos globales...');
        
        // 🔥 NUEVO: Escuchar actualización de versiones
        window.addEventListener('versionIdiomaActualizada', (e) => {
            const detail = e.detail || {};
            console.log(`📢 App: Versión actualizada para "${detail.idioma}" → ${detail.nombreVersion || detail.versionNueva}`);
            
            // Recargar temas y configuración
            if (window.UITemas) {
                setTimeout(() => {
                    window.UITemas._renderTemas();
                }, 300);
            }
            if (window.UIConfig && window.UIConfig._recargarConfiguracion) {
                setTimeout(() => {
                    window.UIConfig._recargarConfiguracion();
                }, 500);
            }
        });
        
        window.addEventListener('idiomaCambiado', async (e) => {
            const idioma = e.detail?.idioma;
            console.log(`📢 App recibió idiomaCambiado: ${idioma}`);
            
            // 🔥 NUEVO: Limpiar cachés de temas al cambiar de idioma
            if (window.UITemas) {
                window.UITemas._temaCompletadoCache = {};
                window.UITemas._nivelDesbloqueadoCache = {};
                window.UITemas._temasCompletadosPorIdioma = {};
                console.log('🧹 Cachés de temas limpiadas al cambiar de idioma');
            }
            
            await this._actualizarUICompleta();
            this._guardarDatosCriticos();
            
            if (window.vigiaGramatical) {
                try {
                    await window.vigiaGramatical.initGramatical();
                    await window.vigiaGramatical._actualizarEdadGramatical(idioma);
                    console.log(`📚 Vigía Gramatical actualizado para ${idioma}`);
                } catch (e) {
                    console.warn('⚠️ Error actualizando Vigía Gramatical:', e);
                }
            }
            
            if (window.UICaracteres && window.UICaracteres.estaDisponible()) {
                try {
                    await window.UICaracteres.cargar(window.uiCore);
                    console.log('🀄 Módulo de Caracteres actualizado');
                } catch (e) {
                    console.warn('⚠️ Error actualizando módulo de caracteres:', e);
                }
            }
            
            if (window.LearningPath) {
                setTimeout(async () => {
                    try {
                        await window.LearningPath.generarRuta(true);
                        console.log(`🧭 Ruta regenerada para ${idioma}`);
                    } catch (e) {
                        console.warn('⚠️ Error regenerando ruta:', e);
                    }
                }, 2000);
            }
            
            if (window.tutorNeuro && window.tutorNeuro._recomendarSiguienteTema) {
                setTimeout(() => {
                    try {
                        window.tutorNeuro._recomendarSiguienteTema();
                        console.log(`🧠 Tutor Neuro: Recomendación para ${idioma}`);
                    } catch (e) {
                        console.warn('⚠️ Error en recomendación del tutor:', e);
                    }
                }, 3000);
            }
            
            // Recargar temas al cambiar de idioma
            if (window.UITemas) {
                setTimeout(() => {
                    window.UITemas._renderTemas();
                }, 300);
            }
        });
        
        window.addEventListener('modoInversoChange', async (e) => {
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
                        console.log('🧭 Ruta regenerada por cambio de nivel');
                    } catch (e) {
                        console.warn('⚠️ Error regenerando ruta:', e);
                    }
                }, 2000);
            }
            
            if (window.tutorNeuro && window.tutorNeuro._recomendarSiguienteTema) {
                setTimeout(() => {
                    try {
                        window.tutorNeuro._recomendarSiguienteTema();
                        console.log('🧠 Tutor Neuro: Recomendación por cambio de nivel');
                    } catch (e) {
                        console.warn('⚠️ Error en recomendación del tutor:', e);
                    }
                }, 3000);
            }
            
            // Recargar temas al cambiar de nivel
            if (window.UITemas) {
                setTimeout(() => {
                    window.UITemas._renderTemas();
                }, 300);
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
                        console.log('🧠 Tutor Neuro: Mapa reconstruido por nuevo idioma');
                    } catch (e) {
                        console.warn('⚠️ Error reconstruyendo mapa del tutor:', e);
                    }
                }, 2000);
            }
            
            // Recargar temas al agregar idioma
            if (window.UITemas) {
                setTimeout(() => {
                    window.UITemas._renderTemas();
                }, 300);
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
                        console.log('🧠 Tutor Neuro: Mapa reconstruido por idioma eliminado');
                    } catch (e) {
                        console.warn('⚠️ Error reconstruyendo mapa del tutor:', e);
                    }
                }, 2000);
            }
        });
        
        window.addEventListener('vigiaGramaticalActualizado', (e) => {
            if (window.UIGrammar) {
                window.UIGrammar._cargarGramatica();
            }
        });
        
        window.addEventListener('familiaCaracteresGenerada', (e) => {
            console.log('🀄 Familia de caracteres generada:', e.detail);
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }
            if (window.UICaracteres) {
                window.UICaracteres.cargar(window.uiCore);
            }
        });
        
        console.log('✅ Eventos globales registrados');
    }

    // ============================================================
    // MÉTODOS PRIVADOS (MANTENIDOS - SIN CAMBIOS)
    // ============================================================

    async _inicializarDBConReintentos() {
        return new Promise((resolve, reject) => {
            let intentos = 0;
            
            const intentarInicializar = async () => {
                try {
                    if (typeof db === 'undefined' || !db) {
                        throw new Error('Database no definida');
                    }
                    
                    await db.init();
                    
                    if (db.db && db.db.name === 'PipelineDB') {
                        console.log(`✅ Database inicializada en intento ${intentos + 1}`);
                        resolve();
                        return;
                    }
                    
                    throw new Error('Database no está completamente inicializada');
                    
                } catch (e) {
                    intentos++;
                    if (intentos >= this._maxIntentosDB) {
                        reject(new Error(`No se pudo inicializar IndexedDB después de ${intentos} intentos: ${e.message}`));
                    } else {
                        console.log(`⏳ Esperando IndexedDB... intento ${intentos}/${this._maxIntentosDB}`);
                        const tiempoEspera = Math.min(1000, 200 * intentos);
                        setTimeout(intentarInicializar, tiempoEspera);
                    }
                }
            };
            
            intentarInicializar();
        });
    }

    _mostrarPantallaCarga(mensaje = 'Cargando...') {
        if (this._cargaOverlayMostrado) return;
        this._cargaOverlayMostrado = true;
        
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
                <div style="margin-top:8px;font-size:12px;color:var(--gray-light);" id="cargaStatus">Inicializando sistema...</div>
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
        
        setTimeout(() => {
            const status = document.getElementById('cargaStatus');
            if (status) status.textContent = 'Cargando datos de usuario...';
        }, 1000);
        
        setTimeout(() => {
            const status = document.getElementById('cargaStatus');
            if (status) status.textContent = 'Preparando módulos...';
        }, 2000);
    }

    _ocultarPantallaCarga() {
        const overlay = document.getElementById('cargaOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) overlay.remove();
            }, 500);
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
                try {
                    await window.LearningPath.init(window.uiCore);
                    console.log('🧭 Learning Path inicializado');
                } catch (e) {
                    console.warn('⚠️ Error inicializando Learning Path:', e);
                }
            }
            
            if (window.tutorNeuro && typeof window.tutorNeuro.initTutor === 'function') {
                try {
                    await window.tutorNeuro.initTutor();
                    console.log('🧠 Tutor Neuro inicializado (emergencia)');
                } catch (e) {
                    console.warn('⚠️ Error inicializando Tutor Neuro:', e);
                }
            }
            
            setTimeout(async () => {
                if (window.UIBackup) {
                    console.log('🤖 Verificando backup automático al inicio...');
                    try {
                        await window.UIBackup.verificarBackupAutomatico(true);
                    } catch (e) {
                        console.warn('⚠️ Error en backup automático al inicio:', e);
                    }
                }
            }, 5000);
            
            setTimeout(async () => {
                try {
                    if (window.LearningPath) {
                        await window.LearningPath.generarRuta();
                        console.log('🧭 Ruta de aprendizaje generada');
                    }
                } catch (e) {
                    console.warn('⚠️ Error generando ruta inicial:', e);
                }
            }, 3000);
            
            setTimeout(() => {
                if (window.tutorNeuro && window.tutorNeuro._recomendarSiguienteTema) {
                    try {
                        window.tutorNeuro._recomendarSiguienteTema();
                        console.log('🧠 Tutor Neuro: Recomendación inicial (emergencia)');
                    } catch (e) {
                        console.warn('⚠️ Error en recomendación inicial del tutor:', e);
                    }
                }
            }, 4000);
            
            setTimeout(() => {
                this._actualizarUICompleta();
                this._datosCargados = true;
                this._cargaCompletada = true;
                this._ocultarPantallaCarga();
            }, 500);
            
            this.inicializada = true;
            this._initDone = true;
            console.log('✅ App iniciada en modo localStorage');
            
        } catch (e) {
            console.error('❌ Error iniciando en modo localStorage:', e);
            this._ocultarPantallaCarga();
            this._showError(e);
        }
    }

    _setupPersistenciaCritica() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this._guardarDatosCriticos();
                if (window.UIBackup) {
                    console.log('💾 Ejecutando backup automático al cerrar sesión...');
                    window.UIBackup._generarBackupLocal(true).catch(() => {});
                }
            }
        });

        window.addEventListener('beforeunload', () => {
            this._guardarDatosCriticos();
            if (window.UIBackup) {
                console.log('💾 Ejecutando backup automático antes de cerrar...');
                window.UIBackup._generarBackupLocal(true).catch(() => {});
            }
        });

        setInterval(() => {
            this._guardarDatosCriticos();
        }, 15000);
    }

    async _guardarDatosCriticos() {
        if (this._guardandoDatos) return;
        this._guardandoDatos = true;
        
        try {
            const usuario = this._getUsuarioLocalStorage();
            if (!usuario) {
                this._guardandoDatos = false;
                return;
            }

            const idiomaActivo = gestorIdiomas?.getIdiomaActivo?.() || localStorage.getItem('pipeline_idioma_activo');
            if (idiomaActivo) {
                usuario.idiomaActivo = idiomaActivo;
            }

            if (this._dbReady && db) {
                try {
                    await db.guardarUsuario(usuario);
                    const apiKey = localStorage.getItem('pipeline_api_key');
                    if (apiKey) await db.guardarApiKey(apiKey);
                } catch (e) {
                    console.warn('⚠️ Error guardando en IndexedDB:', e);
                }
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
                } catch (e) {
                    console.warn('⚠️ Error guardando favoritos:', e);
                }
            }

        } catch (e) {
            console.warn('⚠️ Error guardando datos críticos:', e);
        } finally {
            this._guardandoDatos = false;
        }
    }

    _getUsuarioLocalStorage() {
        try {
            const data = localStorage.getItem('pipeline_usuario');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed && parsed.nombre) {
                    if (parsed.idiomasObjetivo && Array.isArray(parsed.idiomasObjetivo) && parsed.idiomasObjetivo.length > 0) {
                        return parsed;
                    } else {
                        console.warn('⚠️ Usuario en localStorage sin idiomas válidos');
                        return null;
                    }
                }
            }
            return null;
        } catch (e) {
            console.warn('⚠️ Error leyendo localStorage:', e);
            return null;
        }
    }

    _saveUsuarioLocalStorage(usuario) {
        try {
            if (!usuario || !usuario.nombre) return false;
            localStorage.setItem('pipeline_usuario', JSON.stringify(usuario));
            return true;
        } catch (e) {
            console.warn('⚠️ Error guardando en localStorage:', e);
            return false;
        }
    }

    _showMainScreen(usuario) {
        const registroScreen = document.getElementById('registroScreen');
        const mainScreen = document.getElementById('mainScreen');
        
        if (registroScreen) {
            registroScreen.style.display = 'none';
            registroScreen.classList.remove('active');
        }
        
        if (mainScreen) {
            mainScreen.style.display = 'block';
            mainScreen.classList.add('active');
            mainScreen.scrollTop = 0;
        }

        const userName = document.getElementById('userName');
        if (userName) userName.textContent = usuario.nombre;

        const dashUser = document.getElementById('dashUserName');
        if (dashUser) dashUser.textContent = usuario.nombre;

        setTimeout(() => {
            this._loadDashboard();
        }, 300);

        console.log('✅ Dashboard mostrado');
    }

    _showRegisterScreen() {
        const registroScreen = document.getElementById('registroScreen');
        const mainScreen = document.getElementById('mainScreen');
        
        if (registroScreen) {
            registroScreen.style.display = 'flex';
            registroScreen.classList.add('active');
        }
        if (mainScreen) {
            mainScreen.style.display = 'none';
            mainScreen.classList.remove('active');
        }

        this._setupRegisterForm();
        console.log('📝 Pantalla de registro mostrada');
    }

    _setupRegisterForm() {
        const form = document.getElementById('registroForm');
        if (!form) {
            console.warn('⚠️ Formulario de registro no encontrado');
            return;
        }

        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (this._registrando) {
                console.log('⏳ Registro en proceso, espera...');
                return;
            }
            
            this._registrando = true;
            
            try {
                await this._handleRegister(e);
            } catch (error) {
                console.error('❌ Error en registro:', error);
                this._showError(error);
            } finally {
                this._registrando = false;
            }
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
                nombre, 
                idiomaNativo, 
                idiomas: idiomas.map(i => i.idioma + ' (' + i.nivel + ')'),
                apiKey: apiKey ? '***' : 'No' 
            });

            if (!nombre) {
                await this._showToast('❌ El nombre es obligatorio', 'error');
                return;
            }
            
            if (!idiomaNativo) {
                await this._showToast('❌ El idioma nativo es obligatorio', 'error');
                return;
            }
            
            if (idiomas.length === 0) {
                await this._showToast('❌ Debes añadir al menos un idioma objetivo', 'error');
                return;
            }

            if (!apiKey || !apiKey.startsWith('gsk_')) {
                await this._showToast('❌ API Key inválida. Debe comenzar con "gsk_"', 'error');
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

            const validacionNativo = await this._validarIdiomaConGroq(idiomaNativo, 'idioma_nativo');
            
            if (!validacionNativo.valido) {
                let mensaje = `❌ "${idiomaNativo}" no es un idioma válido.`;
                if (validacionNativo.sugerencia) {
                    mensaje += `\n\n💡 ¿Quisiste decir "${validacionNativo.sugerencia}"?`;
                }
                if (validacionNativo.mensaje) {
                    mensaje += `\n\n${validacionNativo.mensaje}`;
                }
                await this._showToast(mensaje, 'error');
                return;
            }
            
            if (validacionNativo.idiomaCorregido && validacionNativo.idiomaCorregido !== idiomaNativo) {
                const aceptar = await this._showConfirm(
                    `🔍 Sugerencia: "${idiomaNativo}" → **"${validacionNativo.idiomaCorregido}"**\n\n${validacionNativo.mensaje || ''}\n\n¿Usar "${validacionNativo.idiomaCorregido}"?`,
                    '✏️ Corrección de idioma'
                );
                if (aceptar) {
                    idiomaNativo = validacionNativo.idiomaCorregido;
                    if (idiomaNativoInput) idiomaNativoInput.value = idiomaNativo;
                } else {
                    return;
                }
            }

            const idiomasValidados = [];
            for (const item of idiomas) {
                const validacion = await this._validarIdiomaConGroq(item.idioma, 'idioma_objetivo');
                
                if (!validacion.valido) {
                    let mensaje = `❌ "${item.idioma}" no es un idioma válido.`;
                    if (validacion.sugerencia) {
                        mensaje += `\n\n💡 ¿Quisiste decir "${validacion.sugerencia}"?`;
                    }
                    if (validacion.mensaje) {
                        mensaje += `\n\n${validacion.mensaje}`;
                    }
                    await this._showToast(mensaje, 'error');
                    return;
                }
                
                let idiomaFinal = validacion.idiomaCorregido || item.idioma;
                
                if (idiomaFinal !== item.idioma) {
                    const aceptar = await this._showConfirm(
                        `🔍 Sugerencia: "${item.idioma}" → **"${idiomaFinal}"**\n\n${validacion.mensaje || ''}\n\n¿Usar "${idiomaFinal}"?`,
                        '✏️ Corrección de idioma'
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
                version: '20.1'
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

            const modoTutor = localStorage.getItem('pipeline_tutor_modo') || 'flexible';
            if (window.tutorNeuro) {
                try {
                    window.tutorNeuro.setModo(modoTutor);
                    console.log(`🧠 Modo Tutor configurado en registro: ${modoTutor}`);
                } catch (e) {
                    console.warn('⚠️ Error guardando modo del tutor:', e);
                }
            } else {
                localStorage.setItem('pipeline_tutor_modo', modoTutor);
                console.log(`💾 Modo Tutor guardado en localStorage: ${modoTutor}`);
            }

            console.log('✅ Registro completado para:', usuario.nombre);

            await new Promise(resolve => setTimeout(resolve, 300));
            await gestorIdiomas.init();
            
            let idiomasCargados = gestorIdiomas.getIdiomas();
            console.log('📊 Idiomas cargados después de init:', idiomasCargados.map(i => i.idioma));
            
            if (idiomasCargados.length === 0) {
                console.log('⚠️ No se cargaron idiomas, forzando desde localStorage...');
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
                try {
                    await window.LearningPath.init(window.uiCore);
                    console.log('🧭 Learning Path inicializado');
                } catch (e) {
                    console.warn('⚠️ Error inicializando Learning Path:', e);
                }
            }
            
            if (window.tutorNeuro && typeof window.tutorNeuro.initTutor === 'function') {
                try {
                    await window.tutorNeuro.initTutor();
                    console.log('🧠 Tutor Neuro inicializado');
                } catch (e) {
                    console.warn('⚠️ Error inicializando Tutor Neuro:', e);
                }
            }
            
            // 🔥 ACTUALIZAR VERSIONES EN BACKGROUND DESPUÉS DEL REGISTRO
            if (window.vigia && window.vigia.enLinea && window.gestorIdiomas) {
                setTimeout(async () => {
                    try {
                        console.log('🔍 Verificando últimas versiones de idiomas en background...');
                        const resultados = await window.gestorIdiomas.actualizarTodasLasVersiones(false);
                        if (resultados && resultados.length > 0) {
                            const exitos = resultados.filter(r => r.exito).length;
                            if (exitos > 0) {
                                console.log(`✅ ${exitos} idiomas actualizados a la última versión`);
                                if (window.uiCore) {
                                    window.uiCore.mostrarToast(`🔄 ${exitos} idioma(s) actualizado(s) a la última versión`, 'success');
                                }
                                if (window.UITemas) {
                                    setTimeout(() => {
                                        window.UITemas._renderTemas();
                                    }, 500);
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('⚠️ Error verificando versiones en background:', e);
                    }
                }, 3000);
            }
            
            setTimeout(async () => {
                if (window.UIBackup) {
                    console.log('🤖 Verificando backup automático al inicio...');
                    try {
                        await window.UIBackup.verificarBackupAutomatico(true);
                    } catch (e) {
                        console.warn('⚠️ Error en backup automático al inicio:', e);
                    }
                }
            }, 5000);
            
            setTimeout(async () => {
                try {
                    if (window.LearningPath) {
                        await window.LearningPath.generarRuta();
                        console.log('🧭 Ruta de aprendizaje generada');
                    }
                } catch (e) {
                    console.warn('⚠️ Error generando ruta inicial:', e);
                }
            }, 3000);
            
            setTimeout(() => {
                if (window.tutorNeuro && window.tutorNeuro._recomendarSiguienteTema) {
                    try {
                        window.tutorNeuro._recomendarSiguienteTema();
                        console.log('🧠 Tutor Neuro: Recomendación inicial generada');
                    } catch (e) {
                        console.warn('⚠️ Error en recomendación inicial del tutor:', e);
                    }
                }
            }, 4000);
            
            setTimeout(() => {
                this._actualizarUICompleta();
                
                const finalIdiomas = gestorIdiomas.getIdiomas();
                console.log('📊 Estado final de idiomas:', finalIdiomas.map(i => i.idioma + ' (' + i.nivel + ')'));
                if (finalIdiomas.length === 0) {
                    console.error('❌ CRÍTICO: No hay idiomas después del registro');
                } else {
                    console.log('✅ Registro completado con éxito. Idiomas:', finalIdiomas.map(i => i.idioma));
                }
                
                if (window.vigiaGramatical) {
                    window.vigiaGramatical.initGramatical().then(() => {
                        console.log('✅ Vigía Gramatical inicializado');
                    }).catch(e => {
                        console.warn('⚠️ Error inicializando Vigía Gramatical:', e);
                    });
                }
            }, 500);

        } catch (error) {
            console.error('❌ Error en registro:', error);
            await this._showToast('❌ Error: ' + error.message, 'error');
        }
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

    async _validarIdiomaConGroq(idiomaUsuario, contexto = '') {
        console.log(`🔍 Validando idioma con Groq: "${idiomaUsuario}" (${contexto})`);
        
        const textoLimpio = idiomaUsuario.trim();
        
        const esConocido = this._idiomasComunes.some(idioma => 
            textoLimpio.toLowerCase() === idioma || 
            textoLimpio.toLowerCase().includes(idioma) ||
            idioma.includes(textoLimpio.toLowerCase())
        );
        
        if (textoLimpio.length < 2 || /^[0-9]+$/.test(textoLimpio)) {
            return {
                valido: false,
                idiomaCorregido: null,
                mensaje: '❌ El idioma debe tener al menos 2 caracteres y no ser solo números.',
                sugerencia: null,
                nombreOriginal: null,
                nombreIngles: null,
                codigoISO: null,
                esJeroglifico: false
            };
        }
        
        if (esConocido) {
            console.log('✅ Idioma reconocido localmente:', textoLimpio);
            const esJeroglifico = ['chino', 'mandarín', 'mandarin', 'chinese', 'japonés', 'japones', 'japanese', 'coreano', 'korean'].some(
                i => textoLimpio.toLowerCase().includes(i) || i.includes(textoLimpio.toLowerCase())
            );
            return {
                valido: true,
                idiomaCorregido: textoLimpio,
                mensaje: '✅ Idioma reconocido.',
                nombreOriginal: textoLimpio,
                nombreIngles: textoLimpio,
                codigoISO: null,
                esJeroglifico: esJeroglifico,
                _local: true
            };
        }
        
        if (!vigia || !vigia.enLinea) {
            console.warn('⚠️ Vigía offline, validación básica - aceptando idioma con advertencia');
            return {
                valido: true,
                idiomaCorregido: textoLimpio,
                mensaje: '⚠️ Vigía offline, no se pudo validar el idioma.',
                nombreOriginal: textoLimpio,
                nombreIngles: textoLimpio,
                codigoISO: null,
                esJeroglifico: false,
                _advertencia: true
            };
        }
        
        try {
            const prompt = `
Eres un experto en lingüística y validación de idiomas.

El usuario ha escrito: "${idiomaUsuario}"
Contexto: ${contexto}

Tarea:
1. Determina si es un idioma REAL (no un nombre inventado)
2. Si es un error tipográfico, CORRÍGELO al idioma real más cercano
3. Si es un idioma válido pero con nombre diferente, devuélvelo en su forma estándar

Responde SOLO en formato JSON:
{
    "valido": true/false,
    "idiomaCorregido": "nombre_corregido_o_mismo",
    "nombreOriginal": "nombre_original_del_idioma_en_español",
    "nombreIngles": "nombre_del_idioma_en_inglés",
    "codigoISO": "código_iso_639_1_del_idioma (2 letras, ej: es, en, zh, ja)",
    "esJeroglifico": true/false,
    "mensaje": "mensaje_para_el_usuario",
    "sugerencia": "si_es_error_tipográfico_muestra_la_corrección"
}`;

            const respuesta = await vigia._consultarGroq(prompt, 'json');
            
            if (respuesta && respuesta.valido !== undefined) {
                console.log('✅ Validación Groq:', respuesta);
                return respuesta;
            }
            
            return {
                valido: true,
                idiomaCorregido: textoLimpio,
                mensaje: '⚠️ No se pudo validar correctamente, se acepta el idioma ingresado.',
                nombreOriginal: textoLimpio,
                nombreIngles: textoLimpio,
                codigoISO: null,
                esJeroglifico: false
            };
            
        } catch (error) {
            console.error('❌ Error validando idioma con Groq:', error);
            return {
                valido: true,
                idiomaCorregido: textoLimpio,
                mensaje: '⚠️ Error en validación, se acepta el idioma ingresado.',
                nombreOriginal: textoLimpio,
                nombreIngles: textoLimpio,
                codigoISO: null,
                esJeroglifico: false
            };
        }
    }

    async _forzarCargaIdiomas(usuario) {
        try {
            console.log('🔄 Forzando carga de idiomas para:', usuario.nombre);
            
            if (!usuario.idiomasObjetivo || usuario.idiomasObjetivo.length === 0) {
                console.warn('⚠️ No hay idiomas objetivo en el usuario');
                return false;
            }
            
            if (gestorIdiomas.idiomas.length === 0) {
                gestorIdiomas.idiomas = [];
            }
            
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
                        if (p && (p.estado === 'completada' || p.rcn >= 4)) {
                            completadas++;
                        }
                    }
                    stats = {
                        totalFrases: frases.length,
                        frasesCompletadas: completadas,
                        progreso: frases.length > 0 ? Math.round((completadas / frases.length) * 100) : 0
                    };
                } catch (e) {
                    console.warn(`⚠️ Error cargando estadísticas para ${idioma}:`, e);
                }
                
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
            console.log(`📍 Idioma activo: ${gestorIdiomas.idiomaActivo}`);
            return true;
        } catch (e) {
            console.error('❌ Error forzando carga de idiomas:', e);
            return false;
        }
    }

    async _iniciarModulosYUI(usuario) {
        console.log('🔄 Iniciando módulos y UI...');
        
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
            try {
                await window.vigiaGramatical.initGramatical();
                console.log('✅ Vigía Gramatical inicializado');
            } catch (e) {
                console.warn('⚠️ Error inicializando Vigía Gramatical:', e);
            }
        }
        
        if (window.LearningPath && typeof window.LearningPath.init === 'function') {
            try {
                await window.LearningPath.init(window.uiCore);
                console.log('🧭 Learning Path inicializado');
            } catch (e) {
                console.warn('⚠️ Error inicializando Learning Path:', e);
            }
        }
        
        if (window.tutorNeuro && typeof window.tutorNeuro.initTutor === 'function') {
            try {
                await window.tutorNeuro.initTutor();
                console.log('🧠 Tutor Neuro inicializado');
            } catch (e) {
                console.warn('⚠️ Error inicializando Tutor Neuro:', e);
            }
        }
    }

    async _initModules() {
        console.log('🔄 Inicializando módulos...');
        
        try {
            await pipeline.init();
            console.log('✅ Pipeline iniciado');
        } catch (e) {
            console.warn('⚠️ Pipeline falló:', e);
        }
        
        try {
            await gramatica.init();
            console.log('✅ Gramática iniciada');
        } catch (e) {
            console.warn('⚠️ Gramática falló:', e);
        }
        
        try {
            await vigia.init();
            console.log('✅ Vigía iniciado');
        } catch (e) {
            console.warn('⚠️ Vigía falló:', e);
        }
        
        try {
            await centinela.init();
            console.log('✅ Centinela iniciado');
        } catch (e) {
            console.warn('⚠️ Centinela falló:', e);
        }
        
        try {
            await gestorNiveles.init();
            console.log('✅ Gestor de Niveles iniciado');
        } catch (e) {
            console.warn('⚠️ Gestor de Niveles falló:', e);
        }
        
        console.log('✅ Todos los módulos inicializados');
    }

    async _actualizarUICompleta() {
        try {
            const overlay = document.getElementById('cargaOverlay');
            if (overlay) overlay.remove();
            this._cargaOverlayMostrado = false;
            
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            console.log(`🔄 Actualizando UI completa para idioma: ${idiomaActivo}`);
            
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
                try {
                    await window.UICaracteres.cargar(window.uiCore);
                } catch (e) {
                    console.warn('⚠️ Error actualizando módulo de caracteres:', e);
                }
            }
            
            if (window.UIDashboard) {
                await window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }
            
            if (window.tutorNeuro && window.tutorNeuro._recomendarSiguienteTema) {
                setTimeout(() => {
                    try {
                        window.tutorNeuro._recomendarSiguienteTema();
                    } catch (e) {
                        console.warn('⚠️ Error en recomendación del tutor:', e);
                    }
                }, 2000);
            }
            
            console.log(`✅ UI actualizada completamente para: ${idiomaActivo}`);
            
        } catch (e) {
            console.warn('⚠️ Error actualizando UI:', e);
        }
    }

    async _handleCambioIdioma(idioma) {
        console.log(`🌍 App: Cambiando a idioma "${idioma}"...`);
        
        try {
            const result = await gestorIdiomas.cambiarIdioma(idioma);
            if (!result) {
                console.warn(`⚠️ No se pudo cambiar a "${idioma}"`);
                return false;
            }
            
            window.dispatchEvent(new CustomEvent('idiomaCambiado', {
                detail: { 
                    idioma: idioma,
                    timestamp: Date.now()
                }
            }));
            
            await this._actualizarUICompleta();
            
            console.log(`✅ Idioma cambiado a "${idioma}" y UI actualizada`);
            return true;
            
        } catch (e) {
            console.error(`❌ Error cambiando a "${idioma}":`, e);
            return false;
        }
    }

    _setupOrientationHandler() {
        let timeout = null;
        
        const handleOrientationChange = () => {
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

        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);
    }

    async _loadDashboard() {
        try {
            console.log('📊 Cargando dashboard...');
            
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            let stats = { totalFrases: 0, totalPalabras: 0, progreso: 0, neuroScore: 0 };
            
            if (this._dbReady && db && db.db) {
                try {
                    stats = await db.obtenerEstadisticasNeuro(idiomaActivo);
                    console.log('✅ Estadísticas cargadas:', stats);
                } catch (e) {
                    console.warn('⚠️ Error cargando estadísticas:', e);
                }
            }

            if (window.UIDashboard) {
                window.UIDashboard._actualizarTarjetaStudy(stats);
                window.UIDashboard._actualizarTarjetaGrammar(stats);
                window.UIDashboard._actualizarTarjetaVigia();
            }
            
            if (window.uiCore && window.uiCore._actualizarIndicadoresSeguro) {
                window.uiCore._actualizarIndicadoresSeguro();
            }

            console.log('✅ Dashboard cargado');

        } catch (error) {
            console.warn('⚠️ Error cargando dashboard:', error);
        }
    }

    async _mostrarBienvenida(usuario) {
        console.log('🎉 Mostrando bienvenida para:', usuario.nombre);
        
        let mensajeMotivador = '🌟 ¡Comienza tu viaje de aprendizaje!';
        
        try {
            if (vigia && vigia.enLinea) {
                const prompt = `
                    Eres un asistente motivacional experto en aprendizaje de idiomas.
                    El usuario ${usuario.nombre} acaba de registrarse en Pipeline Neuro.
                    
                    Datos del usuario:
                    - Nombre: ${usuario.nombre}
                    - Idioma nativo: ${usuario.idiomaNativo}
                    - Idiomas a aprender: ${usuario.idiomasObjetivo.map(i => i.idioma + ' (Nivel ' + i.nivel + ')').join(', ')}
                    
                    Genera un mensaje motivador corto (máximo 30 palabras) y personalizado.
                `;
                
                const respuesta = await vigia._consultarGroq(prompt, 'text');
                if (respuesta && respuesta.length > 5) {
                    mensajeMotivador = respuesta.trim();
                }
            }
        } catch (error) {
            console.warn('⚠️ Error generando mensaje motivador:', error);
        }
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); backdrop-filter: blur(10px);
            z-index: 99999; display: flex; justify-content: center; align-items: center;
            animation: fadeIn 0.5s ease;
        `;
        
        const idiomasStr = usuario.idiomasObjetivo.map(i => i.idioma + ' (' + i.nivel + ')').join(', ');
        
        overlay.innerHTML = `
            <div style="background: var(--white, #ffffff); border-radius: 24px; padding: 40px 32px; max-width: 420px; width: 92%; text-align: center; animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 30px 80px rgba(0,0,0,0.35);">
                <div style="font-size: 72px; margin-bottom: 16px;">🎉</div>
                <h2 style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #6C5CE7, #00CEC9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px;">¡Bienvenido, ${usuario.nombre}!</h2>
                <p style="font-size: 16px; color: var(--gray, #636E72); margin-bottom: 16px; line-height: 1.6;">${mensajeMotivador}</p>
                <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-bottom:16px;">
                    <span style="background: rgba(108,92,231,0.1); padding:4px 16px; border-radius:20px; font-size:13px; color: #6C5CE7;">🌍 ${usuario.idiomaNativo} → ${idiomasStr}</span>
                    <span style="background: rgba(0,206,201,0.1); padding:4px 16px; border-radius:20px; font-size:13px; color: #00CEC9;">📊 Nivel ${usuario.nivel}</span>
                </div>
                <button onclick="this.closest('div[style]').parentElement.remove()" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #6C5CE7, #00CEC9); color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; font-family: var(--font, sans-serif);" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 30px rgba(108,92,231,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">🚀 ¡Comenzar!</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            if (overlay.parentNode) overlay.remove();
        }, 8000);
        
        return new Promise(resolve => {
            const checkModal = setInterval(() => {
                if (!document.body.contains(overlay)) {
                    clearInterval(checkModal);
                    resolve();
                }
            }, 200);
        });
    }

    _showToast(mensaje, tipo = 'info') {
        return new Promise((resolve) => {
            if (window.uiCore && window.uiCore.mostrarToast) {
                window.uiCore.mostrarToast(mensaje, tipo);
                resolve();
            } else {
                alert(mensaje);
                resolve();
            }
        });
    }

    _showConfirm(mensaje, titulo) {
        return new Promise((resolve) => {
            if (window.uiCore && window.uiCore.confirm) {
                window.uiCore.confirm(mensaje, titulo).then(resolve);
            } else {
                resolve(confirm(mensaje));
            }
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
                    <button onclick="location.reload()" style="padding:12px 24px;background:#6C5CE7;color:#fff;border:none;border-radius:12px;font-size:16px;cursor:pointer;font-family:var(--font, sans-serif);">🔄 Reintentar</button>
                    <button onclick="localStorage.clear();location.reload();" style="padding:12px 24px;background:#FF7675;color:#fff;border:none;border-radius:12px;font-size:16px;cursor:pointer;font-family:var(--font, sans-serif);">🗑️ Limpiar localStorage</button>
                </div>
                <div style="margin-top:16px;font-size:12px;color:var(--gray-light);">Si el problema persiste, abre la consola (F12) y revisa los errores.</div>
            </div>
        `;
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    if (window._appInitialized) return;
    window._appInitialized = true;
    console.log('🚀 Iniciando App v20.1...');
    
    if (typeof db === 'undefined') {
        console.error('❌ Database no definida. Verificar orden de carga de scripts.');
        document.body.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100vh;padding:20px;text-align:center;flex-direction:column;background:#f5f6fa;font-family:sans-serif;">
                <div style="font-size:64px;margin-bottom:16px;">⚠️</div>
                <h1 style="font-size:24px;color:#FF7675;margin-bottom:8px;">Error de Carga</h1>
                <p style="color:#636E72;max-width:400px;">No se pudo cargar el módulo de base de datos. Por favor, recarga la página.</p>
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

console.log('✅ App v20.1 - CON ACTUALIZACIÓN DE VERSIONES VÍA GROQ');
console.log('  🔍 Actualización automática en background al iniciar');
console.log('  🔄 Recarga de temas al cambiar versión');
console.log('  📦 Caché de versiones para modo offline');
console.log('  🧠 Tutor Neuropersonalizado v3.0 con modos');
console.log('  🗺️ Mapa neuroadaptativo de aprendizaje');
console.log('  🎯 Recomendaciones inteligentes de temas');
console.log('  📊 Análisis neurocognitivo en tiempo real');
console.log('  🤖 Intervenciones no invasivas');
console.log('  🔄 Integración total con el ecosistema');
console.log('  📦 Soporte para backups automáticos');
console.log('  🧭 Learning Path integrado (SIN WIDGET SEPARADO)');
console.log('  🎯 Modo Tutor configurable desde Registro y Configuración');
console.log('  🔥 COMPLETADO INDEPENDIENTE POR IDIOMA: Cachés limpiadas al cambiar de idioma');