// ============================================================
// MODO ONDAS CRUZADAS v3.9 - CORREGIDO: PROMPT MULTIDIOMA
// ============================================================

class ModoOndasCruzadas {
    constructor() {
        this._initDone = false;
        this._core = null;
        this._config = {
            maxOndasPorElipse: 10,
            palabrasNuevasPorOnda: 3,
            nivelBase: 'A1',
            ondasParaCruzar: 2,
            maxElipsesParaCruzar: 3,
            incluirPersonajes: true,
            incluirLugares: true,
            pesoVocabularioPrestado: 0.5,
            generarRecuerdoGlobal: true,
            prioridadTemas: []
        };
        
        this._datosPorIdioma = {};
        this._idiomaActual = null;
        
        this._grafoElipse = {};
        this._recuerdoGlobal = {
            personajes: new Set(),
            lugares: new Set(),
            eventosClave: [],
            vocabularioAcumulado: new Map(),
            resumenGlobal: '',
            ultimaActualizacion: 0
        };
        this._mapaInterferencias = {};
        
        this._persistenciaKey = 'pipeline_ondas_cruzadas_v3';
        this._datosCargados = false;
        this._cargando = false;
        this._guardando = false;
        this._ultimoGuardado = 0;
        this._intervaloMinimoGuardado = 5000;
        this._intentosInicializacion = 0;
        this._maxIntentosInicializacion = 10;
        this._temaActual = null;
        this._generando = false;
        this._cargaInicialRealizada = false;
        
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
        
        this._guardarTimeout = null;
        this._guardadoPendiente = false;
        this._ultimoGuardadoExitoso = 0;
        
        this._configurarListenerIdioma();
        this._cargarConfiguracion();
        this._registrarEventosPersistencia();
        
        this._inicializarSeguro();
    }

    // ============================================================
    // INICIALIZACIÓN SEGURA CON REINTENTOS
    // ============================================================

    _inicializarSeguro() {
        this._intentarInicializar();
        
        let intentos = 0;
        const maxIntentos = 10;
        const intervalo = 300;
        
        const reintentar = () => {
            if (this._initDone) return;
            if (intentos >= maxIntentos) {
                console.warn('⚠️ No se pudo inicializar ModoOndasCruzadas después de ' + maxIntentos + ' intentos');
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
                console.log('⏳ ModoOndasCruzadas: Esperando DB...');
                return;
            }
            
            if (!window.modoElipse || !window.modoElipse._initDone) {
                console.log('⏳ ModoOndasCruzadas: Esperando modoElipse...');
                return;
            }
            
            const idiomaActual = this._obtenerIdiomaActual();
            this._idiomaActual = idiomaActual;
            this._cargarEstadoPorIdioma(idiomaActual);
            this._initDone = true;
            console.log('🌊 ModoOndasCruzadas v3.9: Inicializado correctamente');
            console.log(`   📊 Grafo: ${Object.keys(this._grafoElipse).length} elipses (${idiomaActual})`);
            console.log(`   💾 Datos cargados: ${this._datosCargados ? '✅ Sí' : '❌ No'}`);
            
            window.dispatchEvent(new CustomEvent('ondasCruzadasInicializado', {
                detail: { initDone: true, idioma: idiomaActual }
            }));
        } catch (error) {
            console.warn('⚠️ ModoOndasCruzadas: Error en inicialización:', error.message);
        }
    }

    // ============================================================
    // CONFIGURAR LISTENER DE IDIOMA
    // ============================================================

    _configurarListenerIdioma() {
        window.removeEventListener('idiomaCambiado', this._handleIdiomaCambiado);
        
        this._handleIdiomaCambiado = async (e) => {
            if (!this._initDone) {
                console.log('⏳ ModoOndasCruzadas: Aún no inicializado, ignorando cambio de idioma');
                return;
            }
            
            const nuevoIdioma = e.detail?.idioma;
            const idiomaAnterior = e.detail?.idiomaAnterior;
            
            console.log(`🌊 ModoOndasCruzadas: Idioma cambiado de "${idiomaAnterior}" a "${nuevoIdioma}"`);
            
            if (idiomaAnterior && this._idiomaActual !== nuevoIdioma) {
                console.log(`💾 Guardando estado del idioma anterior: ${idiomaAnterior}`);
                this._guardarEstadoPorIdioma(idiomaAnterior);
            }
            
            this._idiomaActual = nuevoIdioma;
            console.log(`📂 Cargando datos del idioma: ${nuevoIdioma}`);
            this._cargarEstadoPorIdioma(nuevoIdioma);
            
            if (window.UIOndasCruzadas && typeof window.UIOndasCruzadas._renderizarPanel === 'function') {
                try {
                    await window.UIOndasCruzadas._renderizarPanel();
                } catch (error) {
                    console.warn('⚠️ Error renderizando panel después de cambio de idioma:', error);
                }
            }
        };
        
        window.addEventListener('idiomaCambiado', this._handleIdiomaCambiado);
        console.log('🌊 ModoOndasCruzadas: Listener de idioma configurado (MULTIIDIOMA)');
    }

    // ============================================================
    // GUARDAR ESTADO POR IDIOMA
    // ============================================================

    _guardarEstadoPorIdioma(idioma) {
        if (!idioma) return;
        if (this._guardando) {
            console.log(`⏳ Ya hay un guardado en curso para ${idioma}`);
            return;
        }
        
        const ahora = Date.now();
        if (ahora - this._ultimoGuardadoExitoso < this._intervaloMinimoGuardado) {
            if (!this._guardadoPendiente) {
                this._guardadoPendiente = true;
                clearTimeout(this._guardarTimeout);
                this._guardarTimeout = setTimeout(() => {
                    this._guardadoPendiente = false;
                    this._guardarEstadoPorIdioma(idioma);
                }, this._intervaloMinimoGuardado);
            }
            return;
        }
        
        this._guardando = true;
        
        try {
            const grafoCompactado = this._compactarGrafo(this._grafoElipse);
            const recuerdoCompactado = this._compactarRecuerdo(this._recuerdoGlobal);
            const interferenciasCompactadas = this._compactarInterferencias(this._mapaInterferencias);
            
            const data = {
                version: '3.9',
                timestamp: ahora,
                idioma: idioma,
                grafoElipse: grafoCompactado,
                recuerdoGlobal: recuerdoCompactado,
                mapaInterferencias: interferenciasCompactadas,
                config: this._config || {},
                totalOndas: Object.values(grafoCompactado).reduce((acc, el) => acc + (el.totalOndas || 0), 0),
                totalElipses: Object.keys(grafoCompactado).length
            };
            
            const key = `pipeline_ondas_cruzadas_idioma_${idioma}`;
            const jsonStr = JSON.stringify(data);
            
            if (jsonStr.length > 4 * 1024 * 1024) {
                console.warn(`⚠️ Datos demasiado grandes (${Math.round(jsonStr.length/1024/1024*100)/100}MB), compactando más...`);
                const dataCompactada = this._compactarExtremo(data);
                localStorage.setItem(key, JSON.stringify(dataCompactada));
            } else {
                localStorage.setItem(key, jsonStr);
            }
            
            this._datosPorIdioma[idioma] = {
                grafoElipse: grafoCompactado,
                recuerdoGlobal: recuerdoCompactado,
                mapaInterferencias: interferenciasCompactadas,
                config: this._config,
                timestamp: ahora
            };
            
            this._ultimoGuardadoExitoso = ahora;
            console.log(`💾 Estado de Ondas Cruzadas guardado para idioma: ${idioma} (${Math.round(jsonStr.length/1024)}KB)`);
            console.log(`   📊 ${data.totalElipses} elipses, ${data.totalOndas} ondas`);
            
        } catch (error) {
            console.error(`❌ Error guardando estado para idioma ${idioma}:`, error);
            try {
                const backupKey = `pipeline_ondas_cruzadas_backup_${idioma}`;
                const backupData = {
                    version: '3.9',
                    timestamp: ahora,
                    idioma: idioma,
                    totalElipses: Object.keys(this._grafoElipse || {}).length,
                    totalOndas: Object.values(this._grafoElipse || {}).reduce((acc, el) => acc + (el.totalOndas || 0), 0)
                };
                localStorage.setItem(backupKey, JSON.stringify(backupData));
                console.log(`💾 Backup reducido guardado para ${idioma}`);
            } catch (e) {
                console.error(`❌ Error guardando backup reducido:`, e);
            }
        } finally {
            this._guardando = false;
        }
    }

    // ============================================================
    // COMPACTAR DATOS
    // ============================================================

    _compactarGrafo(grafo) {
        if (!grafo || Object.keys(grafo).length === 0) return {};
        
        const compactado = {};
        for (const [temaId, elipse] of Object.entries(grafo)) {
            const ondasCompactadas = (elipse.ondas || []).slice(0, 20).map(onda => ({
                id: onda.id,
                titulo: (onda.titulo || '').substring(0, 50),
                palabrasNuevas: (onda.palabrasNuevas || []).slice(0, 10),
                completada: !!onda.completada,
                rcnPromedio: Math.round((onda.rcnPromedio || 0) * 10) / 10,
                indice: onda.indice || 0
            }));
            
            compactado[temaId] = {
                temaId: elipse.temaId || temaId,
                temaNombre: (elipse.temaNombre || '').substring(0, 50),
                totalOndas: elipse.totalOndas || 0,
                ondas: ondasCompactadas,
                ondasReales: (elipse.ondasReales || []).slice(0, 10).map(o => ({
                    id: o.id,
                    titulo: (o.titulo || '').substring(0, 50),
                    completada: !!o.completada,
                    rcnPromedio: Math.round((o.rcnPromedio || 0) * 10) / 10
                })),
                personajesGlobales: (elipse.personajesGlobales || []).slice(0, 20),
                lugaresGlobales: (elipse.lugaresGlobales || []).slice(0, 20),
                vocabularioTotal: this._compactarMapVocabulario(elipse.vocabularioTotal),
                ultimaActualizacion: elipse.ultimaActualizacion || Date.now()
            };
        }
        return compactado;
    }

    _compactarMapVocabulario(vocabulario) {
        if (!vocabulario) return [];
        if (vocabulario instanceof Map) {
            return Array.from(vocabulario.entries())
                .slice(0, 100)
                .map(([palabra, data]) => ({
                    palabra: (palabra || '').substring(0, 30),
                    frecuencia: data.frecuencia || 1,
                    orígenes: (data.orígenes || []).slice(0, 5),
                    significado: (data.significado || '').substring(0, 50)
                }));
        }
        if (Array.isArray(vocabulario)) {
            return vocabulario.slice(0, 100);
        }
        if (typeof vocabulario === 'object') {
            return Object.entries(vocabulario)
                .slice(0, 100)
                .map(([palabra, data]) => ({
                    palabra: (palabra || '').substring(0, 30),
                    frecuencia: data.frecuencia || 1,
                    orígenes: (data.orígenes || []).slice(0, 5),
                    significado: (data.significado || '').substring(0, 50)
                }));
        }
        return [];
    }

    _compactarRecuerdo(recuerdo) {
        if (!recuerdo) return {
            personajes: [],
            lugares: [],
            eventosClave: [],
            vocabularioAcumulado: [],
            resumenGlobal: '',
            ultimaActualizacion: Date.now()
        };
        
        return {
            personajes: Array.from(recuerdo.personajes || new Set()).slice(0, 30),
            lugares: Array.from(recuerdo.lugares || new Set()).slice(0, 30),
            eventosClave: (recuerdo.eventosClave || []).slice(0, 50).map(ev => ({
                titulo: (ev.titulo || '').substring(0, 50),
                tema: ev.tema || '',
                completada: !!ev.completada,
                indice: ev.indice || 0
            })),
            vocabularioAcumulado: this._compactarMapVocabulario(recuerdo.vocabularioAcumulado || new Map()),
            resumenGlobal: (recuerdo.resumenGlobal || '').substring(0, 500),
            ultimaActualizacion: recuerdo.ultimaActualizacion || Date.now()
        };
    }

    _compactarInterferencias(interferencias) {
        if (!interferencias || Object.keys(interferencias).length === 0) return {};
        
        const compactado = {};
        for (const [tema, data] of Object.entries(interferencias)) {
            compactado[tema] = {
                temasConectados: (data.temasConectados || []).slice(0, 10),
                pesos: data.pesos || {}
            };
        }
        return compactado;
    }

    _compactarExtremo(data) {
        const compactado = {
            version: data.version || '3.9',
            timestamp: data.timestamp || Date.now(),
            idioma: data.idioma,
            totalElipses: data.totalElipses || 0,
            totalOndas: data.totalOndas || 0,
            config: data.config || {}
        };
        
        compactado.resumen = {};
        if (data.grafoElipse) {
            for (const [temaId, elipse] of Object.entries(data.grafoElipse)) {
                compactado.resumen[temaId] = {
                    nombre: (elipse.temaNombre || '').substring(0, 30),
                    ondas: elipse.totalOndas || 0
                };
            }
        }
        
        return compactado;
    }

    // ============================================================
    // CARGAR ESTADO POR IDIOMA
    // ============================================================

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

    // ============================================================
    // APLICAR DATOS
    // ============================================================

    _aplicarDatos(data) {
        if (!data) return;
        
        this._grafoElipse = data.grafoElipse || {};
        this._mapaInterferencias = data.mapaInterferencias || {};
        
        if (data.recuerdoGlobal) {
            const rg = data.recuerdoGlobal;
            this._recuerdoGlobal = {
                personajes: new Set(rg.personajes || []),
                lugares: new Set(rg.lugares || []),
                eventosClave: rg.eventosClave || [],
                vocabularioAcumulado: new Map(rg.vocabularioAcumulado || []),
                resumenGlobal: rg.resumenGlobal || '',
                ultimaActualizacion: rg.ultimaActualizacion || Date.now()
            };
        }
        
        if (data.config) {
            this._config = { ...this._config, ...data.config };
        }
    }

    // ============================================================
    // INICIALIZAR VACÍO
    // ============================================================

    _inicializarVacio() {
        this._grafoElipse = {};
        this._mapaInterferencias = {};
        this._recuerdoGlobal = {
            personajes: new Set(),
            lugares: new Set(),
            eventosClave: [],
            vocabularioAcumulado: new Map(),
            resumenGlobal: '',
            ultimaActualizacion: Date.now()
        };
        this._datosCargados = false;
    }

    // ============================================================
    // CONFIGURACIÓN
    // ============================================================

    _cargarConfiguracion() {
        try {
            const config = localStorage.getItem('pipeline_ondas_cruzadas_config');
            if (config) {
                this._config = { ...this._config, ...JSON.parse(config) };
            }
        } catch (e) {
            console.warn('⚠️ Error cargando configuración de Ondas Cruzadas:', e);
        }
    }

    _guardarConfiguracion() {
        try {
            localStorage.setItem('pipeline_ondas_cruzadas_config', JSON.stringify(this._config));
        } catch (e) {
            console.warn('⚠️ Error guardando configuración de Ondas Cruzadas:', e);
        }
    }

    // ============================================================
    // REGISTRAR EVENTOS DE PERSISTENCIA
    // ============================================================

    _registrarEventosPersistencia() {
        window.addEventListener('beforeunload', () => {
            const idiomaActual = this._obtenerIdiomaActual();
            if (Object.keys(this._grafoElipse).length > 0) {
                this._guardarEstadoPorIdioma(idiomaActual);
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && Object.keys(this._grafoElipse).length > 0) {
                const idiomaActual = this._obtenerIdiomaActual();
                this._guardarEstadoPorIdioma(idiomaActual);
            }
        });
    }

    // ============================================================
    // GUARDAR DATOS
    // ============================================================

    async _guardarDatos() {
        if (this._guardando) return;
        const idiomaActual = this._obtenerIdiomaActual();
        this._guardarEstadoPorIdioma(idiomaActual);
    }

    // ============================================================
    // INICIALIZACIÓN PÚBLICA
    // ============================================================

    async init(core) {
        if (this._initDone) return this;
        this._core = core || window.uiCore;
        
        console.log('🌊 ModoOndasCruzadas v3.9: Inicializando (MULTIIDIOMA)...');
        
        this._idiomaActual = this._obtenerIdiomaActual();
        console.log(`   📌 Idioma actual: ${this._idiomaActual}`);
        
        this._cargarEstadoPorIdioma(this._idiomaActual);
        this._registrarEventos();
        this._initDone = true;
        this._cargaInicialRealizada = true;
        
        console.log('🌊 ModoOndasCruzadas v3.9: Inicializado');
        console.log(`   📊 ${Object.keys(this._grafoElipse).length} elipses en el grafo (${this._idiomaActual})`);
        console.log(`   💾 Datos: ${this._datosCargados ? '✅' : '❌'}`);
        console.log(`   🔥 Guardado optimizado - evita QuotaExceededError`);
        console.log(`   🔥 Transcripción fonética/pinyin en plantillas`);
        console.log(`   🔥 Nombres reales de temas en lugar de IDs`);
        console.log(`   🔥 Eliminación automática de ondas duplicadas`);
        console.log(`   🔥 Recuerdo de ondas incluido en plantillas para IA`);
        console.log(`   🔥 Modal de exportación/importación restaurado`);
        console.log(`   🔥 PROMPT MULTIDIOMA: El prompt está en el idioma nativo del usuario`);
        
        return this;
    }

    // ============================================================
    // REGISTRAR EVENTOS
    // ============================================================

    _registrarEventos() {
        window.addEventListener('elipseOndaGenerada', (e) => {
            const detail = e.detail;
            if (detail && detail.temaId) {
                setTimeout(() => {
                    this._sincronizarConElipseCompleto();
                    this._guardarDatos();
                }, 500);
            }
        });
        
        window.addEventListener('elipseOndaCompletada', (e) => {
            const detail = e.detail;
            if (detail && detail.temaId) {
                setTimeout(() => {
                    this._sincronizarConElipseCompleto();
                    this._guardarDatos();
                }, 500);
            }
        });
        
        window.addEventListener('elipseTemaSeleccionado', (e) => {
            const detail = e.detail;
            if (detail && detail.temaId) {
                this._temaActual = detail.temaId;
            }
        });

        window.addEventListener('elipseDatosCargados', () => {
            setTimeout(() => {
                this._sincronizarConElipseCompleto();
                this._guardarDatos();
            }, 500);
        });

        window.addEventListener('elipseNuevaOndaGenerada', (e) => {
            const detail = e.detail;
            if (detail && detail.temaId) {
                setTimeout(() => {
                    this._sincronizarConElipseCompleto();
                    this._guardarDatos();
                }, 300);
            }
        });

        window.addEventListener('elipseSincronizada', (e) => {
            const detail = e.detail;
            if (detail && detail.temaId) {
                setTimeout(() => {
                    this._sincronizarConElipseCompleto();
                    this._guardarDatos();
                }, 300);
            }
        });
    }

    // ============================================================
    // SINCRONIZAR CON ELIPSE COMPLETO
    // ============================================================

    async _sincronizarConElipseCompleto() {
        if (!window.modoElipse) {
            console.warn('⚠️ Modo Elipse no disponible');
            return;
        }

        try {
            await window.modoElipse.cargarDatos();
            
            const idiomaActual = this._obtenerIdiomaActual();
            const todosLosTemas = await db.obtenerTemasPorIdioma(idiomaActual);
            const historiasPorTema = {};
            
            for (const tema of todosLosTemas) {
                const historias = await db.obtenerHistoriasPorTema(tema.id);
                const historiasFiltradas = historias.filter(h => h.idioma === idiomaActual);
                if (historiasFiltradas.length > 0) {
                    historiasPorTema[tema.id] = {
                        tema: tema,
                        historias: historiasFiltradas
                    };
                }
            }
            
            const elipsesActivas = window.modoElipse.getTodasLasElipses?.() || {};
            for (const [temaId, data] of Object.entries(elipsesActivas)) {
                if (data && data.totalOndas > 0) {
                    const tema = await db.obtenerTema(parseInt(temaId));
                    if (tema && tema.idioma === idiomaActual) {
                        if (!historiasPorTema[tema.id]) {
                            historiasPorTema[tema.id] = {
                                tema: tema,
                                historias: window.modoElipse.getHistoriasElipse(temaId) || []
                            };
                        }
                    }
                }
            }
            
            console.log(`📊 Temas con historias (${idiomaActual}): ${Object.keys(historiasPorTema).length}`);
            
            this._grafoElipse = {};
            
            for (const [temaId, data] of Object.entries(historiasPorTema)) {
                const tema = data.tema;
                const historias = data.historias;
                
                const todasPalabras = new Map();
                const personajesSet = new Set();
                const lugaresSet = new Set();
                const ondasProcesadas = [];
                
                for (const h of historias) {
                    const frases = await db.obtenerFrasesPorHistoria(h.id);
                    const palabrasDeOnda = [];
                    
                    const textoCompleto = frases.map(f => f.original).join(' ');
                    
                    const posiblesNombres = textoCompleto.match(/[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/g) || [];
                    for (const nombre of posiblesNombres) {
                        if (nombre.length > 2 && !personajesSet.has(nombre)) {
                            personajesSet.add(nombre);
                        }
                    }
                    
                    const palabrasClaveLugares = ['casa', 'ciudad', 'parque', 'playa', 'montaña', 'río', 'mar', 'lago', 'jardín', 'escuela', 'trabajo', 'cafetería', 'restaurante', 'hotel', 'museo'];
                    for (const lugar of palabrasClaveLugares) {
                        if (textoCompleto.toLowerCase().includes(lugar) && !lugaresSet.has(lugar)) {
                            lugaresSet.add(lugar);
                        }
                    }
                    
                    for (const f of frases) {
                        if (f.palabras && Array.isArray(f.palabras)) {
                            for (const p of f.palabras) {
                                const texto = p.palabra || p.hanzi || '';
                                if (texto && texto.length > 0) {
                                    palabrasDeOnda.push(texto);
                                    if (!todasPalabras.has(texto)) {
                                        todasPalabras.set(texto, { 
                                            frecuencia: 0, 
                                            orígenes: [],
                                            significado: p.significado || texto,
                                            familia: p.familia || 'General'
                                        });
                                    }
                                    const dataP = todasPalabras.get(texto);
                                    dataP.frecuencia++;
                                    if (!dataP.orígenes.includes(h.titulo || 'Desconocido')) {
                                        dataP.orígenes.push(h.titulo || 'Desconocido');
                                    }
                                }
                            }
                        }
                    }
                    
                    const esOnda = h._esOnda === true;
                    const ondaIndice = h._ondaIndice || 0;
                    
                    ondasProcesadas.push({
                        id: h.id,
                        titulo: h.titulo || 'Historia sin título',
                        palabrasNuevas: h._palabrasNuevas || [],
                        todasPalabras: palabrasDeOnda,
                        personajes: Array.from(personajesSet),
                        lugares: Array.from(lugaresSet),
                        completada: h.estado === 'completada' || h._completada === true,
                        rcnPromedio: h._rcnPromedio || 0,
                        indice: esOnda ? ondaIndice : 0,
                        esOnda: esOnda,
                        esBase: h._esBase || false
                    });
                }
                
                const ondasReales = ondasProcesadas.filter(h => h.esOnda === true);
                
                // Eliminar duplicados en ondas cruzadas
                const ondasUnicas = [];
                const clavesVistas = new Set();
                for (const h of ondasReales) {
                    const clave = `${h.titulo || ''}_${h.id}`;
                    if (!clavesVistas.has(clave)) {
                        clavesVistas.add(clave);
                        ondasUnicas.push(h);
                    }
                }
                
                const totalOndas = ondasUnicas.length;
                
                this._grafoElipse[temaId] = {
                    temaId: temaId,
                    temaNombre: tema.nombre,
                    totalOndas: totalOndas,
                    ondas: ondasProcesadas.slice(0, 15),
                    ondasReales: ondasUnicas.slice(0, 10),
                    personajesGlobales: Array.from(personajesSet).slice(0, 20),
                    lugaresGlobales: Array.from(lugaresSet).slice(0, 20),
                    vocabularioTotal: todasPalabras,
                    ultimaActualizacion: Date.now()
                };
            }
            
            console.log(`✅ Grafo reconstruido: ${Object.keys(this._grafoElipse).length} elipses para ${idiomaActual}`);
            
        } catch (error) {
            console.error('❌ Error sincronizando con Elipse:', error);
        }
    }

    // ============================================================
    // CALCULAR INTERFERENCIAS
    // ============================================================

    _calcularInterferencias() {
        console.log('🌊 Calculando interferencias...');
        
        const temas = Object.keys(this._grafoElipse);
        this._mapaInterferencias = {};
        
        if (temas.length < 2) {
            console.log('ℹ️ Se necesitan al menos 2 elipses');
            return;
        }
        
        for (const temaA of temas) {
            this._mapaInterferencias[temaA] = {
                temasConectados: [],
                pesos: {}
            };
            
            const elipseA = this._grafoElipse[temaA];
            
            for (const temaB of temas) {
                if (temaA === temaB) continue;
                
                const elipseB = this._grafoElipse[temaB];
                const peso = this._calcularPesoInterferencia(elipseA, elipseB);
                
                if (peso > 0.05) {
                    this._mapaInterferencias[temaA].temasConectados.push(temaB);
                    this._mapaInterferencias[temaA].pesos[temaB] = peso;
                }
            }
            
            this._mapaInterferencias[temaA].temasConectados.sort((a, b) => {
                return (this._mapaInterferencias[temaA].pesos[b] || 0) - (this._mapaInterferencias[temaA].pesos[a] || 0);
            });
        }
        
        const totalConexiones = Object.values(this._mapaInterferencias).reduce((acc, data) => acc + data.temasConectados.length, 0);
        console.log(`✅ Interferencias: ${Object.keys(this._mapaInterferencias).length} nodos, ${totalConexiones} conexiones`);
    }

    // ============================================================
    // CALCULAR PESO DE INTERFERENCIA
    // ============================================================

    _calcularPesoInterferencia(elipseA, elipseB) {
        let peso = 0;
        
        let vocabularioA, vocabularioB;
        
        if (elipseA.vocabularioTotal instanceof Map) {
            vocabularioA = new Set(elipseA.vocabularioTotal.keys());
        } else if (typeof elipseA.vocabularioTotal === 'object' && elipseA.vocabularioTotal !== null) {
            vocabularioA = new Set(Object.keys(elipseA.vocabularioTotal));
        } else if (Array.isArray(elipseA.vocabularioTotal)) {
            vocabularioA = new Set(elipseA.vocabularioTotal);
        } else {
            vocabularioA = new Set();
            if (elipseA.ondas) {
                for (const onda of elipseA.ondas) {
                    if (onda.todasPalabras) {
                        for (const p of onda.todasPalabras) {
                            vocabularioA.add(p);
                        }
                    }
                }
            }
        }
        
        if (elipseB.vocabularioTotal instanceof Map) {
            vocabularioB = new Set(elipseB.vocabularioTotal.keys());
        } else if (typeof elipseB.vocabularioTotal === 'object' && elipseB.vocabularioTotal !== null) {
            vocabularioB = new Set(Object.keys(elipseB.vocabularioTotal));
        } else if (Array.isArray(elipseB.vocabularioTotal)) {
            vocabularioB = new Set(elipseB.vocabularioTotal);
        } else {
            vocabularioB = new Set();
            if (elipseB.ondas) {
                for (const onda of elipseB.ondas) {
                    if (onda.todasPalabras) {
                        for (const p of onda.todasPalabras) {
                            vocabularioB.add(p);
                        }
                    }
                }
            }
        }
        
        const comunesVoc = new Set([...vocabularioA].filter(x => vocabularioB.has(x)));
        const pesoVocabulario = vocabularioA.size > 0 && vocabularioB.size > 0 ? 
            comunesVoc.size / Math.max(vocabularioA.size, vocabularioB.size) : 0;
        
        const personajesA = new Set(elipseA.personajesGlobales || []);
        const personajesB = new Set(elipseB.personajesGlobales || []);
        const comunesPers = new Set([...personajesA].filter(x => personajesB.has(x)));
        const pesoPersonajes = personajesA.size > 0 && personajesB.size > 0 ? 
            comunesPers.size / Math.max(personajesA.size, personajesB.size) : 0;
        
        const lugaresA = new Set(elipseA.lugaresGlobales || []);
        const lugaresB = new Set(elipseB.lugaresGlobales || []);
        const comunesLug = new Set([...lugaresA].filter(x => lugaresB.has(x)));
        const pesoLugares = lugaresA.size > 0 && lugaresB.size > 0 ? 
            comunesLug.size / Math.max(lugaresA.size, lugaresB.size) : 0;
        
        const diffTiempo = Math.abs((elipseA.ultimaActualizacion || 0) - (elipseB.ultimaActualizacion || 0));
        const pesoTiempo = Math.max(0, 1 - (diffTiempo / (7 * 24 * 60 * 60 * 1000)));
        
        peso = (pesoVocabulario * 0.4) + (pesoPersonajes * 0.25) + (pesoLugares * 0.25) + (pesoTiempo * 0.1);
        
        return Math.round(peso * 100) / 100;
    }

    // ============================================================
    // ACTUALIZAR RECUERDO GLOBAL
    // ============================================================

    _actualizarRecuerdoGlobal() {
        console.log('📚 Actualizando recuerdo global...');
        
        this._recuerdoGlobal = {
            personajes: new Set(),
            lugares: new Set(),
            eventosClave: [],
            vocabularioAcumulado: new Map(),
            resumenGlobal: '',
            ultimaActualizacion: Date.now()
        };
        
        for (const [temaId, elipse] of Object.entries(this._grafoElipse)) {
            for (const p of (elipse.personajesGlobales || [])) {
                this._recuerdoGlobal.personajes.add(p);
            }
            
            for (const l of (elipse.lugaresGlobales || [])) {
                this._recuerdoGlobal.lugares.add(l);
            }
            
            let vocabulario = null;
            if (elipse.vocabularioTotal instanceof Map) {
                vocabulario = elipse.vocabularioTotal;
            } else if (typeof elipse.vocabularioTotal === 'object' && elipse.vocabularioTotal !== null) {
                vocabulario = new Map(Object.entries(elipse.vocabularioTotal));
            } else if (Array.isArray(elipse.vocabularioTotal)) {
                vocabulario = new Map(elipse.vocabularioTotal.map(p => [p, { frecuencia: 1, orígenes: [temaId] }]));
            }
            
            if (vocabulario) {
                for (const [palabra, data] of vocabulario) {
                    if (!this._recuerdoGlobal.vocabularioAcumulado.has(palabra)) {
                        this._recuerdoGlobal.vocabularioAcumulado.set(palabra, {
                            frecuencia: 0,
                            orígenes: [],
                            temaPrincipal: temaId,
                            significado: data.significado || data.significado_base || palabra,
                            familia: data.familia || 'General'
                        });
                    }
                    const acum = this._recuerdoGlobal.vocabularioAcumulado.get(palabra);
                    acum.frecuencia += data.frecuencia || 1;
                    if (data.orígenes) {
                        for (const origen of data.orígenes) {
                            if (!acum.orígenes.includes(origen)) {
                                acum.orígenes.push(origen);
                            }
                        }
                    }
                }
            }
            
            for (const onda of (elipse.ondas || [])) {
                if (onda.titulo) {
                    this._recuerdoGlobal.eventosClave.push({
                        titulo: onda.titulo,
                        tema: temaId,
                        indice: onda.indice || 0,
                        completada: onda.completada || false,
                        palabrasNuevas: onda.palabrasNuevas || [],
                        rcnPromedio: onda.rcnPromedio || 0
                    });
                }
            }
        }
        
        this._recuerdoGlobal.resumenGlobal = this._generarResumenGlobal();
        
        console.log(`✅ Recuerdo: ${this._recuerdoGlobal.personajes.size} personajes, ${this._recuerdoGlobal.lugares.size} lugares, ${this._recuerdoGlobal.vocabularioAcumulado.size} palabras`);
    }

    // ============================================================
    // GENERAR RESUMEN GLOBAL
    // ============================================================

    _generarResumenGlobal() {
        const personajes = Array.from(this._recuerdoGlobal.personajes || new Set()).slice(0, 10);
        const lugares = Array.from(this._recuerdoGlobal.lugares || new Set()).slice(0, 10);
        const vocabulario = Array.from(this._recuerdoGlobal.vocabularioAcumulado?.keys() || []).slice(0, 15);
        const totalEventos = this._recuerdoGlobal.eventosClave?.length || 0;
        const totalPalabras = this._recuerdoGlobal.vocabularioAcumulado?.size || 0;
        const idioma = this._obtenerIdiomaActual();
        const nombreIdioma = this._getNombreIdioma(idioma);
        
        let resumen = `📚 RESUMEN DE ONDAS CRUZADAS (${nombreIdioma})\n\n`;
        
        resumen += `📊 ESTADÍSTICAS:\n`;
        resumen += `   • Total de ondas: ${totalEventos}\n`;
        resumen += `   • Palabras acumuladas: ${totalPalabras}\n`;
        resumen += `   • Personajes: ${personajes.length > 0 ? personajes.join(', ') : 'Ninguno'}\n`;
        resumen += `   • Lugares: ${lugares.length > 0 ? lugares.join(', ') : 'Ninguno'}\n`;
        
        if (vocabulario.length > 0) {
            resumen += `\n📝 VOCABULARIO DESTACADO:\n`;
            resumen += `   • ${vocabulario.join(', ')}`;
            if (totalPalabras > 15) {
                resumen += ` y ${totalPalabras - 15} palabras más`;
            }
            resumen += `\n`;
        }
        
        if (this._recuerdoGlobal.eventosClave && this._recuerdoGlobal.eventosClave.length > 0) {
            const ultimosEventos = this._recuerdoGlobal.eventosClave.slice(-3);
            resumen += `\n📖 ÚLTIMOS EVENTOS:\n`;
            for (const ev of ultimosEventos) {
                const estado = ev.completada ? '✅' : '📖';
                resumen += `   • ${estado} ${ev.titulo || 'Evento'}\n`;
            }
        }
        
        resumen += `\n🔄 Última actualización: ${new Date(this._recuerdoGlobal.ultimaActualizacion || Date.now()).toLocaleString()}`;
        
        return resumen;
    }

    // ============================================================
    // OBTENER IDIOMA ACTUAL
    // ============================================================

    _obtenerIdiomaActual() {
        try {
            return gestorIdiomas?.getIdiomaActivo() || 'es';
        } catch (e) {
            return 'es';
        }
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

    // ============================================================
    // VERIFICAR SI ES JEROGLÍFICO
    // ============================================================

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        const jeroglificos = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        return jeroglificos.some(item => idiomaLower.includes(item) || item.includes(idiomaLower));
    }

    // ============================================================
    // OBTENER IDIOMA NATIVO DEL USUARIO
    // ============================================================

    _obtenerIdiomaNativo() {
        try {
            const usuario = localStorage.getItem('pipeline_usuario');
            if (usuario) {
                const parsed = JSON.parse(usuario);
                return parsed.idiomaNativo || 'español';
            }
            return 'español';
        } catch (e) {
            return 'español';
        }
    }

    // ============================================================
    // MÉTODOS PÚBLICOS
    // ============================================================

    getEstado() {
        const totalOndas = Object.values(this._grafoElipse).reduce((acc, el) => acc + (el.totalOndas || 0), 0);
        const totalInterferencias = Object.values(this._mapaInterferencias).reduce((acc, data) => acc + data.temasConectados.length, 0);
        const idiomaActual = this._obtenerIdiomaActual();
        
        return {
            initDone: this._initDone,
            grafoSize: Object.keys(this._grafoElipse).length,
            ondasTotales: totalOndas,
            interferencias: totalInterferencias,
            recuerdoGlobal: {
                personajes: this._recuerdoGlobal.personajes?.size || 0,
                lugares: this._recuerdoGlobal.lugares?.size || 0,
                vocabulario: this._recuerdoGlobal.vocabularioAcumulado?.size || 0,
                eventos: this._recuerdoGlobal.eventosClave?.length || 0
            },
            config: this._config,
            datosCargados: this._datosCargados,
            idiomaActual: idiomaActual
        };
    }

    getGrafoElipse() {
        return this._grafoElipse;
    }

    getInterferencias(temaId) {
        if (temaId) {
            return this._mapaInterferencias[temaId] || null;
        }
        return this._mapaInterferencias;
    }

    getRecuerdoGlobal() {
        return {
            personajes: Array.from(this._recuerdoGlobal.personajes || new Set()),
            lugares: Array.from(this._recuerdoGlobal.lugares || new Set()),
            eventosClave: this._recuerdoGlobal.eventosClave || [],
            vocabularioAcumulado: Array.from(this._recuerdoGlobal.vocabularioAcumulado?.keys() || []),
            resumenGlobal: this._recuerdoGlobal.resumenGlobal || '',
            ultimaActualizacion: this._recuerdoGlobal.ultimaActualizacion || Date.now()
        };
    }

    getRecuerdoCompleto(pagina = 1, itemsPorPagina = 20, filtro = '') {
        const vocabularioArray = Array.from(this._recuerdoGlobal.vocabularioAcumulado || new Map());
        
        let vocabularioFiltrado = vocabularioArray;
        if (filtro) {
            const filtroLower = filtro.toLowerCase();
            vocabularioFiltrado = vocabularioArray.filter(([palabra, data]) => 
                palabra.toLowerCase().includes(filtroLower) ||
                (data.significado && data.significado.toLowerCase().includes(filtroLower)) ||
                (data.familia && data.familia.toLowerCase().includes(filtroLower))
            );
        }
        
        vocabularioFiltrado.sort((a, b) => (b[1]?.frecuencia || 0) - (a[1]?.frecuencia || 0));
        
        const totalVocabulario = vocabularioFiltrado.length;
        const totalPaginas = Math.max(1, Math.ceil(totalVocabulario / itemsPorPagina));
        const paginaActual = Math.min(pagina, totalPaginas);
        const inicio = (paginaActual - 1) * itemsPorPagina;
        const fin = Math.min(inicio + itemsPorPagina, totalVocabulario);
        const vocabularioPagina = vocabularioFiltrado.slice(inicio, fin);
        
        return {
            personajes: Array.from(this._recuerdoGlobal.personajes || new Set()),
            lugares: Array.from(this._recuerdoGlobal.lugares || new Set()),
            eventos: this._recuerdoGlobal.eventosClave.map(ev => ({
                titulo: ev.titulo || 'Sin título',
                tema: ev.tema || 'Desconocido',
                indice: ev.indice || 0,
                completada: ev.completada || false,
                palabrasNuevas: ev.palabrasNuevas || [],
                rcnPromedio: ev.rcnPromedio || 0
            })),
            vocabulario: vocabularioPagina.map(([palabra, data]) => ({
                palabra: palabra,
                significado: data.significado || palabra,
                familia: data.familia || 'General',
                frecuencia: data.frecuencia || 1,
                origenes: data.orígenes || []
            })),
            totalVocabulario,
            paginaActual,
            totalPaginas,
            itemsPorPagina,
            filtro,
            resumenGlobal: this._recuerdoGlobal.resumenGlobal || '',
            ultimaActualizacion: this._recuerdoGlobal.ultimaActualizacion || Date.now()
        };
    }

    getElipse(temaId) {
        return this._grafoElipse[temaId] || null;
    }

    getTemasConectados(temaId) {
        return this._mapaInterferencias[temaId]?.temasConectados || [];
    }

    getPesoInterferencia(temaA, temaB) {
        return this._mapaInterferencias[temaA]?.pesos?.[temaB] || 0;
    }

    getConfiguracion() {
        return { ...this._config };
    }

    async actualizarConfiguracion(nuevaConfig) {
        this._config = { ...this._config, ...nuevaConfig };
        this._guardarConfiguracion();
        this._guardarDatos();
        return this._config;
    }

    async sincronizarConElipse(temaId) {
        await this._sincronizarConElipseCompleto();
        this._guardarDatos();
    }

    async sincronizarTodasLasElipses() {
        await this._sincronizarConElipseCompleto();
        this._guardarDatos();
    }

    limpiarGrafo() {
        const idiomaActual = this._obtenerIdiomaActual();
        if (confirm(`🧹 ¿Limpiar todo el grafo de Ondas Cruzadas para ${idiomaActual}?\n\n⚠️ Esta acción NO se puede deshacer.`)) {
            this._grafoElipse = {};
            this._mapaInterferencias = {};
            this._recuerdoGlobal = {
                personajes: new Set(),
                lugares: new Set(),
                eventosClave: [],
                vocabularioAcumulado: new Map(),
                resumenGlobal: '',
                ultimaActualizacion: Date.now()
            };
            this._guardarEstadoPorIdioma(idiomaActual);
            delete this._datosPorIdioma[idiomaActual];
            this._datosCargados = false;
            this._cargaInicialRealizada = false;
            console.log(`🧹 Grafo limpiado para ${idiomaActual}`);
            if (this._core) {
                this._core.mostrarToast(`🧹 Grafo limpiado para ${idiomaActual}`, 'warning');
            }
        }
    }

    // ============================================================
    // GENERAR ONDA CRUZADA - CON RECUERDO PARA IA Y PROMPT MULTIDIOMA
    // ============================================================

    async generarOndaCruzada(temaId, configuracion = {}) {
        if (this._generando) {
            throw new Error('Ya hay una generación en curso');
        }
        
        if (!window.modoElipse) {
            throw new Error('Modo Elipse no disponible');
        }

        this._generando = true;
        const idiomaObjetivo = this._obtenerIdiomaActual();
        const idiomaPrompt = this._obtenerIdiomaNativo() || 'es';
        const nombreIdiomaObjetivo = this._getNombreIdioma(idiomaObjetivo);
        const nombreIdiomaPrompt = this._getNombreIdioma(idiomaPrompt);
        const esJeroglifico = this._esJeroglifico(idiomaObjetivo);
        
        try {
            await this._sincronizarConElipseCompleto();
            this._calcularInterferencias();
            this._actualizarRecuerdoGlobal();
            
            const elipse = this._grafoElipse[temaId];
            if (!elipse) {
                console.warn(`⚠️ Tema "${temaId}" no encontrado en el grafo para ${nombreIdiomaObjetivo}`);
                await this._sincronizarConElipseCompleto();
                if (!this._grafoElipse[temaId]) {
                    throw new Error(`El tema "${temaId}" no tiene ondas. Genera ondas primero en Modo Elipse para ${nombreIdiomaObjetivo}.`);
                }
            }
            
            let temaIdReal = temaId;
            try {
                const tema = await db.obtenerTema(parseInt(temaId));
                if (tema) {
                    temaIdReal = tema.id;
                }
            } catch (e) {
                console.warn(`⚠️ Error obteniendo tema ${temaId}:`, e);
            }
            
            console.log(`🌊 Generando onda cruzada para tema: ${temaIdReal} (${nombreIdiomaObjetivo})`);
            
            const interferencia = this._mapaInterferencias[temaIdReal];
            let temasConectados = interferencia?.temasConectados || [];
            
            if (temasConectados.length === 0) {
                const todosLosTemas = Object.keys(this._grafoElipse);
                const otrosTemas = todosLosTemas.filter(id => id !== temaIdReal);
                
                if (otrosTemas.length === 0) {
                    throw new Error('No hay otros temas disponibles para cruzar. Genera ondas en otro tema primero.');
                }
                
                this._mapaInterferencias[temaIdReal] = {
                    temasConectados: otrosTemas,
                    pesos: {}
                };
                for (const otroTema of otrosTemas) {
                    this._mapaInterferencias[temaIdReal].pesos[otroTema] = 0.5;
                }
                temasConectados = otrosTemas;
            }

            const config = {
                ondasParaCruzar: configuracion.ondasParaCruzar || this._config.ondasParaCruzar,
                maxElipses: configuracion.maxElipses || this._config.maxElipsesParaCruzar,
                incluirPersonajes: configuracion.incluirPersonajes !== undefined ? configuracion.incluirPersonajes : this._config.incluirPersonajes,
                incluirLugares: configuracion.incluirLugares !== undefined ? configuracion.incluirLugares : this._config.incluirLugares,
                palabrasNuevas: configuracion.palabrasNuevas || this._config.palabrasNuevasPorOnda,
                nivel: configuracion.nivel || this._config.nivelBase,
                pesoVocabularioPrestado: configuracion.pesoVocabularioPrestado || this._config.pesoVocabularioPrestado
            };

            temasConectados = temasConectados.slice(0, config.maxElipses);
            
            if (temasConectados.length === 0) {
                throw new Error('No hay temas conectados disponibles');
            }

            const vocabularioPrestado = [];
            const personajesPrestados = [];
            const lugaresPrestados = [];

            for (const temaConectado of temasConectados) {
                const elipseConectado = this._grafoElipse[temaConectado];
                if (!elipseConectado) continue;

                const ondasRecientes = elipseConectado.ondasReales || elipseConectado.ondas || [];
                const ondasParaCruzar = ondasRecientes.slice(-config.ondasParaCruzar);

                for (const onda of ondasParaCruzar) {
                    if (onda.palabrasNuevas) {
                        for (const p of onda.palabrasNuevas) {
                            if (!vocabularioPrestado.some(item => item.palabra === p.palabra)) {
                                vocabularioPrestado.push({
                                    palabra: p.palabra || p,
                                    significado: p.significado || p,
                                    familia_semantica: p.familia_semantica || p.familia || 'General'
                                });
                            }
                        }
                    }
                    if (config.incluirPersonajes && onda.personajes) {
                        for (const p of onda.personajes) {
                            if (!personajesPrestados.includes(p)) {
                                personajesPrestados.push(p);
                            }
                        }
                    }
                    if (config.incluirLugares && onda.lugares) {
                        for (const l of onda.lugares) {
                            if (!lugaresPrestados.includes(l)) {
                                lugaresPrestados.push(l);
                            }
                        }
                    }
                }
            }

            const numPalabrasPrestadas = Math.max(1, Math.round(config.palabrasNuevas * config.pesoVocabularioPrestado));
            const vocabularioFinal = vocabularioPrestado.slice(0, numPalabrasPrestadas);
            const vocabularioStrings = vocabularioFinal.map(item => item.palabra);

            console.log(`📊 Vocabulario prestado: ${vocabularioStrings.length} palabras`);

            // 🔥 CONSTRUIR RECUERDO PARA LA IA
            const recuerdoTexto = this._construirRecuerdoParaIA(temaIdReal, idiomaObjetivo, idiomaPrompt);

            // 🔥 GENERAR PLANTILLA CON RECUERDO Y PROMPT MULTIDIOMA
            let plantilla = null;

            if (window.modoElipse && typeof window.modoElipse.generarPlantillaOnda === 'function') {
                try {
                    plantilla = await window.modoElipse.generarPlantillaOnda(temaIdReal);
                } catch (e) {
                    console.warn('⚠️ Error generando plantilla con Modo Elipse:', e.message);
                    plantilla = null;
                }
            }

            if (!plantilla) {
                console.log('📄 Usando generador de plantilla de respaldo...');
                
                const temaInfo = await db.obtenerTema(parseInt(temaIdReal));
                if (!temaInfo) {
                    throw new Error('No se pudo obtener la información del tema para generar la plantilla.');
                }

                // 🔥 CONSTRUIR PROMPT EN IDIOMA NATIVO
                let promptCompleto = `Genera una nueva historia (onda) que sea una continuación de las historias anteriores del tema.\n\n`;
                promptCompleto += `Idioma objetivo: ${nombreIdiomaObjetivo}\n`;
                promptCompleto += `Nivel: ${temaInfo.nivel || 'A1'}\n`;
                promptCompleto += `Tema: "${temaInfo.nombre}"\n\n`;
                promptCompleto += recuerdoTexto;
                promptCompleto += `\n\nLa historia debe tener entre 6 y 8 frases.\n`;
                promptCompleto += `Cada frase debe tener: 'original', 'traduccion', 'palabras' desglosadas.\n`;
                promptCompleto += `Incluye 'regla_gramatical' y 'explicacion_gramatical' para cada frase.\n`;
                if (esJeroglifico) {
                    promptCompleto += `⚠️ IMPORTANTE: Incluye 'pinyin' CON TONOS para CADA frase y CADA palabra.\n`;
                    promptCompleto += `Incluye 'segmentacion' con 'hanzi' y 'pinyin' separados.\n`;
                    promptCompleto += `El pinyin DEBE incluir números de tono (ma1, ma2, ma3, ma4) o diacríticos (mā, má, mǎ, mà).\n`;
                } else {
                    promptCompleto += `⚠️ IMPORTANTE: Incluye 'transcripcion' para CADA frase y CADA palabra en ${nombreIdiomaPrompt}.\n`;
                    promptCompleto += `La transcripción debe ser FÁCIL DE LEER para un hablante nativo de ${nombreIdiomaPrompt}.\n`;
                    promptCompleto += `Ejemplo: "I have a pencil" → transcripción: "ai jaf a pensil" (para español).\n`;
                }
                promptCompleto += `Responde SOLO en formato JSON válido.\n`;
                promptCompleto += `NO incluyas texto adicional fuera del JSON.\n`;

                plantilla = {
                    "_INSTRUCCIONES_PARA_IA": {
                        "version": "3.9",
                        "idioma_prompt": idiomaPrompt,
                        "idioma_objetivo": idiomaObjetivo,
                        "nombre_idioma_prompt": nombreIdiomaPrompt,
                        "nombre_idioma_objetivo": nombreIdiomaObjetivo,
                        "accion": "Genera una nueva historia (onda) para el Modo Ondas Cruzadas",
                        "nivel": temaInfo.nivel || 'A1',
                        "tema": temaInfo.nombre,
                        "tema_id": temaIdReal,
                        "num_historias": 1,
                        "es_jeroglifico": esJeroglifico,
                        "prompt": promptCompleto,
                        "recuerdo_contexto": recuerdoTexto,
                        "instrucciones": [
                            `El prompt completo está en el campo "prompt".`,
                            `El idioma objetivo para la historia es: ${nombreIdiomaObjetivo}.`,
                            `Responde SOLO en formato JSON válido.`,
                            `NO incluyas texto adicional fuera del JSON.`
                        ],
                        "formato_palabras": esJeroglifico ? {
                            "hanzi": "El carácter en el idioma objetivo",
                            "pinyin": "Pronunciación con tonos",
                            "familia": "Familia SEMÁNTICA",
                            "tipo": "Categoría GRAMATICAL",
                            "significado": `Traducción al ${nombreIdiomaPrompt}`
                        } : {
                            "palabra": "La palabra en el idioma objetivo",
                            "transcripcion": `Transcripción fonética en ${nombreIdiomaPrompt}`,
                            "familia": "Familia SEMÁNTICA",
                            "tipo": "Categoría GRAMATICAL",
                            "significado": `Traducción al ${nombreIdiomaPrompt}`
                        }
                    },
                    "meta": {
                        "tema": temaInfo.nombre,
                        "tema_id": temaIdReal,
                        "idioma_objetivo": idiomaObjetivo,
                        "nombre_idioma_objetivo": nombreIdiomaObjetivo,
                        "idioma_prompt": idiomaPrompt,
                        "nombre_idioma_prompt": nombreIdiomaPrompt,
                        "nivel": temaInfo.nivel || 'A1',
                        "num_historias": 1,
                        "fecha_generacion": new Date().toISOString(),
                        "version": "3.9"
                    },
                    "historias": []
                };

                const historia = { id: 1, titulo: `Nueva onda para "${temaInfo.nombre}"`, frases: [] };
                for (let i = 1; i <= 6; i++) {
                    const frase = {
                        original: `[Frase ${i} en ${nombreIdiomaObjetivo}]`,
                        traduccion: `[Traducción ${i} al ${nombreIdiomaPrompt}]`,
                        regla_gramatical: `[Regla ${i}]`,
                        explicacion_gramatical: `[Explicación ${i}]`,
                        palabras: []
                    };
                    
                    if (esJeroglifico) {
                        frase.pinyin = `[pinyin_con_tonos_frase_${i}]`;
                        frase.segmentacion = {
                            hanzi: `[hanzi_frase_${i}]`,
                            pinyin: `[pinyin_frase_${i}]`
                        };
                        frase.palabras.push({
                            hanzi: `[hanzi_palabra_${i}]`,
                            pinyin: `[pinyin_de_palabra_${i}]`,
                            familia: `[familia_semantica]`,
                            tipo: `[tipo_gramatical]`,
                            significado: `[significado_en_${nombreIdiomaPrompt}]`
                        });
                    } else {
                        frase.transcripcion = `[transcripcion_en_${nombreIdiomaPrompt}_de_la_frase_${i}]`;
                        frase.palabras.push({
                            palabra: `[palabra_${i}]`,
                            transcripcion: `[transcripcion_en_${nombreIdiomaPrompt}_de_palabra_${i}]`,
                            familia: `[familia_semantica]`,
                            tipo: `[tipo_gramatical]`,
                            significado: `[significado_en_${nombreIdiomaPrompt}]`
                        });
                    }
                    historia.frases.push(frase);
                }
                plantilla.historias.push(historia);

                console.log('✅ Plantilla de respaldo generada correctamente.');
            }

            // 🔥 ENRIQUECER PLANTILLA CON INSTRUCCIONES CRUZADAS
            const instruccionesCruce = `
🔥 **INSTRUCCIONES ESPECIALES - ONDA CRUZADA 🔥**

📌 **TEMA PRINCIPAL:** "${elipse?.temaNombre || temaIdReal}"
🔗 **TEMAS CONECTADOS:** ${temasConectados.map(id => this._grafoElipse[id]?.temaNombre || id).join(', ')}

📝 **VOCABULARIO PRESTADO (DEBE INCLUIR):**
${vocabularioStrings.map(p => `  - "${p}"`).join('\n')}

👤 **PERSONAJES DE OTROS TEMAS (OPCIONALES):**
${personajesPrestados.map(p => `  - ${p}`).join('\n')}

📍 **LUGARES DE OTROS TEMAS (OPCIONALES):**
${lugaresPrestados.map(l => `  - ${l}`).join('\n')}

🎯 **REGLAS:**
1. La historia debe ser CONTINUACIÓN del tema principal.
2. DEBES INCLUIR al menos ${Math.min(2, vocabularioStrings.length)} palabras del vocabulario prestado.
3. Introduce EXACTAMENTE ${config.palabrasNuevas} palabras nuevas.
4. Nivel de dificultad: ${config.nivel}.
5. NO uses placeholders.
${esJeroglifico ? '6. 🔥 IMPORTANTE: Incluye PINYIN con tonos para TODAS las palabras y frases.' : '6. 🔥 IMPORTANTE: Incluye TRANSCRIPCIÓN FONÉTICA en ' + nombreIdiomaPrompt + ' para TODAS las palabras y frases.'}
`;

            plantilla._INSTRUCCIONES_PARA_IA = {
                ...plantilla._INSTRUCCIONES_PARA_IA,
                esOndaCruzada: true,
                temasConectados: temasConectados,
                vocabularioPrestado: vocabularioFinal,
                vocabularioPrestadoSimple: vocabularioStrings,
                personajesPrestados: personajesPrestados.slice(0, 3),
                lugaresPrestados: lugaresPrestados.slice(0, 3),
                instruccionesCruce: instruccionesCruce,
                numPalabrasNuevas: config.palabrasNuevas,
                nivel: config.nivel,
                temaPrincipal: temaIdReal,
                es_jeroglifico: esJeroglifico,
                incluir_transcripcion: !esJeroglifico,
                incluir_pinyin: esJeroglifico,
                recuerdo_contexto: recuerdoTexto
            };

            // 🔥 AÑADIR CAMPOS DE TRANSCRIPCIÓN/PINYIN A LAS FRASES
            if (plantilla.historias && plantilla.historias.length > 0) {
                for (const historia of plantilla.historias) {
                    if (historia.frases) {
                        for (const frase of historia.frases) {
                            if (esJeroglifico) {
                                if (!frase.pinyin) frase.pinyin = '[pinyin_con_tonos_de_la_frase]';
                                if (!frase.segmentacion) {
                                    frase.segmentacion = {
                                        hanzi: '[hanzi_de_la_frase]',
                                        pinyin: '[pinyin_de_la_frase]'
                                    };
                                }
                                if (frase.palabras) {
                                    for (const p of frase.palabras) {
                                        if (!p.pinyin) p.pinyin = '[pinyin_de_la_palabra]';
                                        if (!p.hanzi && p.palabra) p.hanzi = p.palabra;
                                    }
                                }
                            } else {
                                if (!frase.transcripcion) {
                                    frase.transcripcion = `[transcripcion_en_${nombreIdiomaPrompt}_de_la_frase]`;
                                }
                                if (frase.palabras) {
                                    for (const p of frase.palabras) {
                                        if (!p.transcripcion) {
                                            p.transcripcion = `[transcripcion_en_${nombreIdiomaPrompt}_de_la_palabra]`;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Guardar solo si hay cambios significativos
            if (Object.keys(this._grafoElipse).length > 0) {
                this._guardarDatos();
            }

            console.log(`✅ Plantilla de onda cruzada generada con ${esJeroglifico ? 'pinyin' : 'transcripción'} (${nombreIdiomaObjetivo})`);
            console.log(`📚 Recuerdo incluido en la plantilla para la IA`);
            console.log(`💬 Prompt generado en ${nombreIdiomaPrompt}`);

            this._generando = false;
            return plantilla;

        } catch (error) {
            this._generando = false;
            console.error('❌ Error generando onda cruzada:', error);
            throw error;
        }
    }

    // ============================================================
    // CONSTRUIR RECUERDO PARA LA IA - MULTIDIOMA
    // ============================================================

    _construirRecuerdoParaIA(temaId, idiomaObjetivo, idiomaPrompt) {
        const historiasElipse = this._grafoElipse[temaId]?.ondas || [];
        const nombreIdiomaObjetivo = this._getNombreIdioma(idiomaObjetivo);
        const nombreIdiomaPrompt = this._getNombreIdioma(idiomaPrompt);
        
        if (historiasElipse.length === 0) {
            return `📖 No hay historias previas. Esta es la primera onda del tema en ${nombreIdiomaObjetivo}.`;
        }

        const historiasOrdenadas = [...historiasElipse].sort((a, b) => a.indice - b.indice);
        
        let recuerdoTexto = `📚 **CONTEXTO DE ONDAS ANTERIORES (${nombreIdiomaObjetivo})**\n\n`;
        
        for (const h of historiasOrdenadas) {
            const estado = h.completada ? '✅ COMPLETADA' : '📖 EN PROGRESO';
            recuerdoTexto += `🌊 Onda ${h.indice + 1}: "${h.titulo}" (${estado})\n`;
            if (h.palabrasNuevas && h.palabrasNuevas.length > 0) {
                recuerdoTexto += `   📝 Palabras nuevas: ${h.palabrasNuevas.join(', ')}\n`;
            }
            if (h.rcnPromedio > 0) {
                recuerdoTexto += `   📊 RCN promedio: ${h.rcnPromedio.toFixed(1)}\n`;
            }
            recuerdoTexto += '\n';
        }

        // Añadir vocabulario acumulado
        const vocabularioAcumulado = this._recuerdoGlobal.vocabularioAcumulado || new Map();
        if (vocabularioAcumulado.size > 0) {
            const palabrasMostrar = Array.from(vocabularioAcumulado.keys()).slice(0, 20);
            recuerdoTexto += `📝 **VOCABULARIO ACUMULADO (${nombreIdiomaObjetivo}):**\n`;
            recuerdoTexto += `   ${palabrasMostrar.join(', ')}`;
            if (vocabularioAcumulado.size > 20) {
                recuerdoTexto += ` y ${vocabularioAcumulado.size - 20} palabras más`;
            }
            recuerdoTexto += '\n\n';
        }

        // Añadir personajes
        const personajes = this._recuerdoGlobal.personajes || new Set();
        if (personajes.size > 0) {
            recuerdoTexto += `👤 **PERSONAJES:** ${Array.from(personajes).join(', ')}\n\n`;
        }

        // Añadir lugares
        const lugares = this._recuerdoGlobal.lugares || new Set();
        if (lugares.size > 0) {
            recuerdoTexto += `📍 **LUGARES:** ${Array.from(lugares).join(', ')}\n\n`;
        }

        recuerdoTexto += `🎯 **REGLAS DE CONTINUIDAD (${nombreIdiomaObjetivo}):**\n`;
        recuerdoTexto += `1. La NUEVA historia debe ser una CONTINUACIÓN DIRECTA de la historia anterior.\n`;
        recuerdoTexto += `2. Mantén los MISMOS personajes y ambientación.\n`;
        recuerdoTexto += `3. Introduce EXACTAMENTE las palabras nuevas indicadas.\n`;
        recuerdoTexto += `4. El nivel de dificultad es ${this._config.nivelBase}.\n`;
        recuerdoTexto += `5. La historia debe tener COHERENCIA narrativa con TODO lo anterior.\n`;
        recuerdoTexto += `6. NO reuses las palabras nuevas de ondas anteriores como palabras nuevas.\n`;

        return recuerdoTexto;
    }

    // ============================================================
    // DESTRUIR
    // ============================================================

    destroy() {
        const idiomaActual = this._obtenerIdiomaActual();
        this._guardarEstadoPorIdioma(idiomaActual);
        this._initDone = false;
        console.log('🛑 Modo Ondas Cruzadas: Destruido');
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

const modoOndasCruzadas = new ModoOndasCruzadas();
window.modoOndasCruzadas = modoOndasCruzadas;

console.log('✅ Modo Ondas Cruzadas v3.9 - CON PROMPT MULTIDIOMA');
console.log('  🔥 El prompt para la IA externa se genera en el idioma nativo del usuario');
console.log('  🔥 El idioma objetivo para la historia se especifica claramente');
console.log('  🔥 La plantilla incluye campos para ambos idiomas');
console.log('  🔥 Recuerdo de ondas incluido en plantillas para IA');
console.log('  🔥 Instrucciones claras para la IA');
console.log('  🔥 Nombres reales de temas en lugar de IDs');
console.log('  🔥 Eliminación automática de ondas duplicadas');
console.log('  🔥 Resumen global mejorado con estadísticas clave');
console.log('  🔥 Transcripción fonética para idiomas alfabéticos');
console.log('  🔥 Pinyin con tonos para idiomas jeroglíficos');
console.log('  🔥 Guardado optimizado - evita QuotaExceededError');
console.log('  ✅ Todas las funcionalidades originales preservadas');