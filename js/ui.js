// ============================================================
// UI v16.3 - Punto de entrada principal CON PROXY PARA COMPATIBILIDAD
// ============================================================

(function setupUIProxy() {
    console.log('🔧 Configurando UI Proxy para compatibilidad...');
    
    // Asegurar que uiCore existe
    if (!window.uiCore) {
        console.warn('⚠️ uiCore no encontrado, creando instancia...');
        window.uiCore = new UICore();
        if (window.uiCore && typeof window.uiCore.init === 'function') {
            window.uiCore.init();
        }
    }
    
    // ui = uiCore para compatibilidad
    window.ui = window.uiCore;
    
    // ============================================================
    // EXPONER MÉTODOS DE JSON
    // ============================================================
    if (window.UIJSON) {
        window.ui.generarJSONDesdeDashboard = function() {
            return window.UIJSON.generarJSONDesdeDashboard.apply(window.UIJSON, arguments);
        };
        window.ui.importarJSONDesdeDashboard = function() {
            return window.UIJSON.importarJSONDesdeDashboard.apply(window.UIJSON, arguments);
        };
        window.ui.abrirGeneradorJSON = function() {
            return window.UIJSON.abrirGeneradorJSON.apply(window.UIJSON, arguments);
        };
        window.ui.abrirImportadorJSON = function() {
            return window.UIJSON.abrirImportadorJSON.apply(window.UIJSON, arguments);
        };
        window.ui._handleImportJSON = function() {
            return window.UIJSON._handleImportJSON.apply(window.UIJSON, arguments);
        };
        window.ui._configurarJSON = function() {
            return window.UIJSON._configurarJSON.apply(window.UIJSON, arguments);
        };
        console.log('✅ Métodos JSON expuestos en ui');
    } else {
        console.warn('⚠️ UIJSON no encontrado');
    }

    // ============================================================
    // EXPONER MÉTODOS DE ESTUDIO
    // ============================================================
    if (window.UIStudy) {
        window.ui._renderizarFraseInteractiva = function() {
            return window.UIStudy._renderizarFraseInteractiva.apply(window.UIStudy, arguments);
        };
        window.ui._fraseAnterior = function() {
            return window.UIStudy._fraseAnterior.apply(window.UIStudy, arguments);
        };
        window.ui._fraseSiguiente = function() {
            return window.UIStudy._fraseSiguiente.apply(window.UIStudy, arguments);
        };
        window.ui._responderEstudio = function() {
            return window.UIStudy._responderEstudio.apply(window.UIStudy, arguments);
        };
        window.ui._generarPista = function() {
            return window.UIStudy._generarPista.apply(window.UIStudy, arguments);
        };
        window.ui._validarRespuestaEscrita = function() {
            return window.UIStudy._validarRespuestaEscrita.apply(window.UIStudy, arguments);
        };
        window.ui._toggleFlashcardRespuesta = function() {
            return window.UIStudy._toggleFlashcardRespuesta.apply(window.UIStudy, arguments);
        };
        window.ui._seleccionarOpcionMultiple = function() {
            return window.UIStudy._seleccionarOpcionMultiple.apply(window.UIStudy, arguments);
        };
        window.ui._reproducirFrase = function() {
            return window.UIStudy._reproducirFrase.apply(window.UIStudy, arguments);
        };
        window.ui.mostrarPantallaInicio = function() {
            return window.UIStudy.mostrarPantallaInicio.apply(window.UIStudy, arguments);
        };
        window.ui.cambiarModoEstudio = function() {
            return window.UIStudy.cambiarModoEstudio.apply(window.UIStudy, arguments);
        };
        window.ui._cargarEstudio = function() {
            return window.UIStudy.cargar.bind(window.UIStudy);
        };
        window.ui._toggleFraseFavorita = function() {
            if (window.UIEspacio && window.UIEspacio._toggleFraseFavorita) {
                return window.UIEspacio._toggleFraseFavorita.apply(window.UIEspacio, arguments);
            }
            console.warn('⚠️ _toggleFraseFavorita no disponible en UIEspacio');
            return Promise.resolve(false);
        };
        console.log('✅ Métodos Estudio expuestos en ui');
    } else {
        console.warn('⚠️ UIStudy no encontrado');
    }

    // ============================================================
    // EXPONER MÉTODOS DE TEMAS
    // ============================================================
    if (window.UITemas) {
        window.ui._cargarTemas = function() {
            return window.UITemas._cargarTemas.apply(window.UITemas, arguments);
        };
        window.ui._renderTemas = function() {
            return window.UITemas._renderTemas.apply(window.UITemas, arguments);
        };
        window.ui._verTemaDetalle = function() {
            return window.UITemas._verTemaDetalle.apply(window.UITemas, arguments);
        };
        window.ui._volverTemas = function() {
            return window.UITemas._volverTemas.apply(window.UITemas, arguments);
        };
        window.ui._crearTema = function() {
            return window.UITemas._crearTema.apply(window.UITemas, arguments);
        };
        window.ui._estudiarTema = function() {
            return window.UITemas._estudiarTema.apply(window.UITemas, arguments);
        };
        window.ui._estudiarHistoria = function() {
            return window.UITemas._estudiarHistoria.apply(window.UITemas, arguments);
        };
        window.ui._exportarTema = function() {
            return window.UITemas._exportarTema.apply(window.UITemas, arguments);
        };
        window.ui._importarTemaJSON = function() {
            return window.UITemas._importarTemaJSON.apply(window.UITemas, arguments);
        };
        window.ui._eliminarTema = function() {
            return window.UITemas._eliminarTema.apply(window.UITemas, arguments);
        };
        window.ui._crearHistoriaEnTema = function() {
            return window.UITemas._crearHistoriaEnTema.apply(window.UITemas, arguments);
        };
        window.ui._importarHistoriaATema = function() {
            return window.UITemas._importarHistoriaATema.apply(window.UITemas, arguments);
        };
        window.ui._eliminarHistoriaDeTema = function() {
            return window.UITemas._eliminarHistoriaDeTema.apply(window.UITemas, arguments);
        };
        window.ui.exportarHistoria = function() {
            return window.UITemas.exportarHistoria.apply(window.UITemas, arguments);
        };
        window.ui._cargarHistorias = function() {
            return window.UITemas._cargarHistorias.apply(window.UITemas, arguments);
        };
        console.log('✅ Métodos Temas expuestos en ui');
    } else {
        console.warn('⚠️ UITemas no encontrado');
    }

    // ============================================================
    // EXPONER MÉTODOS DE CONFIGURACIÓN
    // ============================================================
    if (window.UIConfig) {
        window.ui._guardarConfigNivel = function() {
            return window.UIConfig._guardarConfigNivel.apply(window.UIConfig, arguments);
        };
        window.ui._guardarConfigPerfil = function() {
            return window.UIConfig._guardarConfigPerfil.apply(window.UIConfig, arguments);
        };
        window.ui._guardarConfigPreferencias = function() {
            return window.UIConfig._guardarConfigPreferencias.apply(window.UIConfig, arguments);
        };
        window.ui._iniciarExamenConfig = function() {
            return window.UIConfig._iniciarExamenConfig.apply(window.UIConfig, arguments);
        };
        window.ui._actualizarNivelHeader = function() {
            return window.UIConfig._actualizarNivelHeader.apply(window.UIConfig, arguments);
        };
        window.ui._mostrarCelebracionNivelPro = function() {
            return window.UIConfig._mostrarCelebracionNivelPro.apply(window.UIConfig, arguments);
        };
        window.ui._mostrarExamenNivelPro = function() {
            return window.UIConfig._mostrarExamenNivelPro.apply(window.UIConfig, arguments);
        };
        window.ui._mostrarRecomendacionesNivel = function() {
            return window.UIConfig._mostrarRecomendacionesNivel.apply(window.UIConfig, arguments);
        };
        window.ui._mostrarCelebracionExamen = function() {
            return window.UIConfig._mostrarCelebracionExamen.apply(window.UIConfig, arguments);
        };
        window.ui._cargarConfiguracion = function() {
            return window.UIConfig._cargarConfiguracion.bind(window.UIConfig);
        };
        console.log('✅ Métodos Configuración expuestos en ui');
    } else {
        console.warn('⚠️ UIConfig no encontrado');
    }

    // ============================================================
    // EXPONER MÉTODOS DE GRAMÁTICA
    // ============================================================
    if (window.UIGrammar) {
        window.ui._cargarGramatica = function() {
            return window.UIGrammar._cargarGramatica.apply(window.UIGrammar, arguments);
        };
        window.ui._cargarGramaticaConFiltro = function() {
            return window.UIGrammar._cargarGramaticaConFiltro.apply(window.UIGrammar, arguments);
        };
        window.ui._estudiarFiltroActual = function() {
            return window.UIGrammar._estudiarFiltroActual.apply(window.UIGrammar, arguments);
        };
        window.ui._estudiarFamilia = function() {
            return window.UIGrammar._estudiarFamilia.apply(window.UIGrammar, arguments);
        };
        window.ui._ejercicioPalabra = function() {
            return window.UIGrammar._ejercicioPalabra.apply(window.UIGrammar, arguments);
        };
        window.ui._actualizarSelectFamilias = function() {
            return window.UIGrammar._actualizarSelectFamilias.apply(window.UIGrammar, arguments);
        };
        window.ui._verExplicacionGramatical = function() {
            return window.UIGrammar._verExplicacionGramatical.apply(window.UIGrammar, arguments);
        };
        window.ui._estudiarFrasesNivelRegla = function() {
            return window.UIGrammar._estudiarFrasesNivelRegla.apply(window.UIGrammar, arguments);
        };
        window.ui._forzarActualizacionGramatical = function() {
            return window.UIGrammar._forzarActualizacionGramatical.apply(window.UIGrammar, arguments);
        };
        window.ui._enviarMensajeGramatical = function() {
            return window.UIGrammar._enviarMensajeGramatical.apply(window.UIGrammar, arguments);
        };
        window.ui._limpiarChatGramatical = function() {
            return window.UIGrammar._limpiarChatGramatical.apply(window.UIGrammar, arguments);
        };
        window.ui._preguntaRapidaGramatical = function() {
            return window.UIGrammar._preguntaRapidaGramatical.apply(window.UIGrammar, arguments);
        };
        console.log('✅ Métodos Gramática expuestos en ui');
    } else {
        console.warn('⚠️ UIGrammar no encontrado');
    }

    // ============================================================
    // EXPONER MÉTODOS DE CHAT
    // ============================================================
    if (window.UIChat) {
        window.ui._cargarChatPro = function() {
            return window.UIChat._cargarChatPro.apply(window.UIChat, arguments);
        };
        window.ui._handleChatPro = function() {
            return window.UIChat._handleChatPro.apply(window.UIChat, arguments);
        };
        window.ui._chatLimpiar = function() {
            return window.UIChat._chatLimpiar.apply(window.UIChat, arguments);
        };
        window.ui._chatExportar = function() {
            return window.UIChat._chatExportar.apply(window.UIChat, arguments);
        };
        window.ui._chatReconectar = function() {
            return window.UIChat._chatReconectar.apply(window.UIChat, arguments);
        };
        window.ui._chatSugerencia = function() {
            return window.UIChat._chatSugerencia.apply(window.UIChat, arguments);
        };
        window.ui._mostrarMetricasDetalladas = function() {
            return window.UIChat._mostrarMetricasDetalladas.apply(window.UIChat, arguments);
        };
        console.log('✅ Métodos Chat expuestos en ui');
    } else {
        console.warn('⚠️ UIChat no encontrado');
    }

    // ============================================================
    // EXPONER MÉTODOS DE TOOLS
    // ============================================================
    if (window.UITools) {
        window.ui._handleBackup = function() {
            return window.UITools._handleBackup.apply(window.UITools, arguments);
        };
        window.ui._handleCheckpoints = function() {
            return window.UITools._handleCheckpoints.apply(window.UITools, arguments);
        };
        window.ui._handleDiagnostic = function() {
            return window.UITools._handleDiagnostic.apply(window.UITools, arguments);
        };
        window.ui._handleReset = function() {
            return window.UITools._handleReset.apply(window.UITools, arguments);
        };
        window.ui._handleReiniciarFase = function() {
            return window.UITools._handleReiniciarFase.apply(window.UITools, arguments);
        };
        window.ui._handleGenerarCheckpoint = function() {
            return window.UITools._handleGenerarCheckpoint.apply(window.UITools, arguments);
        };
        window.ui._handleReconectarVigia = function() {
            return window.UITools._handleReconectarVigia.apply(window.UITools, arguments);
        };
        window.ui._handleEstadoSistema = function() {
            return window.UITools._handleEstadoSistema.apply(window.UITools, arguments);
        };
        console.log('✅ Métodos Tools expuestos en ui');
    } else {
        console.warn('⚠️ UITools no encontrado');
    }

    // ============================================================
    // EXPONER MÉTODOS DE DASHBOARD
    // ============================================================
    if (window.UIDashboard) {
        window.ui._cargarDashboardInicial = function() {
            return window.UIDashboard._cargarDashboardInicial.apply(window.UIDashboard, arguments);
        };
        window.ui._cargarEstadisticas = function() {
            return window.UIDashboard.cargarEstadisticas.apply(window.UIDashboard, arguments);
        };
        window.ui._actualizarTarjetaStudy = function() {
            return window.UIDashboard._actualizarTarjetaStudy.apply(window.UIDashboard, arguments);
        };
        window.ui._actualizarTarjetaGrammar = function() {
            return window.UIDashboard._actualizarTarjetaGrammar.apply(window.UIDashboard, arguments);
        };
        window.ui._actualizarTarjetaTemas = function() {
            return window.UIDashboard._actualizarTarjetaTemas.apply(window.UIDashboard, arguments);
        };
        window.ui._actualizarTarjetaVigia = function() {
            return window.UIDashboard._actualizarTarjetaVigia.apply(window.UIDashboard, arguments);
        };
        window.ui._actualizarTarjetaStats = function() {
            return window.UIDashboard._actualizarTarjetaStats.apply(window.UIDashboard, arguments);
        };
        window.ui._actualizarHeaderStats = function() {
            return window.UIDashboard._actualizarHeaderStats.apply(window.UIDashboard, arguments);
        };
        console.log('✅ Métodos Dashboard expuestos en ui');
    } else {
        console.warn('⚠️ UIDashboard no encontrado');
    }

    // ============================================================
    // EXPONER MÉTODOS DE ESPACIO
    // ============================================================
    if (window.UIEspacio) {
        window.ui._renderizarMiEspacio = function() {
            return window.UIEspacio._renderizarMiEspacio.apply(window.UIEspacio, arguments);
        };
        window.ui.abrirModalEspacio = function() {
            return window.UIEspacio.abrirModalEspacio.apply(window.UIEspacio, arguments);
        };
        window.ui._toggleFraseFavorita = function() {
            return window.UIEspacio._toggleFraseFavorita.apply(window.UIEspacio, arguments);
        };
        window.ui._ejercicioTraduccion = function() {
            return window.UIEspacio._ejercicioTraduccion.apply(window.UIEspacio, arguments);
        };
        window.ui._ejercicioRellenar = function() {
            return window.UIEspacio._ejercicioRellenar.apply(window.UIEspacio, arguments);
        };
        window.ui._ejercicioOrdenar = function() {
            return window.UIEspacio._ejercicioOrdenar.apply(window.UIEspacio, arguments);
        };
        window.ui._modoExpres = function() {
            return window.UIEspacio._modoExpres.apply(window.UIEspacio, arguments);
        };
        window.ui._verFrases = function() {
            return window.UIEspacio._verFrases.apply(window.UIEspacio, arguments);
        };
        window.ui._verPalabras = function() {
            return window.UIEspacio._verPalabras.apply(window.UIEspacio, arguments);
        };
        window.ui._exportarFavoritos = function() {
            return window.UIEspacio._exportarFavoritos.apply(window.UIEspacio, arguments);
        };
        window.ui._importarFavoritos = function() {
            return window.UIEspacio._importarFavoritos.apply(window.UIEspacio, arguments);
        };
        window.ui._limpiarFavoritos = function() {
            return window.UIEspacio._limpiarFavoritos.apply(window.UIEspacio, arguments);
        };
        window.ui._mostrarRankingFamilias = function() {
            return window.UIEspacio._mostrarRankingFamilias.apply(window.UIEspacio, arguments);
        };
        window.ui._mostrarEstadisticasNivel = function() {
            return window.UIEspacio._mostrarEstadisticasNivel.apply(window.UIEspacio, arguments);
        };
        console.log('✅ Métodos Espacio expuestos en ui');
    } else {
        console.warn('⚠️ UIEspacio no encontrado');
    }

    // ============================================================
    // 🔥 EXPONER MÉTODOS DE COMPETICIONES - CORREGIDO
    // ============================================================
    // Ahora usamos un enfoque más robusto: comprobamos si existe,
    // y si no, exponemos métodos que intentan inicializarlo.
    // ============================================================
    if (window.SistemaCompeticiones) {
        window.ui.abrirCompeticiones = function() {
            if (window.SistemaCompeticiones && window.SistemaCompeticiones.abrirModulo) {
                window.SistemaCompeticiones.abrirModulo();
            } else {
                console.warn('⚠️ SistemaCompeticiones no disponible');
                window.ui.mostrarToast('⚠️ Módulo de competiciones no disponible. Revisa la consola.', 'error');
            }
        };
        window.ui._cargarCompeticiones = function() {
            if (window.SistemaCompeticiones) {
                window.SistemaCompeticiones.cargar(window.uiCore);
            } else {
                console.warn('⚠️ SistemaCompeticiones no disponible');
                window.ui.mostrarToast('⚠️ Módulo de competiciones no disponible.', 'error');
            }
        };
        window.ui._iniciarModoCompeticion = function(modo) {
            if (window.SistemaCompeticiones) {
                window.SistemaCompeticiones._iniciarModo(modo);
            } else {
                console.warn('⚠️ SistemaCompeticiones no disponible');
                window.ui.mostrarToast('⚠️ No se pudo iniciar el modo.', 'error');
            }
        };
        window.ui._seleccionarNPC = function(npcId) {
            if (window.SistemaCompeticiones) {
                window.SistemaCompeticiones._seleccionarNPC(npcId);
            } else {
                console.warn('⚠️ SistemaCompeticiones no disponible');
                window.ui.mostrarToast('⚠️ No se pudo seleccionar el NPC.', 'error');
            }
        };
        window.ui._validarRespuestaCompetitiva = function() {
            if (window.SistemaCompeticiones) {
                window.SistemaCompeticiones._validarRespuestaCompetitiva();
            } else {
                console.warn('⚠️ SistemaCompeticiones no disponible');
                window.ui.mostrarToast('⚠️ No se pudo validar la respuesta.', 'error');
            }
        };
        console.log('✅ Métodos Competiciones expuestos en ui');
    } else {
        console.warn('⚠️ SistemaCompeticiones no encontrado al cargar ui.js');
        // 🔥 EXPONER MÉTODOS QUE INTENTAN INICIALIZAR COMPETICIONES BAJO DEMANDA
        window.ui.abrirCompeticiones = function() {
            // Intentar inicializar si no existe
            if (!window.SistemaCompeticiones) {
                console.log('🏆 SistemaCompeticiones no disponible, intentando inicializar...');
                if (typeof sistemaCompeticiones !== 'undefined' && sistemaCompeticiones) {
                    window.SistemaCompeticiones = sistemaCompeticiones;
                    if (window.SistemaCompeticiones && typeof window.SistemaCompeticiones.init === 'function') {
                        window.SistemaCompeticiones.init(window.uiCore);
                        window.ui.mostrarToast('🏆 Módulo de competiciones inicializado', 'success');
                    }
                } else {
                    window.ui.mostrarToast('⚠️ Módulo de competiciones no disponible. Recarga la página.', 'error');
                    return;
                }
            }
            if (window.SistemaCompeticiones && window.SistemaCompeticiones.abrirModulo) {
                window.SistemaCompeticiones.abrirModulo();
            }
        };
        window.ui._cargarCompeticiones = function() {
            if (!window.SistemaCompeticiones) {
                if (typeof sistemaCompeticiones !== 'undefined' && sistemaCompeticiones) {
                    window.SistemaCompeticiones = sistemaCompeticiones;
                    if (window.SistemaCompeticiones && typeof window.SistemaCompeticiones.init === 'function') {
                        window.SistemaCompeticiones.init(window.uiCore);
                    }
                }
            }
            if (window.SistemaCompeticiones) {
                window.SistemaCompeticiones.cargar(window.uiCore);
            } else {
                window.ui.mostrarToast('⚠️ Módulo de competiciones no disponible.', 'error');
            }
        };
        window.ui._iniciarModoCompeticion = function(modo) {
            if (!window.SistemaCompeticiones) {
                if (typeof sistemaCompeticiones !== 'undefined' && sistemaCompeticiones) {
                    window.SistemaCompeticiones = sistemaCompeticiones;
                    if (window.SistemaCompeticiones && typeof window.SistemaCompeticiones.init === 'function') {
                        window.SistemaCompeticiones.init(window.uiCore);
                    }
                }
            }
            if (window.SistemaCompeticiones) {
                window.SistemaCompeticiones._iniciarModo(modo);
            } else {
                window.ui.mostrarToast('⚠️ No se pudo iniciar el modo.', 'error');
            }
        };
        window.ui._seleccionarNPC = function(npcId) {
            if (!window.SistemaCompeticiones) {
                if (typeof sistemaCompeticiones !== 'undefined' && sistemaCompeticiones) {
                    window.SistemaCompeticiones = sistemaCompeticiones;
                    if (window.SistemaCompeticiones && typeof window.SistemaCompeticiones.init === 'function') {
                        window.SistemaCompeticiones.init(window.uiCore);
                    }
                }
            }
            if (window.SistemaCompeticiones) {
                window.SistemaCompeticiones._seleccionarNPC(npcId);
            } else {
                window.ui.mostrarToast('⚠️ No se pudo seleccionar el NPC.', 'error');
            }
        };
        window.ui._validarRespuestaCompetitiva = function() {
            if (!window.SistemaCompeticiones) {
                if (typeof sistemaCompeticiones !== 'undefined' && sistemaCompeticiones) {
                    window.SistemaCompeticiones = sistemaCompeticiones;
                    if (window.SistemaCompeticiones && typeof window.SistemaCompeticiones.init === 'function') {
                        window.SistemaCompeticiones.init(window.uiCore);
                    }
                }
            }
            if (window.SistemaCompeticiones) {
                window.SistemaCompeticiones._validarRespuestaCompetitiva();
            } else {
                window.ui.mostrarToast('⚠️ No se pudo validar la respuesta.', 'error');
            }
        };
        console.log('✅ Métodos Competiciones expuestos en ui (con inicialización bajo demanda)');
    }

    // ============================================================
    // EXPONER MÉTODOS DE CORE (vinculación explícita)
    // ============================================================
    if (window.uiCore) {
        window.ui.mostrarToast = window.uiCore.mostrarToast.bind(window.uiCore);
        window.ui.alert = window.uiCore.alert.bind(window.uiCore);
        window.ui.confirm = window.uiCore.confirm.bind(window.uiCore);
        window.ui.prompt = window.uiCore.prompt.bind(window.uiCore);
        window.ui.irAModulo = window.uiCore.irAModulo.bind(window.uiCore);
        window.ui.volverDashboard = window.uiCore.volverDashboard.bind(window.uiCore);
        window.ui.abrirModal = window.uiCore.abrirModal.bind(window.uiCore);
        window.ui.cerrarModal = window.uiCore.cerrarModal.bind(window.uiCore);
        window.ui._getColorFamilia = window.uiCore._getColorFamilia.bind(window.uiCore);
        window.ui.actualizarIndicadores = window.uiCore.actualizarIndicadores.bind(window.uiCore);
        window.ui._mostrarOfflineBanner = window.uiCore._mostrarOfflineBanner.bind(window.uiCore);
        window.ui._ocultarOfflineBanner = window.uiCore._ocultarOfflineBanner.bind(window.uiCore);
        window.ui._actualizarIndicadoresSeguro = window.uiCore._actualizarIndicadoresSeguro.bind(window.uiCore);
        window.ui._iniciarActividad = window.uiCore._iniciarActividad.bind(window.uiCore);
        window.ui._actualizarActividad = window.uiCore._actualizarActividad.bind(window.uiCore);
        window.ui._configurarEventos = window.uiCore._configurarEventos.bind(window.uiCore);
        window.ui._iniciarIndicadoresHeader = window.uiCore._iniciarIndicadoresHeader.bind(window.uiCore);
        window.ui._irAModulo = window.uiCore._irAModulo.bind(window.uiCore);
        window.ui._irADashboard = window.uiCore._irADashboard.bind(window.uiCore);
        window.ui._actualizarBreadcrumb = window.uiCore._actualizarBreadcrumb.bind(window.uiCore);
        window.ui._cargarContenidoModulo = window.uiCore._cargarContenidoModulo.bind(window.uiCore);
        window.ui._initSubmodulos = window.uiCore._initSubmodulos.bind(window.uiCore);
        window.ui.init = window.uiCore.init.bind(window.uiCore);
        window.ui._actualizarEspacioStats = window.uiCore._actualizarEspacioStats.bind(window.uiCore);
        window.ui._recargarConfiguracionUI = window.uiCore._recargarConfiguracionUI.bind(window.uiCore);
        console.log('✅ Métodos Core expuestos en ui');
    }

    // ============================================================
    // MÉTODOS DE REGISTRO/IDIOMAS
    // ============================================================
    window.ui.agregarIdioma = function() {
        const container = document.getElementById('idiomasContainer');
        if (!container) return;
        const row = document.createElement('div');
        row.className = 'idioma-row';
        row.innerHTML = '<input type="text" class="idioma-input" placeholder="Ej: Chino, English" required>' +
            '<select class="nivel-select" required><option value="A1">A1</option><option value="A2">A2</option><option value="B1" selected>B1</option><option value="B2">B2</option><option value="C1">C1</option><option value="C2">C2</option></select>' +
            '<button type="button" class="btn-remove-idioma" onclick="window.ui.eliminarIdioma(this)"><i class="fas fa-times"></i></button>';
        container.appendChild(row);
        window.ui._actualizarBotonesEliminar();
    };
    
    window.ui.eliminarIdioma = function(btn) {
        if (!btn) return;
        const row = btn.closest('.idioma-row');
        const container = document.getElementById('idiomasContainer');
        if (!container) return;
        if (container.children.length > 1) {
            row.remove();
            window.ui._actualizarBotonesEliminar();
        } else {
            window.ui.alert('❌ Debes tener al menos un idioma objetivo', 'Error');
        }
    };
    
    window.ui._actualizarBotonesEliminar = function() {
        const rows = document.querySelectorAll('.idioma-row');
        const btns = document.querySelectorAll('.btn-remove-idioma');
        for (let i = 0; i < btns.length; i++) {
            btns[i].style.display = rows.length > 1 ? 'flex' : 'none';
        }
    };

    // ============================================================
    // MÉTODO PARA CARGAR ESTADÍSTICAS
    // ============================================================
    window.ui._cargarEstadisticas = function() {
        if (window.UIDashboard) {
            window.UIDashboard.cargarEstadisticas(window.uiCore);
        }
    };

    console.log('%c✅ UI v16.3 - COMPLETO CON MEJORAS PRO Y PROXY', 'font-size:16px;font-weight:bold;color:#6C5CE7;');
    console.log('  🔥 Corrección de botones Validar y Pista');
    console.log('  🔥 Pinyin integrado para idiomas jeroglíficos');
    console.log('  🔥 Corrección inteligente de ejercicios (offline)');
    console.log('  🔥 UI dividida en 10 módulos manejables');
    console.log('  🔥 Chat PRO con comandos interactivos');
    console.log('  🔥 Sistema de niveles con umbrales adaptativos');
    console.log('  🔥 Compatibilidad con código existente (ui.*)');
    console.log('  🔥 Todos los métodos expuestos correctamente');
    console.log('  🔥 Métodos Competiciones con inicialización bajo demanda');
    console.log('  📚 Soporte para Vigía Gramatical y Mi Espacio');
    console.log('  🏆 Soporte para Sistema de Ligas con NPCs IA');
    
    // Verificación final
    console.log('📊 Verificación de métodos:');
    console.log('  - generarJSONDesdeDashboard:', typeof window.ui.generarJSONDesdeDashboard);
    console.log('  - importarJSONDesdeDashboard:', typeof window.ui.importarJSONDesdeDashboard);
    console.log('  - _cargarTemas:', typeof window.ui._cargarTemas);
    console.log('  - _handleDiagnostic:', typeof window.ui._handleDiagnostic);
    console.log('  - mostrarToast:', typeof window.ui.mostrarToast);
    console.log('  - agregarIdioma:', typeof window.ui.agregarIdioma);
    console.log('  - _toggleFraseFavorita:', typeof window.ui._toggleFraseFavorita);
    console.log('  - _enviarMensajeGramatical:', typeof window.ui._enviarMensajeGramatical);
    console.log('  - abrirCompeticiones:', typeof window.ui.abrirCompeticiones);
})();