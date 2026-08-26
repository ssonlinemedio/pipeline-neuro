// ============================================================
// TUTOR NEURO V8.5 - REFRESCO AUTOMÁTICO OBLIGATORIO + FORZAR ANÁLISIS AL ENTRAR
// TUTOR ESPACIAL PARA IDIOMAS JEROGLÍFICOS (CHINO, JAPONÉS, COREANO)
// HEREDADO DE VIGIA + CENTINELA PARA PODER DE GUÍA TOTAL
// ============================================================

class TutorNeuro extends Vigia {
    constructor() {
        super();
        this._nombre = '🧠 Tutor de Aprendizaje NeuroAdaptativo V8.5';
        this._icono = '🧠';
        this._tutorInitDone = false;
        this._ultimaIntervencion = 0;
        this._intervaloMinimoIntervencion = 15000;
        this._intervencionesPendientes = [];
        this._historialIntervenciones = [];
        
        // ============================================================
        // VARIABLES PARA PAGINACIÓN Y BÚSQUEDA EN RUTA
        // ============================================================
        this._pasosPorPagina = 10;
        this._paginaActualRuta = 1;
        this._rutaFiltrada = [];
        this._busquedaRuta = '';
        this._modalRutaAbierto = false;
        
        // ============================================================
        // MODOS DEL TUTOR
        // ============================================================
        this._MODOS = {
            GUIADO: 'guiado',
            FLEXIBLE: 'flexible',
            LIBRE: 'libre',
            ESPACIAL: 'espacial'
        };
        
        this._modoActual = this._MODOS.FLEXIBLE;
        
        // ============================================================
        // CONFIGURACIÓN - V8.5 CON REFRESCO AUTOMÁTICO OBLIGATORIO
        // ============================================================
        this._configuracion = {
            intervencionAuto: true,
            nivelInvasividad: 'bajo',
            mostrarEnPanel: true,
            mostrarNotificaciones: true,
            usarGroqParaAnalisis: true,
            maxIntervencionesPorSesion: 10,
            tiempoEntreIntervenciones: 20,
            modo: this._MODOS.FLEXIBLE,
            mapaAprendizaje: {
                activo: true,
                recomendarSiempre: true,
                priorizarTemasPendientes: true,
                maxTemasEnRuta: 10,
                recalcularCada: 5
            },
            modoConfig: {
                guiado: {
                    permitirIgnorar: false,
                    permitirPosponer: false,
                    forzarEstudio: true,
                    mostrarJustificacion: true,
                    bloqueoNavegacion: true
                },
                flexible: {
                    permitirIgnorar: true,
                    permitirPosponer: true,
                    forzarEstudio: false,
                    mostrarJustificacion: true,
                    bloqueoNavegacion: false
                },
                libre: {
                    permitirIgnorar: true,
                    permitirPosponer: true,
                    forzarEstudio: false,
                    mostrarJustificacion: false,
                    bloqueoNavegacion: false
                },
                espacial: {
                    permitirIgnorar: true,
                    permitirPosponer: true,
                    forzarEstudio: false,
                    mostrarJustificacion: true,
                    bloqueoNavegacion: false,
                    modoJeroglifico: true,
                    priorizarCaracteres: true,
                    priorizarTonos: true,
                    modoRadicales: true
                }
            },
            guiaProactiva: {
                activa: true,
                nivelProactividad: 'alto',
                recomendarCada: 5,
                forzarRecomendacion: true,
                priorizarModuloMasAtrasado: true,
                sugerirDescansoCada: 30,
                recordarRacha: true,
                alertaEstancamiento: true,
                umbralEstancamiento: 3
            },
            microObjetivos: {
                activo: true,
                maxObjetivosSimultaneos: 3,
                generarCada: 10,
                priorizarDebilidades: true
            },
            espacial: {
                activo: false,
                idiomaJeroglifico: false,
                sistemaRadicales: {
                    activo: true,
                    niveles: ['básico', 'intermedio', 'avanzado'],
                    radicalesPorNivel: {
                        básico: ['人', '口', '日', '月', '木', '水', '火', '土', '金', '心'],
                        intermedio: ['言', '走', '食', '見', '門', '馬', '魚', '鳥', '虫', '龍'],
                        avanzado: ['鬱', '麗', '靈', '鐵', '鐘', '鑑', '鷹', '鷲', '鱗', '龜']
                    }
                },
                sistemaTrazo: {
                    activo: true,
                    ordenTrazo: true,
                    mostrarAnimacion: true,
                    tiposTrazo: ['horizontal', 'vertical', 'curva', 'gancho', 'punto']
                },
                sistemaMnemotecnia: {
                    activo: true,
                    usarHistorias: true,
                    usarImagenes: true,
                    usarEtimologia: true
                },
                sistemaComposicion: {
                    activo: true,
                    descomponerCaracteres: true,
                    mostrarRadicales: true,
                    mostrarComponentes: true
                }
            }
        };
        
        this._contadorIntervencionesSesion = 0;
        this._panelVisible = false;
        this._callbackPanel = null;
        this._eventosRegistrados = false;
        this._sesionActiva = false;
        this._inicioSesion = Date.now();
        this._ultimaActividad = Date.now();
        this._contadorFrases = 0;
        this._temaForzado = null;
        this._navegacionBloqueada = false;
        this._originalIrAModulo = null;
        this._originalEstudiarTema = null;
        this._originalCambiarModoEstudio = null;
        this._core = window.uiCore || null;
        
        // ============================================================
        // MAPA DE APRENDIZAJE
        // ============================================================
        this._mapaAprendizaje = {
            rutaActual: [],
            temasProcesados: [],
            temasRecomendados: [],
            dependencias: {},
            nivelActual: 'A1',
            progresoGeneral: 0,
            ultimaRecalculacion: 0,
            hitosCompletados: [],
            misionesActivas: [],
            temasBloqueados: [],
            microObjetivos: [],
            objetivoActual: null,
            misionesCompletadas: [],
            rachaDiaria: 0,
            ultimoEstudio: null,
            diasConsecutivos: 0,
            logros: [],
            logrosDesbloqueados: [],
            puntosExperiencia: 0,
            nivelTutor: 1,
            experienciaParaSiguienteNivel: 100,
            estadisticasAvanzadas: {
                porModulo: {},
                porNivel: {},
                tendenciaSemanal: [],
                velocidadAprendizaje: 0,
                tiempoPromedioPorSesion: 0,
                sesionesTotales: 0,
                modulosMasUsados: [],
                horasEstudio: 0,
                retencionPromedio: 0,
                consistenciaDiaria: 0,
                eficienciaGlobal: 0,
                picosAprendizaje: [],
                zonasMejora: [],
                patronesEstudio: {
                    horarioOptimo: null,
                    duracionOptima: 0,
                    diasMasProductivos: []
                }
            },
            espacial: {
                caracteresAprendidos: [],
                radicalesConocidos: [],
                trazosPracticados: [],
                composicionesEstudiadas: [],
                historiasMnemotecnicas: [],
                nivelRadical: 'básico',
                caracteresDominados: 0,
                caracteresEnProgreso: 0,
                caracteresPendientes: 0,
                progresoEscritura: 0,
                progresoLectura: 0
            }
        };
        
        // ============================================================
        // CONTEXTO ENRIQUECIDO DEL USUARIO - V8.5 CON ESPACIAL
        // ============================================================
        this._contextoUsuario = {
            nivel: 'A1',
            idioma: 'es',
            idiomaNativo: 'español',
            nombre: 'Usuario',
            racha: 0,
            neuroScore: 0,
            eficiencia: 0,
            faseActual: 1,
            frasesCompletadas: 0,
            totalFrases: 0,
            tiempoEstudioHoy: 0,
            tiempoEstudioTotal: 0,
            sesionesHoy: 0,
            temas: {
                total: 0,
                completados: 0,
                enProgreso: 0,
                pendientes: 0,
                sinIniciar: 0,
                siguienteTema: null,
                ultimoTema: null,
                temaRecomendado: null,
                progresoPromedio: 0,
                temasPorNivel: {},
                ultimoTemaEstudiado: null,
                fechaUltimoTema: null,
                temasEstancados: [],
                temasRecomendadosPrioridad: []
            },
            elipse: {
                activa: false,
                totalOndas: 0,
                ondasCompletadas: 0,
                ondasPendientes: 0,
                ondasEnCurso: 0,
                siguienteOnda: null,
                progreso: 0,
                ultimaOndaGenerada: null,
                fechaUltimaOnda: null,
                ondasPorNivel: {},
                palabrasNuevasTotales: 0,
                palabrasConsolidadas: 0,
                ondasRecomendadas: [],
                necesitaNuevaOnda: false
            },
            ondasCruzadas: {
                grafoSize: 0,
                ondasTotales: 0,
                interferencias: 0,
                temasConectados: [],
                conexionesFuertes: 0,
                conexionesDebiles: 0,
                ultimaOndaCruzada: null,
                fechaUltimaOndaCruzada: null,
                ondasCruzadasPendientes: 0,
                recomendarOndaCruzada: false
            },
            caracteres: {
                totalCaracteres: 0,
                caracteresEstudiados: 0,
                caracteresDominados: 0,
                caracteresEnProgreso: 0,
                caracteresNuevos: 0,
                siguienteCaracter: null,
                familiasEstudiadas: [],
                progresoPorFamilia: {},
                caracteresRecomendados: [],
                necesitaPracticarCaracteres: false,
                radicalesAprendidos: [],
                trazosPracticados: 0,
                composiciones: [],
                historiasMnemotecnicas: [],
                nivelRadical: 'básico'
            },
            tonos: {
                totalHistorias: 0,
                historiasLeidas: 0,
                historiasGuardadas: 0,
                historiasCompletadas: 0,
                caracterActual: null,
                tieneHistoriasPendientes: false,
                tonosPracticados: [],
                progresoTonos: 0,
                necesitaPracticarTonos: false,
                ultimaHistoriaTonal: null
            },
            pipeline: {
                frasesTotales: 0,
                frasesCompletadas: 0,
                frasesEnCurso: 0,
                frasesNuevas: 0,
                progreso: 0,
                rcnPromedio: 0,
                fasePromedio: 0,
                eficiencia: 0,
                palabrasAprendidas: 0,
                palabrasPendientes: 0,
                necesitaRepaso: false,
                frasesDebiles: [],
                frasesFuertes: []
            },
            biblioteca: {
                totalHistorias: 0,
                leidas: 0,
                completadas: 0,
                enCurso: 0,
                porTema: {},
                progresoLectura: 0,
                favoritas: 0,
                tiempoLectura: 0,
                ultimaLectura: null,
                generosPreferidos: [],
                recomendaciones: []
            },
            historialEstudio: [],
            ultimoModuloVisitado: null,
            modulosVisitados: {},
            patronesEstudio: {
                horarioPreferido: null,
                duracionPromedio: 0,
                modulosMasUsados: [],
                diasActivos: 0,
                rachaActual: 0,
                rachaMaxima: 0
            },
            estadoCognitivo: {
                fatiga: 0,
                motivacion: 0.8,
                concentracion: 0.7,
                confianza: 0.6,
                nivelEstrés: 0.2,
                ultimoCambio: Date.now()
            },
            analisisProgreso: {
                tendencia: 'estable',
                velocidadAprendizaje: 0,
                puntosFuertes: [],
                puntosDebiles: [],
                recomendacionPrincipal: '',
                urgencia: 'baja',
                siguienteHito: null,
                tiempoEstimadoSiguienteHito: 0
            }
        };
        
        // ============================================================
        // REGLAS DE INTERVENCIÓN - V8.5 CON REGLAS ESPACIALES
        // ============================================================
        this._reglasIntervencion = {};
        this._cacheUltimoAnalisis = {};
        this._tiempoCacheAnalisis = 60000;
        this._historialRespuestas = [];
        this._erroresRegistrados = [];
        this._analizando = false;
        this._analisisPendiente = false;
        this._ultimoAnalisis = 0;
        this._intervaloAnalisis = 30000;
        this._cacheTemas = {};
        this._ultimaCargaTemas = 0;
        this._tiempoCacheTemas = 60000;
        
        // ============================================================
        // SISTEMA DE LOGROS - V8.5 CON LOGROS ESPACIALES
        // ============================================================
        this._LOGROS = {
            'primer_estudio': { nombre: '🌟 Primer Estudio', desc: 'Completa tu primera sesión de estudio', puntos: 10 },
            'racha_3': { nombre: '🔥 Racha de 3', desc: 'Estudia 3 días seguidos', puntos: 25 },
            'racha_7': { nombre: '⚡ Racha de 7', desc: 'Estudia 7 días seguidos', puntos: 50 },
            'racha_30': { nombre: '👑 Racha de 30', desc: 'Estudia 30 días seguidos', puntos: 100 },
            '10_frases': { nombre: '📝 10 Frases', desc: 'Completa 10 frases', puntos: 15 },
            '50_frases': { nombre: '📚 50 Frases', desc: 'Completa 50 frases', puntos: 30 },
            '100_frases': { nombre: '📖 100 Frases', desc: 'Completa 100 frases', puntos: 50 },
            '500_frases': { nombre: '🏆 500 Frases', desc: 'Completa 500 frases', puntos: 100 },
            'tema_completado': { nombre: '🎯 Tema Completado', desc: 'Completa un tema completo', puntos: 20 },
            '3_temas': { nombre: '📚 3 Temas', desc: 'Completa 3 temas', puntos: 30 },
            '10_temas': { nombre: '🎓 10 Temas', desc: 'Completa 10 temas', puntos: 50 },
            'onda_elipse': { nombre: '🌌 Onda Elipse', desc: 'Genera tu primera onda en Modo Elipse', puntos: 15 },
            '5_ondas': { nombre: '🌊 5 Ondas', desc: 'Genera 5 ondas en Modo Elipse', puntos: 30 },
            'onda_cruzada': { nombre: '🔗 Onda Cruzada', desc: 'Genera tu primera onda cruzada', puntos: 20 },
            '5_cruzadas': { nombre: '🌊 5 Cruzadas', desc: 'Genera 5 ondas cruzadas', puntos: 40 },
            'caracter_estudiado': { nombre: '🀄 Carácter Estudiado', desc: 'Estudia tu primer carácter', puntos: 10 },
            '10_caracteres': { nombre: '📚 10 Caracteres', desc: 'Estudia 10 caracteres', puntos: 25 },
            'tono_practicado': { nombre: '🎵 Tono Practicado', desc: 'Practica tu primer tono', puntos: 10 },
            '5_tonos': { nombre: '🎶 5 Tonos', desc: 'Practica 5 tonos diferentes', puntos: 25 },
            'experto': { nombre: '🧠 Experto', desc: 'Alcanza el nivel C1 en cualquier idioma', puntos: 75 },
            'maestro': { nombre: '👑 Maestro', desc: 'Alcanza el nivel C2 en cualquier idioma', puntos: 100 },
            'biblioteca_10': { nombre: '📚 10 Lecturas', desc: 'Lee 10 historias en la Biblioteca', puntos: 20 },
            'biblioteca_50': { nombre: '📖 50 Lecturas', desc: 'Lee 50 historias en la Biblioteca', puntos: 50 },
            'biblioteca_completa': { nombre: '🏆 Biblioteca Completa', desc: 'Lee todas las historias de la Biblioteca', puntos: 100 },
            'micro_objetivo': { nombre: '🎯 Micro-Objetivo', desc: 'Completa tu primer micro-objetivo', puntos: 10 },
            '10_micro_objetivos': { nombre: '🎯 10 Micro-Objetivos', desc: 'Completa 10 micro-objetivos', puntos: 30 },
            'aprendizaje_acelerado': { nombre: '⚡ Aprendizaje Acelerado', desc: 'Completa 50 frases en una semana', puntos: 50 },
            'explorador': { nombre: '🧭 Explorador', desc: 'Visita todos los módulos del sistema', puntos: 40 },
            'consistencia_oro': { nombre: '🏅 Consistencia de Oro', desc: 'Estudia 7 días seguidos con al menos 30 min', puntos: 60 },
            'maestro_de_elipse': { nombre: '🌌 Maestro de Elipse', desc: 'Genera 10 ondas en Modo Elipse', puntos: 50 },
            'lector_avido': { nombre: '📚 Lector Ávido', desc: 'Lee 25 historias en la Biblioteca', puntos: 35 },
            'primer_caracter': { nombre: '🀄 Primer Carácter', desc: 'Estudia tu primer carácter en el modo espacial', puntos: 15 },
            '10_caracteres_espacial': { nombre: '📚 10 Caracteres Espaciales', desc: 'Estudia 10 caracteres en el modo espacial', puntos: 30 },
            '50_caracteres_espacial': { nombre: '📖 50 Caracteres Espaciales', desc: 'Estudia 50 caracteres en el modo espacial', puntos: 60 },
            '100_caracteres_espacial': { nombre: '🏆 100 Caracteres Espaciales', desc: 'Estudia 100 caracteres en el modo espacial', puntos: 100 },
            'maestro_radicales': { nombre: '🌀 Maestro de Radicales', desc: 'Aprende 20 radicales básicos', puntos: 40 },
            'explorador_espacial': { nombre: '🚀 Explorador Espacial', desc: 'Completa 10 misiones del modo espacial', puntos: 50 },
            'caligrafo': { nombre: '✍️ Calígrafo', desc: 'Practica 50 trazos de caracteres', puntos: 45 },
            'compositor': { nombre: '🧩 Compositor', desc: 'Descompón 20 caracteres en radicales', puntos: 35 },
            'mnemotecnico': { nombre: '🧠 Mnemotécnico', desc: 'Crea 10 historias para recordar caracteres', puntos: 40 },
            'lector_espacial': { nombre: '📚 Lector Espacial', desc: 'Lee 10 historias en el idioma jeroglífico', puntos: 30 }
        };
        
        // ============================================================
        // PALABRAS CLAVE POR NIVEL
        // ============================================================
        this._PALABRAS_CLAVE = {
            'A1': ['familia', 'casa', 'comida', 'agua', 'perro', 'gato', 'hola', 'adiós', 'gracias', 'por favor', 'sí', 'no', 'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos'],
            'A2': ['viaje', 'compras', 'salud', 'deporte', 'trabajo', 'música', 'teléfono', 'internet', 'naturaleza', 'reciclaje', 'tiempo', 'clima', 'ropa', 'color', 'talla'],
            'B1': ['relación', 'amistad', 'amor', 'educación', 'aprendizaje', 'prensa', 'televisión', 'turismo', 'patrimonio', 'tecnología', 'innovación', 'gastronomía', 'arte', 'historia'],
            'B2': ['política', 'sociedad', 'economía', 'ciencia', 'investigación', 'filosofía', 'psicología', 'globalización', 'desarrollo', 'sostenibilidad', 'literatura'],
            'C1': ['crítica', 'retórica', 'antropología', 'investigación', 'análisis', 'argumentación'],
            'C2': ['especialización', 'debate', 'oratoria', 'creación', 'literaria']
        };
        
        // ============================================================
        // RADICALES Y CARACTERES ESPACIALES
        // ============================================================
        this._RADICALES_ESPACIALES = {
            'básico': [
                { radical: '人', significado: 'persona', trazos: 2, ejemplos: ['你', '他', '们'] },
                { radical: '口', significado: 'boca', trazos: 3, ejemplos: ['吃', '喝', '说'] },
                { radical: '日', significado: 'sol', trazos: 4, ejemplos: ['时', '间', '早'] },
                { radical: '月', significado: 'luna', trazos: 4, ejemplos: ['期', '朋', '有'] },
                { radical: '木', significado: 'árbol', trazos: 4, ejemplos: ['林', '森', '材'] },
                { radical: '水', significado: 'agua', trazos: 4, ejemplos: ['海', '河', '湖'] },
                { radical: '火', significado: 'fuego', trazos: 4, ejemplos: ['烧', '烤', '灯'] },
                { radical: '土', significado: 'tierra', trazos: 3, ejemplos: ['地', '场', '块'] },
                { radical: '金', significado: 'metal/oro', trazos: 8, ejemplos: ['银', '钱', '针'] },
                { radical: '心', significado: 'corazón', trazos: 4, ejemplos: ['想', '思', '念'] }
            ],
            'intermedio': [
                { radical: '言', significado: 'palabra', trazos: 7, ejemplos: ['说', '话', '读'] },
                { radical: '走', significado: 'caminar', trazos: 7, ejemplos: ['起', '赶', '超'] },
                { radical: '食', significado: 'comer', trazos: 9, ejemplos: ['饭', '餐', '饮'] },
                { radical: '見', significado: 'ver', trazos: 7, ejemplos: ['观', '视', '觉'] },
                { radical: '門', significado: 'puerta', trazos: 8, ejemplos: ['开', '关', '问'] },
                { radical: '馬', significado: 'caballo', trazos: 10, ejemplos: ['骑', '驾', '验'] },
                { radical: '魚', significado: 'pez', trazos: 11, ejemplos: ['鲜', '渔', '鲤'] },
                { radical: '鳥', significado: 'pájaro', trazos: 11, ejemplos: ['鸡', '鸭', '鹅'] },
                { radical: '虫', significado: 'insecto', trazos: 6, ejemplos: ['蛇', '蚊', '蝶'] },
                { radical: '龍', significado: 'dragón', trazos: 16, ejemplos: ['袭', '龚'] }
            ],
            'avanzado': [
                { radical: '鬱', significado: 'frondoso', trazos: 29, ejemplos: [] },
                { radical: '麗', significado: 'hermoso', trazos: 19, ejemplos: ['郦'] },
                { radical: '靈', significado: 'espíritu', trazos: 24, ejemplos: [] },
                { radical: '鐵', significado: 'hierro', trazos: 21, ejemplos: ['鑛'] },
                { radical: '鐘', significado: 'campana', trazos: 20, ejemplos: ['鍾'] },
                { radical: '鑑', significado: 'espejo', trazos: 22, ejemplos: [] },
                { radical: '鷹', significado: 'águila', trazos: 24, ejemplos: [] },
                { radical: '鷲', significado: 'buitre', trazos: 23, ejemplos: [] },
                { radical: '鱗', significado: 'escama', trazos: 23, ejemplos: [] },
                { radical: '龜', significado: 'tortuga', trazos: 16, ejemplos: [] }
            ]
        };
        
        this._CARACTERES_ESPACIALES = {
            'A1': [
                { caracter: '人', significado: 'persona', pinyin: 'rén', trazos: 2, radical: '人' },
                { caracter: '口', significado: 'boca', pinyin: 'kǒu', trazos: 3, radical: '口' },
                { caracter: '日', significado: 'sol', pinyin: 'rì', trazos: 4, radical: '日' },
                { caracter: '月', significado: 'luna', pinyin: 'yuè', trazos: 4, radical: '月' },
                { caracter: '木', significado: 'árbol', pinyin: 'mù', trazos: 4, radical: '木' },
                { caracter: '水', significado: 'agua', pinyin: 'shuǐ', trazos: 4, radical: '水' },
                { caracter: '火', significado: 'fuego', pinyin: 'huǒ', trazos: 4, radical: '火' },
                { caracter: '土', significado: 'tierra', pinyin: 'tǔ', trazos: 3, radical: '土' }
            ],
            'A2': [
                { caracter: '你', significado: 'tú', pinyin: 'nǐ', trazos: 7, radical: '人' },
                { caracter: '好', significado: 'bueno', pinyin: 'hǎo', trazos: 6, radical: '女' },
                { caracter: '吃', significado: 'comer', pinyin: 'chī', trazos: 6, radical: '口' },
                { caracter: '喝', significado: 'beber', pinyin: 'hē', trazos: 12, radical: '口' },
                { caracter: '说', significado: 'decir', pinyin: 'shuō', trazos: 9, radical: '言' },
                { caracter: '家', significado: 'casa', pinyin: 'jiā', trazos: 10, radical: '宀' },
                { caracter: '学', significado: 'aprender', pinyin: 'xué', trazos: 8, radical: '子' },
                { caracter: '生', significado: 'vida', pinyin: 'shēng', trazos: 5, radical: '生' }
            ],
            'B1': [
                { caracter: '爱', significado: 'amor', pinyin: 'ài', trazos: 10, radical: '爫' },
                { caracter: '想', significado: 'pensar', pinyin: 'xiǎng', trazos: 13, radical: '心' },
                { caracter: '知', significado: 'saber', pinyin: 'zhī', trazos: 8, radical: '矢' },
                { caracter: '道', significado: 'camino', pinyin: 'dào', trazos: 12, radical: '辶' },
                { caracter: '理', significado: 'razón', pinyin: 'lǐ', trazos: 11, radical: '王' },
                { caracter: '解', significado: 'entender', pinyin: 'jiě', trazos: 13, radical: '角' }
            ]
        };
        
        this._INICIALIZANDO_TUTOR = false;
        this._inicializarReglas();
        this._inicializarSeguro();
        this._cargarConfiguracionPersistida();
        this._inicializarMicroObjetivos();
        this._inicializarModoEspacial();
        this._cargarEstadoDesdeLocalStorage();
        
        // REFERENCIA A CENTINELA (DOBLE HERENCIA)
        this._centinela = window.centinela || null;
        if (this._centinela) {
            console.log('🔗 TutorNeuro: Vinculado con Centinela para neuro-monitoreo');
        }
        
        // ============================================================
        // REFRESCO AUTOMÁTICO - V8.5 OBLIGATORIO
        // ============================================================
        this._intervaloRefresco = null;
        this._refrescoActivo = false;
        this._ultimoRefresco = 0;
        this._intervaloRefrescoMs = 5000; // 5 segundos (más rápido)
        this._refrescando = false;
        this._refrescosPendientes = 0;
        
        // ============================================================
        // FORZAR ANÁLISIS AL ENTRAR - FLAG
        // ============================================================
        this._forzarAnalisisPendiente = true;
        this._analisisInicialEjecutado = false;
        
        // ============================================================
        // EVENTOS PARA REFRESCO AUTOMÁTICO - TODOS LOS POSIBLES
        // ============================================================
        this._eventosRefresco = [
            'respuestaEstudio',
            'temaCompletado',
            'elipseOndaGenerada',
            'elipseOndaCompletada',
            'ondasCruzadasGenerada',
            'bibliotecaActualizada',
            'bibliotecaHistoriaLeida',
            'idiomaCambiado',
            'nivelIdiomaCambiado',
            'cambioFase',
            'sesionFinalizada',
            'caracterEstudiado',
            'radicalAprendido',
            'moduloCambiado',
            'favoritoActualizado',
            'tutorModoCambiado',
            'learningPathGenerado',
            'learningPathPasoCompletado',
            'learningPathCompletado',
            'dashboardCargado',
            'usuarioActualizado',
            'progresoActualizado',
            'statsActualizadas',
            'tutorNeuroInicializado',
            'appInitCompleta'
        ];
        
        // ============================================================
        // MÉTRICAS DE REFRESCO
        // ============================================================
        this._metricasRefresco = {
            totalRefrescos: 0,
            ultimoRefresco: null,
            promedioMs: 0,
            tiempoTotalMs: 0,
            refrescosPorEvento: {}
        };
        
        console.log('🧠 Tutor Neuro V8.5: Constructor ejecutado (REFRESCO AUTOMÁTICO OBLIGATORIO + FORZAR ANÁLISIS AL ENTRAR)');
    }

    // ============================================================
    // CARGAR ESTADO DESDE LOCALSTORAGE
    // ============================================================
    _cargarEstadoDesdeLocalStorage() {
        try {
            const estado = localStorage.getItem('tutorNeuro_estado_persistente');
            if (estado) {
                const data = JSON.parse(estado);
                if (data._forzarAnalisisPendiente !== undefined) {
                    this._forzarAnalisisPendiente = data._forzarAnalisisPendiente;
                }
                if (data._analisisInicialEjecutado !== undefined) {
                    this._analisisInicialEjecutado = data._analisisInicialEjecutado;
                }
                if (data._mapaAprendizaje) {
                    this._mapaAprendizaje = { ...this._mapaAprendizaje, ...data._mapaAprendizaje };
                }
                if (data._contextoUsuario) {
                    this._contextoUsuario = { ...this._contextoUsuario, ...data._contextoUsuario };
                }
                console.log('📌 Estado persistente cargado desde localStorage');
            }
        } catch (e) {
            console.warn('⚠️ Error cargando estado desde localStorage:', e);
        }
    }

    // ============================================================
    // GUARDAR ESTADO EN LOCALSTORAGE
    // ============================================================
    _guardarEstadoEnLocalStorage() {
        try {
            const data = {
                _forzarAnalisisPendiente: this._forzarAnalisisPendiente,
                _analisisInicialEjecutado: this._analisisInicialEjecutado,
                _mapaAprendizaje: this._mapaAprendizaje,
                _contextoUsuario: this._contextoUsuario,
                _ultimaActualizacion: Date.now()
            };
            localStorage.setItem('tutorNeuro_estado_persistente', JSON.stringify(data));
        } catch (e) {
            console.warn('⚠️ Error guardando estado en localStorage:', e);
        }
    }

    // ============================================================
    // INICIALIZAR MODO ESPACIAL - V8.5 CORREGIDO
    // ============================================================
    _inicializarModoEspacial() {
        try {
            if (!this._configuracion.modoConfig.espacial) {
                this._configuracion.modoConfig.espacial = {
                    permitirIgnorar: true,
                    permitirPosponer: true,
                    forzarEstudio: false,
                    mostrarJustificacion: true,
                    bloqueoNavegacion: false,
                    modoJeroglifico: true,
                    priorizarCaracteres: true,
                    priorizarTonos: true,
                    modoRadicales: true
                };
                console.log('🔥 modoConfig.espacial creado automáticamente');
            }
            
            if (!this._configuracion.espacial) {
                this._configuracion.espacial = {
                    activo: false,
                    idiomaJeroglifico: false,
                    sistemaRadicales: {
                        activo: true,
                        niveles: ['básico', 'intermedio', 'avanzado'],
                        radicalesPorNivel: {
                            básico: ['人', '口', '日', '月', '木', '水', '火', '土', '金', '心'],
                            intermedio: ['言', '走', '食', '見', '門', '馬', '魚', '鳥', '虫', '龍'],
                            avanzado: ['鬱', '麗', '靈', '鐵', '鐘', '鑑', '鷹', '鷲', '鱗', '龜']
                        }
                    },
                    sistemaTrazo: {
                        activo: true,
                        ordenTrazo: true,
                        mostrarAnimacion: true,
                        tiposTrazo: ['horizontal', 'vertical', 'curva', 'gancho', 'punto']
                    },
                    sistemaMnemotecnia: {
                        activo: true,
                        usarHistorias: true,
                        usarImagenes: true,
                        usarEtimologia: true
                    },
                    sistemaComposicion: {
                        activo: true,
                        descomponerCaracteres: true,
                        mostrarRadicales: true,
                        mostrarComponentes: true
                    }
                };
                console.log('🔥 this._configuracion.espacial creado automáticamente');
            }
            
            const idioma = this._obtenerIdiomaActual();
            const esJeroglifico = this._esJeroglifico(idioma);
            
            if (esJeroglifico) {
                this._configuracion.espacial.activo = true;
                this._configuracion.espacial.idiomaJeroglifico = true;
                this._configuracion.modoConfig.espacial.modoJeroglifico = true;
                console.log('🌌 Modo Espacial ACTIVADO para idioma jeroglífico');
            } else {
                this._configuracion.espacial.activo = false;
                this._configuracion.espacial.idiomaJeroglifico = false;
                this._configuracion.modoConfig.espacial.modoJeroglifico = false;
            }
            
            const espacialGuardado = localStorage.getItem('pipeline_espacial_progreso');
            if (espacialGuardado) {
                try {
                    const data = JSON.parse(espacialGuardado);
                    this._mapaAprendizaje.espacial = { ...this._mapaAprendizaje.espacial, ...data };
                    console.log('📌 Progreso espacial cargado');
                } catch (e) {
                    console.warn('⚠️ Error cargando progreso espacial:', e);
                }
            }
        } catch (e) {
            console.warn('⚠️ Error inicializando modo espacial:', e);
            if (!this._configuracion.espacial) {
                this._configuracion.espacial = { activo: false, idiomaJeroglifico: false };
            }
            if (!this._configuracion.modoConfig.espacial) {
                this._configuracion.modoConfig.espacial = {
                    permitirIgnorar: true,
                    permitirPosponer: true,
                    forzarEstudio: false,
                    mostrarJustificacion: true,
                    bloqueoNavegacion: false,
                    modoJeroglifico: false,
                    priorizarCaracteres: false,
                    priorizarTonos: false,
                    modoRadicales: false
                };
            }
        }
    }

    // ============================================================
    // INICIALIZAR MICRO-OBJETIVOS - V8.5 CORREGIDO
    // ============================================================
    _inicializarMicroObjetivos() {
        const objetivosGuardados = localStorage.getItem('pipeline_micro_objetivos');
        if (objetivosGuardados) {
            try {
                this._mapaAprendizaje.microObjetivos = JSON.parse(objetivosGuardados);
                console.log(`📌 Cargados ${this._mapaAprendizaje.microObjetivos.length} micro-objetivos`);
            } catch (e) {
                console.warn('⚠️ Error cargando micro-objetivos:', e);
                this._generarMicroObjetivosIniciales();
            }
        } else {
            this._generarMicroObjetivosIniciales();
        }
    }

    _generarMicroObjetivosIniciales() {
        const esJeroglifico = this._configuracion.espacial?.activo || this._esJeroglifico(this._obtenerIdiomaActual());
        const micros = [
            { id: 'micro_1', titulo: 'Completa 5 frases', descripcion: 'Estudia y completa 5 frases en el módulo de estudio', completado: false, recompensa: 5, tipo: 'frases', meta: 5, modulo: 'study' },
            { id: 'micro_2', titulo: 'Lee una historia', descripcion: 'Lee una historia completa en la Biblioteca', completado: false, recompensa: 5, tipo: 'lectura', meta: 1, modulo: 'biblioteca' },
            { id: 'micro_3', titulo: 'Estudia 10 minutos', descripcion: 'Dedica 10 minutos continuos al estudio', completado: false, recompensa: 3, tipo: 'tiempo', meta: 600, modulo: 'study' }
        ];
        
        if (esJeroglifico) {
            micros.push(
                { id: 'micro_4', titulo: 'Estudia un carácter', descripcion: 'Aprende un nuevo carácter en el modo espacial', completado: false, recompensa: 8, tipo: 'caracter', meta: 1, modulo: 'caracteres' },
                { id: 'micro_5', titulo: 'Practica un radical', descripcion: 'Aprende un radical básico y sus ejemplos', completado: false, recompensa: 10, tipo: 'radical', meta: 1, modulo: 'caracteres' }
            );
        }
        
        this._mapaAprendizaje.microObjetivos = micros;
        localStorage.setItem('pipeline_micro_objetivos', JSON.stringify(this._mapaAprendizaje.microObjetivos));
        console.log('📌 Micro-objetivos iniciales generados');
    }

    // ============================================================
    // CARGAR CONFIGURACIÓN PERSISTIDA
    // ============================================================
    _cargarConfiguracionPersistida() {
        try {
            const modoGuardado = localStorage.getItem('pipeline_tutor_modo');
            if (modoGuardado && Object.values(this._MODOS).includes(modoGuardado)) {
                this._modoActual = modoGuardado;
                this._configuracion.modo = modoGuardado;
                console.log(`📌 Modo cargado: ${modoGuardado}`);
            }
            const config = JSON.parse(localStorage.getItem('pipeline_tutor_config') || 'null');
            if (config) {
                this._configuracion = { ...this._configuracion, ...config };
                this._intervaloMinimoIntervencion = this._configuracion.tiempoEntreIntervenciones * 1000;
            }
            
            const espacialConfig = JSON.parse(localStorage.getItem('pipeline_espacial_config') || 'null');
            if (espacialConfig) {
                this._configuracion.espacial = { ...this._configuracion.espacial, ...espacialConfig };
            }
        } catch (error) {
            console.warn('⚠️ Error cargando configuración persistida:', error);
        }
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
            if (this._tutorInitDone) return;
            if (intentos >= maxIntentos) {
                console.warn('⚠️ No se pudo inicializar TutorNeuro después de ' + maxIntentos + ' intentos');
                return;
            }
            intentos++;
            setTimeout(() => {
                if (!this._tutorInitDone) {
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
                console.log('⏳ TutorNeuro: Esperando DB...');
                return;
            }
            
            if (this._tutorInitDone) return;
            
            this._tutorInitDone = true;
            this._core = window.uiCore || null;
            
            if (window.centinela) {
                this._centinela = window.centinela;
                console.log('🔗 TutorNeuro: Vinculado con Centinela exitosamente');
            }
            
            const idioma = this._obtenerIdiomaActual();
            const esJeroglifico = this._esJeroglifico(idioma);
            if (esJeroglifico) {
                this._configuracion.espacial.activo = true;
                this._configuracion.espacial.idiomaJeroglifico = true;
                console.log('🌌 Modo Espacial ACTIVADO para:', idioma);
            }
            
            console.log('🧠 Tutor Neuro V8.5: Inicializado correctamente (REFRESCO AUTOMÁTICO OBLIGATORIO)');
            console.log(`   📊 ${this._intervencionesPendientes.length} intervenciones pendientes`);
            console.log(`   📌 Modo: ${this._modoActual}`);
            console.log(`   🔥 Guía proactiva: ${this._configuracion.guiaProactiva.activa ? '✅ ACTIVADA' : '❌ DESACTIVADA'}`);
            console.log(`   🎯 Micro-objetivos: ${this._mapaAprendizaje.microObjetivos.filter(m => !m.completado).length} pendientes`);
            console.log(`   🧠 Neuro-monitoreo: ${this._centinela ? '✅ ACTIVO' : '❌ NO DISPONIBLE'}`);
            console.log(`   🌌 Modo Espacial: ${this._configuracion.espacial.activo ? '✅ ACTIVO' : '❌ INACTIVO'}`);
            console.log(`   🔄 Refresco automático: cada ${this._intervaloRefrescoMs / 1000} segundos (OBLIGATORIO)`);
            console.log(`   🔄 Forzar análisis al entrar: ${this._forzarAnalisisPendiente ? '✅ PENDIENTE' : '❌ NO PENDIENTE'}`);
            
            // ============================================================
            // INICIAR REFRESCO AUTOMÁTICO OBLIGATORIAMENTE
            // ============================================================
            this._iniciarRefrescoAutomatico();
            
            // ============================================================
            // FORZAR ANÁLISIS AL ENTRAR (SIMULA CLICK EN "Forzar Análisis")
            // ============================================================
            if (this._forzarAnalisisPendiente && !this._analisisInicialEjecutado) {
                console.log('🧠 [FORZAR ANÁLISIS] Ejecutando análisis inicial automático (simula click en "Forzar Análisis")...');
                setTimeout(async () => {
                    try {
                        await this.forzarAnalisis();
                        this._forzarAnalisisPendiente = false;
                        this._analisisInicialEjecutado = true;
                        this._guardarEstadoEnLocalStorage();
                        console.log('✅ [FORZAR ANÁLISIS] Análisis inicial completado automáticamente');
                    } catch (e) {
                        console.warn('⚠️ [FORZAR ANÁLISIS] Error en análisis inicial:', e);
                        // Reintentar después de 3 segundos
                        setTimeout(async () => {
                            try {
                                await this.forzarAnalisis();
                                this._forzarAnalisisPendiente = false;
                                this._analisisInicialEjecutado = true;
                                this._guardarEstadoEnLocalStorage();
                                console.log('✅ [FORZAR ANÁLISIS] Análisis inicial completado (reintento)');
                            } catch (e2) {
                                console.warn('⚠️ [FORZAR ANÁLISIS] Error en reintento:', e2);
                            }
                        }, 3000);
                    }
                }, 1500);
            }
            
            // ============================================================
            // REFRESCAR INMEDIATAMENTE DESPUÉS DE INICIALIZAR
            // ============================================================
            setTimeout(() => {
                console.log('🔄 Refresco inicial automático...');
                this._refrescarDashboardAutomatico();
            }, 500);
            
            // Refrescar de nuevo después de 2 segundos
            setTimeout(() => {
                console.log('🔄 Refresco de seguridad después de inicialización...');
                this._refrescarDashboardAutomatico();
            }, 2000);
            
            // Refrescar de nuevo después de 5 segundos para datos perezosos
            setTimeout(() => {
                console.log('🔄 Refresco de seguridad (datos perezosos)...');
                this._refrescarDashboardAutomatico();
            }, 5000);
            
            window.dispatchEvent(new CustomEvent('tutorNeuroInicializado', {
                detail: { initDone: true, modo: this._modoActual, version: '8.5', espacial: this._configuracion.espacial.activo }
            }));
            
        } catch (error) {
            console.warn('⚠️ TutorNeuro: Error en inicialización:', error.message);
        }
    }

    // ============================================================
    // INICIAR REFRESCO AUTOMÁTICO - OBLIGATORIO
    // ============================================================
    _iniciarRefrescoAutomatico() {
        // Siempre reiniciar el refresco automático
        if (this._intervaloRefresco) {
            clearInterval(this._intervaloRefresco);
            this._intervaloRefresco = null;
        }
        
        this._refrescoActivo = true;
        
        // Registrar eventos de refresco (si no están registrados)
        this._registrarEventosRefresco();
        
        // Iniciar intervalo de refresco
        this._intervaloRefresco = setInterval(() => {
            this._refrescarDashboardAutomatico();
        }, this._intervaloRefrescoMs);
        
        console.log(`🔄 Refresco automático OBLIGATORIO iniciado (cada ${this._intervaloRefrescoMs / 1000}s)`);
    }

    // ============================================================
    // REGISTRAR EVENTOS DE REFRESCO - TODOS
    // ============================================================
    _registrarEventosRefresco() {
        for (const evento of this._eventosRefresco) {
            // Remover listeners previos para evitar duplicados
            window.removeEventListener(evento, this._handleEventoRefresco);
            // Agregar nuevo listener
            window.addEventListener(evento, this._handleEventoRefresco.bind(this));
        }
        console.log(`📡 ${this._eventosRefresco.length} eventos de refresco registrados`);
    }

    // ============================================================
    // MANEJADOR DE EVENTOS DE REFRESCO
    // ============================================================
    _handleEventoRefresco(event) {
        const eventoNombre = event.type;
        console.log(`🔄 [${eventoNombre}] Refrescando dashboard automáticamente...`);
        
        // Registrar métrica por evento
        if (!this._metricasRefresco.refrescosPorEvento[eventoNombre]) {
            this._metricasRefresco.refrescosPorEvento[eventoNombre] = 0;
        }
        this._metricasRefresco.refrescosPorEvento[eventoNombre]++;
        
        // Refrescar inmediatamente
        this._refrescarDashboardAutomatico();
    }

    // ============================================================
    // REFRESCAR DASHBOARD AUTOMÁTICO - CORREGIDO
    // ============================================================
    async _refrescarDashboardAutomatico() {
        if (!this._tutorInitDone) {
            console.log('⏳ Tutor no inicializado, omitiendo refresco');
            return;
        }
        
        if (this._refrescando) {
            this._refrescosPendientes++;
            console.log(`⏳ Refresco en curso, encolando (${this._refrescosPendientes} pendientes)`);
            return;
        }
        
        const inicio = Date.now();
        this._refrescando = true;
        
        try {
            // Verificar si el contenedor del dashboard existe en el DOM
            const container = document.getElementById('tutorFullContainer');
            if (!container) {
                console.log('📭 Contenedor del tutor no visible, omitiendo refresco');
                this._refrescando = false;
                return;
            }
            
            // Siempre actualizar contexto, sin importar el módulo actual
            await this._actualizarContextoUsuario();
            await this._actualizarEstadisticasAvanzadas();
            await this._actualizarProgresoEspacial();
            
            // Re-renderizar dashboard SIEMPRE
            this._mostrarDashboardTutorCompleto();
            
            // Actualizar badge
            this._actualizarBadgeTutor();
            
            // Actualizar indicador de actividad
            if (this._core && typeof this._core.actualizarIndicadores === 'function') {
                this._core.actualizarIndicadores();
            }
            
            // Forzar actualización del dashboard principal también
            if (window.UIDashboard && typeof window.UIDashboard._cargarDashboardInicial === 'function') {
                try {
                    window.UIDashboard._cargarDashboardInicial();
                } catch (e) {
                    console.warn('⚠️ Error actualizando dashboard principal:', e);
                }
            }
            
            // Guardar estado en localStorage
            this._guardarEstadoEnLocalStorage();
            
            // Métricas
            const duracion = Date.now() - inicio;
            this._metricasRefresco.totalRefrescos++;
            this._metricasRefresco.ultimoRefresco = new Date().toISOString();
            this._metricasRefresco.tiempoTotalMs += duracion;
            this._metricasRefresco.promedioMs = Math.round(this._metricasRefresco.tiempoTotalMs / this._metricasRefresco.totalRefrescos);
            
            // Procesar refrescos pendientes
            if (this._refrescosPendientes > 0) {
                const pendientes = this._refrescosPendientes;
                this._refrescosPendientes = 0;
                console.log(`🔄 Procesando ${pendientes} refrescos pendientes...`);
                // No llamar recursivamente para evitar bucles
            }
            
        } catch (error) {
            console.warn('⚠️ Error en refresco automático:', error.message);
        } finally {
            this._refrescando = false;
            this._ultimoRefresco = Date.now();
        }
    }

    // ============================================================
    // FORZAR REFRESCO MANUALMENTE (MÉTODO PÚBLICO)
    // ============================================================
    async forzarRefresco() {
        console.log('🔄 Forzando refresco manual del dashboard...');
        if (this._core && typeof this._core.mostrarToast === 'function') {
            this._core.mostrarToast('🔄 Refrescando dashboard...', 'info');
        }
        
        // Forzar actualización completa
        await this._actualizarContextoUsuario();
        await this._actualizarEstadisticasAvanzadas();
        await this._actualizarProgresoEspacial();
        this._mostrarDashboardTutorCompleto();
        this._actualizarBadgeTutor();
        this._guardarEstadoEnLocalStorage();
        
        if (this._core && typeof this._core.mostrarToast === 'function') {
            this._core.mostrarToast('✅ Dashboard actualizado', 'success');
        }
        
        console.log('✅ Refresco manual completado');
    }

    // ============================================================
    // FORZAR ANÁLISIS (SIMULA CLICK EN "Forzar Análisis")
    // ============================================================
    async forzarAnalisis() {
        console.log('🧠 [FORZAR ANÁLISIS] Ejecutando análisis completo (simula click en "Forzar Análisis")...');
        if (this._core && typeof this._core.mostrarToast === 'function') {
            this._core.mostrarToast('🧠 Forzando análisis profundo...', 'info');
        }
        
        try {
            await this._actualizarContextoUsuario();
            await this._construirMapaAprendizaje();
            await this._actualizarEstadisticasAvanzadas();
            await this._actualizarProgresoEspacial();
            this._mostrarDashboardTutorCompleto();
            this._guardarEstadoEnLocalStorage();
            
            // Forzar actualización del dashboard principal
            if (window.UIDashboard && typeof window.UIDashboard._cargarDashboardInicial === 'function') {
                try {
                    window.UIDashboard._cargarDashboardInicial();
                } catch (e) {
                    console.warn('⚠️ Error actualizando dashboard principal:', e);
                }
            }
            
            if (this._core && typeof this._core.mostrarToast === 'function') {
                this._core.mostrarToast('✅ Análisis completado', 'success');
            }
            
            console.log('✅ [FORZAR ANÁLISIS] Análisis completado');
        } catch (error) {
            console.error('❌ Error en análisis:', error);
            if (this._core && typeof this._core.mostrarToast === 'function') {
                this._core.mostrarToast('❌ Error en el análisis', 'error');
            }
            throw error;
        }
    }

    // ============================================================
    // OBTENER MÉTRICAS DE REFRESCO (MÉTODO PÚBLICO)
    // ============================================================
    getMetricasRefresco() {
        return { ...this._metricasRefresco };
    }

    // ============================================================
    // AJUSTAR INTERVALO DE REFRESCO (MÉTODO PÚBLICO)
    // ============================================================
    setIntervaloRefresco(ms) {
        if (ms < 3000) {
            console.warn('⚠️ Intervalo mínimo recomendado: 3000ms');
            ms = 3000;
        }
        this._intervaloRefrescoMs = ms;
        
        if (this._intervaloRefresco) {
            clearInterval(this._intervaloRefresco);
            this._intervaloRefresco = setInterval(() => {
                this._refrescarDashboardAutomatico();
            }, this._intervaloRefrescoMs);
        }
        
        console.log(`🔄 Intervalo de refresco ajustado a ${ms / 1000}s`);
        if (this._core && typeof this._core.mostrarToast === 'function') {
            this._core.mostrarToast(`🔄 Refresco automático: ${ms / 1000}s`, 'info');
        }
    }

    // ============================================================
    // OBTENER INTERVENCIONES PENDIENTES (MÉTODO PÚBLICO)
    // ============================================================
    getIntervencionesPendientes() {
        return this._intervencionesPendientes || [];
    }

    // ============================================================
    // OBTENER SIGUIENTE TEMA (MÉTODO PÚBLICO)
    // ============================================================
    getSiguienteTema() {
        return this._contextoUsuario?.temas?.siguienteTema || null;
    }

    // ============================================================
    // INICIALIZAR REGLAS DE INTERVENCIÓN - V8.5
    // ============================================================
    _inicializarReglas() {
        this._reglasIntervencion = {
            'fallos_consecutivos': {
                id: 'fallos_consecutivos',
                nombre: 'Fallos Consecutivos',
                descripcion: 'Detecta cuando el usuario falla varias frases seguidas',
                prioridad: 'alta',
                condiciones: { fallosConsecutivos: 3, tiempoVentana: 120000 },
                accion: 'sugerir_repaso',
                mensaje: (contexto) => `🔴 Veo que has fallado ${contexto.fallos} frases seguidas sobre "${contexto.tema || 'este tema'}". ¿Quieres repasar las reglas gramaticales?`,
                opciones: (modo) => {
                    const base = [{ id: 'repasar_ahora', label: '📖 Repasar ahora', accion: 'ir_a_gramatica' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'repasar_despues', label: '⏰ Más tarde', accion: 'descartar' });
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            },
            'bajo_rcn': {
                id: 'bajo_rcn',
                nombre: 'RCN Bajo Detectado',
                descripcion: 'Detecta palabras con RCN persistentemente bajo',
                prioridad: 'alta',
                condiciones: { rcnMaximo: 1.5, repasosMinimos: 3, tiempoVentana: 300000 },
                accion: 'sugerir_estudio_focalizado',
                mensaje: (contexto) => `🧠 La palabra "${contexto.palabra}" tiene un RCN de ${contexto.rcn.toFixed(1)} después de ${contexto.repasos} intentos. ¿Quieres practicarla en "Mi Espacio"?`,
                opciones: (modo) => {
                    const base = [{ id: 'practicar_ahora', label: '🎯 Practicar ahora', accion: 'ir_a_espacio' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'añadir_lista', label: '📝 Añadir a lista de repaso', accion: 'añadir_a_lista' });
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            },
            'fatiga_cognitiva': {
                id: 'fatiga_cognitiva',
                nombre: 'Fatiga Cognitiva Detectada',
                descripcion: 'Detecta signos de fatiga cognitiva en el usuario',
                prioridad: 'alta',
                condiciones: { fatigaMinima: 0.6, tiempoSesionMinimo: 300000 },
                accion: 'sugerir_descanso',
                mensaje: (contexto) => `🧠 Llevas ${Math.round(contexto.tiempoSesion / 60000)} minutos estudiando y tu fatiga cognitiva está en ${Math.round(contexto.fatiga * 100)}%.`,
                opciones: (modo) => {
                    const base = [{ id: 'descansar', label: '☕ Tomar descanso', accion: 'sugerir_descanso' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'continuar', label: '📖 Continuar estudiando', accion: 'descartar' });
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            },
            'siguiente_tema': {
                id: 'siguiente_tema',
                nombre: 'Siguiente Tema',
                descripcion: 'Recomienda el siguiente tema a estudiar',
                prioridad: 'media',
                condiciones: {},
                accion: 'recomendar_tema',
                mensaje: (contexto) => `🧠 **Siguiente tema recomendado:** "${contexto.tema}"\n\n📊 Nivel: ${contexto.nivel} · 📚 ${contexto.historias || 0} historias\n📈 Progreso: ${contexto.progreso || 0}%`,
                opciones: (modo) => {
                    const base = [{ id: 'estudiar_tema', label: '📖 Estudiar ahora', accion: 'estudiar_tema_recomendado' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'ver_ruta', label: '🗺️ Ver ruta', accion: 'ver_ruta' });
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            },
            'racha_estudio': {
                id: 'racha_estudio',
                nombre: 'Racha de Estudio',
                descripcion: 'Felicita al usuario por su constancia',
                prioridad: 'baja',
                condiciones: { rachaMinima: 3 },
                accion: 'felicitar_racha',
                mensaje: (contexto) => `🔥 ¡Llevas ${contexto.racha} días seguidos estudiando! Tu consistencia está fortaleciendo tus conexiones neuronales. ¡Sigue así!`,
                opciones: (modo) => {
                    const base = [{ id: 'continuar', label: '🎯 Seguir así', accion: 'descartar' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'ver_progreso', label: '📊 Ver progreso', accion: 'ver_estadisticas' });
                    }
                    return base;
                }
            },
            'siguiente_modulo': {
                id: 'siguiente_modulo',
                nombre: 'Recomendación de Módulo',
                descripcion: 'Sugiere el siguiente módulo a estudiar basado en el progreso global',
                prioridad: 'alta',
                condiciones: {},
                accion: 'recomendar_modulo',
                mensaje: (contexto) => this._generarRecomendacionModulo(contexto),
                opciones: (modo) => {
                    const base = [
                        { id: 'ejecutar_recomendacion', label: '✅ Ir al módulo recomendado', accion: 'ejecutar_recomendacion' },
                        { id: 'ver_ruta', label: '🗺️ Ver ruta completa', accion: 'ver_ruta' }
                    ];
                    if (modo !== 'guiado') {
                        base.push({ id: 'posponer', label: '⏰ Posponer', accion: 'descartar' });
                    }
                    return base;
                }
            },
            'estancamiento': {
                id: 'estancamiento',
                nombre: 'Estancamiento Detectado',
                descripcion: 'Detecta cuando el usuario lleva días sin progreso significativo',
                prioridad: 'alta',
                condiciones: { diasSinProgreso: 3, umbralProgreso: 5 },
                accion: 'recomendar_cambio_estrategia',
                mensaje: (contexto) => `🔄 Llevas ${contexto.dias} días sin progreso significativo (${contexto.progreso}%). ¿Quieres probar una nueva estrategia de aprendizaje?`,
                opciones: (modo) => {
                    const base = [
                        { id: 'cambiar_estrategia', label: '🔄 Nueva estrategia', accion: 'recomendar_cambio_estrategia' },
                        { id: 'ver_ruta', label: '🗺️ Ver ruta', accion: 'ver_ruta' }
                    ];
                    if (modo !== 'guiado') {
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            },
            'recomendar_elipse': {
                id: 'recomendar_elipse',
                nombre: 'Recomendación de Elipse',
                descripcion: 'Sugiere usar el Modo Elipse cuando el usuario tiene temas estancados',
                prioridad: 'media',
                condiciones: { temasEstancados: 1, ondasElipse: 0 },
                accion: 'recomendar_elipse',
                mensaje: (contexto) => `🌌 Tienes ${contexto.temasEstancados} temas que necesitan repaso. El **Modo Elipse** te ayuda a consolidar el conocimiento a través de ondas expansivas.\n\n📊 ${contexto.ondasElipse} ondas generadas hasta ahora.`,
                opciones: (modo) => {
                    const base = [{ id: 'ir_elipse', label: '🌌 Ir a Modo Elipse', accion: 'ir_a_elipse' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'posponer', label: '⏰ Posponer', accion: 'descartar' });
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            },
            'recomendar_ondas_cruzadas': {
                id: 'recomendar_ondas_cruzadas',
                nombre: 'Recomendación de Ondas Cruzadas',
                descripcion: 'Sugiere usar el Modo Ondas Cruzadas cuando hay múltiples elipses',
                prioridad: 'media',
                condiciones: { elipsesConectadas: 2, ondasCruzadas: 0 },
                accion: 'recomendar_ondas_cruzadas',
                mensaje: (contexto) => `🌊 Tienes ${contexto.elipsesConectadas} elipses que pueden conectarse. El **Modo Ondas Cruzadas** crea interferencias productivas entre diferentes temas.\n\n🔗 ${contexto.ondasCruzadas} ondas cruzadas generadas.`,
                opciones: (modo) => {
                    const base = [{ id: 'ir_ondas_cruzadas', label: '🌊 Ir a Ondas Cruzadas', accion: 'ir_a_ondas_cruzadas' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'posponer', label: '⏰ Posponer', accion: 'descartar' });
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            },
            'recomendar_caracteres': {
                id: 'recomendar_caracteres',
                nombre: 'Recomendación de Caracteres',
                descripcion: 'Sugiere estudiar caracteres cuando el idioma es jeroglífico',
                prioridad: 'media',
                condiciones: { idiomaJeroglifico: true, caracteresEstudiados: 0 },
                accion: 'recomendar_caracteres',
                mensaje: (contexto) => `🀄 El idioma ${contexto.idioma} es jeroglífico. Estudiar caracteres es esencial para tu progreso.\n\n📚 ${contexto.caracteresEstudiados} caracteres estudiados hasta ahora.`,
                opciones: (modo) => {
                    const base = [{ id: 'ir_caracteres', label: '🀄 Ir a Caracteres', accion: 'ir_a_caracteres' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'posponer', label: '⏰ Posponer', accion: 'descartar' });
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            },
            'recomendar_tonos': {
                id: 'recomendar_tonos',
                nombre: 'Recomendación de Tonos',
                descripcion: 'Sugiere practicar tonos cuando el idioma es tonal',
                prioridad: 'media',
                condiciones: { idiomaTonal: true, tonosPracticados: 0 },
                accion: 'recomendar_tonos',
                mensaje: (contexto) => `🎵 El idioma ${contexto.idioma} es tonal. Practicar tonos es fundamental para una pronunciación correcta.\n\n🎶 ${contexto.tonosPracticados} tonos practicados hasta ahora.`,
                opciones: (modo) => {
                    const base = [{ id: 'ir_tonos', label: '🎵 Ir a Estudio de Tonos', accion: 'ir_a_tonos' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'posponer', label: '⏰ Posponer', accion: 'descartar' });
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            },
            'recomendar_biblioteca': {
                id: 'recomendar_biblioteca',
                nombre: 'Recomendación de Biblioteca',
                descripcion: 'Sugiere leer historias en la Biblioteca',
                prioridad: 'media',
                condiciones: { historiasSinLeer: 3, tiempoSinLeer: 7 },
                accion: 'recomendar_biblioteca',
                mensaje: (contexto) => `📚 Tienes ${contexto.historiasSinLeer} historias sin leer en la Biblioteca. Dedica unos minutos a la lectura para mejorar tu comprensión.\n\n📖 ${contexto.leidas}/${contexto.totalHistorias} leídas.\n\n💡 Recomendaciones: ${contexto.recomendaciones || 'Explora nuevos géneros'}`,
                opciones: (modo) => {
                    const base = [{ id: 'ir_biblioteca', label: '📚 Ir a Biblioteca', accion: 'ir_a_biblioteca' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'posponer', label: '⏰ Posponer', accion: 'descartar' });
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            },
            'logro_desbloqueado': {
                id: 'logro_desbloqueado',
                nombre: 'Logro Desbloqueado',
                descripcion: 'Notifica al usuario cuando desbloquea un nuevo logro',
                prioridad: 'alta',
                condiciones: {},
                accion: 'mostrar_logro',
                mensaje: (contexto) => `🏆 ¡Logro desbloqueado: **${contexto.logro}**!\n\n${contexto.descripcion}\n\n📊 +${contexto.puntos} puntos de experiencia.`,
                opciones: (modo) => {
                    const base = [
                        { id: 'ver_logros', label: '🏆 Ver todos los logros', accion: 'ver_logros' },
                        { id: 'continuar', label: '🎯 Seguir estudiando', accion: 'descartar' }
                    ];
                    return base;
                }
            },
            'micro_objetivo_completado': {
                id: 'micro_objetivo_completado',
                nombre: 'Micro-objetivo Completado',
                descripcion: 'Notifica al usuario cuando completa un micro-objetivo',
                prioridad: 'media',
                condiciones: {},
                accion: 'mostrar_micro_objetivo',
                mensaje: (contexto) => `🎯 ¡Micro-objetivo completado: **${contexto.objetivo}**!\n\n📊 +${contexto.recompensa} puntos de experiencia. Siguiente: ${contexto.siguiente}`,
                opciones: (modo) => {
                    const base = [{ id: 'continuar', label: '🎯 Seguir con el siguiente', accion: 'descartar' }];
                    return base;
                }
            },
            'recomendar_micro_objetivo': {
                id: 'recomendar_micro_objetivo',
                nombre: 'Recomendación de Micro-Objetivo',
                descripcion: 'Sugiere un micro-objetivo al usuario',
                prioridad: 'media',
                condiciones: {},
                accion: 'mostrar_micro_objetivo',
                mensaje: (contexto) => `🎯 **Micro-objetivo recomendado:** "${contexto.objetivo}"\n\n${contexto.descripcion}\n\n💡 +${contexto.recompensa} puntos al completarlo.`,
                opciones: (modo) => {
                    const base = [
                        { id: 'aceptar_micro', label: '🎯 Aceptar y completar', accion: 'aceptar_micro_objetivo' },
                        { id: 'ver_objetivos', label: '📋 Ver todos', accion: 'ver_micro_objetivos' }
                    ];
                    if (modo !== 'guiado') {
                        base.push({ id: 'posponer', label: '⏰ Posponer', accion: 'descartar' });
                    }
                    return base;
                }
            },
            'biblioteca_recomendacion': {
                id: 'biblioteca_recomendacion',
                nombre: 'Recomendación de Lectura',
                descripcion: 'Sugiere historias específicas de la Biblioteca',
                prioridad: 'media',
                condiciones: { historiasSinLeer: 1 },
                accion: 'recomendar_lectura',
                mensaje: (contexto) => `📖 **Recomendación de lectura:** "${contexto.titulo}"\n\n${contexto.descripcion}\n\n📊 Nivel: ${contexto.nivel} · ⏱️ ${contexto.duracion} min`,
                opciones: (modo) => {
                    const base = [{ id: 'leer_ahora', label: '📖 Leer ahora', accion: 'leer_recomendacion' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'posponer', label: '⏰ Posponer', accion: 'descartar' });
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            },
            'consistencia': {
                id: 'consistencia',
                nombre: 'Consistencia de Estudio',
                descripcion: 'Recompensa la consistencia diaria',
                prioridad: 'baja',
                condiciones: { horasMinimas: 0.5, diasConsecutivos: 3 },
                accion: 'felicitar_consistencia',
                mensaje: (contexto) => `🏅 ¡${contexto.dias} días consecutivos de estudio! Tu consistencia está construyendo hábitos sólidos.\n\n⏱️ ${contexto.horasEstudio} horas totales.`,
                opciones: (modo) => {
                    const base = [{ id: 'continuar', label: '🎯 Seguir así', accion: 'descartar' }];
                    return base;
                }
            },
            'recomendar_radicales': {
                id: 'recomendar_radicales',
                nombre: 'Recomendación de Radicales',
                descripcion: 'Sugiere aprender radicales para idiomas jeroglíficos',
                prioridad: 'media',
                condiciones: { idiomaJeroglifico: true, radicalesAprendidos: 0 },
                accion: 'recomendar_radicales',
                mensaje: (contexto) => `🌀 **Aprende radicales para dominar el idioma ${contexto.idioma}**\n\nLos radicales son los bloques de construcción de los caracteres. Aprender ${contexto.radicalesPorNivel || 10} radicales básicos te ayudará a memorizar miles de caracteres.\n\n📊 ${contexto.radicalesAprendidos || 0} radicales aprendidos hasta ahora.`,
                opciones: (modo) => {
                    const base = [{ id: 'ir_radicales', label: '🌀 Ir a Radicales', accion: 'ir_a_caracteres' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'posponer', label: '⏰ Posponer', accion: 'descartar' });
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            },
            'recomendar_composicion': {
                id: 'recomendar_composicion',
                nombre: 'Recomendación de Composición',
                descripcion: 'Sugiere practicar descomposición de caracteres',
                prioridad: 'media',
                condiciones: { idiomaJeroglifico: true, caracteresEstudiados: 3 },
                accion: 'recomendar_composicion',
                mensaje: (contexto) => `🧩 **Practica descomposición de caracteres**\n\nDescomponer caracteres en sus partes te ayuda a entender su estructura y significado.\n\n📊 ${contexto.caracteresDescompuestos || 0} caracteres descompuestos hasta ahora.`,
                opciones: (modo) => {
                    const base = [{ id: 'ir_composicion', label: '🧩 Ir a Composición', accion: 'ir_a_caracteres' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'posponer', label: '⏰ Posponer', accion: 'descartar' });
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            },
            'recomendar_escritura': {
                id: 'recomendar_escritura',
                nombre: 'Recomendación de Escritura',
                descripcion: 'Sugiere practicar la escritura de caracteres',
                prioridad: 'media',
                condiciones: { idiomaJeroglifico: true, trazosPracticados: 0 },
                accion: 'recomendar_escritura',
                mensaje: (contexto) => `✍️ **Practica la escritura de caracteres**\n\nEl orden de los trazos es fundamental para escribir caracteres correctamente.\n\n📊 ${contexto.trazosPracticados || 0} trazos practicados hasta ahora.`,
                opciones: (modo) => {
                    const base = [{ id: 'ir_escritura', label: '✍️ Ir a Escritura', accion: 'ir_a_caracteres' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'posponer', label: '⏰ Posponer', accion: 'descartar' });
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            },
            'recomendar_mnemotecnia': {
                id: 'recomendar_mnemotecnia',
                nombre: 'Recomendación de Mnemotecnia',
                descripcion: 'Sugiere usar historias para recordar caracteres',
                prioridad: 'media',
                condiciones: { idiomaJeroglifico: true, caracteresEstudiados: 5 },
                accion: 'recomendar_mnemotecnia',
                mensaje: (contexto) => `🧠 **Crea historias para recordar caracteres**\n\nLas historias mnemotécnicas te ayudan a recordar caracteres mediante asociaciones visuales y narrativas.\n\n📊 ${contexto.historiasCreadas || 0} historias mnemotécnicas creadas.`,
                opciones: (modo) => {
                    const base = [{ id: 'ir_mnemotecnia', label: '🧠 Ir a Mnemotecnia', accion: 'ir_a_caracteres' }];
                    if (modo !== 'guiado') {
                        base.push({ id: 'posponer', label: '⏰ Posponer', accion: 'descartar' });
                        base.push({ id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' });
                    }
                    return base;
                }
            }
        };
    }

    // ============================================================
    // GENERAR RECOMENDACIÓN DE MÓDULO - V8.5
    // ============================================================
    _generarRecomendacionModulo(contexto) {
        let mensaje = '🧠 **Tutor Neuro: Recomendación Personalizada V8.5**\n\n';
        let puntuaciones = {};
        
        const esJeroglifico = this._esJeroglifico(contexto.idioma);
        const esTonal = this._esTonal(contexto.idioma);

        // Recomendaciones espaciales
        if (esJeroglifico && this._configuracion.espacial.activo) {
            const radicalesAprendidos = this._mapaAprendizaje.espacial.radicalesConocidos?.length || 0;
            if (radicalesAprendidos < 10) {
                const restantes = 10 - radicalesAprendidos;
                puntuaciones.radicales = {
                    puntuacion: 85 + (10 - radicalesAprendidos) * 2,
                    modulo: 'caracteres',
                    detalle: `🌀 Aprende ${restantes} radicales básicos para construir caracteres con confianza.`,
                    prioridad: 'alta',
                    key: 'radicales'
                };
            }

            const caracteresEstudiados = contexto.caracteres?.caracteresEstudiados || 0;
            if (caracteresEstudiados < 20) {
                const restantes = 20 - caracteresEstudiados;
                puntuaciones.caracteres_espacial = {
                    puntuacion: 80 + (20 - caracteresEstudiados),
                    modulo: 'caracteres',
                    detalle: `🀄 Estudia ${restantes} caracteres para construir tu vocabulario básico.`,
                    prioridad: 'alta',
                    key: 'caracteres_espacial'
                };
            }

            const trazosPracticados = this._mapaAprendizaje.espacial.trazosPracticados?.length || 0;
            if (trazosPracticados < 20) {
                puntuaciones.escritura = {
                    puntuacion: 75 + (20 - trazosPracticados) * 0.5,
                    modulo: 'caracteres',
                    detalle: `✍️ Practica el orden de trazos para mejorar tu caligrafía.`,
                    prioridad: 'media',
                    key: 'escritura'
                };
            }

            const composiciones = this._mapaAprendizaje.espacial.composicionesEstudiadas?.length || 0;
            if (composiciones < 10) {
                puntuaciones.composicion = {
                    puntuacion: 70 + (10 - composiciones) * 2,
                    modulo: 'caracteres',
                    detalle: `🧩 Descompón caracteres en radicales para entender su estructura.`,
                    prioridad: 'media',
                    key: 'composicion'
                };
            }

            const historias = this._mapaAprendizaje.espacial.historiasMnemotecnicas?.length || 0;
            if (historias < 5) {
                puntuaciones.mnemotecnia = {
                    puntuacion: 65 + (5 - historias) * 5,
                    modulo: 'caracteres',
                    detalle: `🧠 Crea historias mnemotécnicas para recordar caracteres difíciles.`,
                    prioridad: 'media',
                    key: 'mnemotecnia'
                };
            }
        }

        // Recomendaciones estándar
        if (contexto.temas.enProgreso > 0) {
            const pct = Math.round(contexto.temas.progresoPromedio || 0);
            puntuaciones.estudiar_tema = {
                puntuacion: 80 + (100 - pct) * 0.3,
                modulo: 'estudiar_tema',
                detalle: `Continúa con tus temas en progreso (${pct}% completado).`,
                prioridad: 'alta',
                key: 'estudiar_tema'
            };
        }

        if (contexto.temas.sinIniciar > 0) {
            const pct = Math.round((contexto.temas.sinIniciar / contexto.temas.total) * 100);
            puntuaciones.iniciar_tema = {
                puntuacion: 70 + (100 - pct) * 0.2,
                modulo: 'estudiar_tema',
                detalle: `Tienes ${contexto.temas.sinIniciar} temas sin iniciar. Comienza uno nuevo.`,
                prioridad: 'media',
                key: 'iniciar_tema'
            };
        }

        if (contexto.elipse.activa && contexto.elipse.ondasPendientes > 0) {
            const pct = Math.round((contexto.elipse.ondasCompletadas / contexto.elipse.totalOndas) * 100);
            puntuaciones.elipse = {
                puntuacion: 70 + (100 - pct) * 0.3,
                modulo: 'elipse',
                detalle: `Tienes ${contexto.elipse.ondasPendientes} ondas pendientes en el Modo Elipse (${pct}% completado).`,
                prioridad: 'media-alta',
                key: 'elipse'
            };
        }

        if (contexto.elipse.activa && contexto.elipse.necesitaNuevaOnda) {
            puntuaciones.elipse_nueva = {
                puntuacion: 75,
                modulo: 'elipse',
                detalle: 'Has completado todas las ondas. Genera una nueva onda en el Modo Elipse.',
                prioridad: 'media',
                key: 'elipse_nueva'
            };
        }

        if (contexto.ondasCruzadas.grafoSize >= 2 && contexto.ondasCruzadas.ondasTotales < 5) {
            puntuaciones.ondas_cruzadas = {
                puntuacion: 60 + (contexto.ondasCruzadas.grafoSize * 5),
                modulo: 'ondasCruzadas',
                detalle: `Tienes ${contexto.ondasCruzadas.grafoSize} elipses conectadas. Genera ondas cruzadas para crear interferencias.`,
                prioridad: 'media',
                key: 'ondas_cruzadas'
            };
        }

        if (!esJeroglifico && contexto.caracteres.totalCaracteres > 0 && contexto.caracteres.caracteresEstudiados < 3) {
            puntuaciones.caracteres = {
                puntuacion: 65 + (contexto.caracteres.totalCaracteres * 2),
                modulo: 'caracteres',
                detalle: `Tienes ${contexto.caracteres.totalCaracteres} caracteres disponibles. Estudia los básicos.`,
                prioridad: 'media',
                key: 'caracteres'
            };
        }

        if (esTonal && contexto.tonos.totalHistorias > 0 && contexto.tonos.historiasLeidas < 3) {
            puntuaciones.tonos = {
                puntuacion: 60 + (contexto.tonos.totalHistorias * 3),
                modulo: 'tonos',
                detalle: `Tienes ${contexto.tonos.totalHistorias} historias tonales. Practica los tonos.`,
                prioridad: 'media',
                key: 'tonos'
            };
        }

        if (contexto.biblioteca.totalHistorias > 0) {
            const pct = Math.round((contexto.biblioteca.leidas / contexto.biblioteca.totalHistorias) * 100);
            const sinLeer = contexto.biblioteca.totalHistorias - contexto.biblioteca.leidas;
            if (sinLeer > 0 && pct < 80) {
                const bonus = Math.max(0, (100 - pct) * 0.2);
                puntuaciones.biblioteca = {
                    puntuacion: 55 + bonus + (sinLeer * 2),
                    modulo: 'biblioteca',
                    detalle: `Tienes ${sinLeer} historias sin leer en la Biblioteca (${pct}% completado). ${contexto.biblioteca.recomendaciones && contexto.biblioteca.recomendaciones.length > 0 ? `\n📖 Recomendación: "${contexto.biblioteca.recomendaciones[0]}"` : ''}`,
                    prioridad: sinLeer > 3 ? 'media-alta' : 'media',
                    key: 'biblioteca'
                };
            }
        }

        if (contexto.pipeline.necesitaRepaso) {
            puntuaciones.repaso = {
                puntuacion: 85,
                modulo: 'study',
                detalle: 'Tienes frases con RCN bajo. Haz un repaso en el módulo de estudio.',
                prioridad: 'alta',
                key: 'repaso'
            };
        }

        if (contexto.racha > 0 && contexto.racha < 3) {
            puntuaciones.racha = {
                puntuacion: 50 + (contexto.racha * 10),
                modulo: 'study',
                detalle: `Llevas ${contexto.racha} días de racha. ¡No la rompas! Estudia algo hoy.`,
                prioridad: 'media',
                key: 'racha'
            };
        }

        if (contexto.analisisProgreso.urgencia === 'alta') {
            puntuaciones.cambio_estrategia = {
                puntuacion: 95,
                modulo: 'tools',
                detalle: 'Detectamos estancamiento. Prueba una nueva estrategia de aprendizaje.',
                prioridad: 'alta',
                key: 'cambio_estrategia'
            };
        }

        const microPendientes = this._mapaAprendizaje.microObjetivos.filter(m => !m.completado);
        if (microPendientes.length > 0 && this._configuracion.microObjetivos.activo) {
            const micro = microPendientes[0];
            puntuaciones.micro_objetivo = {
                puntuacion: 70,
                modulo: micro.modulo || 'study',
                detalle: `🎯 Micro-objetivo: "${micro.titulo}" - ${micro.descripcion}`,
                prioridad: 'media',
                key: 'micro_objetivo'
            };
        }

        let mejorPuntuacion = 0;
        let mejorOpcion = null;

        for (const [key, value] of Object.entries(puntuaciones)) {
            if (value.puntuacion > mejorPuntuacion) {
                mejorPuntuacion = value.puntuacion;
                mejorOpcion = { key, ...value };
            }
        }

        if (!mejorOpcion) {
            mensaje += '📚 **Sigue tu ritmo de aprendizaje.**\n\n';
            mensaje += '💡 El Tutor está aquí para ayudarte cuando lo necesites.\n';
            mensaje += '🔍 Puedes explorar cualquier módulo desde el Dashboard.\n';
            
            if (esJeroglifico) {
                mensaje += '\n🌌 **Modo Espacial activo:** Estudia caracteres, radicales y práctica de escritura.\n';
            }
            
            const microPendientesDisplay = this._mapaAprendizaje.microObjetivos.filter(m => !m.completado);
            if (microPendientesDisplay.length > 0) {
                mensaje += '\n🎯 **Micro-objetivos disponibles:**\n';
                for (const m of microPendientesDisplay.slice(0, 3)) {
                    mensaje += `  • ${m.titulo} (+${m.recompensa} pts)\n`;
                }
            }
            
            return mensaje;
        }

        const emojis = {
            'estudiar_tema': '📚',
            'iniciar_tema': '📂',
            'elipse': '🌌',
            'elipse_nueva': '🌊',
            'ondas_cruzadas': '🌊',
            'caracteres': '🀄',
            'caracteres_espacial': '🀄',
            'tonos': '🎵',
            'biblioteca': '📚',
            'repaso': '🔄',
            'racha': '🔥',
            'cambio_estrategia': '🧠',
            'micro_objetivo': '🎯',
            'radicales': '🌀',
            'escritura': '✍️',
            'composicion': '🧩',
            'mnemotecnia': '🧠'
        };
        
        const nombres = {
            'estudiar_tema': 'Estudiar Tema',
            'iniciar_tema': 'Iniciar Tema',
            'elipse': 'Modo Elipse',
            'elipse_nueva': 'Nueva Onda Elipse',
            'ondas_cruzadas': 'Modo Ondas Cruzadas',
            'caracteres': 'Módulo Caracteres',
            'caracteres_espacial': '🌌 Modo Espacial - Caracteres',
            'tonos': 'Estudio de Tonos',
            'biblioteca': 'Biblioteca de Lectura',
            'repaso': 'Repaso de Estudio',
            'racha': 'Mantener Racha',
            'cambio_estrategia': 'Cambio de Estrategia',
            'micro_objetivo': '🎯 Micro-Objetivo',
            'radicales': '🌀 Estudio de Radicales',
            'escritura': '✍️ Práctica de Escritura',
            'composicion': '🧩 Descomposición de Caracteres',
            'mnemotecnia': '🧠 Mnemotecnia'
        };
        
        const emoji = emojis[mejorOpcion.key] || '🎯';
        const nombre = nombres[mejorOpcion.key] || mejorOpcion.key;

        mensaje += `${emoji} **${nombre}** (prioridad: ${mejorOpcion.prioridad})\n`;
        mensaje += `📌 ${mejorOpcion.detalle}\n\n`;
        
        const consejos = {
            'estudiar_tema': 'Completa un tema a la vez para consolidar el conocimiento.',
            'iniciar_tema': 'Empieza con temas de tu nivel actual para evitar frustración.',
            'elipse': 'Las ondas te ayudan a expandir tu conocimiento de forma orgánica.',
            'elipse_nueva': 'Cada nueva onda refuerza conexiones neuronales previas.',
            'ondas_cruzadas': 'La interferencia entre temas crea asociaciones más fuertes.',
            'caracteres': 'Los caracteres son la base del idioma. Domínalos uno a uno.',
            'caracteres_espacial': 'El modo espacial te ayuda a visualizar y memorizar caracteres.',
            'tonos': 'La práctica de tonos mejora tu comprensión y pronunciación.',
            'biblioteca': 'La lectura mejora tu comprensión y vocabulario. ¡Disfruta de las historias!',
            'repaso': 'El repaso espaciado es clave para la retención a largo plazo.',
            'racha': 'La constancia es más importante que la intensidad.',
            'cambio_estrategia': 'A veces, un cambio de enfoque desbloquea el progreso.',
            'micro_objetivo': 'Los micro-objetivos hacen el progreso más tangible y motivador.',
            'radicales': 'Los radicales son los bloques de construcción de los caracteres.',
            'escritura': 'El orden de trazos correcto mejora tu caligrafía y memorización.',
            'composicion': 'Descomponer caracteres te ayuda a entender su estructura.',
            'mnemotecnia': 'Las historias visuales son poderosas para la memoria.'
        };

        mensaje += `💡 **Consejo del Tutor:**\n${consejos[mejorOpcion.key] || 'Sigue tu ritmo de aprendizaje.'}`;

        if (esJeroglifico && this._configuracion.espacial.activo) {
            const radicales = this._mapaAprendizaje.espacial.radicalesConocidos?.length || 0;
            const caracteres = this._mapaAprendizaje.espacial.caracteresAprendidos?.length || 0;
            mensaje += `\n\n🌌 **Progreso Espacial:**\n`;
            mensaje += `  • Radicales: ${radicales}/10 básicos\n`;
            mensaje += `  • Caracteres: ${caracteres} aprendidos\n`;
        }

        this._mapaAprendizaje.objetivoActual = {
            modulo: mejorOpcion.modulo,
            detalle: mejorOpcion.detalle,
            prioridad: mejorOpcion.prioridad,
            puntuacion: mejorPuntuacion,
            timestamp: Date.now(),
            key: mejorOpcion.key
        };

        return mensaje;
    }

    // ============================================================
    // MÉTODOS DE CONFIGURACIÓN DE MODOS
    // ============================================================
    _getModoColor(modo) {
        const colores = { 
            'guiado': '#6C5CE7', 
            'flexible': '#00B894', 
            'libre': '#636E72',
            'espacial': '#6C5CE7'
        };
        return colores[modo] || '#6C5CE7';
    }

    _getModoBg(modo) {
        const bg = {
            'guiado': 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
            'flexible': 'linear-gradient(135deg, #00B894, #55EFC4)',
            'libre': 'linear-gradient(135deg, #636E72, #2D3436)',
            'espacial': 'linear-gradient(135deg, #6C5CE7, #00CEC9)'
        };
        return bg[modo] || 'linear-gradient(135deg, #6C5CE7, #A29BFE)';
    }

    _getModoIcono(modo) {
        const iconos = { 
            'guiado': '🚀', 
            'flexible': '🧠', 
            'libre': '📴',
            'espacial': '🌌'
        };
        return iconos[modo] || '🧠';
    }

    // ============================================================
    // SET MODO CON SINCRONIZACIÓN CON UIConfig
    // ============================================================
    setModo(modo) {
        const modosValidos = Object.values(this._MODOS);
        if (!modosValidos.includes(modo)) {
            console.warn(`⚠️ Modo "${modo}" inválido. Usa: ${modosValidos.join(', ')}`);
            return this._modoActual;
        }
        
        const modoAnterior = this._modoActual;
        this._modoActual = modo;
        this._configuracion.modo = modo;
        
        const config = this._configuracion.modoConfig[modo];
        this._configuracion.intervencionAuto = modo !== this._MODOS.LIBRE && modo !== this._MODOS.ESPACIAL;
        this._configuracion.nivelInvasividad = modo === this._MODOS.GUIADO ? 'alto' : 'bajo';
        
        if (modo === this._MODOS.ESPACIAL) {
            const idioma = this._obtenerIdiomaActual();
            if (this._esJeroglifico(idioma)) {
                this._configuracion.espacial.activo = true;
                this._configuracion.espacial.idiomaJeroglifico = true;
                console.log('🌌 Modo Espacial ACTIVADO');
            } else {
                console.warn('⚠️ El modo espacial solo está disponible para idiomas jeroglíficos');
                this._modoActual = this._MODOS.FLEXIBLE;
                this._configuracion.modo = this._MODOS.FLEXIBLE;
                const core = this._core || window.uiCore;
                if (core && typeof core.mostrarToast === 'function') {
                    core.mostrarToast('⚠️ El modo espacial solo está disponible para idiomas jeroglíficos (Chino, Japonés, Coreano)', 'warning');
                }
                return this.getModoInfo();
            }
        } else {
            this._configuracion.espacial.activo = false;
        }
        
        localStorage.setItem('pipeline_tutor_modo', modo);
        localStorage.setItem('pipeline_tutor_config', JSON.stringify(this._configuracion));
        localStorage.setItem('pipeline_espacial_config', JSON.stringify(this._configuracion.espacial));
        
        console.log(`🔄 Tutor Neuro: Modo cambiado a "${modo}"`);
        console.log(`   📌 Intervenciones: ${this._configuracion.intervencionAuto ? 'Activadas' : 'Desactivadas'}`);
        console.log(`   📌 Invasividad: ${this._configuracion.nivelInvasividad}`);
        console.log(`   📌 Bloqueo navegación: ${config.bloqueoNavegacion}`);
        
        if (modo === this._MODOS.GUIADO) {
            this._iniciarModoGuiado();
        } else {
            this._navegacionBloqueada = false;
            this._restaurarNavegacion();
        }
        
        this._actualizarBadgeTutor();
        // Refrescar inmediatamente después de cambiar modo
        this._refrescarDashboardAutomatico();
        
        window.dispatchEvent(new CustomEvent('tutorModoCambiado', {
            detail: { 
                modo, 
                configuracion: this._configuracion,
                modoAnterior: modoAnterior,
                espacial: this._configuracion.espacial.activo
            }
        }));
        
        if (window.UIConfig && document.getElementById('configContent')) {
            setTimeout(() => window.UIConfig._cargarConfiguracion(), 500);
        }
        
        const core = this._core || window.uiCore;
        const info = this.getModoInfo();
        if (core && typeof core.mostrarToast === 'function') {
            core.mostrarToast(`🔄 Modo cambiado a ${info.nombre}`, 'info');
        }
        
        if (modo === this._MODOS.GUIADO && core && typeof core.mostrarToast === 'function') {
            core.mostrarToast('🚀 Modo Guiado: Solo puedes estudiar lo que el Tutor recomienda.', 'warning');
        }
        
        if (modo === this._MODOS.ESPACIAL && core && typeof core.mostrarToast === 'function') {
            core.mostrarToast('🌌 Modo Espacial: Aprendizaje de caracteres con métodos visuales y mnemotécnicos.', 'info');
        }
        
        if (window.UIDashboard) {
            setTimeout(() => window.UIDashboard._cargarDashboardInicial(window.uiCore), 300);
        }
        
        return this.getModoInfo();
    }

    getModo() {
        return this._modoActual;
    }

    getModoInfo() {
        const info = {
            [this._MODOS.GUIADO]: {
                nombre: '🚀 Modo Guiado',
                descripcion: 'El tutor decide el camino. Solo puedes estudiar lo que él recomienda.',
                icono: '🚀',
                color: '#6C5CE7',
                bg: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
                caracteristicas: [
                    '✅ Intervenciones automáticas',
                    '🔒 No puedes ignorar recomendaciones',
                    '🔒 Navegación bloqueada a otros temas',
                    '✅ Máxima eficiencia'
                ]
            },
            [this._MODOS.FLEXIBLE]: {
                nombre: '🧠 Modo Flexible',
                descripcion: 'El tutor sugiere, tú decides. Puedes aceptar, posponer o ignorar.',
                icono: '🧠',
                color: '#00B894',
                bg: 'linear-gradient(135deg, #00B894, #55EFC4)',
                caracteristicas: [
                    '✅ Intervenciones automáticas',
                    '✅ Puedes ignorar recomendaciones',
                    '✅ Libertad de navegación',
                    '✅ Equilibrio perfecto'
                ]
            },
            [this._MODOS.LIBRE]: {
                nombre: '📴 Modo Libre',
                descripcion: 'El tutor no interviene. Solo muestra la ruta si la consultas.',
                icono: '📴',
                color: '#636E72',
                bg: 'linear-gradient(135deg, #636E72, #2D3436)',
                caracteristicas: [
                    '❌ Sin intervenciones automáticas',
                    '✅ Libertad total',
                    '✅ Puedes consultar la ruta manualmente',
                    '✅ Sin bloqueos'
                ]
            },
            [this._MODOS.ESPACIAL]: {
                nombre: '🌌 Modo Espacial',
                descripcion: 'Aprendizaje de idiomas jeroglíficos con métodos visuales y mnemotécnicos.',
                icono: '🌌',
                color: '#6C5CE7',
                bg: 'linear-gradient(135deg, #6C5CE7, #00CEC9)',
                caracteristicas: [
                    '🀄 Enfoque en caracteres y radicales',
                    '🌀 Sistema de radicales por niveles',
                    '✍️ Práctica de orden de trazos',
                    '🧠 Mnemotecnia visual',
                    '🧩 Descomposición de caracteres'
                ]
            }
        };
        return info[this._modoActual] || info[this._MODOS.FLEXIBLE];
    }

    // ============================================================
    // INICIAR MODO GUIADO CON BLOQUEOS REALES
    // ============================================================
    _iniciarModoGuiado() {
        console.log('🚀 Modo Guiado: Activando bloqueos de navegación...');
        
        if (!this._originalIrAModulo && window.uiCore) {
            this._originalIrAModulo = window.uiCore.irAModulo;
        }
        if (!this._originalEstudiarTema && window.UITemas) {
            this._originalEstudiarTema = window.UITemas._estudiarTema;
        }
        if (!this._originalCambiarModoEstudio && window.UIStudy) {
            this._originalCambiarModoEstudio = window.UIStudy.cambiarModoEstudio;
        }
        
        this._overrideNavegacion();
        this._overrideSeleccionTemas();
        this._overrideCambioModoEstudio();
        this._overrideEstudioManual();
        this._navegacionBloqueada = true;
        
        setTimeout(() => {
            const paso = this._getPasoRecomendado();
            if (paso && !paso.completado) {
                const core = this._core || window.uiCore;
                if (core && typeof core.mostrarToast === 'function') {
                    core.mostrarToast(`📌 Modo Guiado: Estudia "${paso.titulo}"`, 'info');
                }
                if (core && typeof core.irAModulo === 'function') {
                    core.irAModulo('study');
                }
            }
        }, 1000);
        
        this._actualizarBadgeTutor();
        this._refrescarDashboardAutomatico();
        
        const intervencionGuiado = {
            id: 'modo_guiado_activado_' + Date.now(),
            reglaId: 'modo_guiado_activado',
            prioridad: 'alta',
            mensaje: `🚀 **Modo Guiado ACTIVADO**\n\n` +
                     `🔒 **Navegación bloqueada** - Solo puedes acceder a los módulos recomendados.\n` +
                     `📌 **Sigue la ruta** - El Tutor te guiará paso a paso.\n` +
                     `✅ **Completa cada paso** para avanzar al siguiente.\n\n` +
                     `💡 No puedes ignorar las recomendaciones del Tutor.`,
            opciones: [{ id: 'ok', label: '✅ Entendido', accion: 'descartar' }],
            timestamp: Date.now()
        };
        
        this._intervencionesPendientes.push(intervencionGuiado);
        this._ultimaIntervencion = Date.now();
        this._contadorIntervencionesSesion++;
        this._mostrarIntervencion(intervencionGuiado);
    }

    // ============================================================
    // RESTAURAR NAVEGACIÓN
    // ============================================================
    _restaurarNavegacion() {
        console.log('🔓 Restaurando navegación...');
        this._navegacionBloqueada = false;
        
        if (this._originalIrAModulo && window.uiCore) {
            window.uiCore.irAModulo = this._originalIrAModulo;
        }
        if (this._originalEstudiarTema && window.UITemas) {
            window.UITemas._estudiarTema = this._originalEstudiarTema;
        }
        if (this._originalCambiarModoEstudio && window.UIStudy) {
            window.UIStudy.cambiarModoEstudio = this._originalCambiarModoEstudio;
        }
        
        this._actualizarBadgeTutor();
        
        const core = this._core || window.uiCore;
        if (core && typeof core.mostrarToast === 'function') {
            core.mostrarToast('🔓 Navegación restaurada', 'info');
        }
    }

    // ============================================================
    // SOBRESCRIBIR NAVEGACIÓN
    // ============================================================
    _overrideNavegacion() {
        if (this._modoActual !== this._MODOS.GUIADO) return;
        if (!window.uiCore) return;
        
        const self = this;
        const modulosPermitidos = ['dashboard', 'study', 'vigia', 'config', 'biblioteca', 'caracteres'];
        
        if (!this._originalIrAModulo) {
            this._originalIrAModulo = window.uiCore.irAModulo;
        }
        
        window.uiCore.irAModulo = function(modulo) {
            if (modulosPermitidos.includes(modulo)) {
                self._originalIrAModulo.call(this, modulo);
            } else {
                self._mostrarNotificacionBloqueo('navegar_a_modulo', modulo);
                const paso = self._getPasoRecomendado();
                if (paso && !paso.completado) {
                    if (self._core && typeof self._core.mostrarToast === 'function') {
                        self._core.mostrarToast(`📌 Debes estudiar: "${paso.titulo}"`, 'warning');
                    }
                    self._originalIrAModulo.call(this, 'study');
                }
            }
        };
    }

    _overrideSeleccionTemas() {
        if (this._modoActual !== this._MODOS.GUIADO) return;
        if (!window.UITemas) return;
        
        const self = this;
        
        if (!this._originalEstudiarTema) {
            this._originalEstudiarTema = window.UITemas._estudiarTema;
        }
        
        window.UITemas._estudiarTema = async function(temaId) {
            const pasoActual = self._getPasoRecomendado();
            const temaRecomendado = pasoActual?.parametros?.temaId;
            
            if (temaRecomendado && temaRecomendado !== temaId) {
                self._mostrarNotificacionBloqueo('estudiar_tema_manual');
                const core = self._core || window.uiCore;
                if (pasoActual && core && typeof core.mostrarToast === 'function') {
                    core.mostrarToast(`📌 Modo Guiado: Debes estudiar "${pasoActual.titulo}"`, 'warning');
                }
                if (core && typeof core.irAModulo === 'function') {
                    core.irAModulo('study');
                }
                return;
            }
            
            self._originalEstudiarTema.call(this, temaId);
        };
    }

    _overrideCambioModoEstudio() {
        if (this._modoActual !== this._MODOS.GUIADO) return;
        if (!window.UIStudy) return;
        
        const self = this;
        
        if (!this._originalCambiarModoEstudio) {
            this._originalCambiarModoEstudio = window.UIStudy.cambiarModoEstudio;
        }
        
        window.UIStudy.cambiarModoEstudio = function(modo) {
            const pasoActual = self._getPasoRecomendado();
            const modoRecomendado = pasoActual?.parametros?.modoEstudio || 'flashcard';
            
            if (modo !== modoRecomendado) {
                self._mostrarNotificacionBloqueo('cambiar_modo_estudio');
                const core = self._core || window.uiCore;
                if (core && typeof core.mostrarToast === 'function') {
                    core.mostrarToast(`📌 Modo Guiado: Usa el modo "${modoRecomendado}"`, 'warning');
                }
                return;
            }
            
            self._originalCambiarModoEstudio.call(this, modo);
        };
    }

    _overrideEstudioManual() {
        if (this._modoActual !== this._MODOS.GUIADO) return;
        
        const self = this;
        
        window.addEventListener('respuestaEstudio', (e) => {
            const detalle = e.detail;
            if (!detalle) return;
            
            const pasoActual = self._getPasoRecomendado();
            if (!pasoActual || pasoActual.completado) {
                self._mostrarNotificacionBloqueo('respuesta_estudio');
                return;
            }
            
            if (!self._pasoActivo) {
                self._mostrarNotificacionBloqueo('respuesta_estudio');
                return;
            }
        }, true);
    }

    _verificarPermiso(accion) {
        const modo = this._modoActual;
        
        if (modo === this._MODOS.GUIADO) {
            const accionesPermitidas = [
                'ejecutar_paso_learning_path',
                'ejecutar_paso',
                'estudiar_tema_recomendado',
                'ver_ruta',
                'descartar',
                'sugerir_descanso',
                'ver_estadisticas',
                'ir_a_estudio',
                'ir_a_dashboard',
                'ir_a_elipse',
                'ir_a_ondas_cruzadas',
                'ir_a_caracteres',
                'ir_a_tonos',
                'ir_a_biblioteca',
                'recomendar_cambio_estrategia',
                'aceptar_micro_objetivo',
                'ver_micro_objetivos',
                'leer_recomendacion',
                'ir_radicales',
                'ir_composicion',
                'ir_escritura',
                'ir_mnemotecnia'
            ];
            
            if (!accionesPermitidas.includes(accion)) {
                console.warn(`🚫 Modo Guiado: Acción "${accion}" NO PERMITIDA`);
                this._mostrarNotificacionBloqueo(accion);
                return false;
            }
            return true;
        }
        
        return true;
    }

    _mostrarNotificacionBloqueo(accion, modulo = '') {
        const mensajes = {
            'estudiar_tema_manual': '🚫 Modo Guiado: No puedes seleccionar temas manualmente. Sigue la ruta del Tutor.',
            'cambiar_modo_estudio': '🚫 Modo Guiado: El Tutor controla el modo de estudio.',
            'navegar_a_modulo': `🚫 Modo Guiado: No puedes acceder al módulo "${modulo}". Solo puedes ir a Dashboard, Study, Vigía o Biblioteca.`,
            'ignorar_recomendacion': '🚫 Modo Guiado: No puedes ignorar las recomendaciones del Tutor.',
            'respuesta_estudio': '🚫 Modo Guiado: Completa el paso actual antes de continuar.',
            'cambiar_tema': '🚫 Modo Guiado: No puedes cambiar de tema. Sigue la ruta del Tutor.'
        };
        
        const mensaje = mensajes[accion] || `🚫 Modo Guiado: La acción "${accion}" no está permitida.`;
        
        const core = this._core || window.uiCore;
        if (core && typeof core.mostrarToast === 'function') {
            core.mostrarToast(mensaje, 'warning');
        }
        
        this._agregarIntervencion({
            id: 'bloqueo_' + Date.now(),
            reglaId: 'bloqueo_modo_guiado',
            prioridad: 'alta',
            mensaje: mensaje,
            opciones: [{ id: 'ok', label: '✅ Entendido', accion: 'descartar' }],
            timestamp: Date.now()
        });
    }

    _getPasoRecomendado() {
        if (window.LearningPath) {
            return window.LearningPath.getPasoActual();
        }
        return null;
    }

    // ============================================================
    // INICIALIZACIÓN PRINCIPAL - V8.5 CORREGIDO
    // ============================================================
    async initTutor() {
        if (this._tutorInitDone) return this;
        if (this._INICIALIZANDO_TUTOR) {
            console.log('⏳ Tutor ya está inicializándose en segundo plano...');
            return this;
        }
        
        this._INICIALIZANDO_TUTOR = true;
        console.log('🧠 Iniciando Tutor de Aprendizaje NeuroAdaptativo V8.5 (CORREGIDO)...');
        
        if (!this._configuracion.modoConfig.espacial) {
            this._configuracion.modoConfig.espacial = {
                permitirIgnorar: true,
                permitirPosponer: true,
                forzarEstudio: false,
                mostrarJustificacion: true,
                bloqueoNavegacion: false,
                modoJeroglifico: false,
                priorizarCaracteres: false,
                priorizarTonos: false,
                modoRadicales: false
            };
            console.log('🔥 modoConfig.espacial creado en initTutor');
        }
        
        if (!this._configuracion.espacial) {
            this._configuracion.espacial = {
                activo: false,
                idiomaJeroglifico: false,
                sistemaRadicales: {
                    activo: true,
                    niveles: ['básico', 'intermedio', 'avanzado'],
                    radicalesPorNivel: {
                        básico: ['人', '口', '日', '月', '木', '水', '火', '土', '金', '心'],
                        intermedio: ['言', '走', '食', '見', '門', '馬', '魚', '鳥', '虫', '龍'],
                        avanzado: ['鬱', '麗', '靈', '鐵', '鐘', '鑑', '鷹', '鷲', '鱗', '龜']
                    }
                },
                sistemaTrazo: {
                    activo: true,
                    ordenTrazo: true,
                    mostrarAnimacion: true,
                    tiposTrazo: ['horizontal', 'vertical', 'curva', 'gancho', 'punto']
                },
                sistemaMnemotecnia: {
                    activo: true,
                    usarHistorias: true,
                    usarImagenes: true,
                    usarEtimologia: true
                },
                sistemaComposicion: {
                    activo: true,
                    descomponerCaracteres: true,
                    mostrarRadicales: true,
                    mostrarComponentes: true
                }
            };
            console.log('🔥 this._configuracion.espacial creado en initTutor');
        }
        
        this._tutorInitDone = true;
        
        setTimeout(async () => {
            try {
                console.log('🧠 Tutor: Ejecutando inicialización en segundo plano...');
                
                if (!this._initDone) {
                    await this.init();
                }
                
                this._inicializarReglas();
                this._cargarConfiguracionPersistida();
                this._inicializarModoEspacial();
                
                await this._actualizarContextoUsuario();
                await this._construirMapaAprendizaje();
                await this._actualizarEstadisticasAvanzadas();
                await this._actualizarProgresoEspacial();
                
                if (!this._eventosRegistrados) {
                    this._registrarEventos();
                    this._eventosRegistrados = true;
                }
                
                this._iniciarCicloAnalisis();
                
                await this._sincronizarConLearningPath();
                
                if (this._modoActual === this._MODOS.GUIADO) {
                    this._iniciarModoGuiado();
                }
                
                if (this._modoActual !== this._MODOS.LIBRE) {
                    setTimeout(() => this._recomendarSiguienteTema(), 3000);
                    setTimeout(() => this._recomendarMicroObjetivo(), 5000);
                    if (this._configuracion.espacial.activo) {
                        setTimeout(() => this._recomendarEspacial(), 6000);
                    }
                } else {
                    console.log('📴 Modo Libre: El tutor no hará recomendaciones automáticas.');
                }
                
                setTimeout(() => this._mostrarBienvenida(), 5000);
                
                // Iniciar refresco automático OBLIGATORIO
                this._iniciarRefrescoAutomatico();
                
                // FORZAR ANÁLISIS AL ENTRAR (SIMULA CLICK EN "Forzar Análisis")
                if (this._forzarAnalisisPendiente && !this._analisisInicialEjecutado) {
                    console.log('🧠 [FORZAR ANÁLISIS] Ejecutando análisis inicial automático (simula click en "Forzar Análisis")...');
                    setTimeout(async () => {
                        try {
                            await this.forzarAnalisis();
                            this._forzarAnalisisPendiente = false;
                            this._analisisInicialEjecutado = true;
                            this._guardarEstadoEnLocalStorage();
                            console.log('✅ [FORZAR ANÁLISIS] Análisis inicial completado automáticamente');
                        } catch (e) {
                            console.warn('⚠️ [FORZAR ANÁLISIS] Error en análisis inicial:', e);
                        }
                    }, 2000);
                }
                
                // Refrescar inmediatamente después de la inicialización
                setTimeout(() => {
                    console.log('🔄 Refresco inicial después de initTutor...');
                    this._refrescarDashboardAutomatico();
                }, 1000);
                
                // Refrescar de nuevo después de 3 segundos para datos perezosos
                setTimeout(() => {
                    console.log('🔄 Refresco de seguridad después de initTutor...');
                    this._refrescarDashboardAutomatico();
                }, 3000);
                
                this._INICIALIZANDO_TUTOR = false;
                console.log('✅ Tutor de Aprendizaje NeuroAdaptativo V8.5 inicializado correctamente');
                console.log('   🧠 Neuro-monitoreo: ' + (this._centinela ? '✅ ACTIVO' : '❌ NO DISPONIBLE'));
                console.log('   🎯 Micro-objetivos: ' + this._mapaAprendizaje.microObjetivos.filter(m => !m.completado).length + ' pendientes');
                console.log('   📚 Biblioteca integrada: ' + this._contextoUsuario.biblioteca.totalHistorias + ' historias disponibles');
                console.log('   🌌 Modo Espacial: ' + (this._configuracion.espacial.activo ? '✅ ACTIVO' : '❌ INACTIVO'));
                console.log('   🔄 Refresco automático OBLIGATORIO: cada ' + this._intervaloRefrescoMs / 1000 + ' segundos');
                console.log('   🔄 Refresco por eventos: ' + this._eventosRefresco.length + ' eventos registrados');
                console.log('   🔄 [FORZAR ANÁLISIS] Análisis automático al entrar: ' + (this._analisisInicialEjecutado ? '✅ EJECUTADO' : '❌ PENDIENTE'));
                
            } catch (error) {
                console.error('❌ Error inicializando Tutor Neuro:', error);
                this._INICIALIZANDO_TUTOR = false;
            }
        }, 500);
        
        return this;
    }

    // ============================================================
    // ACTUALIZAR PROGRESO ESPACIAL
    // ============================================================
    async _actualizarProgresoEspacial() {
        try {
            const idioma = this._obtenerIdiomaActual();
            const esJeroglifico = this._esJeroglifico(idioma);
            
            if (!esJeroglifico || !this._configuracion.espacial.activo) {
                return;
            }
            
            const caracteresData = this._contextoUsuario.caracteres || {};
            const caracteresEstudiados = caracteresData.caracteresEstudiados || 0;
            const caracteresDominados = caracteresData.caracteresDominados || 0;
            
            this._mapaAprendizaje.espacial.caracteresAprendidos = this._mapaAprendizaje.espacial.caracteresAprendidos || [];
            this._mapaAprendizaje.espacial.caracteresDominados = caracteresDominados;
            this._mapaAprendizaje.espacial.caracteresEnProgreso = caracteresEstudiados - caracteresDominados;
            
            localStorage.setItem('pipeline_espacial_progreso', JSON.stringify(this._mapaAprendizaje.espacial));
            
            console.log(`🌌 Progreso espacial: ${caracteresDominados} caracteres dominados, ${this._mapaAprendizaje.espacial.radicalesConocidos?.length || 0} radicales`);
            
        } catch (error) {
            console.warn('⚠️ Error actualizando progreso espacial:', error);
        }
    }

    // ============================================================
    // RECOMENDAR ESPACIAL - V8.5
    // ============================================================
    async _recomendarEspacial() {
        if (!this._configuracion.espacial.activo) return;
        if (this._modoActual === this._MODOS.LIBRE) return;
        
        const idioma = this._obtenerIdiomaActual();
        const esJeroglifico = this._esJeroglifico(idioma);
        
        if (!esJeroglifico) return;
        
        const radicalesConocidos = this._mapaAprendizaje.espacial.radicalesConocidos?.length || 0;
        const caracteresAprendidos = this._mapaAprendizaje.espacial.caracteresAprendidos?.length || 0;
        
        const ultimaRecomendacion = this._historialIntervenciones
            .filter(i => i.reglaId === 'recomendar_radicales' || 
                        i.reglaId === 'recomendar_composicion' ||
                        i.reglaId === 'recomendar_escritura' ||
                        i.reglaId === 'recomendar_mnemotecnia')
            .pop();
        
        if (ultimaRecomendacion && (Date.now() - ultimaRecomendacion.mostrada) < 3600000) return;
        
        let recomendacion = null;
        const random = Math.random();
        
        if (radicalesConocidos < 5 && random < 0.3) {
            recomendacion = {
                id: 'recomendar_radicales_' + Date.now(),
                reglaId: 'recomendar_radicales',
                prioridad: 'media',
                mensaje: `🌀 **Aprende radicales para dominar ${idioma}**\n\nLos radicales son los bloques de construcción de los caracteres. Aprende los ${Math.min(10, 10 - radicalesConocidos)} radicales restantes para construir tu base.\n\n📊 ${radicalesConocidos}/10 radicales básicos aprendidos.`,
                opciones: this._crearOpcionesPorModo([
                    { id: 'ir_radicales', label: '🌀 Ir a Radicales', accion: 'ir_a_caracteres' }
                ], [
                    { id: 'ir_radicales', label: '🌀 Ir a Radicales', accion: 'ir_a_caracteres' },
                    { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                    { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
                ]),
                timestamp: Date.now(),
                contexto: { 
                    idioma: idioma, 
                    radicalesAprendidos: radicalesConocidos,
                    radicalesPorNivel: 10 - radicalesConocidos
                }
            };
        } else if (caracteresAprendidos > 3 && random < 0.3) {
            recomendacion = {
                id: 'recomendar_mnemotecnia_' + Date.now(),
                reglaId: 'recomendar_mnemotecnia',
                prioridad: 'media',
                mensaje: `🧠 **Crea historias mnemotécnicas**\n\nLas historias visuales te ayudan a recordar caracteres mediante asociaciones. ¡Crea tu primera historia hoy!\n\n📊 ${this._mapaAprendizaje.espacial.historiasMnemotecnicas?.length || 0} historias creadas.`,
                opciones: this._crearOpcionesPorModo([
                    { id: 'ir_mnemotecnia', label: '🧠 Ir a Mnemotecnia', accion: 'ir_a_caracteres' }
                ], [
                    { id: 'ir_mnemotecnia', label: '🧠 Ir a Mnemotecnia', accion: 'ir_a_caracteres' },
                    { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                    { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
                ]),
                timestamp: Date.now(),
                contexto: { historiasCreadas: this._mapaAprendizaje.espacial.historiasMnemotecnicas?.length || 0 }
            };
        } else {
            recomendacion = {
                id: 'recomendar_escritura_' + Date.now(),
                reglaId: 'recomendar_escritura',
                prioridad: 'media',
                mensaje: `✍️ **Practica la escritura de caracteres**\n\nEl orden de trazos es fundamental para escribir correctamente. Practica con caracteres básicos.\n\n📊 ${this._mapaAprendizaje.espacial.trazosPracticados?.length || 0} trazos practicados.`,
                opciones: this._crearOpcionesPorModo([
                    { id: 'ir_escritura', label: '✍️ Ir a Escritura', accion: 'ir_a_caracteres' }
                ], [
                    { id: 'ir_escritura', label: '✍️ Ir a Escritura', accion: 'ir_a_caracteres' },
                    { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                    { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
                ]),
                timestamp: Date.now(),
                contexto: { trazosPracticados: this._mapaAprendizaje.espacial.trazosPracticados?.length || 0 }
            };
        }
        
        if (recomendacion) {
            this._agregarIntervencion(recomendacion);
        }
    }

    // ============================================================
    // SINCRONIZAR CON LEARNING PATH
    // ============================================================
    async _sincronizarConLearningPath() {
        try {
            if (!window.LearningPath) {
                console.warn('⚠️ Learning Path no disponible para sincronizar');
                return;
            }

            if (!window.LearningPath._initDone) {
                await window.LearningPath.init(this._core);
            }

            const ruta = window.LearningPath.getRutaCompleta();
            const pasoActual = window.LearningPath.getPasoActual();

            if (ruta && ruta.length > 0) {
                console.log(`🧠 Tutor Neuro sincronizado con Learning Path: ${ruta.length} pasos`);
                
                this._mapaAprendizaje.rutaActual = ruta.map(paso => ({
                    id: paso.id || paso.tipo + '_' + Date.now(),
                    nombre: paso.titulo || paso.nombre || paso.tema || 'Paso sin título',
                    titulo: paso.titulo || paso.nombre || paso.tema || 'Paso sin título',
                    nivel: paso.nivel || this._contextoUsuario.nivel,
                    completado: paso.completado || false,
                    porcentaje: paso.porcentaje || 0,
                    tipo: paso.tipo,
                    accion: paso.accion,
                    descripcion: paso.descripcion || '',
                    icono: paso.icono || '📌',
                    historias: paso.historias || 0
                }));

                const progreso = window.LearningPath.getProgreso();
                this._mapaAprendizaje.progresoGeneral = progreso.porcentaje || 0;

                if (pasoActual && this._modoActual !== this._MODOS.LIBRE) {
                    const nombrePaso = pasoActual.titulo || pasoActual.nombre || pasoActual.tema || 'Paso actual';
                    this._agregarIntervencion({
                        id: 'learning_path_paso_' + Date.now(),
                        reglaId: 'learning_path_paso',
                        prioridad: 'media',
                        mensaje: `🧭 **Paso actual de tu ruta:** "${nombrePaso}"\n\n${pasoActual.descripcion || ''}\n📊 Progreso: ${progreso.porcentaje || 0}% (${progreso.completados || 0}/${progreso.total || 0} pasos)`,
                        opciones: this._crearOpcionesPorModo([
                            { id: 'ejecutar_paso', label: '▶️ Ir al paso', accion: 'ejecutar_paso_learning_path' }
                        ], [
                            { id: 'ejecutar_paso', label: '▶️ Ir al paso', accion: 'ejecutar_paso_learning_path' },
                            { id: 'ver_ruta', label: '🗺️ Ver ruta completa', accion: 'ver_ruta' },
                            { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                            { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
                        ]),
                        timestamp: Date.now(),
                        contexto: { paso: pasoActual, progreso: progreso }
                    });
                    
                    if (this._modoActual === this._MODOS.GUIADO) {
                        const pendientes = this._intervencionesPendientes;
                        if (pendientes.length > 0) {
                            this._mostrarIntervencion(pendientes[pendientes.length - 1]);
                        }
                    }
                }

                window.dispatchEvent(new CustomEvent('tutorLearningPathSincronizado', {
                    detail: { ruta: ruta, pasoActual: pasoActual, progreso: progreso }
                }));
            }

        } catch (error) {
            console.warn('⚠️ Error sincronizando con Learning Path:', error);
        }
    }

    // ============================================================
    // ACTUALIZAR CONTEXTO DEL USUARIO - V8.5
    // ============================================================
    async _actualizarContextoUsuario() {
        console.log('🧠 Actualizando contexto del usuario (análisis profundo V8.5)...');
        
        try {
            const usuario = await db.getUsuario();
            const stats = await db.obtenerEstadisticasNeuro();
            const infoActivo = gestorIdiomas?.getInfoActivo();
            const progreso = await db.obtenerTodoProgreso();
            const idiomaActual = this._obtenerIdiomaActual();
            
            const fechas = progreso.map(p => new Date(p.ultimoRepaso).toDateString());
            const uniqueFechas = [...new Set(fechas)].sort();
            let racha = 0;
            for (let i = uniqueFechas.length - 1; i >= 0; i--) {
                const fecha = new Date(uniqueFechas[i]);
                const diff = Math.floor((Date.now() - fecha.getTime()) / 86400000);
                if (diff === racha) { racha++; } else { break; }
            }
            
            let neuroData = { fatiga: 0, eficiencia: 0, concentracion: 0.7 };
            if (this._centinela) {
                try {
                    let estadoCentinela = null;
                    if (typeof this._centinela.getEstado === 'function') {
                        estadoCentinela = this._centinela.getEstado();
                    } else if (this._centinela.contadores) {
                        estadoCentinela = this._centinela.contadores;
                    } else if (this._centinela.estado) {
                        estadoCentinela = this._centinela.estado;
                    } else {
                        estadoCentinela = this._centinela;
                    }
                    
                    if (estadoCentinela) {
                        neuroData.fatiga = estadoCentinela.neuroFatiga || 0;
                        neuroData.eficiencia = estadoCentinela.eficiencia || 0;
                        neuroData.concentracion = Math.max(0.3, 1 - (neuroData.fatiga * 0.7));
                    }
                } catch (e) {
                    console.warn('⚠️ Error obteniendo estado de Centinela:', e);
                }
            }
            
            this._contextoUsuario = {
                ...this._contextoUsuario,
                nivel: infoActivo?.nivel || 'A1',
                idioma: idiomaActual,
                idiomaNativo: usuario?.idiomaNativo || 'español',
                nombre: usuario?.nombre || 'Usuario',
                racha: racha || 0,
                neuroScore: stats.neuroScore || 0,
                eficiencia: stats.eficiencia || neuroData.eficiencia || 0,
                faseActual: pipeline?.faseActual || 1,
                frasesCompletadas: stats.progreso || 0,
                totalFrases: stats.totalFrases || 0,
                tiempoEstudioHoy: this._calcularTiempoEstudioHoy(),
                tiempoEstudioTotal: this._calcularTiempoEstudioTotal(),
                sesionesHoy: this._calcularSesionesHoy()
            };
            
            const todosLosTemas = await db.obtenerTemasPorIdioma(idiomaActual);
            let temasCompletados = 0, temasEnProgreso = 0, temasSinIniciar = 0, progresoPromedio = 0, temasEstancados = [], temasPorNivel = {};
            
            for (const tema of todosLosTemas) {
                const progresoTema = await db.obtenerProgresoTema(tema.id);
                const pct = progresoTema.progreso || 0;
                if (!temasPorNivel[tema.nivel]) temasPorNivel[tema.nivel] = 0;
                temasPorNivel[tema.nivel]++;
                if (tema.estado === 'completado' || tema._completado === true) {
                    temasCompletados++;
                } else if (pct > 0) {
                    temasEnProgreso++;
                    if (pct < 30) temasEstancados.push(tema);
                } else {
                    temasSinIniciar++;
                }
                progresoPromedio += pct;
            }
            progresoPromedio = todosLosTemas.length > 0 ? progresoPromedio / todosLosTemas.length : 0;
            
            const temasPendientes = todosLosTemas.filter(t => t.estado !== 'completado' && t._completado !== true);
            let siguienteTema = null, temaRecomendado = null;
            if (temasPendientes.length > 0) {
                const enProgresoList = temasPendientes.filter(t => { const p = t._progreso || 0; return p > 0 && p < 100; });
                if (enProgresoList.length > 0) {
                    enProgresoList.sort((a, b) => (a._progreso || 0) - (b._progreso || 0));
                    siguienteTema = enProgresoList[0];
                    temaRecomendado = enProgresoList[0];
                } else {
                    const sinIniciarList = temasPendientes.filter(t => (t._progreso || 0) === 0);
                    if (sinIniciarList.length > 0) {
                        siguienteTema = sinIniciarList[0];
                        temaRecomendado = sinIniciarList[0];
                    }
                }
            }
            
            this._contextoUsuario.temas = {
                total: todosLosTemas.length,
                completados: temasCompletados,
                enProgreso: temasEnProgreso,
                pendientes: temasPendientes.length,
                sinIniciar: temasSinIniciar,
                siguienteTema: siguienteTema,
                ultimoTema: null,
                temaRecomendado: temaRecomendado,
                progresoPromedio: Math.round(progresoPromedio),
                temasPorNivel: temasPorNivel,
                ultimoTemaEstudiado: null,
                fechaUltimoTema: null,
                temasEstancados: temasEstancados,
                temasRecomendadosPrioridad: temasPendientes.slice(0, 3)
            };
            
            let elipseData = { activa: false, totalOndas: 0, ondasCompletadas: 0, ondasPendientes: 0, ondasEnCurso: 0, siguienteOnda: null, progreso: 0, ultimaOndaGenerada: null, fechaUltimaOnda: null, ondasPorNivel: {}, palabrasNuevasTotales: 0, palabrasConsolidadas: 0, ondasRecomendadas: [], necesitaNuevaOnda: false };
            
            if (window.modoElipse) {
                await window.modoElipse.cargarDatos();
                const estadoElipse = window.modoElipse.getEstado();
                if (estadoElipse && estadoElipse.totalOndas > 0) {
                    const historias = window.modoElipse.getHistoriasElipse(estadoElipse.temaId) || [];
                    const completadas = historias.filter(h => h.completada).length;
                    const pendientes = historias.length - completadas;
                    elipseData = {
                        activa: true,
                        totalOndas: historias.length,
                        ondasCompletadas: completadas,
                        ondasPendientes: pendientes,
                        ondasEnCurso: historias.filter(h => !h.completada && h.rcnPromedio > 0).length,
                        siguienteOnda: historias.find(h => !h.completada),
                        progreso: historias.length > 0 ? Math.round((completadas / historias.length) * 100) : 0,
                        ultimaOndaGenerada: historias[historias.length - 1],
                        fechaUltimaOnda: historias[historias.length - 1]?.fecha || null,
                        ondasPorNivel: this._agruparPorNivel(historias),
                        palabrasNuevasTotales: historias.reduce((acc, h) => acc + (h.palabrasNuevas?.length || 0), 0),
                        palabrasConsolidadas: window.modoElipse._estadisticas?.palabrasConsolidadas || 0,
                        ondasRecomendadas: historias.filter(h => !h.completada && h.rcnPromedio < 2),
                        necesitaNuevaOnda: historias.length > 0 && completadas === historias.length
                    };
                }
            }
            this._contextoUsuario.elipse = elipseData;
            
            let ondasCruzadasData = { grafoSize: 0, ondasTotales: 0, interferencias: 0, temasConectados: [], conexionesFuertes: 0, conexionesDebiles: 0, ultimaOndaCruzada: null, fechaUltimaOndaCruzada: null, ondasCruzadasPendientes: 0, recomendarOndaCruzada: false };
            
            if (window.modoOndasCruzadas) {
                const estadoOC = window.modoOndasCruzadas.getEstado();
                if (estadoOC) {
                    const grafo = window.modoOndasCruzadas.getGrafoElipse() || {};
                    const interferencias = window.modoOndasCruzadas.getInterferencias() || {};
                    let conexionesFuertes = 0, conexionesDebiles = 0, temasConectados = [];
                    for (const [temaId, data] of Object.entries(interferencias)) {
                        if (data.temasConectados) {
                            temasConectados.push(temaId);
                            for (const conectado of data.temasConectados) {
                                const peso = data.pesos?.[conectado] || 0;
                                if (peso > 0.5) conexionesFuertes++;
                                else conexionesDebiles++;
                            }
                        }
                    }
                    ondasCruzadasData = {
                        grafoSize: Object.keys(grafo).length,
                        ondasTotales: estadoOC.ondasTotales || 0,
                        interferencias: estadoOC.interferencias || 0,
                        temasConectados: temasConectados,
                        conexionesFuertes: conexionesFuertes,
                        conexionesDebiles: conexionesDebiles,
                        ultimaOndaCruzada: null,
                        fechaUltimaOndaCruzada: null,
                        ondasCruzadasPendientes: 0,
                        recomendarOndaCruzada: estadoOC.grafoSize >= 2 && estadoOC.ondasTotales < 5
                    };
                }
            }
            this._contextoUsuario.ondasCruzadas = ondasCruzadasData;
            
            let caracteresData = { 
                totalCaracteres: 0, 
                caracteresEstudiados: 0, 
                caracteresDominados: 0, 
                caracteresEnProgreso: 0, 
                caracteresNuevos: 0, 
                siguienteCaracter: null, 
                familiasEstudiadas: [], 
                progresoPorFamilia: {}, 
                caracteresRecomendados: [], 
                necesitaPracticarCaracteres: false,
                radicalesAprendidos: [],
                trazosPracticados: 0,
                composiciones: [],
                historiasMnemotecnicas: [],
                nivelRadical: 'básico'
            };
            
            const esJeroglifico = this._esJeroglifico(idiomaActual);
            if (esJeroglifico && this._configuracion.espacial.activo) {
                try {
                    const radicalesData = this._mapaAprendizaje.espacial.radicalesConocidos || [];
                    caracteresData.radicalesAprendidos = radicalesData;
                    
                    const trazosData = this._mapaAprendizaje.espacial.trazosPracticados || [];
                    caracteresData.trazosPracticados = trazosData.length;
                    
                    const composicionesData = this._mapaAprendizaje.espacial.composicionesEstudiadas || [];
                    caracteresData.composiciones = composicionesData;
                    
                    const historiasData = this._mapaAprendizaje.espacial.historiasMnemotecnicas || [];
                    caracteresData.historiasMnemotecnicas = historiasData;
                    
                    caracteresData.nivelRadical = this._mapaAprendizaje.espacial.nivelRadical || 'básico';
                    
                    if (window.UICaracteres) {
                        try {
                            const familias = await db.obtenerFamiliasCaracteres(idiomaActual);
                            const caracteres = familias.map(f => f.caracterRaiz).filter(c => c);
                            let estudiados = 0, dominados = 0, enProgreso = 0, nuevos = 0;
                            for (const c of caracteres) {
                                const rcn = c.neuroScore || 0;
                                if (rcn >= 4) { dominados++; estudiados++; }
                                else if (rcn > 0) { enProgreso++; estudiados++; }
                                else { nuevos++; }
                            }
                            const familiasEstudiadas = new Set();
                            const progresoPorFamilia = {};
                            for (const f of familias) {
                                const familia = f.caracterRaiz?._familia || 'General';
                                familiasEstudiadas.add(familia);
                                const count = f.palabrasDerivadas?.length || 0;
                                progresoPorFamilia[familia] = (progresoPorFamilia[familia] || 0) + count;
                            }
                            caracteresData.totalCaracteres = caracteres.length;
                            caracteresData.caracteresEstudiados = estudiados;
                            caracteresData.caracteresDominados = dominados;
                            caracteresData.caracteresEnProgreso = enProgreso;
                            caracteresData.caracteresNuevos = nuevos;
                            caracteresData.siguienteCaracter = caracteres.find(c => (c.neuroScore || 0) === 0);
                            caracteresData.familiasEstudiadas = Array.from(familiasEstudiadas);
                            caracteresData.progresoPorFamilia = progresoPorFamilia;
                            caracteresData.caracteresRecomendados = caracteres.filter(c => (c.neuroScore || 0) < 3 && (c.neuroScore || 0) > 0).slice(0, 3);
                            caracteresData.necesitaPracticarCaracteres = nuevos > 3 || enProgreso > 5;
                        } catch (e) { console.warn('⚠️ Error analizando caracteres:', e); }
                    }
                } catch (e) { console.warn('⚠️ Error analizando caracteres espaciales:', e); }
            }
            this._contextoUsuario.caracteres = caracteresData;
            
            // ============================================================
            // TONOS - CORREGIDO: Verificar existencia de window.UITonos y sus métodos
            // ============================================================
            let tonosData = { 
                totalHistorias: 0, 
                historiasLeidas: 0, 
                historiasGuardadas: 0, 
                historiasCompletadas: 0, 
                caracterActual: null, 
                tieneHistoriasPendientes: false, 
                tonosPracticados: [], 
                progresoTonos: 0, 
                necesitaPracticarTonos: false, 
                ultimaHistoriaTonal: null 
            };
            
            const esTonal = this._esTonal(idiomaActual);
            if (esTonal && window.UITonos) {
                try {
                    // Verificar que el método existe antes de llamarlo
                    if (typeof window.UITonos._cargarEstadoPorIdioma === 'function') {
                        await window.UITonos._cargarEstadoPorIdioma(idiomaActual);
                    } else {
                        console.warn('⚠️ window.UITonos._cargarEstadoPorIdioma no es una función, usando datos disponibles');
                        // Intentar usar datos existentes de localStorage
                        try {
                            const tonosStorage = localStorage.getItem('pipeline_tonos_estado');
                            if (tonosStorage) {
                                const tonosDataStorage = JSON.parse(tonosStorage);
                                if (tonosDataStorage && tonosDataStorage[idiomaActual]) {
                                    const data = tonosDataStorage[idiomaActual];
                                    tonosData.totalHistorias = data.totalHistorias || 0;
                                    tonosData.historiasLeidas = data.historiasLeidas || 0;
                                    tonosData.historiasGuardadas = data.historiasGuardadas || 0;
                                    tonosData.historiasCompletadas = data.historiasCompletadas || 0;
                                    tonosData.caracterActual = data.caracterActual || null;
                                    tonosData.tonosPracticados = data.tonosPracticados || [];
                                    tonosData.progresoTonos = data.progresoTonos || 0;
                                    tonosData.necesitaPracticarTonos = data.necesitaPracticarTonos || false;
                                    console.log('📌 Datos de tonos cargados desde localStorage');
                                }
                            }
                        } catch (storageError) {
                            console.warn('⚠️ Error cargando datos de tonos desde localStorage:', storageError);
                        }
                    }
                    
                    // Si _historiasPorCaracter existe, usarlo para obtener datos adicionales
                    if (window.UITonos._historiasPorCaracter) {
                        const totalHistorias = Object.values(window.UITonos._historiasPorCaracter || {}).reduce((acc, arr) => acc + arr.length, 0);
                        if (totalHistorias > 0) {
                            const leidas = window.UITonos._historiasLeidas?.size || 0;
                            const guardadas = Object.values(window.UITonos._historiasGuardadas || {}).filter(v => v).length;
                            const completadas = Object.values(window.UITonos._historiasPorCaracter || {}).reduce((acc, arr) => acc + arr.filter(h => h.completada).length, 0);
                            const tonosPracticados = new Set();
                            for (const key in window.UITonos._historiasPorCaracter || {}) {
                                for (const h of window.UITonos._historiasPorCaracter[key]) {
                                    if (h.tono) tonosPracticados.add(h.tono);
                                }
                            }
                            tonosData = {
                                totalHistorias: totalHistorias || tonosData.totalHistorias,
                                historiasLeidas: leidas || tonosData.historiasLeidas,
                                historiasGuardadas: guardadas || tonosData.historiasGuardadas,
                                historiasCompletadas: completadas || tonosData.historiasCompletadas,
                                caracterActual: window.UITonos._caracterActual || tonosData.caracterActual,
                                tieneHistoriasPendientes: (totalHistorias || 0) > (leidas || 0),
                                tonosPracticados: Array.from(tonosPracticados).length > 0 ? Array.from(tonosPracticados) : tonosData.tonosPracticados,
                                progresoTonos: (totalHistorias || 0) > 0 ? Math.round(((leidas || 0) / (totalHistorias || 1)) * 100) : tonosData.progresoTonos,
                                necesitaPracticarTonos: (totalHistorias || 0) < 3 && (leidas || 0) < 3,
                                ultimaHistoriaTonal: tonosData.ultimaHistoriaTonal || null
                            };
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Error analizando tonos:', e);
                    // Mantener los datos predeterminados
                }
            } else if (esTonal && !window.UITonos) {
                console.warn('⚠️ window.UITonos no está disponible, pero el idioma es tonal');
                // Intentar cargar desde localStorage
                try {
                    const tonosStorage = localStorage.getItem('pipeline_tonos_estado');
                    if (tonosStorage) {
                        const tonosDataStorage = JSON.parse(tonosStorage);
                        if (tonosDataStorage && tonosDataStorage[idiomaActual]) {
                            const data = tonosDataStorage[idiomaActual];
                            tonosData.totalHistorias = data.totalHistorias || 0;
                            tonosData.historiasLeidas = data.historiasLeidas || 0;
                            tonosData.historiasGuardadas = data.historiasGuardadas || 0;
                            tonosData.historiasCompletadas = data.historiasCompletadas || 0;
                            tonosData.caracterActual = data.caracterActual || null;
                            tonosData.tonosPracticados = data.tonosPracticados || [];
                            tonosData.progresoTonos = data.progresoTonos || 0;
                            tonosData.necesitaPracticarTonos = data.necesitaPracticarTonos || false;
                            console.log('📌 Datos de tonos cargados desde localStorage (UITonos no disponible)');
                        }
                    }
                } catch (storageError) {
                    console.warn('⚠️ Error cargando datos de tonos desde localStorage:', storageError);
                }
            }
            this._contextoUsuario.tonos = tonosData;
            
            const frases = pipeline?.frases || [];
            const frasesCompletadas = frases.filter(f => { const prog = f.progreso || {}; return prog.estado === 'completada' || (prog.rcn || 0) >= 4; }).length;
            const frasesEnCurso = frases.filter(f => { const prog = f.progreso || {}; return prog.rcn > 0 && prog.rcn < 4; }).length;
            const frasesNuevas = frases.filter(f => { const prog = f.progreso || {}; return (prog.rcn || 0) === 0; }).length;
            const rcnPromedio = frases.reduce((acc, f) => acc + (f.progreso?.rcn || 0), 0) / (frases.length || 1);
            const fasePromedio = frases.reduce((acc, f) => acc + (f.progreso?.fase || 1), 0) / (frases.length || 1);
            const frasesDebiles = frases.filter(f => (f.progreso?.rcn || 0) < 2 && (f.progreso?.rcn || 0) > 0);
            const frasesFuertes = frases.filter(f => (f.progreso?.rcn || 0) >= 4);
            const palabrasAprendidas = frases.reduce((acc, f) => acc + (f.palabras?.length || 0), 0);
            
            this._contextoUsuario.pipeline = {
                frasesTotales: frases.length,
                frasesCompletadas: frasesCompletadas,
                frasesEnCurso: frasesEnCurso,
                frasesNuevas: frasesNuevas,
                progreso: frases.length > 0 ? Math.round((frasesCompletadas / frases.length) * 100) : 0,
                rcnPromedio: Math.round(rcnPromedio * 10) / 10,
                fasePromedio: Math.round(fasePromedio * 10) / 10,
                eficiencia: stats.eficiencia || neuroData.eficiencia || 0,
                palabrasAprendidas: palabrasAprendidas,
                palabrasPendientes: 0,
                necesitaRepaso: frasesDebiles.length > 3,
                frasesDebiles: frasesDebiles.slice(0, 5),
                frasesFuertes: frasesFuertes.slice(0, 5)
            };
            
            let bibliotecaData = { 
                totalHistorias: 0, 
                leidas: 0, 
                completadas: 0, 
                enCurso: 0, 
                porTema: {}, 
                progresoLectura: 0,
                favoritas: 0,
                tiempoLectura: 0,
                ultimaLectura: null,
                generosPreferidos: [],
                recomendaciones: []
            };
            
            if (window.UIBiblioteca) {
                try {
                    const historias = await window.UIBiblioteca._obtenerTodasLasHistorias();
                    const leidas = window.UIBiblioteca._historiasLeidas?.size || 0;
                    const completadas = historias.filter(h => h._progreso?.completada).length;
                    const enCurso = historias.filter(h => !h._progreso?.completada && h._progreso?.porcentaje > 0).length;
                    const favoritas = historias.filter(h => h._favorita).length || 0;
                    const tiempoLectura = historias.reduce((acc, h) => acc + (h._tiempoLectura || 0), 0);
                    
                    const porTema = {};
                    const generosSet = new Set();
                    for (const h of historias) {
                        const tema = h._temaNombre || 'Sin tema';
                        if (!porTema[tema]) porTema[tema] = { total: 0, leidas: 0, completadas: 0 };
                        porTema[tema].total++;
                        if (h._leida) porTema[tema].leidas++;
                        if (h._progreso?.completada) porTema[tema].completadas++;
                        if (h._genero) generosSet.add(h._genero);
                    }
                    
                    const sinLeer = historias.filter(h => !h._leida);
                    const recomendaciones = sinLeer
                        .sort((a, b) => (a._popularidad || 0) - (b._popularidad || 0))
                        .slice(0, 3)
                        .map(h => h._titulo || 'Historia sin título');
                    
                    const ultimaLectura = historias
                        .filter(h => h._ultimaLectura)
                        .sort((a, b) => new Date(b._ultimaLectura) - new Date(a._ultimaLectura))[0];
                    
                    bibliotecaData = {
                        totalHistorias: historias.length,
                        leidas: leidas,
                        completadas: completadas,
                        enCurso: enCurso,
                        porTema: porTema,
                        progresoLectura: historias.length > 0 ? Math.round((leidas / historias.length) * 100) : 0,
                        favoritas: favoritas,
                        tiempoLectura: tiempoLectura,
                        ultimaLectura: ultimaLectura ? ultimaLectura._titulo : null,
                        generosPreferidos: Array.from(generosSet).slice(0, 5),
                        recomendaciones: recomendaciones
                    };
                } catch (e) { console.warn('⚠️ Error analizando biblioteca:', e); }
            }
            this._contextoUsuario.biblioteca = bibliotecaData;
            
            const progresoGlobal = this._contextoUsuario.temas.progresoPromedio || 0;
            const elipseProgreso = this._contextoUsuario.elipse.progreso || 0;
            const pipelineProgreso = this._contextoUsuario.pipeline.progreso || 0;
            
            let tendencia = 'estable', urgencia = 'baja', velocidadAprendizaje = 0, puntosFuertes = [], puntosDebiles = [], recomendacionPrincipal = '';
            
            if (progresoGlobal > 70) tendencia = 'mejorando';
            else if (progresoGlobal < 30) tendencia = 'empeorando';
            
            if (this._contextoUsuario.temas.estancamiento > 0 || frasesDebiles.length > 5) { urgencia = 'alta'; }
            else if (this._contextoUsuario.temas.sinIniciar > 3 || frasesNuevas > 10) { urgencia = 'media'; }
            
            velocidadAprendizaje = Math.round((this._contextoUsuario.frasesCompletadas / (this._contextoUsuario.tiempoEstudioTotal / 3600)) * 10) / 10;
            
            if (elipseProgreso > 50) puntosFuertes.push('Elipse');
            if (pipelineProgreso > 50) puntosFuertes.push('Pipeline');
            if (this._contextoUsuario.caracteres.caracteresDominados > 3) puntosFuertes.push('Caracteres');
            if (this._contextoUsuario.biblioteca.progresoLectura > 50) puntosFuertes.push('Biblioteca');
            if (this._contextoUsuario.ondasCruzadas.ondasTotales > 3) puntosFuertes.push('Ondas Cruzadas');
            if (esJeroglifico && this._contextoUsuario.caracteres.radicalesAprendidos?.length > 5) puntosFuertes.push('Radicales');
            
            if (frasesDebiles.length > 3) puntosDebiles.push('Repaso de frases');
            if (this._contextoUsuario.temas.sinIniciar > 2) puntosDebiles.push('Nuevos temas');
            if (this._contextoUsuario.elipse.necesitaNuevaOnda) puntosDebiles.push('Elipse (nuevas ondas)');
            if (this._contextoUsuario.biblioteca.progresoLectura < 30 && this._contextoUsuario.biblioteca.totalHistorias > 0) puntosDebiles.push('Lectura');
            if (this._contextoUsuario.tonos.necesitaPracticarTonos) puntosDebiles.push('Práctica de tonos');
            if (esJeroglifico && this._contextoUsuario.caracteres.radicalesAprendidos?.length < 5) puntosDebiles.push('Radicales básicos');
            if (esJeroglifico && this._contextoUsuario.caracteres.caracteresDominados < 5) puntosDebiles.push('Caracteres básicos');
            
            if (frasesDebiles.length > 3) {
                recomendacionPrincipal = 'Repasa las frases con RCN bajo en el módulo de estudio.';
            } else if (this._contextoUsuario.temas.sinIniciar > 2) {
                recomendacionPrincipal = `Comienza un nuevo tema: "${this._contextoUsuario.temas.temaRecomendado?.nombre || 'cualquier tema pendiente'}"`;
            } else if (this._contextoUsuario.elipse.necesitaNuevaOnda) {
                recomendacionPrincipal = 'Genera una nueva onda en el Modo Elipse para expandir tu conocimiento.';
            } else if (this._contextoUsuario.ondasCruzadas.recomendarOndaCruzada) {
                recomendacionPrincipal = 'Explora el Modo Ondas Cruzadas para conectar diferentes temas.';
            } else if (this._contextoUsuario.biblioteca.progresoLectura < 30 && this._contextoUsuario.biblioteca.totalHistorias > 0) {
                recomendacionPrincipal = 'Lee algunas historias en la Biblioteca para mejorar tu comprensión.';
            } else if (esJeroglifico && this._contextoUsuario.caracteres.radicalesAprendidos?.length < 5) {
                recomendacionPrincipal = 'Aprende radicales básicos para construir tu base de caracteres.';
            } else if (esJeroglifico && this._contextoUsuario.caracteres.caracteresDominados < 5) {
                recomendacionPrincipal = 'Estudia caracteres básicos en el modo espacial.';
            } else {
                const microPendientes = this._mapaAprendizaje.microObjetivos.filter(m => !m.completado);
                if (microPendientes.length > 0) {
                    recomendacionPrincipal = `Completa tu micro-objetivo: "${microPendientes[0].titulo}"`;
                } else {
                    recomendacionPrincipal = 'Sigue tu ritmo de aprendizaje. El Tutor está aquí para ayudarte.';
                }
            }
            
            this._contextoUsuario.analisisProgreso = {
                tendencia: tendencia,
                velocidadAprendizaje: velocidadAprendizaje,
                puntosFuertes: puntosFuertes,
                puntosDebiles: puntosDebiles,
                recomendacionPrincipal: recomendacionPrincipal,
                urgencia: urgencia,
                siguienteHito: this._calcularSiguienteHito(),
                tiempoEstimadoSiguienteHito: 0
            };
            
            const fatiga = neuroData.fatiga || 0;
            const motivacion = Math.min(1, 0.5 + (this._contextoUsuario.racha / 30) * 0.3 + (this._contextoUsuario.temas.completados / 10) * 0.2);
            const concentracion = neuroData.concentracion || Math.max(0.3, 1 - fatiga * 0.7);
            const confianza = Math.min(1, 0.3 + (this._contextoUsuario.pipeline.rcnPromedio / 5) * 0.4 + (this._contextoUsuario.caracteres.caracteresDominados / 10) * 0.3);
            
            this._contextoUsuario.estadoCognitivo = {
                fatiga: fatiga,
                motivacion: motivacion,
                concentracion: concentracion,
                confianza: confianza,
                nivelEstrés: Math.max(0, 0.2 - confianza * 0.3 + fatiga * 0.3),
                ultimoCambio: Date.now()
            };
            
            await this._verificarLogros();
            await this._actualizarMicroObjetivos();
            await this._verificarNuevasRecomendacionesBiblioteca();
            await this._actualizarProgresoEspacial();
            
            // Guardar estado en localStorage después de actualizar contexto
            this._guardarEstadoEnLocalStorage();
            
            console.log('✅ Contexto del usuario actualizado (análisis profundo V8.5)');
            console.log(`   📊 Progreso general: ${progresoGlobal}%`);
            console.log(`   🎯 Recomendación: ${recomendacionPrincipal}`);
            console.log(`   📌 Urgencia: ${urgencia}`);
            console.log(`   📚 Biblioteca: ${this._contextoUsuario.biblioteca.leidas}/${this._contextoUsuario.biblioteca.totalHistorias} leídas`);
            console.log(`   🧠 Neuro-fatiga: ${Math.round(fatiga * 100)}%`);
            console.log(`   🌌 Modo Espacial: ${this._configuracion.espacial.activo ? '✅ ACTIVO' : '❌ INACTIVO'}`);
            
        } catch (error) {
            console.error('❌ Error actualizando contexto del usuario:', error);
        }
    }

    // ============================================================
    // VERIFICAR LOGROS - V8.5 CORREGIDO
    // ============================================================
    async _verificarLogros() {
        const logrosDesbloqueados = this._mapaAprendizaje.logrosDesbloqueados || [];
        const nuevosLogros = [];
        
        for (const [id, logro] of Object.entries(this._LOGROS)) {
            if (logrosDesbloqueados.includes(id)) continue;
            let desbloqueado = false;
            
            switch (id) {
                case 'primer_estudio': desbloqueado = this._contextoUsuario.frasesCompletadas >= 1; break;
                case 'racha_3': desbloqueado = this._contextoUsuario.racha >= 3; break;
                case 'racha_7': desbloqueado = this._contextoUsuario.racha >= 7; break;
                case 'racha_30': desbloqueado = this._contextoUsuario.racha >= 30; break;
                case '10_frases': desbloqueado = this._contextoUsuario.frasesCompletadas >= 10; break;
                case '50_frases': desbloqueado = this._contextoUsuario.frasesCompletadas >= 50; break;
                case '100_frases': desbloqueado = this._contextoUsuario.frasesCompletadas >= 100; break;
                case '500_frases': desbloqueado = this._contextoUsuario.frasesCompletadas >= 500; break;
                case 'tema_completado': desbloqueado = this._contextoUsuario.temas.completados >= 1; break;
                case '3_temas': desbloqueado = this._contextoUsuario.temas.completados >= 3; break;
                case '10_temas': desbloqueado = this._contextoUsuario.temas.completados >= 10; break;
                case 'onda_elipse': desbloqueado = this._contextoUsuario.elipse.totalOndas >= 1; break;
                case '5_ondas': desbloqueado = this._contextoUsuario.elipse.totalOndas >= 5; break;
                case 'onda_cruzada': desbloqueado = this._contextoUsuario.ondasCruzadas.ondasTotales >= 1; break;
                case '5_cruzadas': desbloqueado = this._contextoUsuario.ondasCruzadas.ondasTotales >= 5; break;
                case 'caracter_estudiado': desbloqueado = this._contextoUsuario.caracteres.caracteresEstudiados >= 1; break;
                case '10_caracteres': desbloqueado = this._contextoUsuario.caracteres.caracteresEstudiados >= 10; break;
                case 'tono_practicado': desbloqueado = this._contextoUsuario.tonos.tonosPracticados.length >= 1; break;
                case '5_tonos': desbloqueado = this._contextoUsuario.tonos.tonosPracticados.length >= 5; break;
                case 'experto': desbloqueado = this._contextoUsuario.nivel === 'C1'; break;
                case 'maestro': desbloqueado = this._contextoUsuario.nivel === 'C2'; break;
                case 'biblioteca_10': desbloqueado = this._contextoUsuario.biblioteca.leidas >= 10; break;
                case 'biblioteca_50': desbloqueado = this._contextoUsuario.biblioteca.leidas >= 50; break;
                case 'biblioteca_completa': desbloqueado = this._contextoUsuario.biblioteca.totalHistorias > 0 && this._contextoUsuario.biblioteca.leidas >= this._contextoUsuario.biblioteca.totalHistorias; break;
                case 'micro_objetivo': desbloqueado = this._mapaAprendizaje.microObjetivos.filter(m => m.completado).length >= 1; break;
                case '10_micro_objetivos': desbloqueado = this._mapaAprendizaje.microObjetivos.filter(m => m.completado).length >= 10; break;
                case 'aprendizaje_acelerado': 
                    try {
                        const historial = JSON.parse(localStorage.getItem('pipeline_historial_progreso') || '{}');
                        const fechas = Object.keys(historial).sort();
                        let frasesUltimaSemana = 0;
                        const ahora = Date.now();
                        for (const fecha of fechas) {
                            const fechaObj = new Date(fecha);
                            if ((ahora - fechaObj.getTime()) < 604800000) {
                                frasesUltimaSemana += historial[fecha] || 0;
                            }
                        }
                        desbloqueado = frasesUltimaSemana >= 50;
                    } catch (e) {
                        desbloqueado = false;
                    }
                    break;
                case 'explorador':
                    const modulosVisitados = Object.keys(this._contextoUsuario.modulosVisitados || {});
                    const modulosRequeridos = ['study', 'temas', 'elipse', 'ondasCruzadas', 'caracteres', 'tonos', 'biblioteca'];
                    desbloqueado = modulosRequeridos.every(m => modulosVisitados.includes(m));
                    break;
                case 'consistencia_oro':
                    try {
                        const historialEstudio = JSON.parse(localStorage.getItem('pipeline_historial_estudio') || '{}');
                        const fechas = Object.keys(historialEstudio).sort();
                        let diasConsecutivos = 0;
                        for (let i = fechas.length - 1; i >= 0; i--) {
                            const fecha = new Date(fechas[i]);
                            const diff = Math.floor((Date.now() - fecha.getTime()) / 86400000);
                            if (diff === diasConsecutivos && historialEstudio[fechas[i]] >= 1800) {
                                diasConsecutivos++;
                            } else if (diff > diasConsecutivos) {
                                break;
                            }
                        }
                        desbloqueado = diasConsecutivos >= 7 && this._contextoUsuario.racha >= 7;
                    } catch (e) {
                        desbloqueado = false;
                    }
                    break;
                case 'maestro_de_elipse': desbloqueado = this._contextoUsuario.elipse.totalOndas >= 10; break;
                case 'lector_avido': desbloqueado = this._contextoUsuario.biblioteca.leidas >= 25; break;
                case 'primer_caracter': 
                    desbloqueado = this._contextoUsuario.caracteres.caracteresEstudiados >= 1; 
                    break;
                case '10_caracteres_espacial': 
                    desbloqueado = this._contextoUsuario.caracteres.caracteresEstudiados >= 10; 
                    break;
                case '50_caracteres_espacial': 
                    desbloqueado = this._contextoUsuario.caracteres.caracteresEstudiados >= 50; 
                    break;
                case '100_caracteres_espacial': 
                    desbloqueado = this._contextoUsuario.caracteres.caracteresEstudiados >= 100; 
                    break;
                case 'maestro_radicales': 
                    desbloqueado = (this._mapaAprendizaje.espacial.radicalesConocidos?.length || 0) >= 20; 
                    break;
                case 'explorador_espacial': 
                    const microsEspaciales = this._mapaAprendizaje.microObjetivos
                        .filter(m => m.completado && (m.tipo === 'caracter' || m.tipo === 'radical'));
                    desbloqueado = microsEspaciales.length >= 10;
                    break;
                case 'caligrafo': 
                    desbloqueado = (this._mapaAprendizaje.espacial.trazosPracticados?.length || 0) >= 50; 
                    break;
                case 'compositor': 
                    desbloqueado = (this._mapaAprendizaje.espacial.composicionesEstudiadas?.length || 0) >= 20; 
                    break;
                case 'mnemotecnico': 
                    desbloqueado = (this._mapaAprendizaje.espacial.historiasMnemotecnicas?.length || 0) >= 10; 
                    break;
                case 'lector_espacial': 
                    desbloqueado = this._contextoUsuario.biblioteca.leidas >= 10; 
                    break;
            }
            
            if (desbloqueado) {
                nuevosLogros.push(id);
                logrosDesbloqueados.push(id);
                this._mapaAprendizaje.puntosExperiencia += logro.puntos;
                
                this._agregarIntervencion({
                    id: 'logro_' + id + '_' + Date.now(),
                    reglaId: 'logro_desbloqueado',
                    prioridad: 'alta',
                    mensaje: `🏆 ¡Logro desbloqueado: **${logro.nombre}**!\n\n${logro.descripcion}\n\n📊 +${logro.puntos} puntos de experiencia.`,
                    opciones: [
                        { id: 'ver_logros', label: '🏆 Ver todos los logros', accion: 'ver_logros' },
                        { id: 'continuar', label: '🎯 Seguir estudiando', accion: 'descartar' }
                    ],
                    timestamp: Date.now(),
                    contexto: { logro: logro.nombre, descripcion: logro.descripcion, puntos: logro.puntos }
                });
            }
        }
        
        if (nuevosLogros.length > 0) {
            this._mapaAprendizaje.logrosDesbloqueados = logrosDesbloqueados;
            await this._guardarProgresoTutor();
        }
    }

    // ============================================================
    // VERIFICAR NUEVAS RECOMENDACIONES DE BIBLIOTECA - V8.5
    // ============================================================
    async _verificarNuevasRecomendacionesBiblioteca() {
        try {
            const biblioteca = this._contextoUsuario.biblioteca;
            if (!biblioteca || biblioteca.totalHistorias === 0) return;
            
            const sinLeer = biblioteca.totalHistorias - biblioteca.leidas;
            if (sinLeer > 0 && this._configuracion.guiaProactiva.activa) {
                const ultimaRecomendacion = this._historialIntervenciones
                    .filter(i => i.reglaId === 'biblioteca_recomendacion' || i.reglaId === 'recomendar_biblioteca')
                    .pop();
                
                if (!ultimaRecomendacion || (Date.now() - ultimaRecomendacion.mostrada) > 86400000) {
                    const historias = await window.UIBiblioteca?._obtenerTodasLasHistorias() || [];
                    const sinLeerHistorias = historias.filter(h => !h._leida);
                    if (sinLeerHistorias.length > 0) {
                        const historia = sinLeerHistorias[Math.floor(Math.random() * sinLeerHistorias.length)];
                        this._agregarIntervencion({
                            id: 'biblioteca_recomendacion_' + Date.now(),
                            reglaId: 'biblioteca_recomendacion',
                            prioridad: 'media',
                            mensaje: `📖 **Recomendación de lectura:** "${historia._titulo || 'Historia'}"\n\n${historia._descripcion || 'Descubre esta historia en la Biblioteca.'}\n\n📊 Nivel: ${historia._nivel || 'A1'} · ⏱️ ${Math.round((historia._texto?.length || 100) / 100)} min`,
                            opciones: this._crearOpcionesPorModo([
                                { id: 'leer_ahora', label: '📖 Leer ahora', accion: 'leer_recomendacion' }
                            ], [
                                { id: 'leer_ahora', label: '📖 Leer ahora', accion: 'leer_recomendacion' },
                                { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                                { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
                            ]),
                            timestamp: Date.now(),
                            contexto: { titulo: historia._titulo, descripcion: historia._descripcion, nivel: historia._nivel, duracion: Math.round((historia._texto?.length || 100) / 100) }
                        });
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Error verificando recomendaciones de biblioteca:', error);
        }
    }

    // ============================================================
    // MÉTODOS AUXILIARES PARA CONTEXTO
    // ============================================================
    _calcularTiempoEstudioHoy() {
        try {
            const hoy = new Date().toDateString();
            const historial = JSON.parse(localStorage.getItem('pipeline_historial_estudio') || '{}');
            return historial[hoy] || 0;
        } catch (e) { return 0; }
    }

    _calcularTiempoEstudioTotal() {
        try {
            const historial = JSON.parse(localStorage.getItem('pipeline_historial_estudio') || '{}');
            return Object.values(historial).reduce((acc, val) => acc + val, 0);
        } catch (e) { return 0; }
    }

    _calcularSesionesHoy() {
        try {
            const hoy = new Date().toDateString();
            const sesiones = JSON.parse(localStorage.getItem('pipeline_sesiones_estudio') || '{}');
            return sesiones[hoy] || 0;
        } catch (e) { return 0; }
    }

    _agruparPorNivel(historias) {
        const grupos = {};
        for (const h of historias) {
            const nivel = h.nivel || 'A1';
            if (!grupos[nivel]) grupos[nivel] = 0;
            grupos[nivel]++;
        }
        return grupos;
    }

    _calcularSiguienteHito() {
        const hitos = [
            { nombre: 'Completar 5 frases', umbral: 5, actual: this._contextoUsuario.frasesCompletadas },
            { nombre: 'Completar 10 frases', umbral: 10, actual: this._contextoUsuario.frasesCompletadas },
            { nombre: 'Completar 1 tema', umbral: 1, actual: this._contextoUsuario.temas.completados },
            { nombre: 'Generar 1 onda Elipse', umbral: 1, actual: this._contextoUsuario.elipse.totalOndas },
            { nombre: 'Estudiar 3 caracteres', umbral: 3, actual: this._contextoUsuario.caracteres.caracteresEstudiados },
            { nombre: 'Racha de 3 días', umbral: 3, actual: this._contextoUsuario.racha },
            { nombre: 'Leer 3 historias', umbral: 3, actual: this._contextoUsuario.biblioteca.leidas },
            { nombre: 'Completar 1 micro-objetivo', umbral: 1, actual: this._mapaAprendizaje.microObjetivos.filter(m => m.completado).length },
            { nombre: 'Aprender 1 radical', umbral: 1, actual: this._mapaAprendizaje.espacial.radicalesConocidos?.length || 0 }
        ];
        for (const hito of hitos) {
            if (hito.actual < hito.umbral) return hito;
        }
        return { nombre: '¡Sigue así!', umbral: 0, actual: 0 };
    }

    // ============================================================
    // ACTUALIZAR MICRO-OBJETIVOS - V8.5
    // ============================================================
    async _actualizarMicroObjetivos() {
        if (!this._configuracion.microObjetivos.activo) return;
        
        try {
            const microObjetivos = this._mapaAprendizaje.microObjetivos;
            const completados = microObjetivos.filter(m => m.completado);
            const pendientes = microObjetivos.filter(m => !m.completado);
            const esJeroglifico = this._esJeroglifico(this._obtenerIdiomaActual());
            
            for (const micro of microObjetivos) {
                if (micro.completado) continue;
                let completado = false;
                
                switch (micro.id) {
                    case 'micro_1': // 5 frases
                        completado = this._contextoUsuario.frasesCompletadas >= 5;
                        break;
                    case 'micro_2': // Leer una historia
                        completado = this._contextoUsuario.biblioteca.leidas >= 1;
                        break;
                    case 'micro_3': // 10 minutos de estudio
                        completado = this._contextoUsuario.tiempoEstudioHoy >= 600;
                        break;
                    case 'micro_4': // Estudiar un carácter
                        completado = this._contextoUsuario.caracteres.caracteresEstudiados >= 1;
                        break;
                    case 'micro_5': // Practicar un radical
                        completado = (this._mapaAprendizaje.espacial.radicalesConocidos?.length || 0) >= 1;
                        break;
                    default:
                        if (micro.tipo === 'frases') {
                            completado = this._contextoUsuario.frasesCompletadas >= micro.meta;
                        } else if (micro.tipo === 'lectura') {
                            completado = this._contextoUsuario.biblioteca.leidas >= micro.meta;
                        } else if (micro.tipo === 'tiempo') {
                            completado = this._contextoUsuario.tiempoEstudioTotal >= micro.meta;
                        } else if (micro.tipo === 'caracter') {
                            completado = this._contextoUsuario.caracteres.caracteresEstudiados >= micro.meta;
                        } else if (micro.tipo === 'radical') {
                            completado = (this._mapaAprendizaje.espacial.radicalesConocidos?.length || 0) >= micro.meta;
                        }
                        break;
                }
                
                if (completado) {
                    micro.completado = true;
                    micro.fechaCompletado = Date.now();
                    this._mapaAprendizaje.puntosExperiencia += (micro.recompensa || 5);
                    
                    this._agregarIntervencion({
                        id: 'micro_completado_' + Date.now(),
                        reglaId: 'micro_objetivo_completado',
                        prioridad: 'media',
                        mensaje: `🎯 ¡Micro-objetivo completado: **${micro.titulo}**!\n\n📊 +${micro.recompensa || 5} puntos de experiencia.\n${pendientes.length > 0 ? `\n💡 Siguiente: "${pendientes[0].titulo}"` : '\n🎉 ¡Todos los micro-objetivos completados!'}`,
                        opciones: [
                            { id: 'continuar', label: '🎯 Seguir con el siguiente', accion: 'descartar' },
                            { id: 'ver_objetivos', label: '📋 Ver todos', accion: 'ver_micro_objetivos' }
                        ],
                        timestamp: Date.now(),
                        contexto: { objetivo: micro.titulo, recompensa: micro.recompensa || 5, siguiente: pendientes.length > 0 ? pendientes[0].titulo : 'Ninguno' }
                    });
                }
            }
            
            if (pendientes.length === 0 && microObjetivos.length > 0) {
                await this._generarNuevosMicroObjetivos();
            }
            
            localStorage.setItem('pipeline_micro_objetivos', JSON.stringify(microObjetivos));
            
        } catch (error) {
            console.warn('⚠️ Error actualizando micro-objetivos:', error);
        }
    }

    async _generarNuevosMicroObjetivos() {
        const nuevos = [];
        const conteo = this._mapaAprendizaje.microObjetivos.length + 1;
        const esJeroglifico = this._esJeroglifico(this._obtenerIdiomaActual());
        
        if (this._contextoUsuario.temas.sinIniciar > 0) {
            nuevos.push({
                id: 'micro_' + conteo,
                titulo: 'Inicia un nuevo tema',
                descripcion: `Comienza a estudiar el tema "${this._contextoUsuario.temas.temaRecomendado?.nombre || 'nuevo tema'}"`,
                completado: false,
                recompensa: 8,
                tipo: 'tema',
                meta: 1,
                modulo: 'temas'
            });
        }
        
        if (this._contextoUsuario.elipse.necesitaNuevaOnda) {
            nuevos.push({
                id: 'micro_' + (conteo + 1),
                titulo: 'Genera una onda Elipse',
                descripcion: 'Crea una nueva onda expansiva en el Modo Elipse',
                completado: false,
                recompensa: 10,
                tipo: 'elipse',
                meta: 1,
                modulo: 'elipse'
            });
        }
        
        if (this._contextoUsuario.biblioteca.totalHistorias > this._contextoUsuario.biblioteca.leidas) {
            nuevos.push({
                id: 'micro_' + (conteo + 2),
                titulo: 'Lee una historia',
                descripcion: 'Disfruta de una nueva historia en la Biblioteca',
                completado: false,
                recompensa: 6,
                tipo: 'lectura',
                meta: 1,
                modulo: 'biblioteca'
            });
        }
        
        if (this._contextoUsuario.pipeline.necesitaRepaso) {
            nuevos.push({
                id: 'micro_' + (conteo + 3),
                titulo: 'Repasa 5 frases',
                descripcion: 'Practica frases con RCN bajo en el módulo de estudio',
                completado: false,
                recompensa: 7,
                tipo: 'frases',
                meta: 5,
                modulo: 'study'
            });
        }
        
        if (esJeroglifico && this._configuracion.espacial.activo) {
            if (this._contextoUsuario.caracteres.caracteresEstudiados < 5) {
                nuevos.push({
                    id: 'micro_' + (conteo + 4),
                    titulo: 'Estudia un carácter',
                    descripcion: 'Aprende un nuevo carácter en el modo espacial',
                    completado: false,
                    recompensa: 8,
                    tipo: 'caracter',
                    meta: 1,
                    modulo: 'caracteres'
                });
            }
            
            if ((this._mapaAprendizaje.espacial.radicalesConocidos?.length || 0) < 3) {
                nuevos.push({
                    id: 'micro_' + (conteo + 5),
                    titulo: 'Aprende un radical',
                    descripcion: 'Aprende un radical básico y sus ejemplos',
                    completado: false,
                    recompensa: 10,
                    tipo: 'radical',
                    meta: 1,
                    modulo: 'caracteres'
                });
            }
        }
        
        if (nuevos.length === 0) {
            nuevos.push({
                id: 'micro_' + conteo,
                titulo: 'Estudia 15 minutos',
                descripcion: 'Dedica 15 minutos al estudio continuo',
                completado: false,
                recompensa: 5,
                tipo: 'tiempo',
                meta: 900,
                modulo: 'study'
            });
        }
        
        const maxObjetivos = this._configuracion.microObjetivos.maxObjetivosSimultaneos || 3;
        const nuevosLimitados = nuevos.slice(0, maxObjetivos);
        
        this._mapaAprendizaje.microObjetivos = this._mapaAprendizaje.microObjetivos.concat(nuevosLimitados);
        localStorage.setItem('pipeline_micro_objetivos', JSON.stringify(this._mapaAprendizaje.microObjetivos));
        console.log(`🎯 Generados ${nuevosLimitados.length} nuevos micro-objetivos`);
    }

    async _recomendarMicroObjetivo() {
        if (!this._configuracion.microObjetivos.activo) return;
        if (this._modoActual === this._MODOS.LIBRE) return;
        
        const pendientes = this._mapaAprendizaje.microObjetivos.filter(m => !m.completado);
        if (pendientes.length === 0) return;
        
        const ultimaRecomendacion = this._historialIntervenciones
            .filter(i => i.reglaId === 'recomendar_micro_objetivo')
            .pop();
        
        if (ultimaRecomendacion && (Date.now() - ultimaRecomendacion.mostrada) < 3600000) return;
        
        const micro = pendientes[0];
        this._agregarIntervencion({
            id: 'micro_recomendacion_' + Date.now(),
            reglaId: 'recomendar_micro_objetivo',
            prioridad: 'media',
            mensaje: `🎯 **Micro-objetivo recomendado:** "${micro.titulo}"\n\n${micro.descripcion}\n\n💡 +${micro.recompensa || 5} puntos al completarlo.`,
            opciones: this._crearOpcionesPorModo([
                { id: 'aceptar_micro', label: '🎯 Aceptar y completar', accion: 'aceptar_micro_objetivo' },
                { id: 'ver_objetivos', label: '📋 Ver todos', accion: 'ver_micro_objetivos' }
            ], [
                { id: 'aceptar_micro', label: '🎯 Aceptar y completar', accion: 'aceptar_micro_objetivo' },
                { id: 'ver_objetivos', label: '📋 Ver todos', accion: 'ver_micro_objetivos' },
                { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' }
            ]),
            timestamp: Date.now(),
            contexto: { objetivo: micro.titulo, descripcion: micro.descripcion, recompensa: micro.recompensa || 5 }
        });
    }

    // ============================================================
    // GUARDAR PROGRESO DEL TUTOR
    // ============================================================
    async _guardarProgresoTutor() {
        try {
            const data = {
                logrosDesbloqueados: this._mapaAprendizaje.logrosDesbloqueados || [],
                puntosExperiencia: this._mapaAprendizaje.puntosExperiencia || 0,
                nivelTutor: this._mapaAprendizaje.nivelTutor || 1,
                rachaDiaria: this._mapaAprendizaje.rachaDiaria || 0,
                diasConsecutivos: this._mapaAprendizaje.diasConsecutivos || 0,
                misionesCompletadas: this._mapaAprendizaje.misionesCompletadas || [],
                ultimoEstudio: this._mapaAprendizaje.ultimoEstudio || null,
                microObjetivos: this._mapaAprendizaje.microObjetivos || [],
                espacial: this._mapaAprendizaje.espacial || {}
            };
            localStorage.setItem('pipeline_tutor_progreso', JSON.stringify(data));
            localStorage.setItem('pipeline_espacial_progreso', JSON.stringify(this._mapaAprendizaje.espacial));
            this._guardarEstadoEnLocalStorage();
        } catch (e) { console.warn('⚠️ Error guardando progreso del tutor:', e); }
    }

    // ============================================================
    // CONSTRUIR MAPA DE APRENDIZAJE
    // ============================================================
    async _construirMapaAprendizaje() {
        console.log('🗺️ Construyendo mapa neuroadaptativo de aprendizaje...');
        
        try {
            const idioma = this._contextoUsuario.idioma || 'es';
            const todosLosTemas = await db.obtenerTemasPorIdioma(idioma);
            
            if (todosLosTemas.length === 0) {
                console.log('ℹ️ No hay temas para construir el mapa');
                this._mapaAprendizaje.rutaActual = [];
                return;
            }
            
            const temasClasificados = [];
            for (const tema of todosLosTemas) {
                const progreso = await db.obtenerProgresoTema(tema.id);
                const historias = await db.obtenerHistoriasPorTema(tema.id);
                temasClasificados.push({
                    ...tema,
                    nivel: tema.nivel || 'A1',
                    completado: progreso.progreso >= 100 || (progreso.totalFrases > 0 && progreso.completadas === progreso.totalFrases),
                    porcentaje: progreso.progreso || 0,
                    historias: historias.length
                });
            }
            
            const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            temasClasificados.sort((a, b) => niveles.indexOf(a.nivel) - niveles.indexOf(b.nivel));
            
            this._mapaAprendizaje.rutaActual = temasClasificados;
            
            this._contextoUsuario.temas.completados = temasClasificados.filter(t => t.completado).length;
            this._contextoUsuario.temas.enProgreso = temasClasificados.filter(t => !t.completado && t.porcentaje > 0).length;
            this._contextoUsuario.temas.pendientes = temasClasificados.filter(t => !t.completado && t.porcentaje === 0).length;
            
            const total = temasClasificados.length || 1;
            const completados = this._contextoUsuario.temas.completados;
            const enProgreso = this._contextoUsuario.temas.enProgreso;
            this._mapaAprendizaje.progresoGeneral = Math.round(((completados * 100) + (enProgreso * 50)) / total);
            
            console.log(`🗺️ Mapa construido: ${temasClasificados.length} temas, ${this._mapaAprendizaje.progresoGeneral}% completado`);
            
        } catch (error) {
            console.error('❌ Error construyendo mapa de aprendizaje:', error);
        }
    }

    // ============================================================
    // ACTUALIZAR ESTADÍSTICAS AVANZADAS - V8.5
    // ============================================================
    async _actualizarEstadisticasAvanzadas() {
        try {
            const stats = this._mapaAprendizaje.estadisticasAvanzadas;
            
            const modulos = ['temas', 'elipse', 'ondasCruzadas', 'caracteres', 'tonos', 'study', 'biblioteca', 'espacial'];
            for (const modulo of modulos) {
                let data = { visitas: 0, tiempo: 0, progreso: 0 };
                
                if (modulo === 'temas') {
                    data.progreso = this._contextoUsuario.temas.progresoPromedio || 0;
                    data.visitas = this._contextoUsuario.modulosVisitados?.temas || 0;
                } else if (modulo === 'elipse') {
                    data.progreso = this._contextoUsuario.elipse.progreso || 0;
                    data.visitas = this._contextoUsuario.modulosVisitados?.elipse || 0;
                } else if (modulo === 'ondasCruzadas') {
                    data.progreso = this._contextoUsuario.ondasCruzadas.ondasTotales || 0;
                    data.visitas = this._contextoUsuario.modulosVisitados?.ondasCruzadas || 0;
                } else if (modulo === 'caracteres') {
                    data.progreso = this._contextoUsuario.caracteres.caracteresDominados || 0;
                    data.visitas = this._contextoUsuario.modulosVisitados?.caracteres || 0;
                } else if (modulo === 'tonos') {
                    data.progreso = this._contextoUsuario.tonos.progresoTonos || 0;
                    data.visitas = this._contextoUsuario.modulosVisitados?.tonos || 0;
                } else if (modulo === 'study') {
                    data.progreso = this._contextoUsuario.pipeline.progreso || 0;
                    data.visitas = this._contextoUsuario.modulosVisitados?.study || 0;
                } else if (modulo === 'biblioteca') {
                    data.progreso = this._contextoUsuario.biblioteca.progresoLectura || 0;
                    data.visitas = this._contextoUsuario.modulosVisitados?.biblioteca || 0;
                } else if (modulo === 'espacial') {
                    data.progreso = this._contextoUsuario.caracteres.caracteresDominados || 0;
                    data.visitas = this._contextoUsuario.modulosVisitados?.caracteres || 0;
                }
                
                stats.porModulo[modulo] = data;
            }
            
            for (const nivel of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
                stats.porNivel[nivel] = {
                    temasCompletados: 0,
                    frasesCompletadas: 0,
                    palabrasAprendidas: 0,
                    caracteresAprendidos: 0
                };
            }
            
            stats.tendenciaSemanal = [];
            for (let i = 6; i >= 0; i--) {
                const fecha = new Date();
                fecha.setDate(fecha.getDate() - i);
                const key = fecha.toDateString();
                const historial = JSON.parse(localStorage.getItem('pipeline_historial_progreso') || '{}');
                stats.tendenciaSemanal.push({
                    fecha: key,
                    progreso: historial[key] || 0,
                    frases: 0
                });
            }
            
            stats.retencionPromedio = this._contextoUsuario.pipeline.rcnPromedio || 0;
            stats.consistenciaDiaria = this._contextoUsuario.racha / 30 * 100;
            stats.eficienciaGlobal = this._contextoUsuario.eficiencia || 0;
            
            const picos = [];
            const historialDiario = JSON.parse(localStorage.getItem('pipeline_historial_progreso') || '{}');
            const fechasOrdenadas = Object.keys(historialDiario).sort();
            for (let i = 0; i < fechasOrdenadas.length; i++) {
                const fecha = fechasOrdenadas[i];
                const valor = historialDiario[fecha] || 0;
                if (i > 0 && i < fechasOrdenadas.length - 1) {
                    const prev = historialDiario[fechasOrdenadas[i-1]] || 0;
                    const next = historialDiario[fechasOrdenadas[i+1]] || 0;
                    if (valor > prev * 1.5 && valor > next * 1.5) {
                        picos.push({ fecha: fecha, valor: valor });
                    }
                }
            }
            stats.picosAprendizaje = picos.slice(-5);
            
            stats.zonasMejora = this._contextoUsuario.analisisProgreso.puntosDebiles || [];
            
            const sesiones = JSON.parse(localStorage.getItem('pipeline_sesiones_estudio') || '{}');
            const horasPorDia = {};
            for (const [fecha, sesion] of Object.entries(sesiones)) {
                const dia = new Date(fecha).getDay();
                if (!horasPorDia[dia]) horasPorDia[dia] = 0;
                horasPorDia[dia] += sesion || 0;
            }
            const diasMasProductivos = Object.entries(horasPorDia)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([dia]) => ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][parseInt(dia)]);
            
            stats.patronesEstudio = {
                horarioOptimo: null,
                duracionOptima: Math.round(this._contextoUsuario.tiempoEstudioTotal / (this._contextoUsuario.sesionesHoy || 1)),
                diasMasProductivos: diasMasProductivos
            };
            
            stats.sesionesTotales = this._contextoUsuario.sesionesHoy || 0;
            stats.tiempoPromedioPorSesion = this._contextoUsuario.tiempoEstudioTotal / (stats.sesionesTotales || 1);
            stats.horasEstudio = this._contextoUsuario.tiempoEstudioTotal / 3600;
            
            const modulosUsados = Object.entries(stats.porModulo)
                .filter(([_, data]) => data.visitas > 0)
                .sort((a, b) => b[1].visitas - a[1].visitas)
                .slice(0, 5)
                .map(([key, _]) => key);
            stats.modulosMasUsados = modulosUsados;
            
            this._mapaAprendizaje.estadisticasAvanzadas = stats;
            
            console.log('✅ Estadísticas avanzadas actualizadas (V8.5)');
            console.log(`   📊 Retención: ${stats.retencionPromedio}`);
            console.log(`   📈 Consistencia: ${Math.round(stats.consistenciaDiaria)}%`);
            console.log(`   ⚡ Eficiencia: ${stats.eficienciaGlobal}%`);
            console.log(`   📚 Módulos más usados: ${modulosUsados.join(', ')}`);
            
        } catch (error) {
            console.warn('⚠️ Error actualizando estadísticas avanzadas:', error);
        }
    }

    // ============================================================
    // REGISTRAR EVENTOS - V8.5
    // ============================================================
    _registrarEventos() {
        console.log('🔗 Registrando eventos del Tutor Neuro V8.5...');
        
        window.addEventListener('respuestaEstudio', (e) => this._onRespuestaEstudio(e.detail));
        window.addEventListener('cambioFase', (e) => this._onCambioFase(e.detail));
        window.addEventListener('sesionFinalizada', (e) => this._onSesionFinalizada(e.detail));
        window.addEventListener('errorEstudio', (e) => this._onErrorEstudio(e.detail));
        window.addEventListener('moduloCambiado', (e) => this._onModuloCambiado(e.detail));
        
        window.addEventListener('learningPathGenerado', (e) => { 
            setTimeout(() => {
                this._sincronizarConLearningPath();
                this._refrescarDashboardAutomatico();
            }, 500);
        });
        window.addEventListener('learningPathPasoCompletado', (e) => {
            this._actualizarContextoUsuario();
            this._recomendarSiguienteTema(true);
            this._refrescarDashboardAutomatico();
            if (this._modoActual === this._MODOS.GUIADO) {
                setTimeout(() => {
                    const siguientePaso = this._getPasoRecomendado();
                    if (siguientePaso && !siguientePaso.completado) {
                        if (this._core && typeof this._core.mostrarToast === 'function') {
                            this._core.mostrarToast(`📌 Siguiente paso: "${siguientePaso.titulo}"`, 'info');
                        }
                        if (this._core && typeof this._core.irAModulo === 'function') {
                            this._core.irAModulo('study');
                        }
                    }
                }, 2000);
            }
        });
        window.addEventListener('learningPathCompletado', (e) => {
            if (this._core && typeof this._core.mostrarToast === 'function') {
                this._core.mostrarToast('🎉 ¡Has completado tu ruta de aprendizaje!', 'success');
            }
            this._refrescarDashboardAutomatico();
            if (this._modoActual !== this._MODOS.LIBRE) {
                this._agregarIntervencion({
                    id: 'ruta_completada_' + Date.now(),
                    reglaId: 'ruta_completada',
                    prioridad: 'media',
                    mensaje: '🎉 ¡Has completado todos los pasos de tu ruta actual!\n\n¿Quieres generar una nueva ruta?',
                    opciones: this._crearOpcionesPorModo([
                        { id: 'generar_nueva_ruta', label: '🔄 Generar nueva ruta', accion: 'generar_nueva_ruta' }
                    ], [
                        { id: 'generar_nueva_ruta', label: '🔄 Generar nueva ruta', accion: 'generar_nueva_ruta' },
                        { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                        { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
                    ]),
                    timestamp: Date.now()
                });
                if (this._modoActual === this._MODOS.GUIADO) {
                    const pendientes = this._intervencionesPendientes;
                    if (pendientes.length > 0) this._mostrarIntervencion(pendientes[pendientes.length - 1]);
                }
            }
        });
        
        window.addEventListener('elipseOndaGenerada', () => { setTimeout(() => { this._actualizarContextoUsuario(); this._recomendarSiguienteTema(true); this._refrescarDashboardAutomatico(); }, 1000); });
        window.addEventListener('elipseOndaCompletada', () => { setTimeout(() => { this._actualizarContextoUsuario(); this._recomendarSiguienteTema(true); this._refrescarDashboardAutomatico(); }, 1000); });
        window.addEventListener('ondasCruzadasGenerada', () => { setTimeout(() => { this._actualizarContextoUsuario(); this._recomendarSiguienteTema(true); this._refrescarDashboardAutomatico(); }, 1000); });
        window.addEventListener('temaCompletado', () => { setTimeout(() => { this._actualizarContextoUsuario(); this._recomendarSiguienteTema(true); this._refrescarDashboardAutomatico(); }, 1000); });
        window.addEventListener('bibliotecaActualizada', () => { setTimeout(() => { this._actualizarContextoUsuario(); this._recomendarSiguienteTema(true); this._refrescarDashboardAutomatico(); }, 1000); });
        window.addEventListener('bibliotecaHistoriaLeida', () => { setTimeout(() => { this._actualizarContextoUsuario(); this._recomendarSiguienteTema(true); this._refrescarDashboardAutomatico(); }, 1000); });
        window.addEventListener('idiomaCambiado', () => { setTimeout(() => { this._actualizarContextoUsuario(); this._recomendarSiguienteTema(true); this._refrescarDashboardAutomatico(); }, 1000); });
        window.addEventListener('nivelIdiomaCambiado', () => { setTimeout(() => { this._actualizarContextoUsuario(); this._recomendarSiguienteTema(true); this._refrescarDashboardAutomatico(); }, 1000); });
        window.addEventListener('favoritoActualizado', () => { setTimeout(() => { this._actualizarContextoUsuario(); this._refrescarDashboardAutomatico(); }, 1000); });
        
        window.addEventListener('microObjetivoCompletado', () => { setTimeout(() => { this._actualizarContextoUsuario(); this._recomendarMicroObjetivo(); this._refrescarDashboardAutomatico(); }, 1000); });
        
        window.addEventListener('caracterEstudiado', () => { setTimeout(() => { this._actualizarContextoUsuario(); this._actualizarProgresoEspacial(); this._refrescarDashboardAutomatico(); }, 1000); });
        window.addEventListener('radicalAprendido', () => { setTimeout(() => { this._actualizarContextoUsuario(); this._actualizarProgresoEspacial(); this._refrescarDashboardAutomatico(); }, 1000); });
        
        // Evento de app init completa para refrescar
        window.addEventListener('appInitCompleta', () => {
            console.log('🔄 App init completa, refrescando tutor...');
            setTimeout(() => {
                this._refrescarDashboardAutomatico();
                // Si no se ha ejecutado el análisis inicial, ejecutarlo ahora
                if (this._forzarAnalisisPendiente && !this._analisisInicialEjecutado) {
                    console.log('🧠 [FORZAR ANÁLISIS] Ejecutando análisis desde appInitCompleta...');
                    setTimeout(async () => {
                        try {
                            await this.forzarAnalisis();
                            this._forzarAnalisisPendiente = false;
                            this._analisisInicialEjecutado = true;
                            this._guardarEstadoEnLocalStorage();
                            console.log('✅ [FORZAR ANÁLISIS] Análisis completado desde appInitCompleta');
                        } catch (e) {
                            console.warn('⚠️ [FORZAR ANÁLISIS] Error en análisis desde appInitCompleta:', e);
                        }
                    }, 500);
                }
            }, 500);
        });
        
        console.log('✅ Eventos del Tutor Neuro V8.5 registrados');
    }

    // ============================================================
    // EVENTOS DEL TUTOR
    // ============================================================
    _onRespuestaEstudio(detalle) {
        if (!this._configuracion.intervencionAuto || !detalle) return;
        this._ultimaActividad = Date.now();
        if (!this._historialRespuestas) this._historialRespuestas = [];
        this._historialRespuestas.push({ ...detalle, timestamp: Date.now() });
        if (this._historialRespuestas.length > 50) this._historialRespuestas = this._historialRespuestas.slice(-50);
        this._analizarRespuesta(detalle);
        // Refrescar automáticamente después de una respuesta
        setTimeout(() => this._refrescarDashboardAutomatico(), 500);
    }

    _onCambioFase(detalle) { this._contextoUsuario.faseActual = detalle?.fase || 1; this._refrescarDashboardAutomatico(); }

    _onSesionFinalizada(detalle) { this._sesionActiva = false; this._actualizarContextoUsuario(); this._refrescarDashboardAutomatico(); }

    _onErrorEstudio(detalle) {
        if (!this._erroresRegistrados) this._erroresRegistrados = [];
        this._erroresRegistrados.push({ ...detalle, timestamp: Date.now() });
        if (this._erroresRegistrados.length > 20) this._erroresRegistrados = this._erroresRegistrados.slice(-20);
    }

    _onModuloCambiado(detalle) {
        this._actualizarContextoUsuario();
        if (detalle?.modulo === 'study') { this._sesionActiva = true; this._inicioSesion = Date.now(); this._contadorIntervencionesSesion = 0; }
        if (detalle?.modulo === 'caracteres' && this._configuracion.espacial.activo) {
            setTimeout(() => { this._actualizarProgresoEspacial(); this._refrescarDashboardAutomatico(); }, 500);
        }
        if (detalle?.modulo) {
            if (!this._contextoUsuario.modulosVisitados[detalle.modulo]) this._contextoUsuario.modulosVisitados[detalle.modulo] = 0;
            this._contextoUsuario.modulosVisitados[detalle.modulo]++;
            this._contextoUsuario.ultimoModuloVisitado = detalle.modulo;
            
            const modulosRequeridos = ['study', 'temas', 'elipse', 'ondasCruzadas', 'caracteres', 'tonos', 'biblioteca'];
            const visitados = Object.keys(this._contextoUsuario.modulosVisitados);
            if (modulosRequeridos.every(m => visitados.includes(m))) {
                this._verificarLogros();
            }
            this._refrescarDashboardAutomatico();
        }
    }

    // ============================================================
    // ANÁLISIS DE RESPUESTAS
    // ============================================================
    async _analizarRespuesta(detalle) {
        if (this._analizando) { this._analisisPendiente = true; return; }

        try {
            this._analizando = true;
            this._analisisPendiente = false;
            if (this._contadorIntervencionesSesion >= this._configuracion.maxIntervencionesPorSesion) return;
            if (Date.now() - this._ultimaIntervencion < this._intervaloMinimoIntervencion) return;
            
            if (detalle.tipo === 'fallo') await this._analizarFallo(detalle);
            if (detalle.tipo === 'correcto') await this._analizarAcierto(detalle);
            await this._analizarFatiga();
            await this._analizarEficiencia();
            
            if (this._configuracion.guiaProactiva.activa) {
                const contador = this._contadorIntervencionesSesion;
                const frecuencia = this._configuracion.guiaProactiva.recomendarCada || 5;
                if (contador % frecuencia === 0 && contador > 0) {
                    await this._recomendarSiguienteModulo();
                }
            }
            
            // Refrescar después del análisis
            setTimeout(() => this._refrescarDashboardAutomatico(), 300);
            
        } catch (error) { console.warn('⚠️ Error en análisis de respuesta:', error); }
        finally {
            this._analizando = false;
            if (this._analisisPendiente) {
                this._analisisPendiente = false;
                setTimeout(() => this._analizarRespuesta(detalle), 100);
            }
        }
    }

    async _analizarFallo(detalle) {
        const fallosRecientes = this._historialRespuestas
            .filter(r => r.tipo === 'fallo' && (Date.now() - r.timestamp) < 120000).slice(-5);
        if (fallosRecientes.length < 3) return;
        const temas = fallosRecientes.map(r => r.tema || 'general');
        const conteo = {};
        for (const tema of temas) conteo[tema] = (conteo[tema] || 0) + 1;
        let temaFrecuente = null, maxFrecuencia = 0;
        for (const [tema, frecuencia] of Object.entries(conteo)) {
            if (frecuencia > maxFrecuencia) { maxFrecuencia = frecuencia; temaFrecuente = tema; }
        }
        if (temaFrecuente && maxFrecuencia >= 3) {
            this._agregarIntervencion({
                id: 'fallos_tema_' + Date.now(),
                reglaId: 'fallos_consecutivos',
                prioridad: 'alta',
                mensaje: `🔴 Has fallado ${maxFrecuencia} frases sobre "${temaFrecuente}". ¿Quieres repasar este tema en Gramática?`,
                opciones: this._crearOpcionesPorModo([
                    { id: 'ir_gramatica', label: '📖 Ir a Gramática', accion: 'ir_a_gramatica' }
                ], [
                    { id: 'ir_gramatica', label: '📖 Ir a Gramática', accion: 'ir_a_gramatica' },
                    { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                    { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
                ]),
                timestamp: Date.now(),
                contexto: { tema: temaFrecuente, fallos: maxFrecuencia, nivel: this._contextoUsuario.nivel }
            });
            if (this._modoActual === this._MODOS.GUIADO) {
                const pendientes = this._intervencionesPendientes;
                if (pendientes.length > 0) this._mostrarIntervencion(pendientes[pendientes.length - 1]);
            }
        }
    }

    async _analizarAcierto(detalle) {
        const aciertosRecientes = this._historialRespuestas
            .filter(r => r.tipo === 'correcto' && (Date.now() - r.timestamp) < 180000);
        if (aciertosRecientes.length >= 5) {
            const nivelNum = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(this._contextoUsuario.nivel);
            if (nivelNum >= 1) {
                this._agregarIntervencion({
                    id: 'modo_inverso_' + Date.now(),
                    reglaId: 'modo_inverso',
                    prioridad: 'baja',
                    mensaje: `🔄 ¡Llevas ${aciertosRecientes.length} aciertos consecutivos! ¿Quieres activar el "Modo Inverso" para un desafío extra?`,
                    opciones: this._crearOpcionesPorModo([
                        { id: 'activar_inverso', label: '🔄 Activar Modo Inverso', accion: 'activar_modo_inverso' }
                    ], [
                        { id: 'activar_inverso', label: '🔄 Activar Modo Inverso', accion: 'activar_modo_inverso' },
                        { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                        { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
                    ]),
                    timestamp: Date.now(),
                    contexto: { aciertos: aciertosRecientes.length }
                });
                if (this._modoActual === this._MODOS.GUIADO) {
                    const pendientes = this._intervencionesPendientes;
                    if (pendientes.length > 0) this._mostrarIntervencion(pendientes[pendientes.length - 1]);
                }
            }
        }
    }

    async _analizarFatiga() {
        if (this._centinela) {
            try {
                let estadoCentinela = null;
                if (typeof this._centinela.getEstado === 'function') {
                    estadoCentinela = this._centinela.getEstado();
                } else if (this._centinela.contadores) {
                    estadoCentinela = this._centinela.contadores;
                } else {
                    estadoCentinela = this._centinela;
                }
                const fatiga = estadoCentinela?.neuroFatiga || 0;
                if (fatiga > 0.6 && (Date.now() - this._inicioSesion) > 300000) {
                    const tiempoSesion = Date.now() - this._inicioSesion;
                    this._agregarIntervencion({
                        id: 'fatiga_' + Date.now(),
                        reglaId: 'fatiga_cognitiva',
                        prioridad: 'alta',
                        mensaje: `🧠 Tu fatiga cognitiva está en ${Math.round(fatiga * 100)}%. Llevas ${Math.round(tiempoSesion / 60000)} minutos estudiando. (Detectado por Centinela)`,
                        opciones: this._crearOpcionesPorModo([
                            { id: 'descansar', label: '☕ Tomar descanso', accion: 'sugerir_descanso' }
                        ], [
                            { id: 'descansar', label: '☕ Tomar descanso', accion: 'sugerir_descanso' },
                            { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                            { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
                        ]),
                        timestamp: Date.now(),
                        contexto: { fatiga: fatiga, tiempoSesion: tiempoSesion }
                    });
                    if (this._modoActual === this._MODOS.GUIADO) {
                        const pendientes = this._intervencionesPendientes;
                        if (pendientes.length > 0) this._mostrarIntervencion(pendientes[pendientes.length - 1]);
                    }
                }
            } catch (e) {
                console.warn('⚠️ Error obteniendo fatiga de Centinela:', e);
            }
        }
    }

    async _analizarEficiencia() {
        const stats = await db.obtenerEstadisticasNeuro();
        const eficiencia = stats.eficiencia || this._contextoUsuario.eficiencia || 0;
        if (eficiencia < 40 && this._historialRespuestas && this._historialRespuestas.length > 10) {
            this._agregarIntervencion({
                id: 'baja_eficiencia_' + Date.now(),
                reglaId: 'baja_eficiencia',
                prioridad: 'media',
                mensaje: `📊 Tu eficiencia está en ${eficiencia}%. ¿Quieres probar el "Modo Exprés"?`,
                opciones: this._crearOpcionesPorModo([
                    { id: 'modo_expres', label: '⚡ Modo Exprés', accion: 'activar_modo_expres' }
                ], [
                    { id: 'modo_expres', label: '⚡ Modo Exprés', accion: 'activar_modo_expres' },
                    { id: 'cambiar_modo', label: '🔄 Cambiar modo', accion: 'cambiar_modo_estudio' },
                    { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                    { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
                ]),
                timestamp: Date.now(),
                contexto: { eficiencia: eficiencia }
            });
            if (this._modoActual === this._MODOS.GUIADO) {
                const pendientes = this._intervencionesPendientes;
                if (pendientes.length > 0) this._mostrarIntervencion(pendientes[pendientes.length - 1]);
            }
        }
    }

    // ============================================================
    // RECOMENDAR SIGUIENTE MÓDULO
    // ============================================================
    async _recomendarSiguienteModulo() {
        if (this._modoActual === this._MODOS.LIBRE) {
            console.log('📴 Modo Libre: No se recomiendan módulos automáticamente');
            return;
        }
        
        await this._actualizarContextoUsuario();
        const mensaje = this._generarRecomendacionModulo(this._contextoUsuario);
        
        this._agregarIntervencion({
            id: 'siguiente_modulo_' + Date.now(),
            reglaId: 'siguiente_modulo',
            prioridad: 'alta',
            mensaje: mensaje,
            opciones: this._crearOpcionesPorModo([
                { id: 'ejecutar_recomendacion', label: '✅ Ir al módulo recomendado', accion: 'ejecutar_recomendacion' }
            ], [
                { id: 'ejecutar_recomendacion', label: '✅ Ir al módulo recomendado', accion: 'ejecutar_recomendacion' },
                { id: 'ver_ruta', label: '🗺️ Ver ruta completa', accion: 'ver_ruta' },
                { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' }
            ]),
            timestamp: Date.now(),
            contexto: {
                moduloRecomendado: this._mapaAprendizaje.objetivoActual?.modulo || 'study',
                detalle: this._mapaAprendizaje.objetivoActual?.detalle || '',
                prioridad: this._mapaAprendizaje.objetivoActual?.prioridad || 'media',
                puntuacion: this._mapaAprendizaje.objetivoActual?.puntuacion || 0
            }
        });
        
        if (this._modoActual === this._MODOS.GUIADO) {
            const pendientes = this._intervencionesPendientes;
            if (pendientes.length > 0) this._mostrarIntervencion(pendientes[pendientes.length - 1]);
        }
    }

    // ============================================================
    // CREAR OPCIONES POR MODO
    // ============================================================
    _crearOpcionesPorModo(opcionesGuiado, opcionesFlexible) {
        if (this._modoActual === this._MODOS.GUIADO || this._modoActual === this._MODOS.ESPACIAL) return opcionesGuiado;
        const opciones = [...opcionesFlexible];
        const tienePosponer = opciones.some(o => o.accion === 'posponer' || o.accion === 'descartar');
        if (!tienePosponer) opciones.push({ id: 'posponer', label: '⏰ Posponer', accion: 'descartar' });
        return opciones;
    }

    // ============================================================
    // GESTIÓN DE INTERVENCIONES
    // ============================================================
    _agregarIntervencion(intervencion) {
        if (this._modoActual === this._MODOS.LIBRE || !this._configuracion.intervencionAuto) return;
        if (this._contadorIntervencionesSesion >= this._configuracion.maxIntervencionesPorSesion) return;
        if (Date.now() - this._ultimaIntervencion < this._intervaloMinimoIntervencion) return;
        
        if (!Array.isArray(intervencion.opciones)) {
            intervencion.opciones = [{ id: 'ok', label: '✅ Aceptar', accion: 'descartar' }];
        }
        
        this._intervencionesPendientes.push(intervencion);
        this._ultimaIntervencion = Date.now();
        this._contadorIntervencionesSesion++;
        
        console.log(`🧠 Tutor: Nueva intervención "${intervencion.reglaId}" (${this._contadorIntervencionesSesion}/${this._configuracion.maxIntervencionesPorSesion}) [${this._modoActual}]`);
        
        if (this._modoActual === this._MODOS.GUIADO || this._modoActual === this._MODOS.ESPACIAL || intervencion.prioridad === 'alta') {
            this._mostrarIntervencion(intervencion);
        } else {
            setTimeout(() => {
                if (this._intervencionesPendientes.includes(intervencion)) {
                    this._mostrarIntervencion(intervencion);
                }
            }, 5000);
        }
    }

    _mostrarIntervencion(intervencion) {
        if (!intervencion || typeof intervencion !== 'object') return;
        if (!Array.isArray(intervencion.opciones) || intervencion.opciones.length === 0) {
            intervencion.opciones = [{ id: 'ok', label: '✅ Aceptar', accion: 'descartar' }];
        }
        
        const idx = this._intervencionesPendientes.findIndex(i => i && i.id === intervencion.id);
        if (idx !== -1) this._intervencionesPendientes.splice(idx, 1);
        
        this._historialIntervenciones.push({ ...intervencion, mostrada: Date.now() });
        if (this._historialIntervenciones.length > 100) this._historialIntervenciones = this._historialIntervenciones.slice(-100);
        
        const invasividad = this._configuracion.nivelInvasividad;
        
        if (this._modoActual === this._MODOS.GUIADO || this._modoActual === this._MODOS.ESPACIAL) {
            this._mostrarModalIntervencion(intervencion);
        } else if (invasividad === 'bajo') {
            this._mostrarNotificacionSuave(intervencion);
        } else if (invasividad === 'medio') {
            this._mostrarPanelLateral(intervencion);
        } else {
            this._mostrarModalIntervencion(intervencion);
        }
        
        window.dispatchEvent(new CustomEvent('tutorIntervencion', {
            detail: { intervencion: intervencion, nivelInvasividad: invasividad, timestamp: Date.now() }
        }));
    }

    // ============================================================
    // NOTIFICACIONES
    // ============================================================
    _mostrarNotificacionSuave(intervencion) {
        if (!intervencion) return;
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 80px; right: 20px; max-width: 380px;
            background: var(--white, #ffffff); border-radius: 12px; padding: 16px 20px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15); z-index: 99998;
            border-left: 4px solid ${this._getColorPrioridad(intervencion.prioridad)};
            animation: slideInRight 0.4s ease; font-family: var(--font, sans-serif);
            transition: all 0.3s ease;
        `;
        const opciones = Array.isArray(intervencion.opciones) ? intervencion.opciones : [{ id: 'ok', label: '✅ Aceptar', accion: 'descartar' }];
        toast.innerHTML = `
            <div style="display:flex;align-items:start;gap:10px;">
                <span style="font-size:24px;">${this._getIconoPrioridad(intervencion.prioridad)}</span>
                <div style="flex:1;">
                    <div style="font-size:13px;color:var(--dark);line-height:1.5;margin-bottom:8px;white-space:pre-wrap;">${intervencion.mensaje}</div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        ${opciones.map(op => `
                            <button class="intervencion-btn" data-accion="${op.accion}" data-id="${intervencion.id}" 
                                    style="padding:4px 12px;font-size:11px;border:none;border-radius:6px;cursor:pointer;font-family:var(--font);
                                    ${op.accion === 'ignorar' ? 'background:var(--light);color:var(--gray);' : 
                                      op.accion === 'descartar' || op.accion === 'posponer' ? 'background:var(--warning);color:var(--dark);' :
                                      'background:var(--primary);color:white;'}">
                                ${op.label}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <button class="cerrar-notificacion" style="background:none;border:none;font-size:18px;color:var(--gray);cursor:pointer;padding:0 4px;">&times;</button>
            </div>
        `;
        document.body.appendChild(toast);
        toast.querySelectorAll('.intervencion-btn').forEach(btn => {
            btn.addEventListener('click', () => { this._ejecutarAccion(btn.dataset.accion, intervencion); toast.remove(); });
        });
        toast.querySelector('.cerrar-notificacion').addEventListener('click', () => { toast.remove(); });
        setTimeout(() => {
            if (toast.parentNode) { toast.style.opacity = '0'; toast.style.transform = 'translateX(50px)';
                setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300); }
        }, 20000);
    }

    _mostrarPanelLateral(intervencion) {
        if (!intervencion) return;
        let panel = document.getElementById('tutorPanel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'tutorPanel';
            panel.style.cssText = `
                position: fixed; top: 50%; right: 0; transform: translateY(-50%);
                max-width: 340px; width: 90%; background: var(--white, #ffffff);
                border-radius: 12px 0 0 12px; padding: 20px;
                box-shadow: -4px 0 30px rgba(0,0,0,0.1); z-index: 99997;
                border-left: 4px solid ${this._getColorPrioridad(intervencion.prioridad)};
                animation: slideInRight 0.4s ease; font-family: var(--font, sans-serif);
                transition: all 0.3s ease; max-height: 80vh; overflow-y: auto;
            `;
            document.body.appendChild(panel);
        } else {
            panel.style.display = 'block';
            panel.style.animation = 'slideInRight 0.4s ease';
        }
        const historial = this._historialIntervenciones.slice(-5).map(i => 
            `<div style="font-size:11px;color:var(--gray-light);padding:4px 0;border-bottom:1px solid var(--light);">
                ${i.mensaje ? i.mensaje.substring(0, 60) + (i.mensaje.length > 60 ? '...' : '') : '(Mensaje vacío)'}
            </div>`
        ).join('');
        const opciones = Array.isArray(intervencion.opciones) ? intervencion.opciones : [{ id: 'ok', label: '✅ Aceptar', accion: 'descartar' }];
        const modoInfo = this.getModoInfo();
        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:24px;">🧠</span>
                    <span style="font-weight:700;font-size:16px;color:var(--dark);">Tutor Neuro V8.5</span>
                    <span style="font-size:10px;background:${modoInfo.bg};color:white;padding:1px 8px;border-radius:8px;">${modoInfo.icono}</span>
                </div>
                <button id="cerrarTutorPanel" style="background:none;border:none;font-size:20px;color:var(--gray);cursor:pointer;">&times;</button>
            </div>
            <div style="background:var(--bg);border-radius:8px;padding:12px;margin-bottom:12px;border-left:3px solid ${this._getColorPrioridad(intervencion.prioridad)};">
                <div style="font-size:14px;color:var(--dark);line-height:1.5;margin-bottom:10px;white-space:pre-wrap;">${intervencion.mensaje}</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    ${opciones.map(op => `
                        <button class="panel-intervencion-btn" data-accion="${op.accion}" data-id="${intervencion.id}" 
                                style="padding:4px 12px;font-size:11px;border:none;border-radius:6px;cursor:pointer;font-family:var(--font);
                                ${op.accion === 'ignorar' ? 'background:var(--light);color:var(--gray);' : 
                                  op.accion === 'descartar' || op.accion === 'posponer' ? 'background:var(--warning);color:var(--dark);' :
                                  'background:var(--primary);color:white;'}">
                            ${op.label}
                        </button>
                    `).join('')}
                </div>
            </div>
            ${historial ? `
                <div style="margin-top:12px;border-top:1px solid var(--light);padding-top:8px;">
                    <div style="font-size:11px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;">Últimas intervenciones</div>
                    ${historial}
                </div>
            ` : ''}
            <div style="margin-top:12px;font-size:10px;color:var(--gray-light);border-top:1px solid var(--light);padding-top:8px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;">
                <span>📊 ${this._contadorIntervencionesSesion}/${this._configuracion.maxIntervencionesPorSesion}</span>
                <span>📚 ${this._contextoUsuario.biblioteca.leidas}/${this._contextoUsuario.biblioteca.totalHistorias}</span>
                <span>🎯 ${this._mapaAprendizaje.microObjetivos.filter(m => !m.completado).length}</span>
                <span>${this._modoActual === this._MODOS.GUIADO ? '🔒 Guiado' : ''}</span>
                ${this._modoActual === this._MODOS.ESPACIAL ? '<span>🌌 Espacial</span>' : ''}
            </div>
        `;
        document.getElementById('cerrarTutorPanel').addEventListener('click', () => { panel.style.display = 'none'; });
        panel.querySelectorAll('.panel-intervencion-btn').forEach(btn => {
            btn.addEventListener('click', () => { this._ejecutarAccion(btn.dataset.accion, intervencion); panel.style.display = 'none'; });
        });
        this._panelVisible = true;
    }

    _mostrarModalIntervencion(intervencion) {
        if (!intervencion) return;
        if (!Array.isArray(intervencion.opciones) || intervencion.opciones.length === 0) {
            intervencion.opciones = [{ id: 'ok', label: '✅ Aceptar', accion: 'descartar' }];
        }
        if (window.uiCore && window.uiCore.confirm) {
            const opciones = intervencion.opciones;
            const opcionesTexto = opciones.map(o => `${o.label}`).join(' · ');
            if (this._modoActual === this._MODOS.GUIADO || this._modoActual === this._MODOS.ESPACIAL) {
                const bloqueo = this._modoActual === this._MODOS.GUIADO ? '🔒 Modo Guiado' : '🌌 Modo Espacial';
                const mensajeConBloqueo = `${intervencion.mensaje || 'Recomendación del Tutor'}\n\n${bloqueo}: No puedes ignorar esta recomendación.`;
                window.uiCore.confirm(`${mensajeConBloqueo}\n\n${opcionesTexto}`, `${bloqueo} V8.5`).then(respuesta => {
                    const idx = opciones.findIndex(o => o.label === respuesta);
                    if (idx !== -1) this._ejecutarAccion(opciones[idx].accion, intervencion);
                    else this._ejecutarAccion(opciones[0].accion, intervencion);
                });
            } else {
                window.uiCore.confirm(`${intervencion.mensaje || 'Recomendación del Tutor'}\n\n${opcionesTexto}`, '🧠 Tutor Neuro V8.5').then(respuesta => {
                    const idx = opciones.findIndex(o => o.label === respuesta);
                    if (idx !== -1) this._ejecutarAccion(opciones[idx].accion, intervencion);
                });
            }
        } else {
            alert(intervencion.mensaje || 'Recomendación del Tutor');
        }
    }

    // ============================================================
    // EJECUTAR ACCIONES - V8.5
    // ============================================================
    async _ejecutarAccion(accion, intervencion) {
        console.log(`🧠 Tutor: Ejecutando acción "${accion}"`);
        const core = window.uiCore || window.ui;
        
        if ((this._modoActual === this._MODOS.GUIADO || this._modoActual === this._MODOS.ESPACIAL) && !this._verificarPermiso(accion)) return;
        
        switch(accion) {
            case 'ir_a_gramatica': core?.irAModulo('grammar'); break;
            case 'ir_a_espacio': core?.irAModulo('espacio'); break;
            case 'ir_a_temas': core?.irAModulo('temas'); break;
            case 'ir_a_estudio': core?.irAModulo('study'); break;
            case 'ir_a_dashboard': core?.irAModulo('dashboard'); break;
            case 'ir_a_elipse': core?.irAModulo('elipse'); break;
            case 'ir_a_ondas_cruzadas': core?.irAModulo('ondasCruzadas'); break;
            case 'ir_a_caracteres': core?.irAModulo('caracteres'); break;
            case 'ir_a_tonos': core?.irAModulo('tonos'); break;
            case 'ir_a_biblioteca': core?.irAModulo('biblioteca'); break;
            case 'ir_a_tools': core?.irAModulo('tools'); break;
            case 'ir_radicales': core?.irAModulo('caracteres'); break;
            case 'ir_composicion': core?.irAModulo('caracteres'); break;
            case 'ir_escritura': core?.irAModulo('caracteres'); break;
            case 'ir_mnemotecnia': core?.irAModulo('caracteres'); break;
            case 'ejecutar_recomendacion':
                if (intervencion?.contexto?.moduloRecomendado) {
                    const modulo = intervencion.contexto.moduloRecomendado;
                    if (modulo === 'estudiar_tema') {
                        const tema = this._contextoUsuario.temas.temaRecomendado;
                        if (tema) { await pipeline.estudiarTema(tema.id); core?.irAModulo('study'); }
                        else core?.irAModulo('temas');
                    } else if (modulo === 'caracteres' || modulo === 'espacial') {
                        core?.irAModulo('caracteres');
                    } else {
                        core?.irAModulo(modulo);
                    }
                } else core?.irAModulo('study');
                break;
            case 'activar_modo_inverso': if (modoInverso) { modoInverso.toggle(); if (core && typeof core.mostrarToast === 'function') core.mostrarToast('🔄 Modo Inverso activado', 'info'); } break;
            case 'activar_modo_expres': if (window.UIEspacio && window.UIEspacio._modoExpres) await window.UIEspacio._modoExpres(); else if (core && typeof core.mostrarToast === 'function') core.mostrarToast('⚡ Modo Exprés activado', 'info'); break;
            case 'cambiar_modo_estudio':
                if (window.UIStudy && window.UIStudy.cambiarModoEstudio) {
                    const modos = ['flashcard', 'escritura', 'multiple', 'escucha'];
                    const modoActual = window.UIStudy._modoEstudio || 'flashcard';
                    const idx = modos.indexOf(modoActual);
                    const siguiente = modos[(idx + 1) % modos.length];
                    window.UIStudy.cambiarModoEstudio(siguiente);
                    if (core && typeof core.mostrarToast === 'function') {
                        core.mostrarToast(`🔄 Modo cambiado a ${siguiente}`, 'info');
                    }
                }
                break;
            case 'sugerir_descanso': if (core && typeof core.mostrarToast === 'function') core.mostrarToast('☕ Tómate un descanso de 5 minutos. ¡Tu cerebro lo agradecerá!', 'success'); break;
            case 'añadir_a_lista':
                if (intervencion?.contexto?.palabra) {
                    const palabra = intervencion.contexto.palabra;
                    try {
                        const lista = JSON.parse(localStorage.getItem('pipeline_lista_repaso') || '[]');
                        if (!lista.includes(palabra)) { lista.push(palabra); localStorage.setItem('pipeline_lista_repaso', JSON.stringify(lista)); }
                    } catch (e) {}
                    if (core && typeof core.mostrarToast === 'function') {
                        core.mostrarToast(`📝 "${palabra}" añadida a tu lista de repaso`, 'success');
                    }
                }
                break;
            case 'ver_estadisticas': core?.irAModulo('stats'); break;
            case 'ver_ruta': await this._mostrarRutaCompleta(); break;
            case 'ver_logros': this._mostrarLogros(); break;
            case 'estudiar_tema_recomendado':
            case 'estudiar_tema': await this._estudiarTemaRecomendado(); break;
            case 'ejecutar_paso_learning_path':
            case 'ejecutar_paso':
                if (window.LearningPath) { await window.LearningPath.ejecutarPasoActual(); if (this._modoActual === this._MODOS.GUIADO && core && typeof core.irAModulo === 'function') core.irAModulo('study'); }
                else if (core && typeof core.mostrarToast === 'function') core.mostrarToast('❌ Learning Path no disponible', 'error');
                break;
            case 'generar_nueva_ruta':
                if (window.LearningPath) await window.LearningPath.regenerarRuta();
                else if (core && typeof core.mostrarToast === 'function') core.mostrarToast('❌ Learning Path no disponible', 'error');
                break;
            case 'recomendar_cambio_estrategia': this._mostrarCambioEstrategia(); break;
            case 'aceptar_micro_objetivo':
                const pendientes = this._mapaAprendizaje.microObjetivos.filter(m => !m.completado);
                if (pendientes.length > 0) {
                    const micro = pendientes[0];
                    const modulo = micro.modulo || 'study';
                    if (core && typeof core.mostrarToast === 'function') {
                        core.mostrarToast(`🎯 Aceptado: "${micro.titulo}" - ¡Ve a ${modulo}!`, 'success');
                    }
                    if (core && typeof core.irAModulo === 'function') {
                        core.irAModulo(modulo);
                    }
                }
                break;
            case 'ver_micro_objetivos':
                this._mostrarMicroObjetivos();
                break;
            case 'leer_recomendacion':
                core?.irAModulo('biblioteca');
                setTimeout(() => {
                    if (window.UIBiblioteca && window.UIBiblioteca._abrirHistoria) {
                        const historias = window.UIBiblioteca._historias || [];
                        const sinLeer = historias.filter(h => !h._leida);
                        if (sinLeer.length > 0) {
                            window.UIBiblioteca._abrirHistoria(sinLeer[0].id);
                        }
                    }
                }, 500);
                break;
            case 'posponer': if (core && typeof core.mostrarToast === 'function') core.mostrarToast('⏰ Recomendación pospuesta.', 'info'); break;
            case 'descartar': break;
            case 'ignorar':
                if (this._modoActual === this._MODOS.GUIADO || this._modoActual === this._MODOS.ESPACIAL) {
                    if (core && typeof core.mostrarToast === 'function') {
                        core.mostrarToast(`🚫 ${this._modoActual === this._MODOS.GUIADO ? 'Modo Guiado' : 'Modo Espacial'}: No puedes ignorar las recomendaciones.`, 'warning');
                    }
                }
                break;
            default: console.warn(`⚠️ Acción desconocida: ${accion}`);
        }
    }

    // ============================================================
    // MOSTRAR MICRO-OBJETIVOS - V8.5
    // ============================================================
    _mostrarMicroObjetivos() {
        const micros = this._mapaAprendizaje.microObjetivos;
        const completados = micros.filter(m => m.completado);
        const pendientes = micros.filter(m => !m.completado);
        
        let mensaje = '🎯 **MICRO-OBJETIVOS**\n\n';
        mensaje += `📊 Completados: ${completados.length}/${micros.length}\n`;
        mensaje += `📈 Puntos: +${completados.reduce((acc, m) => acc + (m.recompensa || 0), 0)}\n\n`;
        
        if (pendientes.length === 0) {
            mensaje += '🎉 ¡Has completado todos los micro-objetivos!\n';
            mensaje += '🏆 Pronto se generarán nuevos.';
        } else {
            mensaje += '📋 **PENDIENTES:**\n\n';
            for (const m of pendientes) {
                const emoji = m.tipo === 'caracter' ? '🀄' : m.tipo === 'radical' ? '🌀' : '⏳';
                mensaje += `  ${emoji} **${m.titulo}**\n`;
                mensaje += `     ${m.descripcion}\n`;
                mensaje += `     +${m.recompensa || 5} pts · ${m.modulo || 'study'}\n\n`;
            }
        }
        
        if (this._core && typeof this._core.alert === 'function') {
            this._core.alert(mensaje, '🎯 Micro-objetivos del Tutor V8.5');
        } else {
            alert(mensaje);
        }
    }

    // ============================================================
    // MOSTRAR LOGROS - V8.5
    // ============================================================
    _mostrarLogros() {
        const logros = this._mapaAprendizaje.logrosDesbloqueados || [];
        const totalLogros = Object.keys(this._LOGROS).length;
        let mensaje = '🏆 **TUS LOGROS**\n\n';
        mensaje += `📊 Desbloqueados: ${logros.length}/${totalLogros}\n`;
        mensaje += `📈 Puntos de experiencia: ${this._mapaAprendizaje.puntosExperiencia || 0}\n`;
        mensaje += `🧠 Nivel de Tutor: ${this._mapaAprendizaje.nivelTutor || 1}\n\n`;
        if (logros.length === 0) {
            mensaje += '💪 Sigue estudiando para desbloquear tus primeros logros.\n';
            mensaje += '📚 Completa frases, temas y explora todos los módulos.';
        } else {
            mensaje += '📋 **LOGROS DESBLOQUEADOS:**\n\n';
            for (const id of logros) {
                const logro = this._LOGROS[id];
                if (logro) mensaje += `  ${logro.nombre}\n     ${logro.descripcion}\n\n`;
            }
            const pendientes = Object.keys(this._LOGROS).filter(id => !logros.includes(id));
            if (pendientes.length > 0) {
                mensaje += '🔒 **PRÓXIMOS LOGROS:**\n\n';
                for (const id of pendientes.slice(0, 5)) {
                    const logro = this._LOGROS[id];
                    if (logro) mensaje += `  ${logro.nombre} (+${logro.puntos} pts)\n`;
                }
                if (pendientes.length > 5) mensaje += `  ... y ${pendientes.length - 5} más`;
            }
        }
        if (this._core && typeof this._core.alert === 'function') {
            this._core.alert(mensaje, '🏆 Logros del Tutor Neuro V8.5');
        } else {
            alert(mensaje);
        }
    }

    // ============================================================
    // MOSTRAR CAMBIO DE ESTRATEGIA - V8.5
    // ============================================================
    _mostrarCambioEstrategia() {
        const esJeroglifico = this._esJeroglifico(this._obtenerIdiomaActual());
        let mensaje = '🧠 **CAMBIO DE ESTRATEGIA RECOMENDADO**\n\n' +
            '📊 Basado en tu progreso, te sugiero probar una de estas estrategias:\n\n' +
            '1️⃣ **Enfoque en repaso** - Dedica 15 min a repasar frases con RCN bajo\n' +
            '2️⃣ **Nuevo módulo** - Explora un módulo que no hayas usado aún\n' +
            '3️⃣ **Ruta guiada** - Usa el Learning Path para seguir un plan estructurado\n' +
            '4️⃣ **Descanso activo** - Cambia a un tema diferente para refrescar la mente\n' +
            '5️⃣ **Micro-objetivos** - Completa micro-objetivos para progreso constante\n' +
            '6️⃣ **Lectura en Biblioteca** - Mejora comprensión con historias\n';
        
        if (esJeroglifico) {
            mensaje += '7️⃣ **🌌 Modo Espacial** - Estudia caracteres con métodos visuales\n';
            mensaje += '8️⃣ **🌀 Radicales** - Aprende los bloques de construcción de caracteres\n';
            mensaje += '9️⃣ **✍️ Escritura** - Practica el orden de trazos\n';
        }
        
        mensaje += '\n💡 Elige la que mejor se adapte a tu momento actual.';
        if (this._core && typeof this._core.alert === 'function') {
            this._core.alert(mensaje, '🧠 Cambio de Estrategia V8.5');
        } else {
            alert(mensaje);
        }
    }

    // ============================================================
    // MOSTRAR RUTA COMPLETA - V8.5
    // ============================================================
    async _mostrarRutaCompleta() {
        let ruta = [];
        let progreso = { completados: 0, total: 0, porcentaje: 0 };
        if (window.LearningPath) {
            ruta = window.LearningPath.getRutaCompleta();
            progreso = window.LearningPath.getProgreso();
        }
        if (ruta.length === 0) ruta = this._mapaAprendizaje.rutaActual;
        if (ruta.length === 0) {
            if (this._core && typeof this._core.mostrarToast === 'function') {
                this._core.mostrarToast('📭 No hay temas en tu ruta de aprendizaje.', 'warning');
            }
            return;
        }

        this._rutaFiltrada = [...ruta];
        this._paginaActualRuta = 1;
        this._busquedaRuta = '';
        this._modalRutaAbierto = true;
        this._renderizarModalRuta(ruta, progreso);
    }

    _renderizarModalRuta(rutaCompleta, progreso) {
        const existing = document.getElementById('modalRutaCompleta');
        if (existing) existing.remove();

        const nivelActual = this._contextoUsuario.nivel || 'A1';
        const nombreUsuario = this._contextoUsuario.nombre || 'Usuario';
        const total = this._rutaFiltrada.length;
        const totalPaginas = Math.max(1, Math.ceil(total / this._pasosPorPagina));
        if (this._paginaActualRuta > totalPaginas) this._paginaActualRuta = totalPaginas;
        if (this._paginaActualRuta < 1) this._paginaActualRuta = 1;

        const inicio = (this._paginaActualRuta - 1) * this._pasosPorPagina;
        const fin = Math.min(inicio + this._pasosPorPagina, total);
        const pasosPagina = this._rutaFiltrada.slice(inicio, fin);

        const overlay = document.createElement('div');
        overlay.id = 'modalRutaCompleta';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); backdrop-filter: blur(12px); z-index: 100001;
            display: flex; justify-content: center; align-items: center; padding: 20px;
            animation: fadeIn 0.3s ease;
        `;

        const coloresNivel = { 'A1': '#6C5CE7', 'A2': '#0984E3', 'B1': '#00B894', 'B2': '#FDCB6E', 'C1': '#E17055', 'C2': '#FD79A8' };
        const emojisNivel = { 'A1': '🌱', 'A2': '🌿', 'B1': '🌳', 'B2': '🌲', 'C1': '🏔️', 'C2': '🗻' };

        let temasHTML = '';
        for (let i = 0; i < pasosPagina.length; i++) {
            const tema = pasosPagina[i];
            const nombreTema = tema.titulo || tema.nombre || tema.tema || `Paso ${i+1}`;
            const estado = tema.completado ? '✅' : ((tema.porcentaje || 0) > 0 ? '🔄' : '⏳');
            const progresoItem = tema.porcentaje || 0;
            const icono = tema.icono || '📁';
            const colorNivel = coloresNivel[tema.nivel] || '#6C5CE7';
            const emojiNivel = emojisNivel[tema.nivel] || '📚';
            const esSiguiente = i === 0 && !tema.completado && this._paginaActualRuta === 1;
            const descripcion = tema.descripcion || '';
            const historias = tema.historias || 0;
            
            let textoEstado = '⏳ Pendiente', colorEstado = 'var(--gray-light)';
            if (tema.completado) { textoEstado = '✅ Completado'; colorEstado = 'var(--success)'; }
            else if ((tema.porcentaje || 0) > 0) { textoEstado = `🔄 ${tema.porcentaje}%`; colorEstado = 'var(--warning)'; }
            
            let nombreDestacado = nombreTema;
            if (this._busquedaRuta) {
                const regex = new RegExp(`(${this._busquedaRuta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                nombreDestacado = nombreTema.replace(regex, '<mark style="background:#FDCB6E;padding:0 4px;border-radius:2px;">$1</mark>');
            }
            
            temasHTML += `
                <div style="background: ${esSiguiente ? 'var(--primary)04' : 'var(--white)'}; border-radius: 12px;
                     padding: 14px 18px; margin-bottom: 10px; border-left: 4px solid ${esSiguiente ? 'var(--primary)' : colorNivel};
                     border: ${esSiguiente ? '2px solid var(--primary)' : '1px solid var(--light)'};
                     box-shadow: ${esSiguiente ? '0 4px 20px rgba(108,92,231,0.15)' : 'var(--shadow)'};
                     transition: all 0.3s ease; position: relative;">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                        <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:200px;">
                            <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;
                                 background: ${esSiguiente ? 'var(--primary)' : 'var(--bg)'}; color: ${esSiguiente ? 'white' : 'var(--gray)'};
                                 font-size:12px;font-weight:700;flex-shrink:0;">${inicio + i + 1}</span>
                            <span style="font-size:22px;">${icono}</span>
                            <div>
                                <div style="font-size:15px;font-weight:700;color:var(--dark);">
                                    ${nombreDestacado}
                                    ${esSiguiente ? '<span style="font-size:10px;background:var(--primary);color:white;padding:1px 10px;border-radius:12px;margin-left:8px;">🎯 SIGUIENTE</span>' : ''}
                                </div>
                                <div style="display:flex;gap:8px;font-size:11px;color:var(--gray);flex-wrap:wrap;">
                                    <span>${emojiNivel} ${tema.nivel || 'A1'}</span>
                                    <span>📚 ${historias || 0} historias</span>
                                    <span style="color:${colorEstado};">${textoEstado}</span>
                                    ${descripcion ? `<span style="color:var(--gray-light);">· ${descripcion}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div style="width:100px;height:6px;background:var(--bg);border-radius:3px;overflow:hidden;">
                                <div style="height:100%;width:${progresoItem}%;background:${tema.completado ? 'var(--success)' : 'var(--primary)'};border-radius:3px;transition:width 0.8s ease;"></div>
                            </div>
                            <span style="font-size:12px;font-weight:600;color:${tema.completado ? 'var(--success)' : 'var(--primary)'};">${progresoItem}%</span>
                            ${!tema.completado && esSiguiente ? `
                                <button onclick="document.getElementById('modalRutaCompleta').remove(); window.tutorNeuro._estudiarTemaRecomendado();" 
                                        style="padding:4px 12px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;font-family:var(--font);transition:all 0.3s;"
                                        onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                                    <i class="fas fa-play"></i> Estudiar
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    ${esSiguiente ? `
                        <div style="margin-top:6px;font-size:10px;color:var(--primary);font-weight:600;">
                            ⚡ ${descripcion || 'Tema recomendado para estudiar ahora'}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        const modoInfo = this.getModoInfo();
        const modoBg = this._getModoBg(this._modoActual);

        overlay.innerHTML = `
            <div style="background: var(--white, #ffffff); border-radius: 20px; padding: 28px 30px;
                 max-width: 780px; width: 100%; max-height: 90vh; display: flex; flex-direction: column;
                 box-shadow: 0 30px 80px rgba(0,0,0,0.4); animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                 font-family: var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:12px;flex-shrink:0;">
                    <div>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="font-size:32px;">🧠</span>
                            <div>
                                <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                                    Ruta de Aprendizaje V8.5
                                    <span style="font-size:13px;font-weight:400;color:var(--gray-light);">(${total} pasos)</span>
                                </h2>
                                <p style="font-size:13px;color:var(--gray);margin:2px 0 0;">
                                    <span style="font-weight:600;color:var(--dark);">${nombreUsuario}</span> · Nivel <strong>${nivelActual}</strong>
                                    <span style="display:inline-block;margin-left:8px;padding:2px 12px;border-radius:12px;background:${modoBg};color:white;font-size:10px;font-weight:600;">
                                        ${modoInfo.icono} ${modoInfo.nombre}
                                    </span>
                                    ${this._modoActual === this._MODOS.GUIADO ? '<span style="display:inline-block;margin-left:4px;padding:2px 8px;border-radius:8px;background:#6C5CE7;color:white;font-size:9px;">🔒 Guiado</span>' : ''}
                                    ${this._modoActual === this._MODOS.ESPACIAL ? '<span style="display:inline-block;margin-left:4px;padding:2px 8px;border-radius:8px;background:#00CEC9;color:white;font-size:9px;">🌌 Espacial</span>' : ''}
                                    <span style="display:inline-block;margin-left:4px;padding:2px 8px;border-radius:8px;background:var(--success)20;color:var(--success);font-size:9px;">
                                        📚 ${this._contextoUsuario.biblioteca.leidas}/${this._contextoUsuario.biblioteca.totalHistorias}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <button onclick="document.getElementById('modalRutaCompleta').remove(); window.tutorNeuro._modalRutaAbierto = false;" 
                            style="background:none;border:none;font-size:28px;color:var(--gray);cursor:pointer;transition:all 0.3s;padding:0 8px;"
                            onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--gray)'">
                        &times;
                    </button>
                </div>

                <div style="display:flex;gap:10px;margin-bottom:12px;flex-shrink:0;align-items:center;flex-wrap:wrap;">
                    <div style="flex:1;min-width:200px;position:relative;">
                        <i class="fas fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gray);"></i>
                        <input type="text" id="buscarEnRuta" 
                               placeholder="🔍 Buscar paso por nombre, descripción o nivel..." 
                               style="width:100%;padding:8px 14px 8px 38px;border:2px solid var(--light);border-radius:10px;font-size:14px;font-family:var(--font);transition:all 0.3s;"
                               oninput="window.tutorNeuro._filtrarRuta(this.value)"
                               value="${this._busquedaRuta}">
                    </div>
                    ${this._busquedaRuta ? `
                        <button class="btn-secondary" onclick="window.tutorNeuro._limpiarBusquedaRuta()" 
                                style="padding:6px 14px;font-size:12px;background:var(--danger);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-times"></i> Limpiar
                        </button>
                    ` : ''}
                    <span style="font-size:11px;color:var(--gray-light);">
                        ${this._busquedaRuta ? `${total} resultados` : ''}
                    </span>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:8px;margin-bottom:12px;flex-shrink:0;">
                    <div style="background:var(--bg);border-radius:10px;padding:8px 12px;text-align:center;border-top:3px solid var(--primary);">
                        <div style="font-size:18px;font-weight:800;color:var(--primary);">${progreso.total || total}</div>
                        <div style="font-size:8px;color:var(--gray);text-transform:uppercase;font-weight:600;">Temas</div>
                    </div>
                    <div style="background:var(--bg);border-radius:10px;padding:8px 12px;text-align:center;border-top:3px solid var(--success);">
                        <div style="font-size:18px;font-weight:800;color:var(--success);">${progreso.completados || 0}</div>
                        <div style="font-size:8px;color:var(--gray);text-transform:uppercase;font-weight:600;">Completados</div>
                    </div>
                    <div style="background:var(--bg);border-radius:10px;padding:8px 12px;text-align:center;border-top:3px solid var(--warning);">
                        <div style="font-size:18px;font-weight:800;color:var(--warning);">${total - (progreso.completados || 0)}</div>
                        <div style="font-size:8px;color:var(--gray);text-transform:uppercase;font-weight:600;">Pendientes</div>
                    </div>
                    <div style="background:var(--bg);border-radius:10px;padding:8px 12px;text-align:center;border-top:3px solid var(--secondary);">
                        <div style="font-size:18px;font-weight:800;color:var(--secondary);">${progreso.porcentaje || 0}%</div>
                        <div style="font-size:8px;color:var(--gray);text-transform:uppercase;font-weight:600;">Progreso</div>
                    </div>
                    <div style="background:var(--bg);border-radius:10px;padding:8px 12px;text-align:center;border-top:3px solid #FDCB6E;">
                        <div style="font-size:18px;font-weight:800;color:#FDCB6E;">${this._mapaAprendizaje.microObjetivos.filter(m => !m.completado).length}</div>
                        <div style="font-size:8px;color:var(--gray);text-transform:uppercase;font-weight:600;">Micros</div>
                    </div>
                </div>

                <div style="flex:1;overflow-y:auto;margin-bottom:12px;min-height:200px;padding-right:4px;">
                    ${temasHTML || `
                        <div style="text-align:center;padding:30px;color:var(--gray);">
                            <i class="fas fa-search" style="font-size:32px;color:var(--gray-light);display:block;margin-bottom:8px;"></i>
                            <p>No se encontraron pasos con "<strong>${this._busquedaRuta}</strong>"</p>
                        </div>
                    `}
                </div>

                ${totalPaginas > 1 ? `
                    <div style="display:flex;align-items:center;gap:8px;justify-content:center;flex-shrink:0;padding-top:12px;border-top:1px solid var(--light);flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.tutorNeuro._irPaginaRuta(${this._paginaActualRuta - 1})" 
                                style="padding:6px 14px;font-size:12px;${this._paginaActualRuta <= 1 ? 'opacity:0.5;cursor:default;' : ''}" 
                                ${this._paginaActualRuta <= 1 ? 'disabled' : ''}
                                onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-chevron-left"></i> Anterior
                        </button>
                        <span style="font-size:13px;color:var(--gray);">
                            Página <span style="font-weight:700;color:var(--dark);">${this._paginaActualRuta}</span> de <span style="font-weight:700;color:var(--dark);">${totalPaginas}</span>
                        </span>
                        <button class="btn-secondary" onclick="window.tutorNeuro._irPaginaRuta(${this._paginaActualRuta + 1})" 
                                style="padding:6px 14px;font-size:12px;${this._paginaActualRuta >= totalPaginas ? 'opacity:0.5;cursor:default;' : ''}" 
                                ${this._paginaActualRuta >= totalPaginas ? 'disabled' : ''}
                                onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                            Siguiente <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                ` : ''}

                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding-top:12px;border-top:1px solid var(--light);font-size:10px;color:var(--gray-light);flex-shrink:0;">
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        <span>📌 Mostrando ${Math.max(1, inicio + 1)}-${Math.min(fin, total)} de ${total}</span>
                        <span>📄 ${totalPaginas} páginas</span>
                        ${this._busquedaRuta ? `<span>🔎 Filtrado: "${this._busquedaRuta}"</span>` : ''}
                        ${this._modoActual === this._MODOS.GUIADO ? '<span>🔒 Modo Guiado</span>' : ''}
                        ${this._modoActual === this._MODOS.ESPACIAL ? '<span>🌌 Modo Espacial</span>' : ''}
                        <span>📚 ${this._contextoUsuario.biblioteca.leidas}/${this._contextoUsuario.biblioteca.totalHistorias}</span>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-secondary" onclick="window.tutorNeuro._mostrarMicroObjetivos()" 
                                style="padding:4px 12px;font-size:10px;background:var(--warning);color:var(--dark);border:none;border-radius:4px;cursor:pointer;">
                            🎯 Micros
                        </button>
                        <button class="btn-secondary" onclick="document.getElementById('modalRutaCompleta').remove(); window.tutorNeuro._modalRutaAbierto = false;" 
                                style="padding:4px 16px;font-size:11px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;"
                                onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-check"></i> Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); this._modalRutaAbierto = false; } });
        const escapeHandler = (e) => {
            if (e.key === 'Escape') { if (overlay.parentNode) { overlay.remove(); this._modalRutaAbierto = false; } document.removeEventListener('keydown', escapeHandler); }
        };
        document.addEventListener('keydown', escapeHandler);
        overlay._escapeHandler = escapeHandler;
        this._actualizarBadgeTutor();
    }

    _filtrarRuta(texto) {
        this._busquedaRuta = texto.trim();
        this._paginaActualRuta = 1;
        let ruta = [];
        if (window.LearningPath) ruta = window.LearningPath.getRutaCompleta();
        if (ruta.length === 0) ruta = this._mapaAprendizaje.rutaActual;
        if (this._busquedaRuta) {
            const busquedaLower = this._busquedaRuta.toLowerCase();
            this._rutaFiltrada = ruta.filter(paso => {
                const titulo = (paso.titulo || paso.nombre || paso.tema || '').toLowerCase();
                const descripcion = (paso.descripcion || '').toLowerCase();
                const nivel = (paso.nivel || '').toLowerCase();
                const tipo = (paso.tipo || '').toLowerCase();
                return titulo.includes(busquedaLower) || descripcion.includes(busquedaLower) || nivel.includes(busquedaLower) || tipo.includes(busquedaLower);
            });
        } else this._rutaFiltrada = [...ruta];
        let progreso = { completados: 0, total: this._rutaFiltrada.length, porcentaje: 0 };
        if (this._rutaFiltrada.length > 0) {
            const completados = this._rutaFiltrada.filter(p => p.completado).length;
            progreso.completados = completados;
            progreso.porcentaje = Math.round((completados / this._rutaFiltrada.length) * 100);
        }
        this._renderizarModalRuta(this._rutaFiltrada, progreso);
    }

    _limpiarBusquedaRuta() {
        this._busquedaRuta = '';
        this._paginaActualRuta = 1;
        let ruta = [];
        if (window.LearningPath) ruta = window.LearningPath.getRutaCompleta();
        if (ruta.length === 0) ruta = this._mapaAprendizaje.rutaActual;
        this._rutaFiltrada = [...ruta];
        let progreso = { completados: 0, total: this._rutaFiltrada.length, porcentaje: 0 };
        if (this._rutaFiltrada.length > 0) {
            const completados = this._rutaFiltrada.filter(p => p.completado).length;
            progreso.completados = completados;
            progreso.porcentaje = Math.round((completados / this._rutaFiltrada.length) * 100);
        }
        this._renderizarModalRuta(this._rutaFiltrada, progreso);
    }

    _irPaginaRuta(pagina) {
        const total = this._rutaFiltrada.length;
        const totalPaginas = Math.max(1, Math.ceil(total / this._pasosPorPagina));
        if (pagina < 1 || pagina > totalPaginas) return;
        this._paginaActualRuta = pagina;
        let ruta = [];
        if (window.LearningPath) ruta = window.LearningPath.getRutaCompleta();
        if (ruta.length === 0) ruta = this._mapaAprendizaje.rutaActual;
        let progreso = { completados: 0, total: this._rutaFiltrada.length, porcentaje: 0 };
        if (this._rutaFiltrada.length > 0) {
            const completados = this._rutaFiltrada.filter(p => p.completado).length;
            progreso.completados = completados;
            progreso.porcentaje = Math.round((completados / this._rutaFiltrada.length) * 100);
        }
        this._renderizarModalRuta(this._rutaFiltrada, progreso);
    }

    // ============================================================
    // ACTUALIZAR BADGE DEL TUTOR - V8.5
    // ============================================================
    _actualizarBadgeTutor() {
        let badge = document.getElementById('tutorBadge');
        if (!badge) {
            const headerRight = document.querySelector('.header-right');
            if (!headerRight) return;
            badge = document.createElement('span');
            badge.id = 'tutorBadge';
            badge.className = 'tutor-badge';
            badge.style.cssText = `
                display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 12px;
                font-size: 10px; font-weight: 600; background: var(--primary)15; color: var(--primary);
                border: 1px solid var(--primary)30; cursor: pointer; transition: all 0.3s ease; margin-left: 8px;
            `;
            badge.innerHTML = '🧠 Tutor V8';
            badge.onclick = () => {
                const container = document.getElementById('tutorUnificadoContainer');
                if (container) container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (this._intervencionesPendientes.length > 0) this._mostrarIntervencion(this._intervencionesPendientes[0]);
            };
            headerRight.appendChild(badge);
        }
        if (badge) {
            try {
                const pendientes = this._intervencionesPendientes;
                const esGuiado = this._modoActual === this._MODOS.GUIADO;
                const esEspacial = this._modoActual === this._MODOS.ESPACIAL;
                const microPendientes = this._mapaAprendizaje.microObjetivos.filter(m => !m.completado).length;
                const logrosCount = this._mapaAprendizaje.logrosDesbloqueados?.length || 0;
                const caracteresCount = this._mapaAprendizaje.espacial.caracteresAprendidos?.length || 0;
                const refrescoInfo = this._metricasRefresco.totalRefrescos > 0 ? `🔄${this._metricasRefresco.totalRefrescos}` : '';
                
                let badgeText = '🧠 V8.5';
                if (esGuiado) badgeText += ' 🔒';
                if (esEspacial) badgeText += ' 🌌';
                if (pendientes.length > 0) badgeText += ` (${pendientes.length})`;
                if (microPendientes > 0) badgeText += ` 🎯${microPendientes}`;
                if (logrosCount > 0) badgeText += ` 🏆${logrosCount}`;
                if (caracteresCount > 0 && esEspacial) badgeText += ` 🀄${caracteresCount}`;
                if (refrescoInfo) badgeText += ` ${refrescoInfo}`;
                
                badge.innerHTML = badgeText;
                badge.title = `Refrescos automáticos: ${this._metricasRefresco.totalRefrescos} · Último: ${this._metricasRefresco.ultimoRefresco || 'N/A'}`;
                
                if (pendientes.length > 0) {
                    badge.classList.add('has-intervencion');
                    badge.style.background = esGuiado || esEspacial ? 'var(--warning)20' : 'var(--warning)15';
                    badge.style.borderColor = esGuiado || esEspacial ? 'var(--warning)' : 'var(--warning)';
                    badge.style.color = esGuiado || esEspacial ? 'var(--warning)' : 'var(--warning)';
                } else {
                    badge.classList.remove('has-intervencion');
                    badge.style.background = esGuiado || esEspacial ? 'var(--primary)20' : 'var(--primary)15';
                    badge.style.borderColor = esGuiado || esEspacial ? 'var(--primary)' : 'var(--primary)30';
                    badge.style.color = esGuiado || esEspacial ? 'var(--primary)' : 'var(--primary)';
                }
            } catch (e) { console.warn('⚠️ Error actualizando badge:', e); }
        }
    }

    // ============================================================
    // RECOMENDAR SIGUIENTE TEMA - V8.5
    // ============================================================
    _recomendarSiguienteTema(forzar = false) {
        if (this._modoActual === this._MODOS.LIBRE && !forzar) {
            console.log('📴 Modo Libre: No se recomienda automáticamente');
            return;
        }
        if (this._modoActual === this._MODOS.GUIADO) forzar = true;
        const nivelReal = this._contextoUsuario.nivel || 'A1';
        
        if (window.LearningPath) {
            const pasoActual = window.LearningPath.getPasoActual();
            if (pasoActual) {
                const nivelPaso = pasoActual.nivel || 'A1';
                if (this._esNivelValidoParaUsuario(nivelPaso, nivelReal)) {
                    const nombrePaso = pasoActual.titulo || pasoActual.nombre || pasoActual.tema || 'Paso actual';
                    this._agregarIntervencion({
                        id: 'learning_path_paso_' + Date.now(),
                        reglaId: 'learning_path_paso',
                        prioridad: 'media',
                        mensaje: `🧭 **Paso actual de tu ruta:** "${nombrePaso}"\n\n${pasoActual.descripcion || ''}`,
                        opciones: this._crearOpcionesPorModo([
                            { id: 'ejecutar_paso', label: '▶️ Ir al paso', accion: 'ejecutar_paso_learning_path' }
                        ], [
                            { id: 'ejecutar_paso', label: '▶️ Ir al paso', accion: 'ejecutar_paso_learning_path' },
                            { id: 'ver_ruta', label: '🗺️ Ver ruta completa', accion: 'ver_ruta' },
                            { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                            { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
                        ]),
                        timestamp: Date.now(),
                        contexto: { paso: pasoActual }
                    });
                    return;
                } else {
                    console.log(`⚠️ Paso "${nombrePaso}" es nivel ${nivelPaso}, usuario es ${nivelReal}. Regenerando...`);
                    window.LearningPath._rutaActual = null;
                    window.LearningPath._pasoActual = 0;
                    localStorage.removeItem('pipeline_learning_path');
                    setTimeout(() => window.LearningPath.generarRuta(true), 500);
                    return;
                }
            }
        }
        
        const ruta = this._mapaAprendizaje.rutaActual;
        if (ruta.length === 0) { this._construirMapaAprendizaje(); return; }
        const temasFiltrados = ruta.filter(t => this._esNivelValidoParaUsuario(t.nivel || 'A1', nivelReal));
        if (temasFiltrados.length === 0) { this._construirMapaAprendizaje(); return; }
        const siguiente = temasFiltrados.find(t => !t.completado);
        if (!siguiente) {
            this._agregarIntervencion({
                id: 'ruta_completada_' + Date.now(),
                reglaId: 'ruta_completada',
                prioridad: 'media',
                mensaje: `🎉 ¡Has completado todos los temas de tu nivel actual! (${nivelReal})\n\n¿Quieres generar contenido nuevo o subir de nivel?`,
                opciones: this._crearOpcionesPorModo([
                    { id: 'generar_nueva_ruta', label: '🔄 Generar nueva ruta', accion: 'generar_nueva_ruta' }
                ], [
                    { id: 'generar_nueva_ruta', label: '🔄 Generar nueva ruta', accion: 'generar_nueva_ruta' },
                    { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                    { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
                ]),
                timestamp: Date.now()
            });
            return;
        }
        const nombreTema = siguiente.titulo || siguiente.nombre || siguiente.tema || 'Tema';
        const progreso = siguiente.porcentaje || 0;
        const mensajeProgreso = progreso > 0 ? ` (${progreso}% completado)` : '';
        this._agregarIntervencion({
            id: 'siguiente_tema_' + Date.now(),
            reglaId: 'siguiente_tema',
            prioridad: 'media',
            mensaje: `🧠 **Siguiente tema recomendado:** "${nombreTema}"${mensajeProgreso}\n\n📊 Nivel: ${siguiente.nivel || nivelReal} · 📚 ${siguiente.historias || 0} historias${this._modoActual === this._MODOS.GUIADO ? '\n🚀 Modo Guiado: Debes estudiar este tema.' : ''}`,
            opciones: this._crearOpcionesPorModo([
                { id: 'estudiar_tema', label: '📖 Estudiar ahora', accion: 'estudiar_tema_recomendado' }
            ], [
                { id: 'estudiar_tema', label: '📖 Estudiar ahora', accion: 'estudiar_tema_recomendado' },
                { id: 'ver_ruta', label: '🗺️ Ver ruta', accion: 'ver_ruta' },
                { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
            ]),
            timestamp: Date.now(),
            contexto: { tema: nombreTema, nivel: siguiente.nivel || nivelReal, progreso: progreso, historias: siguiente.historias || 0, totalTemas: ruta.length }
        });
        if (this._modoActual === this._MODOS.GUIADO) {
            const pendientes = this._intervencionesPendientes;
            if (pendientes.length > 0) this._mostrarIntervencion(pendientes[pendientes.length - 1]);
        }
    }

    _esNivelValidoParaUsuario(nivelPaso, nivelUsuario) {
        const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const idxPaso = niveles.indexOf(nivelPaso);
        const idxUsuario = niveles.indexOf(nivelUsuario);
        if (idxPaso === -1 || idxUsuario === -1) return true;
        return idxPaso <= idxUsuario + 1;
    }

    _estudiarTemaRecomendado() {
        if (window.LearningPath) {
            const pasoActual = window.LearningPath.getPasoActual();
            if (pasoActual) {
                const core = window.uiCore || window.ui;
                const nombrePaso = pasoActual.titulo || pasoActual.nombre || pasoActual.tema || 'Paso actual';
                if (core && typeof core.mostrarToast === 'function') {
                    core.mostrarToast(`📖 Ejecutando: "${nombrePaso}"`, 'info');
                }
                window.LearningPath.ejecutarPasoActual();
                return;
            }
        }
        const ruta = this._mapaAprendizaje.rutaActual;
        const siguiente = ruta.find(t => !t.completado);
        if (!siguiente) { 
            if (this._core && typeof this._core.mostrarToast === 'function') {
                this._core.mostrarToast('❌ No hay temas recomendados', 'error');
            }
            return; 
        }
        const core = window.uiCore || window.ui;
        const nombreTema = siguiente.titulo || siguiente.nombre || siguiente.tema || 'Tema';
        if (core && typeof core.mostrarToast === 'function') {
            core.mostrarToast(`📖 Estudiando "${nombreTema}"...`, 'info');
        }
        if (this._modoActual === this._MODOS.GUIADO) { 
            this._navegacionBloqueada = true; 
            if (core && typeof core.mostrarToast === 'function') {
                core.mostrarToast('🚀 Modo Guiado: El tutor te guiará.', 'info');
            }
        }
        if (window.pipeline && window.pipeline.estudiarTema) {
            window.pipeline.estudiarTema(siguiente.id);
        } else if (core) {
            core.irAModulo('temas');
            setTimeout(() => { if (window.UITemas && window.UITemas._verTemaDetalle) window.UITemas._verTemaDetalle(siguiente.id); }, 500);
        }
    }

    // ============================================================
    // BIENVENIDA - V8.5
    // ============================================================
    _mostrarBienvenida() {
        const nombre = this._contextoUsuario.nombre || 'usuario';
        const infoModo = this.getModoInfo();
        const ruta = this._mapaAprendizaje.rutaActual;
        const siguiente = ruta.find(t => !t.completado);
        const logrosCount = this._mapaAprendizaje.logrosDesbloqueados?.length || 0;
        const puntos = this._mapaAprendizaje.puntosExperiencia || 0;
        const microPendientes = this._mapaAprendizaje.microObjetivos.filter(m => !m.completado).length;
        const bibliotecaLeidas = this._contextoUsuario.biblioteca.leidas || 0;
        const bibliotecaTotal = this._contextoUsuario.biblioteca.totalHistorias || 0;
        const caracteres = this._mapaAprendizaje.espacial.caracteresAprendidos?.length || 0;
        const esEspacial = this._modoActual === this._MODOS.ESPACIAL;
        
        let mensaje = `🧠 ¡Hola ${nombre}! Soy tu Tutor de Aprendizaje NeuroAdaptativo V8.5.\n\n`;
        mensaje += `📌 **Modo actual:** ${infoModo.nombre}\n   ${infoModo.descripcion}\n\n`;
        mensaje += `📊 Progreso general: ${this._mapaAprendizaje.progresoGeneral || 0}%\n`;
        mensaje += `📚 Temas disponibles: ${ruta.length}\n`;
        mensaje += `📖 Biblioteca: ${bibliotecaLeidas}/${bibliotecaTotal} historias leídas\n`;
        mensaje += `🎯 Micro-objetivos: ${microPendientes} pendientes\n`;
        mensaje += `🏆 Logros: ${logrosCount} · 🧠 ${puntos} pts\n`;
        if (esEspacial) {
            mensaje += `🀄 Caracteres: ${caracteres} aprendidos\n`;
            mensaje += `🌀 Radicales: ${this._mapaAprendizaje.espacial.radicalesConocidos?.length || 0} conocidos\n`;
        }
        mensaje += `🔄 Refresco automático: cada ${this._intervaloRefrescoMs / 1000}s (OBLIGATORIO)\n`;
        mensaje += `\n`;
        if (siguiente && this._modoActual !== this._MODOS.LIBRE) {
            const nombreTema = siguiente.titulo || siguiente.nombre || siguiente.tema || 'Tema';
            mensaje += `📌 **Siguiente tema recomendado:** "${nombreTema}"\n   Nivel: ${siguiente.nivel || 'A1'} · 📚 ${siguiente.historias || 0} historias\n\n`;
        }
        if (this._modoActual === this._MODOS.GUIADO) {
            mensaje += `🚀 **Modo Guiado:** El tutor te guiará paso a paso. Solo puedes estudiar lo que él recomienda.\n\n🔒 **Navegación bloqueada** - No puedes seleccionar temas manualmente.\n\n`;
        } else if (this._modoActual === this._MODOS.ESPACIAL) {
            mensaje += `🌌 **Modo Espacial:** Aprendizaje de caracteres con métodos visuales y mnemotécnicos.\n\n`;
            mensaje += `🀄 **Enfoque:** Radicales → Caracteres → Escritura → Composición\n`;
            mensaje += `🧠 **Mnemotecnia:** Historias visuales para recordar caracteres\n\n`;
        } else if (this._modoActual === this._MODOS.FLEXIBLE) {
            mensaje += `🧠 **Modo Flexible:** El tutor sugiere, tú decides. Puedes aceptar o ignorar.\n\n`;
        } else {
            mensaje += `📴 **Modo Libre:** El tutor no interviene. Puedes consultar la ruta cuando quieras.\n\n`;
        }
        mensaje += `💡 Puedes cambiar el modo en Configuración > Tutor.\n`;
        mensaje += `🎯 Completa micro-objetivos para ganar puntos extra.`;
        
        this._agregarIntervencion({
            id: 'bienvenida_mapa_' + Date.now(),
            reglaId: 'bienvenida_mapa',
            prioridad: 'baja',
            mensaje: mensaje,
            opciones: this._crearOpcionesPorModo([
                { id: 'ver_ruta', label: '🗺️ Ver ruta', accion: 'ver_ruta' },
                { id: 'ver_objetivos', label: '🎯 Ver micros', accion: 'ver_micro_objetivos' }
            ], [
                { id: 'ver_ruta', label: '🗺️ Ver ruta', accion: 'ver_ruta' },
                { id: 'ver_objetivos', label: '🎯 Ver micros', accion: 'ver_micro_objetivos' },
                { id: 'ok', label: '👋 Entendido', accion: 'descartar' },
                { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' }
            ]),
            timestamp: Date.now()
        });
        if (this._modoActual === this._MODOS.GUIADO || this._modoActual === this._MODOS.ESPACIAL) {
            const pendientes = this._intervencionesPendientes;
            if (pendientes.length > 0) this._mostrarIntervencion(pendientes[pendientes.length - 1]);
        }
    }

    // ============================================================
    // INICIAR CICLO DE ANÁLISIS - V8.5
    // ============================================================
    _iniciarCicloAnalisis() {
        const ejecutarAnalisis = async () => {
            if (this._sesionActiva && !this._analizando) await this._analizarEstadoGeneral();
            setTimeout(ejecutarAnalisis, this._intervaloAnalisis);
        };
        setTimeout(ejecutarAnalisis, 30000);
        console.log('🔄 Ciclo de análisis del Tutor Neuro V8.5 iniciado (cada 30s)');
    }

    async _analizarEstadoGeneral() {
        if (this._analizando) { console.log('⏳ Análisis general en curso, omitiendo...'); return; }
        try {
            this._analizando = true;
            await this._actualizarContextoUsuario();
            
            if (this._contextoUsuario.racha >= 3) {
                const ultimaFelicitacion = this._historialIntervenciones.filter(i => i.reglaId === 'racha_estudio').pop();
                if (!ultimaFelicitacion || (Date.now() - ultimaFelicitacion.mostrada) > 86400000) {
                    this._agregarIntervencion({
                        id: 'racha_' + Date.now(),
                        reglaId: 'racha_estudio',
                        prioridad: 'baja',
                        mensaje: `🔥 ¡Llevas ${this._contextoUsuario.racha} días seguidos estudiando! Tu consistencia está fortaleciendo tus conexiones neuronales. ¡Sigue así!`,
                        opciones: this._crearOpcionesPorModo([
                            { id: 'continuar', label: '🎯 Seguir así', accion: 'descartar' }
                        ], [
                            { id: 'continuar', label: '🎯 Seguir así', accion: 'descartar' },
                            { id: 'ver_progreso', label: '📊 Ver progreso', accion: 'ver_estadisticas' },
                            { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' }
                        ]),
                        timestamp: Date.now()
                    });
                }
            }
            
            if (this._contextoUsuario.racha >= 3 && this._contextoUsuario.tiempoEstudioHoy >= 1800) {
                const ultimaConsistencia = this._historialIntervenciones.filter(i => i.reglaId === 'consistencia').pop();
                if (!ultimaConsistencia || (Date.now() - ultimaConsistencia.mostrada) > 86400000) {
                    this._agregarIntervencion({
                        id: 'consistencia_' + Date.now(),
                        reglaId: 'consistencia',
                        prioridad: 'baja',
                        mensaje: `🏅 ¡${this._contextoUsuario.racha} días consecutivos de estudio! Tu consistencia está construyendo hábitos sólidos.\n\n⏱️ ${Math.round(this._contextoUsuario.tiempoEstudioTotal / 3600)} horas totales.`,
                        opciones: [
                            { id: 'continuar', label: '🎯 Seguir así', accion: 'descartar' },
                            { id: 'ver_progreso', label: '📊 Ver progreso', accion: 'ver_estadisticas' }
                        ],
                        timestamp: Date.now()
                    });
                }
            }
            
            const diasSinProgreso = this._calcularDiasSinProgreso();
            if (diasSinProgreso >= this._configuracion.guiaProactiva.umbralEstancamiento) {
                const progresoActual = this._contextoUsuario.analisisProgreso.velocidadAprendizaje || 0;
                if (progresoActual < 0.5) {
                    this._agregarIntervencion({
                        id: 'estancamiento_' + Date.now(),
                        reglaId: 'estancamiento',
                        prioridad: 'alta',
                        mensaje: `🔄 Llevas ${diasSinProgreso} días sin progreso significativo. ¿Quieres probar una nueva estrategia de aprendizaje?`,
                        opciones: this._crearOpcionesPorModo([
                            { id: 'cambiar_estrategia', label: '🔄 Nueva estrategia', accion: 'recomendar_cambio_estrategia' }
                        ], [
                            { id: 'cambiar_estrategia', label: '🔄 Nueva estrategia', accion: 'recomendar_cambio_estrategia' },
                            { id: 'ver_ruta', label: '🗺️ Ver ruta', accion: 'ver_ruta' },
                            { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
                        ]),
                        timestamp: Date.now()
                    });
                }
            }
            
            if (this._intervencionesPendientes.length === 0 && this._configuracion.guiaProactiva.activa && this._modoActual !== this._MODOS.LIBRE) {
                await this._recomendarSiguienteModulo();
            }
            
            if (this._configuracion.microObjetivos.activo && this._modoActual !== this._MODOS.LIBRE) {
                await this._recomendarMicroObjetivo();
            }
            
            if (this._configuracion.espacial.activo && this._modoActual !== this._MODOS.LIBRE) {
                await this._recomendarEspacial();
            }
            
            // Refrescar después del análisis general
            setTimeout(() => this._refrescarDashboardAutomatico(), 500);
            
        } catch (error) { console.warn('⚠️ Error en análisis de estado general:', error); }
        finally { this._analizando = false; }
    }

    _calcularDiasSinProgreso() {
        try {
            const historial = JSON.parse(localStorage.getItem('pipeline_historial_progreso') || '{}');
            let dias = 0, fecha = new Date();
            for (let i = 0; i < 30; i++) {
                const key = fecha.toDateString();
                if (historial[key] && historial[key] > 0) { dias = i; break; }
                fecha.setDate(fecha.getDate() - 1);
            }
            return dias;
        } catch (e) { return 0; }
    }

    // ============================================================
    // MÉTODOS AUXILIARES
    // ============================================================
    _getColorPrioridad(prioridad) {
        const colores = { 'alta': '#FF7675', 'media': '#FDCB6E', 'baja': '#74B9FF' };
        return colores[prioridad] || '#6C5CE7';
    }

    _getIconoPrioridad(prioridad) {
        const iconos = { 'alta': '🔴', 'media': '🟡', 'baja': '🔵' };
        return iconos[prioridad] || '🧠';
    }

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const jeroglificos = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín', 'cantones', 'cantonés'];
        const idiomaLower = idioma.toLowerCase().trim();
        return jeroglificos.some(item => idiomaLower.includes(item) || item.includes(idiomaLower));
    }

    _esTonal(idioma) {
        if (!idioma) return false;
        const tonales = ['zh', 'chino', 'chinese', 'mandarin', 'mandarín', 'th', 'tailandés', 'thai', 'vi', 'vietnamita', 'vietnamese', 'cantones', 'cantonés'];
        const idiomaLower = idioma.toLowerCase().trim();
        return tonales.some(item => idiomaLower.includes(item) || item.includes(idiomaLower));
    }

    _obtenerIdiomaActual() {
        try { return gestorIdiomas?.getIdiomaActivo() || 'es'; } catch (e) { return 'es'; }
    }

    // ============================================================
    // MÉTODOS PÚBLICOS - V8.5 (CORREGIDOS)
    // ============================================================
    async forzarRecomendacion() {
        console.log('🧠 [PUBLICO] Forzando nueva recomendación...');
        if (this._core && typeof this._core.mostrarToast === 'function') {
            this._core.mostrarToast('🧠 Generando nueva recomendación...', 'info');
        }
        
        try {
            await this._actualizarContextoUsuario();
            await this._recomendarSiguienteModulo();
            this._mostrarDashboardTutorCompleto();
            this._guardarEstadoEnLocalStorage();
            if (this._core && typeof this._core.mostrarToast === 'function') {
                this._core.mostrarToast('✅ Nueva recomendación generada', 'success');
            }
        } catch (error) {
            console.error('❌ Error generando recomendación:', error);
            if (this._core && typeof this._core.mostrarToast === 'function') {
                this._core.mostrarToast('❌ Error al generar recomendación', 'error');
            }
        }
    }

    async forzarAnalisis() {
        console.log('🧠 [PUBLICO] Forzando análisis completo (simula click en "Forzar Análisis")...');
        if (this._core && typeof this._core.mostrarToast === 'function') {
            this._core.mostrarToast('🧠 Forzando análisis profundo...', 'info');
        }
        
        try {
            await this._actualizarContextoUsuario();
            await this._construirMapaAprendizaje();
            await this._actualizarEstadisticasAvanzadas();
            await this._actualizarProgresoEspacial();
            this._mostrarDashboardTutorCompleto();
            this._guardarEstadoEnLocalStorage();
            
            // Forzar actualización del dashboard principal
            if (window.UIDashboard && typeof window.UIDashboard._cargarDashboardInicial === 'function') {
                try {
                    window.UIDashboard._cargarDashboardInicial();
                } catch (e) {
                    console.warn('⚠️ Error actualizando dashboard principal:', e);
                }
            }
            
            if (this._core && typeof this._core.mostrarToast === 'function') {
                this._core.mostrarToast('✅ Análisis completado', 'success');
            }
            
            console.log('✅ [PUBLICO] Análisis completado');
        } catch (error) {
            console.error('❌ Error en análisis:', error);
            if (this._core && typeof this._core.mostrarToast === 'function') {
                this._core.mostrarToast('❌ Error en el análisis', 'error');
            }
            throw error;
        }
    }

    async ejecutarRecomendacion() {
        const recomendacion = this._mapaAprendizaje.objetivoActual;
        if (!recomendacion) {
            if (this._core && typeof this._core.mostrarToast === 'function') {
                this._core.mostrarToast('ℹ️ No hay recomendación activa', 'info');
            }
            return;
        }
        const modulo = recomendacion.modulo || 'study';
        if (this._core && typeof this._core.mostrarToast === 'function') {
            this._core.mostrarToast(`🚀 Ejecutando recomendación: ${modulo}`, 'success');
        }
        if (this._core && typeof this._core.irAModulo === 'function') {
            this._core.irAModulo(modulo);
        }
    }

    posponerRecomendacion() {
        if (this._core && typeof this._core.mostrarToast === 'function') {
            this._core.mostrarToast('⏰ Recomendación pospuesta', 'info');
        }
        this._mapaAprendizaje.objetivoActual = null;
        this._mostrarDashboardTutorCompleto();
        this._guardarEstadoEnLocalStorage();
    }

    ignorarRecomendacion() {
        if (this._core && typeof this._core.mostrarToast === 'function') {
            this._core.mostrarToast('❌ Recomendación ignorada', 'warning');
        }
        this._mapaAprendizaje.objetivoActual = null;
        this._mostrarDashboardTutorCompleto();
        this._guardarEstadoEnLocalStorage();
    }

    // ============================================================
    // MÉTODOS DE RENDERIZADO DE TARJETAS - V8.5
    // ============================================================
    _renderTarjetaResumen(label, valor, color, pct) {
        const pctNum = typeof pct === 'number' ? Math.min(100, Math.max(0, pct)) : 50;
        return `
            <div style="background:var(--white);border-radius:12px;padding:12px 16px;border:2px solid ${color}25;box-shadow:var(--shadow);text-align:center;transition:all 0.3s;cursor:default;" 
                 onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'" 
                 onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                <div style="font-size:20px;font-weight:800;color:${color};">${valor}</div>
                <div style="font-size:10px;color:var(--gray-light);margin-bottom:4px;">${label}</div>
                <div style="height:4px;background:var(--bg);border-radius:2px;overflow:hidden;">
                    <div style="height:100%;width:${pctNum}%;background:${color};border-radius:2px;transition:width 0.8s ease;"></div>
                </div>
            </div>
        `;
    }

    _renderTarjetaModuloElite(icono, nombre, pct, color) {
        const pctNum = Math.min(100, Math.max(0, pct));
        const moduloMap = {
            'Temas': 'temas',
            'Elipse': 'elipse',
            'Cruzadas': 'ondasCruzadas',
            'Caracteres': 'caracteres',
            'Tonos': 'tonos',
            'Pipeline': 'study',
            'Biblioteca': 'biblioteca'
        };
        const moduloId = moduloMap[nombre] || nombre.toLowerCase();
        return `
            <div style="background:var(--bg);border-radius:10px;padding:10px 12px;text-align:center;border:2px solid ${color}25;transition:all 0.3s;cursor:pointer;"
                 onclick="window.uiCore.irAModulo('${moduloId}')"
                 onmouseover="this.style.transform='translateY(-3px)';this.style.borderColor='${color}';this.style.boxShadow='0 4px 20px ${color}30'" 
                 onmouseout="this.style.transform='none';this.style.borderColor='${color}25';this.style.boxShadow='none'">
                <div style="font-size:22px;">${icono}</div>
                <div style="font-size:11px;font-weight:600;color:var(--dark);">${nombre}</div>
                <div style="font-size:16px;font-weight:800;color:${color};">${pctNum}%</div>
                <div style="height:3px;background:var(--bg);border-radius:2px;overflow:hidden;margin-top:2px;">
                    <div style="height:100%;width:${pctNum}%;background:${color};border-radius:2px;transition:width 0.5s ease;"></div>
                </div>
            </div>
        `;
    }

    _renderBarraEstadoElite(label, valor, color) {
        const pct = Math.round(Math.min(100, Math.max(0, valor * 100)));
        const emoji = pct >= 80 ? '🟢' : pct >= 50 ? '🟡' : '🔴';
        const estado = pct >= 80 ? 'Alta' : pct >= 50 ? 'Media' : 'Baja';
        return `
            <div style="margin-bottom:8px;">
                <div style="display:flex;justify-content:space-between;font-size:11px;">
                    <span style="color:var(--gray);">${label}</span>
                    <span style="font-weight:600;color:${color};">${pct}% ${emoji} ${estado}</span>
                </div>
                <div style="height:5px;background:var(--bg);border-radius:3px;overflow:hidden;">
                    <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 0.8s ease;"></div>
                </div>
            </div>
        `;
    }

    _renderRecomendacionActivaV7(recomendacion) {
        const modulo = recomendacion.modulo || 'study';
        const detalle = recomendacion.detalle || 'Continúa tu estudio';
        const prioridad = recomendacion.prioridad || 'media';
        const puntuacion = recomendacion.puntuacion || 0;
        const key = recomendacion.key || '';
        
        const emojiMap = {
            'biblioteca': '📖',
            'estudiar_tema': '📚',
            'iniciar_tema': '📂',
            'elipse': '🌌',
            'elipse_nueva': '🌊',
            'ondas_cruzadas': '🌊',
            'caracteres': '🀄',
            'caracteres_espacial': '🀄',
            'tonos': '🎵',
            'repaso': '🔄',
            'racha': '🔥',
            'cambio_estrategia': '🧠',
            'micro_objetivo': '🎯',
            'radicales': '🌀',
            'escritura': '✍️',
            'composicion': '🧩',
            'mnemotecnia': '🧠'
        };
        const emoji = emojiMap[key] || '🔥';
        
        return `
            <div style="background:linear-gradient(135deg, var(--primary)08, var(--secondary)08);border-radius:14px;padding:16px 20px;margin-bottom:16px;border:2px solid var(--primary)30;box-shadow:0 4px 20px rgba(108,92,231,0.15);position:relative;overflow:hidden;">
                <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:linear-gradient(180deg, var(--primary), var(--secondary));"></div>
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding-left:12px;">
                    <div>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="font-size:24px;">${emoji}</span>
                            <div>
                                <div style="font-size:14px;font-weight:700;color:var(--dark);">
                                    RECOMENDACIÓN ACTIVA DEL TUTOR V8.5
                                    <span style="font-size:10px;font-weight:400;color:${prioridad === 'alta' ? 'var(--danger)' : 'var(--warning)'};margin-left:8px;">
                                        ${prioridad === 'alta' ? '🔴 PRIORIDAD ALTA' : '🟡 PRIORIDAD MEDIA'}
                                    </span>
                                </div>
                                <div style="font-size:14px;color:var(--gray);margin-top:2px;">
                                    ${detalle}
                                </div>
                                <div style="display:flex;gap:12px;font-size:11px;color:var(--gray-light);margin-top:4px;flex-wrap:wrap;">
                                    <span>📊 ${puntuacion || 0}% relevancia</span>
                                    <span>⏱️ Tiempo estimado: ${Math.round((puntuacion || 50) / 10)} minutos</span>
                                    <span>🎯 Módulo: ${modulo}</span>
                                    ${key === 'biblioteca' ? '<span>📚 Recomendación de lectura</span>' : ''}
                                    ${key === 'micro_objetivo' ? '<span>🎯 Micro-objetivo activo</span>' : ''}
                                    ${key === 'radicales' ? '<span>🌀 Estudio de radicales</span>' : ''}
                                    ${key === 'caracteres_espacial' ? '<span>🀄 Modo Espacial</span>' : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="btn-primary" onclick="window.tutorNeuro.ejecutarRecomendacion()" 
                                style="padding:6px 16px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-play"></i> Ejecutar Ahora
                        </button>
                        <button class="btn-secondary" onclick="window.tutorNeuro.posponerRecomendacion()" 
                                style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-clock"></i> Posponer
                        </button>
                        ${this._modoActual !== this._MODOS.GUIADO && this._modoActual !== this._MODOS.ESPACIAL ? `
                            <button class="btn-secondary" onclick="window.tutorNeuro.ignorarRecomendacion()" 
                                    style="padding:6px 14px;font-size:12px;background:var(--danger);color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.3s;"
                                    onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                                <i class="fas fa-times"></i> Ignorar
                            </button>
                        ` : ''}
                        <button class="btn-secondary" onclick="window.tutorNeuro._mostrarRutaCompleta()" 
                                style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-route"></i> Ver Ruta
                        </button>
                        <button class="btn-secondary" onclick="window.tutorNeuro.forzarRefresco()" 
                                style="padding:6px 14px;font-size:12px;background:var(--primary)15;color:var(--primary);border:1px solid var(--primary);border-radius:6px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-sync"></i> Refrescar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    _getEmojiNivel(nivel) {
        const emojis = { 'A1': '🌱', 'A2': '🌿', 'B1': '🌳', 'B2': '🌲', 'C1': '🏔️', 'C2': '🗻' };
        return emojis[nivel] || '📚';
    }

    // ============================================================
    // DASHBOARD DE ÉLITE - V8.5 CON REFRESCO AUTOMÁTICO OBLIGATORIO
    // ============================================================
    _mostrarDashboardTutorCompleto() {
        const container = document.getElementById('tutorFullContainer');
        if (!container) {
            console.warn('⚠️ No se encontró tutorFullContainer para el dashboard de élite');
            return;
        }
        
        // Usar datos del contexto actual (ya actualizado)
        const contexto = this._contextoUsuario;
        const modoInfo = this.getModoInfo();
        const ruta = this._mapaAprendizaje.rutaActual;
        const recomendacion = this._mapaAprendizaje.objetivoActual;
        const logros = this._mapaAprendizaje.logrosDesbloqueados || [];
        const progresoGeneral = this._mapaAprendizaje.progresoGeneral || 0;
        const microPendientes = this._mapaAprendizaje.microObjetivos.filter(m => !m.completado);
        const statsAvanzadas = this._mapaAprendizaje.estadisticasAvanzadas || {};
        const esEspacial = this._modoActual === this._MODOS.ESPACIAL;
        const esJeroglifico = this._esJeroglifico(this._obtenerIdiomaActual());
        
        const totalTemas = contexto.temas.total || 0;
        const temasCompletados = contexto.temas.completados || 0;
        const pctTemas = totalTemas > 0 ? Math.round((temasCompletados / totalTemas) * 100) : 0;
        const totalHistorias = contexto.biblioteca.totalHistorias || 0;
        const historiasLeidas = contexto.biblioteca.leidas || 0;
        const pctHistorias = totalHistorias > 0 ? Math.round((historiasLeidas / totalHistorias) * 100) : 0;
        const totalLogros = Object.keys(this._LOGROS).length || 0;
        const pctLogros = totalLogros > 0 ? Math.round((logros.length / totalLogros) * 100) : 0;
        const eficiencia = contexto.eficiencia || statsAvanzadas.eficienciaGlobal || 0;
        const neuroFatiga = contexto.estadoCognitivo?.fatiga || 0;
        const caracteresDominados = contexto.caracteres?.caracteresDominados || 0;
        const radicalesConocidos = this._mapaAprendizaje.espacial.radicalesConocidos?.length || 0;
        
        const pasosTotales = ruta.length;
        const pasosCompletados = ruta.filter(t => t.completado).length;
        const ultimasIntervenciones = this._historialIntervenciones.slice(-3).reverse();
        
        // Métricas de refresco
        const metricasRefresco = this.getMetricasRefresco();
        const infoRefresco = metricasRefresco.totalRefrescos > 0 
            ? `🔄 ${metricasRefresco.totalRefrescos} refrescos · ⏱️ ${metricasRefresco.promedioMs}ms` 
            : '🔄 Esperando primer refresco...';
        
        const html = `
            <div class="tutor-dashboard-elite" style="padding:16px;max-width:1200px;margin:0 auto;font-family:var(--font);">
                <!-- CABECERA DE ÉLITE V8.5 CON REFRESCO OBLIGATORIO -->
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:14px 24px;background:linear-gradient(135deg, var(--primary)08, var(--secondary)08);border-radius:16px;border:2px solid var(--primary)20;position:relative;overflow:hidden;">
                    <div style="position:absolute;top:-50%;right:-10%;width:300px;height:300px;background:radial-gradient(circle, var(--primary)10, transparent);border-radius:50%;"></div>
                    <div style="position:absolute;bottom:-30%;left:-5%;width:200px;height:200px;background:radial-gradient(circle, var(--secondary)10, transparent);border-radius:50%;"></div>
                    <div style="position:relative;z-index:1;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span style="font-size:32px;">${esEspacial ? '🌌' : '🧠'}</span>
                            <div>
                                <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                                    ${esEspacial ? '🌌 Tutor Espacial V8.5' : '🧠 Tutor NeuroAdaptativo V8.5'}
                                    <span style="font-size:14px;font-weight:400;color:var(--gray);margin-left:8px;">${esEspacial ? '🚀 Modo Jeroglífico' : 'Doble Herencia'}</span>
                                </h2>
                                <div style="display:flex;gap:12px;font-size:12px;color:var(--gray);flex-wrap:wrap;margin-top:2px;">
                                    <span style="font-weight:600;color:var(--dark);">👤 ${contexto.nombre}</span>
                                    <span>📌 ${this._getEmojiNivel(contexto.nivel)} ${contexto.nivel}</span>
                                    <span>${modoInfo.icono} ${modoInfo.nombre}</span>
                                    ${esEspacial ? `<span style="color:var(--primary);">🀄 ${caracteresDominados} caracteres</span>` : ''}
                                    ${esJeroglifico && !esEspacial ? `<span style="color:var(--secondary);">🀄 Jeroglífico</span>` : ''}
                                    <span style="color:${neuroFatiga > 0.6 ? 'var(--danger)' : 'var(--success)'};">${neuroFatiga > 0.6 ? '🔴 Fatigado' : '🟢 Activo'}</span>
                                    <span style="font-size:10px;color:var(--gray-light);">🔄 Sincronizado con Centinela</span>
                                    <span style="font-size:10px;color:var(--primary);background:var(--primary)10;padding:0 8px;border-radius:4px;">${infoRefresco}</span>
                                    <span style="font-size:9px;color:var(--success);background:var(--success)10;padding:0 6px;border-radius:3px;">🔄 REFRESCO AUTO</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;position:relative;z-index:1;">
                        <button class="btn-primary" onclick="window.tutorNeuro._mostrarRutaCompleta()" 
                                style="padding:8px 16px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-route"></i> Ver Ruta
                        </button>
                        <button class="btn-secondary" onclick="window.tutorNeuro._mostrarMicroObjetivos()" 
                                style="padding:8px 16px;font-size:12px;background:var(--warning);color:var(--dark);border:none;border-radius:8px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                            🎯 Micros (${microPendientes.length})
                        </button>
                        <button class="btn-secondary" onclick="window.tutorNeuro._mostrarEstadisticasCompletas()" 
                                style="padding:8px 16px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:8px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-chart-bar"></i> Stats
                        </button>
                        <button class="btn-secondary" onclick="window.uiCore.irAModulo('config')" 
                                style="padding:8px 16px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:8px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-cog"></i> Configurar
                        </button>
                        <button class="btn-secondary" onclick="window.tutorNeuro.forzarRefresco()" 
                                style="padding:8px 16px;font-size:12px;background:var(--primary)15;color:var(--primary);border:1px solid var(--primary);border-radius:8px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.2)'" 
                                onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                            <i class="fas fa-sync"></i> Refrescar Ahora
                        </button>
                        <button class="btn-secondary" onclick="window.tutorNeuro.forzarAnalisis()" 
                                style="padding:8px 16px;font-size:12px;background:var(--secondary)15;color:var(--secondary);border:1px solid var(--secondary);border-radius:8px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 20px rgba(0,206,201,0.2)'" 
                                onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                            <i class="fas fa-brain"></i> Forzar Análisis
                        </button>
                    </div>
                </div>

                <!-- RESUMEN EJECUTIVO V8.5 -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:16px;">
                    ${this._renderTarjetaResumen('🎯 Progreso', `${progresoGeneral}%`, progresoGeneral >= 80 ? 'var(--success)' : progresoGeneral >= 40 ? 'var(--warning)' : 'var(--danger)', progresoGeneral)}
                    ${this._renderTarjetaResumen('📚 Temas', `${pctTemas}% (${temasCompletados}/${totalTemas})`, pctTemas >= 80 ? 'var(--success)' : pctTemas >= 40 ? 'var(--warning)' : 'var(--danger)', pctTemas)}
                    ${this._renderTarjetaResumen('📖 Biblioteca', `${pctHistorias}% (${historiasLeidas}/${totalHistorias})`, pctHistorias >= 80 ? 'var(--success)' : pctHistorias >= 40 ? 'var(--warning)' : 'var(--danger)', pctHistorias)}
                    ${this._renderTarjetaResumen('🏆 Logros', `${pctLogros}% (${logros.length}/${totalLogros})`, pctLogros >= 80 ? 'var(--success)' : pctLogros >= 40 ? 'var(--warning)' : 'var(--danger)', pctLogros)}
                    ${this._renderTarjetaResumen('⚡ Eficiencia', `${Math.round(eficiencia)}%`, eficiencia >= 80 ? 'var(--success)' : eficiencia >= 50 ? 'var(--warning)' : 'var(--danger)', eficiencia)}
                    ${this._renderTarjetaResumen('🎯 Micros', `${microPendientes.length} pendientes`, microPendientes.length === 0 ? 'var(--success)' : 'var(--warning)', 100 - (microPendientes.length * 10))}
                    ${esEspacial ? this._renderTarjetaResumen('🀄 Caracteres', `${caracteresDominados}`, caracteresDominados >= 20 ? 'var(--success)' : caracteresDominados >= 10 ? 'var(--warning)' : 'var(--danger)', caracteresDominados * 5) : ''}
                    ${esEspacial ? this._renderTarjetaResumen('🌀 Radicales', `${radicalesConocidos}`, radicalesConocidos >= 10 ? 'var(--success)' : radicalesConocidos >= 5 ? 'var(--warning)' : 'var(--danger)', radicalesConocidos * 10) : ''}
                    ${this._renderTarjetaResumen('🔄 Refrescos', `${metricasRefresco.totalRefrescos}`, metricasRefresco.totalRefrescos > 0 ? 'var(--primary)' : 'var(--gray-light)', Math.min(100, metricasRefresco.totalRefrescos * 5))}
                </div>

                <!-- RECOMENDACIÓN ACTIVA -->
                ${recomendacion ? this._renderRecomendacionActivaV7(recomendacion) : ''}

                <!-- INFORMACIÓN ESPACIAL -->
                ${esEspacial ? `
                    <div style="background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:12px;padding:12px 18px;margin-bottom:16px;border:2px solid var(--primary)20;">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="font-size:24px;">🌌</span>
                                <div>
                                    <div style="font-size:13px;font-weight:700;color:var(--dark);">Modo Espacial Activado</div>
                                    <div style="font-size:11px;color:var(--gray);">
                                        Aprendizaje de caracteres con métodos visuales y mnemotécnicos
                                    </div>
                                </div>
                            </div>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:11px;color:var(--gray);">
                                <span style="background:var(--bg);padding:2px 12px;border-radius:12px;">🌀 ${radicalesConocidos} radicales</span>
                                <span style="background:var(--bg);padding:2px 12px;border-radius:12px;">🀄 ${caracteresDominados} caracteres</span>
                                <span style="background:var(--bg);padding:2px 12px;border-radius:12px;">✍️ ${this._mapaAprendizaje.espacial.trazosPracticados?.length || 0} trazos</span>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- RUTA + ESTADÍSTICAS COGNITIVAS -->
                <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px;">
                    <!-- RUTA DE APRENDIZAJE -->
                    <div style="background:var(--white);border-radius:14px;padding:16px 20px;border:2px solid var(--light);box-shadow:var(--shadow);">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span style="font-size:20px;">🗺️</span>
                                <h4 style="font-size:15px;font-weight:700;color:var(--dark);margin:0;">Ruta de Aprendizaje</h4>
                                <span style="font-size:11px;color:var(--gray-light);">(${pasosCompletados}/${pasosTotales} completados)</span>
                            </div>
                            <button class="btn-secondary" onclick="window.tutorNeuro._mostrarRutaCompleta()" 
                                    style="padding:4px 12px;font-size:10px;background:var(--bg);border:1px solid var(--light);border-radius:4px;cursor:pointer;transition:all 0.3s;"
                                    onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                                <i class="fas fa-chevron-right"></i> Ver todo
                            </button>
                        </div>
                        ${ruta.slice(0, 4).map((paso, idx) => {
                            const nombre = paso.nombre || paso.titulo || paso.tema || `Paso ${idx+1}`;
                            const pct = paso.porcentaje || 0;
                            const completado = paso.completado || false;
                            const esActual = !completado && pct > 0;
                            const icono = completado ? '✅' : (esActual ? '🔄' : '⏳');
                            const color = completado ? 'var(--success)' : (esActual ? 'var(--warning)' : 'var(--gray-light)');
                            return `
                                <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--bg);${idx === 3 ? 'border-bottom:none;' : ''}">
                                    <span style="font-size:14px;">${icono}</span>
                                    <div style="flex:1;min-width:0;">
                                        <div style="display:flex;justify-content:space-between;align-items:center;">
                                            <span style="font-size:13px;font-weight:${esActual ? '700' : '500'};color:${esActual ? 'var(--dark)' : 'var(--gray)'};">
                                                ${nombre}
                                                ${esActual ? '<span style="font-size:10px;color:var(--primary);margin-left:6px;">🎯 ACTUAL</span>' : ''}
                                                ${completado ? '<span style="font-size:10px;color:var(--success);margin-left:6px;">✅ COMPLETADO</span>' : ''}
                                            </span>
                                            <span style="font-size:11px;color:var(--gray);">${pct}%</span>
                                        </div>
                                        <div style="height:4px;background:var(--bg);border-radius:2px;overflow:hidden;margin-top:2px;">
                                            <div style="height:100%;width:${pct}%;background:${completado ? 'var(--success)' : (esActual ? 'var(--warning)' : 'var(--gray-light)')};border-radius:2px;transition:width 0.5s ease;"></div>
                                        </div>
                                        ${esActual && paso.descripcion ? `
                                            <div style="font-size:10px;color:var(--gray-light);margin-top:2px;">
                                                💡 ${paso.descripcion.substring(0, 60)}${paso.descripcion.length > 60 ? '...' : ''}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        ${ruta.length > 4 ? `
                            <div style="text-align:center;margin-top:8px;font-size:11px;color:var(--gray-light);">
                                + ${ruta.length - 4} pasos más...
                            </div>
                        ` : ''}
                    </div>

                    <!-- ESTADO COGNITIVO -->
                    <div style="background:var(--white);border-radius:14px;padding:16px 20px;border:2px solid var(--light);box-shadow:var(--shadow);">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                            <span style="font-size:20px;">🧠</span>
                            <h4 style="font-size:15px;font-weight:700;color:var(--dark);margin:0;">Estado Cognitivo</h4>
                            ${this._centinela ? '<span style="font-size:9px;color:var(--success);background:var(--success)15;padding:1px 8px;border-radius:8px;">Centinela</span>' : ''}
                        </div>
                        ${this._renderBarraEstadoElite('Fatiga', neuroFatiga, neuroFatiga > 0.6 ? 'var(--danger)' : 'var(--warning)')}
                        ${this._renderBarraEstadoElite('Concentración', contexto.estadoCognitivo?.concentracion || 0, 'var(--success)')}
                        ${this._renderBarraEstadoElite('Confianza', contexto.estadoCognitivo?.confianza || 0, 'var(--primary)')}
                        ${this._renderBarraEstadoElite('Motivación', contexto.estadoCognitivo?.motivacion || 0, 'var(--warning)')}
                        
                        <div style="margin-top:12px;padding:8px 12px;background:var(--bg);border-radius:8px;border-left:3px solid ${contexto.analisisProgreso.tendencia === 'mejorando' ? 'var(--success)' : contexto.analisisProgreso.tendencia === 'empeorando' ? 'var(--danger)' : 'var(--warning)'};">
                            <div style="display:flex;justify-content:space-between;font-size:11px;">
                                <span style="color:var(--gray);">📈 Tendencia</span>
                                <span style="font-weight:600;color:${contexto.analisisProgreso.tendencia === 'mejorando' ? 'var(--success)' : contexto.analisisProgreso.tendencia === 'empeorando' ? 'var(--danger)' : 'var(--warning)'};">
                                    ${contexto.analisisProgreso.tendencia === 'mejorando' ? '📈 Mejorando' : 
                                      contexto.analisisProgreso.tendencia === 'empeorando' ? '📉 Empeorando' : '➡️ Estable'}
                                </span>
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:2px;">
                                <span style="color:var(--gray);">⚡ Velocidad</span>
                                <span style="font-weight:600;color:var(--dark);">${contexto.analisisProgreso.velocidadAprendizaje || 0} frases/sesión</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:2px;">
                                <span style="color:var(--gray);">🔥 Racha</span>
                                <span style="font-weight:600;color:${contexto.racha >= 7 ? 'var(--success)' : contexto.racha >= 3 ? 'var(--warning)' : 'var(--gray)'};">${contexto.racha} días</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:2px;">
                                <span style="color:var(--gray);">📚 Lecturas</span>
                                <span style="font-weight:600;color:var(--primary);">${historiasLeidas}/${totalHistorias}</span>
                            </div>
                            ${esEspacial ? `
                                <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:2px;">
                                    <span style="color:var(--gray);">🀄 Caracteres</span>
                                    <span style="font-weight:600;color:var(--primary);">${caracteresDominados}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- PROGRESO POR MÓDULOS V8.5 -->
                <div style="background:var(--white);border-radius:14px;padding:16px 20px;margin-bottom:16px;border:2px solid var(--light);box-shadow:var(--shadow);">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                        <span style="font-size:20px;">📊</span>
                        <h4 style="font-size:15px;font-weight:700;color:var(--dark);margin:0;">Progreso por Módulos</h4>
                        <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">Sincronizado con todos los módulos</span>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:8px;">
                        ${this._renderTarjetaModuloElite('📚', 'Temas', pctTemas, '#6C5CE7')}
                        ${this._renderTarjetaModuloElite('🌌', 'Elipse', contexto.elipse.progreso || 0, '#00CEC9')}
                        ${this._renderTarjetaModuloElite('🌊', 'Cruzadas', contexto.ondasCruzadas.ondasTotales > 0 ? Math.min(100, contexto.ondasCruzadas.ondasTotales * 20) : 0, '#00B894')}
                        ${this._renderTarjetaModuloElite('🀄', 'Caracteres', caracteresDominados > 0 ? Math.min(100, caracteresDominados * 5) : 0, '#E17055')}
                        ${this._renderTarjetaModuloElite('🎵', 'Tonos', contexto.tonos.progresoTonos || 0, '#FDCB6E')}
                        ${this._renderTarjetaModuloElite('📖', 'Pipeline', contexto.pipeline.progreso || 0, '#0984E3')}
                        ${this._renderTarjetaModuloElite('📚', 'Biblioteca', pctHistorias, '#FDCB6E')}
                        ${esEspacial ? this._renderTarjetaModuloElite('🌀', 'Radicales', radicalesConocidos > 0 ? Math.min(100, radicalesConocidos * 10) : 0, '#6C5CE7') : ''}
                    </div>
                </div>

                <!-- MICRO-OBJETIVOS DESTACADOS V8.5 -->
                ${microPendientes.length > 0 ? `
                    <div style="background:linear-gradient(135deg, var(--warning)08, var(--primary)08);border-radius:14px;padding:12px 18px;margin-bottom:16px;border:2px solid var(--warning)30;">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span style="font-size:20px;">🎯</span>
                                <div>
                                    <h4 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">Micro-objetivos pendientes</h4>
                                    <span style="font-size:11px;color:var(--gray);">Completa ${microPendientes.length} micro-objetivos para ganar experiencia</span>
                                </div>
                            </div>
                            <button class="btn-secondary" onclick="window.tutorNeuro._mostrarMicroObjetivos()" 
                                    style="padding:4px 14px;font-size:11px;background:var(--warning);color:var(--dark);border:none;border-radius:4px;cursor:pointer;">
                                Ver todos 🎯
                            </button>
                        </div>
                        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
                            ${microPendientes.slice(0, 3).map(m => {
                                const emoji = m.tipo === 'caracter' ? '🀄' : m.tipo === 'radical' ? '🌀' : '📚';
                                return `
                                    <div style="background:var(--white);border-radius:8px;padding:8px 14px;flex:1;min-width:120px;border-left:3px solid var(--warning);">
                                        <div style="font-size:12px;font-weight:600;color:var(--dark);">${emoji} ${m.titulo}</div>
                                        <div style="font-size:10px;color:var(--gray);">+${m.recompensa || 5} pts · ${m.modulo || 'study'}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : `
                    <div style="background:linear-gradient(135deg, var(--success)08, var(--primary)08);border-radius:14px;padding:12px 18px;margin-bottom:16px;border:2px solid var(--success)30;text-align:center;">
                        <span style="font-size:20px;">🎉</span>
                        <span style="font-size:14px;font-weight:600;color:var(--success);margin-left:8px;">¡Todos los micro-objetivos completados!</span>
                        <span style="font-size:12px;color:var(--gray);margin-left:8px;">Nuevos objetivos se generarán pronto.</span>
                    </div>
                `}

                <!-- ÚLTIMAS INTERVENCIONES V8.5 -->
                <div style="background:var(--white);border-radius:14px;padding:16px 20px;border:2px solid var(--light);box-shadow:var(--shadow);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-size:20px;">📋</span>
                            <h4 style="font-size:15px;font-weight:700;color:var(--dark);margin:0;">Últimas Intervenciones</h4>
                            <span style="font-size:10px;color:var(--gray-light);">(${this._historialIntervenciones.length} totales)</span>
                        </div>
                        <button class="btn-secondary" onclick="window.tutorNeuro._mostrarHistorialCompleto()" 
                                style="padding:4px 12px;font-size:10px;background:var(--bg);border:1px solid var(--light);border-radius:4px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-chevron-right"></i> Ver todo
                        </button>
                    </div>
                    ${ultimasIntervenciones.length > 0 ? ultimasIntervenciones.map((i, idx) => {
                        const prioridad = i.prioridad || 'media';
                        const icono = prioridad === 'alta' ? '🔴' : prioridad === 'media' ? '🟡' : '🟢';
                        const color = prioridad === 'alta' ? 'var(--danger)' : prioridad === 'media' ? 'var(--warning)' : 'var(--success)';
                        const fecha = i.mostrada ? new Date(i.mostrada).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                        const mensaje = i.mensaje ? i.mensaje.substring(0, 50) + (i.mensaje.length > 50 ? '...' : '') : 'Intervención';
                        const accion = i.opciones && i.opciones.length > 0 ? i.opciones[0].label : '';
                        const regla = i.reglaId || '';
                        return `
                            <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:${idx < ultimasIntervenciones.length - 1 ? '1px solid var(--bg)' : 'none'};">
                                <span style="font-size:14px;">${icono}</span>
                                <div style="flex:1;min-width:0;">
                                    <div style="display:flex;justify-content:space-between;font-size:11px;">
                                        <span style="color:var(--dark);font-weight:500;">${mensaje}</span>
                                        <span style="color:var(--gray-light);">${fecha}</span>
                                    </div>
                                    <div style="display:flex;gap:8px;font-size:10px;color:var(--gray-light);margin-top:2px;flex-wrap:wrap;">
                                        <span style="color:${color};">${prioridad.toUpperCase()}</span>
                                        ${regla ? `<span>📌 ${regla.replace(/_/g, ' ')}</span>` : ''}
                                        ${accion ? `<span>→ ${accion}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('') : `
                        <div style="text-align:center;padding:20px;color:var(--gray-light);font-size:13px;">
                            <i class="fas fa-info-circle" style="font-size:24px;display:block;margin-bottom:8px;color:var(--primary-light);"></i>
                            No hay intervenciones registradas aún.
                            <br>El tutor intervendrá cuando sea necesario.
                        </div>
                    `}
                </div>

                <!-- ACCIONES RÁPIDAS V8.5 -->
                <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;justify-content:center;">
                    <button class="btn-secondary" onclick="window.tutorNeuro.forzarAnalisis()" 
                            style="padding:8px 20px;font-size:13px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s;"
                            onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" 
                            onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-brain"></i> Forzar Análisis
                    </button>
                    <button class="btn-secondary" onclick="window.tutorNeuro.forzarRecomendacion()" 
                            style="padding:8px 20px;font-size:13px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s;"
                            onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 20px rgba(0,184,148,0.3)'" 
                            onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-lightbulb"></i> Nueva Recomendación
                    </button>
                    <button class="btn-secondary" onclick="window.tutorNeuro._mostrarRutaCompleta()" 
                            style="padding:8px 20px;font-size:13px;background:var(--bg);border:2px solid var(--primary);color:var(--primary);border-radius:8px;cursor:pointer;transition:all 0.3s;"
                            onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.15)'" 
                            onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-route"></i> Ruta Completa
                    </button>
                    <button class="btn-secondary" onclick="window.tutorNeuro._mostrarMicroObjetivos()" 
                            style="padding:8px 20px;font-size:13px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s;"
                            onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 20px rgba(253,203,110,0.3)'" 
                            onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-bullseye"></i> Micro-objetivos
                    </button>
                    <button class="btn-secondary" onclick="window.tutorNeuro._mostrarLogros()" 
                            style="padding:8px 20px;font-size:13px;background:linear-gradient(135deg,#E17055,#FD79A8);color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s;"
                            onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 20px rgba(225,112,85,0.3)'" 
                            onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-trophy"></i> Logros
                    </button>
                    <button class="btn-secondary" onclick="window.tutorNeuro.forzarRefresco()" 
                            style="padding:8px 20px;font-size:13px;background:linear-gradient(135deg,#6C5CE7,#00CEC9);color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s;"
                            onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" 
                            onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-sync"></i> Refrescar Ahora
                    </button>
                    ${esEspacial ? `
                        <button class="btn-secondary" onclick="window.uiCore.irAModulo('caracteres')" 
                                style="padding:8px 20px;font-size:13px;background:linear-gradient(135deg,#6C5CE7,#00CEC9);color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" 
                                onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                            <i class="fas fa-font"></i> Modo Espacial
                        </button>
                    ` : ''}
                </div>
                
                <!-- FOOTER V8.5 -->
                <div style="margin-top:16px;text-align:center;font-size:10px;color:var(--gray-light);border-top:1px solid var(--light);padding-top:12px;">
                    <span>🧠 Tutor Neuro V8.5 · ${esEspacial ? '🌌 Modo Espacial' : 'Doble Herencia (Vigia + Centinela)'}</span>
                    <span style="margin:0 8px;">·</span>
                    <span>📊 ${this._historialIntervenciones.length} intervenciones totales</span>
                    <span style="margin:0 8px;">·</span>
                    <span>🎯 ${this._mapaAprendizaje.microObjetivos.filter(m => m.completado).length} micros completados</span>
                    <span style="margin:0 8px;">·</span>
                    <span>📚 ${historiasLeidas}/${totalHistorias} lecturas</span>
                    ${esEspacial ? `<span style="margin:0 8px;">·</span><span>🀄 ${caracteresDominados} caracteres</span>` : ''}
                    <span style="margin:0 8px;">·</span>
                    <span>🔄 ${metricasRefresco.totalRefrescos} refrescos automáticos</span>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    // ============================================================
    // MÉTODOS PARA MOSTRAR ESTADÍSTICAS COMPLETAS
    // ============================================================
    async _mostrarEstadisticasCompletas() {
        if (this._core && typeof this._core.mostrarToast === 'function') {
            this._core.mostrarToast('📊 Abriendo estadísticas completas V8.5...', 'info');
        }
        if (this._core && typeof this._core.irAModulo === 'function') {
            this._core.irAModulo('stats');
        }
    }

    async _mostrarHistorialCompleto() {
        let mensaje = '📋 **HISTORIAL DE INTERVENCIONES V8.5**\n\n';
        const historial = this._historialIntervenciones.slice(-20).reverse();
        if (historial.length === 0) {
            mensaje += 'No hay intervenciones registradas aún.';
        } else {
            for (const i of historial) {
                const fecha = i.mostrada ? new Date(i.mostrada).toLocaleString('es-ES') : 'N/A';
                const prioridad = i.prioridad || 'media';
                const icono = prioridad === 'alta' ? '🔴' : prioridad === 'media' ? '🟡' : '🟢';
                const regla = i.reglaId || '';
                mensaje += `${icono} ${fecha}: ${i.mensaje ? i.mensaje.substring(0, 60) + (i.mensaje.length > 60 ? '...' : '') : 'Intervención'}\n`;
                if (regla) mensaje += `   📌 ${regla.replace(/_/g, ' ')}\n`;
            }
        }
        if (this._core && typeof this._core.alert === 'function') {
            this._core.alert(mensaje, '📋 Historial de Intervenciones V8.5');
        } else {
            alert(mensaje);
        }
    }

    // ============================================================
    // DESTRUIR
    // ============================================================
    destroy() {
        if (this._healthCheckInterval) { clearInterval(this._healthCheckInterval); this._healthCheckInterval = null; }
        if (this._intervaloRefresco) { clearInterval(this._intervaloRefresco); this._intervaloRefresco = null; }
        const panel = document.getElementById('tutorPanel');
        if (panel) panel.remove();
        this._restaurarNavegacion();
        this._refrescoActivo = false;
        this._guardarEstadoEnLocalStorage();
        console.log('🧠 Tutor Neuro V8.5 destruido');
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================
window.tutorNeuro = new TutorNeuro();

// INICIALIZACIÓN NO BLOQUEANTE CON DOBLE HERENCIA
(function initTutorNeuroNoBloqueante() {
    console.log('🧠 Tutor Neuro V8.5: Inicialización en segundo plano (NO BLOQUEANTE - TUTOR ESPACIAL CORREGIDO - REFRESCO AUTOMÁTICO OBLIGATORIO)');
    const intentarIniciar = async function() {
        try {
            await new Promise(r => setTimeout(r, 2000));
            if (window.vigia && window.vigia._initDone) {
                console.log('🧠 Tutor Neuro: Vigía listo, iniciando en segundo plano...');
                await window.tutorNeuro.initTutor();
                console.log('✅ Tutor Neuro V8.5 inicializado correctamente (MAESTRÍA ABSOLUTA - REFRESCO AUTOMÁTICO OBLIGATORIO)');
                return true;
            } else {
                console.log('⏳ Tutor Neuro: Vigía no listo, reintentando en 3s...');
                return false;
            }
        } catch (error) {
            console.warn('⚠️ Tutor Neuro: Error en inicialización:', error.message);
            return false;
        }
    };
    let intentos = 0;
    const maxIntentos = 5;
    const ejecutarReintento = async function() {
        if (intentos >= maxIntentos) {
            console.warn('⚠️ Tutor Neuro: Máximo de reintentos alcanzado, se ejecutará en segundo plano sin esperar');
            setTimeout(() => window.tutorNeuro.initTutor().catch(() => {}), 5000);
            return;
        }
        intentos++;
        const exito = await intentarIniciar();
        if (!exito && intentos < maxIntentos) setTimeout(ejecutarReintento, 3000);
        else if (!exito) { console.log('🧠 Tutor Neuro: Ejecutando initTutor en segundo plano (sin await)'); window.tutorNeuro.initTutor().catch(() => {}); }
    };
    setTimeout(ejecutarReintento, 1000);
})();

console.log('✅ Tutor de Aprendizaje NeuroAdaptativo V8.5 - MAESTRÍA ABSOLUTA - REFRESCO AUTOMÁTICO OBLIGATORIO');
console.log('  🚀 Guía proactiva al 120% para el alumno');
console.log('  🔥 Contexto enriquecido con TODOS los módulos (incluyendo Biblioteca)');
console.log('  🔥 Recomendación inteligente de módulo');
console.log('  🔥 Sistema de logros y puntos de experiencia');
console.log('  🔥 Detección de estancamiento');
console.log('  🔥 Micro-objetivos personalizados');
console.log('  🔥 Análisis de progreso profundo');
console.log('  🔥 Estado cognitivo del usuario');
console.log('  🔥 Modo Guiado con bloqueos reales');
console.log('  🔥 Estadísticas avanzadas por módulo y nivel');
console.log('  🎯 Dashboard actualizado con recomendaciones');
console.log('  🔄 Sincronización total con UIConfig');
console.log('  📊 Tablas y gráficos de progreso');
console.log('  🎨 Interfaz de élite con gradientes y animaciones');
console.log('  ✅ Todas las funcionalidades originales preservadas');
console.log('  🧠 Doble herencia: Vigia + Centinela');
console.log('  📚 Biblioteca integrada con recomendaciones');
console.log('  🎯 Sistema de micro-objetivos');
console.log('  📈 Métricas avanzadas de aprendizaje');
console.log('  🏆 Nuevos logros y recompensas');
console.log('  🔗 Vinculación con Centinela para neuro-monitoreo');
console.log('  🌌 **NUEVO: MODO ESPACIAL para idiomas jeroglíficos**');
console.log('  🀄 Sistema de radicales, caracteres y escritura');
console.log('  🧠 Mnemotecnia visual para recordar caracteres');
console.log('  🧩 Descomposición de caracteres en componentes');
console.log('  ✍️ Práctica de orden de trazos');
console.log('  🌀 Radicales por niveles (básico, intermedio, avanzado)');
console.log('  ✅ CORREGIDO: modoConfig.espacial existe');
console.log('  ✅ CORREGIDO: this._configuracion.espacial existe');
console.log('  ✅ CORREGIDO: _inicializarModoEspacial maneja todos los casos');
console.log('  ✅ CORREGIDO: initTutor crea las estructuras faltantes');
console.log('  🔥 MÉTODOS PÚBLICOS: forzarRecomendacion(), forzarAnalisis(), ejecutarRecomendacion()');
console.log('  🔄 **NUEVO V8.5: REFRESCO AUTOMÁTICO OBLIGATORIO**');
console.log('  🔄 **NUEVO: INTERVALO DE REFRESCO (5s por defecto - más rápido)**');
console.log('  🔄 **NUEVO: REFRESCO INMEDIATO DESPUÉS DE INICIALIZACIÓN**');
console.log('  🔄 **NUEVO: MANEJADOR DE EVENTOS CON BIND**');
console.log('  🔄 **NUEVO: REFRESCOS PENDIENTES ENCOLA DOS**');
console.log('  🔄 **NUEVO: MÉTRICAS POR EVENTO DE REFRESCO**');
console.log('  🔄 **NUEVO: BADGE CON CONTADOR DE REFRESCOS**');
console.log('  🔄 **NUEVO: ETIQUETA "REFRESCO AUTO" EN CABECERA**');
console.log('  🔄 **NUEVO: REFRESCO EN EVENTO appInitCompleta**');
console.log('  🔄 **NUEVO: REFRESCO DE SEGURIDAD (2s y 5s después de init)**');
console.log('  🔄 **NUEVO: getIntervencionesPendientes() y getSiguienteTema() públicos**');
console.log('  🔥 **NUEVO V8.5: FORZAR ANÁLISIS AL ENTRAR AUTOMÁTICAMENTE**');
console.log('  🔥 **NUEVO: SIMULA EL CLICK EN "Forzar Análisis" AL ABRIR EL TUTOR**');
console.log('  🔥 **NUEVO: PERSISTENCIA EN localStorage DE FORZAR ANÁLISIS**');
console.log('  🔥 **NUEVO: BOTÓN "Forzar Análisis" EN EL DASHBOARD DE ÉLITE**');
console.log('  🔥 **NUEVO: GUARDADO AUTOMÁTICO DE ESTADO EN localStorage**');
console.log('  🔥 **NUEVO: RECUPERACIÓN DE ESTADO AL RECARGAR LA PÁGINA**');