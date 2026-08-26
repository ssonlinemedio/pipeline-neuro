// ============================================================
// GESTOR CENTRAL DE PROGRESO DE HISTORIAS/ONDAS v2.3
// CON SINCRONIZACIÓN FORZADA A BASE DE DATOS
// ============================================================

class GestorProgresoHistorias {
    constructor() {
        this._eventosRegistrados = false;
        this._debug = true;
        this._procesando = new Set();
        this._ultimoCambio = {};
        this._cambioManual = {};
        this._registrarEventos();
        this._inicializarEscuchas();
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

    _inicializarEscuchas() {
        window.addEventListener('historiaEstadoCambiado', async (e) => {
            const detail = e.detail;
            if (!detail) return;
            if (detail.origen !== 'gestor_progreso' && detail.historiaId) {
                this._log(`🔄 Evento externo recibido: ${detail.historiaId} -> ${detail.completado}`, 'info');
                const historia = await db.get('historias', detail.historiaId);
                if (historia) {
                    const estadoActual = historia.estado === 'completada' || historia._completada === true;
                    if (estadoActual !== detail.completado) {
                        this._log(`⚠️ Inconsistencia detectada: estado actual ${estadoActual} vs evento ${detail.completado}`, 'warn');
                        await this.cambiarEstadoHistoria(detail.historiaId, estadoActual, 'sincronizacion_forzada');
                    }
                }
            }
        });

        window.addEventListener('temaCompletado', async (e) => {
            const detail = e.detail;
            if (!detail) return;
            if (detail.origen === 'gestor_progreso') return;
            
            this._log(`🔄 Tema completado event recibido: ${detail.temaId} -> ${detail.completado}`, 'info');
            
            // 🔥 FORZAR SINCRONIZACIÓN COMPLETA
            await this._sincronizarTemaCompleto(detail.temaDbId || detail.temaId, detail.completado);
        });

        this._log('✅ Escuchas inicializadas');
    }

    // ============================================================
    // 🔥 NUEVO: SINCRONIZACIÓN FORZADA DE TEMA COMPLETO
    // ============================================================

    async _sincronizarTemaCompleto(temaId, completado) {
        this._log(`🔥 Sincronizando tema ${temaId} -> ${completado ? 'completado' : 'no completado'}`);
        
        try {
            const tema = await db.obtenerTema(temaId);
            if (!tema) {
                this._log(`❌ Tema ${temaId} no encontrado`, 'error');
                return;
            }

            // Obtener todas las historias del tema
            const historias = await db.obtenerHistoriasPorTema(temaId);
            this._log(`📚 Tiene ${historias.length} historias`);

            if (completado) {
                // 🔥 MARCAR TODAS LAS HISTORIAS COMO COMPLETADAS
                this._log(`🌊 Marcando todas las ${historias.length} historias como completadas`);
                for (const h of historias) {
                    const estaCompletada = h.estado === 'completada' || h._completada === true;
                    if (!estaCompletada) {
                        await this.cambiarEstadoHistoria(h.id, true, 'tema_completado_cascada');
                    }
                }
            } else {
                // 🔥 DESMARCAR TODAS LAS HISTORIAS (Solo si el tema se desmarca manualmente)
                this._log(`🌊 Desmarcando todas las ${historias.length} historias`);
                for (const h of historias) {
                    const estaCompletada = h.estado === 'completada' || h._completada === true;
                    if (estaCompletada) {
                        await this.cambiarEstadoHistoria(h.id, false, 'tema_desmarcado_cascada');
                    }
                }
            }

            // 🔥 VERIFICAR Y ACTUALIZAR ESTADO REAL DEL TEMA
            await this._verificarYActualizarEstadoTema(temaId);

            // 🔥 FORZAR ACTUALIZACIÓN DE TODOS LOS MÓDULOS
            await this._forzarActualizacionGlobal();

            this._log(`✅ Sincronización completa del tema "${tema.nombre}"`);
            
        } catch (error) {
            this._log(`❌ Error sincronizando tema: ${error.message}`, 'error');
        }
    }

    // ============================================================
    // CAMBIAR ESTADO DE UNA HISTORIA
    // ============================================================

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

            const esOndaCruzada = historia._esOndaCruzada === true;
            const esOnda = historia._esOnda === true && !esOndaCruzada;
            const esBase = historia._esBase === true || historia._esOnda === false;

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
                    } else {
                        elipseHistoria._sincronizado = false;
                        elipseHistoria._fechaSincronizacion = null;
                    }
                    
                    window.modoElipse._guardarEstadoElipse();
                    await window.modoElipse._guardarEnIndexedDB();
                    this._log(`✅ ${esBase ? 'BASE' : 'Onda'} Elipse actualizada: completada=${elipseHistoria.completada}, RCN=${elipseHistoria.rcnPromedio.toFixed(1)}`);
                }
            } else if (esOndaCruzada) {
                this._log(`🌊 Onda CRUZADA ${historiaId}: estado actualizado, sin sincronización con Elipse`);
                
                if (window.modoOndasCruzadas) {
                    try {
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

            // 🔥 VERIFICAR Y ACTUALIZAR ESTADO DEL TEMA
            await this._verificarYActualizarEstadoTema(historia.temaId);

            // 🔥 DISPARAR EVENTO DE ESTADO CAMBIADO
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

    // ============================================================
    // VERIFICAR Y ACTUALIZAR ESTADO DEL TEMA
    // ============================================================

    async _verificarYActualizarEstadoTema(temaId) {
        try {
            if (!temaId) return;
            
            const tema = await db.obtenerTema(temaId);
            if (!tema) {
                this._log(`⚠️ Tema ${temaId} no encontrado para verificación`, 'warn');
                return;
            }

            const historias = await db.obtenerHistoriasPorTema(temaId);
            if (historias.length === 0) {
                this._log(`ℹ️ Tema "${tema.nombre}" no tiene historias`);
                return;
            }

            let completadas = 0;
            for (const h of historias) {
                if (h.estado === 'completada' || h._completada === true) {
                    completadas++;
                }
            }

            const total = historias.length;
            const todasCompletadas = completadas === total && total > 0;
            const estaCompletado = tema.estado === 'completado' || tema._completado === true;

            // 🔥 ACTUALIZAR PROGRESO REAL
            tema._progreso = Math.round((completadas / total) * 100);
            tema._historiasCompletadas = completadas;
            tema._historiasTotales = total;

            if (todasCompletadas && !estaCompletado) {
                tema.estado = 'completado';
                tema._completado = true;
                tema._fechaCompletado = Date.now();
                await db.update('temas', tema);
                this._log(`🎯 Tema "${tema.nombre}" marcado como COMPLETADO (${completadas}/${total})`);

                const idioma = tema.idioma || 'es';
                const temaOriginalId = tema._temaOriginalId || tema.id;
                window.dispatchEvent(new CustomEvent('temaCompletado', {
                    detail: {
                        idioma: idioma,
                        temaId: temaOriginalId,
                        temaDbId: tema.id,
                        completado: true,
                        tema: tema,
                        origen: 'gestor_progreso',
                        progreso: 100
                    }
                }));

                if (window.UITemas && window.UITemas._core) {
                    window.UITemas._core.mostrarToast(`🎉 Tema "${tema.nombre}" completado al 100%`, 'success');
                }

            } else if (!todasCompletadas && estaCompletado) {
                tema.estado = 'en_curso';
                tema._completado = false;
                delete tema._fechaCompletado;
                await db.update('temas', tema);
                this._log(`🔄 Tema "${tema.nombre}" REABIERTO (${completadas}/${total})`);

                const idioma = tema.idioma || 'es';
                const temaOriginalId = tema._temaOriginalId || tema.id;
                window.dispatchEvent(new CustomEvent('temaCompletado', {
                    detail: {
                        idioma: idioma,
                        temaId: temaOriginalId,
                        temaDbId: tema.id,
                        completado: false,
                        tema: tema,
                        origen: 'gestor_progreso',
                        progreso: Math.round((completadas / total) * 100)
                    }
                }));

            } else {
                await db.update('temas', tema);
                this._log(`📊 Progreso del tema "${tema.nombre}" actualizado: ${tema._progreso}% (${completadas}/${total})`);
            }

            // 🔥 DISPARAR EVENTO PARA ACTUALIZAR UI
            window.dispatchEvent(new CustomEvent('progresoTemaActualizado', {
                detail: {
                    temaId: tema.id,
                    temaNombre: tema.nombre,
                    progreso: tema._progreso,
                    completadas: completadas,
                    total: total,
                    completado: todasCompletadas
                }
            }));

            return { completadas, total, progreso: tema._progreso, completado: todasCompletadas };
        } catch (error) {
            this._log(`❌ Error verificando estado del tema: ${error.message}`, 'error');
            return null;
        }
    }

    // ============================================================
    // FORZAR ACTUALIZACIÓN GLOBAL
    // ============================================================

    async _forzarActualizacionGlobal() {
        this._log(`🔥 Forzando actualización global de UI...`);

        // Actualizar Temas
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

        // Actualizar Elipse
        if (window.UIClipse) {
            try {
                await window.UIClipse._renderizarPanel(window.UIClipse._temaId);
                this._log(`✅ UI Elipse actualizada`);
            } catch (e) {
                this._log(`Error actualizando Elipse: ${e.message}`, 'warn');
            }
        }

        // Actualizar Ondas Cruzadas
        if (window.UIOndasCruzadas) {
            try {
                await window.UIOndasCruzadas._cargarDatos();
                await window.UIOndasCruzadas._renderizarPanel();
                this._log(`✅ UI Ondas Cruzadas actualizada`);
            } catch (e) {
                this._log(`Error actualizando Ondas Cruzadas: ${e.message}`, 'warn');
            }
        }

        // Actualizar Dashboard
        if (window.UIDashboard) {
            try {
                await window.UIDashboard._cargarDashboardInicial(window.uiCore);
                this._log(`✅ Dashboard actualizado`);
            } catch (e) {
                this._log(`Error actualizando Dashboard: ${e.message}`, 'warn');
            }
        }

        // Disparar evento global
        window.dispatchEvent(new CustomEvent('uiNeedsRefresh', {
            detail: {
                timestamp: Date.now(),
                origen: 'global_sync'
            }
        }));

        this._log(`✅ Actualización global completada`);
    }

    async _forzarActualizacionUI(historiaId, completado, esOnda, esOndaCruzada) {
        this._log(`🔄 Forzando actualización de UI...`);

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

        if (window.UIOndasCruzadas) {
            try {
                await window.UIOndasCruzadas._cargarDatos();
                await window.UIOndasCruzadas._renderizarPanel();
                this._log(`✅ UI Ondas Cruzadas actualizada`);
            } catch (e) {
                this._log(`Error actualizando Ondas Cruzadas: ${e.message}`, 'warn');
            }
        }

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

        if (window.UIDashboard) {
            try {
                await window.UIDashboard._cargarDashboardInicial(window.uiCore);
                this._log(`✅ Dashboard actualizado`);
            } catch (e) {
                this._log(`Error actualizando Dashboard: ${e.message}`, 'warn');
            }
        }

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

    _dispararEventoEstadoCambiado(historiaId, completado, origen, esOnda, esOndaCruzada, rcn) {
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
    
    if (detail.esOnda && window.UIClipse && !window.UIClipse._visorAbierto) {
        setTimeout(() => {
            window.UIClipse._renderizarPanel(window.UIClipse._temaId);
        }, 100);
    }
    
    if (window.UIOndasCruzadas) {
        setTimeout(() => {
            window.UIOndasCruzadas._cargarDatos().then(() => {
                window.UIOndasCruzadas._renderizarPanel();
            });
        }, 150);
    }
    
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

console.log('✅ GestorProgresoHistorias v2.3 - CON SINCRONIZACIÓN FORZADA');
console.log('  🔥 Sincronización FORZADA a base de datos');
console.log('  🔥 Cascada completa: marcar tema marca todas sus historias');
console.log('  🔥 Verificación en tiempo real del progreso');
console.log('  🔥 Soporte completo para Elipse y Ondas Cruzadas');