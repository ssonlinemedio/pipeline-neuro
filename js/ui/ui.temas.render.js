// ============================================================
// UI TEMAS RENDER v2.36 - CORREGIDO: Sincronización de checkbox y estado del tema
// ============================================================

class UITemasRender {
    // ============================================================
    // RENDERIZAR TEMAS - VISTA UNIFICADA CON PESTAÑAS
    // ============================================================

    static async renderTemas(uiTemas) {
        const container = uiTemas._getContainer();
        if (!container) {
            console.warn('⚠️ UITemasRender.renderTemas: container no encontrado');
            return;
        }

        try {
            await uiTemas._cargarMapaTemasPredefinidos();
            await gestorIdiomas._cargarIdiomas();

            const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
            uiTemas._idiomaActual = idiomaActivo;

            const versionEstandar = uiTemas._obtenerVersionEstandar(idiomaActivo);
            const nombreVersion = uiTemas._obtenerNombreVersion(idiomaActivo, versionEstandar);

            const todosLosTemas = await db.obtenerTemasPorIdioma(idiomaActivo);
            const usuario = await db.getUsuario();
            const nivelActual = usuario?.idiomasObjetivo?.find(i => i.idioma === idiomaActivo)?.nivel || 'A1';
            const idiomaNativo = uiTemas._obtenerIdiomaNativo();

            const temasManuales = todosLosTemas.filter(t =>
                t.origen !== 'importado' && !t._esPredefinido && !t._esImportado &&
                t.idioma === idiomaActivo
            );

            const temasImportados = todosLosTemas.filter(t =>
                (t.origen === 'importado' || t._esImportado === true ||
                (t._esPredefinido === true && t.historiasIds && t.historiasIds.length > 0)) &&
                t.idioma === idiomaActivo
            );

            const temasPredefinidosGuardados = todosLosTemas.filter(t => 
                t._esPredefinido === true && 
                t.idioma === idiomaActivo
            );

            const temasGuardadosIds = new Set(temasPredefinidosGuardados.map(t => t._temaOriginalId));

            if (!uiTemas._pestanaActiva) {
                uiTemas._pestanaActiva = 'todos';
            }

            let html = '';

            html += `
                <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center;">
                    <div style="flex:2;min-width:200px;position:relative;">
                        <i class="fas fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gray);"></i>
                        <input type="text" id="buscarTemasInput" placeholder="🔍 Buscar temas por nombre, descripción..." 
                               style="width:100%;padding:10px 14px 10px 38px;border:2px solid var(--light);border-radius:10px;font-size:14px;font-family:var(--font);transition:all 0.3s;"
                               oninput="window.UITemasRender.filtrarTemas()">
                    </div>
                    <span style="font-size:12px;color:var(--gray-light);" id="resultadosBusquedaTemas"></span>
                    <span style="font-size:11px;color:var(--gray-light);">🎤 ${uiTemas._getNombreIdioma(idiomaNativo)}</span>
                    <span style="font-size:11px;color:var(--primary);font-weight:600;">🌍 ${uiTemas._getNombreIdioma(idiomaActivo)}</span>
                    <span style="font-size:11px;color:var(--secondary);font-weight:600;">📌 ${nombreVersion}</span>
                </div>
            `;

            const pestanas = [
                { id: 'todos', label: '📚 Todos', count: todosLosTemas.length },
                { id: 'manuales', label: '📁 Mis Temas', count: temasManuales.length },
                { id: 'importados', label: '📥 Importados', count: temasImportados.length },
                { id: 'predefinidos', label: '🎯 Predefinidos', count: temasPredefinidosGuardados.length }
            ];

            html += `
                <div style="display:flex;gap:6px;margin-bottom:16px;border-bottom:2px solid var(--light);padding-bottom:8px;flex-wrap:wrap;align-items:center;">
                    ${pestanas.map(p => `
                        <button class="btn-secondary" 
                                onclick="window.UITemasRender._cambiarPestana('${p.id}')" 
                                style="padding:6px 16px;font-size:12px;border-radius:20px;border:2px solid ${uiTemas._pestanaActiva === p.id ? 'var(--primary)' : 'var(--light)'};background:${uiTemas._pestanaActiva === p.id ? 'var(--primary)' : 'var(--white)'};color:${uiTemas._pestanaActiva === p.id ? 'white' : 'var(--dark)'};cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.02)'" 
                                onmouseout="this.style.transform='none'">
                            ${p.label} 
                            <span style="font-size:10px;opacity:0.7;${uiTemas._pestanaActiva === p.id ? 'color:rgba(255,255,255,0.8);' : ''}">(${p.count})</span>
                        </button>
                    `).join('')}
                    <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
                        <span style="font-size:11px;color:var(--gray);">${uiTemas._ocultarCompletados ? '🔒 Ocultando completados' : '👁️ Mostrando todos'}</span>
                        <button class="btn-secondary" onclick="window.UITemas._alternarOcultarCompletados()" 
                                style="padding:4px 14px;font-size:11px;${uiTemas._ocultarCompletados ? 'background:var(--primary);color:white;' : 'background:var(--bg);'}"
                                onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                            ${uiTemas._ocultarCompletados ? '👁️ Mostrar' : '🔒 Ocultar'} completados
                        </button>
                    </div>
                </div>
            `;

            let temasMostrar = [];
            switch (uiTemas._pestanaActiva) {
                case 'manuales':
                    temasMostrar = temasManuales;
                    break;
                case 'importados':
                    temasMostrar = temasImportados;
                    break;
                case 'predefinidos':
                    temasMostrar = temasPredefinidosGuardados;
                    break;
                case 'todos':
                default:
                    temasMostrar = todosLosTemas;
                    break;
            }

            let temasFiltrados = temasMostrar;
            if (uiTemas._ocultarCompletados) {
                const temasFiltradosPromises = temasMostrar.map(async (tema) => {
                    let estaCompletado = tema.estado === 'completado' || tema._completado === true;
                    if (tema._temaOriginalId) {
                        estaCompletado = await uiTemas._temaEstaCompletado(idiomaActivo, tema._temaOriginalId);
                    }
                    return { tema, estaCompletado };
                });
                const resultados = await Promise.all(temasFiltradosPromises);
                temasFiltrados = resultados.filter(r => !r.estaCompletado).map(r => r.tema);
            }

            const ITEMS_POR_PAGINA = 6;
            const totalItems = temasFiltrados.length;
            const totalPaginas = Math.max(1, Math.ceil(totalItems / ITEMS_POR_PAGINA));
            const key = `pagina_${uiTemas._pestanaActiva}`;
            let paginaActual = uiTemas[key] || 1;
            if (paginaActual < 1) paginaActual = 1;
            if (paginaActual > totalPaginas) paginaActual = totalPaginas;
            uiTemas[key] = paginaActual;

            const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
            const fin = Math.min(inicio + ITEMS_POR_PAGINA, totalItems);
            const itemsPagina = temasFiltrados.slice(inicio, fin);

            const totalSinFiltros = temasMostrar.length;
            const totalFiltrados = temasFiltrados.length;

            html += `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:4px;">
                    <span style="font-size:13px;color:var(--gray);">
                        Mostrando <strong>${itemsPagina.length}</strong> de <strong>${totalFiltrados}</strong> temas
                        ${totalFiltrados !== totalSinFiltros ? `(filtrados de ${totalSinFiltros})` : ''}
                        ${totalPaginas > 1 ? `· Página ${paginaActual} de ${totalPaginas}` : ''}
                    </span>
                    ${uiTemas._ocultarCompletados && totalFiltrados === 0 && totalSinFiltros > 0 ? `
                        <span style="font-size:11px;color:var(--gray-light);">
                            💡 Todos los temas están completados. Usa "Mostrar completados" para verlos.
                        </span>
                    ` : ''}
                </div>
            `;

            if (itemsPagina.length === 0) {
                html += `
                    <div style="text-align:center;padding:40px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">
                        <i class="fas fa-folder-open" style="font-size:48px;color:var(--primary-light);display:block;margin-bottom:16px;"></i>
                        <p style="font-size:16px;font-weight:500;">No hay temas en esta sección</p>
                        <p style="font-size:13px;color:var(--gray-light);">
                            ${uiTemas._pestanaActiva === 'manuales' ? 'Crea tu primer tema o importa contenido.' :
                              uiTemas._pestanaActiva === 'importados' ? 'Importa temas desde el generador JSON.' :
                              uiTemas._pestanaActiva === 'predefinidos' ? 'Los temas predefinidos aparecerán aquí al importarlos.' :
                              'Genera o importa contenido para empezar.'}
                        </p>
                    </div>
                `;
            } else {
                html += `<div id="temasContainer" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">`;

                const temasMostradosSet = new Set();

                for (const tema of itemsPagina) {
                    if (temasMostradosSet.has(tema.id)) continue;
                    temasMostradosSet.add(tema.id);

                    const esPredefinido = tema._esPredefinido === true;
                    const esImportado = tema.origen === 'importado' || tema._esImportado === true;
                    const esManual = !esPredefinido && !esImportado;

                    // 🔥 OBTENER ESTADO REAL DEL TEMA
                    let estaCompletado = tema.estado === 'completado' || tema._completado === true;
                    let temaIdParaCompletado;

                    if (esPredefinido && tema._temaOriginalId) {
                        temaIdParaCompletado = tema._temaOriginalId;
                        estaCompletado = await uiTemas._temaEstaCompletado(idiomaActivo, tema._temaOriginalId);
                    } else {
                        temaIdParaCompletado = tema.id;
                        estaCompletado = tema.estado === 'completado' || tema._completado === true;
                    }

                    // 🔥 RECALCULAR PROGRESO REAL
                    const historias = await db.obtenerHistoriasPorTema(tema.id);
                    let historiasCompletadas = 0;
                    for (const h of historias) {
                        if (h.estado === 'completada' || h._completada === true) {
                            historiasCompletadas++;
                        }
                    }
                    const progresoReal = historias.length > 0 ? Math.round((historiasCompletadas / historias.length) * 100) : 0;
                    
                    // 🔥 SI EL PROGRESO ES 100%, FORZAR QUE EL TEMA ESTÉ COMPLETADO
                    if (progresoReal === 100 && historias.length > 0 && !estaCompletado) {
                        estaCompletado = true;
                        tema.estado = 'completado';
                        tema._completado = true;
                        tema._fechaCompletado = Date.now();
                        await db.update('temas', tema);
                        console.log(`🎯 Tema "${tema.nombre}" marcado como completado (progreso 100%)`);
                    }
                    
                    // Actualizar progreso en el tema
                    if (progresoReal !== tema._progreso) {
                        tema._progreso = progresoReal;
                        tema._historiasCompletadas = historiasCompletadas;
                        tema._historiasTotales = historias.length;
                        await db.update('temas', tema);
                    }

                    const pctProgreso = tema._progreso || progresoReal || 0;
                    const estaSincronizado = tema._caracteresSincronizados === true;
                    const numCaracteres = tema._caracteresSincronizadosCount || 0;
                    const fechaSincro = tema._fechaSincronizacion ? new Date(tema._fechaSincronizacion).toLocaleDateString() : '';

                    let borderColor = 'var(--primary)';
                    let origenLabel = '';
                    let origenColor = 'var(--primary)';
                    let cardBackground = 'var(--white)';
                    
                    if (esManual) {
                        borderColor = 'var(--primary)';
                        origenLabel = '📁 Manual';
                        origenColor = 'var(--primary)';
                    } else if (esImportado) {
                        borderColor = 'var(--secondary)';
                        origenLabel = '📥 Importado';
                        origenColor = 'var(--secondary)';
                    } else if (esPredefinido) {
                        borderColor = 'var(--primary)';
                        origenLabel = '📚 Predefinido';
                        origenColor = 'var(--primary)';
                    }
                    
                    // 🔥 SI EL TEMA ESTÁ COMPLETADO, PONER EN VERDE
                    if (estaCompletado) {
                        borderColor = 'var(--success)';
                        cardBackground = 'var(--success)05';
                    }

                    let ondasElipse = 0;
                    let ondasCruzadas = 0;
                    for (const h of historias) {
                        if (h._esOnda === true) ondasElipse++;
                        if (h._esOndaCruzada === true) ondasCruzadas++;
                    }

                    html += `
                        <div class="tema-card" style="background:${cardBackground};border-radius:12px;padding:14px 16px;box-shadow:var(--shadow);border-left:4px solid ${borderColor};cursor:pointer;transition:all 0.3s;" 
                             onclick="window.UITemas._verTemaDetalle(${tema.id})">
                            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px;">
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <span style="font-size:28px;">${tema.icono || '📁'}</span>
                                    <div>
                                        <h4 style="font-size:15px;font-weight:700;color:var(--dark);margin:0;">${tema.nombre}</h4>
                                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:2px;">
                                            <span style="font-size:11px;color:var(--gray);">${tema.idioma || idiomaActivo} · ${tema.nivel || nivelActual}</span>
                                            <span style="font-size:9px;background:${origenColor}15;color:${origenColor};padding:1px 8px;border-radius:10px;">${origenLabel}</span>
                                            ${tema._nombre_version ? `<span style="font-size:9px;color:var(--secondary);padding:1px 8px;border-radius:10px;">📌 ${tema._nombre_version}</span>` : ''}
                                            ${estaCompletado ? `
                                                <span style="font-size:9px;background:var(--success);color:white;padding:1px 10px;border-radius:12px;">
                                                    ✅ Completado
                                                </span>
                                            ` : ''}
                                            ${estaSincronizado ? `
                                                <span style="font-size:9px;background:var(--success);color:white;padding:1px 10px;border-radius:12px;" 
                                                      title="Sincronizado el ${fechaSincro} - ${numCaracteres} caracteres">
                                                    ✅ ${numCaracteres} caracteres
                                                </span>
                                            ` : ''}
                                            ${ondasElipse > 0 ? `
                                                <span style="font-size:9px;background:#6C5CE7;color:white;padding:1px 10px;border-radius:12px;" 
                                                      title="${ondasElipse} ondas Elipse">
                                                    🌌 ${ondasElipse}
                                                </span>
                                            ` : ''}
                                            ${ondasCruzadas > 0 ? `
                                                <span style="font-size:9px;background:#00CEC9;color:white;padding:1px 10px;border-radius:12px;" 
                                                      title="${ondasCruzadas} ondas Cruzadas">
                                                    🌊 ${ondasCruzadas}
                                                </span>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                                <span style="font-size:11px;font-weight:600;color:${estaCompletado ? 'var(--success)' : 'var(--warning)'};">${estaCompletado ? '✅ Completado' : '📖 En curso'}</span>
                            </div>
                            <div style="display:flex;gap:12px;margin-bottom:6px;font-size:11px;color:var(--gray);">
                                <span>📚 ${historias.length} historias</span>
                                <span>📝 ${tema.frases || 0} frases</span>
                                <span>🎤 ${uiTemas._getNombreIdioma(idiomaNativo)}</span>
                                <span>✅ ${historiasCompletadas}/${historias.length} completadas</span>
                                ${ondasElipse > 0 ? `<span>🌌 ${ondasElipse}</span>` : ''}
                                ${ondasCruzadas > 0 ? `<span>🌊 ${ondasCruzadas}</span>` : ''}
                            </div>
                            <div style="height:3px;background:var(--bg);border-radius:2px;overflow:hidden;">
                                <div style="height:100%;width:${pctProgreso}%;background:${estaCompletado ? 'var(--success)' : 'linear-gradient(90deg,var(--primary),var(--secondary))'};border-radius:2px;transition:width 0.5s ease;"></div>
                            </div>
                            <div style="display:flex;justify-content:space-between;margin-top:3px;font-size:10px;color:var(--gray);">
                                <span>Progreso</span>
                                <span>${pctProgreso}%</span>
                            </div>
                            <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;">
                                ${!estaCompletado ? `
                                    <button class="btn-secondary" onclick="event.stopPropagation();window.UITemas._estudiarTema(${tema.id})" style="padding:3px 10px;font-size:11px;">
                                        <i class="fas fa-play"></i> Estudiar
                                    </button>
                                ` : `
                                    <button class="btn-secondary" onclick="event.stopPropagation();window.UIStudy._mostrarMensajeTemaCompletado()" 
                                            style="padding:3px 10px;font-size:11px;opacity:0.6;cursor:pointer;background:var(--gray-light);color:var(--gray);">
                                        <i class="fas fa-check-circle"></i> Completado
                                    </button>
                                `}
                                <button class="btn-secondary" onclick="event.stopPropagation();window.UITemas._exportarTema(${tema.id})" style="padding:3px 10px;font-size:11px;"><i class="fas fa-download"></i> Exportar</button>
                                
                                <label class="tema-completado-checkbox ${estaCompletado ? 'checked' : ''}" 
                                       style="padding:2px 10px;font-size:10px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;background:${estaCompletado ? 'var(--success)08' : 'var(--bg)'};border:1px solid ${estaCompletado ? 'var(--success)' : 'var(--light)'};border-radius:12px;"
                                       onclick="event.stopPropagation();">
                                    <input type="checkbox" ${estaCompletado ? 'checked' : ''} 
                                           onchange="(async () => {
                                               await window.UITemas._marcarTemaCompletado('${idiomaActivo}', '${temaIdParaCompletado}', this.checked);
                                               // 🔥 FORZAR RECARGA DE LA VISTA
                                               setTimeout(() => {
                                                   window.UITemas._renderTemas();
                                               }, 300);
                                           })()"
                                           style="margin:0;width:14px;height:14px;cursor:pointer;">
                                    <span style="font-size:9px;color:${estaCompletado ? 'var(--success)' : 'var(--gray)'};">${estaCompletado ? '✅ Completado' : 'Completar'}</span>
                                </label>
                                
                                <button class="btn-danger" onclick="event.stopPropagation();window.UITemas._eliminarTema(${tema.id})" style="padding:3px 10px;font-size:11px;background:#FF7675;color:white;border:none;border-radius:4px;cursor:pointer;"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                }

                html += `</div>`;
            }

            if (totalPaginas > 1) {
                html += UITemasRender._renderPaginador(
                    paginaActual,
                    totalPaginas,
                    uiTemas._pestanaActiva,
                    `Mostrando ${inicio + 1} - ${Math.min(fin, totalItems)} de ${totalItems} temas`
                );
            }

            html += `
                <div style="margin-top:24px;border-top:2px solid var(--light);padding-top:16px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                        <div>
                            <h3 style="font-size:18px;font-weight:700;color:var(--dark);margin:0;">
                                🎯 Temas Predefinidos por Nivel
                                <span style="font-size:13px;font-weight:400;color:var(--gray);">(${uiTemas._getNombreIdioma(idiomaActivo)})</span>
                            </h3>
                            <span style="font-size:12px;color:var(--gray-light);">Nivel actual: <strong>${nivelActual}</strong></span>
                            <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">📌 ${nombreVersion}</span>
                        </div>
                        <span style="font-size:11px;color:var(--gray);">💡 Haz clic en "Generar JSON" para importar un tema</span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:12px;">
            `;

            for (const nivel of uiTemas.NIVELES) {
                const temasNivel = uiTemas._obtenerTemasPorNivelYVersion(versionEstandar, nivel);
                
                if (temasNivel.length === 0) continue;
                
                const estaDesbloqueado = await uiTemas._nivelEstaDesbloqueado(idiomaActivo, nivel);
                const esActual = nivel === nivelActual;
                const progresoNivel = await uiTemas._obtenerProgresoNivel(idiomaActivo, nivel, versionEstandar);

                const estaBloqueado = !estaDesbloqueado && !esActual;
                const claseBloqueado = estaBloqueado ? 'nivel-bloqueado' : '';

                let bgColor = 'var(--white)';
                let borderColor = 'var(--light)';
                let opacidad = '1';

                if (estaBloqueado) {
                    bgColor = 'var(--bg)';
                    borderColor = 'var(--gray-light)';
                    opacidad = '0.6';
                } else if (esActual) {
                    borderColor = 'var(--primary)';
                    bgColor = 'var(--primary)04';
                }

                html += `
                    <div class="${claseBloqueado}" style="background:${bgColor};border-radius:10px;border:2px solid ${borderColor};padding:12px 14px;opacity:${opacidad};transition:all 0.3s;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:4px;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span style="font-size:16px;font-weight:700;color:${estaBloqueado ? 'var(--gray)' : 'var(--dark)'};">
                                    ${uiTemas.EMOJIS_NIVEL[nivel] || '📚'} Nivel ${nivel}
                                </span>
                                ${esActual ? '<span style="font-size:10px;background:var(--primary);color:white;padding:2px 10px;border-radius:12px;">🎯 ACTUAL</span>' : ''}
                                ${estaBloqueado ? '<span style="font-size:10px;background:var(--danger);color:white;padding:2px 10px;border-radius:12px;">🔒 BLOQUEADO</span>' : ''}
                                <span style="font-size:9px;color:var(--secondary);background:var(--secondary)10;padding:1px 8px;border-radius:8px;">${temasNivel.length} temas</span>
                            </div>
                            <span style="font-size:11px;color:var(--gray);">${nombreVersion}</span>
                        </div>

                        ${!estaBloqueado ? `
                            <div style="margin-bottom:8px;">
                                <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray);margin-bottom:2px;">
                                    <span>📊 Progreso del nivel</span>
                                    <span>${progresoNivel.porcentaje}% (${progresoNivel.completados}/${progresoNivel.total} temas)</span>
                                </div>
                                <div style="height:4px;background:var(--bg);border-radius:2px;overflow:hidden;">
                                    <div style="height:100%;width:${progresoNivel.porcentaje}%;background:${progresoNivel.porcentaje >= 80 ? 'var(--success)' : progresoNivel.porcentaje >= 40 ? 'var(--warning)' : 'var(--primary)'};border-radius:2px;transition:width 0.8s ease;"></div>
                                </div>
                            </div>
                        ` : `
                            <div style="margin-bottom:8px;font-size:10px;color:var(--gray-light);">
                                🔒 Completa el nivel anterior (${uiTemas.NIVELES[uiTemas.NIVELES.indexOf(nivel) - 1]}) para desbloquear
                            </div>
                        `}

                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;">
                `;

                for (const tema of temasNivel) {
                    const estaDisponible = !estaBloqueado || esActual;
                    
                    let estaGuardado = temasGuardadosIds.has(tema.id);
                    let temaEnDB = null;
                    let dbId = null;
                    let estaCompletado = false;
                    
                    if (estaGuardado) {
                        const temaExistente = await uiTemas._obtenerTemaPredefinidoPorIdioma(tema.id, idiomaActivo);
                        if (temaExistente) {
                            temaEnDB = temaExistente;
                            dbId = temaExistente.id;
                            estaCompletado = temaExistente.estado === 'completado' || temaExistente._completado === true;
                        } else {
                            estaGuardado = false;
                        }
                    }

                    if (!estaGuardado) {
                        estaCompletado = await uiTemas._temaEstaCompletado(idiomaActivo, tema.id);
                    }

                    if (estaCompletado && uiTemas._ocultarCompletados) {
                        continue;
                    }

                    html += `
                        <div style="background:${estaDisponible ? (estaCompletado ? 'var(--success)05' : 'var(--white)') : 'var(--gray-light)'};border-radius:8px;padding:8px 12px;border:1px solid ${estaDisponible ? (estaCompletado ? 'var(--success)' : 'var(--light)') : 'transparent'};opacity:${estaDisponible ? '1' : '0.5'};">
                            <div style="display:flex;justify-content:space-between;align-items:start;gap:4px;">
                                <div>
                                    <span style="font-size:16px;">${tema.icono}</span>
                                    <div style="font-size:12px;font-weight:600;color:${estaDisponible ? 'var(--dark)' : 'var(--gray)'};">${tema.nombre}</div>
                                    <div style="font-size:10px;color:var(--gray-light);">${tema.descripcion}</div>
                                    ${estaGuardado ? '<span style="font-size:9px;color:var(--success);">📂 Importado</span>' : '<span style="font-size:9px;color:var(--gray-light);">📄 No importado</span>'}
                                    ${estaCompletado ? '<span style="font-size:9px;color:var(--success);">✅ Completado</span>' : ''}
                                </div>
                                ${estaCompletado ? '<span style="font-size:14px;">✅</span>' : ''}
                            </div>

                            ${estaDisponible ? `
                                <div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;">
                                    ${estaGuardado && temaEnDB && temaEnDB.historiasIds && temaEnDB.historiasIds.length > 0 ? `
                                        ${!estaCompletado ? `
                                            <button class="btn-secondary" onclick="event.stopPropagation();window.UITemas._verTemaDetalle(${dbId})" style="padding:2px 10px;font-size:10px;background:var(--success);color:white;border:none;border-radius:4px;cursor:pointer;">
                                                <i class="fas fa-folder-open"></i> Ver
                                            </button>
                                            <button class="btn-secondary" onclick="event.stopPropagation();window.UITemas._estudiarTema(${dbId})" style="padding:2px 10px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                                <i class="fas fa-play"></i> Estudiar
                                            </button>
                                        ` : `
                                            <button class="btn-secondary" onclick="event.stopPropagation();window.UIStudy._mostrarMensajeTemaCompletado()" 
                                                    style="padding:2px 10px;font-size:10px;opacity:0.6;cursor:pointer;background:var(--gray-light);color:var(--gray);border:1px solid var(--gray-light);">
                                                <i class="fas fa-check-circle"></i> Completado
                                            </button>
                                        `}
                                    ` : `
                                        ${!estaCompletado && estaDisponible ? `
                                            <button class="btn-secondary" onclick="window.UITemas._generarTemaPredefinido('${tema.id}', '${tema.nombre.replace(/'/g, "\\'")}', '${nivel}')" style="padding:2px 10px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                                <i class="fas fa-code"></i> Generar JSON
                                            </button>
                                        ` : `
                                            <button class="btn-secondary" onclick="event.stopPropagation();window.UIStudy._mostrarMensajeTemaCompletado()" 
                                                    style="padding:2px 10px;font-size:10px;opacity:0.6;cursor:pointer;background:var(--gray-light);color:var(--gray);border:1px solid var(--gray-light);">
                                                <i class="fas fa-check-circle"></i> Completado
                                            </button>
                                        `}
                                    `}
                                    
                                    <label class="tema-completado-checkbox ${estaCompletado ? 'checked' : ''}" 
                                           style="padding:2px 10px;font-size:10px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;background:${estaCompletado ? 'var(--success)08' : 'var(--bg)'};border:1px solid ${estaCompletado ? 'var(--success)' : 'var(--light)'};border-radius:12px;"
                                           onclick="event.stopPropagation();">
                                        <input type="checkbox" ${estaCompletado ? 'checked' : ''} 
                                               onchange="window.UITemas._marcarTemaCompletado('${idiomaActivo}', '${tema.id}', this.checked)"
                                               style="margin:0;width:14px;height:14px;cursor:pointer;">
                                        <span style="font-size:9px;color:${estaCompletado ? 'var(--success)' : 'var(--gray)'};">${estaCompletado ? '✅ Completado' : 'Completar'}</span>
                                    </label>
                                </div>
                            ` : `
                                <div style="font-size:10px;color:var(--gray-light);margin-top:4px;">🔒 Bloqueado</div>
                            `}
                        </div>
                    `;
                }

                html += `
                        </div>
                    </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;

            container.innerHTML = html;
            
            const inputBusqueda = document.getElementById('buscarTemasInput');
            if (inputBusqueda) {
                const newInput = inputBusqueda.cloneNode(true);
                inputBusqueda.parentNode.replaceChild(newInput, inputBusqueda);
                newInput.addEventListener('input', () => {
                    UITemasRender.filtrarTemas();
                });
            }

        } catch (error) {
            console.error('❌ Error en renderTemas:', error);
            const container = uiTemas._getContainer();
            if (container) {
                container.innerHTML = `
                    <div style="text-align:center;padding:60px 20px;color:var(--gray);">
                        <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                        <h3 style="font-size:18px;font-weight:700;color:var(--danger);">Error cargando temas</h3>
                        <p style="font-size:14px;color:var(--gray);">${error.message || 'Error desconocido'}</p>
                        <button class="btn-primary" onclick="window.UITemas._renderTemas()" style="margin-top:12px;padding:8px 20px;">
                            <i class="fas fa-sync"></i> Reintentar
                        </button>
                    </div>
                `;
            }
        }
    }

    // ============================================================
    // CAMBIAR PESTAÑA
    // ============================================================

    static _cambiarPestana(pestanaId) {
        const uiTemas = window.UITemas;
        if (!uiTemas) return;
        
        uiTemas._pestanaActiva = pestanaId;
        uiTemas._renderTemas();
    }

    // ============================================================
    // FILTRAR TEMAS
    // ============================================================

    static filtrarTemas() {
        const input = document.getElementById('buscarTemasInput');
        const query = input ? input.value.toLowerCase().trim() : '';
        
        const container = document.getElementById('temasContainer');
        if (!container) return;

        const tarjetas = container.querySelectorAll('.tema-card');
        let visibles = 0;

        tarjetas.forEach(tarjeta => {
            const texto = tarjeta.textContent.toLowerCase();
            const esVisible = texto.includes(query);
            tarjeta.style.display = esVisible ? '' : 'none';
            if (esVisible) visibles++;
        });

        const contador = document.getElementById('resultadosBusquedaTemas');
        if (contador) {
            if (query) {
                contador.textContent = `${visibles} temas encontrados`;
            } else {
                contador.textContent = '';
            }
        }
    }

    // ============================================================
    // RENDERIZAR PAGINADOR
    // ============================================================

    static _renderPaginador(paginaActual, totalPaginas, seccionId, infoTexto = '') {
        if (totalPaginas <= 1) return '';

        let paginas = [];
        if (totalPaginas <= 7) {
            for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
        } else {
            paginas.push(1);
            if (paginaActual > 3) paginas.push('...');
            for (let i = Math.max(2, paginaActual - 1); i <= Math.min(totalPaginas - 1, paginaActual + 1); i++) {
                paginas.push(i);
            }
            if (paginaActual < totalPaginas - 2) paginas.push('...');
            paginas.push(totalPaginas);
        }

        let html = `
            <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin:16px 0 8px 0;flex-wrap:wrap;">
                <button class="btn-secondary" 
                        onclick="window.UITemasRender._irPagina('${seccionId}', ${paginaActual - 1})" 
                        style="padding:4px 12px;font-size:11px;${paginaActual <= 1 ? 'opacity:0.5;cursor:default;' : ''}" 
                        ${paginaActual <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>
        `;

        for (const p of paginas) {
            if (p === '...') {
                html += `<span style="padding:4px 8px;font-size:11px;color:var(--gray-light);">…</span>`;
            } else {
                const isActive = p === paginaActual;
                html += `
                    <button class="btn-secondary" 
                            onclick="window.UITemasRender._irPagina('${seccionId}', ${p})" 
                            style="padding:4px 12px;font-size:11px;${isActive ? 'background:var(--primary);color:white;border-color:var(--primary);' : 'background:var(--white);color:var(--dark);border-color:var(--light);'}border:1px solid;border-radius:4px;cursor:pointer;">
                        ${p}
                    </button>
                `;
            }
        }

        html += `
                <button class="btn-secondary" 
                        onclick="window.UITemasRender._irPagina('${seccionId}', ${paginaActual + 1})" 
                        style="padding:4px 12px;font-size:11px;${paginaActual >= totalPaginas ? 'opacity:0.5;cursor:default;' : ''}" 
                        ${paginaActual >= totalPaginas ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;

        if (infoTexto) {
            html += `
                <div style="text-align:center;font-size:11px;color:var(--gray-light);margin-top:4px;">
                    ${infoTexto} · Página ${paginaActual} de ${totalPaginas}
                </div>
            `;
        }

        return html;
    }

    // ============================================================
    // FUNCIÓN ESTÁTICA PARA IR A UNA PÁGINA
    // ============================================================

    static async _irPagina(seccionId, pagina) {
        const uiTemas = window.UITemas;
        if (!uiTemas) return;
        
        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        const todosLosTemas = await db.obtenerTemasPorIdioma(idiomaActivo);
        
        if (!todosLosTemas || !Array.isArray(todosLosTemas)) {
            console.warn('⚠️ No se pudieron obtener los temas para paginación');
            return;
        }
        
        let temasMostrar = [];
        const pestana = uiTemas._pestanaActiva || 'todos';
        
        switch (pestana) {
            case 'manuales':
                temasMostrar = todosLosTemas.filter(t =>
                    t.origen !== 'importado' && !t._esPredefinido && !t._esImportado &&
                    t.idioma === idiomaActivo
                );
                break;
            case 'importados':
                temasMostrar = todosLosTemas.filter(t =>
                    (t.origen === 'importado' || t._esImportado === true ||
                    (t._esPredefinido === true && t.historiasIds && t.historiasIds.length > 0)) &&
                    t.idioma === idiomaActivo
                );
                break;
            case 'predefinidos':
                temasMostrar = todosLosTemas.filter(t => 
                    t._esPredefinido === true && 
                    t.idioma === idiomaActivo
                );
                break;
            case 'todos':
            default:
                temasMostrar = todosLosTemas;
                break;
        }

        let temasFiltrados = temasMostrar;
        if (uiTemas._ocultarCompletados) {
            const temasFiltradosPromises = temasMostrar.map(async (tema) => {
                let estaCompletado = tema.estado === 'completado' || tema._completado === true;
                if (tema._temaOriginalId) {
                    estaCompletado = await uiTemas._temaEstaCompletado(idiomaActivo, tema._temaOriginalId);
                }
                return { tema, estaCompletado };
            });
            const resultados = await Promise.all(temasFiltradosPromises);
            temasFiltrados = resultados.filter(r => !r.estaCompletado).map(r => r.tema);
        }

        const totalItems = temasFiltrados.length;
        const ITEMS_POR_PAGINA = 6;
        const totalPaginas = Math.max(1, Math.ceil(totalItems / ITEMS_POR_PAGINA));
        
        if (pagina < 1 || pagina > totalPaginas) return;
        
        const key = `pagina_${pestana}`;
        uiTemas[key] = pagina;
        uiTemas._renderTemas();
    }

    // ============================================================
    // VER DETALLE DE TEMA - CORREGIDO: Sincronización de checkbox y estado
    // ============================================================

    static async verTemaDetalle(uiTemas, temaId) {
        const tema = await db.obtenerTema(temaId);
        if (!tema) {
            uiTemas._core?.mostrarToast('❌ Tema no encontrado', 'error');
            return;
        }

        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        
        if (tema.idioma && tema.idioma !== idiomaActivo) {
            uiTemas._core?.mostrarToast('⚠️ Este tema es de "' + tema.idioma + '", no de "' + idiomaActivo + '"', 'warning');
            uiTemas._volverTemas();
            return;
        }

        uiTemas.temaSeleccionado = temaId;
        uiTemas.modoVistaTemas = 'detalle';

        const container = uiTemas._getContainer();
        if (!container) return;

        const historias = await db.obtenerHistoriasPorTema(temaId);
        const progreso = await db.obtenerProgresoTema(temaId);
        const icono = tema.icono || '📁';
        const esImportado = tema.origen === 'importado' || tema._esImportado;
        const esPredefinido = tema._esPredefinido === true;
        const idiomaNativo = uiTemas._obtenerIdiomaNativo();
        
        // 🔥 RECALCULAR PROGRESO REAL
        let historiasCompletadas = 0;
        let historiasTotales = historias.length;
        for (const h of historias) {
            if (h.estado === 'completada' || h._completada === true) {
                historiasCompletadas++;
            }
        }
        const progresoReal = historiasTotales > 0 ? Math.round((historiasCompletadas / historiasTotales) * 100) : 0;
        
        // 🔥 SI EL PROGRESO ES 100%, FORZAR QUE EL TEMA ESTÉ COMPLETADO
        let estaCompletado = tema.estado === 'completado' || tema._completado === true;
        if (progresoReal === 100 && historiasTotales > 0 && !estaCompletado) {
            estaCompletado = true;
            tema.estado = 'completado';
            tema._completado = true;
            tema._fechaCompletado = Date.now();
            await db.update('temas', tema);
            console.log(`🎯 Tema "${tema.nombre}" marcado como completado (progreso 100%)`);
        }
        
        // Actualizar el progreso en el tema
        if (progresoReal !== tema._progreso) {
            tema._progreso = progresoReal;
            tema._historiasCompletadas = historiasCompletadas;
            tema._historiasTotales = historiasTotales;
            await db.update('temas', tema);
        }
        
        let temaIdParaCompletado = temaId;
        if (tema._temaOriginalId && esPredefinido) {
            temaIdParaCompletado = tema._temaOriginalId;
            estaCompletado = await uiTemas._temaEstaCompletado(idiomaActivo, tema._temaOriginalId);
        }
        
        const versionTema = tema._nombre_version || '';

        const estaSincronizado = tema._caracteresSincronizados === true;
        const fechaSincro = tema._fechaSincronizacion ? new Date(tema._fechaSincronizacion).toLocaleString() : '';
        const numCaracteres = tema._caracteresSincronizadosCount || 0;

        let elipseEstado = null;
        if (window.modoElipse) {
            elipseEstado = window.modoElipse.getEstadoElipse(temaId);
        }

        let ondasElipse = 0;
        let ondasCruzadas = 0;
        for (const h of historias) {
            if (h._esOnda === true) ondasElipse++;
            if (h._esOndaCruzada === true) ondasCruzadas++;
        }

        // 🔥 COLOR DE BORDE Y FONDO SEGÚN ESTADO
        const borderColor = estaCompletado ? 'var(--success)' : 'var(--primary)';
        const cardBackground = estaCompletado ? 'var(--success)05' : 'var(--white)';

        let html = `
            <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;background:${cardBackground};border-radius:12px;padding:12px 16px;border-left:4px solid ${borderColor};">
                <div style="display:flex;align-items:center;gap:10px;">
                    <button class="btn-secondary" onclick="window.UITemas._volverTemas()" style="padding:6px 14px;font-size:13px;">
                        <i class="fas fa-arrow-left"></i> Volver
                    </button>
                    <span style="font-size:24px;">${icono}</span>
                    <div>
                        <h2 style="font-size:20px;font-weight:700;color:var(--dark);margin:0;">${tema.nombre}</h2>
                        <span style="font-size:12px;color:var(--gray);">${tema.descripcion || 'Sin descripción'} · ${uiTemas._getNombreIdioma(tema.idioma || idiomaActivo)} (${tema.nivel || 'B1'})</span>
                        ${esImportado ? '<span style="font-size:10px;color:var(--secondary);margin-left:6px;">📥 Importado</span>' : ''}
                        ${esPredefinido ? '<span style="font-size:10px;color:var(--primary);margin-left:6px;">📚 Predefinido</span>' : ''}
                        ${versionTema ? `<span style="font-size:10px;color:var(--secondary);margin-left:6px;">📌 ${versionTema}</span>` : ''}
                        ${estaCompletado ? '<span style="font-size:10px;color:var(--success);font-weight:700;">✅ Completado</span>' : ''}
                        ${estaSincronizado ? `
                            <span style="display:inline-block;font-size:10px;background:var(--success);color:white;padding:2px 12px;border-radius:12px;margin-left:6px;" 
                                  title="Sincronizado el ${fechaSincro} - ${numCaracteres} caracteres">
                                ✅ Sincronizado (${numCaracteres})
                            </span>
                        ` : ''}
                        ${elipseEstado && elipseEstado.totalOndas > 0 ? `
                            <span style="display:inline-block;font-size:10px;background:linear-gradient(135deg,#6C5CE7,#00CEC9);color:white;padding:2px 12px;border-radius:12px;margin-left:6px;" 
                                  title="Elipse activa - ${elipseEstado.totalOndas} ondas">
                                🌌 ${elipseEstado.totalOndas} ondas
                            </span>
                        ` : ''}
                        ${ondasCruzadas > 0 ? `
                            <span style="display:inline-block;font-size:10px;background:#00CEC9;color:white;padding:2px 12px;border-radius:12px;margin-left:6px;">
                                🌊 ${ondasCruzadas} Cruzadas
                            </span>
                        ` : ''}
                        <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">🎤 ${uiTemas._getNombreIdioma(idiomaNativo)}</span>
                    </div>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    ${!estaCompletado ? `
                        <button class="btn-primary" onclick="window.UITemas._estudiarTema(${temaId})" style="padding:6px 14px;font-size:12px;">
                            <i class="fas fa-play"></i> Estudiar Todo
                        </button>
                    ` : `
                        <button class="btn-secondary" onclick="window.UIStudy._mostrarMensajeTemaCompletado()" 
                                style="padding:6px 14px;font-size:12px;opacity:0.6;cursor:pointer;background:var(--gray-light);color:var(--gray);border:1px solid var(--gray-light);">
                            <i class="fas fa-check-circle"></i> Completado
                        </button>
                    `}
                    <button class="btn-secondary" onclick="window.UITemas._exportarTema(${temaId})" style="padding:6px 14px;font-size:12px;">
                        <i class="fas fa-download"></i> Exportar
                    </button>
                    <label class="tema-completado-checkbox ${estaCompletado ? 'checked' : ''}" 
                           style="padding:4px 12px;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;background:${estaCompletado ? 'var(--success)08' : 'var(--bg)'};border:1px solid ${estaCompletado ? 'var(--success)' : 'var(--light)'};border-radius:12px;">
                        <input type="checkbox" ${estaCompletado ? 'checked' : ''} 
                               onchange="(async () => {
                                   await window.UITemas._marcarTemaCompletado('${idiomaActivo}', '${temaIdParaCompletado}', this.checked);
                                   // 🔥 FORZAR RECARGA DE LA VISTA
                                   setTimeout(() => {
                                       window.UITemas._verTemaDetalle(${temaId});
                                   }, 300);
                               })()"
                               style="margin:0;width:16px;height:16px;cursor:pointer;">
                        <span style="font-size:11px;color:${estaCompletado ? 'var(--success)' : 'var(--gray)'};">${estaCompletado ? '✅ Completado' : 'Completar'}</span>
                    </label>
                </div>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:12px;font-size:12px;color:var(--gray);">
                <span>📚 ${historias.length} historias</span>
                <span>📝 ${progreso.totalFrases} frases</span>
                <span>🎯 Progreso: <strong style="color:${estaCompletado ? 'var(--success)' : 'var(--primary)'};">${progresoReal}%</strong> (${historiasCompletadas}/${historiasTotales} historias)</span>
                ${estaCompletado ? '<span style="color:var(--success);font-weight:700;">✅ 100% Completado</span>' : ''}
                ${versionTema ? `<span style="color:var(--secondary);">📌 ${versionTema}</span>` : ''}
                ${elipseEstado && elipseEstado.totalOndas > 0 ? `<span style="color:var(--primary);">🌌 ${elipseEstado.totalOndas} ondas</span>` : ''}
                ${ondasCruzadas > 0 ? `<span style="color:#00CEC9;">🌊 ${ondasCruzadas} Cruzadas</span>` : ''}
            </div>

            <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
                <button class="btn-primary" onclick="window.UITemas._abrirCreadorHistoria(${temaId})" 
                        style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;">
                    <i class="fas fa-plus-circle"></i> Crear Historia
                </button>
                <button class="btn-secondary" onclick="window.UITemas._abrirGeneradorDesdeTema(${temaId}, '${tema.nombre.replace(/'/g, "\\'")}')" 
                        style="padding:6px 14px;font-size:12px;background:var(--secondary);color:white;border:none;border-radius:6px;cursor:pointer;">
                    <i class="fas fa-magic"></i> Generar JSON
                </button>
                <button class="btn-secondary" onclick="window.UITemas._importarHistoriaATema(${temaId})" 
                        style="padding:6px 14px;font-size:12px;">
                    <i class="fas fa-file-import"></i> Importar JSON
                </button>
                <button class="btn-secondary" onclick="window.UITemas._salirDelTema()" 
                        style="padding:6px 14px;font-size:12px;background:var(--warning);color:var(--dark);border:none;border-radius:6px;cursor:pointer;">
                    <i class="fas fa-arrow-right"></i> Salir del Tema
                </button>
        `;

        const esJeroglifico = uiTemas._esJeroglifico(tema.idioma || idiomaActivo);
        if (esJeroglifico) {
            html += `
                <button class="btn-secondary" onclick="window.UITemas._sincronizarCaracteresTema(${temaId})" 
                        style="padding:6px 14px;font-size:12px;background:${estaSincronizado ? 'var(--success)' : 'linear-gradient(135deg,#6C5CE7,#00CEC9)'};color:white;border:none;border-radius:6px;cursor:pointer;">
                    ${estaSincronizado ? '✅ Sincronizado' : '🔄 Sincronizar Caracteres'}
                    ${estaSincronizado ? `<span style="font-size:9px;opacity:0.8;"> (${numCaracteres} caracteres)</span>` : ''}
                </button>
            `;
        }

        if (window.modoElipse) {
            html += `
                <button class="btn-secondary" onclick="window.UITemasActions.generarOndaElipse(${temaId})" 
                        style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#00CEC9);color:white;border:none;border-radius:6px;cursor:pointer;">
                    🌌 Generar Onda
                </button>
            `;
        }

        html += `
            </div>
        `;

        if (estaSincronizado && fechaSincro) {
            html += `
                <div style="font-size:10px;color:var(--gray-light);margin-bottom:12px;padding:6px 12px;background:var(--bg);border-radius:6px;border:1px solid var(--success);">
                    📅 Última sincronización: ${fechaSincro}
                </div>
            `;
        }

        if (elipseEstado && elipseEstado.totalOndas > 0) {
            html += `
                <div style="font-size:10px;color:var(--gray-light);margin-bottom:12px;padding:6px 12px;background:linear-gradient(135deg, var(--primary)08, var(--secondary)08);border-radius:6px;border:1px solid var(--primary);">
                    🌌 Modo Elipse: ${elipseEstado.totalOndas} ondas · ${elipseEstado.ondasCompletadas} completadas · ${elipseEstado.progreso}% progreso
                </div>
            `;
        }

        if (ondasCruzadas > 0) {
            html += `
                <div style="font-size:10px;color:var(--gray-light);margin-bottom:12px;padding:6px 12px;background:rgba(0,206,201,0.08);border-radius:6px;border:1px solid #00CEC9;">
                    🌊 Ondas Cruzadas: ${ondasCruzadas} ondas generadas desde el Modo Ondas Cruzadas
                </div>
            `;
        }

        if (historias.length === 0) {
            html += `
                <div style="text-align:center;padding:30px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">
                    <i class="fas fa-book" style="font-size:36px;color:var(--primary-light);margin-bottom:8px;display:block;"></i>
                    <p>No hay historias en este tema.</p>
                    <p style="font-size:12px;">
                        Usa <strong>"Crear Historia"</strong> para generar una historia con IA, 
                        <br><strong>"Generar JSON"</strong> para crear una plantilla, 
                        <br>o <strong>"Importar JSON"</strong> para añadir contenido existente.
                    </p>
                </div>
            `;
        } else {
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">';

            for (const h of historias) {
                const estadoColor = h.estado === 'completada' ? 'var(--success)' : h.estado === 'en_curso' ? 'var(--warning)' : 'var(--gray)';
                const estadoIcon = h.estado === 'completada' ? '✅' : h.estado === 'en_curso' ? '📖' : '⏳';
                
                const esOnda = h._esOnda === true;
                const esOndaCruzada = h._esOndaCruzada === true;
                const esImportada = h._importadoDesdeJSON === true || h._esImportada === true || h._importado === true;
                const esHistoriaNormal = !esOnda && !esOndaCruzada && !esImportada;
                const ondaIndice = h._ondaIndice || 0;
                
                let origenLabel = '📄 Historia';
                let origenColor = 'var(--gray)';
                let origenBg = 'var(--bg)';
                let ondaIcon = '';
                let badgeExtra = '';
                
                if (esOnda) {
                    origenLabel = '🌌 Onda Elipse';
                    origenColor = '#6C5CE7';
                    origenBg = 'rgba(108,92,231,0.1)';
                    ondaIcon = '🌌';
                    badgeExtra = `<span style="font-size:9px;color:white;background:#6C5CE7;padding:1px 8px;border-radius:8px;">🌌 Elipse</span>`;
                } else if (esOndaCruzada) {
                    origenLabel = '🌊 Onda Cruzada';
                    origenColor = '#00CEC9';
                    origenBg = 'rgba(0,206,201,0.1)';
                    ondaIcon = '🌊';
                    badgeExtra = `<span style="font-size:9px;color:white;background:#00CEC9;padding:1px 8px;border-radius:8px;">🌊 Cruzada</span>`;
                } else if (esImportada) {
                    origenLabel = '📥 Importada';
                    origenColor = 'var(--secondary)';
                    origenBg = 'var(--secondary)10';
                }

                const estaCompletada = h.estado === 'completada' || h._completada === true;

                html += `
                    <div style="background:var(--white);border-radius:10px;padding:12px 14px;box-shadow:var(--shadow);border-left:3px solid ${estadoColor};">
                        <div style="display:flex;justify-content:space-between;align-items:start;">
                            <div>
                                <h4 style="font-size:14px;font-weight:600;color:var(--dark);margin:0;">
                                    ${ondaIcon || '📖'} ${h.titulo || 'Sin título'}
                                    ${esOnda ? `<span style="font-size:10px;color:var(--primary);">Onda ${ondaIndice}</span>` : ''}
                                    ${esOndaCruzada ? `<span style="font-size:10px;color:#00CEC9;font-weight:700;">🌊 Cruzada</span>` : ''}
                                    ${esImportada ? `<span style="font-size:10px;color:var(--secondary);">📥 Importada</span>` : ''}
                                    ${esHistoriaNormal ? `<span style="font-size:10px;color:var(--gray);">📄 Historia</span>` : ''}
                                </h4>
                                <span style="font-size:11px;color:var(--gray);">${h.frases || 0} frases · ${estadoIcon} ${h.estado || 'pendiente'}</span>
                                <span style="font-size:10px;color:var(--gray-light);margin-left:8px;">🎤 ${uiTemas._getNombreIdioma(idiomaNativo)}</span>
                            </div>
                            <span style="font-size:11px;color:${estadoColor};">${h.nivel || 'B1'}</span>
                        </div>
                        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;align-items:center;">
                            <button class="btn-secondary" onclick="event.stopPropagation();window.UITemas._estudiarHistoria(${h.id})" style="padding:2px 8px;font-size:10px;">
                                <i class="fas fa-play"></i> Estudiar
                            </button>
                            <button class="btn-secondary" onclick="event.stopPropagation();window.UITemas.exportarHistoria(${h.id})" style="padding:2px 8px;font-size:10px;">
                                <i class="fas fa-download"></i> Exportar
                            </button>
                            ${esOnda ? `
                                <button class="btn-secondary" onclick="event.stopPropagation();window.UITemasActions.generarOndaElipse(${temaId})" 
                                        style="padding:2px 8px;font-size:10px;background:linear-gradient(135deg,#6C5CE7,#00CEC9);color:white;border:none;border-radius:4px;cursor:pointer;">
                                    🌌 Expandir
                                </button>
                            ` : ''}
                            ${esOndaCruzada ? `
                                <span style="padding:2px 8px;font-size:10px;background:#00CEC920;color:#00CEC9;border-radius:4px;border:1px solid #00CEC9;">
                                    🌊 Cruzada
                                </span>
                            ` : ''}
                            
                            <!-- 🔥 CHECKBOX DE COMPLETADO CON SIMBIOSIS - CON VERIFICACIÓN DEL TEMA -->
                            <label style="display:flex;align-items:center;gap:3px;font-size:9px;cursor:pointer;padding:2px 8px;background:${estaCompletada ? 'var(--success)15' : 'var(--bg)'};border-radius:10px;border:1px solid ${estaCompletada ? 'var(--success)' : 'var(--light)'};">
                                <input type="checkbox" ${estaCompletada ? 'checked' : ''} 
                                       onchange="(async () => {
                                           await window.gestorProgresoHistorias.cambiarEstadoHistoria(${h.id}, this.checked, 'temas');
                                           // 🔥 FORZAR VERIFICACIÓN DEL TEMA DESPUÉS DEL CAMBIO
                                           setTimeout(async () => {
                                               if (window.UITemas) {
                                                   await window.UITemas._verificarYActualizarEstadoTema(${temaId});
                                                   await window.UITemas._verTemaDetalle(${temaId});
                                               }
                                               if (window.UIDashboard) {
                                                   await window.UIDashboard._cargarDashboardInicial(window.uiCore);
                                               }
                                               if (window.UIClipse) {
                                                   window.UIClipse._renderizarPanel(window.UIClipse._temaId);
                                               }
                                           }, 300);
                                       })()"
                                       style="margin:0;width:12px;height:12px;cursor:pointer;">
                                <span style="color:${estaCompletada ? 'var(--success)' : 'var(--gray)'};font-size:8px;">${estaCompletada ? '✅' : '⬜'}</span>
                            </label>
                            
                            <button class="btn-danger" onclick="event.stopPropagation();window.UITemas._eliminarHistoriaDeTema(${h.id})" style="padding:2px 8px;font-size:10px;background:#FF7675;color:white;border:none;border-radius:4px;cursor:pointer;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
            }

            html += '</div>';
        }

        container.innerHTML = html;
    }

    // ============================================================
    // RENDERIZAR PALABRA CON PINYIN/TRANSCRIPCIÓN
    // ============================================================

    static renderizarPalabraConPinyin(palabra, uiTemas) {
        const esJeroglifico = uiTemas._esJeroglifico(palabra.idioma || uiTemas._idiomaActual);
        const texto = palabra.palabra || palabra.hanzi || '';
        const pinyin = palabra.pinyin || '';
        const transcripcion = palabra.transcripcion || '';
        const significado = palabra.significado || '';

        let html = '';

        if (esJeroglifico && texto) {
            html += '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">';
            html += '<span style="font-size:18px;font-weight:700;color:var(--dark);">' + texto + '</span>';
            if (pinyin) {
                html += '<span style="font-size:12px;color:var(--gray-light);letter-spacing:1px;">🔊 ' + pinyin + '</span>';
            } else {
                html += '<span style="font-size:10px;color:var(--danger);">⚠️ Sin pinyin</span>';
            }
            if (significado) {
                html += '<span style="font-size:11px;color:var(--gray);">' + significado.substring(0, 20) + '</span>';
            }
            html += '</div>';
        } else if (texto) {
            html += '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">';
            html += '<span style="font-size:16px;font-weight:600;color:var(--dark);">' + texto + '</span>';
            if (transcripcion) {
                html += '<span style="font-size:11px;color:var(--gray-light);">🎤 ' + transcripcion + '</span>';
            }
            if (significado && texto !== significado) {
                html += '<span style="font-size:11px;color:var(--gray);margin-top:1px;">(' + significado.substring(0, 15) + ')</span>';
            }
            html += '</div>';
        } else {
            html = '<span style="font-size:14px;color:var(--gray);">' + (significado || 'Sin información') + '</span>';
        }

        return html;
    }
}

// ============================================================
// EXPORTAR PARA USO GLOBAL
// ============================================================

window.UITemasRender = UITemasRender;

console.log('✅ UITemas Render v2.36 - Sincronización de checkbox y estado del tema');
console.log('  🔥 Si progreso = 100%, marca tema como completado automáticamente');
console.log('  🔥 Tarjeta en verde cuando tema está completado');
console.log('  🔥 Checkbox del tema sincronizado con el estado');
console.log('  🔥 Recalculo de progreso real del tema al cargar vista');
console.log('  🔥 Todas las funcionalidades originales preservadas');