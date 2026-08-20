// ============================================================
// TUTOR NEURO V4.3 - CORREGIDO: INICIALIZACIÓN NO BLOQUEANTE + MODO GUIADO
// ============================================================

class TutorNeuro extends Vigia {
    constructor() {
        super();
        this._nombre = '🧠 Tutor de Aprendizaje NeuroAdaptativo';
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
        
        this._MODOS = {
            GUIADO: 'guiado',
            FLEXIBLE: 'flexible',
            LIBRE: 'libre'
        };
        
        this._modoActual = this._MODOS.FLEXIBLE;
        
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
            temasBloqueados: []
        };
        
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
            temasCompletados: [],
            temasEnProgreso: [],
            temasPendientes: [],
            metricasTemas: {},
            historialEstudio: []
        };
        
        this._reglasIntervencion = {};
        this._cacheUltimoAnalisis = {};
        this._tiempoCacheAnalisis = 60000;
        this._historialRespuestas = [];
        this._erroresRegistrados = [];
        
        // 🔥 CONTROL DE ANÁLISIS - PREVENIR EJECUCIONES CONCURRENTES
        this._analizando = false;
        this._analisisPendiente = false;
        this._ultimoAnalisis = 0;
        this._intervaloAnalisis = 30000;
        
        this._PALABRAS_CLAVE = {
            'A1': ['familia', 'casa', 'comida', 'agua', 'perro', 'gato', 'hola', 'adiós', 'gracias', 'por favor', 'sí', 'no', 'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos'],
            'A2': ['viaje', 'compras', 'salud', 'deporte', 'trabajo', 'música', 'teléfono', 'internet', 'naturaleza', 'reciclaje', 'tiempo', 'clima', 'ropa', 'color', 'talla'],
            'B1': ['relación', 'amistad', 'amor', 'educación', 'aprendizaje', 'prensa', 'televisión', 'turismo', 'patrimonio', 'tecnología', 'innovación', 'gastronomía', 'arte', 'historia'],
            'B2': ['política', 'sociedad', 'economía', 'ciencia', 'investigación', 'filosofía', 'psicología', 'globalización', 'desarrollo', 'sostenibilidad', 'literatura'],
            'C1': ['crítica', 'retórica', 'antropología', 'investigación', 'análisis', 'argumentación'],
            'C2': ['especialización', 'debate', 'oratoria', 'creación', 'literaria']
        };
        
        // 🔥 Flag para evitar múltiples inicializaciones
        this._inicializandoTutor = false;
    }

    // ============================================================
    // COLORES Y CONFIGURACIONES PARA MODOS DEL TUTOR
    // ============================================================

    _getModoColor(modo) {
        const colores = {
            'guiado': '#6C5CE7',
            'flexible': '#00B894',
            'libre': '#636E72'
        };
        return colores[modo] || '#6C5CE7';
    }

    _getModoBg(modo) {
        const bg = {
            'guiado': 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
            'flexible': 'linear-gradient(135deg, #00B894, #55EFC4)',
            'libre': 'linear-gradient(135deg, #636E72, #2D3436)'
        };
        return bg[modo] || 'linear-gradient(135deg, #6C5CE7, #A29BFE)';
    }

    _getModoIcono(modo) {
        const iconos = {
            'guiado': '🚀',
            'flexible': '🧠',
            'libre': '📴'
        };
        return iconos[modo] || '🧠';
    }

    // ============================================================
    // INICIALIZAR REGLAS DE INTERVENCIÓN
    // ============================================================

    _inicializarReglas() {
        return {
            'fallos_consecutivos': {
                id: 'fallos_consecutivos',
                nombre: 'Fallos Consecutivos',
                descripcion: 'Detecta cuando el usuario falla varias frases seguidas',
                prioridad: 'alta',
                condiciones: { fallosConsecutivos: 3, tiempoVentana: 120000 },
                accion: 'sugerir_repaso',
                mensaje: (contexto) => `🔴 Veo que has fallado ${contexto.fallos} frases seguidas sobre "${contexto.tema || 'este tema'}". ¿Quieres repasar las reglas gramaticales?`,
                opciones: (modo) => {
                    const base = [
                        { id: 'repasar_ahora', label: '📖 Repasar ahora', accion: 'ir_a_gramatica' }
                    ];
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
                    const base = [
                        { id: 'practicar_ahora', label: '🎯 Practicar ahora', accion: 'ir_a_espacio' }
                    ];
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
                    const base = [
                        { id: 'descansar', label: '☕ Tomar descanso', accion: 'sugerir_descanso' }
                    ];
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
                    const base = [
                        { id: 'estudiar_tema', label: '📖 Estudiar ahora', accion: 'estudiar_tema_recomendado' }
                    ];
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
                    const base = [
                        { id: 'continuar', label: '🎯 Seguir así', accion: 'descartar' }
                    ];
                    if (modo !== 'guiado') {
                        base.push({ id: 'ver_progreso', label: '📊 Ver progreso', accion: 'ver_estadisticas' });
                    }
                    return base;
                }
            }
        };
    }

    // ============================================================
    // MÉTODOS DE CONFIGURACIÓN DE MODOS (CON BLOQUEO REAL)
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
        this._configuracion.intervencionAuto = modo !== this._MODOS.LIBRE;
        this._configuracion.nivelInvasividad = modo === this._MODOS.GUIADO ? 'alto' : 'bajo';
        
        localStorage.setItem('pipeline_tutor_modo', modo);
        localStorage.setItem('pipeline_tutor_config', JSON.stringify(this._configuracion));
        
        console.log(`🔄 Tutor Neuro: Modo cambiado a "${modo}"`);
        console.log(`   📌 Intervenciones: ${this._configuracion.intervencionAuto ? 'Activadas' : 'Desactivadas'}`);
        console.log(`   📌 Invasividad: ${this._configuracion.nivelInvasividad}`);
        console.log(`   📌 Bloqueo navegación: ${config.bloqueoNavegacion}`);
        
        // 🔥 SI ES MODO GUIADO, ACTIVAR BLOQUEOS
        if (modo === this._MODOS.GUIADO) {
            this._iniciarModoGuiado();
        } else {
            // Si cambia a otro modo, desbloquear
            this._navegacionBloqueada = false;
            this._restaurarNavegacion();
        }
        
        // Si cambia de modo, actualizar el badge
        this._actualizarBadgeTutor();
        
        // Forzar recarga del dashboard para reflejar el cambio
        if (window.UIDashboard) {
            setTimeout(() => {
                window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }, 300);
        }
        
        window.dispatchEvent(new CustomEvent('tutorModoCambiado', {
            detail: { 
                modo, 
                configuracion: this._configuracion,
                modoAnterior: modoAnterior
            }
        }));
        
        // Mostrar notificación del cambio
        const core = this._core || window.uiCore;
        const info = this.getModoInfo();
        core?.mostrarToast(`🔄 Modo cambiado a ${info.nombre}`, 'info');
        
        if (modo === this._MODOS.GUIADO) {
            core?.mostrarToast('🚀 Modo Guiado: Solo puedes estudiar lo que el Tutor recomienda.', 'warning');
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
            }
        };
        return info[this._modoActual] || info[this._MODOS.FLEXIBLE];
    }

    // ============================================================
    // INICIAR MODO GUIADO CON BLOQUEOS REALES
    // ============================================================

    _iniciarModoGuiado() {
        console.log('🚀 Modo Guiado: Activando bloqueos de navegación...');
        
        // Guardar referencias originales si no están guardadas
        if (!this._originalIrAModulo && window.uiCore) {
            this._originalIrAModulo = window.uiCore.irAModulo;
        }
        if (!this._originalEstudiarTema && window.UITemas) {
            this._originalEstudiarTema = window.UITemas._estudiarTema;
        }
        if (!this._originalCambiarModoEstudio && window.UIStudy) {
            this._originalCambiarModoEstudio = window.UIStudy.cambiarModoEstudio;
        }
        
        // 1. Bloquear navegación a módulos no permitidos
        this._overrideNavegacion();
        
        // 2. Bloquear selección manual de temas
        this._overrideSeleccionTemas();
        
        // 3. Bloquear cambio de modo de estudio
        this._overrideCambioModoEstudio();
        
        // 4. Bloquear acciones de estudio manual
        this._overrideEstudioManual();
        
        // 5. Marcar que el modo guiado está activo
        this._navegacionBloqueada = true;
        
        // 6. Mostrar el paso actual
        setTimeout(() => {
            const paso = this._getPasoRecomendado();
            if (paso && !paso.completado) {
                const core = this._core || window.uiCore;
                core?.mostrarToast(`📌 Modo Guiado: Estudia "${paso.titulo}"`, 'info');
                core?.irAModulo('study');
            }
        }, 1000);
        
        // 7. Actualizar el badge
        this._actualizarBadgeTutor();
        
        // 8. Mostrar intervención de bienvenida al modo guiado
        // 🔥 CORREGIDO: Crear la intervención correctamente
        const intervencionGuiado = {
            id: 'modo_guiado_activado_' + Date.now(),
            reglaId: 'modo_guiado_activado',
            prioridad: 'alta',
            mensaje: `🚀 **Modo Guiado ACTIVADO**\n\n` +
                     `🔒 **Navegación bloqueada** - Solo puedes acceder a los módulos recomendados.\n` +
                     `📌 **Sigue la ruta** - El Tutor te guiará paso a paso.\n` +
                     `✅ **Completa cada paso** para avanzar al siguiente.\n\n` +
                     `💡 No puedes ignorar las recomendaciones del Tutor.`,
            opciones: [
                { id: 'ok', label: '✅ Entendido', accion: 'descartar' }
            ],
            timestamp: Date.now()
        };
        
        // Agregar la intervención y mostrarla
        this._intervencionesPendientes.push(intervencionGuiado);
        this._ultimaIntervencion = Date.now();
        this._contadorIntervencionesSesion++;
        
        // Mostrar la intervención (con manejo de errores)
        this._mostrarIntervencion(intervencionGuiado);
    }

    // ============================================================
    // RESTAURAR NAVEGACIÓN (AL SALIR DEL MODO GUIADO)
    // ============================================================

    _restaurarNavegacion() {
        console.log('🔓 Restaurando navegación...');
        this._navegacionBloqueada = false;
        
        // Restaurar métodos originales
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
        core?.mostrarToast('🔓 Navegación restaurada', 'info');
    }

    // ============================================================
    // SOBRESCRIBIR NAVEGACIÓN DE MÓDULOS
    // ============================================================

    _overrideNavegacion() {
        if (this._modoActual !== this._MODOS.GUIADO) return;
        if (!window.uiCore) return;
        
        const self = this;
        const modulosPermitidos = ['dashboard', 'study', 'vigia', 'config'];
        
        // Guardar referencia original si no está guardada
        if (!this._originalIrAModulo) {
            this._originalIrAModulo = window.uiCore.irAModulo;
        }
        
        // Sobrescribir
        window.uiCore.irAModulo = function(modulo) {
            if (modulosPermitidos.includes(modulo)) {
                self._originalIrAModulo.call(this, modulo);
            } else {
                self._mostrarNotificacionBloqueo('navegar_a_modulo', modulo);
                // Mostrar el paso actual en su lugar
                const paso = self._getPasoRecomendado();
                if (paso && !paso.completado) {
                    self._core?.mostrarToast(`📌 Debes estudiar: "${paso.titulo}"`, 'warning');
                    self._originalIrAModulo.call(this, 'study');
                }
            }
        };
    }

    // ============================================================
    // SOBRESCRIBIR SELECCIÓN DE TEMAS
    // ============================================================

    _overrideSeleccionTemas() {
        if (this._modoActual !== this._MODOS.GUIADO) return;
        if (!window.UITemas) return;
        
        const self = this;
        
        // Guardar referencia original
        if (!this._originalEstudiarTema) {
            this._originalEstudiarTema = window.UITemas._estudiarTema;
        }
        
        // Sobrescribir
        window.UITemas._estudiarTema = async function(temaId) {
            // Verificar si el tema es el recomendado
            const pasoActual = self._getPasoRecomendado();
            const temaRecomendado = pasoActual?.parametros?.temaId;
            
            if (temaRecomendado && temaRecomendado !== temaId) {
                self._mostrarNotificacionBloqueo('estudiar_tema_manual');
                
                // Mostrar el paso recomendado
                const core = self._core || window.uiCore;
                if (pasoActual) {
                    core?.mostrarToast(`📌 Modo Guiado: Debes estudiar "${pasoActual.titulo}"`, 'warning');
                    core?.irAModulo('study');
                }
                return;
            }
            
            // Si es el tema correcto o no hay tema recomendado, permitir
            self._originalEstudiarTema.call(this, temaId);
        };
    }

    // ============================================================
    // SOBRESCRIBIR CAMBIO DE MODO DE ESTUDIO
    // ============================================================

    _overrideCambioModoEstudio() {
        if (this._modoActual !== this._MODOS.GUIADO) return;
        if (!window.UIStudy) return;
        
        const self = this;
        
        // Guardar referencia original
        if (!this._originalCambiarModoEstudio) {
            this._originalCambiarModoEstudio = window.UIStudy.cambiarModoEstudio;
        }
        
        // Sobrescribir
        window.UIStudy.cambiarModoEstudio = function(modo) {
            // En modo guiado, solo permitir el modo que el tutor recomienda
            const pasoActual = self._getPasoRecomendado();
            const modoRecomendado = pasoActual?.parametros?.modoEstudio || 'flashcard';
            
            if (modo !== modoRecomendado) {
                self._mostrarNotificacionBloqueo('cambiar_modo_estudio');
                const core = self._core || window.uiCore;
                core?.mostrarToast(`📌 Modo Guiado: Usa el modo "${modoRecomendado}"`, 'warning');
                return;
            }
            
            // Si es el modo correcto, permitir
            self._originalCambiarModoEstudio.call(this, modo);
        };
    }

    // ============================================================
    // SOBRESCRIBIR ESTUDIO MANUAL
    // ============================================================

    _overrideEstudioManual() {
        if (this._modoActual !== this._MODOS.GUIADO) return;
        
        const self = this;
        
        // Bloquear respuestas que no sean del paso actual
        window.addEventListener('respuestaEstudio', (e) => {
            const detalle = e.detail;
            if (!detalle) return;
            
            // En modo guiado, verificar que la respuesta sea del paso actual
            const pasoActual = self._getPasoRecomendado();
            if (!pasoActual || pasoActual.completado) {
                self._mostrarNotificacionBloqueo('respuesta_estudio');
                return;
            }
            
            // Si el paso no está activo, bloquear
            if (!self._pasoActivo) {
                self._mostrarNotificacionBloqueo('respuesta_estudio');
                return;
            }
        }, true); // Capturar en fase de captura
    }

    // ============================================================
    // VERIFICAR PERMISO PARA ACCIONES
    // ============================================================

    _verificarPermiso(accion) {
        const modo = this._modoActual;
        
        if (modo === this._MODOS.GUIADO) {
            // 🔒 MODO GUIADO: SOLO PERMITIR ACCIONES DEL TUTOR
            const accionesPermitidas = [
                'ejecutar_paso_learning_path',
                'ejecutar_paso',
                'estudiar_tema_recomendado',
                'ver_ruta',
                'descartar',
                'sugerir_descanso',
                'ver_estadisticas',
                'ir_a_estudio',
                'ir_a_dashboard'
            ];
            
            if (!accionesPermitidas.includes(accion)) {
                console.warn(`🚫 Modo Guiado: Acción "${accion}" NO PERMITIDA`);
                this._mostrarNotificacionBloqueo(accion);
                return false;
            }
            return true;
        }
        
        if (modo === this._MODOS.FLEXIBLE) {
            // 🧠 MODO FLEXIBLE: TODO PERMITIDO CON ADVERTENCIAS
            return true;
        }
        
        if (modo === this._MODOS.LIBRE) {
            // 📴 MODO LIBRE: TODO PERMITIDO SIN INTERVENCIONES
            return true;
        }
        
        return true;
    }

    // ============================================================
    // MOSTRAR NOTIFICACIÓN DE BLOQUEO
    // ============================================================

    _mostrarNotificacionBloqueo(accion, modulo = '') {
        const mensajes = {
            'estudiar_tema_manual': '🚫 Modo Guiado: No puedes seleccionar temas manualmente. Sigue la ruta del Tutor.',
            'cambiar_modo_estudio': '🚫 Modo Guiado: El Tutor controla el modo de estudio.',
            'navegar_a_modulo': `🚫 Modo Guiado: No puedes acceder al módulo "${modulo}". Solo puedes ir a Dashboard, Study o Vigía.`,
            'ignorar_recomendacion': '🚫 Modo Guiado: No puedes ignorar las recomendaciones del Tutor.',
            'respuesta_estudio': '🚫 Modo Guiado: Completa el paso actual antes de continuar.',
            'cambiar_tema': '🚫 Modo Guiado: No puedes cambiar de tema. Sigue la ruta del Tutor.'
        };
        
        const mensaje = mensajes[accion] || `🚫 Modo Guiado: La acción "${accion}" no está permitida.`;
        
        const core = this._core || window.uiCore;
        core?.mostrarToast(mensaje, 'warning');
        
        // Registrar la intervención
        this._agregarIntervencion({
            id: 'bloqueo_' + Date.now(),
            reglaId: 'bloqueo_modo_guiado',
            prioridad: 'alta',
            mensaje: mensaje,
            opciones: [
                { id: 'ok', label: '✅ Entendido', accion: 'descartar' }
            ],
            timestamp: Date.now()
        });
    }

    // ============================================================
    // OBTENER EL PASO RECOMENDADO
    // ============================================================

    _getPasoRecomendado() {
        if (window.LearningPath) {
            return window.LearningPath.getPasoActual();
        }
        return null;
    }

    // ============================================================
    // MOSTRAR PASO ACTUAL (BOTÓN PARA MODO GUIADO)
    // ============================================================

    _mostrarPasoActual() {
        const paso = this._getPasoRecomendado();
        if (!paso) {
            const core = this._core || window.uiCore;
            core?.mostrarToast('ℹ️ No hay paso activo. Regenera tu ruta.', 'info');
            return;
        }
        
        const core = this._core || window.uiCore;
        core?.mostrarToast(`📌 Paso actual: "${paso.titulo}"`, 'info');
        core?.irAModulo('study');
    }

    // ============================================================
    // INICIALIZACIÓN PRINCIPAL - NO BLOQUEANTE
    // ============================================================

    async initTutor() {
        // 🔥 SIEMPRE RETORNAR RÁPIDO - NO BLOQUEAR EL DASHBOARD
        if (this._tutorInitDone) return this;
        if (this._inicializandoTutor) {
            console.log('⏳ Tutor ya está inicializándose en segundo plano...');
            return this;
        }
        
        this._inicializandoTutor = true;
        console.log('🧠 Iniciando Tutor de Aprendizaje NeuroAdaptativo v4.3...');
        
        // Marcar como iniciado inmediatamente para no bloquear
        this._tutorInitDone = true;
        
        // EJECUTAR TODO EN SEGUNDO PLANO
        setTimeout(async () => {
            try {
                console.log('🧠 Tutor: Ejecutando inicialización en segundo plano...');
                
                if (!this._initDone) {
                    await this.init();
                }
                
                this._reglasIntervencion = this._inicializarReglas();
                
                await this._cargarConfiguracion();
                
                const modoGuardado = localStorage.getItem('pipeline_tutor_modo');
                if (modoGuardado && Object.values(this._MODOS).includes(modoGuardado)) {
                    this._modoActual = modoGuardado;
                    this._configuracion.modo = modoGuardado;
                    console.log(`📌 Modo cargado: ${modoGuardado}`);
                }
                
                await this._actualizarContextoUsuario();
                await this._construirMapaAprendizaje();
                
                if (!this._eventosRegistrados) {
                    this._registrarEventos();
                    this._eventosRegistrados = true;
                }
                
                this._iniciarCicloAnalisis();
                
                await this._sincronizarConLearningPath();
                
                // Si el modo es guiado, activar bloqueos
                if (this._modoActual === this._MODOS.GUIADO) {
                    this._iniciarModoGuiado();
                }
                
                if (this._modoActual !== this._MODOS.LIBRE) {
                    setTimeout(() => {
                        this._recomendarSiguienteTema();
                    }, 3000);
                } else {
                    console.log('📴 Modo Libre: El tutor no hará recomendaciones automáticas.');
                }
                
                setTimeout(() => {
                    this._mostrarBienvenida();
                }, 5000);
                
                this._inicializandoTutor = false;
                console.log('✅ Tutor de Aprendizaje NeuroAdaptativo v4.3 inicializado correctamente (en segundo plano)');
                
            } catch (error) {
                console.error('❌ Error inicializando Tutor Neuro:', error);
                this._inicializandoTutor = false;
            }
        }, 500);
        
        // RETORNAR INMEDIATAMENTE
        return this;
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
                        contexto: {
                            paso: pasoActual,
                            progreso: progreso
                        }
                    });
                    
                    // Si es modo guiado, mostrar la intervención inmediatamente
                    if (this._modoActual === this._MODOS.GUIADO) {
                        const pendientes = this._intervencionesPendientes;
                        if (pendientes.length > 0) {
                            this._mostrarIntervencion(pendientes[pendientes.length - 1]);
                        }
                    }
                }

                window.dispatchEvent(new CustomEvent('tutorLearningPathSincronizado', {
                    detail: {
                        ruta: ruta,
                        pasoActual: pasoActual,
                        progreso: progreso
                    }
                }));
            }

        } catch (error) {
            console.warn('⚠️ Error sincronizando con Learning Path:', error);
        }
    }

    // ============================================================
    // CARGAR CONFIGURACIÓN
    // ============================================================

    async _cargarConfiguracion() {
        try {
            const config = JSON.parse(localStorage.getItem('pipeline_tutor_config') || 'null');
            if (config) {
                this._configuracion = { ...this._configuracion, ...config };
                this._intervaloMinimoIntervencion = this._configuracion.tiempoEntreIntervenciones * 1000;
            }
        } catch (error) {
            console.warn('⚠️ Error cargando configuración del tutor:', error);
        }
    }

    // ============================================================
    // ACTUALIZAR CONTEXTO DEL USUARIO
    // ============================================================

    async _actualizarContextoUsuario() {
        try {
            const usuario = await db.getUsuario();
            const stats = await db.obtenerEstadisticasNeuro();
            const infoActivo = gestorIdiomas?.getInfoActivo();
            const progreso = await db.obtenerTodoProgreso();
            
            const fechas = progreso.map(p => new Date(p.ultimoRepaso).toDateString());
            const uniqueFechas = [...new Set(fechas)].sort();
            let racha = 0;
            for (let i = uniqueFechas.length - 1; i >= 0; i--) {
                const fecha = new Date(uniqueFechas[i]);
                const diff = Math.floor((Date.now() - fecha.getTime()) / 86400000);
                if (diff === racha) {
                    racha++;
                } else {
                    break;
                }
            }
            
            this._contextoUsuario = {
                nivel: infoActivo?.nivel || 'A1',
                idioma: gestorIdiomas?.getIdiomaActivo() || 'es',
                idiomaNativo: usuario?.idiomaNativo || 'español',
                nombre: usuario?.nombre || 'Usuario',
                racha: racha || 0,
                neuroScore: stats.neuroScore || 0,
                eficiencia: stats.eficiencia || 0,
                faseActual: pipeline?.faseActual || 1,
                frasesCompletadas: stats.progreso || 0,
                totalFrases: stats.totalFrases || 0,
                temasCompletados: [],
                temasEnProgreso: [],
                temasPendientes: [],
                metricasTemas: {},
                historialEstudio: []
            };
        } catch (error) {
            console.warn('⚠️ Error actualizando contexto del usuario:', error);
        }
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
            temasClasificados.sort((a, b) => {
                return niveles.indexOf(a.nivel) - niveles.indexOf(b.nivel);
            });
            
            this._mapaAprendizaje.rutaActual = temasClasificados;
            
            this._contextoUsuario.temasCompletados = temasClasificados.filter(t => t.completado);
            this._contextoUsuario.temasEnProgreso = temasClasificados.filter(t => !t.completado && t.porcentaje > 0);
            this._contextoUsuario.temasPendientes = temasClasificados.filter(t => !t.completado && t.porcentaje === 0);
            
            const total = temasClasificados.length || 1;
            const completados = this._contextoUsuario.temasCompletados.length;
            const enProgreso = this._contextoUsuario.temasEnProgreso.length;
            this._mapaAprendizaje.progresoGeneral = Math.round(((completados * 100) + (enProgreso * 50)) / total);
            
            console.log(`🗺️ Mapa construido: ${temasClasificados.length} temas, ${this._mapaAprendizaje.progresoGeneral}% completado`);
            
        } catch (error) {
            console.error('❌ Error construyendo mapa de aprendizaje:', error);
        }
    }

    // ============================================================
    // REGISTRAR EVENTOS
    // ============================================================

    _registrarEventos() {
        console.log('🔗 Registrando eventos del Tutor Neuro...');
        
        window.addEventListener('respuestaEstudio', (e) => {
            this._onRespuestaEstudio(e.detail);
        });
        
        window.addEventListener('cambioFase', (e) => {
            this._onCambioFase(e.detail);
        });
        
        window.addEventListener('sesionFinalizada', (e) => {
            this._onSesionFinalizada(e.detail);
        });
        
        window.addEventListener('errorEstudio', (e) => {
            this._onErrorEstudio(e.detail);
        });
        
        window.addEventListener('moduloCambiado', (e) => {
            this._onModuloCambiado(e.detail);
        });
        
        window.addEventListener('learningPathGenerado', (e) => {
            console.log('🧠 Tutor Neuro: Learning Path generado, sincronizando...');
            setTimeout(() => {
                this._sincronizarConLearningPath();
            }, 500);
        });
        
        window.addEventListener('learningPathPasoCompletado', (e) => {
            console.log('🧠 Tutor Neuro: Paso completado en Learning Path');
            this._actualizarContextoUsuario();
            this._recomendarSiguienteTema(true);
            
            // En modo guiado, forzar la ejecución del siguiente paso
            if (this._modoActual === this._MODOS.GUIADO) {
                setTimeout(() => {
                    const siguientePaso = this._getPasoRecomendado();
                    if (siguientePaso && !siguientePaso.completado) {
                        const core = this._core || window.uiCore;
                        core?.mostrarToast(`📌 Siguiente paso: "${siguientePaso.titulo}"`, 'info');
                        core?.irAModulo('study');
                    }
                }, 2000);
            }
        });
        
        window.addEventListener('learningPathCompletado', (e) => {
            console.log('🧠 Tutor Neuro: Learning Path completado!');
            this._core?.mostrarToast('🎉 ¡Has completado tu ruta de aprendizaje!', 'success');
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
                
                // En modo guiado, mostrar la intervención inmediatamente
                if (this._modoActual === this._MODOS.GUIADO) {
                    const pendientes = this._intervencionesPendientes;
                    if (pendientes.length > 0) {
                        this._mostrarIntervencion(pendientes[pendientes.length - 1]);
                    }
                }
            }
        });
        
        console.log('✅ Eventos del Tutor Neuro registrados');
    }

    // ============================================================
    // EVENTOS DEL TUTOR
    // ============================================================

    _onRespuestaEstudio(detalle) {
        if (!this._configuracion.intervencionAuto) return;
        if (!detalle) return;
        
        this._ultimaActividad = Date.now();
        
        if (!this._historialRespuestas) {
            this._historialRespuestas = [];
        }
        this._historialRespuestas.push({
            ...detalle,
            timestamp: Date.now()
        });
        
        if (this._historialRespuestas.length > 50) {
            this._historialRespuestas = this._historialRespuestas.slice(-50);
        }
        
        this._analizarRespuesta(detalle);
    }

    _onCambioFase(detalle) {
        this._contextoUsuario.faseActual = detalle?.fase || 1;
    }

    _onSesionFinalizada(detalle) {
        this._sesionActiva = false;
    }

    _onErrorEstudio(detalle) {
        if (!this._erroresRegistrados) {
            this._erroresRegistrados = [];
        }
        this._erroresRegistrados.push({
            ...detalle,
            timestamp: Date.now()
        });
        
        if (this._erroresRegistrados.length > 20) {
            this._erroresRegistrados = this._erroresRegistrados.slice(-20);
        }
    }

    _onModuloCambiado(detalle) {
        this._actualizarContextoUsuario();
        if (detalle?.modulo === 'study') {
            this._sesionActiva = true;
            this._inicioSesion = Date.now();
            this._contadorIntervencionesSesion = 0;
        }
    }

    // ============================================================
    // ANÁLISIS DE RESPUESTAS - CON CONTROL DE CONCURRENCIA
    // ============================================================

    async _analizarRespuesta(detalle) {
        // 🔥 PREVENIR EJECUCIONES CONCURRENTES
        if (this._analizando) {
            console.log('⏳ Análisis en curso, encolando...');
            this._analisisPendiente = true;
            return;
        }

        try {
            this._analizando = true;
            this._analisisPendiente = false;
            
            if (this._contadorIntervencionesSesion >= this._configuracion.maxIntervencionesPorSesion) {
                console.log('⏳ Límite de intervenciones alcanzado');
                return;
            }
            
            const ahora = Date.now();
            if (ahora - this._ultimaIntervencion < this._intervaloMinimoIntervencion) {
                return;
            }
            
            if (detalle.tipo === 'fallo') {
                await this._analizarFallo(detalle);
            }
            
            if (detalle.tipo === 'correcto') {
                await this._analizarAcierto(detalle);
            }
            
            await this._analizarFatiga();
            await this._analizarEficiencia();
            
        } catch (error) {
            console.warn('⚠️ Error en análisis de respuesta:', error);
        } finally {
            this._analizando = false;
            
            // Si hay un análisis pendiente, ejecutarlo
            if (this._analisisPendiente) {
                console.log('🔄 Ejecutando análisis pendiente...');
                this._analisisPendiente = false;
                setTimeout(() => {
                    this._analizarRespuesta(detalle);
                }, 100);
            }
        }
    }

    async _analizarFallo(detalle) {
        const fallosRecientes = this._historialRespuestas
            .filter(r => r.tipo === 'fallo' && (Date.now() - r.timestamp) < 120000)
            .slice(-5);
        
        if (fallosRecientes.length < 3) return;
        
        const temas = fallosRecientes.map(r => r.tema || 'general');
        const conteo = {};
        for (const tema of temas) {
            conteo[tema] = (conteo[tema] || 0) + 1;
        }
        
        let temaFrecuente = null;
        let maxFrecuencia = 0;
        for (const [tema, frecuencia] of Object.entries(conteo)) {
            if (frecuencia > maxFrecuencia) {
                maxFrecuencia = frecuencia;
                temaFrecuente = tema;
            }
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
                contexto: {
                    tema: temaFrecuente,
                    fallos: maxFrecuencia,
                    nivel: this._contextoUsuario.nivel
                }
            });
            
            // En modo guiado, mostrar la intervención inmediatamente
            if (this._modoActual === this._MODOS.GUIADO) {
                const pendientes = this._intervencionesPendientes;
                if (pendientes.length > 0) {
                    this._mostrarIntervencion(pendientes[pendientes.length - 1]);
                }
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
                    contexto: {
                        aciertos: aciertosRecientes.length
                    }
                });
                
                // En modo guiado, mostrar la intervención inmediatamente
                if (this._modoActual === this._MODOS.GUIADO) {
                    const pendientes = this._intervencionesPendientes;
                    if (pendientes.length > 0) {
                        this._mostrarIntervencion(pendientes[pendientes.length - 1]);
                    }
                }
            }
        }
    }

    async _analizarFatiga() {
        if (!window.centinela) return;
        
        const estadoCentinela = centinela.getEstado();
        const fatiga = estadoCentinela.neuroFatiga || 0;
        
        if (fatiga > 0.6 && (Date.now() - this._inicioSesion) > 300000) {
            const tiempoSesion = Date.now() - this._inicioSesion;
            
            this._agregarIntervencion({
                id: 'fatiga_' + Date.now(),
                reglaId: 'fatiga_cognitiva',
                prioridad: 'alta',
                mensaje: `🧠 Tu fatiga cognitiva está en ${Math.round(fatiga * 100)}%. Llevas ${Math.round(tiempoSesion / 60000)} minutos estudiando.`,
                opciones: this._crearOpcionesPorModo([
                    { id: 'descansar', label: '☕ Tomar descanso', accion: 'sugerir_descanso' }
                ], [
                    { id: 'descansar', label: '☕ Tomar descanso', accion: 'sugerir_descanso' },
                    { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                    { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
                ]),
                timestamp: Date.now(),
                contexto: {
                    fatiga: fatiga,
                    tiempoSesion: tiempoSesion
                }
            });
            
            // En modo guiado, mostrar la intervención inmediatamente
            if (this._modoActual === this._MODOS.GUIADO) {
                const pendientes = this._intervencionesPendientes;
                if (pendientes.length > 0) {
                    this._mostrarIntervencion(pendientes[pendientes.length - 1]);
                }
            }
        }
    }

    async _analizarEficiencia() {
        const stats = await db.obtenerEstadisticasNeuro();
        const eficiencia = stats.eficiencia || 0;
        
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
                contexto: {
                    eficiencia: eficiencia
                }
            });
            
            // En modo guiado, mostrar la intervención inmediatamente
            if (this._modoActual === this._MODOS.GUIADO) {
                const pendientes = this._intervencionesPendientes;
                if (pendientes.length > 0) {
                    this._mostrarIntervencion(pendientes[pendientes.length - 1]);
                }
            }
        }
    }

    // ============================================================
    // CREAR OPCIONES POR MODO (CON POSPONER)
    // ============================================================

    _crearOpcionesPorModo(opcionesGuiado, opcionesFlexible) {
        if (this._modoActual === this._MODOS.GUIADO) {
            return opcionesGuiado;
        }
        
        // EN MODO FLEXIBLE: AÑADIR OPCIÓN POSPONER
        const opciones = [...opcionesFlexible];
        
        const tienePosponer = opciones.some(o => o.accion === 'posponer' || o.accion === 'descartar');
        if (!tienePosponer) {
            opciones.push({ id: 'posponer', label: '⏰ Posponer', accion: 'descartar' });
        }
        
        return opciones;
    }

    // ============================================================
    // GESTIÓN DE INTERVENCIONES
    // ============================================================

    _agregarIntervencion(intervencion) {
        if (this._modoActual === this._MODOS.LIBRE) {
            console.log('📴 Modo Libre: Intervención omitida');
            return;
        }
        
        if (!this._configuracion.intervencionAuto) return;
        
        if (this._contadorIntervencionesSesion >= this._configuracion.maxIntervencionesPorSesion) {
            return;
        }
        
        const ahora = Date.now();
        if (ahora - this._ultimaIntervencion < this._intervaloMinimoIntervencion) {
            return;
        }
        
        // Asegurar que opciones sea un array
        if (!Array.isArray(intervencion.opciones)) {
            console.warn('⚠️ opciones no es un array, convirtiendo:', intervencion.opciones);
            intervencion.opciones = [
                { id: 'ok', label: '✅ Aceptar', accion: 'descartar' }
            ];
        }
        
        this._intervencionesPendientes.push(intervencion);
        this._ultimaIntervencion = ahora;
        this._contadorIntervencionesSesion++;
        
        console.log(`🧠 Tutor: Nueva intervención "${intervencion.reglaId}" (${this._contadorIntervencionesSesion}/${this._configuracion.maxIntervencionesPorSesion}) [${this._modoActual}]`);
        
        // En modo guiado, mostrar inmediatamente
        if (this._modoActual === this._MODOS.GUIADO || intervencion.prioridad === 'alta') {
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
        // 🔥 CORREGIDO: Verificar que intervencion sea válida
        if (!intervencion || typeof intervencion !== 'object') {
            console.warn('⚠️ Intervención inválida, omitiendo:', intervencion);
            return;
        }
        
        // Asegurar que tenga opciones
        if (!Array.isArray(intervencion.opciones) || intervencion.opciones.length === 0) {
            intervencion.opciones = [
                { id: 'ok', label: '✅ Aceptar', accion: 'descartar' }
            ];
        }
        
        const idx = this._intervencionesPendientes.findIndex(i => i && i.id === intervencion.id);
        if (idx !== -1) {
            this._intervencionesPendientes.splice(idx, 1);
        }
        
        this._historialIntervenciones.push({
            ...intervencion,
            mostrada: Date.now()
        });
        
        if (this._historialIntervenciones.length > 100) {
            this._historialIntervenciones = this._historialIntervenciones.slice(-100);
        }
        
        const invasividad = this._configuracion.nivelInvasividad;
        
        // En modo guiado, usar siempre modal (invasividad alta)
        if (this._modoActual === this._MODOS.GUIADO) {
            this._mostrarModalIntervencion(intervencion);
        } else if (invasividad === 'bajo') {
            this._mostrarNotificacionSuave(intervencion);
        } else if (invasividad === 'medio') {
            this._mostrarPanelLateral(intervencion);
        } else {
            this._mostrarModalIntervencion(intervencion);
        }
        
        window.dispatchEvent(new CustomEvent('tutorIntervencion', {
            detail: {
                intervencion: intervencion,
                nivelInvasividad: invasividad,
                timestamp: Date.now()
            }
        }));
    }

    // ============================================================
    // NOTIFICACIONES (TOAST)
    // ============================================================

    _mostrarNotificacionSuave(intervencion) {
        // 🔥 CORREGIDO: Verificar que intervencion sea válida
        if (!intervencion || typeof intervencion !== 'object') {
            console.warn('⚠️ Intervención inválida para notificación suave');
            return;
        }
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            max-width: 380px;
            background: var(--white, #ffffff);
            border-radius: 12px;
            padding: 16px 20px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            z-index: 99998;
            border-left: 4px solid ${this._getColorPrioridad(intervencion.prioridad)};
            animation: slideInRight 0.4s ease;
            font-family: var(--font, sans-serif);
            transition: all 0.3s ease;
        `;
        
        const opciones = Array.isArray(intervencion.opciones) ? intervencion.opciones : [
            { id: 'ok', label: '✅ Aceptar', accion: 'descartar' }
        ];
        
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
            btn.addEventListener('click', () => {
                this._ejecutarAccion(btn.dataset.accion, intervencion);
                toast.remove();
            });
        });
        
        toast.querySelector('.cerrar-notificacion').addEventListener('click', () => {
            toast.remove();
        });
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(50px)';
                setTimeout(() => {
                    if (toast.parentNode) toast.remove();
                }, 300);
            }
        }, 20000);
    }

    _mostrarPanelLateral(intervencion) {
        // 🔥 CORREGIDO: Verificar que intervencion sea válida
        if (!intervencion || typeof intervencion !== 'object') {
            console.warn('⚠️ Intervención inválida para panel lateral');
            return;
        }
        
        let panel = document.getElementById('tutorPanel');
        
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'tutorPanel';
            panel.style.cssText = `
                position: fixed;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                max-width: 340px;
                width: 90%;
                background: var(--white, #ffffff);
                border-radius: 12px 0 0 12px;
                padding: 20px;
                box-shadow: -4px 0 30px rgba(0,0,0,0.1);
                z-index: 99997;
                border-left: 4px solid ${this._getColorPrioridad(intervencion.prioridad)};
                animation: slideInRight 0.4s ease;
                font-family: var(--font, sans-serif);
                transition: all 0.3s ease;
                max-height: 80vh;
                overflow-y: auto;
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
        
        const opciones = Array.isArray(intervencion.opciones) ? intervencion.opciones : [
            { id: 'ok', label: '✅ Aceptar', accion: 'descartar' }
        ];
        
        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:24px;">🧠</span>
                    <span style="font-weight:700;font-size:16px;color:var(--dark);">Tutor de Aprendizaje NeuroAdaptativo</span>
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
            
            <div style="margin-top:12px;font-size:10px;color:var(--gray-light);border-top:1px solid var(--light);padding-top:8px;display:flex;justify-content:space-between;">
                <span>${this._contadorIntervencionesSesion}/${this._configuracion.maxIntervencionesPorSesion}</span>
                <span>Nivel: ${this._contextoUsuario.nivel}</span>
                <span>📊 ${this._mapaAprendizaje.progresoGeneral || 0}%</span>
                ${this._modoActual === this._MODOS.GUIADO ? '<span>🚀 Guiado</span>' : ''}
            </div>
        `;
        
        document.getElementById('cerrarTutorPanel').addEventListener('click', () => {
            panel.style.display = 'none';
        });
        
        panel.querySelectorAll('.panel-intervencion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this._ejecutarAccion(btn.dataset.accion, intervencion);
                panel.style.display = 'none';
            });
        });
        
        this._panelVisible = true;
    }

    _mostrarModalIntervencion(intervencion) {
        // 🔥 CORREGIDO: Verificar que intervencion sea válida
        if (!intervencion || typeof intervencion !== 'object') {
            console.warn('⚠️ Intervención inválida para modal:', intervencion);
            // Mostrar un mensaje genérico en su lugar
            if (window.uiCore && window.uiCore.mostrarToast) {
                window.uiCore.mostrarToast('🧠 El Tutor tiene una recomendación para ti.', 'info');
            }
            return;
        }
        
        // Asegurar que tenga opciones
        if (!Array.isArray(intervencion.opciones) || intervencion.opciones.length === 0) {
            intervencion.opciones = [
                { id: 'ok', label: '✅ Aceptar', accion: 'descartar' }
            ];
        }
        
        if (window.uiCore && window.uiCore.confirm) {
            const opciones = intervencion.opciones;
            const opcionesTexto = opciones.map(o => `${o.label}`).join(' · ');
            
            // En modo guiado, mostrar un modal más restrictivo
            if (this._modoActual === this._MODOS.GUIADO) {
                const mensajeConBloqueo = `${intervencion.mensaje || 'Recomendación del Tutor'}\n\n🔒 Modo Guiado: No puedes ignorar esta recomendación.`;
                window.uiCore.confirm(
                    `${mensajeConBloqueo}\n\n${opcionesTexto}`,
                    '🚀 Modo Guiado'
                ).then(respuesta => {
                    const idx = opciones.findIndex(o => o.label === respuesta);
                    if (idx !== -1) {
                        this._ejecutarAccion(opciones[idx].accion, intervencion);
                    } else {
                        // Si no selecciona nada, forzar la acción principal
                        this._ejecutarAccion(opciones[0].accion, intervencion);
                    }
                });
            } else {
                window.uiCore.confirm(
                    `${intervencion.mensaje || 'Recomendación del Tutor'}\n\n${opcionesTexto}`,
                    '🧠 Tutor de Aprendizaje NeuroAdaptativo'
                ).then(respuesta => {
                    const idx = opciones.findIndex(o => o.label === respuesta);
                    if (idx !== -1) {
                        this._ejecutarAccion(opciones[idx].accion, intervencion);
                    }
                });
            }
        } else {
            alert(intervencion.mensaje || 'Recomendación del Tutor');
        }
    }

    // ============================================================
    // EJECUTAR ACCIONES
    // ============================================================

    async _ejecutarAccion(accion, intervencion) {
        console.log(`🧠 Tutor: Ejecutando acción "${accion}"`);

        const core = window.uiCore || window.ui;
        
        // Verificar permiso en modo guiado
        if (this._modoActual === this._MODOS.GUIADO) {
            if (!this._verificarPermiso(accion)) {
                return;
            }
        }
        
        switch(accion) {
            case 'ir_a_gramatica':
                if (core) core.irAModulo('grammar');
                break;
                
            case 'ir_a_espacio':
                if (core) core.irAModulo('espacio');
                break;
                
            case 'ir_a_temas':
                if (core) core.irAModulo('temas');
                break;
                
            case 'ir_a_estudio':
                if (core) core.irAModulo('study');
                break;
                
            case 'ir_a_dashboard':
                if (core) core.irAModulo('dashboard');
                break;
                
            case 'activar_modo_inverso':
                if (modoInverso) {
                    modoInverso.toggle();
                    core?.mostrarToast('🔄 Modo Inverso activado', 'info');
                }
                break;
                
            case 'activar_modo_expres':
                if (window.UIEspacio && window.UIEspacio._modoExpres) {
                    await window.UIEspacio._modoExpres();
                } else {
                    core?.mostrarToast('⚡ Modo Exprés activado', 'info');
                }
                break;
                
            case 'cambiar_modo_estudio':
                if (window.UIStudy && window.UIStudy.cambiarModoEstudio) {
                    const modos = ['flashcard', 'escritura', 'multiple', 'escucha'];
                    const modoActual = window.UIStudy._modoEstudio || 'flashcard';
                    const idx = modos.indexOf(modoActual);
                    const siguiente = modos[(idx + 1) % modos.length];
                    window.UIStudy.cambiarModoEstudio(siguiente);
                    core?.mostrarToast(`🔄 Modo cambiado a ${siguiente}`, 'info');
                }
                break;
                
            case 'sugerir_descanso':
                core?.mostrarToast('☕ Tómate un descanso de 5 minutos. ¡Tu cerebro lo agradecerá!', 'success');
                break;
                
            case 'añadir_a_lista':
                if (intervencion?.contexto?.palabra) {
                    const palabra = intervencion.contexto.palabra;
                    try {
                        const lista = JSON.parse(localStorage.getItem('pipeline_lista_repaso') || '[]');
                        if (!lista.includes(palabra)) {
                            lista.push(palabra);
                            localStorage.setItem('pipeline_lista_repaso', JSON.stringify(lista));
                        }
                    } catch (e) {}
                    core?.mostrarToast(`📝 "${palabra}" añadida a tu lista de repaso`, 'success');
                }
                break;
                
            case 'ver_estadisticas':
                if (core) core.irAModulo('stats');
                break;
                
            case 'ver_ruta':
                await this._mostrarRutaCompleta();
                break;

            case 'estudiar_tema_recomendado':
            case 'estudiar_tema':
                await this._estudiarTemaRecomendado();
                break;

            case 'ejecutar_paso_learning_path':
            case 'ejecutar_paso':
                if (window.LearningPath) {
                    await window.LearningPath.ejecutarPasoActual();
                    // En modo guiado, asegurar que se vaya al estudio
                    if (this._modoActual === this._MODOS.GUIADO) {
                        core?.irAModulo('study');
                    }
                } else {
                    core?.mostrarToast('❌ Learning Path no disponible', 'error');
                }
                break;

            case 'generar_nueva_ruta':
                if (window.LearningPath) {
                    await window.LearningPath.regenerarRuta();
                } else {
                    core?.mostrarToast('❌ Learning Path no disponible', 'error');
                }
                break;
                
            case 'posponer':
                core?.mostrarToast('⏰ Recomendación pospuesta. Volveré a recordártelo más tarde.', 'info');
                break;
                
            case 'descartar':
                break;
                
            case 'ignorar':
                if (this._modoActual === this._MODOS.GUIADO) {
                    core?.mostrarToast('🚫 Modo Guiado: No puedes ignorar las recomendaciones.', 'warning');
                }
                break;
                
            default:
                console.warn(`⚠️ Acción desconocida: ${accion}`);
        }
    }

    // ============================================================
    // MOSTRAR RUTA COMPLETA CON PAGINACIÓN Y BUSCADOR
    // ============================================================

    async _mostrarRutaCompleta() {
        // Obtener ruta de Learning Path o del mapa
        let ruta = [];
        let progreso = { completados: 0, total: 0, porcentaje: 0 };
        
        if (window.LearningPath) {
            ruta = window.LearningPath.getRutaCompleta();
            progreso = window.LearningPath.getProgreso();
        }
        
        if (ruta.length === 0) {
            ruta = this._mapaAprendizaje.rutaActual;
        }
        
        if (ruta.length === 0) {
            const core = window.uiCore || window.ui;
            core?.mostrarToast('📭 No hay temas en tu ruta de aprendizaje. ¡Genera contenido primero!', 'warning');
            return;
        }

        // Inicializar variables de paginación y búsqueda
        this._rutaFiltrada = [...ruta];
        this._paginaActualRuta = 1;
        this._busquedaRuta = '';
        this._modalRutaAbierto = true;

        this._renderizarModalRuta(ruta, progreso);
    }

    _renderizarModalRuta(rutaCompleta, progreso) {
        // Eliminar modal existente si lo hay
        const existing = document.getElementById('modalRutaCompleta');
        if (existing) existing.remove();

        const nivelActual = this._contextoUsuario.nivel || 'A1';
        const nombreUsuario = this._contextoUsuario.nombre || 'Usuario';
        const total = this._rutaFiltrada.length;
        const totalPaginas = Math.max(1, Math.ceil(total / this._pasosPorPagina));
        
        // Asegurar que la página actual sea válida
        if (this._paginaActualRuta > totalPaginas) {
            this._paginaActualRuta = totalPaginas;
        }
        if (this._paginaActualRuta < 1) {
            this._paginaActualRuta = 1;
        }

        const inicio = (this._paginaActualRuta - 1) * this._pasosPorPagina;
        const fin = Math.min(inicio + this._pasosPorPagina, total);
        const pasosPagina = this._rutaFiltrada.slice(inicio, fin);

        const overlay = document.createElement('div');
        overlay.id = 'modalRutaCompleta';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(12px);
            z-index: 100001;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        `;

        const coloresNivel = {
            'A1': '#6C5CE7', 'A2': '#0984E3', 'B1': '#00B894',
            'B2': '#FDCB6E', 'C1': '#E17055', 'C2': '#FD79A8'
        };
        const emojisNivel = {
            'A1': '🌱', 'A2': '🌿', 'B1': '🌳', 'B2': '🌲', 'C1': '🏔️', 'C2': '🗻'
        };

        // Generar HTML para los pasos de la página actual
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
            
            let textoEstado = '⏳ Pendiente';
            let colorEstado = 'var(--gray-light)';
            if (tema.completado) {
                textoEstado = '✅ Completado';
                colorEstado = 'var(--success)';
            } else if ((tema.porcentaje || 0) > 0) {
                textoEstado = `🔄 ${tema.porcentaje}%`;
                colorEstado = 'var(--warning)';
            }
            
            // Resaltar el texto buscado
            let nombreDestacado = nombreTema;
            if (this._busquedaRuta) {
                const regex = new RegExp(`(${this._busquedaRuta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                nombreDestacado = nombreTema.replace(regex, '<mark style="background:#FDCB6E;padding:0 4px;border-radius:2px;">$1</mark>');
            }
            
            temasHTML += `
                <div style="
                    background: ${esSiguiente ? 'var(--primary)04' : 'var(--white)'};
                    border-radius: 12px;
                    padding: 14px 18px;
                    margin-bottom: 10px;
                    border-left: 4px solid ${esSiguiente ? 'var(--primary)' : colorNivel};
                    border: ${esSiguiente ? '2px solid var(--primary)' : '1px solid var(--light)'};
                    box-shadow: ${esSiguiente ? '0 4px 20px rgba(108,92,231,0.15)' : 'var(--shadow)'};
                    transition: all 0.3s ease;
                    position: relative;
                ">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                        <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:200px;">
                            <span style="
                                display:inline-flex;
                                align-items:center;
                                justify-content:center;
                                width:28px;
                                height:28px;
                                border-radius:50%;
                                background: ${esSiguiente ? 'var(--primary)' : 'var(--bg)'};
                                color: ${esSiguiente ? 'white' : 'var(--gray)'};
                                font-size:12px;
                                font-weight:700;
                                flex-shrink:0;
                            ">${inicio + i + 1}</span>
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
                                <button onclick="
                                    document.getElementById('modalRutaCompleta').remove(); 
                                    window.tutorNeuro._estudiarTemaRecomendado();
                                " 
                                        style="padding:4px 12px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;font-family:var(--font);transition:all 0.3s;"
                                        onmouseover="this.style.transform='scale(1.05)'" 
                                        onmouseout="this.style.transform='none'">
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
        const modoColor = this._getModoColor(this._modoActual);
        const modoBg = this._getModoBg(this._modoActual);

        overlay.innerHTML = `
            <div style="
                background: var(--white, #ffffff);
                border-radius: 20px;
                padding: 28px 30px;
                max-width: 780px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 30px 80px rgba(0,0,0,0.4);
                animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                font-family: var(--font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
            ">
                <!-- HEADER -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:12px;flex-shrink:0;">
                    <div>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="font-size:32px;">🧠</span>
                            <div>
                                <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                                    Ruta de Aprendizaje
                                    <span style="font-size:13px;font-weight:400;color:var(--gray-light);">(${total} pasos)</span>
                                </h2>
                                <p style="font-size:13px;color:var(--gray);margin:2px 0 0;">
                                    <span style="font-weight:600;color:var(--dark);">${nombreUsuario}</span> · Nivel <strong>${nivelActual}</strong>
                                    <span style="display:inline-block;margin-left:8px;padding:2px 12px;border-radius:12px;background:${modoBg};color:white;font-size:10px;font-weight:600;">
                                        ${modoInfo.icono} ${modoInfo.nombre}
                                    </span>
                                    ${this._modoActual === this._MODOS.GUIADO ? '<span style="display:inline-block;margin-left:4px;padding:2px 8px;border-radius:8px;background:#6C5CE7;color:white;font-size:9px;">🔒 Guiado</span>' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button onclick="document.getElementById('modalRutaCompleta').remove(); window.tutorNeuro._modalRutaAbierto = false;" 
                            style="background:none;border:none;font-size:28px;color:var(--gray);cursor:pointer;transition:all 0.3s;padding:0 8px;"
                            onmouseover="this.style.color='var(--danger)'" 
                            onmouseout="this.style.color='var(--gray)'">
                        &times;
                    </button>
                </div>

                <!-- BUSCADOR -->
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

                <!-- ESTADÍSTICAS RÁPIDAS -->
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
                </div>

                <!-- LISTA DE PASOS PAGINADA -->
                <div style="flex:1;overflow-y:auto;margin-bottom:12px;min-height:200px;padding-right:4px;">
                    ${temasHTML || `
                        <div style="text-align:center;padding:30px;color:var(--gray);">
                            <i class="fas fa-search" style="font-size:32px;color:var(--gray-light);display:block;margin-bottom:8px;"></i>
                            <p>No se encontraron pasos con "<strong>${this._busquedaRuta}</strong>"</p>
                        </div>
                    `}
                </div>

                <!-- PAGINADOR -->
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

                <!-- FOOTER -->
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding-top:12px;border-top:1px solid var(--light);font-size:10px;color:var(--gray-light);flex-shrink:0;">
                    <div style="display:flex;gap:12px;">
                        <span>📌 Mostrando ${Math.max(1, inicio + 1)}-${Math.min(fin, total)} de ${total}</span>
                        <span>📄 ${totalPaginas} páginas</span>
                        ${this._busquedaRuta ? `<span>🔎 Filtrado: "${this._busquedaRuta}"</span>` : ''}
                        ${this._modoActual === this._MODOS.GUIADO ? '<span>🔒 Modo Guiado</span>' : ''}
                    </div>
                    <div>
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
        
        // Configurar cierre al hacer clic fuera
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                this._modalRutaAbierto = false;
            }
        });
        
        // Cerrar con Escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                if (overlay.parentNode) {
                    overlay.remove();
                    this._modalRutaAbierto = false;
                }
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Guardar referencia al handler para limpiar después
        overlay._escapeHandler = escapeHandler;
        
        // Actualizar contador de intervenciones en el badge
        this._actualizarBadgeTutor();
    }

    // ============================================================
    // FILTRAR RUTA POR BÚSQUEDA
    // ============================================================

    _filtrarRuta(texto) {
        this._busquedaRuta = texto.trim();
        this._paginaActualRuta = 1;
        
        // Obtener ruta completa
        let ruta = [];
        if (window.LearningPath) {
            ruta = window.LearningPath.getRutaCompleta();
        }
        if (ruta.length === 0) {
            ruta = this._mapaAprendizaje.rutaActual;
        }
        
        // Filtrar
        if (this._busquedaRuta) {
            const busquedaLower = this._busquedaRuta.toLowerCase();
            this._rutaFiltrada = ruta.filter(paso => {
                const titulo = (paso.titulo || paso.nombre || paso.tema || '').toLowerCase();
                const descripcion = (paso.descripcion || '').toLowerCase();
                const nivel = (paso.nivel || '').toLowerCase();
                const tipo = (paso.tipo || '').toLowerCase();
                return titulo.includes(busquedaLower) || 
                       descripcion.includes(busquedaLower) || 
                       nivel.includes(busquedaLower) ||
                       tipo.includes(busquedaLower);
            });
        } else {
            this._rutaFiltrada = [...ruta];
        }
        
        // Obtener progreso
        let progreso = { completados: 0, total: this._rutaFiltrada.length, porcentaje: 0 };
        if (this._rutaFiltrada.length > 0) {
            const completados = this._rutaFiltrada.filter(p => p.completado).length;
            progreso.completados = completados;
            progreso.porcentaje = Math.round((completados / this._rutaFiltrada.length) * 100);
        }
        
        this._renderizarModalRuta(this._rutaFiltrada, progreso);
    }

    // ============================================================
    // LIMPIAR BÚSQUEDA DE RUTA
    // ============================================================

    _limpiarBusquedaRuta() {
        this._busquedaRuta = '';
        this._paginaActualRuta = 1;
        
        let ruta = [];
        if (window.LearningPath) {
            ruta = window.LearningPath.getRutaCompleta();
        }
        if (ruta.length === 0) {
            ruta = this._mapaAprendizaje.rutaActual;
        }
        this._rutaFiltrada = [...ruta];
        
        let progreso = { completados: 0, total: this._rutaFiltrada.length, porcentaje: 0 };
        if (this._rutaFiltrada.length > 0) {
            const completados = this._rutaFiltrada.filter(p => p.completado).length;
            progreso.completados = completados;
            progreso.porcentaje = Math.round((completados / this._rutaFiltrada.length) * 100);
        }
        
        this._renderizarModalRuta(this._rutaFiltrada, progreso);
    }

    // ============================================================
    // IR A UNA PÁGINA ESPECÍFICA DE LA RUTA
    // ============================================================

    _irPaginaRuta(pagina) {
        const total = this._rutaFiltrada.length;
        const totalPaginas = Math.max(1, Math.ceil(total / this._pasosPorPagina));
        
        if (pagina < 1 || pagina > totalPaginas) return;
        
        this._paginaActualRuta = pagina;
        
        let ruta = [];
        if (window.LearningPath) {
            ruta = window.LearningPath.getRutaCompleta();
        }
        if (ruta.length === 0) {
            ruta = this._mapaAprendizaje.rutaActual;
        }
        
        let progreso = { completados: 0, total: this._rutaFiltrada.length, porcentaje: 0 };
        if (this._rutaFiltrada.length > 0) {
            const completados = this._rutaFiltrada.filter(p => p.completado).length;
            progreso.completados = completados;
            progreso.porcentaje = Math.round((completados / this._rutaFiltrada.length) * 100);
        }
        
        this._renderizarModalRuta(this._rutaFiltrada, progreso);
    }

    // ============================================================
    // ACTUALIZAR BADGE DEL TUTOR CON CONTADOR DE INTERVENCIONES
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
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
                background: var(--primary)15;
                color: var(--primary);
                border: 1px solid var(--primary)30;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-left: 8px;
            `;
            badge.innerHTML = '🧠 Tutor';
            badge.onclick = () => {
                const container = document.getElementById('tutorUnificadoContainer');
                if (container) {
                    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                // Si hay intervenciones, mostrar la primera
                if (this._intervencionesPendientes.length > 0) {
                    this._mostrarIntervencion(this._intervencionesPendientes[0]);
                }
            };
            headerRight.appendChild(badge);
        }
        
        if (badge) {
            try {
                const pendientes = this._intervencionesPendientes;
                const modoInfo = this.getModoInfo();
                const esGuiado = this._modoActual === this._MODOS.GUIADO;
                
                if (pendientes.length > 0) {
                    badge.classList.add('has-intervencion');
                    badge.style.background = esGuiado ? 'var(--warning)20' : 'var(--warning)15';
                    badge.style.borderColor = esGuiado ? 'var(--warning)' : 'var(--warning)';
                    badge.style.color = esGuiado ? 'var(--warning)' : 'var(--warning)';
                    badge.innerHTML = `🧠 Tutor (${pendientes.length})${esGuiado ? ' 🔒' : ''}`;
                    badge.title = `${pendientes.length} intervenciones pendientes - Haz clic para ver`;
                } else {
                    badge.classList.remove('has-intervencion');
                    badge.style.background = esGuiado ? 'var(--primary)20' : 'var(--primary)15';
                    badge.style.borderColor = esGuiado ? 'var(--primary)' : 'var(--primary)30';
                    badge.style.color = esGuiado ? 'var(--primary)' : 'var(--primary)';
                    badge.innerHTML = esGuiado ? '🧠 Tutor 🔒' : '🧠 Tutor';
                    badge.title = esGuiado ? 'Modo Guiado activo - Haz clic para ver' : 'Tutor Neuro - Haz clic para ver';
                }
            } catch (e) {
                console.warn('⚠️ Error actualizando badge:', e);
            }
        }
    }

    // ============================================================
    // MOSTRAR INTERVENCIÓN ESPECÍFICA (DESDE EL BADGE)
    // ============================================================

    _mostrarIntervencionEspecifica(indice) {
        if (indice < 0 || indice >= this._intervencionesPendientes.length) {
            console.warn('⚠️ Intervención no encontrada:', indice);
            return;
        }
        
        const intervencion = this._intervencionesPendientes[indice];
        this._mostrarIntervencion(intervencion);
    }

    // ============================================================
    // RECOMENDAR SIGUIENTE TEMA
    // ============================================================

    _recomendarSiguienteTema(forzar = false) {
        if (this._modoActual === this._MODOS.LIBRE && !forzar) {
            console.log('📴 Modo Libre: No se recomienda automáticamente');
            return;
        }
        
        // En modo guiado, siempre forzar
        if (this._modoActual === this._MODOS.GUIADO) {
            forzar = true;
        }
        
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
                        contexto: {
                            paso: pasoActual
                        }
                    });
                    return;
                } else {
                    console.log(`⚠️ Paso "${nombrePaso}" es nivel ${nivelPaso}, usuario es ${nivelReal}. Regenerando...`);
                    window.LearningPath._rutaActual = null;
                    window.LearningPath._pasoActual = 0;
                    localStorage.removeItem('pipeline_learning_path');
                    setTimeout(() => {
                        window.LearningPath.generarRuta(true);
                    }, 500);
                    return;
                }
            }
        }
        
        const ruta = this._mapaAprendizaje.rutaActual;
        
        if (ruta.length === 0) {
            console.log('ℹ️ No hay temas en la ruta de aprendizaje');
            this._construirMapaAprendizaje();
            return;
        }
        
        const temasFiltrados = ruta.filter(t => 
            this._esNivelValidoParaUsuario(t.nivel || 'A1', nivelReal)
        );
        
        if (temasFiltrados.length === 0) {
            console.log(`ℹ️ No hay temas del nivel ${nivelReal} o superior. Generando temas básicos...`);
            this._construirMapaAprendizaje();
            return;
        }
        
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
            mensaje: `🧠 **Siguiente tema recomendado:** "${nombreTema}"${mensajeProgreso}\n\n📊 Nivel: ${siguiente.nivel || nivelReal} · 📚 ${siguiente.historias || 0} historias\n${this._modoActual === this._MODOS.GUIADO ? '🚀 Modo Guiado: Debes estudiar este tema.' : ''}`,
            opciones: this._crearOpcionesPorModo([
                { id: 'estudiar_tema', label: '📖 Estudiar ahora', accion: 'estudiar_tema_recomendado' }
            ], [
                { id: 'estudiar_tema', label: '📖 Estudiar ahora', accion: 'estudiar_tema_recomendado' },
                { id: 'ver_ruta', label: '🗺️ Ver ruta', accion: 'ver_ruta' },
                { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' },
                { id: 'ignorar', label: '❌ Ignorar', accion: 'ignorar' }
            ]),
            timestamp: Date.now(),
            contexto: {
                tema: nombreTema,
                nivel: siguiente.nivel || nivelReal,
                progreso: progreso,
                historias: siguiente.historias || 0,
                totalTemas: ruta.length
            }
        });
        
        // En modo guiado, mostrar la intervención inmediatamente
        if (this._modoActual === this._MODOS.GUIADO) {
            const pendientes = this._intervencionesPendientes;
            if (pendientes.length > 0) {
                this._mostrarIntervencion(pendientes[pendientes.length - 1]);
            }
        }
    }

    // ============================================================
    // VALIDAR NIVEL DEL USUARIO
    // ============================================================

    _esNivelValidoParaUsuario(nivelPaso, nivelUsuario) {
        const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const idxPaso = niveles.indexOf(nivelPaso);
        const idxUsuario = niveles.indexOf(nivelUsuario);
        
        if (idxPaso === -1 || idxUsuario === -1) return true;
        
        return idxPaso <= idxUsuario + 1;
    }

    // ============================================================
    // ESTUDIAR TEMA RECOMENDADO
    // ============================================================

    _estudiarTemaRecomendado() {
        if (window.LearningPath) {
            const pasoActual = window.LearningPath.getPasoActual();
            if (pasoActual) {
                const core = window.uiCore || window.ui;
                const nombrePaso = pasoActual.titulo || pasoActual.nombre || pasoActual.tema || 'Paso actual';
                core?.mostrarToast(`📖 Ejecutando: "${nombrePaso}"`, 'info');
                window.LearningPath.ejecutarPasoActual();
                return;
            }
        }
        
        const ruta = this._mapaAprendizaje.rutaActual;
        const siguiente = ruta.find(t => !t.completado);
        
        if (!siguiente) {
            const core = window.uiCore || window.ui;
            core?.mostrarToast('❌ No hay temas recomendados', 'error');
            return;
        }
        
        const core = window.uiCore || window.ui;
        const nombreTema = siguiente.titulo || siguiente.nombre || siguiente.tema || 'Tema';
        core?.mostrarToast(`📖 Estudiando "${nombreTema}"...`, 'info');
        
        if (this._modoActual === this._MODOS.GUIADO) {
            this._navegacionBloqueada = true;
            core?.mostrarToast('🚀 Modo Guiado: El tutor te guiará a través de este tema.', 'info');
        }
        
        if (window.pipeline && window.pipeline.estudiarTema) {
            window.pipeline.estudiarTema(siguiente.id);
        } else if (core) {
            core.irAModulo('temas');
            setTimeout(() => {
                if (window.UITemas && window.UITemas._verTemaDetalle) {
                    window.UITemas._verTemaDetalle(siguiente.id);
                }
            }, 500);
        }
    }

    // ============================================================
    // BIENVENIDA
    // ============================================================

    _mostrarBienvenida() {
        const nombre = this._contextoUsuario.nombre || 'usuario';
        const infoModo = this.getModoInfo();
        const ruta = this._mapaAprendizaje.rutaActual;
        const siguiente = ruta.find(t => !t.completado);
        
        let mensaje = `🧠 ¡Hola ${nombre}! Soy tu Tutor de Aprendizaje NeuroAdaptativo.\n\n`;
        mensaje += `📌 **Modo actual:** ${infoModo.nombre}\n`;
        mensaje += `   ${infoModo.descripcion}\n\n`;
        mensaje += `📊 Progreso general: ${this._mapaAprendizaje.progresoGeneral || 0}%\n`;
        mensaje += `📚 Temas disponibles: ${ruta.length}\n\n`;
        
        if (siguiente && this._modoActual !== this._MODOS.LIBRE) {
            const nombreTema = siguiente.titulo || siguiente.nombre || siguiente.tema || 'Tema';
            mensaje += `📌 **Siguiente tema recomendado:** "${nombreTema}"\n`;
            mensaje += `   Nivel: ${siguiente.nivel || 'A1'} · 📚 ${siguiente.historias || 0} historias\n\n`;
        }
        
        if (this._modoActual === this._MODOS.GUIADO) {
            mensaje += `🚀 **Modo Guiado:** El tutor te guiará paso a paso. Solo puedes estudiar lo que él recomienda.\n\n`;
            mensaje += `🔒 **Navegación bloqueada** - No puedes seleccionar temas manualmente.\n\n`;
        } else if (this._modoActual === this._MODOS.FLEXIBLE) {
            mensaje += `🧠 **Modo Flexible:** El tutor sugiere, tú decides. Puedes aceptar o ignorar.\n\n`;
        } else {
            mensaje += `📴 **Modo Libre:** El tutor no interviene. Puedes consultar la ruta cuando quieras.\n\n`;
        }
        
        mensaje += `💡 Puedes cambiar el modo en Configuración > Tutor.`;
        
        this._agregarIntervencion({
            id: 'bienvenida_mapa_' + Date.now(),
            reglaId: 'bienvenida_mapa',
            prioridad: 'baja',
            mensaje: mensaje,
            opciones: this._crearOpcionesPorModo([
                { id: 'ver_ruta', label: '🗺️ Ver ruta', accion: 'ver_ruta' }
            ], [
                { id: 'ver_ruta', label: '🗺️ Ver ruta', accion: 'ver_ruta' },
                { id: 'ok', label: '👋 Entendido', accion: 'descartar' },
                { id: 'posponer', label: '⏰ Posponer', accion: 'descartar' }
            ]),
            timestamp: Date.now()
        });
        
        // En modo guiado, mostrar la intervención inmediatamente
        if (this._modoActual === this._MODOS.GUIADO) {
            const pendientes = this._intervencionesPendientes;
            if (pendientes.length > 0) {
                this._mostrarIntervencion(pendientes[pendientes.length - 1]);
            }
        }
    }

    // ============================================================
    // INICIAR CICLO DE ANÁLISIS
    // ============================================================

    _iniciarCicloAnalisis() {
        // 🔥 USAR setTimeout RECURSIVO EN VEZ DE setInterval
        const ejecutarAnalisis = async () => {
            if (this._sesionActiva && !this._analizando) {
                await this._analizarEstadoGeneral();
            }
            // Programar la siguiente ejecución
            setTimeout(ejecutarAnalisis, this._intervaloAnalisis);
        };
        
        // Iniciar el ciclo
        setTimeout(ejecutarAnalisis, 30000);
        console.log('🔄 Ciclo de análisis del Tutor Neuro iniciado (cada 30s)');
    }

    async _analizarEstadoGeneral() {
        // 🔥 PREVENIR EJECUCIONES CONCURRENTES
        if (this._analizando) {
            console.log('⏳ Análisis general en curso, omitiendo...');
            return;
        }

        try {
            this._analizando = true;
            await this._actualizarContextoUsuario();
            
            if (this._contextoUsuario.racha >= 3) {
                const ultimaFelicitacion = this._historialIntervenciones
                    .filter(i => i.reglaId === 'racha_estudio')
                    .pop();
                
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
            
        } catch (error) {
            console.warn('⚠️ Error en análisis de estado general:', error);
        } finally {
            this._analizando = false;
        }
    }

    // ============================================================
    // MÉTODOS AUXILIARES
    // ============================================================

    _getColorPrioridad(prioridad) {
        const colores = {
            'alta': '#FF7675',
            'media': '#FDCB6E',
            'baja': '#74B9FF'
        };
        return colores[prioridad] || '#6C5CE7';
    }

    _getIconoPrioridad(prioridad) {
        const iconos = {
            'alta': '🔴',
            'media': '🟡',
            'baja': '🔵'
        };
        return iconos[prioridad] || '🧠';
    }

    // ============================================================
    // MÉTODOS PÚBLICOS
    // ============================================================

    getEstadoTutor() {
        const infoModo = this.getModoInfo();
        const learningPathProgreso = window.LearningPath ? window.LearningPath.getProgreso() : null;
        
        return {
            nombre: this._nombre,
            icono: this._icono,
            modo: this._modoActual,
            modoInfo: infoModo,
            configuracion: this._configuracion,
            contexto: this._contextoUsuario,
            mapaAprendizaje: {
                rutaActual: this._mapaAprendizaje.rutaActual.map(t => t.nombre || t.titulo || 'Tema'),
                progresoGeneral: this._mapaAprendizaje.progresoGeneral || 0,
                temasCompletados: this._contextoUsuario.temasCompletados?.length || 0,
                temasEnProgreso: this._contextoUsuario.temasEnProgreso?.length || 0,
                temasPendientes: this._contextoUsuario.temasPendientes?.length || 0
            },
            learningPath: learningPathProgreso ? {
                completados: learningPathProgreso.completados,
                total: learningPathProgreso.total,
                porcentaje: learningPathProgreso.porcentaje
            } : null,
            intervencionesPendientes: this._intervencionesPendientes.length,
            intervencionesTotales: this._historialIntervenciones.length,
            contadorSesion: this._contadorIntervencionesSesion,
            sesionActiva: this._sesionActiva,
            navegacionBloqueada: this._navegacionBloqueada,
            enLinea: this.enLinea,
            modelo: this.modelo,
            modoGuiadoActivo: this._modoActual === this._MODOS.GUIADO
        };
    }

    getIntervencionesHistorial(limit = 10) {
        return this._historialIntervenciones.slice(-limit).reverse();
    }

    getIntervencionesPendientes() {
        return this._intervencionesPendientes;
    }

    getRutaAprendizaje() {
        return this._mapaAprendizaje.rutaActual.map(t => ({
            id: t.id,
            nombre: t.nombre || t.titulo || 'Tema',
            nivel: t.nivel,
            completado: t.completado,
            porcentaje: t.porcentaje || 0,
            historias: t.historias || 0
        }));
    }

    getSiguienteTema() {
        return this._mapaAprendizaje.rutaActual.find(t => !t.completado) || null;
    }

    destroy() {
        if (this._healthCheckInterval) {
            clearInterval(this._healthCheckInterval);
            this._healthCheckInterval = null;
        }
        const panel = document.getElementById('tutorPanel');
        if (panel) panel.remove();
        this._restaurarNavegacion();
        console.log('🧠 Tutor Neuro destruido');
    }
}

// ============================================================
// INSTANCIA GLOBAL - INICIALIZACIÓN NO BLOQUEANTE
// ============================================================

window.tutorNeuro = new TutorNeuro();

// 🔥 INICIALIZACIÓN NO BLOQUEANTE - NUNCA ESPERA AL DASHBOARD
(function initTutorNeuroNoBloqueante() {
    console.log('🧠 Tutor Neuro: Inicialización en segundo plano (NO BLOQUEANTE)');
    
    // Función que intenta inicializar sin bloquear
    const intentarIniciar = async function() {
        try {
            // Esperar un poco para no competir con la carga inicial
            await new Promise(r => setTimeout(r, 2000));
            
            // Verificar si vigía está listo
            if (window.vigia && window.vigia._initDone) {
                console.log('🧠 Tutor Neuro: Vigía listo, iniciando en segundo plano...');
                await window.tutorNeuro.initTutor();
                console.log('✅ Tutor Neuro inicializado correctamente');
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
    
    // Ejecutar con reintentos, sin bloquear
    let intentos = 0;
    const maxIntentos = 5;
    
    const ejecutarReintento = async function() {
        if (intentos >= maxIntentos) {
            console.warn('⚠️ Tutor Neuro: Máximo de reintentos alcanzado, se ejecutará en segundo plano sin esperar');
            // Último intento en segundo plano
            setTimeout(() => {
                window.tutorNeuro.initTutor().catch(() => {});
            }, 5000);
            return;
        }
        
        intentos++;
        const exito = await intentarIniciar();
        
        if (!exito && intentos < maxIntentos) {
            // Reintentar después de un delay
            setTimeout(ejecutarReintento, 3000);
        } else if (!exito) {
            // Fallback: ejecutar sin esperar
            console.log('🧠 Tutor Neuro: Ejecutando initTutor en segundo plano (sin await)');
            window.tutorNeuro.initTutor().catch(() => {});
        }
    };
    
    // Iniciar el proceso (no bloqueante) - esperar 1s para que el dashboard cargue primero
    setTimeout(ejecutarReintento, 1000);
})();

console.log('✅ Tutor de Aprendizaje NeuroAdaptativo v4.3 - INICIALIZACIÓN NO BLOQUEANTE');
console.log('  🚀 El Tutor se inicializa en segundo plano sin afectar el Dashboard');
console.log('  🔥 La inicialización NO bloquea el renderizado');
console.log('  🔥 Modo Guiado: Intervenciones correctamente formadas');
console.log('  🎯 Dashboard visible inmediatamente');