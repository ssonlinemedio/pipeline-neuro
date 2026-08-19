// ============================================================
// GESTOR CENTRAL DE PROGRESO DE HISTORIAS/ONDAS v2.1
// CORREGIDO: SOPORTE PARA ONDAS CRUZADAS (NO INTENTAR SINCRONIZAR CON ELIPSE)
// ============================================================

class GestorProgresoHistorias {
    constructor() {
        this._eventosRegistrados = false;
        this._debug = true;
        this._procesando = new Set();
        this._ultimoCambio = {};
        this._cambioManual = {};
        this._registrarEventos();
    }

    _log(mensaje, tipo = 'info') {
        if (this._debug) {
            const prefix = '📌 [GestorProgreso]';
            if (tipo === 'error') console.error(`${prefix} ${mensaje}`);
            else if (tipo === 'warn') console.warn(`${prefix} ${mensaje}`);
            else console.log(`${prefix} ${mensaje}`);
        }
    }

    _registrarEventos() {
        if (this._eventosRegistrados) return;
        this._eventosRegistrados = true;
        this._log('Eventos registrados');
    }

    /**
     * Marca o desmarca una historia/onda como completada
     * 🔥 CORREGIDO: Soporte para ondas cruzadas (no intentar sincronizar con Elipse)
     */
    async cambiarEstadoHistoria(historiaId, completado, origen = 'desconocido') {
        if (this._procesando.has(historiaId)) {
            this._log(`⏳ Historia ${historiaId} ya está siendo procesada, omitiendo...`, 'warn');
            return false;
        }

        const key = `${historiaId}_${origen}`;
        const ahora = Date.now();
        if (this._ultimoCambio[key] && (ahora - this._ultimoCambio[key] < 500)) {
            this._log(`⏳ Cambio muy rápido para ${historiaId}, omitiendo...`, 'warn');
            return false;
        }
        this._ultimoCambio[key] = ahora;
        this._cambioManual[historiaId] = ahora;

        this._procesando.add(historiaId);
        this._log(`🔄 Cambiando estado de historia ${historiaId} a ${completado ? 'completada' : 'no completada'} (origen: ${origen})`);

        try {
            const historia = await db.get('historias', historiaId);
            if (!historia) {
                this._log(`❌ Historia ${historiaId} no encontrada.`, 'error');
                this._procesando.delete(historiaId);
                return false;
            }

            this._log(`📖 Historia: "${historia.titulo}" (estado: ${historia.estado || 'sin_estado'})`);

            // 🔥 DETECTAR TIPO DE HISTORIA
            const esOndaCruzada = historia._esOndaCruzada === true;
            const esOnda = historia._esOnda === true && !esOndaCruzada;
            const esBase = historia._esBase === true || historia._esOnda === false;

            // 🔥 SI ES ONDA CRUZADA, NO INTENTAR SINCRONIZAR CON ELIPSE
            if (esOndaCruzada) {
                this._log(`🌊 Onda CRUZADA detectada, NO se sincronizará con Elipse`);
            }

            const frases = await db.obtenerFrasesPorHistoria(historiaId);
            let rcnPromedio = 0;
            let frasesCompletadas = 0;
            let totalFrases = frases.length;

            if (totalFrases > 0) {
                let totalRCN = 0;
                let count = 0;
                for (const f of frases) {
                    const progreso = await db.obtenerProgreso(f.id);
                    if (progreso) {
                        const rcn = progreso.rcn || 0;
                        totalRCN += rcn;
                        count++;
                        if (rcn >= 4 || progreso.estado === 'completada') {
                            frasesCompletadas++;
                        }
                    }
                }
                rcnPromedio = count > 0 ? totalRCN / count : 0;
            }

            let rcnFinal = rcnPromedio;
            let estadoFinal = completado ? 'completada' : 'en_curso';

            if (esBase && completado) {
                rcnFinal = 5.0;
                this._log(`🌟 BASE marcada como completada, RCN forzado a 5.0`);
            } else if (esBase && !completado) {
                rcnFinal = 0;
                this._log(`🌟 BASE desmarcada, RCN resetado a 0`);
            } else if (completado && rcnPromedio < 4) {
                rcnFinal = Math.max(4.0, rcnPromedio);
                this._log(`⚠️ RCN bajo (${rcnPromedio.toFixed(1)}) forzado a ${rcnFinal.toFixed(1)} para completado`);
            } else if (!completado) {
                rcnFinal = 0;
                this._log(`🔄 Historia desmarcada, RCN resetado a 0`);
            }

            if (!completado) {
                this._log(`🔄 Resetear progreso de ${frases.length} frases`);
                for (const f of frases) {
                    const progreso = await db.obtenerProgreso(f.id);
                    if (progreso) {
                        progreso.rcn = 0;
                        progreso.rg = 0;
                        progreso.estado = 'nueva';
                        progreso.repasosExitosos = 0;
                        progreso.repasosFallidos = 0;
                        progreso.ultimoRepaso = null;
                        progreso.proximoRepaso = null;
                        progreso.intervaloActual = 0;
                        await db.guardarProgreso(progreso);
                    }
                }
            } else if (completado && rcnPromedio < 4) {
                this._log(`🔄 Forzando RCN a 4.0 en ${frases.length} frases`);
                for (const f of frases) {
                    const progreso = await db.obtenerProgreso(f.id);
                    if (progreso) {
                        progreso.rcn = 4.0;
                        progreso.estado = 'completada';
                        progreso.repasosExitosos = (progreso.repasosExitosos || 0) + 3;
                        await db.guardarProgreso(progreso);
                    } else {
                        await db.guardarProgreso({
                            fraseId: f.id,
                            fase: 7,
                            rcn: 4.0,
                            rg: 1,
                            ultimoRepaso: Date.now(),
                            proximoRepaso: Date.now() + 86400000,
                            estado: 'completada',
                            repasosExitosos: 3,
                            repasosFallidos: 0,
                            intervaloActual: 86400000,
                            fechaCreacion: Date.now()
                        });
                    }
                }
            }

            // Actualizar la historia en DB
            historia._rcnPromedio = rcnFinal;
            historia.estado = estadoFinal;
            historia._completada = completado;
            if (completado) {
                historia._fechaCompletado = Date.now();
            } else {
                delete historia._fechaCompletado;
            }
            await db.update('historias', historia);
            this._log(`✅ Historia actualizada en DB: estado=${estadoFinal}, RCN=${rcnFinal.toFixed(1)}`);

            // 🔥 SOLO SINCRONIZAR CON ELIPSE SI NO ES ONDA CRUZADA
            if ((esOnda || esBase) && window.modoElipse) {
                const elipseHistoria = window.modoElipse.getHistoriaElipse(historiaId);
                if (elipseHistoria) {
                    this._log(`🌌 Actualizando ${esBase ? 'BASE' : 'onda'} en Modo Elipse: ${historia.titulo}`);
                    elipseHistoria.completada = completado;
                    elipseHistoria.rcnPromedio = rcnFinal;
                    
                    if (completado) {
                        elipseHistoria._sincronizado = true;
                        elipseHistoria._fechaSincronizacion = Date.now();
                        await this._sincronizarConTemas(historia, completado);
                    } else {
                        elipseHistoria._sincronizado = false;
                        elipseHistoria._fechaSincronizacion = null;
                        await this._reabrirTemaSiCompletado(historia.temaId);
                    }
                    
                    window.modoElipse._guardarEstadoElipse();
                    this._log(`✅ ${esBase ? 'BASE' : 'Onda'} Elipse actualizada: completada=${elipseHistoria.completada}, RCN=${elipseHistoria.rcnPromedio.toFixed(1)}`);
                } else {
                    // 🔥 SOLO MOSTRAR ADVERTENCIA SI ES ONDA ELIPSE, NO PARA CRUZADAS
                    if (!esOndaCruzada) {
                        this._log(`⚠️ ${esBase ? 'BASE' : 'Onda'} ${historiaId} no encontrada en Modo Elipse.`, 'warn');
                    }
                }
            } else if (esOndaCruzada) {
                // 🔥 PARA ONDAS CRUZADAS, SOLO DISPARAR EVENTOS, NO SINCRONIZAR CON ELIPSE
                this._log(`🌊 Onda CRUZADA ${historiaId}: estado actualizado, sin sincronización con Elipse`);
                
                // 🔥 ACTUALIZAR EL GRAFO DE ONDAS CRUZADAS
                if (window.modoOndasCruzadas) {
                    try {
                        // Forzar sincronización del grafo
                        if (typeof window.modoOndasCruzadas.sincronizarConElipse === 'function') {
                            await window.modoOndasCruzadas.sincronizarConElipse(historia.temaId);
                        }
                        if (typeof window.modoOndasCruzadas._calcularInterferencias === 'function') {
                            window.modoOndasCruzadas._calcularInterferencias();
                        }
                        if (typeof window.modoOndasCruzadas._guardarDatos === 'function') {
                            await window.modoOndasCruzadas._guardarDatos();
                        }
                        this._log(`🌊 Grafo de Ondas Cruzadas actualizado`);
                    } catch (e) {
                        this._log(`⚠️ Error actualizando grafo de Ondas Cruzadas: ${e.message}`, 'warn');
                    }
                }
            }

            // 🔥 DISPARAR EVENTO DE ESTADO CAMBIADO (SIEMPRE, PARA TODOS LOS TIPOS)
            this._dispararEventoEstadoCambiado(historiaId, completado, origen, esOnda, esOndaCruzada, rcnFinal);
            
            // 🔥 FORZAR ACTUALIZACIÓN DE UI
            await this._forzarActualizacionUI(historiaId, completado, esOnda, esOndaCruzada);

            this._log(`✅ Estado de historia ${historiaId} actualizado. Completado: ${completado}, RCN: ${rcnFinal.toFixed(1)}`);
            this._procesando.delete(historiaId);
            return true;
        } catch (error) {
            this._log(`❌ Error: ${error.message}`, 'error');
            console.error(error);
            this._procesando.delete(historiaId);
            return false;
        }
    }

    async actualizarDesdeSRS(historiaId, rcnPromedio, completada) {
        const cambioManual = this._cambioManual[historiaId];
        if (cambioManual && (Date.now() - cambioManual < 5000)) {
            this._log(`⏳ Ignorando actualización SRS para ${historiaId} (cambio manual reciente)`, 'warn');
            return false;
        }

        const historia = await db.get('historias', historiaId);
        if (!historia) return false;
        
        const estadoActual = historia.estado === 'completada' || historia._completada === true;
        if (estadoActual === completada) {
            return false;
        }

        if (completada && rcnPromedio < 4.0) {
            this._log(`⏳ Ignorando SRS: RCN ${rcnPromedio.toFixed(1)} < 4.0 para ${historiaId}`, 'warn');
            return false;
        }

        if (!completada && rcnPromedio >= 4.0) {
            this._log(`⏳ Ignorando SRS: RCN ${rcnPromedio.toFixed(1)} >= 4.0, no se puede desmarcar desde SRS`, 'warn');
            return false;
        }

        this._log(`🔄 SRS: Actualizando ${historiaId} a ${completada ? 'completada' : 'no completada'} (RCN: ${rcnPromedio.toFixed(1)})`);
        return await this.cambiarEstadoHistoria(historiaId, completada, 'srs');
    }

    async _forzarActualizacionUI(historiaId, completado, esOnda, esOndaCruzada) {
        this._log(`🔄 Forzando actualización de UI...`);

        // 🔥 ACTUALIZAR UI DE ELIPSE (SOLO SI ES ONDA ELIPSE)
        if (esOnda && window.UIClipse) {
            try {
                if (window.UIClipse._visorAbierto) {
                    window.UIClipse._cerrarVisorYVolver();
                }
                await window.UIClipse._renderizarPanel(window.UIClipse._temaId);
                this._log(`✅ UI Elipse actualizada`);
            } catch (e) {
                this._log(`Error actualizando Elipse: ${e.message}`, 'warn');
            }
        }

        // 🔥 ACTUALIZAR UI DE ONDAS CRUZADAS (SIEMPRE)
        if (window.UIOndasCruzadas) {
            try {
                await window.UIOndasCruzadas._cargarDatos();
                await window.UIOndasCruzadas._renderizarPanel();
                this._log(`✅ UI Ondas Cruzadas actualizada`);
            } catch (e) {
                this._log(`Error actualizando Ondas Cruzadas: ${e.message}`, 'warn');
            }
        }

        // 🔥 ACTUALIZAR UI DE TEMAS (SIEMPRE)
        if (window.UITemas) {
            try {
                if (window.UITemas.modoVistaTemas === 'detalle') {
                    await window.UITemas._verTemaDetalle(window.UITemas.temaSeleccionado);
                } else {
                    await window.UITemas._renderTemas();
                }
                this._log(`✅ UI Temas actualizada`);
            } catch (e) {
                this._log(`Error actualizando Temas: ${e.message}`, 'warn');
            }
        }

        // 🔥 ACTUALIZAR DASHBOARD
        if (window.UIDashboard) {
            try {
                await window.UIDashboard._cargarDashboardInicial(window.uiCore);
                this._log(`✅ Dashboard actualizado`);
            } catch (e) {
                this._log(`Error actualizando Dashboard: ${e.message}`, 'warn');
            }
        }

        // 🔥 DISPARAR EVENTO DE REFRESCO UI
        window.dispatchEvent(new CustomEvent('uiNeedsRefresh', {
            detail: {
                historiaId: historiaId,
                completado: completado,
                esOnda: esOnda,
                esOndaCruzada: esOndaCruzada,
                timestamp: Date.now()
            }
        }));

        this._log(`✅ UI actualizada forzadamente`);
    }

    async _sincronizarConTemas(historia, completado) {
        try {
            const temaId = historia.temaId;
            const tema = await db.obtenerTema(temaId);
            if (!tema) return;

            const idioma = tema.idioma || 'es';
            const temaOriginalId = tema._temaOriginalId || tema.id;

            const todasHistorias = await db.obtenerHistoriasPorTema(temaId);
            const todasCompletadas = todasHistorias.every(h => 
                h.estado === 'completada' || h._completada === true
            );

            if (todasCompletadas && tema.estado !== 'completado') {
                tema.estado = 'completado';
                tema._completado = true;
                tema._fechaCompletado = Date.now();
                await db.update('temas', tema);
                this._log(`✅ Tema "${tema.nombre}" marcado como completado`);
            } else if (!todasCompletadas && tema.estado === 'completado') {
                tema.estado = 'en_curso';
                tema._completado = false;
                delete tema._fechaCompletado;
                await db.update('temas', tema);
                this._log(`🔄 Tema "${tema.nombre}" reabierto (no todas las historias completadas)`);
            }

            window.dispatchEvent(new CustomEvent('temaCompletado', {
                detail: {
                    idioma: idioma,
                    temaId: temaOriginalId,
                    temaDbId: tema.id,
                    completado: todasCompletadas,
                    tema: tema,
                    origen: 'gestor_progreso'
                }
            }));

            this._log(`✅ Sincronización con Temas completada`);
        } catch (error) {
            this._log(`Error sincronizando con Temas: ${error.message}`, 'error');
        }
    }

    async _reabrirTemaSiCompletado(temaId) {
        try {
            const tema = await db.obtenerTema(temaId);
            if (!tema) return;

            const historias = await db.obtenerHistoriasPorTema(temaId);
            const todasCompletadas = historias.every(h => h.estado === 'completada' || h._completada === true);

            if ((tema.estado === 'completado' || tema._completado === true) && !todasCompletadas) {
                this._log(`🔄 Reabriendo tema "${tema.nombre}" porque una historia se desmarcó.`);
                tema.estado = 'en_curso';
                tema._completado = false;
                delete tema._fechaCompletado;
                await db.update('temas', tema);

                const idioma = tema.idioma || 'es';
                const temaOriginalId = tema._temaOriginalId || tema.id;
                window.dispatchEvent(new CustomEvent('temaCompletado', {
                    detail: {
                        idioma: idioma,
                        temaId: temaOriginalId,
                        temaDbId: tema.id,
                        completado: false,
                        tema: tema,
                        origen: 'gestor_progreso'
                    }
                }));
                this._log(`✅ Tema "${tema.nombre}" reabierto`);
            }
        } catch (error) {
            this._log(`Error reabriendo tema: ${error.message}`, 'error');
        }
    }

    _dispararEventoEstadoCambiado(historiaId, completado, origen, esOnda, esOndaCruzada, rcn) {
        // 🔥 DETERMINAR TIPO CORRECTO
        let tipo = 'historia';
        if (esOndaCruzada) {
            tipo = 'onda_cruzada';
        } else if (esOnda) {
            tipo = 'onda_elipse';
        }

        window.dispatchEvent(new CustomEvent('historiaEstadoCambiado', {
            detail: {
                historiaId: historiaId,
                completado: completado,
                origen: origen,
                tipo: tipo,
                rcn: rcn || 0,
                esOndaCruzada: esOndaCruzada,
                esOnda: esOnda
            }
        }));

        // Disparar eventos específicos
        if (esOnda) {
            window.dispatchEvent(new CustomEvent('elipseEstadoActualizado', {
                detail: { historiaId, completado, rcn: rcn || 0 }
            }));
        }
        if (esOndaCruzada) {
            window.dispatchEvent(new CustomEvent('ondasCruzadasEstadoActualizado', {
                detail: { historiaId, completado, rcn: rcn || 0 }
            }));
        }

        this._log(`📡 Eventos disparados (tipo: ${tipo})`);
    }
}

const gestorProgresoHistorias = new GestorProgresoHistorias();
window.gestorProgresoHistorias = gestorProgresoHistorias;

window.addEventListener('uiNeedsRefresh', (e) => {
    console.log('🔄 UI Needs Refresh - Refrescando vistas...');
    const detail = e.detail || {};
    
    // Refrescar Elipse si es necesario
    if (detail.esOnda && window.UIClipse && !window.UIClipse._visorAbierto) {
        setTimeout(() => {
            window.UIClipse._renderizarPanel(window.UIClipse._temaId);
        }, 100);
    }
    
    // Refrescar Ondas Cruzadas
    if (window.UIOndasCruzadas) {
        setTimeout(() => {
            window.UIOndasCruzadas._cargarDatos().then(() => {
                window.UIOndasCruzadas._renderizarPanel();
            });
        }, 150);
    }
    
    // Refrescar Temas
    if (window.UITemas) {
        setTimeout(() => {
            if (window.UITemas.modoVistaTemas === 'detalle') {
                window.UITemas._verTemaDetalle(window.UITemas.temaSeleccionado);
            } else {
                window.UITemas._renderTemas();
            }
        }, 150);
    }
});

console.log('✅ GestorProgresoHistorias v2.1 cargado correctamente.');
console.log('  🔥 SOPORTE COMPLETO PARA ONDAS CRUZADAS');
console.log('  🔥 NO intenta sincronizar ondas cruzadas con Elipse');
console.log('  🔥 Actualización de RCN al marcar/desmarcar');
console.log('  🔥 Forzado de RCN a 4.0 mínimo al completar');
console.log('  🔥 Evita reversión por SRS en cambios manuales');
console.log('  🔥 Reapertura automática de temas');
console.log('  🔥 Sincronización bidireccional completa (Elipse ↔ Temas ↔ Ondas Cruzadas)');