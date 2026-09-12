// ============================================================
// MODO ELIPSE v5.7.12 - CORRECCIÓN: RECUERDO DE TODAS LAS ONDAS
// - Fix: _recuperarElipseDesdeTema ahora recupera TODAS las ondas
// - Fix: El recuerdo incluye TODAS las ondas anteriores (Base + Ondas)
// - Basado en v5.7.9 - SIN BUCLES INFINITOS
// - Preserva todas las funcionalidades
// ============================================================

class ModoElipse {
    constructor() {
        this._initDone = false;
        this._core = null;
        this._elipseActiva = null;
        this._historiasElipse = [];
        this._cacheOndas = {};
        this._config = {
            maxOndas: 10,
            palabrasNuevasPorOnda: 3,
            nivelBase: 'A1',
            nivelIncremento: 0.5
        };
        this._estadisticas = {
            totalOndas: 0,
            palabrasNuevas: 0,
            palabrasConsolidadas: 0
        };
        this._generando = false;
        this._ultimaGeneracion = 0;
        this._importando = false;
        this._persistenciaKey = 'pipeline_elipse_estado_v5';
        
        this._sincronizando = false;
        this._colaSincronizacion = [];
        this._sincronizacionPendiente = false;
        this._eventosRegistrados = false;
        
        this._persistenciaCargada = false;
        this._ultimoGuardado = 0;
        this._intervaloGuardado = 3000;
        this._guardarTimeout = null;
        this._recuperando = false;
        this._temaIdPersistido = null;
        this._guardando = false;
        
        this._datosCargados = false;
        this._cargaEnProgreso = false;
        this._promesaCarga = null;
        this._intentosCarga = 0;
        this._maxIntentosCarga = 5;
        this._cargaCompletada = false;
        
        this._progresoTemasCache = {};
        this._reabriendoTema = false;
        
        this._recuerdoOndas = {
            resumenGlobal: '',
            personajesPrincipales: [],
            lugares: [],
            eventosClave: [],
            tramasAbiertas: [],
            ultimasFrases: [],
            vocabularioAcumulado: [],
            resumenPorOnda: {}
        };
        
        this._datosPorIdioma = {};
        this._idiomaActual = null;
        this._ondasCruzadasIntegradas = false;
        
        this._NOMBRES_IDIOMAS = {
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
        
        this._cargarConfiguracion();
        this._registrarEventosPersistencia();
        this._configurarListenerIdioma();
        
        console.log('🌌 ModoElipse: Constructor ejecutado (v5.7.12 - RECUERDO COMPLETO)');
    }

    // ============================================================
    // OBTENER NOMBRE DE IDIOMA
    // ============================================================

    _getNombreIdioma(idioma) {
        if (!idioma) return 'Idioma';
        const idiomaLower = idioma.toLowerCase().trim();
        return this._NOMBRES_IDIOMAS[idiomaLower] || idioma;
    }

    // ============================================================
    // CONFIGURAR LISTENER DE IDIOMA
    // ============================================================

    _configurarListenerIdioma() {
        window.removeEventListener('idiomaCambiado', this._handleIdiomaCambiado);
        
        this._handleIdiomaCambiado = (e) => {
            const nuevoIdioma = e.detail?.idioma;
            const idiomaAnterior = e.detail?.idiomaAnterior;
            
            console.log(`🌌 ModoElipse: Idioma cambiado de "${idiomaAnterior}" a "${nuevoIdioma}"`);
            
            if (idiomaAnterior && this._idiomaActual !== nuevoIdioma) {
                console.log(`💾 Guardando estado del idioma anterior: ${idiomaAnterior}`);
                this._guardarEstadoPorIdioma(idiomaAnterior);
            }
            
            this._idiomaActual = nuevoIdioma;
            
            console.log(`📂 Cargando estado del idioma: ${nuevoIdioma}`);
            this._cargarEstadoPorIdioma(nuevoIdioma);
        };
        
        window.addEventListener('idiomaCambiado', this._handleIdiomaCambiado);
        console.log('🌌 ModoElipse: Listener de idioma configurado');
    }

    // ============================================================
    // GUARDAR ESTADO POR IDIOMA + TEMA
    // ============================================================

    _guardarEstadoPorIdioma(idioma) {
        if (!idioma) return;
        
        const temaId = this._elipseActiva;
        if (!temaId) {
            console.warn('⚠️ No hay tema activo, no se guarda estado.');
            return;
        }
        
        const key = `pipeline_elipse_estado_idioma_${idioma}_tema_${temaId}`;
        try {
            const data = {
                version: '5.7.12',
                timestamp: Date.now(),
                idioma: idioma,
                temaId: temaId,
                elipseActiva: this._elipseActiva,
                estadisticas: this._estadisticas,
                historias: this._historiasElipse.map(h => ({
                    id: h.id,
                    titulo: h.titulo,
                    temaId: h.temaId,
                    nivel: h.nivel,
                    indice: h.indice,
                    fecha: h.fecha,
                    palabrasNuevas: h.palabrasNuevas || [],
                    palabrasBase: h.palabrasBase || [],
                    historiasPrevias: h.historiasPrevias || [],
                    esBase: h.esBase || false,
                    rcnPromedio: h.rcnPromedio || 0,
                    completada: h.completada || false,
                    _sincronizado: h._sincronizado || false,
                    _fechaSincronizacion: h._fechaSincronizacion || null,
                    _recuerdo: h._recuerdo || null,
                    _esOndaCruzada: h._esOndaCruzada || false
                })),
                recuerdoOndas: this._recuerdoOndas,
                config: this._config
            };
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`💾 Estado de Elipse guardado para idioma: ${idioma}, tema: ${temaId} (${this._historiasElipse.length} ondas)`);
            
            if (!this._datosPorIdioma[idioma]) {
                this._datosPorIdioma[idioma] = {};
            }
            this._datosPorIdioma[idioma][temaId] = {
                elipseActiva: this._elipseActiva,
                estadisticas: this._estadisticas,
                historias: this._historiasElipse,
                recuerdoOndas: this._recuerdoOndas,
                config: this._config,
                timestamp: Date.now()
            };
            
            this._guardarBackupGlobal(idioma);
            
        } catch (e) {
            console.warn(`⚠️ Error guardando estado para idioma ${idioma}, tema ${temaId}:`, e);
        }
    }

    // ============================================================
    // GUARDAR BACKUP GLOBAL
    // ============================================================

    _guardarBackupGlobal(idioma) {
        try {
            const data = {
                version: '5.7.12',
                timestamp: Date.now(),
                idioma: idioma,
                elipseActiva: this._elipseActiva,
                estadisticas: this._estadisticas,
                historias: this._historiasElipse,
                recuerdoOndas: this._recuerdoOndas,
                config: this._config
            };
            localStorage.setItem(this._persistenciaKey, JSON.stringify(data));
        } catch (e) {
            console.warn('⚠️ Error guardando backup global:', e);
        }
    }

    // ============================================================
    // CARGAR ESTADO POR IDIOMA + TEMA
    // ============================================================

    _cargarEstadoPorIdioma(idioma) {
        if (!idioma) return;
        
        const temaId = this._elipseActiva || localStorage.getItem('pipeline_elipse_tema_activo');
        if (!temaId) {
            console.log(`📭 No hay tema activo para cargar datos de Elipse para idioma: ${idioma}`);
            this._resetearEstado();
            return;
        }

        if (this._datosPorIdioma[idioma] && this._datosPorIdioma[idioma][temaId]) {
            console.log(`📦 Cargando datos de Elipse desde caché para idioma: ${idioma}, tema: ${temaId}`);
            const data = this._datosPorIdioma[idioma][temaId];
            this._aplicarDatosCargados(data);
            return;
        }

        const key = `pipeline_elipse_estado_idioma_${idioma}_tema_${temaId}`;
        try {
            const storedData = localStorage.getItem(key);
            if (storedData) {
                const parsed = JSON.parse(storedData);
                console.log(`📦 Cargando datos de Elipse desde localStorage para idioma: ${idioma}, tema: ${temaId}`);
                console.log(`   📊 ${parsed.historias?.length || 0} ondas`);
                
                this._aplicarDatosCargados(parsed);
                
                if (!this._datosPorIdioma[idioma]) {
                    this._datosPorIdioma[idioma] = {};
                }
                this._datosPorIdioma[idioma][temaId] = {
                    elipseActiva: parsed.elipseActiva,
                    estadisticas: parsed.estadisticas,
                    historias: parsed.historias,
                    recuerdoOndas: parsed.recuerdoOndas,
                    config: parsed.config,
                    timestamp: parsed.timestamp || Date.now()
                };
                this._persistenciaCargada = true;
                this._datosCargados = true;
                return;
            }
        } catch (e) {
            console.warn(`⚠️ Error cargando estado para idioma ${idioma}, tema ${temaId}:`, e);
        }

        console.log(`📭 No hay datos específicos para idioma: ${idioma}, tema: ${temaId}. Intentando backup global...`);
        const cargadoBackup = this._cargarBackupGlobal(idioma, temaId);
        if (cargadoBackup) {
            console.log(`✅ Datos cargados desde backup global para idioma: ${idioma}, tema: ${temaId}`);
            return;
        }

        console.log(`📭 No hay datos de Elipse para idioma: ${idioma}, tema: ${temaId}`);
        this._resetearEstado();
    }

    // ============================================================
    // CARGAR BACKUP GLOBAL
    // ============================================================

    _cargarBackupGlobal(idioma, temaId) {
        try {
            const storedData = localStorage.getItem(this._persistenciaKey);
            if (!storedData) return false;
            
            const parsed = JSON.parse(storedData);
            
            if (parsed.idioma !== idioma) {
                console.log(`⚠️ Backup global es de idioma "${parsed.idioma}", actual: "${idioma}"`);
                return false;
            }
            
            const backupTemaId = parsed.elipseActiva;
            if (backupTemaId && backupTemaId !== temaId) {
                console.log(`⚠️ Backup global es de tema "${backupTemaId}", actual: "${temaId}"`);
                return false;
            }
            
            if (parsed.historias && parsed.historias.length > 0) {
                console.log(`📦 Cargando ${parsed.historias.length} ondas desde backup global para idioma: ${idioma}, tema: ${temaId}`);
                this._aplicarDatosCargados(parsed);
                this._guardarEstadoPorIdioma(idioma);
                return true;
            }
            
            return false;
        } catch (e) {
            console.warn('⚠️ Error cargando backup global:', e);
            return false;
        }
    }

    // ============================================================
    // APLICAR DATOS CARGADOS
    // ============================================================

    _aplicarDatosCargados(data) {
        this._elipseActiva = data.elipseActiva || null;
        this._estadisticas = data.estadisticas || { totalOndas: 0, palabrasNuevas: 0, palabrasConsolidadas: 0 };
        this._historiasElipse = this._filtrarOndasElipse(data.historias || []);
        this._recuerdoOndas = data.recuerdoOndas || {
            resumenGlobal: '',
            personajesPrincipales: [],
            lugares: [],
            eventosClave: [],
            tramasAbiertas: [],
            ultimasFrases: [],
            vocabularioAcumulado: [],
            resumenPorOnda: {}
        };
        if (data.config) this._config = data.config;
        this._persistenciaCargada = true;
        this._datosCargados = true;
        this._temaIdPersistido = this._elipseActiva;
        if (this._elipseActiva) {
            localStorage.setItem('pipeline_elipse_tema_activo', this._elipseActiva);
        }
    }

    // ============================================================
    // FILTRO UNIFICADO PARA EXCLUIR ONDAS CRUZADAS
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
    // RESETEAR ESTADO
    // ============================================================

    _resetearEstado() {
        this._historiasElipse = [];
        this._elipseActiva = null;
        this._estadisticas = { totalOndas: 0, palabrasNuevas: 0, palabrasConsolidadas: 0 };
        this._recuerdoOndas = {
            resumenGlobal: '',
            personajesPrincipales: [],
            lugares: [],
            eventosClave: [],
            tramasAbiertas: [],
            ultimasFrases: [],
            vocabularioAcumulado: [],
            resumenPorOnda: {}
        };
        this._persistenciaCargada = false;
        this._datosCargados = false;
        this._temaIdPersistido = null;
        console.log('🧹 Estado de Elipse reseteado');
    }

    // ============================================================
    // GUARDAR ESTADO COMPLETO
    // ============================================================

    _guardarEstadoElipse() {
        try {
            if (this._guardando) return;
            
            const idiomaActual = this._obtenerIdiomaActual();
            const temaId = this._elipseActiva;
            
            if (idiomaActual && temaId) {
                this._guardarEstadoPorIdioma(idiomaActual);
            } else {
                console.warn('⚠️ No se puede guardar estado: falta idioma o tema');
            }
            
            if (idiomaActual) {
                this._guardarBackupGlobal(idiomaActual);
            }
            
            this._guardarRecuerdoOndas();
            
            if (this._elipseActiva) {
                localStorage.setItem('pipeline_elipse_tema_activo', this._elipseActiva);
            }
            
            this._ultimoGuardado = Date.now();
            this._guardarEnIndexedDB();

            console.log(`💾 Estado de Elipse guardado (${this._historiasElipse.length} ondas) para idioma: ${idiomaActual || 'desconocido'}, tema: ${temaId || 'desconocido'}`);

            window.dispatchEvent(new CustomEvent('elipseEstadoGuardado', {
                detail: {
                    totalOndas: this._historiasElipse.length,
                    elipseActiva: this._elipseActiva,
                    idioma: idiomaActual,
                    temaId: temaId,
                    timestamp: this._ultimoGuardado
                }
            }));

        } catch (e) {
            console.warn('⚠️ Error guardando estado Elipse:', e);
        }
    }

    // ============================================================
    // GUARDAR EN INDEXEDDB
    // ============================================================

    async _guardarEnIndexedDB() {
        if (this._guardando) return false;
        this._guardando = true;
        
        try {
            if (typeof db === 'undefined' || !db._initialized) {
                console.warn('⚠️ DB no disponible para guardar');
                this._guardando = false;
                return false;
            }

            const idiomaActual = this._obtenerIdiomaActual();
            const temaId = this._elipseActiva;
            
            if (!idiomaActual || !temaId) {
                console.warn('⚠️ No se puede guardar en IndexedDB: falta idioma o tema');
                this._guardando = false;
                return false;
            }
            
            const data = {
                version: '5.7.12',
                timestamp: Date.now(),
                idioma: idiomaActual,
                temaId: temaId,
                elipseActiva: this._elipseActiva,
                estadisticas: this._estadisticas,
                historias: this._historiasElipse.map(h => ({
                    id: h.id,
                    titulo: h.titulo,
                    temaId: h.temaId,
                    nivel: h.nivel,
                    indice: h.indice,
                    fecha: h.fecha,
                    palabrasNuevas: h.palabrasNuevas || [],
                    palabrasBase: h.palabrasBase || [],
                    historiasPrevias: h.historiasPrevias || [],
                    esBase: h.esBase || false,
                    rcnPromedio: h.rcnPromedio || 0,
                    completada: h.completada || false,
                    _sincronizado: h._sincronizado || false,
                    _fechaSincronizacion: h._fechaSincronizacion || null,
                    _recuerdo: h._recuerdo || null,
                    _esOndaCruzada: h._esOndaCruzada || false
                }))
            };

            let guardadoExitoso = false;
            let intentos = 0;
            const maxIntentos = 3;
            
            const claveIndexedDB = `elipse_estado_${idiomaActual}_tema_${temaId}`;

            while (!guardadoExitoso && intentos < maxIntentos) {
                try {
                    intentos++;
                    const configs = await db.getByIndex('configuracion', 'clave', claveIndexedDB);
                    
                    if (configs && configs.length > 0) {
                        await db.update('configuracion', {
                            ...configs[0],
                            clave: claveIndexedDB,
                            valor: JSON.stringify(data),
                            timestamp: Date.now()
                        });
                    } else {
                        await db.add('configuracion', {
                            clave: claveIndexedDB,
                            valor: JSON.stringify(data),
                            timestamp: Date.now()
                        });
                    }
                    guardadoExitoso = true;
                } catch (e) {
                    console.warn(`⚠️ Intento ${intentos} falló en IndexedDB:`, e.message);
                    if (intentos < maxIntentos) {
                        await new Promise(r => setTimeout(r, 500 * intentos));
                    }
                }
            }

            this._guardando = false;
            return guardadoExitoso;

        } catch (error) {
            console.error('❌ Error guardando en IndexedDB:', error);
            this._guardando = false;
            return false;
        }
    }

    // ============================================================
    // CARGAR DATOS
    // ============================================================

    async cargarDatos() {
        const idiomaActual = this._obtenerIdiomaActual();
        const temaId = this._elipseActiva || localStorage.getItem('pipeline_elipse_tema_activo');
        
        console.log(`🌌 ModoElipse.cargarDatos(): idioma=${idiomaActual}, tema=${temaId}`);
        
        if (temaId) {
            this._cargarEstadoPorIdioma(idiomaActual);
        }
        
        this._historiasElipse = this._filtrarOndasElipse(this._historiasElipse);
        
        if (this._datosCargados && this._historiasElipse.length > 0) {
            console.log(`📦 Datos de Elipse cargados (${this._historiasElipse.length} ondas) para idioma: ${idiomaActual}, tema: ${temaId}`);
            return this._historiasElipse;
        }

        if (this._cargaEnProgreso) {
            console.log('⏳ Carga de datos en progreso, esperando...');
            return this._promesaCarga;
        }

        this._cargaEnProgreso = true;
        this._promesaCarga = this._cargarDatosInterno();
        
        try {
            const resultado = await this._promesaCarga;
            this._datosCargados = true;
            this._cargaCompletada = true;
            this._historiasElipse = this._filtrarOndasElipse(this._historiasElipse);
            return resultado;
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            return [];
        } finally {
            this._cargaEnProgreso = false;
            this._promesaCarga = null;
        }
    }

    async _cargarDatosInterno() {
        const temaCanonico = this._elipseActiva || localStorage.getItem('pipeline_elipse_tema_activo');
        if (temaCanonico) {
            const tema = await db.obtenerTema(Number(temaCanonico));
            if (tema?.idioma === this._obtenerIdiomaActual()) {
                await this._recuperarElipseDesdeTema(temaCanonico);
                return this._historiasElipse;
            }
        }
        console.log('🌌 ModoElipse: Cargando datos de persistencia...');
        this._intentosCarga = 0;
        
        const idiomaActual = this._obtenerIdiomaActual();
        const temaId = this._elipseActiva || localStorage.getItem('pipeline_elipse_tema_activo');
        
        console.log(`🌌 ModoElipse: Cargando datos para idioma: ${idiomaActual}, tema: ${temaId || 'sin tema'}`);
        
        if (temaId) {
            this._cargarEstadoPorIdioma(idiomaActual);
        }
        
        this._historiasElipse = this._filtrarOndasElipse(this._historiasElipse);
        
        if (this._historiasElipse.length > 0) {
            console.log(`✅ ${this._historiasElipse.length} ondas cargadas para idioma: ${idiomaActual}, tema: ${temaId}`);
            await this._reconstruirRecuerdoOndas();
            return this._historiasElipse;
        }
        
        if (temaId) {
            const cargadoBackup = this._cargarBackupGlobal(idiomaActual, temaId);
            if (cargadoBackup && this._historiasElipse.length > 0) {
                this._guardarEstadoPorIdioma(idiomaActual);
                await this._reconstruirRecuerdoOndas();
                return this._historiasElipse;
            }
        }
        
        if (this._historiasElipse.length === 0 && temaId) {
            console.log('🌌 ModoElipse: Recuperando desde tema persistido...');
            await this._recuperarElipseDesdeTema(temaId);
            if (this._historiasElipse.length > 0) {
                this._guardarEstadoPorIdioma(idiomaActual);
                await this._reconstruirRecuerdoOndas();
                return this._historiasElipse;
            }
        }
        
        if (this._historiasElipse.length === 0) {
            console.log('🌌 ModoElipse: Intentando backup de emergencia...');
            await this._cargarDesdeLocalStorageBackup();
        }
        
        this._historiasElipse = this._filtrarOndasElipse(this._historiasElipse);
        
        if (this._historiasElipse.length > 0) {
            await this._reconstruirRecuerdoOndas();
            if (temaId) {
                this._guardarEstadoPorIdioma(idiomaActual);
            }
        }
        
        this._progresoTemasCache = {};
        
        window.dispatchEvent(new CustomEvent('elipseDatosCargados', {
            detail: {
                totalOndas: this._historiasElipse.length,
                elipseActiva: this._elipseActiva,
                idioma: idiomaActual,
                temaId: temaId,
                timestamp: Date.now()
            }
        }));
        
        console.log(`🌌 ModoElipse: Datos cargados. ${this._historiasElipse.length} ondas para idioma: ${idiomaActual}, tema: ${temaId}`);
        return this._historiasElipse;
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
    // RECONSTRUIR RECUERDO DE ONDAS - CORREGIDO
    // ============================================================

    async _reconstruirRecuerdoOndas() {
        if (!this._elipseActiva) return;
        const resumenPorOnda = await this._construirRecuerdoCompleto(this._elipseActiva);
        const historias = Object.values(resumenPorOnda).sort((a,b) => a.indice - b.indice);
        this._recuerdoOndas = { resumenPorOnda,
            resumenGlobal: historias.map(h => h.titulo + ': ' + h.resumen).join('\n\n'),
            personajesPrincipales: [], lugares: [], eventosClave: [], tramasAbiertas: [],
            ultimasFrases: historias.at(-1)?.ultimasFrases || [],
            vocabularioAcumulado: [...new Set(historias.flatMap(h => h.vocabulario))] };
        this._guardarRecuerdoOndas();
    }

    _cargarConfiguracion() {
        try {
            const config = localStorage.getItem('pipeline_elipse_config');
            if (config) {
                this._config = { ...this._config, ...JSON.parse(config) };
            }
        } catch (e) {}
        
        try {
            this._temaIdPersistido = localStorage.getItem('pipeline_elipse_tema_activo');
            if (this._temaIdPersistido) {
                console.log(`📌 Tema persistido encontrado: ${this._temaIdPersistido}`);
                this._elipseActiva = this._temaIdPersistido;
            }
        } catch (e) {}
        
        try {
            const recuerdo = localStorage.getItem('pipeline_elipse_recuerdo');
            if (recuerdo) {
                this._recuerdoOndas = { ...this._recuerdoOndas, ...JSON.parse(recuerdo) };
                console.log('📚 Recuerdo de ondas cargado desde localStorage');
            }
        } catch (e) {}
        
        const idiomaActual = this._obtenerIdiomaActual();
        const temaId = this._elipseActiva;
        if (temaId) {
            this._cargarEstadoPorIdioma(idiomaActual);
        }
    }

    _guardarConfiguracion() {
        try {
            localStorage.setItem('pipeline_elipse_config', JSON.stringify(this._config));
        } catch (e) {}
    }

    _guardarRecuerdoOndas() {
        try {
            localStorage.setItem('pipeline_elipse_recuerdo', JSON.stringify(this._recuerdoOndas));
        } catch (e) {
            console.warn('⚠️ Error guardando recuerdo de ondas:', e);
        }
    }

    // ============================================================
    // REGISTRAR EVENTOS DE PERSISTENCIA
    // ============================================================

    _registrarEventosPersistencia() {
        window.addEventListener('beforeunload', () => {
            if (this._historiasElipse.length > 0) {
                this._guardarEstadoElipse();
                this._guardarRecuerdoOndas();
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && this._historiasElipse.length > 0) {
                this._guardarEstadoElipse();
                this._guardarRecuerdoOndas();
            }
        });
    }

    // ============================================================
    // CARGAR DESDE LOCALSTORAGE BACKUP (legacy)
    // ============================================================

    async _cargarDesdeLocalStorageBackup() {
        try {
            const estado = localStorage.getItem(this._persistenciaKey);
            if (estado) {
                const parsed = JSON.parse(estado);
                const idiomaActual = this._obtenerIdiomaActual();
                const temaIdActual = this._elipseActiva || localStorage.getItem('pipeline_elipse_tema_activo');
                
                if (parsed.idioma === idiomaActual) {
                    if (parsed.historias && parsed.historias.length > 0) {
                        const backupTemaId = parsed.elipseActiva;
                        if (backupTemaId && temaIdActual && backupTemaId === temaIdActual) {
                            console.log('📦 Backup de localStorage coincide con el tema actual:', backupTemaId);
                            this._aplicarDatosCargados(parsed);
                            return true;
                        } else if (!backupTemaId || !temaIdActual) {
                            console.log('📦 Cargando backup de localStorage (sin tema específico)');
                            this._aplicarDatosCargados(parsed);
                            return true;
                        } else {
                            console.log(`⚠️ Backup de localStorage es de tema "${backupTemaId}", actual: "${temaIdActual}"`);
                        }
                    }
                }
            }
            return false;
        } catch (error) {
            console.warn('⚠️ Error cargando desde localStorage:', error);
            return false;
        }
    }

    // ============================================================
    // RECUPERAR ELIPSE DESDE UN TEMA - CORREGIDO: RECUPERA TODAS LAS ONDAS
    // ============================================================

    async _recuperarElipseDesdeTema(temaId) {
        if (this._recuperando) return;
        this._recuperando = true;
        try {
            const contexto = await db.obtenerContextoTema(temaId);
            if (contexto.tema.idioma !== this._obtenerIdiomaActual()) return;
            this._elipseActiva = String(contexto.tema.id);
            this._historiasElipse = contexto.historias.filter(h => !this._esOndaCruzada(h)).map((h, indice, todas) => ({
                id: h.id, temaId: String(contexto.tema.id), titulo: h.titulo, nivel: h.nivel || contexto.tema.nivel || 'A1',
                indice, fecha: h.fechaCreacion, palabrasNuevas: h.palabrasNuevas, palabrasBase: [],
                historiasPrevias: todas.slice(0, indice).map(x => x.id), esBase: indice === 0,
                completada: h.completada, rcnPromedio: h.rcnPromedio, _esOndaCruzada: false,
                _sincronizado: h.completada, _ondaIndice: indice
            }));
            this._estadisticas.totalOndas = this._historiasElipse.length;
            this._persistenciaCargada = this._datosCargados = true;
            this._guardarEstadoElipse();
            await this._guardarEnIndexedDB();
            await this._reconstruirRecuerdoOndas();
        } finally { this._recuperando = false; }
    }

    async iniciarElipse(temaId, historiaId) {
        console.log(`🌌 Iniciando Elipse para tema ${temaId} con historia ${historiaId}`);
        
        const idiomaActual = this._obtenerIdiomaActual();
        
        const tema = await db.obtenerTema(parseInt(temaId));
        if (tema && tema.idioma && tema.idioma !== idiomaActual) {
            console.log(`⚠️ El tema ${temaId} es de idioma "${tema.idioma}", actual: "${idiomaActual}"`);
            if (this._core) {
                this._core.mostrarToast(`⚠️ El tema es de idioma "${tema.idioma}", cambia a ese idioma primero`, 'warning');
            }
            return null;
        }
        
        const existente = this._historiasElipse.find(h => h.temaId == temaId);
        if (existente) {
            console.log(`📌 Ya existe una elipse para el tema ${temaId} en ${idiomaActual}`);
            this._elipseActiva = String(temaId);
            localStorage.setItem('pipeline_elipse_tema_activo', String(temaId));
            this._guardarEstadoElipse();
            await this._guardarEnIndexedDB();
            await this._recuperarElipseDesdeTema(temaId);
            return this._historiasElipse;
        }
        
        const historia = await db.get('historias', parseInt(historiaId));
        if (!historia) {
            console.error(`❌ Historia ${historiaId} no encontrada`);
            return null;
        }
        
        if (this._esOndaCruzada(historia)) {
            console.log(`⚠️ La historia ${historiaId} es una ONDA CRUZADA, no se puede iniciar la Elipse con ella.`);
            if (this._core) {
                this._core.mostrarToast(`⚠️ La historia "${historia.titulo}" es una Onda Cruzada, no se puede usar como base de Elipse.`, 'warning');
            }
            return null;
        }
        
        if (historia.idioma && historia.idioma !== idiomaActual) {
            console.log(`⚠️ La historia ${historiaId} es de idioma "${historia.idioma}", actual: "${idiomaActual}"`);
            if (this._core) {
                this._core.mostrarToast(`⚠️ La historia es de idioma "${historia.idioma}"`, 'warning');
            }
            return null;
        }
        
        if (Number(historia.temaId) !== Number(temaId)) throw new Error('Story belongs to another topic');
        await this._recuperarElipseDesdeTema(temaId);
        localStorage.setItem('pipeline_elipse_tema_activo', String(temaId));
        this._guardarEstadoPorIdioma(idiomaActual);

        window.dispatchEvent(new CustomEvent('elipseTemaSeleccionado', {
            detail: {
                temaId: String(temaId),
                historiaId: String(historiaId),
                titulo: historia.titulo,
                idioma: idiomaActual
            }
        }));
        
        this._datosCargados = true;
        this._progresoTemasCache = {};
        
        return this._historiasElipse;
    }

    // ============================================================
    // EVENTOS
    // ============================================================

    _registrarEventos() {
        if (this._eventosRegistrados) return;
        this._eventosRegistrados = true;
        
        window.addEventListener('respuestaEstudio', (e) => {
            this._onRespuestaEstudio(e.detail);
            setTimeout(() => this._guardarEstadoElipse(), 100);
        });
        
        window.addEventListener('cambioNivel', () => {
            this._guardarEstadoElipse();
        });
        
        window.addEventListener('temaCompletado', (e) => {
            if (e.detail?.temaId === this._elipseActiva) {
                console.log('🌌 Tema completado desde fuera, sincronizando Elipse...');
                this._verificarYSincronizarOndasPendientes();
            }
        });
        
        window.addEventListener('sincronizarElipse', () => {
            this._sincronizarTodasLasOndas();
        });

        window.addEventListener('elipseOndaGenerada', () => {
            this._guardarEstadoElipse();
            this._guardarRecuerdoOndas();
            this._progresoTemasCache = {};
            this._reconstruirRecuerdoOndas();
        });

        window.addEventListener('elipseOndaCompletada', (e) => {
            this._guardarEstadoElipse();
            this._guardarRecuerdoOndas();
            this._progresoTemasCache = {};
            this._reconstruirRecuerdoOndas();
            if (e.detail?.historiaId) {
                console.log(`🌌 Onda completada: ${e.detail.titulo}`);
            }
        });

        window.addEventListener('elipseSincronizada', () => {
            this._guardarEstadoElipse();
            this._guardarRecuerdoOndas();
            this._progresoTemasCache = {};
            this._reconstruirRecuerdoOndas();
        });
        
        window.addEventListener('elipseTemaSeleccionado', () => {
            this._guardarEstadoElipse();
            this._progresoTemasCache = {};
            this._reconstruirRecuerdoOndas();
        });
        
        console.log('🔗 Eventos del Modo Elipse registrados');
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init(core) {
        if (this._initDone) return this;
        this._core = core || window.uiCore;
        
        console.log('🌌 Inicializando Modo Elipse v5.7.12 (RECUERDO COMPLETO)...');
        
        this._cargarConfiguracion();
        this._registrarEventos();
        this._iniciarGuardadoAutomatico();
        
        this._initDone = true;
        console.log('🌌 Modo Elipse v5.7.12: Inicializado');
        console.log(`   📊 ${this._historiasElipse.length} historias en caché`);
        console.log(`   📌 Elipse activa: ${this._elipseActiva || 'Ninguna'}`);
        console.log(`   💾 Persistencia cargada: ${this._persistenciaCargada ? '✅ Sí' : '❌ No'}`);
        
        return this;
    }

    // ============================================================
    // RESPUESTA DE ESTUDIO
    // ============================================================

    async _onRespuestaEstudio(detalle) {
        if (!detalle || !this._elipseActiva) return;
        
        const historiaId = detalle.historiaId || detalle.fraseId;
        if (!historiaId) return;
        
        const esHistoriaElipse = this._historiasElipse.some(h => h.id == historiaId);
        if (!esHistoriaElipse) return;
        
        await this._actualizarProgresoHistoria(historiaId, detalle);
        
        this._guardarEstadoElipse();
        this._guardarRecuerdoOndas();
    }

    // ============================================================
    // ACTUALIZAR PROGRESO DE HISTORIA
    // ============================================================

    async _actualizarProgresoHistoria(historiaId, detalle) {
        try {
            const historiasElipse = this._historiasElipse.filter(h => h.id == historiaId);
            if (historiasElipse.length === 0) return;
            
            let huboCambio = false;
            
            for (const h of historiasElipse) {
                const frases = await db.obtenerFrasesPorHistoria(parseInt(h.id));
                if (frases.length === 0) {
                    h.rcnPromedio = 0;
                    h.completada = false;
                    huboCambio = true;
                    continue;
                }
                
                let totalRCN = 0;
                let count = 0;
                let completadas = 0;
                
                for (const f of frases) {
                    const progreso = await db.obtenerProgreso(f.id);
                    if (progreso) {
                        const rcn = progreso.rcn || 0;
                        totalRCN += rcn;
                        count++;
                        if (rcn >= 4 || progreso.estado === 'completada') {
                            completadas++;
                        }
                    } else {
                        count++;
                    }
                }
                
                const nuevoRCN = count > 0 ? totalRCN / count : 0;
                const nuevaCompletada = completadas >= frases.length && frases.length > 0;
                
                if (nuevoRCN !== h.rcnPromedio || nuevaCompletada !== h.completada) {
                    h.rcnPromedio = nuevoRCN;
                    h.completada = nuevaCompletada;
                    huboCambio = true;
                    
                    if (nuevaCompletada && !h._sincronizado) {
                        console.log(`✅ Historia "${h.titulo}" completada! (RCN: ${nuevoRCN.toFixed(1)})`);
                        
                        window.dispatchEvent(new CustomEvent('elipseOndaCompletada', {
                            detail: {
                                historiaId: h.id,
                                titulo: h.titulo,
                                indice: h.indice,
                                temaId: h.temaId,
                                rcnPromedio: nuevoRCN
                            }
                        }));
                        
                        await this._sincronizarHistoriaCompletada(h.id);
                        
                        this._guardarEstadoElipse();
                        this._guardarRecuerdoOndas();
                        await this._guardarEnIndexedDB();
                        await this._reconstruirRecuerdoOndas();
                    }
                }
            }
            
            if (huboCambio) {
                this._guardarEstadoElipse();
                this._guardarRecuerdoOndas();
                this._progresoTemasCache = {};
            }
        } catch (e) {
            console.warn('⚠️ Error actualizando progreso de historia:', e);
        }
    }

    // ============================================================
    // SINCRONIZAR HISTORIA COMPLETADA
    // ============================================================

    async _sincronizarHistoriaCompletada(historiaId) {
        if (this._sincronizando) {
            if (!this._colaSincronizacion.includes(historiaId)) {
                this._colaSincronizacion.push(historiaId);
                this._sincronizacionPendiente = true;
            }
            return;
        }

        this._sincronizando = true;
        
        try {
            const historia = this._historiasElipse.find(h => h.id == historiaId);
            if (!historia) {
                console.warn(`⚠️ Historia ${historiaId} no encontrada en la elipse`);
                this._sincronizando = false;
                return;
            }

            if (historia._sincronizado) {
                console.log(`ℹ️ Historia "${historia.titulo}" ya está sincronizada`);
                this._sincronizando = false;
                return;
            }

            console.log(`🔄 Sincronizando historia "${historia.titulo}" (ID: ${historiaId})...`);

            const temaId = historia.temaId;
            if (!temaId) {
                console.warn(`⚠️ Historia ${historiaId} no tiene tema asociado`);
                this._sincronizando = false;
                return;
            }

            let tema = await db.obtenerTema(parseInt(temaId));
            if (!tema) {
                console.warn(`⚠️ Tema ${temaId} no encontrado`);
                this._sincronizando = false;
                return;
            }

            console.log(`📂 Tema padre: "${tema.nombre}" (ID: ${tema.id})`);

            try {
                const historiaDB = await db.get('historias', parseInt(historiaId));
                if (historiaDB) {
                    historiaDB.estado = 'completada';
                    historiaDB._completada = true;
                    historiaDB._fechaCompletado = Date.now();
                    historiaDB._rcnPromedio = historia.rcnPromedio || 0;
                    await db.update('historias', historiaDB);
                    console.log(`✅ Historia "${historiaDB.titulo}" marcada como completada en DB`);
                } else {
                    console.warn(`⚠️ Historia ${historiaId} no encontrada en la tabla 'historias'`);
                }
            } catch (error) {
                console.warn(`⚠️ Error actualizando estado de historia ${historiaId}:`, error);
            }

            const todasLasHistoriasDelTema = await db.obtenerHistoriasPorTema(parseInt(temaId));
            let historiasCompletadasReales = 0;
            let historiasTotalesReales = 0;

            for (const h of todasLasHistoriasDelTema) {
                if (this._esOndaCruzada(h)) continue;
                historiasTotalesReales++;
                
                let estaCompletada = false;
                
                if (h.estado === 'completada' || h._completada === true) {
                    estaCompletada = true;
                } else {
                    const frases = await db.obtenerFrasesPorHistoria(h.id);
                    let frasesCompletadas = 0;
                    if (frases.length > 0) {
                        for (const f of frases) {
                            const progreso = await db.obtenerProgreso(f.id);
                            if (progreso && (progreso.rcn >= 4 || progreso.estado === 'completada')) {
                                frasesCompletadas++;
                            }
                        }
                        if (frasesCompletadas === frases.length) {
                            estaCompletada = true;
                            if (h.estado !== 'completada') {
                                h.estado = 'completada';
                                await db.update('historias', h);
                                console.log(`🔧 Historia "${h.titulo}" marcada como completada (corrección automática).`);
                            }
                        }
                    }
                }
                
                console.log(`   🔍 Historia "${h.titulo}": ${estaCompletada ? '✅ Completada' : '📖 Pendiente'}`);
                if (estaCompletada) {
                    historiasCompletadasReales++;
                }
            }

            console.log(`📊 Historias completadas REALES: ${historiasCompletadasReales}/${historiasTotalesReales}`);

            historia._sincronizado = true;
            historia._fechaSincronizacion = Date.now();
            historia.completada = true;
            this._guardarEstadoElipse();

            const temaCompleto = historiasCompletadasReales >= historiasTotalesReales && historiasTotalesReales > 0;
            
            console.log(`🎯 ¿Tema completado? ${temaCompleto} (${historiasCompletadasReales}/${historiasTotalesReales})`);

            if (temaCompleto) {
                console.log(`🎯 Tema "${tema.nombre}" completado (${historiasCompletadasReales}/${historiasTotalesReales} historias)`);
                
                if (tema.estado !== 'completado' || tema._completado !== true) {
                    tema.estado = 'completado';
                    tema._completado = true;
                    tema._fechaCompletado = Date.now();
                    await db.update('temas', tema);
                    
                    const idioma = tema.idioma || this._obtenerIdiomaActual();
                    const temaOriginalId = tema._temaOriginalId || tema.id;
                    
                    if (window.UITemas && typeof window.UITemas._marcarTemaCompletado === 'function') {
                        await window.UITemas._marcarTemaCompletado(idioma, temaOriginalId, true);
                        console.log(`✅ Tema "${tema.nombre}" marcado como completado vía UITemas`);
                    }
                    
                    window.dispatchEvent(new CustomEvent('temaCompletado', {
                        detail: { 
                            idioma: tema.idioma,
                            temaId: temaOriginalId,
                            temaDbId: tema.id,
                            completado: true,
                            tema: tema,
                            origen: 'elipse'
                        }
                    }));
                    
                    if (this._core) {
                        this._core.mostrarToast(`🎉 ¡Tema "${tema.nombre}" completado al 100%!`, 'success');
                    }
                }
            } else {
                if (tema.estado === 'completado' || tema._completado === true) {
                    console.log(`🔄 Tema "${tema.nombre}" reabierto (${historiasCompletadasReales}/${historiasTotalesReales} historias)`);
                    tema.estado = 'en_curso';
                    tema._completado = false;
                    delete tema._fechaCompletado;
                    await db.update('temas', tema);
                    
                    const idioma = tema.idioma || this._obtenerIdiomaActual();
                    const temaOriginalId = tema._temaOriginalId || tema.id;
                    
                    if (window.UITemas && typeof window.UITemas._marcarTemaCompletado === 'function') {
                        await window.UITemas._marcarTemaCompletado(idioma, temaOriginalId, false);
                        console.log(`🔄 Tema "${tema.nombre}" reabierto vía UITemas`);
                    }
                    
                    window.dispatchEvent(new CustomEvent('temaCompletado', {
                        detail: { 
                            idioma: tema.idioma,
                            temaId: temaOriginalId,
                            temaDbId: tema.id,
                            completado: false,
                            tema: tema,
                            origen: 'elipse'
                        }
                    }));
                    
                    if (this._core) {
                        this._core.mostrarToast(`🔄 Tema "${tema.nombre}" reabierto (hay historias pendientes)`, 'info');
                    }
                }
            }

            this._estadisticas.palabrasConsolidadas += frasesHistoria?.length || 0;
            this._guardarEstadoElipse();
            this._guardarRecuerdoOndas();

            window.dispatchEvent(new CustomEvent('elipseSincronizada', {
                detail: {
                    historiaId: historiaId,
                    titulo: historia.titulo,
                    temaId: temaId,
                    temaNombre: tema.nombre,
                    temaCompletado: temaCompleto,
                    historiasCompletadas: historiasCompletadasReales,
                    historiasTotales: historiasTotalesReales,
                    historiaActualizadaEnDB: true
                }
            }));

            if (this._core) {
                if (window.UIDashboard) {
                    window.UIDashboard._cargarDashboardInicial(this._core);
                }
                if (window.UITemas) {
                    setTimeout(() => window.UITemas._renderTemas(), 300);
                }
                if (window.UIEspacio) {
                    setTimeout(() => window.UIEspacio._renderizarMiEspacio(), 300);
                }
                if (window.UIGrammar) {
                    setTimeout(() => window.UIGrammar._cargarGramatica(), 300);
                }
                if (window.UIClipse) {
                    setTimeout(() => {
                        try {
                            window.UIClipse.cargar(this._core);
                        } catch (e) {}
                    }, 500);
                }
                
                if (!temaCompleto) {
                    this._core.mostrarToast(`✅ Historia "${historia.titulo}" sincronizada (${historiasCompletadasReales}/${historiasTotalesReales} historias)`, 'success');
                }
            }

            console.log(`✅ Historia "${historia.titulo}" sincronizada correctamente`);
            console.log(`   📊 Progreso del tema: ${historiasCompletadasReales}/${historiasTotalesReales} historias`);
            console.log(`   📌 Estado de historia en DB: completada`);

        } catch (error) {
            console.error('❌ Error sincronizando historia:', error);
            if (this._core) {
                this._core.mostrarToast('❌ Error al sincronizar la historia: ' + error.message, 'error');
            }
        } finally {
            this._sincronizando = false;
            
            if (this._sincronizacionPendiente && this._colaSincronizacion.length > 0) {
                const siguienteId = this._colaSincronizacion.shift();
                this._sincronizacionPendiente = this._colaSincronizacion.length > 0;
                console.log(`🔄 Procesando siguiente sincronización pendiente: ${siguienteId}`);
                await this._sincronizarHistoriaCompletada(siguienteId);
            }
        }
    }

    // ============================================================
    // VERIFICAR Y SINCRONIZAR ONDAS PENDIENTES
    // ============================================================

    async _verificarYSincronizarOndasPendientes() {
        const historiasPendientes = this._historiasElipse.filter(h => 
            h.completada && !h._sincronizado
        );
        
        if (historiasPendientes.length === 0) return;
        
        console.log(`🔍 ${historiasPendientes.length} ondas completadas pendientes de sincronizar`);
        
        for (const h of historiasPendientes) {
            await this._sincronizarHistoriaCompletada(h.id);
        }
    }

    // ============================================================
    // SINCRONIZAR TODAS LAS ONDAS
    // ============================================================

    async _sincronizarTodasLasOndas() {
        console.log('🔄 Sincronizando todas las ondas...');
        
        const todas = this._historiasElipse.filter(h => h.completada);
        if (todas.length === 0) {
            if (this._core) {
                this._core.mostrarToast('ℹ️ No hay ondas completadas para sincronizar', 'info');
            }
            return;
        }
        
        this._core?.mostrarToast(`🔄 Sincronizando ${todas.length} ondas completadas...`, 'info');
        
        let sincronizadas = 0;
        for (const h of todas) {
            if (!h._sincronizado) {
                await this._sincronizarHistoriaCompletada(h.id);
                sincronizadas++;
            }
        }
        
        this._core?.mostrarToast(`✅ ${sincronizadas} ondas sincronizadas`, 'success');
        
        if (window.UIDashboard) {
            window.UIDashboard._cargarDashboardInicial(this._core);
        }
        if (window.UITemas) {
            setTimeout(() => window.UITemas._renderTemas(), 300);
        }
    }

    // ============================================================
    // 🔥 GENERAR PLANTILLA ONDA - CON RECUERDO DE TODAS LAS ONDAS
    // ============================================================

    async generarPlantillaOnda(temaId, historiaId = null, descripcion = '') {
        if (this._generando) return null;
        this._generando = true;
        try {
            const idioma = this._obtenerIdiomaActual();
            const contexto = await db.obtenerContextoTema(temaId);
            if (contexto.tema.idioma !== idioma) throw new Error('Topic language does not match');
            const normales = contexto.historias.filter(h => !this._esOndaCruzada(h));
            const historiaBase = historiaId ? contexto.historias.find(h => h.id === Number(historiaId)) : normales[normales.length - 1];
            if (!historiaBase || !historiaBase.frases.length) throw new Error('Story not found or empty');
            const indice = normales.length;
            // El nivel pertenece al tema; crear contenido no demuestra subir de nivel.
            const nivel = contexto.tema.nivel || this._config.nivelBase || 'A1';
            const nuevas = Math.min(this._config.palabrasNuevasPorOnda || 3, 8);
            const nativo = this._obtenerIdiomaNativo() || 'es';
            const recuerdo = await this._construirRecuerdoCompleto(temaId);
            return this._construirPlantillaConRecuerdoCompleto(contexto.tema, historiaBase, historiaBase.frases,
                nivel, nuevas, indice, idioma, nativo, this._getNombreIdioma(idioma), this._getNombreIdioma(nativo),
                window.gestorIdiomas?._esJeroglifico(idioma) || false, descripcion, recuerdo);
        } finally { this._generando = false; }
    }

    async _construirRecuerdoCompleto(temaId) {
        const contexto = await db.obtenerContextoTema(temaId);
        const recuerdo = {};
        contexto.historias.forEach((h, indice) => {
            recuerdo[h.id] = { id: h.id, indice, label: indice === 0 ? 'BASE' : 'Historia ' + (indice + 1),
                titulo: h.titulo || '', resumen: h.texto, ultimasFrases: h.frases.slice(-3).map(f => f.original),
                palabrasNuevas: h.palabrasNuevas, vocabulario: h.frases.flatMap(f => f.palabras || []).map(p => typeof p === 'string' ? p : p.palabra || p.hanzi).filter(Boolean),
                nivel: h.nivel || contexto.tema.nivel, completada: h.completada, esBase: indice === 0,
                esOndaCruzada: this._esOndaCruzada(h) };
        });
        return recuerdo;
    }

    _construirPlantillaConRecuerdoCompleto(tema, historiaBase, frasesBase, nivel, numPalabrasNuevas, indice, idiomaObjetivo, idiomaPrompt, nombreIdiomaObjetivo, nombreIdiomaPrompt, esJeroglifico, descripcion, recuerdoCompleto) {
        const temaNombre = tema.nombre || `Tema ${tema.id}`;
        const tituloAnterior = historiaBase.titulo || 'Historia anterior';
        const contenidoAnterior = frasesBase.map(f => f.original).join(' ');
        
        let recuerdoTexto = `📖 **RESUMEN DE TODAS LAS ONDAS ANTERIORES:**\n\n`;
        
        const indices = Object.keys(recuerdoCompleto).sort((a, b) => recuerdoCompleto[a].indice - recuerdoCompleto[b].indice);
        
        for (const idx of indices) {
            const r = recuerdoCompleto[idx];
            if (!r) continue;
            recuerdoTexto += `**${r.label}:** "${r.titulo}"\n`;
            recuerdoTexto += `📝 ${r.resumen}\n`;
            if (r.palabrasNuevas && r.palabrasNuevas.length > 0) {
                const palabrasFiltradas = r.palabrasNuevas
                    .map(p => typeof p === 'string' ? p : (p?.palabra || p?.hanzi || p?.caracter || ''))
                    .filter(p => p && p.trim().length > 0);
                if (palabrasFiltradas.length > 0) {
                    recuerdoTexto += `📝 Palabras nuevas: ${palabrasFiltradas.join(', ')}\n`;
                }
            }
            recuerdoTexto += `📊 Nivel: ${r.nivel} · ${r.completada ? '✅ Completada' : '📖 Pendiente'}\n\n`;
        }
        
        recuerdoTexto += `📖 **HISTORIA BASE PARA ESTA ONDA:**\n"${tituloAnterior}"\n${contenidoAnterior}\n\n`;
        
        if (descripcion && descripcion.trim().length > 0) {
            recuerdoTexto += `📝 **DESCRIPCIÓN DEL USUARIO:**\n"${descripcion.trim()}"\n\n`;
            recuerdoTexto += `🔴 **DEBES incorporar estos elementos en la nueva historia.**\n\n`;
        }
        
        recuerdoTexto += `⚠️ **IMPORTANTE:** Esta es la ONDA ${indice + 1}. Continúa desde el final de la historia base seleccionada y respeta los hechos de todas las historias del tema.`;
        
        const promptCompleto = `Genera una NUEVA historia (onda ${indice + 1}) que sea una CONTINUACIÓN DIRECTA de la historia anterior.\n\n` +
            `Idioma objetivo: ${nombreIdiomaObjetivo} (${idiomaObjetivo})\n` +
            `Nivel: ${nivel}\n` +
            `Número de palabras nuevas: ${numPalabrasNuevas}\n\n` +
            recuerdoTexto +
            `\n\nLa nueva historia debe tener entre 6 y 8 frases en ${nombreIdiomaObjetivo}.\n` +
            `Debe incluir los MISMOS personajes y ambientación.\n` +
            `Debe introducir EXACTAMENTE ${numPalabrasNuevas} palabras nuevas en ${nombreIdiomaObjetivo}.\n` +
            `Las palabras nuevas deben tener su traducción al ${nombreIdiomaPrompt}.\n` +
            `Nivel de dificultad: ${nivel}.\n` +
            `Las frases deben ser NATURALES y UTILIZABLES en la vida cotidiana.\n` +
            `NO uses placeholders como [palabra] o [significado].\n` +
            `Las palabras deben ser REALES y APROPIADAS para el nivel ${nivel}.\n` +
            `Responde SOLO en formato JSON válido.\n` +
            `NO incluyas texto adicional fuera del JSON.\n` +
            `Cada frase debe incluir un array 'palabras' con TODAS las palabras desglosadas.\n` +
            `NO reuses palabras nuevas de ondas anteriores como palabras nuevas.\n` +
            `🔥 **¡IMPORTANTE!** El array "palabras" de cada frase debe contener TODAS las palabras.\n` +
            `🔥 **¡EJEMPLO!** "Yo voy a la tienda" → 5 entradas en el array "palabras".\n`;

        const plantilla = {
            "_INSTRUCCIONES_PARA_IA": {
                "version": "5.7.12",
                "idioma_prompt": idiomaPrompt,
                "idioma_objetivo": idiomaObjetivo,
                "nombre_idioma_prompt": nombreIdiomaPrompt,
                "nombre_idioma_objetivo": nombreIdiomaObjetivo,
                "accion": "Genera una nueva historia (onda) para el Modo Elipse",
                "nivel": nivel,
                "num_palabras_nuevas": numPalabrasNuevas,
                "onda_indice": indice + 1,
                "onda_maxima": this._config.maxOndas,
                "prompt": promptCompleto,
                "recuerdo_contexto": recuerdoTexto,
                "recuerdo_ondas": recuerdoCompleto,
                "instrucciones": [
                    `El prompt completo está en el campo "prompt".`,
                    `El idioma objetivo para la historia es: ${nombreIdiomaObjetivo}.`,
                    `Responde SOLO en formato JSON válido.`,
                    `NO incluyas texto adicional fuera del JSON.`,
                    `Cada frase debe tener un array "palabras" con TODAS las palabras de la frase.`,
                    `🔥 ¡IMPORTANTE! El array "palabras" de cada frase debe contener TODAS las palabras.`,
                    `🔥 Ejemplo: "Yo voy a la tienda" → 5 entradas en el array "palabras".`,
                    `📚 El recuerdo incluye TODAS las ondas anteriores (${Object.keys(recuerdoCompleto).length} ondas).`
                ],
                "formato_palabras": esJeroglifico ? {
                    "hanzi": "El carácter en el idioma objetivo",
                    "pinyin": "Pronunciación con tonos",
                    "familia": "Familia SEMÁNTICA",
                    "tipo": "Categoría GRAMATICAL",
                    "significado": `Traducción al ${idiomaPrompt}`
                } : {
                    "palabra": "La palabra en el idioma objetivo",
                    "transcripcion": `Transcripción fonética en ${idiomaPrompt}`,
                    "familia": "Familia SEMÁNTICA",
                    "tipo": "Categoría GRAMATICAL",
                    "significado": `Traducción al ${idiomaPrompt}`
                }
            },
            "meta": {
                "tema": temaNombre,
                "tema_id": tema.id,
                "idioma_objetivo": idiomaObjetivo,
                "nombre_idioma_objetivo": nombreIdiomaObjetivo,
                "idioma_prompt": idiomaPrompt,
                "nombre_idioma_prompt": nombreIdiomaPrompt,
                "nivel": nivel,
                "es_jeroglifico": esJeroglifico,
                "onda_indice": indice + 1,
                "num_palabras_nuevas": numPalabrasNuevas,
                "total_ondas_anteriores": Object.keys(recuerdoCompleto).length,
                "historia_base_id": historiaBase.id,
                "historia_base_titulo": historiaBase.titulo,
                "fecha_generacion": new Date().toISOString(),
                "version": "5.7.12",
                "generado_por": "Pipeline Neuro - Modo Elipse v5.7.12",
                "descripcion_usuario": descripcion || '',
                "_esOndaCruzada": false
            },
            "historias": [
                {
                    "titulo": `[Título de la onda ${indice + 1} - Continuación de "${tituloAnterior}"]`,
                    "frases": []
                }
            ]
        };

        for (let j = 0; j < 6; j++) {
            const frase = {
                "original": `[Frase ${j+1} en ${nombreIdiomaObjetivo} sobre la continuación de la historia]`,
                "traduccion": `[Traducción de la frase ${j+1} al ${nombreIdiomaPrompt}]`,
                "regla_gramatical": `[Regla gramatical ${j+1}]`,
                "explicacion_gramatical": `[Explicación de la regla ${j+1} en ${nombreIdiomaPrompt}]`,
                "palabras": []
            };
            
            const palabrasEjemplo = esJeroglifico ? 
                ["我", "爱", "你", "的", "家"] : 
                ["Yo", "voy", "a", "la", "tienda"];
            
            for (let p = 0; p < Math.min(5, palabrasEjemplo.length); p++) {
                if (esJeroglifico) {
                    frase.palabras.push({
                        "hanzi": palabrasEjemplo[p],
                        "pinyin": `[pinyin_de_${palabrasEjemplo[p]}]`,
                        "familia": `[familia_semantica_${p+1}]`,
                        "tipo": `[tipo_gramatical_${p+1}]`,
                        "significado": `[significado_en_${idiomaPrompt}]`
                    });
                } else {
                    frase.palabras.push({
                        "palabra": palabrasEjemplo[p],
                        "transcripcion": `[transcripcion_en_${idiomaPrompt}_de_${palabrasEjemplo[p]}]`,
                        "familia": `[familia_semantica_${p+1}]`,
                        "tipo": `[tipo_gramatical_${p+1}]`,
                        "significado": `[significado_en_${idiomaPrompt}]`
                    });
                }
            }
            
            plantilla.historias[0].frases.push(frase);
        }

        plantilla.palabras_nuevas = [];
        for (let i = 0; i < numPalabrasNuevas; i++) {
            if (esJeroglifico) {
                plantilla.palabras_nuevas.push({
                    "hanzi": `[palabra_nueva_${i+1}_en_${nombreIdiomaObjetivo}]`,
                    "pinyin": `[pinyin_de_palabra_nueva_${i+1}]`,
                    "significado": `[significado_en_${idiomaPrompt}]`,
                    "familia_semantica": `[familia_semantica]`
                });
            } else {
                plantilla.palabras_nuevas.push({
                    "palabra": `[palabra_nueva_${i+1}_en_${nombreIdiomaObjetivo}]`,
                    "transcripcion": `[transcripcion_en_${idiomaPrompt}_de_palabra_nueva_${i+1}]`,
                    "significado": `[significado_en_${idiomaPrompt}]`,
                    "familia_semantica": `[familia_semantica]`
                });
            }
        }

        if (esJeroglifico) {
            plantilla._INSTRUCCIONES_PARA_IA.instrucciones.push(
                `⚠️ IMPORTANTE: Para CADA frase, incluye 'pinyin' con tonos.`,
                `Para CADA palabra, incluye 'pinyin' con tonos.`
            );
            for (const frase of plantilla.historias[0].frases) {
                frase.pinyin = `[pinyin_con_tonos_de_la_frase]`;
                frase.segmentacion = {
                    "hanzi": "[hanzi_de_la_frase]",
                    "pinyin": "[pinyin_de_la_frase]"
                };
                for (const p of frase.palabras) {
                    if (!p.pinyin) p.pinyin = `[pinyin_de_${p.hanzi || p.palabra}]`;
                }
            }
            for (const p of plantilla.palabras_nuevas) {
                if (!p.pinyin) p.pinyin = `[pinyin_de_${p.hanzi || p.palabra}]`;
            }
        }

        plantilla._AVISO_IMPORTANTE_PALABRAS_DESGLOSADAS = `
🔥🔥🔥 ¡ATENCIÓN IA! 🔥🔥🔥

⚠️ **OBLIGATORIO:** Para CADA frase, el array "palabras" DEBE contener TODAS las palabras de la frase.

❌ NO uses placeholders como "[palabra_1]" o "[familia_semantica]".
✅ Usa PALABRAS REALES del idioma ${nombreIdiomaObjetivo}.

📝 Ejemplo CORRECTO (5 palabras → 5 entradas):
"palabras": [
    { "palabra": "Yo", "transcripcion": "io", "familia": "Pronombres", "tipo": "pronombre", "significado": "yo" },
    { "palabra": "voy", "transcripcion": "boi", "familia": "Movimiento", "tipo": "verbo", "significado": "ir" },
    { "palabra": "a", "transcripcion": "a", "familia": "Preposiciones", "tipo": "preposición", "significado": "a" },
    { "palabra": "la", "transcripcion": "la", "familia": "Artículos", "tipo": "artículo", "significado": "la" },
    { "palabra": "tienda", "transcripcion": "tienda", "familia": "Comercio", "tipo": "sustantivo", "significado": "tienda" }
]

🔴 **¡NUNCA OMITAS PALABRAS!** Incluye TODAS: artículos, preposiciones, conjunciones, verbos, sustantivos, adjetivos, etc.
🔴 **¡CADA PALABRA DE LA FRASE DEBE ESTAR EN EL ARRAY!**
🔴 **¡EL NÚMERO DE ENTRADAS DEBE COINCIDIR CON EL NÚMERO DE PALABRAS DE LA FRASE!**

🔥 Cuantas más palabras desglosadas proporciones, más útil será el contenido para el estudiante.
`;

        return plantilla;
    }

    // ============================================================
    // IMPORTAR ONDA
    // ============================================================

    async importarOnda(temaId, jsonCompletado) {
        if (this._importando) {
            console.log('⏳ Ya hay una importación en curso');
            return null;
        }

        this._importando = true;
        
        try {
            let data;
            if (typeof jsonCompletado === 'string') {
                data = JSON.parse(jsonCompletado);
            } else {
                data = jsonCompletado;
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
                (primeraFrase.original.includes('[') || 
                 primeraFrase.original.includes('Frase') ||
                 primeraFrase.original.includes('frase') ||
                 primeraFrase.original.length < 3)) {
                throw new Error('El JSON parece ser una plantilla vacía. Completa la plantilla con la IA antes de importar.');
            }

            const temaIdNumerico = parseInt(temaId);
            if (isNaN(temaIdNumerico)) {
                throw new Error(`ID de tema inválido: "${temaId}"`);
            }

            const tema = await db.obtenerTema(temaIdNumerico);
            if (!tema) {
                throw new Error(`Tema no encontrado con ID: ${temaIdNumerico}`);
            }

            const idioma = tema.idioma || this._obtenerIdiomaActual() || 'es';
            const idiomaActual = this._obtenerIdiomaActual();
            
            if (tema.idioma && tema.idioma !== idiomaActual) {
                throw new Error(`El tema es de idioma "${tema.idioma}", pero el idioma actual es "${idiomaActual}"`);
            }
            
            const nivel = data.meta?.nivel || tema.nivel || 'A1';
            const esJeroglifico = data.meta?.es_jeroglifico || window.gestorIdiomas?._esJeroglifico(idioma) || false;

            const palabrasNuevas = data.palabras_nuevas || [];

            const contextoTema = typeof db.obtenerContextoTema === 'function'
                ? await db.obtenerContextoTema(temaIdNumerico)
                : null;
            const historiasElipse = (contextoTema?.historias || this._historiasElipse)
                .filter(h => h.temaId == temaIdNumerico && h._esOndaCruzada !== true);
            const ultimaHistoria = historiasElipse.sort((a, b) => (b.indice || 0) - (a.indice || 0))[0];
            const historiaBaseId = ultimaHistoria ? ultimaHistoria.id : null;

            const esOndaCruzada = data._esOndaCruzada === true || data.meta?._esOndaCruzada === true;

            const proximoIndice = historiasElipse.length;

            const historiaObj = {
                titulo: historiaData.titulo || `Onda ${proximoIndice + 1}`,
                temaId: temaIdNumerico,
                idioma: idioma,
                nivel: nivel,
                fechaCreacion: new Date().toISOString(),
                estado: 'en_curso',
                frases: historiaData.frases.length,
                _esOnda: !esOndaCruzada,
                _esOndaCruzada: esOndaCruzada,
                _ondaIndice: proximoIndice + 1,
                _historiaBaseId: historiaBaseId,
                _palabrasNuevas: palabrasNuevas,
                _importadoDesdeJSON: true,
                _sincronizarAutomaticamente: true
            };
            
            const historiaId = await db.guardarHistoria(historiaObj);
            
            if (!historiaId) {
                throw new Error('Error guardando la historia');
            }

            let totalFrases = 0;
            
            if (window.gestorFavoritos && !window.gestorFavoritos._initDone) {
                await window.gestorFavoritos.init();
            }
            
            for (const fraseData of historiaData.frases) {
                if (!fraseData.original || !fraseData.traduccion) continue;
                
                const palabrasFrase = [];
                const palabrasData = Array.isArray(fraseData.palabras) ? fraseData.palabras : [];
                
                for (const pData of palabrasData) {
                    const palabraText = pData.palabra || pData.hanzi || '';
                    if (!palabraText) continue;
                    
                    const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                    let palabraExistente = palabrasExistentes.find(p => 
                        (p.palabra || p.hanzi || '').toLowerCase() === palabraText.toLowerCase()
                    );
                    
                    let palabraId;
                    if (palabraExistente) {
                        palabraId = palabraExistente.id;
                        await db.guardarPalabra({
                            ...palabraExistente,
                            frecuencia: (palabraExistente.frecuencia || 0) + 1,
                            _esPalabraOnda: !esOndaCruzada,
                            _ondaIndice: proximoIndice + 1
                        });
                    } else {
                        const nuevaPalabra = {
                            palabra: palabraText,
                            hanzi: esJeroglifico ? palabraText : '',
                            pinyin: pData.pinyin || '',
                            transcripcion: pData.transcripcion || '',
                            significado: pData.significado || palabraText,
                            familia: pData.familia || 'sustantivo',
                            familias: [pData.familia || 'sustantivo'],
                            familiaSemantica: pData.familia_semantica || 'General',
                            nivel: nivel,
                            tipo: pData.tipo || 'sustantivo',
                            idioma: idioma,
                            frecuencia: 1,
                            neuroScore: 0.5,
                            nivelDominio: 'nuevo',
                            fechaCreacion: Date.now(),
                            _esPalabraOnda: !esOndaCruzada,
                            _ondaIndice: proximoIndice + 1
                        };
                        palabraId = await db.guardarPalabra(nuevaPalabra);
                    }
                    
                    if (palabraId) {
                        if (window.gestorFavoritos) {
                            try {
                                const esFavorita = await window.gestorFavoritos.estaEnFavoritos('palabra', palabraId);
                                if (!esFavorita) {
                                    await window.gestorFavoritos.añadirPalabra(palabraId);
                                    await window.gestorFavoritos.añadirPalabraAGrupo(palabraId, `📚 Nivel ${nivel}`);
                                    await window.gestorFavoritos.añadirPalabraAGrupo(palabraId, `🧠 ${pData.familia_semantica || 'General'}`);
                                    await window.gestorFavoritos.añadirPalabraAGrupo(palabraId, `🌌 Elipse: ${historiaData.titulo || 'Onda'}`);
                                }
                            } catch (e) {
                                console.warn(`⚠️ Error guardando palabra "${palabraText}" en favoritos:`, e);
                            }
                        }
                        
                        palabrasFrase.push({
                            id: palabraId,
                            palabra: palabraText,
                            hanzi: esJeroglifico ? palabraText : '',
                            pinyin: pData.pinyin || '',
                            transcripcion: pData.transcripcion || '',
                            significado: pData.significado || palabraText,
                            familia: pData.familia || 'sustantivo',
                            tipo: pData.tipo || 'sustantivo',
                            familiaSemantica: pData.familia_semantica || 'General'
                        });
                    }
                }
                
                const fraseObj = {
                    original: fraseData.original,
                    traduccion: fraseData.traduccion,
                    historiaId: historiaId,
                    idioma: idioma,
                    nivel: nivel,
                    esJeroglifico: esJeroglifico,
                    pinyinCompleto: esJeroglifico ? (fraseData.pinyin || '') : '',
                    transcripcion: !esJeroglifico ? (fraseData.transcripcion || '') : '',
                    segmentacion: esJeroglifico && fraseData.segmentacion ? {
                        hanzi: fraseData.segmentacion.hanzi || fraseData.original,
                        pinyin: fraseData.segmentacion.pinyin || fraseData.pinyin || ''
                    } : null,
                    palabras: palabrasFrase,
                    rg: 0,
                    rcn: 0,
                    activa: true,
                    reglaGramatical: fraseData.regla_gramatical || null,
                    explicacionGramatical: fraseData.explicacion_gramatical || null,
                    tipoRegla: fraseData.tipo_regla || null,
                    _esOnda: !esOndaCruzada,
                    _esOndaCruzada: esOndaCruzada,
                    _ondaIndice: proximoIndice + 1
                };
                
                await db.guardarFrase(fraseObj);
                totalFrases++;
            }

            const temaActual = await db.obtenerTema(temaIdNumerico);
            if (temaActual) {
                temaActual.historiasIds = [...(temaActual.historiasIds || []), historiaId];
                temaActual.frases = (temaActual.frases || 0) + totalFrases;
                temaActual._elipseActiva = !esOndaCruzada;
                temaActual._ultimaOnda = proximoIndice + 1;
                await db.update('temas', temaActual);
            }

            const ondaNueva = {
                id: historiaId,
                titulo: historiaData.titulo || `Onda ${proximoIndice + 1}`,
                temaId: String(temaIdNumerico),
                nivel: nivel,
                indice: proximoIndice,
                fecha: Date.now(),
                palabrasNuevas: palabrasNuevas.map(p => p.palabra || ''),
                palabrasBase: [],
                historiasPrevias: historiasElipse.map(h => h.id),
                esBase: false,
                rcnPromedio: 0,
                completada: false,
                _sincronizado: false,
                _fechaSincronizacion: null,
                _esOndaCruzada: esOndaCruzada,
                _ondaIndice: proximoIndice + 1
            };
            
            if (!esOndaCruzada) {
                this._historiasElipse.push(ondaNueva);
                this._estadisticas.totalOndas = this._historiasElipse.length;
                this._estadisticas.palabrasNuevas += palabrasNuevas.length;
                console.log(`🌌 Onda ${proximoIndice + 1} añadida a la Elipse: "${ondaNueva.titulo}"`);
            } else {
                console.log(`🌊 Onda CRUZADA importada, NO se añade a la Elipse`);
            }
            
            localStorage.setItem('pipeline_elipse_tema_activo', String(temaIdNumerico));
            this._elipseActiva = String(temaIdNumerico);
            
            this._guardarEstadoElipse();
            await this._guardarEnIndexedDB();
            await this._reconstruirRecuerdoOndas();
            
            const idiomaActual2 = this._obtenerIdiomaActual();
            this._guardarEstadoPorIdioma(idiomaActual2);
            
            this._progresoTemasCache = {};

            window.dispatchEvent(new CustomEvent('elipseNuevaOndaGenerada', {
                detail: {
                    temaId: String(temaIdNumerico),
                    historiaId: historiaId,
                    titulo: historiaData.titulo || `Onda ${proximoIndice + 1}`,
                    indice: proximoIndice,
                    palabrasNuevas: palabrasNuevas.map(p => p.palabra || ''),
                    totalPalabrasDesglosadas: totalFrases,
                    idioma: idioma,
                    timestamp: Date.now(),
                    esOndaCruzada: esOndaCruzada
                }
            }));

            window.dispatchEvent(new CustomEvent('elipseOndaGenerada', {
                detail: {
                    temaId: String(temaIdNumerico),
                    historiaId: historiaId,
                    titulo: historiaData.titulo,
                    indice: proximoIndice,
                    palabrasNuevas: palabrasNuevas.map(p => p.palabra || ''),
                    totalPalabrasDesglosadas: totalFrases,
                    idioma: idioma,
                    esOndaCruzada: esOndaCruzada
                }
            }));

            if (this._core) {
                if (!esOndaCruzada) {
                    this._core.mostrarToast(`🌌 Onda ${proximoIndice + 1} importada: "${historiaData.titulo}"`, 'success');
                } else {
                    this._core.mostrarToast(`🌊 Onda CRUZADA importada: "${historiaData.titulo}" (no se añade a Elipse)`, 'info');
                }
                this._core.mostrarToast(`📝 ${totalFrases} frases con palabras desglosadas`, 'info');
            }

            this._datosCargados = true;
            this._importando = false;
            return historiaId;

        } catch (error) {
            console.error('❌ Error importando onda:', error);
            this._importando = false;
            if (this._core) {
                this._core.mostrarToast('❌ Error importando onda: ' + error.message, 'error');
            }
            throw error;
        }
    }

    // ============================================================
    // MÉTODOS AUXILIARES
    // ============================================================

    _calcularNivelOnda(indice) {
        const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const nivelBaseIdx = niveles.indexOf(this._config.nivelBase);
        const incremento = Math.floor(indice / 2);
        const idx = Math.min(nivelBaseIdx + incremento, niveles.length - 1);
        return niveles[idx];
    }

    _obtenerIdiomaNativo() {
        try {
            const usuario = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
            return usuario.idiomaNativo || 'es';
        } catch (e) {
            return 'es';
        }
    }

    // ============================================================
    // MÉTODOS PÚBLICOS
    // ============================================================

    getEstadoElipse(temaId) {
        const historias = this.getHistoriasElipse(temaId);
        if (historias.length === 0) return null;
        
        const ultima = historias.sort((a, b) => (b.indice || 0) - (a.indice || 0))[0];
        const completadas = historias.filter(h => h.completada).length;
        const sincronizadas = historias.filter(h => h._sincronizado).length;
        
        return {
            temaId: temaId,
            totalOndas: historias.length,
            ondasCompletadas: completadas,
            ondasSincronizadas: sincronizadas,
            ultimaOnda: ultima,
            progreso: historias.length > 0 ? Math.round((completadas / historias.length) * 100) : 0,
            maxOndas: this._config.maxOndas,
            palabrasNuevas: this._estadisticas.palabrasNuevas,
            palabrasConsolidadas: this._estadisticas.palabrasConsolidadas
        };
    }

    getHistoriasElipse(temaId) {
        const historias = this._historiasElipse.filter(h => h.temaId == temaId);
        return this._filtrarOndasElipse(historias);
    }

    getHistoriaElipse(historiaId) {
        const historia = this._historiasElipse.find(h => h.id == historiaId);
        if (historia && this._esOndaCruzada(historia)) return null;
        return historia;
    }

    getConfiguracion() {
        return { ...this._config };
    }

    async actualizarConfiguracion(nuevaConfig) {
        this._config = { ...this._config, ...nuevaConfig };
        this._guardarConfiguracion();
        console.log('📌 Configuración del Modo Elipse actualizada:', this._config);
        return this._config;
    }

    getEstado() {
        const idiomaActual = this._obtenerIdiomaActual();
        const temaId = this._elipseActiva;
        const historias = this.getHistoriasElipse(temaId);
        return {
            initDone: this._initDone,
            elipseActiva: this._elipseActiva,
            totalOndas: historias.length,
            ondasCompletadas: historias.filter(h => h.completada).length,
            ondasSincronizadas: historias.filter(h => h._sincronizado).length,
            configuracion: this._config,
            estadisticas: this._estadisticas,
            generando: this._generando,
            importando: this._importando,
            sincronizando: this._sincronizando,
            sincronizacionPendiente: this._sincronizacionPendiente,
            colaSincronizacion: this._colaSincronizacion.length,
            persistenciaCargada: this._persistenciaCargada,
            ultimoGuardado: this._ultimoGuardado,
            temaPersistido: this._temaIdPersistido,
            datosCargados: this._datosCargados,
            progresoTemasCache: Object.keys(this._progresoTemasCache).length,
            idiomaActual: idiomaActual,
            temaActual: temaId,
            recuerdoOndas: {
                totalOndasRecordadas: Object.keys(this._recuerdoOndas.resumenPorOnda).length,
                personajes: this._recuerdoOndas.personajesPrincipales?.length || 0,
                vocabularioAcumulado: this._recuerdoOndas.vocabularioAcumulado?.length || 0
            }
        };
    }

    guardarEstadoManualmente() {
        this._guardarEstadoElipse();
        this._guardarRecuerdoOndas();
        const idiomaActual = this._obtenerIdiomaActual();
        this._guardarEstadoPorIdioma(idiomaActual);
        if (this._core) {
            this._core.mostrarToast('💾 Estado del Modo Elipse guardado manualmente', 'success');
        }
        console.log('💾 Estado del Modo Elipse guardado manualmente');
        return true;
    }

    async limpiarElipse() {
        console.log('🧹 Limpiando elipse actual...');
        this._historiasElipse = [];
        this._elipseActiva = null;
        this._estadisticas = { totalOndas: 0, palabrasNuevas: 0, palabrasConsolidadas: 0 };
        this._datosCargados = false;
        this._progresoTemasCache = {};
        this._recuerdoOndas = {
            resumenGlobal: '',
            personajesPrincipales: [],
            lugares: [],
            eventosClave: [],
            tramasAbiertas: [],
            ultimasFrases: [],
            vocabularioAcumulado: [],
            resumenPorOnda: {}
        };
        
        const idiomaActual = this._obtenerIdiomaActual();
        const temaId = this._elipseActiva;
        
        if (idiomaActual && temaId) {
            const key = `pipeline_elipse_estado_idioma_${idiomaActual}_tema_${temaId}`;
            localStorage.removeItem(key);
            if (this._datosPorIdioma[idiomaActual]) {
                delete this._datosPorIdioma[idiomaActual][temaId];
            }
        }
        
        this._guardarEstadoElipse();
        
        console.log('🧹 Elipse limpiada completamente');
        return true;
    }

    async buscarEnElipse(termino, idioma = null) {
        if (!termino || termino.length < 2) {
            return { resultados: [], total: 0 };
        }

        const terminoLower = termino.toLowerCase().trim();
        const resultados = [];
        const idiomaBusqueda = idioma || this._obtenerIdiomaActual() || 'es';

        const historias = this.getHistoriasElipse(this._elipseActiva);

        for (const h of historias) {
            try {
                const historia = await db.get('historias', h.id);
                if (historia && historia.idioma && historia.idioma !== idiomaBusqueda) {
                    continue;
                }
            } catch (e) {}
            
            const coincideTitulo = h.titulo.toLowerCase().includes(terminoLower);
            
            const frases = await db.obtenerFrasesPorHistoria(h.id);
            const frasesCoincidentes = [];
            let coincidenciaEnContenido = false;

            for (const f of frases) {
                const originalMatch = f.original.toLowerCase().includes(terminoLower);
                const traduccionMatch = f.traduccion.toLowerCase().includes(terminoLower);
                
                let palabrasMatch = false;
                if (f.palabras) {
                    for (const p of f.palabras) {
                        const texto = (p.palabra || p.hanzi || '').toLowerCase();
                        const significado = (p.significado || '').toLowerCase();
                        const pinyin = (p.pinyin || '').toLowerCase();
                        if (texto.includes(terminoLower) || 
                            significado.includes(terminoLower) || 
                            pinyin.includes(terminoLower)) {
                            palabrasMatch = true;
                            break;
                        }
                    }
                }

                if (originalMatch || traduccionMatch || palabrasMatch) {
                    frasesCoincidentes.push({
                        ...f,
                        _coincidencia: {
                            original: originalMatch,
                            traduccion: traduccionMatch,
                            palabras: palabrasMatch
                        }
                    });
                    coincidenciaEnContenido = true;
                }
            }

            if (coincideTitulo || coincidenciaEnContenido || frasesCoincidentes.length > 0) {
                const tema = await db.obtenerTema(h.temaId);
                resultados.push({
                    ...h,
                    _tipo: 'onda',
                    _tema: tema?.nombre || 'Sin tema',
                    _temaId: h.temaId,
                    _frasesCoincidentes: frasesCoincidentes,
                    _coincidenciaTitulo: coincideTitulo,
                    _coincidenciaContenido: coincidenciaEnContenido,
                    _totalFrasesCoincidentes: frasesCoincidentes.length,
                    _sincronizado: h._sincronizado || false,
                    _palabrasCoincidentes: frasesCoincidentes.filter(f => f._coincidencia.palabras).length
                });
            }
        }

        return {
            resultados: resultados,
            total: resultados.length
        };
    }

    // ============================================================
    // INTEGRACIÓN CON ONDAS CRUZADAS
    // ============================================================

    getTodasLasElipses() {
        const elipses = {};
        const temaId = this._elipseActiva;
        
        if (temaId) {
            const historias = this.getHistoriasElipse(temaId);
            if (historias && historias.length > 0) {
                elipses[temaId] = {
                    temaId: temaId,
                    totalOndas: historias.length,
                    ondas: historias.map(h => ({
                        id: h.id,
                        titulo: h.titulo,
                        palabrasNuevas: h.palabrasNuevas || [],
                        completada: h.completada || false,
                        rcnPromedio: h.rcnPromedio || 0,
                        indice: h.indice || 0
                    })),
                    personajesGlobales: this._extraerPersonajesGlobales(historias),
                    lugaresGlobales: this._extraerLugaresGlobales(historias),
                    vocabularioTotal: this._extraerVocabularioTotal(historias),
                    ultimaActualizacion: Date.now()
                };
            }
        }
        
        const savedData = this._cargarDatosGuardados();
        if (savedData && savedData.historias) {
            for (const temaIdGuardado of Object.keys(savedData.historias)) {
                if (!elipses[temaIdGuardado]) {
                    elipses[temaIdGuardado] = {
                        temaId: temaIdGuardado,
                        totalOndas: savedData.historias[temaIdGuardado]?.length || 0,
                        ondas: savedData.historias[temaIdGuardado] || [],
                        ultimaActualizacion: Date.now()
                    };
                }
            }
        }
        
        return elipses;
    }

    _extraerPersonajesGlobales(historias) {
        const personajes = new Set();
        for (const h of historias) {
            const texto = (h.titulo || '') + ' ' + (h.palabrasNuevas || []).join(' ');
            const matches = texto.match(/[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/g) || [];
            for (const m of matches) {
                if (m.length > 1) personajes.add(m);
            }
        }
        return Array.from(personajes);
    }

    _extraerLugaresGlobales(historias) {
        const lugares = new Set();
        const palabrasClave = ['casa', 'ciudad', 'parque', 'playa', 'montaña', 'río', 'mar', 'lago', 'jardín', 'escuela', 'trabajo', 'cafetería', 'restaurante', 'hotel', 'museo'];
        for (const h of historias) {
            const texto = (h.titulo || '') + ' ' + (h.palabrasNuevas || []).join(' ');
            for (const lugar of palabrasClave) {
                if (texto.toLowerCase().includes(lugar)) {
                    lugares.add(lugar);
                }
            }
        }
        return Array.from(lugares);
    }

    _extraerVocabularioTotal(historias) {
        const vocabulario = new Map();
        for (const h of historias) {
            if (h.palabrasNuevas) {
                for (const p of h.palabrasNuevas) {
                    if (!vocabulario.has(p)) {
                        vocabulario.set(p, { frecuencia: 0, orígenes: [] });
                    }
                    const data = vocabulario.get(p);
                    data.frecuencia++;
                    if (!data.orígenes.includes(h.titulo)) {
                        data.orígenes.push(h.titulo);
                    }
                }
            }
        }
        return vocabulario;
    }

    _cargarDatosGuardados() {
        try {
            const key = this._persistenciaKey || 'pipeline_elipse_estado_v5';
            const data = localStorage.getItem(key);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {}
        return null;
    }

    getEstadoCompleto() {
        return {
            elipseActiva: this._elipseActiva,
            historias: this._historiasElipse,
            estadisticas: this._estadisticas,
            config: this._config,
            recuerdoOndas: this._recuerdoOndas,
            todasLasElipses: this.getTodasLasElipses()
        };
    }

    destroy() {
        this._guardarEstadoElipse();
        this._guardarRecuerdoOndas();
        const idiomaActual = this._obtenerIdiomaActual();
        this._guardarEstadoPorIdioma(idiomaActual);
        this._initDone = false;
        console.log('🛑 Modo Elipse: Destruido (estado guardado)');
    }
}

const modoElipse = new ModoElipse();
window.modoElipse = modoElipse;

console.log('✅ Modo Elipse v5.7.12 - CORRECCIÓN: RECUERDO DE TODAS LAS ONDAS');
console.log('  🔥 Fix: _recuperarElipseDesdeTema ahora recupera TODAS las ondas');
console.log('  🔥 Fix: El recuerdo incluye TODAS las ondas anteriores (Base + Ondas)');
console.log('  🔥 Basado en v5.7.9 - SIN BUCLES INFINITOS');
console.log('  🔥 Preserva todas las funcionalidades');
