// ============================================================
// MODO ELIPSE v5.7.3 - CORREGIDO: FILTRO UNIFICADO DE ONDAS CRUZADAS
// getHistoriasElipse() SIEMPRE FILTRA
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
        
        // 🔥 ALMACENAR DATOS POR IDIOMA + TEMA
        this._datosPorIdioma = {};
        this._idiomaActual = null;
        
        // 🔥 INTEGRACIÓN CON ONDAS CRUZADAS
        this._ondasCruzadasIntegradas = false;
        
        this._cargarConfiguracion();
        this._registrarEventosPersistencia();
        this._configurarListenerIdioma();
        
        console.log('🌌 ModoElipse: Constructor ejecutado (v5.7.3 - Persistencia por idioma+tema)');
    }

    // ============================================================
    // CONFIGURAR LISTENER DE IDIOMA - SIN LIMPIEZA
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
        console.log('🌌 ModoElipse: Listener de idioma configurado (SIN LIMPIEZA)');
    }

    // ============================================================
    // GUARDAR ESTADO POR IDIOMA + TEMA (CORREGIDO)
    // ============================================================

    _guardarEstadoPorIdioma(idioma) {
        if (!idioma) return;
        
        // 🔥 NUEVO: Usar una clave compuesta de idioma + tema
        const temaId = this._elipseActiva;
        if (!temaId) {
            console.warn('⚠️ No hay tema activo, no se guarda estado.');
            return;
        }
        
        const key = `pipeline_elipse_estado_idioma_${idioma}_tema_${temaId}`;
        try {
            const data = {
                version: '5.7.3',
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
            
            // Guardar en el mapa de datos por idioma (para caché)
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
            
            // También guardar en el backup global para compatibilidad
            this._guardarBackupGlobal(idioma);
            
        } catch (e) {
            console.warn(`⚠️ Error guardando estado para idioma ${idioma}, tema ${temaId}:`, e);
        }
    }

    // ============================================================
    // GUARDAR BACKUP GLOBAL (para compatibilidad)
    // ============================================================

    _guardarBackupGlobal(idioma) {
        try {
            const data = {
                version: '5.7.3',
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
    // CARGAR ESTADO POR IDIOMA + TEMA (CORREGIDO)
    // ============================================================

    _cargarEstadoPorIdioma(idioma) {
        if (!idioma) return;
        
        // 🔥 Obtener el tema activo para cargar el estado correcto
        const temaId = this._elipseActiva || localStorage.getItem('pipeline_elipse_tema_activo');
        if (!temaId) {
            console.log(`📭 No hay tema activo para cargar datos de Elipse para idioma: ${idioma}`);
            this._resetearEstado();
            return;
        }

        // 🔥 Cargar desde caché por idioma + tema
        if (this._datosPorIdioma[idioma] && this._datosPorIdioma[idioma][temaId]) {
            console.log(`📦 Cargando datos de Elipse desde caché para idioma: ${idioma}, tema: ${temaId}`);
            const data = this._datosPorIdioma[idioma][temaId];
            this._aplicarDatosCargados(data);
            return;
        }

        // 🔥 Cargar desde localStorage con clave compuesta
        const key = `pipeline_elipse_estado_idioma_${idioma}_tema_${temaId}`;
        try {
            const storedData = localStorage.getItem(key);
            if (storedData) {
                const parsed = JSON.parse(storedData);
                console.log(`📦 Cargando datos de Elipse desde localStorage para idioma: ${idioma}, tema: ${temaId}`);
                console.log(`   📊 ${parsed.historias?.length || 0} ondas`);
                
                this._aplicarDatosCargados(parsed);
                
                // Guardar en caché
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

        // Si no hay datos específicos, intentar cargar desde backup global
        console.log(`📭 No hay datos específicos para idioma: ${idioma}, tema: ${temaId}. Intentando backup global...`);
        const cargadoBackup = this._cargarBackupGlobal(idioma, temaId);
        if (cargadoBackup) {
            console.log(`✅ Datos cargados desde backup global para idioma: ${idioma}, tema: ${temaId}`);
            return;
        }

        // Si no hay datos, resetear estado
        console.log(`📭 No hay datos de Elipse para idioma: ${idioma}, tema: ${temaId}`);
        this._resetearEstado();
    }

    // ============================================================
    // CARGAR BACKUP GLOBAL (para compatibilidad)
    // ============================================================

    _cargarBackupGlobal(idioma, temaId) {
        try {
            const storedData = localStorage.getItem(this._persistenciaKey);
            if (!storedData) return false;
            
            const parsed = JSON.parse(storedData);
            
            // Verificar que el backup sea del idioma correcto
            if (parsed.idioma !== idioma) {
                console.log(`⚠️ Backup global es de idioma "${parsed.idioma}", actual: "${idioma}"`);
                return false;
            }
            
            // Verificar que el backup sea del tema correcto o que no tenga tema específico
            const backupTemaId = parsed.elipseActiva;
            if (backupTemaId && backupTemaId !== temaId) {
                console.log(`⚠️ Backup global es de tema "${backupTemaId}", actual: "${temaId}"`);
                return false;
            }
            
            if (parsed.historias && parsed.historias.length > 0) {
                console.log(`📦 Cargando ${parsed.historias.length} ondas desde backup global para idioma: ${idioma}, tema: ${temaId}`);
                this._aplicarDatosCargados(parsed);
                
                // Guardar en el nuevo formato para futuras cargas
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
        // 🔥 Filtrar ondas cruzadas al cargar datos
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
    // 🔥 FILTRO UNIFICADO PARA EXCLUIR ONDAS CRUZADAS
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
        console.log('🧹 Estado de Elipse reseteado (sin datos para este idioma/tema).');
    }

    // ============================================================
    // GUARDAR ESTADO COMPLETO (con idioma + tema)
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
            
            // Guardar también en el backup global para compatibilidad
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
    // GUARDAR EN INDEXEDDB (con idioma + tema)
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
                version: '5.7.3',
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
            
            // Usar una clave compuesta para guardar en IndexedDB
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
    // CARGAR DATOS (con idioma + tema)
    // ============================================================

    async cargarDatos() {
        const idiomaActual = this._obtenerIdiomaActual();
        const temaId = this._elipseActiva || localStorage.getItem('pipeline_elipse_tema_activo');
        
        console.log(`🌌 ModoElipse.cargarDatos(): idioma=${idiomaActual}, tema=${temaId}`);
        
        // Si hay tema, cargar estado específico
        if (temaId) {
            this._cargarEstadoPorIdioma(idiomaActual);
        }
        
        // 🔥 Siempre filtrar al cargar
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
            // 🔥 Filtrar al finalizar la carga
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
        console.log('🌌 ModoElipse: Cargando datos de persistencia...');
        this._intentosCarga = 0;
        
        const idiomaActual = this._obtenerIdiomaActual();
        const temaId = this._elipseActiva || localStorage.getItem('pipeline_elipse_tema_activo');
        
        console.log(`🌌 ModoElipse: Cargando datos para idioma: ${idiomaActual}, tema: ${temaId || 'sin tema'}`);
        
        // 🔥 PASO 1: Cargar estado por idioma + tema
        if (temaId) {
            this._cargarEstadoPorIdioma(idiomaActual);
        }
        
        // 🔥 Filtrar ondas cruzadas después de cargar
        this._historiasElipse = this._filtrarOndasElipse(this._historiasElipse);
        
        if (this._historiasElipse.length > 0) {
            console.log(`✅ ${this._historiasElipse.length} ondas cargadas para idioma: ${idiomaActual}, tema: ${temaId}`);
            await this._reconstruirRecuerdoOndas();
            return this._historiasElipse;
        }
        
        // 🔥 PASO 2: Intentar cargar desde backup global
        if (temaId) {
            const cargadoBackup = this._cargarBackupGlobal(idiomaActual, temaId);
            if (cargadoBackup && this._historiasElipse.length > 0) {
                // Guardar en el nuevo formato para futuras cargas
                this._guardarEstadoPorIdioma(idiomaActual);
                await this._reconstruirRecuerdoOndas();
                return this._historiasElipse;
            }
        }
        
        // 🔥 PASO 3: Si no hay datos y hay un tema persistido, intentar recuperar desde la base de datos
        if (this._historiasElipse.length === 0 && temaId) {
            console.log('🌌 ModoElipse: Recuperando desde tema persistido...');
            await this._recuperarElipseDesdeTema(temaId);
            if (this._historiasElipse.length > 0) {
                this._guardarEstadoPorIdioma(idiomaActual);
                await this._reconstruirRecuerdoOndas();
                return this._historiasElipse;
            }
        }
        
        // 🔥 PASO 4: Intentar backup de emergencia desde localStorage antiguo
        if (this._historiasElipse.length === 0) {
            console.log('🌌 ModoElipse: Intentando backup de emergencia...');
            await this._cargarDesdeLocalStorageBackup();
        }
        
        // 🔥 Filtrar ondas cruzadas después de cualquier carga
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
    // RECONSTRUIR RECUERDO DE ONDAS
    // ============================================================

    async _reconstruirRecuerdoOndas() {
        console.log('📚 Reconstruyendo recuerdo de ondas desde las historias...');
        
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
        
        // Solo reconstruir ondas del tema actual (ya filtradas)
        const historiasTema = this._filtrarOndasElipse(this._historiasElipse.filter(h => h.temaId === temaId));
        
        for (const h of historiasTema) {
            try {
                const historia = await db.get('historias', h.id);
                if (historia && historia.idioma !== idiomaActual) {
                    continue;
                }
                
                const frases = await db.obtenerFrasesPorHistoria(h.id);
                const textoCompleto = frases.map(f => f.original).join(' ');
                
                if (h.palabrasNuevas && h.palabrasNuevas.length > 0) {
                    for (const p of h.palabrasNuevas) {
                        if (!this._recuerdoOndas.vocabularioAcumulado.includes(p)) {
                            this._recuerdoOndas.vocabularioAcumulado.push(p);
                        }
                    }
                }
                
                this._recuerdoOndas.resumenPorOnda[h.indice] = {
                    id: h.id,
                    titulo: h.titulo,
                    resumen: textoCompleto.substring(0, 200) + (textoCompleto.length > 200 ? '...' : ''),
                    palabrasNuevas: h.palabrasNuevas || [],
                    completada: h.completada || false
                };
                
                if (frases.length > 0) {
                    const ultimas = frases.slice(-3).map(f => f.original);
                    this._recuerdoOndas.ultimasFrases = ultimas;
                }
                
                const palabras = frases.flatMap(f => f.original.split(' ')).filter(p => p.length > 2);
                const posiblesNombres = palabras.filter(p => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(p) || /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(p));
                
                for (const nombre of posiblesNombres.slice(0, 5)) {
                    if (!this._recuerdoOndas.personajesPrincipales.includes(nombre)) {
                        this._recuerdoOndas.personajesPrincipales.push(nombre);
                    }
                }
                
            } catch (e) {
                console.warn(`⚠️ Error procesando historia ${h.id} para recuerdo:`, e);
            }
        }
        
        const resumenes = Object.values(this._recuerdoOndas.resumenPorOnda)
            .filter(r => r.resumen)
            .map((r, i) => `Onda ${i + 1}: ${r.resumen}`);
        this._recuerdoOndas.resumenGlobal = resumenes.join('\n');
        
        if (this._recuerdoOndas.vocabularioAcumulado.length > 30) {
            this._recuerdoOndas.vocabularioAcumulado = this._recuerdoOndas.vocabularioAcumulado.slice(-30);
        }
        
        this._guardarRecuerdoOndas();
        console.log(`📚 Recuerdo de ondas reconstruido: ${this._historiasElipse.length} ondas, ${this._recuerdoOndas.vocabularioAcumulado.length} palabras acumuladas`);
    }

    // ============================================================
    // CONFIGURACIÓN
    // ============================================================

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
    // CARGAR ESTADO COMPLETO DE ELIPSE (legacy)
    // ============================================================

    async _cargarEstadoElipseCompleto() {
        try {
            const estado = localStorage.getItem(this._persistenciaKey);
            if (!estado) {
                console.log('📭 No hay estado de Elipse en localStorage');
                return false;
            }

            const parsed = JSON.parse(estado);
            const idiomaActual = this._obtenerIdiomaActual();
            const temaIdActual = this._elipseActiva || localStorage.getItem('pipeline_elipse_tema_activo');
            
            if (parsed.idioma && parsed.idioma !== idiomaActual) {
                console.log(`⚠️ Estado de localStorage es de idioma "${parsed.idioma}", actual: "${idiomaActual}"`);
                return false;
            }
            
            const backupTemaId = parsed.elipseActiva;
            if (backupTemaId && temaIdActual && backupTemaId !== temaIdActual) {
                console.log(`⚠️ Estado de localStorage es de tema "${backupTemaId}", actual: "${temaIdActual}"`);
                return false;
            }
            
            console.log('📦 Estado Elipse encontrado en localStorage:', {
                historias: parsed.historias?.length || 0,
                elipseActiva: parsed.elipseActiva,
                totalOndas: parsed.estadisticas?.totalOndas || 0,
                idioma: parsed.idioma || 'no especificado'
            });

            if (parsed.estadisticas) {
                this._estadisticas = parsed.estadisticas;
            }

            if (parsed.elipseActiva) {
                this._elipseActiva = parsed.elipseActiva;
                localStorage.setItem('pipeline_elipse_tema_activo', parsed.elipseActiva);
            }

            if (parsed.historias && parsed.historias.length > 0) {
                this._historiasElipse = [];
                let datosValidos = 0;
                
                for (const hData of parsed.historias) {
                    try {
                        const historiaDB = await db.get('historias', hData.id);
                        if (historiaDB) {
                            if (historiaDB.idioma && historiaDB.idioma !== idiomaActual) {
                                continue;
                            }
                            // 🔥 Filtrar ondas cruzadas en el momento de cargar
                            if (this._esOndaCruzada(hData)) {
                                console.log(`🔍 Onda cruzada "${hData.titulo}" filtrada al cargar`);
                                continue;
                            }
                            this._historiasElipse.push({
                                id: hData.id,
                                titulo: historiaDB.titulo || hData.titulo || 'Historia sin título',
                                temaId: hData.temaId,
                                nivel: hData.nivel || 'A1',
                                indice: hData.indice || 0,
                                fecha: hData.fecha || Date.now(),
                                palabrasNuevas: hData.palabrasNuevas || [],
                                palabrasBase: hData.palabrasBase || [],
                                historiasPrevias: hData.historiasPrevias || [],
                                esBase: hData.esBase || false,
                                rcnPromedio: hData.rcnPromedio || 0,
                                completada: hData.completada || false,
                                _sincronizado: hData._sincronizado || false,
                                _fechaSincronizacion: hData._fechaSincronizacion || null,
                                _recuerdo: hData._recuerdo || null,
                                _esOndaCruzada: hData._esOndaCruzada || false
                            });
                            datosValidos++;
                        } else {
                            if (hData.idioma && hData.idioma !== idiomaActual) {
                                continue;
                            }
                            if (this._esOndaCruzada(hData)) {
                                console.log(`🔍 Onda cruzada "${hData.titulo}" filtrada al cargar (no existe en DB)`);
                                continue;
                            }
                            this._historiasElipse.push(hData);
                        }
                    } catch (e) {
                        console.warn(`⚠️ Error verificando historia ${hData.id}:`, e);
                        if (!this._esOndaCruzada(hData)) {
                            this._historiasElipse.push(hData);
                        }
                    }
                }

                if (datosValidos > 0) {
                    this._persistenciaCargada = true;
                    this._datosCargados = true;
                    await this._reconstruirRecuerdoOndas();
                    const idioma = this._obtenerIdiomaActual();
                    this._guardarEstadoPorIdioma(idioma);
                }
                
                console.log(`✅ ${this._historiasElipse.length} historias restauradas desde localStorage para idioma: ${idiomaActual}`);
                return true;
            }
            
            return false;

        } catch (error) {
            console.error('❌ Error cargando estado de Elipse:', error);
            this._historiasElipse = [];
            this._persistenciaCargada = false;
            return false;
        }
    }

    // ============================================================
    // GUARDADO AUTOMÁTICO
    // ============================================================

    _iniciarGuardadoAutomatico() {
        if (this._historiasElipse.length > 0) {
            this._guardarEstadoElipse();
        }

        const intervalId = setInterval(() => {
            if (this._historiasElipse.length > 0) {
                this._guardarEstadoElipse();
            }
        }, this._intervaloGuardado);

        return intervalId;
    }

    // ============================================================
    // RECUPERAR ELIPSE DESDE UN TEMA
    // ============================================================

    async _recuperarElipseDesdeTema(temaId) {
        if (this._recuperando) return;
        this._recuperando = true;
        
        try {
            console.log(`🔄 Intentando recuperar Elipse desde el tema ${temaId}...`);
            
            if (typeof db === 'undefined' || !db._initialized) {
                console.warn('⚠️ DB no disponible para recuperar');
                this._recuperando = false;
                return;
            }
            
            const tema = await db.obtenerTema(temaId);
            if (!tema) {
                console.warn(`⚠️ Tema ${temaId} no encontrado`);
                this._recuperando = false;
                return;
            }
            
            const idiomaActual = this._obtenerIdiomaActual();
            
            if (tema.idioma && tema.idioma !== idiomaActual) {
                console.log(`⚠️ El tema ${temaId} es de idioma "${tema.idioma}", actual: "${idiomaActual}"`);
                localStorage.removeItem('pipeline_elipse_tema_activo');
                this._recuperando = false;
                return;
            }
            
            // Obtener todas las historias del tema, incluyendo la base
            const historias = await db.obtenerHistoriasPorTema(temaId);
            // 🔥 Filtrar ondas cruzadas
            const historiasFiltradas = historias.filter(h => h.idioma === idiomaActual && !this._esOndaCruzada(h));
            
            if (historiasFiltradas.length === 0) {
                console.log(`ℹ️ No hay historias en el tema ${temaId}`);
                this._recuperando = false;
                return;
            }
            
            // Verificar si hay ondas marcadas
            const ondas = historiasFiltradas.filter(h => h._esOnda === true);
            
            console.log(`📚 Encontradas ${ondas.length} ondas en el tema ${temaId}`);
            
            this._elipseActiva = temaId;
            this._historiasElipse = [];
            this._estadisticas.totalOndas = 0;
            
            // Si no hay ondas, usar la primera historia como base
            if (ondas.length === 0) {
                const historiaBase = historiasFiltradas[0];
                console.log(`📚 Usando "${historiaBase.titulo}" como historia base`);
                const ondaBase = {
                    id: historiaBase.id,
                    titulo: historiaBase.titulo || 'Historia base',
                    temaId: temaId,
                    nivel: historiaBase.nivel || 'A1',
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
                this._historiasElipse.push(ondaBase);
                this._estadisticas.totalOndas = 1;
            } else {
                // Procesar ondas existentes
                for (const h of ondas) {
                    const frases = await db.obtenerFrasesPorHistoria(h.id);
                    let rcnPromedio = 0;
                    let completadas = 0;
                    
                    if (frases.length > 0) {
                        let totalRCN = 0;
                        for (const f of frases) {
                            const progreso = await db.obtenerProgreso(f.id);
                            if (progreso) {
                                totalRCN += progreso.rcn || 0;
                                if (progreso.rcn >= 4 || progreso.estado === 'completada') {
                                    completadas++;
                                }
                            }
                        }
                        rcnPromedio = totalRCN / frases.length;
                    }
                    
                    this._historiasElipse.push({
                        id: h.id,
                        titulo: h.titulo || 'Historia sin título',
                        temaId: temaId,
                        nivel: h.nivel || 'A1',
                        indice: h._ondaIndice || this._historiasElipse.length,
                        fecha: h.fechaCreacion || Date.now(),
                        palabrasNuevas: h._palabrasNuevas || [],
                        palabrasBase: [],
                        historiasPrevias: [],
                        esBase: h._esBase || false,
                        rcnPromedio: rcnPromedio,
                        completada: completadas === frases.length && frases.length > 0,
                        _sincronizado: h._sincronizado || false,
                        _fechaSincronizacion: h._fechaSincronizacion || null,
                        _esOndaCruzada: h._esOndaCruzada || false
                    });
                    this._estadisticas.totalOndas++;
                }
            }
            
            // Asegurar que la historia base esté al principio
            const historiasBase = this._historiasElipse.filter(h => h.esBase);
            const historiasOndas = this._historiasElipse.filter(h => !h.esBase);
            this._historiasElipse = [...historiasBase, ...historiasOndas];
            
            this._persistenciaCargada = true;
            this._datosCargados = true;
            localStorage.setItem('pipeline_elipse_tema_activo', temaId);
            this._guardarEstadoElipse();
            await this._guardarEnIndexedDB();
            await this._reconstruirRecuerdoOndas();
            
            this._guardarEstadoPorIdioma(idiomaActual);
            
            console.log(`✅ Elipse recuperada con ${this._historiasElipse.length} ondas desde el tema ${temaId}`);
            
            if (this._core) {
                this._core.mostrarToast(`🌌 Elipse recuperada con ${this._historiasElipse.length} ondas`, 'success');
            }
            
        } catch (error) {
            console.error('❌ Error recuperando Elipse desde tema:', error);
        } finally {
            this._recuperando = false;
        }
    }

    // ============================================================
    // INICIAR ELIPSE
    // ============================================================

    async iniciarElipse(temaId, historiaId) {
        console.log(`🌌 Iniciando Elipse para tema ${temaId} con historia ${historiaId}`);
        
        const idiomaActual = this._obtenerIdiomaActual();
        
        const tema = await db.obtenerTema(temaId);
        if (tema && tema.idioma && tema.idioma !== idiomaActual) {
            console.log(`⚠️ El tema ${temaId} es de idioma "${tema.idioma}", actual: "${idiomaActual}"`);
            if (this._core) {
                this._core.mostrarToast(`⚠️ El tema es de idioma "${tema.idioma}", cambia a ese idioma primero`, 'warning');
            }
            return null;
        }
        
        // Verificar si ya existe una elipse para este tema en el idioma actual
        const existente = this._historiasElipse.find(h => h.temaId === temaId);
        if (existente) {
            console.log(`📌 Ya existe una elipse para el tema ${temaId} en ${idiomaActual}`);
            this._elipseActiva = temaId;
            localStorage.setItem('pipeline_elipse_tema_activo', temaId);
            this._guardarEstadoElipse();
            await this._guardarEnIndexedDB();
            return this._historiasElipse;
        }
        
        const historia = await db.get('historias', historiaId);
        if (!historia) {
            console.error(`❌ Historia ${historiaId} no encontrada`);
            return null;
        }
        
        // 🔥 Verificar que la historia NO sea una onda cruzada
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
        
        // Limpiar el estado actual para este tema antes de iniciar
        this._resetearEstado();
        
        const ondaInicial = {
            id: historiaId,
            titulo: historia.titulo,
            temaId: temaId,
            nivel: historia.nivel || 'A1',
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
        
        this._historiasElipse = [ondaInicial];
        this._elipseActiva = temaId;
        this._estadisticas.totalOndas = 1;
        
        localStorage.setItem('pipeline_elipse_tema_activo', temaId);
        this._guardarEstadoElipse();
        await this._guardarEnIndexedDB();
        await this._reconstruirRecuerdoOndas();
        
        this._guardarEstadoPorIdioma(idiomaActual);
        
        console.log(`✅ Elipse iniciada y guardada con tema ${temaId} (${idiomaActual})`);
        
        if (this._core) {
            this._core.mostrarToast(`🌌 Elipse iniciada con "${historia.titulo}"`, 'success');
        }
        
        window.dispatchEvent(new CustomEvent('elipseTemaSeleccionado', {
            detail: {
                temaId: temaId,
                historiaId: historiaId,
                titulo: historia.titulo,
                idioma: idiomaActual
            }
        }));
        
        this._datosCargados = true;
        this._progresoTemasCache = {};
        
        return this._historiasElipse;
    }

    // ============================================================
    // OBTENER PROGRESO COMPLETO DEL TEMA
    // ============================================================

    async obtenerProgresoTemaCompleto(temaId) {
        try {
            if (this._progresoTemasCache[temaId] && 
                (Date.now() - this._progresoTemasCache[temaId]._timestamp < 5000)) {
                return this._progresoTemasCache[temaId];
            }
            
            const tema = await db.obtenerTema(temaId);
            if (!tema) return null;
            
            const idiomaActual = this._obtenerIdiomaActual();
            
            if (tema.idioma && tema.idioma !== idiomaActual) {
                console.log(`⚠️ Tema ${temaId} es de idioma "${tema.idioma}", actual: "${idiomaActual}"`);
                return null;
            }
            
            const todasHistorias = await db.obtenerHistoriasPorTema(temaId);
            // 🔥 Filtrar ondas cruzadas
            const historiasElipse = this._filtrarOndasElipse(this._historiasElipse.filter(h => h.temaId === temaId));
            
            let historiasCompletadas = 0;
            let historiasTotales = 0;
            
            for (const h of todasHistorias) {
                if (this._esOndaCruzada(h)) continue;
                historiasTotales++;
                
                const esElipse = historiasElipse.some(eh => eh.id === h.id);
                
                if (esElipse) {
                    const elipseHistoria = historiasElipse.find(eh => eh.id === h.id);
                    if (elipseHistoria && elipseHistoria.completada) {
                        historiasCompletadas++;
                    }
                } else {
                    const frases = await db.obtenerFrasesPorHistoria(h.id);
                    let completadas = 0;
                    for (const f of frases) {
                        const progreso = await db.obtenerProgreso(f.id);
                        if (progreso && (progreso.rcn >= 4 || progreso.estado === 'completada')) {
                            completadas++;
                        }
                    }
                    if (frases.length > 0 && completadas === frases.length) {
                        historiasCompletadas++;
                    }
                }
            }
            
            const resultado = {
                temaId: temaId,
                temaNombre: tema.nombre,
                totalHistorias: historiasTotales,
                historiasCompletadas: historiasCompletadas,
                progreso: historiasTotales > 0 ? Math.round((historiasCompletadas / historiasTotales) * 100) : 0,
                estaCompletado: historiasTotales > 0 && historiasCompletadas >= historiasTotales,
                _timestamp: Date.now()
            };
            
            this._progresoTemasCache[temaId] = resultado;
            return resultado;
            
        } catch (error) {
            console.error('❌ Error obteniendo progreso del tema:', error);
            return null;
        }
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
        
        console.log('🌌 Inicializando Modo Elipse v5.7.3 (Persistencia por idioma+tema)...');
        
        this._cargarConfiguracion();
        this._registrarEventos();
        this._iniciarGuardadoAutomatico();
        
        this._initDone = true;
        console.log('🌌 Modo Elipse v5.7.3: Inicializado');
        console.log(`   📊 ${this._historiasElipse.length} historias en caché`);
        console.log(`   📌 Elipse activa: ${this._elipseActiva || 'Ninguna'}`);
        console.log(`   💾 Persistencia cargada: ${this._persistenciaCargada ? '✅ Sí' : '❌ No'}`);
        console.log(`   📚 Recuerdo de ondas: ${Object.keys(this._recuerdoOndas.resumenPorOnda).length} ondas recordadas`);
        console.log(`   🔥 MULTIIDIOMA + MULTITEMA: Guarda datos por idioma y tema`);
        console.log(`   🔥 Puedes cambiar de tema y volver sin perder progreso`);
        console.log(`   🔥 DESCRIPCIÓN OPCIONAL: El usuario puede añadir descripción antes de generar`);
        console.log(`   🔥 PROMPT MULTIDIOMA: El prompt está en el idioma nativo del usuario`);
        console.log(`   🔥 FILTRO UNIFICADO: getHistoriasElipse() SIEMPRE filtra ondas cruzadas`);
        console.log(`   ✅ Todas las funcionalidades originales preservadas`);
        
        return this;
    }

    // ============================================================
    // RESPUESTA DE ESTUDIO
    // ============================================================

    async _onRespuestaEstudio(detalle) {
        if (!detalle || !this._elipseActiva) return;
        
        const historiaId = detalle.historiaId || detalle.fraseId;
        if (!historiaId) return;
        
        const esHistoriaElipse = this._historiasElipse.some(h => h.id === historiaId);
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
            const historiasElipse = this._historiasElipse.filter(h => h.id === historiaId);
            if (historiasElipse.length === 0) return;
            
            let huboCambio = false;
            
            for (const h of historiasElipse) {
                const frases = await db.obtenerFrasesPorHistoria(historiaId);
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
            const historia = this._historiasElipse.find(h => h.id === historiaId);
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

            let tema = await db.obtenerTema(temaId);
            if (!tema) {
                console.warn(`⚠️ Tema ${temaId} no encontrado`);
                this._sincronizando = false;
                return;
            }

            console.log(`📂 Tema padre: "${tema.nombre}" (ID: ${tema.id})`);

            try {
                const historiaDB = await db.get('historias', historiaId);
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

            const todasLasHistoriasDelTema = await db.obtenerHistoriasPorTema(temaId);
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
    // GENERAR PLANTILLA ONDA - CON DESCRIPCIÓN OPCIONAL Y PROMPT MULTIDIOMA
    // ============================================================

    async generarPlantillaOnda(temaId, historiaId = null, descripcion = '') {
        if (this._generando) {
            console.log('⏳ Ya hay una generación en curso');
            return null;
        }

        if (!temaId) {
            if (this._core) this._core.mostrarToast('❌ Tema no especificado', 'error');
            return null;
        }
        
        const idiomaObjetivo = this._obtenerIdiomaActual();
        const idiomaPrompt = this._obtenerIdiomaNativo() || 'es';
        
        // 🔥 PATCH ANTI-ERROR: Asegurar que el tema existe antes de continuar
        let tema = await db.obtenerTema(temaId);
        if (!tema) {
            console.warn(`⚠️ Tema ${temaId} no encontrado en generarPlantillaOnda, usando ID como fallback...`);
            tema = { id: temaId, nombre: `Tema ${temaId}`, idioma: idiomaObjetivo, nivel: 'A1' };
        }

        if (tema.idioma && tema.idioma !== idiomaObjetivo) {
            console.log(`⚠️ El tema ${temaId} es de idioma "${tema.idioma}", actual: "${idiomaObjetivo}"`);
            if (this._core) {
                this._core.mostrarToast(`⚠️ El tema es de idioma "${tema.idioma}", cambia a ese idioma primero`, 'warning');
            }
            return null;
        }
        
        // 🔥 Usar getHistoriasElipse() que ya filtra
        const historiasElipse = this.getHistoriasElipse(temaId);
        if (historiasElipse.length >= this._config.maxOndas) {
            if (this._core) {
                this._core.mostrarToast(`🌌 Límite de ondas alcanzado (${this._config.maxOndas})`, 'warning');
            }
            return null;
        }
        
        let historiaBaseId = historiaId;
        if (!historiaBaseId) {
            const ultimaHistoria = historiasElipse.sort((a, b) => b.indice - a.indice)[0];
            if (ultimaHistoria) {
                historiaBaseId = ultimaHistoria.id;
            } else {
                if (this._core) this._core.mostrarToast('❌ No hay historias en la elipse', 'error');
                return null;
            }
        }
        
        const existe = historiasElipse.some(h => h.id === historiaBaseId);
        if (!existe) {
            if (this._core) this._core.mostrarToast('❌ Historia base no encontrada en la elipse', 'error');
            return null;
        }
        
        const historiaBase = await db.get('historias', historiaBaseId);
        if (!historiaBase) {
            if (this._core) this._core.mostrarToast('❌ Historia base no encontrada', 'error');
            return null;
        }
        
        if (historiaBase.idioma && historiaBase.idioma !== idiomaObjetivo) {
            console.log(`⚠️ Historia base ${historiaBaseId} es de idioma "${historiaBase.idioma}", actual: "${idiomaObjetivo}"`);
            if (this._core) {
                this._core.mostrarToast(`⚠️ La historia base es de idioma "${historiaBase.idioma}"`, 'warning');
            }
            return null;
        }
        
        const frasesBase = await db.obtenerFrasesPorHistoria(historiaBaseId);
        if (frasesBase.length === 0) {
            if (this._core) this._core.mostrarToast('❌ La historia base no tiene frases', 'error');
            return null;
        }
        
        const indiceActual = historiasElipse.length;
        const nivelActual = this._calcularNivelOnda(indiceActual);
        const palabrasNuevas = Math.min(
            this._config.palabrasNuevasPorOnda + Math.floor(indiceActual / 2),
            8
        );
        
        const recuerdo = await this._construirRecuerdoParaIA(temaId, indiceActual);
        
        // 🔥 AÑADIR LA DESCRIPCIÓN DEL USUARIO AL RECUERDO
        if (descripcion && descripcion.trim().length > 0) {
            recuerdo.descripcionUsuario = descripcion.trim();
            console.log(`📝 Descripción del usuario añadida al recuerdo: "${descripcion.trim().substring(0, 50)}..."`);
        }

        const plantilla = await this._generarPlantillaJSONConRecuerdo(
            tema,
            historiaBase,
            frasesBase,
            nivelActual,
            palabrasNuevas,
            indiceActual,
            recuerdo,
            idiomaObjetivo,
            idiomaPrompt
        );
        
        return plantilla;
    }

    // ============================================================
    // CONSTRUIR RECUERDO DE ONDAS PARA LA IA
    // ============================================================

    async _construirRecuerdoParaIA(temaId, indiceActual) {
        const idiomaActual = this._obtenerIdiomaActual();
        // 🔥 Usar getHistoriasElipse() que ya filtra
        const historiasElipse = this.getHistoriasElipse(temaId);
        
        const historiasFiltradas = [];
        for (const h of historiasElipse) {
            try {
                const historia = await db.get('historias', h.id);
                if (historia && historia.idioma !== idiomaActual) {
                    continue;
                }
                historiasFiltradas.push(h);
            } catch (e) {
                historiasFiltradas.push(h);
            }
        }
        
        const historiasBase = historiasFiltradas.filter(h => h.esBase);
        const ondas = historiasFiltradas.filter(h => !h.esBase);
        
        if (historiasFiltradas.length === 0) {
            return {
                resumenGlobal: 'No hay historias previas. Esta es la historia base.',
                personajesPrincipales: [],
                lugares: [],
                eventosClave: [],
                tramasAbiertas: [],
                ultimasFrases: [],
                vocabularioAcumulado: [],
                resumenPorOnda: {}
            };
        }

        if (this._recuerdoOndas && Object.keys(this._recuerdoOndas.resumenPorOnda).length > 0) {
            return this._recuerdoOndas;
        }

        const recuerdo = {
            resumenGlobal: '',
            personajesPrincipales: [],
            lugares: [],
            eventosClave: [],
            tramasAbiertas: [],
            ultimasFrases: [],
            vocabularioAcumulado: [],
            resumenPorOnda: {}
        };

        const historiasOrdenadas = [...historiasFiltradas].sort((a, b) => a.indice - b.indice);

        for (const h of historiasOrdenadas) {
            try {
                const frases = await db.obtenerFrasesPorHistoria(h.id);
                const textoCompleto = frases.map(f => f.original).join(' ');
                
                recuerdo.resumenPorOnda[h.indice] = {
                    id: h.id,
                    titulo: h.titulo,
                    resumen: textoCompleto.substring(0, 200) + (textoCompleto.length > 200 ? '...' : ''),
                    palabrasNuevas: h.palabrasNuevas || [],
                    completada: h.completada || false
                };
                
                if (h.palabrasNuevas) {
                    for (const p of h.palabrasNuevas) {
                        if (!recuerdo.vocabularioAcumulado.includes(p)) {
                            recuerdo.vocabularioAcumulado.push(p);
                        }
                    }
                }
                
                if (frases.length > 0) {
                    const ultimas = frases.slice(-3).map(f => f.original);
                    recuerdo.ultimasFrases = ultimas;
                }
                
                const texto = frases.map(f => f.original).join(' ');
                const palabras = texto.split(/[\s,.;:!?]+/).filter(p => p.length > 2);
                
                const posiblesNombres = palabras.filter(p => 
                    /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(p) || 
                    /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(p)
                );
                
                for (const nombre of posiblesNombres.slice(0, 3)) {
                    if (!recuerdo.personajesPrincipales.includes(nombre)) {
                        recuerdo.personajesPrincipales.push(nombre);
                    }
                }
                
                const lugaresClave = ['casa', 'ciudad', 'país', 'calle', 'parque', 'playa', 'montaña', 'río', 'mar', 'lago', 'jardín', 'escuela', 'trabajo'];
                for (const palabra of palabras) {
                    const palabraLower = palabra.toLowerCase();
                    for (const lugar of lugaresClave) {
                        if (palabraLower.includes(lugar) && !recuerdo.lugares.includes(palabra)) {
                            recuerdo.lugares.push(palabra);
                            break;
                        }
                    }
                }
                
                const verbosClave = ['viajar', 'conocer', 'encontrar', 'descubrir', 'suceder', 'ocurrir', 'decidir', 'empezar', 'terminar', 'cambiar'];
                for (const palabra of palabras) {
                    const palabraLower = palabra.toLowerCase();
                    for (const verbo of verbosClave) {
                        if (palabraLower.includes(verbo) && !recuerdo.eventosClave.includes(palabra)) {
                            recuerdo.eventosClave.push(palabra);
                            break;
                        }
                    }
                }
                
            } catch (e) {
                console.warn(`⚠️ Error procesando historia ${h.id} para recuerdo:`, e);
            }
        }

        if (recuerdo.personajesPrincipales.length > 5) recuerdo.personajesPrincipales = recuerdo.personajesPrincipales.slice(0, 5);
        if (recuerdo.lugares.length > 5) recuerdo.lugares = recuerdo.lugares.slice(0, 5);
        if (recuerdo.eventosClave.length > 5) recuerdo.eventosClave = recuerdo.eventosClave.slice(0, 5);
        if (recuerdo.vocabularioAcumulado.length > 30) recuerdo.vocabularioAcumulado = recuerdo.vocabularioAcumulado.slice(-30);

        const resumenes = Object.values(recuerdo.resumenPorOnda)
            .filter(r => r.resumen)
            .map((r, i) => `Onda ${i + 1}: ${r.resumen}`);
        recuerdo.resumenGlobal = resumenes.join('\n');

        this._recuerdoOndas = recuerdo;
        this._guardarRecuerdoOndas();
        
        console.log(`📚 Recuerdo de ondas construido: ${Object.keys(recuerdo.resumenPorOnda).length} ondas, ${recuerdo.vocabularioAcumulado.length} palabras`);
        return recuerdo;
    }

    // ============================================================
    // GENERAR PLANTILLA JSON CON RECUERDO DE ONDAS + DESCRIPCIÓN + PROMPT MULTIDIOMA
    // ============================================================

    async _generarPlantillaJSONConRecuerdo(tema, historiaBase, frasesBase, nivel, numPalabrasNuevas, indice, recuerdo, idiomaObjetivo, idiomaPrompt) {
        // 🔥 PATCH ANTI-ERROR: Blindar el acceso a tema.idioma
        const idioma = (tema && tema.idioma) || idiomaObjetivo || this._obtenerIdiomaActual() || 'es';
        const temaNombre = (tema && tema.nombre) || `Tema ${tema.id || 'desconocido'}`;
        const esJeroglifico = window.gestorIdiomas?._esJeroglifico(idioma) || false;
        const idiomaNativo = this._obtenerIdiomaNativo() || 'es';
        const nombreIdiomaObjetivo = this._getNombreIdioma(idioma);
        const nombreIdiomaPrompt = this._getNombreIdioma(idiomaPrompt);

        const palabrasBase = frasesBase
            .flatMap(f => f.palabras || [])
            .map(p => p.palabra || p.hanzi || '')
            .filter(Boolean);
        const palabrasBaseUnicas = [...new Set(palabrasBase)].slice(0, 20);

        const tituloAnterior = historiaBase.titulo || 'Historia anterior';
        const contenidoAnterior = frasesBase
            .slice(0, 4)
            .map(f => f.original)
            .join(' ');

        let recuerdoTexto = '';
        let recuerdoTextoPrompt = '';
        
        // 🔥 INYECTAR DESCRIPCIÓN DEL USUARIO AL INICIO (MUY VISIBLE)
        if (recuerdo.descripcionUsuario) {
            const descUser = recuerdo.descripcionUsuario;
            recuerdoTextoPrompt += `\n📝 **DESCRIPCIÓN DEL USUARIO PARA ESTA NUEVA ONDA (MUY IMPORTANTE):**\n`;
            recuerdoTextoPrompt += `"${descUser}"\n\n`;
            recuerdoTextoPrompt += `🔴 **DEBES incorporar estos elementos en la nueva historia:**\n`;
            recuerdoTextoPrompt += `   - Si se mencionan personajes, DEBEN aparecer en la historia.\n`;
            recuerdoTextoPrompt += `   - Si se mencionan lugares, DEBEN ser parte de la ambientación.\n`;
            recuerdoTextoPrompt += `   - Si se mencionan eventos, DEBEN ocurrir en la trama.\n`;
            recuerdoTextoPrompt += `   - La historia DEBE ser coherente con esta descripción.\n\n`;
        }
        
        if (recuerdo && Object.keys(recuerdo.resumenPorOnda).length > 0) {
            recuerdoTextoPrompt += `\n📚 **CONTEXTO DE ONDAS ANTERIORES (MUY IMPORTANTE)**:\n\n`;
            
            if (recuerdo.resumenGlobal) {
                recuerdoTextoPrompt += `📖 **RESUMEN GLOBAL DE LA HISTORIA HASTA AHORA:**\n${recuerdo.resumenGlobal}\n\n`;
            }
            
            if (recuerdo.personajesPrincipales && recuerdo.personajesPrincipales.length > 0) {
                recuerdoTextoPrompt += `👤 **PERSONAJES PRINCIPALES:** ${recuerdo.personajesPrincipales.join(', ')}\n\n`;
            }
            
            if (recuerdo.lugares && recuerdo.lugares.length > 0) {
                recuerdoTextoPrompt += `📍 **LUGARES CLAVE:** ${recuerdo.lugares.join(', ')}\n\n`;
            }
            
            if (recuerdo.eventosClave && recuerdo.eventosClave.length > 0) {
                recuerdoTextoPrompt += `⚡ **EVENTOS CLAVE:** ${recuerdo.eventosClave.join(', ')}\n\n`;
            }
            
            if (recuerdo.vocabularioAcumulado && recuerdo.vocabularioAcumulado.length > 0) {
                recuerdoTextoPrompt += `📝 **VOCABULARIO ACUMULADO:** ${recuerdo.vocabularioAcumulado.join(', ')}\n\n`;
            }
            
            if (recuerdo.ultimasFrases && recuerdo.ultimasFrases.length > 0) {
                recuerdoTextoPrompt += `🔚 **ÚLTIMAS FRASES DE LA HISTORIA ANTERIOR:**\n"${recuerdo.ultimasFrases.join('" "')}"\n\n`;
            }
            
            recuerdoTextoPrompt += `📖 **RESUMEN POR ONDA (${Object.keys(recuerdo.resumenPorOnda).length} ondas):**\n`;
            const ondasOrdenadas = Object.keys(recuerdo.resumenPorOnda).sort((a, b) => parseInt(a) - parseInt(b));
            for (const idx of ondasOrdenadas) {
                const data = recuerdo.resumenPorOnda[idx];
                const estado = data.completada ? '✅ COMPLETADA' : '📖 EN PROGRESO';
                recuerdoTextoPrompt += `  Onda ${parseInt(idx) + 1}: "${data.titulo}" (${estado})\n`;
                recuerdoTextoPrompt += `    ${data.resumen}\n`;
                if (data.palabrasNuevas && data.palabrasNuevas.length > 0) {
                    recuerdoTextoPrompt += `    Palabras nuevas: ${data.palabrasNuevas.join(', ')}\n`;
                }
                recuerdoTextoPrompt += '\n';
            }
            
            recuerdoTextoPrompt += `\n🔴 **REGLAS DE CONTINUIDAD:**\n`;
            recuerdoTextoPrompt += `1. La NUEVA historia debe ser una CONTINUACIÓN DIRECTA de la historia anterior.\n`;
            recuerdoTextoPrompt += `2. Mantén los MISMOS personajes y ambientación.\n`;
            recuerdoTextoPrompt += `3. Resuelve o avanza en las tramas abiertas.\n`;
            recuerdoTextoPrompt += `4. Introduce EXACTAMENTE ${numPalabrasNuevas} palabras nuevas en ${nombreIdiomaObjetivo}.\n`;
            recuerdoTextoPrompt += `5. El nivel de dificultad es ${nivel}.\n`;
            recuerdoTextoPrompt += `6. La historia debe tener COHERENCIA narrativa con TODO lo anterior.\n`;
            recuerdoTextoPrompt += `7. NO reuses las palabras nuevas de ondas anteriores como palabras nuevas.\n`;
        } else {
            recuerdoTextoPrompt = `📖 **PRIMERA ONDA - HISTORIA BASE:**\n"${tituloAnterior}"\n${contenidoAnterior}\n\nEsta es la primera onda, genera una continuación coherente.`;
        }

        // 🔥 INSTRUCCIÓN ESPECIAL SOBRE LA DESCRIPCIÓN DEL USUARIO
        if (recuerdo.descripcionUsuario) {
            recuerdoTextoPrompt += `\n📌 **INSTRUCCIÓN ESPECIAL DEL USUARIO:**\n`;
            recuerdoTextoPrompt += `   - La historia DEBE incluir los elementos descritos por el usuario.\n`;
            recuerdoTextoPrompt += `   - NO ignores la descripción del usuario bajo ninguna circunstancia.\n`;
            recuerdoTextoPrompt += `   - Integra los elementos de la descripción de forma NATURAL en la trama.\n`;
        }

        // 🔥 CONSTRUIR EL PROMPT EN EL IDIOMA NATIVO
        let promptCompleto = `Genera una NUEVA historia (onda ${indice + 1}) que sea una CONTINUACIÓN DIRECTA de la historia anterior.\n\n`;
        promptCompleto += `Idioma objetivo: ${nombreIdiomaObjetivo} (${idioma})\n`;
        promptCompleto += `Nivel: ${nivel}\n`;
        promptCompleto += `Número de palabras nuevas: ${numPalabrasNuevas}\n\n`;
        promptCompleto += `La historia anterior se titula: "${tituloAnterior}".\n`;
        promptCompleto += `Resumen de la historia anterior: "${contenidoAnterior.substring(0, 150)}..."\n\n`;
        promptCompleto += recuerdoTextoPrompt;
        promptCompleto += `\n\nLa nueva historia debe tener entre 6 y 8 frases en ${nombreIdiomaObjetivo}.\n`;
        promptCompleto += `Debe incluir los MISMOS personajes y ambientación.\n`;
        promptCompleto += `Debe introducir EXACTAMENTE ${numPalabrasNuevas} palabras nuevas en ${nombreIdiomaObjetivo}.\n`;
        promptCompleto += `Las palabras nuevas deben tener su traducción al ${nombreIdiomaPrompt}.\n`;
        promptCompleto += `Nivel de dificultad: ${nivel}.\n`;
        promptCompleto += `Las frases deben ser NATURALES y UTILIZABLES en la vida cotidiana.\n`;
        promptCompleto += `La historia debe tener COHERENCIA narrativa con TODAS las historias anteriores.\n`;
        promptCompleto += `NO uses placeholders como [palabra] o [significado].\n`;
        promptCompleto += `Las palabras deben ser REALES y APROPIADAS para el nivel ${nivel}.\n`;
        promptCompleto += `Responde SOLO en formato JSON válido.\n`;
        promptCompleto += `NO incluyas texto adicional fuera del JSON.\n`;
        promptCompleto += `Cada frase debe incluir un array 'palabras' con TODAS las palabras desglosadas.\n`;
        promptCompleto += `NO reuses palabras nuevas de ondas anteriores como palabras nuevas.\n`;
        promptCompleto += `Mantén la CONTINUIDAD narrativa con TODAS las ondas anteriores.\n`;

        const plantilla = {
            "_INSTRUCCIONES_PARA_IA": {
                "version": "5.7.3",
                "idioma_prompt": idiomaPrompt,
                "idioma_objetivo": idioma,
                "nombre_idioma_prompt": nombreIdiomaPrompt,
                "nombre_idioma_objetivo": nombreIdiomaObjetivo,
                "accion": "Genera una nueva historia (onda) para el Modo Elipse",
                "nivel": nivel,
                "num_palabras_nuevas": numPalabrasNuevas,
                "onda_indice": indice + 1,
                "onda_maxima": this._config.maxOndas,
                "prompt": promptCompleto,
                "recuerdo_contexto": recuerdoTextoPrompt,
                "instrucciones": [
                    `El prompt completo está en el campo "prompt".`,
                    `El idioma objetivo para la historia es: ${nombreIdiomaObjetivo}.`,
                    `Responde SOLO en formato JSON válido.`,
                    `NO incluyas texto adicional fuera del JSON.`
                ],
                "palabras_base": palabrasBaseUnicas,
                "ejemplo_formato": {
                    "meta": {
                        "titulo": "Título de la nueva historia",
                        "nivel": nivel,
                        "es_onda": true,
                        "indice": indice + 1
                    },
                    "palabras_nuevas": [
                        {
                            "palabra": "palabra_nueva_1",
                            "significado": `significado_en_${idiomaPrompt}`,
                            "familia_semantica": "familia_semantica"
                        }
                    ],
                    "historias": [
                        {
                            "titulo": "Título de la historia",
                            "frases": [
                                {
                                    "original": "Frase en idioma objetivo",
                                    "traduccion": `Traducción al ${idiomaPrompt}`,
                                    "regla_gramatical": "Nombre de la regla gramatical",
                                    "explicacion_gramatical": "Explicación de la regla",
                                    "palabras": [
                                        {
                                            "palabra": "palabra_en_idioma",
                                            "familia": "familia_semantica",
                                            "tipo": "tipo_gramatical",
                                            "significado": `significado_en_${idiomaPrompt}`
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            },
            "meta": {
                "tema": temaNombre,
                "tema_id": tema?.id || temaId || null,
                "idioma_objetivo": idioma,
                "nombre_idioma_objetivo": nombreIdiomaObjetivo,
                "idioma_prompt": idiomaPrompt,
                "nombre_idioma_prompt": nombreIdiomaPrompt,
                "nivel": nivel,
                "es_jeroglifico": esJeroglifico,
                "onda_indice": indice + 1,
                "num_palabras_nuevas": numPalabrasNuevas,
                "historia_base_id": historiaBase.id,
                "historia_base_titulo": historiaBase.titulo,
                "fecha_generacion": new Date().toISOString(),
                "version": "5.7.3",
                "generado_por": "Pipeline Neuro - Modo Elipse v5.7.3",
                "descripcion_usuario": recuerdo.descripcionUsuario || '',
                "_esOndaCruzada": false // 🔥 Asegurar que las ondas generadas NO sean cruzadas
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
            
            frase.palabras.push({
                "palabra": `[palabra_${j+1}_en_${nombreIdiomaObjetivo}]`,
                "familia": `[familia_semantica]`,
                "tipo": `[tipo_gramatical]`,
                "significado": `[significado_en_${nombreIdiomaPrompt}]`
            });
            
            plantilla.historias[0].frases.push(frase);
        }

        plantilla.palabras_nuevas = [];
        for (let i = 0; i < numPalabrasNuevas; i++) {
            plantilla.palabras_nuevas.push({
                "palabra": `[palabra_nueva_${i+1}_en_${nombreIdiomaObjetivo}]`,
                "significado": `[significado_en_${nombreIdiomaPrompt}]`,
                "familia_semantica": `[familia_semantica]`
            });
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
                    p.pinyin = `[pinyin_de_${p.palabra}]`;
                }
            }
        }

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

        // 🔥 CORREGIDO: Asegurar que temaId sea tratado correctamente (string o número)
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

        const historiasElipse = this._historiasElipse.filter(h => h.temaId === temaIdNumerico);
        const ultimaHistoria = historiasElipse.sort((a, b) => b.indice - a.indice)[0];
        const historiaBaseId = ultimaHistoria ? ultimaHistoria.id : null;

        // 🔥 DETECTAR SI LA ONDA ES CRUZADA
        const esOndaCruzada = data._esOndaCruzada === true || data.meta?._esOndaCruzada === true;

        const historiaObj = {
            titulo: historiaData.titulo || `Onda ${historiasElipse.length + 1}`,
            temaId: temaIdNumerico,
            idioma: idioma,
            nivel: nivel,
            fechaCreacion: new Date().toISOString(),
            estado: 'en_curso',
            frases: historiaData.frases.length,
            _esOnda: !esOndaCruzada, // Si es cruzada, NO es onda de Elipse
            _esOndaCruzada: esOndaCruzada,
            _ondaIndice: historiasElipse.length + 1,
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
            const palabrasData = fraseData.palabras || [];
            
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
                        _ondaIndice: historiasElipse.length + 1
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
                        _ondaIndice: historiasElipse.length + 1
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
                _ondaIndice: historiasElipse.length + 1
            };
            
            await db.guardarFrase(fraseObj);
            totalFrases++;
        }

        const temaActual = await db.obtenerTema(temaIdNumerico);
        if (temaActual) {
            temaActual.historiasIds = [...(temaActual.historiasIds || []), historiaId];
            temaActual.frases = (temaActual.frases || 0) + totalFrases;
            temaActual._elipseActiva = !esOndaCruzada;
            temaActual._ultimaOnda = historiasElipse.length + 1;
            await db.update('temas', temaActual);
        }

        // 🔥 CORREGIDO: Guardar el temaId como string en la onda nueva
        const ondaNueva = {
            id: historiaId,
            titulo: historiaData.titulo || `Onda ${historiasElipse.length + 1}`,
            temaId: String(temaIdNumerico),
            nivel: nivel,
            indice: historiasElipse.length,
            fecha: Date.now(),
            palabrasNuevas: palabrasNuevas.map(p => p.palabra || ''),
            palabrasBase: [],
            historiasPrevias: historiasElipse.map(h => h.id),
            esBase: false,
            rcnPromedio: 0,
            completada: false,
            _sincronizado: false,
            _fechaSincronizacion: null,
            _esOndaCruzada: esOndaCruzada
        };
        
        // 🔥 SOLO añadir a la Elipse si NO es una onda cruzada
        if (!esOndaCruzada) {
            this._historiasElipse.push(ondaNueva);
            this._estadisticas.totalOndas++;
            this._estadisticas.palabrasNuevas += palabrasNuevas.length;
        } else {
            console.log(`🌊 Onda CRUZADA importada, NO se añade a la Elipse`);
        }
        
        // 🔥 CORREGIDO: Guardar el temaId como string en localStorage
        localStorage.setItem('pipeline_elipse_tema_activo', String(temaIdNumerico));
        
        // 🔥 CORREGIDO: Asegurar que _elipseActiva sea string
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
                titulo: historiaData.titulo || `Onda ${historiasElipse.length + 1}`,
                indice: historiasElipse.length,
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
                indice: historiasElipse.length,
                palabrasNuevas: palabrasNuevas.map(p => p.palabra || ''),
                totalPalabrasDesglosadas: totalFrases,
                idioma: idioma,
                esOndaCruzada: esOndaCruzada
            }
        }));

        if (this._core) {
            if (!esOndaCruzada) {
                this._core.mostrarToast(`🌌 Onda ${historiasElipse.length} importada: "${historiaData.titulo}"`, 'success');
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
    // MÉTODOS PÚBLICOS - CORREGIDOS CON FILTRO UNIFICADO
    // ============================================================

    getEstadoElipse(temaId) {
        // 🔥 Usar getHistoriasElipse() que ya filtra
        const historias = this.getHistoriasElipse(temaId);
        if (historias.length === 0) return null;
        
        const ultima = historias.sort((a, b) => b.indice - a.indice)[0];
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

    // 🔥 MÉTODO CORREGIDO: SIEMPRE FILTRA ONDAS CRUZADAS
    getHistoriasElipse(temaId) {
        const historias = this._historiasElipse.filter(h => h.temaId === temaId);
        return this._filtrarOndasElipse(historias);
    }

    getHistoriaElipse(historiaId) {
        const historia = this._historiasElipse.find(h => h.id === historiaId);
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
        // 🔥 Usar getHistoriasElipse() filtrada
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
        
        // Limpiar localStorage específico
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

        // 🔥 Usar getHistoriasElipse() que ya filtra
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
            // 🔥 Usar getHistoriasElipse() que ya filtra
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

console.log('✅ Modo Elipse v5.7.3 - CORREGIDO: FILTRO UNIFICADO DE ONDAS CRUZADAS');
console.log('  🔥 El prompt para la IA externa se genera en el idioma nativo del usuario');
console.log('  🔥 El idioma objetivo para la historia se especifica claramente');
console.log('  🔥 La plantilla incluye campos para ambos idiomas');
console.log('  🔥 Guarda datos por IDIOMA + TEMA en claves separadas');
console.log('  🔥 NO limpia localStorage ni IndexedDB al cambiar de tema');
console.log('  🔥 Puedes cambiar de tema y volver sin perder progreso');
console.log('  🔥 Cada tema mantiene sus propias ondas');
console.log('  🔥 Persistencia por idioma+tema en pipeline_elipse_estado_idioma_[idioma]_tema_[temaId]');
console.log('  🔥 Integración con Modo Ondas Cruzadas');
console.log('  📝 DESCRIPCIÓN OPCIONAL: El usuario puede añadir descripción antes de generar la onda');
console.log('  🔥 La descripción se inyecta en el prompt para la IA externa');
console.log('  🛡️ CORREGIDO: getHistoriasElipse() SIEMPRE filtra ondas cruzadas');
console.log('  🔥 getEstadoElipse() usa getHistoriasElipse() filtrada');
console.log('  🔥 Las ondas cruzadas NO se añaden a la Elipse al importar');
console.log('  ✅ Todas las funcionalidades originales preservadas');