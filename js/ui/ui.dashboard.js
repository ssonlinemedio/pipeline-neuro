// ============================================================
// UI DASHBOARD v25.4 MODERN RESPONSIVE - CORREGIDO CON TUTOR NEURO V7.0
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
        this._bibliotecaAbierta = false;
        this._inicializado = false;
        
        // Caché de datos
        this._cache = {
            stats: null,
            usuario: null,
            temas: [],
            progreso: [],
            ultimaActualizacion: 0,
            TTL: 30000,
            idioma: null
        };
        
        this._cargaPromise = null;
        this._renderizadoBasico = false;
        this._badgesCache = null;
        
        this._IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        this._IDIOMAS_TONALES = ['zh', 'chino', 'chinese', 'mandarin', 'mandarín', 'th', 'tailandés', 'thai', 'vi', 'vietnamita', 'vietnamese'];
        
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
        
        this._TARJETAS_LITE = [
            { 
                id: 'biblioteca', 
                icono: '📚', 
                titulo: 'Biblioteca', 
                descripcion: 'Gestión completa de lecturas', 
                color: 'linear-gradient(135deg,#FDCB6E,#E17055)',
                categoria: 'lectura',
                accion: 'irABiblioteca'
            },
            { 
                id: 'elipse', 
                icono: '🌌', 
                titulo: 'Modo Elipse', 
                descripcion: 'Aprendizaje expansivo en ondas', 
                color: 'linear-gradient(135deg,#6C5CE7,#00CEC9)',
                categoria: 'aprendizaje',
                accion: 'irAElipse'
            },
            { 
                id: 'ondasCruzadas', 
                icono: '🌊', 
                titulo: 'Ondas Cruzadas', 
                descripcion: 'Interferencia de elipses', 
                color: 'linear-gradient(135deg,#6C5CE7,#A29BFE)',
                categoria: 'aprendizaje',
                accion: 'irAOndasCruzadas'
            },
            { 
                id: 'manual', 
                icono: '📖', 
                titulo: 'Manual Interactivo', 
                descripcion: 'Guía completa del sistema', 
                color: 'linear-gradient(135deg,#FDCB6E,#E17055)',
                categoria: 'sistema',
                accion: 'irAManual'
            },
            { 
                id: 'config', 
                icono: '⚙️', 
                titulo: 'Configuración', 
                descripcion: 'Ajusta tu perfil y preferencias', 
                color: 'linear-gradient(135deg,#FDCB6E,#F9CA24)',
                categoria: 'sistema',
                accion: 'irAConfig'
            },
            { 
                id: 'tools', 
                icono: '🛠️', 
                titulo: 'Herramientas', 
                descripcion: 'Backup y diagnóstico', 
                color: 'linear-gradient(135deg,#636E72,#2D3436)',
                categoria: 'sistema',
                accion: 'irATools'
            }
        ];
        
        this._TARJETAS_EXPANDIDAS = [
            { 
                id: 'biblioteca', 
                icono: '📚', 
                titulo: 'Biblioteca de Lectura', 
                descripcion: 'Todas tus historias y libros', 
                color: 'linear-gradient(135deg,#FDCB6E,#E17055)',
                categoria: 'lectura'
            },
            { 
                id: 'study', 
                icono: '📖', 
                titulo: 'Estudiar', 
                descripcion: 'Práctica con SRS', 
                color: 'linear-gradient(135deg,#6C5CE7,#A29BFE)',
                categoria: 'aprendizaje'
            },
            { 
                id: 'grammar', 
                icono: '📚', 
                titulo: 'Gramática', 
                descripcion: 'Reglas y estructuras', 
                color: 'linear-gradient(135deg,#00CEC9,#81ECEC)',
                categoria: 'lenguaje'
            },
            { 
                id: 'temas', 
                icono: '📂', 
                titulo: 'Temas', 
                descripcion: 'Organiza tu contenido', 
                color: 'linear-gradient(135deg,#FDCB6E,#F9CA24)',
                categoria: 'aprendizaje'
            },
            { 
                id: 'espacio', 
                icono: '⭐', 
                titulo: 'Mi Espacio', 
                descripcion: 'Tus favoritos', 
                color: 'linear-gradient(135deg,#A29BFE,#6C5CE7)',
                categoria: 'aprendizaje'
            },
            { 
                id: 'vigia', 
                icono: '👁️', 
                titulo: 'Vigía IA', 
                descripcion: 'Asistente inteligente', 
                color: 'linear-gradient(135deg,#74B9FF,#0984E3)',
                categoria: 'sistema'
            },
            { 
                id: 'competiciones', 
                icono: '🏆', 
                titulo: 'Ligas', 
                descripcion: 'Compite con IA', 
                color: 'linear-gradient(135deg,#FDCB6E,#E17055)',
                categoria: 'competiciones'
            },
            { 
                id: 'caracteres', 
                icono: '🀄', 
                titulo: 'Caracteres', 
                descripcion: 'Escritura jeroglífica', 
                color: 'linear-gradient(135deg,#6C5CE7,#00CEC9)',
                categoria: 'lenguaje'
            },
            { 
                id: 'tonos', 
                icono: '🎵', 
                titulo: 'Estudio de Tonos', 
                descripcion: 'Practica caracteres con diferentes tonos', 
                color: 'linear-gradient(135deg,#6C5CE7,#00CEC9)',
                categoria: 'lenguaje'
            },
            { 
                id: 'fonetica', 
                icono: '🎤', 
                titulo: 'Fonética', 
                descripcion: 'Pronunciación', 
                color: 'linear-gradient(135deg,#00B894,#55EFC4)',
                categoria: 'lenguaje'
            }
        ];
        
        this._CATEGORIAS = [
            {
                id: 'lectura',
                nombre: '📚 Lectura',
                descripcion: 'Gestiona tu biblioteca de lecturas',
                icono: '📚',
                color: 'linear-gradient(135deg, #FDCB6E, #E17055)',
                tarjetas: [
                    { id: 'biblioteca', nombre: 'Biblioteca de Lectura', icono: 'fa-book-open', desc: 'Todas tus historias y libros' }
                ]
            },
            {
                id: 'tutor',
                nombre: '🧠 Tutor Inteligente',
                descripcion: 'Tu asistente personal de aprendizaje',
                icono: '🧠',
                color: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
                tarjetas: [
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
                tarjetas: [
                    { id: 'study', nombre: 'Estudiar', icono: 'fa-graduation-cap', desc: 'Práctica con SRS' },
                    { id: 'temas', nombre: 'Temas', icono: 'fa-folder-open', desc: 'Organiza tu contenido' },
                    { id: 'espacio', nombre: 'Mi Espacio', icono: 'fa-star', desc: 'Tus favoritos' },
                    { id: 'elipse', nombre: '🌌 Modo Elipse', icono: 'fa-wave-square', desc: 'Aprendizaje expansivo' },
                    { id: 'ondasCruzadas', nombre: '🌊 Ondas Cruzadas', icono: 'fa-network-wired', desc: 'Interferencia de elipses' }
                ]
            },
            {
                id: 'lenguaje',
                nombre: '🌍 Lenguaje',
                descripcion: 'Herramientas lingüísticas avanzadas',
                icono: '🌍',
                color: 'linear-gradient(135deg, #00CEC9, #81ECEC)',
                tarjetas: [
                    { id: 'grammar', nombre: 'Gramática', icono: 'fa-sitemap', desc: 'Reglas y estructuras' },
                    { id: 'caracteres', nombre: 'Caracteres', icono: 'fa-font', desc: 'Escritura jeroglífica' },
                    { id: 'tonos', nombre: '🎵 Estudio de Tonos', icono: 'fa-music', desc: 'Práctica de tonos' },
                    { id: 'fonetica', nombre: 'Fonética', icono: 'fa-microphone-alt', desc: 'Pronunciación' }
                ]
            },
            {
                id: 'sistema',
                nombre: '⚙️ Sistema',
                descripcion: 'Control y configuración',
                icono: '⚙️',
                color: 'linear-gradient(135deg, #636E72, #2D3436)',
                tarjetas: [
                    { id: 'manual', nombre: 'Manual Interactivo', icono: 'fa-book', desc: 'Guía completa del sistema' },
                    { id: 'config', nombre: 'Configuración', icono: 'fa-sliders-h', desc: 'Ajusta tu perfil' },
                    { id: 'tools', nombre: 'Herramientas', icono: 'fa-tools', desc: 'Backup y diagnóstico' },
                    { id: 'vigia', nombre: 'Vigía IA', icono: 'fa-eye', desc: 'Asistente inteligente' }
                ]
            },
            {
                id: 'competiciones',
                nombre: '🏆 Competiciones',
                descripcion: 'Desafía a otros aprendices',
                icono: '🏆',
                color: 'linear-gradient(135deg, #FDCB6E, #E17055)',
                tarjetas: [
                    { id: 'competiciones', nombre: 'Liga Neuro', icono: 'fa-trophy', desc: 'Compite con IA' }
                ]
            }
        ];
    }

    _inyectarEstilosModernos() {
        try {
            if (document.getElementById('dashboardModernStyles')) return;
            const style = document.createElement('style');
            style.id = 'dashboardModernStyles';
            style.textContent = `
/* ============================================================
   PIPELINE NEURO - DASHBOARD MODERNO v1.1
   Responsive real: el dashboard ocupa TODO el ancho disponible.
   IMPORTANTE: #dashboardGrid ya es un grid del dashboard antiguo;
   el nuevo layout es un único contenedor interno y debe abarcar
   todas las columnas. No se modifica la estructura HTML global.
   ============================================================ */
#dashboardGrid{display:block!important;width:100%!important;max-width:none!important;min-width:0!important;box-sizing:border-box!important}
#dashboardView{width:100%;max-width:none;min-width:0;box-sizing:border-box}
#dashboardGrid .dm-dashboard{display:flex;flex-direction:column;gap:18px;padding-bottom:8px;width:100%;max-width:none;min-width:0;box-sizing:border-box}
#dashboardGrid .dm-hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#fff 0%,#f7f6ff 52%,#f1fbfb 100%);border:1px solid rgba(108,92,231,.14);border-radius:24px;padding:24px;box-shadow:0 10px 35px rgba(45,52,54,.07)}
#dashboardGrid .dm-hero:before{content:"";position:absolute;width:220px;height:220px;border-radius:50%;right:-90px;top:-120px;background:rgba(108,92,231,.08);pointer-events:none}
#dashboardGrid .dm-hero:after{content:"";position:absolute;width:160px;height:160px;border-radius:50%;right:90px;bottom:-125px;background:rgba(0,206,201,.06);pointer-events:none}
#dashboardGrid .dm-hero-main{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start;gap:18px}
#dashboardGrid .dm-kicker{display:inline-flex;align-items:center;gap:7px;padding:5px 10px;border-radius:999px;background:rgba(108,92,231,.08);color:var(--primary);font-size:11px;font-weight:700;letter-spacing:.35px;text-transform:uppercase}
#dashboardGrid .dm-title{font-size:clamp(25px,3vw,34px);line-height:1.08;font-weight:800;letter-spacing:-.7px;margin:10px 0 7px;color:var(--dark)}
#dashboardGrid .dm-subtitle{font-size:13px;line-height:1.55;color:var(--gray);margin:0;max-width:650px}
#dashboardGrid .dm-subtitle strong{color:var(--dark)}
#dashboardGrid .dm-hero-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;position:relative;z-index:2}
#dashboardGrid .dm-btn{border:1px solid var(--light);background:rgba(255,255,255,.9);color:var(--dark);border-radius:12px;padding:9px 13px;font:600 12px var(--font);cursor:pointer;transition:.22s ease;display:inline-flex;align-items:center;gap:7px;white-space:nowrap}
#dashboardGrid .dm-btn:hover{transform:translateY(-2px);border-color:rgba(108,92,231,.35);box-shadow:0 8px 20px rgba(45,52,54,.08)}
#dashboardGrid .dm-btn.primary{background:var(--primary);color:#fff;border-color:var(--primary);box-shadow:0 7px 18px rgba(108,92,231,.22)}
#dashboardGrid .dm-btn.primary:hover{background:var(--primary-dark);border-color:var(--primary-dark)}
#dashboardGrid .dm-btn.accent{background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;border:0}
#dashboardGrid .dm-mode{margin-top:18px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:16px;border-top:1px solid rgba(108,92,231,.1);position:relative;z-index:1}
#dashboardGrid .dm-mode-copy{font-size:11px;color:var(--gray)}
#dashboardGrid .dm-mode-copy strong{display:block;color:var(--dark);font-size:12px;margin-bottom:2px}
#dashboardGrid .dm-mode-toggle{display:inline-flex;gap:3px;background:rgba(45,52,54,.05);padding:3px;border-radius:10px}
#dashboardGrid .dm-mode-toggle button{border:0;background:transparent;color:var(--gray);border-radius:8px;padding:7px 11px;font:600 11px var(--font);cursor:pointer}
#dashboardGrid .dm-mode-toggle button.active{background:#fff;color:var(--primary);box-shadow:0 3px 10px rgba(45,52,54,.08)}
#dashboardGrid .dm-section-title{display:flex;align-items:end;justify-content:space-between;gap:10px;margin:3px 2px 9px}
#dashboardGrid .dm-section-title h3{font-size:15px;font-weight:800;color:var(--dark);margin:0}
#dashboardGrid .dm-section-title p{font-size:11px;color:var(--gray);margin:2px 0 0}
#dashboardGrid .dm-section-title .dm-count{font-size:10px;color:var(--gray);background:var(--bg);padding:5px 9px;border-radius:999px}
#dashboardGrid .dm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
#dashboardGrid .dm-stat{background:#fff;border:1px solid rgba(45,52,54,.07);border-radius:16px;padding:14px 15px;min-width:0;box-shadow:0 5px 20px rgba(45,52,54,.045)}
#dashboardGrid .dm-stat-top{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--gray);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.35px}
#dashboardGrid .dm-stat-icon{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:rgba(108,92,231,.09);color:var(--primary);font-size:14px}
#dashboardGrid .dm-stat-value{font-size:23px;font-weight:800;letter-spacing:-.4px;color:var(--dark);margin-top:9px}
#dashboardGrid .dm-stat-meta{font-size:10px;color:var(--gray);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#dashboardGrid .dm-progress{height:5px;background:var(--bg);border-radius:99px;overflow:hidden;margin-top:9px}
#dashboardGrid .dm-progress>span{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:99px;transition:width .6s ease}
#dashboardGrid .dm-modules{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:11px}
#dashboardGrid .dm-card{position:relative;min-width:0;display:flex;align-items:center;gap:12px;padding:14px;background:#fff;border:1px solid rgba(45,52,54,.075);border-radius:17px;cursor:pointer;box-shadow:0 5px 18px rgba(45,52,54,.045);transition:.24s cubic-bezier(.2,.8,.2,1);overflow:hidden}
#dashboardGrid .dm-card:hover{transform:translateY(-4px);border-color:rgba(108,92,231,.25);box-shadow:0 13px 30px rgba(45,52,54,.1)}
#dashboardGrid .dm-card.featured{background:linear-gradient(135deg,#fff,#faf9ff);border-color:rgba(108,92,231,.18)}
#dashboardGrid .dm-card:active{transform:scale(.985)}
#dashboardGrid .dm-card-icon{width:44px;height:44px;flex:0 0 44px;border-radius:13px;display:grid;place-items:center;color:#fff;font-size:19px;box-shadow:0 6px 14px rgba(45,52,54,.1)}
#dashboardGrid .dm-card-body{min-width:0;flex:1}
#dashboardGrid .dm-card-title-row{display:flex;align-items:center;gap:7px;min-width:0}
#dashboardGrid .dm-card-title{font-size:13px;font-weight:750;color:var(--dark);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#dashboardGrid .dm-card-desc{font-size:10.5px;line-height:1.35;color:var(--gray);margin:3px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#dashboardGrid .dm-badge{flex:0 0 auto;font-size:9px;font-weight:700;color:var(--primary);background:rgba(108,92,231,.08);padding:3px 7px;border-radius:999px}
#dashboardGrid .dm-arrow{color:var(--gray-light);font-size:11px;transition:.22s ease}
#dashboardGrid .dm-card:hover .dm-arrow{color:var(--primary);transform:translateX(3px)}
#dashboardGrid .dm-category{background:rgba(255,255,255,.58);border:1px solid rgba(45,52,54,.055);border-radius:20px;padding:15px}
#dashboardGrid .dm-category-head{display:flex;align-items:center;gap:10px;margin-bottom:11px}
#dashboardGrid .dm-category-icon{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;color:#fff;font-size:15px;flex:0 0 34px}
#dashboardGrid .dm-category-head h4{font-size:13px;font-weight:800;color:var(--dark);margin:0}
#dashboardGrid .dm-category-head p{font-size:10px;color:var(--gray);margin:2px 0 0}
#dashboardGrid .dm-category-count{margin-left:auto;font-size:9px;color:var(--gray);background:var(--bg);padding:4px 8px;border-radius:999px}
#dashboardGrid .dm-category .dm-modules{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
#dashboardGrid .dm-neuro{display:grid;grid-template-columns:1.15fr 1fr;gap:12px}
#dashboardGrid .dm-neuro-panel{background:#fff;border:1px solid rgba(45,52,54,.07);border-radius:18px;padding:15px;box-shadow:0 5px 18px rgba(45,52,54,.045)}
#dashboardGrid .dm-neuro-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
#dashboardGrid .dm-neuro-title{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:800;color:var(--dark)}
#dashboardGrid .dm-neuro-avatar{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff}
#dashboardGrid .dm-neuro-status{font-size:9px;font-weight:700;padding:4px 8px;border-radius:999px;background:rgba(0,184,148,.1);color:var(--success)}
#dashboardGrid .dm-neuro-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:13px}
#dashboardGrid .dm-neuro-metric{background:var(--bg);border-radius:10px;padding:9px 7px;text-align:center}
#dashboardGrid .dm-neuro-metric b{display:block;font-size:15px;color:var(--dark)}
#dashboardGrid .dm-neuro-metric span{display:block;font-size:8px;color:var(--gray);margin-top:2px;text-transform:uppercase;font-weight:700}
#dashboardGrid .dm-neuro-note{font-size:10px;line-height:1.45;color:var(--gray);margin:11px 0 0}
#dashboardGrid .dm-health{display:grid;grid-template-columns:1fr 1fr;gap:9px}
#dashboardGrid .dm-health-item{background:var(--bg);border-radius:12px;padding:10px}
#dashboardGrid .dm-health-row{display:flex;justify-content:space-between;align-items:center;font-size:9px;font-weight:700;color:var(--gray);margin-bottom:6px}
#dashboardGrid .dm-health-track{height:5px;background:rgba(0,0,0,.055);border-radius:99px;overflow:hidden}
#dashboardGrid .dm-health-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--primary),var(--secondary))}
#dashboardGrid .dm-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:11px 13px;background:var(--bg);border-radius:14px;color:var(--gray);font-size:10px}
#dashboardGrid .dm-footer span{display:inline-flex;align-items:center;gap:4px}
#dashboardGrid .dm-featured-label{position:absolute;top:8px;right:8px;font-size:8px;font-weight:800;color:#fff;background:linear-gradient(135deg,#FDCB6E,#E17055);padding:3px 7px;border-radius:999px}
#dashboardGrid .dm-quick{display:flex;flex-wrap:wrap;gap:7px}
#dashboardGrid .dm-quick .dm-btn{padding:8px 10px;font-size:10px}
@media(max-width:1100px){
  #dashboardGrid .dm-hero-main{flex-direction:column}
  #dashboardGrid .dm-hero-actions{justify-content:flex-start}
  #dashboardGrid .dm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  #dashboardGrid .dm-neuro{grid-template-columns:1fr}
}
@media(max-width:760px){
  #dashboardGrid .dm-hero{padding:20px}
  #dashboardGrid .dm-hero-actions{width:100%;justify-content:flex-start}
  #dashboardGrid .dm-btn{flex:1 1 auto}
  #dashboardGrid .dm-modules{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:480px){
  #dashboardGrid .dm-hero{padding:18px;border-radius:20px}
  #dashboardGrid .dm-title{font-size:25px}
  #dashboardGrid .dm-stats{gap:8px}
  #dashboardGrid .dm-stat{padding:12px}
  #dashboardGrid .dm-stat-value{font-size:20px}
  #dashboardGrid .dm-modules{grid-template-columns:1fr}
  #dashboardGrid .dm-category .dm-modules{grid-template-columns:1fr}
  #dashboardGrid .dm-neuro-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  #dashboardGrid .dm-mode{align-items:flex-start;flex-direction:column}
  #dashboardGrid .dm-hero-actions .dm-btn{width:100%;justify-content:center;flex:1 1 100%}
}
`;
            document.head.appendChild(style);
        } catch (e) {
            console.warn('⚠️ No se pudieron inyectar los estilos modernos del dashboard:', e);
        }
    }

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._IDIOMAS_JEROGLIFICOS.some(item =>
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
    }

    _esTonal(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._IDIOMAS_TONALES.some(item =>
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
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

    _getColorNivel(nivel) {
        const colores = {
            'A1': '#6C5CE7',
            'A2': '#0984E3',
            'B1': '#00B894',
            'B2': '#FDCB6E',
            'C1': '#E17055',
            'C2': '#FD79A8'
        };
        return colores[nivel] || '#6C5CE7';
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================
    
    async init(core) {
        if (this._inicializado) return this;
        this._inicializado = true;
        
        this.core = core || window.uiCore;
        this._inyectarEstilosModernos();
        
        const eventosRecarga = [
            'idiomaCambiado', 'favoritoActualizado', 'cambioNivel',
            'temaCompletado', 'tutorIntervencion', 'learningPathGenerado',
            'learningPathPasoCompletado', 'learningPathCompletado',
            'learningPathPasoCambiado', 'vigiaGramaticalActualizado',
            'actividadActualizada', 'learningPathProgresoActualizado',
            'elipseOndaGenerada', 'ondasCruzadasGenerada'
        ];
        
        for (const evento of eventosRecarga) {
            try {
                window.addEventListener(evento, () => {
                    this._programarRecarga();
                });
            } catch (e) {}
        }
        
        if (window.UIManual && typeof window.UIManual.init === 'function') {
            try {
                window.UIManual.init(this);
            } catch (e) {}
        }
        
        setInterval(() => {
            if (document.getElementById('dashboardView')?.classList.contains('active')) {
                this._actualizarSutil();
            }
        }, 5000);
        
        console.log('📊 UIDashboard v25.4 MODERN RESPONSIVE: Inicializado (CON TUTOR NEURO V7.0)');
        return this;
    }

    // ============================================================
    // RECARGA CON DEBOUNCE
    // ============================================================
    
    _programarRecarga() {
        if (this._recargaTimeout) {
            clearTimeout(this._recargaTimeout);
        }
        this._recargaTimeout = setTimeout(() => {
            this._cache.ultimaActualizacion = 0;
            this._cargarDashboardInicial();
            this._recargaTimeout = null;
        }, 150);
    }

    cargar(core) {
        this.core = core || this.core;
        this._cargarDashboardInicial();
    }

    // ============================================================
    // ACCIONES DE NAVEGACIÓN
    // ============================================================
    
    irABiblioteca() {
        console.log('📚 Abriendo Biblioteca...');
        if (this.core) {
            if (!document.getElementById('bibliotecaModule')) {
                const mainContent = document.getElementById('mainContent');
                if (mainContent) {
                    const moduleEl = document.createElement('div');
                    moduleEl.id = 'bibliotecaModule';
                    moduleEl.className = 'module-view';
                    moduleEl.innerHTML = `
                        <div class="module-header">
                            <button class="btn-back" onclick="window.uiCore.volverDashboard()">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                            <div class="module-title">
                                <h2>📚 Biblioteca de Lectura</h2>
                                <span class="module-breadcrumb">Dashboard / Biblioteca</span>
                            </div>
                        </div>
                        <div class="module-content" id="bibliotecaContent"></div>
                    `;
                    mainContent.appendChild(moduleEl);
                }
            }
            this.core.irAModulo('biblioteca');
            if (window.UIBiblioteca) {
                setTimeout(() => {
                    window.UIBiblioteca.cargar(this.core);
                }, 300);
            }
        }
    }

    irAElipse() {
        console.log('🌌 Abriendo Elipse...');
        if (this.core) {
            this.core.irAElipse();
        }
    }

    irAOndasCruzadas() {
        console.log('🌊 Abriendo Ondas Cruzadas...');
        if (this.core) {
            this.core.irAOndasCruzadas();
        }
    }

    irAManual() {
        console.log('📖 Abriendo Manual...');
        if (this.core) {
            this.core.irAModulo('manual');
        }
    }

    irAConfig() {
        console.log('⚙️ Abriendo Configuración...');
        if (this.core) {
            this.core.irAModulo('config');
        }
    }

    irATools() {
        console.log('🛠️ Abriendo Herramientas...');
        if (this.core) {
            this.core.irAModulo('tools');
        }
    }

    // ============================================================
    // irATutorPanel - AHORA USA tutorFullContainer
    // ============================================================
    
    irATutorPanel() {
        console.log('🧠 Abriendo panel del Tutor Neuro V7.0...');
        if (this.core) {
            this.core.irAModulo('tutor');
            // Forzar renderizado del Tutor Neuro V7.0 en tutorFullContainer
            setTimeout(() => {
                if (window.tutorNeuro && window.tutorNeuro._mostrarDashboardTutorCompleto) {
                    window.tutorNeuro._mostrarDashboardTutorCompleto();
                    console.log('✅ Tutor Neuro V7.0 renderizado en tutorFullContainer');
                } else {
                    console.warn('⚠️ Tutor Neuro V7.0 no disponible');
                }
            }, 300);
        }
    }

    irAGenerador() {
        console.log('🧠 Abriendo Generador NeuroAdaptativo...');
        if (this.core) {
            this.core.irAModulo('tutor_generador');
        }
    }

    irATonos() {
        console.log('🎵 Abriendo Estudio de Tonos...');
        if (this.core) {
            this.core.irAModulo('tonos');
            if (window.UITonos) {
                setTimeout(() => {
                    window.UITonos.cargar(this.core);
                }, 300);
            }
        }
    }

    // ============================================================
    // RECONEXIÓN AUTOMÁTICA DE VIGIA DESDE DASHBOARD
    // ============================================================
    
    _verificarYReconectarVigia() {
        try {
            if (typeof window.vigia === 'undefined' || !window.vigia) {
                return;
            }
            
            if (window.vigia.enLinea === true) {
                console.log('✅ Vigia ya está conectado');
                return;
            }
            
            console.log('🔄 Dashboard: Vigia desconectado, reconectando automáticamente...');
            
            if (typeof window.vigia.iniciar === 'function') {
                window.vigia.iniciar().then(() => {
                    console.log('✅ Vigia reconectado desde dashboard');
                    this._actualizarIndicadorVigia();
                }).catch(e => {
                    console.warn('⚠️ Error reconectando Vigia desde dashboard:', e.message);
                    setTimeout(() => this._verificarYReconectarVigia(), 5000);
                });
            } else if (typeof window.vigia.conectar === 'function') {
                window.vigia.conectar().then(() => {
                    console.log('✅ Vigia reconectado desde dashboard (conectar)');
                    this._actualizarIndicadorVigia();
                }).catch(e => {
                    console.warn('⚠️ Error reconectando Vigia desde dashboard:', e.message);
                    setTimeout(() => this._verificarYReconectarVigia(), 5000);
                });
            } else if (typeof window.vigia.init === 'function') {
                window.vigia.init().then(() => {
                    console.log('✅ Vigia reconectado desde dashboard (init)');
                    this._actualizarIndicadorVigia();
                }).catch(e => {
                    console.warn('⚠️ Error reconectando Vigia desde dashboard:', e.message);
                    setTimeout(() => this._verificarYReconectarVigia(), 5000);
                });
            } else {
                if (window.uiCore && typeof window.uiCore._handleReconectarVigia === 'function') {
                    window.uiCore._handleReconectarVigia().then(() => {
                        console.log('✅ Vigia reconectado via uiCore');
                        this._actualizarIndicadorVigia();
                    }).catch(() => {});
                }
            }
        } catch (e) {
            console.warn('⚠️ Error en verificación de Vigia:', e);
        }
    }

    _actualizarIndicadorVigia() {
        try {
            const dot = document.getElementById('vigiaActivityDot');
            const bar = document.getElementById('vigiaActivityBar');
            const tooltip = document.getElementById('vigiaTooltip');
            const value = document.getElementById('vigiaActivityValue');
            
            if (dot) {
                dot.className = 'activity-status-dot online';
            }
            
            if (bar) {
                bar.className = 'activity-bar-fill vigia online';
                bar.style.width = '85%';
            }
            
            if (tooltip) {
                tooltip.textContent = 'Vigía: 🟢 Conectado automáticamente';
            }
            
            if (value) {
                value.textContent = '85%';
            }
        } catch (e) {
            console.warn('⚠️ Error actualizando indicador de Vigia:', e);
        }
    }

    // ============================================================
    // CARGA PRINCIPAL DEL DASHBOARD
    // ============================================================
    
    async _cargarDashboardInicial() {
        if (this._cargando) {
            console.log('⏳ Dashboard ya cargando, esperando...');
            if (this._cargaPromise) {
                await this._cargaPromise;
            }
            return;
        }
        
        if (Date.now() - this._ultimaActualizacion < this._tiempoMinimoActualizacion) {
            console.log('⏳ Actualización muy reciente (throttle), saltando...');
            return;
        }
        
        this._cargando = true;
        this._ultimaActualizacion = Date.now();
        
        this._cargaPromise = this._ejecutarCargaDashboard();
        
        try {
            await this._cargaPromise;
        } catch (error) {
            console.error('❌ Error en carga de dashboard:', error);
        } finally {
            this._cargando = false;
            this._cargaPromise = null;
        }
    }

    async _ejecutarCargaDashboard() {
        try {
            console.log('📊 Cargando Dashboard v25.4 MODERN RESPONSIVE...');
            
            const dashboardGrid = document.getElementById('dashboardGrid');
            if (!dashboardGrid) {
                console.error('❌ dashboardGrid no encontrado');
                return;
            }
            
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo?.() || 'es';
            this._idiomaActual = idiomaActivo;
            const esJeroglifico = this._esJeroglifico(idiomaActivo);
            const esTonal = this._esTonal(idiomaActivo);
            
            const cacheValido = this._cache.idioma === idiomaActivo && 
                               this._cache.ultimaActualizacion > 0 &&
                               (Date.now() - this._cache.ultimaActualizacion) < this._cache.TTL;
            
            let stats, usuario, temas, progreso, racha, neuroEstado;
            
            if (cacheValido) {
                console.log('📦 Usando caché para dashboard');
                stats = this._cache.stats;
                usuario = this._cache.usuario;
                temas = this._cache.temas;
                progreso = this._cache.progreso;
            } else {
                console.log('🔄 Cargando datos frescos para dashboard...');
                
                const promises = [];
                const statsPromise = db?.obtenerEstadisticasNeuro?.(idiomaActivo) || Promise.resolve({ totalFrases: 0, totalPalabras: 0, progreso: 0, neuroScore: 0 });
                const usuarioPromise = db?.getUsuario?.() || Promise.resolve(this._getUsuarioLocal() || { nombre: 'Usuario' });
                const temasPromise = db?.obtenerTemasPorIdioma?.(idiomaActivo) || Promise.resolve([]);
                const progresoPromise = db?.obtenerTodoProgreso?.() || Promise.resolve([]);
                
                const [statsResult, usuarioResult, temasResult, progresoResult] = await Promise.all([
                    statsPromise.catch(() => ({ totalFrases: 0, totalPalabras: 0, progreso: 0, neuroScore: 0 })),
                    usuarioPromise.catch(() => this._getUsuarioLocal() || { nombre: 'Usuario' }),
                    temasPromise.catch(() => []),
                    progresoPromise.catch(() => [])
                ]);
                
                stats = statsResult;
                usuario = usuarioResult;
                temas = temasResult;
                progreso = progresoResult;
                
                this._cache.stats = stats;
                this._cache.usuario = usuario;
                this._cache.temas = temas;
                this._cache.progreso = progreso;
                this._cache.idioma = idiomaActivo;
                this._cache.ultimaActualizacion = Date.now();
            }
            
            racha = await this._calcularRacha(progreso);
            neuroEstado = await this._calcularEstadoNeuro();
            
            // Obtener estadísticas de tonos si es tonal
            let tonosStats = null;
            if (esTonal) {
                try {
                    const frases = await db?.obtenerFrasesPorIdioma?.(idiomaActivo) || [];
                    const frasesConTono = frases.filter(f => f._esTono === true || f._tono);
                    tonosStats = {
                        totalFrasesConTono: frasesConTono.length,
                        totalFrases: frases.length
                    };
                } catch (e) {
                    tonosStats = null;
                }
            }
            
            await this._renderizarDashboardHTML(dashboardGrid, {
                stats,
                usuario,
                temas,
                progreso,
                racha,
                neuroEstado,
                idiomaActivo,
                esJeroglifico,
                esTonal,
                tonosStats
            });
            
            setTimeout(() => {
                this._actualizarHeaderStats({ progreso: stats.progreso, rcn: stats.neuroScore || 0, faseActual: 1 });
                this._actualizarActividad(this.core);
                this._actualizarBadgeTutor();
                this._renderizadoNeuro = true;
            }, 50);
            
            // === RECONEXIÓN AUTOMÁTICA DE VIGIA ===
            this._verificarYReconectarVigia();
            
            console.log(`✅ Dashboard v25.4 MODERN RESPONSIVE cargado en ${Date.now() - this._ultimaActualizacion}ms para: ${idiomaActivo}`);
            
        } catch (error) {
            console.error('❌ Error cargando dashboard:', error);
            this._renderizarDashboardFallback();
        }
    }

    // ============================================================
    // RENDERIZADO DEL HTML DEL DASHBOARD
    // ============================================================
    
    async _renderizarDashboardHTML(container, data) {
        const {
            stats, usuario, temas, progreso, racha, neuroEstado,
            idiomaActivo, esJeroglifico, esTonal, tonosStats
        } = data;

        const modoLite = this.core?.esModoLite?.() ?? true;
        const esExpandido = !modoLite;
        const badgesCache = await this._calcularBadges(idiomaActivo);

        const escapeHtml = (value) => String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        const nivel = this._obtenerNivelUsuario();
        const nombreUsuario = escapeHtml(usuario?.nombre || 'Usuario');
        const idiomaNombre = escapeHtml(this._getNombreIdioma(idiomaActivo));

        const pctProgreso = Math.max(0, Math.min(100, Number(stats?.progreso || 0)));
        const totalFrases = Number(stats?.totalFrases || 0);
        const totalPalabras = Number(stats?.totalPalabras || 0);
        const rcn = Number(stats?.neuroScore || 0);
        const energia = Math.max(0, Math.min(100, Number(neuroEstado?.energia ?? 0)));
        const foco = Math.max(0, Math.min(100, Number(neuroEstado?.foco ?? 0)));
        const eficiencia = Math.max(0, Math.min(100, Number(neuroEstado?.eficiencia ?? 0)));
        const fatiga = Math.max(0, Math.min(100, Number(neuroEstado?.fatiga ?? 0)));

        const tarjetasLite = [...this._TARJETAS_LITE];
        if (esTonal && !tarjetasLite.some(t => t.id === 'tonos')) {
            tarjetasLite.push({
                id: 'tonos',
                icono: '🎵',
                titulo: 'Estudio de Tonos',
                descripcion: tonosStats && tonosStats.totalFrasesConTono > 0
                    ? `${tonosStats.totalFrasesConTono} frases con tonos · Practica pronunciación`
                    : 'Genera frases para practicar tonos',
                color: 'linear-gradient(135deg,#6C5CE7,#00CEC9)',
                categoria: 'lenguaje',
                accion: 'irATonos'
            });
        }

        const accionPara = (id) => {
            const acciones = {
                biblioteca: 'window.UIDashboard.irABiblioteca()',
                elipse: 'window.UIDashboard.irAElipse()',
                ondasCruzadas: 'window.UIDashboard.irAOndasCruzadas()',
                manual: 'window.UIDashboard.irAManual()',
                config: 'window.UIDashboard.irAConfig()',
                tools: 'window.UIDashboard.irATools()',
                tonos: 'window.UIDashboard.irATonos()',
                tutor_panel: 'window.UIDashboard.irATutorPanel()',
                tutor_generador: 'window.UIDashboard.irAGenerador()'
            };
            return acciones[id] || `window.uiCore?.irAModulo?.('${id}')`;
        };

        const destacados = new Set(['biblioteca', 'elipse', 'ondasCruzadas', 'manual', 'tonos']);

        const badgeTexto = (tarjeta) => {
            const badge = badgesCache[tarjeta.id];
            if (tarjeta.id === 'tonos' && tonosStats) return `🎵 ${tonosStats.totalFrasesConTono || 0}`;
            return badge?.texto || '';
        };

        const renderCard = (tarjeta, options = {}) => {
            const badge = badgeTexto(tarjeta);
            const featured = options.featured || destacados.has(tarjeta.id);
            const icon = tarjeta.icono?.startsWith('fa-')
                ? `<i class="fas ${tarjeta.icono}"></i>`
                : tarjeta.icono;

            return `
                <div class="dm-card ${featured ? 'featured' : ''}"
                     onclick="${accionPara(tarjeta.id)}"
                     role="button"
                     tabindex="0"
                     onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click()}">
                    ${featured ? '<span class="dm-featured-label">DESTACADO</span>' : ''}
                    <div class="dm-card-icon" style="background:${tarjeta.color || 'linear-gradient(135deg,var(--primary),var(--secondary))'}">${icon}</div>
                    <div class="dm-card-body">
                        <div class="dm-card-title-row">
                            <span class="dm-card-title">${escapeHtml(tarjeta.titulo || tarjeta.nombre)}</span>
                            ${badge ? `<span class="dm-badge">${badge}</span>` : ''}
                        </div>
                        <p class="dm-card-desc">${escapeHtml(tarjeta.descripcion || tarjeta.desc || '')}</p>
                    </div>
                    <div class="dm-arrow"><i class="fas fa-chevron-right"></i></div>
                </div>
            `;
        };

        let html = `
            <div class="dm-dashboard">
                <section class="dm-hero">
                    <div class="dm-hero-main">
                        <div>
                            <span class="dm-kicker"><i class="fas fa-sparkles"></i> Pipeline Neuro</span>
                            <h2 class="dm-title">Tu espacio de aprendizaje</h2>
                            <p class="dm-subtitle">
                                ${window.PipelineI18n ? window.PipelineI18n.t('Bienvenido,') : 'Bienvenido,'} <strong>${nombreUsuario}</strong>.
                                ${window.PipelineI18n ? window.PipelineI18n.t('Estás trabajando en') : 'Estás trabajando en'} <strong>${idiomaNombre}</strong> · ${window.PipelineI18n ? window.PipelineI18n.t('nivel') : 'nivel'} <strong>${escapeHtml(nivel)}</strong>.
                                ${esTonal ? ' ' + (window.PipelineI18n ? window.PipelineI18n.t('Este idioma incluye entrenamiento específico de tonos.') : 'Este idioma incluye entrenamiento específico de tonos.') : ''}
                                ${esJeroglifico ? ' ' + (window.PipelineI18n ? window.PipelineI18n.t('También tienes herramientas específicas para escritura jeroglífica.') : 'También tienes herramientas específicas para escritura jeroglífica.') : ''}
                            </p>
                        </div>
                        <div class="dm-hero-actions">
                            <button class="dm-btn primary" onclick="window.uiCore?.irAModulo?.('study')">
                                <i class="fas fa-graduation-cap"></i> Estudiar
                            </button>
                            <button class="dm-btn" onclick="window.UIDashboard.irABiblioteca()">
                                <i class="fas fa-book-open"></i> Biblioteca
                            </button>
                            <button class="dm-btn" onclick="window.UIDashboard.irATutorPanel()">
                                <i class="fas fa-brain"></i> Tutor
                            </button>
                        </div>
                    </div>

                    <div class="dm-mode">
                        <div class="dm-mode-copy">
                            <strong>${modoLite ? 'Vista esencial' : 'Vista completa'}</strong>
                            ${modoLite ? 'Solo lo más importante para entrar a estudiar rápido.' : 'Todos los módulos organizados por área.'}
                        </div>
                        <div class="dm-mode-toggle">
                            <button class="${modoLite ? 'active' : ''}" onclick="window.uiCore?.toggleModoDashboard?.()">Lite</button>
                            <button class="${!modoLite ? 'active' : ''}" onclick="window.uiCore?.toggleModoDashboard?.()">Experto</button>
                        </div>
                    </div>
                </section>

                <section>
                    <div class="dm-section-title">
                        <div>
                            <h3>Resumen</h3>
                            <p>Tu actividad actual, sin salir del panel.</p>
                        </div>
                    </div>
                    <div class="dm-stats">
                        <div class="dm-stat">
                            <div class="dm-stat-top"><span>Progreso</span><span class="dm-stat-icon"><i class="fas fa-chart-line"></i></span></div>
                            <div class="dm-stat-value">${pctProgreso}%</div>
                            <div class="dm-stat-meta">${totalFrases} frases registradas</div>
                            <div class="dm-progress"><span style="width:${pctProgreso}%"></span></div>
                        </div>
                        <div class="dm-stat">
                            <div class="dm-stat-top"><span>Palabras</span><span class="dm-stat-icon"><i class="fas fa-language"></i></span></div>
                            <div class="dm-stat-value">${totalPalabras}</div>
                            <div class="dm-stat-meta">contenido disponible</div>
                        </div>
                        <div class="dm-stat">
                            <div class="dm-stat-top"><span>Racha</span><span class="dm-stat-icon"><i class="fas fa-fire"></i></span></div>
                            <div class="dm-stat-value">${Number(racha || 0)}<small style="font-size:12px;color:var(--gray)"> d</small></div>
                            <div class="dm-stat-meta">días consecutivos</div>
                        </div>
                        <div class="dm-stat">
                            <div class="dm-stat-top"><span>RCN</span><span class="dm-stat-icon"><i class="fas fa-brain"></i></span></div>
                            <div class="dm-stat-value">${rcn.toFixed(1)}</div>
                            <div class="dm-stat-meta">señal neurocognitiva</div>
                        </div>
                    </div>
                </section>

                <section>
                    <div class="dm-section-title">
                        <div>
                            <h3>${modoLite ? 'Acceso rápido' : 'Módulos principales'}</h3>
                            <p>${modoLite ? 'Entra directamente en las funciones que más usas.' : 'Selecciona cualquier módulo para continuar.'}</p>
                        </div>
                        <span class="dm-count">${tarjetasLite.length} accesos</span>
                    </div>
                    <div class="dm-modules">
                        ${tarjetasLite.map(t => renderCard(t, {featured: destacados.has(t.id)})).join('')}
                    </div>
                </section>
        `;

        if (esExpandido) {
            const tarjetasLenguaje = [
                { id:'grammar', nombre:'Gramática', icono:'fa-sitemap', desc:'Reglas y estructuras' },
                ...(esJeroglifico ? [{ id:'caracteres', nombre:'Caracteres', icono:'fa-font', desc:'Escritura jeroglífica' }] : []),
                ...(esTonal ? [{ id:'tonos', nombre:'Estudio de Tonos', icono:'fa-music', desc:'Práctica de tonos' }] : []),
                { id:'fonetica', nombre:'Fonética', icono:'fa-microphone-alt', desc:'Pronunciación' }
            ];

            const categorias = [
                {
                    id:'lectura', nombre:'Lectura', icono:'fa-book-open',
                    descripcion:'Gestiona tu biblioteca de lecturas',
                    color:'linear-gradient(135deg,#FDCB6E,#E17055)',
                    tarjetas:[{id:'biblioteca',nombre:'Biblioteca de Lectura',icono:'fa-book-open',desc:'Todas tus historias y libros'}]
                },
                {
                    id:'tutor', nombre:'Tutor Inteligente', icono:'fa-brain',
                    descripcion:'Tu asistente personal de aprendizaje',
                    color:'linear-gradient(135deg,#6C5CE7,#A29BFE)',
                    tarjetas:[
                        {id:'tutor_panel',nombre:'Tutor NeuroAdaptativo',icono:'fa-brain',desc:'Aprendizaje personalizado con IA'},
                        {id:'tutor_generador',nombre:'Generador NeuroAdaptativo',icono:'fa-magic',desc:'Genera contenido personalizado'}
                    ]
                },
                {
                    id:'aprendizaje', nombre:'Aprendizaje', icono:'fa-graduation-cap',
                    descripcion:'Contenido, progreso y métodos de estudio',
                    color:'linear-gradient(135deg,#00B894,#55EFC4)',
                    tarjetas:[
                        {id:'study',nombre:'Estudiar',icono:'fa-graduation-cap',desc:'Práctica con SRS'},
                        {id:'temas',nombre:'Temas',icono:'fa-folder-open',desc:'Organiza tu contenido'},
                        {id:'espacio',nombre:'Mi Espacio',icono:'fa-star',desc:'Tus favoritos'},
                        {id:'elipse',nombre:'Modo Elipse',icono:'fa-wave-square',desc:'Aprendizaje expansivo'},
                        {id:'ondasCruzadas',nombre:'Ondas Cruzadas',icono:'fa-network-wired',desc:'Interferencia de elipses'}
                    ]
                },
                {
                    id:'lenguaje', nombre:'Lenguaje', icono:'fa-language',
                    descripcion:'Herramientas lingüísticas avanzadas',
                    color:'linear-gradient(135deg,#00CEC9,#81ECEC)',
                    tarjetas:tarjetasLenguaje
                },
                {
                    id:'sistema', nombre:'Sistema', icono:'fa-sliders-h',
                    descripcion:'Control, ayuda y diagnóstico',
                    color:'linear-gradient(135deg,#636E72,#2D3436)',
                    tarjetas:[
                        {id:'manual',nombre:'Manual Interactivo',icono:'fa-book',desc:'Guía completa del sistema'},
                        {id:'config',nombre:'Configuración',icono:'fa-sliders-h',desc:'Ajusta tu perfil'},
                        {id:'tools',nombre:'Herramientas',icono:'fa-tools',desc:'Backup y diagnóstico'},
                        {id:'vigia',nombre:'Vigía IA',icono:'fa-eye',desc:'Asistente inteligente'}
                    ]
                },
                {
                    id:'competiciones', nombre:'Competiciones', icono:'fa-trophy',
                    descripcion:'Desafía a otros aprendices',
                    color:'linear-gradient(135deg,#FDCB6E,#E17055)',
                    tarjetas:[{id:'competiciones',nombre:'Liga Neuro',icono:'fa-trophy',desc:'Compite con IA'}]
                }
            ];

            const idsLite = new Set(tarjetasLite.map(t => t.id));

            for (const categoria of categorias) {
                let tarjetas = categoria.tarjetas.filter(t => !idsLite.has(t.id));
                if (!tarjetas.length) continue;

                html += `
                    <section class="dm-category">
                        <div class="dm-category-head">
                            <div class="dm-category-icon" style="background:${categoria.color}">
                                <i class="fas ${categoria.icono}"></i>
                            </div>
                            <div>
                                <h4>${escapeHtml(categoria.nombre)}</h4>
                                <p>${escapeHtml(categoria.descripcion)}</p>
                            </div>
                            <span class="dm-category-count">${tarjetas.length} módulos</span>
                        </div>
                        <div class="dm-modules">
                            ${tarjetas.map(t => renderCard(t)).join('')}
                        </div>
                    </section>
                `;
            }
        }

        html += `
                <section class="dm-neuro">
                    <div class="dm-neuro-panel">
                        <div class="dm-neuro-head">
                            <div class="dm-neuro-title">
                                <span class="dm-neuro-avatar">🧠</span>
                                Estado neuroadaptativo
                            </div>
                            <span class="dm-neuro-status">${energia >= 70 ? '● Estable' : energia >= 40 ? '● Moderado' : '● Descanso recomendado'}</span>
                        </div>
                        <div class="dm-neuro-grid">
                            <div class="dm-neuro-metric"><b>${energia}%</b><span>Energía</span></div>
                            <div class="dm-neuro-metric"><b>${foco}%</b><span>Foco</span></div>
                            <div class="dm-neuro-metric"><b>${eficiencia}%</b><span>Eficiencia</span></div>
                            <div class="dm-neuro-metric"><b>${fatiga}%</b><span>Fatiga</span></div>
                        </div>
                        <p class="dm-neuro-note">
                            ${energia >= 70
                                ? 'Tu panel muestra una situación favorable para continuar con una sesión de estudio.'
                                : energia >= 40
                                    ? 'Mantén sesiones cortas y revisa el progreso antes de aumentar la carga.'
                                    : 'La señal actual sugiere priorizar una sesión ligera o una pausa.'}
                        </p>
                    </div>
                    <div class="dm-neuro-panel">
                        <div class="dm-neuro-title"><span class="dm-neuro-avatar" style="background:linear-gradient(135deg,var(--secondary),#0984E3)">◉</span> Señales del sistema</div>
                        <div class="dm-health" style="margin-top:13px">
                            <div class="dm-health-item">
                                <div class="dm-health-row"><span>Foco</span><strong>${foco}%</strong></div>
                                <div class="dm-health-track"><div class="dm-health-fill" style="width:${foco}%"></div></div>
                            </div>
                            <div class="dm-health-item">
                                <div class="dm-health-row"><span>Eficiencia</span><strong>${eficiencia}%</strong></div>
                                <div class="dm-health-track"><div class="dm-health-fill" style="width:${eficiencia}%"></div></div>
                            </div>
                            <div class="dm-health-item">
                                <div class="dm-health-row"><span>Energía</span><strong>${energia}%</strong></div>
                                <div class="dm-health-track"><div class="dm-health-fill" style="width:${energia}%"></div></div>
                            </div>
                            <div class="dm-health-item">
                                <div class="dm-health-row"><span>Fatiga</span><strong>${fatiga}%</strong></div>
                                <div class="dm-health-track"><div class="dm-health-fill" style="width:${fatiga}%"></div></div>
                            </div>
                        </div>
                    </div>
                </section>

                <div class="dm-footer">
                    <span><i class="fas fa-layer-group"></i> ${modoLite ? tarjetasLite.length : tarjetasLite.length + this._TARJETAS_EXPANDIDAS.length} módulos accesibles</span>
                    <span><i class="fas fa-graduation-cap"></i> Nivel ${escapeHtml(nivel)}</span>
                    <span><i class="fas fa-chart-pie"></i> ${pctProgreso}% progreso</span>
                    <span><i class="fas fa-fire"></i> ${Number(racha || 0)}d de racha</span>
                    ${esTonal ? '<span><i class="fas fa-music"></i> Tonos disponibles</span>' : ''}
                    ${esJeroglifico ? '<span><i class="fas fa-font"></i> Caracteres disponibles</span>' : ''}
                </div>
            </div>
        `;

        container.innerHTML = window.PipelineI18n?.html ? window.PipelineI18n.html(html) : html;
    }

    // ============================================================
    // CÁLCULO DE BADGES
    // ============================================================
    
    async _calcularBadges(idiomaActivo) {
        const cacheKey = 'badges_' + idiomaActivo;
        if (this._badgesCache && this._badgesCache.key === cacheKey && Date.now() - this._badgesCache.timestamp < 10000) {
            return this._badgesCache.data;
        }
        
        const badges = {};
        
        try {
            const historias = await db?.obtenerHistorias?.() || [];
            const leidas = localStorage.getItem('pipeline_historias_leidas');
            const leidasSet = leidas ? new Set(JSON.parse(leidas)) : new Set();
            const total = historias.length;
            const leidasCount = leidasSet.size;
            if (total > 0) {
                badges.biblioteca = {
                    texto: `📚 ${leidasCount}/${total}`,
                    color: 'rgba(225,112,85,0.9)',
                    html: `<span style="font-size:9px;color:var(--gray-light);">📚 ${leidasCount}/${total}</span>`
                };
            }
            
            if (window.modoElipse) {
                try {
                    const estado = window.modoElipse.getEstadoElipse?.(idiomaActivo);
                    if (estado && estado.totalOndas > 0) {
                        badges.elipse = {
                            texto: `🌊 ${estado.totalOndas}`,
                            color: 'rgba(108,92,231,0.9)',
                            html: `<span style="font-size:9px;color:var(--gray-light);">🌊 ${estado.totalOndas}</span>`
                        };
                    }
                } catch (e) {}
            }
            
            try {
                const estado = window.modoOndasCruzadas?.getEstado?.() || {};
                if (estado.grafoSize > 0) {
                    badges.ondasCruzadas = {
                        texto: `🌊 ${estado.grafoSize}`,
                        color: 'rgba(108,92,231,0.9)',
                        html: `<span style="font-size:9px;color:var(--gray-light);">🌊 ${estado.grafoSize}</span>`
                    };
                }
            } catch (e) {}
            
            try {
                const favs = localStorage.getItem('pipeline_manual_favoritos');
                if (favs) {
                    const parsed = JSON.parse(favs);
                    if (parsed.length > 0) {
                        badges.manual = {
                            texto: `⭐ ${parsed.length}`,
                            color: 'rgba(225,112,85,0.9)',
                            html: `<span style="font-size:9px;color:var(--gray-light);">⭐ ${parsed.length}</span>`
                        };
                    }
                }
            } catch (e) {}
            
            try {
                const backups = JSON.parse(localStorage.getItem('pipeline_backups_locales') || '[]');
                if (backups.length > 0) {
                    badges.tools = {
                        texto: `💾 ${backups.length}`,
                        color: 'rgba(99,110,114,0.9)',
                        html: `<span style="font-size:9px;color:var(--gray-light);">💾 ${backups.length}</span>`
                    };
                }
            } catch (e) {}
            
            this._badgesCache = {
                key: cacheKey,
                data: badges,
                timestamp: Date.now()
            };
        } catch (e) {}
        
        return badges;
    }

    // ============================================================
    // FALLBACK PARA ERRORES
    // ============================================================
    
    _renderizarDashboardFallback() {
        const dashboardGrid = document.getElementById('dashboardGrid');
        if (!dashboardGrid) return;
        
        dashboardGrid.innerHTML = `
            <div style="grid-column:1/-1;padding:30px;text-align:center;background:var(--white);border-radius:16px;border:2px solid var(--danger);">
                <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
                <h3 style="font-size:18px;font-weight:700;color:var(--danger);">Error al cargar el dashboard</h3>
                <p style="font-size:14px;color:var(--gray);">Hubo un problema al cargar los datos. Por favor, recarga la página.</p>
                <button onclick="location.reload()" style="margin-top:12px;padding:10px 24px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }

    // ============================================================
    // MÉTODOS AUXILIARES
    // ============================================================
    
    _getUsuarioLocal() {
        try {
            const data = localStorage.getItem('pipeline_usuario');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed && parsed.nombre) return parsed;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    _obtenerNivelUsuario() {
        try {
            const infoActivo = window.gestorIdiomas?.getInfoActivo?.();
            if (infoActivo?.nivel) return infoActivo.nivel;
            const usuarioLocal = localStorage.getItem('pipeline_usuario');
            if (usuarioLocal) {
                const parsed = JSON.parse(usuarioLocal);
                const idiomaActivo = window.gestorIdiomas?.getIdiomaActivo?.() || 'es';
                const idiomaObj = parsed.idiomasObjetivo?.find(i => i.idioma === idiomaActivo);
                if (idiomaObj?.nivel) return idiomaObj.nivel;
                if (parsed.idiomasObjetivo?.length > 0) return parsed.idiomasObjetivo[0].nivel || 'B1';
            }
            return 'B1';
        } catch (e) {
            return 'B1';
        }
    }

    async _calcularRacha(progreso) {
        try {
            if (!progreso || progreso.length === 0) return 0;
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

    async _calcularEstadoNeuro() {
        try {
            const estadoCentinela = window.centinela?.getEstado?.() || {};
            const stats = await db?.obtenerEstadisticasNeuro?.() || {};
            const progreso = await db?.obtenerTodoProgreso?.() || [];
            
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
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo?.() || 'es';
            db?.obtenerEstadisticasNeuro?.(idiomaActivo)
                .then(stats => { if (eficienciaEl) eficienciaEl.textContent = (stats.eficiencia || 0) + '%'; })
                .catch(() => { if (eficienciaEl) eficienciaEl.textContent = '0%'; });
        }
        if (faseEl) faseEl.textContent = estado ? estado.faseActual : 1;
        if (nivelEl) {
            try {
                const infoActivo = window.gestorIdiomas ? window.gestorIdiomas.getInfoActivo?.() : null;
                nivelEl.textContent = infoActivo?.nivel || 'A1';
            } catch (e) {
                nivelEl.textContent = 'A1';
            }
        }
    }

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
                this.irATutorPanel();
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

    togglePanelNeuro() {
        this._panelExpandido = !this._panelExpandido;
        this._cargarDashboardInicial();
    }

    _getCore() {
        return this.core || window.uiCore;
    }

    _abrirManual() {
        if (window.uiCore) {
            window.uiCore.irAModulo('manual');
        } else {
            console.warn('⚠️ uiCore no disponible para abrir manual');
        }
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UIDashboard = new UIDashboard();

console.log('✅ UIDashboard v25.4 MODERN RESPONSIVE - CORREGIDO CON TUTOR NEURO V7.0');
console.log('  🚀 Carga en ~200ms con caché');
console.log('  📦 Datos cacheados por 30 segundos');
console.log('  ⚡ Renderizado instantáneo desde el registro');
console.log('  🔄 Throttle para evitar recargas excesivas');
console.log('  🔌 Reconexión automática de Vigia al cargar el dashboard');
console.log('  🎵 Tarjeta "Estudio de Tonos" solo visible para idiomas tonales');
console.log('  🀄 Tarjeta "Caracteres" solo visible para idiomas jeroglíficos');
console.log('  🧠 Tutor Neuro V7.0 renderizado en tutorFullContainer');
console.log('  🔥 Interfaz de élite del Tutor Neuro completamente funcional');