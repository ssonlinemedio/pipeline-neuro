// ============================================================
// UI ESPACIO ACTIONS v1.6 - CORREGIDO: REFERENCIAS A UIStudy
// ============================================================

class UIEspacioActions {
    // ============================================================
    // TOGGLE FRASE FAVORITA
    // ============================================================

    static async toggleFraseFavorita(fraseId, checked, uiEspacio) {
        if (!fraseId) {
            console.warn('⚠️ ID de frase no válido');
            uiEspacio._mostrarToast('❌ Error: ID de frase no válido', 'error');
            return;
        }

        const nivelReal = uiEspacio._obtenerNivelRealUsuario();
        const nombreNivel = `📚 Nivel ${nivelReal}`;

        try {
            if (!window.gestorFavoritos || !gestorFavoritos._initDone) {
                await window.gestorFavoritos.init();
            }

            if (checked) {
                const yaExiste = await window.gestorFavoritos.estaEnFavoritos('frase', fraseId);
                if (yaExiste) {
                    uiEspacio._mostrarToast('ℹ️ La frase ya está en Mi Espacio', 'info');
                    return;
                }

                const result = await window.gestorFavoritos.añadirFrase(fraseId);
                if (result) {
                    await window.gestorFavoritos.añadirFraseAGrupo(fraseId, uiEspacio.GRUPO_USUARIO);
                    await window.gestorFavoritos.añadirFraseAGrupo(fraseId, nombreNivel);
                    uiEspacio._mostrarToast(`✅ Frase guardada en ${nombreNivel}`, 'success');
                } else {
                    uiEspacio._mostrarToast('⚠️ No se pudo guardar la frase', 'warning');
                }
            } else {
                const result = await window.gestorFavoritos.eliminarFrase(fraseId);
                if (result) {
                    uiEspacio._mostrarToast('🗑️ Frase eliminada de Mi Espacio', 'warning');
                } else {
                    uiEspacio._mostrarToast('⚠️ No se pudo eliminar la frase', 'warning');
                }
            }
        } catch (error) {
            console.warn('⚠️ Error al gestionar favorito:', error);
            if (error.message && error.message.includes('no existe')) {
                uiEspacio._mostrarToast('❌ La frase no existe en la base de datos', 'error');
            }
        }

        try {
            if (window.uiCore) window.uiCore._actualizarEspacioStats();
            if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(uiEspacio._getCore());
            uiEspacio._renderizarMiEspacio();
        } catch (e) {
            console.warn('⚠️ Error actualizando UI después de toggle:', e);
        }
    }

    // ============================================================
    // 🔥 VER DETALLE PROFESIONAL DE PALABRA
    // ============================================================

    static async verDetallePalabraProfesional(palabraId, uiEspacio) {
        const core = uiEspacio._getCore();
        if (!core) {
            console.error('❌ Core no disponible');
            return;
        }

        try {
            const palabra = await db.get('palabras', palabraId);
            if (!palabra) {
                core.mostrarToast('❌ Palabra no encontrada', 'error');
                return;
            }

            const idioma = palabra.idioma || gestorIdiomas.getIdiomaActivo() || 'es';
            const esJeroglifico = uiEspacio._esJeroglifico(idioma);
            const nivelReal = uiEspacio._obtenerNivelRealUsuario();
            const idiomaNativo = uiEspacio._obtenerIdiomaNativo();
            const nombreIdioma = uiEspacio._getNombreIdioma(idioma);

            let progreso = await db.obtenerProgreso(palabraId);
            const rcn = progreso?.rcn || 0;
            const fase = progreso?.fase || 1;
            const repasosExitosos = progreso?.repasosExitosos || 0;
            const repasosFallidos = progreso?.repasosFallidos || 0;
            const estado = progreso?.estado || 'nuevo';

            let caracterRaiz = null;
            let palabrasDerivadas = [];
            let esCaracterRaiz = palabra.esCaracterRaiz === true;

            const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);

            if (esCaracterRaiz) {
                palabrasDerivadas = todasPalabras.filter(p => 
                    p.esPalabraDerivada === true && 
                    p.caracterRaiz === palabra.palabra
                );
            } else if (palabra.caracterRaiz) {
                caracterRaiz = todasPalabras.find(p => 
                    p.esCaracterRaiz === true && 
                    p.palabra === palabra.caracterRaiz
                );
            }

            const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
            const frasesAsociadas = [];
            const textoPalabra = (palabra.palabra || palabra.hanzi || '').toLowerCase();

            for (const f of todasFrases) {
                const textoOriginal = (f.original || '').toLowerCase();
                if (textoOriginal.includes(textoPalabra)) {
                    frasesAsociadas.push(f);
                }
            }

            const familiaSemantica = palabra.familiaSemantica || palabra.familia || 'sin_clasificar';
            const palabrasMismaFamilia = todasPalabras.filter(p => 
                (p.familiaSemantica || p.familia || '') === familiaSemantica &&
                p.id !== palabraId
            );

            let estudioCompleto = null;
            if (esCaracterRaiz && palabra._estudio_completo) {
                try {
                    estudioCompleto = JSON.parse(palabra._estudio_completo);
                } catch (e) {}
            }
            if (esCaracterRaiz && palabra._estudio_completo_data) {
                estudioCompleto = palabra._estudio_completo_data;
            }

            const html = await UIEspacioActions._construirPanelDetalleProfesional(
                palabra, 
                idioma, 
                esJeroglifico,
                nivelReal,
                idiomaNativo,
                nombreIdioma,
                rcn,
                fase,
                repasosExitosos,
                repasosFallidos,
                estado,
                caracterRaiz,
                palabrasDerivadas,
                frasesAsociadas,
                palabrasMismaFamilia,
                estudioCompleto,
                uiEspacio
            );

            core.abrirModal(`📖 ${palabra.palabra || palabra.hanzi} - Detalle Profesional`);
            const textarea = document.getElementById('jsonTextarea');
            if (textarea) {
                textarea.style.display = 'none';
                
                let panelContainer = document.getElementById('detallePalabraPanel');
                if (!panelContainer) {
                    panelContainer = document.createElement('div');
                    panelContainer.id = 'detallePalabraPanel';
                    panelContainer.style.cssText = `
                        padding: 8px 4px;
                        max-height: 70vh;
                        overflow-y: auto;
                        font-family: var(--font, -apple-system, BlinkMacSystemFont, sans-serif);
                    `;
                    const modalBody = textarea.parentElement;
                    modalBody.appendChild(panelContainer);
                }
                panelContainer.innerHTML = html;
                panelContainer.style.display = 'block';

                const closeBtn = document.getElementById('jsonModalClose');
                if (closeBtn) {
                    const newCloseBtn = closeBtn.cloneNode(true);
                    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                    newCloseBtn.onclick = () => {
                        core.cerrarModal();
                        setTimeout(() => {
                            const container = document.getElementById('detallePalabraPanel');
                            if (container) container.remove();
                            const ta = document.getElementById('jsonTextarea');
                            if (ta) ta.style.display = 'block';
                        }, 200);
                    };
                }

                const titleEl = document.getElementById('jsonModalTitle');
                if (titleEl) {
                    const displayText = esJeroglifico ? palabra.palabra : palabra.palabra || palabra.hanzi;
                    titleEl.textContent = `📖 ${displayText} - Panel de Conocimiento`;
                }

                const copyBtn = document.getElementById('jsonCopy');
                const importBtn = document.getElementById('jsonImport');
                if (copyBtn) copyBtn.style.display = 'none';
                if (importBtn) importBtn.style.display = 'none';
            }

        } catch (error) {
            console.error('❌ Error mostrando detalle profesional:', error);
            core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // CONSTRUIR PANEL DE DETALLE PROFESIONAL
    // ============================================================

    static async _construirPanelDetalleProfesional(
        palabra,
        idioma,
        esJeroglifico,
        nivelReal,
        idiomaNativo,
        nombreIdioma,
        rcn,
        fase,
        repasosExitosos,
        repasosFallidos,
        estado,
        caracterRaiz,
        palabrasDerivadas,
        frasesAsociadas,
        palabrasMismaFamilia,
        estudioCompleto,
        uiEspacio
    ) {
        const textoPrincipal = palabra.palabra || palabra.hanzi || '';
        const pinyin = palabra.pinyin || '';
        const significado = palabra.significado || textoPrincipal;
        const familiaSemantica = palabra.familiaSemantica || palabra.familia || 'sin_clasificar';
        const familiaGramatical = palabra.familia || palabra.familiaGramatical || 'sustantivo';
        const nivel = palabra.nivel || nivelReal;
        const esRaiz = palabra.esCaracterRaiz === true;
        const esDerivada = palabra.esPalabraDerivada === true;

        let estadoRCN = '🔴 Nuevo';
        let estadoColor = 'var(--danger)';
        let estadoRCNBarra = 0;
        if (rcn >= 4) {
            estadoRCN = '🟣 Dominado';
            estadoColor = 'var(--success)';
            estadoRCNBarra = 100;
        } else if (rcn >= 3) {
            estadoRCN = '🟢 Consolidado';
            estadoColor = 'var(--success)';
            estadoRCNBarra = 75;
        } else if (rcn >= 2) {
            estadoRCN = '🟡 En progreso';
            estadoColor = 'var(--warning)';
            estadoRCNBarra = 50;
        } else if (rcn >= 0.5) {
            estadoRCN = '🟠 Iniciando';
            estadoColor = 'var(--info)';
            estadoRCNBarra = 25;
        } else {
            estadoRCN = '🔴 Necesita práctica';
            estadoColor = 'var(--danger)';
            estadoRCNBarra = 5;
        }

        const totalRepasos = repasosExitosos + repasosFallidos;
        const eficiencia = totalRepasos > 0 ? Math.round((repasosExitosos / totalRepasos) * 100) : 0;

        let nivelDominioSugerido = nivel;
        if (rcn >= 4) {
            const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            const idx = niveles.indexOf(nivel);
            if (idx < niveles.length - 1) {
                nivelDominioSugerido = niveles[idx + 1];
            }
        }

        let html = `
            <div style="display:flex;flex-direction:column;gap:14px;">
                
                <!-- CABECERA -->
                <div style="background:linear-gradient(135deg, var(--primary)08, var(--secondary)08);border-radius:14px;padding:18px 20px;border:2px solid var(--primary)20;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
                    <div style="display:flex;align-items:center;gap:16px;">
                        <div style="text-align:center;">
                            <div style="font-size:${esJeroglifico ? '52px' : '36px'};font-weight:800;color:var(--dark);line-height:1.2;">${textoPrincipal}</div>
                            ${pinyin ? `<div style="font-size:17px;color:var(--gray-light);letter-spacing:1.5px;margin-top:2px;">🔊 ${pinyin}</div>` : ''}
                            ${esJeroglifico && !pinyin ? `<div style="font-size:12px;color:var(--danger);">⚠️ Sin pinyin</div>` : ''}
                        </div>
                        <div>
                            <div style="font-size:20px;font-weight:700;color:var(--dark);">${significado}</div>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;font-size:12px;color:var(--gray);">
                                <span>🌍 ${nombreIdioma}</span>
                                <span>🎯 ${nivel}</span>
                                <span>📂 ${familiaSemantica}</span>
                                <span>📝 ${familiaGramatical}</span>
                                ${esRaiz ? '<span style="color:var(--primary);font-weight:600;">🌟 Carácter Raíz</span>' : ''}
                                ${esDerivada ? `<span style="color:var(--secondary);font-weight:600;">🔗 Derivada de "${caracterRaiz?.palabra || palabra.caracterRaiz}"</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div style="text-align:center;min-width:120px;">
                        <div style="font-size:11px;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;">RCN</div>
                        <div style="font-size:36px;font-weight:800;color:${estadoColor};">${rcn.toFixed(1)}</div>
                        <div style="font-size:11px;color:${estadoColor};font-weight:600;">${estadoRCN}</div>
                    </div>
                </div>

                <!-- FILA DE ESTADÍSTICAS -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;">
                    <div style="background:var(--bg);border-radius:8px;padding:10px 12px;text-align:center;border-top:3px solid var(--primary);">
                        <div style="font-size:18px;font-weight:800;color:var(--primary);">${fase}</div>
                        <div style="font-size:9px;color:var(--gray);text-transform:uppercase;">Fase</div>
                    </div>
                    <div style="background:var(--bg);border-radius:8px;padding:10px 12px;text-align:center;border-top:3px solid var(--success);">
                        <div style="font-size:18px;font-weight:800;color:var(--success);">${repasosExitosos}</div>
                        <div style="font-size:9px;color:var(--gray);text-transform:uppercase;">Aciertos</div>
                    </div>
                    <div style="background:var(--bg);border-radius:8px;padding:10px 12px;text-align:center;border-top:3px solid var(--danger);">
                        <div style="font-size:18px;font-weight:800;color:var(--danger);">${repasosFallidos}</div>
                        <div style="font-size:9px;color:var(--gray);text-transform:uppercase;">Fallos</div>
                    </div>
                    <div style="background:var(--bg);border-radius:8px;padding:10px 12px;text-align:center;border-top:3px solid var(--secondary);">
                        <div style="font-size:18px;font-weight:800;color:var(--secondary);">${eficiencia}%</div>
                        <div style="font-size:9px;color:var(--gray);text-transform:uppercase;">Eficiencia</div>
                    </div>
                    <div style="background:var(--bg);border-radius:8px;padding:10px 12px;text-align:center;border-top:3px solid var(--warning);">
                        <div style="font-size:18px;font-weight:800;color:var(--warning);">${nivelDominioSugerido}</div>
                        <div style="font-size:9px;color:var(--gray);text-transform:uppercase;">Nivel Sugerido</div>
                    </div>
                </div>

                <!-- BARRA DE PROGRESO RCN -->
                <div style="background:var(--bg);border-radius:8px;padding:8px 12px;">
                    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray);margin-bottom:2px;">
                        <span>📈 Progreso de RCN</span>
                        <span>${Math.round((rcn / 5) * 100)}%</span>
                    </div>
                    <div style="height:6px;background:var(--light);border-radius:3px;overflow:hidden;">
                        <div style="height:100%;width:${Math.round((rcn / 5) * 100)}%;background:${estadoColor};border-radius:3px;transition:width 0.8s ease;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--gray-light);margin-top:2px;">
                        <span>🔴 Nuevo</span>
                        <span>🟡 En progreso</span>
                        <span>🟢 Consolidado</span>
                        <span>🟣 Dominado</span>
                    </div>
                </div>

                <!-- INFORMACIÓN DEL CARÁCTER -->
                ${esJeroglifico ? `
                    <div style="background:var(--bg);border-radius:10px;padding:14px 16px;border:1px solid var(--light);">
                        <div style="font-size:12px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">🀄 Información del Carácter</div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;font-size:13px;color:var(--dark);">
                            ${palabra.numero_trazos ? `<div><strong>Trazos:</strong> ${palabra.numero_trazos}</div>` : ''}
                            ${palabra.estructura?.radicales?.length > 0 ? `<div><strong>Radicales:</strong> ${palabra.estructura.radicales.join(' · ')}</div>` : ''}
                            ${palabra.estructura?.tipo_estructura ? `<div><strong>Estructura:</strong> ${palabra.estructura.tipo_estructura}</div>` : ''}
                            ${palabra.etimologia_breve ? `<div style="grid-column:1/-1;"><strong>Etimología:</strong> ${palabra.etimologia_breve}</div>` : ''}
                            ${palabra.mnemotecnia ? `<div style="grid-column:1/-1;background:var(--primary)08;padding:6px 10px;border-radius:6px;border-left:3px solid var(--primary);"><strong>💡 Mnemotecnia:</strong> ${palabra.mnemotecnia}</div>` : ''}
                            ${palabra.variantes ? `
                                <div style="grid-column:1/-1;">
                                    <strong>Variantes:</strong>
                                    ${palabra.variantes.tradicional ? `Tradicional: ${palabra.variantes.tradicional}` : ''}
                                    ${palabra.variantes.simplificado ? `Simplificado: ${palabra.variantes.simplificado}` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- ESTUDIO COMPLETO -->
                ${estudioCompleto ? `
                    <div style="background:var(--bg);border-radius:10px;padding:14px 16px;border:1px solid var(--success);">
                        <div style="font-size:12px;font-weight:600;color:var(--success);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">📚 Estudio Completo Disponible</div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:12px;color:var(--gray);">
                            ${estudioCompleto.evolucion_historica ? '<span>📜 Evolución histórica</span>' : ''}
                            ${estudioCompleto.componentes ? '<span>🧩 Componentes</span>' : ''}
                            ${estudioCompleto.usos_modernos ? '<span>📱 Usos modernos</span>' : ''}
                            ${estudioCompleto.conexiones_culturales ? '<span>🌍 Conexiones culturales</span>' : ''}
                            ${estudioCompleto.simbologia ? '<span>🔮 Simbología</span>' : ''}
                            ${estudioCompleto.ejercicios?.length > 0 ? `<span>🎯 ${estudioCompleto.ejercicios.length} ejercicios</span>` : ''}
                            ${estudioCompleto.logros?.length > 0 ? `<span>🏆 ${estudioCompleto.logros.length} logros</span>` : ''}
                        </div>
                        <button class="btn-secondary" onclick="window.UICaracteres._verEstudioCompleto(${palabra.id})" 
                                style="margin-top:6px;padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-book"></i> Ver Estudio Completo
                        </button>
                    </div>
                ` : ''}

                <!-- CARÁCTER RAÍZ -->
                ${caracterRaiz ? `
                    <div style="background:var(--primary)05;border-radius:10px;padding:12px 16px;border-left:4px solid var(--primary);">
                        <div style="font-size:12px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">🌟 Carácter Raíz</div>
                        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;cursor:pointer;" onclick="window.UIEspacio._verDetallePalabraProfesional(${caracterRaiz.id})">
                            <span style="font-size:28px;font-weight:700;color:var(--primary);">${caracterRaiz.palabra}</span>
                            ${caracterRaiz.pinyin ? `<span style="font-size:14px;color:var(--gray-light);">🔊 ${caracterRaiz.pinyin}</span>` : ''}
                            <span style="font-size:14px;color:var(--gray);">→ ${caracterRaiz.significado || caracterRaiz.palabra}</span>
                            <span style="font-size:10px;color:var(--gray-light);">🎯 ${caracterRaiz.nivel || nivelReal}</span>
                            <span style="font-size:10px;color:var(--primary);font-weight:600;margin-left:auto;">🔗 Haz clic para ver detalle</span>
                        </div>
                    </div>
                ` : ''}

                <!-- PALABRAS DERIVADAS -->
                ${palabrasDerivadas.length > 0 ? `
                    <div style="background:var(--secondary)05;border-radius:10px;padding:12px 16px;border-left:4px solid var(--secondary);">
                        <div style="font-size:12px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">📝 Palabras Derivadas (${palabrasDerivadas.length})</div>
                        <div style="display:flex;flex-wrap:wrap;gap:8px;">
                            ${palabrasDerivadas.slice(0, 10).map(p => `
                                <span style="display:inline-flex;flex-direction:column;align-items:center;padding:6px 12px;background:var(--white);border-radius:8px;border:1px solid var(--light);cursor:pointer;transition:all 0.2s;" 
                                      onclick="window.UIEspacio._verDetallePalabraProfesional(${p.id})"
                                      onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 2px 12px rgba(0,0,0,0.1)'" 
                                      onmouseout="this.style.transform='none';this.style.boxShadow='none'">
                                    <span style="font-size:16px;font-weight:600;color:var(--dark);">${p.palabra}</span>
                                    ${p.pinyin ? `<span style="font-size:10px;color:var(--gray-light);">${p.pinyin}</span>` : ''}
                                    <span style="font-size:10px;color:var(--gray);">${p.significado?.substring(0, 20) || ''}</span>
                                </span>
                            `).join('')}
                            ${palabrasDerivadas.length > 10 ? `<span style="font-size:11px;color:var(--gray-light);display:flex;align-items:center;">+${palabrasDerivadas.length - 10} más</span>` : ''}
                        </div>
                        ${palabrasDerivadas.length > 0 ? `
                            <button class="btn-secondary" onclick="window.UIEspacio._estudiarFamiliaCaracteres(${palabra.id})" 
                                    style="margin-top:6px;padding:4px 14px;font-size:11px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                <i class="fas fa-play"></i> Estudiar toda la familia (${palabrasDerivadas.length + 1} palabras)
                            </button>
                        ` : ''}
                    </div>
                ` : ''}

                <!-- 🔥 FRASES DONDE APARECE - CORREGIDO: usa UIEspacio en lugar de UIStudy -->
                ${frasesAsociadas.length > 0 ? `
                    <div style="background:var(--bg);border-radius:10px;padding:12px 16px;border:1px solid var(--light);">
                        <div style="font-size:12px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">📖 Frases donde aparece (${frasesAsociadas.length})</div>
                        <div style="display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;">
                            ${frasesAsociadas.slice(0, 10).map(f => {
                                const esJeroglificoFrase = f.esJeroglifico || esJeroglifico;
                                const hanzi = f.segmentacion?.hanzi || f.original;
                                const pinyinFrase = f.pinyinCompleto || f.segmentacion?.pinyin || '';
                                return `
                                    <div style="background:var(--white);border-radius:6px;padding:8px 12px;border:1px solid var(--light);cursor:pointer;" 
                                         onclick="window.UIEspacio._ejercicioTraduccion(${f.id})">
                                        <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;">
                                            <span style="font-size:${esJeroglificoFrase ? '18px' : '16px'};font-weight:600;color:var(--dark);">${esJeroglificoFrase ? hanzi : f.original}</span>
                                            ${pinyinFrase ? `<span style="font-size:11px;color:var(--gray-light);">${pinyinFrase}</span>` : ''}
                                            <span style="font-size:13px;color:var(--gray);margin-left:4px;">→ ${f.traduccion}</span>
                                        </div>
                                        ${f.reglaGramatical ? `<div style="font-size:10px;color:var(--primary);margin-top:2px;">📋 ${f.reglaGramatical}</div>` : ''}
                                    </div>
                                `;
                            }).join('')}
                            ${frasesAsociadas.length > 10 ? `<div style="font-size:11px;color:var(--gray-light);text-align:center;">+${frasesAsociadas.length - 10} frases más</div>` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- MISMA FAMILIA SEMÁNTICA -->
                ${palabrasMismaFamilia.length > 0 ? `
                    <div style="background:var(--bg);border-radius:10px;padding:12px 16px;border:1px solid var(--light);">
                        <div style="font-size:12px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">📂 Misma Familia Semántica (${palabrasMismaFamilia.length})</div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                            ${palabrasMismaFamilia.slice(0, 15).map(p => `
                                <span style="display:inline-flex;align-items:center;gap:4px;padding:4px 12px;background:var(--white);border-radius:12px;border:1px solid var(--light);cursor:pointer;font-size:13px;transition:all 0.2s;" 
                                      onclick="window.UIEspacio._verDetallePalabraProfesional(${p.id})"
                                      onmouseover="this.style.transform='scale(1.03)';this.style.borderColor='var(--primary)'" 
                                      onmouseout="this.style.transform='none';this.style.borderColor='var(--light)'">
                                    ${p.palabra || p.hanzi}
                                    ${p.pinyin ? `<span style="font-size:9px;color:var(--gray-light);">${p.pinyin}</span>` : ''}
                                </span>
                            `).join('')}
                            ${palabrasMismaFamilia.length > 15 ? `<span style="font-size:11px;color:var(--gray-light);display:flex;align-items:center;">+${palabrasMismaFamilia.length - 15} más</span>` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- 🔥 ACCIONES RÁPIDAS - TODAS USAN UIEspacio -->
                <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:8px;border-top:2px solid var(--light);">
                    ${frasesAsociadas.length > 0 ? `
                        <button class="btn-primary" onclick="window.UIEspacio._estudiarFrasesDesdeDetalle(${palabra.id}, '${textoPrincipal.replace(/'/g, "\\'")}')" 
                                style="padding:6px 16px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-play"></i> Estudiar Frases (${frasesAsociadas.length})
                        </button>
                    ` : ''}
                    <button class="btn-secondary" onclick="window.UIEspacio._ejercicioRellenar('${textoPrincipal.replace(/'/g, "\\'")}', '${idioma}')" 
                            style="padding:6px 16px;font-size:12px;background:var(--secondary);color:white;border:none;border-radius:6px;cursor:pointer;">
                        <i class="fas fa-pencil-alt"></i> Practicar Escritura
                    </button>
                    <button class="btn-secondary" onclick="window.UIEspacio._cerrarModalUnificado()" 
                            style="padding:6px 16px;font-size:12px;background:var(--light);color:var(--dark);border:none;border-radius:6px;cursor:pointer;">
                        <i class="fas fa-times"></i> Cerrar
                    </button>
                </div>

                <div style="font-size:10px;color:var(--gray-light);text-align:center;border-top:1px solid var(--light);padding-top:8px;">
                    🔍 Haz clic en cualquier palabra vinculada para explorar su detalle
                </div>
            </div>
        `;

        return html;
    }

    // ============================================================
    // 🔥 ESTUDIAR FRASES DESDE EL DETALLE (CON CIERRE AUTOMÁTICO)
    // ============================================================

    static async _estudiarFrasesDesdeDetalle(palabraId, textoPalabra, uiEspacio) {
        const core = uiEspacio._getCore();
        if (!core) {
            uiEspacio._mostrarToast('❌ Error: Core no disponible', 'error');
            return;
        }

        try {
            const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
            const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
            
            const textoLower = textoPalabra.toLowerCase();
            const frasesEncontradas = todasFrases.filter(f => {
                const original = (f.original || '').toLowerCase();
                return original.includes(textoLower);
            });

            if (frasesEncontradas.length === 0) {
                uiEspacio._mostrarToast('❌ No se encontraron frases con esta palabra', 'error');
                return;
            }

            const frasesConProgreso = [];
            for (const f of frasesEncontradas) {
                const prog = await db.obtenerProgreso(f.id);
                frasesConProgreso.push({
                    ...f,
                    rcn: prog?.rcn || 0
                });
            }
            frasesConProgreso.sort((a, b) => a.rcn - b.rcn);

            uiEspacio._mostrarToast(`📖 Estudiando ${frasesConProgreso.length} frases con "${textoPalabra}"`, 'success');

            uiEspacio._cerrarModalUnificado();

            pipeline.frases = frasesConProgreso;
            pipeline.indiceFrase = 0;
            await pipeline.cargarFrase(0);
            
            if (core && core.irAModulo) {
                core.irAModulo('study');
            }

        } catch (error) {
            console.error('❌ Error estudiando frases:', error);
            uiEspacio._mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // EJERCICIO TRADUCCIÓN
    // ============================================================

    static async ejercicioTraduccion(fraseId, uiEspacio) {
        const frase = await db.get('frases', fraseId);
        if (!frase) {
            uiEspacio._mostrarToast('❌ Frase no encontrada', 'error');
            return;
        }

        const idioma = frase.idioma || gestorIdiomas.getIdiomaActivo() || 'es';
        const esJeroglifico = uiEspacio._esJeroglifico(idioma);
        const idiomaNativo = uiEspacio._obtenerIdiomaNativo();
        const nombreIdioma = uiEspacio._getNombreIdioma(idioma);
        const pinyinFrase = frase.pinyinCompleto || frase.segmentacion?.pinyin || '';

        const esFraseEnObjetivo = idioma === gestorIdiomas.getIdiomaActivo() ||
            (frase.idioma && frase.idioma === gestorIdiomas.getIdiomaActivo());

        const modoInversoActivo = window.modoInverso?.isActivo() || false;

        let textoMostrar, textoTraduccion, mensajeDireccion;

        if (modoInversoActivo) {
            textoMostrar = frase.traduccion;
            textoTraduccion = frase.original;
            mensajeDireccion = `Traduce al ${nombreIdioma}:`;
        } else if (esFraseEnObjetivo) {
            textoMostrar = frase.original;
            textoTraduccion = frase.traduccion;
            mensajeDireccion = `Traduce al ${idiomaNativo}:`;
        } else {
            textoMostrar = frase.traduccion;
            textoTraduccion = frase.original;
            mensajeDireccion = `Traduce al ${nombreIdioma}:`;
        }

        let mensajePrompt = `🌍 **Traducción**\n\n`;
        if (esJeroglifico) {
            const hanzi = frase.segmentacion?.hanzi || textoMostrar;
            mensajePrompt += `📖 **${hanzi}**\n`;
            if (pinyinFrase) {
                mensajePrompt += `🔊 **Pinyin:** ${pinyinFrase}\n`;
            }
        } else {
            mensajePrompt += `📖 **${textoMostrar}**\n`;
        }
        mensajePrompt += `\n${mensajeDireccion}\n\n`;

        const resultado = await uiEspacio._prompt(mensajePrompt, '', 'Escribe la traducción...', '🌍 Traducción');
        if (resultado === null || resultado === undefined) return;

        const respuesta = resultado.trim();
        const correcta = textoTraduccion;
        const similitud = uiEspacio._calcularSimilitudLevenshtein(respuesta.toLowerCase(), correcta.toLowerCase());
        const esCorrecto = similitud >= 0.85;

        if (esCorrecto) {
            uiEspacio._mostrarToast('✅ ¡Traducción correcta!', 'success');
            await uiEspacio._reforzarElemento(fraseId, 'frase');
        } else if (similitud >= 0.6) {
            uiEspacio._mostrarToast(`🟡 Casi correcto. La traducción es: "${correcta}"`, 'warning');
            await uiEspacio._reforzarElemento(fraseId, 'frase', 0.3);
        } else {
            uiEspacio._mostrarToast(`❌ La traducción correcta es: "${correcta}"`, 'error');
            await uiEspacio._debilistarElemento(fraseId, 'frase');
        }
    }

    // ============================================================
    // EJERCICIO RELLENAR
    // ============================================================

    static async ejercicioRellenar(palabra, idioma, uiEspacio) {
        const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
        const palabraObj = todasPalabras.find(p =>
            (p.palabra || p.hanzi || '') === palabra && p.idioma === idioma
        );
        if (!palabraObj) {
            uiEspacio._mostrarToast('❌ Palabra no encontrada', 'error');
            return;
        }

        const esJeroglifico = uiEspacio._esJeroglifico(idioma);
        const pinyinPalabra = palabraObj.pinyin || '';

        const textoMostrar = palabraObj.palabra || palabraObj.hanzi || palabra;
        const textoNativo = palabraObj.significado || 'Sin definición';
        const respuestaCorrecta = palabraObj.palabra || palabraObj.hanzi || palabra;

        let mensajePrompt = `📝 **Ejercicio de rellenar**\n\n`;
        if (esJeroglifico) {
            mensajePrompt += `📖 **${textoMostrar}**\n`;
            if (pinyinPalabra) {
                mensajePrompt += `🔊 **Pinyin:** ${pinyinPalabra}\n`;
            }
        } else {
            mensajePrompt += `📖 **${textoMostrar}**\n`;
        }
        mensajePrompt += `📝 **Significado:** ${textoNativo}\n\n`;
        mensajePrompt += `🌍 Idioma: ${uiEspacio._getNombreIdioma(idioma)}\n`;
        mensajePrompt += `🎯 Nivel: ${palabraObj.nivel || uiEspacio._obtenerNivelRealUsuario()}\n\n`;
        mensajePrompt += esJeroglifico ? '✍️ Escribe el carácter o pinyin:' : '✍️ Escribe la palabra:';

        const resultado = await uiEspacio._prompt(mensajePrompt, '', `Escribe la ${esJeroglifico ? 'palabra o pinyin' : 'palabra'}...`, '📝 Rellenar palabra');
        if (resultado === null || resultado === undefined) return;

        const respuesta = resultado.trim().toLowerCase();
        const correcta = respuestaCorrecta.toLowerCase();
        let esCorrecto = respuesta === correcta;
        let mensaje = '';

        if (!esCorrecto && esJeroglifico && pinyinPalabra) {
            const pinyinLimpio = pinyinPalabra.toLowerCase().replace(/[0-9]/g, '').replace(/[āáǎà]/g, 'a').replace(/[ēéěè]/g, 'e').replace(/[īíǐì]/g, 'i').replace(/[ōóǒò]/g, 'o').replace(/[ūúǔù]/g, 'u').replace(/[ǖǘǚǜ]/g, 'ü').trim();
            const respLimpia = respuesta.replace(/[0-9]/g, '').replace(/[āáǎà]/g, 'a').replace(/[ēéěè]/g, 'e').replace(/[īíǐì]/g, 'i').replace(/[ōóǒò]/g, 'o').replace(/[ūúǔù]/g, 'u').replace(/[ǖǘǚǜ]/g, 'ü').trim();
            if (respLimpia === pinyinLimpio || respLimpia.includes(pinyinLimpio)) {
                esCorrecto = true;
                mensaje = '✅ ¡Correcto! (escrito en pinyin)';
            }
        }

        if (esCorrecto) {
            if (!mensaje) mensaje = '✅ ¡Correcto! ' + respuestaCorrecta;
            uiEspacio._mostrarToast(mensaje, 'success');
            await uiEspacio._reforzarElemento(palabraObj.id, 'palabra');
        } else {
            uiEspacio._mostrarToast(`❌ La respuesta correcta es: "${respuestaCorrecta}"${esJeroglifico && pinyinPalabra ? ` (pinyin: ${pinyinPalabra})` : ''}`, 'error');
            await uiEspacio._debilistarElemento(palabraObj.id, 'palabra');
        }
    }

    // ============================================================
    // EJERCICIO ORDENAR
    // ============================================================

    static async ejercicioOrdenar(fraseId, uiEspacio) {
        const frase = await db.get('frases', fraseId);
        if (!frase) {
            uiEspacio._mostrarToast('❌ Frase no encontrada', 'error');
            return;
        }

        const palabras = frase.palabras || [];
        if (palabras.length < 2) {
            uiEspacio._mostrarToast('❌ Esta frase tiene muy pocas palabras para ordenar', 'warning');
            return;
        }

        const palabrasDesordenadas = [...palabras].sort(() => Math.random() - 0.5);
        const textoOrdenado = palabras.map(p => p.hanzi || p.palabra || '').join(' ');
        const idioma = frase.idioma || gestorIdiomas.getIdiomaActivo() || 'es';
        const esJeroglifico = uiEspacio._esJeroglifico(idioma);

        let html = `
            <div style="margin-bottom:12px;font-size:14px;color:var(--gray);">🧩 Ordena las palabras para formar la frase correcta.</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;padding:16px;background:var(--bg);border-radius:12px;min-height:70px;border:2px dashed var(--light);margin-bottom:16px;justify-content:center;" id="areaOrdenar">
                ${palabrasDesordenadas.map((p, i) => `
                    <span class="palabra-ordenable" data-index="${i}" style="display:inline-flex;flex-direction:column;align-items:center;padding:8px 16px;background:var(--primary);color:white;border-radius:8px;font-size:${esJeroglifico ? '22px' : '16px'};font-weight:500;cursor:pointer;transition:all 0.2s;user-select:none;box-shadow:0 2px 8px rgba(0,0,0,0.1);" 
                        onclick="window.UIEspacio._moverPalabraOrdenar(this)" 
                        onmouseover="this.style.transform='scale(1.05)'" 
                        onmouseout="this.style.transform='none'">
                        ${p.hanzi || p.palabra || ''}
                        ${p.pinyin ? `<span style="font-size:10px;color:rgba(255,255,255,0.6);">${p.pinyin}</span>` : ''}
                    </span>
                `).join('')}
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
                <button class="btn-primary" onclick="window.UIEspacio._validarOrdenFrase('${textoOrdenado.replace(/'/g, "\\'")}')" style="padding:8px 20px;font-size:13px;"><i class="fas fa-check"></i> Validar orden</button>
                <button class="btn-secondary" onclick="window.UIEspacio._desordenarFrase()" style="padding:8px 20px;font-size:13px;"><i class="fas fa-random"></i> Desordenar de nuevo</button>
                <button class="btn-secondary" onclick="window.UIEspacio._mostrarOrdenCorrecto('${textoOrdenado.replace(/'/g, "\\'")}')" style="padding:8px 20px;font-size:13px;"><i class="fas fa-lightbulb"></i> Mostrar solución</button>
            </div>
            <div id="resultadoOrdenar" style="margin-top:8px;padding:10px;border-radius:8px;display:none;"></div>
        `;

        uiEspacio._ordenarEstado = { correcto: textoOrdenado, intentos: 0, fraseId: fraseId };
        uiEspacio._mostrarDialogPersonalizado({
            icon: '🧩',
            title: `Ordenar: "${frase.original}"`,
            message: html,
            buttons: [{ text: 'Cerrar', value: null, secondary: true }]
        });
    }

    static moverPalabraOrdenar(elemento) {
        const area = document.getElementById('areaOrdenar');
        if (!area) return;
        area.appendChild(elemento);
    }

    static validarOrdenFrase(textoCorrecto) {
        const area = document.getElementById('areaOrdenar');
        if (!area) return;
        const ordenActual = Array.from(area.querySelectorAll('.palabra-ordenable')).map(el => el.textContent.trim()).join(' ');
        const esCorrecto = ordenActual === textoCorrecto;
        const resultadoDiv = document.getElementById('resultadoOrdenar');
        if (resultadoDiv) {
            resultadoDiv.style.display = 'block';
            if (esCorrecto) {
                resultadoDiv.style.background = 'var(--success)10';
                resultadoDiv.style.border = '1px solid var(--success)';
                resultadoDiv.innerHTML = `<div style="font-weight:600;color:var(--success);">✅ ¡Orden correcto! Has formado la frase correctamente.</div>`;
                uiEspacio._mostrarToast('✅ ¡Orden correcto!', 'success');
                const fraseId = uiEspacio._ordenarEstado?.fraseId;
                if (fraseId) uiEspacio._reforzarElemento(fraseId, 'frase');
            } else {
                uiEspacio._ordenarEstado.intentos++;
                const intentos = uiEspacio._ordenarEstado.intentos;
                resultadoDiv.style.background = 'var(--warning)10';
                resultadoDiv.style.border = '1px solid var(--warning)';
                resultadoDiv.innerHTML = `<div style="font-weight:600;color:var(--warning);">❌ No es el orden correcto. Intenta de nuevo. (Intento ${intentos})</div><div style="font-size:12px;color:var(--gray);margin-top:4px;">💡 Pista: la frase comienza con "${textoCorrecto.split(' ')[0]}"</div>`;
                uiEspacio._mostrarToast('❌ Orden incorrecto, intenta de nuevo', 'error');
            }
        }
    }

    static desordenarFrase() {
        const area = document.getElementById('areaOrdenar');
        if (!area) return;
        const elementos = Array.from(area.querySelectorAll('.palabra-ordenable'));
        const desordenados = elementos.sort(() => Math.random() - 0.5);
        area.innerHTML = '';
        desordenados.forEach(el => area.appendChild(el));
        const resultadoDiv = document.getElementById('resultadoOrdenar');
        if (resultadoDiv) resultadoDiv.style.display = 'none';
    }

    static mostrarOrdenCorrecto(textoCorrecto) {
        const area = document.getElementById('areaOrdenar');
        if (!area) return;
        const resultadoDiv = document.getElementById('resultadoOrdenar');
        if (resultadoDiv) {
            resultadoDiv.style.display = 'block';
            resultadoDiv.style.background = 'var(--primary)10';
            resultadoDiv.style.border = '1px solid var(--primary)';
            resultadoDiv.innerHTML = `<div style="font-weight:600;color:var(--primary);">💡 La frase correcta es: "${textoCorrecto}"</div><div style="font-size:12px;color:var(--gray);margin-top:4px;">📚 Ahora intenta reconstruirla tú mismo.</div>`;
        }
    }

    // ============================================================
    // REFUERZO Y DEBILITAMIENTO
    // ============================================================

    static async _reforzarElemento(id, tipo, cantidad = 1) {
        try {
            let progreso = await db.obtenerProgreso(id);
            if (progreso) {
                progreso.rcn = Math.min(5, (progreso.rcn || 0) + cantidad * 0.3);
                progreso.repasosExitosos = (progreso.repasosExitosos || 0) + 1;
                progreso.ultimoRepaso = Date.now();
                await db.guardarProgreso(progreso);
            }
        } catch (e) {
            console.warn('⚠️ Error reforzando elemento:', e);
        }
    }

    static async _debilistarElemento(id, tipo) {
        try {
            let progreso = await db.obtenerProgreso(id);
            if (progreso) {
                progreso.rcn = Math.max(0, (progreso.rcn || 0) - 0.2);
                progreso.repasosFallidos = (progreso.repasosFallidos || 0) + 1;
                progreso.ultimoRepaso = Date.now();
                await db.guardarProgreso(progreso);
            }
        } catch (e) {
            console.warn('⚠️ Error debilitando elemento:', e);
        }
    }

    // ============================================================
    // MODAL UNIFICADO
    // ============================================================

    static abrirModalUnificado(uiEspacio) {
        if (uiEspacio._generadorAbierto) {
            uiEspacio._cerrarModalUnificado();
            return;
        }
        uiEspacio._generadorAbierto = true;
        uiEspacio._modoGenerador = 'frases';
        uiEspacio._renderizarModalUnificado();
    }

    static cerrarModalUnificado(uiEspacio) {
        const overlay = document.getElementById('modalUnificadoOverlay');
        if (overlay) overlay.remove();
        uiEspacio._generadorAbierto = false;
        if (uiEspacio._generadorEscapeHandler) {
            document.removeEventListener('keydown', uiEspacio._generadorEscapeHandler);
            uiEspacio._generadorEscapeHandler = null;
        }
    }

    static cambiarModoGeneradorUnificado(modo) {
        const uiEspacio = window.UIEspacio;
        uiEspacio._modoGenerador = modo;
        const esFrases = modo === 'frases';

        const tabFrases = document.getElementById('tabFrases');
        const tabPalabras = document.getElementById('tabPalabras');
        if (tabFrases) {
            tabFrases.className = esFrases ? 'btn-primary' : 'btn-secondary';
            tabFrases.style.background = esFrases ? 'var(--primary)' : 'var(--white)';
            tabFrases.style.color = esFrases ? 'white' : 'var(--dark)';
        }
        if (tabPalabras) {
            tabPalabras.className = !esFrases ? 'btn-primary' : 'btn-secondary';
            tabPalabras.style.background = !esFrases ? 'var(--primary)' : 'var(--white)';
            tabPalabras.style.color = !esFrases ? 'white' : 'var(--dark)';
        }

        const input = document.getElementById('modalUnificadoInput');
        if (input) {
            input.placeholder = esFrases
                ? 'Escribe una frase por línea (ej: El árbol es verde)\nMe gusta la naturaleza'
                : 'Escribe una palabra por línea (ej: árbol)\nnaturaleza\nverde';
        }

        const label = document.querySelector('label[for="modalUnificadoInput"]');
        if (label) {
            label.innerHTML = `${esFrases ? '📝 Frases' : '📝 Palabras'} (una por línea) <span style="font-size:11px;font-weight:400;color:var(--gray-light);">(máx. ${esFrases ? 20 : 30})</span>`;
        }

        uiEspacio._actualizarContadorUnificado();
        const jsonArea = document.getElementById('modalUnificadoJSON');
        if (jsonArea) jsonArea.value = '';
        const resultado = document.getElementById('modalUnificadoResultado');
        if (resultado) resultado.style.display = 'none';
    }

    static actualizarContadorUnificado() {
        const input = document.getElementById('modalUnificadoInput');
        if (!input) return;
        const elementos = input.value.split('\n').filter(line => line.trim().length > 0);
        const contador = document.getElementById('contadorUnificado');
        if (contador) contador.textContent = `${elementos.length} elementos`;
    }

    // ============================================================
    // GENERAR JSON UNIFICADO
    // ============================================================

    static async generarJSONUnificado(uiEspacio) {
        const input = document.getElementById('modalUnificadoInput');
        const jsonArea = document.getElementById('modalUnificadoJSON');
        const resultadoDiv = document.getElementById('modalUnificadoResultado');

        if (!input) return;

        const texto = input.value.trim();
        if (!texto) {
            uiEspacio._mostrarToast('❌ Escribe al menos una frase o palabra', 'error');
            return;
        }

        const elementos = texto.split('\n').filter(line => line.trim().length > 0);
        if (elementos.length === 0) {
            uiEspacio._mostrarToast('❌ Escribe al menos una frase o palabra', 'error');
            return;
        }

        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        const nivelReal = uiEspacio._obtenerNivelRealUsuario();
        const esJeroglifico = uiEspacio._esJeroglifico(idiomaActivo);
        const idiomaNativo = uiEspacio._obtenerIdiomaNativo() || 'español';
        const esFrases = uiEspacio._modoGenerador === 'frases';
        const nombreIdioma = uiEspacio._getNombreIdioma(idiomaActivo);

        const direccionSelect = document.getElementById('modalUnificadoDireccion');
        const direccion = direccionSelect ? direccionSelect.value : `${idiomaNativo}->${nombreIdioma}`;
        const [from, to] = direccion.split('->');
        const incluirPinyin = document.getElementById('modalIncluirPinyin')?.checked ?? true;

        if (resultadoDiv) {
            resultadoDiv.style.display = 'block';
            resultadoDiv.style.background = 'var(--bg)';
            resultadoDiv.style.border = '1px solid var(--light)';
            resultadoDiv.style.color = 'var(--gray)';
            resultadoDiv.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;">
                    <i class="fas fa-spinner fa-spin" style="font-size:24px;color:var(--primary);"></i>
                    <div>
                        <div style="font-weight:600;">Generando plantilla JSON...</div>
                        <div style="font-size:12px;color:var(--gray-light);">${elementos.length} elementos · ${direccion}</div>
                    </div>
                </div>
            `;
        }

        uiEspacio._mostrarToast(`🧠 Generando plantilla para ${elementos.length} elementos...`, 'info');

        try {
            const familiasSemanticasList = uiEspacio.FAMILIAS_SEMANTICAS.join(', ');
            const familiasGramaticalesList = uiEspacio.FAMILIAS_GRAMATICALES.join(', ');

            const plantilla = {
                "_INSTRUCCIONES_PARA_IA": {
                    "version": "14.0",
                    "accion": `Traduce y CLASIFICA SEMÁNTICAMENTE este JSON. El usuario ha escrito en ${from} y necesita la traducción a ${to}.`,
                    "idioma_origen": from,
                    "idioma_destino": to,
                    "idioma_objetivo": to,
                    "idioma_nativo": from,
                    "nivel": nivelReal,
                    "tipo": esFrases ? 'frases' : 'palabras',
                    "es_jeroglifico": esJeroglifico,
                    "incluir_pinyin": esJeroglifico && incluirPinyin,
                    "num_elementos": elementos.length,
                    "instrucciones": [
                        `1. Traduce cada ${esFrases ? 'frase' : 'palabra'} de "${from}" a "${to}".`,
                        `2. Para cada elemento, proporciona "original" (en ${to}) y "traduccion" (en ${from}).`,
                        `3. ${esJeroglifico ? 'Incluye "pinyin" con tonos para cada elemento.' : 'Incluye "transcripcion_fonetica" si está disponible.'}`,
                        `4. ⚠️ IMPORTANTE: Para CADA elemento, asigna UNA familia semántica de esta lista: ${familiasSemanticasList}`,
                        `5. ⚠️ IMPORTANTE: Para CADA elemento, asigna UNA familia gramatical de esta lista: ${familiasGramaticalesList}`,
                        `6. Para cada elemento, proporciona "palabras" con "familia", "tipo" y "significado".`,
                        `7. Las frases deben tener "familia_semantica" y "familia_gramatical" principales.`,
                        `8. Las palabras deben tener "familia_semantica" y "familia_gramatical".`
                    ],
                    "familias_semanticas_disponibles": uiEspacio.FAMILIAS_SEMANTICAS,
                    "familias_gramaticales_disponibles": uiEspacio.FAMILIAS_GRAMATICALES
                },
                "meta": {
                    "idioma_origen": from,
                    "idioma_destino": to,
                    "idioma_objetivo": to,
                    "idioma_nativo": from,
                    "nivel": nivelReal,
                    "tipo": esFrases ? 'frases' : 'palabras',
                    "es_jeroglifico": esJeroglifico,
                    "incluir_pinyin": esJeroglifico && incluirPinyin,
                    "num_elementos": elementos.length,
                    "fecha_generacion": new Date().toISOString(),
                    "version": "14.0"
                },
                "elementos": []
            };

            for (let i = 0; i < elementos.length; i++) {
                const texto = elementos[i].trim();
                const tipoElemento = esFrases ? 'frase' : 'palabra';

                const elemento = {
                    "id": i + 1,
                    "tipo": tipoElemento,
                    "original": `[Traducción al ${to} de "${texto}"]`,
                    "traduccion": texto,
                    "familia_semantica": `[Asignar de: ${familiasSemanticasList}]`,
                    "familia_gramatical": `[Asignar de: ${familiasGramaticalesList}]`,
                    "palabras": [
                        {
                            "palabra": "[palabra_clave_en_" + to + "]",
                            "familia_semantica": `[Asignar de: ${familiasSemanticasList}]`,
                            "familia_gramatical": "sustantivo",
                            "significado": "[significado_en_" + from + "]"
                        }
                    ]
                };

                if (esJeroglifico && incluirPinyin) {
                    elemento.pinyin = "[pinyin_con_tonos]";
                    elemento.segmentacion = {
                        "hanzi": "[texto_en_hanzi]",
                        "pinyin": "[pinyin_segmentado]"
                    };
                    elemento.palabras[0].pinyin = "[pinyin_de_la_palabra]";
                }

                if (tipoElemento === 'frase') {
                    elemento.familia_semantica = `[Asignar de: ${familiasSemanticasList}]`;
                    elemento.familia_gramatical = `[Asignar de: ${familiasGramaticalesList}]`;
                }

                plantilla.elementos.push(elemento);
            }

            const jsonOutput = JSON.stringify(plantilla, null, 2);

            if (jsonArea) {
                jsonArea.value = jsonOutput;
                jsonArea.style.borderColor = 'var(--success)';
                jsonArea.style.background = 'rgba(0,184,148,0.05)';
            }

            if (resultadoDiv) {
                resultadoDiv.style.display = 'block';
                resultadoDiv.style.background = 'rgba(0,184,148,0.1)';
                resultadoDiv.style.border = '1px solid var(--success)';
                resultadoDiv.style.color = 'var(--success)';
                resultadoDiv.innerHTML = `
                    <div style="display:flex;align-items:start;gap:12px;">
                        <span style="font-size:28px;">✅</span>
                        <div>
                            <div style="font-weight:700;font-size:16px;">Plantilla generada correctamente</div>
                            <div style="font-size:13px;color:var(--gray);margin-top:4px;">
                                📝 ${elementos.length} elementos · ${direccion}
                            </div>
                            <div style="font-size:12px;color:var(--gray-light);margin-top:2px;">
                                💡 La IA asignará automáticamente las familias semánticas y gramaticales
                            </div>
                            <button onclick="window.UIEspacio._copiarJSONUnificado()" style="
                                margin-top:8px;padding:4px 14px;background:var(--primary);
                                color:white;border:none;border-radius:6px;cursor:pointer;
                                font-size:12px;font-family:var(--font);
                            " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                                <i class="fas fa-copy"></i> Copiar JSON
                            </button>
                        </div>
                    </div>
                `;
            }

            uiEspacio._mostrarToast(`✅ Plantilla generada para ${elementos.length} elementos con clasificación`, 'success');

        } catch (error) {
            console.error('❌ Error generando JSON:', error);
            if (resultadoDiv) {
                resultadoDiv.style.display = 'block';
                resultadoDiv.style.background = 'rgba(255,118,117,0.1)';
                resultadoDiv.style.border = '1px solid var(--danger)';
                resultadoDiv.style.color = 'var(--danger)';
                resultadoDiv.innerHTML = `
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:28px;">❌</span>
                        <div>
                            <div style="font-weight:700;">Error generando plantilla</div>
                            <div style="font-size:13px;color:var(--gray);">${error.message || 'Error desconocido'}</div>
                        </div>
                    </div>
                `;
            }
            uiEspacio._mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    static copiarJSONUnificado() {
        const jsonArea = document.getElementById('modalUnificadoJSON');
        if (!jsonArea) return;

        navigator.clipboard.writeText(jsonArea.value)
            .then(() => uiEspacio._mostrarToast('📋 JSON copiado al portapapeles', 'success'))
            .catch(() => {
                jsonArea.select();
                document.execCommand('copy');
                uiEspacio._mostrarToast('📋 JSON copiado al portapapeles', 'success');
            });
    }

    // ============================================================
    // VALIDAR E IMPORTAR JSON UNIFICADO
    // ============================================================

    static async validarEImportarJSONUnificado(uiEspacio) {
        const jsonArea = document.getElementById('modalUnificadoJSON');
        const resultadoDiv = document.getElementById('modalUnificadoResultado');

        if (!jsonArea) return;

        const jsonText = jsonArea.value.trim();
        if (!jsonText) {
            uiEspacio._mostrarToast('❌ No hay JSON para importar. Genera uno o pega un JSON completado.', 'error');
            return;
        }

        try {
            const data = JSON.parse(jsonText);

            if (!data.meta || !data.elementos || !Array.isArray(data.elementos) || data.elementos.length === 0) {
                uiEspacio._mostrarToast('❌ JSON inválido: debe tener "meta" y "elementos"', 'error');
                if (resultadoDiv) {
                    resultadoDiv.style.display = 'block';
                    resultadoDiv.style.background = 'rgba(255,118,117,0.1)';
                    resultadoDiv.style.border = '1px solid var(--danger)';
                    resultadoDiv.style.color = 'var(--danger)';
                    resultadoDiv.innerHTML = `
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span style="font-size:28px;">❌</span>
                            <div>
                                <div style="font-weight:700;">JSON inválido</div>
                                <div style="font-size:13px;color:var(--gray);">Debe tener "meta" y "elementos" (array)</div>
                            </div>
                        </div>
                    `;
                }
                return;
            }

            let errores = [];
            let advertencias = [];

            for (let i = 0; i < data.elementos.length; i++) {
                const el = data.elementos[i];
                if (!el.original) errores.push(`Elemento ${i+1}: falta "original"`);
                if (!el.traduccion) errores.push(`Elemento ${i+1}: falta "traduccion"`);
                if (el.original && el.original.startsWith('[Traducción al')) {
                    advertencias.push(`Elemento ${i+1}: "original" parece ser un placeholder (sin traducir)`);
                }
                if (el.familia_semantica && el.familia_semantica.startsWith('[Asignar de:')) {
                    advertencias.push(`Elemento ${i+1}: "familia_semantica" sin asignar (placeholder)`);
                }
                if (el.familia_gramatical && el.familia_gramatical.startsWith('[Asignar de:')) {
                    advertencias.push(`Elemento ${i+1}: "familia_gramatical" sin asignar (placeholder)`);
                }
            }

            if (errores.length > 0) {
                uiEspacio._mostrarToast(`❌ ${errores.length} errores en el JSON`, 'error');
                if (resultadoDiv) {
                    resultadoDiv.style.display = 'block';
                    resultadoDiv.style.background = 'rgba(255,118,117,0.1)';
                    resultadoDiv.style.border = '1px solid var(--danger)';
                    resultadoDiv.style.color = 'var(--danger)';
                    resultadoDiv.innerHTML = `
                        <div style="display:flex;align-items:start;gap:12px;">
                            <span style="font-size:28px;">❌</span>
                            <div>
                                <div style="font-weight:700;">Errores en el JSON</div>
                                <div style="font-size:13px;color:var(--gray);margin-top:4px;">
                                    ${errores.map(e => `• ${e}`).join('<br>')}
                                </div>
                            </div>
                        </div>
                    `;
                }
                return;
            }

            if (advertencias.length > 0) {
                const confirmar = await uiEspacio._confirmar(
                    `⚠️ El JSON tiene algunas advertencias:\n\n${advertencias.map(e => `• ${e}`).join('\n')}\n\n¿Quieres importarlo de todas formas?`,
                    '⚠️ Advertencias en el JSON'
                );
                if (!confirmar) return;
            }

            if (resultadoDiv) {
                resultadoDiv.style.display = 'block';
                resultadoDiv.style.background = 'var(--bg)';
                resultadoDiv.style.border = '1px solid var(--light)';
                resultadoDiv.style.color = 'var(--gray)';
                resultadoDiv.innerHTML = `
                    <div style="display:flex;align-items:center;gap:12px;">
                        <i class="fas fa-spinner fa-spin" style="font-size:24px;color:var(--primary);"></i>
                        <div>
                            <div style="font-weight:600;">Importando elementos...</div>
                            <div style="font-size:12px;color:var(--gray-light);">${data.elementos.length} elementos</div>
                        </div>
                    </div>
                `;
            }

            uiEspacio._mostrarToast(`🧠 Importando ${data.elementos.length} elementos con clasificación...`, 'info');

            const resultado = await uiEspacio._importarElementosConClasificacion(data);

            if (resultadoDiv) {
                const importados = resultado.totalImportados || 0;
                const duplicados = resultado.totalDuplicados || 0;
                const erroresImport = resultado.totalErrores || 0;

                let bgColor = 'rgba(0,184,148,0.1)';
                let borderColor = 'var(--success)';
                let icono = '✅';
                let mensaje = `¡${importados} elementos importados!`;

                if (importados === 0 && duplicados > 0) {
                    bgColor = 'rgba(253,203,110,0.1)';
                    borderColor = 'var(--warning)';
                    icono = '⚠️';
                    mensaje = `${duplicados} elementos ya existían (omitidos)`;
                } else if (importados === 0 && erroresImport > 0) {
                    bgColor = 'rgba(255,118,117,0.1)';
                    borderColor = 'var(--danger)';
                    icono = '❌';
                    mensaje = `Error al importar ${erroresImport} elementos`;
                }

                let detallesClasificacion = '';
                if (importados > 0 && resultado.familiasAsignadas) {
                    const familiasList = Object.keys(resultado.familiasAsignadas).slice(0, 5);
                    detallesClasificacion = `
                        <div style="font-size:12px;color:var(--gray-light);margin-top:4px;">
                            📂 Familias asignadas: ${familiasList.join(', ')}${Object.keys(resultado.familiasAsignadas).length > 5 ? ` ... +${Object.keys(resultado.familiasAsignadas).length - 5} más` : ''}
                        </div>
                    `;
                }

                resultadoDiv.style.display = 'block';
                resultadoDiv.style.background = bgColor;
                resultadoDiv.style.border = `1px solid ${borderColor}`;
                resultadoDiv.style.color = 'var(--dark)';
                resultadoDiv.innerHTML = `
                    <div style="display:flex;align-items:start;gap:12px;">
                        <span style="font-size:28px;">${icono}</span>
                        <div style="flex:1;">
                            <div style="font-weight:700;font-size:16px;">${mensaje}</div>
                            <div style="font-size:13px;color:var(--gray);margin-top:4px;">
                                ${importados > 0 ? `📝 ${importados} nuevos · ` : ''}
                                ${duplicados > 0 ? `⏭️ ${duplicados} duplicados omitidos` : ''}
                                ${erroresImport > 0 ? ` · ❌ ${erroresImport} errores` : ''}
                            </div>
                            ${detallesClasificacion}
                            <div style="font-size:12px;color:var(--gray-light);margin-top:2px;">
                                📂 Organizado por: Nivel ${data.meta.nivel || uiEspacio._obtenerNivelRealUsuario()} → Familia Semántica
                            </div>
                            ${importados > 0 ? `
                                <button onclick="window.UIEspacio._cerrarModalUnificado();window.UIEspacio._renderizarMiEspacio()" style="
                                    margin-top:8px;padding:6px 16px;background:var(--primary);
                                    color:white;border:none;border-radius:6px;cursor:pointer;
                                    font-size:12px;font-family:var(--font);
                                " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                                    Ver en Mi Espacio
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }

            uiEspacio._mostrarToast(`✅ Importación completada: ${resultado.totalImportados || 0} elementos`, 'success');

            if (resultado.totalImportados > 0) {
                setTimeout(() => {
                    uiEspacio._renderizarMiEspacio();
                    if (window.uiCore) {
                        window.uiCore._actualizarEspacioStats();
                    }
                }, 500);
            }

        } catch (error) {
            console.error('❌ Error importando JSON:', error);
            if (resultadoDiv) {
                resultadoDiv.style.display = 'block';
                resultadoDiv.style.background = 'rgba(255,118,117,0.1)';
                resultadoDiv.style.border = '1px solid var(--danger)';
                resultadoDiv.style.color = 'var(--danger)';
                resultadoDiv.innerHTML = `
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:28px;">❌</span>
                        <div>
                            <div style="font-weight:700;">Error al importar</div>
                            <div style="font-size:13px;color:var(--gray);">${error.message || 'Error desconocido'}</div>
                            <div style="font-size:12px;color:var(--gray-light);margin-top:4px;">💡 Verifica que el JSON sea válido y tenga todos los campos requeridos</div>
                        </div>
                    </div>
                `;
            }
            uiEspacio._mostrarToast('❌ Error importando: ' + error.message, 'error');
        }
    }

    // ============================================================
    // IMPORTAR ELEMENTOS CON CLASIFICACIÓN
    // ============================================================

    static async importarElementosConClasificacion(data, uiEspacio) {
        if (!data || !data.meta || !data.elementos) {
            return { totalImportados: 0, totalDuplicados: 0, totalErrores: 0, familiasAsignadas: {} };
        }

        const idioma = data.meta.idioma_objetivo || data.meta.idioma_destino || data.meta.idioma || gestorIdiomas.getIdiomaActivo() || 'es';
        const nivel = data.meta.nivel || uiEspacio._obtenerNivelRealUsuario();
        const esJeroglifico = data.meta.es_jeroglifico || uiEspacio._esJeroglifico(idioma);
        const nombreNivel = `📚 Nivel ${nivel}`;
        const familiasAsignadas = {};

        let importados = 0;
        let duplicados = 0;
        let errores = 0;

        for (const el of data.elementos) {
            try {
                let familiaSemantica = el.familia_semantica || '📌 Seleccionadas por Usuario';
                let familiaGramatical = el.familia_gramatical || 'sustantivo';

                if (familiaSemantica.startsWith('[Asignar de:') || familiaSemantica.startsWith('[Asignar')) {
                    familiaSemantica = '📌 Seleccionadas por Usuario';
                }
                if (familiaGramatical.startsWith('[Asignar de:') || familiaGramatical.startsWith('[Asignar')) {
                    familiaGramatical = 'sustantivo';
                }

                const familiaNormalizada = uiEspacio._normalizarFamiliaSemantica(familiaSemantica);

                if (!familiasAsignadas[familiaNormalizada]) {
                    familiasAsignadas[familiaNormalizada] = 0;
                }
                familiasAsignadas[familiaNormalizada]++;

                const tipo = el.tipo || (data.meta.tipo === 'frases' ? 'frase' : 'palabra');

                if (tipo === 'frase') {
                    const frasesExistentes = await db.obtenerFrasesPorIdioma(idioma);
                    const existe = frasesExistentes.some(f =>
                        f.original === el.original && f.traduccion === el.traduccion
                    );

                    if (existe) {
                        duplicados++;
                        continue;
                    }

                    const pinyinFrase = el.pinyin || el.pinyinCompleto || el.fonetica || '';

                    const fraseObj = {
                        original: el.original,
                        traduccion: el.traduccion,
                        idioma: idioma,
                        nivel: el.nivel || nivel,
                        esJeroglifico: esJeroglifico,
                        familiaSemantica: familiaNormalizada,
                        familiaGramatical: familiaGramatical,
                        pinyinCompleto: esJeroglifico ? pinyinFrase : '',
                        segmentacion: esJeroglifico && el.segmentacion ? {
                            hanzi: el.segmentacion.hanzi || el.original,
                            pinyin: el.segmentacion.pinyin || pinyinFrase
                        } : null,
                        activa: true,
                        rg: 0,
                        rcn: 0,
                        neuroData: {
                            exposiciones: 0,
                            aciertosConsecutivos: 0,
                            fallosConsecutivos: 0,
                            nivelConfianza: 0.5,
                            ultimaActivacion: Date.now(),
                            consolidacion: 0
                        }
                    };

                    const palabrasFrase = [];
                    if (el.palabras && Array.isArray(el.palabras)) {
                        for (const p of el.palabras) {
                            const texto = p.palabra || p.hanzi || '';
                            if (!texto) continue;

                            const pinyinPalabra = p.pinyin || p.fonetica || '';

                            const pFamiliaSemantica = p.familia_semantica || familiaNormalizada;
                            const pFamiliaGramatical = p.familia_gramatical || p.familia || 'sustantivo';

                            const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                            let palabraExistente = palabrasExistentes.find(w =>
                                (w.palabra || w.hanzi || '').toLowerCase() === texto.toLowerCase()
                            );

                            let palabraId;
                            if (palabraExistente) {
                                palabraId = palabraExistente.id;
                                if (esJeroglifico && pinyinPalabra && !palabraExistente.pinyin) {
                                    palabraExistente.pinyin = pinyinPalabra;
                                }
                                await db.guardarPalabra({
                                    ...palabraExistente,
                                    frecuencia: (palabraExistente.frecuencia || 0) + 1,
                                    pinyin: palabraExistente.pinyin || pinyinPalabra
                                });
                            } else {
                                const palabraObj = {
                                    palabra: texto,
                                    hanzi: esJeroglifico ? texto : '',
                                    pinyin: esJeroglifico ? pinyinPalabra : '',
                                    significado: p.significado || `[${texto}]`,
                                    familia: pFamiliaGramatical,
                                    familias: [pFamiliaGramatical],
                                    familiaSemantica: pFamiliaSemantica,
                                    nivel: el.nivel || nivel,
                                    tipo: pFamiliaGramatical,
                                    idioma: idioma,
                                    frecuencia: 1,
                                    neuroScore: 0.5,
                                    nivelDominio: 'nuevo',
                                    fechaCreacion: Date.now()
                                };
                                palabraId = await db.guardarPalabra(palabraObj);
                            }

                            palabrasFrase.push({
                                palabra: texto,
                                hanzi: esJeroglifico ? texto : '',
                                pinyin: esJeroglifico ? pinyinPalabra : '',
                                significado: p.significado || `[${texto}]`,
                                familia: pFamiliaGramatical,
                                id: palabraId
                            });
                        }
                    }
                    fraseObj.palabras = palabrasFrase;

                    const fraseId = await db.guardarFrase(fraseObj);
                    if (fraseId) {
                        await gestorFavoritos.añadirFrase(fraseId);
                        if (gestorFavoritos.añadirFraseAGrupo) {
                            await gestorFavoritos.añadirFraseAGrupo(fraseId, nombreNivel);
                            await gestorFavoritos.añadirFraseAGrupo(fraseId, `📂 ${familiaNormalizada}`);
                        }
                        importados++;
                    } else {
                        errores++;
                    }
                } else if (tipo === 'palabra') {
                    const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                    const existe = palabrasExistentes.some(p =>
                        (p.palabra || p.hanzi || '').toLowerCase() === (el.original || '').toLowerCase()
                    );

                    if (existe) {
                        duplicados++;
                        continue;
                    }

                    const pinyinPalabra = el.pinyin || el.fonetica || '';

                    const palabraObj = {
                        palabra: el.original,
                        hanzi: esJeroglifico ? el.original : '',
                        pinyin: esJeroglifico ? pinyinPalabra : '',
                        significado: el.traduccion || el.original,
                        familia: familiaGramatical,
                        familias: [familiaGramatical],
                        familiaSemantica: familiaNormalizada,
                        nivel: el.nivel || nivel,
                        tipo: familiaGramatical,
                        idioma: idioma,
                        frecuencia: 1,
                        neuroScore: 0.5,
                        nivelDominio: 'nuevo',
                        fechaCreacion: Date.now()
                    };

                    const palabraId = await db.guardarPalabra(palabraObj);
                    if (palabraId) {
                        await gestorFavoritos.añadirPalabra(palabraId);
                        if (gestorFavoritos.añadirPalabraAGrupo) {
                            await gestorFavoritos.añadirPalabraAGrupo(palabraId, nombreNivel);
                            await gestorFavoritos.añadirPalabraAGrupo(palabraId, `📂 ${familiaNormalizada}`);
                        }
                        importados++;
                    } else {
                        errores++;
                    }
                }
            } catch (e) {
                console.warn('⚠️ Error importando elemento:', e);
                errores++;
            }
        }

        if (importados > 0) {
            if (window.pipeline) {
                await pipeline.cargarFrases();
                await pipeline.cargarProgreso();
            }
            if (window.gramatica) {
                await gramatica.cargarPalabras();
                if (typeof gramatica.agrupar === 'function') {
                    await gramatica.agrupar();
                }
            }
            if (window.uiCore) {
                window.uiCore._actualizarEspacioStats();
            }
        }

        return {
            totalImportados: importados,
            totalDuplicados: duplicados,
            totalErrores: errores,
            familiasAsignadas: familiasAsignadas
        };
    }

    // ============================================================
    // NORMALIZAR FAMILIA SEMÁNTICA
    // ============================================================

    static normalizarFamiliaSemantica(familia) {
        if (!familia) return '📌 Seleccionadas por Usuario';

        const mapeo = {
            'transporte': 'Transporte', 'transport': 'Transporte',
            'viajes': 'Viajes', 'travel': 'Viajes',
            'comida': 'Comida y Bebida', 'food': 'Comida y Bebida',
            'bebida': 'Comida y Bebida', 'drink': 'Comida y Bebida',
            'familia': 'Familia', 'family': 'Familia',
            'casa': 'Casa y Hogar', 'home': 'Casa y Hogar', 'hogar': 'Casa y Hogar',
            'ropa': 'Ropa', 'clothes': 'Ropa',
            'animales': 'Animales', 'animals': 'Animales',
            'naturaleza': 'Naturaleza', 'nature': 'Naturaleza',
            'tiempo': 'Tiempo y Clima', 'weather': 'Tiempo y Clima', 'clima': 'Tiempo y Clima',
            'salud': 'Salud', 'health': 'Salud',
            'trabajo': 'Trabajo', 'work': 'Trabajo',
            'educacion': 'Educación', 'education': 'Educación',
            'deportes': 'Deportes', 'sports': 'Deportes',
            'arte': 'Arte', 'art': 'Arte',
            'musica': 'Música', 'music': 'Música',
            'tecnologia': 'Tecnología', 'technology': 'Tecnología',
            'compras': 'Compras', 'shopping': 'Compras',
            'comunicacion': 'Comunicación', 'communication': 'Comunicación',
            'emociones': 'Emociones', 'emotions': 'Emociones',
            'rutina': 'Rutina', 'routine': 'Rutina',
            'ciudad': 'Ciudad', 'city': 'Ciudad',
            'cultura': 'Cultura', 'culture': 'Cultura',
            'historia': 'Historia', 'history': 'Historia',
            'ciencia': 'Ciencia', 'science': 'Ciencia'
        };

        const familiaLower = familia.toLowerCase().trim();
        if (mapeo[familiaLower]) return mapeo[familiaLower];

        for (const [key, value] of Object.entries(mapeo)) {
            if (familiaLower.includes(key) || key.includes(familiaLower)) {
                return value;
            }
        }

        if (familia.startsWith('📌') || familia.startsWith('📂')) {
            return familia;
        }

        return `📌 ${familia}`;
    }

    // ============================================================
    // APLICAR FILTROS
    // ============================================================

    static aplicarFiltros(frases, palabras, uiEspacio) {
        let frasesFiltradas = frases;
        let palabrasFiltradas = palabras;
        const { busqueda, nivel, familia, tipo } = uiEspacio._filtros;

        if (busqueda) {
            const busquedaLower = busqueda.toLowerCase().trim();
            frasesFiltradas = frasesFiltradas.filter(f =>
                (f.original || '').toLowerCase().includes(busquedaLower) ||
                (f.traduccion || '').toLowerCase().includes(busquedaLower) ||
                (f.familiaSemantica || '').toLowerCase().includes(busquedaLower)
            );
            palabrasFiltradas = palabrasFiltradas.filter(p =>
                (p.palabra || p.hanzi || '').toLowerCase().includes(busquedaLower) ||
                (p.significado || '').toLowerCase().includes(busquedaLower) ||
                (p.familia || p.familiaSemantica || '').toLowerCase().includes(busquedaLower)
            );
        }
        if (nivel) {
            const nivelReal = uiEspacio._obtenerNivelRealUsuario();
            frasesFiltradas = frasesFiltradas.filter(f => (f.nivel || nivelReal) === nivel);
            palabrasFiltradas = palabrasFiltradas.filter(p => (p.nivel || nivelReal) === nivel);
        }
        if (familia) {
            frasesFiltradas = frasesFiltradas.filter(f => (f.familiaSemantica || '') === familia);
            palabrasFiltradas = palabrasFiltradas.filter(p => (p.familia || p.familiaSemantica || '') === familia);
        }
        if (tipo === 'palabras') frasesFiltradas = [];
        if (tipo === 'frases') palabrasFiltradas = [];
        return { frasesFiltradas, palabrasFiltradas };
    }

    // ============================================================
    // LIMPIAR FILTROS ESPACIO
    // ============================================================

    static limpiarFiltrosEspacio(uiEspacio) {
        uiEspacio._filtros = { busqueda: '', nivel: '', familia: '', tipo: 'todos' };
        const busquedaInput = document.getElementById('buscarEnEspacio');
        if (busquedaInput) busquedaInput.value = '';
        const nivelSelect = document.getElementById('filtroNivelEspacio');
        if (nivelSelect) nivelSelect.value = '';
        const tipoSelect = document.getElementById('filtroTipoEspacio');
        if (tipoSelect) tipoSelect.value = 'todos';
        uiEspacio._renderizarMiEspacio();
    }

    // ============================================================
    // CONFIGURAR EVENTOS DE BÚSQUEDA
    // ============================================================

    static configurarEventosBusqueda(uiEspacio) {
        const busquedaInput = document.getElementById('buscarEnEspacio');
        const nivelSelect = document.getElementById('filtroNivelEspacio');
        const tipoSelect = document.getElementById('filtroTipoEspacio');

        if (busquedaInput) {
            busquedaInput.addEventListener('input', () => {
                uiEspacio._filtros.busqueda = busquedaInput.value;
                uiEspacio._renderizarMiEspacio();
            });
        }
        if (nivelSelect) {
            nivelSelect.addEventListener('change', () => {
                uiEspacio._filtros.nivel = nivelSelect.value;
                uiEspacio._renderizarMiEspacio();
            });
        }
        if (tipoSelect) {
            tipoSelect.addEventListener('change', () => {
                uiEspacio._filtros.tipo = tipoSelect.value;
                uiEspacio._renderizarMiEspacio();
            });
        }
    }

    // ============================================================
    // NAVEGACIÓN POR PÁGINAS
    // ============================================================

    static irPagina(id, pagina, uiEspacio) {
        if (id === 'niveles') {
            uiEspacio._paginaNivel = Math.max(1, Math.min(pagina, uiEspacio._totalPaginasNiveles || 1));
            uiEspacio._renderizarMiEspacio();
        } else if (id.startsWith('familias_')) {
            const nivel = id.replace('familias_', '');
            if (!uiEspacio._paginaFamilias[nivel]) uiEspacio._paginaFamilias[nivel] = 1;
            uiEspacio._paginaFamilias[nivel] = Math.max(1, Math.min(pagina, uiEspacio._totalPaginasFamilias?.[nivel] || 1));
            uiEspacio._renderizarMiEspacio();
        }
    }

    static async irPaginaFamiliasCaracteres(pagina, uiEspacio) {
        const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
        const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
        const caracteresRaiz = todasPalabras.filter(p => p.esCaracterRaiz === true);
        const totalPaginas = Math.ceil(caracteresRaiz.length / (uiEspacio._familiasCaracteresPorPagina || 6));
        if (pagina < 1 || pagina > totalPaginas) return;
        uiEspacio._paginaFamiliasCaracteres = pagina;
        uiEspacio._renderizarMiEspacio();
    }

    // ============================================================
    // CÁLCULO DE DOMINIO Y LOGROS
    // ============================================================

    static async _calcularDominioFamilia(palabras, frases) {
        let totalRCN = 0;
        let elementosConRCN = 0;
        for (const p of palabras) {
            const progreso = await db.obtenerProgreso(p.id);
            if (progreso && progreso.rcn !== undefined) { totalRCN += progreso.rcn; elementosConRCN++; }
        }
        for (const f of frases) {
            const progreso = await db.obtenerProgreso(f.id);
            if (progreso && progreso.rcn !== undefined) { totalRCN += progreso.rcn; elementosConRCN++; }
        }
        const rcnPromedio = elementosConRCN > 0 ? totalRCN / elementosConRCN : 0;
        const dominio = Math.min(100, Math.round((rcnPromedio / 4) * 100));
        let color = 'var(--danger)', estado = '🔴 Necesita práctica', icono = '🔴';
        if (dominio >= 90) { color = 'var(--success)'; estado = '🏆 Dominio avanzado'; icono = '🏆'; }
        else if (dominio >= 70) { color = 'var(--success)'; estado = '🟢 Consolidado'; icono = '✅'; }
        else if (dominio >= 40) { color = 'var(--warning)'; estado = '🟡 En progreso'; icono = '📈'; }
        else if (dominio >= 20) { color = 'var(--warning)'; estado = '🟠 Iniciando'; icono = '🌱'; }
        return { dominio, color, estado, icono, elementosConRCN };
    }

    static async _calcularLogrosFamilia(familia, idioma) {
        const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
        const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
        const palabras = todasPalabras.filter(p => (p.familia || p.familiaSemantica) === familia);
        const frases = todasFrases.filter(f => (f.familiaSemantica) === familia);
        const stats = await this._calcularDominioFamilia(palabras, frases);
        const dominio = stats.dominio;
        let logros = [], racha = 0;
        if (dominio >= 20) logros.push('🌱 Iniciado');
        if (dominio >= 40) logros.push('📈 En progreso');
        if (dominio >= 60) logros.push('🥉 Bronce');
        if (dominio >= 75) logros.push('🥈 Plata');
        if (dominio >= 90) logros.push('🥇 Oro');
        if (dominio >= 98) logros.push('💎 Diamante');
        if (dominio >= 100) logros.push('🌟 Leyenda');
        const rachaKey = `racha_${familia}_${idioma}`;
        const rachaCountKey = `racha_count_${familia}_${idioma}`;
        const ultimoRepaso = localStorage.getItem(rachaKey);
        if (ultimoRepaso) {
            const diff = Math.floor((Date.now() - parseInt(ultimoRepaso)) / 86400000);
            if (diff <= 1) {
                racha = parseInt(localStorage.getItem(rachaCountKey) || '0');
                if (diff === 0) racha++;
                localStorage.setItem(rachaCountKey, String(racha));
            } else if (diff > 1) { racha = 0; localStorage.setItem(rachaCountKey, '0'); }
        }
        localStorage.setItem(rachaKey, String(Date.now()));
        return { logros, racha };
    }

    // ============================================================
    // ESTUDIAR FAMILIA DESDE ESPACIO
    // ============================================================

    static async estudiarFamiliaDesdeEspacio(familia, nivel, uiEspacio) {
        const core = uiEspacio._getCore();
        const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
        const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
        const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
        const palabrasFamilia = todasPalabras.filter(p => (p.familia || p.familiaSemantica || '') === familia);
        const frasesFamilia = todasFrases.filter(f => (f.familiaSemantica || '') === familia);

        if (palabrasFamilia.length === 0 && frasesFamilia.length === 0) {
            uiEspacio._mostrarToast('❌ No hay elementos en esta familia', 'error');
            return;
        }

        const opcion = await uiEspacio._mostrarDialogPersonalizado({
            icon: '📖',
            title: `Estudiar: ${familia}`,
            message: `
                📊 **Contenido disponible:**
                • ${palabrasFamilia.length} palabras
                • ${frasesFamilia.length} frases
                🎯 **Nivel: ${nivel || uiEspacio._obtenerNivelRealUsuario()}**
                ¿Cómo quieres estudiar?
            `,
            buttons: [
                { text: '📝 Palabras', value: 'palabras', primary: false },
                { text: '📖 Frases', value: 'frases', primary: false },
                { text: '🎯 Todo', value: 'todo', primary: true },
                { text: '⚡ Exprés', value: 'expres', primary: false },
                { text: 'Cancelar', value: null, secondary: true }
            ]
        });

        if (!opcion) return;

        let frasesParaEstudiar = [];
        if (opcion === 'todo' || opcion === 'frases' || opcion === 'expres') {
            frasesParaEstudiar = frasesFamilia;
        }
        if (opcion === 'palabras' || opcion === 'todo') {
            const textosPalabras = palabrasFamilia.map(p => (p.palabra || p.hanzi || '').toLowerCase());
            const todasFrasesDB = await db.obtenerFrasesPorIdioma(idioma);
            for (const f of todasFrasesDB) {
                const textoFrase = (f.original || '').toLowerCase();
                const coincide = textosPalabras.some(palabra => textoFrase.includes(palabra));
                if (coincide && !frasesParaEstudiar.some(ef => ef.id === f.id)) {
                    frasesParaEstudiar.push(f);
                }
            }
        }

        if (frasesParaEstudiar.length === 0) {
            uiEspacio._mostrarToast('❌ No hay frases para estudiar', 'error');
            return;
        }

        if (opcion === 'expres') {
            frasesParaEstudiar = frasesParaEstudiar.sort(() => Math.random() - 0.5).slice(0, 5);
            uiEspacio._mostrarToast(`⚡ Modo Exprés: ${frasesParaEstudiar.length} frases seleccionadas`, 'info');
        }

        const rachaKey = `racha_${familia}_${idioma}`;
        const rachaCountKey = `racha_count_${familia}_${idioma}`;
        localStorage.setItem(rachaKey, String(Date.now()));
        const rachaActual = parseInt(localStorage.getItem(rachaCountKey) || '0') + 1;
        localStorage.setItem(rachaCountKey, String(rachaActual));

        pipeline.frases = frasesParaEstudiar;
        pipeline.indiceFrase = 0;
        await pipeline.cargarFrase(0);

        if (core && core.irAModulo) {
            core.irAModulo('study');
        }

        uiEspacio._mostrarToast(`📖 Estudiando ${frasesParaEstudiar.length} frases de "${familia}" (🔥 Racha: ${rachaActual} días)`, 'success');
    }

    // ============================================================
    // ESTUDIAR FAMILIA DE CARACTERES
    // ============================================================

    static async estudiarFamiliaCaracteres(caracterId, uiEspacio) {
        const core = uiEspacio._getCore();
        const palabraRaiz = await db.get('palabras', caracterId);
        if (!palabraRaiz || !palabraRaiz.esCaracterRaiz) {
            core?.mostrarToast('❌ No se encontró la familia de caracteres', 'error');
            return;
        }

        const todasPalabras = await db.obtenerPalabrasPorIdioma(palabraRaiz.idioma);
        const palabrasDerivadas = todasPalabras.filter(p =>
            p.esPalabraDerivada && p.caracterRaiz === palabraRaiz.palabra
        );

        if (palabrasDerivadas.length === 0) {
            core?.mostrarToast('❌ No hay palabras derivadas para estudiar', 'error');
            return;
        }

        const todasFrases = await db.obtenerFrasesPorIdioma(palabraRaiz.idioma);
        const frasesParaEstudiar = [];
        const palabrasList = [palabraRaiz.palabra, ...palabrasDerivadas.map(p => p.palabra)];

        for (const f of todasFrases) {
            const textoFrase = (f.original || '').toLowerCase();
            const coincide = palabrasList.some(p => textoFrase.includes(p.toLowerCase()));
            if (coincide && !frasesParaEstudiar.some(ef => ef.id === f.id)) {
                frasesParaEstudiar.push(f);
            }
        }

        if (frasesParaEstudiar.length === 0) {
            core?.mostrarToast('❌ No hay frases con estas palabras. Genera contenido primero.', 'error');
            return;
        }

        pipeline.frases = frasesParaEstudiar;
        pipeline.indiceFrase = 0;
        await pipeline.cargarFrase(0);
        core?.irAModulo('study');
        core?.mostrarToast(`📖 Estudiando ${frasesParaEstudiar.length} frases de la familia "${palabraRaiz.palabra}"`, 'success');
    }

    // ============================================================
    // MOSTRAR VARIANTES DEL CARÁCTER
    // ============================================================

    static mostrarVariantes(variantesStr, uiEspacio) {
        try {
            const variantes = typeof variantesStr === 'string' ? JSON.parse(variantesStr) : variantesStr;
            if (!variantes || typeof variantes !== 'object') return;

            let mensaje = '📌 **Variantes del Carácter**\n\n';
            if (variantes.tradicional) {
                mensaje += `🔄 Tradicional: **${variantes.tradicional}**\n`;
            }
            if (variantes.simplificado) {
                mensaje += `🔄 Simplificado: **${variantes.simplificado}**\n`;
            }
            if (!variantes.tradicional && !variantes.simplificado) {
                mensaje += 'ℹ️ No hay variantes registradas.';
            }

            uiEspacio._core?.alert(mensaje, '📌 Variantes');
        } catch (e) {
            console.warn('⚠️ Error mostrando variantes:', e);
        }
    }

    // ============================================================
    // MODO EXPRÉS
    // ============================================================

    static async modoExpres(uiEspacio) {
        const core = uiEspacio._getCore();
        const idioma = gestorIdiomas.getIdiomaActivo() || 'es';

        const opcion = await uiEspacio._mostrarDialogPersonalizado({
            icon: '⚡',
            title: 'Modo Exprés',
            message: '🔥 **Repaso rápido inteligente**\n\n📊 **Tienes contenido pendiente:**\n• Palabras con RCN bajo\n• Frases que necesitan refuerzo\n• Elementos que no has visto recientemente\n\n🎯 **Opciones:**',
            buttons: [
                { text: '⚡ Repaso Aleatorio', value: 'aleatorio', primary: true },
                { text: '📝 Palabras Pendientes', value: 'palabras', primary: false },
                { text: '📖 Frases Pendientes', value: 'frases', primary: false },
                { text: '🎯 Todo', value: 'todo', primary: false },
                { text: 'Cancelar', value: null, secondary: true }
            ]
        });

        if (!opcion) return;

        const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
        const todasFrases = await db.obtenerFrasesPorIdioma(idioma);
        const palabrasPendientes = [];
        const frasesPendientes = [];

        for (const p of todasPalabras) {
            const progreso = await db.obtenerProgreso(p.id);
            if (!progreso || progreso.rcn < 2) palabrasPendientes.push(p);
        }

        for (const f of todasFrases) {
            const progreso = await db.obtenerProgreso(f.id);
            if (!progreso || progreso.rcn < 2) frasesPendientes.push(f);
        }

        let seleccionados = [];
        if (opcion === 'palabras') seleccionados = palabrasPendientes;
        else if (opcion === 'frases') seleccionados = frasesPendientes;
        else if (opcion === 'todo' || opcion === 'aleatorio') seleccionados = [...palabrasPendientes, ...frasesPendientes];

        if (seleccionados.length === 0) {
            uiEspacio._mostrarToast('🎉 ¡No tienes elementos pendientes!', 'success');
            return;
        }

        const limitados = seleccionados.sort(() => Math.random() - 0.5).slice(0, 10);
        if (limitados.length === 0) {
            uiEspacio._mostrarToast('❌ No hay elementos para repasar', 'error');
            return;
        }

        const frasesParaEstudiar = [];
        for (const item of limitados) {
            if (item.original) {
                frasesParaEstudiar.push(item);
            } else {
                const texto = (item.palabra || item.hanzi || '').toLowerCase();
                const todasFrasesDB = await db.obtenerFrasesPorIdioma(idioma);
                for (const f of todasFrasesDB) {
                    if ((f.original || '').toLowerCase().includes(texto) && !frasesParaEstudiar.some(ef => ef.id === f.id)) {
                        frasesParaEstudiar.push(f);
                        break;
                    }
                }
            }
        }

        if (frasesParaEstudiar.length === 0) {
            uiEspacio._mostrarToast('❌ No se encontraron frases para repasar', 'error');
            return;
        }

        const confirmar = await uiEspacio._confirmar(
            `⚡ **Modo Exprés: ${frasesParaEstudiar.length} elementos**\n\n📊 ${frasesParaEstudiar.filter(f => f.original).length} frases · ${frasesParaEstudiar.length - frasesParaEstudiar.filter(f => f.original).length} palabras\n\n🎯 Nivel actual: ${uiEspacio._obtenerNivelRealUsuario()}\n⏱️ Tiempo estimado: ${Math.ceil(frasesParaEstudiar.length * 0.5)} minutos\n\n¿Comenzar el repaso?`,
            '⚡ Modo Exprés'
        );

        if (!confirmar) return;

        pipeline.frases = frasesParaEstudiar;
        pipeline.indiceFrase = 0;
        await pipeline.cargarFrase(0);

        if (core && core.irAModulo) {
            core.irAModulo('study');
        }

        uiEspacio._mostrarToast(`⚡ Modo Exprés: ${frasesParaEstudiar.length} elementos para repasar`, 'success');
    }

    // ============================================================
    // VER FRASES / PALABRAS
    // ============================================================

    static async verFrases(uiEspacio) {
        const container = document.getElementById('espacioContent');
        if (!container) return;

        try {
            const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
            const nivelReal = uiEspacio._obtenerNivelRealUsuario();
            const esJeroglifico = uiEspacio._esJeroglifico(idiomaActivo);

            await gestorFavoritos.recargar();
            const todasFrases = await gestorFavoritos.obtenerFrasesFavoritas();
            let frases = todasFrases.filter(f => f.idioma === idiomaActivo);
            const { frasesFiltradas } = uiEspacio._aplicarFiltros(frases, []);
            frases = frasesFiltradas;

            let html = `
                <div class="espacio-detalle">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
                        <button class="btn-back" onclick="window.UIEspacio._volver()" style="padding:6px 14px;font-size:13px;"><i class="fas fa-arrow-left"></i> Volver</button>
                        <h2 style="font-size:20px;font-weight:700;color:var(--dark);margin:0;">📖 Todas las Frases (${frases.length})</h2>
                        <span style="font-size:12px;color:var(--gray-light);">${uiEspacio._getNombreIdioma(idiomaActivo)}</span>
                        <span style="font-size:11px;color:var(--primary);font-weight:600;">🎯 Nivel: ${nivelReal}</span>
                        ${frases.length > 0 ? `<button class="btn-danger" onclick="window.UIEspacio._eliminarTodasFrases()" style="padding:4px 12px;font-size:11px;background:#FF7675;color:white;border:none;border-radius:6px;cursor:pointer;"><i class="fas fa-trash"></i> Eliminar todas</button>` : ''}
                    </div>
            `;

            if (frases.length === 0) {
                html += `
                    <div style="text-align:center;padding:40px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">
                        <i class="fas fa-book" style="font-size:48px;color:var(--primary-light);display:block;margin-bottom:16px;"></i>
                        <p style="font-size:16px;font-weight:500;">No tienes frases guardadas en ${uiEspacio._getNombreIdioma(idiomaActivo)}</p>
                        <p style="font-size:13px;color:var(--gray-light);">Añade frases desde el modal "Añadir Contenido"</p>
                    </div>
                `;
            } else {
                const agrupadas = {};
                for (const f of frases) {
                    const nivel = f.nivel || nivelReal;
                    const familia = f.familiaSemantica || 'sin_clasificar';
                    const key = `${nivel}|${familia}`;
                    if (!agrupadas[key]) agrupadas[key] = { nivel, familia, frases: [] };
                    agrupadas[key].frases.push(f);
                }

                const keysOrdenadas = Object.keys(agrupadas).sort((a, b) => {
                    const [nivelA, famA] = a.split('|');
                    const [nivelB, famB] = b.split('|');
                    const idxA = uiEspacio.NIVELES.indexOf(nivelA);
                    const idxB = uiEspacio.NIVELES.indexOf(nivelB);
                    if (idxA !== idxB) return idxA - idxB;
                    return famA.localeCompare(famB);
                });

                for (const key of keysOrdenadas) {
                    const { nivel, familia, frases: frasesGrupo } = agrupadas[key];
                    const esNivelActual = nivel === nivelReal;
                    const colorSemantica = uiEspacio._getColorFamiliaSemantica(familia);

                    html += `
                        <div style="margin-bottom:12px;background:var(--white);border-radius:10px;padding:12px 14px;box-shadow:var(--shadow);border-left:3px solid ${esNivelActual ? colorSemantica : 'var(--light)'};">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:4px;">
                                <span style="font-size:13px;font-weight:600;color:var(--dark);">
                                    ${uiEspacio.EMOJIS_NIVEL[nivel] || '📚'} Nivel ${nivel} ${esNivelActual ? '🎯' : ''} → 📂 ${familia}
                                </span>
                                <span style="font-size:11px;color:var(--gray-light);">${frasesGrupo.length} frases</span>
                            </div>
                            <div style="display:flex;flex-direction:column;gap:6px;">
                    `;

                    for (const f of frasesGrupo) {
                        const elementoHtml = uiEspacio._renderizarElementoEspacio(f, 'frase', idiomaActivo);
                        const nivelFrase = f.nivel || nivelReal;
                        const familiaGramatical = f.familiaGramatical || 'sustantivo';
                        const colorGramatical = uiEspacio._getColorFamiliaGramatical(familiaGramatical);

                        html += `
                            <div style="background:var(--bg);border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                                <div style="flex:1;min-width:150px;cursor:pointer;" onclick="window.UIEspacio._ejercicioTraduccion(${f.id})">
                                    ${elementoHtml}
                                    <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                                        <span style="font-size:9px;background:${colorSemantica}15;padding:1px 8px;border-radius:10px;color:${colorSemantica};">${familia}</span>
                                        <span style="font-size:9px;background:${colorGramatical}15;padding:1px 8px;border-radius:10px;color:${colorGramatical};">${familiaGramatical}</span>
                                        <span style="font-size:9px;background:var(--bg);padding:1px 8px;border-radius:10px;color:var(--gray);">${nivelFrase}</span>
                                    </div>
                                </div>
                                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                                    <button class="btn-secondary" onclick="event.stopPropagation();window.UIEspacio._ejercicioTraduccion(${f.id})" style="padding:3px 12px;font-size:10px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;" title="Traducir">
                                        <i class="fas fa-language"></i>
                                    </button>
                                    <button class="btn-secondary" onclick="event.stopPropagation();window.UIEspacio._ejercicioOrdenar(${f.id})" style="padding:3px 12px;font-size:10px;background:var(--success);color:white;border:none;border-radius:4px;cursor:pointer;" title="Ordenar">
                                        <i class="fas fa-sort"></i>
                                    </button>
                                    <button class="btn-danger" onclick="event.stopPropagation();window.UIEspacio._eliminarFrase(${f.id})" style="padding:3px 10px;font-size:10px;background:#FF7675;color:white;border:none;border-radius:4px;cursor:pointer;" title="Eliminar">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                    }

                    html += `</div></div>`;
                }
            }

            html += `</div>`;
            container.innerHTML = html;

        } catch (error) {
            console.error('❌ Error cargando frases:', error);
            container.innerHTML = `
                <div style="text-align:center;padding:40px;color:var(--gray);">
                    <i class="fas fa-exclamation-triangle" style="font-size:48px;color:var(--danger);display:block;margin-bottom:16px;"></i>
                    <p style="font-size:16px;font-weight:500;">Error cargando frases</p>
                    <p style="font-size:13px;color:var(--gray-light);">${error.message}</p>
                    <button class="btn-primary" onclick="window.UIEspacio._verFrases()" style="margin-top:12px;"><i class="fas fa-sync"></i> Reintentar</button>
                </div>
            `;
        }
    }

    static async verPalabras(uiEspacio) {
        const container = document.getElementById('espacioContent');
        if (!container) return;

        try {
            const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
            const nivelReal = uiEspacio._obtenerNivelRealUsuario();

            await gestorFavoritos.recargar();
            const todasPalabras = await gestorFavoritos.obtenerPalabrasFavoritas();
            let palabras = todasPalabras.filter(p => p.idioma === idiomaActivo);
            const { palabrasFiltradas } = uiEspacio._aplicarFiltros([], palabras);
            palabras = palabrasFiltradas;

            let html = `
                <div class="espacio-detalle">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
                        <button class="btn-back" onclick="window.UIEspacio._volver()" style="padding:6px 14px;font-size:13px;"><i class="fas fa-arrow-left"></i> Volver</button>
                        <h2 style="font-size:20px;font-weight:700;color:var(--dark);margin:0;">📝 Todas las Palabras (${palabras.length})</h2>
                        <span style="font-size:12px;color:var(--gray-light);">${uiEspacio._getNombreIdioma(idiomaActivo)}</span>
                        <span style="font-size:11px;color:var(--primary);font-weight:600;">🎯 Nivel: ${nivelReal}</span>
                        ${palabras.length > 0 ? `<button class="btn-danger" onclick="window.UIEspacio._eliminarTodasPalabras()" style="padding:4px 12px;font-size:11px;background:#FF7675;color:white;border:none;border-radius:6px;cursor:pointer;"><i class="fas fa-trash"></i> Eliminar todas</button>` : ''}
                    </div>
            `;

            if (palabras.length === 0) {
                html += `
                    <div style="text-align:center;padding:40px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">
                        <i class="fas fa-list" style="font-size:48px;color:var(--primary-light);display:block;margin-bottom:16px;"></i>
                        <p style="font-size:16px;font-weight:500;">No tienes palabras guardadas en ${uiEspacio._getNombreIdioma(idiomaActivo)}</p>
                        <p style="font-size:13px;color:var(--gray-light);">Añade palabras desde el modal "Añadir Contenido"</p>
                    </div>
                `;
            } else {
                const agrupadas = {};
                for (const p of palabras) {
                    const nivel = p.nivel || nivelReal;
                    const familia = p.familiaSemantica || p.familia || 'sin_clasificar';
                    const key = `${nivel}|${familia}`;
                    if (!agrupadas[key]) agrupadas[key] = { nivel, familia, palabras: [] };
                    agrupadas[key].palabras.push(p);
                }

                const keysOrdenadas = Object.keys(agrupadas).sort((a, b) => {
                    const [nivelA, famA] = a.split('|');
                    const [nivelB, famB] = b.split('|');
                    const idxA = uiEspacio.NIVELES.indexOf(nivelA);
                    const idxB = uiEspacio.NIVELES.indexOf(nivelB);
                    if (idxA !== idxB) return idxA - idxB;
                    return famA.localeCompare(famB);
                });

                for (const key of keysOrdenadas) {
                    const { nivel, familia, palabras: palabrasGrupo } = agrupadas[key];
                    const esNivelActual = nivel === nivelReal;
                    const colorSemantica = uiEspacio._getColorFamiliaSemantica(familia);

                    html += `
                        <div style="margin-bottom:12px;background:var(--white);border-radius:10px;padding:12px 14px;box-shadow:var(--shadow);border-left:3px solid ${esNivelActual ? colorSemantica : 'var(--light)'};">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:4px;">
                                <span style="font-size:13px;font-weight:600;color:var(--dark);">
                                    ${uiEspacio.EMOJIS_NIVEL[nivel] || '📚'} Nivel ${nivel} ${esNivelActual ? '🎯' : ''} → 📂 ${familia}
                                </span>
                                <span style="font-size:11px;color:var(--gray-light);">${palabrasGrupo.length} palabras</span>
                            </div>
                            <div style="display:flex;flex-direction:column;gap:6px;">
                    `;

                    for (const p of palabrasGrupo) {
                        const elementoHtml = uiEspacio._renderizarElementoEspacio(p, 'palabra', idiomaActivo);
                        const nivelPalabra = p.nivel || nivelReal;
                        const familiaGramatical = p.familia || 'sustantivo';
                        const colorGramatical = uiEspacio._getColorFamiliaGramatical(familiaGramatical);

                        html += `
                            <div style="background:var(--bg);border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                                <div style="flex:1;min-width:150px;cursor:pointer;" onclick="window.UIEspacio._ejercicioRellenar('${(p.palabra || p.hanzi || '').replace(/'/g, "\\'")}', '${idiomaActivo}')">
                                    ${elementoHtml}
                                    <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                                        <span style="font-size:9px;background:${colorSemantica}15;padding:1px 8px;border-radius:10px;color:${colorSemantica};">${familia}</span>
                                        <span style="font-size:9px;background:${colorGramatical}15;padding:1px 8px;border-radius:10px;color:${colorGramatical};">${familiaGramatical}</span>
                                        <span style="font-size:9px;background:var(--bg);padding:1px 8px;border-radius:10px;color:var(--gray);">${nivelPalabra}</span>
                                    </div>
                                </div>
                                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                                    <button class="btn-secondary" onclick="event.stopPropagation();window.UIEspacio._ejercicioRellenar('${(p.palabra || p.hanzi || '').replace(/'/g, "\\'")}', '${idiomaActivo}')" style="padding:3px 12px;font-size:10px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;" title="Practicar">
                                        <i class="fas fa-pencil-alt"></i>
                                    </button>
                                    <button class="btn-danger" onclick="event.stopPropagation();window.UIEspacio._eliminarPalabra(${p.id})" style="padding:3px 10px;font-size:10px;background:#FF7675;color:white;border:none;border-radius:4px;cursor:pointer;" title="Eliminar">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                    }

                    html += `</div></div>`;
                }
            }

            html += `</div>`;
            container.innerHTML = html;

        } catch (error) {
            console.error('❌ Error cargando palabras:', error);
            container.innerHTML = `
                <div style="text-align:center;padding:40px;color:var(--gray);">
                    <i class="fas fa-exclamation-triangle" style="font-size:48px;color:var(--danger);display:block;margin-bottom:16px;"></i>
                    <p style="font-size:16px;font-weight:500;">Error cargando palabras</p>
                    <p style="font-size:13px;color:var(--gray-light);">${error.message}</p>
                    <button class="btn-primary" onclick="window.UIEspacio._verPalabras()" style="margin-top:12px;"><i class="fas fa-sync"></i> Reintentar</button>
                </div>
            `;
        }
    }

    // ============================================================
    // RANKING Y ESTADÍSTICAS
    // ============================================================

    static async mostrarRankingFamilias(idioma, uiEspacio) {
        const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
        const todasFrases = await db.obtenerFrasesPorIdioma(idioma);

        const familiasSet = new Set();
        for (const p of todasPalabras) {
            const familia = p.familia || p.familiaSemantica;
            if (familia && familia !== 'sin_clasificar') familiasSet.add(familia);
        }
        for (const f of todasFrases) {
            const familia = f.familiaSemantica;
            if (familia && familia !== 'sin_clasificar') familiasSet.add(familia);
        }

        const familias = Array.from(familiasSet);
        const ranking = [];

        for (const familia of familias) {
            const palabras = todasPalabras.filter(p => (p.familia || p.familiaSemantica) === familia);
            const frases = todasFrases.filter(f => (f.familiaSemantica) === familia);
            const stats = await this._calcularDominioFamilia(palabras, frases);
            ranking.push({
                familia,
                dominio: stats.dominio,
                total: palabras.length + frases.length,
                palabras: palabras.length,
                frases: frases.length,
                estado: stats.estado,
                icono: stats.icono
            });
        }

        ranking.sort((a, b) => b.dominio - a.dominio);

        const nivelReal = uiEspacio._obtenerNivelRealUsuario();

        let mensaje = '🏆 **RANKING DE FAMILIAS**\n\n🌍 ' + uiEspacio._getNombreIdioma(idioma) + ' · ' + ranking.length + ' familias\n\n';

        for (let i = 0; i < Math.min(ranking.length, 10); i++) {
            const r = ranking[i];
            const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
            mensaje += `${medalla} **${r.familia}**\n   ${r.icono} ${r.estado} (${r.dominio}%)\n   📝 ${r.palabras} palabras · 📖 ${r.frases} frases\n   ${'█'.repeat(Math.round(r.dominio / 5))}${'░'.repeat(20 - Math.round(r.dominio / 5))}\n\n`;
        }

        if (ranking.length > 10) mensaje += `... y ${ranking.length - 10} más.\n`;
        mensaje += `\n🎯 Tu nivel actual: ${nivelReal}`;

        uiEspacio._alertar(mensaje, '🏆 Ranking de Familias');
    }

    static async mostrarEstadisticasNivel(idioma, uiEspacio) {
        const nivelReal = uiEspacio._obtenerNivelRealUsuario();
        const todasPalabras = await db.obtenerPalabrasPorIdioma(idioma);
        const todasFrases = await db.obtenerFrasesPorIdioma(idioma);

        let mensaje = '📊 **ESTADÍSTICAS DE PROGRESO**\n\n🌍 ' + uiEspacio._getNombreIdioma(idioma) + '\n🎯 Nivel actual: ' + nivelReal + '\n\n📝 **Palabras:** ' + todasPalabras.length + '\n📖 **Frases:** ' + todasFrases.length + '\n\n📚 **Distribución por nivel:**\n';

        for (const nivel of uiEspacio.NIVELES) {
            const palabrasNivel = todasPalabras.filter(p => (p.nivel || nivelReal) === nivel);
            const frasesNivel = todasFrases.filter(f => (f.nivel || nivelReal) === nivel);
            const total = palabrasNivel.length + frasesNivel.length;
            if (total > 0) {
                const emoji = uiEspacio.EMOJIS_NIVEL[nivel] || '📚';
                const esActual = nivel === nivelReal;
                mensaje += `   ${emoji} ${nivel}${esActual ? ' 🎯' : ''}: ${total} elementos (${palabrasNivel.length} palabras, ${frasesNivel.length} frases)\n`;
            }
        }

        const familiasSet = new Set();
        for (const p of todasPalabras) {
            const familia = p.familia || p.familiaSemantica;
            if (familia && familia !== 'sin_clasificar') familiasSet.add(familia);
        }
        for (const f of todasFrases) {
            const familia = f.familiaSemantica;
            if (familia && familia !== 'sin_clasificar') familiasSet.add(familia);
        }

        mensaje += `\n📂 **Familias:** ${familiasSet.size}\n`;

        const ranking = [];
        for (const familia of familiasSet) {
            const palabras = todasPalabras.filter(p => (p.familia || p.familiaSemantica) === familia);
            const frases = todasFrases.filter(f => (f.familiaSemantica) === familia);
            const stats = await this._calcularDominioFamilia(palabras, frases);
            ranking.push({ familia, dominio: stats.dominio });
        }

        ranking.sort((a, b) => b.dominio - a.dominio);

        if (ranking.length > 0) {
            mensaje += `\n🏆 **Top 5 familias más dominadas:**\n`;
            for (let i = 0; i < Math.min(ranking.length, 5); i++) {
                const r = ranking[i];
                const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
                mensaje += `   ${medalla} ${r.familia}: ${r.dominio}%\n`;
            }
        }

        mensaje += `\n💡 **Recomendaciones:**\n`;
        const pendientes = todasPalabras.filter(p => {
            const progreso = db.obtenerProgreso(p.id);
            return !progreso || progreso.rcn < 2;
        });

        if (pendientes.length > 5) {
            mensaje += `   • Tienes ${pendientes.length} palabras pendientes de consolidar.\n   • Usa el modo "Exprés" para repasarlas rápidamente.\n`;
        } else {
            mensaje += `   • ¡Excelente! No tienes palabras pendientes.\n`;
        }

        if (todasFrases.length < 10) {
            mensaje += `   • Importa más contenido para enriquecer tu aprendizaje.\n`;
        }

        uiEspacio._alertar(mensaje, '📊 Estadísticas de Progreso');
    }

    // ============================================================
    // LIMPIAR FAVORITOS
    // ============================================================

    static async limpiarFavoritos(uiEspacio) {
        const confirmar = await uiEspacio._confirmar(
            '⚠️ ¿Estás seguro de eliminar TODAS las frases y palabras guardadas en "Mi Espacio"?\n\nEsta acción no se puede deshacer.',
            'Limpiar Mi Espacio'
        );

        if (!confirmar) return;

        await gestorFavoritos.limpiarTodo();
        uiEspacio._mostrarToast('🗑️ Mi Espacio limpiado', 'warning');
        uiEspacio._renderizarMiEspacio();
    }

    // ============================================================
    // EXPORTAR FAVORITOS
    // ============================================================

    static async exportarFavoritos(uiEspacio) {
        await gestorFavoritos.recargar();

        const frases = await gestorFavoritos.obtenerFrasesFavoritas();
        const palabras = await gestorFavoritos.obtenerPalabrasFavoritas();
        const grupos = await gestorFavoritos.obtenerGruposFavoritos();

        const nivelReal = uiEspacio._obtenerNivelRealUsuario();
        const idioma = gestorIdiomas.getIdiomaActivo() || 'es';

        const data = {
            version: '14.0',
            fecha: new Date().toISOString(),
            idioma: idioma,
            nivel: nivelReal,
            resumen: { totalFrases: frases.length, totalPalabras: palabras.length, totalGrupos: Object.keys(grupos).length },
            frases: frases.map(f => ({
                id: f.id,
                original: f.original,
                traduccion: f.traduccion,
                idioma: f.idioma,
                nivel: f.nivel || nivelReal,
                esJeroglifico: f.esJeroglifico || false,
                familiaSemantica: f.familiaSemantica || 'sin_clasificar',
                familiaGramatical: f.familiaGramatical || 'sustantivo',
                pinyinCompleto: f.pinyinCompleto || f.segmentacion?.pinyin || f.pinyin || '',
                fonetica: f.fonetica || f.pronunciacion || '',
                reglaGramatical: f.reglaGramatical || null,
                explicacionGramatical: f.explicacionGramatical || null,
                tipoRegla: f.tipoRegla || null
            })),
            palabras: palabras.map(p => ({
                id: p.id,
                original: p.original || p.palabra || p.significado,
                traduccion: p.traduccion || p.palabra || p.hanzi,
                significado: p.significado,
                familia: p.familia || 'sin_clasificar',
                familiaSemantica: p.familiaSemantica || 'sin_clasificar',
                nivel: p.nivel || nivelReal,
                pinyin: p.pinyin || '',
                fonetica: p.fonetica || '',
                esJeroglifico: !!(p.hanzi),
                idioma: p.idioma
            })),
            grupos: grupos
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mi_espacio_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        uiEspacio._mostrarToast('✅ Mi Espacio exportado', 'success');
    }

    // ============================================================
    // IMPORTAR FAVORITOS
    // ============================================================

    static async importarFavoritos(uiEspacio) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (!data.frases && !data.palabras) {
                        uiEspacio._mostrarToast('❌ JSON inválido', 'error');
                        return;
                    }
                    uiEspacio._mostrarToast('✅ Importado correctamente', 'success');
                    uiEspacio._renderizarMiEspacio();
                } catch (error) {
                    uiEspacio._mostrarToast('❌ Error importando', 'error');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    // ============================================================
    // ELIMINAR FRASE / PALABRA
    // ============================================================

    static async eliminarFrase(fraseId, uiEspacio) {
        const confirmar = await uiEspacio._confirmar('¿Eliminar esta frase de "Mi Espacio"?', 'Confirmar');
        if (confirmar) {
            await gestorFavoritos.eliminarFrase(fraseId);
            uiEspacio._verFrases();
            uiEspacio._mostrarToast('🗑️ Frase eliminada', 'warning');
        }
    }

    static async eliminarPalabra(palabraId, uiEspacio) {
        const confirmar = await uiEspacio._confirmar('¿Eliminar esta palabra de "Mi Espacio"?', 'Confirmar');
        if (confirmar) {
            await gestorFavoritos.eliminarPalabra(palabraId);
            uiEspacio._verPalabras();
            uiEspacio._mostrarToast('🗑️ Palabra eliminada', 'warning');
        }
    }

    // ============================================================
    // ABRIR MODAL GRUPOS
    // ============================================================

    static async abrirModalGrupos(uiEspacio) {
        if (uiEspacio._modalGruposAbierto) return;
        uiEspacio._modalGruposAbierto = true;

        uiEspacio._mostrarToast('📂 Organizando grupos con IA...', 'info');

        try {
            const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
            const grupos = await gestorFavoritos.generarGruposConVigia(idioma);

            if (grupos && !grupos.error) {
                uiEspacio._mostrarToast('✅ Grupos organizados con IA', 'success');
                uiEspacio._renderizarMiEspacio();
            } else {
                uiEspacio._mostrarToast('⚠️ No se pudieron organizar los grupos', 'warning');
            }
        } catch (e) {
            uiEspacio._mostrarToast('❌ Error organizando grupos', 'error');
        }

        uiEspacio._modalGruposAbierto = false;
    }

    // ============================================================
    // MOSTRAR SELECTOR DE EJERCICIOS
    // ============================================================

    static async mostrarSelectorEjercicios(uiEspacio) {
        const opcion = await uiEspacio._mostrarDialogPersonalizado({
            icon: '💪',
            title: 'Ejercicios de Mi Espacio',
            message: 'Selecciona el tipo de ejercicio que quieres practicar con tu contenido guardado:',
            buttons: [
                { text: '📝 Rellenar palabra', value: 'rellenar', primary: true },
                { text: '🌍 Traducir frase', value: 'traduccion', primary: false },
                { text: '🧩 Ordenar frase', value: 'ordenar', primary: false },
                { text: '⚡ Exprés', value: 'expres', primary: false },
                { text: 'Cancelar', value: null, secondary: true }
            ]
        });

        if (!opcion) return;

        const core = uiEspacio._getCore();
        const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
        const nivelReal = uiEspacio._obtenerNivelRealUsuario();

        await gestorFavoritos.recargar();
        const todasFrases = await gestorFavoritos.obtenerFrasesFavoritas();
        const todasPalabras = await gestorFavoritos.obtenerPalabrasFavoritas();

        const frases = todasFrases.filter(f => f.idioma === idioma);
        const palabras = todasPalabras.filter(p => p.idioma === idioma);

        if (frases.length === 0 && palabras.length === 0) {
            uiEspacio._mostrarToast('❌ No hay contenido en Mi Espacio para este idioma', 'error');
            return;
        }

        const opcionesPorTipo = {
            'rellenar': palabras.length > 0 ? palabras : frases,
            'traduccion': frases.length > 0 ? frases : palabras,
            'ordenar': frases.filter(f => (f.palabras || []).length >= 2),
            'expres': [...frases, ...palabras]
        };

        const elementos = opcionesPorTipo[opcion] || [];
        if (elementos.length === 0) {
            uiEspacio._mostrarToast(`❌ No hay elementos para el ejercicio "${opcion}"`, 'error');
            return;
        }

        const randomElement = elementos[Math.floor(Math.random() * elementos.length)];

        if (opcion === 'rellenar') {
            const texto = randomElement.palabra || randomElement.hanzi || '';
            if (texto) {
                uiEspacio._ejercicioRellenar(texto, idioma);
            } else {
                uiEspacio._mostrarToast('❌ No hay palabras para rellenar', 'error');
            }
        } else if (opcion === 'traduccion') {
            if (randomElement.id) {
                uiEspacio._ejercicioTraduccion(randomElement.id);
            } else {
                uiEspacio._mostrarToast('❌ No hay frases para traducir', 'error');
            }
        } else if (opcion === 'ordenar') {
            if (randomElement.id) {
                uiEspacio._ejercicioOrdenar(randomElement.id);
            } else {
                uiEspacio._mostrarToast('❌ No hay frases para ordenar', 'error');
            }
        } else if (opcion === 'expres') {
            uiEspacio._modoExpres();
        }
    }

    // ============================================================
    // ELIMINAR TODAS FRASES / PALABRAS (AUXILIAR)
    // ============================================================

    static async _eliminarTodasFrases(uiEspacio) {
        const confirmar = await uiEspacio._confirmar(
            '⚠️ ¿Eliminar TODAS las frases de "Mi Espacio" para este idioma?\n\nEsta acción no se puede deshacer.',
            '🗑️ Eliminar todas las frases'
        );

        if (!confirmar) return;

        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        const todasFrases = await gestorFavoritos.obtenerFrasesFavoritas();
        const frasesAEliminar = todasFrases.filter(f => f.idioma === idiomaActivo);

        let eliminadas = 0;
        for (const f of frasesAEliminar) {
            await gestorFavoritos.eliminarFrase(f.id);
            eliminadas++;
        }

        uiEspacio._mostrarToast(`🗑️ ${eliminadas} frases eliminadas`, 'warning');
        uiEspacio._verFrases();
        if (window.uiCore) window.uiCore._actualizarEspacioStats();
        uiEspacio._renderizarMiEspacio();
    }

    static async _eliminarTodasPalabras(uiEspacio) {
        const confirmar = await uiEspacio._confirmar(
            '⚠️ ¿Eliminar TODAS las palabras de "Mi Espacio" para este idioma?\n\nEsta acción no se puede deshacer.',
            '🗑️ Eliminar todas las palabras'
        );

        if (!confirmar) return;

        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        const todasPalabras = await gestorFavoritos.obtenerPalabrasFavoritas();
        const palabrasAEliminar = todasPalabras.filter(p => p.idioma === idiomaActivo);

        let eliminadas = 0;
        for (const p of palabrasAEliminar) {
            await gestorFavoritos.eliminarPalabra(p.id);
            eliminadas++;
        }

        uiEspacio._mostrarToast(`🗑️ ${eliminadas} palabras eliminadas`, 'warning');
        uiEspacio._verPalabras();
        if (window.uiCore) window.uiCore._actualizarEspacioStats();
        uiEspacio._renderizarMiEspacio();
    }

    // ============================================================
    // PROCESAR COMANDO DEL CHAT
    // ============================================================

    static async procesarComandoChat(mensaje, uiEspacio) {
        let añadidos = 0;
        const nivelReal = uiEspacio._obtenerNivelRealUsuario();

        const palabrasMatch = mensaje.match(/palabras?\s*:\s*([^\.\n]+)/i);
        if (palabrasMatch) {
            const palabrasList = palabrasMatch[1].split(',').map(p => p.trim()).filter(p => p.length > 0);
            const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
            const nombreNivel = `📚 Nivel ${nivelReal}`;

            for (const palabraText of palabrasList) {
                const existentes = await db.obtenerPalabras();
                const existe = existentes.some(p =>
                    (p.palabra || p.hanzi || '').toLowerCase() === palabraText.toLowerCase() &&
                    p.idioma === idioma
                );

                if (!existe) {
                    const palabraObj = {
                        original: palabraText,
                        traduccion: palabraText,
                        significado: palabraText,
                        familia: 'sustantivo',
                        familiaSemantica: uiEspacio.GRUPO_USUARIO,
                        nivel: nivelReal,
                        tipo: 'sustantivo',
                        idioma: idioma,
                        frecuencia: 1,
                        neuroScore: 0.5,
                        nivelDominio: 'nuevo'
                    };

                    const id = await db.guardarPalabra(palabraObj);
                    if (id) {
                        await gestorFavoritos.añadirPalabra(id);
                        await gestorFavoritos.añadirPalabraAGrupo(id, nombreNivel);
                        await gestorFavoritos.añadirPalabraAGrupo(id, `📂 ${uiEspacio.GRUPO_USUARIO}`);
                        añadidos++;
                    }
                }
            }
        }

        return añadidos;
    }
}

// ============================================================
// EXPORTAR PARA USO GLOBAL
// ============================================================

window.UIEspacioActions = UIEspacioActions;
console.log('✅ UIEspacio Actions v1.6 - CORREGIDO: REFERENCIAS A UIEspacio');