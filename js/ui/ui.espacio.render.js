// ============================================================
// UI ESPACIO RENDER v1.7 - CON TRANSCRIPCIÓN FONÉTICA (COMPLETO)
// ============================================================

class UIEspacioRender {
    // ============================================================
    // RENDERIZAR MI ESPACIO (VISTA PRINCIPAL)
    // ============================================================

    static async renderizarMiEspacio(uiEspacio) {
        if (uiEspacio._cargando) return;
        uiEspacio._cargando = true;
        const container = document.getElementById('espacioContent');
        if (!container) {
            const moduleDiv = document.getElementById('espacioModule');
            if (moduleDiv) {
                const content = document.createElement('div');
                content.id = 'espacioContent';
                moduleDiv.appendChild(content);
            }
            uiEspacio._cargando = false;
            return;
        }

        try {
            const usuario = await uiEspacio._getUsuarioSeguro();
            if (!usuario || !usuario.nombre) {
                container.innerHTML = `
                    <div style="text-align:center;padding:60px 20px;color:var(--gray);">
                        <i class="fas fa-user" style="font-size:48px;color:var(--primary-light);display:block;margin-bottom:16px;"></i>
                        <h3 style="font-size:18px;font-weight:700;color:var(--dark);margin-bottom:8px;">No hay usuario registrado</h3>
                        <p style="font-size:14px;">Regístrate para empezar a guardar tus frases y palabras favoritas.</p>
                        <button class="btn-primary" onclick="document.getElementById('registroScreen').style.display='flex'" style="margin-top:12px;"><i class="fas fa-user-plus"></i> Registrarme</button>
                    </div>
                `;
                uiEspacio._cargando = false;
                return;
            }

            const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
            uiEspacio._idiomaActual = idiomaActivo;
            const nivelReal = uiEspacio._obtenerNivelRealUsuario();
            const esJeroglifico = uiEspacio._esJeroglifico(idiomaActivo);
            const idiomaNativo = uiEspacio._obtenerIdiomaNativo();

            await gestorFavoritos.recargar();
            const todasFrases = await gestorFavoritos.obtenerFrasesFavoritas();
            const todasPalabras = await gestorFavoritos.obtenerPalabrasFavoritas();

            let frases = todasFrases.filter(f => f.idioma === idiomaActivo);
            let palabras = todasPalabras.filter(p => p.idioma === idiomaActivo);

            const { frasesFiltradas, palabrasFiltradas } = window.UIEspacioActions.aplicarFiltros(frases, palabras, uiEspacio);
            frases = frasesFiltradas;
            palabras = palabrasFiltradas;

            const estructuraPorNivel = {};
            for (const nivel of uiEspacio.NIVELES) {
                estructuraPorNivel[nivel] = { familias: {}, totalPalabras: 0, totalFrases: 0 };
            }

            for (const p of palabras) {
                const nivel = p.nivel || nivelReal;
                const familia = p.familiaSemantica || p.familia || 'sin_clasificar';
                if (!estructuraPorNivel[nivel]) estructuraPorNivel[nivel] = { familias: {}, totalPalabras: 0, totalFrases: 0 };
                if (!estructuraPorNivel[nivel].familias[familia]) estructuraPorNivel[nivel].familias[familia] = { palabras: [], frases: [] };
                estructuraPorNivel[nivel].familias[familia].palabras.push(p);
                estructuraPorNivel[nivel].totalPalabras++;
            }

            for (const f of frases) {
                const nivel = f.nivel || nivelReal;
                const familia = f.familiaSemantica || 'sin_clasificar';
                if (!estructuraPorNivel[nivel]) estructuraPorNivel[nivel] = { familias: {}, totalPalabras: 0, totalFrases: 0 };
                if (!estructuraPorNivel[nivel].familias[familia]) estructuraPorNivel[nivel].familias[familia] = { palabras: [], frases: [] };
                estructuraPorNivel[nivel].familias[familia].frases.push(f);
                estructuraPorNivel[nivel].totalFrases++;
            }

            const nivelesConDatos = [];
            for (const nivel of uiEspacio.NIVELES) {
                if (estructuraPorNivel[nivel]) {
                    const familias = Object.keys(estructuraPorNivel[nivel].familias);
                    for (const familia of familias) {
                        if (estructuraPorNivel[nivel].familias[familia].palabras.length === 0 && estructuraPorNivel[nivel].familias[familia].frases.length === 0) {
                            delete estructuraPorNivel[nivel].familias[familia];
                        }
                    }
                    if (Object.keys(estructuraPorNivel[nivel].familias).length > 0) {
                        nivelesConDatos.push(nivel);
                    }
                }
            }

            const totalFavoritos = frases.length + palabras.length;
            const nivelesOrdenados = nivelesConDatos.sort((a, b) => uiEspacio.NIVELES.indexOf(a) - uiEspacio.NIVELES.indexOf(b));
            uiEspacio._totalPaginasNiveles = Math.ceil(nivelesOrdenados.length / uiEspacio._nivelesPorPagina);
            const paginaActualNiveles = Math.min(uiEspacio._paginaNivel, uiEspacio._totalPaginasNiveles || 1);
            const inicioNiveles = (paginaActualNiveles - 1) * uiEspacio._nivelesPorPagina;
            const finNiveles = Math.min(inicioNiveles + uiEspacio._nivelesPorPagina, nivelesOrdenados.length);
            const nivelesPagina = nivelesOrdenados.slice(inicioNiveles, finNiveles);

            let html = `
                <div class="espacio-container" style="padding:16px;">
                    <div class="espacio-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
                        <div>
                            <h2 style="font-size:24px;font-weight:800;color:var(--dark);margin:0;">⭐ Mi Espacio</h2>
                            <p style="color:var(--gray);font-size:14px;margin:4px 0 0;">
                                Tus frases y vocabulario guardados · <strong>${uiEspacio._getNombreIdioma(idiomaActivo)}</strong>${totalFavoritos > 0 ? ` · ${totalFavoritos} elementos` : ''}
                            </p>
                            <p style="color:var(--gray-light);font-size:12px;margin:2px 0 0;">
                                📚 Organizado por Nivel → Familia Semántica · <strong>Nivel actual: ${nivelReal}</strong>
                                ${uiEspacio._totalPaginasNiveles > 1 ? ` · 📄 Página ${paginaActualNiveles}/${uiEspacio._totalPaginasNiveles}` : ''}
                            </p>
                            <p style="color:var(--gray-light);font-size:11px;margin:2px 0 0;">
                                🎤 Transcripción fonética en <strong>${uiEspacio._getNombreIdioma(idiomaNativo)}</strong>
                            </p>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            <button class="btn-primary" onclick="window.UIEspacio.abrirModalUnificado()" style="padding:10px 20px;font-size:14px;font-weight:700;border:none;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#6C5CE7,#00CEC9);color:white;transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'"><i class="fas fa-plus-circle"></i> Añadir Contenido</button>
                            <button class="btn-secondary" onclick="window.UIEspacio._exportarFavoritos()" style="padding:6px 14px;font-size:12px;"><i class="fas fa-download"></i> Exportar</button>
                            <button class="btn-secondary" onclick="window.UIEspacio._importarFavoritos()" style="padding:6px 14px;font-size:12px;"><i class="fas fa-upload"></i> Importar</button>
                            <button class="btn-primary" onclick="window.UIEspacio._mostrarSelectorEjercicios()" style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#FD79A8,#E17055);color:white;border:none;border-radius:8px;cursor:pointer;"><i class="fas fa-dumbbell"></i> Ejercicios</button>
                            <button class="btn-secondary" onclick="window.UIEspacio._mostrarRankingFamilias('${idiomaActivo}')" style="padding:6px 14px;font-size:12px;"><i class="fas fa-trophy"></i> Ranking</button>
                            <button class="btn-secondary" onclick="window.UIEspacio._mostrarEstadisticasNivel('${idiomaActivo}')" style="padding:6px 14px;font-size:12px;"><i class="fas fa-chart-bar"></i> Stats</button>
                        </div>
                    </div>
                    ${uiEspacio._renderizarBarraBusqueda()}
                    <div class="espacio-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:16px;">
                        <div style="background:var(--white);padding:14px;border-radius:12px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--primary);"><div style="font-size:28px;font-weight:800;color:var(--primary);">${frases.length}</div><div style="font-size:11px;color:var(--gray);font-weight:600;text-transform:uppercase;">Frases</div></div>
                        <div style="background:var(--white);padding:14px;border-radius:12px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--secondary);"><div style="font-size:28px;font-weight:800;color:var(--secondary);">${palabras.length}</div><div style="font-size:11px;color:var(--gray);font-weight:600;text-transform:uppercase;">Palabras</div></div>
                        <div style="background:var(--white);padding:14px;border-radius:12px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--success);"><div style="font-size:28px;font-weight:800;color:var(--success);">${nivelesOrdenados.length}</div><div style="font-size:11px;color:var(--gray);font-weight:600;text-transform:uppercase;">Niveles</div></div>
                        <div style="background:var(--white);padding:14px;border-radius:12px;text-align:center;box-shadow:var(--shadow);border-top:3px solid var(--warning);"><div style="font-size:28px;font-weight:800;color:var(--warning);">${nivelReal}</div><div style="font-size:11px;color:var(--gray);font-weight:600;text-transform:uppercase;">Nivel Actual</div></div>
                    </div>
            `;

            if (uiEspacio._totalPaginasNiveles > 1) {
                html += uiEspacio._renderizarPaginador(paginaActualNiveles, uiEspacio._totalPaginasNiveles, 'niveles');
            }

            if (nivelesPagina.length === 0) {
                html += `<div style="text-align:center;padding:40px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);"><i class="fas fa-star" style="font-size:48px;color:var(--primary-light);display:block;margin-bottom:16px;"></i><p style="font-size:16px;font-weight:500;">No hay elementos en Mi Espacio para ${uiEspacio._getNombreIdioma(idiomaActivo)}</p><p style="font-size:13px;color:var(--gray-light);">Haz clic en "Añadir Contenido" para empezar.</p><p style="font-size:12px;color:var(--primary);margin-top:8px;">🎯 Nivel actual: ${nivelReal}</p></div>`;
            } else {
                for (const nivel of nivelesPagina) {
                    const data = estructuraPorNivel[nivel];
                    const familias = Object.keys(data.familias).filter(f => f && f !== 'sin_clasificar' && f !== uiEspacio.GRUPO_USUARIO).sort();
                    const esNivelActual = nivel === nivelReal;
                    const colorNivel = uiEspacio.COLORES_NIVEL[nivel] || 'var(--primary)';
                    const emojiNivel = uiEspacio.EMOJIS_NIVEL[nivel] || '📚';

                    if (!uiEspacio._paginaFamilias[nivel]) uiEspacio._paginaFamilias[nivel] = 1;
                    const totalFamilias = familias.length;
                    uiEspacio._totalPaginasFamilias = uiEspacio._totalPaginasFamilias || {};
                    uiEspacio._totalPaginasFamilias[nivel] = Math.ceil(totalFamilias / uiEspacio._familiasPorPagina);
                    const paginaFamilias = Math.min(uiEspacio._paginaFamilias[nivel], uiEspacio._totalPaginasFamilias[nivel] || 1);
                    const inicioFamilias = (paginaFamilias - 1) * uiEspacio._familiasPorPagina;
                    const finFamilias = Math.min(inicioFamilias + uiEspacio._familiasPorPagina, familias.length);
                    const familiasPagina = familias.slice(inicioFamilias, finFamilias);

                    html += `
                        <div style="margin-bottom:16px;background:var(--white);border-radius:12px;padding:14px 16px;box-shadow:var(--shadow);border-left:4px solid ${esNivelActual ? colorNivel : 'var(--light)'};">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:4px;">
                                <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">
                                    ${emojiNivel} Nivel ${nivel}
                                    ${esNivelActual ? '<span style="font-size:11px;color:var(--primary);font-weight:400;margin-left:8px;">🎯 ACTUAL</span>' : ''}
                                    <span style="font-size:12px;font-weight:400;color:var(--gray);">(${data.totalPalabras + data.totalFrases} elementos · ${totalFamilias} familias)</span>
                                    ${uiEspacio._totalPaginasFamilias[nivel] > 1 ? ` · 📄 Página ${paginaFamilias}/${uiEspacio._totalPaginasFamilias[nivel]}` : ''}
                                </h3>
                                <span style="font-size:11px;color:var(--gray-light);">${data.totalPalabras} palabras · ${data.totalFrases} frases</span>
                            </div>
                    `;

                    if (uiEspacio._totalPaginasFamilias[nivel] > 1) {
                        html += uiEspacio._renderizarPaginador(paginaFamilias, uiEspacio._totalPaginasFamilias[nivel], `familias_${nivel}`);
                    }

                    if (familiasPagina.length === 0) {
                        html += `<div style="margin-left:16px;padding:8px 12px;background:var(--bg);border-radius:8px;color:var(--gray-light);font-size:12px;"><i class="fas fa-info-circle"></i> No hay familias con clasificación semántica en esta página.</div>`;
                    } else {
                        for (const familia of familiasPagina) {
                            const familiaData = data.familias[familia];
                            const totalItems = familiaData.palabras.length + familiaData.frases.length;
                            const statsDominio = await window.UIEspacioActions._calcularDominioFamilia(familiaData.palabras, familiaData.frases);
                            const { logros, racha } = await window.UIEspacioActions._calcularLogrosFamilia(familia, idiomaActivo);
                            const esCompacto = uiEspacio._modoCompacto;
                            const colorSemantica = uiEspacio._getColorFamiliaSemantica(familia);

                            html += `
                                <div style="margin-left:${esCompacto ? '8px' : '16px'};margin-bottom:${esCompacto ? '6px' : '10px'};background:var(--bg);border-radius:${esCompacto ? '8px' : '10px'};padding:${esCompacto ? '8px 12px' : '12px 16px'};border-left:3px solid ${colorSemantica};transition:all 0.3s;">
                                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;">
                                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                                            <span style="font-size:${esCompacto ? '13px' : '14px'};font-weight:600;color:var(--dark);">📂 ${familia}</span>
                                            ${logros.length > 0 ? logros.slice(-3).map(l => `<span style="font-size:14px;" title="${l}">${l}</span>`).join('') : ''}
                                            ${racha > 0 ? `<span style="font-size:12px;color:var(--primary);">🔥 ${racha}</span>` : ''}
                                        </div>
                                        <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:var(--gray);">
                                            <span>${statsDominio.icono} ${statsDominio.estado}</span>
                                            <span>${totalItems} elementos</span>
                                        </div>
                                    </div>
                                    <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
                                        <div style="flex:1;height:4px;background:var(--light);border-radius:2px;max-width:150px;">
                                            <div style="height:100%;width:${statsDominio.dominio}%;background:${statsDominio.color};border-radius:2px;transition:width 0.5s ease;"></div>
                                        </div>
                                        <span style="font-size:10px;color:var(--gray);">${statsDominio.dominio}%</span>
                                    </div>

                                    ${!esCompacto ? `
                                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
                                            ${familiaData.palabras.slice(0, 5).map(p => {
                                                const elementoHtml = uiEspacio._renderizarElementoEspacio(p, 'palabra', idiomaActivo);
                                                return `
                                                    <span style="display:inline-block;cursor:pointer;padding:4px 12px;border-radius:12px;background:var(--primary)08;border:1px solid var(--primary)20;transition:all 0.2s;" 
                                                          onclick="window.UIEspacio._verDetallePalabraProfesional(${p.id})" 
                                                          onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" 
                                                          onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                                                        ${elementoHtml}
                                                    </span>
                                                `;
                                            }).join('')}
                                            ${familiaData.palabras.length > 5 ? `<span style="font-size:10px;color:var(--gray-light);">+${familiaData.palabras.length - 5}</span>` : ''}
                                        </div>
                                    ` : ''}

                                    ${!esCompacto && familiaData.frases.length > 0 ? `
                                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">
                                            ${familiaData.frases.slice(0, 2).map(f => {
                                                const elementoHtml = uiEspacio._renderizarElementoEspacio(f, 'frase', idiomaActivo);
                                                return `
                                                    <span style="display:inline-block;cursor:pointer;padding:4px 12px;border-radius:10px;background:var(--secondary)08;border:1px solid var(--secondary)20;transition:all 0.2s;" onclick="window.UIEspacio._ejercicioTraduccion(${f.id})" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                                                        ${elementoHtml}
                                                    </span>
                                                `;
                                            }).join('')}
                                            ${familiaData.frases.length > 2 ? `<span style="font-size:10px;color:var(--gray-light);">+${familiaData.frases.length - 2} más</span>` : ''}
                                        </div>
                                    ` : ''}

                                    <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
                                        <button class="btn-primary" onclick="window.UIEspacio._estudiarFamiliaDesdeEspacio('${familia.replace(/'/g, "\\'")}', '${nivel}')" style="padding:${esCompacto ? '3px 10px' : '4px 14px'};font-size:${esCompacto ? '10px' : '11px'};background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'"><i class="fas fa-play"></i> ${esCompacto ? 'Estudiar' : 'Estudiar familia'}</button>
                                        ${familiaData.frases.length > 0 && !esCompacto ? `
                                            <button class="btn-secondary" onclick="window.UIEspacio._ejercicioOrdenar(${familiaData.frases[0].id})" style="padding:4px 14px;font-size:11px;background:var(--success);color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'"><i class="fas fa-sort"></i> Ordenar</button>
                                            <button class="btn-secondary" onclick="window.UIEspacio._ejercicioTraduccion(${familiaData.frases[0].id})" style="padding:4px 14px;font-size:11px;background:var(--secondary);color:white;border:none;border-radius:6px;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'"><i class="fas fa-language"></i> Traducir</button>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }
                    }

                    if (uiEspacio._totalPaginasFamilias[nivel] > 1) {
                        html += uiEspacio._renderizarPaginador(paginaFamilias, uiEspacio._totalPaginasFamilias[nivel], `familias_${nivel}`);
                    }
                    html += `</div>`;
                }
            }

            html += `
                    <div class="espacio-actions" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;">
                        <button class="btn-primary" onclick="window.UIEspacio._verFrases()" style="padding:14px 18px;font-size:15px;text-align:center;"><div style="font-size:32px;">📖</div><div style="font-weight:700;">Ver Todas las Frases</div><div style="font-size:12px;font-weight:400;opacity:0.8;">${frases.length} frases</div></button>
                        <button class="btn-primary" onclick="window.UIEspacio._verPalabras()" style="padding:14px 18px;font-size:15px;text-align:center;background:linear-gradient(135deg,#00CEC9,#81ECEC);"><div style="font-size:32px;">📝</div><div style="font-weight:700;">Ver Todas las Palabras</div><div style="font-size:12px;font-weight:400;opacity:0.8;">${palabras.length} palabras</div></button>
                    </div>
                    <div class="espacio-actions-bottom" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
                        <button class="btn-secondary" onclick="window.UIEspacio._abrirModalGrupos()" style="padding:8px 18px;font-size:13px;background:linear-gradient(135deg,#FDCB6E,#F9CA24);color:var(--dark);border:none;border-radius:8px;cursor:pointer;"><i class="fas fa-magic"></i> Organizar Grupos con IA</button>
                        <button class="btn-secondary" onclick="window.UIEspacio._modoExpres()" style="padding:8px 18px;font-size:13px;background:linear-gradient(135deg,#FD79A8,#E17055);color:white;border:none;border-radius:8px;cursor:pointer;"><i class="fas fa-bolt"></i> Modo Exprés</button>
                        <button class="btn-secondary" onclick="window.UIEspacio._mostrarRankingFamilias('${idiomaActivo}')" style="padding:8px 18px;font-size:13px;background:linear-gradient(135deg,#FDCB6E,#F9CA24);color:var(--dark);border:none;border-radius:8px;cursor:pointer;"><i class="fas fa-trophy"></i> Ranking</button>
                        <button class="btn-danger" onclick="window.UIEspacio._limpiarFavoritos()" style="padding:8px 18px;font-size:13px;background:#FF7675;color:white;border:none;border-radius:8px;cursor:pointer;"><i class="fas fa-trash"></i> Limpiar Todo</button>
                    </div>
                </div>
            `;

            // ============================================================
            // 🔥 SECCIÓN DE FAMILIAS DE CARACTERES CON LUPA
            // ============================================================
            try {
                const todasPalabras = await db.obtenerPalabrasPorIdioma(idiomaActivo);
                const caracteresRaiz = todasPalabras.filter(p => p.esCaracterRaiz === true);

                if (caracteresRaiz.length > 0) {
                    const totalFamiliasCaracteres = caracteresRaiz.length;
                    const familiasPorPagina = uiEspacio._familiasCaracteresPorPagina || 6;
                    const totalPaginasFamiliasCaracteres = Math.ceil(totalFamiliasCaracteres / familiasPorPagina);
                    const paginaActual = Math.min(uiEspacio._paginaFamiliasCaracteres || 1, totalPaginasFamiliasCaracteres || 1);
                    
                    const busquedaFamiliasInput = document.getElementById('buscarFamiliasCaracteres');
                    const busquedaFamilias = busquedaFamiliasInput ? busquedaFamiliasInput.value.toLowerCase().trim() : '';
                    
                    let familiasFiltradas = caracteresRaiz;
                    if (busquedaFamilias) {
                        familiasFiltradas = caracteresRaiz.filter(cr => {
                            const texto = (cr.palabra || '').toLowerCase();
                            const pinyin = (cr.pinyin || '').toLowerCase();
                            const transcripcion = (cr.transcripcion || '').toLowerCase();
                            const significado = (cr.significado || '').toLowerCase();
                            const tema = (cr.tema || '').toLowerCase();
                            const nivel = (cr.nivel || '').toLowerCase();
                            return texto.includes(busquedaFamilias) || 
                                   pinyin.includes(busquedaFamilias) ||
                                   transcripcion.includes(busquedaFamilias) ||
                                   significado.includes(busquedaFamilias) ||
                                   tema.includes(busquedaFamilias) ||
                                   nivel.includes(busquedaFamilias);
                        });
                    }
                    
                    const totalFamiliasFiltradas = familiasFiltradas.length;
                    const totalPaginasFiltradas = Math.ceil(totalFamiliasFiltradas / familiasPorPagina);
                    const paginaActualFiltrada = Math.min(paginaActual, totalPaginasFiltradas || 1);
                    const inicio = (paginaActualFiltrada - 1) * familiasPorPagina;
                    const fin = Math.min(inicio + familiasPorPagina, totalFamiliasFiltradas);
                    const familiasPagina = familiasFiltradas.slice(inicio, fin);

                    html += `
                        <div style="margin-top:20px;border-top:2px solid var(--light);padding-top:16px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                                <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">
                                    🧠 Familias de Caracteres
                                    <span style="font-size:12px;font-weight:400;color:var(--gray);">(${totalFamiliasCaracteres} total)</span>
                                    ${totalPaginasFamiliasCaracteres > 1 ? ` · 📄 Página ${paginaActualFiltrada}/${totalPaginasFamiliasCaracteres}` : ''}
                                    ${busquedaFamilias ? ` · 🔎 ${totalFamiliasFiltradas} resultados` : ''}
                                </h3>
                                <span style="font-size:11px;color:var(--gray-light);">${idiomaActivo}</span>
                            </div>
                            
                            <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;align-items:center;background:var(--white);padding:8px 12px;border-radius:8px;border:1px solid var(--light);">
                                <div style="flex:1;min-width:150px;position:relative;">
                                    <i class="fas fa-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--gray);font-size:12px;"></i>
                                    <input type="text" id="buscarFamiliasCaracteres" 
                                           placeholder="🔍 Buscar por carácter, pinyin, significado..." 
                                           style="width:100%;padding:6px 10px 6px 30px;border:2px solid var(--light);border-radius:6px;font-size:13px;font-family:var(--font);transition:all 0.3s;"
                                           value="${busquedaFamilias}"
                                           onfocus="this.style.borderColor='var(--primary)'" 
                                           onblur="this.style.borderColor='var(--light)'"
                                           oninput="window.UIEspacioRender.filtrarFamiliasCaracteres()">
                                </div>
                                ${busquedaFamilias ? `
                                    <button class="btn-secondary" onclick="window.UIEspacioRender.limpiarBusquedaFamiliasCaracteres()" 
                                            style="padding:4px 12px;font-size:11px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;">
                                        <i class="fas fa-times"></i> Limpiar
                                    </button>
                                ` : ''}
                                <span style="font-size:11px;color:var(--gray-light);">
                                    ${totalFamiliasFiltradas} de ${totalFamiliasCaracteres} familias
                                </span>
                            </div>
                            
                            ${totalPaginasFamiliasCaracteres > 1 ? `
                                <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:10px;flex-wrap:wrap;">
                                    <button class="btn-secondary" onclick="window.UIEspacio._irPaginaFamiliasCaracteres(${paginaActualFiltrada - 1})" style="padding:4px 12px;font-size:11px;${paginaActualFiltrada <= 1 ? 'opacity:0.5;cursor:default;' : ''}" ${paginaActualFiltrada <= 1 ? 'disabled' : ''}>
                                        <i class="fas fa-chevron-left"></i> Anterior
                                    </button>
                                    <span style="font-size:12px;color:var(--gray);">${paginaActualFiltrada} / ${totalPaginasFamiliasCaracteres}</span>
                                    <button class="btn-secondary" onclick="window.UIEspacio._irPaginaFamiliasCaracteres(${paginaActualFiltrada + 1})" style="padding:4px 12px;font-size:11px;${paginaActualFiltrada >= totalPaginasFamiliasCaracteres ? 'opacity:0.5;cursor:default;' : ''}" ${paginaActualFiltrada >= totalPaginasFamiliasCaracteres ? 'disabled' : ''}>
                                        Siguiente <i class="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            ` : ''}
                            
                            ${totalFamiliasFiltradas === 0 ? `
                                <div style="text-align:center;padding:30px;color:var(--gray);background:var(--bg);border-radius:8px;border:2px dashed var(--light);">
                                    <i class="fas fa-search" style="font-size:32px;color:var(--primary-light);display:block;margin-bottom:8px;"></i>
                                    <p style="font-size:14px;">No se encontraron familias con "<strong>${busquedaFamilias}</strong>"</p>
                                    <p style="font-size:12px;color:var(--gray-light);">Prueba con otro término de búsqueda</p>
                                </div>
                            ` : `
                                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;" id="familiasCaracteresContainer">
                                    ${familiasPagina.map(cr => {
                                        const derivadas = todasPalabras.filter(p => p.esPalabraDerivada && p.caracterRaiz === cr.palabra);
                                        const total = derivadas.length;
                                        const color = '#6C5CE7';
                                        const pinyin = cr.pinyin || '';
                                        const transcripcion = cr.transcripcion || '';
                                        
                                        let nombreMostrar = cr.palabra;
                                        let pinyinMostrar = pinyin;
                                        let significadoMostrar = cr.significado || 'Significado base';
                                        
                                        if (busquedaFamilias) {
                                            const regex = new RegExp(`(${busquedaFamilias})`, 'gi');
                                            nombreMostrar = nombreMostrar.replace(regex, '<mark style="background:#FDCB6E;padding:0 2px;border-radius:2px;">$1</mark>');
                                            pinyinMostrar = pinyinMostrar.replace(regex, '<mark style="background:#FDCB6E;padding:0 2px;border-radius:2px;">$1</mark>');
                                            significadoMostrar = significadoMostrar.replace(regex, '<mark style="background:#FDCB6E;padding:0 2px;border-radius:2px;">$1</mark>');
                                        }
                                        
                                        return `
                                            <div style="background:var(--white);border-radius:10px;padding:12px 14px;box-shadow:var(--shadow);border-left:3px solid ${color};cursor:pointer;" 
                                                 onclick="window.UIEspacio._renderizarDetalleFamiliaCaracteres(${cr.id})"
                                                 onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'" 
                                                 onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                                    <div>
                                                        <div style="font-size:20px;font-weight:700;color:var(--dark);">${nombreMostrar}</div>
                                                        <div style="font-size:11px;color:var(--gray);">${significadoMostrar}</div>
                                                    </div>
                                                    <span style="font-size:12px;font-weight:600;color:${color};">${total} palabras</span>
                                                </div>
                                                ${pinyinMostrar ? `<div style="font-size:11px;color:var(--gray-light);margin-top:2px;">🔊 ${pinyinMostrar}</div>` : ''}
                                                ${transcripcion ? `<div style="font-size:11px;color:var(--gray-light);margin-top:2px;">🎤 ${transcripcion}</div>` : ''}
                                                <div style="font-size:10px;color:var(--gray-light);margin-top:4px;">
                                                    ${cr.tema || 'Sin tema'} · ${cr.nivel || 'A1'}
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            `}
                        </div>
                    `;
                }
            } catch (e) {
                console.warn('⚠️ Error renderizando familias de caracteres:', e);
            }

            container.innerHTML = html;
            uiEspacio._configurarEventosBusqueda();

            const resultadosSpan = document.getElementById('resultadosFiltroEspacio');
            if (resultadosSpan) {
                const total = frases.length + palabras.length;
                const totalSinFiltros = todasFrases.length + todasPalabras.length;
                if (uiEspacio._filtros.busqueda || uiEspacio._filtros.nivel || uiEspacio._filtros.familia || uiEspacio._filtros.tipo !== 'todos') {
                    resultadosSpan.textContent = `${total} de ${totalSinFiltros} elementos`;
                } else {
                    resultadosSpan.textContent = `${total} elementos totales`;
                }
            }

        } catch (error) {
            console.error('❌ Error renderizando Mi Espacio:', error);
            container.innerHTML = `
                <div style="text-align:center;padding:40px;color:var(--gray);">
                    <i class="fas fa-exclamation-triangle" style="font-size:48px;color:var(--danger);display:block;margin-bottom:16px;"></i>
                    <p style="font-size:16px;font-weight:500;">Error cargando datos</p>
                    <p style="font-size:13px;color:var(--gray-light);">${error.message}</p>
                    <button class="btn-primary" onclick="window.UIEspacio._renderizarMiEspacio()" style="margin-top:12px;"><i class="fas fa-sync"></i> Reintentar</button>
                </div>
            `;
        }
        uiEspacio._cargando = false;
    }

    // ============================================================
    // 🔥 FILTRAR FAMILIAS DE CARACTERES (LUPA)
    // ============================================================

    static filtrarFamiliasCaracteres() {
        const uiEspacio = window.UIEspacio;
        if (uiEspacio && !uiEspacio._cargando) {
            uiEspacio._paginaFamiliasCaracteres = 1;
            uiEspacio._renderizarMiEspacio();
        }
    }

    // ============================================================
    // 🔥 LIMPIAR BÚSQUEDA DE FAMILIAS DE CARACTERES
    // ============================================================

    static limpiarBusquedaFamiliasCaracteres() {
        const input = document.getElementById('buscarFamiliasCaracteres');
        if (input) {
            input.value = '';
        }
        const uiEspacio = window.UIEspacio;
        if (uiEspacio && !uiEspacio._cargando) {
            uiEspacio._paginaFamiliasCaracteres = 1;
            uiEspacio._renderizarMiEspacio();
        }
    }

    // ============================================================
    // RENDERIZAR BARRA DE BÚSQUEDA
    // ============================================================

    static renderizarBarraBusqueda(uiEspacio) {
        return `
            <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;background:var(--white);padding:12px 16px;border-radius:12px;box-shadow:var(--shadow);align-items:center;">
                <div style="flex:2;min-width:200px;position:relative;">
                    <i class="fas fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gray);"></i>
                    <input type="text" id="buscarEnEspacio" placeholder="🔍 Buscar palabras, frases, familias..." style="width:100%;padding:10px 14px 10px 38px;border:2px solid var(--light);border-radius:10px;font-size:14px;font-family:var(--font);transition:all 0.3s;" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--light)'" value="${uiEspacio._filtros.busqueda || ''}">
                </div>
                <select id="filtroNivelEspacio" style="padding:10px 14px;border:2px solid var(--light);border-radius:10px;font-size:13px;font-family:var(--font);background:var(--white);min-width:120px;">
                    <option value="">📚 Todos los niveles</option>
                    ${uiEspacio.NIVELES.map(n => `<option value="${n}" ${uiEspacio._filtros.nivel === n ? 'selected' : ''}>${uiEspacio.EMOJIS_NIVEL[n]} ${n}</option>`).join('')}
                </select>
                <select id="filtroTipoEspacio" style="padding:10px 14px;border:2px solid var(--light);border-radius:10px;font-size:13px;font-family:var(--font);background:var(--white);min-width:100px;">
                    <option value="todos" ${uiEspacio._filtros.tipo === 'todos' ? 'selected' : ''}>📚 Todos</option>
                    <option value="palabras" ${uiEspacio._filtros.tipo === 'palabras' ? 'selected' : ''}>📝 Palabras</option>
                    <option value="frases" ${uiEspacio._filtros.tipo === 'frases' ? 'selected' : ''}>📖 Frases</option>
                </select>
                <button class="btn-secondary" onclick="window.UIEspacio._limpiarFiltrosEspacio()" style="padding:8px 16px;font-size:12px;background:var(--bg);border:none;border-radius:8px;cursor:pointer;color:var(--gray);transition:all 0.3s;" onmouseover="this.style.background='var(--light)'" onmouseout="this.style.background='var(--bg)'"><i class="fas fa-times"></i> Limpiar filtros</button>
                <span style="font-size:12px;color:var(--gray-light);" id="resultadosFiltroEspacio"></span>
            </div>
        `;
    }

    // ============================================================
    // RENDERIZAR MODAL UNIFICADO
    // ============================================================

    static renderizarModalUnificado(uiEspacio) {
        const existing = document.getElementById('modalUnificadoOverlay');
        if (existing) existing.remove();

        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        const nivelReal = uiEspacio._obtenerNivelRealUsuario();
        const nombreIdioma = uiEspacio._getNombreIdioma(idiomaActivo);
        const esJeroglifico = uiEspacio._esJeroglifico(idiomaActivo);
        const idiomaNativo = uiEspacio._obtenerIdiomaNativo() || 'español';
        const esFrases = uiEspacio._modoGenerador === 'frases';

        const overlay = document.createElement('div');
        overlay.id = 'modalUnificadoOverlay';
        overlay.style.cssText = `
            position:fixed;top:0;left:0;width:100%;height:100%;
            background:rgba(0,0,0,0.7);backdrop-filter:blur(10px);
            z-index:99999;display:flex;justify-content:center;align-items:center;
            padding:20px;animation:fadeIn 0.3s ease;
        `;

        overlay.innerHTML = `
            <div style="
                background:var(--white,#ffffff);border-radius:20px;
                padding:28px 24px;max-width:750px;width:100%;
                max-height:90vh;overflow-y:auto;
                box-shadow:0 30px 80px rgba(0,0,0,0.3);
                animation:scaleIn 0.3s ease;
            ">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
                    <div>
                        <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                            📝 Añadir a Mi Espacio
                        </h2>
                        <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                            ${nombreIdioma} · Nivel ${nivelReal}
                            ${esJeroglifico ? ' · 🀄 Jeroglífico (con pinyin)' : ' · 🔤 Alfabeto latino'}
                            ${!esJeroglifico ? ` · 🎤 Transcripción en ${uiEspacio._getNombreIdioma(idiomaNativo)}` : ''}
                        </p>
                    </div>
                    <button onclick="window.UIEspacio._cerrarModalUnificado()" style="
                        background:none;border:none;font-size:28px;color:var(--gray);
                        cursor:pointer;transition:all 0.3s;
                    " onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--gray)'">
                        &times;
                    </button>
                </div>

                <div style="display:flex;gap:8px;margin-bottom:16px;border-bottom:2px solid var(--light);padding-bottom:12px;">
                    <button id="tabFrases" class="${uiEspacio._modoGenerador === 'frases' ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="window.UIEspacio._cambiarModoGeneradorUnificado('frases')" 
                            style="padding:6px 20px;font-size:13px;border:none;border-radius:8px;cursor:pointer;">
                        📖 Frases
                    </button>
                    <button id="tabPalabras" class="${uiEspacio._modoGenerador === 'palabras' ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="window.UIEspacio._cambiarModoGeneradorUnificado('palabras')" 
                            style="padding:6px 20px;font-size:13px;border:none;border-radius:8px;cursor:pointer;">
                        📝 Vocabulario
                    </button>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="font-size:14px;font-weight:600;color:var(--dark);display:block;margin-bottom:6px;">
                        ${esFrases ? '📝 Frases' : '📝 Palabras'} (una por línea)
                        <span style="font-size:11px;font-weight:400;color:var(--gray-light);">(máx. ${esFrases ? 20 : 30})</span>
                    </label>
                    <textarea id="modalUnificadoInput" rows="6" placeholder="${esFrases ? 'Escribe una frase por línea (ej: El árbol es verde)\nMe gusta la naturaleza' : 'Escribe una palabra por línea (ej: árbol)\nnaturaleza\nverde'}" style="
                        width:100%;padding:10px 14px;border:2px solid var(--light);
                        border-radius:10px;font-size:14px;font-family:var(--font);
                        resize:vertical;transition:all 0.3s;
                    " onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--light)'" 
                    oninput="window.UIEspacio._actualizarContadorUnificado()"></textarea>

                    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-light);margin-top:4px;flex-wrap:wrap;gap:4px;">
                        <span>💡 Escribe en tu idioma nativo o en el idioma objetivo</span>
                        <span id="contadorUnificado">0 elementos</span>
                    </div>
                </div>

                <div style="background:var(--bg);border-radius:8px;padding:12px 16px;margin-bottom:12px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <span style="font-size:13px;font-weight:600;color:var(--gray);">🌍 Dirección:</span>
                        <select id="modalUnificadoDireccion" style="
                            padding:6px 12px;border:2px solid var(--light);border-radius:8px;
                            font-size:13px;font-family:var(--font);background:var(--white);
                        ">
                            <option value="${idiomaNativo}->${nombreIdioma}">${idiomaNativo} → ${nombreIdioma}</option>
                            <option value="${nombreIdioma}->${idiomaNativo}">${nombreIdioma} → ${idiomaNativo}</option>
                        </select>
                    </div>
                    ${esJeroglifico ? `
                        <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--gray);cursor:pointer;">
                            <input type="checkbox" id="modalIncluirPinyin" checked>
                            <span>Incluir pinyin</span>
                        </label>
                    ` : `
                        <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--gray);cursor:pointer;">
                            <input type="checkbox" id="modalIncluirTranscripcion" checked>
                            <span>🎤 Incluir transcripción fonética</span>
                        </label>
                    `}
                    <span style="font-size:11px;color:var(--gray-light);margin-left:auto;">
                        🎯 Nivel: ${nivelReal}
                    </span>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="font-size:14px;font-weight:600;color:var(--dark);display:block;margin-bottom:6px;">
                        📄 JSON para importar (pégalo aquí) o resultado de generación
                        <span style="font-size:11px;font-weight:400;color:var(--gray-light);">(puedes pegar JSON ya traducido por IA)</span>
                    </label>
                    <textarea id="modalUnificadoJSON" rows="6" placeholder="Pega aquí un JSON completado por la IA para importarlo directamente..." style="
                        width:100%;padding:10px 14px;border:2px solid var(--light);
                        border-radius:10px;font-size:13px;font-family:monospace;
                        resize:vertical;transition:all 0.3s;min-height:100px;
                    " onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--light)'"></textarea>
                    <div style="font-size:10px;color:var(--gray-light);margin-top:2px;">
                        💡 El JSON generado aparecerá aquí para que lo copies y lo envíes a la IA
                    </div>
                </div>

                <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;">
                    <button class="btn-primary" onclick="window.UIEspacio._generarJSONUnificado()" style="
                        flex:1;padding:12px 20px;font-size:15px;font-weight:700;
                        border:none;border-radius:10px;cursor:pointer;
                        background:linear-gradient(135deg,#6C5CE7,#A29BFE);
                        color:white;transition:all 0.3s;min-width:140px;
                    " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(108,92,231,0.3)'" 
                       onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-magic"></i> Generar JSON
                    </button>
                    <button class="btn-success" onclick="window.UIEspacio._validarEImportarJSONUnificado()" style="
                        flex:1;padding:12px 20px;font-size:15px;font-weight:700;
                        border:none;border-radius:10px;cursor:pointer;
                        background:linear-gradient(135deg,#00B894,#55EFC4);
                        color:white;transition:all 0.3s;min-width:140px;
                    " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(0,184,148,0.3)'" 
                       onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                        <i class="fas fa-file-import"></i> Validar e Importar
                    </button>
                    <button class="btn-secondary" onclick="window.UIEspacio._cerrarModalUnificado()" style="
                        padding:12px 20px;font-size:15px;border:none;border-radius:10px;
                        cursor:pointer;background:var(--light);color:var(--gray);
                        transition:all 0.3s;
                    " onmouseover="this.style.background='var(--gray-light)'" onmouseout="this.style.background='var(--light)'">
                        Cancelar
                    </button>
                </div>

                <div id="modalUnificadoResultado" style="margin-top:16px;display:none;padding:16px;border-radius:10px;font-size:14px;"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) uiEspacio._cerrarModalUnificado();
        });

        uiEspacio._generadorEscapeHandler = (e) => {
            if (e.key === 'Escape' && uiEspacio._generadorAbierto) uiEspacio._cerrarModalUnificado();
        };
        document.addEventListener('keydown', uiEspacio._generadorEscapeHandler);

        uiEspacio._actualizarContadorUnificado();
    }

    // ============================================================
    // RENDERIZAR DETALLE DE FAMILIA DE CARACTERES
    // ============================================================

    static async renderizarDetalleFamiliaCaracteres(uiEspacio, familiaId) {
        const container = document.getElementById('espacioContent');
        if (!container) return;

        let familiaData = uiEspacio._familiasCaracteresCache[familiaId];
        if (!familiaData) {
            const palabraRaiz = await db.get('palabras', familiaId);
            if (!palabraRaiz || !palabraRaiz.esCaracterRaiz) {
                uiEspacio._core?.mostrarToast('❌ No se encontró la familia de caracteres', 'error');
                return;
            }
            familiaData = {
                caracterRaiz: palabraRaiz,
                palabrasDerivadas: []
            };
            const todasPalabras = await db.obtenerPalabrasPorIdioma(palabraRaiz.idioma);
            familiaData.palabrasDerivadas = todasPalabras.filter(p =>
                p.esPalabraDerivada && p.caracterRaiz === palabraRaiz.palabra
            );
            uiEspacio._familiasCaracteresCache[familiaId] = familiaData;
        }

        const { caracterRaiz, palabrasDerivadas } = familiaData;
        const esJeroglifico = uiEspacio._esJeroglifico(caracterRaiz.idioma);

        let html = `
            <div class="espacio-detalle-familia" style="padding:16px;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
                    <button class="btn-back" onclick="window.UIEspacio._volver()" style="padding:6px 14px;font-size:13px;">
                        <i class="fas fa-arrow-left"></i> Volver
                    </button>
                    <span style="font-size:36px;">🧠</span>
                    <div>
                        <h2 style="font-size:24px;font-weight:800;color:var(--dark);margin:0;">
                            Familia: ${caracterRaiz.palabra}
                        </h2>
                        <span style="font-size:14px;color:var(--gray);">
                            ${caracterRaiz.significado || 'Significado base'}
                            ${caracterRaiz.pinyin ? `· 🔊 ${caracterRaiz.pinyin}` : ''}
                            ${caracterRaiz.transcripcion ? `· 🎤 ${caracterRaiz.transcripcion}` : ''}
                        </span>
                    </div>
                    <span style="font-size:12px;color:var(--gray-light);margin-left:auto;">
                        🎯 ${caracterRaiz.nivel || 'A1'} · ${caracterRaiz.tema || 'General'}
                    </span>
                </div>

                ${caracterRaiz.mnemotecnia ? `
                    <div style="background:linear-gradient(135deg, var(--primary)10, var(--secondary)10);border-radius:12px;padding:12px 16px;margin-bottom:16px;border-left:4px solid var(--primary);">
                        <div style="font-size:12px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;">💡 Mnemotecnia</div>
                        <div style="font-size:15px;color:var(--dark);">${caracterRaiz.mnemotecnia}</div>
                    </div>
                ` : ''}

                ${caracterRaiz.etimologia_breve ? `
                    <div style="background:var(--bg);border-radius:8px;padding:10px 14px;margin-bottom:16px;border:1px solid var(--light);">
                        <div style="font-size:11px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;">📜 Etimología</div>
                        <div style="font-size:13px;color:var(--gray);">${caracterRaiz.etimologia_breve}</div>
                    </div>
                ` : ''}

                ${caracterRaiz.estructura ? `
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin-bottom:16px;">
                        ${caracterRaiz.estructura.radicales ? `
                            <div style="background:var(--bg);border-radius:8px;padding:8px 12px;">
                                <div style="font-size:10px;font-weight:600;color:var(--gray);text-transform:uppercase;">Radicales</div>
                                <div style="font-size:14px;font-weight:600;color:var(--dark);">${caracterRaiz.estructura.radicales.join(' · ')}</div>
                            </div>
                        ` : ''}
                        ${caracterRaiz.estructura.trazos_clave?.length > 0 ? `
                            <div style="background:var(--bg);border-radius:8px;padding:8px 12px;">
                                <div style="font-size:10px;font-weight:600;color:var(--gray);text-transform:uppercase;">Trazos clave</div>
                                <div style="font-size:14px;font-weight:600;color:var(--dark);">${caracterRaiz.estructura.trazos_clave.map(t => t.nombre).join(' · ')}</div>
                            </div>
                        ` : ''}
                        ${caracterRaiz.numero_trazos ? `
                            <div style="background:var(--bg);border-radius:8px;padding:8px 12px;">
                                <div style="font-size:10px;font-weight:600;color:var(--gray);text-transform:uppercase;">Número de trazos</div>
                                <div style="font-size:14px;font-weight:600;color:var(--dark);">${caracterRaiz.numero_trazos}</div>
                            </div>
                        ` : ''}
                        ${caracterRaiz.estructura.tipo_estructura ? `
                            <div style="background:var(--bg);border-radius:8px;padding:8px 12px;">
                                <div style="font-size:10px;font-weight:600;color:var(--gray);text-transform:uppercase;">Tipo de estructura</div>
                                <div style="font-size:14px;font-weight:600;color:var(--dark);">${caracterRaiz.estructura.tipo_estructura}</div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:16px 0 12px 0;">
                    📚 Palabras derivadas (${palabrasDerivadas.length})
                </h3>

                ${palabrasDerivadas.length === 0 ? `
                    <div style="text-align:center;padding:30px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">
                        <p>No hay palabras derivadas guardadas para esta familia.</p>
                        <p style="font-size:12px;">Genera la familia desde el Generador JSON → "Generar Familia de Caracteres"</p>
                    </div>
                ` : `
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">
                        ${palabrasDerivadas.map(p => `
                            <div style="background:var(--white);border-radius:10px;padding:12px 14px;box-shadow:var(--shadow);border-left:3px solid var(--primary);cursor:pointer;" 
                                 onclick="window.UIEspacio._verDetallePalabraProfesional(${p.id})"
                                 onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'" 
                                 onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                                <div style="display:flex;justify-content:space-between;align-items:start;">
                                    <div>
                                        <div style="font-size:18px;font-weight:700;color:var(--dark);">
                                            ${esJeroglifico ? p.palabra : p.palabra}
                                            ${p.pinyin ? `<span style="font-size:12px;color:var(--gray-light);margin-left:8px;">${p.pinyin}</span>` : ''}
                                            ${p.transcripcion ? `<span style="font-size:12px;color:var(--gray-light);margin-left:8px;">🎤 ${p.transcripcion}</span>` : ''}
                                        </div>
                                        <div style="font-size:14px;color:var(--gray);">${p.significado}</div>
                                    </div>
                                    <span style="font-size:11px;color:var(--gray-light);">${p.nivel || 'A1'}</span>
                                </div>

                                ${p.desgloseMorfologico ? `
                                    <div style="font-size:12px;color:var(--gray-light);margin-top:6px;padding:4px 8px;background:var(--bg);border-radius:4px;">
                                        ${p.desgloseMorfologico}
                                    </div>
                                ` : ''}

                                ${p.asociacionVisual ? `
                                    <div style="font-size:11px;color:var(--gray-light);margin-top:4px;">
                                        💡 ${p.asociacionVisual}
                                    </div>
                                ` : ''}

                                ${p.ejemploFrase ? `
                                    <div style="font-size:12px;color:var(--gray);margin-top:6px;padding:6px 10px;background:var(--bg);border-radius:4px;border:1px dashed var(--light);">
                                        📝 "${p.ejemploFrase}"
                                    </div>
                                ` : ''}

                                <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
                                    <span style="font-size:9px;background:var(--primary)10;padding:2px 10px;border-radius:10px;color:var(--primary);">
                                        📂 ${p.familiaSemanticaPrincipal || p.familiaSemantica || 'General'}
                                    </span>
                                    <button class="btn-secondary" onclick="event.stopPropagation();window.UIEspacio._ejercicioRellenar('${p.palabra.replace(/'/g, "\\'")}', '${caracterRaiz.idioma}')" 
                                            style="padding:2px 10px;font-size:10px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                        <i class="fas fa-pencil-alt"></i> Practicar
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}

                <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
                    <button class="btn-primary" onclick="window.UIEspacio._estudiarFamiliaCaracteres('${caracterRaiz.id}')" style="padding:8px 20px;">
                        <i class="fas fa-play"></i> Estudiar toda la familia
                    </button>
                    ${caracterRaiz.variantes ? `
                        <button class="btn-secondary" onclick="window.UIEspacio._mostrarVariantes('${JSON.stringify(caracterRaiz.variantes).replace(/'/g, "\\'")}')" style="padding:8px 20px;">
                            <i class="fas fa-exchange-alt"></i> Ver variantes
                        </button>
                    ` : ''}
                    <button class="btn-secondary" onclick="window.UIEspacio._volver()" style="padding:8px 20px;">
                        <i class="fas fa-arrow-left"></i> Volver
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
        uiEspacio._mostrandoFamilia = true;
        uiEspacio._familiaSeleccionada = familiaId;
    }

    // ============================================================
    // RENDERIZAR ELEMENTO ESPACIO CON PINYIN/TRANSCRIPCIÓN
    // ============================================================

    static renderizarElementoEspacio(elemento, tipo, idioma, uiEspacio) {
        const esJeroglifico = uiEspacio._esJeroglifico(idioma);
        let html = '';

        if (tipo === 'frase') {
            const textoObjetivo = elemento.original || elemento.traduccion || '';
            const textoNativo = elemento.traduccion || elemento.original || '';
            const transcripcion = uiEspacio._getTranscripcion(elemento, idioma);
            const familiaSemantica = elemento.familiaSemantica || 'sin_clasificar';
            const familiaGramatical = elemento.familiaGramatical || 'sustantivo';
            const nivel = elemento.nivel || 'A1';
            const colorSemantica = uiEspacio._getColorFamiliaSemantica(familiaSemantica);
            const colorGramatical = uiEspacio._getColorFamiliaGramatical(familiaGramatical);
            const tieneRegla = elemento.reglaGramatical && !elemento.reglaGramatical.startsWith('[');

            if (esJeroglifico) {
                const hanzi = elemento.segmentacion?.hanzi || textoObjetivo;
                const pinyin = elemento.segmentacion?.pinyin || elemento.pinyinCompleto || elemento.pinyin || '';
                html += `<div style="font-weight:700;color:var(--dark);font-size:24px;line-height:1.4;">${hanzi}</div>`;
                if (pinyin) {
                    html += `<div style="font-size:16px;color:var(--gray-light);margin-top:2px;letter-spacing:1px;">🔊 ${pinyin}</div>`;
                } else {
                    html += `<div style="font-size:12px;color:var(--danger);margin-top:2px;">⚠️ Sin transcripción fonética</div>`;
                }
                html += `<div style="font-size:18px;color:var(--gray);margin-top:2px;">→ ${textoNativo}</div>`;
            } else {
                html += `<div style="font-weight:700;color:var(--dark);font-size:24px;line-height:1.4;">${textoObjetivo}</div>`;
                if (transcripcion) {
                    html += `<div style="font-size:16px;color:var(--gray-light);margin-top:2px;">🎤 ${transcripcion}</div>`;
                }
                html += `<div style="font-size:18px;color:var(--gray);margin-top:2px;">→ ${textoNativo}</div>`;
            }

            html += `<div style="display:flex;gap:8px;margin-top:6px;font-size:11px;color:var(--gray-light);flex-wrap:wrap;">`;
            html += `<span style="background:${colorSemantica}15;padding:2px 10px;border-radius:12px;color:${colorSemantica};">📂 ${familiaSemantica}</span>`;
            html += `<span style="background:${colorGramatical}15;padding:2px 10px;border-radius:12px;color:${colorGramatical};">📝 ${familiaGramatical}</span>`;
            html += `<span style="background:var(--bg);padding:2px 10px;border-radius:12px;">🏆 ${nivel}</span>`;
            if (tieneRegla) {
                html += `<span style="background:var(--primary)10;padding:2px 10px;border-radius:12px;color:var(--primary);cursor:pointer;" onclick="window.UIEspacio._verExplicacionGramaticalDesdeEspacio(${elemento.id})">📋 ${elemento.reglaGramatical}</span>`;
            }
            html += `</div>`;

        } else if (tipo === 'palabra') {
            const textoObjetivo = elemento.palabra || elemento.hanzi || '';
            const textoNativo = elemento.significado || elemento.original || '';
            const transcripcion = uiEspacio._getTranscripcion(elemento, idioma);
            const familiaSemantica = elemento.familiaSemantica || 'sin_clasificar';
            const familiaGramatical = elemento.familia || elemento.familiaGramatical || 'sustantivo';
            const nivel = elemento.nivel || 'A1';
            const colorSemantica = uiEspacio._getColorFamiliaSemantica(familiaSemantica);
            const colorGramatical = uiEspacio._getColorFamiliaGramatical(familiaGramatical);

            if (esJeroglifico) {
                html += `<div style="font-weight:700;color:var(--primary);font-size:24px;line-height:1.4;">${textoObjetivo}</div>`;
                if (transcripcion) {
                    html += `<div style="font-size:16px;color:var(--gray-light);margin-top:2px;letter-spacing:1px;">🔊 ${transcripcion}</div>`;
                } else {
                    html += `<div style="font-size:12px;color:var(--danger);margin-top:2px;">⚠️ Sin transcripción fonética</div>`;
                }
            } else {
                html += `<div style="font-weight:700;color:var(--primary);font-size:24px;line-height:1.4;">${textoObjetivo}</div>`;
                if (transcripcion) {
                    html += `<div style="font-size:16px;color:var(--gray-light);margin-top:2px;">🎤 ${transcripcion}</div>`;
                }
            }
            html += `<div style="font-size:18px;color:var(--gray);margin-top:2px;">→ ${textoNativo}</div>`;

            html += `<div style="display:flex;gap:8px;margin-top:6px;font-size:11px;color:var(--gray-light);flex-wrap:wrap;">`;
            html += `<span style="background:${colorSemantica}15;padding:2px 10px;border-radius:12px;color:${colorSemantica};">📂 ${familiaSemantica}</span>`;
            html += `<span style="background:${colorGramatical}15;padding:2px 10px;border-radius:12px;color:${colorGramatical};">📝 ${familiaGramatical}</span>`;
            html += `<span style="background:var(--bg);padding:2px 10px;border-radius:12px;">🏆 ${nivel}</span>`;
            html += `</div>`;
        }

        return html;
    }

    // ============================================================
    // RENDERIZAR PAGINADOR
    // ============================================================

    static renderizarPaginador(paginaActual, totalPaginas, id) {
        if (totalPaginas <= 1) return '';
        return `
            <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin:8px 0;flex-wrap:wrap;">
                <button class="btn-secondary" onclick="window.UIEspacio._irPagina('${id}', ${paginaActual - 1})" style="padding:4px 12px;font-size:11px;${paginaActual <= 1 ? 'opacity:0.5;cursor:default;' : ''}" ${paginaActual <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>
                <span style="font-size:12px;color:var(--gray);">${paginaActual} / ${totalPaginas}</span>
                <button class="btn-secondary" onclick="window.UIEspacio._irPagina('${id}', ${paginaActual + 1})" style="padding:4px 12px;font-size:11px;${paginaActual >= totalPaginas ? 'opacity:0.5;cursor:default;' : ''}" ${paginaActual >= totalPaginas ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
    }
}

// ============================================================
// EXPORTAR PARA USO GLOBAL
// ============================================================

window.UIEspacioRender = UIEspacioRender;
console.log('✅ UIEspacio Render v1.7 - CON TRANSCRIPCIÓN FONÉTICA (COMPLETO)');
console.log('  🎤 Transcripción fonética en tarjetas de palabras y frases');
console.log('  🔊 Integración con sistema de transcripción universal');
console.log('  📝 Cache automática de transcripciones');
console.log('  📱 Detalle profesional en móvil');
console.log('  🔗 onclick correcto: _verDetallePalabraProfesional');
console.log('  🎯 Compatible con móvil y escritorio');
console.log('  ✅ Todas las funcionalidades originales preservadas');