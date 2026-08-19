// ============================================================
// BALANCEADOR DE CARGA GROQ v2.4 - VERIFICACIÓN SOLO BAJO DEMANDA
// ============================================================

class BalanceadorGroq {
    constructor() {
        // 🔥 MODELO OSS FIJO Y PRIORITARIO
        this._modeloPrioritario = 'openai/gpt-oss-120b';
        this._modeloActivo = this._modeloPrioritario;
        this._modelos = [];
        this._estadoModelos = {};
        this._monitoreoActivo = false;
        this._intervaloMonitoreo = null;
        this._callbackCambioModelo = null;
        this._callbackEstado = null;
        this._ultimaFechaActualizacion = 0;
        this._initDone = false;
        
        // 🔥 SOLO VERIFICAMOS CUANDO OSS DA 429
        this._ultimaVerificacion = {};
        this._verificacionEnCurso = {};
        this._backoffVerificacion = {};
        this._maxBackoff = 300000; // 5 minutos
        this._modoEmergencia = false;
        this._ultimoError429 = 0;
        this._tiempoEsperaTras429 = 60000; // 1 minuto
        
        // 🔥 Modelos de respaldo (solo si OSS falla)
        this._FALLBACK_MODELOS = [
            'qwen/qwen3.6-27b',
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
            'mixtral-8x7b-32768'
        ];
        
        // 🔥 Cache de última respuesta exitosa
        this._ultimaRespuestaExitosa = 0;
        this._modeloDeUltimaRespuesta = null;
    }

    // ============================================================
    // INICIALIZACIÓN (SIN VERIFICACIONES AUTOMÁTICAS)
    // ============================================================

    async init() {
        if (this._initDone) {
            console.log('⚖️ BalanceadorGroq: Ya inicializado');
            return this;
        }
        
        console.log('⚖️ BalanceadorGroq v2.4: Inicializando (VERIFICACIÓN SOLO BAJO DEMANDA)...');
        console.log(`   🔥 MODELO PRIORITARIO: ${this._modeloPrioritario} (OSS)`);

        this._cargarCacheModelos();
        await this._actualizarListaModelos();
        this._asegurarModeloOSS();
        this._inicializarEstadoModelos();

        this._modeloActivo = this._modeloPrioritario;

        // 🔥 OSS disponible por defecto (optimista)
        if (this._estadoModelos[this._modeloPrioritario]) {
            this._estadoModelos[this._modeloPrioritario].disponible = true;
            this._estadoModelos[this._modeloPrioritario].fallosConsecutivos = 0;
        }

        console.log(`✅ BalanceadorGroq v2.4: Inicializado. Modelo activo: ${this._modeloActivo}`);
        console.log(`   🔥 OSS es PRIORITARIO y se usa SIEMPRE que esté disponible`);
        console.log(`   🔥 SOLO verifica OSS cuando recibe un error 429`);
        console.log(`   🔥 SIN verificaciones automáticas en segundo plano`);
        
        this._initDone = true;
        return this;
    }

    // ============================================================
    // 🔥 OBTENER MODELO PARA PETICIÓN (SOLO VERIFICA EN 429)
    // ============================================================

    async obtenerModeloParaPeticion() {
        const ahora = Date.now();

        // 🔥 1. Verificar si OSS está en modo de espera por 429
        const estadoOSS = this._estadoModelos[this._modeloPrioritario];
        const enEsperaPor429 = estadoOSS && 
                               !estadoOSS.disponible && 
                               (ahora - (estadoOSS.ultimaPrueba || 0) < this._tiempoEsperaTras429);

        // 🔥 2. Si OSS está disponible o no está en espera, intentar usarlo
        if (!enEsperaPor429 && (!estadoOSS || estadoOSS.disponible)) {
            this._modeloActivo = this._modeloPrioritario;
            this._notificarCambioModelo();
            return this._modeloPrioritario;
        }

        // 🔥 3. Si OSS está en espera por 429, buscar alternativas
        console.log(`⏳ OSS en espera por 429 (${Math.round((this._tiempoEsperaTras429 - (ahora - (estadoOSS?.ultimaPrueba || 0))) / 1000)}s restantes)`);
        
        // Buscar modelos disponibles (excluyendo OSS)
        const modelosDisponibles = this._modelos
            .filter(m => m !== this._modeloPrioritario)
            .filter(m => {
                const estado = this._estadoModelos[m];
                return estado && estado.disponible && estado.fallosConsecutivos < 2;
            });

        // Ordenar por éxito reciente
        modelosDisponibles.sort((a, b) => {
            const aExito = this._estadoModelos[a]?.ultimoExito || 0;
            const bExito = this._estadoModelos[b]?.ultimoExito || 0;
            return bExito - aExito;
        });

        if (modelosDisponibles.length > 0) {
            const modeloElegido = modelosDisponibles[0];
            this._modeloActivo = modeloElegido;
            this._notificarCambioModelo();
            console.log(`⚖️ Usando modelo alternativo: ${modeloElegido} (OSS en espera)`);
            return modeloElegido;
        }

        // 🔥 4. Último recurso: intentar OSS aunque esté en espera
        console.warn(`⚠️ No hay modelos alternativos disponibles. Reintentando OSS...`);
        this._modeloActivo = this._modeloPrioritario;
        this._notificarCambioModelo();
        return this._modeloPrioritario;
    }

    // ============================================================
    // 🔥 REGISTRAR FALLO (SOLO DISPARA VERIFICACIÓN EN 429)
    // ============================================================

    registrarFallo(modelo, error) {
        // Solo procesar si el error es 429 (límite de tasa)
        const es429 = error?.includes('429') || error?.includes('rate limit') || error?.includes('Rate limit');
        
        if (es429 && modelo === this._modeloPrioritario) {
            console.log(`🚨 OSS (${modelo}) devolvió 429 - Iniciando verificación...`);
            this._ultimoError429 = Date.now();
            
            // Marcar OSS como no disponible temporalmente
            if (this._estadoModelos[modelo]) {
                this._estadoModelos[modelo].disponible = false;
                this._estadoModelos[modelo].ultimaPrueba = Date.now();
                this._estadoModelos[modelo].fallosConsecutivos++;
            }

            // 🔥 Buscar alternativa INMEDIATAMENTE
            this._buscarAlternativaInmediata();
            
            // 🔥 Verificar OSS después de 1 minuto (solo una vez)
            setTimeout(() => {
                this._verificarOSS();
            }, this._tiempoEsperaTras429);
        } else if (es429) {
            // Si es 429 en otro modelo, solo registrar
            console.warn(`⚠️ Modelo ${modelo} devolvió 429 (no es OSS, ignorando)`);
            if (this._estadoModelos[modelo]) {
                this._estadoModelos[modelo].disponible = false;
                this._estadoModelos[modelo].fallosConsecutivos++;
            }
        }
    }

    // ============================================================
    // 🔥 BUSCAR ALTERNATIVA INMEDIATA (SIN VERIFICAR)
    // ============================================================

    _buscarAlternativaInmediata() {
        // Buscar modelos disponibles (excluyendo OSS)
        const modelosDisponibles = this._modelos
            .filter(m => m !== this._modeloPrioritario)
            .filter(m => {
                const estado = this._estadoModelos[m];
                return estado && estado.disponible !== false;
            });

        if (modelosDisponibles.length > 0) {
            const modeloElegido = modelosDisponibles[0];
            this._modeloActivo = modeloElegido;
            this._notificarCambioModelo();
            console.log(`⚖️ Cambiando a alternativa: ${modeloElegido} (OSS en espera)`);
        } else {
            console.warn('⚠️ No hay modelos alternativos disponibles');
        }
    }

    // ============================================================
    // 🔥 VERIFICAR OSS (SOLO DESPUÉS DE UN 429)
    // ============================================================

    async _verificarOSS() {
        const modelo = this._modeloPrioritario;
        
        // Si ya está disponible, no hacer nada
        if (this._estadoModelos[modelo]?.disponible) {
            console.log('✅ OSS ya está disponible');
            return;
        }

        console.log('🔍 Verificando OSS después de 429...');
        
        try {
            const apiKey = localStorage.getItem('pipeline_api_key');
            if (!apiKey) {
                console.warn('⚠️ No hay API Key para verificar OSS');
                return;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modelo,
                    messages: [{ role: 'user', content: 'OK' }],
                    max_tokens: 1,
                    temperature: 0
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.status === 429) {
                console.warn(`⚠️ OSS sigue en 429, esperando ${this._tiempoEsperaTras429/1000}s más...`);
                // Programar nueva verificación
                setTimeout(() => {
                    this._verificarOSS();
                }, this._tiempoEsperaTras429);
                return;
            }

            if (response.ok) {
                console.log('✅ OSS restaurado!');
                if (this._estadoModelos[modelo]) {
                    this._estadoModelos[modelo].disponible = true;
                    this._estadoModelos[modelo].fallosConsecutivos = 0;
                    this._estadoModelos[modelo].ultimaPrueba = Date.now();
                    this._estadoModelos[modelo].ultimoExito = Date.now();
                }
                this._modeloActivo = modelo;
                this._notificarCambioModelo();
                this._notificarCambioEstado();
                console.log('✅ OSS restaurado como modelo activo');
            } else {
                console.warn(`⚠️ OSS no disponible (${response.status}), reintentando en ${this._tiempoEsperaTras429/1000}s...`);
                setTimeout(() => {
                    this._verificarOSS();
                }, this._tiempoEsperaTras429);
            }
        } catch (error) {
            console.warn('⚠️ Error verificando OSS:', error.message);
            setTimeout(() => {
                this._verificarOSS();
            }, this._tiempoEsperaTras429);
        }
    }

    // ============================================================
    // REGISTRAR ÉXITO (RESTAURA OSS INMEDIATAMENTE)
    // ============================================================

    registrarExito(modelo, tokensUsados = 0) {
        this._ultimaRespuestaExitosa = Date.now();
        this._modeloDeUltimaRespuesta = modelo;
        this._modoEmergencia = false;
        
        if (this._estadoModelos[modelo]) {
            this._estadoModelos[modelo].ultimoExito = Date.now();
            this._estadoModelos[modelo].ultimoUso = Date.now();
            this._estadoModelos[modelo].tokensDisponibles = Math.max(0, 
                (this._estadoModelos[modelo].tokensDisponibles || 10000) - (tokensUsados || 0)
            );
            this._estadoModelos[modelo].fallosConsecutivos = 0;
            this._estadoModelos[modelo].disponible = true;
        }
        
        // 🔥 Si el éxito fue en OSS, restaurarlo como activo
        if (modelo === this._modeloPrioritario) {
            this._modeloActivo = this._modeloPrioritario;
            this._notificarCambioModelo();
            console.log('✅ OSS restaurando como modelo activo (éxito)');
        }
    }

    // ============================================================
    // REGISTRAR USO DE TOKENS
    // ============================================================

    registrarUsoTokens(modelo, tokensUsados) {
        if (this._estadoModelos[modelo]) {
            this._estadoModelos[modelo].tokensDisponibles = Math.max(0, 
                (this._estadoModelos[modelo].tokensDisponibles || 10000) - tokensUsados
            );
            this._estadoModelos[modelo].ultimoUso = Date.now();
        }
    }

    // ============================================================
    // MÉTODOS DE UTILIDAD (MANTENIDOS)
    // ============================================================

    _obtenerEstadoResumido() {
        const totalModelos = this._modelos?.length || 0;
        const disponibles = this._modelos?.filter(m => this._estadoModelos[m]?.disponible).length || 0;
        const ossDisponible = this._estadoModelos?.[this._modeloPrioritario]?.disponible || false;

        return {
            modelosTotal: totalModelos,
            modelosDisponibles: disponibles,
            modeloActivo: this._modeloActivo || this._modeloPrioritario,
            modeloPrioritario: this._modeloPrioritario,
            usaPrioritario: this._modeloActivo === this._modeloPrioritario,
            ossDisponible: ossDisponible,
            modoEmergencia: this._modoEmergencia || false,
            ultimaRespuestaExitosa: this._ultimaRespuestaExitosa || 0,
            modeloDeUltimaRespuesta: this._modeloDeUltimaRespuesta,
            fallosConsecutivos: this._fallosConsecutivos || 0,
            ultimoError429: this._ultimoError429 || 0
        };
    }

    _notificarCambioEstado() {
        const estado = this._obtenerEstadoResumido();
        if (this._callbackEstado) {
            try { this._callbackEstado(estado); } catch (e) {}
        }
        try {
            window.dispatchEvent(new CustomEvent('balanceadorEstadoActualizado', {
                detail: { estado, timestamp: Date.now() }
            }));
        } catch (e) {}
    }

    _notificarCambioModelo() {
        if (this._callbackCambioModelo) {
            try { this._callbackCambioModelo(this._modeloActivo); } catch (e) {}
        }
        try {
            window.dispatchEvent(new CustomEvent('balanceadorModeloCambiado', {
                detail: { modelo: this._modeloActivo, timestamp: Date.now() }
            }));
        } catch (e) {}
    }

    _asegurarModeloOSS() {
        this._modelos = this._modelos.filter(m => m !== this._modeloPrioritario);
        this._modelos.unshift(this._modeloPrioritario);
        this._modelos = [...new Set(this._modelos)];
    }

    async _actualizarListaModelos() {
        try {
            const apiKey = localStorage.getItem('pipeline_api_key');
            if (!apiKey) {
                this._usarModelosFallback();
                return;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('https://api.groq.com/openai/v1/models', {
                headers: { 'Authorization': `Bearer ${apiKey}` },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const modelos = data.data || [];

            const modelosFiltrados = modelos
                .filter(m => {
                    const id = m.id;
                    if (id.includes('whisper')) return false;
                    if (id.includes('embed')) return false;
                    if (id.includes('safeguard')) return false;
                    if (id.includes('prompt-guard')) return false;
                    if (id === 'groq/compound') return false;
                    if (id === 'groq/compound-mini') return false;
                    return true;
                })
                .map(m => m.id);

            if (modelosFiltrados.length > 0) {
                this._modelos = modelosFiltrados;
                this._asegurarModeloOSS();
                this._guardarCacheModelos();
                console.log(`✅ ${this._modelos.length} modelos obtenidos`);
                return;
            }

            this._usarModelosFallback();
        } catch (error) {
            console.warn('⚠️ Error obteniendo modelos:', error.message);
            this._usarModelosFallback();
        }
    }

    _usarModelosFallback() {
        this._modelos = [this._modeloPrioritario, ...this._FALLBACK_MODELOS];
        this._modelos = [...new Set(this._modelos)];
        this._guardarCacheModelos();
    }

    _cargarCacheModelos() {
        try {
            const cache = localStorage.getItem('pipeline_groq_modelos_cache');
            if (cache) {
                const parsed = JSON.parse(cache);
                if (parsed.modelos && parsed.modelos.length > 0) {
                    this._modelos = parsed.modelos.filter(m => 
                        m !== 'groq/compound' && 
                        m !== 'groq/compound-mini' &&
                        !m.includes('safeguard') &&
                        !m.includes('prompt-guard')
                    );
                    this._asegurarModeloOSS();
                    this._ultimaFechaActualizacion = parsed.fecha || 0;
                    return;
                }
            }
        } catch (e) {}
        this._modelos = [this._modeloPrioritario];
    }

    _guardarCacheModelos() {
        try {
            const modelosLimpios = this._modelos.filter(m => 
                m !== 'groq/compound' && 
                m !== 'groq/compound-mini' &&
                !m.includes('safeguard') &&
                !m.includes('prompt-guard')
            );
            localStorage.setItem('pipeline_groq_modelos_cache', JSON.stringify({
                modelos: modelosLimpios,
                fecha: Date.now()
            }));
        } catch (e) {}
    }

    _inicializarEstadoModelos() {
        const ahora = Date.now();
        for (const modelo of this._modelos) {
            this._estadoModelos[modelo] = {
                disponible: modelo === this._modeloPrioritario,
                ultimaPrueba: ahora,
                fallosConsecutivos: 0,
                tokensDisponibles: 10000,
                ultimoUso: 0,
                ultimoExito: 0
            };
            this._backoffVerificacion[modelo] = 0;
        }
    }

    // ============================================================
    // MÉTODOS PÚBLICOS
    // ============================================================

    getEstado() {
        return this._obtenerEstadoResumido();
    }

    getModeloActivo() {
        return this._modeloActivo;
    }

    getModeloPrioritario() {
        return this._modeloPrioritario;
    }

    getModelosDisponibles() {
        return this._modelos.filter(m => this._estadoModelos[m]?.disponible);
    }

    getEstadoModelo(modelo) {
        return this._estadoModelos[modelo] || null;
    }

    onCambioModelo(callback) {
        this._callbackCambioModelo = callback;
    }

    onEstadoActualizado(callback) {
        this._callbackEstado = callback;
    }

    // ============================================================
    // FORZAR RECONEXIÓN MANUAL
    // ============================================================

    async forzarReconexion() {
        console.log('🔄 Forzando reconexión manual...');
        
        // Resetear estado de OSS
        if (this._estadoModelos[this._modeloPrioritario]) {
            this._estadoModelos[this._modeloPrioritario].disponible = true;
            this._estadoModelos[this._modeloPrioritario].fallosConsecutivos = 0;
            this._estadoModelos[this._modeloPrioritario].ultimaPrueba = Date.now();
        }
        
        this._modeloActivo = this._modeloPrioritario;
        this._notificarCambioModelo();
        this._notificarCambioEstado();
        
        return { exito: true, modelo: this._modeloActivo };
    }

    // ============================================================
    // DESTRUIR
    // ============================================================

    destroy() {
        if (this._intervaloMonitoreo) {
            clearInterval(this._intervaloMonitoreo);
            this._intervaloMonitoreo = null;
        }
        this._monitoreoActivo = false;
        console.log('🛑 BalanceadorGroq: Destruido');
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

const balanceadorGroq = new BalanceadorGroq();
window.balanceadorGroq = balanceadorGroq;

console.log('✅ Balanceador de Carga Groq v2.4 - VERIFICACIÓN SOLO BAJO DEMANDA');
console.log('  🔥 MODELO FIJO: openai/gpt-oss-120b (SIEMPRE prioritario)');
console.log('  🔥 SOLO verifica OSS cuando recibe un error 429');
console.log('  🔥 SIN verificaciones automáticas en segundo plano');
console.log('  🔥 Backoff de 1 minuto después de un 429');
console.log('  🔥 Verificación programada única después de cada 429');
console.log('  🔥 Fallbacks solo si OSS está en espera');