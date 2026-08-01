// ============================================================
// UI CORE v18.22 - COMPLETO Y CORREGIDO
// ============================================================

class UICore {
    constructor() {
        this._inicializado = false;
        this._initDone = false;
        this.moduloActual = 'dashboard';
        this._navLock = false;
        this._toastActive = false;
        this.toastTimeout = null;
        this.modalAbierto = false;
        this._actualizandoIndicadores = false;
        this._cargandoDashboard = false;
        this._vigiaInterval = null;
        this._activityInterval = null;
        this._chatMetricsInterval = null;
        this._escapeHandler = null;
        this.MAX_HISTORIAS = 10;
        this.MAX_FRASES_POR_HISTORIA = 10;
        this._eventosConfigurados = false;
        this._moduleNames = {
            'dashboard': 'Dashboard',
            'study': 'Estudiar',
            'grammar': 'Gramática',
            'temas': 'Temas',
            'stories': 'Historias',
            'vigia': 'Vigía IA',
            'stats': 'Estadísticas',
            'tools': 'Herramientas',
            'config': 'Configuración',
            'espacio': 'Mi Espacio',
            'competiciones': '🏆 Liga Neuro',
            'caracteres': '🀄 Caracteres',
            'fonetica': '🎤 Fonética',
            'neuro': '🧠 Estado Neuro',
            'familias': '🧠 Familias de Caracteres',
            'tutor': '🧠 Tutor NeuroAdaptativo',
            'tutor_generador': '🧠 Generador NeuroAdaptativo'
        };
        
        this._cargaCompletada = false;
        this._esperandoDatos = false;
        this._intentosCarga = 0;
        this._maxIntentosCarga = 15;
        this._cargaTimeout = null;
        
        this._dialogs = new UIDialogs();
        try {
            this._dialogs._crearDialogPersonalizado();
        } catch (e) {
            console.warn('⚠️ Error creando diálogos:', e);
        }
        
        this._IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        
        this._vigiaActivity = 0;
        this._centinelaActivity = 0;
        
        // ============================================================
        // BALANCEADOR DE CARGA GROQ
        // ============================================================
        this._balanceador = window.balanceadorGroq || null;
        this._indicadorModelo = null;
        this._balanceadorEventosRegistrados = false;
        this._indicadorCreado = false;
        this._intentosCreacionIndicador = 0;
        this._maxIntentosCreacionIndicador = 5;
        
        // ============================================================
        // INDICADOR DE TOKENS
        // ============================================================
        this._tokenIndicatorCreado = false;
        this._ultimoEstadoTokens = null;
        
        // ============================================================
        // RESPONSIVE
        // ============================================================
        this._isMobile = window.innerWidth < 640;
        this._isSmallMobile = window.innerWidth < 400;
        
        // Listener para cambios de tamaño
        window.addEventListener('resize', () => {
            this._isMobile = window.innerWidth < 640;
            this._isSmallMobile = window.innerWidth < 400;
            this._actualizarHeaderResponsive();
            this._actualizarIndicadorTokens();
        });
    }

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._IDIOMAS_JEROGLIFICOS.some(item => 
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
    }

    async init() {
        if (this._initDone || this._inicializado) return this;
        
        console.log('🎨 Inicializando UI Core v18.22...');
        
        try {
            this._esperandoDatos = true;
            console.log('⏳ Esperando que los datos estén cargados...');
            
            const datosCargados = await this._esperarDatosCargados();
            this._esperandoDatos = false;
            
            if (!datosCargados) {
                console.warn('⚠️ Timeout esperando datos, continuando de todas formas');
            } else {
                console.log('✅ Datos cargados correctamente');
            }
            
            if (!this._dialogs) {
                this._dialogs = new UIDialogs();
                this._dialogs._crearDialogPersonalizado();
            }
            
            // ============================================================
            // INICIALIZAR BALANCEADOR
            // ============================================================
            if (window.balanceadorGroq) {
                this._balanceador = window.balanceadorGroq;
                if (!this._balanceador._initDone) {
                    await this._balanceador.init();
                }
                console.log('⚖️ Balanceador de carga integrado en UI Core');
                this._registrarEventosBalanceador();
            }
            
            await this._initSubmodulos();
            
            this._configurarEventos();
            this._crearModales();
            this._iniciarIndicadoresHeader();
            this._iniciarActividad();
            this._configurarModoInverso();
            
            setTimeout(() => {
                this._renderizarBarraVigiaCentinela();
            }, 500);
            
            if (!this._eventosConfigurados) {
                this._configurarEventosIdiomas();
                this._eventosConfigurados = true;
            }
            
            this._inicializarToastEducativo();
            this._registrarModuloCompeticiones();
            this._registrarModuloCaracteres();
            this._registrarModuloFonetica();
            
            setTimeout(() => {
                this._actualizarIndicadoresSeguro();
                this._actualizarActividad();
                this._actualizarModoInversoBtn();
                this._actualizarEspacioStats();
                this._actualizarBotonFamiliaCaracteres();
                this._actualizarIndicadorBalanceador();
                this._actualizarIndicadorTokens();
                this._cargaCompletada = true;
                console.log('✅ UI Core: Actualización inicial completada');
            }, 500);
            
            this._inicializado = true;
            this._initDone = true;
            console.log('🎨 UI Core v18.22: Inicializada correctamente');
            console.log('  📌 Módulos registrados:', Object.keys(this._moduleNames));
        } catch (e) {
            console.warn('⚠️ UI Core init parcial:', e);
            this._inicializado = true;
            this._initDone = true;
        }
        
        return this;
    }

    // ============================================================
    // REGISTRAR EVENTOS DEL BALANCEADOR
    // ============================================================

    _registrarEventosBalanceador() {
        if (this._balanceadorEventosRegistrados) return;
        if (!this._balanceador) return;
        
        this._balanceadorEventosRegistrados = true;
        
        this._balanceador.onCambioModelo((modelo) => {
            console.log(`⚖️ UI: Modelo cambiado a ${modelo}`);
            this._actualizarIndicadorBalanceador();
            const esPrioritario = modelo === this._balanceador.getModeloPrioritario();
            this.mostrarToast(
                esPrioritario ? 
                    `🟢 Modelo prioritario: ${modelo}` : 
                    `🟡 Modelo alternativo: ${modelo}`,
                esPrioritario ? 'success' : 'warning'
            );
        });
        
        this._balanceador.onEstadoActualizado(() => {
            this._actualizarIndicadorBalanceador();
        });
        
        // Escuchar eventos globales también
        window.addEventListener('balanceadorModeloCambiado', (e) => {
            console.log('⚖️ Evento balanceadorModeloCambiado:', e.detail.modelo);
            this._actualizarIndicadorBalanceador();
        });
        
        window.addEventListener('balanceadorEstadoActualizado', () => {
            this._actualizarIndicadorBalanceador();
        });
        
        // Escuchar eventos de tokens
        window.addEventListener('tokensActualizados', (e) => {
            this._actualizarIndicadorTokens(e.detail);
            this._actualizarActividad();
        });
        
        console.log('🔗 Eventos del balanceador y tokens registrados en UI Core');
    }

    // ============================================================
    // HEADER RESPONSIVE
    // ============================================================

    _actualizarHeaderResponsive() {
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            headerContent.style.cssText = `
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 4px 8px;
                padding: 6px 10px;
                width: 100%;
                box-sizing: border-box;
            `;
        }

        const brand = document.querySelector('.brand');
        if (brand) {
            brand.style.cssText = `
                display: flex;
                align-items: center;
                gap: 6px;
                flex-shrink: 0;
                font-size: clamp(13px, 4vw, 20px);
            `;
            const brandSpan = brand.querySelector('span');
            if (brandSpan) {
                brandSpan.textContent = this._isSmallMobile ? 'Pipeline' : 'Pipeline Neuro';
                brandSpan.style.fontSize = this._isSmallMobile ? '13px' : 'inherit';
            }
        }

        const headerRight = document.querySelector('.header-right');
        if (headerRight) {
            headerRight.style.cssText = `
                display: flex;
                align-items: center;
                gap: 3px;
                flex-wrap: wrap;
                flex-shrink: 0;
            `;
        }

        const userBadge = document.getElementById('userBadge');
        if (userBadge) {
            const userName = userBadge.querySelector('.user-name');
            if (userName) {
                userName.style.cssText = `
                    font-size: ${this._isSmallMobile ? '11px' : '13px'};
                    max-width: ${this._isSmallMobile ? '50px' : '80px'};
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    display: inline-block;
                `;
            }
            const userAvatar = userBadge.querySelector('.user-avatar');
            if (userAvatar) {
                userAvatar.style.fontSize = this._isSmallMobile ? '16px' : '20px';
            }
        }

        // Vigía y Centinela indicators
        const vigiaIndicator = document.getElementById('vigiaIndicator');
        const centinelaIndicator = document.getElementById('centinelaIndicator');
        
        for (const indicator of [vigiaIndicator, centinelaIndicator]) {
            if (indicator) {
                indicator.style.cssText = `
                    display: inline-flex;
                    align-items: center;
                    gap: 2px;
                    font-size: ${this._isSmallMobile ? '8px' : (this._isMobile ? '9px' : '11px')};
                    flex-shrink: 0;
                `;
                const label = indicator.querySelector('.vigia-label, .centinela-label');
                if (label) {
                    label.style.display = this._isSmallMobile ? 'none' : 'inline';
                }
                const dot = indicator.querySelector('.vigia-dot, .centinela-dot');
                if (dot) {
                    dot.style.width = this._isSmallMobile ? '6px' : '8px';
                    dot.style.height = this._isSmallMobile ? '6px' : '8px';
                }
            }
        }
    }

    // ============================================================
    // INICIAR INDICADORES HEADER
    // ============================================================

    _iniciarIndicadoresHeader() {
        const brand = document.querySelector('.brand');
        if (!brand) return;
        
        // Aplicar responsive al header
        this._actualizarHeaderResponsive();
        
        if (!document.getElementById('vigiaIndicator')) {
            const vigiaIndicator = document.createElement('div');
            vigiaIndicator.id = 'vigiaIndicator';
            vigiaIndicator.className = 'vigia-indicator';
            vigiaIndicator.innerHTML = `
                <div class="vigia-dot" id="vigiaDot"></div>
                <span class="vigia-label">Vigía</span>
                <span class="vigia-status" id="vigiaStatus">● Offline</span>
            `;
            brand.appendChild(vigiaIndicator);
        }
        
        if (!document.getElementById('centinelaIndicator')) {
            const centinelaIndicator = document.createElement('div');
            centinelaIndicator.id = 'centinelaIndicator';
            centinelaIndicator.className = 'centinela-indicator';
            centinelaIndicator.innerHTML = `
                <div class="centinela-dot" id="centinelaDot"></div>
                <span class="centinela-label">Centinela</span>
                <span class="centinela-status" id="centinelaStatus">● Activo</span>
            `;
            brand.appendChild(centinelaIndicator);
        }
        
        const existingSelector = document.getElementById('idiomaSelectorWrapper');
        if (existingSelector) existingSelector.remove();
        
        // Crear el contenedor y el indicador del balanceador
        this._crearIndicadorBalanceador();
        
        // PRIMERO: Configurar el botón de modo inverso
        this._configurarModoInverso();
        
        // SEGUNDO: Crear el indicador de tokens (se inserta ANTES del botón)
        this._crearIndicadorTokens();
        
        this._actualizarIndicadoresSeguro();
        
        // Aplicar responsive cada vez que cambie el tamaño
        window.addEventListener('resize', () => {
            this._actualizarHeaderResponsive();
        });
        
        if (this._vigiaInterval) clearInterval(this._vigiaInterval);
        this._vigiaInterval = setInterval(() => {
            this._actualizarIndicadoresSeguro();
            this._actualizarBarraVigiaCentinela();
            this._actualizarIndicadorBalanceador();
            this._actualizarIndicadorTokens();
        }, 3000);
    }

    // ============================================================
    // CREAR INDICADOR VISUAL DEL BALANCEADOR
    // ============================================================

    _crearIndicadorBalanceador() {
        if (document.getElementById('balanceadorModeloIndicator')) {
            this._indicadorCreado = true;
            this._actualizarIndicadorBalanceador();
            return;
        }

        let container = document.getElementById('vigiaCentinelaContainer');
        if (!container) {
            const header = document.querySelector('.header-content');
            if (!header) {
                console.warn('⚠️ No se encontró el header para crear el indicador');
                return;
            }
            
            container = document.createElement('div');
            container.id = 'vigiaCentinelaContainer';
            container.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 2px;
                padding: 3px 6px;
                background: var(--bg);
                border-radius: 6px;
                border: 1px solid var(--light);
                min-width: clamp(60px, 15vw, 180px);
                max-width: 200px;
                flex: 1;
                flex-shrink: 0;
            `;
            header.appendChild(container);
        }

        if (!document.body.contains(container)) {
            console.warn('⚠️ Contenedor no está en el DOM, reintentando...');
            if (this._intentosCreacionIndicador < this._maxIntentosCreacionIndicador) {
                this._intentosCreacionIndicador++;
                setTimeout(() => this._crearIndicadorBalanceador(), 300);
            }
            return;
        }

        const existing = document.getElementById('balanceadorModeloIndicator');
        if (existing) existing.remove();

        const indicador = document.createElement('div');
        indicador.id = 'balanceadorModeloIndicator';
        indicador.style.cssText = `
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: clamp(8px, 1.5vw, 11px);
            padding: 2px 8px;
            border-radius: 6px;
            background: var(--bg);
            border: 1px solid var(--light);
            margin-top: 1px;
            transition: all 0.5s ease;
            cursor: default;
            position: relative;
            overflow: hidden;
            flex-shrink: 0;
        `;
        
        const modeloNombre = this._balanceador?.getModeloActivo() || 'openai/gpt-oss-120b';
        const nombreCorto = this._isSmallMobile ? this._abreviarModelo(modeloNombre) : modeloNombre;
        
        indicador.innerHTML = `
            <span class="balanceador-dot" id="balanceadorStatusDot" style="width:${this._isSmallMobile ? '6px' : '8px'};height:${this._isSmallMobile ? '6px' : '8px'};border-radius:50%;display:inline-block;background:var(--success);flex-shrink:0;"></span>
            <span class="balanceador-nombre" id="balanceadorModeloNombre" style="font-weight:600;color:var(--dark);font-size:clamp(8px,1.5vw,11px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:clamp(60px,10vw,160px);">${nombreCorto}</span>
            <span class="balanceador-estado" id="balanceadorModeloEstado" style="font-size:clamp(7px,1.2vw,10px);color:var(--gray);white-space:nowrap;margin-left:auto;">🟢</span>
        `;

        if (document.body.contains(container)) {
            container.appendChild(indicador);
        } else {
            console.warn('⚠️ Contenedor ya no está en el DOM, reintentando...');
            if (this._intentosCreacionIndicador < this._maxIntentosCreacionIndicador) {
                this._intentosCreacionIndicador++;
                setTimeout(() => this._crearIndicadorBalanceador(), 300);
            }
            return;
        }

        this._indicadorModelo = {
            dot: document.getElementById('balanceadorStatusDot'),
            nombre: document.getElementById('balanceadorModeloNombre'),
            estado: document.getElementById('balanceadorModeloEstado')
        };
        this._indicadorCreado = true;
        this._intentosCreacionIndicador = 0;

        this._actualizarIndicadorBalanceador();
        console.log('✅ Indicador del balanceador creado');
    }

    _abreviarModelo(modelo) {
        const abreviaturas = {
            'openai/gpt-oss-120b': 'GPT OSS',
            'qwen/qwen3.6-27b': 'Qwen3.6',
            'qwen/qwen3-32b': 'Qwen3',
            'llama-3.3-70b-versatile': 'Llama 70B',
            'llama-3.1-8b-instant': 'Llama 8B',
            'mixtral-8x7b-32768': 'Mixtral 8x7B'
        };
        return abreviaturas[modelo] || modelo.split('/').pop() || modelo;
    }

    // ============================================================
    // ACTUALIZAR INDICADOR VISUAL DEL BALANCEADOR
    // ============================================================

    _actualizarIndicadorBalanceador() {
        if (!this._indicadorModelo) {
            if (!document.getElementById('balanceadorModeloIndicator')) {
                this._crearIndicadorBalanceador();
                return;
            }
            this._indicadorModelo = {
                dot: document.getElementById('balanceadorStatusDot'),
                nombre: document.getElementById('balanceadorModeloNombre'),
                estado: document.getElementById('balanceadorModeloEstado')
            };
            if (!this._indicadorModelo.nombre) return;
        }

        const estado = this._balanceador?.getEstado();
        if (!estado) {
            if (this._indicadorModelo.nombre) {
                this._indicadorModelo.nombre.textContent = '⚖️';
                this._indicadorModelo.estado.textContent = '⏳';
                this._indicadorModelo.dot.style.background = 'var(--gray)';
            }
            return;
        }

        const modelo = estado.modeloActivo || 'N/A';
        const esPrioritario = modelo === estado.modeloPrioritario;
        const modelosDisponibles = estado.modelosDisponibles || 0;
        const totalModelos = estado.modelosTotal || 0;

        if (this._indicadorModelo.nombre) {
            const nombreCorto = this._isSmallMobile ? this._abreviarModelo(modelo) : modelo;
            this._indicadorModelo.nombre.textContent = nombreCorto;
            this._indicadorModelo.nombre.style.color = esPrioritario ? 'var(--success)' : 'var(--warning)';
            this._indicadorModelo.nombre.title = `Modelo activo: ${modelo}`;
        }

        if (this._indicadorModelo.estado) {
            if (esPrioritario) {
                this._indicadorModelo.estado.textContent = this._isSmallMobile ? '🟢' : '🟢 Prioritario';
                this._indicadorModelo.estado.style.color = 'var(--success)';
                if (this._indicadorModelo.dot) this._indicadorModelo.dot.style.background = 'var(--success)';
            } else {
                this._indicadorModelo.estado.textContent = this._isSmallMobile ? `🟡${modelosDisponibles}` : `🟡 ${modelosDisponibles}/${totalModelos}`;
                this._indicadorModelo.estado.style.color = 'var(--warning)';
                if (this._indicadorModelo.dot) this._indicadorModelo.dot.style.background = 'var(--warning)';
            }

            if (modelosDisponibles === 0) {
                this._indicadorModelo.estado.textContent = '🔴';
                this._indicadorModelo.estado.style.color = 'var(--danger)';
                if (this._indicadorModelo.dot) this._indicadorModelo.dot.style.background = 'var(--danger)';
            }
        }

        const tooltip = `Modelo activo: ${modelo}\nPrioritario: ${estado.modeloPrioritario}\nDisponibles: ${modelosDisponibles}/${totalModelos}\n${esPrioritario ? '✅ Usando modelo prioritario' : '⚠️ Usando modelo alternativo'}`;
        if (this._indicadorModelo.nombre) this._indicadorModelo.nombre.title = tooltip;
        if (this._indicadorModelo.estado) this._indicadorModelo.estado.title = tooltip;
    }

    // ============================================================
    // CONFIGURAR MODO INVERSO
    // ============================================================

    _configurarModoInverso() {
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;
        
        const existingWrapper = document.getElementById('idiomaSelectorWrapper');
        if (existingWrapper) existingWrapper.remove();
        
        if (!document.getElementById('modoInversoBtn')) {
            const modoBtn = document.createElement('button');
            modoBtn.id = 'modoInversoBtn';
            modoBtn.className = 'icon-btn';
            modoBtn.title = 'Alternar modo inverso';
            modoBtn.style.cssText = `
                padding: ${this._isSmallMobile ? '2px 4px' : '3px 6px'};
                background: none;
                border: none;
                color: var(--gray);
                cursor: pointer;
                font-size: clamp(14px, 3vw, 18px);
                border-radius: 4px;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            `;
            modoBtn.innerHTML = '<i class="fas fa-exchange-alt"></i>';
            
            modoBtn.addEventListener('click', () => {
                const activo = modoInverso.toggle();
                this.mostrarToast(
                    activo ? '🔄 Modo Inverso activado' : '🔄 Modo Normal',
                    'info'
                );
                this._actualizarModoInversoBtn();
                if (window.UIStudy) {
                    window.UIStudy._renderizarFraseInteractiva();
                }
            });
            
            headerRight.appendChild(modoBtn);
            this._actualizarModoInversoBtn();
        }
    }

    _actualizarModoInversoBtn() {
        const btn = document.getElementById('modoInversoBtn');
        if (!btn) return;
        const activo = modoInverso.isActivo();
        btn.style.color = activo ? 'var(--secondary)' : 'var(--gray)';
        btn.style.background = activo ? 'var(--secondary)20' : 'transparent';
        btn.title = activo ? 'Modo Inverso activado' : 'Modo Normal';
        if (activo) {
            btn.style.border = '1px solid var(--secondary)';
        } else {
            btn.style.border = 'none';
        }
    }

    // ============================================================
    // CREAR INDICADOR DE TOKENS (RESPONSIVE)
    // ============================================================

    _crearIndicadorTokens() {
        if (document.getElementById('tokenIndicator')) {
            this._tokenIndicatorCreado = true;
            this._actualizarIndicadorTokens();
            return;
        }

        const headerRight = document.querySelector('.header-right');
        if (!headerRight) {
            console.warn('⚠️ No se encontró el header-right para el indicador de tokens');
            setTimeout(() => this._crearIndicadorTokens(), 500);
            return;
        }

        const modoBtn = document.getElementById('modoInversoBtn');
        
        const indicator = document.createElement('span');
        indicator.id = 'tokenIndicator';
        indicator.className = 'token-indicator';
        indicator.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 2px;
            padding: ${this._isSmallMobile ? '1px 4px' : '2px 8px'};
            border-radius: ${this._isSmallMobile ? '8px' : '10px'};
            font-size: clamp(8px, 2vw, 11px);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid var(--light);
            background: var(--bg);
            color: var(--gray);
            white-space: nowrap;
            flex-shrink: 0;
        `;
        indicator.title = 'Consumo de tokens de Groq - Haz clic para detalles';
        
        // En móvil muy pequeño, solo mostrar el icono
        const displayText = this._isSmallMobile ? '🪙' : '🪙 0%';
        indicator.innerHTML = displayText;
        
        indicator.onclick = () => {
            this._mostrarDetalleTokens();
        };
        
        indicator.onmouseover = function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        };
        indicator.onmouseout = function() {
            this.style.transform = 'none';
            this.style.boxShadow = 'none';
        };
        
        // Insertar ANTES del botón de modo inverso
        if (modoBtn && modoBtn.parentNode) {
            modoBtn.parentNode.insertBefore(indicator, modoBtn);
            console.log('✅ Indicador de tokens insertado ANTES del botón Modo Inverso');
        } else {
            headerRight.appendChild(indicator);
            console.log('✅ Indicador de tokens añadido al final del header');
        }
        
        this._tokenIndicatorCreado = true;
        this._actualizarIndicadorTokens();
    }

    // ============================================================
    // ACTUALIZAR INDICADOR DE TOKENS (RESPONSIVE)
    // ============================================================

    _actualizarIndicadorTokens(tokenData) {
        const indicator = document.getElementById('tokenIndicator');
        if (!indicator) {
            if (!this._tokenIndicatorCreado) {
                this._crearIndicadorTokens();
            }
            return;
        }

        if (!tokenData && window.vigia && typeof window.vigia.obtenerEstadoTokens === 'function') {
            tokenData = window.vigia.obtenerEstadoTokens();
        }

        if (!tokenData) {
            indicator.innerHTML = this._isSmallMobile ? '🪙' : '🪙 ...';
            indicator.style.borderColor = 'var(--light)';
            indicator.style.color = 'var(--gray)';
            indicator.style.background = 'var(--bg)';
            return;
        }

        const pct = tokenData.diario?.porcentaje || 0;
        const estado = tokenData.estado || 'normal';
        const emoji = tokenData.emoji || '🪙';
        const color = tokenData.color || 'var(--success)';
        
        // En móvil muy pequeño, solo mostrar icono + porcentaje sin espacio
        const displayText = this._isSmallMobile ? 
            (pct > 0 ? `${emoji}${pct}%` : emoji) : 
            (pct > 0 ? `${emoji} ${pct}%` : `${emoji} 0%`);
        
        indicator.innerHTML = displayText;
        indicator.style.borderColor = color;
        indicator.style.color = color;
        indicator.style.background = `${color}15`;
        indicator.title = `Consumo: ${pct}% · ${tokenData.label || 'Normal'}\nRestantes: ${Math.round((tokenData.diario?.tokensRestantes || 0) / 1000)}K\nReinicio: ${tokenData.tiempoReinicio || 'N/A'}`;
        
        if (estado === 'critico') {
            indicator.classList.add('critico');
            indicator.style.animation = 'pulse-warning 1.5s ease-in-out infinite';
        } else {
            indicator.classList.remove('critico');
            indicator.style.animation = 'none';
        }
        
        this._ultimoEstadoTokens = tokenData;
    }

    // ============================================================
    // MOSTRAR DETALLE DE TOKENS EN MODAL
    // ============================================================

    async _mostrarDetalleTokens() {
        if (!window.vigia || typeof window.vigia.obtenerEstadoTokens !== 'function') {
            this.mostrarToast('⚠️ No se puede obtener el estado de tokens', 'error');
            return;
        }

        const data = window.vigia.obtenerEstadoTokens();
        if (!data) {
            this.mostrarToast('⚠️ No hay datos de tokens disponibles', 'error');
            return;
        }

        const pctDiario = data.diario?.porcentaje || 0;
        const usadoDiario = Math.round((data.diario?.usado || 0) / 1000);
        const limiteDiario = Math.round((data.diario?.limite || 150000) / 1000);
        const restantes = Math.round((data.diario?.tokensRestantes || 0) / 1000);
        const pctMinuto = data.porMinuto?.porcentaje || 0;
        const usadoMinuto = Math.round((data.porMinuto?.usado || 0) / 1000);
        const limiteMinuto = Math.round((data.porMinuto?.limite || 20000) / 1000);
        const peticiones = data.peticionesMinuto?.actual || 0;
        const limitePeticiones = data.peticionesMinuto?.limite || 20;
        const tiempoReinicio = data.tiempoReinicio || 'N/A';
        
        let colorBarra = 'var(--success)';
        let mensajeEstado = '✅ Consumo normal';
        let recomendacion = '💡 Sigue así, estás usando los tokens de forma eficiente.';
        
        if (pctDiario >= 95) {
            colorBarra = 'var(--danger)';
            mensajeEstado = '🔴 ¡Límite crítico!';
            recomendacion = '⚠️ Cambia a modo "Flashcard" offline para ahorrar tokens.';
        } else if (pctDiario >= 80) {
            colorBarra = 'var(--warning)';
            mensajeEstado = '🟠 Consumo alto';
            recomendacion = '📊 Considera reducir el uso de ejercicios con Groq.';
        } else if (pctDiario >= 60) {
            colorBarra = '#FDCB6E';
            mensajeEstado = '🟡 Consumo medio';
            recomendacion = '📖 Puedes seguir usando Groq con moderación.';
        } else {
            colorBarra = 'var(--success)';
            mensajeEstado = '🟢 Consumo bajo';
            recomendacion = '✅ Disfruta estudiando con Groq sin preocupaciones.';
        }

        const mensaje = 
`📊 **CONSUMO DE TOKENS GROQ**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 **LÍMITE DIARIO**
• Usados: ${usadoDiario}K / ${limiteDiario}K tokens
• Restantes: ${restantes}K tokens
• Porcentaje: ${pctDiario}%
• Estado: ${mensajeEstado}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ **CONSUMO POR MINUTO**
• ${usadoMinuto}K / ${limiteMinuto}K tokens
• ${pctMinuto}% del límite

📨 **PETICIONES**
• ${peticiones} / ${limitePeticiones} por minuto
• ${Math.round((peticiones / limitePeticiones) * 100)}% del límite

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 **REINICIO DIARIO**
• ${tiempoReinicio}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 **RECOMENDACIÓN**
${recomendacion}

${pctDiario >= 98 ? '🔴 ¡Alerta! Estás al 98% del límite. Usa modo offline.' : ''}
${pctDiario >= 80 && pctDiario < 98 ? '🟡 Consumo elevado. Planifica tu uso de Groq.' : ''}
${pctDiario < 60 ? '🟢 Todo en orden. Sigue practicando.' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 **CONSEJO**
• Flashcard y Escritura usan menos tokens
• Múltiple y Escucha usan más tokens
• Usa modo offline para ahorrar tokens`;

        await this.alert(mensaje, '🪙 Consumo de Tokens');
    }

    // ============================================================
    // REGISTRAR MÓDULO DE FONÉTICA
    // ============================================================

    _registrarModuloFonetica() {
        console.log('🎤 Registrando módulo de Fonética...');
        
        if (!window.UIFonetica) {
            console.warn('⚠️ UIFonética no encontrado, intentando registrar más tarde...');
            setTimeout(() => {
                if (window.UIFonetica) {
                    console.log('🎤 UIFonética encontrado, registrando...');
                    this._registrarModuloFonetica();
                }
            }, 1000);
            return;
        }
        
        this._moduleNames['fonetica'] = '🎤 Fonética';
        
        try {
            if (typeof window.UIFonetica.init === 'function') {
                window.UIFonetica.init(this);
                console.log('✅ UIFonética inicializado correctamente');
            } else {
                console.warn('⚠️ UIFonética no tiene método init()');
            }
        } catch (e) {
            console.warn('⚠️ Error inicializando UIFonética:', e.message);
        }
    }

    irAFonetica() {
        this.irAModulo('fonetica');
    }

    // ============================================================
    // REGISTRAR MÓDULO DE CARACTERES
    // ============================================================

    _registrarModuloCaracteres() {
        console.log('🀄 Registrando módulo de caracteres...');
        
        if (!window.UICaracteres) {
            console.warn('⚠️ UICaracteres no encontrado, intentando registrar más tarde...');
            setTimeout(() => {
                if (window.UICaracteres) {
                    console.log('🀄 UICaracteres encontrado, registrando...');
                    this._registrarModuloCaracteres();
                }
            }, 1000);
            return;
        }
        
        this._moduleNames['caracteres'] = '🀄 Caracteres';
        
        try {
            if (typeof window.UICaracteres.init === 'function') {
                window.UICaracteres.init(this);
                console.log('✅ UICaracteres inicializado correctamente');
            } else {
                console.warn('⚠️ UICaracteres no tiene método init()');
            }
        } catch (e) {
            console.warn('⚠️ Error inicializando UICaracteres:', e.message);
        }
    }

    irACaracteres() {
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        if (!this._esJeroglifico(idioma)) {
            this.mostrarToast(`⚠️ El idioma "${idioma}" no es jeroglífico. Este módulo solo está disponible para idiomas asiáticos.`, 'warning');
            return;
        }
        this.irAModulo('caracteres');
    }

    _actualizarBotonFamiliaCaracteres() {
        const btn = document.getElementById('btnGenerarFamiliaCaracteres');
        if (btn) {
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            const esJeroglifico = this._esJeroglifico(idiomaActivo);
            btn.style.display = esJeroglifico ? 'inline-flex' : 'none';
        }
    }

    // ============================================================
    // REGISTRAR MÓDULO DE COMPETICIONES
    // ============================================================

    _registrarModuloCompeticiones() {
        console.log('🏆 Registrando módulo de competiciones...');
        
        if (!window.SistemaCompeticiones) {
            console.warn('⚠️ SistemaCompeticiones no encontrado, intentando registrar más tarde...');
            setTimeout(() => {
                if (window.SistemaCompeticiones) {
                    console.log('🏆 SistemaCompeticiones encontrado, registrando...');
                    this._registrarModuloCompeticiones();
                }
            }, 1000);
            return;
        }
        
        this._moduleNames['competiciones'] = '🏆 Liga Neuro';
        
        try {
            if (typeof window.SistemaCompeticiones.init === 'function') {
                window.SistemaCompeticiones.init(this);
                console.log('✅ SistemaCompeticiones inicializado correctamente');
            } else {
                console.warn('⚠️ SistemaCompeticiones no tiene método init()');
            }
        } catch (e) {
            console.warn('⚠️ Error inicializando SistemaCompeticiones:', e.message);
        }
    }

    // ============================================================
    // ESPERAR DATOS CARGADOS
    // ============================================================

    async _esperarDatosCargados() {
        return new Promise((resolve) => {
            if (this._cargaCompletada) {
                console.log('✅ Datos ya cargados');
                resolve(true);
                return;
            }
            
            if (window.app && window.app._datosCargados) {
                this._cargaCompletada = true;
                console.log('✅ Datos cargados (app._datosCargados)');
                resolve(true);
                return;
            }
            
            try {
                const usuario = localStorage.getItem('pipeline_usuario');
                if (usuario) {
                    const parsed = JSON.parse(usuario);
                    if (parsed && parsed.nombre) {
                        console.log('📦 Usuario encontrado en localStorage, datos disponibles');
                        this._cargaCompletada = true;
                        resolve(true);
                        return;
                    }
                }
            } catch (e) {}
            
            this._cargaTimeout = setTimeout(() => {
                console.warn('⚠️ Timeout esperando datos (15s)');
                resolve(false);
            }, 15000);
            
            let intentos = 0;
            const checkInterval = setInterval(() => {
                intentos++;
                
                if (window.app && window.app._datosCargados) {
                    this._cargaCompletada = true;
                    clearInterval(checkInterval);
                    clearTimeout(this._cargaTimeout);
                    console.log('✅ Datos cargados después de ' + intentos + ' intentos');
                    resolve(true);
                } else if (intentos >= this._maxIntentosCarga) {
                    console.warn('⚠️ Máximo de intentos alcanzado (' + this._maxIntentosCarga + ')');
                    clearInterval(checkInterval);
                    clearTimeout(this._cargaTimeout);
                    resolve(false);
                }
            }, 500);
        });
    }

    // ============================================================
    // INICIALIZAR SUBMÓDULOS
    // ============================================================

    async _initSubmodulos() {
        console.log('🔄 Inicializando sub-módulos UI...');
        
        const submodulos = [
            { name: 'UIDashboard', obj: window.UIDashboard },
            { name: 'UIStudy', obj: window.UIStudy },
            { name: 'UIGrammar', obj: window.UIGrammar },
            { name: 'UITemas', obj: window.UITemas },
            { name: 'UIChat', obj: window.UIChat },
            { name: 'UIConfig', obj: window.UIConfig },
            { name: 'UITools', obj: window.UITools },
            { name: 'UIJSON', obj: window.UIJSON },
            { name: 'UIEspacio', obj: window.UIEspacio },
            { name: 'SistemaCompeticiones', obj: window.SistemaCompeticiones },
            { name: 'UICaracteres', obj: window.UICaracteres },
            { name: 'UIFonetica', obj: window.UIFonetica }
        ];
        
        for (const mod of submodulos) {
            try {
                if (mod.obj && typeof mod.obj.init === 'function') {
                    await mod.obj.init(this);
                    console.log(`  ✅ ${mod.name} inicializado`);
                } else if (mod.obj) {
                    console.log(`  ⚠️ ${mod.name} no tiene init()`);
                } else {
                    console.log(`  ⚠️ ${mod.name} no disponible`);
                }
            } catch (e) {
                console.warn(`  ⚠️ Error inicializando ${mod.name}:`, e.message);
            }
        }
        
        console.log('✅ Sub-módulos UI inicializados');
    }

    // ============================================================
    // TOAST EDUCATIVO
    // ============================================================

    _inicializarToastEducativo() {
        if (window.toastEducativo) {
            console.log('📚 Toast Educativo Proactivo activado');
            window.addEventListener('reiniciarToasts', () => {
                if (window.toastEducativo) {
                    window.toastEducativo.reiniciar();
                    this.mostrarToast('📚 Consejos educativos reiniciados', 'info');
                }
            });
            console.log('💡 Para reiniciar los toasters educativos: window.dispatchEvent(new Event("reiniciarToasts"))');
        } else {
            console.warn('⚠️ Toast Educativo no disponible');
        }
    }

    // ============================================================
    // ACTUALIZAR ESPACIO STATS
    // ============================================================

    async _actualizarEspacioStats() {
        try {
            if (!window.gestorFavoritos) {
                console.warn('⚠️ gestorFavoritos no disponible para actualizar stats');
                return;
            }
            const stats = await window.gestorFavoritos.contarFavoritos();
            const meta = document.getElementById('dashEspacioMeta');
            const progress = document.getElementById('dashEspacioProgress');
            if (meta) {
                meta.textContent = `${stats.frases} frases · ${stats.palabras} palabras`;
            }
            if (progress) {
                const total = stats.frases + stats.palabras;
                const pct = Math.min(100, Math.round((total / 100) * 100));
                progress.style.width = pct + '%';
            }
        } catch (e) {
            console.warn('⚠️ Error actualizando stats de Mi Espacio:', e);
        }
    }

    // ============================================================
    // DIÁLOGOS
    // ============================================================

    async alert(message, title) {
        if (!this._dialogs) {
            console.warn('⚠️ _dialogs es null, creando...');
            this._dialogs = new UIDialogs();
            try {
                this._dialogs._crearDialogPersonalizado();
            } catch (e) {
                console.warn('⚠️ Error creando diálogo de emergencia:', e);
                alert(message);
                return;
            }
        }
        return this._dialogs.alert(message, title);
    }

    async confirm(message, title) {
        if (!this._dialogs) {
            console.warn('⚠️ _dialogs es null, creando...');
            this._dialogs = new UIDialogs();
            try {
                this._dialogs._crearDialogPersonalizado();
            } catch (e) {
                console.warn('⚠️ Error creando diálogo de emergencia:', e);
                return confirm(message);
            }
        }
        return this._dialogs.confirm(message, title);
    }

    async prompt(message, defaultValue, placeholder, title) {
        if (!this._dialogs) {
            console.warn('⚠️ _dialogs es null, creando...');
            this._dialogs = new UIDialogs();
            try {
                this._dialogs._crearDialogPersonalizado();
            } catch (e) {
                console.warn('⚠️ Error creando diálogo de emergencia:', e);
                return prompt(message, defaultValue);
            }
        }
        return this._dialogs.prompt(message, defaultValue, placeholder, title);
    }

    mostrarToast(mensaje, tipo) {
        if (this._toastActive) return;
        this._toastActive = true;
        
        try {
            const existing = document.querySelector('.toast');
            if (existing) existing.remove();
            if (this.toastTimeout) {
                clearTimeout(this.toastTimeout);
                this.toastTimeout = null;
            }

            const toast = document.createElement('div');
            toast.className = 'toast ' + (tipo || 'info');
            toast.textContent = mensaje || '';
            document.body.appendChild(toast);

            this.toastTimeout = setTimeout(() => {
                if (toast && toast.parentNode) toast.remove();
                this._toastActive = false;
                this.toastTimeout = null;
            }, 3000);

            toast.onclick = () => {
                if (toast && toast.parentNode) toast.remove();
                if (this.toastTimeout) {
                    clearTimeout(this.toastTimeout);
                    this.toastTimeout = null;
                }
                this._toastActive = false;
            };
        } catch (e) {
            console.warn('⚠️ Error en toast:', e);
            this._toastActive = false;
        }
    }

    // ============================================================
    // NAVEGACIÓN - CORREGIDO CON SOPORTE PARA tutor_generador
    // ============================================================

    irAModulo(module) {
        if (!this._navLock && module) {
            this._navLock = true;
            this._irAModulo(module);
            setTimeout(() => { this._navLock = false; }, 300);
        }
    }

    volverDashboard() {
        if (!this._navLock) {
            this._navLock = true;
            this._irADashboard();
            setTimeout(() => { this._navLock = false; }, 300);
        }
    }

    _irAModulo(module) {
        if (!module || module === 'dashboard') {
            this._irADashboard();
            return;
        }
        
        console.log('🔀 Navegando a módulo:', module);
        
        if (module === 'neuro') {
            console.log('ℹ️ Módulo "neuro" es solo una tarjeta, no un módulo navegable');
            return;
        }
        
        document.querySelectorAll('.view, .module-view').forEach(el => {
            el.classList.remove('active');
        });
        
        // Buscar el módulo existente
        let moduleEl = document.getElementById(module + 'Module');
        
        // Si no existe y es tutor_generador, crearlo
        if (!moduleEl && module === 'tutor_generador') {
            console.log('📦 Creando módulo tutor_generador...');
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                moduleEl = document.createElement('div');
                moduleEl.id = 'tutor_generadorModule';
                moduleEl.className = 'module-view';
                moduleEl.innerHTML = `
                    <div class="module-header">
                        <button class="btn-back" onclick="window.uiCore.volverDashboard()">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div class="module-title">
                            <h2>🧠 Generador NeuroAdaptativo</h2>
                            <span class="module-breadcrumb">Dashboard / Generador Neuro</span>
                        </div>
                    </div>
                    <div class="module-content" id="tutorGeneradorContent">
                        <div id="tutorGeneradorContainer"></div>
                    </div>
                `;
                mainContent.appendChild(moduleEl);
            }
        }
        
        // Si no existe y es tutor, crearlo
        if (!moduleEl && module === 'tutor') {
            console.log('📦 Creando módulo tutor...');
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                moduleEl = document.createElement('div');
                moduleEl.id = 'tutorModule';
                moduleEl.className = 'module-view';
                moduleEl.innerHTML = `
                    <div class="module-header">
                        <button class="btn-back" onclick="window.uiCore.volverDashboard()">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div class="module-title">
                            <h2>🧠 Tutor NeuroAdaptativo</h2>
                            <span class="module-breadcrumb">Dashboard / Tutor Neuro</span>
                        </div>
                    </div>
                    <div class="module-content" id="tutorContent">
                        <div id="tutorFullContainer"></div>
                    </div>
                `;
                mainContent.appendChild(moduleEl);
            }
        }
        
        // Si sigue sin existir, crear un módulo genérico
        if (!moduleEl) {
            console.log('📦 Creando módulo genérico para:', module);
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                moduleEl = document.createElement('div');
                moduleEl.id = module + 'Module';
                moduleEl.className = 'module-view';
                moduleEl.innerHTML = `
                    <div class="module-header">
                        <button class="btn-back" onclick="window.uiCore.volverDashboard()">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div class="module-title">
                            <h2>${this._getModuleName(module)}</h2>
                            <span class="module-breadcrumb">Dashboard / ${this._getModuleName(module)}</span>
                        </div>
                    </div>
                    <div class="module-content" id="${module}Content">
                    </div>
                `;
                mainContent.appendChild(moduleEl);
            }
        }
        
        if (moduleEl) {
            moduleEl.classList.add('active');
            this.moduloActual = module;
            this._actualizarBreadcrumb(module);
            this._cargarContenidoModulo(module);
        } else {
            console.error('❌ No se pudo crear el módulo:', module);
        }
    }

    _getModuleName(module) {
        return this._moduleNames[module] || module;
    }

    _irADashboard() {
        console.log('🔀 Navegando a Dashboard');
        
        document.querySelectorAll('.view, .module-view').forEach(el => {
            el.classList.remove('active');
        });
        
        const dashboard = document.getElementById('dashboardView');
        if (dashboard) {
            dashboard.classList.add('active');
            this.moduloActual = 'dashboard';
            this._actualizarBreadcrumb('dashboard');
            setTimeout(() => this._cargarDashboardInicial(), 100);
        }
    }

    _actualizarBreadcrumb(module) {
        const breadcrumb = document.getElementById('breadcrumbModule');
        if (breadcrumb) {
            breadcrumb.textContent = this._getModuleName(module);
            
            document.querySelectorAll('.breadcrumb-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.module === module) {
                    item.classList.add('active');
                }
            });
        }
    }

    // ============================================================
    // CARGAR CONTENIDO DE MÓDULO - CORREGIDO CON RENDERIZADO DIRECTO
    // ============================================================

    _cargarContenidoModulo(module) {
        try {
            switch(module) {
                case 'study':
                    if (window.UIStudy) window.UIStudy.cargar(this);
                    break;
                case 'grammar':
                    if (window.UIGrammar) window.UIGrammar.cargar(this);
                    break;
                case 'temas':
                    if (window.UITemas) window.UITemas.cargar(this);
                    break;
                case 'stories':
                    if (window.UITemas) window.UITemas.cargarHistorias(this);
                    break;
                case 'stats':
                    if (window.UIDashboard) window.UIDashboard.cargarEstadisticas(this);
                    break;
                case 'vigia':
                    if (window.UIChat) window.UIChat.cargar(this);
                    break;
                case 'config':
                    if (window.UIConfig) window.UIConfig.cargar(this);
                    break;
                case 'tools':
                    if (window.UITools) window.UITools.cargar(this);
                    break;
                case 'espacio':
                    if (window.UIEspacio) window.UIEspacio.cargar(this);
                    break;
                case 'competiciones':
                    if (window.SistemaCompeticiones && typeof window.SistemaCompeticiones.cargar === 'function') {
                        window.SistemaCompeticiones.cargar(this);
                    } else {
                        console.warn('⚠️ SistemaCompeticiones no disponible');
                        this.mostrarToast('⚠️ Módulo de competiciones no disponible. Revisa la consola.', 'error');
                        this._registrarModuloCompeticiones();
                        setTimeout(() => {
                            if (!window.SistemaCompeticiones) {
                                this.mostrarToast('❌ Módulo de competiciones no cargado. Recarga la página.', 'error');
                            }
                        }, 1000);
                    }
                    break;
                case 'caracteres':
                    if (window.UICaracteres) {
                        window.UICaracteres.cargar(this);
                    } else {
                        console.warn('⚠️ UICaracteres no disponible');
                        this.mostrarToast('⚠️ Módulo de caracteres no disponible. Revisa la consola.', 'error');
                    }
                    break;
                case 'fonetica':
                    if (window.UIFonetica) {
                        window.UIFonetica.cargar(this);
                    } else {
                        console.warn('⚠️ UIFonética no disponible');
                        this.mostrarToast('⚠️ Módulo de fonética no disponible. Revisa la consola.', 'error');
                    }
                    break;
                case 'tutor':
                    // 🔥 RENDERIZAR DIRECTAMENTE SIN DEPENDER DE UIDashboard
                    this._renderizarTutorDirecto();
                    break;
                case 'tutor_generador':
                    // 🔥 RENDERIZAR DIRECTAMENTE SIN DEPENDER DE UIDashboard
                    this._renderizarGeneradorDirecto();
                    break;
                default:
                    console.warn('⚠️ Módulo desconocido:', module);
            }
        } catch (e) {
            console.warn('⚠️ Error cargando módulo:', module, e);
        }
    }

    // ============================================================
    // RENDERIZAR TUTOR DIRECTO (SIN DEPENDER DE UIDashboard)
    // ============================================================

    _renderizarTutorDirecto() {
        const container = document.getElementById('tutorFullContainer');
        
        if (!container) {
            console.warn('⚠️ Contenedor del tutor no encontrado');
            // Intentar crear el contenedor
            const content = document.getElementById('tutorContent');
            if (content) {
                const newContainer = document.createElement('div');
                newContainer.id = 'tutorFullContainer';
                content.appendChild(newContainer);
                setTimeout(() => this._renderizarTutorDirecto(), 100);
            }
            return;
        }

        try {
            // Obtener datos del tutor
            let tutorInfo = null;
            let tutorModo = 'flexible';
            let intervenciones = [];
            let siguienteTema = null;
            let mapaProgreso = 0;
            let ruta = [];
            let pasoActual = null;
            let progresoRuta = { completados: 0, total: 0, porcentaje: 0 };
            let pasosConEstado = [];

            if (window.tutorNeuro) {
                tutorInfo = window.tutorNeuro.getModoInfo();
                tutorModo = window.tutorNeuro.getModo();
                intervenciones = window.tutorNeuro.getIntervencionesPendientes() || [];
                siguienteTema = window.tutorNeuro.getSiguienteTema();
                mapaProgreso = window.tutorNeuro._mapaAprendizaje?.progresoGeneral || 0;
            }

            if (window.LearningPath) {
                ruta = window.LearningPath.getRutaCompleta() || [];
                pasoActual = window.LearningPath.getPasoActual();
                progresoRuta = window.LearningPath.getProgreso() || { completados: 0, total: 0, porcentaje: 0 };
                pasosConEstado = window.LearningPath.getPasosConEstado ? 
                    window.LearningPath.getPasosConEstado() : [];
            }

            const nombreUsuario = localStorage.getItem('pipeline_usuario') ? 
                JSON.parse(localStorage.getItem('pipeline_usuario')).nombre || 'Usuario' : 'Usuario';

            const tieneRuta = ruta && ruta.length > 0;
            const totalPasos = progresoRuta.total || 0;
            const completados = progresoRuta.completados || 0;
            const pctRuta = progresoRuta.porcentaje || 0;
            const modoColor = tutorInfo?.color || '#6C5CE7';
            const vigiaOnline = window.vigia?.enLinea || false;

            // Renderizar HTML directamente
            container.innerHTML = `
                <div style="padding:16px;max-width:900px;margin:0 auto;">
                    <!-- HEADER -->
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:16px 20px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:14px;border:2px solid var(--primary)20;">
                        <div>
                            <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                                🧠 Tutor NeuroAdaptativo
                                <span style="font-size:14px;font-weight:400;color:var(--gray-light);">v3.0</span>
                            </h2>
                            <p style="font-size:13px;color:var(--gray);margin:2px 0 0;">
                                <span style="font-weight:600;color:var(--dark);">${nombreUsuario}</span>
                                <span style="display:inline-block;margin-left:8px;padding:2px 12px;border-radius:12px;background:linear-gradient(135deg, #6C5CE7, #A29BFE);color:white;font-size:10px;font-weight:600;">
                                    ${tutorInfo?.icono || '🧠'} ${tutorInfo?.nombre || 'Modo Flexible'}
                                </span>
                                ${tutorModo === 'guiado' ? '<span style="display:inline-block;margin-left:4px;padding:2px 8px;border-radius:8px;background:#6C5CE7;color:white;font-size:9px;">🔒 Guiado</span>' : ''}
                                ${vigiaOnline ? '<span style="font-size:10px;color:var(--success);margin-left:8px;">🟢 Online</span>' : '<span style="font-size:10px;color:var(--danger);margin-left:8px;">🔴 Offline</span>'}
                            </p>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            <button class="btn-secondary" onclick="window.tutorNeuro?._mostrarRutaCompleta()" 
                                    style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                                <i class="fas fa-route"></i> Ver Ruta
                            </button>
                            <button class="btn-secondary" onclick="window.LearningPath?.regenerarRuta()" 
                                    style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                                <i class="fas fa-sync"></i> Regenerar
                            </button>
                            <button class="btn-secondary" onclick="window.uiCore.irAModulo('config')" 
                                    style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                                <i class="fas fa-cog"></i> Configurar
                            </button>
                            <button class="btn-primary" onclick="window.uiCore.volverDashboard()" 
                                    style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;">
                                <i class="fas fa-arrow-left"></i> Volver
                            </button>
                        </div>
                    </div>

                    ${pasoActual ? `
                        <div style="
                            background: ${pasoActual.completado ? 'var(--success)05' : 'var(--white)'};
                            border-radius: 12px;
                            padding: 16px 20px;
                            border-left: 4px solid ${pasoActual.completado ? 'var(--success)' : (pasoActual.color || 'var(--primary)')};
                            cursor: ${pasoActual.completado ? 'default' : 'pointer'};
                            transition: all 0.3s;
                            margin-bottom: 16px;
                            box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                        "
                        ${!pasoActual.completado ? `onclick="window.LearningPath?.ejecutarPasoActual()"` : ''}>
                            <div style="display:flex;align-items:center;gap:12px;">
                                <span style="font-size:28px;">${pasoActual.completado ? '✅' : (pasoActual.icono || '📌')}</span>
                                <div style="flex:1;">
                                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                                        <span style="font-size:16px;font-weight:700;color:${pasoActual.completado ? 'var(--success)' : 'var(--dark)'};">
                                            ${pasoActual.titulo || pasoActual.nombre || pasoActual.tema || 'Paso sin título'}
                                        </span>
                                        <span style="font-size:9px;background:${pasoActual.color || 'var(--primary)'}20;color:${pasoActual.color || 'var(--primary)'};padding:1px 10px;border-radius:10px;font-weight:600;">
                                            ${pasoActual.tipo || 'general'}
                                        </span>
                                        ${pasoActual.completado ? `
                                            <span style="font-size:8px;color:var(--success);">✅ Completado</span>
                                        ` : `
                                            <span style="font-size:8px;color:var(--primary);">${pasoActual.porcentaje || 0}%</span>
                                        `}
                                    </div>
                                    <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">${pasoActual.descripcion || ''}</p>
                                    ${!pasoActual.completado && pasoActual.porcentaje > 0 ? `
                                        <div style="margin-top:6px;height:4px;background:var(--bg);border-radius:2px;overflow:hidden;max-width:200px;">
                                            <div style="height:100%;width:${pasoActual.porcentaje}%;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:2px;transition:width 0.8s ease;"></div>
                                        </div>
                                    ` : ''}
                                </div>
                                ${!pasoActual.completado ? `
                                    <button class="btn-primary" onclick="window.LearningPath?.ejecutarPasoActual()" 
                                            style="padding:6px 16px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;white-space:nowrap;">
                                        <i class="fas fa-play"></i> Ir
                                    </button>
                                ` : `
                                    <span style="font-size:11px;color:var(--success);font-weight:600;">✅ Completado</span>
                                `}
                            </div>
                        </div>
                    ` : ''}

                    ${intervenciones.length > 0 ? `
                        <div style="margin-bottom:16px;">
                            <h4 style="font-size:14px;font-weight:700;color:var(--dark);margin:0 0 8px 0;">
                                ⚠️ Intervenciones (${intervenciones.length})
                            </h4>
                            ${intervenciones.slice(0, 5).map((interv, idx) => `
                                <div style="
                                    background: var(--white);
                                    border-radius: 8px;
                                    padding: 10px 14px;
                                    margin-bottom: 6px;
                                    border-left: 3px solid ${idx === 0 ? 'var(--warning)' : 'var(--gray)'};
                                    font-size: 13px;
                                    color: var(--dark);
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    flex-wrap: wrap;
                                    gap: 8px;
                                    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
                                ">
                                    <span style="flex:1;font-size:12px;">${interv.mensaje?.substring(0, 100) || ''}${interv.mensaje?.length > 100 ? '...' : ''}</span>
                                    <button onclick="window.tutorNeuro?._mostrarIntervencionEspecifica(${intervenciones.indexOf(interv)})" 
                                            style="padding:2px 12px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;white-space:nowrap;">
                                        Ver
                                    </button>
                                </div>
                            `).join('')}
                            ${intervenciones.length > 5 ? `
                                <div style="font-size:10px;color:var(--gray-light);text-align:center;padding:4px 0;">
                                    +${intervenciones.length - 5} intervenciones más
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    ${siguienteTema && intervenciones.length === 0 ? `
                        <div style="background:var(--bg);border-radius:10px;padding:12px 16px;margin-bottom:16px;border-left:4px solid var(--primary);">
                            <div style="font-size:11px;font-weight:600;color:var(--gray);text-transform:uppercase;margin-bottom:2px;">📌 Recomendación</div>
                            <div style="font-size:14px;font-weight:600;color:var(--dark);">${siguienteTema.nombre || 'Tema'}</div>
                            <div style="font-size:12px;color:var(--gray);">Nivel ${siguienteTema.nivel || 'A1'} · Progreso: ${siguienteTema.porcentaje || 0}%</div>
                            <button class="btn-primary" onclick="window.tutorNeuro?._estudiarTemaRecomendado()" 
                                    style="margin-top:6px;padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;">
                                <i class="fas fa-play"></i> Estudiar
                            </button>
                        </div>
                    ` : ''}

                    <div style="margin-bottom:16px;">
                        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-light);margin-bottom:2px;">
                            <span>📊 Progreso de la Ruta</span>
                            <span style="font-weight:600;color:var(--primary);">${pctRuta}%</span>
                        </div>
                        <div style="height:8px;background:var(--bg);border-radius:4px;overflow:hidden;border:1px solid var(--light);">
                            <div style="height:100%;width:${pctRuta}%;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:4px;transition:width 0.8s ease;"></div>
                        </div>
                    </div>

                    ${tieneRuta && pasosConEstado.length > 0 ? `
                        <div style="margin-bottom:16px;">
                            <h4 style="font-size:13px;font-weight:700;color:var(--gray);text-transform:uppercase;margin:0 0 8px 0;">📋 Pasos de la Ruta</h4>
                            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
                                ${pasosConEstado.map((p, i) => {
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
                                        <div style="
                                            background: ${bgColor};
                                            border-radius: 8px;
                                            padding: 10px 14px;
                                            border: 1px solid ${borderColor};
                                            cursor: pointer;
                                            transition: all 0.2s ease;
                                            opacity: ${p.esCompletado ? '0.7' : '1'};
                                        "
                                        onclick="window.LearningPath?.irAlPaso(${i})"
                                        onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" 
                                        onmouseout="this.style.transform='none';this.style.boxShadow='none'"
                                        title="${tooltip} - ${pct}%"
                                        >
                                            <div style="display:flex;align-items:center;gap:8px;justify-content:space-between;">
                                                <div>
                                                    <div style="display:flex;align-items:center;gap:4px;font-size:13px;font-weight:${p.esActivo ? '700' : '400'};color:${textColor};">
                                                        ${estadoEmoji} ${tooltip}
                                                        ${p.esActivo ? ' ◀' : ''}
                                                    </div>
                                                    ${!p.esCompletado && pct > 0 ? `
                                                        <div style="margin-top:4px;height:3px;background:var(--bg);border-radius:2px;overflow:hidden;max-width:100px;">
                                                            <div style="height:100%;width:${pct}%;background:${p.esActivo ? 'var(--primary)' : 'var(--gray-light)'};border-radius:2px;"></div>
                                                        </div>
                                                    ` : ''}
                                                </div>
                                                ${p.esActivo && !p.esCompletado ? `
                                                    <button class="btn-primary" onclick="event.stopPropagation();window.LearningPath?.ejecutarPasoActual()" 
                                                            style="padding:2px 10px;font-size:10px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;">
                                                        Ir
                                                    </button>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div style="background:var(--bg);border-radius:10px;padding:12px 16px;border:1px solid var(--light);">
                        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--gray);flex-wrap:wrap;gap:4px;">
                            <span>🧠 Modo: <strong style="color:${modoColor};">${tutorInfo?.nombre || 'Flexible'}</strong></span>
                            <span>📚 Pasos: <strong>${completados}/${totalPasos}</strong></span>
                            <span>🗺️ Progreso: <strong>${mapaProgreso}%</strong></span>
                            <span>${vigiaOnline ? '🟢 Vigía Online' : '🔴 Vigía Offline'}</span>
                        </div>
                    </div>
                </div>
            `;

            console.log('✅ Tutor NeuroAdaptativo renderizado correctamente');
        } catch (e) {
            console.error('❌ Error renderizando tutor:', e);
            container.innerHTML = this._getCargandoTutorHTML();
        }
    }

    // ============================================================
    // RENDERIZAR GENERADOR DIRECTO (SIN DEPENDER DE UIDashboard)
    // ============================================================

    _renderizarGeneradorDirecto() {
        const container = document.getElementById('tutorGeneradorContainer');
        
        if (!container) {
            console.warn('⚠️ Contenedor del generador no encontrado');
            // Intentar crear el contenedor
            const content = document.getElementById('tutorGeneradorContent');
            if (content) {
                const newContainer = document.createElement('div');
                newContainer.id = 'tutorGeneradorContainer';
                content.appendChild(newContainer);
                setTimeout(() => this._renderizarGeneradorDirecto(), 100);
            }
            return;
        }

        try {
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            const esJeroglifico = this._esJeroglifico(idiomaActivo);
            const nombreIdioma = this._getNombreIdioma(idiomaActivo);
            const nivelActual = this._obtenerNivelUsuario();
            const idiomaNativo = this._obtenerIdiomaNativo();

            container.innerHTML = `
                <div style="padding:16px;max-width:900px;margin:0 auto;">
                    <!-- HEADER -->
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:16px 20px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:14px;border:2px solid var(--primary)20;">
                        <div>
                            <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                                🧠 Generador NeuroAdaptativo
                            </h2>
                            <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                                Genera contenido personalizado con <strong>metodología neurocognitiva</strong> para potenciar tu aprendizaje
                            </p>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            <span style="font-size:11px;padding:4px 14px;background:var(--primary)15;color:var(--primary);border-radius:12px;font-weight:600;">
                                🎯 ${nivelActual}
                            </span>
                            <span style="font-size:11px;padding:4px 14px;background:var(--secondary)15;color:var(--secondary);border-radius:12px;font-weight:600;">
                                ${nombreIdioma}
                            </span>
                            <span style="font-size:11px;padding:4px 14px;background:var(--bg);color:var(--gray);border-radius:12px;">
                                🎤 ${this._getNombreIdioma(idiomaNativo)}
                            </span>
                            <button class="btn-primary" onclick="window.uiCore.volverDashboard()" 
                                    style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;">
                                <i class="fas fa-arrow-left"></i> Volver
                            </button>
                        </div>
                    </div>

                    <div style="display:grid;grid-template-columns:2fr 1fr;gap:14px;margin-bottom:12px;">
                        <div>
                            <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                                📝 Tema
                            </label>
                            <input type="text" id="jsonTemaInput" 
                                   placeholder="Ej: aventuras en la ciudad, mi familia, viajes..." 
                                   style="width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:10px;font-size:14px;font-family:var(--font);transition:all 0.3s;"
                                   onfocus="this.style.borderColor='var(--primary)'" 
                                   onblur="this.style.borderColor='var(--light)'">
                        </div>
                        <div>
                            <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                                🔢 Número de historias
                            </label>
                            <input type="number" id="jsonNumInput" value="3" min="1" max="10"
                                   style="width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:10px;font-size:14px;font-family:var(--font);transition:all 0.3s;"
                                   onfocus="this.style.borderColor='var(--primary)'" 
                                   onblur="this.style.borderColor='var(--light)'">
                            <span style="font-size:10px;color:var(--gray-light);">(máx. 10)</span>
                        </div>
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:12px;">
                        <button class="btn-primary" onclick="window.UIJSON?.generarJSONDesdeDashboard()" 
                                style="padding:12px 20px;font-size:15px;font-weight:700;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;transition:all 0.3s;"
                                onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" 
                                onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                            <i class="fas fa-magic"></i> Generar
                        </button>
                        <button class="btn-secondary" onclick="window.UIJSON?.generarFamiliaCaracteresDesdeDashboard()" 
                                style="padding:12px 20px;font-size:15px;font-weight:700;border:none;border-radius:10px;cursor:pointer;background:${esJeroglifico ? 'linear-gradient(135deg, #00CEC9, #81ECEC)' : 'var(--bg)'};color:${esJeroglifico ? 'white' : 'var(--gray)'};transition:all 0.3s;${!esJeroglifico ? 'opacity:0.6;cursor:not-allowed;' : ''}"
                                ${!esJeroglifico ? 'title="Solo disponible para idiomas jeroglíficos (Chino, Japonés, Coreano)"' : ''}
                                onmouseover="${esJeroglifico ? 'this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 4px 20px rgba(0,206,201,0.3)\'' : ''}" 
                                onmouseout="${esJeroglifico ? 'this.style.transform=\'none\';this.style.boxShadow=\'none\'' : ''}">
                            <i class="fas fa-characters"></i> Familia de Caracteres
                            ${!esJeroglifico ? ' 🔒' : ''}
                        </button>
                    </div>

                    <div style="margin-bottom:12px;">
                        <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                            📝 Descripción detallada <span style="font-size:11px;font-weight:400;color:var(--gray-light);">(opcional)</span>
                        </label>
                        <textarea id="jsonDescripcionInput" rows="3" 
                                  placeholder="Ej: desde que salgo de casa hasta que llego a la cafetería, todo lo que veo y escucho en el camino..."
                                  style="width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:10px;font-size:14px;font-family:var(--font);resize:vertical;transition:all 0.3s;"
                                  onfocus="this.style.borderColor='var(--primary)'" 
                                  onblur="this.style.borderColor='var(--light)'"></textarea>
                        <div style="font-size:11px;color:var(--gray-light);margin-top:4px;">
                            💡 Añade detalles para que la IA genere historias más ricas y personalizadas.
                        </div>
                    </div>

                    <div style="margin-bottom:12px;">
                        <label style="font-size:13px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                            📄 Pega aquí el JSON completado por la IA para importarlo a tu...
                        </label>
                        <div style="display:flex;gap:10px;">
                            <textarea id="jsonPasteArea" rows="4" 
                                      placeholder="Pega aquí el JSON completado por la IA para importarlo a tu Pipeline Neuro..."
                                      style="flex:1;padding:10px 14px;border:2px solid var(--light);border-radius:10px;font-size:13px;font-family:monospace;resize:vertical;transition:all 0.3s;min-height:80px;"
                                      onfocus="this.style.borderColor='var(--primary)'" 
                                      onblur="this.style.borderColor='var(--light)'"></textarea>
                            <button class="btn-success" onclick="window.UIJSON?.importarJSONDesdeDashboard()" 
                                    style="padding:12px 24px;font-size:15px;font-weight:700;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;transition:all 0.3s;align-self:flex-end;"
                                    onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(0,184,148,0.3)'" 
                                    onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                                <i class="fas fa-file-import"></i> Importar
                            </button>
                        </div>
                    </div>

                    <div style="padding:14px 18px;background:var(--bg);border-radius:10px;border:1px solid var(--light);">
                        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;font-size:12px;color:var(--gray);">
                            <span style="display:flex;align-items:center;gap:4px;">
                                <span style="font-weight:600;color:var(--dark);">🧠 Metodología neuroadaptativa:</span>
                            </span>
                            <span style="background:var(--primary)10;padding:2px 10px;border-radius:12px;color:var(--primary);">🎯 nivel dificultad</span>
                            <span style="background:var(--secondary)10;padding:2px 10px;border-radius:12px;color:var(--secondary);">🏷️ etiquetas temáticas</span>
                            <span style="background:var(--warning)10;padding:2px 10px;border-radius:12px;color:var(--warning);">🔑 palabra clave</span>
                            <span style="background:var(--info)10;padding:2px 10px;border-radius:12px;color:var(--info);">🔗 conexiones neuro</span>
                            <span style="background:var(--success)10;padding:2px 10px;border-radius:12px;color:var(--success);">🎯 objetivos de aprendizaje</span>
                            <span style="background:var(--danger)10;padding:2px 10px;border-radius:12px;color:var(--danger);">📝 ejercicios de comprensión</span>
                            <span style="background:var(--primary)10;padding:2px 10px;border-radius:12px;color:var(--primary);">📋 reglas gramaticales</span>
                        </div>
                        <div style="font-size:11px;color:var(--gray-light);margin-top:6px;">
                            💡 El Tutor NeuroAdaptativo genera contenido optimizado para tu nivel y estilo de aprendizaje
                        </div>
                    </div>
                </div>
            `;

            console.log('✅ Generador NeuroAdaptativo renderizado correctamente');
        } catch (e) {
            console.error('❌ Error renderizando generador:', e);
            container.innerHTML = this._getCargandoGeneradorHTML();
        }
    }

    // ============================================================
    // HTML DE CARGA PARA TUTOR Y GENERADOR
    // ============================================================

    _getCargandoTutorHTML() {
        return `
            <div style="text-align:center;padding:40px;color:var(--gray);">
                <i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--primary);display:block;margin-bottom:16px;"></i>
                <p style="font-size:16px;font-weight:500;">Cargando Tutor NeuroAdaptativo...</p>
                <p style="font-size:13px;color:var(--gray-light);">Preparando tu experiencia de aprendizaje personalizada</p>
                <button class="btn-primary" onclick="window.uiCore._renderizarTutorDirecto()" style="margin-top:12px;">
                    <i class="fas fa-sync"></i> Recargar
                </button>
            </div>
        `;
    }

    _getCargandoGeneradorHTML() {
        return `
            <div style="text-align:center;padding:40px;color:var(--gray);">
                <i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--primary);display:block;margin-bottom:16px;"></i>
                <p style="font-size:16px;font-weight:500;">Cargando Generador NeuroAdaptativo...</p>
                <p style="font-size:13px;color:var(--gray-light);">Preparando el generador de contenido personalizado</p>
                <button class="btn-primary" onclick="window.uiCore._renderizarGeneradorDirecto()" style="margin-top:12px;">
                    <i class="fas fa-sync"></i> Recargar
                </button>
            </div>
        `;
    }

    // ============================================================
    // CONFIGURAR EVENTOS DE IDIOMAS
    // ============================================================

    _configurarEventosIdiomas() {
        console.log('🔗 Configurando eventos de sincronización de idiomas...');
        
        window.addEventListener('idiomaCambiado', async (e) => {
            console.log('🔄 UI Core: Idioma cambiado a', e.detail?.idioma);
            this._actualizarIndicadoresSeguro();
            this._actualizarEspacioStats();
            this._actualizarBotonFamiliaCaracteres();
            this._actualizarBarraVigiaCentinela();
            this._actualizarIndicadorBalanceador();
            this._actualizarIndicadorTokens();
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this);
            }
            if (window.UIStudy) {
                window.UIStudy._renderizarFraseInteractiva();
            }
            if (window.UIConfig && window.UIConfig._recargarConfiguracion) {
                await window.UIConfig._recargarConfiguracion();
            }
            if (window.vigiaGramatical) {
                try {
                    await window.vigiaGramatical.initGramatical();
                    await window.vigiaGramatical._actualizarEdadGramatical(e.detail?.idioma);
                } catch (err) {}
            }
            if (window.SistemaCompeticiones && typeof window.SistemaCompeticiones._renderizarPanel === 'function') {
                if (this.moduloActual === 'competiciones') {
                    window.SistemaCompeticiones._renderizarPanel();
                }
            }
            if (window.UICaracteres && window.UICaracteres.estaDisponible()) {
                try {
                    await window.UICaracteres.cargar(this);
                } catch (err) {}
            }
            if (window.UIFonetica) {
                try {
                    await window.UIFonetica.cargar(this);
                } catch (err) {}
            }
        });
        
        window.addEventListener('favoritoActualizado', () => {
            this._actualizarEspacioStats();
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this);
            }
        });
        
        window.addEventListener('idiomaAgregado', async (e) => {
            console.log('🔄 UI Core: Idioma agregado', e.detail?.idioma);
            await this._recargarConfiguracionUI();
        });
        
        window.addEventListener('idiomaEliminado', async (e) => {
            console.log('🔄 UI Core: Idioma eliminado', e.detail?.idioma);
            await this._recargarConfiguracionUI();
        });
        
        window.addEventListener('nivelIdiomaCambiado', async (e) => {
            console.log('🔄 UI Core: Nivel cambiado', e.detail?.idioma, e.detail?.nivel);
            this._actualizarIndicadoresSeguro();
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this);
            }
            if (window.UIConfig && window.UIConfig._recargarConfiguracion) {
                await window.UIConfig._recargarConfiguracion();
            }
            if (window.SistemaCompeticiones && typeof window.SistemaCompeticiones._renderizarPanel === 'function') {
                if (this.moduloActual === 'competiciones') {
                    window.SistemaCompeticiones._renderizarPanel();
                }
            }
            if (window.UICaracteres && window.UICaracteres.estaDisponible()) {
                try {
                    await window.UICaracteres.cargar(this);
                } catch (err) {}
            }
            if (window.UIFonetica) {
                try {
                    await window.UIFonetica.cargar(this);
                } catch (err) {}
            }
        });
        
        window.addEventListener('vigiaGramaticalActualizado', () => {
            if (window.UIGrammar) {
                window.UIGrammar._cargarGramatica();
            }
        });
        
        console.log('✅ Eventos de sincronización configurados');
    }

    async _recargarConfiguracionUI() {
        console.log('🔄 UI Core: Recargando configuración...');
        try {
            await gestorIdiomas._cargarIdiomas();
            
            if (window.UIConfig && window.UIConfig._recargarConfiguracion) {
                await window.UIConfig._recargarConfiguracion();
            }
            
            this._actualizarIndicadoresSeguro();
            this._actualizarEspacioStats();
            this._actualizarBotonFamiliaCaracteres();
            this._actualizarBarraVigiaCentinela();
            this._actualizarIndicadorBalanceador();
            this._actualizarIndicadorTokens();
            
            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this);
            }
            
            if (window.UIStudy && this.moduloActual === 'study') {
                window.UIStudy._renderizarFraseInteractiva();
            }
            
            if (window.vigiaGramatical) {
                try {
                    await window.vigiaGramatical.initGramatical();
                } catch (err) {}
            }
            
            if (window.SistemaCompeticiones && typeof window.SistemaCompeticiones._renderizarPanel === 'function') {
                if (this.moduloActual === 'competiciones') {
                    window.SistemaCompeticiones._renderizarPanel();
                }
            }
            
            if (window.UICaracteres && window.UICaracteres.estaDisponible()) {
                try {
                    await window.UICaracteres.cargar(this);
                } catch (err) {}
            }
            
            if (window.UIFonetica) {
                try {
                    await window.UIFonetica.cargar(this);
                } catch (err) {}
            }
            
            console.log('✅ UI Core: Configuración recargada');
        } catch (e) {
            console.warn('⚠️ Error recargando configuración:', e);
        }
    }

    // ============================================================
    // MODALES
    // ============================================================

    abrirModal(titulo) {
        const modal = document.getElementById('jsonModal');
        const title = document.getElementById('jsonModalTitle');
        if (modal && title) {
            title.textContent = titulo || 'JSON';
            modal.classList.add('open');
            this.modalAbierto = true;
            console.log('📂 Modal abierto:', titulo);
        }
    }

    cerrarModal() {
        const modal = document.getElementById('jsonModal');
        if (modal) {
            modal.classList.remove('open');
            this.modalAbierto = false;
            console.log('📂 Modal cerrado');
        }
    }

    _crearModales() {
        console.log('🔧 Configurando modales...');
        
        const closeBtn = document.getElementById('jsonModalClose');
        const modal = document.getElementById('jsonModal');
        
        if (closeBtn) {
            const parent = closeBtn.parentNode;
            const newCloseBtn = document.createElement('button');
            newCloseBtn.className = 'modal-close';
            newCloseBtn.id = 'jsonModalClose';
            newCloseBtn.innerHTML = '&times;';
            newCloseBtn.setAttribute('aria-label', 'Cerrar modal');
            
            parent.replaceChild(newCloseBtn, closeBtn);
            
            newCloseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.cerrarModal();
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.cerrarModal();
                }
            });
        }
        
        if (this._escapeHandler) {
            document.removeEventListener('keydown', this._escapeHandler);
        }
        
        this._escapeHandler = (e) => {
            if (e.key === 'Escape' && this.modalAbierto) {
                this.cerrarModal();
            }
        };
        document.addEventListener('keydown', this._escapeHandler);
        
        console.log('✅ Modales configurados correctamente');
    }

    // ============================================================
    // CONFIGURAR EVENTOS GENERALES
    // ============================================================

    _configurarEventos() {
        document.querySelectorAll('.dash-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const module = card.dataset.module;
                if (module && !this._navLock) {
                    this._navLock = true;
                    this._irAModulo(module);
                    setTimeout(() => { this._navLock = false; }, 300);
                }
            });
        });
        
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this._navLock) {
                    this._navLock = true;
                    this._irADashboard();
                    setTimeout(() => { this._navLock = false; }, 300);
                }
            });
        });
        
        document.querySelectorAll('.breadcrumb-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const module = item.dataset.module;
                if (module && !this._navLock) {
                    this._navLock = true;
                    if (module === 'dashboard') {
                        this._irADashboard();
                    } else {
                        this._irAModulo(module);
                    }
                    setTimeout(() => { this._navLock = false; }, 300);
                }
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modalAbierto) {
                if (this.moduloActual !== 'dashboard' && !this._navLock) {
                    this._navLock = true;
                    this._irADashboard();
                    setTimeout(() => { this._navLock = false; }, 300);
                }
            }
        });
        
        window.addEventListener('toast', (e) => {
            this.mostrarToast(e.detail.mensaje, e.detail.tipo);
        });
        
        window.addEventListener('modoOffline', (e) => {
            this._mostrarOfflineBanner(e.detail);
        });
        
        window.addEventListener('modoOnline', () => {
            this._ocultarOfflineBanner();
            this._actualizarIndicadoresSeguro();
            this._actualizarBarraVigiaCentinela();
            this._actualizarIndicadorBalanceador();
            this._actualizarIndicadorTokens();
        });
        
        window.addEventListener('vigiaEstado', () => {
            this._actualizarIndicadoresSeguro();
            this._actualizarBarraVigiaCentinela();
            this._actualizarIndicadorBalanceador();
            this._actualizarIndicadorTokens();
        });
        
        window.addEventListener('cambioNivel', () => {
            if (window.UIConfig) window.UIConfig._actualizarNivelHeader(this);
            if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this);
        });

        window.addEventListener('modoInversoChange', () => {
            this._actualizarModoInversoBtn();
            if (window.UIStudy) {
                window.UIStudy._renderizarFraseInteractiva();
            }
        });
        
        window.addEventListener('actividadActualizada', () => {
            this._actualizarBarraVigiaCentinela();
        });
        
        window.addEventListener('balanceadorModeloCambiado', (e) => {
            console.log('⚖️ Evento balanceadorModeloCambiado:', e.detail.modelo);
            this._actualizarIndicadorBalanceador();
        });
        
        window.addEventListener('balanceadorEstadoActualizado', () => {
            this._actualizarIndicadorBalanceador();
        });
    }

    // ============================================================
    // ACTUALIZAR INDICADORES
    // ============================================================

    _actualizarIndicadoresSeguro() {
        if (this._actualizandoIndicadores) return;
        this._actualizandoIndicadores = true;
        
        try {
            const vigiaDot = document.getElementById('vigiaDot');
            const vigiaStatus = document.getElementById('vigiaStatus');
            if (vigiaDot) {
                const enLinea = window.vigia ? window.vigia.enLinea : false;
                vigiaDot.className = 'vigia-dot ' + (enLinea ? 'online' : 'offline');
                if (vigiaStatus) {
                    vigiaStatus.textContent = enLinea ? '● Online' : '● Offline';
                    vigiaStatus.className = 'vigia-status ' + (enLinea ? 'online' : 'offline');
                }
            }
            
            const centinelaDot = document.getElementById('centinelaDot');
            const centinelaStatus = document.getElementById('centinelaStatus');
            if (centinelaDot) {
                const centinelaObj = window.centinela || {};
                const estado = centinelaObj.estadoSalud || 'optimo';
                const modoOffline = centinelaObj.modoOffline || false;
                
                centinelaDot.className = 'centinela-dot';
                if (modoOffline) {
                    centinelaDot.classList.add('offline');
                    if (centinelaStatus) {
                        centinelaStatus.textContent = '● Offline';
                        centinelaStatus.className = 'centinela-status offline';
                    }
                } else if (estado === 'optimo') {
                    centinelaDot.classList.add('activo');
                    if (centinelaStatus) {
                        centinelaStatus.textContent = '● Activo';
                        centinelaStatus.className = 'centinela-status activo';
                    }
                } else if (estado === 'fatiga' || estado === 'bajo_rendimiento') {
                    centinelaDot.classList.add('fatiga');
                    if (centinelaStatus) {
                        centinelaStatus.textContent = '● Fatiga';
                        centinelaStatus.className = 'centinela-status fatiga';
                    }
                } else if (estado === 'estancado') {
                    centinelaDot.classList.add('fatiga');
                    if (centinelaStatus) {
                        centinelaStatus.textContent = '● Estancado';
                        centinelaStatus.className = 'centinela-status fatiga';
                    }
                } else {
                    centinelaDot.classList.add('activo');
                    if (centinelaStatus) {
                        centinelaStatus.textContent = '● Activo';
                        centinelaStatus.className = 'centinela-status activo';
                    }
                }
            }
            
            this._actualizarIndicadorBalanceador();
            this._actualizarIndicadorTokens();
            
        } catch (e) {
            console.warn('⚠️ Error actualizando indicadores:', e);
        } finally {
            this._actualizandoIndicadores = false;
        }
    }

    actualizarIndicadores() {
        this._actualizarIndicadoresSeguro();
    }

    // ============================================================
    // ACTIVIDAD
    // ============================================================

    _iniciarActividad() {
        if (this._activityInterval) clearInterval(this._activityInterval);
        this._activityInterval = setInterval(() => {
            this._actualizarActividad();
        }, 1500);
        this._actualizarActividad();
    }

    _actualizarActividad() {
        try {
            if (window.UIDashboard && typeof window.UIDashboard._actualizarActividad === 'function') {
                window.UIDashboard._actualizarActividad(this);
                return;
            }
            
            const vigiaOnline = window.vigia ? window.vigia.enLinea : false;
            const vigiaTurnos = window.vigia ? window.vigia.turnosSinEscaneo : 0;
            const vigiaEscaneando = window.vigia ? window.vigia.escaneoActivo : false;

            let tokenData = null;
            let tokenPct = 0;
            let tokenEstado = 'normal';
            let tokenColor = 'var(--success)';
            let tokenRestantes = 'N/A';
            let tiempoReinicio = '';

            if (window.vigia && typeof window.vigia.obtenerEstadoTokens === 'function') {
                tokenData = window.vigia.obtenerEstadoTokens();
                tokenPct = tokenData.diario?.porcentaje || 0;
                tokenEstado = tokenData.estado || 'normal';
                tokenColor = tokenData.color || 'var(--success)';
                tokenRestantes = tokenData.diario?.tokensRestantes 
                    ? Math.round(tokenData.diario.tokensRestantes / 1000) + 'K' 
                    : 'N/A';
                tiempoReinicio = tokenData.tiempoReinicio || '';
            }

            let vigiaActivity = 0;
            let vigiaStatus = 'offline';
            let vigiaStatusText = 'Offline';

            if (vigiaOnline) {
                const baseActivity = 60 + Math.random() * 10;
                
                if (tokenPct >= 95) {
                    vigiaActivity = 5 + Math.random() * 5;
                    vigiaStatus = 'critico';
                    vigiaStatusText = `⚠️ ${tokenPct}% (${tokenRestantes})`;
                } else if (tokenPct >= 80) {
                    vigiaActivity = 20 + Math.random() * 15;
                    vigiaStatus = 'alto';
                    vigiaStatusText = `🟠 ${tokenPct}% (${tokenRestantes})`;
                } else if (tokenPct >= 60) {
                    vigiaActivity = 40 + Math.random() * 20;
                    vigiaStatus = 'medio';
                    vigiaStatusText = `🟡 ${tokenPct}% (${tokenRestantes})`;
                } else {
                    vigiaActivity = 80 + Math.random() * 15;
                    vigiaStatus = 'online';
                    vigiaStatusText = `🟢 ${tokenPct}% (${tokenRestantes})`;
                }
                
                if (vigiaEscaneando) {
                    vigiaActivity = 95 + Math.random() * 5;
                    vigiaStatus = 'busy';
                    vigiaStatusText = '🔍 Escaneando...';
                }
            } else {
                vigiaActivity = 5 + Math.random() * 5;
                vigiaStatus = 'offline';
                vigiaStatusText = '🔴 Offline';
            }

            const vigiaBar = document.getElementById('vigiaActivityBar');
            const vigiaValue = document.getElementById('vigiaActivityValue');
            const vigiaDot = document.getElementById('vigiaActivityDot');
            const vigiaTooltip = document.getElementById('vigiaTooltip');

            if (vigiaBar) {
                const pct = Math.min(100, Math.round(vigiaActivity));
                vigiaBar.style.width = pct + '%';
                vigiaBar.className = 'activity-bar-fill vigia ' + vigiaStatus;
                
                if (vigiaOnline) {
                    if (tokenPct >= 95) {
                        vigiaBar.style.background = 'linear-gradient(90deg, #FF7675, #e74c3c)';
                    } else if (tokenPct >= 80) {
                        vigiaBar.style.background = 'linear-gradient(90deg, #FDCB6E, #E17055)';
                    } else if (tokenPct >= 60) {
                        vigiaBar.style.background = 'linear-gradient(90deg, #FDCB6E, #F9CA24)';
                    } else {
                        vigiaBar.style.background = 'linear-gradient(90deg, #6C5CE7, #00CEC9)';
                    }
                } else {
                    vigiaBar.style.background = 'var(--danger)';
                }
            }
            if (vigiaValue) vigiaValue.textContent = Math.round(vigiaActivity) + '%';
            if (vigiaDot) vigiaDot.className = 'activity-status-dot ' + vigiaStatus;
            if (vigiaTooltip) {
                let tooltip = `Vigía: ${vigiaStatusText}`;
                if (vigiaOnline && tokenData) {
                    tooltip += ` | Tokens: ${tokenPct}% (${tokenRestantes} restantes)`;
                    tooltip += ` | Reinicio: ${tiempoReinicio}`;
                }
                vigiaTooltip.textContent = tooltip;
            }

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

            const centinelaBar = document.getElementById('centinelaActivityBar');
            const centinelaValue = document.getElementById('centinelaActivityValue');
            const centinelaDot = document.getElementById('centinelaActivityDot');
            const centinelaTooltip = document.getElementById('centinelaTooltip');

            if (centinelaBar) {
                centinelaBar.style.width = Math.min(100, Math.round(centinelaActivity)) + '%';
                centinelaBar.className = 'activity-bar-fill centinela ' + centinelaStatus;
            }
            if (centinelaValue) centinelaValue.textContent = Math.round(centinelaActivity) + '%';
            if (centinelaDot) centinelaDot.className = 'activity-status-dot ' + centinelaStatus;
            if (centinelaTooltip) {
                centinelaTooltip.textContent = 'Centinela: ' + centinelaStatusText + ' | Actividad: ' + Math.round(centinelaActivity) + '%';
            }

            if (window.UIDashboard) {
                window.UIDashboard._vigiaActivity = vigiaActivity;
                window.UIDashboard._centinelaActivity = centinelaActivity;
            }

            window.dispatchEvent(new CustomEvent('actividadActualizada', {
                detail: {
                    vigia: { activity: vigiaActivity, status: vigiaStatus },
                    centinela: { activity: centinelaActivity, status: centinelaStatus }
                }
            }));

        } catch (e) {
            console.warn('⚠️ Error actualizando actividad:', e);
        }
    }

    // ============================================================
    // OFFLINE BANNER
    // ============================================================

    _mostrarOfflineBanner(detail) {
        const banner = document.getElementById('offlineBanner');
        const message = document.getElementById('offlineMessage');
        const timer = document.getElementById('offlineTimer');
        if (banner) {
            banner.style.display = 'flex';
            if (message) message.textContent = detail.razon || 'Modo offline';
            if (timer && detail.duracion) {
                const segundos = Math.round(detail.duracion / 1000);
                timer.textContent = segundos + 's';
                let contador = segundos;
                const interval = setInterval(() => {
                    contador--;
                    if (contador <= 0) {
                        clearInterval(interval);
                        this._ocultarOfflineBanner();
                    } else {
                        if (timer) timer.textContent = contador + 's';
                    }
                }, 1000);
            }
        }
    }

    _ocultarOfflineBanner() {
        const banner = document.getElementById('offlineBanner');
        if (banner) banner.style.display = 'none';
    }

    // ============================================================
    // COLOR DE FAMILIA
    // ============================================================

    _getColorFamilia(familia) {
        const colores = {
            'verbo': '#6C5CE7', 'verbos': '#6C5CE7',
            'verbos de movimiento': '#6C5CE7', 'verbos de acción': '#6C5CE7',
            'verbos de deseo': '#6C5CE7', 'verbos de comunicación': '#6C5CE7',
            'sustantivo': '#00B894', 'sustantivos': '#00B894',
            'adjetivo': '#FDCB6E', 'adjetivos': '#FDCB6E',
            'adverbio': '#74B9FF', 'adverbios': '#74B9FF',
            'preposición': '#FF7675', 'preposiciones': '#FF7675',
            'conjunción': '#A29BFE', 'conjunciones': '#A29BFE',
            'pronombres': '#55EFC4', 'pronombre': '#55EFC4',
            'tiempo': '#0984E3',
            'comida y bebida': '#E17055', 'comida': '#E17055',
            'profesiones': '#6C5CE7', 'personas': '#6C5CE7',
            'medidas': '#00CEC9', 'clasificador': '#00CEC9',
            'gramática': '#636E72', 'partícula': '#636E72',
            'expresiones': '#FDCB6E', 'conectores': '#74B9FF',
            'sentidos': '#FD79A8', 'cualidades': '#FD79A8',
            'dinero': '#00B894', 'hogar': '#6C5CE7',
            'lugares': '#0984E3', 'sin_clasificar': '#DFE6E9'
        };
        return colores[familia] || '#6C5CE7';
    }

    // ============================================================
    // CARGAR DASHBOARD INICIAL
    // ============================================================

    async _cargarDashboardInicial() {
        if (window.UIDashboard) {
            await window.UIDashboard.cargar(this);
        }
    }

    // ============================================================
    // BARRA VIGÍA + CENTINELA + BALANCEADOR
    // ============================================================

    _renderizarBarraVigiaCentinela() {
        let container = document.getElementById('vigiaCentinelaContainer');
        if (!container) {
            const header = document.querySelector('.header-content');
            if (!header) return;
            
            container = document.createElement('div');
            container.id = 'vigiaCentinelaContainer';
            container.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 2px;
                padding: 3px 6px;
                background: var(--bg);
                border-radius: 6px;
                border: 1px solid var(--light);
                min-width: clamp(60px, 15vw, 180px);
                max-width: 200px;
                flex: 1;
                flex-shrink: 0;
            `;
            header.appendChild(container);
        }

        const existingIndicator = document.getElementById('balanceadorModeloIndicator');
        let indicatorHTML = '';
        if (existingIndicator) {
            indicatorHTML = existingIndicator.outerHTML;
        }

        let tokenPct = 0;
        let tokenColor = 'var(--success)';
        let tokenEstado = 'normal';
        let tokenRestantes = 'N/A';
        let tiempoReinicio = '';

        if (window.vigia && typeof window.vigia.obtenerEstadoTokens === 'function') {
            const tokenData = window.vigia.obtenerEstadoTokens();
            tokenPct = tokenData.diario?.porcentaje || 0;
            tokenColor = tokenData.color || 'var(--success)';
            tokenEstado = tokenData.estado || 'normal';
            tokenRestantes = tokenData.diario?.tokensRestantes 
                ? Math.round(tokenData.diario.tokensRestantes / 1000) + 'K' 
                : 'N/A';
            tiempoReinicio = tokenData.tiempoReinicio || '';
        }

        const vigiaOnline = window.vigia?.enLinea || false;
        const vigiaActivity = this._vigiaActivity || 0;
        const centinelaActivity = this._centinelaActivity || 0;
        
        const centinelaObj = window.centinela || {};
        const estadoSalud = centinelaObj.estadoSalud || 'optimo';
        const modoOffline = centinelaObj.modoOffline || false;
        const neuroFatiga = centinelaObj.contadores?.neuroFatiga || 0;
        
        const vigiaPct = Math.min(100, Math.round(vigiaActivity || 0));
        const centinelaPct = Math.min(100, Math.round(centinelaActivity || 0));
        
        const vigiaColor = vigiaOnline ? 
            (tokenPct >= 95 ? '#FF7675' : 
             tokenPct >= 80 ? '#E17055' : 
             tokenPct >= 60 ? '#FDCB6E' : '#6C5CE7') : 
            '#FF7675';
        const centinelaColor = modoOffline ? '#FF7675' : 
                              estadoSalud === 'critico' ? '#FF7675' :
                              estadoSalud === 'fatiga' ? '#FDCB6E' :
                              estadoSalud === 'bajo_rendimiento' ? '#E17055' :
                              '#00B894';
        
        const vigiaIcono = vigiaOnline ? 
            (tokenPct >= 95 ? '🔴' : 
             tokenPct >= 80 ? '🟠' : 
             tokenPct >= 60 ? '🟡' : '🟢') : 
            '🔴';
        const centinelaIcono = modoOffline ? '🔴' : 
                               estadoSalud === 'critico' ? '🚨' :
                               estadoSalud === 'fatiga' ? '🧠' :
                               estadoSalud === 'bajo_rendimiento' ? '📉' :
                               '🛡️';

        const diferencia = Math.abs(vigiaPct - centinelaPct);
        let estadoEquilibrio = '⚖️ Equilibrado';
        let equilibrioColor = 'var(--success)';
        if (diferencia > 30) {
            estadoEquilibrio = vigiaPct > centinelaPct ? '📡 Vigía dominante' : '🛡️ Centinela dominante';
            equilibrioColor = 'var(--warning)';
        }
        if (diferencia > 50) {
            estadoEquilibrio = vigiaPct > centinelaPct ? '🚀 Vigía sobrecargado' : '🛡️ Centinela sobrecargado';
            equilibrioColor = 'var(--danger)';
        }

        if (vigiaOnline && tokenPct > 0) {
            estadoEquilibrio += ` 🪙${tokenPct}%`;
        }

        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:${this._isSmallMobile ? '7px' : '8px'};color:var(--gray-light);">
                <span>🔗 Vigía vs Centinela</span>
                <span style="font-size:${this._isSmallMobile ? '6px' : '7px'};color:${equilibrioColor};">
                    ${estadoEquilibrio}
                </span>
            </div>
            <div style="display:flex;gap:2px;align-items:center;height:${this._isSmallMobile ? '5px' : '6px'};background:var(--light);border-radius:3px;overflow:hidden;position:relative;">
                <div style="height:100%;width:${vigiaPct}%;background:${vigiaColor};border-radius:2px 0 0 2px;transition:width 1s ease;position:relative;z-index:2;min-width:${vigiaPct > 0 ? '3px' : '0'};">
                    ${vigiaPct > 15 ? `<span style="position:absolute;right:2px;top:50%;transform:translateY(-50%);font-size:5px;color:white;font-weight:700;text-shadow:0 0 2px rgba(0,0,0,0.3);">${vigiaPct}%</span>` : ''}
                    ${vigiaOnline && tokenPct >= 80 ? `<span style="position:absolute;left:2px;top:50%;transform:translateY(-50%);font-size:4px;color:white;font-weight:700;text-shadow:0 0 2px rgba(0,0,0,0.3);">⚠️</span>` : ''}
                </div>
                ${vigiaPct > 5 && centinelaPct > 5 ? `
                    <div style="width:2px;height:100%;background:var(--white);z-index:3;flex-shrink:0;"></div>
                ` : ''}
                <div style="height:100%;width:${centinelaPct}%;background:${centinelaColor};border-radius:0 2px 2px 2px;transition:width 1s ease;position:relative;z-index:2;margin-left:${vigiaPct > 5 && centinelaPct > 5 ? '0' : 'auto'};min-width:${centinelaPct > 0 ? '3px' : '0'};">
                    ${centinelaPct > 15 ? `<span style="position:absolute;left:2px;top:50%;transform:translateY(-50%);font-size:5px;color:white;font-weight:700;text-shadow:0 0 2px rgba(0,0,0,0.3);">${centinelaPct}%</span>` : ''}
                </div>
                <div style="position:absolute;top:-3px;left:${Math.min(95, Math.max(5, (vigiaPct + centinelaPct) / 2))}%;transform:translateX(-50%);z-index:4;font-size:8px;opacity:0.8;">
                    ${diferencia < 10 ? '⚖️' : vigiaPct > centinelaPct ? '📡' : '🛡️'}
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:${this._isSmallMobile ? '6px' : '7px'};color:var(--gray-light);margin-top:1px;">
                <span>${vigiaIcono} ${vigiaPct}% ${vigiaOnline ? (tokenPct >= 95 ? '⚠️' : '🟢') : '🔴'} ${tokenPct > 0 ? `🪙${tokenPct}%` : ''}</span>
                <span style="color:${centinelaColor};">${centinelaIcono} ${centinelaPct}%</span>
                <span style="font-size:6px;color:var(--gray-light);">Fatiga: ${Math.round(neuroFatiga * 100)}%</span>
                ${vigiaOnline && tokenRestantes !== 'N/A' ? `<span style="font-size:6px;color:var(--gray-light);">${tokenRestantes}</span>` : ''}
            </div>
        `;

        if (indicatorHTML) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = indicatorHTML;
            const indicatorElement = tempDiv.firstElementChild;
            if (indicatorElement) {
                container.appendChild(indicatorElement);
                this._indicadorModelo = {
                    dot: document.getElementById('balanceadorStatusDot'),
                    nombre: document.getElementById('balanceadorModeloNombre'),
                    estado: document.getElementById('balanceadorModeloEstado')
                };
                this._actualizarIndicadorBalanceador();
                this._indicadorCreado = true;
                this._intentosCreacionIndicador = 0;
            }
        } else {
            this._crearIndicadorBalanceador();
        }
    }

    _actualizarBarraVigiaCentinela() {
        const container = document.getElementById('vigiaCentinelaContainer');
        if (container) {
            this._renderizarBarraVigiaCentinela();
        } else {
            this._renderizarBarraVigiaCentinela();
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
}

window.uiCore = new UICore();
window.ui = window.uiCore;

console.log('✅ UI Core v18.22 - COMPLETO Y CORREGIDO');
console.log('  🔥 Renderizado directo de tutor y generador SIN depender de UIDashboard');
console.log('  🔥 _renderizarTutorDirecto() - contenido completo');
console.log('  🔥 _renderizarGeneradorDirecto() - contenido completo');
console.log('  🔥 Todas las funcionalidades originales preservadas');