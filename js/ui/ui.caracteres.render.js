// ============================================================
// UI CARACTERES RENDER v1.9 - PAGINACIÓN CORREGIDA
// ============================================================

class UICaracteresRender {
    // ============================================================
    // RENDERIZAR MÓDULO PRINCIPAL
    // ============================================================

    static async renderizarModulo(uiCaracteres) {
        if (uiCaracteres._cargando) return;
        uiCaracteres._cargando = true;
        const container = uiCaracteres._container;
        if (!container) {
            uiCaracteres._cargando = false;
            return;
        }

        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const esJeroglifico = uiCaracteres._esJeroglifico(idioma);
        const nivelUsuario = uiCaracteres._obtenerNivelRealUsuario();

        if (!esJeroglifico) {
            container.innerHTML = UICaracteresRender.renderizarNoDisponible(uiCaracteres, idioma);
            uiCaracteres._cargando = false;
            return;
        }

        try {
            const usuario = await db.getUsuario();
            if (window.vigiaGramatical) {
                uiCaracteres._estadisticas = await window.vigiaGramatical._evaluarProgresoCaracteres(usuario?.id, idioma);
            }

            const familias = await db.obtenerFamiliasCaracteres(idioma);

            // 🔥 PAGINACIÓN: Configurar página actual
            if (!uiCaracteres._paginaActual) {
                uiCaracteres._paginaActual = 1;
            }
            // 🔥 Elementos por página
            const itemsPorPagina = uiCaracteres._itemsPorPagina || 9;

            let html = '';
            html += UICaracteresRender.renderizarHeader(uiCaracteres, idioma, nivelUsuario);

            if (uiCaracteres._vistaActual === 'biblioteca') {
                html += UICaracteresRender.renderizarBiblioteca(uiCaracteres, familias, idioma, nivelUsuario, itemsPorPagina);
            } else if (uiCaracteres._vistaActual === 'estudio' && uiCaracteres._familiaSeleccionada) {
                html += await UICaracteresRender.renderizarEstudioAvanzado(uiCaracteres, uiCaracteres._familiaSeleccionada, idioma, nivelUsuario, itemsPorPagina);
            } else if (uiCaracteres._vistaActual === 'detalle' && uiCaracteres._caracterSeleccionado) {
                html += await UICaracteresRender.renderizarDetalleProfesional(uiCaracteres, uiCaracteres._caracterSeleccionado, idioma, nivelUsuario);
            } else if (uiCaracteres._vistaActual === 'logros') {
                html += UICaracteresRender.renderizarPanelLogros(uiCaracteres);
            } else if (uiCaracteres._vistaActual === 'estudio_completo' && uiCaracteres._caracterSeleccionado) {
                html += await UICaracteresRender.renderizarEstudioCompletoVista(uiCaracteres, uiCaracteres._caracterSeleccionado, idioma, nivelUsuario);
            } else {
                html += UICaracteresRender.renderizarBiblioteca(uiCaracteres, familias, idioma, nivelUsuario, itemsPorPagina);
            }

            container.innerHTML = html;

        } catch (error) {
            console.error('❌ Error renderizando:', error);
            container.innerHTML = UICaracteresRender.renderizarError(uiCaracteres, error);
        }

        uiCaracteres._cargando = false;
    }

    // ============================================================
    // RENDERIZAR HEADER
    // ============================================================

    static renderizarHeader(uiCaracteres, idioma, nivel) {
        const vigiaOnline = window.vigiaGramatical?.enLinea === true;
        const estadoVigia = window.vigiaGramatical?.getEstadoGramatical();
        const edadEmoji = estadoVigia?.edadEmoji || '📚';
        const edadNombre = estadoVigia?.edadNombre || 'Iniciando';
        const nombreIdioma = uiCaracteres._getNombreIdioma(idioma);
        const totalFamilias = uiCaracteres._estadisticas?.total || 0;

        return `
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:12px 20px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:14px;border:2px solid var(--primary)20;box-shadow:0 4px 20px rgba(108,92,231,0.08);">
                <div>
                    <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                        🀄 Estudio de Caracteres
                        <span style="font-size:14px;font-weight:400;color:var(--gray);margin-left:8px;">${nombreIdioma}</span>
                    </h2>
                    <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                        Nivel <strong>${nivel}</strong> · 
                        ${totalFamilias} familias · 
                        <span style="font-size:11px;color:${vigiaOnline ? 'var(--success)' : 'var(--danger)'};">
                            ${vigiaOnline ? '🟢 Vigía activo' : '🔴 Vigía offline'}
                        </span>
                        <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">${edadEmoji} ${edadNombre}</span>
                    </p>
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <button class="btn-secondary" onclick="window.UICaracteres._volverBiblioteca()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                        <i class="fas fa-home"></i> Biblioteca
                    </button>
                    <button class="btn-secondary" onclick="window.UICaracteres._verLogros()" style="padding:6px 14px;font-size:12px;background:var(--warning);color:var(--dark);border:none;border-radius:6px;cursor:pointer;">
                        🏆 Logros <span id="logrosCount" style="font-size:10px;background:var(--white);padding:1px 8px;border-radius:10px;">${uiCaracteres._logrosDesbloqueados.size}</span>
                    </button>
                    <button class="btn-primary" onclick="window.UICaracteres._generarFamiliasDesdeHistorias()" style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;">
                        <i class="fas fa-magic"></i> Generar
                    </button>
                    <button class="btn-success" onclick="window.UICaracteres._abrirModalImportacionMasiva()" style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:6px;cursor:pointer;">
                        <i class="fas fa-file-import"></i> Importar Masivo
                    </button>
                    <button class="btn-secondary" onclick="window.UICaracteres._abrirModalExportarEstudios()" style="padding:6px 14px;font-size:12px;background:var(--secondary);color:white;border:none;border-radius:6px;cursor:pointer;">
                        <i class="fas fa-download"></i> Exportar
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================================
    // RENDERIZAR BIBLIOTECA CON PAGINACIÓN
    // ============================================================

    static renderizarBiblioteca(uiCaracteres, familias, idioma, nivelUsuario, itemsPorPagina) {
        const total = familias.length;
        const estadisticas = uiCaracteres._estadisticas || {};
        const nombreIdioma = uiCaracteres._getNombreIdioma(idioma);

        // 🔥 PAGINACIÓN: Calcular total de páginas
        const totalPaginas = Math.max(1, Math.ceil(total / itemsPorPagina));
        let paginaActual = uiCaracteres._paginaActual || 1;
        if (paginaActual < 1) paginaActual = 1;
        if (paginaActual > totalPaginas) paginaActual = totalPaginas;
        uiCaracteres._paginaActual = paginaActual;

        // 🔥 Obtener elementos de la página actual
        const inicio = (paginaActual - 1) * itemsPorPagina;
        const fin = Math.min(inicio + itemsPorPagina, total);
        const familiasPagina = familias.slice(inicio, fin);

        let totalDerivadas = 0;
        let familiasSinDerivadas = 0;
        let totalPalabrasNivel = 0;

        for (const f of familias) {
            const count = f.palabrasDerivadas?.length || 0;
            totalDerivadas += count;
            if (count === 0) familiasSinDerivadas++;
            for (const p of (f.palabrasDerivadas || [])) {
                if ((p.nivel || 'A1') === nivelUsuario) totalPalabrasNivel++;
            }
        }

        let html = `
            <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center;">
                <div style="flex:2;min-width:200px;position:relative;">
                    <i class="fas fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gray);"></i>
                    <input type="text" id="buscarCaracteresInput" placeholder="🔍 Buscar familias, caracteres..." 
                           style="width:100%;padding:10px 14px 10px 38px;border:2px solid var(--light);border-radius:10px;font-size:14px;font-family:var(--font);transition:all 0.3s;"
                           oninput="UICaracteresRender.filtrarFamiliasCaracteres()">
                </div>
                <span style="font-size:12px;color:var(--gray-light);" id="resultadosBusquedaCaracteres"></span>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:16px;">
                <div style="background:var(--white);padding:12px;border-radius:10px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--primary);">
                    <div style="font-size:24px;font-weight:800;color:var(--primary);">${total}</div>
                    <div style="font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;">Familias</div>
                </div>
                <div style="background:var(--white);padding:12px;border-radius:10px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--secondary);">
                    <div style="font-size:24px;font-weight:800;color:var(--secondary);">${totalDerivadas}</div>
                    <div style="font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;">Palabras Totales</div>
                </div>
                <div style="background:var(--white);padding:12px;border-radius:10px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--success);">
                    <div style="font-size:24px;font-weight:800;color:var(--success);">${totalPalabrasNivel}</div>
                    <div style="font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;">Palabras Nivel ${nivelUsuario}</div>
                </div>
                <div style="background:var(--white);padding:12px;border-radius:10px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--warning);">
                    <div style="font-size:24px;font-weight:800;color:var(--warning);">${familiasSinDerivadas}</div>
                    <div style="font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;">Familias sin derivadas</div>
                </div>
                <div style="background:var(--white);padding:12px;border-radius:10px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--danger);">
                    <div style="font-size:24px;font-weight:800;color:var(--danger);">${estadisticas.pendientes || 0}</div>
                    <div style="font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;">Pendientes</div>
                </div>
            </div>
        `;

        if (uiCaracteres._estadisticas?.recomendacionIA) {
            const rec = uiCaracteres._estadisticas.recomendacionIA;
            html += `
                <div style="background:linear-gradient(135deg, var(--secondary)08, var(--primary)08);border-radius:10px;padding:10px 14px;margin-bottom:16px;border-left:4px solid var(--primary);">
                    <div style="display:flex;align-items:start;gap:8px;">
                        <span style="font-size:20px;">🧠</span>
                        <div>
                            <div style="font-size:12px;font-weight:600;color:var(--gray);">Recomendación de Vigía Gramatical</div>
                            <div style="font-size:13px;color:var(--dark);">${rec.mensaje_motivador || 'Sigue practicando para mejorar'}</div>
                            ${(rec.consejos || []).length > 0 ? `
                                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
                                    ${rec.consejos.map(c => `<span style="font-size:11px;background:var(--white);padding:2px 10px;border-radius:12px;border:1px solid var(--light);">💡 ${c}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        if (total === 0) {
            html += `
                <div style="text-align:center;padding:60px 20px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">
                    <div style="font-size:64px;margin-bottom:16px;">📚</div>
                    <p style="font-size:18px;font-weight:600;">No hay familias de caracteres</p>
                    <p style="font-size:14px;color:var(--gray-light);">Genera o importa historias para que Vigía Gramatical cree familias automáticamente.</p>
                    <button class="btn-primary" onclick="window.UICaracteres._generarFamiliasDesdeHistorias()" style="margin-top:12px;padding:10px 24px;">
                        <i class="fas fa-magic"></i> Generar desde Historias
                    </button>
                </div>
            `;
        } else {
            html += `
                <div id="familiasCaracteresContainer" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
                    ${familiasPagina.map(familia => UICaracteresRender.renderizarTarjetaFamilia(uiCaracteres, familia, idioma, nivelUsuario)).join('')}
                </div>
            `;

            // 🔥 PAGINADOR - CORREGIDO
            if (totalPaginas > 1) {
                html += UICaracteresRender.renderizarPaginador(
                    paginaActual,
                    totalPaginas,
                    'caracteres'
                );
            }
        }

        // 🔥 Info de página
        html += `
            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-light);margin-top:12px;padding:6px 0;border-top:1px solid var(--light);">
                <span>Mostrando ${inicio + 1} - ${Math.min(fin, total)} de ${total} familias</span>
                <span>${totalPaginas} páginas</span>
            </div>
        `;

        return html;
    }

    // ============================================================
    // 🔥 RENDERIZAR PAGINADOR - CORREGIDO (SIN ERRORES DE SINTAXIS)
    // ============================================================

    static renderizarPaginador(paginaActual, totalPaginas, contexto) {
        if (totalPaginas <= 1) return '';

        // Construir los números de página a mostrar
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
            <div style="display:flex;align-items:center;gap:6px;justify-content:center;margin:16px 0 8px 0;flex-wrap:wrap;">
                <button class="btn-secondary" 
                        onclick="UICaracteresRender.irPagina('${contexto}', ${paginaActual - 1})" 
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
                            onclick="UICaracteresRender.irPagina('${contexto}', ${p})" 
                            style="padding:4px 12px;font-size:11px;${isActive ? 'background:var(--primary);color:white;border-color:var(--primary);' : 'background:var(--white);color:var(--dark);border-color:var(--light);'}border:1px solid;border-radius:4px;cursor:pointer;">
                        ${p}
                    </button>
                `;
            }
        }

        html += `
                <button class="btn-secondary" 
                        onclick="UICaracteresRender.irPagina('${contexto}', ${paginaActual + 1})" 
                        style="padding:4px 12px;font-size:11px;${paginaActual >= totalPaginas ? 'opacity:0.5;cursor:default;' : ''}" 
                        ${paginaActual >= totalPaginas ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;

        return html;
    }

    // ============================================================
    // 🔥 FUNCIÓN ESTÁTICA PARA IR A UNA PÁGINA - CORREGIDA
    // ============================================================

    static irPagina(contexto, pagina) {
        const uiCaracteres = window.UICaracteres;
        if (!uiCaracteres) return;

        if (contexto === 'caracteres') {
            const totalFamilias = uiCaracteres._estadisticas?.total || 0;
            const itemsPorPagina = uiCaracteres._itemsPorPagina || 9;
            const totalPaginas = Math.max(1, Math.ceil(totalFamilias / itemsPorPagina));
            
            if (pagina < 1 || pagina > totalPaginas) return;
            
            uiCaracteres._paginaActual = pagina;
            uiCaracteres._renderizarModulo();
        } else if (contexto === 'estudio' || contexto === 'derivadas') {
            const familia = uiCaracteres._familiaSeleccionada;
            if (!familia) return;
            
            const totalDerivadas = familia.palabrasDerivadas?.length || 0;
            const itemsPorPagina = uiCaracteres._itemsPorPagina || 9;
            const totalPaginas = Math.max(1, Math.ceil(totalDerivadas / itemsPorPagina));
            
            if (pagina < 1 || pagina > totalPaginas) return;
            
            uiCaracteres._paginaDerivadas = pagina;
            uiCaracteres._renderizarModulo();
        }
    }

    // ============================================================
    // FUNCIÓN DE FILTRADO PARA CARACTERES
    // ============================================================

    static filtrarFamiliasCaracteres() {
        const input = document.getElementById('buscarCaracteresInput');
        const query = input ? input.value.toLowerCase().trim() : '';
        const container = document.getElementById('familiasCaracteresContainer');
        if (!container) return;

        const tarjetas = container.querySelectorAll('.familia-card');
        let visibles = 0;

        tarjetas.forEach(tarjeta => {
            const texto = tarjeta.textContent.toLowerCase();
            const esVisible = texto.includes(query);
            tarjeta.style.display = esVisible ? '' : 'none';
            if (esVisible) visibles++;
        });

        const contador = document.getElementById('resultadosBusquedaCaracteres');
        if (contador) {
            const total = tarjetas.length;
            if (query) {
                contador.textContent = `${visibles} de ${total} familias`;
            } else {
                contador.textContent = '';
            }
        }
    }

    // ============================================================
    // RENDERIZAR TARJETA DE FAMILIA
    // ============================================================

    static renderizarTarjetaFamilia(uiCaracteres, familia, idioma, nivelUsuario) {
        const raiz = familia.caracterRaiz;
        const derivadas = familia.palabrasDerivadas || [];
        const rcn = raiz?.neuroScore || 0;
        const nivelDomino = rcn >= 4 ? '🟣 Dominado' : rcn >= 2 ? '🟡 En progreso' : '🔴 Nuevo';
        const colorDomino = rcn >= 4 ? 'var(--success)' : rcn >= 2 ? 'var(--warning)' : 'var(--danger)';
        const totalDerivadas = derivadas.length;

        const derivadasNivel = derivadas.filter(p => (p.nivel || 'A1') === nivelUsuario);
        const tieneDerivadasNivel = derivadasNivel.length > 0;

        const tieneEstudioCompleto = raiz._estudio_completo || 
                                    raiz.evolucion_historica || 
                                    raiz.componentes || 
                                    raiz.conexiones_culturales ||
                                    (raiz._estudio_completo_data && Object.keys(raiz._estudio_completo_data).length > 0);

        return `
            <div class="familia-card" onclick="window.UICaracteres._seleccionarFamilia(${raiz.id})" 
                 style="background:var(--white);border-radius:14px;padding:16px 18px;box-shadow:var(--shadow);border-left:5px solid ${colorDomino};cursor:pointer;transition:all 0.3s;" 
                 onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'" 
                 onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">

                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:32px;font-weight:700;color:var(--dark);">${raiz.palabra}</span>
                        ${raiz.pinyin ? `<span style="font-size:15px;color:var(--gray-light);letter-spacing:1px;">🔊 ${raiz.pinyin}</span>` : ''}
                    </div>
                    <span style="font-size:12px;font-weight:600;color:${colorDomino};background:${colorDomino}15;padding:2px 12px;border-radius:12px;">
                        ${nivelDomino}
                    </span>
                </div>

                <div style="font-size:15px;color:var(--gray);margin-bottom:6px;">
                    ${raiz.significado || 'Sin significado'} 
                    <span style="font-size:11px;color:var(--gray-light);">(Nivel ${raiz.nivel || nivelUsuario})</span>
                    ${tieneEstudioCompleto ? ' <span style="font-size:10px;color:var(--success);">📚 Estudio completo</span>' : ''}
                </div>

                <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;color:var(--gray-light);">
                    <span>📖 ${totalDerivadas} palabras derivadas</span>
                    <span>✍️ ${raiz.numero_trazos || '?'} trazos</span>
                </div>

                ${tieneDerivadasNivel ? `
                    <div style="font-size:11px;color:var(--success);margin-bottom:6px;">
                        ✅ ${derivadasNivel.length} palabras de nivel ${nivelUsuario}
                    </div>
                ` : `
                    <div style="font-size:11px;color:var(--warning);margin-bottom:6px;">
                        ⚠️ Sin palabras de nivel ${nivelUsuario}
                    </div>
                `}

                <div style="height:4px;background:var(--bg);border-radius:2px;margin-top:8px;overflow:hidden;">
                    <div style="height:100%;width:${Math.min(100, rcn * 20)}%;background:${colorDomino};border-radius:2px;transition:width 0.8s ease;"></div>
                </div>

                <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;">
                    <button class="btn-primary" onclick="event.stopPropagation();window.UICaracteres._estudiarFamilia(${raiz.id})" 
                            style="padding:4px 14px;font-size:11px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                        <i class="fas fa-play"></i> Estudiar
                    </button>
                    ${tieneEstudioCompleto ? `
                        <button class="btn-secondary" onclick="event.stopPropagation();window.UICaracteres._verEstudioCompleto(${raiz.id})" 
                                style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-book"></i> Ver Estudio
                        </button>
                    ` : ''}
                    <button class="btn-secondary" onclick="event.stopPropagation();window.UICaracteres._abrirModalGenerarDerivadas(${raiz.id}, '${raiz.palabra}', '${raiz.pinyin || ''}', '${raiz.significado || ''}')" 
                            style="padding:4px 14px;font-size:11px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;">
                        <i class="fas fa-plus"></i> Añadir derivadas
                    </button>
                    <button class="btn-secondary" onclick="event.stopPropagation();window.UICaracteres._generarEstudioCompleto(${raiz.id})" 
                            style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;border:none;border-radius:4px;cursor:pointer;">
                        <i class="fas fa-brain"></i> ${tieneEstudioCompleto ? 'Actualizar' : 'Generar'} Estudio
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================================
    // RENDERIZAR VISTA DE ESTUDIO COMPLETO
    // ============================================================

    static async renderizarEstudioCompletoVista(uiCaracteres, caracter, idioma, nivelUsuario) {
        if (!caracter) return '<div style="text-align:center;padding:40px;color:var(--gray);">Carácter no encontrado</div>';

        const idiomaNativo = uiCaracteres._obtenerIdiomaNativo();
        const nombreIdioma = uiCaracteres._getNombreIdioma(idioma);

        const caracterActualizado = await db.get('palabras', caracter.id);
        if (!caracterActualizado) {
            return '<div style="text-align:center;padding:40px;color:var(--gray);">Carácter no encontrado en la base de datos</div>';
        }

        let estudio = null;
        
        if (caracterActualizado._estudio_completo_data) {
            estudio = caracterActualizado._estudio_completo_data;
        }
        if (!estudio && caracterActualizado._estudio_completo) {
            try {
                estudio = JSON.parse(caracterActualizado._estudio_completo);
            } catch (e) {}
        }
        if (!estudio) {
            estudio = uiCaracteres._cacheEstudiosCompletos[caracter.id];
        }
        if (!estudio || Object.keys(estudio).length === 0) {
            estudio = {
                caracter_raiz: caracterActualizado.palabra,
                pinyin: caracterActualizado.pinyin || '',
                significado: caracterActualizado.significado || '',
                mnemotecnia_avanzada: caracterActualizado.mnemotecnia || '',
                evolucion_historica: caracterActualizado.evolucion_historica || null,
                componentes: caracterActualizado.componentes || null,
                variantes: caracterActualizado.variantes || null,
                usos_modernos: caracterActualizado.usos_modernos || null,
                conexiones_culturales: caracterActualizado.conexiones_culturales || null,
                simbologia: caracterActualizado.simbologia || null,
                caracteres_similares: caracterActualizado.caracteres_similares || [],
                errores_comunes: caracterActualizado.errores_comunes || [],
                srs_sugerencias: caracterActualizado.srs_sugerencias || null,
                ejercicios: caracterActualizado.ejercicios || [],
                logros: caracterActualizado.logros || [],
                frases_ejemplo: caracterActualizado.frases_ejemplo || []
            };
        }

        const tieneDatosValidos = estudio && 
            estudio.significado && 
            estudio.significado !== caracterActualizado.palabra &&
            Object.keys(estudio).length > 5;

        if (!tieneDatosValidos) {
            return `
                <div style="text-align:center;padding:60px 20px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--warning);">
                    <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                    <p style="font-size:16px;font-weight:600;">El estudio completo no tiene datos válidos</p>
                    <p style="font-size:13px;color:var(--gray-light);">
                        El JSON importado no contiene información real del carácter.
                        <br>Vuelve a generar el estudio y asegúrate de que la IA complete TODOS los campos.
                    </p>
                    <p style="font-size:12px;color:var(--gray-light);margin-top:4px;">
                        💡 El significado actual es: "${estudio?.significado || 'No disponible'}"
                    </p>
                    <button class="btn-primary" onclick="window.UICaracteres._generarEstudioCompleto(${caracter.id})" style="margin-top:12px;padding:10px 24px;">
                        <i class="fas fa-brain"></i> Generar Estudio Completo
                    </button>
                </div>
            `;
        }

        const pinyin = estudio.pinyin || caracterActualizado.pinyin || '';
        const significado = estudio.significado || caracterActualizado.significado || 'Sin significado';

        let html = `
            <div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                <button class="btn-secondary" onclick="window.UICaracteres._volverEstudio()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                    <i class="fas fa-arrow-left"></i> Volver al estudio
                </button>
                <button class="btn-secondary" onclick="window.UICaracteres._volverBiblioteca()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                    <i class="fas fa-home"></i> Biblioteca
                </button>
                <button class="btn-primary" onclick="window.UICaracteres._generarEstudioCompleto(${caracter.id})" 
                        style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;">
                    <i class="fas fa-sync"></i> Actualizar estudio
                </button>
                <button class="btn-success" onclick="window.UICaracteres._exportarEstudio(${caracter.id})" 
                        style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:6px;cursor:pointer;">
                    <i class="fas fa-download"></i> Exportar estudio
                </button>
            </div>

            <div style="background:linear-gradient(135deg, var(--primary)10, var(--secondary)10);border-radius:14px;padding:20px 24px;margin-bottom:20px;border:2px solid var(--primary)20;">
                <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
                    <div style="text-align:center;">
                        <div style="font-size:80px;font-weight:800;color:var(--dark);">${caracterActualizado.palabra}</div>
                        ${pinyin ? `<div style="font-size:22px;color:var(--gray-light);letter-spacing:2px;">🔊 ${pinyin}</div>` : ''}
                    </div>
                    <div style="flex:1;">
                        <div style="font-size:24px;font-weight:700;color:var(--dark);">${significado}</div>
                        <div style="font-size:12px;color:var(--gray);margin-top:4px;">
                            ${idioma} · Nivel ${caracterActualizado.nivel || nivelUsuario} · ${nombreIdioma}
                            <span style="margin-left:12px;font-size:11px;color:var(--success);">✅ Estudio completo importado</span>
                        </div>
                    </div>
                    <div style="text-align:center;min-width:100px;">
                        <div style="font-size:12px;color:var(--gray);">RCN</div>
                        <div style="font-size:32px;font-weight:800;color:${(caracterActualizado.neuroScore || 0) >= 4 ? 'var(--success)' : (caracterActualizado.neuroScore || 0) >= 2 ? 'var(--warning)' : 'var(--danger)'};">${(caracterActualizado.neuroScore || 0).toFixed(1)}</div>
                    </div>
                </div>
            </div>
        `;

        // Evolución Histórica
        if (estudio.evolucion_historica && Object.keys(estudio.evolucion_historica).length > 0) {
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;margin-bottom:12px;border-left:4px solid var(--primary);box-shadow:var(--shadow);">
                    <div style="font-size:13px;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">📜 Evolución Histórica</div>
                    ${estudio.evolucion_historica.origen ? `<div style="font-size:13px;color:var(--dark);margin-bottom:2px;"><strong>Origen:</strong> ${estudio.evolucion_historica.origen}</div>` : ''}
                    ${estudio.evolucion_historica.significado_original ? `<div style="font-size:13px;color:var(--dark);margin-bottom:2px;"><strong>Significado original:</strong> ${estudio.evolucion_historica.significado_original}</div>` : ''}
                    ${estudio.evolucion_historica.evolucion ? `<div style="font-size:13px;color:var(--gray);margin-bottom:2px;"><strong>Evolución:</strong> ${estudio.evolucion_historica.evolucion}</div>` : ''}
                </div>
            `;
        }

        // Componentes
        if (estudio.componentes && Object.keys(estudio.componentes).length > 0) {
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;margin-bottom:12px;border-left:4px solid var(--secondary);box-shadow:var(--shadow);">
                    <div style="font-size:13px;font-weight:700;color:var(--secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">🧩 Componentes y Radicales</div>
                    ${estudio.componentes.radical ? `<div style="font-size:13px;color:var(--dark);margin-bottom:2px;"><strong>Radical:</strong> ${estudio.componentes.radical}</div>` : ''}
                    ${estudio.componentes.partes && estudio.componentes.partes.length > 0 ? `
                        <div style="font-size:13px;color:var(--dark);margin-bottom:2px;"><strong>Partes:</strong> ${estudio.componentes.partes.join(' · ')}</div>
                    ` : ''}
                    ${estudio.componentes.explicacion ? `<div style="font-size:13px;color:var(--gray);margin-bottom:2px;">${estudio.componentes.explicacion}</div>` : ''}
                </div>
            `;
        }

        // Variantes
        if (estudio.variantes && Object.keys(estudio.variantes).length > 0) {
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;margin-bottom:12px;border-left:4px solid var(--warning);box-shadow:var(--shadow);">
                    <div style="font-size:13px;font-weight:700;color:var(--warning);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">🔄 Variantes</div>
                    ${estudio.variantes.tradicional ? `<div style="font-size:13px;color:var(--dark);"><strong>Tradicional:</strong> ${estudio.variantes.tradicional}</div>` : ''}
                    ${estudio.variantes.simplificado ? `<div style="font-size:13px;color:var(--dark);"><strong>Simplificado:</strong> ${estudio.variantes.simplificado}</div>` : ''}
                    ${estudio.variantes.otras_formas && estudio.variantes.otras_formas.length > 0 ? `
                        <div style="font-size:13px;color:var(--gray);margin-top:2px;"><strong>Otras formas:</strong> ${estudio.variantes.otras_formas.join(' · ')}</div>
                    ` : ''}
                </div>
            `;
        }

        // Usos Modernos
        if (estudio.usos_modernos && Object.keys(estudio.usos_modernos).length > 0) {
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;margin-bottom:12px;border-left:4px solid var(--info);box-shadow:var(--shadow);">
                    <div style="font-size:13px;font-weight:700;color:var(--info);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">📱 Usos Modernos</div>
                    ${estudio.usos_modernos.frecuencia ? `<div style="font-size:13px;color:var(--dark);margin-bottom:2px;"><strong>Frecuencia:</strong> ${estudio.usos_modernos.frecuencia}</div>` : ''}
                    ${estudio.usos_modernos.contextos && estudio.usos_modernos.contextos.length > 0 ? `
                        <div style="font-size:13px;color:var(--gray);margin-bottom:2px;"><strong>Contextos:</strong> ${estudio.usos_modernos.contextos.join(' · ')}</div>
                    ` : ''}
                    ${estudio.usos_modernos.expresiones_comunes && estudio.usos_modernos.expresiones_comunes.length > 0 ? `
                        <div style="font-size:13px;color:var(--dark);margin-top:4px;"><strong>Expresiones comunes:</strong></div>
                        ${estudio.usos_modernos.expresiones_comunes.map(e => `<div style="font-size:12px;color:var(--gray);padding:2px 8px;background:var(--bg);border-radius:4px;margin:2px 0;">${e}</div>`).join('')}
                    ` : ''}
                </div>
            `;
        }

        // Conexiones Culturales
        if (estudio.conexiones_culturales) {
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;margin-bottom:12px;border-left:4px solid var(--success);box-shadow:var(--shadow);">
                    <div style="font-size:13px;font-weight:700;color:var(--success);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">🌍 Conexiones Culturales</div>
                    <div style="font-size:13px;color:var(--gray);">${estudio.conexiones_culturales}</div>
                </div>
            `;
        }

        // Simbología
        if (estudio.simbologia) {
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;margin-bottom:12px;border-left:4px solid var(--purple);box-shadow:var(--shadow);">
                    <div style="font-size:13px;font-weight:700;color:var(--purple);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">🔮 Simbología</div>
                    <div style="font-size:13px;color:var(--gray);">${estudio.simbologia}</div>
                </div>
            `;
        }

        // Caracteres Similares
        if (estudio.caracteres_similares && estudio.caracteres_similares.length > 0) {
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;margin-bottom:12px;border-left:4px solid var(--danger);box-shadow:var(--shadow);">
                    <div style="font-size:13px;font-weight:700;color:var(--danger);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">🔍 Caracteres Similares</div>
                    ${estudio.caracteres_similares.map(c => `
                        <div style="display:flex;flex-wrap:wrap;gap:8px;padding:4px 0;border-bottom:1px solid var(--light);">
                            <span style="font-weight:700;font-size:16px;">${c.caracter}</span>
                            <span style="font-size:12px;color:var(--gray-light);">${c.pinyin || ''}</span>
                            <span style="font-size:12px;color:var(--dark);">${c.significado || ''}</span>
                            <span style="font-size:11px;color:var(--gray-light);font-style:italic;">${c.diferencia || ''}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Errores Comunes
        if (estudio.errores_comunes && estudio.errores_comunes.length > 0) {
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;margin-bottom:12px;border-left:4px solid var(--error);box-shadow:var(--shadow);">
                    <div style="font-size:13px;font-weight:700;color:var(--error);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">⚠️ Errores Comunes</div>
                    ${estudio.errores_comunes.map(e => `
                        <div style="font-size:12px;color:var(--gray);padding:2px 0;">• ${e}</div>
                    `).join('')}
                </div>
            `;
        }

        // Mnemotecnia Avanzada
        if (estudio.mnemotecnia_avanzada) {
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;margin-bottom:12px;border-left:4px solid var(--primary);box-shadow:var(--shadow);">
                    <div style="font-size:13px;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">💡 Mnemotecnia Avanzada</div>
                    <div style="font-size:13px;color:var(--dark);">${estudio.mnemotecnia_avanzada}</div>
                </div>
            `;
        }

        // Sugerencias SRS
        if (estudio.srs_sugerencias) {
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;margin-bottom:12px;border-left:4px solid var(--secondary);box-shadow:var(--shadow);">
                    <div style="font-size:13px;font-weight:700;color:var(--secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">📅 Sugerencias SRS</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
                        ${estudio.srs_sugerencias.nuevo ? `<div style="background:var(--bg);padding:6px 12px;border-radius:6px;text-align:center;font-size:12px;"><strong>Nuevo</strong><br>${Math.round(estudio.srs_sugerencias.nuevo / 60)} min</div>` : ''}
                        ${estudio.srs_sugerencias.en_progreso ? `<div style="background:var(--bg);padding:6px 12px;border-radius:6px;text-align:center;font-size:12px;"><strong>En progreso</strong><br>${Math.round(estudio.srs_sugerencias.en_progreso / 3600)} h</div>` : ''}
                        ${estudio.srs_sugerencias.dominado ? `<div style="background:var(--bg);padding:6px 12px;border-radius:6px;text-align:center;font-size:12px;"><strong>Dominado</strong><br>${Math.round(estudio.srs_sugerencias.dominado / 86400)} días</div>` : ''}
                    </div>
                </div>
            `;
        }

        // Ejercicios
        if (estudio.ejercicios && estudio.ejercicios.length > 0) {
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;margin-bottom:12px;border-left:4px solid var(--success);box-shadow:var(--shadow);">
                    <div style="font-size:13px;font-weight:700;color:var(--success);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">🎯 Ejercicios (${estudio.ejercicios.length})</div>
                    ${estudio.ejercicios.map((ej, idx) => `
                        <div style="background:var(--bg);border-radius:6px;padding:10px 14px;margin-bottom:6px;border:1px solid var(--light);">
                            <div style="font-size:11px;color:var(--gray);font-weight:600;">${idx + 1}. ${ej.tipo || 'Ejercicio'}</div>
                            <div style="font-size:13px;color:var(--dark);">${ej.pregunta || ''}</div>
                            <div style="font-size:12px;color:var(--success);margin-top:2px;">✓ ${ej.respuesta || ''}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Logros
        if (estudio.logros && estudio.logros.length > 0) {
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;margin-bottom:12px;border-left:4px solid var(--warning);box-shadow:var(--shadow);">
                    <div style="font-size:13px;font-weight:700;color:var(--warning);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">🏆 Logros (${estudio.logros.length})</div>
                    ${estudio.logros.map(l => `
                        <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--light);">
                            <span style="font-size:18px;">🏅</span>
                            <div>
                                <div style="font-size:13px;font-weight:600;color:var(--dark);">${l.nombre || ''}</div>
                                <div style="font-size:11px;color:var(--gray-light);">${l.descripcion || ''}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Palabras Derivadas por Nivel
        if (estudio.palabras_por_nivel) {
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;margin-bottom:12px;border-left:4px solid var(--secondary);box-shadow:var(--shadow);">
                    <div style="font-size:13px;font-weight:700;color:var(--secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">📚 Palabras Derivadas por Nivel</div>
                    ${Object.entries(estudio.palabras_por_nivel).map(([nivel, palabras]) => {
                        if (!palabras || palabras.length === 0) return '';
                        return `
                            <div style="margin-bottom:6px;">
                                <div style="font-size:12px;font-weight:600;color:var(--primary);">📖 Nivel ${nivel} (${palabras.length})</div>
                                <div style="display:flex;flex-wrap:wrap;gap:4px;">
                                    ${palabras.map(p => `
                                        <span style="font-size:12px;background:var(--bg);padding:2px 10px;border-radius:10px;border:1px solid var(--light);">
                                            ${p.palabra || ''} ${p.pinyin ? `(${p.pinyin})` : ''}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        // Frases de Ejemplo
        if (estudio.frases_ejemplo && estudio.frases_ejemplo.length > 0) {
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;margin-bottom:12px;border-left:4px solid var(--info);box-shadow:var(--shadow);">
                    <div style="font-size:13px;font-weight:700;color:var(--info);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">📝 Frases de Ejemplo</div>
                    ${estudio.frases_ejemplo.map(f => `
                        <div style="background:var(--bg);border-radius:6px;padding:8px 12px;margin-bottom:4px;border:1px solid var(--light);">
                            <div style="font-size:16px;font-weight:600;color:var(--dark);">${f.frase || ''}</div>
                            ${f.pinyin ? `<div style="font-size:13px;color:var(--gray-light);">🔊 ${f.pinyin}</div>` : ''}
                            <div style="font-size:14px;color:var(--gray);">→ ${f.traduccion || ''}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Resumen
        html += `
            <div style="background:var(--bg);border-radius:10px;padding:12px 16px;margin-bottom:12px;border:1px solid var(--success);">
                <div style="font-size:12px;font-weight:600;color:var(--success);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">📊 Resumen del Estudio</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;font-size:11px;color:var(--gray);">
                    ${estudio.palabras_por_nivel ? `<div>📚 ${Object.values(estudio.palabras_por_nivel).reduce((acc, arr) => acc + (arr ? arr.length : 0), 0)} palabras derivadas</div>` : ''}
                    ${estudio.frases_ejemplo ? `<div>📝 ${estudio.frases_ejemplo.length} frases de ejemplo</div>` : ''}
                    ${estudio.ejercicios ? `<div>🎯 ${estudio.ejercicios.length} ejercicios</div>` : ''}
                    ${estudio.logros ? `<div>🏆 ${estudio.logros.length} logros</div>` : ''}
                    ${estudio.caracteres_similares ? `<div>🔍 ${estudio.caracteres_similares.length} similares</div>` : ''}
                    ${estudio.errores_comunes ? `<div>⚠️ ${estudio.errores_comunes.length} errores comunes</div>` : ''}
                </div>
            </div>
        `;

        // Botones
        html += `
            <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;">
                <button class="btn-secondary" onclick="window.UICaracteres._volverEstudio()" style="padding:10px 24px;">
                    <i class="fas fa-arrow-left"></i> Volver al estudio
                </button>
                <button class="btn-primary" onclick="window.UICaracteres._generarEstudioCompleto(${caracter.id})" 
                        style="padding:10px 24px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:8px;cursor:pointer;">
                    <i class="fas fa-sync"></i> Actualizar estudio
                </button>
                <button class="btn-success" onclick="window.UICaracteres._exportarEstudio(${caracter.id})" 
                        style="padding:10px 24px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:8px;cursor:pointer;">
                    <i class="fas fa-download"></i> Exportar estudio
                </button>
            </div>
        `;

        return html;
    }

    // ============================================================
    // RENDERIZAR ESTUDIO AVANZADO CON PAGINACIÓN DE DERIVADAS
    // ============================================================

    static async renderizarEstudioAvanzado(uiCaracteres, familia, idioma, nivelUsuario, itemsPorPagina) {
        if (!familia) return '<div style="text-align:center;padding:40px;color:var(--gray);">Familia no encontrada</div>';

        const raiz = familia.caracterRaiz;
        const derivadas = familia.palabrasDerivadas || [];
        const modo = uiCaracteres._modoEstudio;
        const nombreIdioma = uiCaracteres._getNombreIdioma(idioma);
        const idiomaNativo = uiCaracteres._obtenerIdiomaNativo();

        let estudioCompleto = uiCaracteres._cacheEstudiosCompletos[raiz.id];
        if (!estudioCompleto) {
            estudioCompleto = await uiCaracteres._obtenerEstudioCompleto(raiz.id, idioma);
        }

        const logrosCaracter = await uiCaracteres._obtenerLogrosCaracter(raiz.id);
        const tieneEstudioCompleto = estudioCompleto && Object.keys(estudioCompleto).length > 0;

        // 🔥 PAGINACIÓN DE DERIVADAS
        const totalDerivadas = derivadas.length;
        const totalPaginasDerivadas = Math.max(1, Math.ceil(totalDerivadas / (itemsPorPagina || 9)));
        let paginaDerivadas = uiCaracteres._paginaDerivadas || 1;
        if (paginaDerivadas < 1) paginaDerivadas = 1;
        if (paginaDerivadas > totalPaginasDerivadas) paginaDerivadas = totalPaginasDerivadas;
        uiCaracteres._paginaDerivadas = paginaDerivadas;

        const inicioDerivadas = (paginaDerivadas - 1) * (itemsPorPagina || 9);
        const finDerivadas = Math.min(inicioDerivadas + (itemsPorPagina || 9), totalDerivadas);
        const derivadasPagina = derivadas.slice(inicioDerivadas, finDerivadas);

        let html = `
            <div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                <button class="btn-secondary" onclick="window.UICaracteres._volverBiblioteca()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                    <i class="fas fa-arrow-left"></i> Volver
                </button>
                ${uiCaracteres.MODOS_ESTUDIO.map(m => `
                    <button class="btn-secondary" onclick="window.UICaracteres._cambiarModoEstudio('${m.id}')" 
                            style="padding:6px 14px;font-size:12px;${modo === m.id ? 'background:var(--primary);color:white;border:none;' : 'background:var(--bg);border:1px solid var(--light);'}border-radius:6px;cursor:pointer;transition:all 0.3s;">
                        ${m.icono} ${m.nombre}
                    </button>
                `).join('')}
                <button class="btn-primary" onclick="window.UICaracteres._abrirModalGenerarDerivadas(${raiz.id}, '${raiz.palabra}', '${raiz.pinyin || ''}', '${raiz.significado || ''}')" 
                        style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;">
                    <i class="fas fa-magic"></i> Generar más derivadas
                </button>
                ${tieneEstudioCompleto ? `
                    <button class="btn-secondary" onclick="window.UICaracteres._verEstudioCompleto(${raiz.id})" 
                            style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;border:none;border-radius:6px;cursor:pointer;">
                        <i class="fas fa-book"></i> Ver Estudio Completo
                    </button>
                ` : ''}
                <button class="btn-secondary" onclick="window.UICaracteres._generarEstudioCompleto(${raiz.id})" 
                        style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;">
                    <i class="fas fa-brain"></i> ${tieneEstudioCompleto ? 'Actualizar' : 'Generar'} Estudio
                </button>
            </div>

            <!-- PERFIL DEL CARÁCTER -->
            <div style="background:linear-gradient(135deg, var(--primary)05, var(--secondary)05);border-radius:14px;padding:20px 24px;margin-bottom:20px;border:2px solid var(--primary)20;box-shadow:0 4px 20px rgba(108,92,231,0.06);">
                <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
                    <div style="text-align:center;">
                        <div style="font-size:64px;font-weight:800;color:var(--dark);">${raiz.palabra}</div>
                        <div style="font-size:18px;color:var(--gray-light);letter-spacing:2px;">${raiz.pinyin || ''}</div>
                    </div>

                    <div style="flex:1;min-width:200px;">
                        <div style="font-size:20px;font-weight:700;color:var(--dark);">${raiz.significado || 'Significado base'}</div>
                        <div style="font-size:14px;color:var(--gray);margin-top:4px;display:flex;flex-wrap:wrap;gap:12px;">
                            <span>📚 ${nombreIdioma}</span>
                            <span>🎯 Nivel ${raiz.nivel || nivelUsuario}</span>
                            <span>✍️ ${raiz.numero_trazos || '?'} trazos</span>
                            <span>🏷️ ${raiz.estructura?.tipo_estructura || 'Estructura desconocida'}</span>
                            <span>🧠 RCN: ${(raiz.neuroScore || 0).toFixed(1)}</span>
                            ${tieneEstudioCompleto ? '<span style="color:var(--success);">📚 Estudio completo</span>' : ''}
                        </div>

                        ${raiz.estructura?.radicales?.length > 0 ? `
                            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
                                <span style="font-size:11px;font-weight:600;color:var(--gray);">🔍 Radicales:</span>
                                ${raiz.estructura.radicales.map(r => `
                                    <span style="font-size:12px;background:var(--primary)10;padding:2px 12px;border-radius:10px;color:var(--primary);">${r}</span>
                                `).join('')}
                            </div>
                        ` : ''}

                        ${raiz.mnemotecnia ? `
                            <div style="margin-top:8px;padding:10px 16px;background:var(--white);border-radius:8px;border-left:4px solid var(--primary);font-size:14px;color:var(--dark);">
                                💡 ${raiz.mnemotecnia}
                            </div>
                        ` : ''}
                    </div>

                    <div style="text-align:center;min-width:100px;">
                        <div style="font-size:12px;color:var(--gray);">🏆 Logros</div>
                        <div style="font-size:28px;margin-top:4px;">${logrosCaracter.length > 0 ? logrosCaracter.map(l => l.icono).join('') : '📖'}</div>
                        <div style="font-size:11px;color:var(--gray-light);">${logrosCaracter.length} desbloqueados</div>
                    </div>
                </div>

                <div style="margin-top:12px;padding:10px 16px;background:var(--white);border-radius:8px;border-left:3px solid var(--secondary);font-size:13px;color:var(--gray);">
                    <span style="font-weight:600;color:var(--dark);">🧠 Vigía Gramatical dice:</span> 
                    ${uiCaracteres._generarMensajeVigia(raiz, derivadas, nivelUsuario)}
                </div>
            </div>

            <!-- PALABRAS DERIVADAS CON PAGINACIÓN -->
            <div style="margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
                    <h4 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">
                        📖 Palabras derivadas (${derivadas.length})
                        ${totalPaginasDerivadas > 1 ? `· 📄 Página ${paginaDerivadas}/${totalPaginasDerivadas}` : ''}
                        <span style="font-size:12px;font-weight:400;color:var(--gray-light);"> · Haz clic para ver detalle</span>
                    </h4>
                    <button class="btn-primary" onclick="window.UICaracteres._abrirModalGenerarDerivadas(${raiz.id}, '${raiz.palabra}', '${raiz.pinyin || ''}', '${raiz.significado || ''}')" 
                            style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;">
                        <i class="fas fa-plus"></i> Añadir más
                    </button>
                </div>

                ${derivadas.length === 0 ? `
                    <div style="text-align:center;padding:30px;color:var(--gray);background:var(--bg);border-radius:10px;border:2px dashed var(--light);">
                        <p style="font-size:15px;">No hay palabras derivadas para este carácter.</p>
                        <p style="font-size:13px;color:var(--gray-light);">Usa el botón "Añadir más" para generar palabras con IA.</p>
                    </div>
                ` : `
                    <div id="palabrasDerivadasContainer" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;">
                        ${derivadasPagina.map(p => UICaracteresRender.renderizarPalabraDerivadaProfesional(uiCaracteres, p, idioma, nivelUsuario)).join('')}
                    </div>
                    
                    ${totalPaginasDerivadas > 1 ? `
                        <div style="display:flex;justify-content:center;margin-top:16px;">
                            ${UICaracteresRender.renderizarPaginadorDerivadas(paginaDerivadas, totalPaginasDerivadas)}
                        </div>
                    ` : ''}
                `}
            </div>

            <!-- EJERCICIOS -->
            <div style="background:var(--bg);border-radius:12px;padding:20px;border:1px solid var(--light);margin-top:8px;">
                <h4 style="font-size:16px;font-weight:700;color:var(--dark);margin:0 0 12px 0;">
                    🎯 Ejercicios · Modo <span style="color:var(--primary);">${uiCaracteres.MODOS_ESTUDIO.find(m => m.id === modo)?.nombre || modo}</span>
                </h4>
                ${uiCaracteres._renderizarEjercicioProfesional(modo, raiz, derivadas, idioma, nivelUsuario)}
            </div>
        `;

        return html;
    }

    // ============================================================
    // 🔥 PAGINADOR DE DERIVADAS - CORREGIDO
    // ============================================================

    static renderizarPaginadorDerivadas(paginaActual, totalPaginas) {
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
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <button class="btn-secondary" 
                        onclick="UICaracteresRender.irPagina('derivadas', ${paginaActual - 1})" 
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
                            onclick="UICaracteresRender.irPagina('derivadas', ${p})" 
                            style="padding:4px 12px;font-size:11px;${isActive ? 'background:var(--primary);color:white;border-color:var(--primary);' : 'background:var(--white);color:var(--dark);border-color:var(--light);'}border:1px solid;border-radius:4px;cursor:pointer;">
                        ${p}
                    </button>
                `;
            }
        }

        html += `
                <button class="btn-secondary" 
                        onclick="UICaracteresRender.irPagina('derivadas', ${paginaActual + 1})" 
                        style="padding:4px 12px;font-size:11px;${paginaActual >= totalPaginas ? 'opacity:0.5;cursor:default;' : ''}" 
                        ${paginaActual >= totalPaginas ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;

        return html;
    }

    // ============================================================
    // RENDERIZAR PALABRA DERIVADA PROFESIONAL
    // ============================================================

    static renderizarPalabraDerivadaProfesional(uiCaracteres, palabra, idioma, nivelUsuario) {
        const idiomaNativo = uiCaracteres._obtenerIdiomaNativo();
        const texto = palabra.palabra || '';
        const pinyin = palabra.pinyin || '';
        const significado = palabra.significado || '';
        const desglose = palabra.desgloseMorfologico || '';
        const asociacion = palabra.asociacionVisual || '';
        const ejemploFrase = palabra.ejemploFrase || '';
        const traduccionFrase = palabra.traduccionFrase || '';
        const familiaSemantica = palabra.familiaSemanticaPrincipal || palabra.familiaSemantica || 'General';
        const colorSemantica = uiCaracteres._getColorFamiliaSemantica(familiaSemantica);
        const esGenerada = palabra._generadaPorIA === true;
        const nivel = palabra.nivel || nivelUsuario;

        return `
            <div onclick="window.UICaracteres._seleccionarPalabraDerivada(${palabra.id})" 
                 style="background:${esGenerada ? 'var(--primary)05' : 'var(--white)'};border-radius:12px;padding:16px 18px;box-shadow:var(--shadow);border-left:5px solid ${esGenerada ? 'var(--primary)' : colorSemantica};cursor:pointer;transition:all 0.3s;"
                 onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 6px 25px rgba(0,0,0,0.12)'" 
                 onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">

                ${esGenerada ? `<div style="font-size:10px;color:var(--primary);font-weight:600;margin-bottom:4px;">✨ Generada con IA</div>` : ''}

                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;">
                    <div>
                        <span style="font-size:24px;font-weight:700;color:var(--dark);">${texto}</span>
                        ${pinyin ? `<span style="font-size:16px;color:var(--gray-light);margin-left:10px;letter-spacing:1px;">🔊 ${pinyin}</span>` : 
                                   `<span style="font-size:12px;color:var(--danger);margin-left:10px;">⚠️ Sin pinyin</span>`}
                    </div>
                    <span style="font-size:12px;font-weight:600;color:${colorSemantica};background:${colorSemantica}15;padding:2px 14px;border-radius:12px;">
                        📂 ${familiaSemantica}
                    </span>
                </div>

                <div style="font-size:16px;color:var(--gray);margin-top:6px;">
                    ${significado || 'Sin definición'} 
                    <span style="font-size:12px;color:var(--gray-light);">(${idiomaNativo})</span>
                    <span style="font-size:12px;color:${uiCaracteres.NIVEL_COLORES[nivel] || 'var(--gray)'};margin-left:8px;">🎯 ${nivel}</span>
                </div>

                ${desglose ? `
                    <div style="font-size:13px;color:var(--gray-light);margin-top:6px;padding:4px 12px;background:var(--bg);border-radius:6px;">
                        📝 ${desglose}
                    </div>
                ` : ''}

                ${asociacion ? `
                    <div style="font-size:13px;color:var(--gray-light);margin-top:4px;">
                        💡 ${asociacion}
                    </div>
                ` : ''}

                ${ejemploFrase ? `
                    <div style="margin-top:10px;padding:10px 14px;background:var(--bg);border-radius:8px;border:1px solid var(--light);">
                        <div style="font-size:15px;font-weight:600;color:var(--dark);">📝 "${ejemploFrase}"</div>
                        ${traduccionFrase ? `<div style="font-size:14px;color:var(--gray);margin-top:2px;">→ ${traduccionFrase}</div>` : 
                          `<div style="font-size:12px;color:var(--gray-light);margin-top:2px;">💡 Traducción pendiente</div>`}
                    </div>
                ` : ''}

                <div style="display:flex;gap:10px;margin-top:10px;font-size:12px;color:var(--gray-light);flex-wrap:wrap;">
                    <span>🎯 Nivel ${nivel}</span>
                    <span>📂 ${familiaSemantica}</span>
                    ${esGenerada ? `<span style="color:var(--primary);">✨ IA</span>` : ''}
                    <button class="btn-secondary" onclick="event.stopPropagation();window.UICaracteres._practicarPalabraDerivada('${texto}', '${idioma}')" 
                            style="padding:3px 14px;font-size:11px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;">
                        <i class="fas fa-pencil-alt"></i> Practicar
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================================
    // RENDERIZAR EJERCICIO PROFESIONAL
    // ============================================================

    static renderizarEjercicioProfesional(uiCaracteres, modo, raiz, derivadas, idioma, nivelUsuario) {
        return `
            <div style="text-align:center;padding:20px;color:var(--gray);">
                <p style="font-size:15px;">🎯 Ejercicios disponibles en el modo <strong>${uiCaracteres.MODOS_ESTUDIO.find(m => m.id === modo)?.nombre || modo}</strong></p>
                <p style="font-size:13px;color:var(--gray-light);">Practica con las palabras derivadas y el carácter raíz.</p>
            </div>
        `;
    }

    // ============================================================
    // RENDERIZAR DETALLE PROFESIONAL
    // ============================================================

    static async renderizarDetalleProfesional(uiCaracteres, caracter, idioma, nivelUsuario) {
        if (!caracter) return '<div style="text-align:center;padding:40px;color:var(--gray);">Carácter no encontrado</div>';

        const idiomaNativo = uiCaracteres._obtenerIdiomaNativo();
        const nombreIdioma = uiCaracteres._getNombreIdioma(idioma);

        let estudioCompleto = uiCaracteres._cacheEstudiosCompletos[caracter.id];
        if (!estudioCompleto) {
            estudioCompleto = await uiCaracteres._obtenerEstudioCompleto(caracter.id, idioma);
        }

        const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
        const derivadas = todasPalabras.filter(p =>
            p.esPalabraDerivada &&
            p.caracterRaiz === caracter.palabra
        );

        const tieneEstudioCompleto = estudioCompleto && Object.keys(estudioCompleto).length > 0;

        return `
            <div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn-secondary" onclick="window.UICaracteres._volverEstudio()" style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                    <i class="fas fa-arrow-left"></i> Volver al estudio
                </button>
                ${tieneEstudioCompleto ? `
                    <button class="btn-secondary" onclick="window.UICaracteres._verEstudioCompleto(${caracter.id})" 
                            style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;border:none;border-radius:6px;cursor:pointer;">
                        <i class="fas fa-book"></i> Ver Estudio Completo
                    </button>
                ` : ''}
                <button class="btn-primary" onclick="window.UICaracteres._generarEstudioCompleto(${caracter.id})" 
                        style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;">
                    <i class="fas fa-brain"></i> ${tieneEstudioCompleto ? 'Actualizar' : 'Generar'} Estudio
                </button>
                <button class="btn-success" onclick="window.UICaracteres._exportarEstudio(${caracter.id})" 
                        style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#00B894,#55EFC4);color:white;border:none;border-radius:6px;cursor:pointer;">
                    <i class="fas fa-download"></i> Exportar estudio
                </button>
            </div>

            <div style="background:var(--white);border-radius:14px;padding:24px 28px;box-shadow:var(--shadow);">
                <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;margin-bottom:20px;">
                    <div style="text-align:center;">
                        <div style="font-size:80px;font-weight:800;color:var(--dark);">${caracter.palabra}</div>
                        <div style="font-size:22px;color:var(--gray-light);letter-spacing:2px;">${caracter.pinyin || ''}</div>
                    </div>
                    <div style="flex:1;min-width:200px;">
                        <h3 style="font-size:22px;font-weight:700;color:var(--dark);margin:0;">${caracter.significado || 'Sin significado'}</h3>
                        <div style="font-size:15px;color:var(--gray);margin-top:6px;display:flex;flex-wrap:wrap;gap:12px;">
                            <span>📚 ${nombreIdioma}</span>
                            <span>🎯 Nivel ${caracter.nivel || nivelUsuario}</span>
                            <span>✍️ ${caracter.numero_trazos || '?'} trazos</span>
                            <span>🧠 RCN: ${(caracter.neuroScore || 0).toFixed(1)}</span>
                            ${tieneEstudioCompleto ? '<span style="color:var(--success);">📚 Estudio completo</span>' : ''}
                        </div>
                        ${caracter.mnemotecnia ? `
                            <div style="margin-top:10px;padding:12px 18px;background:linear-gradient(135deg, var(--primary)08, var(--secondary)08);border-radius:8px;border-left:4px solid var(--primary);font-size:15px;color:var(--dark);">
                                💡 ${caracter.mnemotecnia}
                            </div>
                        ` : ''}
                    </div>
                    <div style="text-align:center;min-width:120px;">
                        <div style="font-size:12px;color:var(--gray);">Nivel de dominio</div>
                        <div style="font-size:40px;font-weight:800;color:${(caracter.neuroScore || 0) >= 4 ? 'var(--success)' : (caracter.neuroScore || 0) >= 2 ? 'var(--warning)' : 'var(--danger)'};">${(caracter.neuroScore || 0).toFixed(1)}</div>
                    </div>
                </div>

                <div style="border-top:2px solid var(--light);padding-top:20px;margin-top:8px;">
                    <h4 style="font-size:17px;font-weight:700;color:var(--dark);margin:0 0 14px 0;">
                        📖 Palabras derivadas (${derivadas.length})
                        <span style="font-size:13px;font-weight:400;color:var(--gray-light);"> · Nivel ${nivelUsuario}</span>
                        <button class="btn-primary" onclick="window.UICaracteres._abrirModalGenerarDerivadas(${caracter.id}, '${caracter.palabra}', '${caracter.pinyin || ''}', '${caracter.significado || ''}')" 
                                style="padding:3px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;margin-left:12px;">
                            <i class="fas fa-plus"></i> Añadir más
                        </button>
                    </h4>

                    ${derivadas.length === 0 ? `
                        <div style="text-align:center;padding:30px;color:var(--gray);background:var(--bg);border-radius:10px;border:2px dashed var(--light);">
                            <p style="font-size:15px;">No hay palabras derivadas para este carácter.</p>
                            <p style="font-size:13px;color:var(--gray-light);">Usa el botón "Añadir más" para generar palabras con IA.</p>
                        </div>
                    ` : `
                        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;">
                            ${derivadas.map(p => UICaracteresRender.renderizarPalabraDerivadaProfesional(uiCaracteres, p, idioma, nivelUsuario)).join('')}
                        </div>
                    `}
                </div>

                <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;border-top:2px solid var(--light);padding-top:16px;">
                    ${derivadas.length > 0 ? `
                        <button class="btn-primary" onclick="window.UICaracteres._estudiarFamiliaCaracteres('${caracter.id}')" 
                                style="padding:10px 24px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" 
                                onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                            <i class="fas fa-play"></i> Estudiar toda la familia (${derivadas.length + 1} palabras)
                        </button>
                    ` : ''}
                    ${tieneEstudioCompleto ? `
                        <button class="btn-secondary" onclick="window.UICaracteres._verEstudioCompleto(${caracter.id})" 
                                style="padding:10px 24px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">
                            <i class="fas fa-book"></i> Ver Estudio Completo
                        </button>
                    ` : ''}
                    <button class="btn-secondary" onclick="window.UICaracteres._volverEstudio()" 
                            style="padding:10px 24px;background:var(--bg);border:1px solid var(--light);border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.3s;"
                            onmouseover="this.style.background='var(--gray-light)'" onmouseout="this.style.background='var(--bg)'">
                        <i class="fas fa-arrow-left"></i> Volver
                    </button>
                    <button class="btn-primary" onclick="window.UICaracteres._abrirModalGenerarDerivadas(${caracter.id}, '${caracter.palabra}', '${caracter.pinyin || ''}', '${caracter.significado || ''}')" 
                            style="padding:10px 24px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.3s;"
                            onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 4px 20px rgba(225,112,85,0.3)'" 
                            onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-magic"></i> Generar más derivadas
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================================
    // RENDERIZAR PANEL DE LOGROS
    // ============================================================

    static renderizarPanelLogros(uiCaracteres) {
        const totalLogros = Object.keys(uiCaracteres.LOGROS_BASE).length;
        const desbloqueados = uiCaracteres._logrosDesbloqueados.size;
        const porcentaje = Math.round((desbloqueados / totalLogros) * 100);

        let html = `
            <div style="background:var(--white);border-radius:14px;padding:24px;box-shadow:var(--shadow);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:8px;">
                    <div>
                        <h3 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">🏆 Logros</h3>
                        <p style="font-size:14px;color:var(--gray);margin:4px 0 0;">
                            ${desbloqueados}/${totalLogros} desbloqueados · ${porcentaje}% completado
                        </p>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn-secondary" onclick="window.UICaracteres._volverBiblioteca()" 
                                style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-arrow-left"></i> Volver
                        </button>
                    </div>
                </div>

                <div style="height:8px;background:var(--bg);border-radius:4px;margin-bottom:20px;overflow:hidden;">
                    <div style="height:100%;width:${porcentaje}%;background:linear-gradient(90deg, #FDCB6E, #E17055, #6C5CE7);border-radius:4px;transition:width 1s ease;"></div>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
                    ${Object.entries(uiCaracteres.LOGROS_BASE).map(([key, logro]) => {
                        const desbloqueado = uiCaracteres._logrosDesbloqueados.has(key);
                        return `
                            <div style="background:${desbloqueado ? 'var(--success)05' : 'var(--bg)'};border-radius:10px;padding:14px 16px;border:2px solid ${desbloqueado ? 'var(--success)' : 'var(--light)'};opacity:${desbloqueado ? '1' : '0.6'};transition:all 0.3s;">
                                <div style="display:flex;align-items:center;gap:10px;">
                                    <span style="font-size:28px;">${logro.icono}</span>
                                    <div>
                                        <div style="font-size:14px;font-weight:600;color:${desbloqueado ? 'var(--dark)' : 'var(--gray)'};">${logro.nombre}</div>
                                        <div style="font-size:11px;color:var(--gray-light);">${logro.desc}</div>
                                        ${desbloqueado ? '<span style="font-size:10px;color:var(--success);font-weight:600;">✅ Desbloqueado</span>' : '<span style="font-size:10px;color:var(--gray-light);">🔒 Bloqueado</span>'}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        return html;
    }

    // ============================================================
    // GENERAR MENSAJE DE VIGÍA
    // ============================================================

    static generarMensajeVigia(uiCaracteres, raiz, derivadas, nivelUsuario) {
        const totalDerivadas = derivadas.length;
        const derivadasNivel = derivadas.filter(p => (p.nivel || 'A1') === nivelUsuario);

        if (totalDerivadas === 0) {
            return `💡 "${raiz.palabra}" aún no tiene palabras derivadas. Genera algunas para enriquecer tu vocabulario de nivel ${nivelUsuario}.`;
        }

        if (derivadasNivel.length === 0) {
            return `📚 "${raiz.palabra}" tiene ${totalDerivadas} palabras derivadas, pero ninguna de nivel ${nivelUsuario}. Genera palabras de tu nivel para practicar.`;
        }

        if (derivadasNivel.length < 3) {
            return `🌱 "${raiz.palabra}" tiene ${derivadasNivel.length} palabras de nivel ${nivelUsuario}. Añade más para consolidar tu aprendizaje.`;
        }

        if (derivadasNivel.length >= 5 && raiz.neuroScore < 3) {
            return `📖 ¡Tienes ${derivadasNivel.length} palabras de nivel ${nivelUsuario} para "${raiz.palabra}"! Practica con ellas para mejorar tu RCN (actual: ${raiz.neuroScore.toFixed(1)}).`;
        }

        if (raiz.neuroScore >= 4) {
            return `🌟 ¡Excelente! Has dominado "${raiz.palabra}" (RCN: ${raiz.neuroScore.toFixed(1)}) con ${derivadasNivel.length} palabras de nivel ${nivelUsuario}. ¡Sigue así!`;
        }

        return `📊 "${raiz.palabra}" tiene ${derivadasNivel.length} palabras de nivel ${nivelUsuario}. Sigue practicando para mejorar tu RCN (${raiz.neuroScore.toFixed(1)}).`;
    }

    // ============================================================
    // GENERAR PLANTILLA ESTUDIO COMPLETO
    // ============================================================

    static generarPlantillaEstudioCompleto(uiCaracteres, caracter, idioma, nivel, idiomaNativo, nombreIdioma) {
        return {
            "_INSTRUCCIONES_PARA_IA": {
                "version": "2.0",
                "accion": `Genera un estudio completo y profesional para el carácter "${caracter.palabra}" en ${idioma}`,
                "idioma_objetivo": idioma,
                "nombre_idioma": nombreIdioma,
                "nivel": nivel,
                "idioma_nativo": idiomaNativo,
                "caracter": caracter.palabra,
                "pinyin_raiz": caracter.pinyin || "",
                "significado_raiz": caracter.significado || "",
                "modo": "completo",
                "incluir": [
                    "evolucion_historica",
                    "componentes_radicales",
                    "variantes",
                    "palabras_derivadas_por_nivel",
                    "frases_ejemplo_con_texto",
                    "ejercicios_personalizados",
                    "logros",
                    "conexiones_culturales",
                    "caracteres_similares",
                    "mnemotecnia_avanzada",
                    "errores_comunes",
                    "sugerencias_SRS",
                    "usos_modernos"
                ],
                "instrucciones": [
                    `1. Investiga el carácter "${caracter.palabra}" en profundidad`,
                    `2. Proporciona su evolución histórica (origen, cambios)`,
                    `3. Desglosa sus componentes y radicales`,
                    `4. Incluye todas las variantes (tradicional, simplificado, etc.)`,
                    `5. Genera palabras derivadas para cada nivel (A1, A2, B1, B2, C1, C2)`,
                    `6. Proporciona frases de ejemplo con traducción al ${idiomaNativo}`,
                    `7. Crea ejercicios personalizados (completar, ordenar, asociación, traducción)`,
                    `8. Define logros desbloqueables para el carácter`,
                    `9. Incluye conexiones culturales y simbología`,
                    `10. Identifica caracteres similares con diferencias`,
                    `11. Proporciona mnemotecnia avanzada para recordar el carácter`,
                    `12. Lista errores comunes de estudiantes`,
                    `13. Sugiere intervalos SRS para repaso`,
                    `14. Indica usos modernos y frecuencia`
                ],
                "familias_semanticas_disponibles": uiCaracteres.FAMILIAS_SEMANTICAS.join(', '),
                "niveles_disponibles": uiCaracteres.NIVELES
            },
            "meta": {
                "caracter": caracter.palabra,
                "idioma": idioma,
                "nivel": nivel,
                "idioma_nativo": idiomaNativo,
                "fecha_generacion": new Date().toISOString(),
                "version": "2.0"
            },
            "estudio_completo": {
                "caracter_raiz": caracter.palabra,
                "pinyin": caracter.pinyin || "",
                "significado": caracter.significado || "",
                "evolucion_historica": {
                    "origen": "[Origen del carácter]",
                    "significado_original": "[Significado original]",
                    "evolucion": "[Evolución a través del tiempo]"
                },
                "componentes": {
                    "radical": "[Radical principal]",
                    "partes": ["[Parte 1]", "[Parte 2]"],
                    "explicacion": "[Explicación de la composición]"
                },
                "variantes": {
                    "tradicional": "[Versión tradicional]",
                    "simplificado": "[Versión simplificado]",
                    "otras_formas": ["[Otras variantes]"]
                },
                "usos_modernos": {
                    "frecuencia": "[Alta/Media/Baja]",
                    "contextos": ["[Contexto 1]", "[Contexto 2]"],
                    "expresiones_comunes": ["[Expresión 1]", "[Expresión 2]"]
                },
                "palabras_por_nivel": {
                    "A1": [],
                    "A2": [],
                    "B1": [],
                    "B2": [],
                    "C1": [],
                    "C2": []
                },
                "frases_ejemplo": [],
                "ejercicios": [],
                "logros": [],
                "conexiones_culturales": "[Conexiones culturales y significado en la cultura]",
                "simbologia": "[Simbología del carácter]",
                "caracteres_similares": [],
                "mnemotecnia_avanzada": "[Mnemotecnia creativa para recordar el carácter]",
                "errores_comunes": ["[Error común 1]", "[Error común 2]"],
                "srs_sugerencias": {
                    "nuevo": 3600,
                    "en_progreso": 86400,
                    "dominado": 604800
                }
            }
        };
    }

    // ============================================================
    // RENDERIZAR NO DISPONIBLE / ERROR
    // ============================================================

    static renderizarNoDisponible(uiCaracteres, idioma) {
        return `
            <div style="text-align:center;padding:60px 20px;color:var(--gray);">
                <div style="font-size:64px;margin-bottom:16px;">🌍</div>
                <h3 style="font-size:20px;font-weight:700;color:var(--dark);margin-bottom:8px;">
                    Módulo de Caracteres no disponible
                </h3>
                <p style="font-size:14px;color:var(--gray-light);">
                    Este módulo está diseñado para idiomas jeroglíficos como Chino, Japonés o Coreano.
                    <br>
                    <strong>Idioma actual: ${idioma}</strong>
                </p>
                <button class="btn-primary" onclick="window.uiCore.irAModulo('config')" style="margin-top:12px;padding:10px 24px;">
                    <i class="fas fa-cog"></i> Cambiar idioma
                </button>
            </div>
        `;
    }

    static renderizarError(uiCaracteres, error) {
        return `
            <div style="text-align:center;padding:40px;color:var(--gray);">
                <i class="fas fa-exclamation-triangle" style="font-size:48px;color:var(--danger);display:block;margin-bottom:16px;"></i>
                <p style="font-size:16px;font-weight:500;">Error cargando datos de caracteres</p>
                <p style="font-size:13px;color:var(--gray-light);">${error.message}</p>
                <button class="btn-primary" onclick="window.UICaracteres.cargar()" style="margin-top:12px;padding:10px 24px;">
                    <i class="fas fa-sync"></i> Reintentar
                </button>
            </div>
        `;
    }
}

// ============================================================
// EXPORTAR PARA USO GLOBAL
// ============================================================

window.UICaracteresRender = UICaracteresRender;
console.log('✅ UICaracteres Render v1.9 - PAGINACIÓN CORREGIDA');
console.log('  🔧 Error de sintaxis en onclick CORREGIDO');
console.log('  🔧 Función estática irPagina() para manejar la navegación');
console.log('  📄 Paginación en Biblioteca de caracteres');
console.log('  📄 Paginación en palabras derivadas dentro del estudio');
console.log('  🔢 Control de página con navegación intuitiva');