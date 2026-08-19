// ============================================================
// PIPELINE v18.7 - COMPLETO CON ORIGEN DE HISTORIA PARA FLUJOS DIFERENCIADOS
// ============================================================

class Pipeline {
    constructor() {
        this.fases = [
            { id: 1, nombre: 'Neuroexposición', icono: '🧠' },
            { id: 2, nombre: 'Codificación', icono: '📝' },
            { id: 3, nombre: 'Consolidación', icono: '🔗' },
            { id: 4, nombre: 'SRS Neuroadaptativo', icono: '🔄' },
            { id: 5, nombre: 'Recuperación Activa', icono: '💪' },
            { id: 6, nombre: 'Integración', icono: '🧩' },
            { id: 7, nombre: 'Automatización', icono: '⚡' }
        ];
        this.faseActual = 1;
        this.turnosEnFase = 0;
        this.maxTurnosPorFase = 25;
        this.frases = [];
        this.indiceFrase = 0;
        this.fraseActual = null;
        this.modoSimplificado = false;
        this.frustracion = { palabraFallos: {}, faseFallos: 0 };
        this.inicioMostrado = false;
        this.idiomaObjetivo = 'es';
        this.nivel = 'B1';
        this.temaActual = null;
        this._ultimaEvaluacion = 0;
        this._frasesCompletadasDesdeUltimaEvaluacion = 0;
        this._idiomaActual = null;
        this._recargando = false;
        this._estudiandoTema = false;
        this._temaActual = null;
        this._temaOriginalFrases = null;
        this._temaOriginalIndice = 0;
        this._historiaActual = null;
        this._estudiandoHistoria = false;
        this._historiaIdActual = null;
        this._temaIdDesdeHistoria = null;
        
        // 🔥 NUEVAS PROPIEDADES PARA RASTREAR ORIGEN DE HISTORIA
        this._origenHistoria = null; // 'elipse' | 'tema' | 'importada'
        this._callbackRetorno = null;
        
        this.neuroParams = {
            consolidacionRate: 0.05,
            thresholdConsolidacion: 0.7,
            intervaloBase: 3600000,
            factorEspaciado: 2.5,
            maxIntervalo: 604800000,
            refuerzoPositivo: 0.3,
            refuerzoNegativo: -0.2,
            limiteMemoriaTrabajo: 7,
            fatigaPorTurno: 0.02,
            dopaminaBase: 1.0,
            recompensaCorrecto: 0.5,
            penalizacionFallo: -0.3
        };
        
        this.estadoNeuro = {
            rcn: 0,
            rg: 0,
            consolidacion: 0,
            eficiencia: 1,
            fatiga: 0,
            momentoOptimo: Date.now()
        };

        this._actualizandoUI = false;
        this._initDone = false;
        this._cargandoFrases = false;
        this._reanudando = false;
        this._palabrasCache = {};
    }

    async init() {
        if (this._initDone) return this;
        
        try {
            if (window.gestorIdiomas && window.gestorIdiomas.idiomaActivo) {
                this.idiomaObjetivo = window.gestorIdiomas.idiomaActivo;
                const info = window.gestorIdiomas.getInfoActivo();
                if (info) this.nivel = info.nivel;
                this._idiomaActual = this.idiomaObjetivo;
            } else {
                const usuario = await db.getUsuario();
                if (usuario) {
                    this.idiomaObjetivo = usuario.idiomasObjetivo?.[0]?.idioma || 'es';
                    this.nivel = usuario.idiomasObjetivo?.[0]?.nivel || 'B1';
                    this._idiomaActual = this.idiomaObjetivo;
                }
            }
            
            await this.cargarFrasesPorIdioma(this.idiomaObjetivo);
            await this.cargarProgreso();
            
            this._initDone = true;
            console.log('🧠 Pipeline Neuroadaptativo v18.7: Iniciado');
            console.log(`   Idioma: ${this.idiomaObjetivo}, Nivel: ${this.nivel}`);
            console.log(`   📚 ${this.frases.length} frases cargadas`);
            console.log(`   🔥 Carga de palabras desglosadas: ACTIVADA`);
            console.log(`   🔥 Origen de historias: ACTIVADO`);
        } catch (e) {
            console.warn('⚠️ Pipeline init parcial:', e);
            this._initDone = true;
        }
        
        return this;
    }

    // ============================================================
    // RECARGAR PARA IDIOMA CON REANUDACIÓN
    // ============================================================
    
    async recargarParaIdioma(idioma) {
        if (this._recargando) {
            console.log('⏳ Ya está recargando, esperando...');
            return this;
        }
        
        this._recargando = true;
        console.log(`🔄 Recargando pipeline para idioma: ${idioma}`);
        
        try {
            if (this.idiomaObjetivo && this.idiomaObjetivo !== idioma) {
                console.log(`💾 Guardando estado del idioma anterior: ${this.idiomaObjetivo}`);
                try {
                    const stats = await db.obtenerEstadisticasNeuro(this.idiomaObjetivo);
                    if (window.gestorIdiomas) {
                        const info = window.gestorIdiomas.getInfoIdioma(this.idiomaObjetivo);
                        if (info) {
                            info.progreso = stats.progreso || 0;
                            info.frasesCompletadas = stats.progreso || 0;
                            info.totalFrases = stats.totalFrases || 0;
                            info.rcnPromedio = stats.rcnPromedio || 0;
                            info.eficiencia = stats.eficiencia || 0;
                            info.neuroScore = stats.neuroScore || 0;
                            localStorage.setItem('pipeline_idiomas', JSON.stringify(window.gestorIdiomas.idiomas));
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Error guardando estado del idioma anterior:', e);
                }
            }
            
            this.idiomaObjetivo = idioma;
            this._idiomaActual = idioma;
            
            if (window.gestorIdiomas) {
                const info = window.gestorIdiomas.getInfoIdioma(idioma);
                if (info) {
                    this.nivel = info.nivel;
                }
            }
            
            await this.cargarFrasesPorIdioma(idioma);
            await this.cargarProgreso();
            
            await this._cargarPuntoDeReanudacion();
            
            console.log(`📚 ${this.frases?.length || 0} frases cargadas para "${idioma}"`);
            
        } catch (e) {
            console.error(`❌ Error recargando pipeline para "${idioma}":`, e);
        } finally {
            this._recargando = false;
        }
        
        return this;
    }

    // ============================================================
    // CARGAR PUNTO DE REANUDACIÓN
    // ============================================================

    async _cargarPuntoDeReanudacion() {
        if (this.frases.length === 0) {
            this.fraseActual = null;
            if (window.UIStudy) {
                window.UIStudy.mostrarPantallaInicio();
            }
            return;
        }

        this._reanudando = true;
        const ahora = Date.now();
        
        const frasesPendientes = this.frases.filter(f => 
            f.progreso && f.progreso.proximoRepaso && f.progreso.proximoRepaso < ahora
        );
        
        if (frasesPendientes.length > 0) {
            frasesPendientes.sort((a, b) => (a.progreso.proximoRepaso || 0) - (b.progreso.proximoRepaso || 0));
            const indice = this.frases.indexOf(frasesPendientes[0]);
            console.log(`📌 Repaso pendiente: frase ${indice + 1}/${this.frases.length} (RCN: ${frasesPendientes[0].progreso?.rcn || 0})`);
            await this.cargarFrase(indice);
            this._reanudando = false;
            return;
        }
        
        const ultimoIndice = await db.obtenerUltimoIndiceEstudio(this.idiomaObjetivo);
        if (ultimoIndice && ultimoIndice.indice !== undefined && ultimoIndice.indice < this.frases.length) {
            let indiceCargar = ultimoIndice.indice;
            let fraseCandidata = this.frases[indiceCargar];
            
            if (fraseCandidata && fraseCandidata.progreso && fraseCandidata.progreso.rcn >= 4.5) {
                let encontrada = false;
                for (let i = indiceCargar + 1; i < this.frases.length; i++) {
                    const f = this.frases[i];
                    if (!f.progreso || f.progreso.rcn < 4.5) {
                        indiceCargar = i;
                        encontrada = true;
                        break;
                    }
                }
                if (!encontrada) {
                    for (let i = 0; i < indiceCargar; i++) {
                        const f = this.frases[i];
                        if (!f.progreso || f.progreso.rcn < 4.5) {
                            indiceCargar = i;
                            encontrada = true;
                            break;
                        }
                    }
                }
                if (!encontrada) {
                    indiceCargar = 0;
                }
            }
            
            console.log(`📌 Reanudando en: frase ${indiceCargar + 1}/${this.frases.length} (RCN: ${this.frases[indiceCargar]?.progreso?.rcn || 0})`);
            await this.cargarFrase(indiceCargar);
            this._reanudando = false;
            return;
        }
        
        for (let i = 0; i < this.frases.length; i++) {
            const f = this.frases[i];
            if (!f.progreso || f.progreso.rcn < 4.5) {
                console.log(`📌 Empezando desde la primera frase no dominada: ${i + 1}/${this.frases.length}`);
                await this.cargarFrase(i);
                this._reanudando = false;
                return;
            }
        }
        
        console.log(`📌 Todas las frases están dominadas. Cargando la primera.`);
        await this.cargarFrase(0);
        this._reanudando = false;
    }

    // ============================================================
    // CARGAR FRASES POR IDIOMA
    // ============================================================
    
    async cargarFrasesPorIdioma(idioma) {
        if (this._cargandoFrases) return;
        this._cargandoFrases = true;
        
        try {
            this.idiomaObjetivo = idioma || this.idiomaObjetivo;
            this._idiomaActual = this.idiomaObjetivo;
            
            const todas = await db.obtenerFrasesPorIdioma(this.idiomaObjetivo);
            this.frases = todas.filter(f => f.activa !== false);
            
            // CARGAR PALABRAS DESGLOSADAS
            for (const f of this.frases) {
                if (f.palabras && Array.isArray(f.palabras) && f.palabras.length > 0) {
                    for (let i = 0; i < f.palabras.length; i++) {
                        const p = f.palabras[i];
                        if (p && typeof p === 'object' && p.id && typeof p.id === 'number') {
                            try {
                                const palabraCompleta = await db.get('palabras', p.id);
                                if (palabraCompleta) {
                                    f.palabras[i] = { ...palabraCompleta };
                                }
                            } catch (e) {}
                        }
                    }
                } else if (f.historiaId) {
                    try {
                        const frasesHistoria = await db.obtenerFrasesPorHistoria(f.historiaId);
                        const fraseHistoria = frasesHistoria.find(fh => fh.id === f.id);
                        if (fraseHistoria && fraseHistoria.palabras && Array.isArray(fraseHistoria.palabras) && fraseHistoria.palabras.length > 0) {
                            f.palabras = fraseHistoria.palabras;
                        }
                    } catch (e) {}
                }
            }
            
            this.frases.sort((a, b) => {
                const rcnA = a.progreso?.rcn || 0;
                const rcnB = b.progreso?.rcn || 0;
                return rcnA - rcnB;
            });
            
            console.log(`📚 ${this.frases.length} frases cargadas para ${this.idiomaObjetivo}`);
            console.log(`   📝 Frases con palabras desglosadas: ${this.frases.filter(f => f.palabras && f.palabras.length > 0).length}`);
            
        } catch (e) {
            console.warn('⚠️ Error cargando frases por idioma:', e);
            this.frases = [];
        } finally {
            this._cargandoFrases = false;
        }
    }

    async cargarFrases() {
        await this.cargarFrasesPorIdioma(this.idiomaObjetivo);
    }

    async cargarProgreso() {
        try {
            const progresos = await db.obtenerProgresoPorIdioma(this.idiomaObjetivo);
            for (const prog of progresos) {
                const frase = this.frases.find(f => f.id === prog.fraseId);
                if (frase) frase.progreso = prog;
            }
        } catch (e) {
            console.warn('⚠️ Error cargando progreso:', e);
        }
    }

    // ============================================================
    // CARGAR FRASE ACTUAL CON PALABRAS DESGLOSADAS
    // ============================================================
    
    async cargarFrase(indice) {
        if (this.frases.length === 0) {
            this.fraseActual = null;
            return;
        }

        if (indice < 0) indice = this.frases.length - 1;
        if (indice >= this.frases.length) indice = 0;

        this.indiceFrase = indice;
        this.fraseActual = this.frases[indice];

        if (!this.fraseActual) return;

        try {
            let progreso = await db.obtenerProgreso(this.fraseActual.id);
            
            if (!progreso) {
                progreso = {
                    fraseId: this.fraseActual.id,
                    fase: 1,
                    rcn: 0,
                    rg: 0,
                    ultimoRepaso: Date.now(),
                    proximoRepaso: Date.now() + this.neuroParams.intervaloBase,
                    estado: 'en_curso',
                    repasosExitosos: 0,
                    repasosFallidos: 0,
                    intervaloActual: this.neuroParams.intervaloBase,
                    fechaCreacion: Date.now(),
                    idioma: this.idiomaObjetivo,
                    neuroMetrics: {
                        historialRCN: [],
                        historialIntervalos: [],
                        curvaOlvido: [],
                        eficiencia: 1,
                        fatigaCognitiva: 0,
                        momentoOptimo: Date.now(),
                        ultimaVentanaRepaso: Date.now()
                    }
                };
                await db.guardarProgreso(progreso);
            }

            this.fraseActual.progreso = progreso;
            this.faseActual = progreso.fase || 1;
            this.estadoNeuro.rcn = progreso.rcn || 0;
            this.estadoNeuro.rg = progreso.rg || 0;
            
            await this._cargarHistoriaCompletaContexto();
            
            if (!this.fraseActual.palabras || this.fraseActual.palabras.length === 0) {
                if (this._historiaActual && this._historiaActual.frases) {
                    const historiaFrase = this._historiaActual.frases.find(f => f.id === this.fraseActual.id);
                    if (historiaFrase && historiaFrase.palabras && historiaFrase.palabras.length > 0) {
                        this.fraseActual.palabras = historiaFrase.palabras;
                        console.log(`📝 Palabras cargadas desde historia: ${this.fraseActual.palabras.length}`);
                    }
                }
                
                if (!this.fraseActual.palabras || this.fraseActual.palabras.length === 0) {
                    try {
                        const frasesDB = await db.obtenerFrases();
                        const fraseDB = frasesDB.find(f => f.id === this.fraseActual.id);
                        if (fraseDB && fraseDB.palabras && Array.isArray(fraseDB.palabras) && fraseDB.palabras.length > 0) {
                            this.fraseActual.palabras = fraseDB.palabras;
                            console.log(`📝 Palabras cargadas desde DB: ${this.fraseActual.palabras.length}`);
                        }
                    } catch (e) {}
                }
            }
            
            this.mostrarFrase();
            
        } catch (e) {
            console.warn('⚠️ Error cargando frase:', e);
        }
    }

    // ============================================================
    // CARGAR HISTORIA COMPLETA PARA CONTEXTO
    // ============================================================

    async _cargarHistoriaCompletaContexto() {
        if (!this.fraseActual) return;
        
        try {
            const historiaData = await this.obtenerHistoriaCompletaDeFrase(this.fraseActual.id);
            if (historiaData) {
                this._historiaActual = historiaData;
                this.fraseActual._historiaCompleta = historiaData;
            } else {
                this._historiaActual = null;
                this.fraseActual._historiaCompleta = null;
            }
        } catch (e) {
            console.warn('⚠️ Error cargando historia completa:', e);
            this._historiaActual = null;
        }
    }

    // ============================================================
    // OBTENER HISTORIA COMPLETA DE UNA FRASE
    // ============================================================

    async obtenerHistoriaCompletaDeFrase(fraseId) {
        try {
            if (!fraseId || typeof fraseId !== 'number' || fraseId <= 0) {
                console.warn('⚠️ ID de frase inválido:', fraseId);
                return null;
            }

            const frase = await db.get('frases', fraseId);
            if (!frase) {
                console.warn('⚠️ Frase no encontrada:', fraseId);
                return null;
            }

            if (!frase.historiaId) {
                console.warn('⚠️ Frase sin historiaId:', fraseId);
                return null;
            }

            const historia = await db.get('historias', frase.historiaId);
            if (!historia) {
                console.warn('⚠️ Historia no encontrada:', frase.historiaId);
                return null;
            }

            const todasLasFrases = await db.obtenerFrasesPorHistoria(frase.historiaId);
            
            const frasesCompletas = [];
            for (const f of todasLasFrases) {
                const palabras = [];
                
                if (f.palabras && Array.isArray(f.palabras)) {
                    for (const p of f.palabras) {
                        let palabraObj = null;
                        
                        if (p && typeof p === 'object' && p.id && typeof p.id === 'number') {
                            try {
                                palabraObj = await db.get('palabras', p.id);
                            } catch (e) {}
                            if (!palabraObj) {
                                palabraObj = p;
                            }
                        }
                        else if (typeof p === 'number' && p > 0) {
                            try {
                                palabraObj = await db.get('palabras', p);
                            } catch (e) {}
                        }
                        else if (typeof p === 'string') {
                            const numId = parseInt(p);
                            if (!isNaN(numId) && numId > 0) {
                                try {
                                    palabraObj = await db.get('palabras', numId);
                                } catch (e) {}
                            }
                            if (!palabraObj) {
                                const todasPalabras = await db.obtenerPalabrasPorIdioma(f.idioma || this.idiomaObjetivo);
                                palabraObj = todasPalabras.find(w => 
                                    (w.palabra || w.hanzi || '') === p
                                );
                            }
                        }
                        else if (p && typeof p === 'object') {
                            palabraObj = p;
                        }
                        
                        if (palabraObj) {
                            if (!palabraObj.palabra && palabraObj.hanzi) {
                                palabraObj.palabra = palabraObj.hanzi;
                            }
                            if (!palabraObj.hanzi && palabraObj.palabra) {
                                palabraObj.hanzi = palabraObj.palabra;
                            }
                            palabras.push(palabraObj);
                        }
                    }
                }

                frasesCompletas.push({
                    ...f,
                    palabras: palabras,
                    transcripcion: f.transcripcion || '',
                    pinyinCompleto: f.pinyinCompleto || '',
                    segmentacion: f.segmentacion || null
                });
            }

            return {
                id: historia.id,
                titulo: historia.titulo || 'Historia sin título',
                frases: frasesCompletas,
                temaId: historia.temaId || null,
                nivel: historia.nivel || 'A1',
                idioma: historia.idioma || 'es'
            };
        } catch (error) {
            console.error('❌ Error obteniendo historia completa:', error);
            return null;
        }
    }

    // ============================================================
    // MOSTRAR FRASE CON MODO INVERSO Y PALABRAS DESGLOSADAS
    // ============================================================
    
    mostrarFrase() {
        const container = document.getElementById('cardContainer');
        if (!container) return;

        try {
            if (!this.frases || this.frases.length === 0 || !this.fraseActual) {
                if (window.UIStudy) {
                    window.UIStudy.mostrarPantallaInicio();
                }
                return;
            }

            const frase = this.fraseActual;
            const fase = this.fases.find(f => f.id === this.faseActual);
            const esJeroglifico = frase.esJeroglifico || false;
            const rcn = this.fraseActual.progreso?.rcn || 0;
            const semaforo = this._getSemaforo(rcn);
            const consolidacion = this._calcularConsolidacion(this.fraseActual);
            
            let modoData = { mostrar: frase.original, ocultar: frase.traduccion, esInverso: false };
            if (window.modoInverso) {
                modoData = window.modoInverso.getFraseParaEstudio(frase);
            }
            
            let html = `<div class="card">`;
            html += `<div class="card-badge">
                ${fase ? fase.icono + ' ' + fase.nombre : 'Fase ' + this.faseActual}
                ${this.modoSimplificado ? ' ⚡' : ''}
            </div>`;

            const isModoInverso = window.modoInverso && window.modoInverso.isActivo();
            if (isModoInverso) {
                html += `<div style="text-align:center;font-size:11px;color:var(--secondary);margin-bottom:8px;padding:4px 12px;background:var(--secondary)15;border-radius:12px;border:1px solid var(--secondary)30;">
                    🔄 Modo Inverso: ${window.modoInverso.getTooltip()}
                </div>`;
            }

            if (esJeroglifico && frase.segmentacion && isModoInverso) {
                html += `<div style="font-size:18px;color:var(--gray);margin-bottom:8px;">${modoData.mostrar}</div>`;
                html += `<div style="font-size:20px;font-weight:600;color:var(--primary);padding:12px;background:var(--primary)08;border-radius:8px;border:2px dashed var(--primary);">
                    ✍️ Escribe en ${frase.idioma || this.idiomaObjetivo}
                </div>`;
            } else if (esJeroglifico && frase.segmentacion) {
                html += `<div class="card-hanzi">${frase.segmentacion.hanzi || frase.original}</div>`;
                if (frase.segmentacion.pinyin) {
                    html += `<div class="card-pinyin">${frase.segmentacion.pinyin}</div>`;
                }
                html += `<div style="font-size:14px;color:var(--gray-light);margin-top:4px;">${modoData.ocultar}</div>`;
            } else {
                html += `<div class="card-hanzi" style="font-size:24px;">${modoData.mostrar}</div>`;
                html += `<div class="card-traduccion">${modoData.ocultar}</div>`;
            }

            // PALABRAS DESGLOSADAS
            const palabrasParaMostrar = this.fraseActual.palabras || [];
            if (palabrasParaMostrar && palabrasParaMostrar.length > 0) {
                html += this._renderPalabrasDesglosadas(palabrasParaMostrar, frase);
            }

            html += `<div class="card-progress">
                <span>RCN: ${rcn.toFixed(1)} ${semaforo}</span>
                <span>•</span>
                <span>🧠 ${Math.round(consolidacion * 100)}%</span>
                <span>•</span>
                <span>${this.turnosEnFase}/${this.maxTurnosPorFase}</span>
            </div>`;

            html += `<div style="margin-top:12px;height:4px;background:var(--light-gray);border-radius:2px;overflow:hidden;">
                <div style="height:100%;width:${consolidacion * 100}%;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:2px;transition:width 0.5s ease;"></div>
            </div>`;

            html += `</div>`;
            container.innerHTML = html;

            const counter = document.getElementById('cardCounter');
            if (counter) counter.textContent = `${this.indiceFrase + 1} / ${this.frases.length}`;

            this._actualizarProgresoGlobal();
            
        } catch (e) {
            console.warn('⚠️ Error mostrando frase:', e);
            container.innerHTML = `
                <div class="card" style="max-width:500px;padding:40px 30px;text-align:center;">
                    <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                    <p style="color:var(--gray);">Error al cargar la frase</p>
                    <button class="btn-secondary" onclick="pipeline.cargarFrases()" style="margin-top:12px;">
                        <i class="fas fa-refresh"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }

    // ============================================================
    // RENDERIZAR PALABRAS DESGLOSADAS
    // ============================================================

    _renderPalabrasDesglosadas(palabras, frase) {
        if (!palabras || palabras.length === 0) return '';
        
        const esJeroglifico = frase?.esJeroglifico || false;
        let html = '<div style="padding:12px 0;border-top:2px solid var(--bg);margin-top:8px;">';
        html += '<div style="font-size:12px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">📖 Palabras desglosadas</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
        
        for (const p of palabras) {
            const texto = p.hanzi || p.palabra || '';
            if (!texto) continue;
            
            const pinyin = p.pinyin || '';
            const familia = p.familia || (p.familias && p.familias[0]) || 'sin_clasificar';
            const significado = p.significado || '';
            const color = window.uiCore ? window.uiCore._getColorFamilia(familia) : '#6C5CE7';
            
            html += `<span style="display:inline-flex;flex-direction:column;align-items:center;padding:4px 12px;border-radius:12px;background:${color}15;border:1px solid ${color}30;cursor:pointer;" onclick="window.uiCore.mostrarToast('${texto}: ${significado || 'Sin definición'}\\nFamilia: ${familia}${pinyin ? '\\nPinyin: ' + pinyin : ''}', 'info')">`;
            html += `<span style="font-weight:600;color:${color};font-size:16px;">${texto}</span>`;
            if (pinyin && esJeroglifico) {
                html += `<span style="font-size:10px;color:var(--gray);">${pinyin}</span>`;
            }
            if (significado) {
                html += `<span style="font-size:10px;color:var(--gray);">${significado.substring(0, 12)}</span>`;
            }
            html += '</span>';
        }
        
        html += '</div></div>';
        return html;
    }

    _getSemaforo(rcn) {
        if (rcn <= 0) return '🔴';
        if (rcn < 3) return '🟡';
        if (rcn < 4) return '🟢';
        return '🟣';
    }

    _calcularConsolidacion(frase) {
        const progreso = frase.progreso;
        if (!progreso) return 0;
        const rcn = progreso.rcn || 0;
        const repasos = (progreso.repasosExitosos || 0) + (progreso.repasosFallidos || 0);
        const tiempo = Date.now() - (progreso.fechaCreacion || Date.now());
        let consolidacion = Math.min(1, rcn / 5);
        consolidacion += Math.min(0.3, repasos / 20);
        consolidacion += Math.min(0.2, tiempo / (7 * 86400000));
        return Math.min(1, consolidacion);
    }

    _actualizarProgresoGlobal() {
        const progress = document.getElementById('progressFill');
        if (progress && this.frases.length > 0) {
            const completadas = this.frases.filter(f => 
                f.progreso?.estado === 'completada' || (f.progreso?.rcn || 0) >= 4
            ).length;
            const pct = Math.round((completadas / this.frases.length) * 100);
            progress.style.width = pct + '%';
            
            const label = document.getElementById('progressLabel');
            if (label) label.textContent = pct + '%';
        }
    }

    // ============================================================
    // ESTUDIAR POR TEMA
    // ============================================================
    
    async estudiarTema(temaId) {
        let temaIdReal = temaId;
        if (typeof temaId === 'string' && temaId.match(/^[a-cA-C][1-2]_\d+$/)) {
            console.log(`🔍 Buscando tema predefinido: ${temaId}`);
            const temas = await db.obtenerTemas();
            const temaEncontrado = temas.find(t => 
                t._temaOriginalId === temaId || t._temaOriginalId === temaId.toLowerCase()
            );
            if (temaEncontrado) {
                temaIdReal = temaEncontrado.id;
                console.log(`📌 Tema predefinido encontrado: "${temaEncontrado.nombre}" (ID: ${temaIdReal})`);
            } else {
                console.warn(`⚠️ Tema predefinido ${temaId} no encontrado en DB, intentando como ID numérico...`);
            }
        }
        
        if (typeof temaIdReal === 'string' && !isNaN(parseInt(temaIdReal))) {
            temaIdReal = parseInt(temaIdReal);
        }
        
        if (typeof temaIdReal === 'string') {
            console.log(`🔍 Buscando tema por nombre: ${temaIdReal}`);
            const temas = await db.obtenerTemas();
            const temaEncontrado = temas.find(t => 
                t.nombre && t.nombre.toLowerCase().includes(temaIdReal.toLowerCase())
            );
            if (temaEncontrado) {
                temaIdReal = temaEncontrado.id;
                console.log(`📌 Tema encontrado por nombre: "${temaEncontrado.nombre}" (ID: ${temaIdReal})`);
            } else {
                console.error(`❌ No se encontró el tema: ${temaId}`);
                if (window.uiCore) {
                    window.uiCore.mostrarToast(`❌ Tema no encontrado: ${temaId}`, 'error');
                }
                return;
            }
        }
        
        console.log(`📚 Estudiando tema ID: ${temaIdReal}`);
        
        const historias = await db.obtenerHistoriasPorTema(temaIdReal);
        if (historias.length === 0) {
            if (window.uiCore) {
                window.uiCore.mostrarToast('❌ No hay historias en este tema', 'error');
            }
            return;
        }
        
        let todasFrases = [];
        for (const h of historias) {
            const frases = await db.obtenerFrasesPorHistoria(h.id);
            todasFrases = todasFrases.concat(frases);
        }
        
        if (todasFrases.length === 0) {
            if (window.uiCore) {
                window.uiCore.mostrarToast('❌ No hay frases en este tema', 'error');
            }
            return;
        }
        
        this._temaActual = temaIdReal;
        this._estudiandoTema = true;
        this._estudiandoHistoria = false;
        this._historiaIdActual = null;
        this._temaIdDesdeHistoria = null;
        this._temaOriginalFrases = [...this.frases];
        this._temaOriginalIndice = this.indiceFrase;
        
        this.frases = todasFrases;
        await this.cargarProgreso();
        
        for (const f of this.frases) {
            if (!f.palabras || f.palabras.length === 0) {
                try {
                    const frasesDB = await db.obtenerFrases();
                    const fraseDB = frasesDB.find(fdb => fdb.id === f.id);
                    if (fraseDB && fraseDB.palabras && Array.isArray(fraseDB.palabras) && fraseDB.palabras.length > 0) {
                        f.palabras = fraseDB.palabras;
                    }
                } catch (e) {}
            }
        }
        
        this.frases.sort((a, b) => {
            const rcnA = a.progreso?.rcn || 0;
            const rcnB = b.progreso?.rcn || 0;
            return rcnA - rcnB;
        });
        
        let indiceReanudacion = 0;
        for (let i = 0; i < this.frases.length; i++) {
            const f = this.frases[i];
            const rcn = f.progreso?.rcn || 0;
            if (rcn < 4.5) {
                indiceReanudacion = i;
                break;
            }
        }
        if (indiceReanudacion >= this.frases.length) {
            indiceReanudacion = 0;
        }
        
        console.log(`📌 Estudiando tema "${temaIdReal}" - ${this.frases.length} frases`);
        console.log(`📌 Reanudando en índice: ${indiceReanudacion + 1}/${this.frases.length}`);
        console.log(`📝 Frases con palabras desglosadas: ${this.frases.filter(f => f.palabras && f.palabras.length > 0).length}`);
        
        this.indiceFrase = indiceReanudacion;
        await this.cargarFrase(indiceReanudacion);
        await db.guardarUltimoIndiceEstudio(this.idiomaObjetivo, indiceReanudacion);
        
        if (window.uiCore) {
            window.uiCore.irAModulo('study');
            const progreso = await this.obtenerProgresoTema();
            window.uiCore.mostrarToast(`📖 Estudiando tema: ${this.frases.length} frases (Progreso: ${progreso}%)`, 'success');
        }
    }

    async obtenerProgresoTema() {
        if (this.frases.length === 0) return 0;
        const completadas = this.frases.filter(f => 
            f.progreso?.estado === 'completada' || (f.progreso?.rcn || 0) >= 4
        ).length;
        return Math.round((completadas / this.frases.length) * 100);
    }

    // ============================================================
    // 🔥 ESTUDIAR HISTORIA CON ORIGEN - CORREGIDO
    // ============================================================

    async estudiarHistoria(historiaId, origen = 'tema') {
        const frases = await db.obtenerFrasesPorHistoria(historiaId);
        if (frases.length === 0) {
            if (window.uiCore) {
                window.uiCore.mostrarToast('❌ No hay frases en esta historia', 'error');
            }
            return;
        }
        
        const historia = await db.get('historias', historiaId);
        if (historia && historia.temaId) {
            this._temaActual = historia.temaId;
            this._temaIdDesdeHistoria = historia.temaId;
            this._estudiandoTema = true;
            console.log(`📌 Historia "${historia.titulo}" pertenece al tema ${historia.temaId}`);
        } else {
            this._temaActual = null;
            this._temaIdDesdeHistoria = null;
            this._estudiandoTema = false;
            console.warn('⚠️ La historia no tiene tema asociado');
        }
        
        // 🔥 ESTABLECER ORIGEN DE LA HISTORIA
        this._origenHistoria = origen;
        this._historiaIdActual = historiaId;
        this._estudiandoHistoria = true;
        
        this._temaOriginalFrases = [...this.frases];
        this._temaOriginalIndice = this.indiceFrase;
        
        this.frases = frases;
        await this.cargarProgreso();
        
        // CARGAR PALABRAS DESGLOSADAS
        for (const f of this.frases) {
            if (!f.palabras || f.palabras.length === 0) {
                try {
                    const frasesDB = await db.obtenerFrases();
                    const fraseDB = frasesDB.find(fdb => fdb.id === f.id);
                    if (fraseDB && fraseDB.palabras && Array.isArray(fraseDB.palabras) && fraseDB.palabras.length > 0) {
                        f.palabras = fraseDB.palabras;
                    }
                } catch (e) {}
            }
        }
        
        this.frases.sort((a, b) => {
            const rcnA = a.progreso?.rcn || 0;
            const rcnB = b.progreso?.rcn || 0;
            return rcnA - rcnB;
        });
        
        let indiceReanudacion = 0;
        for (let i = 0; i < this.frases.length; i++) {
            const f = this.frases[i];
            const rcn = f.progreso?.rcn || 0;
            if (rcn < 4.5) {
                indiceReanudacion = i;
                break;
            }
        }
        if (indiceReanudacion >= this.frases.length) indiceReanudacion = 0;
        
        this.indiceFrase = indiceReanudacion;
        await this.cargarFrase(indiceReanudacion);
        await db.guardarUltimoIndiceEstudio(this.idiomaObjetivo, indiceReanudacion);
        
        if (window.uiCore) {
            window.uiCore.irAModulo('study');
            window.uiCore.mostrarToast(`📖 Estudiando historia: ${frases.length} frases`, 'success');
        }
    }

    // ============================================================
    // 🔥 OBTENER ORIGEN DE LA HISTORIA ACTUAL
    // ============================================================

    getOrigenHistoriaActual() {
        return this._origenHistoria;
    }

    getHistoriaIdActual() {
        return this._historiaIdActual;
    }

    estaEstudiandoHistoria() {
        return this._estudiandoHistoria;
    }

    // ============================================================
    // 🔥 SALIR DE HISTORIA (CON RETORNO ADECUADO)
    // ============================================================

    async salirDeHistoria() {
        console.log('🔙 Saliendo de la historia...');
        
        if (this._temaOriginalFrases) {
            this.frases = this._temaOriginalFrases;
            this.indiceFrase = this._temaOriginalIndice || 0;
            this._estudiandoHistoria = false;
            this._historiaIdActual = null;
            this._origenHistoria = null;
            this._temaOriginalFrases = null;
            this._temaOriginalIndice = 0;
            await this.cargarFrase(this.indiceFrase);
        } else {
            const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
            await this.cargarFrasesPorIdioma(idioma);
            await this.cargarProgreso();
            if (this.frases.length > 0) {
                await this.cargarFrase(0);
            }
        }
        
        if (window.uiCore) {
            window.uiCore.irAModulo('study');
            window.uiCore.mostrarToast('🔄 Has salido de la historia.', 'info');
        }
    }

    // ============================================================
    // VOLVER AL ESTUDIO GENERAL
    // ============================================================

    async volverAlEstudioGeneral() {
        if (!this._estudiandoTema || !this._temaOriginalFrases) {
            console.log('ℹ️ No hay tema activo para volver');
            return;
        }
        
        console.log('🔄 Volviendo al estudio general...');
        this.frases = this._temaOriginalFrases;
        this.indiceFrase = this._temaOriginalIndice || 0;
        this._estudiandoTema = false;
        this._temaActual = null;
        this._estudiandoHistoria = false;
        this._historiaIdActual = null;
        this._temaIdDesdeHistoria = null;
        this._temaOriginalFrases = null;
        this._temaOriginalIndice = 0;
        
        await this.cargarProgreso();
        await this.cargarFrase(this.indiceFrase);
        
        if (window.uiCore) {
            window.uiCore.mostrarToast('🔄 Volviendo al estudio general', 'info');
            window.uiCore.irAModulo('study');
        }
    }

    // ============================================================
    // VALIDACIÓN Y PISTAS
    // ============================================================
    
    validarRespuestaEscrita(respuestaUsuario) {
        if (!this.fraseActual) return { correcto: false, mensaje: 'No hay frase activa' };
        
        let correcta;
        let esInverso = false;
        
        if (window.modoInverso && window.modoInverso.isActivo()) {
            correcta = this.fraseActual.original;
            esInverso = true;
        } else {
            correcta = this.fraseActual.traduccion || '';
        }
        
        const respuesta = respuestaUsuario.trim().toLowerCase();
        const correctaNormalizada = correcta.trim().toLowerCase();
        
        const similitud = this._calcularSimilitudTexto(respuesta, correctaNormalizada);
        
        let resultado = {
            correcto: false,
            parcial: false,
            mensaje: '',
            similitud: similitud,
            correctaEsperada: correcta,
            esInverso: esInverso
        };
        
        if (respuesta === correctaNormalizada) {
            resultado.correcto = true;
            resultado.mensaje = '✅ ¡Perfecto! Respuesta correcta.';
        } else if (similitud > 0.8) {
            resultado.parcial = true;
            resultado.mensaje = '🟡 Muy cerca. Revisa pequeños detalles.';
        } else if (similitud > 0.5) {
            resultado.parcial = true;
            resultado.mensaje = '🟡 Aproximado, pero puedes mejorar.';
        } else {
            resultado.mensaje = '❌ Respuesta incorrecta. La respuesta correcta es: ' + correcta;
        }
        
        return resultado;
    }

    _calcularSimilitudTexto(a, b) {
        if (!a || !b) return 0;
        const palabrasA = a.split(' ');
        const palabrasB = b.split(' ');
        const comunes = palabrasA.filter(p => palabrasB.includes(p));
        return comunes.length / Math.max(palabrasA.length, palabrasB.length);
    }

    async generarPista() {
        if (!this.fraseActual) return 'No hay frase activa.';
        
        try {
            if (window.modoInverso && window.modoInverso.isActivo()) {
                const pista = window.modoInverso.getPista(this.fraseActual);
                return pista;
            }
            
            if (vigia && vigia.enLinea) {
                const frase = this.fraseActual;
                const esJeroglifico = frase.esJeroglifico || false;
                
                let prompt = `Da una pista sutil (sin dar la traducción directa) para ayudar al usuario a recordar el significado de esta frase en ${this.idiomaObjetivo || 'el idioma objetivo'}:
                
Frase original: ${frase.original}
Nivel: ${this.nivel || 'B1'}
Palabras clave: ${frase.palabras?.map(p => p.palabra || p.hanzi).join(', ') || 'ninguna'}
${esJeroglifico ? 'Pinyin de la frase: ' + (frase.pinyinCompleto || frase.segmentacion?.pinyin || '') : ''}
                
La pista debe ser breve (máx 15 palabras) y en español.`;
                
                const pista = await vigia._consultarGroq(prompt, 'text');
                return pista || '💡 Piensa en el contexto de la frase.';
            }
            return '💡 Intenta recordar el contexto de la frase.';
        } catch (e) {
            return '💡 Intenta recordar el contexto de la frase.';
        }
    }

    async generarOpcionesMultiples() {
        if (!this.fraseActual) return [];
        
        let correcta;
        if (window.modoInverso && window.modoInverso.isActivo()) {
            correcta = this.fraseActual.original;
        } else {
            correcta = this.fraseActual.traduccion || '';
        }
        
        const opciones = [correcta];
        
        const otrasFrases = this.frases.filter(f => f.id !== this.fraseActual.id);
        const shuffled = otrasFrases.sort(() => Math.random() - 0.5);
        
        for (const f of shuffled) {
            let texto;
            if (window.modoInverso && window.modoInverso.isActivo()) {
                texto = f.original;
            } else {
                texto = f.traduccion;
            }
            if (texto && !opciones.includes(texto) && opciones.length < 4) {
                opciones.push(texto);
            }
        }
        
        while (opciones.length < 4) {
            const genericas = ['No sé', 'Quizás', 'Tal vez', 'Podría ser'];
            const random = genericas[Math.floor(Math.random() * genericas.length)];
            if (!opciones.includes(random)) {
                opciones.push(random);
            }
        }
        
        return opciones.sort(() => Math.random() - 0.5);
    }

    obtenerPalabrasPorFamilia(familia) {
        if (!this.frases || this.frases.length === 0) return [];
        
        const palabrasSet = new Set();
        for (const frase of this.frases) {
            if (frase.palabras && Array.isArray(frase.palabras)) {
                for (const p of frase.palabras) {
                    const f = p.familia || p.familias?.[0] || '';
                    if (f === familia || f.includes(familia)) {
                        palabrasSet.add(p.palabra || p.hanzi);
                    }
                }
            }
        }
        return Array.from(palabrasSet);
    }

    // ============================================================
    // PROCESAR RESPUESTA
    // ============================================================
    
    async procesarRespuesta(tipo) {
        if (!this.fraseActual || this.frases.length === 0) return;

        const progreso = this.fraseActual.progreso;
        let cambioRCN = 0;

        switch (tipo) {
            case 'correcto': 
                cambioRCN = 1.0 + this.neuroParams.refuerzoPositivo * (1 - Math.random() * 0.2);
                progreso.repasosExitosos = (progreso.repasosExitosos || 0) + 1;
                break;
            case 'parcial': 
                cambioRCN = 0.2 + Math.random() * 0.2;
                progreso.repasosExitosos = (progreso.repasosExitosos || 0) + 0.5;
                break;
            case 'duda': 
                cambioRCN = -0.1 - Math.random() * 0.15;
                progreso.repasosFallidos = (progreso.repasosFallidos || 0) + 1;
                break;
            case 'fallo': 
                cambioRCN = -0.4 - Math.random() * 0.1;
                progreso.repasosFallidos = (progreso.repasosFallidos || 0) + 1;
                break;
            default: return;
        }

        progreso.rcn = Math.max(-1, Math.min(5, (progreso.rcn || 0) + cambioRCN));
        progreso.ultimoRepaso = Date.now();
        this.estadoNeuro.rcn = progreso.rcn;

        const intervalos = this._calcularIntervaloOptimo(progreso);
        progreso.proximoRepaso = Date.now() + intervalos;
        progreso.intervaloActual = intervalos;
        
        if (progreso.rcn >= 4 && this.faseActual < 7) {
            this.faseActual++;
        } else if (progreso.rcn < 0 && this.faseActual > 1) {
            this.faseActual--;
        }

        if (progreso.rcn >= 4) {
            progreso.estado = 'completada';
            this._frasesCompletadasDesdeUltimaEvaluacion++;
        }

        progreso.fase = this.faseActual;
        progreso.idioma = this.idiomaObjetivo;
        await db.guardarProgreso(progreso);
        this.fraseActual.progreso = progreso;

        this.turnosEnFase++;
        this._avanzarSiguienteFrase();
        if (vigia && vigia.escanear) vigia.escanear();
    }

    _calcularIntervaloOptimo(progreso) {
        const rcn = progreso.rcn || 0;
        const repasos = (progreso.repasosExitosos || 0) + (progreso.repasosFallidos || 0);
        let intervalo = this.neuroParams.intervaloBase * (1 + rcn * 0.5);
        intervalo *= Math.pow(this.neuroParams.factorEspaciado, repasos / 3);
        intervalo = Math.min(this.neuroParams.maxIntervalo, intervalo);
        intervalo = Math.max(this.neuroParams.intervaloBase / 2, intervalo);
        const ruido = 1 + (Math.random() - 0.5) * 0.2;
        intervalo *= ruido;
        return Math.round(intervalo);
    }

    _avanzarSiguienteFrase() {
        const frasesEnCurso = this.frases.filter(f => 
            f.progreso?.estado !== 'completada'
        );
        
        if (frasesEnCurso.length === 0) {
            this.indiceFrase = (this.indiceFrase + 1) % this.frases.length;
        } else {
            frasesEnCurso.sort((a, b) => (a.progreso?.rcn || 0) - (b.progreso?.rcn || 0));
            const idx = frasesEnCurso.findIndex(f => f.id === this.fraseActual.id);
            if (idx >= 0 && idx < frasesEnCurso.length - 1) {
                this.indiceFrase = this.frases.indexOf(frasesEnCurso[idx + 1]);
            } else {
                this.indiceFrase = this.frases.indexOf(frasesEnCurso[0]);
            }
        }
        
        this.cargarFrase(this.indiceFrase);
        this._guardarIndiceEstudio();
        
        const completadas = this.frases.filter(f => 
            f.progreso?.estado === 'completada' || (f.progreso?.rcn || 0) >= 4
        ).length;
        
        const tiempoDesdeUltimaEval = Date.now() - this._ultimaEvaluacion;
        if (completadas % 10 === 0 && completadas > 0 && 
            this._frasesCompletadasDesdeUltimaEvaluacion >= 10 &&
            tiempoDesdeUltimaEval > 60000) {
            try {
                const usuario = db.getUsuario ? db.getUsuario() : null;
                if (usuario && usuario.id) {
                    const idioma = this.idiomaObjetivo || 'es';
                    console.log('📊 Evaluando nivel automático...');
                    gestorNiveles.evaluarNivelAutomatico(usuario.id, idioma);
                    this._frasesCompletadasDesdeUltimaEvaluacion = 0;
                    this._ultimaEvaluacion = Date.now();
                }
            } catch (e) {
                console.warn('⚠️ Error evaluando nivel:', e);
            }
        }
    }

    // ============================================================
    // GUARDAR ÍNDICE DE ESTUDIO
    // ============================================================

    async _guardarIndiceEstudio() {
        if (this.indiceFrase !== undefined && this.idiomaObjetivo) {
            await db.guardarUltimoIndiceEstudio(this.idiomaObjetivo, this.indiceFrase);
        }
    }

    async reiniciarFase() {
        if (!this.fraseActual) return;
        const progreso = this.fraseActual.progreso;
        progreso.rcn = 0;
        progreso.fase = 1;
        progreso.estado = 'en_curso';
        progreso.repasosExitosos = 0;
        progreso.repasosFallidos = 0;
        progreso.intervaloActual = this.neuroParams.intervaloBase;
        progreso.idioma = this.idiomaObjetivo;
        await db.guardarProgreso(progreso);
        this.faseActual = 1;
        this.turnosEnFase = 0;
        this.modoSimplificado = false;
        this.frustracion = { palabraFallos: {}, faseFallos: 0 };
        await this.cargarFrase(this.indiceFrase);
        if (window.uiCore) {
            window.uiCore.mostrarToast('🔄 Fase reiniciada', 'warning');
        }
    }

    toggleModoSimplificado() {
        this.modoSimplificado = !this.modoSimplificado;
        if (this.modoSimplificado) {
            this.faseActual = Math.min(3, this.faseActual);
            if (window.uiCore) {
                window.uiCore.mostrarToast('⚡ Modo Simplificado activado', 'warning');
            }
        } else {
            if (window.uiCore) {
                window.uiCore.mostrarToast('📚 Modo Normal activado', 'info');
            }
        }
        this.mostrarFrase();
        
        const status = document.getElementById('toolSimplifiedStatus');
        if (status) status.textContent = this.modoSimplificado ? 'Activo' : 'Inactivo';
    }

    getEstado() {
        const total = this.frases.length;
        const completadas = this.frases.filter(f =>
            f.progreso?.estado === 'completada' || (f.progreso?.rcn || 0) >= 4
        ).length;
        return {
            faseActual: this.faseActual,
            totalFrases: total,
            completadas,
            progreso: total > 0 ? Math.round((completadas / total) * 100) : 0,
            modoSimplificado: this.modoSimplificado,
            rcn: this.estadoNeuro.rcn,
            rg: this.estadoNeuro.rg,
            consolidacion: this.fraseActual ? this._calcularConsolidacion(this.fraseActual) : 0,
            idioma: this.idiomaObjetivo,
            nivel: this.nivel,
            temaActual: this._temaActual,
            estudiandoTema: this._estudiandoTema,
            estudiandoHistoria: this._estudiandoHistoria,
            historiaIdActual: this._historiaIdActual,
            origenHistoria: this._origenHistoria,
            frasesConPalabras: this.frases.filter(f => f.palabras && f.palabras.length > 0).length
        };
    }

    async obtenerDiagnosticoNeuro() {
        try {
            const frases = await db.obtenerFrasesPorIdioma(this.idiomaObjetivo);
            const progresos = await db.obtenerProgresoPorIdioma(this.idiomaObjetivo);
            const rcnTotal = progresos.reduce((acc, p) => acc + (p.rcn || 0), 0);
            const rcnPromedio = progresos.length > 0 ? rcnTotal / progresos.length : 0;
            const exitosos = progresos.reduce((acc, p) => acc + (p.repasosExitosos || 0), 0);
            const fallidos = progresos.reduce((acc, p) => acc + (p.repasosFallidos || 0), 0);
            const totalRepasos = exitosos + fallidos;
            const eficiencia = totalRepasos > 0 ? exitosos / totalRepasos : 0;
            
            const frasesConPalabras = frases.filter(f => f.palabras && f.palabras.length > 0).length;
            
            return {
                frasesActivas: frases.filter(f => f.activa !== false).length,
                progresosActivos: progresos.filter(p => p.estado !== 'completada').length,
                rcnPromedio: Math.round(rcnPromedio * 10) / 10,
                eficiencia: Math.round(eficiencia * 100),
                fasePromedio: progresos.reduce((acc, p) => acc + (p.fase || 1), 0) / (progresos.length || 1),
                neuroScore: Math.min(100, Math.round((rcnPromedio / 4) * 100)),
                frasesConPalabras: frasesConPalabras
            };
        } catch (e) {
            return { frasesActivas: 0, progresosActivos: 0, rcnPromedio: 0, eficiencia: 0, fasePromedio: 1, neuroScore: 0, frasesConPalabras: 0 };
        }
    }

    anterior() {
        if (this.frases.length === 0) return;
        this.indiceFrase = (this.indiceFrase - 1 + this.frases.length) % this.frases.length;
        this.cargarFrase(this.indiceFrase);
        this._guardarIndiceEstudio();
    }

    siguiente() {
        if (this.frases.length === 0) return;
        this._avanzarSiguienteFrase();
    }

    async recargarParaIdiomaLegacy(idioma) {
        console.log(`🔄 Recargando pipeline para idioma (legacy): ${idioma}`);
        return this.recargarParaIdioma(idioma);
    }

    async salirDelTema() {
        if (this._estudiandoTema && this._temaOriginalFrases) {
            await this.volverAlEstudioGeneral();
        } else {
            console.log('ℹ️ No hay tema activo');
            if (window.uiCore) {
                window.uiCore.mostrarToast('ℹ️ No hay tema activo para salir', 'info');
            }
        }
    }

    getHistoriaActual() {
        return this._historiaActual;
    }

    getFrasesDeHistoriaActual() {
        return this._historiaActual?.frases || [];
    }

    getTituloHistoriaActual() {
        return this._historiaActual?.titulo || 'Historia sin título';
    }

    // ============================================================
    // OBTENER PROGRESO POR HISTORIA (PARA MODO ELIPSE)
    // ============================================================

    async obtenerProgresoHistoria(historiaId) {
        try {
            const frases = await db.obtenerFrasesPorHistoria(historiaId);
            let totalFrases = frases.length;
            let completadas = 0;
            let totalRCN = 0;
            let totalRepasos = 0;
            let exitosos = 0;
            let fallidos = 0;
            
            let frasesConPalabras = 0;

            for (const f of frases) {
                const progreso = await db.obtenerProgreso(f.id);
                if (progreso) {
                    if (progreso.estado === 'completada' || (progreso.rcn || 0) >= 4) {
                        completadas++;
                    }
                    totalRCN += progreso.rcn || 0;
                    totalRepasos += (progreso.repasosExitosos || 0) + (progreso.repasosFallidos || 0);
                    exitosos += progreso.repasosExitosos || 0;
                    fallidos += progreso.repasosFallidos || 0;
                }
                
                if (f.palabras && f.palabras.length > 0) {
                    frasesConPalabras++;
                }
            }

            return {
                historiaId,
                totalFrases,
                completadas,
                rcnPromedio: totalFrases > 0 ? totalRCN / totalFrases : 0,
                progreso: totalFrases > 0 ? Math.round((completadas / totalFrases) * 100) : 0,
                repasosTotales: totalRepasos,
                eficiencia: totalRepasos > 0 ? Math.round((exitosos / totalRepasos) * 100) : 0,
                completada: totalFrases > 0 && completadas === totalFrases,
                frasesConPalabras: frasesConPalabras
            };
        } catch (error) {
            console.error('❌ Error obteniendo progreso de historia:', error);
            return {
                historiaId,
                totalFrases: 0,
                completadas: 0,
                rcnPromedio: 0,
                progreso: 0,
                repasosTotales: 0,
                eficiencia: 0,
                completada: false,
                frasesConPalabras: 0
            };
        }
    }
}

const pipeline = new Pipeline();

console.log('✅ Pipeline v18.7 - COMPLETO CON ORIGEN DE HISTORIA');
console.log('  🔥 estudiarHistoria(historiaId, origen) con origen "elipse" o "tema"');
console.log('  🔥 getOrigenHistoriaActual() para saber el origen');
console.log('  🔥 salirDeHistoria() con retorno adecuado');
console.log('  🔥 Todas las funcionalidades originales preservadas');