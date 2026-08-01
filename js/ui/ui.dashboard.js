// ============================================================
// UI DASHBOARD v22.7 - CORREGIDO: ELIMINADO DUPLICADO DINÁMICO
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
        this._mostrandoContenidoNeuro = false;
        
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
        
        this._CATEGORIAS = [
            {
                id: 'tutor',
                nombre: '🧠 Tutor Inteligente',
                descripcion: 'Tu asistente personal de aprendizaje',
                icono: '🧠',
                color: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
                modulos: [
                    { id: 'tutor_panel', nombre: 'Tutor NeuroAdaptativo', icono: 'fa-brain', desc: 'Aprendizaje personalizado con IA' },
                    { id: 'tutor_generador', nombre: 'Generador NeuroAdaptativo', icono: 'fa-magic', desc: 'Genera contenido personalizado con metodología neurocognitiva' }
                ]
            },
            {
                id: 'aprendizaje',
                nombre: '📚 Aprendizaje',
                descripcion: 'Gestiona tu contenido y progreso',
                icono: '📚',
                color: 'linear-gradient(135deg, #00B894, #55EFC4)',
                modulos: [
                    { id: 'study', nombre: 'Estudiar', icono: 'fa-graduation-cap', desc: 'Práctica con SRS' },
                    { id: 'temas', nombre: 'Temas', icono: 'fa-folder-open', desc: 'Organiza tu contenido' },
                    { id: 'espacio', nombre: 'Mi Espacio', icono: 'fa-star', desc: 'Tus favoritos' }
                ]
            },
            {
                id: 'lenguaje',
                nombre: '🌍 Lenguaje',
                descripcion: 'Herramientas lingüísticas avanzadas',
                icono: '🌍',
                color: 'linear-gradient(135deg, #00CEC9, #81ECEC)',
                modulos: [
                    { id: 'grammar', nombre: 'Gramática', icono: 'fa-sitemap', desc: 'Reglas y estructuras' },
                    { id: 'caracteres', nombre: 'Caracteres', icono: 'fa-font', desc: 'Escritura jeroglífica' },
                    { id: 'fonetica', nombre: 'Fonética', icono: 'fa-microphone-alt', desc: 'Pronunciación' }
                ]
            },
            {
                id: 'sistema',
                nombre: '⚙️ Sistema',
                descripcion: 'Control y configuración',
                icono: '⚙️',
                color: 'linear-gradient(135deg, #636E72, #2D3436)',
                modulos: [
                    { id: 'config', nombre: 'Configuración', icono: 'fa-sliders-h', desc: 'Ajusta tu perfil' },
                    { id: 'tools', nombre: 'Herramientas', icono: 'fa-tools', desc: 'Backup y diagnóstico' }
                ]
            },
            {
                id: 'competiciones',
                nombre: '🏆 Competiciones',
                descripcion: 'Desafía a otros aprendices',
                icono: '🏆',
                color: 'linear-gradient(135deg, #FDCB6E, #E17055)',
                modulos: [
                    { id: 'competiciones', nombre: 'Liga Neuro', icono: 'fa-trophy', desc: 'Compite con IA' }
                ]
            }
        ];
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
        
        console.log('📊 UIDashboard v22.7: Inicializado');
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

    // ============================================================
    // DASHBOARD PRINCIPAL - CORREGIDO (SIN DOBLE TÍTULO)
    // ============================================================

    async _cargarDashboardInicial() {
        if (this._cargando) return;
        if (Date.now() - this._ultimaActualizacion < this._tiempoMinimoActualizacion) {
            console.log('⏳ Actualización muy reciente, saltando...');
            return;
        }
        
        this._cargando = true;
        this._ultimaActualizacion = Date.now();
        
        try {
            console.log('📊 Cargando Dashboard v22.7...');
            
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            this._idiomaActual = idiomaActivo;
            const esJeroglifico = this._esJeroglifico(idiomaActivo);
            
            const stats = await db.obtenerEstadisticasNeuro(idiomaActivo);
            const estado = pipeline.getEstado ? pipeline.getEstado() : { progreso: 0, faseActual: 1, rcn: 0 };
            const usuario = await db.getUsuario();
            const temas = await db.obtenerTemasPorIdioma(idiomaActivo);
            const progreso = await db.obtenerTodoProgreso();
            const racha = await this._calcularRacha(progreso);
            
            const neuroEstado = await this._calcularEstadoNeuro();
            
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
            
            const dashboardGrid = document.getElementById('dashboardGrid');
            if (!dashboardGrid) {
                console.error('❌ dashboardGrid no encontrado');
                this._cargando = false;
                return;
            }

            let tokenData = null;
            if (window.vigia && typeof window.vigia.obtenerEstadoTokens === 'function') {
                tokenData = window.vigia.obtenerEstadoTokens();
            }

            let html = '';

            // ============================================================
            // ⚠️ IMPORTANTE: SOLO GENERAMOS EL HEADER UNA VEZ
            // El header del dashboard ya existe en el HTML estático,
            // así que NO lo generamos aquí para evitar duplicados.
            // ============================================================
            
            // SOLO actualizamos los valores existentes, no creamos nuevo HTML
            // para el título "Panel de Control"

            // ============================================================
            // TARJETA NEURO (SIEMPRE PRIMERO)
            // ============================================================
            html += await this._generarTarjetaNeuroHTML(stats, usuario, neuroEstado, racha);

            // ============================================================
            // CATEGORÍAS - COMPLETO (SIN DUPLICAR EL TÍTULO)
            // ============================================================
            for (const categoria of this._CATEGORIAS) {
                let modulosFiltrados = categoria.modulos;
                
                if (categoria.id === 'lenguaje') {
                    modulosFiltrados = categoria.modulos.filter(m => {
                        if (m.id === 'caracteres' && !esJeroglifico) return false;
                        return true;
                    });
                }
                
                if (modulosFiltrados.length === 0) continue;

                html += `
                    <div class="categoria-container" style="grid-column: 1 / -1; margin-top: 8px;">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                            <span style="font-size:24px;">${categoria.icono}</span>
                            <div>
                                <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">${categoria.nombre}</h3>
                                <p style="font-size:12px;color:var(--gray);margin:2px 0 0;">${categoria.descripcion}</p>
                            </div>
                            <span style="font-size:11px;color:var(--gray-light);margin-left:auto;">${modulosFiltrados.length} módulos</span>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
                `;

                for (const modulo of modulosFiltrados) {
                    let badge = '';
                    let extraStyles = '';
                    let onclick = '';
                    
                    if (modulo.id === 'tutor_panel') {
                        extraStyles = 'border:2px solid var(--primary);background:linear-gradient(135deg, var(--primary)04, var(--secondary)04);';
                        onclick = `window.UIDashboard._irATutorPanel()`;
                        try {
                            if (window.tutorNeuro) {
                                const pendientes = window.tutorNeuro.getIntervencionesPendientes();
                                if (pendientes.length > 0) {
                                    badge = `<span style="font-size:9px;background:var(--warning);color:white;padding:1px 8px;border-radius:10px;">${pendientes.length}</span>`;
                                }
                            }
                        } catch(e) {}
                    } else if (modulo.id === 'tutor_generador') {
                        extraStyles = 'border:2px solid var(--secondary);background:linear-gradient(135deg, var(--secondary)04, var(--primary)04);';
                        onclick = `window.UIDashboard._irAGenerador()`;
                        try {
                            const nivelActual = this._obtenerNivelUsuario();
                            badge = `<span style="font-size:9px;color:var(--gray-light);">🎯 ${nivelActual}</span>`;
                        } catch(e) {}
                    } else {
                        onclick = `window.uiCore.irAModulo('${modulo.id}')`;
                    }
                    
                    if (modulo.id === 'study') {
                        const completadas = stats?.progreso || 0;
                        const total = stats?.totalFrases || 1;
                        const pct = Math.round((completadas / total) * 100);
                        badge = `<span style="font-size:9px;color:var(--gray-light);">${pct}%</span>`;
                    }
                    
                    if (modulo.id === 'temas') {
                        const totalTemas = temas.length;
                        const completados = temas.filter(t => t.estado === 'completado').length;
                        badge = `<span style="font-size:9px;color:var(--gray-light);">${completados}/${totalTemas}</span>`;
                    }
                    
                    if (modulo.id === 'espacio') {
                        try {
                            const favs = await window.gestorFavoritos?.contarFavoritos() || { frases: 0, palabras: 0 };
                            const total = favs.frases + favs.palabras;
                            badge = `<span style="font-size:9px;color:var(--gray-light);">${total}</span>`;
                        } catch (e) {
                            badge = `<span style="font-size:9px;color:var(--gray-light);">0</span>`;
                        }
                    }
                    
                    if (modulo.id === 'grammar') {
                        try {
                            const palabras = await db.obtenerPalabrasPorIdioma(idiomaActivo);
                            badge = `<span style="font-size:9px;color:var(--gray-light);">${palabras.length}</span>`;
                        } catch (e) {
                            badge = `<span style="font-size:9px;color:var(--gray-light);">0</span>`;
                        }
                    }
                    
                    if (modulo.id === 'caracteres') {
                        try {
                            const familias = await db.obtenerFamiliasCaracteres(idiomaActivo);
                            badge = `<span style="font-size:9px;color:var(--gray-light);">${familias.length}</span>`;
                        } catch (e) {
                            badge = `<span style="font-size:9px;color:var(--gray-light);">0</span>`;
                        }
                    }
                    
                    if (modulo.id === 'fonetica') {
                        try {
                            const frases = await db.obtenerFrasesPorIdioma(idiomaActivo);
                            const palabras = await db.obtenerPalabrasPorIdioma(idiomaActivo);
                            let conTranscripcion = 0;
                            let total = 0;
                            for (const f of frases) {
                                total++;
                                if (f.transcripcion || f.pinyinCompleto || f.segmentacion?.pinyin) conTranscripcion++;
                            }
                            for (const p of palabras) {
                                total++;
                                if (p.transcripcion || p.pinyin) conTranscripcion++;
                            }
                            badge = `<span style="font-size:9px;color:var(--gray-light);">${conTranscripcion}/${total}</span>`;
                        } catch (e) {
                            badge = `<span style="font-size:9px;color:var(--gray-light);">0</span>`;
                        }
                    }
                    
                    if (modulo.id === 'competiciones') {
                        extraStyles = 'border:2px solid #FDCB6E;background:linear-gradient(135deg, #FDCB6E08, #E1705508);';
                    }

                    html += `
                        <div class="dash-card" onclick="${onclick}" 
                             style="background:var(--white);border-radius:12px;padding:14px 16px;box-shadow:var(--shadow);border-left:4px solid var(--primary);cursor:pointer;transition:all 0.3s;display:flex;align-items:center;gap:12px;${extraStyles}"
                             onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 6px 25px rgba(0,0,0,0.1)'" 
                             onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                            <div style="width:40px;height:40px;border-radius:10px;background:${categoria.color};display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas ${modulo.icono}"></i>
                            </div>
                            <div style="flex:1;min-width:0;">
                                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                                    <span style="font-size:14px;font-weight:600;color:var(--dark);">${modulo.nombre}</span>
                                    ${badge ? `<span style="font-size:9px;color:var(--gray-light);">${badge}</span>` : ''}
                                </div>
                                <p style="font-size:11px;color:var(--gray);margin:2px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${modulo.desc}</p>
                            </div>
                            <div style="color:var(--gray-light);font-size:14px;flex-shrink:0;">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    `;
                }

                html += `
                        </div>
                    </div>
                `;
            }

            // ============================================================
            // 🔥 ACTUALIZAMOS EL HEADER EXISTENTE EN LUGAR DE CREAR UNO NUEVO
            // ============================================================
            this._actualizarHeaderExistente(usuario, idiomaActivo, estado, racha, tokenData);

            dashboardGrid.innerHTML = html;
            
            this._actualizarHeaderStats(estado);
            this._actualizarActividad(this.core);
            this._actualizarBadgeTutor();
            
            this._renderizadoNeuro = true;
            console.log(`✅ Dashboard v22.7 cargado para: ${idiomaActivo}`);
            
        } catch (error) {
            console.error('❌ Error cargando dashboard:', error);
        } finally {
            this._cargando = false;
        }
    }

    // ============================================================
    // 🔥 NUEVO: ACTUALIZAR HEADER EXISTENTE (SIN DUPLICAR)
    // ============================================================

    _actualizarHeaderExistente(usuario, idiomaActivo, estado, racha, tokenData) {
        // Actualizar el nombre del usuario
        const dashUser = document.getElementById('dashUserName');
        if (dashUser) dashUser.textContent = usuario?.nombre || 'Usuario';

        // Actualizar el subtítulo si existe
        const subtitle = document.getElementById('dashboardSubtitle');
        if (subtitle) {
            subtitle.innerHTML = `Bienvenido de vuelta, <span id="dashUserName" style="font-weight:600;">${usuario?.nombre || 'Usuario'}</span>`;
        }

        // Actualizar la barra de progreso
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const pct = estado?.progreso || 0;
            progressFill.style.width = pct + '%';
        }
        const progressLabel = document.getElementById('progressLabel');
        if (progressLabel) {
            progressLabel.textContent = (estado?.progreso || 0) + '%';
        }

        // Actualizar badges del header
        const headerInfo = document.querySelector('.dashboard-header .header-info') || 
                          document.querySelector('.dashboard-header div:first-child');
        if (headerInfo) {
            // Asegurar que solo hay una vez el título
            const existingTitle = headerInfo.querySelector('h2');
            if (existingTitle) {
                existingTitle.textContent = '📊 Panel de Control';
            }
        }
    }

    // ============================================================
    // IR AL PANEL DEL TUTOR
    // ============================================================

    _irATutorPanel() {
        console.log('🧠 Abriendo panel del Tutor Neuro...');
        if (window.uiCore) {
            window.uiCore.irAModulo('tutor');
        }
    }

    // ============================================================
    // IR AL GENERADOR NEUROADAPTATIVO
    // ============================================================

    _irAGenerador() {
        console.log('🧠 Abriendo Generador NeuroAdaptativo...');
        if (window.uiCore) {
            window.uiCore.irAModulo('tutor_generador');
        }
    }

    // ============================================================
    // GENERAR TARJETA NEURO HTML
    // ============================================================

    async _generarTarjetaNeuroHTML(stats, usuario, neuroEstado, racha) {
        const totalFrases = stats.totalFrases || 1;
        const completadas = stats.progreso || 0;
        const pctFrases = Math.round((completadas / totalFrases) * 100);
        const neuroScore = stats.neuroScore || 0;
        const eficiencia = stats.eficiencia || 0;
        const totalPalabras = stats.totalPalabras || 0;
        
        const estadoCognitivo = this._determinarEstadoCognitivo(neuroEstado);
        const expandido = this._panelExpandido;
        
        return `
            <div id="dashNeuroContainer" style="grid-column: 1 / -1; background:var(--white);border-radius:14px;padding:16px 20px;box-shadow:var(--shadow);border:2px solid var(--primary);margin-bottom:4px;cursor:default;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:44px;height:44px;border-radius:12px;background:${estadoCognitivo.color};display:flex;align-items:center;justify-content:center;font-size:20px;color:white;flex-shrink:0;">
                            <i class="fas ${estadoCognitivo.icono}"></i>
                        </div>
                        <div>
                            <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">
                                🧠 Estado Neuro
                                <span style="font-size:10px;font-weight:600;padding:2px 10px;border-radius:10px;background:${estadoCognitivo.color}20;color:${estadoCognitivo.color};margin-left:8px;">${estadoCognitivo.etiqueta}</span>
                            </h3>
                            <p style="font-size:12px;color:var(--gray);margin:2px 0 0;">
                                ⚡${neuroEstado.energia}% · 🎯${neuroEstado.foco}% · 🔥${racha} días · 📊${pctFrases}%
                            </p>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        <span style="font-size:11px;color:var(--gray-light);background:var(--bg);padding:3px 12px;border-radius:12px;">${completadas}/${totalFrases} frases</span>
                        <span style="font-size:11px;color:var(--gray-light);background:var(--bg);padding:3px 12px;border-radius:12px;">📖 ${totalPalabras}</span>
                        <button class="neuro-toggle-btn" onclick="window.UIDashboard.togglePanelNeuro()" 
                                style="background:none;border:none;color:var(--gray);cursor:pointer;font-size:14px;transition:all 0.3s;padding:4px 8px;border-radius:4px;"
                                onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='none'">
                            <i class="fas ${expandido ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
                        </button>
                    </div>
                </div>
                
                ${expandido ? `
                    <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--light);animation:fadeUp 0.3s ease;">
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:10px;">
                            <div style="background:var(--bg);border-radius:6px;padding:8px;text-align:center;">
                                <div style="font-size:16px;font-weight:800;color:var(--primary);">${neuroEstado.energia}%</div>
                                <div style="font-size:8px;color:var(--gray);text-transform:uppercase;">Energía</div>
                            </div>
                            <div style="background:var(--bg);border-radius:6px;padding:8px;text-align:center;">
                                <div style="font-size:16px;font-weight:800;color:var(--secondary);">${neuroEstado.foco}%</div>
                                <div style="font-size:8px;color:var(--gray);text-transform:uppercase;">Foco</div>
                            </div>
                            <div style="background:var(--bg);border-radius:6px;padding:8px;text-align:center;">
                                <div style="font-size:16px;font-weight:800;color:var(--success);">${eficiencia}%</div>
                                <div style="font-size:8px;color:var(--gray);text-transform:uppercase;">Eficiencia</div>
                            </div>
                            <div style="background:var(--bg);border-radius:6px;padding:8px;text-align:center;">
                                <div style="font-size:16px;font-weight:800;color:var(--warning);">${neuroScore}%</div>
                                <div style="font-size:8px;color:var(--gray);text-transform:uppercase;">NeuroScore</div>
                            </div>
                        </div>
                        <div style="background:var(--bg);border-radius:6px;padding:8px 12px;border-left:3px solid ${estadoCognitivo.color};">
                            <div style="font-size:9px;font-weight:600;color:var(--gray);text-transform:uppercase;margin-bottom:2px;">💡 Recomendación</div>
                            <div style="font-size:12px;color:var(--dark);">${await this._obtenerRecomendacionLarga(stats)}</div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ============================================================
    // TARJETA NEURO
    // ============================================================

    async _renderizarTarjetaNeuro(stats, usuario, neuroEstado, racha) {
        const container = document.getElementById('dashNeuroContainer');
        if (!container) return;

        this._dashNeuroContainer = container;

        try {
            const estadoCognitivo = this._determinarEstadoCognitivo(neuroEstado || { energia: 70, foco: 60 });
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
                { label: 'Energía', value: Math.round(neuroEstado?.energia || 70), color: '#6C5CE7' },
                { label: 'Foco', value: Math.round(neuroEstado?.foco || 60), color: '#00CEC9' },
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
                        ⚡${Math.round(neuroEstado?.energia || 70)}% · 🎯${Math.round(neuroEstado?.foco || 60)}% · 🔥${racha}d
                    </p>
                    <div class="dash-card-progress" style="margin-top:4px;">
                        <div class="dash-progress-bar" style="height:4px;">
                            <div class="dash-progress-fill" style="width:${Math.round(neuroEstado?.energia || 70)}%;background:${estadoCognitivo.color};height:100%;border-radius:2px;transition:width 0.5s ease;"></div>
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
                this._irATutorPanel();
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
    // MÉTODOS EXISTENTES
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
        const energia = neuroEstado?.energia || 70;
        const foco = neuroEstado?.foco || 60;
        
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

    _getCore() {
        return this.core || window.uiCore;
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UIDashboard = new UIDashboard();

console.log('✅ UIDashboard v22.7 - CORREGIDO: ELIMINADO DUPLICADO DINÁMICO');
console.log('  🔥 El título "Panel de Control" se genera UNA SOLA VEZ');
console.log('  🔥 Se actualiza el header existente en lugar de crear uno nuevo');
console.log('  ✅ Todas las funcionalidades originales preservadas');