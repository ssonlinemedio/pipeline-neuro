// ============================================================
// GESTOR DE NIVELES v1.5 - CON GENERACIÓN DE EXAMEN MEJORADA
// ============================================================

class GestorNiveles {
    constructor() {
        this.niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        this.umbralesBase = {
            A1: { rcnMinimo: 1.5, frasesCompletadas: 10, eficienciaMinima: 30 },
            A2: { rcnMinimo: 2.0, frasesCompletadas: 25, eficienciaMinima: 40 },
            B1: { rcnMinimo: 2.5, frasesCompletadas: 50, eficienciaMinima: 50 },
            B2: { rcnMinimo: 3.0, frasesCompletadas: 80, eficienciaMinima: 60 },
            C1: { rcnMinimo: 3.5, frasesCompletadas: 120, eficienciaMinima: 70 },
            C2: { rcnMinimo: 4.0, frasesCompletadas: 200, eficienciaMinima: 80 }
        };
        this.umbrales = { ...this.umbralesBase };
        this._initDone = false;
    }

    async init() {
        if (this._initDone) return this;
        console.log('📊 Gestor de Niveles v1.5: Inicializado');
        await this._cargarUmbralesPersonalizados();
        this._initDone = true;
        return this;
    }

    // ============================================================
    // UMBRALES ADAPTATIVOS
    // ============================================================

    async _cargarUmbralesPersonalizados() {
        try {
            const usuario = await db.getUsuario();
            if (!usuario) return;
            
            const config = await db.getConfiguracionUsuario(usuario.id);
            if (config?.umbralesPersonalizados) {
                this.umbrales = { ...this.umbralesBase, ...config.umbralesPersonalizados };
                console.log('📊 Umbrales personalizados cargados');
            }
        } catch (e) {
            console.warn('⚠️ No se pudieron cargar umbrales personalizados');
        }
    }

    // ============================================================
    // GENERAR PREGUNTAS DE EXAMEN
    // ============================================================
    
    async _generarPreguntasExamen(idioma, nivel, numPreguntas) {
        // 🔥 1. Intentar usar Vigía para generar preguntas reales
        if (window.vigia && window.vigia.enLinea) {
            try {
                const frases = await db.obtenerFrasesPorIdioma(idioma);
                const frasesNivel = frases.filter(f => f.nivel === nivel || !f.nivel);
                
                if (frasesNivel.length === 0) {
                    console.warn('⚠️ No hay frases para generar examen');
                    return this._generarPreguntasGenericas(nivel, numPreguntas);
                }
                
                const shuffled = frasesNivel.sort(() => Math.random() - 0.5);
                const seleccionadas = shuffled.slice(0, Math.min(numPreguntas, shuffled.length));
                
                if (seleccionadas.length === 0) {
                    return this._generarPreguntasGenericas(nivel, numPreguntas);
                }
                
                const preguntas = [];
                for (const frase of seleccionadas) {
                    const tipos = ['traduccion', 'completar', 'multiple', 'ordenar'];
                    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
                    
                    const pregunta = {
                        tipo: tipo,
                        pregunta: `Traduce al español: "${frase.original}"`,
                        respuestaCorrecta: frase.traduccion,
                        opciones: []
                    };
                    
                    if (tipo === 'multiple') {
                        const opciones = [frase.traduccion];
                        const otras = frasesNivel.filter(f => f.id !== frase.id);
                        const shuffledOtras = otras.sort(() => Math.random() - 0.5);
                        for (const f of shuffledOtras) {
                            if (!opciones.includes(f.traduccion) && opciones.length < 4) {
                                opciones.push(f.traduccion);
                            }
                        }
                        while (opciones.length < 4) {
                            const genericas = ['No sé', 'Quizás', 'Tal vez', 'Podría ser'];
                            const random = genericas[Math.floor(Math.random() * genericas.length)];
                            if (!opciones.includes(random)) {
                                opciones.push(random);
                            }
                        }
                        pregunta.opciones = opciones.sort(() => Math.random() - 0.5);
                    }
                    
                    preguntas.push(pregunta);
                }
                
                if (preguntas.length > 0) {
                    return preguntas;
                }
                
            } catch (e) {
                console.warn('⚠️ Error generando preguntas con Vigía:', e);
            }
        }
        
        // 🔥 2. Fallback
        return this._generarPreguntasGenericas(nivel, numPreguntas);
    }

    _generarPreguntasGenericas(nivel, num) {
        const tipos = ['traduccion', 'completar', 'multiple', 'ordenar'];
        const preguntas = [];
        
        if (num === 0) {
            return [{
                tipo: 'info',
                pregunta: '📚 No hay suficientes frases para generar un examen.\n\nGenera o importa más contenido primero.',
                respuestaCorrecta: '',
                opciones: []
            }];
        }
        
        for (let i = 0; i < Math.min(num, 10); i++) {
            const tipo = tipos[i % tipos.length];
            const pregunta = {
                tipo: tipo,
                pregunta: `Pregunta de ejemplo ${i + 1} (nivel ${nivel})`,
                respuestaCorrecta: 'Opción A',
                opciones: ['Opción A', 'Opción B', 'Opción C', 'Opción D']
            };
            preguntas.push(pregunta);
        }
        return preguntas;
    }

    // ============================================================
    // INICIAR EXAMEN
    // ============================================================
    
    async iniciarExamenNivel(usuarioId, idioma, nivel) {
        console.log('📝 Iniciando examen de nivel:', nivel, 'para', idioma);
        
        try {
            const preguntas = await this._generarPreguntasExamen(idioma, nivel, 10);
            
            if (!preguntas || preguntas.length === 0) {
                if (window.uiCore) {
                    await window.uiCore.alert(
                        '📚 No hay suficientes frases para generar un examen.\n\nGenera o importa más contenido primero.',
                        '📚 Sin contenido'
                    );
                }
                return null;
            }
            
            if (typeof window.uiCore !== 'undefined' && window.UIConfig) {
                const resultado = await window.UIConfig._mostrarExamenNivelPro(preguntas, nivel);
                
                if (!resultado || resultado.cancelado) {
                    return null;
                }
                
                const aprobado = resultado.puntuacion >= 70;
                const examen = {
                    usuarioId: usuarioId,
                    idioma: idioma,
                    fecha: Date.now(),
                    nivelEvaluado: nivel,
                    preguntas: preguntas,
                    respuestas: resultado.respuestas || [],
                    puntuacion: resultado.puntuacion || 0,
                    aprobado: aprobado,
                    bonusAplicado: aprobado
                };
                
                await this._guardarExamen(examen);
                
                if (aprobado) {
                    await this._actualizarNivelUsuario(usuarioId, idioma, nivel);
                    if (window.UIConfig) {
                        window.UIConfig._mostrarCelebracionExamen(nivel, resultado.puntuacion);
                    }
                    if (window.uiCore) {
                        window.uiCore.mostrarToast('🎉 ¡Has aprobado el nivel ' + nivel + '! 🎁 Bonus 2x activado.', 'success');
                    }
                    await this._aplicarBonusExperiencia(usuarioId, 2);
                } else {
                    if (window.uiCore) {
                        window.uiCore.mostrarToast('📚 No has aprobado. Sigue practicando.', 'warning');
                        const recomendaciones = await this._generarRecomendacionesExamen(resultado);
                        window.uiCore.mostrarToast('💡 ' + recomendaciones, 'info');
                    }
                    await this._ofrecerPlanEstudio(idioma, nivel, resultado);
                }
                
                return examen;
            }
            
            return null;
            
        } catch (error) {
            console.error('❌ Error en examen:', error);
            if (window.uiCore) {
                window.uiCore.mostrarToast('❌ Error generando examen', 'error');
            }
            return null;
        }
    }

    // ============================================================
    // EVALUACIÓN AUTOMÁTICA
    // ============================================================

    async evaluarNivelAutomatico(usuarioId, idioma) {
        console.log('📊 Evaluando nivel automático para:', usuarioId, idioma);
        
        try {
            const stats = await db.obtenerEstadisticasNeuro();
            const progreso = await db.obtenerTodoProgreso();
            const frases = await db.obtenerFrases();
            const palabras = await db.obtenerPalabras();
            const usuario = await db.getUsuario();

            const rcnPromedio = stats.rcnPromedio || 0;
            const frasesCompletadas = progreso.filter(p => p.estado === 'completada').length;
            const eficiencia = stats.eficiencia || 0;
            const palabrasDominadas = palabras.filter(p => p.nivelDominio === 'dominado').length;
            const rachaActual = await this._calcularRacha(progreso);
            
            let nivelActual = usuario?.idiomasObjetivo?.find(i => i.idioma === idioma)?.nivel || 'A1';
            
            let nivelAlcanzado = 'A1';
            for (const [nivel, umbral] of Object.entries(this.umbrales)) {
                if (rcnPromedio >= umbral.rcnMinimo &&
                    frasesCompletadas >= umbral.frasesCompletadas &&
                    eficiencia >= umbral.eficienciaMinima) {
                    nivelAlcanzado = nivel;
                }
            }

            const indiceActual = this.niveles.indexOf(nivelActual);
            const indiceAlcanzado = this.niveles.indexOf(nivelAlcanzado);
            const debeSubir = indiceAlcanzado > indiceActual;
            
            const gapAnalysis = this._analizarBrecha(nivelActual, nivelAlcanzado, stats, progreso);

            let mensaje = '';
            if (debeSubir) {
                mensaje = `🎉 ¡Felicidades! Has alcanzado el nivel ${nivelAlcanzado}.`;
                await this._actualizarNivelUsuario(usuarioId, idioma, nivelAlcanzado);
                
                window.dispatchEvent(new CustomEvent('cambioNivel', {
                    detail: { 
                        nivelAnterior: nivelActual, 
                        nivelNuevo: nivelAlcanzado,
                        usuarioId: usuarioId,
                        idioma: idioma,
                        gapAnalysis: gapAnalysis
                    }
                }));
            }

            const evaluacion = {
                usuarioId: usuarioId,
                idioma: idioma,
                fecha: Date.now(),
                nivelActual: nivelActual,
                nivelAlcanzado: nivelAlcanzado,
                debeSubir: debeSubir,
                gapAnalysis: gapAnalysis,
                metricas: {
                    rcnPromedio,
                    frasesCompletadas,
                    eficiencia,
                    palabrasDominadas,
                    racha: rachaActual
                },
                umbralesUsados: this.umbrales[nivelAlcanzado]
            };

            await this._guardarEvaluacion(evaluacion);

            if (debeSubir && typeof window.uiCore !== 'undefined') {
                await window.UIConfig._mostrarCelebracionNivelPro(nivelActual, nivelAlcanzado, mensaje, gapAnalysis);
                
                const hacerExamen = await window.uiCore.confirm(
                    `📝 ¿Quieres hacer un examen de nivel para confirmar tu dominio de **${nivelAlcanzado}**?\n\n` +
                    `🎁 **BONUS:** Si apruebas, ganarás **2x de experiencia** y desbloquearás contenido exclusivo.\n\n` +
                    `📊 **Análisis de brecha:**\n${gapAnalysis.resumen}`,
                    '🎯 Examen de Nivel con Bonus'
                );
                
                if (hacerExamen) {
                    const resultado = await this.iniciarExamenNivel(usuarioId, idioma, nivelAlcanzado);
                    if (resultado?.aprobado) {
                        window.uiCore.mostrarToast('🎁 ¡Bonus 2x activado! Experiencia duplicada.', 'success');
                        await this._aplicarBonusExperiencia(usuarioId, 2);
                    }
                } else {
                    window.uiCore.mostrarToast('📊 Nivel actualizado. Puedes hacer el examen después desde Configuración.', 'info');
                }
            }

            return evaluacion;

        } catch (error) {
            console.error('❌ Error evaluando nivel:', error);
            return null;
        }
    }

    // ============================================================
    // GAP ANALYSIS
    // ============================================================

    _analizarBrecha(nivelActual, nivelAlcanzado, stats, progreso) {
        const indiceActual = this.niveles.indexOf(nivelActual);
        const indiceAlcanzado = this.niveles.indexOf(nivelAlcanzado);
        const nivelesSaltados = this.niveles.slice(indiceActual + 1, indiceAlcanzado + 1);
        
        const brecha = {
            nivelesSaltados: nivelesSaltados,
            areasDebiles: [],
            areasFuertes: [],
            recomendaciones: [],
            resumen: ''
        };

        const palabras = progreso.filter(p => p.rcn < 1.5 && p.repasosFallidos > 2);
        if (palabras.length > 0) {
            brecha.areasDebiles.push(`Tienes ${palabras.length} frases con RCN bajo (${palabras.length > 3 ? 'necesitas reforzarlas' : 'pocas, bien!'})`);
        }

        const fuertes = progreso.filter(p => p.rcn >= 3.5 && p.repasosExitosos > 3);
        if (fuertes.length > 0) {
            brecha.areasFuertes.push(`${fuertes.length} frases dominadas completamente`);
        }

        if (palabras.length > 5) {
            brecha.recomendaciones.push('📖 Revisa las frases con RCN bajo antes de avanzar');
        }
        if (stats.eficiencia < 50) {
            brecha.recomendaciones.push('🎯 Practica más para mejorar tu eficiencia');
        }
        if (nivelesSaltados.length > 1) {
            brecha.recomendaciones.push(`🚀 Has saltado ${nivelesSaltados.length - 1} niveles, considera repasar conceptos intermedios`);
        }

        brecha.resumen = `De ${nivelActual} a ${nivelAlcanzado}: `;
        if (brecha.areasDebiles.length === 0 && brecha.areasFuertes.length > 0) {
            brecha.resumen += '✅ Excelente progreso, sin áreas débiles detectadas.';
        } else if (brecha.areasDebiles.length > 0) {
            brecha.resumen += `⚠️ ${brecha.areasDebiles.length} áreas a reforzar.`;
        } else {
            brecha.resumen += '📊 Progreso equilibrado.';
        }

        return brecha;
    }

    // ============================================================
    // PLAN DE ESTUDIO PERSONALIZADO
    // ============================================================

    async _ofrecerPlanEstudio(idioma, nivel, resultado) {
        const areasDebiles = resultado.respuestas
            .filter(r => !r.correcto)
            .map(r => r.tipo);
        
        if (areasDebiles.length === 0) return;
        
        const plan = {
            areas: [...new Set(areasDebiles)],
            recomendaciones: [],
            temas: [],
            duracion: '1 semana'
        };
        
        for (const area of plan.areas) {
            plan.recomendaciones.push(this._getRecomendacionArea(area));
            plan.temas.push(this._getTemaSugerido(area, nivel));
        }
        
        if (typeof window.uiCore !== 'undefined') {
            const aceptar = await window.uiCore.confirm(
                `📚 **Plan de estudio personalizado**\n\n` +
                `Basado en tu examen, necesitas reforzar:\n` +
                plan.areas.map(a => `• ${a}`).join('\n') + '\n\n' +
                `📖 **Recomendaciones:**\n` +
                plan.recomendaciones.map(r => `• ${r}`).join('\n') + '\n\n' +
                `📂 **Temas sugeridos:**\n` +
                plan.temas.map(t => `• ${t}`).join('\n') + '\n\n' +
                `⏱️ Duración estimada: ${plan.duracion}\n\n` +
                `¿Quieres que prepare estos temas para ti?`,
                '📚 Plan de Estudio'
            );
            
            if (aceptar) {
                await this._generarTemasPlan(plan.temas, idioma, nivel);
                window.uiCore.mostrarToast('✅ Plan de estudio generado. Revisa la sección Temas.', 'success');
            }
        }
    }

    _getRecomendacionArea(area) {
        const recomendaciones = {
            'traduccion': 'Practica traducciones inversas diarias (5-10 frases)',
            'completar': 'Refuerza vocabulario en contexto con ejercicios de cloze',
            'multiple': 'Trabaja en distinguir matices entre opciones similares',
            'ordenar': 'Practica estructura de oraciones con ejercicios de reordenamiento'
        };
        return recomendaciones[area] || 'Practica más en esta área';
    }

    _getTemaSugerido(area, nivel) {
        const temas = {
            'traduccion': `Traducción inversa (${nivel})`,
            'completar': `Vocabulario en contexto (${nivel})`,
            'multiple': `Comprensión de matices (${nivel})`,
            'ordenar': `Estructura de oraciones (${nivel})`
        };
        return temas[area] || `Práctica de ${area} (${nivel})`;
    }

    async _generarTemasPlan(temas, idioma, nivel) {
        for (const tema of temas) {
            if (window.vigia && window.vigia.enLinea) {
                try {
                    const json = await window.vigia.generarJSON(tema, 2, idioma);
                    if (json && json.historias) {
                        const temaObj = {
                            nombre: tema,
                            descripcion: `Plan de estudio personalizado - Nivel ${nivel}`,
                            idioma: idioma,
                            nivel: nivel,
                            icono: '📚',
                            fechaCreacion: new Date().toISOString(),
                            estado: 'en_curso',
                            historiasIds: [],
                            palabrasClave: []
                        };
                        await db.guardarTema(temaObj);
                    }
                } catch (e) {
                    console.warn('⚠️ Error generando tema plan:', e);
                }
            }
        }
    }

    // ============================================================
    // BONUS DE EXPERIENCIA
    // ============================================================

    async _aplicarBonusExperiencia(usuarioId, multiplicador) {
        try {
            const progreso = await db.obtenerTodoProgreso();
            const bonus = {
                aplicado: Date.now(),
                multiplicador: multiplicador,
                frasesAfectadas: 0
            };
            
            const recientes = progreso
                .sort((a, b) => b.ultimoRepaso - a.ultimoRepaso)
                .slice(0, 10);
            
            for (const p of recientes) {
                p.rcn = Math.min(5, (p.rcn || 0) * multiplicador);
                await db.guardarProgreso(p);
                bonus.frasesAfectadas++;
            }
            
            const usuario = await db.getUsuario();
            if (usuario) {
                const config = await db.getConfiguracionUsuario(usuario.id) || { usuarioId: usuario.id };
                config.bonus = config.bonus || [];
                config.bonus.push(bonus);
                await db.guardarConfiguracionUsuario(config);
            }
            
            console.log(`🎁 Bonus ${multiplicador}x aplicado a ${bonus.frasesAfectadas} frases`);
            return bonus;
            
        } catch (error) {
            console.warn('⚠️ Error aplicando bonus:', error);
            return null;
        }
    }

    // ============================================================
    // CAMBIO MANUAL DE NIVEL
    // ============================================================

    async cambiarNivelManual(usuarioId, idioma, nuevoNivel, motivo = 'manual') {
        console.log('📊 Cambio manual de nivel a:', nuevoNivel);
        
        try {
            if (!this.niveles.includes(nuevoNivel)) {
                throw new Error('Nivel inválido: ' + nuevoNivel);
            }
            
            const usuario = await db.getUsuario();
            const nivelActual = usuario?.idiomasObjetivo?.find(i => i.idioma === idioma)?.nivel || 'A1';
            
            if (nuevoNivel === nivelActual) {
                if (typeof window.uiCore !== 'undefined') {
                    window.uiCore.mostrarToast('📌 Ya estás en nivel ' + nuevoNivel, 'info');
                }
                return { nivelAnterior: nivelActual, nivelNuevo: nuevoNivel, cambiado: false };
            }
            
            await this._guardarHistorialNivel({
                usuarioId: usuarioId,
                idioma: idioma,
                nivelAnterior: nivelActual,
                nivelNuevo: nuevoNivel,
                fecha: Date.now(),
                motivo: motivo
            });
            
            await this._actualizarNivelUsuario(usuarioId, idioma, nuevoNivel);
            
            window.dispatchEvent(new CustomEvent('cambioNivelManual', {
                detail: { 
                    nivelAnterior: nivelActual, 
                    nivelNuevo: nuevoNivel, 
                    usuarioId, 
                    idioma
                }
            }));
            
            if (typeof window.uiCore !== 'undefined') {
                window.uiCore.mostrarToast('📊 Nivel cambiado a ' + nuevoNivel, 'success');
                if (window.UIConfig) window.UIConfig._actualizarNivelHeader();
            }
            
            return { nivelAnterior: nivelActual, nivelNuevo: nuevoNivel, cambiado: true };
            
        } catch (error) {
            console.error('❌ Error cambiando nivel:', error);
            if (typeof window.uiCore !== 'undefined') {
                window.uiCore.mostrarToast('❌ Error: ' + error.message, 'error');
            }
            return null;
        }
    }

    // ============================================================
    // OBTENER ESTADO DE NIVEL
    // ============================================================

    async obtenerEstadoNivel(usuarioId, idioma) {
        try {
            const usuario = await db.getUsuario();
            const nivelActual = usuario?.idiomasObjetivo?.find(i => i.idioma === idioma)?.nivel || 'A1';
            const stats = await db.obtenerEstadisticasNeuro();
            const progreso = await db.obtenerTodoProgreso();
            
            const indice = this.niveles.indexOf(nivelActual);
            const siguiente = indice < this.niveles.length - 1 ? this.niveles[indice + 1] : null;
            const umbral = siguiente ? this.umbrales[siguiente] : null;
            
            const frasesCompletadas = progreso.filter(p => p.estado === 'completada').length;
            
            return {
                nivelActual: nivelActual,
                siguienteNivel: siguiente,
                progresoAlSiguiente: umbral ? {
                    rcn: Math.min(100, Math.round((stats.rcnPromedio / umbral.rcnMinimo) * 100)),
                    frases: Math.min(100, Math.round((frasesCompletadas / umbral.frasesCompletadas) * 100)),
                    eficiencia: Math.min(100, Math.round((stats.eficiencia / umbral.eficienciaMinima) * 100))
                } : null,
                puedeSubir: umbral ? 
                    stats.rcnPromedio >= umbral.rcnMinimo &&
                    frasesCompletadas >= umbral.frasesCompletadas &&
                    stats.eficiencia >= umbral.eficienciaMinima : false,
                gapAnalysis: null,
                umbralesActuales: this.umbrales
            };
        } catch (error) {
            console.error('❌ Error obteniendo estado:', error);
            return { 
                nivelActual: 'A1', 
                siguienteNivel: null, 
                progresoAlSiguiente: null, 
                puedeSubir: false,
                gapAnalysis: null
            };
        }
    }

    // ============================================================
    // MÉTODOS AUXILIARES
    // ============================================================

    async _actualizarNivelUsuario(usuarioId, idioma, nuevoNivel) {
        const usuario = await db.getUsuario();
        if (!usuario) return false;
        
        if (!usuario.idiomasObjetivo) usuario.idiomasObjetivo = [];
        const idx = usuario.idiomasObjetivo.findIndex(i => i.idioma === idioma);
        if (idx >= 0) {
            usuario.idiomasObjetivo[idx].nivel = nuevoNivel;
        } else {
            usuario.idiomasObjetivo.push({ idioma: idioma, nivel: nuevoNivel });
        }
        await db.guardarUsuario(usuario);
        
        try {
            const usuarioLocal = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
            if (usuarioLocal.idiomasObjetivo) {
                const idxLocal = usuarioLocal.idiomasObjetivo.findIndex(i => i.idioma === idioma);
                if (idxLocal >= 0) {
                    usuarioLocal.idiomasObjetivo[idxLocal].nivel = nuevoNivel;
                }
                localStorage.setItem('pipeline_usuario', JSON.stringify(usuarioLocal));
            }
        } catch (e) {}
        
        if (window.pipeline) {
            window.pipeline.nivel = nuevoNivel;
        }
        
        return true;
    }

    async _calcularRacha(progreso) {
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
        return racha;
    }

    async _generarRecomendacionesExamen(resultado) {
        const areasDebiles = resultado.respuestas
            .filter(r => !r.correcto)
            .map(r => r.tipo);
        
        if (areasDebiles.length === 0) return '¡Perfecto!';
        
        const recomendaciones = {
            'traduccion': 'Practica más traducciones inversas',
            'completar': 'Refuerza el vocabulario en contexto',
            'multiple': 'Trabaja en distinguir opciones similares',
            'ordenar': 'Practica la estructura de oraciones'
        };
        
        const areas = [...new Set(areasDebiles)];
        return 'Enfócate en: ' + areas.map(a => recomendaciones[a] || a).join(', ');
    }

    async _guardarEvaluacion(evaluacion) {
        try {
            await db.add('evaluaciones', evaluacion);
        } catch (e) {
            console.warn('⚠️ No se pudo guardar evaluación:', e);
        }
    }

    async _guardarExamen(examen) {
        try {
            await db.add('examenes', examen);
        } catch (e) {
            console.warn('⚠️ No se pudo guardar examen:', e);
        }
    }

    async _guardarHistorialNivel(historial) {
        try {
            await db.add('historialNiveles', historial);
        } catch (e) {
            console.warn('⚠️ No se pudo guardar historial:', e);
        }
    }
}

const gestorNiveles = new GestorNiveles();
console.log('✅ Gestor de Niveles v1.5 cargado');