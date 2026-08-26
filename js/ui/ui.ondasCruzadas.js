// ============================================================
// UI ONDAS CRUZADAS v3.11 - MODALES CORREGIDOS + PROMPT MULTIDIOMA
// CON INTEGRACIÓN BIDIRECCIONAL CON TEMAS Y ELIPSE
// ============================================================

// ============================================================
// 🔥 PASO 1: PLACEHOLDER (SIEMPRE DISPONIBLE)
// ============================================================

if (!window.UIOndasCruzadas || window.UIOndasCruzadas._placeholder === true) {
    window.UIOndasCruzadas = {
        _placeholder: true,
        _initDone: false,
        _core: null,
        _container: null,
        _cargando: false,
        _temaSeleccionado: null,
        _configActual: null,
        _modalAbierto: false,
        _escapeHandler: null,
        _intentosInicializacion: 0,
        _maxIntentosInicializacion: 10,
        _intentosCarga: 0,
        _maxIntentosCarga: 30,
        _idiomaActual: null,
        _datosPorIdioma: {},

        init: function(core) {
            console.log('🌊 [PLACEHOLDER] UIOndasCruzadas.init()');
            this._core = core || window.uiCore;
            this._initDone = true;
            return Promise.resolve(this);
        },

        cargar: function(core) {
            console.log('🌊 [PLACEHOLDER] UIOndasCruzadas.cargar()');
            this._core = core || this._core;
            const container = document.getElementById('ondasCruzadasContent');
            if (container) {
                container.innerHTML = `
                    <div style="text-align:center;padding:60px 20px;color:var(--gray);">
                        <div style="font-size:48px;margin-bottom:16px;">⏳</div>
                        <h3 style="font-size:18px;font-weight:700;color:var(--dark);">Cargando Ondas Cruzadas...</h3>
                        <p style="font-size:14px;color:var(--gray-light);">El módulo se está cargando. Por favor, espera un momento.</p>
                        <div class="spinner" style="margin:20px auto;width:40px;height:40px;border:4px solid var(--light);border-top:4px solid var(--primary);border-radius:50%;animation:spin 1s linear infinite;"></div>
                        <button class="btn-secondary" onclick="window.UIOndasCruzadas._reintentarCarga()" style="margin-top:12px;padding:6px 16px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-sync"></i> Reintentar
                        </button>
                    </div>
                `;
            }
        },

        _reintentarCarga: function() {
            console.log('🌊 [PLACEHOLDER] _reintentarCarga()');
            if (typeof window._UIOndasCruzadasReal !== 'undefined') {
                window.UIOndasCruzadas = window._UIOndasCruzadasReal;
                window.UIOndasCruzadas.cargar(window.UIOndasCruzadas._core);
            } else {
                const container = document.getElementById('ondasCruzadasContent');
                if (container) {
                    container.innerHTML = `
                        <div style="text-align:center;padding:40px;color:var(--gray);">
                            <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                            <h3 style="font-size:18px;font-weight:700;color:var(--dark);">Módulo no disponible</h3>
                            <p style="font-size:14px;color:var(--gray-light);">El módulo Ondas Cruzadas no está disponible. Por favor, recarga la página.</p>
                            <button class="btn-primary" onclick="location.reload()" style="margin-top:12px;padding:8px 20px;">
                                <i class="fas fa-sync"></i> Recargar
                            </button>
                        </div>
                    `;
                }
            }
        },

        _renderizarPanel: function() {
            console.log('🌊 [PLACEHOLDER] _renderizarPanel()');
            const container = document.getElementById('ondasCruzadasContent');
            if (container) {
                container.innerHTML = `
                    <div style="text-align:center;padding:60px 20px;color:var(--gray);">
                        <div style="font-size:48px;margin-bottom:16px;">🌊</div>
                        <h3 style="font-size:18px;font-weight:700;color:var(--dark);">Cargando Ondas Cruzadas...</h3>
                        <p style="font-size:14px;color:var(--gray-light);">El módulo está en proceso de carga. Por favor, espera unos segundos.</p>
                        <div class="spinner" style="margin:20px auto;width:40px;height:40px;border:4px solid var(--light);border-top:4px solid var(--primary);border-radius:50%;animation:spin 1s linear infinite;"></div>
                    </div>
                `;
            }
        },

        _seleccionarTema: function() { console.log('🌊 [PLACEHOLDER] _seleccionarTema()'); },
        _generarOndaCruzada: function() { console.log('🌊 [PLACEHOLDER] _generarOndaCruzada()'); },
        _abrirConfiguracion: function() { console.log('🌊 [PLACEHOLDER] _abrirConfiguracion()'); },
        _sincronizarTodas: function() { console.log('🌊 [PLACEHOLDER] _sincronizarTodas()'); },
        _limpiarGrafo: function() { console.log('🌊 [PLACEHOLDER] _limpiarGrafo()'); },
        _verDetalleTema: function() { console.log('🌊 [PLACEHOLDER] _verDetalleTema()'); },
        _verRecuerdoCompleto: function() { console.log('🌊 [PLACEHOLDER] _verRecuerdoCompleto()'); },
        _verDetalleInterferencia: function() { console.log('🌊 [PLACEHOLDER] _verDetalleInterferencia()'); },
        destroy: function() { console.log('🌊 [PLACEHOLDER] destroy()'); }
    };
    console.log('🌊 UIOndasCruzadas PLACEHOLDER creado');
}

// ============================================================
// 🔥 PASO 2: CLASE PRINCIPAL COMPLETA CON BOTÓN DE ELIMINAR
// ============================================================

class UIOndasCruzadasReal {
    constructor() {
        this._core = null;
        this._container = null;
        this._cargando = false;
        this._temaSeleccionado = null;
        this._configActual = null;
        this._initDone = false;
        this._modalAbierto = false;
        this._escapeHandler = null;
        this._intentosInicializacion = 0;
        this._maxIntentosInicializacion = 10;
        this._intentosCarga = 0;
        this._maxIntentosCarga = 30;
        this._placeholderReemplazado = false;
        this._generando = false;
        this._datosCargados = false;
        this._recargaForzada = false;
        this._ultimaCarga = 0;
        this._tiempoMinimoCarga = 2000;
        this._persistenciaKey = 'pipeline_ondas_cruzadas_v3';
        this._backupSyncKey = 'pipeline_ondas_cruzadas_elipse_sync';
        this._idiomaActual = null;
        this._datosPorIdioma = {};
        this._sincronizadoConElipse = false;

        this._botonInyectado = false;
        this._origenAccion = null;
        this._esperandoRetorno = false;
        this._historiaEnEstudio = null;
        this._volviendoDeLectura = false;

        this._recuerdoPagina = 1;
        this._recuerdoItemsPorPagina = 20;
        this._recuerdoFiltro = '';

        this._paginaActualGrafo = 1;
        this._itemsPorPaginaGrafo = 6;
        this._filtroNivelGrafo = 'todos';

        this._paginaOndasCruzadas = 1;
        this._itemsPorPaginaOndas = 15;
        this._filtroOndaCruzada = '';
        this._filtroEstadoOnda = 'todos';
        this._ordenOndasCruzadas = 'reciente';

        this._ultimoIdioma = null;
        this._nombresTemasCache = {};

        this._configurarListenerIdioma();
        this._estadisticasReales = {
            totalPersonajes: 0,
            totalLugares: 0,
            totalVocabulario: 0,
            totalOndasCruzadas: 0,
            totalElipses: 0
        };

        this._colaSincronizacion = [];
        this._sincronizando = false;

        this._registrarEventosSincronizacion();
        this._registrarListenerEliminacionHistorias();
        this._registrarListenerEstadoHistorias();

        this._inicializarSeguro();
    }

    // ============================================================
    // OBTENER NOMBRE DE IDIOMA
    // ============================================================

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

    _registrarListenerEliminacionHistorias() {
        window.addEventListener('historiaEliminada', (e) => {
            const detail = e.detail || {};
            const historiaId = detail.historiaId;
            const temaId = detail.temaId;

            console.log(`🗑️ UIOndasCruzadas: Historia eliminada detectada: ${historiaId} (tema: ${temaId})`);

            if (window.modoOndasCruzadas) {
                const grafo = window.modoOndasCruzadas._grafoElipse || {};
                let grafoModificado = false;

                for (const [temaIdGrafo, data] of Object.entries(grafo)) {
                    if (data.ondas && Array.isArray(data.ondas)) {
                        const idx = data.ondas.findIndex(h => h.id === historiaId);
                        if (idx !== -1) {
                            data.ondas.splice(idx, 1);
                            grafoModificado = true;
                        }
                    }
                    if (data.ondasReales && Array.isArray(data.ondasReales)) {
                        const idx = data.ondasReales.findIndex(h => h.id === historiaId);
                        if (idx !== -1) {
                            data.ondasReales.splice(idx, 1);
                            grafoModificado = true;
                        }
                    }
                    if (data.ondasReales) {
                        data.totalOndas = data.ondasReales.length;
                    }
                }

                if (grafoModificado) {
                    window.modoOndasCruzadas._grafoElipse = grafo;
                    window.modoOndasCruzadas._calcularInterferencias();
                    window.modoOndasCruzadas._actualizarRecuerdoGlobal();
                    window.modoOndasCruzadas._guardarDatos();
                    console.log(`🌊 Onda ${historiaId} eliminada del grafo de Ondas Cruzadas (evento)`);
                }
            }

            if (this._container && this._container.offsetParent !== null) {
                setTimeout(() => {
                    this._cargarDatos().then(() => {
                        this._renderizarPanel();
                    });
                }, 300);
            }
        });
    }

    _registrarListenerEstadoHistorias() {
        window.addEventListener('historiaEstadoCambiado', (e) => {
            const detail = e.detail || {};
            if (detail.tipo === 'onda_cruzada') {
                console.log('🌊 UIOndasCruzadas: Estado de onda cruzada cambiado', detail);
                if (this._container && this._container.offsetParent !== null) {
                    setTimeout(() => {
                        this._cargarDatos().then(() => {
                            this._renderizarPanel();
                        });
                    }, 300);
                }
            }
        });
    }

    _registrarEventosSincronizacion() {
        console.log('🌊 Registrando eventos de sincronización para Ondas Cruzadas...');

        window.addEventListener('historiaEstadoCambiado', (e) => {
            const detail = e.detail || {};
            if (detail.tipo === 'onda_cruzada' || detail.tipo === 'historia') {
                console.log('🌊 UI: Historia (onda cruzada) cambió de estado', detail);
                if (this._container && this._container.offsetParent !== null) {
                    setTimeout(() => {
                        this._cargarDatos().then(() => {
                            this._renderizarPanel();
                        });
                    }, 300);
                }
            }
        });

        window.addEventListener('temaCompletado', (e) => {
            const detail = e.detail || {};
            if (detail.origen === 'ondas_cruzadas' || detail.origen === 'elipse' || detail.origen === 'temas') {
                console.log('🌊 UI: Evento temaCompletado recibido', detail);
                if (this._container && this._container.offsetParent !== null) {
                    setTimeout(() => {
                        this._cargarDatos().then(() => {
                            this._renderizarPanel();
                        });
                    }, 300);
                }
            }
        });

        window.addEventListener('respuestaEstudio', (e) => {
            const detalle = e.detail || {};
            if (detalle.historiaId) {
                db.get('historias', detalle.historiaId).then(historia => {
                    if (historia && historia._esOndaCruzada === true) {
                        console.log('🌊 UI: Respuesta de estudio para onda cruzada', detalle);
                        if (this._container && this._container.offsetParent !== null) {
                            setTimeout(() => {
                                this._cargarDatos().then(() => {
                                    this._renderizarPanel();
                                });
                            }, 500);
                        }
                    }
                }).catch(() => {});
            }
        });

        window.addEventListener('elipseOndaGenerada', (e) => {
            if (this._container && this._container.offsetParent !== null) {
                setTimeout(() => {
                    this._cargarDatos().then(() => {
                        this._renderizarPanel();
                    });
                }, 500);
            }
        });

        window.addEventListener('elipseSincronizada', () => {
            if (this._container && this._container.offsetParent !== null) {
                setTimeout(() => {
                    this._cargarDatos().then(() => {
                        this._renderizarPanel();
                    });
                }, 500);
            }
        });

        console.log('✅ Eventos de sincronización registrados para Ondas Cruzadas');
    }

    _inicializarSeguro() {
        this._intentarInicializar();

        let intentos = 0;
        const maxIntentos = 10;
        const intervalo = 300;

        const reintentar = () => {
            if (this._initDone) return;
            if (intentos >= maxIntentos) {
                console.warn('⚠️ No se pudo inicializar UIOndasCruzadas después de ' + maxIntentos + ' intentos');
                return;
            }
            intentos++;
            setTimeout(() => {
                if (!this._initDone) {
                    this._intentarInicializar();
                    reintentar();
                }
            }, intervalo * Math.pow(1.5, intentos));
        };

        setTimeout(reintentar, 500);
    }

    _intentarInicializar() {
        try {
            if (typeof db === 'undefined' || !db._initialized) {
                console.log('⏳ UIOndasCruzadas: Esperando DB...');
                return;
            }

            if (!window.modoOndasCruzadas || !window.modoOndasCruzadas._initDone) {
                console.log('⏳ UIOndasCruzadas: Esperando modoOndasCruzadas...');
                if (typeof modoOndasCruzadas !== 'undefined' && !window.modoOndasCruzadas) {
                    window.modoOndasCruzadas = modoOndasCruzadas;
                }
                if (window.modoOndasCruzadas && typeof window.modoOndasCruzadas.init === 'function' && !window.modoOndasCruzadas._initDone) {
                    window.modoOndasCruzadas.init(this._core).then(() => {
                        console.log('✅ modoOndasCruzadas inicializado desde UI');
                        this._intentarInicializar();
                    }).catch(e => {
                        console.warn('⚠️ Error inicializando modoOndasCruzadas:', e);
                    });
                }
                return;
            }

            const idiomaActual = this._obtenerIdiomaActual();
            this._idiomaActual = idiomaActual;
            this._cargarEstadoPorIdioma(idiomaActual);
            this._initDone = true;
            console.log('🌊 UIOndasCruzadasReal v3.11: Inicializado correctamente');
            console.log(`   📊 Grafo: ${Object.keys(window.modoOndasCruzadas?._grafoElipse || {}).length} elipses (${idiomaActual})`);
            console.log(`   💾 Datos cargados: ${this._datosCargados ? '✅ Sí' : '❌ No'}`);
            console.log('   🔥 Sincronización bidireccional con Temas y Elipse activa');
            console.log('   🗑️ Botón ELIMINAR en cada onda cruzada');
            console.log('   💬 Prompt multidioma activo');

            window.dispatchEvent(new CustomEvent('ondasCruzadasUIInicializado', {
                detail: { initDone: true, idioma: idiomaActual }
            }));
        } catch (error) {
            console.warn('⚠️ UIOndasCruzadas: Error en inicialización:', error.message);
        }
    }

    async _obtenerNombresTemas(temaIds) {
        const nombres = {};
        const idsAProcesar = [];

        for (const id of temaIds) {
            if (this._nombresTemasCache[id]) {
                nombres[id] = this._nombresTemasCache[id];
            } else {
                idsAProcesar.push(id);
            }
        }

        for (const id of idsAProcesar) {
            try {
                const tema = await db.obtenerTema(parseInt(id));
                if (tema) {
                    nombres[id] = tema.nombre;
                    this._nombresTemasCache[id] = tema.nombre;
                } else {
                    const todosLosTemas = await db.obtenerTemas();
                    const temaEncontrado = todosLosTemas.find(t =>
                        t._temaOriginalId === id || String(t._temaOriginalId) === String(id)
                    );
                    if (temaEncontrado) {
                        nombres[id] = temaEncontrado.nombre;
                        this._nombresTemasCache[id] = temaEncontrado.nombre;
                    } else {
                        const temaPorId = todosLosTemas.find(t => t.id === parseInt(id));
                        if (temaPorId) {
                            nombres[id] = temaPorId.nombre;
                            this._nombresTemasCache[id] = temaPorId.nombre;
                        } else {
                            nombres[id] = `Tema ${id}`;
                            console.warn(`⚠️ No se encontró nombre para el tema ${id}`);
                        }
                    }
                }
            } catch (e) {
                nombres[id] = `Tema ${id}`;
                console.warn(`⚠️ Error obteniendo nombre del tema ${id}:`, e);
            }
        }

        return nombres;
    }

    _configurarListenerIdioma() {
        window.removeEventListener('idiomaCambiado', this._handleIdiomaCambiado);

        this._handleIdiomaCambiado = async (e) => {
            if (!this._initDone) {
                console.log('⏳ UIOndasCruzadas: Aún no inicializado, ignorando cambio de idioma');
                return;
            }

            const nuevoIdioma = e.detail?.idioma;
            const idiomaAnterior = e.detail?.idiomaAnterior;

            console.log(`🌊 UI: Idioma cambiado de "${idiomaAnterior}" a "${nuevoIdioma}"`);

            if (idiomaAnterior && this._idiomaActual !== nuevoIdioma) {
                console.log(`💾 Guardando estado del idioma anterior: ${idiomaAnterior}`);
                this._guardarEstadoPorIdioma(idiomaAnterior);
            }

            this._idiomaActual = nuevoIdioma;
            this._nombresTemasCache = {};
            this._datosCargados = false;
            this._recargaForzada = true;
            this._sincronizadoConElipse = false;

            console.log(`📂 Cargando datos del idioma: ${nuevoIdioma}`);

            try {
                await this._cargarDatos();

                if (window.modoElipse) {
                    await window.modoElipse.cargarDatos();
                    const elipsesActivas = this._obtenerTodasLasElipses();
                    console.log(`🌌 Elipses activas encontradas: ${elipsesActivas.length}`);
                    for (const temaId of elipsesActivas) {
                        await this._sincronizarElipseManual(temaId);
                    }
                    if (typeof window.modoOndasCruzadas._calcularInterferencias === 'function') {
                        window.modoOndasCruzadas._calcularInterferencias();
                    }
                    if (typeof window.modoOndasCruzadas._actualizarRecuerdoGlobal === 'function') {
                        window.modoOndasCruzadas._actualizarRecuerdoGlobal();
                    }
                    if (typeof window.modoOndasCruzadas._guardarDatos === 'function') {
                        await window.modoOndasCruzadas._guardarDatos();
                    }
                    this._guardarEstadoPorIdioma(nuevoIdioma);
                    this._datosCargados = true;
                    this._sincronizadoConElipse = true;
                }

                await this._renderizarPanel();
                console.log(`✅ Ondas Cruzadas actualizadas para idioma: ${nuevoIdioma}`);

                if (this._core) {
                    this._core.mostrarToast(`🌊 Ondas Cruzadas actualizadas para ${this._getNombreIdioma(nuevoIdioma)}`, 'success');
                }
            } catch (error) {
                console.error('❌ Error al recargar Ondas Cruzadas:', error);
                if (this._core) {
                    this._core.mostrarToast('❌ Error al actualizar Ondas Cruzadas', 'error');
                }
            }
        };

        window.addEventListener('idiomaCambiado', this._handleIdiomaCambiado);
        console.log('🌊 UI: Listener de idioma configurado (MULTIIDIOMA)');
    }

    _guardarEstadoPorIdioma(idioma) {
        if (!idioma) return;
        if (this._cargando) return;

        try {
            let grafoElipse = {};
            let mapaInterferencias = {};
            let recuerdoGlobal = {};

            if (window.modoOndasCruzadas) {
                grafoElipse = window.modoOndasCruzadas._grafoElipse || {};
                mapaInterferencias = window.modoOndasCruzadas._mapaInterferencias || {};
                const rg = window.modoOndasCruzadas._recuerdoGlobal || {};
                recuerdoGlobal = {
                    personajes: Array.from(rg.personajes || new Set()),
                    lugares: Array.from(rg.lugares || new Set()),
                    eventosClave: rg.eventosClave || [],
                    vocabularioAcumulado: Array.from(rg.vocabularioAcumulado?.entries() || []),
                    resumenGlobal: rg.resumenGlobal || '',
                    ultimaActualizacion: rg.ultimaActualizacion || Date.now()
                };
            }

            const data = {
                version: '3.11',
                timestamp: Date.now(),
                idioma: idioma,
                grafoElipse: grafoElipse,
                recuerdoGlobal: recuerdoGlobal,
                mapaInterferencias: mapaInterferencias,
                config: window.modoOndasCruzadas._config || {},
                totalOndas: Object.values(grafoElipse).reduce((acc, el) => acc + (el.totalOndas || 0), 0),
                totalElipses: Object.keys(grafoElipse).length
            };

            const key = `pipeline_ondas_cruzadas_idioma_${idioma}`;
            localStorage.setItem(key, JSON.stringify(data));
            this._datosPorIdioma[idioma] = data;

            console.log(`💾 Estado de Ondas Cruzadas guardado para idioma: ${idioma}`);
            console.log(`   📊 ${data.totalElipses} elipses, ${data.totalOndas} ondas`);

        } catch (error) {
            console.error(`❌ Error guardando estado para idioma ${idioma}:`, error);
            try {
                const backupKey = `pipeline_ondas_cruzadas_backup_${idioma}`;
                const backupData = {
                    version: '3.11',
                    timestamp: Date.now(),
                    idioma: idioma,
                    totalElipses: Object.keys(window.modoOndasCruzadas?._grafoElipse || {}).length || 0,
                    totalOndas: Object.values(window.modoOndasCruzadas?._grafoElipse || {}).reduce((acc, el) => acc + (el.totalOndas || 0), 0) || 0
                };
                localStorage.setItem(backupKey, JSON.stringify(backupData));
                console.log(`💾 Backup reducido guardado para ${idioma}`);
            } catch (e) {
                console.error(`❌ Error guardando backup reducido:`, e);
            }
        }
    }

    _cargarEstadoPorIdioma(idioma) {
        if (!idioma) return false;

        console.log(`📂 Cargando datos de Ondas Cruzadas para idioma: ${idioma}`);

        if (this._datosPorIdioma[idioma]) {
            const data = this._datosPorIdioma[idioma];
            console.log(`📦 Datos cargados desde caché para ${idioma}`);
            this._aplicarDatos(data);
            this._datosCargados = true;
            return true;
        }

        try {
            const key = `pipeline_ondas_cruzadas_idioma_${idioma}`;
            const stored = localStorage.getItem(key);

            if (stored) {
                const data = JSON.parse(stored);
                console.log(`📦 Datos cargados desde localStorage para ${idioma}`);
                console.log(`   📊 ${data.totalElipses || 0} elipses, ${data.totalOndas || 0} ondas`);

                this._aplicarDatos(data);
                this._datosCargados = true;
                this._datosPorIdioma[idioma] = data;
                return true;
            }
        } catch (error) {
            console.warn(`⚠️ Error cargando datos para ${idioma} desde localStorage:`, error);
        }

        this._cargarDesdeIndexedDB(idioma).then(data => {
            if (data) {
                console.log(`📦 Datos cargados desde IndexedDB para ${idioma}`);
                this._aplicarDatos(data);
                this._datosCargados = true;
                this._datosPorIdioma[idioma] = data;
                const key = `pipeline_ondas_cruzadas_idioma_${idioma}`;
                localStorage.setItem(key, JSON.stringify(data));
            } else {
                console.log(`📭 No hay datos de Ondas Cruzadas para idioma: ${idioma}`);
                this._datosCargados = false;
                this._inicializarVacio();
            }
        }).catch(() => {
            this._datosCargados = false;
            this._inicializarVacio();
        });

        return this._datosCargados;
    }

    _aplicarDatos(data) {
        if (!data) return;

        if (window.modoOndasCruzadas) {
            window.modoOndasCruzadas._grafoElipse = data.grafoElipse || {};
            window.modoOndasCruzadas._mapaInterferencias = data.mapaInterferencias || {};

            if (data.recuerdoGlobal) {
                window.modoOndasCruzadas._recuerdoGlobal = {
                    personajes: new Set(data.recuerdoGlobal.personajes || []),
                    lugares: new Set(data.recuerdoGlobal.lugares || []),
                    eventosClave: data.recuerdoGlobal.eventosClave || [],
                    vocabularioAcumulado: new Map(data.recuerdoGlobal.vocabularioAcumulado || []),
                    resumenGlobal: data.recuerdoGlobal.resumenGlobal || '',
                    ultimaActualizacion: data.recuerdoGlobal.ultimaActualizacion || Date.now()
                };
            }

            if (data.config) {
                window.modoOndasCruzadas._config = { ...window.modoOndasCruzadas._config, ...data.config };
            }
        }
    }

    _inicializarVacio() {
        if (window.modoOndasCruzadas) {
            window.modoOndasCruzadas._grafoElipse = {};
            window.modoOndasCruzadas._mapaInterferencias = {};
            window.modoOndasCruzadas._recuerdoGlobal = {
                personajes: new Set(),
                lugares: new Set(),
                eventosClave: [],
                vocabularioAcumulado: new Map(),
                resumenGlobal: '',
                ultimaActualizacion: Date.now()
            };
        }
        this._datosCargados = false;
    }

    async _cargarDesdeIndexedDB(idioma) {
        try {
            if (typeof db === 'undefined' || !db._initialized) {
                return null;
            }

            const key = `ondas_cruzadas_${idioma}`;
            const configs = await db.getByIndex('configuracion', 'clave', key);

            if (configs && configs.length > 0 && configs[0].valor) {
                return JSON.parse(configs[0].valor);
            }

            return null;

        } catch (error) {
            console.warn(`⚠️ Error cargando desde IndexedDB para ${idioma}:`, error.message);
            return null;
        }
    }

    async _cargarDatos() {
        console.log('🌊 _cargarDatos(): Cargando datos de Ondas Cruzadas...');

        try {
            const idiomaActual = this._obtenerIdiomaActual();
            this._idiomaActual = idiomaActual;

            if (!window.modoOndasCruzadas || !window.modoOndasCruzadas._initDone) {
                console.log('⏳ Esperando que modoOndasCruzadas esté listo...');
                await new Promise((resolve) => {
                    const check = () => {
                        if (window.modoOndasCruzadas && window.modoOndasCruzadas._initDone) {
                            resolve();
                        } else {
                            setTimeout(check, 300);
                        }
                    };
                    check();
                });
            }

            const cargado = this._cargarEstadoPorIdioma(idiomaActual);

            if (!cargado && window.modoElipse) {
                console.log('🌌 Sincronizando con Modo Elipse...');
                await window.modoElipse.cargarDatos();

                const elipsesActivas = this._obtenerTodasLasElipses();
                console.log(`🌌 Elipses activas encontradas: ${elipsesActivas.length}`);

                if (elipsesActivas.length > 0 && window.modoOndasCruzadas) {
                    for (const temaId of elipsesActivas) {
                        if (typeof window.modoOndasCruzadas.sincronizarConElipse === 'function') {
                            await window.modoOndasCruzadas.sincronizarConElipse(temaId);
                        } else {
                            await this._sincronizarElipseManual(temaId);
                        }
                    }
                    if (typeof window.modoOndasCruzadas._calcularInterferencias === 'function') {
                        window.modoOndasCruzadas._calcularInterferencias();
                    }
                    if (typeof window.modoOndasCruzadas._actualizarRecuerdoGlobal === 'function') {
                        window.modoOndasCruzadas._actualizarRecuerdoGlobal();
                    }
                    if (typeof window.modoOndasCruzadas._guardarDatos === 'function') {
                        await window.modoOndasCruzadas._guardarDatos();
                    }

                    this._guardarEstadoPorIdioma(idiomaActual);
                    this._datosCargados = true;
                    this._sincronizadoConElipse = true;
                }
            }

            if (!window.modoOndasCruzadas) {
                console.warn('⚠️ modoOndasCruzadas no disponible');
                this._datosCargados = false;
                return false;
            }

            if (typeof window.modoOndasCruzadas._cargarDatos === 'function' && !this._datosCargados) {
                const resultado = await window.modoOndasCruzadas._cargarDatos();
                this._datosCargados = resultado;
                if (resultado) {
                    this._guardarEstadoPorIdioma(idiomaActual);
                }
                return resultado;
            }

            console.log(`✅ Datos de Ondas Cruzadas cargados para idioma: ${idiomaActual}`);
            return this._datosCargados;

        } catch (error) {
            console.error('❌ Error en _cargarDatos():', error);
            this._datosCargados = false;
            return false;
        }
    }

    async _sincronizarElipseManual(temaId) {
        if (!window.modoElipse || !window.modoOndasCruzadas) return;

        try {
            const historias = window.modoElipse.getHistoriasElipse(temaId);
            if (!historias || historias.length === 0) return;

            const todasPalabras = new Map();
            const personajesSet = new Set();
            const lugaresSet = new Set();

            for (const h of historias) {
                const frases = await db.obtenerFrasesPorHistoria(h.id);
                for (const f of frases) {
                    if (f.palabras && Array.isArray(f.palabras)) {
                        for (const p of f.palabras) {
                            const texto = p.palabra || p.hanzi || '';
                            if (texto && texto.length > 0) {
                                if (!todasPalabras.has(texto)) {
                                    todasPalabras.set(texto, {
                                        frecuencia: 0,
                                        orígenes: [],
                                        significado: p.significado || texto,
                                        familia: p.familia || 'General'
                                    });
                                }
                                const data = todasPalabras.get(texto);
                                data.frecuencia++;
                                if (!data.orígenes.includes(h.titulo || 'Desconocido')) {
                                    data.orígenes.push(h.titulo || 'Desconocido');
                                }
                            }
                        }
                    }
                }
            }

            if (window.modoOndasCruzadas._grafoElipse) {
                window.modoOndasCruzadas._grafoElipse[temaId] = {
                    temaId: temaId,
                    totalOndas: historias.length,
                    ondas: historias.map(h => ({
                        id: h.id,
                        titulo: h.titulo,
                        palabrasNuevas: h.palabrasNuevas || [],
                        completada: h.completada || false,
                        rcnPromedio: h.rcnPromedio || 0,
                        indice: h.indice || 0,
                        todasPalabras: Array.from(todasPalabras.keys()),
                        personajes: Array.from(personajesSet),
                        lugares: Array.from(lugaresSet),
                        _esOndaCruzada: h._esOndaCruzada || false,
                        esOndaCruzada: h.esOndaCruzada || false
                    })),
                    personajesGlobales: Array.from(personajesSet),
                    lugaresGlobales: Array.from(lugaresSet),
                    vocabularioTotal: todasPalabras,
                    ultimaActualizacion: Date.now()
                };

                const idiomaActual = this._obtenerIdiomaActual();
                this._guardarEstadoPorIdioma(idiomaActual);
            }

            console.log(`✅ Elipse "${temaId}" sincronizada manualmente (${historias.length} ondas)`);

        } catch (error) {
            console.warn(`⚠️ Error sincronizando elipse manual "${temaId}":`, error);
        }
    }

    _obtenerTodasLasElipses() {
        const elipses = new Set();

        if (window.modoElipse) {
            try {
                const estado = window.modoElipse.getEstado();
                if (estado && estado.elipseActiva) {
                    elipses.add(estado.elipseActiva);
                }

                const todasLasElipses = window.modoElipse.getTodasLasElipses?.() || {};
                for (const temaId of Object.keys(todasLasElipses)) {
                    elipses.add(temaId);
                }
            } catch (e) {
                console.warn('⚠️ Error obteniendo elipses de Modo Elipse:', e);
            }
        }

        return Array.from(elipses);
    }

    async init(core) {
        if (this._initDone) return this;
        this._core = core || window.uiCore;

        console.log('🌊 UIOndasCruzadasReal v3.11: Inicializando (MULTIIDIOMA)...');

        this._idiomaActual = this._obtenerIdiomaActual();
        console.log(`   📌 Idioma actual: ${this._idiomaActual}`);

        if (!window.modoOndasCruzadas || !window.modoOndasCruzadas._initDone) {
            console.log('🌊 Esperando que modoOndasCruzadas esté listo...');
            return new Promise((resolve) => {
                const checkOndas = () => {
                    this._intentosInicializacion++;
                    if (window.modoOndasCruzadas && window.modoOndasCruzadas._initDone) {
                        this._initInterno(core).then(() => resolve(this));
                    } else if (this._intentosInicializacion < this._maxIntentosInicializacion) {
                        setTimeout(checkOndas, 300);
                    } else {
                        console.warn('⚠️ No se pudo inicializar UIOndasCruzadas: modoOndasCruzadas no disponible');
                        this._initDone = true;
                        resolve(this);
                    }
                };
                checkOndas();
            });
        }

        return this._initInterno(core);
    }

    async _initInterno(core) {
        this._core = core || window.uiCore;

        if (window.modoOndasCruzadas && typeof window.modoOndasCruzadas.init === 'function') {
            if (!window.modoOndasCruzadas._initDone) {
                await window.modoOndasCruzadas.init(this._core);
            }
        }

        await this._cargarDatos();

        this._registrarEventos();
        this._initDone = true;
        this._reemplazarPlaceholder();

        console.log('🌊 UIOndasCruzadasReal v3.11: Inicializado');
        console.log(`   📊 Grafo: ${Object.keys(window.modoOndasCruzadas?._grafoElipse || {}).length} elipses (${this._idiomaActual})`);
        console.log(`   💾 Datos cargados: ${this._datosCargados ? '✅ Sí' : '❌ No'}`);
        console.log(`   🔥 MULTIIDIOMA: Guarda datos por idioma SIN LIMPIAR`);
        console.log(`   🔥 Puedes cambiar de idioma y volver sin perder progreso`);
        console.log(`   🔥 Modal de ver detalle de interferencias RESTAURADO`);
        console.log(`   🔥 Plantilla JSON con RECUERDO para la IA externa`);
        console.log(`   🔥 Recuerdo de ondas incluido en la plantilla`);
        console.log(`   🔥 SINCRONIZACIÓN BIDIRECCIONAL con Temas y Elipse`);
        console.log(`   🗑️ BOTÓN ELIMINAR en cada onda cruzada`);
        console.log(`   💬 Prompt multidioma activo`);
        return this;
    }

    _reemplazarPlaceholder() {
        if (this._placeholderReemplazado) return;
        this._placeholderReemplazado = true;

        window._UIOndasCruzadasReal = this;

        if (window.UIOndasCruzadas && window.UIOndasCruzadas._placeholder === true) {
            console.log('🌊 Reemplazando placeholder con instancia real...');

            const realInstance = this;

            for (const key of Object.getOwnPropertyNames(UIOndasCruzadasReal.prototype)) {
                if (key !== 'constructor' && typeof realInstance[key] === 'function') {
                    window.UIOndasCruzadas[key] = realInstance[key].bind(realInstance);
                }
            }

            window.UIOndasCruzadas._core = realInstance._core;
            window.UIOndasCruzadas._container = realInstance._container;
            window.UIOndasCruzadas._cargando = realInstance._cargando;
            window.UIOndasCruzadas._temaSeleccionado = realInstance._temaSeleccionado;
            window.UIOndasCruzadas._configActual = realInstance._configActual;
            window.UIOndasCruzadas._initDone = true;
            window.UIOndasCruzadas._modalAbierto = realInstance._modalAbierto;
            window.UIOndasCruzadas._escapeHandler = realInstance._escapeHandler;
            window.UIOndasCruzadas._intentosInicializacion = realInstance._intentosInicializacion;
            window.UIOndasCruzadas._maxIntentosInicializacion = realInstance._maxIntentosInicializacion;
            window.UIOndasCruzadas._intentosCarga = realInstance._intentosCarga;
            window.UIOndasCruzadas._maxIntentosCarga = realInstance._maxIntentosCarga;
            window.UIOndasCruzadas._placeholderReemplazado = true;
            window.UIOndasCruzadas._placeholder = false;
            window.UIOndasCruzadas._datosCargados = realInstance._datosCargados;
            window.UIOndasCruzadas._idiomaActual = realInstance._idiomaActual;
            window.UIOndasCruzadas._datosPorIdioma = realInstance._datosPorIdioma;
            window.UIOndasCruzadas._nombresTemasCache = realInstance._nombresTemasCache;
            window.UIOndasCruzadas._estadisticasReales = realInstance._estadisticasReales;
            window.UIOndasCruzadas._sincronizadoConElipse = realInstance._sincronizadoConElipse;
            window.UIOndasCruzadas._botonInyectado = realInstance._botonInyectado;
            window.UIOndasCruzadas._origenAccion = realInstance._origenAccion;
            window.UIOndasCruzadas._esperandoRetorno = realInstance._esperandoRetorno;
            window.UIOndasCruzadas._historiaEnEstudio = realInstance._historiaEnEstudio;
            window.UIOndasCruzadas._volviendoDeLectura = realInstance._volviendoDeLectura;

            console.log('✅ Placeholder reemplazado por instancia real');
            console.log(`   📌 Datos cargados: ${window.UIOndasCruzadas._datosCargados ? '✅ Sí' : '❌ No'}`);
            console.log(`   📌 Idioma actual: ${window.UIOndasCruzadas._idiomaActual}`);
        } else {
            window.UIOndasCruzadas = this;
        }
    }

    _registrarEventos() {
        window.addEventListener('elipseOndaGenerada', (e) => {
            if (window.modoOndasCruzadas) {
                const detail = e.detail;
                if (detail && detail.temaId) {
                    if (typeof window.modoOndasCruzadas.sincronizarConElipse === 'function') {
                        window.modoOndasCruzadas.sincronizarConElipse(detail.temaId);
                    }
                    setTimeout(() => this._cargarYRenderizar(), 500);
                }
            }
        });

        window.addEventListener('elipseOndaCompletada', (e) => {
            if (window.modoOndasCruzadas) {
                const detail = e.detail;
                if (detail && detail.temaId) {
                    if (typeof window.modoOndasCruzadas.sincronizarConElipse === 'function') {
                        window.modoOndasCruzadas.sincronizarConElipse(detail.temaId);
                    }
                    setTimeout(() => this._cargarYRenderizar(), 500);
                }
            }
        });

        window.addEventListener('elipseTemaSeleccionado', (e) => {
            if (window.modoOndasCruzadas) {
                const detail = e.detail;
                if (detail && detail.temaId) {
                    if (typeof window.modoOndasCruzadas.sincronizarConElipse === 'function') {
                        window.modoOndasCruzadas.sincronizarConElipse(detail.temaId);
                    }
                }
            }
        });

        window.addEventListener('elipseNuevaOndaGenerada', () => {
            setTimeout(() => this._cargarYRenderizar(), 500);
        });

        window.addEventListener('elipseSincronizada', () => {
            setTimeout(() => this._cargarYRenderizar(), 500);
        });

        window.addEventListener('idiomaCambiado', () => {
            if (this._container && this._container.innerHTML) {
                const isVisible = this._container.offsetParent !== null;
                if (isVisible) {
                    this._nombresTemasCache = {};
                    setTimeout(() => this.cargar(this._core), 500);
                }
            }
        });

        window.addEventListener('ondasCruzadasInicializado', () => {
            console.log('🌊 OndasCruzadasUI: Recibido evento de inicialización');
            if (!this._initDone) {
                this._intentarInicializar();
            }
        });
    }

    cargar(core) {
        this._core = core || this._core;
        this._intentosCarga = 0;

        console.log('🌊 UIOndasCruzadasReal.cargar()');

        this._cargarDatos().then(() => {
            console.log('🌊 Datos recargados, renderizando panel...');
            this._cargarYRenderizar();
        }).catch(e => {
            console.warn('⚠️ Error recargando datos:', e);
            this._cargarYRenderizar();
        });
    }

    _cargarYRenderizar() {
        const container = this._container || document.getElementById('ondasCruzadasContent');

        if (!container) {
            const moduleDiv = document.getElementById('elipseModule');
            if (moduleDiv) {
                let existingContainer = moduleDiv.querySelector('#ondasCruzadasContent');
                if (existingContainer) {
                    this._container = existingContainer;
                } else {
                    this._container = document.createElement('div');
                    this._container.id = 'ondasCruzadasContent';
                    this._container.className = 'module-content';
                    const header = moduleDiv.querySelector('.module-header');
                    if (header && header.nextSibling) {
                        moduleDiv.insertBefore(this._container, header.nextSibling);
                    } else {
                        moduleDiv.appendChild(this._container);
                    }
                }
            } else {
                const existingModule = document.getElementById('ondasCruzadasModule');
                if (existingModule) {
                    const existingContent = existingModule.querySelector('#ondasCruzadasContent');
                    if (existingContent) {
                        this._container = existingContent;
                    } else {
                        this._container = document.createElement('div');
                        this._container.id = 'ondasCruzadasContent';
                        this._container.className = 'module-content';
                        existingModule.appendChild(this._container);
                    }
                } else {
                    const mainContent = document.getElementById('mainContent');
                    if (mainContent) {
                        const newModuleDiv = document.createElement('div');
                        newModuleDiv.id = 'ondasCruzadasModule';
                        newModuleDiv.className = 'module-view';
                        newModuleDiv.innerHTML = `
                            <div class="module-header">
                                <button class="btn-back" onclick="window.uiCore.volverDashboard()">
                                    <i class="fas fa-arrow-left"></i>
                                </button>
                                <div class="module-title">
                                    <h2>🌊 Modo Ondas Cruzadas</h2>
                                    <span class="module-breadcrumb">Dashboard / Ondas Cruzadas</span>
                                </div>
                            </div>
                            <div class="module-content" id="ondasCruzadasContent">
                            </div>
                        `;
                        mainContent.appendChild(newModuleDiv);
                        this._container = document.getElementById('ondasCruzadasContent');
                    }
                }
            }
        }

        this._container = container || this._container;

        if (this._container) {
            if (!window.modoOndasCruzadas || !window.modoOndasCruzadas._initDone) {
                console.log('🌊 Esperando que el sistema Ondas Cruzadas esté listo...');
                this._container.innerHTML = `
                    <div style="text-align:center;padding:60px 20px;color:var(--gray);">
                        <div style="font-size:48px;margin-bottom:16px;">🌊</div>
                        <h3 style="font-size:18px;font-weight:700;color:var(--dark);">Cargando Ondas Cruzadas...</h3>
                        <p style="font-size:14px;color:var(--gray-light);">El sistema se está inicializando. Por favor, espera un momento.</p>
                        <div class="spinner" style="margin:20px auto;width:40px;height:40px;border:4px solid var(--light);border-top:4px solid var(--primary);border-radius:50%;animation:spin 1s linear infinite;"></div>
                        <button class="btn-secondary" onclick="window.UIOndasCruzadas._reintentarCarga()" style="margin-top:12px;padding:6px 16px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-sync"></i> Reintentar
                        </button>
                    </div>
                `;
                setTimeout(() => {
                    if (window.modoOndasCruzadas && window.modoOndasCruzadas._initDone) {
                        this._renderizarPanel();
                    }
                }, 3000);
                return;
            }

            this._cargarDatos().then(() => {
                this._renderizarPanel();
            }).catch(() => {
                this._renderizarPanel();
            });
        } else {
            console.error('❌ No se pudo encontrar/crear el contenedor para Ondas Cruzadas');
        }
    }

    async _eliminarOndaCruzada(ondaId) {
        console.log('🗑️ Eliminando onda cruzada:', ondaId);

        const historia = await db.get('historias', ondaId);
        if (!historia) {
            this._core?.mostrarToast('❌ Onda no encontrada', 'error');
            await this._limpiarGrafoHuérfano(ondaId);
            return;
        }

        const confirmar = await this._core?.confirm(
            `⚠️ ¿Eliminar la onda cruzada "${historia.titulo || 'Sin título'}"?\n\n` +
            `Se eliminarán TODAS las frases asociadas.\n` +
            `Esta acción NO se puede deshacer.\n\n` +
            `🌊 La onda desaparecerá de:\n` +
            `• Ondas Cruzadas\n` +
            `• Temas\n` +
            `• El grafo de Ondas Cruzadas\n\n` +
            `📊 Esta onda tiene ${historia.frases || 0} frases.`,
            '🗑️ Eliminar Onda Cruzada'
        );

        if (!confirmar) return;

        const temaId = historia.temaId;

        try {
            const frases = await db.obtenerFrasesPorHistoria(ondaId);
            for (const f of frases) {
                await db.delete('frases', f.id);
            }
            await db.delete('historias', ondaId);

            const tema = await db.obtenerTema(temaId);
            if (tema && tema.historiasIds) {
                tema.historiasIds = tema.historiasIds.filter(id => id !== ondaId);
                tema.frases = (tema.frases || 0) - frases.length;
                await db.update('temas', tema);
                console.log(`📂 Tema "${tema.nombre}" actualizado: historiasIds eliminada`);
            }

            if (window.modoOndasCruzadas) {
                const grafo = window.modoOndasCruzadas._grafoElipse || {};
                let grafoModificado = false;

                for (const [temaIdGrafo, data] of Object.entries(grafo)) {
                    if (data.ondas && Array.isArray(data.ondas)) {
                        const idx = data.ondas.findIndex(h => h.id === ondaId);
                        if (idx !== -1) {
                            data.ondas.splice(idx, 1);
                            grafoModificado = true;
                        }
                    }
                    if (data.ondasReales && Array.isArray(data.ondasReales)) {
                        const idx = data.ondasReales.findIndex(h => h.id === ondaId);
                        if (idx !== -1) {
                            data.ondasReales.splice(idx, 1);
                            grafoModificado = true;
                        }
                    }
                    if (data.ondasReales) {
                        data.totalOndas = data.ondasReales.length;
                    }
                }

                if (grafoModificado) {
                    window.modoOndasCruzadas._grafoElipse = grafo;
                    window.modoOndasCruzadas._calcularInterferencias();
                    window.modoOndasCruzadas._actualizarRecuerdoGlobal();
                    await window.modoOndasCruzadas._guardarDatos();
                    console.log(`🌊 Onda ${ondaId} eliminada del grafo de Ondas Cruzadas`);
                }
            }

            if (window.modoElipse) {
                const index = window.modoElipse._historiasElipse.findIndex(h => h.id === ondaId);
                if (index !== -1) {
                    window.modoElipse._historiasElipse.splice(index, 1);
                    window.modoElipse._estadisticas.totalOndas = window.modoElipse._historiasElipse.length;
                    window.modoElipse._guardarEstadoElipse();
                    await window.modoElipse._guardarEnIndexedDB();
                    console.log(`🌌 Onda ${ondaId} eliminada de la Elipse`);
                }
            }

            window.dispatchEvent(new CustomEvent('historiaEliminada', {
                detail: {
                    historiaId: ondaId,
                    temaId: temaId,
                    titulo: historia.titulo,
                    esOnda: true,
                    esOndaCruzada: true
                }
            }));

            window.dispatchEvent(new CustomEvent('ondasCruzadasEstadoActualizado', {
                detail: {
                    tipo: 'onda_eliminada',
                    historiaId: ondaId,
                    temaId: temaId
                }
            }));

            this._core?.mostrarToast(`🗑️ "${historia.titulo || 'Onda Cruzada'}" eliminada correctamente`, 'warning');

            await this._cargarDatos();
            this._renderizarPanel();

            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this._core);
            }
            if (window.UITemas) {
                setTimeout(() => window.UITemas._renderTemas(), 300);
            }
            if (window.UIClipse) {
                setTimeout(() => {
                    window.UIClipse._renderizarPanel(window.UIClipse._temaId);
                }, 300);
            }

        } catch (error) {
            console.error('❌ Error eliminando onda cruzada:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _limpiarGrafoHuérfano(ondaId) {
        console.log('🧹 Limpiando grafo huérfano para onda:', ondaId);

        if (window.modoOndasCruzadas) {
            const grafo = window.modoOndasCruzadas._grafoElipse || {};
            let grafoModificado = false;

            for (const [temaIdGrafo, data] of Object.entries(grafo)) {
                if (data.ondas && Array.isArray(data.ondas)) {
                    const idx = data.ondas.findIndex(h => h.id === ondaId);
                    if (idx !== -1) {
                        data.ondas.splice(idx, 1);
                        grafoModificado = true;
                    }
                }
                if (data.ondasReales && Array.isArray(data.ondasReales)) {
                    const idx = data.ondasReales.findIndex(h => h.id === ondaId);
                    if (idx !== -1) {
                        data.ondasReales.splice(idx, 1);
                        grafoModificado = true;
                    }
                }
                if (data.ondasReales) {
                    data.totalOndas = data.ondasReales.length;
                }
            }

            if (grafoModificado) {
                window.modoOndasCruzadas._grafoElipse = grafo;
                window.modoOndasCruzadas._calcularInterferencias();
                window.modoOndasCruzadas._actualizarRecuerdoGlobal();
                await window.modoOndasCruzadas._guardarDatos();
                console.log(`🧹 Grafo limpiado para onda ${ondaId}`);
            }
        }

        await this._cargarDatos();
        this._renderizarPanel();
    }

    async _renderizarPanel() {
        if (this._cargando) return;
        this._cargando = true;

        const container = this._container;
        if (!container) {
            this._cargando = false;
            return;
        }

        this._idiomaActual = this._obtenerIdiomaActual();

        if (!window.modoOndasCruzadas || !window.modoOndasCruzadas._initDone) {
            console.log('🌊 Esperando que modoOndasCruzadas esté listo...');
            container.innerHTML = `
                <div style="text-align:center;padding:60px 20px;color:var(--gray);">
                    <div style="font-size:48px;margin-bottom:16px;">🌊</div>
                    <div class="spinner" style="margin:20px auto;width:40px;height:40px;border:4px solid var(--light);border-top:4px solid var(--primary);border-radius:50%;animation:spin 1s linear infinite;"></div>
                    <p style="font-size:14px;font-weight:600;color:var(--dark);">Inicializando Ondas Cruzadas...</p>
                    <p style="font-size:12px;color:var(--gray-light);">Cargando datos del idioma ${this._idiomaActual}</p>
                </div>
            `;

            setTimeout(() => {
                this._cargando = false;
                this._renderizarPanel();
            }, 1000);
            return;
        }

        if (!this._datosCargados || this._recargaForzada) {
            console.log('🌊 Cargando datos antes de renderizar...');
            await this._cargarDatos();
            this._recargaForzada = false;
        }

        if (window.modoElipse && !this._sincronizadoConElipse) {
            console.log('🌌 Sincronizando con Elipse antes de renderizar...');
            await this._sincronizarTodas();
            this._sincronizadoConElipse = true;
        }

        const estado = window.modoOndasCruzadas.getEstado() || {};
        const grafo = window.modoOndasCruzadas.getGrafoElipse() || {};
        const recuerdo = window.modoOndasCruzadas.getRecuerdoGlobal() || {};
        const config = window.modoOndasCruzadas.getConfiguracion() || {};
        const interferencias = window.modoOndasCruzadas.getInterferencias() || {};

        if (Object.keys(grafo).length >= 2) {
            console.log('🌊 Calculando interferencias...');
            if (typeof window.modoOndasCruzadas._calcularInterferencias === 'function') {
                window.modoOndasCruzadas._calcularInterferencias();
            }
            if (typeof window.modoOndasCruzadas._actualizarRecuerdoGlobal === 'function') {
                window.modoOndasCruzadas._actualizarRecuerdoGlobal();
            }
            const idiomaActual = this._obtenerIdiomaActual();
            this._guardarEstadoPorIdioma(idiomaActual);
        }

        const temaIds = Object.keys(grafo);
        const nombresTemas = await this._obtenerNombresTemas(temaIds);

        const todasHistorias = await db.obtenerHistoriasPorIdioma(this._idiomaActual);
        let ondasCruzadas = todasHistorias.filter(h => h._esOndaCruzada === true);

        const ondasUnicas = [];
        const clavesVistas = new Set();

        for (const h of ondasCruzadas) {
            if (h.idioma && h.idioma !== this._idiomaActual) continue;

            const clave = `${h.temaId || 'sin_tema'}_${(h.titulo || '').toLowerCase().trim()}`;
            if (!clavesVistas.has(clave)) {
                clavesVistas.add(clave);
                ondasUnicas.push(h);
            } else {
                console.log(`🔍 Duplicado eliminado: "${h.titulo}" (tema: ${h.temaId})`);
            }
        }
        ondasCruzadas = ondasUnicas;

        if (ondasCruzadas.length === 0 && Object.keys(grafo).length > 0) {
            console.log('🌊 No hay ondas cruzadas, pero hay elipses. Sincronizando...');
            for (const temaId of Object.keys(grafo)) {
                try {
                    if (typeof window.modoOndasCruzadas.sincronizarConElipse === 'function') {
                        await window.modoOndasCruzadas.sincronizarConElipse(temaId);
                    }
                } catch (e) {
                    console.warn(`⚠️ Error sincronizando tema ${temaId}:`, e);
                }
            }
            const todasHistoriasActualizadas = await db.obtenerHistoriasPorIdioma(this._idiomaActual);
            ondasCruzadas = todasHistoriasActualizadas.filter(h => h._esOndaCruzada === true);

            const ondasUnicas2 = [];
            const clavesVistas2 = new Set();
            for (const h of ondasCruzadas) {
                const clave = `${h.temaId || 'sin_tema'}_${(h.titulo || '').toLowerCase().trim()}`;
                if (!clavesVistas2.has(clave)) {
                    clavesVistas2.add(clave);
                    ondasUnicas2.push(h);
                }
            }
            ondasCruzadas = ondasUnicas2;

            if (typeof window.modoOndasCruzadas._calcularInterferencias === 'function') {
                window.modoOndasCruzadas._calcularInterferencias();
            }
            this._guardarEstadoPorIdioma(this._idiomaActual);
            await this._cargarDatos();
        }

        const interferenciasActualizadas = window.modoOndasCruzadas.getInterferencias() || {};
        const grafoActualizado = window.modoOndasCruzadas.getGrafoElipse() || {};
        const recuerdoActualizado = window.modoOndasCruzadas.getRecuerdoGlobal() || {};

        let totalPersonajes = 0;
        let totalLugares = 0;
        let totalVocabulario = 0;
        const vocabularioSet = new Set();
        const elipsesKeys = Object.keys(grafoActualizado);
        let totalOndasCruzadas = 0;

        for (const temaId of elipsesKeys) {
            const elipse = grafoActualizado[temaId];
            if (elipse.personajesGlobales) totalPersonajes += elipse.personajesGlobales.length;
            if (elipse.lugaresGlobales) totalLugares += elipse.lugaresGlobales.length;
            totalOndasCruzadas += elipse.totalOndas || 0;

            if (elipse.vocabularioTotal) {
                if (elipse.vocabularioTotal instanceof Map) {
                    for (const key of elipse.vocabularioTotal.keys()) vocabularioSet.add(key);
                } else if (Array.isArray(elipse.vocabularioTotal)) {
                    for (const item of elipse.vocabularioTotal) vocabularioSet.add(item.palabra || item);
                } else if (typeof elipse.vocabularioTotal === 'object') {
                    for (const key of Object.keys(elipse.vocabularioTotal)) vocabularioSet.add(key);
                }
            }
        }
        totalVocabulario = vocabularioSet.size;

        let totalInterferencias = 0;
        const interferenciasKeys = Object.keys(interferenciasActualizadas || {});
        for (const temaId of interferenciasKeys) {
            const data = interferenciasActualizadas[temaId];
            if (data && data.temasConectados) {
                totalInterferencias += data.temasConectados.length;
            }
        }

        this._estadisticasReales = {
            totalPersonajes,
            totalLugares,
            totalVocabulario,
            totalOndasCruzadas,
            totalElipses: elipsesKeys.length
        };

        const nombreIdioma = this._getNombreIdioma(this._idiomaActual);
        const nivelActual = this._obtenerNivelRealUsuario();

        const ondasPorTema = {};
        for (const h of ondasCruzadas) {
            const temaId = h.temaId || 'sin_tema';
            if (!ondasPorTema[temaId]) {
                ondasPorTema[temaId] = [];
            }
            ondasPorTema[temaId].push(h);
        }

        const temasOrdenados = Object.keys(ondasPorTema).sort((a, b) => {
            const nombreA = nombresTemas[a] || a;
            const nombreB = nombresTemas[b] || b;
            return nombreA.localeCompare(nombreB);
        });

        const totalOndasUnicas = ondasCruzadas.length;
        const completadasUnicas = ondasCruzadas.filter(h => h.estado === 'completada' || h._completada).length;
        const enCursoUnicas = totalOndasUnicas - completadasUnicas;

        const interferenciasConNombres = [];
        for (const temaId of interferenciasKeys) {
            const data = interferenciasActualizadas[temaId];
            if (data && data.temasConectados && data.temasConectados.length > 0) {
                const conectadosConNombres = data.temasConectados.map(id => ({
                    id: id,
                    nombre: nombresTemas[id] || id,
                    peso: data.pesos?.[id] || 0
                }));
                conectadosConNombres.sort((a, b) => b.peso - a.peso);

                const temaNombre = nombresTemas[temaId] || temaId;

                interferenciasConNombres.push({
                    temaId: temaId,
                    temaNombre: temaNombre,
                    conectados: conectadosConNombres.slice(0, 6)
                });
            }
        }
        interferenciasConNombres.sort((a, b) => b.conectados.length - a.conectados.length);

        let html = `
            <div class="ondas-cruzadas-container" style="padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:12px 20px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:14px;border:2px solid var(--primary)20;">
                    <div>
                        <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                            🌊 Modo Ondas Cruzadas
                            <span style="font-size:14px;font-weight:400;color:var(--gray);margin-left:8px;">${nombreIdioma}</span>
                            <span style="font-size:11px;font-weight:400;color:var(--primary);margin-left:8px;">🌍 ${this._idiomaActual}</span>
                            <span style="font-size:10px;color:var(--success);margin-left:8px;">🔄 Sincronizado</span>
                            <span style="font-size:10px;color:var(--danger);margin-left:8px;">🗑️ Eliminar en cada onda</span>
                            <span style="font-size:10px;color:var(--primary);margin-left:8px;">💬 Prompt multidioma</span>
                        </h2>
                        <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                            Interferencia de elipses · Nivel <strong>${nivelActual}</strong>
                            <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">
                                ${elipsesKeys.length} elipses · ${totalOndasUnicas} ondas · ${totalInterferencias} interferencias
                            </span>
                            <span style="font-size:10px;color:var(--success);margin-left:8px;">
                                💾 ${this._datosCargados ? 'Datos cargados' : 'Sin datos'}
                            </span>
                        </p>
                        <p style="font-size:10px;color:var(--gray-light);margin-top:2px;">
                            👤 ${totalPersonajes} personajes · 📍 ${totalLugares} lugares · 📝 ${totalVocabulario} palabras
                            <span style="font-size:9px;color:var(--primary);margin-left:8px;">✅ Completado sincronizado con Temas</span>
                            <span style="font-size:9px;color:var(--secondary);margin-left:8px;">🔄 Cambios reflejados en Elipse y Temas</span>
                            <span style="font-size:9px;color:var(--danger);margin-left:8px;">🗑️ Eliminar sincronizado</span>
                            <span style="font-size:9px;color:var(--primary);margin-left:8px;">💬 Prompt en idioma nativo · Historia en idioma objetivo</span>
                        </p>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.UIOndasCruzadas._seleccionarTemaModal()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-folder-open"></i> Seleccionar Tema
                        </button>
                        <button class="btn-primary" onclick="window.UIOndasCruzadas._generarOndaCruzada()" style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#00CEC9);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-file-export"></i> Generar Onda Cruzada
                        </button>
                        <button class="btn-secondary" onclick="window.UIOndasCruzadas._sincronizarTodas()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-sync"></i> Sincronizar
                        </button>
                        <button class="btn-secondary" onclick="window.UIOndasCruzadas._abrirConfiguracion()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-cog"></i> Configurar
                        </button>
                        <button class="btn-secondary" onclick="window.UIOndasCruzadas._limpiarGrafo()" style="padding:6px 14px;font-size:12px;background:var(--danger);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-trash"></i> Limpiar (${this._idiomaActual})
                        </button>
                        <button class="btn-secondary" onclick="window.uiCore.volverDashboard()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-home"></i> Dashboard
                        </button>
                    </div>
                </div>

                <div style="background:var(--white);border-radius:12px;padding:16px 20px;margin-bottom:16px;border:2px solid var(--primary)20;box-shadow:var(--shadow);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">
                                🕸️ Grafo de Elipses
                                <span style="font-size:11px;font-weight:400;color:var(--gray-light);">(${elipsesKeys.length} nodos, ${totalInterferencias} conexiones)</span>
                                <span style="font-size:10px;color:var(--primary);font-weight:400;">🌍 ${this._idiomaActual}</span>
                            </h3>
                        </div>
                        <div style="display:flex;gap:6px;">
                            <button class="btn-secondary" onclick="window.UIOndasCruzadas._verRecuerdoCompleto()" style="padding:2px 12px;font-size:10px;background:var(--white);border:1px solid var(--light);border-radius:4px;cursor:pointer;">
                                <i class="fas fa-archive"></i> Recuerdo Global
                            </button>
                        </div>
                    </div>

                    ${elipsesKeys.length === 0 ? `
                        <div style="text-align:center;padding:20px;color:var(--gray);background:var(--bg);border-radius:8px;border:2px dashed var(--light);">
                            <p style="font-size:13px;">No hay elipses en el grafo para ${this._idiomaActual}</p>
                            <p style="font-size:11px;color:var(--gray-light);">Genera ondas en el Modo Elipse para crear el grafo</p>
                            <button class="btn-primary" onclick="window.uiCore.irAModulo('elipse')" style="margin-top:8px;padding:4px 16px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#00CEC9);color:white;border:none;border-radius:6px;cursor:pointer;">
                                🌌 Ir a Modo Elipse
                            </button>
                        </div>
                    ` : `
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">
                            ${Object.entries(grafoActualizado).map(([temaId, elipse]) => {
                                const conectados = window.modoOndasCruzadas?.getTemasConectados(temaId) || [];
                                const nombreTema = nombresTemas[temaId] || temaId;
                                const esActivo = this._temaSeleccionado === temaId;
                                const ondasCount = elipse.totalOndas || 0;

                                return `
                                    <div style="background:${esActivo ? 'var(--primary)04' : 'var(--bg)'};border-radius:8px;padding:10px 12px;border:2px solid ${esActivo ? 'var(--primary)' : 'var(--light)'};cursor:pointer;transition:all 0.3s;"
                                         onclick="window.UIOndasCruzadas._seleccionarTema('${temaId}')"
                                         onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 2px 12px rgba(0,0,0,0.1)'"
                                         onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                                        <div style="display:flex;justify-content:space-between;align-items:center;">
                                            <span style="font-weight:600;font-size:13px;color:var(--dark);">${nombreTema}</span>
                                            <span style="font-size:10px;color:var(--gray-light);">${ondasCount} ondas</span>
                                        </div>
                                        ${conectados.length > 0 ? `
                                            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
                                                ${conectados.slice(0, 3).map(c => {
                                                    const nombreConectado = nombresTemas[c] || c;
                                                    return `
                                                        <span style="font-size:8px;background:var(--primary)10;color:var(--primary);padding:1px 6px;border-radius:8px;">${nombreConectado}</span>
                                                    `;
                                                }).join('')}
                                                ${conectados.length > 3 ? `<span style="font-size:8px;color:var(--gray-light);">+${conectados.length - 3}</span>` : ''}
                                            </div>
                                        ` : `
                                            <div style="font-size:9px;color:var(--gray-light);margin-top:4px;">🔗 Sin conexiones</div>
                                        `}
                                        <div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;">
                                            <button onclick="event.stopPropagation();window.UIOndasCruzadas._verDetalleTema('${temaId}')" style="padding:1px 8px;font-size:8px;background:var(--primary);color:white;border:none;border-radius:3px;cursor:pointer;">
                                                <i class="fas fa-info-circle"></i> Detalle
                                            </button>
                                            <button onclick="event.stopPropagation();window.UIOndasCruzadas._verDetalleInterferencia('${temaId}')" style="padding:1px 8px;font-size:8px;background:var(--secondary);color:white;border:none;border-radius:3px;cursor:pointer;">
                                                <i class="fas fa-link"></i> Interferencias
                                            </button>
                                        </div>
                                        ${esActivo ? `
                                            <div style="margin-top:4px;font-size:9px;color:var(--primary);font-weight:600;">🎯 Seleccionado</div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>

                <div style="background:linear-gradient(135deg, var(--primary)04, var(--secondary)04);border-radius:12px;padding:14px 18px;margin-bottom:16px;border:1px solid var(--primary)20;">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:6px;">
                        <h4 style="font-size:13px;font-weight:700;color:var(--dark);margin:0;">
                            📚 Resumen del Recuerdo Global (${nombreIdioma})
                            <span style="font-size:10px;font-weight:400;color:var(--gray-light);">
                                ${recuerdoActualizado.ultimaActualizacion ? `· ${new Date(recuerdoActualizado.ultimaActualizacion).toLocaleString()}` : ''}
                            </span>
                        </h4>
                        <button class="btn-secondary" onclick="window.UIOndasCruzadas._verRecuerdoCompleto()" style="padding:2px 12px;font-size:10px;background:var(--white);border:1px solid var(--light);border-radius:4px;cursor:pointer;">
                            <i class="fas fa-expand"></i> Ver completo
                        </button>
                    </div>
                    <div style="font-size:12px;color:var(--gray);line-height:1.6;max-height:100px;overflow-y:auto;padding:4px 0;">
                        ${recuerdoActualizado.resumenGlobal ? 
                            `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px;font-size:11px;">
                                <div><strong>👤 Personajes:</strong> ${recuerdoActualizado.personajes?.length || 0}</div>
                                <div><strong>📍 Lugares:</strong> ${recuerdoActualizado.lugares?.length || 0}</div>
                                <div><strong>📝 Vocabulario:</strong> ${recuerdoActualizado.vocabularioAcumulado?.length || 0}</div>
                                <div><strong>📖 Eventos:</strong> ${recuerdoActualizado.eventosClave?.length || 0}</div>
                                <div><strong>🌊 Ondas:</strong> ${Object.keys(recuerdoActualizado.resumenPorOnda || {}).length || 0}</div>
                                <div><strong>📌 Idioma:</strong> ${nombreIdioma}</div>
                            </div>
                            <div style="margin-top:4px;font-size:10px;color:var(--gray-light);">
                                💡 Haz clic en "Ver completo" para detalles de vocabulario y eventos.
                            </div>` 
                            : 'No hay recuerdo global disponible. Genera ondas cruzadas para crearlo.'}
                    </div>
                </div>

                <div style="background:var(--white);border-radius:12px;padding:14px 18px;margin-bottom:16px;border:2px solid var(--secondary)20;box-shadow:var(--shadow);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
                        <h4 style="font-size:13px;font-weight:700;color:var(--dark);margin:0;">
                            🔗 Interferencias Destacadas (${nombreIdioma})
                            <span style="font-size:10px;font-weight:400;color:var(--gray-light);">(conexiones más fuertes)</span>
                        </h4>
                        <span style="font-size:10px;color:var(--gray-light);">${totalInterferencias} conexiones totales</span>
                    </div>

                    ${interferenciasConNombres.length === 0 ? `
                        <div style="text-align:center;padding:12px;color:var(--gray-light);font-size:12px;">
                            ${elipsesKeys.length < 2 ? 
                                'Necesitas al menos 2 elipses para tener interferencias en ' + this._idiomaActual + '.<br>Genera ondas en diferentes temas.' :
                                'No hay interferencias calculadas. Prueba a sincronizar o generar más ondas.'}
                        </div>
                    ` : `
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;">
                            ${interferenciasConNombres.slice(0, 6).map((item) => {
                                const maxPeso = item.conectados.length > 0 ? item.conectados[0].peso : 0;
                                const nivel = maxPeso > 0.7 ? 'fuerte' : maxPeso > 0.4 ? 'media' : 'debil';
                                const color = nivel === 'fuerte' ? 'var(--success)' : nivel === 'media' ? 'var(--warning)' : 'var(--gray)';
                                
                                return `
                                    <div style="background:var(--bg);border-radius:6px;padding:8px 10px;border:1px solid var(--light);border-left:3px solid ${color};">
                                        <div style="font-weight:600;font-size:12px;color:var(--dark);">${item.temaNombre}</div>
                                        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
                                            ${item.conectados.slice(0, 6).map(c => {
                                                const nombreConectado = c.nombre || c.id;
                                                return `
                                                    <span style="font-size:9px;background:${c.peso > 0.5 ? 'var(--success)15' : 'var(--primary)10'};color:${c.peso > 0.5 ? 'var(--success)' : 'var(--primary)'};padding:1px 8px;border-radius:8px;">
                                                        ${nombreConectado} (${Math.round(c.peso * 100)}%)
                                                    </span>
                                                `;
                                            }).join('')}
                                            ${item.conectados.length > 6 ? `<span style="font-size:9px;color:var(--gray-light);">+${item.conectados.length - 6}</span>` : ''}
                                        </div>
                                        <div style="font-size:8px;color:var(--gray-light);margin-top:2px;">
                                            ${nivel === 'fuerte' ? '🔗 Conexión fuerte' : nivel === 'media' ? '🔗 Conexión media' : '🔗 Conexión débil'}
                                        </div>
                                        <button onclick="event.stopPropagation();window.UIOndasCruzadas._verDetalleInterferencia('${item.temaId}')" style="margin-top:4px;padding:1px 8px;font-size:7px;background:var(--secondary);color:white;border:none;border-radius:3px;cursor:pointer;">
                                            <i class="fas fa-link"></i> Ver todas
                                        </button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>

                <div style="background:var(--white);border-radius:12px;padding:16px 20px;margin-bottom:16px;border:2px solid var(--secondary)20;box-shadow:var(--shadow);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                        <div>
                            <h4 style="font-size:13px;font-weight:700;color:var(--dark);margin:0;">
                                📚 Ondas Cruzadas Generadas (${nombreIdioma})
                                <span style="font-size:10px;font-weight:400;color:var(--gray-light);">
                                    (${totalOndasUnicas} ondas · ${Object.keys(ondasPorTema).length} temas)
                                </span>
                                <span style="font-size:10px;color:var(--success);margin-left:8px;">✅ ${completadasUnicas} completadas</span>
                                <span style="font-size:10px;color:var(--warning);margin-left:4px;">📖 ${enCursoUnicas} en curso</span>
                                <span style="font-size:10px;color:var(--danger);margin-left:8px;">🗑️ Eliminar en cada onda</span>
                            </h4>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                            <input type="text" id="filtroOndasCruzadas"
                                   placeholder="🔍 Filtrar por título..."
                                   value="${this._filtroOndaCruzada}"
                                   style="padding:4px 10px;border:2px solid var(--light);border-radius:6px;font-size:11px;font-family:var(--font);width:140px;"
                                   oninput="window.UIOndasCruzadas._filtrarOndasCruzadas(this.value)">
                            <select id="filtroEstadoOndas" onchange="window.UIOndasCruzadas._filtrarEstadoOndas(this.value)"
                                    style="padding:4px 8px;border:1px solid var(--light);border-radius:4px;font-size:11px;background:var(--white);color:var(--dark);">
                                <option value="todos" ${this._filtroEstadoOnda === 'todos' ? 'selected' : ''}>📚 Todos</option>
                                <option value="completadas" ${this._filtroEstadoOnda === 'completadas' ? 'selected' : ''}>✅ Completadas</option>
                                <option value="en_curso" ${this._filtroEstadoOnda === 'en_curso' ? 'selected' : ''}>📖 En curso</option>
                            </select>
                            <select id="ordenOndasCruzadas" onchange="window.UIOndasCruzadas._cambiarOrdenOndas(this.value)"
                                    style="padding:4px 8px;border:1px solid var(--light);border-radius:4px;font-size:11px;background:var(--white);color:var(--dark);">
                                <option value="reciente" ${this._ordenOndasCruzadas === 'reciente' ? 'selected' : ''}>🕐 Más reciente</option>
                                <option value="antiguo" ${this._ordenOndasCruzadas === 'antiguo' ? 'selected' : ''}>🕐 Más antiguo</option>
                                <option value="titulo" ${this._ordenOndasCruzadas === 'titulo' ? 'selected' : ''}>🔤 Por título</option>
                            </select>
                        </div>
                    </div>

                    ${temasOrdenados.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--gray-light);background:var(--bg);border-radius:8px;border:2px dashed var(--light);">
                            <div style="font-size:48px;margin-bottom:12px;">🌊</div>
                            ${this._filtroOndaCruzada ? `No se encontraron ondas con "<strong>${this._filtroOndaCruzada}</strong>" en ${this._idiomaActual}` :
                              this._filtroEstadoOnda !== 'todos' ? `No hay ondas ${this._filtroEstadoOnda === 'completadas' ? 'completadas' : 'en curso'} en ${this._idiomaActual}.` :
                              `No hay ondas cruzadas generadas en ${this._idiomaActual}.`}
                            ${elipsesKeys.length > 1 ? `
                                <p style="font-size:12px;color:var(--gray-light);margin-top:8px;">
                                    💡 Genera una onda cruzada seleccionando un tema y usando "Generar Onda Cruzada".
                                </p>
                            ` : `
                                <p style="font-size:12px;color:var(--gray-light);margin-top:8px;">
                                    💡 Necesitas al menos 2 elipses para generar ondas cruzadas en ${this._idiomaActual}.
                                </p>
                            `}
                        </div>
                    ` : `
                        <div style="display:flex;flex-direction:column;gap:12px;">
                            ${temasOrdenados.map((temaId) => {
                                const ondasDelTema = ondasPorTema[temaId] || [];
                                const nombreTema = nombresTemas[temaId] || temaId;
                                const totalOndasTema = ondasDelTema.length;
                                const completadasTema = ondasDelTema.filter(h => h.estado === 'completada' || h._completada).length;

                                return `
                                    <div style="background:var(--bg);border-radius:10px;padding:12px 14px;border-left:4px solid var(--primary);">
                                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:4px;">
                                            <div style="display:flex;align-items:center;gap:8px;">
                                                <span style="font-size:18px;">📂</span>
                                                <span style="font-size:14px;font-weight:700;color:var(--dark);">${nombreTema}</span>
                                                <span style="font-size:11px;color:var(--gray-light);">(${totalOndasTema} ondas · ${completadasTema} completadas)</span>
                                            </div>
                                            ${totalOndasTema > 0 ? `
                                                <span style="font-size:10px;color:${completadasTema === totalOndasTema ? 'var(--success)' : 'var(--warning)'};">
                                                    ${completadasTema === totalOndasTema ? '✅ Completado' : `📖 ${Math.round((completadasTema / totalOndasTema) * 100)}%`}
                                                </span>
                                            ` : ''}
                                        </div>

                                        <div style="display:flex;flex-direction:column;gap:6px;">
                                            ${ondasDelTema.map(h => {
                                                const completado = h.estado === 'completada' || h._completada;
                                                const estadoColor = completado ? 'var(--success)' : 'var(--warning)';
                                                const estadoIcon = completado ? '✅' : '📖';
                                                const frasesCount = h.frases || 0;
                                                const fecha = h.fechaCreacion ? new Date(h.fechaCreacion).toLocaleDateString() : '';
                                                const esCruzada = h._esOndaCruzada === true;

                                                return `
                                                    <div style="background:var(--white);border-radius:6px;padding:8px 12px;border:1px solid ${completado ? 'var(--success)30' : 'var(--light)'};display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
                                                        <div style="flex:1;min-width:120px;">
                                                            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                                                                <span style="font-size:14px;">🌊</span>
                                                                <span style="font-size:13px;font-weight:600;color:var(--dark);">${h.titulo || 'Onda sin título'}</span>
                                                                <span style="font-size:9px;color:${estadoColor};background:${estadoColor}15;padding:1px 8px;border-radius:8px;">${estadoIcon} ${completado ? 'Completada' : 'En curso'}</span>
                                                                <span style="font-size:8px;color:var(--primary);">🌍 ${this._idiomaActual}</span>
                                                                ${esCruzada ? `<span style="font-size:8px;color:#00CEC9;font-weight:700;">🌊 Cruzada</span>` : ''}
                                                            </div>
                                                            <div style="font-size:10px;color:var(--gray-light);margin-top:1px;">
                                                                ${frasesCount} frases · ${fecha}
                                                                ${h.nivel ? `· 🎯 ${h.nivel}` : ''}
                                                            </div>
                                                        </div>
                                                        <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;">
                                                            <button class="btn-secondary" onclick="window.UIOndasCruzadas._estudiarOndaCruzada(${h.id})"
                                                                    style="padding:2px 10px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                                                <i class="fas fa-play"></i> Estudiar
                                                            </button>
                                                            <button class="btn-secondary" onclick="window.UIOndasCruzadas._verOndaEnTemas(${h.id})"
                                                                    style="padding:2px 10px;font-size:10px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                                                <i class="fas fa-folder-open"></i> Ver
                                                            </button>
                                                            <label style="display:flex;align-items:center;gap:3px;font-size:9px;cursor:pointer;padding:2px 8px;background:${completado ? 'var(--success)15' : 'var(--bg)'};border-radius:10px;border:1px solid ${completado ? 'var(--success)' : 'var(--light)'};">
                                                                <input type="checkbox" ${completado ? 'checked' : ''} 
                                                                       onchange="window.gestorProgresoHistorias.cambiarEstadoHistoria(${h.id}, this.checked, 'ondas_cruzadas')"
                                                                       style="margin:0;width:12px;height:12px;cursor:pointer;">
                                                                <span style="color:${completado ? 'var(--success)' : 'var(--gray)'};font-size:8px;">${completado ? '✅' : '⬜'}</span>
                                                            </label>
                                                            <button class="btn-danger" onclick="window.UIOndasCruzadas._eliminarOndaCruzada(${h.id})" 
                                                                    style="padding:2px 8px;font-size:10px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;"
                                                                    title="Eliminar onda cruzada permanentemente (sincronizado con Temas)"
                                                                    onmouseover="this.style.transform='scale(1.1)';this.style.boxShadow='0 2px 8px rgba(255,118,117,0.3)'" 
                                                                    onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                                                                <i class="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:8px;">
                    <div style="background:var(--white);padding:10px;border-radius:8px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--primary);">
                        <div style="font-size:20px;font-weight:800;color:var(--primary);">${elipsesKeys.length}</div>
                        <div style="font-size:9px;color:var(--gray);font-weight:600;text-transform:uppercase;">Elipses (${this._idiomaActual})</div>
                    </div>
                    <div style="background:var(--white);padding:10px;border-radius:8px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--secondary);">
                        <div style="font-size:20px;font-weight:800;color:var(--secondary);">${totalOndasUnicas}</div>
                        <div style="font-size:9px;color:var(--gray);font-weight:600;text-transform:uppercase;">Ondas (${this._idiomaActual})</div>
                    </div>
                    <div style="background:var(--white);padding:10px;border-radius:8px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--success);">
                        <div style="font-size:20px;font-weight:800;color:var(--success);">${totalInterferencias}</div>
                        <div style="font-size:9px;color:var(--gray);font-weight:600;text-transform:uppercase;">Interferencias</div>
                    </div>
                    <div style="background:var(--white);padding:10px;border-radius:8px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--warning);">
                        <div style="font-size:20px;font-weight:800;color:var(--warning);">${totalPersonajes}</div>
                        <div style="font-size:9px;color:var(--gray);font-weight:600;text-transform:uppercase;">Personajes</div>
                    </div>
                    <div style="background:var(--white);padding:10px;border-radius:8px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--info);">
                        <div style="font-size:20px;font-weight:800;color:var(--info);">${totalVocabulario}</div>
                        <div style="font-size:9px;color:var(--gray);font-weight:600;text-transform:uppercase;">Vocabulario</div>
                    </div>
                    <div style="background:var(--white);padding:10px;border-radius:8px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--primary);">
                        <div style="font-size:20px;font-weight:800;color:var(--primary);">${totalOndasUnicas}</div>
                        <div style="font-size:9px;color:var(--gray);font-weight:600;text-transform:uppercase;">Ondas Cruzadas</div>
                    </div>
                    <div style="background:var(--white);padding:10px;border-radius:8px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--success);">
                        <div style="font-size:20px;font-weight:800;color:var(--success);">${completadasUnicas}</div>
                        <div style="font-size:9px;color:var(--gray);font-weight:600;text-transform:uppercase;">Completadas</div>
                    </div>
                    <div style="background:var(--white);padding:10px;border-radius:8px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--warning);">
                        <div style="font-size:20px;font-weight:800;color:var(--warning);">${enCursoUnicas}</div>
                        <div style="font-size:9px;color:var(--gray);font-weight:600;text-transform:uppercase;">En curso</div>
                    </div>
                </div>

                <div style="margin-top:16px;padding:12px 16px;background:var(--bg);border-radius:8px;border:1px solid var(--light);">
                    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--gray);">
                        <span>📊 ${elipsesKeys.length} elipses en el grafo</span>
                        <span>🌊 ${totalOndasUnicas} ondas totales</span>
                        <span>🔗 ${totalInterferencias} conexiones</span>
                        <span>👤 ${totalPersonajes} personajes</span>
                        <span>📍 ${totalLugares} lugares</span>
                        <span>📝 ${totalVocabulario} palabras</span>
                        <span>🌊 ${totalOndasUnicas} ondas cruzadas</span>
                        <span>💾 ${this._datosCargados ? '✅ Datos cargados' : '❌ Sin datos'}</span>
                        <span>🌍 ${this._idiomaActual}</span>
                        <span style="color:var(--success);">🔄 Sincronizado con Temas y Elipse</span>
                        <span style="color:var(--danger);">🗑️ Eliminar disponible</span>
                        <span style="color:var(--primary);">💬 Prompt multidioma</span>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this._cargando = false;
        console.log(`✅ Panel de Ondas Cruzadas renderizado (${this._idiomaActual})`);
    }

    async _verDetalleInterferencia(temaId) {
        if (!temaId) {
            this._core?.mostrarToast('❌ No hay tema seleccionado', 'error');
            return;
        }

        const interferencias = window.modoOndasCruzadas.getInterferencias(temaId);
        if (!interferencias || !interferencias.temasConectados || interferencias.temasConectados.length === 0) {
            this._core?.mostrarToast(`ℹ️ El tema "${temaId}" no tiene interferencias`, 'info');
            return;
        }

        const nombresTemas = await this._obtenerNombresTemas([temaId, ...interferencias.temasConectados]);
        const nombreTemaPrincipal = nombresTemas[temaId] || temaId;

        let mensaje = `📊 **INTERFERENCIAS DE "${nombreTemaPrincipal}"**\n\n`;
        mensaje += `🔗 Conexiones: ${interferencias.temasConectados.length}\n\n`;
        mensaje += `📋 **DETALLE DE CONEXIONES (% de coincidencia):**\n\n`;

        const conectadosConPeso = interferencias.temasConectados.map(id => ({
            id: id,
            nombre: nombresTemas[id] || id,
            peso: interferencias.pesos?.[id] || 0
        }));
        conectadosConPeso.sort((a, b) => b.peso - a.peso);

        for (const c of conectadosConPeso) {
            const pct = Math.round(c.peso * 100);
            const barra = '█'.repeat(Math.min(Math.round(c.peso * 20), 20)) +
                         '░'.repeat(Math.max(0, 20 - Math.min(Math.round(c.peso * 20), 20)));
            mensaje += `  🔹 ${c.nombre}\n`;
            mensaje += `     ${pct}% coincidencia [${barra}]\n`;
            mensaje += `     ${pct >= 70 ? '🔴 Alta interferencia' : pct >= 40 ? '🟡 Media interferencia' : '🟢 Baja interferencia'}\n\n`;
        }

        const totalInterferencias = Object.keys(window.modoOndasCruzadas.getInterferencias() || {}).length;
        mensaje += `\n📊 **ESTADÍSTICAS GLOBALES:**\n`;
        mensaje += `   🌐 Total de interferencias en el grafo: ${totalInterferencias}\n`;
        mensaje += `   🏷️ Idioma: ${this._idiomaActual || this._obtenerIdiomaActual()}\n`;
        mensaje += `   🔄 ${conectadosConPeso.length > 0 ? 'Conexión más fuerte: ' + conectadosConPeso[0].nombre + ' (' + Math.round(conectadosConPeso[0].peso * 100) + '%)' : 'Sin conexiones'}\n`;

        const elipse = window.modoOndasCruzadas.getElipse(temaId);
        if (elipse) {
            mensaje += `\n👤 Personajes: ${elipse.personajesGlobales?.join(', ') || 'Ninguno'}\n`;
            mensaje += `📍 Lugares: ${elipse.lugaresGlobales?.join(', ') || 'Ninguno'}\n`;
            mensaje += `📝 Vocabulario: ${elipse.vocabularioTotal?.size || 0} palabras\n`;
        }

        this._core?.alert(mensaje, `🔗 Detalle de Interferencias: "${nombreTemaPrincipal}"`);
    }

    async _verDetalleTema(temaId) {
        const elipse = window.modoOndasCruzadas.getElipse(temaId);
        if (!elipse) {
            this._core?.mostrarToast('❌ Elipse no encontrada', 'error');
            return;
        }

        const conectados = window.modoOndasCruzadas.getTemasConectados(temaId) || [];
        const nombresTemas = await this._obtenerNombresTemas([temaId, ...conectados]);

        let mensaje = `📊 **DETALLE DE ELIPSE** (${this._idiomaActual || this._obtenerIdiomaActual()})\n\n`;
        mensaje += `📌 ${nombresTemas[temaId] || temaId}\n`;
        mensaje += `📚 Total de ondas: ${elipse.totalOndas || 0}\n`;
        mensaje += `👤 Personajes: ${elipse.personajesGlobales?.join(', ') || 'Ninguno'}\n`;
        mensaje += `📍 Lugares: ${elipse.lugaresGlobales?.join(', ') || 'Ninguno'}\n`;
        mensaje += `📝 Vocabulario: ${elipse.vocabularioTotal?.size || 0} palabras\n\n`;

        if (conectados.length > 0) {
            mensaje += `🔗 **INTERFERENCIAS:**\n`;
            for (const c of conectados) {
                const peso = window.modoOndasCruzadas.getPesoInterferencia(temaId, c) || 0;
                const nombre = nombresTemas[c] || c;
                const pct = Math.round(peso * 100);
                const barra = '█'.repeat(Math.min(Math.round(peso * 10), 10)) + '░'.repeat(Math.max(0, 10 - Math.min(Math.round(peso * 10), 10)));
                mensaje += `  ${nombre}: ${pct}% [${barra}]\n`;
            }
        } else {
            mensaje += `🔗 Sin interferencias detectadas.\n`;
        }

        this._core?.alert(mensaje, `📊 Detalle de "${nombresTemas[temaId] || temaId}"`);
    }

    async _seleccionarTemaModal() {
        const idiomaActual = this._obtenerIdiomaActual();
        const todosLosTemas = await db.obtenerTemasPorIdioma(idiomaActual);

        if (todosLosTemas.length === 0) {
            this._core?.mostrarToast('📚 No hay temas disponibles en ' + idiomaActual, 'warning');
            return;
        }

        const temasConHistorias = [];
        for (const t of todosLosTemas) {
            const historias = await db.obtenerHistoriasPorTema(t.id);
            const historiasFiltradas = historias.filter(h => h.idioma === idiomaActual);
            if (historiasFiltradas.length > 0) {
                temasConHistorias.push({ ...t, historias: historiasFiltradas.length });
            }
        }

        if (temasConHistorias.length === 0) {
            this._core?.mostrarToast('📚 No hay temas con historias en ' + idiomaActual, 'warning');
            return;
        }

        let mensaje = `📂 Selecciona un tema para la elipse (${idiomaActual}):\n\n`;
        temasConHistorias.forEach((t, i) => {
            const estaSeleccionado = this._temaSeleccionado === t.id;
            mensaje += `${i + 1}. ${t.nombre} (${t.historias} historias)${estaSeleccionado ? ' ✅' : ''}\n`;
        });

        const seleccion = await this._core?.prompt(mensaje, '1', 'Número del tema...', '📂 Seleccionar Tema');
        if (!seleccion) return;

        const idx = parseInt(seleccion) - 1;
        if (isNaN(idx) || idx < 0 || idx >= temasConHistorias.length) {
            this._core?.mostrarToast('❌ Selección inválida', 'error');
            return;
        }

        const tema = temasConHistorias[idx];
        this._temaSeleccionado = tema.id;
        this._core?.mostrarToast(`📌 Tema seleccionado: "${tema.nombre}" (${idiomaActual})`, 'success');
        this._renderizarPanel();
    }

    async _generarOndaCruzada() {
        if (this._generando) {
            this._core?.mostrarToast('⏳ Ya hay una generación en curso', 'warning');
            return;
        }

        if (!this._temaSeleccionado) {
            this._core?.mostrarToast('❌ Selecciona un tema primero', 'error');
            return;
        }

        if (!window.modoOndasCruzadas) {
            this._core?.mostrarToast('❌ Modo Ondas Cruzadas no disponible', 'error');
            return;
        }

        const idiomaActual = this._obtenerIdiomaActual();
        const tema = await db.obtenerTema(parseInt(this._temaSeleccionado));
        if (tema && tema.idioma && tema.idioma !== idiomaActual) {
            this._core?.mostrarToast(`⚠️ El tema es de "${tema.idioma}", no de "${idiomaActual}"`, 'warning');
            return;
        }

        this._generando = true;

        const config = window.modoOndasCruzadas.getConfiguracion() || {};

        const recuerdoGlobal = window.modoOndasCruzadas.getRecuerdoGlobal() || {};
        const resumenRecuerdo = recuerdoGlobal.resumenGlobal || 'No hay recuerdo disponible.';
        const personajesRecuerdo = recuerdoGlobal.personajes?.join(', ') || 'Ninguno';
        const lugaresRecuerdo = recuerdoGlobal.lugares?.join(', ') || 'Ninguno';
        const vocabularioRecuerdo = recuerdoGlobal.vocabularioAcumulado?.slice(0, 15).join(', ') || 'Ninguno';

        const idiomaPrompt = this._obtenerIdiomaNativo() || 'es';
        const nombreIdiomaPrompt = this._getNombreIdioma(idiomaPrompt);
        const nombreIdiomaObjetivo = this._getNombreIdioma(idiomaActual);

        const html = `
            <div style="padding:8px 0;">
                <div style="margin-bottom:12px;padding:10px 14px;background:var(--primary)06;border-radius:8px;border-left:4px solid var(--primary);">
                    <div style="font-size:12px;font-weight:600;color:var(--dark);">📚 RECUERDO GLOBAL (para la IA)</div>
                    <div style="font-size:11px;color:var(--gray);margin-top:4px;max-height:100px;overflow-y:auto;">
                        <div><strong>👤 Personajes:</strong> ${personajesRecuerdo}</div>
                        <div><strong>📍 Lugares:</strong> ${lugaresRecuerdo}</div>
                        <div><strong>📝 Vocabulario clave:</strong> ${vocabularioRecuerdo}</div>
                        <div style="font-size:10px;color:var(--gray-light);margin-top:2px;">${resumenRecuerdo.length > 150 ? resumenRecuerdo.substring(0, 150) + '...' : resumenRecuerdo}</div>
                    </div>
                    <div style="font-size:9px;color:var(--gray-light);margin-top:2px;">💡 El recuerdo se incluirá en la plantilla para la IA.</div>
                    <div style="font-size:9px;color:var(--primary);margin-top:2px;">💬 Prompt en ${nombreIdiomaPrompt} · Historia en ${nombreIdiomaObjetivo}</div>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                        🌊 Ondas por elipse a cruzar
                    </label>
                    <input type="number" id="cruzarOndasInput" value="${config.ondasParaCruzar || 2}" min="1" max="5"
                           style="width:100%;padding:8px 12px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);">
                </div>

                <div style="margin-bottom:12px;">
                    <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                        🔗 Máximo de elipses a cruzar
                    </label>
                    <input type="number" id="maxElipsesInput" value="${config.maxElipsesParaCruzar || 3}" min="2" max="6"
                           style="width:100%;padding:8px 12px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);">
                </div>

                <div style="margin-bottom:12px;">
                    <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                        📝 Palabras nuevas
                    </label>
                    <input type="number" id="palabrasNuevasInput" value="${config.palabrasNuevasPorOnda || 3}" min="2" max="8"
                           style="width:100%;padding:8px 12px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);">
                </div>

                <div style="margin-bottom:12px;">
                    <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                        🧠 Peso del vocabulario prestado
                    </label>
                    <input type="range" id="pesoVocabularioInput" min="0" max="1" step="0.1" value="${config.pesoVocabularioPrestado || 0.5}"
                           style="width:100%;padding:4px 0;">
                    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-light);">
                        <span>0 (solo tema principal)</span>
                        <span id="pesoVocabularioLabel">${Math.round((config.pesoVocabularioPrestado || 0.5) * 100)}%</span>
                        <span>1 (máxima mezcla)</span>
                    </div>
                </div>

                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--gray);cursor:pointer;">
                        <input type="checkbox" id="incluirPersonajesInput" ${config.incluirPersonajes !== false ? 'checked' : ''}>
                        👤 Incluir personajes
                    </label>
                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--gray);cursor:pointer;">
                        <input type="checkbox" id="incluirLugaresInput" ${config.incluirLugares !== false ? 'checked' : ''}>
                        📍 Incluir lugares
                    </label>
                </div>

                <div style="margin-top:12px;padding:12px;background:var(--primary)08;border-radius:8px;border:1px solid var(--primary)20;">
                    <div style="font-size:12px;font-weight:600;color:var(--dark);">📌 Resumen:</div>
                    <div style="font-size:11px;color:var(--gray);margin-top:4px;">
                        Se generará una onda cruzada con las opciones seleccionadas.
                        <br>El JSON incluirá el <strong>RECUERDO GLOBAL</strong> para que la IA mantenga coherencia.
                        <br>💬 Prompt generado en <strong>${nombreIdiomaPrompt}</strong> · Historia en <strong>${nombreIdiomaObjetivo}</strong>
                    </div>
                </div>

                <div style="margin-top:12px;font-size:11px;color:var(--gray-light);">
                    💡 La onda cruzada se generará como una plantilla JSON para completar con IA externa.
                    <br>✅ La plantilla incluye instrucciones CLARAS y el RECUERDO de ondas anteriores.
                    <br>💬 El prompt está en tu idioma nativo para que la IA entienda mejor las instrucciones.
                </div>
            </div>
        `;

        const resultado = await this._mostrarDialogPersonalizado({
            icon: '🌊',
            title: '🌊 Generar Onda Cruzada con Recuerdo',
            message: html,
            buttons: [
                { text: '✅ Generar', value: 'generar', primary: true },
                { text: '❌ Cancelar', value: 'cancelar', secondary: true }
            ]
        });

        if (resultado !== 'generar') {
            this._core?.mostrarToast('⏹️ Generación cancelada', 'info');
            this._generando = false;
            return;
        }

        const ondasParaCruzar = parseInt(document.getElementById('cruzarOndasInput')?.value || 2);
        const maxElipses = parseInt(document.getElementById('maxElipsesInput')?.value || 3);
        const palabrasNuevas = parseInt(document.getElementById('palabrasNuevasInput')?.value || 3);
        const pesoVocabularioPrestado = parseFloat(document.getElementById('pesoVocabularioInput')?.value || 0.5);
        const incluirPersonajes = document.getElementById('incluirPersonajesInput')?.checked !== false;
        const incluirLugares = document.getElementById('incluirLugaresInput')?.checked !== false;

        this._core?.mostrarToast(`🌊 Generando onda cruzada con recuerdo (${this._idiomaActual || this._obtenerIdiomaActual()})...`, 'info');

        try {
            const opciones = {
                ondasParaCruzar,
                maxElipses,
                palabrasNuevas,
                pesoVocabularioPrestado,
                incluirPersonajes,
                incluirLugares,
                nivel: this._obtenerNivelRealUsuario()
            };

            const plantilla = await window.modoOndasCruzadas.generarOndaCruzada(
                this._temaSeleccionado,
                opciones
            );

            this._generando = false;

            if (plantilla) {
                this._mostrarPlantillaCruzada(plantilla);
                this._core?.mostrarToast('🌊 Plantilla de onda cruzada con recuerdo generada', 'success');
            } else {
                this._core?.mostrarToast('❌ No se pudo generar la onda cruzada', 'error');
            }

        } catch (error) {
            this._generando = false;
            console.error('❌ Error generando onda cruzada:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    _mostrarPlantillaCruzada(plantilla) {
        if (!this._core) return;
        if (!plantilla) {
            this._core?.mostrarToast('❌ No se pudo generar la plantilla', 'error');
            return;
        }

        console.log('🌊 Mostrando plantilla cruzada con modal');

        this._core.abrirModal('🌊 Plantilla de Onda Cruzada con Recuerdo');

        // 🔥 LIMPIAR EL CONTENIDO DEL MODAL ANTES DE AÑADIR NUEVO CONTENIDO
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = '';
        } else {
            const modalContent = document.querySelector('.modal-content');
            if (modalContent) {
                const body = modalContent.querySelector('.modal-body') || modalContent;
                body.innerHTML = '';
            }
        }

        // Obtener idiomas
        const idiomaObjetivo = plantilla.meta?.idioma_objetivo || plantilla.meta?.idioma || 'es';
        const idiomaPrompt = plantilla.meta?.idioma_prompt || 'es';
        const nombreIdiomaObjetivo = this._getNombreIdioma(idiomaObjetivo);
        const nombreIdiomaPrompt = this._getNombreIdioma(idiomaPrompt);

        const textarea = document.createElement('textarea');
        textarea.id = 'jsonTextarea';
        textarea.style.cssText = `
            width: 100%;
            min-height: 450px;
            font-size: 12px;
            font-family: monospace;
            padding: 12px;
            border: 2px solid var(--light);
            border-radius: 8px;
            background: var(--bg);
            color: var(--dark);
            resize: vertical;
            margin-bottom: 10px;
        `;
        textarea.value = JSON.stringify(plantilla, null, 2);
        textarea.readOnly = false;

        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = `
            background: linear-gradient(135deg, var(--primary)08, var(--secondary)08);
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 12px;
            font-size: 12px;
            color: var(--gray);
            border-left: 4px solid var(--secondary);
            max-height: 200px;
            overflow-y: auto;
        `;

        const esCruzada = plantilla._INSTRUCCIONES_PARA_IA?.esOndaCruzada === true;
        const temasConectados = plantilla._INSTRUCCIONES_PARA_IA?.temasConectados || [];
        const vocabularioPrestado = plantilla._INSTRUCCIONES_PARA_IA?.vocabularioPrestado || [];
        const recuerdoContexto = plantilla._INSTRUCCIONES_PARA_IA?.recuerdo_contexto || '';
        const instruccionesCruce = plantilla._INSTRUCCIONES_PARA_IA?.instruccionesCruce || '';

        let infoHTML = `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="font-size:20px;">${esCruzada ? '🌊' : '📄'}</span>
                <span style="font-weight:700;color:var(--dark);">${esCruzada ? 'ONDA CRUZADA CON RECUERDO' : 'ONDA NORMAL'}</span>
                <span style="font-size:10px;color:var(--gray-light);margin-left:8px;">🌍 ${nombreIdiomaObjetivo}</span>
                <span style="font-size:10px;color:var(--gray-light);">💬 ${nombreIdiomaPrompt}</span>
                <span style="font-size:10px;color:var(--gray-light);">🎯 ${plantilla.meta?.nivel || 'A1'}</span>
                <span style="font-size:10px;color:var(--success);margin-left:8px;">🧠 RECUERDO INCLUIDO</span>
            </div>
        `;

        if (esCruzada) {
            infoHTML += `
                <div style="margin-top:4px;">
                    <div><strong>🔗 Temas conectados:</strong> ${temasConectados.map(id => {
                        const elipse = window.modoOndasCruzadas?._grafoElipse?.[id];
                        return elipse?.temaNombre || id;
                    }).join(', ') || 'Ninguno'}</div>
                    ${vocabularioPrestado.length > 0 ? `<div><strong>📝 Vocabulario prestado:</strong> ${vocabularioPrestado.map(item => item.palabra).join(', ')}</div>` : ''}
                    <div style="font-size:10px;color:var(--gray-light);margin-top:4px;">
                        💡 La plantilla incluye el <strong>RECUERDO GLOBAL</strong> de ondas anteriores para la IA.
                    </div>
                    <div style="font-size:10px;color:var(--primary);margin-top:2px;">
                        💬 Prompt en <strong>${nombreIdiomaPrompt}</strong> · Historia en <strong>${nombreIdiomaObjetivo}</strong>
                    </div>
                    
                    ${instruccionesCruce ? `
                        <div style="margin-top:6px;padding:6px 10px;background:var(--bg);border-radius:4px;font-size:10px;color:var(--gray-light);max-height:100px;overflow-y:auto;white-space:pre-wrap;">
                            <strong>📋 INSTRUCCIONES PARA LA IA:</strong>
                            ${instruccionesCruce.length > 400 ? instruccionesCruce.substring(0, 400) + '...' : instruccionesCruce}
                        </div>
                    ` : ''}
                    
                    ${recuerdoContexto ? `
                        <div style="margin-top:6px;padding:6px 10px;background:var(--primary)06;border-radius:4px;font-size:10px;color:var(--gray-light);max-height:100px;overflow-y:auto;white-space:pre-wrap;border:1px solid var(--primary)15;">
                            <strong>📚 RECUERDO GLOBAL INCLUIDO:</strong>
                            ${recuerdoContexto.length > 400 ? recuerdoContexto.substring(0, 400) + '...' : recuerdoContexto}
                        </div>
                    ` : ''}
                    
                    <div style="font-size:9px;color:var(--gray-light);margin-top:4px;">
                        ⚡ El recuerdo permite a la IA generar una historia COHERENTE con todo lo anterior.
                    </div>
                </div>
            `;
        }

        infoDiv.innerHTML = infoHTML;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 10px;
        `;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn-secondary';
        copyBtn.style.cssText = `
            padding: 8px 20px;
            font-size: 13px;
            background: var(--bg);
            border: 2px solid var(--light);
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        `;
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(textarea.value)
                .then(() => this._core?.mostrarToast('📋 Copiado al portapapeles', 'success'))
                .catch(() => {
                    textarea.select();
                    document.execCommand('copy');
                    this._core?.mostrarToast('📋 Copiado al portapapeles', 'success');
                });
        };

        const importBtn = document.createElement('button');
        importBtn.className = 'btn-primary';
        importBtn.style.cssText = `
            padding: 8px 20px;
            font-size: 13px;
            background: linear-gradient(135deg, #00B894, #55EFC4);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        `;
        importBtn.innerHTML = '<i class="fas fa-file-import"></i> Importar';

        const self = this;
        importBtn.onclick = async function() {
            const jsonText = textarea.value;
            if (!jsonText) {
                self._core?.mostrarToast('⚠️ No hay JSON para importar', 'warning');
                return;
            }
            try {
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importando...';
                this.disabled = true;

                const data = JSON.parse(jsonText);
                const primeraFrase = data.historias?.[0]?.frases?.[0]?.original || '';
                if (primeraFrase.includes('[') || primeraFrase.includes('Frase') || primeraFrase.includes('frase')) {
                    self._core?.mostrarToast('⚠️ Esto es una PLANTILLA vacía. Completa el JSON con la IA y luego importa.', 'warning');
                    this.innerHTML = '<i class="fas fa-file-import"></i> Importar';
                    this.disabled = false;
                    return;
                }

                if (window.modoElipse) {
                    const temaId = data.meta?.tema_id || self._temaSeleccionado;
                    if (!temaId) {
                        throw new Error('No se encontró un tema ID en el JSON.');
                    }

                    const historiaId = await window.modoElipse.importarOnda(temaId, data);

                    if (historiaId) {
                        self._core.cerrarModal();
                        self._core.mostrarToast('🌊 Onda cruzada con recuerdo importada correctamente', 'success');

                        const historia = await db.get('historias', historiaId);
                        if (historia) {
                            historia._esOndaCruzada = true;
                            historia.idioma = self._idiomaActual || self._obtenerIdiomaActual();
                            await db.update('historias', historia);
                        }

                        if (typeof window.modoOndasCruzadas.sincronizarConElipse === 'function') {
                            await window.modoOndasCruzadas.sincronizarConElipse(temaId);
                        }

                        const idiomaActual = self._obtenerIdiomaActual();
                        self._guardarEstadoPorIdioma(idiomaActual);

                        await self._cargarDatos();
                        self._renderizarPanel();

                        if (window.UIDashboard) {
                            window.UIDashboard._cargarDashboardInicial(self._core);
                        }
                        if (window.UITemas) {
                            setTimeout(() => window.UITemas._renderTemas(), 300);
                        }
                        if (window.UIClipse) {
                            setTimeout(() => {
                                try {
                                    window.UIClipse.cargar(self._core);
                                } catch (e) {}
                            }, 500);
                        }
                    }
                } else {
                    throw new Error('Modo Elipse no disponible para importar.');
                }
            } catch (e) {
                console.error('❌ Error importando:', e);
                self._core?.mostrarToast('❌ Error: ' + e.message, 'error');
            } finally {
                this.innerHTML = '<i class="fas fa-file-import"></i> Importar';
                this.disabled = false;
            }
        };

        buttonContainer.appendChild(copyBtn);
        buttonContainer.appendChild(importBtn);

        if (modalBody) {
            modalBody.appendChild(infoDiv);
            modalBody.appendChild(textarea);
            modalBody.appendChild(buttonContainer);
        } else {
            const modalContent = document.querySelector('.modal-content');
            if (modalContent) {
                const body = modalContent.querySelector('.modal-body') || modalContent;
                body.appendChild(infoDiv);
                body.appendChild(textarea);
                body.appendChild(buttonContainer);
            }
        }

        const modal = document.querySelector('.modal');
        if (modal) {
            modal.style.maxWidth = '900px';
        }
    }

    _filtrarOndasCruzadas(filtro) {
        this._filtroOndaCruzada = filtro.trim();
        this._paginaOndasCruzadas = 1;
        this._renderizarPanel();
    }

    _filtrarEstadoOndas(estado) {
        this._filtroEstadoOnda = estado;
        this._paginaOndasCruzadas = 1;
        this._renderizarPanel();
    }

    _cambiarOrdenOndas(orden) {
        this._ordenOndasCruzadas = orden;
        this._paginaOndasCruzadas = 1;
        this._renderizarPanel();
    }

    _irPaginaOndasCruzadas(pagina) {
        if (pagina < 1) return;
        this._paginaOndasCruzadas = pagina;
        this._renderizarPanel();
    }

    async _estudiarOndaCruzada(historiaId) {
        if (!window.pipeline) {
            this._core?.mostrarToast('❌ Pipeline no disponible', 'error');
            return;
        }

        try {
            const historia = await db.get('historias', historiaId);
            if (!historia) {
                this._core?.mostrarToast('❌ Onda cruzada no encontrada', 'error');
                return;
            }

            const idiomaActual = this._obtenerIdiomaActual();
            if (historia.idioma && historia.idioma !== idiomaActual) {
                this._core?.mostrarToast(`⚠️ Esta onda es de "${historia.idioma}", no de "${idiomaActual}"`, 'warning');
                return;
            }

            const estaCompletada = historia.estado === 'completada' || historia._completada === true;
            const rcnActual = historia._rcnPromedio || 0;

            if (estaCompletada) {
                console.log(`✅ Onda cruzada "${historia.titulo}" ya está completada (RCN: ${rcnActual.toFixed(1)})`);

                const frases = await db.obtenerFrasesPorHistoria(historiaId);
                const totalFrases = frases.length;
                let frasesCompletadas = 0;
                for (const f of frases) {
                    const progreso = await db.obtenerProgreso(f.id);
                    if (progreso && (progreso.rcn >= 4 || progreso.estado === 'completada')) {
                        frasesCompletadas++;
                    }
                }

                const opcion = await this._core?.confirm(
                    `✅ **"${historia.titulo}" ya está completada**\n\n` +
                    `📊 **Estadísticas:**\n` +
                    `• 🌊 Onda Cruzada · Nivel ${historia.nivel || 'A1'}\n` +
                    `• RCN: ${rcnActual.toFixed(1)} / 5.0\n` +
                    `• Frases: ${frasesCompletadas}/${totalFrases} completadas\n` +
                    `• ${frasesCompletadas === totalFrases ? '✅ 100% completada' : `🔄 ${Math.round((frasesCompletadas/totalFrases)*100)}% progreso`}\n\n` +
                    `¿Qué quieres hacer?\n` +
                    `• "Aceptar" → Volver a estudiar la historia (el progreso se mantendrá)\n` +
                    `• "Cancelar" → Volver al módulo anterior`,
                    `📖 Onda Cruzada Completada`
                );

                if (!opcion) {
                    return;
                }
            }

            this._core?.mostrarToast(`📖 ${estaCompletada ? 'Repasando' : 'Estudiando'} onda cruzada: "${historia.titulo}" (${idiomaActual})`, 'info');

            const origen = 'ondas_cruzadas';
            this._origenAccion = origen;
            this._esperandoRetorno = true;
            this._historiaEnEstudio = historiaId;

            await window.pipeline.estudiarHistoria(historiaId, origen);

            if (this._core) {
                this._core.irAModulo('study');
                setTimeout(() => {
                    this._inyectarBotonVolverOndasCruzadas();
                }, 300);
            }

        } catch (error) {
            console.error('❌ Error estudiando onda cruzada:', error);
            this._core?.mostrarToast('❌ Error al estudiar la onda cruzada', 'error');
            this._origenAccion = null;
            this._esperandoRetorno = false;
        }
    }

    _inyectarBotonVolverOndasCruzadas() {
        if (this._botonInyectado) return;
        if (this._origenAccion !== 'ondas_cruzadas') {
            console.log('ℹ️ No venimos del Modo Ondas Cruzadas, no se inyecta botón');
            return;
        }

        console.log('🔧 Inyectando botón "Volver al Modo Ondas Cruzadas" en Estudio...');

        const header = document.querySelector('#studyModule .module-header');
        if (!header) {
            console.warn('⚠️ No se encontró el header del módulo de estudio, reintentando...');
            setTimeout(() => this._inyectarBotonVolverOndasCruzadas(), 300);
            return;
        }

        const btnLibro = document.getElementById('btnLibroLectura');
        if (btnLibro) {
            btnLibro.style.display = 'none';
            console.log('🔒 Botón "Libro de Lectura" ocultado (Modo Ondas Cruzadas)');
        }

        const titleDiv = header.querySelector('.module-title');
        if (!titleDiv) {
            const existingBtn = document.getElementById('btnVolverOndasCruzadas');
            if (existingBtn) return;

            const btn = document.createElement('button');
            btn.id = 'btnVolverOndasCruzadas';
            btn.className = 'btn-primary';
            btn.style.cssText = `
                padding: 6px 16px;
                font-size: 12px;
                background: linear-gradient(135deg, #00CEC9, #6C5CE7);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-left: 12px;
                font-weight: 600;
                font-family: var(--font, sans-serif);
                flex-shrink: 0;
            `;
            btn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver a Ondas Cruzadas';
            btn.onmouseover = () => {
                btn.style.transform = 'scale(1.05)';
                btn.style.boxShadow = '0 4px 20px rgba(0,206,201,0.3)';
            };
            btn.onmouseout = () => {
                btn.style.transform = 'none';
                btn.style.boxShadow = 'none';
            };
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 Botón "Volver a Ondas Cruzadas" pulsado');
                this._volverAlModoOndasCruzadas('🔄 Volviendo al Modo Ondas Cruzadas desde Estudio');
            };
            header.appendChild(btn);
            window._volverAlModoOndasCruzadas = (mensaje) => {
                this._volverAlModoOndasCruzadas(mensaje);
            };
            this._botonInyectado = true;
            console.log('✅ Botón "Volver a Ondas Cruzadas" añadido al header');
            return;
        }

        if (document.getElementById('btnVolverOndasCruzadas')) {
            console.log('✅ Botón "Volver a Ondas Cruzadas" ya existe');
            this._botonInyectado = true;
            return;
        }

        const self = this;
        const btn = document.createElement('button');
        btn.id = 'btnVolverOndasCruzadas';
        btn.className = 'btn-primary';
        btn.style.cssText = `
            padding: 6px 16px;
            font-size: 12px;
            background: linear-gradient(135deg, #00CEC9, #6C5CE7);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-left: 12px;
            font-weight: 600;
            font-family: var(--font, sans-serif);
            flex-shrink: 0;
        `;
        btn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver a Ondas Cruzadas';
        btn.onmouseover = () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = '0 4px 20px rgba(0,206,201,0.3)';
        };
        btn.onmouseout = () => {
            btn.style.transform = 'none';
            btn.style.boxShadow = 'none';
        };
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Botón "Volver a Ondas Cruzadas" pulsado (onclick directo)');
            self._volverAlModoOndasCruzadas('🔄 Volviendo al Modo Ondas Cruzadas desde Estudio');
        };

        titleDiv.appendChild(btn);
        window._volverAlModoOndasCruzadas = function(mensaje) {
            self._volverAlModoOndasCruzadas(mensaje);
        };
        this._botonInyectado = true;
        console.log('✅ Botón "Volver a Ondas Cruzadas" añadido al módulo de estudio');
    }

    _volverAlModoOndasCruzadas(mensaje = '🔄 Volviendo al Modo Ondas Cruzadas') {
        console.log(`🔄 ${mensaje}`);
        this._esperandoRetorno = false;
        this._origenAccion = null;

        this._restaurarBotonesEstudio();

        const btn = document.getElementById('btnVolverOndasCruzadas');
        if (btn) btn.remove();

        if (this._core) {
            this._core.irAModulo('ondasCruzadas');
            setTimeout(() => {
                this._cargarDatos().then(() => {
                    this._renderizarPanel();
                    this._core?.mostrarToast(mensaje, 'info');
                });
            }, 300);
        }
    }

    _restaurarBotonesEstudio() {
        console.log('🔓 Restaurando botones del módulo de estudio...');

        const btnLibro = document.getElementById('btnLibroLectura');
        if (btnLibro) {
            btnLibro.style.display = '';
            console.log('📚 Botón "Libro de Lectura" restaurado');
        }

        const btnVolver = document.getElementById('btnVolverOndasCruzadas');
        if (btnVolver) {
            btnVolver.remove();
            console.log('🗑️ Botón "Volver a Ondas Cruzadas" eliminado');
        }

        this._botonInyectado = false;
        this._origenAccion = null;
        console.log('🔓 Botones del estudio restaurados correctamente');
    }

    async _verOndaEnTemas(historiaId) {
        try {
            const historia = await db.get('historias', historiaId);
            if (!historia) {
                this._core?.mostrarToast('❌ Onda cruzada no encontrada', 'error');
                return;
            }

            const temaId = historia.temaId;
            if (!temaId) {
                this._core?.mostrarToast('❌ La onda no tiene un tema asociado', 'error');
                return;
            }

            if (this._core) {
                this._core.irAModulo('temas');
                setTimeout(() => {
                    if (window.UITemas && typeof window.UITemas._verTemaDetalle === 'function') {
                        window.UITemas._verTemaDetalle(temaId);
                    }
                }, 300);
                this._core?.mostrarToast(`📂 Abriendo tema de la onda cruzada...`, 'info');
            }
        } catch (error) {
            console.error('❌ Error abriendo onda en temas:', error);
            this._core?.mostrarToast('❌ Error al abrir la onda en Temas', 'error');
        }
    }

    _irPaginaGrafo(pagina) {
        if (pagina < 1) return;
        this._paginaActualGrafo = pagina;
        this._renderizarPanel();
    }

    _irPaginaInterferencias(pagina) {
        if (pagina < 1) return;
        this._paginaActualGrafo = pagina;
        this._renderizarPanel();
    }

    _cambiarFiltroNivel(nivel) {
        this._filtroNivelGrafo = nivel;
        this._paginaActualGrafo = 1;
        this._renderizarPanel();
    }

    _reintentarCarga() {
        console.log('🌊 Reintentando cargar Ondas Cruzadas...');
        if (this._container) {
            this._container.innerHTML = `
                <div style="text-align:center;padding:40px;color:var(--gray);">
                    <div class="spinner" style="margin:20px auto;width:40px;height:40px;border:4px solid var(--light);border-top:4px solid var(--primary);border-radius:50%;animation:spin 1s linear infinite;"></div>
                    <p style="font-size:14px;font-weight:600;color:var(--dark);">Reintentando...</p>
                    <p style="font-size:12px;color:var(--gray-light);">Verificando dependencias del sistema...</p>
                </div>
            `;
        }

        if (!window.modoOndasCruzadas || !window.modoOndasCruzadas._initDone) {
            if (typeof modoOndasCruzadas !== 'undefined') {
                window.modoOndasCruzadas = modoOndasCruzadas;
                if (window.modoOndasCruzadas && typeof window.modoOndasCruzadas.init === 'function') {
                    window.modoOndasCruzadas.init(this._core).then(() => {
                        this._cargarDatos().then(() => this._renderizarPanel());
                    }).catch(e => {
                        console.error('❌ Error inicializando modoOndasCruzadas:', e);
                        this._renderizarPanel();
                    });
                }
            } else {
                setTimeout(() => {
                    if (window.modoOndasCruzadas && window.modoOndasCruzadas._initDone) {
                        this._cargarDatos().then(() => this._renderizarPanel());
                    } else {
                        this._intentosCarga++;
                        if (this._intentosCarga < this._maxIntentosCarga) {
                            setTimeout(() => this._reintentarCarga(), 1000);
                        } else {
                            if (this._container) {
                                this._container.innerHTML = `
                                    <div style="text-align:center;padding:40px;color:var(--gray);">
                                        <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                                        <h3 style="font-size:18px;font-weight:700;color:var(--dark);">Módulo no disponible</h3>
                                        <p style="font-size:14px;color:var(--gray-light);">El módulo Ondas Cruzadas no está disponible. Por favor, recarga la página.</p>
                                        <button class="btn-primary" onclick="location.reload()" style="margin-top:12px;padding:8px 20px;background:linear-gradient(135deg,#6C5CE7,#00CEC9);color:white;border:none;border-radius:6px;cursor:pointer;">
                                            <i class="fas fa-sync"></i> Recargar
                                        </button>
                                    </div>
                                `;
                            }
                        }
                    }
                }, 2000);
            }
        } else {
            this._cargarDatos().then(() => this._renderizarPanel());
        }
    }

    async _verRecuerdoCompleto() {
        try {
            const datos = window.modoOndasCruzadas.getRecuerdoCompleto(
                this._recuerdoPagina,
                this._recuerdoItemsPorPagina,
                this._recuerdoFiltro
            );

            const totalVocabulario = datos.totalVocabulario || 0;
            const totalPaginas = datos.totalPaginas || 1;
            const paginaActual = datos.paginaActual || 1;

            let html = `
                <div style="padding:4px 0;max-height:70vh;overflow-y:auto;font-family:var(--font);">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                        <div style="background:var(--bg);border-radius:8px;padding:10px 14px;border-left:3px solid var(--primary);">
                            <div style="font-size:11px;color:var(--gray);">👤 Personajes</div>
                            <div style="font-size:14px;font-weight:600;color:var(--dark);">${datos.personajes?.length > 0 ? datos.personajes.join(', ') : 'Ninguno'}</div>
                        </div>
                        <div style="background:var(--bg);border-radius:8px;padding:10px 14px;border-left:3px solid var(--secondary);">
                            <div style="font-size:11px;color:var(--gray);">📍 Lugares</div>
                            <div style="font-size:14px;font-weight:600;color:var(--dark);">${datos.lugares?.length > 0 ? datos.lugares.join(', ') : 'Ninguno'}</div>
                        </div>
                    </div>

                    <div style="margin-bottom:12px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                            <div style="font-size:13px;font-weight:700;color:var(--dark);">
                                📝 Vocabulario Acumulado (${this._idiomaActual || this._obtenerIdiomaActual()})
                                <span style="font-size:11px;font-weight:400;color:var(--gray-light);">(${totalVocabulario} palabras)</span>
                                ${totalPaginas > 1 ? `· Página ${paginaActual}/${totalPaginas}` : ''}
                            </div>
                            <div style="display:flex;gap:6px;align-items:center;">
                                <input type="text" id="recuerdoFiltroInput" placeholder="🔍 Filtrar..." value="${this._recuerdoFiltro || ''}" style="padding:4px 10px;border:2px solid var(--light);border-radius:6px;font-size:11px;font-family:var(--font);width:120px;" oninput="window.UIOndasCruzadas._filtrarRecuerdo(this.value)">
                            </div>
                        </div>

                        ${datos.vocabulario?.length > 0 ? `
                            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;">
                                ${datos.vocabulario.map(item => `
                                    <div style="background:var(--white);border-radius:6px;padding:6px 10px;border:1px solid var(--light);display:flex;flex-direction:column;">
                                        <span style="font-weight:600;font-size:13px;color:var(--dark);">${item.palabra}</span>
                                        <span style="font-size:10px;color:var(--gray);">${item.significado || item.palabra}</span>
                                        <div style="display:flex;gap:6px;margin-top:2px;font-size:8px;color:var(--gray-light);">
                                            <span>📂 ${item.familia || 'General'}</span>
                                            <span>📊 ${item.frecuencia || 1}x</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div style="text-align:center;padding:20px;color:var(--gray-light);">
                                ${this._recuerdoFiltro ? `No se encontraron palabras con "${this._recuerdoFiltro}"` : 'No hay vocabulario acumulado'}
                            </div>
                        `}

                        ${totalPaginas > 1 ? `
                            <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap;">
                                <button class="btn-secondary" onclick="window.UIOndasCruzadas._irPaginaRecuerdo(${paginaActual - 1})" style="padding:4px 12px;font-size:11px;${paginaActual <= 1 ? 'opacity:0.5;cursor:default;' : ''}" ${paginaActual <= 1 ? 'disabled' : ''}>
                                    <i class="fas fa-chevron-left"></i> Anterior
                                </button>
                                <span style="font-size:12px;color:var(--gray);">${paginaActual} / ${totalPaginas}</span>
                                <button class="btn-secondary" onclick="window.UIOndasCruzadas._irPaginaRecuerdo(${paginaActual + 1})" style="padding:4px 12px;font-size:11px;${paginaActual >= totalPaginas ? 'opacity:0.5;cursor:default;' : ''}" ${paginaActual >= totalPaginas ? 'disabled' : ''}>
                                    Siguiente <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>

                    <div style="margin-top:12px;">
                        <div style="font-size:12px;font-weight:600;color:var(--gray);">📖 Eventos Clave (${datos.eventos?.length || 0})</div>
                        ${datos.eventos?.length > 0 ? `
                            <div style="display:flex;flex-direction:column;gap:4px;margin-top:4px;max-height:150px;overflow-y:auto;">
                                ${datos.eventos.slice(0, 15).map(ev => `
                                    <div style="background:var(--bg);border-radius:4px;padding:4px 10px;display:flex;justify-content:space-between;font-size:11px;border-left:3px solid ${ev.completada ? 'var(--success)' : 'var(--warning)'};">
                                        <span>${ev.titulo}</span>
                                        <span style="color:var(--gray-light);">${ev.tema} ${ev.completada ? '✅' : '📖'}</span>
                                    </div>
                                `).join('')}
                                ${datos.eventos.length > 15 ? `<div style="font-size:10px;color:var(--gray-light);text-align:center;">+${datos.eventos.length - 15} más</div>` : ''}
                            </div>
                        ` : `
                            <div style="font-size:11px;color:var(--gray-light);padding:8px;">No hay eventos registrados</div>
                        `}
                    </div>

                    <div style="margin-top:12px;padding:8px 12px;background:var(--bg);border-radius:6px;font-size:10px;color:var(--gray-light);display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;">
                        <span>📚 ${datos.resumenGlobal || 'Sin resumen'}</span>
                        <span>🔄 ${datos.ultimaActualizacion ? new Date(datos.ultimaActualizacion).toLocaleString() : 'Nunca'}</span>
                    </div>
                </div>
            `;

            this._core?.abrirModal('📚 Recuerdo Global de Ondas Cruzadas');

            // 🔥 LIMPIAR EL CONTENIDO DEL MODAL ANTES DE AÑADIR NUEVO CONTENIDO
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) {
                modalBody.innerHTML = '';
            } else {
                const modalContent = document.querySelector('.modal-content');
                if (modalContent) {
                    const body = modalContent.querySelector('.modal-body') || modalContent;
                    body.innerHTML = '';
                }
            }

            let container = document.getElementById('recuerdoGlobalContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'recuerdoGlobalContainer';
                container.style.cssText = 'padding:8px 4px;max-height:75vh;overflow-y:auto;';
                if (modalBody) {
                    modalBody.appendChild(container);
                } else {
                    const modalContent = document.querySelector('.modal-content');
                    if (modalContent) {
                        const body = modalContent.querySelector('.modal-body') || modalContent;
                        body.appendChild(container);
                    }
                }
            }
            container.innerHTML = html;
            container.style.display = 'block';

        } catch (error) {
            console.error('❌ Error mostrando recuerdo completo:', error);
            this._core?.mostrarToast('❌ Error al cargar el recuerdo global', 'error');
        }
    }

    _filtrarRecuerdo(filtro) {
        this._recuerdoFiltro = filtro.trim();
        this._recuerdoPagina = 1;
        this._verRecuerdoCompleto();
    }

    _irPaginaRecuerdo(pagina) {
        if (pagina < 1) return;
        this._recuerdoPagina = pagina;
        this._verRecuerdoCompleto();
    }

    _seleccionarTema(temaId) {
        this._temaSeleccionado = temaId;
        this._renderizarPanel();
        this._core?.mostrarToast(`📌 Tema seleccionado`, 'info');
    }

    async _abrirConfiguracion() {
        const config = window.modoOndasCruzadas.getConfiguracion() || {};

        const html = `
            <div style="padding:8px 0;">
                <div style="margin-bottom:12px;">
                    <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                        🌊 Ondas por elipse a cruzar
                    </label>
                    <input type="number" id="cfgOndasParaCruzar" value="${config.ondasParaCruzar || 2}" min="1" max="5"
                           style="width:100%;padding:8px 12px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);">
                </div>

                <div style="margin-bottom:12px;">
                    <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                        🔗 Máximo de elipses a cruzar
                    </label>
                    <input type="number" id="cfgMaxElipses" value="${config.maxElipsesParaCruzar || 3}" min="2" max="6"
                           style="width:100%;padding:8px 12px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);">
                </div>

                <div style="margin-bottom:12px;">
                    <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                        📝 Palabras nuevas por onda
                    </label>
                    <input type="number" id="cfgPalabrasNuevas" value="${config.palabrasNuevasPorOnda || 3}" min="1" max="8"
                           style="width:100%;padding:8px 12px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);">
                </div>

                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--gray);cursor:pointer;">
                        <input type="checkbox" id="cfgIncluirPersonajes" ${config.incluirPersonajes !== false ? 'checked' : ''}>
                        👤 Incluir personajes
                    </label>
                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--gray);cursor:pointer;">
                        <input type="checkbox" id="cfgIncluirLugares" ${config.incluirLugares !== false ? 'checked' : ''}>
                        📍 Incluir lugares
                    </label>
                </div>
            </div>
        `;

        const resultado = await this._mostrarDialogPersonalizado({
            icon: '⚙️',
            title: '⚙️ Configuración',
            message: html,
            buttons: [
                { text: '💾 Guardar', value: 'guardar', primary: true },
                { text: '↩️ Restaurar', value: 'restaurar', secondary: true },
                { text: '❌ Cancelar', value: 'cancelar', secondary: true }
            ]
        });

        if (resultado === 'guardar') {
            const nuevaConfig = {
                ondasParaCruzar: parseInt(document.getElementById('cfgOndasParaCruzar')?.value || 2),
                maxElipsesParaCruzar: parseInt(document.getElementById('cfgMaxElipses')?.value || 3),
                palabrasNuevasPorOnda: parseInt(document.getElementById('cfgPalabrasNuevas')?.value || 3),
                incluirPersonajes: document.getElementById('cfgIncluirPersonajes')?.checked !== false,
                incluirLugares: document.getElementById('cfgIncluirLugares')?.checked !== false
            };

            await window.modoOndasCruzadas.actualizarConfiguracion(nuevaConfig);
            const idiomaActual = this._obtenerIdiomaActual();
            this._guardarEstadoPorIdioma(idiomaActual);

            this._core?.mostrarToast('✅ Configuración guardada', 'success');
            this._renderizarPanel();
        } else if (resultado === 'restaurar') {
            await window.modoOndasCruzadas.actualizarConfiguracion({
                ondasParaCruzar: 2,
                maxElipsesParaCruzar: 3,
                palabrasNuevasPorOnda: 3,
                incluirPersonajes: true,
                incluirLugares: true
            });
            const idiomaActual = this._obtenerIdiomaActual();
            this._guardarEstadoPorIdioma(idiomaActual);
            this._core?.mostrarToast('↩️ Configuración restaurada', 'info');
            this._renderizarPanel();
        }
    }

    async _sincronizarTodas() {
        this._core?.mostrarToast('🔄 Sincronizando todas las elipses...', 'info');

        try {
            if (typeof window.modoOndasCruzadas.sincronizarTodasLasElipses === 'function') {
                await window.modoOndasCruzadas.sincronizarTodasLasElipses();
            }

            if (typeof window.modoOndasCruzadas._calcularInterferencias === 'function') {
                window.modoOndasCruzadas._calcularInterferencias();
            }
            if (typeof window.modoOndasCruzadas._actualizarRecuerdoGlobal === 'function') {
                window.modoOndasCruzadas._actualizarRecuerdoGlobal();
            }

            const idiomaActual = this._obtenerIdiomaActual();
            this._guardarEstadoPorIdioma(idiomaActual);
            this._sincronizadoConElipse = true;

            await this._cargarDatos();
            this._core?.mostrarToast('✅ Todas las elipses sincronizadas', 'success');
            this._renderizarPanel();
        } catch (error) {
            console.error('❌ Error sincronizando:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _limpiarGrafo() {
        const idiomaActual = this._obtenerIdiomaActual();
        const confirmar = await this._core?.confirm(
            `🧹 ¿Limpiar todo el grafo de Ondas Cruzadas para ${idiomaActual}?\n\n` +
            'Se eliminarán todas las conexiones e interferencias.\n' +
            'Los datos del Modo Elipse NO se verán afectados.\n\n' +
            '⚠️ Esta acción NO se puede deshacer.',
            '🧹 Limpiar Grafo'
        );

        if (!confirmar) return;

        try {
            if (typeof window.modoOndasCruzadas.limpiarGrafo === 'function') {
                window.modoOndasCruzadas.limpiarGrafo();
            }
            delete this._datosPorIdioma[idiomaActual];
            const key = `pipeline_ondas_cruzadas_idioma_${idiomaActual}`;
            localStorage.removeItem(key);

            this._inicializarVacio();
            this._datosCargados = false;
            this._sincronizadoConElipse = false;

            this._core?.mostrarToast(`🧹 Grafo limpiado para ${idiomaActual}`, 'warning');
            this._renderizarPanel();
        } catch (error) {
            console.error('❌ Error limpiando grafo:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    _mostrarDialogPersonalizado(opciones) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(8px);
                z-index: 100001;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                animation: fadeIn 0.3s ease;
            `;

            overlay.innerHTML = `
                <div style="background:var(--white,#ffffff);border-radius:16px;padding:24px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 30px 80px rgba(0,0,0,0.4);animation:scaleIn 0.3s ease;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                        <span style="font-size:28px;">${opciones.icon || '📢'}</span>
                        <h3 style="font-size:18px;font-weight:700;color:var(--dark);margin:0;">${opciones.title || 'Aviso'}</h3>
                    </div>
                    <div style="font-size:14px;color:var(--gray);line-height:1.6;margin-bottom:16px;">
                        ${opciones.message}
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
                        ${opciones.buttons.map((btn, i) => `
                            <button class="dialog-btn" data-value="${btn.value}"
                                    style="padding:10px 24px;font-size:14px;font-weight:600;border:none;border-radius:8px;cursor:pointer;font-family:var(--font);transition:all 0.3s;
                                    ${btn.primary ? 'background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;' :
                                      btn.secondary ? 'background:var(--light);color:var(--gray);' :
                                      'background:var(--bg);color:var(--dark);'}">
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            overlay.querySelectorAll('.dialog-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const value = btn.dataset.value;
                    overlay.remove();
                    resolve(value);
                });
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    resolve(null);
                }
            });

            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', escapeHandler);
                    resolve(null);
                }
            };
            document.addEventListener('keydown', escapeHandler);
            overlay._escapeHandler = escapeHandler;
        });
    }

    _obtenerIdiomaNativo() {
        try {
            const usuario = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
            return usuario.idiomaNativo || 'es';
        } catch (e) {
            return 'es';
        }
    }

    _obtenerIdiomaActual() {
        try {
            return gestorIdiomas?.getIdiomaActivo() || 'es';
        } catch (e) {
            return 'es';
        }
    }

    _obtenerNivelRealUsuario() {
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

    destroy() {
        const idiomaActual = this._obtenerIdiomaActual();
        this._guardarEstadoPorIdioma(idiomaActual);
        this._initDone = false;
        console.log('🛑 UIOndasCruzadasReal: Destruido');
    }
}

const _realInstance = new UIOndasCruzadasReal();

if (window.UIOndasCruzadas && window.UIOndasCruzadas._placeholder === true) {
    console.log('🌊 Reemplazando placeholder con instancia real...');
    window.UIOndasCruzadas = _realInstance;
    window.UIOndasCruzadas._placeholder = false;
    window.UIOndasCruzadas._placeholderReemplazado = true;
    window._UIOndasCruzadasReal = _realInstance;
    console.log('✅ Placeholder reemplazado');
} else {
    window.UIOndasCruzadas = _realInstance;
    window._UIOndasCruzadasReal = _realInstance;
}

console.log('✅ UI Ondas Cruzadas v3.11 - MODALES CORREGIDOS + PROMPT MULTIDIOMA');
console.log('  🔥 _mostrarPlantillaCruzada: Muestra idioma objetivo y prompt');
console.log('  🔥 _verRecuerdoCompleto: Limpia el contenido antes de añadir');
console.log('  🔥 Los modales ya NO acumulan información');
console.log('  🔥 Prompt generado en el idioma nativo del usuario');
console.log('  🔥 Historia generada en el idioma objetivo');
console.log('  ✅ Todas las funcionalidades originales preservadas');

window._volverAlModoOndasCruzadas = function(mensaje) {
    console.log('🌊 Volviendo al Modo Ondas Cruzadas:', mensaje || '');

    try {
        if (window.UIOndasCruzadas) {
            if (typeof window.UIOndasCruzadas._cargarDatos === 'function') {
                window.UIOndasCruzadas._cargarDatos().then(() => {
                    if (typeof window.UIOndasCruzadas._renderizarPanel === 'function') {
                        window.UIOndasCruzadas._renderizarPanel();
                    }
                }).catch(() => {
                    if (typeof window.UIOndasCruzadas._renderizarPanel === 'function') {
                        window.UIOndasCruzadas._renderizarPanel();
                    }
                });
            } else if (typeof window.UIOndasCruzadas._renderizarPanel === 'function') {
                window.UIOndasCruzadas._renderizarPanel();
            }
        }

        if (window.uiCore) {
            if (!document.getElementById('ondasCruzadasModule')) {
                const mainContent = document.getElementById('mainContent');
                if (mainContent) {
                    const moduleEl = document.createElement('div');
                    moduleEl.id = 'ondasCruzadasModule';
                    moduleEl.className = 'module-view';
                    moduleEl.innerHTML = `
                        <div class="module-header">
                            <button class="btn-back" onclick="window.uiCore.volverDashboard()">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                            <div class="module-title">
                                <h2>🌊 Modo Ondas Cruzadas</h2>
                                <span class="module-breadcrumb">Dashboard / Ondas Cruzadas</span>
                            </div>
                        </div>
                        <div class="module-content" id="ondasCruzadasContent">
                        </div>
                    `;
                    mainContent.appendChild(moduleEl);
                }
            }

            window.uiCore.irAModulo('ondasCruzadas');

            if (window.uiCore.mostrarToast) {
                if (mensaje) {
                    window.uiCore.mostrarToast(mensaje, 'success');
                } else {
                    window.uiCore.mostrarToast('🌊 Volviendo al Modo Ondas Cruzadas', 'success');
                }
            }
        } else {
            console.warn('⚠️ uiCore no disponible para navegar a Ondas Cruzadas');
        }

        if (window.UIDashboard) {
            setTimeout(() => {
                if (typeof window.UIDashboard._cargarDashboardInicial === 'function') {
                    window.UIDashboard._cargarDashboardInicial(window.uiCore);
                }
            }, 500);
        }
        if (window.UITemas) {
            setTimeout(() => {
                if (typeof window.UITemas._renderTemas === 'function') {
                    window.UITemas._renderTemas();
                }
            }, 500);
        }
        if (window.UIClipse) {
            setTimeout(() => {
                try {
                    if (typeof window.UIClipse.cargar === 'function') {
                        window.UIClipse.cargar(window.uiCore);
                    }
                } catch (e) {}
            }, 500);
        }

        console.log('✅ Navegación a Ondas Cruzadas completada');

    } catch (error) {
        console.error('❌ Error al volver a Ondas Cruzadas:', error);
        if (window.uiCore) {
            try {
                window.uiCore.irAModulo('ondasCruzadas');
            } catch (e) {
                console.error('❌ Fallback también falló:', e);
            }
        }
    }
};

console.log('🌊 Función global _volverAlModoOndasCruzadas registrada');