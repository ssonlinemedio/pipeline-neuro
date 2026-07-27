// ============================================================
// UI STUDY v20.8 - CORREGIDO: FINALIZACIÓN DE TEMA AL 100%
// ============================================================

(function() {
    'use strict';
    
    if (window.UIStudy && window.UIStudy._version === '20.8') {
        console.log('⚠️ UIStudy ya está cargado, saltando...');
        return;
    }

    class UIStudy {
        constructor() {
            this._version = '20.8';
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
            this._transcripcionGenerada = false;
            
            // VARIABLES PARA LIBRO DE LECTURA
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
            
            // 🔥 CONTROL DE FINALIZACIÓN DE TEMA
            this._temaFinalizado = false;
            this._temaCompletadoCallback = null;
            this._verificandoProgreso = false;
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
                'es': 'Español', 'en': 'Inglés', 'fr': 'Francés',
                'de': 'Alemán', 'it': 'Italiano', 'pt': 'Portugués',
                'zh': 'Chino', 'ja': 'Japonés', 'ko': 'Coreano',
                'ru': 'Ruso', 'ar': 'Árabe', 'hi': 'Hindi'
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
                if (window.pipeline?.nivel) return window.pipeline.nivel;
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
            
            const idioma = frase.idioma || pipeline.idiomaObjetivo || 'es';
            const esJeroglifico = this._esJeroglifico(idioma);
            
            if (esJeroglifico) {
                return frase.pinyinCompleto || frase.segmentacion?.pinyin || '';
            }
            
            if (frase.transcripcion) {
                return frase.transcripcion;
            }
            
            const key = `${frase.original}_${idioma}_${this._idiomaNativo}`;
            if (this._cacheTranscripciones[key]) {
                return this._cacheTranscripciones[key];
            }
            
            if (window.vigia && window.vigia.enLinea && window.vigia._apiKeyValidada) {
                try {
                    const transcripcion = await window.vigia.generarTranscripcionParaTexto(
                        frase.original,
                        idioma,
                        frase.nivel || 'A1'
                    );
                    if (transcripcion) {
                        this._cacheTranscripciones[key] = transcripcion;
                        if (frase.id) {
                            await db.update('frases', { ...frase, transcripcion: transcripcion });
                        }
                        return transcripcion;
                    }
                } catch (e) {
                    console.warn('⚠️ Error generando transcripción:', e);
                }
            }
            
            if (window.fonetica) {
                try {
                    const transcripcion = await window.fonetica.obtenerTranscripcion(
                        frase.original,
                        idioma,
                        frase.nivel || 'A1'
                    );
                    if (transcripcion) {
                        this._cacheTranscripciones[key] = transcripcion;
                        return transcripcion;
                    }
                } catch (e) {}
            }
            
            return '';
        }

        async _obtenerTranscripcionPalabra(palabra) {
            if (!palabra) return '';
            
            const idioma = palabra.idioma || pipeline.idiomaObjetivo || 'es';
            const esJeroglifico = this._esJeroglifico(idioma);
            
            if (esJeroglifico) {
                return palabra.pinyin || '';
            }
            
            if (palabra.transcripcion) {
                return palabra.transcripcion;
            }
            
            const texto = palabra.palabra || palabra.hanzi || '';
            if (!texto) return '';
            
            const key = `${texto}_${idioma}_${this._idiomaNativo}`;
            if (this._cacheTranscripciones[key]) {
                return this._cacheTranscripciones[key];
            }
            
            if (window.vigia && window.vigia.enLinea && window.vigia._apiKeyValidada) {
                try {
                    const transcripcion = await window.vigia.generarTranscripcionParaTexto(
                        texto,
                        idioma,
                        palabra.nivel || 'A1'
                    );
                    if (transcripcion) {
                        this._cacheTranscripciones[key] = transcripcion;
                        if (palabra.id) {
                            await db.update('palabras', { ...palabra, transcripcion: transcripcion });
                        }
                        return transcripcion;
                    }
                } catch (e) {}
            }
            
            if (window.fonetica) {
                try {
                    const transcripcion = await window.fonetica.obtenerTranscripcion(
                        texto,
                        idioma,
                        palabra.nivel || 'A1'
                    );
                    if (transcripcion) {
                        this._cacheTranscripciones[key] = transcripcion;
                        return transcripcion;
                    }
                } catch (e) {}
            }
            
            return '';
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
            
            try {
                if (vigia && vigia.getEstado) {
                    const estado = vigia.getEstado();
                    if (estado && estado.confianza !== undefined) {
                        this._confianza = estado.confianza / 100;
                    }
                }
            } catch (e) {
                console.warn('⚠️ No se pudo cargar confianza:', e);
            }
            
            try {
                const data = localStorage.getItem('pipeline_cache_transcripciones_estudio');
                if (data) {
                    this._cacheTranscripciones = JSON.parse(data);
                }
            } catch (e) {}
            
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
                console.warn('⚠️ Error cargando historias leídas:', e);
                this._historiasLeidas = new Set();
            }
        }

        _guardarHistoriasLeidas() {
            try {
                localStorage.setItem('pipeline_historias_leidas', JSON.stringify(Array.from(this._historiasLeidas)));
            } catch (e) {
                console.warn('⚠️ Error guardando historias leídas:', e);
            }
        }

        async _toggleHistoriaLeida(historiaId, checked) {
            if (!historiaId) {
                console.warn('⚠️ ID de historia no válido');
                return;
            }

            if (checked) {
                this._historiasLeidas.add(historiaId);
            } else {
                this._historiasLeidas.delete(historiaId);
            }

            this._guardarHistoriasLeidas();
            this._actualizarTarjetaHistoria(historiaId, checked);
            this._actualizarContadorHistoriasLeidas();

            this.core?.mostrarToast(
                checked ? '✅ Historia marcada como leída' : '↩️ Historia desmarcada como leída',
                checked ? 'success' : 'info'
            );
        }

        _actualizarTarjetaHistoria(historiaId, checked) {
            const tarjeta = document.querySelector(`.historia-card[data-historia-id="${historiaId}"]`);
            if (!tarjeta) {
                this._actualizarLibroParcial();
                return;
            }

            const badge = tarjeta.querySelector('.historia-leida-badge');
            const checkbox = tarjeta.querySelector('.historia-checkbox-input');
            const progreso = tarjeta.querySelector('.historia-progreso');

            if (checkbox) {
                checkbox.checked = checked;
            }

            if (badge) {
                if (checked) {
                    badge.innerHTML = '✅ Leída';
                    badge.style.background = 'var(--success)';
                    badge.style.color = 'white';
                } else {
                    badge.innerHTML = '📖 No leída';
                    badge.style.background = 'var(--gray-light)';
                    badge.style.color = 'var(--gray)';
                }
            }

            if (progreso) {
                const pct = checked ? 100 : 0;
                progreso.style.width = pct + '%';
                const pctText = tarjeta.querySelector('.historia-progreso-texto');
                if (pctText) {
                    pctText.textContent = pct + '%';
                }
            }

            if (checked) {
                tarjeta.style.borderLeft = '4px solid var(--success)';
                tarjeta.style.background = 'rgba(0, 184, 148, 0.05)';
            } else {
                tarjeta.style.borderLeft = '4px solid var(--light)';
                tarjeta.style.background = 'var(--white)';
            }

            const leidaTag = tarjeta.querySelector('.historia-leida-tag');
            if (leidaTag) {
                leidaTag.style.display = checked ? 'inline-block' : 'none';
            }
        }

        _actualizarContadorHistoriasLeidas() {
            const container = document.getElementById('cardContainer');
            if (!container) return;

            const contador = container.querySelector('.historias-leidas-contador');
            if (contador) {
                contador.textContent = `${this._historiasLeidas.size} leídas`;
            }

            const todasLasHistorias = container.querySelectorAll('.historia-card');
            const total = todasLasHistorias.length;
            const leidas = this._historiasLeidas.size;
            const pct = total > 0 ? Math.round((leidas / total) * 100) : 0;

            const barra = container.querySelector('.historias-leidas-progreso');
            if (barra) {
                barra.style.width = pct + '%';
            }

            const pctText = container.querySelector('.historias-leidas-porcentaje');
            if (pctText) {
                pctText.textContent = `${pct}%`;
            }
        }

        _actualizarLibroParcial() {
            const container = document.getElementById('cardContainer');
            if (!container) return;

            const tarjetas = container.querySelectorAll('.historia-card');
            tarjetas.forEach(tarjeta => {
                const historiaId = parseInt(tarjeta.dataset.historiaId);
                if (!isNaN(historiaId)) {
                    const leida = this._historiasLeidas.has(historiaId);
                    this._actualizarTarjetaHistoria(historiaId, leida);
                }
            });

            this._actualizarContadorHistoriasLeidas();
        }

        cargar(core) {
            this.core = core;
            this._temaFinalizado = false;
            this._verificandoProgreso = false;
            this._añadirBotonLibro();
            
            if (pipeline && pipeline.frases && pipeline.frases.length > 0) {
                if (pipeline.fraseActual) {
                    if (this._modoVista === 'libro' && !this._cerrandoLibro) {
                        this._abrirLibroLectura();
                    } else if (this._modoVista === 'historia_completa') {
                        this._renderizarHistoriaCompletaDesdeLibro();
                    } else {
                        this._modoVista = 'frase';
                        this._renderizarFraseInteractiva();
                    }
                } else {
                    pipeline.cargarFrase(0);
                }
                this._mostrarControlesModo();
            } else {
                this.mostrarPantallaInicio();
            }
        }

        // ============================================================
        // AÑADIR BOTÓN DE LIBRO DE LECTURA
        // ============================================================

        _añadirBotonLibro() {
            const header = document.querySelector('.module-header');
            if (!header) return;
            
            let btnLibro = document.getElementById('btnLibroLectura');
            if (btnLibro) return;
            
            btnLibro = document.createElement('button');
            btnLibro.id = 'btnLibroLectura';
            btnLibro.className = 'btn-secondary';
            btnLibro.style.cssText = `
                padding: 6px 14px;
                font-size: 12px;
                background: linear-gradient(135deg, #6C5CE7, #A29BFE);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-left: 8px;
            `;
            btnLibro.innerHTML = '📚 Libro de Lectura';
            btnLibro.onmouseover = () => {
                btnLibro.style.transform = 'translateY(-2px)';
                btnLibro.style.boxShadow = '0 4px 20px rgba(108,92,231,0.3)';
            };
            btnLibro.onmouseout = () => {
                btnLibro.style.transform = 'none';
                btnLibro.style.boxShadow = 'none';
            };
            btnLibro.onclick = () => {
                this._abrirLibroLectura();
            };
            
            const titleDiv = header.querySelector('.module-title');
            if (titleDiv) {
                titleDiv.appendChild(btnLibro);
            }
        }

        // ============================================================
        // GUARDAR CACHÉ DE TRANSCRIPCIONES
        // ============================================================

        _guardarCacheTranscripciones() {
            try {
                localStorage.setItem('pipeline_cache_transcripciones_estudio', 
                    JSON.stringify(this._cacheTranscripciones));
            } catch (e) {}
        }

        // ============================================================
        // CONTROLES DE MODO
        // ============================================================

        _mostrarControlesModo() {
            const container = document.querySelector('.study-controls');
            if (!container) return;
            
            if (!document.querySelector('.modo-selector')) {
                const modoHTML = `
                    <div class="modo-selector" style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;justify-content:center;">
                        <button class="modo-btn ${this._modoEstudio === 'flashcard' ? 'active' : ''}" data-modo="flashcard" style="padding:4px 12px;border-radius:16px;border:2px solid var(--light);background:${this._modoEstudio === 'flashcard' ? 'var(--primary)' : 'var(--white)'};color:${this._modoEstudio === 'flashcard' ? 'white' : 'var(--dark)'};cursor:pointer;font-size:11px;font-weight:600;transition:all 0.3s;">
                            <i class="fas fa-layer-group"></i> Flashcard
                        </button>
                        <button class="modo-btn ${this._modoEstudio === 'escritura' ? 'active' : ''}" data-modo="escritura" style="padding:4px 12px;border-radius:16px;border:2px solid var(--light);background:${this._modoEstudio === 'escritura' ? 'var(--primary)' : 'var(--white)'};color:${this._modoEstudio === 'escritura' ? 'white' : 'var(--dark)'};cursor:pointer;font-size:11px;font-weight:600;transition:all 0.3s;">
                            <i class="fas fa-keyboard"></i> Escritura
                        </button>
                        <button class="modo-btn ${this._modoEstudio === 'multiple' ? 'active' : ''}" data-modo="multiple" style="padding:4px 12px;border-radius:16px;border:2px solid var(--light);background:${this._modoEstudio === 'multiple' ? 'var(--primary)' : 'var(--white)'};color:${this._modoEstudio === 'multiple' ? 'white' : 'var(--dark)'};cursor:pointer;font-size:11px;font-weight:600;transition:all 0.3s;">
                            <i class="fas fa-list-ul"></i> Múltiple
                        </button>
                        <button class="modo-btn ${this._modoEstudio === 'escucha' ? 'active' : ''}" data-modo="escucha" style="padding:4px 12px;border-radius:16px;border:2px solid var(--light);background:${this._modoEstudio === 'escucha' ? 'var(--primary)' : 'var(--white)'};color:${this._modoEstudio === 'escucha' ? 'white' : 'var(--dark)'};cursor:pointer;font-size:11px;font-weight:600;transition:all 0.3s;">
                            <i class="fas fa-volume-up"></i> Escucha
                        </button>
                    </div>
                `;
                container.insertAdjacentHTML('beforebegin', modoHTML);
                this._configurarModosEstudio();
            }
        }

        _configurarModosEstudio() {
            document.querySelectorAll('.modo-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const modo = btn.dataset.modo;
                    if (modo) this.cambiarModoEstudio(modo);
                });
            });
        }

        cambiarModoEstudio(modo) {
            this._modoEstudio = modo;
            this._resetearEstadoFrase();
            
            document.querySelectorAll('.modo-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.modo === modo);
                btn.style.background = btn.dataset.modo === modo ? 'var(--primary)' : 'var(--white)';
                btn.style.color = btn.dataset.modo === modo ? 'white' : 'var(--dark)';
            });
            
            this.core.mostrarToast('🔄 Modo: ' + this._getModoNombre(modo), 'info');
            
            if (pipeline && pipeline.fraseActual && this._modoVista === 'frase') {
                this._renderizarFraseInteractiva();
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
        // GUARDAR ÍNDICE DE ESTUDIO
        // ============================================================

        async _guardarIndiceEstudio() {
            if (this._guardandoIndice) return;
            this._guardandoIndice = true;
            
            try {
                if (pipeline && pipeline.indiceFrase !== undefined && pipeline.idiomaObjetivo) {
                    await db.guardarUltimoIndiceEstudio(pipeline.idiomaObjetivo, pipeline.indiceFrase);
                }
            } catch (e) {
                console.warn('⚠️ Error guardando índice de estudio:', e);
            } finally {
                this._guardandoIndice = false;
            }
        }

        // ============================================================
        // 🔥 VERIFICAR PROGRESO DEL TEMA (CORREGIDO)
        // ============================================================

        async _verificarProgresoTema() {
            // Evitar ejecuciones concurrentes
            if (this._verificandoProgreso) return;
            if (this._temaFinalizado) return;
            
            if (!pipeline._estudiandoTema || !pipeline._temaActual) {
                console.log('ℹ️ No hay tema activo para verificar progreso');
                return;
            }

            this._verificandoProgreso = true;

            try {
                // 🔥 Obtener las frases actuales del pipeline
                const frases = pipeline.frases || [];
                if (frases.length === 0) {
                    this._verificandoProgreso = false;
                    return;
                }
                
                // 🔥 Contar frases completadas
                const completadas = frases.filter(f => {
                    const prog = f.progreso || {};
                    return prog.estado === 'completada' || (prog.rcn || 0) >= 4;
                }).length;
                
                const progreso = Math.round((completadas / frases.length) * 100);
                console.log(`📊 Progreso del tema: ${progreso}% (${completadas}/${frases.length})`);
                
                // 🔥 Si está al 100%, finalizar el tema
                if (progreso >= 100) {
                    console.log('🎉 Tema completado al 100%!');
                    await this._finalizarTema();
                }
            } catch (error) {
                console.warn('⚠️ Error verificando progreso del tema:', error);
            } finally {
                this._verificandoProgreso = false;
            }
        }

        // ============================================================
        // 🔥 FINALIZAR TEMA
        // ============================================================

        async _finalizarTema() {
            if (this._temaFinalizado) return;
            this._temaFinalizado = true;

            const temaId = pipeline._temaActual;
            const tema = await db.obtenerTema(temaId);
            
            if (!tema) {
                console.warn('⚠️ Tema no encontrado para finalizar');
                this._temaFinalizado = false;
                return;
            }

            // 1. Marcar el tema como completado en el sistema
            if (window.UITemas) {
                const idioma = tema.idioma || gestorIdiomas.getIdiomaActivo() || 'es';
                const temaOriginalId = tema._temaOriginalId || tema.id;
                
                if (tema._esPredefinido && tema._temaOriginalId) {
                    await window.UITemas._marcarTemaCompletado(idioma, tema._temaOriginalId, true);
                } else {
                    await window.UITemas._marcarTemaCompletado(idioma, tema.id, true);
                }
            }

            // 2. Guardar el estado en el tema de la DB
            tema.estado = 'completado';
            tema._completado = true;
            tema._fechaCompletado = Date.now();
            await db.update('temas', tema);

            // 3. Mostrar mensaje de éxito
            this.core?.mostrarToast(`🎉 ¡Tema "${tema.nombre}" completado al 100%!`, 'success');

            // 4. Mostrar pantalla de finalización
            await this._mostrarPantallaFinalizacion(tema);

            // 5. Volver a la lista de temas
            setTimeout(() => {
                this._modoVista = 'frase';
                this._libroAbierto = false;
                this._temaFinalizado = false;
                
                if (this._temaCompletadoCallback) {
                    this._temaCompletadoCallback();
                    this._temaCompletadoCallback = null;
                }
                
                if (this.core) {
                    this.core.irAModulo('temas');
                    if (window.UITemas) {
                        window.UITemas._renderTemas();
                    }
                }
            }, 2000);
        }

        // ============================================================
        // 🔥 MOSTRAR PANTALLA DE FINALIZACIÓN (CORREGIDO)
        // ============================================================

        async _mostrarPantallaFinalizacion(tema) {
            const container = document.getElementById('cardContainer');
            if (!container) return;

            // 🔥 Usar pipeline.frases en lugar de db.obtenerFrasesPorTema
            const frases = pipeline.frases || [];
            const totalFrases = frases.length;
            const completadas = frases.filter(f => {
                const prog = f.progreso || {};
                return prog.estado === 'completada' || (prog.rcn || 0) >= 4;
            }).length;

            const esJeroglifico = this._esJeroglifico(tema.idioma);
            const nombreIdioma = this._getNombreIdioma(tema.idioma || 'es');

            container.innerHTML = `
                <div style="max-width:600px;margin:0 auto;text-align:center;padding:40px 20px;background:var(--white);border-radius:16px;box-shadow:var(--shadow);border:3px solid var(--success);">
                    <div style="font-size:72px;margin-bottom:16px;">🎉</div>
                    <h2 style="font-size:28px;font-weight:800;color:var(--dark);margin-bottom:8px;">
                        ¡Tema Completado!
                    </h2>
                    <h3 style="font-size:22px;font-weight:700;color:var(--primary);margin-bottom:16px;">
                        ${tema.icono || '📁'} ${tema.nombre}
                    </h3>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:20px 0;padding:16px;background:var(--bg);border-radius:12px;">
                        <div>
                            <div style="font-size:28px;font-weight:800;color:var(--success);">${totalFrases}</div>
                            <div style="font-size:11px;color:var(--gray);">Frases totales</div>
                        </div>
                        <div>
                            <div style="font-size:28px;font-weight:800;color:var(--success);">${completadas}</div>
                            <div style="font-size:11px;color:var(--gray);">Completadas</div>
                        </div>
                        <div>
                            <div style="font-size:28px;font-weight:800;color:var(--success);">100%</div>
                            <div style="font-size:11px;color:var(--gray);">Progreso</div>
                        </div>
                    </div>

                    <div style="background:var(--success)10;border-radius:10px;padding:12px 16px;margin:16px 0;border:1px solid var(--success);">
                        <p style="color:var(--success);font-weight:600;margin:0;">
                            ✅ ¡Has completado todas las frases del tema!
                        </p>
                        <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                            ${esJeroglifico ? '🀄' : '🌍'} ${nombreIdioma} · Nivel ${tema.nivel || 'A1'}
                        </p>
                    </div>

                    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:16px;">
                        <button class="btn-primary" onclick="window.UIStudy._volverATemas()" 
                                style="padding:12px 30px;font-size:15px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:10px;cursor:pointer;">
                            <i class="fas fa-arrow-left"></i> Volver a Temas
                        </button>
                        <button class="btn-secondary" onclick="window.UIStudy._desmarcarTemaYReiniciar()" 
                                style="padding:12px 30px;font-size:15px;background:var(--warning);color:var(--dark);border:none;border-radius:10px;cursor:pointer;">
                            <i class="fas fa-undo"></i> Desmarcar y Reestudiar
                        </button>
                    </div>

                    <div style="margin-top:12px;font-size:11px;color:var(--gray-light);">
                        💡 El tema se ha marcado como completado. Puedes ocultarlo desde "Temas".
                    </div>
                </div>
            `;
        }

        // ============================================================
        // 🔥 VOLVER A TEMAS DESDE FINALIZACIÓN
        // ============================================================

        _volverATemas() {
            this._temaFinalizado = false;
            this._modoVista = 'frase';
            this._libroAbierto = false;
            
            if (this.core) {
                this.core.irAModulo('temas');
                if (window.UITemas) {
                    window.UITemas._renderTemas();
                }
            }
        }

        // ============================================================
        // 🔥 DESMARCAR TEMA Y REESTUDIAR
        // ============================================================

        async _desmarcarTemaYReiniciar() {
            const temaId = pipeline._temaActual;
            if (!temaId) {
                this._volverATemas();
                return;
            }

            const tema = await db.obtenerTema(temaId);
            if (!tema) {
                this._volverATemas();
                return;
            }

            // Desmarcar como completado
            if (window.UITemas) {
                const idioma = tema.idioma || gestorIdiomas.getIdiomaActivo() || 'es';
                const temaOriginalId = tema._temaOriginalId || tema.id;
                
                if (tema._esPredefinido && tema._temaOriginalId) {
                    await window.UITemas._marcarTemaCompletado(idioma, tema._temaOriginalId, false);
                } else {
                    await window.UITemas._marcarTemaCompletado(idioma, tema.id, false);
                }
            }

            // Actualizar estado del tema
            tema.estado = 'en_curso';
            tema._completado = false;
            await db.update('temas', tema);

            // Reiniciar el progreso de las frases del tema
            const frases = pipeline.frases || [];
            for (const f of frases) {
                const progreso = await db.obtenerProgreso(f.id);
                if (progreso && progreso.rcn >= 4) {
                    progreso.rcn = 2;
                    progreso.estado = 'en_curso';
                    await db.guardarProgreso(progreso);
                }
            }

            this.core?.mostrarToast(`🔄 Tema "${tema.nombre}" reiniciado para estudio`, 'info');
            
            // Volver al estudio del tema
            this._temaFinalizado = false;
            this._modoVista = 'frase';
            this._libroAbierto = false;
            
            await pipeline.estudiarTema(tema.id);
            
            if (this.core) {
                this.core.irAModulo('study');
            }
            
            setTimeout(() => {
                this._renderizarFraseInteractiva();
            }, 300);
        }

        // ============================================================
        // RENDERIZADO PRINCIPAL CON TRANSCRIPCIÓN
        // ============================================================
        
        async _renderizarFraseInteractiva() {
            if (this._renderizando) {
                console.log('⏳ Renderizado en curso, saltando...');
                return;
            }
            
            this._renderizando = true;
            this._modoVista = 'frase';
            this._cerrandoLibro = false;
            
            try {
                const container = document.getElementById('cardContainer');
                if (!container || !pipeline || !pipeline.fraseActual) {
                    this._renderizando = false;
                    return;
                }
                
                // 🔥 Si el tema está finalizado, mostrar pantalla de finalización
                if (this._temaFinalizado) {
                    const tema = await db.obtenerTema(pipeline._temaActual);
                    if (tema) {
                        await this._mostrarPantallaFinalizacion(tema);
                        this._renderizando = false;
                        return;
                    }
                }
                
                await this._cargarHistoriaCompletaContexto();
                
                const frase = pipeline.fraseActual;
                const progreso = frase.progreso || {};
                const rcn = progreso.rcn || 0;
                const fase = pipeline.fases.find(f => f.id === pipeline.faseActual);
                const esJeroglifico = frase.esJeroglifico || false;
                const semaforo = rcn <= 0 ? '🔴' : rcn < 3 ? '🟡' : rcn < 4 ? '🟢' : '🟣';
                const modo = this._modoEstudio;
                const consolidacion = pipeline._calcularConsolidacion ? pipeline._calcularConsolidacion(frase) : 0;
                const total = pipeline.frases ? pipeline.frases.length : 0;
                const actual = (pipeline.indiceFrase !== undefined) ? pipeline.indiceFrase + 1 : 0;
                
                let modoData = { mostrar: frase.original, ocultar: frase.traduccion, esInverso: false };
                if (window.modoInverso) {
                    modoData = window.modoInverso.getFraseParaEstudio(frase);
                }
                const isInverso = modoData.esInverso;
                
                let transcripcion = '';
                if (esJeroglifico) {
                    transcripcion = frase.pinyinCompleto || frase.segmentacion?.pinyin || '';
                } else {
                    transcripcion = await this._obtenerTranscripcionFrase(frase);
                }
                
                let esFavorita = false;
                try {
                    if (window.gestorFavoritos && window.gestorFavoritos._initDone) {
                        esFavorita = await window.gestorFavoritos.estaEnFavoritos('frase', frase.id);
                    } else if (window.gestorFavoritos) {
                        await window.gestorFavoritos.init();
                        esFavorita = await window.gestorFavoritos.estaEnFavoritos('frase', frase.id);
                    }
                } catch (e) {
                    console.warn('⚠️ Error verificando favorito:', e);
                    esFavorita = false;
                }
                
                const nivelReal = this._obtenerNivelRealUsuario();
                const familiaSemantica = frase.familiaSemantica || 'sin_clasificar';
                
                let html = '<div class="card interactive-card" style="max-width:600px;margin:0 auto;position:relative;">';
                
                html += `
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                        <div class="card-badge" style="margin:0;">${fase ? fase.icono + ' ' + fase.nombre : 'Fase ' + pipeline.faseActual}</div>
                        <div style="display:flex;gap:8px;align-items:center;">
                            ${this._historiaActual.length > 0 ? `
                                <button class="btn-secondary" onclick="window.UIStudy._abrirHistoriaCompleta()" 
                                        style="padding:2px 10px;font-size:10px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                    <i class="fas fa-book"></i> Ver Historia (${this._historiaActual.length})
                                </button>
                            ` : ''}
                            <div style="font-size:14px;font-weight:600;color:${rcn >= 4 ? 'var(--success)' : rcn >= 2 ? 'var(--warning)' : 'var(--danger)'};">${semaforo} RCN: ${rcn.toFixed(1)}</div>
                        </div>
                    </div>
                `;
                
                html += '<div style="height:4px;background:var(--light-gray);border-radius:2px;overflow:hidden;margin-bottom:16px;">';
                html += '<div style="height:100%;width:' + Math.min(100, consolidacion * 100) + '%;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:2px;transition:width 0.5s ease;"></div>';
                html += '</div>';
                
                if (isInverso) {
                    html += `<div style="text-align:center;font-size:11px;color:var(--secondary);margin-bottom:8px;padding:4px 12px;background:var(--secondary)15;border-radius:12px;border:1px solid var(--secondary)30;">
                        🔄 Modo Inverso: ${window.modoInverso ? window.modoInverso.getTooltip() : 'Traduces al idioma objetivo'}
                    </div>`;
                }
                
                // FRASE SEGÚN MODO CON TRANSCRIPCIÓN
                html += '<div style="text-align:center;margin-bottom:16px;">';
                
                if (modo === 'flashcard') {
                    if (isInverso && esJeroglifico) {
                        html += `<div style="font-size:18px;color:var(--gray);margin-bottom:8px;">${modoData.mostrar}</div>`;
                        if (transcripcion) {
                            html += this._renderizarTranscripcion(transcripcion, true);
                        }
                    } else if (esJeroglifico) {
                        const hanzi = frase.segmentacion?.hanzi || frase.original || '';
                        html += `<div style="font-size:32px;font-weight:700;line-height:1.6;letter-spacing:2px;color:var(--dark);">${hanzi}</div>`;
                        if (transcripcion) {
                            html += this._renderizarTranscripcion(transcripcion, true);
                        } else {
                            html += `<div style="font-size:12px;color:var(--danger);margin-top:4px;">⚠️ Pinyin no disponible</div>`;
                        }
                    } else {
                        html += `<div style="font-size:24px;font-weight:700;color:var(--dark);">${modoData.mostrar}</div>`;
                        if (transcripcion) {
                            html += this._renderizarTranscripcion(transcripcion, false);
                        }
                    }
                    
                    if (this._mostrandoRespuesta) {
                        html += `<div style="margin-top:12px;padding:12px;background:rgba(108,92,231,0.06);border-radius:10px;font-size:16px;color:var(--primary);">${modoData.ocultar}</div>`;
                        if (esJeroglifico && modoData.pistaFonetica) {
                            html += `<div style="font-size:13px;color:var(--gray-light);margin-top:8px;">🔊 ${modoData.pistaFonetica}</div>`;
                        }
                        html += '<div style="margin-top:12px;font-size:13px;color:var(--gray);">💡 ' + (this._pistaActual || '') + '</div>';
                    } else {
                        html += `<div style="font-size:13px;color:var(--gray-light);margin-top:12px;">👆 Haz clic en "Mostrar" para ver la traducción</div>`;
                    }
                    
                } else if (modo === 'escritura') {
                    if (isInverso && esJeroglifico) {
                        html += `<div style="font-size:18px;color:var(--gray);margin-bottom:8px;">${modoData.mostrar}</div>`;
                        if (transcripcion) {
                            html += this._renderizarTranscripcion(transcripcion, true);
                        }
                    } else if (esJeroglifico) {
                        const hanzi = frase.segmentacion?.hanzi || frase.original || '';
                        html += `<div style="font-size:32px;font-weight:700;line-height:1.6;letter-spacing:2px;color:var(--dark);">${hanzi}</div>`;
                        if (transcripcion) {
                            html += this._renderizarTranscripcion(transcripcion, true);
                        }
                        html += `<div style="font-size:13px;color:var(--gray-light);margin-top:4px;">📝 Escribe la traducción al español</div>`;
                    } else {
                        html += `<div style="font-size:24px;font-weight:700;color:var(--dark);">${modoData.mostrar}</div>`;
                        if (transcripcion) {
                            html += this._renderizarTranscripcion(transcripcion, false);
                        }
                        html += `<div style="font-size:13px;color:var(--gray-light);margin-top:4px;">📝 Escribe la traducción</div>`;
                    }
                    
                } else if (modo === 'multiple') {
                    if (isInverso) {
                        html += `<div style="font-size:24px;font-weight:700;color:var(--dark);">${frase.traduccion}</div>`;
                    } else if (esJeroglifico) {
                        const hanzi = frase.segmentacion?.hanzi || frase.original || '';
                        html += `<div style="font-size:32px;font-weight:700;line-height:1.6;letter-spacing:2px;color:var(--dark);">${hanzi}</div>`;
                        if (transcripcion) {
                            html += this._renderizarTranscripcion(transcripcion, true);
                        }
                    } else {
                        html += `<div style="font-size:24px;font-weight:700;color:var(--dark);">${frase.original}</div>`;
                        if (transcripcion) {
                            html += this._renderizarTranscripcion(transcripcion, false);
                        }
                    }
                    
                } else if (modo === 'escucha') {
                    const textoEscucha = isInverso ? modoData.ocultar : modoData.mostrar;
                    if (esJeroglifico) {
                        const hanzi = frase.segmentacion?.hanzi || frase.original || '';
                        html += `<div style="font-size:32px;font-weight:700;line-height:1.6;letter-spacing:2px;color:var(--dark);">${hanzi}</div>`;
                        html += `<div style="font-size:15px;color:var(--primary);margin-top:4px;letter-spacing:1px;font-weight:500;padding:4px 14px;background:var(--primary)08;border-radius:8px;display:inline-block;border:1px solid var(--primary)30;font-family:var(--font);">
                            🔊 ${transcripcion || 'Sin pinyin disponible'}
                        </div>`;
                        html += `<div style="font-size:13px;color:var(--gray-light);margin-top:4px;">👂 Escucha la pronunciación y repite</div>`;
                    } else {
                        html += `<div style="font-size:24px;font-weight:700;color:var(--dark);">${textoEscucha}</div>`;
                        html += `<div style="font-size:15px;color:var(--secondary);margin-top:4px;letter-spacing:1px;font-weight:500;padding:4px 14px;background:var(--secondary)08;border-radius:8px;display:inline-block;border:1px solid var(--secondary)30;font-family:var(--font);">
                            🎤 ${transcripcion || 'Sin transcripción disponible'}
                        </div>`;
                        html += `<div style="font-size:13px;color:var(--gray-light);margin-top:4px;">👂 Escucha la pronunciación y repite</div>`;
                    }
                }
                
                html += '</div>';
                
                // Checkbox favorito
                html += `
                    <div style="display:flex;justify-content:center;margin-bottom:12px;">
                        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:var(--gray);padding:4px 12px;border-radius:16px;background:var(--bg);border:1px solid var(--light);">
                            <input type="checkbox" ${esFavorita ? 'checked' : ''} 
                                   onchange="window.UIStudy._toggleFraseFavorita(${frase.id || 0}, this.checked)" 
                                   style="width:16px;height:16px;cursor:pointer;">
                            <span>⭐ Guardar en Mi Espacio</span>
                            <span style="font-size:10px;color:var(--gray-light);">
                                (${nivelReal} → ${familiaSemantica})
                            </span>
                        </label>
                    </div>
                `;
                
                // Controles según modo
                if (modo === 'flashcard') {
                    html += this._renderFlashcard(frase, modoData);
                } else if (modo === 'escritura') {
                    html += this._renderEscritura(frase, modoData);
                } else if (modo === 'multiple') {
                    if (this._opcionesMultiple.length === 0) {
                        html += '<div style="text-align:center;padding:20px;color:var(--gray);"><i class="fas fa-spinner fa-spin"></i> Generando opciones...</div>';
                        this._generarOpcionesMultiplesConGroq(frase, modoData).then(opciones => {
                            this._opcionesMultiple = opciones;
                            this._renderizarFraseInteractiva();
                        }).catch(() => {
                            this._generarOpcionesMultiplesFallback(frase, modoData).then(opciones => {
                                this._opcionesMultiple = opciones;
                                this._renderizarFraseInteractiva();
                            });
                        });
                    } else {
                        html += this._renderMultiple(frase, modoData);
                    }
                } else if (modo === 'escucha') {
                    html += this._renderEscucha(frase, modoData);
                }
                
                // PALABRAS DESGLOSADAS CON TRANSCRIPCIÓN
                if (frase.palabras && frase.palabras.length > 0) {
                    html += await this._renderPalabrasDesglosadas(frase);
                }
                
                html += '<div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap;">';
                html += '<button class="btn-secondary" onclick="window.UIStudy._fraseAnterior()" style="padding:8px 16px;font-size:13px;"><i class="fas fa-chevron-left"></i> Anterior</button>';
                html += '<span style="font-size:13px;color:var(--gray);padding:8px 0;">' + actual + ' / ' + total + '</span>';
                html += '<button class="btn-secondary" onclick="window.UIStudy._fraseSiguiente()" style="padding:8px 16px;font-size:13px;">Siguiente <i class="fas fa-chevron-right"></i></button>';
                html += '</div>';
                
                html += '</div>';
                container.innerHTML = html;
                
                const counter = document.getElementById('cardCounter');
                if (counter) counter.textContent = actual + ' / ' + total;
                
                if (modo === 'escritura') {
                    this._enlazarEventosEscritura();
                }
                if (modo === 'multiple') {
                    this._enlazarEventosMultiple();
                }
                
                // 🔥 Verificar progreso del tema después de renderizar
                await this._verificarProgresoTema();
                
            } catch (e) {
                console.error('❌ Error renderizando frase:', e);
            } finally {
                this._renderizando = false;
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
                console.warn('⚠️ Error cargando historia completa:', e);
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
        // PALABRAS DESGLOSADAS CON TRANSCRIPCIÓN
        // ============================================================

        async _renderPalabrasDesglosadas(frase) {
            if (!frase.palabras || frase.palabras.length === 0) return '';
            
            const esJeroglifico = frase.esJeroglifico || false;
            const idioma = frase.idioma || pipeline.idiomaObjetivo || 'es';
            const nivelReal = this._obtenerNivelRealUsuario();
            
            let html = '<div style="padding:12px 0;border-top:2px solid var(--bg);margin-top:8px;">';
            html += '<div style="font-size:12px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">📖 Palabras desglosadas</div>';
            html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
            
            for (const p of frase.palabras) {
                const texto = p.hanzi || p.palabra || '';
                const pinyin = p.pinyin || '';
                const familia = p.familia || (p.familias && p.familias[0]) || 'sin_clasificar';
                const significado = p.significado || '';
                const color = window.uiCore?._getColorFamilia(familia) || '#6C5CE7';
                
                let transcripcionPalabra = '';
                if (!esJeroglifico && texto) {
                    transcripcionPalabra = await this._obtenerTranscripcionPalabra(p);
                }
                
                if (esJeroglifico && texto) {
                    html += `<span style="display:inline-flex;flex-direction:column;align-items:center;padding:6px 14px;border-radius:12px;background:${color}15;border:1px solid ${color}30;cursor:pointer;" 
                                onclick="window.UIStudy._abrirModalGuardarPalabra('${texto.replace(/'/g, "\\'")}', '${pinyin.replace(/'/g, "\\'")}', '${significado.replace(/'/g, "\\'")}', '${familia.replace(/'/g, "\\'")}', '${idioma}', '${nivelReal}')"
                                onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" 
                                onmouseout="this.style.transform='none';this.style.boxShadow='none'">`;
                        html += `<span style="font-weight:700;color:${color};font-size:18px;">${texto}</span>`;
                        if (pinyin) {
                            html += `<span style="font-size:11px;color:var(--gray-light);letter-spacing:1px;margin-top:1px;">${pinyin}</span>`;
                        } else {
                            html += `<span style="font-size:9px;color:var(--danger);margin-top:1px;">⚠️ Sin pinyin</span>`;
                        }
                        if (significado) {
                            html += `<span style="font-size:10px;color:var(--gray);margin-top:1px;">${significado.substring(0, 15)}</span>`;
                        }
                        html += `<span style="font-size:8px;color:var(--primary);margin-top:2px;">⭐ Guardar</span>`;
                        html += '</span>';
                } else {
                    html += `<span style="display:inline-flex;flex-direction:column;align-items:center;padding:6px 14px;border-radius:12px;background:${color}15;border:1px solid ${color}30;cursor:pointer;" 
                                onclick="window.UIStudy._abrirModalGuardarPalabra('${texto.replace(/'/g, "\\'")}', '${transcripcionPalabra.replace(/'/g, "\\'")}', '${significado.replace(/'/g, "\\'")}', '${familia.replace(/'/g, "\\'")}', '${idioma}', '${nivelReal}')"
                                onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" 
                                onmouseout="this.style.transform='none';this.style.boxShadow='none'">`;
                        html += `<span style="font-weight:600;color:${color};font-size:16px;">${texto}</span>`;
                        if (transcripcionPalabra) {
                            html += `<span style="font-size:10px;color:var(--gray-light);margin-top:1px;">🎤 ${transcripcionPalabra}</span>`;
                        }
                        if (significado) {
                            html += `<span style="font-size:10px;color:var(--gray);margin-top:1px;">${significado.substring(0, 12)}</span>`;
                        }
                        html += `<span style="font-size:8px;color:var(--primary);margin-top:2px;">⭐ Guardar</span>`;
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
            if (!this._mostrandoRespuesta) {
                this._pistaActual = '';
            }
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
                        <span class="dot ${metodoClase}" style="
                            width:6px;height:6px;border-radius:50%;display:inline-block;
                            background:${metodoColor};
                        "></span>
                        ${metodoIcono} ${metodoTexto}
                    </span>
                </div>
            `;
            
            if (resultado) {
                const icono = resultado.correcto ? '✅' : resultado.aproximado ? '🟡' : '❌';
                const color = resultado.correcto ? 'var(--success)' : resultado.aproximado ? 'var(--warning)' : 'var(--danger)';
                html += '<div style="padding:12px 16px;border-radius:10px;background:' + color + '10;border-left:4px solid ' + color + ';margin-top:8px;">';
                html += '<div style="font-size:14px;font-weight:500;">' + icono + ' ' + resultado.mensaje + '</div>';
                
                if (resultado.sugerencias && resultado.sugerencias.length > 0) {
                    html += '<div style="font-size:13px;color:var(--gray);margin-top:4px;">💡 ' + resultado.sugerencias.slice(0, 2).join(' ') + '</div>';
                }
                
                if (!resultado.correcto && !resultado.aproximado) {
                    html += '<div style="font-size:13px;color:var(--gray);margin-top:4px;">Correcta: <strong>' + resultado.correctaEsperada + '</strong></div>';
                }
                
                if (resultado.puntuacion !== undefined && resultado.puntuacion > 0) {
                    html += '<div style="font-size:12px;color:var(--gray);margin-top:2px;">🎯 Puntuación: ' + resultado.puntuacion + '%</div>';
                }
                
                if (resultado.metodo) {
                    const metodoLabel = resultado.metodo === 'online_groq' ? '🧠 Groq' : '📝 Offline';
                    html += `<div style="font-size:10px;color:var(--gray-light);margin-top:2px;">🔍 ${metodoLabel}</div>`;
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

        _enlazarEventosEscritura() {
            const btnValidar = document.getElementById('btnValidarEscritura');
            const input = document.getElementById('respuestaEscritura');
            
            if (btnValidar) {
                const newBtn = btnValidar.cloneNode(true);
                btnValidar.parentNode.replaceChild(newBtn, btnValidar);
                
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._validarRespuestaEscrita();
                });
            }
            
            if (input) {
                const newInput = input.cloneNode(true);
                input.parentNode.replaceChild(newInput, input);
                
                newInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        this._validarRespuestaEscrita();
                    }
                });
                setTimeout(() => newInput.focus(), 150);
            }
        }

        // ============================================================
        // VALIDACIÓN DE RESPUESTA ESCRITA
        // ============================================================
        
        async _validarRespuestaEscrita() {
            const input = document.getElementById('respuestaEscritura');
            if (!input) return;
            
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
                    this.core.mostrarToast('🧠 Usando Groq para validación natural...', 'info');
                    
                    const groqResult = await window.vigia.validarTraduccionNatural(
                        respuesta,
                        correctaEsperada,
                        idioma,
                        nivel,
                        direccionGroq
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
                } catch (groqError) {
                    console.warn('⚠️ Falló validación con Groq, usando offline:', groqError.message);
                    metodo = 'offline';
                    this._metodoValidacion = 'offline';
                }
            } else {
                metodo = 'offline';
                this._metodoValidacion = 'offline';
            }
            
            if (!resultado) {
                const similitud = this._calcularSimilitudLevenshtein(respuesta.toLowerCase(), correctaEsperada.toLowerCase());
                const esExacto = respuesta.toLowerCase().trim() === correctaEsperada.toLowerCase().trim();
                const esAproximado = similitud >= 0.7 && !esExacto;
                const esParcial = similitud >= 0.5 && !esExacto && !esAproximado;
                
                let mensaje = '';
                
                if (esExacto) {
                    mensaje = '✅ ¡Perfecto! Respuesta correcta.';
                } else if (esAproximado) {
                    mensaje = '🟡 Muy cerca. Revisa pequeños detalles.';
                } else if (esParcial) {
                    mensaje = '🟡 Aproximado. Intenta mejorar la precisión.';
                } else {
                    mensaje = `❌ Incorrecto. La respuesta correcta es: "${correctaEsperada}"`;
                }
                
                resultado = {
                    correcto: esExacto,
                    aproximado: esAproximado || esParcial,
                    mensaje: mensaje,
                    correctaEsperada: correctaEsperada,
                    puntuacion: Math.round(similitud * 100),
                    metodo: 'offline'
                };
            }
            
            this._ultimaRespuesta = resultado;
            input.value = '';
            
            this._metodoValidacion = metodo;
            
            this._renderizarFraseInteractiva();
            
            if (resultado.correcto) {
                this.core.mostrarToast('✅ ¡Correcto!', 'success');
            } else if (resultado.aproximado) {
                this.core.mostrarToast('🟡 Casi correcto. Sigue así.', 'warning');
            } else {
                this.core.mostrarToast('❌ Incorrecto. Revisa la respuesta correcta.', 'error');
            }
            
            if (resultado.correcto) {
                await this._reforzarElemento(frase.id, 'frase', 1);
            } else if (resultado.aproximado) {
                await this._reforzarElemento(frase.id, 'frase', 0.3);
            } else {
                await this._debilistarElemento(frase.id, 'frase');
            }
            
            await this._guardarIndiceEstudio();
            
            // 🔥 Verificar progreso del tema después de validar
            await this._verificarProgresoTema();
            
            setTimeout(() => {
                const newInput = document.getElementById('respuestaEscritura');
                if (newInput) newInput.focus();
            }, 150);
        }

        // ============================================================
        // MÉTODOS AUXILIARES DE VALIDACIÓN
        // ============================================================
        
        _calcularSimilitudLevenshtein(a, b) {
            if (a.length === 0) return b.length === 0 ? 1 : 0;
            if (b.length === 0) return 0;
            
            const matrix = [];
            for (let i = 0; i <= a.length; i++) {
                matrix[i] = [i];
            }
            for (let j = 0; j <= b.length; j++) {
                matrix[0][j] = j;
            }
            for (let i = 1; i <= a.length; i++) {
                for (let j = 1; j <= b.length; j++) {
                    const cost = a[i-1] === b[j-1] ? 0 : 1;
                    matrix[i][j] = Math.min(
                        matrix[i-1][j] + 1,
                        matrix[i][j-1] + 1,
                        matrix[i-1][j-1] + cost
                    );
                }
            }
            const distancia = matrix[a.length][b.length];
            const maxLen = Math.max(a.length, b.length);
            return 1 - (distancia / maxLen);
        }

        async _reforzarElemento(id, tipo, cantidad = 1) {
            try {
                let progreso = await db.obtenerProgreso(id);
                if (progreso) {
                    progreso.rcn = Math.min(5, (progreso.rcn || 0) + cantidad * 0.3);
                    progreso.repasosExitosos = (progreso.repasosExitosos || 0) + 1;
                    progreso.ultimoRepaso = Date.now();
                    await db.guardarProgreso(progreso);
                }
            } catch (e) {
                console.warn('⚠️ Error reforzando elemento:', e);
            }
        }

        async _debilistarElemento(id, tipo) {
            try {
                let progreso = await db.obtenerProgreso(id);
                if (progreso) {
                    progreso.rcn = Math.max(0, (progreso.rcn || 0) - 0.2);
                    progreso.repasosFallidos = (progreso.repasosFallidos || 0) + 1;
                    progreso.ultimoRepaso = Date.now();
                    await db.guardarProgreso(progreso);
                }
            } catch (e) {
                console.warn('⚠️ Error debilitando elemento:', e);
            }
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
                console.warn('⚠️ Error generando pista:', error);
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
            
            const metodoClase = this._metodoValidacion === 'online' ? 'online' : 'offline';
            const metodoIcono = this._metodoValidacion === 'online' ? '🧠' : '📝';
            const metodoTexto = this._metodoValidacion === 'online' ? 'Validación con Groq' : 'Validación offline';
            const metodoColor = this._metodoValidacion === 'online' ? 'var(--success)' : 'var(--gray)';
            
            let html = '<div style="padding:12px 0;border-top:2px solid var(--bg);border-bottom:2px solid var(--bg);margin-bottom:16px;">';
            
            html += `
                <div style="display:flex;justify-content:flex-end;margin-bottom:8px;gap:8px;">
                    <span class="indicador-validacion ${metodoClase}" style="
                        display:inline-flex;align-items:center;gap:4px;
                        font-size:10px;padding:2px 10px;border-radius:12px;
                        background:${metodoColor}15;border:1px solid ${metodoColor};
                        color:${metodoColor};
                    ">
                        <span class="dot ${metodoClase}" style="
                            width:6px;height:6px;border-radius:50%;display:inline-block;
                            background:${metodoColor};
                        "></span>
                        ${metodoIcono} ${metodoTexto}
                    </span>
                </div>
            `;
            
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
                const tieneChino = /[\u4e00-\u9fff]/.test(opcion);
                
                html += `<div class="multiple-opcion" ${dataAttr} ${disabled} style="padding:12px 16px;border-radius:10px;border:2px solid ${borderColor};background:${bgColor};color:${textColor};cursor:${resultado ? 'default' : 'pointer'};text-align:center;font-size:${tieneChino ? '18px' : '14px'};font-weight:500;transition:all 0.3s;display:flex;flex-direction:column;align-items:center;gap:2px;">`;
                if (resultado && isCorrect) {
                    html += '✅ ';
                } else if (resultado && isSelected && !isCorrect) {
                    html += '❌ ';
                }
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

        _enlazarEventosMultiple() {
            document.querySelectorAll('.multiple-opcion').forEach(el => {
                const newEl = el.cloneNode(true);
                el.parentNode.replaceChild(newEl, el);
                
                newEl.addEventListener('click', (e) => {
                    const opcion = newEl.dataset.texto;
                    if (opcion && !this._ultimaRespuesta) {
                        this._seleccionarOpcionMultiple(opcion);
                    }
                });
            });
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
            
            // 🔥 Verificar progreso del tema después de seleccionar
            await this._verificarProgresoTema();
        }

        // ============================================================
        // ESCUCHA (CON PINYIN/TRANSCRIPCIÓN)
        // ============================================================
        
        _renderEscucha(frase, modoData) {
            const texto = modoData.esInverso ? modoData.ocultar : modoData.mostrar;
            const esJeroglifico = modoData.esJeroglifico;
            const transcripcion = modoData.esJeroglifico ? 
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
            if (nativeVoice) {
                utterance.voice = nativeVoice;
            }
            
            window.speechSynthesis.speak(utterance);
            this.core.mostrarToast('🔊 Reproduciendo...', 'info');
        }

        // ============================================================
        // MODAL GUARDAR PALABRA
        // ============================================================
        
        _abrirModalGuardarPalabra(palabra, pinyin, significado, familia, idioma, nivel) {
            console.log('📖 Abriendo modal para:', palabra);
            
            const modal = document.getElementById('modalGuardarPalabra');
            const body = document.getElementById('modalGuardarPalabraBody');
            if (!modal || !body) {
                console.error('Modal no encontrado');
                if (this.core) {
                    this.core.mostrarToast('❌ Error: modal no disponible', 'error');
                }
                return;
            }

            const nivelReal = nivel || this._obtenerNivelRealUsuario();
            const nombreNivel = `📚 Nivel ${nivelReal}`;
            const nombreFamilia = `📂 ${familia}`;
            
            body.innerHTML = `
                <div style="text-align:center; margin-bottom:20px;">
                    <div style="font-size:48px; margin-bottom:10px;">📖</div>
                    <h2 style="font-size:24px;font-weight:800;color:var(--dark);margin-bottom:4px;">${palabra}</h2>
                    ${pinyin ? `<p style="font-size:16px;color:var(--gray);margin-bottom:8px;letter-spacing:1px;">🔊 ${pinyin}</p>` : ''}
                    <p style="font-size:14px;color:var(--gray);margin-bottom:4px;">Significado: ${significado}</p>
                    <p style="font-size:12px;color:var(--gray-light);margin-bottom:4px;">Familia semántica: <strong>${familia}</strong></p>
                    <p style="font-size:12px;color:var(--gray-light);margin-bottom:12px;">Nivel: <strong>${nivelReal}</strong></p>
                    <p style="font-size:11px;color:var(--gray-light);">Idioma: ${idioma}</p>
                </div>
                
                <div style="background:var(--bg);border-radius:10px;padding:12px 16px;margin-bottom:16px;text-align:center;">
                    <div style="font-size:13px;font-weight:600;color:var(--dark);">📁 Se guardará en:</div>
                    <div style="font-size:14px;color:var(--primary);font-weight:700;margin-top:4px;">
                        ${nombreNivel} → ${nombreFamilia}
                    </div>
                </div>
                
                <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
                    <button id="btnGuardarPalabraModal" class="btn-primary" style="padding:12px 30px;font-size:16px;width:auto;background:#6C5CE7;color:white;border:none;border-radius:8px;cursor:pointer;">
                        <i class="fas fa-star"></i> Guardar en Mi Espacio
                    </button>
                    <button id="btnCancelarGuardarModal" class="btn-secondary" style="padding:12px 30px;font-size:16px;width:auto;background:var(--light);color:var(--dark);border:none;border-radius:8px;cursor:pointer;">
                        Cancelar
                    </button>
                </div>
            `;

            modal.style.display = 'flex';

            document.getElementById('btnGuardarPalabraModal').onclick = async () => {
                try {
                    if (!window.gestorFavoritos || !gestorFavoritos._initDone) {
                        await gestorFavoritos.init();
                    }
                    
                    const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                    let palabraExistente = palabrasExistentes.find(p => 
                        (p.palabra || p.hanzi || '') === palabra && p.idioma === idioma
                    );

                    let palabraId;
                    if (palabraExistente) {
                        palabraId = palabraExistente.id;
                        const esFavorita = await gestorFavoritos.estaEnFavoritos('palabra', palabraId);
                        if (!esFavorita) {
                            await gestorFavoritos.añadirPalabra(palabraId);
                            await gestorFavoritos.añadirPalabraAGrupo(palabraId, nombreNivel);
                            await gestorFavoritos.añadirPalabraAGrupo(palabraId, nombreFamilia);
                            if (window.uiCore) {
                                window.uiCore.mostrarToast(`✅ "${palabra}" guardada en ${nombreNivel} → ${nombreFamilia}`, 'success');
                            }
                        } else {
                            if (window.uiCore) {
                                window.uiCore.mostrarToast(`ℹ️ "${palabra}" ya está en Mi Espacio`, 'info');
                            }
                        }
                    } else {
                        const palabraObj = {
                            palabra: palabra,
                            hanzi: palabra,
                            pinyin: pinyin || '',
                            significado: significado || palabra,
                            familia: familia || 'sin_clasificar',
                            familias: [familia || 'sin_clasificar'],
                            nivel: nivelReal,
                            tipo: 'sustantivo',
                            idioma: idioma || 'es',
                            frecuencia: 1,
                            neuroScore: 0.5,
                            nivelDominio: 'nuevo',
                            fechaCreacion: Date.now()
                        };
                        palabraId = await db.guardarPalabra(palabraObj);
                        if (palabraId) {
                            await gestorFavoritos.añadirPalabra(palabraId);
                            await gestorFavoritos.añadirPalabraAGrupo(palabraId, nombreNivel);
                            await gestorFavoritos.añadirPalabraAGrupo(palabraId, nombreFamilia);
                            if (window.uiCore) {
                                window.uiCore.mostrarToast(`✅ "${palabra}" guardada en ${nombreNivel} → ${nombreFamilia}`, 'success');
                            }
                        } else {
                            if (window.uiCore) {
                                window.uiCore.mostrarToast('❌ Error al guardar la palabra', 'error');
                            }
                            return;
                        }
                    }

                    if (window.uiCore) window.uiCore._actualizarEspacioStats();
                    if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(window.uiCore);
                    if (window.UIEspacio) window.UIEspacio._renderizarMiEspacio();
                    
                    document.getElementById('modalGuardarPalabra').style.display = 'none';
                } catch (error) {
                    console.error('Error al guardar la palabra:', error);
                    if (window.uiCore) {
                        window.uiCore.mostrarToast('❌ Error al guardar la palabra', 'error');
                    }
                }
            };

            document.getElementById('btnCancelarGuardarModal').onclick = () => {
                modal.style.display = 'none';
            };
            
            document.getElementById('cerrarModalGuardarPalabra').onclick = () => {
                modal.style.display = 'none';
            };
            
            window.onclick = (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
        }

        // ============================================================
        // 🔥 RESPUESTA Y NAVEGACIÓN (CORREGIDO - VERIFICA PROGRESO)
        // ============================================================
        
        _responderEstudio(tipo) {
            if (pipeline && pipeline.procesarRespuesta) {
                this._resetearEstadoFrase();
                pipeline.procesarRespuesta(tipo);
                this._guardarIndiceEstudio();
                
                setTimeout(async () => {
                    this._resetearEstadoFrase();
                    
                    // 🔥 PRIMERO verificar progreso ANTES de renderizar
                    await this._verificarProgresoTema();
                    
                    // Si el tema NO se finalizó, renderizar la siguiente frase
                    if (!this._temaFinalizado) {
                        this._renderizarFraseInteractiva();
                    }
                    
                    if (window.UIDashboard) {
                        window.UIDashboard._cargarDashboardInicial(window.uiCore);
                    }
                }, 50);
            }
        }

        _fraseAnterior() {
            if (pipeline && pipeline.anterior) {
                this._resetearEstadoFrase();
                pipeline.anterior();
                this._guardarIndiceEstudio();
                
                setTimeout(async () => {
                    this._resetearEstadoFrase();
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
                    await this._verificarProgresoTema();
                    if (!this._temaFinalizado) {
                        this._renderizarFraseInteractiva();
                    }
                }, 50);
            }
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
                    '<p style="color:var(--gray);font-size:16px;margin-bottom:8px;line-height:1.6;">' + 
                    (usuario ? 'Comienza generando o importando historias' : 'Regístrate para comenzar') + 
                    '</p>' +
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
        // GENERAR OPCIONES MÚLTIPLES CON GROQ
        // ============================================================

        async _generarOpcionesMultiplesConGroq(frase, modoData) {
            if (this._generandoOpciones) {
                return new Promise((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (!this._generandoOpciones && this._opcionesMultiple.length > 0) {
                            clearInterval(checkInterval);
                            resolve(this._opcionesMultiple);
                        }
                    }, 100);
                });
            }

            this._generandoOpciones = true;
            const idioma = frase.idioma || pipeline.idiomaObjetivo || 'es';
            const esJeroglifico = this._esJeroglifico(idioma);
            const esInverso = modoData.esInverso;
            const nivel = frase.nivel || pipeline.nivel || 'A1';

            let correcta;
            let idiomaOpciones;
            let etiquetaOpciones;
            
            if (esInverso) {
                correcta = frase.original;
                idiomaOpciones = idioma;
                etiquetaOpciones = 'en ' + idioma;
            } else {
                correcta = frase.traduccion;
                idiomaOpciones = 'español';
                etiquetaOpciones = 'en español';
            }

            if (window.vigia && window.vigia.enLinea && window.vigia._apiKeyValidada) {
                try {
                    this.core?.mostrarToast('🧠 Generando opciones con Groq...', 'info');

                    const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
                    const frasesSimilares = todasFrases
                        .filter(f => f.id !== frase.id)
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 10);

                    let candidatas = [];
                    if (esInverso) {
                        candidatas = frasesSimilares.map(f => f.original);
                    } else {
                        candidatas = frasesSimilares.map(f => f.traduccion);
                    }
                    candidatas = candidatas.filter(t => t && t.trim() !== '' && t !== correcta);

                    const prompt = `
Eres un experto en aprendizaje de idiomas y generación de ejercicios de opción múltiple.

**Tarea:** Genera 3 opciones incorrectas (distractores) para una pregunta de opción múltiple.

**Contexto:**
- Idioma objetivo: ${idioma} (${esJeroglifico ? 'jeroglífico' : 'alfabético'})
- Nivel: ${nivel}
- Modo: ${esInverso ? 'INVERSO' : 'NORMAL'}

**La frase correcta (${esInverso ? 'en el idioma objetivo' : 'traducción al español'}):**
"${correcta}"

**IMPORTANTE - IDIOMA DE LAS OPCIONES:**
${esInverso ? 
'🔴 OBLIGATORIO: Las opciones DEBEN estar en el idioma objetivo (' + idioma + '). NO uses español.' : 
'🔴 OBLIGATORIO: Las opciones DEBEN estar en español. NO uses ' + idioma + '.'}

**REGLAS IMPORTANTES:**
1. Genera 3 opciones INCORRECTAS que sean MUY SIMILARES a la respuesta correcta.
2. Las opciones deben ser creíbles y tener POCA VARIACIÓN con la correcta.
3. ${esJeroglifico ? 'Para idiomas jeroglíficos, usa caracteres similares o con el mismo significado.' : 'Usa palabras con ortografía o significado similar.'}
4. NO uses opciones obviamente incorrectas o sin sentido.
5. Las opciones deben ser del mismo nivel de dificultad (${nivel}).

**Responde SOLO en formato JSON:**
{
    "opciones": [
        "opcion_incorrecta_1",
        "opcion_incorrecta_2",
        "opcion_incorrecta_3"
    ]
}`;

                    const resultado = await window.vigia._consultarGroq(prompt, 'json');
                    
                    if (resultado && resultado.opciones && Array.isArray(resultado.opciones) && resultado.opciones.length >= 3) {
                        let opcionesFiltradas = resultado.opciones
                            .filter(o => o && o.trim() !== '' && o.trim() !== correcta)
                            .slice(0, 3);
                        
                        if (esInverso && esJeroglifico) {
                            opcionesFiltradas = opcionesFiltradas.filter(o => /[\u4e00-\u9fff]/.test(o));
                        }
                        
                        if (opcionesFiltradas.length >= 3) {
                            const opcionesFinales = [correcta, ...opcionesFiltradas];
                            const mezcladas = opcionesFinales.sort(() => Math.random() - 0.5);
                            this._generandoOpciones = false;
                            this._opcionesMultiple = mezcladas;
                            this._metodoValidacion = 'online';
                            console.log('✅ Opciones múltiples generadas con Groq:', mezcladas);
                            return mezcladas;
                        }
                    }
                } catch (error) {
                    console.warn('⚠️ Error generando opciones con Groq:', error);
                }
            }

            return this._generarOpcionesMultiplesFallback(frase, modoData);
        }

        async _generarOpcionesMultiplesFallback(frase, modoData) {
            const esInverso = modoData.esInverso;
            const idioma = frase.idioma || pipeline.idiomaObjetivo || 'es';
            const esJeroglifico = this._esJeroglifico(idioma);
            
            let correcta;
            if (esInverso) {
                correcta = frase.original;
            } else {
                correcta = frase.traduccion;
            }

            const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
            
            let opcionesFinales = [];
            
            if (esInverso) {
                const distractores = todasFrases
                    .filter(f => f.id !== frase.id && f.original !== correcta && f.original)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 5)
                    .map(f => f.original);
                opcionesFinales = [correcta, ...distractores];
            } else {
                const distractores = todasFrases
                    .filter(f => f.id !== frase.id && f.traduccion !== correcta && f.traduccion)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 5)
                    .map(f => f.traduccion);
                opcionesFinales = [correcta, ...distractores];
            }
            
            opcionesFinales = opcionesFinales.filter(o => o && o.trim() !== '' && o !== correcta);
            
            const opcionesUnicas = [correcta];
            for (const o of opcionesFinales) {
                if (!opcionesUnicas.includes(o) && opcionesUnicas.length < 4) {
                    opcionesUnicas.push(o);
                }
            }
            
            while (opcionesUnicas.length < 4) {
                if (esInverso) {
                    const fallback = esJeroglifico ? '其他' : 'Otro';
                    if (!opcionesUnicas.includes(fallback) && fallback !== correcta) {
                        opcionesUnicas.push(fallback);
                    } else {
                        opcionesUnicas.push(correcta + '?');
                    }
                } else {
                    const fallback = 'Otra opción';
                    if (!opcionesUnicas.includes(fallback) && fallback !== correcta) {
                        opcionesUnicas.push(fallback);
                    } else {
                        opcionesUnicas.push(correcta + '?');
                    }
                }
            }
            
            const mezcladas = opcionesUnicas.sort(() => Math.random() - 0.5);
            this._generandoOpciones = false;
            this._opcionesMultiple = mezcladas;
            console.log('📝 Opciones generadas (fallback):', mezcladas);
            return mezcladas;
        }

        // ============================================================
        // TOGGLE FRASE FAVORITA
        // ============================================================
        
        async _toggleFraseFavorita(fraseId, checked) {
            if (!fraseId) {
                console.warn('⚠️ ID de frase no válido');
                if (this.core) this.core.mostrarToast('❌ Error: ID de frase no válido', 'error');
                return;
            }
            
            const nivelReal = this._obtenerNivelRealUsuario();
            const nombreNivel = `📚 Nivel ${nivelReal}`;
            
            try {
                if (!window.gestorFavoritos || !gestorFavoritos._initDone) {
                    await window.gestorFavoritos.init();
                }
                
                if (checked) {
                    const yaExiste = await window.gestorFavoritos.estaEnFavoritos('frase', fraseId);
                    if (yaExiste) {
                        if (this.core) this.core.mostrarToast('ℹ️ La frase ya está en Mi Espacio', 'info');
                        return;
                    }
                    
                    const result = await window.gestorFavoritos.añadirFrase(fraseId);
                    if (result) {
                        await window.gestorFavoritos.añadirFraseAGrupo(fraseId, this.GRUPO_USUARIO || '📌 Seleccionadas por Usuario');
                        await window.gestorFavoritos.añadirFraseAGrupo(fraseId, nombreNivel);
                        
                        if (this.core) this.core.mostrarToast(`✅ Frase guardada en ${nombreNivel}`, 'success');
                    } else {
                        if (this.core) this.core.mostrarToast('⚠️ No se pudo guardar la frase', 'warning');
                    }
                } else {
                    const result = await window.gestorFavoritos.eliminarFrase(fraseId);
                    if (result) {
                        if (this.core) this.core.mostrarToast('🗑️ Frase eliminada de Mi Espacio', 'warning');
                    } else {
                        if (this.core) this.core.mostrarToast('⚠️ No se pudo eliminar la frase', 'warning');
                    }
                }
            } catch (error) {
                console.warn('⚠️ Error al gestionar favorito:', error);
                if (error.message && error.message.includes('no existe')) {
                    if (this.core) this.core.mostrarToast('❌ La frase no existe en la base de datos', 'error');
                }
            }
            
            try {
                if (window.uiCore) {
                    window.uiCore._actualizarEspacioStats();
                }
                if (window.UIDashboard) {
                    window.UIDashboard._cargarDashboardInicial(this.core);
                }
                if (window.UIEspacio) {
                    window.UIEspacio._renderizarMiEspacio();
                }
            } catch (e) {
                console.warn('⚠️ Error actualizando UI después de toggle:', e);
            }
        }

        // ============================================================
        // ============================================================
        // NUEVAS FUNCIONALIDADES: LIBRO DE LECTURA Y GENERADOR
        // ============================================================
        // ============================================================

        // ============================================================
        // LIBRO DE LECTURA CON CHECKBOX DE HISTORIAS LEÍDAS
        // ============================================================

        async _abrirLibroLectura() {
            const core = this.core;
            const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
            
            if (this._libroAbierto && this._modoVista === 'libro') {
                console.log('📚 El libro ya está abierto');
                return;
            }
            
            this._libroAbierto = true;
            this._modoVista = 'libro';
            this._cerrandoLibro = false;
            
            const todasHistorias = await db.obtenerHistoriasPorIdioma(idioma);
            
            if (todasHistorias.length === 0) {
                core?.mostrarToast('📚 No hay historias cargadas. Importa o genera contenido primero.', 'warning');
                this._libroAbierto = false;
                this._modoVista = 'frase';
                return;
            }

            const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
            const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
            const todasReglas = await db.obtenerReglasGramaticales(idioma);
            
            const historiasPorTema = {};
            const temasMap = {};
            
            for (const h of todasHistorias) {
                const temaId = h.temaId || 'sin_tema';
                if (!historiasPorTema[temaId]) {
                    historiasPorTema[temaId] = [];
                }
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
            
            let html = `
                <div class="libro-lectura-container" style="padding:16px;max-width:100%;">
                    <!-- HEADER -->
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:12px 20px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:14px;border:2px solid var(--primary)20;">
                        <div>
                            <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">📚 Libro de Lectura</h2>
                            <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                                ${totalHistorias} historias · ${this._getNombreIdioma(idioma)}
                            </p>
                            <div style="display:flex;gap:12px;margin-top:4px;font-size:11px;color:var(--gray-light);flex-wrap:wrap;">
                                <span>📝 ${todasFrases.length} frases</span>
                                <span>📖 ${todasPalabras.length} palabras</span>
                                <span>📋 ${todasReglas.length} reglas</span>
                            </div>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                            <button class="btn-secondary" onclick="window.UIStudy._volverDelLibro()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                                <i class="fas fa-arrow-left"></i> Volver
                            </button>
                            <button class="btn-primary" onclick="window.UIStudy._generarFrasesDesdeLibro()" style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;${this._generandoFrases ? 'opacity:0.6;cursor:not-allowed;' : ''}" ${this._generandoFrases ? 'disabled' : ''}>
                                <i class="fas fa-magic"></i> ${this._generandoFrases ? 'Generando...' : 'Generar Frases'}
                            </button>
                        </div>
                    </div>

                    <!-- BARRA DE PROGRESO DE HISTORIAS LEÍDAS -->
                    <div style="background:var(--white);border-radius:12px;padding:12px 18px;margin-bottom:16px;border:2px solid var(--primary)20;box-shadow:var(--shadow);">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="font-size:20px;">📖</span>
                                <div>
                                    <div style="font-size:14px;font-weight:600;color:var(--dark);">
                                        Progreso de Lectura
                                        <span class="historias-leidas-contador" style="font-size:12px;font-weight:400;color:var(--gray);">${leidas} leídas</span>
                                    </div>
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

                    <!-- BARRA DE FIABILIDAD -->
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

                    <!-- HISTORIAS POR TEMA -->
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
                const totalFrases = await this._contarFrasesHistorias(historias);
                const totalHistoriasTema = historias.length;
                const leidasTema = historias.filter(h => this._historiasLeidas.has(h.id)).length;
                const pctLeidasTema = totalHistoriasTema > 0 ? Math.round((leidasTema / totalHistoriasTema) * 100) : 0;
                
                let nombreMostrar = nombreTema;
                if (nombreTema === '📚 Tema sin nombre' || nombreTema === '📂 Sin tema asignado' || nombreTema.startsWith('📚 Tema ')) {
                    if (historias.length > 0 && historias[0].titulo) {
                        nombreMostrar = `📚 ${historias[0].titulo.substring(0, 25)}...`;
                    } else {
                        nombreMostrar = `📚 Historia(s) ${temasOrdenados.indexOf(temaId) + 1}`;
                    }
                }
                
                html += `
                    <div style="background:var(--white);border-radius:12px;padding:14px 16px;box-shadow:var(--shadow);border-left:4px solid ${pctLeidasTema >= 80 ? 'var(--success)' : pctLeidasTema >= 40 ? 'var(--primary)' : 'var(--light)'};">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:4px;">
                            <div>
                                <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">${nombreMostrar}</h3>
                                <span style="font-size:12px;color:var(--gray-light);">${historias.length} historias · ${totalFrases} frases · ${leidasTema} leídas</span>
                                <span style="font-size:11px;color:var(--success);margin-left:8px;">${pctLeidasTema}% completado</span>
                            </div>
                            <button class="btn-primary" onclick="window.UIStudy._estudiarTemaDesdeLibro('${temaId}')" 
                                    style="padding:4px 14px;font-size:11px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                <i class="fas fa-play"></i> Estudiar Todo
                            </button>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px;">
                `;

                for (const historia of historias) {
                    const frases = await db.obtenerFrasesPorHistoria(historia.id);
                    const completadas = await this._contarFrasesCompletadas(frases);
                    const pct = frases.length > 0 ? Math.round((completadas / frases.length) * 100) : 0;
                    const tituloMostrar = historia.titulo || '📖 Historia sin título';
                    const esLeida = this._historiasLeidas.has(historia.id);
                    
                    html += `
                        <div class="historia-card" data-historia-id="${historia.id}" style="
                            background: ${esLeida ? 'rgba(0, 184, 148, 0.05)' : 'var(--white)'};
                            border-radius: 8px;
                            padding: 10px 12px;
                            border: 1px solid ${esLeida ? 'var(--success)' : 'var(--light)'};
                            border-left: 4px solid ${esLeida ? 'var(--success)' : 'var(--light)'};
                            transition: all 0.3s ease;
                            position: relative;
                        ">
                            <div style="display:flex;justify-content:space-between;align-items:start;gap:6px;">
                                <div style="flex:1;min-width:0;">
                                    <div style="font-size:14px;font-weight:600;color:var(--dark);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${tituloMostrar}">
                                        ${tituloMostrar}
                                    </div>
                                    <div style="display:flex;gap:8px;font-size:11px;color:var(--gray-light);flex-wrap:wrap;align-items:center;margin-top:2px;">
                                        <span>${frases.length} frases</span>
                                        <span>${pct}% completado</span>
                                        <span class="historia-leida-tag" style="display:${esLeida ? 'inline-block' : 'none'};font-size:10px;color:var(--success);font-weight:600;">✅ Leída</span>
                                    </div>
                                    <div style="height:3px;background:var(--bg);border-radius:2px;overflow:hidden;margin-top:4px;max-width:120px;">
                                        <div class="historia-progreso" style="height:100%;width:${esLeida ? 100 : pct}%;background:${esLeida ? 'var(--success)' : 'var(--primary)'};border-radius:2px;transition:width 0.5s ease;"></div>
                                    </div>
                                </div>
                                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
                                    <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;padding:2px 8px;background:${esLeida ? 'var(--success)08' : 'var(--bg)'};border-radius:8px;border:1px solid ${esLeida ? 'var(--success)' : 'var(--light)'};transition:all 0.3s;" 
                                           onmouseover="this.style.borderColor='var(--primary)'" 
                                           onmouseout="this.style.borderColor='${esLeida ? 'var(--success)' : 'var(--light)'}'">
                                        <input type="checkbox" class="historia-checkbox-input" 
                                               ${esLeida ? 'checked' : ''}
                                               onchange="window.UIStudy._toggleHistoriaLeida(${historia.id}, this.checked)"
                                               style="width:14px;height:14px;cursor:pointer;">
                                        <span class="historia-leida-badge" style="font-size:10px;font-weight:600;color:${esLeida ? 'var(--success)' : 'var(--gray)'};">
                                            ${esLeida ? '✅ Leída' : '📖 No leída'}
                                        </span>
                                    </label>
                                    <div style="display:flex;gap:4px;">
                                        <button class="btn-secondary" onclick="window.UIStudy._leerHistoriaCompletaDesdeLibro(${historia.id})" style="padding:2px 10px;font-size:10px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                            <i class="fas fa-book"></i> Leer
                                        </button>
                                        <button class="btn-secondary" onclick="window.UIStudy._estudiarHistoriaDesdeLibro(${historia.id})" style="padding:2px 10px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                            <i class="fas fa-play"></i> Estudiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }

                html += `
                        </div>
                    </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;

            const container = document.getElementById('cardContainer');
            if (container) {
                container.innerHTML = html;
                this._modoVista = 'libro';
                this._actualizarContadorHistoriasLeidas();
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
            
            if (pipeline && pipeline.fraseActual) {
                this._renderizarFraseInteractiva();
            } else if (pipeline && pipeline.frases && pipeline.frases.length > 0) {
                pipeline.cargarFrase(0);
            } else {
                this.mostrarPantallaInicio();
            }
            
            if (this.core) {
                this.core.irAModulo('study');
            }
            
            setTimeout(() => {
                this._cerrandoLibro = false;
            }, 500);
        }

        // ============================================================
        // ESTUDIAR TEMA DESDE LIBRO
        // ============================================================

        async _estudiarTemaDesdeLibro(temaId) {
            if (this._cerrandoLibro) {
                console.log('⏳ Ya hay una operación en curso');
                return;
            }
            
            this._cerrandoLibro = true;
            this._modoVista = 'frase';
            this._libroAbierto = false;
            
            this.core?.mostrarToast('📖 Cargando tema...', 'info');
            
            try {
                await pipeline.estudiarTema(temaId);
                
                setTimeout(() => {
                    this._modoVista = 'frase';
                    this._libroAbierto = false;
                    this._renderizarFraseInteractiva();
                    
                    if (this.core) {
                        this.core.irAModulo('study');
                    }
                    
                    this.core?.mostrarToast('✅ Tema cargado correctamente', 'success');
                    this._cerrandoLibro = false;
                }, 300);
                
            } catch (error) {
                console.error('❌ Error estudiando tema:', error);
                this.core?.mostrarToast('❌ Error al cargar el tema', 'error');
                this._modoVista = 'libro';
                this._libroAbierto = true;
                this._cerrandoLibro = false;
                this._abrirLibroLectura();
            }
        }

        // ============================================================
        // ESTUDIAR HISTORIA DESDE LIBRO
        // ============================================================

        async _estudiarHistoriaDesdeLibro(historiaId) {
            if (this._cerrandoLibro) {
                console.log('⏳ Ya hay una operación en curso');
                return;
            }
            
            this._cerrandoLibro = true;
            this._modoVista = 'frase';
            this._libroAbierto = false;
            
            this.core?.mostrarToast('📖 Cargando historia...', 'info');
            
            try {
                await pipeline.estudiarHistoria(historiaId);
                
                setTimeout(() => {
                    this._modoVista = 'frase';
                    this._libroAbierto = false;
                    this._renderizarFraseInteractiva();
                    
                    if (this.core) {
                        this.core.irAModulo('study');
                    }
                    
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
        // CONTAR FRASES
        // ============================================================

        async _contarFrasesHistorias(historias) {
            let total = 0;
            for (const h of historias) {
                const frases = await db.obtenerFrasesPorHistoria(h.id);
                total += frases.length;
            }
            return total;
        }

        async _contarFrasesCompletadas(frases) {
            let completadas = 0;
            for (const f of frases) {
                const progreso = await db.obtenerProgreso(f.id);
                if (progreso && (progreso.estado === 'completada' || progreso.rcn >= 4)) {
                    completadas++;
                }
            }
            return completadas;
        }

        // ============================================================
        // LEER HISTORIA COMPLETA DESDE LIBRO
        // ============================================================

        async _leerHistoriaCompletaDesdeLibro(historiaId) {
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
        }

        // ============================================================
        // RENDERIZAR HISTORIA COMPLETA DESDE LIBRO
        // ============================================================

        async _renderizarHistoriaCompletaDesdeLibro() {
            const container = document.getElementById('cardContainer');
            if (!container) return;

            const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
            const esJeroglifico = this._esJeroglifico(idioma);

            let html = `
                <div style="padding:16px;max-width:900px;margin:0 auto;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.UIStudy._volverDelLibro()" style="padding:6px 14px;font-size:13px;">
                            <i class="fas fa-arrow-left"></i> Volver al libro
                        </button>
                        <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;flex:1;">📖 ${this._historiaTitulo}</h2>
                        <span style="font-size:12px;color:var(--gray-light);">${this._historiaActual.length} frases</span>
                        <button class="btn-primary" onclick="window.UIStudy._estudiarHistoriaDesdeLibro(${this._historiaIdActual})" style="padding:4px 12px;font-size:11px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-play"></i> Estudiar todo
                        </button>
                        <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;padding:4px 10px;background:var(--bg);border-radius:8px;border:1px solid var(--light);">
                            <input type="checkbox" ${this._historiasLeidas.has(this._historiaIdActual) ? 'checked' : ''} 
                                   onchange="window.UIStudy._toggleHistoriaLeida(${this._historiaIdActual}, this.checked)"
                                   style="width:14px;height:14px;cursor:pointer;">
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
                if (frase.palabras && frase.palabras.length > 0) {
                    palabrasHtml = `
                        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;padding-top:8px;border-top:1px solid var(--light);">
                            ${frase.palabras.map(p => {
                                const texto = p.palabra || p.hanzi || '';
                                const pinyinPalabra = p.pinyin || '';
                                const transcripcionPalabra = p.transcripcion || '';
                                const significado = p.significado || '';
                                return `
                                    <span style="display:inline-flex;flex-direction:column;align-items:center;padding:2px 10px;border-radius:10px;background:var(--bg);border:1px solid var(--light);cursor:pointer;font-size:12px;"
                                          onclick="window.UIStudy._abrirModalGuardarPalabra('${texto.replace(/'/g, "\\'")}', '${(esJeroglifico ? pinyinPalabra : transcripcionPalabra).replace(/'/g, "\\'")}', '${significado.replace(/'/g, "\\'")}', '${(p.familia || 'General').replace(/'/g, "\\'")}', '${idioma}', '${nivelReal}')"
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
                
                html += `
                    <div style="background:var(--white);border-radius:10px;padding:14px 16px;margin-bottom:12px;box-shadow:var(--shadow);border-left:4px solid var(--primary);">
                        <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:8px;">
                            <div style="flex:1;min-width:200px;">
                                <div style="display:flex;align-items:center;gap:6px;">
                                    <span style="font-size:12px;font-weight:600;color:var(--gray-light);">${numFrase}.</span>
                                    <div style="font-size:18px;font-weight:700;color:var(--dark);">
                                        ${esJeroglifico ? (frase.segmentacion?.hanzi || frase.original) : frase.original}
                                    </div>
                                </div>
                                ${transcripcion ? `
                                    <div style="font-size:15px;color:${esJeroglifico ? 'var(--primary)' : 'var(--secondary)'};margin-top:4px;letter-spacing:1px;margin-left:22px;">
                                        ${esJeroglifico ? '🔊' : '🎤'} ${transcripcion}
                                    </div>
                                ` : ''}
                                <div style="font-size:16px;color:var(--gray);margin-top:4px;margin-left:22px;">
                                    → ${frase.traduccion}
                                </div>
                                ${frase.reglaGramatical ? `
                                    <div style="font-size:11px;color:var(--primary);margin-top:4px;padding:4px 8px;background:var(--bg);border-radius:4px;display:inline-block;margin-left:22px;">
                                        📋 ${frase.reglaGramatical}
                                    </div>
                                ` : ''}
                            </div>
                            <div style="display:flex;gap:4px;flex-wrap:wrap;">
                                <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;padding:4px 8px;background:var(--bg);border-radius:6px;border:1px solid var(--light);">
                                    <input type="checkbox" ${esFavorita ? 'checked' : ''} 
                                           onchange="window.UIStudy._toggleFraseFavorita(${frase.id}, this.checked)" 
                                           style="width:14px;height:14px;cursor:pointer;">
                                    <span>⭐</span>
                                </label>
                                <button class="btn-secondary" onclick="window.UIStudy._estudiarFraseDesdeHistoria(${frase.id})" style="padding:2px 10px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                    <i class="fas fa-play"></i> Estudiar
                                </button>
                            </div>
                        </div>
                        ${palabrasHtml}
                    </div>
                `;
            }

            html += `
                    <div style="display:flex;gap:10px;margin-top:16px;justify-content:center;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.UIStudy._volverDelLibro()" style="padding:8px 20px;font-size:13px;">
                            <i class="fas fa-arrow-left"></i> Volver al libro
                        </button>
                        <button class="btn-primary" onclick="window.UIStudy._estudiarHistoriaDesdeLibro(${this._historiaIdActual})" style="padding:8px 20px;font-size:13px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-play"></i> Estudiar toda la historia
                        </button>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        }

        // ============================================================
        // CERRAR HISTORIA COMPLETA (ALIAS DE _volverDelLibro)
        // ============================================================

        _cerrarHistoriaCompleta() {
            this._volverDelLibro();
        }

        // ============================================================
        // ESTUDIAR FRASE DESDE HISTORIA
        // ============================================================

        async _estudiarFraseDesdeHistoria(fraseId) {
            const frases = await db.obtenerFrases();
            const frase = frases.find(f => f.id === fraseId);
            if (!frase) {
                this.core?.mostrarToast('❌ Frase no encontrada', 'error');
                return;
            }
            
            this._cerrandoLibro = true;
            this._modoVista = 'frase';
            this._libroAbierto = false;
            
            pipeline.frases = [frase];
            pipeline.indiceFrase = 0;
            await pipeline.cargarFrase(0);
            
            if (this.core) {
                this.core.irAModulo('study');
            }
            
            setTimeout(() => {
                this._cerrandoLibro = false;
            }, 300);
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
                const resultado = await vigiaGenerator.generarFrases(
                    idioma,
                    5,
                    nivel,
                    'Generado desde Libro'
                );

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
                <div style="
                    background: linear-gradient(135deg, var(--primary)06, var(--secondary)06);
                    border-radius: 14px;
                    padding: 16px 20px;
                    margin-bottom: 16px;
                    border: 2px solid var(--primary)20;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                ">
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 28px;">🧠</span>
                            <div>
                                <h3 style="font-size: 18px; font-weight: 700; color: var(--dark); margin: 0;">
                                    Frases Generadas
                                    <span style="font-size: 13px; font-weight: 400; color: var(--gray);">(${frases.length} nuevas)</span>
                                </h3>
                                <p style="font-size: 12px; color: var(--gray); margin: 2px 0 0;">
                                    ${nombreIdioma} · Nivel ${this._obtenerNivelRealUsuario()} · Fiabilidad: ${fiabilidad.fiabilidad}%
                                    ${!hasTraduccion ? ' · ⏳ Traducción pendiente' : ''}
                                    ${esJeroglifico ? ' · 🀄 Jeroglífico' : ' · 🔤 Alfabético'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="btn-success" onclick="window.UIStudy._guardarTodasFrasesGeneradas()" 
                                style="padding: 8px 20px; font-size: 13px; background: linear-gradient(135deg, #00B894, #55EFC4); color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s;"
                                onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 20px rgba(0,184,148,0.3)'" 
                                onmouseout="this.style.transform='none'; this.style.boxShadow='none'">
                            <i class="fas fa-save"></i> Guardar Todas
                        </button>
                        <button class="btn-secondary" onclick="window.UIStudy._cerrarModalFrasesGeneradas()" 
                                style="padding: 8px 20px; font-size: 13px; background: var(--bg); border: 1px solid var(--light); border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-times"></i> Cerrar
                        </button>
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
                if (esJeroglifico) {
                    transcripcionMostrar = f.pinyinCompleto || '';
                } else {
                    transcripcionMostrar = f.transcripcion || '';
                }
                
                html += `
                    <div style="
                        background: var(--white);
                        border-radius: 12px;
                        padding: 16px 20px;
                        margin-bottom: 12px;
                        border: 2px solid ${estaGuardada ? 'var(--success)' : estaTraducida ? 'var(--secondary)' : 'var(--light)'};
                        box-shadow: ${estaGuardada ? '0 4px 20px rgba(0,184,148,0.15)' : 'var(--shadow)'};
                        transition: all 0.3s ease;
                        position: relative;
                    ">
                        ${estaGuardada ? `
                            <div style="position: absolute; top: -8px; right: 16px; background: var(--success); color: white; padding: 2px 14px; border-radius: 12px; font-size: 10px; font-weight: 600;">
                                ✅ Guardada
                            </div>
                        ` : ''}
                        
                        <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 8px;">
                            <div style="flex: 1; min-width: 200px;">
                                <div style="font-size: 20px; font-weight: 700; color: var(--dark);">
                                    ${f.original}
                                </div>
                                ${transcripcionMostrar ? `
                                    <div style="font-size: 14px; color: ${esJeroglifico ? 'var(--primary)' : 'var(--secondary)'}; margin-top: 2px; letter-spacing: 1px; font-weight: 500;">
                                        ${esJeroglifico ? '🔊' : '🎤'} ${transcripcionMostrar}
                                    </div>
                                ` : `
                                    <div style="font-size: 12px; color: var(--danger); margin-top: 2px;">
                                        ⚠️ ${esJeroglifico ? 'Sin pinyin' : 'Sin transcripción fonética'}
                                    </div>
                                `}
                                <div style="font-size: 15px; color: var(--gray); margin-top: 4px;">
                                    ${tieneTraduccion ? `→ ${f.traduccion}` : estaTraducida ? `→ ${f.traduccion || 'Traducción obtenida'}` : '⏳ Traducción pendiente'}
                                </div>
                                ${f.reglaGramatical && !f.reglaGramatical.startsWith('[') ? `
                                    <div style="font-size: 11px; color: var(--primary); margin-top: 4px; padding: 2px 10px; background: var(--primary)08; border-radius: 4px; display: inline-block;">
                                        📋 ${f.reglaGramatical}
                                    </div>
                                ` : ''}
                            </div>
                            <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                                ${!tieneTraduccion && !estaTraducida ? `
                                    <button class="btn-secondary" onclick="window.UIStudy._traducirFraseGenerada(${idx})" 
                                            style="padding: 6px 14px; font-size: 11px; background: linear-gradient(135deg, #6C5CE7, #A29BFE); color: white; border: none; border-radius: 6px; cursor: pointer; transition: all 0.3s;"
                                            onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'"
                                            ${this._traduciendoFrase ? 'disabled' : ''}>
                                        <i class="fas fa-language"></i> Traducir con Groq
                                    </button>
                                ` : ''}
                                ${!estaGuardada ? `
                                    <button class="btn-success" onclick="window.UIStudy._guardarFraseGenerada(${idx})" 
                                            style="padding: 6px 14px; font-size: 11px; background: linear-gradient(135deg, #00B894, #55EFC4); color: white; border: none; border-radius: 6px; cursor: pointer; transition: all 0.3s;"
                                            onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'"
                                            ${!tieneTraduccion && !estaTraducida ? 'disabled title="Traduce la frase primero"' : ''}>
                                        <i class="fas fa-save"></i> Guardar
                                    </button>
                                ` : ''}
                                <span style="font-size: 10px; color: var(--gray-light);">
                                    ${i + 1}/${frases.length}
                                </span>
                            </div>
                        </div>
                        
                        ${estaTraducida && !tieneTraduccion ? `
                            <div style="margin-top: 8px; font-size: 11px; color: var(--success); background: var(--success)08; padding: 4px 12px; border-radius: 6px; display: inline-block;">
                                ✅ Traducido con Groq
                            </div>
                        ` : ''}
                    </div>
                `;
            }

            const totalGuardadas = Object.values(this._frasesGuardadas).filter(v => v).length;
            const totalTraducidas = Object.values(this._frasesTraducidas).filter(v => v).length;
            html += `
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid var(--light);
                    font-size: 12px;
                    color: var(--gray-light);
                    flex-wrap: wrap;
                    gap: 8px;
                ">
                    <div>
                        <span>📊 ${frases.length} frases generadas</span>
                        <span style="margin-left: 12px;">✅ ${totalGuardadas} guardadas</span>
                        <span style="margin-left: 12px;">🔄 ${totalTraducidas} traducidas</span>
                        <span style="margin-left: 12px;">${esJeroglifico ? '🀄' : '🔤'} ${totalTraducidas > 0 ? 'Con pinyin/transcripción' : 'Sin transcripción'}</span>
                    </div>
                    <div>
                        <span style="font-size: 10px; color: var(--gray-light);">
                            💡 Traduce cada frase para obtener también su ${esJeroglifico ? 'pinyin' : 'transcripción fonética'}
                        </span>
                    </div>
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
                        container.style.cssText = `
                            max-height: 70vh;
                            overflow-y: auto;
                            padding: 4px 8px;
                        `;
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
            if (!frase) {
                this.core?.mostrarToast('❌ Frase no encontrada', 'error');
                return;
            }

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
                if (!window.vigia || !window.vigia.enLinea) {
                    throw new Error('Vigía no está conectado. Conéctate para traducir.');
                }

                let prompt = `
Eres un traductor experto en el idioma ${idioma}.

Traduce la siguiente frase del ${idioma} al ${idiomaNativo}:

FRASE: "${frase.original}"

REGLAS:
1. La traducción debe ser NATURAL y COTIDIANA en ${idiomaNativo}.
2. Mantén el significado exacto de la frase.
3. No añadas explicaciones, solo la traducción.
4. Responde SOLO con la traducción, sin comillas ni texto adicional.
`;

                let pinyinObtenido = '';
                if (esJeroglifico) {
                    prompt = `
Eres un experto en el idioma ${idioma} y en su sistema fonético.

Traduce la siguiente frase del ${idioma} al ${idiomaNativo} y proporciona su PINYIN con tonos:

FRASE: "${frase.original}"

Responde SOLO en formato JSON:
{
    "traduccion": "traducción_natural_al_${idiomaNativo}",
    "pinyin": "pinyin_con_tonos_de_la_frase_completa"
}`;
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
                } else {
                    throw new Error('No se pudo obtener la traducción');
                }

            } catch (error) {
                console.error('❌ Error traduciendo:', error);
                this.core?.mostrarToast(`❌ Error: ${error.message}`, 'error');
            } finally {
                this._traduciendoFrase = false;
            }
        }

        // ============================================================
        // GUARDAR FRASE GENERADA INDIVIDUAL
        // ============================================================

        async _guardarFraseGenerada(idx) {
            const frase = this._frasesGeneradas[idx];
            if (!frase) {
                this.core?.mostrarToast('❌ Frase no encontrada', 'error');
                return;
            }

            if (this._frasesGuardadas[idx]) {
                this.core?.mostrarToast('ℹ️ Esta frase ya está guardada', 'info');
                return;
            }

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
                const existe = frasesExistentes.some(f => 
                    f.original === frase.original && f.idioma === idioma
                );

                if (existe) {
                    this.core?.mostrarToast('ℹ️ Esta frase ya existe en la base de datos', 'info');
                    this._frasesGuardadas[idx] = true;
                    this._actualizarModalFrasesGeneradas();
                    return;
                }

                const fraseObj = {
                    original: frase.original,
                    traduccion: frase.traduccion,
                    idioma: idioma,
                    nivel: nivel,
                    esJeroglifico: esJeroglifico,
                    pinyinCompleto: frase.pinyinCompleto || '',
                    transcripcion: frase.transcripcion || '',
                    reglaGramatical: frase.reglaGramatical || null,
                    explicacionGramatical: frase.explicacionGramatical || null,
                    tipoRegla: frase.tipoRegla || null,
                    familiaSemantica: 'Generadas por IA',
                    palabras: [],
                    activa: true,
                    rg: 0,
                    rcn: 0,
                    neuroData: {
                        exposiciones: 0,
                        aciertosConsecutivos: 0,
                        fallosConsecutivos: 0,
                        nivelConfianza: 0.5,
                        ultimaActivacion: Date.now(),
                        consolidacion: 0
                    }
                };

                const id = await db.guardarFrase(fraseObj);
                
                if (id) {
                    this._frasesGuardadas[idx] = true;
                    this.core?.mostrarToast(`✅ Frase "${frase.original}" guardada correctamente`, 'success');
                    
                    if (window.gestorFavoritos) {
                        await window.gestorFavoritos.añadirFrase(id);
                        const nivelNombre = `📚 Nivel ${nivel}`;
                        await window.gestorFavoritos.añadirFraseAGrupo(id, nivelNombre);
                        await window.gestorFavoritos.añadirFraseAGrupo(id, '🧠 Generadas por IA');
                    }
                    
                    this._actualizarModalFrasesGeneradas();
                    
                    if (window.UIDashboard) {
                        window.UIDashboard._cargarDashboardInicial(this.core);
                    }
                } else {
                    throw new Error('No se pudo guardar la frase');
                }

            } catch (error) {
                console.error('❌ Error guardando frase:', error);
                this.core?.mostrarToast(`❌ Error: ${error.message}`, 'error');
            }
        }

        // ============================================================
        // GUARDAR TODAS LAS FRASES GENERADAS
        // ============================================================

        async _guardarTodasFrasesGeneradas() {
            let guardadas = 0;
            let yaExistentes = 0;
            let sinTraduccion = 0;
            
            const frases = this._frasesGeneradas;
            
            for (let i = 0; i < frases.length; i++) {
                const frase = frases[i];
                
                if (!frase.traduccion || frase.traduccion.trim() === '') {
                    sinTraduccion++;
                    continue;
                }
                
                if (this._frasesGuardadas[i]) {
                    yaExistentes++;
                    continue;
                }
                
                await this._guardarFraseGenerada(i);
                guardadas++;
            }
            
            this.core?.mostrarToast(
                `✅ ${guardadas} frases guardadas${sinTraduccion > 0 ? `, ${sinTraduccion} sin traducción` : ''}${yaExistentes > 0 ? `, ${yaExistentes} ya existentes` : ''}`,
                'success'
            );
            
            this._actualizarModalFrasesGeneradas();
        }

        // ============================================================
        // ACTUALIZAR MODAL DE FRASES GENERADAS
        // ============================================================

        _actualizarModalFrasesGeneradas() {
            this._mostrarModalFrasesGeneradas(
                this._frasesGeneradas,
                { fiabilidad: 70, nivelConfianza: '🟢 Bueno' }
            );
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
    }

    // ============================================================
    // INSTANCIA GLOBAL
    // ============================================================

    window.UIStudy = new UIStudy();
    console.log('✅ UIStudy v20.8 - CORREGIDO: FINALIZACIÓN DE TEMA AL 100%');
    console.log('  🔥 Detección de progreso del tema usando pipeline.frases');
    console.log('  🔥 Verificación ANTES de renderizar la siguiente frase');
    console.log('  🎯 Finalización automática y navegación a Temas');
    console.log('  ✅ Marcado de tema como completado con _marcarTemaCompletado');
    console.log('  🔄 Posibilidad de desmarcar y reestudiar');
    console.log('  📊 Pantalla de finalización con estadísticas');
    console.log('  📚 Checkbox de historias leídas preservado');
})();