// ============================================================
// UI CARACTERES CORE v1.3 - CORREGIDO: RECARGA INMEDIATA
// ============================================================

class UICaracteresCore {
    constructor() {
        this._initDone = false;
        this._cargando = false;
        this._vistaActual = 'biblioteca';
        this._familiaSeleccionada = null;
        this._caracterSeleccionado = null;
        this._modoEstudio = 'flashcard';
        this._progresoCaracteres = null;
        this._core = null;
        this._container = null;
        this._estadisticas = null;
        this._ordenTrazosSeleccionado = [];
        this._generando = false;
        this._importando = false;
        this._modalGeneracionAbierto = false;
        this._modalImportacionMasivaAbierto = false;
        this._modalLogrosAbierto = false;
        this._generadorAbierto = false;
        this._escapeHandlerDerivadas = null;
        this._escapeHandlerMasivo = null;
        this._paginaActual = 1;
        this._paginaDerivadas = 1;
        this._itemsPorPagina = 9;

        this.IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        this.NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        this.NIVEL_ICONOS = { 'A1': '🌱', 'A2': '🌿', 'B1': '🌳', 'B2': '🌲', 'C1': '🏔️', 'C2': '🗻' };
        this.NIVEL_COLORES = { 'A1': '#6C5CE7', 'A2': '#0984E3', 'B1': '#00B894', 'B2': '#FDCB6E', 'C1': '#E17055', 'C2': '#FD79A8' };
        this.FAMILIAS_SEMANTICAS = [
            'Transporte', 'Comida y Bebida', 'Familia', 'Casa y Hogar',
            'Ropa', 'Animales', 'Naturaleza', 'Tiempo y Clima',
            'Salud', 'Trabajo', 'Educación', 'Deportes',
            'Arte', 'Música', 'Tecnología', 'Viajes',
            'Compras', 'Comunicación', 'Emociones', 'Rutina',
            'Ciudad', 'Cultura', 'Historia', 'Ciencia'
        ];
        this.MODOS_ESTUDIO = [
            { id: 'flashcard', icono: '🃏', nombre: 'Flashcard', desc: 'Memoriza caracteres' },
            { id: 'escritura', icono: '✍️', nombre: 'Escritura', desc: 'Practica la escritura' },
            { id: 'asociacion', icono: '🔗', nombre: 'Asociación', desc: 'Relaciona con palabras' },
            { id: 'trazos', icono: '🎨', nombre: 'Trazos', desc: 'Ordena los trazos' },
            { id: 'contexto', icono: '📖', nombre: 'Contexto', desc: 'Frases y cultura' },
            { id: 'comparativa', icono: '🔍', nombre: 'Comparativa', desc: 'Caracteres similares' }
        ];

        this._cachePalabrasDerivadas = {};
        this._cacheFrasesEjemplo = {};
        this._cacheEstudiosCompletos = {};
        this._cacheLogros = {};
        this._cacheEjercicios = {};
        this._cacheFamilias = {};
        this._ultimaActualizacion = 0;
        this._tiempoCache = 10000; // 10 segundos

        this.LOGROS_BASE = {
            'primer_estudio': { nombre: '🌟 Primer Estudio', desc: 'Estudia tu primer carácter', icono: '🌟' },
            '3_estudios': { nombre: '📚 3 Estudios', desc: 'Estudia 3 caracteres diferentes', icono: '📚' },
            '10_estudios': { nombre: '🎓 10 Estudios', desc: 'Estudia 10 caracteres diferentes', icono: '🎓' },
            '5_palabras': { nombre: '📝 5 Palabras', desc: 'Aprende 5 palabras derivadas', icono: '📝' },
            '20_palabras': { nombre: '📖 20 Palabras', desc: 'Aprende 20 palabras derivadas', icono: '📖' },
            '50_palabras': { nombre: '🏆 50 Palabras', desc: 'Aprende 50 palabras derivadas', icono: '🏆' },
            'maestro_radicales': { nombre: '🔍 Maestro de Radicales', desc: 'Aprende 5 radicales', icono: '🔍' },
            'explorador_cultural': { nombre: '🌏 Explorador Cultural', desc: 'Estudia 3 conexiones culturales', icono: '🌏' },
            'racha_3': { nombre: '🔥 Racha de 3', desc: 'Estudia 3 días seguidos', icono: '🔥' },
            'racha_7': { nombre: '⚡ Racha de 7', desc: 'Estudia 7 días seguidos', icono: '⚡' },
            'racha_30': { nombre: '👑 Racha de 30', desc: 'Estudia 30 días seguidos', icono: '👑' }
        };
        this._logrosDesbloqueados = new Set();
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init(core) {
        if (this._initDone) return this;
        this._core = core || window.uiCore;

        window.addEventListener('idiomaCambiado', (e) => {
            if (this._esJeroglifico(e.detail?.idioma)) {
                this._limpiarCache();
                setTimeout(() => this.cargar(this._core), 300);
            }
        });

        window.addEventListener('familiaCaracteresGuardada', (e) => {
            this._limpiarCache();
            if (this._vistaActual === 'biblioteca') {
                this.cargar(this._core);
            }
        });

        window.addEventListener('familiaCaracteresGenerada', (e) => {
            if (this._core) {
                this._core.mostrarToast(`✅ Familia "${e.detail.caracter}" generada correctamente`, 'success');
            }
        });

        window.addEventListener('historiasImportadas', () => {
            this._limpiarCache();
            if (this._vistaActual === 'biblioteca' || this._vistaActual === 'estudio') {
                setTimeout(() => this.cargar(this._core), 500);
            }
        });

        // 🔥 NUEVO: Evento para recargar después de importar derivadas
        window.addEventListener('derivadasImportadas', () => {
            this._limpiarCache();
            this._recargarCompleto();
        });

        await this._cargarLogros();

        this._initDone = true;
        console.log('✅ Sistema de Caracteres v2.10 inicializado');
        return this;
    }

    cargar(core) {
        this._core = core || this._core;
        this._container = document.getElementById('caracteresContent');

        if (!this._container) {
            const moduleDiv = document.getElementById('caracteresModule');
            if (moduleDiv) {
                this._container = document.createElement('div');
                this._container.id = 'caracteresContent';
                moduleDiv.appendChild(this._container);
            }
        }

        if (this._container) {
            this._renderizarModulo();
        } else {
            console.error('❌ No se pudo encontrar el contenedor para el módulo de caracteres');
        }
    }

    // ============================================================
    // 🔥 RECARGAR VISTA ACTUAL - FORZANDO RECARGA COMPLETA
    // ============================================================

    async recargarVistaActual() {
        console.log('🔄 Recargando vista actual de caracteres:', this._vistaActual);
        
        // 🔥 Limpiar caché completamente antes de recargar
        this._limpiarCache();
        
        // 🔥 Forzar recarga desde la base de datos
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        
        // Si estamos en estudio, recargar la familia seleccionada desde DB
        if (this._vistaActual === 'estudio' && this._familiaSeleccionada) {
            const familias = await db.obtenerFamiliasCaracteres(idioma);
            const familiaActualizada = familias.find(f => 
                f.caracterRaiz.id === this._familiaSeleccionada.caracterRaiz.id
            );
            if (familiaActualizada) {
                this._familiaSeleccionada = familiaActualizada;
            }
        }
        
        // Si estamos en detalle, recargar el carácter seleccionado desde DB
        if (this._vistaActual === 'detalle' && this._caracterSeleccionado) {
            const caracterActualizado = await db.get('palabras', this._caracterSeleccionado.id);
            if (caracterActualizado) {
                this._caracterSeleccionado = caracterActualizado;
            }
        }
        
        // Si estamos en estudio_completo, recargar el carácter seleccionado desde DB
        if (this._vistaActual === 'estudio_completo' && this._caracterSeleccionado) {
            const caracterActualizado = await db.get('palabras', this._caracterSeleccionado.id);
            if (caracterActualizado) {
                this._caracterSeleccionado = caracterActualizado;
            }
        }
        
        // 🔥 Renderizar con datos frescos
        await this._renderizarModulo();
        console.log('✅ Vista de caracteres recargada con datos frescos');
    }

    // ============================================================
    // 🔥 RECARGAR COMPLETO - FORZAR DESDE CERO
    // ============================================================

    async _recargarCompleto() {
        console.log('🔄 Recarga completa forzada de caracteres');
        this._limpiarCache();
        this._paginaActual = 1;
        this._paginaDerivadas = 1;
        
        // Resetear selecciones si es necesario
        if (this._vistaActual === 'estudio' || this._vistaActual === 'detalle' || this._vistaActual === 'estudio_completo') {
            this._vistaActual = 'biblioteca';
            this._familiaSeleccionada = null;
            this._caracterSeleccionado = null;
        }
        
        await this._renderizarModulo();
        console.log('✅ Recarga completa finalizada');
    }

    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this.IDIOMAS_JEROGLIFICOS.some(item =>
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
    }

    estaDisponible() {
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        return this._esJeroglifico(idioma);
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
            'es': 'Español', 'en': 'Inglés', 'fr': 'Francés',
            'de': 'Alemán', 'it': 'Italiano', 'pt': 'Portugués',
            'zh': 'Chino', 'ja': 'Japonés', 'ko': 'Coreano',
            'ru': 'Ruso', 'ar': 'Árabe', 'hi': 'Hindi'
        };
        return nombres[idioma] || idioma;
    }

    _obtenerNivelRealUsuario() {
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

    _getCore() {
        if (this.core) return this.core;
        if (window.uiCore) return window.uiCore;
        return null;
    }

    _limpiarCache() {
        this._cachePalabrasDerivadas = {};
        this._cacheFrasesEjemplo = {};
        this._cacheEstudiosCompletos = {};
        this._cacheEjercicios = {};
        this._cacheFamilias = {};
        this._ultimaActualizacion = 0;
        this._estadisticas = null;
    }

    _getColorFamiliaSemantica(familia) {
        const colores = {
            'Transporte': '#0984E3', 'Comida y Bebida': '#E17055',
            'Familia': '#6C5CE7', 'Casa y Hogar': '#00CEC9',
            'Ropa': '#FD79A8', 'Animales': '#00B894',
            'Naturaleza': '#55EFC4', 'Tiempo y Clima': '#74B9FF',
            'Salud': '#FF7675', 'Trabajo': '#636E72',
            'Educación': '#A29BFE', 'Deportes': '#FDCB6E',
            'Arte': '#E17055', 'Música': '#FD79A8',
            'Tecnología': '#0984E3', 'Viajes': '#00CEC9',
            'Compras': '#FDCB6E', 'Comunicación': '#74B9FF',
            'Emociones': '#FF7675', 'Rutina': '#636E72',
            'Ciudad': '#00B894', 'Cultura': '#6C5CE7',
            'Historia': '#E17055', 'Ciencia': '#0984E3',
            'Sentimiento': '#FF7675', 'Parentesco': '#6C5CE7',
            'Cuerpo': '#FD79A8', 'Comida': '#E17055',
            'Bebida': '#00CEC9', 'Ropa': '#FD79A8',
            'Hogar': '#6C5CE7', 'Trabajo': '#636E72',
            'Caracteres Raíz': '#6C5CE7', 'General': '#636E72'
        };
        return colores[familia] || '#636E72';
    }

    // ============================================================
    // 🔥 MÉTODOS FALTANTES PARA RENDERIZADO
    // ============================================================

    _renderizarTarjetaFamilia(familia, idioma, nivelUsuario) {
        return window.UICaracteresRender.renderizarTarjetaFamilia(this, familia, idioma, nivelUsuario);
    }

    _renderizarPalabraDerivadaProfesional(palabra, idioma, nivelUsuario) {
        return window.UICaracteresRender.renderizarPalabraDerivadaProfesional(this, palabra, idioma, nivelUsuario);
    }

    _renderizarEjercicioProfesional(modo, raiz, derivadas, idioma, nivelUsuario) {
        return window.UICaracteresRender.renderizarEjercicioProfesional(this, modo, raiz, derivadas, idioma, nivelUsuario);
    }

    _generarMensajeVigia(raiz, derivadas, nivelUsuario) {
        return window.UICaracteresRender.generarMensajeVigia(this, raiz, derivadas, nivelUsuario);
    }

    _generarPlantillaEstudioCompleto(caracter, idioma, nivel, idiomaNativo, nombreIdioma) {
        return window.UICaracteresRender.generarPlantillaEstudioCompleto(this, caracter, idioma, nivel, idiomaNativo, nombreIdioma);
    }

    // ============================================================
    // NAVEGACIÓN
    // ============================================================

    _volverBiblioteca() {
        this._vistaActual = 'biblioteca';
        this._familiaSeleccionada = null;
        this._caracterSeleccionado = null;
        this._limpiarCache();
        this._renderizarModulo();
    }

    _volverEstudio() {
        this._vistaActual = 'estudio';
        this._caracterSeleccionado = null;
        this._limpiarCache();
        this._renderizarModulo();
    }

    _cambiarModoEstudio(modo) {
        if (this.MODOS_ESTUDIO.some(m => m.id === modo)) {
            this._modoEstudio = modo;
            if (this._vistaActual === 'estudio') {
                this._renderizarModulo();
            }
        }
    }

    async _verLogros() {
        this._vistaActual = 'logros';
        await this._renderizarModulo();
    }

    // ============================================================
    // VER ESTUDIO COMPLETO
    // ============================================================

    async _verEstudioCompleto(caracterId) {
        const caracter = await db.get('palabras', caracterId);
        if (!caracter) {
            this._core?.mostrarToast('❌ Carácter no encontrado', 'error');
            return;
        }
        this._caracterSeleccionado = caracter;
        this._vistaActual = 'estudio_completo';
        await this._renderizarModulo();
    }

    // ============================================================
    // RENDERIZADO (DELEGADO A UICaracteresRender)
    // ============================================================

    async _renderizarModulo() {
        return window.UICaracteresRender.renderizarModulo(this);
    }

    // ============================================================
    // ACCIONES (DELEGADO A UICaracteresActions)
    // ============================================================

    async _seleccionarFamilia(familiaId) {
        return window.UICaracteresActions.seleccionarFamilia(familiaId, this);
    }

    async _seleccionarPalabraDerivada(palabraId) {
        return window.UICaracteresActions.seleccionarPalabraDerivada(palabraId, this);
    }

    async _generarEstudioCompleto(caracterId) {
        return window.UICaracteresActions.generarEstudioCompleto(caracterId, this);
    }

    async _importarEstudioCompleto(caracterId, data) {
        return window.UICaracteresActions.importarEstudioCompleto(caracterId, data, this);
    }

    async _exportarEstudio(caracterId) {
        return window.UICaracteresActions.exportarEstudio(caracterId, this);
    }

    async _obtenerEstudioCompleto(caracterId, idioma) {
        return window.UICaracteresActions.obtenerEstudioCompleto(caracterId, idioma, this);
    }

    async _estudiarFamilia(caracterId) {
        return window.UICaracteresActions.estudiarFamilia(caracterId, this);
    }

    async _estudiarFamiliaCaracteres(caracterId) {
        return window.UICaracteresActions.estudiarFamiliaCaracteres(caracterId, this);
    }

    async _practicarPalabraDerivada(palabra, idioma) {
        return window.UICaracteresActions.practicarPalabraDerivada(palabra, idioma, this);
    }

    async _responderCaracter(tipo, palabraId) {
        return window.UICaracteresActions.responderCaracter(tipo, palabraId, this);
    }

    async _validarEscrituraCaracter(palabraId) {
        return window.UICaracteresActions.validarEscrituraCaracter(palabraId, this);
    }

    async _validarAsociacion(targetId, selectedId) {
        return window.UICaracteresActions.validarAsociacion(targetId, selectedId, this);
    }

    _seleccionarTrazo(element, orden) {
        window.UICaracteresActions.seleccionarTrazo(element, orden, this);
    }

    async _generarFamiliasDesdeHistorias() {
        return window.UICaracteresActions.generarFamiliasDesdeHistorias(this);
    }

    async _abrirModalGenerarDerivadas(caracterId, caracter, pinyin, significado) {
        return window.UICaracteresActions.abrirModalGenerarDerivadas(caracterId, caracter, pinyin, significado, this);
    }

    _cerrarModalGenerarDerivadas() {
        window.UICaracteresActions.cerrarModalGenerarDerivadas(this);
    }

    async _generarPlantillaDerivadas(caracterId, caracter, pinyin, significado, nivel, cantidad) {
        return window.UICaracteresActions.generarPlantillaDerivadas(caracterId, caracter, pinyin, significado, nivel, cantidad, this);
    }

    async _importarDerivadasGeneradas(caracterId, caracter) {
        return window.UICaracteresActions.importarDerivadasGeneradas(caracterId, caracter, this);
    }

    _copiarDerivadasJSON() {
        window.UICaracteresActions.copiarDerivadasJSON(this);
    }

    async _abrirModalImportacionMasiva() {
        return window.UICaracteresActions.abrirModalImportacionMasiva(this);
    }

    _cerrarModalImportacionMasiva() {
        window.UICaracteresActions.cerrarModalImportacionMasiva(this);
    }

    async _generarPlantillaMasiva() {
        return window.UICaracteresActions.generarPlantillaMasiva(this);
    }

    _copiarMasivoJSON() {
        window.UICaracteresActions.copiarMasivoJSON(this);
    }

    async _importarDerivadasMasivas() {
        return window.UICaracteresActions.importarDerivadasMasivas(this);
    }

    async _abrirModalExportarEstudios() {
        return window.UICaracteresActions.abrirModalExportarEstudios(this);
    }

    // ============================================================
    // SISTEMA DE LOGROS
    // ============================================================

    async _cargarLogros() {
        try {
            const saved = localStorage.getItem('pipeline_logros_caracteres');
            if (saved) {
                const data = JSON.parse(saved);
                this._logrosDesbloqueados = new Set(data.desbloqueados || []);
            }
        } catch (e) {
            console.warn('⚠️ Error cargando logros:', e);
        }
    }

    async _guardarLogros() {
        try {
            localStorage.setItem('pipeline_logros_caracteres', JSON.stringify({
                desbloqueados: Array.from(this._logrosDesbloqueados),
                fecha: new Date().toISOString()
            }));
        } catch (e) {
            console.warn('⚠️ Error guardando logros:', e);
        }
    }

    async _verificarLogros() {
        return window.UICaracteresActions.verificarLogros(this);
    }

    async _calcularRacha() {
        return window.UICaracteresActions.calcularRacha(this);
    }

    async _obtenerLogrosCaracter(caracterId) {
        return window.UICaracteresActions.obtenerLogrosCaracter(caracterId, this);
    }

    // ============================================================
    // 🔥 CARGAR FAMILIA SELECCIONADA (para uso desde acciones)
    // ============================================================

    async _cargarFamiliaSeleccionada(palabraId) {
        return window.UICaracteresActions.cargarFamiliaSeleccionada(palabraId, this);
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UICaracteres = new UICaracteresCore();
console.log('✅ UICaracteres Core v1.3 - CON RECARGA INMEDIATA FORZADA');
console.log('  🔥 recargarVistaActual() limpia caché y recarga desde DB');
console.log('  🔥 _recargarCompleto() fuerza recarga desde cero');
console.log('  🔥 Evento "derivadasImportadas" para actualización automática');
console.log('  🔄 Tiempo de caché reducido a 10 segundos');
console.log('  📚 Nueva propiedad _cacheFamilias para mejor gestión');