// ============================================================
// LEARNING PATH V3.0.1 - MAESTRÍA ABSOLUTA CON DOBLE HERENCIA
// INTERFAZ SUPER FASHION, POTENTE Y COMPLETA
// HEREDADO DE VIGIA + CENTINELA PARA PODER DE GUÍA TOTAL
// CORREGIDO: FALLO DE SEGURIDAD EN CENTINELA (ANTI-BUCLE Y TYPESAFE)
// ============================================================

class LearningPath {
    constructor() {
        this._nombre = '🧭 Learning Path NeuroAdaptativo';
        this._icono = '🧭';
        this._initDone = false;
        this._core = null;
        this._rutaActual = null;
        this._pasoActual = 0;
        this._progreso = { total: 0, completados: 0, porcentaje: 0 };
        this._eventosRegistrados = false;
        
        // ============================================================
        // VARIABLES PARA PAGINACIÓN Y BÚSQUEDA EN RUTA
        // ============================================================
        this._pasosPorPagina = 5;
        this._paginaActual = 1;
        this._rutaFiltrada = [];
        this._busquedaRuta = '';
        this._modalAbierto = false;
        this._ultimaGeneracion = 0;
        this._cacheValidez = 3600000;
        this._cargando = false;
        
        // ============================================================
        // HISTORIAL Y MÉTRICAS
        // ============================================================
        this._historialPasos = [];
        this._pasosEnEjecucion = {};
        this._metricasRuta = {
            totalCompletados: 0,
            totalFallos: 0,
            tiempoPromedio: 0,
            eficiencia: 0,
            pasosFallidos: [],
            pasosCompletados: []
        };
        
        // ============================================================
        // ICONOS Y COLORES POR TIPO DE PASO
        // ============================================================
        this._ICONOS_PASO = {
            'estudio_gramatica': '📚',
            'estudio_tema': '📖',
            'estudio_familia': '🧠',
            'repaso': '🔄',
            'desafio': '🏆',
            'examen': '📝',
            'sincronizar_caracteres': '🀄',
            'estudiar_frases': '📖',
            'practicar_escritura': '✍️',
            'escucha': '🔊',
            'modo_inverso': '🔄',
            'biblioteca': '📚',
            'elipse': '🌌',
            'ondas_cruzadas': '🌊',
            'tonos': '🎵',
            'caracteres': '🀄'
        };
        
        this._COLORES_PASO = {
            'estudio_gramatica': '#6C5CE7',
            'estudio_tema': '#0984E3',
            'estudio_familia': '#00B894',
            'repaso': '#FDCB6E',
            'desafio': '#E17055',
            'examen': '#00CEC9',
            'sincronizar_caracteres': '#6C5CE7',
            'estudiar_frases': '#A29BFE',
            'practicar_escritura': '#FD79A8',
            'escucha': '#74B9FF',
            'modo_inverso': '#6C5CE7',
            'biblioteca': '#E17055',
            'elipse': '#00CEC9',
            'ondas_cruzadas': '#00B894',
            'tonos': '#FDCB6E',
            'caracteres': '#6C5CE7'
        };
        
        // ============================================================
        // TEMAS POR NIVEL
        // ============================================================
        this._TEMAS_POR_NIVEL = {
            'A1': ['Mi familia', 'La casa', 'Comida y bebida', 'Mi rutina', 'La ciudad', 'Los colores', 'Los animales', 'La ropa', 'El tiempo'],
            'A2': ['Viajes', 'Compras', 'Salud', 'Deportes', 'Trabajo', 'Música', 'La naturaleza', 'La tecnología básica'],
            'B1': ['Relaciones personales', 'Educación', 'Medios de comunicación', 'Turismo', 'Tecnología', 'Arte', 'Historia', 'Gastronomía'],
            'B2': ['Política', 'Economía', 'Ciencia', 'Filosofía', 'Globalización', 'Literatura', 'Psicología', 'Sostenibilidad'],
            'C1': ['Crítica cultural', 'Retórica', 'Antropología', 'Investigación', 'Análisis del discurso', 'Argumentación avanzada'],
            'C2': ['Especialización académica', 'Debate avanzado', 'Creación literaria', 'Análisis crítico avanzado', 'Oratoria']
        };
        
        // ============================================================
        // NIVELES DE APRENDIZAJE
        // ============================================================
        this._NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        
        // ============================================================
        // REFERENCIA A CENTINELA (DOBLE HERENCIA)
        // ============================================================
        this._centinela = window.centinela || null;
        if (this._centinela) {
            console.log('🔗 LearningPath: Vinculado con Centinela para neuro-monitoreo');
        }
        
        console.log('🧭 Learning Path v3.0.1: Constructor ejecutado (MAESTRÍA ABSOLUTA - DOBLE HERENCIA)');
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init(core) {
        if (this._initDone) return this;
        
        this._core = core || window.uiCore;
        
        // Vincular con Centinela si está disponible
        if (window.centinela && !this._centinela) {
            this._centinela = window.centinela;
            console.log('🔗 LearningPath: Vinculado con Centinela');
        }
        
        // Cargar ruta guardada
        await this._cargarRutaGuardada();
        await this._cargarHistorial();
        
        // Registrar eventos
        if (!this._eventosRegistrados) {
            this._registrarEventos();
            this._eventosRegistrados = true;
        }
        
        this._initDone = true;
        console.log('🧭 Learning Path v3.0.1: Inicializado correctamente (MAESTRÍA ABSOLUTA - DOBLE HERENCIA)');
        console.log(`   📊 ${this._rutaActual ? this._rutaActual.length : 0} pasos en ruta`);
        console.log(`   🧠 Neuro-monitoreo: ${this._centinela ? '✅ ACTIVO' : '❌ NO DISPONIBLE'}`);
        
        // Renderizar en dashboard
        setTimeout(() => this._renderizarEnDashboard(), 500);
        
        return this;
    }

    // ============================================================
    // REGISTRAR EVENTOS
    // ============================================================

    _registrarEventos() {
        console.log('🔗 LearningPath: Registrando eventos...');
        
        window.addEventListener('respuestaEstudio', (e) => {
            this._onRespuestaEstudio(e.detail);
        });
        
        window.addEventListener('cambioFase', (e) => {
            this._onCambioFase(e.detail);
        });
        
        window.addEventListener('temaCompletado', () => {
            this._verificarCompletadoPaso();
        });
        
        window.addEventListener('elipseOndaCompletada', () => {
            this._verificarCompletadoPaso();
        });
        
        window.addEventListener('bibliotecaHistoriaLeida', () => {
            this._verificarCompletadoPaso();
        });
        
        // Eventos de Tutor Neuro
        window.addEventListener('tutorModoCambiado', (e) => {
            this._renderizarEnDashboard();
        });
        
        window.addEventListener('tutorNeuroInicializado', () => {
            this._renderizarEnDashboard();
        });
        
        console.log('✅ LearningPath: Eventos registrados');
    }

    // ============================================================
    // RESPUESTA A EVENTOS
    // ============================================================

    _onRespuestaEstudio(detalle) {
        if (!detalle) return;
        
        const paso = this.getPasoActual();
        if (!paso || paso.completado) return;
        
        const key = `paso_${this._pasoActual}`;
        if (!this._pasosEnEjecucion[key]) {
            this._pasosEnEjecucion[key] = {
                totalRespuestas: 0,
                correctas: 0,
                frasesCompletadas: 0,
                totalFrases: 0,
                inicio: Date.now()
            };
        }
        
        this._pasosEnEjecucion[key].totalRespuestas++;
        if (detalle.tipo === 'correcto' || detalle.tipo === 'parcial') {
            this._pasosEnEjecucion[key].correctas++;
        }
        
        // Actualizar progreso del paso
        this._actualizarProgresoPaso();
    }

    _onCambioFase(detalle) {
        if (detalle && detalle.fase !== undefined) {
            this._actualizarProgresoPaso();
        }
    }

    // ============================================================
    // ACTUALIZAR PROGRESO DEL PASO
    // ============================================================

    async _actualizarProgresoPaso() {
        const paso = this.getPasoActual();
        if (!paso || paso.completado) return;
        
        const key = `paso_${this._pasoActual}`;
        const estado = this._pasosEnEjecucion[key];
        if (!estado) return;
        
        let porcentajeCompletado = 0;
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        
        try {
            // Obtener frases del pipeline
            const frases = pipeline?.frases || [];
            const totalFrases = frases.length;
            
            if (totalFrases > 0) {
                const completadas = frases.filter(f => {
                    const progreso = f.progreso || {};
                    return progreso.estado === 'completada' || (progreso.rcn || 0) >= 4;
                }).length;
                
                porcentajeCompletado = Math.round((completadas / totalFrases) * 100);
                estado.frasesCompletadas = completadas;
                estado.totalFrases = totalFrases;
            }
        } catch (e) {
            console.warn('⚠️ Error calculando progreso:', e);
        }
        
        paso.porcentaje = porcentajeCompletado;
        this._guardarRuta(this._rutaActual, this._pasoActual);
        
        // Emitir evento de actualización
        window.dispatchEvent(new CustomEvent('learningPathProgresoActualizado', {
            detail: {
                paso: paso,
                porcentaje: porcentajeCompletado,
                indice: this._pasoActual
            }
        }));
        
        // Verificar si el paso está completado (100%)
        if (porcentajeCompletado >= 100 && estado.totalFrases > 0) {
            const todasRespondidas = estado.totalRespuestas >= estado.totalFrases;
            if (todasRespondidas || estado.totalFrases === 0) {
                console.log(`✅ Paso "${paso.titulo}" completado al 100%`);
                this.marcarPasoCompletado();
            }
        }
        
        // Actualizar UI en tiempo real
        this._renderizarEnDashboard();
    }

    // ============================================================
    // MARCAR PASO COMO COMPLETADO
    // ============================================================

    marcarPasoCompletado() {
        if (!this._rutaActual || this._rutaActual.length === 0) return false;
        if (this._pasoActual >= this._rutaActual.length) return false;

        const paso = this._rutaActual[this._pasoActual];
        
        if (paso.completado) {
            console.log(`ℹ️ Paso "${paso.titulo}" ya está completado`);
            return false;
        }
        
        // Verificar que esté al 100%
        if (paso.porcentaje < 100) {
            console.log(`⏳ Paso "${paso.titulo}" al ${paso.porcentaje}%, esperando 100%`);
            return false;
        }
        
        // Verificar frases completadas
        const frases = pipeline?.frases || [];
        if (frases.length > 0) {
            const completadas = frases.filter(f => {
                const progreso = f.progreso || {};
                return progreso.estado === 'completada' || (progreso.rcn || 0) >= 4;
            }).length;
            
            if (completadas < frases.length) {
                console.log(`⏳ Paso "${paso.titulo}": ${completadas}/${frases.length} frases completadas`);
                return false;
            }
        }

        // Marcar como completado
        paso.completado = true;
        paso.fechaCompletado = Date.now();
        paso.porcentaje = 100;
        paso.tiempoTotal = this._pasosEnEjecucion[`paso_${this._pasoActual}`]?.tiempo || 0;

        // Actualizar métricas
        this._metricasRuta.totalCompletados++;
        this._metricasRuta.pasosCompletados.push({
            titulo: paso.titulo,
            tiempo: paso.tiempoTotal,
            fecha: paso.fechaCompletado
        });
        
        this._pasoActual++;

        this._guardarRuta(this._rutaActual, this._pasoActual);
        
        const key = `paso_${this._pasoActual - 1}`;
        delete this._pasosEnEjecucion[key];

        console.log(`✅ Paso "${paso.titulo}" COMPLETADO al 100%`);

        // Notificaciones
        if (this._core) {
            if (this._pasoActual >= this._rutaActual.length) {
                this._core.mostrarToast('🎉 ¡Ruta completada! Has terminado todos los pasos.', 'success');
                window.dispatchEvent(new CustomEvent('learningPathCompletado', {
                    detail: { ruta: this._rutaActual, progreso: this._progreso }
                }));
                // Sugerir regenerar automáticamente
                setTimeout(() => this.regenerarRuta(), 3000);
            } else {
                const siguiente = this._rutaActual[this._pasoActual];
                this._core.mostrarToast(`✅ "${paso.titulo}" completado! Siguiente: "${siguiente.titulo}"`, 'success');
            }
        }

        // Emitir evento
        window.dispatchEvent(new CustomEvent('learningPathPasoCompletado', {
            detail: { paso: paso, indice: this._pasoActual - 1, progreso: this._progreso }
        }));

        // Actualizar UI
        this._renderizarEnDashboard();
        this._actualizarBadgeTutor();

        return true;
    }

    // ============================================================
    // VERIFICAR COMPLETADO (LLAMADO DESDE EXTERNO)
    // ============================================================

    async _verificarCompletadoPaso() {
        await this._actualizarProgresoPaso();
    }

    // ============================================================
    // CARGA DE DATOS PERSISTIDOS
    // ============================================================

    async _cargarRutaGuardada() {
        try {
            const data = localStorage.getItem('pipeline_learning_path');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed && parsed.ruta && parsed.fecha) {
                    const edad = Date.now() - parsed.fecha;
                    if (edad < this._cacheValidez) {
                        this._rutaActual = parsed.ruta;
                        this._pasoActual = parsed.pasoActual || 0;
                        this._ultimaGeneracion = parsed.fecha;
                        this._calcularProgreso();
                        console.log('🧭 Ruta cargada desde caché');
                        return;
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ Error cargando ruta:', e);
        }
        this._rutaActual = null;
        this._pasoActual = 0;
        this._progreso = { total: 0, completados: 0, porcentaje: 0 };
    }

    async _cargarHistorial() {
        try {
            const data = localStorage.getItem('pipeline_learning_path_historial');
            if (data) {
                this._historialPasos = JSON.parse(data);
                if (this._historialPasos.length > 0) {
                    // Calcular métricas del historial
                    const completados = this._historialPasos.filter(p => p.completado);
                    if (completados.length > 0) {
                        const totalTiempo = completados.reduce((acc, p) => acc + (p.tiempo || 0), 0);
                        this._metricasRuta.tiempoPromedio = Math.round(totalTiempo / completados.length);
                        this._metricasRuta.eficiencia = Math.min(100, 
                            (completados.length / this._historialPasos.length) * 100
                        );
                    }
                    console.log(`📊 Historial cargado: ${this._historialPasos.length} pasos`);
                }
            }
        } catch (e) {
            console.warn('⚠️ Error cargando historial:', e);
            this._historialPasos = [];
        }
    }

    // ============================================================
    // GUARDAR DATOS
    // ============================================================

    _guardarRuta(ruta, pasoActual = 0) {
        try {
            localStorage.setItem('pipeline_learning_path', JSON.stringify({
                ruta: ruta,
                pasoActual: pasoActual,
                fecha: Date.now()
            }));
            this._rutaActual = ruta;
            this._pasoActual = pasoActual;
            this._ultimaGeneracion = Date.now();
            this._calcularProgreso();
        } catch (e) {
            console.warn('⚠️ Error guardando ruta:', e);
        }
    }

    _guardarHistorial() {
        try {
            localStorage.setItem('pipeline_learning_path_historial', JSON.stringify(this._historialPasos.slice(-50)));
        } catch (e) {
            console.warn('⚠️ Error guardando historial:', e);
        }
    }

    // ============================================================
    // CALCULAR PROGRESO
    // ============================================================

    _calcularProgreso() {
        if (!this._rutaActual || this._rutaActual.length === 0) {
            this._progreso = { total: 0, completados: 0, porcentaje: 0 };
            return;
        }
        
        const total = this._rutaActual.length;
        const completados = this._rutaActual.filter(p => p.completado === true).length;
        const porcentaje = Math.round((completados / total) * 100);
        
        this._progreso = { total, completados, porcentaje };
    }

    // ============================================================
    // GENERAR RUTA NEUROADAPTATIVA CON IA
    // ============================================================

    async generarRuta(forzar = false) {
        if (this._cargando) {
            console.log('⏳ Generación en curso...');
            if (this._cargaPromise) {
                await this._cargaPromise;
            }
            return this._rutaActual;
        }

        if (!forzar && this._rutaActual && this._rutaActual.length > 0) {
            const edad = Date.now() - this._ultimaGeneracion;
            if (edad < this._cacheValidez) {
                console.log('📌 Usando ruta existente');
                this._renderizarEnDashboard();
                return this._rutaActual;
            }
        }

        this._cargando = true;
        this._cargaPromise = this._ejecutarGeneracionRuta(forzar);
        
        try {
            const resultado = await this._cargaPromise;
            return resultado;
        } finally {
            this._cargando = false;
            this._cargaPromise = null;
        }
    }

    async _ejecutarGeneracionRuta(forzar = false) {
        this._core?.mostrarToast('🧠 Generando tu ruta de aprendizaje personalizada...', 'info');

        try {
            const usuario = await db.getUsuario();
            const stats = await db.obtenerEstadisticasNeuro();
            const progreso = await db.obtenerTodoProgreso();
            const frases = await db.obtenerFrases();
            const temas = await db.obtenerTemas();
            
            const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
            const nivel = gestorIdiomas?.getInfoActivo()?.nivel || 'A1';
            const esJeroglifico = this._esJeroglifico(idioma);
            const esTonal = this._esTonal(idioma);
            const nombreIdioma = this._getNombreIdioma(idioma);

            const rcnPromedio = stats.rcnPromedio || 0;
            const eficiencia = stats.eficiencia || 0;
            const completadas = stats.progreso || 0;
            const totalFrases = stats.totalFrases || 0;
            const temasNombres = temas.map(t => t.nombre);
            
            const modoInversoActivo = modoInverso?.isActivo?.() || false;

            // 🔥 PATCH ANTI-CENTINELA: Bloque seguro con múltiples fallbacks
            let fatiga = 0;
            if (this._centinela) {
                try {
                    // Verificar si es función antes de llamarla
                    if (typeof this._centinela.getEstado === 'function') {
                        const estadoCentinela = this._centinela.getEstado();
                        fatiga = estadoCentinela?.neuroFatiga || 0;
                    } 
                    // Fallback si el método se llama getStatus
                    else if (typeof this._centinela.getStatus === 'function') {
                        const estadoCentinela = this._centinela.getStatus();
                        fatiga = estadoCentinela?.neuroFatiga || 0;
                    } 
                    // Fallback si es una propiedad directa
                    else if (this._centinela.neuroFatiga !== undefined) {
                        fatiga = this._centinela.neuroFatiga || 0;
                    }
                } catch (e) {
                    // Nunca romper la generación por un error del Centinela
                    console.warn('⚠️ Error obteniendo fatiga de Centinela (ignorado):', e);
                }
            }

            // Obtener palabras con RCN bajo
            const palabrasBajoRCN = [];
            const progresoMap = {};
            for (const p of progreso) {
                progresoMap[p.fraseId] = p;
            }
            for (const f of frases) {
                const prog = progresoMap[f.id];
                if (prog && prog.rcn < 2) {
                    palabrasBajoRCN.push(f.original);
                }
            }

            // Preparar prompt para IA
            const prompt = this._generarPromptIA({
                nombreIdioma, idioma, nivel, esJeroglifico, esTonal,
                rcnPromedio, eficiencia, completadas, totalFrases,
                temasNombres, palabrasBajoRCN, modoInversoActivo, fatiga
            });

            let resultado = null;
            let metodo = 'offline';

            // Intentar con Vigía (IA online)
            if (vigia && vigia.enLinea && vigia._apiKeyValidada) {
                try {
                    resultado = await vigia._consultarGroq(prompt, 'json');
                    metodo = 'online';
                } catch (e) {
                    console.warn('⚠️ Error consultando a Vigía:', e);
                }
            }

            // Fallback offline
            if (!resultado || !resultado.pasos || resultado.pasos.length === 0) {
                resultado = this._generarRutaOffline({
                    nivel, idioma, esJeroglifico, esTonal,
                    temasNombres, palabrasBajoRCN, completadas,
                    totalFrases, fatiga, rcnPromedio, eficiencia
                });
                metodo = 'offline';
            }

            // Procesar resultado
            if (resultado && resultado.pasos && resultado.pasos.length > 0) {
                // Limitar a máximo 10 pasos
                if (resultado.pasos.length > 10) {
                    resultado.pasos = resultado.pasos.slice(0, 10);
                }

                // Enriquecer pasos
                for (const paso of resultado.pasos) {
                    paso.icono = this._ICONOS_PASO[paso.tipo] || '📌';
                    paso.color = this._COLORES_PASO[paso.tipo] || '#6C5CE7';
                    paso.completado = false;
                    paso.porcentaje = 0;
                    paso.metodo = metodo;
                    paso.timestamp = Date.now();
                    paso.nivel = paso.nivel || nivel;
                    paso.tiempoTotal = 0;
                    if (!paso.parametros) paso.parametros = {};
                    if (!paso.modulo) paso.modulo = 'study';
                    
                    // Asegurar título
                    if (!paso.titulo && paso.nombre) paso.titulo = paso.nombre;
                    if (!paso.titulo && paso.tema) paso.titulo = paso.tema;
                    if (!paso.titulo) paso.titulo = `Paso ${this._rutaActual ? this._rutaActual.length + 1 : 1}`;
                }

                // Guardar ruta
                this._guardarRuta(resultado.pasos, 0);
                this._core?.mostrarToast('✅ Ruta de aprendizaje generada', 'success');
                console.log(`🧭 Ruta generada (${resultado.pasos.length} pasos) - ${metodo}`);
                
                window.dispatchEvent(new CustomEvent('learningPathGenerado', {
                    detail: { ruta: resultado.pasos, metodo: metodo, progreso: this._progreso }
                }));

                this._renderizarEnDashboard();
                return resultado.pasos;
            }

            this._core?.mostrarToast('⚠️ No se pudo generar una ruta', 'warning');
            return null;

        } catch (error) {
            console.error('❌ Error generando ruta:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
            return null;
        }
    }

    // ============================================================
    // GENERAR PROMPT PARA IA
    // ============================================================

    _generarPromptIA(data) {
        const {
            nombreIdioma, idioma, nivel, esJeroglifico, esTonal,
            rcnPromedio, eficiencia, completadas, totalFrases,
            temasNombres, palabrasBajoRCN, modoInversoActivo, fatiga
        } = data;

        return `
Eres el "Planificador de Aprendizaje NeuroAdaptativo" de Pipeline Neuro.

**DATOS DEL USUARIO:**
- Idioma: ${nombreIdioma} (${idioma})
- Nivel actual: ${nivel} (MUY IMPORTANTE: SOLO GENERA TEMAS DE ESTE NIVEL)
- RCN Promedio: ${rcnPromedio.toFixed(1)}/5
- Eficiencia: ${eficiencia}%
- Frases completadas: ${completadas}/${totalFrases}
- Temas: ${temasNombres.join(', ') || 'Ninguno'}
- Palabras con RCN bajo: ${palabrasBajoRCN.length}
- Modo Inverso: ${modoInversoActivo ? 'Activo' : 'Inactivo'}
- Fatiga cognitiva: ${Math.round(fatiga * 100)}%
${esJeroglifico ? '- Idioma jeroglífico: Sí' : '- Idioma jeroglífico: No'}
${esTonal ? '- Idioma tonal: Sí' : '- Idioma tonal: No'}

**REGLAS IMPORTANTES:**
1. SOLO genera temas del nivel ${nivel} o inferior.
2. NUNCA generes temas de niveles superiores.
3. Usa los temas existentes del usuario si los hay.
4. Si no hay temas, usa temas básicos del nivel ${nivel}.
5. Si el idioma es tonal, incluye pasos de práctica de tonos.
6. Si el idioma es jeroglífico, incluye pasos de caracteres.
7. Si hay palabras con RCN bajo, incluye pasos de repaso.
8. Si la fatiga es alta (>60%), incluye pasos de escucha.

**GENERA 3-8 PASOS PARA ESTE USUARIO.**

Cada paso debe tener:
- "tipo": uno de: estudio_tema, repaso, estudiar_frases, practicar_escritura, escucha, modo_inverso, desafio, examen, biblioteca, elipse, ondas_cruzadas, tonos, caracteres
- "titulo": Título corto (máx 40 caracteres)
- "descripcion": Descripción clara (máx 80 caracteres)
- "modulo": "study" (por defecto)
- "accion": una de las acciones disponibles
- "parametros": datos adicionales (opcional)
- "nivel": "${nivel}" (SIEMPRE usa este nivel)

**RESPONDE SOLO EN FORMATO JSON VÁLIDO.**
`;
    }

    // ============================================================
    // GENERAR RUTA OFFLINE
    // ============================================================

    _generarRutaOffline(data) {
        const {
            nivel, idioma, esJeroglifico, esTonal,
            temasNombres, palabrasBajoRCN, completadas,
            totalFrases, fatiga, rcnPromedio, eficiencia
        } = data;

        const pasos = [];
        const nivelIdx = this._NIVELES.indexOf(nivel);
        const siguienteNivel = nivelIdx < this._NIVELES.length - 1 ? this._NIVELES[nivelIdx + 1] : null;
        
        let temasDisponibles = temasNombres;
        if (!temasDisponibles || temasDisponibles.length === 0) {
            const temasPorNivel = this._TEMAS_POR_NIVEL[nivel] || this._TEMAS_POR_NIVEL['A1'];
            const temaAleatorio = temasPorNivel[Math.floor(Math.random() * temasPorNivel.length)];
            temasDisponibles = [temaAleatorio];
            console.log(`📌 Usando tema del nivel ${nivel}: "${temaAleatorio}"`);
        }

        // 1. Repaso de palabras con RCN bajo
        if (palabrasBajoRCN.length > 0) {
            const cantidad = Math.min(palabrasBajoRCN.length, 5);
            pasos.push({
                tipo: 'repaso',
                titulo: 'Repaso de Palabras',
                descripcion: `Repasa ${cantidad} palabras con RCN bajo para consolidarlas.`,
                modulo: 'study',
                accion: 'repasar_rcn_bajo',
                parametros: { cantidad: cantidad },
                nivel: nivel
            });
        }

        // 2. Estudiar tema
        if (temasDisponibles.length > 0) {
            const temaAleatorio = temasDisponibles[Math.floor(Math.random() * temasDisponibles.length)];
            pasos.push({
                tipo: 'estudio_tema',
                titulo: `Estudiar "${temaAleatorio}"`,
                descripcion: `Aprende vocabulario y frases sobre "${temaAleatorio}".`,
                modulo: 'study',
                accion: 'estudiar_tema_por_nombre',
                parametros: { temaNombre: temaAleatorio },
                nivel: nivel
            });
        }

        // 3. Práctica de frases
        if (totalFrases > 0) {
            const cantidad = Math.min(10, Math.max(5, totalFrases));
            pasos.push({
                tipo: 'estudiar_frases',
                titulo: 'Práctica de Frases',
                descripcion: `Practica ${cantidad} frases de nivel ${nivel}.`,
                modulo: 'study',
                accion: 'practicar_frases',
                parametros: { cantidad: cantidad },
                nivel: nivel
            });
        }

        // 4. Escucha (si fatiga > 60% o para variar)
        if (fatiga > 0.6 && totalFrases > 5) {
            pasos.push({
                tipo: 'escucha',
                titulo: 'Escucha de Frases',
                descripcion: `Practica comprensión auditiva con frases de nivel ${nivel}.`,
                modulo: 'study',
                accion: 'escucha',
                parametros: { cantidad: 5 },
                nivel: nivel
            });
        }

        // 5. Práctica de escritura (si es jeroglífico)
        if (esJeroglifico && palabrasBajoRCN.length > 0) {
            pasos.push({
                tipo: 'practicar_escritura',
                titulo: 'Práctica de Escritura',
                descripcion: `Practica la escritura de caracteres con RCN bajo.`,
                modulo: 'study',
                accion: 'practicar_escritura',
                parametros: { cantidad: Math.min(palabrasBajoRCN.length, 3) },
                nivel: nivel
            });
        }

        // 6. Práctica de tonos (si es tonal)
        if (esTonal && totalFrases > 3) {
            pasos.push({
                tipo: 'tonos',
                titulo: 'Práctica de Tonos',
                descripcion: `Practica los tonos del ${this._getNombreIdioma(idioma)} con frases.`,
                modulo: 'study',
                accion: 'practicar_tonos',
                parametros: { cantidad: 5 },
                nivel: nivel
            });
        }

        // 7. Modo Inverso (si el usuario lo tiene activo o para desafío)
        if (modoInverso?.isActivo?.() || (completadas > 10 && rcnPromedio > 3)) {
            pasos.push({
                tipo: 'modo_inverso',
                titulo: 'Modo Inverso',
                descripcion: 'Desafía tu memoria con el Modo Inverso.',
                modulo: 'study',
                accion: 'activar_modo_inverso',
                parametros: {},
                nivel: nivel
            });
        }

        // 8. Examen de nivel (si tiene suficiente progreso)
        if (completadas >= 15 && totalFrases >= 20 && siguienteNivel) {
            pasos.push({
                tipo: 'examen',
                titulo: `Preparación para ${siguienteNivel}`,
                descripcion: `Practica para preparar el examen de ${siguienteNivel}.`,
                modulo: 'study',
                accion: 'practicar_frases',
                parametros: { cantidad: 10, nivel: siguienteNivel },
                nivel: nivel
            });
        }

        // 9. Biblioteca (siempre tener al menos un paso de lectura)
        if (pasos.length < 4) {
            pasos.push({
                tipo: 'biblioteca',
                titulo: 'Lectura en Biblioteca',
                descripcion: 'Lee una historia en la Biblioteca para mejorar comprensión.',
                modulo: 'biblioteca',
                accion: 'ir_a_biblioteca',
                parametros: {},
                nivel: nivel
            });
        }

        // Limitar a máximo 8 pasos
        return { pasos: pasos.slice(0, 8) };
    }

    // ============================================================
    // MÉTODOS DE CONSULTA
    // ============================================================

    getPasoActual() {
        if (!this._rutaActual || this._rutaActual.length === 0) return null;
        if (this._pasoActual >= this._rutaActual.length) return null;
        const paso = this._rutaActual[this._pasoActual];
        if (!paso.titulo && paso.nombre) paso.titulo = paso.nombre;
        if (!paso.titulo && paso.tema) paso.titulo = paso.tema;
        if (!paso.titulo) paso.titulo = `Paso ${this._pasoActual + 1}`;
        return paso;
    }

    getPasosConEstado() {
        if (!this._rutaActual || this._rutaActual.length === 0) return [];
        
        return this._rutaActual.map((paso, i) => {
            if (!paso.titulo && paso.nombre) paso.titulo = paso.nombre;
            if (!paso.titulo && paso.tema) paso.titulo = paso.tema;
            if (!paso.titulo) paso.titulo = `Paso ${i + 1}`;
            return {
                ...paso,
                indice: i,
                esCompletado: paso.completado === true,
                esActivo: i === this._pasoActual && !paso.completado,
                esPendiente: i > this._pasoActual || (i === this._pasoActual && !paso.completado),
                porcentaje: paso.porcentaje || 0
            };
        });
    }

    getRutaCompleta() {
        return this._rutaActual || [];
    }

    getProgreso() {
        return this._progreso;
    }

    getMetricas() {
        return this._metricasRuta;
    }

    getHistorial() {
        return this._historialPasos;
    }

    // ============================================================
    // EJECUTAR PASO ACTUAL
    // ============================================================

    async ejecutarPasoActual() {
        const paso = this.getPasoActual();
        if (!paso) {
            this._core?.mostrarToast('ℹ️ No hay paso activo. Genera una ruta primero.', 'info');
            return;
        }

        if (paso.completado) {
            this._core?.mostrarToast(`✅ "${paso.titulo}" ya está completado. Avanzando...`, 'info');
            this._pasoActual++;
            this._guardarRuta(this._rutaActual, this._pasoActual);
            this._renderizarEnDashboard();
            return;
        }

        console.log(`🧭 Ejecutando: "${paso.titulo}" - Acción: ${paso.accion}`);
        
        const key = `paso_${this._pasoActual}`;
        this._pasosEnEjecucion[key] = {
            totalRespuestas: 0,
            correctas: 0,
            frasesCompletadas: 0,
            totalFrases: 0,
            inicio: Date.now()
        };

        try {
            await this._ejecutarAccionPaso(paso);
        } catch (error) {
            console.error('❌ Error ejecutando paso:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _ejecutarAccionPaso(paso) {
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const core = this._core;

        switch (paso.accion) {
            case 'estudiar_tema_por_nombre':
                if (paso.parametros?.temaNombre) {
                    const temas = await db.obtenerTemas();
                    const temaEncontrado = temas.find(t => 
                        t.nombre?.toLowerCase().includes(paso.parametros.temaNombre.toLowerCase())
                    );
                    if (temaEncontrado) {
                        if (window.pipeline) {
                            await window.pipeline.estudiarTema(temaEncontrado.id);
                        }
                        core?.irAModulo('study');
                        core?.mostrarToast(`📖 Estudiando "${temaEncontrado.nombre}"`, 'info');
                        return;
                    }
                }
                // Fallback: frases aleatorias
                const frases = await db.obtenerFrasesPorIdioma(idioma);
                if (frases.length > 0) {
                    if (window.pipeline) {
                        window.pipeline.frases = frases.sort(() => Math.random() - 0.5).slice(0, 10);
                        window.pipeline.indiceFrase = 0;
                        await window.pipeline.cargarFrase(0);
                    }
                    core?.irAModulo('study');
                    core?.mostrarToast('📖 Estudiando frases disponibles', 'info');
                    return;
                }
                core?.mostrarToast('❌ No hay contenido para estudiar.', 'error');
                this.marcarPasoCompletado();
                break;

            case 'repasar_rcn_bajo':
                const cantidad = paso.parametros?.cantidad || 5;
                const frasesRepaso = await db.obtenerFrasesPorIdioma(idioma);
                const progresos = await db.obtenerTodoProgreso();
                
                const frasesBajoRCN = [];
                for (const f of frasesRepaso) {
                    const prog = progresos.find(p => p.fraseId === f.id);
                    if (prog && prog.rcn < 2) {
                        frasesBajoRCN.push(f);
                    }
                }
                
                if (frasesBajoRCN.length === 0) {
                    core?.mostrarToast('✅ No hay palabras con RCN bajo. ¡Buen trabajo!', 'success');
                    paso.porcentaje = 100;
                    this.marcarPasoCompletado();
                    return;
                }
                
                const seleccionadas = frasesBajoRCN.sort(() => Math.random() - 0.5).slice(0, cantidad);
                if (window.pipeline) {
                    window.pipeline.frases = seleccionadas;
                    window.pipeline.indiceFrase = 0;
                    await window.pipeline.cargarFrase(0);
                }
                core?.irAModulo('study');
                core?.mostrarToast(`📖 Repasando ${seleccionadas.length} frases con RCN bajo`, 'info');
                break;

            case 'practicar_frases':
                const cant = paso.parametros?.cantidad || 10;
                let todasFrases = await db.obtenerFrasesPorIdioma(idioma);
                
                if (todasFrases.length === 0) {
                    core?.mostrarToast('❌ No hay frases. Genera contenido primero.', 'error');
                    this.marcarPasoCompletado();
                    return;
                }
                
                if (paso.parametros?.nivel) {
                    const filtradas = todasFrases.filter(f => (f.nivel || 'A1') === paso.parametros.nivel);
                    if (filtradas.length > 0) todasFrases = filtradas;
                }
                
                const frasesPractica = todasFrases.sort(() => Math.random() - 0.5).slice(0, Math.min(cant, todasFrases.length));
                if (window.pipeline) {
                    window.pipeline.frases = frasesPractica;
                    window.pipeline.indiceFrase = 0;
                    await window.pipeline.cargarFrase(0);
                }
                core?.irAModulo('study');
                core?.mostrarToast(`📖 Practicando ${frasesPractica.length} frases`, 'info');
                break;

            case 'practicar_escritura':
                const cantEscritura = paso.parametros?.cantidad || 3;
                const frasesEscritura = await db.obtenerFrasesPorIdioma(idioma);
                const progresosEscritura = await db.obtenerTodoProgreso();
                
                const frasesParaEscritura = [];
                for (const f of frasesEscritura) {
                    const prog = progresosEscritura.find(p => p.fraseId === f.id);
                    if (prog && prog.rcn < 3) {
                        frasesParaEscritura.push(f);
                    }
                }
                
                if (frasesParaEscritura.length === 0) {
                    core?.mostrarToast('✅ No hay frases para practicar escritura.', 'success');
                    this.marcarPasoCompletado();
                    return;
                }
                
                const seleccionadasEscritura = frasesParaEscritura.sort(() => Math.random() - 0.5).slice(0, cantEscritura);
                if (window.pipeline) {
                    window.pipeline.frases = seleccionadasEscritura;
                    window.pipeline.indiceFrase = 0;
                    await window.pipeline.cargarFrase(0);
                    if (window.UIStudy && window.UIStudy.cambiarModoEstudio) {
                        window.UIStudy.cambiarModoEstudio('escritura');
                    }
                }
                core?.irAModulo('study');
                core?.mostrarToast(`✍️ Practicando escritura con ${seleccionadasEscritura.length} frases`, 'info');
                break;

            case 'escucha':
                const cantEscucha = paso.parametros?.cantidad || 5;
                const frasesEscucha = await db.obtenerFrasesPorIdioma(idioma);
                
                if (frasesEscucha.length === 0) {
                    core?.mostrarToast('❌ No hay frases para escuchar.', 'error');
                    this.marcarPasoCompletado();
                    return;
                }
                
                const seleccionadasEscucha = frasesEscucha.sort(() => Math.random() - 0.5).slice(0, Math.min(cantEscucha, frasesEscucha.length));
                if (window.pipeline) {
                    window.pipeline.frases = seleccionadasEscucha;
                    window.pipeline.indiceFrase = 0;
                    await window.pipeline.cargarFrase(0);
                    if (window.UIStudy && window.UIStudy.cambiarModoEstudio) {
                        window.UIStudy.cambiarModoEstudio('escucha');
                    }
                }
                core?.irAModulo('study');
                core?.mostrarToast(`🔊 Escuchando ${seleccionadasEscucha.length} frases`, 'info');
                break;

            case 'activar_modo_inverso':
                if (modoInverso) {
                    modoInverso.toggle();
                    core?.mostrarToast('🔄 Modo Inverso activado', 'info');
                }
                this.marcarPasoCompletado();
                break;

            case 'ir_a_biblioteca':
                core?.irAModulo('biblioteca');
                core?.mostrarToast('📚 Abriendo Biblioteca de Lectura', 'info');
                // No marcar completado automáticamente, esperar a que el usuario lea
                break;

            case 'ir_a_elipse':
                core?.irAModulo('elipse');
                core?.mostrarToast('🌌 Abriendo Modo Elipse', 'info');
                break;

            case 'ir_a_ondas_cruzadas':
                core?.irAModulo('ondasCruzadas');
                core?.mostrarToast('🌊 Abriendo Ondas Cruzadas', 'info');
                break;

            case 'practicar_tonos':
                core?.irAModulo('tonos');
                core?.mostrarToast('🎵 Abriendo Estudio de Tonos', 'info');
                if (window.UITonos) {
                    setTimeout(() => window.UITonos.cargar(core), 300);
                }
                break;

            case 'examen':
                core?.mostrarToast('📝 Abriendo preparación para examen...', 'info');
                const nivelExamen = paso.parametros?.nivel || 'A1';
                if (window.UIConfig && window.UIConfig._iniciarExamenConfig) {
                    window.UIConfig._iniciarExamenConfig(nivelExamen);
                } else {
                    core?.mostrarToast('❌ Módulo de examen no disponible', 'error');
                    this.marcarPasoCompletado();
                }
                break;

            default:
                core?.mostrarToast(`📖 Ejecutando: ${paso.titulo}`, 'info');
                core?.irAModulo('study');
        }

        // Guardar en historial
        this._historialPasos.push({
            titulo: paso.titulo,
            tipo: paso.tipo,
            accion: paso.accion,
            timestamp: Date.now(),
            completado: false,
            tiempo: Date.now() - (this._pasosEnEjecucion[`paso_${this._pasoActual}`]?.inicio || 0)
        });
        this._guardarHistorial();
    }

    // ============================================================
    // NAVEGACIÓN ENTRE PASOS
    // ============================================================

    irAlPaso(indice) {
        if (!this._rutaActual || indice < 0 || indice >= this._rutaActual.length) {
            console.warn('⚠️ Paso no encontrado:', indice);
            return;
        }
        
        const paso = this._rutaActual[indice];
        const nombrePaso = paso.titulo || paso.nombre || paso.tema || `Paso ${indice + 1}`;
        console.log(`🧭 Navegando al paso ${indice}: "${nombrePaso}"`);
        
        this._pasoActual = indice;
        this._guardarRuta(this._rutaActual, this._pasoActual);
        
        window.dispatchEvent(new CustomEvent('learningPathPasoCambiado', {
            detail: { 
                indice: indice, 
                paso: paso,
                total: this._rutaActual.length
            }
        }));
        
        this._renderizarEnDashboard();
        this._core?.mostrarToast(`📌 Paso seleccionado: "${nombrePaso}"`, 'info');
    }

    // ============================================================
    // REGENERAR RUTA
    // ============================================================

    async regenerarRuta() {
        const confirmar = await this._core?.confirm(
            '🔄 ¿Regenerar tu ruta de aprendizaje?\n\nSe perderá el progreso actual.',
            'Regenerar Ruta'
        );
        if (!confirmar) return;
        
        this._rutaActual = null;
        this._pasoActual = 0;
        this._pasosEnEjecucion = {};
        localStorage.removeItem('pipeline_learning_path');
        await this.generarRuta(true);
    }

    // ============================================================
    // RENDERIZAR EN DASHBOARD - INTERFAZ SUPER FASHION V3.0
    // ============================================================

    _renderizarEnDashboard() {
        const container = document.getElementById('learningPathContainer');
        if (!container) {
            // El contenedor se creará en el dashboard
            this._crearContenedorEnDashboard();
            return;
        }
        
        const ruta = this._rutaActual || [];
        const pasoActual = this.getPasoActual();
        const progreso = this._progreso;
        
        if (ruta.length === 0) {
            container.innerHTML = this._renderizarVacio();
            return;
        }
        
        container.innerHTML = this._renderizarInterfazFashion(ruta, pasoActual, progreso);
        this._actualizarBadgeTutor();
    }

    _crearContenedorEnDashboard() {
        const dashboardGrid = document.getElementById('dashboardGrid');
        if (!dashboardGrid) return;
        
        let container = document.getElementById('learningPathContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'learningPathContainer';
            container.style.cssText = 'grid-column: 1 / -1; margin-bottom: 12px;';
            dashboardGrid.prepend(container);
            
            // Renderizar después de crear
            setTimeout(() => this._renderizarEnDashboard(), 100);
        }
    }

    _renderizarVacio() {
        return `
            <div style="
                background: linear-gradient(135deg, var(--primary)08, var(--secondary)08);
                border-radius: 14px;
                padding: 24px 20px;
                border: 2px dashed var(--primary)30;
                text-align: center;
                transition: all 0.3s ease;
            ">
                <div style="font-size: 48px; margin-bottom: 12px;">🧭</div>
                <h3 style="font-size: 18px; font-weight: 700; color: var(--dark); margin: 0 0 4px 0;">
                    Tu Ruta de Aprendizaje
                </h3>
                <p style="font-size: 14px; color: var(--gray); margin: 0 0 16px 0;">
                    Deja que la IA cree una ruta personalizada para ti.
                </p>
                <button class="btn-primary" onclick="window.learningPath.generarRuta(true)" 
                        style="padding: 10px 32px; font-size: 15px; background: linear-gradient(135deg, #6C5CE7, #A29BFE); color: white; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s;"
                        onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" 
                        onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                    <i class="fas fa-magic"></i> Generar mi Ruta
                </button>
            </div>
        `;
    }

    _renderizarInterfazFashion(ruta, pasoActual, progreso) {
        const total = ruta.length;
        const completados = progreso.completados || 0;
        const pct = progreso.porcentaje || 0;
        const nombrePasoActual = pasoActual ? (pasoActual.titulo || pasoActual.nombre || 'Paso actual') : '¡Ruta completada!';
        const descPasoActual = pasoActual ? (pasoActual.descripcion || '') : '';
        const pasoActualTipo = pasoActual ? (pasoActual.tipo || 'general') : '';
        const pasoActualColor = pasoActual ? (pasoActual.color || '#6C5CE7') : '#6C5CE7';
        
        // Aplicar filtro y paginación
        this._rutaFiltrada = this._aplicarFiltro(ruta);
        const totalPaginas = Math.max(1, Math.ceil(this._rutaFiltrada.length / this._pasosPorPagina));
        if (this._paginaActual > totalPaginas) this._paginaActual = totalPaginas;
        if (this._paginaActual < 1) this._paginaActual = 1;
        
        const inicio = (this._paginaActual - 1) * this._pasosPorPagina;
        const fin = Math.min(inicio + this._pasosPorPagina, this._rutaFiltrada.length);
        const pasosPagina = this._rutaFiltrada.slice(inicio, fin);
        
        // Obtener modo del tutor
        let modoInfo = '🧠 Flexible';
        let esGuiado = false;
        if (window.tutorNeuro) {
            const modo = window.tutorNeuro.getModo?.() || 'flexible';
            esGuiado = modo === 'guiado';
            const info = window.tutorNeuro.getModoInfo?.() || {};
            modoInfo = info.nombre || '🧠 Flexible';
        }
        
        // Construir HTML de pasos
        let pasosHTML = '';
        for (let i = 0; i < pasosPagina.length; i++) {
            const paso = pasosPagina[i];
            const idx = this._rutaActual.indexOf(paso);
            const esCompletado = paso.completado || false;
            const esActual = (idx === this._pasoActual && !esCompletado);
            const pctPaso = paso.porcentaje || 0;
            const icono = paso.icono || '📌';
            const color = paso.color || '#6C5CE7';
            
            let estadoIcono = '⏳';
            let colorEstado = 'var(--gray-light)';
            let textoEstado = 'Pendiente';
            
            if (esCompletado) {
                estadoIcono = '✅';
                colorEstado = 'var(--success)';
                textoEstado = 'Completado';
            } else if (esActual) {
                estadoIcono = '🎯';
                colorEstado = 'var(--primary)';
                textoEstado = 'Actual';
            } else if (pctPaso > 0) {
                estadoIcono = '🔄';
                colorEstado = 'var(--warning)';
                textoEstado = pctPaso + '%';
            }
            
            const nombrePaso = paso.titulo || paso.nombre || `Paso ${i+1}`;
            const nivel = paso.nivel || 'A1';
            const colorNivel = this._getColorNivel(nivel);
            
            // Badge de método
            const metodoBadge = paso.metodo === 'online' 
                ? '<span style="font-size:8px;background:var(--success)15;color:var(--success);padding:1px 8px;border-radius:8px;">🧠 IA</span>'
                : '<span style="font-size:8px;background:var(--bg);color:var(--gray);padding:1px 8px;border-radius:8px;">📝 Offline</span>';
            
            pasosHTML += `
                <div style="
                    display:flex;
                    align-items:center;
                    gap:12px;
                    padding:8px 14px;
                    border-radius:10px;
                    background: ${esActual ? 'var(--primary)08' : 'var(--bg)'};
                    border-left: 4px solid ${esActual ? 'var(--primary)' : esCompletado ? 'var(--success)' : 'var(--gray-light)'};
                    transition: all 0.3s ease;
                    cursor: ${esActual ? 'pointer' : 'default'};
                    ${esActual ? 'box-shadow: 0 0 20px rgba(108,92,231,0.12);' : ''}
                "
                ${esActual ? `onclick="window.learningPath.ejecutarPasoActual()"
                onmouseover="this.style.transform='translateX(4px)';this.style.boxShadow='0 4px 16px rgba(0,0,0,0.06)'"
                onmouseout="this.style.transform='none';this.style.boxShadow='${esActual ? '0 0 20px rgba(108,92,231,0.12)' : 'none'}'"` : ''}>
                    <span style="font-size:20px;flex-shrink:0;">${icono}</span>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;">
                            <span style="font-size:13px;font-weight:${esActual ? '700' : '500'};color:${esActual ? 'var(--primary)' : 'var(--dark)'};">
                                ${nombrePaso}
                                ${esActual ? '<span style="font-size:9px;background:var(--primary);color:white;padding:1px 10px;border-radius:12px;margin-left:6px;">ACTUAL</span>' : ''}
                            </span>
                            <div style="display:flex;align-items:center;gap:6px;font-size:10px;flex-wrap:wrap;">
                                <span style="color:${colorNivel};font-weight:600;">${nivel}</span>
                                <span style="color:${colorEstado};">${estadoIcono} ${textoEstado}</span>
                                ${metodoBadge}
                            </div>
                        </div>
                        <div style="font-size:11px;color:var(--gray-light);margin-top:2px;">
                            ${paso.descripcion ? paso.descripcion.substring(0, 60) + (paso.descripcion.length > 60 ? '...' : '') : ''}
                            ${paso.tipo ? ` · <span style="color:${color};">${paso.tipo.replace(/_/g, ' ')}</span>` : ''}
                        </div>
                        ${pctPaso > 0 && !esCompletado ? `
                            <div style="height:3px;background:var(--bg);border-radius:2px;overflow:hidden;margin-top:4px;max-width:200px;">
                                <div style="height:100%;width:${pctPaso}%;background:${esActual ? 'var(--primary)' : 'var(--warning)'};border-radius:2px;transition:width 0.8s ease;"></div>
                            </div>
                        ` : ''}
                    </div>
                    ${esActual ? `
                        <button onclick="event.stopPropagation(); window.learningPath.ejecutarPasoActual()" 
                                style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.3s;flex-shrink:0;"
                                onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-play"></i> Ir
                        </button>
                    ` : esCompletado ? `
                        <span style="font-size:11px;color:var(--success);font-weight:600;flex-shrink:0;">✅ Hecho</span>
                    ` : ''}
                </div>
            `;
        }
        
        // Paginación
        let paginacionHTML = '';
        if (totalPaginas > 1) {
            paginacionHTML = `
                <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-top:8px;">
                    <button class="btn-secondary" onclick="window.learningPath._irPagina(${this._paginaActual - 1})" 
                            style="padding:3px 12px;font-size:10px;${this._paginaActual <= 1 ? 'opacity:0.4;cursor:default;' : ''}" 
                            ${this._paginaActual <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span style="font-size:11px;color:var(--gray);">
                        Pág. <span style="font-weight:700;color:var(--dark);">${this._paginaActual}</span> de <span style="font-weight:700;color:var(--dark);">${totalPaginas}</span>
                    </span>
                    <button class="btn-secondary" onclick="window.learningPath._irPagina(${this._paginaActual + 1})" 
                            style="padding:3px 12px;font-size:10px;${this._paginaActual >= totalPaginas ? 'opacity:0.4;cursor:default;' : ''}" 
                            ${this._paginaActual >= totalPaginas ? 'disabled' : ''}>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            `;
        }
        
        // Buscador
        const buscadorHTML = `
            <div style="position:relative;margin-bottom:10px;">
                <i class="fas fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gray-light);font-size:13px;"></i>
                <input type="text" id="buscarPasoRuta" 
                       placeholder="🔍 Buscar paso por nombre, descripción o nivel..." 
                       style="width:100%;padding:6px 12px 6px 34px;border:2px solid var(--light);border-radius:8px;font-size:13px;font-family:var(--font);background:var(--white);transition:all 0.3s;"
                       oninput="window.learningPath._filtrarRuta(this.value)"
                       value="${this._busquedaRuta || ''}">
            </div>
        `;
        
        // Resumen
        const resumenHTML = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;">
                <div style="background:var(--bg);border-radius:8px;padding:6px 8px;text-align:center;border-top:3px solid var(--primary);">
                    <div style="font-size:16px;font-weight:800;color:var(--primary);">${total}</div>
                    <div style="font-size:8px;color:var(--gray);text-transform:uppercase;font-weight:600;">Pasos</div>
                </div>
                <div style="background:var(--bg);border-radius:8px;padding:6px 8px;text-align:center;border-top:3px solid var(--success);">
                    <div style="font-size:16px;font-weight:800;color:var(--success);">${completados}</div>
                    <div style="font-size:8px;color:var(--gray);text-transform:uppercase;font-weight:600;">Completados</div>
                </div>
                <div style="background:var(--bg);border-radius:8px;padding:6px 8px;text-align:center;border-top:3px solid var(--secondary);">
                    <div style="font-size:16px;font-weight:800;color:var(--secondary);">${pct}%</div>
                    <div style="font-size:8px;color:var(--gray);text-transform:uppercase;font-weight:600;">Progreso</div>
                </div>
            </div>
        `;
        
        // Barra de progreso
        const barraProgresoHTML = `
            <div style="height:6px;background:var(--bg);border-radius:3px;overflow:hidden;margin-bottom:10px;">
                <div style="height:100%;width:${pct}%;background:linear-gradient(90deg, var(--primary), var(--secondary));border-radius:3px;transition:width 0.8s ease;"></div>
            </div>
        `;
        
        // Paso actual destacado
        const pasoActualHTML = pasoActual ? `
            <div style="
                background:linear-gradient(135deg, ${pasoActualColor}12, var(--primary)06);
                border-radius:12px;
                padding:14px 18px;
                margin-bottom:12px;
                border:2px solid ${pasoActualColor}40;
                cursor:pointer;
                transition:all 0.3s;
            "
            onclick="window.learningPath.ejecutarPasoActual()"
            onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.06)'"
            onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:28px;">${pasoActual.icono || '📌'}</span>
                        <div>
                            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                                <span style="font-size:11px;color:var(--gray);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                                    <i class="fas fa-location-dot" style="color:${pasoActualColor};"></i> PASO ACTUAL
                                </span>
                                ${esGuiado ? '<span style="font-size:8px;background:var(--warning);color:white;padding:1px 8px;border-radius:8px;">🔒 Guiado</span>' : ''}
                            </div>
                            <div style="font-size:17px;font-weight:700;color:var(--dark);">
                                ${nombrePasoActual}
                            </div>
                            ${descPasoActual ? `<div style="font-size:13px;color:var(--gray);margin-top:2px;">${descPasoActual}</div>` : ''}
                            <div style="display:flex;gap:8px;font-size:10px;color:var(--gray-light);margin-top:4px;flex-wrap:wrap;">
                                <span>📊 ${pasoActual.porcentaje || 0}% completado</span>
                                <span>🎯 ${pasoActual.tipo || 'general'}</span>
                                <span>📚 ${pasoActual.nivel || 'A1'}</span>
                            </div>
                        </div>
                    </div>
                    <button class="btn-primary" onclick="event.stopPropagation(); window.learningPath.ejecutarPasoActual()" 
                            style="padding:8px 20px;font-size:13px;background:linear-gradient(135deg,${pasoActualColor},${pasoActualColor}dd);color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s;"
                            onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.2)'" 
                            onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-play"></i> Estudiar
                    </button>
                </div>
                ${pasoActual.porcentaje > 0 && pasoActual.porcentaje < 100 ? `
                    <div style="margin-top:8px;height:4px;background:var(--bg);border-radius:2px;overflow:hidden;">
                        <div style="height:100%;width:${pasoActual.porcentaje}%;background:linear-gradient(90deg, ${pasoActualColor}, var(--secondary));border-radius:2px;transition:width 0.8s ease;"></div>
                    </div>
                ` : ''}
            </div>
        ` : `
            <div style="
                background:linear-gradient(135deg, var(--success)08, var(--primary)08);
                border-radius:12px;
                padding:14px 18px;
                margin-bottom:12px;
                border:2px solid var(--success)30;
                text-align:center;
            ">
                <span style="font-size:32px;display:block;">🎉</span>
                <div style="font-size:16px;font-weight:700;color:var(--success);">¡Ruta completada!</div>
                <div style="font-size:13px;color:var(--gray);">Has completado todos los ${total} pasos de tu ruta.</div>
                <button class="btn-primary" onclick="window.learningPath.regenerarRuta()" 
                        style="padding:8px 24px;font-size:13px;margin-top:8px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s;"
                        onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 20px rgba(0,184,148,0.3)'" 
                        onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                    <i class="fas fa-sync"></i> Generar nueva ruta
                </button>
            </div>
        `;
        
        return `
            <div style="
                background:var(--white);
                border-radius:16px;
                padding:16px 20px;
                border:2px solid var(--light);
                box-shadow:var(--shadow);
                transition:all 0.3s ease;
            ">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:24px;">🧭</span>
                        <div>
                            <h4 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">
                                Ruta de Aprendizaje
                                <span style="font-size:11px;font-weight:400;color:var(--gray-light);">v3.0.1</span>
                            </h4>
                            <div style="display:flex;gap:8px;font-size:10px;color:var(--gray-light);flex-wrap:wrap;">
                                <span>${modoInfo}</span>
                                ${esGuiado ? '<span style="color:var(--warning);">🔒 Guiado</span>' : ''}
                                ${this._centinela ? '<span style="color:var(--success);">🧠 Neuro</span>' : ''}
                            </div>
                        </div>
                    </div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.learningPath.regenerarRuta()" 
                                style="padding:4px 14px;font-size:11px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-sync"></i> Regenerar
                        </button>
                        <button class="btn-secondary" onclick="window.learningPath._abrirModalRuta()" 
                                style="padding:4px 14px;font-size:11px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-expand"></i> Ver Ruta
                        </button>
                    </div>
                </div>
                
                ${barraProgresoHTML}
                ${resumenHTML}
                ${pasoActualHTML}
                
                ${buscadorHTML}
                
                <div style="display:flex;flex-direction:column;gap:6px;max-height:300px;overflow-y:auto;padding-right:4px;">
                    ${pasosHTML || `<div style="text-align:center;padding:20px;color:var(--gray-light);font-size:13px;">No se encontraron pasos</div>`}
                </div>
                
                ${paginacionHTML}
                
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:8px;border-top:1px solid var(--light);font-size:10px;color:var(--gray-light);flex-wrap:wrap;gap:4px;">
                    <span>📌 ${Math.max(1, inicio + 1)}-${Math.min(fin, this._rutaFiltrada.length)} de ${this._rutaFiltrada.length}</span>
                    ${this._busquedaRuta ? `<span>🔎 Filtrado: "${this._busquedaRuta}"</span>` : ''}
                    <span>🎯 ${completados}/${total} completados</span>
                    ${esGuiado ? '<span>🔒 Modo Guiado</span>' : ''}
                </div>
            </div>
        `;
    }

    // ============================================================
    // FILTRADO Y PAGINACIÓN
    // ============================================================

    _aplicarFiltro(ruta) {
        if (!this._busquedaRuta) return ruta;
        const busquedaLower = this._busquedaRuta.toLowerCase();
        return ruta.filter(paso => {
            const titulo = (paso.titulo || paso.nombre || '').toLowerCase();
            const descripcion = (paso.descripcion || '').toLowerCase();
            const nivel = (paso.nivel || '').toLowerCase();
            const tipo = (paso.tipo || '').toLowerCase();
            return titulo.includes(busquedaLower) || 
                   descripcion.includes(busquedaLower) || 
                   nivel.includes(busquedaLower) ||
                   tipo.includes(busquedaLower);
        });
    }

    _filtrarRuta(texto) {
        this._busquedaRuta = texto.trim();
        this._paginaActual = 1;
        this._renderizarEnDashboard();
    }

    _irPagina(pagina) {
        const ruta = this._rutaActual || [];
        const filtrada = this._aplicarFiltro(ruta);
        const totalPaginas = Math.max(1, Math.ceil(filtrada.length / this._pasosPorPagina));
        if (pagina < 1 || pagina > totalPaginas) return;
        this._paginaActual = pagina;
        this._renderizarEnDashboard();
    }

    // ============================================================
    // MODAL DE RUTA COMPLETA
    // ============================================================

    _abrirModalRuta() {
        const ruta = this._rutaActual || [];
        if (ruta.length === 0) {
            this._core?.mostrarToast('📭 No hay ruta para mostrar', 'warning');
            return;
        }
        
        // Usar el modal del tutorNeuro si existe
        if (window.tutorNeuro && window.tutorNeuro._mostrarRutaCompleta) {
            window.tutorNeuro._mostrarRutaCompleta();
            return;
        }
        
        // Fallback: mostrar en alerta
        let mensaje = '🧭 **RUTA DE APRENDIZAJE**\n\n';
        for (let i = 0; i < ruta.length; i++) {
            const paso = ruta[i];
            const nombre = paso.titulo || paso.nombre || `Paso ${i+1}`;
            const estado = paso.completado ? '✅' : (i === this._pasoActual ? '🎯' : '⏳');
            const pct = paso.porcentaje || 0;
            mensaje += `${estado} ${i+1}. ${nombre} (${pct}%)\n`;
        }
        mensaje += `\n📊 ${this._progreso.completados}/${this._progreso.total} completados (${this._progreso.porcentaje}%)`;
        alert(mensaje);
    }

    // ============================================================
    // ACTUALIZAR BADGE DEL TUTOR
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
            badge.innerHTML = '🧭 Ruta';
            badge.onclick = () => {
                this._abrirModalRuta();
            };
            headerRight.appendChild(badge);
        }
        
        if (badge && this._rutaActual && this._rutaActual.length > 0) {
            const pendientes = this._rutaActual.filter(p => !p.completado).length;
            const total = this._rutaActual.length;
            const pct = this._progreso.porcentaje || 0;
            
            if (pendientes === 0) {
                badge.style.background = 'var(--success)15';
                badge.style.borderColor = 'var(--success)';
                badge.style.color = 'var(--success)';
                badge.innerHTML = `🧭 Ruta ✅ ${pct}%`;
            } else if (this._pasoActual < total) {
                badge.style.background = 'var(--primary)15';
                badge.style.borderColor = 'var(--primary)';
                badge.style.color = 'var(--primary)';
                badge.innerHTML = `🧭 Ruta (${pendientes})`;
            } else {
                badge.style.background = 'var(--warning)15';
                badge.style.borderColor = 'var(--warning)';
                badge.style.color = 'var(--warning)';
                badge.innerHTML = `🧭 Ruta ⏳ ${pct}%`;
            }
        } else if (badge) {
            badge.style.background = 'var(--gray)15';
            badge.style.borderColor = 'var(--gray)';
            badge.style.color = 'var(--gray)';
            badge.innerHTML = '🧭 Sin ruta';
        }
    }

    // ============================================================
    // MÉTODOS AUXILIARES
    // ============================================================

    _getColorNivel(nivel) {
        const colores = {
            'A1': '#6C5CE7',
            'A2': '#0984E3',
            'B1': '#00B894',
            'B2': '#FDCB6E',
            'C1': '#E17055',
            'C2': '#FD79A8'
        };
        return colores[nivel] || '#6C5CE7';
    }

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        const jeroglificos = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        return jeroglificos.some(item => idiomaLower.includes(item) || item.includes(idiomaLower));
    }

    _esTonal(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        const tonales = ['zh', 'chino', 'chinese', 'mandarin', 'mandarín', 'th', 'tailandés', 'thai', 'vi', 'vietnamita', 'vietnamese'];
        return tonales.some(item => idiomaLower.includes(item) || item.includes(idiomaLower));
    }

    _getNombreIdioma(idioma) {
        const nombres = {
            'es': 'Español', 'en': 'Inglés', 'fr': 'Francés',
            'de': 'Alemán', 'it': 'Italiano', 'pt': 'Portugués',
            'zh': 'Chino', 'ja': 'Japonés', 'ko': 'Coreano',
            'ru': 'Ruso', 'ar': 'Árabe', 'hi': 'Hindi'
        };
        return nombres[idioma] || idioma;
    }

    // ============================================================
    // DESTRUIR
    // ============================================================

    destroy() {
        this._initDone = false;
        this._rutaActual = null;
        this._eventosRegistrados = false;
        console.log('🧭 Learning Path v3.0.1 destruido');
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.learningPath = new LearningPath();
window.LearningPath = window.learningPath;

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧭 Learning Path v3.0.1: Inicialización automática...');
    setTimeout(function() {
        if (window.uiCore) {
            window.learningPath.init(window.uiCore);
        } else {
            console.log('⏳ Learning Path: Esperando uiCore...');
        }
    }, 2000);
});

console.log('✅ Learning Path v3.0.1 - MAESTRÍA ABSOLUTA - DOBLE HERENCIA');
console.log('  🚀 Interfaz Super Fashion con paginación y búsqueda');
console.log('  🔥 Progreso en tiempo real con porcentaje por paso');
console.log('  🧠 Neuro-monitoreo con Centinela para rutas adaptativas');
console.log('  🎯 Doble herencia: Vigia + Centinela');
console.log('  📚 Integración con todos los módulos (Biblioteca, Tonos, etc.)');
console.log('  🔄 Sincronización con Tutor Neuro');
console.log('  🔒 Modo Guiado detectado automáticamente');
console.log('  🎨 Diseño Super Fashion con gradientes y animaciones');
console.log('  🛡️ CORREGIDO: Centinela TypeSafe con fallbacks (Error "getEstado" solucionado)');
console.log('  ✅ Todas las funcionalidades originales preservadas');