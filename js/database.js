// ============================================================
// DATABASE v17.10 - CON REAPERTURA AUTOMÁTICA
// ============================================================

class Database {
    constructor() {
        this.dbName = 'PipelineDB';
        this.dbVersion = 20;
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
        return new Promise(async (resolve, reject) => {
            try {
                // Verificar y reabrir DB si está cerrada
                await this._verificarYReabrirDB();
                
                if (!this.db || !this.db.objectStoreNames || this.db.objectStoreNames.length === 0) {
                    console.warn('⚠️ Database no disponible, reinicializando...');
                    const reconectado = await this._reconectar();
                    if (!reconectado) {
                        reject(new Error('❌ No se pudo reconectar la base de datos'));
                        return;
                    }
                }
                
                if (!this.db.objectStoreNames.contains(storeName)) {
                    console.warn(`⚠️ Store "${storeName}" no existe, intentando recrear...`);
                    const reconectado = await this._reconectar();
                    if (!reconectado) {
                        reject(new Error(`❌ Store "${storeName}" no existe`));
                        return;
                    }
                    return this._tx(storeName, mode, cb);
                }
                
                const tx = this.db.transaction(storeName, mode);
                const store = tx.objectStore(storeName);
                let result = cb(store);
                
                if (result && typeof result.then === 'function') {
                    result = await result;
                }
                
                tx.oncomplete = () => {
                    resolve(result);
                };
                
                tx.onerror = (event) => {
                    console.error(`❌ Error en transacción ${storeName}:`, event.target.error);
                    reject(tx.error || event.target.error);
                };
                
                tx.onabort = () => {
                    reject(new Error('Transacción abortada'));
                };
                
            } catch (e) {
                console.error(`❌ Error en _tx(${storeName}):`, e);
                reject(e);
            }
        });
    }

    // ============================================================
    // MÉTODOS CRUD (MANTENIDOS)
    // ============================================================

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
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            if (!data) {
                console.warn(`⚠️ update(${store}): data inválida`);
                return null;
            }
            
            if (!data.id) {
                console.warn(`⚠️ update(${store}): data sin id`);
                return null;
            }
            
            return this._tx(store, 'readwrite', s => {
                const req = s.put(data);
                return new Promise((resolve, reject) => {
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => reject(req.error);
                });
            });
        } catch (e) {
            console.error(`❌ Error en update(${store}):`, e);
            return null;
        }
    }

    async delete(store, id) {
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
                f.idioma === frase.idioma
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
        try {
            const tema = await this.obtenerTema(id);
            if (!tema) return false;
            
            const historias = await this.obtenerHistoriasPorTema(id);
            for (const h of historias) {
                const frases = await this.obtenerFrasesPorHistoria(h.id);
                for (const f of frases) {
                    await this.delete('frases', f.id);
                }
                await this.delete('historias', h.id);
            }
            
            await this.delete('temas', id);
            return true;
        } catch (e) {
            console.error(`❌ Error en eliminarTema(${id}):`, e);
            return false;
        }
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
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            if (!progreso || typeof progreso !== 'object') {
                console.warn('⚠️ guardarProgreso: progreso inválido');
                return null;
            }
            
            if (!progreso.fraseId) {
                console.warn('⚠️ guardarProgreso: falta "fraseId"');
                return null;
            }
            
            if (!progreso.idioma) {
                const idiomaActivo = localStorage.getItem('pipeline_idioma_activo');
                progreso.idioma = idiomaActivo || 'es';
            }
            
            const existing = await this.getByIndex('progreso', 'fraseId', progreso.fraseId);
            if (existing.length > 0) {
                await this.update('progreso', { ...existing[0], ...progreso });
                return existing[0];
            }
            return this.add('progreso', progreso);
        } catch (e) {
            console.warn('⚠️ Error guardando progreso:', e);
            return null;
        }
    }

    async obtenerProgreso(fraseId) {
        try {
            if (fraseId === undefined || fraseId === null) {
                return null;
            }
            const result = await this.getByIndex('progreso', 'fraseId', fraseId);
            return result.length > 0 ? result[0] : null;
        } catch (e) {
            console.error(`❌ Error en obtenerProgreso(${fraseId}):`, e);
            return null;
        }
    }

    async obtenerTodoProgreso() {
        try {
            const result = await this.getAll('progreso');
            return Array.isArray(result) ? result : [];
        } catch (e) {
            console.error('❌ Error en obtenerTodoProgreso:', e);
            return [];
        }
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
        try {
            if (!this._initialized) {
                await this.init();
            }
            
            for (const [name, items] of Object.entries(data)) {
                if (!this.stores[name]) continue;
                try {
                    const existing = await this.getAll(name);
                    for (const item of existing) await this.delete(name, item.id);
                    for (const item of items) await this.add(name, item);
                } catch (e) {
                    console.warn(`⚠️ Error importando ${name}:`, e);
                }
            }
            console.log('✅ Backup importado correctamente');
        } catch (e) {
            console.error('❌ Error en importarBackup:', e);
        }
    }

    // ============================================================
    // LIMPIEZA
    // ============================================================
    
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