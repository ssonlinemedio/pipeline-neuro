// ============================================================
// UI DASHBOARD v25.1 - CORREGIDO CON TARJETA DE TONOS
// ============================================================

class UIDashboard {
    constructor() {
        this._vigiaActivity = 0;
        this._centinelaActivity = 0;
        this._cargando = false;
        this._idiomaActual = null;
        this._renderizadoNeuro = false;
        this._panelExpandido = false;
        this._dashNeuroContainer = null;
        this._tutorBadgeInterval = null;
        this._ultimaActualizacion = 0;
        this._tiempoMinimoActualizacion = 2000;
        this._recargaTimeout = null;
        this._mostrandoContenidoNeuro = false;
        this._bibliotecaAbierta = false;
        this._inicializado = false;
        
        // Caché de datos
        this._cache = {
            stats: null,
            usuario: null,
            temas: [],
            progreso: [],
            ultimaActualizacion: 0,
            TTL: 30000,
            idioma: null
        };
        
        this._cargaPromise = null;
        this._renderizadoBasico = false;
        this._badgesCache = null;
        
        this._IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        this._IDIOMAS_TONALES = ['zh', 'chino', 'chinese', 'mandarin', 'mandarín', 'th', 'tailandés', 'thai', 'vi', 'vietnamita', 'vietnamese'];
        
        this._COLORES_ESTADO = {
            'optimo': '#00B894',
            'fatiga': '#FDCB6E',
            'bajo_rendimiento': '#E17055',
            'estancado': '#E17055',
            'critico': '#FF7675',
            'offline': '#636E72'
        };
        this._ICONOS_ESTADO = {
            'optimo': '✅',
            'fatiga': '🧠',
            'bajo_rendimiento': '📉',
            'estancado': '🔄',
            'critico': '🚨',
            'offline': '🔴'
        };
        
        this._TARJETAS_LITE = [
            { 
                id: 'biblioteca', 
                icono: '📚', 
                titulo: 'Biblioteca', 
                descripcion: 'Gestión completa de lecturas', 
                color: 'linear-gradient(135deg,#FDCB6E,#E17055)',
                categoria: 'lectura',
                accion: 'irABiblioteca'
            },
            { 
                id: 'elipse', 
                icono: '🌌', 
                titulo: 'Modo Elipse', 
                descripcion: 'Aprendizaje expansivo en ondas', 
                color: 'linear-gradient(135deg,#6C5CE7,#00CEC9)',
                categoria: 'aprendizaje',
                accion: 'irAElipse'
            },
            { 
                id: 'ondasCruzadas', 
                icono: '🌊', 
                titulo: 'Ondas Cruzadas', 
                descripcion: 'Interferencia de elipses', 
                color: 'linear-gradient(135deg,#6C5CE7,#A29BFE)',
                categoria: 'aprendizaje',
                accion: 'irAOndasCruzadas'
            },
            { 
                id: 'manual', 
                icono: '📖', 
                titulo: 'Manual Interactivo', 
                descripcion: 'Guía completa del sistema', 
                color: 'linear-gradient(135deg,#FDCB6E,#E17055)',
                categoria: 'sistema',
                accion: 'irAManual'
            },
            { 
                id: 'config', 
                icono: '⚙️', 
                titulo: 'Configuración', 
                descripcion: 'Ajusta tu perfil y preferencias', 
                color: 'linear-gradient(135deg,#FDCB6E,#F9CA24)',
                categoria: 'sistema',
                accion: 'irAConfig'
            },
            { 
                id: 'tools', 
                icono: '🛠️', 
                titulo: 'Herramientas', 
                descripcion: 'Backup y diagnóstico', 
                color: 'linear-gradient(135deg,#636E72,#2D3436)',
                categoria: 'sistema',
                accion: 'irATools'
            }
        ];
        
        this._TARJETAS_EXPANDIDAS = [
            { 
                id: 'biblioteca', 
                icono: '📚', 
                titulo: 'Biblioteca de Lectura', 
                descripcion: 'Todas tus historias y libros', 
                color: 'linear-gradient(135deg,#FDCB6E,#E17055)',
                categoria: 'lectura'
            },
            { 
                id: 'study', 
                icono: '📖', 
                titulo: 'Estudiar', 
                descripcion: 'Práctica con SRS', 
                color: 'linear-gradient(135deg,#6C5CE7,#A29BFE)',
                categoria: 'aprendizaje'
            },
            { 
                id: 'grammar', 
                icono: '📚', 
                titulo: 'Gramática', 
                descripcion: 'Reglas y estructuras', 
                color: 'linear-gradient(135deg,#00CEC9,#81ECEC)',
                categoria: 'lenguaje'
            },
            { 
                id: 'temas', 
                icono: '📂', 
                titulo: 'Temas', 
                descripcion: 'Organiza tu contenido', 
                color: 'linear-gradient(135deg,#FDCB6E,#F9CA24)',
                categoria: 'aprendizaje'
            },
            { 
                id: 'espacio', 
                icono: '⭐', 
                titulo: 'Mi Espacio', 
                descripcion: 'Tus favoritos', 
                color: 'linear-gradient(135deg,#A29BFE,#6C5CE7)',
                categoria: 'aprendizaje'
            },
            { 
                id: 'vigia', 
                icono: '👁️', 
                titulo: 'Vigía IA', 
                descripcion: 'Asistente inteligente', 
                color: 'linear-gradient(135deg,#74B9FF,#0984E3)',
                categoria: 'sistema'
            },
            { 
                id: 'competiciones', 
                icono: '🏆', 
                titulo: 'Ligas', 
                descripcion: 'Compite con IA', 
                color: 'linear-gradient(135deg,#FDCB6E,#E17055)',
                categoria: 'competiciones'
            },
            { 
                id: 'caracteres', 
                icono: '🀄', 
                titulo: 'Caracteres', 
                descripcion: 'Escritura jeroglífica', 
                color: 'linear-gradient(135deg,#6C5CE7,#00CEC9)',
                categoria: 'lenguaje'
            },
            { 
                id: 'tonos', 
                icono: '🎵', 
                titulo: 'Estudio de Tonos', 
                descripcion: 'Practica caracteres con diferentes tonos', 
                color: 'linear-gradient(135deg,#6C5CE7,#00CEC9)',
                categoria: 'lenguaje'
            },
            { 
                id: 'fonetica', 
                icono: '🎤', 
                titulo: 'Fonética', 
                descripcion: 'Pronunciación', 
                color: 'linear-gradient(135deg,#00B894,#55EFC4)',
                categoria: 'lenguaje'
            }
        ];
        
        this._CATEGORIAS = [
            {
                id: 'lectura',
                nombre: '📚 Lectura',
                descripcion: 'Gestiona tu biblioteca de lecturas',
                icono: '📚',
                color: 'linear-gradient(135deg, #FDCB6E, #E17055)',
                tarjetas: [
                    { id: 'biblioteca', nombre: 'Biblioteca de Lectura', icono: 'fa-book-open', desc: 'Todas tus historias y libros' }
                ]
            },
            {
                id: 'tutor',
                nombre: '🧠 Tutor Inteligente',
                descripcion: 'Tu asistente personal de aprendizaje',
                icono: '🧠',
                color: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
                tarjetas: [
                    { id: 'tutor_panel', nombre: 'Tutor NeuroAdaptativo', icono: 'fa-brain', desc: 'Aprendizaje personalizado con IA' },
                    { id: 'tutor_generador', nombre: 'Generador NeuroAdaptativo', icono: 'fa-magic', desc: 'Genera contenido personalizado con metodología neurocognitiva' }
                ]
            },
            {
                id: 'aprendizaje',
                nombre: '📚 Aprendizaje',
                descripcion: 'Gestiona tu contenido y progreso',
                icono: '📚',
                color: 'linear-gradient(135deg, #00B894, #55EFC4)',
                tarjetas: [
                    { id: 'study', nombre: 'Estudiar', icono: 'fa-graduation-cap', desc: 'Práctica con SRS' },
                    { id: 'temas', nombre: 'Temas', icono: 'fa-folder-open', desc: 'Organiza tu contenido' },
                    { id: 'espacio', nombre: 'Mi Espacio', icono: 'fa-star', desc: 'Tus favoritos' },
                    { id: 'elipse', nombre: '🌌 Modo Elipse', icono: 'fa-wave-square', desc: 'Aprendizaje expansivo' },
                    { id: 'ondasCruzadas', nombre: '🌊 Ondas Cruzadas', icono: 'fa-network-wired', desc: 'Interferencia de elipses' }
                ]
            },
            {
                id: 'lenguaje',
                nombre: '🌍 Lenguaje',
                descripcion: 'Herramientas lingüísticas avanzadas',
                icono: '🌍',
                color: 'linear-gradient(135deg, #00CEC9, #81ECEC)',
                tarjetas: [
                    { id: 'grammar', nombre: 'Gramática', icono: 'fa-sitemap', desc: 'Reglas y estructuras' },
                    { id: 'caracteres', nombre: 'Caracteres', icono: 'fa-font', desc: 'Escritura jeroglífica' },
                    { id: 'tonos', nombre: '🎵 Estudio de Tonos', icono: 'fa-music', desc: 'Práctica de tonos' },
                    { id: 'fonetica', nombre: 'Fonética', icono: 'fa-microphone-alt', desc: 'Pronunciación' }
                ]
            },
            {
                id: 'sistema',
                nombre: '⚙️ Sistema',
                descripcion: 'Control y configuración',
                icono: '⚙️',
                color: 'linear-gradient(135deg, #636E72, #2D3436)',
                tarjetas: [
                    { id: 'manual', nombre: 'Manual Interactivo', icono: 'fa-book', desc: 'Guía completa del sistema' },
                    { id: 'config', nombre: 'Configuración', icono: 'fa-sliders-h', desc: 'Ajusta tu perfil' },
                    { id: 'tools', nombre: 'Herramientas', icono: 'fa-tools', desc: 'Backup y diagnóstico' },
                    { id: 'vigia', nombre: 'Vigía IA', icono: 'fa-eye', desc: 'Asistente inteligente' }
                ]
            },
            {
                id: 'competiciones',
                nombre: '🏆 Competiciones',
                descripcion: 'Desafía a otros aprendices',
                icono: '🏆',
                color: 'linear-gradient(135deg, #FDCB6E, #E17055)',
                tarjetas: [
                    { id: 'competiciones', nombre: 'Liga Neuro', icono: 'fa-trophy', desc: 'Compite con IA' }
                ]
            }
        ];
    }

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._IDIOMAS_JEROGLIFICOS.some(item =>
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
    }

    _esTonal(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._IDIOMAS_TONALES.some(item =>
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
    }

    _getNombreIdioma(idioma) {
        const nombres = {
            'es': 'Español',
            'en': 'Inglés',
            'fr': 'Francés',
            'de': 'Alemán',
            'it': 'Italiano',
            'pt': 'Portugués',
            'zh': 'Chino',
            'ja': 'Japonés',
            'ko': 'Coreano',
            'ru': 'Ruso',
            'ar': 'Árabe',
            'hi': 'Hindi'
        };
        return nombres[idioma] || idioma;
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================
    
    async init(core) {
        if (this._inicializado) return this;
        this._inicializado = true;
        
        this.core = core || window.uiCore;
        
        const eventosRecarga = [
            'idiomaCambiado', 'favoritoActualizado', 'cambioNivel',
            'temaCompletado', 'tutorIntervencion', 'learningPathGenerado',
            'learningPathPasoCompletado', 'learningPathCompletado',
            'learningPathPasoCambiado', 'vigiaGramaticalActualizado',
            'actividadActualizada', 'learningPathProgresoActualizado',
            'elipseOndaGenerada', 'ondasCruzadasGenerada'
        ];
        
        for (const evento of eventosRecarga) {
            try {
                window.addEventListener(evento, () => {
                    this._programarRecarga();
                });
            } catch (e) {}
        }
        
        if (window.UIManual && typeof window.UIManual.init === 'function') {
            try {
                window.UIManual.init(this);
            } catch (e) {}
        }
        
        setInterval(() => {
            if (document.getElementById('dashboardView')?.classList.contains('active')) {
                this._actualizarSutil();
            }
        }, 5000);
        
        console.log('📊 UIDashboard v25.1: Inicializado (CON TARJETA DE TONOS)');
        return this;
    }

    // ============================================================
    // RECARGA CON DEBOUNCE
    // ============================================================
    
    _programarRecarga() {
        if (this._recargaTimeout) {
            clearTimeout(this._recargaTimeout);
        }
        this._recargaTimeout = setTimeout(() => {
            this._cache.ultimaActualizacion = 0;
            this._cargarDashboardInicial();
            this._recargaTimeout = null;
        }, 150);
    }

    cargar(core) {
        this.core = core || this.core;
        this._cargarDashboardInicial();
    }

    // ============================================================
    // ACCIONES DE NAVEGACIÓN
    // ============================================================
    
    irABiblioteca() {
        console.log('📚 Abriendo Biblioteca...');
        if (this.core) {
            if (!document.getElementById('bibliotecaModule')) {
                const mainContent = document.getElementById('mainContent');
                if (mainContent) {
                    const moduleEl = document.createElement('div');
                    moduleEl.id = 'bibliotecaModule';
                    moduleEl.className = 'module-view';
                    moduleEl.innerHTML = `
                        <div class="module-header">
                            <button class="btn-back" onclick="window.uiCore.volverDashboard()">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                            <div class="module-title">
                                <h2>📚 Biblioteca de Lectura</h2>
                                <span class="module-breadcrumb">Dashboard / Biblioteca</span>
                            </div>
                        </div>
                        <div class="module-content" id="bibliotecaContent"></div>
                    `;
                    mainContent.appendChild(moduleEl);
                }
            }
            this.core.irAModulo('biblioteca');
            if (window.UIBiblioteca) {
                setTimeout(() => {
                    window.UIBiblioteca.cargar(this.core);
                }, 300);
            }
        }
    }

    irAElipse() {
        console.log('🌌 Abriendo Elipse...');
        if (this.core) {
            this.core.irAElipse();
        }
    }

    irAOndasCruzadas() {
        console.log('🌊 Abriendo Ondas Cruzadas...');
        if (this.core) {
            this.core.irAOndasCruzadas();
        }
    }

    irAManual() {
        console.log('📖 Abriendo Manual...');
        if (this.core) {
            this.core.irAModulo('manual');
        }
    }

    irAConfig() {
        console.log('⚙️ Abriendo Configuración...');
        if (this.core) {
            this.core.irAModulo('config');
        }
    }

    irATools() {
        console.log('🛠️ Abriendo Herramientas...');
        if (this.core) {
            this.core.irAModulo('tools');
        }
    }

    irATutorPanel() {
        console.log('🧠 Abriendo panel del Tutor Neuro...');
        if (this.core) {
            this.core.irAModulo('tutor');
        }
    }

    irAGenerador() {
        console.log('🧠 Abriendo Generador NeuroAdaptativo...');
        if (this.core) {
            this.core.irAModulo('tutor_generador');
        }
    }

    irATonos() {
        console.log('🎵 Abriendo Estudio de Tonos...');
        if (this.core) {
            this.core.irAModulo('tonos');
            if (window.UITonos) {
                setTimeout(() => {
                    window.UITonos.cargar(this.core);
                }, 300);
            }
        }
    }

    // ============================================================
    // RECONEXIÓN AUTOMÁTICA DE VIGIA DESDE DASHBOARD
    // ============================================================
    
    _verificarYReconectarVigia() {
        try {
            if (typeof window.vigia === 'undefined' || !window.vigia) {
                return;
            }
            
            if (window.vigia.enLinea === true) {
                console.log('✅ Vigia ya está conectado');
                return;
            }
            
            console.log('🔄 Dashboard: Vigia desconectado, reconectando automáticamente...');
            
            if (typeof window.vigia.iniciar === 'function') {
                window.vigia.iniciar().then(() => {
                    console.log('✅ Vigia reconectado desde dashboard');
                    this._actualizarIndicadorVigia();
                }).catch(e => {
                    console.warn('⚠️ Error reconectando Vigia desde dashboard:', e.message);
                    setTimeout(() => this._verificarYReconectarVigia(), 5000);
                });
            } else if (typeof window.vigia.conectar === 'function') {
                window.vigia.conectar().then(() => {
                    console.log('✅ Vigia reconectado desde dashboard (conectar)');
                    this._actualizarIndicadorVigia();
                }).catch(e => {
                    console.warn('⚠️ Error reconectando Vigia desde dashboard:', e.message);
                    setTimeout(() => this._verificarYReconectarVigia(), 5000);
                });
            } else if (typeof window.vigia.init === 'function') {
                window.vigia.init().then(() => {
                    console.log('✅ Vigia reconectado desde dashboard (init)');
                    this._actualizarIndicadorVigia();
                }).catch(e => {
                    console.warn('⚠️ Error reconectando Vigia desde dashboard:', e.message);
                    setTimeout(() => this._verificarYReconectarVigia(), 5000);
                });
            } else {
                if (window.uiCore && typeof window.uiCore._handleReconectarVigia === 'function') {
                    window.uiCore._handleReconectarVigia().then(() => {
                        console.log('✅ Vigia reconectado via uiCore');
                        this._actualizarIndicadorVigia();
                    }).catch(() => {});
                }
            }
        } catch (e) {
            console.warn('⚠️ Error en verificación de Vigia:', e);
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
        } catch (e) {
            console.warn('⚠️ Error actualizando indicador de Vigia:', e);
        }
    }

    // ============================================================
    // CARGA PRINCIPAL DEL DASHBOARD
    // ============================================================
    
    async _cargarDashboardInicial() {
        if (this._cargando) {
            console.log('⏳ Dashboard ya cargando, esperando...');
            if (this._cargaPromise) {
                await this._cargaPromise;
            }
            return;
        }
        
        if (Date.now() - this._ultimaActualizacion < this._tiempoMinimoActualizacion) {
            console.log('⏳ Actualización muy reciente (throttle), saltando...');
            return;
        }
        
        this._cargando = true;
        this._ultimaActualizacion = Date.now();
        
        this._cargaPromise = this._ejecutarCargaDashboard();
        
        try {
            await this._cargaPromise;
        } catch (error) {
            console.error('❌ Error en carga de dashboard:', error);
        } finally {
            this._cargando = false;
            this._cargaPromise = null;
        }
    }

    async _ejecutarCargaDashboard() {
        try {
            console.log('📊 Cargando Dashboard v25.1...');
            
            const dashboardGrid = document.getElementById('dashboardGrid');
            if (!dashboardGrid) {
                console.error('❌ dashboardGrid no encontrado');
                return;
            }
            
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo?.() || 'es';
            this._idiomaActual = idiomaActivo;
            const esJeroglifico = this._esJeroglifico(idiomaActivo);
            const esTonal = this._esTonal(idiomaActivo);
            
            const cacheValido = this._cache.idioma === idiomaActivo && 
                               this._cache.ultimaActualizacion > 0 &&
                               (Date.now() - this._cache.ultimaActualizacion) < this._cache.TTL;
            
            let stats, usuario, temas, progreso, racha, neuroEstado;
            
            if (cacheValido) {
                console.log('📦 Usando caché para dashboard');
                stats = this._cache.stats;
                usuario = this._cache.usuario;
                temas = this._cache.temas;
                progreso = this._cache.progreso;
            } else {
                console.log('🔄 Cargando datos frescos para dashboard...');
                
                const promises = [];
                const statsPromise = db?.obtenerEstadisticasNeuro?.(idiomaActivo) || Promise.resolve({ totalFrases: 0, totalPalabras: 0, progreso: 0, neuroScore: 0 });
                const usuarioPromise = db?.getUsuario?.() || Promise.resolve(this._getUsuarioLocal() || { nombre: 'Usuario' });
                const temasPromise = db?.obtenerTemasPorIdioma?.(idiomaActivo) || Promise.resolve([]);
                const progresoPromise = db?.obtenerTodoProgreso?.() || Promise.resolve([]);
                
                const [statsResult, usuarioResult, temasResult, progresoResult] = await Promise.all([
                    statsPromise.catch(() => ({ totalFrases: 0, totalPalabras: 0, progreso: 0, neuroScore: 0 })),
                    usuarioPromise.catch(() => this._getUsuarioLocal() || { nombre: 'Usuario' }),
                    temasPromise.catch(() => []),
                    progresoPromise.catch(() => [])
                ]);
                
                stats = statsResult;
                usuario = usuarioResult;
                temas = temasResult;
                progreso = progresoResult;
                
                this._cache.stats = stats;
                this._cache.usuario = usuario;
                this._cache.temas = temas;
                this._cache.progreso = progreso;
                this._cache.idioma = idiomaActivo;
                this._cache.ultimaActualizacion = Date.now();
            }
            
            racha = await this._calcularRacha(progreso);
            neuroEstado = await this._calcularEstadoNeuro();
            
            // Obtener estadísticas de tonos si es tonal
            let tonosStats = null;
            if (esTonal) {
                try {
                    const frases = await db?.obtenerFrasesPorIdioma?.(idiomaActivo) || [];
                    const frasesConTono = frases.filter(f => f._esTono === true || f._tono);
                    tonosStats = {
                        totalFrasesConTono: frasesConTono.length,
                        totalFrases: frases.length
                    };
                } catch (e) {
                    tonosStats = null;
                }
            }
            
            await this._renderizarDashboardHTML(dashboardGrid, {
                stats,
                usuario,
                temas,
                progreso,
                racha,
                neuroEstado,
                idiomaActivo,
                esJeroglifico,
                esTonal,
                tonosStats
            });
            
            setTimeout(() => {
                this._actualizarHeaderStats({ progreso: stats.progreso, rcn: stats.neuroScore || 0, faseActual: 1 });
                this._actualizarActividad(this.core);
                this._actualizarBadgeTutor();
                this._renderizadoNeuro = true;
            }, 50);
            
            // === RECONEXIÓN AUTOMÁTICA DE VIGIA ===
            this._verificarYReconectarVigia();
            
            console.log(`✅ Dashboard v25.1 cargado en ${Date.now() - this._ultimaActualizacion}ms para: ${idiomaActivo}`);
            
        } catch (error) {
            console.error('❌ Error cargando dashboard:', error);
            this._renderizarDashboardFallback();
        }
    }

    // ============================================================
    // RENDERIZADO DEL HTML DEL DASHBOARD
    // ============================================================
    
    async _renderizarDashboardHTML(container, data) {
        const { stats, usuario, temas, progreso, racha, neuroEstado, idiomaActivo, esJeroglifico, esTonal, tonosStats } = data;
        
        const modoLite = this.core?.esModoLite?.() ?? true;
        const esExpandido = !modoLite;
        
        let html = '';
        
        html += `
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:20px;padding:12px 20px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:14px;border:2px solid var(--primary)20;">
                <div>
                    <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                        📊 Panel de Control
                        <span style="font-size:11px;font-weight:400;color:var(--gray);margin-left:8px;">v25.1</span>
                    </h2>
                    <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                        Bienvenido de vuelta, <strong>${usuario?.nombre || 'Usuario'}</strong>
                        <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">🎯 ${this._obtenerNivelUsuario()}</span>
                        ${esTonal ? `<span style="font-size:11px;color:var(--primary);margin-left:8px;">🎵 ${this._getNombreIdioma(idiomaActivo)} es tonal</span>` : ''}
                        ${esJeroglifico ? `<span style="font-size:11px;color:var(--secondary);margin-left:8px;">🀄 Jeroglífico</span>` : ''}
                    </p>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn-secondary" onclick="window.UIDashboard.irABiblioteca()" 
                            style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.3s;"
                            onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 20px rgba(225,112,85,0.3)'" 
                            onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-book-open"></i> 📚 Biblioteca
                    </button>
                    <button class="btn-secondary" onclick="window.UIDashboard.irAManual()" 
                            style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.3s;"
                            onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 20px rgba(225,112,85,0.3)'" 
                            onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-book"></i> 📖 Manual
                    </button>
                    <button onclick="window.uiCore?.toggleModoDashboard?.()" 
                            style="padding:6px 14px;font-size:12px;border:none;border-radius:6px;cursor:pointer;transition:all 0.3s;background:${modoLite ? 'var(--primary)' : 'var(--bg)'};color:${modoLite ? 'white' : 'var(--dark)'};"
                            onmouseover="this.style.transform='scale(1.05)'" 
                            onmouseout="this.style.transform='none'">
                        <i class="fas ${modoLite ? 'fa-expand' : 'fa-compress'}"></i>
                        ${modoLite ? 'Experto' : 'Lite'}
                    </button>
                </div>
            </div>
        `;

        html += `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px;">
        `;
        
        const badgesCache = await this._calcularBadges(idiomaActivo);
        
        // Determinar qué tarjetas mostrar en la vista Lite
        let tarjetasLite = [...this._TARJETAS_LITE];
        
        // Si es tonal, añadir tarjeta de Tonos a la vista Lite
        if (esTonal) {
            const tonosBadge = tonosStats && tonosStats.totalFrasesConTono > 0 
                ? { texto: `🎵 ${tonosStats.totalFrasesConTono}`, color: 'rgba(108,92,231,0.9)' }
                : null;
            
            // Verificar si ya existe la tarjeta de Tonos en la lista
            const tonosExistente = tarjetasLite.find(t => t.id === 'tonos');
            if (!tonosExistente) {
                tarjetasLite.push({
                    id: 'tonos',
                    icono: '🎵',
                    titulo: 'Estudio de Tonos',
                    descripcion: tonosStats && tonosStats.totalFrasesConTono > 0 
                        ? `${tonosStats.totalFrasesConTono} frases con tonos · Practica pronunciación`
                        : 'Genera frases para practicar tonos',
                    color: 'linear-gradient(135deg,#6C5CE7,#00CEC9)',
                    categoria: 'lenguaje',
                    accion: 'irATonos'
                });
            }
        }
        
        for (const tarjeta of tarjetasLite) {
            const badge = badgesCache[tarjeta.id] || null;
            
            const isLite = true;
            const shadow = isLite && (tarjeta.id === 'biblioteca' || tarjeta.id === 'elipse' || tarjeta.id === 'ondasCruzadas' || tarjeta.id === 'manual' || tarjeta.id === 'tonos')
                ? '0 8px 32px rgba(108,92,231,0.15)'
                : '0 4px 16px rgba(0,0,0,0.06)';
            
            const borderColor = isLite && (tarjeta.id === 'biblioteca' || tarjeta.id === 'elipse' || tarjeta.id === 'ondasCruzadas' || tarjeta.id === 'manual' || tarjeta.id === 'tonos')
                ? '2px solid var(--primary)' 
                : '1px solid var(--light)';
            
            let accionClick = '';
            if (tarjeta.id === 'biblioteca') {
                accionClick = 'window.UIDashboard.irABiblioteca()';
            } else if (tarjeta.id === 'elipse') {
                accionClick = 'window.UIDashboard.irAElipse()';
            } else if (tarjeta.id === 'ondasCruzadas') {
                accionClick = 'window.UIDashboard.irAOndasCruzadas()';
            } else if (tarjeta.id === 'manual') {
                accionClick = 'window.UIDashboard.irAManual()';
            } else if (tarjeta.id === 'config') {
                accionClick = 'window.UIDashboard.irAConfig()';
            } else if (tarjeta.id === 'tools') {
                accionClick = 'window.UIDashboard.irATools()';
            } else if (tarjeta.id === 'tonos') {
                accionClick = 'window.UIDashboard.irATonos()';
            } else {
                accionClick = `window.uiCore?.irAModulo?.('${tarjeta.id}')`;
            }
            
            // Badge especial para Tonos
            let badgeTexto = badge ? badge.texto : '';
            if (tarjeta.id === 'tonos' && tonosStats) {
                badgeTexto = `🎵 ${tonosStats.totalFrasesConTono || 0}`;
            }
            
            html += `
                <div class="dash-card" onclick="${accionClick}" 
                     style="
                        background:var(--white);
                        border-radius:20px;
                        padding:20px 16px;
                        box-shadow:${shadow};
                        border:${borderColor};
                        cursor:pointer;
                        transition:all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                        display:flex;
                        flex-direction:column;
                        align-items:center;
                        text-align:center;
                        gap:10px;
                        min-height:160px;
                        position:relative;
                        overflow:hidden;
                     "
                     onmouseover="
                        this.style.transform='translateY(-6px) scale(1.02)';
                        this.style.boxShadow='0 16px 48px rgba(0,0,0,0.12)';
                        this.style.borderColor='var(--primary)';
                        this.querySelector('.dash-card-arrow').style.transform='translateX(6px)';
                        this.querySelector('.dash-card-arrow').style.opacity='1';
                     " 
                     onmouseout="
                        this.style.transform='none';
                        this.style.boxShadow='${shadow}';
                        this.style.borderColor='${isLite && (tarjeta.id === 'biblioteca' || tarjeta.id === 'elipse' || tarjeta.id === 'ondasCruzadas' || tarjeta.id === 'manual' || tarjeta.id === 'tonos') ? 'var(--primary)' : 'var(--light)'}';
                        this.querySelector('.dash-card-arrow').style.transform='none';
                        this.querySelector('.dash-card-arrow').style.opacity='0.5';
                     ">
                    
                    ${badgeTexto ? `
                        <div style="
                            position:absolute;
                            top:8px;
                            right:8px;
                            background:${tarjeta.id === 'tonos' ? 'rgba(108,92,231,0.9)' : (badge?.color || 'rgba(108,92,231,0.9)')};
                            color:white;
                            padding:2px 10px;
                            border-radius:50px;
                            font-size:10px;
                            font-weight:600;
                            box-shadow:0 2px 12px rgba(0,0,0,0.15);
                        ">
                            ${badgeTexto}
                        </div>
                    ` : ''}
                    
                    ${isLite && (tarjeta.id === 'biblioteca' || tarjeta.id === 'elipse' || tarjeta.id === 'ondasCruzadas' || tarjeta.id === 'manual' || tarjeta.id === 'tonos') ? `
                        <div style="
                            position:absolute;
                            top:-30px;
                            right:-30px;
                            width:100px;
                            height:100px;
                            border-radius:50%;
                            background:linear-gradient(135deg, rgba(108,92,231,0.06), rgba(0,206,201,0.06));
                            pointer-events:none;
                        "></div>
                    ` : ''}
                    
                    <div style="
                        width:56px;
                        height:56px;
                        border-radius:16px;
                        background:${tarjeta.color};
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:28px;
                        color:white;
                        flex-shrink:0;
                        box-shadow:0 4px 16px rgba(0,0,0,0.1);
                        transition:all 0.3s ease;
                        position:relative;
                        z-index:1;
                    ">
                        ${tarjeta.icono}
                    </div>
                    
                    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;z-index:1;">
                        <h3 style="font-size:${isLite ? '16px' : '14px'};font-weight:700;color:var(--dark);margin:0;display:flex;align-items:center;justify-content:center;gap:6px;">
                            ${tarjeta.titulo}
                            ${(tarjeta.id === 'biblioteca' || tarjeta.id === 'elipse' || tarjeta.id === 'ondasCruzadas' || tarjeta.id === 'manual' || tarjeta.id === 'tonos') && isLite ? `
                                <span style="font-size:8px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;padding:1px 8px;border-radius:50px;font-weight:600;">⭐</span>
                            ` : ''}
                        </h3>
                        <p style="font-size:12px;color:var(--gray);margin:4px 0 0;line-height:1.4;max-width:160px;margin-left:auto;margin-right:auto;">
                            ${tarjeta.descripcion}
                        </p>
                    </div>
                    
                    <div class="dash-card-arrow" style="color:var(--gray-light);font-size:14px;opacity:0.5;transition:all 0.3s ease;z-index:1;">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            `;
        }
        
        html += `
            </div>
        `;

        // ============================================================
        // VISTA EXPANDIDA - CON TARJETA DE TONOS
        // ============================================================
        
        if (esExpandido) {
            const idsLite = new Set(tarjetasLite.map(t => t.id));
            
            // Determinar qué tarjetas de la categoría Lenguaje mostrar
            const tarjetasLenguaje = [
                { id: 'grammar', nombre: 'Gramática', icono: 'fa-sitemap', desc: 'Reglas y estructuras' },
                { id: 'caracteres', nombre: 'Caracteres', icono: 'fa-font', desc: 'Escritura jeroglífica' }
            ];
            
            // Añadir Tonos si es tonal
            if (esTonal) {
                tarjetasLenguaje.push({ 
                    id: 'tonos', 
                    nombre: '🎵 Estudio de Tonos', 
                    icono: 'fa-music', 
                    desc: 'Práctica de tonos' 
                });
            }
            
            tarjetasLenguaje.push({ 
                id: 'fonetica', 
                nombre: 'Fonética', 
                icono: 'fa-microphone-alt', 
                desc: 'Pronunciación' 
            });
            
            // Categorías personalizadas
            const categoriasPersonalizadas = [
                {
                    id: 'lectura',
                    nombre: '📚 Lectura',
                    descripcion: 'Gestiona tu biblioteca de lecturas',
                    icono: '📚',
                    color: 'linear-gradient(135deg, #FDCB6E, #E17055)',
                    tarjetas: [
                        { id: 'biblioteca', nombre: 'Biblioteca de Lectura', icono: 'fa-book-open', desc: 'Todas tus historias y libros' }
                    ]
                },
                {
                    id: 'tutor',
                    nombre: '🧠 Tutor Inteligente',
                    descripcion: 'Tu asistente personal de aprendizaje',
                    icono: '🧠',
                    color: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
                    tarjetas: [
                        { id: 'tutor_panel', nombre: 'Tutor NeuroAdaptativo', icono: 'fa-brain', desc: 'Aprendizaje personalizado con IA' },
                        { id: 'tutor_generador', nombre: 'Generador NeuroAdaptativo', icono: 'fa-magic', desc: 'Genera contenido personalizado' }
                    ]
                },
                {
                    id: 'aprendizaje',
                    nombre: '📚 Aprendizaje',
                    descripcion: 'Gestiona tu contenido y progreso',
                    icono: '📚',
                    color: 'linear-gradient(135deg, #00B894, #55EFC4)',
                    tarjetas: [
                        { id: 'study', nombre: 'Estudiar', icono: 'fa-graduation-cap', desc: 'Práctica con SRS' },
                        { id: 'temas', nombre: 'Temas', icono: 'fa-folder-open', desc: 'Organiza tu contenido' },
                        { id: 'espacio', nombre: 'Mi Espacio', icono: 'fa-star', desc: 'Tus favoritos' },
                        { id: 'elipse', nombre: '🌌 Modo Elipse', icono: 'fa-wave-square', desc: 'Aprendizaje expansivo' },
                        { id: 'ondasCruzadas', nombre: '🌊 Ondas Cruzadas', icono: 'fa-network-wired', desc: 'Interferencia de elipses' }
                    ]
                },
                {
                    id: 'lenguaje',
                    nombre: '🌍 Lenguaje',
                    descripcion: 'Herramientas lingüísticas avanzadas',
                    icono: '🌍',
                    color: 'linear-gradient(135deg, #00CEC9, #81ECEC)',
                    tarjetas: tarjetasLenguaje
                },
                {
                    id: 'sistema',
                    nombre: '⚙️ Sistema',
                    descripcion: 'Control y configuración',
                    icono: '⚙️',
                    color: 'linear-gradient(135deg, #636E72, #2D3436)',
                    tarjetas: [
                        { id: 'manual', nombre: 'Manual Interactivo', icono: 'fa-book', desc: 'Guía completa del sistema' },
                        { id: 'config', nombre: 'Configuración', icono: 'fa-sliders-h', desc: 'Ajusta tu perfil' },
                        { id: 'tools', nombre: 'Herramientas', icono: 'fa-tools', desc: 'Backup y diagnóstico' },
                        { id: 'vigia', nombre: 'Vigía IA', icono: 'fa-eye', desc: 'Asistente inteligente' }
                    ]
                },
                {
                    id: 'competiciones',
                    nombre: '🏆 Competiciones',
                    descripcion: 'Desafía a otros aprendices',
                    icono: '🏆',
                    color: 'linear-gradient(135deg, #FDCB6E, #E17055)',
                    tarjetas: [
                        { id: 'competiciones', nombre: 'Liga Neuro', icono: 'fa-trophy', desc: 'Compite con IA' }
                    ]
                }
            ];

            for (const categoria of categoriasPersonalizadas) {
                let tarjetasFiltradas = categoria.tarjetas.filter(t => !idsLite.has(t.id));
                
                // Filtrar caracteres si no es jeroglífico
                if (categoria.id === 'lenguaje') {
                    tarjetasFiltradas = tarjetasFiltradas.filter(t => {
                        if (t.id === 'caracteres' && !esJeroglifico) return false;
                        if (t.id === 'tonos' && !esTonal) return false;
                        return true;
                    });
                }
                
                if (tarjetasFiltradas.length === 0) continue;

                html += `
                    <div class="categoria-container" style="grid-column: 1 / -1; margin-top: 12px;">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:0 4px;">
                            <span style="font-size:24px;">${categoria.icono}</span>
                            <div>
                                <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">${categoria.nombre}</h3>
                                <p style="font-size:12px;color:var(--gray);margin:2px 0 0;">${categoria.descripcion}</p>
                            </div>
                            <span style="font-size:11px;color:var(--gray-light);margin-left:auto;background:var(--bg);padding:2px 14px;border-radius:50px;">${tarjetasFiltradas.length} módulos</span>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
                `;

                for (const tarjeta of tarjetasFiltradas) {
                    let extraStyles = '';
                    let accionClick = '';
                    let badge = '';
                    
                    if (tarjeta.id === 'biblioteca') {
                        extraStyles = 'border:2px solid #E17055;background:linear-gradient(135deg, #E1705508, #FDCB6E08);';
                        accionClick = 'window.UIDashboard.irABiblioteca()';
                        const badgeInfo = badgesCache['biblioteca'];
                        if (badgeInfo) badge = badgeInfo.html || '';
                    } else if (tarjeta.id === 'manual') {
                        extraStyles = 'border:2px solid #E17055;background:linear-gradient(135deg, #E1705508, #FDCB6E08);';
                        accionClick = 'window.UIDashboard.irAManual()';
                        const badgeInfo = badgesCache['manual'];
                        if (badgeInfo) badge = badgeInfo.html || '';
                    } else if (tarjeta.id === 'tonos') {
                        extraStyles = 'border:2px solid #6C5CE7;background:linear-gradient(135deg, #6C5CE708, #00CEC908);';
                        accionClick = 'window.UIDashboard.irATonos()';
                        if (tonosStats) {
                            badge = `<span style="font-size:9px;color:var(--primary);">🎵 ${tonosStats.totalFrasesConTono || 0}</span>`;
                        }
                    } else if (tarjeta.id === 'tutor_panel') {
                        extraStyles = 'border:2px solid var(--primary);background:linear-gradient(135deg, var(--primary)04, var(--secondary)04);';
                        accionClick = 'window.UIDashboard.irATutorPanel()';
                        try {
                            if (window.tutorNeuro) {
                                const pendientes = window.tutorNeuro.getIntervencionesPendientes?.() || [];
                                if (pendientes.length > 0) {
                                    badge = `<span style="font-size:9px;background:var(--warning);color:white;padding:1px 10px;border-radius:50px;">${pendientes.length}</span>`;
                                }
                            }
                        } catch(e) {}
                    } else if (tarjeta.id === 'tutor_generador') {
                        extraStyles = 'border:2px solid var(--secondary);background:linear-gradient(135deg, var(--secondary)04, var(--primary)04);';
                        accionClick = 'window.UIDashboard.irAGenerador()';
                        try {
                            const nivelActual = this._obtenerNivelUsuario();
                            badge = `<span style="font-size:9px;color:var(--gray-light);">🎯 ${nivelActual}</span>`;
                        } catch(e) {}
                    } else if (tarjeta.id === 'elipse') {
                        accionClick = 'window.UIDashboard.irAElipse()';
                    } else if (tarjeta.id === 'ondasCruzadas') {
                        accionClick = 'window.UIDashboard.irAOndasCruzadas()';
                    } else if (tarjeta.id === 'config') {
                        accionClick = 'window.UIDashboard.irAConfig()';
                    } else if (tarjeta.id === 'tools') {
                        accionClick = 'window.UIDashboard.irATools()';
                    } else {
                        accionClick = `window.uiCore?.irAModulo?.('${tarjeta.id}')`;
                    }
                    
                    if (tarjeta.id === 'study' && stats) {
                        const completadas = stats.progreso || 0;
                        const total = stats.totalFrases || 1;
                        const pct = Math.round((completadas / total) * 100);
                        badge = `<span style="font-size:9px;color:var(--gray-light);">${pct}%</span>`;
                    }
                    
                    if (tarjeta.id === 'temas' && temas) {
                        const totalTemas = temas.length;
                        const completados = temas.filter(t => t.estado === 'completado').length;
                        badge = `<span style="font-size:9px;color:var(--gray-light);">${completados}/${totalTemas}</span>`;
                    }
                    
                    if (tarjeta.id === 'espacio') {
                        try {
                            const favs = await window.gestorFavoritos?.contarFavoritos?.() || { frases: 0, palabras: 0 };
                            const total = favs.frases + favs.palabras;
                            badge = `<span style="font-size:9px;color:var(--gray-light);">${total}</span>`;
                        } catch (e) {
                            badge = `<span style="font-size:9px;color:var(--gray-light);">0</span>`;
                        }
                    }
                    
                    if (tarjeta.id === 'grammar') {
                        try {
                            const palabras = await db?.obtenerPalabrasPorIdioma?.(idiomaActivo) || [];
                            badge = `<span style="font-size:9px;color:var(--gray-light);">${palabras.length}</span>`;
                        } catch (e) {
                            badge = `<span style="font-size:9px;color:var(--gray-light);">0</span>`;
                        }
                    }
                    
                    if (tarjeta.id === 'caracteres') {
                        try {
                            const familias = await db?.obtenerFamiliasCaracteres?.(idiomaActivo) || [];
                            badge = `<span style="font-size:9px;color:var(--gray-light);">${familias.length}</span>`;
                        } catch (e) {
                            badge = `<span style="font-size:9px;color:var(--gray-light);">0</span>`;
                        }
                    }
                    
                    if (tarjeta.id === 'fonetica') {
                        try {
                            const frases = await db?.obtenerFrasesPorIdioma?.(idiomaActivo) || [];
                            const palabras = await db?.obtenerPalabrasPorIdioma?.(idiomaActivo) || [];
                            let conTranscripcion = 0;
                            let total = 0;
                            for (const f of frases) {
                                total++;
                                if (f.transcripcion || f.pinyinCompleto || f.segmentacion?.pinyin) conTranscripcion++;
                            }
                            for (const p of palabras) {
                                total++;
                                if (p.transcripcion || p.pinyin) conTranscripcion++;
                            }
                            badge = `<span style="font-size:9px;color:var(--gray-light);">${conTranscripcion}/${total}</span>`;
                        } catch (e) {
                            badge = `<span style="font-size:9px;color:var(--gray-light);">0</span>`;
                        }
                    }
                    
                    if (tarjeta.id === 'competiciones') {
                        extraStyles = 'border:2px solid #FDCB6E;background:linear-gradient(135deg, #FDCB6E08, #E1705508);';
                    }

                    html += `
                        <div class="dash-card" onclick="${accionClick}" 
                             style="background:var(--white);border-radius:14px;padding:14px 16px;box-shadow:0 2px 12px rgba(0,0,0,0.04);border-left:4px solid var(--primary);cursor:pointer;transition:all 0.3s ease;display:flex;align-items:center;gap:14px;${extraStyles}"
                             onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 32px rgba(0,0,0,0.08)'" 
                             onmouseout="this.style.transform='none';this.style.boxShadow='0 2px 12px rgba(0,0,0,0.04)'">
                            <div style="width:40px;height:40px;border-radius:12px;background:${categoria.color};display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas ${tarjeta.icono}"></i>
                            </div>
                            <div style="flex:1;min-width:0;">
                                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                                    <span style="font-size:14px;font-weight:600;color:var(--dark);">${tarjeta.nombre}</span>
                                    ${badge ? `<span style="font-size:9px;color:var(--gray-light);background:var(--bg);padding:1px 10px;border-radius:50px;">${badge}</span>` : ''}
                                </div>
                                <p style="font-size:11px;color:var(--gray);margin:2px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${tarjeta.desc}</p>
                            </div>
                            <div style="color:var(--gray-light);font-size:12px;flex-shrink:0;transition:all 0.3s;">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    `;
                }

                html += `
                        </div>
                    </div>
                `;
            }
        }

        const totalModulos = modoLite ? 
            tarjetasLite.length : 
            tarjetasLite.length + this._TARJETAS_EXPANDIDAS.length;
        
        html += `
            <div style="
                margin-top:24px;
                padding:12px 20px;
                background:${modoLite ? 'linear-gradient(135deg, var(--primary)04, var(--secondary)04)' : 'var(--bg)'};
                border-radius:12px;
                border:2px solid ${modoLite ? 'var(--primary)20' : 'var(--light)'};
                display:flex;
                justify-content:space-between;
                align-items:center;
                flex-wrap:wrap;
                gap:10px;
                font-size:12px;
                color:var(--gray);
            ">
                <span>📊 ${totalModulos} módulos · ${modoLite ? '🧘 Lite' : '🚀 Expandido'}</span>
                <span>🎯 ${this._obtenerNivelUsuario()}</span>
                <span>📈 ${stats?.progreso || 0}%</span>
                <span>🔥 ${racha || 0}d</span>
                ${esTonal ? `<span>🎵 ${this._getNombreIdioma(idiomaActivo)} es tonal</span>` : ''}
                ${esJeroglifico ? `<span>🀄 Jeroglífico</span>` : ''}
                ${esTonal ? `<span>🔊 Módulo de Tonos disponible ✅</span>` : ''}
            </div>
        `;

        container.innerHTML = html;
    }

    // ============================================================
    // CÁLCULO DE BADGES
    // ============================================================
    
    async _calcularBadges(idiomaActivo) {
        const cacheKey = 'badges_' + idiomaActivo;
        if (this._badgesCache && this._badgesCache.key === cacheKey && Date.now() - this._badgesCache.timestamp < 10000) {
            return this._badgesCache.data;
        }
        
        const badges = {};
        
        try {
            const historias = await db?.obtenerHistorias?.() || [];
            const leidas = localStorage.getItem('pipeline_historias_leidas');
            const leidasSet = leidas ? new Set(JSON.parse(leidas)) : new Set();
            const total = historias.length;
            const leidasCount = leidasSet.size;
            if (total > 0) {
                badges.biblioteca = {
                    texto: `📚 ${leidasCount}/${total}`,
                    color: 'rgba(225,112,85,0.9)',
                    html: `<span style="font-size:9px;color:var(--gray-light);">📚 ${leidasCount}/${total}</span>`
                };
            }
            
            if (window.modoElipse) {
                try {
                    const estado = window.modoElipse.getEstadoElipse?.(idiomaActivo);
                    if (estado && estado.totalOndas > 0) {
                        badges.elipse = {
                            texto: `🌊 ${estado.totalOndas}`,
                            color: 'rgba(108,92,231,0.9)',
                            html: `<span style="font-size:9px;color:var(--gray-light);">🌊 ${estado.totalOndas}</span>`
                        };
                    }
                } catch (e) {}
            }
            
            try {
                const estado = window.modoOndasCruzadas?.getEstado?.() || {};
                if (estado.grafoSize > 0) {
                    badges.ondasCruzadas = {
                        texto: `🌊 ${estado.grafoSize}`,
                        color: 'rgba(108,92,231,0.9)',
                        html: `<span style="font-size:9px;color:var(--gray-light);">🌊 ${estado.grafoSize}</span>`
                    };
                }
            } catch (e) {}
            
            try {
                const favs = localStorage.getItem('pipeline_manual_favoritos');
                if (favs) {
                    const parsed = JSON.parse(favs);
                    if (parsed.length > 0) {
                        badges.manual = {
                            texto: `⭐ ${parsed.length}`,
                            color: 'rgba(225,112,85,0.9)',
                            html: `<span style="font-size:9px;color:var(--gray-light);">⭐ ${parsed.length}</span>`
                        };
                    }
                }
            } catch (e) {}
            
            try {
                const backups = JSON.parse(localStorage.getItem('pipeline_backups_locales') || '[]');
                if (backups.length > 0) {
                    badges.tools = {
                        texto: `💾 ${backups.length}`,
                        color: 'rgba(99,110,114,0.9)',
                        html: `<span style="font-size:9px;color:var(--gray-light);">💾 ${backups.length}</span>`
                    };
                }
            } catch (e) {}
            
            this._badgesCache = {
                key: cacheKey,
                data: badges,
                timestamp: Date.now()
            };
        } catch (e) {}
        
        return badges;
    }

    // ============================================================
    // FALLBACK PARA ERRORES
    // ============================================================
    
    _renderizarDashboardFallback() {
        const dashboardGrid = document.getElementById('dashboardGrid');
        if (!dashboardGrid) return;
        
        dashboardGrid.innerHTML = `
            <div style="grid-column:1/-1;padding:30px;text-align:center;background:var(--white);border-radius:16px;border:2px solid var(--danger);">
                <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
                <h3 style="font-size:18px;font-weight:700;color:var(--danger);">Error al cargar el dashboard</h3>
                <p style="font-size:14px;color:var(--gray);">Hubo un problema al cargar los datos. Por favor, recarga la página.</p>
                <button onclick="location.reload()" style="margin-top:12px;padding:10px 24px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }

    // ============================================================
    // MÉTODOS AUXILIARES
    // ============================================================
    
    _getUsuarioLocal() {
        try {
            const data = localStorage.getItem('pipeline_usuario');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed && parsed.nombre) return parsed;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    _obtenerNivelUsuario() {
        try {
            const infoActivo = window.gestorIdiomas?.getInfoActivo?.();
            if (infoActivo?.nivel) return infoActivo.nivel;
            const usuarioLocal = localStorage.getItem('pipeline_usuario');
            if (usuarioLocal) {
                const parsed = JSON.parse(usuarioLocal);
                const idiomaActivo = window.gestorIdiomas?.getIdiomaActivo?.() || 'es';
                const idiomaObj = parsed.idiomasObjetivo?.find(i => i.idioma === idiomaActivo);
                if (idiomaObj?.nivel) return idiomaObj.nivel;
                if (parsed.idiomasObjetivo?.length > 0) return parsed.idiomasObjetivo[0].nivel || 'B1';
            }
            return 'B1';
        } catch (e) {
            return 'B1';
        }
    }

    async _calcularRacha(progreso) {
        try {
            if (!progreso || progreso.length === 0) return 0;
            const fechas = progreso.map(p => new Date(p.ultimoRepaso).toDateString());
            const uniqueFechas = [...new Set(fechas)].sort();
            let racha = 0;
            
            for (let i = uniqueFechas.length - 1; i >= 0; i--) {
                const fecha = new Date(uniqueFechas[i]);
                const diff = Math.floor((Date.now() - fecha.getTime()) / 86400000);
                if (diff === racha) {
                    racha++;
                } else if (diff > racha) {
                    break;
                }
            }
            return racha;
        } catch (e) {
            return 0;
        }
    }

    async _calcularEstadoNeuro() {
        try {
            const estadoCentinela = window.centinela?.getEstado?.() || {};
            const stats = await db?.obtenerEstadisticasNeuro?.() || {};
            const progreso = await db?.obtenerTodoProgreso?.() || [];
            
            const fatiga = estadoCentinela.neuroFatiga || 0;
            const eficiencia = stats.eficiencia || 50;
            const racha = await this._calcularRacha(progreso);
            
            let energia = Math.max(0, 100 - fatiga);
            energia = Math.min(100, energia + (racha > 3 ? Math.min(15, racha * 2) : 0));
            
            let foco = Math.round((energia * 0.5) + (eficiencia * 0.5));
            foco = Math.min(100, foco);
            
            return {
                energia: Math.round(energia),
                fatiga: Math.round(fatiga),
                eficiencia: Math.round(eficiencia),
                foco: Math.round(foco),
                racha: racha
            };
        } catch (e) {
            return { energia: 70, fatiga: 20, eficiencia: 50, foco: 60, racha: 0 };
        }
    }

    _actualizarHeaderStats(estado) {
        const rcnEl = document.getElementById('neuroRCN');
        const progressEl = document.getElementById('neuroProgress');
        const eficienciaEl = document.getElementById('neuroEficiencia');
        const faseEl = document.getElementById('neuroFase');
        const nivelEl = document.getElementById('neuroNivel');
        
        if (rcnEl) {
            const rcn = estado ? estado.rcn : 0;
            rcnEl.textContent = rcn.toFixed(1);
            rcnEl.style.color = rcn >= 4 ? 'var(--success)' : rcn >= 2 ? 'var(--warning)' : 'var(--danger)';
        }
        if (progressEl) progressEl.textContent = (estado ? estado.progreso : 0) + '%';
        if (eficienciaEl) {
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo?.() || 'es';
            db?.obtenerEstadisticasNeuro?.(idiomaActivo)
                .then(stats => { if (eficienciaEl) eficienciaEl.textContent = (stats.eficiencia || 0) + '%'; })
                .catch(() => { if (eficienciaEl) eficienciaEl.textContent = '0%'; });
        }
        if (faseEl) faseEl.textContent = estado ? estado.faseActual : 1;
        if (nivelEl) {
            try {
                const infoActivo = window.gestorIdiomas ? window.gestorIdiomas.getInfoActivo?.() : null;
                nivelEl.textContent = infoActivo?.nivel || 'A1';
            } catch (e) {
                nivelEl.textContent = 'A1';
            }
        }
    }

    _actualizarActividad(core) {
        this.core = core || this.core;
        try {
            const vigiaOnline = window.vigia ? window.vigia.enLinea : false;
            const vigiaTurnos = window.vigia ? window.vigia.turnosSinEscaneo : 0;
            const vigiaEscaneando = window.vigia ? window.vigia.escaneoActivo : false;

            let vigiaActivity = 0;
            let vigiaStatus = 'offline';
            let vigiaStatusText = 'Offline';

            if (vigiaOnline) {
                if (vigiaEscaneando) {
                    vigiaActivity = 95 + Math.random() * 5;
                    vigiaStatus = 'busy';
                    vigiaStatusText = '🔍 Escaneando...';
                } else if (vigiaTurnos < 2) {
                    vigiaActivity = 80 + Math.random() * 15;
                    vigiaStatus = 'online';
                    vigiaStatusText = '🟢 Activo';
                } else if (vigiaTurnos < 5) {
                    vigiaActivity = 50 + Math.random() * 25;
                    vigiaStatus = 'online';
                    vigiaStatusText = '🟡 Esperando';
                } else {
                    vigiaActivity = 10 + Math.random() * 20;
                    vigiaStatus = 'online';
                    vigiaStatusText = '🟠 Inactivo';
                }
            } else {
                vigiaActivity = 5 + Math.random() * 5;
                vigiaStatus = 'offline';
                vigiaStatusText = '🔴 Offline';
            }

            this._vigiaActivity = this._vigiaActivity * 0.6 + vigiaActivity * 0.4;
            this._actualizarBarraVigia(this._vigiaActivity, vigiaStatus, vigiaStatusText, vigiaTurnos);

            const centinelaObj = window.centinela || {};
            const estadoSalud = centinelaObj.estadoSalud || 'optimo';
            const modoOffline = centinelaObj.modoOffline || false;
            const neuroFatiga = centinelaObj.contadores ? centinelaObj.contadores.neuroFatiga : 0;

            let centinelaActivity = 0;
            let centinelaStatus = 'activo';
            let centinelaStatusText = '✅ Estable';

            if (modoOffline) {
                centinelaActivity = 10 + Math.random() * 10;
                centinelaStatus = 'offline';
                centinelaStatusText = '🔴 Offline';
            } else if (estadoSalud === 'critico') {
                centinelaActivity = 100;
                centinelaStatus = 'critico';
                centinelaStatusText = '🚨 Crítico';
            } else if (estadoSalud === 'fatiga' || neuroFatiga > 0.5) {
                centinelaActivity = 40 + Math.random() * 20 + neuroFatiga * 40;
                centinelaStatus = 'fatiga';
                centinelaStatusText = '🧠 Fatiga';
            } else if (estadoSalud === 'bajo_rendimiento') {
                centinelaActivity = 30 + Math.random() * 20;
                centinelaStatus = 'fatiga';
                centinelaStatusText = '📉 Bajo rendimiento';
            } else if (estadoSalud === 'estancado') {
                centinelaActivity = 20 + Math.random() * 20;
                centinelaStatus = 'fatiga';
                centinelaStatusText = '🔄 Estancado';
            } else {
                centinelaActivity = 60 + Math.random() * 30 + (1 - neuroFatiga) * 20;
                centinelaStatus = 'activo';
                centinelaStatusText = '✅ Óptimo';
            }

            this._centinelaActivity = this._centinelaActivity * 0.7 + centinelaActivity * 0.3;
            this._actualizarBarraCentinela(this._centinelaActivity, centinelaStatus, centinelaStatusText);

        } catch (e) {
            console.warn('⚠️ Error actualizando actividad:', e);
        }
    }

    _actualizarBarraVigia(activity, status, statusText, turnos) {
        const bar = document.getElementById('vigiaActivityBar');
        const value = document.getElementById('vigiaActivityValue');
        const dot = document.getElementById('vigiaActivityDot');
        const tooltip = document.getElementById('vigiaTooltip');

        if (bar) {
            bar.style.width = Math.min(100, Math.round(activity)) + '%';
            bar.className = 'activity-bar-fill vigia ' + status;
        }
        if (value) value.textContent = Math.round(activity) + '%';
        if (dot) dot.className = 'activity-status-dot ' + status;
        if (tooltip) {
            tooltip.textContent = 'Vigía: ' + statusText + ' | Actividad: ' + Math.round(activity) + '% | Turnos: ' + turnos;
        }
    }

    _actualizarBarraCentinela(activity, status, statusText) {
        const bar = document.getElementById('centinelaActivityBar');
        const value = document.getElementById('centinelaActivityValue');
        const dot = document.getElementById('centinelaActivityDot');
        const tooltip = document.getElementById('centinelaTooltip');

        if (bar) {
            bar.style.width = Math.min(100, Math.round(activity)) + '%';
            bar.className = 'activity-bar-fill centinela ' + status;
        }
        if (value) value.textContent = Math.round(activity) + '%';
        if (dot) dot.className = 'activity-status-dot ' + status;
        if (tooltip) {
            tooltip.textContent = 'Centinela: ' + statusText + ' | Actividad: ' + Math.round(activity) + '%';
        }
    }

    _actualizarBadgeTutor() {
        let badge = document.getElementById('tutorBadge');
        if (!badge) {
            const headerRight = document.querySelector('.header-right');
            if (!headerRight) return;
            
            badge = document.createElement('span');
            badge.id = 'tutorBadge';
            badge.className = 'tutor-badge';
            badge.style.cssText = `
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
                background: var(--primary)15;
                color: var(--primary);
                border: 1px solid var(--primary)30;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-left: 8px;
            `;
            badge.innerHTML = '🧠 Tutor';
            badge.onclick = () => {
                this.irATutorPanel();
            };
            headerRight.appendChild(badge);
        }
        
        if (badge && window.tutorNeuro) {
            try {
                const pendientes = window.tutorNeuro.getIntervencionesPendientes();
                if (pendientes.length > 0) {
                    badge.classList.add('has-intervencion');
                    badge.style.background = 'var(--warning)15';
                    badge.style.borderColor = 'var(--warning)';
                    badge.style.color = 'var(--warning)';
                    badge.innerHTML = `🧠 Tutor (${pendientes.length})`;
                } else {
                    badge.classList.remove('has-intervencion');
                    badge.style.background = 'var(--primary)15';
                    badge.style.borderColor = 'var(--primary)30';
                    badge.style.color = 'var(--primary)';
                    badge.innerHTML = '🧠 Tutor';
                }
            } catch (e) {}
        }
    }

    _actualizarSutil() {
        try {
            const progressEl = document.getElementById('progressFill');
            if (progressEl && pipeline?.frases?.length > 0) {
                const completadas = pipeline.frases.filter(f => 
                    f.progreso?.estado === 'completada' || (f.progreso?.rcn || 0) >= 4
                ).length;
                const pct = Math.round((completadas / pipeline.frases.length) * 100);
                progressEl.style.width = pct + '%';
                const label = document.getElementById('progressLabel');
                if (label) label.textContent = pct + '%';
            }
            
            const rcnEl = document.getElementById('neuroRCN');
            if (rcnEl && pipeline?.estadoNeuro?.rcn !== undefined) {
                rcnEl.textContent = pipeline.estadoNeuro.rcn.toFixed(1);
            }
            
            if (window.tutorNeuro) {
                const pendientes = window.tutorNeuro.getIntervencionesPendientes();
                const badge = document.getElementById('tutorBadge');
                if (badge) {
                    if (pendientes.length > 0) {
                        badge.classList.add('has-intervencion');
                        badge.innerHTML = `🧠 Tutor (${pendientes.length})`;
                    } else {
                        badge.classList.remove('has-intervencion');
                        badge.innerHTML = '🧠 Tutor';
                    }
                }
            }
        } catch (e) {}
    }

    togglePanelNeuro() {
        this._panelExpandido = !this._panelExpandido;
        this._cargarDashboardInicial();
    }

    _getCore() {
        return this.core || window.uiCore;
    }

    _abrirManual() {
        if (window.uiCore) {
            window.uiCore.irAModulo('manual');
        } else {
            console.warn('⚠️ uiCore no disponible para abrir manual');
        }
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UIDashboard = new UIDashboard();

console.log('✅ UIDashboard v25.1 - CORREGIDO CON TARJETA DE TONOS');
console.log('  🚀 Carga en ~200ms con caché');
console.log('  📦 Datos cacheados por 30 segundos');
console.log('  ⚡ Renderizado instantáneo desde el registro');
console.log('  🔄 Throttle para evitar recargas excesivas');
console.log('  🔌 Reconexión automática de Vigia al cargar el dashboard');
console.log('  🎵 Tarjeta "Estudio de Tonos" solo visible para idiomas tonales');
console.log('  🀄 Tarjeta "Caracteres" solo visible para idiomas jeroglíficos');