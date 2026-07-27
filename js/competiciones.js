// ============================================================
// SISTEMA DE LIGAS CON NPCs IA v1.1 - CON VALIDACIÓN GROQ
// ============================================================

class SistemaCompeticiones {
    constructor() {
        this._initDone = false;
        this._partidaActiva = false;
        this._modoActual = null;
        this._npcActual = null;
        this._puntuacion = 0;
        this._rondaActual = 0;
        this._maxRondas = 10;
        this._jugadaActual = null;
        this._historial = [];
        this._premios = [];
        this._medallas = { bronce: 0, plata: 0, oro: 0 };
        this._monedasNeuro = 0;
        this._experienciaExtra = 0;
        this._rachaVictorias = 0;
        this._mejorRacha = 0;
        this._frasesCompeticion = [];
        this._metodoValidacion = 'offline';
        
        this._JUEZ = {
            nombre: 'Árbitro IA',
            personalidad: 'Sabio, justo, motivador',
            tono: 'Entusiasta pero riguroso'
        };
        
        this._NPCs = this._crearNPCs();
        this._premiosDisponibles = this._crearPremios();
        this._logrosEspeciales = this._crearLogros();
        
        this._core = null;
        this._container = null;
    }

    // ============================================================
    // CREAR NPCs CON PERSONALIDAD Y HABILIDADES
    // ============================================================

    _crearNPCs() {
        return {
            'A1': {
                id: 'luna',
                nombre: '🌙 Luna',
                nivel: 'A1',
                descripcion: 'Una principiante entusiasta que comienza su viaje',
                personalidad: 'Alegre, curiosa, algo insegura',
                avatar: '🌙',
                color: '#6C5CE7',
                habilidades: {
                    precision: 65,
                    velocidad: 40,
                    consistencia: 55,
                    vocabulario: 60,
                    gramatica: 50
                },
                fraseCelebracion: '¡Qué emoción! ¡Lo estoy dando todo! ✨',
                fraseDerrota: '¡Buen juego! Aprendí mucho de ti 🌙',
                fraseMotivacion: '¡Vamos, tú puedes! Yo también estoy aprendiendo ✨',
                nivelActual: 'A1',
                progreso: 0,
                victorias: 0,
                derrotas: 0,
                empates: 0
            },
            'A2': {
                id: 'max',
                nombre: '⚡ Max',
                nivel: 'A2',
                descripcion: 'Un aprendiz rápido que ya domina lo básico',
                personalidad: 'Competitivo, energético, confiado',
                avatar: '⚡',
                color: '#00B894',
                habilidades: {
                    precision: 72,
                    velocidad: 55,
                    consistencia: 65,
                    vocabulario: 70,
                    gramatica: 60
                },
                fraseCelebracion: '¡Sí! ¡No hay quien me pare! ⚡',
                fraseDerrota: '¡Uf! Has sido más rápido. ¡La próxima voy a por ti! 💪',
                fraseMotivacion: '¡Vamos, dame guerra! No me lo pongas fácil ⚡',
                nivelActual: 'A2',
                progreso: 15,
                victorias: 0,
                derrotas: 0,
                empates: 0
            },
            'B1': {
                id: 'sofia',
                nombre: '🌸 Sofia',
                nivel: 'B1',
                descripcion: 'Una estudiante constante que busca la perfección',
                personalidad: 'Metódica, observadora, empática',
                avatar: '🌸',
                color: '#FDCB6E',
                habilidades: {
                    precision: 80,
                    velocidad: 60,
                    consistencia: 75,
                    vocabulario: 78,
                    gramatica: 75
                },
                fraseCelebracion: 'La práctica hace la perfección. ¡Y estoy practicando! 🌸',
                fraseDerrota: 'Has sido mejor hoy. ¡Mañana será otro día! 📚',
                fraseMotivacion: 'Cada error es una oportunidad para aprender. ¡Sigue así! 🌸',
                nivelActual: 'B1',
                progreso: 30,
                victorias: 0,
                derrotas: 0,
                empates: 0
            },
            'B2': {
                id: 'elena',
                nombre: '🔥 Elena',
                nivel: 'B2',
                descripcion: 'Una competidora feroz que no da tregua',
                personalidad: 'Audaz, estratégica, intensa',
                avatar: '🔥',
                color: '#E17055',
                habilidades: {
                    precision: 85,
                    velocidad: 70,
                    consistencia: 80,
                    vocabulario: 85,
                    gramatica: 82
                },
                fraseCelebracion: '¡Eso es todo! ¿Ves? ¡Soy imparable! 🔥',
                fraseDerrota: '¡Impresionante! Has dado una lección hoy. ¡Pero volveré! ⚡',
                fraseMotivacion: '¡Vamos! ¡Demuéstrame de qué estás hecho! No te detengas 🔥',
                nivelActual: 'B2',
                progreso: 50,
                victorias: 0,
                derrotas: 0,
                empates: 0
            },
            'C1': {
                id: 'mateo',
                nombre: '📚 Mateo',
                nivel: 'C1',
                descripcion: 'Un erudito que analiza cada movimiento',
                personalidad: 'Analítico, paciente, sabio',
                avatar: '📚',
                color: '#0984E3',
                habilidades: {
                    precision: 90,
                    velocidad: 75,
                    consistencia: 85,
                    vocabulario: 90,
                    gramatica: 88
                },
                fraseCelebracion: 'La victoria es dulce, pero el conocimiento es eterno. 📚',
                fraseDerrota: 'Has demostrado un dominio excepcional. ¡Respeto! 🤝',
                fraseMotivacion: 'El verdadero aprendizaje ocurre cuando te esfuerzas al máximo. 📚',
                nivelActual: 'C1',
                progreso: 70,
                victorias: 0,
                derrotas: 0,
                empates: 0
            },
            'C2': {
                id: 'atlas',
                nombre: '🏛️ Prof. Atlas',
                nivel: 'C2',
                descripcion: 'El maestro definitivo, un experto consumado',
                personalidad: 'Sereno, sabio, exigente',
                avatar: '🏛️',
                color: '#6C5CE7',
                habilidades: {
                    precision: 95,
                    velocidad: 85,
                    consistencia: 95,
                    vocabulario: 98,
                    gramatica: 95
                },
                fraseCelebracion: 'El conocimiento es el verdadero poder. Y hoy lo has demostrado. 🏛️',
                fraseDerrota: 'Has superado al maestro. Eso es algo extraordinario. 👏',
                fraseMotivacion: 'El camino del conocimiento es infinito. ¿Estás listo para continuar? 🏛️',
                nivelActual: 'C2',
                progreso: 90,
                victorias: 0,
                derrotas: 0,
                empates: 0
            }
        };
    }

    // ============================================================
    // CREAR SISTEMA DE PREMIOS
    // ============================================================

    _crearPremios() {
        return {
            monedas: {
                icono: '🪙',
                nombre: 'Monedas Neuro',
                descripcion: 'La moneda oficial de la liga',
                porVictoria: 10,
                porEmpate: 5,
                porDerrota: 2,
                bonusRacha: 5
            },
            medallas: {
                bronce: { icono: '🥉', nombre: 'Bronce', puntosNecesarios: 50 },
                plata: { icono: '🥈', nombre: 'Plata', puntosNecesarios: 100 },
                oro: { icono: '🥇', nombre: 'Oro', puntosNecesarios: 200 }
            },
            estrellas: {
                icono: '⭐',
                nombre: 'Estrellas de Experiencia',
                descripcion: 'Aceleran tu progreso'
            },
            bonus: {
                x2: { icono: '🎯', nombre: 'Bonus x2', descripcion: 'Dobla tu experiencia' },
                x3: { icono: '🚀', nombre: 'Bonus x3', descripcion: 'Triplica tu experiencia' },
                escudo: { icono: '🛡️', nombre: 'Escudo Protector', descripcion: 'Protege tu racha' }
            }
        };
    }

    // ============================================================
    // CREAR LOGROS ESPECIALES
    // ============================================================

    _crearLogros() {
        return [
            { id: 'primer_paso', nombre: '🌟 Primer Paso', descripcion: 'Completa tu primera competición', icono: '🌟' },
            { id: '3_victorias', nombre: '🏆 3 Victorias', descripcion: 'Gana 3 competiciones', icono: '🏆' },
            { id: '10_victorias', nombre: '👑 10 Victorias', descripcion: 'Gana 10 competiciones', icono: '👑' },
            { id: 'racha_5', nombre: '🔥 Racha de 5', descripcion: 'Gana 5 competiciones seguidas', icono: '🔥' },
            { id: 'racha_10', nombre: '⚡ Racha de 10', descripcion: 'Gana 10 competiciones seguidas', icono: '⚡' },
            { id: 'maestro_a1', nombre: '🎓 Maestro A1', descripcion: 'Vence a Luna 3 veces seguidas', icono: '🎓' },
            { id: 'maestro_a2', nombre: '🎓 Maestro A2', descripcion: 'Vence a Max 3 veces seguidas', icono: '🎓' },
            { id: 'maestro_b1', nombre: '🎓 Maestro B1', descripcion: 'Vence a Sofia 3 veces seguidas', icono: '🎓' },
            { id: 'maestro_b2', nombre: '🎓 Maestro B2', descripcion: 'Vence a Elena 3 veces seguidas', icono: '🎓' },
            { id: 'maestro_c1', nombre: '🎓 Maestro C1', descripcion: 'Vence a Mateo 3 veces seguidas', icono: '🎓' },
            { id: 'leyenda', nombre: '👑 Leyenda', descripcion: 'Vence al Prof. Atlas', icono: '👑' },
            { id: '100_monedas', nombre: '💰 100 Monedas', descripcion: 'Acumula 100 monedas Neuro', icono: '💰' },
            { id: '500_monedas', nombre: '💎 500 Monedas', descripcion: 'Acumula 500 monedas Neuro', icono: '💎' }
        ];
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init(core) {
        this._core = core || window.uiCore;
        
        if (this._initDone) return this;
        
        console.log('🏆 SistemaCompeticiones: Inicializando...');
        
        await this._cargarEstado();
        
        this._container = document.getElementById('competicionesContent');
        if (!this._container) {
            const moduleDiv = document.getElementById('competicionesModule');
            if (moduleDiv) {
                this._container = document.createElement('div');
                this._container.id = 'competicionesContent';
                moduleDiv.appendChild(this._container);
            }
        }
        
        this._initDone = true;
        console.log('🏆 Sistema de Ligas con NPCs IA v1.1: Inicializado');
        return this;
    }

    // ============================================================
    // CARGAR MÓDULO
    // ============================================================

    cargar(core) {
        this._core = core || window.uiCore;
        this._container = document.getElementById('competicionesContent');
        
        if (!this._container) {
            const moduleDiv = document.getElementById('competicionesModule');
            if (moduleDiv) {
                this._container = document.createElement('div');
                this._container.id = 'competicionesContent';
                moduleDiv.appendChild(this._container);
            }
        }
        
        if (this._container) {
            this._renderizarPanel();
        } else {
            console.error('❌ SistemaCompeticiones: No se pudo encontrar o crear el contenedor');
            if (this._core) {
                this._core.mostrarToast('❌ Error: No se pudo cargar el módulo de competiciones', 'error');
            }
        }
    }

    // ============================================================
    // ABRIR MÓDULO DESDE NAVEGACIÓN
    // ============================================================

    abrirModulo() {
        if (this._core) {
            this._core.irAModulo('competiciones');
        } else if (window.uiCore) {
            this._core = window.uiCore;
            this._core.irAModulo('competiciones');
        } else {
            console.warn('⚠️ SistemaCompeticiones: core no disponible');
        }
    }

    // ============================================================
    // CARGAR ESTADO PERSISTIDO
    // ============================================================

    async _cargarEstado() {
        try {
            const data = localStorage.getItem('pipeline_competiciones');
            if (data) {
                const parsed = JSON.parse(data);
                this._medallas = parsed.medallas || { bronce: 0, plata: 0, oro: 0 };
                this._monedasNeuro = parsed.monedasNeuro || 0;
                this._experienciaExtra = parsed.experienciaExtra || 0;
                this._rachaVictorias = parsed.rachaVictorias || 0;
                this._mejorRacha = parsed.mejorRacha || 0;
                this._premios = parsed.premios || [];
                this._historial = parsed.historial || [];
                
                if (parsed.npcs) {
                    for (const [id, data] of Object.entries(parsed.npcs)) {
                        if (this._NPCs[id]) {
                            this._NPCs[id].victorias = data.victorias || 0;
                            this._NPCs[id].derrotas = data.derrotas || 0;
                            this._NPCs[id].empates = data.empates || 0;
                            this._NPCs[id].progreso = data.progreso || 0;
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ Error cargando estado de competiciones:', e);
        }
    }

    async _guardarEstado() {
        try {
            const data = {
                medallas: this._medallas,
                monedasNeuro: this._monedasNeuro,
                experienciaExtra: this._experienciaExtra,
                rachaVictorias: this._rachaVictorias,
                mejorRacha: this._mejorRacha,
                premios: this._premios,
                historial: this._historial.slice(-50),
                npcs: {}
            };
            
            for (const [id, npc] of Object.entries(this._NPCs)) {
                data.npcs[id] = {
                    victorias: npc.victorias,
                    derrotas: npc.derrotas,
                    empates: npc.empates,
                    progreso: npc.progreso
                };
            }
            
            localStorage.setItem('pipeline_competiciones', JSON.stringify(data));
        } catch (e) {
            console.warn('⚠️ Error guardando estado:', e);
        }
    }

    // ============================================================
    // OBTENER NPC POR NIVEL
    // ============================================================

    _obtenerNPCsPorNivel(nivel) {
        const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const idx = niveles.indexOf(nivel);
        
        const disponibles = [];
        for (let i = Math.max(0, idx - 1); i <= Math.min(niveles.length - 1, idx + 1); i++) {
            const key = niveles[i];
            if (this._NPCs[key]) {
                disponibles.push({
                    ...this._NPCs[key],
                    nivel: key,
                    esRival: key === nivel,
                    esSuperior: niveles.indexOf(key) > idx
                });
            }
        }
        return disponibles;
    }

    // ============================================================
    // OBTENER NIVEL DEL USUARIO
    // ============================================================

    _obtenerNivelUsuario() {
        try {
            const info = window.gestorIdiomas?.getInfoActivo?.();
            if (info?.nivel) return info.nivel;
            const usuario = localStorage.getItem('pipeline_usuario');
            if (usuario) {
                const parsed = JSON.parse(usuario);
                if (parsed.idiomasObjetivo?.length > 0) {
                    return parsed.idiomasObjetivo[0].nivel || 'A1';
                }
            }
            return 'A1';
        } catch (e) {
            return 'A1';
        }
    }

    // ============================================================
    // OBTENER ESTADÍSTICAS
    // ============================================================

    _obtenerEstadisticas() {
        let total = 0, victorias = 0, derrotas = 0, empates = 0;
        
        for (const npc of Object.values(this._NPCs)) {
            total += npc.victorias + npc.derrotas + npc.empates;
            victorias += npc.victorias;
            derrotas += npc.derrotas;
            empates += npc.empates;
        }
        
        return {
            total,
            victorias,
            derrotas,
            empates,
            premios: this._premios.length,
            monedas: this._monedasNeuro
        };
    }

    // ============================================================
    // RENDERIZAR PANEL PRINCIPAL
    // ============================================================

    _renderizarPanel() {
        if (!this._container) {
            console.warn('⚠️ _renderizarPanel: contenedor no disponible');
            return;
        }
        
        const nivelUsuario = this._obtenerNivelUsuario();
        const npcDisponibles = this._obtenerNPCsPorNivel(nivelUsuario);
        const stats = this._obtenerEstadisticas();
        
        let html = `
            <div class="competiciones-container" style="padding:16px;">
                <!-- HEADER -->
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
                    <div>
                        <h2 style="font-size:24px;font-weight:800;color:var(--dark);margin:0;">🏆 Liga Neuro</h2>
                        <p style="color:var(--gray);font-size:14px;margin:4px 0 0;">
                            Compite contra NPCs inteligentes y demuestra tu dominio
                        </p>
                    </div>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        <div style="background:var(--white);padding:8px 16px;border-radius:12px;box-shadow:var(--shadow);text-align:center;">
                            <div style="font-size:12px;color:var(--gray);">🪙 Monedas</div>
                            <div style="font-size:20px;font-weight:800;color:var(--primary);">${this._monedasNeuro}</div>
                        </div>
                        <div style="background:var(--white);padding:8px 16px;border-radius:12px;box-shadow:var(--shadow);text-align:center;">
                            <div style="font-size:12px;color:var(--gray);">🏅 Medallas</div>
                            <div style="font-size:14px;">🥉${this._medallas.bronce} 🥈${this._medallas.plata} 🥇${this._medallas.oro}</div>
                        </div>
                        <div style="background:var(--white);padding:8px 16px;border-radius:12px;box-shadow:var(--shadow);text-align:center;">
                            <div style="font-size:12px;color:var(--gray);">🔥 Racha</div>
                            <div style="font-size:20px;font-weight:800;color:${this._rachaVictorias >= 5 ? 'var(--success)' : 'var(--warning)'};">${this._rachaVictorias}</div>
                        </div>
                    </div>
                </div>
                
                <!-- ESTADÍSTICAS RÁPIDAS -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:10px;margin-bottom:16px;">
                    <div style="background:var(--white);padding:10px;border-radius:10px;box-shadow:var(--shadow);text-align:center;border-top:3px solid var(--primary);">
                        <div style="font-size:20px;font-weight:800;color:var(--primary);">${stats.total}</div>
                        <div style="font-size:10px;color:var(--gray);">Partidas</div>
                    </div>
                    <div style="background:var(--white);padding:10px;border-radius:10px;box-shadow:var(--shadow);text-align:center;border-top:3px solid var(--success);">
                        <div style="font-size:20px;font-weight:800;color:var(--success);">${stats.victorias}</div>
                        <div style="font-size:10px;color:var(--gray);">Victorias</div>
                    </div>
                    <div style="background:var(--white);padding:10px;border-radius:10px;box-shadow:var(--shadow);text-align:center;border-top:3px solid var(--warning);">
                        <div style="font-size:20px;font-weight:800;color:var(--warning);">${stats.empates}</div>
                        <div style="font-size:10px;color:var(--gray);">Empates</div>
                    </div>
                    <div style="background:var(--white);padding:10px;border-radius:10px;box-shadow:var(--shadow);text-align:center;border-top:3px solid var(--danger);">
                        <div style="font-size:20px;font-weight:800;color:var(--danger);">${stats.derrotas}</div>
                        <div style="font-size:10px;color:var(--gray);">Derrotas</div>
                    </div>
                    <div style="background:var(--white);padding:10px;border-radius:10px;box-shadow:var(--shadow);text-align:center;border-top:3px solid var(--secondary);">
                        <div style="font-size:20px;font-weight:800;color:var(--secondary);">${stats.premios}</div>
                        <div style="font-size:10px;color:var(--gray);">Premios</div>
                    </div>
                </div>
                
                <!-- JUEZ IA -->
                <div style="background:linear-gradient(135deg, var(--primary)10, var(--secondary)10);border-radius:12px;padding:14px 18px;margin-bottom:16px;border:2px solid var(--primary)30;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:32px;">⚖️</span>
                        <div style="flex:1;">
                            <div style="font-size:16px;font-weight:700;color:var(--dark);">${this._JUEZ.nombre}</div>
                            <div style="font-size:12px;color:var(--gray);">${this._JUEZ.personalidad} · ${this._JUEZ.tono}</div>
                        </div>
                        <div style="font-size:12px;color:var(--gray-light);text-align:right;">
                            ${this._partidaActiva ? '🟢 En partida' : '⏸️ En espera'}
                            <br>
                            <span style="font-size:10px;">${this._JUEZ.tono}</span>
                        </div>
                    </div>
                    <div id="juezMensaje" style="margin-top:8px;font-size:13px;color:var(--gray);font-style:italic;padding:8px 12px;background:var(--white);border-radius:8px;">
                        ${this._partidaActiva ? '¡La partida ha comenzado! Demuestra tu valía.' : '¿Listo para competir? Elige un NPC y un modo de juego.'}
                    </div>
                </div>
                
                <!-- SELECCIÓN DE NPC -->
                <div style="margin-bottom:16px;">
                    <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0 0 12px 0;">👥 Elige tu rival (Nivel ${nivelUsuario})</h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">
                        ${npcDisponibles.map(npc => `
                            <div class="npc-card" onclick="window.SistemaCompeticiones._seleccionarNPC('${npc.id}')" 
                                 style="background:var(--white);border-radius:12px;padding:12px 14px;box-shadow:var(--shadow);border:2px solid ${this._npcActual?.id === npc.id ? 'var(--primary)' : 'var(--light)'};cursor:pointer;transition:all 0.3s;${this._partidaActiva ? 'opacity:0.5;pointer-events:none;' : ''}"
                                 onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'" 
                                 onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                                <div style="display:flex;align-items:center;gap:10px;">
                                    <span style="font-size:32px;">${npc.avatar}</span>
                                    <div style="flex:1;">
                                        <div style="font-size:15px;font-weight:700;color:var(--dark);">${npc.nombre}</div>
                                        <div style="font-size:11px;color:var(--gray);">${npc.descripcion}</div>
                                        <div style="display:flex;gap:6px;margin-top:4px;font-size:10px;color:var(--gray-light);">
                                            <span>🏆 ${npc.victorias}V</span>
                                            <span>${npc.derrotas}D</span>
                                            <span>🤝 ${npc.empates}E</span>
                                            <span>📈 ${Math.round(npc.progreso)}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;">
                                    ${Object.entries(npc.habilidades).map(([key, val]) => `
                                        <span style="font-size:9px;background:var(--bg);padding:1px 8px;border-radius:8px;color:var(--gray);">
                                            ${key.slice(0,3)}: ${val}%
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- MODOS DE JUEGO -->
                <div style="margin-bottom:16px;">
                    <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0 0 12px 0;">🎮 Modos de Competición</h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;">
                        ${this._crearBotonesModos()}
                    </div>
                </div>
                
                <!-- ÁREA DE JUEGO -->
                <div id="areaJuego" style="background:var(--white);border-radius:12px;padding:16px;box-shadow:var(--shadow);min-height:200px;${this._partidaActiva ? '' : 'display:none;'}">
                    ${this._partidaActiva ? this._renderizarAreaJuego() : ''}
                </div>
                
                <!-- HISTORIAL -->
                <div style="margin-top:16px;">
                    <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0 0 8px 0;">📜 Historial de Partidas</h3>
                    <div style="max-height:150px;overflow-y:auto;background:var(--bg);border-radius:8px;padding:8px 12px;">
                        ${this._historial.length === 0 ? 
                            '<p style="color:var(--gray-light);font-size:13px;text-align:center;padding:12px;">Aún no hay partidas. ¡Empieza tu primera competición!</p>' :
                            this._historial.slice(-10).reverse().map(p => `
                                <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--light);font-size:12px;">
                                    <span>${p.fecha}</span>
                                    <span>${p.npc} ${p.resultado === 'victoria' ? '✅' : p.resultado === 'derrota' ? '❌' : '🤝'}</span>
                                    <span>${p.puntuacion} pts</span>
                                    <span style="color:${p.premio ? 'var(--success)' : 'var(--gray)'};">${p.premio || ''}</span>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
                
                <!-- LOGROS -->
                <div style="margin-top:12px;">
                    <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0 0 6px 0;">🏅 Logros</h3>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                        ${this._logrosEspeciales.map(logro => {
                            const conseguido = this._premios.some(p => p.id === logro.id);
                            return `
                                <span style="font-size:12px;padding:2px 10px;border-radius:12px;background:${conseguido ? 'var(--success)15' : 'var(--bg)'};border:1px solid ${conseguido ? 'var(--success)' : 'var(--light)'};color:${conseguido ? 'var(--success)' : 'var(--gray)'};">
                                    ${conseguido ? '✅' : '🔒'} ${logro.icono} ${logro.nombre}
                                </span>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this._container.innerHTML = html;
        this._configurarEventos();
    }

    // ============================================================
    // CREAR BOTONES DE MODOS
    // ============================================================

    _crearBotonesModos() {
        const modos = [
            { id: 'carrera', icono: '🏁', nombre: 'Carrera', desc: 'Completa más frases que tu rival' },
            { id: 'duelo', icono: '⚔️', nombre: 'Duelo 1vs1', desc: 'Enfréntate cara a cara' },
            { id: 'torneo', icono: '🏆', nombre: 'Torneo', desc: 'Todos contra todos' },
            { id: 'sprint', icono: '⚡', nombre: 'Sprint', desc: 'Contra el reloj' }
        ];
        
        return modos.map(modo => `
            <button class="btn-modo" data-modo="${modo.id}" 
                    onclick="window.SistemaCompeticiones._iniciarModo('${modo.id}')"
                    style="padding:10px 14px;border-radius:10px;border:2px solid ${this._modoActual === modo.id ? 'var(--primary)' : 'var(--light)'};background:${this._modoActual === modo.id ? 'var(--primary)08' : 'var(--white)'};cursor:pointer;transition:all 0.3s;text-align:center;${this._partidaActiva || !this._npcActual ? 'opacity:0.5;pointer-events:none;' : ''}"
                    onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'" 
                    onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                <div style="font-size:28px;">${modo.icono}</div>
                <div style="font-size:13px;font-weight:700;color:var(--dark);">${modo.nombre}</div>
                <div style="font-size:10px;color:var(--gray-light);">${modo.desc}</div>
            </button>
        `).join('');
    }

    // ============================================================
    // CONFIGURAR EVENTOS
    // ============================================================

    _configurarEventos() {
        // Los eventos ya están en los onclick
    }

    // ============================================================
    // SELECCIONAR NPC
    // ============================================================

    _seleccionarNPC(npcId) {
        if (this._partidaActiva) {
            if (this._core) this._core.mostrarToast('⏳ Hay una partida en curso. Termínala primero.', 'warning');
            return;
        }
        
        for (const [key, npc] of Object.entries(this._NPCs)) {
            if (npc.id === npcId) {
                this._npcActual = npc;
                if (this._core) this._core.mostrarToast(`👥 Has elegido a ${npc.nombre} como rival`, 'success');
                break;
            }
        }
        
        this._renderizarPanel();
    }

    // ============================================================
    // INICIAR MODO DE JUEGO
    // ============================================================

    async _iniciarModo(modo) {
        if (this._partidaActiva) {
            if (this._core) this._core.mostrarToast('⏳ Ya hay una partida activa', 'warning');
            return;
        }
        
        if (!this._npcActual) {
            if (this._core) this._core.mostrarToast('👥 Selecciona un rival primero', 'warning');
            return;
        }
        
        this._modoActual = modo;
        this._partidaActiva = true;
        this._rondaActual = 0;
        this._puntuacion = 0;
        this._jugadaActual = null;
        
        const mensajeJuez = this._generarMensajeJuez('inicio');
        const juezMsg = document.getElementById('juezMensaje');
        if (juezMsg) juezMsg.textContent = mensajeJuez;
        
        const frases = await this._obtenerFrasesCompeticion();
        if (frases.length === 0) {
            if (this._core) this._core.mostrarToast('❌ No hay suficientes frases para competir. Genera o importa contenido.', 'error');
            this._partidaActiva = false;
            return;
        }
        
        this._frasesCompeticion = frases;
        this._maxRondas = Math.min(10, frases.length);
        
        if (this._core) this._core.mostrarToast(`🏁 Modo ${this._getNombreModo(modo)} iniciado contra ${this._npcActual.nombre}!`, 'success');
        this._renderizarPanel();
        this._mostrarRonda();
    }

    // ============================================================
    // OBTENER FRASES PARA COMPETICIÓN
    // ============================================================

    async _obtenerFrasesCompeticion() {
        const idioma = window.gestorIdiomas?.getIdiomaActivo() || 'es';
        const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
        
        const frasesConProgreso = [];
        for (const f of todasFrases) {
            const prog = await db.obtenerProgreso(f.id);
            if (!prog || prog.rcn < 3) {
                frasesConProgreso.push(f);
            }
        }
        
        if (frasesConProgreso.length < 5) {
            return todasFrases.sort(() => Math.random() - 0.5);
        }
        
        return frasesConProgreso.sort(() => Math.random() - 0.5);
    }

    // ============================================================
    // MOSTRAR RONDA
    // ============================================================

    _mostrarRonda() {
        const areaJuego = document.getElementById('areaJuego');
        if (!areaJuego) return;
        
        if (this._rondaActual >= this._maxRondas) {
            this._finalizarPartida();
            return;
        }
        
        const frase = this._frasesCompeticion[this._rondaActual];
        if (!frase) {
            this._finalizarPartida();
            return;
        }
        
        const esJeroglifico = frase.esJeroglifico || false;
        const modoInverso = window.modoInverso?.isActivo() || false;
        
        let textoMostrar, textoTraducir;
        if (modoInverso) {
            textoMostrar = frase.traduccion;
            textoTraducir = frase.original;
        } else {
            textoMostrar = frase.original;
            textoTraducir = frase.traduccion;
        }
        
        const pinyin = frase.pinyinCompleto || frase.segmentacion?.pinyin || '';
        const hanzi = frase.segmentacion?.hanzi || frase.original;
        
        areaJuego.style.display = 'block';
        areaJuego.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <div>
                    <span style="font-size:14px;font-weight:700;color:var(--dark);">Ronda ${this._rondaActual + 1}/${this._maxRondas}</span>
                    <span style="font-size:12px;color:var(--gray);margin-left:8px;">vs ${this._npcActual.nombre}</span>
                </div>
                <div style="font-size:14px;font-weight:700;color:var(--primary);">⭐ ${this._puntuacion} pts</div>
            </div>
            
            <div style="text-align:center;padding:16px;background:var(--bg);border-radius:12px;margin-bottom:12px;">
                ${esJeroglifico ? `
                    <div style="font-size:28px;font-weight:700;color:var(--dark);line-height:1.6;letter-spacing:2px;">${hanzi}</div>
                    ${pinyin ? `<div style="font-size:16px;color:var(--gray-light);margin-top:4px;letter-spacing:1px;">🔊 ${pinyin}</div>` : ''}
                    <div style="font-size:14px;color:var(--gray-light);margin-top:8px;">📝 Escribe la traducción</div>
                ` : `
                    <div style="font-size:22px;font-weight:700;color:var(--dark);">${textoMostrar}</div>
                    <div style="font-size:13px;color:var(--gray-light);margin-top:4px;">📝 Escribe la traducción</div>
                `}
            </div>
            
            <div style="display:flex;gap:10px;">
                <input type="text" id="respuestaCompeticion" placeholder="Escribe tu respuesta..." 
                       style="flex:1;padding:12px 16px;border:2px solid var(--light);border-radius:10px;font-size:16px;font-family:var(--font);"
                       onkeydown="if(event.key==='Enter') window.SistemaCompeticiones._validarRespuestaCompetitiva()">
                <button class="btn-primary" onclick="window.SistemaCompeticiones._validarRespuestaCompetitiva()" 
                        style="padding:12px 24px;font-size:16px;width:auto;">
                    <i class="fas fa-check"></i> Validar
                </button>
            </div>
            
            <div id="feedbackCompeticion" style="margin-top:12px;padding:10px;border-radius:8px;display:none;"></div>
            
            <div style="display:flex;justify-content:space-between;margin-top:12px;font-size:12px;color:var(--gray-light);">
                <span>⏱️ ${this._npcActual.nombre} está esperando tu respuesta...</span>
                <span>🎯 ${this._npcActual.habilidades.precision}% precisión del rival</span>
            </div>
        `;
        
        setTimeout(() => {
            const input = document.getElementById('respuestaCompeticion');
            if (input) input.focus();
        }, 100);
    }

    // ============================================================
    // 🔥 VALIDAR RESPUESTA COMPETITIVA CON GROQ
    // ============================================================

    async _validarRespuestaCompetitiva() {
        const input = document.getElementById('respuestaCompeticion');
        if (!input) return;
        
        const respuesta = input.value.trim();
        if (!respuesta) {
            if (this._core) this._core.mostrarToast('✏️ Escribe una respuesta primero.', 'warning');
            return;
        }
        
        const frase = this._frasesCompeticion[this._rondaActual];
        if (!frase) return;
        
        const feedback = document.getElementById('feedbackCompeticion');
        feedback.style.display = 'block';
        feedback.style.background = 'var(--bg)';
        feedback.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando con Groq...';
        
        const idioma = frase.idioma || gestorIdiomas?.getIdiomaActivo() || 'es';
        const nivel = frase.nivel || 'A1';
        const esJeroglifico = frase.esJeroglifico || false;
        const esInverso = window.modoInverso?.isActivo() || false;
        
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
        let groqExitoso = false;
        
        // 🔥 INTENTAR VALIDACIÓN CON GROQ
        if (window.vigia && window.vigia.enLinea && window.vigia._apiKeyValidada) {
            try {
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
                        puntuacion: groqResult.puntuacion || (groqResult.correcto ? 10 : 0),
                        metodo: 'online_groq'
                    };
                    metodo = 'online';
                    groqExitoso = true;
                }
            } catch (groqError) {
                console.warn('⚠️ Falló validación con Groq, usando offline:', groqError.message);
            }
        }
        
        // 🔥 FALLBACK: VALIDACIÓN OFFLINE
        if (!resultado) {
            const similitud = this._calcularSimilitud(respuesta, correctaEsperada);
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
                puntuacion: esExacto ? 10 : (esAproximado ? 7 : (esParcial ? 5 : 0)),
                metodo: 'offline'
            };
        }
        
        // SIMULAR RESPUESTA DEL NPC
        const resultadoNPC = this._simularRespuestaNPC(frase);
        const puntosUsuario = resultado.puntuacion;
        const puntosNPC = resultadoNPC.puntuacion;
        
        this._puntuacion += puntosUsuario;
        
        // MOSTRAR FEEDBACK
        let emoji = '✅';
        let color = 'var(--success)';
        let mensaje = '¡Correcto!';
        
        if (resultado.correcto) {
            emoji = '✅';
            color = 'var(--success)';
            mensaje = '¡Excelente! Has acertado.';
        } else if (resultado.aproximado) {
            emoji = '🟡';
            color = 'var(--warning)';
            mensaje = `Casi correcto. La respuesta era: "${resultado.correctaEsperada}"`;
        } else {
            emoji = '❌';
            color = 'var(--danger)';
            mensaje = `Incorrecto. La respuesta correcta es: "${resultado.correctaEsperada}"`;
        }
        
        let comparativa = '';
        if (puntosUsuario > puntosNPC) {
            comparativa = `🎉 ¡Has superado a ${this._npcActual.nombre}! (+${puntosUsuario-puntosNPC} pts)`;
        } else if (puntosUsuario === puntosNPC) {
            comparativa = `🤝 ¡Empate con ${this._npcActual.nombre}!`;
        } else {
            comparativa = `😅 ${this._npcActual.nombre} te ha superado esta ronda. ¡Ánimo!`;
        }
        
        const metodoLabel = resultado.metodo === 'online_groq' ? '🧠 Groq' : '📝 Offline';
        const metodoColor = resultado.metodo === 'online_groq' ? 'var(--success)' : 'var(--gray)';
        
        feedback.style.display = 'block';
        feedback.style.background = `${color}10`;
        feedback.style.border = `1px solid ${color}`;
        feedback.innerHTML = `
            <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                <div>
                    <div style="font-weight:600;color:${color};font-size:16px;">${emoji} ${mensaje}</div>
                    <div style="font-size:13px;color:var(--gray);margin-top:4px;">${comparativa}</div>
                </div>
                <div style="text-align:right;font-size:12px;color:var(--gray);">
                    <div>👤 Tú: +${puntosUsuario} pts</div>
                    <div>🤖 ${this._npcActual.nombre}: +${puntosNPC} pts</div>
                    <div style="font-size:10px;color:${metodoColor};">🔍 ${metodoLabel}</div>
                </div>
            </div>
            <div style="margin-top:8px;display:flex;gap:12px;font-size:11px;color:var(--gray-light);">
                <span>⏱️ ${Math.floor(Math.random() * 4) + 2}s</span>
                <span>🎯 ${this._npcActual.habilidades.precision}% precisión del rival</span>
                <span>📊 ${resultado.correcto ? '100%' : resultado.aproximado ? '70%' : '0%'}</span>
            </div>
        `;
        
        input.disabled = true;
        input.style.opacity = '0.5';
        
        this._historial.push({
            fecha: new Date().toLocaleString(),
            npc: this._npcActual.nombre,
            resultado: puntosUsuario > puntosNPC ? 'victoria' : puntosUsuario === puntosNPC ? 'empate' : 'derrota',
            puntuacion: this._puntuacion,
            premio: resultado.correcto ? '🪙 +2' : ''
        });
        
        this._rondaActual++;
        
        if (this._rondaActual >= this._maxRondas) {
            setTimeout(() => this._finalizarPartida(), 2000);
        } else {
            setTimeout(() => {
                feedback.style.display = 'none';
                this._mostrarRonda();
            }, 2000);
        }
    }

    // ============================================================
    // SIMULAR RESPUESTA DEL NPC CON IA
    // ============================================================

    _simularRespuestaNPC(frase) {
        const habilidades = this._npcActual.habilidades;
        const precision = habilidades.precision / 100;
        const velocidad = habilidades.velocidad / 100;
        
        const acierta = Math.random() < precision;
        const tiempo = Math.floor(2 + (1 - velocidad) * 4);
        
        return {
            correcto: acierta,
            puntuacion: acierta ? Math.floor(6 + Math.random() * 4) : Math.floor(1 + Math.random() * 3),
            tiempo: tiempo
        };
    }

    // ============================================================
    // FINALIZAR PARTIDA
    // ============================================================

    async _finalizarPartida() {
        this._partidaActiva = false;
        
        let resultado = 'empate';
        let mensaje = '';
        let premio = '';
        let puntosBonus = 0;
        
        const puntuacionFinal = this._puntuacion;
        const nivelUsuario = this._obtenerNivelUsuario();
        const nivelNPC = this._npcActual.nivel;
        
        if (puntuacionFinal >= this._maxRondas * 8) {
            resultado = 'victoria';
            mensaje = `🏆 ¡VICTORIA! Has dominado a ${this._npcActual.nombre} con ${puntuacionFinal} puntos.`;
            premio = '🥇';
            puntosBonus = 20;
            this._rachaVictorias++;
            if (this._rachaVictorias > this._mejorRacha) this._mejorRacha = this._rachaVictorias;
            
            this._monedasNeuro += 15 + puntosBonus;
            await this._otorgarMedalla('oro');
            await this._verificarLogros();
            
        } else if (puntuacionFinal >= this._maxRondas * 5) {
            resultado = 'empate';
            mensaje = `🤝 ¡EMPATE! Has estado a la altura de ${this._npcActual.nombre} con ${puntuacionFinal} puntos.`;
            premio = '🥈';
            puntosBonus = 10;
            this._monedasNeuro += 8;
            await this._otorgarMedalla('plata');
            
        } else {
            resultado = 'derrota';
            mensaje = `😅 ${this._npcActual.nombre} ha ganado esta vez con ${puntuacionFinal} puntos. ¡Sigue practicando!`;
            premio = '🥉';
            puntosBonus = 5;
            this._rachaVictorias = 0;
            this._monedasNeuro += 3;
            await this._otorgarMedalla('bronce');
        }
        
        if (resultado === 'victoria') this._npcActual.derrotas++;
        else if (resultado === 'derrota') this._npcActual.victorias++;
        else this._npcActual.empates++;
        
        this._npcActual.progreso = Math.min(100, this._npcActual.progreso + 5);
        
        const mensajeJuez = this._generarMensajeJuez('fin', resultado);
        
        const areaJuego = document.getElementById('areaJuego');
        if (areaJuego) {
            areaJuego.innerHTML = `
                <div style="text-align:center;padding:30px 20px;">
                    <div style="font-size:64px;margin-bottom:16px;">${resultado === 'victoria' ? '🏆' : resultado === 'empate' ? '🤝' : '😅'}</div>
                    <h2 style="font-size:22px;font-weight:800;color:${resultado === 'victoria' ? 'var(--success)' : resultado === 'empate' ? 'var(--warning)' : 'var(--danger)'};">${mensaje}</h2>
                    <div style="font-size:16px;color:var(--gray);margin:8px 0;">
                        ⭐ ${puntuacionFinal} pts · 🪙 +${this._monedasNeuro} monedas
                    </div>
                    <div style="font-size:14px;color:var(--primary);margin:8px 0;padding:10px;background:var(--primary)08;border-radius:8px;">
                        ${premio} ${puntosBonus > 0 ? `+${puntosBonus} pts bonus` : ''}
                    </div>
                    <div style="font-size:14px;color:var(--gray-light);font-style:italic;margin:8px 0;">
                        "${mensajeJuez}"
                    </div>
                    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px;">
                        <button class="btn-primary" onclick="window.SistemaCompeticiones._reiniciarPartida()" 
                                style="padding:10px 24px;font-size:15px;">
                            <i class="fas fa-redo"></i> Reintentar
                        </button>
                        <button class="btn-secondary" onclick="window.SistemaCompeticiones._renderizarPanel()" 
                                style="padding:10px 24px;font-size:15px;">
                            <i class="fas fa-home"></i> Volver
                        </button>
                    </div>
                </div>
            `;
        }
        
        const juezMsg = document.getElementById('juezMensaje');
        if (juezMsg) juezMsg.textContent = mensajeJuez;
        
        await this._guardarEstado();
        
        if (this._core) this._core.mostrarToast(`🏁 Partida finalizada: ${resultado}`, resultado === 'victoria' ? 'success' : 'info');
        
        if (window.UIDashboard) {
            window.UIDashboard._cargarDashboardInicial(this._core);
        }
    }

    // ============================================================
    // OTORGAR MEDALLAS
    // ============================================================

    async _otorgarMedalla(tipo) {
        if (tipo === 'bronce') {
            this._medallas.bronce++;
        } else if (tipo === 'plata') {
            this._medallas.plata++;
            this._monedasNeuro += 5;
        } else if (tipo === 'oro') {
            this._medallas.oro++;
            this._monedasNeuro += 15;
            this._experienciaExtra += 10;
        }
        await this._guardarEstado();
    }

    // ============================================================
    // VERIFICAR LOGROS
    // ============================================================

    async _verificarLogros() {
        const logrosConseguidos = [];
        
        for (const logro of this._logrosEspeciales) {
            if (this._premios.some(p => p.id === logro.id)) continue;
            
            let conseguido = false;
            
            switch(logro.id) {
                case 'primer_paso':
                    conseguido = this._historial.length >= 1;
                    break;
                case '3_victorias':
                    conseguido = this._contarVictorias() >= 3;
                    break;
                case '10_victorias':
                    conseguido = this._contarVictorias() >= 10;
                    break;
                case 'racha_5':
                    conseguido = this._mejorRacha >= 5;
                    break;
                case 'racha_10':
                    conseguido = this._mejorRacha >= 10;
                    break;
                case 'maestro_a1':
                    conseguido = this._contarVictoriasContra('luna') >= 3;
                    break;
                case 'maestro_a2':
                    conseguido = this._contarVictoriasContra('max') >= 3;
                    break;
                case 'maestro_b1':
                    conseguido = this._contarVictoriasContra('sofia') >= 3;
                    break;
                case 'maestro_b2':
                    conseguido = this._contarVictoriasContra('elena') >= 3;
                    break;
                case 'maestro_c1':
                    conseguido = this._contarVictoriasContra('mateo') >= 3;
                    break;
                case 'leyenda':
                    conseguido = this._contarVictoriasContra('atlas') >= 1;
                    break;
                case '100_monedas':
                    conseguido = this._monedasNeuro >= 100;
                    break;
                case '500_monedas':
                    conseguido = this._monedasNeuro >= 500;
                    break;
            }
            
            if (conseguido) {
                this._premios.push(logro);
                logrosConseguidos.push(logro);
                if (this._core) this._core.mostrarToast(`🏅 ¡Logro desbloqueado: ${logro.nombre}!`, 'success');
            }
        }
        
        if (logrosConseguidos.length > 0) {
            await this._guardarEstado();
            this._renderizarPanel();
        }
    }

    _contarVictorias() {
        let total = 0;
        for (const npc of Object.values(this._NPCs)) {
            total += npc.victorias;
        }
        return total;
    }

    _contarVictoriasContra(npcId) {
        let count = 0;
        for (const p of this._historial) {
            const npcNombre = Object.values(this._NPCs).find(n => n.id === npcId)?.nombre;
            if (p.npc === npcNombre && p.resultado === 'victoria') {
                count++;
            }
        }
        return count;
    }

    // ============================================================
    // GENERAR MENSAJE DEL JUEZ
    // ============================================================

    _generarMensajeJuez(tipo, resultado) {
        const mensajes = {
            inicio: [
                '¡Que comience la competición! Que el mejor aprendiz gane. 🏁',
                'El momento ha llegado. Demuestra tu valía en el campo de batalla del conocimiento. ⚔️',
                'He visto a muchos aprendices, pero tú tienes algo especial. ¡Demuéstralo! 🔥',
                'La sabiduría no se obtiene por casualidad. Es el resultado de la práctica constante. 📚'
            ],
            fin_victoria: [
                '¡Impresionante! Has demostrado un dominio excepcional. ¡Felicidades! 🏆',
                'La victoria es tuya. Has superado con creces las expectativas. 🌟',
                '¡Brillante! Has demostrado que el conocimiento es poder. 👑',
                'Excepcional. Tu progreso es digno de admiración. 🎯'
            ],
            fin_empate: [
                '¡Un empate! Ambos habéis demostrado un nivel similar. ¡Sigue así! 🤝',
                'Has estado a la altura. La próxima vez será tuya. 💪',
                'El empate es una oportunidad para mejorar. ¡Ánimo! 📈',
                'Bien jugado. Has demostrado que estás en el camino correcto. 🛤️'
            ],
            fin_derrota: [
                'La derrota es la mejor maestra. Aprende de ella y vuelve más fuerte. 💪',
                'No te desanimes. Cada gran maestro empezó como principiante. 🌱',
                'Has dado lo mejor de ti. La práctica constante te llevará a la victoria. 🎯',
                'El fracaso es temporal. La perseverancia es eterna. ¡Sigue adelante! 🔥'
            ]
        };
        
        const lista = mensajes[tipo] || mensajes.inicio;
        return lista[Math.floor(Math.random() * lista.length)];
    }

    // ============================================================
    // REINICIAR PARTIDA
    // ============================================================

    _reiniciarPartida() {
        this._partidaActiva = false;
        this._rondaActual = 0;
        this._puntuacion = 0;
        this._modoActual = null;
        this._renderizarPanel();
    }

    // ============================================================
    // OBTENER NOMBRE DE MODO
    // ============================================================

    _getNombreModo(modo) {
        const nombres = {
            'carrera': '🏁 Carrera',
            'duelo': '⚔️ Duelo',
            'torneo': '🏆 Torneo',
            'sprint': '⚡ Sprint'
        };
        return nombres[modo] || modo;
    }

    // ============================================================
    // CALCULAR SIMILITUD (FALLBACK)
    // ============================================================

    _calcularSimilitud(a, b) {
        if (!a || !b) return 0;
        const aLower = a.toLowerCase().trim();
        const bLower = b.toLowerCase().trim();
        if (aLower === bLower) return 1;
        
        const palabrasA = aLower.split(' ');
        const palabrasB = bLower.split(' ');
        const comunes = palabrasA.filter(p => palabrasB.includes(p));
        return comunes.length / Math.max(palabrasA.length, palabrasB.length);
    }

    // ============================================================
    // RENDERIZAR ÁREA DE JUEGO (para cuando no hay partida activa)
    // ============================================================

    _renderizarAreaJuego() {
        return `
            <div style="text-align:center;padding:20px;color:var(--gray);">
                <i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--primary);"></i>
                <p style="margin-top:12px;">Cargando partida...</p>
            </div>
        `;
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

const sistemaCompeticiones = new SistemaCompeticiones();
window.SistemaCompeticiones = sistemaCompeticiones;

// ============================================================
// AUTO-INICIALIZACIÓN
// ============================================================

console.log('🏆 Sistema de Ligas con NPCs IA v1.1 - CARGADO');
console.log('  👥 6 NPCs con personalidad y habilidades únicas');
console.log('  ⚖️ Juez IA con mensajes dinámicos');
console.log('  🎮 4 modos de competición');
console.log('  🏅 Sistema de medallas y logros');
console.log('  🪙 Monedas Neuro como moneda de la liga');
console.log('  🔥 Racha de victorias');
console.log('  📊 Historial de partidas');
console.log('  🧠 Validación de respuestas con Groq');

// Inicializar cuando uiCore esté disponible
function inicializarSistemaCompeticiones() {
    if (window.uiCore) {
        console.log('🏆 SistemaCompeticiones: Inicializando con uiCore...');
        if (window.SistemaCompeticiones && typeof window.SistemaCompeticiones.init === 'function') {
            window.SistemaCompeticiones.init(window.uiCore);
        }
        return true;
    }
    return false;
}

// Intentar inmediatamente
if (!inicializarSistemaCompeticiones()) {
    console.log('🏆 SistemaCompeticiones: Esperando uiCore...');
    let intentos = 0;
    const maxIntentos = 30;
    const checkInterval = setInterval(function() {
        intentos++;
        if (window.uiCore) {
            clearInterval(checkInterval);
            console.log('🏆 SistemaCompeticiones: uiCore encontrado, inicializando...');
            inicializarSistemaCompeticiones();
        } else if (intentos >= maxIntentos) {
            clearInterval(checkInterval);
            console.warn('⚠️ SistemaCompeticiones: No se encontró uiCore después de ' + maxIntentos + ' intentos');
            // Crear una instancia de core básica si no existe
            if (!window.uiCore) {
                console.warn('⚠️ Creando instancia de uiCore de emergencia...');
                window.uiCore = {
                    mostrarToast: function(msg, tipo) { console.log(`[${tipo}] ${msg}`); },
                    irAModulo: function(module) { console.log(`Navegando a: ${module}`); }
                };
                inicializarSistemaCompeticiones();
            }
        }
    }, 300);
}