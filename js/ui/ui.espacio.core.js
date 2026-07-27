// ============================================================
// UI ESPACIO CORE v1.3 - EXPONE ESTUDIAR FRASES DESDE DETALLE
// ============================================================

class UIEspacioCore {
    constructor() {
        this.vistaActual = 'principal';
        this.grupoSeleccionado = null;
        this.tipoSeleccionado = 'frases';
        this._itemsPorPagina = 50;
        this._paginaFrases = 1;
        this._paginaPalabras = 1;
        this._paginaGrupos = 1;
        this._paginaNivel = 1;
        this._nivelesPorPagina = 3;
        this._paginaFamilias = {};
        this._familiasPorPagina = 5;
        this._paginaFamiliasCaracteres = 1;
        this._familiasCaracteresPorPagina = 6;
        this._modalEspacioAbierto = false;
        this._modalGruposAbierto = false;
        this._generadorAbierto = false;
        this._modoGenerador = 'frases';
        this._contenidoGenerado = { frases: [], palabras: [] };
        this._clasificando = false;
        this._sugerenciasFamilias = [];
        this._procesandoLotes = false;
        this._colaPendiente = [];
        this._lotesProcesados = 0;
        this._totalLotes = 0;
        this._modoCompacto = window.innerWidth < 768;
        this._editandoElemento = null;
        this._jsonPendienteImportacion = null;
        this._familiasCaracteresCache = {};
        this._mostrandoFamilia = false;
        this._familiaSeleccionada = null;
        this._filtros = {
            busqueda: '',
            nivel: '',
            familia: '',
            tipo: 'todos'
        };
        this._cache = {
            palabras: null,
            frases: null,
            usuario: null,
            ultimaActualizacion: 0,
            usuarioValido: false
        };
        this._intentosUsuario = 0;
        this._maxIntentosUsuario = 10;
        this._esperandoUsuario = false;

        this.GRUPO_USUARIO = '📌 Seleccionadas por Usuario';
        this.GRUPO_SIN_CLASIFICAR = '📂 Sin Clasificar';
        this.IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean'];
        this.NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        this.EMOJIS_NIVEL = { 'A1': '🌱', 'A2': '🌿', 'B1': '🌳', 'B2': '🌲', 'C1': '🏔️', 'C2': '🗻' };
        this.COLORES_NIVEL = { 'A1': '#6C5CE7', 'A2': '#0984E3', 'B1': '#00B894', 'B2': '#FDCB6E', 'C1': '#E17055', 'C2': '#FD79A8' };
        this.FAMILIAS_SEMANTICAS = [
            'Transporte', 'Comida y Bebida', 'Familia', 'Casa y Hogar',
            'Ropa', 'Animales', 'Naturaleza', 'Tiempo y Clima',
            'Salud', 'Trabajo', 'Educación', 'Deportes',
            'Arte', 'Música', 'Tecnología', 'Viajes',
            'Compras', 'Comunicación', 'Emociones', 'Rutina',
            'Ciudad', 'Cultura', 'Historia', 'Ciencia'
        ];
        this.FAMILIAS_GRAMATICALES = [
            'sustantivo', 'verbo', 'adjetivo', 'adverbio',
            'preposición', 'conjunción', 'pronombre', 'determinante',
            'interjección', 'numeral', 'clasificador', 'partícula',
            'expresión', 'conector', 'verbo auxiliar', 'verbo modal',
            'nombre', 'adjetivo calificativo', 'adjetivo demostrativo',
            'pronombre personal', 'pronombre posesivo', 'artículo'
        ];

        this._initDone = false;
        this._cargando = false;
        this._ultimaCarga = 0;
        this._idiomaActual = null;
        this._core = null;
        this._container = null;
        this._ordenarEstado = null;
        this._escapeHandlerGenerador = null;
        this._generadorEscapeHandler = null;
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init(core) {
        if (this._initDone) return this;
        this.core = core;

        if (window.UIEspacio) {
            window.UIEspacio.core = this.core;
        }

        window.addEventListener('idiomaCambiado', (e) => {
            this._idiomaActual = e.detail?.idioma;
            this._cache.ultimaActualizacion = 0;
            setTimeout(() => {
                this._renderizarMiEspacio();
            }, 300);
        });

        window.addEventListener('resize', () => {
            const nuevoModo = window.innerWidth < 768;
            if (nuevoModo !== this._modoCompacto) {
                this._modoCompacto = nuevoModo;
                if (this.vistaActual === 'principal') {
                    this._renderizarMiEspacio();
                }
            }
        });

        if (!window.gestorFavoritos || !gestorFavoritos._initDone) {
            await gestorFavoritos.init();
        }

        await this._getUsuarioSeguro();

        this._initDone = true;
        console.log('✅ UIEspacio Core v1.3 inicializado');
        return this;
    }

    cargar(core) {
        this.core = core || this.core;

        if (window.UIEspacio) {
            window.UIEspacio.core = this.core;
        }

        if (!this.core && window.uiCore) {
            this.core = window.uiCore;
            window.UIEspacio.core = this.core;
        }

        setTimeout(() => {
            this._renderizarMiEspacio();
        }, 150);
    }

    // ============================================================
    // 🔥 RENDERIZAR MI ESPACIO (RECARGA FAVORITOS ANTES DE RENDERIZAR)
    // ============================================================

    async _renderizarMiEspacio() {
        // 🔥 RECARGAR FAVORITOS ANTES DE RENDERIZAR
        if (window.gestorFavoritos) {
            try {
                await window.gestorFavoritos.recargar();
                console.log('⭐ Favoritos recargados antes de renderizar Mi Espacio');
            } catch (e) {
                console.warn('⚠️ Error recargando favoritos:', e);
            }
        }
        
        return window.UIEspacioRender.renderizarMiEspacio(this);
    }

    // ============================================================
    // 🔥 MÉTODOS FALTANTES PARA TRANSCRIPCIÓN
    // ============================================================

    _getTranscripcion(elemento, idioma) {
        const esJeroglifico = this._esJeroglifico(idioma);
        if (esJeroglifico) {
            return elemento.pinyinCompleto || elemento.segmentacion?.pinyin || elemento.pinyin || '';
        } else {
            return elemento.fonetica || elemento.pronunciacion || elemento.transcripcion || '';
        }
    }

    _getTranscripcionLabel(idioma) {
        return this._esJeroglifico(idioma) ? 'pinyin' : 'fonética';
    }

    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================

    _getCore() {
        if (this.core) return this.core;
        if (window.uiCore) return window.uiCore;
        return null;
    }

    _mostrarToast(mensaje, tipo) {
        const core = this._getCore();
        if (core && core.mostrarToast) {
            core.mostrarToast(mensaje, tipo);
        } else {
            console.log(`📢 Toast [${tipo}]: ${mensaje}`);
        }
    }

    async _confirmar(mensaje, titulo) {
        const core = this._getCore();
        if (core && core.confirm) {
            return core.confirm(mensaje, titulo);
        }
        return confirm(mensaje);
    }

    async _alertar(mensaje, titulo) {
        const core = this._getCore();
        if (core && core.alert) {
            return core.alert(mensaje, titulo);
        }
        alert(mensaje);
        return true;
    }

    async _prompt(mensaje, defaultValue, placeholder, titulo) {
        const core = this._getCore();
        if (core && core.prompt) {
            return core.prompt(mensaje, defaultValue, placeholder, titulo);
        }
        return prompt(mensaje, defaultValue);
    }

    async _mostrarDialogPersonalizado(opciones) {
        const core = this._getCore();
        if (core && core._dialogs && core._dialogs._mostrarDialogPersonalizado) {
            return core._dialogs._mostrarDialogPersonalizado(opciones);
        }
        const mensaje = opciones.message || '¿Continuar?';
        const botones = opciones.buttons || [];
        if (botones.length === 1) {
            return confirm(mensaje) ? botones[0].value : null;
        }
        const opcionesTexto = botones.map((b, i) => `${i+1}. ${b.text}`).join('\n');
        const respuesta = prompt(`${mensaje}\n\n${opcionesTexto}\n\nEscribe el número de tu opción:`, '1');
        const idx = parseInt(respuesta) - 1;
        if (idx >= 0 && idx < botones.length) {
            return botones[idx].value;
        }
        return null;
    }

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this.IDIOMAS_JEROGLIFICOS.some(item =>
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

    _getColorFamiliaGramatical(familia) {
        const colores = {
            'sustantivo': '#6C5CE7',
            'verbo': '#00B894',
            'adjetivo': '#FDCB6E',
            'adverbio': '#74B9FF',
            'preposición': '#FF7675',
            'conjunción': '#A29BFE',
            'pronombre': '#55EFC4',
            'determinante': '#0984E3',
            'artículo': '#0984E3',
            'interjección': '#E17055',
            'numeral': '#00CEC9',
            'clasificador': '#636E72',
            'partícula': '#636E72',
            'expresión': '#FDCB6E',
            'conector': '#74B9FF'
        };
        return colores[familia] || '#6C5CE7';
    }

    _getColorFamiliaSemantica(familia) {
        const colores = {
            'Transporte': '#0984E3',
            'Comida y Bebida': '#E17055',
            'Familia': '#6C5CE7',
            'Casa y Hogar': '#00CEC9',
            'Ropa': '#FD79A8',
            'Animales': '#00B894',
            'Naturaleza': '#55EFC4',
            'Tiempo y Clima': '#74B9FF',
            'Salud': '#FF7675',
            'Trabajo': '#636E72',
            'Educación': '#A29BFE',
            'Deportes': '#FDCB6E',
            'Arte': '#E17055',
            'Música': '#FD79A8',
            'Tecnología': '#0984E3',
            'Viajes': '#00CEC9',
            'Compras': '#FDCB6E',
            'Comunicación': '#74B9FF',
            'Emociones': '#FF7675',
            'Rutina': '#636E72',
            'Ciudad': '#00B894',
            'Cultura': '#6C5CE7',
            'Historia': '#E17055',
            'Ciencia': '#0984E3'
        };
        return colores[familia] || '#6C5CE7';
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
            if (window.pipeline?.nivel) return window.pipeline.nivel;
            return 'B1';
        } catch (e) {
            return 'B1';
        }
    }

    _obtenerIdiomaNativo() {
        try {
            const usuario = localStorage.getItem('pipeline_usuario');
            if (usuario) {
                const parsed = JSON.parse(usuario);
                return parsed.idiomaNativo || 'español';
            }
            return 'español';
        } catch (e) {
            return 'español';
        }
    }

    _calcularSimilitudLevenshtein(a, b) {
        if (a.length === 0) return b.length === 0 ? 1 : 0;
        if (b.length === 0) return 0;
        const matrix = [];
        for (let i = 0; i <= a.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= b.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i-1] === b[j-1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i-1][j] + 1,
                    matrix[i][j-1] + 1,
                    matrix[i-1][j-1] + cost
                );
            }
        }
        const distancia = matrix[a.length][b.length];
        const maxLen = Math.max(a.length, b.length);
        return 1 - (distancia / maxLen);
    }

    // ============================================================
    // OBTENER USUARIO SEGURO
    // ============================================================

    async _getUsuarioSeguro() {
        if (this._cache.usuario && this._cache.usuarioValido) {
            return this._cache.usuario;
        }

        if (this._esperandoUsuario) {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!this._esperandoUsuario) {
                        clearInterval(checkInterval);
                        resolve(this._cache.usuario);
                    }
                }, 200);
            });
        }

        this._esperandoUsuario = true;
        this._intentosUsuario = 0;

        try {
            let usuario = null;
            try {
                usuario = await db.getUsuario();
                if (usuario && usuario.nombre) {
                    this._cache.usuario = usuario;
                    this._cache.usuarioValido = true;
                    this._esperandoUsuario = false;
                    return usuario;
                }
            } catch (e) {}

            try {
                const localData = localStorage.getItem('pipeline_usuario');
                if (localData) {
                    const parsed = JSON.parse(localData);
                    if (parsed && parsed.nombre) {
                        if (!parsed.idiomasObjetivo || parsed.idiomasObjetivo.length === 0) {
                            if (window.gestorIdiomas && window.gestorIdiomas.idiomas.length > 0) {
                                parsed.idiomasObjetivo = window.gestorIdiomas.idiomas.map(i => ({
                                    idioma: i.idioma,
                                    nivel: i.nivel || 'B1'
                                }));
                            }
                        }
                        try {
                            if (db && db.db) {
                                await db.guardarUsuario(parsed);
                            }
                        } catch (e) {}
                        usuario = parsed;
                        this._cache.usuario = usuario;
                        this._cache.usuarioValido = true;
                        this._esperandoUsuario = false;
                        return usuario;
                    }
                }
            } catch (e) {}

            if (window.gestorIdiomas && window.gestorIdiomas.idiomas.length > 0) {
                let nombre = 'Usuario';
                try {
                    const localData = localStorage.getItem('pipeline_usuario');
                    if (localData) {
                        const parsed = JSON.parse(localData);
                        if (parsed && parsed.nombre) nombre = parsed.nombre;
                    }
                } catch (e) {}

                const usuarioFallback = {
                    nombre: nombre,
                    idiomaNativo: 'es',
                    idiomasObjetivo: window.gestorIdiomas.idiomas.map(i => ({
                        idioma: i.idioma,
                        nivel: i.nivel || 'B1'
                    })),
                    nivel: window.gestorIdiomas.idiomas[0]?.nivel || 'B1'
                };

                try {
                    if (db && db.db) {
                        await db.guardarUsuario(usuarioFallback);
                    }
                } catch (e) {}

                try {
                    localStorage.setItem('pipeline_usuario', JSON.stringify(usuarioFallback));
                } catch (e) {}

                usuario = usuarioFallback;
                this._cache.usuario = usuario;
                this._cache.usuarioValido = true;
                this._esperandoUsuario = false;
                return usuario;
            }

            while (this._intentosUsuario < this._maxIntentosUsuario) {
                this._intentosUsuario++;
                const espera = Math.min(2000, 100 * Math.pow(1.5, this._intentosUsuario));
                await new Promise(r => setTimeout(r, espera));

                try {
                    usuario = await db.getUsuario();
                    if (usuario && usuario.nombre) {
                        this._cache.usuario = usuario;
                        this._cache.usuarioValido = true;
                        this._esperandoUsuario = false;
                        return usuario;
                    }
                } catch (e) {}
            }

            const usuarioTemporal = {
                nombre: 'Usuario Temporal',
                idiomaNativo: 'es',
                idiomasObjetivo: [{ idioma: 'es', nivel: 'B1' }],
                nivel: 'B1'
            };

            try {
                localStorage.setItem('pipeline_usuario', JSON.stringify(usuarioTemporal));
                if (db && db.db) {
                    await db.guardarUsuario(usuarioTemporal);
                }
            } catch (e) {}

            this._cache.usuario = usuarioTemporal;
            this._cache.usuarioValido = true;
            this._esperandoUsuario = false;
            return usuarioTemporal;

        } catch (error) {
            this._esperandoUsuario = false;
            const usuarioAnonimo = {
                nombre: 'Usuario',
                idiomaNativo: 'es',
                idiomasObjetivo: [{ idioma: 'es', nivel: 'B1' }],
                nivel: 'B1'
            };
            this._cache.usuario = usuarioAnonimo;
            this._cache.usuarioValido = true;
            return usuarioAnonimo;
        }
    }

    // ============================================================
    // NAVEGACIÓN
    // ============================================================

    _volver() {
        this._mostrandoFamilia = false;
        this._familiaSeleccionada = null;
        this._renderizarMiEspacio();
    }

    // ============================================================
    // 🔥 EXPONER MÉTODOS DE DETALLE PROFESIONAL
    // ============================================================

    _verDetallePalabraProfesional(palabraId) {
        return window.UIEspacioActions.verDetallePalabraProfesional(palabraId, this);
    }

    _estudiarFrasesDesdeDetalle(palabraId, textoPalabra) {
        return window.UIEspacioActions._estudiarFrasesDesdeDetalle(palabraId, textoPalabra, this);
    }

    // ============================================================
    // RENDERIZADO (DELEGADO A UIEspacioRender)
    // ============================================================

    _renderizarModalUnificado() {
        window.UIEspacioRender.renderizarModalUnificado(this);
    }

    _renderizarDetalleFamiliaCaracteres(familiaId) {
        window.UIEspacioRender.renderizarDetalleFamiliaCaracteres(this, familiaId);
    }

    _renderizarElementoEspacio(elemento, tipo, idioma) {
        return window.UIEspacioRender.renderizarElementoEspacio(elemento, tipo, idioma, this);
    }

    _renderizarBarraBusqueda() {
        return window.UIEspacioRender.renderizarBarraBusqueda(this);
    }

    _renderizarPaginador(paginaActual, totalPaginas, id) {
        return window.UIEspacioRender.renderizarPaginador(paginaActual, totalPaginas, id);
    }

    // ============================================================
    // ACCIONES (DELEGADO A UIEspacioActions)
    // ============================================================

    _toggleFraseFavorita(fraseId, checked) {
        return window.UIEspacioActions.toggleFraseFavorita(fraseId, checked, this);
    }

    _ejercicioTraduccion(fraseId) {
        return window.UIEspacioActions.ejercicioTraduccion(fraseId, this);
    }

    _ejercicioRellenar(palabra, idioma) {
        return window.UIEspacioActions.ejercicioRellenar(palabra, idioma, this);
    }

    _ejercicioOrdenar(fraseId) {
        return window.UIEspacioActions.ejercicioOrdenar(fraseId, this);
    }

    _moverPalabraOrdenar(elemento) {
        window.UIEspacioActions.moverPalabraOrdenar(elemento);
    }

    _validarOrdenFrase(textoCorrecto) {
        window.UIEspacioActions.validarOrdenFrase(textoCorrecto);
    }

    _desordenarFrase() {
        window.UIEspacioActions.desordenarFrase();
    }

    _mostrarOrdenCorrecto(textoCorrecto) {
        window.UIEspacioActions.mostrarOrdenCorrecto(textoCorrecto);
    }

    _modoExpres() {
        return window.UIEspacioActions.modoExpres(this);
    }

    _verFrases() {
        return window.UIEspacioActions.verFrases(this);
    }

    _verPalabras() {
        return window.UIEspacioActions.verPalabras(this);
    }

    _mostrarRankingFamilias(idioma) {
        return window.UIEspacioActions.mostrarRankingFamilias(idioma, this);
    }

    _mostrarEstadisticasNivel(idioma) {
        return window.UIEspacioActions.mostrarEstadisticasNivel(idioma, this);
    }

    _limpiarFavoritos() {
        return window.UIEspacioActions.limpiarFavoritos(this);
    }

    _exportarFavoritos() {
        return window.UIEspacioActions.exportarFavoritos(this);
    }

    _importarFavoritos() {
        return window.UIEspacioActions.importarFavoritos(this);
    }

    _eliminarFrase(fraseId) {
        return window.UIEspacioActions.eliminarFrase(fraseId, this);
    }

    _eliminarPalabra(palabraId) {
        return window.UIEspacioActions.eliminarPalabra(palabraId, this);
    }

    _abrirModalGrupos() {
        return window.UIEspacioActions.abrirModalGrupos(this);
    }

    _estudiarFamiliaDesdeEspacio(familia, nivel) {
        return window.UIEspacioActions.estudiarFamiliaDesdeEspacio(familia, nivel, this);
    }

    _estudiarFamiliaCaracteres(caracterId) {
        return window.UIEspacioActions.estudiarFamiliaCaracteres(caracterId, this);
    }

    _mostrarVariantes(variantesStr) {
        return window.UIEspacioActions.mostrarVariantes(variantesStr, this);
    }

    _mostrarSelectorEjercicios() {
        return window.UIEspacioActions.mostrarSelectorEjercicios(this);
    }

    abrirModalUnificado() {
        return window.UIEspacioActions.abrirModalUnificado(this);
    }

    _cerrarModalUnificado() {
        return window.UIEspacioActions.cerrarModalUnificado(this);
    }

    _cambiarModoGeneradorUnificado(modo) {
        window.UIEspacioActions.cambiarModoGeneradorUnificado(modo);
    }

    _actualizarContadorUnificado() {
        window.UIEspacioActions.actualizarContadorUnificado();
    }

    _generarJSONUnificado() {
        return window.UIEspacioActions.generarJSONUnificado(this);
    }

    _copiarJSONUnificado() {
        window.UIEspacioActions.copiarJSONUnificado();
    }

    _validarEImportarJSONUnificado() {
        return window.UIEspacioActions.validarEImportarJSONUnificado(this);
    }

    _importarElementosConClasificacion(data) {
        return window.UIEspacioActions.importarElementosConClasificacion(data, this);
    }

    _normalizarFamiliaSemantica(familia) {
        return window.UIEspacioActions.normalizarFamiliaSemantica(familia);
    }

    _aplicarFiltros(frases, palabras) {
        return window.UIEspacioActions.aplicarFiltros(frases, palabras, this);
    }

    _limpiarFiltrosEspacio() {
        window.UIEspacioActions.limpiarFiltrosEspacio(this);
    }

    _configurarEventosBusqueda() {
        window.UIEspacioActions.configurarEventosBusqueda(this);
    }

    _irPagina(id, pagina) {
        window.UIEspacioActions.irPagina(id, pagina, this);
    }

    _irPaginaFamiliasCaracteres(pagina) {
        return window.UIEspacioActions.irPaginaFamiliasCaracteres(pagina, this);
    }

    // ============================================================
    // PROCESAR COMANDO DEL CHAT
    // ============================================================

    async procesarComandoChat(mensaje) {
        return window.UIEspacioActions.procesarComandoChat(mensaje, this);
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

if (!window.UIEspacio) {
    window.UIEspacio = new UIEspacioCore();
}

console.log('✅ UIEspacio Core v1.3 - EXPONE ESTUDIAR FRASES DESDE DETALLE');
console.log('  📌 Método _estudiarFrasesDesdeDetalle expuesto correctamente');
console.log('  📌 Método _verDetallePalabraProfesional expuesto correctamente');