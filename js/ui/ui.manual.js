// ============================================================
// UI MANUAL INTERACTIVO v3.0 - GUÍA DEFINITIVA DE PIPELINE NEURO
// ============================================================

class UIManual {
    constructor() {
        this._core = null;
        this._container = null;
        this._seccionActual = 'inicio';
        this._indice = 0;
        this._modoVista = 'completo'; // 'completo' | 'resumido' | 'tarjetas'
        this._initDone = false;
        this._busqueda = '';
        this._resultadosBusqueda = [];
        this._favoritosManual = new Set();
        this._ultimaLectura = 0;
        this._historialNavegacion = [];
        this._paginaActual = 1;
        this._itemsPorPagina = 10;
        
        // ============================================================
        // SECCIONES DEL MANUAL - ESTRUCTURA COMPLETA Y MEJORADA
        // ============================================================
        this._SECCIONES = {
            'inicio': {
                id: 'inicio',
                titulo: '🏠 Inicio',
                icono: '🏠',
                descripcion: 'Bienvenido a la Guía Suprema de Pipeline Neuro',
                modulo: 'dashboard',
                contenido: `
                    <div style="text-align:center;padding:20px 0;">
                        <div style="font-size:72px;margin-bottom:16px;">🧠</div>
                        <h1 style="font-size:32px;font-weight:800;background:linear-gradient(135deg,#6C5CE7,#00CEC9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Pipeline Neuro</h1>
                        <p style="font-size:18px;color:var(--gray);margin-bottom:8px;">Un Ecosistema Neuroadaptativo para el Aprendizaje de Idiomas</p>
                        <p style="font-size:14px;color:var(--gray-light);">Versión 22.3 · Guía Suprema del Sistema</p>
                        <div style="margin:20px auto;max-width:600px;background:var(--bg);border-radius:12px;padding:16px;border:2px solid var(--primary)20;">
                            <p style="font-size:14px;color:var(--dark);line-height:1.6;">
                                <strong>Pipeline Neuro</strong> no es una aplicación de aprendizaje de idiomas al uso. 
                                Es un <strong>laboratorio de neuroplasticidad lingüística</strong> diseñado para orquestar 
                                una sinfonía de procesos cognitivos que imitan y potencian la manera natural en que 
                                el cerebro humano adquiere y consolida el conocimiento.
                            </p>
                        </div>
                        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:16px;">
                            <button class="btn-primary" onclick="window.UIManual._irASeccion('fundamentos')" style="padding:10px 24px;">
                                <i class="fas fa-rocket"></i> Comenzar
                            </button>
                            <button class="btn-secondary" onclick="window.UIManual._abrirBuscadorAvanzado()" style="padding:10px 24px;">
                                <i class="fas fa-search"></i> Buscar
                            </button>
                            <button class="btn-secondary" onclick="window.UIManual._alternarVista()" style="padding:10px 24px;">
                                <i class="fas fa-eye"></i> Vista ${this._modoVista === 'completo' ? 'Resumida' : 'Completa'}
                            </button>
                            <button class="btn-secondary" onclick="window.UIManual._exportarManual()" style="padding:10px 24px;">
                                <i class="fas fa-download"></i> Exportar PDF
                            </button>
                            <button class="btn-secondary" onclick="window.uiCore.irAModulo('manual')" style="padding:10px 24px;">
                                <i class="fas fa-undo"></i> Recargar
                            </button>
                        </div>
                    </div>
                `
            },
            'fundamentos': {
                id: 'fundamentos',
                titulo: '🧠 Fundamentos del Sistema',
                icono: '🧠',
                descripcion: 'Arquitectura, modelo neurocognitivo y fases del aprendizaje',
                modulo: 'dashboard',
                contenido: `
                    <div style="padding:12px 0;">
                        <h2 style="font-size:24px;font-weight:700;color:var(--dark);margin-bottom:12px;">🧠 Fundamentos del Sistema</h2>
                        
                        <div style="background:var(--bg);border-radius:12px;padding:16px;margin-bottom:16px;border-left:4px solid var(--primary);">
                            <h3 style="font-size:18px;font-weight:700;color:var(--dark);margin-bottom:8px;">🏛️ Arquitectura del Ecosistema</h3>
                            <p style="font-size:14px;color:var(--gray);line-height:1.6;">
                                Pipeline Neuro está construido como un conjunto de módulos interconectados que trabajan en armonía:
                            </p>
                            <ul style="font-size:14px;color:var(--gray);line-height:1.8;margin:8px 0 0 20px;">
                                <li><strong>Capa de Datos (IndexedDB):</strong> Toda la información del usuario y del contenido se almacena localmente.</li>
                                <li><strong>Capa de Procesamiento Central (Core):</strong> Gestiona la lógica de aprendizaje y la analítica neurocognitiva.</li>
                                <li><strong>Capa de Interfaz de Usuario (UI):</strong> Módulos independientes que presentan la funcionalidad.</li>
                                <li><strong>Capa de Balanceo (Groq):</strong> Gestiona las solicitudes a la API de Groq optimizando el uso de tokens.</li>
                                <li><strong>Capa de Persistencia y Backup:</strong> Sistema robusto de backups, checkpoints y almacenamiento en la nube.</li>
                            </ul>
                        </div>

                        <div style="background:var(--bg);border-radius:12px;padding:16px;margin-bottom:16px;border-left:4px solid var(--secondary);">
                            <h3 style="font-size:18px;font-weight:700;color:var(--dark);margin-bottom:8px;">📊 El Modelo Neurocognitivo: RCN y Fases</h3>
                            <p style="font-size:14px;color:var(--gray);line-height:1.6;">
                                En el corazón de Pipeline Neuro se encuentra un sofisticado modelo que mide y gestiona el progreso.
                            </p>
                            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:12px 0;">
                                <div style="background:var(--white);padding:10px;border-radius:8px;text-align:center;border-top:3px solid #FF7675;">
                                    <div style="font-size:24px;font-weight:800;color:#FF7675;">0.0-1.5</div>
                                    <div style="font-size:11px;color:var(--gray);">Neuroexposición</div>
                                </div>
                                <div style="background:var(--white);padding:10px;border-radius:8px;text-align:center;border-top:3px solid #FDCB6E;">
                                    <div style="font-size:24px;font-weight:800;color:#FDCB6E;">1.5-3.0</div>
                                    <div style="font-size:11px;color:var(--gray);">Codificación</div>
                                </div>
                                <div style="background:var(--white);padding:10px;border-radius:8px;text-align:center;border-top:3px solid #00B894;">
                                    <div style="font-size:24px;font-weight:800;color:#00B894;">3.0-4.0</div>
                                    <div style="font-size:11px;color:var(--gray);">Consolidación</div>
                                </div>
                                <div style="background:var(--white);padding:10px;border-radius:8px;text-align:center;border-top:3px solid #6C5CE7;">
                                    <div style="font-size:24px;font-weight:800;color:#6C5CE7;">4.0-5.0</div>
                                    <div style="font-size:11px;color:var(--gray);">Dominio</div>
                                </div>
                            </div>
                            <p style="font-size:13px;color:var(--gray-light);">
                                <strong>RCN (Ratings of Cognitive Neuroconsolidation):</strong> Indicador principal de dominio de una palabra o frase.
                            </p>
                        </div>

                        <div style="background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:12px;padding:16px;border:2px solid var(--primary)20;">
                            <h3 style="font-size:18px;font-weight:700;color:var(--dark);margin-bottom:8px;">🔄 Las 7 Fases del Pipeline</h3>
                            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
                                <div style="background:var(--white);border-radius:8px;padding:10px;text-align:center;">
                                    <div style="font-size:28px;">🧠</div>
                                    <div style="font-weight:700;font-size:13px;">Neuroexposición</div>
                                    <div style="font-size:10px;color:var(--gray-light);">Fase 1</div>
                                </div>
                                <div style="background:var(--white);border-radius:8px;padding:10px;text-align:center;">
                                    <div style="font-size:28px;">📝</div>
                                    <div style="font-weight:700;font-size:13px;">Codificación</div>
                                    <div style="font-size:10px;color:var(--gray-light);">Fase 2</div>
                                </div>
                                <div style="background:var(--white);border-radius:8px;padding:10px;text-align:center;">
                                    <div style="font-size:28px;">🔗</div>
                                    <div style="font-weight:700;font-size:13px;">Consolidación</div>
                                    <div style="font-size:10px;color:var(--gray-light);">Fase 3</div>
                                </div>
                                <div style="background:var(--white);border-radius:8px;padding:10px;text-align:center;">
                                    <div style="font-size:28px;">🔄</div>
                                    <div style="font-weight:700;font-size:13px;">SRS Neuroadaptativo</div>
                                    <div style="font-size:10px;color:var(--gray-light);">Fase 4</div>
                                </div>
                                <div style="background:var(--white);border-radius:8px;padding:10px;text-align:center;">
                                    <div style="font-size:28px;">💪</div>
                                    <div style="font-weight:700;font-size:13px;">Recuperación Activa</div>
                                    <div style="font-size:10px;color:var(--gray-light);">Fase 5</div>
                                </div>
                                <div style="background:var(--white);border-radius:8px;padding:10px;text-align:center;">
                                    <div style="font-size:28px;">🧩</div>
                                    <div style="font-weight:700;font-size:13px;">Integración</div>
                                    <div style="font-size:10px;color:var(--gray-light);">Fase 6</div>
                                </div>
                                <div style="background:var(--white);border-radius:8px;padding:10px;text-align:center;">
                                    <div style="font-size:28px;">⚡</div>
                                    <div style="font-weight:700;font-size:13px;">Automatización</div>
                                    <div style="font-size:10px;color:var(--gray-light);">Fase 7</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            },
            'registro': {
                id: 'registro',
                titulo: '📝 Registro y Configuración',
                icono: '📝',
                descripcion: 'Cómo comenzar tu viaje en Pipeline Neuro',
                modulo: 'config',
                contenido: `
                    <div style="padding:12px 0;">
                        <h2 style="font-size:24px;font-weight:700;color:var(--dark);margin-bottom:12px;">📝 Registro y Configuración Inicial</h2>
                        
                        <div style="background:var(--white);border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:var(--shadow);">
                            <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin-bottom:6px;">Pasos Clave:</h3>
                            <ol style="font-size:14px;color:var(--gray);line-height:1.8;margin-left:20px;">
                                <li><strong>Tu Nombre:</strong> Crea tu identidad en el sistema.</li>
                                <li><strong>Idioma Nativo:</strong> Selecciona tu lengua materna.</li>
                                <li><strong>Idiomas a Aprender:</strong> Añade uno o varios idiomas y su nivel (A1-C2).</li>
                                <li><strong>API Key Groq:</strong> Introduce tu clave de API para acceder a la IA.</li>
                                <li><strong>Modo del Tutor:</strong> Elige cómo quieres que te guíe el Tutor Neuro.</li>
                            </ol>
                        </div>

                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;">
                            <div style="background:linear-gradient(135deg, #6C5CE7, #A29BFE);border-radius:12px;padding:16px;color:white;">
                                <div style="font-size:32px;margin-bottom:4px;">🚀</div>
                                <h4 style="font-weight:700;margin:0;">Modo Guiado</h4>
                                <p style="font-size:12px;opacity:0.9;margin:4px 0 0;">El tutor decide el camino. No puedes desviarte.</p>
                            </div>
                            <div style="background:linear-gradient(135deg, #00B894, #55EFC4);border-radius:12px;padding:16px;color:white;">
                                <div style="font-size:32px;margin-bottom:4px;">🧠</div>
                                <h4 style="font-weight:700;margin:0;">Modo Flexible</h4>
                                <p style="font-size:12px;opacity:0.9;margin:4px 0 0;">El tutor sugiere, tú decides. El equilibrio perfecto.</p>
                            </div>
                            <div style="background:linear-gradient(135deg, #636E72, #2D3436);border-radius:12px;padding:16px;color:white;">
                                <div style="font-size:32px;margin-bottom:4px;">📴</div>
                                <h4 style="font-weight:700;margin:0;">Modo Libre</h4>
                                <p style="font-size:12px;opacity:0.9;margin:4px 0 0;">El tutor no interviene. Control total.</p>
                            </div>
                        </div>

                        <div style="background:var(--warning)10;border-radius:12px;padding:12px 16px;margin-top:12px;border:1px solid var(--warning);">
                            <p style="font-size:13px;color:var(--warning);margin:0;">
                                💡 <strong>Consejo:</strong> Si planeas usar el sistema para idiomas jeroglíficos (chino, japonés, coreano), asegúrate de seleccionar el estándar correcto (ej. HSK 3.0).
                            </p>
                            <button class="btn-primary" onclick="window.uiCore.irAModulo('config')" style="margin-top:8px;padding:4px 16px;font-size:12px;">
                                <i class="fas fa-cog"></i> Ir a Configuración
                            </button>
                        </div>
                    </div>
                `
            },
            'dashboard': {
                id: 'dashboard',
                titulo: '📊 El Dashboard',
                icono: '📊',
                descripcion: 'El centro de mando de tu aprendizaje',
                modulo: 'dashboard',
                contenido: `
                    <div style="padding:12px 0;">
                        <h2 style="font-size:24px;font-weight:700;color:var(--dark);margin-bottom:12px;">📊 El Dashboard</h2>
                        <p style="font-size:14px;color:var(--gray);margin-bottom:16px;">El centro de mando y el punto de partida para todas las acciones.</p>

                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:16px;">
                            <div style="background:var(--bg);border-radius:10px;padding:12px;text-align:center;border-left:3px solid var(--primary);">
                                <div style="font-size:28px;">👁️</div>
                                <div style="font-weight:700;font-size:13px;">Vigía</div>
                                <div style="font-size:10px;color:var(--gray-light);">Conectividad con IA</div>
                            </div>
                            <div style="background:var(--bg);border-radius:10px;padding:12px;text-align:center;border-left:3px solid var(--secondary);">
                                <div style="font-size:28px;">🛡️</div>
                                <div style="font-weight:700;font-size:13px;">Centinela</div>
                                <div style="font-size:10px;color:var(--gray-light);">Salud del sistema</div>
                            </div>
                            <div style="background:var(--bg);border-radius:10px;padding:12px;text-align:center;border-left:3px solid var(--success);">
                                <div style="font-size:28px;">📈</div>
                                <div style="font-weight:700;font-size:13px;">Progreso Global</div>
                                <div style="font-size:10px;color:var(--gray-light);">Contenido completado</div>
                            </div>
                            <div style="background:var(--bg);border-radius:10px;padding:12px;text-align:center;border-left:3px solid var(--warning);">
                                <div style="font-size:28px;">🧠</div>
                                <div style="font-weight:700;font-size:13px;">Neuro Stats</div>
                                <div style="font-size:10px;color:var(--gray-light);">RCN, Fase, Nivel</div>
                            </div>
                        </div>

                        <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin-bottom:8px;">📦 Módulos del Dashboard</h3>
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;">
                            <div style="background:var(--white);padding:8px 12px;border-radius:8px;border:1px solid var(--light);text-align:center;font-size:12px;cursor:pointer;" onclick="window.uiCore.irAModulo('study')">📖 Estudiar</div>
                            <div style="background:var(--white);padding:8px 12px;border-radius:8px;border:1px solid var(--light);text-align:center;font-size:12px;cursor:pointer;" onclick="window.uiCore.irAModulo('grammar')">📚 Gramática</div>
                            <div style="background:var(--white);padding:8px 12px;border-radius:8px;border:1px solid var(--light);text-align:center;font-size:12px;cursor:pointer;" onclick="window.uiCore.irAModulo('temas')">📂 Temas</div>
                            <div style="background:var(--white);padding:8px 12px;border-radius:8px;border:1px solid var(--light);text-align:center;font-size:12px;cursor:pointer;" onclick="window.uiCore.irAModulo('espacio')">⭐ Mi Espacio</div>
                            <div style="background:var(--white);padding:8px 12px;border-radius:8px;border:1px solid var(--light);text-align:center;font-size:12px;cursor:pointer;" onclick="window.uiCore.irAModulo('vigia')">👁️ Vigía IA</div>
                            <div style="background:var(--white);padding:8px 12px;border-radius:8px;border:1px solid var(--light);text-align:center;font-size:12px;cursor:pointer;" onclick="window.uiCore.irAModulo('competiciones')">🏆 Ligas Neuro</div>
                            <div style="background:var(--white);padding:8px 12px;border-radius:8px;border:1px solid var(--light);text-align:center;font-size:12px;cursor:pointer;" onclick="window.uiCore.irACaracteres()">🀄 Caracteres</div>
                            <div style="background:var(--white);padding:8px 12px;border-radius:8px;border:1px solid var(--light);text-align:center;font-size:12px;cursor:pointer;" onclick="window.uiCore.irAFonetica()">🎤 Fonética</div>
                            <div style="background:var(--white);padding:8px 12px;border-radius:8px;border:1px solid var(--light);text-align:center;font-size:12px;cursor:pointer;" onclick="window.uiCore.irAElipse()">🌌 Modo Elipse</div>
                            <div style="background:var(--white);padding:8px 12px;border-radius:8px;border:1px solid var(--light);text-align:center;font-size:12px;cursor:pointer;" onclick="window.uiCore.irAOndasCruzadas()">🌊 Ondas Cruzadas</div>
                            <div style="background:var(--white);padding:8px 12px;border-radius:8px;border:1px solid var(--light);text-align:center;font-size:12px;cursor:pointer;" onclick="window.uiCore.irAModulo('config')">⚙️ Configuración</div>
                            <div style="background:var(--white);padding:8px 12px;border-radius:8px;border:1px solid var(--light);text-align:center;font-size:12px;cursor:pointer;" onclick="window.uiCore.irAModulo('tools')">🛠️ Herramientas</div>
                        </div>
                    </div>
                `
            },
            'estudiar': {
                id: 'estudiar',
                titulo: '📖 El Corazón del Aprendizaje',
                icono: '📖',
                descripcion: 'El módulo "Estudiar" - Práctica con SRS',
                modulo: 'study',
                contenido: `
                    <div style="padding:12px 0;">
                        <h2 style="font-size:24px;font-weight:700;color:var(--dark);margin-bottom:12px;">📖 El Módulo "Estudiar"</h2>
                        <p style="font-size:14px;color:var(--gray);margin-bottom:16px;">El corazón del aprendizaje. Donde la teoría se convierte en práctica.</p>

                        <div style="background:var(--bg);border-radius:12px;padding:16px;margin-bottom:16px;">
                            <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin-bottom:8px;">🎯 Modos de Estudio</h3>
                            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;">
                                <div style="background:var(--white);padding:12px;border-radius:8px;text-align:center;border:2px solid var(--primary)30;">
                                    <div style="font-size:32px;">🃏</div>
                                    <div style="font-weight:700;font-size:13px;">Flashcard</div>
                                    <div style="font-size:10px;color:var(--gray-light);">Exposición inicial</div>
                                </div>
                                <div style="background:var(--white);padding:12px;border-radius:8px;text-align:center;border:2px solid var(--secondary)30;">
                                    <div style="font-size:32px;">✍️</div>
                                    <div style="font-weight:700;font-size:13px;">Escritura</div>
                                    <div style="font-size:10px;color:var(--gray-light);">Recuperación activa</div>
                                </div>
                                <div style="background:var(--white);padding:12px;border-radius:8px;text-align:center;border:2px solid var(--warning)30;">
                                    <div style="font-size:32px;">📋</div>
                                    <div style="font-weight:700;font-size:13px;">Múltiple</div>
                                    <div style="font-size:10px;color:var(--gray-light);">Reconocimiento</div>
                                </div>
                                <div style="background:var(--white);padding:12px;border-radius:8px;text-align:center;border:2px solid var(--success)30;">
                                    <div style="font-size:32px;">🔊</div>
                                    <div style="font-weight:700;font-size:13px;">Escucha</div>
                                    <div style="font-size:10px;color:var(--gray-light);">Comprensión auditiva</div>
                                </div>
                            </div>
                        </div>

                        <div style="background:var(--white);border-radius:12px;padding:16px;box-shadow:var(--shadow);margin-bottom:12px;">
                            <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin-bottom:6px;">🎯 Palabras Desglosadas</h3>
                            <p style="font-size:13px;color:var(--gray);">Haz clic en cualquier palabra subrayada para ver su significado, familia semántica y guardarla en "Mi Espacio".</p>
                        </div>

                        <div style="background:var(--white);border-radius:12px;padding:16px;box-shadow:var(--shadow);">
                            <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin-bottom:6px;">📚 El Libro de Lectura</h3>
                            <p style="font-size:13px;color:var(--gray);">Un botón en la esquina del módulo "Estudiar" abre una vista de todas las historias y temas. Explora, lee y marca historias como "leídas".</p>
                            <button class="btn-primary" onclick="window.uiCore.irAModulo('study')" style="margin-top:8px;padding:4px 16px;font-size:12px;">
                                <i class="fas fa-play"></i> Ir a Estudiar
                            </button>
                        </div>
                    </div>
                `
            },
            'temas': {
                id: 'temas',
                titulo: '📂 El Arquitecto del Conocimiento',
                icono: '📂',
                descripcion: 'El módulo "Temas" - Gestión de contenido',
                modulo: 'temas',
                contenido: `
                    <div style="padding:12px 0;">
                        <h2 style="font-size:24px;font-weight:700;color:var(--dark);margin-bottom:12px;">📂 El Módulo "Temas"</h2>
                        <p style="font-size:14px;color:var(--gray);margin-bottom:16px;">Construye y gestiona el ecosistema de tu aprendizaje.</p>

                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin-bottom:16px;">
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--primary);">
                                <div style="font-weight:700;font-size:15px;">📁 Mis Temas</div>
                                <div style="font-size:12px;color:var(--gray-light);">Contenido creado o importado manualmente</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--secondary);">
                                <div style="font-weight:700;font-size:15px;">📥 Temas Importados</div>
                                <div style="font-size:12px;color:var(--gray-light);">Material de estudio de referencia</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--warning);">
                                <div style="font-weight:700;font-size:15px;">🎯 Temas Predefinidos</div>
                                <div style="font-size:12px;color:var(--gray-light);">Guía curricular por nivel</div>
                            </div>
                        </div>

                        <div style="background:var(--white);border-radius:12px;padding:16px;box-shadow:var(--shadow);margin-bottom:12px;">
                            <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin-bottom:6px;">🔄 Acciones Clave</h3>
                            <ul style="font-size:14px;color:var(--gray);line-height:1.8;margin-left:20px;">
                                <li><strong>Crear Historia:</strong> Genera una nueva historia usando una descripción detallada y la IA.</li>
                                <li><strong>Estudiar:</strong> Lanza el estudio de un tema entero.</li>
                                <li><strong>Exportar/Importar:</strong> Comparte o respalda temas como JSON.</li>
                                <li><strong>Sincronizar Caracteres:</strong> Extrae caracteres jeroglíficos y crea familias.</li>
                                <li><strong>Generar Onda:</strong> Crea una nueva "onda" de aprendizaje en el Modo Elipse.</li>
                            </ul>
                            <button class="btn-primary" onclick="window.uiCore.irAModulo('temas')" style="margin-top:8px;padding:4px 16px;font-size:12px;">
                                <i class="fas fa-folder-open"></i> Ir a Temas
                            </button>
                        </div>
                    </div>
                `
            },
            'vigia': {
                id: 'vigia',
                titulo: '👁️ El Tutor Personal: Vigía IA',
                icono: '👁️',
                descripcion: 'El asistente inteligente de Pipeline Neuro',
                modulo: 'vigia',
                contenido: `
                    <div style="padding:12px 0;">
                        <h2 style="font-size:24px;font-weight:700;color:var(--dark);margin-bottom:12px;">👁️ Vigía IA</h2>
                        <p style="font-size:14px;color:var(--gray);margin-bottom:16px;">El asistente inteligente accesible a través de un potente chat.</p>

                        <div style="background:var(--bg);border-radius:12px;padding:16px;margin-bottom:16px;">
                            <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin-bottom:8px;">💬 Comandos "Slash"</h3>
                            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;font-size:12px;">
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/espacio</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/espacio-ver</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/temas</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/generar [tema]</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/temasnuevos</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/examen</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/analizar</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/diagnostico</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/estadisticas</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/exportar</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/reiniciar</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/nivel [NIVEL]</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/idiomas</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/add [idioma] [nivel]</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/switch [idioma]</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/modo</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/feedback</code></span>
                                <span style="background:var(--white);padding:4px 10px;border-radius:4px;border:1px solid var(--light);"><code>/help</code></span>
                            </div>
                        </div>

                        <div style="background:var(--white);border-radius:12px;padding:16px;box-shadow:var(--shadow);">
                            <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin-bottom:6px;">📝 Comandos Naturales</h3>
                            <p style="font-size:13px;color:var(--gray);">
                                Además de los comandos, escribe en lenguaje natural:<br>
                                <code>palabras: hola, mundo, casa</code> para guardar vocabulario<br>
                                <code>frases: hola, adios, gracias</code> para guardar frases<br>
                                <code>¿Cómo se dice "gracias" en chino?</code> para preguntar directamente
                            </p>
                            <button class="btn-primary" onclick="window.uiCore.irAModulo('vigia')" style="margin-top:8px;padding:4px 16px;font-size:12px;">
                                <i class="fas fa-comment"></i> Ir al Chat
                            </button>
                        </div>
                    </div>
                `
            },
            'espacio': {
                id: 'espacio',
                titulo: '⭐ Mi Espacio',
                icono: '⭐',
                descripcion: 'Tu colección personal de vocabulario',
                modulo: 'espacio',
                contenido: `
                    <div style="padding:12px 0;">
                        <h2 style="font-size:24px;font-weight:700;color:var(--dark);margin-bottom:12px;">⭐ Mi Espacio</h2>
                        <p style="font-size:14px;color:var(--gray);margin-bottom:16px;">El "cajón de sastre" del usuario, donde se almacenan palabras y frases favoritas.</p>

                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin-bottom:16px;">
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--primary);">
                                <div style="font-weight:700;font-size:15px;">📚 Organización Jerárquica</div>
                                <div style="font-size:12px;color:var(--gray-light);">Nivel → Familia Semántica → Palabras/Frases</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--secondary);">
                                <div style="font-weight:700;font-size:15px;">➕ Añadir Contenido</div>
                                <div style="font-size:12px;color:var(--gray-light);">Pega listas de palabras o frases para traducir y clasificar</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--success);">
                                <div style="font-weight:700;font-size:15px;">💪 Ejercicios</div>
                                <div style="font-size:12px;color:var(--gray-light);">Rellenar, traducir u ordenar con tu propio vocabulario</div>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="window.uiCore.irAModulo('espacio')" style="padding:8px 20px;">
                            <i class="fas fa-star"></i> Ir a Mi Espacio
                        </button>
                    </div>
                `
            },
            'caracteres': {
                id: 'caracteres',
                titulo: '🀄 La Ciencia de la Escritura',
                icono: '🀄',
                descripcion: 'El módulo "Caracteres" para idiomas jeroglíficos',
                modulo: 'caracteres',
                contenido: `
                    <div style="padding:12px 0;">
                        <h2 style="font-size:24px;font-weight:700;color:var(--dark);margin-bottom:12px;">🀄 El Módulo "Caracteres"</h2>
                        <p style="font-size:14px;color:var(--gray);margin-bottom:16px;">Diseñado exclusivamente para idiomas jeroglíficos (chino, japonés, coreano).</p>

                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--primary);">
                                <div style="font-weight:700;font-size:15px;">🧩 Familias de Caracteres</div>
                                <div style="font-size:12px;color:var(--gray-light);">Carácter raíz + palabras derivadas</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--secondary);">
                                <div style="font-weight:700;font-size:15px;">✍️ Ejercicios Especializados</div>
                                <div style="font-size:12px;color:var(--gray-light);">Escritura, asociación, orden de trazos</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--success);">
                                <div style="font-weight:700;font-size:15px;">🔄 Sincronización</div>
                                <div style="font-size:12px;color:var(--gray-light);">Extracción automática desde los temas</div>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="window.uiCore.irACaracteres()" style="margin-top:12px;padding:8px 20px;">
                            <i class="fas fa-characters"></i> Ir a Caracteres
                        </button>
                    </div>
                `
            },
            'elipse': {
                id: 'elipse',
                titulo: '🌌 El Modo Elipse',
                icono: '🌌',
                descripcion: 'Aprendizaje narrativo expansivo',
                modulo: 'elipse',
                contenido: `
                    <div style="padding:12px 0;">
                        <h2 style="font-size:24px;font-weight:700;color:var(--dark);margin-bottom:12px;">🌌 El Modo Elipse</h2>
                        <p style="font-size:14px;color:var(--gray);margin-bottom:16px;">Transforma el aprendizaje lineal en un viaje narrativo expansivo.</p>

                        <div style="background:var(--bg);border-radius:12px;padding:16px;margin-bottom:16px;border-left:4px solid var(--primary);">
                            <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin-bottom:6px;">🌊 El Concepto de "Onda"</h3>
                            <p style="font-size:13px;color:var(--gray);">El aprendizaje no es una línea recta, sino una serie de ondas que se expanden desde una historia base. Cada onda es una nueva historia que continúa la narrativa anterior.</p>
                        </div>

                        <div style="background:var(--white);border-radius:12px;padding:16px;box-shadow:var(--shadow);">
                            <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin-bottom:6px;">🔄 El Flujo de Trabajo</h3>
                            <ol style="font-size:13px;color:var(--gray);line-height:1.8;margin-left:20px;">
                                <li><strong>Seleccionar un Tema:</strong> Elige un tema de tu biblioteca.</li>
                                <li><strong>Generar Plantilla:</strong> El sistema genera un JSON con el contexto de ondas anteriores (el "Recuerdo").</li>
                                <li><strong>Completar con IA:</strong> Envía la plantilla a un modelo de IA para que escriba la continuación.</li>
                                <li><strong>Importar:</strong> Añade la nueva onda a la elipse.</li>
                                <li><strong>Sincronizar:</strong> Cuando se completa, se sincroniza con el tema principal.</li>
                            </ol>
                            <button class="btn-primary" onclick="window.uiCore.irAElipse()" style="margin-top:8px;padding:4px 16px;font-size:12px;">
                                <i class="fas fa-wave-square"></i> Ir a Elipse
                            </button>
                        </div>
                    </div>
                `
            },
            'ondas_cruzadas': {
                id: 'ondas_cruzadas',
                titulo: '🌊 El Modo Ondas Cruzadas',
                icono: '🌊',
                descripcion: 'La síntesis del conocimiento',
                modulo: 'ondasCruzadas',
                contenido: `
                    <div style="padding:12px 0;">
                        <h2 style="font-size:24px;font-weight:700;color:var(--dark);margin-bottom:12px;">🌊 El Modo Ondas Cruzadas</h2>
                        <p style="font-size:14px;color:var(--gray);margin-bottom:16px;">El pináculo de la integración del conocimiento en Pipeline Neuro.</p>

                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin-bottom:16px;">
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--primary);">
                                <div style="font-weight:700;font-size:15px;">🕸️ El Grafo de Elipses</div>
                                <div style="font-size:12px;color:var(--gray-light);">Visualiza tus elipses como nodos interconectados</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--secondary);">
                                <div style="font-weight:700;font-size:15px;">🔗 Interferencias</div>
                                <div style="font-size:12px;color:var(--gray-light);">Puntos de solapamiento semántico entre elipses</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--success);">
                                <div style="font-weight:700;font-size:15px;">📚 Recuerdo Global</div>
                                <div style="font-size:12px;color:var(--gray-light);">Personajes, lugares y vocabulario clave de todas las elipses</div>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="window.uiCore.irAOndasCruzadas()" style="margin-top:8px;padding:4px 16px;font-size:12px;">
                            <i class="fas fa-network-wired"></i> Ir a Ondas Cruzadas
                        </button>
                    </div>
                `
            },
            'competiciones': {
                id: 'competiciones',
                titulo: '🏆 El Juego del Conocimiento',
                icono: '🏆',
                descripcion: 'El módulo "Competiciones" - Aprende jugando',
                modulo: 'competiciones',
                contenido: `
                    <div style="padding:12px 0;">
                        <h2 style="font-size:24px;font-weight:700;color:var(--dark);margin-bottom:12px;">🏆 El Módulo "Competiciones"</h2>
                        <p style="font-size:14px;color:var(--gray);margin-bottom:16px;">Convierte el aprendizaje en un desafío atractivo.</p>

                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin-bottom:16px;">
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--primary);">
                                <div style="font-weight:700;font-size:15px;">👥 NPCs Inteligentes</div>
                                <div style="font-size:12px;color:var(--gray-light);">Oponentes controlados por IA con personalidad única</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--secondary);">
                                <div style="font-weight:700;font-size:15px;">🎮 4 Modos de Juego</div>
                                <div style="font-size:12px;color:var(--gray-light);">Carrera, Duelo, Torneo y Sprint</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--success);">
                                <div style="font-weight:700;font-size:15px;">🏅 Sistema de Premios</div>
                                <div style="font-size:12px;color:var(--gray-light);">Monedas Neuro, medallas y logros</div>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="window.uiCore.irAModulo('competiciones')" style="padding:8px 20px;">
                            <i class="fas fa-trophy"></i> Ir a Competiciones
                        </button>
                    </div>
                `
            },
            'configuracion': {
                id: 'configuracion',
                titulo: '⚙️ El Centro de Control',
                icono: '⚙️',
                descripcion: 'El módulo "Configuración" - Ajusta tu experiencia',
                modulo: 'config',
                contenido: `
                    <div style="padding:12px 0;">
                        <h2 style="font-size:24px;font-weight:700;color:var(--dark);margin-bottom:12px;">⚙️ El Módulo "Configuración"</h2>
                        <p style="font-size:14px;color:var(--gray);margin-bottom:16px;">El lugar para ajustar la experiencia de aprendizaje a tus preferencias.</p>

                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin-bottom:16px;">
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--primary);">
                                <div style="font-weight:700;font-size:15px;">🧠 Tutor Neuro</div>
                                <div style="font-size:12px;color:var(--gray-light);">Cambia entre modos Guiado, Flexible y Libre</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--secondary);">
                                <div style="font-weight:700;font-size:15px;">⚡ Super Power</div>
                                <div style="font-size:12px;color:var(--gray-light);">Genera un JSON con todo el contenido de un nivel</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--success);">
                                <div style="font-weight:700;font-size:15px;">🌍 Gestión de Idiomas</div>
                                <div style="font-size:12px;color:var(--gray-light);">Añade, cambia o elimina idiomas y versiones</div>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="window.uiCore.irAModulo('config')" style="padding:8px 20px;">
                            <i class="fas fa-sliders-h"></i> Ir a Configuración
                        </button>
                    </div>
                `
            },
            'herramientas': {
                id: 'herramientas',
                titulo: '🛠️ La Caja de Herramientas',
                icono: '🛠️',
                descripcion: 'Utilidades para mantenimiento avanzado',
                modulo: 'tools',
                contenido: `
                    <div style="padding:12px 0;">
                        <h2 style="font-size:24px;font-weight:700;color:var(--dark);margin-bottom:12px;">🛠️ El Módulo "Herramientas"</h2>
                        <p style="font-size:14px;color:var(--gray);margin-bottom:16px;">Un arsenal de utilidades para la gestión avanzada del sistema.</p>

                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--primary);">
                                <div style="font-weight:700;font-size:15px;">💾 Backup Neuro</div>
                                <div style="font-size:12px;color:var(--gray-light);">Multi-capa · Correo · QR · Drive · Texto</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--secondary);">
                                <div style="font-weight:700;font-size:15px;">🏁 Checkpoints</div>
                                <div style="font-size:12px;color:var(--gray-light);">Puntos de control para restaurar</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--success);">
                                <div style="font-weight:700;font-size:15px;">🩺 Diagnóstico</div>
                                <div style="font-size:12px;color:var(--gray-light);">Análisis completo del sistema</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--warning);">
                                <div style="font-weight:700;font-size:15px;">⚡ Modo Simplificado</div>
                                <div style="font-size:12px;color:var(--gray-light);">Reduce la carga cognitiva</div>
                            </div>
                            <div style="background:var(--bg);border-radius:12px;padding:14px;border-left:4px solid var(--danger);">
                                <div style="font-weight:700;font-size:15px;">🗑️ Limpiar Datos</div>
                                <div style="font-size:12px;color:var(--gray-light);">⚠️ Elimina todos los datos (¡usa con precaución!)</div>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="window.uiCore.irAModulo('tools')" style="margin-top:12px;padding:8px 20px;">
                            <i class="fas fa-tools"></i> Ir a Herramientas
                        </button>
                    </div>
                `
            }
        };
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init(core) {
        if (this._initDone) return this;
        this._core = core || window.uiCore;
        
        // Cargar favoritos del manual
        try {
            const favs = localStorage.getItem('pipeline_manual_favoritos');
            if (favs) {
                this._favoritosManual = new Set(JSON.parse(favs));
            }
        } catch (e) {}
        
        // Cargar última lectura
        try {
            const lectura = localStorage.getItem('pipeline_manual_ultima_lectura');
            if (lectura) {
                this._ultimaLectura = parseInt(lectura);
            }
        } catch (e) {}
        
        // Cargar historial de navegación
        try {
            const hist = localStorage.getItem('pipeline_manual_historial');
            if (hist) {
                this._historialNavegacion = JSON.parse(hist);
            }
        } catch (e) {}
        
        this._initDone = true;
        console.log('📚 Manual Interactivo v3.0: Inicializado (SUPER POTENTE)');
        console.log(`   📖 ${Object.keys(this._SECCIONES).length} secciones disponibles`);
        console.log(`   ⭐ ${this._favoritosManual.size} favoritos`);
        return this;
    }

    cargar(core) {
        this._core = core || this._core;
        this._container = document.getElementById('manualContent');
        
        if (!this._container) {
            const moduleDiv = document.getElementById('manualModule');
            if (moduleDiv) {
                this._container = document.createElement('div');
                this._container.id = 'manualContent';
                moduleDiv.appendChild(this._container);
            }
        }
        
        if (this._container) {
            this._renderizarManual();
        } else {
            console.warn('⚠️ manualContent no encontrado');
        }
    }

    // ============================================================
    // RENDERIZAR MANUAL SUPER POTENTE
    // ============================================================

    _renderizarManual() {
        if (!this._container) return;
        
        const secciones = Object.values(this._SECCIONES);
        const seccionActual = this._SECCIONES[this._seccionActual] || this._SECCIONES['inicio'];
        const totalFavoritos = this._favoritosManual.size;
        
        // Aplicar filtro de búsqueda
        let seccionesFiltradas = secciones;
        if (this._busqueda && this._busqueda.length >= 2) {
            const terminoLower = this._busqueda.toLowerCase();
            seccionesFiltradas = secciones.filter(sec => {
                const titulo = sec.titulo.toLowerCase();
                const desc = (sec.descripcion || '').toLowerCase();
                const contenido = sec.contenido.replace(/<[^>]*>/g, ' ').toLowerCase();
                return titulo.includes(terminoLower) || desc.includes(terminoLower) || contenido.includes(terminoLower);
            });
            
            // Actualizar resultados
            this._resultadosBusqueda = seccionesFiltradas.map(s => s.id);
        }
        
        // Paginación para la vista de tarjetas
        const totalItems = seccionesFiltradas.length;
        const totalPaginas = Math.max(1, Math.ceil(totalItems / this._itemsPorPagina));
        if (this._paginaActual > totalPaginas) this._paginaActual = totalPaginas;
        if (this._paginaActual < 1) this._paginaActual = 1;
        
        const inicio = (this._paginaActual - 1) * this._itemsPorPagina;
        const fin = Math.min(inicio + this._itemsPorPagina, totalItems);
        const seccionesPagina = seccionesFiltradas.slice(inicio, fin);
        
        let html = `
            <div class="manual-container" style="padding:16px;max-width:100%;">
                <!-- HEADER SUPER POTENTE -->
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:12px 20px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:14px;border:2px solid var(--primary)20;">
                    <div>
                        <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                            📖 Guía Definitiva de Pipeline Neuro
                            <span style="font-size:14px;font-weight:400;color:var(--gray);margin-left:8px;">v3.0</span>
                        </h2>
                        <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                            ${secciones.length} secciones · ⭐ ${totalFavoritos} favoritos
                            ${this._busqueda ? ` · 🔎 ${this._resultadosBusqueda.length} resultados para "${this._busqueda}"` : ''}
                            <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">
                                Última lectura: ${this._ultimaLectura ? new Date(this._ultimaLectura).toLocaleString() : 'Nunca'}
                            </span>
                        </p>
                    </div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.UIManual._abrirBuscadorAvanzado()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-search"></i> Buscar
                        </button>
                        <button class="btn-secondary" onclick="window.UIManual._alternarVista()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-eye"></i> ${this._modoVista === 'completo' ? 'Vista Resumida' : this._modoVista === 'resumido' ? 'Vista Tarjetas' : 'Vista Completa'}
                        </button>
                        <button class="btn-secondary" onclick="window.UIManual._exportarManual()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-download"></i> Exportar
                        </button>
                        <button class="btn-secondary" onclick="window.UIManual._mostrarHistorial()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-history"></i> Historial
                        </button>
                        <button class="btn-secondary" onclick="window.uiCore.volverDashboard()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-home"></i> Dashboard
                        </button>
                    </div>
                </div>

                <!-- BARRA DE NAVEGACIÓN RÁPIDA -->
                <div style="display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;padding:4px 0;flex-wrap:wrap;border-bottom:2px solid var(--light);padding-bottom:8px;">
                    ${secciones.map(sec => `
                        <button class="btn-secondary" 
                                onclick="window.UIManual._irASeccion('${sec.id}')" 
                                style="padding:6px 14px;font-size:11px;border-radius:20px;border:2px solid ${this._seccionActual === sec.id ? 'var(--primary)' : 'var(--light)'};background:${this._seccionActual === sec.id ? 'var(--primary)' : 'var(--white)'};color:${this._seccionActual === sec.id ? 'white' : 'var(--dark)'};cursor:pointer;transition:all 0.3s;white-space:nowrap;"
                                onmouseover="this.style.transform='scale(1.02)'" 
                                onmouseout="this.style.transform='none'">
                            ${sec.icono} ${sec.titulo}
                            ${this._favoritosManual.has(sec.id) ? ' ⭐' : ''}
                            ${sec.modulo ? `<span style="font-size:8px;opacity:0.6;">📌</span>` : ''}
                        </button>
                    `).join('')}
                </div>

                ${this._busqueda ? `
                    <div style="background:var(--warning)10;border-radius:8px;padding:8px 14px;margin-bottom:12px;border:1px solid var(--warning);display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:13px;color:var(--dark);">
                            🔎 ${this._resultadosBusqueda.length} resultados para "<strong>${this._busqueda}</strong>"
                        </span>
                        <button class="btn-secondary" onclick="window.UIManual._limpiarBusqueda()" style="padding:2px 12px;font-size:11px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-times"></i> Limpiar
                        </button>
                    </div>
                ` : ''}

                <!-- CONTENIDO DE LA SECCIÓN -->
                <div style="background:var(--white);border-radius:12px;padding:20px 24px;box-shadow:var(--shadow);min-height:400px;">
                    ${this._modoVista === 'tarjetas' ? this._renderizarVistaTarjetas(seccionesPagina) : seccionActual.contenido}
                </div>

                <!-- NAVEGACIÓN Y ACCIONES MEJORADAS -->
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:16px;padding:12px 16px;background:var(--bg);border-radius:8px;border:1px solid var(--light);">
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button class="btn-secondary" onclick="window.UIManual._seccionAnterior()" style="padding:6px 14px;font-size:12px;${this._indice <= 0 ? 'opacity:0.5;cursor:default;' : ''}" ${this._indice <= 0 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-left"></i> Anterior
                        </button>
                        <button class="btn-secondary" onclick="window.UIManual._seccionSiguiente()" style="padding:6px 14px;font-size:12px;${this._indice >= secciones.length - 1 ? 'opacity:0.5;cursor:default;' : ''}" ${this._indice >= secciones.length - 1 ? 'disabled' : ''}>
                            Siguiente <i class="fas fa-chevron-right"></i>
                        </button>
                        ${this._modoVista !== 'tarjetas' ? `
                            <button class="btn-secondary" onclick="window.UIManual._irAlModulo('${seccionActual.modulo || 'dashboard'}')" 
                                    style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;">
                                <i class="fas fa-arrow-right"></i> Ir al Módulo
                            </button>
                        ` : ''}
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                        <span style="font-size:12px;color:var(--gray-light);">${this._indice + 1} / ${secciones.length}</span>
                        <button class="btn-secondary" onclick="window.UIManual._toggleFavorito('${seccionActual.id}')" style="padding:4px 12px;font-size:11px;background:${this._favoritosManual.has(seccionActual.id) ? 'var(--success)' : 'var(--bg)'};color:${this._favoritosManual.has(seccionActual.id) ? 'white' : 'var(--dark)'};border:1px solid ${this._favoritosManual.has(seccionActual.id) ? 'var(--success)' : 'var(--light)'};border-radius:4px;cursor:pointer;">
                            ${this._favoritosManual.has(seccionActual.id) ? '⭐ Favorito' : '☆ Marcar favorito'}
                        </button>
                        <button class="btn-secondary" onclick="window.UIManual._compartirSeccion('${seccionActual.id}')" style="padding:4px 12px;font-size:11px;background:var(--bg);border:1px solid var(--light);border-radius:4px;cursor:pointer;">
                            <i class="fas fa-share-alt"></i>
                        </button>
                        <button class="btn-secondary" onclick="window.UIManual._irAInicio()" style="padding:4px 12px;font-size:11px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-home"></i>
                        </button>
                    </div>
                </div>
                
                <!-- PIE DE PÁGINA CON ESTADÍSTICAS -->
                <div style="margin-top:8px;padding:6px 12px;background:var(--bg);border-radius:6px;border:1px solid var(--light);display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;font-size:10px;color:var(--gray-light);">
                    <span>📖 ${secciones.length} secciones</span>
                    <span>⭐ ${totalFavoritos} favoritos</span>
                    <span>${this._busqueda ? `🔎 ${this._resultadosBusqueda.length} resultados` : ''}</span>
                    <span>📌 Módulo actual: ${seccionActual.modulo || 'dashboard'}</span>
                    <span>📊 Versión 3.0</span>
                    <span>💾 ${this._historialNavegacion.length} visitas</span>
                </div>
            </div>
        `;
        
        this._container.innerHTML = html;
        
        // Guardar última lectura
        this._ultimaLectura = Date.now();
        localStorage.setItem('pipeline_manual_ultima_lectura', String(this._ultimaLectura));
        
        // Registrar en historial
        if (this._seccionActual !== 'inicio') {
            this._historialNavegacion.push({
                seccion: this._seccionActual,
                timestamp: Date.now()
            });
            if (this._historialNavegacion.length > 50) {
                this._historialNavegacion = this._historialNavegacion.slice(-50);
            }
            localStorage.setItem('pipeline_manual_historial', JSON.stringify(this._historialNavegacion));
        }
    }

    // ============================================================
    // VISTA DE TARJETAS (MODO TARJETAS)
    // ============================================================

    _renderizarVistaTarjetas(secciones) {
        let html = `
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
        `;
        
        for (const sec of secciones) {
            const esFavorita = this._favoritosManual.has(sec.id);
            const esActual = this._seccionActual === sec.id;
            
            html += `
                <div style="
                    background:${esActual ? 'var(--primary)04' : 'var(--white)'};
                    border-radius:12px;
                    padding:16px 18px;
                    border:2px solid ${esActual ? 'var(--primary)' : 'var(--light)'};
                    box-shadow:${esActual ? '0 4px 20px rgba(108,92,231,0.1)' : 'var(--shadow)'};
                    cursor:pointer;
                    transition:all 0.3s ease;
                    ${esFavorita ? 'position:relative;' : ''}
                "
                onclick="window.UIManual._irASeccion('${sec.id}')"
                onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'"
                onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                    ${esFavorita ? `
                        <div style="position:absolute;top:8px;right:8px;font-size:16px;">⭐</div>
                    ` : ''}
                    <div style="font-size:32px;margin-bottom:8px;">${sec.icono}</div>
                    <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0 0 4px 0;">
                        ${sec.titulo}
                        ${sec.modulo ? `<span style="font-size:10px;color:var(--gray-light);font-weight:400;">📌 ${sec.modulo}</span>` : ''}
                    </h3>
                    <p style="font-size:13px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;">${sec.descripcion}</p>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
                        <button class="btn-secondary" onclick="event.stopPropagation();window.UIManual._irASeccion('${sec.id}')" style="padding:2px 12px;font-size:11px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-book-open"></i> Leer
                        </button>
                        ${sec.modulo ? `
                            <button class="btn-secondary" onclick="event.stopPropagation();window.UIManual._irAlModulo('${sec.modulo}')" style="padding:2px 12px;font-size:11px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                <i class="fas fa-arrow-right"></i> Ir
                            </button>
                        ` : ''}
                        <button class="btn-secondary" onclick="event.stopPropagation();window.UIManual._toggleFavorito('${sec.id}')" style="padding:2px 12px;font-size:11px;background:${esFavorita ? 'var(--success)' : 'var(--bg)'};color:${esFavorita ? 'white' : 'var(--dark)'};border:1px solid ${esFavorita ? 'var(--success)' : 'var(--light)'};border-radius:4px;cursor:pointer;">
                            ${esFavorita ? '⭐' : '☆'}
                        </button>
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
        
        // Paginador
        const totalItems = Object.keys(this._SECCIONES).length;
        const totalPaginas = Math.max(1, Math.ceil(totalItems / this._itemsPorPagina));
        if (totalPaginas > 1) {
            html += `
                <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-top:16px;flex-wrap:wrap;">
                    <button class="btn-secondary" onclick="window.UIManual._irPagina(${this._paginaActual - 1})" style="padding:4px 12px;font-size:11px;${this._paginaActual <= 1 ? 'opacity:0.5;cursor:default;' : ''}" ${this._paginaActual <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span style="font-size:12px;color:var(--gray);">${this._paginaActual} / ${totalPaginas}</span>
                    <button class="btn-secondary" onclick="window.UIManual._irPagina(${this._paginaActual + 1})" style="padding:4px 12px;font-size:11px;${this._paginaActual >= totalPaginas ? 'opacity:0.5;cursor:default;' : ''}" ${this._paginaActual >= totalPaginas ? 'disabled' : ''}>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            `;
        }
        
        return html;
    }

    // ============================================================
    // NAVEGACIÓN
    // ============================================================

    _irASeccion(id) {
        if (this._SECCIONES[id]) {
            this._seccionActual = id;
            const secciones = Object.values(this._SECCIONES);
            this._indice = secciones.findIndex(s => s.id === id);
            if (this._indice === -1) this._indice = 0;
            this._busqueda = '';
            this._renderizarManual();
        }
    }

    _seccionAnterior() {
        if (this._indice > 0) {
            this._indice--;
            const secciones = Object.values(this._SECCIONES);
            this._seccionActual = secciones[this._indice].id;
            this._renderizarManual();
        }
    }

    _seccionSiguiente() {
        const secciones = Object.values(this._SECCIONES);
        if (this._indice < secciones.length - 1) {
            this._indice++;
            this._seccionActual = secciones[this._indice].id;
            this._renderizarManual();
        }
    }

    _irAInicio() {
        this._seccionActual = 'inicio';
        this._indice = 0;
        this._renderizarManual();
    }

    _irPagina(pagina) {
        const totalItems = Object.keys(this._SECCIONES).length;
        const totalPaginas = Math.max(1, Math.ceil(totalItems / this._itemsPorPagina));
        if (pagina < 1 || pagina > totalPaginas) return;
        this._paginaActual = pagina;
        this._renderizarManual();
    }

    // ============================================================
    // IR AL MÓDULO
    // ============================================================

    _irAlModulo(modulo) {
        if (!modulo) return;
        if (this._core) {
            this._core.irAModulo(modulo);
            this._core.mostrarToast(`📌 Módulo: ${modulo}`, 'info');
        } else if (window.uiCore) {
            window.uiCore.irAModulo(modulo);
            window.uiCore.mostrarToast(`📌 Módulo: ${modulo}`, 'info');
        }
    }

    // ============================================================
    // FAVORITOS
    // ============================================================

    _toggleFavorito(id) {
        if (this._favoritosManual.has(id)) {
            this._favoritosManual.delete(id);
            this._core?.mostrarToast('🗑️ Favorito eliminado', 'info');
        } else {
            this._favoritosManual.add(id);
            this._core?.mostrarToast('⭐ Añadido a favoritos', 'success');
        }
        localStorage.setItem('pipeline_manual_favoritos', JSON.stringify(Array.from(this._favoritosManual)));
        this._renderizarManual();
    }

    // ============================================================
    // VISTA
    // ============================================================

    _alternarVista() {
        const modos = ['completo', 'resumido', 'tarjetas'];
        const idx = modos.indexOf(this._modoVista);
        this._modoVista = modos[(idx + 1) % modos.length];
        const nombres = {
            'completo': 'Completa',
            'resumido': 'Resumida',
            'tarjetas': 'Tarjetas'
        };
        this._core?.mostrarToast(`👁️ Vista ${nombres[this._modoVista]}`, 'info');
        this._renderizarManual();
    }

    // ============================================================
    // BÚSQUEDA AVANZADA
    // ============================================================

    _abrirBuscadorAvanzado() {
        const html = `
            <div style="padding:8px 0;">
                <div style="margin-bottom:12px;">
                    <label style="font-size:14px;font-weight:600;color:var(--dark);display:block;margin-bottom:4px;">
                        🔍 Buscar en el Manual
                    </label>
                    <input type="text" id="buscadorManualInput" placeholder="Escribe para buscar..." 
                           value="${this._busqueda}"
                           style="width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:8px;font-size:15px;font-family:var(--font);">
                </div>
                <div style="font-size:12px;color:var(--gray-light);margin-bottom:8px;">
                    💡 Busca por título, descripción o contenido de las secciones.
                </div>
                <div id="buscadorManualResultados" style="max-height:300px;overflow-y:auto;">
                    ${this._busqueda && this._busqueda.length >= 2 ? `
                        ${this._resultadosBusqueda.length > 0 ? `
                            <div style="display:flex;flex-direction:column;gap:6px;">
                                ${this._resultadosBusqueda.map(id => {
                                    const sec = this._SECCIONES[id];
                                    return `
                                        <div style="background:var(--bg);border-radius:8px;padding:10px 14px;cursor:pointer;border:1px solid var(--light);transition:all 0.2s;"
                                             onclick="window.UIManual._irASeccion('${id}');window.UIManual._cerrarBuscador()"
                                             onmouseover="this.style.borderColor='var(--primary)';this.style.background='var(--primary)04'"
                                             onmouseout="this.style.borderColor='var(--light)';this.style.background='var(--bg)'">
                                            <div style="font-weight:600;color:var(--dark);">${sec.icono} ${sec.titulo}</div>
                                            <div style="font-size:12px;color:var(--gray);">${sec.descripcion}</div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `
                            <div style="text-align:center;padding:20px;color:var(--gray-light);">
                                No se encontraron resultados para "<strong>${this._busqueda}</strong>"
                            </div>
                        `}
                    ` : `
                        <div style="text-align:center;padding:20px;color:var(--gray-light);">
                            Escribe al menos 2 caracteres para buscar
                        </div>
                    `}
                </div>
            </div>
        `;
        
        this._core?.abrirModal('🔍 Buscar en el Manual');
        const textarea = document.getElementById('jsonTextarea');
        if (textarea) {
            textarea.style.display = 'none';
            let container = document.getElementById('buscadorManualContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'buscadorManualContainer';
                container.style.cssText = 'padding:8px 4px;max-height:70vh;overflow-y:auto;';
                const modalBody = textarea.parentElement;
                modalBody.appendChild(container);
            }
            container.innerHTML = html;
            container.style.display = 'block';
            
            const input = document.getElementById('buscadorManualInput');
            if (input) {
                input.focus();
                input.addEventListener('input', () => {
                    this._busqueda = input.value.trim();
                    const resultadosContainer = document.getElementById('buscadorManualResultados');
                    if (resultadosContainer) {
                        // Actualizar resultados dinámicamente
                        if (this._busqueda && this._busqueda.length >= 2) {
                            const terminoLower = this._busqueda.toLowerCase();
                            const secciones = Object.values(this._SECCIONES);
                            const resultados = secciones.filter(sec => {
                                const titulo = sec.titulo.toLowerCase();
                                const desc = (sec.descripcion || '').toLowerCase();
                                const contenido = sec.contenido.replace(/<[^>]*>/g, ' ').toLowerCase();
                                return titulo.includes(terminoLower) || desc.includes(terminoLower) || contenido.includes(terminoLower);
                            });
                            this._resultadosBusqueda = resultados.map(s => s.id);
                            
                            if (resultados.length > 0) {
                                resultadosContainer.innerHTML = `
                                    <div style="display:flex;flex-direction:column;gap:6px;">
                                        ${resultados.map(sec => `
                                            <div style="background:var(--bg);border-radius:8px;padding:10px 14px;cursor:pointer;border:1px solid var(--light);transition:all 0.2s;"
                                                 onclick="window.UIManual._irASeccion('${sec.id}');window.UIManual._cerrarBuscador()"
                                                 onmouseover="this.style.borderColor='var(--primary)';this.style.background='var(--primary)04'"
                                                 onmouseout="this.style.borderColor='var(--light)';this.style.background='var(--bg)'">
                                                <div style="font-weight:600;color:var(--dark);">${sec.icono} ${sec.titulo}</div>
                                                <div style="font-size:12px;color:var(--gray);">${sec.descripcion}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                `;
                            } else {
                                resultadosContainer.innerHTML = `
                                    <div style="text-align:center;padding:20px;color:var(--gray-light);">
                                        No se encontraron resultados para "<strong>${this._busqueda}</strong>"
                                    </div>
                                `;
                            }
                        } else {
                            resultadosContainer.innerHTML = `
                                <div style="text-align:center;padding:20px;color:var(--gray-light);">
                                    Escribe al menos 2 caracteres para buscar
                                </div>
                            `;
                        }
                    }
                });
                
                // Enter para ir al primer resultado
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && this._resultadosBusqueda.length > 0) {
                        this._irASeccion(this._resultadosBusqueda[0]);
                        this._cerrarBuscador();
                    }
                });
            }
        }
    }

    _cerrarBuscador() {
        if (this._core) {
            this._core.cerrarModal();
        }
    }

    _limpiarBusqueda() {
        this._busqueda = '';
        this._resultadosBusqueda = [];
        this._renderizarManual();
    }

    // ============================================================
    // COMPARTIR
    // ============================================================

    _compartirSeccion(id) {
        const sec = this._SECCIONES[id];
        if (!sec) return;
        
        const url = window.location.href;
        const titulo = `📖 Pipeline Neuro - ${sec.titulo}`;
        const texto = `${sec.titulo}\n\n${sec.descripcion}\n\n${url}`;
        
        if (navigator.share) {
            navigator.share({
                title: titulo,
                text: texto,
                url: url
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(texto)
                .then(() => this._core?.mostrarToast('📋 Enlace copiado al portapapeles', 'success'))
                .catch(() => this._core?.mostrarToast('❌ No se pudo copiar', 'error'));
        }
    }

    // ============================================================
    // HISTORIAL
    // ============================================================

    _mostrarHistorial() {
        if (this._historialNavegacion.length === 0) {
            this._core?.mostrarToast('📭 No hay historial de navegación', 'info');
            return;
        }
        
        let mensaje = '📜 HISTORIAL DE NAVEGACIÓN\n\n';
        const ultimos = this._historialNavegacion.slice(-10).reverse();
        for (const item of ultimos) {
            const sec = this._SECCIONES[item.seccion];
            const fecha = new Date(item.timestamp).toLocaleString();
            mensaje += `• ${sec ? sec.icono : '📄'} ${sec ? sec.titulo : item.seccion} - ${fecha}\n`;
        }
        
        mensaje += `\nTotal: ${this._historialNavegacion.length} visitas`;
        
        this._core?.alert(mensaje, '📜 Historial');
    }

    // ============================================================
    // EXPORTAR MANUAL (MARKDOWN MEJORADO)
    // ============================================================

    _exportarManual() {
        let contenido = '# 📖 Guía Suprema de Pipeline Neuro\n\n';
        contenido += `Versión 22.3 · ${new Date().toLocaleDateString()}\n\n`;
        contenido += '---\n\n';
        contenido += '## 📚 Tabla de Contenidos\n\n';
        
        const secciones = Object.values(this._SECCIONES);
        for (const sec of secciones) {
            contenido += `- [${sec.titulo}](#${sec.id})\n`;
        }
        contenido += '\n---\n\n';
        
        for (const sec of secciones) {
            contenido += `## ${sec.titulo}\n\n`;
            contenido += `*${sec.descripcion}*\n\n`;
            // Limpiar HTML del contenido
            let texto = sec.contenido.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            // Limpiar placeholders
            texto = texto.replace(/\[[^\]]*\]/g, '').trim();
            contenido += `${texto}\n\n`;
            if (sec.modulo) {
                contenido += `📌 **Módulo relacionado:** ${sec.modulo}\n\n`;
            }
            contenido += '---\n\n';
        }
        
        // Añadir estadísticas
        contenido += '## 📊 Estadísticas del Manual\n\n';
        contenido += `- Total de secciones: ${secciones.length}\n`;
        contenido += `- Favoritos: ${this._favoritosManual.size}\n`;
        contenido += `- Última actualización: ${new Date().toLocaleString()}\n`;
        contenido += `- Versión del manual: 3.0\n`;
        
        // Crear y descargar archivo
        const blob = new Blob([contenido], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `manual_pipeline_neuro_${new Date().toISOString().slice(0,10)}.md`;
        a.click();
        URL.revokeObjectURL(url);
        
        this._core?.mostrarToast('📄 Manual exportado como Markdown', 'success');
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UIManual = new UIManual();

console.log('✅ Manual Interactivo v3.0 - SUPER POTENTE');
console.log('  📖 Guía Definitiva de Pipeline Neuro');
console.log('  🔍 Búsqueda avanzada en tiempo real');
console.log('  ⭐ Sistema de favoritos mejorado');
console.log('  📄 Exportación a Markdown con TOC');
console.log('  📱 Vista de tarjetas interactivas');
console.log('  🎯 Links directos a módulos de la aplicación');
console.log('  📜 Historial de navegación');
console.log('  🔄 Navegación mejorada con botones');
console.log('  📊 Estadísticas en tiempo real');
console.log('  ✅ Todas las funcionalidades originales preservadas');