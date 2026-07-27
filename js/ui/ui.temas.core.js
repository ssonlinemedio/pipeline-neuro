// ============================================================
// UI TEMAS CORE v3.0 - COMPLETADO INDEPENDIENTE POR IDIOMA Y CHECKBOX CORREGIDO
// ============================================================

class UITemasCore {
    constructor() {
        this.modoVistaTemas = 'lista';
        this.temaSeleccionado = null;
        this._container = null;
        this._core = null;
        this._idiomaActual = null;
        this._refrescando = false;
        this._cargando = false;
        this._importando = false;
        this._creandoHistoria = false;
        this._temaActualParaCrear = null;
        this._temaActualParaJSON = null;
        this._temaPredefinidoIdMap = {};
        this._ocultarCompletados = true;
        this._temaCompletadoCache = {};
        this._nivelDesbloqueadoCache = {};
        this._temasCompletadosPorIdioma = {};
        this._caracteresProcesados = new Set();
        this._palabrasDerivadasProcesadas = new Set();
        this._temaSeleccionadoParaJSON = null;
        this.ULTIMA_IMPORTACION = null;

        // Constantes
        this.NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        this.EMOJIS_NIVEL = { 'A1': '🌱', 'A2': '🌿', 'B1': '🌳', 'B2': '🌲', 'C1': '🏔️', 'C2': '🗻' };
        this.COLORES_NIVEL = { 'A1': '#6C5CE7', 'A2': '#0984E3', 'B1': '#00B894', 'B2': '#FDCB6E', 'C1': '#E17055', 'C2': '#FD79A8' };
        this.MAX_HISTORIAS = 10;
        this.MAX_FRASES_POR_HISTORIA = 10;
        this.IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        this.FAMILIAS_SEMANTICAS = ['Transporte', 'Comida y Bebida', 'Familia', 'Casa y Hogar', 'Ropa', 'Animales', 'Naturaleza', 'Tiempo y Clima', 'Salud', 'Trabajo', 'Educación', 'Deportes', 'Arte', 'Música', 'Tecnología', 'Viajes', 'Compras', 'Comunicación', 'Emociones', 'Rutina', 'Ciudad', 'Cultura', 'Historia', 'Ciencia'];
        
        // TEMAS PREDEFINIDOS CON SOPORTE PARA VERSIONES
        this.TEMAS_PREDEFINIDOS = {
            'v2.0': {
                'A1': [
                    { id: 'a1_1', nombre: 'Mi familia', descripcion: 'Presentar a los miembros de la familia y describir relaciones', icono: '👨‍👩‍👧‍👦' },
                    { id: 'a1_2', nombre: 'La casa y el hogar', descripcion: 'Describir habitaciones, muebles y objetos cotidianos', icono: '🏠' },
                    { id: 'a1_3', nombre: 'Comida y bebida', descripcion: 'Alimentos, bebidas, comidas del día y hábitos alimenticios', icono: '🍽️' },
                    { id: 'a1_4', nombre: 'Mi rutina diaria', descripcion: 'Actividades diarias, horarios y hábitos', icono: '⏰' },
                    { id: 'a1_5', nombre: 'La ciudad y el barrio', descripcion: 'Lugares, direcciones y servicios de la ciudad', icono: '🏙️' },
                    { id: 'a1_6', nombre: 'La ropa y los colores', descripcion: 'Prendas de vestir, colores y tallas', icono: '👕' },
                    { id: 'a1_7', nombre: 'El tiempo y las estaciones', descripcion: 'Clima, estaciones del año y actividades', icono: '🌤️' },
                    { id: 'a1_8', nombre: 'Los animales', descripcion: 'Animales domésticos y salvajes, características', icono: '🐕' }
                ],
                'A2': [
                    { id: 'a2_1', nombre: 'Viajes y transportes', descripcion: 'Medios de transporte, viajes y vacaciones', icono: '✈️' },
                    { id: 'a2_2', nombre: 'Compras y tiendas', descripcion: 'Ir de compras, tipos de tiendas y precios', icono: '🛍️' },
                    { id: 'a2_3', nombre: 'Salud y medicina', descripcion: 'Partes del cuerpo, enfermedades y médicos', icono: '🏥' },
                    { id: 'a2_4', nombre: 'Deportes y ocio', descripcion: 'Deportes, hobbies y tiempo libre', icono: '⚽' },
                    { id: 'a2_5', nombre: 'Trabajo y profesiones', descripcion: 'Profesiones, lugares de trabajo y tareas', icono: '💼' },
                    { id: 'a2_6', nombre: 'Música y cultura', descripcion: 'Géneros musicales, instrumentos y eventos culturales', icono: '🎵' },
                    { id: 'a2_7', nombre: 'Comunicación y tecnología', descripcion: 'Teléfono, internet, redes sociales y comunicación', icono: '📱' },
                    { id: 'a2_8', nombre: 'El medio ambiente', descripcion: 'Naturaleza, reciclaje y cuidado del planeta', icono: '🌿' }
                ],
                'B1': [
                    { id: 'b1_1', nombre: 'Relaciones personales', descripcion: 'Amistad, amor, conflictos y emociones', icono: '💕' },
                    { id: 'b1_2', nombre: 'Educación y aprendizaje', descripcion: 'Sistema educativo, estudios y aprendizaje', icono: '📚' },
                    { id: 'b1_3', nombre: 'Medios de comunicación', descripcion: 'Prensa, televisión, radio y noticias', icono: '📺' },
                    { id: 'b1_4', nombre: 'Turismo y patrimonio', descripcion: 'Turismo cultural, monumentos y tradiciones', icono: '🏛️' },
                    { id: 'b1_5', nombre: 'Tecnología y futuro', descripcion: 'Innovaciones, inteligencia artificial y futuro', icono: '🤖' },
                    { id: 'b1_6', nombre: 'Gastronomía internacional', descripcion: 'Cocinas del mundo, recetas y restaurantes', icono: '🌮' },
                    { id: 'b1_7', nombre: 'Arte y creatividad', descripcion: 'Pintura, escultura, cine y literatura', icono: '🎨' },
                    { id: 'b1_8', nombre: 'Eventos históricos', descripcion: 'Historia, personajes y acontecimientos importantes', icono: '📜' }
                ],
                'B2': [
                    { id: 'b2_1', nombre: 'Política y sociedad', descripcion: 'Sistemas políticos, participación ciudadana y derechos', icono: '🏛️' },
                    { id: 'b2_2', nombre: 'Economía y finanzas', descripcion: 'Economía, negocios, finanzas personales', icono: '💰' },
                    { id: 'b2_3', nombre: 'Ciencia e investigación', descripcion: 'Avances científicos, investigación y descubrimientos', icono: '🔬' },
                    { id: 'b2_4', nombre: 'Filosofía y pensamiento', descripcion: 'Corrientes filosóficas y pensadores', icono: '🧠' },
                    { id: 'b2_5', nombre: 'Psicología y comportamiento', descripcion: 'Comportamiento humano, psicología y mente', icono: '🧘' },
                    { id: 'b2_6', nombre: 'Globalización e interculturalidad', descripcion: 'Globalización, migración y diversidad cultural', icono: '🌍' },
                    { id: 'b2_7', nombre: 'Desarrollo sostenible', descripcion: 'Sostenibilidad, energías renovables y futuro', icono: '♻️' },
                    { id: 'b2_8', nombre: 'Literatura y narrativa', descripcion: 'Géneros literarios, autores y obras', icono: '📖' }
                ],
                'C1': [
                    { id: 'c1_1', nombre: 'Crítica cultural', descripcion: 'Análisis crítico de la cultura y la sociedad', icono: '🎭' },
                    { id: 'c1_2', nombre: 'Retórica y argumentación', descripcion: 'Técnicas de argumentación y discurso', icono: '🗣️' },
                    { id: 'c1_3', nombre: 'Antropología social', descripcion: 'Estructuras sociales, rituales y costumbres', icono: '👥' },
                    { id: 'c1_4', nombre: 'Investigación académica', descripcion: 'Metodología de investigación y análisis', icono: '📊' },
                    { id: 'c1_5', nombre: 'Análisis del discurso', descripcion: 'Análisis de textos y discursos', icono: '✍️' }
                ],
                'C2': [
                    { id: 'c2_1', nombre: 'Especialización académica', descripcion: 'Investigación avanzada en área específica', icono: '🎓' },
                    { id: 'c2_2', nombre: 'Debate y oratoria', descripcion: 'Técnicas avanzadas de debate y oratoria', icono: '🎤' },
                    { id: 'c2_3', nombre: 'Creación literaria', descripcion: 'Escritura creativa y creación literaria', icono: '✍️' },
                    { id: 'c2_4', nombre: 'Análisis crítico avanzado', descripcion: 'Análisis crítico de textos complejos', icono: '📖' }
                ]
            },
            'v3.0': {
                'A1': [
                    { id: 'a1_1', nombre: 'Mi familia', descripcion: 'Presentar a los miembros de la familia y describir relaciones', icono: '👨‍👩‍👧‍👦' },
                    { id: 'a1_2', nombre: 'La casa y el hogar', descripcion: 'Describir habitaciones, muebles y objetos cotidianos', icono: '🏠' },
                    { id: 'a1_3', nombre: 'Comida y bebida', descripcion: 'Alimentos, bebidas, comidas del día y hábitos alimenticios', icono: '🍽️' },
                    { id: 'a1_4', nombre: 'Mi rutina diaria', descripcion: 'Actividades diarias, horarios y hábitos', icono: '⏰' },
                    { id: 'a1_5', nombre: 'La ciudad y el barrio', descripcion: 'Lugares, direcciones y servicios de la ciudad', icono: '🏙️' },
                    { id: 'a1_6', nombre: 'La ropa y los colores', descripcion: 'Prendas de vestir, colores y tallas', icono: '👕' },
                    { id: 'a1_7', nombre: 'El tiempo y las estaciones', descripcion: 'Clima, estaciones del año y actividades', icono: '🌤️' },
                    { id: 'a1_8', nombre: 'Los animales', descripcion: 'Animales domésticos y salvajes, características', icono: '🐕' },
                    { id: 'a1_9', nombre: 'La tecnología básica', descripcion: 'Palabras y frases sobre tecnología cotidiana', icono: '💻' },
                    { id: 'a1_10', nombre: 'Salud y cuidados', descripcion: 'Vocabulario sobre salud, cuerpo y cuidados básicos', icono: '🏥' },
                    { id: 'a1_11', nombre: 'Ocio y entretenimiento', descripcion: 'Actividades de ocio, juegos y entretenimiento', icono: '🎮' },
                    { id: 'a1_12', nombre: 'Naturaleza y paisajes', descripcion: 'Descripción de paisajes, plantas y elementos naturales', icono: '🌳' }
                ],
                'A2': [
                    { id: 'a2_1', nombre: 'Viajes y transportes', descripcion: 'Medios de transporte, viajes y vacaciones', icono: '✈️' },
                    { id: 'a2_2', nombre: 'Compras y tiendas', descripcion: 'Ir de compras, tipos de tiendas y precios', icono: '🛍️' },
                    { id: 'a2_3', nombre: 'Salud y medicina', descripcion: 'Partes del cuerpo, enfermedades y médicos', icono: '🏥' },
                    { id: 'a2_4', nombre: 'Deportes y ocio', descripcion: 'Deportes, hobbies y tiempo libre', icono: '⚽' },
                    { id: 'a2_5', nombre: 'Trabajo y profesiones', descripcion: 'Profesiones, lugares de trabajo y tareas', icono: '💼' },
                    { id: 'a2_6', nombre: 'Música y cultura', descripcion: 'Géneros musicales, instrumentos y eventos culturales', icono: '🎵' },
                    { id: 'a2_7', nombre: 'Comunicación y tecnología', descripcion: 'Teléfono, internet, redes sociales y comunicación', icono: '📱' },
                    { id: 'a2_8', nombre: 'El medio ambiente', descripcion: 'Naturaleza, reciclaje y cuidado del planeta', icono: '🌿' },
                    { id: 'a2_9', nombre: 'Restaurantes y comidas', descripcion: 'Ir a restaurantes, pedir comida y hábitos alimenticios', icono: '🍜' },
                    { id: 'a2_10', nombre: 'Eventos y celebraciones', descripcion: 'Fiestas, cumpleaños, bodas y tradiciones', icono: '🎉' },
                    { id: 'a2_11', nombre: 'La escuela y el estudio', descripcion: 'Vida escolar, asignaturas y estudio', icono: '🏫' },
                    { id: 'a2_12', nombre: 'La ciudad moderna', descripcion: 'Edificios, transporte público y vida urbana', icono: '🏢' }
                ],
                'B1': [
                    { id: 'b1_1', nombre: 'Relaciones personales', descripcion: 'Amistad, amor, conflictos y emociones', icono: '💕' },
                    { id: 'b1_2', nombre: 'Educación y aprendizaje', descripcion: 'Sistema educativo, estudios y aprendizaje', icono: '📚' },
                    { id: 'b1_3', nombre: 'Medios de comunicación', descripcion: 'Prensa, televisión, radio y noticias', icono: '📺' },
                    { id: 'b1_4', nombre: 'Turismo y patrimonio', descripcion: 'Turismo cultural, monumentos y tradiciones', icono: '🏛️' },
                    { id: 'b1_5', nombre: 'Tecnología y futuro', descripcion: 'Innovaciones, inteligencia artificial y futuro', icono: '🤖' },
                    { id: 'b1_6', nombre: 'Gastronomía internacional', descripcion: 'Cocinas del mundo, recetas y restaurantes', icono: '🌮' },
                    { id: 'b1_7', nombre: 'Arte y creatividad', descripcion: 'Pintura, escultura, cine y literatura', icono: '🎨' },
                    { id: 'b1_8', nombre: 'Eventos históricos', descripcion: 'Historia, personajes y acontecimientos importantes', icono: '📜' },
                    { id: 'b1_9', nombre: 'Psicología y emociones', descripcion: 'Emociones, sentimientos y comportamiento humano', icono: '🧠' },
                    { id: 'b1_10', nombre: 'Medio ambiente y ecología', descripcion: 'Problemas ambientales, reciclaje y sostenibilidad', icono: '♻️' }
                ],
                'B2': [
                    { id: 'b2_1', nombre: 'Política y sociedad', descripcion: 'Sistemas políticos, participación ciudadana y derechos', icono: '🏛️' },
                    { id: 'b2_2', nombre: 'Economía y finanzas', descripcion: 'Economía, negocios, finanzas personales', icono: '💰' },
                    { id: 'b2_3', nombre: 'Ciencia e investigación', descripcion: 'Avances científicos, investigación y descubrimientos', icono: '🔬' },
                    { id: 'b2_4', nombre: 'Filosofía y pensamiento', descripcion: 'Corrientes filosóficas y pensadores', icono: '🧠' },
                    { id: 'b2_5', nombre: 'Psicología y comportamiento', descripcion: 'Comportamiento humano, psicología y mente', icono: '🧘' },
                    { id: 'b2_6', nombre: 'Globalización e interculturalidad', descripcion: 'Globalización, migración y diversidad cultural', icono: '🌍' },
                    { id: 'b2_7', nombre: 'Desarrollo sostenible', descripcion: 'Sostenibilidad, energías renovables y futuro', icono: '♻️' },
                    { id: 'b2_8', nombre: 'Literatura y narrativa', descripcion: 'Géneros literarios, autores y obras', icono: '📖' },
                    { id: 'b2_9', nombre: 'Derechos humanos y justicia', descripcion: 'Derechos humanos, justicia social y equidad', icono: '⚖️' },
                    { id: 'b2_10', nombre: 'Innovación y emprendimiento', descripcion: 'Innovación, startups y emprendimiento', icono: '🚀' }
                ],
                'C1': [
                    { id: 'c1_1', nombre: 'Crítica cultural', descripcion: 'Análisis crítico de la cultura y la sociedad', icono: '🎭' },
                    { id: 'c1_2', nombre: 'Retórica y argumentación', descripcion: 'Técnicas de argumentación y discurso', icono: '🗣️' },
                    { id: 'c1_3', nombre: 'Antropología social', descripcion: 'Estructuras sociales, rituales y costumbres', icono: '👥' },
                    { id: 'c1_4', nombre: 'Investigación académica', descripcion: 'Metodología de investigación y análisis', icono: '📊' },
                    { id: 'c1_5', nombre: 'Análisis del discurso', descripcion: 'Análisis de textos y discursos', icono: '✍️' },
                    { id: 'c1_6', nombre: 'Filosofía política', descripcion: 'Corrientes filosóficas y pensamiento político', icono: '📜' }
                ],
                'C2': [
                    { id: 'c2_1', nombre: 'Especialización académica', descripcion: 'Investigación avanzada en área específica', icono: '🎓' },
                    { id: 'c2_2', nombre: 'Debate y oratoria', descripcion: 'Técnicas avanzadas de debate y oratoria', icono: '🎤' },
                    { id: 'c2_3', nombre: 'Creación literaria', descripcion: 'Escritura creativa y creación literaria', icono: '✍️' },
                    { id: 'c2_4', nombre: 'Análisis crítico avanzado', descripcion: 'Análisis crítico de textos complejos', icono: '📖' },
                    { id: 'c2_5', nombre: 'Teoría del conocimiento', descripcion: 'Epistemología y teoría del conocimiento', icono: '🧠' }
                ]
            }
        };
        
        this._VERSION_DEFECTO = 'v3.0';
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init(core) {
        this._core = core;
        this._cargarPreferenciaOcultar();

        window.addEventListener('idiomaCambiado', (e) => {
            // Limpiar cachés al cambiar de idioma
            this._temaCompletadoCache = {};
            this._nivelDesbloqueadoCache = {};
            this._temasCompletadosPorIdioma = {};
            console.log('🧹 Cachés de temas limpiadas al cambiar de idioma');
            
            setTimeout(() => {
                if (this.modoVistaTemas === 'lista') {
                    this._renderTemas();
                } else {
                    this._volverTemas();
                }
            }, 300);
        });

        window.addEventListener('versionIdiomaCambiada', (e) => {
            console.log('📌 Versión cambiada, recargando temas...');
            setTimeout(() => {
                this._renderTemas();
            }, 300);
        });

        window.addEventListener('temaCompletado', () => {
            this._renderTemas();
        });

        window.addEventListener('nivelDesbloqueado', (e) => {
            this._core?.mostrarToast(`🎉 ¡Nivel ${e.detail?.nivel} desbloqueado!`, 'success');
            this._renderTemas();
        });

        await this._cargarMapaTemasPredefinidos();
        return this;
    }

    cargar(core) {
        this._core = core;
        this._container = document.getElementById('temasContent');
        this._cargarTemas();
    }

    // ============================================================
    // MÉTODOS PÚBLICOS
    // ============================================================

    _cargarTemas() {
        const container = this._getContainer();
        if (!container) return;

        if (!document.getElementById('temasActions')) {
            const actionsHTML = `
                <div id="temasActions" style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
                    <button class="btn-secondary" onclick="window.UITemas._forzarRefresco()" style="padding:10px 20px;background:var(--success);color:white;border:none;border-radius:8px;cursor:pointer;">
                        <i class="fas fa-sync"></i> Refrescar
                    </button>
                </div>
            `;
            container.insertAdjacentHTML('beforebegin', actionsHTML);
        }

        this._renderTemas();
    }

    _getContainer() {
        if (!this._container) {
            this._container = document.getElementById('temasContent');
        }
        return this._container;
    }

    // ============================================================
    // OBTENER VERSIÓN DEL ESTÁNDAR
    // ============================================================

    _obtenerVersionEstandar(idioma) {
        if (window.gestorIdiomas && typeof window.gestorIdiomas.obtenerVersionActiva === 'function') {
            return window.gestorIdiomas.obtenerVersionActiva(idioma);
        }
        return this._VERSION_DEFECTO;
    }

    _obtenerNombreVersion(idioma, version) {
        if (window.gestorIdiomas && typeof window.gestorIdiomas.obtenerNombreVersion === 'function') {
            return window.gestorIdiomas.obtenerNombreVersion(idioma, version);
        }
        return version;
    }

    _obtenerTemasPorNivelYVersion(version, nivel) {
        const versionData = this.TEMAS_PREDEFINIDOS[version] || this.TEMAS_PREDEFINIDOS[this._VERSION_DEFECTO];
        return versionData[nivel] || versionData['A1'] || [];
    }

    // ============================================================
    // OBTENER IDIOMA NATIVO
    // ============================================================

    _obtenerIdiomaNativo() {
        try {
            const usuario = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
            return usuario.idiomaNativo || 'español';
        } catch (e) {
            return 'español';
        }
    }

    // ============================================================
    // ESTADO DE SINCRONIZACIÓN DE CARACTERES
    // ============================================================

    async _temaEstaSincronizado(temaId) {
        try {
            const tema = await db.obtenerTema(temaId);
            if (!tema) return false;
            return tema._caracteresSincronizados === true;
        } catch (e) {
            return false;
        }
    }

    async _obtenerFechaSincronizacion(temaId) {
        try {
            const tema = await db.obtenerTema(temaId);
            if (!tema || !tema._fechaSincronizacion) return null;
            return new Date(tema._fechaSincronizacion).toLocaleString();
        } catch (e) {
            return null;
        }
    }

    async _obtenerNumeroCaracteresSincronizados(temaId) {
        try {
            const tema = await db.obtenerTema(temaId);
            if (!tema) return 0;
            return tema._caracteresSincronizadosCount || 0;
        } catch (e) {
            return 0;
        }
    }

    // ============================================================
    // MÉTODOS INTERNOS
    // ============================================================

    _cargarPreferenciaOcultar() {
        try {
            const saved = localStorage.getItem('pipeline_ocultar_completados');
            if (saved !== null) {
                this._ocultarCompletados = saved === 'true';
            }
        } catch (e) {}
    }

    _guardarPreferenciaOcultar() {
        try {
            localStorage.setItem('pipeline_ocultar_completados',
                this._ocultarCompletados ? 'true' : 'false');
        } catch (e) {}
    }

    _alternarOcultarCompletados() {
        this._ocultarCompletados = !this._ocultarCompletados;
        this._guardarPreferenciaOcultar();
        this._renderTemas();
        if (this._core) {
            this._core.mostrarToast(
                this._ocultarCompletados ? '🔒 Temas completados ocultos' : '👁️ Mostrando todos los temas',
                'info'
            );
        }
    }

    async _cargarMapaTemasPredefinidos() {
        try {
            const todosLosTemas = await db.obtenerTemas();
            this._temaPredefinidoIdMap = {};
            for (const tema of todosLosTemas) {
                if (tema._esPredefinido && tema.id && tema._temaOriginalId) {
                    this._temaPredefinidoIdMap[tema._temaOriginalId] = tema.id;
                }
            }
        } catch (e) {
            console.warn('⚠️ Error cargando mapa de temas predefinidos:', e);
        }
    }

    // ============================================================
    // GUARDAR TEMA PREDEFINIDO EN DB (CON VERSIÓN)
    // ============================================================

    async _guardarTemaPredefinidoEnDB(temaId) {
        try {
            let temaPredefinido = null;
            let nivelEncontrado = null;
            let versionEncontrada = null;
            
            const versionEstandar = this._obtenerVersionEstandar(gestorIdiomas?.getIdiomaActivo() || 'es');
            const nombreVersion = this._obtenerNombreVersion(gestorIdiomas?.getIdiomaActivo() || 'es', versionEstandar);
            
            // Buscar en la versión actual primero
            const temasVersion = this.TEMAS_PREDEFINIDOS[versionEstandar];
            if (temasVersion) {
                for (const [nivel, temas] of Object.entries(temasVersion)) {
                    const encontrado = temas.find(t => t.id === temaId);
                    if (encontrado) {
                        temaPredefinido = encontrado;
                        nivelEncontrado = nivel;
                        versionEncontrada = versionEstandar;
                        break;
                    }
                }
            }
            
            // Si no se encuentra, buscar en todas las versiones
            if (!temaPredefinido) {
                for (const [version, niveles] of Object.entries(this.TEMAS_PREDEFINIDOS)) {
                    for (const [nivel, temas] of Object.entries(niveles)) {
                        const encontrado = temas.find(t => t.id === temaId);
                        if (encontrado) {
                            temaPredefinido = encontrado;
                            nivelEncontrado = nivel;
                            versionEncontrada = version;
                            break;
                        }
                    }
                    if (temaPredefinido) break;
                }
            }

            if (!temaPredefinido) {
                console.warn('⚠️ Tema predefinido no encontrado:', temaId);
                return null;
            }

            const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
            
            const todosLosTemas = await db.obtenerTemas();
            let existente = todosLosTemas.find(t =>
                (t._temaOriginalId === temaId && t._esPredefinido === true) ||
                (t.nombre === temaPredefinido.nombre && t._esPredefinido === true)
            );

            if (existente) {
                this._temaPredefinidoIdMap[temaId] = existente.id;
                console.log(`📂 Tema predefinido "${temaPredefinido.nombre}" ya existe con ID: ${existente.id}`);
                return existente;
            }

            const nuevoTema = {
                nombre: temaPredefinido.nombre,
                descripcion: temaPredefinido.descripcion || '',
                idioma: idiomaActivo,
                nivel: nivelEncontrado || 'A1',
                icono: temaPredefinido.icono || '📁',
                fechaCreacion: new Date().toISOString(),
                estado: 'en_curso',
                historiasIds: [],
                palabrasClave: [],
                _esPredefinido: true,
                _esImportado: false,
                origen: 'predefinido',
                _nivelOriginal: nivelEncontrado || 'A1',
                _temaOriginalId: temaId,
                _caracteresSincronizados: false,
                _fechaSincronizacion: null,
                _caracteresSincronizadosCount: 0,
                _version_estandar: versionEncontrada || versionEstandar,
                _nombre_version: this._obtenerNombreVersion(idiomaActivo, versionEncontrada || versionEstandar)
            };

            console.log(`📝 Guardando tema predefinido: "${nuevoTema.nombre}" con versión ${nuevoTema._nombre_version}`);
            
            const idGuardado = await db.add('temas', nuevoTema);
            
            if (!idGuardado) {
                console.error('❌ Error: db.add retornó null');
                const idAlternativo = await db.guardarTema(nuevoTema);
                if (idAlternativo) {
                    this._temaPredefinidoIdMap[temaId] = idAlternativo;
                    const temaCompleto = await db.obtenerTema(idAlternativo);
                    console.log(`✅ Tema guardado con ID alternativo: ${idAlternativo}`);
                    return temaCompleto;
                }
                return null;
            }

            this._temaPredefinidoIdMap[temaId] = idGuardado;
            const temaCompleto = await db.obtenerTema(idGuardado);
            
            if (!temaCompleto) {
                console.error('❌ Error: No se pudo recuperar el tema guardado');
                return null;
            }
            
            console.log(`✅ Tema predefinido "${temaPredefinido.nombre}" guardado con ID: ${idGuardado}`);
            return temaCompleto;

        } catch (error) {
            console.error('❌ Error guardando tema predefinido:', error);
            return await this._crearTemaDeEmergencia(temaId);
        }
    }

    async _crearTemaDeEmergencia(temaId) {
        try {
            const versionEstandar = this._obtenerVersionEstandar(gestorIdiomas?.getIdiomaActivo() || 'es');
            const nombreVersion = this._obtenerNombreVersion(gestorIdiomas?.getIdiomaActivo() || 'es', versionEstandar);
            
            let temaPredefinido = null;
            for (const [version, niveles] of Object.entries(this.TEMAS_PREDEFINIDOS)) {
                for (const [nivel, temas] of Object.entries(niveles)) {
                    const encontrado = temas.find(t => t.id === temaId);
                    if (encontrado) {
                        temaPredefinido = encontrado;
                        break;
                    }
                }
                if (temaPredefinido) break;
            }
            
            if (!temaPredefinido) {
                console.error('❌ No se encontró el tema predefinido para emergencia');
                return null;
            }

            console.log('🔄 Intentando recuperación de emergencia...');
            
            const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
            
            const temasLocales = JSON.parse(localStorage.getItem('pipeline_temas_emergencia') || '[]');
            const existente = temasLocales.find(t => t.nombre === temaPredefinido.nombre);
            
            if (existente) {
                console.log('📂 Tema encontrado en localStorage de emergencia');
                const id = await db.add('temas', existente);
                if (id) {
                    this._temaPredefinidoIdMap[temaId] = id;
                    return await db.obtenerTema(id);
                }
            }
            
            const nuevoTema = {
                nombre: temaPredefinido.nombre,
                descripcion: temaPredefinido.descripcion || `Tema de emergencia: ${temaPredefinido.nombre}`,
                idioma: idiomaActivo,
                nivel: 'A1',
                icono: temaPredefinido.icono || '📁',
                fechaCreacion: new Date().toISOString(),
                estado: 'en_curso',
                historiasIds: [],
                palabrasClave: [],
                _esPredefinido: true,
                _esImportado: true,
                origen: 'emergencia',
                _temaOriginalId: temaId,
                _caracteresSincronizados: false,
                _fechaSincronizacion: null,
                _caracteresSincronizadosCount: 0,
                _version_estandar: versionEstandar,
                _nombre_version: nombreVersion
            };
            
            temasLocales.push(nuevoTema);
            localStorage.setItem('pipeline_temas_emergencia', JSON.stringify(temasLocales));
            
            const id = await db.add('temas', nuevoTema);
            if (id) {
                this._temaPredefinidoIdMap[temaId] = id;
                return await db.obtenerTema(id);
            }
            
            console.warn('⚠️ Usando tema temporal en memoria');
            return {
                id: 'temp_' + Date.now(),
                nombre: temaPredefinido.nombre,
                idioma: idiomaActivo,
                nivel: 'A1',
                historiasIds: [],
                _esTemporal: true,
                _temaOriginalId: temaId,
                _caracteresSincronizados: false,
                _fechaSincronizacion: null,
                _caracteresSincronizadosCount: 0,
                _version_estandar: versionEstandar,
                _nombre_version: nombreVersion
            };
            
        } catch (e) {
            console.error('❌ Error en creación de emergencia:', e);
            return null;
        }
    }

    // ============================================================
    // 🔥 COMPLETADO INDEPENDIENTE POR IDIOMA (CORREGIDO)
    // ============================================================

    async _temaEstaCompletado(idioma, temaId) {
        const key = `${idioma}_${temaId}`;
        
        // Verificar caché
        if (this._temaCompletadoCache[key] !== undefined) {
            return this._temaCompletadoCache[key];
        }
        
        try {
            // 1. Buscar por ID directo en DB
            if (temaId && typeof temaId === 'number') {
                const temaDirecto = await db.obtenerTema(temaId);
                if (temaDirecto && temaDirecto.idioma === idioma) {
                    const estaCompletado = temaDirecto.estado === 'completado' || temaDirecto._completado === true;
                    this._temaCompletadoCache[key] = estaCompletado;
                    return estaCompletado;
                }
            }
            
            // 2. Buscar en el mapa de predefinidos
            const dbId = this._temaPredefinidoIdMap?.[temaId] || temaId;
            if (dbId && typeof dbId === 'number') {
                const temaReal = await db.obtenerTema(dbId);
                if (temaReal && temaReal.idioma === idioma) {
                    const estaCompletado = temaReal.estado === 'completado' || temaReal._completado === true;
                    this._temaCompletadoCache[key] = estaCompletado;
                    // Guardar en el mapa por idioma
                    if (!this._temasCompletadosPorIdioma[idioma]) {
                        this._temasCompletadosPorIdioma[idioma] = {};
                    }
                    this._temasCompletadosPorIdioma[idioma][temaId] = estaCompletado;
                    return estaCompletado;
                }
            }
            
            // 3. Buscar por _temaOriginalId en temas del idioma
            if (temaId) {
                const temasIdioma = await db.obtenerTemasPorIdioma(idioma);
                const temaLocal = temasIdioma.find(t => 
                    t._temaOriginalId === temaId || 
                    t._temaOriginalId === temaId.toString() ||
                    t.id === temaId ||
                    t.id === parseInt(temaId)
                );
                if (temaLocal) {
                    const estaCompletado = temaLocal.estado === 'completado' || temaLocal._completado === true;
                    this._temaCompletadoCache[key] = estaCompletado;
                    if (!this._temasCompletadosPorIdioma[idioma]) {
                        this._temasCompletadosPorIdioma[idioma] = {};
                    }
                    this._temasCompletadosPorIdioma[idioma][temaId] = estaCompletado;
                    return estaCompletado;
                }
            }

            // 4. Fallback a localStorage con clave por idioma
            try {
                const completados = JSON.parse(localStorage.getItem('pipeline_temas_completados') || '{}');
                const result = completados[key] === true;
                this._temaCompletadoCache[key] = result;
                if (!this._temasCompletadosPorIdioma[idioma]) {
                    this._temasCompletadosPorIdioma[idioma] = {};
                }
                this._temasCompletadosPorIdioma[idioma][temaId] = result;
                return result;
            } catch (e) {
                return false;
            }
        } catch (e) {
            console.warn('⚠️ Error verificando completado:', e);
            return false;
        }
    }

    // ============================================================
    // 🔥 MARCAR TEMA COMPLETADO - CORREGIDO PARA TODOS LOS TIPOS DE TEMAS
    // ============================================================

    async _marcarTemaCompletado(idioma, temaId, completado) {
        const key = `${idioma}_${temaId}`;

        // 1. Guardar en localStorage (fallback rápido)
        const completados = JSON.parse(localStorage.getItem('pipeline_temas_completados') || '{}');
        completados[key] = completado;
        localStorage.setItem('pipeline_temas_completados', JSON.stringify(completados));
        this._temaCompletadoCache[key] = completado;
        
        if (!this._temasCompletadosPorIdioma[idioma]) {
            this._temasCompletadosPorIdioma[idioma] = {};
        }
        this._temasCompletadosPorIdioma[idioma][temaId] = completado;

        let temaNombre = 'Tema';
        let temaActualizado = null;
        
        try {
            // 🔥 BUSCAR EL TEMA EN LA DB POR ID DIRECTO
            let temaEncontrado = null;
            
            // Intentar obtener el tema por ID (si es número)
            if (typeof temaId === 'number') {
                temaEncontrado = await db.obtenerTema(temaId);
            } else if (typeof temaId === 'string' && !isNaN(parseInt(temaId))) {
                temaEncontrado = await db.obtenerTema(parseInt(temaId));
            }
            
            // Si no se encontró, buscar en el mapa de predefinidos
            if (!temaEncontrado && this._temaPredefinidoIdMap && this._temaPredefinidoIdMap[temaId]) {
                const dbId = this._temaPredefinidoIdMap[temaId];
                temaEncontrado = await db.obtenerTema(dbId);
            }
            
            // Si no se encontró, buscar por _temaOriginalId
            if (!temaEncontrado) {
                const temasIdioma = await db.obtenerTemasPorIdioma(idioma);
                temaEncontrado = temasIdioma.find(t => 
                    t._temaOriginalId === temaId || 
                    t._temaOriginalId === temaId.toString() ||
                    t.id === temaId ||
                    t.id === parseInt(temaId)
                );
            }
            
            // Si encontramos el tema, actualizarlo
            if (temaEncontrado) {
                temaActualizado = temaEncontrado;
                temaNombre = temaEncontrado.nombre || temaNombre;
                temaEncontrado.estado = completado ? 'completado' : 'en_curso';
                temaEncontrado._completado = completado;
                if (completado) {
                    temaEncontrado._fechaCompletado = Date.now();
                } else {
                    delete temaEncontrado._fechaCompletado;
                }
                await db.update('temas', temaEncontrado);
                console.log(`📌 Tema "${temaEncontrado.nombre}" (${idioma}) marcado como ${completado ? 'completado' : 'en curso'} en DB (ID: ${temaEncontrado.id})`);
                
                // Actualizar el mapa de predefinidos si es necesario
                if (temaEncontrado._temaOriginalId) {
                    this._temaPredefinidoIdMap[temaEncontrado._temaOriginalId] = temaEncontrado.id;
                }
            } else {
                console.warn(`⚠️ No se encontró el tema con ID: ${temaId} para marcarlo como ${completado ? 'completado' : 'en curso'}`);
            }

        } catch (e) {
            console.warn('⚠️ Error guardando estado de completado en DB:', e);
        }

        // Disparar evento
        window.dispatchEvent(new CustomEvent('temaCompletado', {
            detail: { idioma, temaId, completado, tema: temaActualizado }
        }));

        // 🔥 ACTUALIZAR LA VISTA
        await this._renderTemas();

        // Si estamos en vista de detalle, actualizar también
        if (this.modoVistaTemas === 'detalle' && this.temaSeleccionado) {
            const temaIdActual = this.temaSeleccionado;
            if (temaIdActual === temaId || temaIdActual === parseInt(temaId)) {
                await this._verTemaDetalle(temaIdActual);
            }
        }

        // Notificar al usuario
        if (this._core) {
            this._core.mostrarToast(
                completado ? `✅ "${temaNombre}" completado (${idioma})` : `↩️ "${temaNombre}" marcado como no completado (${idioma})`,
                completado ? 'success' : 'info'
            );
        }
    }

    // ============================================================
    // MÉTODOS DE NIVEL
    // ============================================================

    async _temaPredefinidoEstaGuardado(temaId) {
        try {
            if (this._temaPredefinidoIdMap[temaId]) {
                const tema = await db.obtenerTema(this._temaPredefinidoIdMap[temaId]);
                if (tema) return true;
            }
            const temasGuardados = JSON.parse(localStorage.getItem('pipeline_temas_predefinidos_guardados') || '{}');
            return !!temasGuardados[temaId];
        } catch (e) {
            return false;
        }
    }

    async _obtenerProgresoNivel(idioma, nivel, version) {
        const versionFinal = version || this._obtenerVersionEstandar(idioma);
        const temasNivel = this._obtenerTemasPorNivelYVersion(versionFinal, nivel);
        let completados = 0;
        let total = temasNivel.length;

        for (const tema of temasNivel) {
            if (await this._temaEstaCompletado(idioma, tema.id)) {
                completados++;
            }
        }

        return { completados, total, porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0 };
    }

    async _desbloquearNivel(idioma, nivel) {
        const idx = this.NIVELES.indexOf(nivel);
        if (idx < 0 || idx >= this.NIVELES.length - 1) return;

        const siguienteNivel = this.NIVELES[idx + 1];
        const key = `${idioma}_nivel_${siguienteNivel}`;

        const desbloqueados = JSON.parse(localStorage.getItem('pipeline_niveles_desbloqueados') || '{}');
        if (desbloqueados[key]) return;

        desbloqueados[key] = true;
        localStorage.setItem('pipeline_niveles_desbloqueados', JSON.stringify(desbloqueados));
        this._nivelDesbloqueadoCache[key] = true;

        window.dispatchEvent(new CustomEvent('nivelDesbloqueado', {
            detail: { idioma, nivel: siguienteNivel }
        }));

        if (this._core) {
            this._core.mostrarToast(`🎉 ¡Nivel ${siguienteNivel} desbloqueado!`, 'success');
        }
    }

    async _nivelEstaDesbloqueado(idioma, nivel) {
        const idx = this.NIVELES.indexOf(nivel);
        if (idx === 0) return true;

        const key = `${idioma}_nivel_${nivel}`;
        if (this._nivelDesbloqueadoCache[key] !== undefined) return this._nivelDesbloqueadoCache[key];

        try {
            const desbloqueados = JSON.parse(localStorage.getItem('pipeline_niveles_desbloqueados') || '{}');
            const result = desbloqueados[key] === true;
            this._nivelDesbloqueadoCache[key] = result;
            return result;
        } catch (e) {
            return false;
        }
    }

    // ============================================================
    // NAVEGACIÓN
    // ============================================================

    _volverTemas() {
        this.modoVistaTemas = 'lista';
        this.temaSeleccionado = null;
        this._renderTemas();
    }

    async _salirDelTema() {
        try {
            if (window.pipeline && typeof window.pipeline.salirDelTema === 'function') {
                await window.pipeline.salirDelTema();
            } else {
                this._volverTemas();
            }
        } catch (error) {
            console.warn('⚠️ Error al salir del tema:', error);
            this._volverTemas();
        }
    }

    // ============================================================
    // ACCIONES (DELEGADAS A UITemasActions)
    // ============================================================

    async _estudiarTema(temaId) {
        return window.UITemasActions.estudiarTema(temaId);
    }

    async _estudiarHistoria(historiaId) {
        return window.UITemasActions.estudiarHistoria(historiaId);
    }

    async _exportarTema(temaId) {
        return window.UITemasActions.exportarTema(temaId);
    }

    async exportarHistoria(historiaId) {
        return window.UITemasActions.exportarHistoria(historiaId);
    }

    async _eliminarTema(temaId) {
        return window.UITemasActions.eliminarTema(temaId);
    }

    async _eliminarHistoriaDeTema(historiaId) {
        return window.UITemasActions.eliminarHistoriaDeTema(historiaId);
    }

    async _generarTemaPredefinido(temaId, temaNombre, nivel) {
        return window.UITemasActions.generarTemaPredefinido(temaId, temaNombre, nivel);
    }

    async _importarHistoriaATema(temaId) {
        return window.UITemasActions.importarHistoriaATema(temaId);
    }

    async _importarHistoriaYAsignarATema(temaId) {
        return window.UITemasActions.importarHistoriaYAsignarATema(temaId);
    }

    async _abrirCreadorHistoria(temaId) {
        return window.UITemasActions.abrirCreadorHistoria(temaId);
    }

    _cerrarCreadorHistoria() {
        return window.UITemasActions.cerrarCreadorHistoria();
    }

    async _generarHistoriaConDescripcion(temaId) {
        return window.UITemasActions.generarHistoriaConDescripcion(temaId);
    }

    async _abrirGeneradorDesdeTema(temaId, temaNombre) {
        return window.UITemasActions.abrirGeneradorDesdeTema(temaId, temaNombre);
    }

    async _sincronizarCaracteresTema(temaId) {
        return window.UITemasActions.sincronizarCaracteresTema(temaId);
    }

    async _forzarRefresco() {
        if (this._refrescando) return;
        this._refrescando = true;

        try {
            await gestorIdiomas._cargarIdiomas();
            await this._cargarMapaTemasPredefinidos();

            if (this.modoVistaTemas === 'detalle' && this.temaSeleccionado) {
                await this._verTemaDetalle(this.temaSeleccionado);
            } else {
                await this._renderTemas();
            }

            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this._core);
            }
            if (this._core) {
                this._core._actualizarIndicadoresSeguro();
            }
            if (window.UIGrammar) {
                window.UIGrammar._cargarGramatica();
            }

            if (window.vigiaGramatical) {
                try {
                    await window.vigiaGramatical.initGramatical();
                    await window.vigiaGramatical._actualizarEdadGramatical(this._idiomaActual);
                } catch (err) {}
            }

        } catch (error) {
            console.error('❌ Error en refresco de temas:', error);
        } finally {
            this._refrescando = false;
        }
    }

    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this.IDIOMAS_JEROGLIFICOS.some(item =>
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

    _normalizarTipoGramatical(tipo, palabra, idioma) {
        // ... (código existente, sin cambios)
        if (!tipo || tipo === '' || tipo === 'sustantivo') {
            if (this._esJeroglifico(idioma)) {
                return this._detectarTipoJeroglifico(palabra, idioma);
            }
            return 'sustantivo';
        }

        const tipoLower = tipo.toLowerCase().trim();

        const mapeo = {
            'verbo': 'verbo', 'verb': 'verbo', 'verbos': 'verbo',
            'verbo auxiliar': 'verbo', 'verbo modal': 'verbo',
            'verbo transitivo': 'verbo', 'verbo intransitivo': 'verbo',
            'verbo copulativo': 'verbo', 'verbo regular': 'verbo',
            'verbo irregular': 'verbo', 'verbo compuesto': 'verbo',
            'verbo reflexivo': 'verbo', 'action': 'verbo',
            'action verb': 'verbo', 'verb, action': 'verbo',
            'verb (action)': 'verbo', 'hacer': 'verbo',
            'movimiento': 'verbo', 'acción': 'verbo',
            'proceso': 'verbo', 'estado': 'verbo',
            'sustantivo': 'sustantivo', 'sustantivos': 'sustantivo',
            'noun': 'sustantivo', 'nouns': 'sustantivo',
            'nombre': 'sustantivo', 'thing': 'sustantivo',
            'object': 'sustantivo', 'person': 'sustantivo',
            'place': 'sustantivo', 'idea': 'sustantivo',
            'concept': 'sustantivo',
            'adjetivo': 'adjetivo', 'adjetivos': 'adjetivo',
            'adjective': 'adjetivo', 'adjectives': 'adjetivo',
            'descriptive': 'adjetivo', 'qualifier': 'adjetivo',
            'adverbio': 'adverbio', 'adverbios': 'adverbio',
            'adverb': 'adverbio', 'adverbs': 'adverbio',
            'preposición': 'preposicion', 'preposiciones': 'preposicion',
            'preposition': 'preposicion', 'prepositions': 'preposicion',
            'conjunción': 'conjuncion', 'conjunciones': 'conjuncion',
            'conjunction': 'conjuncion', 'conjunctions': 'conjuncion',
            'conector': 'conjuncion', 'conectores': 'conjuncion',
            'pronombre': 'pronombre', 'pronombres': 'pronombre',
            'pronoun': 'pronombre', 'pronouns': 'pronombre',
            'clasificador': 'clasificador', 'clasificadores': 'clasificador',
            'measure': 'clasificador', 'measure word': 'clasificador',
            'counter': 'clasificador',
            'partícula': 'particula', 'partículas': 'particula',
            'particle': 'particula', 'particles': 'particula',
            'grammatical particle': 'particula',
            'artículo': 'articulo', 'artículos': 'articulo',
            'article': 'articulo', 'articles': 'articulo',
            'determiner': 'articulo',
            'número': 'numeral', 'números': 'numeral',
            'number': 'numeral', 'numbers': 'numeral',
            'numeral': 'numeral', 'numerales': 'numeral',
            'interjección': 'interjeccion', 'interjecciones': 'interjeccion',
            'interjection': 'interjeccion', 'interjections': 'interjeccion'
        };

        if (mapeo[tipoLower]) return mapeo[tipoLower];

        for (const [variante, estandar] of Object.entries(mapeo)) {
            if (tipoLower.includes(variante) || variante.includes(tipoLower)) {
                return estandar;
            }
        }

        const categoriasValidas = [
            'verbo', 'sustantivo', 'adjetivo', 'adverbio', 'pronombre',
            'preposicion', 'conjuncion', 'articulo', 'interjeccion',
            'numeral', 'clasificador', 'particula'
        ];

        if (categoriasValidas.includes(tipoLower)) return tipoLower;

        if (this._esJeroglifico(idioma) && palabra) {
            return this._detectarTipoJeroglifico(palabra, idioma);
        }

        return 'sustantivo';
    }

    _detectarTipoJeroglifico(palabra, idioma) {
        // ... (código existente)
        if (!palabra) return 'sustantivo';

        const palabraStr = palabra.toString().trim();
        const idiomaLower = idioma?.toLowerCase().trim() || '';

        if (idiomaLower === 'zh' || idiomaLower === 'chino' || idiomaLower === 'chinese' ||
            idiomaLower.includes('chino') || idiomaLower.includes('chinese')) {
            return this._detectarTipoChino(palabraStr);
        }

        if (idiomaLower === 'ja' || idiomaLower === 'japonés' || idiomaLower === 'japanese' ||
            idiomaLower.includes('japonés') || idiomaLower.includes('japanese')) {
            return this._detectarTipoJapones(palabraStr);
        }

        if (idiomaLower === 'ko' || idiomaLower === 'coreano' || idiomaLower === 'korean' ||
            idiomaLower.includes('coreano') || idiomaLower.includes('korean')) {
            return this._detectarTipoCoreano(palabraStr);
        }

        return 'sustantivo';
    }

    _detectarTipoChino(palabra) {
        // ... (código existente)
        const p = palabra.toString().trim();

        const verbos = [
            '有', '是', '去', '来', '说', '看', '吃', '喝', '走', '跑', '做', '想', '要', '能', '会',
            '可以', '应该', '喜欢', '爱', '玩', '学', '习', '写', '读', '听', '问', '回答', '叫', '告诉',
            '帮助', '给', '拿', '放', '坐', '站', '躺', '睡', '醒', '起', '穿', '脱', '洗', '刷', '擦',
            '扫', '拖', '搬', '提', '推', '拉', '开', '关', '进', '出', '上', '下', '跟', '陪', '带',
            '领', '送', '接', '等', '找', '发现', '觉得', '认为', '知道', '明白', '理解', '了解',
            '研究', '分析', '讨论', '决定', '选择', '开始', '结束', '继续', '完成', '改变',
            '发生', '出现', '消失', '存在', '生活', '工作', '学习', '运动', '休息', '旅行'
        ];

        const adjetivos = [
            '好', '大', '小', '多', '少', '高', '低', '快', '慢', '热', '冷', '新', '旧', '美', '丑',
            '聪明', '漂亮', '可爱', '帅', '酷', '棒', '差', '坏', '远', '近', '长', '短', '宽', '窄',
            '厚', '薄', '重', '轻', '软', '硬', '深', '浅', '亮', '暗', '干净', '脏', '安静', '吵闹',
            '高兴', '快乐', '悲伤', '生气', '紧张', '放松', '勇敢', '善良', '友好', '热情',
            '认真', '努力', '勤奋', '懒惰', '细心', '粗心', '耐心', '急躁', '谦虚', '骄傲'
        ];

        const pronombres = [
            '我', '你', '他', '她', '它', '我们', '你们', '他们', '她们', '它们', '自己', '大家',
            '谁', '什么', '哪', '这', '那', '每', '各', '某', '任何', '所有', '全部', '有些', '许多'
        ];

        const clasificadores = [
            '个', '只', '条', '张', '件', '双', '本', '支', '把', '块', '辆', '架', '台', '部',
            '层', '间', '所', '家', '口', '头', '匹', '峰', '棵', '朵', '片', '粒', '颗', '根',
            '段', '节', '课', '页', '封', '首', '篇', '幅', '座', '栋', '层', '顶', '扇', '盏'
        ];

        const particulas = [
            '的', '了', '着', '过', '得', '所', '被', '把', '给', '让', '叫', '使', '令'
        ];

        const conjunciones = [
            '和', '跟', '与', '及', '或者', '还是', '不但', '而且', '因为', '所以', '虽然', '但是',
            '如果', '那么', '既然', '就', '便', '才', '然后', '接着', '于是', '因此', '由于'
        ];

        const preposiciones = [
            '在', '从', '到', '给', '对', '对于', '关于', '除了', '为了', '由于', '通过', '根据'
        ];

        const numeros = [
            '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万', '亿',
            '零', '半', '两', '几', '多少', '若干', '许多', '一些', '各', '每'
        ];

        const interjecciones = [
            '啊', '哦', '嗯', '哎呀', '哇', '哈', '嘿', '喂', '唉', '哟', '咦', '哼', '呸'
        ];

        if (verbos.includes(p)) return 'verbo';
        if (adjetivos.includes(p)) return 'adjetivo';
        if (pronombres.includes(p)) return 'pronombre';
        if (clasificadores.includes(p)) return 'clasificador';
        if (particulas.includes(p)) return 'particula';
        if (conjunciones.includes(p)) return 'conjuncion';
        if (preposiciones.includes(p)) return 'preposicion';
        if (numeros.includes(p)) return 'numeral';
        if (interjecciones.includes(p)) return 'interjeccion';

        return 'sustantivo';
    }

    _detectarTipoJapones(palabra) {
        // ... (código existente)
        const p = palabra.toString().trim();

        const verbos = [
            'する', 'なる', '行く', '来る', '見る', '食べる', '飲む', '話す', '聞く', '読む',
            '書く', '走る', '歩く', '寝る', '起きる', '着る', '脱ぐ', '洗う', '使う', '作る',
            '買う', '売る', '教える', '学ぶ', '考える', '思う', '感じる', '愛する', '好き',
            'ある', 'いる', 'できる', 'なる', '与える', 'もらう', 'くれる', 'あげる',
            '歌う', '踊る', '遊ぶ', '泳ぐ', '飛ぶ', '転ぶ', '笑う', '泣く', '叫ぶ', '話す'
        ];

        const adjetivos = [
            'いい', '悪い', '大きい', '小さい', '高い', '低い', '速い', '遅い', '熱い', '冷たい',
            '新しい', '古い', '美しい', '醜い', 'かわいい', 'かっこいい', 'すごい', 'やさしい',
            '強い', '弱い', '明るい', '暗い', '広い', '狭い', '長い', '短い', '太い', '細い'
        ];

        if (verbos.includes(p)) return 'verbo';
        if (adjetivos.includes(p)) return 'adjetivo';

        return 'sustantivo';
    }

    _detectarTipoCoreano(palabra) {
        // ... (código existente)
        const p = palabra.toString().trim();

        const verbos = [
            '하다', '되다', '가다', '오다', '보다', '먹다', '마시다', '말하다', '듣다', '읽다',
            '쓰다', '달리다', '걷다', '자다', '일어나다', '입다', '벗다', '씻다', '사용하다',
            '만들다', '사다', '팔다', '가르치다', '배우다', '생각하다', '느끼다', '사랑하다',
            '좋아하다', '싫어하다', '원하다', '필요하다', '있다', '없다', '알다', '모르다'
        ];

        const adjetivos = [
            '좋다', '나쁘다', '크다', '작다', '높다', '낮다', '빠르다', '느리다', '덥다', '춥다',
            '새롭다', '낡다', '아름답다', '예쁘다', '귀엽다', '멋지다', '대단하다',
            '많다', '적다', '길다', '짧다', '넓다', '좁다', '밝다', '어둡다'
        ];

        if (verbos.includes(p)) return 'verbo';
        if (adjetivos.includes(p)) return 'adjetivo';

        return 'sustantivo';
    }

    _detectarTipoEstructura(caracter) {
        if (!caracter) return 'desconocido';
        if (/[明好林双从]/u.test(caracter)) return 'izquierda-derecha';
        if (/[安花草苗]/u.test(caracter)) return 'arriba-abajo';
        if (/[国园图园]/u.test(caracter)) return 'envolvente';
        if (/[街微微]/u.test(caracter)) return 'izquierda-media-derecha';
        if (/[草篮]/u.test(caracter)) return 'arriba-media-abajo';
        return 'simple';
    }

    // ============================================================
    // RENDERIZADO (DELEGADO A UITemasRender)
    // ============================================================

    async _renderTemas() {
        return window.UITemasRender.renderTemas(this);
    }

    async _verTemaDetalle(temaId) {
        return window.UITemasRender.verTemaDetalle(this, temaId);
    }

    _renderizarPalabraConPinyin(palabra) {
        return window.UITemasRender.renderizarPalabraConPinyin(palabra, this);
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UITemas = new UITemasCore();
console.log('✅ UITemas Core v3.0 - COMPLETADO INDEPENDIENTE POR IDIOMA Y CHECKBOX CORREGIDO');
console.log('  🔥 _temaEstaCompletado busca en múltiples lugares (ID directo, mapa predefinidos, _temaOriginalId)');
console.log('  🔥 _marcarTemaCompletado encuentra el tema por ID directo, mapa o _temaOriginalId');
console.log('  🔥 El checkbox ahora funciona correctamente en Mis Temas, Temas Importados y Predefinidos');
console.log('  📌 La clave de completado incluye el idioma: {idioma}_{temaId}');
console.log('  📊 Progreso por nivel adaptado al idioma actual');