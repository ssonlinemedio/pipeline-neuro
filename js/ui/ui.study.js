// ============================================================
// UI STUDY v24.2 - CONTROL DE TRANSCRIPCIÓN FONÉTICA
// ============================================================

(function() {
    'use strict';
    
    if (window.UIStudy && window.UIStudy._version === '24.2') {
        console.log('⚠️ UIStudy ya está cargado, saltando...');
        return;
    }

    class UIStudy {
        constructor() {
            this._version = '24.2';
            this._modoEstudio = 'flashcard';
            this._pistaActual = '';
            this._opcionesMultiple = [];
            this._mostrandoRespuesta = false;
            this._ultimaRespuesta = null;
            this._confianza = 0.5;
            this.GRUPO_USUARIO = '📌 Seleccionadas por Usuario';
            this._metodoValidacion = 'offline';
            this._renderizando = false;
            this._guardandoIndice = false;
            this._generandoOpciones = false;
            this._IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
            this._idiomaNativo = 'es';
            this._cacheTranscripciones = {};

            // Control global de la visibilidad de cualquier transcripción fonética.
            try {
                const mostrarTranscripcionGuardado = localStorage.getItem('uiStudy_mostrarTranscripcion');
                this._mostrarPinyin = mostrarTranscripcionGuardado === null
                    ? true
                    : mostrarTranscripcionGuardado === 'true';
            } catch (e) {
                this._mostrarPinyin = true;
            }
            
            this._modoVista = 'frase';
            this._historiaActual = [];
            this._historiaTitulo = '';
            this._historiaIdActual = null;
            this._libroAbierto = false;
            this._generandoFrases = false;
            this._cerrandoLibro = false;
            this._frasesGeneradas = [];
            this._frasesTraducidas = {};
            this._frasesGuardadas = {};
            this._traduciendoFrase = false;
            this._historiasLeidas = new Set();
            
            this._temaFinalizado = false;
            this._temaCompletadoCallback = null;
            this._verificandoProgreso = false;
            this._progresoMostrado = 0;
            this._temaIdDesdeLibro = null;
            this._temaIdDesdeHistoria = null;
            this._estudiandoTemaDesdeLibro = false;
            this._origenHistoriaActual = null;
            
            this._renderTimeout = null;
            this._palabrasCache = {};
            this._enlaceIntentos = 0;
            this._maxEnlaceIntentos = 5;
            this._eventosEnlazados = false;
            
            this._palabraModalActual = null;
            this._modalAvanzadoAbierto = false;
            
            this._origenAccion = null;
            
            // 🔥 CONTROL DE PROGRESO
            this._ultimaActualizacionProgreso = 0;
            this._progresoRecargado = false;
            
            // 🔥 REFERENCIA A SÍ MISMO PARA EVENTOS
            this._self = this;
        }

        // ============================================================
        // MÉTODO PÚBLICO PARA CAMBIAR MODO DE ESTUDIO
        // ============================================================

        cambiarModoEstudio(modo) {
            try {
                if (!modo) return;
                this._modoEstudio = modo;
                this._resetearEstadoFrase();
                
                // Actualizar botones visualmente
                document.querySelectorAll('.modo-btn').forEach(btn => {
                    const isActive = btn.dataset.modo === modo;
                    btn.classList.toggle('active', isActive);
                    btn.style.background = isActive ? 'var(--primary)' : 'var(--bg)';
                    btn.style.color = isActive ? 'white' : 'var(--gray)';
                    btn.style.borderColor = isActive ? 'var(--primary)' : 'var(--light)';
                    btn.style.boxShadow = isActive ? '0 2px 12px rgba(108,92,231,0.3)' : 'none';
                });
                
                if (this.core) {
                    this.core.mostrarToast('🔄 Modo: ' + this._getModoNombre(modo), 'info');
                }
                
                // Re-renderizar si hay frase activa
                if (pipeline && pipeline.fraseActual && this._modoVista === 'frase') {
                    this._renderizarFraseInteractiva();
                }
            } catch (e) {
                console.warn('⚠️ Error cambiando modo:', e);
            }
        }

        _getModoNombre(modo) {
            const nombres = { 
                'flashcard': 'Flashcard', 
                'escritura': 'Escritura', 
                'multiple': 'Opción Múltiple', 
                'escucha': 'Escucha' 
            };
            return nombres[modo] || modo;
        }

        _resetearEstadoFrase() {
            this._mostrandoRespuesta = false;
            this._ultimaRespuesta = null;
            this._pistaActual = '';
            this._opcionesMultiple = [];
            this._metodoValidacion = 'offline';
        }

        // ============================================================
        // MOSTRAR / OCULTAR TRANSCRIPCIÓN FONÉTICA
        // ============================================================

        _toggleMostrarPinyin(mostrar) {
            this._mostrarPinyin = !!mostrar;

            try {
                localStorage.setItem(
                    'uiStudy_mostrarTranscripcion',
                    String(this._mostrarPinyin)
                );
            } catch (e) {}

            // Redibujar la frase actual inmediatamente.
            if (typeof this._renderizarFraseInteractiva === 'function') {
                this._renderizarFraseInteractiva();
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

        _getColorFiabilidad(fiabilidad) {
            if (fiabilidad >= 80) return '#6C5CE7';
            if (fiabilidad >= 60) return '#00B894';
            if (fiabilidad >= 40) return '#FDCB6E';
            if (fiabilidad >= 20) return '#E17055';
            return '#FF7675';
        }

        _getColorFamiliaSemantica(familia) {
            const colores = {
                'Transporte': '#0984E3',
                'Comida y Bebida': '#E17055',
                'Familia': '#6C5CE7',
                'Casa y Hogar': '#00CEC9',
                'Ropa': '#FD79A8',
                'Animales': '#00B894',
                'Naturaleza': '#55EFC4',
                'Tiempo y Clima': '#74B9FF',
                'Salud': '#FF7675',
                'Trabajo': '#636E72',
                'Educación': '#A29BFE',
                'Deportes': '#FDCB6E',
                'Arte': '#E17055',
                'Música': '#FD79A8',
                'Tecnología': '#0984E3',
                'Viajes': '#00CEC9',
                'Compras': '#FDCB6E',
                'Comunicación': '#74B9FF',
                'Emociones': '#FF7675',
                'Rutina': '#636E72',
                'Ciudad': '#00B894',
                'Cultura': '#6C5CE7',
                'Historia': '#E17055',
                'Ciencia': '#0984E3',
                'General': '#636E72'
            };
            return colores[familia] || '#636E72';
        }

        _getColorFamiliaGramatical(familia) {
            const colores = {
                'sustantivo': '#6C5CE7',
                'verbo': '#00B894',
                'adjetivo': '#FDCB6E',
                'adverbio': '#74B9FF',
                'preposición': '#FF7675',
                'conjunción': '#A29BFE',
                'pronombre': '#55EFC4',
                'determinante': '#0984E3',
                'interjección': '#E17055',
                'numeral': '#00CEC9',
                'clasificador': '#636E72',
                'partícula': '#636E72',
                'expresión': '#FDCB6E',
                'conector': '#74B9FF'
            };
            return colores[familia] || '#6C5CE7';
        }

        // ============================================================
        // OBTENER IDIOMA NATIVO
        // ============================================================

        async _obtenerIdiomaNativo() {
            try {
                const usuario = await db.getUsuario();
                if (usuario?.idiomaNativo) {
                    this._idiomaNativo = usuario.idiomaNativo;
                    return this._idiomaNativo;
                }
                const localData = localStorage.getItem('pipeline_usuario');
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (parsed?.idiomaNativo) {
                        this._idiomaNativo = parsed.idiomaNativo;
                        return this._idiomaNativo;
                    }
                }
                return 'es';
            } catch (e) {
                return 'es';
            }
        }

        // ============================================================
        // OBTENER TRANSCRIPCIÓN
        // ============================================================

        async _obtenerTranscripcionFrase(frase) {
            if (!frase) return '';
            try {
                const idioma = frase.idioma || pipeline.idiomaObjetivo || 'es';
                const esJeroglifico = this._esJeroglifico(idioma);
                if (esJeroglifico) {
                    return frase.pinyinCompleto || frase.segmentacion?.pinyin || '';
                }
                return frase.transcripcion || '';
            } catch (e) {
                return '';
            }
        }

        async _obtenerTranscripcionPalabra(palabra) {
            if (!palabra) return '';
            try {
                const idioma = palabra.idioma || pipeline.idiomaObjetivo || 'es';
                const esJeroglifico = this._esJeroglifico(idioma);
                if (esJeroglifico) {
                    return palabra.pinyin || '';
                }
                return palabra.transcripcion || '';
            } catch (e) {
                return '';
            }
        }

        // ============================================================
        // FORMATEAR HANZI POR UNIDADES SEMÁNTICAS
        // ============================================================

        _formatearHanziSegmentado(frase) {
            if (!frase) return '';

            const idioma = frase.idioma || pipeline?.idiomaObjetivo || 'es';
            const esJeroglifico = this._esJeroglifico(idioma);
            const original = frase.segmentacion?.hanzi || frase.original || '';

            if (!esJeroglifico) return original;

            // La fuente ideal son las palabras/unidades semánticas ya generadas.
            const palabras = Array.isArray(frase.palabras) ? frase.palabras : [];
            if (!palabras.length) return original;

            const unidades = palabras.map(p => {
                if (typeof p === 'string') return p.trim();
                return String(p?.hanzi || p?.palabra || '').trim();
            }).filter(Boolean);

            if (!unidades.length) return original;

            // Separamos las unidades con un espacio visual, pero pegamos
            // la puntuación a la unidad anterior: 我 喜欢 这个 咖啡馆。
            const resultado = [];
            const puntuacion = /^[，。！？；：、,.!?;:）》）】』」”’]+$/;

            for (const unidad of unidades) {
                if (puntuacion.test(unidad) && resultado.length) {
                    resultado[resultado.length - 1] += unidad;
                } else {
                    resultado.push(unidad);
                }
            }

            return resultado.map((unidad, i) => {
                const esPuntuacion = /^[，。！？；：、,.!?;:）》）】』」”’]+$/.test(unidad);
                return `<span style="display:inline-block;margin-right:${i < resultado.length - 1 && !esPuntuacion ? '0.28em' : '0'};">${unidad}</span>`;
            }).join('');
        }

        // ============================================================
        // RENDERIZAR TRANSCRIPCIÓN
        // ============================================================

        _renderizarTranscripcion(transcripcion, esJeroglifico = false) {
            if (!transcripcion) return '';
            const icono = esJeroglifico ? '🔊' : '🎤';
            const bg = esJeroglifico ? 'var(--primary)08' : 'var(--secondary)08';
            const border = esJeroglifico ? 'var(--primary)30' : 'var(--secondary)30';
            const color = esJeroglifico ? 'var(--primary)' : 'var(--secondary)';
            return `
                <div style="
                    font-size: 15px;
                    color: ${color};
                    margin-top: 4px;
                    letter-spacing: 1px;
                    font-weight: 500;
                    padding: 4px 14px;
                    background: ${bg};
                    border-radius: 8px;
                    display: inline-block;
                    border: 1px solid ${border};
                    font-family: var(--font);
                ">
                    ${icono} ${transcripcion}
                </div>
            `;
        }

        // ============================================================
        // INICIALIZACIÓN
        // ============================================================

        async init(core) {
            this.core = core;
            await this._obtenerIdiomaNativo();
            this._cargarHistoriasLeidas();
            return this;
        }

        // ============================================================
        // GESTIÓN DE HISTORIAS LEÍDAS
        // ============================================================

        _cargarHistoriasLeidas() {
            try {
                const data = localStorage.getItem('pipeline_historias_leidas');
                if (data) {
                    this._historiasLeidas = new Set(JSON.parse(data));
                    console.log(`📚 ${this._historiasLeidas.size} historias leídas cargadas`);
                }
            } catch (e) {
                this._historiasLeidas = new Set();
            }
        }

        _guardarHistoriasLeidas() {
            try {
                localStorage.setItem('pipeline_historias_leidas', JSON.stringify(Array.from(this._historiasLeidas)));
            } catch (e) {}
        }

        async _toggleHistoriaLeida(historiaId, checked) {
            if (!historiaId) return;
            try {
                if (checked) this._historiasLeidas.add(historiaId);
                else this._historiasLeidas.delete(historiaId);
                this._guardarHistoriasLeidas();
                this._actualizarContadorHistoriasLeidas();
                this.core?.mostrarToast(
                    checked ? '✅ Historia marcada como leída' : '↩️ Historia desmarcada como leída',
                    checked ? 'success' : 'info'
                );
            } catch (e) {
                console.warn('⚠️ Error toggling historia leída:', e);
            }
        }

        _actualizarTarjetaHistoria(historiaId, checked) {
            try {
                const tarjeta = document.querySelector(`.historia-card[data-historia-id="${historiaId}"]`);
                if (!tarjeta) return;
                const badge = tarjeta.querySelector('.historia-leida-badge');
                const checkbox = tarjeta.querySelector('.historia-checkbox-input');
                if (checkbox) checkbox.checked = checked;
                if (badge) {
                    badge.innerHTML = checked ? '✅ Leída' : '📖 No leída';
                    badge.style.background = checked ? 'var(--success)' : 'var(--gray-light)';
                    badge.style.color = checked ? 'white' : 'var(--gray)';
                }
                if (checked) {
                    tarjeta.style.borderLeft = '4px solid var(--success)';
                    tarjeta.style.background = 'rgba(0, 184, 148, 0.05)';
                } else {
                    tarjeta.style.borderLeft = '4px solid var(--light)';
                    tarjeta.style.background = 'var(--white)';
                }
                const leidaTag = tarjeta.querySelector('.historia-leida-tag');
                if (leidaTag) leidaTag.style.display = checked ? 'inline-block' : 'none';
            } catch (e) {}
        }

        _actualizarContadorHistoriasLeidas() {
            try {
                const container = document.getElementById('cardContainer');
                if (!container) return;
                const contador = container.querySelector('.historias-leidas-contador');
                if (contador) contador.textContent = `${this._historiasLeidas.size} leídas`;
                const todasLasHistorias = container.querySelectorAll('.historia-card');
                const total = todasLasHistorias.length;
                const leidas = this._historiasLeidas.size;
                const pct = total > 0 ? Math.round((leidas / total) * 100) : 0;
                const barra = container.querySelector('.historias-leidas-progreso');
                if (barra) barra.style.width = pct + '%';
                const pctText = container.querySelector('.historias-leidas-porcentaje');
                if (pctText) pctText.textContent = `${pct}%`;
            } catch (e) {}
        }

        // ============================================================
        // CARGA PRINCIPAL - SIN BOTÓN LIBRO DE LECTURA
        // ============================================================

        cargar(core) {
            this.core = core;
            this._temaFinalizado = false;
            this._verificandoProgreso = false;
            this._progresoMostrado = 0;
            this._estudiandoTemaDesdeLibro = false;
            this._eventosEnlazados = false;
            this._enlaceIntentos = 0;
            this._origenHistoriaActual = null;
            this._progresoRecargado = false;
            this._ultimaActualizacionProgreso = 0;
            
            if (pipeline._estudiandoHistoria && pipeline._historiaIdActual) {
                console.log(`📖 Cargando historia específica: ${pipeline._historiaIdActual}`);
                this._origenHistoriaActual = pipeline.getOrigenHistoriaActual ? pipeline.getOrigenHistoriaActual() : null;
                console.log(`   📌 Origen de la historia: ${this._origenHistoriaActual || 'desconocido'}`);
            }
            
            if (pipeline._estudiandoTema && pipeline._temaActual) {
                try {
                    const frases = pipeline.frases || [];
                    if (frases.length > 0) {
                        const completadas = frases.filter(f => {
                            const prog = f.progreso || {};
                            return prog.estado === 'completada' || (prog.rcn || 0) >= 4;
                        }).length;
                        const progreso = Math.round((completadas / frases.length) * 100);
                        this._progresoMostrado = progreso;
                        
                        if (progreso >= 100) {
                            if (this._origenHistoriaActual === 'elipse') {
                                this.core?.mostrarToast('🌊 Onda completada. Volviendo al Modo Elipse...', 'info');
                                setTimeout(() => {
                                    if (window._volverAlModoElipse) {
                                        window._volverAlModoElipse('🌊 Onda ya completada. Volviendo al Modo Elipse');
                                    }
                                }, 1500);
                                return;
                            } else if (this._origenHistoriaActual === 'cruzada') {
                                this.core?.mostrarToast('🌊 Onda Cruzada completada. Volviendo al Modo Ondas Cruzadas...', 'info');
                                setTimeout(() => {
                                    if (window._volverAlModoOndasCruzadas) {
                                        window._volverAlModoOndasCruzadas('🌊 Onda Cruzada completada. Volviendo al Modo Ondas Cruzadas');
                                    }
                                }, 1500);
                                return;
                            } else if (this._origenHistoriaActual === 'tonos') {
                                this.core?.mostrarToast('🎵 Historia tonal completada. Volviendo al Estudio de Tonos...', 'info');
                                setTimeout(() => {
                                    if (window._volverAlModoTonos) {
                                        window._volverAlModoTonos('🎵 Historia tonal completada. Volviendo al Estudio de Tonos');
                                    }
                                }, 1500);
                                return;
                            } else {
                                this.core?.mostrarToast('📖 Esta historia ya está completada. Volviendo a Temas...', 'info');
                                setTimeout(() => {
                                    this._salirDeHistoria();
                                }, 1500);
                                return;
                            }
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Error verificando tema al cargar:', e);
                }
            }
            
            try {
                if (pipeline && pipeline.frases && pipeline.frases.length > 0) {
                    if (pipeline.fraseActual) {
                        if (this._modoVista === 'libro' && !this._cerrandoLibro) {
                            this._modoVista = 'frase';
                            this._renderizarFraseInteractiva();
                        } else if (this._modoVista === 'historia_completa') {
                            this._renderizarHistoriaCompletaDesdeLibro();
                        } else {
                            this._modoVista = 'frase';
                            this._renderizarFraseInteractiva();
                        }
                    } else {
                        pipeline.cargarFrase(0);
                    }
                } else {
                    this.mostrarPantallaInicio();
                }
            } catch (e) {
                console.error('❌ Error en cargar:', e);
                this.mostrarPantallaInicio();
            }
        }

        // ============================================================
        // GUARDAR ÍNDICE DE ESTUDIO
        // ============================================================

        async _guardarIndiceEstudio() {
            if (this._guardandoIndice) return;
            this._guardandoIndice = true;
            try {
                if (pipeline && pipeline.indiceFrase !== undefined && pipeline.idiomaObjetivo) {
                    await db.guardarUltimoIndiceEstudio(pipeline.idiomaObjetivo, pipeline.indiceFrase);
                }
            } catch (e) {}
            finally { this._guardandoIndice = false; }
        }

        // ============================================================
        // VERIFICAR PROGRESO DEL TEMA - CORREGIDO CON DETECCIÓN DE "TONOS"
        // ============================================================

        async _verificarProgresoTema() {
            if (this._verificandoProgreso) return;
            if (this._temaFinalizado) return;
            
            if (!pipeline._estudiandoTema && !pipeline._estudiandoHistoria) return;
            if (!pipeline._temaActual && !pipeline._historiaIdActual) return;

            this._verificandoProgreso = true;
            try {
                await this._recargarProgresoCompleto();
                
                const frases = pipeline.frases || [];
                if (frases.length === 0) { this._verificandoProgreso = false; return; }
                
                const completadas = frases.filter(f => {
                    const prog = f.progreso || {};
                    return prog.estado === 'completada' || (prog.rcn || 0) >= 4;
                }).length;
                
                const progreso = Math.round((completadas / frases.length) * 100);
                this._progresoMostrado = progreso;
                
                console.log(`📊 Progreso de la historia: ${progreso}% (${completadas}/${frases.length})`);
                console.log(`   📌 Origen de la historia: ${this._origenHistoriaActual || 'desconocido'}`);
                
                if (pipeline._historiaIdActual && progreso >= 100) {
                    await this._actualizarHistoriaIndividual(pipeline._historiaIdActual);
                }
                
                if (progreso >= 100) {
                    console.log('🎯 Historia completada al 100%!');
                    
                    const origen = this._origenHistoriaActual || pipeline.getOrigenHistoriaActual ? pipeline.getOrigenHistoriaActual() : 'tema';
                    console.log(`   🔥 Origen detectado: ${origen}`);
                    
                    // 🔥 DETECTAR SI VIENE DE TONOS
                    let esTono = false;
                    try {
                        const historia = await db.get('historias', pipeline._historiaIdActual);
                        if (historia && historia._esTono === true) {
                            esTono = true;
                            console.log(`🎵 La historia ${pipeline._historiaIdActual} es una Historia Tonal (directo de DB)`);
                        }
                    } catch (e) {
                        console.warn('⚠️ Error verificando si es tonal:', e);
                    }
                    
                    // 🔥 DETECTAR SI VIENE DE CRUZADA
                    let esCruzada = false;
                    try {
                        const historia = await db.get('historias', pipeline._historiaIdActual);
                        if (historia && historia._esOndaCruzada === true) {
                            esCruzada = true;
                            console.log(`🌊 La historia ${pipeline._historiaIdActual} es una Onda Cruzada (directo de DB)`);
                        }
                    } catch (e) {
                        console.warn('⚠️ Error verificando si es cruzada:', e);
                    }
                    
                    const origenFinal = esTono ? 'tonos' : (esCruzada ? 'cruzada' : origen);
                    console.log(`   📌 Origen final: ${origenFinal}`);
                    
                    if (origenFinal === 'elipse' && pipeline._historiaIdActual) {
                        window.dispatchEvent(new CustomEvent('elipseOndaCompletada', {
                            detail: {
                                historiaId: pipeline._historiaIdActual,
                                temaId: pipeline._temaActual,
                                progreso: progreso,
                                completadas: completadas,
                                total: frases.length
                            }
                        }));
                    }
                    
                    if (origenFinal === 'tema') {
                        await this._actualizarTemaYDispararEvento();
                    }
                    
                    await this._mostrarModalHistoriaCompletada(pipeline._historiaIdActual, origenFinal);
                    
                    this._temaFinalizado = true;
                    
                    if (origenFinal === 'elipse' && window._volverAlModoElipse) {
                        setTimeout(() => {
                            window._volverAlModoElipse('🌌 Historia completada. Volviendo al Modo Elipse');
                        }, 2500);
                        return;
                    } else if (origenFinal === 'cruzada' && window._volverAlModoOndasCruzadas) {
                        setTimeout(() => {
                            window._volverAlModoOndasCruzadas('🌊 Onda Cruzada completada. Volviendo al Modo Ondas Cruzadas');
                        }, 2500);
                        return;
                    } else if (origenFinal === 'tonos' && window._volverAlModoTonos) {
                        setTimeout(() => {
                            window._volverAlModoTonos('🎵 Historia completada. Volviendo al Estudio de Tonos');
                        }, 2500);
                        return;
                    } else {
                        setTimeout(() => {
                            this._salirDeHistoria();
                        }, 2500);
                        return;
                    }
                }
                
                this._actualizarProgresoUI(progreso);
                
            } catch (error) {
                console.warn('⚠️ Error verificando progreso:', error);
            } finally {
                this._verificandoProgreso = false;
            }
        }

        // ============================================================
        // RECARGAR PROGRESO COMPLETO
        // ============================================================

        async _recargarProgresoCompleto() {
            try {
                const ahora = Date.now();
                if (ahora - this._ultimaActualizacionProgreso < 2000 && this._progresoRecargado) {
                    console.log('⏳ Progreso recargado recientemente, saltando...');
                    return;
                }
                
                console.log('🔄 Recargando progreso completo desde DB...');
                
                await pipeline.cargarProgreso();
                
                const frases = pipeline.frases || [];
                for (const f of frases) {
                    if (f.id) {
                        const progresoActualizado = await db.obtenerProgreso(f.id);
                        if (progresoActualizado) {
                            f.progreso = progresoActualizado;
                        }
                    }
                }
                
                if (pipeline.fraseActual && pipeline.fraseActual.id) {
                    const progresoActualizado = await db.obtenerProgreso(pipeline.fraseActual.id);
                    if (progresoActualizado) {
                        pipeline.fraseActual.progreso = progresoActualizado;
                        pipeline.faseActual = progresoActualizado.fase || 1;
                        pipeline.estadoNeuro.rcn = progresoActualizado.rcn || 0;
                        console.log(`   📊 Frase actual: RCN=${pipeline.estadoNeuro.rcn.toFixed(1)}, Fase=${pipeline.faseActual}`);
                    }
                }
                
                if (pipeline._estudiandoTema && pipeline._temaActual) {
                    const tema = await db.obtenerTema(pipeline._temaActual);
                    if (tema) {
                        const historias = await db.obtenerHistoriasPorTema(tema.id);
                        let todasCompletadas = true;
                        let totalFrases = 0;
                        let completadasTotal = 0;
                        
                        for (const h of historias) {
                            const frasesHistoria = await db.obtenerFrasesPorHistoria(h.id);
                            let completadas = 0;
                            for (const f of frasesHistoria) {
                                totalFrases++;
                                const prog = await db.obtenerProgreso(f.id);
                                if (prog && (prog.estado === 'completada' || prog.rcn >= 4)) {
                                    completadas++;
                                    completadasTotal++;
                                }
                            }
                            if (completadas < frasesHistoria.length && frasesHistoria.length > 0) {
                                todasCompletadas = false;
                            }
                        }
                        
                        if (todasCompletadas && totalFrases > 0 && tema.estado !== 'completado') {
                            console.log(`✅ Todas las historias del tema "${tema.nombre}" completadas. Marcando tema como completado.`);
                            tema.estado = 'completado';
                            tema._completado = true;
                            tema._fechaCompletado = Date.now();
                            await db.update('temas', tema);
                            
                            const idioma = tema.idioma || gestorIdiomas.getIdiomaActivo() || 'es';
                            const temaOriginalId = tema._temaOriginalId || tema.id;
                            window.dispatchEvent(new CustomEvent('temaCompletado', {
                                detail: {
                                    idioma: idioma,
                                    temaId: temaOriginalId,
                                    temaDbId: tema.id,
                                    completado: true,
                                    tema: tema,
                                    origen: 'tema',
                                    totalFrases: totalFrases,
                                    completadas: completadasTotal
                                }
                            }));
                        }
                    }
                }
                
                this._progresoRecargado = true;
                this._ultimaActualizacionProgreso = Date.now();
                console.log('✅ Progreso recargado correctamente');
                
            } catch (error) {
                console.error('❌ Error recargando progreso:', error);
            }
        }

        // ============================================================
        // ACTUALIZAR HISTORIA INDIVIDUAL
        // ============================================================

        async _actualizarHistoriaIndividual(historiaId) {
            try {
                console.log(`🔄 Actualizando estado de historia individual: ${historiaId}`);
                
                const historia = await db.get('historias', historiaId);
                if (!historia) {
                    console.warn(`⚠️ Historia ${historiaId} no encontrada`);
                    return;
                }
                
                const frases = await db.obtenerFrasesPorHistoria(historiaId);
                let todasCompletadas = true;
                for (const f of frases) {
                    const progreso = await db.obtenerProgreso(f.id);
                    if (!progreso || (progreso.estado !== 'completada' && (progreso.rcn || 0) < 4)) {
                        todasCompletadas = false;
                        break;
                    }
                }
                
                if (todasCompletadas && frases.length > 0) {
                    historia.estado = 'completada';
                    historia._completada = true;
                    historia._fechaCompletado = Date.now();
                    await db.update('historias', historia);
                    
                    console.log(`✅ Historia "${historia.titulo}" marcada como completada (${frases.length} frases)`);
                    
                    const idioma = historia.idioma || gestorIdiomas.getIdiomaActivo() || 'es';
                    const temaId = historia.temaId;
                    
                    if (temaId) {
                        const tema = await db.obtenerTema(temaId);
                        const temaOriginalId = tema?._temaOriginalId || temaId;
                        
                        window.dispatchEvent(new CustomEvent('historiaCompletada', {
                            detail: {
                                historiaId: historiaId,
                                historiaTitulo: historia.titulo,
                                temaId: temaId,
                                temaOriginalId: temaOriginalId,
                                idioma: idioma,
                                completado: true
                            }
                        }));
                    }
                }
            } catch (error) {
                console.error('❌ Error actualizando historia individual:', error);
            }
        }

        // ============================================================
        // ACTUALIZAR TEMA Y DISPARAR EVENTO
        // ============================================================

        async _actualizarTemaYDispararEvento() {
            try {
                const temaId = pipeline._temaActual;
                if (!temaId) {
                    console.warn('⚠️ No hay tema actual para actualizar');
                    return;
                }
                
                const tema = await db.obtenerTema(temaId);
                if (!tema) {
                    console.warn(`⚠️ Tema ${temaId} no encontrado`);
                    return;
                }
                
                const historias = await db.obtenerHistoriasPorTema(temaId);
                let todasCompletadas = true;
                let totalFrases = 0;
                let completadasTotal = 0;
                
                for (const h of historias) {
                    const frases = await db.obtenerFrasesPorHistoria(h.id);
                    let completadas = 0;
                    for (const f of frases) {
                        totalFrases++;
                        const progreso = await db.obtenerProgreso(f.id);
                        if (progreso && (progreso.estado === 'completada' || progreso.rcn >= 4)) {
                            completadas++;
                            completadasTotal++;
                        }
                    }
                    if (completadas < frases.length && frases.length > 0) {
                        todasCompletadas = false;
                    }
                }
                
                if (tema.estado === 'completado' || tema._completado === true) {
                    console.log(`ℹ️ Tema "${tema.nombre}" ya está completado`);
                    return;
                }
                
                if (todasCompletadas && totalFrases > 0) {
                    console.log(`✅ Todas las historias del tema "${tema.nombre}" completadas. Marcando tema como completado.`);
                    
                    tema.estado = 'completado';
                    tema._completado = true;
                    tema._fechaCompletado = Date.now();
                    await db.update('temas', tema);
                    
                    const idioma = tema.idioma || gestorIdiomas.getIdiomaActivo() || 'es';
                    const temaOriginalId = tema._temaOriginalId || tema.id;
                    
                    window.dispatchEvent(new CustomEvent('temaCompletado', {
                        detail: {
                            idioma: idioma,
                            temaId: temaOriginalId,
                            temaDbId: tema.id,
                            completado: true,
                            tema: tema,
                            origen: 'tema',
                            totalFrases: totalFrases,
                            completadas: completadasTotal
                        }
                    }));
                    
                    if (this.core) {
                        this.core.mostrarToast(`🎉 ¡Tema "${tema.nombre}" completado al 100%!`, 'success');
                    }
                } else {
                    console.log(`📊 Tema "${tema.nombre}" no completado (${completadasTotal}/${totalFrases} frases)`);
                }
                
            } catch (error) {
                console.error('❌ Error actualizando tema:', error);
            }
        }

        // ============================================================
        // MOSTRAR MODAL DE HISTORIA COMPLETADA - CON SOPORTE PARA "TONOS"
        // ============================================================

        async _mostrarModalHistoriaCompletada(historiaId, origen) {
            try {
                const historia = await db.get('historias', historiaId);
                if (!historia) return;
                
                const esElipse = origen === 'elipse';
                const esCruzada = origen === 'cruzada';
                const esTono = origen === 'tonos';
                const esTema = origen === 'tema';
                
                const frases = await db.obtenerFrasesPorHistoria(historiaId);
                const totalFrases = frases.length;
                let completadas = 0;
                for (const f of frases) {
                    const prog = await db.obtenerProgreso(f.id);
                    if (prog && (prog.estado === 'completada' || prog.rcn >= 4)) {
                        completadas++;
                    }
                }
                
                let titulo = '';
                let icono = '';
                let mensaje = '';
                let botonTexto = '';
                let botonAccion = '';
                let colorBoton = '';
                
                if (esElipse) {
                    titulo = '🌊 ¡Onda Completada!';
                    icono = '🌊';
                    mensaje = `Has completado la onda "${historia.titulo}" en el Modo Elipse.`;
                    botonTexto = '🌌 Volver al Modo Elipse';
                    botonAccion = `window._volverAlModoElipse ? window._volverAlModoElipse('🔄 Volviendo al Modo Elipse') : window.uiCore.irAModulo('elipse')`;
                    colorBoton = 'linear-gradient(135deg, #6C5CE7, #00CEC9)';
                } else if (esCruzada) {
                    titulo = '🌊 ¡Onda Cruzada Completada!';
                    icono = '🌊';
                    mensaje = `Has completado la onda cruzada "${historia.titulo}" en el Modo Ondas Cruzadas.`;
                    botonTexto = '🌊 Volver al Modo Ondas Cruzadas';
                    botonAccion = `window._volverAlModoOndasCruzadas ? window._volverAlModoOndasCruzadas('🔄 Volviendo al Modo Ondas Cruzadas') : window.uiCore.irAModulo('ondasCruzadas')`;
                    colorBoton = 'linear-gradient(135deg, #6C5CE7, #00CEC9)';
                } else if (esTono) {
                    titulo = '🎵 ¡Historia Tonal Completada!';
                    icono = '🎵';
                    mensaje = `Has completado la historia tonal "${historia.titulo}" en el Estudio de Tonos.`;
                    botonTexto = '🎵 Volver al Estudio de Tonos';
                    botonAccion = `window._volverAlModoTonos ? window._volverAlModoTonos('🔄 Volviendo al Estudio de Tonos') : window.uiCore.irAModulo('tonos')`;
                    colorBoton = 'linear-gradient(135deg, #FDCB6E, #E17055)';
                } else {
                    titulo = '📖 ¡Historia Completada!';
                    icono = '📖';
                    mensaje = `Has completado la historia "${historia.titulo}" del tema.`;
                    botonTexto = '📂 Volver a Temas';
                    botonAccion = `window.uiCore.irAModulo('temas')`;
                    colorBoton = 'linear-gradient(135deg, #FDCB6E, #E17055)';
                }
                
                const modalHTML = `
                    <div id="modalHistoriaCompletada" style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.7);
                        backdrop-filter: blur(10px);
                        z-index: 100001;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 20px;
                        animation: fadeIn 0.3s ease;
                    ">
                        <div style="
                            background: var(--white, #ffffff);
                            border-radius: 20px;
                            padding: 30px 35px;
                            max-width: 450px;
                            width: 100%;
                            text-align: center;
                            box-shadow: 0 30px 80px rgba(0,0,0,0.4);
                            animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                        ">
                            <div style="font-size: 64px; margin-bottom: 12px;">${icono}</div>
                            <h2 style="font-size: 24px; font-weight: 800; color: var(--dark); margin-bottom: 8px;">${titulo}</h2>
                            <p style="font-size: 16px; color: var(--gray); margin-bottom: 16px;">${mensaje}</p>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px; padding: 12px; background: var(--bg); border-radius: 12px;">
                                <div>
                                    <div style="font-size: 28px; font-weight: 800; color: var(--success);">${totalFrases}</div>
                                    <div style="font-size: 10px; color: var(--gray); text-transform: uppercase;">Frases</div>
                                </div>
                                <div>
                                    <div style="font-size: 28px; font-weight: 800; color: var(--success);">${completadas}</div>
                                    <div style="font-size: 10px; color: var(--gray); text-transform: uppercase;">Completadas</div>
                                </div>
                                <div>
                                    <div style="font-size: 28px; font-weight: 800; color: var(--success);">100%</div>
                                    <div style="font-size: 10px; color: var(--gray); text-transform: uppercase;">Progreso</div>
                                </div>
                            </div>
                            
                            <div style="background: var(--success)08; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; border: 1px solid var(--success);">
                                <p style="color: var(--success); font-weight: 600; margin: 0;">
                                    ${esElipse ? '🌊 Esta onda se ha sincronizado con el tema.' : 
                                      esCruzada ? '🌊 Esta onda cruzada se ha sincronizado con el tema.' : 
                                      esTono ? '🎵 Esta historia tonal se ha guardado en Mi Espacio.' :
                                      '✅ Historia completada correctamente.'}
                                    ${esTema ? '🎉 El progreso del tema se ha actualizado.' : ''}
                                </p>
                            </div>
                            
                            <button onclick="this.closest('div[style]').remove(); ${botonAccion}" class="btn-primary" style="
                                padding: 12px 30px;
                                font-size: 16px;
                                font-weight: 700;
                                border: none;
                                border-radius: 10px;
                                cursor: pointer;
                                background: ${colorBoton};
                                color: white;
                                transition: all 0.3s;
                            " onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" onmouseout="this.style.transform='none'; this.style.boxShadow='none'">
                                ${botonTexto}
                            </button>
                        </div>
                    </div>
                `;
                
                const modalHTMLTraducido = window.PipelineI18n ? window.PipelineI18n.html(modalHTML) : modalHTML;
                const existing = document.getElementById('modalHistoriaCompletada');
                if (existing) existing.remove();
                
                const container = document.getElementById('cardContainer');
                if (container) {
                    container.insertAdjacentHTML('beforeend', modalHTMLTraducido);
                } else {
                    document.body.insertAdjacentHTML('beforeend', modalHTMLTraducido);
                }
                
                setTimeout(() => {
                    if (esElipse && window.UIClipse) {
                        window.UIClipse.cargar(window.uiCore);
                    }
                    if (esCruzada && window.UIOndasCruzadas) {
                        window.UIOndasCruzadas.cargar(window.uiCore);
                    }
                    if (esTono && window.UITonos) {
                        window.UITonos.cargar(window.uiCore);
                    }
                    if (window.UIDashboard) {
                        window.UIDashboard._cargarDashboardInicial(window.uiCore);
                    }
                    if (window.UITemas) {
                        window.UITemas._renderTemas();
                    }
                }, 1000);
                
            } catch (error) {
                console.error('❌ Error mostrando modal de historia completada:', error);
            }
        }

        // ============================================================
        // SALIR DE HISTORIA
        // ============================================================

        async _salirDeHistoria() {
            console.log('🔙 Saliendo de la historia...');
            
            try {
                const origen = this._origenHistoriaActual || pipeline.getOrigenHistoriaActual ? pipeline.getOrigenHistoriaActual() : 'tema';
                console.log(`   📌 Origen al salir: ${origen}`);
                
                if (pipeline._temaOriginalFrases) {
                    pipeline.frases = pipeline._temaOriginalFrases;
                    pipeline.indiceFrase = pipeline._temaOriginalIndice || 0;
                    pipeline._estudiandoHistoria = false;
                    pipeline._historiaIdActual = null;
                    pipeline._origenHistoria = null;
                    pipeline._temaOriginalFrases = null;
                    pipeline._temaOriginalIndice = 0;
                    await pipeline.cargarFrase(pipeline.indiceFrase);
                } else {
                    const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
                    await pipeline.cargarFrasesPorIdioma(idioma);
                    await pipeline.cargarProgreso();
                    if (pipeline.frases.length > 0) {
                        await pipeline.cargarFrase(0);
                    }
                }
                
                this._temaFinalizado = false;
                this._temaCompletadoCallback = null;
                this._origenHistoriaActual = null;
                
                if (origen === 'elipse') {
                    if (this.core && window._volverAlModoElipse) {
                        window._volverAlModoElipse('🔄 Volviendo al Modo Elipse');
                    } else if (this.core) {
                        this.core.irAModulo('elipse');
                        this.core.mostrarToast('🔄 Volviendo al Modo Elipse', 'info');
                    }
                } else if (origen === 'cruzada') {
                    if (this.core && window._volverAlModoOndasCruzadas) {
                        window._volverAlModoOndasCruzadas('🔄 Volviendo al Modo Ondas Cruzadas');
                    } else if (this.core) {
                        this.core.irAModulo('ondasCruzadas');
                        this.core.mostrarToast('🔄 Volviendo al Modo Ondas Cruzadas', 'info');
                    }
                } else if (origen === 'tonos') {
                    if (this.core && window._volverAlModoTonos) {
                        window._volverAlModoTonos('🔄 Volviendo al Estudio de Tonos');
                    } else if (this.core) {
                        this.core.irAModulo('tonos');
                        this.core.mostrarToast('🔄 Volviendo al Estudio de Tonos', 'info');
                    }
                } else {
                    if (this.core) {
                        this.core.irAModulo('temas');
                        this.core.mostrarToast('🔄 Has salido de la historia. Volviendo a Temas.', 'info');
                        if (window.UITemas) {
                            setTimeout(() => {
                                window.UITemas._renderTemas();
                            }, 300);
                        }
                    }
                }
                
                this._renderizarFraseInteractiva();
                
                if (window.UIDashboard) {
                    window.UIDashboard._cargarDashboardInicial(this.core);
                }
                
            } catch (error) {
                console.error('❌ Error saliendo de la historia:', error);
                this.core?.mostrarToast('❌ Error al salir de la historia', 'error');
            }
        }

        // ============================================================
        // MOSTRAR MODAL DE TEMA COMPLETADO
        // ============================================================

        async _mostrarModalTemaCompletado(tema) {
            if (!tema) return;
            
            const modalHTML = `
                <div id="modalTemaCompletado" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(10px);
                    z-index: 100001;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    animation: fadeIn 0.3s ease;
                ">
                    <div style="
                        background: var(--white, #ffffff);
                        border-radius: 20px;
                        padding: 30px 35px;
                        max-width: 450px;
                        width: 100%;
                        text-align: center;
                        box-shadow: 0 30px 80px rgba(0,0,0,0.4);
                        animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    ">
                        <div style="font-size: 64px; margin-bottom: 12px;">🎉</div>
                        <h2 style="font-size: 24px; font-weight: 800; color: var(--dark); margin-bottom: 8px;">¡Tema Completado!</h2>
                        <p style="font-size: 16px; color: var(--gray); margin-bottom: 16px;">
                            Has completado todas las historias del tema <strong>"${tema.nombre}"</strong>.
                        </p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px; padding: 12px; background: var(--bg); border-radius: 12px;">
                            <div>
                                <div style="font-size: 20px; font-weight: 800; color: var(--success);">${tema.historiasIds?.length || 0}</div>
                                <div style="font-size: 10px; color: var(--gray); text-transform: uppercase;">Historias</div>
                            </div>
                            <div>
                                <div style="font-size: 20px; font-weight: 800; color: var(--success);">${tema.frases || 0}</div>
                                <div style="font-size: 10px; color: var(--gray); text-transform: uppercase;">Frases</div>
                            </div>
                            <div>
                                <div style="font-size: 20px; font-weight: 800; color: var(--success);">100%</div>
                                <div style="font-size: 10px; color: var(--gray); text-transform: uppercase;">Progreso</div>
                            </div>
                        </div>
                        
                        <div style="background: var(--success)08; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; border: 1px solid var(--success);">
                            <p style="color: var(--success); font-weight: 600; margin: 0;">
                                ✅ El tema se ha marcado como completado.
                            </p>
                        </div>
                        
                        <button onclick="this.closest('div[style]').remove(); window.uiCore.irAModulo('temas')" class="btn-primary" style="
                            padding: 12px 30px;
                            font-size: 16px;
                            font-weight: 700;
                            border: none;
                            border-radius: 10px;
                            cursor: pointer;
                            background: linear-gradient(135deg, #6C5CE7, #A29BFE);
                            color: white;
                            transition: all 0.3s;
                        " onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" onmouseout="this.style.transform='none'; this.style.boxShadow='none'">
                            📚 Ir a Temas
                        </button>
                    </div>
                </div>
            `;
            
            const modalHTMLTraducido = window.PipelineI18n ? window.PipelineI18n.html(modalHTML) : modalHTML;
            const existing = document.getElementById('modalTemaCompletado');
            if (existing) existing.remove();
            
            const container = document.getElementById('cardContainer');
            if (container) {
                container.insertAdjacentHTML('beforeend', modalHTMLTraducido);
            } else {
                document.body.insertAdjacentHTML('beforeend', modalHTMLTraducido);
            }
        }

        // ============================================================
        // ACTUALIZAR PROGRESO EN UI
        // ============================================================

        _actualizarProgresoUI(progreso) {
            try {
                const container = document.getElementById('cardContainer');
                if (!container) return;
                
                const barra = container.querySelector('.progress-bar-inline');
                if (barra) {
                    barra.style.width = Math.min(100, progreso) + '%';
                }
                
                const label = container.querySelector('.progress-label-inline');
                if (label) {
                    label.textContent = `${Math.min(100, progreso)}%`;
                }
            } catch (e) {}
        }

        // ============================================================
        // RENDERIZADO PRINCIPAL - DISEÑO INMERSIVO CON MODO MÚLTIPLE CORREGIDO
        // ============================================================

        async _renderizarFraseInteractiva() {
            if (this._renderizando) return;
            if (this._renderTimeout) {
                clearTimeout(this._renderTimeout);
                this._renderTimeout = null;
            }
            
            this._renderizando = true;
            this._modoVista = 'frase';
            this._cerrandoLibro = false;
            this._eventosEnlazados = false;
            this._enlaceIntentos = 0;
            
            try {
                const container = document.getElementById('cardContainer');
                if (!container || !pipeline?.fraseActual) {
                    this._renderizando = false;
                    return;
                }

                await this._recargarProgresoCompleto();
                await this._cargarHistoriaCompletaContexto();
                
                const frase = pipeline.fraseActual;
                const progreso = frase.progreso || {};
                const rcn = progreso.rcn || 0;
                const fase = pipeline.fases.find(f => f.id === pipeline.faseActual);
                const esJeroglifico = frase.esJeroglifico || false;
                const modo = this._modoEstudio;
                const total = pipeline.frases?.length || 0;
                const actual = (pipeline.indiceFrase !== undefined) ? pipeline.indiceFrase + 1 : 0;
                
                // Datos de modo inverso
                let modoData = { mostrar: frase.original, ocultar: frase.traduccion, esInverso: false };
                if (window.modoInverso) {
                    modoData = window.modoInverso.getFraseParaEstudio(frase);
                }
                const isInverso = modoData.esInverso;
                
                // Transcripción
                let transcripcion = '';
                try {
                    if (esJeroglifico) {
                        transcripcion = frase.pinyinCompleto || frase.segmentacion?.pinyin || '';
                    } else {
                        transcripcion = await this._obtenerTranscripcionFrase(frase);
                    }
                } catch (e) { transcripcion = ''; }
                
                // Favorito
                let esFavorita = false;
                try {
                    if (window.gestorFavoritos) {
                        if (!window.gestorFavoritos._initDone) await window.gestorFavoritos.init();
                        esFavorita = await window.gestorFavoritos.estaEnFavoritos('frase', frase.id);
                    }
                } catch (e) { esFavorita = false; }
                
                // Origen
                const origen = this._origenHistoriaActual || pipeline.getOrigenHistoriaActual?.() || null;
                let esCruzada = false, esTono = false;
                try {
                    const historia = await db.get('historias', pipeline._historiaIdActual);
                    if (historia) {
                        esCruzada = historia._esOndaCruzada === true;
                        esTono = historia._esTono === true;
                    }
                } catch (e) {}
                
                // 🔥 COLORES DINÁMICOS SEGÚN RCN
                const rcnColor = rcn >= 4 ? '#00B894' : rcn >= 2 ? '#FDCB6E' : '#FF7675';
                const rcnIcono = rcn >= 4 ? '🟣' : rcn >= 3 ? '🟢' : rcn >= 2 ? '🟡' : '🔴';
                const rcnLabel = rcn >= 4 ? '¡Dominado!' : rcn >= 3 ? 'Consolidado' : rcn >= 2 ? 'En progreso' : 'Necesita práctica';
                
                // 🔥 ETIQUETA DE ORIGEN
                let origenBadge = '';
                if (origen === 'elipse') origenBadge = '<span class="origen-badge elipse">🌌 Elipse</span>';
                else if (origen === 'cruzada' || esCruzada) origenBadge = '<span class="origen-badge cruzada">🌊 Cruzada</span>';
                else if (origen === 'tonos' || esTono) origenBadge = '<span class="origen-badge tonos">🎵 Tonos</span>';
                else if (origen === 'tema') origenBadge = '<span class="origen-badge tema">📚 Tema</span>';
                
                // ============================================================
                // CONSTRUCCIÓN DEL HTML - DISEÑO INMERSIVO
                // ============================================================
                
                let html = `
                <div class="study-card" style="
                    background: var(--white);
                    border-radius: 24px;
                    padding: 24px 20px 20px;
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 8px 40px rgba(0,0,0,0.08);
                    border: 1px solid rgba(108,92,231,0.08);
                    position: relative;
                    overflow: hidden;
                    font-family: var(--font);
                ">
                    <!-- DECORACIÓN DE FONDO -->
                    <div style="
                        position: absolute;
                        top: -60px;
                        right: -60px;
                        width: 200px;
                        height: 200px;
                        border-radius: 50%;
                        background: radial-gradient(circle, rgba(108,92,231,0.04), transparent 70%);
                        pointer-events: none;
                    "></div>
                    <div style="
                        position: absolute;
                        bottom: -80px;
                        left: -80px;
                        width: 250px;
                        height: 250px;
                        border-radius: 50%;
                        background: radial-gradient(circle, rgba(0,184,148,0.04), transparent 70%);
                        pointer-events: none;
                    "></div>
                    
                    <!-- ===== CABECERA ===== -->
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;position:relative;z-index:1;flex-wrap:wrap;gap:8px;">
                        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                            <span class="fase-badge" style="
                                display:inline-flex;align-items:center;gap:4px;
                                padding:4px 14px;
                                border-radius:20px;
                                background: linear-gradient(135deg, var(--primary)12, var(--secondary)12);
                                color: var(--primary);
                                font-size:12px;
                                font-weight:700;
                                border:1px solid var(--primary)20;
                            ">
                                ${fase ? fase.icono + ' ' + fase.nombre : 'Fase ' + pipeline.faseActual}
                            </span>
                            
                            <span class="rcn-badge" style="
                                display:inline-flex;align-items:center;gap:4px;
                                padding:4px 12px;
                                border-radius:20px;
                                background: ${rcnColor}15;
                                color: ${rcnColor};
                                font-size:12px;
                                font-weight:600;
                                border:1px solid ${rcnColor}30;
                            ">
                                ${rcnIcono} RCN ${rcn.toFixed(1)} · ${rcnLabel}
                            </span>
                            
                            ${origenBadge}
                        </div>
                        
                        <div style="display:flex;align-items:center;gap:6px;">
                            <!-- CORAZÓN FAVORITO -->
                            <button class="favorito-btn" onclick="window.UIStudy._toggleFraseFavorita(${frase.id || 0}, !${esFavorita})" style="
                                background:none;
                                border:none;
                                font-size:24px;
                                cursor:pointer;
                                transition:all 0.3s;
                                padding:0 4px;
                                line-height:1;
                                ${esFavorita ? 'color:#FF6B6B;' : 'color:var(--gray-light);'}
                                transform: ${esFavorita ? 'scale(1.1)' : 'scale(1)'};
                            " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='${esFavorita ? 'scale(1.1)' : 'scale(1)'}'">
                                ${esFavorita ? '❤️' : '🤍'}
                            </button>
                            
                            <!-- BOTÓN HISTORIA -->
                            ${this._historiaActual.length > 0 ? `
                                <button class="historia-btn" onclick="window.UIStudy._abrirHistoriaCompleta()" style="
                                    background:var(--bg);
                                    border:none;
                                    border-radius:12px;
                                    padding:6px 12px;
                                    font-size:12px;
                                    font-weight:600;
                                    color:var(--gray);
                                    cursor:pointer;
                                    transition:all 0.3s;
                                    display:flex;
                                    align-items:center;
                                    gap:4px;
                                " onmouseover="this.style.background='var(--primary)08';this.style.color='var(--primary)'" onmouseout="this.style.background='var(--bg)';this.style.color='var(--gray)'">
                                    📖 <span style="font-size:10px;background:var(--primary);color:white;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;">${this._historiaActual.length}</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- ===== PROGRESO DE HISTORIA ===== -->
                    ${this._progresoMostrado > 0 && this._progresoMostrado < 100 ? `
                        <div style="margin-bottom:14px;position:relative;z-index:1;">
                            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray);margin-bottom:2px;">
                                <span>📖 Progreso de la historia</span>
                                <span style="font-weight:700;color:var(--primary);">${this._progresoMostrado}%</span>
                            </div>
                            <div style="height:4px;background:var(--bg);border-radius:4px;overflow:hidden;">
                                <div class="progress-bar-inline" style="height:100%;width:${this._progresoMostrado}%;background:linear-gradient(90deg,var(--primary),var(--success));border-radius:4px;transition:width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);"></div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- ===== FRASE PRINCIPAL ===== -->
                    <div class="frase-container" style="
                        text-align:center;
                        padding:20px 12px 16px;
                        position:relative;
                        z-index:1;
                        background: linear-gradient(135deg, var(--bg), var(--white));
                        border-radius:16px;
                        border:1px solid var(--light);
                        margin-bottom:16px;
                    ">
                        ${isInverso ? `
                            <div style="font-size:13px;color:var(--secondary);margin-bottom:8px;font-weight:600;letter-spacing:0.5px;">
                                🔄 Modo Inverso · Traduce al idioma objetivo
                            </div>
                        ` : ''}
                        
                        <!-- FRASE PRINCIPAL (GRANDE) -->
                        <div style="
                            font-size: ${esJeroglifico ? '34px' : '26px'};
                            font-weight: ${esJeroglifico ? '700' : '700'};
                            color: var(--dark);
                            line-height: 1.4;
                            letter-spacing: ${esJeroglifico ? '2px' : '0px'};
                            padding: 4px 0;
                        ">
                            ${esJeroglifico && !isInverso ? this._formatearHanziSegmentado(frase) : (modoData.mostrar || frase.original)}
                        </div>
                        
                        <!-- TRANSCRIPCIÓN -->
                        ${transcripcion && this._mostrarPinyin ? `
                            <div style="
                                font-size:24px;
                                color: ${esJeroglifico ? 'var(--primary)' : 'var(--secondary)'};
                                margin-top:8px;
                                letter-spacing:2.2px;
                                font-weight:700;
                                line-height:1.35;
                                padding:8px 18px;
                                background: ${esJeroglifico ? 'var(--primary)06' : 'var(--secondary)06'};
                                border-radius:12px;
                                display:inline-block;
                                border:1px solid ${esJeroglifico ? 'var(--primary)20' : 'var(--secondary)20'};
                                font-family: var(--font);
                            ">
                                ${esJeroglifico ? '🔊' : '🎤'} ${transcripcion}
                            </div>
                        ` : ''}
                        
                        <!-- TRADUCCIÓN (REVELABLE) -->
                        ${modo === 'flashcard' ? `
                            <div style="margin-top:12px;">
                                ${this._mostrandoRespuesta ? `
                                    <div style="
                                        padding:14px 20px;
                                        background: var(--primary)06;
                                        border-radius:12px;
                                        font-size:18px;
                                        font-weight:600;
                                        color: var(--primary);
                                        border:2px dashed var(--primary)30;
                                        animation: fadeUp 0.3s ease;
                                    ">
                                        ${modoData.ocultar}
                                    </div>
                                    ${this._pistaActual ? `
                                        <div style="margin-top:8px;font-size:13px;color:var(--gray);background:var(--bg);padding:6px 14px;border-radius:8px;display:inline-block;">
                                            💡 ${this._pistaActual}
                                        </div>
                                    ` : ''}
                                ` : `
                                    <div style="height:4px;"></div>
                                `}
                            </div>
                        ` : modo === 'escritura' ? `
                            <div style="margin-top:8px;font-size:13px;color:var(--gray-light);">
                                ✍️ Escribe la traducción en el campo de abajo
                            </div>
                        ` : modo === 'multiple' ? `
                            <div style="margin-top:8px;font-size:13px;color:var(--gray-light);">
                                🤔 Selecciona la opción correcta
                            </div>
                        ` : modo === 'escucha' ? `
                            <div style="margin-top:8px;font-size:13px;color:var(--gray-light);">
                                👂 Escucha y repite en voz alta
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- ===== CONTROL DE TRANSCRIPCIÓN FONÉTICA ===== -->
                    ${transcripcion ? `
                        <div style="
                            display:flex;
                            justify-content:center;
                            align-items:center;
                            margin:4px 0 12px;
                            position:relative;
                            z-index:1;
                        ">
                            <label style="
                                display:inline-flex;
                                align-items:center;
                                gap:8px;
                                padding:7px 12px;
                                background:var(--bg);
                                border:1px solid var(--light);
                                border-radius:10px;
                                color:var(--gray);
                                font-size:12px;
                                font-weight:600;
                                cursor:pointer;
                                user-select:none;
                            ">
                                <input
                                    type="checkbox"
                                    ${this._mostrarPinyin ? 'checked' : ''}
                                    onchange="window.UIStudy._toggleMostrarPinyin(this.checked)"
                                    style="width:16px;height:16px;cursor:pointer;"
                                >
                                <span>🔤 Mostrar transcripción fonética</span>
                            </label>
                        </div>
                    ` : ''}

                    <!-- ===== BOTONES DE ACCIÓN (MODO FLASHCARD Y ESCUCHA) ===== -->
                    ${modo === 'flashcard' ? `
                        <div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px;position:relative;z-index:1;flex-wrap:wrap;">
                            <button class="action-btn action-show" onclick="window.UIStudy._toggleFlashcardRespuesta()" style="
                                padding:10px 24px;
                                border:none;
                                border-radius:12px;
                                font-size:14px;
                                font-weight:700;
                                cursor:pointer;
                                transition:all 0.3s;
                                background: ${this._mostrandoRespuesta ? 'var(--bg)' : 'linear-gradient(135deg, #6C5CE7, #A29BFE)'};
                                color: ${this._mostrandoRespuesta ? 'var(--gray)' : 'white'};
                                box-shadow: ${this._mostrandoRespuesta ? 'none' : '0 4px 16px rgba(108,92,231,0.3)'};
                                flex:1;
                                min-width:120px;
                            " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                                <i class="fas ${this._mostrandoRespuesta ? 'fa-eye-slash' : 'fa-eye'}"></i> 
                                ${this._mostrandoRespuesta ? 'Ocultar' : 'Mostrar'}
                            </button>
                            <button class="action-btn action-hint" onclick="window.UIStudy._generarPista()" style="
                                padding:10px 24px;
                                border:none;
                                border-radius:12px;
                                font-size:14px;
                                font-weight:700;
                                cursor:pointer;
                                transition:all 0.3s;
                                background:var(--bg);
                                color:var(--gray);
                                flex:1;
                                min-width:120px;
                                border:2px solid var(--light);
                            " onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'" onmouseout="this.style.borderColor='var(--light)';this.style.color='var(--gray)'">
                                💡 Pista
                            </button>
                        </div>
                    ` : ''}
                    
                    ${modo === 'escucha' ? `
                        <div style="display:flex;gap:8px;justify-content:center;margin-bottom:12px;position:relative;z-index:1;flex-wrap:wrap;">
                            <button class="action-btn action-listen" onclick="window.UIStudy._reproducirFrase('${(modoData.mostrar || frase.original).replace(/'/g, "\\'")}', '${frase.idioma || pipeline.idiomaObjetivo || 'es'}')" style="
                                padding:12px 30px;
                                border:none;
                                border-radius:12px;
                                font-size:16px;
                                font-weight:700;
                                cursor:pointer;
                                transition:all 0.3s;
                                background:linear-gradient(135deg, #00CEC9, #00B894);
                                color:white;
                                box-shadow:0 4px 16px rgba(0,206,201,0.3);
                                flex:1;
                                min-width:140px;
                            " onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 8px 30px rgba(0,206,201,0.4)'" onmouseout="this.style.transform='none';this.style.boxShadow='0 4px 16px rgba(0,206,201,0.3)'">
                                🔊 Reproducir
                            </button>
                            ${!this._mostrandoRespuesta ? `
                                <button class="action-btn action-show" onclick="window.UIStudy._toggleFlashcardRespuesta()" style="
                                    padding:12px 24px;
                                    border:none;
                                    border-radius:12px;
                                    font-size:14px;
                                    font-weight:700;
                                    cursor:pointer;
                                    transition:all 0.3s;
                                    background:var(--bg);
                                    color:var(--gray);
                                    border:2px solid var(--light);
                                    flex:1;
                                    min-width:120px;
                                " onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'" onmouseout="this.style.borderColor='var(--light)';this.style.color='var(--gray)'">
                                    Mostrar traducción
                                </button>
                            ` : `
                                <div style="padding:12px 20px;background:var(--primary)06;border-radius:12px;font-size:16px;font-weight:600;color:var(--primary);border:2px dashed var(--primary)30;flex:1;min-width:120px;text-align:center;">
                                    ${modoData.ocultar}
                                </div>
                            `}
                        </div>
                    ` : ''}
                    
                    <!-- ===== BOTONES DE RESPUESTA (MODO FLASHCARD Y ESCUCHA) ===== -->
                    ${(modo === 'flashcard' || modo === 'escucha') ? `
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:12px;position:relative;z-index:1;">
                            <button class="respuesta-btn fallo" onclick="window.UIStudy._responderEstudio('fallo')" style="
                                padding:10px 4px;
                                border:none;
                                border-radius:12px;
                                font-size:12px;
                                font-weight:700;
                                cursor:pointer;
                                transition:all 0.3s;
                                background:var(--danger)10;
                                color:var(--danger);
                                border:2px solid var(--danger)20;
                            " onmouseover="this.style.background='var(--danger)';this.style.color='white';this.style.transform='scale(1.02)'" onmouseout="this.style.background='var(--danger)10';this.style.color='var(--danger)';this.style.transform='none'">
                                ❌<br><span style="font-size:10px;">Fallo</span>
                            </button>
                            <button class="respuesta-btn duda" onclick="window.UIStudy._responderEstudio('duda')" style="
                                padding:10px 4px;
                                border:none;
                                border-radius:12px;
                                font-size:12px;
                                font-weight:700;
                                cursor:pointer;
                                transition:all 0.3s;
                                background:var(--warning)10;
                                color:var(--warning);
                                border:2px solid var(--warning)20;
                            " onmouseover="this.style.background='var(--warning)';this.style.color='white';this.style.transform='scale(1.02)'" onmouseout="this.style.background='var(--warning)10';this.style.color='var(--warning)';this.style.transform='none'">
                                ❓<br><span style="font-size:10px;">Duda</span>
                            </button>
                            <button class="respuesta-btn parcial" onclick="window.UIStudy._responderEstudio('parcial')" style="
                                padding:10px 4px;
                                border:none;
                                border-radius:12px;
                                font-size:12px;
                                font-weight:700;
                                cursor:pointer;
                                transition:all 0.3s;
                                background:var(--secondary)10;
                                color:var(--secondary);
                                border:2px solid var(--secondary)20;
                            " onmouseover="this.style.background='var(--secondary)';this.style.color='white';this.style.transform='scale(1.02)'" onmouseout="this.style.background='var(--secondary)10';this.style.color='var(--secondary)';this.style.transform='none'">
                                ➖<br><span style="font-size:10px;">Parcial</span>
                            </button>
                            <button class="respuesta-btn correcto" onclick="window.UIStudy._responderEstudio('correcto')" style="
                                padding:10px 4px;
                                border:none;
                                border-radius:12px;
                                font-size:12px;
                                font-weight:700;
                                cursor:pointer;
                                transition:all 0.3s;
                                background:var(--success)10;
                                color:var(--success);
                                border:2px solid var(--success)20;
                            " onmouseover="this.style.background='var(--success)';this.style.color='white';this.style.transform='scale(1.02)'" onmouseout="this.style.background='var(--success)10';this.style.color='var(--success)';this.style.transform='none'">
                                ✅<br><span style="font-size:10px;">Correcto</span>
                            </button>
                        </div>
                    ` : ''}
                    
                    <!-- ===== MODO ESCRITURA ===== -->
                    ${modo === 'escritura' ? `
                        <div style="margin-bottom:12px;position:relative;z-index:1;">
                            <div style="display:flex;gap:10px;align-items:center;">
                                <input type="text" id="respuestaEscritura" placeholder="✍️ Escribe la traducción..." style="
                                    flex:1;
                                    padding:12px 16px;
                                    border:2px solid var(--light);
                                    border-radius:12px;
                                    font-size:16px;
                                    font-family:var(--font);
                                    background:var(--bg);
                                    transition:all 0.3s;
                                " onfocus="this.style.borderColor='var(--primary)';this.style.boxShadow='0 0 0 4px var(--primary)08'" onblur="this.style.borderColor='var(--light)';this.style.boxShadow='none'">
                                <button id="btnValidarEscritura" style="
                                    padding:12px 24px;
                                    border:none;
                                    border-radius:12px;
                                    font-size:15px;
                                    font-weight:700;
                                    cursor:pointer;
                                    transition:all 0.3s;
                                    background:linear-gradient(135deg, #6C5CE7, #A29BFE);
                                    color:white;
                                    white-space:nowrap;
                                    box-shadow:0 4px 16px rgba(108,92,231,0.3);
                                " onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 8px 30px rgba(108,92,231,0.4)'" onmouseout="this.style.transform='none';this.style.boxShadow='0 4px 16px rgba(108,92,231,0.3)'">
                                    ✅ Validar
                                </button>
                            </div>
                            
                            <!-- Feedback de validación -->
                            ${this._ultimaRespuesta ? `
                                <div style="margin-top:10px;padding:12px 16px;border-radius:12px;background:${this._ultimaRespuesta.correcto ? 'var(--success)10' : this._ultimaRespuesta.aproximado ? 'var(--warning)10' : 'var(--danger)10'};border-left:4px solid ${this._ultimaRespuesta.correcto ? 'var(--success)' : this._ultimaRespuesta.aproximado ? 'var(--warning)' : 'var(--danger)'};animation:fadeUp 0.3s ease;">
                                    <div style="display:flex;align-items:center;gap:8px;">
                                        <span style="font-size:20px;">${this._ultimaRespuesta.correcto ? '✅' : this._ultimaRespuesta.aproximado ? '🟡' : '❌'}</span>
                                        <div>
                                            <div style="font-weight:600;color:${this._ultimaRespuesta.correcto ? 'var(--success)' : this._ultimaRespuesta.aproximado ? 'var(--warning)' : 'var(--danger)'};">${this._ultimaRespuesta.mensaje}</div>
                                            ${!this._ultimaRespuesta.correcto && !this._ultimaRespuesta.aproximado ? `
                                                <div style="font-size:13px;color:var(--gray);margin-top:2px;">
                                                    Correcta: <strong style="color:var(--primary);">${this._ultimaRespuesta.correctaEsperada}</strong>
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
                                        ${this._ultimaRespuesta.correcto ? `
                                            <button class="respuesta-btn correcto" onclick="window.UIStudy._responderEstudio('correcto')" style="padding:6px 16px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;background:var(--success);color:white;transition:all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">✅ Correcto</button>
                                        ` : this._ultimaRespuesta.aproximado ? `
                                            <button class="respuesta-btn parcial" onclick="window.UIStudy._responderEstudio('parcial')" style="padding:6px 16px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;background:var(--secondary);color:white;transition:all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">➖ Parcial</button>
                                            <button class="respuesta-btn fallo" onclick="window.UIStudy._responderEstudio('fallo')" style="padding:6px 16px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;background:var(--danger);color:white;transition:all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">❌ Fallo</button>
                                        ` : `
                                            <button class="respuesta-btn fallo" onclick="window.UIStudy._responderEstudio('fallo')" style="padding:6px 16px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;background:var(--danger);color:white;transition:all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">❌ Fallo</button>
                                        `}
                                    </div>
                                </div>
                            ` : `
                                <div style="text-align:center;font-size:12px;color:var(--gray-light);margin-top:6px;">
                                    💡 Escribe y pulsa Validar o presiona Enter
                                </div>
                            `}
                        </div>
                    ` : ''}
                    
                    <!-- ===== MODO MÚLTIPLE - CORREGIDO ===== -->
                    ${modo === 'multiple' ? `
                        <div style="margin-bottom:12px;position:relative;z-index:1;">
                            ${this._opcionesMultiple.length === 0 ? `
                                <div style="text-align:center;padding:20px;color:var(--gray);">
                                    <i class="fas fa-spinner fa-spin" style="font-size:24px;"></i>
                                    <div style="margin-top:8px;">Generando opciones...</div>
                                </div>
                            ` : `
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                                    ${this._opcionesMultiple.map((opcion, i) => {
                                        const correcta = isInverso ? frase.original : frase.traduccion;
                                        const isCorrect = opcion === correcta;
                                        const isSelected = this._ultimaRespuesta && opcion === this._ultimaRespuesta.opcionSeleccionada;
                                        let bg = 'var(--white)';
                                        let border = 'var(--light)';
                                        let color = 'var(--dark)';
                                        let icono = '';
                                        if (this._ultimaRespuesta) {
                                            if (isCorrect) {
                                                bg = 'var(--success)10';
                                                border = 'var(--success)';
                                                color = 'var(--success)';
                                                icono = '✅ ';
                                            } else if (isSelected && !isCorrect) {
                                                bg = 'var(--danger)10';
                                                border = 'var(--danger)';
                                                color = 'var(--danger)';
                                                icono = '❌ ';
                                            }
                                        }
                                        const disabled = this._ultimaRespuesta ? 'style="cursor:default;opacity:0.8;"' : '';
                                        return `
                                            <div class="multiple-opcion" data-texto="${opcion.replace(/'/g, "\\'")}" ${disabled} style="
                                                padding:14px 12px;
                                                border-radius:12px;
                                                border:2px solid ${border};
                                                background:${bg};
                                                color:${color};
                                                cursor:${this._ultimaRespuesta ? 'default' : 'pointer'};
                                                text-align:center;
                                                font-size:${opcion.length > 15 ? '14px' : '16px'};
                                                font-weight:600;
                                                transition:all 0.3s;
                                            " onmouseover="${!this._ultimaRespuesta ? "this.style.borderColor='var(--primary)';this.style.background='var(--primary)04';this.style.transform='scale(1.02)'" : ''}" 
                                               onmouseout="${!this._ultimaRespuesta ? "this.style.borderColor='var(--light)';this.style.background='var(--white)';this.style.transform='none'" : ''}">
                                                ${icono}${opcion}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                                ${this._ultimaRespuesta ? `
                                    <div style="margin-top:10px;padding:12px 16px;border-radius:12px;background:${this._ultimaRespuesta.correcto ? 'var(--success)10' : 'var(--danger)10'};border-left:4px solid ${this._ultimaRespuesta.correcto ? 'var(--success)' : 'var(--danger)'};animation:fadeUp 0.3s ease;">
                                        <div style="display:flex;align-items:center;gap:8px;">
                                            <span style="font-size:20px;">${this._ultimaRespuesta.correcto ? '✅' : '❌'}</span>
                                            <div>
                                                <div style="font-weight:600;color:${this._ultimaRespuesta.correcto ? 'var(--success)' : 'var(--danger)'};">${this._ultimaRespuesta.mensaje}</div>
                                                ${!this._ultimaRespuesta.correcto ? `
                                                    <div style="font-size:13px;color:var(--gray);margin-top:2px;">
                                                        Correcta: <strong style="color:var(--primary);">${this._ultimaRespuesta.correctaEsperada}</strong>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
                                            ${this._ultimaRespuesta.correcto ? `
                                                <button class="respuesta-btn correcto" onclick="window.UIStudy._responderEstudio('correcto')" style="padding:6px 16px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;background:var(--success);color:white;transition:all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">✅ Correcto</button>
                                            ` : `
                                                <button class="respuesta-btn fallo" onclick="window.UIStudy._responderEstudio('fallo')" style="padding:6px 16px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;background:var(--danger);color:white;transition:all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">❌ Fallo</button>
                                            `}
                                        </div>
                                    </div>
                                ` : `
                                    <div style="text-align:center;font-size:12px;color:var(--gray-light);margin-top:6px;">
                                        🤔 Selecciona una opción
                                    </div>
                                `}
                            `}
                        </div>
                    ` : ''}
                    
                    <!-- ===== PALABRAS DESGLOSADAS ===== -->
                    ${await this._renderPalabrasDesglosadasRobusto(frase) || ''}
                    
                    <!-- ===== NAVEGACIÓN ===== -->
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:2px solid var(--bg);position:relative;z-index:1;gap:12px;">
                        <button class="nav-btn prev" onclick="window.UIStudy._fraseAnterior()" style="
                            padding:10px 18px;
                            border:none;
                            border-radius:12px;
                            font-size:14px;
                            font-weight:700;
                            cursor:pointer;
                            transition:all 0.3s;
                            background:var(--bg);
                            color:var(--gray);
                            border:2px solid var(--light);
                            display:flex;
                            align-items:center;
                            gap:6px;
                        " onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'" onmouseout="this.style.borderColor='var(--light)';this.style.color='var(--gray)'">
                            <i class="fas fa-chevron-left"></i> Anterior
                        </button>
                        
                        <div style="text-align:center;">
                            <div style="font-size:20px;font-weight:800;color:var(--primary);">${actual}</div>
                            <div style="font-size:11px;color:var(--gray-light);">/${total}</div>
                        </div>
                        
                        <button class="nav-btn next" onclick="window.UIStudy._fraseSiguiente()" style="
                            padding:10px 18px;
                            border:none;
                            border-radius:12px;
                            font-size:14px;
                            font-weight:700;
                            cursor:pointer;
                            transition:all 0.3s;
                            background:linear-gradient(135deg, #6C5CE7, #A29BFE);
                            color:white;
                            box-shadow:0 4px 16px rgba(108,92,231,0.3);
                            display:flex;
                            align-items:center;
                            gap:6px;
                        " onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 8px 30px rgba(108,92,231,0.4)'" onmouseout="this.style.transform='none';this.style.boxShadow='0 4px 16px rgba(108,92,231,0.3)'">
                            Siguiente <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    
                    <!-- ===== SELECTOR DE MODO ===== -->
                    <div style="
                        margin-top:16px;
                        padding-top:14px;
                        border-top:2px solid var(--bg);
                        display:flex;
                        gap:6px;
                        flex-wrap:wrap;
                        justify-content:center;
                        position:relative;
                        z-index:1;
                    ">
                        ${['flashcard', 'escritura', 'multiple', 'escucha'].map(m => `
                            <button class="modo-btn ${this._modoEstudio === m ? 'active' : ''}" data-modo="${m}" onclick="window.UIStudy.cambiarModoEstudio('${m}')" style="
                                padding:6px 14px;
                                border:none;
                                border-radius:20px;
                                font-size:11px;
                                font-weight:600;
                                cursor:pointer;
                                transition:all 0.3s;
                                background:${this._modoEstudio === m ? 'var(--primary)' : 'var(--bg)'};
                                color:${this._modoEstudio === m ? 'white' : 'var(--gray)'};
                                border:2px solid ${this._modoEstudio === m ? 'var(--primary)' : 'var(--light)'};
                                box-shadow:${this._modoEstudio === m ? '0 2px 12px rgba(108,92,231,0.3)' : 'none'};
                                display:flex;
                                align-items:center;
                                gap:4px;
                            " onmouseover="${this._modoEstudio !== m ? "this.style.borderColor='var(--primary)';this.style.color='var(--primary)'" : ''}" onmouseout="${this._modoEstudio !== m ? "this.style.borderColor='var(--light)';this.style.color='var(--gray)'" : ''}">
                                ${m === 'flashcard' ? '🃏' : m === 'escritura' ? '✍️' : m === 'multiple' ? '📋' : '🎧'} ${m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        `).join('')}
                    </div>
                    
                </div>
                `;
                
                container.innerHTML = window.PipelineI18n ? window.PipelineI18n.html(html) : html;
                
                // ============================================================
                // GENERACIÓN ASÍNCRONA DE OPCIONES MÚLTIPLES
                // ============================================================
                // El diseño nuevo dibuja primero el indicador "Generando opciones...".
                // Aquí arrancamos la generación y, cuando termina, volvemos a renderizar
                // la frase para sustituir el indicador por las 4 opciones.
                if (modo === 'multiple' && this._opcionesMultiple.length === 0 && !this._generandoOpciones) {
                    const fraseEnGeneracion = frase;

                    this._generarOpcionesMultiplesConGroq(frase, modoData)
                        .then(opciones => {
                            // Evitar que una generación antigua sobrescriba una frase nueva.
                            if (pipeline?.fraseActual === fraseEnGeneracion && this._modoEstudio === 'multiple') {
                                this._opcionesMultiple = Array.isArray(opciones) ? opciones : [];
                                this._renderizarFraseInteractiva();
                            }
                        })
                        .catch(error => {
                            console.warn('⚠️ Error generando opciones múltiples:', error);
                            return this._generarOpcionesMultiplesFallback(fraseEnGeneracion, modoData);
                        })
                        .then(opciones => {
                            // Este segundo .then solo actúa cuando se utilizó el fallback.
                            if (opciones && pipeline?.fraseActual === fraseEnGeneracion && this._modoEstudio === 'multiple') {
                                this._opcionesMultiple = Array.isArray(opciones) ? opciones : [];
                                this._renderizarFraseInteractiva();
                            }
                        })
                        .catch(error => {
                            console.error('❌ Error en fallback de opciones múltiples:', error);
                            this._generandoOpciones = false;
                        });
                }

                // ============================================================
                // ENLAZAR EVENTOS
                // ============================================================
                
                if (modo === 'escritura') {
                    setTimeout(() => { this._enlazarEventosEscritura(); }, 50);
                }
                if (modo === 'multiple') {
                    setTimeout(() => { this._enlazarEventosMultiple(); }, 50);
                }
                
                // Verificar progreso
                await this._verificarProgresoTema();
                
            } catch (e) {
                console.error('❌ Error renderizando frase:', e);
                this._renderizarErrorFallback();
            } finally {
                this._renderizando = false;
            }
        }

        // ============================================================
        // GENERAR OPCIONES MÚLTIPLES - VERSIÓN ESTABLE
        // ============================================================

        async _generarOpcionesMultiplesConGroq(frase, modoData) {
            // Si ya hay opciones generadas, devolverlas inmediatamente
            if (this._opcionesMultiple && this._opcionesMultiple.length > 0) {
                this._generandoOpciones = false;
                return this._opcionesMultiple;
            }
            
            // Si ya se está generando, esperar con timeout
            if (this._generandoOpciones) {
                return new Promise((resolve) => {
                    let intentos = 0;
                    const maxIntentos = 20; // 4 segundos máximo
                    const checkInterval = setInterval(() => {
                        intentos++;
                        if (this._opcionesMultiple && this._opcionesMultiple.length > 0) {
                            clearInterval(checkInterval);
                            this._generandoOpciones = false;
                            resolve(this._opcionesMultiple);
                        } else if (intentos >= maxIntentos) {
                            clearInterval(checkInterval);
                            this._generandoOpciones = false;
                            // Fallback directo
                            this._generarOpcionesMultiplesFallback(frase, modoData).then(resolve);
                        }
                    }, 200);
                });
            }
            
            this._generandoOpciones = true;
            
            try {
                const idioma = frase.idioma || pipeline.idiomaObjetivo || 'es';
                const esInverso = modoData.esInverso;
                
                let correcta;
                if (esInverso) {
                    correcta = frase.original;
                } else {
                    correcta = frase.traduccion;
                }
                
                // === INTENTAR CON GROQ ===
                if (window.vigia && window.vigia.enLinea && window.vigia._apiKeyValidada) {
                    try {
                        console.log('🧠 Generando opciones con Groq...');
                        
                        // Obtener frases similares
                        const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
                        let candidatas = [];
                        
                        if (esInverso) {
                            candidatas = todasFrases
                                .filter(f => f.id !== frase.id && f.original && f.original !== correcta)
                                .sort(() => Math.random() - 0.5)
                                .slice(0, 10)
                                .map(f => f.original);
                        } else {
                            candidatas = todasFrases
                                .filter(f => f.id !== frase.id && f.traduccion && f.traduccion !== correcta && f.traduccion.trim() !== '')
                                .sort(() => Math.random() - 0.5)
                                .slice(0, 10)
                                .map(f => f.traduccion);
                        }
                        
                        // Si no hay candidatas, usar fallback
                        if (candidatas.length < 3) {
                            console.log('⚠️ Sin candidatas suficientes, usando fallback');
                            return this._generarOpcionesMultiplesFallback(frase, modoData);
                        }
                        
                        // Prompt completo
                        const prompt = `Genera 3 opciones INCORRECTAS (distractores) para una pregunta de opción múltiple sobre traducción de idiomas.

PREGUNTA: Traduce "${esInverso ? frase.traduccion : frase.original}" al ${esInverso ? idioma : 'español'}.

RESPUESTA CORRECTA: "${correcta}"

POSIBLES DISTRACTORES (inspírate en estas, NO las copies exactamente):
${candidatas.slice(0, 6).map((c, i) => `${i+1}. "${c}"`).join('\n')}

REGLAS:
1. Responde SOLO con un array JSON de 3 strings.
2. Las opciones deben ser PLAUSIBLES pero INCORRECTAS.
3. NO incluyas la respuesta correcta.
4. Formato: ["opcion1", "opcion2", "opcion3"]`;

                        const resultado = await window.vigia._consultarGroq(prompt, 'json');
                        
                        if (resultado && Array.isArray(resultado) && resultado.length >= 3) {
                            const opcionesFiltradas = resultado
                                .filter(o => o && typeof o === 'string' && o.trim() !== '' && o !== correcta)
                                .slice(0, 3);
                            
                            if (opcionesFiltradas.length >= 3) {
                                const opcionesFinales = [correcta, ...opcionesFiltradas];
                                const mezcladas = opcionesFinales.sort(() => Math.random() - 0.5);
                                
                                this._opcionesMultiple = mezcladas;
                                this._metodoValidacion = 'online';
                                this._generandoOpciones = false;
                                console.log('✅ Opciones generadas con Groq:', mezcladas);
                                return mezcladas;
                            }
                        }
                        
                        console.log('⚠️ Groq no dio opciones válidas, usando fallback');
                        return this._generarOpcionesMultiplesFallback(frase, modoData);
                        
                    } catch (error) {
                        console.warn('⚠️ Error con Groq:', error);
                        return this._generarOpcionesMultiplesFallback(frase, modoData);
                    }
                } else {
                    console.log('📝 Vigía no disponible, usando generación offline');
                    return this._generarOpcionesMultiplesFallback(frase, modoData);
                }
                
            } catch (error) {
                console.error('❌ Error en generación múltiple:', error);
                this._generandoOpciones = false;
                return this._generarOpcionesMultiplesFallback(frase, modoData);
            }
        }

        // ============================================================
        // GENERAR OPCIONES MÚLTIPLES - FALLBACK OFFLINE (SIEMPRE FUNCIONA)
        // ============================================================

        async _generarOpcionesMultiplesFallback(frase, modoData) {
            console.log('📝 Generando opciones múltiples OFFLINE...');
            
            try {
                const idioma = frase.idioma || pipeline.idiomaObjetivo || 'es';
                const esInverso = modoData.esInverso;
                
                let correcta;
                if (esInverso) {
                    correcta = frase.original;
                } else {
                    correcta = frase.traduccion;
                }
                
                // Obtener frases del mismo idioma
                const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
                let opciones = [];
                
                if (esInverso) {
                    opciones = todasFrases
                        .filter(f => f.id !== frase.id && f.original && f.original !== correcta)
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 10)
                        .map(f => f.original);
                } else {
                    opciones = todasFrases
                        .filter(f => f.id !== frase.id && f.traduccion && f.traduccion !== correcta && f.traduccion.trim() !== '')
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 10)
                        .map(f => f.traduccion);
                }
                
                // Eliminar duplicados y vacíos
                opciones = [...new Set(opciones.filter(o => o && o.trim() !== '' && o !== correcta))];
                
                // Si hay suficientes opciones
                if (opciones.length >= 3) {
                    const seleccionadas = opciones.slice(0, 3);
                    const opcionesFinales = [correcta, ...seleccionadas];
                    const mezcladas = opcionesFinales.sort(() => Math.random() - 0.5);
                    
                    this._opcionesMultiple = mezcladas;
                    this._metodoValidacion = 'offline';
                    this._generandoOpciones = false;
                    console.log('✅ Opciones generadas OFFLINE:', mezcladas);
                    return mezcladas;
                }
                
                // Si NO hay suficientes opciones, crear distractores sintéticos
                console.log('⚠️ Generando distractores sintéticos...');
                const distractores = this._generarDistractoresSinteticos(correcta, esInverso, idioma);
                const opcionesFinales = [correcta, ...distractores];
                const mezcladas = opcionesFinales.sort(() => Math.random() - 0.5);
                
                this._opcionesMultiple = mezcladas;
                this._metodoValidacion = 'offline';
                this._generandoOpciones = false;
                console.log('✅ Opciones sintéticas generadas:', mezcladas);
                return mezcladas;
                
            } catch (error) {
                console.error('❌ Error en fallback:', error);
                // Fallback último recurso
                const correcta = modoData.esInverso ? frase.original : frase.traduccion;
                const opcionesFinales = [
                    correcta,
                    correcta + ' (variante 1)',
                    correcta + ' (variante 2)',
                    correcta + ' (variante 3)'
                ];
                const mezcladas = opcionesFinales.sort(() => Math.random() - 0.5);
                
                this._opcionesMultiple = mezcladas;
                this._metodoValidacion = 'offline';
                this._generandoOpciones = false;
                console.log('✅ Opciones de último recurso:', mezcladas);
                return mezcladas;
            }
        }

        // ============================================================
        // GENERAR DISTRACTORES SINTÉTICOS
        // ============================================================

        _generarDistractoresSinteticos(correcta, esInverso, idioma) {
            const distractores = [];
            const palabras = correcta.split(' ');
            
            // Distractor 1: cambiar una palabra
            if (palabras.length > 1) {
                const variante = palabras.map((p, i) => {
                    if (i === 0 && p.length > 2) return p.slice(0, -1) + 's';
                    return p;
                }).join(' ');
                if (variante !== correcta) distractores.push(variante);
            }
            
            // Distractor 2: añadir palabra
            if (palabras.length >= 1) {
                const variante = palabras.join(' ') + ' extra';
                if (variante !== correcta) distractores.push(variante);
            }
            
            // Distractor 3: sinónimo aproximado
            const sinonimos = esInverso ? 
                ['otra', 'diferente', 'alternativa', 'similar'] :
                ['otra cosa', 'diferente', 'alternativa', 'parecido'];
            
            for (const s of sinonimos) {
                const variante = esInverso ? 
                    s + ' ' + palabras.join(' ') :
                    correcta + ' ' + s;
                if (variante !== correcta && !distractores.includes(variante)) {
                    distractores.push(variante);
                    break;
                }
            }
            
            // Si no hay distractores, usar genéricos
            while (distractores.length < 3) {
                const gen = esInverso ? 
                    ['otra palabra', 'palabra diferente', 'alternativa'] : 
                    ['otra opción', 'opción diferente', 'alternativa'];
                for (const g of gen) {
                    if (!distractores.includes(g) && g !== correcta) {
                        distractores.push(g);
                    }
                }
                // Evitar loop infinito
                if (distractores.length >= 3) break;
                // Último recurso
                if (distractores.length < 3) {
                    distractores.push('Opción ' + (distractores.length + 1));
                }
            }
            
            return distractores.slice(0, 3);
        }

        // ============================================================
        // FALLBACK DE ERROR
        // ============================================================

        _renderizarErrorFallback() {
            try {
                const container = document.getElementById('cardContainer');
                if (!container) return;
                const frase = pipeline?.fraseActual;
                if (!frase) {
                    container.innerHTML = `
                        <div class="card" style="max-width:500px;padding:40px 30px;text-align:center;">
                            <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                            <p style="color:var(--gray);">Error al cargar la frase</p>
                            <button class="btn-primary" onclick="window.UIStudy.cargar(window.UIStudy.core)" style="margin-top:12px;padding:8px 20px;">
                                <i class="fas fa-sync"></i> Reintentar
                            </button>
                        </div>
                    `;
                    return;
                }
                const esJeroglifico = frase.esJeroglifico || false;
                const hanzi = frase.segmentacion?.hanzi || frase.original || '';
                container.innerHTML = `
                    <div class="card" style="max-width:500px;margin:0 auto;text-align:center;padding:30px 20px;">
                        <div style="font-size:32px;font-weight:700;color:var(--dark);">${esJeroglifico ? hanzi : frase.original}</div>
                        ${frase.pinyinCompleto ? `<div style="font-size:16px;color:var(--gray-light);margin-top:4px;">🔊 ${frase.pinyinCompleto}</div>` : ''}
                        <div style="font-size:18px;color:var(--gray);margin-top:8px;">→ ${frase.traduccion}</div>
                        <button class="btn-primary" onclick="window.UIStudy.cargar(window.UIStudy.core)" style="margin-top:16px;padding:8px 20px;">
                            <i class="fas fa-sync"></i> Recargar
                        </button>
                    </div>
                `;
            } catch (e) {
                console.error('❌ Error en fallback:', e);
            }
        }

        // ============================================================
        // CARGAR HISTORIA COMPLETA PARA CONTEXTO
        // ============================================================

        async _cargarHistoriaCompletaContexto() {
            if (!pipeline || !pipeline.fraseActual) return;
            try {
                const frase = pipeline.fraseActual;
                const historiaData = await pipeline.obtenerHistoriaCompletaDeFrase(frase.id);
                if (historiaData) {
                    this._historiaActual = historiaData.frases || [];
                    this._historiaTitulo = historiaData.titulo || 'Historia sin título';
                    this._historiaIdActual = historiaData.id;
                } else {
                    this._historiaActual = [];
                    this._historiaTitulo = '';
                    this._historiaIdActual = null;
                }
            } catch (e) {
                this._historiaActual = [];
            }
        }

        // ============================================================
        // ABRIR HISTORIA COMPLETA
        // ============================================================

        async _abrirHistoriaCompleta() {
            if (this._historiaActual.length === 0) {
                this.core?.mostrarToast('📚 No hay historia completa disponible', 'warning');
                return;
            }
            this._modoVista = 'historia_completa';
            await this._renderizarHistoriaCompletaDesdeLibro();
        }

        // ============================================================
        // PALABRAS DESGLOSADAS - VERSIÓN ROBUSTA
        // ============================================================

        async _renderPalabrasDesglosadasRobusto(frase) {
            if (!frase) return '';
            
            let palabras = [];
            
            if (frase.palabras && Array.isArray(frase.palabras) && frase.palabras.length > 0) {
                palabras = frase.palabras;
            }
            
            if (palabras.length === 0 && this._historiaActual && this._historiaActual.length > 0) {
                const historiaFrase = this._historiaActual.find(f => f.id === frase.id);
                if (historiaFrase && historiaFrase.palabras && Array.isArray(historiaFrase.palabras) && historiaFrase.palabras.length > 0) {
                    palabras = historiaFrase.palabras;
                }
            }
            
            if (palabras.length === 0 && frase.id) {
                try {
                    const frasesDB = await db.obtenerFrases();
                    const fraseDB = frasesDB.find(f => f.id === frase.id);
                    if (fraseDB && fraseDB.palabras && Array.isArray(fraseDB.palabras) && fraseDB.palabras.length > 0) {
                        palabras = fraseDB.palabras;
                        frase.palabras = palabras;
                    }
                } catch (e) {
                    console.warn('⚠️ Error obteniendo palabras desde DB:', e);
                }
            }
            
            if (palabras.length === 0 && frase.original) {
                const palabrasExtraidas = frase.original.split(/\s+/).filter(p => p.length > 0);
                if (palabrasExtraidas.length > 0) {
                    const idioma = frase.idioma || pipeline.idiomaObjetivo || 'es';
                    const esJeroglifico = this._esJeroglifico(idioma);
                    for (const p of palabrasExtraidas) {
                        palabras.push({
                            palabra: p,
                            hanzi: esJeroglifico ? p : '',
                            familia: 'sin_clasificar',
                            tipo: 'sustantivo',
                            significado: p,
                            pinyin: ''
                        });
                    }
                }
            }
            
            if (palabras.length === 0) return '';
            
            const esJeroglifico = frase.esJeroglifico || false;
            const idioma = frase.idioma || pipeline.idiomaObjetivo || 'es';
            const nivelReal = this._obtenerNivelRealUsuario();
            
            let html = '<div style="padding:12px 0;border-top:2px solid var(--bg);margin-top:8px;">';
            html += '<div style="font-size:12px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">📖 Palabras desglosadas</div>';
            html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
            
            for (const p of palabras) {
                try {
                    let texto = '';
                    let pinyin = '';
                    let familia = 'sin_clasificar';
                    let significado = '';
                    let tipo = 'sustantivo';
                    let id = null;
                    
                    if (typeof p === 'string') {
                        texto = p;
                    } else if (p && typeof p === 'object') {
                        texto = p.hanzi || p.palabra || '';
                        pinyin = p.pinyin || '';
                        familia = p.familia || (p.familias && p.familias[0]) || 'sin_clasificar';
                        significado = p.significado || '';
                        tipo = p.tipo || p.familia || 'sustantivo';
                        id = p.id || null;
                    }
                    
                    if (!texto) continue;
                    
                    const color = window.uiCore?._getColorFamilia(familia) || '#6C5CE7';
                    let transcripcionPalabra = '';
                    if (!esJeroglifico && texto) {
                        try {
                            const transcripcion = await this._obtenerTranscripcionPalabra({ palabra: texto, idioma: idioma, pinyin: pinyin });
                            if (transcripcion) transcripcionPalabra = transcripcion;
                        } catch (e) {}
                    }
                    
                    const textoEscapado = texto.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    const pinyinEscapado = (pinyin || '').replace(/'/g, "\\'");
                    const significadoEscapado = (significado || '').replace(/'/g, "\\'");
                    const familiaEscapada = (familia || 'sin_clasificar').replace(/'/g, "\\'");
                    
                    html += `<span style="display:inline-flex;flex-direction:column;align-items:center;padding:6px 14px;border-radius:12px;background:${color}15;border:1px solid ${color}30;cursor:pointer;" 
                                onclick="window.UIStudy._abrirModalGuardarPalabra('${textoEscapado}', '${pinyinEscapado}', '${significadoEscapado}', '${familiaEscapada}', '${idioma}', '${nivelReal}', '${(tipo || 'sustantivo').replace(/'/g, "\\'")}')"
                                onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" 
                                onmouseout="this.style.transform='none';this.style.boxShadow='none'" 
                                title="Haz clic para guardar en Mi Espacio">`;
                    html += `<span style="font-weight:${esJeroglifico ? '700' : '600'};color:${color};font-size:${esJeroglifico ? '18px' : '16px'};">${texto}</span>`;
                    if (esJeroglifico && pinyin) {
                        html += `<span style="font-size:11px;color:var(--gray-light);letter-spacing:1px;margin-top:1px;">🔊 ${pinyin}</span>`;
                    } else if (transcripcionPalabra) {
                        html += `<span style="font-size:10px;color:var(--gray-light);margin-top:1px;">🎤 ${transcripcionPalabra}</span>`;
                    }
                    if (significado) {
                        html += `<span style="font-size:10px;color:var(--gray);margin-top:1px;">📖 ${significado.substring(0, 15)}</span>`;
                    }
                    html += `<span style="font-size:8px;color:var(--primary);margin-top:2px;">⭐ Guardar</span>`;
                    html += '</span>';
                    
                } catch (e) {
                    const texto = typeof p === 'string' ? p : (p?.palabra || p?.hanzi || String(p) || '?');
                    html += `<span style="display:inline-flex;flex-direction:column;align-items:center;padding:6px 14px;border-radius:12px;background:var(--bg);border:1px solid var(--light);">`;
                    html += `<span style="font-weight:600;color:var(--dark);font-size:16px;">${texto}</span>`;
                    html += `<span style="font-size:8px;color:var(--gray-light);">⚠️</span>`;
                    html += '</span>';
                }
            }
            
            html += '</div></div>';
            return html;
        }

        // ============================================================
        // FLASHCARD
        // ============================================================
        
        _renderFlashcard(frase, modoData) {
            let html = '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:8px;">';
            html += '<button class="btn-secondary" onclick="window.UIStudy._toggleFlashcardRespuesta()" style="padding:8px 20px;font-size:13px;">';
            html += '<i class="fas ' + (this._mostrandoRespuesta ? 'fa-eye-slash' : 'fa-eye') + '"></i> ' + (this._mostrandoRespuesta ? 'Ocultar' : 'Mostrar');
            html += '</button>';
            html += '<button class="btn-secondary" onclick="window.UIStudy._generarPista()" style="padding:8px 20px;font-size:13px;">';
            html += '<i class="fas fa-lightbulb"></i> Pista';
            html += '</button>';
            html += '</div>';
            html += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">';
            html += '<button class="action-btn danger" onclick="window.UIStudy._responderEstudio(\'fallo\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-times"></i> Fallo</button>';
            html += '<button class="action-btn warning" onclick="window.UIStudy._responderEstudio(\'duda\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-question"></i> Duda</button>';
            html += '<button class="action-btn info" onclick="window.UIStudy._responderEstudio(\'parcial\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-minus"></i> Parcial</button>';
            html += '<button class="action-btn success" onclick="window.UIStudy._responderEstudio(\'correcto\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-check"></i> Correcto</button>';
            html += '</div>';
            return html;
        }

        _toggleFlashcardRespuesta() {
            this._mostrandoRespuesta = !this._mostrandoRespuesta;
            if (!this._mostrandoRespuesta) this._pistaActual = '';
            this._renderizarFraseInteractiva();
            this._guardarIndiceEstudio();
        }

        // ============================================================
        // ESCRITURA
        // ============================================================
        
        _renderEscritura(frase, modoData) {
            const resultado = this._ultimaRespuesta;
            const esJeroglifico = modoData.esJeroglifico;
            const esInverso = modoData.esInverso;
            
            let html = '<div style="padding:12px 0;border-top:2px solid var(--bg);border-bottom:2px solid var(--bg);margin-bottom:16px;">';
            
            let label;
            if (esJeroglifico && esInverso) {
                label = `✍️ Escribe en ${frase.idioma || pipeline.idiomaObjetivo || 'idioma objetivo'} (pinyin aceptado):`;
            } else if (esJeroglifico && !esInverso) {
                label = `📝 Escribe la traducción al español:`;
            } else {
                label = esInverso ? 
                    `✍️ Escribe la frase en ${frase.idioma || pipeline.idiomaObjetivo || 'idioma objetivo'}:` :
                    '📝 Escribe la traducción:';
            }
            html += `<label style="font-size:13px;font-weight:600;color:var(--gray);">${label}</label>`;
            
            let placeholder;
            if (esJeroglifico && esInverso) {
                placeholder = 'Escribe en hanzi o pinyin...';
            } else if (esJeroglifico && !esInverso) {
                placeholder = 'Escribe la traducción al español...';
            } else {
                placeholder = 'Escribe aquí...';
            }
            
            html += '<div style="display:flex;gap:10px;margin-top:6px;">';
            html += `<input type="text" id="respuestaEscritura" placeholder="${placeholder}" style="flex:1;padding:10px 14px;border:2px solid var(--light);border-radius:10px;font-size:15px;font-family:var(--font);">`;
            html += '<button class="btn-primary" id="btnValidarEscritura" style="padding:10px 20px;font-size:14px;width:auto;"><i class="fas fa-check"></i> Validar</button>';
            html += '</div>';
            
            const metodoClase = this._metodoValidacion === 'online' ? 'online' : 'offline';
            const metodoIcono = this._metodoValidacion === 'online' ? '🧠' : '📝';
            const metodoTexto = this._metodoValidacion === 'online' ? 'Validación con Groq' : 'Validación offline';
            const metodoColor = this._metodoValidacion === 'online' ? 'var(--success)' : 'var(--gray)';
            
            html += `
                <div style="display:flex;justify-content:flex-end;margin-top:4px;gap:8px;">
                    <span class="indicador-validacion ${metodoClase}" style="
                        display:inline-flex;align-items:center;gap:4px;
                        font-size:10px;padding:2px 10px;border-radius:12px;
                        background:${metodoColor}15;border:1px solid ${metodoColor};
                        color:${metodoColor};
                    ">
                        <span class="dot ${metodoClase}" style="width:6px;height:6px;border-radius:50%;display:inline-block;background:${metodoColor};"></span>
                        ${metodoIcono} ${metodoTexto}
                    </span>
                </div>
            `;
            
            if (resultado) {
                const icono = resultado.correcto ? '✅' : resultado.aproximado ? '🟡' : '❌';
                const color = resultado.correcto ? 'var(--success)' : resultado.aproximado ? 'var(--warning)' : 'var(--danger)';
                html += '<div style="padding:12px 16px;border-radius:10px;background:' + color + '10;border-left:4px solid ' + color + ';margin-top:8px;">';
                html += '<div style="font-size:14px;font-weight:500;">' + icono + ' ' + resultado.mensaje + '</div>';
                if (!resultado.correcto && !resultado.aproximado) {
                    html += '<div style="font-size:13px;color:var(--gray);margin-top:4px;">Correcta: <strong>' + resultado.correctaEsperada + '</strong></div>';
                }
                if (resultado.puntuacion !== undefined && resultado.puntuacion > 0) {
                    html += '<div style="font-size:12px;color:var(--gray);margin-top:2px;">🎯 Puntuación: ' + resultado.puntuacion + '%</div>';
                }
                html += '</div>';
                html += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px;">';
                if (resultado.correcto) {
                    html += '<button class="action-btn success" onclick="window.UIStudy._responderEstudio(\'correcto\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-check"></i> Correcto</button>';
                } else if (resultado.aproximado) {
                    html += '<button class="action-btn info" onclick="window.UIStudy._responderEstudio(\'parcial\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-minus"></i> Parcial</button>';
                    html += '<button class="action-btn danger" onclick="window.UIStudy._responderEstudio(\'fallo\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-times"></i> Fallo</button>';
                } else {
                    html += '<button class="action-btn danger" onclick="window.UIStudy._responderEstudio(\'fallo\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-times"></i> Fallo</button>';
                }
                html += '</div>';
            } else {
                html += '<div style="font-size:12px;color:var(--gray-light);text-align:center;margin-top:8px;">💡 Escribe tu respuesta y pulsa "Validar"</div>';
                html += '<div style="display:flex;justify-content:center;margin-top:8px;">';
                html += '<button class="btn-secondary" onclick="window.UIStudy._generarPista()" style="padding:6px 16px;font-size:12px;"><i class="fas fa-lightbulb"></i> Pista</button>';
                html += '</div>';
            }
            html += '</div>';
            return html;
        }

        // ============================================================
        // ENLAZAR EVENTOS DE ESCRITURA
        // ============================================================

        _enlazarEventosEscritura() {
            if (this._eventosEnlazados) return;
            if (this._enlaceIntentos > this._maxEnlaceIntentos) {
                console.warn('⚠️ Máximo de intentos alcanzado para enlazar eventos de escritura');
                return;
            }
            
            try {
                const btnValidar = document.getElementById('btnValidarEscritura');
                const input = document.getElementById('respuestaEscritura');
                
                if (!btnValidar || !input) {
                    this._enlaceIntentos++;
                    console.log(`⏳ Elementos de escritura aún no disponibles, reintentando (${this._enlaceIntentos}/${this._maxEnlaceIntentos})...`);
                    setTimeout(() => this._enlazarEventosEscritura(), 100);
                    return;
                }
                
                const newBtn = btnValidar.cloneNode(true);
                btnValidar.parentNode.replaceChild(newBtn, btnValidar);
                
                const newInput = input.cloneNode(true);
                input.parentNode.replaceChild(newInput, input);
                
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._validarRespuestaEscrita();
                });
                
                newInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        this._validarRespuestaEscrita();
                    }
                });
                
                this._eventosEnlazados = true;
                setTimeout(() => {
                    if (newInput && document.body.contains(newInput)) newInput.focus();
                }, 100);
            } catch (e) {
                console.warn('⚠️ Error enlazando eventos de escritura:', e);
                this._enlaceIntentos++;
                if (this._enlaceIntentos <= this._maxEnlaceIntentos) {
                    setTimeout(() => this._enlazarEventosEscritura(), 200);
                }
            }
        }

        // ============================================================
        // VALIDACIÓN DE RESPUESTA ESCRITA - CORREGIDO CON RECARGA
        // ============================================================
        
        async _validarRespuestaEscrita() {
            if (this._validandoRespuesta || this._respuestaRegistrada === pipeline?.fraseActual?.id) return;
            this._validandoRespuesta = true;
            try {
                const input = document.getElementById('respuestaEscritura');
                if (!input) {
                    this._enlazarEventosEscritura();
                    setTimeout(() => this._validarRespuestaEscrita(), 100);
                    return;
                }
                
                const respuesta = input.value.trim();
                if (!respuesta) {
                    this.core.mostrarToast('✏️ Escribe una respuesta primero.', 'warning');
                    return;
                }
                
                if (!pipeline || !pipeline.fraseActual) return;
                
                this.core.mostrarToast('🔍 Validando respuesta...', 'info');
                
                const frase = pipeline.fraseActual;
                const idioma = frase.idioma || pipeline.idiomaObjetivo || 'es';
                const nivel = frase.nivel || pipeline.nivel || 'A1';
                const esInverso = window.modoInverso && window.modoInverso.isActivo();
                const esJeroglifico = frase.esJeroglifico || this._esJeroglifico(idioma);
                
                let correctaEsperada;
                let direccionGroq;
                if (esInverso) {
                    correctaEsperada = frase.original;
                    direccionGroq = 'nativo_a_objetivo';
                } else {
                    correctaEsperada = frase.traduccion;
                    direccionGroq = 'objetivo_a_nativo';
                }
                
                let resultado = null;
                let metodo = 'offline';
                
                if (window.vigia && window.vigia.enLinea && window.vigia._apiKeyValidada) {
                    try {
                        const groqResult = await window.vigia.validarTraduccionNatural(
                            respuesta, correctaEsperada, idioma, nivel, direccionGroq
                        );
                        if (groqResult && groqResult.correcto !== undefined) {
                            resultado = {
                                correcto: groqResult.correcto || false,
                                aproximado: groqResult.aproximado || false,
                                mensaje: groqResult.mensaje || (groqResult.correcto ? '✅ ¡Perfecto! Validación con Groq.' : '❌ Incorrecto.'),
                                correctaEsperada: groqResult.correctaEsperada || correctaEsperada,
                                puntuacion: groqResult.puntuacion || (groqResult.correcto ? 100 : 0),
                                metodo: 'online_groq'
                            };
                            metodo = 'online';
                            this._metodoValidacion = 'online';
                        }
                    } catch (e) {
                        metodo = 'offline';
                        this._metodoValidacion = 'offline';
                    }
                }
                
                if (!resultado) {
                    const similitud = this._calcularSimilitudLevenshtein(respuesta.toLowerCase(), correctaEsperada.toLowerCase());
                    const esExacto = respuesta.toLowerCase().trim() === correctaEsperada.toLowerCase().trim();
                    const esAproximado = similitud >= 0.7 && !esExacto;
                    const esParcial = similitud >= 0.5 && !esExacto && !esAproximado;
                    let mensaje = '';
                    if (esExacto) mensaje = '✅ ¡Perfecto! Respuesta correcta.';
                    else if (esAproximado) mensaje = '🟡 Muy cerca. Revisa pequeños detalles.';
                    else if (esParcial) mensaje = '🟡 Aproximado. Intenta mejorar la precisión.';
                    else mensaje = `❌ Incorrecto. La respuesta correcta es: "${correctaEsperada}"`;
                    resultado = {
                        correcto: esExacto,
                        aproximado: esAproximado || esParcial,
                        mensaje: mensaje,
                        correctaEsperada: correctaEsperada,
                        puntuacion: Math.round(similitud * 100),
                        metodo: 'offline'
                    };
                }
                
                if (pipeline.fraseActual !== frase || pipeline.idiomaObjetivo !== idioma) return;
                const registrada = await pipeline.procesarRespuesta(resultado.correcto ? 'correcto' : resultado.aproximado ? 'parcial' : 'fallo', { avanzar: false });
                if (!registrada) return;
                this._respuestaRegistrada = frase.id;
                this._ultimaRespuesta = resultado;
                input.value = '';
                this._renderizarFraseInteractiva();
                
                if (resultado.correcto) {
                    this.core.mostrarToast('✅ ¡Correcto!', 'success');

                } else if (resultado.aproximado) {
                    this.core.mostrarToast('🟡 Casi correcto. Sigue así.', 'warning');

                } else {
                    this.core.mostrarToast('❌ Incorrecto. Revisa la respuesta correcta.', 'error');

                }
                
                await this._recargarProgresoCompleto();
                await this._guardarIndiceEstudio();
                await this._verificarProgresoTema();
                
            } catch (e) {
                console.error('❌ Error validando respuesta:', e);
                this.core.mostrarToast('❌ Error al validar la respuesta', 'error');
            } finally { this._validandoRespuesta = false; }
        }

        // ============================================================
        // MÉTODOS AUXILIARES DE VALIDACIÓN
        // ============================================================
        
        _calcularSimilitudLevenshtein(a, b) {
            if (a.length === 0) return b.length === 0 ? 1 : 0;
            if (b.length === 0) return 0;
            const matrix = [];
            for (let i = 0; i <= a.length; i++) matrix[i] = [i];
            for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
            for (let i = 1; i <= a.length; i++) {
                for (let j = 1; j <= b.length; j++) {
                    const cost = a[i-1] === b[j-1] ? 0 : 1;
                    matrix[i][j] = Math.min(matrix[i-1][j] + 1, matrix[i][j-1] + 1, matrix[i-1][j-1] + cost);
                }
            }
            const distancia = matrix[a.length][b.length];
            const maxLen = Math.max(a.length, b.length);
            return 1 - (distancia / maxLen);
        }

        async _reforzarElemento(id, tipo, cantidad = 1) {
            try {
                const progreso = await db.obtenerProgreso(id);
                if (progreso) {
                    progreso.rcn = Math.min(5, (progreso.rcn || 0) + cantidad * 0.3);
                    progreso.repasosExitosos = (progreso.repasosExitosos || 0) + 1;
                    progreso.ultimoRepaso = Date.now();
                    await db.guardarProgreso(progreso);
                }
            } catch (e) {}
        }

        async _debilistarElemento(id, tipo) {
            try {
                const progreso = await db.obtenerProgreso(id);
                if (progreso) {
                    progreso.rcn = Math.max(0, (progreso.rcn || 0) - 0.2);
                    progreso.repasosFallidos = (progreso.repasosFallidos || 0) + 1;
                    progreso.ultimoRepaso = Date.now();
                    await db.guardarProgreso(progreso);
                }
            } catch (e) {}
        }

        // ============================================================
        // GENERAR PISTA
        // ============================================================
        
        async _generarPista() {
            if (!pipeline || !pipeline.fraseActual) {
                this.core.mostrarToast('❌ No hay frase activa', 'error');
                return;
            }
            this.core.mostrarToast('🧠 Generando pista...', 'info');
            try {
                const pista = await pipeline.generarPista();
                this._pistaActual = pista;
                this._mostrandoRespuesta = true;
                this._renderizarFraseInteractiva();
                await this._guardarIndiceEstudio();
            } catch (error) {
                const frase = pipeline.fraseActual;
                if (frase.esJeroglifico && frase.pinyinCompleto) {
                    this._pistaActual = `💡 Pista fonética: "${frase.pinyinCompleto}"`;
                } else if (frase.transcripcion) {
                    this._pistaActual = `💡 Pista fonética: "${frase.transcripcion}"`;
                } else {
                    this._pistaActual = '💡 Intenta recordar el contexto y significado de la frase.';
                }
                this._mostrandoRespuesta = true;
                this._renderizarFraseInteractiva();
                await this._guardarIndiceEstudio();
            }
        }

        // ============================================================
        // OPCIÓN MÚLTIPLE
        // ============================================================
        
        _renderMultiple(frase, modoData) {
            const opciones = this._opcionesMultiple;
            let correcta;
            let etiqueta;
            if (modoData.esInverso) {
                correcta = frase.original;
                etiqueta = 'frase original en ' + (frase.idioma || pipeline.idiomaObjetivo || 'es');
            } else {
                correcta = frase.traduccion;
                etiqueta = 'traducción al español';
            }
            const resultado = this._ultimaRespuesta;
            
            let html = '<div style="padding:12px 0;border-top:2px solid var(--bg);border-bottom:2px solid var(--bg);margin-bottom:16px;">';
            html += `<div style="font-size:14px;font-weight:600;color:var(--gray);margin-bottom:10px;">Selecciona la ${etiqueta} correcta:</div>`;
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
            
            for (let i = 0; i < opciones.length; i++) {
                const opcion = opciones[i];
                const isCorrect = opcion === correcta;
                const isSelected = resultado && opcion === resultado.opcionSeleccionada;
                let bgColor = 'var(--white)';
                let borderColor = 'var(--light)';
                let textColor = 'var(--dark)';
                if (resultado) {
                    if (isCorrect) {
                        bgColor = 'rgba(0,184,148,0.1)';
                        borderColor = 'var(--success)';
                        textColor = 'var(--success)';
                    } else if (isSelected && !isCorrect) {
                        bgColor = 'rgba(255,118,117,0.1)';
                        borderColor = 'var(--danger)';
                        textColor = 'var(--danger)';
                    }
                }
                const disabled = resultado ? 'style="cursor:default;opacity:0.8;"' : '';
                const dataAttr = `data-texto="${opcion.replace(/'/g, "\\'")}"`;
                html += `<div class="multiple-opcion" ${dataAttr} ${disabled} style="padding:12px 16px;border-radius:10px;border:2px solid ${borderColor};background:${bgColor};color:${textColor};cursor:${resultado ? 'default' : 'pointer'};text-align:center;font-size:${opcion.length > 10 ? '16px' : '18px'};font-weight:500;transition:all 0.3s;">`;
                if (resultado && isCorrect) html += '✅ ';
                else if (resultado && isSelected && !isCorrect) html += '❌ ';
                html += opcion;
                html += '</div>';
            }
            html += '</div>';
            
            if (resultado) {
                const isCorrect = resultado.opcionSeleccionada === correcta;
                const icono = isCorrect ? '✅' : '❌';
                const color = isCorrect ? 'var(--success)' : 'var(--danger)';
                html += '<div style="padding:10px 16px;border-radius:10px;background:' + color + '10;border-left:4px solid ' + color + ';margin-top:10px;">';
                html += '<div style="font-size:14px;font-weight:500;">' + icono + ' ' + resultado.mensaje + '</div>';
                html += '</div>';
                html += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px;">';
                if (isCorrect) {
                    html += '<button class="action-btn success" onclick="window.UIStudy._responderEstudio(\'correcto\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-check"></i> Correcto</button>';
                } else {
                    html += '<button class="action-btn danger" onclick="window.UIStudy._responderEstudio(\'fallo\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-times"></i> Fallo</button>';
                }
                html += '</div>';
            } else {
                html += '<div style="font-size:12px;color:var(--gray-light);text-align:center;margin-top:8px;">💡 Selecciona una opción para continuar</div>';
            }
            html += '</div>';
            return html;
        }

        // ============================================================
        // ENLAZAR EVENTOS DE MÚLTIPLE
        // ============================================================

        _enlazarEventosMultiple() {
            try {
                const opciones = document.querySelectorAll('.multiple-opcion');
                if (!opciones || opciones.length === 0) {
                    setTimeout(() => this._enlazarEventosMultiple(), 50);
                    return;
                }
                opciones.forEach(el => {
                    const newEl = el.cloneNode(true);
                    el.parentNode.replaceChild(newEl, el);
                    newEl.addEventListener('click', () => {
                        const opcion = newEl.dataset.texto;
                        if (opcion && !this._ultimaRespuesta) {
                            this._seleccionarOpcionMultiple(opcion);
                        }
                    });
                });
            } catch (e) {
                console.warn('⚠️ Error enlazando eventos múltiple:', e);
            }
        }

        async _seleccionarOpcionMultiple(opcion) {
            if (this._ultimaRespuesta) return;
            const frase = pipeline.fraseActual;
            if (!frase) return;
            let correcta;
            if (window.modoInverso && window.modoInverso.isActivo()) {
                correcta = frase.original;
            } else {
                correcta = frase.traduccion;
            }
            const isCorrect = opcion === correcta;
            this._ultimaRespuesta = {
                opcionSeleccionada: opcion,
                correcto: isCorrect,
                aproximado: false,
                mensaje: isCorrect ? '✅ ¡Correcto! Has seleccionado la opción adecuada.' : '❌ Incorrecto. La respuesta correcta es: ' + correcta,
                correctaEsperada: correcta
            };
            this._renderizarFraseInteractiva();
            await this._guardarIndiceEstudio();
            await this._verificarProgresoTema();
        }

        // ============================================================
        // ESCUCHA
        // ============================================================
        
        _renderEscucha(frase, modoData) {
            const texto = modoData.esInverso ? modoData.ocultar : modoData.mostrar;
            const esJeroglifico = modoData.esJeroglifico;
            const transcripcion = esJeroglifico ? 
                (frase.pinyinCompleto || frase.segmentacion?.pinyin || '') : 
                (frase.transcripcion || '');
            
            let html = '<div style="padding:16px 0;border-top:2px solid var(--bg);border-bottom:2px solid var(--bg);margin-bottom:16px;text-align:center;">';
            html += '<div style="font-size:48px;margin-bottom:12px;">🔊</div>';
            html += '<div style="font-size:16px;color:var(--gray);margin-bottom:12px;">Escucha la frase y luego intenta repetirla en voz alta.</div>';
            if (esJeroglifico) {
                const hanzi = frase.segmentacion?.hanzi || frase.original || '';
                html += `<div style="font-size:22px;font-weight:700;color:var(--dark);">${hanzi}</div>`;
                html += `<div style="font-size:15px;color:var(--primary);margin-top:4px;letter-spacing:1px;font-weight:500;padding:4px 14px;background:var(--primary)08;border-radius:8px;display:inline-block;border:1px solid var(--primary)30;font-family:var(--font);">
                    🔊 ${transcripcion || 'Sin pinyin disponible'}
                </div>`;
                html += `<div style="font-size:13px;color:var(--gray-light);margin-top:4px;">👂 Escucha la pronunciación y repite</div>`;
            } else {
                html += `<div style="font-size:18px;font-weight:600;color:var(--dark);">${texto}</div>`;
                html += `<div style="font-size:15px;color:var(--secondary);margin-top:4px;letter-spacing:1px;font-weight:500;padding:4px 14px;background:var(--secondary)08;border-radius:8px;display:inline-block;border:1px solid var(--secondary)30;font-family:var(--font);">
                    🎤 ${transcripcion || 'Sin transcripción disponible'}
                </div>`;
                html += `<div style="font-size:13px;color:var(--gray-light);margin-top:4px;">👂 Escucha la pronunciación y repite</div>`;
            }
            html += '<button class="btn-primary" onclick="window.UIStudy._reproducirFrase(\'' + texto.replace(/'/g, "\\'") + '\', \'' + (frase.idioma || pipeline.idiomaObjetivo || 'es') + '\')" style="padding:12px 30px;font-size:16px;margin-top:8px;">';
            html += '<i class="fas fa-play"></i> Reproducir';
            html += '</button>';
            if (this._mostrandoRespuesta) {
                html += '<div style="margin-top:12px;padding:12px;background:rgba(108,92,231,0.06);border-radius:10px;font-size:16px;color:var(--primary);">' + modoData.ocultar + '</div>';
            } else {
                html += '<button class="btn-secondary" onclick="window.UIStudy._toggleFlashcardRespuesta()" style="margin-top:12px;padding:6px 16px;font-size:12px;">Mostrar ' + (modoData.esInverso ? 'original' : 'traducción') + '</button>';
            }
            html += '</div>';
            html += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">';
            html += '<button class="action-btn danger" onclick="window.UIStudy._responderEstudio(\'fallo\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-times"></i> Fallo</button>';
            html += '<button class="action-btn warning" onclick="window.UIStudy._responderEstudio(\'duda\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-question"></i> Duda</button>';
            html += '<button class="action-btn info" onclick="window.UIStudy._responderEstudio(\'parcial\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-minus"></i> Parcial</button>';
            html += '<button class="action-btn success" onclick="window.UIStudy._responderEstudio(\'correcto\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-check"></i> Correcto</button>';
            html += '</div>';
            return html;
        }

        _reproducirFrase(texto, idioma) {
            if (!window.speechSynthesis) {
                this.core.mostrarToast('⚠️ Tu navegador no soporta síntesis de voz.', 'error');
                return;
            }
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(texto);
            utterance.lang = idioma || 'es';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            const voices = window.speechSynthesis.getVoices();
            const nativeVoice = voices.find(v => v.lang.startsWith(utterance.lang));
            if (nativeVoice) utterance.voice = nativeVoice;
            window.speechSynthesis.speak(utterance);
            this.core.mostrarToast('🔊 Reproduciendo...', 'info');
        }

        // ============================================================
        // MODAL DE PALABRAS DESGLOSADAS AVANZADO
        // ============================================================

        async _abrirModalGuardarPalabra(palabra, pinyin, significado, familia, idioma, nivel, tipo = '') {
            try {
                console.log('📖 Abriendo modal avanzado para palabra:', palabra);
                
                let modal = document.getElementById('modalPalabraAvanzado');
                if (!modal) {
                    modal = this._crearModalPalabraAvanzado();
                }
                
                const body = document.getElementById('modalPalabraAvanzadoBody');
                const titulo = document.getElementById('modalPalabraAvanzadoTitulo');
                const subtitulo = document.getElementById('modalPalabraAvanzadoSubtitulo');
                const icono = document.getElementById('modalPalabraAvanzadoIcono');
                
                if (!modal || !body) {
                    console.error('❌ Modal no disponible');
                    this.core?.mostrarToast('❌ Error: modal no disponible', 'error');
                    return;
                }
                
                modal.style.display = 'flex';
                this._modalAvanzadoAbierto = true;
                {
                    const loadingHTML = `
                    <div style="text-align:center;padding:30px;color:var(--gray);">
                        <i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--primary);"></i>
                        <p style="margin-top:12px;">Cargando información de "${palabra}"...</p>
                    </div>
                    `;
                    body.innerHTML = window.PipelineI18n ? window.PipelineI18n.html(loadingHTML) : loadingHTML;
                }
                
                const idiomaReal = idioma || gestorIdiomas?.getIdiomaActivo() || 'es';
                const nivelReal = nivel || this._obtenerNivelRealUsuario();
                const esJeroglifico = this._esJeroglifico(idiomaReal);
                
                let palabraCompleta = null;
                let palabraId = null;
                
                const todasPalabras = await db.obtenerPalabrasPorIdioma(idiomaReal);
                const textoLower = palabra.toLowerCase();
                palabraCompleta = todasPalabras.find(p => {
                    const pTexto = (p.palabra || p.hanzi || '').toLowerCase();
                    return pTexto === textoLower;
                });
                
                if (palabraCompleta) {
                    palabraId = palabraCompleta.id;
                }
                
                let rcn = 0, fase = 1, repasosExitosos = 0, repasosFallidos = 0;
                let estadoRCN = '🔴 Nuevo';
                let estadoColor = 'var(--danger)';
                let estadoRCNBarra = 0;
                
                if (palabraId) {
                    const progreso = await db.obtenerProgresoCaracter(palabraId);
                    if (progreso) {
                        rcn = progreso.rcn || 0;
                        fase = progreso.fase || 1;
                        repasosExitosos = progreso.repasosExitosos || 0;
                        repasosFallidos = progreso.repasosFallidos || 0;
                        
                        if (rcn >= 4) {
                            estadoRCN = '🟣 Dominado';
                            estadoColor = 'var(--success)';
                            estadoRCNBarra = 100;
                        } else if (rcn >= 3) {
                            estadoRCN = '🟢 Consolidado';
                            estadoColor = 'var(--success)';
                            estadoRCNBarra = 75;
                        } else if (rcn >= 2) {
                            estadoRCN = '🟡 En progreso';
                            estadoColor = 'var(--warning)';
                            estadoRCNBarra = 50;
                        } else if (rcn >= 0.5) {
                            estadoRCN = '🟠 Iniciando';
                            estadoColor = 'var(--info)';
                            estadoRCNBarra = 25;
                        } else {
                            estadoRCN = '🔴 Necesita práctica';
                            estadoColor = 'var(--danger)';
                            estadoRCNBarra = 5;
                        }
                    }
                }
                
                const familiaSemantica = palabraCompleta?.familiaSemantica || palabraCompleta?.familia || familia || 'General';
                const familiaGramatical = palabraCompleta?.tipo || tipo || 'sustantivo';
                const colorSemantica = this._getColorFamiliaSemantica(familiaSemantica);
                const colorGramatical = this._getColorFamiliaGramatical(familiaGramatical);
                
                const todasFrases = await db.obtenerFrasesPorIdioma(idiomaReal);
                const frasesRelacionadas = [];
                const textoLower2 = palabra.toLowerCase();
                
                for (const f of todasFrases) {
                    const original = (f.original || '').toLowerCase();
                    if (original.includes(textoLower2)) {
                        frasesRelacionadas.push(f);
                    }
                    if (f.palabras && Array.isArray(f.palabras)) {
                        for (const p of f.palabras) {
                            const pTexto = (p.palabra || p.hanzi || '').toLowerCase();
                            if (pTexto === textoLower2) {
                                if (!frasesRelacionadas.some(fr => fr.id === f.id)) {
                                    frasesRelacionadas.push(f);
                                }
                                break;
                            }
                        }
                    }
                }
                
                const palabrasRelacionadas = todasPalabras.filter(p => {
                    const fam = p.familiaSemantica || p.familia || '';
                    return fam === familiaSemantica && 
                           (p.palabra || p.hanzi || '').toLowerCase() !== textoLower &&
                           (p.palabra || p.hanzi || '');
                }).slice(0, 8);
                
                let esFavorita = false;
                if (palabraId && window.gestorFavoritos) {
                    try {
                        esFavorita = await window.gestorFavoritos.estaEnFavoritos('palabra', palabraId);
                    } catch (e) {}
                }
                
                const pinyinFinal = palabraCompleta?.pinyin || pinyin || '';
                const significadoFinal = palabraCompleta?.significado || significado || palabra;
                
                const modalPalabraHTML = this._renderizarModalPalabraAvanzado({
                    texto: palabra,
                    pinyin: pinyinFinal,
                    significado: significadoFinal,
                    familiaSemantica: familiaSemantica,
                    familiaGramatical: familiaGramatical,
                    nivel: nivelReal,
                    esJeroglifico: esJeroglifico,
                    esCaracterRaiz: palabraCompleta?.esCaracterRaiz || false,
                    esPalabraDerivada: palabraCompleta?.esPalabraDerivada || false,
                    caracterRaiz: palabraCompleta?.caracterRaiz || null,
                    palabraId: palabraId,
                    rcn: rcn,
                    fase: fase,
                    repasosExitosos: repasosExitosos,
                    repasosFallidos: repasosFallidos,
                    estadoRCN: estadoRCN,
                    estadoColor: estadoColor,
                    estadoRCNBarra: estadoRCNBarra,
                    esFavorita: esFavorita,
                    frasesRelacionadas: frasesRelacionadas,
                    palabrasRelacionadas: palabrasRelacionadas,
                    colorSemantica: colorSemantica,
                    colorGramatical: colorGramatical,
                    idioma: idiomaReal,
                    origen: 'estudio'
                });
                body.innerHTML = window.PipelineI18n ? window.PipelineI18n.html(modalPalabraHTML) : modalPalabraHTML;
                
                if (titulo) titulo.textContent = palabra;
                if (subtitulo) {
                    subtitulo.textContent = `${familiaSemantica} · ${familiaGramatical} · Nivel ${nivelReal}`;
                }
                if (icono) {
                    icono.textContent = palabraCompleta?.esCaracterRaiz ? '🌟' : (esJeroglifico ? '🀄' : '📖');
                }
                
                this._configurarBotonesModalPalabraAvanzado(palabraId, palabra, idiomaReal, nivelReal, familiaSemantica, familiaGramatical);
                
                this._palabraModalActual = {
                    id: palabraId,
                    texto: palabra,
                    idioma: idiomaReal,
                    nivel: nivelReal,
                    familia: familiaSemantica
                };
                
                console.log('✅ Modal avanzado de palabra abierto correctamente');
                
            } catch (error) {
                console.error('❌ Error abriendo modal avanzado:', error);
                this.core?.mostrarToast('❌ Error al abrir el modal', 'error');
            }
        }

        // ============================================================
        // CREAR MODAL PALABRA AVANZADO
        // ============================================================

        _crearModalPalabraAvanzado() {
            const existing = document.getElementById('modalPalabraAvanzado');
            if (existing) {
                existing.style.display = 'none';
                return existing;
            }
            
            const modal = document.createElement('div');
            modal.id = 'modalPalabraAvanzado';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(10px);
                z-index: 100000;
                display: none;
                justify-content: center;
                align-items: center;
                padding: 20px;
                animation: fadeIn 0.3s ease;
            `;
            
            modal.innerHTML = `
                <div id="modalPalabraAvanzadoContent" style="
                    background: var(--white, #ffffff);
                    border-radius: 20px;
                    padding: 0;
                    max-width: 650px;
                    width: 100%;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 30px 80px rgba(0,0,0,0.4);
                    animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    overflow: hidden;
                    font-family: var(--font, -apple-system, BlinkMacSystemFont, sans-serif);
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 16px 20px;
                        background: linear-gradient(135deg, var(--primary)08, var(--secondary)08);
                        border-bottom: 2px solid var(--primary)20;
                        flex-shrink: 0;
                    ">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span id="modalPalabraAvanzadoIcono" style="font-size:28px;">📖</span>
                            <div>
                                <h3 id="modalPalabraAvanzadoTitulo" style="font-size:18px;font-weight:700;color:var(--dark);margin:0;">Palabra</h3>
                                <span id="modalPalabraAvanzadoSubtitulo" style="font-size:12px;color:var(--gray);">Cargando...</span>
                            </div>
                        </div>
                        <button onclick="window.UIStudy._cerrarModalPalabraAvanzado()" style="
                            background: none;
                            border: none;
                            font-size: 28px;
                            color: var(--gray);
                            cursor: pointer;
                            transition: all 0.3s;
                            padding: 0 8px;
                        " onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--gray)'">
                            &times;
                        </button>
                    </div>
                    
                    <div id="modalPalabraAvanzadoBody" style="
                        padding: 20px;
                        overflow-y: auto;
                        flex: 1;
                    ">
                        <div style="text-align:center;padding:30px;color:var(--gray);">
                            <i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--primary);"></i>
                            <p style="margin-top:12px;">Cargando información...</p>
                        </div>
                    </div>
                    
                    <div style="
                        display: flex;
                        gap: 8px;
                        padding: 12px 20px;
                        border-top: 1px solid var(--light);
                        flex-wrap: wrap;
                        flex-shrink: 0;
                        background: var(--bg);
                    ">
                        <button onclick="window.UIStudy._cerrarModalPalabraAvanzado()" style="
                            padding: 8px 20px;
                            font-size: 13px;
                            background: var(--light);
                            color: var(--dark);
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-family: var(--font);
                            transition: all 0.3s;
                            flex: 1;
                        " onmouseover="this.style.background='var(--gray-light)'" onmouseout="this.style.background='var(--light)'">
                            Cerrar
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this._cerrarModalPalabraAvanzado();
                }
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'flex') {
                    this._cerrarModalPalabraAvanzado();
                }
            });
            
            return modal;
        }

        // ============================================================
        // RENDERIZAR CONTENIDO DEL MODAL AVANZADO
        // ============================================================

        _renderizarModalPalabraAvanzado(data) {
            const {
                texto, pinyin, significado, familiaSemantica, familiaGramatical,
                nivel, esJeroglifico, esCaracterRaiz, esPalabraDerivada, caracterRaiz,
                palabraId, rcn, fase, repasosExitosos, repasosFallidos,
                estadoRCN, estadoColor, estadoRCNBarra, esFavorita,
                frasesRelacionadas, palabrasRelacionadas,
                colorSemantica, colorGramatical, idioma, origen
            } = data;
            
            const totalRepasos = repasosExitosos + repasosFallidos;
            const eficiencia = totalRepasos > 0 ? Math.round((repasosExitosos / totalRepasos) * 100) : 0;
            
            let nivelDominioSugerido = nivel;
            if (rcn >= 4) {
                const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                const idx = niveles.indexOf(nivel);
                if (idx < niveles.length - 1) {
                    nivelDominioSugerido = niveles[idx + 1];
                }
            }
            
            return `
                <div style="display:flex;flex-direction:column;gap:14px;">
                    <div style="
                        background: linear-gradient(135deg, var(--primary)06, var(--secondary)06);
                        border-radius: 12px;
                        padding: 16px 20px;
                        text-align: center;
                        border: 2px solid var(--primary)20;
                    ">
                        <div style="
                            font-size: ${esJeroglifico ? '48px' : '32px'};
                            font-weight: 800;
                            color: var(--dark);
                            line-height: 1.2;
                        ">${texto}</div>
                        ${pinyin ? `
                            <div style="
                                font-size: 18px;
                                color: var(--gray-light);
                                letter-spacing: 1.5px;
                                margin-top: 4px;
                            ">🔊 ${pinyin}</div>
                        ` : ''}
                        <div style="
                            font-size: 20px;
                            font-weight: 600;
                            color: var(--primary);
                            margin-top: 4px;
                        ">${significado}</div>
                    </div>
                    
                    <div style="
                        display: flex;
                        gap: 12px;
                        flex-wrap: wrap;
                        justify-content: center;
                        padding: 8px 12px;
                        background: var(--bg);
                        border-radius: 8px;
                        border: 1px solid var(--light);
                    ">
                        <span style="font-size:13px;color:var(--gray);">
                            🧠 RCN: <strong style="color:${estadoColor};">${rcn.toFixed(1)}</strong>
                        </span>
                        <span style="font-size:13px;color:var(--gray);">
                            📊 Fase: <strong>${fase}</strong>
                        </span>
                        <span style="font-size:13px;color:var(--gray);">
                            ✅ Aciertos: <strong>${repasosExitosos}</strong>
                        </span>
                        <span style="font-size:13px;color:var(--gray);">
                            ❌ Fallos: <strong>${repasosFallidos}</strong>
                        </span>
                        <span style="font-size:13px;color:${estadoColor};font-weight:600;">
                            ${estadoRCN}
                        </span>
                    </div>
                    
                    <div style="background:var(--bg);border-radius:8px;padding:6px 12px;">
                        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray);margin-bottom:2px;">
                            <span>📈 Progreso de RCN</span>
                            <span>${Math.round((rcn / 5) * 100)}%</span>
                        </div>
                        <div style="height:6px;background:var(--light);border-radius:3px;overflow:hidden;">
                            <div style="
                                height: 100%;
                                width: ${Math.round((rcn / 5) * 100)}%;
                                background: ${estadoColor};
                                border-radius: 3px;
                                transition: width 0.8s ease;
                            "></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--gray-light);margin-top:2px;">
                            <span>🔴 Nuevo</span>
                            <span>🟡 En progreso</span>
                            <span>🟢 Consolidado</span>
                            <span>🟣 Dominado</span>
                        </div>
                    </div>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <div style="background:var(--bg);border-radius:6px;padding:8px;text-align:center;">
                            <div style="font-size:16px;font-weight:800;color:var(--secondary);">${eficiencia}%</div>
                            <div style="font-size:9px;color:var(--gray);text-transform:uppercase;">Eficiencia</div>
                        </div>
                        <div style="background:var(--bg);border-radius:6px;padding:8px;text-align:center;">
                            <div style="font-size:16px;font-weight:800;color:var(--warning);">${nivelDominioSugerido}</div>
                            <div style="font-size:9px;color:var(--gray);text-transform:uppercase;">Nivel Sugerido</div>
                        </div>
                    </div>
                    
                    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
                        <span style="
                            background: ${colorSemantica}15;
                            color: ${colorSemantica};
                            padding: 4px 14px;
                            border-radius: 12px;
                            font-size: 12px;
                            font-weight: 600;
                        ">📂 ${familiaSemantica}</span>
                        <span style="
                            background: ${colorGramatical}15;
                            color: ${colorGramatical};
                            padding: 4px 14px;
                            border-radius: 12px;
                            font-size: 12px;
                            font-weight: 600;
                        ">📝 ${familiaGramatical}</span>
                        <span style="
                            background: var(--bg);
                            color: var(--gray);
                            padding: 4px 14px;
                            border-radius: 12px;
                            font-size: 12px;
                            font-weight: 600;
                        ">🎯 ${nivel}</span>
                        ${esCaracterRaiz ? `
                            <span style="
                                background: var(--primary)15;
                                color: var(--primary);
                                padding: 4px 14px;
                                border-radius: 12px;
                                font-size: 12px;
                                font-weight: 600;
                            ">🌟 Carácter Raíz</span>
                        ` : ''}
                        ${esPalabraDerivada && caracterRaiz ? `
                            <span style="
                                background: var(--secondary)15;
                                color: var(--secondary);
                                padding: 4px 14px;
                                border-radius: 12px;
                                font-size: 12px;
                                font-weight: 600;
                            ">🔗 Derivada de "${caracterRaiz}"</span>
                        ` : ''}
                    </div>
                    
                    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
                        <button id="btnGuardarPalabraAvanzado" style="
                            padding: 8px 20px;
                            font-size: 13px;
                            font-weight: 600;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-family: var(--font);
                            transition: all 0.3s;
                            background: ${esFavorita ? 'var(--success)' : 'linear-gradient(135deg, #6C5CE7, #A29BFE)'};
                            color: white;
                            flex: 1;
                            min-width: 140px;
                        " onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                            <i class="fas ${esFavorita ? 'fa-check' : 'fa-star'}"></i> 
                            ${esFavorita ? '✅ En Mi Espacio' : '⭐ Guardar en Mi Espacio'}
                        </button>
                        ${frasesRelacionadas.length > 0 ? `
                            <button id="btnEstudiarFrasesAvanzado" style="
                                padding: 8px 20px;
                                font-size: 13px;
                                font-weight: 600;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                font-family: var(--font);
                                transition: all 0.3s;
                                background: linear-gradient(135deg, #00B894, #55EFC4);
                                color: white;
                                flex: 1;
                                min-width: 140px;
                            " onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 4px 20px rgba(0,184,148,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                                <i class="fas fa-play"></i> Estudiar Frases (${frasesRelacionadas.length})
                            </button>
                        ` : ''}
                    </div>
                    
                    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
                        <button id="btnPracticarEscrituraAvanzado" style="
                            padding: 6px 16px;
                            font-size: 12px;
                            font-weight: 600;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-family: var(--font);
                            transition: all 0.3s;
                            background: var(--secondary);
                            color: white;
                        " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-pencil-alt"></i> Practicar Escritura
                        </button>
                        <button id="btnBuscarGramaticaAvanzado" style="
                            padding: 6px 16px;
                            font-size: 12px;
                            font-weight: 600;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-family: var(--font);
                            transition: all 0.3s;
                            background: var(--primary);
                            color: white;
                        " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                            <i class="fas fa-search"></i> Buscar en Gramática
                        </button>
                        <button onclick="window.UIStudy._cerrarModalPalabraAvanzado()" style="
                            padding: 6px 16px;
                            font-size: 12px;
                            font-weight: 600;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-family: var(--font);
                            transition: all 0.3s;
                            background: var(--light);
                            color: var(--dark);
                        " onmouseover="this.style.background='var(--gray-light)'" onmouseout="this.style.background='var(--light)'">
                            <i class="fas fa-times"></i> Cerrar
                        </button>
                    </div>
                    
                    ${frasesRelacionadas.length > 0 ? `
                        <div style="
                            background: var(--bg);
                            border-radius: 8px;
                            padding: 12px 14px;
                            border: 1px solid var(--light);
                        ">
                            <div style="
                                font-size: 12px;
                                font-weight: 600;
                                color: var(--gray);
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 6px;
                            ">📖 Frases donde aparece (${frasesRelacionadas.length})</div>
                            <div style="display:flex;flex-direction:column;gap:4px;max-height:150px;overflow-y:auto;">
                                ${frasesRelacionadas.slice(0,5).map(f => {
                                    const esJeroglificoF = f.esJeroglifico || esJeroglifico;
                                    const hanzi = f.segmentacion?.hanzi || f.original;
                                    const pinyinF = f.pinyinCompleto || f.segmentacion?.pinyin || '';
                                    return `
                                        <div style="
                                            background: var(--white);
                                            border-radius: 6px;
                                            padding: 6px 10px;
                                            border: 1px solid var(--light);
                                            font-size: 12px;
                                            cursor: pointer;
                                            transition: all 0.2s;
                                        " onclick="window.UIStudy._cerrarModalPalabraAvanzado();window.UIStudy._estudiarFrasesConPalabra('${texto.replace(/'/g, "\\'")}')" 
                                           onmouseover="this.style.borderColor='var(--primary)';this.style.background='var(--primary)04'" 
                                           onmouseout="this.style.borderColor='var(--light)';this.style.background='var(--white)'">
                                            <div style="font-weight:600;color:var(--dark);">${esJeroglificoF ? hanzi : f.original}</div>
                                            ${pinyinF ? `<div style="font-size:10px;color:var(--gray-light);">${pinyinF}</div>` : ''}
                                            <div style="font-size:11px;color:var(--gray);">→ ${f.traduccion}</div>
                                        </div>
                                    `;
                                }).join('')}
                                ${frasesRelacionadas.length > 5 ? `
                                    <div style="font-size:11px;color:var(--gray-light);text-align:center;padding:4px;">
                                        +${frasesRelacionadas.length - 5} frases más
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${palabrasRelacionadas.length > 0 ? `
                        <div style="
                            background: var(--bg);
                            border-radius: 8px;
                            padding: 12px 14px;
                            border: 1px solid var(--light);
                        ">
                            <div style="
                                font-size: 12px;
                                font-weight: 600;
                                color: var(--gray);
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                margin-bottom: 6px;
                            ">🔗 Misma familia semántica (${palabrasRelacionadas.length})</div>
                            <div style="display:flex;flex-wrap:wrap;gap:4px;">
                                ${palabrasRelacionadas.map(p => {
                                    const pTexto = p.palabra || p.hanzi || '';
                                    const pPinyin = p.pinyin || '';
                                    return `
                                        <span style="
                                            display: inline-flex;
                                            flex-direction: column;
                                            align-items: center;
                                            padding: 4px 12px;
                                            background: var(--white);
                                            border-radius: 8px;
                                            border: 1px solid var(--light);
                                            cursor: pointer;
                                            font-size: 12px;
                                            transition: all 0.2s;
                                        " onclick="window.UIStudy._cerrarModalPalabraAvanzado();window.UIStudy._abrirModalGuardarPalabra('${pTexto.replace(/'/g, "\\'")}', '${pPinyin.replace(/'/g, "\\'")}', '${(p.significado || '').replace(/'/g, "\\'")}', '${(p.familia || p.familiaSemantica || 'General').replace(/'/g, "\\'")}', '${idioma}', '${p.nivel || nivel}', '${(p.tipo || 'sustantivo').replace(/'/g, "\\'")}')"
                                           onmouseover="this.style.borderColor='var(--primary)';this.style.transform='scale(1.05)'" 
                                           onmouseout="this.style.borderColor='var(--light)';this.style.transform='none'">
                                            <span style="font-weight:600;font-size:14px;">${pTexto}</span>
                                            ${pPinyin ? `<span style="font-size:9px;color:var(--gray-light);">${pPinyin}</span>` : ''}
                                        </span>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div style="
                        border-top: 2px solid var(--primary);
                        padding-top: 12px;
                        margin-top: 4px;
                    ">
                        <button id="btnVolverEstudioAvanzado" style="
                            width: 100%;
                            padding: 10px 20px;
                            font-size: 14px;
                            font-weight: 700;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-family: var(--font);
                            transition: all 0.3s;
                            background: linear-gradient(135deg, #6C5CE7, #00CEC9);
                            color: white;
                        " onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                            <i class="fas fa-arrow-left"></i> Volver al Estudio
                        </button>
                    </div>
                    <div style="
                        font-size: 10px;
                        color: var(--gray-light);
                        text-align: center;
                        border-top: 1px solid var(--light);
                        padding-top: 8px;
                    ">
                        💡 Haz clic en cualquier palabra relacionada para explorar su detalle
                        ${esCaracterRaiz ? ' · 🌟 Carácter raíz' : ''}
                        ${palabraId ? ` · 🆔 ID: ${palabraId}` : ''}
                        <br><span style="color:var(--primary);font-weight:500;">🔄 Todo retorna al Estudio</span>
                    </div>
                </div>
            `;
        }

        // ============================================================
        // CONFIGURAR BOTONES DEL MODAL AVANZADO
        // ============================================================

        _configurarBotonesModalPalabraAvanzado(palabraId, palabra, idioma, nivel, familia, familiaGramatical = '') {
            const btnGuardar = document.getElementById('btnGuardarPalabraAvanzado');
            if (btnGuardar) {
                const newBtn = btnGuardar.cloneNode(true);
                btnGuardar.parentNode.replaceChild(newBtn, btnGuardar);
                newBtn.onclick = async () => {
                    await this._guardarPalabraEnEspacioDesdeModal(palabraId, palabra, idioma, nivel, familia, familiaGramatical);
                };
            }
            
            const btnEstudiar = document.getElementById('btnEstudiarFrasesAvanzado');
            if (btnEstudiar) {
                const newBtn = btnEstudiar.cloneNode(true);
                btnEstudiar.parentNode.replaceChild(newBtn, btnEstudiar);
                newBtn.onclick = () => {
                    this._cerrarModalPalabraAvanzado();
                    this._estudiarFrasesConPalabra(palabra);
                };
            }
            
            const btnEscritura = document.getElementById('btnPracticarEscrituraAvanzado');
            if (btnEscritura) {
                const newBtn = btnEscritura.cloneNode(true);
                btnEscritura.parentNode.replaceChild(newBtn, btnEscritura);
                newBtn.onclick = () => {
                    this._cerrarModalPalabraAvanzado();
                    this._practicarEscrituraDesdeModal(palabra, idioma);
                };
            }
            
            const btnGramatica = document.getElementById('btnBuscarGramaticaAvanzado');
            if (btnGramatica) {
                const newBtn = btnGramatica.cloneNode(true);
                btnGramatica.parentNode.replaceChild(newBtn, btnGramatica);
                newBtn.onclick = () => {
                    this._cerrarModalPalabraAvanzado();
                    this._buscarPalabraEnGramatica(palabra);
                };
            }
            
            const btnVolver = document.getElementById('btnVolverEstudioAvanzado');
            if (btnVolver) {
                const newBtn = btnVolver.cloneNode(true);
                btnVolver.parentNode.replaceChild(newBtn, btnVolver);
                newBtn.onclick = () => {
                    this._cerrarModalPalabraAvanzado();
                };
            }
        }

        // ============================================================
        // CERRAR MODAL AVANZADO
        // ============================================================

        _cerrarModalPalabraAvanzado() {
            const modal = document.getElementById('modalPalabraAvanzado');
            if (modal) {
                modal.style.display = 'none';
            }
            this._modalAvanzadoAbierto = false;
            this._palabraModalActual = null;
        }

        // ============================================================
        // GUARDAR PALABRA EN MI ESPACIO DESDE MODAL
        // ============================================================

        async _guardarPalabraEnEspacioDesdeModal(palabraId, palabra, idioma, nivel, familia, tipo = '') {
            try {
                if (!window.gestorFavoritos) {
                    this.core?.mostrarToast('❌ Gestor de favoritos no disponible', 'error');
                    return;
                }
                
                if (!window.gestorFavoritos._initDone) {
                    await window.gestorFavoritos.init();
                }
                
                const nombreNivel = `📚 Nivel ${nivel}`;
                const nombreFamilia = `📂 ${familia}`;
                
                let idFinal = palabraId;
                if (!idFinal) {
                    const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
                    const encontrada = todasPalabras.find(p => 
                        (p.palabra || p.hanzi || '').toLowerCase() === palabra.toLowerCase()
                    );
                    if (encontrada) {
                        idFinal = encontrada.id;
                    }
                }
                
                if (!idFinal) {
                    const esJeroglifico = this._esJeroglifico(idioma);
                    const nuevaPalabra = {
                        palabra: palabra,
                        hanzi: esJeroglifico ? palabra : '',
                        pinyin: '',
                        significado: palabra,
                        familia: familia || 'sin_clasificar',
                        familias: [familia || 'sin_clasificar'],
                        familiaSemantica: familia || 'sin_clasificar',
                        nivel: nivel,
                        tipo: tipo || 'sustantivo',
                        idioma: idioma,
                        frecuencia: 1,
                        neuroScore: 0.5,
                        nivelDominio: 'nuevo',
                        fechaCreacion: Date.now()
                    };
                    idFinal = await db.guardarPalabra(nuevaPalabra);
                }
                
                if (idFinal) {
                    const esFavorita = await window.gestorFavoritos.estaEnFavoritos('palabra', idFinal);
                    if (!esFavorita) {
                        await window.gestorFavoritos.añadirPalabra(idFinal);
                        await window.gestorFavoritos.añadirPalabraAGrupo(idFinal, nombreNivel);
                        await window.gestorFavoritos.añadirPalabraAGrupo(idFinal, nombreFamilia);
                        this.core?.mostrarToast(`✅ "${palabra}" guardada en ${nombreNivel} → ${nombreFamilia}`, 'success');
                        this._cerrarModalPalabraAvanzado();
                    } else {
                        this.core?.mostrarToast(`ℹ️ "${palabra}" ya está en Mi Espacio`, 'info');
                    }
                }
                
                if (window.UIDashboard) {
                    window.UIDashboard._cargarDashboardInicial(this.core);
                }
                if (window.UIEspacio) {
                    window.UIEspacio._renderizarMiEspacio();
                }
                
            } catch (error) {
                console.error('❌ Error guardando palabra:', error);
                this.core?.mostrarToast('❌ Error al guardar la palabra', 'error');
            }
        }

        // ============================================================
        // ESTUDIAR FRASES CON UNA PALABRA
        // ============================================================

        async _estudiarFrasesConPalabra(texto) {
            if (!texto) {
                this.core?.mostrarToast('❌ No hay palabra para buscar', 'error');
                return;
            }
            
            const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
            const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
            const textoLower = texto.toLowerCase();
            
            const frasesEncontradas = todasFrases.filter(f => {
                const original = (f.original || '').toLowerCase();
                if (original.includes(textoLower)) return true;
                if (f.palabras && Array.isArray(f.palabras)) {
                    for (const p of f.palabras) {
                        const pTexto = (p.palabra || p.hanzi || '').toLowerCase();
                        if (pTexto === textoLower) return true;
                    }
                }
                return false;
            });
            
            if (frasesEncontradas.length === 0) {
                this.core?.mostrarToast(`❌ No se encontraron frases con "${texto}"`, 'warning');
                return;
            }
            
            this.core?.mostrarToast(`📖 Estudiando ${frasesEncontradas.length} frases con "${texto}"`, 'info');
            
            const frasesConContexto = await Promise.all(frasesEncontradas.map(async (f) => {
                const progreso = await db.obtenerProgreso(f.id);
                return { ...f, progreso };
            }));
            
            frasesConContexto.sort((a, b) => {
                const rcnA = a.progreso?.rcn || 0;
                const rcnB = b.progreso?.rcn || 0;
                return rcnA - rcnB;
            });
            
            pipeline.frases = frasesConContexto;
            pipeline.indiceFrase = 0;
            await pipeline.cargarFrase(0);
            
            if (this.core) {
                this.core.irAModulo('study');
            }
        }

        // ============================================================
        // PRACTICAR ESCRITURA DESDE MODAL
        // ============================================================

        async _practicarEscrituraDesdeModal(texto, idioma) {
            this.core?.mostrarToast(`✍️ Practicando escritura de "${texto}"`, 'info');
            
            const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
            const fraseContexto = todasFrases.find(f => {
                const original = (f.original || '').toLowerCase();
                return original.includes(texto.toLowerCase());
            });
            
            if (window.UIEspacio && window.UIEspacio._ejercicioRellenar) {
                await window.UIEspacio._ejercicioRellenar(texto, idioma);
            } else {
                const resultado = await this.core?.prompt(
                    `✍️ Practica la escritura de "${texto}"\n\n${fraseContexto ? `Contexto: "${fraseContexto.original}"` : ''}`,
                    '',
                    `Escribe "${texto}" correctamente...`,
                    '✍️ Escritura'
                );
                if (resultado && resultado.trim() === texto) {
                    this.core?.mostrarToast('✅ ¡Correcto!', 'success');
                } else if (resultado) {
                    this.core?.mostrarToast(`❌ Incorrecto. La palabra es: "${texto}"`, 'error');
                }
            }
        }

        // ============================================================
        // BUSCAR PALABRA EN GRAMÁTICA
        // ============================================================

        _buscarPalabraEnGramatica(texto) {
            if (window.UIGrammar) {
                window.UIGrammar._busquedaGramatica = texto;
                window.UIGrammar._cargarGramatica();
                if (this.core) {
                    this.core.irAModulo('grammar');
                    this.core?.mostrarToast(`🔍 Buscando "${texto}" en gramática`, 'info');
                }
            } else {
                this.core?.mostrarToast('🔍 Módulo de gramática no disponible', 'warning');
            }
        }

        // ============================================================
        // TOGGLE FRASE FAVORITA
        // ============================================================
        
        async _toggleFraseFavorita(fraseId, checked) {
            if (!fraseId) {
                if (this.core) this.core.mostrarToast('❌ Error: ID de frase no válido', 'error');
                return;
            }
            const nivelReal = this._obtenerNivelRealUsuario();
            const nombreNivel = `📚 Nivel ${nivelReal}`;
            try {
                if (!window.gestorFavoritos || !gestorFavoritos._initDone) await window.gestorFavoritos.init();
                if (checked) {
                    const yaExiste = await gestorFavoritos.estaEnFavoritos('frase', fraseId);
                    if (yaExiste) {
                        if (this.core) this.core.mostrarToast('ℹ️ La frase ya está en Mi Espacio', 'info');
                        return;
                    }
                    const result = await gestorFavoritos.añadirFrase(fraseId);
                    if (result) {
                        await gestorFavoritos.añadirFraseAGrupo(fraseId, this.GRUPO_USUARIO || '📌 Seleccionadas por Usuario');
                        await gestorFavoritos.añadirFraseAGrupo(fraseId, nombreNivel);
                        if (this.core) this.core.mostrarToast(`✅ Frase guardada en ${nombreNivel}`, 'success');
                    }
                } else {
                    await gestorFavoritos.eliminarFrase(fraseId);
                    if (this.core) this.core.mostrarToast('🗑️ Frase eliminada de Mi Espacio', 'warning');
                }
            } catch (error) {
                console.warn('⚠️ Error al gestionar favorito:', error);
            }
            try {
                if (window.uiCore) window.uiCore._actualizarEspacioStats();
                if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this.core);
                if (window.UIEspacio) window.UIEspacio._renderizarMiEspacio();
            } catch (e) {}
        }

        // ============================================================
        // LIBRO DE LECTURA - MANTENIDO PARA COMPATIBILIDAD CON BIBLIOTECA
        // ============================================================

        async _abrirLibroLectura() {
            const core = this.core;
            const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
            if (this._libroAbierto && this._modoVista === 'libro') return;
            this._libroAbierto = true;
            this._modoVista = 'libro';
            this._cerrandoLibro = false;
            this._estudiandoTemaDesdeLibro = false;
            
            try {
                const todasHistorias = await db.obtenerHistoriasPorIdioma(idioma);
                if (!todasHistorias || todasHistorias.length === 0) {
                    core?.mostrarToast('📚 No hay historias cargadas. Importa o genera contenido primero.', 'warning');
                    this._libroAbierto = false;
                    this._modoVista = 'frase';
                    return;
                }

                const historiasConFrases = [];
                for (const h of todasHistorias) {
                    const frasesReales = await db.obtenerFrasesPorHistoria(h.id) || [];
                    const totalFrases = frasesReales.length;
                    let completadas = 0;
                    for (const f of frasesReales) {
                        const progreso = await db.obtenerProgreso(f.id);
                        if (progreso && (progreso.estado === 'completada' || progreso.rcn >= 4)) completadas++;
                    }
                    const pct = totalFrases > 0 ? Math.round((completadas / totalFrases) * 100) : 0;
                    historiasConFrases.push({
                        ...h,
                        _frasesReales: frasesReales,
                        _totalFrases: totalFrases,
                        _completadas: completadas,
                        _pct: pct,
                        _esLeida: this._historiasLeidas.has(h.id)
                    });
                }

                const historiasPorTema = {};
                const temasMap = {};
                for (const h of historiasConFrases) {
                    const temaId = h.temaId || 'sin_tema';
                    if (!historiasPorTema[temaId]) historiasPorTema[temaId] = [];
                    historiasPorTema[temaId].push(h);
                }
                for (const temaId of Object.keys(historiasPorTema)) {
                    if (temaId !== 'sin_tema') {
                        const tema = await db.obtenerTema(temaId);
                        temasMap[temaId] = tema?.nombre || `📚 Tema ${Object.keys(temasMap).length + 1}`;
                    } else {
                        temasMap[temaId] = '📂 Sin tema asignado';
                    }
                }

                const fiabilidad = await vigiaGenerator.calcularFiabilidad(idioma);
                const totalHistorias = todasHistorias.length;
                const leidas = this._historiasLeidas.size;
                const pctLeidas = totalHistorias > 0 ? Math.round((leidas / totalHistorias) * 100) : 0;
                let totalFrasesReales = 0;
                for (const h of historiasConFrases) totalFrasesReales += h._totalFrases;
                
                let html = `
                    <div class="libro-lectura-container" style="padding:16px;max-width:100%;">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:12px 20px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:14px;border:2px solid var(--primary)20;">
                            <div>
                                <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">📚 Libro de Lectura</h2>
                                <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">${totalHistorias} historias · ${this._getNombreIdioma(idioma)}</p>
                                <div style="display:flex;gap:12px;margin-top:4px;font-size:11px;color:var(--gray-light);flex-wrap:wrap;">
                                    <span>📝 ${totalFrasesReales} frases</span>
                                </div>
                            </div>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                                <button class="btn-secondary" onclick="window.UIStudy._volverDelLibro()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;"><i class="fas fa-arrow-left"></i> Volver</button>
                                <button class="btn-primary" onclick="window.UIStudy._generarFrasesDesdeLibro()" style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;${this._generandoFrases ? 'opacity:0.6;cursor:not-allowed;' : ''}" ${this._generandoFrases ? 'disabled' : ''}><i class="fas fa-magic"></i> ${this._generandoFrases ? 'Generando...' : 'Generar Frases'}</button>
                            </div>
                        </div>
                        <div style="background:var(--white);border-radius:12px;padding:12px 18px;margin-bottom:16px;border:2px solid var(--primary)20;box-shadow:var(--shadow);">
                            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                                <div style="display:flex;align-items:center;gap:10px;">
                                    <span style="font-size:20px;">📖</span>
                                    <div>
                                        <div style="font-size:14px;font-weight:600;color:var(--dark);">Progreso de Lectura <span class="historias-leidas-contador" style="font-size:12px;font-weight:400;color:var(--gray);">${leidas} leídas</span></div>
                                        <div style="font-size:12px;color:var(--gray);">${totalHistorias} historias en total</div>
                                    </div>
                                </div>
                                <div style="text-align:center;min-width:80px;">
                                    <div style="font-size:28px;font-weight:800;color:${pctLeidas >= 80 ? 'var(--success)' : pctLeidas >= 40 ? 'var(--warning)' : 'var(--danger)'};">${pctLeidas}%</div>
                                    <div style="font-size:9px;color:var(--gray-light);">${pctLeidas >= 80 ? '🏆 Excelente' : pctLeidas >= 40 ? '📖 Buen progreso' : '🌱 Empieza a leer'}</div>
                                </div>
                            </div>
                            <div style="height:6px;background:var(--bg);border-radius:3px;overflow:hidden;margin-top:8px;">
                                <div class="historias-leidas-progreso" style="height:100%;width:${pctLeidas}%;background:${pctLeidas >= 80 ? 'linear-gradient(90deg, #6C5CE7, #00CEC9)' : 'linear-gradient(90deg, #6C5CE7, #A29BFE)'};border-radius:3px;transition:width 0.6s ease;"></div>
                            </div>
                        </div>
                        <div style="background:var(--white);border-radius:12px;padding:14px 18px;margin-bottom:16px;border:2px solid ${this._getColorFiabilidad(fiabilidad.fiabilidad)};box-shadow:var(--shadow);">
                            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                                <div style="display:flex;align-items:center;gap:10px;">
                                    <span style="font-size:24px;">🧠</span>
                                    <div>
                                        <div style="font-size:14px;font-weight:600;color:var(--dark);">Calidad del Generador</div>
                                        <div style="font-size:12px;color:var(--gray);">${fiabilidad.nivelConfianza}</div>
                                    </div>
                                </div>
                                <div style="text-align:center;min-width:80px;">
                                    <div style="font-size:28px;font-weight:800;color:${this._getColorFiabilidad(fiabilidad.fiabilidad)};">${fiabilidad.fiabilidad}%</div>
                                    <div style="font-size:9px;color:var(--gray-light);">${fiabilidad.fiabilidad >= 40 ? '✅ Listo para generar' : '⏳ Añade más contenido'}</div>
                                </div>
                            </div>
                            <div style="height:6px;background:var(--bg);border-radius:3px;overflow:hidden;margin-top:8px;">
                                <div style="height:100%;width:${fiabilidad.fiabilidad}%;background:${this._getColorFiabilidad(fiabilidad.fiabilidad)};border-radius:3px;transition:width 1s ease;"></div>
                            </div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:16px;">
                `;

                const temasOrdenados = Object.keys(historiasPorTema).sort((a, b) => {
                    const nombreA = temasMap[a] || '';
                    const nombreB = temasMap[b] || '';
                    return nombreA.localeCompare(nombreB);
                });

                for (const temaId of temasOrdenados) {
                    const historias = historiasPorTema[temaId] || [];
                    const nombreTema = temasMap[temaId] || '📚 Tema sin nombre';
                    let totalFrasesTema = 0, completadasTema = 0;
                    for (const h of historias) {
                        totalFrasesTema += h._totalFrases;
                        completadasTema += h._completadas;
                    }
                    const pctTema = totalFrasesTema > 0 ? Math.round((completadasTema / totalFrasesTema) * 100) : 0;
                    const leidasTema = historias.filter(h => this._historiasLeidas.has(h.id)).length;
                    const pctLeidasTema = historias.length > 0 ? Math.round((leidasTema / historias.length) * 100) : 0;
                    let nombreMostrar = nombreTema;
                    if (nombreTema === '📚 Tema sin nombre' || nombreTema === '📂 Sin tema asignado' || nombreTema.startsWith('📚 Tema ')) {
                        if (historias.length > 0 && historias[0].titulo) nombreMostrar = `📚 ${historias[0].titulo.substring(0, 25)}...`;
                        else nombreMostrar = `📚 Historia(s) ${temasOrdenados.indexOf(temaId) + 1}`;
                    }
                    html += `
                        <div style="background:var(--white);border-radius:12px;padding:14px 16px;box-shadow:var(--shadow);border-left:4px solid ${pctTema >= 80 ? 'var(--success)' : pctTema >= 40 ? 'var(--primary)' : 'var(--light)'};">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:4px;">
                                <div>
                                    <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">${nombreMostrar}</h3>
                                    <span style="font-size:12px;color:var(--gray-light);">${historias.length} historias · ${totalFrasesTema} frases · ${leidasTema} leídas</span>
                                    <span style="font-size:11px;color:var(--success);margin-left:8px;">${pctTema}% completado</span>
                                </div>
                                <button class="btn-primary" onclick="window.UIStudy._estudiarTemaDesdeLibro('${temaId}')" style="padding:4px 14px;font-size:11px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-play"></i> Estudiar Todo</button>
                            </div>
                            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px;">
                    `;

                    for (const historia of historias) {
                        const totalFrases = historia._totalFrases || 0;
                        const pct = historia._pct || 0;
                        const esLeida = historia._esLeida || false;
                        const tituloMostrar = historia.titulo || '📖 Historia sin título';
                        html += `
                            <div class="historia-card" data-historia-id="${historia.id}" style="background: ${esLeida ? 'rgba(0, 184, 148, 0.05)' : 'var(--white)'};border-radius: 8px;padding: 10px 12px;border: 1px solid ${esLeida ? 'var(--success)' : 'var(--light)'};border-left: 4px solid ${esLeida ? 'var(--success)' : 'var(--light)'};transition: all 0.3s ease;position: relative;">
                                <div style="display:flex;justify-content:space-between;align-items:start;gap:6px;">
                                    <div style="flex:1;min-width:0;">
                                        <div style="font-size:14px;font-weight:600;color:var(--dark);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${tituloMostrar}">${tituloMostrar}</div>
                                        <div style="display:flex;gap:8px;font-size:11px;color:var(--gray-light);flex-wrap:wrap;align-items:center;margin-top:2px;">
                                            <span>${totalFrases} frases</span>
                                            <span>${pct}% completado</span>
                                            <span class="historia-leida-tag" style="display:${esLeida ? 'inline-block' : 'none'};font-size:10px;color:var(--success);font-weight:600;">✅ Leída</span>
                                        </div>
                                        <div style="height:3px;background:var(--bg);border-radius:2px;overflow:hidden;margin-top:4px;max-width:120px;">
                                            <div class="historia-progreso" style="height:100%;width:${esLeida ? 100 : pct}%;background:${esLeida ? 'var(--success)' : 'var(--primary)'};border-radius:2px;transition:width 0.5s ease;"></div>
                                        </div>
                                    </div>
                                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
                                        <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;padding:2px 8px;background:${esLeida ? 'var(--success)08' : 'var(--bg)'};border-radius:8px;border:1px solid ${esLeida ? 'var(--success)' : 'var(--light)'};transition:all 0.3s;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='${esLeida ? 'var(--success)' : 'var(--light)'}'">
                                            <input type="checkbox" class="historia-checkbox-input" ${esLeida ? 'checked' : ''} onchange="window.UIStudy._toggleHistoriaLeida(${historia.id}, this.checked)" style="width:14px;height:14px;cursor:pointer;">
                                            <span class="historia-leida-badge" style="font-size:10px;font-weight:600;color:${esLeida ? 'var(--success)' : 'var(--gray)'};">${esLeida ? '✅ Leída' : '📖 No leída'}</span>
                                        </label>
                                        <div style="display:flex;gap:4px;">
                                            <button class="btn-secondary" onclick="window.UIStudy._leerHistoriaCompletaDesdeLibro(${historia.id})" style="padding:2px 10px;font-size:10px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-book"></i> Leer</button>
                                            <button class="btn-secondary" onclick="window.UIStudy._estudiarHistoriaDesdeLibro(${historia.id})" style="padding:2px 10px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-play"></i> Estudiar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }

                    html += `</div></div>`;
                }

                html += `</div></div>`;
                const container = document.getElementById('cardContainer');
                if (container) {
                    container.innerHTML = html;
                    this._modoVista = 'libro';
                    this._actualizarContadorHistoriasLeidas();
                }
            } catch (e) {
                console.error('❌ Error abriendo libro de lectura:', e);
                this.core?.mostrarToast('❌ Error al abrir el libro de lectura', 'error');
                this._libroAbierto = false;
                this._modoVista = 'frase';
            }
        }

        // ============================================================
        // VOLVER DEL LIBRO
        // ============================================================

        _volverDelLibro() {
            console.log('🔙 Volviendo del libro al estudio');
            this._cerrandoLibro = true;
            this._modoVista = 'frase';
            this._libroAbierto = false;
            this._estudiandoTemaDesdeLibro = false;
            try {
                if (pipeline && pipeline.fraseActual) this._renderizarFraseInteractiva();
                else if (pipeline && pipeline.frases && pipeline.frases.length > 0) pipeline.cargarFrase(0);
                else this.mostrarPantallaInicio();
                if (this.core) this.core.irAModulo('study');
            } catch (e) {
                console.error('❌ Error volviendo del libro:', e);
            }
            setTimeout(() => { this._cerrandoLibro = false; }, 500);
        }

        // ============================================================
        // ESTUDIAR TEMA DESDE LIBRO
        // ============================================================

        async _estudiarTemaDesdeLibro(temaId) {
            if (this._cerrandoLibro) return;
            this._cerrandoLibro = true;
            this._modoVista = 'frase';
            this._libroAbierto = false;
            this._estudiandoTemaDesdeLibro = true;
            this._temaIdDesdeLibro = temaId;
            
            try {
                const tema = await db.obtenerTema(temaId);
                if (!tema) {
                    this.core?.mostrarToast('❌ Tema no encontrado', 'error');
                    this._cerrandoLibro = false;
                    this._estudiandoTemaDesdeLibro = false;
                    return;
                }
                this.core?.mostrarToast(`📖 Cargando tema "${tema.nombre}"...`, 'info');
                pipeline._estudiandoTema = true;
                pipeline._temaActual = temaId;
                this._origenHistoriaActual = 'tema';
                await pipeline.estudiarTema(temaId);
                setTimeout(async () => { await this._verificarProgresoTema(); }, 500);
                setTimeout(() => {
                    this._modoVista = 'frase';
                    this._libroAbierto = false;
                    this._renderizarFraseInteractiva();
                    if (this.core) this.core.irAModulo('study');
                    this.core?.mostrarToast('✅ Tema cargado correctamente', 'success');
                    this._cerrandoLibro = false;
                    this._estudiandoTemaDesdeLibro = false;
                }, 300);
            } catch (error) {
                console.error('❌ Error estudiando tema:', error);
                this.core?.mostrarToast('❌ Error al cargar el tema', 'error');
                this._modoVista = 'libro';
                this._libroAbierto = true;
                this._cerrandoLibro = false;
                this._estudiandoTemaDesdeLibro = false;
                this._abrirLibroLectura();
            }
        }

        // ============================================================
        // ESTUDIAR HISTORIA DESDE LIBRO
        // ============================================================

        async _estudiarHistoriaDesdeLibro(historiaId) {
            if (this._cerrandoLibro) return;
            this._cerrandoLibro = true;
            this._modoVista = 'frase';
            this._libroAbierto = false;
            
            try {
                const historia = await db.get('historias', historiaId);
                if (historia && historia.temaId) {
                    this._temaIdDesdeLibro = historia.temaId;
                    this._temaIdDesdeHistoria = historia.temaId;
                    pipeline._estudiandoTema = true;
                    pipeline._temaActual = historia.temaId;
                }
                this.core?.mostrarToast('📖 Cargando historia...', 'info');
                const esOnda = historia && historia._esOnda === true;
                const esCruzada = historia && historia._esOndaCruzada === true;
                const esTono = historia && historia._esTono === true;
                let origen = 'tema';
                if (esCruzada) origen = 'cruzada';
                else if (esTono) origen = 'tonos';
                else if (esOnda) origen = 'elipse';
                this._origenHistoriaActual = origen;
                console.log(`📖 Estudiando historia "${historia?.titulo}" con origen: ${origen}`);
                await pipeline.estudiarHistoria(historiaId, origen);
                setTimeout(async () => { await this._verificarProgresoTema(); }, 500);
                setTimeout(() => {
                    this._modoVista = 'frase';
                    this._libroAbierto = false;
                    this._renderizarFraseInteractiva();
                    if (this.core) this.core.irAModulo('study');
                    this.core?.mostrarToast('✅ Historia cargada correctamente', 'success');
                    this._cerrandoLibro = false;
                }, 300);
            } catch (error) {
                console.error('❌ Error estudiando historia:', error);
                this.core?.mostrarToast('❌ Error al cargar la historia', 'error');
                this._modoVista = 'libro';
                this._libroAbierto = true;
                this._cerrandoLibro = false;
                this._abrirLibroLectura();
            }
        }

        // ============================================================
        // LEER HISTORIA COMPLETA DESDE LIBRO
        // ============================================================

        async _leerHistoriaCompletaDesdeLibro(historiaId) {
            try {
                const historia = await db.get('historias', historiaId);
                if (!historia) {
                    this.core?.mostrarToast('❌ Historia no encontrada', 'error');
                    return;
                }
                const frases = await db.obtenerFrasesPorHistoria(historiaId);
                this._historiaActual = frases;
                this._historiaTitulo = historia.titulo || 'Historia sin título';
                this._historiaIdActual = historiaId;
                this._modoVista = 'historia_completa';
                await this._renderizarHistoriaCompletaDesdeLibro();
            } catch (e) {
                console.error('❌ Error leyendo historia:', e);
                this.core?.mostrarToast('❌ Error al leer la historia', 'error');
            }
        }

        // ============================================================
        // RENDERIZAR HISTORIA COMPLETA DESDE LIBRO
        // ============================================================

        async _renderizarHistoriaCompletaDesdeLibro() {
            const container = document.getElementById('cardContainer');
            if (!container) return;
            const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
            const esJeroglifico = this._esJeroglifico(idioma);
            
            try {
                const frasesReales = await db.obtenerFrasesPorHistoria(this._historiaIdActual);
                this._historiaActual = frasesReales;
                let html = `
                    <div style="padding:16px;max-width:900px;margin:0 auto;">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
                            <button class="btn-secondary" onclick="window.UIStudy._volverDelLibro()" style="padding:6px 14px;font-size:13px;"><i class="fas fa-arrow-left"></i> Volver al libro</button>
                            <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;flex:1;">📖 ${this._historiaTitulo}</h2>
                            <span style="font-size:12px;color:var(--gray-light);">${this._historiaActual.length} frases</span>
                            <button class="btn-primary" onclick="window.UIStudy._estudiarHistoriaDesdeLibro(${this._historiaIdActual})" style="padding:4px 12px;font-size:11px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-play"></i> Estudiar todo</button>
                            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;padding:4px 10px;background:var(--bg);border-radius:8px;border:1px solid var(--light);">
                                <input type="checkbox" ${this._historiasLeidas.has(this._historiaIdActual) ? 'checked' : ''} onchange="window.UIStudy._toggleHistoriaLeida(${this._historiaIdActual}, this.checked)" style="width:14px;height:14px;cursor:pointer;">
                                <span>✅ Marcar como leída</span>
                            </label>
                        </div>
                `;

                let numFrase = 0;
                for (const frase of this._historiaActual) {
                    numFrase++;
                    const transcripcion = await this._obtenerTranscripcionFrase(frase);
                    const esFavorita = await gestorFavoritos.estaEnFavoritos('frase', frase.id);
                    const nivelReal = this._obtenerNivelRealUsuario();
                    let palabrasHtml = '';
                    try {
                        const palabrasCompletas = await this._obtenerPalabrasCompletas(frase);
                        if (palabrasCompletas.length > 0) {
                            palabrasHtml = `
                                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;padding-top:8px;border-top:1px solid var(--light);">
                                    ${palabrasCompletas.map(p => {
                                        const texto = p.palabra || p.hanzi || '';
                                        const pinyinPalabra = p.pinyin || '';
                                        const transcripcionPalabra = p.transcripcion || '';
                                        const significado = p.significado || '';
                                        return `
                                            <span style="display:inline-flex;flex-direction:column;align-items:center;padding:2px 10px;border-radius:10px;background:var(--bg);border:1px solid var(--light);cursor:pointer;font-size:12px;"
                                                  onclick="window.UIStudy._abrirModalGuardarPalabra('${texto.replace(/'/g, "\\'")}', '${(esJeroglifico ? pinyinPalabra : transcripcionPalabra).replace(/'/g, "\\'")}', '${significado.replace(/'/g, "\\'")}', '${(p.familia || 'General').replace(/'/g, "\\'")}', '${idioma}', '${nivelReal}', '${(p.tipo || 'sustantivo').replace(/'/g, "\\'")}')"
                                                  onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" 
                                                  onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                                                <span style="font-weight:600;font-size:14px;">${texto}</span>
                                                ${esJeroglifico ? (pinyinPalabra ? `<span style="font-size:9px;color:var(--gray-light);">${pinyinPalabra}</span>` : '') : (transcripcionPalabra ? `<span style="font-size:9px;color:var(--gray-light);">${transcripcionPalabra}</span>` : '')}
                                                <span style="font-size:8px;color:var(--primary);">⭐ Guardar</span>
                                            </span>
                                        `;
                                    }).join('')}
                                </div>
                            `;
                        }
                    } catch (e) {}
                    
                    html += `
                        <div style="background:var(--white);border-radius:10px;padding:14px 16px;margin-bottom:12px;box-shadow:var(--shadow);border-left:4px solid var(--primary);">
                            <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:8px;">
                                <div style="flex:1;min-width:200px;">
                                    <div style="display:flex;align-items:center;gap:6px;">
                                        <span style="font-size:12px;font-weight:600;color:var(--gray-light);">${numFrase}.</span>
                                        <div style="font-size:18px;font-weight:700;color:var(--dark);">${esJeroglifico ? (frase.segmentacion?.hanzi || frase.original) : frase.original}</div>
                                    </div>
                                    ${transcripcion ? `<div style="font-size:15px;color:${esJeroglifico ? 'var(--primary)' : 'var(--secondary)'};margin-top:4px;letter-spacing:1px;margin-left:22px;">${esJeroglifico ? '🔊' : '🎤'} ${transcripcion}</div>` : ''}
                                    <div style="font-size:16px;color:var(--gray);margin-top:4px;margin-left:22px;">→ ${frase.traduccion}</div>
                                    ${frase.reglaGramatical ? `<div style="font-size:11px;color:var(--primary);margin-top:4px;padding:4px 8px;background:var(--bg);border-radius:4px;display:inline-block;margin-left:22px;">📋 ${frase.reglaGramatical}</div>` : ''}
                                </div>
                                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                                    <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;padding:4px 8px;background:var(--bg);border-radius:6px;border:1px solid var(--light);">
                                        <input type="checkbox" ${esFavorita ? 'checked' : ''} onchange="window.UIStudy._toggleFraseFavorita(${frase.id}, this.checked)" style="width:14px;height:14px;cursor:pointer;">
                                        <span>⭐</span>
                                    </label>
                                    <button class="btn-secondary" onclick="window.UIStudy._estudiarFraseDesdeHistoria(${frase.id})" style="padding:2px 10px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-play"></i> Estudiar</button>
                                </div>
                            </div>
                            ${palabrasHtml}
                        </div>
                    `;
                }

                html += `
                        <div style="display:flex;gap:10px;margin-top:16px;justify-content:center;flex-wrap:wrap;">
                            <button class="btn-secondary" onclick="window.UIStudy._volverDelLibro()" style="padding:8px 20px;font-size:13px;"><i class="fas fa-arrow-left"></i> Volver al libro</button>
                            <button class="btn-primary" onclick="window.UIStudy._estudiarHistoriaDesdeLibro(${this._historiaIdActual})" style="padding:8px 20px;font-size:13px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;"><i class="fas fa-play"></i> Estudiar toda la historia</button>
                        </div>
                    </div>
                `;
                container.innerHTML = html;
            } catch (e) {
                console.error('❌ Error renderizando historia completa:', e);
                container.innerHTML = `
                    <div style="text-align:center;padding:40px;color:var(--gray);">
                        <i class="fas fa-exclamation-triangle" style="font-size:48px;color:var(--danger);display:block;margin-bottom:16px;"></i>
                        <p style="font-size:16px;font-weight:500;">Error al cargar la historia</p>
                        <button class="btn-primary" onclick="window.UIStudy._volverDelLibro()" style="margin-top:12px;"><i class="fas fa-arrow-left"></i> Volver</button>
                    </div>
                `;
            }
        }

        // ============================================================
        // CERRAR HISTORIA COMPLETA
        // ============================================================

        _cerrarHistoriaCompleta() { this._volverDelLibro(); }

        // ============================================================
        // ESTUDIAR FRASE DESDE HISTORIA
        // ============================================================

        async _estudiarFraseDesdeHistoria(fraseId) {
            try {
                const frases = await db.obtenerFrases();
                const frase = frases.find(f => f.id === fraseId);
                if (!frase) {
                    this.core?.mostrarToast('❌ Frase no encontrada', 'error');
                    return;
                }
                this._cerrandoLibro = true;
                this._modoVista = 'frase';
                this._libroAbierto = false;
                if (frase.historiaId) {
                    const historia = await db.get('historias', frase.historiaId);
                    if (historia && historia.temaId) this._temaIdDesdeHistoria = historia.temaId;
                }
                pipeline.frases = [frase];
                pipeline.indiceFrase = 0;
                await pipeline.cargarFrase(0);
                if (this.core) this.core.irAModulo('study');
                setTimeout(() => { this._cerrandoLibro = false; }, 300);
            } catch (e) {
                console.error('❌ Error estudiando frase desde historia:', e);
                this.core?.mostrarToast('❌ Error al cargar la frase', 'error');
            }
        }

        // ============================================================
        // GENERAR FRASES DESDE LIBRO
        // ============================================================

        async _generarFrasesDesdeLibro() {
            if (this._generandoFrases) {
                this.core?.mostrarToast('⏳ Ya hay una generación en curso', 'warning');
                return;
            }
            const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
            const nivel = this._obtenerNivelRealUsuario();
            const fiabilidad = await vigiaGenerator.calcularFiabilidad(idioma);
            if (fiabilidad.fiabilidad < 40) {
                this.core?.mostrarToast(`📚 El generador necesita más datos (${fiabilidad.fiabilidad}%). Añade más historias.`, 'warning');
                return;
            }
            this._generandoFrases = true;
            this._frasesGeneradas = [];
            this._frasesTraducidas = {};
            this._frasesGuardadas = {};
            this.core?.mostrarToast('🧠 Generando frases con Vigía...', 'info');
            try {
                const resultado = await vigiaGenerator.generarFrases(idioma, 5, nivel, 'Generado desde Libro');
                if (resultado.exito && resultado.frases.length > 0) {
                    this._frasesGeneradas = resultado.frases;
                    this._mostrarModalFrasesGeneradas(resultado.frases, resultado.fiabilidad);
                } else {
                    this.core?.mostrarToast(resultado.mensaje || '❌ No se pudieron generar frases', 'error');
                }
            } catch (error) {
                console.error('❌ Error generando frases:', error);
                this.core?.mostrarToast('❌ Error: ' + error.message, 'error');
            } finally {
                this._generandoFrases = false;
            }
        }

        // ============================================================
        // MODAL MEJORADO PARA FRASES GENERADAS
        // ============================================================

        _mostrarModalFrasesGeneradas(frases, fiabilidad) {
            const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
            const nombreIdioma = this._getNombreIdioma(idioma);
            const esJeroglifico = this._esJeroglifico(idioma);
            const hasTraduccion = frases.some(f => f.traduccion && f.traduccion.trim() !== '');
            
            let html = `
                <div style="background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:14px;padding:16px 20px;margin-bottom:16px;border:2px solid var(--primary)20;">
                    <div>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="font-size:28px;">🧠</span>
                            <div>
                                <h3 style="font-size:18px;font-weight:700;color:var(--dark);margin:0;">Frases Generadas <span style="font-size:13px;font-weight:400;color:var(--gray);">(${frases.length} nuevas)</span></h3>
                                <p style="font-size:12px;color:var(--gray);margin:2px 0 0;">${nombreIdioma} · Nivel ${this._obtenerNivelRealUsuario()} · Fiabilidad: ${fiabilidad.fiabilidad}% ${!hasTraduccion ? ' · ⏳ Traducción pendiente' : ''} ${esJeroglifico ? ' · 🀄 Jeroglífico' : ' · 🔤 Alfabético'}</p>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn-success" onclick="window.UIStudy._guardarTodasFrasesGeneradas()" style="padding:8px 20px;font-size:13px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 4px 20px rgba(0,184,148,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'"><i class="fas fa-save"></i> Guardar Todas</button>
                        <button class="btn-secondary" onclick="window.UIStudy._cerrarModalFrasesGeneradas()" style="padding:8px 20px;font-size:13px;background:var(--bg);border:1px solid var(--light);border-radius:8px;cursor:pointer;"><i class="fas fa-times"></i> Cerrar</button>
                    </div>
                </div>
            `;

            for (let i = 0; i < frases.length; i++) {
                const f = frases[i];
                const idx = i;
                const tieneTraduccion = f.traduccion && f.traduccion.trim() !== '';
                const estaTraducida = this._frasesTraducidas[idx] === true;
                const estaGuardada = this._frasesGuardadas[idx] === true;
                let transcripcionMostrar = '';
                if (esJeroglifico) transcripcionMostrar = f.pinyinCompleto || '';
                else transcripcionMostrar = f.transcripcion || '';
                html += `
                    <div style="background:var(--white);border-radius:12px;padding:16px 20px;margin-bottom:12px;border:2px solid ${estaGuardada ? 'var(--success)' : estaTraducida ? 'var(--secondary)' : 'var(--light)'};box-shadow:${estaGuardada ? '0 4px 20px rgba(0,184,148,0.15)' : 'var(--shadow)'};transition:all 0.3s ease;position:relative;">
                        ${estaGuardada ? `<div style="position:absolute;top:-8px;right:16px;background:var(--success);color:white;padding:2px 14px;border-radius:12px;font-size:10px;font-weight:600;">✅ Guardada</div>` : ''}
                        <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:8px;">
                            <div style="flex:1;min-width:200px;">
                                <div style="font-size:20px;font-weight:700;color:var(--dark);">${f.original}</div>
                                ${transcripcionMostrar ? `<div style="font-size:14px;color:${esJeroglifico ? 'var(--primary)' : 'var(--secondary)'};margin-top:2px;letter-spacing:1px;font-weight:500;">${esJeroglifico ? '🔊' : '🎤'} ${transcripcionMostrar}</div>` : `<div style="font-size:12px;color:var(--danger);margin-top:2px;">⚠️ ${esJeroglifico ? 'Sin pinyin' : 'Sin transcripción fonética'}</div>`}
                                <div style="font-size:15px;color:var(--gray);margin-top:4px;">${tieneTraduccion ? `→ ${f.traduccion}` : estaTraducida ? `→ ${f.traduccion || 'Traducción obtenida'}` : '⏳ Traducción pendiente'}</div>
                                ${f.reglaGramatical && !f.reglaGramatical.startsWith('[') ? `<div style="font-size:11px;color:var(--primary);margin-top:4px;padding:2px 10px;background:var(--primary)08;border-radius:4px;display:inline-block;">📋 ${f.reglaGramatical}</div>` : ''}
                            </div>
                            <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                                ${!tieneTraduccion && !estaTraducida ? `<button class="btn-secondary" onclick="window.UIStudy._traducirFraseGenerada(${idx})" style="padding:6px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'" ${this._traduciendoFrase ? 'disabled' : ''}><i class="fas fa-language"></i> Traducir con Groq</button>` : ''}
                                ${!estaGuardada ? `<button class="btn-success" onclick="window.UIStudy._guardarFraseGenerada(${idx})" style="padding:6px 14px;font-size:11px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'" ${!tieneTraduccion && !estaTraducida ? 'disabled title="Traduce la frase primero"' : ''}><i class="fas fa-save"></i> Guardar</button>` : ''}
                                <span style="font-size:10px;color:var(--gray-light);">${i + 1}/${frases.length}</span>
                            </div>
                        </div>
                        ${estaTraducida && !tieneTraduccion ? `<div style="margin-top:8px;font-size:11px;color:var(--success);background:var(--success)08;padding:4px 12px;border-radius:6px;display:inline-block;">✅ Traducido con Groq</div>` : ''}
                    </div>
                `;
            }

            const totalGuardadas = Object.values(this._frasesGuardadas).filter(v => v).length;
            const totalTraducidas = Object.values(this._frasesTraducidas).filter(v => v).length;
            html += `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--light);font-size:12px;color:var(--gray-light);flex-wrap:wrap;gap:8px;">
                    <div><span>📊 ${frases.length} frases generadas</span><span style="margin-left:12px;">✅ ${totalGuardadas} guardadas</span><span style="margin-left:12px;">🔄 ${totalTraducidas} traducidas</span><span style="margin-left:12px;">${esJeroglifico ? '🀄' : '🔤'} ${totalTraducidas > 0 ? 'Con pinyin/transcripción' : 'Sin transcripción'}</span></div>
                    <div><span style="font-size:10px;color:var(--gray-light);">💡 Traduce cada frase para obtener también su ${esJeroglifico ? 'pinyin' : 'transcripción fonética'}</span></div>
                </div>
            `;

            if (this.core) {
                this.core.abrirModal('🧠 Frases Generadas');
                const textarea = document.getElementById('jsonTextarea');
                if (textarea) {
                    textarea.style.display = 'none';
                    let modalBody = textarea.parentElement;
                    let container = document.getElementById('frasesGeneradasContainer');
                    if (!container) {
                        container = document.createElement('div');
                        container.id = 'frasesGeneradasContainer';
                        container.style.cssText = `max-height:70vh;overflow-y:auto;padding:4px 8px;`;
                        modalBody.appendChild(container);
                    }
                    container.innerHTML = html;
                    container.style.display = 'block';
                }
            }
        }

        // ============================================================
        // TRADUCIR FRASE GENERADA CON GROQ
        // ============================================================

        async _traducirFraseGenerada(idx) {
            if (this._traduciendoFrase) {
                this.core?.mostrarToast('⏳ Ya hay una traducción en curso', 'warning');
                return;
            }
            const frase = this._frasesGeneradas[idx];
            if (!frase) { this.core?.mostrarToast('❌ Frase no encontrada', 'error'); return; }
            if (frase.traduccion && frase.traduccion.trim() !== '') {
                this.core?.mostrarToast('ℹ️ Esta frase ya tiene traducción', 'info');
                return;
            }
            const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
            const idiomaNativo = this._idiomaNativo;
            const esJeroglifico = this._esJeroglifico(idioma);
            this._traduciendoFrase = true;
            this.core?.mostrarToast(`🔍 Traduciendo "${frase.original}" con Groq...`, 'info');
            try {
                if (!window.vigia || !window.vigia.enLinea) throw new Error('Vigía no está conectado.');
                let prompt = `Eres un traductor experto en el idioma ${idioma}. Traduce la siguiente frase del ${idioma} al ${idiomaNativo}: FRASE: "${frase.original}" REGLAS: 1. La traducción debe ser NATURAL y COTIDIANA en ${idiomaNativo}. 2. Mantén el significado exacto. 3. No añadas explicaciones, solo la traducción. 4. Responde SOLO con la traducción, sin comillas ni texto adicional.`;
                let pinyinObtenido = '';
                if (esJeroglifico) {
                    prompt = `Eres un experto en el idioma ${idioma} y en su sistema fonético. Traduce la siguiente frase del ${idioma} al ${idiomaNativo} y proporciona su PINYIN con tonos: FRASE: "${frase.original}" Responde SOLO en formato JSON: { "traduccion": "traducción_natural_al_${idiomaNativo}", "pinyin": "pinyin_con_tonos_de_la_frase_completa" }`;
                    const resultado = await window.vigia._consultarGroq(prompt, 'json');
                    if (resultado && resultado.traduccion && resultado.traduccion.trim().length > 0) {
                        this._frasesGeneradas[idx].traduccion = resultado.traduccion.trim();
                        this._frasesGeneradas[idx].pinyinCompleto = resultado.pinyin || '';
                        this._frasesTraducidas[idx] = true;
                        this.core?.mostrarToast(`✅ Traducción obtenida: "${resultado.traduccion.trim()}"${resultado.pinyin ? ` · 🔊 ${resultado.pinyin}` : ''}`, 'success');
                        this._actualizarModalFrasesGeneradas();
                        this._traduciendoFrase = false;
                        return;
                    }
                    throw new Error('No se pudo obtener la traducción con pinyin');
                }
                const traduccion = await window.vigia._consultarGroq(prompt, 'text');
                if (traduccion && traduccion.trim().length > 0) {
                    this._frasesGeneradas[idx].traduccion = traduccion.trim();
                    this._frasesTraducidas[idx] = true;
                    this.core?.mostrarToast(`✅ Traducción obtenida: "${traduccion.trim()}"`, 'success');
                    this._actualizarModalFrasesGeneradas();
                } else throw new Error('No se pudo obtener la traducción');
            } catch (error) {
                console.error('❌ Error traduciendo:', error);
                this.core?.mostrarToast(`❌ Error: ${error.message}`, 'error');
            } finally { this._traduciendoFrase = false; }
        }

        // ============================================================
        // GUARDAR FRASE GENERADA INDIVIDUAL
        // ============================================================

        async _guardarFraseGenerada(idx) {
            const frase = this._frasesGeneradas[idx];
            if (!frase) { this.core?.mostrarToast('❌ Frase no encontrada', 'error'); return; }
            if (this._frasesGuardadas[idx]) { this.core?.mostrarToast('ℹ️ Esta frase ya está guardada', 'info'); return; }
            if (!frase.traduccion || frase.traduccion.trim() === '') {
                this.core?.mostrarToast('⚠️ Primero traduce la frase con el botón "Traducir con Groq"', 'warning');
                return;
            }
            this.core?.mostrarToast('💾 Guardando frase...', 'info');
            try {
                const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
                const nivel = this._obtenerNivelRealUsuario();
                const esJeroglifico = this._esJeroglifico(idioma);
                const frasesExistentes = await db.obtenerFrasesPorIdioma(idioma);
                const existe = frasesExistentes.some(f => f.original === frase.original && f.idioma === idioma);
                if (existe) {
                    this.core?.mostrarToast('ℹ️ Esta frase ya existe en la base de datos', 'info');
                    this._frasesGuardadas[idx] = true;
                    this._actualizarModalFrasesGeneradas();
                    return;
                }
                const fraseObj = {
                    original: frase.original, traduccion: frase.traduccion,
                    idioma: idioma, nivel: nivel, esJeroglifico: esJeroglifico,
                    pinyinCompleto: frase.pinyinCompleto || '', transcripcion: frase.transcripcion || '',
                    reglaGramatical: frase.reglaGramatical || null,
                    explicacionGramatical: frase.explicacionGramatical || null,
                    tipoRegla: frase.tipoRegla || null,
                    familiaSemantica: 'Generadas por IA',
                    palabras: [], activa: true, rg: 0, rcn: 0,
                    neuroData: { exposiciones: 0, aciertosConsecutivos: 0, fallosConsecutivos: 0, nivelConfianza: 0.5, ultimaActivacion: Date.now(), consolidacion: 0 }
                };
                const id = await db.guardarFrase(fraseObj);
                if (id) {
                    this._frasesGuardadas[idx] = true;
                    this.core?.mostrarToast(`✅ Frase "${frase.original}" guardada correctamente`, 'success');
                    if (window.gestorFavoritos) {
                        await window.gestorFavoritos.añadirFrase(id);
                        await window.gestorFavoritos.añadirFraseAGrupo(id, `📚 Nivel ${nivel}`);
                        await window.gestorFavoritos.añadirFraseAGrupo(id, '🧠 Generadas por IA');
                    }
                    this._actualizarModalFrasesGeneradas();
                    if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this.core);
                } else throw new Error('No se pudo guardar la frase');
            } catch (error) {
                console.error('❌ Error guardando frase:', error);
                this.core?.mostrarToast(`❌ Error: ${error.message}`, 'error');
            }
        }

        // ============================================================
        // GUARDAR TODAS LAS FRASES GENERADAS
        // ============================================================

        async _guardarTodasFrasesGeneradas() {
            let guardadas = 0, yaExistentes = 0, sinTraduccion = 0;
            const frases = this._frasesGeneradas;
            for (let i = 0; i < frases.length; i++) {
                const frase = frases[i];
                if (!frase.traduccion || frase.traduccion.trim() === '') { sinTraduccion++; continue; }
                if (this._frasesGuardadas[i]) { yaExistentes++; continue; }
                await this._guardarFraseGenerada(i);
                guardadas++;
            }
            this.core?.mostrarToast(`✅ ${guardadas} frases guardadas${sinTraduccion > 0 ? `, ${sinTraduccion} sin traducción` : ''}${yaExistentes > 0 ? `, ${yaExistentes} ya existentes` : ''}`, 'success');
            this._actualizarModalFrasesGeneradas();
        }

        // ============================================================
        // ACTUALIZAR MODAL DE FRASES GENERADAS
        // ============================================================

        _actualizarModalFrasesGeneradas() {
            this._mostrarModalFrasesGeneradas(this._frasesGeneradas, { fiabilidad: 70, nivelConfianza: '🟢 Bueno' });
        }

        // ============================================================
        // CERRAR MODAL DE FRASES GENERADAS
        // ============================================================

        _cerrarModalFrasesGeneradas() {
            if (this.core) {
                this.core.cerrarModal();
                const container = document.getElementById('frasesGeneradasContainer');
                if (container) container.remove();
                const textarea = document.getElementById('jsonTextarea');
                if (textarea) textarea.style.display = 'block';
            }
        }

        // ============================================================
        // OBTENER PALABRAS COMPLETAS
        // ============================================================

        async _obtenerPalabrasCompletas(frase) {
            if (!frase || !frase.palabras || frase.palabras.length === 0) return [];
            const idioma = frase.idioma || pipeline.idiomaObjetivo || 'es';
            const palabrasCompletas = [];
            const idsResueltos = new Set();
            for (const p of frase.palabras) {
                let palabraObj = null;
                if (p && typeof p === 'object' && p.id && typeof p.id === 'number') {
                    try { palabraObj = await db.get('palabras', p.id); } catch (e) {}
                    if (!palabraObj) palabraObj = p;
                } else if (typeof p === 'number' && p > 0) {
                    try { palabraObj = await db.get('palabras', p); } catch (e) {}
                } else if (typeof p === 'string') {
                    const numId = parseInt(p);
                    if (!isNaN(numId) && numId > 0) {
                        try { palabraObj = await db.get('palabras', numId); } catch (e) {}
                    }
                    if (!palabraObj) {
                        const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
                        palabraObj = todasPalabras.find(w => (w.palabra || w.hanzi || '').toLowerCase() === p.toLowerCase().trim());
                    }
                    if (!palabraObj) {
                        palabraObj = { palabra: p, hanzi: this._esJeroglifico(idioma) ? p : '', significado: p, familia: 'sin_clasificar' };
                    }
                } else if (p && typeof p === 'object') {
                    palabraObj = p;
                }
                if (palabraObj) {
                    if (!palabraObj.palabra && palabraObj.hanzi) palabraObj.palabra = palabraObj.hanzi;
                    if (!palabraObj.hanzi && palabraObj.palabra) palabraObj.hanzi = palabraObj.palabra;
                    if (!palabraObj.familia) palabraObj.familia = 'sin_clasificar';
                    if (!palabraObj.significado) palabraObj.significado = palabraObj.palabra || palabraObj.hanzi || '';
                    palabrasCompletas.push(palabraObj);
                }
            }
            if (palabrasCompletas.length === 0 && this._historiaActual.length > 0) {
                const historiaFrase = this._historiaActual.find(f => f.id === frase.id);
                if (historiaFrase && historiaFrase.palabras && historiaFrase.palabras.length > 0) {
                    for (const p of historiaFrase.palabras) {
                        if (p && typeof p === 'object' && p.id && typeof p.id === 'number' && !idsResueltos.has(p.id)) {
                            try { const palabraObj = await db.get('palabras', p.id); if (palabraObj) palabrasCompletas.push(palabraObj); } catch (e) {}
                        }
                    }
                }
            }
            return palabrasCompletas;
        }

        // ============================================================
        // PANTALLA DE INICIO
        // ============================================================

        async mostrarPantallaInicio() {
            const container = document.getElementById('cardContainer');
            if (!container) return;
            try {
                const usuario = await db.getUsuario();
                const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
                const infoIdioma = gestorIdiomas.getInfoIdioma(idiomaActivo);
                container.innerHTML = '<div class="card" style="max-width:500px;padding:40px 30px;text-align:center;">' +
                    '<div style="font-size:64px;margin-bottom:16px;">📚</div>' +
                    '<h2 style="font-size:22px;font-weight:800;margin-bottom:8px;">' + (usuario ? '¡Hola, ' + usuario.nombre + '!' : 'Bienvenido') + '</h2>' +
                    '<p style="color:var(--gray);font-size:16px;margin-bottom:8px;line-height:1.6;">' + (usuario ? 'Comienza generando o importando historias' : 'Regístrate para comenzar') + '</p>' +
                    (idiomaActivo ? '<p style="color:var(--gray-light);font-size:14px;margin-bottom:16px;">🌍 Idioma activo: <strong>' + idiomaActivo + '</strong>' + (infoIdioma ? ' (Nivel ' + infoIdioma.nivel + ')' : '') + '</p>' : '') +
                    '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
                    '<button class="btn-primary" onclick="window.UIJSON.abrirGeneradorJSON()" style="flex:1;min-width:140px;"><i class="fas fa-plus"></i> Generar</button>' +
                    '<button class="btn-secondary" onclick="window.UIJSON.abrirImportadorJSON()" style="flex:1;min-width:140px;"><i class="fas fa-file-import"></i> Importar</button>' +
                    '</div></div>';
            } catch (e) {
                console.warn('⚠️ Error mostrando pantalla de inicio:', e);
            }
        }

        // ============================================================
        // RESPUESTA Y NAVEGACIÓN - CORREGIDO CON RECARGA
        // ============================================================
        
        async _responderEstudio(tipo) {
            if (this._respondiendo || this._validandoRespuesta || !pipeline?.fraseActual) return;
            this._respondiendo = true;
            try {
                if (this._respuestaRegistrada === pipeline.fraseActual.id) {
                    this._respuestaRegistrada = null;
                    await pipeline._avanzarSiguienteFrase();
                } else {
                    if (!await pipeline.procesarRespuesta(tipo)) return;
                }
                this._resetearEstadoFrase();
                await this._guardarIndiceEstudio();
                await this._recargarProgresoCompleto();
                await this._verificarProgresoTema();
                if (!this._temaFinalizado) this._renderizarFraseInteractiva();
                if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(window.uiCore);
            } finally { this._respondiendo = false; }
        }

        _fraseAnterior() {
            if (pipeline && pipeline.anterior) {
                this._resetearEstadoFrase();
                pipeline.anterior();
                this._guardarIndiceEstudio();
                setTimeout(async () => {
                    this._resetearEstadoFrase();
                    await this._recargarProgresoCompleto();
                    await this._verificarProgresoTema();
                    if (!this._temaFinalizado) {
                        this._renderizarFraseInteractiva();
                    }
                }, 50);
            }
        }

        _fraseSiguiente() {
            if (pipeline && pipeline.siguiente) {
                this._resetearEstadoFrase();
                pipeline.siguiente();
                this._guardarIndiceEstudio();
                setTimeout(async () => {
                    this._resetearEstadoFrase();
                    await this._recargarProgresoCompleto();
                    await this._verificarProgresoTema();
                    if (!this._temaFinalizado) {
                        this._renderizarFraseInteractiva();
                    }
                }, 50);
            }
        }
    }

    // ============================================================
    // INSTANCIA GLOBAL
    // ============================================================

    window.UIStudy = new UIStudy();
    console.log('✅ UIStudy v24.2 - CONTROL DE TRANSCRIPCIÓN FONÉTICA');
    console.log('  🔧 Método cambiarModoEstudio reparado y expuesto correctamente');
    console.log('  🔧 Modo múltiple con generación de opciones estable');
    console.log('  🎵 Detección de origen "tonos" para redirección al Estudio de Tonos');
    console.log('  🎵 Modal de completado con botón "Volver al Estudio de Tonos"');
    console.log('  📚 El acceso a la Biblioteca de Lectura se hará desde el Dashboard');
    console.log('  🔥 Recarga de progreso completo después de cada respuesta');
})();
