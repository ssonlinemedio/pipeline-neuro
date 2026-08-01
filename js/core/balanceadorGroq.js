// ============================================================
// BALANCEADOR DE CARGA GROQ v1.2 - CORREGIDO
// ============================================================

class BalanceadorGroq {
    constructor() {
        this._modelos = []; // Lista de modelos disponibles desde Groq
        this._modeloActivo = null; // Modelo actualmente en uso
        this._modeloPrioritario = 'openai/gpt-oss-120b'; // Modelo prioritario
        this._estadoModelos = {}; // Estado de cada modelo: 'disponible', 'agotado', 'error'
        this._modeloEnPrueba = null; // Modelo en proceso de validación
        this._monitoreoActivo = false;
        this._intervaloMonitoreo = null;
        this._tiempoReintentoPrioritario = 60000; // Reintentar el prioritario cada 60s
        this._callbackCambioModelo = null;
        this._callbackEstado = null;
        this._ultimaFechaActualizacion = 0;
        this._intentosReconexion = 0;
        this._maxIntentosReconexion = 3;
        this._initDone = false;
        this._cacheModelos = null;
        this._usandoFallback = false;
        
        // 🔥 OPTIMIZACIÓN: Control de verificaciones
        this._ultimaVerificacion = {};
        this._verificacionEnCurso = {};
        this._tiempoMinimoEntreVerificaciones = 10000; // 10 segundos mínimo
        this._backoffVerificacion = {};
        this._maxBackoff = 300000; // 5 minutos máximo
    }

    // ============================================================
    // MÉTODOS PRINCIPALES
    // ============================================================

    async init() {
        if (this._initDone) return this;
        console.log('⚖️ BalanceadorGroq: Inicializando...');

        // Cargar modelos desde caché local primero
        this._cargarCacheModelos();

        // Intentar obtener la lista actualizada de modelos de Groq
        await this._actualizarListaModelos();

        // Si no hay modelos, usar los que tenemos por defecto
        if (this._modelos.length === 0) {
            this._modelos = [
                'openai/gpt-oss-120b',
                'qwen/qwen3.6-27b',
                'qwen/qwen3-32b',
                'llama-3.3-70b-versatile',
                'llama-3.1-8b-instant',
                'mixtral-8x7b-32768'
            ];
            this._guardarCacheModelos();
        }

        // Inicializar el estado de todos los modelos
        this._inicializarEstadoModelos();

        // Establecer el modelo activo inicial (prioritario)
        this._modeloActivo = this._modeloPrioritario;

        // Verificar disponibilidad del modelo prioritario
        await this._verificarDisponibilidadModelo(this._modeloPrioritario);

        // Iniciar el monitoreo
        this._iniciarMonitoreo();

        this._initDone = true;
        console.log(`✅ BalanceadorGroq: Inicializado. Modelo activo: ${this._modeloActivo}`);
        console.log(`   Modelos disponibles: ${this._modelos.join(', ')}`);
        return this;
    }

    // ============================================================
    // OBTENER LISTA DE MODELOS DESDE GROQ
    // ============================================================

    async _actualizarListaModelos() {
        try {
            const apiKey = localStorage.getItem('pipeline_api_key');
            if (!apiKey) {
                console.warn('⚠️ BalanceadorGroq: No hay API Key para obtener modelos');
                return;
            }

            console.log('📡 BalanceadorGroq: Obteniendo lista de modelos de Groq...');
            const response = await fetch('https://api.groq.com/openai/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const modelos = data.data || [];

            // Filtrar modelos relevantes (chat completions, excluir whisper, etc.)
            const modelosFiltrados = modelos
                .filter(m => {
                    const id = m.id;
                    // Excluir modelos de whisper (solo audio)
                    if (id.includes('whisper')) return false;
                    // Excluir modelos de embeddings
                    if (id.includes('embed')) return false;
                    // Incluir solo modelos de chat
                    return true;
                })
                .map(m => m.id);

            if (modelosFiltrados.length > 0) {
                this._modelos = modelosFiltrados;
                // Asegurar que el modelo prioritario esté en la lista
                if (!this._modelos.includes(this._modeloPrioritario)) {
                    this._modelos.unshift(this._modeloPrioritario);
                }
                this._guardarCacheModelos();
                console.log(`✅ BalanceadorGroq: ${this._modelos.length} modelos obtenidos de Groq`);
                return;
            }

            console.warn('⚠️ BalanceadorGroq: No se obtuvieron modelos de Groq, usando fallback');

        } catch (error) {
            console.error('❌ BalanceadorGroq: Error obteniendo modelos:', error);
        }

        // Usar modelos de caché o fallback
        this._cargarCacheModelos();
        if (this._modelos.length === 0) {
            this._modelos = ['openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'llama-3.3-70b-versatile'];
            this._guardarCacheModelos();
        }
    }

    _cargarCacheModelos() {
        try {
            const cache = localStorage.getItem('pipeline_groq_modelos_cache');
            if (cache) {
                const parsed = JSON.parse(cache);
                if (parsed.modelos && parsed.modelos.length > 0) {
                    this._modelos = parsed.modelos;
                    this._ultimaFechaActualizacion = parsed.fecha || 0;
                    console.log(`📦 BalanceadorGroq: Modelos cargados de caché (${this._modelos.length})`);
                    return;
                }
            }
        } catch (e) {
            console.warn('⚠️ BalanceadorGroq: Error cargando caché de modelos', e);
        }
        this._modelos = [];
    }

    _guardarCacheModelos() {
        try {
            localStorage.setItem('pipeline_groq_modelos_cache', JSON.stringify({
                modelos: this._modelos,
                fecha: Date.now()
            }));
        } catch (e) {
            console.warn('⚠️ BalanceadorGroq: Error guardando caché de modelos', e);
        }
    }

    // ============================================================
    // GESTIÓN DE ESTADO DE MODELOS
    // ============================================================

    _inicializarEstadoModelos() {
        for (const modelo of this._modelos) {
            this._estadoModelos[modelo] = {
                disponible: modelo === this._modeloPrioritario, // Solo el prioritario se considera disponible al inicio
                ultimaPrueba: 0,
                fallosConsecutivos: 0,
                tokensDisponibles: 10000, // Estimación inicial
                ultimoUso: 0
            };
            this._ultimaVerificacion[modelo] = 0;
            this._backoffVerificacion[modelo] = 0;
        }
    }

    // ============================================================
    // 🔥 VERIFICAR DISPONIBILIDAD - CORREGIDO
    // ============================================================

    async _verificarDisponibilidadModelo(modelo) {
        // 🔥 1. Si la verificación está en curso, devolver el estado actual
        if (this._verificacionEnCurso[modelo]) {
            console.log(`⏳ Verificación de ${modelo} en curso, devolviendo estado actual...`);
            return this._estadoModelos[modelo]?.disponible || false;
        }

        // 🔥 2. Verificar tiempo mínimo entre verificaciones (backoff)
        const ahora = Date.now();
        const tiempoDesdeUltima = ahora - (this._ultimaVerificacion[modelo] || 0);
        const tiempoMinimo = this._backoffVerificacion[modelo] || this._tiempoMinimoEntreVerificaciones;
        
        if (tiempoDesdeUltima < tiempoMinimo) {
            // Devolver el estado actual sin hacer una nueva verificación
            return this._estadoModelos[modelo]?.disponible || false;
        }

        // 🔥 3. Iniciar verificación
        this._verificacionEnCurso[modelo] = true;
        this._ultimaVerificacion[modelo] = ahora;

        try {
            const apiKey = localStorage.getItem('pipeline_api_key');
            if (!apiKey) {
                this._actualizarEstadoModelo(modelo, false, 'error');
                return false;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            // ============================================================
            // 🔥 CORRECCIÓN: Body con formato válido
            // ============================================================
            const requestBody = {
                model: modelo,
                messages: [
                    { role: 'system', content: 'Eres un asistente útil.' },
                    { role: 'user', content: 'Responde "OK" si estás funcionando.' }
                ],
                max_tokens: 2,
                temperature: 0.1
            };

            // 🔥 LOG PARA DEPURACIÓN (opcional, puedes comentarlo)
            console.log(`📤 Verificando modelo: ${modelo}`);

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const disponible = response.ok;

            if (response.status === 429) {
                // Límite de tasa excedido, agotado temporalmente
                this._actualizarEstadoModelo(modelo, false, 'agotado');
                // 🔥 Aumentar backoff para este modelo
                this._backoffVerificacion[modelo] = Math.min(
                    this._maxBackoff, 
                    (this._backoffVerificacion[modelo] || 0) + 5000
                );
                console.warn(`⚠️ Modelo ${modelo} agotado (429)`);
                return false;
            }

            if (response.status === 401 || response.status === 403) {
                // API Key inválida
                this._actualizarEstadoModelo(modelo, false, 'error');
                // 🔥 Aumentar backoff significativamente
                this._backoffVerificacion[modelo] = this._maxBackoff;
                console.error(`❌ API Key inválida para ${modelo}`);
                return false;
            }

            if (disponible) {
                const data = await response.json();
                // Estimar tokens disponibles
                const tokensUsados = data.usage?.total_tokens || 0;
                this._actualizarEstadoModelo(modelo, true, 'disponible', tokensUsados);
                // 🔥 Resetear backoff si está disponible
                this._backoffVerificacion[modelo] = 0;
                console.log(`✅ Modelo ${modelo} disponible`);
                return true;
            }

            this._actualizarEstadoModelo(modelo, false, 'error');
            // 🔥 Aumentar backoff
            this._backoffVerificacion[modelo] = Math.min(
                this._maxBackoff, 
                (this._backoffVerificacion[modelo] || 0) + 2000
            );
            console.warn(`⚠️ Modelo ${modelo} no disponible (${response.status})`);
            return false;

        } catch (error) {
            console.warn(`⚠️ BalanceadorGroq: Error verificando ${modelo}:`, error.message);
            this._actualizarEstadoModelo(modelo, false, 'error');
            // 🔥 Aumentar backoff en caso de error
            this._backoffVerificacion[modelo] = Math.min(
                this._maxBackoff, 
                (this._backoffVerificacion[modelo] || 0) + 3000
            );
            return false;
        } finally {
            this._verificacionEnCurso[modelo] = false;
        }
    }

    _actualizarEstadoModelo(modelo, disponible, estado, tokensUsados = 0) {
        if (!this._estadoModelos[modelo]) {
            this._estadoModelos[modelo] = {
                disponible: false,
                ultimaPrueba: 0,
                fallosConsecutivos: 0,
                tokensDisponibles: 10000,
                ultimoUso: 0
            };
        }

        const estadoActual = this._estadoModelos[modelo];
        estadoActual.disponible = disponible;
        estadoActual.ultimaPrueba = Date.now();

        if (estado === 'agotado') {
            estadoActual.fallosConsecutivos++;
            estadoActual.tokensDisponibles = 0;
        } else if (estado === 'error') {
            estadoActual.fallosConsecutivos++;
        } else {
            estadoActual.fallosConsecutivos = Math.max(0, estadoActual.fallosConsecutivos - 1);
            estadoActual.tokensDisponibles = Math.max(0, estadoActual.tokensDisponibles - (tokensUsados || 0));
        }

        if (estado === 'disponible' && disponible) {
            // Resetear fallos si está disponible
            estadoActual.fallosConsecutivos = 0;
            // 🔥 Resetear backoff
            this._backoffVerificacion[modelo] = 0;
        }

        this._estadoModelos[modelo] = estadoActual;
        this._notificarCambioEstado();
    }

    // ============================================================
    // BALANCEO DE CARGA
    // ============================================================

    async obtenerModeloDisponible(modeloSolicitado = null) {
        // Si se solicita un modelo específico y está disponible
        if (modeloSolicitado && this._estadoModelos[modeloSolicitado]?.disponible) {
            // Verificar que realmente esté disponible (prueba rápida)
            const disponible = await this._verificarDisponibilidadModelo(modeloSolicitado);
            if (disponible) {
                this._modeloActivo = modeloSolicitado;
                this._notificarCambioModelo();
                return modeloSolicitado;
            }
        }

        // Verificar el modelo actual
        if (this._modeloActivo && this._estadoModelos[this._modeloActivo]?.disponible) {
            const disponible = await this._verificarDisponibilidadModelo(this._modeloActivo);
            if (disponible) {
                return this._modeloActivo;
            }
        }

        // Intentar encontrar otro modelo disponible
        const modelosDisponibles = this._modelos.filter(m => {
            const estado = this._estadoModelos[m];
            return estado && estado.disponible && estado.fallosConsecutivos < 3;
        });

        // Priorizar modelos por número de tokens disponibles (estimado)
        modelosDisponibles.sort((a, b) => {
            const tokensA = this._estadoModelos[a]?.tokensDisponibles || 0;
            const tokensB = this._estadoModelos[b]?.tokensDisponibles || 0;
            return tokensB - tokensA;
        });

        if (modelosDisponibles.length > 0) {
            const modeloElegido = modelosDisponibles[0];
            // Verificar que realmente esté disponible
            const disponible = await this._verificarDisponibilidadModelo(modeloElegido);
            if (disponible) {
                this._modeloActivo = modeloElegido;
                this._notificarCambioModelo();
                console.log(`⚖️ BalanceadorGroq: Cambiando a modelo ${modeloElegido} (tokens disponibles: ${this._estadoModelos[modeloElegido]?.tokensDisponibles || 'N/A'})`);
                return modeloElegido;
            }
        }

        // Si no hay modelos disponibles, intentar con el prioritario
        console.warn('⚠️ BalanceadorGroq: No hay modelos disponibles, intentando con el prioritario...');
        const disponiblePrioritario = await this._verificarDisponibilidadModelo(this._modeloPrioritario);
        if (disponiblePrioritario) {
            this._modeloActivo = this._modeloPrioritario;
            this._notificarCambioModelo();
            return this._modeloPrioritario;
        }

        console.error('❌ BalanceadorGroq: No hay modelos disponibles');
        return null;
    }

    async obtenerModeloParaPeticion() {
        // Intentar siempre usar el modelo prioritario si está disponible
        const disponiblePrioritario = await this._verificarDisponibilidadModelo(this._modeloPrioritario);
        if (disponiblePrioritario) {
            this._modeloActivo = this._modeloPrioritario;
            this._notificarCambioModelo();
            return this._modeloPrioritario;
        }

        // Si no está disponible, buscar otro
        return await this.obtenerModeloDisponible();
    }

    // ============================================================
    // MONITOREO CONTINUO
    // ============================================================

    _iniciarMonitoreo() {
        if (this._monitoreoActivo) return;
        this._monitoreoActivo = true;

        // Verificar el estado de los modelos cada 30 segundos
        this._intervaloMonitoreo = setInterval(async () => {
            await this._monitorearModelos();
        }, 30000);

        // Verificar disponibilidad del prioritario cada minuto
        setInterval(async () => {
            if (this._modeloActivo !== this._modeloPrioritario) {
                const disponible = await this._verificarDisponibilidadModelo(this._modeloPrioritario);
                if (disponible) {
                    console.log(`⚖️ BalanceadorGroq: Modelo prioritario disponible, conmutando...`);
                    this._modeloActivo = this._modeloPrioritario;
                    this._notificarCambioModelo();
                    this._notificarCambioEstado();
                }
            }
        }, this._tiempoReintentoPrioritario);

        console.log('🔄 BalanceadorGroq: Monitoreo iniciado (cada 30s)');
    }

    async _monitorearModelos() {
        // Solo verificar modelos que no están disponibles y que no estén en backoff
        const ahora = Date.now();
        const modelosParaVerificar = this._modelos.filter(m => {
            const estado = this._estadoModelos[m];
            const tiempoDesdeUltima = ahora - (this._ultimaVerificacion[m] || 0);
            const tiempoMinimo = this._backoffVerificacion[m] || this._tiempoMinimoEntreVerificaciones;
            
            // Si el modelo está disponible y es el actual, verificar cada 2 minutos
            if (m === this._modeloActivo && estado?.disponible) {
                return tiempoDesdeUltima > 120000;
            }
            
            // Verificar si no está disponible o tiene fallos
            const necesitaVerificacion = !estado || !estado.disponible || estado.fallosConsecutivos > 2;
            return necesitaVerificacion && tiempoDesdeUltima > tiempoMinimo;
        });

        // Limitar a 3 verificaciones por ciclo
        const modelosLimitados = modelosParaVerificar.slice(0, 3);

        // Verificar los modelos
        for (const modelo of modelosLimitados) {
            await this._verificarDisponibilidadModelo(modelo);
            // Pequeña pausa entre verificaciones
            await new Promise(r => setTimeout(r, 500));
        }

        // Si el modelo actual no está disponible, buscar otro
        if (this._modeloActivo && !this._estadoModelos[this._modeloActivo]?.disponible) {
            await this.obtenerModeloDisponible();
        }

        this._notificarCambioEstado();
    }

    // ============================================================
    // NOTIFICACIONES
    // ============================================================

    _notificarCambioModelo() {
        if (this._callbackCambioModelo) {
            this._callbackCambioModelo(this._modeloActivo);
        }

        // Disparar evento global
        window.dispatchEvent(new CustomEvent('balanceadorModeloCambiado', {
            detail: {
                modelo: this._modeloActivo,
                timestamp: Date.now()
            }
        }));
    }

    _notificarCambioEstado() {
        if (this._callbackEstado) {
            this._callbackEstado(this._obtenerEstadoResumido());
        }

        window.dispatchEvent(new CustomEvent('balanceadorEstadoActualizado', {
            detail: {
                estado: this._obtenerEstadoResumido(),
                timestamp: Date.now()
            }
        }));
    }

    // ============================================================
    // OBTENER ESTADO
    // ============================================================

    _obtenerEstadoResumido() {
        const totalModelos = this._modelos.length;
        const disponibles = this._modelos.filter(m => this._estadoModelos[m]?.disponible).length;
        const agotados = this._modelos.filter(m => this._estadoModelos[m]?.fallosConsecutivos > 2).length;

        return {
            modelosTotal: totalModelos,
            modelosDisponibles: disponibles,
            modelosAgotados: agotados,
            modeloActivo: this._modeloActivo,
            modeloPrioritario: this._modeloPrioritario,
            usaPrioritario: this._modeloActivo === this._modeloPrioritario
        };
    }

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

    // ============================================================
    // REGISTRAR CALLBACKS
    // ============================================================

    onCambioModelo(callback) {
        this._callbackCambioModelo = callback;
    }

    onEstadoActualizado(callback) {
        this._callbackEstado = callback;
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

            // Si los tokens se están agotando, marcar como no disponible
            if (this._estadoModelos[modelo].tokensDisponibles < 100) {
                this._estadoModelos[modelo].disponible = false;
                this._notificarCambioEstado();
            }
        }
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

console.log('✅ Balanceador de Carga Groq v1.2 - CORREGIDO');
console.log('  🔥 Corregido: messages con formato válido para verificación');
console.log('  🔥 Añadido mensaje system + user con contenido real');
console.log('  🔥 max_tokens aumentado a 2 para mayor estabilidad');
console.log('  🔥 Logs de depuración para seguimiento');
console.log('  🎯 Todas las funcionalidades originales preservadas');