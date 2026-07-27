// ============================================================
// UI DASHBOARD v20.3 - COMPLETO CON TARJETA DE FONÉTICA
// ============================================================

class UIDashboard {
    constructor() {
        this._vigiaActivity = 0;
        this._centinelaActivity = 0;
        this._cargando = false;
        this._idiomaActual = null;
        this._renderizadoNeuro = false;
        this._panelExpandido = false;
        this._dashNeuroContainer = null;
        this._tutorBadgeInterval = null;
        this._ultimaActualizacion = 0;
        this._tiempoMinimoActualizacion = 2000;
        this._recargaTimeout = null;
        
        this._IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        this._COLORES_ESTADO = {
            'optimo': '#00B894',
            'fatiga': '#FDCB6E',
            'bajo_rendimiento': '#E17055',
            'estancado': '#E17055',
            'critico': '#FF7675',
            'offline': '#636E72'
        };
        this._ICONOS_ESTADO = {
            'optimo': '✅',
            'fatiga': '🧠',
            'bajo_rendimiento': '📉',
            'estancado': '🔄',
            'critico': '🚨',
            'offline': '🔴'
        };
    }

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

    async init(core) {
        this.core = core || window.uiCore;
        
        const eventosRecarga = [
            'idiomaCambiado', 'favoritoActualizado', 'cambioNivel',
            'temaCompletado', 'tutorIntervencion', 'learningPathGenerado',
            'learningPathPasoCompletado', 'learningPathCompletado',
            'learningPathPasoCambiado', 'vigiaGramaticalActualizado',
            'actividadActualizada', 'learningPathProgresoActualizado'
        ];
        
        for (const evento of eventosRecarga) {
            window.addEventListener(evento, () => {
                this._programarRecarga();
            });
        }
        
        setTimeout(() => {
            if (!this._renderizadoNeuro) {
                console.log('🔄 Renderizado Neuro forzado por timeout...');
                this._cargarDashboardInicial();
            }
        }, 3000);
        
        setInterval(() => {
            if (document.getElementById('dashboardView')?.classList.contains('active')) {
                this._actualizarSutil();
            }
        }, 5000);
        
        console.log('📊 UIDashboard v20.3: Inicializado');
        return this;
    }

    _programarRecarga() {
        if (this._recargaTimeout) {
            clearTimeout(this._recargaTimeout);
        }
        this._recargaTimeout = setTimeout(() => {
            this._cargarDashboardInicial();
            this._recargaTimeout = null;
        }, 300);
    }

    cargar(core) {
        this.core = core || this.core;
        this._cargarDashboardInicial();
    }

    async _cargarDashboardInicial() {
        if (this._cargando) return;
        if (Date.now() - this._ultimaActualizacion < this._tiempoMinimoActualizacion) {
            console.log('⏳ Actualización muy reciente, saltando...');
            return;
        }
        
        this._cargando = true;
        this._ultimaActualizacion = Date.now();
        
        try {
            console.log('📊 Cargando Dashboard v20.3...');
            
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            this._idiomaActual = idiomaActivo;
            const esJeroglifico = this._esJeroglifico(idiomaActivo);
            
            const stats = await db.obtenerEstadisticasNeuro(idiomaActivo);
            const estado = pipeline.getEstado ? pipeline.getEstado() : { progreso: 0, faseActual: 1, rcn: 0 };
            const usuario = await db.getUsuario();
            const temas = await db.obtenerTemasPorIdioma(idiomaActivo);
            const progreso = await db.obtenerTodoProgreso();
            const racha = await this._calcularRacha(progreso);
            
            let ruta = [];
            let pasoActual = null;
            let progresoRuta = { completados: 0, total: 0, porcentaje: 0 };
            let pasosConEstado = [];
            
            if (window.LearningPath) {
                if (!window.LearningPath._initDone) {
                    await window.LearningPath.init(this.core);
                }
                ruta = window.LearningPath.getRutaCompleta();
                pasoActual = window.LearningPath.getPasoActual();
                progresoRuta = window.LearningPath.getProgreso();
                pasosConEstado = window.LearningPath.getPasosConEstado ? 
                    window.LearningPath.getPasosConEstado() : [];
                
                if (ruta.length === 0) {
                    await window.LearningPath.generarRuta();
                    ruta = window.LearningPath.getRutaCompleta();
                    pasoActual = window.LearningPath.getPasoActual();
                    progresoRuta = window.LearningPath.getProgreso();
                    pasosConEstado = window.LearningPath.getPasosConEstado ? 
                        window.LearningPath.getPasosConEstado() : [];
                }
            }
            
            let tutorInfo = null;
            let tutorModo = 'flexible';
            let siguienteTema = null;
            let mapaProgreso = 0;
            let intervenciones = [];
            let tieneIntervenciones = false;
            
            if (window.tutorNeuro) {
                tutorInfo = window.tutorNeuro.getModoInfo();
                tutorModo = window.tutorNeuro.getModo();
                siguienteTema = window.tutorNeuro.getSiguienteTema();
                mapaProgreso = window.tutorNeuro._mapaAprendizaje?.progresoGeneral || 0;
                intervenciones = window.tutorNeuro.getIntervencionesPendientes();
                tieneIntervenciones = intervenciones.length > 0;
            }
            
            const neuroEstado = await this._calcularEstadoNeuro();
            const estadoCognitivo = this._determinarEstadoCognitivo(neuroEstado);
            
            this._actualizarTarjetaStudy(stats);
            this._actualizarTarjetaGrammar(stats);
            this._actualizarTarjetaTemas(temas);
            this._actualizarTarjetaVigia();
            this._actualizarTarjetaEspacio();
            this._actualizarHeaderStats(estado);
            
            if (esJeroglifico) {
                this._actualizarTarjetaCaracteres();
            } else {
                this._ocultarTarjetaCaracteres();
            }
            
            await this._renderizarTarjetaNeuro(stats, usuario, neuroEstado, racha);
            
            await this._renderizarTutorUnificado(
                ruta, pasoActual, progresoRuta, pasosConEstado,
                tutorInfo, tutorModo, siguienteTema, mapaProgreso,
                intervenciones, tieneIntervenciones, idiomaActivo,
                stats, estado, usuario, racha, neuroEstado
            );
            
            this._renderizarTutorNeuroadaptativo(idiomaActivo, esJeroglifico);
            
            // ============================================================
            // 🔥 AÑADIR TARJETA DE FONÉTICA AL GRID
            // ============================================================
            this._renderizarTarjetaFonetica(idiomaActivo);
            
            this._actualizarBadgeTutor();
            this._actualizarActividad(this.core);
            
            this._renderizadoNeuro = true;
            console.log(`✅ Dashboard v20.3 cargado para: ${idiomaActivo}`);
            
        } catch (error) {
            console.error('❌ Error cargando dashboard:', error);
        } finally {
            this._cargando = false;
        }
    }

    // ============================================================
    // 🔥 TARJETA DE FONÉTICA
    // ============================================================

    _renderizarTarjetaFonetica(idiomaActivo) {
        const grid = document.getElementById('dashboardGrid');
        if (!grid) return;

        const existing = grid.querySelector('.dash-card[data-module="fonetica"]');
        if (existing) existing.remove();

        const esJeroglifico = this._esJeroglifico(idiomaActivo);
        const nombreIdioma = this._getNombreIdioma(idiomaActivo);

        const tarjeta = document.createElement('div');
        tarjeta.className = 'dash-card';
        tarjeta.dataset.module = 'fonetica';
        tarjeta.style.cssText = `
            border: 2px solid var(--secondary);
            background: linear-gradient(135deg, var(--secondary)05, var(--primary)05);
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 12px;
            padding: 16px 18px;
            box-shadow: var(--shadow);
        `;
        tarjeta.onclick = () => {
            if (window.uiCore) {
                window.uiCore.irAModulo('fonetica');
            }
        };
        tarjeta.onmouseover = function() {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
        };
        tarjeta.onmouseout = function() {
            this.style.transform = 'none';
            this.style.boxShadow = 'var(--shadow)';
        };

        const iconBg = esJeroglifico ? 'linear-gradient(135deg, #6C5CE7, #00CEC9)' : 'linear-gradient(135deg, #00B894, #55EFC4)';
        const icono = esJeroglifico ? 'fa-characters' : 'fa-microphone-alt';

        tarjeta.innerHTML = `
            <div class="dash-card-icon" style="background: ${iconBg};">
                <i class="fas ${icono}"></i>
            </div>
            <div class="dash-card-content">
                <h3>🎤 Fonética</h3>
                <p class="dash-card-meta" id="dashFoneticaMeta">
                    Practica la pronunciación · ${nombreIdioma}
                    ${esJeroglifico ? ' · 🀄 Pinyin' : ' · 🎤 Transcripción'}
                </p>
                <div class="dash-card-progress">
                    <div class="dash-progress-bar">
                        <div class="dash-progress-fill" id="dashFoneticaProgress" style="width:0%;background:linear-gradient(90deg,#00B894,#55EFC4);"></div>
                    </div>
                </div>
                <div style="font-size:10px;color:var(--gray-light);margin-top:2px;">
                    🔊 Mejora tu pronunciación
                </div>
            </div>
            <div class="dash-card-arrow">
                <i class="fas fa-chevron-right"></i>
            </div>
        `;

        const caracteresCard = grid.querySelector('.dash-card[data-module="caracteres"]');
        if (caracteresCard && caracteresCard.parentNode) {
            caracteresCard.parentNode.insertBefore(tarjeta, caracteresCard.nextSibling);
        } else {
            grid.appendChild(tarjeta);
        }

        this._actualizarTarjetaFonetica();
    }

    async _actualizarTarjetaFonetica() {
        try {
            const progress = document.getElementById('dashFoneticaProgress');
            const meta = document.getElementById('dashFoneticaMeta');
            
            if (!progress) return;

            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            const frases = await db.obtenerFrasesPorIdioma(idiomaActivo);
            const palabras = await db.obtenerPalabrasPorIdioma(idiomaActivo);
            
            let conTranscripcion = 0;
            let total = 0;
            
            for (const f of frases) {
                total++;
                if (f.transcripcion || f.pinyinCompleto || f.segmentacion?.pinyin) {
                    conTranscripcion++;
                }
            }
            
            for (const p of palabras) {
                total++;
                if (p.transcripcion || p.pinyin) {
                    conTranscripcion++;
                }
            }
            
            const pct = total > 0 ? Math.round((conTranscripcion / total) * 100) : 0;
            progress.style.width = pct + '%';
            
            if (meta) {
                const nombreIdioma = this._getNombreIdioma(idiomaActivo);
                const esJeroglifico = this._esJeroglifico(idiomaActivo);
                meta.textContent = `${conTranscripcion}/${total} elementos · ${nombreIdioma} ${esJeroglifico ? '· 🀄 Pinyin' : '· 🎤 Transcripción'}`;
            }
        } catch (e) {
            console.warn('⚠️ Error actualizando tarjeta de fonética:', e);
        }
    }

    // ============================================================
    // RENDERIZAR TUTOR NEUROADAPTATIVO
    // ============================================================

    _renderizarTutorNeuroadaptativo(idiomaActivo, esJeroglifico) {
        const dashboardGrid = document.getElementById('dashboardGrid');
        if (!dashboardGrid) return;

        const existing = document.getElementById('tutorNeuroContainer');
        if (existing) existing.remove();

        const nombreIdioma = this._getNombreIdioma(idiomaActivo);
        const nivelActual = this._obtenerNivelUsuario();
        const idiomaNativo = this._obtenerIdiomaNativo();

        const container = document.createElement('div');
        container.id = 'tutorNeuroContainer';
        container.style.cssText = `
            grid-column: 1 / -1;
            margin-top: 20px;
            padding: 20px 24px;
            background: linear-gradient(135deg, var(--primary)04, var(--secondary)04);
            border-radius: 16px;
            border: 2px solid var(--primary)20;
            box-shadow: 0 4px 30px rgba(108,92,231,0.08);
            transition: all 0.3s ease;
        `;

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
                <div>
                    <h3 style="font-size: 18px; font-weight: 700; color: var(--dark); margin: 0;">
                        🧠 Tutor de Aprendizaje Neuroadaptativo
                    </h3>
                    <p style="font-size: 13px; color: var(--gray); margin: 4px 0 0;">
                        Genera contenido personalizado con <strong>metodología neurocognitiva</strong> para potenciar tu aprendizaje
                    </p>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <span style="font-size: 11px; padding: 4px 14px; background: var(--primary)15; color: var(--primary); border-radius: 12px; font-weight: 600;">
                        🎯 ${nivelActual}
                    </span>
                    <span style="font-size: 11px; padding: 4px 14px; background: var(--secondary)15; color: var(--secondary); border-radius: 12px; font-weight: 600;">
                        ${nombreIdioma}
                    </span>
                    <span style="font-size: 11px; padding: 4px 14px; background: var(--bg); color: var(--gray); border-radius: 12px;">
                        🎤 ${this._getNombreIdioma(idiomaNativo)}
                    </span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 12px;">
                <div>
                    <label style="font-size: 13px; font-weight: 600; color: var(--dark); display: block; margin-bottom: 4px;">
                        📝 Tema
                    </label>
                    <input type="text" id="jsonTemaInput" 
                           placeholder="Ej: aventuras en la ciudad, mi familia, viajes..." 
                           style="width: 100%; padding: 10px 14px; border: 2px solid var(--light); border-radius: 10px; font-size: 14px; font-family: var(--font); transition: all 0.3s;"
                           onfocus="this.style.borderColor='var(--primary)'" 
                           onblur="this.style.borderColor='var(--light)'">
                </div>
                <div>
                    <label style="font-size: 13px; font-weight: 600; color: var(--dark); display: block; margin-bottom: 4px;">
                        🔢 Número de historias
                    </label>
                    <input type="number" id="jsonNumInput" value="3" min="1" max="10"
                           style="width: 100%; padding: 10px 14px; border: 2px solid var(--light); border-radius: 10px; font-size: 14px; font-family: var(--font); transition: all 0.3s;"
                           onfocus="this.style.borderColor='var(--primary)'" 
                           onblur="this.style.borderColor='var(--light)'">
                    <span style="font-size: 10px; color: var(--gray-light);">(máx. 10)</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px;">
                <button class="btn-primary" onclick="window.UIJSON.generarJSONDesdeDashboard()" 
                        style="padding: 12px 20px; font-size: 15px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; background: linear-gradient(135deg, #6C5CE7, #A29BFE); color: white; transition: all 0.3s;"
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" 
                        onmouseout="this.style.transform='none'; this.style.boxShadow='none'">
                    <i class="fas fa-magic"></i> Generar
                </button>
                <button class="btn-secondary" onclick="window.UIJSON.generarFamiliaCaracteresDesdeDashboard()" 
                        style="padding: 12px 20px; font-size: 15px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; background: ${esJeroglifico ? 'linear-gradient(135deg, #00CEC9, #81ECEC)' : 'var(--bg)'}; color: ${esJeroglifico ? 'white' : 'var(--gray)'}; transition: all 0.3s; ${!esJeroglifico ? 'opacity:0.6;cursor:not-allowed;' : ''}"
                        ${!esJeroglifico ? 'title="Solo disponible para idiomas jeroglíficos (Chino, Japonés, Coreano)"' : ''}
                        onmouseover="${esJeroglifico ? 'this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 4px 20px rgba(0,206,201,0.3)\'' : ''}" 
                        onmouseout="${esJeroglifico ? 'this.style.transform=\'none\'; this.style.boxShadow=\'none\'' : ''}">
                    <i class="fas fa-characters"></i> Familia de Caracteres
                    ${!esJeroglifico ? ' 🔒' : ''}
                </button>
            </div>

            <div style="margin-bottom: 12px;">
                <label style="font-size: 13px; font-weight: 600; color: var(--dark); display: block; margin-bottom: 4px;">
                    📝 Descripción detallada <span style="font-size: 11px; font-weight: 400; color: var(--gray-light);">(opcional)</span>
                </label>
                <textarea id="jsonDescripcionInput" rows="3" 
                          placeholder="Ej: desde que salgo de casa hasta que llego a la cafetería, todo lo que veo y escucho en el camino..."
                          style="width: 100%; padding: 10px 14px; border: 2px solid var(--light); border-radius: 10px; font-size: 14px; font-family: var(--font); resize: vertical; transition: all 0.3s;"
                          onfocus="this.style.borderColor='var(--primary)'" 
                          onblur="this.style.borderColor='var(--light)'"></textarea>
                <div style="font-size: 11px; color: var(--gray-light); margin-top: 4px;">
                    💡 Añade detalles para que la IA genere historias más ricas y personalizadas.
                </div>
            </div>

            <div style="margin-bottom: 12px;">
                <label style="font-size: 13px; font-weight: 600; color: var(--dark); display: block; margin-bottom: 4px;">
                    📄 Pega aquí el JSON completado por la IA para importarlo a tu...
                </label>
                <div style="display: flex; gap: 10px;">
                    <textarea id="jsonPasteArea" rows="4" 
                              placeholder="Pega aquí el JSON completado por la IA para importarlo a tu Pipeline Neuro..."
                              style="flex: 1; padding: 10px 14px; border: 2px solid var(--light); border-radius: 10px; font-size: 13px; font-family: monospace; resize: vertical; transition: all 0.3s; min-height: 80px;"
                              onfocus="this.style.borderColor='var(--primary)'" 
                              onblur="this.style.borderColor='var(--light)'"></textarea>
                    <button class="btn-success" onclick="window.UIJSON.importarJSONDesdeDashboard()" 
                            style="padding: 12px 24px; font-size: 15px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; background: linear-gradient(135deg, #00B894, #55EFC4); color: white; transition: all 0.3s; align-self: flex-end;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 20px rgba(0,184,148,0.3)'" 
                            onmouseout="this.style.transform='none'; this.style.boxShadow='none'">
                        <i class="fas fa-file-import"></i> Importar
                    </button>
                </div>
            </div>

            <div style="padding: 14px 18px; background: var(--bg); border-radius: 10px; border: 1px solid var(--light);">
                <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; font-size: 12px; color: var(--gray);">
                    <span style="display: flex; align-items: center; gap: 4px;">
                        <span style="font-weight: 600; color: var(--dark);">🧠 Metodología neuroadaptativa:</span>
                    </span>
                    <span style="background: var(--primary)10; padding: 2px 10px; border-radius: 12px; color: var(--primary);">🎯 nivel dificultad</span>
                    <span style="background: var(--secondary)10; padding: 2px 10px; border-radius: 12px; color: var(--secondary);">🏷️ etiquetas temáticas</span>
                    <span style="background: var(--warning)10; padding: 2px 10px; border-radius: 12px; color: var(--warning);">🔑 palabra clave</span>
                    <span style="background: var(--info)10; padding: 2px 10px; border-radius: 12px; color: var(--info);">🔗 conexiones neuro</span>
                    <span style="background: var(--success)10; padding: 2px 10px; border-radius: 12px; color: var(--success);">🎯 objetivos de aprendizaje</span>
                    <span style="background: var(--danger)10; padding: 2px 10px; border-radius: 12px; color: var(--danger);">📝 ejercicios de comprensión</span>
                    <span style="background: var(--primary)10; padding: 2px 10px; border-radius: 12px; color: var(--primary);">📋 reglas gramaticales</span>
                </div>
                <div style="font-size: 11px; color: var(--gray-light); margin-top: 6px;">
                    💡 El Tutor Neuroadaptativo genera contenido optimizado para tu nivel y estilo de aprendizaje
                </div>
            </div>
        `;

        const tutorUnificado = document.getElementById('tutorUnificadoContainer');
        if (tutorUnificado && tutorUnificado.parentNode) {
            tutorUnificado.parentNode.insertBefore(container, tutorUnificado.nextSibling);
        } else {
            dashboardGrid.appendChild(container);
        }
    }

    _obtenerNivelUsuario() {
        try {
            const infoActivo = gestorIdiomas?.getInfoActivo?.();
            if (infoActivo?.nivel) return infoActivo.nivel;
            const usuarioLocal = localStorage.getItem('pipeline_usuario');
            if (usuarioLocal) {
                const parsed = JSON.parse(usuarioLocal);
                const idiomaActivo = gestorIdiomas?.getIdiomaActivo?.() || 'es';
                const idiomaObj = parsed.idiomasObjetivo?.find(i => i.idioma === idiomaActivo);
                if (idiomaObj?.nivel) return idiomaObj.nivel;
                if (parsed.idiomasObjetivo?.length > 0) return parsed.idiomasObjetivo[0].nivel || 'B1';
            }
            return 'B1';
        } catch (e) {
            return 'B1';
        }
    }

    _obtenerIdiomaNativo() {
        try {
            const usuario = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
            return usuario.idiomaNativo || 'español';
        } catch (e) {
            return 'español';
        }
    }

    // ============================================================
    // MÉTODOS EXISTENTES (MANTENIDOS)
    // ============================================================

    _actualizarSutil() {
        try {
            const progressEl = document.getElementById('progressFill');
            if (progressEl && pipeline?.frases?.length > 0) {
                const completadas = pipeline.frases.filter(f => 
                    f.progreso?.estado === 'completada' || (f.progreso?.rcn || 0) >= 4
                ).length;
                const pct = Math.round((completadas / pipeline.frases.length) * 100);
                progressEl.style.width = pct + '%';
                const label = document.getElementById('progressLabel');
                if (label) label.textContent = pct + '%';
            }
            
            const rcnEl = document.getElementById('neuroRCN');
            if (rcnEl && pipeline?.estadoNeuro?.rcn !== undefined) {
                rcnEl.textContent = pipeline.estadoNeuro.rcn.toFixed(1);
            }
            
            if (window.tutorNeuro) {
                const pendientes = window.tutorNeuro.getIntervencionesPendientes();
                const badge = document.getElementById('tutorBadge');
                if (badge) {
                    if (pendientes.length > 0) {
                        badge.classList.add('has-intervencion');
                        badge.innerHTML = `🧠 Tutor (${pendientes.length})`;
                    } else {
                        badge.classList.remove('has-intervencion');
                        badge.innerHTML = '🧠 Tutor';
                    }
                }
            }
        } catch (e) {}
    }

    // ============================================================
    // TARJETAS DEL DASHBOARD
    // ============================================================

    _actualizarTarjetaStudy(stats) {
        const meta = document.getElementById('dashStudyMeta');
        const progress = document.getElementById('dashStudyProgress');
        if (meta) {
            const total = stats.totalFrases || 0;
            const completadas = stats.progreso || 0;
            const pct = total > 0 ? Math.round((completadas / total) * 100) : 0;
            meta.textContent = total + ' frases · ' + pct + '%';
        }
        if (progress) {
            const total = stats.totalFrases || 1;
            const completadas = stats.progreso || 0;
            progress.style.width = Math.min(100, Math.round((completadas / total) * 100)) + '%';
        }
    }

    _actualizarTarjetaGrammar(stats) {
        const meta = document.getElementById('dashGrammarMeta');
        const progress = document.getElementById('dashGrammarProgress');
        let familias = 0;
        try {
            if (window.gramatica && typeof window.gramatica === 'object' && window.gramatica.familias) {
                familias = Object.keys(window.gramatica.familias).length;
            }
        } catch (e) {}
        const palabras = stats.totalPalabras || 0;
        if (meta) meta.textContent = palabras + ' palabras · ' + familias + ' familias';
        if (progress) {
            const pct = Math.min(100, Math.round((stats.neuroScore || 0) * 0.8));
            progress.style.width = pct + '%';
            progress.style.background = 'linear-gradient(90deg, #00CEC9, #81ECEC)';
        }
    }

    _actualizarTarjetaTemas(temas) {
        const meta = document.getElementById('dashTemasMeta');
        const progress = document.getElementById('dashTemasProgress');
        if (meta) {
            const total = temas.length;
            const completados = temas.filter(t => t.estado === 'completado').length;
            meta.textContent = total + ' temas · ' + completados + ' completados';
        }
        if (progress) {
            const total = temas.length || 1;
            const completados = temas.filter(t => t.estado === 'completado').length;
            const pct = Math.round((completados / total) * 100);
            progress.style.width = pct + '%';
            progress.style.background = 'linear-gradient(90deg, #FDCB6E, #F9CA24)';
        }
    }

    _actualizarTarjetaVigia() {
        const meta = document.getElementById('dashVigiaMeta');
        const progress = document.getElementById('dashVigiaProgress');
        const enLinea = window.vigia ? window.vigia.enLinea : false;
        if (meta) meta.textContent = enLinea ? '🟢 Online' : '🔴 Offline';
        if (progress) {
            progress.style.width = enLinea ? '100%' : '0%';
            progress.style.background = enLinea ? 'var(--success)' : 'var(--danger)';
        }
    }

    async _actualizarTarjetaEspacio() {
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const favoritos = await this._contarFavoritosPorIdioma(idioma);
        const meta = document.getElementById('dashEspacioMeta');
        const progress = document.getElementById('dashEspacioProgress');
        if (meta) {
            const total = (favoritos.frases || 0) + (favoritos.palabras || 0);
            meta.textContent = `${favoritos.frases || 0} frases · ${favoritos.palabras || 0} palabras`;
        }
        if (progress) {
            const total = (favoritos.frases || 0) + (favoritos.palabras || 0);
            const pct = Math.min(100, Math.round((total / 100) * 100));
            progress.style.width = pct + '%';
            progress.style.background = 'linear-gradient(90deg, #A29BFE, #6C5CE7)';
        }
    }

    async _contarFavoritosPorIdioma(idioma) {
        try {
            if (!window.gestorFavoritos) return { frases: 0, palabras: 0 };
            await gestorFavoritos.recargar();
            const todasFrases = await gestorFavoritos.obtenerFrasesFavoritas();
            const todasPalabras = await gestorFavoritos.obtenerPalabrasFavoritas();
            const frases = todasFrases.filter(f => f.idioma === idioma);
            const palabras = todasPalabras.filter(p => p.idioma === idioma);
            return { frases: frases.length, palabras: palabras.length };
        } catch (e) {
            return { frases: 0, palabras: 0 };
        }
    }

    _actualizarHeaderStats(estado) {
        const rcnEl = document.getElementById('neuroRCN');
        const progressEl = document.getElementById('neuroProgress');
        const eficienciaEl = document.getElementById('neuroEficiencia');
        const faseEl = document.getElementById('neuroFase');
        const nivelEl = document.getElementById('neuroNivel');
        
        if (rcnEl) {
            const rcn = estado ? estado.rcn : 0;
            rcnEl.textContent = rcn.toFixed(1);
            rcnEl.style.color = rcn >= 4 ? 'var(--success)' : rcn >= 2 ? 'var(--warning)' : 'var(--danger)';
        }
        if (progressEl) progressEl.textContent = (estado ? estado.progreso : 0) + '%';
        if (eficienciaEl) {
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            db.obtenerEstadisticasNeuro(idiomaActivo)
                .then(stats => { if (eficienciaEl) eficienciaEl.textContent = (stats.eficiencia || 0) + '%'; })
                .catch(() => { if (eficienciaEl) eficienciaEl.textContent = '0%'; });
        }
        if (faseEl) faseEl.textContent = estado ? estado.faseActual : 1;
        if (nivelEl) {
            try {
                const infoActivo = window.gestorIdiomas ? window.gestorIdiomas.getInfoActivo() : null;
                nivelEl.textContent = infoActivo?.nivel || 'A1';
            } catch (e) {
                nivelEl.textContent = 'A1';
            }
        }
    }

    async _actualizarTarjetaCaracteres() {
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const familias = await db.obtenerFamiliasCaracteres(idioma);
        const total = familias.length;
        const totalDerivadas = familias.reduce((acc, f) => acc + (f.palabrasDerivadas?.length || 0), 0);
        
        const grid = document.getElementById('dashboardGrid');
        if (!grid) return;
        
        let tarjeta = grid.querySelector('.dash-card[data-module="caracteres"]');
        if (!tarjeta) {
            const tarjetaHTML = `
                <div class="dash-card" data-module="caracteres" onclick="window.uiCore.irACaracteres()" 
                     style="border:2px solid var(--secondary);background:linear-gradient(135deg, var(--secondary)05, var(--primary)05);">
                    <div class="dash-card-icon" style="background:linear-gradient(135deg,#6C5CE7,#00CEC9);">
                        <i class="fas fa-characters"></i>
                    </div>
                    <div class="dash-card-content">
                        <h3>🀄 Caracteres</h3>
                        <p class="dash-card-meta" id="dashCaracteresMeta">${total} familias · ${totalDerivadas} palabras</p>
                        <div class="dash-card-progress">
                            <div class="dash-progress-bar">
                                <div class="dash-progress-fill" id="dashCaracteresProgress" style="width:${Math.min(100, total * 10)}%;background:linear-gradient(90deg,#6C5CE7,#00CEC9);"></div>
                            </div>
                        </div>
                        <div style="font-size:10px;color:var(--gray-light);margin-top:2px;">
                            🧠 Supervisado por Vigía Gramatical
                        </div>
                    </div>
                    <div class="dash-card-arrow">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            `;
            
            const neuroCard = grid.querySelector('#dashNeuroContainer');
            if (neuroCard && neuroCard.parentNode) {
                neuroCard.parentNode.insertBefore(
                    document.createRange().createContextualFragment(tarjetaHTML),
                    neuroCard.nextSibling
                );
            } else {
                grid.insertAdjacentHTML('beforeend', tarjetaHTML);
            }
        }
        
        const meta = document.getElementById('dashCaracteresMeta');
        const progress = document.getElementById('dashCaracteresProgress');
        if (meta) meta.textContent = `${total} familias · ${totalDerivadas} palabras`;
        if (progress) {
            const pct = Math.min(100, total * 10);
            progress.style.width = pct + '%';
        }
        if (tarjeta) tarjeta.style.display = '';
    }

    _ocultarTarjetaCaracteres() {
        const tarjeta = document.querySelector('.dash-card[data-module="caracteres"]');
        if (tarjeta) tarjeta.style.display = 'none';
    }

    // ============================================================
    // RENDERIZAR TUTOR UNIFICADO
    // ============================================================

    async _renderizarTutorUnificado(
        ruta, pasoActual, progresoRuta, pasosConEstado,
        tutorInfo, tutorModo, siguienteTema, mapaProgreso,
        intervenciones, tieneIntervenciones, idiomaActivo,
        stats, estado, usuario, racha, neuroEstado
    ) {
        const dashboardGrid = document.getElementById('dashboardGrid');
        if (!dashboardGrid) return;
        
        let tutorContainer = document.getElementById('tutorUnificadoContainer');
        if (!tutorContainer) {
            tutorContainer = document.createElement('div');
            tutorContainer.id = 'tutorUnificadoContainer';
            tutorContainer.style.cssText = `
                grid-column: 1 / -1;
                margin-bottom: 0;
                transition: all 0.3s ease;
            `;
            const firstChild = dashboardGrid.firstChild;
            if (firstChild) {
                dashboardGrid.insertBefore(tutorContainer, firstChild);
            } else {
                dashboardGrid.appendChild(tutorContainer);
            }
        }
        
        const tieneRuta = ruta && ruta.length > 0;
        const totalPasos = progresoRuta.total || 0;
        const completados = progresoRuta.completados || 0;
        const pctRuta = progresoRuta.porcentaje || 0;
        const nombreUsuario = usuario?.nombre || 'Usuario';
        const nombreIdioma = this._getNombreIdioma(idiomaActivo);
        const nivelUsuario = usuario?.idiomasObjetivo?.find(i => i.idioma === idiomaActivo)?.nivel || 'A1';
        
        const centinelaObj = window.centinela || {};
        const estadoSalud = centinelaObj.estadoSalud || 'optimo';
        const vigiaOnline = window.vigia?.enLinea || false;
        
        let estadoGeneral = '🧠 Aprendizaje activo';
        let estadoColor = 'var(--primary)';
        let estadoIcono = '🧠';
        let estadoBg = 'linear-gradient(135deg, var(--primary)06, var(--secondary)06)';
        let estadoBorder = '2px solid var(--primary)20';
        
        if (tieneIntervenciones) {
            estadoGeneral = `⚠️ ${intervenciones.length} intervenciones pendientes`;
            estadoColor = 'var(--warning)';
            estadoIcono = '⚠️';
            estadoBg = 'linear-gradient(135deg, var(--warning)06, var(--primary)06)';
            estadoBorder = '2px solid var(--warning)';
        } else if (tieneRuta && completados === totalPasos && totalPasos > 0) {
            estadoGeneral = '🎉 ¡Ruta completada!';
            estadoColor = 'var(--success)';
            estadoIcono = '🎉';
            estadoBg = 'linear-gradient(135deg, var(--success)06, var(--secondary)06)';
            estadoBorder = '2px solid var(--success)';
        } else if (pasoActual) {
            const nombrePaso = pasoActual.titulo || pasoActual.nombre || pasoActual.tema || 'Paso actual';
            estadoGeneral = `📌 ${nombrePaso}`;
            estadoColor = 'var(--primary)';
            estadoIcono = '📌';
        } else if (siguienteTema) {
            estadoGeneral = `📖 Siguiente: "${siguienteTema.nombre}"`;
            estadoColor = 'var(--primary)';
            estadoIcono = '📖';
        }
        
        const pctGeneral = Math.max(pctRuta, mapaProgreso || 0);
        
        let html = `
            <div style="
                background: ${estadoBg};
                border-radius: 14px;
                padding: 16px 20px;
                border: ${estadoBorder};
                box-shadow: 0 4px 20px rgba(108,92,231,0.06);
                transition: all 0.3s ease;
            ">
                <!-- HEADER -->
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:8px;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:28px;">${estadoIcono}</span>
                        <div>
                            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                                <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">
                                    🧠 Tutor NeuroAdaptativo
                                    <span style="font-size:11px;font-weight:400;color:var(--gray-light);">v3.0</span>
                                </h3>
                                <span style="font-size:9px;font-weight:600;padding:2px 10px;border-radius:12px;background:${estadoColor}20;color:${estadoColor};">
                                    ${tutorInfo ? tutorInfo.icono : '🧠'} ${tutorInfo ? tutorInfo.nombre : 'Flexible'}
                                </span>
                                ${tieneIntervenciones ? `
                                    <span style="font-size:9px;font-weight:600;padding:2px 10px;border-radius:12px;background:var(--warning)20;color:var(--warning);animation:pulse-badge 2s ease-in-out infinite;">
                                        ⚠️ ${intervenciones.length}
                                    </span>
                                ` : ''}
                                ${vigiaOnline ? `<span style="font-size:8px;color:var(--success);">🟢 Online</span>` : `<span style="font-size:8px;color:var(--danger);">🔴 Offline</span>`}
                                ${racha >= 3 ? `<span style="font-size:12px;">🔥</span>` : ''}
                            </div>
                            <div style="font-size:12px;color:var(--gray);display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                                <span>${estadoGeneral}</span>
                                ${tieneRuta ? `· 📊 ${completados}/${totalPasos} pasos (${pctRuta}%)` : '· Sin ruta activa'}
                                ${racha > 0 ? `· 🔥 Racha: ${racha} día${racha > 1 ? 's' : ''}` : ''}
                                <span style="font-size:10px;color:var(--gray-light);">🌍 ${nombreIdioma} · ${nivelUsuario}</span>
                                <span style="font-size:9px;color:${this._COLORES_ESTADO[estadoSalud] || 'var(--gray)'};">
                                    ${this._ICONOS_ESTADO[estadoSalud] || '✅'} ${estadoSalud}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                        <button class="btn-secondary" onclick="window.tutorNeuro._mostrarRutaCompleta()" 
                                style="padding:4px 12px;font-size:11px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;transition:all 0.3s;">
                            <i class="fas fa-route"></i> Ver Ruta
                        </button>
                        <button class="btn-secondary" onclick="window.LearningPath.regenerarRuta()" 
                                style="padding:4px 12px;font-size:11px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-sync"></i> Regenerar
                        </button>
                        <button class="btn-secondary" onclick="window.uiCore.irAModulo('config')" 
                                style="padding:4px 12px;font-size:11px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-cog"></i> Configurar
                        </button>
                    </div>
                </div>

                <!-- PASO ACTUAL -->
                ${pasoActual ? `
                    <div style="
                        background: ${pasoActual.completado ? 'var(--success)05' : 'var(--white)'};
                        border-radius: 10px;
                        padding: 14px 16px;
                        border-left: 4px solid ${pasoActual.completado ? 'var(--success)' : (pasoActual.color || 'var(--primary)')};
                        cursor: ${pasoActual.completado ? 'default' : 'pointer'};
                        transition: all 0.3s;
                        margin-top: 8px;
                        box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                        opacity: ${pasoActual.completado ? '0.8' : '1'};
                    "
                    ${!pasoActual.completado ? `onclick="window.LearningPath.ejecutarPasoActual()"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.08)'"
                    onmouseout="this.style.transform='none'; this.style.boxShadow='0 2px 12px rgba(0,0,0,0.04)'"` : ''}>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 28px;">${pasoActual.completado ? '✅' : (pasoActual.icono || '📌')}</span>
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                    <span style="font-size: 15px; font-weight: 700; color: ${pasoActual.completado ? 'var(--success)' : 'var(--dark)'};">
                                        ${pasoActual.titulo || pasoActual.nombre || pasoActual.tema || 'Paso sin título'}
                                    </span>
                                    <span style="font-size: 9px; background: ${pasoActual.color || 'var(--primary)'}20; color: ${pasoActual.color || 'var(--primary)'}; padding: 1px 10px; border-radius: 10px; font-weight: 600;">
                                        ${pasoActual.tipo || 'general'}
                                    </span>
                                    ${pasoActual.completado ? `
                                        <span style="font-size: 8px; color: var(--success);">✅ Completado</span>
                                    ` : `
                                        <span style="font-size: 8px; color: var(--primary);">${pasoActual.porcentaje || 0}%</span>
                                    `}
                                    ${pasoActual.metodo === 'online' ? `
                                        <span style="font-size: 8px; background: var(--success)15; color: var(--success); padding: 1px 8px; border-radius: 8px;">
                                            🧠 IA
                                        </span>
                                    ` : `
                                        <span style="font-size: 8px; background: var(--bg); color: var(--gray); padding: 1px 8px; border-radius: 8px;">
                                            📝 Offline
                                        </span>
                                    `}
                                </div>
                                <p style="font-size: 13px; color: var(--gray); margin: 2px 0 0 0;">${pasoActual.descripcion}</p>
                                ${!pasoActual.completado && pasoActual.porcentaje > 0 ? `
                                    <div style="margin-top: 6px; height: 4px; background: var(--bg); border-radius: 2px; overflow: hidden; max-width: 200px;">
                                        <div style="height: 100%; width: ${pasoActual.porcentaje}%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 2px; transition: width 0.8s ease;"></div>
                                    </div>
                                ` : ''}
                            </div>
                            ${!pasoActual.completado ? `
                                <button class="btn-primary" onclick="event.stopPropagation(); window.LearningPath.ejecutarPasoActual()" 
                                        style="padding: 6px 16px; font-size: 12px; background: linear-gradient(135deg, #6C5CE7, #A29BFE); color: white; border: none; border-radius: 6px; cursor: pointer; white-space: nowrap;">
                                    <i class="fas fa-play"></i> Ir
                                </button>
                            ` : `
                                <span style="font-size: 11px; color: var(--success); font-weight: 600;">✅ Completado</span>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- BARRAS DE PROGRESO -->
                <div style="display:flex;align-items:center;gap:16px;margin-top:10px;flex-wrap:wrap;">
                    <div style="flex:2;min-width:150px;">
                        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-light);margin-bottom:2px;">
                            <span>📊 Progreso de la Ruta</span>
                            <span style="font-weight:600;color:var(--primary);">${pctRuta}%</span>
                        </div>
                        <div style="height:6px;background:var(--bg);border-radius:3px;overflow:hidden;border:1px solid var(--light);">
                            <div style="height:100%;width:${pctRuta}%;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:3px;transition:width 0.8s ease;"></div>
                        </div>
                    </div>
                    
                    ${tieneIntervenciones ? `
                        <div style="flex:1;min-width:120px;">
                            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-light);margin-bottom:2px;">
                                <span>⚠️ Intervenciones</span>
                                <span style="color:var(--warning);font-weight:600;">${intervenciones.length} pendientes</span>
                            </div>
                            <div style="height:6px;background:var(--bg);border-radius:3px;overflow:hidden;border:1px solid var(--light);">
                                <div style="height:100%;width:${Math.min(100, intervenciones.length * 20)}%;background:var(--warning);border-radius:3px;transition:width 0.8s ease;"></div>
                            </div>
                        </div>
                    ` : `
                        <div style="flex:1;min-width:120px;">
                            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-light);margin-bottom:2px;">
                                <span>✅ Estado del Tutor</span>
                                <span style="color:var(--success);font-weight:600;">${tutorInfo ? tutorInfo.nombre : 'Activo'}</span>
                            </div>
                            <div style="height:6px;background:var(--bg);border-radius:3px;overflow:hidden;border:1px solid var(--light);">
                                <div style="height:100%;width:100%;background:var(--success);border-radius:3px;transition:width 0.8s ease;"></div>
                            </div>
                        </div>
                    `}
                    
                    <div style="flex:0.5;min-width:60px;text-align:center;">
                        <div style="font-size:10px;color:var(--gray-light);">🔥 Racha</div>
                        <div style="font-size:18px;font-weight:800;color:${racha >= 3 ? 'var(--success)' : 'var(--gray)'};">${racha}</div>
                    </div>
                    
                    <div style="flex:0.5;min-width:60px;text-align:center;">
                        <div style="font-size:10px;color:var(--gray-light);">⚡ Energía</div>
                        <div style="font-size:16px;font-weight:700;color:${neuroEstado?.energia > 60 ? 'var(--success)' : 'var(--warning)'};">${neuroEstado?.energia || 0}%</div>
                    </div>
                </div>

                <!-- LISTA DE PASOS -->
                ${tieneRuta && pasosConEstado.length > 0 ? `
                    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:10px;padding-top:10px;border-top:1px solid var(--light);">
                        ${pasosConEstado.slice(0, 3).map((p, i) => {
                            let bgColor = 'var(--bg)';
                            let textColor = 'var(--gray)';
                            let estadoEmoji = '⏳';
                            let borderColor = 'var(--light)';
                            let tooltip = p.titulo || p.nombre || p.tema || `Paso ${i+1}`;
                            let pct = p.porcentaje || 0;
                            
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
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                    white-space: nowrap;
                                    opacity: ${p.esCompletado ? '0.7' : '1'};
                                    font-weight: ${p.esActivo ? '600' : '400'};
                                "
                                onclick="window.LearningPath.irAlPaso(${i})"
                                onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" 
                                onmouseout="this.style.transform='none';this.style.boxShadow='none'"
                                title="${tooltip} - ${pct}%"
                                >
                                    ${estadoEmoji} ${tooltip}
                                    ${p.esActivo ? ' ◀' : ''}
                                    ${!p.esCompletado && pct > 0 ? ` (${pct}%)` : ''}
                                </span>
                            `;
                        }).join('')}
                        
                        ${pasosConEstado.length > 3 ? `
                            <button class="btn-secondary" onclick="window.tutorNeuro._mostrarRutaCompleta()" 
                                    style="padding:2px 12px;font-size:10px;background:var(--bg);border:1px solid var(--light);border-radius:12px;cursor:pointer;white-space:nowrap;transition:all 0.3s;"
                                    onmouseover="this.style.background='var(--gray-light)'" onmouseout="this.style.background='var(--bg)'">
                                +${pasosConEstado.length - 3} más ▼
                            </button>
                        ` : ''}
                        
                        <span style="font-size:9px;color:var(--gray-light);margin-left:auto;">
                            📊 ${pasosConEstado.filter(p => p.esCompletado).length}/${pasosConEstado.length}
                        </span>
                    </div>
                ` : `
                    <div style="text-align:center;padding:12px 0;margin-top:8px;border-top:1px solid var(--light);">
                        <p style="font-size:13px;color:var(--gray);margin:0 0 8px 0;">
                            🧠 Deja que la IA cree una ruta personalizada para ti
                        </p>
                        <button class="btn-primary" onclick="window.LearningPath.generarRuta(true)" 
                                style="padding:8px 24px;font-size:13px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s;">
                            <i class="fas fa-magic"></i> Generar mi Ruta
                        </button>
                    </div>
                `}

                <!-- INTERVENCIONES -->
                ${tieneIntervenciones ? `
                    <div style="margin-top:10px;border-top:1px solid var(--light);padding-top:10px;">
                        <div style="display:flex;flex-direction:column;gap:6px;">
                            ${intervenciones.slice(0, 2).map((interv, idx) => `
                                <div style="
                                    background: var(--white);
                                    border-radius: 8px;
                                    padding: 8px 14px;
                                    border-left: 3px solid ${idx === 0 ? 'var(--warning)' : 'var(--gray)'};
                                    font-size: 12px;
                                    color: var(--dark);
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    flex-wrap: wrap;
                                    gap: 8px;
                                    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
                                ">
                                    <span style="flex:1;font-size:11px;">${interv.mensaje.substring(0, 80)}${interv.mensaje.length > 80 ? '...' : ''}</span>
                                    <button onclick="window.tutorNeuro._mostrarIntervencionEspecifica(${intervenciones.indexOf(interv)})" 
                                            style="padding:2px 12px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;white-space:nowrap;transition:all 0.3s;">
                                        Ver
                                    </button>
                                </div>
                            `).join('')}
                            ${intervenciones.length > 2 ? `
                                <div style="font-size:10px;color:var(--gray-light);text-align:center;padding:4px 0;">
                                    +${intervenciones.length - 2} intervenciones más
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- FOOTER -->
                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-top:10px;
                    padding-top:8px;
                    border-top:1px solid var(--light);
                    font-size:10px;
                    color:var(--gray-light);
                    flex-wrap:wrap;
                    gap:4px;
                ">
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        <span>🧠 Modo: <strong style="color:${estadoColor};">${tutorInfo ? tutorInfo.nombre : 'Flexible'}</strong></span>
                        <span>📚 Pasos: <strong>${completados}/${totalPasos}</strong></span>
                        ${siguienteTema ? `<span>📌 Siguiente: <strong>${siguienteTema.nombre}</strong></span>` : ''}
                        ${tieneIntervenciones ? `<span style="color:var(--warning);">⚠️ ${intervenciones.length}</span>` : ''}
                        <span>${vigiaOnline ? '🟢' : '🔴'} Vigía</span>
                        <span>🧠 RCN: ${(pipeline?.estadoNeuro?.rcn || 0).toFixed(1)}</span>
                    </div>
                    <div>
                        <span style="font-size:9px;color:var(--gray-light);">
                            ${window.tutorNeuro && window.tutorNeuro._tutorInitDone ? '🟢 Tutor activo' : '🔄 Inicializando...'}
                        </span>
                    </div>
                </div>
            </div>
        `;

        tutorContainer.innerHTML = html;
    }

    // ============================================================
    // TARJETA NEURO
    // ============================================================

    async _renderizarTarjetaNeuro(stats, usuario, neuroEstado, racha) {
        const container = document.getElementById('dashNeuroContainer');
        if (!container) return;

        this._dashNeuroContainer = container;

        try {
            const estadoCognitivo = this._determinarEstadoCognitivo(neuroEstado);
            const recomendacion = await this._obtenerRecomendacionCorta(stats);

            const totalFrases = stats.totalFrases || 1;
            const completadas = stats.progreso || 0;
            const pctFrases = Math.round((completadas / totalFrases) * 100);
            const neuroScore = stats.neuroScore || 0;
            const eficiencia = stats.eficiencia || 0;
            const totalPalabras = stats.totalPalabras || 0;

            let medallas = [];
            if (completadas >= 10) medallas.push({ icono: '🥇', nombre: '10 frases' });
            if (completadas >= 5) medallas.push({ icono: '🥈', nombre: '5 frases' });
            if (completadas >= 2) medallas.push({ icono: '🥉', nombre: '2 frases' });
            if (medallas.length === 0) medallas = [{ icono: '📖', nombre: 'Sin medallas aún' }];

            const recomendacionLarga = await this._obtenerRecomendacionLarga(stats);

            const datosGraficos = [
                { label: 'Energía', value: neuroEstado.energia, color: '#6C5CE7' },
                { label: 'Foco', value: neuroEstado.foco, color: '#00CEC9' },
                { label: 'Progreso', value: pctFrases, color: '#00B894' },
                { label: 'NeuroScore', value: neuroScore, color: '#FDCB6E' }
            ];

            const expandido = this._panelExpandido;

            container.innerHTML = `
                <div class="dash-card-icon" style="background:${estadoCognitivo.color};">
                    <i class="fas ${estadoCognitivo.icono}"></i>
                </div>
                <div class="dash-card-content" style="flex:1;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <h3 style="display:flex;align-items:center;gap:6px;font-size:14px;margin:0;">
                            🧠 Estado Neuro
                            <span style="font-size:9px;font-weight:600;padding:1px 8px;border-radius:10px;background:${estadoCognitivo.color}20;color:${estadoCognitivo.color};">${estadoCognitivo.etiqueta}</span>
                            ${racha >= 3 ? '<span style="font-size:12px;">🔥</span>' : ''}
                        </h3>
                        <button class="neuro-toggle-btn" onclick="window.UIDashboard.togglePanelNeuro()" 
                                style="background:none;border:none;color:var(--gray);cursor:pointer;font-size:14px;transition:all 0.3s;padding:4px 8px;border-radius:4px;"
                                onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='none'">
                            <i class="fas ${expandido ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
                        </button>
                    </div>
                    
                    <p class="dash-card-meta" style="font-size:11px;color:var(--gray);margin:2px 0 4px;">
                        ⚡${neuroEstado.energia}% · 🎯${neuroEstado.foco}% · 🔥${racha}d
                    </p>
                    <div class="dash-card-progress" style="margin-top:4px;">
                        <div class="dash-progress-bar" style="height:4px;">
                            <div class="dash-progress-fill" style="width:${neuroEstado.energia}%;background:${estadoCognitivo.color};height:100%;border-radius:2px;transition:width 0.5s ease;"></div>
                        </div>
                    </div>
                    <div style="font-size:10px;color:var(--gray-light);margin-top:3px;display:flex;justify-content:space-between;">
                        <span>💡 ${recomendacion}</span>
                        <span style="font-size:9px;color:${racha >= 3 ? 'var(--success)' : 'var(--gray)'};">${racha >= 3 ? '🔥 Racha activa' : '🌱 Construye racha'}</span>
                    </div>

                    ${expandido ? `
                        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--light);animation: fadeUp 0.3s ease;">
                            <div style="margin-bottom:12px;">
                                <h4 style="font-size:11px;font-weight:600;color:var(--gray);margin:0 0 8px 0;">📊 Métricas Neuro</h4>
                                ${datosGraficos.map(d => `
                                    <div style="margin-bottom:5px;">
                                        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray);">
                                            <span>${d.label}</span>
                                            <span style="font-weight:700;color:var(--dark);">${d.value}%</span>
                                        </div>
                                        <div style="height:4px;background:var(--bg);border-radius:2px;overflow:hidden;">
                                            <div style="height:100%;width:${d.value}%;background:${d.color};border-radius:2px;transition:width 1s ease;"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>

                            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px;">
                                <div style="background:var(--bg);border-radius:6px;padding:8px;text-align:center;">
                                    <div style="font-size:16px;font-weight:800;color:var(--primary);">${completadas}/${totalFrases}</div>
                                    <div style="font-size:8px;color:var(--gray);text-transform:uppercase;">Frases</div>
                                </div>
                                <div style="background:var(--bg);border-radius:6px;padding:8px;text-align:center;">
                                    <div style="font-size:16px;font-weight:800;color:var(--secondary);">${totalPalabras}</div>
                                    <div style="font-size:8px;color:var(--gray);text-transform:uppercase;">Palabras</div>
                                </div>
                                <div style="background:var(--bg);border-radius:6px;padding:8px;text-align:center;">
                                    <div style="font-size:16px;font-weight:800;color:${eficiencia > 60 ? 'var(--success)' : 'var(--warning)'};">${eficiencia}%</div>
                                    <div style="font-size:8px;color:var(--gray);text-transform:uppercase;">Eficiencia</div>
                                </div>
                            </div>

                            <div style="background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:6px;padding:8px 12px;margin-bottom:8px;">
                                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                                    <span style="font-size:10px;font-weight:600;color:var(--gray);">🏅 Medallas:</span>
                                    ${medallas.map(m => `<span style="font-size:14px;" title="${m.nombre}">${m.icono}</span>`).join('')}
                                    <span style="font-size:9px;color:var(--gray-light);">${medallas.length === 1 && medallas[0].icono === '📖' ? 'Sigue practicando' : ''}</span>
                                </div>
                            </div>

                            <div style="background:var(--bg);border-radius:6px;padding:8px 12px;border-left:3px solid ${estadoCognitivo.color};">
                                <div style="font-size:9px;font-weight:600;color:var(--gray);text-transform:uppercase;margin-bottom:2px;">💡 Recomendación</div>
                                <div style="font-size:12px;color:var(--dark);">${recomendacionLarga}</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="dash-card-arrow" style="${expandido ? 'align-self:flex-start;padding-top:4px;' : ''}">
                    <i class="fas fa-chevron-right"></i>
                </div>
            `;

        } catch (error) {
            console.error('❌ Error renderizando tarjeta neuro:', error);
            this._renderizarNeuroFallback();
        }
    }

    togglePanelNeuro() {
        this._panelExpandido = !this._panelExpandido;
        this._cargarDashboardInicial();
    }

    _renderizarNeuroFallback() {
        const container = document.getElementById('dashNeuroContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="dash-card-icon" style="background:linear-gradient(135deg,#6C5CE7,#A29BFE);">
                <i class="fas fa-brain"></i>
            </div>
            <div class="dash-card-content">
                <h3 style="font-size:14px;margin:0;">🧠 Estado Neuro</h3>
                <p class="dash-card-meta" style="font-size:11px;color:var(--gray);margin:2px 0 4px;">
                    ⚡ Cargando...
                </p>
                <div class="dash-card-progress" style="margin-top:4px;">
                    <div class="dash-progress-bar" style="height:4px;">
                        <div class="dash-progress-fill" style="width:30%;background:var(--primary);height:100%;border-radius:2px;"></div>
                    </div>
                </div>
                <div style="font-size:10px;color:var(--gray-light);margin-top:3px;">
                    💡 Haz clic en la flecha para ver detalles
                </div>
            </div>
            <div class="dash-card-arrow">
                <i class="fas fa-chevron-right"></i>
            </div>
        `;
    }

    // ============================================================
    // BADGE DEL TUTOR
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
            };
            headerRight.appendChild(badge);
        }
        
        if (badge && window.tutorNeuro) {
            try {
                const pendientes = window.tutorNeuro.getIntervencionesPendientes();
                if (pendientes.length > 0) {
                    badge.classList.add('has-intervencion');
                    badge.style.background = 'var(--warning)15';
                    badge.style.borderColor = 'var(--warning)';
                    badge.style.color = 'var(--warning)';
                    badge.innerHTML = `🧠 Tutor (${pendientes.length})`;
                } else {
                    badge.classList.remove('has-intervencion');
                    badge.style.background = 'var(--primary)15';
                    badge.style.borderColor = 'var(--primary)30';
                    badge.style.color = 'var(--primary)';
                    badge.innerHTML = '🧠 Tutor';
                }
            } catch (e) {}
        }
    }

    // ============================================================
    // ACTIVIDAD
    // ============================================================

    _actualizarActividad(core) {
        this.core = core || this.core;
        try {
            const vigiaOnline = window.vigia ? window.vigia.enLinea : false;
            const vigiaTurnos = window.vigia ? window.vigia.turnosSinEscaneo : 0;
            const vigiaEscaneando = window.vigia ? window.vigia.escaneoActivo : false;

            let vigiaActivity = 0;
            let vigiaStatus = 'offline';
            let vigiaStatusText = 'Offline';

            if (vigiaOnline) {
                if (vigiaEscaneando) {
                    vigiaActivity = 95 + Math.random() * 5;
                    vigiaStatus = 'busy';
                    vigiaStatusText = '🔍 Escaneando...';
                } else if (vigiaTurnos < 2) {
                    vigiaActivity = 80 + Math.random() * 15;
                    vigiaStatus = 'online';
                    vigiaStatusText = '🟢 Activo';
                } else if (vigiaTurnos < 5) {
                    vigiaActivity = 50 + Math.random() * 25;
                    vigiaStatus = 'online';
                    vigiaStatusText = '🟡 Esperando';
                } else {
                    vigiaActivity = 10 + Math.random() * 20;
                    vigiaStatus = 'online';
                    vigiaStatusText = '🟠 Inactivo';
                }
            } else {
                vigiaActivity = 5 + Math.random() * 5;
                vigiaStatus = 'offline';
                vigiaStatusText = '🔴 Offline';
            }

            this._vigiaActivity = this._vigiaActivity * 0.6 + vigiaActivity * 0.4;
            this._actualizarBarraVigia(this._vigiaActivity, vigiaStatus, vigiaStatusText, vigiaTurnos);

            const centinelaObj = window.centinela || {};
            const estadoSalud = centinelaObj.estadoSalud || 'optimo';
            const modoOffline = centinelaObj.modoOffline || false;
            const neuroFatiga = centinelaObj.contadores ? centinelaObj.contadores.neuroFatiga : 0;

            let centinelaActivity = 0;
            let centinelaStatus = 'activo';
            let centinelaStatusText = '✅ Estable';

            if (modoOffline) {
                centinelaActivity = 10 + Math.random() * 10;
                centinelaStatus = 'offline';
                centinelaStatusText = '🔴 Offline';
            } else if (estadoSalud === 'critico') {
                centinelaActivity = 100;
                centinelaStatus = 'critico';
                centinelaStatusText = '🚨 Crítico';
            } else if (estadoSalud === 'fatiga' || neuroFatiga > 0.5) {
                centinelaActivity = 40 + Math.random() * 20 + neuroFatiga * 40;
                centinelaStatus = 'fatiga';
                centinelaStatusText = '🧠 Fatiga';
            } else if (estadoSalud === 'bajo_rendimiento') {
                centinelaActivity = 30 + Math.random() * 20;
                centinelaStatus = 'fatiga';
                centinelaStatusText = '📉 Bajo rendimiento';
            } else if (estadoSalud === 'estancado') {
                centinelaActivity = 20 + Math.random() * 20;
                centinelaStatus = 'fatiga';
                centinelaStatusText = '🔄 Estancado';
            } else {
                centinelaActivity = 60 + Math.random() * 30 + (1 - neuroFatiga) * 20;
                centinelaStatus = 'activo';
                centinelaStatusText = '✅ Óptimo';
            }

            this._centinelaActivity = this._centinelaActivity * 0.7 + centinelaActivity * 0.3;
            this._actualizarBarraCentinela(this._centinelaActivity, centinelaStatus, centinelaStatusText);

        } catch (e) {
            console.warn('⚠️ Error actualizando actividad:', e);
        }
    }

    _actualizarBarraVigia(activity, status, statusText, turnos) {
        const bar = document.getElementById('vigiaActivityBar');
        const value = document.getElementById('vigiaActivityValue');
        const dot = document.getElementById('vigiaActivityDot');
        const tooltip = document.getElementById('vigiaTooltip');

        if (bar) {
            bar.style.width = Math.min(100, Math.round(activity)) + '%';
            bar.className = 'activity-bar-fill vigia ' + status;
        }
        if (value) value.textContent = Math.round(activity) + '%';
        if (dot) dot.className = 'activity-status-dot ' + status;
        if (tooltip) {
            tooltip.textContent = 'Vigía: ' + statusText + ' | Actividad: ' + Math.round(activity) + '% | Turnos: ' + turnos;
        }
    }

    _actualizarBarraCentinela(activity, status, statusText) {
        const bar = document.getElementById('centinelaActivityBar');
        const value = document.getElementById('centinelaActivityValue');
        const dot = document.getElementById('centinelaActivityDot');
        const tooltip = document.getElementById('centinelaTooltip');

        if (bar) {
            bar.style.width = Math.min(100, Math.round(activity)) + '%';
            bar.className = 'activity-bar-fill centinela ' + status;
        }
        if (value) value.textContent = Math.round(activity) + '%';
        if (dot) dot.className = 'activity-status-dot ' + status;
        if (tooltip) {
            tooltip.textContent = 'Centinela: ' + statusText + ' | Actividad: ' + Math.round(activity) + '%';
        }
    }

    // ============================================================
    // MÉTODOS AUXILIARES
    // ============================================================

    async _calcularEstadoNeuro() {
        try {
            const estadoCentinela = window.centinela?.getEstado?.() || {};
            const stats = await db.obtenerEstadisticasNeuro();
            const progreso = await db.obtenerTodoProgreso();
            
            const fatiga = estadoCentinela.neuroFatiga || 0;
            const eficiencia = stats.eficiencia || 50;
            const racha = await this._calcularRacha(progreso);
            
            let energia = Math.max(0, 100 - fatiga);
            energia = Math.min(100, energia + (racha > 3 ? Math.min(15, racha * 2) : 0));
            
            let foco = Math.round((energia * 0.5) + (eficiencia * 0.5));
            foco = Math.min(100, foco);
            
            return {
                energia: Math.round(energia),
                fatiga: Math.round(fatiga),
                eficiencia: Math.round(eficiencia),
                foco: Math.round(foco),
                racha: racha
            };
        } catch (e) {
            return { energia: 70, fatiga: 20, eficiencia: 50, foco: 60, racha: 0 };
        }
    }

    async _calcularRacha(progreso) {
        try {
            const fechas = progreso.map(p => new Date(p.ultimoRepaso).toDateString());
            const uniqueFechas = [...new Set(fechas)].sort();
            let racha = 0;
            
            for (let i = uniqueFechas.length - 1; i >= 0; i--) {
                const fecha = new Date(uniqueFechas[i]);
                const diff = Math.floor((Date.now() - fecha.getTime()) / 86400000);
                if (diff === racha) {
                    racha++;
                } else if (diff > racha) {
                    break;
                }
            }
            return racha;
        } catch (e) {
            return 0;
        }
    }

    _determinarEstadoCognitivo(neuroEstado) {
        const { energia, foco } = neuroEstado;
        
        if (energia >= 80 && foco >= 70) {
            return { etiqueta: 'Óptimo', icono: 'fa-brain', color: '#6C5CE7', descripcion: 'Máxima capacidad' };
        } else if (energia >= 60 && foco >= 50) {
            return { etiqueta: 'Concentrado', icono: 'fa-focus', color: '#00B894', descripcion: 'Buen momento' };
        } else if (energia >= 40) {
            return { etiqueta: 'Cansado', icono: 'fa-bed', color: '#FDCB6E', descripcion: 'Toma un descanso' };
        } else {
            return { etiqueta: 'Agotado', icono: 'fa-battery-empty', color: '#FF7675', descripcion: 'Descansa' };
        }
    }

    async _obtenerRecomendacionCorta(stats) {
        try {
            if (window.vigia && window.vigia.enLinea && window.vigia.getRecomendacionPersonalizada) {
                const rec = await window.vigia.getRecomendacionPersonalizada();
                if (rec && rec.mensaje) {
                    return rec.mensaje.substring(0, 50) + (rec.mensaje.length > 50 ? '...' : '');
                }
            }
            const progreso = stats.progreso || 0;
            const totalFrases = stats.totalFrases || 0;
            if (progreso < 10 && totalFrases > 0) return '💪 Sigue practicando';
            else if (progreso > 50) return '🚀 ¡Excelente progreso!';
            else if (totalFrases < 10) return '📖 Genera más frases';
            else return '🧠 Sigue el ritmo';
        } catch (e) {
            return '🧠 Sigue practicando';
        }
    }

    async _obtenerRecomendacionLarga(stats) {
        try {
            if (window.vigia && window.vigia.enLinea && window.vigia.getRecomendacionPersonalizada) {
                const rec = await window.vigia.getRecomendacionPersonalizada();
                if (rec && rec.mensaje) return rec.mensaje;
            }
            const progreso = stats.progreso || 0;
            const eficiencia = stats.eficiencia || 0;
            const totalFrases = stats.totalFrases || 0;
            
            if (progreso < 10 && totalFrases > 0) return '💪 Sigue practicando, cada frase cuenta para tu progreso.';
            else if (eficiencia < 40) return '🔄 Revisa las frases que más fallas para mejorar tu eficiencia.';
            else if (progreso > 50 && eficiencia > 70) return '🚀 ¡Excelente progreso! Considera hacer un examen de nivel.';
            else if (totalFrases < 10) return '📖 Importa o genera más frases para ampliar tu vocabulario.';
            else return '🧠 Sigue con el ritmo, estás en el camino correcto.';
        } catch (e) {
            return '🧠 Sigue practicando para mejorar tu NeuroScore.';
        }
    }
}

window.UIDashboard = new UIDashboard();

console.log('✅ UIDashboard v20.3 - COMPLETO CON TARJETA DE FONÉTICA');
console.log('  🎤 Tarjeta "Fonética" añadida al Dashboard');
console.log('  🔥 Navegación al módulo de Fonética');
console.log('  📊 Progreso de transcripciones mostrado');
console.log('  ✅ Todas las funcionalidades originales preservadas');