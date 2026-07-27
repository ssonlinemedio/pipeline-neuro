// ============================================================
// UI CORE v18.11 - COMPLETO CON MÓDULO DE FONÉTICA
// ============================================================

class UICore {
    constructor() {
        this._inicializado = false;
        this._initDone = false;
        this.moduloActual = 'dashboard';
        this._navLock = false;
        this._toastActive = false;
        this.toastTimeout = null;
        this.modalAbierto = false;
        this._actualizandoIndicadores = false;
        this._cargandoDashboard = false;
        this._vigiaInterval = null;
        this._activityInterval = null;
        this._chatMetricsInterval = null;
        this._escapeHandler = null;
        this.MAX_HISTORIAS = 10;
        this.MAX_FRASES_POR_HISTORIA = 10;
        this._eventosConfigurados = false;
        this._moduleNames = {
            'dashboard': 'Dashboard',
            'study': 'Estudiar',
            'grammar': 'Gramática',
            'temas': 'Temas',
            'stories': 'Historias',
            'vigia': 'Vigía IA',
            'stats': 'Estadísticas',
            'tools': 'Herramientas',
            'config': 'Configuración',
            'espacio': 'Mi Espacio',
            'competiciones': '🏆 Liga Neuro',
            'caracteres': '🀄 Caracteres',
            'fonetica': '🎤 Fonética',
            'neuro': '🧠 Estado Neuro',
            'familias': '🧠 Familias de Caracteres'
        };
        
        this._cargaCompletada = false;
        this._esperandoDatos = false;
        this._intentosCarga = 0;
        this._maxIntentosCarga = 15;
        this._cargaTimeout = null;
        
        this._dialogs = new UIDialogs();
        try {
            this._dialogs._crearDialogPersonalizado();
        } catch (e) {
            console.warn('⚠️ Error creando diálogos:', e);
        }
        
        this._IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        
        this._vigiaActivity = 0;
        this._centinelaActivity = 0;
    }

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._IDIOMAS_JEROGLIFICOS.some(item => 
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
    }

    async init() {
        if (this._initDone || this._inicializado) return this;
        
        console.log('🎨 Inicializando UI Core v18.11...');
        
        try {
            this._esperandoDatos = true;
            console.log('⏳ Esperando que los datos estén cargados...');
            
            const datosCargados = await this._esperarDatosCargados();
            this._esperandoDatos = false;
            
            if (!datosCargados) {
                console.warn('⚠️ Timeout esperando datos, continuando de todas formas');
            } else {
                console.log('✅ Datos cargados correctamente');
            }
            
            if (!this._dialogs) {
                this._dialogs = new UIDialogs();
                this._dialogs._crearDialogPersonalizado();
            }
            
            await this._initSubmodulos();
            
            this._configurarEventos();
            this._crearModales();
            this._iniciarIndicadoresHeader();
            this._iniciarActividad();
            this._configurarModoInverso();
            
            setTimeout(() => {
                this._renderizarBarraVigiaCentinela();
            }, 500);
            
            if (!this._eventosConfigurados) {
                this._configurarEventosIdiomas();
                this._eventosConfigurados = true;
            }
            
            this._inicializarToastEducativo();
            this._registrarModuloCompeticiones();
            this._registrarModuloCaracteres();
            this._registrarModuloFonetica();
            
            setTimeout(() => {
                this._actualizarIndicadoresSeguro();
                this._actualizarActividad();
                this._actualizarModoInversoBtn();
                this._actualizarEspacioStats();
                this._actualizarBotonFamiliaCaracteres();
                this._cargaCompletada = true;
                console.log('✅ UI Core: Actualización inicial completada');
            }, 500);
            
            this._inicializado = true;
            this._initDone = true;
            console.log('🎨 UI Core v18.11: Inicializada correctamente');
        } catch (e) {
            console.warn('⚠️ UI Core init parcial:', e);
            this._inicializado = true;
            this._initDone = true;
        }
        
        return this;
    }

    // ============================================================
    // REGISTRAR MÓDULO DE FONÉTICA
    // ============================================================

    _registrarModuloFonetica() {
        console.log('🎤 Registrando módulo de Fonética...');
        
        if (!window.UIFonetica) {
            console.warn('⚠️ UIFonética no encontrado, intentando registrar más tarde...');
            setTimeout(() => {
                if (window.UIFonetica) {
                    console.log('🎤 UIFonética encontrado, registrando...');
                    this._registrarModuloFonetica();
                }
            }, 1000);
            return;
        }
        
        this._moduleNames['fonetica'] = '🎤 Fonética';
        
        try {
            if (typeof window.UIFonetica.init === 'function') {
                window.UIFonetica.init(this);
                console.log('✅ UIFonética inicializado correctamente');
            } else {
                console.warn('⚠️ UIFonética no tiene método init()');
            }
        } catch (e) {
            console.warn('⚠️ Error inicializando UIFonética:', e.message);
        }
    }

    irAFonetica() {
        this.irAModulo('fonetica');
    }

    // ============================================================
    // REGISTRAR MÓDULO DE CARACTERES
    // ============================================================

    _registrarModuloCaracteres() {
        console.log('🀄 Registrando módulo de caracteres...');
        
        if (!window.UICaracteres) {
            console.warn('⚠️ UICaracteres no encontrado, intentando registrar más tarde...');
            setTimeout(() => {
                if (window.UICaracteres) {
                    console.log('🀄 UICaracteres encontrado, registrando...');
                    this._registrarModuloCaracteres();
                }
            }, 1000);
            return;
        }
        
        this._moduleNames['caracteres'] = '🀄 Caracteres';
        
        try {
            if (typeof window.UICaracteres.init === 'function') {
                window.UICaracteres.init(this);
                console.log('✅ UICaracteres inicializado correctamente');
            } else {
                console.warn('⚠️ UICaracteres no tiene método init()');
            }
        } catch (e) {
            console.warn('⚠️ Error inicializando UICaracteres:', e.message);
        }
    }

    irACaracteres() {
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        if (!this._esJeroglifico(idioma)) {
            this.mostrarToast(`⚠️ El idioma "${idioma}" no es jeroglífico. Este módulo solo está disponible para idiomas asiáticos.`, 'warning');
            return;
        }
        this.irAModulo('caracteres');
    }

    _actualizarBotonFamiliaCaracteres() {
        const btn = document.getElementById('btnGenerarFamiliaCaracteres');
        if (btn) {
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            const esJeroglifico = this._esJeroglifico(idiomaActivo);
            btn.style.display = esJeroglifico ? 'inline-flex' : 'none';
        }
    }

    // ============================================================
    // REGISTRAR MÓDULO DE COMPETICIONES
    // ============================================================

    _registrarModuloCompeticiones() {
        console.log('🏆 Registrando módulo de competiciones...');
        
        if (!window.SistemaCompeticiones) {
            console.warn('⚠️ SistemaCompeticiones no encontrado, intentando registrar más tarde...');
            setTimeout(() => {
                if (window.SistemaCompeticiones) {
                    console.log('🏆 SistemaCompeticiones encontrado, registrando...');
                    this._registrarModuloCompeticiones();
                }
            }, 1000);
            return;
        }
        
        this._moduleNames['competiciones'] = '🏆 Liga Neuro';
        
        try {
            if (typeof window.SistemaCompeticiones.init === 'function') {
                window.SistemaCompeticiones.init(this);
                console.log('✅ SistemaCompeticiones inicializado correctamente');
            } else {
                console.warn('⚠️ SistemaCompeticiones no tiene método init()');
            }
        } catch (e) {
            console.warn('⚠️ Error inicializando SistemaCompeticiones:', e.message);
        }
    }

    // ============================================================
    // ESPERAR DATOS CARGADOS
    // ============================================================

    async _esperarDatosCargados() {
        return new Promise((resolve) => {
            if (this._cargaCompletada) {
                console.log('✅ Datos ya cargados');
                resolve(true);
                return;
            }
            
            if (window.app && window.app._datosCargados) {
                this._cargaCompletada = true;
                console.log('✅ Datos cargados (app._datosCargados)');
                resolve(true);
                return;
            }
            
            try {
                const usuario = localStorage.getItem('pipeline_usuario');
                if (usuario) {
                    const parsed = JSON.parse(usuario);
                    if (parsed && parsed.nombre) {
                        console.log('📦 Usuario encontrado en localStorage, datos disponibles');
                        this._cargaCompletada = true;
                        resolve(true);
                        return;
                    }
                }
            } catch (e) {}
            
            this._cargaTimeout = setTimeout(() => {
                console.warn('⚠️ Timeout esperando datos (15s)');
                resolve(false);
            }, 15000);
            
            let intentos = 0;
            const checkInterval = setInterval(() => {
                intentos++;
                
                if (window.app && window.app._datosCargados) {
                    this._cargaCompletada = true;
                    clearInterval(checkInterval);
                    clearTimeout(this._cargaTimeout);
                    console.log('✅ Datos cargados después de ' + intentos + ' intentos');
                    resolve(true);
                } else if (intentos >= this._maxIntentosCarga) {
                    console.warn('⚠️ Máximo de intentos alcanzado (' + this._maxIntentosCarga + ')');
                    clearInterval(checkInterval);
                    clearTimeout(this._cargaTimeout);
                    resolve(false);
                }
            }, 500);
        });
    }

    // ============================================================
    // INICIALIZAR SUBMÓDULOS
    // ============================================================

    async _initSubmodulos() {
        console.log('🔄 Inicializando sub-módulos UI...');
        
        const submodulos = [
            { name: 'UIDashboard', obj: window.UIDashboard },
            { name: 'UIStudy', obj: window.UIStudy },
            { name: 'UIGrammar', obj: window.UIGrammar },
            { name: 'UITemas', obj: window.UITemas },
            { name: 'UIChat', obj: window.UIChat },
            { name: 'UIConfig', obj: window.UIConfig },
            { name: 'UITools', obj: window.UITools },
            { name: 'UIJSON', obj: window.UIJSON },
            { name: 'UIEspacio', obj: window.UIEspacio },
            { name: 'SistemaCompeticiones', obj: window.SistemaCompeticiones },
            { name: 'UICaracteres', obj: window.UICaracteres },
            { name: 'UIFonetica', obj: window.UIFonetica }
        ];
        
        for (const mod of submodulos) {
            try {
                if (mod.obj && typeof mod.obj.init === 'function') {
                    await mod.obj.init(this);
                    console.log(`  ✅ ${mod.name} inicializado`);
                } else if (mod.obj) {
                    console.log(`  ⚠️ ${mod.name} no tiene init()`);
                } else {
                    console.log(`  ⚠️ ${mod.name} no disponible`);
                }
            } catch (e) {
                console.warn(`  ⚠️ Error inicializando ${mod.name}:`, e.message);
            }
        }
        
        console.log('✅ Sub-módulos UI inicializados');
    }

    // ============================================================
    // TOAST EDUCATIVO
    // ============================================================

    _inicializarToastEducativo() {
        if (window.toastEducativo) {
            console.log('📚 Toast Educativo Proactivo activado');
            window.addEventListener('reiniciarToasts', () => {
                if (window.toastEducativo) {
                    window.toastEducativo.reiniciar();
                    this.mostrarToast('📚 Consejos educativos reiniciados', 'info');
                }
            });
            console.log('💡 Para reiniciar los toasters educativos: window.dispatchEvent(new Event("reiniciarToasts"))');
        } else {
            console.warn('⚠️ Toast Educativo no disponible');
        }
    }

    // ============================================================
    // ACTUALIZAR ESPACIO STATS
    // ============================================================

    async _actualizarEspacioStats() {
        try {
            if (!window.gestorFavoritos) {
                console.warn('⚠️ gestorFavoritos no disponible para actualizar stats');
                return;
            }
            const stats = await window.gestorFavoritos.contarFavoritos();
            const meta = document.getElementById('dashEspacioMeta');
            const progress = document.getElementById('dashEspacioProgress');
            if (meta) {
                meta.textContent = `${stats.frases} frases · ${stats.palabras} palabras`;
            }
            if (progress) {
                const total = stats.frases + stats.palabras;
                const pct = Math.min(100, Math.round((total / 100) * 100));
                progress.style.width = pct + '%';
            }
        } catch (e) {
            console.warn('⚠️ Error actualizando stats de Mi Espacio:', e);
        }
    }

    // ============================================================
    // DIÁLOGOS
    // ============================================================

    async alert(message, title) {
        if (!this._dialogs) {
            console.warn('⚠️ _dialogs es null, creando...');
            this._dialogs = new UIDialogs();
            try {
                this._dialogs._crearDialogPersonalizado();
            } catch (e) {
                console.warn('⚠️ Error creando diálogo de emergencia:', e);
                alert(message);
                return;
            }
        }
        return this._dialogs.alert(message, title);
    }

    async confirm(message, title) {
        if (!this._dialogs) {
            console.warn('⚠️ _dialogs es null, creando...');
            this._dialogs = new UIDialogs();
            try {
                this._dialogs._crearDialogPersonalizado();
            } catch (e) {
                console.warn('⚠️ Error creando diálogo de emergencia:', e);
                return confirm(message);
            }
        }
        return this._dialogs.confirm(message, title);
    }

    async prompt(message, defaultValue, placeholder, title) {
        if (!this._dialogs) {
            console.warn('⚠️ _dialogs es null, creando...');
            this._dialogs = new UIDialogs();
            try {
                this._dialogs._crearDialogPersonalizado();
            } catch (e) {
                console.warn('⚠️ Error creando diálogo de emergencia:', e);
                return prompt(message, defaultValue);
            }
        }
        return this._dialogs.prompt(message, defaultValue, placeholder, title);
    }

    mostrarToast(mensaje, tipo) {
        if (this._toastActive) return;
        this._toastActive = true;
        
        try {
            const existing = document.querySelector('.toast');
            if (existing) existing.remove();
            if (this.toastTimeout) {
                clearTimeout(this.toastTimeout);
                this.toastTimeout = null;
            }

            const toast = document.createElement('div');
            toast.className = 'toast ' + (tipo || 'info');
            toast.textContent = mensaje || '';
            document.body.appendChild(toast);

            this.toastTimeout = setTimeout(() => {
                if (toast && toast.parentNode) toast.remove();
                this._toastActive = false;
                this.toastTimeout = null;
            }, 3000);

            toast.onclick = () => {
                if (toast && toast.parentNode) toast.remove();
                if (this.toastTimeout) {
                    clearTimeout(this.toastTimeout);
                    this.toastTimeout = null;
                }
                this._toastActive = false;
            };
        } catch (e) {
            console.warn('⚠️ Error en toast:', e);
            this._toastActive = false;
        }
    }

    // ============================================================
    // NAVEGACIÓN
    // ============================================================

    irAModulo(module) {
        if (!this._navLock && module) {
            this._navLock = true;
            this._irAModulo(module);
            setTimeout(() => { this._navLock = false; }, 300);
        }
    }

    volverDashboard() {
        if (!this._navLock) {
            this._navLock = true;
            this._irADashboard();
            setTimeout(() => { this._navLock = false; }, 300);
        }
    }

    _irAModulo(module) {
        if (!module || module === 'dashboard') {
            this._irADashboard();
            return;
        }
        
        console.log('🔀 Navegando a módulo:', module);
        
        if (module === 'neuro') {
            console.log('ℹ️ Módulo "neuro" es solo una tarjeta, no un módulo navegable');
            return;
        }
        
        document.querySelectorAll('.view, .module-view').forEach(el => {
            el.classList.remove('active');
        });
        
        let moduleEl = document.getElementById(module + 'Module');
        if (!moduleEl) {
            moduleEl = document.createElement('div');
            moduleEl.id = module + 'Module';
            moduleEl.className = 'module-view';
            moduleEl.innerHTML = `
                <div class="module-header">
                    <button class="btn-back" onclick="window.uiCore.volverDashboard()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="module-title">
                        <h2>${this._getModuleName(module)}</h2>
                        <span class="module-breadcrumb">Dashboard / ${this._getModuleName(module)}</span>
                    </div>
                </div>
                <div class="module-content" id="${module}Content">
                </div>
            `;
            document.getElementById('mainContent').appendChild(moduleEl);
        }
        
        moduleEl.classList.add('active');
        this.moduloActual = module;
        this._actualizarBreadcrumb(module);
        this._cargarContenidoModulo(module);
    }

    _getModuleName(module) {
        return this._moduleNames[module] || module;
    }

    _irADashboard() {
        console.log('🔀 Navegando a Dashboard');
        
        document.querySelectorAll('.view, .module-view').forEach(el => {
            el.classList.remove('active');
        });
        
        const dashboard = document.getElementById('dashboardView');
        if (dashboard) {
            dashboard.classList.add('active');
            this.moduloActual = 'dashboard';
            this._actualizarBreadcrumb('dashboard');
            setTimeout(() => this._cargarDashboardInicial(), 100);
        }
    }

    _actualizarBreadcrumb(module) {
        const breadcrumb = document.getElementById('breadcrumbModule');
        if (breadcrumb) {
            breadcrumb.textContent = this._getModuleName(module);
            
            document.querySelectorAll('.breadcrumb-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.module === module) {
                    item.classList.add('active');
                }
            });
        }
    }

    _cargarContenidoModulo(module) {
        try {
            switch(module) {
                case 'study':
                    if (window.UIStudy) window.UIStudy.cargar(this);
                    break;
                case 'grammar':
                    if (window.UIGrammar) window.UIGrammar.cargar(this);
                    break;
                case 'temas':
                    if (window.UITemas) window.UITemas.cargar(this);
                    break;
                case 'stories':
                    if (window.UITemas) window.UITemas.cargarHistorias(this);
                    break;
                case 'stats':
                    if (window.UIDashboard) window.UIDashboard.cargarEstadisticas(this);
                    break;
                case 'vigia':
                    if (window.UIChat) window.UIChat.cargar(this);
                    break;
                case 'config':
                    if (window.UIConfig) window.UIConfig.cargar(this);
                    break;
                case 'tools':
                    if (window.UITools) window.UITools.cargar(this);
                    break;
                case 'espacio':
                    if (window.UIEspacio) window.UIEspacio.cargar(this);
                    break;
                case 'competiciones':
                    if (window.SistemaCompeticiones && typeof window.SistemaCompeticiones.cargar === 'function') {
                        window.SistemaCompeticiones.cargar(this);
                    } else {
                        console.warn('⚠️ SistemaCompeticiones no disponible');
                        this.mostrarToast('⚠️ Módulo de competiciones no disponible. Revisa la consola.', 'error');
                        this._registrarModuloCompeticiones();
                        setTimeout(() => {
                            if (!window.SistemaCompeticiones) {
                                this.mostrarToast('❌ Módulo de competiciones no cargado. Recarga la página.', 'error');
                            }
                        }, 1000);
                    }
                    break;
                case 'caracteres':
                    if (window.UICaracteres) {
                        window.UICaracteres.cargar(this);
                    } else {
                        console.warn('⚠️ UICaracteres no disponible');
                        this.mostrarToast('⚠️ Módulo de caracteres no disponible. Revisa la consola.', 'error');
                    }
                    break;
                case 'fonetica':
                    if (window.UIFonetica) {
                        window.UIFonetica.cargar(this);
                    } else {
                        console.warn('⚠️ UIFonética no disponible');
                        this.mostrarToast('⚠️ Módulo de fonética no disponible. Revisa la consola.', 'error');
                    }
                    break;
                default:
                    console.warn('⚠️ Módulo desconocido:', module);
            }
        } catch (e) {
            console.warn('⚠️ Error cargando módulo:', module, e);
        }
    }

    // ============================================================
    // CONFIGURAR EVENTOS DE IDIOMAS
    // ============================================================

    _configurarEventosIdiomas() {
        console.log('🔗 Configurando eventos de sincronización de idiomas...');
        
        window.addEventListener('idiomaCambiado', async (e) => {
            console.log('🔄 UI Core: Idioma cambiado a', e.detail?.idioma);
            this._actualizarIndicadoresSeguro();
            this._actualizarEspacioStats();
            this._actualizarBotonFamiliaCaracteres();
            this._actualizarBarraVigiaCentinela();
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this);
            }
            if (window.UIStudy) {
                window.UIStudy._renderizarFraseInteractiva();
            }
            if (window.UIConfig && window.UIConfig._recargarConfiguracion) {
                await window.UIConfig._recargarConfiguracion();
            }
            if (window.vigiaGramatical) {
                try {
                    await window.vigiaGramatical.initGramatical();
                    await window.vigiaGramatical._actualizarEdadGramatical(e.detail?.idioma);
                } catch (err) {}
            }
            if (window.SistemaCompeticiones && typeof window.SistemaCompeticiones._renderizarPanel === 'function') {
                if (this.moduloActual === 'competiciones') {
                    window.SistemaCompeticiones._renderizarPanel();
                }
            }
            if (window.UICaracteres && window.UICaracteres.estaDisponible()) {
                try {
                    await window.UICaracteres.cargar(this);
                } catch (err) {}
            }
            if (window.UIFonetica) {
                try {
                    await window.UIFonetica.cargar(this);
                } catch (err) {}
            }
        });
        
        window.addEventListener('favoritoActualizado', () => {
            this._actualizarEspacioStats();
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this);
            }
        });
        
        window.addEventListener('idiomaAgregado', async (e) => {
            console.log('🔄 UI Core: Idioma agregado', e.detail?.idioma);
            await this._recargarConfiguracionUI();
        });
        
        window.addEventListener('idiomaEliminado', async (e) => {
            console.log('🔄 UI Core: Idioma eliminado', e.detail?.idioma);
            await this._recargarConfiguracionUI();
        });
        
        window.addEventListener('nivelIdiomaCambiado', async (e) => {
            console.log('🔄 UI Core: Nivel cambiado', e.detail?.idioma, e.detail?.nivel);
            this._actualizarIndicadoresSeguro();
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this);
            }
            if (window.UIConfig && window.UIConfig._recargarConfiguracion) {
                await window.UIConfig._recargarConfiguracion();
            }
            if (window.SistemaCompeticiones && typeof window.SistemaCompeticiones._renderizarPanel === 'function') {
                if (this.moduloActual === 'competiciones') {
                    window.SistemaCompeticiones._renderizarPanel();
                }
            }
            if (window.UICaracteres && window.UICaracteres.estaDisponible()) {
                try {
                    await window.UICaracteres.cargar(this);
                } catch (err) {}
            }
            if (window.UIFonetica) {
                try {
                    await window.UIFonetica.cargar(this);
                } catch (err) {}
            }
        });
        
        window.addEventListener('vigiaGramaticalActualizado', () => {
            if (window.UIGrammar) {
                window.UIGrammar._cargarGramatica();
            }
        });
        
        console.log('✅ Eventos de sincronización configurados');
    }

    async _recargarConfiguracionUI() {
        console.log('🔄 UI Core: Recargando configuración...');
        try {
            await gestorIdiomas._cargarIdiomas();
            
            if (window.UIConfig && window.UIConfig._recargarConfiguracion) {
                await window.UIConfig._recargarConfiguracion();
            }
            
            this._actualizarIndicadoresSeguro();
            this._actualizarEspacioStats();
            this._actualizarBotonFamiliaCaracteres();
            this._actualizarBarraVigiaCentinela();
            
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this);
            }
            
            if (window.UIStudy && this.moduloActual === 'study') {
                window.UIStudy._renderizarFraseInteractiva();
            }
            
            if (window.vigiaGramatical) {
                try {
                    await window.vigiaGramatical.initGramatical();
                } catch (err) {}
            }
            
            if (window.SistemaCompeticiones && typeof window.SistemaCompeticiones._renderizarPanel === 'function') {
                if (this.moduloActual === 'competiciones') {
                    window.SistemaCompeticiones._renderizarPanel();
                }
            }
            
            if (window.UICaracteres && window.UICaracteres.estaDisponible()) {
                try {
                    await window.UICaracteres.cargar(this);
                } catch (err) {}
            }
            
            if (window.UIFonetica) {
                try {
                    await window.UIFonetica.cargar(this);
                } catch (err) {}
            }
            
            console.log('✅ UI Core: Configuración recargada');
        } catch (e) {
            console.warn('⚠️ Error recargando configuración:', e);
        }
    }

    // ============================================================
    // MODALES
    // ============================================================

    abrirModal(titulo) {
        const modal = document.getElementById('jsonModal');
        const title = document.getElementById('jsonModalTitle');
        if (modal && title) {
            title.textContent = titulo || 'JSON';
            modal.classList.add('open');
            this.modalAbierto = true;
            console.log('📂 Modal abierto:', titulo);
        }
    }

    cerrarModal() {
        const modal = document.getElementById('jsonModal');
        if (modal) {
            modal.classList.remove('open');
            this.modalAbierto = false;
            console.log('📂 Modal cerrado');
        }
    }

    _crearModales() {
        console.log('🔧 Configurando modales...');
        
        const closeBtn = document.getElementById('jsonModalClose');
        const modal = document.getElementById('jsonModal');
        
        if (closeBtn) {
            const parent = closeBtn.parentNode;
            const newCloseBtn = document.createElement('button');
            newCloseBtn.className = 'modal-close';
            newCloseBtn.id = 'jsonModalClose';
            newCloseBtn.innerHTML = '&times;';
            newCloseBtn.setAttribute('aria-label', 'Cerrar modal');
            
            parent.replaceChild(newCloseBtn, closeBtn);
            
            newCloseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.cerrarModal();
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.cerrarModal();
                }
            });
        }
        
        if (this._escapeHandler) {
            document.removeEventListener('keydown', this._escapeHandler);
        }
        
        this._escapeHandler = (e) => {
            if (e.key === 'Escape' && this.modalAbierto) {
                this.cerrarModal();
            }
        };
        document.addEventListener('keydown', this._escapeHandler);
        
        console.log('✅ Modales configurados correctamente');
    }

    // ============================================================
    // CONFIGURAR EVENTOS GENERALES
    // ============================================================

    _configurarEventos() {
        document.querySelectorAll('.dash-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const module = card.dataset.module;
                if (module && !this._navLock) {
                    this._navLock = true;
                    this._irAModulo(module);
                    setTimeout(() => { this._navLock = false; }, 300);
                }
            });
        });
        
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this._navLock) {
                    this._navLock = true;
                    this._irADashboard();
                    setTimeout(() => { this._navLock = false; }, 300);
                }
            });
        });
        
        document.querySelectorAll('.breadcrumb-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const module = item.dataset.module;
                if (module && !this._navLock) {
                    this._navLock = true;
                    if (module === 'dashboard') {
                        this._irADashboard();
                    } else {
                        this._irAModulo(module);
                    }
                    setTimeout(() => { this._navLock = false; }, 300);
                }
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modalAbierto) {
                if (this.moduloActual !== 'dashboard' && !this._navLock) {
                    this._navLock = true;
                    this._irADashboard();
                    setTimeout(() => { this._navLock = false; }, 300);
                }
            }
        });
        
        window.addEventListener('toast', (e) => {
            this.mostrarToast(e.detail.mensaje, e.detail.tipo);
        });
        
        window.addEventListener('modoOffline', (e) => {
            this._mostrarOfflineBanner(e.detail);
        });
        
        window.addEventListener('modoOnline', () => {
            this._ocultarOfflineBanner();
            this._actualizarIndicadoresSeguro();
            this._actualizarBarraVigiaCentinela();
        });
        
        window.addEventListener('vigiaEstado', () => {
            this._actualizarIndicadoresSeguro();
            this._actualizarBarraVigiaCentinela();
        });
        
        window.addEventListener('cambioNivel', () => {
            if (window.UIConfig) window.UIConfig._actualizarNivelHeader(this);
            if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this);
        });

        window.addEventListener('modoInversoChange', () => {
            this._actualizarModoInversoBtn();
            if (window.UIStudy) {
                window.UIStudy._renderizarFraseInteractiva();
            }
        });
        
        window.addEventListener('actividadActualizada', () => {
            this._actualizarBarraVigiaCentinela();
        });
    }

    // ============================================================
    // INDICADORES HEADER
    // ============================================================

    _iniciarIndicadoresHeader() {
        const brand = document.querySelector('.brand');
        if (!brand) return;
        
        if (!document.getElementById('vigiaIndicator')) {
            const vigiaIndicator = document.createElement('div');
            vigiaIndicator.id = 'vigiaIndicator';
            vigiaIndicator.className = 'vigia-indicator';
            vigiaIndicator.innerHTML = `
                <div class="vigia-dot" id="vigiaDot"></div>
                <span class="vigia-label">Vigía</span>
                <span class="vigia-status" id="vigiaStatus">● Offline</span>
            `;
            brand.appendChild(vigiaIndicator);
        }
        
        if (!document.getElementById('centinelaIndicator')) {
            const centinelaIndicator = document.createElement('div');
            centinelaIndicator.id = 'centinelaIndicator';
            centinelaIndicator.className = 'centinela-indicator';
            centinelaIndicator.innerHTML = `
                <div class="centinela-dot" id="centinelaDot"></div>
                <span class="centinela-label">Centinela</span>
                <span class="centinela-status" id="centinelaStatus">● Activo</span>
            `;
            brand.appendChild(centinelaIndicator);
        }
        
        const existingSelector = document.getElementById('idiomaSelectorWrapper');
        if (existingSelector) existingSelector.remove();
        
        this._actualizarIndicadoresSeguro();
        
        if (this._vigiaInterval) clearInterval(this._vigiaInterval);
        this._vigiaInterval = setInterval(() => {
            this._actualizarIndicadoresSeguro();
            this._actualizarBarraVigiaCentinela();
        }, 3000);
    }

    _actualizarIndicadoresSeguro() {
        if (this._actualizandoIndicadores) return;
        this._actualizandoIndicadores = true;
        
        try {
            const vigiaDot = document.getElementById('vigiaDot');
            const vigiaStatus = document.getElementById('vigiaStatus');
            if (vigiaDot) {
                const enLinea = window.vigia ? window.vigia.enLinea : false;
                vigiaDot.className = 'vigia-dot ' + (enLinea ? 'online' : 'offline');
                if (vigiaStatus) {
                    vigiaStatus.textContent = enLinea ? '● Online' : '● Offline';
                    vigiaStatus.className = 'vigia-status ' + (enLinea ? 'online' : 'offline');
                }
            }
            
            const centinelaDot = document.getElementById('centinelaDot');
            const centinelaStatus = document.getElementById('centinelaStatus');
            if (centinelaDot) {
                const centinelaObj = window.centinela || {};
                const estado = centinelaObj.estadoSalud || 'optimo';
                const modoOffline = centinelaObj.modoOffline || false;
                
                centinelaDot.className = 'centinela-dot';
                if (modoOffline) {
                    centinelaDot.classList.add('offline');
                    if (centinelaStatus) {
                        centinelaStatus.textContent = '● Offline';
                        centinelaStatus.className = 'centinela-status offline';
                    }
                } else if (estado === 'optimo') {
                    centinelaDot.classList.add('activo');
                    if (centinelaStatus) {
                        centinelaStatus.textContent = '● Activo';
                        centinelaStatus.className = 'centinela-status activo';
                    }
                } else if (estado === 'fatiga' || estado === 'bajo_rendimiento') {
                    centinelaDot.classList.add('fatiga');
                    if (centinelaStatus) {
                        centinelaStatus.textContent = '● Fatiga';
                        centinelaStatus.className = 'centinela-status fatiga';
                    }
                } else if (estado === 'estancado') {
                    centinelaDot.classList.add('fatiga');
                    if (centinelaStatus) {
                        centinelaStatus.textContent = '● Estancado';
                        centinelaStatus.className = 'centinela-status fatiga';
                    }
                } else {
                    centinelaDot.classList.add('activo');
                    if (centinelaStatus) {
                        centinelaStatus.textContent = '● Activo';
                        centinelaStatus.className = 'centinela-status activo';
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ Error actualizando indicadores:', e);
        } finally {
            this._actualizandoIndicadores = false;
        }
    }

    actualizarIndicadores() {
        this._actualizarIndicadoresSeguro();
    }

    // ============================================================
    // MODO INVERSO
    // ============================================================

    _configurarModoInverso() {
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;
        
        const existingWrapper = document.getElementById('idiomaSelectorWrapper');
        if (existingWrapper) existingWrapper.remove();
        
        if (!document.getElementById('modoInversoBtn')) {
            const modoBtn = document.createElement('button');
            modoBtn.id = 'modoInversoBtn';
            modoBtn.className = 'icon-btn';
            modoBtn.title = 'Alternar modo inverso';
            modoBtn.style.cssText = `
                padding: 4px 8px;
                background: none;
                border: none;
                color: var(--gray);
                cursor: pointer;
                font-size: 16px;
                border-radius: 4px;
                transition: all 0.3s ease;
            `;
            modoBtn.innerHTML = '<i class="fas fa-exchange-alt"></i>';
            
            modoBtn.addEventListener('click', () => {
                const activo = modoInverso.toggle();
                this.mostrarToast(
                    activo ? '🔄 Modo Inverso: Traduces al idioma objetivo' : '🔄 Modo Normal: Traduces al idioma nativo',
                    'info'
                );
                this._actualizarModoInversoBtn();
                if (window.UIStudy) {
                    window.UIStudy._renderizarFraseInteractiva();
                }
            });
            
            headerRight.appendChild(modoBtn);
            this._actualizarModoInversoBtn();
        }
    }

    _actualizarModoInversoBtn() {
        const btn = document.getElementById('modoInversoBtn');
        if (!btn) return;
        const activo = modoInverso.isActivo();
        btn.style.color = activo ? 'var(--secondary)' : 'var(--gray)';
        btn.style.background = activo ? 'var(--secondary)20' : 'transparent';
        btn.title = activo ? 'Modo Inverso activado' : 'Modo Normal';
        if (activo) {
            btn.style.border = '1px solid var(--secondary)';
        } else {
            btn.style.border = 'none';
        }
    }

    // ============================================================
    // ACTIVIDAD
    // ============================================================

    _iniciarActividad() {
        if (this._activityInterval) clearInterval(this._activityInterval);
        this._activityInterval = setInterval(() => {
            this._actualizarActividad();
        }, 1500);
        this._actualizarActividad();
    }

    _actualizarActividad() {
        try {
            if (window.UIDashboard && typeof window.UIDashboard._actualizarActividad === 'function') {
                window.UIDashboard._actualizarActividad(this);
                return;
            }
            
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

            const vigiaBar = document.getElementById('vigiaActivityBar');
            const vigiaValue = document.getElementById('vigiaActivityValue');
            const vigiaDot = document.getElementById('vigiaActivityDot');
            const vigiaTooltip = document.getElementById('vigiaTooltip');

            if (vigiaBar) {
                vigiaBar.style.width = Math.min(100, Math.round(vigiaActivity)) + '%';
                vigiaBar.className = 'activity-bar-fill vigia ' + vigiaStatus;
            }
            if (vigiaValue) vigiaValue.textContent = Math.round(vigiaActivity) + '%';
            if (vigiaDot) vigiaDot.className = 'activity-status-dot ' + vigiaStatus;
            if (vigiaTooltip) {
                vigiaTooltip.textContent = 'Vigía: ' + vigiaStatusText + ' | Actividad: ' + Math.round(vigiaActivity) + '% | Turnos: ' + vigiaTurnos;
            }

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

            const centinelaBar = document.getElementById('centinelaActivityBar');
            const centinelaValue = document.getElementById('centinelaActivityValue');
            const centinelaDot = document.getElementById('centinelaActivityDot');
            const centinelaTooltip = document.getElementById('centinelaTooltip');

            if (centinelaBar) {
                centinelaBar.style.width = Math.min(100, Math.round(centinelaActivity)) + '%';
                centinelaBar.className = 'activity-bar-fill centinela ' + centinelaStatus;
            }
            if (centinelaValue) centinelaValue.textContent = Math.round(centinelaActivity) + '%';
            if (centinelaDot) centinelaDot.className = 'activity-status-dot ' + centinelaStatus;
            if (centinelaTooltip) {
                centinelaTooltip.textContent = 'Centinela: ' + centinelaStatusText + ' | Actividad: ' + Math.round(centinelaActivity) + '%';
            }

            if (window.UIDashboard) {
                window.UIDashboard._vigiaActivity = vigiaActivity;
                window.UIDashboard._centinelaActivity = centinelaActivity;
            }

            window.dispatchEvent(new CustomEvent('actividadActualizada', {
                detail: {
                    vigia: { activity: vigiaActivity, status: vigiaStatus },
                    centinela: { activity: centinelaActivity, status: centinelaStatus }
                }
            }));

        } catch (e) {
            console.warn('⚠️ Error actualizando actividad:', e);
        }
    }

    // ============================================================
    // OFFLINE BANNER
    // ============================================================

    _mostrarOfflineBanner(detail) {
        const banner = document.getElementById('offlineBanner');
        const message = document.getElementById('offlineMessage');
        const timer = document.getElementById('offlineTimer');
        if (banner) {
            banner.style.display = 'flex';
            if (message) message.textContent = detail.razon || 'Modo offline';
            if (timer && detail.duracion) {
                const segundos = Math.round(detail.duracion / 1000);
                timer.textContent = segundos + 's';
                let contador = segundos;
                const interval = setInterval(() => {
                    contador--;
                    if (contador <= 0) {
                        clearInterval(interval);
                        this._ocultarOfflineBanner();
                    } else {
                        if (timer) timer.textContent = contador + 's';
                    }
                }, 1000);
            }
        }
    }

    _ocultarOfflineBanner() {
        const banner = document.getElementById('offlineBanner');
        if (banner) banner.style.display = 'none';
    }

    // ============================================================
    // COLOR DE FAMILIA
    // ============================================================

    _getColorFamilia(familia) {
        const colores = {
            'verbo': '#6C5CE7', 'verbos': '#6C5CE7',
            'verbos de movimiento': '#6C5CE7', 'verbos de acción': '#6C5CE7',
            'verbos de deseo': '#6C5CE7', 'verbos de comunicación': '#6C5CE7',
            'sustantivo': '#00B894', 'sustantivos': '#00B894',
            'adjetivo': '#FDCB6E', 'adjetivos': '#FDCB6E',
            'adverbio': '#74B9FF', 'adverbios': '#74B9FF',
            'preposición': '#FF7675', 'preposiciones': '#FF7675',
            'conjunción': '#A29BFE', 'conjunciones': '#A29BFE',
            'pronombres': '#55EFC4', 'pronombre': '#55EFC4',
            'tiempo': '#0984E3',
            'comida y bebida': '#E17055', 'comida': '#E17055',
            'profesiones': '#6C5CE7', 'personas': '#6C5CE7',
            'medidas': '#00CEC9', 'clasificador': '#00CEC9',
            'gramática': '#636E72', 'partícula': '#636E72',
            'expresiones': '#FDCB6E', 'conectores': '#74B9FF',
            'sentidos': '#FD79A8', 'cualidades': '#FD79A8',
            'dinero': '#00B894', 'hogar': '#6C5CE7',
            'lugares': '#0984E3', 'sin_clasificar': '#DFE6E9'
        };
        return colores[familia] || '#6C5CE7';
    }

    // ============================================================
    // CARGAR DASHBOARD INICIAL
    // ============================================================

    async _cargarDashboardInicial() {
        if (window.UIDashboard) {
            await window.UIDashboard.cargar(this);
        }
    }

    // ============================================================
    // BARRA VIGÍA + CENTINELA
    // ============================================================

    _renderizarBarraVigiaCentinela() {
        let container = document.getElementById('vigiaCentinelaContainer');
        if (!container) {
            const header = document.querySelector('.header-content');
            if (!header) return;
            
            container = document.createElement('div');
            container.id = 'vigiaCentinelaContainer';
            container.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 3px;
                padding: 6px 12px;
                background: var(--bg);
                border-radius: 10px;
                border: 1px solid var(--light);
                min-width: 180px;
                margin-left: 12px;
            `;
            header.appendChild(container);
        }

        const vigiaOnline = window.vigia?.enLinea || false;
        const vigiaActivity = this._vigiaActivity || 0;
        const centinelaActivity = this._centinelaActivity || 0;
        
        const centinelaObj = window.centinela || {};
        const estadoSalud = centinelaObj.estadoSalud || 'optimo';
        const modoOffline = centinelaObj.modoOffline || false;
        const neuroFatiga = centinelaObj.contadores?.neuroFatiga || 0;
        
        const vigiaPct = Math.min(100, Math.round(vigiaActivity || 0));
        const centinelaPct = Math.min(100, Math.round(centinelaActivity || 0));
        
        const vigiaColor = vigiaOnline ? '#6C5CE7' : '#FF7675';
        const centinelaColor = modoOffline ? '#FF7675' : 
                              estadoSalud === 'critico' ? '#FF7675' :
                              estadoSalud === 'fatiga' ? '#FDCB6E' :
                              estadoSalud === 'bajo_rendimiento' ? '#E17055' :
                              '#00B894';
        
        const vigiaIcono = vigiaOnline ? '🟢' : '🔴';
        const centinelaIcono = modoOffline ? '🔴' : 
                               estadoSalud === 'critico' ? '🚨' :
                               estadoSalud === 'fatiga' ? '🧠' :
                               estadoSalud === 'bajo_rendimiento' ? '📉' :
                               '🛡️';

        const diferencia = Math.abs(vigiaPct - centinelaPct);
        let estadoEquilibrio = '⚖️ Equilibrado';
        let equilibrioColor = 'var(--success)';
        if (diferencia > 30) {
            estadoEquilibrio = vigiaPct > centinelaPct ? '📡 Vigía dominante' : '🛡️ Centinela dominante';
            equilibrioColor = 'var(--warning)';
        }
        if (diferencia > 50) {
            estadoEquilibrio = vigiaPct > centinelaPct ? '🚀 Vigía sobrecargado' : '🛡️ Centinela sobrecargado';
            equilibrioColor = 'var(--danger)';
        }

        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:9px;color:var(--gray-light);">
                <span>🔗 Vigía vs Centinela</span>
                <span style="font-size:8px;color:${equilibrioColor};">
                    ${estadoEquilibrio}
                </span>
            </div>
            <div style="display:flex;gap:2px;align-items:center;height:7px;background:var(--light);border-radius:4px;overflow:hidden;position:relative;">
                <div style="height:100%;width:${vigiaPct}%;background:${vigiaColor};border-radius:3px 0 0 3px;transition:width 1s ease;position:relative;z-index:2;min-width:${vigiaPct > 0 ? '4px' : '0'};">
                    ${vigiaPct > 15 ? `<span style="position:absolute;right:2px;top:50%;transform:translateY(-50%);font-size:6px;color:white;font-weight:700;text-shadow:0 0 2px rgba(0,0,0,0.3);">${vigiaPct}%</span>` : ''}
                </div>
                ${vigiaPct > 5 && centinelaPct > 5 ? `
                    <div style="width:2px;height:100%;background:var(--white);z-index:3;flex-shrink:0;"></div>
                ` : ''}
                <div style="height:100%;width:${centinelaPct}%;background:${centinelaColor};border-radius:0 3px 3px 0;transition:width 1s ease;position:relative;z-index:2;margin-left:${vigiaPct > 5 && centinelaPct > 5 ? '0' : 'auto'};min-width:${centinelaPct > 0 ? '4px' : '0'};">
                    ${centinelaPct > 15 ? `<span style="position:absolute;left:2px;top:50%;transform:translateY(-50%);font-size:6px;color:white;font-weight:700;text-shadow:0 0 2px rgba(0,0,0,0.3);">${centinelaPct}%</span>` : ''}
                </div>
                <div style="position:absolute;top:-4px;left:${Math.min(95, Math.max(5, (vigiaPct + centinelaPct) / 2))}%;transform:translateX(-50%);z-index:4;font-size:10px;opacity:0.8;">
                    ${diferencia < 10 ? '⚖️' : vigiaPct > centinelaPct ? '📡' : '🛡️'}
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--gray-light);margin-top:1px;">
                <span>${vigiaIcono} ${vigiaPct}% ${vigiaOnline ? '🟢' : '🔴'}</span>
                <span style="color:${centinelaColor};">${centinelaIcono} ${centinelaPct}%</span>
                <span style="font-size:7px;color:var(--gray-light);">Fatiga: ${Math.round(neuroFatiga * 100)}%</span>
            </div>
        `;
    }

    _actualizarBarraVigiaCentinela() {
        const container = document.getElementById('vigiaCentinelaContainer');
        if (container) {
            this._renderizarBarraVigiaCentinela();
        } else {
            this._renderizarBarraVigiaCentinela();
        }
    }
}

window.uiCore = new UICore();
window.ui = window.uiCore;

console.log('✅ UI Core v18.11 - COMPLETO CON MÓDULO DE FONÉTICA');
console.log('  🎤 Módulo de Fonética registrado');
console.log('  🎤 _registrarModuloFonetica() añadido');
console.log('  🎤 irAFonetica() para navegación');
console.log('  🔗 Barra combinada en tiempo real');
console.log('  📊 Muestra equilibrio entre Vigía y Centinela');
console.log('  🎨 Colores dinámicos según estado');
console.log('  🔄 Actualización automática cada 1.5 segundos');
console.log('  🛡️ Muestra fatiga de Centinela');
console.log('  ⚖️ Indicador de equilibrio visual');
console.log('  🔧 Fallback autónomo sin dependencia de UIDashboard');
console.log('  ✅ Todas las funcionalidades originales preservadas');