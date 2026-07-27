// ============================================================
// LEARNING PATH v2.3 - COMPLETO CORREGIDO (PROGRESO REAL)
// ============================================================

class LearningPath {
    constructor() {
        this._rutaActual = null;
        this._pasoActual = 0;
        this._ultimaGeneracion = 0;
        this._initDone = false;
        this._cargando = false;
        this._core = null;
        this._cacheValidez = 3600000;
        this._historialPasos = [];
        this._metricasRuta = {
            totalCompletados: 0,
            totalFallos: 0,
            tiempoPromedio: 0,
            eficiencia: 0
        };
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
            'modo_inverso': '🔄'
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
            'modo_inverso': '#6C5CE7'
        };
        this._TEMAS_POR_NIVEL = {
            'A1': ['Mi familia', 'La casa', 'Comida y bebida', 'Mi rutina', 'La ciudad', 'Los colores', 'Los animales', 'La ropa', 'El tiempo'],
            'A2': ['Viajes', 'Compras', 'Salud', 'Deportes', 'Trabajo', 'Música', 'El tiempo', 'La naturaleza', 'La tecnología básica'],
            'B1': ['Relaciones personales', 'Educación', 'Medios de comunicación', 'Turismo', 'Tecnología', 'Arte', 'Historia', 'Gastronomía'],
            'B2': ['Política', 'Economía', 'Ciencia', 'Filosofía', 'Globalización', 'Literatura', 'Psicología', 'Sostenibilidad'],
            'C1': ['Crítica cultural', 'Retórica', 'Antropología', 'Investigación', 'Análisis del discurso', 'Argumentación avanzada'],
            'C2': ['Especialización académica', 'Debate avanzado', 'Creación literaria', 'Análisis crítico avanzado', 'Oratoria']
        };
        
        this._pasosEnEjecucion = {};
    }

    async init(core) {
        if (this._initDone) return this;
        this._core = core || window.uiCore;
        await this._cargarRutaGuardada();
        await this._cargarHistorial();
        
        window.addEventListener('respuestaEstudio', (e) => {
            this._onRespuestaEstudio(e.detail);
        });
        
        window.addEventListener('cambioFase', (e) => {
            this._onCambioFase(e.detail);
        });
        
        this._initDone = true;
        console.log('🧭 Learning Path v2.3: Inicializado');
        return this;
    }

    _onRespuestaEstudio(detalle) {
        if (!detalle) return;
        
        const paso = this.getPasoActual();
        if (!paso) return;
        
        const key = `paso_${this._pasoActual}`;
        if (!this._pasosEnEjecucion[key]) {
            this._pasosEnEjecucion[key] = {
                totalRespuestas: 0,
                correctas: 0,
                frasesCompletadas: 0,
                totalFrases: 0
            };
        }
        
        this._pasosEnEjecucion[key].totalRespuestas++;
        if (detalle.tipo === 'correcto' || detalle.tipo === 'parcial') {
            this._pasosEnEjecucion[key].correctas++;
        }
        
        this._verificarCompletadoPaso();
    }

    _onCambioFase(detalle) {
        this._verificarCompletadoPaso();
    }

    async _verificarCompletadoPaso() {
        const paso = this.getPasoActual();
        if (!paso) return;
        if (paso.completado) return;
        
        const key = `paso_${this._pasoActual}`;
        const estado = this._pasosEnEjecucion[key];
        if (!estado) return;
        
        let porcentajeCompletado = 0;
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        
        try {
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
        
        if (porcentajeCompletado >= 100 && totalFrases > 0) {
            const todasRespondidas = estado.totalRespuestas >= totalFrases;
            if (todasRespondidas || totalFrases === 0) {
                console.log(`✅ Paso "${paso.titulo}" completado al 100% (${porcentajeCompletado}%)`);
                this.marcarPasoCompletado();
            }
        }
        
        window.dispatchEvent(new CustomEvent('learningPathProgresoActualizado', {
            detail: {
                paso: paso,
                porcentaje: porcentajeCompletado,
                indice: this._pasoActual
            }
        }));
    }

    marcarPasoCompletado() {
        if (!this._rutaActual || this._rutaActual.length === 0) return false;
        if (this._pasoActual >= this._rutaActual.length) return false;

        const paso = this._rutaActual[this._pasoActual];
        
        if (paso.completado) {
            console.log(`ℹ️ Paso "${paso.titulo}" ya está completado`);
            return false;
        }
        
        if (paso.porcentaje < 100) {
            console.log(`⏳ Paso "${paso.titulo}" al ${paso.porcentaje}%, esperando 100%`);
            return false;
        }
        
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

        paso.completado = true;
        paso.fechaCompletado = Date.now();
        paso.porcentaje = 100;

        this._metricasRuta.totalCompletados++;
        this._pasoActual++;

        this._guardarRuta(this._rutaActual, this._pasoActual);
        
        const key = `paso_${this._pasoActual - 1}`;
        delete this._pasosEnEjecucion[key];

        console.log(`✅ Paso "${paso.titulo}" COMPLETADO al 100%`);

        if (this._pasoActual >= this._rutaActual.length) {
            this._core?.mostrarToast('🎉 ¡Ruta completada!', 'success');
            window.dispatchEvent(new CustomEvent('learningPathCompletado', {
                detail: { ruta: this._rutaActual }
            }));
            setTimeout(() => this.generarRuta(true), 2000);
        } else {
            this._core?.mostrarToast(`✅ "${paso.titulo}" completado! Siguiente paso: "${this._rutaActual[this._pasoActual].titulo}"`, 'success');
        }

        window.dispatchEvent(new CustomEvent('learningPathPasoCompletado', {
            detail: { paso: paso, indice: this._pasoActual - 1 }
        }));

        if (window.UIDashboard) {
            window.UIDashboard._cargarDashboardInicial(window.uiCore);
        }

        return true;
    }

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
    }

    async _cargarHistorial() {
        try {
            const data = localStorage.getItem('pipeline_learning_path_historial');
            if (data) {
                this._historialPasos = JSON.parse(data);
            }
        } catch (e) {
            console.warn('⚠️ Error cargando historial:', e);
            this._historialPasos = [];
        }
    }

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

    async generarRuta(forzar = false) {
        if (this._cargando) {
            console.log('⏳ Generación en curso...');
            return this._rutaActual;
        }

        if (!forzar && this._rutaActual && this._rutaActual.length > 0) {
            const edad = Date.now() - this._ultimaGeneracion;
            if (edad < this._cacheValidez) {
                return this._rutaActual;
            }
        }

        this._cargando = true;
        this._core?.mostrarToast('🧠 Generando tu ruta de aprendizaje...', 'info');

        try {
            const usuario = await db.getUsuario();
            const stats = await db.obtenerEstadisticasNeuro();
            const progreso = await db.obtenerTodoProgreso();
            const frases = await db.obtenerFrases();
            const temas = await db.obtenerTemas();
            
            const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
            const nivel = gestorIdiomas?.getInfoActivo()?.nivel || 'A1';
            const esJeroglifico = this._esJeroglifico(idioma);
            const nombreIdioma = this._getNombreIdioma(idioma);

            const rcnPromedio = stats.rcnPromedio || 0;
            const eficiencia = stats.eficiencia || 0;
            const completadas = stats.progreso || 0;
            const totalFrases = stats.totalFrases || 0;
            let temasNombres = temas.map(t => t.nombre);
            const modoInversoActivo = modoInverso?.isActivo() || false;

            if (!temasNombres || temasNombres.length === 0) {
                const temasDisponibles = this._TEMAS_POR_NIVEL[nivel] || this._TEMAS_POR_NIVEL['A1'];
                const temaAleatorio = temasDisponibles[Math.floor(Math.random() * temasDisponibles.length)];
                temasNombres = [temaAleatorio];
                console.log(`📌 Usando tema del nivel ${nivel}: "${temaAleatorio}"`);
            }

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

            let fatiga = 0;
            try {
                if (window.centinela) {
                    if (typeof window.centinela.getEstado === 'function') {
                        const estadoCentinela = window.centinela.getEstado();
                        fatiga = (estadoCentinela.contadores?.neuroFatiga || estadoCentinela.neuroFatiga || 0);
                    } else {
                        fatiga = (window.centinela.contadores?.neuroFatiga || window.centinela.neuroFatiga || 0);
                    }
                }
            } catch (e) {
                console.warn('⚠️ Error detectando fatiga:', e);
                fatiga = 0;
            }

            const prompt = `
Eres el "Planificador de Aprendizaje" de Pipeline Neuro.

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

**REGLAS IMPORTANTES:**
1. SOLO genera temas del nivel ${nivel} o inferior.
2. NUNCA generes temas de niveles superiores.
3. Usa los temas existentes del usuario si los hay.
4. Si no hay temas, usa temas básicos del nivel ${nivel}.

**GENERA 3-5 PASOS PARA ESTE USUARIO.**

Cada paso debe tener:
- "tipo": uno de: estudio_tema, repaso, estudiar_frases, practicar_escritura, escucha, modo_inverso, desafio, examen
- "titulo": Título corto (máx 40 caracteres)
- "descripcion": Descripción clara (máx 80 caracteres)
- "modulo": SIEMPRE "study"
- "accion": una de: "estudiar_tema_por_nombre", "repasar_rcn_bajo", "practicar_frases", "practicar_escritura", "escucha", "activar_modo_inverso", "desafio", "examen"
- "parametros": datos adicionales
- "nivel": "${nivel}" (SIEMPRE usa este nivel)

**RESPONDE SOLO EN FORMATO JSON VÁLIDO.**
`;

            let resultado = null;
            let metodo = 'offline';

            if (vigia && vigia.enLinea && vigia._apiKeyValidada) {
                try {
                    resultado = await vigia._consultarGroq(prompt, 'json');
                    metodo = 'online';
                } catch (e) {
                    console.warn('⚠️ Error consultando a Vigía:', e);
                }
            }

            if (!resultado || !resultado.pasos || resultado.pasos.length === 0) {
                resultado = this._generarRutaOffline(
                    nivel, idioma, esJeroglifico, temasNombres,
                    palabrasBajoRCN.length, completadas, totalFrases, fatiga
                );
                metodo = 'offline';
            }

            if (resultado && resultado.pasos && resultado.pasos.length > 0) {
                if (resultado.pasos.length > 5) {
                    resultado.pasos = resultado.pasos.slice(0, 5);
                }

                for (const paso of resultado.pasos) {
                    paso.icono = this._ICONOS_PASO[paso.tipo] || '📌';
                    paso.color = this._COLORES_PASO[paso.tipo] || '#6C5CE7';
                    paso.completado = false;
                    paso.porcentaje = 0;
                    paso.metodo = metodo;
                    paso.timestamp = Date.now();
                    paso.nivel = paso.nivel || nivel;
                    if (!paso.parametros) paso.parametros = {};
                    if (!paso.modulo || paso.modulo !== 'study') {
                        paso.modulo = 'study';
                    }
                }

                this._guardarRuta(resultado.pasos, 0);
                this._core?.mostrarToast('✅ Ruta de aprendizaje generada', 'success');
                console.log(`🧭 Ruta generada (${resultado.pasos.length} pasos) - ${metodo}`);
                
                window.dispatchEvent(new CustomEvent('learningPathGenerado', {
                    detail: { ruta: resultado.pasos, metodo: metodo }
                }));

                return resultado.pasos;
            }

            this._core?.mostrarToast('⚠️ No se pudo generar una ruta', 'warning');
            return null;

        } catch (error) {
            console.error('❌ Error generando ruta:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
            return null;
        } finally {
            this._cargando = false;
        }
    }

    _generarRutaOffline(nivel, idioma, esJeroglifico, temasNombres, palabrasBajoRCN, completadas, totalFrases, fatiga) {
        const pasos = [];
        const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const nivelIdx = niveles.indexOf(nivel);
        const siguienteNivel = nivelIdx < niveles.length - 1 ? niveles[nivelIdx + 1] : null;
        
        let temasDisponibles = temasNombres;
        if (!temasDisponibles || temasDisponibles.length === 0) {
            const temasPorNivel = this._TEMAS_POR_NIVEL[nivel] || this._TEMAS_POR_NIVEL['A1'];
            const temaAleatorio = temasPorNivel[Math.floor(Math.random() * temasPorNivel.length)];
            temasDisponibles = [temaAleatorio];
            console.log(`📌 Usando tema del nivel ${nivel}: "${temaAleatorio}"`);
        }

        if (palabrasBajoRCN > 0) {
            const cantidad = Math.min(palabrasBajoRCN, 5);
            pasos.push({
                tipo: 'repaso',
                titulo: 'Repaso de Palabras',
                descripcion: `Repasa ${cantidad} palabras con RCN bajo.`,
                modulo: 'study',
                accion: 'repasar_rcn_bajo',
                parametros: { cantidad: cantidad },
                icono: '🔄',
                color: '#FDCB6E',
                completado: false,
                porcentaje: 0,
                metodo: 'offline',
                nivel: nivel
            });
        }

        if (temasDisponibles.length > 0) {
            const temaAleatorio = temasDisponibles[Math.floor(Math.random() * temasDisponibles.length)];
            pasos.push({
                tipo: 'estudio_tema',
                titulo: `Estudiar "${temaAleatorio}"`,
                descripcion: `Aprende vocabulario sobre "${temaAleatorio}".`,
                modulo: 'study',
                accion: 'estudiar_tema_por_nombre',
                parametros: { temaNombre: temaAleatorio },
                icono: '📖',
                color: '#0984E3',
                completado: false,
                porcentaje: 0,
                metodo: 'offline',
                nivel: nivel
            });
        }

        if (totalFrases > 0) {
            const cantidad = Math.min(10, totalFrases);
            pasos.push({
                tipo: 'estudiar_frases',
                titulo: 'Práctica de Frases',
                descripcion: `Practica ${cantidad} frases de nivel ${nivel}.`,
                modulo: 'study',
                accion: 'practicar_frases',
                parametros: { cantidad: cantidad },
                icono: '📖',
                color: '#A29BFE',
                completado: false,
                porcentaje: 0,
                metodo: 'offline',
                nivel: nivel
            });
        }

        if (fatiga > 0.6 && totalFrases > 5) {
            pasos.push({
                tipo: 'escucha',
                titulo: 'Escucha de Frases',
                descripcion: `Practica comprensión auditiva con frases de nivel ${nivel}.`,
                modulo: 'study',
                accion: 'escucha',
                parametros: { cantidad: 5 },
                icono: '🔊',
                color: '#74B9FF',
                completado: false,
                porcentaje: 0,
                metodo: 'offline',
                nivel: nivel
            });
        }

        if (completadas >= 15 && totalFrases >= 20) {
            const nivelObjetivo = siguienteNivel || nivel;
            pasos.push({
                tipo: 'examen',
                titulo: `Preparación para ${nivelObjetivo}`,
                descripcion: `Practica para preparar el examen de ${nivelObjetivo}.`,
                modulo: 'study',
                accion: 'practicar_frases',
                parametros: { cantidad: 10, nivel: nivelObjetivo },
                icono: '📝',
                color: '#00CEC9',
                completado: false,
                porcentaje: 0,
                metodo: 'offline',
                nivel: nivel
            });
        }

        if (esJeroglifico && palabrasBajoRCN > 0) {
            pasos.push({
                tipo: 'practicar_escritura',
                titulo: 'Práctica de Escritura',
                descripcion: `Practica la escritura de caracteres con RCN bajo.`,
                modulo: 'study',
                accion: 'practicar_escritura',
                parametros: { cantidad: Math.min(palabrasBajoRCN, 3) },
                icono: '✍️',
                color: '#FD79A8',
                completado: false,
                porcentaje: 0,
                metodo: 'offline',
                nivel: nivel
            });
        }

        return { pasos: pasos.slice(0, 5) };
    }

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
                esActivo: i === this._pasoActual,
                esPendiente: i > this._pasoActual,
                porcentaje: paso.porcentaje || 0
            };
        });
    }

    getRutaCompleta() {
        return this._rutaActual || [];
    }

    getProgreso() {
        if (!this._rutaActual || this._rutaActual.length === 0) return { completados: 0, total: 0, porcentaje: 0 };
        const completados = this._rutaActual.filter(p => p.completado === true).length;
        return {
            completados: completados,
            total: this._rutaActual.length,
            porcentaje: Math.round((completados / this._rutaActual.length) * 100)
        };
    }

    async ejecutarPasoActual() {
        const paso = this.getPasoActual();
        if (!paso) {
            this._core?.mostrarToast('ℹ️ No hay paso activo.', 'info');
            return;
        }

        if (paso.completado) {
            this._core?.mostrarToast(`✅ "${paso.titulo}" ya está completado. Avanzando...`, 'info');
            this._pasoActual++;
            this._guardarRuta(this._rutaActual, this._pasoActual);
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(window.uiCore);
            }
            return;
        }

        console.log(`🧭 Ejecutando: "${paso.titulo}" - Acción: ${paso.accion}`);

        try {
            const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
            let tiempoInicio = Date.now();

            const key = `paso_${this._pasoActual}`;
            this._pasosEnEjecucion[key] = {
                totalRespuestas: 0,
                correctas: 0,
                frasesCompletadas: 0,
                totalFrases: 0,
                inicio: tiempoInicio
            };

            switch (paso.accion) {
                case 'estudiar_tema_por_nombre':
                    if (paso.parametros?.temaNombre) {
                        const temas = await db.obtenerTemas();
                        const temaEncontrado = temas.find(t => 
                            t.nombre.toLowerCase().includes(paso.parametros.temaNombre.toLowerCase())
                        );
                        if (temaEncontrado) {
                            await pipeline.estudiarTema(temaEncontrado.id);
                            if (this._core) this._core.irAModulo('study');
                            this._core?.mostrarToast(`📖 Estudiando "${temaEncontrado.nombre}". Completa todas las frases para avanzar.`, 'info');
                            return;
                        }
                    }
                    const frasesFallback = await db.obtenerFrasesPorIdioma(idioma);
                    if (frasesFallback.length > 0) {
                        pipeline.frases = frasesFallback.sort(() => Math.random() - 0.5).slice(0, 10);
                        pipeline.indiceFrase = 0;
                        await pipeline.cargarFrase(0);
                        if (this._core) this._core.irAModulo('study');
                        this._core?.mostrarToast(`📖 Estudiando ${pipeline.frases.length} frases. Completa todas para avanzar.`, 'info');
                        return;
                    }
                    this._core?.mostrarToast('❌ No hay contenido para estudiar.', 'error');
                    this.marcarPasoCompletado();
                    break;

                case 'repasar_rcn_bajo':
                    const cantidad = paso.parametros?.cantidad || 5;
                    const frases = await db.obtenerFrasesPorIdioma(idioma);
                    const progresos = await db.obtenerTodoProgreso();
                    
                    const frasesBajoRCN = [];
                    for (const f of frases) {
                        const prog = progresos.find(p => p.fraseId === f.id);
                        if (prog && prog.rcn < 2) {
                            frasesBajoRCN.push(f);
                        }
                    }
                    
                    if (frasesBajoRCN.length === 0) {
                        this._core?.mostrarToast('✅ No hay palabras con RCN bajo. ¡Buen trabajo!', 'success');
                        paso.porcentaje = 100;
                        this.marcarPasoCompletado();
                        return;
                    }
                    
                    const seleccionadas = frasesBajoRCN.sort(() => Math.random() - 0.5).slice(0, cantidad);
                    pipeline.frases = seleccionadas;
                    pipeline.indiceFrase = 0;
                    await pipeline.cargarFrase(0);
                    if (this._core) this._core.irAModulo('study');
                    this._core?.mostrarToast(`📖 Repasando ${seleccionadas.length} frases con RCN bajo. Completa todas para avanzar.`, 'info');
                    break;

                case 'practicar_frases':
                default:
                    const cant = paso.parametros?.cantidad || 10;
                    const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
                    
                    if (todasFrases.length === 0) {
                        this._core?.mostrarToast('❌ No hay frases. Genera contenido primero.', 'error');
                        this.marcarPasoCompletado();
                        return;
                    }
                    
                    let frasesFiltradas = todasFrases;
                    if (paso.parametros?.nivel) {
                        frasesFiltradas = todasFrases.filter(f => (f.nivel || 'A1') === paso.parametros.nivel);
                        if (frasesFiltradas.length === 0) {
                            frasesFiltradas = todasFrases;
                        }
                    }
                    
                    const frasesPractica = frasesFiltradas.sort(() => Math.random() - 0.5).slice(0, Math.min(cant, frasesFiltradas.length));
                    pipeline.frases = frasesPractica;
                    pipeline.indiceFrase = 0;
                    await pipeline.cargarFrase(0);
                    if (this._core) this._core.irAModulo('study');
                    this._core?.mostrarToast(`📖 Practicando ${frasesPractica.length} frases. Completa todas para avanzar.`, 'info');
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
                        this._core?.mostrarToast('✅ No hay frases para practicar escritura.', 'success');
                        this.marcarPasoCompletado();
                        return;
                    }
                    
                    const seleccionadasEscritura = frasesParaEscritura.sort(() => Math.random() - 0.5).slice(0, cantEscritura);
                    pipeline.frases = seleccionadasEscritura;
                    pipeline.indiceFrase = 0;
                    await pipeline.cargarFrase(0);
                    if (this._core) {
                        if (window.UIStudy && window.UIStudy.cambiarModoEstudio) {
                            window.UIStudy.cambiarModoEstudio('escritura');
                        }
                        this._core.irAModulo('study');
                    }
                    this._core?.mostrarToast(`✍️ Practicando escritura con ${seleccionadasEscritura.length} frases. Completa todas para avanzar.`, 'info');
                    break;

                case 'escucha':
                    const cantEscucha = paso.parametros?.cantidad || 5;
                    const frasesEscucha = await db.obtenerFrasesPorIdioma(idioma);
                    
                    if (frasesEscucha.length === 0) {
                        this._core?.mostrarToast('❌ No hay frases para escuchar.', 'error');
                        this.marcarPasoCompletado();
                        return;
                    }
                    
                    const frasesEscuchaSeleccionadas = frasesEscucha.sort(() => Math.random() - 0.5).slice(0, Math.min(cantEscucha, frasesEscucha.length));
                    pipeline.frases = frasesEscuchaSeleccionadas;
                    pipeline.indiceFrase = 0;
                    await pipeline.cargarFrase(0);
                    if (this._core) {
                        if (window.UIStudy && window.UIStudy.cambiarModoEstudio) {
                            window.UIStudy.cambiarModoEstudio('escucha');
                        }
                        this._core.irAModulo('study');
                    }
                    this._core?.mostrarToast(`🔊 Escuchando ${frasesEscuchaSeleccionadas.length} frases. Completa todas para avanzar.`, 'info');
                    break;

                case 'activar_modo_inverso':
                    if (modoInverso) {
                        modoInverso.toggle();
                        this._core?.mostrarToast('🔄 Modo Inverso activado', 'info');
                    }
                    this.marcarPasoCompletado();
                    break;

                case 'desafio':
                    if (window.SistemaCompeticiones && window.SistemaCompeticiones._iniciarModo) {
                        window.SistemaCompeticiones._iniciarModo('duelo');
                        this._core?.mostrarToast('🏆 ¡Desafío iniciado! Completa la partida para avanzar.', 'info');
                    } else {
                        this._core?.mostrarToast('🏆 Módulo de competiciones no disponible', 'warning');
                        this.marcarPasoCompletado();
                    }
                    break;

                case 'examen':
                    this._core?.mostrarToast('📝 Abriendo preparación para examen...', 'info');
                    const nivelExamen = paso.parametros?.nivel || 'A1';
                    if (window.UIConfig && window.UIConfig._iniciarExamenConfig) {
                        window.UIConfig._iniciarExamenConfig(nivelExamen);
                    } else {
                        this._core?.mostrarToast('❌ Módulo de examen no disponible', 'error');
                        this.marcarPasoCompletado();
                    }
                    break;
            }

            this._historialPasos.push({
                titulo: paso.titulo,
                accion: paso.accion,
                timestamp: Date.now(),
                completado: false,
                tiempo: Date.now() - tiempoInicio
            });
            this._guardarHistorial();

        } catch (error) {
            console.error('❌ Error ejecutando paso:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

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
        
        this._core?.mostrarToast(`📌 Paso seleccionado: "${nombrePaso}"`, 'info');
    }

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

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        const jeroglificos = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        return jeroglificos.some(item => idiomaLower.includes(item) || item.includes(idiomaLower));
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

    renderizarWidget(container) {
        if (!container) return;

        const paso = this.getPasoActual();
        const progreso = this.getProgreso();
        const tieneRuta = this._rutaActual && this._rutaActual.length > 0;
        const pasosConEstado = this.getPasosConEstado();

        let html = `
            <div class="learning-path-widget" style="
                background: linear-gradient(135deg, var(--primary)08, var(--secondary)08);
                border-radius: 14px;
                padding: 16px 20px;
                border: 2px solid var(--primary)20;
                margin-bottom: 16px;
                box-shadow: 0 4px 20px rgba(108,92,231,0.06);
                transition: all 0.3s ease;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 24px;">🧭</span>
                        <div>
                            <h3 style="font-size: 16px; font-weight: 700; color: var(--dark); margin: 0;">
                                Tu Ruta de Aprendizaje
                            </h3>
                            <span style="font-size: 11px; color: var(--gray-light);">
                                ${tieneRuta ? `${progreso.completados}/${progreso.total} pasos` : 'Genera tu ruta personalizada'}
                            </span>
                        </div>
                    </div>
                    <button class="btn-secondary" onclick="window.LearningPath.regenerarRuta()" 
                            style="padding: 4px 12px; font-size: 11px; background: var(--bg); border: 1px solid var(--light); border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-sync"></i>
                    </button>
                </div>

                ${tieneRuta && paso ? `
                    <div style="
                        background: ${paso.completado ? 'var(--success)05' : 'var(--white)'};
                        border-radius: 10px;
                        padding: 14px 16px;
                        border-left: 4px solid ${paso.completado ? 'var(--success)' : (paso.color || 'var(--primary)')};
                        cursor: ${paso.completado ? 'default' : 'pointer'};
                        transition: all 0.3s;
                        margin-top: 4px;
                        opacity: ${paso.completado ? '0.8' : '1'};
                    "
                    ${!paso.completado ? `onclick="window.LearningPath.ejecutarPasoActual()"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.08)'"
                    onmouseout="this.style.transform='none'; this.style.boxShadow='none'"` : ''}>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 32px;">${paso.completado ? '✅' : (paso.icono || '📌')}</span>
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                    <span style="font-size: 14px; font-weight: 700; color: ${paso.completado ? 'var(--success)' : 'var(--dark)'};">
                                        ${paso.titulo || 'Paso sin título'}
                                    </span>
                                    <span style="font-size: 9px; background: ${paso.color || 'var(--primary)'}20; color: ${paso.color || 'var(--primary)'}; padding: 1px 10px; border-radius: 10px; font-weight: 600;">
                                        ${paso.tipo || 'general'}
                                    </span>
                                    ${paso.completado ? `
                                        <span style="font-size: 8px; color: var(--success);">✅ Completado</span>
                                    ` : `
                                        <span style="font-size: 8px; color: var(--primary);">${paso.porcentaje || 0}%</span>
                                    `}
                                    ${paso.metodo === 'online' ? `
                                        <span style="font-size: 8px; background: var(--success)15; color: var(--success); padding: 1px 8px; border-radius: 8px;">
                                            🧠 IA
                                        </span>
                                    ` : `
                                        <span style="font-size: 8px; background: var(--bg); color: var(--gray); padding: 1px 8px; border-radius: 8px;">
                                            📝 Offline
                                        </span>
                                    `}
                                </div>
                                <p style="font-size: 13px; color: var(--gray); margin: 2px 0 0 0;">${paso.descripcion}</p>
                                ${!paso.completado && paso.porcentaje > 0 ? `
                                    <div style="margin-top: 6px; height: 4px; background: var(--bg); border-radius: 2px; overflow: hidden; max-width: 200px;">
                                        <div style="height: 100%; width: ${paso.porcentaje}%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 2px; transition: width 0.8s ease;"></div>
                                    </div>
                                ` : ''}
                            </div>
                            ${!paso.completado ? `
                                <button class="btn-primary" onclick="event.stopPropagation(); window.LearningPath.ejecutarPasoActual()" 
                                        style="padding: 6px 16px; font-size: 12px; background: linear-gradient(135deg, #6C5CE7, #A29BFE); color: white; border: none; border-radius: 6px; cursor: pointer; white-space: nowrap;">
                                    <i class="fas fa-play"></i> Ir
                                </button>
                            ` : `
                                <span style="font-size: 11px; color: var(--success); font-weight: 600;">✅ Completado</span>
                            `}
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                        <div style="flex: 1; height: 4px; background: var(--bg); border-radius: 2px; overflow: hidden;">
                            <div style="height: 100%; width: ${progreso.porcentaje}%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 2px; transition: width 0.8s ease;"></div>
                        </div>
                        <span style="font-size: 10px; color: var(--gray-light); white-space: nowrap;">${progreso.porcentaje}%</span>
                    </div>

                    ${pasosConEstado.length > 1 ? `
                        <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
                            ${pasosConEstado.map((p, i) => {
                                let bgColor = 'var(--bg)';
                                let textColor = 'var(--gray)';
                                let estadoEmoji = '⏳';
                                let borderColor = 'var(--light)';
                                
                                if (p.esCompletado) {
                                    bgColor = 'var(--success)15';
                                    textColor = 'var(--success)';
                                    estadoEmoji = '✅';
                                    borderColor = 'var(--success)';
                                } else if (p.esActivo) {
                                    bgColor = 'var(--primary)';
                                    textColor = 'white';
                                    estadoEmoji = '🎯';
                                    borderColor = 'var(--primary)';
                                }
                                
                                return `
                                    <span style="
                                        display:inline-flex;align-items:center;gap:4px;
                                        padding:3px 12px;border-radius:16px;
                                        font-size:10px;
                                        background: ${bgColor};
                                        color: ${textColor};
                                        border: 1px solid ${borderColor};
                                        cursor: ${p.esActivo ? 'pointer' : 'pointer'};
                                        transition: all 0.2s ease;
                                        white-space: nowrap;
                                        opacity: ${p.esCompletado ? '0.7' : '1'};
                                        font-weight: ${p.esActivo ? '600' : '400'};
                                    "
                                    onclick="window.LearningPath.irAlPaso(${i})"
                                    onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" 
                                    onmouseout="this.style.transform='none';this.style.boxShadow='none'"
                                    title="${p.titulo || `Paso ${i+1}`} - ${p.porcentaje || 0}%"
                                    >
                                        ${estadoEmoji} ${p.titulo || `Paso ${i+1}`}
                                        ${p.esActivo ? ' ◀' : ''}
                                        ${!p.esCompletado && p.porcentaje > 0 ? ` (${p.porcentaje}%)` : ''}
                                    </span>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}
                ` : `
                    <div style="text-align: center; padding: 16px 0;">
                        <p style="font-size: 14px; color: var(--gray);">
                            🧠 Deja que la IA cree una ruta personalizada para ti.
                        </p>
                        <button class="btn-primary" onclick="window.LearningPath.generarRuta(true)" 
                                style="padding: 8px 24px; font-size: 14px; background: linear-gradient(135deg, #6C5CE7, #A29BFE); color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s;"
                                onmouseover="this.style.transform='scale(1.03)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" 
                                onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                            <i class="fas fa-magic"></i> Generar mi Ruta
                        </button>
                    </div>
                `}
            </div>
        `;

        container.innerHTML = html;
    }
}

const learningPath = new LearningPath();
window.learningPath = learningPath;
window.LearningPath = learningPath;

console.log('✅ Learning Path v2.3 - COMPLETO CORREGIDO (PROGRESO REAL)');
console.log('  🔥 SOLO marca completado al 100%');
console.log('  📊 Progreso basado en frases completadas');
console.log('  🔄 Escucha eventos de estudio para actualizar progreso');
console.log('  🎯 No marca completado al entrar, solo al terminar');
console.log('  📌 Fallback para undefined en titulo');
console.log('  🧠 Integración con Pipeline para progreso real');
console.log('  📊 Actualiza el Dashboard automáticamente al completar');