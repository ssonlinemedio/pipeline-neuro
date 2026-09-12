// ============================================================
// DATABASE v17.10 - CON REAPERTURA AUTOMÁTICA
// ============================================================

class Database {
    constructor() {
        this.dbName = 'PipelineDB';
        this.dbVersion = 21;
        this.db = null;
        this._initialized = false;
        this._initializing = false;
        this._initPromise = null;
        this._idiomaActual = null;
        this._reconectando = false;
        this._intentosReconexion = 0;
        this._maxIntentosReconexion = 3;
        this._dbCerrado = false;
        
        this.stores = {
            usuarios: '++id, nombre, idiomaNativo, idiomasObjetivo, nivel, estiloAprendizaje',
            configuracion: '++id, clave, valor, timestamp, usuarioId',
            frases: '++id, original, traduccion, hanzi, pinyin, transcripcion, familia, tipo, significado, historiaId, rg, rcn, neuroData, esJeroglifico, pinyinCompleto, segmentacion, idioma, nivel, reglaGramatical, tipoRegla, explicacionGramatical',
            palabras: '++id, hanzi, pinyin, transcripcion, familia, tipo, significado, frecuencia, nivelDominio, neuroScore, palabra, idioma, familiaGramatical, familiaSemantica, familias, familiasSemanticas, esCaracterRaiz, esPalabraDerivada, caracterRaiz, numero_trazos, estructura, etimologia_breve, mnemotecnia, variantes, desgloseMorfologico, desgloseCaracteres, asociacionVisual, ejemploFrase, familiaSemanticaPrincipal, temaFamilia, tema',
            historias: '++id, titulo, idioma, nivel, temaId, fechaCreacion, estado, frases',
            temas: '++id, nombre, descripcion, idioma, nivel, icono, fechaCreacion, estado, historiasIds, palabrasClave',
            progreso: '++id, fraseId, fase, rcn, rg, ultimoRepaso, proximoRepaso, estado, neuroMetrics, repasosExitosos, repasosFallidos, intervaloActual, fechaCreacion, idioma',
            progresoCaracteres: '++id, palabraId, idioma',
            checkpoints: '++id, timestamp, fase, datos, neuroState',
            backups: '++id, timestamp, datos',
            chat: '++id, timestamp, rol, mensaje',
            patrones_usuario: '++id, usuarioId, tipo, patron, frecuencia, ultimoUso',
            correcciones_adaptativas: '++id, usuarioId, fraseId, respuestaOriginal, correccionAceptada, variacion, timestamp',
            variaciones_validas: '++id, usuarioId, idioma, palabraOriginal, variacion, frecuencia, ultimoUso',
            metricas_usuario: '++id, usuarioId, precisionPromedio, tiempoPromedio, palabrasPorMinuto, racha, ultimaActividad, totalEjercicios, aciertos, fallos, parciales',
            evaluaciones: '++id, usuarioId, idioma, fecha, nivelActual, nivelAlcanzado, debeSubir, gapAnalysis, metricas, umbralesUsados',
            examenes: '++id, usuarioId, idioma, fecha, nivelEvaluado, preguntas, respuestas, puntuacion, aprobado, bonusAplicado',
            historialNiveles: '++id, usuarioId, idioma, nivelAnterior, nivelNuevo, fecha, motivo',
            reglasGramaticales: '++id, idioma, nivel, tipo, regla, explicacion, ejemplos, frecuencia, fechaCreacion, ultimoUso',
            metricasGramaticales: '++id, usuarioId, idioma, progresoGeneral, reglasDominadas, reglasAprendiendo, reglasPendientes, edadGramatical, ultimaActualizacion',
            perfilesAprendizaje: '++id, usuarioId, nivelConfianza, variaciones, patrones, fechaActualizacion'
        };
        
        this._cache = {
            frases: {},
            palabras: {},
            historias: {},
            temas: {},
            progreso: {}
        };
        this._ultimaCache = 0;
        this._tiempoCache = 5000;
        this._IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        
        // Escuchar eventos de cierre de la DB
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                // No cerramos la DB, solo marcamos
            }
        });
    }

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._IDIOMAS_JEROGLIFICOS.some(item => 
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
    }

    // ============================================================
    // VERIFICAR Y REABRIR DB SI ESTÁ CERRADA
    // ============================================================

    async _verificarYReabrirDB() {
        try {
            // Si la DB está cerrada o no existe, reinicializar
            if (!this.db || this._dbCerrado || !this.db.objectStoreNames || this.db.objectStoreNames.length === 0) {
                console.log('🔄 Database cerrada, reabriendo...');
                this.db = null;
                this._initialized = false;
                await this.init();
                return true;
            }
            
            // Verificar que la DB esté abierta con una operación simple
            try {
                const tx = this.db.transaction('configuracion', 'readonly');
                const store = tx.objectStore('configuracion');
                const req = store.get(1);
                await new Promise((resolve) => {
                    req.onsuccess = () => resolve();
                    req.onerror = () => resolve();
                });
                return true;
            } catch (e) {
                console.warn('⚠️ Database no responde, reabriendo...');
                this.db = null;
                this._initialized = false;
                await this.init();
                return true;
            }
        } catch (error) {
            console.error('❌ Error verificando DB:', error);
            return false;
        }
    }

    async init() {
        if (this._initialized && this.db && this.db.objectStoreNames && this.db.objectStoreNames.length > 0) {
            console.log('✅ Database ya inicializada');
            this._dbCerrado = false;
            return this;
        }
        
        if (this._initializing && this._initPromise) {
            console.log('⏳ Database en proceso de inicialización, esperando...');
            return this._initPromise;
        }
        
        this._initializing = true;
        
        this._initPromise = new Promise(async (resolve, reject) => {
            try {
                console.log('📀 Inicializando Database v17.10...');
                
                if (this.db) {
                    try {
                        this.db.close();
                    } catch (e) {}
                    this.db = null;
                }
                
                await this._abrirDatabase(this.dbVersion);
                
                if (!this.db || this.db.name !== this.dbName) {
                    throw new Error('Database no se abrió correctamente');
                }
                
                for (const storeName of Object.keys(this.stores)) {
                    if (!this.db.objectStoreNames.contains(storeName)) {
                        console.warn(`⚠️ Store "${storeName}" no existe, intentando recrear...`);
                        this.db.close();
                        this.db = null;
                        await this._abrirDatabase(this.dbVersion + 1);
                        break;
                    }
                }
                
                this._initialized = true;
                this._dbCerrado = false;
                console.log('✅ Database v17.10 inicializada correctamente');
                console.log(`   📊 Stores disponibles: ${this.db.objectStoreNames.length}`);
                resolve(this);
                
            } catch (error) {
                console.error('❌ Error inicializando Database:', error);
                this._initialized = false;
                this.db = null;
                reject(error);
            } finally {
                this._initializing = false;
                this._initPromise = null;
            }
        });
        
        return this._initPromise;
    }

    async _abrirDatabase(version) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`📀 Abriendo Database versión ${version}...`);
                
                const req = indexedDB.open(this.dbName, version);
                
                req.onerror = (event) => {
                    console.error('❌ Error abriendo DB:', event.target.error);
                    reject(req.error);
                };
                
                req.onsuccess = (event) => {
                    this.db = event.target.result;
                    this._dbCerrado = false;
                    
                    // Manejar cierre inesperado
                    this.db.onclose = () => {
                        console.warn('⚠️ Database cerrada inesperadamente');
                        this._dbCerrado = true;
                        this._initialized = false;
                        this.db = null;
                    };
                    
                    // Manejar error de versión
                    this.db.onversionchange = () => {
                        console.warn('⚠️ Versión de Database cambiando, cerrando...');
                        this.db.close();
                        this._dbCerrado = true;
                        this._initialized = false;
                        this.db = null;
                    };
                    
                    console.log('✅ Database abierta correctamente');
                    console.log(`   📊 Versión: ${this.db.version}`);
                    console.log(`   📊 Stores: ${Array.from(this.db.objectStoreNames).join(', ')}`);
                    resolve();
                };
                
                req.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    console.log('🔄 Actualizando Database...');
                    
                    for (const [name, keyPath] of Object.entries(this.stores)) {
                        if (!db.objectStoreNames.contains(name)) {
                            console.log(`   📁 Creando store: ${name}`);
                            const store = db.createObjectStore(name, { keyPath: 'id', autoIncrement: true });
                            
                            const indices = keyPath.split(', ').filter(k => k !== '++id');
                            for (const idx of indices) {
                                try {
                                    store.createIndex(idx, idx);
                                    console.log(`     ✅ Índice: ${idx}`);
                                } catch (e) {
                                    console.warn(`     ⚠️ Índice ${idx} ya existe o error:`, e.message);
                                }
                            }
                        }
                        const store = req.transaction.objectStore(name);
                        for (const idx of keyPath.split(', ').filter(k => k !== '++id')) {
                            if (!store.indexNames.contains(idx)) store.createIndex(idx, idx);
                        }
                    }
                    // Conservar el registro antiguo para auditoría; no atribuir a una
                    // frase el resultado que el cliente antiguo marcó como carácter.
                    if (event.oldVersion > 0 && event.oldVersion < 21) {
                        const cursor = req.transaction.objectStore('progreso').openCursor();
                        cursor.onsuccess = () => {
                            const item = cursor.result;
                            if (!item) return;
                            if (item.value.tipo === 'caracter') {
                                const copia = { ...item.value, palabraId: item.value.fraseId,
                                    _origenLegacy: true, _requiereRevision: true };
                                delete copia.id;
                                delete copia.fraseId;
                                req.transaction.objectStore('progresoCaracteres').add(copia);
                            }
                            item.continue();
                        };
                    }
                    
                    console.log('✅ Database actualizada correctamente');
                };
                
                req.onblocked = () => {
                    console.warn('⚠️ Database bloqueada, esperando...');
                    setTimeout(() => {
                        this._abrirDatabase(version).then(resolve).catch(reject);
                    }, 1000);
                };
                
            } catch (error) {
                console.error('❌ Error en _abrirDatabase:', error);
                reject(error);
            }
        });
    }

    async _reconectar() {
        if (this._reconectando) return;
        this._reconectando = true;
        this._intentosReconexion++;
        
        console.log(`🔄 Intentando reconectar Database (intento ${this._intentosReconexion}/${this._maxIntentosReconexion})...`);
        
        try {
            if (this.db) {
                try {
                    this.db.close();
                } catch (e) {}
                this.db = null;
            }
            
            this._initialized = false;
            await this.init();
            this._reconectando = false;
            this._intentosReconexion = 0;
            return true;
        } catch (e) {
            console.error('❌ Error reconectando Database:', e);
            this._reconectando = false;
            
            if (this._intentosReconexion < this._maxIntentosReconexion) {
                const delay = Math.min(2000, 500 * Math.pow(2, this._intentosReconexion));
                console.log(`⏳ Esperando ${delay}ms antes de reintentar...`);
                await new Promise(r => setTimeout(r, delay));
                return this._reconectar();
            }
            
            return false;
        }
    }

    // ============================================================
    // TRANSACCIÓN SEGURA CON REAPERTURA AUTOMÁTICA
    // ============================================================

    async _tx(storeName, mode, cb) {
        await this._verificarYReabrirDB();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, mode);
            let result;
            tx.oncomplete = () => resolve(result);
            tx.onerror = () => reject(tx.error || new Error('Database transaction failed'));
            tx.onabort = () => reject(tx.error || new Error('Database transaction aborted'));
            try {
                Promise.resolve(cb(tx.objectStore(storeName))).then(value => { result = value; }, error => {
                    try { tx.abort(); } catch (_) {}
                    reject(error);
                });
            } catch (error) { tx.abort(); reject(error); }
        });
    }

    async get(store, id) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            if (id === undefined || id === null || id === '') {
                console.warn(`⚠️ get(${store}): ID inválido (${id}), retornando null`);
                return null;
            }
            
            const idValido = typeof id === 'number' ? Math.floor(id) : id;
            
            return this._tx(store, 'readonly', s => {
                const req = s.get(idValido);
                return new Promise((resolve, reject) => {
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => reject(req.error);
                });
            });
        } catch (e) {
            console.error(`❌ Error en get(${store}, ${id}):`, e);
            return null;
        }
    }

    async getByIndex(store, index, value) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            if (value === undefined || value === null || value === '') {
                console.warn(`⚠️ getByIndex(${store}, ${index}): valor inválido (${value}), retornando []`);
                return [];
            }
            
            const result = await this._tx(store, 'readonly', s => {
                try {
                    const req = s.index(index).getAll(value);
                    return new Promise((resolve, reject) => {
                        req.onsuccess = () => resolve(req.result);
                        req.onerror = () => reject(req.error);
                    });
                } catch (e) {
                    return [];
                }
            });
            return Array.isArray(result) ? result : [];
        } catch (e) {
            console.error(`❌ Error en getByIndex(${store}, ${index}):`, e);
            return [];
        }
    }

    async getAll(store) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            const result = await this._tx(store, 'readonly', s => {
                const req = s.getAll();
                return new Promise((resolve, reject) => {
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => reject(req.error);
                });
            });
            return Array.isArray(result) ? result : [];
        } catch (e) {
            console.error(`❌ Error en getAll(${store}):`, e);
            return [];
        }
    }

    async add(store, data) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            if (!data || typeof data !== 'object') {
                console.warn(`⚠️ add(${store}): data inválida`);
                return null;
            }
            
            const cleanData = { ...data };
            delete cleanData.id;
            
            if (Object.keys(cleanData).length === 0) {
                console.warn(`⚠️ add(${store}): data vacía`);
                return null;
            }
            
            return this._tx(store, 'readwrite', s => {
                const req = s.add(cleanData);
                return new Promise((resolve, reject) => {
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => reject(req.error);
                });
            });
        } catch (e) {
            console.error(`❌ Error en add(${store}):`, e);
            return null;
        }
    }

    async update(store, data) {
        if (!data || !data.id) throw new Error('Missing record id');
        if (!this._initialized) await this.init();
        return this._tx(store, 'readwrite', s => new Promise((resolve, reject) => {
            const request = s.get(data.id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const put = s.put({ ...(request.result || {}), ...data });
                put.onsuccess = () => resolve(put.result);
                put.onerror = () => reject(put.error);
            };
        }));
    }

    async delete(store, id) {
        if (['frases', 'historias', 'temas'].includes(store)) return this._eliminarContenido(store, Number(id));
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            if (id === undefined || id === null || id === '') {
                console.warn(`⚠️ delete(${store}): ID inválido (${id})`);
                return null;
            }
            
            return this._tx(store, 'readwrite', s => {
                const req = s.delete(id);
                return new Promise((resolve, reject) => {
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => reject(req.error);
                });
            });
        } catch (e) {
            console.error(`❌ Error en delete(${store}, ${id}):`, e);
            return null;
        }
    }

    // ============================================================
    // API KEY
    // ============================================================
    
    async crearSesionImportacion() {
        if (!this._initialized) await this.init();
        const names = ['temas', 'historias', 'frases', 'palabras', 'reglasGramaticales'];
        const original = {};
        await Promise.all(names.map(async name => { original[name] = await this.getAll(name); }));
        const tablas = Object.fromEntries(names.map(name => [name, new Map(original[name].map(x => [x.id, structuredClone(x)]))]));
        const cambios = new Set();
        const sesion = Object.create(this);
        let nextId = Math.max(Date.now() * 1000, ...names.map(n => Math.max(0, ...original[n].map(x => x.id)) + 1));
        let cerrada = false;
        sesion.getAll = async name => {
            if (!tablas[name]) throw new Error('Unsupported import table: ' + name);
            return structuredClone([...tablas[name].values()]);
        };
        sesion.get = async (name, id) => structuredClone(tablas[name]?.get(Number(id)) || null);
        sesion.getByIndex = async (name, key, value) => (await sesion.getAll(name)).filter(x => x[key] === value);
        sesion.add = async (name, dato) => {
            if (cerrada || !tablas[name] || !dato) throw new Error('Invalid import write');
            const id = nextId++;
            tablas[name].set(id, { ...structuredClone(dato), id });
            cambios.add(name);
            return id;
        };
        sesion.update = async (name, dato) => {
            if (cerrada || !tablas[name] || !dato?.id) throw new Error('Invalid import update');
            tablas[name].set(dato.id, { ...(tablas[name].get(dato.id) || {}), ...structuredClone(dato) });
            cambios.add(name);
            return dato.id;
        };
        sesion.confirmar = async () => {
            if (cerrada) throw new Error('Import already closed');
            cerrada = true;
            if (!cambios.size) return;
            await new Promise((resolve, reject) => {
                // Comprobar también las tablas leídas evita guardar sobre un tema
                // eliminado o modificado mientras se preparaba la importación.
                const tx = this.db.transaction(names, 'readwrite');
                let pendientes = names.length;
                let error;
                tx.oncomplete = resolve;
                tx.onerror = tx.onabort = () => reject(error || tx.error || new Error('Import aborted'));
                for (const name of names) {
                    const req = tx.objectStore(name).getAll();
                    req.onsuccess = () => {
                        if (JSON.stringify(req.result) !== JSON.stringify(original[name])) {
                            error = new Error('Data changed during import. Retry the import.');
                            tx.abort();
                            return;
                        }
                        if (--pendientes) return;
                        try {
                            for (const tabla of cambios) {
                                const previos = new Map(original[tabla].map(x => [x.id, JSON.stringify(x)]));
                                for (const item of tablas[tabla].values()) {
                                    if (previos.get(item.id) !== JSON.stringify(item)) tx.objectStore(tabla).put(item);
                                }
                            }
                        } catch (e) { error = e; tx.abort(); }
                    };
                }
            });
        };
        return sesion;
    }

    validarHistoriasImportadas(historias) {
        if (!Array.isArray(historias) || !historias.length) throw new Error('Invalid stories');
        for (const h of historias) {
            if (!Array.isArray(h.frases) || !h.frases.length) throw new Error('Story has no sentences');
            for (const f of h.frases) {
                if (typeof f.original !== 'string' || !f.original.trim() || typeof f.traduccion !== 'string' || !f.traduccion.trim()) {
                    throw new Error('Incomplete sentence');
                }
                if (/^\s*\[[^\]]+\]\s*$/.test(f.original) || /^\s*\[[^\]]+\]\s*$/.test(f.traduccion)) throw new Error('Empty template');
                if (f.palabras != null && !Array.isArray(f.palabras)) throw new Error('Invalid vocabulary');
            }
        }
    }

    async obtenerContextoTema(temaId) {
        const tema = await this.obtenerTema(Number(temaId));
        if (!tema) throw new Error('Topic not found');
        const [historias, frases, progreso] = await Promise.all([
            this.obtenerHistoriasPorTema(tema.id), this.obtenerFrasesPorIdioma(tema.idioma), this.obtenerProgresoPorIdioma(tema.idioma)
        ]);
        const progresos = new Map(progreso.map(p => [p.fraseId, p]));
        const vocabulario = new Map();
        const normalizar = p => typeof p === 'string' ? p.trim() : String(p?.palabra || p?.hanzi || '').trim();
        const ordenadas = historias.filter(h => h.idioma === tema.idioma).sort((a, b) =>
            (new Date(a.fechaCreacion || 0).getTime() || 0) - (new Date(b.fechaCreacion || 0).getTime() || 0) || a.id - b.id);
        return { tema, historias: ordenadas.map(h => {
            const contenido = frases.filter(f => Number(f.historiaId) === h.id).sort((a, b) => a.id - b.id);
            for (const f of contenido) for (const p of f.palabras || []) {
                const texto = normalizar(p);
                if (texto) vocabulario.set(texto.toLocaleLowerCase(), { palabra: texto, significado: p.significado || '' });
            }
            const rcn = contenido.reduce((n, f) => n + (progresos.get(f.id)?.rcn || 0), 0);
            return { ...h, frases: contenido, texto: contenido.map(f => f.original).join(' '),
                palabrasNuevas: [...new Set((h._palabrasNuevas || []).map(normalizar).filter(Boolean))],
                rcnPromedio: contenido.length ? rcn / contenido.length : 0,
                completada: contenido.length > 0 && contenido.every(f => (progresos.get(f.id)?.rcn || 0) >= 4) };
        }), vocabulario: [...vocabulario.values()] };
    }

    async guardarApiKey(apiKey) {
        console.log('🔐 Guardando API Key...');
        try {
            const key = apiKey.trim();
            if (!key) throw new Error('API Key vacía');
            if (!key.startsWith('gsk_')) {
                throw new Error('API Key debe comenzar con "gsk_"');
            }
            
            const allItems = await this.getAll('configuracion');
            for (const item of allItems) {
                if (item.clave === 'apiKey') {
                    await this.delete('configuracion', item.id);
                }
            }

            await this.add('configuracion', {
                clave: 'apiKey',
                valor: key,
                timestamp: Date.now()
            });

            const saved = await this.obtenerApiKey();
            if (saved === key) {
                console.log('✅ API Key guardada y verificada');
                return true;
            } else {
                console.warn('⚠️ Verificación falló');
                return false;
            }
        } catch (error) {
            console.error('❌ Error guardando API Key:', error.message);
            return false;
        }
    }

    async obtenerApiKey() {
        try {
            const allItems = await this.getAll('configuracion');
            for (const item of allItems) {
                if (item.clave === 'apiKey' && item.valor) {
                    return item.valor;
                }
            }
            return null;
        } catch (error) {
            console.error('❌ Error obteniendo API Key:', error);
            return null;
        }
    }

    // ============================================================
    // USUARIO
    // ============================================================
    
    async getUsuario() {
        try {
            const result = await this.getAll('usuarios');
            if (result.length > 0) {
                return result[0];
            }
            console.log('ℹ️ No se encontró usuario en IndexedDB');
            return null;
        } catch (e) {
            console.error('❌ Error en getUsuario:', e);
            return null;
        }
    }

    async guardarUsuario(datos) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            const existing = await this.getUsuario();
            if (existing) {
                await this.update('usuarios', { ...existing, ...datos });
            } else {
                await this.add('usuarios', datos);
            }
            console.log('✅ Usuario guardado en IndexedDB');
            return true;
        } catch (e) {
            console.error('❌ Error guardando usuario:', e);
            return false;
        }
    }

    // ============================================================
    // CONFIGURACIÓN DE USUARIO
    // ============================================================

    async getConfiguracionUsuario(usuarioId) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            if (usuarioId === undefined || usuarioId === null || usuarioId === '') {
                console.warn('⚠️ getConfiguracionUsuario: usuarioId inválido');
                return null;
            }
            
            const items = await this.getByIndex('configuracion', 'usuarioId', usuarioId);
            return items.length > 0 ? items[0] : null;
        } catch (e) {
            console.error('❌ Error en getConfiguracionUsuario:', e);
            return null;
        }
    }

    async guardarConfiguracionUsuario(config) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            if (!config || !config.usuarioId) {
                console.warn('⚠️ guardarConfiguracionUsuario: falta usuarioId');
                return false;
            }
            
            const existing = await this.getConfiguracionUsuario(config.usuarioId);
            if (existing) {
                await this.update('configuracion', { ...existing, ...config });
            } else {
                await this.add('configuracion', config);
            }
            return true;
        } catch (e) {
            console.error('❌ Error guardando configuración:', e);
            return false;
        }
    }

    // ============================================================
    // PERFIL DE APRENDIZAJE
    // ============================================================

    async obtenerPerfilAprendizaje(usuarioId) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            if (usuarioId === undefined || usuarioId === null) {
                console.warn('⚠️ obtenerPerfilAprendizaje: usuarioId inválido');
                return null;
            }
            
            const items = await this.getByIndex('perfilesAprendizaje', 'usuarioId', usuarioId);
            return items.length > 0 ? items[0] : null;
        } catch (e) {
            console.warn('⚠️ Error obteniendo perfil de aprendizaje:', e);
            return null;
        }
    }

    async guardarPerfilAprendizaje(perfil) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            if (!perfil || !perfil.usuarioId) {
                console.warn('⚠️ guardarPerfilAprendizaje: falta usuarioId');
                return false;
            }
            
            const existing = await this.obtenerPerfilAprendizaje(perfil.usuarioId);
            perfil.fechaActualizacion = Date.now();
            
            if (existing) {
                await this.update('perfilesAprendizaje', { ...existing, ...perfil });
            } else {
                await this.add('perfilesAprendizaje', perfil);
            }
            return true;
        } catch (e) {
            console.warn('⚠️ Error guardando perfil de aprendizaje:', e);
            return false;
        }
    }

    // ============================================================
    // PALABRAS
    // ============================================================
    
    async guardarPalabra(palabra) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            if (!palabra || typeof palabra !== 'object') {
                console.warn('⚠️ guardarPalabra: palabra inválida');
                return null;
            }
            
            const texto = palabra.palabra || palabra.hanzi || '';
            if (!texto) {
                console.warn('⚠️ guardarPalabra: palabra sin texto, omitiendo');
                return null;
            }
            
            if (!palabra.idioma) {
                const usuario = await this.getUsuario();
                const idiomaActivo = localStorage.getItem('pipeline_idioma_activo');
                palabra.idioma = idiomaActivo || usuario?.idiomasObjetivo?.[0]?.idioma || 'es';
            }
            
            const esJeroglifico = this._esJeroglifico(palabra.idioma);
            
            if (esJeroglifico && !palabra.pinyin) {
                palabra.pinyin = palabra.fonetica || palabra.transcripcion || palabra.pronunciacion || '';
            }
            
            const allPalabras = await this.obtenerPalabras();
            const existing = allPalabras.find(p => 
                (p.palabra || p.hanzi || '').toLowerCase() === texto.toLowerCase() && 
                p.idioma === palabra.idioma
            );
            
            if (existing) {
                if (esJeroglifico && palabra.pinyin && !existing.pinyin) {
                    existing.pinyin = palabra.pinyin;
                }
                if (!esJeroglifico && palabra.transcripcion && !existing.transcripcion) {
                    existing.transcripcion = palabra.transcripcion;
                }
                await this.update('palabras', { 
                    ...existing, 
                    frecuencia: (existing.frecuencia || 0) + 1,
                    pinyin: existing.pinyin || palabra.pinyin || '',
                    transcripcion: existing.transcripcion || palabra.transcripcion || ''
                });
                return existing.id;
            }
            
            const id = await this.add('palabras', { 
                ...palabra, 
                neuroScore: 0.5,
                fechaCreacion: Date.now(),
                transcripcion: palabra.transcripcion || ''
            });
            
            if (id) {
                console.log(`✅ Palabra "${texto}" guardada con ID: ${id}`);
            } else {
                console.warn(`⚠️ No se pudo guardar la palabra "${texto}"`);
            }
            return id;
        } catch (e) {
            console.warn('⚠️ Error guardando palabra:', e);
            return null;
        }
    }

    async obtenerPalabras() {
        try {
            const result = await this.getAll('palabras');
            return Array.isArray(result) ? result : [];
        } catch (e) {
            console.error('❌ Error en obtenerPalabras:', e);
            return [];
        }
    }

    async obtenerPalabrasPorIdioma(idioma) {
        try {
            const palabras = await this.obtenerPalabras();
            return palabras.filter(p => p.idioma === idioma);
        } catch (e) {
            console.error(`❌ Error en obtenerPalabrasPorIdioma(${idioma}):`, e);
            return [];
        }
    }

    // ============================================================
    // FRASES
    // ============================================================
    
    async guardarFrase(frase) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            if (!frase || typeof frase !== 'object') {
                console.warn('⚠️ guardarFrase: frase inválida');
                return null;
            }
            
            if (!frase.original) {
                console.warn('⚠️ guardarFrase: falta "original"');
                return null;
            }
            
            if (!frase.idioma) {
                const usuario = await this.getUsuario();
                const idiomaActivo = localStorage.getItem('pipeline_idioma_activo');
                frase.idioma = idiomaActivo || usuario?.idiomasObjetivo?.[0]?.idioma || 'es';
            }
            
            const esJeroglifico = this._esJeroglifico(frase.idioma);
            
            if (esJeroglifico && !frase.pinyinCompleto) {
                frase.pinyinCompleto = frase.pinyin || frase.fonetica || frase.pronunciacion || '';
            }
            
            const allFrases = await this.obtenerFrases();
            const existing = allFrases.find(f => 
                f.original === frase.original && 
                f.idioma === frase.idioma && String(f.historiaId || '') === String(frase.historiaId || '')
            );
            
            if (existing) {
                if (esJeroglifico && frase.pinyinCompleto && !existing.pinyinCompleto) {
                    existing.pinyinCompleto = frase.pinyinCompleto;
                }
                if (esJeroglifico && frase.segmentacion && !existing.segmentacion) {
                    existing.segmentacion = frase.segmentacion;
                }
                if (!esJeroglifico && frase.transcripcion && !existing.transcripcion) {
                    existing.transcripcion = frase.transcripcion;
                }
                await this.update('frases', { ...existing, ...frase });
                return existing.id;
            }
            return this.add('frases', { ...frase, rg: 0, rcn: 0, transcripcion: frase.transcripcion || '' });
        } catch (e) {
            console.warn('⚠️ Error guardando frase:', e);
            return null;
        }
    }

    async obtenerFrases() {
        try {
            const result = await this.getAll('frases');
            return Array.isArray(result) ? result : [];
        } catch (e) {
            console.error('❌ Error en obtenerFrases:', e);
            return [];
        }
    }

    async obtenerFrasesPorIdioma(idioma) {
        try {
            const frases = await this.obtenerFrases();
            return frases.filter(f => f.idioma === idioma);
        } catch (e) {
            console.error(`❌ Error en obtenerFrasesPorIdioma(${idioma}):`, e);
            return [];
        }
    }

    async obtenerFrasesPorHistoria(historiaId) {
        try {
            const frases = await this.obtenerFrases();
            return frases.filter(f => f.historiaId === historiaId);
        } catch (e) {
            console.error(`❌ Error en obtenerFrasesPorHistoria(${historiaId}):`, e);
            return [];
        }
    }

    async obtenerFrasesConReglasGramaticales(idioma) {
        try {
            if (!this._initialized) await this.init();
            const frases = await this.obtenerFrasesPorIdioma(idioma);
            return frases.filter(f => f.reglaGramatical && f.reglaGramatical.length > 0);
        } catch (e) {
            console.error('❌ Error obteniendo frases con reglas:', e);
            return [];
        }
    }

    async getFrasesPorNivelYRegla(idioma, nivel, tipoRegla) {
        try {
            if (!this._initialized) await this.init();
            const frases = await this.obtenerFrasesPorIdioma(idioma);
            return frases.filter(f => 
                (f.nivel || 'A1') === nivel && 
                (f.tipoRegla || '') === tipoRegla &&
                f.reglaGramatical
            );
        } catch (e) {
            console.error('❌ Error obteniendo frases por nivel y regla:', e);
            return [];
        }
    }

    // ============================================================
    // HISTORIAS
    // ============================================================
    
    async guardarHistoria(historia) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            if (!historia || typeof historia !== 'object') {
                console.warn('⚠️ guardarHistoria: historia inválida');
                return null;
            }
            
            if (!historia.idioma) {
                const usuario = await this.getUsuario();
                const idiomaActivo = localStorage.getItem('pipeline_idioma_activo');
                historia.idioma = idiomaActivo || usuario?.idiomasObjetivo?.[0]?.idioma || 'es';
            }
            
            const historiaParaGuardar = { ...historia };
            delete historiaParaGuardar.id;
            
            if (historia.temaId !== undefined && historia.temaId !== null) {
                console.log(`📚 Guardando historia con temaId: ${historia.temaId}`);
            }
            
            return this.add('historias', historiaParaGuardar);
        } catch (e) {
            console.warn('⚠️ Error guardando historia:', e);
            return null;
        }
    }
    
    async obtenerHistorias() {
        try {
            const result = await this.getAll('historias');
            return Array.isArray(result) ? result : [];
        } catch (e) {
            console.error('❌ Error en obtenerHistorias:', e);
            return [];
        }
    }

    async obtenerHistoriasPorIdioma(idioma) {
        try {
            const historias = await this.obtenerHistorias();
            return historias.filter(h => h.idioma === idioma);
        } catch (e) {
            console.error(`❌ Error en obtenerHistoriasPorIdioma(${idioma}):`, e);
            return [];
        }
    }

    async obtenerHistoriasPorTema(temaId) {
        try {
            const historias = await this.obtenerHistorias();
            return historias.filter(h => {
                const hTemaId = typeof h.temaId === 'string' ? parseInt(h.temaId) : h.temaId;
                const temaIdNum = typeof temaId === 'string' ? parseInt(temaId) : temaId;
                return hTemaId === temaIdNum;
            });
        } catch (e) {
            console.error(`❌ Error en obtenerHistoriasPorTema(${temaId}):`, e);
            return [];
        }
    }

    // ============================================================
    // TEMAS
    // ============================================================
    
    async guardarTema(tema) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            if (!tema || typeof tema !== 'object') {
                console.warn('⚠️ guardarTema: tema inválido');
                return null;
            }
            
            if (!tema.nombre) {
                console.warn('⚠️ guardarTema: falta "nombre"');
                return null;
            }
            
            if (!tema.idioma) {
                const usuario = await this.getUsuario();
                const idiomaActivo = localStorage.getItem('pipeline_idioma_activo');
                tema.idioma = idiomaActivo || usuario?.idiomasObjetivo?.[0]?.idioma || 'es';
            }
            
            const temaParaGuardar = { ...tema };
            delete temaParaGuardar.id;
            
            const temas = await this.obtenerTemas();
            const existente = temas.find(t => 
                t.nombre.toLowerCase() === tema.nombre.toLowerCase() && 
                t.idioma === tema.idioma
            );
            
            if (existente) {
                await this.update('temas', { ...existente, ...tema });
                return existente.id;
            }
            
            const idGenerado = await this.add('temas', temaParaGuardar);
            if (idGenerado) {
                console.log(`📚 Tema guardado con ID: ${idGenerado}`);
            } else {
                console.warn(`⚠️ No se pudo guardar el tema "${tema.nombre}"`);
            }
            return idGenerado;
            
        } catch (e) {
            console.warn('⚠️ Error guardando tema:', e);
            return null;
        }
    }

    async obtenerTemas() {
        try {
            const result = await this.getAll('temas');
            return Array.isArray(result) ? result : [];
        } catch (e) {
            console.error('❌ Error en obtenerTemas:', e);
            return [];
        }
    }

    async obtenerTemasPorIdioma(idioma) {
        try {
            const temas = await this.obtenerTemas();
            return temas.filter(t => t.idioma === idioma);
        } catch (e) {
            console.error(`❌ Error en obtenerTemasPorIdioma(${idioma}):`, e);
            return [];
        }
    }

    async obtenerTema(id) {
        try {
            return this.get('temas', id);
        } catch (e) {
            console.error(`❌ Error en obtenerTema(${id}):`, e);
            return null;
        }
    }

    async actualizarTema(id, datos) {
        try {
            const tema = await this.obtenerTema(id);
            if (tema) {
                await this.update('temas', { ...tema, ...datos });
                return true;
            }
            return false;
        } catch (e) {
            console.error(`❌ Error en actualizarTema(${id}):`, e);
            return false;
        }
    }

    async eliminarTema(id) {
        await this._eliminarContenido('temas', Number(id));
        return true;
    }

    async _eliminarContenido(tipo, id) {
        if (!this._initialized) await this.init();
        const names = ['temas', 'historias', 'frases', 'progreso'];
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(names, 'readwrite');
            const data = {};
            let pendientes = names.length;
            tx.oncomplete = () => resolve(true);
            tx.onabort = tx.onerror = () => reject(tx.error || new Error('Delete aborted'));
            for (const name of names) {
                const req = tx.objectStore(name).getAll();
                req.onsuccess = () => {
                    data[name] = req.result;
                    if (--pendientes) return;
                    const historias = new Set(data.historias.filter(h =>
                        tipo === 'temas' ? Number(h.temaId) === id : tipo === 'historias' && h.id === id).map(h => h.id));
                    const frases = new Set(data.frases.filter(f => historias.has(Number(f.historiaId)) ||
                        (tipo === 'frases' && f.id === id)).map(f => f.id));
                    for (const p of data.progreso) if (p.tipo !== 'caracter' && frases.has(Number(p.fraseId))) tx.objectStore('progreso').delete(p.id);
                    for (const f of frases) tx.objectStore('frases').delete(f);
                    for (const h of historias) tx.objectStore('historias').delete(h);
                    for (const tema of data.temas) {
                        if (tipo === 'temas' && tema.id === id) { tx.objectStore('temas').delete(id); continue; }
                        if (data.historias.some(h => historias.has(h.id) && Number(h.temaId) === tema.id)) {
                            const restantes = data.historias.filter(h => Number(h.temaId) === tema.id && !historias.has(h.id));
                            const ids = new Set(restantes.map(h => h.id));
                            tx.objectStore('temas').put({ ...tema, historiasIds: [...ids],
                                frases: data.frases.filter(f => ids.has(Number(f.historiaId)) && !frases.has(f.id)).length });
                        }
                    }
                };
            }
        });
    }

    async obtenerProgresoTema(temaId) {
        try {
            const historias = await this.obtenerHistoriasPorTema(temaId);
            let totalFrases = 0;
            let completadas = 0;
            
            for (const h of historias) {
                const frases = await this.obtenerFrasesPorHistoria(h.id);
                totalFrases += frases.length;
                for (const f of frases) {
                    const prog = await this.obtenerProgreso(f.id);
                    if (prog && (prog.estado === 'completada' || prog.rcn >= 4)) {
                        completadas++;
                    }
                }
            }
            
            return {
                totalFrases,
                completadas,
                progreso: totalFrases > 0 ? Math.round((completadas / totalFrases) * 100) : 0
            };
        } catch (e) {
            console.error(`❌ Error en obtenerProgresoTema(${temaId}):`, e);
            return { totalFrases: 0, completadas: 0, progreso: 0 };
        }
    }

    // ============================================================
    // PROGRESO
    // ============================================================
    
    async guardarProgreso(progreso) {
        if (!progreso || !progreso.fraseId) throw new Error('Missing phrase id');
        if (progreso.tipo === 'caracter') return this.guardarProgresoCaracter({ ...progreso, palabraId: progreso.fraseId });
        const frase = await this.get('frases', Number(progreso.fraseId));
        if (!frase) throw new Error('Progress references a missing phrase');
        const dato = { ...progreso, fraseId: frase.id, idioma: frase.idioma, tipo: 'frase' };
        return this._guardarProgresoUnico('progreso', 'fraseId', dato);
    }

    async _guardarProgresoUnico(store, index, dato) {
        return this._tx(store, 'readwrite', s => new Promise((resolve, reject) => {
            const req = s.index(index).getAll(dato[index]);
            req.onerror = () => reject(req.error);
            req.onsuccess = () => {
                const existentes = req.result.filter(p => store !== 'progreso' || p.tipo !== 'caracter');
                const actualizado = { ...(existentes[0] || {}), ...dato };
                delete actualizado.id;
                if (existentes[0]) actualizado.id = existentes[0].id;
                const put = s.put(actualizado);
                put.onerror = () => reject(put.error);
                put.onsuccess = () => resolve({ ...actualizado, id: put.result });
                for (const extra of existentes.slice(1)) s.delete(extra.id);
            };
        }));
    }

    async obtenerProgresoCaracter(palabraId) {
        const registros = await this.getByIndex('progresoCaracteres', 'palabraId', Number(palabraId));
        return registros[0] || null;
    }

    async guardarProgresoCaracter(progreso) {
        const palabra = await this.get('palabras', Number(progreso.palabraId));
        if (!palabra) throw new Error('Progress references a missing word');
        const dato = { ...progreso, palabraId: palabra.id, idioma: palabra.idioma, tipo: 'caracter' };
        delete dato.fraseId;
        return this._guardarProgresoUnico('progresoCaracteres', 'palabraId', dato);
    }

    async obtenerProgreso(fraseId) {
        try {
            if (fraseId === undefined || fraseId === null) {
                return null;
            }
            const result = await this.getByIndex('progreso', 'fraseId', Number(fraseId));
            return result.find(p => p.tipo !== 'caracter') || null;
        } catch (e) {
            console.error(`❌ Error en obtenerProgreso(${fraseId}):`, e);
            return null;
        }
    }

    async obtenerTodoProgreso() {
        const [registros, frases] = await Promise.all([this.getAll('progreso'), this.obtenerFrases()]);
        const ids = new Set(frases.map(f => f.id));
        return registros.filter(p => p.tipo !== 'caracter' && ids.has(p.fraseId));
    }

    async obtenerProgresoPorIdioma(idioma) {
        try {
            const progreso = await this.obtenerTodoProgreso();
            return progreso.filter(p => p.idioma === idioma);
        } catch (e) {
            console.error(`❌ Error en obtenerProgresoPorIdioma(${idioma}):`, e);
            return [];
        }
    }

    // ============================================================
    // PUNTO DE REANUDACIÓN
    // ============================================================

    async guardarUltimoIndiceEstudio(idioma, indice) {
        try {
            if (!this._initialized) await this.init();
            
            const items = await this.getByIndex('configuracion', 'clave', `ultimoIndice_${idioma}`);
            const data = { indice, fecha: Date.now() };
            
            if (items.length > 0) {
                await this.update('configuracion', { 
                    ...items[0], 
                    valor: JSON.stringify(data),
                    timestamp: Date.now()
                });
            } else {
                await this.add('configuracion', {
                    clave: `ultimoIndice_${idioma}`,
                    valor: JSON.stringify(data),
                    timestamp: Date.now()
                });
            }
            return true;
        } catch (e) {
            console.warn('⚠️ Error guardando índice de estudio:', e);
            return false;
        }
    }

    async obtenerUltimoIndiceEstudio(idioma) {
        try {
            if (!this._initialized) await this.init();
            const items = await this.getByIndex('configuracion', 'clave', `ultimoIndice_${idioma}`);
            if (items.length > 0) {
                return JSON.parse(items[0].valor);
            }
            return null;
        } catch (e) {
            console.warn('⚠️ Error obteniendo índice de estudio:', e);
            return null;
        }
    }

    // ============================================================
    // OBTENER TODO POR IDIOMA
    // ============================================================

    async obtenerTodoPorIdioma(idioma) {
        console.log(`📊 Obteniendo todo el contenido para idioma: ${idioma}`);
        
        try {
            const [frases, palabras, historias, temas, progreso] = await Promise.all([
                this.obtenerFrasesPorIdioma(idioma),
                this.obtenerPalabrasPorIdioma(idioma),
                this.obtenerHistoriasPorIdioma(idioma),
                this.obtenerTemasPorIdioma(idioma),
                this.obtenerProgresoPorIdioma(idioma)
            ]);
            
            const fraseIds = new Set(frases.map(f => f.id));
            const progresoFiltrado = progreso.filter(p => fraseIds.has(p.fraseId));
            
            const resultado = {
                frases,
                palabras,
                historias,
                temas,
                progreso: progresoFiltrado,
                total: {
                    frases: frases.length,
                    palabras: palabras.length,
                    historias: historias.length,
                    temas: temas.length,
                    progreso: progresoFiltrado.length
                }
            };
            
            console.log(`📊 Contenido para "${idioma}":`, resultado.total);
            return resultado;
            
        } catch (e) {
            console.error(`❌ Error en obtenerTodoPorIdioma(${idioma}):`, e);
            return {
                frases: [],
                palabras: [],
                historias: [],
                temas: [],
                progreso: [],
                total: { frases: 0, palabras: 0, historias: 0, temas: 0, progreso: 0 }
            };
        }
    }

    // ============================================================
    // CHAT
    // ============================================================
    
    async guardarMensaje(rol, mensaje) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            return this.add('chat', { timestamp: Date.now(), rol, mensaje });
        } catch (e) {
            console.warn('⚠️ Error guardando mensaje:', e);
            return null;
        }
    }

    async obtenerChat() {
        try {
            const result = await this.getAll('chat');
            return Array.isArray(result) ? result : [];
        } catch (e) {
            console.error('❌ Error en obtenerChat:', e);
            return [];
        }
    }

    // ============================================================
    // CHECKPOINTS
    // ============================================================
    
    async guardarCheckpoint(datos) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            return this.add('checkpoints', { timestamp: Date.now(), ...datos });
        } catch (e) {
            console.warn('⚠️ Error guardando checkpoint:', e);
            return null;
        }
    }

    // ============================================================
    // ESTADÍSTICAS NEURO
    // ============================================================
    
    async obtenerEstadisticasNeuro(idioma) {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            const idiomaFiltro = idioma || localStorage.getItem('pipeline_idioma_activo') || 'es';
            
            const frases = await this.obtenerFrasesPorIdioma(idiomaFiltro);
            const palabras = await this.obtenerPalabrasPorIdioma(idiomaFiltro);
            const progreso = await this.obtenerProgresoPorIdioma(idiomaFiltro);

            const f = Array.isArray(frases) ? frases : [];
            const p = Array.isArray(palabras) ? palabras : [];
            const pr = Array.isArray(progreso) ? progreso : [];

            const completadas = pr.filter(p => p.estado === 'completada').length;
            const rcnTotal = pr.reduce((acc, p) => acc + (p.rcn || 0), 0);
            const rcnPromedio = pr.length > 0 ? rcnTotal / pr.length : 0;
            
            const repasosExitosos = pr.reduce((acc, p) => acc + (p.repasosExitosos || 0), 0);
            const repasosFallidos = pr.reduce((acc, p) => acc + (p.repasosFallidos || 0), 0);
            const eficiencia = (repasosExitosos + repasosFallidos) > 0 
                ? repasosExitosos / (repasosExitosos + repasosFallidos) 
                : 0;

            return {
                totalFrases: f.length,
                totalPalabras: p.length,
                progreso: completadas,
                enCurso: pr.filter(p => p.estado === 'en_curso').length,
                rcnPromedio: Math.round(rcnPromedio * 10) / 10,
                eficiencia: Math.round(eficiencia * 100),
                neuroScore: Math.min(100, Math.round((rcnPromedio / 4) * 100)),
                idioma: idiomaFiltro
            };
        } catch (e) {
            console.error('❌ Error en obtenerEstadisticasNeuro:', e);
            return { totalFrases: 0, totalPalabras: 0, progreso: 0, enCurso: 0, rcnPromedio: 0, eficiencia: 0, neuroScore: 0, idioma: idioma || 'es' };
        }
    }

    // ============================================================
    // BACKUP
    // ============================================================
    
    async exportarBackup() {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            const data = {};
            for (const name of Object.keys(this.stores)) {
                try {
                    const result = await this.getAll(name);
                    data[name] = Array.isArray(result) ? result : [];
                } catch (e) {
                    console.warn(`⚠️ Error exportando ${name}:`, e);
                    data[name] = [];
                }
            }
            return data;
        } catch (e) {
            console.error('❌ Error en exportarBackup:', e);
            return {};
        }
    }

    async importarBackup(data) {
        if (!this._initialized) await this.init();
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid backup');
        const required = ['temas', 'historias', 'frases', 'palabras', 'progreso'];
        if (required.some(name => !Array.isArray(data[name]))) throw new Error('Incomplete backup');
        const copia = structuredClone(data);
        for (const [name, items] of Object.entries(copia)) {
            if (!this.stores[name]) continue;
            if (!Array.isArray(items)) throw new Error('Invalid backup table: ' + name);
            const ids = new Set();
            for (const item of items) {
                if (!item || !Number.isSafeInteger(item.id) || item.id < 1 || ids.has(item.id)) throw new Error('Invalid or duplicate id: ' + name);
                ids.add(item.id);
            }
        }
        const ids = name => new Set(copia[name].map(x => x.id));
        const temas = ids('temas'), historias = ids('historias'), frases = ids('frases'), palabras = ids('palabras');
        if (copia.historias.some(h => h.temaId != null && !temas.has(Number(h.temaId))) ||
            copia.frases.some(f => f.historiaId != null && !historias.has(Number(f.historiaId))) ||
            copia.progreso.some(p => p.tipo !== 'caracter' && !frases.has(Number(p.fraseId)))) {
            throw new Error('Backup contains broken references');
        }
        for (const tema of copia.temas) {
            if ((tema.historiasIds || []).some(id => !historias.has(Number(id)))) throw new Error('Backup contains broken topic references');
        }
        copia.progresoCaracteres = copia.progresoCaracteres || [];
        for (const p of copia.progreso.filter(p => p.tipo === 'caracter')) {
            if (palabras.has(Number(p.fraseId)) && !copia.progresoCaracteres.some(x => x.palabraId === Number(p.fraseId))) {
                const item = { ...p, palabraId: Number(p.fraseId), _origenLegacy: true, _requiereRevision: true };
                delete item.fraseId;
                item.id = Math.max(0, ...copia.progresoCaracteres.map(x => x.id)) + 1;
                copia.progresoCaracteres.push(item);
            }
        }
        if (copia.progresoCaracteres.some(p => !palabras.has(Number(p.palabraId)))) throw new Error('Backup contains broken word references');
        const names = Object.keys(this.stores);
        await new Promise((resolve, reject) => {
            const tx = this.db.transaction(names, 'readwrite');
            const anterior = {};
            let pendientes = names.length;
            tx.oncomplete = resolve;
            tx.onerror = tx.onabort = () => reject(tx.error || new Error('Restore aborted'));
            for (const name of names) {
                const req = tx.objectStore(name).getAll();
                req.onsuccess = () => {
                    if (name !== 'backups') anterior[name] = req.result;
                    if (--pendientes) return;
                    try {
                        for (const tabla of names) {
                            const store = tx.objectStore(tabla);
                            store.clear();
                            for (const item of copia[tabla] || []) store.put(item);
                        }
                        tx.objectStore('backups').add({ nombre: 'Before restore', fecha: Date.now(), timestamp: Date.now(), data: anterior, _seguridad: true });
                    } catch (error) { tx.abort(); reject(error); }
                };
            }
        });
        this._cache = { frases: {}, palabras: {}, historias: {}, temas: {}, progreso: {} };
        return true;
    }

    async limpiarTodo() {
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            for (const name of Object.keys(this.stores)) {
                try {
                    const items = await this.getAll(name);
                    for (const item of items) await this.delete(name, item.id);
                } catch (e) {
                    console.warn(`⚠️ Error limpiando ${name}:`, e);
                }
            }
            console.log('🗑️ Database limpiada completamente');
        } catch (e) {
            console.error('❌ Error en limpiarTodo:', e);
        }
    }

    // ============================================================
    // REGLAS GRAMATICALES
    // ============================================================

    async guardarReglaGramatical(regla) {
        try {
            if (!this._initialized) await this.init();
            
            if (!regla || typeof regla !== 'object') {
                console.warn('⚠️ guardarReglaGramatical: regla inválida');
                return null;
            }
            
            const existentes = await this.obtenerReglasGramaticales(regla.idioma);
            const existente = existentes.find(r => 
                r.tipo === regla.tipo && 
                r.regla.toLowerCase().trim() === regla.regla.toLowerCase().trim()
            );
            
            if (existente) {
                const ejemplosCombinados = [...new Set([...(existente.ejemplos || []), ...(regla.ejemplos || [])])];
                await this.update('reglasGramaticales', {
                    ...existente,
                    frecuencia: (existente.frecuencia || 0) + 1,
                    ultimoUso: Date.now(),
                    ejemplos: ejemplosCombinados
                });
                return existente.id;
            }
            
            return this.add('reglasGramaticales', {
                ...regla,
                frecuencia: 1,
                fechaCreacion: Date.now(),
                ultimoUso: Date.now()
            });
        } catch (e) {
            console.warn('⚠️ Error guardando regla gramatical:', e);
            return null;
        }
    }

    async obtenerReglasGramaticales(idioma) {
        try {
            if (!this._initialized) await this.init();
            const todas = await this.getAll('reglasGramaticales');
            return todas.filter(r => r.idioma === idioma);
        } catch (e) {
            console.error('❌ Error obteniendo reglas gramaticales:', e);
            return [];
        }
    }

    async obtenerMetricasGramaticales(usuarioId, idioma) {
        try {
            if (!this._initialized) await this.init();
            const todas = await this.getByIndex('metricasGramaticales', 'usuarioId', usuarioId);
            return todas.find(m => m.idioma === idioma) || null;
        } catch (e) {
            console.error('❌ Error obteniendo métricas gramaticales:', e);
            return null;
        }
    }

    async guardarMetricasGramaticales(metricas) {
        try {
            if (!this._initialized) await this.init();
            
            const existente = await this.obtenerMetricasGramaticales(metricas.usuarioId, metricas.idioma);
            if (existente) {
                await this.update('metricasGramaticales', { ...existente, ...metricas, ultimaActualizacion: Date.now() });
                return existente.id;
            }
            return this.add('metricasGramaticales', { ...metricas, ultimaActualizacion: Date.now() });
        } catch (e) {
            console.warn('⚠️ Error guardando métricas gramaticales:', e);
            return null;
        }
    }

    // ============================================================
    // FAMILIAS DE CARACTERES
    // ============================================================

    async obtenerFamiliasCaracteres(idioma) {
        try {
            const todasPalabras = await this.obtenerPalabrasPorIdioma(idioma);
            const caracteresRaiz = todasPalabras.filter(p => p.esCaracterRaiz === true);
            const familias = [];

            for (const cr of caracteresRaiz) {
                const derivadas = todasPalabras.filter(p => 
                    p.esPalabraDerivada && p.caracterRaiz === cr.palabra
                );
                familias.push({
                    caracterRaiz: cr,
                    palabrasDerivadas: derivadas,
                    total: derivadas.length
                });
            }

            return familias;
        } catch (e) {
            console.error('❌ Error obteniendo familias de caracteres:', e);
            return [];
        }
    }

    async obtenerCaracterRaiz(simbolo, idioma) {
        try {
            const todasPalabras = await this.obtenerPalabrasPorIdioma(idioma);
            return todasPalabras.find(p => 
                p.esCaracterRaiz === true && 
                (p.palabra || p.hanzi || '') === simbolo
            );
        } catch (e) {
            console.error('❌ Error obteniendo carácter raíz:', e);
            return null;
        }
    }

    async obtenerPalabrasDerivadas(caracterRaiz, idioma) {
        try {
            const todasPalabras = await this.obtenerPalabrasPorIdioma(idioma);
            return todasPalabras.filter(p => 
                p.esPalabraDerivada === true && 
                p.caracterRaiz === caracterRaiz
            );
        } catch (e) {
            console.error('❌ Error obteniendo palabras derivadas:', e);
            return [];
        }
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

const db = new Database();

console.log('✅ Database v17.10 - CON REAPERTURA AUTOMÁTICA');
console.log('  🔥 Reabre la DB automáticamente si está cerrada');
console.log('  🔥 Manejo de errores de conexión');
console.log('  🔥 Reconexión automática con backoff');
console.log('  📝 Campos: transcripcion en frases y palabras');
console.log('  🔄 Compatibilidad con pinyin existente');
