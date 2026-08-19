// ============================================================
// VIGÍA v22.3 - COMPLETO SIN HEALTH CHECKS
// ============================================================

class Vigia {
    constructor() {
        this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
        this.modelo = 'openai/gpt-oss-120b';
        this.apiKey = null;
        this.enLinea = false;
        this.historialChat = [];
        this.duplicadosCache = new Set();
        this.escaneoActivo = false;
        this.turnosSinEscaneo = 0;
        this.neuroContexto = [];
        this._initDone = false;
        this._reconectando = false;
        this._fallosConsecutivos = 0;
        this._maxFallosAntesReconexion = 3;
        this._healthCheckInterval = null;
        this._ultimaPeticionExitosa = Date.now();
        this._reconexionIntentos = 0;
        this._maxReconexionIntentos = 3;
        this._offlineDesde = 0;
        this._verificandoConexion = false;
        this._fetchTimeout = 15000;
        this._reconexionBackoff = 30000;
        this._apiKeyValidada = false;
        this._ultimaVerificacionApiKey = 0;
        this._tiempoEntreVerificaciones = 60000;
        this._feedbackHabilitado = true;
        this._feedbackInterval = null;
        this._ultimoFeedback = 0;
        this._feedbackPendiente = [];
        this._toastActivo = false;
        this._perfilUsuario = null;
        this._variacionesValidas = [];
        this._patronesUsuarios = [];
        this._confianza = 0.5;
        this._usuarioId = null;
        
        // ============================================================
        // BALANCEADOR DE CARGA GROQ
        // ============================================================
        this._balanceador = window.balanceadorGroq || null;
        this._usandoBalanceador = false;
        this._modeloUsadoEnPeticion = null;
        this._balanceadorFallback = false;
        
        // ============================================================
        // MONITOREO DE TOKENS
        // ============================================================
        this._limitesTokens = {
            diario: 150000,
            porMinuto: 20000,
            peticionesPorMinuto: 20
        };
        this._tokensUsados = {
            diario: 0,
            porMinuto: 0,
            ultimoResetMinuto: Date.now(),
            peticionesMinuto: 0,
            ultimoResetPeticiones: Date.now()
        };
        this._ultimoResetDiario = new Date().toDateString();
        this._alertaLimiteMostrada = false;
        this._alertaPeticionesMostrada = false;
        this._tokensRestantesMostrados = 0;
        
        // ============================================================
        // IDIOMAS Y TRANSCRIPCIÓN
        // ============================================================
        this._idiomaNativo = 'es';
        this._idiomaObjetivo = 'es';
        
        this._palabrasPorIdioma = {
            'zh': { 'A1': 150, 'A2': 300, 'B1': 600, 'B2': 1200, 'C1': 2500, 'C2': 5000 },
            'chino': { 'A1': 150, 'A2': 300, 'B1': 600, 'B2': 1200, 'C1': 2500, 'C2': 5000 },
            'chinese': { 'A1': 150, 'A2': 300, 'B1': 600, 'B2': 1200, 'C1': 2500, 'C2': 5000 },
            'mandarín': { 'A1': 150, 'A2': 300, 'B1': 600, 'B2': 1200, 'C1': 2500, 'C2': 5000 },
            'mandarin': { 'A1': 150, 'A2': 300, 'B1': 600, 'B2': 1200, 'C1': 2500, 'C2': 5000 },
            'ja': { 'A1': 800, 'A2': 1500, 'B1': 3000, 'B2': 6000, 'C1': 10000, 'C2': 20000 },
            'japonés': { 'A1': 800, 'A2': 1500, 'B1': 3000, 'B2': 6000, 'C1': 10000, 'C2': 20000 },
            'japanese': { 'A1': 800, 'A2': 1500, 'B1': 3000, 'B2': 6000, 'C1': 10000, 'C2': 20000 },
            'ko': { 'A1': 800, 'A2': 1500, 'B1': 3000, 'B2': 6000, 'C1': 10000, 'C2': 20000 },
            'coreano': { 'A1': 800, 'A2': 1500, 'B1': 3000, 'B2': 6000, 'C1': 10000, 'C2': 20000 },
            'korean': { 'A1': 800, 'A2': 1500, 'B1': 3000, 'B2': 6000, 'C1': 10000, 'C2': 20000 },
            'es': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'español': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'spanish': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'en': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'inglés': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'english': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'fr': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'francés': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'french': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'de': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'alemán': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'german': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'it': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'italiano': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'italian': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'pt': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'portugués': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'portuguese': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'ru': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'ruso': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'russian': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 },
            'default': { 'A1': 500, 'A2': 1000, 'B1': 2000, 'B2': 4000, 'C1': 8000, 'C2': 16000 }
        };
        this._palabrasOpcionalesBase = {
            'es': ['yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'me', 'te', 'se', 'nos', 'os', 'lo', 'la', 'los', 'las', 'mi', 'tu', 'su', 'nuestro', 'vuestro'],
            'en': ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'the', 'a', 'an', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'our', 'their'],
            'zh': ['我', '你', '他', '她', '我们', '你们', '他们', '她们', '的', '了', '在', '是', '有', '和', '与', '这', '那', '一', '不', '也', '都', '很'],
            'ja': ['私', 'あなた', '彼', '彼女', '私たち', 'あなたたち', '彼ら', '彼女たち', 'の', 'が', 'を', 'に', 'へ', 'と', 'で', 'から', 'まで', 'これ', 'それ', 'あれ', '一', '不', 'も', 'は'],
            'ko': ['나', '너', '그', '그녀', '우리', '너희', '그들', '그녀들', '의', '을', '를', '에', '와', '과', '에서', '까지', '이', '그', '저', '하나', '안', '도', '은', '는']
        };
        this._palabrasOpcionales = JSON.parse(JSON.stringify(this._palabrasOpcionalesBase));
        this._IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
    }

    // ============================================================
    // VERIFICAR SI ES JEROGLÍFICO
    // ============================================================

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._IDIOMAS_JEROGLIFICOS.some(item => 
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
    }

    // ============================================================
    // OBTENER IDIOMA NATIVO DEL USUARIO
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
    // INICIALIZACIÓN (SIN HEALTH CHECKS)
    // ============================================================

    async init() {
        if (this._initDone) return this;
        console.log('🔄 Vigía v22.3: Inicializando (SIN HEALTH CHECKS)...');
        
        try {
            // Inicializar balanceador si está disponible
            if (window.balanceadorGroq) {
                this._balanceador = window.balanceadorGroq;
                if (!this._balanceador._initDone) {
                    await this._balanceador.init();
                }
                console.log('⚖️ Vigía: Balanceador de carga integrado');
            }

            this.apiKey = localStorage.getItem('pipeline_api_key');
            if (!this.apiKey && db) {
                try {
                    this.apiKey = await db.obtenerApiKey();
                    if (this.apiKey) localStorage.setItem('pipeline_api_key', this.apiKey);
                } catch (e) { console.warn('⚠️ Error obteniendo API Key de DB:', e); }
            }
            
            // Cargar límites de tokens desde configuración
            this._cargarLimitesTokens();
            
            if (this.apiKey) {
                this._apiKeyValidada = await this._validarApiKey();
                this.enLinea = this._apiKeyValidada;
                if (this.enLinea) {
                    this._ultimoResetDiario = new Date().toDateString();
                }
            } else {
                console.warn('⚠️ Vigía: No hay API Key');
                this.enLinea = false;
            }
        } catch (e) {
            console.error('❌ Vigía: Error en init:', e);
            this.enLinea = false;
        }
        
        await this._obtenerIdiomaNativo();
        await this._cargarPerfilUsuario();
        this._initDone = true;
        
        // 🔥 NO SE INICIAN HEALTH CHECKS NI FEEDBACK PROACTIVO
        // this._iniciarHealthCheck();  // ELIMINADO
        // this._iniciarFeedbackProactivo(); // ELIMINADO
        
        // Registrar eventos del balanceador
        this._registrarEventosBalanceador();
        
        console.log('📡 Vigía:', this.enLinea ? '🟢 Conectado' : '🔴 Desconectado');
        console.log(`   🌍 Nativo: ${this._idiomaNativo}`);
        console.log(`   ⚖️ Modelo activo: ${this._balanceador?.getModeloActivo() || this.modelo}`);
        console.log(`   🪙 Límite diario: ${this._limitesTokens.diario} tokens`);
        console.log(`   🔥 Health Checks: DESACTIVADOS (sin peticiones automáticas)`);
        console.log(`   🔥 Feedback Proactivo: DESACTIVADO`);
        if (this.enLinea) {
            this._ultimaPeticionExitosa = Date.now();
            this._offlineDesde = 0;
        } else {
            this._offlineDesde = Date.now();
        }
        return this;
    }

    // ============================================================
    // CARGAR LÍMITES DE TOKENS DESDE CONFIGURACIÓN
    // ============================================================

    _cargarLimitesTokens() {
        try {
            const config = localStorage.getItem('pipeline_token_limits');
            if (config) {
                const parsed = JSON.parse(config);
                if (parsed.diario) this._limitesTokens.diario = parsed.diario;
                if (parsed.porMinuto) this._limitesTokens.porMinuto = parsed.porMinuto;
                if (parsed.peticionesPorMinuto) this._limitesTokens.peticionesPorMinuto = parsed.peticionesPorMinuto;
            }
        } catch (e) {
            console.warn('⚠️ Error cargando límites de tokens:', e);
        }
    }

    // ============================================================
    // REGISTRAR EVENTOS DEL BALANCEADOR
    // ============================================================

    _registrarEventosBalanceador() {
        if (!this._balanceador) return;
        
        this._balanceador.onCambioModelo((modelo) => {
            console.log(`📡 Vigía: Modelo cambiado a ${modelo}`);
            this.modelo = modelo;
            this._modeloUsadoEnPeticion = modelo;
            
            if (window.uiCore) {
                const esPrioritario = modelo === this._balanceador.getModeloPrioritario();
                window.uiCore.mostrarToast(
                    esPrioritario ? 
                        `🟢 Modelo prioritario restaurado: ${modelo}` : 
                        `🟡 Modelo alternativo: ${modelo}`,
                    esPrioritario ? 'success' : 'warning'
                );
            }
        });
        
        this._balanceador.onEstadoActualizado((estado) => {
            if (window.uiCore && window.uiCore._actualizarIndicadorBalanceador) {
                window.uiCore._actualizarIndicadorBalanceador();
            }
        });
    }

    // ============================================================
    // 🔥 OBTENER MODELO DEL BALANCEADOR
    // ============================================================

    async _obtenerModeloDelBalanceador() {
        if (!this._balanceador || !this._balanceador._initDone) {
            return this.modelo;
        }

        try {
            if (typeof this._balanceador.obtenerModeloParaPeticion === 'function') {
                const modelo = await this._balanceador.obtenerModeloParaPeticion();
                if (modelo) {
                    this._usandoBalanceador = true;
                    this._modeloUsadoEnPeticion = modelo;
                    return modelo;
                }
            }
            
            const modeloActivo = this._balanceador.getModeloActivo();
            if (modeloActivo) {
                this._usandoBalanceador = true;
                this._modeloUsadoEnPeticion = modeloActivo;
                return modeloActivo;
            }
            
            return this.modelo;
        } catch (e) {
            console.warn('⚠️ Vigía: Error obteniendo modelo del balanceador:', e.message);
            return this.modelo;
        }
    }

    // ============================================================
    // VALIDAR API KEY
    // ============================================================

    async _validarApiKey() {
        if (!this.apiKey) return false;
        const ahora = Date.now();
        if (ahora - this._ultimaVerificacionApiKey < this._tiempoEntreVerificaciones) {
            return this._apiKeyValidada;
        }
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + this.apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: this.modelo, messages: [{ role: 'user', content: 'OK' }], max_tokens: 1 }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const valida = response.ok;
            this._ultimaVerificacionApiKey = ahora;
            this._apiKeyValidada = valida;
            if (!valida && response.status === 401) {
                console.error('❌ API Key inválida (401)');
                localStorage.removeItem('pipeline_api_key');
                this.apiKey = null;
            }
            return valida;
        } catch (e) {
            console.warn('⚠️ Error validando API Key:', e.message);
            this._ultimaVerificacionApiKey = ahora;
            return false;
        }
    }

    // ============================================================
    // REGISTRAR CONSUMO DE TOKENS
    // ============================================================

    registrarConsumoTokens(tokensUsados) {
        if (!tokensUsados || tokensUsados <= 0) return;
        
        const ahora = Date.now();
        
        if (ahora - this._tokensUsados.ultimoResetMinuto > 60000) {
            this._tokensUsados.porMinuto = 0;
            this._tokensUsados.ultimoResetMinuto = ahora;
            this._tokensUsados.peticionesMinuto = 0;
        }
        
        if (ahora - this._tokensUsados.ultimoResetPeticiones > 60000) {
            this._tokensUsados.peticionesMinuto = 0;
            this._tokensUsados.ultimoResetPeticiones = ahora;
        }
        
        const hoy = new Date().toDateString();
        if (this._ultimoResetDiario !== hoy) {
            this._tokensUsados.diario = 0;
            this._ultimoResetDiario = hoy;
            this._alertaLimiteMostrada = false;
            this._tokensRestantesMostrados = 0;
            if (centinela && typeof centinela.resetearContadorDiario === 'function') {
                centinela.resetearContadorDiario();
            }
            console.log('🔄 Contador diario de tokens reseteados');
        }
        
        this._tokensUsados.diario += tokensUsados;
        this._tokensUsados.porMinuto += tokensUsados;
        this._tokensUsados.peticionesMinuto++;
        
        this._verificarAlertasTokens();
        
        window.dispatchEvent(new CustomEvent('tokensActualizados', {
            detail: this.obtenerEstadoTokens()
        }));
        
        if (window.uiCore && typeof window.uiCore._actualizarIndicadorTokens === 'function') {
            window.uiCore._actualizarIndicadorTokens(this.obtenerEstadoTokens());
        }
    }

    // ============================================================
    // VERIFICAR ALERTAS DE TOKENS
    // ============================================================

    _verificarAlertasTokens() {
        const pctDiario = this._calcularPorcentajeDiario();
        const pctMinuto = this._calcularPorcentajeMinuto();
        
        if (pctDiario >= 98 && !this._alertaLimiteMostrada) {
            this._alertaLimiteMostrada = true;
            const tokensRestantes = Math.round((this._limitesTokens.diario - this._tokensUsados.diario) / 1000);
            
            if (window.uiCore) {
                window.uiCore.mostrarToast(
                    `⚠️ ¡Cuidado! Te quedan ${tokensRestantes}K tokens (${Math.round(100 - pctDiario)}%). \n` +
                    `💡 Cambia a modo "Flashcard" offline o reduce el uso de ejercicios con Groq.`,
                    'warning'
                );
            }
        }
        
        if (this._tokensUsados.peticionesMinuto >= this._limitesTokens.peticionesPorMinuto * 0.9) {
            if (!this._alertaPeticionesMostrada) {
                this._alertaPeticionesMostrada = true;
                if (window.uiCore) {
                    window.uiCore.mostrarToast(
                        `⏱️ Has hecho ${this._tokensUsados.peticionesMinuto} peticiones en el último minuto. \n` +
                        `Límite: ${this._limitesTokens.peticionesPorMinuto}. Reduce el ritmo.`,
                        'warning'
                    );
                }
            }
        } else {
            this._alertaPeticionesMostrada = false;
        }
        
        if (pctMinuto >= 90) {
            if (window.uiCore && Date.now() - this._ultimoFeedback > 30000) {
                window.uiCore.mostrarToast(
                    `⚡ Consumo alto por minuto: ${Math.round(this._tokensUsados.porMinuto / 1000)}K tokens. \n` +
                    `Considera usar ejercicios sin Groq (Flashcard).`,
                    'info'
                );
                this._ultimoFeedback = Date.now();
            }
        }
        
        if (pctDiario < 95) {
            this._alertaLimiteMostrada = false;
        }
        
        const pctRedondeado = Math.floor(pctDiario / 10) * 10;
        if (pctRedondeado > 0 && pctRedondeado !== this._tokensRestantesMostrados) {
            this._tokensRestantesMostrados = pctRedondeado;
            const tokensRestantes = Math.round((this._limitesTokens.diario - this._tokensUsados.diario) / 1000);
            if (pctRedondeado > 60 && pctRedondeado < 95) {
                if (window.uiCore && Date.now() - this._ultimoFeedback > 60000) {
                    window.uiCore.mostrarToast(
                        `🪙 Tokens restantes: ${tokensRestantes}K (${Math.round(100 - pctDiario)}%)`,
                        'info'
                    );
                    this._ultimoFeedback = Date.now();
                }
            }
        }
    }

    // ============================================================
    // CALCULAR PORCENTAJES DE TOKENS
    // ============================================================

    _calcularPorcentajeDiario() {
        if (this._limitesTokens.diario <= 0) return 0;
        return Math.min(100, (this._tokensUsados.diario / this._limitesTokens.diario) * 100);
    }

    _calcularPorcentajeMinuto() {
        if (this._limitesTokens.porMinuto <= 0) return 0;
        return Math.min(100, (this._tokensUsados.porMinuto / this._limitesTokens.porMinuto) * 100);
    }

    _calcularTiempoReinicio() {
        const ahora = new Date();
        const manana = new Date(ahora);
        manana.setDate(manana.getDate() + 1);
        manana.setHours(0, 0, 0, 0);
        const diff = manana - ahora;
        if (diff <= 0) return '0h 0m';
        const horas = Math.floor(diff / 3600000);
        const minutos = Math.floor((diff % 3600000) / 60000);
        return `${horas}h ${minutos}m`;
    }

    // ============================================================
    // OBTENER ESTADO DE TOKENS
    // ============================================================

    obtenerEstadoTokens() {
        const pctDiario = this._calcularPorcentajeDiario();
        const pctMinuto = this._calcularPorcentajeMinuto();
        
        let estado = 'normal';
        let color = 'var(--success)';
        let emoji = '🟢';
        let label = 'Normal';
        
        if (pctDiario >= 95) {
            estado = 'critico';
            color = 'var(--danger)';
            emoji = '🔴';
            label = '⚠️ Crítico';
        } else if (pctDiario >= 80) {
            estado = 'alto';
            color = 'var(--warning)';
            emoji = '🟠';
            label = '⚠️ Alto';
        } else if (pctDiario >= 60) {
            estado = 'medio';
            color = '#FDCB6E';
            emoji = '🟡';
            label = '📊 Medio';
        } else if (pctDiario >= 30) {
            estado = 'normal';
            color = 'var(--success)';
            emoji = '🟢';
            label = '✅ Normal';
        } else {
            estado = 'bajo';
            color = '#00B894';
            emoji = '🟢';
            label = '✅ Bajo';
        }
        
        return {
            diario: {
                usado: this._tokensUsados.diario,
                limite: this._limitesTokens.diario,
                porcentaje: Math.round(pctDiario),
                tokensRestantes: this._limitesTokens.diario - this._tokensUsados.diario,
                label: `${Math.round(this._tokensUsados.diario / 1000)}K / ${Math.round(this._limitesTokens.diario / 1000)}K`
            },
            porMinuto: {
                usado: this._tokensUsados.porMinuto,
                limite: this._limitesTokens.porMinuto,
                porcentaje: Math.round(pctMinuto),
                label: `${Math.round(this._tokensUsados.porMinuto / 1000)}K / ${Math.round(this._limitesTokens.porMinuto / 1000)}K`
            },
            peticionesMinuto: {
                actual: this._tokensUsados.peticionesMinuto,
                limite: this._limitesTokens.peticionesPorMinuto,
                porcentaje: Math.min(100, Math.round((this._tokensUsados.peticionesMinuto / this._limitesTokens.peticionesPorMinuto) * 100))
            },
            estado: estado,
            color: color,
            emoji: emoji,
            label: label,
            tiempoReinicio: this._calcularTiempoReinicio(),
            timestamp: Date.now()
        };
    }

    // ============================================================
    // 🔥 CONSULTAR GROQ CON BALANCEADOR
    // ============================================================

    async _consultarGroq(prompt, formato) {
        // Verificar conexión
        if (!this.enLinea || !this.apiKey || !this._apiKeyValidada) {
            console.warn('⚠️ Vigía: Offline o API Key inválida');
            if (!this._reconectando && this._reconexionIntentos < this._maxReconexionIntentos) {
                this._intentarReconexion();
            }
            throw new Error('Vigía offline o API Key inválida');
        }

        // OBTENER MODELO DEL BALANCEADOR
        let modelo = await this._obtenerModeloDelBalanceador();
        this.modelo = modelo;

        // Verificar límite de peticiones por minuto
        const estadoTokens = this.obtenerEstadoTokens();
        if (estadoTokens.peticionesMinuto.porcentaje >= 100) {
            const espera = 60 - (Date.now() - this._tokensUsados.ultimoResetPeticiones) / 1000;
            throw new Error(`Límite de peticiones por minuto alcanzado. Espera ${Math.ceil(espera)}s.`);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this._fetchTimeout);
            
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 
                    'Authorization': 'Bearer ' + this.apiKey, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    model: modelo,
                    messages: [
                        { role: 'system', content: 'Eres un asistente lingüístico neuroadaptativo experto. Responde SOLO con JSON válido, sin markdown, sin comentarios, sin texto adicional.' },
                        { role: 'user', content: prompt + (formato === 'json' ? ' Responde SOLO con JSON válido. No uses markdown, ni comillas triples, ni texto adicional.' : '') }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            this._ultimaPeticionExitosa = Date.now();
            
            // MANEJO DE ERRORES Y BALANCEO
            if (response.status === 429) {
                console.warn(`⚠️ Vigía: Límite de tasa excedido en ${modelo}`);
                if (this._balanceador) {
                    const estado = this._balanceador.getEstadoModelo(modelo);
                    if (estado) {
                        estado.disponible = false;
                        estado.fallosConsecutivos = (estado.fallosConsecutivos || 0) + 1;
                        estado.tokensDisponibles = 0;
                        this._balanceador._notificarCambioEstado();
                    }
                    const nuevoModelo = await this._obtenerModeloDelBalanceador();
                    if (nuevoModelo && nuevoModelo !== modelo) {
                        console.log(`⚖️ Vigía: Reintentando con modelo ${nuevoModelo}`);
                        this.modelo = nuevoModelo;
                        return this._consultarGroq(prompt, formato);
                    }
                }
                throw new Error('Límite de tasa excedido en todos los modelos');
            }
            
            if (response.status === 401) {
                console.error('❌ Vigía: API Key inválida en consulta');
                localStorage.removeItem('pipeline_api_key');
                this.apiKey = null;
                this._apiKeyValidada = false;
                this.enLinea = false;
                throw new Error('API Key inválida');
            }
            
            if (!response.ok) {
                if (this._balanceador) {
                    const estado = this._balanceador.getEstadoModelo(modelo);
                    if (estado) {
                        estado.disponible = false;
                        estado.fallosConsecutivos = (estado.fallosConsecutivos || 0) + 1;
                        this._balanceador._notificarCambioEstado();
                    }
                }
                throw new Error('HTTP ' + response.status);
            }

            const data = await response.json();
            
            // REGISTRAR USO DE TOKENS
            if (data.usage) {
                const tokensUsados = data.usage.total_tokens || 0;
                
                if (this._balanceador) {
                    this._balanceador.registrarUsoTokens(modelo, tokensUsados);
                }
                
                if (tokensUsados > 0) {
                    this.registrarConsumoTokens(tokensUsados);
                    console.log(`📊 Vigía: ${tokensUsados} tokens usados en ${modelo}`);
                }
            }
            
            let contenido = data.choices?.[0]?.message?.content || '';
            
            if (formato === 'json') {
                try {
                    return JSON.parse(contenido);
                } catch (e) {
                    let cleanContent = contenido
                        .replace(/```json\s*/gi, '')
                        .replace(/```\s*/g, '')
                        .trim();
                    
                    const firstBrace = cleanContent.indexOf('{');
                    const lastBrace = cleanContent.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                        cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
                    }
                    
                    try {
                        return JSON.parse(cleanContent);
                    } catch (e2) {
                        const match = contenido.match(/\{[\s\S]*\}/);
                        if (match) {
                            try {
                                return JSON.parse(match[0]);
                            } catch (e3) {
                                console.warn('⚠️ No se pudo parsear JSON:', contenido.substring(0, 200));
                                return null;
                            }
                        }
                        console.warn('⚠️ No se encontró JSON válido:', contenido.substring(0, 200));
                        return null;
                    }
                }
            }
            return contenido;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('❌ Vigía: Timeout en consulta');
                this._fallosConsecutivos++;
                if (this._fallosConsecutivos >= this._maxFallosAntesReconexion) {
                    this.enLinea = false;
                    this._offlineDesde = Date.now();
                    this._intentarReconexion();
                }
                throw new Error('Timeout de conexión');
            }
            console.error('❌ Vigía: Error en consulta:', error.message);
            this._fallosConsecutivos++;
            if (this._fallosConsecutivos >= this._maxFallosAntesReconexion) {
                this.enLinea = false;
                this._offlineDesde = Date.now();
                this._intentarReconexion();
            }
            throw error;
        }
    }

    // ============================================================
    // GENERAR JSON CON TRANSCRIPCIÓN FONÉTICA
    // ============================================================

    async generarJSON(tema, numHistorias, idioma) {
        try {
            const idiomaObj = idioma || gestorIdiomas?.getIdiomaActivo() || 'es';
            const nivel = gestorIdiomas?.getInfoIdioma(idiomaObj)?.nivel || 'B1';
            const esJeroglifico = this._esJeroglifico(idiomaObj);
            const idiomaNativo = await this._obtenerIdiomaNativo();
            const nombreIdioma = this._getNombreIdioma(idiomaObj);
            const nombreNativo = this._getNombreIdioma(idiomaNativo);
            
            let instruccionesTranscripcion = '';
            
            if (esJeroglifico) {
                instruccionesTranscripcion = `
                    ⚠️ IMPORTANTE PARA IDIOMAS JEROGLÍFICOS:
                    - Incluye 'pinyin' CON TONOS para cada frase y cada palabra.
                    - La 'segmentacion' debe separar CADA palabra con su pinyin correspondiente.
                    - Ejemplo: "你好" → "nǐ hǎo"
                `;
            } else {
                instruccionesTranscripcion = `
                    ⚠️ IMPORTANTE PARA TRANSCRIPCIÓN FONÉTICA:
                    - Incluye 'transcripcion' para CADA frase y CADA palabra.
                    - La transcripción debe estar en el sistema fonético NATIVO del usuario (${nombreNativo}).
                    - Debe ser FÁCIL DE LEER para un hablante nativo de ${nombreNativo}.
                    - Ejemplo: "I have a pencil" → transcripción: "ai jaf a pensil" (para español).
                    - Ejemplo: "Je suis fatigué" → transcripción: "she sui fatige" (para español).
                    - Separa las sílabas con espacios para facilitar la lectura.
                    - Usa la aproximación más cercana para sonidos que no existen en ${nombreNativo}.
                `;
            }

            const prompt = `Genera ${numHistorias} mini-historias en ${idiomaObj} (nivel ${nivel}) sobre el tema "${tema}". Cada historia debe tener entre 6 y 8 frases. 

${instruccionesTranscripcion}

Devuelve el JSON con la estructura:
{
  "meta": {
    "tema": "${tema}",
    "idioma": "${idiomaObj}",
    "nivel": "${nivel}",
    "es_jeroglifico": ${esJeroglifico},
    "num_historias": ${numHistorias},
    "idioma_nativo": "${idiomaNativo}"
  },
  "historias": [
    {
      "titulo": "Título de la historia",
      "frases": [
        {
          "original": "Frase en ${idiomaObj}",
          "traduccion": "Traducción al ${idiomaNativo}",
          ${esJeroglifico ? '"pinyin": "pinyin_con_tonos",' : '"transcripcion": "transcripcion_fonetica_en_${nombreNativo}",'}
          ${esJeroglifico ? '"pinyinCompleto": "pinyin_completo_con_tonos",' : ''}
          "palabras": [
            {
              "palabra": "palabra_en_${idiomaObj}",
              ${esJeroglifico ? '"pinyin": "pinyin_con_tonos",' : '"transcripcion": "transcripcion_fonetica_en_${nombreNativo}",'}
              "familia": "familia_semantica",
              "tipo": "tipo_gramatical",
              "significado": "significado_en_${idiomaNativo}"
            }
          ]
        }
      ]
    }
  ]
}`;

            return await this._consultarGroq(prompt, 'json');
        } catch (e) {
            console.error('❌ Error generando JSON:', e);
            return null;
        }
    }

    // ============================================================
    // GENERAR TRANSCRIPCIÓN PARA TEXTO EXISTENTE
    // ============================================================

    async generarTranscripcionParaTexto(texto, idioma, nivel = 'A1') {
        if (!this.enLinea || !this.apiKey || !this._apiKeyValidada) {
            console.warn('⚠️ Vigía offline, no se puede generar transcripción');
            return null;
        }

        const esJeroglifico = this._esJeroglifico(idioma);
        if (esJeroglifico) {
            return null;
        }

        const idiomaNativo = await this._obtenerIdiomaNativo();
        const nombreIdioma = this._getNombreIdioma(idioma);
        const nombreNativo = this._getNombreIdioma(idiomaNativo);

        try {
            const prompt = `
Eres un experto en lingüística y fonética.

El usuario está aprendiendo ${nombreIdioma} (${idioma}) y su idioma nativo es ${nombreNativo} (${idiomaNativo}).

Genera una TRANSCRIPCIÓN FONÉTICA en ${nombreNativo} para el siguiente texto en ${nombreIdioma}:

TEXTO: "${texto}"
NIVEL: ${nivel}

REGLAS:
1. La transcripción debe ser FÁCIL DE LEER para un hablante nativo de ${nombreNativo}.
2. Usa el sistema fonético más natural para ${nombreNativo}.
3. Separa las sílabas con espacios.
4. Si hay sonidos que no existen en ${nombreNativo}, usa la aproximación más cercana.
5. Responde SOLO con la transcripción fonética, sin explicaciones.

EJEMPLO (${nombreIdioma} → ${nombreNativo}):
"I have a pencil" → "ai jaf a pensil"

Responde SOLO con la transcripción fonética:`;

            const resultado = await this._consultarGroq(prompt, 'text');
            if (resultado && resultado.length > 0) {
                let transcripcion = resultado.trim();
                transcripcion = transcripcion.replace(/^["']|["']$/g, '');
                return transcripcion;
            }
            return null;

        } catch (e) {
            console.warn('⚠️ Error generando transcripción:', e);
            return null;
        }
    }

    // ============================================================
    // MÉTODOS EXISTENTES (MANTENIDOS)
    // ============================================================

    async _probarConexion() {
        if (!this.apiKey || !this._apiKeyValidada) return false;
        console.log('📡 Vigía: Enviando ping a Groq...');
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this._fetchTimeout);
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + this.apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: this.modelo, messages: [{ role: 'user', content: 'Responde solo "OK" si estás funcionando.' }], max_tokens: 5, temperature: 0.1 }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                this._ultimaPeticionExitosa = Date.now();
                console.log('✅ Vigía: Conexión EXITOSA');
                return true;
            }
            if (response.status === 401) {
                console.error('❌ Vigía: API Key INVÁLIDA (401)');
                localStorage.removeItem('pipeline_api_key');
                this.apiKey = null;
                this._apiKeyValidada = false;
                return false;
            }
            if (response.status === 429) {
                console.warn('⚠️ Vigía: Límite de tasa excedido');
                if (this._balanceador) {
                    const estado = this._balanceador.getEstadoModelo(this.modelo);
                    if (estado) {
                        estado.disponible = false;
                        estado.fallosConsecutivos = (estado.fallosConsecutivos || 0) + 1;
                        estado.tokensDisponibles = 0;
                        this._balanceador._notificarCambioEstado();
                    }
                }
                return false;
            }
            console.warn('⚠️ Vigía: Error HTTP', response.status);
            return false;
        } catch (error) {
            if (error.name === 'AbortError') console.error('❌ Vigía: Timeout en prueba');
            else console.error('❌ Vigía: Error en prueba:', error.message);
            return false;
        }
    }

    async _cargarPerfilUsuario() {
        try {
            const usuario = await db.getUsuario();
            if (!usuario?.id) return;
            this._usuarioId = usuario.id;
            const perfil = await db.obtenerPerfilAprendizaje(usuario.id);
            if (perfil) {
                this._perfilUsuario = perfil;
                this._confianza = perfil.nivelConfianza || 0.5;
                if (perfil.variaciones) {
                    this._variacionesValidas = perfil.variaciones;
                    for (const v of perfil.variaciones) {
                        const idioma = v.idioma || 'es';
                        if (!this._palabrasOpcionales[idioma]) this._palabrasOpcionales[idioma] = [];
                        if (!this._palabrasOpcionales[idioma].includes(v.variacion)) {
                            this._palabrasOpcionales[idioma].push(v.variacion);
                        }
                    }
                }
                if (perfil.patrones) this._patronesUsuarios = perfil.patrones;
                console.log(`📊 Perfil cargado: Confianza ${Math.round(this._confianza * 100)}%`);
            }
        } catch (e) { console.warn('⚠️ Error cargando perfil de usuario:', e); }
    }

    // 🔥 HEALTH CHECK ELIMINADO - NO SE USA
    // _iniciarHealthCheck() { ... }

    // 🔥 FEEDBACK PROACTIVO ELIMINADO - NO SE USA
    // _iniciarFeedbackProactivo() { ... }

    // 🔥 VERIFICAR ESTADO DE CONEXIÓN ELIMINADO - NO SE USA
    // async _verificarEstadoConexion() { ... }

    // 🔥 ANALIZAR Y FEEDBACK ELIMINADO - NO SE USA
    // async _analizarYFeedback() { ... }

    // 🔥 ANALIZAR VOCABULARIO REPETIDO ELIMINADO - NO SE USA
    // async _analizarVocabularioRepetido() { ... }

    // 🔥 GENERAR RECOMENDACIONES ELIMINADO - NO SE USA
    // _generarRecomendaciones() { ... }

    // 🔥 ENCOLAR FEEDBACK ELIMINADO - NO SE USA
    // _encolarFeedback() { ... }

    // 🔥 PROCESAR COLA FEEDBACK ELIMINADO - NO SE USA
    // async _procesarColaFeedback() { ... }

    async _intentarReconexion() {
        if (this._reconectando || this._reconexionIntentos >= this._maxReconexionIntentos) return;
        this._reconectando = true;
        this._reconexionIntentos++;
        console.log('🔄 Vigía: Intento de reconexión ' + this._reconexionIntentos + '/' + this._maxReconexionIntentos);
        try {
            this.apiKey = localStorage.getItem('pipeline_api_key');
            if (!this.apiKey) { this._reconectando = false; return; }
            this._apiKeyValidada = await this._validarApiKey();
            if (!this._apiKeyValidada) { this._reconectando = false; return; }
            if (await this._probarConexion()) {
                this.enLinea = true;
                this._fallosConsecutivos = 0;
                this._ultimaPeticionExitosa = Date.now();
                this._offlineDesde = 0;
                this._reconexionIntentos = 0;
                console.log('✅ Vigía: RECONECTADO exitosamente');
                this._notificarCambioEstado('online', 'Reconexión exitosa');
            } else {
                this._fallosConsecutivos++;
                this.enLinea = false;
                this._offlineDesde = Date.now();
                console.warn('⚠️ Vigía: Falló reconexión (intento ' + this._reconexionIntentos + ')');
            }
        } catch (e) { console.error('❌ Vigía: Error en reconexión:', e); this.enLinea = false; this._offlineDesde = Date.now(); }
        this._reconectando = false;
    }

    async reconectarManual() {
        console.log('🔧 Vigía: Reconexión manual solicitada');
        if (this._reconectando) return { exito: false, mensaje: 'Ya hay un intento de reconexión en curso' };
        this._reconexionIntentos = 0;
        this._fallosConsecutivos = 0;
        this.apiKey = localStorage.getItem('pipeline_api_key');
        if (!this.apiKey) return { exito: false, mensaje: 'No hay API Key guardada' };
        await this._intentarReconexion();
        return { exito: this.enLinea, mensaje: this.enLinea ? '✅ Vigía reconectado exitosamente' : '❌ No se pudo reconectar' };
    }

    _notificarCambioEstado(estado, razon) {
        console.log('📢 Vigía: Estado cambiado a', estado, '-', razon);
        window.dispatchEvent(new CustomEvent('vigiaEstado', { detail: { estado, razon, timestamp: Date.now() } }));
        if (window.uiCore?._actualizarIndicadoresSeguro) window.uiCore._actualizarIndicadoresSeguro();
        if (estado === 'offline' && window.uiCore?.mostrarToast && (this._offlineDesde === 0 || Date.now() - this._offlineDesde > 5000)) {
            window.uiCore.mostrarToast('🔴 Vigía: ' + (razon || 'Desconectado'), 'error');
        } else if (estado === 'online' && window.uiCore?.mostrarToast) {
            window.uiCore.mostrarToast('🟢 Vigía: Reconectado', 'success');
        }
    }

    async getPalabrasRequeridas(idioma, nivel) {
        if (!idioma) idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        if (!nivel) {
            const info = gestorIdiomas?.getInfoIdioma(idioma);
            nivel = info?.nivel || 'B1';
        }
        const idiomaLower = idioma.toLowerCase().trim();
        return this._palabrasPorIdioma[idiomaLower]?.[nivel] || this._palabrasPorIdioma['default']?.[nivel] || 2000;
    }

    async getEstadisticasIdioma() {
        try {
            const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
            const infoIdioma = gestorIdiomas?.getInfoIdioma(idioma);
            const nivel = infoIdioma?.nivel || 'A1';
            const nivelRequerido = await this.getPalabrasRequeridas(idioma, nivel);
            const palabras = await db.obtenerPalabrasPorIdioma(idioma);
            const frases = await db.obtenerFrasesPorIdioma(idioma);
            const progresos = await db.obtenerProgresoPorIdioma(idioma);
            const palabrasUnicas = new Set(palabras.map(p => p.palabra || p.hanzi || '').filter(Boolean));
            const palabrasAprendidas = palabrasUnicas.size;
            const coberturaNivel = Math.min(100, Math.round((palabrasAprendidas / Math.max(nivelRequerido, 1)) * 100));
            const completadas = progresos.filter(p => p.estado === 'completada' || p.rcn >= 4).length;
            const puedeHacerExamen = completadas >= 10 && palabrasAprendidas >= nivelRequerido * 0.6;
            return { idioma, nivel, nivelRequerido, palabrasAprendidas, palabrasRestantes: Math.max(0, nivelRequerido - palabrasAprendidas), coberturaNivel, totalFrases: frases.length, completadas, puedeHacerExamen };
        } catch (e) { console.warn('⚠️ Error obteniendo estadísticas del idioma:', e); return null; }
    }

    async getMensajeBarreraExamen() {
        try {
            const stats = await this.getEstadisticasIdioma();
            if (!stats) return { permitido: false, mensaje: '❌ No se pudieron obtener las estadísticas.' };
            if (!stats.puedeHacerExamen) {
                let mensaje = '❌ No cumples con los requisitos para hacer el examen:\n\n';
                if (stats.completadas < 10) mensaje += `• Necesitas completar al menos 10 frases (tienes ${stats.completadas})\n`;
                if (stats.palabrasAprendidas < stats.nivelRequerido * 0.6) {
                    mensaje += `• Necesitas aprender al menos el 60% del vocabulario del nivel ${stats.nivel}\n`;
                    mensaje += `  (tienes ${stats.palabrasAprendidas}/${stats.nivelRequerido}, ${stats.coberturaNivel}%)\n`;
                }
                mensaje += '\n💡 Sigue practicando y vuelve a intentarlo.';
                return { permitido: false, mensaje };
            }
            return { permitido: true, mensaje: `✅ ¡Estás listo para el examen de ${stats.nivel}!\n\n📊 Progreso: ${stats.coberturaNivel}% del vocabulario\n📝 ${stats.completadas} frases completadas` };
        } catch (e) { return { permitido: false, mensaje: '❌ Error verificando requisitos.' }; }
    }

    async getRecomendacionPersonalizada() {
        try {
            const stats = await this.getEstadisticasIdioma();
            if (!stats) return null;
            let mensaje = '', prioridad = 'info';
            if (stats.coberturaNivel < 30) {
                mensaje = `📖 Te recomiendo enfocarte en vocabulario básico de ${stats.nivel}. Has aprendido ${stats.palabrasAprendidas} de ${stats.nivelRequerido} palabras (${stats.coberturaNivel}%).`;
                prioridad = 'warning';
            } else if (stats.coberturaNivel < 60) {
                mensaje = `📚 Vas bien, pero aún te faltan ${stats.palabrasRestantes} palabras para completar el nivel ${stats.nivel}. ¡Sigue así!`;
                prioridad = 'info';
            } else if (stats.coberturaNivel >= 60 && stats.coberturaNivel < 80) {
                mensaje = `🌟 ¡Muy bien! Has alcanzado ${stats.coberturaNivel}% del vocabulario de ${stats.nivel}. Estás cerca de completar el nivel.`;
                prioridad = 'success';
            } else {
                mensaje = `🎉 ¡Excelente trabajo! Has completado el ${stats.coberturaNivel}% del vocabulario de ${stats.nivel}. ¡Ya casi estás listo para el examen!`;
                prioridad = 'success';
            }
            return { mensaje, prioridad };
        } catch (e) { return null; }
    }

    async generarPistaInteligente(frase, idioma) {
        try {
            if (!this.enLinea) return this._generarPistaOffline(frase);
            const prompt = `Genera una pista sutil (sin dar la respuesta directa) para ayudar a recordar la traducción de: "${frase.original}" → "${frase.traduccion}" Idioma: ${idioma} Nivel: ${frase.nivel || 'A1'}`;
            return await this._consultarGroq(prompt, 'text') || this._generarPistaOffline(frase);
        } catch (e) { return this._generarPistaOffline(frase); }
    }

    _generarPistaOffline(frase) {
        if (frase.esJeroglifico && frase.pinyinCompleto) return `💡 Pista fonética: "${frase.pinyinCompleto}"`;
        if (frase.transcripcion) return `💡 Pista fonética: "${frase.transcripcion}"`;
        return '💡 Piensa en el contexto de la frase.';
    }

    async chat(mensaje) {
        try {
            if (!this.enLinea) return '🔴 Vigía está offline. Por favor, reconéctate usando el botón de reconexión.';
            const usuario = await db.getUsuario();
            const stats = await this.getEstadisticasIdioma();
            const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
            const nivel = gestorIdiomas?.getInfoActivo()?.nivel || 'A1';
            const modeloActual = this._balanceador?.getModeloActivo() || this.modelo;
            const prompt = `Eres Vigía, el asistente lingüístico de Pipeline Neuro.\n\nContexto del usuario:\n- Nombre: ${usuario?.nombre || 'Anónimo'}\n- Idioma objetivo: ${idioma}\n- Nivel: ${nivel}\n- Vocabulario aprendido: ${stats?.palabrasAprendidas || 0} palabras\n- Cobertura del nivel: ${stats?.coberturaNivel || 0}%\n- Frases completadas: ${stats?.completadas || 0}\n- Modelo actual: ${modeloActual}\n\nResponde a la siguiente consulta del usuario de manera útil, amigable y didáctica:\n\n${mensaje}`;
            return await this._consultarGroq(prompt, 'text') || 'Lo siento, no pude procesar tu consulta.';
        } catch (e) { return '❌ Error procesando tu mensaje. Intenta de nuevo.'; }
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

    getEstado() {
        const modeloActivo = this._balanceador?.getModeloActivo() || this.modelo;
        const estadoBalanceador = this._balanceador?.getEstado() || null;
        const tokens = this.obtenerEstadoTokens();
        return { 
            enLinea: this.enLinea, 
            modelo: modeloActivo,
            apiKey: !!this.apiKey, 
            confianza: Math.round(this._confianza * 100),
            tokens: tokens,
            balanceador: estadoBalanceador ? {
                activo: true,
                modelosDisponibles: estadoBalanceador.modelosDisponibles,
                modelosTotal: estadoBalanceador.modelosTotal,
                usaPrioritario: estadoBalanceador.usaPrioritario
            } : null
        };
    }

    destroy() {
        if (this._healthCheckInterval) { clearInterval(this._healthCheckInterval); this._healthCheckInterval = null; }
        if (this._feedbackInterval) { clearInterval(this._feedbackInterval); this._feedbackInterval = null; }
        console.log('🛑 Vigía: Destruido');
    }

    escanear() {
        this.turnosSinEscaneo = 0;
        if (!this.escaneoActivo) {
            this.escaneoActivo = true;
            this._realizarEscaneoNeuro().finally(() => { this.escaneoActivo = false; });
        }
    }

    async _realizarEscaneoNeuro() {
        try {
            console.log('🔍 Vigía: Escaneando neurodatos...');
            const frases = await db.obtenerFrases();
            const palabras = await db.obtenerPalabras();
            const progreso = await db.obtenerTodoProgreso();
            this.turnosSinEscaneo = 0;
        } catch (e) { console.warn('⚠️ Vigía: Error en escaneo neuro:', e); }
    }

    // ============================================================
    // VALIDAR TRADUCCIÓN NATURAL (CON GROQ)
    // ============================================================

    async validarTraduccionNatural(respuestaUsuario, fraseCorrecta, idioma, nivel, direccion = 'objetivo_a_nativo') {
        if (!this.enLinea || !this.apiKey || !this._apiKeyValidada) {
            console.warn('⚠️ Vigía offline, no se puede validar con Groq');
            throw new Error('Vigía offline');
        }

        const estadoTokens = this.obtenerEstadoTokens();
        if (estadoTokens.diario.porcentaje >= 98) {
            throw new Error('Límite de tokens diario casi alcanzado. Usa validación offline.');
        }

        try {
            let direccionTexto = '';
            let idiomaEsperado = '';
            
            if (direccion === 'nativo_a_objetivo') {
                direccionTexto = 'El usuario está traduciendo del español al idioma objetivo. La respuesta CORRECTA debe estar en el idioma objetivo.';
                idiomaEsperado = idioma;
            } else {
                direccionTexto = 'El usuario está traduciendo del idioma objetivo al español. La respuesta CORRECTA debe estar en español.';
                idiomaEsperado = 'español';
            }

            console.log(`🧠 Vigía validando traducción ${direccion}...`);
            if (centinela?.verificarLímites) {
                const limite = centinela.verificarLímites(800);
                if (!limite.permitido) throw new Error('Límite de peticiones');
            }

            const prompt = `Eres un experto evaluador de traducciones para el idioma ${idioma} (Nivel ${nivel}).

INSTRUCCIÓN MUY IMPORTANTE: ${direccionTexto}

FRASE ORIGINAL (en ${idioma}): "${fraseCorrecta}"
RESPUESTA DEL USUARIO: "${respuestaUsuario}"

REGLAS DE EVALUACIÓN:
1. La respuesta debe estar en ${idiomaEsperado} para ser considerada correcta.
2. Si la respuesta está en el idioma incorrecto, es INCORRECTO automáticamente.
3. Evalúa si el significado es correcto y la traducción es natural.
4. Sé FLEXIBLE con sinónimos, variaciones y expresiones equivalentes.
5. NO seas estricto con la gramática. Si el significado es el mismo, es correcto.
6. Si la respuesta es correcta → "correcto": true, "aproximado": false
7. Si es parcialmente correcta → "aproximado": true
8. Si es incorrecta → "correcto": false, "aproximado": false
9. Siempre da un mensaje de retroalimentación claro, útil y motivador.
10. Si la respuesta es incorrecta, sugiere la respuesta correcta.

Responde SOLO en formato JSON:
{
    "correcto": true/false,
    "aproximado": true/false,
    "mensaje": "mensaje_para_el_usuario",
    "correctaEsperada": "la_respuesta_correcta_segun_la_direccion"
}`;

            const resultado = await this._consultarGroq(prompt, 'json');
            if (resultado?.correcto !== undefined) {
                if (centinela?.registrarPeticion) centinela.registrarPeticion(800, true);
                console.log('✅ Validación con Groq exitosa:', resultado);
                return { ...resultado, puntuacion: resultado.correcto ? 100 : (resultado.aproximado ? 70 : 0), metodo: 'online_groq' };
            }
            throw new Error('Respuesta inválida de Groq');
        } catch (error) {
            console.warn('⚠️ Error en validación con Groq:', error.message);
            throw error;
        }
    }

    async obtenerReglasGramaticales(idioma) {
        try { return await db.obtenerReglasGramaticales(idioma); } catch (e) { return []; }
    }

    async analizarReglaGramatical(frase, idioma) {
        if (!this.enLinea || !this.apiKey || !this._apiKeyValidada) {
            return this._analizarReglaGramaticalOffline(frase, idioma);
        }
        try {
            const prompt = `Eres un experto lingüista especializado en ${idioma}. Analiza la siguiente frase en ${idioma} y extrae su regla gramatical principal:\n\nFRASE: "${frase.original}"\nCONTEXTO: ${frase.traduccion || 'Sin traducción'}\n\nResponde en formato JSON con: { "regla": "Nombre de la regla", "explicacion": "Explicación clara en español", "tipo": "Categoría de la regla", "ejemplos": ["Ejemplo 1", "Ejemplo 2"] }`;
            const resultado = await this._consultarGroq(prompt, 'json');
            if (resultado?.regla) return { regla: resultado.regla, explicacion: resultado.explicacion, tipo: resultado.tipo || 'general', ejemplos: resultado.ejemplos || [], fraseId: frase.id, idioma: idioma, nivel: frase.nivel || 'A1' };
            return this._analizarReglaGramaticalOffline(frase, idioma);
        } catch (e) { return this._analizarReglaGramaticalOffline(frase, idioma); }
    }

    _analizarReglaGramaticalOffline(frase, idioma) {
        const texto = frase.original || '';
        let tipo = 'general', regla = 'Patrón gramatical', explicacion = `Esta frase en ${idioma} sigue un patrón gramatical estándar.`;
        if (idioma === 'es' || idioma === 'español' || idioma === 'spanish') {
            if (texto.includes('é') || texto.includes('í') || texto.includes('ó') || texto.includes('á')) {
                tipo = 'tiempo_verbal'; regla = 'Pretérito Perfecto Simple';
                explicacion = 'El pretérito perfecto simple se usa para acciones pasadas completas. Se forma con la raíz del verbo más terminaciones: -é, -aste, -ó, -amos, -asteis, -aron.';
            } else if (texto.includes('ía') || texto.includes('aba')) {
                tipo = 'tiempo_verbal'; regla = 'Pretérito Imperfecto';
                explicacion = 'El pretérito imperfecto describe acciones pasadas habituales o en desarrollo. Se forma con -aba (1ª conjugación) o -ía (2ª y 3ª).';
            } else if (texto.includes('ará') || texto.includes('erá') || texto.includes('irá')) {
                tipo = 'tiempo_verbal'; regla = 'Futuro Simple';
                explicacion = 'El futuro simple expresa acciones futuras. Se forma con el infinitivo + terminaciones: -é, -ás, -á, -emos, -éis, -án.';
            }
        }
        if (idioma === 'en' || idioma === 'inglés' || idioma === 'english') {
            if (texto.includes('ed ') || texto.endsWith('ed') || texto.includes(' had ')) {
                tipo = 'tiempo_verbal'; regla = 'Past Simple';
                explicacion = 'El Past Simple se usa para acciones completas en el pasado. Los verbos regulares terminan en -ed.';
            } else if (texto.includes(' will ') || texto.includes(' going to ')) {
                tipo = 'tiempo_verbal'; regla = 'Future';
                explicacion = 'El futuro en inglés se forma con "will" + infinitivo o "going to" + infinitivo.';
            }
        }
        return { regla, explicacion, tipo, ejemplos: [frase.original], fraseId: frase.id, idioma, nivel: frase.nivel || 'A1', _offline: true };
    }
}

// ============================================================
// VIGÍA GRAMATICAL (MANTENIDO)
// ============================================================

class VigiaGramatical extends Vigia {
    constructor() {
        super();
        this._nombre = 'Vigía Gramatical';
        this._icono = '📚';
        this._edadGramatical = 0;
        this._reglasConocidas = [];
        this._reglasDominadas = new Set();
        this._reglasAprendiendo = new Set();
        this._progresoPorNivel = {};
        this._historialAprendizaje = [];
        this._ultimaActualizacion = 0;
        this._gramaticalInitDone = false;
        this._nivelMaximo = 'C2';
        this._niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        this._edadPorNivel = { 'A1': 20, 'A2': 35, 'B1': 50, 'B2': 65, 'C1': 80, 'C2': 100 };
        this._generandoReglas = false;
        this._reglasBaseCargadas = false;
        this._reglasCache = {};
        this._EDADES = [
            { min: 0, max: 15, nombre: '👶 Bebé', descripcion: 'Recién nacido en el idioma' },
            { min: 15, max: 35, nombre: '🧒 Niño', descripcion: 'Aprendiendo lo básico' },
            { min: 35, max: 55, nombre: '🧑 Joven', descripcion: 'Comienza a dominar estructuras' },
            { min: 55, max: 75, nombre: '🧑‍🏫 Adulto', descripcion: 'Comprensión avanzada' },
            { min: 75, max: 90, nombre: '👨‍🏫 Experto', descripcion: 'Dominio de reglas complejas' },
            { min: 90, max: 100, nombre: '🧙 Sabio', descripcion: 'Maestría gramatical completa' }
        ];
        this._TIPOS_REGLAS = ['tiempo_verbal', 'estructura_oracional', 'concordancia', 'uso_preposicional', 'articulos', 'pronombres', 'comparativos', 'superlativos', 'condicionales', 'subjuntivo', 'imperativo', 'voz_pasiva', 'estilo_indirecto', 'modales', 'gerundios', 'participios', 'adverbios', 'conjunciones'];
        this._DETECTORES_REGLAS = {
            'tiempo_verbal': ['é', 'í', 'ó', 'á', 'ed', 'ing', 'will', 'have', 'has', 'had', 'been', 'ser', 'estar', 'haber'],
            'estructura_oracional': ['que', 'quien', 'cual', 'donde', 'cuando', 'como', 'porque', 'si', 'aunque'],
            'concordancia': ['y', 'ni', 'o', 'pero', 'sino', 'mas', 'con', 'sin', 'para', 'por'],
            'preposicional': ['a', 'ante', 'bajo', 'cabe', 'con', 'contra', 'de', 'desde', 'en', 'entre', 'hacia', 'hasta', 'para', 'por', 'según', 'sin', 'so', 'sobre', 'tras'],
            'articulos': ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'the', 'a', 'an'],
            'pronombres': ['yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas', 'me', 'te', 'se', 'nos', 'os', 'lo', 'la', 'los', 'las', 'mi', 'tu', 'su', 'nuestro', 'vuestro']
        };
        this._familiaCaracteresCache = {};
        this._caracteresGenerados = new Set();
        this._ultimaGeneracionFamilia = 0;
        this._tiempoCacheFamilia = 3600000;
    }

    async initGramatical() {
        if (this._gramaticalInitDone) return this;
        console.log('📚 Inicializando Vigía Gramatical v22.0...');
        
        try {
            if (!this._initDone) await this.init();
            const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
            const usuario = await db.getUsuario();
            
            if (usuario?.id) {
                this._usuarioId = usuario.id;
                const metricas = await db.obtenerMetricasGramaticales(usuario.id, idioma);
                if (metricas) {
                    this._edadGramatical = metricas.edadGramatical || 0;
                    this._reglasDominadas = new Set(metricas.reglasDominadas || []);
                    this._reglasAprendiendo = new Set(metricas.reglasAprendiendo || []);
                    this._progresoPorNivel = metricas.progresoPorNivel || {};
                    console.log(`📊 Edad gramatical: ${this._edadGramatical}% (${this._getEdadNombre()})`);
                }
            }
            
            const reglas = await db.obtenerReglasGramaticales(idioma);
            this._reglasConocidas = reglas;
            
            if (reglas.length === 0) {
                console.log('📚 No hay reglas gramaticales. Generando plantilla inicial...');
                await this._generarPlantillaReglasInicial(idioma);
            }
            
            await this._actualizarEdadGramatical(idioma);
            this._gramaticalInitDone = true;
            console.log(`✅ Vigía Gramatical inicializado: ${this._reglasConocidas.length} reglas, edad ${this._edadGramatical}%`);
        } catch (e) {
            console.warn('⚠️ Error iniciando Vigía Gramatical:', e);
            this._gramaticalInitDone = true;
        }
        return this;
    }

    async _generarPlantillaReglasInicial(idioma) {
        const nivel = gestorIdiomas?.getInfoIdioma(idioma)?.nivel || 'A1';
        const idiomaNativo = await this._obtenerIdiomaNativo();
        const numReglas = 25;
        
        const template = {
            "_INSTRUCCIONES_PARA_IA": {
                "version": "1.0",
                "accion": "Genera reglas gramaticales para el idioma especificado",
                "idioma": idioma,
                "nivel": nivel,
                "num_reglas": numReglas,
                "idioma_nativo_del_usuario": idiomaNativo,
                "instrucciones": [
                    `1. Genera ${numReglas} reglas gramaticales para el nivel ${nivel} de ${idioma}`,
                    "2. Cada regla debe tener: nombre, explicación clara (en español), ejemplos (en el idioma con traducción)",
                    "3. Clasifica cada regla en una categoría",
                    "4. Las explicaciones deben ser comprensibles para un estudiante de nivel ${nivel}",
                    "5. Los ejemplos deben ser prácticos y cotidianos"
                ],
                "categorias_disponibles": ["estructura_oracional", "particulas", "tiempo_verbal", "concordancia", "preposiciones", "pronombres", "adverbios", "conjunciones", "clasificadores"],
                "ejemplo_de_regla": {
                    "nombre": "Nombre de la regla",
                    "explicacion": "Explicación detallada",
                    "ejemplos": ["Ejemplo 1 → Traducción", "Ejemplo 2 → Traducción"],
                    "categoria": "categoria_correspondiente"
                }
            },
            "meta": {
                "idioma": idioma,
                "nivel": nivel,
                "num_reglas": numReglas,
                "fecha_generacion": new Date().toISOString(),
                "generado_por": "PipelineNeuro_v22.0"
            },
            "reglas": []
        };
        
        for (let i = 0; i < numReglas; i++) {
            template.reglas.push({ "nombre": "", "explicacion": "", "ejemplos": [], "categoria": "" });
        }
        
        localStorage.setItem('pipeline_template_reglas', JSON.stringify(template));
        console.log('📄 Plantilla de reglas generada. Envía a IA para completar.');
        window.dispatchEvent(new CustomEvent('reglasTemplateGenerado', { detail: { template, idioma, nivel } }));
        return template;
    }

    async importarReglasGramaticales(jsonCompletado) {
        if (this._generandoReglas) return { error: 'Ya hay una importación en curso' };
        this._generandoReglas = true;
        
        try {
            const data = typeof jsonCompletado === 'string' ? JSON.parse(jsonCompletado) : jsonCompletado;
            if (!data.meta || !data.reglas || !Array.isArray(data.reglas)) {
                throw new Error('JSON inválido: falta "meta" o "reglas"');
            }
            
            const idioma = data.meta.idioma;
            const nivel = data.meta.nivel;
            const existentes = await db.obtenerReglasGramaticales(idioma);
            const existentesSet = new Set(existentes.map(r => r.regla.toLowerCase().trim()));
            
            let importadas = 0, duplicadas = 0, vacias = 0;
            
            for (const regla of data.reglas) {
                if (!regla.nombre || !regla.explicacion) { vacias++; continue; }
                const clave = regla.nombre.toLowerCase().trim();
                if (existentesSet.has(clave)) { duplicadas++; continue; }
                
                const reglaObj = {
                    idioma: idioma,
                    nivel: nivel,
                    tipo: regla.categoria || 'general',
                    regla: regla.nombre,
                    explicacion: regla.explicacion,
                    ejemplos: regla.ejemplos || [],
                    frecuencia: 50,
                    fechaCreacion: Date.now(),
                    ultimoUso: Date.now()
                };
                await db.guardarReglaGramatical(reglaObj);
                importadas++;
                existentesSet.add(clave);
            }
            
            this._reglasConocidas = await db.obtenerReglasGramaticales(idioma);
            await this._actualizarEdadGramatical(idioma);
            
            const resultado = { total: data.reglas.length, importadas, duplicadas, vacias };
            console.log(`✅ Reglas importadas: ${importadas} nuevas, ${duplicadas} duplicadas, ${vacias} vacías`);
            window.dispatchEvent(new CustomEvent('reglasGramaticalesImportadas', { detail: { idioma, nivel, ...resultado } }));
            return resultado;
        } catch (error) {
            console.error('❌ Error importando reglas:', error);
            return { error: error.message };
        } finally { this._generandoReglas = false; }
    }

    async generarTemplateReglas(idioma, nivel, numReglas = 25) {
        const idiomaNativo = await this._obtenerIdiomaNativo();
        const template = {
            "_INSTRUCCIONES_PARA_IA": {
                "version": "1.0",
                "accion": "Genera reglas gramaticales para el idioma especificado",
                "idioma": idioma,
                "nivel": nivel,
                "num_reglas": numReglas,
                "idioma_nativo_del_usuario": idiomaNativo,
                "instrucciones": [
                    `1. Genera ${numReglas} reglas gramaticales para el nivel ${nivel} de ${idioma}`,
                    "2. Cada regla debe tener: nombre, explicación clara (en español), ejemplos (en el idioma con traducción)",
                    "3. Clasifica cada regla en una categoría",
                    "4. Las explicaciones deben ser comprensibles para un estudiante de nivel ${nivel}",
                    "5. Los ejemplos deben ser prácticos y cotidianos"
                ],
                "categorias_disponibles": ["estructura_oracional", "particulas", "tiempo_verbal", "concordancia", "preposiciones", "pronombres", "adverbios", "conjunciones", "clasificadores"],
                "ejemplo_de_regla": {
                    "nombre": "Nombre de la regla",
                    "explicacion": "Explicación detallada",
                    "ejemplos": ["Ejemplo 1 → Traducción", "Ejemplo 2 → Traducción"],
                    "categoria": "categoria_correspondiente"
                }
            },
            "meta": {
                "idioma": idioma,
                "nivel": nivel,
                "num_reglas": numReglas,
                "fecha_generacion": new Date().toISOString(),
                "generado_por": "usuario"
            },
            "reglas": []
        };
        for (let i = 0; i < numReglas; i++) {
            template.reglas.push({ "nombre": "", "explicacion": "", "ejemplos": [], "categoria": "" });
        }
        return template;
    }

    async _actualizarEdadGramatical(idioma) {
        const infoUsuario = gestorIdiomas?.getInfoIdioma(idioma);
        const nivelUsuario = infoUsuario?.nivel || 'A1';
        const edadBase = this._edadPorNivel[nivelUsuario] || 20;
        const edadObjetivo = Math.min(95, edadBase + 15);
        
        const reglas = await db.obtenerReglasGramaticales(idioma);
        const totalReglas = reglas.length;
        const reglasPorNivel = this._getReglasPorNivel(reglas);
        
        const nivelIndex = this._niveles.indexOf(nivelUsuario);
        let reglasEsperadas = 0;
        for (const [nivel, reglasArray] of Object.entries(reglasPorNivel)) {
            const nivelIdx = this._niveles.indexOf(nivel);
            if (nivelIdx <= nivelIndex + 1) {
                reglasEsperadas += reglasArray.length;
            }
        }
        
        const coberturaReglas = totalReglas > 0 ? Math.min(1, totalReglas / Math.max(reglasEsperadas || totalReglas, 1)) : 0.5;
        
        this._edadGramatical = Math.round(edadObjetivo * (0.7 + 0.3 * coberturaReglas));
        const edadMinima = this._edadPorNivel[nivelUsuario] + 10;
        this._edadGramatical = Math.max(edadMinima, this._edadGramatical);
        
        if (this._usuarioId) {
            await db.guardarMetricasGramaticales({
                usuarioId: this._usuarioId,
                idioma: idioma,
                progresoGeneral: this._edadGramatical,
                reglasDominadas: Array.from(this._reglasDominadas),
                reglasAprendiendo: Array.from(this._reglasAprendiendo),
                reglasPendientes: totalReglas - this._reglasDominadas.size - this._reglasAprendiendo.size,
                edadGramatical: this._edadGramatical,
                progresoPorNivel: this._progresoPorNivel,
                ultimaActualizacion: Date.now()
            });
        }
        
        console.log(`🧠 Edad gramatical: ${this._edadGramatical}% (${this._getEdadNombre()}) | Usuario: ${nivelUsuario}`);
        window.dispatchEvent(new CustomEvent('vigiaGramaticalActualizado', { detail: { edad: this._edadGramatical, nombre: this._getEdadNombre() } }));
    }

    _getReglasPorNivel(reglas) {
        const porNivel = {};
        for (const r of reglas) {
            const nivel = r.nivel || 'A1';
            if (!porNivel[nivel]) porNivel[nivel] = [];
            porNivel[nivel].push(r);
        }
        return porNivel;
    }

    _getReglasPorNivelArray(reglas) {
        const resultado = [];
        const porNivel = this._getReglasPorNivel(reglas);
        for (const [nivel, reglasArray] of Object.entries(porNivel)) {
            for (const r of reglasArray) {
                resultado.push({ ...r, nivel: nivel });
            }
        }
        return resultado;
    }

    async _obtenerIdiomaNativo() {
        try {
            const usuario = await db.getUsuario();
            return usuario?.idiomaNativo || 'español';
        } catch (e) { return 'español'; }
    }

    _getEdadNombre() {
        for (const edad of this._EDADES) {
            if (this._edadGramatical >= edad.min && this._edadGramatical <= edad.max) return edad.nombre;
        }
        return this._EDADES[0].nombre;
    }

    _getEdadDescripcion() {
        for (const edad of this._EDADES) {
            if (this._edadGramatical >= edad.min && this._edadGramatical <= edad.max) return edad.descripcion;
        }
        return this._EDADES[0].descripcion;
    }

    _getEdadEmoji() {
        const nombre = this._getEdadNombre();
        if (nombre.includes('Bebé')) return '👶';
        if (nombre.includes('Niño')) return '🧒';
        if (nombre.includes('Joven')) return '🧑';
        if (nombre.includes('Adulto')) return '🧑‍🏫';
        if (nombre.includes('Experto')) return '👨‍🏫';
        if (nombre.includes('Sabio')) return '🧙';
        return '📚';
    }

    _getNivelDesdeEdad() {
        const edad = this._edadGramatical;
        if (edad >= 90) return 'C2';
        if (edad >= 75) return 'C1';
        if (edad >= 60) return 'B2';
        if (edad >= 45) return 'B1';
        if (edad >= 30) return 'A2';
        return 'A1';
    }

    async obtenerEstadisticasGramaticales(idioma) {
        const reglas = await db.obtenerReglasGramaticales(idioma);
        const frasesConReglas = await db.obtenerFrasesConReglasGramaticales(idioma);
        const porTipo = {}, porNivel = {};
        for (const r of reglas) {
            const tipo = r.tipo || 'general';
            porTipo[tipo] = (porTipo[tipo] || 0) + 1;
            const nivel = r.nivel || 'A1';
            porNivel[nivel] = (porNivel[nivel] || 0) + 1;
        }
        return {
            totalReglas: reglas.length,
            totalFrasesConReglas: frasesConReglas.length,
            porTipo, porNivel,
            edadGramatical: this._edadGramatical,
            edadNombre: this._getEdadNombre(),
            edadDescripcion: this._getEdadDescripcion(),
            edadEmoji: this._getEdadEmoji(),
            reglasDominadas: this._reglasDominadas.size,
            reglasAprendiendo: this._reglasAprendiendo.size,
            reglasPendientes: Math.max(0, reglas.length - this._reglasDominadas.size - this._reglasAprendiendo.size)
        };
    }

    getEstadoGramatical() {
        return {
            nombre: this._nombre,
            icono: this._icono,
            edad: this._edadGramatical,
            edadNombre: this._getEdadNombre(),
            edadDescripcion: this._getEdadDescripcion(),
            edadEmoji: this._getEdadEmoji(),
            reglasConocidas: this._reglasConocidas.length,
            reglasDominadas: this._reglasDominadas.size,
            reglasAprendiendo: this._reglasAprendiendo.size,
            enLinea: this.enLinea,
            initDone: this._gramaticalInitDone,
            modelo: this.modelo
        };
    }

    async chatGramatical(mensaje) {
        if (!this._gramaticalInitDone) await this.initGramatical();
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const estadisticas = await this.obtenerEstadisticasGramaticales(idioma);
        const nivelUsuario = gestorIdiomas?.getInfoActivo()?.nivel || 'A1';
        const nivelVigia = this._getNivelDesdeEdad();
        const reglas = this._reglasConocidas.slice(0, 15);
        const modeloActual = this._balanceador?.getModeloActivo() || this.modelo;
        
        const contexto = `Eres el Vigía Gramatical, un asistente experto en gramática del idioma ${idioma}.\n\n📊 DATOS IMPORTANTES:\n- Tu nivel de conocimiento: ${nivelVigia} (${this._edadGramatical}% de maestría)\n- El nivel del usuario: ${nivelUsuario}\n- Vas un paso por delante del usuario para guiarlo mejor\n- Conoces ${estadisticas.totalReglas} reglas gramaticales\n- Modelo actual: ${modeloActual}\n\n🎯 TU MISIÓN:\n1. Explica reglas del nivel del usuario (${nivelUsuario}) con claridad\n2. Si el usuario pregunta algo avanzado, indícalo pero responde\n3. Si el usuario demuestra dominio, sugiere conceptos del siguiente nivel\n4. Sé paciente, didáctico y usa ejemplos cotidianos\n5. Corrige con gentileza\n\nReglas que conoces (ejemplos):\n${reglas.map(r => `- ${r.regla}: ${r.explicacion.substring(0, 60)}...`).join('\n')}\n\nConsulta del usuario: "${mensaje}"\n\nResponde de forma útil, precisa y educativa.`;

        try {
            if (this.enLinea && this.apiKey && this._apiKeyValidada) {
                return await this._consultarGroq(contexto, 'text');
            }
            return this._respuestaOfflineGramatical(mensaje, idioma);
        } catch (e) {
            return this._respuestaOfflineGramatical(mensaje, idioma);
        }
    }

    _respuestaOfflineGramatical(mensaje, idioma) {
        return `📚 **Vigía Gramatical** (offline)\n\nEstoy en modo offline, pero puedo ayudarte con lo básico.\n\n🔍 **Sobre tu consulta:** "${mensaje}"\n\n💡 **Sugerencia:** Conecta Vigía (activa tu API Key) para respuestas más precisas.\n\n📊 **Mi estado:**\n- Edad gramatical: ${this._getEdadNombre()} (${this._edadGramatical}%)\n- Reglas conocidas: ${this._reglasConocidas.length}\n- Reglas dominadas: ${this._reglasDominadas.size}\n\n🌍 **Idioma:** ${idioma}\n📚 **Nivel del usuario:** ${gestorIdiomas?.getInfoActivo()?.nivel || 'A1'}\n\n¿Tienes alguna frase específica que quieras analizar?`;
    }

    async analizarFraseGramatical(frase) {
        if (!this._gramaticalInitDone) await this.initGramatical();
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const frases = await db.obtenerFrasesPorIdioma(idioma);
        const fraseObj = frases.find(f => f.original?.toLowerCase() === frase.toLowerCase() || f.traduccion?.toLowerCase() === frase.toLowerCase());
        
        if (!fraseObj) {
            return { error: true, mensaje: `No encontré la frase "${frase}" en tu base de datos.` };
        }
        
        if (this.enLinea && this.apiKey && this._apiKeyValidada) {
            try {
                const prompt = `Eres un experto lingüista. Analiza esta frase en ${idioma}:\nFRASE: "${fraseObj.original}"\nNIVEL: ${fraseObj.nivel || 'A1'}\n\nDevuelve JSON con: regla, explicacion, tipo, ejemplos.`;
                const analisis = await this._consultarGroq(prompt, 'json');
                return {
                    ...analisis,
                    frase: fraseObj,
                    mensaje: `📖 **Análisis gramatical de:** "${fraseObj.original}"\n\n🔍 **Regla:** ${analisis?.regla || 'No detectada'}\n📝 **Explicación:** ${analisis?.explicacion || 'No disponible'}`
                };
            } catch (e) {
                return this._analisisGramaticalOffline(fraseObj);
            }
        }
        return this._analisisGramaticalOffline(fraseObj);
    }

    _analisisGramaticalOffline(fraseObj) {
        return {
            frase: fraseObj,
            mensaje: `📖 **Análisis gramatical de:** "${fraseObj.original}"\n\n⚠️ *Análisis en modo offline (limitado)*\n\n💡 Conecta Vigía para un análisis completo.`
        };
    }

    // ============================================================
    // GENERAR FAMILIA DE CARACTERES
    // ============================================================

    _getNombreIdioma(idioma) {
        const nombres = {
            'zh': 'Chino',
            'zh-CN': 'Chino Simplificado',
            'zh-TW': 'Chino Tradicional',
            'ja': 'Japonés',
            'ko': 'Coreano',
            'vi': 'Vietnamita',
            'th': 'Tailandés'
        };
        return nombres[idioma] || idioma;
    }

    async generarFamiliaCaracteres(tema, idioma, nivel, numPalabras = 6, caracterRaiz = null, contextoHistorias = null) {
        if (!this._gramaticalInitDone) {
            await this.initGramatical();
        }

        const esJeroglifico = this._esJeroglifico(idioma);
        if (!esJeroglifico) {
            throw new Error(`El idioma "${idioma}" no es jeroglífico. Esta función solo funciona con idiomas asiáticos.`);
        }

        const nombreIdioma = this._getNombreIdioma(idioma);
        const idiomaNativo = await this._obtenerIdiomaNativo();

        const cacheKey = `${idioma}_${tema}_${nivel}_${caracterRaiz || 'auto'}`;
        if (this._familiaCaracteresCache[cacheKey] && 
            (Date.now() - this._ultimaGeneracionFamilia < this._tiempoCacheFamilia)) {
            console.log(`📌 Usando familia de caracteres en caché para "${tema}"`);
            return this._familiaCaracteresCache[cacheKey];
        }

        let caracterFinal = caracterRaiz;
        if (!caracterFinal) {
            const promptSugerencia = `
Eres un experto en el idioma ${nombreIdioma} (${idioma}). 
El usuario está aprendiendo ${idioma} a nivel ${nivel} sobre el tema: "${tema}".
${contextoHistorias ? `Contexto adicional de las historias del usuario: ${contextoHistorias.substring(0, 500)}` : ''}

Sugiere un CARÁCTER RAÍZ (el más común y versátil) que sea fundamental para hablar sobre este tema.
El carácter debe ser apropiado para el nivel ${nivel}.

Responde SOLO en formato JSON:
{
    "caracter": "el_caracter_sugerido",
    "significado_base": "significado_en_${idiomaNativo}",
    "razon": "breve_explicación_de_por_qué_es_importante",
    "frecuencia_en_historias": "alta/media/baja"
}`;
            try {
                const sugerencia = await this._consultarGroq(promptSugerencia, 'json');
                if (sugerencia && sugerencia.caracter) {
                    caracterFinal = sugerencia.caracter;
                    console.log(`📌 Carácter sugerido por IA: ${caracterFinal} (${sugerencia.significado_base})`);
                } else {
                    throw new Error('No se pudo obtener un carácter raíz de la IA.');
                }
            } catch (e) {
                console.warn('⚠️ Error obteniendo carácter sugerido, usando fallback:', e);
                const fallbacks = {
                    'educación': { 'zh': '学', 'ja': '学', 'ko': '학' },
                    'viajes': { 'zh': '行', 'ja': '行', 'ko': '행' },
                    'comida': { 'zh': '食', 'ja': '食', 'ko': '식' },
                    'familia': { 'zh': '家', 'ja': '家', 'ko': '가' },
                    'ciudad': { 'zh': '市', 'ja': '市', 'ko': '시' },
                    'tiempo': { 'zh': '时', 'ja': '時', 'ko': '시' },
                    'trabajo': { 'zh': '工', 'ja': '工', 'ko': '공' }
                };
                caracterFinal = fallbacks[tema]?.[idioma] || '学';
                console.log(`📌 Usando carácter fallback: ${caracterFinal}`);
            }
        }

        const prompt = `
Eres un experto en lingüística cognitiva y neurociencia del aprendizaje, especializado en idiomas logográficos como el ${nombreIdioma} (${idioma}).

Tu tarea es generar un JSON que represente una "Familia de Caracteres" para el aprendizaje neurocognitivo del idioma ${idioma}.

**DATOS DE ENTRADA:**
- Idioma: ${idioma}
- Nombre del idioma: ${nombreIdioma}
- Nivel MCER: ${nivel}
- Tema: "${tema}"
- Carácter raíz: "${caracterFinal}"
- Número de palabras derivadas: ${numPalabras}
- Idioma nativo del usuario: ${idiomaNativo}
${contextoHistorias ? `- Contexto de historias del usuario: ${contextoHistorias.substring(0, 300)}` : ''}

**ESTRUCTURA DEL JSON REQUERIDO:**

{
  "meta": {
    "idioma": "${idioma}",
    "nombre_idioma": "${nombreIdioma}",
    "tema": "${tema}",
    "nivel": "${nivel}",
    "caracter_raiz": "${caracterFinal}",
    "num_palabras": ${numPalabras},
    "idioma_nativo": "${idiomaNativo}",
    "fecha_generacion": "fecha_actual",
    "version": "22.0",
    "generado_por": "Vigía Gramatical"
  },
  "caracter_raiz": {
    "simbolo": "${caracterFinal}",
    "significado_base": "Significado principal en ${idiomaNativo}",
    "pinyin": "Romanización/pronunciación con tonos (ej: xué, gaku, hak)",
    "numero_trazos": 0,
    "estructura": {
      "trazos_clave": [
        {"nombre": "Nombre del trazo 1", "orden": 1},
        {"nombre": "Nombre del trazo 2", "orden": 2}
      ],
      "radicales": ["radical1", "radical2"],
      "tipo_estructura": "Ej: izquierda-derecha, arriba-abajo, envolvente"
    },
    "etimologia_breve": "Explicación del origen o evolución del carácter (máx 30 palabras)",
    "mnemotecnia": "Una frase o historia corta para recordar el carácter (ej: 'Una persona apoyada en un árbol para descansar')",
    "variantes": {
      "tradicional": "versión_tradicional_si_aplica",
      "simplificado": "versión_simplificada_si_aplica"
    }
  },
  "familia_palabras": [
    {
      "palabra": "Palabra derivada 1",
      "significado": "Significado en ${idiomaNativo}",
      "pinyin": "Pronunciación de la palabra completa",
      "desglose_morfologico": "Explicación de cómo se forma la palabra (ej: '${caracterFinal} + 生 = persona que aprende')",
      "desglose_caracteres": [
        {"caracter": "${caracterFinal}", "pinyin": "xué", "significado": "aprender"},
        {"caracter": "生", "pinyin": "shēng", "significado": "persona/nacer"}
      ],
      "asociacion_visual": "Pista visual o mnemotécnica para recordar esta palabra (ej: 'El estudiante es una persona que aprende')",
      "nivel_sugerido": "${nivel}",
      "ejemplo_frase": "Frase de ejemplo en ${idioma} con traducción al ${idiomaNativo}",
      "familia_semantica": "Categoría semántica (ej: 'Educación', 'Personas')"
    }
  ],
  "conexiones": {
    "caracteres_relacionados": [
      {"caracter": "otro_caracter", "relacion": "cómo_se_relaciona", "nivel": "${nivel}"}
    ],
    "temas_relacionados": ["${tema}", "tema_relacionado2"]
  },
  "ejercicios_sugeridos": {
    "tipo": "ordenar_trazos",
    "descripcion": "Ordena los trazos del carácter raíz",
    "dificultad": "media"
  }
}

**INSTRUCCIONES IMPORTANTES:**

1. El JSON debe ser 100% válido y completo.
2. Para el "pinyin", usa el sistema de romanización estándar del idioma con tonos (números o diacríticos).
3. La "mnemotecnia" debe ser una historia corta y memorable.
4. Las palabras derivadas deben ser PRÁCTICAS y USADAS EN LA VIDA COTIDIANA.
5. Para cada palabra, el "desglose_morfologico" debe explicar CLARAMENTE cómo se forma.
6. Las frases de ejemplo deben ser NATURALES y UTILIZABLES.
7. La "familia_semantica" debe ser una de las categorías comunes (Educación, Viajes, Comida, etc.).
8. Si el idioma tiene variantes (tradicional/simplificado), inclúyelas.
9. TODOS los campos deben estar completos. No uses placeholders.
10. Si se proporciona contexto de historias, úsalo para personalizar los ejemplos.

**IDIOMA: ${idioma}**
**TEMA: ${tema}**
**NIVEL: ${nivel}**
**CARÁCTER RAÍZ: ${caracterFinal}**
**NÚMERO DE PALABRAS: ${numPalabras}**
`;

        try {
            if (this.enLinea && this.apiKey && this._apiKeyValidada) {
                console.log(`🧠 Generando Familia de Caracteres para "${tema}" (${caracterFinal})...`);
                const resultado = await this._consultarGroq(prompt, 'json');
                
                if (resultado && resultado.meta && resultado.caracter_raiz) {
                    console.log(`✅ Familia de caracteres generada: ${resultado.caracter_raiz.simbolo} (${resultado.familia_palabras?.length || 0} palabras)`);
                    
                    if (resultado.meta) {
                        resultado.meta.fecha_generacion = new Date().toISOString();
                        resultado.meta.version = '22.0';
                        resultado.meta.generado_por = 'Vigía Gramatical';
                    }
                    
                    this._familiaCaracteresCache[cacheKey] = resultado;
                    this._ultimaGeneracionFamilia = Date.now();
                    this._caracteresGenerados.add(caracterFinal);
                    
                    window.dispatchEvent(new CustomEvent('familiaCaracteresGenerada', {
                        detail: { 
                            tema: tema, 
                            idioma: idioma, 
                            caracter: caracterFinal,
                            data: resultado 
                        }
                    }));
                    
                    await this._guardarFamiliaCaracteresEnDB(resultado, idioma);
                    
                    return resultado;
                } else {
                    throw new Error('La IA no devolvió una estructura válida para la familia de caracteres.');
                }
            } else {
                throw new Error('Vigía Gramatical está offline. Conéctate para generar familias de caracteres.');
            }
        } catch (error) {
            console.error('❌ Error generando familia de caracteres:', error);
            throw error;
        }
    }

    async _guardarFamiliaCaracteresEnDB(familiaData, idioma) {
        try {
            const caracterRaiz = familiaData.caracter_raiz;
            const simbolo = caracterRaiz.simbolo;
            
            const existente = await db.obtenerCaracterRaiz(simbolo, idioma);
            
            let raizId;
            if (existente) {
                raizId = existente.id;
                await db.guardarPalabra({
                    ...existente,
                    ...caracterRaiz,
                    esCaracterRaiz: true,
                    idioma: idioma,
                    tema: familiaData.meta.tema
                });
            } else {
                const raizObj = {
                    palabra: simbolo,
                    hanzi: simbolo,
                    pinyin: caracterRaiz.pinyin || '',
                    significado: caracterRaiz.significado_base || simbolo,
                    familia: 'caracter_raiz',
                    familias: ['caracter_raiz'],
                    familiaSemantica: 'Caracteres Raíz',
                    nivel: familiaData.meta.nivel || 'A1',
                    tipo: 'caracter_raiz',
                    idioma: idioma,
                    frecuencia: 1,
                    neuroScore: 0.5,
                    nivelDominio: 'nuevo',
                    fechaCreacion: Date.now(),
                    numero_trazos: caracterRaiz.numero_trazos || 0,
                    estructura: caracterRaiz.estructura || null,
                    etimologia_breve: caracterRaiz.etimologia_breve || '',
                    mnemotecnia: caracterRaiz.mnemotecnia || '',
                    variantes: caracterRaiz.variantes || null,
                    esCaracterRaiz: true,
                    tema: familiaData.meta.tema || ''
                };
                raizId = await db.guardarPalabra(raizObj);
            }
            
            for (const p of (familiaData.familia_palabras || [])) {
                const palabraText = p.palabra || '';
                if (!palabraText) continue;
                
                const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
                const existenteDerivada = todasPalabras.find(w => 
                    (w.palabra || w.hanzi || '') === palabraText
                );
                
                if (existenteDerivada) {
                    await db.guardarPalabra({
                        ...existenteDerivada,
                        esPalabraDerivada: true,
                        caracterRaiz: simbolo,
                        desgloseMorfologico: p.desglose_morfologico || '',
                        desgloseCaracteres: p.desglose_caracteres || [],
                        asociacionVisual: p.asociacion_visual || '',
                        ejemploFrase: p.ejemplo_frase || '',
                        familiaSemanticaPrincipal: p.familia_semantica || 'general',
                        temaFamilia: familiaData.meta.tema || '',
                        nivel: p.nivel_sugerido || familiaData.meta.nivel || 'A1'
                    });
                } else {
                    const derivadaObj = {
                        palabra: palabraText,
                        hanzi: palabraText,
                        pinyin: p.pinyin || '',
                        significado: p.significado || palabraText,
                        familia: p.familia_semantica || 'general',
                        familias: [p.familia_semantica || 'general'],
                        familiaSemantica: p.familia_semantica || 'general',
                        nivel: p.nivel_sugerido || familiaData.meta.nivel || 'A1',
                        tipo: 'sustantivo',
                        idioma: idioma,
                        frecuencia: 1,
                        neuroScore: 0.5,
                        nivelDominio: 'nuevo',
                        fechaCreacion: Date.now(),
                        esPalabraDerivada: true,
                        caracterRaiz: simbolo,
                        desgloseMorfologico: p.desglose_morfologico || '',
                        desgloseCaracteres: p.desglose_caracteres || [],
                        asociacionVisual: p.asociacion_visual || '',
                        ejemploFrase: p.ejemplo_frase || '',
                        familiaSemanticaPrincipal: p.familia_semantica || 'general',
                        temaFamilia: familiaData.meta.tema || ''
                    };
                    await db.guardarPalabra(derivadaObj);
                }
            }
            
            console.log(`✅ Familia de caracteres "${simbolo}" guardada en DB con ${familiaData.familia_palabras?.length || 0} derivadas`);
            
            window.dispatchEvent(new CustomEvent('familiaCaracteresGuardada', {
                detail: { 
                    caracter: simbolo,
                    idioma: idioma,
                    total: familiaData.familia_palabras?.length || 0
                }
            }));
            
            return true;
        } catch (e) {
            console.error('❌ Error guardando familia de caracteres en DB:', e);
            return false;
        }
    }

    async _analizarCaracteresDeHistoria(historia, idioma) {
        if (!historia || !historia.original) {
            return { caracteres: [], sugerencias: [], error: 'Historia inválida' };
        }

        const esJeroglifico = this._esJeroglifico(idioma);
        if (!esJeroglifico) {
            return { caracteres: [], sugerencias: [], error: 'El idioma no es jeroglífico' };
        }

        const texto = historia.original || '';
        const caracteresUnicos = [...new Set(texto.split(''))];
        
        const comunes = ['的', '了', '在', '是', '有', '和', '与', '这', '那', '一', '不', '也', '都', '很', '我', '你', '他', '她'];
        const caracteresFiltrados = caracteresUnicos.filter(c => 
            !comunes.includes(c) && c.length === 1 && /[\u4e00-\u9fff]/.test(c)
        );

        if (caracteresFiltrados.length === 0) {
            return { caracteres: [], sugerencias: [], error: 'No se encontraron caracteres significativos' };
        }

        const frecuencia = {};
        for (const c of texto) {
            if (caracteresFiltrados.includes(c)) {
                frecuencia[c] = (frecuencia[c] || 0) + 1;
            }
        }

        const caracteresPriorizados = Object.entries(frecuencia)
            .sort((a, b) => b[1] - a[1])
            .map(([caracter, count]) => ({ caracter, frecuencia: count }));

        const sugerencias = caracteresPriorizados.slice(0, 3).map(c => c.caracter);

        const sugerenciasFamilia = [];
        for (const c of sugerencias) {
            try {
                const existente = await db.obtenerCaracterRaiz(c, idioma);
                if (!existente) {
                    const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
                    const palabrasConCaracter = todasPalabras.filter(p => 
                        (p.palabra || p.hanzi || '').includes(c) && !p.esCaracterRaiz
                    );
                    
                    sugerenciasFamilia.push({
                        caracter: c,
                        palabras_relacionadas: palabrasConCaracter.slice(0, 5).map(p => p.palabra || p.hanzi),
                        total_relacionadas: palabrasConCaracter.length
                    });
                } else {
                    sugerenciasFamilia.push({
                        caracter: c,
                        ya_existe: true,
                        id: existente.id
                    });
                }
            } catch (e) {
                console.warn(`⚠️ Error analizando carácter ${c}:`, e);
            }
        }

        return {
            caracteres: caracteresPriorizados,
            sugerencias: sugerencias,
            sugerenciasFamilia: sugerenciasFamilia,
            total: caracteresFiltrados.length,
            esJeroglifico: true,
            idioma: idioma
        };
    }

    async generarFamiliasDesdeHistorias(historias, idioma, nivel = null) {
        if (!this._gramaticalInitDone) await this.initGramatical();
        
        const nivelFinal = nivel || gestorIdiomas?.getInfoActivo()?.nivel || 'A1';
        const resultados = [];
        
        const textoCompleto = historias.map(h => h.original || '').join(' ');
        
        const analisis = await this._analizarCaracteresDeHistoria({ original: textoCompleto }, idioma);
        
        if (analisis.error || analisis.sugerencias.length === 0) {
            console.warn('⚠️ No se pudieron analizar caracteres:', analisis.error);
            return resultados;
        }

        for (const caracter of analisis.sugerencias) {
            try {
                const existente = await db.obtenerCaracterRaiz(caracter, idioma);
                if (existente) {
                    console.log(`📌 Carácter "${caracter}" ya existe en DB`);
                    resultados.push({
                        caracter: caracter,
                        ya_existe: true,
                        id: existente.id
                    });
                    continue;
                }

                const tema = historias[0]?.tema || 'vocabulario general';
                const contexto = historias.map(h => h.original).join(' ');

                const familia = await this.generarFamiliaCaracteres(
                    tema,
                    idioma,
                    nivelFinal,
                    5,
                    caracter,
                    contexto
                );

                resultados.push({
                    caracter: caracter,
                    generado: true,
                    familia: familia
                });

                await new Promise(r => setTimeout(r, 500));

            } catch (e) {
                console.warn(`⚠️ Error generando familia para "${caracter}":`, e);
                resultados.push({
                    caracter: caracter,
                    error: e.message
                });
            }
        }

        return resultados;
    }

    async _explicarCaracter(caracter, idioma, nivel, contexto = '') {
        if (!this._gramaticalInitDone) await this.initGramatical();
        
        const nombreIdioma = this._getNombreIdioma(idioma);
        const idiomaNativo = await this._obtenerIdiomaNativo();

        const prompt = `
Eres un experto en lingüística cognitiva especializado en el idioma ${nombreIdioma} (${idioma}).

El usuario está aprendiendo ${idioma} a nivel ${nivel} y quiere entender mejor el carácter "${caracter}".

${contexto ? `Contexto adicional: ${contexto}` : ''}

Genera una explicación educativa y personalizada para este carácter que incluya:

1. **Significado básico** en ${idiomaNativo}
2. **Etimología breve**: de dónde viene y cómo ha evolucionado
3. **Estructura**: cómo está compuesto (radicales, partes)
4. **Consejo de memorización**: una pista o historia para recordarlo
5. **Errores comunes**: qué confunden los estudiantes al escribir este carácter
6. **Palabras comunes** que usan este carácter (2-3 ejemplos)

Responde en formato JSON:
{
    "significado": "significado_en_${idiomaNativo}",
    "etimologia": "explicación_breve",
    "estructura": "descripción_de_composición",
    "memorizacion": "consejo_para_recordarlo",
    "errores_comunes": ["error1", "error2"],
    "palabras_comunes": [
        {"palabra": "palabra1", "significado": "significado1"},
        {"palabra": "palabra2", "significado": "significado2"}
    ],
    "nivel_sugerido": "${nivel}"
}`;

        try {
            if (this.enLinea && this.apiKey && this._apiKeyValidada) {
                return await this._consultarGroq(prompt, 'json');
            }
            return {
                significado: 'Información offline',
                etimologia: 'Conecta Vigía para explicaciones detalladas',
                estructura: 'No disponible offline',
                memorizacion: 'Practica escribiendo el carácter',
                errores_comunes: [],
                palabras_comunes: [],
                nivel_sugerido: nivel
            };
        } catch (e) {
            console.warn('⚠️ Error generando explicación:', e);
            return null;
        }
    }

    async _evaluarProgresoCaracteres(usuarioId, idioma) {
        try {
            const caracteresRaiz = await db.obtenerFamiliasCaracteres(idioma);
            const progresos = await db.obtenerTodoProgreso();
            
            let total = 0;
            let dominados = 0;
            let enProgreso = 0;
            let pendientes = 0;
            let rcnTotal = 0;
            const recomendaciones = [];

            for (const familia of caracteresRaiz) {
                const raiz = familia.caracterRaiz;
                const progreso = progresos.find(p => p.fraseId === raiz.id);
                const rcn = progreso?.rcn || 0;
                
                total++;
                rcnTotal += rcn;
                
                if (rcn >= 4) {
                    dominados++;
                } else if (rcn >= 2) {
                    enProgreso++;
                } else {
                    pendientes++;
                    recomendaciones.push(`🔴 Repasa "${raiz.palabra}" (RCN: ${rcn.toFixed(1)})`);
                }
            }

            const rcnPromedio = total > 0 ? rcnTotal / total : 0;
            const porcentajeDominio = total > 0 ? Math.round((dominados / total) * 100) : 0;

            let recomendacionIA = null;
            if (this.enLinea && this.apiKey && this._apiKeyValidada && total > 0) {
                try {
                    const prompt = `
Eres Vigía Gramatical, experto en aprendizaje de idiomas.

El usuario está estudiando caracteres en ${idioma}.

Progreso del usuario:
- Total de caracteres: ${total}
- Dominados (RCN >= 4): ${dominados}
- En progreso (RCN >= 2): ${enProgreso}
- Pendientes (RCN < 2): ${pendientes}
- RCN promedio: ${rcnPromedio.toFixed(1)}
- Porcentaje de dominio: ${porcentajeDominio}%

Recomienda 3 consejos personalizados para mejorar el estudio de caracteres.
Responde en JSON:
{
    "consejos": ["consejo1", "consejo2", "consejo3"],
    "mensaje_motivador": "mensaje"
}`;
                    const iaResponse = await this._consultarGroq(prompt, 'json');
                    if (iaResponse) {
                        recomendacionIA = iaResponse;
                    }
                } catch (e) {
                    console.warn('⚠️ Error generando recomendación IA:', e);
                }
            }

            return {
                total,
                dominados,
                enProgreso,
                pendientes,
                rcnPromedio: Math.round(rcnPromedio * 10) / 10,
                porcentajeDominio,
                recomendaciones,
                recomendacionIA,
                nivelSugerido: this._getNivelDesdeEdad()
            };
        } catch (e) {
            console.error('❌ Error evaluando progreso de caracteres:', e);
            return null;
        }
    }

    async _analizarPatronesError(usuarioId, idioma) {
        try {
            const historial = await db.getAll('progreso');
            const progresosCaracteres = historial.filter(p => p.tipo === 'caracter' || p.tipo === 'caracter_derivada');
            
            if (progresosCaracteres.length === 0) {
                return { patrones: [], mensaje: 'No hay suficientes datos de caracteres para analizar.' };
            }

            const errores = progresosCaracteres.filter(p => p.rcn < 2);
            const aciertos = progresosCaracteres.filter(p => p.rcn >= 4);

            const patrones = {
                errores_repetidos: [],
                tipos_dificiles: [],
                recomendaciones: []
            };

            const erroresPorTipo = {};
            for (const e of errores) {
                const palabra = await db.get('palabras', e.fraseId);
                if (palabra && palabra.estructura) {
                    const tipo = palabra.estructura.tipo_estructura || 'desconocido';
                    if (!erroresPorTipo[tipo]) erroresPorTipo[tipo] = 0;
                    erroresPorTipo[tipo]++;
                }
            }

            const tiposOrdenados = Object.entries(erroresPorTipo).sort((a, b) => b[1] - a[1]);
            
            if (tiposOrdenados.length > 0) {
                patrones.tipos_dificiles = tiposOrdenados.slice(0, 3).map(([tipo, count]) => ({
                    tipo,
                    errores: count,
                    porcentaje: Math.round((count / errores.length) * 100)
                }));
            }

            if (errores.length > aciertos.length && errores.length > 5) {
                patrones.recomendaciones.push('📖 Dedica más tiempo a los caracteres que fallas con frecuencia.');
            }
            
            if (tiposOrdenados.length > 0 && tiposOrdenados[0][1] > errores.length * 0.3) {
                patrones.recomendaciones.push(`✍️ Practica más los caracteres con estructura "${tiposOrdenados[0][0]}".`);
            }

            if (patrones.recomendaciones.length === 0) {
                patrones.recomendaciones.push('🌟 ¡Buen trabajo! Sigue con el mismo ritmo.');
            }

            return patrones;
        } catch (e) {
            console.error('❌ Error analizando patrones:', e);
            return { patrones: [], mensaje: 'Error al analizar patrones.' };
        }
    }

    async generarMultiplesFamilias(idioma, nivel, temas = [], palabrasPorFamilia = 5) {
        const resultados = [];
        const idiomaLower = idioma.toLowerCase().trim();
        const esJeroglifico = this._esJeroglifico(idiomaLower);
        
        if (!esJeroglifico) {
            throw new Error(`El idioma "${idioma}" no es jeroglífico.`);
        }

        if (!temas || temas.length === 0) {
            const temasPorNivel = {
                'A1': ['familia', 'comida', 'casa', 'colores', 'animales', 'números'],
                'A2': ['viajes', 'tiempo', 'ropa', 'salud', 'trabajo', 'deportes'],
                'B1': ['educación', 'tecnología', 'arte', 'cultura', 'medio ambiente'],
                'B2': ['política', 'economía', 'ciencia', 'filosofía', 'psicología'],
                'C1': ['investigación', 'retórica', 'antropología', 'análisis crítico'],
                'C2': ['especialización', 'creación literaria', 'debate avanzado']
            };
            temas = temasPorNivel[nivel] || temasPorNivel['B1'];
        }

        const temasSeleccionados = temas.slice(0, 5);
        
        for (const tema of temasSeleccionados) {
            try {
                const resultado = await this.generarFamiliaCaracteres(
                    tema,
                    idioma,
                    nivel,
                    palabrasPorFamilia,
                    null
                );
                resultados.push(resultado);
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {
                console.warn(`⚠️ Error generando familia para "${tema}":`, e);
            }
        }

        return resultados;
    }
}

// ============================================================
// INSTANCIAS GLOBALES
// ============================================================

var vigia = new Vigia();
var vigiaGramatical = new VigiaGramatical();

console.log('✅ Vigía v22.3 - COMPLETO SIN HEALTH CHECKS');
console.log('  🔥 Health Checks: ELIMINADOS (sin peticiones automáticas)');
console.log('  🔥 Feedback Proactivo: ELIMINADO');
console.log('  🔥 Verificación de conexión: ELIMINADA');
console.log('  🔥 SOLO peticiones bajo demanda del usuario');
console.log('  ⚖️ Balanceador de carga integrado');
console.log('  🪙 Monitorización de tokens');
console.log('  📊 Transcripción fonética');
console.log('  🧠 Vigía Gramatical incluido');
console.log('  ✅ TODAS las funcionalidades originales preservadas');