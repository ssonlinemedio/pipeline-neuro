// ============================================================
// UI GRAMMAR v20.5 - CON TRANSCRIPCIÓN FONÉTICA (COMPLETO)
// ============================================================

class UIGrammar {
    constructor() {
        this._busquedaGramatica = '';
        this._familiaSeleccionada = '';
        this._paginaActual = 1;
        this._itemsPorPagina = 20;
        this._cargando = false;
        this._modoEstudio = 'flashcard';
        this._familiasGramaticales = new Set();
        this._idiomaActual = null;
        this._vistaActual = 'palabras';
        this._mostrarChat = false;
        this._mensajesChat = [];
        this._frasesConReglas = [];
        this._progresoGramatical = null;
        this._filtroRegla = '';
        this._filtroNivel = '';
        this._core = null;
        this._vigiaGramatical = null;
        this._NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        this._reglasTemplateGenerado = null;
        this._importandoReglas = false;
        this._paginaFamilias = 1;
        this._familiasPorPagina = 5;
        this._paginaPalabrasPorFamilia = {};
        this._palabrasPorPagina = 20;
        this._FAMILIAS_GRAMATICALES = [
            'sustantivo', 'verbo', 'adjetivo', 'adverbio',
            'preposición', 'conjunción', 'pronombre', 'determinante',
            'interjección', 'numeral', 'clasificador', 'partícula',
            'expresión', 'conector', 'verbo auxiliar', 'verbo modal'
        ];
        this._IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean'];
        this._buscarTimeout = null;
        this._idiomaNativo = 'es';
        this._cacheTranscripciones = {};
    }

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._IDIOMAS_JEROGLIFICOS.some(item => 
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
    }

    // ============================================================
    // OBTENER IDIOMA NATIVO
    // ============================================================

    async _obtenerIdiomaNativo() {
        try {
            const usuario = await db.getUsuario();
            if (usuario?.idiomaNativo) {
                this._idiomaNativo = usuario.idiomaNativo;
                return this._idiomaNativo;
            }
            const localData = localStorage.getItem('pipeline_usuario');
            if (localData) {
                const parsed = JSON.parse(localData);
                if (parsed?.idiomaNativo) {
                    this._idiomaNativo = parsed.idiomaNativo;
                    return this._idiomaNativo;
                }
            }
            return 'es';
        } catch (e) {
            return 'es';
        }
    }

    // ============================================================
    // OBTENER TRANSCRIPCIÓN PARA PALABRA
    // ============================================================

    async _obtenerTranscripcionPalabra(palabra) {
        if (!palabra) return '';
        
        const idioma = palabra.idioma || this._idiomaActual || 'es';
        const esJeroglifico = this._esJeroglifico(idioma);
        
        if (esJeroglifico) {
            return palabra.pinyin || '';
        }
        
        if (palabra.transcripcion) {
            return palabra.transcripcion;
        }
        
        const texto = palabra.palabra || palabra.hanzi || '';
        if (!texto) return '';
        
        const key = `${texto}_${idioma}_${this._idiomaNativo}`;
        if (this._cacheTranscripciones[key]) {
            return this._cacheTranscripciones[key];
        }
        
        if (window.vigia && window.vigia.enLinea && window.vigia._apiKeyValidada) {
            try {
                const transcripcion = await window.vigia.generarTranscripcionParaTexto(
                    texto,
                    idioma,
                    palabra.nivel || 'A1'
                );
                if (transcripcion) {
                    this._cacheTranscripciones[key] = transcripcion;
                    if (palabra.id) {
                        await db.update('palabras', { ...palabra, transcripcion: transcripcion });
                    }
                    return transcripcion;
                }
            } catch (e) {}
        }
        
        if (window.fonetica) {
            try {
                const transcripcion = await window.fonetica.obtenerTranscripcion(
                    texto,
                    idioma,
                    palabra.nivel || 'A1'
                );
                if (transcripcion) {
                    this._cacheTranscripciones[key] = transcripcion;
                    return transcripcion;
                }
            } catch (e) {}
        }
        
        return '';
    }

    // ============================================================
    // RENDERIZAR TRANSCRIPCIÓN
    // ============================================================

    _renderizarTranscripcion(transcripcion, esJeroglifico = false) {
        if (!transcripcion) return '';
        
        const icono = esJeroglifico ? '🔊' : '🎤';
        const bg = esJeroglifico ? 'var(--primary)08' : 'var(--secondary)08';
        const border = esJeroglifico ? 'var(--primary)30' : 'var(--secondary)30';
        const color = esJeroglifico ? 'var(--primary)' : 'var(--secondary)';
        
        return `
            <div style="
                font-size: 13px;
                color: ${color};
                margin-top: 2px;
                letter-spacing: 1px;
                font-weight: 400;
                padding: 2px 12px;
                background: ${bg};
                border-radius: 6px;
                display: inline-block;
                border: 1px solid ${border};
                font-family: var(--font);
            ">
                ${icono} ${transcripcion}
            </div>
        `;
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init(core) {
        this._core = core;
        await this._obtenerIdiomaNativo();
        
        window.addEventListener('idiomaCambiado', async () => {
            console.log('🔄 Gramática: Idioma cambiado, recargando...');
            this._idiomaActual = gestorIdiomas.getIdiomaActivo() || 'es';
            if (window.vigiaGramatical) {
                await window.vigiaGramatical.initGramatical();
            }
            setTimeout(() => {
                this._cargarGramatica();
            }, 300);
        });
        
        window.addEventListener('reglasTemplateGenerado', (e) => {
            this._reglasTemplateGenerado = e.detail.template;
            this._cargarGramatica();
        });
        
        window.addEventListener('reglasGramaticalesImportadas', () => {
            this._cargarGramatica();
            this._core?.mostrarToast('✅ Reglas gramaticales importadas correctamente', 'success');
        });
        
        window.addEventListener('vigiaGramaticalActualizado', (e) => {
            console.log('📚 Vigía Gramatical actualizado:', e.detail);
            if (this._vistaActual === 'frases' || this._vistaActual === 'chat') {
                setTimeout(() => this._cargarGramatica(), 500);
            }
        });
        
        if (window.vigiaGramatical) {
            this._vigiaGramatical = window.vigiaGramatical;
            await this._vigiaGramatical.initGramatical();
            this._progresoGramatical = this._vigiaGramatical.getEstadoGramatical();
        }
        
        try {
            const data = localStorage.getItem('pipeline_cache_transcripciones_grammar');
            if (data) {
                this._cacheTranscripciones = JSON.parse(data);
            }
        } catch (e) {}
        
        return this;
    }

    cargar(core) {
        this._core = core;
        this._idiomaActual = gestorIdiomas.getIdiomaActivo() || 'es';
        this._cargarGramatica();
    }

    // ============================================================
    // GUARDAR CACHÉ
    // ============================================================

    _guardarCache() {
        try {
            localStorage.setItem('pipeline_cache_transcripciones_grammar', 
                JSON.stringify(this._cacheTranscripciones));
        } catch (e) {}
    }

    // ============================================================
    // CARGA PRINCIPAL CON TRANSCRIPCIÓN
    // ============================================================

    async _cargarGramatica() {
        const container = document.getElementById('grammarContent');
        if (!container || this._cargando) return;
        this._cargando = true;
        
        const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
        this._idiomaActual = idioma;
        
        const [palabras, frasesConReglas, estadisticasGramaticales] = await Promise.all([
            db.obtenerPalabrasPorIdioma(idioma),
            db.obtenerFrasesConReglasGramaticales(idioma),
            this._vigiaGramatical ? this._vigiaGramatical.obtenerEstadisticasGramaticales(idioma) : null
        ]);
        
        this._frasesConReglas = frasesConReglas;
        this._progresoGramatical = this._vigiaGramatical ? this._vigiaGramatical.getEstadoGramatical() : null;
        
        let html = '';
        
        html += this._renderHeaderGramatical(idioma);
        html += this._renderProgresoGramatical(idioma, estadisticasGramaticales);
        html += this._renderTabsGramatical();
        
        if (this._vistaActual === 'palabras') {
            html += await this._renderVistaPalabras(palabras, idioma);
        } else if (this._vistaActual === 'frases') {
            html += await this._renderVistaFrases(frasesConReglas, idioma);
        } else if (this._vistaActual === 'chat') {
            html += this._renderVistaChatGramatical(idioma);
        } else if (this._vistaActual === 'reglas') {
            html += await this._renderCentroConocimiento(idioma);
        }
        
        container.innerHTML = html;
        this._configurarBusquedaGramatica();
        this._actualizarSelectFamilias();
        this._scrollToTop();
        this._cargando = false;
    }

    // ============================================================
    // VISTA PALABRAS CON TRANSCRIPCIÓN
    // ============================================================

    async _renderVistaPalabras(palabras, idioma) {
        const busqueda = this._busquedaGramatica.toLowerCase();
        const familiaFiltro = this._familiaSeleccionada;
        const esJeroglifico = this._esJeroglifico(idioma);
        
        let palabrasFiltradas = palabras;
        if (familiaFiltro) {
            palabrasFiltradas = palabrasFiltradas.filter(p => {
                const familia = p.familia || p.familiaGramatical || 'sin_clasificar';
                return familia === familiaFiltro;
            });
        }
        if (busqueda) {
            palabrasFiltradas = palabrasFiltradas.filter(p => {
                const texto = (p.palabra || p.hanzi || '').toLowerCase();
                const significado = (p.significado || '').toLowerCase();
                const pinyin = (p.pinyin || '').toLowerCase();
                const transcripcion = (p.transcripcion || '').toLowerCase();
                const familia = (p.familia || p.familiaGramatical || '').toLowerCase();
                return texto.includes(busqueda) || 
                       significado.includes(busqueda) || 
                       pinyin.includes(busqueda) ||
                       transcripcion.includes(busqueda) ||
                       familia.includes(busqueda);
            });
        }
        
        const grupos = {};
        for (const p of palabrasFiltradas) {
            const familia = p.familia || p.familiaGramatical || 'sin_clasificar';
            if (!grupos[familia]) grupos[familia] = [];
            grupos[familia].push(p);
        }
        
        const familiasOrdenadas = Object.keys(grupos).sort((a, b) => {
            if (a === 'sin_clasificar') return 1;
            if (b === 'sin_clasificar') return -1;
            return a.localeCompare(b);
        });

        const totalFamilias = familiasOrdenadas.length;
        const totalPaginasFamilias = Math.ceil(totalFamilias / this._familiasPorPagina);
        const paginaFamilias = Math.min(this._paginaFamilias, totalPaginasFamilias || 1);
        const inicioFamilias = (paginaFamilias - 1) * this._familiasPorPagina;
        const finFamilias = Math.min(inicioFamilias + this._familiasPorPagina, totalFamilias);
        const familiasPagina = familiasOrdenadas.slice(inicioFamilias, finFamilias);
        
        let html = `
            <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center;">
                <div style="flex:1;min-width:200px;position:relative;">
                    <i class="fas fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gray);"></i>
                    <input type="text" id="buscarGramatica" placeholder="🔍 Buscar palabras..." 
                           style="width:100%;padding:10px 14px 10px 38px;border:2px solid var(--light);border-radius:10px;font-size:14px;font-family:var(--font);"
                           value="${this._busquedaGramatica}">
                    ${this._busquedaGramatica ? `<span style="font-size:11px;color:var(--gray-light);margin-left:8px;">🔎 ${palabrasFiltradas.length} resultados</span>` : ''}
                </div>
                <select id="familiaSelect" style="padding:10px 14px;border:2px solid var(--light);border-radius:10px;font-size:14px;font-family:var(--font);background:var(--white);min-width:150px;">
                    <option value="">Todas las familias</option>
                </select>
                <button class="btn-secondary" onclick="window.UIGrammar._limpiarBusquedaGramatica()" style="padding:10px 16px;font-size:13px;background:var(--bg);border:1px solid var(--light);border-radius:8px;cursor:pointer;color:var(--gray);">
                    <i class="fas fa-times"></i> Limpiar
                </button>
                <button class="btn-secondary" onclick="window.UIGrammar._cargarGramatica()" style="padding:10px 16px;font-size:13px;background:var(--secondary);color:white;border:none;border-radius:8px;cursor:pointer;">
                    <i class="fas fa-sync"></i> Refrescar
                </button>
            </div>
            
            <div style="margin-bottom:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:10px;">
                <div style="background:var(--white);padding:12px 14px;border-radius:12px;box-shadow:var(--shadow);text-align:center;border-top:3px solid var(--primary);">
                    <span style="font-size:20px;font-weight:800;display:block;color:var(--primary);">${palabrasFiltradas.length}</span>
                    <span style="font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;">Palabras</span>
                </div>
                <div style="background:var(--white);padding:12px 14px;border-radius:12px;box-shadow:var(--shadow);text-align:center;border-top:3px solid var(--secondary);">
                    <span style="font-size:20px;font-weight:800;display:block;color:var(--secondary);">${familiasOrdenadas.length}</span>
                    <span style="font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;">Familias</span>
                </div>
                <div style="background:var(--white);padding:12px 14px;border-radius:12px;box-shadow:var(--shadow);text-align:center;border-top:3px solid var(--success);">
                    <span style="font-size:20px;font-weight:800;display:block;color:var(--success);">${this._calcularEficienciaGramatica(palabrasFiltradas)}%</span>
                    <span style="font-size:10px;color:var(--gray);font-weight:600;text-transform:uppercase;">Eficiencia</span>
                </div>
            </div>
            
            ${totalPaginasFamilias > 1 ? this._renderPaginadorFamilias(paginaFamilias, totalPaginasFamilias) : ''}
        `;
        
        if (familiasPagina.length === 0) {
            html += `
                <div style="text-align:center;padding:40px;color:var(--gray);">
                    <i class="fas fa-search" style="font-size:48px;color:var(--primary-light);display:block;margin-bottom:16px;"></i>
                    ${this._busquedaGramatica ? `<p>No se encontraron palabras con "<strong>${this._busquedaGramatica}</strong>" en ${idioma}.</p>` : `<p>No hay palabras en <strong>${idioma}</strong>.</p>`}
                    <p style="font-size:13px;">Importa palabras desde Mi Espacio o usa el generador JSON.</p>
                </div>
            `;
        } else {
            for (const familia of familiasPagina) {
                const palabrasGrupo = grupos[familia];
                const color = this._getColorFamiliaGramatical(familia);
                
                const totalPalabrasEnFamilia = palabrasGrupo.length;
                const totalPaginasPalabras = Math.ceil(totalPalabrasEnFamilia / this._palabrasPorPagina);
                if (!this._paginaPalabrasPorFamilia[familia]) {
                    this._paginaPalabrasPorFamilia[familia] = 1;
                }
                const paginaPalabras = Math.min(this._paginaPalabrasPorFamilia[familia], totalPaginasPalabras || 1);
                const inicioPalabras = (paginaPalabras - 1) * this._palabrasPorPagina;
                const finPalabras = Math.min(inicioPalabras + this._palabrasPorPagina, totalPalabrasEnFamilia);
                const palabrasPagina = palabrasGrupo.slice(inicioPalabras, finPalabras);
                
                html += `
                    <div class="grammar-group" style="border-left:4px solid ${color};margin-bottom:12px;padding:12px 16px;background:var(--white);border-radius:8px;box-shadow:var(--shadow);transition:all 0.3s;">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span style="font-size:18px;font-weight:700;color:${color};text-transform:uppercase;">${familia}</span>
                                <span style="font-size:11px;color:var(--gray-light);">(${totalPalabrasEnFamilia} palabras)</span>
                                ${totalPaginasPalabras > 1 ? `<span style="font-size:11px;color:var(--gray-light);">· Página ${paginaPalabras}/${totalPaginasPalabras}</span>` : ''}
                            </div>
                            <div style="display:flex;gap:8px;">
                                <button class="btn-secondary" onclick="window.UIGrammar._estudiarFamilia('${familia.replace(/'/g, "\\'")}')" style="padding:4px 12px;font-size:11px;">
                                    <i class="fas fa-play"></i> Estudiar
                                </button>
                                ${totalPaginasPalabras > 1 ? `
                                    <button class="btn-secondary" onclick="window.UIGrammar._irPaginaPalabrasFamilia('${familia.replace(/'/g, "\\'")}', ${paginaPalabras - 1})" style="padding:4px 8px;font-size:11px;${paginaPalabras <= 1 ? 'opacity:0.5;cursor:default;' : ''}" ${paginaPalabras <= 1 ? 'disabled' : ''}>
                                        <i class="fas fa-chevron-left"></i>
                                    </button>
                                    <button class="btn-secondary" onclick="window.UIGrammar._irPaginaPalabrasFamilia('${familia.replace(/'/g, "\\'")}', ${paginaPalabras + 1})" style="padding:4px 8px;font-size:11px;${paginaPalabras >= totalPaginasPalabras ? 'opacity:0.5;cursor:default;' : ''}" ${paginaPalabras >= totalPaginasPalabras ? 'disabled' : ''}>
                                        <i class="fas fa-chevron-right"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                `;
                
                for (const p of palabrasPagina) {
                    const texto = p.hanzi || p.palabra || '';
                    const pinyin = p.pinyin || '';
                    const transcripcion = await this._obtenerTranscripcionPalabra(p);
                    const neuroScore = p.neuroScore || 0.5;
                    const colorPalabra = neuroScore > 0.7 ? 'var(--success)' : neuroScore > 0.4 ? 'var(--warning)' : 'var(--danger)';
                    
                    if (esJeroglifico && texto) {
                        html += `
                            <span style="display:inline-flex;flex-direction:column;align-items:center;padding:4px 12px;border-radius:16px;background:${colorPalabra}15;border:1px solid ${colorPalabra}30;font-size:13px;cursor:pointer;transition:all 0.2s;" 
                                onclick="window.UIGrammar._ejercicioPalabra('${texto.replace(/'/g, "\\'")}', '${familia.replace(/'/g, "\\'")}', '${(p.significado || '').replace(/'/g, "\\'")}')"
                                onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                                <span style="font-size:18px;font-weight:700;">${texto}</span>
                                ${pinyin ? `<span style="font-size:11px;color:var(--gray-light);letter-spacing:1px;">${pinyin}</span>` : '<span style="font-size:9px;color:var(--danger);">⚠️</span>'}
                                <span style="font-size:10px;color:var(--gray-light);">${p.significado || ''}</span>
                            </span>
                        `;
                    } else {
                        html += `
                            <span style="display:inline-flex;flex-direction:column;align-items:center;padding:4px 12px;border-radius:16px;background:${colorPalabra}15;border:1px solid ${colorPalabra}30;font-size:13px;cursor:pointer;transition:all 0.2s;" 
                                onclick="window.UIGrammar._ejercicioPalabra('${texto.replace(/'/g, "\\'")}', '${familia.replace(/'/g, "\\'")}', '${(p.significado || '').replace(/'/g, "\\'")}')"
                                onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='none'">
                                <span style="font-size:16px;font-weight:600;">${texto}</span>
                                ${transcripcion ? `<span style="font-size:10px;color:var(--gray-light);">🎤 ${transcripcion}</span>` : ''}
                                ${pinyin ? `<span style="font-size:10px;color:var(--gray-light);">${pinyin}</span>` : ''}
                            </span>
                        `;
                    }
                }
                
                html += `
                        </div>
                        ${totalPaginasPalabras > 1 ? `
                            <div style="display:flex;justify-content:center;margin-top:6px;gap:6px;">
                                <button class="btn-secondary" onclick="window.UIGrammar._irPaginaPalabrasFamilia('${familia.replace(/'/g, "\\'")}', ${paginaPalabras - 1})" style="padding:2px 10px;font-size:10px;${paginaPalabras <= 1 ? 'opacity:0.5;cursor:default;' : ''}" ${paginaPalabras <= 1 ? 'disabled' : ''}>
                                    <i class="fas fa-chevron-left"></i> Anterior
                                </button>
                                <span style="font-size:11px;color:var(--gray);">${paginaPalabras} / ${totalPaginasPalabras}</span>
                                <button class="btn-secondary" onclick="window.UIGrammar._irPaginaPalabrasFamilia('${familia.replace(/'/g, "\\'")}', ${paginaPalabras + 1})" style="padding:2px 10px;font-size:10px;${paginaPalabras >= totalPaginasPalabras ? 'opacity:0.5;cursor:default;' : ''}" ${paginaPalabras >= totalPaginasPalabras ? 'disabled' : ''}>
                                    Siguiente <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        }
        
        return html;
    }

    // ============================================================
    // VISTA FRASES CON TRANSCRIPCIÓN
    // ============================================================

    async _renderVistaFrases(frases, idioma) {
        if (!frases || frases.length === 0) {
            return `
                <div style="text-align:center;padding:40px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">
                    <i class="fas fa-book" style="font-size:48px;color:var(--primary-light);display:block;margin-bottom:16px;"></i>
                    <p style="font-size:16px;font-weight:500;">No hay frases con reglas gramaticales en ${this._getNombreIdioma(idioma)}</p>
                    <p style="font-size:13px;color:var(--gray-light);">Importa temas o historias con explicaciones gramaticales.</p>
                    <button class="btn-primary" onclick="window.UIGrammar._forzarActualizacionGramatical()" style="margin-top:12px;">
                        <i class="fas fa-sync"></i> Actualizar desde Vigía
                    </button>
                </div>
            `;
        }
        
        const esJeroglifico = this._esJeroglifico(idioma);
        const idiomaNativo = await this._obtenerIdiomaNativo();
        
        const agrupadas = {};
        for (const f of frases) {
            const nivel = f.nivel || 'A1';
            const tipo = f.tipoRegla || 'general';
            const key = `${nivel}|${tipo}`;
            if (!agrupadas[key]) agrupadas[key] = { nivel, tipo, frases: [] };
            agrupadas[key].frases.push(f);
        }
        
        const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const keysOrdenadas = Object.keys(agrupadas).sort((a, b) => {
            const [nivelA] = a.split('|');
            const [nivelB] = b.split('|');
            return niveles.indexOf(nivelA) - niveles.indexOf(nivelB);
        });
        
        let html = `
            <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center;">
                <select id="filtroNivelGramatical" style="padding:8px 14px;border:2px solid var(--light);border-radius:8px;font-size:13px;font-family:var(--font);background:var(--white);">
                    <option value="">📚 Todos los niveles</option>
                    ${niveles.map(n => `<option value="${n}">${n}</option>`).join('')}
                </select>
                <select id="filtroReglaGramatical" style="padding:8px 14px;border:2px solid var(--light);border-radius:8px;font-size:13px;font-family:var(--font);background:var(--white);">
                    <option value="">📂 Todas las reglas</option>
                    ${[...new Set(frases.map(f => f.tipoRegla || 'general'))].map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
                <span style="font-size:12px;color:var(--gray-light);">${frases.length} frases con reglas</span>
            </div>
        `;
        
        for (const key of keysOrdenadas) {
            const { nivel, tipo, frases: frasesGrupo } = agrupadas[key];
            const esNivelActual = nivel === (gestorIdiomas?.getInfoActivo()?.nivel || 'A1');
            
            html += `
                <div style="margin-bottom:16px;background:var(--white);border-radius:12px;padding:14px 16px;box-shadow:var(--shadow);border-left:4px solid ${esNivelActual ? 'var(--primary)' : 'var(--light)'};">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:4px;">
                        <h4 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">
                            📚 Nivel ${nivel} ${esNivelActual ? '🎯' : ''}
                            <span style="font-size:12px;font-weight:400;color:var(--gray);">· ${tipo}</span>
                            <span style="font-size:11px;font-weight:400;color:var(--gray-light);">(${frasesGrupo.length} frases)</span>
                        </h4>
                        <button class="btn-secondary" onclick="window.UIGrammar._estudiarFrasesNivelRegla('${nivel}', '${tipo}')" style="padding:4px 12px;font-size:11px;">
                            <i class="fas fa-play"></i> Estudiar
                        </button>
                    </div>
                    
                    <div style="display:flex;flex-direction:column;gap:8px;">
            `;
            
            for (const f of frasesGrupo) {
                const regla = f.reglaGramatical || 'Sin regla especificada';
                const explicacion = f.explicacionGramatical || 'Explicación no disponible';
                const esJeroglificoFrase = f.esJeroglifico || esJeroglifico;
                const fraseId = f.id || f._id || f.fraseId;
                
                let transcripcion = '';
                if (esJeroglificoFrase) {
                    transcripcion = f.pinyinCompleto || f.segmentacion?.pinyin || '';
                } else {
                    if (f.transcripcion) {
                        transcripcion = f.transcripcion;
                    } else if (window.vigia && window.vigia.enLinea) {
                        try {
                            transcripcion = await window.vigia.generarTranscripcionParaTexto(
                                f.original,
                                idioma,
                                f.nivel || 'A1'
                            );
                            if (transcripcion && f.id) {
                                await db.update('frases', { ...f, transcripcion: transcripcion });
                            }
                        } catch (e) {}
                    }
                }
                
                html += `
                    <div style="background:var(--bg);border-radius:8px;padding:12px 14px;border:1px solid var(--light);">
                        <div style="display:flex;flex-wrap:wrap;gap:8px;">
                            <div style="flex:1;min-width:200px;">
                                <div style="font-size:16px;font-weight:600;color:var(--dark);">
                                    ${esJeroglificoFrase ? (f.segmentacion?.hanzi || f.original) : f.original}
                                    ${transcripcion ? `
                                        <span style="font-size:13px;color:${esJeroglificoFrase ? 'var(--primary)' : 'var(--secondary)'};margin-left:8px;letter-spacing:1px;font-weight:400;">
                                            ${esJeroglificoFrase ? '🔊' : '🎤'} ${transcripcion}
                                        </span>
                                    ` : ''}
                                    ${esJeroglificoFrase && !transcripcion ? `<span style="font-size:10px;color:var(--danger);margin-left:8px;">⚠️ Sin pinyin</span>` : ''}
                                </div>
                                <div style="font-size:14px;color:var(--gray);">→ ${f.traduccion}</div>
                            </div>
                            <div style="display:flex;gap:4px;flex-wrap:wrap;">
                                <button class="btn-secondary" onclick="window.UIGrammar._verExplicacionGramatical(${fraseId})" style="padding:3px 12px;font-size:10px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                    <i class="fas fa-book-open"></i> Regla
                                </button>
                                <button class="btn-secondary" onclick="window.UIGrammar._estudiarFrasesNivelRegla('${nivel}', '${tipo}')" style="padding:3px 12px;font-size:10px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                        </div>
                        <div style="font-size:11px;color:var(--gray-light);margin-top:4px;padding:4px 8px;background:var(--white);border-radius:4px;">
                            🔍 <strong>${regla}</strong>
                            <span style="margin-left:8px;">💡 ${explicacion.substring(0, 80)}${explicacion.length > 80 ? '...' : ''}</span>
                        </div>
                    </div>
                `;
            }
            
            html += `</div></div>`;
        }
        
        return html;
    }

    // ============================================================
    // MÉTODOS AUXILIARES (MANTENIDOS)
    // ============================================================

    _renderHeaderGramatical(idioma) {
        const nombreIdioma = this._getNombreIdioma(idioma);
        const estadoVigia = this._vigiaGramatical?.enLinea ? '🟢 Online' : '🔴 Offline';
        const idiomaNativo = this._idiomaNativo;
        
        return `
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px;padding:12px 16px;background:var(--white);border-radius:12px;box-shadow:var(--shadow);">
                <div>
                    <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">📚 Gramática</h2>
                    <span style="font-size:13px;color:var(--gray);">${nombreIdioma} · ${idioma}</span>
                    <span style="font-size:12px;color:var(--gray-light);margin-left:8px;">${estadoVigia}</span>
                    <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">🎤 ${this._getNombreIdioma(idiomaNativo)}</span>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn-primary" onclick="window.UIGrammar._forzarActualizacionGramatical()" style="padding:6px 14px;font-size:12px;">
                        <i class="fas fa-sync"></i> Actualizar Vigía
                    </button>
                    <button class="btn-secondary" onclick="window.UIGrammar._cambiarVista('reglas')" style="padding:6px 14px;font-size:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:6px;cursor:pointer;">
                        <i class="fas fa-brain"></i> Centro de Conocimiento
                    </button>
                </div>
            </div>
        `;
    }

    _renderProgresoGramatical(idioma, estadisticas) {
        if (!this._progresoGramatical) {
            return `
                <div style="padding:16px;background:var(--bg);border-radius:12px;margin-bottom:16px;text-align:center;border:2px dashed var(--light);">
                    <p style="color:var(--gray);">🔄 Inicializando Vigía Gramatical...</p>
                </div>
            `;
        }
        
        const edad = this._progresoGramatical.edad || 0;
        const edadNombre = this._progresoGramatical.edadNombre || '👶 Bebé';
        const edadEmoji = this._progresoGramatical.edadEmoji || '👶';
        const edadDescripcion = this._progresoGramatical.edadDescripcion || 'Aprendiendo el idioma';
        const nivelUsuario = gestorIdiomas?.getInfoActivo()?.nivel || 'A1';
        const reglasDominadas = estadisticas?.reglasDominadas || 0;
        const reglasAprendiendo = estadisticas?.reglasAprendiendo || 0;
        const totalReglas = estadisticas?.totalReglas || 0;
        
        return `
            <div style="background:linear-gradient(135deg, var(--primary)08, var(--secondary)08);border-radius:12px;padding:16px 20px;margin-bottom:16px;border:1px solid var(--primary)20;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:36px;">${edadEmoji}</span>
                        <div>
                            <h3 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">Vigía Gramatical</h3>
                            <span style="font-size:14px;color:var(--primary);font-weight:600;">${edadNombre}</span>
                            <span style="font-size:12px;color:var(--gray-light);margin-left:8px;">${edadDescripcion}</span>
                        </div>
                    </div>
                    <div style="text-align:right;font-size:12px;color:var(--gray);">
                        <span>📚 ${reglasDominadas} dominadas</span>
                        <span style="margin-left:8px;">📖 ${reglasAprendiendo} aprendiendo</span>
                        <span style="margin-left:8px;">⏳ ${Math.max(0, totalReglas - reglasDominadas - reglasAprendiendo)} pendientes</span>
                    </div>
                </div>
                
                <div style="position:relative;height:24px;background:var(--bg);border-radius:12px;overflow:hidden;margin-top:4px;">
                    <div style="height:100%;width:${Math.min(100, edad)}%;background:linear-gradient(90deg, #6C5CE7, #00CEC9, #00B894);border-radius:12px;transition:width 1s ease;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;font-size:11px;font-weight:700;color:white;">
                        ${Math.round(edad)}%
                    </div>
                </div>
                
                <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--gray-light);margin-top:2px;">
                    <span>👶 A1</span>
                    <span>🧒 A2</span>
                    <span>🧑 B1</span>
                    <span>🧑‍🏫 B2</span>
                    <span>👨‍🏫 C1</span>
                    <span>🧙 C2</span>
                </div>
                
                <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap;font-size:11px;color:var(--gray);">
                    <span>🌍 ${this._getNombreIdioma(idioma)}</span>
                    <span>🎯 Nivel usuario: ${nivelUsuario}</span>
                    <span>🧠 Vigía está en: ${this._getNivelDesdeEdad(edad)}</span>
                    <span>💡 ${this._vigiaGramatical?.enLinea ? '🟢 Conectado' : '🔴 Offline'}</span>
                </div>
            </div>
        `;
    }

    _getNivelDesdeEdad(edad) {
        if (edad >= 90) return 'C2';
        if (edad >= 75) return 'C1';
        if (edad >= 60) return 'B2';
        if (edad >= 45) return 'B1';
        if (edad >= 30) return 'A2';
        return 'A1';
    }

    _renderTabsGramatical() {
        const tabs = [
            { id: 'palabras', icono: '📝', label: 'Palabras' },
            { id: 'frases', icono: '📖', label: 'Frases con Reglas' },
            { id: 'chat', icono: '💬', label: 'Chat Gramatical' },
            { id: 'reglas', icono: '🧠', label: 'Centro de Conocimiento' }
        ];
        
        return `
            <div style="display:flex;gap:4px;margin-bottom:16px;border-bottom:2px solid var(--light);padding-bottom:8px;flex-wrap:wrap;">
                ${tabs.map(tab => `
                    <button class="grammar-tab ${this._vistaActual === tab.id ? 'active' : ''}" 
                            onclick="window.UIGrammar._cambiarVista('${tab.id}')"
                            style="padding:8px 20px;border:none;border-radius:8px 8px 0 0;cursor:pointer;font-size:13px;font-weight:600;font-family:var(--font);transition:all 0.3s;${this._vistaActual === tab.id ? 'background:var(--primary);color:white;' : 'background:transparent;color:var(--gray);'}">
                        ${tab.icono} ${tab.label}
                        ${tab.id === 'frases' ? `<span style="font-size:10px;background:var(--primary);color:white;padding:1px 8px;border-radius:10px;margin-left:4px;">${this._frasesConReglas?.length || 0}</span>` : ''}
                    </button>
                `).join('')}
            </div>
        `;
    }

    _cambiarVista(vista) {
        this._vistaActual = vista;
        this._paginaActual = 1;
        this._paginaFamilias = 1;
        this._cargarGramatica();
    }

    // ============================================================
    // CONFIGURAR BÚSQUEDA DINÁMICA
    // ============================================================

    _configurarBusquedaGramatica() {
        const input = document.getElementById('buscarGramatica');
        if (input) {
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            newInput.addEventListener('input', () => {
                if (this._buscarTimeout) {
                    clearTimeout(this._buscarTimeout);
                }
                this._buscarTimeout = setTimeout(() => {
                    this._busquedaGramatica = newInput.value.trim();
                    this._paginaActual = 1;
                    this._cargarGramatica();
                    this._buscarTimeout = null;
                }, 300);
            });
            
            newInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (this._buscarTimeout) {
                        clearTimeout(this._buscarTimeout);
                        this._buscarTimeout = null;
                    }
                    this._busquedaGramatica = newInput.value.trim();
                    this._paginaActual = 1;
                    this._cargarGramatica();
                }
            });
        }
        
        const familiaSelect = document.getElementById('familiaSelect');
        if (familiaSelect) {
            const newSelect = familiaSelect.cloneNode(true);
            familiaSelect.parentNode.replaceChild(newSelect, familiaSelect);
            
            newSelect.addEventListener('change', () => {
                this._familiaSeleccionada = newSelect.value;
                this._paginaActual = 1;
                this._cargarGramatica();
            });
        }
        
        const reglaSelect = document.getElementById('filtroReglaGramatical');
        if (reglaSelect) {
            const newSelect = reglaSelect.cloneNode(true);
            reglaSelect.parentNode.replaceChild(newSelect, reglaSelect);
            
            newSelect.addEventListener('change', () => {
                this._filtroRegla = newSelect.value;
                this._paginaActual = 1;
                this._cargarGramatica();
            });
        }
        
        const nivelSelect = document.getElementById('filtroNivelGramatical');
        if (nivelSelect) {
            const newSelect = nivelSelect.cloneNode(true);
            nivelSelect.parentNode.replaceChild(newSelect, nivelSelect);
            
            newSelect.addEventListener('change', () => {
                this._filtroNivel = newSelect.value;
                this._paginaActual = 1;
                this._cargarGramatica();
            });
        }
    }

    _limpiarBusquedaGramatica() {
        this._busquedaGramatica = '';
        this._paginaActual = 1;
        const input = document.getElementById('buscarGramatica');
        if (input) input.value = '';
        this._cargarGramatica();
    }

    // ============================================================
    // MÉTODOS DE CHAT GRAMATICAL
    // ============================================================

    _renderVistaChatGramatical(idioma) {
        const estado = this._vigiaGramatical?.getEstadoGramatical();
        const mensajesHtml = this._mensajesChat.map(msg => `
            <div style="margin-bottom:8px;padding:10px 14px;border-radius:10px;background: ${msg.rol === 'usuario' ? 'var(--primary)10' : 'var(--bg)'};border-left: 3px solid ${msg.rol === 'usuario' ? 'var(--primary)' : 'var(--secondary)'};align-self: ${msg.rol === 'usuario' ? 'flex-end' : 'flex-start'};max-width: 85%;">
                <div style="font-size:13px;color:var(--gray);font-weight:600;margin-bottom:2px;">${msg.rol === 'usuario' ? '👤 Tú' : '📚 Vigía Gramatical'}</div>
                <div style="font-size:14px;color:var(--dark);white-space:pre-wrap;">${msg.texto}</div>
            </div>
        `).join('');
        
        const edadEmoji = estado?.edadEmoji || '📚';
        const edadNombre = estado?.edadNombre || 'Bebé';
        const edad = estado?.edad || 0;
        
        return `
            <div style="background:var(--white);border-radius:12px;padding:16px;box-shadow:var(--shadow);border:2px solid var(--primary)20;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:28px;">${edadEmoji}</span>
                        <div>
                            <h4 style="font-size:16px;font-weight:700;color:var(--dark);margin:0;">Vigía Gramatical</h4>
                            <span style="font-size:12px;color:var(--gray);">${edadNombre} · ${Math.round(edad)}% de conocimiento</span>
                            <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">${idioma}</span>
                        </div>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-secondary" onclick="window.UIGrammar._limpiarChatGramatical()" style="padding:4px 12px;font-size:11px;">
                            <i class="fas fa-eraser"></i> Limpiar
                        </button>
                        <button class="btn-secondary" onclick="window.UIGrammar._sugerirPreguntaGramatical()" style="padding:4px 12px;font-size:11px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-lightbulb"></i> Sugerir
                        </button>
                    </div>
                </div>
                
                <div style="background:var(--bg);border-radius:8px;padding:12px;height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;margin-bottom:12px;" id="chatGramaticalMessages">
                    ${mensajesHtml || `
                        <div style="color:var(--gray-light);text-align:center;padding:30px 0;">
                            💬 Pregúntame sobre gramática de <strong>${this._getNombreIdioma(idioma)}</strong>
                            <br>
                            <span style="font-size:12px;">Ej: "¿Cómo se forma el pretérito perfecto?"</span>
                        </div>
                    `}
                </div>
                
                <div style="display:flex;gap:10px;">
                    <input type="text" id="chatGramaticalInput" 
                           placeholder="Pregunta sobre gramática..." 
                           style="flex:1;padding:10px 14px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);"
                           onkeydown="if(event.key==='Enter') window.UIGrammar._enviarMensajeGramatical()">
                    <button class="btn-primary" onclick="window.UIGrammar._enviarMensajeGramatical()" style="padding:10px 20px;font-size:14px;width:auto;">
                        <i class="fas fa-paper-plane"></i> Enviar
                    </button>
                </div>
                
                <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;font-size:11px;color:var(--gray-light);">
                    <span>💡 Preguntas sugeridas:</span>
                    <button class="btn-secondary" onclick="window.UIGrammar._preguntaRapidaGramatical('¿Cómo se forma el pretérito perfecto?')" style="padding:2px 10px;font-size:10px;background:transparent;border:1px solid var(--light);border-radius:12px;cursor:pointer;">
                        Pretérito perfecto
                    </button>
                    <button class="btn-secondary" onclick="window.UIGrammar._preguntaRapidaGramatical('¿Cuándo se usa el subjuntivo?')" style="padding:2px 10px;font-size:10px;background:transparent;border:1px solid var(--light);border-radius:12px;cursor:pointer;">
                        Subjuntivo
                    </button>
                    <button class="btn-secondary" onclick="window.UIGrammar._preguntaRapidaGramatical('Analiza esta frase: ${this._frasesConReglas?.[0]?.original || '...'}')" style="padding:2px 10px;font-size:10px;background:transparent;border:1px solid var(--light);border-radius:12px;cursor:pointer;">
                        Analizar frase
                    </button>
                </div>
            </div>
        `;
    }

    async _enviarMensajeGramatical() {
        const input = document.getElementById('chatGramaticalInput');
        if (!input || !input.value.trim()) return;
        
        const mensaje = input.value.trim();
        input.value = '';
        
        this._mensajesChat.push({ rol: 'usuario', texto: mensaje });
        this._renderChatMessages();
        
        this._mensajesChat.push({ rol: 'vigia', texto: '✍️ Pensando...' });
        this._renderChatMessages();
        
        try {
            let respuesta;
            
            if (mensaje.toLowerCase().includes('analiza') || mensaje.toLowerCase().includes('frase')) {
                const fraseMatch = mensaje.match(/["']([^"']+)["']/);
                if (fraseMatch && fraseMatch[1]) {
                    const analisis = await this._vigiaGramatical.analizarFraseGramatical(fraseMatch[1]);
                    respuesta = analisis.mensaje || 'No pude analizar esa frase.';
                } else {
                    respuesta = await this._vigiaGramatical.chatGramatical(mensaje);
                }
            } else {
                respuesta = await this._vigiaGramatical.chatGramatical(mensaje);
            }
            
            const idx = this._mensajesChat.length - 1;
            this._mensajesChat[idx] = { rol: 'vigia', texto: respuesta };
            this._renderChatMessages();
        } catch (error) {
            console.error('❌ Error en chat gramatical:', error);
            const idx = this._mensajesChat.length - 1;
            this._mensajesChat[idx] = { 
                rol: 'vigia', 
                texto: '❌ Lo siento, hubo un error al procesar tu pregunta. Inténtalo de nuevo.' 
            };
            this._renderChatMessages();
        }
    }

    _renderChatMessages() {
        const container = document.getElementById('chatGramaticalMessages');
        if (!container) return;
        
        container.innerHTML = this._mensajesChat.map(msg => `
            <div style="margin-bottom:8px;padding:10px 14px;border-radius:10px;background: ${msg.rol === 'usuario' ? 'var(--primary)10' : 'var(--bg)'};border-left: 3px solid ${msg.rol === 'usuario' ? 'var(--primary)' : 'var(--secondary)'};align-self: ${msg.rol === 'usuario' ? 'flex-end' : 'flex-start'};max-width: 85%;${msg.texto.includes('✍️') ? 'opacity:0.7;' : ''}">
                <div style="font-size:13px;color:var(--gray);font-weight:600;margin-bottom:2px;">${msg.rol === 'usuario' ? '👤 Tú' : '📚 Vigía Gramatical'}</div>
                <div style="font-size:14px;color:var(--dark);white-space:pre-wrap;">${msg.texto}</div>
            </div>
        `).join('');
        
        container.scrollTop = container.scrollHeight;
    }

    _limpiarChatGramatical() {
        this._mensajesChat = [];
        this._renderChatMessages();
    }

    _preguntaRapidaGramatical(pregunta) {
        const input = document.getElementById('chatGramaticalInput');
        if (input) {
            input.value = pregunta;
            input.focus();
        }
    }

    _sugerirPreguntaGramatical() {
        const sugerencias = [
            '¿Cómo se forma el pretérito perfecto?',
            '¿Cuándo se usa el subjuntivo?',
            'Explica la concordancia de género en español',
            '¿Cómo se forman los comparativos?',
            'Analiza esta frase: "' + (this._frasesConReglas?.[0]?.original || 'El perro come') + '"'
        ];
        const sugerencia = sugerencias[Math.floor(Math.random() * sugerencias.length)];
        this._preguntaRapidaGramatical(sugerencia);
    }

    // ============================================================
    // VER EXPLICACIÓN GRAMATICAL
    // ============================================================

    async _verExplicacionGramatical(fraseId) {
        let frase = null;
        
        try {
            frase = await db.get('frases', fraseId);
        } catch (e) {
            console.warn('⚠️ Error obteniendo frase de DB:', e);
        }
        
        if (!frase && this._frasesConReglas) {
            frase = this._frasesConReglas.find(f => f.id === fraseId || f._id === fraseId || f.fraseId === fraseId);
        }
        
        if (!frase) {
            try {
                const todasFrases = await db.obtenerFrases();
                frase = todasFrases.find(f => f.id === fraseId);
            } catch (e) {
                console.warn('⚠️ Error buscando frase en todas las frases:', e);
            }
        }
        
        if (!frase) {
            this._core?.mostrarToast('❌ Frase no encontrada. Intenta refrescar la página.', 'error');
            return;
        }
        
        const esJeroglifico = frase.esJeroglifico || this._esJeroglifico(frase.idioma);
        const regla = frase.reglaGramatical || 'Sin regla especificada';
        const explicacion = frase.explicacionGramatical || 'Explicación no disponible';
        const tipo = frase.tipoRegla || 'general';
        const nivel = frase.nivel || 'A1';
        const pinyin = frase.pinyinCompleto || frase.segmentacion?.pinyin || '';
        const hanzi = frase.segmentacion?.hanzi || frase.original;
        const transcripcion = frase.transcripcion || '';
        
        let mensaje = `📖 **Análisis Gramatical**\n\n`;
        
        if (esJeroglifico && hanzi) {
            mensaje += `🔍 **Frase:** "${hanzi}"\n`;
            if (pinyin) {
                mensaje += `🔊 **Pinyin:** ${pinyin}\n`;
            } else {
                mensaje += `⚠️ **Pinyin no disponible**\n`;
            }
        } else {
            mensaje += `🔍 **Frase:** "${frase.original}"\n`;
            if (transcripcion) {
                mensaje += `🎤 **Fonética:** ${transcripcion}\n`;
            }
        }
        
        mensaje += `📝 **Traducción:** ${frase.traduccion}\n\n`;
        mensaje += `📚 **Regla:** ${regla}\n`;
        mensaje += `📂 **Tipo:** ${tipo}\n`;
        mensaje += `🎯 **Nivel:** ${nivel}\n\n`;
        mensaje += `💡 **Explicación:**\n${explicacion}\n\n`;
        
        if (frase.ejemplos) {
            mensaje += `📌 **Ejemplos:**\n${frase.ejemplos.join('\n')}`;
        }
        
        this._core?.alert(mensaje, '📖 Explicación Gramatical');
    }

    // ============================================================
    // ESTUDIAR FRASES POR NIVEL Y REGLA
    // ============================================================

    async _estudiarFrasesNivelRegla(nivel, tipo) {
        const idioma = gestorIdiomas.getIdiomaActivo() || 'es';
        const frases = await db.getFrasesPorNivelYRegla(idioma, nivel, tipo);
        
        if (frases.length === 0) {
            this._core?.mostrarToast('❌ No hay frases con ese criterio', 'error');
            return;
        }
        
        pipeline.frases = frases;
        pipeline.indiceFrase = 0;
        await pipeline.cargarFrase(0);
        this._core?.irAModulo('study');
        this._core?.mostrarToast(`📖 Estudiando ${frases.length} frases de ${nivel} · ${tipo}`, 'success');
    }

    // ============================================================
    // ESTUDIAR FAMILIA
    // ============================================================

    async _estudiarFamilia(familia) {
        if (!familia) {
            this._core?.mostrarToast('❌ Familia no especificada', 'error');
            return;
        }
        
        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        const todasPalabras = await db.obtenerPalabrasPorIdioma(idiomaActivo);
        const palabras = todasPalabras.filter(p => {
            const fam = p.familia || p.familiaGramatical || 'sin_clasificar';
            return fam === familia;
        });
        
        if (!palabras || palabras.length === 0) {
            this._core?.mostrarToast('❌ No hay palabras en esta familia en ' + idiomaActivo, 'error');
            return;
        }
        
        this._core?.mostrarToast('📚 Preparando estudio para ' + palabras.length + ' palabras de ' + familia, 'info');
        
        const textos = palabras.map(p => p.palabra || p.hanzi || '').filter(t => t !== '');
        const todasFrases = await db.obtenerFrasesPorIdioma(idiomaActivo);
        const frasesEncontradas = [];
        
        for (const f of todasFrases) {
            const originalLower = (f.original || '').toLowerCase();
            for (const texto of textos) {
                if (originalLower.includes(texto.toLowerCase())) {
                    frasesEncontradas.push(f);
                    break;
                }
            }
        }
        
        if (frasesEncontradas.length === 0) {
            this._core?.mostrarToast('❌ No hay frases con estas palabras', 'error');
            return;
        }
        
        pipeline.frases = frasesEncontradas;
        pipeline.indiceFrase = 0;
        await pipeline.cargarFrase(0);
        this._core?.irAModulo('study');
        this._core?.mostrarToast(`📖 Estudiando ${frasesEncontradas.length} frases de ${familia}`, 'success');
    }

    // ============================================================
    // EJERCICIO DE PALABRA
    // ============================================================

    async _ejercicioPalabra(texto, familia, significado) {
        if (!texto) {
            this._core?.mostrarToast('❌ Palabra no válida', 'error');
            return;
        }
        
        this._core?.mostrarToast(`🔍 Buscando frases con "${texto}"...`, 'info');
        
        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        const todasFrases = await db.obtenerFrasesPorIdioma(idiomaActivo);
        const frasesConPalabra = todasFrases.filter(f => {
            const originalLower = (f.original || '').toLowerCase();
            return originalLower.includes(texto.toLowerCase());
        });
        
        if (frasesConPalabra.length === 0) {
            this._core?.mostrarToast(`❌ No hay frases con "${texto}"`, 'error');
            return;
        }
        
        let mensaje = `📖 Frases con "${texto}":\n\n`;
        for (let i = 0; i < Math.min(frasesConPalabra.length, 5); i++) {
            const f = frasesConPalabra[i];
            const esJeroglifico = f.esJeroglifico || this._esJeroglifico(f.idioma);
            const hanzi = f.segmentacion?.hanzi || f.original;
            const pinyin = f.pinyinCompleto || f.segmentacion?.pinyin || '';
            const transcripcion = f.transcripcion || '';
            
            if (esJeroglifico && hanzi) {
                mensaje += `• ${hanzi}`;
                if (pinyin) mensaje += ` (${pinyin})`;
                mensaje += `\n  → ${f.traduccion}\n\n`;
            } else {
                mensaje += `• ${f.original}`;
                if (transcripcion) mensaje += ` (${transcripcion})`;
                mensaje += `\n  → ${f.traduccion}\n\n`;
            }
        }
        if (frasesConPalabra.length > 5) {
            mensaje += `... y ${frasesConPalabra.length - 5} más.`;
        }
        
        mensaje += `\n\n¿Quieres estudiar estas frases?`;
        
        const estudiar = await this._core?.confirm(mensaje, `📖 Frases con "${texto}"`);
        if (estudiar) {
            pipeline.frases = frasesConPalabra;
            pipeline.indiceFrase = 0;
            await pipeline.cargarFrase(0);
            this._core?.irAModulo('study');
            this._core?.mostrarToast(`📖 Estudiando ${frasesConPalabra.length} frases con "${texto}"`, 'success');
        }
    }

    // ============================================================
    // MÉTODOS AUXILIARES (MANTENIDOS)
    // ============================================================

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
            'interjección': '#E17055',
            'numeral': '#00CEC9',
            'clasificador': '#636E72',
            'partícula': '#636E72',
            'expresión': '#FDCB6E',
            'conector': '#74B9FF'
        };
        return colores[familia] || '#6C5CE7';
    }

    _calcularEficienciaGramatica(palabras) {
        if (palabras.length === 0) return 0;
        let dominadas = 0;
        for (const p of palabras) {
            if ((p.neuroScore || 0.5) > 0.7) {
                dominadas++;
            }
        }
        return Math.round((dominadas / palabras.length) * 100);
    }

    async _actualizarSelectFamilias() {
        const select = document.getElementById('familiaSelect');
        if (!select) return;
        
        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
        const todasPalabras = await db.obtenerPalabrasPorIdioma(idiomaActivo);
        const familiasSet = new Set();
        
        for (const p of todasPalabras) {
            const familia = p.familia || p.familiaGramatical || 'sin_clasificar';
            if (familia && familia !== 'sin_clasificar') {
                familiasSet.add(familia);
            }
        }
        
        const familias = Array.from(familiasSet).sort();
        const currentValue = select.value;
        select.innerHTML = '<option value="">Todas las familias</option>';
        for (const f of familias) {
            const count = todasPalabras.filter(p => {
                const fam = p.familia || p.familiaGramatical || 'sin_clasificar';
                return fam === f;
            }).length;
            select.innerHTML += `<option value="${f}">${f} (${count})</option>`;
        }
        select.value = currentValue;
        
        this._familiasGramaticales = new Set(familias);
    }

    _scrollToTop() {
        const container = document.getElementById('grammarContent');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    async _forzarActualizacionGramatical() {
        this._core?.mostrarToast('🔄 Actualizando Vigía Gramatical...', 'info');
        
        try {
            await this._vigiaGramatical.initGramatical();
            await this._vigiaGramatical._actualizarEdadGramatical(this._idiomaActual);
            this._core?.mostrarToast('✅ Vigía Gramatical actualizado', 'success');
            this._cargarGramatica();
        } catch (e) {
            this._core?.mostrarToast('❌ Error actualizando: ' + e.message, 'error');
        }
    }

    // ============================================================
    // REGLAS GRAMATICALES - TEMPLATE E IMPORTACIÓN
    // ============================================================

    async _generarTemplateReglas() {
        const selectIdioma = document.getElementById('reglasIdiomaSelect');
        const idioma = selectIdioma?.value || gestorIdiomas.getIdiomaActivo() || 'es';
        const nivel = document.getElementById('reglasNivelSelect')?.value || 'A1';
        const numReglas = parseInt(document.getElementById('reglasNumSelect')?.value) || 25;
        
        this._core?.mostrarToast(`🧠 Generando plantilla de reglas para ${this._getNombreIdioma(idioma)} (${nivel})...`, 'info');
        
        try {
            const template = await this._vigiaGramatical.generarTemplateReglas(idioma, nivel, numReglas);
            localStorage.setItem('pipeline_template_reglas', JSON.stringify(template));
            this._reglasTemplateGenerado = template;
            this._core?.mostrarToast('✅ Plantilla generada correctamente', 'success');
            this._cargarGramatica();
        } catch (e) {
            this._core?.mostrarToast('❌ Error generando plantilla: ' + e.message, 'error');
        }
    }

    _copiarTemplateReglas() {
        const template = localStorage.getItem('pipeline_template_reglas');
        if (!template) { this._core?.mostrarToast('❌ No hay plantilla para copiar', 'error'); return; }
        
        navigator.clipboard.writeText(template)
            .then(() => this._core?.mostrarToast('📋 Plantilla copiada al portapapeles', 'success'))
            .catch(() => this._core?.mostrarToast('❌ Error al copiar', 'error'));
    }

    _limpiarTemplateReglas() {
        localStorage.removeItem('pipeline_template_reglas');
        this._reglasTemplateGenerado = null;
        this._core?.mostrarToast('🗑️ Plantilla eliminada', 'warning');
        this._cargarGramatica();
    }

    async _validarReglasJSON() {
        const area = document.getElementById('reglasImportArea');
        if (!area || !area.value.trim()) {
            this._core?.mostrarToast('❌ Pega un JSON para validar', 'error');
            return;
        }
        
        try {
            const data = JSON.parse(area.value.trim());
            const resultDiv = document.getElementById('reglasImportResultado');
            
            if (!data.meta || !data.reglas || !Array.isArray(data.reglas)) {
                resultDiv.style.display = 'block';
                resultDiv.style.background = 'rgba(255,118,117,0.1)';
                resultDiv.style.border = '1px solid var(--danger)';
                resultDiv.innerHTML = `❌ JSON inválido: falta "meta" o "reglas"`;
                return;
            }
            
            const vacias = data.reglas.filter(r => !r.nombre || !r.explicacion).length;
            const validas = data.reglas.length - vacias;
            
            resultDiv.style.display = 'block';
            resultDiv.style.background = 'rgba(0,184,148,0.1)';
            resultDiv.style.border = '1px solid var(--success)';
            resultDiv.innerHTML = `
                ✅ JSON válido: ${data.reglas.length} reglas (${validas} completas, ${vacias} vacías)
                <br><span style="font-size:12px;color:var(--gray);">Idioma: ${data.meta.idioma} · Nivel: ${data.meta.nivel}</span>
            `;
        } catch (e) {
            const resultDiv = document.getElementById('reglasImportResultado');
            resultDiv.style.display = 'block';
            resultDiv.style.background = 'rgba(255,118,117,0.1)';
            resultDiv.style.border = '1px solid var(--danger)';
            resultDiv.innerHTML = `❌ JSON inválido: ${e.message}`;
        }
    }

    async _importarReglasJSON() {
        if (this._importandoReglas) return;
        this._importandoReglas = true;
        
        const area = document.getElementById('reglasImportArea');
        if (!area || !area.value.trim()) {
            this._core?.mostrarToast('❌ Pega el JSON completado por la IA', 'error');
            this._importandoReglas = false;
            return;
        }
        
        const resultDiv = document.getElementById('reglasImportResultado');
        resultDiv.style.display = 'block';
        resultDiv.style.background = 'var(--bg)';
        resultDiv.style.border = '1px solid var(--light)';
        resultDiv.innerHTML = `🔄 Importando reglas...`;
        
        try {
            const resultado = await this._vigiaGramatical.importarReglasGramaticales(area.value.trim());
            
            if (resultado.error) {
                resultDiv.style.background = 'rgba(255,118,117,0.1)';
                resultDiv.style.border = '1px solid var(--danger)';
                resultDiv.innerHTML = `❌ ${resultado.error}`;
                this._core?.mostrarToast('❌ Error importando reglas', 'error');
            } else {
                resultDiv.style.background = 'rgba(0,184,148,0.1)';
                resultDiv.style.border = '1px solid var(--success)';
                resultDiv.innerHTML = `
                    ✅ Importación completada
                    <br><span style="font-size:13px;color:var(--gray);">
                        ${resultado.importadas} nuevas · ${resultado.duplicadas} duplicadas · ${resultado.vacias} vacías
                    </span>
                `;
                this._core?.mostrarToast(`✅ ${resultado.importadas} reglas importadas`, 'success');
                area.value = '';
                localStorage.removeItem('pipeline_template_reglas');
                this._cargarGramatica();
            }
        } catch (e) {
            resultDiv.style.background = 'rgba(255,118,117,0.1)';
            resultDiv.style.border = '1px solid var(--danger)';
            resultDiv.innerHTML = `❌ ${e.message}`;
            this._core?.mostrarToast('❌ Error: ' + e.message, 'error');
        }
        
        this._importandoReglas = false;
    }

    // ============================================================
    // CENTRO DE CONOCIMIENTO GRAMATICAL
    // ============================================================

    async _renderCentroConocimiento(idioma) {
        const nivel = gestorIdiomas?.getInfoActivo()?.nivel || 'A1';
        const reglas = await db.obtenerReglasGramaticales(idioma);
        const estadoVigia = this._vigiaGramatical?.getEstadoGramatical();
        
        const todosIdiomas = gestorIdiomas.getIdiomas() || [];
        const idiomaActivo = gestorIdiomas.getIdiomaActivo() || idioma;
        
        let templateJSON = localStorage.getItem('pipeline_template_reglas');
        if (templateJSON) {
            try { templateJSON = JSON.parse(templateJSON); } catch (e) { templateJSON = null; }
        }
        
        return `
            <div style="background:var(--white);border-radius:12px;padding:20px;border:2px solid var(--primary)20;box-shadow:var(--shadow);">
                <h3 style="font-size:18px;font-weight:700;color:var(--dark);margin:0 0 12px 0;">🧠 Centro de Conocimiento Gramatical</h3>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                    <div style="background:var(--bg);padding:12px 16px;border-radius:10px;">
                        <div style="font-size:12px;color:var(--gray);">🌍 Idioma</div>
                        <div style="font-size:16px;font-weight:700;color:var(--dark);">${this._getNombreIdioma(idioma)} (${idioma})</div>
                    </div>
                    <div style="background:var(--bg);padding:12px 16px;border-radius:10px;">
                        <div style="font-size:12px;color:var(--gray);">🎯 Nivel</div>
                        <div style="font-size:16px;font-weight:700;color:var(--dark);">${nivel}</div>
                    </div>
                    <div style="background:var(--bg);padding:12px 16px;border-radius:10px;">
                        <div style="font-size:12px;color:var(--gray);">📚 Reglas conocidas</div>
                        <div style="font-size:16px;font-weight:700;color:var(--primary);">${reglas.length}</div>
                    </div>
                    <div style="background:var(--bg);padding:12px 16px;border-radius:10px;">
                        <div style="font-size:12px;color:var(--gray);">🧠 Vigía Gramatical</div>
                        <div style="font-size:16px;font-weight:700;color:var(--secondary);">${estadoVigia?.edadNombre || 'Aprendiendo'}</div>
                    </div>
                </div>
                
                ${reglas.length === 0 ? `
                    <div style="background:rgba(255,118,117,0.1);padding:16px;border-radius:10px;border:1px solid var(--danger);margin-bottom:16px;">
                        <p style="margin:0;color:var(--danger);font-weight:600;">⚠️ No hay reglas gramaticales en el sistema</p>
                        <p style="margin:4px 0 0;font-size:13px;color:var(--gray);">Genera una plantilla y envíala a una IA para completar.</p>
                    </div>
                ` : `
                    <div style="background:rgba(0,184,148,0.1);padding:12px 16px;border-radius:10px;border:1px solid var(--success);margin-bottom:16px;">
                        <p style="margin:0;color:var(--success);font-weight:600;">✅ ${reglas.length} reglas gramaticales cargadas</p>
                        <p style="margin:2px 0 0;font-size:12px;color:var(--gray);">Vigía Gramatical está listo para ayudarte.</p>
                    </div>
                `}
                
                <div style="border-top:2px solid var(--light);padding-top:16px;margin-top:8px;">
                    <h4 style="font-size:15px;font-weight:700;color:var(--dark);margin:0 0 12px 0;">📄 Generar Plantilla de Reglas</h4>
                    
                    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
                        <select id="reglasIdiomaSelect" style="padding:8px 14px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);background:var(--white);">
                            ${todosIdiomas.length > 0 ? 
                                todosIdiomas.map(i => 
                                    `<option value="${i.idioma}" ${i.idioma === idiomaActivo ? 'selected' : ''}>${this._getNombreIdioma(i.idioma)} (${i.idioma})</option>`
                                ).join('') :
                                `<option value="${idioma}" selected>${this._getNombreIdioma(idioma)} (${idioma})</option>`
                            }
                        </select>
                        <select id="reglasNivelSelect" style="padding:8px 14px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);background:var(--white);">
                            ${this._NIVELES.map(n => `<option value="${n}" ${n === nivel ? 'selected' : ''}>${n}</option>`).join('')}
                        </select>
                        <input type="number" id="reglasNumSelect" value="25" min="10" max="50" style="padding:8px 14px;border:2px solid var(--light);border-radius:8px;font-size:14px;font-family:var(--font);width:80px;">
                        <button class="btn-primary" onclick="window.UIGrammar._generarTemplateReglas()" style="padding:8px 20px;font-size:14px;">
                            <i class="fas fa-magic"></i> Generar Plantilla
                        </button>
                    </div>
                    
                    ${templateJSON ? `
                        <div style="background:var(--bg);border-radius:10px;padding:12px;margin-bottom:12px;border:2px solid var(--primary);">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:4px;">
                                <span style="font-weight:600;color:var(--dark);">📄 Plantilla generada (${templateJSON.reglas?.length || 0} reglas)</span>
                                <div style="display:flex;gap:6px;">
                                    <button class="btn-secondary" onclick="window.UIGrammar._copiarTemplateReglas()" style="padding:4px 12px;font-size:11px;">
                                        <i class="fas fa-copy"></i> Copiar
                                    </button>
                                    <button class="btn-secondary" onclick="window.UIGrammar._limpiarTemplateReglas()" style="padding:4px 12px;font-size:11px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;">
                                        <i class="fas fa-times"></i> Limpiar
                                    </button>
                                </div>
                            </div>
                            <pre style="font-size:11px;max-height:150px;overflow:auto;background:var(--white);padding:8px;border-radius:6px;margin:0;font-family:monospace;white-space:pre-wrap;word-break:break-all;">${JSON.stringify(templateJSON, null, 2)}</pre>
                            <div style="font-size:11px;color:var(--gray-light);margin-top:4px;">
                                💡 Copia este JSON y envíalo a Groq/ChatGPT para que lo complete con reglas gramaticales.
                            </div>
                        </div>
                    ` : ''}
                    
                    <div style="border-top:1px solid var(--light);padding-top:12px;margin-top:8px;">
                        <h4 style="font-size:15px;font-weight:700;color:var(--dark);margin:0 0 12px 0;">📥 Importar JSON Completado</h4>
                        
                        <textarea id="reglasImportArea" rows="6" placeholder="Pega aquí el JSON completado por la IA..." style="width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:10px;font-size:13px;font-family:monospace;resize:vertical;"></textarea>
                        
                        <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap;">
                            <button class="btn-success" onclick="window.UIGrammar._importarReglasJSON()" style="padding:10px 24px;background:#00B894;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">
                                <i class="fas fa-file-import"></i> Importar al Sistema
                            </button>
                            <button class="btn-secondary" onclick="window.UIGrammar._validarReglasJSON()" style="padding:10px 24px;background:var(--light);color:var(--dark);border:none;border-radius:8px;cursor:pointer;font-size:14px;">
                                <i class="fas fa-check-circle"></i> Validar JSON
                            </button>
                            <button class="btn-secondary" onclick="document.getElementById('reglasImportArea').value=''" style="padding:10px 24px;background:var(--light);color:var(--gray);border:none;border-radius:8px;cursor:pointer;font-size:14px;">
                                <i class="fas fa-eraser"></i> Limpiar
                            </button>
                        </div>
                        
                        <div id="reglasImportResultado" style="margin-top:12px;display:none;padding:12px 16px;border-radius:10px;font-size:14px;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // PAGINACIÓN
    // ============================================================

    _renderPaginadorFamilias(paginaActual, totalPaginas) {
        return `
            <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin:8px 0 16px 0;flex-wrap:wrap;">
                <button class="btn-secondary" onclick="window.UIGrammar._irPaginaFamilias(${paginaActual - 1})" style="padding:4px 12px;font-size:11px;${paginaActual <= 1 ? 'opacity:0.5;cursor:default;' : ''}" ${paginaActual <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Anterior
                </button>
                <span style="font-size:12px;color:var(--gray);">${paginaActual} / ${totalPaginas}</span>
                <button class="btn-secondary" onclick="window.UIGrammar._irPaginaFamilias(${paginaActual + 1})" style="padding:4px 12px;font-size:11px;${paginaActual >= totalPaginas ? 'opacity:0.5;cursor:default;' : ''}" ${paginaActual >= totalPaginas ? 'disabled' : ''}>
                    Siguiente <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    _irPaginaFamilias(pagina) {
        const totalFamilias = this._familiasGramaticales.size || 1;
        const totalPaginas = Math.ceil(totalFamilias / this._familiasPorPagina);
        if (pagina < 1 || pagina > totalPaginas) return;
        this._paginaFamilias = pagina;
        this._cargarGramatica();
    }

    _irPaginaPalabrasFamilia(familia, pagina) {
        if (!this._paginaPalabrasPorFamilia[familia]) {
            this._paginaPalabrasPorFamilia[familia] = 1;
        }
        if (pagina < 1) return;
        this._paginaPalabrasPorFamilia[familia] = pagina;
        this._cargarGramatica();
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UIGrammar = new UIGrammar();

console.log('✅ UIGrammar v20.5 - CON TRANSCRIPCIÓN FONÉTICA (COMPLETO)');
console.log('  🎤 Transcripción fonética para palabras y frases');
console.log('  🔊 Soporte para jeroglíficos con pinyin');
console.log('  📝 Cache de transcripciones para rendimiento');
console.log('  🌍 Adaptado al idioma nativo del usuario');
console.log('  🔥 Buscador dinámico con debounce');
console.log('  ✅ Todas las funcionalidades originales preservadas');