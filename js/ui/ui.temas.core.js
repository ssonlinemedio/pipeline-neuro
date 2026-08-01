// ============================================================
// UI TEMAS CORE v4.1 - CORREGIDO Y FUNCIONAL
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
        this._generandoTemaPredefinido = false;

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
            this._temaCompletadoCache = {};
            this._nivelDesbloqueadoCache = {};
            this._temasCompletadosPorIdioma = {};
            this._temaPredefinidoIdMap = {};
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

    _obtenerIdiomaNativo() {
        try {
            const usuario = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
            return usuario.idiomaNativo || 'español';
        } catch (e) {
            return 'español';
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

    // ============================================================
    // CARGAR MAPA DE TEMAS PREDEFINIDOS POR IDIOMA
    // ============================================================

    async _cargarMapaTemasPredefinidos() {
        try {
            const todosLosTemas = await db.obtenerTemas();
            this._temaPredefinidoIdMap = {};
            for (const tema of todosLosTemas) {
                if (tema._esPredefinido && tema.id && tema._temaOriginalId && tema.idioma) {
                    if (!this._temaPredefinidoIdMap[tema.idioma]) {
                        this._temaPredefinidoIdMap[tema.idioma] = {};
                    }
                    this._temaPredefinidoIdMap[tema.idioma][tema._temaOriginalId] = tema.id;
                }
            }
            console.log('📂 Mapa de temas predefinidos por idioma cargado:', Object.keys(this._temaPredefinidoIdMap));
        } catch (e) {
            console.warn('⚠️ Error cargando mapa de temas predefinidos:', e);
        }
    }

    // ============================================================
    // OBTENER TEMA PREDEFINIDO POR IDIOMA
    // ============================================================

    async _obtenerTemaPredefinidoPorIdioma(temaId, idioma) {
        try {
            const idMap = this._temaPredefinidoIdMap[idioma];
            if (idMap && idMap[temaId] !== undefined) {
                const temaGuardado = await db.obtenerTema(idMap[temaId]);
                if (temaGuardado && temaGuardado.idioma === idioma) {
                    return temaGuardado;
                } else {
                    delete this._temaPredefinidoIdMap[idioma][temaId];
                }
            }

            const todosLosTemas = await db.obtenerTemasPorIdioma(idioma);
            const temaEncontrado = todosLosTemas.find(t => 
                t._temaOriginalId === temaId && 
                t._esPredefinido === true
            );

            if (temaEncontrado) {
                if (!this._temaPredefinidoIdMap[idioma]) {
                    this._temaPredefinidoIdMap[idioma] = {};
                }
                this._temaPredefinidoIdMap[idioma][temaId] = temaEncontrado.id;
                return temaEncontrado;
            }

            return null;
        } catch (e) {
            console.warn(`⚠️ Error en _obtenerTemaPredefinidoPorIdioma:`, e);
            return null;
        }
    }

    // ============================================================
    // VERIFICAR SI UN TEMA ESTÁ GUARDADO EN UN IDIOMA
    // ============================================================

    async _temaPredefinidoEstaGuardado(temaId, idioma) {
        try {
            const todosLosTemas = await db.obtenerTemasPorIdioma(idioma);
            return todosLosTemas.some(t => 
                t._temaOriginalId === temaId && 
                t._esPredefinido === true &&
                t.idioma === idioma
            );
        } catch (e) {
            return false;
        }
    }

    // ============================================================
    // VERIFICAR SI UN TEMA ESTÁ COMPLETADO EN UN IDIOMA
    // ============================================================

    async _temaEstaCompletado(idioma, temaId) {
        const key = `${idioma}_${temaId}`;
        
        if (this._temaCompletadoCache[key] !== undefined) {
            return this._temaCompletadoCache[key];
        }
        
        try {
            const todosLosTemas = await db.obtenerTemasPorIdioma(idioma);
            const temaEncontrado = todosLosTemas.find(t => 
                t._temaOriginalId === temaId && 
                t._esPredefinido === true &&
                t.idioma === idioma
            );

            if (temaEncontrado) {
                const estaCompletado = temaEncontrado.estado === 'completado' || temaEncontrado._completado === true;
                this._temaCompletadoCache[key] = estaCompletado;
                return estaCompletado;
            }

            this._temaCompletadoCache[key] = false;
            return false;
            
        } catch (e) {
            console.warn(`⚠️ Error en _temaEstaCompletado:`, e);
            return false;
        }
    }

    // ============================================================
    // MARCAR UN TEMA COMO COMPLETADO EN UN IDIOMA
    // ============================================================

    async _marcarTemaCompletado(idioma, temaId, completado) {
        const key = `${idioma}_${temaId}`;
        
        let temaEncontrado = null;
        try {
            const todosLosTemas = await db.obtenerTemasPorIdioma(idioma);
            temaEncontrado = todosLosTemas.find(t => 
                t._temaOriginalId === temaId && 
                t._esPredefinido === true &&
                t.idioma === idioma
            );
        } catch (e) {
            console.warn(`⚠️ Error buscando tema:`, e);
        }

        if (!temaEncontrado) {
            console.warn(`⚠️ No se encontró el tema ${temaId} en ${idioma}. Creando plantilla...`);
            const temaCreado = await this._guardarTemaPredefinidoComoPlantilla(temaId, idioma);
            if (temaCreado) {
                temaEncontrado = temaCreado;
            } else {
                console.error(`❌ No se pudo crear el tema ${temaId} en ${idioma}.`);
                return;
            }
        }

        let temaNombre = temaEncontrado.nombre || 'Tema';
        temaEncontrado.estado = completado ? 'completado' : 'en_curso';
        temaEncontrado._completado = completado;
        if (completado) {
            temaEncontrado._fechaCompletado = Date.now();
        } else {
            delete temaEncontrado._fechaCompletado;
        }

        try {
            await db.update('temas', temaEncontrado);
            console.log(`📌 Tema "${temaNombre}" (${idioma}) marcado como ${completado ? 'completado' : 'en curso'}`);
        } catch (e) {
            console.error(`❌ Error guardando estado:`, e);
            return;
        }

        this._temaCompletadoCache[key] = completado;
        if (!this._temasCompletadosPorIdioma[idioma]) {
            this._temasCompletadosPorIdioma[idioma] = {};
        }
        this._temasCompletadosPorIdioma[idioma][temaId] = completado;

        window.dispatchEvent(new CustomEvent('temaCompletado', {
            detail: { idioma, temaId, completado, tema: temaEncontrado }
        }));

        await this._renderTemas();

        if (this.modoVistaTemas === 'detalle' && this.temaSeleccionado) {
            const temaIdActual = this.temaSeleccionado;
            if (temaIdActual === temaId || temaIdActual === parseInt(temaId) || 
                (temaEncontrado && temaIdActual === temaEncontrado.id)) {
                await this._verTemaDetalle(temaIdActual);
            }
        }

        if (this._core) {
            this._core.mostrarToast(
                completado ? `✅ "${temaNombre}" completado (${idioma})` : `↩️ "${temaNombre}" marcado como no completado (${idioma})`,
                completado ? 'success' : 'info'
            );
        }
    }

    // ============================================================
    // 🔥 GUARDAR TEMA PREDEFINIDO COMO PLANTILLA (SIN GROQ)
    // ============================================================

    async _guardarTemaPredefinidoComoPlantilla(temaId, idiomaForzado = null) {
        try {
            const idioma = idiomaForzado || gestorIdiomas?.getIdiomaActivo() || 'es';
            const versionEstandar = this._obtenerVersionEstandar(idioma);
            
            let temaPredefinido = null;
            let nivelEncontrado = null;
            
            const temasVersion = this.TEMAS_PREDEFINIDOS[versionEstandar];
            if (temasVersion) {
                for (const [nivel, temas] of Object.entries(temasVersion)) {
                    const encontrado = temas.find(t => t.id === temaId);
                    if (encontrado) {
                        temaPredefinido = encontrado;
                        nivelEncontrado = nivel;
                        break;
                    }
                }
            }
            
            if (!temaPredefinido) {
                for (const [version, niveles] of Object.entries(this.TEMAS_PREDEFINIDOS)) {
                    for (const [nivel, temas] of Object.entries(niveles)) {
                        const encontrado = temas.find(t => t.id === temaId);
                        if (encontrado) {
                            temaPredefinido = encontrado;
                            nivelEncontrado = nivel;
                            break;
                        }
                    }
                    if (temaPredefinido) break;
                }
            }

            if (!temaPredefinido) {
                console.warn(`⚠️ Tema predefinido no encontrado: ${temaId}`);
                return null;
            }

            // 🔥 CREAR SOLO LA ESTRUCTURA DEL TEMA, SIN CONTENIDO
            const nuevoTema = {
                nombre: temaPredefinido.nombre,
                descripcion: temaPredefinido.descripcion || '',
                idioma: idioma,
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
                _version_estandar: versionEstandar,
                _nombre_version: this._obtenerNombreVersion(idioma, versionEstandar),
                _tieneContenidoReal: false
            };

            const idGuardado = await db.guardarTema(nuevoTema);
            
            if (idGuardado) {
                if (!this._temaPredefinidoIdMap[idioma]) {
                    this._temaPredefinidoIdMap[idioma] = {};
                }
                this._temaPredefinidoIdMap[idioma][temaId] = idGuardado;
                const temaCompleto = await db.obtenerTema(idGuardado);
                console.log(`📄 Tema predefinido "${nuevoTema.nombre}" guardado como PLANTILLA (ID: ${idGuardado}) para idioma: ${idioma}`);
                return temaCompleto;
            }
            return null;

        } catch (error) {
            console.error(`❌ Error guardando plantilla:`, error);
            return null;
        }
    }

    // ============================================================
    // 🔥 GENERAR PLANTILLA JSON PARA TEMA PREDEFINIDO (SIN GROQ)
    // ============================================================

    _generarPlantillaTemaPredefinido(temaId, temaNombre, nivel, idioma, nombreIdioma, idiomaNativo, nombreNativo, esJeroglifico, numHistorias, numFrases, versionEstandar, nombreVersion) {
        const numHistoriasFinal = numHistorias || 3;
        const numFrasesFinal = numFrases || 6;
        const palabrasRequeridas = window.gestorIdiomas?._obtenerPalabrasPorVersion?.(idioma, versionEstandar, nivel) || 2000;
        const numTemasRecomendados = this._calcularNumeroTemas(versionEstandar, nivel) || 8;

        let instruccionesTranscripcion = '';
        let camposTranscripcion = {};
        
        if (esJeroglifico) {
            instruccionesTranscripcion = `
                ⚠️ IMPORTANTE PARA IDIOMAS JEROGLÍFICOS:
                - Incluye 'pinyin' CON TONOS para CADA frase y CADA palabra.
                - La 'segmentacion' debe separar CADA palabra con su pinyin correspondiente.
                - Ejemplo: "你好" → "nǐ hǎo"
            `;
            camposTranscripcion = {
                "frase": "pinyin con tonos",
                "palabra": "pinyin con tonos",
                "segmentacion": "hanzi y pinyin separados"
            };
        } else {
            instruccionesTranscripcion = `
                ⚠️ IMPORTANTE PARA TRANSCRIPCIÓN FONÉTICA:
                - Incluye 'transcripcion' para CADA frase y CADA palabra.
                - La transcripción debe estar en el sistema fonético NATIVO del usuario (${nombreNativo}).
                - Ejemplo: "I have a pencil" → transcripción: "ai jaf a pensil" (para español).
            `;
            camposTranscripcion = {
                "frase": "transcripcion en " + nombreNativo,
                "palabra": "transcripcion en " + nombreNativo
            };
        }

        const plantilla = {
            "_INSTRUCCIONES_PARA_IA": {
                "version": "22.0",
                "accion": "Genera " + numHistoriasFinal + " mini-historias sobre \"" + temaNombre + "\"",
                "idioma": idioma,
                "nombre_idioma": nombreIdioma,
                "nivel": nivel,
                "tema": temaNombre,
                "tema_id": temaId,
                "num_historias": numHistoriasFinal,
                "max_historias": 10,
                "max_frases_por_historia": 10,
                "es_jeroglifico": esJeroglifico,
                "idioma_nativo": idiomaNativo,
                "nombre_nativo": nombreNativo,
                "version_estandar": versionEstandar,
                "nombre_version": nombreVersion,
                "palabras_requeridas": palabrasRequeridas,
                "num_temas_recomendados": numTemasRecomendados,
                "instrucciones": [
                    "1. Genera " + numHistoriasFinal + " mini-historias sobre \"" + temaNombre + "\"",
                    "2. Cada historia debe tener " + numFrasesFinal + " frases en " + idioma,
                    "3. El nivel de dificultad es " + nivel,
                    "4. La versión del estándar es " + nombreVersion + " (" + versionEstandar + ")",
                    "5. Este nivel requiere aproximadamente " + palabrasRequeridas + " palabras en total",
                    "6. Cada frase debe tener: 'original', 'traduccion'",
                    "7. Incluye 'regla_gramatical' y 'explicacion_gramatical' para cada frase",
                    "8. ⚠️ IMPORTANTE: Para CADA frase, incluye 'palabras' con TODAS las palabras de la frase",
                    "9. " + instruccionesTranscripcion,
                    "10. IMPORTANTE: Clasifica CADA palabra con su tipo gramatical correcto",
                    "11. IMPORTANTE: Genera una sección 'caracteres_destacados' con los caracteres clave del tema"
                ],
                "campos_transcripcion": camposTranscripcion,
                "formato_palabras": esJeroglifico ? {
                    "hanzi": "El carácter en el idioma objetivo",
                    "pinyin": "Pronunciación con tonos",
                    "familia": "Familia SEMÁNTICA",
                    "tipo": "Categoría GRAMATICAL",
                    "significado": "Traducción al " + idiomaNativo
                } : {
                    "palabra": "La palabra en el idioma objetivo",
                    "transcripcion": "Transcripción fonética en " + nombreNativo,
                    "familia": "Familia SEMÁNTICA",
                    "tipo": "Categoría GRAMATICAL",
                    "significado": "Traducción al " + idiomaNativo
                }
            },
            "meta": {
                "tema": temaNombre,
                "tema_id": temaId,
                "idioma": idioma,
                "nombre_idioma": nombreIdioma,
                "nivel": nivel,
                "es_jeroglifico": esJeroglifico,
                "idioma_nativo": idiomaNativo,
                "nombre_nativo": nombreNativo,
                "num_historias": numHistoriasFinal,
                "version_estandar": versionEstandar,
                "nombre_version": nombreVersion,
                "palabras_requeridas": palabrasRequeridas,
                "fecha_generacion": new Date().toISOString(),
                "version": "22.0",
                "_esPredefinido": true,
                "_esImportado": true
            },
            "historias": []
        };

        // Crear historias con placeholders
        for (let i = 1; i <= numHistoriasFinal; i++) {
            const historia = { 
                id: i, 
                titulo: "Historia " + i + " sobre " + temaNombre, 
                frases: [] 
            };
            for (let j = 1; j <= numFrasesFinal; j++) {
                const frase = {
                    original: "Frase " + j + " en " + idioma,
                    traduccion: "Traduccion " + j + " al " + idiomaNativo,
                    regla_gramatical: "[Regla gramatical " + j + "]",
                    explicacion_gramatical: "[Explicacion " + j + " en " + idiomaNativo + "]",
                    palabras: []
                };
                
                if (esJeroglifico) {
                    frase.pinyin = "[pinyin_con_tonos_de_la_frase_" + j + "]";
                    frase.segmentacion = {
                        hanzi: "[hanzi_frase_" + j + "]",
                        pinyin: "[pinyin_frase_" + j + "]"
                    };
                    frase.palabras.push({
                        hanzi: "[hanzi_palabra_" + j + "]",
                        pinyin: "[pinyin_de_palabra_" + j + "]",
                        familia: "[familia_semantica]",
                        tipo: "[tipo_gramatical]",
                        significado: "[significado_en_" + idiomaNativo + "]"
                    });
                } else {
                    frase.transcripcion = "[transcripcion_en_" + nombreNativo + "_de_la_frase_" + j + "]";
                    frase.palabras.push({
                        palabra: "[palabra_" + j + "]",
                        transcripcion: "[transcripcion_en_" + nombreNativo + "_de_palabra_" + j + "]",
                        familia: "[familia_semantica]",
                        tipo: "[tipo_gramatical]",
                        significado: "[significado_en_" + idiomaNativo + "]"
                    });
                }
                historia.frases.push(frase);
            }
            plantilla.historias.push(historia);
        }

        if (esJeroglifico) {
            plantilla.caracteres_destacados = {
                "_INSTRUCCIONES": {
                    "version": "2.0",
                    "accion": "Genera caracteres destacados para el tema",
                    "tema": temaNombre,
                    "idioma": idioma,
                    "nivel": nivel,
                    "idioma_nativo": idiomaNativo,
                    "instrucciones": [
                        "1. Identifica los caracteres MÁS IMPORTANTES del tema",
                        "2. Para cada carácter, proporciona: 'caracter', 'pinyin', 'significado', 'frecuencia', 'palabras_relacionadas', 'frases_de_la_historia'"
                    ]
                },
                "lista": []
            };
        }

        return plantilla;
    }

    _calcularNumeroTemas(version, nivel) {
        const versionData = this.TEMAS_PREDEFINIDOS[version] || this.TEMAS_PREDEFINIDOS[this._VERSION_DEFECTO];
        const temasNivel = versionData[nivel] || versionData['A1'] || [];
        return temasNivel.length;
    }

    // ============================================================
    // OBTENER O CREAR TEMA PREDEFINIDO POR IDIOMA
    // ============================================================

    async _obtenerOCrearTemaPredefinidoPorIdioma(temaId, idioma) {
        console.log(`🔍 Buscando/creando tema ${temaId} para idioma: ${idioma}`);
        
        const temaExistente = await this._obtenerTemaPredefinidoPorIdioma(temaId, idioma);
        if (temaExistente) {
            console.log(`📂 Tema "${temaExistente.nombre}" ya existe en ${idioma} (ID: ${temaExistente.id})`);
            return temaExistente;
        }

        console.log(`📝 Creando tema "${temaId}" como plantilla en ${idioma}...`);
        const temaCreado = await this._guardarTemaPredefinidoComoPlantilla(temaId, idioma);
        if (temaCreado) {
            if (!this._temaPredefinidoIdMap[idioma]) {
                this._temaPredefinidoIdMap[idioma] = {};
            }
            this._temaPredefinidoIdMap[idioma][temaId] = temaCreado.id;
            console.log(`✅ Tema "${temaCreado.nombre}" creado como PLANTILLA en ${idioma} (ID: ${temaCreado.id})`);
        }
        return temaCreado;
    }

    // ============================================================
    // MÉTODOS DE NIVEL
    // ============================================================

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

    // ============================================================
    // OBTENER PROGRESO DE UN NIVEL EN UN IDIOMA
    // ============================================================

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
console.log('✅ UITemas Core v4.1 - CORREGIDO Y FUNCIONAL');
console.log('  🔥 TODAS las funciones existen y están implementadas');
console.log('  🔥 NO se usa Groq para generar contenido de temas');
console.log('  🔥 Solo plantillas JSON vacías');