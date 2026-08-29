// ============================================================
// UI CONFIG v24.4 - CORREGIDO PARA APK: CARGA DE ARCHIVOS LOCALES
// - Usa XMLHttpRequest para archivos locales en APK
// - Múltiples rutas de búsqueda (assets/data/, www/data/, etc.)
// - Fallback con fetch para servidores HTTP
// - Detección de modo APK (file:// protocol)
// - Instrucciones claras para desglose COMPLETO de palabras en Super Power
// - Persistencia de idioma corregida
// - Importación de temas por niveles con códigos ISO
// - Modal de importación con SPINNER, BARRA PROGRESO y ANIMACIONES
// - Super Power importa SIEMPRE como "En Curso"
// ============================================================

class UIConfig {
    constructor() {
        this._ultimoGapAnalysis = null;
        this._examenNivelActual = null;
        this._editandoIdioma = null;
        this._modalIdiomaAbierto = false;
        this._eventosConfigurados = false;
        this._recargando = false;
        this._validandoIdioma = false;
        this._examenActivo = false;
        this._cambiandoIdioma = false;
        this._generandoSuperJSON = false;
        this._actualizandoVersiones = false;
        this._ultimaActualizacionVersiones = 0;
        
        // PROPIEDADES PARA IMPORTACIÓN DE TEMAS POR NIVELES
        this._importandoTemasNivel = false;
        this._archivosDisponibles = [];
        this._archivosSeleccionados = new Set();
        this._importacionResultados = [];
        this._carpetaData = 'data/';
        this._archivosCargados = false;
        this._rutaEncontrada = null;
        this._esModoAPK = false;
        
        this._NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        this._NIVEL_ICONOS = { 'A1': '🌱', 'A2': '🌿', 'B1': '🌳', 'B2': '🌲', 'C1': '🏔️', 'C2': '🗻' };
        this._NIVEL_COLORES = { 'A1': '#6C5CE7', 'A2': '#0984E3', 'B1': '#00B894', 'B2': '#FDCB6E', 'C1': '#E17055', 'C2': '#FD79A8' };
        this._logrosDesbloqueados = new Set();
        
        // 🔥 MAPA DE NOMBRES DE IDIOMA A CÓDIGOS ISO
        this._MAP_NOMBRE_A_ISO = {
            'chino': 'zh',
            'español': 'es',
            'es': 'es',
            'ingles': 'en',
            'inglés': 'en',
            'en': 'en',
            'frances': 'fr',
            'francés': 'fr',
            'fr': 'fr',
            'aleman': 'de',
            'alemán': 'de',
            'de': 'de',
            'italiano': 'it',
            'it': 'it',
            'portugues': 'pt',
            'portugués': 'pt',
            'pt': 'pt',
            'japones': 'ja',
            'japonés': 'ja',
            'ja': 'ja',
            'coreano': 'ko',
            'ko': 'ko',
            'ruso': 'ru',
            'ru': 'ru',
            'arabe': 'ar',
            'árabe': 'ar',
            'ar': 'ar',
            'hindi': 'hi',
            'hi': 'hi',
            'chinese': 'zh',
            'english': 'en',
            'spanish': 'es',
            'french': 'fr',
            'german': 'de',
            'italian': 'it',
            'portuguese': 'pt',
            'japanese': 'ja',
            'korean': 'ko',
            'russian': 'ru',
            'arabic': 'ar'
        };
        
        // 🔥 CLAVES PARA PERSISTENCIA DEL IDIOMA
        this._KEY_IDIOMA_ACTIVO = 'pipeline_idioma_activo';
        this._KEY_IDIOMA_SELECCIONADO = 'pipeline_idioma_seleccionado';
        this._KEY_USUARIO = 'pipeline_usuario';
        
        this._FAMILIAS_SEMANTICAS = [
            'Transporte', 'Comida y Bebida', 'Familia', 'Casa y Hogar',
            'Ropa', 'Animales', 'Naturaleza', 'Tiempo y Clima',
            'Salud', 'Trabajo', 'Educación', 'Deportes',
            'Arte', 'Música', 'Tecnología', 'Viajes',
            'Compras', 'Comunicación', 'Emociones', 'Rutina',
            'Ciudad', 'Cultura', 'Historia', 'Ciencia'
        ];
        
        this._IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        this._LOGROS_BASE = {
            'primer_estudio': { nombre: '🌟 Primer Estudio', desc: 'Estudia tu primer carácter', icono: '🌟' },
            '3_estudios': { nombre: '📚 3 Estudios', desc: 'Estudia 3 caracteres diferentes', icono: '📚' },
            '10_estudios': { nombre: '🎓 10 Estudios', desc: 'Estudia 10 caracteres diferentes', icono: '🎓' },
            '5_palabras': { nombre: '📝 5 Palabras', desc: 'Aprende 5 palabras derivadas', icono: '📝' },
            '20_palabras': { nombre: '📖 20 Palabras', desc: 'Aprende 20 palabras derivadas', icono: '📖' },
            '50_palabras': { nombre: '🏆 50 Palabras', desc: 'Aprende 50 palabras derivadas', icono: '🏆' }
        };
        
        this._TEMAS_PREDEFINIDOS = {
            'v2.0': {
                'A1': ['Mi familia', 'La casa y el hogar', 'Comida y bebida', 'Mi rutina diaria', 'La ciudad y el barrio', 'La ropa y los colores', 'El tiempo y las estaciones', 'Los animales'],
                'A2': ['Viajes y transportes', 'Compras y tiendas', 'Salud y medicina', 'Deportes y ocio', 'Trabajo y profesiones', 'Música y cultura', 'Comunicación y tecnología', 'El medio ambiente'],
                'B1': ['Relaciones personales', 'Educación y aprendizaje', 'Medios de comunicación', 'Turismo y patrimonio', 'Tecnología y futuro', 'Gastronomía internacional', 'Arte y creatividad', 'Eventos históricos'],
                'B2': ['Política y sociedad', 'Economía y finanzas', 'Ciencia e investigación', 'Filosofía y pensamiento', 'Psicología y comportamiento', 'Globalización e interculturalidad', 'Desarrollo sostenible', 'Literatura y narrativa'],
                'C1': ['Crítica cultural', 'Retórica y argumentación', 'Antropología social', 'Investigación académica', 'Análisis del discurso'],
                'C2': ['Especialización académica', 'Debate y oratoria', 'Creación literaria', 'Análisis crítico avanzado']
            },
            'v3.0': {
                'A1': ['Mi familia', 'La casa y el hogar', 'Comida y bebida', 'Mi rutina diaria', 'La ciudad y el barrio', 'La ropa y los colores', 'El tiempo y las estaciones', 'Los animales', 'La tecnología básica', 'Salud y cuidados', 'Ocio y entretenimiento', 'Naturaleza y paisajes'],
                'A2': ['Viajes y transportes', 'Compras y tiendas', 'Salud y medicina', 'Deportes y ocio', 'Trabajo y profesiones', 'Música y cultura', 'Comunicación y tecnología', 'El medio ambiente', 'Restaurantes y comidas', 'Eventos y celebraciones', 'La escuela y el estudio', 'La ciudad moderna'],
                'B1': ['Relaciones personales', 'Educación y aprendizaje', 'Medios de comunicación', 'Turismo y patrimonio', 'Tecnología y futuro', 'Gastronomía internacional', 'Arte y creatividad', 'Eventos históricos', 'Psicología y emociones', 'Medio ambiente y ecología'],
                'B2': ['Política y sociedad', 'Economía y finanzas', 'Ciencia e investigación', 'Filosofía y pensamiento', 'Psicología y comportamiento', 'Globalización e interculturalidad', 'Desarrollo sostenible', 'Literatura y narrativa', 'Derechos humanos y justicia', 'Innovación y emprendimiento'],
                'C1': ['Crítica cultural', 'Retórica y argumentación', 'Antropología social', 'Investigación académica', 'Análisis del discurso', 'Filosofía política'],
                'C2': ['Especialización académica', 'Debate y oratoria', 'Creación literaria', 'Análisis crítico avanzado', 'Teoría del conocimiento']
            }
        };
        this._VERSION_DEFECTO = 'v3.0';
        
        // 🔥 DETECTAR MODO APK
        this._detectarModoAPK();
    }

    // ============================================================
    // DETECTAR MODO APK
    // ============================================================
    
    _detectarModoAPK() {
        this._esModoAPK = window.location && window.location.protocol === 'file:';
        if (this._esModoAPK) {
            console.log('📱 Modo APK detectado');
        }
    }

    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._IDIOMAS_JEROGLIFICOS.some(item =>
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

    // 🔥 OBTENER CÓDIGO ISO REAL DESDE EL IDIOMA
    _obtenerCodigoIso(idioma) {
        if (!idioma) return 'es';
        
        const idiomaLower = idioma.toLowerCase().trim();
        
        // Si ya es un código ISO de 2 letras, devolverlo
        if (/^[a-z]{2}$/.test(idiomaLower)) {
            return idiomaLower;
        }
        
        // Buscar en el mapa de nombres a códigos ISO
        if (this._MAP_NOMBRE_A_ISO[idiomaLower]) {
            return this._MAP_NOMBRE_A_ISO[idiomaLower];
        }
        
        // Intentar obtener el código ISO del gestor de idiomas
        if (window.gestorIdiomas && typeof window.gestorIdiomas.obtenerCodigoIso === 'function') {
            const iso = window.gestorIdiomas.obtenerCodigoIso(idioma);
            if (iso) return iso;
        }
        
        // Fallback: usar el idioma como está
        return idioma;
    }

    // 🔥 OBTENER IDIOMA ACTIVO CON PERSISTENCIA
    _obtenerIdiomaActivoPersistente() {
        try {
            // 1. Intentar obtener del gestor de idiomas
            if (window.gestorIdiomas && typeof window.gestorIdiomas.getIdiomaActivo === 'function') {
                const idioma = window.gestorIdiomas.getIdiomaActivo();
                if (idioma) {
                    localStorage.setItem(this._KEY_IDIOMA_ACTIVO, idioma);
                    return idioma;
                }
            }
            
            // 2. Intentar obtener de localStorage (persistencia entre recargas)
            const localIdioma = localStorage.getItem(this._KEY_IDIOMA_ACTIVO);
            if (localIdioma) {
                console.log(`📌 Idioma recuperado de localStorage: ${localIdioma}`);
                return localIdioma;
            }
            
            // 3. Intentar obtener del usuario en IndexedDB
            const usuarioLocal = localStorage.getItem(this._KEY_USUARIO);
            if (usuarioLocal) {
                try {
                    const parsed = JSON.parse(usuarioLocal);
                    if (parsed.idiomasObjetivo && parsed.idiomasObjetivo.length > 0) {
                        const idioma = parsed.idiomasObjetivo[0].idioma;
                        localStorage.setItem(this._KEY_IDIOMA_ACTIVO, idioma);
                        return idioma;
                    }
                } catch (e) {}
            }
            
            // 4. Fallback: español
            return 'es';
        } catch (e) {
            console.warn('⚠️ Error obteniendo idioma activo:', e);
            return 'es';
        }
    }

    // 🔥 GUARDAR IDIOMA ACTIVO CON PERSISTENCIA
    async _guardarIdiomaActivoPersistente(idioma) {
        try {
            console.log(`💾 Guardando idioma activo: ${idioma}`);
            
            // 1. Guardar en localStorage
            localStorage.setItem(this._KEY_IDIOMA_ACTIVO, idioma);
            localStorage.setItem(this._KEY_IDIOMA_SELECCIONADO, idioma);
            
            // 2. Guardar en gestor de idiomas
            if (window.gestorIdiomas && typeof window.gestorIdiomas.cambiarIdioma === 'function') {
                await window.gestorIdiomas.cambiarIdioma(idioma);
            }
            
            // 3. Guardar en el usuario de IndexedDB
            try {
                const usuario = await db.getUsuario();
                if (usuario) {
                    if (!usuario.idiomasObjetivo) {
                        usuario.idiomasObjetivo = [];
                    }
                    
                    // Verificar si el idioma ya existe en la lista
                    const existente = usuario.idiomasObjetivo.find(i => i.idioma === idioma);
                    if (!existente) {
                        usuario.idiomasObjetivo.push({
                            idioma: idioma,
                            nivel: 'A1',
                            versionEstandar: 'v3.0'
                        });
                    }
                    
                    // Marcar este idioma como activo
                    usuario.idiomaActivo = idioma;
                    await db.guardarUsuario(usuario);
                    
                    // Actualizar localStorage
                    localStorage.setItem(this._KEY_USUARIO, JSON.stringify(usuario));
                    console.log(`✅ Usuario actualizado con idioma activo: ${idioma}`);
                }
            } catch (e) {
                console.warn('⚠️ Error guardando en IndexedDB:', e);
            }
            
            // 4. Disparar evento de cambio de idioma
            window.dispatchEvent(new CustomEvent('idiomaCambiado', {
                detail: { 
                    idioma: idioma,
                    persistente: true,
                    timestamp: Date.now()
                }
            }));
            
            console.log(`✅ Idioma "${idioma}" guardado persistentemente`);
            
        } catch (error) {
            console.error('❌ Error guardando idioma activo:', error);
        }
    }

    // 🔥 SINCRONIZAR IDIOMA EN CARGA INICIAL
    async _sincronizarIdiomaInicial() {
        try {
            let idioma = localStorage.getItem(this._KEY_IDIOMA_ACTIVO);
            
            if (!idioma && window.gestorIdiomas) {
                idioma = window.gestorIdiomas.getIdiomaActivo();
                if (idioma) {
                    localStorage.setItem(this._KEY_IDIOMA_ACTIVO, idioma);
                }
            }
            
            if (!idioma) {
                const usuario = await db.getUsuario();
                if (usuario && usuario.idiomasObjetivo && usuario.idiomasObjetivo.length > 0) {
                    idioma = usuario.idiomasObjetivo[0].idioma;
                    localStorage.setItem(this._KEY_IDIOMA_ACTIVO, idioma);
                } else {
                    idioma = 'es';
                    localStorage.setItem(this._KEY_IDIOMA_ACTIVO, idioma);
                }
            }
            
            if (window.gestorIdiomas && idioma !== window.gestorIdiomas.getIdiomaActivo()) {
                await window.gestorIdiomas.cambiarIdioma(idioma);
            }
            
            console.log(`🔄 Idioma inicial sincronizado: ${idioma}`);
            return idioma;
            
        } catch (error) {
            console.warn('⚠️ Error sincronizando idioma inicial:', error);
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

    _obtenerIdiomaNativo() {
        try {
            const usuario = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
            return usuario.idiomaNativo || 'español';
        } catch (e) {
            return 'español';
        }
    }

    _getCore() {
        if (this.core) return this.core;
        if (window.uiCore) return window.uiCore;
        return null;
    }

    // ============================================================
    // OBTENER VERSIONES
    // ============================================================

    _obtenerVersionesDisponibles(idioma) {
        if (window.gestorIdiomas && typeof window.gestorIdiomas.obtenerVersionesDisponibles === 'function') {
            return window.gestorIdiomas.obtenerVersionesDisponibles(idioma);
        }
        return [
            { id: 'v2.0', nombre: 'HSK 2.0 (Clásico)' },
            { id: 'v3.0', nombre: 'HSK 3.0 (Nuevo)' }
        ];
    }

    _obtenerVersionActiva(idioma) {
        if (window.gestorIdiomas && typeof window.gestorIdiomas.obtenerVersionActiva === 'function') {
            return window.gestorIdiomas.obtenerVersionActiva(idioma);
        }
        return 'v3.0';
    }

    _obtenerNombreVersion(idioma, version) {
        if (window.gestorIdiomas && typeof window.gestorIdiomas.obtenerNombreVersion === 'function') {
            return window.gestorIdiomas.obtenerNombreVersion(idioma, version);
        }
        const nombres = { 'v2.0': 'HSK 2.0', 'v3.0': 'HSK 3.0' };
        return nombres[version] || version;
    }

    _obtenerDescripcionVersion(idioma, version) {
        if (window.gestorIdiomas && typeof window.gestorIdiomas.obtenerDescripcionVersion === 'function') {
            return window.gestorIdiomas.obtenerDescripcionVersion(idioma, version);
        }
        const descripciones = { 'v2.0': '150 palabras en A1, 300 en A2', 'v3.0': '500 palabras en A1, 1200 en A2', 'v1.0': 'Estándar MCER' };
        return descripciones[version] || '';
    }

    async _cambiarVersionIdioma(idioma, nuevaVersion) {
        try {
            const result = await window.gestorIdiomas.cambiarVersionIdioma(idioma, nuevaVersion);
            if (result) {
                this._core?.mostrarToast(`✅ Versión de "${idioma}" cambiada a ${nuevaVersion}`, 'success');
                await this._recargarConfiguracion();
                if (window.UITemas) { await window.UITemas._renderTemas(); }
                if (window.UIJSON) { window.UIJSON._actualizarIdiomaYNivel(); }
            } else {
                this._core?.mostrarToast('❌ Error cambiando versión', 'error');
            }
        } catch (e) {
            console.error('❌ Error:', e);
            this._core?.mostrarToast('❌ Error: ' + e.message, 'error');
        }
    }

    // ============================================================
    // ACTUALIZAR VERSIONES DE IDIOMAS
    // ============================================================

    async _actualizarVersionesIdiomas(forzar = false) {
        if (this._actualizandoVersiones) {
            this.core?.mostrarToast('⏳ Ya hay una actualización en curso...', 'info');
            return;
        }
        if (!window.vigia || !window.vigia.enLinea) {
            this.core?.mostrarToast('❌ Vigía está offline. Conéctate a internet para actualizar.', 'error');
            return;
        }
        this._actualizandoVersiones = true;
        this.core?.mostrarToast('🔍 Buscando últimas versiones de idiomas...', 'info');
        try {
            const resultados = await window.gestorIdiomas.actualizarTodasLasVersiones(forzar);
            if (!resultados || resultados.length === 0) {
                this.core?.mostrarToast('ℹ️ No hay idiomas para actualizar', 'info');
                this._actualizandoVersiones = false;
                return;
            }
            const exitos = resultados.filter(r => r.exito).length;
            const fallos = resultados.filter(r => !r.exito).length;
            let mensaje = `✅ Actualización completada\n\n📊 ${exitos} idiomas actualizados correctamente\n`;
            if (fallos > 0) mensaje += `⚠️ ${fallos} idiomas no se pudieron actualizar\n`;
            for (const r of resultados) {
                if (r.exito && r.version) {
                    mensaje += `\n🌍 ${r.idioma}: ${r.version.nombre || r.version.version}`;
                }
            }
            this.core?.alert(mensaje, '📊 Actualización de Versiones');
            this._ultimaActualizacionVersiones = Date.now();
            await this._recargarConfiguracion();
            if (window.UITemas) { await window.UITemas._renderTemas(); }
        } catch (error) {
            console.error('❌ Error actualizando versiones:', error);
            this.core?.mostrarToast('❌ Error: ' + error.message, 'error');
        } finally {
            this._actualizandoVersiones = false;
        }
    }

    async _verificarActualizacionesDisponibles() {
        if (!window.vigia || !window.vigia.enLinea) {
            this.core?.mostrarToast('⚠️ Vigía offline. Conéctate para verificar.', 'warning');
            return;
        }
        this.core?.mostrarToast('🔍 Verificando actualizaciones disponibles...', 'info');
        try {
            const actualizaciones = await window.gestorIdiomas.verificarActualizacionesDisponibles();
            if (!actualizaciones || actualizaciones.length === 0) {
                this.core?.mostrarToast('✅ Todos los idiomas están actualizados.', 'success');
                return;
            }
            let mensaje = `📢 Actualizaciones disponibles:\n\n`;
            for (const act of actualizaciones) {
                mensaje += `🌍 ${act.idioma}\n   📌 ${act.versionActual} → ${act.versionNueva}\n   📝 ${act.nombreVersion}\n   💡 ${act.descripcion || 'Actualización disponible'}\n\n`;
            }
            mensaje += `¿Quieres actualizar todos los idiomas ahora?`;
            const confirmar = await this.core?.confirm(mensaje, '📢 Actualizaciones Disponibles');
            if (confirmar) {
                await this._actualizarVersionesIdiomas(true);
                if (window.UITemas) { setTimeout(() => window.UITemas._renderTemas(), 300); }
            }
        } catch (error) {
            console.error('❌ Error verificando actualizaciones:', error);
            this.core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init(core) {
        this.core = core;
        if (!this._eventosConfigurados) {
            this._configurarEventosSincronizacion();
            this._eventosConfigurados = true;
        }
        return this;
    }

    cargar(core) {
        this.core = core;
        this._cargarConfiguracion();
    }

    // ============================================================
    // CONFIGURAR EVENTOS DE SINCRONIZACIÓN
    // ============================================================
    
    _configurarEventosSincronizacion() {
        console.log('🔗 Configurando sincronización de idiomas...');
        window.addEventListener('idiomaCambiado', async (e) => {
            console.log('🔄 Configuración detectó cambio de idioma:', e.detail?.idioma);
            await this._recargarConfiguracion();
        });
        window.addEventListener('idiomaAgregado', async (e) => {
            console.log('🔄 Configuración detectó idioma agregado:', e.detail?.idioma);
            await this._recargarConfiguracion();
        });
        window.addEventListener('idiomaEliminado', async (e) => {
            console.log('🔄 Configuración detectó idioma eliminado:', e.detail?.idioma);
            await this._recargarConfiguracion();
        });
        window.addEventListener('nivelIdiomaCambiado', async (e) => {
            console.log('🔄 Configuración detectó cambio de nivel:', e.detail?.idioma, e.detail?.nivel);
            await this._recargarConfiguracion();
        });
        window.addEventListener('idiomaNativoCambiado', async (e) => {
            console.log('🔄 Configuración detectó cambio de idioma nativo:', e.detail?.idiomaNativo);
            await this._recargarConfiguracion();
            if (modoInverso) {
                modoInverso._idiomaNativo = e.detail?.idiomaNativo?.nombre || 'es';
            }
        });
        window.addEventListener('tutorModoCambiado', (e) => {
            if (this._recargando) return;
            this._cargarConfiguracion();
        });
        window.addEventListener('versionIdiomaCambiada', async (e) => {
            console.log('🔄 Configuración detectó cambio de versión:', e.detail?.idioma, e.detail?.versionNueva);
            await this._recargarConfiguracion();
            if (window.UITemas) { await window.UITemas._renderTemas(); }
            if (window.UIJSON) { window.UIJSON._actualizarIdiomaYNivel(); }
        });
        window.addEventListener('versionIdiomaActualizada', async (e) => {
            console.log('🔄 Versión actualizada desde Groq:', e.detail?.idioma, e.detail?.nombreVersion);
            await this._recargarConfiguracion();
            if (window.UITemas) { setTimeout(() => window.UITemas._renderTemas(), 300); }
        });
        console.log('✅ Sincronización de idiomas configurada');
    }

    // ============================================================
    // RECARGAR CONFIGURACIÓN - CORREGIDA CON PERSISTENCIA
    // ============================================================
    
    async _recargarConfiguracion() {
        if (this._recargando) {
            console.log('⏳ Ya está recargando');
            return;
        }
        
        this._recargando = true;
        console.log('🔄 Recargando configuración...');
        
        try {
            // 🔥 CARGAR IDIOMA PERSISTENTE
            const idiomaPersistente = localStorage.getItem(this._KEY_IDIOMA_ACTIVO) || 'es';
            
            await gestorIdiomas._cargarIdiomas();
            await gestorIdiomas._cargarIdiomasNativos();
            
            // 🔥 VERIFICAR Y CORREGIR IDIOMA ACTIVO
            const idiomas = gestorIdiomas.getIdiomas();
            let idiomaActivo = gestorIdiomas.getIdiomaActivo();
            
            if (idiomaActivo !== idiomaPersistente) {
                const idiomaExiste = idiomas.some(i => i.idioma === idiomaPersistente);
                if (idiomaExiste) {
                    await gestorIdiomas.cambiarIdioma(idiomaPersistente);
                    idiomaActivo = idiomaPersistente;
                } else if (idiomas.length > 0) {
                    await gestorIdiomas.cambiarIdioma(idiomas[0].idioma);
                    idiomaActivo = idiomas[0].idioma;
                    localStorage.setItem(this._KEY_IDIOMA_ACTIVO, idiomaActivo);
                } else {
                    const usuarioLocal = localStorage.getItem('pipeline_usuario');
                    if (usuarioLocal) {
                        try {
                            const parsed = JSON.parse(usuarioLocal);
                            if (parsed.idiomasObjetivo && parsed.idiomasObjetivo.length > 0) {
                                const idiomaDefault = parsed.idiomasObjetivo[0].idioma;
                                localStorage.setItem(this._KEY_IDIOMA_ACTIVO, idiomaDefault);
                                idiomaActivo = idiomaDefault;
                            }
                        } catch (e) {}
                    }
                }
            }
            
            if (idiomaActivo) {
                localStorage.setItem(this._KEY_IDIOMA_ACTIVO, idiomaActivo);
                localStorage.setItem(this._KEY_IDIOMA_SELECCIONADO, idiomaActivo);
            }
            
            await this._cargarConfiguracion();
            
            if (window.uiCore && window.uiCore._actualizarIndicadoresSeguro) {
                window.uiCore._actualizarIndicadoresSeguro();
            }
            
            this._actualizarNivelHeader();
            console.log(`✅ Configuración recargada correctamente. Idioma: ${idiomaActivo}`);
            
        } catch (error) {
            console.error('❌ Error recargando configuración:', error);
        } finally {
            this._recargando = false;
        }
    }

    // ============================================================
    // CARGA PRINCIPAL DE CONFIGURACIÓN - CORREGIDA CON PERSISTENCIA
    // ============================================================
    
    async _cargarConfiguracion() {
        const container = document.getElementById('configContent');
        if (!container) return;

        // 🔥 SINCRONIZAR IDIOMA INICIAL
        const idiomaSincronizado = await this._sincronizarIdiomaInicial();
        
        // 🔥 OBTENER IDIOMA ACTIVO DE FORMA PERSISTENTE
        const activo = this._obtenerIdiomaActivoPersistente();
        
        if (activo !== idiomaSincronizado) {
            await this._guardarIdiomaActivoPersistente(idiomaSincronizado);
        }

        const usuario = await db.getUsuario();
        const idiomas = gestorIdiomas.getIdiomas();
        
        if (window.gestorIdiomas) {
            const gestorActivo = window.gestorIdiomas.getIdiomaActivo();
            if (gestorActivo !== activo) {
                await window.gestorIdiomas.cambiarIdioma(activo);
            }
        }
        
        const idiomasNativos = await gestorIdiomas.obtenerIdiomasNativos();
        const stats = await db.obtenerEstadisticasNeuro(activo);
        const progreso = await db.obtenerTodoProgreso();
        const temas = await db.obtenerTemasPorIdioma(activo);
        const historias = await db.obtenerHistoriasPorIdioma(activo);
        const nivelReal = this._obtenerNivelRealUsuario();
        const esJeroglifico = this._esJeroglifico(activo);
        const nombreIdioma = this._getNombreIdioma(activo);

        const versionActiva = this._obtenerVersionActiva(activo);
        const nombreVersion = this._obtenerNombreVersion(activo, versionActiva);

        let hayActualizaciones = false;
        let actualizacionesPendientes = [];
        try {
            actualizacionesPendientes = await gestorIdiomas.verificarActualizacionesDisponibles();
            hayActualizaciones = actualizacionesPendientes.length > 0;
        } catch (e) {}

        const progresoNiveles = {};
        if (activo && window.UITemas && window.UITemas._TEMAS_PREDEFINIDOS) {
            const niveles = window.UITemas._NIVELES;
            for (const nivel of niveles) {
                const progresoNivel = await window.UITemas._obtenerProgresoNivel(activo, nivel, versionActiva);
                progresoNiveles[nivel] = progresoNivel;
            }
        }

        const tutorInfo = window.tutorNeuro ? window.tutorNeuro.getModoInfo() : null;

        let html = `
            <div class="config-container neuro-control-center" style="padding:0;width:100%;max-width:100%;box-sizing:border-box;">
                <!-- Cabecera con botones de versión -->
                <div class="config-header" style="background:linear-gradient(135deg,var(--primary)06,var(--secondary)06);border-radius:12px;padding:16px 20px;margin-bottom:16px;border:2px solid var(--primary)20;">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                        <div>
                            <h2 style="font-size:18px;font-weight:800;color:var(--dark);margin:0;"><i class="fas fa-sliders-h"></i> Centro de Control Neuro</h2>
                            <p style="font-size:12px;color:var(--gray);margin:2px 0 0;">Gestiona tu perfil, idiomas, tutor y visualiza tu progreso de aprendizaje.</p>
                            <p style="font-size:11px;color:var(--secondary);margin-top:2px;">
                                📌 Versión del estándar: <strong>${nombreVersion}</strong>
                                ${hayActualizaciones ? ` 🔔 ${actualizacionesPendientes.length} actualizaciones disponibles` : ' ✅ Actualizado'}
                            </p>
                            <p style="font-size:10px;color:var(--gray-light);margin-top:2px;">
                                🌍 Idioma activo: <strong style="color:var(--primary);">${nombreIdioma}</strong> (${activo})
                            </p>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            ${hayActualizaciones ? `
                                <button class="btn-primary" onclick="window.UIConfig._verificarActualizacionesDisponibles()" 
                                        style="padding:8px 16px;font-size:12px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;border:none;border-radius:8px;cursor:pointer;animation:pulse 2s ease-in-out infinite;">
                                    <i class="fas fa-bell"></i> ${actualizacionesPendientes.length} Actualizaciones
                                </button>
                            ` : ''}
                            <button class="btn-secondary" onclick="window.UIConfig._actualizarVersionesIdiomas(false)" 
                                    style="padding:8px 16px;font-size:12px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;">
                                <i class="fas fa-sync"></i> Actualizar Versiones
                            </button>
                            <button class="btn-secondary" onclick="window.UIConfig._verificarActualizacionesDisponibles()" 
                                    style="padding:8px 16px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:8px;cursor:pointer;">
                                <i class="fas fa-search"></i> Verificar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Sección: Tutor Neuro -->
                <div class="config-section tutor-config-section" style="margin-bottom:16px;border:2px solid var(--primary)20;border-radius:14px;padding:16px 20px;background:linear-gradient(135deg, var(--primary)04, var(--secondary)04);">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:8px;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span style="font-size:32px;">🧠</span>
                            <div>
                                <h3 style="font-size:18px;font-weight:700;color:var(--dark);margin:0;">Tutor Neuro</h3>
                                <p style="font-size:12px;color:var(--gray);margin:2px 0 0;">
                                    ${tutorInfo ? `${tutorInfo.icono} ${tutorInfo.nombre}` : 'Cargando...'}
                                    <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">| Elige cómo quieres que el tutor te guíe</span>
                                </p>
                            </div>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            <span style="font-size:11px;padding:4px 12px;border-radius:12px;background:${tutorInfo ? tutorInfo.color + '20' : 'var(--bg)'};color:${tutorInfo ? tutorInfo.color : 'var(--gray)'};">
                                ${tutorInfo ? tutorInfo.icono : '🧠'} ${tutorInfo ? tutorInfo.nombre : 'Cargando...'}
                            </span>
                        </div>
                    </div>
                    
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:12px;">
                        ${this._renderTarjetasModosTutor()}
                    </div>
                    
                    <div style="background:var(--bg);border-radius:8px;padding:10px 14px;border-left:4px solid ${tutorInfo ? tutorInfo.color : 'var(--primary)'};">
                        <div style="font-size:12px;font-weight:600;color:var(--gray);" id="tutorModoDescripcion">
                            ${this._getModoDescripcion()}
                        </div>
                        ${tutorInfo ? `
                            <div style="font-size:11px;color:var(--gray-light);margin-top:4px;display:flex;flex-wrap:wrap;gap:6px;">
                                ${tutorInfo.caracteristicas.map(c => `<span>${c}</span>`).join(' · ')}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Sección: Botón Super Power -->
                <div style="background:linear-gradient(135deg, #6C5CE7, #00CEC9);border-radius:14px;padding:20px 24px;margin-bottom:16px;box-shadow:0 4px 30px rgba(108,92,231,0.25);">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
                        <div style="display:flex;align-items:center;gap:14px;">
                            <div style="font-size:40px;animation:pulse 2s ease-in-out infinite;">⚡</div>
                            <div>
                                <h3 style="font-size:18px;font-weight:800;color:white;margin:0;">Botón Super Power</h3>
                                <p style="font-size:13px;color:rgba(255,255,255,0.85);margin:2px 0 0;">
                                    Genera un JSON completo con <strong>TODO</strong> el contenido para el nivel ${nivelReal} de ${nombreIdioma}
                                    ${esJeroglifico ? '🀄 (incluye caracteres y familias)' : ''}
                                    <span style="font-size:11px;color:rgba(255,255,255,0.6);margin-left:8px;">📌 ${nombreVersion}</span>
                                </p>
                                <p style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;">
                                    🎤 Incluye transcripción fonética en <strong>${this._obtenerIdiomaNativo()}</strong>
                                </p>
                                <p style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:2px;">
                                    📝 <strong>INCLUYE TODAS LAS PALABRAS DESGLOSADAS</strong> para cada frase
                                </p>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="window.UIConfig._generarSuperJSON()" 
                                style="padding:12px 28px;font-size:16px;font-weight:700;background:white;color:#6C5CE7;border:none;border-radius:10px;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 20px rgba(0,0,0,0.15);"
                                onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.25)'" 
                                onmouseout="this.style.transform='none';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.15)'">
                            <i class="fas fa-meteor"></i> ¡Generar JSON Completo!
                        </button>
                    </div>
                    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;font-size:11px;color:rgba(255,255,255,0.7);">
                        <span>📚 ${Object.keys(window.UITemas?.TEMAS_PREDEFINIDOS?.[versionActiva]?.[nivelReal] || {}).length || 0} temas</span>
                        <span>📖 3-5 historias por tema</span>
                        <span>📝 Vocabulario del nivel</span>
                        ${esJeroglifico ? `<span>🀄 Caracteres y familias</span>` : ''}
                        <span>📋 Reglas gramaticales</span>
                        <span>🎯 Ejercicios y logros</span>
                        <span>📌 ${nombreVersion}</span>
                        <span>🎤 Transcripción fonética</span>
                        <span>📝 Palabras desglosadas por frase</span>
                    </div>
                </div>

                ${this._renderTarjetaImportacionTemasNivel(activo, nivelReal, nombreIdioma, versionActiva, nombreVersion)}

                <!-- Sección: Perfil y Preferencias -->
                <div class="config-section profile-section" style="background:var(--white);border-radius:12px;padding:16px 20px;box-shadow:var(--shadow);margin-bottom:16px;border:2px solid var(--primary)20;">
                    <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0 0 12px 0;"><i class="fas fa-user-circle"></i> Perfil y Preferencias</h3>
                    <div class="config-grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="config-item" style="display:flex;flex-direction:column;gap:4px;">
                            <label style="font-size:12px;font-weight:600;color:var(--gray);"><i class="fas fa-user"></i> Nombre</label>
                            <input type="text" id="configNombre" value="${usuario?.nombre || ''}" placeholder="Tu nombre" style="padding:8px 12px;border:2px solid var(--light);border-radius:8px;font-size:14px;">
                        </div>
                        <div class="config-item" style="display:flex;flex-direction:column;gap:4px;">
                            <label style="font-size:12px;font-weight:600;color:var(--gray);"><i class="fas fa-language"></i> Idioma Nativo</label>
                            <select id="configIdiomaNativo" style="padding:8px 12px;border:2px solid var(--light);border-radius:8px;font-size:14px;">
                                ${idiomasNativos.map(n => `
                                    <option value="${n.id}" ${n.esActivo ? 'selected' : ''}>
                                        ${n.nombre}
                                    </option>
                                `).join('')}
                            </select>
                            <div style="display:flex;gap:6px;margin-top:4px;">
                                <button class="btn-sm btn-primary" onclick="window.UIConfig._añadirIdiomaNativo()" style="padding:4px 12px;font-size:11px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;">
                                    <i class="fas fa-plus"></i> Añadir
                                </button>
                            </div>
                        </div>
                        <div class="config-item" style="grid-column: span 2;">
                            <label style="font-size:12px;font-weight:600;color:var(--gray);"><i class="fas fa-bell"></i> Preferencias</label>
                            <div class="preference-group" style="display:flex;gap:16px;flex-wrap:wrap;padding-top:4px;">
                                <label style="font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="configAutoNivel" ${usuario?.nivelAuto !== false ? 'checked' : ''}> Subir de nivel automáticamente</label>
                                <label style="font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="configNotificaciones" ${usuario?.notificaciones !== false ? 'checked' : ''}> Notificaciones de estudio</label>
                                <label style="font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="configRecordatorios" ${usuario?.recordatorios !== false ? 'checked' : ''}> Recordatorios de repaso</label>
                            </div>
                        </div>
                    </div>
                    <button class="btn-primary" onclick="window.UIConfig._guardarConfigPerfil()" style="margin-top:12px;padding:8px 20px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">
                        <i class="fas fa-save"></i> Guardar Perfil
                    </button>
                </div>

                <!-- Sección: Gestión de Idiomas -->
                <div class="config-section languages-section" style="background:var(--white);border-radius:12px;padding:16px 20px;box-shadow:var(--shadow);margin-bottom:16px;border:2px solid var(--primary)20;">
                    <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0 0 12px 0;"><i class="fas fa-globe-americas"></i> Idiomas de Aprendizaje</h3>
                    <div class="languages-grid" id="configIdiomasGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;">
                        ${this._renderTarjetasIdiomas(idiomas, activo)}
                    </div>
                    <button class="btn-primary" onclick="window.UIConfig._abrirModalAgregarIdioma()" style="margin-top:12px;padding:8px 20px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">
                        <i class="fas fa-plus-circle"></i> Añadir Nuevo Idioma
                    </button>
                </div>

                <!-- Sección: Progreso de Niveles -->
                <div class="config-section levels-progress-section" style="background:var(--white);border-radius:12px;padding:16px 20px;box-shadow:var(--shadow);margin-bottom:16px;border:2px solid var(--primary)20;">
                    <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0 0 12px 0;"><i class="fas fa-chart-line"></i> Progreso por Nivel (${activo || 'Idioma Activo'})</h3>
                    <div class="levels-progress-grid" id="configLevelsProgress" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">
                        ${this._renderProgresoNiveles(progresoNiveles)}
                    </div>
                </div>

                <!-- Sección: Estadísticas Visuales -->
                <div class="config-section stats-section" style="background:var(--white);border-radius:12px;padding:16px 20px;box-shadow:var(--shadow);margin-bottom:16px;border:2px solid var(--primary)20;">
                    <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0 0 12px 0;"><i class="fas fa-chart-pie"></i> Estadísticas de Aprendizaje</h3>
                    <div class="stats-grid-visual" id="configStatsGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;">
                        ${this._renderTarjetasEstadisticas(stats, progreso, temas, historias)}
                    </div>
                </div>

                <!-- Sección: Historial -->
                <div class="config-section history-section" style="background:var(--white);border-radius:12px;padding:16px 20px;box-shadow:var(--shadow);margin-bottom:16px;border:2px solid var(--primary)20;">
                    <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0 0 12px 0;"><i class="fas fa-history"></i> Historial de Niveles</h3>
                    <div id="configHistorialNiveles" style="max-height:200px;overflow-y:auto;">
                        <p style="color:var(--gray);font-size:13px;">Cargando historial...</p>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        await this._cargarHistorialNiveles();
        this._inicializarEventosConfiguracion();
        
        setTimeout(() => {
            this._cargarArchivosTemasNivel();
        }, 500);
    }

    // ============================================================
    // RENDER TARJETAS DE MODOS DEL TUTOR
    // ============================================================

    _renderTarjetasModosTutor() {
        if (!window.tutorNeuro) {
            return `<div style="color:var(--gray);font-size:13px;padding:8px;">⚠️ Tutor Neuro no disponible</div>`;
        }
        const modoActual = window.tutorNeuro.getModo();
        const modos = [
            { id: 'guiado', icono: '🚀', nombre: 'Modo Guiado', descripcion: 'El tutor decide el camino', color: '#6C5CE7', bg: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' },
            { id: 'flexible', icono: '🧠', nombre: 'Modo Flexible', descripcion: 'El tutor sugiere, tú decides', color: '#00B894', bg: 'linear-gradient(135deg, #00B894, #55EFC4)' },
            { id: 'libre', icono: '📴', nombre: 'Modo Libre', descripcion: 'El tutor no interviene', color: '#636E72', bg: 'linear-gradient(135deg, #636E72, #2D3436)' }
        ];
        return modos.map(modo => {
            const esActivo = modo.id === modoActual;
            return `
                <div onclick="window.UIConfig._cambiarModoTutor('${modo.id}')" 
                     style="background: ${esActivo ? modo.bg : 'var(--white)'};border-radius:12px;padding:14px 16px;border:3px solid ${esActivo ? modo.color : 'var(--light)'};cursor:pointer;transition:all 0.3s ease;text-align:center;box-shadow:${esActivo ? '0 4px 20px ' + modo.color + '40' : 'var(--shadow)'};transform:${esActivo ? 'scale(1.02)' : 'scale(1)'};"
                     onmouseover="this.style.transform='scale(1.03)';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'" 
                     onmouseout="this.style.transform='${esActivo ? 'scale(1.02)' : 'scale(1)'}';this.style.boxShadow='${esActivo ? '0 4px 20px ' + modo.color + '40' : 'var(--shadow)'}'">
                    <div style="font-size:32px;display:block;margin-bottom:4px;">${modo.icono}</div>
                    <div style="font-size:14px;font-weight:700;color:${esActivo ? 'white' : 'var(--dark)'};">${modo.nombre}${esActivo ? ' ✅' : ''}</div>
                    <div style="font-size:11px;color:${esActivo ? 'rgba(255,255,255,0.8)' : 'var(--gray)'};margin-top:2px;">${modo.descripcion}</div>
                    ${esActivo ? `<div style="font-size:9px;color:rgba(255,255,255,0.6);margin-top:4px;">🔒 Activo</div>` : ''}
                </div>
            `;
        }).join('');
    }

    _getModoDescripcion() {
        if (!window.tutorNeuro) return 'Tutor Neuro no disponible';
        const info = window.tutorNeuro.getModoInfo();
        return `${info.icono} ${info.nombre}: ${info.descripcion}`;
    }

    async _cambiarModoTutor(modo) {
        if (!window.tutorNeuro) {
            this.core?.mostrarToast('❌ Tutor Neuro no disponible', 'error');
            return;
        }
        const modoActual = window.tutorNeuro.getModo();
        if (modo === modoActual) {
            this.core?.mostrarToast(`📌 Ya estás en ${window.tutorNeuro.getModoInfo().nombre}`, 'info');
            return;
        }
        const nuevoInfo = window.tutorNeuro.setModo(modo);
        this.core?.mostrarToast(`🔄 Modo cambiado a ${nuevoInfo.nombre}`, 'success');
        await this._cargarConfiguracion();
    }

    // ============================================================
    // RENDER TARJETAS DE IDIOMAS - CON PERSISTENCIA
    // ============================================================

    _renderTarjetasIdiomas(idiomas, activo) {
        if (!idiomas || idiomas.length === 0) {
            return `<div class="empty-state" style="text-align:center;padding:20px;color:var(--gray);grid-column:1/-1;">No hay idiomas configurados. Añade el primero.</div>`;
        }
        
        // 🔥 OBTENER IDIOMA ACTIVO PERSISTENTE
        const idiomaPersistente = localStorage.getItem(this._KEY_IDIOMA_ACTIVO) || activo || 'es';
        
        return idiomas.map(idioma => {
            // 🔥 USAR IDIOMA PERSISTENTE PARA EL ESTADO ACTIVO
            const esActivo = idioma.idioma === idiomaPersistente || idioma.idioma === activo;
            const emoji = idioma.esJeroglifico ? '🀄' : '🌍';
            const colorNivel = this._NIVEL_COLORES?.[idioma.nivel] || 'var(--primary)';
            const versionEstandar = idioma.versionEstandar || 'v2.0';
            const versionesDisponibles = this._obtenerVersionesDisponibles(idioma.idioma);
            const nombreVersion = this._obtenerNombreVersion(idioma.idioma, versionEstandar);
            const descripcionVersion = this._obtenerDescripcionVersion(idioma.idioma, versionEstandar);
            const idiomaBase = window.gestorIdiomas?._obtenerIdiomaBase?.(idioma.idioma) || 'default';
            const cacheVersion = window.gestorIdiomas?._cacheVersiones?.[idiomaBase];
            const hayActualizacion = cacheVersion && cacheVersion.version && cacheVersion.version !== versionEstandar;
            const progresoNeuro = Math.round((idioma.coberturaNivel || 0) * 0.6 + (idioma.progreso || 0) * 0.4);
            let estadoNeuro = '🔴 En inicio';
            let estadoColor = 'var(--danger)';
            if (progresoNeuro >= 80) {
                estadoNeuro = '🟣 Dominio avanzado';
                estadoColor = 'var(--primary)';
            } else if (progresoNeuro >= 60) {
                estadoNeuro = '🟢 Consolidado';
                estadoColor = 'var(--success)';
            } else if (progresoNeuro >= 40) {
                estadoNeuro = '🟡 En progreso';
                estadoColor = 'var(--warning)';
            } else if (progresoNeuro >= 20) {
                estadoNeuro = '🟠 Iniciando';
                estadoColor = 'var(--info)';
            }
            return `
                <div class="language-card ${esActivo ? 'active' : ''}" data-idioma="${idioma.idioma}" style="background:${esActivo ? 'var(--primary)04' : 'var(--white)'};border-radius:10px;padding:12px 14px;border:2px solid ${esActivo ? 'var(--primary)' : 'var(--light)'};${hayActualizacion ? 'border-color:var(--warning);' : ''}">
                    <div class="language-card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;margin-bottom:6px;">
                        <span class="language-icon" style="font-size:18px;">${emoji}</span>
                        <span class="language-name" style="font-size:14px;font-weight:700;color:var(--dark);flex:1;margin-left:6px;">${idioma.idioma}</span>
                        <span class="language-badge ${esActivo ? 'active-badge' : 'inactive-badge'}" style="font-size:10px;padding:2px 10px;border-radius:12px;background:${esActivo ? 'var(--success)' : 'var(--gray-light)'};color:white;">
                            ${esActivo ? '✅ Activo' : '⏸️ Inactivo'}
                        </span>
                        ${hayActualizacion ? `
                            <span class="language-badge" style="font-size:9px;padding:1px 8px;border-radius:8px;background:var(--warning);color:white;">
                                🔔 Actualización
                            </span>
                        ` : ''}
                    </div>
                    <div class="language-card-body" style="display:flex;flex-direction:column;gap:6px;">
                        <div class="language-level" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                            <span class="level-label" style="font-size:11px;color:var(--gray);">Nivel</span>
                            <span class="level-value" style="font-size:14px;font-weight:700;color:${colorNivel};">${idioma.nivel}</span>
                            <span class="level-status" style="font-size:11px;color:${estadoColor};">${estadoNeuro}</span>
                        </div>
                        <div class="config-item" style="background:var(--bg);padding:6px 10px;border-radius:6px;border:1px solid var(--light);">
                            <label style="font-size:10px;color:var(--gray);display:flex;align-items:center;gap:4px;">
                                <i class="fas fa-code-branch"></i> Versión del estándar
                                ${hayActualizacion ? `<span style="font-size:8px;color:var(--warning);font-weight:600;">🔔 ${cacheVersion.nombre} disponible</span>` : ''}
                            </label>
                            <select id="versionSelect_${idioma.idioma}" 
                                    data-idioma="${idioma.idioma}" 
                                    style="width:100%;padding:3px 6px;border:1px solid var(--light);border-radius:4px;font-size:11px;background:var(--white);"
                                    onchange="window.UIConfig._cambiarVersionIdioma('${idioma.idioma}', this.value)">
                                ${versionesDisponibles.map(v => `
                                    <option value="${v.id}" ${versionEstandar === v.id ? 'selected' : ''}>
                                        ${v.nombre}
                                    </option>
                                `).join('')}
                            </select>
                            <div style="font-size:8px;color:var(--gray-light);margin-top:2px;display:flex;justify-content:space-between;flex-wrap:wrap;">
                                <span>📊 Palabras requeridas: ${idioma.nivelRequerido || 'N/A'}</span>
                                <span style="color:var(--secondary);">📌 ${descripcionVersion || nombreVersion}</span>
                            </div>
                        </div>
                        <div class="progress-group">
                            <div class="progress-item">
                                <span class="progress-label" style="font-size:10px;color:var(--gray);">🧠 Progreso Neuro</span>
                                <div class="progress-bar" style="height:6px;background:var(--bg);border-radius:3px;overflow:hidden;">
                                    <div class="progress-fill neuro-fill" style="height:100%;width:${progresoNeuro}%;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:3px;"></div>
                                </div>
                                <span style="font-size:10px;font-weight:600;color:var(--primary);">${progresoNeuro}%</span>
                            </div>
                        </div>
                        <div class="neuro-details" style="display:flex;gap:12px;font-size:10px;color:var(--gray);flex-wrap:wrap;">
                            <span>📊 Frases: <strong>${idioma.progreso || 0}%</strong></span>
                            <span>📖 Vocabulario: <strong>${idioma.coberturaNivel || 0}%</strong></span>
                            <span>🧠 Consolidación: <strong>${progresoNeuro}%</strong></span>
                        </div>
                    </div>
                    <div class="language-card-actions" style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
                        ${!esActivo ? `
                            <button class="btn-sm btn-primary" onclick="window.UIConfig._cambiarIdiomaActivo('${idioma.idioma}')" style="padding:3px 10px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                <i class="fas fa-check"></i> Activar
                            </button>
                        ` : ''}
                        <button class="btn-sm btn-secondary" onclick="window.UIConfig._cambiarNivelIdioma('${idioma.idioma}')" style="padding:3px 10px;font-size:10px;background:var(--bg);border:1px solid var(--light);border-radius:4px;cursor:pointer;">
                            <i class="fas fa-edit"></i> Nivel
                        </button>
                        ${idiomas.length > 1 ? `
                            <button class="btn-sm btn-danger" onclick="window.UIConfig._eliminarIdioma('${idioma.idioma}')" style="padding:3px 10px;font-size:10px;background:#FF7675;color:white;border:none;border-radius:4px;cursor:pointer;">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ============================================================
    // RENDER PROGRESO NIVELES
    // ============================================================

    _renderProgresoNiveles(progresoNiveles) {
        if (!progresoNiveles || Object.keys(progresoNiveles).length === 0) {
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            const infoIdioma = gestorIdiomas?.getInfoIdioma(idiomaActivo);
            return `
                <div style="text-align:center;padding:20px;color:var(--gray);background:var(--bg);border-radius:8px;border:1px solid var(--light);grid-column:1/-1;">
                    <i class="fas fa-info-circle" style="font-size:24px;color:var(--primary-light);display:block;margin-bottom:8px;"></i>
                    <p style="font-size:13px;font-weight:500;margin:0;">📊 Progreso por Nivel</p>
                    <p style="font-size:12px;color:var(--gray-light);margin:4px 0 0;">
                        ${infoIdioma ? `No hay temas predefinidos guardados para <strong>${infoIdioma.idioma}</strong>.` : 'Activa un idioma para ver tu progreso aquí.'}
                        <br>Genera o importa temas desde el módulo <strong>Temas</strong>.
                    </p>
                    <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;">
                        <button class="btn-secondary" onclick="window.UIJSON.abrirGeneradorJSON()" style="padding:4px 14px;font-size:11px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-plus"></i> Generar Temas
                        </button>
                        <button class="btn-secondary" onclick="window.UITemas._renderTemas()" style="padding:4px 14px;font-size:11px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-folder-open"></i> Ver Temas
                        </button>
                    </div>
                </div>
            `;
        }
        const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const nivelActual = this._obtenerNivelRealUsuario();
        const versionActiva = this._obtenerVersionActiva(gestorIdiomas?.getIdiomaActivo() || 'es');
        const nombreVersion = this._obtenerNombreVersion(gestorIdiomas?.getIdiomaActivo() || 'es', versionActiva);
        const nivelesConDatos = niveles.filter(n => progresoNiveles[n] && progresoNiveles[n].total > 0);
        if (nivelesConDatos.length === 0) {
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            const infoIdioma = gestorIdiomas?.getInfoIdioma(idiomaActivo);
            return `
                <div style="text-align:center;padding:20px;color:var(--gray);background:var(--bg);border-radius:8px;border:1px solid var(--light);grid-column:1/-1;">
                    <i class="fas fa-info-circle" style="font-size:24px;color:var(--primary-light);display:block;margin-bottom:8px;"></i>
                    <p style="font-size:13px;font-weight:500;margin:0;">📊 Progreso por Nivel</p>
                    <p style="font-size:12px;color:var(--gray-light);margin:4px 0 0;">
                        ${infoIdioma ? `No hay temas predefinidos guardados para <strong>${infoIdioma.idioma}</strong>.` : 'Activa un idioma para ver tu progreso aquí.'}
                        <br>Genera o importa temas desde el módulo <strong>Temas</strong>.
                    </p>
                    <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;">
                        <button class="btn-secondary" onclick="window.UIJSON.abrirGeneradorJSON()" style="padding:4px 14px;font-size:11px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-plus"></i> Generar Temas
                        </button>
                        <button class="btn-secondary" onclick="window.UITemas._renderTemas()" style="padding:4px 14px;font-size:11px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-folder-open"></i> Ver Temas
                        </button>
                    </div>
                </div>
            `;
        }
        return nivelesConDatos.map(nivel => {
            const data = progresoNiveles[nivel];
            if (!data || data.total === 0) return '';
            const emoji = this._NIVEL_ICONOS?.[nivel] || '📚';
            const color = this._NIVEL_COLORES?.[nivel] || 'var(--primary)';
            const pct = data.porcentaje || 0;
            const completados = data.completados || 0;
            const total = data.total || 1;
            const esActual = nivel === nivelActual;
            return `
                <div class="level-progress-card" style="background:${esActual ? 'var(--primary)04' : 'var(--bg)'};border-radius:8px;padding:10px 12px;border:2px solid ${esActual ? 'var(--primary)' : 'var(--light)'};">
                    <div class="level-progress-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;margin-bottom:4px;">
                        <span class="level-emoji" style="font-size:18px;">${emoji}</span>
                        <span class="level-name" style="font-size:13px;font-weight:700;color:var(--dark);">Nivel ${nivel}</span>
                        ${esActual ? '<span class="level-badge current" style="font-size:9px;background:var(--primary);color:white;padding:1px 8px;border-radius:8px;">🎯 ACTUAL</span>' : ''}
                        <span class="level-stats" style="font-size:11px;color:var(--gray);">${completados}/${total} temas</span>
                    </div>
                    <div class="progress-bar level-bar" style="height:6px;background:var(--bg);border-radius:3px;overflow:hidden;">
                        <div class="progress-fill" style="height:100%;width:${pct}%;background:${pct >= 80 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : color};border-radius:3px;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:2px;font-size:10px;color:var(--gray);">
                        <span>${pct}%</span>
                        ${pct >= 80 ? `<span class="level-badge complete" style="color:var(--success);font-weight:600;">🎉 ¡Completado!</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ============================================================
    // RENDER TARJETAS ESTADÍSTICAS
    // ============================================================

    _renderTarjetasEstadisticas(stats, progreso, temas, historias) {
        const rcnPromedio = stats?.rcnPromedio || 0;
        const eficiencia = stats?.eficiencia || 0;
        const neuroScore = stats?.neuroScore || 0;
        const totalFrases = stats?.totalFrases || 0;
        const totalPalabras = stats?.totalPalabras || 0;
        const completadas = progreso.filter(p => p.estado === 'completada').length;
        const fechas = progreso.map(p => new Date(p.ultimoRepaso).toDateString());
        const uniqueFechas = [...new Set(fechas)].sort();
        let racha = 0;
        for (let i = uniqueFechas.length - 1; i >= 0; i--) {
            const fecha = new Date(uniqueFechas[i]);
            const diff = Math.floor((Date.now() - fecha.getTime()) / 86400000);
            if (diff === racha) { racha++; } else { break; }
        }
        return `
            <div class="stat-card neuro-score" style="background:var(--bg);border-radius:8px;padding:10px 12px;text-align:center;border:1px solid var(--light);">
                <div class="stat-icon" style="font-size:24px;">🧠</div>
                <div class="stat-content">
                    <span class="stat-value" style="font-size:18px;font-weight:700;color:var(--primary);display:block;">${neuroScore}%</span>
                    <span class="stat-label" style="font-size:10px;color:var(--gray);">NeuroScore</span>
                </div>
            </div>
            <div class="stat-card rcn" style="background:var(--bg);border-radius:8px;padding:10px 12px;text-align:center;border:1px solid var(--light);">
                <div class="stat-icon" style="font-size:24px;">📈</div>
                <div class="stat-content">
                    <span class="stat-value" style="font-size:18px;font-weight:700;color:var(--secondary);display:block;">${rcnPromedio.toFixed(1)}</span>
                    <span class="stat-label" style="font-size:10px;color:var(--gray);">RCN Promedio</span>
                </div>
            </div>
            <div class="stat-card efficiency" style="background:var(--bg);border-radius:8px;padding:10px 12px;text-align:center;border:1px solid var(--light);">
                <div class="stat-icon" style="font-size:24px;">⚡</div>
                <div class="stat-content">
                    <span class="stat-value" style="font-size:18px;font-weight:700;color:var(--warning);display:block;">${eficiencia}%</span>
                    <span class="stat-label" style="font-size:10px;color:var(--gray);">Eficiencia</span>
                </div>
            </div>
            <div class="stat-card streak" style="background:var(--bg);border-radius:8px;padding:10px 12px;text-align:center;border:1px solid var(--light);">
                <div class="stat-icon" style="font-size:24px;">🔥</div>
                <div class="stat-content">
                    <span class="stat-value" style="font-size:18px;font-weight:700;color:var(--danger);display:block;">${racha}</span>
                    <span class="stat-label" style="font-size:10px;color:var(--gray);">Racha (días)</span>
                </div>
            </div>
            <div class="stat-card phrases" style="background:var(--bg);border-radius:8px;padding:10px 12px;text-align:center;border:1px solid var(--light);">
                <div class="stat-icon" style="font-size:24px;">📖</div>
                <div class="stat-content">
                    <span class="stat-value" style="font-size:18px;font-weight:700;color:var(--success);display:block;">${completadas}/${totalFrases}</span>
                    <span class="stat-label" style="font-size:10px;color:var(--gray);">Frases Completadas</span>
                </div>
            </div>
            <div class="stat-card words" style="background:var(--bg);border-radius:8px;padding:10px 12px;text-align:center;border:1px solid var(--light);">
                <div class="stat-icon" style="font-size:24px;">📝</div>
                <div class="stat-content">
                    <span class="stat-value" style="font-size:18px;font-weight:700;color:var(--info);display:block;">${totalPalabras}</span>
                    <span class="stat-label" style="font-size:10px;color:var(--gray);">Palabras Aprendidas</span>
                </div>
            </div>
            <div class="stat-card stories" style="background:var(--bg);border-radius:8px;padding:10px 12px;text-align:center;border:1px solid var(--light);">
                <div class="stat-icon" style="font-size:24px;">📚</div>
                <div class="stat-content">
                    <span class="stat-value" style="font-size:18px;font-weight:700;color:var(--primary);display:block;">${historias.length}</span>
                    <span class="stat-label" style="font-size:10px;color:var(--gray);">Historias</span>
                </div>
            </div>
            <div class="stat-card topics" style="background:var(--bg);border-radius:8px;padding:10px 12px;text-align:center;border:1px solid var(--light);">
                <div class="stat-icon" style="font-size:24px;">📂</div>
                <div class="stat-content">
                    <span class="stat-value" style="font-size:18px;font-weight:700;color:var(--secondary);display:block;">${temas.length}</span>
                    <span class="stat-label" style="font-size:10px;color:var(--gray);">Temas</span>
                </div>
            </div>
        `;
    }

    // ============================================================
    // MÉTODOS DE CONFIGURACIÓN
    // ============================================================

    _inicializarEventosConfiguracion() {
        document.getElementById('configIdiomaNativo')?.addEventListener('change', () => {});
        const perfilBtn = document.querySelector('button[onclick*="_guardarConfigPerfil"]');
        if (perfilBtn) {
            const newBtn = perfilBtn.cloneNode(true);
            perfilBtn.parentNode.replaceChild(newBtn, perfilBtn);
            newBtn.onclick = () => this._guardarConfigPerfil();
        }
    }

    // ============================================================
    // AÑADIR IDIOMA NATIVO
    // ============================================================

    async _añadirIdiomaNativo() {
        const nombre = await this.core?.prompt(
            '📝 Nuevo idioma nativo:',
            '',
            'Ej: Inglés, Francés, Alemán...',
            'Añadir Idioma Nativo'
        );
        if (!nombre) return;

        const validacion = await window.validadorIdiomas.validar(nombre, 'nativo');
        
        if (!validacion.valido) {
            this.core?.mostrarToast(`❌ "${nombre}" no es un idioma válido.`, 'error');
            return;
        }

        let nombreFinal = validacion.idiomaFinal;
        
        if (validacion.corregido) {
            const aceptar = await this.core?.confirm(
                `🔍 Sugerencia: "${nombre}" → **"${nombreFinal}"**\n\n${validacion.mensaje || ''}\n\n¿Usar "${nombreFinal}"?`,
                '✏️ Corrección de idioma'
            );
            if (!aceptar) return;
        }

        const nativos = await gestorIdiomas.obtenerIdiomasNativos();
        if (nativos.some(n => n.nombre === nombreFinal)) {
            this.core?.mostrarToast(`⚠️ "${nombreFinal}" ya existe.`, 'warning');
            return;
        }
        nativos.push({ id: 'nativo_' + Date.now(), nombre: nombreFinal, esActivo: false });
        await gestorIdiomas.guardarIdiomasNativos(nativos);
        
        await window.validadorIdiomas.guardar(nombreFinal, 'nativo');
        
        this.core?.mostrarToast(`✅ "${nombreFinal}" añadido.`, 'success');
        this._cargarConfiguracion();
    }

    // ============================================================
    // AÑADIR IDIOMA
    // ============================================================

    async _abrirModalAgregarIdioma() {
        if (this._modalIdiomaAbierto) return;
        this._modalIdiomaAbierto = true;
        
        try {
            const idioma = await this.core.prompt(
                '📝 ¿Qué idioma quieres añadir?\n\nEjemplos: Chino, English, 日本語, Français...',
                '',
                'Escribe el nombre del idioma...',
                '🌍 Nuevo Idioma'
            );
            if (!idioma) { this._modalIdiomaAbierto = false; return; }
            
            const idiomaTrim = idioma.trim();
            if (!idiomaTrim) { this._modalIdiomaAbierto = false; return; }

            let validacion = null;
            
            if (window.validadorIdiomas && window.vigia && window.vigia.enLinea && window.vigia._apiKeyValidada) {
                try {
                    validacion = await window.validadorIdiomas.validar(idiomaTrim, 'objetivo');
                    console.log('🔍 Validación con Groq para objetivo:', validacion);
                } catch (e) {
                    console.warn('⚠️ Error en validadorIdiomas, usando fallback local:', e);
                }
            }

            if (!validacion) {
                if (window.app && typeof window.app._validarIdiomaLocal === 'function') {
                    validacion = window.app._validarIdiomaLocal(idiomaTrim, 'objetivo');
                    console.log('📌 Usando validación LOCAL para objetivo:', validacion);
                } else {
                    validacion = {
                        original: idiomaTrim,
                        idiomaFinal: idiomaTrim,
                        valido: true,
                        mensaje: 'Idioma aceptado',
                        corregido: false
                    };
                }
            }

            if (!validacion.valido) {
                let mensaje = `❌ "${idiomaTrim}" no es un idioma válido.`;
                if (validacion.mensaje) {
                    mensaje += `\n\n${validacion.mensaje}`;
                }
                if (window.app && typeof window.app._obtenerSugerenciasIdiomas === 'function') {
                    const sugerencias = window.app._obtenerSugerenciasIdiomas(idiomaTrim);
                    if (sugerencias.length > 0) {
                        mensaje += `\n\n💡 ¿Quisiste decir: ${sugerencias.join(', ')}?`;
                    }
                }
                await this.core.alert(mensaje, '❌ Idioma inválido');
                this._modalIdiomaAbierto = false;
                return;
            }

            let idiomaFinal = validacion.idiomaFinal;

            if (validacion.corregido && validacion.sugerido) {
                const aceptar = await this.core.confirm(
                    `🔍 Sugerencia: "${idiomaTrim}" → **"${idiomaFinal}"**\n\n${validacion.mensaje || ''}\n\n¿Usar "${idiomaFinal}"?`,
                    '✏️ Corrección de idioma'
                );
                if (!aceptar) {
                    this._modalIdiomaAbierto = false;
                    return;
                }
            }

            const existentes = gestorIdiomas.getIdiomas();
            if (existentes.some(i => i.idioma.toLowerCase() === idiomaFinal.toLowerCase())) {
                await this.core.alert(`❌ El idioma "${idiomaFinal}" ya existe.`, 'Error');
                this._modalIdiomaAbierto = false;
                return;
            }

            const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            const nivelOptions = niveles.map(n => {
                const labels = { 
                    'A1': 'Principiante', 
                    'A2': 'Elemental', 
                    'B1': 'Intermedio', 
                    'B2': 'Intermedio Alto', 
                    'C1': 'Avanzado', 
                    'C2': 'Maestría' 
                };
                return `• ${n} - ${labels[n]}`;
            }).join('\n');
            
            const nivel = await this.core.prompt(
                `📊 Nivel para "${idiomaFinal}"\n\nOpciones:\n${nivelOptions}`,
                'B1',
                'Escribe el nivel (A1, A2, B1, B2, C1, C2)...',
                '📊 Seleccionar Nivel'
            );
            if (!nivel) { this._modalIdiomaAbierto = false; return; }
            
            const nivelUpper = nivel.toUpperCase().trim();
            if (!niveles.includes(nivelUpper)) {
                await this.core.alert(`❌ "${nivel}" no es un nivel válido.`, 'Error');
                this._modalIdiomaAbierto = false;
                return;
            }

            await this._añadirIdioma(idiomaFinal, nivelUpper);
            
            if (window.validadorIdiomas) {
                try {
                    await window.validadorIdiomas.guardar(idiomaFinal, 'objetivo');
                } catch (e) {
                    console.warn('⚠️ Error guardando en validador:', e);
                }
            }
            
            this.core?.mostrarToast(`✅ Idioma "${idiomaFinal}" añadido (${nivelUpper})`, 'success');
            
        } catch (e) {
            console.error('❌ Error:', e);
            await this.core.alert('❌ Error: ' + e.message, 'Error');
        } finally {
            this._modalIdiomaAbierto = false;
        }
    }

    // ============================================================
    // AÑADIR IDIOMA - CON PERSISTENCIA
    // ============================================================

    async _añadirIdioma(idioma, nivel) {
        try {
            const result = await gestorIdiomas.añadirIdioma(idioma, nivel);
            if (result) {
                await gestorIdiomas._cargarIdiomas();
                await window.validadorIdiomas.guardar(idioma, 'objetivo');
                
                // 🔥 GUARDAR COMO IDIOMA ACTIVO
                await this._guardarIdiomaActivoPersistente(idioma);
                
                await this._recargarConfiguracion();
                if (window.UIDashboard) {
                    window.UIDashboard._cargarDashboardInicial(this.core);
                }
                this.core?.mostrarToast(`✅ Idioma "${idioma}" añadido (${nivel})`, 'success');
            } else {
                this.core?.mostrarToast(`❌ El idioma "${idioma}" ya existe`, 'error');
            }
        } catch (error) {
            console.error('❌ Error añadiendo idioma:', error);
            this.core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // OTROS MÉTODOS
    // ============================================================

    async _guardarConfigPerfil() {
        const nombre = document.getElementById('configNombre')?.value?.trim() || '';
        const idiomaNativoSelect = document.getElementById('configIdiomaNativo');
        const nativoId = idiomaNativoSelect?.value || '';
        if (!nombre) { this.core?.mostrarToast('❌ El nombre es obligatorio.', 'error'); return; }
        if (nativoId) { await gestorIdiomas.cambiarIdiomaNativo(nativoId); }
        const autoNivel = document.getElementById('configAutoNivel')?.checked ?? true;
        const notificaciones = document.getElementById('configNotificaciones')?.checked ?? true;
        const recordatorios = document.getElementById('configRecordatorios')?.checked ?? true;
        const usuario = await db.getUsuario();
        if (usuario) {
            usuario.nombre = nombre;
            usuario.nivelAuto = autoNivel;
            usuario.notificaciones = notificaciones;
            usuario.recordatorios = recordatorios;
            await db.guardarUsuario(usuario);
            localStorage.setItem('pipeline_usuario', JSON.stringify(usuario));
            this.core?.mostrarToast('✅ Perfil guardado.', 'success');
            const userName = document.getElementById('userName');
            const dashUser = document.getElementById('dashUserName');
            if (userName) userName.textContent = nombre;
            if (dashUser) dashUser.textContent = nombre;
            this._cargarConfiguracion();
        }
    }

    // ============================================================
    // CAMBIAR IDIOMA ACTIVO - CORREGIDO CON PERSISTENCIA
    // ============================================================

    async _cambiarIdiomaActivo(idioma) {
        if (this._cambiandoIdioma) {
            this.core?.mostrarToast('⏳ Cambiando idioma...', 'info');
            return;
        }
        
        this._cambiandoIdioma = true;
        
        try {
            // 🔥 GUARDAR CON PERSISTENCIA
            await this._guardarIdiomaActivoPersistente(idioma);
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            await this._recargarConfiguracion();
            
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this.core);
            }
            if (window.UIStudy) {
                window.UIStudy._renderizarFraseInteractiva();
            }
            if (window.UIGrammar) {
                window.UIGrammar._cargarGramatica();
            }
            if (window.UITemas) {
                window.UITemas._renderTemas();
            }
            if (window.UIEspacio) {
                window.UIEspacio._renderizarMiEspacio();
            }
            
            this.core?.mostrarToast(`🌍 Idioma activo: ${idioma}`, 'success');
            localStorage.setItem(this._KEY_IDIOMA_ACTIVO, idioma);
            
        } catch (error) {
            console.error('❌ Error cambiando idioma:', error);
            this.core?.mostrarToast('❌ Error al cambiar idioma: ' + error.message, 'error');
        } finally {
            this._cambiandoIdioma = false;
        }
    }

    async _cambiarNivelIdioma(idioma) {
        const info = gestorIdiomas.getInfoIdioma(idioma);
        if (!info) { this.core?.mostrarToast('❌ Idioma no encontrado', 'error'); return; }
        const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const nivelOptions = niveles.map(n => {
            const labels = { 'A1': 'Principiante', 'A2': 'Elemental', 'B1': 'Intermedio', 'B2': 'Intermedio Alto', 'C1': 'Avanzado', 'C2': 'Maestría' };
            const actual = n === info.nivel ? ' (actual)' : '';
            return `• ${n} - ${labels[n]}${actual}`;
        }).join('\n');
        const nuevoNivel = await this.core.prompt(
            `📊 Cambiar nivel para "${idioma}"\n\nNivel actual: ${info.nivel}\n\nOpciones:\n${nivelOptions}`,
            info.nivel,
            'Escribe el nuevo nivel...',
            '📊 Cambiar Nivel'
        );
        if (!nuevoNivel) return;
        const nivelUpper = nuevoNivel.toUpperCase().trim();
        if (!niveles.includes(nivelUpper)) {
            await this.core.alert(`❌ "${nuevoNivel}" no es un nivel válido.`, 'Error');
            return;
        }
        if (nivelUpper === info.nivel) { this.core?.mostrarToast(`📌 Ya estás en nivel ${nivelUpper}`, 'info'); return; }
        try {
            const result = await gestorIdiomas.cambiarNivel(idioma, nivelUpper);
            if (result) {
                await this._recargarConfiguracion();
                if (idioma === gestorIdiomas.getIdiomaActivo() && pipeline) { pipeline.nivel = nivelUpper; }
                if (window.UIDashboard) { window.UIDashboard._cargarDashboardInicial(this.core); }
                this.core?.mostrarToast(`✅ Nivel de "${idioma}" cambiado a ${nivelUpper}`, 'success');
            }
        } catch (e) { this.core?.mostrarToast('❌ Error: ' + e.message, 'error'); }
    }

    // ============================================================
    // ELIMINAR IDIOMA - CON PERSISTENCIA
    // ============================================================

    async _eliminarIdioma(idioma) {
        const info = gestorIdiomas.getInfoIdioma(idioma);
        if (!info) { this.core?.mostrarToast('❌ Idioma no encontrado', 'error'); return; }
        const idiomas = gestorIdiomas.getIdiomas();
        if (idiomas.length <= 1) { await this.core.alert('❌ No puedes eliminar el último idioma.', 'Error'); return; }
        const confirmar = await this.core.confirm(
            `⚠️ ¿Eliminar el idioma "${idioma}"?\n\nNivel: ${info.nivel}\nProgreso: ${info.progreso || 0}%\nVersión: ${info.versionEstandar || 'v2.0'}`,
            '🗑️ Eliminar Idioma'
        );
        if (!confirmar) return;
        try {
            const result = await gestorIdiomas.eliminarIdioma(idioma);
            if (result) {
                // 🔥 SI EL IDIOMA ELIMINADO ERA EL ACTIVO, CAMBIAR A OTRO
                const idiomaPersistente = localStorage.getItem(this._KEY_IDIOMA_ACTIVO);
                if (idiomaPersistente === idioma) {
                    const idiomasRestantes = gestorIdiomas.getIdiomas();
                    if (idiomasRestantes.length > 0) {
                        await this._guardarIdiomaActivoPersistente(idiomasRestantes[0].idioma);
                    } else {
                        localStorage.removeItem(this._KEY_IDIOMA_ACTIVO);
                    }
                }
                await this._recargarConfiguracion();
                if (window.UIDashboard) { window.UIDashboard._cargarDashboardInicial(this.core); }
                this.core?.mostrarToast(`🗑️ Idioma "${idioma}" eliminado`, 'warning');
            }
        } catch (e) { this.core?.mostrarToast('❌ Error: ' + e.message, 'error'); }
    }

    async _cargarHistorialNiveles() {
        try {
            const historial = await db.getAll('historialNiveles');
            const container = document.getElementById('configHistorialNiveles');
            if (!container) return;
            if (historial.length === 0) {
                container.innerHTML = '<p style="color:var(--gray);font-size:13px;">No hay cambios de nivel registrados.</p>';
                return;
            }
            let html = '<div style="display:flex;flex-direction:column;gap:4px;">';
            const ultimos = historial.slice(-10).reverse();
            for (const h of ultimos) {
                const fecha = new Date(h.fecha).toLocaleDateString();
                const emoji = h.nivelNuevo > h.nivelAnterior ? '⬆️' : '⬇️';
                const idioma = h.idioma || 'idioma desconocido';
                html += `
                    <div style="display:flex;justify-content:space-between;padding:4px 8px;background:var(--bg);border-radius:4px;font-size:12px;color:var(--gray);">
                        <span>${emoji} ${h.nivelAnterior} → ${h.nivelNuevo} (${idioma})</span>
                        <span style="color:var(--gray-light);">${fecha}</span>
                    </div>
                `;
            }
            html += '</div>';
            container.innerHTML = html;
        } catch (e) { console.warn('⚠️ Error cargando historial:', e); }
    }

    async _actualizarNivelHeader() {
        try {
            const activo = gestorIdiomas.getIdiomaActivo();
            const info = gestorIdiomas.getInfoIdioma(activo);
            const nivel = info?.nivel || 'A1';
            const nivelEl = document.getElementById('neuroNivel');
            if (nivelEl) nivelEl.textContent = nivel;
        } catch (e) { console.warn('⚠️ Error actualizando nivel header:', e); }
    }

    // ============================================================
    // RENDERIZAR TARJETA DE IMPORTACIÓN DE TEMAS POR NIVELES
    // ============================================================

    _renderTarjetaImportacionTemasNivel(idiomaActivo, nivelReal, nombreIdioma, versionActiva, nombreVersion) {
        let codigoIso = this._obtenerCodigoIso(idiomaActivo);
        
        return `
            <div style="background:linear-gradient(135deg, #2D3436, #0984E3);border-radius:16px;padding:20px 24px;margin-bottom:16px;box-shadow:0 4px 30px rgba(9,132,227,0.25);border:1px solid rgba(255,255,255,0.1);">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
                    <div style="display:flex;align-items:flex-start;gap:14px;">
                        <div style="font-size:38px;animation:pulse 2s ease-in-out infinite;line-height:1;">📂</div>
                        <div>
                            <h3 style="font-size:17px;font-weight:800;color:white;margin:0;letter-spacing:-0.3px;">
                                Importación de Temas por Niveles
                                <span style="font-size:11px;font-weight:400;color:rgba(255,255,255,0.5);margin-left:8px;">${nombreVersion}</span>
                            </h3>
                            <p style="font-size:12px;color:rgba(255,255,255,0.7);margin:2px 0 0;">
                                <span style="background:rgba(255,255,255,0.1);padding:1px 8px;border-radius:4px;font-family:monospace;font-size:11px;color:#74B9FF;">${codigoIso}_NIVEL.json</span>
                                <span style="margin-left:8px;">🌍 ${nombreIdioma} · Nivel actual: <strong style="color:#74B9FF;">${nivelReal}</strong></span>
                            </p>
                            <p style="font-size:10px;color:rgba(255,255,255,0.35);margin-top:2px;">
                                📂 Formato: <strong style="color:#55EFC4;font-family:monospace;">data/CODIGO_NIVEL.json</strong> 
                                (ej: <strong style="color:#55EFC4;font-family:monospace;">${codigoIso}_A1.json</strong>, <strong style="color:#55EFC4;font-family:monospace;">en_B1.json</strong>)
                            </p>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;flex-shrink:0;">
                        <button class="btn-primary" onclick="window.UIConfig._cargarArchivosTemasNivel()" 
                                style="padding:8px 18px;font-size:12px;font-weight:600;background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.2);border-radius:8px;cursor:pointer;transition:all 0.3s;backdrop-filter:blur(4px);"
                                onmouseover="this.style.background='rgba(255,255,255,0.25)';this.style.transform='scale(1.02)'" 
                                onmouseout="this.style.background='rgba(255,255,255,0.15)';this.style.transform='none'">
                            <i class="fas fa-sync"></i> Buscar Archivos
                        </button>
                        <button class="btn-primary" onclick="window.UIConfig._mostrarAyudaImportacion()" 
                                style="padding:8px 18px;font-size:12px;font-weight:600;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.8);border:1px solid rgba(255,255,255,0.1);border-radius:8px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.background='rgba(255,255,255,0.15)';this.style.borderColor='rgba(255,255,255,0.3)'" 
                                onmouseout="this.style.background='rgba(255,255,255,0.08)';this.style.borderColor='rgba(255,255,255,0.1)'">
                            <i class="fas fa-question-circle"></i> Ayuda
                        </button>
                    </div>
                </div>
                
                <div id="archivosTemasContainer" style="margin-top:14px;background:rgba(255,255,255,0.06);border-radius:12px;padding:14px 16px;border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(4px);">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
                        <span style="font-size:12px;color:rgba(255,255,255,0.6);">
                            <i class="fas fa-folder-open"></i> Archivos disponibles:
                            <span id="archivosCount" style="font-weight:700;color:#74B9FF;font-size:14px;">0</span>
                        </span>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;">
                            <button class="btn-secondary" onclick="window.UIConfig._seleccionarTodosArchivos()" 
                                    style="padding:3px 12px;font-size:10px;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.1);border-radius:4px;cursor:pointer;transition:all 0.2s;"
                                    onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
                                Seleccionar Todos
                            </button>
                            <button class="btn-secondary" onclick="window.UIConfig._deseleccionarTodosArchivos()" 
                                    style="padding:3px 12px;font-size:10px;background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.4);border:1px solid rgba(255,255,255,0.05);border-radius:4px;cursor:pointer;transition:all 0.2s;"
                                    onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                                Deseleccionar
                            </button>
                            <button class="btn-primary" id="btnImportarTemasNivel" onclick="window.UIConfig._importarTemasSeleccionados()" 
                                    style="padding:5px 16px;font-size:11px;font-weight:700;background:linear-gradient(135deg,#00B894,#00CEC9);color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.3s;box-shadow:0 2px 12px rgba(0,206,201,0.3);"
                                    onmouseover="this.style.transform='scale(1.04)';this.style.boxShadow='0 4px 20px rgba(0,206,201,0.5)'" 
                                    onmouseout="this.style.transform='none';this.style.boxShadow='0 2px 12px rgba(0,206,201,0.3)'">
                                <i class="fas fa-file-import"></i> Importar Seleccionados
                            </button>
                        </div>
                    </div>
                    <div id="listaArchivosTemas" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px;max-height:200px;overflow-y:auto;padding-right:4px;">
                        <div style="text-align:center;padding:20px 10px;color:rgba(255,255,255,0.3);font-size:12px;grid-column:1/-1;">
                            <i class="fas fa-info-circle" style="display:block;font-size:22px;margin-bottom:8px;color:rgba(255,255,255,0.2);"></i>
                            Haz clic en <strong style="color:rgba(255,255,255,0.5);">"Buscar Archivos"</strong> para cargar archivos desde <strong style="color:rgba(255,255,255,0.4);font-family:monospace;">data/</strong>
                            <br><span style="font-size:10px;color:rgba(255,255,255,0.2);">
                                Formato: <strong style="color:#55EFC4;font-family:monospace;">CODIGO_NIVEL.json</strong> (ej: <strong style="color:#55EFC4;font-family:monospace;">${codigoIso}_A1.json</strong>)
                            </span>
                        </div>
                    </div>
                </div>
                
                <div id="importacionTemasProgress" style="display:none;margin-top:12px;background:rgba(255,255,255,0.06);border-radius:10px;padding:12px 16px;border:1px solid rgba(255,255,255,0.06);">
                    <div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:4px;">
                        <span id="importacionTemasStatus">Preparando importación...</span>
                        <span id="importacionTemasPorcentaje" style="font-weight:600;color:#74B9FF;">0%</span>
                    </div>
                    <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden;">
                        <div id="importacionTemasBar" style="height:100%;width:0%;background:linear-gradient(90deg,#00B894,#55EFC4,#00CEC9);border-radius:2px;transition:width 0.5s ease;"></div>
                    </div>
                    <div style="font-size:9px;color:rgba(255,255,255,0.3);margin-top:4px;" id="importacionTemasDetalle">Inicializando...</div>
                </div>
                
                <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;font-size:9px;color:rgba(255,255,255,0.3);border-top:1px solid rgba(255,255,255,0.05);padding-top:10px;">
                    <span>📂 <strong style="color:rgba(255,255,255,0.4);font-family:monospace;">data/CODIGO_NIVEL.json</strong></span>
                    <span>🌍 ${nombreIdioma} (<strong style="color:#74B9FF;">${codigoIso}</strong>)</span>
                    <span>📌 ${nombreVersion}</span>
                    <span>📚 Los temas se importan como <strong style="color:#55EFC4;">"En Curso"</strong></span>
                    <span>🔄 Sincronización automática</span>
                </div>
            </div>
        `;
    }

    // ============================================================
    // CARGAR ARCHIVOS REALES DE LA CARPETA data/ - CORREGIDO PARA APK
    // ============================================================

    async _cargarArchivosTemasNivel() {
        const core = this._getCore();
        
        let idiomaActivo = gestorIdiomas?.getIdiomaActivo?.() || 'es';
        let codigoIdioma = this._obtenerCodigoIso(idiomaActivo);
        
        const nombreLower = idiomaActivo.toLowerCase().trim();
        if (this._MAP_NOMBRE_A_ISO[nombreLower]) {
            codigoIdioma = this._MAP_NOMBRE_A_ISO[nombreLower];
            console.log(`🔄 Convertido "${idiomaActivo}" → "${codigoIdioma}"`);
        }
        
        const nombreIdioma = this._getNombreIdioma(codigoIdioma);
        
        core?.mostrarToast(`🔍 Buscando archivos en data/ para ${nombreIdioma} (${codigoIdioma})...`, 'info');
        
        try {
            // 🔥 ARRAY DE RUTAS POSIBLES PARA ENCONTRAR LOS ARCHIVOS
            const posiblesRutas = [
                'data/',
                './data/',
                '../data/',
                'assets/data/',
                './assets/data/',
                '../assets/data/',
                'www/data/',
                './www/data/',
                '../www/data/',
                'app/data/',
                './app/data/',
                '../app/data/',
                'file:///data/',
                'file:///assets/data/',
                'file:///www/data/',
            ];
            
            const archivosPosibles = [
                { nombre: `${codigoIdioma}_A1.json`, idioma: codigoIdioma, nivel: 'A1' },
                { nombre: `${codigoIdioma}_A2.json`, idioma: codigoIdioma, nivel: 'A2' },
                { nombre: `${codigoIdioma}_B1.json`, idioma: codigoIdioma, nivel: 'B1' },
                { nombre: `${codigoIdioma}_B2.json`, idioma: codigoIdioma, nivel: 'B2' },
                { nombre: `${codigoIdioma}_C1.json`, idioma: codigoIdioma, nivel: 'C1' },
                { nombre: `${codigoIdioma}_C2.json`, idioma: codigoIdioma, nivel: 'C2' }
            ];
            
            let archivosExistentes = [];
            let rutaEncontrada = null;
            
            // 🔥 PROBAR TODAS LAS RUTAS POSIBLES
            for (const rutaBase of posiblesRutas) {
                if (archivosExistentes.length > 0) break;
                
                console.log(`🔍 Probando ruta: ${rutaBase}`);
                
                for (const archivo of archivosPosibles) {
                    try {
                        let url = rutaBase + archivo.nombre;
                        
                        // En modo APK, usar XMLHttpRequest para archivos locales
                        if (this._esModoAPK) {
                            const xhr = new XMLHttpRequest();
                            xhr.open('GET', url, false);
                            try {
                                xhr.send();
                                if (xhr.status === 200 || xhr.status === 0) {
                                    if (!archivosExistentes.some(a => a.nombre === archivo.nombre)) {
                                        archivosExistentes.push(archivo);
                                        rutaEncontrada = rutaBase;
                                        console.log(`✅ Archivo encontrado en ${rutaBase}: ${archivo.nombre}`);
                                    }
                                }
                            } catch (e) {
                                // Falló
                            }
                        } else {
                            // En modo web, usar fetch
                            const response = await fetch(url, { method: 'HEAD' });
                            if (response.ok) {
                                if (!archivosExistentes.some(a => a.nombre === archivo.nombre)) {
                                    archivosExistentes.push(archivo);
                                    rutaEncontrada = rutaBase;
                                    console.log(`✅ Archivo encontrado en ${rutaBase}: ${archivo.nombre}`);
                                }
                            }
                        }
                    } catch (e) {
                        // Archivo no existe en esta ruta
                    }
                }
            }
            
            // 🔥 SI NO ENCONTRAMOS ARCHIVOS, MOSTRAR MENSAJE
            if (archivosExistentes.length === 0) {
                const container = document.getElementById('listaArchivosTemas');
                if (container) {
                    container.innerHTML = `
                        <div style="text-align:center;padding:24px 10px;color:rgba(255,255,255,0.4);font-size:12px;grid-column:1/-1;">
                            <i class="fas fa-exclamation-triangle" style="display:block;font-size:28px;margin-bottom:10px;color:#FDCB6E;"></i>
                            No se encontraron archivos en la carpeta <strong style="color:rgba(255,255,255,0.5);">data/</strong> para <strong>${nombreIdioma}</strong> (${codigoIdioma})
                            <br><span style="font-size:10px;color:rgba(255,255,255,0.25);">
                                💡 Guarda archivos con el formato <strong style="color:#55EFC4;font-family:monospace;">${codigoIdioma}_NIVEL.json</strong>
                            </span>
                            <br><span style="font-size:10px;color:rgba(255,255,255,0.15);">
                                Ejemplo: <strong style="color:#55EFC4;font-family:monospace;">${codigoIdioma}_A1.json</strong>, <strong style="color:#55EFC4;font-family:monospace;">${codigoIdioma}_B1.json</strong>
                            </span>
                            ${this._esModoAPK ? `
                                <br><br>
                                <span style="font-size:10px;color:#74B9FF;">
                                    📱 Modo APK detectado: Los archivos deben estar en la carpeta <strong>assets/data/</strong> del APK
                                </span>
                                <br>
                                <span style="font-size:9px;color:rgba(255,255,255,0.2);">
                                    🔧 Puedes generar el JSON con el <strong>Botón Super Power</strong> y guardarlo manualmente
                                </span>
                            ` : `
                                <br><br>
                                <span style="font-size:10px;color:#55EFC4;">
                                    🔥 Puedes generar el JSON con el <strong>Botón Super Power</strong> arriba
                                </span>
                            `}
                            <br><br>
                            <button class="btn-secondary" onclick="window.UIConfig._mostrarAyudaImportacion()" 
                                    style="padding:4px 16px;font-size:10px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.06);border-radius:4px;cursor:pointer;transition:all 0.2s;"
                                    onmouseover="this.style.background='rgba(255,255,255,0.12)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'">
                                <i class="fas fa-question-circle"></i> Ver Ayuda
                            </button>
                        </div>
                    `;
                }
                const count = document.getElementById('archivosCount');
                if (count) count.textContent = '0';
                this._archivosDisponibles = [];
                this._archivosSeleccionados = new Set();
                
                const mensaje = this._esModoAPK 
                    ? `ℹ️ No hay archivos en data/ para ${nombreIdioma}. Asegúrate de que estén en assets/data/ del APK. Formato: ${codigoIdioma}_NIVEL.json`
                    : `ℹ️ No hay archivos en data/ para ${nombreIdioma}. Formato: ${codigoIdioma}_NIVEL.json`;
                
                core?.mostrarToast(mensaje, 'info');
                return;
            }
            
            // Guardar archivos disponibles y la ruta encontrada
            this._archivosDisponibles = archivosExistentes;
            this._archivosSeleccionados = new Set();
            
            // Guardar la ruta para futuras importaciones
            if (rutaEncontrada) {
                this._carpetaData = rutaEncontrada;
                this._rutaEncontrada = rutaEncontrada;
                console.log(`📂 Ruta de datos establecida: ${this._carpetaData}`);
            }
            
            this._renderizarListaArchivos(archivosExistentes);
            
            const count = document.getElementById('archivosCount');
            if (count) count.textContent = archivosExistentes.length;
            
            core?.mostrarToast(`✅ ${archivosExistentes.length} archivo(s) encontrado(s) en data/ para ${nombreIdioma} (${codigoIdioma})`, 'success');
            
        } catch (error) {
            console.error('❌ Error cargando archivos:', error);
            core?.mostrarToast('❌ Error al cargar archivos: ' + error.message, 'error');
        }
    }

    // ============================================================
    // RENDERIZAR LISTA DE ARCHIVOS
    // ============================================================

    _renderizarListaArchivos(archivos) {
        const container = document.getElementById('listaArchivosTemas');
        if (!container) return;
        
        if (archivos.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:20px 10px;color:rgba(255,255,255,0.3);font-size:12px;grid-column:1/-1;">
                    <i class="fas fa-info-circle" style="display:block;font-size:22px;margin-bottom:8px;color:rgba(255,255,255,0.15);"></i>
                    No hay archivos disponibles en data/ para este idioma
                </div>
            `;
            return;
        }
        
        let html = '';
        for (const archivo of archivos) {
            const estaSeleccionado = this._archivosSeleccionados.has(archivo.nombre);
            const nivelIcono = this._NIVEL_ICONOS?.[archivo.nivel] || '📚';
            const nivelColor = this._NIVEL_COLORES?.[archivo.nivel] || '#6C5CE7';
            const nombreMostrar = archivo.nombre;
            
            html += `
                <div class="archivo-item" 
                     style="background:${estaSeleccionado ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'};border:2px solid ${estaSeleccionado ? 'rgba(85,239,196,0.4)' : 'rgba(255,255,255,0.06)'};border-radius:8px;padding:6px 10px;cursor:pointer;transition:all 0.25s;display:flex;align-items:center;gap:8px;"
                     onclick="window.UIConfig._toggleSeleccionArchivo('${archivo.nombre}')"
                     onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                     onmouseout="this.style.background='${estaSeleccionado ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}'">
                    <input type="checkbox" ${estaSeleccionado ? 'checked' : ''} 
                           style="width:14px;height:14px;cursor:pointer;accent-color:#00B894;flex-shrink:0;"
                           onclick="event.stopPropagation();window.UIConfig._toggleSeleccionArchivo('${archivo.nombre}')">
                    <span style="font-size:14px;">${nivelIcono}</span>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                            ${nombreMostrar}
                        </div>
                        <div style="font-size:8px;color:rgba(255,255,255,0.3);">
                            ${this._getNombreIdioma(archivo.idioma)} · Nivel ${archivo.nivel}
                            <span style="color:${nivelColor};font-weight:600;">${nivelIcono}</span>
                        </div>
                    </div>
                    ${estaSeleccionado ? '<span style="font-size:11px;color:#55EFC4;">✅</span>' : ''}
                </div>
            `;
        }
        
        container.innerHTML = html;
        this._actualizarContadorSeleccionados();
    }

    // ============================================================
    // ALTERNAR SELECCIÓN DE ARCHIVO
    // ============================================================

    _toggleSeleccionArchivo(nombre) {
        if (this._archivosSeleccionados.has(nombre)) {
            this._archivosSeleccionados.delete(nombre);
        } else {
            this._archivosSeleccionados.add(nombre);
        }
        this._renderizarListaArchivos(this._archivosDisponibles);
        this._actualizarContadorSeleccionados();
    }

    // ============================================================
    // SELECCIONAR TODOS LOS ARCHIVOS
    // ============================================================

    _seleccionarTodosArchivos() {
        for (const archivo of this._archivosDisponibles) {
            this._archivosSeleccionados.add(archivo.nombre);
        }
        this._renderizarListaArchivos(this._archivosDisponibles);
        this._actualizarContadorSeleccionados();
        const core = this._getCore();
        core?.mostrarToast(`✅ ${this._archivosSeleccionados.size} archivos seleccionados`, 'success');
    }

    // ============================================================
    // DESELECCIONAR TODOS LOS ARCHIVOS
    // ============================================================

    _deseleccionarTodosArchivos() {
        this._archivosSeleccionados = new Set();
        this._renderizarListaArchivos(this._archivosDisponibles);
        this._actualizarContadorSeleccionados();
        const core = this._getCore();
        core?.mostrarToast('🔄 Todos los archivos deseleccionados', 'info');
    }

    // ============================================================
    // ACTUALIZAR CONTADOR DE SELECCIONADOS
    // ============================================================

    _actualizarContadorSeleccionados() {
        const count = document.getElementById('archivosCount');
        if (count) {
            const total = this._archivosDisponibles.length;
            const seleccionados = this._archivosSeleccionados.size;
            count.textContent = `${seleccionados}/${total}`;
        }
    }

    // ============================================================
    // IMPORTAR TEMAS SELECCIONADOS - CON RUTA GUARDADA Y XMLHttpRequest PARA APK
    // ============================================================

    async _importarTemasSeleccionados() {
        const core = this._getCore();
        
        if (this._archivosSeleccionados.size === 0) {
            core?.mostrarToast('⚠️ Selecciona al menos un archivo para importar', 'warning');
            return;
        }
        
        if (this._importandoTemasNivel) {
            core?.mostrarToast('⏳ Ya hay una importación en curso...', 'warning');
            return;
        }
        
        const archivosSeleccionados = this._archivosDisponibles.filter(
            a => this._archivosSeleccionados.has(a.nombre)
        );
        
        const confirmar = await core?.confirm(
            `⚠️ ¿Importar ${archivosSeleccionados.length} archivo(s)?\n\n` +
            `Archivos seleccionados:\n${archivosSeleccionados.map(a => `  • ${a.nombre} (${this._getNombreIdioma(a.idioma)} - Nivel ${a.nivel})`).join('\n')}\n\n` +
            `📚 Los temas se importarán como "En Curso"\n` +
            `🔄 Se sincronizarán automáticamente con el sistema\n` +
            `💡 Esta acción NO se puede deshacer fácilmente`,
            '📂 Importar Temas por Niveles'
        );
        
        if (!confirmar) return;
        
        this._importandoTemasNivel = true;
        this._importacionResultados = [];
        
        core?.abrirModal('📥 Importando Temas por Niveles...');
        const textarea = document.getElementById('jsonTextarea');
        if (textarea) {
            textarea.value = '';
            textarea.readOnly = true;
            textarea.style.minHeight = '200px';
            textarea.style.fontSize = '12px';
            textarea.style.fontFamily = 'monospace';
            textarea.style.background = 'var(--bg)';
        }
        
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            const oldInfo = modalContent.querySelector('.importacion-progress-info');
            if (oldInfo) oldInfo.remove();
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'importacion-progress-info';
            infoDiv.style.cssText = `
                background: var(--bg);
                border-radius: 12px;
                padding: 20px 24px;
                margin-bottom: 12px;
                border-left: 4px solid #00B894;
                box-shadow: 0 2px 12px rgba(0,0,0,0.06);
            `;
            
            infoDiv.innerHTML = `
                <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
                    <div id="importacionSpinner" style="font-size:32px;animation:spin 1s linear infinite;color:#00B894;">
                        <i class="fas fa-spinner"></i>
                    </div>
                    <div style="flex:1;">
                        <div id="importacionModalStatus" style="font-size:15px;font-weight:700;color:var(--dark);">
                            ⏳ Preparando importación...
                        </div>
                        <div id="importacionModalDetalle" style="font-size:12px;color:var(--gray);margin-top:2px;">
                            Inicializando...
                        </div>
                    </div>
                    <div id="importacionModalPct" style="font-size:18px;font-weight:800;color:#00B894;">
                        0%
                    </div>
                </div>
                
                <div style="height:8px;background:var(--light);border-radius:4px;overflow:hidden;position:relative;">
                    <div id="importacionModalBar" style="height:100%;width:0%;background:linear-gradient(90deg,#00B894,#55EFC4,#00CEC9);border-radius:4px;transition:width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);position:relative;">
                        <div style="position:absolute;right:0;top:-2px;width:16px;height:12px;background:#55EFC4;border-radius:2px;filter:blur(4px);opacity:0.6;"></div>
                    </div>
                </div>
                
                <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-light);margin-top:6px;">
                    <span id="importacionModalCount">0/${archivosSeleccionados.length}</span>
                    <span id="importacionModalArchivo">Esperando...</span>
                </div>
            `;
            
            const modalBody = modalContent.querySelector('.modal-body');
            if (modalBody) {
                modalBody.insertBefore(infoDiv, modalBody.firstChild);
            }
            
            if (!document.getElementById('importacionStyles')) {
                const style = document.createElement('style');
                style.id = 'importacionStyles';
                style.textContent = `
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes pulseGlow {
                        0%, 100% { opacity: 0.6; }
                        50% { opacity: 1; }
                    }
                    .importacion-success-icon {
                        animation: pulseGlow 1.5s ease-in-out infinite;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        let totalImportados = 0;
        let totalErrores = 0;
        let totalTemas = 0;
        let totalHistorias = 0;
        let totalFrases = 0;
        
        for (let i = 0; i < archivosSeleccionados.length; i++) {
            const archivo = archivosSeleccionados[i];
            const progreso = Math.round(((i) / archivosSeleccionados.length) * 100);
            
            const statusEl = document.getElementById('importacionModalStatus');
            const detalleEl = document.getElementById('importacionModalDetalle');
            const barEl = document.getElementById('importacionModalBar');
            const pctEl = document.getElementById('importacionModalPct');
            const countEl = document.getElementById('importacionModalCount');
            const archivoEl = document.getElementById('importacionModalArchivo');
            const spinnerEl = document.getElementById('importacionSpinner');
            
            if (statusEl) statusEl.textContent = `📄 Importando ${archivo.nombre}...`;
            if (detalleEl) detalleEl.textContent = `${i + 1}/${archivosSeleccionados.length}: ${archivo.nombre}`;
            if (barEl) barEl.style.width = `${progreso}%`;
            if (pctEl) {
                pctEl.textContent = `${progreso}%`;
                pctEl.style.color = progreso > 50 ? '#00B894' : '#0984E3';
            }
            if (countEl) countEl.textContent = `${i + 1}/${archivosSeleccionados.length}`;
            if (archivoEl) archivoEl.textContent = `📄 ${archivo.nombre}`;
            if (spinnerEl) spinnerEl.style.color = '#0984E3';
            
            if (textarea) {
                const logLines = [
                    `📄 ${archivo.nombre}`,
                    `   🌍 ${this._getNombreIdioma(archivo.idioma)} · Nivel ${archivo.nivel}`,
                    `   ⏳ Importando...`
                ];
                textarea.value += logLines.join('\n') + '\n\n';
                textarea.scrollTop = textarea.scrollHeight;
            }
            
            try {
                let contenido = null;
                let urlUsada = '';
                
                // 🔥 INTENTAR CARGAR EL ARCHIVO
                const rutas = this._rutaEncontrada ? [this._rutaEncontrada] : ['data/', './data/', '../data/', 'assets/data/'];
                rutas.push('data/'); // fallback
                
                for (const ruta of rutas) {
                    try {
                        const url = ruta + archivo.nombre;
                        console.log(`📂 Intentando cargar desde: ${url}`);
                        
                        if (this._esModoAPK) {
                            // En APK usar XMLHttpRequest
                            const xhr = new XMLHttpRequest();
                            xhr.open('GET', url, false);
                            xhr.send();
                            if (xhr.status === 200 || xhr.status === 0) {
                                contenido = JSON.parse(xhr.responseText);
                                urlUsada = url;
                                console.log(`✅ Archivo cargado desde ${url}`);
                                break;
                            }
                        } else {
                            // En web usar fetch
                            const response = await fetch(url);
                            if (response.ok) {
                                contenido = await response.json();
                                urlUsada = url;
                                console.log(`✅ Archivo cargado desde ${url}`);
                                break;
                            }
                        }
                    } catch (e) {
                        // Falló, probar siguiente ruta
                        console.log(`❌ Falló con ${ruta}:`, e.message);
                    }
                }
                
                if (!contenido) {
                    throw new Error(`No se pudo cargar el archivo ${archivo.nombre} desde ninguna ruta`);
                }
                
                const resultado = await this._importarTemaDesdeArchivo(contenido, archivo);
                
                totalImportados++;
                totalTemas += resultado.temas || 0;
                totalHistorias += resultado.historias || 0;
                totalFrases += resultado.frases || 0;
                
                this._importacionResultados.push({
                    archivo: archivo.nombre,
                    exito: true,
                    resultado: resultado
                });
                
                if (textarea) {
                    textarea.value += `   ✅ Importado desde ${urlUsada}: ${resultado.temas} temas, ${resultado.historias} historias, ${resultado.frases} frases\n\n`;
                    textarea.scrollTop = textarea.scrollHeight;
                }
                
                console.log(`✅ Archivo ${archivo.nombre} importado correctamente`);
                
            } catch (error) {
                console.error(`❌ Error importando ${archivo.nombre}:`, error);
                totalErrores++;
                this._importacionResultados.push({
                    archivo: archivo.nombre,
                    exito: false,
                    error: error.message
                });
                
                if (textarea) {
                    textarea.value += `   ❌ Error: ${error.message}\n\n`;
                    textarea.scrollTop = textarea.scrollHeight;
                }
            }
        }
        
        const statusEl = document.getElementById('importacionModalStatus');
        const barEl = document.getElementById('importacionModalBar');
        const pctEl = document.getElementById('importacionModalPct');
        const detalleEl = document.getElementById('importacionModalDetalle');
        const spinnerEl = document.getElementById('importacionSpinner');
        const archivoEl = document.getElementById('importacionModalArchivo');
        
        if (spinnerEl) {
            spinnerEl.innerHTML = '<i class="fas fa-check-circle" style="color:#00B894;font-size:32px;animation:none;"></i>';
            spinnerEl.style.animation = 'none';
        }
        
        if (statusEl) {
            if (totalErrores === 0) {
                statusEl.innerHTML = '✅ <span style="color:#00B894;">¡Importación completada con éxito!</span>';
            } else {
                statusEl.innerHTML = `⚠️ Importación completada con ${totalErrores} errores`;
            }
        }
        
        if (barEl) barEl.style.width = '100%';
        if (barEl) barEl.style.background = 'linear-gradient(90deg,#00B894,#55EFC4)';
        
        if (pctEl) {
            pctEl.textContent = '100%';
            pctEl.style.color = '#00B894';
            pctEl.style.fontSize = '24px';
        }
        
        if (detalleEl) {
            detalleEl.innerHTML = `
                <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:4px;">
                    <span style="color:#00B894;">✅ ${totalImportados} importados</span>
                    ${totalErrores > 0 ? `<span style="color:#FF7675;">❌ ${totalErrores} errores</span>` : ''}
                    <span style="color:var(--gray);">📚 ${totalTemas} temas</span>
                    <span style="color:var(--gray);">📖 ${totalHistorias} historias</span>
                    <span style="color:var(--gray);">📝 ${totalFrases} frases</span>
                </div>
            `;
        }
        
        if (archivoEl) archivoEl.textContent = '✅ Completado';
        
        if (textarea) {
            const resumen = `
╔═══════════════════════════════════════════════════════╗
║                    ✅ IMPORTACIÓN COMPLETADA           ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  📂 Archivos procesados: ${archivosSeleccionados.length}                            ║
║  ✅ Importados: ${totalImportados}                                      ║
║  ${totalErrores > 0 ? `❌ Errores: ${totalErrores}` : '✨ Sin errores'}                                      ║
║                                                       ║
║  📊 CONTENIDO IMPORTADO:                              ║
║  📚 Temas: ${totalTemas}                                           ║
║  📖 Historias: ${totalHistorias}                                        ║
║  📝 Frases: ${totalFrases}                                            ║
║                                                       ║
║  📌 Todos los temas marcados como "En Curso"         ║
║  🔄 Módulos actualizados automáticamente              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`;
            textarea.value += resumen;
            textarea.scrollTop = textarea.scrollHeight;
        }
        
        await this._recargarConfiguracion();
        if (window.UITemas) { await window.UITemas._renderTemas(); }
        if (window.UIDashboard) { window.UIDashboard._cargarDashboardInicial(core); }
        if (window.UIGrammar) { window.UIGrammar._cargarGramatica(); }
        
        core?.mostrarToast(`✅ ${totalImportados} archivos importados correctamente`, 'success');
        
        this._importandoTemasNivel = false;
        this._archivosSeleccionados = new Set();
        this._renderizarListaArchivos(this._archivosDisponibles);
        this._actualizarContadorSeleccionados();
    }

    // ============================================================
    // IMPORTAR TEMA DESDE ARCHIVO
    // ============================================================

    async _importarTemaDesdeArchivo(data, archivo) {
        const core = this._getCore();
        const idioma = data.meta.idioma || archivo.idioma;
        const nivel = data.meta.nivel || archivo.nivel;
        const versionEstandar = data.meta.version_estandar || this._obtenerVersionActiva(idioma);
        const nombreVersion = data.meta.nombre_version || this._obtenerNombreVersion(idioma, versionEstandar);
        const esJeroglifico = this._esJeroglifico(idioma);
        
        let totalTemas = 0;
        let totalHistorias = 0;
        let totalFrases = 0;
        
        for (const temaData of (data.temas || [])) {
            const nuevoTema = {
                nombre: temaData.nombre,
                descripcion: temaData.descripcion || '',
                idioma: idioma,
                nivel: nivel,
                icono: temaData.icono || '📁',
                fechaCreacion: new Date().toISOString(),
                estado: 'en_curso',
                historiasIds: [],
                palabrasClave: [],
                _esPredefinido: true,
                _esImportado: true,
                origen: 'temas_nivel',
                _version_estandar: versionEstandar,
                _nombre_version: nombreVersion,
                _completado: false
            };
            
            const temaId = await db.guardarTema(nuevoTema);
            if (!temaId) continue;
            totalTemas++;
            
            const historiasIds = [];
            
            for (const historiaData of (temaData.historias || [])) {
                const historiaObj = {
                    titulo: historiaData.titulo || 'Historia sin título',
                    temaId: temaId,
                    idioma: idioma,
                    nivel: nivel,
                    fechaCreacion: new Date().toISOString(),
                    estado: 'en_curso',
                    frases: (historiaData.frases || []).length,
                    _version_estandar: versionEstandar,
                    _nombre_version: nombreVersion,
                    _esImportada: true,
                    _importadoDesdeJSON: true,
                    _completada: false
                };
                
                const historiaId = await db.guardarHistoria(historiaObj);
                if (!historiaId) continue;
                historiasIds.push(historiaId);
                totalHistorias++;
                
                for (const fraseData of (historiaData.frases || [])) {
                    if (!fraseData.original || !fraseData.traduccion) continue;
                    
                    const fraseObj = {
                        original: fraseData.original,
                        traduccion: fraseData.traduccion,
                        historiaId: historiaId,
                        idioma: idioma,
                        nivel: nivel,
                        esJeroglifico: esJeroglifico,
                        pinyinCompleto: fraseData.pinyin || '',
                        transcripcion: fraseData.transcripcion || '',
                        segmentacion: fraseData.segmentacion || null,
                        palabras: [],
                        rg: 0,
                        rcn: 0,
                        activa: true,
                        reglaGramatical: fraseData.regla_gramatical || null,
                        explicacionGramatical: fraseData.explicacion_gramatical || null,
                        tipoRegla: fraseData.tipo_regla || null,
                        _version_estandar: versionEstandar,
                        _esImportada: true
                    };
                    
                    for (const pData of (fraseData.palabras || [])) {
                        const palabraText = pData.palabra || pData.hanzi || '';
                        if (!palabraText) continue;
                        
                        const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                        let palabraExistente = palabrasExistentes.find(p =>
                            (p.palabra || p.hanzi || '') === palabraText
                        );
                        
                        let palabraId;
                        if (palabraExistente) {
                            palabraId = palabraExistente.id;
                            await db.guardarPalabra({
                                ...palabraExistente,
                                frecuencia: (palabraExistente.frecuencia || 0) + 1
                            });
                        } else {
                            const nuevaPalabra = {
                                palabra: palabraText,
                                hanzi: esJeroglifico ? palabraText : '',
                                pinyin: esJeroglifico ? (pData.pinyin || '') : '',
                                transcripcion: !esJeroglifico ? (pData.transcripcion || '') : '',
                                significado: pData.significado || palabraText,
                                familia: pData.tipo || pData.familia || 'sustantivo',
                                familias: [pData.tipo || pData.familia || 'sustantivo'],
                                familiaSemantica: pData.familiaSemantica || 'General',
                                nivel: nivel,
                                tipo: pData.tipo || 'sustantivo',
                                idioma: idioma,
                                frecuencia: 1,
                                neuroScore: 0.5,
                                nivelDominio: 'nuevo',
                                fechaCreacion: Date.now(),
                                _version_estandar: versionEstandar,
                                _esImportada: true
                            };
                            palabraId = await db.guardarPalabra(nuevaPalabra);
                        }
                        
                        if (palabraId) {
                            fraseObj.palabras.push({
                                id: palabraId,
                                palabra: palabraText,
                                hanzi: esJeroglifico ? palabraText : '',
                                pinyin: esJeroglifico ? (pData.pinyin || '') : '',
                                transcripcion: !esJeroglifico ? (pData.transcripcion || '') : '',
                                significado: pData.significado || palabraText,
                                familia: pData.tipo || pData.familia || 'sustantivo'
                            });
                        }
                    }
                    
                    await db.guardarFrase(fraseObj);
                    totalFrases++;
                }
            }
            
            await db.actualizarTema(temaId, {
                historiasIds: historiasIds,
                frases: totalFrases,
                _tieneContenido: true,
                estado: 'en_curso',
                _completado: false
            });
        }
        
        if (esJeroglifico && data.caracteres_destacados) {
            for (const item of (data.caracteres_destacados.lista || [])) {
                const caracter = item.caracter;
                if (!caracter) continue;
                
                const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                const existe = palabrasExistentes.find(p =>
                    (p.palabra || p.hanzi || '') === caracter && p.esCaracterRaiz === true
                );
                
                if (!existe) {
                    const raizObj = {
                        palabra: caracter,
                        hanzi: caracter,
                        pinyin: item.pinyin || '',
                        significado: item.significado || caracter,
                        familia: 'caracter_raiz',
                        familias: ['caracter_raiz'],
                        familiaSemantica: 'Caracteres Raíz',
                        nivel: nivel,
                        tipo: 'caracter_raiz',
                        idioma: idioma,
                        frecuencia: item.frecuencia || 1,
                        neuroScore: 0.5,
                        nivelDominio: 'nuevo',
                        fechaCreacion: Date.now(),
                        esCaracterRaiz: true,
                        tema: 'General',
                        numero_trazos: 0,
                        estructura: { trazos_clave: [], radicales: [], tipo_estructura: 'simple' },
                        mnemotecnia: `🧠 ${caracter} significa "${item.significado}"`,
                        variantes: null,
                        esPalabraDerivada: false,
                        caracterRaiz: null,
                        desgloseMorfologico: '',
                        desgloseCaracteres: [],
                        asociacionVisual: '',
                        ejemploFrase: (item.frases_de_la_historia || [])[0] || '',
                        familiaSemanticaPrincipal: 'Caracteres Raíz',
                        temaFamilia: 'General',
                        _version_estandar: versionEstandar,
                        _esImportada: true
                    };
                    await db.guardarPalabra(raizObj);
                }
            }
        }
        
        return {
            temas: totalTemas,
            historias: totalHistorias,
            frases: totalFrases
        };
    }

    // ============================================================
    // MOSTRAR AYUDA DE IMPORTACIÓN
    // ============================================================

    _mostrarAyudaImportacion() {
        const core = this._getCore();
        const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
        const codigoIso = this._obtenerCodigoIso(idiomaActivo);
        const nombreIdioma = this._getNombreIdioma(codigoIso);
        
        const mensaje = `
📂 **IMPORTACIÓN DE TEMAS POR NIVELES**

---

**📁 ¿Cómo funciona?**

Importa temas predefinidos desde archivos JSON guardados en la carpeta \`data/\`.

---

**📄 Formato de archivos (IMPORTANTE)**

Los archivos DEBEN usar el **código ISO** del idioma, NO el nombre:

\`\`\`
data/CODIGO_NIVEL.json
\`\`\`

**Ejemplos CORRECTOS:**
• \`data/zh_A1.json\` → Chino, nivel A1
• \`data/en_B1.json\` → Inglés, nivel B1
• \`data/it_A2.json\` → Italiano, nivel A2
• \`data/es_A1.json\` → Español, nivel A1

**Ejemplos INCORRECTOS:**
❌ \`data/Chino_A1.json\`
❌ \`data/Ingles_B1.json\`
❌ \`data/Italiano_A2.json\`

---

**🌍 Códigos ISO de idiomas soportados**

| Código | Idioma |
|--------|--------|
| \`zh\`  | Chino |
| \`en\`  | Inglés |
| \`es\`  | Español |
| \`it\`  | Italiano |
| \`fr\`  | Francés |
| \`de\`  | Alemán |
| \`ja\`  | Japonés |
| \`ko\`  | Coreano |
| \`pt\`  | Portugués |
| \`ru\`  | Ruso |
| \`ar\`  | Árabe |
| \`hi\`  | Hindi |

---

**📊 Niveles soportados**

\`A1\` · \`A2\` · \`B1\` · \`B2\` · \`C1\` · \`C2\`

---

**📄 ¿Cómo generar el JSON?**

1. Usa el **Botón Super Power** (arriba) para generar una plantilla completa.
2. Pide a la IA que complete la plantilla con contenido real.
3. Guarda el JSON completado en la carpeta \`data/\` con el formato CORRECTO.

---

**⚙️ Importación**

1. Haz clic en **"Buscar Archivos"** para ver los archivos disponibles en \`data/\`
2. Selecciona los archivos que quieres importar
3. Haz clic en **"Importar Seleccionados"**
4. Verás el progreso en tiempo real con un modal similar al Super Power

---

**📌 Características**

• ✅ Los temas se importan como **"En Curso"** (nunca como completado)
• ✅ Sincronización automática con los módulos de **Temas**, **Gramática** y **Caracteres**
• ✅ Soporte para **palabras desglosadas** y **transcripción fonética**
• ✅ Para idiomas jeroglíficos, se importan automáticamente los **caracteres destacados**

---

📌 **Versión:** 24.4
🔄 **Actualizado:** ${new Date().toLocaleDateString()}`;

        core?.alert(mensaje, '📂 Ayuda: Importación de Temas por Niveles');
    }

    // ============================================================
    // GENERAR SUPER JSON - CON INSTRUCCIONES CLARAS PARA DESGLOSE COMPLETO
    // ============================================================

    async _generarSuperJSON() {
        if (this._generandoSuperJSON) {
            this.core?.mostrarToast('⏳ Ya hay una generación en curso...', 'warning');
            return;
        }
        this._generandoSuperJSON = true;
        const core = this._getCore();
        try {
            const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
            const nivel = this._obtenerNivelRealUsuario();
            const esJeroglifico = this._esJeroglifico(idioma);
            const idiomaNativo = this._obtenerIdiomaNativo();
            const nombreIdioma = this._getNombreIdioma(idioma);
            const versionEstandar = this._obtenerVersionActiva(idioma);
            const nombreVersion = this._obtenerNombreVersion(idioma, versionEstandar);
            
            const temasData = this._TEMAS_PREDEFINIDOS[versionEstandar]?.[nivel] || 
                              this._TEMAS_PREDEFINIDOS[this._VERSION_DEFECTO]?.[nivel] || 
                              ['Mi familia', 'La casa', 'Comida', 'Rutina diaria', 'La ciudad'];
            
            const temas = temasData.map(t => ({
                id: t.toLowerCase().replace(/\s+/g, '_'),
                nombre: t,
                descripcion: `Aprende vocabulario y frases sobre "${t}" en ${nombreIdioma}`,
                icono: '📁'
            }));
            
            core?.mostrarToast(`🧠 Generando plantilla Super JSON para ${nombreIdioma} (${nivel}) con ${nombreVersion}...`, 'info');
            const numTemas = temas.length || 8;
            const numHistorias = numTemas * 3;
            const numFrases = numHistorias * 6;
            
            const plantilla = this._generarPlantillaSuperJSON(idioma, nivel, idiomaNativo, nombreIdioma, esJeroglifico, temas, versionEstandar, nombreVersion);
            
            core?.abrirModal(`⚡ Super JSON - ${nombreIdioma} (${nivel}) - ${nombreVersion}`);
            const textarea = document.getElementById('jsonTextarea');
            if (textarea) {
                textarea.value = JSON.stringify(plantilla, null, 2);
                textarea.readOnly = false;
                textarea.style.minHeight = '500px';
                textarea.style.fontSize = '11px';
                textarea.style.fontFamily = 'monospace';
                textarea.style.lineHeight = '1.4';
            }
            
            const importBtn = document.getElementById('jsonImport');
            if (importBtn) {
                const newImportBtn = importBtn.cloneNode(true);
                importBtn.parentNode.replaceChild(newImportBtn, importBtn);
                const self = this;
                newImportBtn.onclick = async function() {
                    const jsonText = document.getElementById('jsonTextarea')?.value;
                    if (!jsonText || jsonText.trim() === '') {
                        self.core?.mostrarToast('❌ No hay JSON para importar', 'error');
                        return;
                    }
                    try {
                        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importando...';
                        this.disabled = true;
                        const data = JSON.parse(jsonText);
                        if (data._INSTRUCCIONES_PARA_IA) {
                            const tieneHistorias = data.historias && data.historias.length > 0 && 
                                                   data.historias[0].frases && data.historias[0].frases.length > 0;
                            let tieneDatosReales = false;
                            if (tieneHistorias) {
                                const primeraFrase = data.historias[0].frases[0];
                                if (primeraFrase && primeraFrase.original && 
                                    !primeraFrase.original.startsWith('Frase') &&
                                    !primeraFrase.original.startsWith('[')) {
                                    tieneDatosReales = true;
                                }
                            }
                            if (!tieneDatosReales && data.temas && data.temas.length > 0) {
                                for (const tema of data.temas) {
                                    if (tema.historias && tema.historias.length > 0) {
                                        const primeraHistoria = tema.historias[0];
                                        if (primeraHistoria.frases && primeraHistoria.frases.length > 0) {
                                            const primeraFrase = primeraHistoria.frases[0];
                                            if (primeraFrase.original && 
                                                !primeraFrase.original.startsWith('Frase') &&
                                                !primeraFrase.original.startsWith('[')) {
                                                tieneDatosReales = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            if (!tieneDatosReales) {
                                self.core?.mostrarToast('⚠️ Esto es una PLANTILLA vacía. Pide a la IA que la complete y luego importa.', 'warning');
                                this.innerHTML = '<i class="fas fa-file-import"></i> Importar';
                                this.disabled = false;
                                return;
                            }
                            await self._importarSuperJSON(data);
                            self.core?.cerrarModal();
                            self.core?.mostrarToast('✅ Super JSON importado correctamente', 'success');
                            if (window.UITemas) { setTimeout(() => window.UITemas._renderTemas(), 300); }
                            if (window.UIGrammar) { setTimeout(() => window.UIGrammar._cargarGramatica(), 300); }
                            if (window.UIDashboard) { window.UIDashboard._cargarDashboardInicial(self.core); }
                            if (window.UIEspacio) { setTimeout(() => window.UIEspacio._renderizarMiEspacio(), 300); }
                            if (window.UICaracteres) { setTimeout(() => window.UICaracteres.cargar(self.core), 300); }
                        } else {
                            await self._importarSuperJSON(data);
                            self.core?.cerrarModal();
                            self.core?.mostrarToast('✅ Super JSON importado correctamente', 'success');
                            if (window.UITemas) { setTimeout(() => window.UITemas._renderTemas(), 300); }
                            if (window.UIDashboard) { window.UIDashboard._cargarDashboardInicial(self.core); }
                        }
                    } catch (e) {
                        console.error('❌ Error importando:', e);
                        self.core?.mostrarToast('❌ Error: ' + e.message, 'error');
                    } finally {
                        this.innerHTML = '<i class="fas fa-file-import"></i> Importar';
                        this.disabled = false;
                    }
                };
            }
            
            const copyBtn = document.getElementById('jsonCopy');
            if (copyBtn) {
                const newCopyBtn = copyBtn.cloneNode(true);
                copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
                newCopyBtn.onclick = function() {
                    const textarea = document.getElementById('jsonTextarea');
                    if (textarea) {
                        navigator.clipboard.writeText(textarea.value)
                            .then(() => self.core?.mostrarToast('📋 Copiado al portapapeles', 'success'))
                            .catch(() => {
                                textarea.select();
                                document.execCommand('copy');
                                self.core?.mostrarToast('📋 Copiado al portapapeles', 'success');
                            });
                    }
                };
            }
            
            const modalContent = document.querySelector('.modal-content');
            if (modalContent) {
                const oldInfo = modalContent.querySelector('.super-json-info');
                if (oldInfo) oldInfo.remove();
                const infoDiv = document.createElement('div');
                infoDiv.className = 'super-json-info';
                infoDiv.style.cssText = `
                    background: var(--bg);
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin-bottom: 12px;
                    font-size: 12px;
                    color: var(--gray);
                    border-left: 4px solid var(--primary);
                `;
                infoDiv.innerHTML = `
                    <strong>📊 Resumen del Super JSON:</strong><br>
                    🌍 ${nombreIdioma} (${nivel}) · ${idiomaNativo}<br>
                    📚 ${numTemas} temas · 📖 ${numHistorias} historias · 📝 ${numFrases} frases
                    ${esJeroglifico ? ' · 🀄 Incluye caracteres y familias' : ''}
                    <br>
                    📌 Versión del estándar: <strong>${nombreVersion}</strong>
                    <br>
                    <span style="font-size:11px;color:var(--gray-light);">
                        💡 <strong>IMPORTANTE:</strong> Esta es una PLANTILLA. Pide a la IA que la complete y luego pulsa "Importar" para cargarla.
                    </span>
                    <br>
                    <span style="font-size:10px;color:var(--success);">
                        ✅ El JSON completado se importará automáticamente.
                    </span>
                    <br>
                    <span style="font-size:10px;color:var(--secondary);">
                        🎤 Incluye transcripción fonética para todas las palabras y frases.
                    </span>
                    <br>
                    <span style="font-size:10px;color:var(--warning);">
                        🔄 Los temas importados se sincronizarán automáticamente con "Temas Predefinidos".
                    </span>
                    <br>
                    <span style="font-size:10px;color:var(--primary);font-weight:600;background:var(--primary)08;padding:2px 10px;border-radius:4px;">
                        📝 <strong>¡IMPORTANTE!</strong> La IA DEBE generar TODAS las palabras desglosadas para CADA frase.
                        <br>El array "palabras" de cada frase debe contener TODAS las palabras de la frase,
                        <br>con sus respectivos campos: palabra, transcripcion/pinyin, familia, tipo, significado.
                    </span>
                    <br>
                    <span style="font-size:10px;color:var(--danger);font-weight:700;background:var(--danger)10;padding:2px 10px;border-radius:4px;margin-top:4px;">
                        🔥 <strong>¡OBLIGATORIO!</strong> Incluye TODAS las palabras: artículos, preposiciones, conjunciones, verbos, sustantivos, adjetivos, etc.
                        <br>Si la frase tiene 8 palabras, el array debe tener 8 entradas.
                    </span>
                `;
                const modalBody = modalContent.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.insertBefore(infoDiv, modalBody.firstChild);
                }
            }
            
            core?.mostrarToast(`✅ Plantilla Super JSON generada (${numTemas} temas, ${numHistorias} historias) con ${nombreVersion}`, 'success');
            
        } catch (error) {
            console.error('❌ Error generando Super JSON:', error);
            core?.mostrarToast('❌ Error: ' + error.message, 'error');
        } finally {
            this._generandoSuperJSON = false;
        }
    }

    // ============================================================
    // GENERAR PLANTILLA SUPER JSON - CON INSTRUCCIONES CLARAS
    // ============================================================

    _generarPlantillaSuperJSON(idioma, nivel, idiomaNativo, nombreIdioma, esJeroglifico, temas, versionEstandar, nombreVersion) {
        const familiasSemanticas = this._FAMILIAS_SEMANTICAS.join(', ');
        const numHistoriasPorTema = 3;
        const numFrasesPorHistoria = 6;
        const palabrasRequeridas = window.gestorIdiomas?._obtenerPalabrasPorVersion?.(idioma, versionEstandar, nivel) || 2000;
        const nombreNativo = this._getNombreIdioma(idiomaNativo);
        const numTemas = temas.length || 8;
        
        let instrucciones = [
            `1. Genera ${numHistoriasPorTema} mini-historias por cada uno de los ${numTemas} temas`,
            `2. Cada historia debe tener ${numFrasesPorHistoria} frases en ${idioma}`,
            `3. El nivel de dificultad es ${nivel}`,
            `4. La versión del estándar es ${nombreVersion} (${versionEstandar})`,
            `5. Este nivel requiere aproximadamente ${palabrasRequeridas} palabras en total`,
            `6. Cada frase debe tener: 'original', 'traduccion'`,
            `7. Incluye 'regla_gramatical' y 'explicacion_gramatical' para cada frase`,
            `8. Clasifica TODAS las palabras en familias semánticas`,
            `9. Genera un listado completo de vocabulario por familia semántica`,
            `10. Genera un listado de reglas gramaticales del nivel ${nivel}`,
            `11. Genera ejercicios para cada tema`,
            `12. Genera logros desbloqueables para el nivel`,
            `13. TODAS las palabras deben tener su tipo gramatical correcto`,
            `14. Las frases deben ser NATURALES y UTILIZABLES en la vida cotidiana`,
            `15. El vocabulario debe ser APROPIADO para el nivel ${nivel} y la versión ${nombreVersion}`,
            `16. 🔥🔥🔥 **OBLIGATORIO:** Para CADA frase, debes generar un array COMPLETO de palabras desglosadas.`,
            `17. 🔥🔥🔥 El array "palabras" de CADA frase debe contener TODAS LAS PALABRAS de la frase.`,
            `18. 🔥🔥🔥 CADA palabra del array debe tener: "palabra", "transcripcion" (o "pinyin" para jeroglíficos), "familia", "tipo", "significado".`,
            `19. 🔥🔥🔥 NO uses placeholders como "[palabra_1]" o "[familia_semantica]". Usa PALABRAS REALES.`,
            `20. 🔥🔥🔥 La cantidad de palabras en el array "palabras" debe coincidir EXACTAMENTE con el número de palabras de la frase.`,
            `21. 🔥🔥🔥 INCLUYE TODAS LAS PALABRAS: artículos, preposiciones, conjunciones, verbos, sustantivos, adjetivos, etc.`,
            `22. 🔥🔥🔥 NO omitas palabras "pequeñas" como "el", "la", "de", "a", "en", "y", "que", etc.`,
            `23. 🔥🔥🔥 Si la frase tiene 8 palabras, el array debe tener 8 entradas. Si tiene 12, debe tener 12.`,
            `24. 🔥🔥🔥 La transcripción fonética DEBE estar en el idioma nativo del usuario (${nombreNativo}).`,
            `25. 🔥🔥🔥 La familia semántica DEBE ser una de las siguientes: ${familiasSemanticas}`,
            `26. 🔥🔥🔥 **EJEMPLO DE DESGLOSE COMPLETO (¡OBLIGATORIO!):**`,
            `27. Si la frase en español es: "Yo voy a la tienda" (5 palabras)`,
            `28. El array "palabras" DEBE tener 5 entradas:`,
            `29. [`,
            `30.   { "palabra": "Yo", "transcripcion": "io", "familia": "Pronombres", "tipo": "pronombre", "significado": "yo" },`,
            `31.   { "palabra": "voy", "transcripcion": "boi", "familia": "Movimiento", "tipo": "verbo", "significado": "ir" },`,
            `32.   { "palabra": "a", "transcripcion": "a", "familia": "Preposiciones", "tipo": "preposición", "significado": "a" },`,
            `33.   { "palabra": "la", "transcripcion": "la", "familia": "Artículos", "tipo": "artículo", "significado": "la" },`,
            `34.   { "palabra": "tienda", "transcripcion": "tienda", "familia": "Comercio", "tipo": "sustantivo", "significado": "tienda" }`,
            `35. ]`,
            `36. 🔥 **¡CADA PALABRA DE LA FRASE DEBE ESTAR EN EL ARRAY!**`
        ];

        if (esJeroglifico) {
            instrucciones.push(
                `37. ⚠️ IMPORTANTE: Para CADA frase, proporciona 'pinyin' CON TONOS (ej: "nǐ hǎo")`,
                `38. La 'segmentacion' debe separar CADA palabra con significado semántico (ej: "我 爱 你")`,
                `39. En 'palabras', cada entrada debe tener 'hanzi' y 'pinyin' con tonos (ej: "wǒ", "ài", "nǐ")`,
                `40. El pinyin DEBE incluir los números de tono (ma1, ma2, ma3, ma4) o diacríticos (mā, má, mǎ, mà)`,
                `41. Las palabras DEBEN tener su pinyin correspondiente para poder ser estudiadas correctamente`,
                `42. ⚠️ IMPORTANTE: Genera una sección 'caracteres_destacados' con los caracteres clave del tema`,
                `43. 🔥 Para CADA palabra en el array "palabras", incluye "hanzi" Y "pinyin".`,
                `44. 🔥 **EJEMPLO PARA JEROGLÍFICOS:** Si la frase es "我爱你" (3 palabras)`,
                `45. El array DEBE tener 3 entradas:`,
                `46. [`,
                `47.   { "hanzi": "我", "pinyin": "wǒ", "familia": "Pronombres", "tipo": "pronombre", "significado": "yo" },`,
                `48.   { "hanzi": "爱", "pinyin": "ài", "familia": "Sentimientos", "tipo": "verbo", "significado": "amar" },`,
                `49.   { "hanzi": "你", "pinyin": "nǐ", "familia": "Pronombres", "tipo": "pronombre", "significado": "tú" }`,
                `50. ]`
            );
        } else {
            instrucciones.push(
                `37. ⚠️ IMPORTANTE: Para CADA frase, proporciona 'transcripcion' (transcripción fonética)`,
                `38. La 'transcripcion' debe estar en el sistema fonético NATIVO del usuario (${nombreNativo})`,
                `39. En 'palabras', cada entrada debe tener 'transcripcion' en ${nombreNativo}`,
                `40. La transcripción debe ser FÁCIL DE LEER para un hablante nativo de ${nombreNativo}`,
                `41. Separa las sílabas con espacios para facilitar la lectura (ej: "ai jaf a pensil")`,
                `42. Usa la aproximación más cercana para sonidos que no existen en ${nombreNativo}`,
                `43. 🔥 Para CADA palabra en el array "palabras", incluye "palabra" Y "transcripcion".`
            );
        }

        const plantilla = {
            "_INSTRUCCIONES_PARA_IA": {
                "version": "24.4",
                "accion": `Genera un curso COMPLETO y PROFESIONAL de nivel ${nivel} para ${nombreIdioma}`,
                "idioma_objetivo": idioma,
                "nombre_idioma": nombreIdioma,
                "nivel": nivel,
                "idioma_nativo": idiomaNativo,
                "es_jeroglifico": esJeroglifico,
                "num_temas": numTemas,
                "num_historias_por_tema": numHistoriasPorTema,
                "num_frases_por_historia": numFrasesPorHistoria,
                "temas": temas.map(t => t.nombre),
                "version_estandar": versionEstandar,
                "nombre_version": nombreVersion,
                "palabras_requeridas": palabrasRequeridas,
                "num_temas_recomendados": numTemas,
                "instrucciones": instrucciones,
                "familias_semanticas_disponibles": this._FAMILIAS_SEMANTICAS,
                "niveles_disponibles": this._NIVELES,
                "formato_palabras": esJeroglifico ? {
                    "hanzi": "El carácter en el idioma objetivo (ej: 我)",
                    "pinyin": "Pronunciación con tonos (ej: wǒ)",
                    "familia": "Familia SEMÁNTICA",
                    "tipo": "Categoría GRAMATICAL",
                    "significado": `Traducción al ${idiomaNativo}`
                } : {
                    "palabra": "La palabra en el idioma objetivo",
                    "transcripcion": `Transcripción fonética en ${nombreNativo} (ej: "ai" para "I")`,
                    "familia": "Familia SEMÁNTICA",
                    "tipo": "Categoría GRAMATICAL",
                    "significado": `Traducción al ${idiomaNativo}`
                },
                "campos_gramaticales": {
                    "regla_gramatical": "Nombre de la regla gramatical (ej: Pretérito Perfecto)",
                    "explicacion_gramatical": `Explicación detallada en ${idiomaNativo} adaptada al nivel`,
                    "tipo_regla": "Categoría: tiempo_verbal, estructura_oracional, concordancia, uso_preposicional, etc."
                },
                "campos_transcripcion": esJeroglifico ? {
                    "frase": "pinyin con tonos",
                    "palabra": "pinyin con tonos",
                    "segmentacion": "hanzi y pinyin separados"
                } : {
                    "frase": `transcripcion en ${nombreNativo}`,
                    "palabra": `transcripcion en ${nombreNativo}`
                }
            },
            "meta": {
                "idioma": idioma,
                "nivel": nivel,
                "idioma_nativo": idiomaNativo,
                "es_jeroglifico": esJeroglifico,
                "num_temas": numTemas,
                "num_historias_total": numTemas * numHistoriasPorTema,
                "num_frases_total": numTemas * numHistoriasPorTema * numFrasesPorHistoria,
                "version_estandar": versionEstandar,
                "nombre_version": nombreVersion,
                "palabras_requeridas": palabrasRequeridas,
                "fecha_generacion": new Date().toISOString(),
                "version": "24.4",
                "generado_por": "Pipeline Neuro - Super Power",
                "_completado": false
            },
            "temas": temas.map(tema => ({
                "id": tema.id,
                "nombre": tema.nombre,
                "descripcion": tema.descripcion,
                "icono": tema.icono,
                "historias": []
            })),
            "vocabulario": {
                "total_palabras": 0,
                "por_familia_semantica": {},
                "por_nivel": {},
                "lista_completa": []
            },
            "reglas_gramaticales": [],
            "ejercicios": [],
            "logros": [],
            ...(esJeroglifico ? {
                "caracteres_clave": [],
                "familias_caracteres": [],
                "estudios_completos": []
            } : {})
        };

        for (const tema of plantilla.temas) {
            for (let h = 1; h <= numHistoriasPorTema; h++) {
                const historia = {
                    "titulo": `Historia ${h} sobre ${tema.nombre} (cámbialo por uno creativo)`,
                    "frases": []
                };
                for (let f = 1; f <= numFrasesPorHistoria; f++) {
                    // 🔥 GENERAR 5-8 PALABRAS DE EJEMPLO (para que la IA vea que debe ser TODAS)
                    const numPalabrasEjemplo = 5 + Math.floor(Math.random() * 4);
                    
                    const frase = {
                        "original": `[Frase ${f} en ${idioma} sobre ${tema.nombre}]`,
                        "traduccion": `[Traducción al ${idiomaNativo} de la frase ${f}]`,
                        "regla_gramatical": `[Regla gramatical ${f}]`,
                        "explicacion_gramatical": `[Explicación de la regla ${f} en ${idiomaNativo}, nivel ${nivel}]`,
                        "tipo_regla": `[tiempo_verbal, estructura_oracional, concordancia, uso_preposicional, etc.]`,
                        "palabras": []
                    };

                    if (esJeroglifico) {
                        frase.pinyin = `[pinyin_con_tonos_frase_${f}]`;
                        frase.segmentacion = {
                            "hanzi": `[hanzi_frase_${f}]`,
                            "pinyin": `[pinyin_frase_${f}]`
                        };
                        for (let p = 1; p <= numPalabrasEjemplo; p++) {
                            frase.palabras.push({
                                "hanzi": `[hanzi_palabra_${f}_${p}]`,
                                "pinyin": `[pinyin_palabra_${f}_${p}]`,
                                "familia": `[familia_semantica_${p}]`,
                                "tipo": `[tipo_gramatical_${p}]`,
                                "significado": `[significado_en_${idiomaNativo}_${p}]`
                            });
                        }
                    } else {
                        frase.transcripcion = `[transcripcion_en_${idiomaNativo}_de_la_frase_${f}]`;
                        for (let p = 1; p <= numPalabrasEjemplo; p++) {
                            frase.palabras.push({
                                "palabra": `[palabra_${f}_${p}]`,
                                "transcripcion": `[transcripcion_en_${idiomaNativo}_de_${f}_${p}]`,
                                "familia": `[familia_semantica_${p}]`,
                                "tipo": `[tipo_gramatical_${p}]`,
                                "significado": `[significado_en_${idiomaNativo}_${p}]`
                            });
                        }
                    }
                    
                    // 🔥 AVISO MUY CLARO SOBRE EL DESGLOSE COMPLETO
                    frase._AVISO_OBLIGATORIO = `
⚠️⚠️⚠️ ¡ATENCIÓN IA! ⚠️⚠️⚠️

Este array "palabras" debe contener TODAS las palabras de la frase original.
NO uses placeholders como "[palabra_1]" o "[familia_semantica]".
USA PALABRAS REALES del idioma ${idioma}.

Si la frase tiene 6 palabras, el array debe tener 6 entradas.
Si tiene 8 palabras, 8 entradas.
INCLUYE TODAS: artículos, preposiciones, conjunciones, verbos, sustantivos, etc.

🔥 Ejemplo CORRECTO para "I have a pencil" (inglés → español):
"palabras": [
    { "palabra": "I", "transcripcion": "ai", "familia": "Pronombres", "tipo": "pronombre", "significado": "yo" },
    { "palabra": "have", "transcripcion": "jaf", "familia": "Posesión", "tipo": "verbo", "significado": "tener" },
    { "palabra": "a", "transcripcion": "a", "familia": "Artículos", "tipo": "artículo", "significado": "un/una" },
    { "palabra": "pencil", "transcripcion": "pensil", "familia": "Objetos", "tipo": "sustantivo", "significado": "lápiz" }
]

🔥 ¡CADA PALABRA DE LA FRASE DEBE ESTAR EN EL ARRAY! 🔥
`;
                    
                    historia.frases.push(frase);
                }
                tema.historias.push(historia);
            }
        }

        for (const familia of this._FAMILIAS_SEMANTICAS) {
            plantilla.vocabulario.por_familia_semantica[familia] = [];
        }

        const tiposReglas = ['tiempo_verbal', 'estructura_oracional', 'concordancia', 'uso_preposicional', 'articulos', 'pronombres'];
        for (let i = 1; i <= 10; i++) {
            plantilla.reglas_gramaticales.push({
                "nombre": `[Regla gramatical ${i} del nivel ${nivel}]`,
                "explicacion": `[Explicación detallada de la regla ${i} en ${idiomaNativo}]`,
                "ejemplos": [`[Ejemplo 1 de la regla ${i}]`, `[Ejemplo 2 de la regla ${i}]`],
                "categoria": tiposReglas[i % tiposReglas.length],
                "nivel": nivel
            });
        }

        const tiposEjercicios = ['completar', 'ordenar', 'asociacion', 'traduccion', 'multiple'];
        for (const tema of temas) {
            const tipo = tiposEjercicios[Math.floor(Math.random() * tiposEjercicios.length)];
            plantilla.ejercicios.push({
                "tema": tema.nombre,
                "tipo": tipo,
                "pregunta": `[Ejercicio de ${tipo} sobre ${tema.nombre}]`,
                "respuesta": `[Respuesta correcta]`,
                "pista": `[Pista para el ejercicio]`,
                "nivel": nivel
            });
        }

        const logrosTemas = temas.slice(0, 5).map(t => ({
            "nombre": `Explorador de ${t.nombre}`,
            "descripcion": `Aprende 10 palabras relacionadas con ${t.nombre}`,
            "icono": t.icono || '🌟'
        }));
        plantilla.logros = [
            ...logrosTemas,
            {
                "nombre": `Maestro del nivel ${nivel}`,
                "descripcion": `Completa todas las actividades del nivel ${nivel}`,
                "icono": "🏆"
            },
            {
                "nombre": `Vocabulario avanzado ${nivel}`,
                "descripcion": `Aprende 50 palabras del nivel ${nivel}`,
                "icono": "📚"
            }
        ];

        if (esJeroglifico) {
            const caracteresEjemplo = ['家', '人', '有', '是', '我', '你', '他', '她', '们', '的'];
            for (let i = 0; i < Math.min(10, caracteresEjemplo.length); i++) {
                const c = caracteresEjemplo[i];
                plantilla.caracteres_clave.push({
                    "simbolo": c,
                    "pinyin": `[pinyin_de_${c}]`,
                    "significado": `[significado_de_${c}_en_${idiomaNativo}]`,
                    "trazos": Math.floor(Math.random() * 8) + 3,
                    "radical": `[radical_de_${c}]`,
                    "mnemotecnia": `[mnemotecnia_para_${c}]`,
                    "palabras_derivadas": [`[palabra_derivada_1_de_${c}]`, `[palabra_derivada_2_de_${c}]`],
                    "frases_ejemplo": [`[frase_ejemplo_1_con_${c}]`, `[frase_ejemplo_2_con_${c}]`],
                    "nivel": nivel
                });
            }
        }

        plantilla._AVISO_IMPORTANTE_PALABRAS_DESGLOSADAS = `
🔥🔥🔥 ¡ATENCIÓN IA! 🔥🔥🔥

Este JSON contiene TODOS los campos necesarios para un curso completo.

⚠️ **OBLIGATORIO:** Para CADA frase, el array "palabras" debe contener TODAS las palabras de la frase.

❌ NO uses placeholders como "[palabra_1]" o "[familia_semantica]".
✅ Usa PALABRAS REALES del idioma ${idioma}.

📝 Ejemplo CORRECTO para una frase en español (5 palabras → 5 entradas):
"palabras": [
    { "palabra": "Yo", "transcripcion": "io", "familia": "Pronombres", "tipo": "pronombre", "significado": "yo" },
    { "palabra": "voy", "transcripcion": "boi", "familia": "Movimiento", "tipo": "verbo", "significado": "ir" },
    { "palabra": "a", "transcripcion": "a", "familia": "Preposiciones", "tipo": "preposición", "significado": "a" },
    { "palabra": "la", "transcripcion": "la", "familia": "Artículos", "tipo": "artículo", "significado": "la" },
    { "palabra": "tienda", "transcripcion": "tienda", "familia": "Comercio", "tipo": "sustantivo", "significado": "tienda" }
]

📝 Ejemplo CORRECTO para una frase en chino (3 palabras → 3 entradas):
"palabras": [
    { "hanzi": "我", "pinyin": "wǒ", "familia": "Pronombres", "tipo": "pronombre", "significado": "yo" },
    { "hanzi": "爱", "pinyin": "ài", "familia": "Sentimientos", "tipo": "verbo", "significado": "amar" },
    { "hanzi": "你", "pinyin": "nǐ", "familia": "Pronombres", "tipo": "pronombre", "significado": "tú" }
]

🔴 **¡NUNCA OMITAS PALABRAS!** Incluye artículos, preposiciones, conjunciones, etc.
🔴 **¡CADA PALABRA DE LA FRASE DEBE ESTAR EN EL ARRAY!**
🔴 **¡EL NÚMERO DE ENTRADAS DEBE COINCIDIR CON EL NÚMERO DE PALABRAS DE LA FRASE!**

🔥 NO OLVIDES: Cuantas más palabras desglosadas proporciones, más útil será el contenido para el estudiante.
`;

        return plantilla;
    }

    // ============================================================
    // IMPORTAR SUPER JSON - FORZADO A "EN CURSO"
    // ============================================================

    async _importarSuperJSON(data) {
        if (!data) throw new Error('No hay datos para importar');
        let datosReales = data;
        if (data._INSTRUCCIONES_PARA_IA) {
            const tieneHistorias = data.historias && data.historias.length > 0 &&
                                   data.historias[0].frases && data.historias[0].frases.length > 0;
            const tieneTemas = data.temas && data.temas.length > 0 &&
                               data.temas.some(tema => tema.historias && tema.historias.length > 0);
            let tieneDatosReales = false;
            if (tieneHistorias) {
                const primeraFrase = data.historias[0].frases[0];
                if (primeraFrase && primeraFrase.original &&
                    !primeraFrase.original.startsWith('Frase') &&
                    !primeraFrase.original.startsWith('[')) {
                    tieneDatosReales = true;
                }
            } else if (tieneTemas) {
                tieneDatosReales = true;
            }
            if (!tieneDatosReales) {
                this.core?.mostrarToast('⚠️ Esto es una PLANTILLA vacía. Pide a la IA que la complete y luego importa.', 'warning');
                return;
            }
            datosReales = data;
        }
        if (!datosReales.meta || !datosReales.temas || !Array.isArray(datosReales.temas)) {
            throw new Error('JSON inválido: debe contener "meta" y "temas"');
        }
        if (datosReales.temas.length === 0) throw new Error('JSON inválido: no hay temas');
        const core = this._getCore();
        const idioma = datosReales.meta.idioma || gestorIdiomas?.getIdiomaActivo() || 'es';
        const nivel = datosReales.meta.nivel || this._obtenerNivelRealUsuario();
        const esJeroglifico = datosReales.meta.es_jeroglifico || this._esJeroglifico(idioma);
        const versionEstandar = datosReales.meta.version_estandar || 'v3.0';
        const nombreVersion = datosReales.meta.nombre_version || 'HSK 3.0';
        
        // 🔥 FORZAR A "EN CURSO" - NUNCA IMPORTAR COMO COMPLETADO
        const completado = false;
        const estadoInicial = 'en_curso';
        
        core?.mostrarToast(`🧠 Importando Super JSON para ${idioma} (${nivel}) con ${nombreVersion}...`, 'info');
        let totalTemas = 0, totalHistorias = 0, totalFrases = 0, totalPalabras = 0, totalReglas = 0, totalCaracteres = 0;
        let totalPalabrasDesglosadas = 0;
        
        for (const temaData of datosReales.temas) {
            const temasExistentes = await db.obtenerTemasPorIdioma(idioma);
            let temaExistente = temasExistentes.find(t => 
                t.nombre === temaData.nombre && 
                (t._esPredefinido === true || t.origen === 'super_json')
            );
            let temaId;
            if (temaExistente) {
                temaId = temaExistente.id;
                if (temaExistente.estado === 'completado' || temaExistente._completado === true) {
                    temaExistente.estado = estadoInicial;
                    temaExistente._completado = completado;
                    delete temaExistente._fechaCompletado;
                    await db.update('temas', temaExistente);
                    console.log(`🔄 Tema "${temaExistente.nombre}" reabierto a "En Curso"`);
                }
            } else {
                const nuevoTema = {
                    nombre: temaData.nombre,
                    descripcion: temaData.descripcion || '',
                    idioma: idioma,
                    nivel: nivel,
                    icono: temaData.icono || '📁',
                    fechaCreacion: new Date().toISOString(),
                    estado: estadoInicial,
                    historiasIds: [],
                    palabrasClave: [],
                    _esPredefinido: true,
                    _esImportado: true,
                    origen: 'super_json',
                    _version_estandar: versionEstandar,
                    _nombre_version: nombreVersion,
                    _completado: completado
                };
                temaId = await db.guardarTema(nuevoTema);
                totalTemas++;
            }
            
            if (temaExistente && temaExistente._temaOriginalId) {
                await window.UITemas._marcarTemaCompletado(
                    idioma,
                    temaExistente._temaOriginalId,
                    completado
                );
            }
            
            const historias = temaData.historias || [];
            const historiasIds = [];
            for (const historiaData of historias) {
                const historiaObj = {
                    titulo: historiaData.titulo || 'Historia sin título',
                    temaId: temaId,
                    idioma: idioma,
                    nivel: nivel,
                    fechaCreacion: new Date().toISOString(),
                    estado: estadoInicial,
                    frases: historiaData.frases ? historiaData.frases.length : 0,
                    _version_estandar: versionEstandar,
                    _nombre_version: nombreVersion,
                    _completada: completado
                };
                const historiaId = await db.guardarHistoria(historiaObj);
                if (historiaId) {
                    historiasIds.push(historiaId);
                    totalHistorias++;
                    const frases = historiaData.frases || [];
                    for (const fraseData of frases) {
                        if (!fraseData.original || !fraseData.traduccion) continue;
                        
                        const palabrasDesglosadas = [];
                        const palabrasData = fraseData.palabras || [];
                        
                        for (const pData of palabrasData) {
                            const palabraText = pData.palabra || pData.hanzi || '';
                            if (!palabraText) continue;
                            
                            const tipoGramatical = pData.tipo || pData.familia || 'sustantivo';
                            const familiaSemantica = pData.familia_semantica || 'General';
                            const pinyinPalabra = pData.pinyin || '';
                            const transcripcionPalabra = pData.transcripcion || '';
                            
                            const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                            let palabraExistente = palabrasExistentes.find(p =>
                                (p.palabra || p.hanzi || '').toLowerCase() === palabraText.toLowerCase()
                            );
                            
                            let palabraId;
                            if (palabraExistente) {
                                palabraId = palabraExistente.id;
                                const updateData = {
                                    ...palabraExistente,
                                    frecuencia: (palabraExistente.frecuencia || 0) + 1,
                                    pinyin: esJeroglifico ? (palabraExistente.pinyin || pinyinPalabra) : palabraExistente.pinyin,
                                    transcripcion: !esJeroglifico ? (palabraExistente.transcripcion || transcripcionPalabra) : '',
                                    _version_estandar: versionEstandar
                                };
                                await db.guardarPalabra(updateData);
                            } else {
                                const nuevaPalabra = {
                                    palabra: palabraText,
                                    hanzi: esJeroglifico ? palabraText : '',
                                    pinyin: esJeroglifico ? pinyinPalabra : '',
                                    transcripcion: !esJeroglifico ? transcripcionPalabra : '',
                                    significado: pData.significado || palabraText,
                                    familia: tipoGramatical,
                                    familias: [tipoGramatical],
                                    familiaSemantica: familiaSemantica,
                                    nivel: nivel,
                                    tipo: tipoGramatical,
                                    idioma: idioma,
                                    frecuencia: 1,
                                    neuroScore: 0.5,
                                    nivelDominio: 'nuevo',
                                    fechaCreacion: Date.now(),
                                    _version_estandar: versionEstandar
                                };
                                palabraId = await db.guardarPalabra(nuevaPalabra);
                                totalPalabras++;
                            }
                            
                            if (palabraId) {
                                if (window.gestorFavoritos) {
                                    try {
                                        await window.gestorFavoritos.añadirPalabra(palabraId);
                                        await window.gestorFavoritos.añadirPalabraAGrupo(palabraId, `📚 Nivel ${nivel}`);
                                        await window.gestorFavoritos.añadirPalabraAGrupo(palabraId, `📂 ${familiaSemantica}`);
                                    } catch (e) {}
                                }
                                palabrasDesglosadas.push({
                                    id: palabraId,
                                    palabra: palabraText,
                                    hanzi: esJeroglifico ? palabraText : '',
                                    pinyin: esJeroglifico ? pinyinPalabra : '',
                                    transcripcion: !esJeroglifico ? transcripcionPalabra : '',
                                    significado: pData.significado || palabraText,
                                    familia: tipoGramatical,
                                    tipo: tipoGramatical,
                                    familiaSemantica: familiaSemantica
                                });
                                totalPalabrasDesglosadas++;
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
                            palabras: palabrasDesglosadas,
                            rg: 0,
                            rcn: 0,
                            activa: true,
                            reglaGramatical: fraseData.regla_gramatical || null,
                            explicacionGramatical: fraseData.explicacion_gramatical || null,
                            tipoRegla: fraseData.tipo_regla || null,
                            familiaSemantica: 'Seleccionadas por Usuario',
                            _version_estandar: versionEstandar,
                            _completada: completado
                        };
                        
                        await db.guardarFrase(fraseObj);
                        totalFrases++;
                        
                        if (fraseData.regla_gramatical && fraseData.explicacion_gramatical) {
                            const reglaObj = {
                                idioma: idioma,
                                nivel: nivel,
                                tipo: fraseData.tipo_regla || 'general',
                                regla: fraseData.regla_gramatical,
                                explicacion: fraseData.explicacion_gramatical,
                                ejemplos: [fraseData.original],
                                frecuencia: 1,
                                fechaCreacion: Date.now(),
                                ultimoUso: Date.now(),
                                _version_estandar: versionEstandar
                            };
                            await db.guardarReglaGramatical(reglaObj);
                            totalReglas++;
                        }
                    }
                    await db.update('historias', { ...historiaObj, id: historiaId, frases: frases.length });
                }
            }
            const temaActual = await db.obtenerTema(temaId);
            if (temaActual) {
                const todasHistoriasIds = [...new Set([...temaActual.historiasIds, ...historiasIds])];
                await db.actualizarTema(temaId, {
                    historiasIds: todasHistoriasIds,
                    frases: (temaActual.frases || 0) + totalFrases,
                    estado: estadoInicial,
                    _version_estandar: versionEstandar,
                    _nombre_version: nombreVersion,
                    _completado: completado,
                    _totalPalabrasDesglosadas: (temaActual._totalPalabrasDesglosadas || 0) + totalPalabrasDesglosadas
                });
            }
        }
        
        if (datosReales.vocabulario && datosReales.vocabulario.lista_completa) {
            for (const p of datosReales.vocabulario.lista_completa) {
                const palabraText = p.palabra || p.hanzi || '';
                if (!palabraText) continue;
                const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                const existe = palabrasExistentes.find(w =>
                    (w.palabra || w.hanzi || '').toLowerCase() === palabraText.toLowerCase()
                );
                if (!existe) {
                    const nuevaPalabra = {
                        palabra: palabraText,
                        hanzi: esJeroglifico ? palabraText : '',
                        pinyin: esJeroglifico ? (p.pinyin || '') : '',
                        transcripcion: !esJeroglifico ? (p.transcripcion || '') : '',
                        significado: p.significado || palabraText,
                        familia: p.tipo || p.familia || 'sustantivo',
                        familias: [p.tipo || p.familia || 'sustantivo'],
                        familiaSemantica: p.familia_semantica || 'General',
                        nivel: nivel,
                        tipo: p.tipo || 'sustantivo',
                        idioma: idioma,
                        frecuencia: 1,
                        neuroScore: 0.5,
                        nivelDominio: 'nuevo',
                        fechaCreacion: Date.now(),
                        _version_estandar: versionEstandar
                    };
                    await db.guardarPalabra(nuevaPalabra);
                    totalPalabras++;
                }
            }
        }
        
        if (datosReales.reglas_gramaticales) {
            for (const regla of datosReales.reglas_gramaticales) {
                if (!regla.nombre || !regla.explicacion) continue;
                const reglaObj = {
                    idioma: idioma,
                    nivel: nivel,
                    tipo: regla.categoria || 'general',
                    regla: regla.nombre,
                    explicacion: regla.explicacion,
                    ejemplos: regla.ejemplos || [],
                    frecuencia: 1,
                    fechaCreacion: Date.now(),
                    ultimoUso: Date.now(),
                    _version_estandar: versionEstandar
                };
                await db.guardarReglaGramatical(reglaObj);
                totalReglas++;
            }
        }
        
        if (esJeroglifico && datosReales.caracteres_clave) {
            for (const c of datosReales.caracteres_clave) {
                const simbolo = c.simbolo || '';
                if (!simbolo) continue;
                const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                const existe = palabrasExistentes.find(p =>
                    (p.palabra || p.hanzi || '').toLowerCase() === simbolo.toLowerCase() && p.esCaracterRaiz === true
                );
                if (!existe) {
                    const raizObj = {
                        palabra: simbolo,
                        hanzi: simbolo,
                        pinyin: c.pinyin || '',
                        significado: c.significado || simbolo,
                        familia: 'caracter_raiz',
                        familias: ['caracter_raiz'],
                        familiaSemantica: 'Caracteres Raíz',
                        nivel: nivel,
                        tipo: 'caracter_raiz',
                        idioma: idioma,
                        frecuencia: 1,
                        neuroScore: 0.5,
                        nivelDominio: 'nuevo',
                        fechaCreacion: Date.now(),
                        esCaracterRaiz: true,
                        tema: 'General',
                        numero_trazos: c.trazos || 0,
                        estructura: {
                            trazos_clave: [],
                            radicales: c.radical ? [c.radical] : [],
                            tipo_estructura: 'simple'
                        },
                        mnemotecnia: c.mnemotecnia || '',
                        variantes: null,
                        esPalabraDerivada: false,
                        caracterRaiz: null,
                        desgloseMorfologico: '',
                        desgloseCaracteres: [],
                        asociacionVisual: '',
                        ejemploFrase: c.frases_ejemplo?.[0] || '',
                        familiaSemanticaPrincipal: 'Caracteres Raíz',
                        temaFamilia: 'General',
                        _version_estandar: versionEstandar
                    };
                    await db.guardarPalabra(raizObj);
                    totalCaracteres++;
                    const derivadas = c.palabras_derivadas || [];
                    for (const d of derivadas) {
                        if (!d) continue;
                        const derivadaObj = {
                            palabra: d,
                            hanzi: d,
                            pinyin: '',
                            significado: `Relacionado con ${simbolo}`,
                            familia: 'derivada',
                            familias: ['derivada'],
                            familiaSemantica: 'Caracteres Raíz',
                            nivel: nivel,
                            tipo: 'sustantivo',
                            idioma: idioma,
                            frecuencia: 1,
                            neuroScore: 0.5,
                            nivelDominio: 'nuevo',
                            fechaCreacion: Date.now(),
                            esPalabraDerivada: true,
                            caracterRaiz: simbolo,
                            desgloseMorfologico: `Contiene el carácter "${simbolo}"`,
                            desgloseCaracteres: [
                                { caracter: simbolo, pinyin: c.pinyin || '', significado: c.significado || '' }
                            ],
                            asociacionVisual: `🔗 ${d} contiene el carácter ${simbolo}`,
                            ejemploFrase: c.frases_ejemplo?.[0] || '',
                            familiaSemanticaPrincipal: 'Caracteres Raíz',
                            temaFamilia: 'General',
                            _version_estandar: versionEstandar
                        };
                        await db.guardarPalabra(derivadaObj);
                    }
                }
            }
        }
        
        if (datosReales.logros) {
            for (const logro of datosReales.logros) {
                if (logro.nombre) { this._logrosDesbloqueados.add(logro.nombre); }
            }
            await this._guardarLogros();
        }
        
        if (window.vigiaGramatical) {
            try {
                await window.vigiaGramatical.initGramatical();
                await window.vigiaGramatical._actualizarEdadGramatical(idioma);
            } catch (e) {}
        }
        
        if (window.gramatica) {
            await gramatica.cargarPalabras();
            await gramatica.agrupar();
        }
        if (window.pipeline) {
            await pipeline.cargarFrases();
            await pipeline.cargarProgreso();
        }
        
        const resumen = `✅ Super JSON importado correctamente\n\n📚 Temas: ${totalTemas}\n📖 Historias: ${totalHistorias}\n📝 Frases: ${totalFrases}\n📖 Palabras: ${totalPalabras}\n📋 Reglas gramaticales: ${totalReglas}\n${esJeroglifico ? `🀄 Caracteres: ${totalCaracteres}\n` : ''}\n📝 Palabras desglosadas: ${totalPalabrasDesglosadas}\n📌 Versión: ${nombreVersion}\n🏆 Logros: ${datosReales.logros?.length || 0}\n📖 Todos los temas marcados como "En Curso"\n\n💡 Todo el contenido está disponible en sus respectivos módulos.`;
        
        await this._getCore()?.alert(resumen, '✅ Importación completada');
        
        if (window.UITemas) {
            await window.UITemas._renderTemas();
        }
        if (window.UICaracteres) window.UICaracteres._limpiarCache();
        if (window.UITemas) window.UITemas._renderTemas();
        if (window.UIGrammar) window.UIGrammar._cargarGramatica();
        if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this._getCore());
        if (window.UIEspacio) window.UIEspacio._renderizarMiEspacio();
        
        return { totalTemas, totalHistorias, totalFrases, totalPalabras, totalReglas, totalCaracteres, totalPalabrasDesglosadas };
    }

    async _guardarLogros() {
        try {
            localStorage.setItem('pipeline_logros_caracteres', JSON.stringify({
                desbloqueados: Array.from(this._logrosDesbloqueados),
                fecha: new Date().toISOString()
            }));
        } catch (e) { console.warn('⚠️ Error guardando logros:', e); }
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UIConfig = new UIConfig();

console.log('✅ UIConfig v24.4 - CORREGIDO PARA APK: CARGA DE ARCHIVOS LOCALES');
console.log('  📱 Usa XMLHttpRequest para archivos locales en APK');
console.log('  📱 Múltiples rutas de búsqueda (assets/data/, www/data/, etc.)');
console.log('  📱 Fallback con fetch para servidores HTTP');
console.log('  📱 Detección de modo APK (file:// protocol)');
console.log('  🔥 Instrucciones explícitas para desglose de TODAS las palabras');
console.log('  🔥 Ejemplos concretos de desglose completo (5 palabras → 5 entradas)');
console.log('  🔥 Aviso OBLIGATORIO en cada frase con instrucciones claras');
console.log('  🔥 Guarda el idioma seleccionado en localStorage');
console.log('  🔥 Sincroniza con IndexedDB');
console.log('  🔥 Persiste entre recargas de página');
console.log('  🔥 Sincroniza con gestorIdiomas');
console.log('  🔥 Nombres de archivos REALES: zh_A1.json, en_B1.json, it_A2.json');
console.log('  🔥 Convierte "Chino" → "zh", "Inglés" → "en", etc.');
console.log('  🔥 Verificación HEAD para archivos existentes en data/');
console.log('  🔥 Ayuda con formato CORRECTO: data/CODIGO_NIVEL.json');
console.log('  🔥 Modal de progreso con SPINNER, BARRA PROGRESO y ANIMACIONES');
console.log('  🔥 Super Power importa SIEMPRE como "En Curso"');
console.log('  🔥 Todas las funcionalidades originales preservadas');