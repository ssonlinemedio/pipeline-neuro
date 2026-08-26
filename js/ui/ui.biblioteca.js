// ============================================================
// UI BIBLIOTECA v2.9 - CORREGIDO: ORDEN DE TEMAS Y HISTORIAS SEGÚN TEMAS
// ============================================================

class UIBiblioteca {
    constructor() {
        this._core = null;
        this._container = null;
        this._cargando = false;
        this._initDone = false;
        this._modoVista = 'biblioteca';
        this._historiaSeleccionada = null;
        this._historiasLeidas = new Set();
        this._origenAccion = null;
        this._historiaEnEstudio = null;
        this._botonInyectado = false;
        this._esperandoRetorno = false;
        this._ultimaActualizacion = 0;
        this._itemsPorPagina = 12;
        this._paginaActual = 1;
        this._filtroOrigen = 'todos';
        this._filtroEstado = 'todos';
        this._busqueda = '';
        this._totalItems = 0;
        this._totalGrupos = 0;
        this._totalPaginas = 1;
        this._frasesActuales = [];
        this._historiasCache = [];
        
        this._vistaAgrupada = true;
        this._mostrarTraduccion = true;
        
        this._NIVELES_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        this._NIVEL_WEIGHT = {
            'A1': 0, 'A2': 1, 'B1': 2, 'B2': 3, 'C1': 4, 'C2': 5
        };
        
        this._ORIGENES = {
            'tema': { label: '📚 Tema', color: '#6C5CE7', bg: 'rgba(108,92,231,0.1)' },
            'elipse': { label: '🌌 Elipse', color: '#00CEC9', bg: 'rgba(0,206,201,0.1)' },
            'ondas_cruzadas': { label: '🌊 Ondas Cruzadas', color: '#00B894', bg: 'rgba(0,184,148,0.1)' },
            'importado': { label: '📥 Importado', color: '#FDCB6E', bg: 'rgba(253,203,110,0.1)' },
            'predefinido': { label: '📚 Predefinido', color: '#A29BFE', bg: 'rgba(162,155,254,0.1)' }
        };
        
        this._cargarHistoriasLeidas();
        this._cargarPreferencias();
        
        // ORDEN DE TEMAS SEGÚN NIVEL Y PREDEFINIDOS
        this._ORDEN_TEMAS_PREDEFINIDOS = {};
        this._cargarOrdenTemasPredefinidos();
    }

    _cargarOrdenTemasPredefinidos() {
        try {
            const temasPredefinidos = {
                'A1': [
                    'Mi familia', 'La casa y el hogar', 'Comida y bebida', 'Mi rutina diaria',
                    'La ciudad y el barrio', 'La ropa y los colores', 'El tiempo y las estaciones', 'Los animales'
                ],
                'A2': [
                    'Viajes y transportes', 'Compras y tiendas', 'Salud y medicina', 'Deportes y ocio',
                    'Trabajo y profesiones', 'Música y cultura', 'Comunicación y tecnología', 'El medio ambiente'
                ],
                'B1': [
                    'Relaciones personales', 'Educación y aprendizaje', 'Medios de comunicación', 'Turismo y patrimonio',
                    'Tecnología y futuro', 'Gastronomía internacional', 'Arte y creatividad', 'Eventos históricos'
                ],
                'B2': [
                    'Política y sociedad', 'Economía y finanzas', 'Ciencia e investigación', 'Filosofía y pensamiento',
                    'Psicología y comportamiento', 'Globalización e interculturalidad', 'Desarrollo sostenible', 'Literatura y narrativa'
                ],
                'C1': [
                    'Crítica cultural', 'Retórica y argumentación', 'Antropología social', 'Investigación académica', 'Análisis del discurso'
                ],
                'C2': [
                    'Especialización académica', 'Debate y oratoria', 'Creación literaria', 'Análisis crítico avanzado'
                ]
            };
            this._ORDEN_TEMAS_PREDEFINIDOS = temasPredefinidos;
        } catch (e) {
            console.warn('⚠️ Error cargando orden de temas predefinidos:', e);
        }
    }

    _cargarPreferencias() {
        try {
            const prefs = localStorage.getItem('pipeline_biblioteca_prefs');
            if (prefs) {
                const parsed = JSON.parse(prefs);
                this._vistaAgrupada = parsed.vistaAgrupada !== undefined ? parsed.vistaAgrupada : true;
                this._mostrarTraduccion = parsed.mostrarTraduccion !== undefined ? parsed.mostrarTraduccion : true;
                this._itemsPorPagina = parsed.itemsPorPagina || 12;
            }
        } catch (e) {}
    }

    _guardarPreferencias() {
        try {
            localStorage.setItem('pipeline_biblioteca_prefs', JSON.stringify({
                vistaAgrupada: this._vistaAgrupada,
                mostrarTraduccion: this._mostrarTraduccion,
                itemsPorPagina: this._itemsPorPagina
            }));
        } catch (e) {}
    }

    async init(core) {
        if (this._initDone) return this;
        this._core = core || window.uiCore;
        this._initDone = true;
        this._registrarEventosSincronizacion();
        console.log('📚 UIBiblioteca v2.9: Inicializada (orden por Temas)');
        return this;
    }

    _registrarEventosSincronizacion() {
        window.addEventListener('historiaEstadoCambiado', (e) => {
            const detail = e.detail || {};
            if (detail.historiaId) {
                console.log('📚 Biblioteca: Historia cambiada de estado', detail);
                if (this._container && this._container.offsetParent !== null) {
                    setTimeout(() => this.cargar(this._core), 300);
                }
            }
        });

        window.addEventListener('temaCompletado', (e) => {
            if (this._container && this._container.offsetParent !== null) {
                setTimeout(() => this.cargar(this._core), 500);
            }
        });

        window.addEventListener('respuestaEstudio', (e) => {
            const detalle = e.detail || {};
            if (detalle.historiaId) {
                if (this._container && this._container.offsetParent !== null) {
                    setTimeout(() => this.cargar(this._core), 500);
                }
            }
        });

        console.log('📚 Eventos de sincronización registrados');
    }

    _cargarHistoriasLeidas() {
        try {
            const data = localStorage.getItem('pipeline_historias_leidas_biblioteca');
            if (data) {
                this._historiasLeidas = new Set(JSON.parse(data));
                console.log(`📚 ${this._historiasLeidas.size} historias leídas cargadas`);
            }
        } catch (e) {
            this._historiasLeidas = new Set();
        }
    }

    _guardarHistoriasLeidas() {
        try {
            localStorage.setItem('pipeline_historias_leidas_biblioteca', 
                JSON.stringify(Array.from(this._historiasLeidas)));
        } catch (e) {
            console.warn('⚠️ Error guardando historias leídas:', e);
        }
    }

    async _toggleHistoriaLeida(historiaId, checked) {
        if (!historiaId) return;
        
        try {
            if (checked) {
                this._historiasLeidas.add(historiaId);
            } else {
                this._historiasLeidas.delete(historiaId);
            }
            this._guardarHistoriasLeidas();
            this._actualizarTarjetaHistoria(historiaId, checked);
            this._actualizarContadorHistoriasLeidas();
            this._core?.mostrarToast(
                checked ? '✅ Historia marcada como leída' : '↩️ Historia desmarcada como leída',
                checked ? 'success' : 'info'
            );
        } catch (e) {
            console.warn('⚠️ Error toggling historia leída:', e);
        }
    }

    _actualizarTarjetaHistoria(historiaId, checked) {
        const tarjeta = document.querySelector(`.historia-card[data-historia-id="${historiaId}"]`);
        if (!tarjeta) return;
        
        const badge = tarjeta.querySelector('.historia-leida-badge');
        const checkbox = tarjeta.querySelector('.historia-checkbox-input');
        const progreso = tarjeta.querySelector('.historia-progreso');
        
        if (checkbox) checkbox.checked = checked;
        
        if (badge) {
            badge.innerHTML = checked ? '✅ Leída' : '📖 No leída';
            badge.style.background = checked ? 'var(--success)' : 'var(--gray-light)';
            badge.style.color = checked ? 'white' : 'var(--gray)';
        }
        
        if (progreso) {
            const pct = checked ? 100 : 0;
            progreso.style.width = pct + '%';
            const pctText = tarjeta.querySelector('.historia-progreso-texto');
            if (pctText) pctText.textContent = pct + '%';
        }
        
        if (checked) {
            tarjeta.style.borderLeft = '4px solid var(--success)';
            tarjeta.style.background = 'rgba(0, 184, 148, 0.05)';
        } else {
            tarjeta.style.borderLeft = '4px solid var(--light)';
            tarjeta.style.background = 'var(--white)';
        }
        
        const leidaTag = tarjeta.querySelector('.historia-leida-tag');
        if (leidaTag) leidaTag.style.display = checked ? 'inline-block' : 'none';
    }

    _actualizarContadorHistoriasLeidas() {
        const contador = document.querySelector('.historias-leidas-contador');
        if (contador) {
            contador.textContent = `${this._historiasLeidas.size} leídas`;
        }
        
        const todasLasHistorias = document.querySelectorAll('.historia-card');
        const total = todasLasHistorias.length;
        const leidas = this._historiasLeidas.size;
        const pct = total > 0 ? Math.round((leidas / total) * 100) : 0;
        
        const barra = document.querySelector('.historias-leidas-progreso');
        if (barra) barra.style.width = pct + '%';
        
        const pctText = document.querySelector('.historias-leidas-porcentaje');
        if (pctText) pctText.textContent = `${pct}%`;
    }

    _detectarOrigenHistoria(historia) {
        if (!historia) return { tipo: 'desconocido', label: '📄 Desconocido', color: 'var(--gray)' };
        
        if (historia._esOndaCruzada === true) {
            return { 
                tipo: 'ondas_cruzadas', 
                ...this._ORIGENES['ondas_cruzadas'],
                temaId: historia.temaId,
                id: historia.id
            };
        }
        
        if (historia._esOnda === true) {
            return { 
                tipo: 'elipse', 
                ...this._ORIGENES['elipse'],
                temaId: historia.temaId,
                id: historia.id
            };
        }
        
        if (historia._importadoDesdeJSON === true || historia._esImportada === true || historia._importado === true) {
            return { 
                tipo: 'importado', 
                ...this._ORIGENES['importado'],
                temaId: historia.temaId,
                id: historia.id
            };
        }
        
        if (historia._esPredefinido === true) {
            return { 
                tipo: 'predefinido', 
                ...this._ORIGENES['predefinido'],
                temaId: historia.temaId,
                id: historia.id
            };
        }
        
        if (historia.temaId) {
            return { 
                tipo: 'tema', 
                ...this._ORIGENES['tema'],
                temaId: historia.temaId,
                id: historia.id
            };
        }
        
        return { tipo: 'tema', ...this._ORIGENES['tema'], temaId: historia.temaId };
    }

    async _obtenerOrigenCompleto(historia) {
        const origen = this._detectarOrigenHistoria(historia);
        
        if (origen.tipo === 'tema' && historia.temaId) {
            try {
                const tema = await db.obtenerTema(historia.temaId);
                if (tema && tema._esPredefinido === true) {
                    return { 
                        ...origen, 
                        tipo: 'predefinido', 
                        ...this._ORIGENES['predefinido']
                    };
                }
            } catch (e) {}
        }
        
        return origen;
    }

    async _obtenerTodasLasHistorias() {
        const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
        
        const todosLosTemas = await db.obtenerTemasPorIdioma(idiomaActivo);
        console.log(`📚 ${todosLosTemas.length} temas encontrados para idioma: ${idiomaActivo}`);
        
        // 🔥 ORDENAR TEMAS: PRIMERO PREDEFINIDOS POR NIVEL, LUEGO IMPORTADOS, LUEGO MANUALES
        const temasOrdenados = this._ordenarTemas(todosLosTemas, idiomaActivo);
        console.log(`📚 Temas ordenados: ${temasOrdenados.map(t => t.nombre).join(' → ')}`);
        
        let todasLasHistorias = [];
        
        for (const tema of temasOrdenados) {
            let historiasDelTema = await db.obtenerHistoriasPorTema(tema.id);
            
            if (!historiasDelTema || historiasDelTema.length === 0) {
                try {
                    const todasLasHistoriasDB = await db.obtenerHistoriasPorIdioma(idiomaActivo);
                    historiasDelTema = todasLasHistoriasDB.filter(h => h.temaId === tema.id);
                } catch (e) {
                    console.warn(`⚠️ Error buscando historias por temaId para ${tema.nombre}:`, e);
                }
            }
            
            if ((!historiasDelTema || historiasDelTema.length === 0) && tema.historiasIds && tema.historiasIds.length > 0) {
                const historiasPorId = [];
                for (const hId of tema.historiasIds) {
                    try {
                        const h = await db.get('historias', hId);
                        if (h) {
                            historiasPorId.push(h);
                        }
                    } catch (e) {
                        console.warn(`⚠️ No se pudo obtener historia ${hId}:`, e);
                    }
                }
                historiasDelTema = historiasPorId;
            }
            
            if ((!historiasDelTema || historiasDelTema.length === 0) && tema.nombre) {
                try {
                    const todasLasHistoriasDB = await db.obtenerHistoriasPorIdioma(idiomaActivo);
                    const temaNombre = tema.nombre.toLowerCase().trim();
                    historiasDelTema = todasLasHistoriasDB.filter(h => {
                        const titulo = (h.titulo || '').toLowerCase();
                        return titulo.includes(temaNombre) || (temaNombre.length > 3 && titulo.includes(temaNombre.split(' ')[0]));
                    });
                } catch (e) {
                    console.warn(`⚠️ Error buscando por título para ${tema.nombre}:`, e);
                }
            }
            
            for (const h of historiasDelTema) {
                if (!h.temaId) {
                    h.temaId = tema.id;
                    try {
                        await db.update('historias', { id: h.id, temaId: tema.id });
                    } catch (e) {}
                }
                todasLasHistorias.push({
                    ...h,
                    _temaNombre: tema.nombre,
                    _temaId: tema.id,
                    _esPredefinido: tema._esPredefinido === true,
                    _nivelTema: tema.nivel || 'A1',
                    _ordenTema: tema._ordenTema || 0
                });
            }
        }
        
        // 🔥 ORDENAR HISTORIAS DENTRO DE CADA TEMA (POR TÍTULO)
        todasLasHistorias.sort((a, b) => {
            // Primero por nivel del tema
            const nivelA = a._nivelTema || 'A1';
            const nivelB = b._nivelTema || 'A1';
            const pesoA = this._NIVEL_WEIGHT[nivelA] !== undefined ? this._NIVEL_WEIGHT[nivelA] : 99;
            const pesoB = this._NIVEL_WEIGHT[nivelB] !== undefined ? this._NIVEL_WEIGHT[nivelB] : 99;
            if (pesoA !== pesoB) return pesoA - pesoB;
            
            // Luego por nombre del tema
            const temaA = a._temaNombre || '';
            const temaB = b._temaNombre || '';
            if (temaA !== temaB) return temaA.localeCompare(temaB);
            
            // Luego por título de la historia
            return (a.titulo || '').localeCompare(b.titulo || '');
        });
        
        console.log(`📚 Total historias ordenadas: ${todasLasHistorias.length}`);
        
        const historiasConOrigen = [];
        for (const h of todasLasHistorias) {
            const origen = await this._obtenerOrigenCompleto(h);
            const nivel = await this._obtenerNivelHistoria(h);
            historiasConOrigen.push({
                ...h,
                _origen: origen,
                _leida: this._historiasLeidas.has(h.id),
                _progreso: await this._calcularProgresoHistoria(h.id),
                _temaNombre: h._temaNombre || 'Sin tema',
                _nivel: nivel || h.nivel || 'A1'
            });
        }
        
        return historiasConOrigen;
    }

    // ============================================================
    // 🔥 NUEVO: ORDENAR TEMAS SEGÚN PREDEFINIDOS POR NIVEL
    // ============================================================

    _ordenarTemas(temas, idioma) {
        if (!temas || temas.length === 0) return temas;
        
        // Separar predefinidos, importados y manuales
        const predefinidos = [];
        const importados = [];
        const manuales = [];
        
        for (const tema of temas) {
            if (tema._esPredefinido === true) {
                predefinidos.push(tema);
            } else if (tema._esImportado === true || tema.origen === 'importado') {
                importados.push(tema);
            } else {
                manuales.push(tema);
            }
        }
        
        // Ordenar predefinidos por nivel y orden predefinido
        predefinidos.sort((a, b) => {
            const nivelA = a.nivel || 'A1';
            const nivelB = b.nivel || 'A1';
            const pesoA = this._NIVEL_WEIGHT[nivelA] !== undefined ? this._NIVEL_WEIGHT[nivelA] : 99;
            const pesoB = this._NIVEL_WEIGHT[nivelB] !== undefined ? this._NIVEL_WEIGHT[nivelB] : 99;
            if (pesoA !== pesoB) return pesoA - pesoB;
            
            // Orden predefinido por nombre
            const ordenA = this._ORDEN_TEMAS_PREDEFINIDOS[nivelA] || [];
            const idxA = ordenA.indexOf(a.nombre);
            const idxB = ordenA.indexOf(b.nombre);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.nombre.localeCompare(b.nombre);
        });
        
        // Ordenar importados por nivel
        importados.sort((a, b) => {
            const nivelA = a.nivel || 'A1';
            const nivelB = b.nivel || 'A1';
            const pesoA = this._NIVEL_WEIGHT[nivelA] !== undefined ? this._NIVEL_WEIGHT[nivelA] : 99;
            const pesoB = this._NIVEL_WEIGHT[nivelB] !== undefined ? this._NIVEL_WEIGHT[nivelB] : 99;
            if (pesoA !== pesoB) return pesoA - pesoB;
            return a.nombre.localeCompare(b.nombre);
        });
        
        // Ordenar manuales por nivel
        manuales.sort((a, b) => {
            const nivelA = a.nivel || 'A1';
            const nivelB = b.nivel || 'A1';
            const pesoA = this._NIVEL_WEIGHT[nivelA] !== undefined ? this._NIVEL_WEIGHT[nivelA] : 99;
            const pesoB = this._NIVEL_WEIGHT[nivelB] !== undefined ? this._NIVEL_WEIGHT[nivelB] : 99;
            if (pesoA !== pesoB) return pesoA - pesoB;
            return a.nombre.localeCompare(b.nombre);
        });
        
        // Combinar: predefinidos primero, luego importados, luego manuales
        return [...predefinidos, ...importados, ...manuales];
    }

    async _obtenerNombreTema(temaId) {
        if (!temaId) return null;
        try {
            const tema = await db.obtenerTema(temaId);
            return tema?.nombre || tema?.titulo || null;
        } catch (e) {
            return null;
        }
    }

    async _obtenerNivelHistoria(historia) {
        if (historia.nivel) return historia.nivel;
        if (historia.temaId) {
            try {
                const tema = await db.obtenerTema(historia.temaId);
                if (tema && tema.nivel) return tema.nivel;
            } catch (e) {}
        }
        return 'A1';
    }

    async _calcularProgresoHistoria(historiaId) {
        try {
            const frases = await db.obtenerFrasesPorHistoria(historiaId);
            if (frases.length === 0) return { total: 0, completadas: 0, porcentaje: 0 };
            
            let completadas = 0;
            for (const f of frases) {
                const progreso = await db.obtenerProgreso(f.id);
                if (progreso && (progreso.estado === 'completada' || progreso.rcn >= 4)) {
                    completadas++;
                }
            }
            
            return {
                total: frases.length,
                completadas: completadas,
                porcentaje: Math.round((completadas / frases.length) * 100),
                completada: completadas === frases.length
            };
        } catch (e) {
            return { total: 0, completadas: 0, porcentaje: 0, completada: false };
        }
    }

    _agruparHistoriasPorTema(historias) {
        const grupos = {};
        
        for (const h of historias) {
            const key = h.temaId || 'sin_tema';
            const nombre = h._temaNombre || 'Sin tema';
            
            if (!grupos[key]) {
                grupos[key] = {
                    temaId: key,
                    nombre: nombre,
                    origen: h._origen,
                    nivel: h._nivel || 'A1',
                    historias: []
                };
            }
            grupos[key].historias.push(h);
        }
        
        // 🔥 ORDENAR GRUPOS POR NIVEL Y ORDEN PREDEFINIDO
        const gruposArray = Object.values(grupos);
        gruposArray.sort((a, b) => {
            const nivelA = a.nivel || 'A1';
            const nivelB = b.nivel || 'A1';
            const pesoA = this._NIVEL_WEIGHT[nivelA] !== undefined ? this._NIVEL_WEIGHT[nivelA] : 99;
            const pesoB = this._NIVEL_WEIGHT[nivelB] !== undefined ? this._NIVEL_WEIGHT[nivelB] : 99;
            if (pesoA !== pesoB) return pesoA - pesoB;
            
            // Orden predefinido por nombre
            const ordenA = this._ORDEN_TEMAS_PREDEFINIDOS[nivelA] || [];
            const idxA = ordenA.indexOf(a.nombre);
            const idxB = ordenA.indexOf(b.nombre);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.nombre.localeCompare(b.nombre);
        });
        
        for (const grupo of gruposArray) {
            grupo.historias.sort((a, b) => {
                const nivelA = a._nivel || a.nivel || 'A1';
                const nivelB = b._nivel || b.nivel || 'A1';
                
                const pesoA = this._NIVEL_WEIGHT[nivelA] !== undefined ? this._NIVEL_WEIGHT[nivelA] : 99;
                const pesoB = this._NIVEL_WEIGHT[nivelB] !== undefined ? this._NIVEL_WEIGHT[nivelB] : 99;
                
                if (pesoA !== pesoB) {
                    return pesoA - pesoB;
                }
                
                return (a.titulo || '').localeCompare(b.titulo || '');
            });
        }
        
        return gruposArray;
    }

    cargar(core) {
        this._core = core || this._core;
        this._container = document.getElementById('bibliotecaContent');
        
        if (!this._container) {
            const moduleDiv = document.getElementById('bibliotecaModule');
            if (moduleDiv) {
                this._container = document.createElement('div');
                this._container.id = 'bibliotecaContent';
                moduleDiv.appendChild(this._container);
            }
        }
        
        if (this._container) {
            this._renderizarBiblioteca();
        }
    }

    // ============================================================
    // RENDERIZAR BIBLIOTECA - CON ORDEN POR TEMAS
    // ============================================================

    async _renderizarBiblioteca() {
        if (this._cargando) return;
        this._cargando = true;
        
        const container = this._container;
        if (!container) {
            this._cargando = false;
            return;
        }

        try {
            const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
            const nombreIdioma = this._getNombreIdioma(idioma);
            
            let historias = await this._obtenerTodasLasHistorias();
            this._historiasCache = historias;
            
            historias = this._aplicarFiltros(historias);
            
            // Ya están ordenadas por _obtenerTodasLasHistorias
            // Pero reordenamos por si acaso
            historias.sort((a, b) => {
                const nivelA = a._nivel || a.nivel || 'A1';
                const nivelB = b._nivel || b.nivel || 'A1';
                
                const pesoA = this._NIVEL_WEIGHT[nivelA] !== undefined ? this._NIVEL_WEIGHT[nivelA] : 99;
                const pesoB = this._NIVEL_WEIGHT[nivelB] !== undefined ? this._NIVEL_WEIGHT[nivelB] : 99;
                
                if (pesoA !== pesoB) {
                    return pesoA - pesoB;
                }
                
                const temaA = a._temaNombre || '';
                const temaB = b._temaNombre || '';
                if (temaA !== temaB) return temaA.localeCompare(temaB);
                
                return (a.titulo || '').localeCompare(b.titulo || '');
            });
            
            let grupos = null;
            let totalItems = historias.length;
            let historiasPagina = historias;
            let totalPaginas = 1;
            let totalGrupos = 0;
            
            if (this._vistaAgrupada) {
                const todosLosGrupos = this._agruparHistoriasPorTema(historias);
                totalGrupos = todosLosGrupos.length;
                
                const gruposPorPagina = Math.max(2, Math.floor(this._itemsPorPagina / 3));
                totalPaginas = Math.max(1, Math.ceil(totalGrupos / gruposPorPagina));
                
                this._totalGrupos = totalGrupos;
                this._totalPaginas = totalPaginas;
                this._gruposPorPagina = gruposPorPagina;
                
                if (this._paginaActual > totalPaginas) this._paginaActual = totalPaginas;
                if (this._paginaActual < 1) this._paginaActual = 1;
                
                const inicioGrupo = (this._paginaActual - 1) * gruposPorPagina;
                const finGrupo = Math.min(inicioGrupo + gruposPorPagina, totalGrupos);
                const gruposPagina = todosLosGrupos.slice(inicioGrupo, finGrupo);
                
                historiasPagina = [];
                for (const grupo of gruposPagina) {
                    for (const h of grupo.historias) {
                        historiasPagina.push(h);
                    }
                }
                
                grupos = this._agruparHistoriasPorTema(historiasPagina);
                totalItems = historiasPagina.length;
                
                console.log(`📚 Vista agrupada: ${totalGrupos} grupos, página ${this._paginaActual}/${totalPaginas}, ${historiasPagina.length} historias`);
            } else {
                totalItems = historias.length;
                totalPaginas = Math.max(1, Math.ceil(totalItems / this._itemsPorPagina));
                
                this._totalPaginas = totalPaginas;
                this._totalGrupos = 0;
                
                if (this._paginaActual > totalPaginas) this._paginaActual = totalPaginas;
                if (this._paginaActual < 1) this._paginaActual = 1;
                
                const inicio = (this._paginaActual - 1) * this._itemsPorPagina;
                const fin = Math.min(inicio + this._itemsPorPagina, totalItems);
                historiasPagina = historias.slice(inicio, fin);
                grupos = null;
            }
            
            this._totalItems = totalItems;
            
            const total = historias.length;
            const leidas = historias.filter(h => h._leida).length;
            const completadas = historias.filter(h => h._progreso?.completada).length;
            const pctLeidas = total > 0 ? Math.round((leidas / total) * 100) : 0;
            const pctCompletadas = total > 0 ? Math.round((completadas / total) * 100) : 0;
            
            const origenCounts = {};
            for (const h of historias) {
                const tipo = h._origen?.tipo || 'desconocido';
                origenCounts[tipo] = (origenCounts[tipo] || 0) + 1;
            }
            
            const nivelCounts = {};
            for (const h of historias) {
                const nivel = h._nivel || h.nivel || 'A1';
                nivelCounts[nivel] = (nivelCounts[nivel] || 0) + 1;
            }
            const nivelLabels = Object.keys(nivelCounts).sort((a, b) => {
                return (this._NIVEL_WEIGHT[a] || 99) - (this._NIVEL_WEIGHT[b] || 99);
            });
            
            let html = `
                <div class="biblioteca-container" style="padding:16px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:12px 20px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:14px;border:2px solid var(--primary)20;">
                        <div>
                            <h2 style="font-size:22px;font-weight:800;color:var(--dark);margin:0;">
                                📚 Biblioteca de Lectura
                                <span style="font-size:14px;font-weight:400;color:var(--gray);margin-left:8px;">${nombreIdioma}</span>
                            </h2>
                            <p style="font-size:13px;color:var(--gray);margin:4px 0 0;">
                                ${total} historias · ${leidas} leídas · ${completadas} completadas
                                <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">
                                    📖 ${pctLeidas}% leído · 🧠 ${pctCompletadas}% completado
                                </span>
                            </p>
                            <div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap;font-size:11px;color:var(--gray-light);">
                                ${Object.entries(origenCounts).map(([tipo, count]) => {
                                    const info = this._ORIGENES[tipo] || { label: tipo, color: 'var(--gray)' };
                                    return `<span style="color:${info.color};">${info.label}: ${count}</span>`;
                                }).join(' · ')}
                                ${nivelLabels.length > 0 ? ' · ' + nivelLabels.map(n => `${this._getEmojiNivel(n)} ${n}: ${nivelCounts[n]}`).join(' · ') : ''}
                            </div>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            <button class="btn-secondary" onclick="window.uiCore.volverDashboard()" 
                                    style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                                <i class="fas fa-home"></i> Dashboard
                            </button>
                            <button class="btn-secondary" onclick="window.UIBiblioteca._limpiarFiltros()" 
                                    style="padding:6px 14px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                                <i class="fas fa-undo"></i> Limpiar filtros
                            </button>
                        </div>
                    </div>

                    <div style="background:var(--white);border-radius:12px;padding:12px 18px;margin-bottom:16px;border:2px solid var(--primary)20;box-shadow:var(--shadow);">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="font-size:20px;">📖</span>
                                <div>
                                    <div style="font-size:14px;font-weight:600;color:var(--dark);">
                                        Progreso de Lectura
                                        <span class="historias-leidas-contador" style="font-size:12px;font-weight:400;color:var(--gray);">${leidas} leídas</span>
                                    </div>
                                    <div style="font-size:12px;color:var(--gray);">${total} historias en total</div>
                                </div>
                            </div>
                            <div style="text-align:center;min-width:80px;">
                                <div style="font-size:28px;font-weight:800;color:${pctLeidas >= 80 ? 'var(--success)' : pctLeidas >= 40 ? 'var(--warning)' : 'var(--danger)'};">${pctLeidas}%</div>
                                <div style="font-size:9px;color:var(--gray-light);">${pctLeidas >= 80 ? '🏆 Excelente' : pctLeidas >= 40 ? '📖 Buen progreso' : '🌱 Empieza a leer'}</div>
                            </div>
                        </div>
                        <div style="height:6px;background:var(--bg);border-radius:3px;overflow:hidden;margin-top:8px;">
                            <div class="historias-leidas-progreso" style="height:100%;width:${pctLeidas}%;background:${pctLeidas >= 80 ? 'linear-gradient(90deg, #6C5CE7, #00CEC9)' : 'linear-gradient(90deg, #6C5CE7, #A29BFE)'};border-radius:3px;transition:width 0.6s ease;"></div>
                        </div>
                    </div>

                    <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center;background:var(--white);padding:10px 16px;border-radius:12px;box-shadow:var(--shadow);">
                        <div style="display:flex;gap:6px;align-items:center;">
                            <span style="font-size:12px;font-weight:600;color:var(--gray);">📋 Vista:</span>
                            <button onclick="window.UIBiblioteca._toggleVistaAgrupada()" 
                                    style="padding:4px 12px;font-size:11px;border-radius:6px;border:2px solid ${this._vistaAgrupada ? 'var(--primary)' : 'var(--light)'};background:${this._vistaAgrupada ? 'var(--primary)08' : 'var(--white)'};color:${this._vistaAgrupada ? 'var(--primary)' : 'var(--gray)'};cursor:pointer;transition:all 0.3s;"
                                    onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                                <i class="fas fa-layer-group"></i> Por Temas
                            </button>
                            <button onclick="window.UIBiblioteca._toggleVistaAgrupada()" 
                                    style="padding:4px 12px;font-size:11px;border-radius:6px;border:2px solid ${!this._vistaAgrupada ? 'var(--primary)' : 'var(--light)'};background:${!this._vistaAgrupada ? 'var(--primary)08' : 'var(--white)'};color:${!this._vistaAgrupada ? 'var(--primary)' : 'var(--gray)'};cursor:pointer;transition:all 0.3s;"
                                    onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                                <i class="fas fa-list"></i> Lista Plana
                            </button>
                            ${this._vistaAgrupada ? `<span style="font-size:10px;color:var(--secondary);font-weight:600;">📌 Ordenado por Temas (Nivel → Predefinidos → Importados → Manuales)</span>` : ''}
                        </div>
                        
                        <div style="flex:1;min-width:150px;position:relative;">
                            <i class="fas fa-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--gray);font-size:12px;"></i>
                            <input type="text" id="buscarBiblioteca" 
                                   placeholder="🔍 Buscar por título o tema..." 
                                   value="${this._busqueda}"
                                   style="width:100%;padding:6px 10px 6px 30px;border:2px solid var(--light);border-radius:6px;font-size:13px;font-family:var(--font);transition:all 0.3s;"
                                   onfocus="this.style.borderColor='var(--primary)'" 
                                   onblur="this.style.borderColor='var(--light)'"
                                   oninput="window.UIBiblioteca._aplicarFiltroBusqueda(this.value)">
                        </div>
                        
                        <select id="filtroOrigenBiblioteca" onchange="window.UIBiblioteca._aplicarFiltroOrigen(this.value)"
                                style="padding:6px 10px;border:2px solid var(--light);border-radius:6px;font-size:12px;font-family:var(--font);background:var(--white);">
                            <option value="todos" ${this._filtroOrigen === 'todos' ? 'selected' : ''}>📚 Todos los orígenes</option>
                            ${Object.entries(this._ORIGENES).map(([key, info]) => `
                                <option value="${key}" ${this._filtroOrigen === key ? 'selected' : ''} 
                                        style="color:${info.color};">${info.label}</option>
                            `).join('')}
                        </select>
                        
                        <select id="filtroEstadoBiblioteca" onchange="window.UIBiblioteca._aplicarFiltroEstado(this.value)"
                                style="padding:6px 10px;border:2px solid var(--light);border-radius:6px;font-size:12px;font-family:var(--font);background:var(--white);">
                            <option value="todos" ${this._filtroEstado === 'todos' ? 'selected' : ''}>📊 Todos</option>
                            <option value="leidas" ${this._filtroEstado === 'leidas' ? 'selected' : ''}>✅ Leídas</option>
                            <option value="no_leidas" ${this._filtroEstado === 'no_leidas' ? 'selected' : ''}>📖 No leídas</option>
                            <option value="completadas" ${this._filtroEstado === 'completadas' ? 'selected' : ''}>🎓 Completadas</option>
                            <option value="en_curso" ${this._filtroEstado === 'en_curso' ? 'selected' : ''}>📖 En curso</option>
                        </select>
                        
                        <span style="font-size:11px;color:var(--gray-light);">
                            ${totalItems} historias · ${totalPaginas} páginas
                            ${this._vistaAgrupada ? ` · ${totalGrupos} temas` : ''}
                        </span>
                    </div>

                    <div id="bibliotecaGrid" style="display:flex;flex-direction:column;gap:16px;">
            `;

            if (historiasPagina.length === 0) {
                html += `
                    <div style="text-align:center;padding:40px;color:var(--gray);background:var(--bg);border-radius:12px;border:2px dashed var(--light);">
                        <i class="fas fa-book" style="font-size:48px;color:var(--primary-light);display:block;margin-bottom:16px;"></i>
                        <p style="font-size:16px;font-weight:500;">No hay historias en la biblioteca</p>
                        <p style="font-size:13px;color:var(--gray-light);">
                            ${this._busqueda ? 'No se encontraron resultados para "' + this._busqueda + '"' : 
                              'Genera o importa contenido para empezar a leer.'}
                        </p>
                        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
                            <button class="btn-primary" onclick="window.uiCore.irAModulo('temas')" style="padding:8px 20px;">
                                <i class="fas fa-folder-open"></i> Ir a Temas
                            </button>
                            <button class="btn-secondary" onclick="window.uiCore.irAElipse()" style="padding:8px 20px;">
                                <i class="fas fa-wave-square"></i> Ir a Elipse
                            </button>
                        </div>
                    </div>
                `;
            } else if (this._vistaAgrupada && grupos) {
                for (const grupo of grupos) {
                    const historiasGrupo = grupo.historias;
                    const totalGrupo = historiasGrupo.length;
                    const leidasGrupo = historiasGrupo.filter(h => h._leida).length;
                    const completadasGrupo = historiasGrupo.filter(h => h._progreso?.completada).length;
                    const pctGrupo = totalGrupo > 0 ? Math.round((leidasGrupo / totalGrupo) * 100) : 0;
                    const origenLabel = grupo.origen?.label || '📚';
                    const origenColor = grupo.origen?.color || 'var(--primary)';
                    
                    const nivelesEnGrupo = {};
                    for (const h of historiasGrupo) {
                        const nivel = h._nivel || h.nivel || 'A1';
                        nivelesEnGrupo[nivel] = (nivelesEnGrupo[nivel] || 0) + 1;
                    }
                    const nivelesStr = Object.keys(nivelesEnGrupo)
                        .sort((a, b) => (this._NIVEL_WEIGHT[a] || 99) - (this._NIVEL_WEIGHT[b] || 99))
                        .map(n => `${this._getEmojiNivel(n)} ${n} (${nivelesEnGrupo[n]})`)
                        .join(' · ');
                    
                    html += `
                        <div class="grupo-tema" style="background:var(--white);border-radius:14px;border:2px solid ${origenColor}30;overflow:hidden;box-shadow:var(--shadow);">
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 18px;background:${origenColor}08;border-bottom:1px solid ${origenColor}20;cursor:pointer;"
                                 onclick="window.UIBiblioteca._toggleGrupoTema('${grupo.temaId}')">
                                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                                    <span style="font-size:18px;">${origenLabel}</span>
                                    <span style="font-size:16px;font-weight:700;color:var(--dark);">${grupo.nombre}</span>
                                    <span style="font-size:11px;color:var(--gray-light);">(${totalGrupo} historias)</span>
                                    <span style="font-size:10px;padding:2px 10px;border-radius:10px;background:${origenColor}20;color:${origenColor};font-weight:600;">${origenLabel}</span>
                                    <span style="font-size:10px;color:var(--gray-light);">🎯 ${grupo.nivel || 'A1'}</span>
                                </div>
                                <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                                    <div style="display:flex;gap:6px;font-size:10px;color:var(--gray-light);">
                                        <span>📖 ${leidasGrupo} leídas</span>
                                        <span>🎓 ${completadasGrupo} completadas</span>
                                    </div>
                                    <div style="width:80px;height:4px;background:var(--bg);border-radius:2px;overflow:hidden;">
                                        <div style="height:100%;width:${pctGrupo}%;background:${origenColor};border-radius:2px;transition:width 0.5s ease;"></div>
                                    </div>
                                    <span style="font-size:10px;color:var(--gray-light);">
                                        ${nivelesStr}
                                    </span>
                                    <span style="font-size:12px;color:var(--gray-light);">
                                        <i class="fas fa-chevron-down" id="toggleIcon_${grupo.temaId}"></i>
                                    </span>
                                </div>
                            </div>
                            <div id="grupoContenido_${grupo.temaId}" style="padding:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px;">
                    `;
                    
                    for (const h of historiasGrupo) {
                        html += this._renderizarTarjetaHistoria(h);
                    }
                    
                    html += `
                            </div>
                        </div>
                    `;
                }
            } else {
                html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;">`;
                for (const h of historiasPagina) {
                    html += this._renderizarTarjetaHistoria(h);
                }
                html += `</div>`;
            }

            html += `
                    </div>

                    ${totalPaginas > 1 ? `
                        <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin:16px 0;flex-wrap:wrap;">
                            <button class="btn-secondary" onclick="window.UIBiblioteca._irPagina(${this._paginaActual - 1})" 
                                    style="padding:4px 12px;font-size:11px;border-radius:6px;border:1px solid var(--light);background:${this._paginaActual <= 1 ? 'var(--bg)' : 'var(--white)'};color:${this._paginaActual <= 1 ? 'var(--gray-light)' : 'var(--dark)'};cursor:${this._paginaActual <= 1 ? 'default' : 'pointer'};transition:all 0.2s;"
                                    ${this._paginaActual <= 1 ? 'disabled' : ''}
                                    onmouseover="${this._paginaActual > 1 ? 'this.style.background=\'var(--primary)08\';this.style.borderColor=\'var(--primary)\'' : ''}"
                                    onmouseout="${this._paginaActual > 1 ? 'this.style.background=\'var(--white)\';this.style.borderColor=\'var(--light)\'' : ''}">
                                <i class="fas fa-chevron-left"></i> Anterior
                            </button>
                            <span style="font-size:12px;color:var(--gray);font-weight:600;">
                                ${this._paginaActual} / ${totalPaginas}
                            </span>
                            <button class="btn-secondary" onclick="window.UIBiblioteca._irPagina(${this._paginaActual + 1})" 
                                    style="padding:4px 12px;font-size:11px;border-radius:6px;border:1px solid var(--light);background:${this._paginaActual >= totalPaginas ? 'var(--bg)' : 'var(--white)'};color:${this._paginaActual >= totalPaginas ? 'var(--gray-light)' : 'var(--dark)'};cursor:${this._paginaActual >= totalPaginas ? 'default' : 'pointer'};transition:all 0.2s;"
                                    ${this._paginaActual >= totalPaginas ? 'disabled' : ''}
                                    onmouseover="${this._paginaActual < totalPaginas ? 'this.style.background=\'var(--primary)08\';this.style.borderColor=\'var(--primary)\'' : ''}"
                                    onmouseout="${this._paginaActual < totalPaginas ? 'this.style.background=\'var(--white)\';this.style.borderColor=\'var(--light)\'' : ''}">
                                Siguiente <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    ` : ''}

                    <div style="margin-top:16px;padding:8px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--light);font-size:11px;color:var(--gray-light);text-align:center;">
                        📚 ${total} historias · ✅ ${leidas} leídas · 🎓 ${completadas} completadas · 📖 ${pctLeidas}% leído · 🧠 ${pctCompletadas}% completado
                        <br>
                        <span style="font-size:9px;color:var(--gray-light);">
                            💡 Marca una historia como "Leída" para seguir tu progreso de lectura
                        </span>
                        <br>
                        <span style="font-size:9px;color:var(--primary);">
                            🔄 El estado de "Completado" se sincroniza con Temas, Elipse y Ondas Cruzadas
                        </span>
                        <br>
                        <span style="font-size:9px;color:var(--secondary);">
                            📋 Vista ${this._vistaAgrupada ? 'agrupada por Temas (orden: Nivel → Predefinidos → Importados → Manuales)' : 'en lista plana'} · 
                            ${this._mostrarTraduccion ? '🌐 Traducción visible' : '🔒 Traducción oculta'}
                            ${this._vistaAgrupada ? ' · 📊 Historias ordenadas por nivel (A1→C2) y dentro de cada tema por título' : ''}
                        </span>
                        <br>
                        <span style="font-size:9px;color:var(--success);">
                            🔥 El orden de los temas coincide con el que ves en "Temas" (predefinidos por nivel → importados → manuales)
                        </span>
                    </div>
                </div>
            `;

            container.innerHTML = html;
            this._actualizarContadorHistoriasLeidas();

        } catch (error) {
            console.error('❌ Error renderizando biblioteca:', error);
            container.innerHTML = `
                <div style="text-align:center;padding:60px 20px;color:var(--gray);">
                    <i class="fas fa-exclamation-triangle" style="font-size:48px;color:var(--danger);display:block;margin-bottom:16px;"></i>
                    <p style="font-size:16px;font-weight:500;">Error cargando la biblioteca</p>
                    <p style="font-size:13px;color:var(--gray-light);">${error.message}</p>
                    <button class="btn-primary" onclick="window.UIBiblioteca.cargar(window.UIBiblioteca._core)" style="margin-top:12px;">
                        <i class="fas fa-sync"></i> Reintentar
                    </button>
                </div>
            `;
        }
        
        this._cargando = false;
    }

    _getEmojiNivel(nivel) {
        const emojis = {
            'A1': '🌱',
            'A2': '🌿',
            'B1': '🌳',
            'B2': '🌲',
            'C1': '🏔️',
            'C2': '🗻'
        };
        return emojis[nivel] || '📚';
    }

    _toggleVistaAgrupada() {
        this._vistaAgrupada = !this._vistaAgrupada;
        this._paginaActual = 1;
        this._guardarPreferencias();
        this._renderizarBiblioteca();
        this._core?.mostrarToast(
            this._vistaAgrupada ? '📋 Vista agrupada por Temas (orden: Nivel → Predefinidos → Importados → Manuales)' : '📋 Vista en lista plana',
            'info'
        );
    }

    _toggleGrupoTema(temaId) {
        const contenido = document.getElementById(`grupoContenido_${temaId}`);
        const icono = document.getElementById(`toggleIcon_${temaId}`);
        if (contenido) {
            const isHidden = contenido.style.display === 'none';
            contenido.style.display = isHidden ? 'grid' : 'none';
            if (icono) {
                icono.className = isHidden ? 'fas fa-chevron-down' : 'fas fa-chevron-right';
            }
        }
    }

    _renderizarTarjetaHistoria(historia) {
        const origen = historia._origen || { label: '📄 Desconocido', color: 'var(--gray)' };
        const progreso = historia._progreso || { total: 0, completadas: 0, porcentaje: 0, completada: false };
        const esLeida = historia._leida || false;
        const titulo = historia.titulo || '📖 Historia sin título';
        const fecha = historia.fechaCreacion ? new Date(historia.fechaCreacion).toLocaleDateString() : '';
        const totalFrases = progreso.total || 0;
        const completadas = progreso.completadas || 0;
        const pct = progreso.porcentaje || 0;
        const completada = progreso.completada || false;
        const esOnda = historia._esOnda === true;
        const esOndaCruzada = historia._esOndaCruzada === true;
        const esImportada = historia._importadoDesdeJSON === true || historia._esImportada === true;
        const temaNombre = historia._temaNombre || 'Sin tema';
        const nivel = historia._nivel || historia.nivel || 'A1';
        const emojiNivel = this._getEmojiNivel(nivel);
        const colorNivel = this._getColorNivel(nivel);
        
        let badgeExtra = '';
        if (esOndaCruzada) badgeExtra = '<span style="font-size:9px;color:white;background:#00CEC9;padding:1px 8px;border-radius:8px;">🌊 Cruzada</span>';
        else if (esOnda) badgeExtra = '<span style="font-size:9px;color:white;background:#6C5CE7;padding:1px 8px;border-radius:8px;">🌌 Elipse</span>';
        else if (esImportada) badgeExtra = '<span style="font-size:9px;color:white;background:#FDCB6E;padding:1px 8px;border-radius:8px;">📥 Importada</span>';
        
        // Mostrar el nivel del tema
        const nivelTema = historia._nivelTema || nivel;
        
        return `
            <div class="historia-card" data-historia-id="${historia.id}" 
                 style="background: ${esLeida ? 'rgba(0, 184, 148, 0.05)' : 'var(--white)'};
                        border-radius: 12px;
                        padding: 14px 16px;
                        border: 1px solid ${esLeida ? 'var(--success)' : 'var(--light)'};
                        border-left: 4px solid ${esLeida ? 'var(--success)' : origen.color};
                        box-shadow: var(--shadow);
                        transition: all 0.3s ease;
                        position: relative;
                        cursor: pointer;"
                 onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 25px rgba(0,0,0,0.1)'" 
                 onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'"
                 onclick="window.UIBiblioteca._verHistoria(${historia.id})">
                
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px;">
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                        <span style="font-size:10px;font-weight:600;color:${origen.color};background:${origen.color}15;padding:2px 10px;border-radius:12px;">
                            ${origen.label}
                        </span>
                        <span style="font-size:10px;color:var(--gray-light);background:var(--bg);padding:2px 10px;border-radius:12px;">
                            📁 ${temaNombre}
                        </span>
                        <span style="font-size:10px;font-weight:700;color:${colorNivel};background:${colorNivel}15;padding:2px 10px;border-radius:12px;border:1px solid ${colorNivel}30;">
                            ${emojiNivel} ${nivelTema || nivel}
                        </span>
                        ${badgeExtra}
                        ${completada ? '<span style="font-size:9px;color:var(--success);font-weight:600;">✅ Completada</span>' : ''}
                        ${esLeida ? '<span style="font-size:9px;color:var(--success);font-weight:600;">📖 Leída</span>' : ''}
                    </div>
                    <span style="font-size:10px;color:var(--gray-light);">${fecha}</span>
                </div>
                
                <div style="font-size:15px;font-weight:700;color:var(--dark);margin-bottom:4px;display:flex;gap:6px;align-items:center;">
                    ${titulo}
                </div>
                
                <div style="display:flex;gap:12px;font-size:11px;color:var(--gray-light);flex-wrap:wrap;margin-bottom:6px;">
                    <span>📝 ${totalFrases} frases</span>
                    <span>🎯 ${pct}% completado</span>
                    <span>🌍 ${historia.idioma || 'es'}</span>
                    ${historia.nivel ? `<span>🎯 ${historia.nivel}</span>` : ''}
                    <span>📂 ${temaNombre}</span>
                </div>
                
                <div style="height:4px;background:var(--bg);border-radius:2px;overflow:hidden;margin-top:4px;">
                    <div class="historia-progreso" style="height:100%;width:${Math.max(pct, esLeida ? 100 : 0)}%;background:${completada ? 'var(--success)' : esLeida ? 'var(--warning)' : 'var(--primary)'};border-radius:2px;transition:width 0.5s ease;"></div>
                </div>
                
                <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;align-items:center;">
                    <button class="btn-secondary" onclick="event.stopPropagation();window.UIBiblioteca._estudiarHistoria(${historia.id})" 
                            style="padding:4px 12px;font-size:11px;background:var(--primary);color:white;border:none;border-radius:4px;cursor:pointer;transition:all 0.2s;"
                            onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                        <i class="fas fa-play"></i> ${completada ? 'Repasar' : 'Estudiar'}
                    </button>
                    
                    <button class="btn-secondary" onclick="event.stopPropagation();window.UIBiblioteca._leerHistoria(${historia.id})" 
                            style="padding:4px 12px;font-size:11px;background:var(--secondary);color:white;border:none;border-radius:4px;cursor:pointer;transition:all 0.2s;"
                            onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                        <i class="fas fa-book"></i> Leer
                    </button>
                    
                    <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:10px;padding:2px 8px;background:${esLeida ? 'var(--success)08' : 'var(--bg)'};border-radius:8px;border:1px solid ${esLeida ? 'var(--success)' : 'var(--light)'};transition:all 0.3s;"
                           onclick="event.stopPropagation();"
                           onmouseover="this.style.borderColor='var(--primary)'" 
                           onmouseout="this.style.borderColor='${esLeida ? 'var(--success)' : 'var(--light)'}'">
                        <input type="checkbox" class="historia-checkbox-input" 
                               ${esLeida ? 'checked' : ''}
                               onchange="window.UIBiblioteca._toggleHistoriaLeida(${historia.id}, this.checked)"
                               style="width:14px;height:14px;cursor:pointer;">
                        <span class="historia-leida-badge" style="font-size:10px;font-weight:600;color:${esLeida ? 'var(--success)' : 'var(--gray)'};">
                            ${esLeida ? '✅ Leída' : '📖 No leída'}
                        </span>
                    </label>
                    
                    <button class="btn-secondary" onclick="event.stopPropagation();window.UIBiblioteca._irAlOrigen(${historia.id})" 
                            style="padding:2px 10px;font-size:10px;background:${origen.color}15;color:${origen.color};border:1px solid ${origen.color}30;border-radius:4px;cursor:pointer;transition:all 0.2s;"
                            onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                        <i class="fas fa-arrow-right"></i> Origen
                    </button>
                    
                    <label style="display:flex;align-items:center;gap:3px;font-size:9px;cursor:pointer;padding:2px 8px;background:${completada ? 'var(--success)15' : 'var(--bg)'};border-radius:10px;border:1px solid ${completada ? 'var(--success)' : 'var(--light)'};"
                           onclick="event.stopPropagation();">
                        <input type="checkbox" ${completada ? 'checked' : ''} 
                               onchange="(async () => {
                                   await window.gestorProgresoHistorias.cambiarEstadoHistoria(${historia.id}, this.checked, 'biblioteca');
                                   setTimeout(() => {
                                       window.UIBiblioteca.cargar(window.UIBiblioteca._core);
                                   }, 300);
                               })()"
                               style="margin:0;width:12px;height:12px;cursor:pointer;">
                        <span style="color:${completada ? 'var(--success)' : 'var(--gray)'};font-size:8px;">${completada ? '✅' : '⬜'}</span>
                    </label>
                </div>
                
                <div style="margin-top:4px;font-size:8px;color:var(--gray-light);display:flex;gap:8px;flex-wrap:wrap;">
                    <span>🔄 ${completada ? 'Sincronizado' : 'Pendiente'}</span>
                    ${esOndaCruzada ? '<span>🌊 Cruzada</span>' : ''}
                    ${esOnda ? '<span>🌌 Elipse</span>' : ''}
                    <span>📁 ${temaNombre}</span>
                    <span>${emojiNivel} ${nivelTema || nivel}</span>
                </div>
            </div>
        `;
    }

    _getColorNivel(nivel) {
        const colores = {
            'A1': '#6C5CE7',
            'A2': '#0984E3',
            'B1': '#00B894',
            'B2': '#FDCB6E',
            'C1': '#E17055',
            'C2': '#FD79A8'
        };
        return colores[nivel] || 'var(--gray)';
    }

    _aplicarFiltros(historias) {
        let filtradas = [...historias];
        
        if (this._filtroOrigen !== 'todos') {
            filtradas = filtradas.filter(h => h._origen?.tipo === this._filtroOrigen);
        }
        
        if (this._filtroEstado === 'leidas') {
            filtradas = filtradas.filter(h => h._leida);
        } else if (this._filtroEstado === 'no_leidas') {
            filtradas = filtradas.filter(h => !h._leida);
        } else if (this._filtroEstado === 'completadas') {
            filtradas = filtradas.filter(h => h._progreso?.completada);
        } else if (this._filtroEstado === 'en_curso') {
            filtradas = filtradas.filter(h => !h._progreso?.completada && h._progreso?.porcentaje > 0);
        }
        
        if (this._busqueda) {
            const busquedaLower = this._busqueda.toLowerCase();
            filtradas = filtradas.filter(h => {
                const titulo = (h.titulo || '').toLowerCase();
                const temaNombre = (h._temaNombre || '').toLowerCase();
                const origenLabel = (h._origen?.label || '').toLowerCase();
                const nivel = (h._nivel || h.nivel || '').toLowerCase();
                return titulo.includes(busquedaLower) || 
                       temaNombre.includes(busquedaLower) || 
                       origenLabel.includes(busquedaLower) ||
                       nivel.includes(busquedaLower);
            });
        }
        
        return filtradas;
    }

    _aplicarFiltroBusqueda(valor) {
        this._busqueda = valor.trim();
        this._paginaActual = 1;
        this._renderizarBiblioteca();
    }

    _aplicarFiltroOrigen(valor) {
        this._filtroOrigen = valor;
        this._paginaActual = 1;
        this._renderizarBiblioteca();
    }

    _aplicarFiltroEstado(valor) {
        this._filtroEstado = valor;
        this._paginaActual = 1;
        this._renderizarBiblioteca();
    }

    _limpiarFiltros() {
        this._busqueda = '';
        this._filtroOrigen = 'todos';
        this._filtroEstado = 'todos';
        this._paginaActual = 1;
        
        const input = document.getElementById('buscarBiblioteca');
        if (input) input.value = '';
        
        const selectOrigen = document.getElementById('filtroOrigenBiblioteca');
        if (selectOrigen) selectOrigen.value = 'todos';
        
        const selectEstado = document.getElementById('filtroEstadoBiblioteca');
        if (selectEstado) selectEstado.value = 'todos';
        
        this._renderizarBiblioteca();
    }

    _irPagina(pagina) {
        let totalPaginas = 1;
        
        if (this._vistaAgrupada) {
            const gruposPorPagina = this._gruposPorPagina || Math.max(2, Math.floor(this._itemsPorPagina / 3));
            totalPaginas = Math.max(1, Math.ceil(this._totalGrupos / gruposPorPagina));
            console.log(`📄 Vista agrupada: ${this._totalGrupos} grupos, ${gruposPorPagina} grupos/página, total páginas: ${totalPaginas}`);
        } else {
            totalPaginas = Math.max(1, Math.ceil(this._totalItems / this._itemsPorPagina));
        }
        
        if (pagina < 1 || pagina > totalPaginas) return;
        if (pagina === this._paginaActual) return;
        
        console.log(`📄 Navegando a página ${pagina} de ${totalPaginas}`);
        this._paginaActual = pagina;
        this._renderizarBiblioteca();
    }

    async _verHistoria(historiaId) {
        console.log('📖 Abriendo historia:', historiaId);
        const historia = await db.get('historias', historiaId);
        if (!historia) {
            this._core?.mostrarToast('❌ Historia no encontrada', 'error');
            return;
        }
        
        const frases = await db.obtenerFrasesPorHistoria(historiaId);
        if (frases.length === 0) {
            this._core?.mostrarToast('❌ Esta historia no tiene frases para leer', 'warning');
            return;
        }
        
        this._historiaSeleccionada = historia;
        this._frasesActuales = frases;
        this._modoVista = 'lectura';
        this._renderizarVisorHistoria(historia, frases);
    }

    async _leerHistoria(historiaId) {
        return this._verHistoria(historiaId);
    }

    _renderizarVisorHistoria(historia, frases) {
        const container = this._container;
        if (!container) return;
        
        const origen = this._detectarOrigenHistoria(historia);
        const esLeida = this._historiasLeidas.has(historia.id);
        const titulo = historia.titulo || 'Historia sin título';
        const idioma = historia.idioma || 'es';
        const esJeroglifico = this._esJeroglifico(idioma);
        const temaNombre = historia._temaNombre || 'Sin tema';
        const nivel = historia._nivel || historia.nivel || 'A1';
        const emojiNivel = this._getEmojiNivel(nivel);
        const colorNivel = this._getColorNivel(nivel);
        const nivelTema = historia._nivelTema || nivel;
        
        let html = `
            <div style="padding:16px;max-width:900px;margin:0 auto;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;padding:8px 16px;background:linear-gradient(135deg, var(--primary)08, var(--secondary)08);border-radius:12px;border:2px solid var(--primary)20;">
                    <button class="btn-secondary" onclick="window.UIBiblioteca._volverALaBiblioteca()" 
                            style="padding:6px 14px;font-size:13px;background:var(--primary);color:white;border:none;border-radius:6px;cursor:pointer;">
                        <i class="fas fa-arrow-left"></i> Volver
                    </button>
                    <span style="font-size:24px;">${origen.label}</span>
                    <div style="flex:1;">
                        <h2 style="font-size:20px;font-weight:800;color:var(--dark);margin:0;">${titulo}</h2>
                        <p style="font-size:12px;color:var(--gray);margin:2px 0 0;">
                            ${frases.length} frases · 
                            <span style="color:${colorNivel};font-weight:600;">${emojiNivel} ${nivelTema}</span> · 
                            ${idioma}
                            <span style="font-size:10px;color:${origen.color};margin-left:8px;">${origen.label}</span>
                            <span style="font-size:10px;color:var(--gray-light);margin-left:8px;">📁 ${temaNombre}</span>
                            ${esLeida ? '<span style="font-size:10px;color:var(--success);margin-left:8px;">✅ Leída</span>' : ''}
                        </p>
                    </div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                        <button onclick="window.UIBiblioteca._toggleMostrarTraduccion()" 
                                style="padding:4px 12px;font-size:11px;border-radius:6px;border:2px solid ${this._mostrarTraduccion ? 'var(--success)' : 'var(--gray)'};background:${this._mostrarTraduccion ? 'var(--success)10' : 'var(--bg)'};color:${this._mostrarTraduccion ? 'var(--success)' : 'var(--gray)'};cursor:pointer;transition:all 0.3s;"
                                onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'"
                                title="${this._mostrarTraduccion ? 'Ocultar traducción' : 'Mostrar traducción'}">
                            <i class="fas ${this._mostrarTraduccion ? 'fa-eye' : 'fa-eye-slash'}"></i>
                            ${this._mostrarTraduccion ? 'Mostrar' : 'Ocultar'}
                        </button>
                        
                        <button class="btn-primary" onclick="window.UIBiblioteca._estudiarHistoria(${historia.id})" 
                                style="padding:4px 14px;font-size:11px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:4px;cursor:pointer;">
                            <i class="fas fa-play"></i> Estudiar
                        </button>
                        
                        <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;padding:2px 8px;background:${esLeida ? 'var(--success)08' : 'var(--bg)'};border-radius:8px;border:1px solid ${esLeida ? 'var(--success)' : 'var(--light)'};">
                            <input type="checkbox" ${esLeida ? 'checked' : ''} 
                                   onchange="window.UIBiblioteca._toggleHistoriaLeida(${historia.id}, this.checked)"
                                   style="width:14px;height:14px;cursor:pointer;">
                            <span style="color:${esLeida ? 'var(--success)' : 'var(--gray)'};">${esLeida ? '✅ Leída' : '📖 No leída'}</span>
                        </label>
                        
                        <button class="btn-secondary" onclick="window.UIBiblioteca._irAlOrigen(${historia.id})" 
                                style="padding:4px 12px;font-size:11px;background:${origen.color}15;color:${origen.color};border:1px solid ${origen.color};border-radius:4px;cursor:pointer;">
                            <i class="fas fa-arrow-right"></i> Origen
                        </button>
                    </div>
                </div>
                
                <div style="display:flex;flex-direction:column;gap:12px;">
        `;
        
        let numFrase = 0;
        for (const f of frases) {
            numFrase++;
            const transcripcion = this._obtenerTranscripcionFrase(f);
            const esJeroglificoF = f.esJeroglifico || esJeroglifico;
            const mostrarTraduccion = this._mostrarTraduccion;
            
            html += `
                <div style="background:var(--white);border-radius:10px;padding:14px 18px;box-shadow:var(--shadow);border-left:4px solid var(--primary);">
                    <div style="display:flex;gap:8px;align-items:start;">
                        <span style="font-size:12px;font-weight:600;color:var(--gray-light);min-width:28px;">${numFrase}.</span>
                        <div style="flex:1;">
                            <div style="font-size:${esJeroglificoF ? '22px' : '18px'};font-weight:700;color:var(--dark);line-height:1.6;">
                                ${esJeroglificoF ? (f.segmentacion?.hanzi || f.original) : f.original}
                            </div>
                            ${transcripcion ? `
                                <div style="font-size:14px;color:${esJeroglificoF ? 'var(--primary)' : 'var(--secondary)'};margin-top:2px;letter-spacing:1px;">
                                    ${esJeroglificoF ? '🔊' : '🎤'} ${transcripcion}
                                </div>
                            ` : ''}
                            ${mostrarTraduccion ? `
                                <div style="font-size:16px;color:var(--gray);margin-top:4px;">→ ${f.traduccion}</div>
                            ` : `
                                <div style="font-size:13px;color:var(--gray-light);margin-top:4px;font-style:italic;padding:4px 12px;background:var(--bg);border-radius:6px;border:1px dashed var(--light);">
                                    <i class="fas fa-eye-slash" style="font-size:11px;margin-right:4px;"></i>
                                    Traducción oculta
                                </div>
                            `}
                            ${f.reglaGramatical ? `
                                <div style="font-size:11px;color:var(--primary);margin-top:4px;padding:2px 10px;background:var(--primary)08;border-radius:4px;display:inline-block;">
                                    📋 ${f.reglaGramatical}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += `
                </div>
                
                <div style="display:flex;gap:10px;margin-top:20px;justify-content:center;flex-wrap:wrap;padding:12px 0;border-top:2px solid var(--light);">
                    <button class="btn-primary" onclick="window.UIBiblioteca._estudiarHistoria(${historia.id})" 
                            style="padding:8px 24px;font-size:14px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:8px;cursor:pointer;">
                        <i class="fas fa-play"></i> Estudiar esta historia
                    </button>
                    <button class="btn-secondary" onclick="window.UIBiblioteca._toggleMostrarTraduccion()" 
                            style="padding:8px 24px;font-size:14px;background:${this._mostrarTraduccion ? 'var(--success)' : 'var(--gray)'};color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s;"
                            onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='none'">
                        <i class="fas ${this._mostrarTraduccion ? 'fa-eye' : 'fa-eye-slash'}"></i>
                        ${this._mostrarTraduccion ? 'Ocultar traducción' : 'Mostrar traducción'}
                    </button>
                    <button class="btn-secondary" onclick="window.UIBiblioteca._volverALaBiblioteca()" 
                            style="padding:8px 24px;font-size:14px;background:var(--light);color:var(--dark);border:none;border-radius:8px;cursor:pointer;">
                        <i class="fas fa-arrow-left"></i> Volver a la biblioteca
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    _toggleMostrarTraduccion() {
        this._mostrarTraduccion = !this._mostrarTraduccion;
        this._guardarPreferencias();
        
        if (this._modoVista === 'lectura' && this._historiaSeleccionada) {
            const historia = this._historiaSeleccionada;
            const frases = this._frasesActuales || [];
            if (frases.length > 0) {
                this._renderizarVisorHistoria(historia, frases);
            } else {
                db.obtenerFrasesPorHistoria(historia.id).then(frases => {
                    this._frasesActuales = frases;
                    this._renderizarVisorHistoria(historia, frases);
                });
            }
        } else {
            this._core?.mostrarToast(
                this._mostrarTraduccion ? '🌐 Traducción visible' : '🔒 Traducción oculta',
                'info'
            );
        }
    }

    async _estudiarHistoria(historiaId) {
        if (!window.pipeline) {
            this._core?.mostrarToast('❌ Pipeline no disponible', 'error');
            return;
        }

        try {
            const historia = await db.get('historias', historiaId);
            if (!historia) {
                this._core?.mostrarToast('❌ Historia no encontrada', 'error');
                return;
            }

            const idioma = historia.idioma || gestorIdiomas?.getIdiomaActivo() || 'es';
            if (historia.idioma && historia.idioma !== idioma) {
                this._core?.mostrarToast(`⚠️ Esta historia es de "${historia.idioma}", no de "${idioma}"`, 'warning');
                return;
            }

            const estaCompletada = historia.estado === 'completada' || historia._completada === true;
            const rcnActual = historia._rcnPromedio || 0;

            const origen = await this._obtenerOrigenCompleto(historia);
            const esOndaCruzada = historia._esOndaCruzada === true;
            const esOnda = historia._esOnda === true && !esOndaCruzada;

            if (estaCompletada) {
                console.log(`✅ Historia "${historia.titulo}" ya está completada (RCN: ${rcnActual.toFixed(1)})`);

                const frases = await db.obtenerFrasesPorHistoria(historiaId);
                const totalFrases = frases.length;
                let frasesCompletadas = 0;
                for (const f of frases) {
                    const progreso = await db.obtenerProgreso(f.id);
                    if (progreso && (progreso.rcn >= 4 || progreso.estado === 'completada')) {
                        frasesCompletadas++;
                    }
                }

                const tipoLabel = origen.label || '📄 Historia';

                const opcion = await this._core?.confirm(
                    `✅ **"${historia.titulo}" ya está completada**\n\n` +
                    `📊 **Estadísticas:**\n` +
                    `• ${tipoLabel} · Nivel ${historia.nivel || 'A1'}\n` +
                    `• RCN: ${rcnActual.toFixed(1)} / 5.0\n` +
                    `• Frases: ${frasesCompletadas}/${totalFrases} completadas\n` +
                    `• ${frasesCompletadas === totalFrases ? '✅ 100% completada' : `🔄 ${Math.round((frasesCompletadas/totalFrases)*100)}% progreso`}\n\n` +
                    `¿Qué quieres hacer?\n` +
                    `• "Aceptar" → Volver a estudiar la historia (el progreso se mantendrá)\n` +
                    `• "Cancelar" → Volver a la biblioteca`,
                    `📖 Historia Completada`
                );

                if (!opcion) {
                    this._volverALaBiblioteca();
                    return;
                }
            }

            this._historiaEnEstudio = historiaId;
            this._origenAccion = 'biblioteca';
            this._esperandoRetorno = true;
            
            window._volverAlModoAnterior = async () => {
                console.log('🔄 Volviendo a la biblioteca después de estudiar');
                this._esperandoRetorno = false;
                this._origenAccion = null;
                this._historiaEnEstudio = null;
                this._restaurarBotonesEstudio();
                this._core.irAModulo('biblioteca');
                this.cargar(this._core);
                this._core?.mostrarToast('📚 De vuelta a la Biblioteca', 'info');
            };
            
            this._inyectarBotonVolver('biblioteca');

            const origenEstudio = esOndaCruzada ? 'cruzada' : (esOnda ? 'elipse' : 'biblioteca');
            console.log(`📖 Estudiando historia "${historia.titulo}" con origen: ${origenEstudio}`);
            
            await window.pipeline.estudiarHistoria(historiaId, origenEstudio);
            
            if (this._core) {
                this._core.irAModulo('study');
                this._core?.mostrarToast(`📖 ${estaCompletada ? 'Repasando' : 'Estudiando'}: "${historia.titulo}"`, 'info');
                setTimeout(() => {
                    this._inyectarBotonVolver('biblioteca');
                }, 300);
            }

        } catch (error) {
            console.error('❌ Error estudiando historia:', error);
            this._core?.mostrarToast('❌ Error: ' + error.message, 'error');
            this._volverALaBiblioteca();
        }
    }

    _inyectarBotonVolver(origen) {
        if (this._botonInyectado) return;
        if (this._origenAccion !== 'biblioteca') return;
        
        console.log(`🔧 Inyectando botón "Volver a la Biblioteca" en Estudio...`);
        
        const header = document.querySelector('#studyModule .module-header');
        if (!header) {
            console.warn('⚠️ No se encontró el header del módulo de estudio, reintentando...');
            setTimeout(() => this._inyectarBotonVolver(origen), 300);
            return;
        }
        
        const btnLibro = document.getElementById('btnLibroLectura');
        if (btnLibro) {
            btnLibro.style.display = 'none';
        }
        
        const titleDiv = header.querySelector('.module-title');
        if (!titleDiv) {
            const existingBtn = document.getElementById('btnVolverBiblioteca');
            if (existingBtn) return;
            
            const btn = document.createElement('button');
            btn.id = 'btnVolverBiblioteca';
            btn.className = 'btn-primary';
            btn.style.cssText = `
                padding: 6px 16px;
                font-size: 12px;
                background: linear-gradient(135deg, #FDCB6E, #E17055);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-left: 12px;
                font-weight: 600;
                font-family: var(--font, sans-serif);
                flex-shrink: 0;
            `;
            btn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver a Biblioteca';
            btn.onmouseover = () => {
                btn.style.transform = 'scale(1.05)';
                btn.style.boxShadow = '0 4px 20px rgba(225,112,85,0.3)';
            };
            btn.onmouseout = () => {
                btn.style.transform = 'none';
                btn.style.boxShadow = 'none';
            };
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔄 Botón "Volver a Biblioteca" pulsado');
                if (window._volverAlModoAnterior) {
                    window._volverAlModoAnterior();
                } else {
                    window.UIBiblioteca._volverALaBiblioteca();
                }
            };
            header.appendChild(btn);
            this._botonInyectado = true;
            console.log('✅ Botón "Volver a Biblioteca" añadido al header');
            return;
        }
        
        if (document.getElementById('btnVolverBiblioteca')) {
            this._botonInyectado = true;
            return;
        }
        
        const btn = document.createElement('button');
        btn.id = 'btnVolverBiblioteca';
        btn.className = 'btn-primary';
        btn.style.cssText = `
            padding: 6px 16px;
            font-size: 12px;
            background: linear-gradient(135deg, #FDCB6E, #E17055);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-left: 12px;
            font-weight: 600;
            font-family: var(--font, sans-serif);
            flex-shrink: 0;
        `;
        btn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver a Biblioteca';
        btn.onmouseover = () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = '0 4px 20px rgba(225,112,85,0.3)';
        };
        btn.onmouseout = () => {
            btn.style.transform = 'none';
            btn.style.boxShadow = 'none';
        };
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Botón "Volver a Biblioteca" pulsado');
            if (window._volverAlModoAnterior) {
                window._volverAlModoAnterior();
            } else {
                window.UIBiblioteca._volverALaBiblioteca();
            }
        };
        
        titleDiv.appendChild(btn);
        this._botonInyectado = true;
        console.log('✅ Botón "Volver a Biblioteca" añadido al módulo de estudio');
    }

    _restaurarBotonesEstudio() {
        console.log('🔓 Restaurando botones del módulo de estudio...');
        
        const btnLibro = document.getElementById('btnLibroLectura');
        if (btnLibro) {
            btnLibro.style.display = '';
        }
        
        const btnVolver = document.getElementById('btnVolverBiblioteca');
        if (btnVolver) {
            btnVolver.remove();
        }
        
        this._botonInyectado = false;
        this._origenAccion = null;
        console.log('🔓 Botones del estudio restaurados correctamente');
    }

    _volverALaBiblioteca() {
        console.log('📚 Volviendo a la biblioteca...');
        
        this._esperandoRetorno = false;
        this._origenAccion = null;
        this._historiaEnEstudio = null;
        this._modoVista = 'biblioteca';
        this._frasesActuales = [];
        
        this._restaurarBotonesEstudio();
        
        if (this._core) {
            this._core.irAModulo('biblioteca');
            setTimeout(() => {
                this.cargar(this._core);
                this._core?.mostrarToast('📚 De vuelta a la Biblioteca', 'info');
            }, 300);
        }
    }

    async _irAlOrigen(historiaId) {
        const historia = await db.get('historias', historiaId);
        if (!historia) {
            this._core?.mostrarToast('❌ Historia no encontrada', 'error');
            return;
        }
        
        const origen = await this._obtenerOrigenCompleto(historia);
        const tipo = origen.tipo || 'desconocido';
        
        console.log(`📍 Navegando al origen de "${historia.titulo}": ${tipo}`);
        
        switch (tipo) {
            case 'elipse':
                if (window.uiCore) {
                    window.uiCore.irAElipse();
                    setTimeout(() => {
                        if (window.UIClipse && origen.temaId) {
                            window.UIClipse._temaId = origen.temaId;
                            window.UIClipse._renderizarPanel(origen.temaId);
                        }
                    }, 300);
                }
                break;
                
            case 'ondas_cruzadas':
                if (window.uiCore) {
                    window.uiCore.irAOndasCruzadas();
                    setTimeout(() => {
                        if (window.UIOndasCruzadas && origen.temaId) {
                            window.UIOndasCruzadas._temaSeleccionado = origen.temaId;
                            window.UIOndasCruzadas._renderizarPanel();
                        }
                    }, 300);
                }
                break;
                
            case 'tema':
            case 'predefinido':
            case 'importado':
            default:
                if (origen.temaId && window.UITemas) {
                    window.UITemas._verTemaDetalle(origen.temaId);
                } else if (this._core) {
                    this._core.irAModulo('temas');
                }
                break;
        }
        
        this._core?.mostrarToast(`📍 Origen: ${origen.label}`, 'info');
    }

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const jeroglificos = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        const idiomaLower = idioma.toLowerCase().trim();
        return jeroglificos.some(item => idiomaLower.includes(item) || item.includes(idiomaLower));
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

    _obtenerTranscripcionFrase(frase) {
        if (!frase) return '';
        try {
            const idioma = frase.idioma || 'es';
            const esJeroglifico = this._esJeroglifico(idioma);
            if (esJeroglifico) {
                return frase.pinyinCompleto || frase.segmentacion?.pinyin || '';
            }
            return frase.transcripcion || '';
        } catch (e) {
            return '';
        }
    }

    destroy() {
        this._restaurarBotonesEstudio();
        this._initDone = false;
        console.log('🛑 UIBiblioteca: Destruida');
    }
}

window.UIBiblioteca = new UIBiblioteca();

console.log('✅ UIBiblioteca v2.9 - ORDEN DE TEMAS Y HISTORIAS SEGÚN TEMAS');
console.log('  🔥 Los temas se ordenan: Predefinidos por Nivel → Importados → Manuales');
console.log('  🔥 Dentro de cada nivel, el orden coincide con la vista de Temas');
console.log('  🔥 Las historias se ordenan por nivel, tema y título');
console.log('  🔥 El orden es consistente entre "Temas" y "Biblioteca"');
console.log('  🔥 Todas las funcionalidades originales preservadas');