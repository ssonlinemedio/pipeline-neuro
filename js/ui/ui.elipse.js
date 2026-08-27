// ============================================================
// UI ELIPSE v6.22 - CORREGIDO: FILTRO UNIFICADO DE ONDAS CRUZADAS
// TODAS LAS LECTURAS DE getHistoriasElipse() PASAN POR _filtrarOndasElipse()
// ============================================================

class UIEclipse {
    constructor() {
        this._core = null;
        this._container = null;
        this._temaId = null;
        this._cargando = false;
        this._elipseData = null;
        this._modoVista = 'panel';
        this._paginaOndas = 1;
        this._ondasPorPagina = 5;
        this._initDone = false;
        this._importando = false;
        this._busqueda = '';
        this._resultadosBusqueda = [];
        this._modoBusqueda = false;
        this._historiaLeida = null;
        this._volviendoDeLectura = false;
        this._modoEstudioRapido = false;
        this._ondasFiltradas = [];
        this._origenNavegacion = null;
        this._historiaEnEstudio = null;

        this._callbackVolver = null;
        this._modoAnterior = null;
        this._esperandoRetorno = false;
        this._origenAccion = null;

        this._recomendaciones = [];
        this._siguienteOndaSugerida = null;
        this._progresoGlobal = 0;
        this._tiempoEstudio = 0;
        this._inicioSesion = Date.now();
        this._ondasRevisadas = new Set();
        this._palabrasNuevasPorOnda = {};

        this._visorAbierto = false;
        this._historiaVisor = null;
        this._frasesVisor = [];

        this._modalPalabraAbierto = false;
        this._palabraSeleccionada = null;

        this._ultimaVerificacionSRS = 0;
        this._intervaloSRS = 5000;
        this._progresoOndas = {};

        this._botonInyectado = false;
        this._datosCargados = false;
        this._renderizadoCompleto = false;
        this._primeraCarga = true;
        this._temaSeleccionadoPorUsuario = false;

        this._recargaEnProgreso = false;
        this._ultimoIntentoCarga = 0;
        this._tiempoEsperaRecarga = 5000;
        this._cachePorTema = {};
        this._temaActualCargado = null;
        this._creandoContainer = false;
        this._containerCreado = false;
        this._ultimoIdioma = null;
        this._recargaForzada = false;

        this._mostrandoOndasCruzadas = false;
        this._ondasCruzadasInicializadas = false;

        this._registrarListenerEstadoHistorias();
        this._registrarListenerEliminacionHistorias();
    }

    // ============================================================
    // 🔥 FILTRO UNIFICADO PARA EXCLUIR ONDAS CRUZADAS (CORREGIDO)
    // ============================================================
    _esOndaCruzada(historia) {
        if (!historia) return false;
        return historia._esOndaCruzada === true;
    }

    _filtrarOndasElipse(historias) {
        if (!historias || !Array.isArray(historias)) return [];
        return historias.filter(h => !this._esOndaCruzada(h));
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

    _registrarListenerEstadoHistorias() {
        window.addEventListener('historiaEstadoCambiado', (e) => {
            if (e.detail?.tipo === 'onda_elipse' || e.detail?.tipo === 'onda_cruzada') {
                console.log('🌌 UIElipse: Estado de onda cambiado', e.detail);
                this._actualizarProgresoGlobal();
                this._actualizarRecomendaciones();
                if (!this._visorAbierto && !this._modalPalabraAbierto) {
                    this._renderizarPanel(this._temaId);
                } else if (this._visorAbierto) {
                    this._cerrarVisorYVolver();
                }
            }
        });
    }

    _registrarListenerEliminacionHistorias() {
        window.addEventListener('historiaEliminada', (e) => {
            const detail = e.detail || {};
            const historiaId = detail.historiaId;
            const temaId = detail.temaId;

            console.log(`🗑️ UIElipse: Historia eliminada detectada: ${historiaId} (tema: ${temaId})`);

            if (window.modoElipse) {
                const index = window.modoElipse._historiasElipse.findIndex(h => h.id === historiaId);
                if (index !== -1) {
                    window.modoElipse._historiasElipse.splice(index, 1);
                    window.modoElipse._estadisticas.totalOndas = window.modoElipse._historiasElipse.length;
                    window.modoElipse._guardarEstadoElipse();
                    console.log(`🌌 Onda ${historiaId} eliminada de la Elipse (evento)`);

                    if (window.modoElipse._recuerdoOndas && window.modoElipse._recuerdoOndas.resumenPorOnda) {
                        const indices = Object.keys(window.modoElipse._recuerdoOndas.resumenPorOnda);
                        for (const idx of indices) {
                            if (window.modoElipse._recuerdoOndas.resumenPorOnda[idx].id === historiaId) {
                                delete window.modoElipse._recuerdoOndas.resumenPorOnda[idx];
                            }
                        }
                        window.modoElipse._guardarRecuerdoOndas();
                    }
                }
            }

            if (this._temaId == temaId || this._temaId == detail.temaDbId) {
                this._datosCargados = false;
                this._elipseData = null;
                this._cachePorTema = {};
                setTimeout(() => {
                    this._cargarYRenderizar();
                }, 200);
            }
        });
    }

    async init(core) {
        if (this._initDone) return this;
        this._core = core || window.uiCore;
        this._initDone = true;

        window.addEventListener('respuestaEstudio', (e) => {
            this._onRespuestaEstudio(e.detail);
        });

        window.addEventListener('moduloCambiado', (e) => {
            if (e.detail?.modulo === 'elipse' && this._esperandoRetorno) {
                this._esperandoRetorno = false;
                this._onRetornoAlModuloElipse();
            }
            if (e.detail?.modulo === 'study' && this._origenAccion === 'elipse') {
                setTimeout(() => {
                    this._inyectarBotonVolverEnEstudio();
                }, 300);
            }
        });

        window.addEventListener('espacioModalCerrado', () => {
            if (this._origenAccion === 'elipse') {
                this._volverAlModoElipse('Cerrando Mi Espacio');
            }
        });

        window.addEventListener('elipseDatosCargados', (e) => {
            console.log('🌌 UIElipse: Datos de Elipse cargados (evento)', e.detail);
            this._datosCargados = true;
            this._cargando = false;
            this._renderizarPanel(this._temaId);
        });

        window.addEventListener('idiomaCambiado', (e) => {
            const nuevoIdioma = e.detail?.idioma;
            const idiomaAnterior = e.detail?.idiomaAnterior;

            console.log(`🌌 UIElipse: Idioma cambiado de "${idiomaAnterior}" a "${nuevoIdioma}"`);

            if (nuevoIdioma !== this._ultimoIdioma) {
                this._ultimoIdioma = nuevoIdioma;
                this._recargaForzada = true;
                this._temaId = null;
                this._temaSeleccionadoPorUsuario = false;
                this._elipseData = null;
                this._datosCargados = false;
                this._cargando = false;
                this._renderizadoCompleto = false;

                localStorage.removeItem('pipeline_elipse_tema_activo');
                this._cachePorTema = {};

                setTimeout(() => {
                    this._cargarYRenderizar();
                }, 300);
            }
        });

        this._crearModalPalabra();
        this._iniciarVerificacionSRS();
        this._inicializarOndasCruzadas();

        console.log('🌌 UI Elipse v6.22: Inicializado con filtrado de ondas cruzadas');
        return this;
    }

    async _inicializarOndasCruzadas() {
        if (this._ondasCruzadasInicializadas) return;

        try {
            if (window.UIOndasCruzadas && typeof window.UIOndasCruzadas.init === 'function') {
                await window.UIOndasCruzadas.init(this._core);
                this._ondasCruzadasInicializadas = true;
                console.log('🌊 Ondas Cruzadas inicializadas desde UI Elipse');
            } else if (typeof UIOndasCruzadas !== 'undefined') {
                window.UIOndasCruzadas = UIOndasCruzadas;
                if (window.UIOndasCruzadas && typeof window.UIOndasCruzadas.init === 'function') {
                    await window.UIOndasCruzadas.init(this._core);
                    this._ondasCruzadasInicializadas = true;
                    console.log('🌊 Ondas Cruzadas inicializadas (recuperadas)');
                }
            } else {
                console.warn('⚠️ UIOndasCruzadas no está disponible');
            }
        } catch (e) {
            console.warn('⚠️ Error inicializando Ondas Cruzadas:', e);
        }
    }

    _abrirOndasCruzadas() {
        console.log('🌊 Abriendo Ondas Cruzadas...');

        if (window.UIOndasCruzadas && typeof window.UIOndasCruzadas.cargar === 'function') {
            window.UIOndasCruzadas.cargar(this._core);
            return;
        }

        if (typeof window.UIOndasCruzadas === 'undefined' || !window.UIOndasCruzadas) {
            console.warn('⚠️ UIOndasCruzadas no está disponible, intentando inicializar...');
            if (typeof UIOndasCruzadas !== 'undefined') {
                window.UIOndasCruzadas = UIOndasCruzadas;
                if (window.UIOndasCruzadas && typeof window.UIOndasCruzadas.init === 'function') {
                    window.UIOndasCruzadas.init(this._core).then(() => {
                        if (typeof window.UIOndasCruzadas.cargar === 'function') {
                            window.UIOndasCruzadas.cargar(this._core);
                        } else {
                            this._core?.mostrarToast('⚠️ Error: El módulo Ondas Cruzadas no está disponible', 'error');
                        }
                    }).catch(() => {
                        this._core?.mostrarToast('⚠️ Error al inicializar Ondas Cruzadas', 'error');
                    });
                    return;
                }
            }
            this._core?.mostrarToast('⚠️ El módulo Ondas Cruzadas no está disponible', 'error');
            return;
        }

        if (window.UIOndasCruzadas && typeof window.UIOndasCruzadas.cargar !== 'function') {
            console.warn('⚠️ UIOndasCruzadas.cargar no es una función, intentando inicializar...');
            if (typeof window.UIOndasCruzadas.init === 'function') {
                window.UIOndasCruzadas.init(this._core).then(() => {
                    if (typeof window.UIOndasCruzadas.cargar === 'function') {
                        window.UIOndasCruzadas.cargar(this._core);
                    } else {
                        this._core?.mostrarToast('⚠️ Error: El módulo Ondas Cruzadas no está disponible', 'error');
                    }
                }).catch(() => {
                    this._core?.mostrarToast('⚠️ Error al inicializar Ondas Cruzadas', 'error');
                });
                return;
            }
            this._core?.mostrarToast('⚠️ El módulo Ondas Cruzadas no está disponible', 'error');
        }
    }

    _iniciarVerificacionSRS() {
        setInterval(async () => {
            if (this._temaId && !this._visorAbierto && !this._modalPalabraAbierto) {
                await this._verificarProgresoSRS();
            }
        }, this._intervaloSRS);
    }

    async _verificarProgresoSRS() {
        try {
            if (!this._datosCargados && window.modoElipse) {
                await window.modoElipse.cargarDatos();
                this._datosCargados = true;
            }

            // 🔥 Usar getHistoriasElipse() que ya filtra automáticamente
            const historias = window.modoElipse?.getHistoriasElipse(this._temaId) || [];
            if (historias.length === 0) return;

            let huboCambio = false;

            for (const h of historias) {
                const frases = await db.obtenerFrasesPorHistoria(h.id);
                if (frases.length === 0) continue;

                let totalRCN = 0;
                let count = 0;
                let completadas = 0;
                let rcnPromedio = 0;

                for (const f of frases) {
                    const progreso = await db.obtenerProgreso(f.id);
                    if (progreso) {
                        const rcn = progreso.rcn || 0;
                        totalRCN += rcn;
                        count++;
                        if (rcn >= 4 || progreso.estado === 'completada') {
                            completadas++;
                        }
                    }
                }

                rcnPromedio = count > 0 ? totalRCN / count : 0;
                const nuevaCompletada = completadas >= frases.length && frases.length > 0;

                if (h.rcnPromedio !== rcnPromedio || h.completada !== nuevaCompletada) {
                    h.rcnPromedio = rcnPromedio;
                    h.completada = nuevaCompletada;
                    huboCambio = true;

                    this._progresoOndas[h.id] = {
                        rcnPromedio: rcnPromedio,
                        completada: nuevaCompletada,
                        frasesTotales: frases.length,
                        frasesCompletadas: completadas,
                        ultimaActualizacion: Date.now()
                    };

                    if (nuevaCompletada && !h._sincronizado && rcnPromedio >= 4) {
                        console.log(`🎯 SRS: Historia "${h.titulo}" completada automáticamente (RCN: ${rcnPromedio.toFixed(1)})`);
                        await window.gestorProgresoHistorias.actualizarDesdeSRS(h.id, rcnPromedio, true);
                    } else if (!nuevaCompletada && h._sincronizado && rcnPromedio < 4) {
                        console.log(`🔄 SRS: Historia "${h.titulo}" ya no está completada (RCN: ${rcnPromedio.toFixed(1)})`);
                        await window.gestorProgresoHistorias.actualizarDesdeSRS(h.id, rcnPromedio, false);
                    }
                }
            }

            if (huboCambio) {
                window.modoElipse._guardarEstadoElipse();
                this._actualizarRecomendaciones();
                if (!this._visorAbierto && !this._modalPalabraAbierto) {
                    this._renderizarPanel(this._temaId);
                }
            }
        } catch (e) {
            console.warn('⚠️ Error en verificación SRS:', e);
        }
    }

    // 🔥 NUEVO: Obtener clave de persistencia con idioma + tema
    _getPersistenciaKey(temaId) {
        const idioma = this._obtenerIdiomaActual();
        return `pipeline_elipse_estado_idioma_${idioma}_tema_${temaId}`;
    }

    // 🔥 NUEVO: Guardar estado por idioma + tema
    _guardarEstadoTema(temaId, data) {
        if (!temaId) return;
        try {
            const key = this._getPersistenciaKey(temaId);
            localStorage.setItem(key, JSON.stringify({
                version: '6.22',
                timestamp: Date.now(),
                temaId: temaId,
                idioma: this._obtenerIdiomaActual(),
                data: data
            }));
            console.log(`💾 Estado del tema ${temaId} guardado en localStorage (idioma: ${this._obtenerIdiomaActual()})`);
            this._cachePorTema[temaId] = data;
        } catch (e) {
            console.warn(`⚠️ Error guardando estado del tema ${temaId}:`, e);
        }
    }

    // 🔥 NUEVO: Cargar estado por idioma + tema
    _cargarEstadoTema(temaId) {
        if (!temaId) return null;
        if (this._cachePorTema[temaId]) {
            console.log(`📦 Datos del tema ${temaId} cargados desde caché`);
            return this._cachePorTema[temaId];
        }
        try {
            const key = this._getPersistenciaKey(temaId);
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                console.log(`📦 Datos del tema ${temaId} cargados desde localStorage (idioma: ${this._obtenerIdiomaActual()}):`, {
                    ondas: parsed.data?.historias?.length || 0
                });
                this._cachePorTema[temaId] = parsed.data;
                return parsed.data;
            }
        } catch (e) {
            console.warn(`⚠️ Error cargando estado del tema ${temaId}:`, e);
        }
        return null;
    }

    _obtenerIdiomaActual() {
        try {
            return gestorIdiomas?.getIdiomaActivo() || 'es';
        } catch (e) {
            return 'es';
        }
    }

    async _verificarYRepararEstadoElipse() {
        console.log('🛠️ Verificando y reparando estado de la Elipse...');

        const idiomaActivo = this._obtenerIdiomaActual();
        let temaId = this._temaId;

        // 🔥 PASO 1: Si no hay temaId, intentar recuperar de localStorage
        if (!temaId) {
            const savedTema = localStorage.getItem('pipeline_elipse_tema_activo');
            if (savedTema) {
                const tema = await db.obtenerTema(parseInt(savedTema));
                if (tema && tema.idioma === idiomaActivo) {
                    temaId = savedTema;
                    this._temaId = savedTema;
                    console.log(`📌 Tema recuperado de localStorage: ${savedTema} (idioma: ${idiomaActivo})`);
                } else {
                    if (tema) {
                        console.log(`⚠️ Tema ${savedTema} es de idioma "${tema.idioma}", actual: "${idiomaActivo}". Limpiando.`);
                    }
                    localStorage.removeItem('pipeline_elipse_tema_activo');
                    console.log(`🗑️ Tema ${savedTema} eliminado de localStorage (no coincide con idioma ${idiomaActivo})`);
                }
            }
        }

        // Si después de intentar recuperar, seguimos sin temaId, buscar un tema automáticamente
        if (!temaId) {
            const temas = await db.obtenerTemasPorIdioma(idiomaActivo);
            if (temas.length > 0) {
                let temaConHistorias = null;
                for (const t of temas) {
                    const historias = await db.obtenerHistoriasPorTema(t.id);
                    // 🔥 Filtrar ondas cruzadas al verificar
                    const historiasFiltradas = historias.filter(h => h.idioma === idiomaActivo && !this._esOndaCruzada(h));
                    if (historiasFiltradas.length > 0) {
                        temaConHistorias = t;
                        break;
                    }
                }
                if (!temaConHistorias) {
                    temaConHistorias = temas[0];
                }
                temaId = String(temaConHistorias.id);
                this._temaId = temaId;
                this._temaSeleccionadoPorUsuario = true;
                localStorage.setItem('pipeline_elipse_tema_activo', temaId);
                console.log(`📌 Tema seleccionado automáticamente: "${temaConHistorias.nombre}" (${temaId})`);
            } else {
                console.log('📭 No hay temas disponibles para iniciar la Elipse.');
                return;
            }
        }

        // 🔥 PASO 2: Verificar que el tema exista en la base de datos
        const temaEnDB = await db.obtenerTema(parseInt(temaId));
        if (!temaEnDB) {
            console.warn(`⚠️ El tema con ID ${temaId} no existe en la base de datos.`);
            localStorage.removeItem('pipeline_elipse_tema_activo');
            this._temaId = null;
            this._temaSeleccionadoPorUsuario = false;
            const key = this._getPersistenciaKey(temaId);
            localStorage.removeItem(key);
            delete this._cachePorTema[temaId];

            if (window.modoElipse) {
                window.modoElipse._historiasElipse = [];
                window.modoElipse._elipseActiva = null;
                window.modoElipse._persistenciaCargada = false;
                window.modoElipse._datosCargados = false;
                window.modoElipse._temaIdPersistido = null;
            }

            this._elipseData = null;
            this._datosCargados = false;
            this._progresoGlobal = 0;
            this._ondasRevisadas = new Set();
            this._recomendaciones = [];
            this._siguienteOndaSugerida = null;
            this._progresoOndas = {};

            console.log('🧹 Estado huérfano de la Elipse limpiado.');
            return;
        }

        // 🔥 PASO 3: Verificar que el tema pertenezca al idioma actual
        if (temaEnDB.idioma && temaEnDB.idioma !== idiomaActivo) {
            console.log(`⚠️ El tema "${temaEnDB.nombre}" es de idioma "${temaEnDB.idioma}", actual: "${idiomaActivo}"`);
            this._temaId = null;
            this._temaSeleccionadoPorUsuario = false;
            localStorage.removeItem('pipeline_elipse_tema_activo');
            this._elipseData = null;
            this._datosCargados = false;

            const temas = await db.obtenerTemasPorIdioma(idiomaActivo);
            if (temas.length > 0) {
                let temaConHistorias = null;
                for (const t of temas) {
                    const historias = await db.obtenerHistoriasPorTema(t.id);
                    const historiasFiltradas = historias.filter(h => h.idioma === idiomaActivo && !this._esOndaCruzada(h));
                    if (historiasFiltradas.length > 0) {
                        temaConHistorias = t;
                        break;
                    }
                }
                if (!temaConHistorias) {
                    temaConHistorias = temas[0];
                }
                this._temaId = String(temaConHistorias.id);
                this._temaSeleccionadoPorUsuario = true;
                localStorage.setItem('pipeline_elipse_tema_activo', this._temaId);
                console.log(`📌 Tema seleccionado automáticamente: "${temaConHistorias.nombre}" (${this._temaId})`);
            }
            return;
        }

        console.log(`✅ Tema "${temaEnDB.nombre}" (${temaId}) encontrado en la base de datos (idioma: ${idiomaActivo}).`);

        // 🔥 PASO 4: Forzar el tema en modoElipse
        if (window.modoElipse) {
            if (window.modoElipse._elipseActiva !== temaId) {
                console.log(`🔄 Forzando modoElipse._elipseActiva de "${window.modoElipse._elipseActiva}" a "${temaId}"`);
                window.modoElipse._elipseActiva = temaId;
                window.modoElipse._temaIdPersistido = temaId;
                // Cargar el estado específico de este tema
                window.modoElipse._cargarEstadoPorIdioma(idiomaActivo);
            }
        }

        // 🔥 PASO 5: Verificar y limpiar historias huérfanas de la Elipse
        if (window.modoElipse) {
            // 🔥 Usar getHistoriasElipse() que ya filtra
            const historiasElipse = window.modoElipse.getHistoriasElipse(temaId) || [];
            const historiasValidas = [];
            let historiasEliminadas = 0;

            for (const h of historiasElipse) {
                // Ya están filtradas por getHistoriasElipse, pero por seguridad
                if (this._esOndaCruzada(h)) {
                    console.log(`🔍 Onda cruzada "${h.titulo}" filtrada de la Elipse (ID: ${h.id})`);
                    continue;
                }
                try {
                    const existe = await db.get('historias', h.id);
                    if (existe) {
                        historiasValidas.push(h);
                    } else {
                        console.warn(`⚠️ Historia ${h.id} ("${h.titulo}") ya no existe en la base de datos. Eliminando de la Elipse.`);
                        historiasEliminadas++;
                    }
                } catch (e) {
                    console.warn(`⚠️ Error verificando historia ${h.id}:`, e);
                    historiasValidas.push(h);
                }
            }

            if (historiasEliminadas > 0) {
                window.modoElipse._historiasElipse = historiasValidas;
                window.modoElipse._estadisticas.totalOndas = historiasValidas.length;
                window.modoElipse._guardarEstadoElipse();
                await window.modoElipse._guardarEnIndexedDB();
                console.log(`🗑️ ${historiasEliminadas} historias eliminadas de la Elipse (no existían en DB)`);

                if (window.modoElipse._recuerdoOndas && window.modoElipse._recuerdoOndas.resumenPorOnda) {
                    const newResumen = {};
                    for (const [key, value] of Object.entries(window.modoElipse._recuerdoOndas.resumenPorOnda)) {
                        if (historiasValidas.some(h => h.id === value.id)) {
                            newResumen[key] = value;
                        }
                    }
                    window.modoElipse._recuerdoOndas.resumenPorOnda = newResumen;
                    window.modoElipse._guardarRecuerdoOndas();
                }

                this._datosCargados = false;
                this._elipseData = null;
                this._cachePorTema = {};
            }
        }

        // 🔥 PASO 6: Verificar el estado de la Elipse para este tema
        // 🔥 Usar getHistoriasElipse() que ya filtra
        const historiasActuales = window.modoElipse?.getHistoriasElipse(temaId) || [];
        if (historiasActuales.length === 0) {
            console.log('📭 La Elipse para este tema está vacía. Intentando cargar desde la base de datos...');

            const historiasEnTema = await db.obtenerHistoriasPorTema(parseInt(temaId));
            const historiasFiltradas = historiasEnTema.filter(h => h.idioma === idiomaActivo && !this._esOndaCruzada(h));

            if (historiasFiltradas.length > 0 && window.modoElipse) {
                const ondasExistentes = historiasFiltradas.filter(h => h._esOnda === true);
                if (ondasExistentes.length > 0) {
                    console.log(`📚 El tema ya tiene ${ondasExistentes.length} ondas en la DB. Cargando estado...`);
                    await window.modoElipse.cargarDatos();
                    this._datosCargados = true;
                } else {
                    const historiaBase = historiasFiltradas[0];
                    console.log(`📚 Iniciando Elipse con historia base: "${historiaBase.titulo}" (ID: ${historiaBase.id})`);
                    await window.modoElipse.iniciarElipse(temaId, historiaBase.id);
                    this._datosCargados = true;
                    console.log(`✅ Nueva Elipse creada para "${temaEnDB.nombre}".`);
                }
            } else {
                console.log(`📭 El tema "${temaEnDB.nombre}" no tiene historias. No se puede iniciar la Elipse.`);
            }
        } else {
            console.log(`📚 La Elipse tiene ${historiasActuales.length} ondas para este tema.`);
            // Verificar que la historia base esté presente (especialmente para el Tema 1)
            const tieneBase = historiasActuales.some(h => h.esBase === true);
            if (!tieneBase) {
                console.log(`⚠️ La Elipse para el tema "${temaEnDB.nombre}" no tiene una historia base. Intentando recuperarla...`);
                const historiasEnTema = await db.obtenerHistoriasPorTema(parseInt(temaId));
                const historiasFiltradas = historiasEnTema.filter(h => h.idioma === idiomaActivo && !this._esOndaCruzada(h));
                if (historiasFiltradas.length > 0) {
                    const basePotencial = historiasFiltradas.find(h => h._esBase === true || h._esOnda === false);
                    if (basePotencial) {
                        console.log(`📚 Historia base encontrada: "${basePotencial.titulo}" (ID: ${basePotencial.id})`);
                        const existeEnElipse = window.modoElipse._historiasElipse.some(h => h.id === basePotencial.id);
                        if (!existeEnElipse) {
                            const ondaBase = {
                                id: basePotencial.id,
                                titulo: basePotencial.titulo,
                                temaId: temaId,
                                nivel: basePotencial.nivel || 'A1',
                                indice: 0,
                                fecha: Date.now(),
                                palabrasNuevas: [],
                                palabrasBase: [],
                                historiasPrevias: [],
                                esBase: true,
                                rcnPromedio: 0,
                                completada: false,
                                _sincronizado: false,
                                _fechaSincronizacion: null,
                                _recuerdo: null,
                                _esOndaCruzada: false
                            };
                            window.modoElipse._historiasElipse.unshift(ondaBase);
                            window.modoElipse._estadisticas.totalOndas = window.modoElipse._historiasElipse.length;
                            window.modoElipse._guardarEstadoElipse();
                            await window.modoElipse._guardarEnIndexedDB();
                            this._datosCargados = true;
                            console.log(`✅ Historia base "${basePotencial.titulo}" añadida a la Elipse.`);
                        }
                    }
                }
            }
        }

        // 🔥 PASO 7: Asegurar que los datos estén cargados en el gestor de idiomas
        if (window.modoElipse) {
            await window.modoElipse.cargarDatos();
            this._datosCargados = true;
        }

        console.log('🛠️ Verificación y reparación del estado de la Elipse completada.');
    }

    _crearContainer() {
        if (this._creandoContainer) {
            console.log('⏳ Ya hay una creación de container en curso');
            return null;
        }

        this._creandoContainer = true;
        console.log('📦 Creando contenedor para el módulo Elipse...');

        try {
            let container = document.getElementById('elipseContent');

            if (container) {
                console.log('✅ Contenedor elipseContent ya existe');
                this._container = container;
                this._containerCreado = true;
                this._creandoContainer = false;
                return container;
            }

            let moduleDiv = document.getElementById('elipseModule');

            if (!moduleDiv) {
                const mainContent = document.getElementById('mainContent');
                if (!mainContent) {
                    console.error('❌ No se encontró mainContent');
                    this._creandoContainer = false;
                    return null;
                }

                moduleDiv = document.createElement('div');
                moduleDiv.id = 'elipseModule';
                moduleDiv.className = 'module-view';
                moduleDiv.innerHTML = `
                    <div class="module-header">
                        <button class="btn-back" onclick="window.uiCore.volverDashboard()">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div class="module-title">
                            <h2>🌌 Modo Elipse</h2>
                            <span class="module-breadcrumb">Dashboard / Modo Elipse</span>
                        </div>
                    </div>
                    <div class="module-content" id="elipseContent">
                    </div>
                `;
                mainContent.appendChild(moduleDiv);
                console.log('📦 Módulo elipseModule creado');
            }

            container = moduleDiv.querySelector('#elipseContent');

            if (!container) {
                container = document.createElement('div');
                container.id = 'elipseContent';
                container.className = 'module-content';
                moduleDiv.appendChild(container);
                console.log('📦 Contenedor elipseContent creado dentro del módulo');
            }

            this._container = container;
            this._containerCreado = true;
            this._creandoContainer = false;
            console.log('✅ Contenedor para Elipse creado correctamente');
            return container;

        } catch (error) {
            console.error('❌ Error creando container:', error);
            this._creandoContainer = false;
            return null;
        }
    }

    _getContainer() {
        if (this._container && document.body.contains(this._container)) {
            return this._container;
        }

        let container = document.getElementById('elipseContent');

        if (container && document.body.contains(container)) {
            this._container = container;
            this._containerCreado = true;
            return container;
        }

        return this._crearContainer();
    }

    cargar(core) {
        this._core = core || this._core;

        const container = this._getContainer();
        if (!container) {
            console.error('❌ No se pudo obtener/crear el contenedor para el módulo Elipse');
            setTimeout(() => { this.cargar(this._core); }, 500);
            return;
        }
        this._container = container;
        this._cargando = false;
        this._primeraCarga = true;

        const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
        this._ultimoIdioma = idiomaActivo;
        console.log(`🌌 UIElipse.cargar(): Idioma activo: ${idiomaActivo}`);

        this._verificarYRepararEstadoElipse().then(() => {
            this._cargarYRenderizar();
        }).catch((error) => {
            console.error('❌ Error en verificación de estado:', error);
            this._cargarYRenderizar();
        });
    }

    async _cargarYRenderizar() {
        if (this._cargando) {
            console.log('⏳ Ya hay una carga en curso');
            return;
        }
        this._cargando = true;
        console.log('🌌 UIElipse: Iniciando _cargarYRenderizar()...');

        try {
            const container = this._getContainer();
            if (!container) {
                console.error('❌ No hay contenedor para renderizar');
                this._cargando = false;
                return;
            }
            this._container = container;

            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            console.log(`🌌 UIElipse: Idioma activo: ${idiomaActivo}`);

            // 🔥 PASO 1: Determinar el temaId correcto
            let temaId = this._temaId;

            // Si hay un temaId, verificar que pertenezca al idioma actual
            if (temaId) {
                const tema = await db.obtenerTema(parseInt(temaId));
                if (tema && tema.idioma && tema.idioma !== idiomaActivo) {
                    console.log(`⚠️ El tema ${temaId} es de idioma "${tema.idioma}", actual: "${idiomaActivo}". Limpiando selección.`);
                    this._temaId = null;
                    this._temaSeleccionadoPorUsuario = false;
                    localStorage.removeItem('pipeline_elipse_tema_activo');
                    this._elipseData = null;
                    this._datosCargados = false;
                    temaId = null;
                }
            }

            // Si no hay temaId, intentar recuperar de localStorage
            if (!temaId) {
                temaId = localStorage.getItem('pipeline_elipse_tema_activo');
                if (temaId) {
                    const tema = await db.obtenerTema(parseInt(temaId));
                    if (tema && tema.idioma && tema.idioma !== idiomaActivo) {
                        console.log(`⚠️ Tema de localStorage es de idioma "${tema.idioma}", actual: "${idiomaActivo}". Limpiando.`);
                        localStorage.removeItem('pipeline_elipse_tema_activo');
                        temaId = null;
                    }
                }
            }

            // Si aún no hay temaId, seleccionar el primer tema con historias
            if (!temaId) {
                const temas = await db.obtenerTemasPorIdioma(idiomaActivo);
                for (const t of temas) {
                    const historias = await db.obtenerHistoriasPorTema(t.id);
                    const historiasFiltradas = historias.filter(h => h.idioma === idiomaActivo && !this._esOndaCruzada(h));
                    if (historiasFiltradas.length > 0) {
                        temaId = String(t.id);
                        console.log(`📌 Tema seleccionado automáticamente: "${t.nombre}" (${temaId})`);
                        break;
                    }
                }
                if (!temaId && temas.length > 0) {
                    temaId = String(temas[0].id);
                    console.log(`📌 Tema seleccionado automáticamente (sin historias): "${temas[0].nombre}" (${temaId})`);
                }
            }

            // 🔥 PASO 2: Forzar el tema en modoElipse ANTES de verificar y reparar
            if (window.modoElipse && temaId) {
                if (window.modoElipse._elipseActiva !== temaId) {
                    console.log(`🔄 Forzando modoElipse._elipseActiva de "${window.modoElipse._elipseActiva}" a "${temaId}"`);
                    window.modoElipse._elipseActiva = temaId;
                    window.modoElipse._temaIdPersistido = temaId;
                    // Cargar el estado específico de este tema usando la clave con idioma
                    window.modoElipse._cargarEstadoPorIdioma(idiomaActivo);
                }
                this._temaId = temaId;
            } else if (temaId) {
                this._temaId = temaId;
            }

            // 🔥 PASO 3: Verificar y reparar el estado de la Elipse
            await this._verificarYRepararEstadoElipse();
            
            // Asegurar que el temaId no se haya perdido
            if (!this._temaId && temaId) {
                this._temaId = temaId;
                if (window.modoElipse) {
                    window.modoElipse._elipseActiva = temaId;
                    window.modoElipse._temaIdPersistido = temaId;
                    window.modoElipse._cargarEstadoPorIdioma(idiomaActivo);
                }
            }

            // 🔥 PASO 4: Forzar la recarga de datos usando la clave correcta (idioma + tema)
            if (this._temaId) {
                console.log(`📌 Tema seleccionado: ${this._temaId} (idioma: ${idiomaActivo})`);

                // 🔥 CRÍTICO: Usar la clave con idioma + tema
                const datosGuardados = this._cargarEstadoTema(this._temaId);
                if (datosGuardados && datosGuardados.historias && datosGuardados.historias.length > 0) {
                    // 🔥 CORREGIDO: Filtrar ondas cruzadas al restaurar
                    const historiasFiltradas = this._filtrarOndasElipse(datosGuardados.historias);
                    console.log(`📦 ${historiasFiltradas.length} ondas filtradas para el tema ${this._temaId} (idioma: ${idiomaActivo})`);
                    if (window.modoElipse) {
                        window.modoElipse._historiasElipse = historiasFiltradas;
                        window.modoElipse._elipseActiva = this._temaId;
                        window.modoElipse._estadisticas = datosGuardados.estadisticas || {
                            totalOndas: historiasFiltradas.length,
                            palabrasNuevas: 0,
                            palabrasConsolidadas: 0
                        };
                        window.modoElipse._persistenciaCargada = true;
                        window.modoElipse._datosCargados = true;
                        window.modoElipse._temaIdPersistido = this._temaId;
                        window.modoElipse._idiomaActual = idiomaActivo;
                    }
                    this._datosCargados = true;
                } else {
                    console.log(`📭 No hay datos guardados para el tema ${this._temaId} (idioma: ${idiomaActivo}), iniciando desde cero`);
                    if (window.modoElipse) {
                        const historias = await db.obtenerHistoriasPorTema(parseInt(this._temaId));
                        const historiasFiltradas = historias.filter(h => h.idioma === idiomaActivo && !this._esOndaCruzada(h));
                        if (historiasFiltradas.length > 0) {
                            const ondasExistentes = historiasFiltradas.filter(h => h._esOnda === true);
                            if (ondasExistentes.length > 0) {
                                await window.modoElipse.cargarDatos();
                                this._datosCargados = true;
                            } else {
                                // Si no hay ondas, usar la primera historia como base
                                const historiaBase = historiasFiltradas[0];
                                if (historiaBase) {
                                    console.log(`📚 Iniciando Elipse con historia base: "${historiaBase.titulo}" (ID: ${historiaBase.id})`);
                                    await window.modoElipse.iniciarElipse(this._temaId, historiaBase.id);
                                    this._datosCargados = true;
                                }
                            }
                        }
                    }
                }
            } else {
                console.log('🌌 No hay tema seleccionado para el idioma actual');
                this._elipseData = null;
                this._datosCargados = false;
            }

            // 🔥 PASO 5: Renderizar el panel
            await this._renderizarPanel(this._temaId);
            this._renderizadoCompleto = true;
            this._primeraCarga = false;
            this._recargaForzada = false;
            console.log('🌌 UIElipse: Renderizado completado');

        } catch (error) {
            console.error('❌ Error en _cargarYRenderizar:', error);
            this._mostrarErrorEnPantalla('Error al cargar el Modo Elipse: ' + error.message);
        } finally {
            this._cargando = false;
        }
    }

    async _seleccionarTema() {
        console.log('🌌 Seleccionando tema...');

        const container = this._getContainer();
        if (!container) {
            console.error('❌ No hay contenedor para seleccionar tema');
            this._core?.mostrarToast('❌ Error: contenedor no disponible', 'error');
            return;
        }
        this._container = container;

        try {
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            console.log(`🌌 Seleccionando tema para idioma: ${idiomaActivo}`);

            const todosLosTemas = await db.obtenerTemasPorIdioma(idiomaActivo);

            const temasConHistorias = [];
            for (const t of todosLosTemas) {
                const historias = await db.obtenerHistoriasPorTema(t.id);
                const historiasFiltradas = historias.filter(h => h.idioma === idiomaActivo && !this._esOndaCruzada(h));
                if (historiasFiltradas.length > 0) {
                    temasConHistorias.push({ ...t, historias: historiasFiltradas.length });
                }
            }

            if (temasConHistorias.length === 0) {
                this._core?.mostrarToast('📚 No hay temas con historias en el idioma actual. Cambia de idioma o importa contenido.', 'warning');
                return;
            }

            let mensaje = `📂 Selecciona un tema para la elipse (${idiomaActivo}):\n\n`;
            temasConHistorias.forEach((t, i) => {
                const tieneOndas = this._cachePorTema[t.id] || localStorage.getItem(this._getPersistenciaKey(t.id));
                const estado = tieneOndas ? ' 🌊' : ' 📄';
                mensaje += `${i + 1}. ${t.nombre} (${t.historias} historias)${estado}\n`;
            });

            const seleccion = await this._core?.prompt(mensaje, '1', 'Número del tema...', '📂 Seleccionar Tema');
            if (!seleccion) return;

            const idx = parseInt(seleccion) - 1;
            if (isNaN(idx) || idx < 0 || idx >= temasConHistorias.length) {
                this._core?.mostrarToast('❌ Selección inválida', 'error');
                return;
            }

            const tema = temasConHistorias[idx];

            if (tema.idioma && tema.idioma !== idiomaActivo) {
                this._core?.mostrarToast(`⚠️ El tema "${tema.nombre}" es de idioma "${tema.idioma}", no de "${idiomaActivo}"`, 'error');
                return;
            }

            if (this._temaId && this._temaId !== tema.id) {
                console.log(`💾 Guardando estado del tema anterior ${this._temaId}...`);
                await this._guardarEstadoActual();
            }

            this._temaId = String(tema.id);
            this._temaSeleccionadoPorUsuario = true;
            this._progresoOndas = {};
            this._recomendaciones = [];
            this._siguienteOndaSugerida = null;
            this._progresoGlobal = 0;
            this._elipseData = null;
            this._datosCargados = false;

            // 🔥 Forzar el tema en modoElipse
            if (window.modoElipse) {
                window.modoElipse._elipseActiva = this._temaId;
                window.modoElipse._temaIdPersistido = this._temaId;
                window.modoElipse._cargarEstadoPorIdioma(idiomaActivo);
            }

            await this._verificarYRepararEstadoElipse();

            // 🔥 Usar la clave con idioma + tema
            const datosGuardados = this._cargarEstadoTema(this._temaId);
            if (window.modoElipse) {
                if (datosGuardados && datosGuardados.historias && datosGuardados.historias.length > 0) {
                    const historiasFiltradas = this._filtrarOndasElipse(datosGuardados.historias);
                    console.log(`📦 Restaurando ${historiasFiltradas.length} ondas del tema ${this._temaId} (idioma: ${idiomaActivo})`);
                    window.modoElipse._historiasElipse = historiasFiltradas;
                    window.modoElipse._elipseActiva = this._temaId;
                    window.modoElipse._estadisticas = datosGuardados.estadisticas || {
                        totalOndas: historiasFiltradas.length,
                        palabrasNuevas: 0,
                        palabrasConsolidadas: 0
                    };
                    window.modoElipse._persistenciaCargada = true;
                    window.modoElipse._datosCargados = true;
                    window.modoElipse._temaIdPersistido = this._temaId;
                    this._datosCargados = true;
                    this._core?.mostrarToast(`🌌 ${historiasFiltradas.length} ondas restauradas para "${tema.nombre}"`, 'success');
                } else {
                    const historias = await db.obtenerHistoriasPorTema(parseInt(this._temaId));
                    const historiasFiltradas = historias.filter(h => h.idioma === idiomaActivo && !this._esOndaCruzada(h));
                    if (historiasFiltradas.length > 0) {
                        const ondasExistentes = historiasFiltradas.filter(h => h._esOnda === true);
                        if (ondasExistentes.length > 0) {
                            await window.modoElipse.cargarDatos();
                            this._datosCargados = true;
                            this._core?.mostrarToast(`🌌 ${ondasExistentes.length} ondas cargadas para "${tema.nombre}"`, 'success');
                        } else {
                            await window.modoElipse.iniciarElipse(this._temaId, historiasFiltradas[0].id);
                            this._datosCargados = true;
                            this._core?.mostrarToast(`🌌 Elipse iniciada con "${historiasFiltradas[0].titulo}"`, 'success');
                        }
                    }
                }
            }

            localStorage.setItem('pipeline_elipse_tema_activo', this._temaId);
            this._inicioSesion = Date.now();
            this._tiempoEstudio = 0;
            this._ondasRevisadas = new Set();
            await this._cargarYRenderizar();
            this._core?.mostrarToast(`📂 Tema seleccionado: "${tema.nombre}" (${idiomaActivo})`, 'success');

        } catch (error) {
            console.error('❌ Error seleccionando tema:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _guardarEstadoActual() {
        if (!this._temaId) return;
        try {
            // 🔥 Usar getHistoriasElipse() que ya filtra
            const historias = window.modoElipse?.getHistoriasElipse(this._temaId) || [];
            if (historias.length === 0) return;
            const data = {
                historias: historias,
                estadisticas: window.modoElipse?._estadisticas || { totalOndas: historias.length, palabrasNuevas: 0, palabrasConsolidadas: 0 },
                timestamp: Date.now()
            };
            this._guardarEstadoTema(this._temaId, data);
            console.log(`💾 Estado del tema ${this._temaId} guardado (${historias.length} ondas)`);
            if (window.modoElipse) {
                await window.modoElipse._guardarEnIndexedDB();
            }
        } catch (e) {
            console.warn('⚠️ Error guardando estado actual:', e);
        }
    }

    async _renderizarPanel(temaId = null) {
        console.log('🌌 UIElipse: Renderizando panel...');
        this._cargando = false;

        const container = this._getContainer();
        if (!container) {
            console.error('❌ No se pudo obtener/crear el contenedor en _renderizarPanel');
            this._mostrarErrorEnPantalla('No se encontró el contenedor del Modo Elipse');
            return;
        }
        this._container = container;

        if (this._visorAbierto) {
            console.log('📖 Visor abierto, no renderizando panel');
            return;
        }

        if (this._volviendoDeLectura) {
            this._volviendoDeLectura = false;
            await this._obtenerEstadoElipse(this._temaId);
        }

        // 🔥 PASO 1: Asegurar que el temaId sea el correcto
        const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
        let temaIdParaCargar = temaId || this._temaId;
        
        // Si no hay temaId, intentar recuperar de localStorage
        if (!temaIdParaCargar) {
            temaIdParaCargar = localStorage.getItem('pipeline_elipse_tema_activo');
        }
        
        // Si aún no hay temaId, seleccionar el primer tema con historias
        if (!temaIdParaCargar) {
            const temas = await db.obtenerTemasPorIdioma(idiomaActivo);
            for (const t of temas) {
                const historias = await db.obtenerHistoriasPorTema(t.id);
                if (historias.filter(h => h.idioma === idiomaActivo && !this._esOndaCruzada(h)).length > 0) {
                    temaIdParaCargar = String(t.id);
                    break;
                }
            }
            if (!temaIdParaCargar && temas.length > 0) {
                temaIdParaCargar = String(temas[0].id);
            }
        }
        
        if (temaIdParaCargar) {
            this._temaId = temaIdParaCargar;
            localStorage.setItem('pipeline_elipse_tema_activo', temaIdParaCargar);
            console.log(`📌 UIElipse: Tema forzado a: ${temaIdParaCargar}`);
        } else {
            console.warn('⚠️ UIElipse: No se pudo determinar el tema');
            this._mostrarErrorEnPantalla('No hay temas disponibles en este idioma');
            return;
        }

        // 🔥 PASO 2: Forzar la carga de datos del Modo Elipse para el tema correcto
        if (window.modoElipse) {
            // 🔥 CRÍTICO: Establecer el tema activo en modoElipse antes de cargar datos
            if (window.modoElipse._elipseActiva !== this._temaId) {
                console.log(`🔄 UIElipse: Forzando cambio de elipse activa de "${window.modoElipse._elipseActiva}" a "${this._temaId}"`);
                window.modoElipse._elipseActiva = this._temaId;
                window.modoElipse._temaIdPersistido = this._temaId;
                
                // Cargar el estado específico de este tema usando la clave con idioma
                window.modoElipse._cargarEstadoPorIdioma(idiomaActivo);
                
                // Si después de cargar no hay historias, intentar recuperar desde el tema
                if (window.modoElipse._historiasElipse.length === 0) {
                    console.log(`🔄 UIElipse: Recuperando ondas del tema ${this._temaId}...`);
                    await window.modoElipse._recuperarElipseDesdeTema(this._temaId);
                }
            }
            
            // 🔥 PASO 3: Cargar datos si es necesario
            if (!this._datosCargados) {
                console.log('🌌 Cargando datos antes de renderizar...');
                try {
                    await window.modoElipse.cargarDatos();
                    this._datosCargados = true;
                    if (window.modoElipse._elipseActiva) {
                        this._temaId = window.modoElipse._elipseActiva;
                        localStorage.setItem('pipeline_elipse_tema_activo', this._temaId);
                    }
                } catch (e) {
                    console.warn('⚠️ Error cargando datos, continuando con datos existentes:', e);
                }
            }
            
            // 🔥 PASO 4: Verificar que las historias de la Elipse correspondan al tema actual
            // 🔥 Usar getHistoriasElipse() que ya filtra
            const historiasElipse = window.modoElipse.getHistoriasElipse(this._temaId) || [];
            if (historiasElipse.length === 0) {
                console.log(`⚠️ UIElipse: No hay historias para el tema ${this._temaId}. Intentando recuperar...`);
                await window.modoElipse._recuperarElipseDesdeTema(this._temaId);
                // Recargar el estado después de recuperar
                window.modoElipse._cargarEstadoPorIdioma(idiomaActivo);
                this._datosCargados = true;
            }
            
            // Limpiar historias huérfanas
            try {
                const historiasElipse2 = window.modoElipse.getHistoriasElipse(this._temaId) || [];
                const historiasValidas = [];
                let historiasEliminadas = 0;

                for (const h of historiasElipse2) {
                    // Ya están filtradas, pero por seguridad
                    if (this._esOndaCruzada(h)) {
                        console.log(`🔍 Onda cruzada "${h.titulo}" filtrada (ID: ${h.id})`);
                        continue;
                    }
                    try {
                        const existe = await db.get('historias', h.id);
                        if (existe) {
                            historiasValidas.push(h);
                        } else {
                            console.warn(`⚠️ UIElipse: Historia ${h.id} ("${h.titulo}") ya no existe en la base de datos. Eliminando de la Elipse.`);
                            historiasEliminadas++;
                        }
                    } catch (e) {
                        console.warn(`⚠️ UIElipse: Error verificando historia ${h.id}:`, e);
                        historiasValidas.push(h);
                    }
                }

                if (historiasEliminadas > 0) {
                    window.modoElipse._historiasElipse = historiasValidas;
                    window.modoElipse._estadisticas.totalOndas = historiasValidas.length;
                    window.modoElipse._guardarEstadoElipse();
                    await window.modoElipse._guardarEnIndexedDB();
                    console.log(`🗑️ UIElipse: ${historiasEliminadas} historias eliminadas de la Elipse (no existían en DB)`);

                    if (window.modoElipse._recuerdoOndas && window.modoElipse._recuerdoOndas.resumenPorOnda) {
                        const newResumen = {};
                        for (const [key, value] of Object.entries(window.modoElipse._recuerdoOndas.resumenPorOnda)) {
                            if (historiasValidas.some(h => h.id === value.id)) {
                                newResumen[key] = value;
                            }
                        }
                        window.modoElipse._recuerdoOndas.resumenPorOnda = newResumen;
                        window.modoElipse._guardarRecuerdoOndas();
                    }

                    this._datosCargados = false;
                    this._elipseData = null;
                    this._cachePorTema = {};

                    await window.modoElipse.cargarDatos();
                    this._datosCargados = true;
                }
            } catch (e) {
                console.warn('⚠️ UIElipse: Error verificando historias:', e);
            }
        }

        const nombreIdioma = this._getNombreIdioma(idiomaActivo);
        const nivelActual = this._obtenerNivelRealUsuario();

        try {
            this._elipseData = await this._obtenerEstadoElipse(this._temaId);
            console.log('📊 Estado de Elipse obtenido:', this._elipseData);
        } catch (e) {
            console.warn('⚠️ Error obteniendo estado elipse:', e);
            this._elipseData = null;
        }

        if (this._elipseData && this._elipseData.totalOndas > 0) {
            console.log(`🌌 Elipse activa con ${this._elipseData.totalOndas} ondas`);
            this._progresoGlobal = Math.round((this._elipseData.ondasCompletadas / this._elipseData.totalOndas) * 100);
        } else {
            console.log('🌌 No hay elipse activa o no tiene ondas');
            this._progresoGlobal = 0;
        }

        await this._actualizarProgresoGlobal();
        this._actualizarRecomendaciones();
        const html = this._construirHTMLPanel(idiomaActivo, nombreIdioma, nivelActual);

        if (!this._container || !document.body.contains(this._container)) {
            console.warn('⚠️ Container desapareció, recreando...');
            const newContainer = this._getContainer();
            if (!newContainer) {
                console.error('❌ No se pudo recrear el contenedor');
                return;
            }
            this._container = newContainer;
        }

        this._container.innerHTML = html;
        this._renderizadoCompleto = true;
        this._primeraCarga = false;
        console.log('🌌 UIElipse: Panel renderizado correctamente');
    }

    async _obtenerEstadoElipse(temaId) {
        if (!window.modoElipse) return null;
        const id = temaId || this._temaId;
        if (!id) return null;

        const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
        const tema = await db.obtenerTema(parseInt(id));
        if (tema && tema.idioma && tema.idioma !== idiomaActivo) {
            console.log(`⚠️ Tema ${id} es de idioma "${tema.idioma}", actual: "${idiomaActivo}"`);
            return null;
        }

        if (!this._datosCargados && window.modoElipse) {
            await window.modoElipse.cargarDatos();
            this._datosCargados = true;
        }
        return window.modoElipse.getEstadoElipse(id);
    }

    async _actualizarProgresoGlobal() {
        if (!this._temaId) return;
        if (!this._datosCargados && window.modoElipse) {
            await window.modoElipse.cargarDatos();
            this._datosCargados = true;
        }
        // 🔥 Usar getHistoriasElipse() que ya filtra
        const historias = window.modoElipse?.getHistoriasElipse(this._temaId) || [];
        if (historias.length === 0) return;
        const completadas = historias.filter(h => h.completada).length;
        this._progresoGlobal = Math.round((completadas / historias.length) * 100);
        this._actualizarRecomendaciones();
    }

    _actualizarRecomendaciones() {
        // 🔥 Usar getHistoriasElipse() que ya filtra
        const historias = window.modoElipse?.getHistoriasElipse(this._temaId) || [];
        if (historias.length === 0) return;
        this._recomendaciones = [];
        const noCompletadas = historias.filter(h => !h.completada);
        if (noCompletadas.length > 0) {
            noCompletadas.sort((a, b) => (a.rcnPromedio || 0) - (b.rcnPromedio || 0));
            this._siguienteOndaSugerida = noCompletadas[0];
            if (this._siguienteOndaSugerida.rcnPromedio < 2) {
                this._recomendaciones.push({
                    tipo: 'estudio',
                    icono: '📖',
                    mensaje: `Estudia "${this._siguienteOndaSugerida.titulo}" (RCN: ${this._siguienteOndaSugerida.rcnPromedio.toFixed(1)})`,
                    prioridad: 'alta',
                    historiaId: this._siguienteOndaSugerida.id
                });
            }
        }
        const ondasConPalabras = historias.filter(h => h.palabrasNuevas && h.palabrasNuevas.length > 0);
        for (const h of ondasConPalabras) {
            if (!h.completada && h.rcnPromedio < 1) {
                this._recomendaciones.push({
                    tipo: 'vocabulario',
                    icono: '📝',
                    mensaje: `Aprende las ${h.palabrasNuevas.length} palabras nuevas de "${h.titulo}"`,
                    prioridad: 'media',
                    historiaId: h.id
                });
                break;
            }
        }
        const completadas = historias.filter(h => h.completada).length;
        const ultima = historias[historias.length - 1];
        if (completadas > 0 && completadas === historias.length - 1 && ultima && ultima.completada) {
            this._recomendaciones.push({
                tipo: 'generar',
                icono: '🌊',
                mensaje: '¡Has completado todas las ondas! Genera una nueva onda para continuar.',
                prioridad: 'media',
                historiaId: null
            });
        }
        const ondasBajoRCN = historias.filter(h => h.rcnPromedio < 2 && h.rcnPromedio > 0);
        if (ondasBajoRCN.length >= 2) {
            this._recomendaciones.push({
                tipo: 'repaso',
                icono: '🔄',
                mensaje: `Repasa ${ondasBajoRCN.length} ondas con RCN bajo.`,
                prioridad: 'alta',
                historiaId: null
            });
        }
        const prioridades = { 'alta': 0, 'media': 1, 'baja': 2 };
        this._recomendaciones.sort((a, b) => prioridades[a.prioridad] - prioridades[b.prioridad]);
        try {
            localStorage.setItem('pipeline_elipse_recomendaciones', JSON.stringify({
                recomendaciones: this._recomendaciones,
                siguienteOnda: this._siguienteOndaSugerida,
                progreso: this._progresoGlobal,
                actualizado: Date.now()
            }));
        } catch (e) {}
    }

    async _sincronizarHistoriaCompletada(historiaId) {
        try {
            const historia = window.modoElipse?.getHistoriaElipse(historiaId);
            if (!historia || historia._sincronizado) return;
            console.log(`🔄 Sincronizando historia "${historia.titulo}" (RCN: ${historia.rcnPromedio.toFixed(1)})...`);

            await window.gestorProgresoHistorias.cambiarEstadoHistoria(historiaId, true, 'elipse');

            historia._sincronizado = true;
            historia._fechaSincronizacion = Date.now();
            window.modoElipse._guardarEstadoElipse();
            await this._guardarEstadoActual();

            window.dispatchEvent(new CustomEvent('elipseSincronizada', {
                detail: {
                    historiaId: historiaId,
                    titulo: historia.titulo,
                    rcnPromedio: historia.rcnPromedio,
                    temaId: this._temaId
                }
            }));
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this._core);
            }
            if (window.UITemas) {
                setTimeout(() => window.UITemas._renderTemas(), 300);
            }
            this._core?.mostrarToast(`✅ "${historia.titulo}" sincronizada (RCN: ${historia.rcnPromedio.toFixed(1)})`, 'success');
        } catch (error) {
            console.error('❌ Error sincronizando:', error);
        }
    }

    _construirHTMLPanel(idiomaActivo, nombreIdioma, nivelActual) {
        const tieneDatos = this._elipseData && this._elipseData.totalOndas > 0;
        const totalOndas = this._elipseData?.totalOndas || 0;
        const completadas = this._elipseData?.ondasCompletadas || 0;
        const progresoPct = this._progresoGlobal || 0;
        const palabrasNuevas = this._elipseData?.palabrasNuevas || 0;

        let historias = [];
        if (this._elipseData && this._temaId) {
            // 🔥 Ya vienen filtradas desde el estado
            historias = window.modoElipse?.getHistoriasElipse(this._temaId) || [];
        }

        const totalPaginas = Math.ceil(historias.length / this._ondasPorPagina);
        const inicio = (this._paginaOndas - 1) * this._ondasPorPagina;
        const fin = Math.min(inicio + this._ondasPorPagina, historias.length);
        const historiasPagina = historias.slice(inicio, fin);
        const tieneHistorias = historias.length > 0;
        const tieneDatosGuardados = this._temaId ? !!this._cachePorTema[this._temaId] : false;

        const estadoOndasCruzadas = window.modoOndasCruzadas?.getEstado?.() || {};
        const totalElipsesConectadas = estadoOndasCruzadas.grafoSize || 0;
        const totalInterferencias = estadoOndasCruzadas.interferencias || 0;

        let html = `
            <div class="elipse-container" style="padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:12px 20px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:14px;border:2px solid var(--primary)20;">
                    <div>
                        <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                            🌌 Modo Elipse <span style="font-size:14px;font-weight:400;color:var(--gray);margin-left:8px;">${nombreIdioma}</span>
                            <span style="font-size:10px;color:var(--success);margin-left:8px;">🔍 Solo ondas de Elipse</span>
                            <span style="font-size:10px;color:var(--danger);margin-left:8px;">🗑️ Eliminar en cada onda</span>
                        </h2>
                        <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                            Aprendizaje expansivo · Nivel <strong>${nivelActual}</strong>
                            ${tieneDatos ? `
                                <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">${totalOndas} ondas generadas</span>
                                <span style="font-size:11px;color:var(--success);margin-left:8px;">✅ ${completadas} completadas</span>
                                <span style="font-size:11px;color:var(--primary);margin-left:8px;">🧠 ${progresoPct}% progreso</span>
                            ` : `
                                <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">Sin elipse activa</span>
                                <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">${progresoPct}% progreso</span>
                            `}
                            ${tieneDatosGuardados ? `<span style="font-size:10px;color:var(--success);margin-left:8px;">💾 Datos guardados</span>` : ''}
                            ${totalElipsesConectadas > 0 ? `<span style="font-size:10px;color:var(--secondary);margin-left:8px;">🌊 ${totalElipsesConectadas} elipses conectadas</span>` : ''}
                            ${totalInterferencias > 0 ? `<span style="font-size:10px;color:var(--warning);margin-left:8px;">🔗 ${totalInterferencias} interferencias</span>` : ''}
                        </p>
                        <p style="font-size:11px;color:var(--gray-light);margin:2px 0 0;">
                            🖱️ Palabras desglosadas → Modal interactivo · ⭐ Guardar en Mi Espacio
                            <br>🔄 <strong>TODO retorna al Modo Elipse</strong> · 🧠 SRS conectado al Pipeline
                            <br>🔘 <strong>Botón "Volver al Modo Elipse" en Estudio (funcional)</strong>
                            ${tieneDatos ? ` · 🔄 ${palabrasNuevas} palabras nuevas` : ''}
                            <br><span style="color:var(--secondary);font-weight:600;">🌍 ${nombreIdioma} (${idiomaActivo})</span>
                            ${totalElipsesConectadas > 1 ? ` · 🌊 ${totalElipsesConectadas} elipses en el grafo` : ''}
                            <br><span style="color:var(--success);font-weight:500;">✅ Checkbox único para completar/descompletar</span>
                            <br><span style="color:var(--primary);font-weight:400;">✅ Soporte completo para BASE y actualización de RCN</span>
                            <br><span style="color:var(--secondary);font-weight:500;">📝 DESCRIPCIÓN OPCIONAL: Añade detalles antes de generar la onda</span>
                            <br><span style="color:var(--danger);font-weight:600;">🗑️ Botón ELIMINAR en cada onda (sincronizado con Temas y Ondas Cruzadas)</span>
                            <br><span style="color:var(--info);font-weight:400;">🔍 Verificación automática de historias eliminadas al renderizar</span>
                            <br><span style="color:var(--primary);font-weight:600;">💬 Prompt generado en idioma nativo · 🌍 Historia en idioma objetivo</span>
                            <br><span style="color:var(--danger);font-weight:700;">🔍 FILTRADO: Solo ondas de Elipse (excluye ondas cruzadas)</span>
                            <br><span style="color:var(--success);font-weight:700;">📊 Índices dinámicos: Base, Onda 1, Onda 2, ...</span>
                        </p>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.UIClipse._seleccionarTema()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-folder-open"></i> Seleccionar Tema
                        </button>
                        <button class="btn-primary" onclick="window.UIClipse._generarPlantilla()" style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-file-export"></i> Generar Plantilla
                        </button>
                        <button class="btn-success" onclick="window.UIClipse._importarOnda()" style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-file-import"></i> Importar Onda
                        </button>
                        <button class="btn-secondary" onclick="window.UIClipse._abrirOndasCruzadas()" 
                                style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#00CEC9);color:white;border:none;border-radius:6px;cursor:pointer;">
                            🌊 Ondas Cruzadas
                        </button>
                        <button class="btn-secondary" onclick="window.UIOndasCruzadas._sincronizarTodas()" 
                                style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            🔄 Sincronizar
                        </button>
                        <button class="btn-secondary" onclick="window.UIClipse._limpiarElipse()" style="padding:6px 14px;font-size:12px;background:var(--danger);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-trash"></i> Limpiar
                        </button>
                    </div>
                </div>

                ${this._renderizarRecomendaciones()}

                <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center;">
                    <div style="flex:1;min-width:200px;position:relative;">
                        <i class="fas fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gray);"></i>
                        <input type="text" id="buscarElipseInput" placeholder="🔍 Buscar en historias, frases, palabras..." style="width:100%;padding:10px 14px 10px 38px;border:2px solid var(--light);border-radius:10px;font-size:14px;font-family:var(--font);" oninput="window.UIClipse._buscarEnElipse(this.value)" value="${this._busqueda}">
                    </div>
                    ${this._busqueda ? `
                        <button class="btn-secondary" onclick="window.UIClipse._limpiarBusqueda()" style="padding:8px 16px;font-size:12px;background:var(--danger);color:white;border:none;border-radius:6px;cursor:pointer;"><i class="fas fa-times"></i> Limpiar</button>
                        <span style="font-size:12px;color:var(--gray-light);">${this._resultadosBusqueda.length} resultados</span>
                    ` : ''}
                </div>

                ${tieneDatos ? this._renderizarVisualizacionConDatos() : this._renderizarVisualizacionVacia()}
                ${tieneHistorias ? this._renderizarListaOndasConDatos(historias, historiasPagina, totalPaginas) : this._renderizarListaOndasVacia()}
                ${this._renderizarConfiguracion()}
                ${this._renderizarEstadisticasEstudio()}
                
                ${totalElipsesConectadas > 1 ? `
                    <div style="margin-top:16px;padding:12px 16px;background:linear-gradient(135deg, var(--secondary)04, var(--primary)04);border-radius:10px;border:2px solid var(--secondary)20;">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                            <div>
                                <span style="font-size:14px;font-weight:600;color:var(--dark);">🌊 ${totalElipsesConectadas} elipses en el grafo</span>
                                <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">🔗 ${totalInterferencias} conexiones activas</span>
                            </div>
                            <button class="btn-primary" onclick="window.UIClipse._abrirOndasCruzadas()" 
                                    style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#00CEC9);color:white;border:none;border-radius:4px;cursor:pointer;">
                                <i class="fas fa-wave-square"></i> Ver Grafo
                            </button>
                        </div>
                    </div>
                ` : `
                    <div style="margin-top:16px;padding:12px 16px;background:var(--bg);border-radius:10px;border:1px dashed var(--light);">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                            <span style="font-size:13px;color:var(--gray);">🌊 Genera ondas en diferentes temas para crear conexiones</span>
                            <button class="btn-secondary" onclick="window.UIClipse._abrirOndasCruzadas()" 
                                    style="padding:4px 14px;font-size:11px;background:var(--bg);border:1px solid var(--light);border-radius:4px;cursor:pointer;">
                                <i class="fas fa-info-circle"></i> Saber más
                            </button>
                        </div>
                    </div>
                `}
            </div>
        `;
        return html;
    }

    _renderizarRecomendaciones() {
        if (this._recomendaciones.length === 0) {
            return `
                <div style="background:var(--bg);border-radius:8px;padding:10px 16px;margin-bottom:16px;border-left:3px solid var(--success);">
                    <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--gray);">
                        <span style="font-size:18px;">🧠</span>
                        <span>Todo en orden. Sigue estudiando para generar nuevas ondas.</span>
                    </div>
                </div>
            `;
        }
        const recomendacionesHTML = this._recomendaciones.slice(0, 3).map((rec, idx) => {
            const colores = { 'alta': 'var(--danger)', 'media': 'var(--warning)', 'baja': 'var(--info)' };
            const color = colores[rec.prioridad] || 'var(--primary)';
            let accion = '';
            if (rec.historiaId && rec.tipo === 'estudio') {
                accion = `
                    <button class="btn-secondary" onclick="window.UIClipse._estudiarHistoria(${rec.historiaId})" style="padding:2px 10px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-play"></i> Estudiar</button>
                `;
            } else if (rec.tipo === 'generar') {
                accion = `
                    <button class="btn-secondary" onclick="window.UIClipse._generarPlantilla()" style="padding:2px 10px;font-size:10px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-file-export"></i> Generar</button>
                `;
            }
            return `
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:6px 0;border-bottom:${idx < this._recomendaciones.length - 1 ? '1px solid var(--light)' : 'none'};">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:18px;">${rec.icono}</span>
                        <span style="font-size:13px;color:var(--dark);">${rec.mensaje}</span>
                        <span style="font-size:9px;background:${color}15;color:${color};padding:1px 10px;border-radius:10px;">${rec.prioridad}</span>
                    </div>
                    ${accion}
                </div>
            `;
        }).join('');
        return `
            <div style="background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:8px;padding:10px 16px;margin-bottom:16px;border-left:3px solid var(--primary);">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                    <span style="font-size:16px;">🧠</span>
                    <span style="font-size:13px;font-weight:600;color:var(--dark);">Recomendaciones NeuroAdaptativas (${this._recomendaciones.length})</span>
                </div>
                ${recomendacionesHTML}
            </div>
        `;
    }

    _renderizarVisualizacionConDatos() {
        const total = this._elipseData.totalOndas;
        const completadas = this._elipseData.ondasCompletadas || 0;
        const pct = Math.round((completadas / total) * 100);
        let ondasVisuales = '';
        const maxOndas = this._elipseData.maxOndas || 10;
        for (let i = 0; i < maxOndas; i++) {
            const existe = i < total;
            const estaCompletada = existe && i < completadas;
            const esActiva = i === total - 1 && existe && !estaCompletada;
            let color = 'var(--bg)';
            let borde = '2px solid var(--light)';
            let texto = '';
            if (estaCompletada) {
                color = 'var(--success)';
                borde = '2px solid var(--success)';
                texto = '✅';
            } else if (esActiva) {
                color = 'var(--primary)';
                borde = '2px solid var(--primary)';
                texto = '🎯';
            } else if (existe) {
                color = 'var(--gray-light)';
                borde = '2px solid var(--gray-light)';
                texto = `${i+1}`;
            }
            const tamanio = 30 + (i * 4);
            ondasVisuales += `
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;margin:0 4px;">
                    <div style="width:${tamanio}px;height:${tamanio}px;border-radius:50%;background:${color};border:${borde};display:flex;align-items:center;justify-content:center;font-size:${existe ? '12px' : '8px'};color:${existe ? 'white' : 'var(--gray-light)'};transition:all 0.5s ease;${esActiva ? 'animation: pulse 2s ease-in-out infinite;' : ''}cursor:${existe ? 'pointer' : 'default'};" ${existe ? `onclick="window.UIClipse._irAOnda(${i})"` : ''} title="${existe ? `Onda ${i+1}` : 'Vacío'}">${texto}</div>
                    <span style="font-size:8px;color:var(--gray-light);">${existe ? (estaCompletada ? '✅' : (esActiva ? '🎯' : '')) : ''}</span>
                </div>
            `;
        }
        return `
            <div style="background:var(--white);border-radius:12px;padding:16px 20px;box-shadow:var(--shadow);margin-bottom:16px;border:2px solid var(--primary)20;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                    <div>
                        <h4 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">🧠 Elipse de Conocimiento</h4>
                        <span style="font-size:12px;color:var(--gray);">${total} ondas · ${completadas} completadas · ${Math.round((completadas / total) * 100)}% progreso</span>
                        <span style="font-size:10px;color:var(--primary);margin-left:8px;">🎯 ${this._siguienteOndaSugerida ? `Siguiente: "${this._siguienteOndaSugerida.titulo}"` : '¡Completado!'}</span>
                        <span style="font-size:9px;color:var(--gray-light);margin-left:8px;">🧠 SRS: ${this._progresoGlobal}%</span>
                        <span style="font-size:9px;color:var(--danger);margin-left:8px;">🔍 Solo ondas de Elipse</span>
                    </div>
                    <span style="font-size:11px;color:var(--gray-light);">🔄 ${this._elipseData.palabrasNuevas || 0} palabras nuevas</span>
                </div>
                <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:4px;padding:10px 0;">${ondasVisuales}</div>
                <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--gray-light);margin-top:4px;">
                    <span>🌱 Inicio</span>
                    <span>${total < maxOndas ? `📈 ${maxOndas - total} ondas restantes` : '🏁 Elipse completa'}</span>
                    <span>✅ ${completadas} completadas</span>
                    <span>🧠 ${this._progresoGlobal}%</span>
                </div>
            </div>
        `;
    }

    _renderizarVisualizacionVacia() {
        return `
            <div style="text-align:center;padding:30px;background:var(--bg);border-radius:12px;border:2px dashed var(--light);margin-bottom:16px;">
                <div style="font-size:48px;margin-bottom:8px;">🌌</div>
                <p style="font-size:16px;font-weight:600;color:var(--dark);">No hay elipse activa</p>
                <p style="font-size:13px;color:var(--gray-light);">Selecciona un tema con historias para iniciar la elipse.</p>
                <button class="btn-primary" onclick="window.UIClipse._seleccionarTema()" style="margin-top:12px;padding:8px 20px;font-size:13px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;"><i class="fas fa-folder-open"></i> Seleccionar Tema</button>
            </div>
        `;
    }

    _renderizarListaOndasConDatos(historias, historiasPagina, totalPaginas) {
        // Ya vienen filtradas por getHistoriasElipse(), pero por seguridad aplicamos el filtro
        const historiasFiltradas = historiasPagina.filter(h => !this._esOndaCruzada(h));

        if (historiasFiltradas.length === 0 && historias.length > 0) {
            return `
                <div style="margin-bottom:16px;">
                    <div style="text-align:center;padding:20px;color:var(--gray);background:var(--bg);border-radius:8px;border:1px solid var(--light);">
                        <p style="font-size:14px;">📭 No hay historias válidas en la elipse</p>
                        <p style="font-size:12px;color:var(--gray-light);">Las historias fueron eliminadas de la base de datos.</p>
                        <button class="btn-primary" onclick="window.UIClipse._cargarYRenderizar()" style="margin-top:8px;padding:6px 16px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-sync"></i> Refrescar</button>
                    </div>
                </div>
            `;
        }

        let html = `
            <div style="margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                    <h4 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">📖 Historias de la Elipse (${historias.length}) ${this._modoBusqueda ? `🔎 ${this._resultadosBusqueda.length} resultados` : ''}</h4>
                    <div style="display:flex;gap:8px;align-items:center;font-size:11px;color:var(--gray-light);">
                        <span>✅ ${historias.filter(h => h.completada).length} completadas</span>
                        <span>📖 ${historias.filter(h => !h.completada).length} pendientes</span>
                        ${totalPaginas > 1 ? `· 📄 ${this._paginaOndas}/${totalPaginas}` : ''}
                        <span style="font-size:9px;color:var(--primary);">🧠 SRS activo</span>
                        <span style="font-size:9px;color:var(--danger);">🗑️ Eliminar en cada onda</span>
                        <span style="font-size:9px;color:var(--success);">🔍 Solo Elipse</span>
                    </div>
                </div>
                ${totalPaginas > 1 ? this._renderizarPaginador(totalPaginas) : ''}
                <div style="display:flex;flex-direction:column;gap:8px;">
        `;
        for (const h of historiasFiltradas) {
            const indiceReal = historias.findIndex(el => el.id === h.id);
            const esBase = h.esBase || false;
            const completada = h.completada || false;
            const rcnPromedio = h.rcnPromedio || 0;
            const palabrasNuevas = h.palabrasNuevas || [];
            const icono = esBase ? '🌟' : (completada ? '✅' : '🌊');
            const color = completada ? 'var(--success)' : (esBase ? 'var(--primary)' : 'var(--warning)');
            const estadoTexto = completada ? '✅ Completada' : '📖 Pendiente';
            const estadoColor = completada ? 'var(--success)' : 'var(--warning)';
            const progresoOnda = this._progresoOndas[h.id] || {};
            const pctSRS = progresoOnda.frasesTotales > 0 ? Math.round((progresoOnda.frasesCompletadas || 0) / progresoOnda.frasesTotales * 100) : 0;
            const labelOnda = esBase ? '🌟 Base' : `🌊 Onda ${indiceReal + 1}`;

            html += `
                <div style="background:${completada ? 'var(--success)05' : 'var(--white)'};border-radius:8px;padding:10px 14px;border-left:4px solid ${color};box-shadow:var(--shadow);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                    <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:200px;">
                        <span style="font-size:20px;">${icono}</span>
                        <div style="flex:1;">
                            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                                <span style="font-size:14px;font-weight:600;color:var(--dark);">${labelOnda}</span>
                                <span style="font-size:13px;font-weight:400;color:var(--gray);">${h.titulo || 'Sin título'}</span>
                                <span style="font-size:10px;color:${estadoColor};font-weight:600;background:${estadoColor}15;padding:2px 10px;border-radius:12px;">${estadoTexto}</span>
                                <span style="font-size:8px;color:var(--success);background:var(--success)15;padding:1px 8px;border-radius:8px;">🔍 Elipse</span>
                            </div>
                            <div style="display:flex;gap:8px;font-size:11px;color:var(--gray-light);flex-wrap:wrap;margin-top:2px;">
                                <span>📊 RCN: <strong style="color:${completada ? 'var(--success)' : 'var(--warning)'};">${rcnPromedio.toFixed(1)}</strong></span>
                                <span>📝 ${palabrasNuevas.length} palabras nuevas</span>
                                <span>🎯 ${h.nivel || 'A1'}</span>
                                ${completada ? '<span style="color:var(--success);">✅ Completada</span>' : ''}
                                ${rcnPromedio > 0 && rcnPromedio < 2 ? '<span style="color:var(--warning);">🔄 Necesita repaso</span>' : ''}
                                <span style="color:var(--primary);font-size:9px;">🧠 ${pctSRS}%</span>
                                ${esBase ? '<span style="color:var(--primary);font-size:9px;font-weight:700;">🌟 BASE</span>' : ''}
                                <span style="color:var(--gray-light);font-size:8px;">📌 Índice ${indiceReal}</span>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;">
                        <label style="display:flex;align-items:center;gap:4px;font-size:10px;cursor:pointer;padding:2px 8px;background:${completada ? 'var(--success)15' : 'var(--bg)'};border-radius:12px;border:1px solid ${completada ? 'var(--success)' : 'var(--light)'};">
                            <input type="checkbox" ${completada ? 'checked' : ''} 
                                   onchange="window.gestorProgresoHistorias.cambiarEstadoHistoria(${h.id}, this.checked, 'elipse')"
                                   style="margin:0;width:14px;height:14px;cursor:pointer;">
                            <span style="color:${completada ? 'var(--success)' : 'var(--gray)'};font-size:9px;">${completada ? '✅ Completada' : '⬜ Pendiente'}</span>
                        </label>
                        <button class="btn-secondary" onclick="window.UIClipse._estudiarHistoria(${h.id})" style="padding:2px 10px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;" title="${completada ? 'Repasar historia completada' : 'Estudiar historia'}"><i class="fas fa-play"></i> ${completada ? 'Repasar' : 'Estudiar'}</button>
                        <button class="btn-secondary" onclick="window.UIClipse._leerHistoria(${h.id})" style="padding:2px 10px;font-size:10px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;" title="Leer historia completa"><i class="fas fa-book"></i> Leer</button>
                        ${!esBase && !completada ? `<button class="btn-secondary" onclick="window.UIClipse._generarPlantillaDesdeHistoria(${h.id})" style="padding:2px 10px;font-size:10px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;" title="Generar nueva onda desde esta historia"><i class="fas fa-file-export"></i> Generar</button>` : ''}
                        <button class="btn-danger" onclick="window.UIClipse._eliminarOnda(${h.id})" 
                                style="padding:2px 8px;font-size:10px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;" 
                                title="Eliminar onda permanentemente (sincronizado con Temas y Ondas Cruzadas)"
                                onmouseover="this.style.transform='scale(1.1)';this.style.boxShadow='0 2px 8px rgba(255,118,117,0.3)'" 
                                onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }
        html += `
                </div>
                ${totalPaginas > 1 ? this._renderizarPaginador(totalPaginas) : ''}
            </div>
        `;
        return html;
    }

    _renderizarListaOndasVacia() {
        return `
            <div style="text-align:center;padding:20px;color:var(--gray);background:var(--bg);border-radius:8px;border:1px solid var(--light);margin-bottom:16px;">
                <p style="font-size:14px;">📚 No hay historias en la elipse</p>
                <p style="font-size:12px;color:var(--gray-light);">Genera una plantilla e importa una onda para comenzar</p>
            </div>
        `;
    }

    _renderizarConfiguracion() {
        const config = window.modoElipse?.getConfiguracion() || {};
        return `
            <div style="background:var(--bg);border-radius:10px;padding:12px 16px;border:1px solid var(--light);margin-top:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                    <div>
                        <span style="font-size:12px;font-weight:600;color:var(--gray);">⚙️ Configuración</span>
                        <div style="display:flex;gap:12px;font-size:11px;color:var(--gray-light);flex-wrap:wrap;">
                            <span>📊 Máximo: ${config.maxOndas || 10} ondas</span>
                            <span>📝 Palabras nuevas: ${config.palabrasNuevasPorOnda || 3}</span>
                            <span>🎯 Nivel base: ${config.nivelBase || 'A1'}</span>
                            <span>🔥 Sin IA en background</span>
                            <span>🧠 ${this._ondasRevisadas.size} ondas revisadas</span>
                            <span>🔄 SRS: ${this._progresoGlobal}%</span>
                            <span>🌊 ${window.modoOndasCruzadas?.getEstado?.()?.grafoSize || 0} elipses conectadas</span>
                            <span>📝 Descripción opcional: Habilitada</span>
                            <span style="color:var(--danger);">🗑️ Eliminar sincronizado</span>
                            <span style="color:var(--info);">🔍 Verificación automática</span>
                            <span style="color:var(--primary);">💬 Prompt multidioma activo</span>
                            <span style="color:var(--success);">🔍 FILTRADO activo</span>
                        </div>
                    </div>
                    <button class="btn-secondary" onclick="window.UIClipse._abrirConfiguracion()" style="padding:4px 12px;font-size:11px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;"><i class="fas fa-cog"></i> Configurar</button>
                </div>
            </div>
        `;
    }

    _renderizarEstadisticasEstudio() {
        const tiempo = Math.floor((Date.now() - this._inicioSesion) / 60000);
        const ondas = window.modoElipse?.getHistoriasElipse(this._temaId) || [];
        const totalPalabras = ondas.reduce((acc, h) => acc + (h.palabrasNuevas?.length || 0), 0);
        const completadas = ondas.filter(h => h.completada).length;
        const pendientes = ondas.length - completadas;
        const progresoPct = ondas.length > 0 ? Math.round((completadas / ondas.length) * 100) : 0;
        const sincronizadas = ondas.filter(h => h._sincronizado).length;
        const estadoOndasCruzadas = window.modoOndasCruzadas?.getEstado?.() || {};
        return `
            <div style="background:var(--bg);border-radius:10px;padding:10px 16px;border:1px solid var(--light);margin-top:8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:6px;font-size:10px;color:var(--gray);">
                <div style="text-align:center;"><div style="font-size:16px;font-weight:800;color:var(--primary);">${progresoPct}%</div><div style="font-size:8px;color:var(--gray-light);">Progreso</div></div>
                <div style="text-align:center;"><div style="font-size:16px;font-weight:800;color:var(--secondary);">${ondas.length}</div><div style="font-size:8px;color:var(--gray-light);">Ondas Elipse</div></div>
                <div style="text-align:center;"><div style="font-size:16px;font-weight:800;color:var(--success);">${completadas}</div><div style="font-size:8px;color:var(--gray-light);">Completadas</div></div>
                <div style="text-align:center;"><div style="font-size:16px;font-weight:800;color:var(--warning);">${pendientes}</div><div style="font-size:8px;color:var(--gray-light);">Pendientes</div></div>
                <div style="text-align:center;"><div style="font-size:16px;font-weight:800;color:var(--success);">${sincronizadas}</div><div style="font-size:8px;color:var(--gray-light);">Sincronizadas</div></div>
                <div style="text-align:center;"><div style="font-size:16px;font-weight:800;color:var(--info);">${totalPalabras}</div><div style="font-size:8px;color:var(--gray-light);">Palabras</div></div>
                <div style="text-align:center;"><div style="font-size:16px;font-weight:800;color:var(--primary);">${this._ondasRevisadas.size}</div><div style="font-size:8px;color:var(--gray-light);">Revisadas</div></div>
                <div style="text-align:center;"><div style="font-size:16px;font-weight:800;color:var(--gray);">${tiempo}m</div><div style="font-size:8px;color:var(--gray-light);">Tiempo</div></div>
                <div style="text-align:center;"><div style="font-size:16px;font-weight:800;color:var(--secondary);">${estadoOndasCruzadas.grafoSize || 0}</div><div style="font-size:8px;color:var(--gray-light);">Elipses</div></div>
                <div style="text-align:center;"><div style="font-size:16px;font-weight:800;color:var(--warning);">${estadoOndasCruzadas.interferencias || 0}</div><div style="font-size:8px;color:var(--gray-light);">Interferencias</div></div>
            </div>
        `;
    }

    _renderizarPaginador(totalPaginas) {
        if (totalPaginas <= 1) return '';
        return `
            <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin:8px 0 12px 0;flex-wrap:wrap;">
                <button class="btn-secondary" onclick="window.UIClipse._irPagina(${this._paginaOndas - 1})" style="padding:4px 12px;font-size:11px;${this._paginaOndas <= 1 ? 'opacity:0.5;cursor:default;' : ''}" ${this._paginaOndas <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>
                <span style="font-size:12px;color:var(--gray);">${this._paginaOndas} / ${totalPaginas}</span>
                <button class="btn-secondary" onclick="window.UIClipse._irPagina(${this._paginaOndas + 1})" style="padding:4px 12px;font-size:11px;${this._paginaOndas >= totalPaginas ? 'opacity:0.5;cursor:default;' : ''}" ${this._paginaOndas >= totalPaginas ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
    }

    async _irAOnda(indice) {
        const historias = window.modoElipse?.getHistoriasElipse(this._temaId) || [];
        const historia = historias.find(h => h.indice === indice);
        if (historia) {
            const tarjetas = document.querySelectorAll('.elipse-container .historia-card');
            if (tarjetas[indice]) {
                tarjetas[indice].scrollIntoView({ behavior: 'smooth', block: 'center' });
                tarjetas[indice].style.border = '2px solid var(--primary)';
                setTimeout(() => { tarjetas[indice].style.border = ''; }, 3000);
            }
        }
    }

    _irPagina(pagina) {
        const historias = window.modoElipse?.getHistoriasElipse(this._temaId) || [];
        const totalPaginas = Math.ceil(historias.length / this._ondasPorPagina);
        if (pagina < 1 || pagina > totalPaginas) return;
        this._paginaOndas = pagina;
        this._renderizarPanel(this._temaId);
    }

    async _buscarEnElipse(termino) {
        this._busqueda = termino.trim();
        if (!this._busqueda || this._busqueda.length < 2) {
            this._modoBusqueda = false;
            this._resultadosBusqueda = [];
            await this._renderizarPanel(this._temaId);
            return;
        }
        this._core?.mostrarToast(`🔍 Buscando "${this._busqueda}"...`, 'info');
        try {
            const resultados = await window.modoElipse?.buscarEnElipse(this._busqueda);
            if (resultados && resultados.resultados.length > 0) {
                this._modoBusqueda = true;
                this._resultadosBusqueda = resultados.resultados;
                this._core?.mostrarToast(`🔎 ${resultados.total} resultados encontrados`, 'success');
            } else {
                this._modoBusqueda = true;
                this._resultadosBusqueda = [];
                this._core?.mostrarToast(`🔎 No se encontraron resultados para "${this._busqueda}"`, 'warning');
            }
            await this._renderizarPanel(this._temaId);
        } catch (error) {
            console.error('❌ Error buscando:', error);
            this._core?.mostrarToast('❌ Error en la búsqueda', 'error');
        }
    }

    _limpiarBusqueda() {
        this._busqueda = '';
        this._modoBusqueda = false;
        this._resultadosBusqueda = [];
        const input = document.getElementById('buscarElipseInput');
        if (input) input.value = '';
        this._renderizarPanel(this._temaId);
        this._core?.mostrarToast('🧹 Búsqueda limpiada', 'info');
    }

    async _abrirConfiguracion() {
        console.log('⚙️ Abriendo configuración...');
        const config = window.modoElipse?.getConfiguracion() || {};
        const mensaje = `⚙️ **Configuración del Modo Elipse**\n\n📊 **Máximo de ondas:** ${config.maxOndas || 10}\n📝 **Palabras nuevas por onda:** ${config.palabrasNuevasPorOnda || 3}\n🎯 **Nivel base:** ${config.nivelBase || 'A1'}\n📝 **Descripción opcional:** Habilitada\n🔥 **Sin IA en background**\n🧠 **SRS conectado al Pipeline**\n🗑️ **Eliminar sincronizado con Temas y Ondas Cruzadas**\n🔍 **Verificación automática de historias eliminadas**\n💬 **Prompt multidioma: El prompt se genera en el idioma nativo del usuario**\n🔍 **Filtrado de ondas cruzadas**\n\n💡 ¿Qué te gustaría cambiar?\n1. Máximo de ondas\n2. Palabras nuevas por onda\n3. Nivel base\n4. Cancelar`;
        const seleccion = await this._core?.prompt(mensaje, '4', 'Elige una opción (1-4)...', '⚙️ Configuración');
        if (!seleccion) return;
        const opcion = parseInt(seleccion);
        let nuevoValor;
        switch (opcion) {
            case 1:
                nuevoValor = await this._core?.prompt('📊 Nuevo máximo de ondas (3-15):', String(config.maxOndas || 10), 'Número...', '📊');
                if (nuevoValor) {
                    const valor = parseInt(nuevoValor);
                    if (valor >= 3 && valor <= 15) {
                        await window.modoElipse?.actualizarConfiguracion({ maxOndas: valor });
                        this._core?.mostrarToast(`✅ Máximo de ondas: ${valor}`, 'success');
                    } else {
                        this._core?.mostrarToast('❌ Valor inválido. Debe ser entre 3 y 15.', 'error');
                    }
                }
                break;
            case 2:
                nuevoValor = await this._core?.prompt('📝 Nuevas palabras por onda (1-8):', String(config.palabrasNuevasPorOnda || 3), 'Número...', '📝');
                if (nuevoValor) {
                    const valor = parseInt(nuevoValor);
                    if (valor >= 1 && valor <= 8) {
                        await window.modoElipse?.actualizarConfiguracion({ palabrasNuevasPorOnda: valor });
                        this._core?.mostrarToast(`✅ Palabras nuevas por onda: ${valor}`, 'success');
                    } else {
                        this._core?.mostrarToast('❌ Valor inválido. Debe ser entre 1 y 8.', 'error');
                    }
                }
                break;
            case 3:
                const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                const nivelOptions = niveles.map(n => `${n}`).join(', ');
                nuevoValor = await this._core?.prompt(`🎯 Nuevo nivel base (${nivelOptions}):`, config.nivelBase || 'A1', 'Nivel...', '🎯');
                if (nuevoValor) {
                    const valor = nuevoValor.toUpperCase();
                    if (niveles.includes(valor)) {
                        await window.modoElipse?.actualizarConfiguracion({ nivelBase: valor });
                        this._core?.mostrarToast(`✅ Nivel base: ${valor}`, 'success');
                    } else {
                        this._core?.mostrarToast('❌ Nivel inválido.', 'error');
                    }
                }
                break;
            default:
                this._core?.mostrarToast('❌ Opción cancelada', 'info');
        }
        await this._renderizarPanel(this._temaId);
    }

    async _generarPlantilla() {
        console.log('📄 Generando plantilla para onda...');

        const container = this._getContainer();
        if (!container) {
            console.error('❌ No hay contenedor para generar plantilla');
            this._core?.mostrarToast('❌ Error: contenedor no disponible', 'error');
            return;
        }
        this._container = container;

        if (!this._temaId) {
            this._core?.mostrarToast('❌ Selecciona un tema primero', 'error');
            await this._seleccionarTema();
            return;
        }
        const historias = window.modoElipse?.getHistoriasElipse(this._temaId) || [];
        if (historias.length === 0) {
            this._core?.mostrarToast('❌ No hay historias en la elipse. Selecciona un tema con historias.', 'error');
            await this._seleccionarTema();
            return;
        }

        const descripcion = await this._mostrarModalDescripcion(this._temaId, null, false);

        this._core?.mostrarToast('📄 Generando plantilla para nueva onda...', 'info');
        try {
            const plantilla = await window.modoElipse?.generarPlantillaOnda(this._temaId, null, descripcion);
            if (plantilla) {
                this._mostrarPlantillaEnModal(plantilla);
                this._core?.mostrarToast('📄 Plantilla generada. Envía a IA externa para completar.', 'success');
            } else {
                this._core?.mostrarToast('❌ No se pudo generar la plantilla', 'error');
            }
        } catch (error) {
            console.error('❌ Error generando plantilla:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _generarPlantillaDesdeHistoria(historiaId) {
        console.log('📄 Generando plantilla desde historia:', historiaId);
        if (!this._temaId) {
            this._core?.mostrarToast('❌ No hay tema seleccionado', 'error');
            return;
        }

        const descripcion = await this._mostrarModalDescripcion(this._temaId, historiaId, true);

        this._core?.mostrarToast('📄 Generando plantilla desde historia...', 'info');
        try {
            const plantilla = await window.modoElipse?.generarPlantillaOnda(this._temaId, historiaId, descripcion);
            if (plantilla) {
                this._mostrarPlantillaEnModal(plantilla);
                this._core?.mostrarToast('📄 Plantilla generada. Envía a IA externa para completar.', 'success');
            } else {
                this._core?.mostrarToast('❌ No se pudo generar la plantilla', 'error');
            }
        } catch (error) {
            console.error('❌ Error generando plantilla:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    _mostrarModalDescripcion(temaId, historiaId, esDesdeHistoria = false) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.id = 'modalDescripcionElipse';
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

            const html = `
                <div style="background: var(--white, #ffffff); border-radius: 20px; padding: 28px 24px; max-width: 520px; width: 100%; box-shadow: 0 30px 80px rgba(0,0,0,0.4);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="font-size: 18px; font-weight: 700; color: var(--dark); margin: 0;">
                            📝 Descripción para la nueva onda
                        </h3>
                        <button id="closeModalDescripcionElipse" style="background: none; border: none; font-size: 28px; color: var(--gray); cursor: pointer; transition: all 0.3s; padding: 0 8px;" 
                                onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--gray)'">
                            &times;
                        </button>
                    </div>
                    <p style="font-size: 13px; color: var(--gray); margin-bottom: 12px;">
                        💡 Puedes escribir una descripción opcional para la nueva historia.
                        <br>Ejemplo: <em>"Añadir un nuevo personaje llamado Ana"</em> o <em>"La historia transcurre en una playa"</em>.
                        <br><span style="color: var(--success);">✅ Si no escribes nada, se generará con el contexto automático.</span>
                        <br><span style="color: var(--primary);">💬 La descripción se incluirá en el prompt en tu idioma nativo.</span>
                    </p>
                    <div style="margin-bottom: 16px;">
                        <textarea id="descripcionOndaElipse" rows="4" 
                                  placeholder="Ej: Introduce un nuevo personaje, un lugar diferente, un giro en la trama..."
                                  style="width: 100%; padding: 12px 14px; border: 2px solid var(--light); border-radius: 10px; font-size: 14px; font-family: var(--font); resize: vertical; transition: all 0.3s;"
                                  onfocus="this.style.borderColor='var(--primary)'" 
                                  onblur="this.style.borderColor='var(--light)'"></textarea>
                        <div style="font-size: 11px; color: var(--gray-light); margin-top: 4px;">
                            📝 <span id="contadorDescripcionElipse">0</span> caracteres · Opcional
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button id="btnContinuarDescripcionElipse" 
                                style="flex: 1; padding: 12px 20px; font-size: 15px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; background: linear-gradient(135deg, #6C5CE7, #A29BFE); color: white; transition: all 0.3s;"
                                onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" 
                                onmouseout="this.style.transform='none'; this.style.boxShadow='none'">
                            <i class="fas fa-arrow-right"></i> Generar Plantilla
                        </button>
                        <button id="btnSaltarDescripcionElipse" 
                                style="padding: 12px 20px; font-size: 14px; font-weight: 600; border: none; border-radius: 10px; cursor: pointer; background: var(--bg); color: var(--gray); transition: all 0.3s;"
                                onmouseover="this.style.background='var(--light)'" 
                                onmouseout="this.style.background='var(--bg)'">
                            Saltar
                        </button>
                    </div>
                </div>
            `;

            overlay.innerHTML = html;
            document.body.appendChild(overlay);

            const textarea = document.getElementById('descripcionOndaElipse');
            const contador = document.getElementById('contadorDescripcionElipse');
            const btnContinuar = document.getElementById('btnContinuarDescripcionElipse');
            const btnSaltar = document.getElementById('btnSaltarDescripcionElipse');
            const btnClose = document.getElementById('closeModalDescripcionElipse');

            if (textarea && contador) {
                textarea.addEventListener('input', () => {
                    contador.textContent = textarea.value.length;
                });
            }

            const resolver = (descripcion) => {
                if (overlay.parentNode) overlay.remove();
                resolve(descripcion || '');
            };

            if (btnContinuar) {
                btnContinuar.addEventListener('click', () => {
                    const desc = textarea ? textarea.value.trim() : '';
                    resolver(desc);
                });
            }

            if (btnSaltar) {
                btnSaltar.addEventListener('click', () => {
                    resolver('');
                });
            }

            if (btnClose) {
                btnClose.addEventListener('click', () => {
                    resolver('');
                });
            }

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    resolver('');
                }
            });

            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    resolver('');
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
            overlay._escapeHandler = escapeHandler;

            if (textarea) {
                setTimeout(() => textarea.focus(), 100);
            }
        });
    }

    _mostrarPlantillaEnModal(plantilla) {
        if (!this._core) return;

        this._core.abrirModal('📄 Plantilla Onda Elipse');

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

        // Crear el área de texto
        const textarea = document.createElement('textarea');
        textarea.id = 'jsonTextarea';
        textarea.style.cssText = `
            width: 100%;
            min-height: 400px;
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

        // Crear el div de información
        const infoDiv = document.createElement('div');
        infoDiv.id = 'elipseInfoDiv';
        infoDiv.style.cssText = `
            background: var(--bg);
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 12px;
            font-size: 12px;
            color: var(--gray);
            border-left: 4px solid var(--primary);
        `;

        const nivel = plantilla.meta?.nivel || 'A1';
        const numPalabras = plantilla.meta?.num_palabras_nuevas || 3;
        const esJeroglifico = plantilla.meta?.es_jeroglifico || false;
        const descripcionUsuario = plantilla.meta?.descripcion_usuario || '';

        infoDiv.innerHTML = `
            <strong>📋 Instrucciones - Plantilla Onda Elipse</strong><br>
            🌍 Idioma objetivo: <strong>${nombreIdiomaObjetivo}</strong> · 💬 Prompt en: <strong>${nombreIdiomaPrompt}</strong><br>
            📝 Nivel: <strong>${nivel}</strong> · 📝 Palabras nuevas: <strong>${numPalabras}</strong><br>
            ${descripcionUsuario ? `📝 Descripción del usuario: <strong>"${descripcionUsuario.substring(0, 80)}${descripcionUsuario.length > 80 ? '...' : ''}"</strong><br>` : ''}
            1. Copia este JSON y envíalo a Groq/ChatGPT con las instrucciones que contiene.<br>
            2. La IA completará el JSON con una nueva historia en <strong>${nombreIdiomaObjetivo}</strong>.<br>
            3. Cuando la IA te devuelva el JSON completado, pégalo aquí y pulsa <strong>"Importar"</strong>.<br>
            4. La nueva onda se añadirá automáticamente a la elipse.<br>
            <br>
            <span style="font-size:11px;color:var(--gray-light);">
                💡 El prompt está en <strong>${nombreIdiomaPrompt}</strong> para que la IA entienda mejor las instrucciones.
            </span>
            <br>
            <span style="font-size:10px;color:var(--success);">
                🔥 SIN CONSUMO DE TOKENS - Solo generas la plantilla, la IA externa la completa.
            </span>
            <br>
            <span style="font-size:10px;color:var(--primary);">
                🔄 Al importar, el SRS se conectará automáticamente al Pipeline.
            </span>
            ${esJeroglifico ? `
                <br>
                <span style="font-size:10px;color:var(--secondary);">
                    🀄 El JSON incluye campos para PINYIN con tonos.
                </span>
            ` : ''}
            ${descripcionUsuario ? `
                <br>
                <span style="font-size:10px;color:var(--warning);">
                    📝 La descripción del usuario ha sido incluida en el prompt.
                </span>
            ` : ''}
            <br>
            <span style="font-size:10px;color:var(--success);">
                🔍 La onda se marcará como de Elipse (no cruzada).
            </span>
        `;

        // Contenedor de botones
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

                await self._importarOndaDesdeJSON(data);
                self._core.cerrarModal();
                self._core.mostrarToast('✅ Onda importada correctamente', 'success');
                await self._renderizarPanel(self._temaId);
            } catch (e) {
                self._core?.mostrarToast('❌ Error: ' + e.message, 'error');
                this.innerHTML = '<i class="fas fa-file-import"></i> Importar';
                this.disabled = false;
            }
        };

        buttonContainer.appendChild(copyBtn);
        buttonContainer.appendChild(importBtn);

        // Añadir todo al modal
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

    async _importarOnda() {
        console.log('📥 Importando onda...');

        const container = this._getContainer();
        if (!container) {
            console.error('❌ No hay contenedor para importar onda');
            this._core?.mostrarToast('❌ Error: contenedor no disponible', 'error');
            return;
        }
        this._container = container;

        if (!this._temaId) {
            this._core?.mostrarToast('❌ Selecciona un tema primero', 'error');
            await this._seleccionarTema();
            return;
        }

        if (this._core) {
            this._core.abrirModal('📥 Importar Onda Elipse');

            // Limpiar modal
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) {
                modalBody.innerHTML = '';
            }

            const textarea = document.createElement('textarea');
            textarea.id = 'jsonTextarea';
            textarea.style.cssText = `
                width: 100%;
                min-height: 300px;
                font-size: 13px;
                font-family: monospace;
                padding: 12px;
                border: 2px solid var(--light);
                border-radius: 8px;
                background: var(--bg);
                color: var(--dark);
                resize: vertical;
                margin-bottom: 10px;
            `;
            textarea.placeholder = 'Pega aquí el JSON completado por la IA...';
            textarea.readOnly = false;

            const infoDiv = document.createElement('div');
            infoDiv.className = 'import-info-div';
            infoDiv.style.cssText = `
                background: var(--bg);
                border-radius: 8px;
                padding: 12px 16px;
                margin-bottom: 12px;
                font-size: 12px;
                color: var(--gray);
                border-left: 4px solid var(--success);
            `;
            
            // Obtener idiomas
            const idiomaObjetivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            const idiomaPrompt = this._obtenerIdiomaNativo() || 'es';
            const nombreIdiomaObjetivo = this._getNombreIdioma(idiomaObjetivo);
            const nombreIdiomaPrompt = this._getNombreIdioma(idiomaPrompt);

            infoDiv.innerHTML = `
                <strong>📥 Importar Onda:</strong><br>
                1. Pega el JSON completado por la IA.<br>
                2. Asegúrate de que tenga la estructura correcta (con "historias" y "frases").<br>
                3. Pulsa <strong>"Importar"</strong> para añadir la onda a la elipse.<br>
                <br>
                <span style="font-size:11px;color:var(--gray-light);">
                    💡 El JSON debe tener la misma estructura que la plantilla generada.
                </span>
                <br>
                <span style="font-size:10px;color:var(--success);">
                    🔥 SIN CONSUMO DE TOKENS - Solo importas el JSON completado.
                </span>
                <br>
                <span style="font-size:10px;color:var(--primary);">
                    🧠 El SRS se activará automáticamente al estudiar la onda.
                </span>
                <br>
                <span style="font-size:10px;color:var(--secondary);">
                    🌍 Idioma objetivo: <strong>${nombreIdiomaObjetivo}</strong> · 💬 Prompt en: <strong>${nombreIdiomaPrompt}</strong>
                </span>
                <br>
                <span style="font-size:10px;color:var(--success);">
                    🔍 La onda se marcará como de Elipse (no cruzada).
                </span>
            `;

            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-top: 10px;
            `;

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
                    await self._importarOndaDesdeJSON(data);
                    self._core.cerrarModal();
                    self._core.mostrarToast('✅ Onda importada correctamente', 'success');
                    await self._renderizarPanel(self._temaId);
                } catch (e) {
                    self._core?.mostrarToast('❌ Error: ' + e.message, 'error');
                    this.innerHTML = '<i class="fas fa-file-import"></i> Importar';
                    this.disabled = false;
                }
            };

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
        }
    }

    async _importarOndaDesdeJSON(data) {
        if (this._importando) {
            this._core?.mostrarToast('⏳ Ya hay una importación en curso', 'warning');
            return;
        }
        if (!this._temaId) {
            throw new Error('No hay tema seleccionado');
        }
        if (!data.historias || !Array.isArray(data.historias) || data.historias.length === 0) {
            throw new Error('JSON inválido: debe contener "historias"');
        }
        const historiaData = data.historias[0];
        if (!historiaData.frases || !Array.isArray(historiaData.frases) || historiaData.frases.length === 0) {
            throw new Error('JSON inválido: la historia no tiene frases');
        }
        const primeraFrase = historiaData.frases[0];
        if (primeraFrase.original &&
            (primeraFrase.original.includes('[') || primeraFrase.original.includes('Frase') ||
                primeraFrase.original.includes('frase') || primeraFrase.original.length < 3)) {
            throw new Error('Parece ser una PLANTILLA vacía. Completa el JSON con la IA antes de importar.');
        }
        this._importando = true;
        this._core?.mostrarToast('📥 Importando onda...', 'info');
        try {
            const historiaId = await window.modoElipse?.importarOnda(this._temaId, data);
            if (historiaId) {
                await this._actualizarEstadoCompletado(historiaId);
                await this._renderizarPanel(this._temaId);
                if (window.UIDashboard) {
                    window.UIDashboard._cargarDashboardInicial(this._core);
                }
                this._core?.mostrarToast('✅ Onda importada correctamente', 'success');
                this._importando = false;
                return historiaId;
            } else {
                throw new Error('Error importando la onda');
            }
        } catch (error) {
            console.error('❌ Error importando onda:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
            this._importando = false;
            throw error;
        }
    }

    async _eliminarOnda(historiaId) {
        console.log('🗑️ Eliminando onda de la Elipse:', historiaId);

        const historia = await db.get('historias', historiaId);
        if (!historia) {
            this._core?.mostrarToast('❌ Historia no encontrada', 'error');
            if (window.modoElipse) {
                const index = window.modoElipse._historiasElipse.findIndex(h => h.id === historiaId);
                if (index !== -1) {
                    window.modoElipse._historiasElipse.splice(index, 1);
                    window.modoElipse._estadisticas.totalOndas = window.modoElipse._historiasElipse.length;
                    window.modoElipse._guardarEstadoElipse();
                    await window.modoElipse._guardarEnIndexedDB();
                    console.log(`🌌 Onda ${historiaId} eliminada de la Elipse (no existía en DB)`);
                    this._renderizarPanel(this._temaId);
                }
            }
            return;
        }

        const confirmar = await this._core?.confirm(
            `⚠️ ¿Eliminar la onda "${historia.titulo || 'Sin título'}"?\n\n` +
            `Se eliminarán TODAS las frases asociadas.\n` +
            `Esta acción NO se puede deshacer.\n\n` +
            `🌊 La onda desaparecerá de:\n` +
            `• La Elipse\n` +
            `• Los Temas\n` +
            `• El grafo de Ondas Cruzadas (si existe)\n\n` +
            `📊 Esta onda tiene ${historia.frases || 0} frases.`,
            '🗑️ Eliminar Onda'
        );

        if (!confirmar) return;

        const temaId = historia.temaId;

        try {
            const frases = await db.obtenerFrasesPorHistoria(historiaId);
            for (const f of frases) {
                await db.delete('frases', f.id);
            }
            await db.delete('historias', historiaId);

            const tema = await db.obtenerTema(temaId);
            if (tema && tema.historiasIds) {
                tema.historiasIds = tema.historiasIds.filter(id => id !== historiaId);
                tema.frases = (tema.frases || 0) - frases.length;
                await db.update('temas', tema);
                console.log(`📂 Tema "${tema.nombre}" actualizado: historiasIds eliminada`);
            }

            if (window.modoElipse) {
                const index = window.modoElipse._historiasElipse.findIndex(h => h.id === historiaId);
                if (index !== -1) {
                    window.modoElipse._historiasElipse.splice(index, 1);
                    window.modoElipse._estadisticas.totalOndas = window.modoElipse._historiasElipse.length;
                    window.modoElipse._guardarEstadoElipse();
                    await window.modoElipse._guardarEnIndexedDB();
                    console.log(`🌌 Onda ${historiaId} eliminada de la Elipse`);

                    if (window.modoElipse._recuerdoOndas && window.modoElipse._recuerdoOndas.resumenPorOnda) {
                        const indices = Object.keys(window.modoElipse._recuerdoOndas.resumenPorOnda);
                        for (const idx of indices) {
                            if (window.modoElipse._recuerdoOndas.resumenPorOnda[idx].id === historiaId) {
                                delete window.modoElipse._recuerdoOndas.resumenPorOnda[idx];
                            }
                        }
                        window.modoElipse._guardarRecuerdoOndas();
                    }
                }
            }

            if (window.modoOndasCruzadas) {
                try {
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
                        await window.modoOndasCruzadas._guardarDatos();
                        console.log(`🌊 Onda ${historiaId} eliminada del grafo de Ondas Cruzadas`);
                    }
                } catch (e) {
                    console.warn('⚠️ Error eliminando de Ondas Cruzadas:', e);
                }
            }

            window.dispatchEvent(new CustomEvent('historiaEliminada', {
                detail: {
                    historiaId: historiaId,
                    temaId: temaId,
                    titulo: historia.titulo,
                    esOnda: true,
                    esOndaCruzada: historia._esOndaCruzada || false
                }
            }));

            window.dispatchEvent(new CustomEvent('elipseEstadoActualizado', {
                detail: {
                    tipo: 'onda_eliminada',
                    historiaId: historiaId,
                    temaId: temaId
                }
            }));

            this._core?.mostrarToast(`🗑️ "${historia.titulo || 'Onda'}" eliminada correctamente`, 'warning');

            await this._renderizarPanel(temaId);

            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this._core);
            }
            if (window.UITemas) {
                setTimeout(() => window.UITemas._renderTemas(), 300);
            }
            if (window.UIOndasCruzadas) {
                setTimeout(() => {
                    window.UIOndasCruzadas._cargarDatos().then(() => {
                        window.UIOndasCruzadas._renderizarPanel();
                    });
                }, 300);
            }

        } catch (error) {
            console.error('❌ Error eliminando onda:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _limpiarElipse() {
        console.log('🧹 Limpiando elipse...');
        if (!this._temaId) {
            this._core?.mostrarToast('❌ No hay elipse activa', 'error');
            return;
        }
        const confirmar = await this._core?.confirm(
            `🧹 ¿Limpiar la elipse del tema actual?\n\nSe eliminarán TODAS las ondas generadas (${this._elipseData?.totalOndas || 0} ondas).\n\n⚠️ Esta acción NO se puede deshacer.\n\n¿Continuar?`,
            '🧹 Limpiar Elipse'
        );
        if (!confirmar) return;
        try {
            const key = this._getPersistenciaKey(this._temaId);
            localStorage.removeItem(key);
            delete this._cachePorTema[this._temaId];
            this._elipseData = null;
            this._temaId = null;
            this._ondasRevisadas = new Set();
            this._recomendaciones = [];
            this._siguienteOndaSugerida = null;
            this._progresoGlobal = 0;
            this._progresoOndas = {};
            this._datosCargados = false;
            if (window.modoElipse) {
                window.modoElipse._historiasElipse = [];
                window.modoElipse._elipseActiva = null;
                window.modoElipse._estadisticas = { totalOndas: 0, palabrasNuevas: 0, palabrasConsolidadas: 0 };
                window.modoElipse._persistenciaCargada = false;
                window.modoElipse._datosCargados = false;
                window.modoElipse._temaIdPersistido = null;
                await window.modoElipse._guardarEnIndexedDB();
            }
            await this._renderizarPanel();
            this._core?.mostrarToast('🧹 Elipse limpiada correctamente', 'success');
        } catch (error) {
            console.error('❌ Error limpiando elipse:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _onRetornoAlModuloElipse() {
        console.log('🔄 Retornando al Modo Elipse');
        this._esperandoRetorno = false;
        this._origenAccion = null;
        this._botonInyectado = false;

        this._restaurarBotonesEstudio();

        const btn = document.getElementById('btnVolverElipse');
        if (btn) btn.remove();

        if (!this._datosCargados && window.modoElipse) {
            await window.modoElipse.cargarDatos();
            this._datosCargados = true;
        }
        await this._obtenerEstadoElipse(this._temaId);
        await this._actualizarProgresoGlobal();
        this._actualizarRecomendaciones();
        if (this._historiaEnEstudio) {
            await this._actualizarEstadoCompletado(this._historiaEnEstudio);
            this._historiaEnEstudio = null;
        }
        await this._verificarProgresoSRS();
        await this._guardarEstadoActual();
        this._renderizarPanel(this._temaId);
        this._core?.mostrarToast('🔄 Datos actualizados (SRS sincronizado)', 'success');
    }

    async _actualizarEstadoCompletado(historiaId) {
        try {
            const historia = window.modoElipse?.getHistoriaElipse(historiaId);
            if (historia) {
                const frases = await db.obtenerFrasesPorHistoria(historiaId);
                let completadas = 0;
                for (const f of frases) {
                    const progreso = await db.obtenerProgreso(f.id);
                    if (progreso && (progreso.rcn >= 4 || progreso.estado === 'completada')) {
                        completadas++;
                    }
                }
                historia.completada = completadas >= frases.length && frases.length > 0;
                window.modoElipse._guardarEstadoElipse();
                this._actualizarRecomendaciones();
                this._progresoOndas[historiaId] = {
                    rcnPromedio: historia.rcnPromedio,
                    completada: historia.completada,
                    frasesTotales: frases.length,
                    frasesCompletadas: completadas,
                    ultimaActualizacion: Date.now()
                };
                await this._guardarEstadoActual();
            }
        } catch (e) {
            console.warn('⚠️ Error actualizando estado de completado:', e);
        }
    }

    _restaurarBotonesEstudio() {
        console.log('🔓 Restaurando botones del módulo de estudio...');

        const btnLibro = document.getElementById('btnLibroLectura');
        if (btnLibro) {
            btnLibro.style.display = '';
            console.log('📚 Botón "Libro de Lectura" restaurado');
        } else {
            const btnLibroAlt = document.querySelector('#btnLibroLectura, .btn-libro-lectura, [onclick*="LibroLectura"]');
            if (btnLibroAlt) {
                btnLibroAlt.style.display = '';
                console.log('📚 Botón "Libro de Lectura" restaurado (alternativo)');
            }
        }

        const btnVolver = document.getElementById('btnVolverElipse');
        if (btnVolver) {
            btnVolver.remove();
            console.log('🗑️ Botón "Volver al Modo Elipse" eliminado');
        }

        this._botonInyectado = false;
        this._origenAccion = null;
        console.log('🔓 Botones del estudio restaurados correctamente');
    }

    _volverAlModoElipse(mensaje = '🔄 Volviendo al Modo Elipse') {
        console.log(`🔄 ${mensaje}`);
        this._cerrarModalPalabra();
        if (this._visorAbierto) {
            this._visorAbierto = false;
            this._historiaVisor = null;
            this._frasesVisor = [];
        }
        this._volviendoDeLectura = true;
        this._esperandoRetorno = false;
        this._origenAccion = null;

        this._restaurarBotonesEstudio();

        const btn = document.getElementById('btnVolverElipse');
        if (btn) btn.remove();

        if (this._core) {
            const elipseModule = document.getElementById('elipseModule');
            if (elipseModule) {
                document.querySelectorAll('.view, .module-view').forEach(el => {
                    el.classList.remove('active');
                });
                elipseModule.classList.add('active');
                this._core.moduloActual = 'elipse';
                this._core._actualizarBreadcrumb('elipse');
            }
        }
        this._cargando = false;
        setTimeout(() => {
            this._renderizarPanel(this._temaId);
            this._core?.mostrarToast(mensaje, 'info');
        }, 300);
    }

    _inyectarBotonVolverEnEstudio() {
        if (this._botonInyectado) return;
        if (this._origenAccion !== 'elipse') {
            console.log('ℹ️ No venimos del Modo Elipse, no se inyecta botón');
            return;
        }

        console.log('🔧 Inyectando botón "Volver al Modo Elipse" en Estudio...');

        const header = document.querySelector('#studyModule .module-header');
        if (!header) {
            console.warn('⚠️ No se encontró el header del módulo de estudio, reintentando...');
            setTimeout(() => this._inyectarBotonVolverEnEstudio(), 300);
            return;
        }

        const btnLibro = document.getElementById('btnLibroLectura');
        if (btnLibro) {
            btnLibro.style.display = 'none';
            console.log('🔒 Botón "Libro de Lectura" ocultado (Modo Elipse)');
        } else {
            const btnLibroAlt = header.querySelector('#btnLibroLectura, .btn-libro-lectura, [onclick*="LibroLectura"]');
            if (btnLibroAlt) {
                btnLibroAlt.style.display = 'none';
                console.log('🔒 Botón "Libro de Lectura" ocultado (alternativo)');
            }
        }

        const titleDiv = header.querySelector('.module-title');
        if (!titleDiv) {
            console.warn('⚠️ No se encontró .module-title, usando header directamente');
            const existingBtn = document.getElementById('btnVolverElipse');
            if (existingBtn) return;

            const btn = document.createElement('button');
            btn.id = 'btnVolverElipse';
            btn.className = 'btn-primary';
            btn.style.cssText = `
                padding: 6px 16px;
                font-size: 12px;
                background: linear-gradient(135deg, #6C5CE7, #00CEC9);
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
            btn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver al Modo Elipse';
            btn.onmouseover = () => {
                btn.style.transform = 'scale(1.05)';
                btn.style.boxShadow = '0 4px 20px rgba(108,92,231,0.3)';
            };
            btn.onmouseout = () => {
                btn.style.transform = 'none';
                btn.style.boxShadow = 'none';
            };
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 Botón "Volver al Modo Elipse" pulsado (onclick directo)');
                this._volverAlModoElipse('🔄 Volviendo al Modo Elipse desde Estudio');
            };
            header.appendChild(btn);
            window._volverAlModoElipse = () => {
                this._volverAlModoElipse('🔄 Volviendo al Modo Elipse desde Estudio');
            };
            this._botonInyectado = true;
            console.log('✅ Botón "Volver al Modo Elipse" añadido al header');
            console.log('🔒 Botón "Libro de Lectura" ocultado correctamente');
            return;
        }

        if (document.getElementById('btnVolverElipse')) {
            console.log('✅ Botón "Volver al Modo Elipse" ya existe');
            this._botonInyectado = true;
            return;
        }

        const self = this;
        const btn = document.createElement('button');
        btn.id = 'btnVolverElipse';
        btn.className = 'btn-primary';
        btn.style.cssText = `
            padding: 6px 16px;
            font-size: 12px;
            background: linear-gradient(135deg, #6C5CE7, #00CEC9);
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
        btn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver al Modo Elipse';
        btn.onmouseover = () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = '0 4px 20px rgba(108,92,231,0.3)';
        };
        btn.onmouseout = () => {
            btn.style.transform = 'none';
            btn.style.boxShadow = 'none';
        };
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Botón "Volver al Modo Elipse" pulsado (onclick directo)');
            self._volverAlModoElipse('🔄 Volviendo al Modo Elipse desde Estudio');
        };

        titleDiv.appendChild(btn);
        window._volverAlModoElipse = function() {
            self._volverAlModoElipse('🔄 Volviendo al Modo Elipse desde Estudio');
        };
        this._botonInyectado = true;
        console.log('✅ Botón "Volver al Modo Elipse" añadido al módulo de estudio');
        console.log('🔒 Botón "Libro de Lectura" ocultado correctamente');
    }

    _mostrarErrorEnPantalla(mensaje) {
        const container = this._getContainer();
        if (!container) {
            console.error('❌ No hay contenedor para mostrar error');
            return;
        }
        this._container = container;
        this._container.innerHTML = `
            <div style="text-align:center;padding:60px 20px;color:var(--gray);">
                <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                <h3 style="font-size:18px;font-weight:700;color:var(--danger);">Error</h3>
                <p style="font-size:14px;color:var(--gray);">${mensaje}</p>
                <button class="btn-primary" onclick="window.UIClipse.cargar(window.UIClipse._core)" style="margin-top:12px;padding:8px 20px;"><i class="fas fa-sync"></i> Reintentar</button>
            </div>
        `;
    }

    _crearCallbackRetorno(mensaje = '🔄 Volviendo al Modo Elipse') {
        const self = this;
        const callback = function() {
            self._volverAlModoElipse(mensaje);
        };
        window._volverAlModoElipse = callback;
        window._volverAlModoElipseDesdeEstudio = callback;
        window._volverAlModoElipseDesdeEspacio = callback;
        window._volverAlModoElipseDesdeGramatica = callback;
        window._volverAlModoElipseDesdeVisor = callback;
        return callback;
    }

    async _estudiarHistoria(historiaId) {
        console.log('📖 Estudiando historia:', historiaId);
        if (!window.pipeline) {
            this._core?.mostrarToast('❌ Pipeline no disponible', 'error');
            return;
        }

        try {
            const historia = await db.get('historias', historiaId);
            if (!historia) {
                this._core?.mostrarToast('❌ Historia no encontrada', 'error');
                return;
            }

            const estaCompletada = historia.estado === 'completada' || historia._completada === true;
            const rcnActual = historia._rcnPromedio || 0;

            if (estaCompletada) {
                console.log(`✅ Historia "${historia.titulo}" ya está completada (RCN: ${rcnActual.toFixed(1)})`);

                const frases = await db.obtenerFrasesPorHistoria(historiaId);
                const totalFrases = frases.length;
                let frasesCompletadas = 0;
                for (const f of frases) {
                    const progreso = await db.obtenerProgreso(f.id);
                    if (progreso && (progreso.rcn >= 4 || progreso.estado === 'completada')) {
                        frasesCompletadas++;
                    }
                }

                const esBase = historia._esBase === true || historia._esOnda === false;
                const tipoLabel = esBase ? '🌟 Base' : '🌊 Onda';

                const opcion = await this._core?.confirm(
                    `✅ **"${historia.titulo}" ya está completada**\n\n` +
                    `📊 **Estadísticas:**\n` +
                    `• ${tipoLabel} · Nivel ${historia.nivel || 'A1'}\n` +
                    `• RCN: ${rcnActual.toFixed(1)} / 5.0\n` +
                    `• Frases: ${frasesCompletadas}/${totalFrases} completadas\n` +
                    `• ${frasesCompletadas === totalFrases ? '✅ 100% completada' : `🔄 ${Math.round((frasesCompletadas/totalFrases)*100)}% progreso`}\n\n` +
                    `¿Qué quieres hacer?\n` +
                    `• "Aceptar" → Volver a estudiar la historia (el progreso se mantendrá)\n` +
                    `• "Cancelar" → Volver al Modo Elipse`,
                    `📖 Historia Completada`
                );

                if (opcion) {
                    this._crearCallbackRetorno('🔄 Volviendo al Modo Elipse desde Estudio (repaso)');
                    this._origenAccion = 'elipse';
                    this._esperandoRetorno = true;
                    window._origenAccion = 'elipse';

                    await window.pipeline.estudiarHistoria(historiaId, 'elipse');
                    if (this._core) {
                        this._core.irAModulo('study');
                        this._core?.mostrarToast(`📖 Repasando: "${historia.titulo}"`, 'info');
                        setTimeout(() => {
                            this._inyectarBotonVolverEnEstudio();
                        }, 300);
                    }
                } else {
                    this._volverAlModoElipse('🔄 Volviendo al Modo Elipse');
                }
                return;
            }

            this._historiaEnEstudio = historiaId;
            this._crearCallbackRetorno('🔄 Volviendo al Modo Elipse desde Estudio');
            this._origenAccion = 'elipse';
            this._esperandoRetorno = true;

            window._origenAccion = 'elipse';

            await window.pipeline.estudiarHistoria(historiaId, 'elipse');
            if (this._core) {
                this._core.irAModulo('study');
                this._core?.mostrarToast(`📖 Estudiando: "${historia.titulo}"`, 'info');
                setTimeout(() => {
                    this._inyectarBotonVolverEnEstudio();
                }, 300);
            }
        } catch (error) {
            console.error('❌ Error estudiando historia:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
            window._origenAccion = null;
            this._volverAlModoElipse('🔄 Volviendo al Modo Elipse (error)');
        }
    }

    async _leerHistoria(historiaId) {
        console.log('📖 Leyendo historia en VISOR INTEGRADO:', historiaId);
        if (!historiaId) {
            this._core?.mostrarToast('❌ ID de historia no válido', 'error');
            return;
        }
        try {
            const historia = await db.get('historias', historiaId);
            if (!historia) {
                this._core?.mostrarToast('❌ Historia no encontrada', 'error');
                return;
            }
            const frases = await db.obtenerFrasesPorHistoria(historiaId);
            if (frases.length === 0) {
                this._core?.mostrarToast('❌ Esta historia no tiene frases para leer', 'warning');
                return;
            }
            this._historiaVisor = historia;
            this._frasesVisor = frases;
            this._visorAbierto = true;
            this._historiaEnEstudio = historiaId;
            this._core?.mostrarToast(`📖 Leyendo "${historia.titulo}" (${frases.length} frases)`, 'info');
            this._renderizarVisorHistoria(historia, frases);
        } catch (error) {
            console.error('❌ Error leyendo historia:', error);
            this._core?.mostrarToast('❌ Error al leer: ' + error.message, 'error');
            this._visorAbierto = false;
        }
    }

    _renderizarVisorHistoria(historia, frases) {
        const container = this._getContainer();
        if (!container) {
            console.error('❌ No hay contenedor para renderizar visor');
            return;
        }
        this._container = container;

        const idioma = historia.idioma || gestorIdiomas?.getIdiomaActivo() || 'es';
        const esJeroglifico = this._esJeroglifico(idioma);
        const esBase = historia._esOnda !== true;
        const titulo = historia.titulo || 'Historia sin título';
        let html = `
            <div style="padding:16px;max-width:900px;margin:0 auto;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;padding:8px 16px;background:linear-gradient(135deg, var(--primary)08, var(--secondary)08);border-radius:12px;border:2px solid var(--primary)20;">
                    <button class="btn-secondary" onclick="window.UIClipse._cerrarVisorYVolver()" style="padding:6px 14px;font-size:13px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;"><i class="fas fa-arrow-left"></i> Volver al Modo Elipse</button>
                    <span style="font-size:18px;">${esBase ? '🌟' : '🌊'}</span>
                    <div style="flex:1;">
                        <h2 style="font-size:20px;font-weight:800;color:var(--dark);margin:0;">${titulo}</h2>
                        <p style="font-size:12px;color:var(--gray);margin:2px 0 0;">${esBase ? 'Base' : `Onda ${historia._ondaIndice || '?'}`} · ${frases.length} frases · Nivel ${historia.nivel || 'A1'} · ${idioma}${historia._palabrasNuevas?.length > 0 ? ` · 📝 ${historia._palabrasNuevas.length} palabras nuevas` : ''}<span style="font-size:9px;color:var(--primary);margin-left:8px;">🧠 SRS activo</span><span style="font-size:9px;color:var(--success);margin-left:8px;">🔍 Elipse</span></p>
                    </div>
                    <button class="btn-secondary" onclick="window.UIClipse._estudiarHistoriaDesdeVisor()" style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-play"></i> Estudiar</button>
                    <button class="btn-danger" onclick="window.UIClipse._eliminarOnda(${historia.id})" 
                            style="padding:4px 14px;font-size:11px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;" 
                            title="Eliminar esta onda permanentemente (sincronizado con Temas y Ondas Cruzadas)"
                            onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 2px 8px rgba(255,118,117,0.3)'" 
                            onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                    <button class="btn-secondary" onclick="window.UIClipse._cerrarVisorYVolver()" style="padding:4px 14px;font-size:11px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-times"></i> Cerrar</button>
                </div>
                <div style="display:flex;flex-direction:column;gap:12px;">
        `;
        for (let i = 0; i < frases.length; i++) {
            const f = frases[i];
            const num = i + 1;
            let transcripcion = '';
            if (esJeroglifico) {
                transcripcion = f.pinyinCompleto || f.segmentacion?.pinyin || '';
            } else {
                transcripcion = f.transcripcion || '';
            }
            let palabrasHtml = '';
            if (f.palabras && f.palabras.length > 0) {
                const palabrasMostrar = f.palabras.slice(0, 8);
                palabrasHtml = `
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;padding-top:8px;border-top:1px solid var(--light);">
                        ${palabrasMostrar.map(p => {
                            const texto = p.palabra || p.hanzi || '';
                            const pinyinPalabra = p.pinyin || '';
                            const significadoPalabra = p.significado || '';
                            const id = p.id || null;
                            const color = this._getColorFamiliaGramatical(p.familia || 'sustantivo');
                            return `
                                <span onclick="window.UIClipse._abrirModalPalabra({ texto: '${texto.replace(/'/g, "\\'")}', pinyin: '${pinyinPalabra.replace(/'/g, "\\'")}', significado: '${significadoPalabra.replace(/'/g, "\\'")}', familia: '${(p.familia || 'General').replace(/'/g, "\\'")}', tipo: '${(p.tipo || 'sustantivo').replace(/'/g, "\\'")}', nivel: '${(p.nivel || historia.nivel || 'A1').replace(/'/g, "\\'")}', id: ${id || 'null'}, esJeroglifico: ${esJeroglifico} }, { original: '${f.original.replace(/'/g, "\\'")}', traduccion: '${f.traduccion.replace(/'/g, "\\'")}' })" style="display:inline-flex;flex-direction:column;align-items:center;padding:4px 12px;background:${color}12;border:1px solid ${color}30;border-radius:8px;cursor:pointer;transition:all 0.2s ease;font-size:13px;" onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 2px 12px rgba(0,0,0,0.1)';this.style.background='${color}25';" onmouseout="this.style.transform='none';this.style.boxShadow='none';this.style.background='${color}12';" title="Haz clic para ver detalles y guardar en Mi Espacio">
                                    <span style="font-weight:600;font-size:${esJeroglifico ? '18px' : '15px'};color:${color};">${texto}</span>
                                    ${esJeroglifico && pinyinPalabra ? `<span style="font-size:9px;color:var(--gray-light);">${pinyinPalabra}</span>` : ''}
                                    ${!esJeroglifico && pinyinPalabra ? `<span style="font-size:9px;color:var(--gray-light);">${pinyinPalabra}</span>` : ''}
                                    ${significadoPalabra ? `<span style="font-size:8px;color:var(--gray);opacity:0.7;">${significadoPalabra.substring(0,15)}</span>` : ''}
                                    <span style="font-size:7px;color:var(--primary);margin-top:1px;">⭐</span>
                                </span>
                            `;
                        }).join('')}
                        ${f.palabras.length > 8 ? `<span style="font-size:10px;color:var(--gray-light);display:flex;align-items:center;padding:0 8px;">+${f.palabras.length - 8} más</span>` : ''}
                    </div>
                `;
            }
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;box-shadow:var(--shadow);border-left:4px solid var(--primary);">
                    <div style="display:flex;gap:8px;align-items:start;">
                        <span style="font-size:12px;font-weight:600;color:var(--gray-light);min-width:28px;">${num}.</span>
                        <div style="flex:1;">
                            <div style="font-size:${esJeroglifico ? '22px' : '18px'};font-weight:700;color:var(--dark);line-height:1.6;">${esJeroglifico ? (f.segmentacion?.hanzi || f.original) : f.original}</div>
                            ${transcripcion ? `<div style="font-size:14px;color:${esJeroglifico ? 'var(--primary)' : 'var(--secondary)'};margin-top:2px;letter-spacing:1px;">${esJeroglifico ? '🔊' : '🎤'} ${transcripcion}</div>` : ''}
                            <div style="font-size:16px;color:var(--gray);margin-top:4px;">→ ${f.traduccion}</div>
                            ${f.reglaGramatical ? `<div style="font-size:11px;color:var(--primary);margin-top:4px;padding:2px 10px;background:var(--primary)08;border-radius:4px;display:inline-block;">📋 ${f.reglaGramatical}</div>` : ''}
                            ${palabrasHtml}
                        </div>
                    </div>
                </div>
            `;
        }
        html += `
                </div>
                <div style="display:flex;gap:10px;margin-top:20px;justify-content:center;flex-wrap:wrap;padding:12px 0;border-top:2px solid var(--light);">
                    <button class="btn-primary" onclick="window.UIClipse._estudiarHistoriaDesdeVisor()" style="padding:8px 24px;font-size:14px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:8px;cursor:pointer;"><i class="fas fa-play"></i> Estudiar esta historia</button>
                    ${!historia._completado && !historia._completada ? `
                        <button class="btn-success" onclick="window.UIClipse._marcarComoLeidaDesdeVisor()" style="padding:8px 24px;font-size:14px;background:var(--success);color:white;border:none;border-radius:8px;cursor:pointer;"><i class="fas fa-check"></i> Marcar como leída</button>
                    ` : `
                        <button class="btn-secondary" onclick="window.UIClipse._marcarComoNoLeidaDesdeVisor(${historia.id})" style="padding:8px 24px;font-size:14px;background:var(--warning);color:white;border:none;border-radius:8px;cursor:pointer;"><i class="fas fa-undo"></i> Resetear</button>
                    `}
                    <button class="btn-danger" onclick="window.UIClipse._eliminarOnda(${historia.id})" 
                            style="padding:8px 24px;font-size:14px;background:var(--danger);color:white;border:none;border-radius:8px;cursor:pointer;"
                            title="Eliminar esta onda permanentemente (sincronizado con Temas y Ondas Cruzadas)"
                            onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 16px rgba(255,118,117,0.3)'" 
                            onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-trash"></i> Eliminar Onda
                    </button>
                    <button class="btn-secondary" onclick="window.UIClipse._cerrarVisorYVolver()" style="padding:8px 24px;font-size:14px;background:var(--light);color:var(--dark);border:none;border-radius:8px;cursor:pointer;"><i class="fas fa-arrow-left"></i> Volver al Modo Elipse</button>
                </div>
                <div style="margin-top:12px;padding:8px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--light);font-size:10px;color:var(--gray-light);text-align:center;">
                    🖱️ Haz clic en cualquier palabra desglosada → Modal con información + Guardar en Mi Espacio
                    <br>🔄 <strong>TODO retorna al Modo Elipse</strong> · 🧠 SRS actualiza RCN automáticamente
                    <br>🔘 <strong>Botón "Volver al Modo Elipse" en Estudio</strong>
                    <br><span style="color:var(--success);font-weight:500;">✅ Checkbox único para completar/descompletar (sin redundancia)</span>
                    <br><span style="color:var(--primary);font-weight:400;">✅ Soporte completo para BASE y actualización de RCN</span>
                    <br><span style="color:var(--info);font-weight:400;">✅ Si está completada, muestra diálogo de repaso</span>
                    <br><span style="color:var(--secondary);font-weight:500;">📝 Descripción opcional disponible al generar ondas</span>
                    <br><span style="color:var(--danger);font-weight:600;">🗑️ Botón ELIMINAR en cada onda (sincronizado con Temas y Ondas Cruzadas)</span>
                    <br><span style="color:var(--info);font-weight:400;">🔍 Verificación automática de historias eliminadas</span>
                    <br><span style="color:var(--primary);font-weight:600;">💬 Prompt multidioma activo</span>
                    <br><span style="color:var(--success);font-weight:700;">🔍 Filtrado de ondas cruzadas</span>
                </div>
            </div>
        `;
        container.innerHTML = html;
        this._visorAbierto = true;
    }

    _cerrarVisorYVolver() {
        console.log('🔄 Cerrando visor y volviendo al Modo Elipse...');
        this._visorAbierto = false;
        this._historiaVisor = null;
        this._frasesVisor = [];
        this._volviendoDeLectura = true;
        this._botonInyectado = false;
        const btn = document.getElementById('btnVolverElipse');
        if (btn) btn.remove();
        this._crearCallbackRetorno('🔄 Volviendo al Modo Elipse');
        setTimeout(() => {
            this._renderizarPanel(this._temaId);
            this._core?.mostrarToast('🔄 De vuelta al Modo Elipse', 'info');
        }, 200);
    }

    async _estudiarHistoriaDesdeVisor() {
        const historiaId = this._historiaVisor?.id;
        if (!historiaId) {
            this._core?.mostrarToast('❌ No hay historia para estudiar', 'error');
            return;
        }
        this._visorAbierto = false;
        this._historiaVisor = null;
        this._frasesVisor = [];
        this._botonInyectado = false;
        this._crearCallbackRetorno('🔄 Volviendo al Modo Elipse desde Estudio');
        this._origenAccion = 'elipse';
        this._esperandoRetorno = true;

        window._origenAccion = 'elipse';

        await this._estudiarHistoria(historiaId);
    }

    async _marcarComoLeidaDesdeVisor() {
        const historiaId = this._historiaVisor?.id;
        if (!historiaId) {
            this._core?.mostrarToast('❌ No hay historia para marcar', 'error');
            return;
        }
        this._visorAbierto = false;
        const historia = this._historiaVisor;
        this._historiaVisor = null;
        this._frasesVisor = [];
        this._botonInyectado = false;
        await this._marcarComoLeida(historiaId);
        setTimeout(() => {
            this._renderizarPanel(this._temaId);
        }, 300);
    }

    async _marcarComoLeida(historiaId) {
        console.log('✅ Marcando historia como leída:', historiaId);
        try {
            const exito = await window.gestorProgresoHistorias.cambiarEstadoHistoria(historiaId, true, 'elipse');
            if (exito) {
                this._core?.mostrarToast('✅ Historia marcada como leída', 'success');
            } else {
                this._core?.mostrarToast('❌ Error al marcar como leída', 'error');
            }
        } catch (error) {
            console.error('❌ Error marcando como leída:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _marcarComoNoLeida(historiaId) {
        console.log('🔄 Marcando historia como no leída (resetear):', historiaId);
        try {
            const confirmar = await this._core?.confirm(
                `🔄 ¿Resetear la historia/onda?\n\nSe eliminará el progreso de todas las frases.\nEl RCN volverá a 0.\nPodrás volver a estudiarla desde cero.\n\n¿Continuar?`,
                '🔄 Resetear Progreso'
            );
            if (!confirmar) return;

            const exito = await window.gestorProgresoHistorias.cambiarEstadoHistoria(historiaId, false, 'elipse');
            if (exito) {
                this._core?.mostrarToast('🔄 Historia reseteada. Puedes volver a estudiarla.', 'success');
            } else {
                this._core?.mostrarToast('❌ Error al resetear la historia', 'error');
            }
        } catch (error) {
            console.error('❌ Error reseteando historia:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _marcarComoNoLeidaDesdeVisor(historiaId) {
        this._visorAbierto = false;
        this._historiaVisor = null;
        this._frasesVisor = [];
        this._botonInyectado = false;
        await this._marcarComoNoLeida(historiaId);
        setTimeout(() => {
            this._renderizarPanel(this._temaId);
        }, 300);
    }

    _crearModalPalabra() {
        const existing = document.getElementById('modalPalabraElipse');
        if (existing) existing.remove();
        const modal = document.createElement('div');
        modal.id = 'modalPalabraElipse';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            z-index: 100000;
            display: none;
            justify-content: center;
            align-items: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        `;
        modal.innerHTML = `
            <div id="modalPalabraElipseContent" style="background:var(--white,#ffffff);border-radius:20px;padding:0;max-width:600px;width:100%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 30px 80px rgba(0,0,0,0.3);animation:scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1);overflow:hidden;font-family:var(--font,-apple-system,BlinkMacSystemFont,sans-serif);">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:linear-gradient(135deg,var(--primary)08,var(--secondary)08);border-bottom:2px solid var(--primary)20;flex-shrink:0;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span id="modalPalabraIcono" style="font-size:28px;">📖</span>
                        <div>
                            <h3 id="modalPalabraTitulo" style="font-size:18px;font-weight:700;color:var(--dark);margin:0;">Palabra</h3>
                            <span id="modalPalabraSubtitulo" style="font-size:12px;color:var(--gray);">Cargando...</span>
                        </div>
                    </div>
                    <button onclick="window.UIClipse._cerrarModalPalabra()" style="background:none;border:none;font-size:28px;color:var(--gray);cursor:pointer;transition:all 0.3s;padding:0 8px;" onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--gray)'">&times;</button>
                </div>
                <div id="modalPalabraBody" style="padding:20px;overflow-y:auto;flex:1;">
                    <div style="text-align:center;padding:30px;color:var(--gray);">
                        <i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--primary);"></i>
                        <p style="margin-top:12px;">Cargando información...</p>
                    </div>
                </div>
                <div style="display:flex;gap:8px;padding:12px 20px;border-top:1px solid var(--light);flex-wrap:wrap;flex-shrink:0;background:var(--bg);">
                    <button onclick="window.UIClipse._cerrarModalPalabra()" style="padding:8px 20px;font-size:13px;background:var(--light);color:var(--dark);border:none;border-radius:8px;cursor:pointer;font-family:var(--font);transition:all 0.3s;flex:1;" onmouseover="this.style.background='var(--gray-light)'" onmouseout="this.style.background='var(--light)'">Cerrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this._cerrarModalPalabra();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._modalPalabraAbierto) {
                this._cerrarModalPalabra();
            }
        });
    }

    async _abrirModalPalabra(palabraData, fraseContexto = null) {
        console.log('📖 Abriendo modal para palabra:', palabraData);
        const modal = document.getElementById('modalPalabraElipse');
        const body = document.getElementById('modalPalabraBody');
        const titulo = document.getElementById('modalPalabraTitulo');
        const subtitulo = document.getElementById('modalPalabraSubtitulo');
        const icono = document.getElementById('modalPalabraIcono');
        if (!modal || !body) {
            this._crearModalPalabra();
            setTimeout(() => this._abrirModalPalabra(palabraData, fraseContexto), 100);
            return;
        }
        this._palabraSeleccionada = palabraData;
        this._modalPalabraAbierto = true;
        this._origenAccion = 'elipse';
        modal.style.display = 'flex';
        body.innerHTML = `
            <div style="text-align:center;padding:30px;color:var(--gray);">
                <i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--primary);"></i>
                <p style="margin-top:12px;">Cargando información de "${palabraData.texto || palabraData.palabra || '...'}"...</p>
            </div>
        `;
        try {
            let palabraCompleta = null;
            let palabraId = palabraData.id || null;
            if (palabraId && typeof palabraId === 'number') {
                palabraCompleta = await db.get('palabras', palabraId);
            }
            if (!palabraCompleta) {
                const idioma = this._historiaVisor?.idioma || gestorIdiomas?.getIdiomaActivo() || 'es';
                const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
                const texto = palabraData.texto || palabraData.palabra || palabraData.hanzi || '';
                palabraCompleta = todasPalabras.find(p => (p.palabra || p.hanzi || '').toLowerCase() === texto.toLowerCase());
            }
            const texto = palabraData.texto || palabraData.palabra || palabraData.hanzi || '';
            const pinyin = palabraData.pinyin || palabraCompleta?.pinyin || '';
            const significado = palabraData.significado || palabraCompleta?.significado || '';
            const familiaSemantica = palabraData.familia || palabraData.familiaSemantica || palabraCompleta?.familiaSemantica || palabraCompleta?.familia || 'General';
            const familiaGramatical = palabraData.tipo || palabraData.familiaGramatical || palabraCompleta?.tipo || palabraCompleta?.familia || 'sustantivo';
            const nivel = palabraData.nivel || palabraCompleta?.nivel || this._obtenerNivelRealUsuario();
            const esJeroglifico = palabraData.esJeroglifico || palabraCompleta?.esJeroglifico || this._esJeroglifico(this._historiaVisor?.idioma);
            const esCaracterRaiz = palabraCompleta?.esCaracterRaiz || false;
            const esPalabraDerivada = palabraCompleta?.esPalabraDerivada || false;
            const caracterRaiz = palabraCompleta?.caracterRaiz || null;
            let rcn = 0, fase = 1, repasosExitosos = 0, repasosFallidos = 0;
            if (palabraCompleta?.id) {
                const progreso = await db.obtenerProgreso(palabraCompleta.id);
                if (progreso) {
                    rcn = progreso.rcn || 0;
                    fase = progreso.fase || 1;
                    repasosExitosos = progreso.repasosExitosos || 0;
                    repasosFallidos = progreso.repasosFallidos || 0;
                }
            }
            const idioma = this._historiaVisor?.idioma || gestorIdiomas?.getIdiomaActivo() || 'es';
            const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
            const frasesRelacionadas = [];
            const textoLower = texto.toLowerCase();
            for (const f of todasFrases) {
                const original = (f.original || '').toLowerCase();
                if (original.includes(textoLower)) {
                    frasesRelacionadas.push(f);
                }
                if (f.palabras && Array.isArray(f.palabras)) {
                    for (const p of f.palabras) {
                        const pTexto = (p.palabra || p.hanzi || '').toLowerCase();
                        if (pTexto === textoLower) {
                            if (!frasesRelacionadas.some(fr => fr.id === f.id)) {
                                frasesRelacionadas.push(f);
                            }
                            break;
                        }
                    }
                }
            }
            const todasPalabrasDB = await db.obtenerPalabrasPorIdioma(idioma);
            const palabrasRelacionadas = todasPalabrasDB.filter(p => {
                const fam = p.familiaSemantica || p.familia || '';
                return fam === familiaSemantica && (p.palabra || p.hanzi || '').toLowerCase() !== textoLower && (p.palabra || p.hanzi || '');
            }).slice(0, 8);
            let esFavorita = false;
            if (palabraId && window.gestorFavoritos) {
                try {
                    esFavorita = await window.gestorFavoritos.estaEnFavoritos('palabra', palabraId);
                } catch (e) {}
            }
            const estadoRCN = rcn >= 4 ? '🟣 Dominado' : rcn >= 2 ? '🟡 En progreso' : '🔴 Nuevo';
            const estadoColor = rcn >= 4 ? 'var(--success)' : rcn >= 2 ? 'var(--warning)' : 'var(--danger)';
            const colorSemantica = this._getColorFamiliaSemantica(familiaSemantica);
            const colorGramatical = this._getColorFamiliaGramatical(familiaGramatical);

            const totalRepasos = repasosExitosos + repasosFallidos;
            const eficiencia = totalRepasos > 0 ? Math.round((repasosExitosos / totalRepasos) * 100) : 0;

            let nivelDominioSugerido = nivel;
            if (rcn >= 4) {
                const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                const idx = niveles.indexOf(nivel);
                if (idx < niveles.length - 1) {
                    nivelDominioSugerido = niveles[idx + 1];
                }
            }

            body.innerHTML = this._renderizarModalPalabraAvanzado({
                texto: texto,
                pinyin: pinyin,
                significado: significado,
                familiaSemantica: familiaSemantica,
                familiaGramatical: familiaGramatical,
                nivel: nivel,
                esJeroglifico: esJeroglifico,
                esCaracterRaiz: esCaracterRaiz,
                esPalabraDerivada: esPalabraDerivada,
                caracterRaiz: caracterRaiz,
                palabraId: palabraId,
                rcn: rcn,
                fase: fase,
                repasosExitosos: repasosExitosos,
                repasosFallidos: repasosFallidos,
                estadoRCN: estadoRCN,
                estadoColor: estadoColor,
                estadoRCNBarra: Math.round((rcn / 5) * 100),
                esFavorita: esFavorita,
                frasesRelacionadas: frasesRelacionadas,
                palabrasRelacionadas: palabrasRelacionadas,
                colorSemantica: colorSemantica,
                colorGramatical: colorGramatical,
                idioma: idioma,
                origen: 'elipse'
            });

            if (titulo) titulo.textContent = texto;
            if (subtitulo) {
                subtitulo.textContent = `${familiaSemantica} · ${familiaGramatical} · Nivel ${nivel}`;
            }
            if (icono) {
                icono.textContent = esCaracterRaiz ? '🌟' : (esJeroglifico ? '🀄' : '📖');
            }

            this._configurarBotonesModalPalabraElipse(palabraId, texto, idioma, nivel, familiaSemantica);

            this._palabraModalActual = {
                id: palabraId,
                texto: texto,
                idioma: idioma,
                nivel: nivel,
                familia: familiaSemantica
            };

            console.log('✅ Modal de palabra Elipse abierto correctamente');

        } catch (error) {
            console.error('❌ Error abriendo modal de palabra:', error);
            body.innerHTML = `
                <div style="text-align:center;padding:30px;color:var(--danger);">
                    <i class="fas fa-exclamation-triangle" style="font-size:32px;display:block;margin-bottom:12px;"></i>
                    <p style="font-weight:600;">Error al cargar la información</p>
                    <p style="font-size:13px;color:var(--gray);">${error.message}</p>
                    <button onclick="window.UIClipse._cerrarModalPalabraYVolver()" style="margin-top:12px;padding:8px 20px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;">Volver al Modo Elipse</button>
                </div>
            `;
        }
    }

    _renderizarModalPalabraAvanzado(data) {
        const {
            texto, pinyin, significado, familiaSemantica, familiaGramatical,
            nivel, esJeroglifico, esCaracterRaiz, esPalabraDerivada, caracterRaiz,
            palabraId, rcn, fase, repasosExitosos, repasosFallidos,
            estadoRCN, estadoColor, estadoRCNBarra, esFavorita,
            frasesRelacionadas, palabrasRelacionadas,
            colorSemantica, colorGramatical, idioma, origen
        } = data;

        const totalRepasos = repasosExitosos + repasosFallidos;
        const eficiencia = totalRepasos > 0 ? Math.round((repasosExitosos / totalRepasos) * 100) : 0;

        let nivelDominioSugerido = nivel;
        if (rcn >= 4) {
            const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            const idx = niveles.indexOf(nivel);
            if (idx < niveles.length - 1) {
                nivelDominioSugerido = niveles[idx + 1];
            }
        }

        return `
            <div style="display:flex;flex-direction:column;gap:14px;">
                <div style="
                    background: linear-gradient(135deg, var(--primary)06, var(--secondary)06);
                    border-radius: 12px;
                    padding: 16px 20px;
                    text-align: center;
                    border: 2px solid var(--primary)20;
                ">
                    <div style="
                        font-size: ${esJeroglifico ? '48px' : '32px'};
                        font-weight: 800;
                        color: var(--dark);
                        line-height: 1.2;
                    ">${texto}</div>
                    ${pinyin ? `
                        <div style="
                            font-size: 18px;
                            color: var(--gray-light);
                            letter-spacing: 1.5px;
                            margin-top: 4px;
                        ">🔊 ${pinyin}</div>
                    ` : ''}
                    <div style="
                        font-size: 20px;
                        font-weight: 600;
                        color: var(--primary);
                        margin-top: 4px;
                    ">${significado}</div>
                </div>

                <div style="
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    justify-content: center;
                    padding: 8px 12px;
                    background: var(--bg);
                    border-radius: 8px;
                    border: 1px solid var(--light);
                ">
                    <span style="font-size:13px;color:var(--gray);">
                        🧠 RCN: <strong style="color:${estadoColor};">${rcn.toFixed(1)}</strong>
                    </span>
                    <span style="font-size:13px;color:var(--gray);">
                        📊 Fase: <strong>${fase}</strong>
                    </span>
                    <span style="font-size:13px;color:var(--gray);">
                        ✅ Aciertos: <strong>${repasosExitosos}</strong>
                    </span>
                    <span style="font-size:13px;color:var(--gray);">
                        ❌ Fallos: <strong>${repasosFallidos}</strong>
                    </span>
                    <span style="font-size:13px;color:${estadoColor};font-weight:600;">
                        ${estadoRCN}
                    </span>
                </div>

                <div style="background:var(--bg);border-radius:8px;padding:6px 12px;">
                    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray);margin-bottom:2px;">
                        <span>📈 Progreso de RCN</span>
                        <span>${Math.round((rcn / 5) * 100)}%</span>
                    </div>
                    <div style="height:6px;background:var(--light);border-radius:3px;overflow:hidden;">
                        <div style="
                            height: 100%;
                            width: ${Math.round((rcn / 5) * 100)}%;
                            background: ${estadoColor};
                            border-radius: 3px;
                            transition: width 0.8s ease;
                        "></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--gray-light);margin-top:2px;">
                        <span>🔴 Nuevo</span>
                        <span>🟡 En progreso</span>
                        <span>🟢 Consolidado</span>
                        <span>🟣 Dominado</span>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <div style="background:var(--bg);border-radius:6px;padding:8px;text-align:center;">
                        <div style="font-size:16px;font-weight:800;color:var(--secondary);">${eficiencia}%</div>
                        <div style="font-size:9px;color:var(--gray);text-transform:uppercase;">Eficiencia</div>
                    </div>
                    <div style="background:var(--bg);border-radius:6px;padding:8px;text-align:center;">
                        <div style="font-size:16px;font-weight:800;color:var(--warning);">${nivelDominioSugerido}</div>
                        <div style="font-size:9px;color:var(--gray);text-transform:uppercase;">Nivel Sugerido</div>
                    </div>
                </div>

                <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
                    <span style="
                        background: ${colorSemantica}15;
                        color: ${colorSemantica};
                        padding: 4px 14px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                    ">📂 ${familiaSemantica}</span>
                    <span style="
                        background: ${colorGramatical}15;
                        color: ${colorGramatical};
                        padding: 4px 14px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                    ">📝 ${familiaGramatical}</span>
                    <span style="
                        background: var(--bg);
                        color: var(--gray);
                        padding: 4px 14px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                    ">🎯 ${nivel}</span>
                    ${esCaracterRaiz ? `
                        <span style="
                            background: var(--primary)15;
                            color: var(--primary);
                            padding: 4px 14px;
                            border-radius: 12px;
                            font-size: 12px;
                            font-weight: 600;
                        ">🌟 Carácter Raíz</span>
                    ` : ''}
                    ${esPalabraDerivada && caracterRaiz ? `
                        <span style="
                            background: var(--secondary)15;
                            color: var(--secondary);
                            padding: 4px 14px;
                            border-radius: 12px;
                            font-size: 12px;
                            font-weight: 600;
                        ">🔗 Derivada de "${caracterRaiz}"</span>
                    ` : ''}
                </div>

                <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
                    <button id="btnGuardarPalabraElipse" style="
                        padding: 8px 20px;
                        font-size: 13px;
                        font-weight: 600;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-family: var(--font);
                        transition: all 0.3s;
                        background: ${esFavorita ? 'var(--success)' : 'linear-gradient(135deg, #6C5CE7, #A29BFE)'};
                        color: white;
                        flex: 1;
                        min-width: 140px;
                    " onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas ${esFavorita ? 'fa-check' : 'fa-star'}"></i> 
                        ${esFavorita ? '✅ En Mi Espacio' : '⭐ Guardar en Mi Espacio'}
                    </button>
                    ${frasesRelacionadas.length > 0 ? `
                        <button id="btnEstudiarFrasesElipse" style="
                            padding: 8px 20px;
                            font-size: 13px;
                            font-weight: 600;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-family: var(--font);
                            transition: all 0.3s;
                            background: linear-gradient(135deg, #00B894, #55EFC4);
                            color: white;
                            flex: 1;
                            min-width: 140px;
                        " onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 4px 20px rgba(0,184,148,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                            <i class="fas fa-play"></i> Estudiar Frases (${frasesRelacionadas.length})
                        </button>
                    ` : ''}
                </div>

                <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
                    <button id="btnPracticarEscrituraElipse" style="
                        padding: 6px 16px;
                        font-size: 12px;
                        font-weight: 600;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-family: var(--font);
                        transition: all 0.3s;
                        background: var(--secondary);
                        color: white;
                    " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                        <i class="fas fa-pencil-alt"></i> Practicar Escritura
                    </button>
                    <button id="btnBuscarGramaticaElipse" style="
                        padding: 6px 16px;
                        font-size: 12px;
                        font-weight: 600;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-family: var(--font);
                        transition: all 0.3s;
                        background: var(--primary);
                        color: white;
                    " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                        <i class="fas fa-search"></i> Buscar en Gramática
                    </button>
                    <button onclick="window.UIClipse._cerrarModalPalabraYVolver()" style="
                        padding: 6px 16px;
                        font-size: 12px;
                        font-weight: 600;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-family: var(--font);
                        transition: all 0.3s;
                        background: var(--light);
                        color: var(--dark);
                    " onmouseover="this.style.background='var(--gray-light)'" onmouseout="this.style.background='var(--light)'">
                        <i class="fas fa-times"></i> Cerrar
                    </button>
                </div>

                ${frasesRelacionadas.length > 0 ? `
                    <div style="
                        background: var(--bg);
                        border-radius: 8px;
                        padding: 12px 14px;
                        border: 1px solid var(--light);
                    ">
                        <div style="
                            font-size: 12px;
                            font-weight: 600;
                            color: var(--gray);
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-bottom: 6px;
                        ">📖 Frases donde aparece (${frasesRelacionadas.length})</div>
                        <div style="display:flex;flex-direction:column;gap:4px;max-height:150px;overflow-y:auto;">
                            ${frasesRelacionadas.slice(0,5).map(f => {
                                const esJeroglificoF = f.esJeroglifico || esJeroglifico;
                                const hanzi = f.segmentacion?.hanzi || f.original;
                                const pinyinF = f.pinyinCompleto || f.segmentacion?.pinyin || '';
                                return `
                                    <div style="
                                        background: var(--white);
                                        border-radius: 6px;
                                        padding: 6px 10px;
                                        border: 1px solid var(--light);
                                        font-size: 12px;
                                        cursor: pointer;
                                        transition: all 0.2s;
                                    " onclick="window.UIClipse._cerrarModalPalabraYVolver();window.UIClipse._estudiarFrasesConPalabra('${texto.replace(/'/g, "\\'")}')" 
                                       onmouseover="this.style.borderColor='var(--primary)';this.style.background='var(--primary)04'" 
                                       onmouseout="this.style.borderColor='var(--light)';this.style.background='var(--white)'">
                                        <div style="font-weight:600;color:var(--dark);">${esJeroglificoF ? hanzi : f.original}</div>
                                        ${pinyinF ? `<div style="font-size:10px;color:var(--gray-light);">${pinyinF}</div>` : ''}
                                        <div style="font-size:11px;color:var(--gray);">→ ${f.traduccion}</div>
                                    </div>
                                `;
                            }).join('')}
                            ${frasesRelacionadas.length > 5 ? `
                                <div style="font-size:11px;color:var(--gray-light);text-align:center;padding:4px;">
                                    +${frasesRelacionadas.length - 5} frases más
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                ${palabrasRelacionadas.length > 0 ? `
                    <div style="
                        background: var(--bg);
                        border-radius: 8px;
                        padding: 12px 14px;
                        border: 1px solid var(--light);
                    ">
                        <div style="
                            font-size: 12px;
                            font-weight: 600;
                            color: var(--gray);
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-bottom: 6px;
                        ">🔗 Misma familia semántica (${palabrasRelacionadas.length})</div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;">
                            ${palabrasRelacionadas.map(p => {
                                const pTexto = p.palabra || p.hanzi || '';
                                const pPinyin = p.pinyin || '';
                                return `
                                    <span style="
                                        display: inline-flex;
                                        flex-direction: column;
                                        align-items: center;
                                        padding: 4px 12px;
                                        background: var(--white);
                                        border-radius: 8px;
                                        border: 1px solid var(--light);
                                        cursor: pointer;
                                        font-size: 12px;
                                        transition: all 0.2s;
                                    " onclick="window.UIClipse._cerrarModalPalabraYVolver();window.UIClipse._abrirModalPalabra({texto:'${pTexto.replace(/'/g, "\\'")}',pinyin:'${pPinyin.replace(/'/g, "\\'")}',id:${p.id || 'null'}})" 
                                       onmouseover="this.style.borderColor='var(--primary)';this.style.transform='scale(1.05)'" 
                                       onmouseout="this.style.borderColor='var(--light)';this.style.transform='none'">
                                        <span style="font-weight:600;font-size:14px;">${pTexto}</span>
                                        ${pPinyin ? `<span style="font-size:9px;color:var(--gray-light);">${pPinyin}</span>` : ''}
                                    </span>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}

                <div style="
                    border-top: 2px solid var(--primary);
                    padding-top: 12px;
                    margin-top: 4px;
                ">
                    <button onclick="window.UIClipse._cerrarModalPalabraYVolver()" style="
                        width: 100%;
                        padding: 10px 20px;
                        font-size: 14px;
                        font-weight: 700;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-family: var(--font);
                        transition: all 0.3s;
                        background: linear-gradient(135deg, #6C5CE7, #00CEC9);
                        color: white;
                    " onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-arrow-left"></i> Volver al Modo Elipse
                    </button>
                </div>
                <div style="
                    font-size: 10px;
                    color: var(--gray-light);
                    text-align: center;
                    border-top: 1px solid var(--light);
                    padding-top: 8px;
                ">
                    💡 Haz clic en cualquier palabra relacionada para explorar su detalle
                    ${esCaracterRaiz ? ' · 🌟 Carácter raíz' : ''}
                    ${palabraId ? ` · 🆔 ID: ${palabraId}` : ''}
                    <br><span style="color:var(--primary);font-weight:500;">🔄 Todo retorna al Modo Elipse</span>
                    <br><span style="color:var(--success);font-weight:500;">✅ Completado sincronizado con Temas</span>
                    <br><span style="color:var(--info);font-weight:400;">✅ Sin redundancia: solo checkbox para completar/descompletar</span>
                    <br><span style="color:var(--primary);font-weight:400;">✅ Soporte completo para BASE y actualización de RCN</span>
                    <br><span style="color:var(--secondary);font-weight:500;">📝 Descripción opcional disponible al generar ondas</span>
                    <br><span style="color:var(--danger);font-weight:600;">🗑️ Eliminar onda sincronizado con Temas y Ondas Cruzadas</span>
                    <br><span style="color:var(--info);font-weight:400;">🔍 Verificación automática de historias eliminadas</span>
                    <br><span style="color:var(--primary);font-weight:600;">💬 Prompt multidioma activo</span>
                    <br><span style="color:var(--success);font-weight:700;">🔍 Filtrado de ondas cruzadas</span>
                </div>
            </div>
        `;
    }

    _configurarBotonesModalPalabraElipse(palabraId, palabra, idioma, nivel, familia) {
        const btnGuardar = document.getElementById('btnGuardarPalabraElipse');
        if (btnGuardar) {
            const newBtn = btnGuardar.cloneNode(true);
            btnGuardar.parentNode.replaceChild(newBtn, btnGuardar);
            newBtn.onclick = async () => {
                await this._guardarPalabraEnEspacioDesdeModal(palabraId, palabra, idioma, nivel, familia);
            };
        }

        const btnEstudiar = document.getElementById('btnEstudiarFrasesElipse');
        if (btnEstudiar) {
            const newBtn = btnEstudiar.cloneNode(true);
            btnEstudiar.parentNode.replaceChild(newBtn, btnEstudiar);
            newBtn.onclick = () => {
                this._cerrarModalPalabraYVolver();
                if (window.UIStudy && window.UIStudy._estudiarFrasesConPalabra) {
                    window.UIStudy._estudiarFrasesConPalabra(palabra);
                } else {
                    this._estudiarFrasesConPalabra(palabra);
                }
            };
        }

        const btnEscritura = document.getElementById('btnPracticarEscrituraElipse');
        if (btnEscritura) {
            const newBtn = btnEscritura.cloneNode(true);
            btnEscritura.parentNode.replaceChild(newBtn, btnEscritura);
            newBtn.onclick = () => {
                this._cerrarModalPalabraYVolver();
                if (window.UIStudy && window.UIStudy._practicarEscrituraDesdeModal) {
                    window.UIStudy._practicarEscrituraDesdeModal(palabra, idioma);
                } else {
                    this._practicarEscrituraDesdeModal(palabra, idioma);
                }
            };
        }

        const btnGramatica = document.getElementById('btnBuscarGramaticaElipse');
        if (btnGramatica) {
            const newBtn = btnGramatica.cloneNode(true);
            btnGramatica.parentNode.replaceChild(newBtn, btnGramatica);
            newBtn.onclick = () => {
                this._cerrarModalPalabraYVolver();
                if (window.UIStudy && window.UIStudy._buscarPalabraEnGramatica) {
                    window.UIStudy._buscarPalabraEnGramatica(palabra);
                } else {
                    this._buscarPalabraEnGramatica(palabra);
                }
            };
        }
    }

    _cerrarModalPalabraYVolver() {
        this._cerrarModalPalabra();
        this._volverAlModoElipse('🔄 Volviendo al Modo Elipse desde el modal');
    }

    _cerrarModalPalabra() {
        const modal = document.getElementById('modalPalabraElipse');
        if (modal) {
            modal.style.display = 'none';
        }
        this._modalPalabraAbierto = false;
        this._palabraSeleccionada = null;
    }

    async _guardarPalabraEnEspacioDesdeModal(palabraId, palabra, idioma, nivel, familia) {
        try {
            if (!window.gestorFavoritos) {
                this._core?.mostrarToast('❌ Gestor de favoritos no disponible', 'error');
                return;
            }

            if (!window.gestorFavoritos._initDone) {
                await window.gestorFavoritos.init();
            }

            const nombreNivel = `📚 Nivel ${nivel}`;
            const nombreFamilia = `📂 ${familia}`;

            let idFinal = palabraId;
            if (!idFinal) {
                const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
                const encontrada = todasPalabras.find(p =>
                    (p.palabra || p.hanzi || '').toLowerCase() === palabra.toLowerCase()
                );
                if (encontrada) {
                    idFinal = encontrada.id;
                }
            }

            if (!idFinal) {
                const esJeroglifico = this._esJeroglifico(idioma);
                const nuevaPalabra = {
                    palabra: palabra,
                    hanzi: esJeroglifico ? palabra : '',
                    pinyin: '',
                    significado: palabra,
                    familia: familia || 'sin_clasificar',
                    familias: [familia || 'sin_clasificar'],
                    familiaSemantica: familia || 'sin_clasificar',
                    nivel: nivel,
                    tipo: 'sustantivo',
                    idioma: idioma,
                    frecuencia: 1,
                    neuroScore: 0.5,
                    nivelDominio: 'nuevo',
                    fechaCreacion: Date.now()
                };
                idFinal = await db.guardarPalabra(nuevaPalabra);
            }

            if (idFinal) {
                const esFavorita = await window.gestorFavoritos.estaEnFavoritos('palabra', idFinal);
                if (!esFavorita) {
                    await window.gestorFavoritos.añadirPalabra(idFinal);
                    await window.gestorFavoritos.añadirPalabraAGrupo(idFinal, nombreNivel);
                    await window.gestorFavoritos.añadirPalabraAGrupo(idFinal, nombreFamilia);
                    this._core?.mostrarToast(`✅ "${palabra}" guardada en ${nombreNivel} → ${nombreFamilia}`, 'success');
                    this._cerrarModalPalabraYVolver();
                } else {
                    this._core?.mostrarToast(`ℹ️ "${palabra}" ya está en Mi Espacio`, 'info');
                }
            }

            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this._core);
            }
            if (window.UIEspacio) {
                window.UIEspacio._renderizarMiEspacio();
            }

        } catch (error) {
            console.error('❌ Error guardando palabra:', error);
            this._core?.mostrarToast('❌ Error al guardar la palabra', 'error');
        }
    }

    async _estudiarFrasesConPalabra(texto) {
        if (!texto) {
            this._core?.mostrarToast('❌ No hay palabra para buscar', 'error');
            return;
        }
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
        const textoLower = texto.toLowerCase();
        const frasesEncontradas = todasFrases.filter(f => {
            const original = (f.original || '').toLowerCase();
            if (original.includes(textoLower)) return true;
            if (f.palabras && Array.isArray(f.palabras)) {
                for (const p of f.palabras) {
                    const pTexto = (p.palabra || p.hanzi || '').toLowerCase();
                    if (pTexto === textoLower) return true;
                }
            }
            return false;
        });
        if (frasesEncontradas.length === 0) {
            this._core?.mostrarToast(`❌ No se encontraron frases con "${texto}"`, 'warning');
            return;
        }
        this._cerrarModalPalabraYVolver();
        this._crearCallbackRetorno('🔄 Volviendo al Modo Elipse desde Estudio');
        this._origenAccion = 'elipse';
        this._esperandoRetorno = true;
        this._core?.mostrarToast(`📖 Estudiando ${frasesEncontradas.length} frases con "${texto}"`, 'info');
        if (this._visorAbierto) {
            this._visorAbierto = false;
            this._historiaVisor = null;
            this._frasesVisor = [];
        }
        if (window.pipeline) {
            const frasesConContexto = await Promise.all(frasesEncontradas.map(async (f) => {
                const progreso = await db.obtenerProgreso(f.id);
                return { ...f, progreso };
            }));
            frasesConContexto.sort((a, b) => {
                const rcnA = a.progreso?.rcn || 0;
                const rcnB = b.progreso?.rcn || 0;
                return rcnA - rcnB;
            });
            window.pipeline.frases = frasesConContexto;
            window.pipeline.indiceFrase = 0;
            await window.pipeline.cargarFrase(0);
            window.pipeline._estudiandoTema = true;
            window.pipeline._temaActual = this._temaId;
        }
        if (this._core) {
            this._core.irAModulo('study');
            setTimeout(() => {
                this._inyectarBotonVolverEnEstudio();
            }, 300);
        }
    }

    async _practicarEscrituraDesdeModal(texto, idioma) {
        this._cerrarModalPalabraYVolver();
        this._core?.mostrarToast(`✍️ Practicando escritura de "${texto}"`, 'info');
        this._crearCallbackRetorno('🔄 Volviendo al Modo Elipse desde Escritura');
        this._origenAccion = 'elipse';
        this._esperandoRetorno = true;
        const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
        const fraseContexto = todasFrases.find(f => {
            const original = (f.original || '').toLowerCase();
            return original.includes(texto.toLowerCase());
        });
        if (window.UIEspacio && window.UIEspacio._ejercicioRellenar) {
            await window.UIEspacio._ejercicioRellenar(texto, idioma);
            setTimeout(() => {
                if (window._volverAlModoElipse) {
                    window._volverAlModoElipse();
                }
            }, 500);
        } else {
            const resultado = await this._core?.prompt(
                `✍️ Practica la escritura de "${texto}"\n\n${fraseContexto ? `Contexto: "${fraseContexto.original}"` : ''}`,
                '',
                `Escribe "${texto}" correctamente...`,
                '✍️ Escritura'
            );
            if (resultado && resultado.trim() === texto) {
                this._core?.mostrarToast('✅ ¡Correcto!', 'success');
            } else if (resultado) {
                this._core?.mostrarToast(`❌ Incorrecto. La palabra es: "${texto}"`, 'error');
            }
            setTimeout(() => {
                this._volverAlModoElipse('🔄 Volviendo al Modo Elipse');
            }, 500);
        }
    }

    _buscarPalabraEnGramatica(texto) {
        this._cerrarModalPalabraYVolver();
        this._crearCallbackRetorno('🔄 Volviendo al Modo Elipse desde Gramática');
        this._origenAccion = 'elipse';
        this._esperandoRetorno = true;
        if (window.UIGrammar) {
            window.UIGrammar._busquedaGramatica = texto;
            window.UIGrammar._cargarGramatica();
            if (this._core) {
                this._core.irAModulo('grammar');
                this._core?.mostrarToast(`🔍 Buscando "${texto}" en gramática`, 'info');
            }
        } else {
            this._core?.mostrarToast('🔍 Módulo de gramática no disponible', 'warning');
            this._volverAlModoElipse('🔄 Volviendo al Modo Elipse');
        }
    }

    _onRespuestaEstudio(detalle) {
        if (!detalle || !this._temaId) return;
        this._tiempoEstudio += 1;
        if (detalle.tipo === 'correcto' || detalle.tipo === 'parcial') {
            const historiaId = detalle.historiaId || detalle.fraseId;
            if (historiaId) {
                this._ondasRevisadas.add(historiaId);
                this._actualizarRecomendaciones();
                setTimeout(() => {
                    this._verificarProgresoSRS();
                }, 500);
            }
        }
        if (this._tiempoEstudio % 5 === 0) {
            this._actualizarProgresoGlobal();
        }
    }

    _getColorFamiliaSemantica(familia) {
        const colores = {
            'Transporte': '#0984E3', 'Comida y Bebida': '#E17055',
            'Familia': '#6C5CE7', 'Casa y Hogar': '#00CEC9',
            'Ropa': '#FD79A8', 'Animales': '#00B894',
            'Naturaleza': '#55EFC4', 'Tiempo y Clima': '#74B9FF',
            'Salud': '#FF7675', 'Trabajo': '#636E72',
            'Educación': '#A29BFE', 'Deportes': '#FDCB6E',
            'Arte': '#E17055', 'Música': '#FD79A8',
            'Tecnología': '#0984E3', 'Viajes': '#00CEC9',
            'Compras': '#FDCB6E', 'Comunicación': '#74B9FF',
            'Emociones': '#FF7675', 'Rutina': '#636E72',
            'Ciudad': '#00B894', 'Cultura': '#6C5CE7',
            'Historia': '#E17055', 'Ciencia': '#0984E3',
            'General': '#636E72'
        };
        return colores[familia] || '#636E72';
    }

    _getColorFamiliaGramatical(familia) {
        const colores = {
            'sustantivo': '#6C5CE7',
            'verbo': '#00B894',
            'adjetivo': '#FDCB6E',
            'adverbio': '#74B9FF',
            'preposición': '#FF7675',
            'conjunción': '#A29BFE',
            'pronombre': '#55EFC4',
            'determinante': '#0984E3',
            'interjección': '#E17055',
            'numeral': '#00CEC9',
            'clasificador': '#636E72',
            'partícula': '#636E72',
            'expresión': '#FDCB6E',
            'conector': '#74B9FF'
        };
        return colores[familia] || '#6C5CE7';
    }

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const jeroglificos = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        const idiomaLower = idioma.toLowerCase().trim();
        return jeroglificos.some(item => idiomaLower.includes(item) || item.includes(idiomaLower));
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

    _obtenerIdiomaNativo() {
        try {
            const usuario = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
            return usuario.idiomaNativo || 'es';
        } catch (e) {
            return 'es';
        }
    }

    destroy() {
        this._guardarEstadoActual();
        this._restaurarBotonesEstudio();
        this._initDone = false;
        console.log('🛑 UI Elipse: Destruida');
    }
}

window.UIClipse = new UIEclipse();

console.log('✅ UI Elipse v6.22 - CORREGIDO: FILTRO UNIFICADO DE ONDAS CRUZADAS');
console.log('  🔥 Filtro por PROPIEDAD _esOndaCruzada verificada');
console.log('  🔥 NO requiere _esOnda: true - MUESTRA TODAS LAS HISTORIAS BASE');
console.log('  🔥 Guarda datos por IDIOMA + TEMA en claves separadas');
console.log('  🔥 Puedes cambiar de tema y volver sin perder progreso');
console.log('  🔥 ÍNDICES DINÁMICOS: Base, Onda 1, Onda 2, ...');
console.log('  ✅ Las ondas cruzadas NO aparecen en Modo Elipse');
console.log('  ✅ Las historias base SÍ aparecen correctamente');
console.log('  ✅ Todas las funcionalidades originales preservadas');