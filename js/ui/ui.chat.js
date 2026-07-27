// ============================================================
// UI CHAT v19.6 - CORREGIDO: CARACTERES Y MODELO openai/gpt-oss-120b
// ============================================================

class UIChat {
    constructor() {
        this._chatMetricsInterval = null;
        this._feedbackMostrado = false;
        this._maxMensajesVisibles = 50;
        this._mensajeBienvenida = null;
        this._nivelRealUsuario = 'A1';
        this._NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        this._modeloActual = 'openai/gpt-oss-120b';
    }

    async init(core) {
        this.core = core;
        this._actualizarNivelReal();
        return this;
    }

    cargar(core) {
        this.core = core;
        this._actualizarNivelReal();
        const container = document.getElementById('vigiaChatProContainer');
        if (!container) {
            const chatContainer = document.createElement('div');
            chatContainer.id = 'vigiaChatProContainer';
            const module = document.getElementById('vigiaModule');
            if (module) module.appendChild(chatContainer);
        }
        this._cargarChatPro();
    }

    _actualizarNivelReal() {
        try {
            const infoActivo = gestorIdiomas?.getInfoActivo();
            if (infoActivo?.nivel) {
                this._nivelRealUsuario = infoActivo.nivel;
                console.log('Nivel real del usuario (gestor):', this._nivelRealUsuario);
                return;
            }
            
            const usuarioLocal = localStorage.getItem('pipeline_usuario');
            if (usuarioLocal) {
                const parsed = JSON.parse(usuarioLocal);
                if (parsed?.idiomasObjetivo?.length > 0) {
                    const nivel = parsed.idiomasObjetivo[0].nivel || 'A1';
                    this._nivelRealUsuario = nivel;
                    console.log('Nivel real del usuario (localStorage):', this._nivelRealUsuario);
                    return;
                }
            }
            
            db.getUsuario().then(usuario => {
                if (usuario?.idiomasObjetivo?.length > 0) {
                    const nivel = usuario.idiomasObjetivo[0].nivel || 'A1';
                    this._nivelRealUsuario = nivel;
                    console.log('Nivel real del usuario (db):', this._nivelRealUsuario);
                }
            }).catch(() => {});
            
        } catch (e) {
            console.warn('Error obteniendo nivel real:', e);
        }
    }

    _obtenerNivelRealUsuario() {
        if (!this._nivelRealUsuario || this._nivelRealUsuario === 'A1') {
            this._actualizarNivelReal();
        }
        return this._nivelRealUsuario || 'A1';
    }

    async _cargarChatPro() {
        const container = document.getElementById('vigiaChatProContainer');
        if (!container) return;
        
        this._actualizarNivelReal();
        const nivelReal = this._obtenerNivelRealUsuario();
        
        const enLinea = window.vigia ? window.vigia.enLinea : false;
        const estadoSalud = window.centinela ? window.centinela.estadoSalud : 'activo';
        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        const modoInversoActivo = modoInverso.isActivo();
        const modelo = window.vigia?.modelo || 'openai/gpt-oss-120b';
        const nombreModelo = this._obtenerNombreModelo(modelo);
        
        const historial = await db.obtenerChat();
        const ultimosMensajes = historial.slice(-this._maxMensajesVisibles);
        const totalMensajes = historial.length;
        const mensajesOcultos = totalMensajes - this._maxMensajesVisibles;
        
        const comandosHTML = this._generarComandosHTML();
        
        const mensajeBienvenida = `
            <div class="message system" id="mensajeBienvenida">
                <i class="fas fa-eye"></i>
                <div class="message-content" style="font-size:14px;line-height:1.7;">
                    <strong>Vigía (${nombreModelo}):</strong> Hola! Soy tu asistente neuroadaptativo PRO.
                    <br><br>
                    <strong>Tu nivel real es: <span style="color:var(--primary);font-weight:800;">${nivelReal}</span></strong>
                    <br><br>
                    <strong>Comandos disponibles:</strong>
                    <br>• <strong>/espacio</strong> → Abre el generador para anadir frases y palabras a Mi Espacio (nivel ${nivelReal})
                    <br>• <strong>/espacio-ver</strong> → Ver Mi Espacio organizado por nivel
                    <br>• <strong>/espacio-nivel [NIVEL]</strong> → Ver elementos de un nivel especifico
                    <br>• <strong>/espacio-familia [FAMILIA]</strong> → Ver elementos de una familia
                    <br>• <strong>palabras: hola, mundo, casa</strong> → Guarda vocabulario (nivel ${nivelReal})
                    <br>• <strong>frases: hola, adios, gracias</strong> → Guarda frases (nivel ${nivelReal})
                    <br>• <strong>/temas</strong> → Lista todos tus temas (manuales y predefinidos)
                    <br>• <strong>/generar [tema]</strong> → Abre el generador JSON para un tema predefinido (nivel ${nivelReal})
                    <br>• <strong>/temasnuevos</strong> → Sugiere temas para ampliar vocabulario (nivel ${nivelReal})
                    <br>• <strong>/jsonnuevo [tema]</strong> → Genera JSON con palabras nuevas (nivel ${nivelReal})
                    <br>• <strong>/revisar</strong> → Repasar palabras dificiles
                    <br>• <strong>/examen</strong> → Evaluar nivel
                    <br>• <strong>/analizar</strong> → Analizar progreso completo
                    <br>• <strong>/diagnostico</strong> → Diagnostico del sistema
                    <br>• <strong>/estadisticas</strong> → Estadisticas detalladas
                    <br>• <strong>/exportar</strong> → Exportar todos los datos
                    <br>• <strong>/reiniciar</strong> → Reiniciar fase actual
                    <br>• <strong>/nivel [NIVEL]</strong> → Cambiar nivel del idioma activo
                    <br>• <strong>/idiomas</strong> → Ver todos los idiomas configurados
                    <br>• <strong>/add [idioma] [nivel]</strong> → Anadir nuevo idioma
                    <br>• <strong>/remove [idioma]</strong> → Eliminar un idioma
                    <br>• <strong>/switch [idioma]</strong> → Cambiar idioma activo
                    <br>• <strong>/level [idioma] [nivel]</strong> → Cambiar nivel de un idioma
                    <br>• <strong>/modo</strong> → Alternar modo inverso
                    <br>• <strong>/feedback</strong> → Ver recomendaciones de Vigia
                    <br>• <strong>/clear</strong> → Limpiar todo el historial del chat
                    <br>• <strong>/help</strong> → Ver todos los comandos
                    <br><br>
                    ${comandosHTML}
                    <br>
                    <span style="font-size:11px;color:var(--gray-light);">
                        ${totalMensajes} mensajes en total · ${mensajesOcultos > 0 ? mensajesOcultos + ' mensajes ocultos (maximo ' + this._maxMensajesVisibles + ')' : 'Historial completo'}
                    </span>
                    <br>
                    <span style="font-size:10px;color:var(--gray-light);">
                        Modelo: ${nombreModelo}
                    </span>
                </div>
            </div>
        `;
        
        this._mensajeBienvenida = mensajeBienvenida;
        
        let mensajesHTML = mensajeBienvenida;
        
        for (const msg of ultimosMensajes) {
            const rol = msg.rol === 'user' ? 'user' : 'assistant';
            const icon = rol === 'user' ? 'fa-user' : 'fa-eye';
            const contenido = msg.mensaje.replace(/\n/g, '<br>');
            mensajesHTML += `
                <div class="message ${rol}">
                    <i class="fas ${icon}"></i>
                    <div class="message-content">${contenido}</div>
                </div>
            `;
        }
        
        let avisoOcultos = '';
        if (mensajesOcultos > 0) {
            avisoOcultos = `
                <div class="message system" style="opacity:0.7;font-size:12px;text-align:center;padding:8px;background:var(--bg);border-radius:8px;margin:4px 0;">
                    ${mensajesOcultos} mensajes antiguos ocultos (maximo ${this._maxMensajesVisibles} mostrados)
                    <button onclick="window.UIChat._cargarTodoHistorial()" style="
                        background:none;border:none;color:var(--primary);cursor:pointer;text-decoration:underline;font-size:12px;font-family:var(--font);
                    ">Ver todos</button>
                    · 
                    <button onclick="window.UIChat._chatLimpiarCompleto()" style="
                        background:none;border:none;color:var(--danger);cursor:pointer;text-decoration:underline;font-size:12px;font-family:var(--font);
                    ">Limpiar historial</button>
                </div>
            `;
        }
        
        const html = `
            <div class="chat-pro-container" style="display:flex;flex-direction:column;height:100%;min-height:600px;max-height:90vh;background:var(--white);border-radius:12px;overflow:hidden;box-shadow:var(--shadow);">
                <div class="chat-pro-header" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:var(--bg);border-bottom:1px solid var(--light);flex-shrink:0;flex-wrap:wrap;gap:8px;">
                    <div class="chat-pro-info" style="display:flex;align-items:center;gap:10px;">
                        <div class="chat-pro-avatar" style="position:relative;display:flex;align-items:center;">
                            <i class="fas fa-eye" style="font-size:24px;color:var(--primary);"></i>
                            <span class="chat-pro-status ${enLinea ? 'online' : 'offline'}" style="position:absolute;bottom:-2px;right:-2px;width:12px;height:12px;border-radius:50%;border:2px solid var(--white);${enLinea ? 'background:var(--success);' : 'background:var(--danger);'}"></span>
                        </div>
                        <div class="chat-pro-title">
                            <h3 style="font-size:15px;font-weight:700;color:var(--dark);margin:0;">Vigia IA <span class="chat-pro-model" style="font-size:10px;color:var(--gray-light);font-weight:400;">${nombreModelo}</span></h3>
                            <p class="chat-pro-subtitle" style="font-size:11px;color:var(--gray);margin:2px 0 0;">
                                ${enLinea ? 'Conectado' : 'Desconectado'}
                                ${estadoSalud ? ' · ' + estadoSalud : ''}
                                ${idiomaActivo ? ' · ' + idiomaActivo : ''}
                                ${modoInversoActivo ? ' · Inverso' : ''}
                                <span style="font-size:10px;color:var(--gray-light);margin-left:8px;">${totalMensajes} msgs</span>
                                <span style="font-size:10px;color:var(--primary);margin-left:8px;font-weight:600;">${nivelReal}</span>
                            </p>
                        </div>
                    </div>
                    <div class="chat-pro-actions" style="display:flex;gap:6px;">
                        <button class="icon-btn" onclick="window.UIChat._chatLimpiarCompleto()" title="Limpiar todo el historial" style="padding:6px 8px;background:none;border:none;color:var(--danger);cursor:pointer;font-size:16px;border-radius:6px;transition:all 0.3s;">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button class="icon-btn" onclick="window.UIChat._chatExportar()" title="Exportar chat" style="padding:6px 8px;background:none;border:none;color:var(--gray);cursor:pointer;font-size:16px;border-radius:6px;transition:all 0.3s;">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="icon-btn" onclick="window.UIChat._chatReconectar()" title="Reconectar" style="padding:6px 8px;background:none;border:none;color:var(--gray);cursor:pointer;font-size:16px;border-radius:6px;transition:all 0.3s;">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                
                <div class="chat-pro-metrics" style="display:flex;gap:6px;padding:8px 12px;background:var(--bg);border-bottom:1px solid var(--light);flex-wrap:wrap;flex-shrink:0;overflow-x:auto;">
                    <div class="metric-item" onclick="window.UIChat._mostrarMetricasDetalladas()" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--white);border-radius:6px;cursor:pointer;border:1px solid var(--light);transition:all 0.3s;flex-shrink:0;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--light)'">
                        <span class="metric-icon" style="font-size:14px;">RCN</span>
                        <span class="metric-value" id="chatNeuroRCN" style="font-size:13px;font-weight:700;color:var(--dark);">0.0</span>
                    </div>
                    <div class="metric-item" onclick="window.UIChat._mostrarMetricasDetalladas()" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--white);border-radius:6px;cursor:pointer;border:1px solid var(--light);transition:all 0.3s;flex-shrink:0;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--light)'">
                        <span class="metric-icon" style="font-size:14px;">Progreso</span>
                        <span class="metric-value" id="chatNeuroProgress" style="font-size:13px;font-weight:700;color:var(--dark);">0%</span>
                    </div>
                    <div class="metric-item" onclick="window.uiCore.irAModulo('config')" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--primary)10;border-radius:6px;cursor:pointer;border:2px solid var(--primary);transition:all 0.3s;flex-shrink:0;">
                        <span class="metric-icon" style="font-size:14px;">Nivel</span>
                        <span class="metric-value" id="chatNeuroLevel" style="font-size:13px;font-weight:800;color:var(--primary);">${nivelReal}</span>
                    </div>
                    <div class="metric-item" onclick="window.UIChat._mostrarMetricasDetalladas()" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--white);border-radius:6px;cursor:pointer;border:1px solid var(--light);transition:all 0.3s;flex-shrink:0;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--light)'">
                        <span class="metric-icon" style="font-size:14px;">Eficiencia</span>
                        <span class="metric-value" id="chatNeuroEficiencia" style="font-size:13px;font-weight:700;color:var(--dark);">0%</span>
                    </div>
                    <div class="metric-item" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--white);border-radius:6px;border:1px solid var(--light);flex-shrink:0;">
                        <span class="metric-icon" style="font-size:14px;">Racha</span>
                        <span class="metric-value" id="chatNeuroRacha" style="font-size:13px;font-weight:700;color:var(--dark);">0</span>
                    </div>
                    <div class="metric-item" onclick="window.UIChat._mostrarEstadisticasRapidas()" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--white);border-radius:6px;cursor:pointer;border:1px solid var(--light);transition:all 0.3s;flex-shrink:0;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--light)'">
                        <span class="metric-icon" style="font-size:14px;">Pendientes</span>
                        <span class="metric-value" id="chatPalabrasPendientes" style="font-size:13px;font-weight:700;color:var(--dark);">0</span>
                    </div>
                    <div class="metric-item" onclick="window.uiCore.irAModulo('espacio')" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--white);border-radius:6px;cursor:pointer;border:1px solid var(--light);transition:all 0.3s;flex-shrink:0;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--light)'">
                        <span class="metric-icon" style="font-size:14px;">Espacio</span>
                        <span class="metric-value" id="chatEspacioCount" style="font-size:13px;font-weight:700;color:var(--dark);">0</span>
                    </div>
                    <div class="metric-item" style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg);border-radius:6px;border:1px solid var(--gray-light);flex-shrink:0;">
                        <span class="metric-icon" style="font-size:14px;">Modelo</span>
                        <span class="metric-value" style="font-size:11px;font-weight:600;color:var(--gray);">${nombreModelo}</span>
                    </div>
                </div>
                
                <div class="chat-pro-suggestions" id="chatSuggestions" style="display:flex;flex-wrap:wrap;gap:4px;padding:6px 12px;background:var(--bg);border-bottom:1px solid var(--light);flex-shrink:0;">
                    ${this._generarSugerenciasHTML()}
                </div>
                
                <div class="chat-pro-messages" id="vigiaChatPro" style="flex:1;overflow-y:auto;padding:12px 16px;min-height:350px;max-height:60vh;background:var(--bg);display:flex;flex-direction:column;gap:4px;">
                    ${mensajesHTML}
                    ${avisoOcultos}
                </div>
                
                <div class="chat-pro-input" style="display:flex;flex-direction:column;gap:8px;padding:12px 16px;background:var(--white);border-top:2px solid var(--light);flex-shrink:0;">
                    <textarea id="vigiaInputPro" rows="4" placeholder="Escribe tu mensaje aqui... (Enter para enviar, Shift+Enter para nueva linea)" style="
                        width:100%;
                        padding:12px 16px;
                        border:2px solid var(--light);
                        border-radius:10px;
                        font-size:15px;
                        font-family:var(--font);
                        resize:vertical;
                        min-height:80px;
                        max-height:200px;
                        transition:all 0.3s;
                        background:var(--white);
                        color:var(--dark);
                        line-height:1.6;
                    " onfocus="this.style.borderColor='var(--primary)';this.style.boxShadow='0 0 0 4px rgba(108,92,231,0.1)'" onblur="this.style.borderColor='var(--light)';this.style.boxShadow='none'"></textarea>
                    <div class="chat-pro-input-actions" style="display:flex;justify-content:flex-end;gap:8px;">
                        <button class="chat-pro-send" onclick="window.UIChat._handleChatPro()" style="
                            padding:10px 28px;
                            font-size:15px;
                            font-weight:700;
                            border:none;
                            border-radius:8px;
                            cursor:pointer;
                            background:linear-gradient(135deg,#6C5CE7,#A29BFE);
                            color:white;
                            transition:all 0.3s;
                            font-family:var(--font);
                        " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                            <i class="fas fa-paper-plane"></i> Enviar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        const input = document.getElementById('vigiaInputPro');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this._handleChatPro();
                }
            });
            setTimeout(() => input.focus(), 100);
        }
        
        this._actualizarMetricasChatPro();
        
        if (this._chatMetricsInterval) clearInterval(this._chatMetricsInterval);
        this._chatMetricsInterval = setInterval(() => {
            this._actualizarMetricasChatPro();
        }, 5000);
    }

    _obtenerNombreModelo(modelo) {
        const nombres = {
            'openai/gpt-oss-120b': 'GPT OSS 120B',
            'gpt-oss-120b': 'GPT OSS 120B',
            'qwen/qwen3.6-27b': 'Qwen3.6 27B',
            'qwen/qwen3-32b': 'Qwen3 32B',
            'llama-3.3-70b-versatile': 'Llama 3.3 70B',
            'llama-3.1-8b-instant': 'Llama 3.1 8B',
            'mixtral-8x7b-32768': 'Mixtral 8x7B',
            'allam-2-7b': 'Allam 2 7B',
            'whisper-large-v3': 'Whisper Large V3',
            'canopylabs/orpheus-v1-english': 'Orpheus V1',
            'meta-llama/llama-4-scout-17b-16e-instruct': 'Llama 4 Scout 17B'
        };
        return nombres[modelo] || modelo || 'GPT OSS 120B';
    }

    _generarComandosHTML() {
        const nivelReal = this._obtenerNivelRealUsuario();
        const nombreModelo = this._obtenerNombreModelo(window.vigia?.modelo || 'openai/gpt-oss-120b');
        
        return `
            <div style="
                background: var(--bg);
                border-radius: 12px;
                padding: 12px 16px;
                margin: 8px 0;
                font-size: 12px;
                font-family: monospace;
                line-height: 1.8;
                border: 1px solid var(--light);
                max-height:200px;
                overflow-y:auto;
            ">
                <div style="font-weight:700;margin-bottom:4px;font-family:var(--font);">TODOS LOS COMANDOS (Nivel actual: ${nivelReal}) · Modelo: ${nombreModelo}:</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 16px;">
                    <span><span style="color:var(--secondary);font-weight:600;">/espacio</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Abrir generador Mi Espacio (nivel ${nivelReal})</span></span>
                    <span><span style="color:var(--secondary);font-weight:600;">palabras: a, b, c</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Guardar vocabulario (nivel ${nivelReal})</span></span>
                    <span><span style="color:var(--secondary);font-weight:600;">frases: a, b, c</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Guardar frases (nivel ${nivelReal})</span></span>
                    <span><span style="color:var(--secondary);font-weight:600;">/espacio-ver</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Ver Mi Espacio organizado por nivel</span></span>
                    <span><span style="color:var(--secondary);font-weight:600;">/espacio-nivel [NIVEL]</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Ver palabras/frases de un nivel</span></span>
                    <span><span style="color:var(--secondary);font-weight:600;">/espacio-familia [FAMILIA]</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Ver elementos de una familia</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/temas</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Listar todos los temas</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/generar [tema]</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Abrir generador JSON (nivel ${nivelReal})</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/temasnuevos</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Sugerir temas (nivel ${nivelReal})</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/jsonnuevo [tema]</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Generar JSON con palabras (nivel ${nivelReal})</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/revisar</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Repasar palabras dificiles</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/examen</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Evaluar nivel</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/analizar</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Progreso completo</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/diagnostico</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Diagnostico sistema</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/estadisticas</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Estadisticas</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/exportar</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Exportar datos</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/reiniciar</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Reiniciar fase</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/nivel [NIVEL]</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Cambiar nivel</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/idiomas</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Ver idiomas</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/add [idioma] [nivel]</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Anadir idioma</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/remove [idioma]</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Eliminar idioma</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/switch [idioma]</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Cambiar idioma</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/level [idioma] [nivel]</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Cambiar nivel idioma</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/modo</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Modo inverso</span></span>
                    <span><span style="color:var(--primary);font-weight:600;">/feedback</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Recomendaciones</span></span>
                    <span><span style="color:var(--danger);font-weight:600;">/clear</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Limpiar chat</span></span>
                    <span><span style="color:var(--success);font-weight:600;">/help</span> <span style="color:var(--gray);font-size:11px;font-family:var(--font);">Todos los comandos</span></span>
                </div>
            </div>
        `;
    }

    _generarSugerenciasHTML() {
        const sugerencias = [
            { id: 'espacio', icono: '⭐', texto: 'Mi Espacio' },
            { id: 'espacio-ver', icono: '📚', texto: 'Ver Espacio' },
            { id: 'espacio-nivel', icono: '🎯', texto: 'Por Nivel' },
            { id: 'espacio-familia', icono: '📂', texto: 'Por Familia' },
            { id: 'temas', icono: '📂', texto: 'Ver Temas' },
            { id: 'generar', icono: '🧠', texto: 'Generar JSON' },
            { id: 'temasnuevos', icono: '📚', texto: 'Temas Nuevos' },
            { id: 'jsonnuevo', icono: '📄', texto: 'JSON Nuevo' },
            { id: 'revisar', icono: '📖', texto: 'Revisar' },
            { id: 'examen', icono: '📝', texto: 'Examen' },
            { id: 'analizar', icono: '📊', texto: 'Analizar' },
            { id: 'diagnostico', icono: '🩺', texto: 'Diagnostico' },
            { id: 'estadisticas', icono: '📈', texto: 'Stats' },
            { id: 'nivel', icono: '🎯', texto: 'Nivel' },
            { id: 'idiomas', icono: '🌍', texto: 'Idiomas' },
            { id: 'modo', icono: '🔄', texto: 'Inverso' },
            { id: 'feedback', icono: '💡', texto: 'Feedback' },
            { id: 'clear', icono: '🗑️', texto: 'Limpiar' },
            { id: 'help', icono: '❓', texto: 'Ayuda' }
        ];
        
        return sugerencias.map(s => `
            <button class="suggestion-chip" onclick="window.UIChat._chatSugerencia('${s.id}')" style="
                padding:4px 12px;
                border-radius:16px;
                border:1px solid var(--light);
                background:var(--white);
                font-size:11px;
                cursor:pointer;
                transition:all 0.3s;
                font-family:var(--font);
                white-space:nowrap;
            " onmouseover="this.style.borderColor='var(--primary)';this.style.background='var(--primary)08'" onmouseout="this.style.borderColor='var(--light)';this.style.background='var(--white)'">
                ${s.icono} ${s.texto}
            </button>
        `).join('');
    }

    _agregarMensajeChatPro(rol, contenido) {
        const container = document.getElementById('vigiaChatPro');
        if (!container) return;
        
        const mensajesActuales = container.querySelectorAll('.message:not(.system)');
        if (mensajesActuales.length >= this._maxMensajesVisibles) {
            const primerMensaje = container.querySelector('.message:not(.system)');
            if (primerMensaje) {
                primerMensaje.remove();
            }
        }
        
        const div = document.createElement('div');
        div.className = 'message ' + rol;
        const icon = rol === 'user' ? 'fa-user' : 'fa-eye';
        
        const contenidoFormateado = contenido.replace(/\n/g, '<br>');
        
        div.innerHTML = '<i class="fas ' + icon + '"></i><div class="message-content">' + contenidoFormateado + '</div>';
        
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    async _handleChatPro() {
        const input = document.getElementById('vigiaInputPro');
        if (!input || !input.value.trim()) return;
        
        this._actualizarNivelReal();
        const nivelReal = this._obtenerNivelRealUsuario();
        const nombreModelo = this._obtenerNombreModelo(window.vigia?.modelo || 'openai/gpt-oss-120b');
        
        const mensaje = input.value.trim();
        
        if (mensaje.toLowerCase().trim() === '/clear') {
            await this._chatLimpiarCompleto();
            input.value = '';
            return;
        }
        
        if (mensaje.toLowerCase().trim() === '/espacio') {
            input.value = '';
            this._agregarMensajeChatPro('user', mensaje);
            
            if (typeof window.UIEspacio !== 'undefined' && window.UIEspacio !== null) {
                if (typeof window.UIEspacio.abrirModalEspacio === 'function') {
                    window.UIEspacio.abrirModalEspacio();
                    this._agregarMensajeChatPro('assistant', 
                        'Abriendo el generador de Mi Espacio...\n\n' +
                        'Nivel actual: ' + nivelReal + '\n\n' +
                        'Instrucciones:\n' +
                        '1. Escribe tus frases y palabras en los campos\n' +
                        '2. Las palabras se guardaran con nivel ' + nivelReal + '\n' +
                        '3. Pulsa "Generar JSON"\n' +
                        '4. Copia el JSON y pideselo a cualquier IA (yo uso ' + nombreModelo + ')\n' +
                        '5. Pega el resultado en el area "JSON Traducido"\n' +
                        '6. Pulsa "Importar a Mi Espacio"\n\n' +
                        'Organizacion: Nivel ' + nivelReal + ' -> Familia Semantica\n\n' +
                        'Modelo activo: ' + nombreModelo
                    );
                } else {
                    this._agregarMensajeChatPro('assistant', 'Error: El modulo Mi Espacio no esta disponible.');
                }
            } else {
                this._agregarMensajeChatPro('assistant', 'Error: El modulo Mi Espacio no esta disponible.');
            }
            return;
        }
        
        if (mensaje.toLowerCase().trim() === '/espacio-ver') {
            input.value = '';
            this._agregarMensajeChatPro('user', mensaje);
            
            if (window.UIEspacio) {
                window.UIEspacio._renderizarMiEspacio();
                this._agregarMensajeChatPro('assistant', 
                    'Mi Espacio - Organizacion por Nivel\n\n' +
                    'Tu nivel actual: ' + nivelReal + '\n\n' +
                    'Se ha actualizado la vista de Mi Espacio.\n' +
                    'Los elementos se organizan por:\n' +
                    '   Nivel -> Familia Semantica\n\n' +
                    'Puedes usar:\n' +
                    '   /espacio-nivel [NIVEL] para ver un nivel especifico\n' +
                    '   /espacio-familia [FAMILIA] para ver una familia\n' +
                    '   palabras: ... para guardar vocabulario\n' +
                    '   frases: ... para guardar frases'
                );
            } else {
                this._agregarMensajeChatPro('assistant', 'Error: El modulo Mi Espacio no esta disponible.');
            }
            return;
        }
        
        const nivelMatch = mensaje.match(/^\/espacio-nivel\s+([A-C][1-2])$/i);
        if (nivelMatch) {
            const nivel = nivelMatch[1].toUpperCase();
            input.value = '';
            this._agregarMensajeChatPro('user', mensaje);
            
            if (this._NIVELES.includes(nivel)) {
                const info = await this._obtenerInfoNivelEspacio(nivel);
                if (info) {
                    this._agregarMensajeChatPro('assistant', info);
                } else {
                    this._agregarMensajeChatPro('assistant', 'No hay elementos guardados en el nivel ' + nivel + '.\n\nGuarda palabras o frases desde los ejercicios o usa el comando /espacio para anadir contenido.');
                }
            } else {
                this._agregarMensajeChatPro('assistant', 'Nivel "' + nivel + '" invalido. Usa: A1, A2, B1, B2, C1, C2');
            }
            return;
        }
        
        const familiaMatch = mensaje.match(/^\/espacio-familia\s+(.+)$/i);
        if (familiaMatch) {
            const familia = familiaMatch[1].trim();
            input.value = '';
            this._agregarMensajeChatPro('user', mensaje);
            
            const info = await this._obtenerInfoFamiliaEspacio(familia);
            if (info) {
                this._agregarMensajeChatPro('assistant', info);
            } else {
                this._agregarMensajeChatPro('assistant', 'No hay elementos en la familia "' + familia + '".\n\nGuarda palabras o frases con esta familia semantica desde los ejercicios.');
            }
            return;
        }
        
        if (mensaje.toLowerCase().includes('frases:')) {
            const anadidos = await this._procesarComandoFrases(mensaje);
            if (anadidos > 0) {
                this._agregarMensajeChatPro('user', mensaje);
                this._agregarMensajeChatPro('assistant', 
                    'Se han guardado ' + anadidos + ' frases en Mi Espacio.\n\n' +
                    'Nivel: ' + nivelReal + '\n' +
                    'Se organizaran por: Nivel ' + nivelReal + ' -> Familia Semantica\n\n' +
                    'Usa /espacio-ver para verlas organizadas.'
                );
                this._actualizarMetricasChatPro();
                return;
            }
        }
        
        if (mensaje.toLowerCase().includes('palabras:')) {
            const anadidos = await this._procesarComandoPalabras(mensaje);
            if (anadidos > 0) {
                this._agregarMensajeChatPro('user', mensaje);
                this._agregarMensajeChatPro('assistant', 
                    'Se han guardado ' + anadidos + ' palabras en Mi Espacio.\n\n' +
                    'Nivel: ' + nivelReal + '\n' +
                    'Se organizaran por: Nivel ' + nivelReal + ' -> Familia Semantica\n\n' +
                    'Usa /espacio-ver para verlas organizadas.'
                );
                this._actualizarMetricasChatPro();
                return;
            }
        }
        
        input.value = '';
        this._agregarMensajeChatPro('user', mensaje);
        this._mostrarIndicadorEscritura();
        
        try {
            const comando = this._detectarComandoChat(mensaje);
            let respuesta;
            
            if (comando) {
                respuesta = await this._ejecutarComandoChat(comando);
            } else {
                respuesta = await this._consultarVigiaPro(mensaje);
            }
            
            this._quitarIndicadorEscritura();
            
            const container = document.getElementById('vigiaChatPro');
            if (container) {
                const mensajes = container.querySelectorAll('.message:not(.system)');
                while (mensajes.length >= this._maxMensajesVisibles) {
                    const primero = container.querySelector('.message:not(.system)');
                    if (primero) primero.remove();
                }
            }
            
            this._agregarMensajeChatPro('assistant', respuesta);
            
            await db.guardarMensaje('user', mensaje);
            await db.guardarMensaje('assistant', respuesta);
            
            this._actualizarMetricasChatPro();
            
        } catch (error) {
            this._quitarIndicadorEscritura();
            this._agregarMensajeChatPro('assistant', 'Error: ' + error.message);
            console.error('Error en chat:', error);
        }
    }

    async _procesarComandoFrases(mensaje) {
        const match = mensaje.match(/frases?\s*:\s*([^\.\n]+)/i);
        if (!match) return 0;
        
        const frasesList = match[1].split(',').map(f => f.trim()).filter(f => f.length > 0);
        const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
        const nivel = this._obtenerNivelRealUsuario();
        const nombreNivel = 'Nivel ' + nivel;
        
        let anadidos = 0;
        
        for (const texto of frasesList) {
            const existentes = await db.obtenerFrases();
            const existe = existentes.some(f => 
                f.original === texto && f.idioma === idioma
            );
            
            if (!existe) {
                const fraseObj = {
                    original: texto,
                    traduccion: 'Traduccion pendiente de "' + texto + '"',
                    idioma: idioma,
                    nivel: nivel,
                    familiaSemantica: 'Seleccionadas por Usuario',
                    palabras: [],
                    activa: true,
                    rg: 0,
                    rcn: 0,
                    esJeroglifico: window.UIEspacio ? window.UIEspacio._esJeroglifico(idioma) : false,
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
                    await gestorFavoritos.añadirFrase(id);
                    await gestorFavoritos.añadirFraseAGrupo(id, nombreNivel);
                    await gestorFavoritos.añadirFraseAGrupo(id, 'Seleccionadas por Usuario');
                    anadidos++;
                }
            }
        }
        
        if (anadidos > 0) {
            if (window.uiCore) window.uiCore._actualizarEspacioStats();
            if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this.core);
            if (window.UIEspacio) window.UIEspacio._renderizarMiEspacio();
        }
        
        return anadidos;
    }

    async _procesarComandoPalabras(mensaje) {
        const match = mensaje.match(/palabras?\s*:\s*([^\.\n]+)/i);
        if (!match) return 0;
        
        const palabrasList = match[1].split(',').map(p => p.trim()).filter(p => p.length > 0);
        const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
        const nivel = this._obtenerNivelRealUsuario();
        const nombreNivel = 'Nivel ' + nivel;
        
        let anadidos = 0;
        
        for (const palabraText of palabrasList) {
            const existentes = await db.obtenerPalabras();
            const existe = existentes.some(p => 
                (p.palabra || p.hanzi || '').toLowerCase() === palabraText.toLowerCase() &&
                p.idioma === idioma
            );
            
            if (!existe) {
                const palabraObj = {
                    palabra: palabraText,
                    hanzi: palabraText,
                    significado: palabraText,
                    familia: 'sustantivo',
                    familiaSemantica: 'Seleccionadas por Usuario',
                    nivel: nivel,
                    tipo: 'sustantivo',
                    idioma: idioma,
                    frecuencia: 1,
                    neuroScore: 0.5,
                    nivelDominio: 'nuevo',
                    fechaCreacion: Date.now()
                };
                
                const id = await db.guardarPalabra(palabraObj);
                if (id) {
                    await gestorFavoritos.añadirPalabra(id);
                    await gestorFavoritos.añadirPalabraAGrupo(id, nombreNivel);
                    await gestorFavoritos.añadirPalabraAGrupo(id, 'Seleccionadas por Usuario');
                    anadidos++;
                }
            }
        }
        
        if (anadidos > 0) {
            if (window.uiCore) window.uiCore._actualizarEspacioStats();
            if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this.core);
            if (window.UIEspacio) window.UIEspacio._renderizarMiEspacio();
        }
        
        return anadidos;
    }

    async _obtenerInfoNivelEspacio(nivel) {
        try {
            const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
            await gestorFavoritos.recargar();
            
            const todasFrases = await gestorFavoritos.obtenerFrasesFavoritas();
            const todasPalabras = await gestorFavoritos.obtenerPalabrasFavoritas();
            
            const frases = todasFrases.filter(f => f.idioma === idioma && (f.nivel || 'B1') === nivel);
            const palabras = todasPalabras.filter(p => p.idioma === idioma && (p.nivel || 'B1') === nivel);
            
            if (frases.length === 0 && palabras.length === 0) {
                return null;
            }
            
            let respuesta = 'Nivel ' + nivel + ' en Mi Espacio\n\n';
            respuesta += palabras.length + ' palabras · ' + frases.length + ' frases\n\n';
            
            const familias = {};
            
            for (const p of palabras) {
                const familia = p.familiaSemantica || p.familia || 'sin_clasificar';
                if (!familias[familia]) familias[familia] = { palabras: [], frases: [] };
                familias[familia].palabras.push(p);
            }
            
            for (const f of frases) {
                const familia = f.familiaSemantica || 'sin_clasificar';
                if (!familias[familia]) familias[familia] = { palabras: [], frases: [] };
                familias[familia].frases.push(f);
            }
            
            const familiasOrdenadas = Object.keys(familias).sort();
            
            for (const familia of familiasOrdenadas) {
                const data = familias[familia];
                const total = data.palabras.length + data.frases.length;
                respuesta += '\nFamilia: ' + familia + ' (' + total + ' elementos)\n';
                
                if (data.palabras.length > 0) {
                    const palabrasMostrar = data.palabras.slice(0, 5).map(p => {
                        const texto = p.hanzi || p.palabra || '';
                        const pinyin = p.pinyin || '';
                        return texto + (pinyin ? ' (' + pinyin + ')' : '');
                    }).join(', ');
                    respuesta += '   ' + palabrasMostrar + (data.palabras.length > 5 ? ' ... +' + (data.palabras.length - 5) + ' mas' : '') + '\n';
                }
                
                if (data.frases.length > 0) {
                    const frasesMostrar = data.frases.slice(0, 3).map(f => '"' + f.original + '"').join(', ');
                    respuesta += '   ' + frasesMostrar + (data.frases.length > 3 ? ' ... +' + (data.frases.length - 3) + ' mas' : '') + '\n';
                }
            }
            
            respuesta += '\nUsa /espacio-familia [FAMILIA] para ver los detalles de una familia.';
            return respuesta;
            
        } catch (error) {
            console.error('Error obteniendo info del nivel:', error);
            return null;
        }
    }

    async _obtenerInfoFamiliaEspacio(familia) {
        try {
            const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
            await gestorFavoritos.recargar();
            
            const todasFrases = await gestorFavoritos.obtenerFrasesFavoritas();
            const todasPalabras = await gestorFavoritos.obtenerPalabrasFavoritas();
            
            const frases = todasFrases.filter(f => 
                f.idioma === idioma && 
                (f.familiaSemantica || '').toLowerCase() === familia.toLowerCase()
            );
            
            const palabras = todasPalabras.filter(p => 
                p.idioma === idioma && 
                (p.familiaSemantica || p.familia || '').toLowerCase() === familia.toLowerCase()
            );
            
            if (frases.length === 0 && palabras.length === 0) {
                return null;
            }
            
            let respuesta = 'Familia: ' + familia + '\n\n';
            
            const niveles = {};
            
            for (const p of palabras) {
                const nivel = p.nivel || 'B1';
                if (!niveles[nivel]) niveles[nivel] = { palabras: [], frases: [] };
                niveles[nivel].palabras.push(p);
            }
            
            for (const f of frases) {
                const nivel = f.nivel || 'B1';
                if (!niveles[nivel]) niveles[nivel] = { palabras: [], frases: [] };
                niveles[nivel].frases.push(f);
            }
            
            const nivelesOrdenados = Object.keys(niveles).sort((a, b) => {
                return this._NIVELES.indexOf(a) - this._NIVELES.indexOf(b);
            });
            
            for (const nivel of nivelesOrdenados) {
                const data = niveles[nivel];
                respuesta += '\nNivel ' + nivel + ' (' + (data.palabras.length + data.frases.length) + ' elementos)\n';
                
                if (data.palabras.length > 0) {
                    const palabrasMostrar = data.palabras.map(p => {
                        const texto = p.hanzi || p.palabra || '';
                        const pinyin = p.pinyin || '';
                        return texto + (pinyin ? ' (' + pinyin + ')' : '');
                    }).join(', ');
                    respuesta += '   ' + palabrasMostrar + '\n';
                }
                
                if (data.frases.length > 0) {
                    const frasesMostrar = data.frases.map(f => '"' + f.original + '"').join(', ');
                    respuesta += '   ' + frasesMostrar + '\n';
                }
            }
            
            respuesta += '\nUsa /espacio-nivel [NIVEL] para ver un nivel completo.';
            return respuesta;
            
        } catch (error) {
            console.error('Error obteniendo info de la familia:', error);
            return null;
        }
    }

    _detectarComandoChat(mensaje) {
        const cmd = mensaje.toLowerCase().trim();
        
        const comandos = [
            { key: '/espacio-ver', accion: 'espacio_ver' },
            { key: '/espacio-nivel', accion: 'espacio_nivel' },
            { key: '/espacio-familia', accion: 'espacio_familia' },
            { key: '/espacio', accion: 'espacio' },
            { key: '/temas', accion: 'temas' },
            { key: '/generar', accion: 'generar' },
            { key: '/temasnuevos', accion: 'temas_nuevos' },
            { key: '/jsonnuevo', accion: 'json_nuevo' },
            { key: '/revisar', accion: 'revisar' },
            { key: '/examen', accion: 'examen' },
            { key: '/nivel', accion: 'nivel' },
            { key: '/analizar', accion: 'analizar' },
            { key: '/diagnostico', accion: 'diagnostico' },
            { key: '/estadisticas', accion: 'estadisticas' },
            { key: '/exportar', accion: 'exportar' },
            { key: '/help', accion: 'help' },
            { key: '/reiniciar', accion: 'reiniciar' },
            { key: '/idiomas', accion: 'list_idiomas' },
            { key: '/add', accion: 'add_idioma' },
            { key: '/remove', accion: 'remove_idioma' },
            { key: '/switch', accion: 'switch_idioma' },
            { key: '/level', accion: 'level_idioma' },
            { key: '/modo', accion: 'modo' },
            { key: '/feedback', accion: 'feedback' },
            { key: '/clear', accion: 'clear' }
        ];
        
        for (const c of comandos) {
            if (cmd === c.key || cmd.startsWith(c.key + ' ')) {
                const parametros = cmd.replace(c.key, '').trim();
                return { accion: c.accion, parametros: parametros };
            }
        }
        
        return null;
    }

    async _ejecutarComandoChat(comando) {
        const nivelReal = this._obtenerNivelRealUsuario();
        
        switch(comando.accion) {
            case 'espacio_ver':
                if (window.UIEspacio) {
                    window.UIEspacio._renderizarMiEspacio();
                    return 'Mi Espacio - Organizacion por Nivel\n\nNivel actual: ' + nivelReal + '\n\nSe ha actualizado la vista. Los elementos se organizan por:\n   Nivel -> Familia Semantica\n\nUsa /espacio-nivel [NIVEL] para ver un nivel especifico.';
                }
                return 'Error: El modulo Mi Espacio no esta disponible.';
                
            case 'espacio_nivel':
                const nivel = comando.parametros.toUpperCase();
                if (!this._NIVELES.includes(nivel)) {
                    return 'Nivel "' + comando.parametros + '" invalido. Usa: A1, A2, B1, B2, C1, C2';
                }
                const info = await this._obtenerInfoNivelEspacio(nivel);
                if (info) return info;
                return 'No hay elementos guardados en el nivel ' + nivel + '.';
                
            case 'espacio_familia':
                const familia = comando.parametros;
                if (!familia) return 'Especifica una familia. Ej: /espacio-familia Transporte';
                const infoFamilia = await this._obtenerInfoFamiliaEspacio(familia);
                if (infoFamilia) return infoFamilia;
                return 'No hay elementos en la familia "' + familia + '".';
                
            case 'espacio':
                if (typeof window.UIEspacio !== 'undefined' && window.UIEspacio !== null) {
                    if (typeof window.UIEspacio.abrirModalEspacio === 'function') {
                        window.UIEspacio.abrirModalEspacio();
                        const nombreModelo = this._obtenerNombreModelo(window.vigia?.modelo || 'openai/gpt-oss-120b');
                        return 'Abriendo el generador de Mi Espacio...\n\nNivel actual: ' + nivelReal + '\n\nLas palabras y frases se guardaran con nivel ' + nivelReal + ' y se organizaran por:\n   Nivel ' + nivelReal + ' -> Familia Semantica\n\nModelo activo: ' + nombreModelo;
                    }
                }
                return 'Error: El modulo Mi Espacio no esta disponible.';
                
            default:
                return await this._comandoGenerico(comando);
        }
    }

    async _comandoGenerico(comando) {
        const metodos = {
            'temas': '_comandoTemas',
            'generar': '_comandoGenerar',
            'temas_nuevos': '_comandoTemasNuevos',
            'json_nuevo': '_comandoJSONNuevo',
            'revisar': '_comandoRevisar',
            'examen': '_comandoExamen',
            'nivel': '_comandoNivel',
            'analizar': '_comandoAnalizar',
            'diagnostico': '_comandoDiagnostico',
            'estadisticas': '_comandoEstadisticas',
            'exportar': '_comandoExportar',
            'help': '_comandoHelp',
            'reiniciar': '_comandoReiniciar',
            'list_idiomas': '_comandoListIdiomas',
            'add_idioma': '_comandoAddIdioma',
            'remove_idioma': '_comandoRemoveIdioma',
            'switch_idioma': '_comandoSwitchIdioma',
            'level_idioma': '_comandoLevelIdioma',
            'modo': '_comandoModo',
            'feedback': '_comandoFeedback'
        };
        
        const metodo = metodos[comando.accion];
        if (metodo && typeof this[metodo] === 'function') {
            return await this[metodo](comando.parametros);
        }
        
        return 'Comando no reconocido. Escribe /help para ver los comandos disponibles.';
    }

    _comandoHelp() {
        const nivelReal = this._obtenerNivelRealUsuario();
        const nombreModelo = this._obtenerNombreModelo(window.vigia?.modelo || 'openai/gpt-oss-120b');
        
        return `
AYUDA - TODOS LOS COMANDOS DISPONIBLES

Tu nivel actual: ${nivelReal}
Modelo activo: ${nombreModelo}

- - - - - - - - - - - - - - - - - - - - - - - - - - -

MI ESPACIO (Nivel ${nivelReal})
/espacio -> Abre el generador para anadir frases y palabras
/espacio-ver -> Ver Mi Espacio organizado por nivel
/espacio-nivel [NIVEL] -> Ver elementos de un nivel especifico
/espacio-familia [FAMILIA] -> Ver elementos de una familia
palabras: a, b, c -> Guarda palabras (nivel ${nivelReal})
frases: a, b, c -> Guarda frases (nivel ${nivelReal})

- - - - - - - - - - - - - - - - - - - - - - - - - - -

TEMAS
/temas -> Lista todos tus temas
/generar [TEMA] -> Abre el generador JSON para un tema
/temasnuevos -> Sugiere temas para ampliar vocabulario
/jsonnuevo [TEMA] -> Genera JSON con palabras nuevas

- - - - - - - - - - - - - - - - - - - - - - - - - - -

IDIOMAS
/idiomas -> Ver todos los idiomas configurados
/add [idioma] [nivel] -> Anadir nuevo idioma
/remove [idioma] -> Eliminar un idioma
/switch [idioma] -> Cambiar idioma activo
/level [idioma] [nivel] -> Cambiar nivel de un idioma
/nivel [NIVEL] -> Cambiar tu nivel actual (actual: ${nivelReal})

- - - - - - - - - - - - - - - - - - - - - - - - - - -

ESTUDIO
/revisar -> Ver palabras dificiles para repasar
/examen -> Generar examen de nivel
/modo -> Alternar modo inverso

- - - - - - - - - - - - - - - - - - - - - - - - - - -

ANALISIS
/analizar -> Analizar progreso completo
/diagnostico -> Diagnostico del sistema
/estadisticas -> Estadisticas detalladas
/feedback -> Ver recomendaciones de Vigia

- - - - - - - - - - - - - - - - - - - - - - - - - - -

HERRAMIENTAS
/exportar -> Exportar todos los datos
/reiniciar -> Reiniciar fase actual
/clear -> Limpiar todo el historial del chat

- - - - - - - - - - - - - - - - - - - - - - - - - - -

EJEMPLOS DE MI ESPACIO:
/espacio-ver -> Ver todo organizado por nivel
/espacio-nivel B1 -> Ver solo nivel B1
/espacio-familia Transporte -> Ver familia Transporte
frases: hola, adios, gracias -> Guardar frases con nivel ${nivelReal}
palabras: casa, perro, gato -> Guardar palabras con nivel ${nivelReal}

En que mas puedo ayudarte?
`;
    }

    _chatSugerencia(tipo) {
        const input = document.getElementById('vigiaInputPro');
        if (!input) return;
        
        const comandos = {
            'espacio': '/espacio',
            'espacio-ver': '/espacio-ver',
            'espacio-nivel': '/espacio-nivel ',
            'espacio-familia': '/espacio-familia ',
            'temas': '/temas',
            'generar': '/generar ',
            'temasnuevos': '/temasnuevos',
            'jsonnuevo': '/jsonnuevo ',
            'revisar': '/revisar',
            'examen': '/examen',
            'analizar': '/analizar',
            'diagnostico': '/diagnostico',
            'estadisticas': '/estadisticas',
            'feedback': '/feedback',
            'nivel': '/nivel',
            'idiomas': '/idiomas',
            'modo': '/modo',
            'clear': '/clear',
            'help': '/help'
        };
        
        input.value = comandos[tipo] || '';
        input.focus();
        
        if (tipo === 'espacio-nivel') {
            const nivelReal = this._obtenerNivelRealUsuario();
            const nivel = prompt('Que nivel quieres ver? (Actual: ' + nivelReal + ')', nivelReal);
            if (nivel && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(nivel.toUpperCase())) {
                input.value = '/espacio-nivel ' + nivel.toUpperCase();
            }
        }
        
        if (tipo === 'espacio-familia') {
            const familia = prompt('Que familia semantica quieres ver?', 'Transporte');
            if (familia) {
                input.value = '/espacio-familia ' + familia;
            }
        }
    }

    _mostrarIndicadorEscritura() {
        const container = document.getElementById('vigiaChatPro');
        if (!container) return;
        
        const div = document.createElement('div');
        div.id = 'chatTypingIndicator';
        div.className = 'message system';
        div.innerHTML = '<i class="fas fa-eye"></i><div class="message-content" style="color:var(--gray);"><i class="fas fa-spinner fa-spin"></i> Vigia (' + this._obtenerNombreModelo(window.vigia?.modelo || 'openai/gpt-oss-120b') + ') esta pensando...</div>';
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    _quitarIndicadorEscritura() {
        const indicator = document.getElementById('chatTypingIndicator');
        if (indicator) indicator.remove();
    }

    async _chatLimpiarCompleto() {
        const confirmar = await this.core.confirm(
            'Limpiar todo el historial del chat?\n\nEsta accion:\n• Eliminara TODOS los mensajes del historial\n• No se puede deshacer\n• El chat comenzara de nuevo con el mensaje de bienvenida',
            'Limpiar historial'
        );
        
        if (!confirmar) return;
        
        try {
            const historial = await db.obtenerChat();
            for (const msg of historial) {
                await db.delete('chat', msg.id);
            }
            
            const container = document.getElementById('vigiaChatPro');
            if (container) {
                container.innerHTML = this._mensajeBienvenida || '';
            }
            
            this.core.mostrarToast('Chat limpiado completamente', 'success');
            this._cargarChatPro();
            
        } catch (error) {
            console.error('Error limpiando chat:', error);
            this.core.mostrarToast('Error al limpiar el chat', 'error');
        }
    }

    async _cargarTodoHistorial() {
        this.core.mostrarToast('Cargando todo el historial...', 'info');
        this._maxMensajesVisibles = 9999;
        await this._cargarChatPro();
        this.core.mostrarToast('Historial completo cargado', 'success');
        setTimeout(() => {
            this._maxMensajesVisibles = 50;
        }, 100);
    }

    async _mostrarMetricasDetalladas() {
        const stats = await db.obtenerEstadisticasNeuro();
        const usuario = await db.getUsuario();
        const nivel = this._obtenerNivelRealUsuario();
        const progreso = await db.obtenerTodoProgreso();
        const racha = await gestorNiveles._calcularRacha(progreso);
        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        const modoInversoActivo = modoInverso.isActivo();
        const favoritos = await gestorFavoritos.contarFavoritos();
        const temas = await db.obtenerTemas();
        const nombreModelo = this._obtenerNombreModelo(window.vigia?.modelo || 'openai/gpt-oss-120b');
        
        let statsAvanzadas = '';
        if (vigia && vigia.getEstadisticasIdioma) {
            const statsIdioma = await vigia.getEstadisticasIdioma();
            if (statsIdioma) {
                statsAvanzadas = `
ESTADISTICAS DEL IDIOMA
  • Frases: ${statsIdioma.completadas}/${statsIdioma.totalFrases} completadas
  • Palabras: ${statsIdioma.palabrasAprendidas}/${statsIdioma.nivelRequerido} aprendidas
  • Cobertura del nivel: ${statsIdioma.coberturaNivel}%
  • Palabras pendientes: ${statsIdioma.palabrasRestantes}
  • ${statsIdioma.listoParaExamen ? 'LISTO PARA EXAMEN!' : 'Sigue practicando'}`;
            }
        }
        
        this.core.alert(
            '\nMETRICAS NEURO\n\n' +
            'Idioma activo: ' + idiomaActivo + '\n' +
            'Modo inverso: ' + (modoInversoActivo ? 'Activado' : 'Desactivado') + '\n' +
            'Nivel: ' + nivel + '\n' +
            'NeuroScore: ' + (stats.neuroScore || 0) + '%\n' +
            'RCN Promedio: ' + (stats.rcnPromedio || 0) + '/5\n' +
            'Eficiencia: ' + (stats.eficiencia || 0) + '%\n' +
            'Frases: ' + (stats.totalFrases || 0) + '\n' +
            'Palabras: ' + (stats.totalPalabras || 0) + '\n' +
            'Completadas: ' + (stats.progreso || 0) + '\n' +
            'Racha: ' + racha + ' dias\n' +
            'Mi Espacio: ' + (favoritos.frases + favoritos.palabras) + ' elementos\n' +
            'Temas: ' + temas.length + '\n\n' +
            statsAvanzadas +
            '\n\nModelo: ' + nombreModelo,
            'Metricas'
        );
    }

    async _mostrarEstadisticasRapidas() {
        if (vigia && vigia.getRecomendacionPersonalizada) {
            const recomendacion = await vigia.getRecomendacionPersonalizada();
            if (recomendacion) {
                this._agregarMensajeChatPro('assistant', recomendacion);
                return;
            }
        }
        this.core.mostrarToast('No se pudieron obtener estadisticas', 'error');
    }

    async _chatExportar() {
        const container = document.getElementById('vigiaChatPro');
        if (!container) return;
        
        const historial = await db.obtenerChat();
        const nombreModelo = this._obtenerNombreModelo(window.vigia?.modelo || 'openai/gpt-oss-120b');
        
        let texto = 'Pipeline Neuro - Chat con Vigia\n';
        texto += '='.repeat(40) + '\n';
        texto += 'Total mensajes: ' + historial.length + '\n';
        texto += 'Modelo: ' + nombreModelo + '\n';
        texto += 'Exportado: ' + new Date().toISOString() + '\n';
        texto += '='.repeat(40) + '\n\n';
        
        for (const msg of historial) {
            const rol = msg.rol === 'user' ? 'Usuario' : 'Vigia';
            const fecha = new Date(msg.timestamp).toLocaleString();
            texto += '[' + fecha + '] ' + rol + ': ' + msg.mensaje + '\n\n';
        }
        
        const blob = new Blob([texto], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat_vigia_' + new Date().toISOString().slice(0,10) + '.txt';
        a.click();
        URL.revokeObjectURL(url);
        this.core.mostrarToast('Chat exportado (' + historial.length + ' mensajes)', 'success');
    }

    async _chatReconectar() {
        this.core.mostrarToast('Reconectando Vigia...', 'info');
        const resultado = await vigia.reconectarManual();
        if (resultado.exito) {
            const nombreModelo = this._obtenerNombreModelo(window.vigia?.modelo || 'openai/gpt-oss-120b');
            this.core.mostrarToast(resultado.mensaje + ' (' + nombreModelo + ')', 'success');
            this._cargarChatPro();
        } else {
            this.core.mostrarToast(resultado.mensaje, 'error');
        }
    }

    async _actualizarMetricasChatPro() {
        try {
            const stats = await db.obtenerEstadisticasNeuro();
            const estado = pipeline.getEstado ? pipeline.getEstado() : {};
            const usuario = await db.getUsuario();
            const nivel = this._obtenerNivelRealUsuario();
            const progreso = await db.obtenerTodoProgreso();
            const racha = await gestorNiveles._calcularRacha(progreso);
            const favoritos = await gestorFavoritos.contarFavoritos();
            
            let palabrasPendientes = 0;
            if (vigia && vigia.getEstadisticasIdioma) {
                const statsIdioma = await vigia.getEstadisticasIdioma();
                if (statsIdioma) {
                    palabrasPendientes = statsIdioma.palabrasRestantes || 0;
                }
            }
            
            const totalFavoritos = (favoritos.frases || 0) + (favoritos.palabras || 0);
            
            const rcnEl = document.getElementById('chatNeuroRCN');
            const progressEl = document.getElementById('chatNeuroProgress');
            const levelEl = document.getElementById('chatNeuroLevel');
            const eficienciaEl = document.getElementById('chatNeuroEficiencia');
            const rachaEl = document.getElementById('chatNeuroRacha');
            const pendientesEl = document.getElementById('chatPalabrasPendientes');
            const espacioEl = document.getElementById('chatEspacioCount');
            
            if (rcnEl) rcnEl.textContent = (stats.rcnPromedio || 0).toFixed(1);
            if (progressEl) progressEl.textContent = (estado.progreso || 0) + '%';
            if (levelEl) {
                levelEl.textContent = nivel;
                levelEl.style.color = 'var(--primary)';
                levelEl.style.fontWeight = '800';
            }
            if (eficienciaEl) eficienciaEl.textContent = (stats.eficiencia || 0) + '%';
            if (rachaEl) rachaEl.textContent = racha || 0;
            if (pendientesEl) pendientesEl.textContent = palabrasPendientes;
            if (espacioEl) espacioEl.textContent = totalFavoritos;
        } catch (e) {
            console.warn('Error actualizando metricas chat:', e);
        }
    }

    async _consultarVigiaPro(mensaje) {
        const usuario = await db.getUsuario();
        const stats = await db.obtenerEstadisticasNeuro();
        const progreso = await db.obtenerTodoProgreso();
        const frases = await db.obtenerFrases();
        const palabras = await db.obtenerPalabras();
        const temas = await db.obtenerTemas();
        const estado = pipeline.getEstado ? pipeline.getEstado() : {};
        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        const infoIdioma = gestorIdiomas.getInfoIdioma(idiomaActivo);
        const nivel = this._obtenerNivelRealUsuario();
        const racha = await gestorNiveles._calcularRacha(progreso);
        const modoInversoActivo = modoInverso.isActivo();
        const idiomas = gestorIdiomas.getIdiomas();
        const favoritos = await gestorFavoritos.contarFavoritos();
        const nombreModelo = this._obtenerNombreModelo(window.vigia?.modelo || 'openai/gpt-oss-120b');
        
        let statsAvanzadas = '';
        if (vigia && vigia.getEstadisticasIdioma) {
            const statsIdioma = await vigia.getEstadisticasIdioma();
            if (statsIdioma) {
                statsAvanzadas = `
- Frases completadas: ${statsIdioma.completadas}/${statsIdioma.totalFrases}
- Palabras aprendidas: ${statsIdioma.palabrasAprendidas}/${statsIdioma.nivelRequerido}
- Cobertura del nivel: ${statsIdioma.coberturaNivel}%
- Palabras pendientes: ${statsIdioma.palabrasRestantes}`;
            }
        }
        
        const prompt = 'Eres Vigia, asistente neuroadaptativo PRO de Pipeline Neuro v19.6 usando ' + nombreModelo + '.\n\n' +
                     'CONTEXTO DEL USUARIO:\n' +
                     '- Nombre: ' + (usuario?.nombre || 'Anonimo') + '\n' +
                     '- Idioma nativo: ' + (usuario?.idiomaNativo || 'es') + '\n' +
                     '- NIVEL REAL DEL USUARIO: ' + nivel + ' (ESTE ES EL NIVEL CORRECTO, NO LO CAMBIES)\n' +
                     '- Idiomas objetivo: ' + (idiomas.map(i => i.idioma + ' (' + i.nivel + ' - ' + i.progreso + '%)').join(', ') || 'No definido') + '\n' +
                     '- Idioma activo: ' + idiomaActivo + '\n' +
                     '- Modo inverso: ' + (modoInversoActivo ? 'Activado' : 'Desactivado') + '\n' +
                     '- Racha: ' + racha + ' dias\n' +
                     '- Mi Espacio: ' + (favoritos.frases + favoritos.palabras) + ' elementos guardados\n\n' +
                     'ESTADISTICAS NEURO:\n' +
                     '- RCN Promedio: ' + (stats.rcnPromedio || 0) + '/5\n' +
                     '- Eficiencia: ' + (stats.eficiencia || 0) + '%\n' +
                     '- NeuroScore: ' + (stats.neuroScore || 0) + '%\n' +
                     '- Progreso: ' + (estado.progreso || 0) + '%\n' +
                     '- Fase actual: ' + (estado.faseActual || 1) + '\n' +
                     statsAvanzadas + '\n\n' +
                     'DATOS DE APRENDIZAJE:\n' +
                     '- Total frases: ' + frases.length + '\n' +
                     '- Total palabras: ' + palabras.length + '\n' +
                     '- Frases completadas: ' + progreso.filter(p => p.estado === 'completada').length + '\n' +
                     '- Temas: ' + temas.map(t => t.nombre).join(', ') || 'Ninguno' + '\n\n' +
                     'INSTRUCCIONES IMPORTANTES:\n' +
                     '1. El nivel REAL del usuario es ' + nivel + '. NO uses otro nivel.\n' +
                     '2. Responde en el idioma del usuario (espanol, ingles o chino segun escriba).\n' +
                     '3. Se util, conciso y aplica principios de neurociencia.\n' +
                     '4. Si pide ayuda con Mi Espacio, explica que las palabras y frases se organizan por Nivel -> Familia Semantica.\n' +
                     '5. Si pide ayuda con idiomas, usa el contexto multi-idioma.\n' +
                     '6. Siempre se positivo y motivador.\n' +
                     '7. Si el usuario pregunta por su progreso, usa los datos de estadisticas disponibles.\n' +
                     '8. SIEMPRE menciona el nivel real del usuario (' + nivel + ') cuando hables de progreso o recomendaciones.\n\n' +
                     'MENSAJE DEL USUARIO:\n' + mensaje + '\n\n' +
                     'RESPUESTA:';

        try {
            if (vigia && vigia.enLinea) {
                return await vigia._consultarGroq(prompt, 'text');
            }
            return 'Vigia esta offline. Por favor, reconectate usando el boton de reconexion.';
        } catch (error) {
            console.error('Error consultando Vigia:', error);
            return 'Lo siento, no pude procesar tu consulta. ' + error.message;
        }
    }

    async _comandoTemas() {
        const temaCount = (await db.obtenerTemas()).length;
        return 'Temas disponibles: ' + temaCount + ' temas\n\nUsa /temas para ver la lista completa en el modulo de Temas.';
    }

    async _comandoGenerar(parametros) {
        if (!parametros) return 'Especifica un tema. Ej: /generar aventuras en la ciudad';
        const tema = parametros;
        const nivelReal = this._obtenerNivelRealUsuario();
        const nombreModelo = this._obtenerNombreModelo(window.vigia?.modelo || 'openai/gpt-oss-120b');
        
        if (window.UIJSON) {
            const temaInput = document.getElementById('jsonTemaInput');
            if (temaInput) temaInput.value = tema;
            window.UIJSON.generarJSONDesdeDashboard();
            return 'Generando JSON para "' + tema + '" (nivel ' + nivelReal + ')\n\nLa plantilla JSON se ha generado en el panel.\nLuego pide a ' + nombreModelo + ' que la complete.';
        }
        return 'Generador JSON no disponible.';
    }

    async _comandoTemasNuevos() {
        const nivelReal = this._obtenerNivelRealUsuario();
        const sugerencias = [
            'Temas para nivel ' + nivelReal + ':',
            '• Viajes y aventuras',
            '• Comida y gastronomia',
            '• Cultura y tradiciones',
            '• Tecnologia y futuro',
            '• Naturaleza y medio ambiente',
            '• Salud y bienestar'
        ];
        return sugerencias.join('\n') + '\n\nUsa /generar [tema] para crear contenido.';
    }

    async _comandoJSONNuevo(parametros) {
        const tema = parametros || 'vocabulario nuevo';
        const nivelReal = this._obtenerNivelRealUsuario();
        const nombreModelo = this._obtenerNombreModelo(window.vigia?.modelo || 'openai/gpt-oss-120b');
        return 'Generando JSON para "' + tema + '" (nivel ' + nivelReal + ')\n\nLa plantilla se generara en el panel.\nUsa ' + nombreModelo + ' para completarla.';
    }

    async _comandoRevisar() {
        return 'Repaso de palabras dificiles\n\nRevisando tu vocabulario...\n\nVe al modulo de Estudio o pide a Vigia que te ayude con palabras especificas.';
    }

    async _comandoExamen() {
        return 'Generando examen de nivel\n\nVe a Configuracion > "Hacer Examen" para iniciar la evaluacion.';
    }

    async _comandoNivel(parametros) {
        const nivel = parametros?.toUpperCase() || 'A1';
        if (!this._NIVELES.includes(nivel)) return 'Nivel "' + nivel + '" invalido. Usa: A1, A2, B1, B2, C1, C2';
        const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
        const result = await gestorIdiomas.cambiarNivel(idioma, nivel);
        if (result) {
            return 'Nivel cambiado a ' + nivel + ' para "' + idioma + '"';
        }
        return 'Error cambiando nivel.';
    }

    async _comandoAnalizar() {
        const stats = await db.obtenerEstadisticasNeuro();
        const estado = pipeline.getEstado ? pipeline.getEstado() : {};
        const nivelReal = this._obtenerNivelRealUsuario();
        return 'ANALISIS DE PROGRESO\n\nNivel: ' + nivelReal + '\nProgreso: ' + (estado.progreso || 0) + '%\nRCN Promedio: ' + (stats.rcnPromedio || 0) + '\nEficiencia: ' + (stats.eficiencia || 0) + '%\nFrases completadas: ' + (stats.progreso || 0) + '/' + (stats.totalFrases || 0) + '\nPalabras: ' + (stats.totalPalabras || 0) + '\nFase: ' + (estado.faseActual || 1) + '/7';
    }

    async _comandoDiagnostico() {
        if (window.uiCore && window.uiCore._handleDiagnostic) {
            window.uiCore._handleDiagnostic();
            return 'Ejecutando diagnostico completo...';
        }
        return 'Diagnostico: Sistema funcionando correctamente.';
    }

    async _comandoEstadisticas() {
        const stats = await db.obtenerEstadisticasNeuro();
        const nivelReal = this._obtenerNivelRealUsuario();
        return 'ESTADISTICAS NEURO\n\nNivel: ' + nivelReal + '\nTotal frases: ' + (stats.totalFrases || 0) + '\nTotal palabras: ' + (stats.totalPalabras || 0) + '\nCompletadas: ' + (stats.progreso || 0) + '\nNeuroScore: ' + (stats.neuroScore || 0) + '%\nEficiencia: ' + (stats.eficiencia || 0) + '%\nRCN Promedio: ' + (stats.rcnPromedio || 0) + '/5';
    }

    async _comandoExportar() {
        return 'Exportando datos...\n\nVe a la seccion Herramientas > Backup para exportar todos tus datos.';
    }

    async _comandoReiniciar() {
        if (pipeline && pipeline.reiniciarFase) {
            await pipeline.reiniciarFase();
            return 'Fase reiniciada correctamente.';
        }
        return 'Error reiniciando fase.';
    }

    async _comandoListIdiomas() {
        const idiomas = gestorIdiomas.getIdiomas();
        if (idiomas.length === 0) return 'No hay idiomas configurados.';
        const activo = gestorIdiomas.getIdiomaActivo();
        const lista = idiomas.map(i => {
            const esActivo = i.idioma === activo;
            return (esActivo ? 'Activo' : 'Inactivo') + ' ' + i.idioma + ' (' + i.nivel + ')';
        }).join('\n');
        return 'IDIOMAS CONFIGURADOS\n\n' + lista + '\n\nUsa /switch [idioma] para cambiar.';
    }

    async _comandoAddIdioma(parametros) {
        if (!parametros) return 'Especifica idioma y nivel. Ej: /add Chino A1';
        const partes = parametros.split(' ');
        const idioma = partes.slice(0, -1).join(' ');
        const nivel = partes[partes.length - 1]?.toUpperCase() || 'B1';
        if (!this._NIVELES.includes(nivel)) return 'Nivel "' + nivel + '" invalido. Usa: A1, A2, B1, B2, C1, C2';
        const result = await gestorIdiomas.añadirIdioma(idioma, nivel);
        if (result) {
            return 'Idioma "' + idioma + '" (' + nivel + ') anadido correctamente.';
        }
        return 'El idioma "' + idioma + '" ya existe o hubo un error.';
    }

    async _comandoRemoveIdioma(parametros) {
        if (!parametros) return 'Especifica el idioma a eliminar. Ej: /remove Chino';
        const idioma = parametros.trim();
        const result = await gestorIdiomas.eliminarIdioma(idioma);
        if (result) {
            return 'Idioma "' + idioma + '" eliminado.';
        }
        return 'No se pudo eliminar "' + idioma + '". Asegurate de que existe y no es el unico.';
    }

    async _comandoSwitchIdioma(parametros) {
        if (!parametros) return 'Especifica el idioma. Ej: /switch Chino';
        const idioma = parametros.trim();
        const result = await gestorIdiomas.cambiarIdioma(idioma);
        if (result) {
            return 'Cambiado a "' + idioma + '" correctamente.';
        }
        return 'No se pudo cambiar a "' + idioma + '". Asegurate de que existe.';
    }

    async _comandoLevelIdioma(parametros) {
        if (!parametros) return 'Especifica idioma y nivel. Ej: /level Chino B2';
        const partes = parametros.split(' ');
        const idioma = partes.slice(0, -1).join(' ');
        const nivel = partes[partes.length - 1]?.toUpperCase() || 'B1';
        if (!this._NIVELES.includes(nivel)) return 'Nivel "' + nivel + '" invalido. Usa: A1, A2, B1, B2, C1, C2';
        const result = await gestorIdiomas.cambiarNivel(idioma, nivel);
        if (result) {
            return 'Nivel de "' + idioma + '" cambiado a ' + nivel + '.';
        }
        return 'Error cambiando nivel de "' + idioma + '".';
    }

    async _comandoModo() {
        const activo = modoInverso.toggle();
        const mensaje = activo ? 'Modo Inverso activado' : 'Modo Normal activado';
        this.core.mostrarToast(mensaje, 'info');
        return mensaje;
    }

    async _comandoFeedback() {
        if (vigia && vigia.getRecomendacionPersonalizada) {
            const rec = await vigia.getRecomendacionPersonalizada();
            if (rec) return rec.mensaje;
        }
        return 'No hay recomendaciones en este momento. Sigue practicando.';
    }
}

window.UIChat = new UIChat();

console.log('UI Chat v19.6 - CORREGIDO: Caracteres y modelo openai/gpt-oss-120b');
console.log('  Modelo corregido: gpt-oss-120b -> openai/gpt-oss-120b');
console.log('  Caracteres especiales corregidos');
console.log('  Soporte completo para idiomas jeroglificos');
console.log('  Comandos Mi Espacio con organizacion por nivel -> familia');