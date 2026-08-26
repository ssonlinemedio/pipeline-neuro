// ============================================================
// UI TEMAS CORE v4.13.1 - CON VERIFICACIÓN EN TIEMPO REAL Y CATCH CORREGIDO
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
        this._pestanaActiva = 'todos';

        this.NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        this.EMOJIS_NIVEL = { 'A1': '🌱', 'A2': '🌿', 'B1': '🌳', 'B2': '🌲', 'C1': '🏔️', 'C2': '🗻' };
        this.COLORES_NIVEL = { 'A1': '#6C5CE7', 'A2': '#0984E3', 'B1': '#00B894', 'B2': '#FDCB6E', 'C1': '#E17055', 'C2': '#FD79A8' };
        this.MAX_HISTORIAS = 10;
        this.MAX_FRASES_POR_HISTORIA = 10;
        this.IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        this.FAMILIAS_SEMANTICAS = ['Transporte', 'Comida y Bebida', 'Familia', 'Casa y Hogar', 'Ropa', 'Animales', 'Naturaleza', 'Tiempo y Clima', 'Salud', 'Trabajo', 'Educación', 'Deportes', 'Arte', 'Música', 'Tecnología', 'Viajes', 'Compras', 'Comunicación', 'Emociones', 'Rutina', 'Ciudad', 'Cultura', 'Historia', 'Ciencia'];
        
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
        
        this._configurarListenerSincronizacion();
        this._configurarListenerEstadoHistorias();
        this._configurarListenerProgresoTema();
    }

    // ============================================================
    // LISTENER PARA PROGRESO DE TEMA
    // ============================================================

    _configurarListenerProgresoTema() {
        window.addEventListener('progresoTemaActualizado', async (e) => {
            const detail = e.detail;
            if (!detail) return;
            
            console.log(`📊 Progreso del tema actualizado: ${detail.temaNombre} -> ${detail.progreso}%`);
            
            if (detail.completado !== undefined) {
                const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
                const key = `${idioma}_${detail.temaId}`;
                this._temaCompletadoCache[key] = detail.completado;
            }
            
            if (this.modoVistaTemas === 'detalle' && this.temaSeleccionado === detail.temaId) {
                await this._verTemaDetalle(detail.temaId);
            }
        });
    }

    // ============================================================
    // CONFIGURAR LISTENER PARA SINCRONIZACIÓN
    // ============================================================

    _configurarListenerSincronizacion() {
        window.addEventListener('temaCompletado', async (e) => {
            const detail = e.detail;
            if (!detail) return;
            
            console.log(`🔄 Sincronizando estado de tema: ${detail.temaId} (${detail.idioma}) → ${detail.completado}`);
            
            const key = `${detail.idioma}_${detail.temaId}`;
            this._temaCompletadoCache[key] = detail.completado;
            
            if (!this._temasCompletadosPorIdioma[detail.idioma]) {
                this._temasCompletadosPorIdioma[detail.idioma] = {};
            }
            this._temasCompletadosPorIdioma[detail.idioma][detail.temaId] = detail.completado;
            
            await this._actualizarDesbloqueos(detail.idioma);
            
            await this._forzarActualizacionCompleta(detail.temaDbId || detail.temaId);
        });
        
        window.addEventListener('historiaCompletada', async (e) => {
            const detail = e.detail;
            if (!detail) return;
            
            console.log(`🔄 Historia completada: ${detail.historiaTitulo} (${detail.temaId})`);
            
            if (detail.temaId) {
                await this._verificarYActualizarEstadoTema(detail.temaId);
            }
            
            if (this.modoVistaTemas === 'lista') {
                await this._renderTemas();
            } else if (this.modoVistaTemas === 'detalle' && this.temaSeleccionado) {
                const temaId = detail.temaId || detail.temaOriginalId;
                if (temaId === this.temaSeleccionado || detail.temaOriginalId === this.temaSeleccionado) {
                    await this._verTemaDetalle(this.temaSeleccionado);
                } else {
                    await this._renderTemas();
                }
            }
            
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this._core);
            }
        });
        
        window.addEventListener('elipseNuevaOndaGenerada', async (e) => {
            const temaId = e.detail?.temaId;
            if (!temaId) return;
            
            console.log(`🌌 Nueva onda generada/importada para tema ${temaId}`);
            
            try {
                const tema = await db.obtenerTema(temaId);
                if (!tema) {
                    console.warn(`⚠️ Tema ${temaId} no encontrado`);
                    return;
                }
                
                await this._verificarYActualizarEstadoTema(temaId);
                await this._forzarActualizacionCompleta(temaId);
                
            } catch (error) {
                console.error('❌ Error procesando nueva onda:', error);
            }
        });
        
        console.log('🔗 Listener de sincronización de temas configurado');
    }

    // ============================================================
    // CONFIGURAR LISTENER PARA ESTADO DE HISTORIAS
    // ============================================================

    _configurarListenerEstadoHistorias() {
        window.addEventListener('historiaEstadoCambiado', async (e) => {
            console.log('🔄 UITemasCore: Estado de historia cambiado', e.detail);
            
            if (e.detail?.tipo === 'historia' || e.detail?.tipo === 'onda_elipse' || e.detail?.tipo === 'onda_cruzada') {
                const historiaId = e.detail.historiaId;
                const historia = await db.get('historias', historiaId);
                if (historia && historia.temaId) {
                    await this._verificarYActualizarEstadoTema(historia.temaId);
                }
            }
            
            if (e.detail?.temaId) {
                await this._forzarActualizacionCompleta(e.detail.temaId);
            } else if (this.temaSeleccionado) {
                await this._forzarActualizacionCompleta(this.temaSeleccionado);
            } else {
                if (this.modoVistaTemas === 'lista') {
                    await this._renderTemas();
                }
            }
            
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this._core);
            }
        });
    }

    // ============================================================
    // FORZAR ACTUALIZACIÓN COMPLETA
    // ============================================================

    async _forzarActualizacionCompleta(temaId) {
        console.log(`🔥 Forzando actualización completa para tema ${temaId}`);
        
        try {
            await this._verificarYActualizarEstadoTema(temaId);
            
            if (this.modoVistaTemas === 'detalle' && this.temaSeleccionado) {
                await this._verTemaDetalle(this.temaSeleccionado);
            } else {
                await this._renderTemas();
            }
            
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this._core);
            }
            
            if (window.UIClipse) {
                try {
                    window.UIClipse._renderizarPanel(temaId);
                } catch (e) {}
            }
            
            if (window.UIOndasCruzadas) {
                try {
                    await window.UIOndasCruzadas._cargarDatos();
                    await window.UIOndasCruzadas._renderizarPanel();
                } catch (e) {}
            }
            
            console.log(`✅ Actualización completa finalizada`);
        } catch (error) {
            console.error(`❌ Error en _forzarActualizacionCompleta:`, error);
        }
    }

    // ============================================================
    // VERIFICAR Y ACTUALIZAR ESTADO DEL TEMA
    // ============================================================

    async _verificarYActualizarEstadoTema(temaId) {
        try {
            const tema = await db.obtenerTema(temaId);
            if (!tema) return null;
            
            const historias = await db.obtenerHistoriasPorTema(temaId);
            if (historias.length === 0) return null;
            
            let completadas = 0;
            for (const h of historias) {
                if (h.estado === 'completada' || h._completada === true) {
                    completadas++;
                }
            }
            
            const total = historias.length;
            const progreso = total > 0 ? Math.round((completadas / total) * 100) : 0;
            
            tema._progreso = progreso;
            tema._historiasCompletadas = completadas;
            tema._historiasTotales = total;
            
            const estadoAnterior = tema.estado === 'completado' || tema._completado === true;
            const todasCompletadas = completadas === total && total > 0;
            
            if (todasCompletadas && !estadoAnterior) {
                tema.estado = 'completado';
                tema._completado = true;
                tema._fechaCompletado = Date.now();
                await db.update('temas', tema);
                
                console.log(`🎯 Tema "${tema.nombre}" marcado como completado (${completadas}/${total})`);
                
                const idioma = tema.idioma || 'es';
                const temaOriginalId = tema._temaOriginalId || tema.id;
                window.dispatchEvent(new CustomEvent('temaCompletado', {
                    detail: {
                        idioma: idioma,
                        temaId: temaOriginalId,
                        temaDbId: tema.id,
                        completado: true,
                        tema: tema,
                        origen: 'checkbox_sync',
                        progreso: progreso
                    }
                }));
                
                if (this._core) {
                    this._core.mostrarToast(`🎉 Tema "${tema.nombre}" completado al 100%`, 'success');
                }
            } else if (!todasCompletadas && estadoAnterior) {
                tema.estado = 'en_curso';
                tema._completado = false;
                delete tema._fechaCompletado;
                await db.update('temas', tema);
                
                console.log(`🔄 Tema "${tema.nombre}" reabierto (${completadas}/${total})`);
                
                const idioma = tema.idioma || 'es';
                const temaOriginalId = tema._temaOriginalId || tema.id;
                window.dispatchEvent(new CustomEvent('temaCompletado', {
                    detail: {
                        idioma: idioma,
                        temaId: temaOriginalId,
                        temaDbId: tema.id,
                        completado: false,
                        tema: tema,
                        origen: 'checkbox_sync',
                        progreso: progreso
                    }
                }));
            } else {
                await db.update('temas', tema);
                console.log(`📊 Progreso del tema "${tema.nombre}" actualizado: ${progreso}% (${completadas}/${total})`);
            }
            
            window.dispatchEvent(new CustomEvent('progresoTemaActualizado', {
                detail: {
                    temaId: tema.id,
                    temaNombre: tema.nombre,
                    progreso: progreso,
                    completadas: completadas,
                    total: total,
                    completado: todasCompletadas
                }
            }));
            
            return { completadas, total, progreso, completado: todasCompletadas };
        } catch (error) {
            console.error('❌ Error verificando estado del tema:', error);
            return null;
        }
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
                    <button class="btn-secondary" onclick="window.UITemas._sincronizarTodosLosTemas()" 
                            style="padding:10px 20px;background:var(--warning);color:var(--dark);border:none;border-radius:8px;cursor:pointer;">
                        <i class="fas fa-sync-alt"></i> Sincronizar Todos
                    </button>
                    <button class="btn-secondary" onclick="window.UITemas._forzarActualizacionCompleta(window.UITemas.temaSeleccionado)" 
                            style="padding:10px 20px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;">
                        <i class="fas fa-bolt"></i> Forzar Sincronización
                    </button>
                </div>
            `;
            container.insertAdjacentHTML('beforebegin', actionsHTML);
        }

        this._renderTemas();
    }

    // ============================================================
    // SINCRONIZAR TODOS LOS TEMAS
    // ============================================================

    async _sincronizarTodosLosTemas() {
        console.log('🔄 Sincronizando todos los temas...');
        try {
            const temas = await db.obtenerTemas();
            let sincronizados = 0;
            for (const tema of temas) {
                try {
                    await this._verificarYActualizarEstadoTema(tema.id);
                    sincronizados++;
                } catch (e) {
                    console.warn(`⚠️ Error sincronizando tema ${tema.id}:`, e);
                }
            }
            if (this._core) {
                this._core.mostrarToast(`✅ ${sincronizados} temas sincronizados`, 'success');
            }
            await this._renderTemas();
        } catch (error) {
            console.error('❌ Error en _sincronizarTodosLosTemas:', error);
            if (this._core) {
                this._core.mostrarToast('❌ Error sincronizando temas', 'error');
            }
        }
    }

    // ============================================================
    // MARCAR TEMA COMPLETADO CON CASCADA Y SINCRONIZACIÓN FORZADA
    // ============================================================

    async _marcarTemaCompletado(idioma, temaId, completado) {
        const key = `${idioma}_${temaId}`;
        console.log(`📌 Marcando tema ${temaId} (${idioma}) como ${completado ? 'completado' : 'no completado'}`);

        try {
            let temaEncontrado = null;
            let temaIdReal = temaId;
            let esTemaPredefinido = false;
            let temaDbId = null;

            const todosLosTemas = await db.obtenerTemasPorIdioma(idioma);
            const idNum = parseInt(temaId);
            if (!isNaN(idNum) && idNum > 0) {
                temaEncontrado = todosLosTemas.find(t => t.id === idNum);
                if (temaEncontrado) {
                    temaIdReal = idNum;
                    esTemaPredefinido = temaEncontrado._esPredefinido === true;
                    temaDbId = temaEncontrado.id;
                    console.log(`📂 Tema encontrado por ID: "${temaEncontrado.nombre}" (${esTemaPredefinido ? 'predefinido' : 'manual'})`);
                }
            }

            if (!temaEncontrado) {
                temaEncontrado = todosLosTemas.find(t => t._temaOriginalId === temaId);
                if (temaEncontrado) {
                    esTemaPredefinido = true;
                    temaDbId = temaEncontrado.id;
                    console.log(`📂 Tema encontrado por _temaOriginalId: "${temaEncontrado.nombre}"`);
                }
            }

            if (!temaEncontrado) {
                console.warn(`⚠️ Tema ${temaId} no encontrado en ${idioma}`);
                return;
            }

            // 🔥 USAR GESTOR DE PROGRESO PARA SINCRONIZACIÓN COMPLETA
            if (window.gestorProgresoHistorias) {
                console.log(`🌊 Usando GestorProgresoHistorias para sincronización completa`);
                await window.gestorProgresoHistorias._sincronizarTemaCompleto(temaDbId, completado);
            } else {
                // FALLBACK: sincronización manual
                console.log(`⚠️ GestorProgresoHistorias no disponible, usando fallback`);
                
                temaEncontrado.estado = completado ? 'completado' : 'en_curso';
                temaEncontrado._completado = completado;
                if (completado) {
                    temaEncontrado._fechaCompletado = Date.now();
                } else {
                    delete temaEncontrado._fechaCompletado;
                }

                if (completado) {
                    console.log(`🌊 Marcando todas las historias del tema "${temaEncontrado.nombre}" como completadas...`);
                    const historias = await db.obtenerHistoriasPorTema(temaDbId);
                    for (const h of historias) {
                        if (!(h.estado === 'completada' || h._completada === true)) {
                            h.estado = 'completada';
                            h._completada = true;
                            h._fechaCompletado = Date.now();
                            await db.update('historias', h);
                        }
                    }
                }

                await db.update('temas', temaEncontrado);
                console.log(`📌 Tema "${temaEncontrado.nombre}" (${idioma}) marcado como ${completado ? 'completado' : 'en curso'}`);
            }

            // Actualizar cache
            this._temaCompletadoCache[key] = completado;
            if (!this._temasCompletadosPorIdioma[idioma]) {
                this._temasCompletadosPorIdioma[idioma] = {};
            }
            this._temasCompletadosPorIdioma[idioma][temaId] = completado;

            // Actualizar desbloqueos
            await this._actualizarDesbloqueos(idioma);

            // Disparar evento
            window.dispatchEvent(new CustomEvent('temaCompletado', {
                detail: {
                    idioma,
                    temaId: temaId,
                    temaDbId: temaDbId,
                    completado,
                    tema: temaEncontrado,
                    key: key,
                    esPredefinido: esTemaPredefinido,
                    origen: 'manual'
                }
            }));

            // Mostrar toast
            if (this._core) {
                this._core.mostrarToast(
                    completado ? `✅ "${temaEncontrado.nombre}" completado (${idioma})` : `↩️ "${temaEncontrado.nombre}" marcado como no completado (${idioma})`,
                    completado ? 'success' : 'info'
                );
            }

            // FORZAR ACTUALIZACIÓN COMPLETA
            await this._forzarActualizacionCompleta(temaDbId);

        } catch (error) {
            console.error(`❌ Error en _marcarTemaCompletado:`, error);
            if (this._core) {
                this._core.mostrarToast(`❌ Error: ${error.message}`, 'error');
            }
        }
    }

    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================

    _getContainer() {
        if (!this._container) {
            this._container = document.getElementById('temasContent');
        }
        return this._container;
    }

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
        } catch (e) {
            console.warn('⚠️ Error cargando mapa de temas predefinidos:', e);
        }
    }

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

    async _obtenerOCrearTemaPredefinidoPorIdioma(temaId, idioma) {
        const temaExistente = await this._obtenerTemaPredefinidoPorIdioma(temaId, idioma);
        if (temaExistente) {
            return temaExistente;
        }

        return await this._guardarTemaPredefinidoComoPlantilla(temaId, idioma);
    }

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
                _tieneContenidoReal: false,
                _completado: false,
                _esManual: false
            };

            const idGuardado = await db.guardarTema(nuevoTema);
            
            if (idGuardado) {
                if (!this._temaPredefinidoIdMap[idioma]) {
                    this._temaPredefinidoIdMap[idioma] = {};
                }
                this._temaPredefinidoIdMap[idioma][temaId] = idGuardado;
                const temaCompleto = await db.obtenerTema(idGuardado);
                return temaCompleto;
            }
            return null;

        } catch (error) {
            console.error(`❌ Error guardando plantilla:`, error);
            return null;
        }
    }

    async _nivelEstaDesbloqueado(idioma, nivel) {
        const usuario = await db.getUsuario();
        const infoIdioma = usuario?.idiomasObjetivo?.find(i => i.idioma === idioma);
        const nivelActual = infoIdioma?.nivel || 'A1';
        
        const idxNivel = this.NIVELES.indexOf(nivel);
        const idxActual = this.NIVELES.indexOf(nivelActual);
        
        if (idxNivel <= idxActual) {
            return true;
        }
        
        const key = `${idioma}_nivel_${nivel}`;
        const desbloqueados = JSON.parse(localStorage.getItem('pipeline_niveles_desbloqueados') || '{}');
        if (desbloqueados[key]) {
            return true;
        }
        
        return false;
    }

    async _nivelEstaCompletado(idioma, nivel) {
        const progreso = await this._obtenerProgresoNivel(idioma, nivel);
        return progreso.porcentaje >= 100 && progreso.total > 0;
    }

    async _actualizarDesbloqueos(idioma) {
        for (let i = 0; i < this.NIVELES.length; i++) {
            const nivel = this.NIVELES[i];
            const estaCompletado = await this._nivelEstaCompletado(idioma, nivel);
            
            if (estaCompletado && i < this.NIVELES.length - 1) {
                await this._desbloquearSiguienteNivel(idioma);
            }
        }
    }

    async _desbloquearSiguienteNivel(idioma) {
        const usuario = await db.getUsuario();
        const infoIdioma = usuario?.idiomasObjetivo?.find(i => i.idioma === idioma);
        const nivelActual = infoIdioma?.nivel || 'A1';
        
        const idxActual = this.NIVELES.indexOf(nivelActual);
        if (idxActual >= this.NIVELES.length - 1) {
            return;
        }
        
        const siguienteNivel = this.NIVELES[idxActual + 1];
        const key = `${idioma}_nivel_${siguienteNivel}`;
        const desbloqueados = JSON.parse(localStorage.getItem('pipeline_niveles_desbloqueados') || '{}');
        
        if (!desbloqueados[key]) {
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
    // NAVEGACIÓN Y ACCIONES
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

    async _abrirCreadorHistoria(temaId) {
        return window.UITemasActions.abrirCreadorHistoria(temaId);
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

console.log('✅ UITemas Core v4.13.1 - CON VERIFICACIÓN EN TIEMPO REAL Y CATCH CORREGIDO');
console.log('  🔥 Verificación en tiempo real del progreso');
console.log('  🔥 Forzar actualización completa de UI');
console.log('  🔥 Cascada completa con GestorProgresoHistorias');
console.log('  🔥 Sincronización con Elipse y Ondas Cruzadas');
console.log('  🔥 Botón "Forzar Sincronización" para casos extremos');
console.log('  🔥 Todos los try/catch correctamente cerrados');