// ============================================================
// UI CONFIG v20.9 - CORREGIDO: BOTÓN IMPORTAR SUPER JSON
// ============================================================

class UIConfig {
    constructor() {
        this._ultimoGapAnalysis = null;
        this._examenNivelActual = null;
        this._editandoIdioma = null;
        this._modalIdiomaAbierto = false;
        this._eventosConfigurados = false;
        this._recargando = false;
        this._validandoIdioma = false;
        this._examenActivo = false;
        this._cambiandoIdioma = false;
        this._generandoSuperJSON = false;
        this._actualizandoVersiones = false;
        this._ultimaActualizacionVersiones = 0;
        this._NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        this._NIVEL_ICONOS = { 'A1': '🌱', 'A2': '🌿', 'B1': '🌳', 'B2': '🌲', 'C1': '🏔️', 'C2': '🗻' };
        this._NIVEL_COLORES = { 'A1': '#6C5CE7', 'A2': '#0984E3', 'B1': '#00B894', 'B2': '#FDCB6E', 'C1': '#E17055', 'C2': '#FD79A8' };
        this._logrosDesbloqueados = new Set();
        
        this._FAMILIAS_SEMANTICAS = [
            'Transporte', 'Comida y Bebida', 'Familia', 'Casa y Hogar',
            'Ropa', 'Animales', 'Naturaleza', 'Tiempo y Clima',
            'Salud', 'Trabajo', 'Educación', 'Deportes',
            'Arte', 'Música', 'Tecnología', 'Viajes',
            'Compras', 'Comunicación', 'Emociones', 'Rutina',
            'Ciudad', 'Cultura', 'Historia', 'Ciencia'
        ];
        
        this._IDIOMAS_JEROGLIFICOS = ['zh', 'ja', 'ko', 'chino', 'japonés', 'coreano', 'chinese', 'japanese', 'korean', 'mandarin', 'mandarín'];
        this._LOGROS_BASE = {
            'primer_estudio': { nombre: '🌟 Primer Estudio', desc: 'Estudia tu primer carácter', icono: '🌟' },
            '3_estudios': { nombre: '📚 3 Estudios', desc: 'Estudia 3 caracteres diferentes', icono: '📚' },
            '10_estudios': { nombre: '🎓 10 Estudios', desc: 'Estudia 10 caracteres diferentes', icono: '🎓' },
            '5_palabras': { nombre: '📝 5 Palabras', desc: 'Aprende 5 palabras derivadas', icono: '📝' },
            '20_palabras': { nombre: '📖 20 Palabras', desc: 'Aprende 20 palabras derivadas', icono: '📖' },
            '50_palabras': { nombre: '🏆 50 Palabras', desc: 'Aprende 50 palabras derivadas', icono: '🏆' }
        };
    }

    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================

    _esJeroglifico(idioma) {
        if (!idioma) return false;
        const idiomaLower = idioma.toLowerCase().trim();
        return this._IDIOMAS_JEROGLIFICOS.some(item =>
            idiomaLower.includes(item) || item.includes(idiomaLower)
        );
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
            return 'B1';
        } catch (e) {
            return 'B1';
        }
    }

    _obtenerIdiomaNativo() {
        try {
            const usuario = JSON.parse(localStorage.getItem('pipeline_usuario') || '{}');
            return usuario.idiomaNativo || 'español';
        } catch (e) {
            return 'español';
        }
    }

    _getCore() {
        if (this.core) return this.core;
        if (window.uiCore) return window.uiCore;
        return null;
    }

    // ============================================================
    // OBTENER VERSIONES
    // ============================================================

    _obtenerVersionesDisponibles(idioma) {
        if (window.gestorIdiomas && typeof window.gestorIdiomas.obtenerVersionesDisponibles === 'function') {
            return window.gestorIdiomas.obtenerVersionesDisponibles(idioma);
        }
        return [
            { id: 'v2.0', nombre: 'HSK 2.0 (Clásico)' },
            { id: 'v3.0', nombre: 'HSK 3.0 (Nuevo)' }
        ];
    }

    _obtenerVersionActiva(idioma) {
        if (window.gestorIdiomas && typeof window.gestorIdiomas.obtenerVersionActiva === 'function') {
            return window.gestorIdiomas.obtenerVersionActiva(idioma);
        }
        return 'v3.0';
    }

    _obtenerNombreVersion(idioma, version) {
        if (window.gestorIdiomas && typeof window.gestorIdiomas.obtenerNombreVersion === 'function') {
            return window.gestorIdiomas.obtenerNombreVersion(idioma, version);
        }
        const nombres = {
            'v2.0': 'HSK 2.0',
            'v3.0': 'HSK 3.0'
        };
        return nombres[version] || version;
    }

    _obtenerDescripcionVersion(idioma, version) {
        if (window.gestorIdiomas && typeof window.gestorIdiomas.obtenerDescripcionVersion === 'function') {
            return window.gestorIdiomas.obtenerDescripcionVersion(idioma, version);
        }
        const descripciones = {
            'v2.0': '150 palabras en A1, 300 en A2',
            'v3.0': '500 palabras en A1, 1200 en A2',
            'v1.0': 'Estándar MCER'
        };
        return descripciones[version] || '';
    }

    async _cambiarVersionIdioma(idioma, nuevaVersion) {
        try {
            const result = await window.gestorIdiomas.cambiarVersionIdioma(idioma, nuevaVersion);
            if (result) {
                this._core?.mostrarToast(`✅ Versión de "${idioma}" cambiada a ${nuevaVersion}`, 'success');
                await this._recargarConfiguracion();
                if (window.UITemas) {
                    await window.UITemas._renderTemas();
                }
                if (window.UIJSON) {
                    window.UIJSON._actualizarIdiomaYNivel();
                }
            } else {
                this._core?.mostrarToast('❌ Error cambiando versión', 'error');
            }
        } catch (e) {
            console.error('❌ Error:', e);
            this._core?.mostrarToast('❌ Error: ' + e.message, 'error');
        }
    }

    // ============================================================
    // ACTUALIZAR VERSIONES DE IDIOMAS
    // ============================================================

    async _actualizarVersionesIdiomas(forzar = false) {
        if (this._actualizandoVersiones) {
            this.core?.mostrarToast('⏳ Ya hay una actualización en curso...', 'info');
            return;
        }

        if (!window.vigia || !window.vigia.enLinea) {
            this.core?.mostrarToast('❌ Vigía está offline. Conéctate a internet para actualizar.', 'error');
            return;
        }

        this._actualizandoVersiones = true;
        this.core?.mostrarToast('🔍 Buscando últimas versiones de idiomas...', 'info');

        try {
            const resultados = await window.gestorIdiomas.actualizarTodasLasVersiones(forzar);
            
            if (!resultados || resultados.length === 0) {
                this.core?.mostrarToast('ℹ️ No hay idiomas para actualizar', 'info');
                this._actualizandoVersiones = false;
                return;
            }
            
            const exitos = resultados.filter(r => r.exito).length;
            const fallos = resultados.filter(r => !r.exito).length;
            
            let mensaje = `✅ Actualización completada\n\n`;
            mensaje += `📊 ${exitos} idiomas actualizados correctamente\n`;
            if (fallos > 0) {
                mensaje += `⚠️ ${fallos} idiomas no se pudieron actualizar\n`;
                mensaje += `\n💡 Los que fallaron mantienen su versión actual.\n`;
            }
            
            for (const r of resultados) {
                if (r.exito && r.version) {
                    mensaje += `\n🌍 ${r.idioma}: ${r.version.nombre || r.version.version}`;
                }
            }
            
            this.core?.alert(mensaje, '📊 Actualización de Versiones');
            this._ultimaActualizacionVersiones = Date.now();
            
            await this._recargarConfiguracion();
            if (window.UITemas) {
                await window.UITemas._renderTemas();
            }
            
        } catch (error) {
            console.error('❌ Error actualizando versiones:', error);
            this.core?.mostrarToast('❌ Error: ' + error.message, 'error');
        } finally {
            this._actualizandoVersiones = false;
        }
    }

    // ============================================================
    // VERIFICAR ACTUALIZACIONES DISPONIBLES
    // ============================================================

    async _verificarActualizacionesDisponibles() {
        if (!window.vigia || !window.vigia.enLinea) {
            this.core?.mostrarToast('⚠️ Vigía offline. Conéctate para verificar.', 'warning');
            return;
        }

        this.core?.mostrarToast('🔍 Verificando actualizaciones disponibles...', 'info');

        try {
            const actualizaciones = await window.gestorIdiomas.verificarActualizacionesDisponibles();
            
            if (!actualizaciones || actualizaciones.length === 0) {
                this.core?.mostrarToast('✅ Todos los idiomas están actualizados.', 'success');
                return;
            }
            
            let mensaje = `📢 Actualizaciones disponibles:\n\n`;
            for (const act of actualizaciones) {
                mensaje += `🌍 ${act.idioma}\n`;
                mensaje += `   📌 ${act.versionActual} → ${act.versionNueva}\n`;
                mensaje += `   📝 ${act.nombreVersion}\n`;
                mensaje += `   💡 ${act.descripcion || 'Actualización disponible'}\n\n`;
            }
            
            mensaje += `¿Quieres actualizar todos los idiomas ahora?`;
            
            const confirmar = await this.core?.confirm(mensaje, '📢 Actualizaciones Disponibles');
            
            if (confirmar) {
                await this._actualizarVersionesIdiomas(true);
                if (window.UITemas) {
                    setTimeout(() => {
                        window.UITemas._renderTemas();
                    }, 300);
                }
            }
            
        } catch (error) {
            console.error('❌ Error verificando actualizaciones:', error);
            this.core?.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================

    async init(core) {
        this.core = core;
        
        if (!this._eventosConfigurados) {
            this._configurarEventosSincronizacion();
            this._eventosConfigurados = true;
        }
        
        return this;
    }

    cargar(core) {
        this.core = core;
        this._cargarConfiguracion();
    }

    // ============================================================
    // CONFIGURAR EVENTOS DE SINCRONIZACIÓN
    // ============================================================
    
    _configurarEventosSincronizacion() {
        console.log('🔗 Configurando sincronización de idiomas...');
        
        window.addEventListener('idiomaCambiado', async (e) => {
            console.log('🔄 Configuración detectó cambio de idioma:', e.detail?.idioma);
            await this._recargarConfiguracion();
        });
        
        window.addEventListener('idiomaAgregado', async (e) => {
            console.log('🔄 Configuración detectó idioma agregado:', e.detail?.idioma);
            await this._recargarConfiguracion();
        });
        
        window.addEventListener('idiomaEliminado', async (e) => {
            console.log('🔄 Configuración detectó idioma eliminado:', e.detail?.idioma);
            await this._recargarConfiguracion();
        });
        
        window.addEventListener('nivelIdiomaCambiado', async (e) => {
            console.log('🔄 Configuración detectó cambio de nivel:', e.detail?.idioma, e.detail?.nivel);
            await this._recargarConfiguracion();
        });

        window.addEventListener('idiomaNativoCambiado', async (e) => {
            console.log('🔄 Configuración detectó cambio de idioma nativo:', e.detail?.idiomaNativo);
            await this._recargarConfiguracion();
            if (modoInverso) {
                modoInverso._idiomaNativo = e.detail?.idiomaNativo?.nombre || 'es';
            }
        });
        
        window.addEventListener('tutorModoCambiado', (e) => {
            console.log('🔄 Configuración detectó cambio de modo del tutor:', e.detail?.modo);
            if (this._recargando) return;
            this._cargarConfiguracion();
        });

        window.addEventListener('versionIdiomaCambiada', async (e) => {
            console.log('🔄 Configuración detectó cambio de versión:', e.detail?.idioma, e.detail?.versionNueva);
            await this._recargarConfiguracion();
            if (window.UITemas) {
                await window.UITemas._renderTemas();
            }
            if (window.UIJSON) {
                window.UIJSON._actualizarIdiomaYNivel();
            }
        });

        window.addEventListener('versionIdiomaActualizada', async (e) => {
            console.log('🔄 Versión actualizada desde Groq:', e.detail?.idioma, e.detail?.nombreVersion);
            await this._recargarConfiguracion();
            if (window.UITemas) {
                setTimeout(() => {
                    window.UITemas._renderTemas();
                }, 300);
            }
        });
        
        console.log('✅ Sincronización de idiomas configurada');
    }

    // ============================================================
    // RECARGAR CONFIGURACIÓN
    // ============================================================
    
    async _recargarConfiguracion() {
        if (this._recargando) {
            console.log('⏳ Ya está recargando, saltando...');
            return;
        }
        
        this._recargando = true;
        console.log('🔄 Recargando configuración...');
        
        try {
            await gestorIdiomas._cargarIdiomas();
            await gestorIdiomas._cargarIdiomasNativos();
            
            const idiomas = gestorIdiomas.getIdiomas();
            console.log('📊 Idiomas en gestor después de recargar:', idiomas.map(i => i.idioma + (i.idioma === gestorIdiomas.getIdiomaActivo() ? ' (ACTIVO)' : '')));
            
            if (idiomas.length === 0) {
                console.log('⚠️ No hay idiomas en el gestor, intentando recuperar desde localStorage...');
                const usuarioLocal = localStorage.getItem('pipeline_usuario');
                if (usuarioLocal) {
                    try {
                        const parsed = JSON.parse(usuarioLocal);
                        if (parsed.idiomasObjetivo && parsed.idiomasObjetivo.length > 0) {
                            console.log('📦 Recuperando idiomas desde localStorage:', parsed.idiomasObjetivo.map(i => i.idioma));
                            gestorIdiomas.idiomas = [];
                            for (const item of parsed.idiomasObjetivo) {
                                const versionEstandar = item.versionEstandar || gestorIdiomas._obtenerVersionDefecto(item.idioma);
                                gestorIdiomas.idiomas.push({
                                    idioma: item.idioma,
                                    nivel: item.nivel || 'B1',
                                    versionEstandar: versionEstandar,
                                    _nombre_version: item._nombre_version || gestorIdiomas.obtenerNombreVersion(item.idioma, versionEstandar),
                                    progreso: 0,
                                    frasesCompletadas: 0,
                                    totalFrases: 0,
                                    totalHistorias: 0,
                                    totalTemas: 0,
                                    esJeroglifico: gestorIdiomas._esJeroglifico(item.idioma),
                                    palabrasAprendidas: 0,
                                    palabrasTotales: 0,
                                    coberturaNivel: 0,
                                    nivelRequerido: gestorIdiomas._obtenerPalabrasPorVersion(item.idioma, versionEstandar, item.nivel || 'B1'),
                                    palabrasPendientes: 0,
                                    listoParaExamen: false,
                                    puedeHacerExamen: false,
                                    razonesExamen: []
                                });
                            }
                            if (parsed.idiomasObjetivo.length > 0) {
                                gestorIdiomas.idiomaActivo = parsed.idiomasObjetivo[0].idioma;
                                localStorage.setItem('pipeline_idioma_activo', gestorIdiomas.idiomaActivo);
                            }
                            console.log('✅ Idiomas recuperados desde localStorage:', gestorIdiomas.idiomas.map(i => i.idioma));
                        }
                    } catch (e) {
                        console.warn('⚠️ Error recuperando desde localStorage:', e);
                    }
                }
            }
            
            await this._cargarConfiguracion();
            
            if (window.uiCore && window.uiCore._actualizarIndicadoresSeguro) {
                window.uiCore._actualizarIndicadoresSeguro();
            }
            
            this._actualizarNivelHeader();
            
            console.log('✅ Configuración recargada correctamente');
        } catch (e) {
            console.error('❌ Error recargando configuración:', e);
        } finally {
            this._recargando = false;
        }
    }

    // ============================================================
    // CARGA PRINCIPAL DE CONFIGURACIÓN
    // ============================================================
    
    async _cargarConfiguracion() {
        const container = document.getElementById('configContent');
        if (!container) return;

        const usuario = await db.getUsuario();
        const idiomas = gestorIdiomas.getIdiomas();
        const activo = gestorIdiomas.getIdiomaActivo();
        const idiomasNativos = await gestorIdiomas.obtenerIdiomasNativos();
        const stats = await db.obtenerEstadisticasNeuro(activo);
        const progreso = await db.obtenerTodoProgreso();
        const temas = await db.obtenerTemasPorIdioma(activo);
        const historias = await db.obtenerHistoriasPorIdioma(activo);
        const nivelReal = this._obtenerNivelRealUsuario();
        const esJeroglifico = this._esJeroglifico(activo);
        const nombreIdioma = this._getNombreIdioma(activo);

        const versionActiva = this._obtenerVersionActiva(activo);
        const nombreVersion = this._obtenerNombreVersion(activo, versionActiva);

        let hayActualizaciones = false;
        let actualizacionesPendientes = [];
        try {
            actualizacionesPendientes = await gestorIdiomas.verificarActualizacionesDisponibles();
            hayActualizaciones = actualizacionesPendientes.length > 0;
        } catch (e) {}

        const progresoNiveles = {};
        if (activo && window.UITemas && window.UITemas._TEMAS_PREDEFINIDOS) {
            const niveles = window.UITemas._NIVELES;
            for (const nivel of niveles) {
                const progresoNivel = await window.UITemas._obtenerProgresoNivel(activo, nivel, versionActiva);
                progresoNiveles[nivel] = progresoNivel;
            }
        }

        const tutorInfo = window.tutorNeuro ? window.tutorNeuro.getModoInfo() : null;
        const tutorModo = window.tutorNeuro ? window.tutorNeuro.getModo() : 'flexible';

        let html = `
            <div class="config-container neuro-control-center">
                <!-- Cabecera con botones de versión -->
                <div class="config-header">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                        <div>
                            <h2><i class="fas fa-sliders-h"></i> Centro de Control Neuro</h2>
                            <p>Gestiona tu perfil, idiomas, tutor y visualiza tu progreso de aprendizaje.</p>
                            <p style="font-size:12px;color:var(--secondary);margin-top:2px;">
                                📌 Versión del estándar: <strong>${nombreVersion}</strong>
                                ${hayActualizaciones ? ` 🔔 ${actualizacionesPendientes.length} actualizaciones disponibles` : ' ✅ Actualizado'}
                            </p>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            ${hayActualizaciones ? `
                                <button class="btn-primary" onclick="window.UIConfig._verificarActualizacionesDisponibles()" 
                                        style="padding:8px 16px;font-size:12px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:white;border:none;border-radius:8px;cursor:pointer;animation:pulse 2s ease-in-out infinite;">
                                    <i class="fas fa-bell"></i> ${actualizacionesPendientes.length} Actualizaciones
                                </button>
                            ` : ''}
                            <button class="btn-secondary" onclick="window.UIConfig._actualizarVersionesIdiomas(false)" 
                                    style="padding:8px 16px;font-size:12px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;">
                                <i class="fas fa-sync"></i> Actualizar Versiones
                            </button>
                            <button class="btn-secondary" onclick="window.UIConfig._verificarActualizacionesDisponibles()" 
                                    style="padding:8px 16px;font-size:12px;background:var(--bg);border:1px solid var(--light);border-radius:8px;cursor:pointer;">
                                <i class="fas fa-search"></i> Verificar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Sección: Tutor Neuro -->
                <div class="config-section tutor-config-section" style="margin-bottom:20px;border:2px solid var(--primary)20;border-radius:14px;padding:16px 20px;background:linear-gradient(135deg, var(--primary)04, var(--secondary)04);">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:8px;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span style="font-size:32px;">🧠</span>
                            <div>
                                <h3 style="font-size:18px;font-weight:700;color:var(--dark);margin:0;">Tutor Neuro</h3>
                                <p style="font-size:12px;color:var(--gray);margin:2px 0 0;">
                                    ${tutorInfo ? `${tutorInfo.icono} ${tutorInfo.nombre}` : 'Cargando...'}
                                    <span style="font-size:11px;color:var(--gray-light);margin-left:8px;">| Elige cómo quieres que el tutor te guíe</span>
                                </p>
                            </div>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            <span style="font-size:11px;padding:4px 12px;border-radius:12px;background:${tutorInfo ? tutorInfo.color + '20' : 'var(--bg)'};color:${tutorInfo ? tutorInfo.color : 'var(--gray)'};">
                                ${tutorInfo ? tutorInfo.icono : '🧠'} ${tutorInfo ? tutorInfo.nombre : 'Cargando...'}
                            </span>
                        </div>
                    </div>
                    
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:12px;">
                        ${this._renderTarjetasModosTutor()}
                    </div>
                    
                    <div style="background:var(--bg);border-radius:8px;padding:10px 14px;border-left:4px solid ${tutorInfo ? tutorInfo.color : 'var(--primary)'};">
                        <div style="font-size:12px;font-weight:600;color:var(--gray);" id="tutorModoDescripcion">
                            ${this._getModoDescripcion()}
                        </div>
                        ${tutorInfo ? `
                            <div style="font-size:11px;color:var(--gray-light);margin-top:4px;display:flex;flex-wrap:wrap;gap:6px;">
                                ${tutorInfo.caracteristicas.map(c => `<span>${c}</span>`).join(' · ')}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Sección: Botón Super Power -->
                <div style="background:linear-gradient(135deg, #6C5CE7, #00CEC9);border-radius:14px;padding:20px 24px;margin-bottom:20px;box-shadow:0 4px 30px rgba(108,92,231,0.25);">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
                        <div style="display:flex;align-items:center;gap:14px;">
                            <div style="font-size:40px;animation:pulse 2s ease-in-out infinite;">⚡</div>
                            <div>
                                <h3 style="font-size:18px;font-weight:800;color:white;margin:0;">Botón Super Power</h3>
                                <p style="font-size:13px;color:rgba(255,255,255,0.85);margin:2px 0 0;">
                                    Genera un JSON completo con <strong>TODO</strong> el contenido para el nivel ${nivelReal} de ${nombreIdioma}
                                    ${esJeroglifico ? '🀄 (incluye caracteres y familias)' : ''}
                                    <span style="font-size:11px;color:rgba(255,255,255,0.6);margin-left:8px;">📌 ${nombreVersion}</span>
                                </p>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="window.UIConfig._generarSuperJSON()" 
                                style="padding:12px 28px;font-size:16px;font-weight:700;background:white;color:#6C5CE7;border:none;border-radius:10px;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 20px rgba(0,0,0,0.15);"
                                onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.25)'" 
                                onmouseout="this.style.transform='none';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.15)'">
                            <i class="fas fa-meteor"></i> ¡Generar JSON Completo!
                        </button>
                    </div>
                    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;font-size:11px;color:rgba(255,255,255,0.7);">
                        <span>📚 ${Object.keys(window.UITemas?.TEMAS_PREDEFINIDOS?.[versionActiva]?.[nivelReal] || {}).length || 0} temas</span>
                        <span>📖 3-5 historias por tema</span>
                        <span>📝 Vocabulario del nivel</span>
                        ${esJeroglifico ? `<span>🀄 Caracteres y familias</span>` : ''}
                        <span>📋 Reglas gramaticales</span>
                        <span>🎯 Ejercicios y logros</span>
                        <span>📌 ${nombreVersion}</span>
                    </div>
                </div>

                <!-- Sección: Perfil y Preferencias -->
                <div class="config-section profile-section">
                    <h3><i class="fas fa-user-circle"></i> Perfil y Preferencias</h3>
                    <div class="config-grid-2">
                        <div class="config-item">
                            <label><i class="fas fa-user"></i> Nombre</label>
                            <input type="text" id="configNombre" value="${usuario?.nombre || ''}" placeholder="Tu nombre">
                        </div>
                        <div class="config-item">
                            <label><i class="fas fa-language"></i> Idioma Nativo</label>
                            <select id="configIdiomaNativo">
                                ${idiomasNativos.map(n => `
                                    <option value="${n.id}" ${n.esActivo ? 'selected' : ''}>
                                        ${n.nombre}
                                    </option>
                                `).join('')}
                            </select>
                            <div style="display:flex;gap:6px;margin-top:4px;">
                                <button class="btn-sm btn-primary" onclick="window.UIConfig._añadirIdiomaNativo()">
                                    <i class="fas fa-plus"></i> Añadir
                                </button>
                            </div>
                        </div>
                        <div class="config-item" style="grid-column: span 2;">
                            <label><i class="fas fa-bell"></i> Preferencias</label>
                            <div class="preference-group">
                                <label><input type="checkbox" id="configAutoNivel" ${usuario?.nivelAuto !== false ? 'checked' : ''}> Subir de nivel automáticamente</label>
                                <label><input type="checkbox" id="configNotificaciones" ${usuario?.notificaciones !== false ? 'checked' : ''}> Notificaciones de estudio</label>
                                <label><input type="checkbox" id="configRecordatorios" ${usuario?.recordatorios !== false ? 'checked' : ''}> Recordatorios de repaso</label>
                            </div>
                        </div>
                    </div>
                    <button class="btn-primary" onclick="window.UIConfig._guardarConfigPerfil()">
                        <i class="fas fa-save"></i> Guardar Perfil
                    </button>
                </div>

                <!-- Sección: Gestión de Idiomas -->
                <div class="config-section languages-section">
                    <h3><i class="fas fa-globe-americas"></i> Idiomas de Aprendizaje</h3>
                    <div class="languages-grid" id="configIdiomasGrid">
                        ${this._renderTarjetasIdiomas(idiomas, activo)}
                    </div>
                    <button class="btn-primary" onclick="window.UIConfig._abrirModalAgregarIdioma()">
                        <i class="fas fa-plus-circle"></i> Añadir Nuevo Idioma
                    </button>
                </div>

                <!-- Sección: Progreso de Niveles -->
                <div class="config-section levels-progress-section">
                    <h3><i class="fas fa-chart-line"></i> Progreso por Nivel (${activo || 'Idioma Activo'})</h3>
                    <div class="levels-progress-grid" id="configLevelsProgress">
                        ${this._renderProgresoNiveles(progresoNiveles)}
                    </div>
                </div>

                <!-- Sección: Estadísticas Visuales -->
                <div class="config-section stats-section">
                    <h3><i class="fas fa-chart-pie"></i> Estadísticas de Aprendizaje</h3>
                    <div class="stats-grid-visual" id="configStatsGrid">
                        ${this._renderTarjetasEstadisticas(stats, progreso, temas, historias)}
                    </div>
                </div>

                <!-- Sección: Historial -->
                <div class="config-section history-section">
                    <h3><i class="fas fa-history"></i> Historial de Niveles</h3>
                    <div id="configHistorialNiveles">
                        <p style="color:var(--gray);">Cargando historial...</p>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        await this._cargarHistorialNiveles();
        this._inicializarEventosConfiguracion();
    }

    // ============================================================
    // RENDER TARJETAS DE MODOS DEL TUTOR
    // ============================================================

    _renderTarjetasModosTutor() {
        if (!window.tutorNeuro) {
            return `<div style="color:var(--gray);font-size:13px;padding:8px;">⚠️ Tutor Neuro no disponible</div>`;
        }
        
        const modoActual = window.tutorNeuro.getModo();
        const modos = [
            { id: 'guiado', icono: '🚀', nombre: 'Modo Guiado', descripcion: 'El tutor decide el camino', color: '#6C5CE7', bg: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' },
            { id: 'flexible', icono: '🧠', nombre: 'Modo Flexible', descripcion: 'El tutor sugiere, tú decides', color: '#00B894', bg: 'linear-gradient(135deg, #00B894, #55EFC4)' },
            { id: 'libre', icono: '📴', nombre: 'Modo Libre', descripcion: 'El tutor no interviene', color: '#636E72', bg: 'linear-gradient(135deg, #636E72, #2D3436)' }
        ];
        
        return modos.map(modo => {
            const esActivo = modo.id === modoActual;
            return `
                <div onclick="window.UIConfig._cambiarModoTutor('${modo.id}')" 
                     style="
                        background: ${esActivo ? modo.bg : 'var(--white)'};
                        border-radius: 12px;
                        padding: 14px 16px;
                        border: 3px solid ${esActivo ? modo.color : 'var(--light)'};
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-align: center;
                        box-shadow: ${esActivo ? '0 4px 20px ' + modo.color + '40' : 'var(--shadow)'};
                        transform: ${esActivo ? 'scale(1.02)' : 'scale(1)'};
                    "
                    onmouseover="this.style.transform='scale(1.03)';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'" 
                    onmouseout="this.style.transform='${esActivo ? 'scale(1.02)' : 'scale(1)'}';this.style.boxShadow='${esActivo ? '0 4px 20px ' + modo.color + '40' : 'var(--shadow)'}'">
                    <div style="font-size:32px;display:block;margin-bottom:4px;">${modo.icono}</div>
                    <div style="font-size:14px;font-weight:700;color:${esActivo ? 'white' : 'var(--dark)'};">
                        ${modo.nombre}
                        ${esActivo ? ' ✅' : ''}
                    </div>
                    <div style="font-size:11px;color:${esActivo ? 'rgba(255,255,255,0.8)' : 'var(--gray)'};margin-top:2px;">
                        ${modo.descripcion}
                    </div>
                    ${esActivo ? `<div style="font-size:9px;color:rgba(255,255,255,0.6);margin-top:4px;">🔒 Activo</div>` : ''}
                </div>
            `;
        }).join('');
    }

    _getModoDescripcion() {
        if (!window.tutorNeuro) return 'Tutor Neuro no disponible';
        const info = window.tutorNeuro.getModoInfo();
        return `${info.icono} ${info.nombre}: ${info.descripcion}`;
    }

    async _cambiarModoTutor(modo) {
        if (!window.tutorNeuro) {
            this.core?.mostrarToast('❌ Tutor Neuro no disponible', 'error');
            return;
        }
        
        const modoActual = window.tutorNeuro.getModo();
        if (modo === modoActual) {
            this.core?.mostrarToast(`📌 Ya estás en ${window.tutorNeuro.getModoInfo().nombre}`, 'info');
            return;
        }
        
        const nuevoInfo = window.tutorNeuro.setModo(modo);
        this.core?.mostrarToast(`🔄 Modo cambiado a ${nuevoInfo.nombre}`, 'success');
        await this._cargarConfiguracion();
    }

    // ============================================================
    // RENDER TARJETAS DE IDIOMAS
    // ============================================================

    _renderTarjetasIdiomas(idiomas, activo) {
        if (!idiomas || idiomas.length === 0) {
            return `<div class="empty-state">No hay idiomas configurados. Añade el primero.</div>`;
        }

        return idiomas.map(idioma => {
            const esActivo = idioma.idioma === activo;
            const emoji = idioma.esJeroglifico ? '🀄' : '🌍';
            const colorNivel = this._NIVEL_COLORES?.[idioma.nivel] || 'var(--primary)';
            const versionEstandar = idioma.versionEstandar || 'v2.0';
            
            const versionesDisponibles = this._obtenerVersionesDisponibles(idioma.idioma);
            const nombreVersion = this._obtenerNombreVersion(idioma.idioma, versionEstandar);
            const descripcionVersion = this._obtenerDescripcionVersion(idioma.idioma, versionEstandar);
            
            const idiomaBase = window.gestorIdiomas?._obtenerIdiomaBase?.(idioma.idioma) || 'default';
            const cacheVersion = window.gestorIdiomas?._cacheVersiones?.[idiomaBase];
            const hayActualizacion = cacheVersion && cacheVersion.version && cacheVersion.version !== versionEstandar;
            
            const progresoNeuro = Math.round((idioma.coberturaNivel || 0) * 0.6 + (idioma.progreso || 0) * 0.4);
            let estadoNeuro = '🔴 En inicio';
            let estadoColor = 'var(--danger)';
            if (progresoNeuro >= 80) {
                estadoNeuro = '🟣 Dominio avanzado';
                estadoColor = 'var(--primary)';
            } else if (progresoNeuro >= 60) {
                estadoNeuro = '🟢 Consolidado';
                estadoColor = 'var(--success)';
            } else if (progresoNeuro >= 40) {
                estadoNeuro = '🟡 En progreso';
                estadoColor = 'var(--warning)';
            } else if (progresoNeuro >= 20) {
                estadoNeuro = '🟠 Iniciando';
                estadoColor = 'var(--info)';
            }

            return `
                <div class="language-card ${esActivo ? 'active' : ''}" data-idioma="${idioma.idioma}" style="${hayActualizacion ? 'border:2px solid var(--warning);' : ''}">
                    <div class="language-card-header">
                        <span class="language-icon">${emoji}</span>
                        <span class="language-name">${idioma.idioma}</span>
                        <span class="language-badge ${esActivo ? 'active-badge' : 'inactive-badge'}">
                            ${esActivo ? '✅ Activo' : '⏸️ Inactivo'}
                        </span>
                        ${hayActualizacion ? `
                            <span class="language-badge" style="background:var(--warning);color:white;font-size:8px;padding:1px 8px;border-radius:8px;">
                                🔔 Actualización
                            </span>
                        ` : ''}
                    </div>
                    <div class="language-card-body">
                        <div class="language-level">
                            <span class="level-label">Nivel</span>
                            <span class="level-value" style="color:${colorNivel};">${idioma.nivel}</span>
                            <span class="level-status" style="color:${estadoColor};font-size:12px;margin-left:8px;">
                                ${estadoNeuro}
                            </span>
                        </div>
                        
                        <!-- Selector de Versión -->
                        <div class="config-item" style="margin-top: 6px; grid-column: span 2; background:var(--bg);padding:8px 12px;border-radius:6px;border:1px solid var(--light);">
                            <label style="font-size: 11px; color: var(--gray); display:flex;align-items:center;gap:4px;">
                                <i class="fas fa-code-branch"></i> Versión del estándar
                                ${hayActualizacion ? `<span style="font-size:8px;color:var(--warning);font-weight:600;">🔔 ${cacheVersion.nombre} disponible</span>` : ''}
                            </label>
                            <select id="versionSelect_${idioma.idioma}" 
                                    data-idioma="${idioma.idioma}" 
                                    style="width:100%;padding:4px 8px;border:1px solid var(--light);border-radius:4px;font-size:12px;background:var(--white);"
                                    onchange="window.UIConfig._cambiarVersionIdioma('${idioma.idioma}', this.value)">
                                ${versionesDisponibles.map(v => `
                                    <option value="${v.id}" ${versionEstandar === v.id ? 'selected' : ''}>
                                        ${v.nombre}
                                    </option>
                                `).join('')}
                            </select>
                            <div style="font-size: 9px; color: var(--gray-light); margin-top: 2px; display:flex;justify-content:space-between;flex-wrap:wrap;">
                                <span>📊 Palabras requeridas: ${idioma.nivelRequerido || 'N/A'}</span>
                                <span style="color:var(--secondary);">📌 ${descripcionVersion || nombreVersion}</span>
                            </div>
                            ${versionEstandar === 'v3.0' ? `
                                <div style="font-size:8px;color:var(--success);margin-top:2px;">
                                    🚀 HSK 3.0: 500 palabras en A1 (vs 150 en HSK 2.0)
                                </div>
                            ` : versionEstandar === 'v2.0' ? `
                                <div style="font-size:8px;color:var(--gray-light);margin-top:2px;">
                                    📚 HSK 2.0: 150 palabras en A1
                                    ${hayActualizacion ? ` 🔔 ${cacheVersion.nombre} disponible` : ''}
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="progress-group">
                            <div class="progress-item">
                                <span class="progress-label">🧠 Progreso Neuro</span>
                                <div class="progress-bar">
                                    <div class="progress-fill neuro-fill" style="width:${progresoNeuro}%;">
                                        <span class="progress-percent">${progresoNeuro}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="neuro-details">
                            <span>📊 Frases: <strong>${idioma.progreso || 0}%</strong></span>
                            <span>📖 Vocabulario: <strong>${idioma.coberturaNivel || 0}%</strong></span>
                            <span>🧠 Consolidación: <strong>${progresoNeuro}%</strong></span>
                        </div>
                    </div>
                    <div class="language-card-actions">
                        ${!esActivo ? `
                            <button class="btn-sm btn-primary" onclick="window.UIConfig._cambiarIdiomaActivo('${idioma.idioma}')">
                                <i class="fas fa-check"></i> Activar
                            </button>
                        ` : ''}
                        <button class="btn-sm btn-secondary" onclick="window.UIConfig._cambiarNivelIdioma('${idioma.idioma}')">
                            <i class="fas fa-edit"></i> Nivel
                        </button>
                        ${idiomas.length > 1 ? `
                            <button class="btn-sm btn-danger" onclick="window.UIConfig._eliminarIdioma('${idioma.idioma}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ============================================================
    // RENDER PROGRESO NIVELES
    // ============================================================

    _renderProgresoNiveles(progresoNiveles) {
        if (!progresoNiveles || Object.keys(progresoNiveles).length === 0) {
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            const infoIdioma = gestorIdiomas?.getInfoIdioma(idiomaActivo);
            
            if (infoIdioma) {
                return `
                    <div style="text-align:center;padding:20px;color:var(--gray);background:var(--bg);border-radius:8px;border:1px solid var(--light);">
                        <i class="fas fa-info-circle" style="font-size:24px;color:var(--primary-light);display:block;margin-bottom:8px;"></i>
                        <p style="font-size:13px;font-weight:500;margin:0;">📊 Progreso por Nivel</p>
                        <p style="font-size:12px;color:var(--gray-light);margin:4px 0 0;">
                            No hay temas predefinidos guardados para <strong>${infoIdioma.idioma}</strong>.
                            <br>Genera o importa temas para ver tu progreso aquí.
                        </p>
                        <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;">
                            <button class="btn-secondary" onclick="window.UIJSON.abrirGeneradorJSON()" style="padding:4px 14px;font-size:11px;">
                                <i class="fas fa-plus"></i> Generar Temas
                            </button>
                            <button class="btn-secondary" onclick="window.UITemas._renderTemas()" style="padding:4px 14px;font-size:11px;">
                                <i class="fas fa-folder-open"></i> Ver Temas
                            </button>
                        </div>
                    </div>
                `;
            }
            
            return `
                <div style="text-align:center;padding:20px;color:var(--gray);background:var(--bg);border-radius:8px;border:1px solid var(--light);">
                    <i class="fas fa-info-circle" style="font-size:24px;color:var(--primary-light);display:block;margin-bottom:8px;"></i>
                    <p style="font-size:13px;font-weight:500;margin:0;">📊 Progreso por Nivel</p>
                    <p style="font-size:12px;color:var(--gray-light);margin:4px 0 0;">
                        Activa un idioma para ver tu progreso aquí.
                    </p>
                </div>
            `;
        }

        const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const nivelActual = this._obtenerNivelRealUsuario();
        const versionActiva = this._obtenerVersionActiva(gestorIdiomas?.getIdiomaActivo() || 'es');
        const nombreVersion = this._obtenerNombreVersion(gestorIdiomas?.getIdiomaActivo() || 'es', versionActiva);

        const nivelesConDatos = niveles.filter(n => progresoNiveles[n] && progresoNiveles[n].total > 0);
        
        if (nivelesConDatos.length === 0) {
            const idiomaActivo = gestorIdiomas?.getIdiomaActivo() || 'es';
            const infoIdioma = gestorIdiomas?.getInfoIdioma(idiomaActivo);
            return `
                <div style="text-align:center;padding:20px;color:var(--gray);background:var(--bg);border-radius:8px;border:1px solid var(--light);">
                    <i class="fas fa-info-circle" style="font-size:24px;color:var(--primary-light);display:block;margin-bottom:8px;"></i>
                    <p style="font-size:13px;font-weight:500;margin:0;">📊 Progreso por Nivel</p>
                    <p style="font-size:12px;color:var(--gray-light);margin:4px 0 0;">
                        ${infoIdioma ? `No hay temas predefinidos guardados para <strong>${infoIdioma.idioma}</strong>.` : 'Activa un idioma para ver tu progreso aquí.'}
                        <br>Genera o importa temas desde el módulo <strong>Temas</strong>.
                    </p>
                    <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;">
                        <button class="btn-secondary" onclick="window.UIJSON.abrirGeneradorJSON()" style="padding:4px 14px;font-size:11px;">
                            <i class="fas fa-plus"></i> Generar Temas
                        </button>
                        <button class="btn-secondary" onclick="window.UITemas._renderTemas()" style="padding:4px 14px;font-size:11px;">
                            <i class="fas fa-folder-open"></i> Ver Temas
                        </button>
                    </div>
                </div>
            `;
        }

        return nivelesConDatos.map(nivel => {
            const data = progresoNiveles[nivel];
            if (!data || data.total === 0) return '';
            
            const emoji = this._NIVEL_ICONOS?.[nivel] || '📚';
            const color = this._NIVEL_COLORES?.[nivel] || 'var(--primary)';
            const pct = data.porcentaje || 0;
            const completados = data.completados || 0;
            const total = data.total || 1;
            const esActual = nivel === nivelActual;

            return `
                <div class="level-progress-card">
                    <div class="level-progress-header">
                        <span class="level-emoji">${emoji}</span>
                        <span class="level-name">Nivel ${nivel}</span>
                        ${esActual ? '<span class="level-badge current">🎯 ACTUAL</span>' : ''}
                        <span class="level-stats">${completados}/${total} temas</span>
                    </div>
                    <div class="progress-bar level-bar">
                        <div class="progress-fill" style="width:${pct}%;background:${color};"></div>
                    </div>
                    <span class="progress-value">${pct}%</span>
                    ${pct >= 80 ? `<span class="level-badge complete">🎉 ¡Completado!</span>` : ''}
                </div>
            `;
        }).join('');
    }

    // ============================================================
    // RENDER TARJETAS ESTADÍSTICAS
    // ============================================================

    _renderTarjetasEstadisticas(stats, progreso, temas, historias) {
        const rcnPromedio = stats?.rcnPromedio || 0;
        const eficiencia = stats?.eficiencia || 0;
        const neuroScore = stats?.neuroScore || 0;
        const totalFrases = stats?.totalFrases || 0;
        const totalPalabras = stats?.totalPalabras || 0;
        const completadas = progreso.filter(p => p.estado === 'completada').length;

        const fechas = progreso.map(p => new Date(p.ultimoRepaso).toDateString());
        const uniqueFechas = [...new Set(fechas)].sort();
        let racha = 0;
        for (let i = uniqueFechas.length - 1; i >= 0; i--) {
            const fecha = new Date(uniqueFechas[i]);
            const diff = Math.floor((Date.now() - fecha.getTime()) / 86400000);
            if (diff === racha) {
                racha++;
            } else {
                break;
            }
        }

        return `
            <div class="stat-card neuro-score">
                <div class="stat-icon">🧠</div>
                <div class="stat-content">
                    <span class="stat-value">${neuroScore}%</span>
                    <span class="stat-label">NeuroScore</span>
                </div>
            </div>
            <div class="stat-card rcn">
                <div class="stat-icon">📈</div>
                <div class="stat-content">
                    <span class="stat-value">${rcnPromedio.toFixed(1)}</span>
                    <span class="stat-label">RCN Promedio</span>
                </div>
            </div>
            <div class="stat-card efficiency">
                <div class="stat-icon">⚡</div>
                <div class="stat-content">
                    <span class="stat-value">${eficiencia}%</span>
                    <span class="stat-label">Eficiencia</span>
                </div>
            </div>
            <div class="stat-card streak">
                <div class="stat-icon">🔥</div>
                <div class="stat-content">
                    <span class="stat-value">${racha}</span>
                    <span class="stat-label">Racha (días)</span>
                </div>
            </div>
            <div class="stat-card phrases">
                <div class="stat-icon">📖</div>
                <div class="stat-content">
                    <span class="stat-value">${completadas}/${totalFrases}</span>
                    <span class="stat-label">Frases Completadas</span>
                </div>
            </div>
            <div class="stat-card words">
                <div class="stat-icon">📝</div>
                <div class="stat-content">
                    <span class="stat-value">${totalPalabras}</span>
                    <span class="stat-label">Palabras Aprendidas</span>
                </div>
            </div>
            <div class="stat-card stories">
                <div class="stat-icon">📚</div>
                <div class="stat-content">
                    <span class="stat-value">${historias.length}</span>
                    <span class="stat-label">Historias</span>
                </div>
            </div>
            <div class="stat-card topics">
                <div class="stat-icon">📂</div>
                <div class="stat-content">
                    <span class="stat-value">${temas.length}</span>
                    <span class="stat-label">Temas</span>
                </div>
            </div>
        `;
    }

    // ============================================================
    // MÉTODOS DE CONFIGURACIÓN
    // ============================================================

    _inicializarEventosConfiguracion() {
        document.getElementById('configIdiomaNativo')?.addEventListener('change', (e) => {});
        
        const perfilBtn = document.querySelector('button[onclick*="_guardarConfigPerfil"]');
        if (perfilBtn) {
            const newBtn = perfilBtn.cloneNode(true);
            perfilBtn.parentNode.replaceChild(newBtn, perfilBtn);
            newBtn.onclick = () => this._guardarConfigPerfil();
        }
    }

    async _añadirIdiomaNativo() {
        const nombre = await this.core?.prompt(
            '📝 Nuevo idioma nativo:',
            '',
            'Ej: Inglés, Francés, Alemán...',
            'Añadir Idioma Nativo'
        );
        if (!nombre) return;

        if (window.vigia && window.vigia.enLinea) {
            this.core?.mostrarToast('🔍 Validando idioma...', 'info');
            try {
                const validacion = await window.vigia._validarIdiomaConGroq(nombre, 'idioma_nativo');
                if (validacion && validacion.valido) {
                    const nombreFinal = validacion.idiomaCorregido || nombre;
                    const nativos = await gestorIdiomas.obtenerIdiomasNativos();
                    if (nativos.some(n => n.nombre === nombreFinal)) {
                        this.core?.mostrarToast(`⚠️ "${nombreFinal}" ya existe.`, 'warning');
                        return;
                    }
                    nativos.push({ id: 'nativo_' + Date.now(), nombre: nombreFinal, esActivo: false });
                    await gestorIdiomas.guardarIdiomasNativos(nativos);
                    this.core?.mostrarToast(`✅ "${nombreFinal}" añadido.`, 'success');
                    this._cargarConfiguracion();
                } else {
                    this.core?.mostrarToast(`❌ "${nombre}" no es un idioma válido.`, 'error');
                }
            } catch (e) {
                this.core?.mostrarToast(`❌ Error: ${e.message}`, 'error');
            }
        } else {
            const nativos = await gestorIdiomas.obtenerIdiomasNativos();
            if (nativos.some(n => n.nombre === nombre)) {
                this.core?.mostrarToast(`⚠️ "${nombre}" ya existe.`, 'warning');
                return;
            }
            nativos.push({ id: 'nativo_' + Date.now(), nombre: nombre, esActivo: false });
            await gestorIdiomas.guardarIdiomasNativos(nativos);
            this.core?.mostrarToast(`✅ "${nombre}" añadido.`, 'success');
            this._cargarConfiguracion();
        }
    }

    async _guardarConfigPerfil() {
        const nombre = document.getElementById('configNombre')?.value?.trim() || '';
        const idiomaNativoSelect = document.getElementById('configIdiomaNativo');
        const nativoId = idiomaNativoSelect?.value || '';

        if (!nombre) {
            this.core?.mostrarToast('❌ El nombre es obligatorio.', 'error');
            return;
        }

        if (nativoId) {
            await gestorIdiomas.cambiarIdiomaNativo(nativoId);
        }

        const autoNivel = document.getElementById('configAutoNivel')?.checked ?? true;
        const notificaciones = document.getElementById('configNotificaciones')?.checked ?? true;
        const recordatorios = document.getElementById('configRecordatorios')?.checked ?? true;

        const usuario = await db.getUsuario();
        if (usuario) {
            usuario.nombre = nombre;
            usuario.nivelAuto = autoNivel;
            usuario.notificaciones = notificaciones;
            usuario.recordatorios = recordatorios;
            await db.guardarUsuario(usuario);
            localStorage.setItem('pipeline_usuario', JSON.stringify(usuario));
            this.core?.mostrarToast('✅ Perfil guardado.', 'success');

            const userName = document.getElementById('userName');
            const dashUser = document.getElementById('dashUserName');
            if (userName) userName.textContent = nombre;
            if (dashUser) dashUser.textContent = nombre;
            this._cargarConfiguracion();
        }
    }

    async _cambiarIdiomaActivo(idioma) {
        if (this._cambiandoIdioma) {
            this.core?.mostrarToast('⏳ Cambiando idioma...', 'info');
            return;
        }
        
        this._cambiandoIdioma = true;
        
        try {
            const result = await gestorIdiomas.cambiarIdioma(idioma);
            if (result) {
                await this._recargarConfiguracion();
                if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this.core);
                if (window.UIStudy) window.UIStudy._renderizarFraseInteractiva();
                if (window.UIGrammar) window.UIGrammar._cargarGramatica();
                if (window.UITemas) window.UITemas._renderTemas();
                if (window.UIEspacio) window.UIEspacio._renderizarMiEspacio();
                this.core?.mostrarToast(`🌍 Idioma activo: ${idioma}`, 'success');
            } else {
                this.core?.mostrarToast('❌ Error al cambiar idioma', 'error');
            }
        } catch (e) {
            console.error('❌ Error:', e);
            this.core?.mostrarToast('❌ Error: ' + e.message, 'error');
        } finally {
            this._cambiandoIdioma = false;
        }
    }

    async _abrirModalAgregarIdioma() {
        if (this._modalIdiomaAbierto) return;
        this._modalIdiomaAbierto = true;
        
        try {
            const idioma = await this.core.prompt(
                '📝 ¿Qué idioma quieres añadir?\n\nEjemplos: Chino, English, 日本語, Français...',
                '',
                'Escribe el nombre del idioma...',
                '🌍 Nuevo Idioma'
            );
            
            if (!idioma) {
                this._modalIdiomaAbierto = false;
                return;
            }
            
            const idiomaTrim = idioma.trim();
            if (!idiomaTrim) {
                this._modalIdiomaAbierto = false;
                return;
            }
            
            this.core.mostrarToast('🔍 Validando idioma...', 'info');
            
            let idiomaFinal = idiomaTrim;
            let esJeroglifico = this._esJeroglifico(idiomaTrim);
            
            if (idiomaTrim.length < 2) {
                await this.core.alert('❌ El idioma debe tener al menos 2 caracteres.', 'Error');
                this._modalIdiomaAbierto = false;
                return;
            }
            
            const existentes = gestorIdiomas.getIdiomas();
            if (existentes.some(i => i.idioma.toLowerCase() === idiomaFinal.toLowerCase())) {
                await this.core.alert(`❌ El idioma "${idiomaFinal}" ya existe.`, 'Error');
                this._modalIdiomaAbierto = false;
                return;
            }
            
            const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            const nivelOptions = niveles.map(n => {
                const labels = {
                    'A1': 'Principiante', 'A2': 'Elemental', 'B1': 'Intermedio',
                    'B2': 'Intermedio Alto', 'C1': 'Avanzado', 'C2': 'Maestría'
                };
                return `• ${n} - ${labels[n]}`;
            }).join('\n');
            
            const nivel = await this.core.prompt(
                `📊 Nivel para "${idiomaFinal}"\n\nOpciones:\n${nivelOptions}`,
                'B1',
                'Escribe el nivel (A1, A2, B1, B2, C1, C2)...',
                '📊 Seleccionar Nivel'
            );
            
            if (!nivel) {
                this._modalIdiomaAbierto = false;
                return;
            }
            
            const nivelUpper = nivel.toUpperCase().trim();
            if (!niveles.includes(nivelUpper)) {
                await this.core.alert(`❌ "${nivel}" no es un nivel válido. Usa: A1, A2, B1, B2, C1, C2`, 'Error');
                this._modalIdiomaAbierto = false;
                return;
            }
            
            await this._añadirIdioma(idiomaFinal, nivelUpper);
            
        } catch (e) {
            console.error('❌ Error:', e);
            await this.core.alert('❌ Error: ' + e.message, 'Error');
        } finally {
            this._modalIdiomaAbierto = false;
        }
    }

    async _añadirIdioma(idioma, nivel) {
        try {
            const result = await gestorIdiomas.añadirIdioma(idioma, nivel);
            if (result) {
                await gestorIdiomas._cargarIdiomas();
                await this._recargarConfiguracion();
                if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this.core);
                this.core?.mostrarToast(`✅ Idioma "${idioma}" añadido (${nivel})`, 'success');
            } else {
                this.core?.mostrarToast(`❌ El idioma "${idioma}" ya existe`, 'error');
            }
        } catch (e) {
            console.error('❌ Error:', e);
            this.core?.mostrarToast('❌ Error: ' + e.message, 'error');
        }
    }

    async _cambiarNivelIdioma(idioma) {
        const info = gestorIdiomas.getInfoIdioma(idioma);
        if (!info) {
            this.core?.mostrarToast('❌ Idioma no encontrado', 'error');
            return;
        }
        
        const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const nivelOptions = niveles.map(n => {
            const labels = {
                'A1': 'Principiante', 'A2': 'Elemental', 'B1': 'Intermedio',
                'B2': 'Intermedio Alto', 'C1': 'Avanzado', 'C2': 'Maestría'
            };
            const actual = n === info.nivel ? ' (actual)' : '';
            return `• ${n} - ${labels[n]}${actual}`;
        }).join('\n');
        
        const nuevoNivel = await this.core.prompt(
            `📊 Cambiar nivel para "${idioma}"\n\nNivel actual: ${info.nivel}\n\nOpciones:\n${nivelOptions}`,
            info.nivel,
            'Escribe el nuevo nivel...',
            '📊 Cambiar Nivel'
        );
        
        if (!nuevoNivel) return;
        
        const nivelUpper = nuevoNivel.toUpperCase().trim();
        if (!niveles.includes(nivelUpper)) {
            await this.core.alert(`❌ "${nuevoNivel}" no es un nivel válido.`, 'Error');
            return;
        }
        
        if (nivelUpper === info.nivel) {
            this.core?.mostrarToast(`📌 Ya estás en nivel ${nivelUpper}`, 'info');
            return;
        }
        
        try {
            const result = await gestorIdiomas.cambiarNivel(idioma, nivelUpper);
            if (result) {
                await this._recargarConfiguracion();
                if (idioma === gestorIdiomas.getIdiomaActivo() && pipeline) {
                    pipeline.nivel = nivelUpper;
                }
                if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this.core);
                this.core?.mostrarToast(`✅ Nivel de "${idioma}" cambiado a ${nivelUpper}`, 'success');
            }
        } catch (e) {
            this.core?.mostrarToast('❌ Error: ' + e.message, 'error');
        }
    }

    async _eliminarIdioma(idioma) {
        const info = gestorIdiomas.getInfoIdioma(idioma);
        if (!info) {
            this.core?.mostrarToast('❌ Idioma no encontrado', 'error');
            return;
        }
        
        const idiomas = gestorIdiomas.getIdiomas();
        if (idiomas.length <= 1) {
            await this.core.alert('❌ No puedes eliminar el último idioma.', 'Error');
            return;
        }
        
        const confirmar = await this.core.confirm(
            `⚠️ ¿Eliminar el idioma "${idioma}"?\n\nNivel: ${info.nivel}\nProgreso: ${info.progreso || 0}%\nVersión: ${info.versionEstandar || 'v2.0'}`,
            '🗑️ Eliminar Idioma'
        );
        
        if (!confirmar) return;
        
        try {
            const result = await gestorIdiomas.eliminarIdioma(idioma);
            if (result) {
                await this._recargarConfiguracion();
                if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this.core);
                this.core?.mostrarToast(`🗑️ Idioma "${idioma}" eliminado`, 'warning');
            }
        } catch (e) {
            this.core?.mostrarToast('❌ Error: ' + e.message, 'error');
        }
    }

    async _cargarHistorialNiveles() {
        try {
            const historial = await db.getAll('historialNiveles');
            const container = document.getElementById('configHistorialNiveles');
            if (!container) return;
            
            if (historial.length === 0) {
                container.innerHTML = '<p style="color:var(--gray);">No hay cambios de nivel registrados.</p>';
                return;
            }
            
            let html = '<div style="max-height:200px;overflow-y:auto;">';
            const ultimos = historial.slice(-10).reverse();
            for (const h of ultimos) {
                const fecha = new Date(h.fecha).toLocaleDateString();
                const emoji = h.nivelNuevo > h.nivelAnterior ? '⬆️' : '⬇️';
                const idioma = h.idioma || 'idioma desconocido';
                html += `
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--light);font-size:13px;">
                        <span>${emoji} ${h.nivelAnterior} → ${h.nivelNuevo} (${idioma})</span>
                        <span style="color:var(--gray);">${fecha}</span>
                    </div>
                `;
            }
            html += '</div>';
            container.innerHTML = html;
        } catch (e) {
            console.warn('⚠️ Error cargando historial:', e);
        }
    }

    async _actualizarNivelHeader() {
        try {
            const activo = gestorIdiomas.getIdiomaActivo();
            const info = gestorIdiomas.getInfoIdioma(activo);
            const nivel = info?.nivel || 'A1';
            
            const nivelEl = document.getElementById('neuroNivel');
            if (nivelEl) nivelEl.textContent = nivel;
        } catch (e) {
            console.warn('⚠️ Error actualizando nivel header:', e);
        }
    }

    // ============================================================
    // 🔥 GENERAR SUPER JSON - CORREGIDO
    // ============================================================

    async _generarSuperJSON() {
        if (this._generandoSuperJSON) {
            this.core?.mostrarToast('⏳ Ya hay una generación en curso...', 'warning');
            return;
        }

        this._generandoSuperJSON = true;
        const core = this._getCore();

        try {
            const idioma = gestorIdiomas?.getIdiomaActivo() || 'es';
            const nivel = this._obtenerNivelRealUsuario();
            const esJeroglifico = this._esJeroglifico(idioma);
            const idiomaNativo = this._obtenerIdiomaNativo();
            const nombreIdioma = this._getNombreIdioma(idioma);
            
            const versionEstandar = this._obtenerVersionActiva(idioma);
            const nombreVersion = this._obtenerNombreVersion(idioma, versionEstandar);
            const temas = window.UITemas?._obtenerTemasPorNivelYVersion?.(versionEstandar, nivel) || 
                         window.UITemas?.TEMAS_PREDEFINIDOS?.[versionEstandar]?.[nivel] || [];

            core?.mostrarToast(`🧠 Generando plantilla Super JSON para ${nombreIdioma} (${nivel}) con ${nombreVersion}...`, 'info');

            const numTemas = temas.length || 8;
            const numHistorias = numTemas * 3;
            const numFrases = numHistorias * 6;

            const plantilla = this._generarPlantillaSuperJSON(idioma, nivel, idiomaNativo, nombreIdioma, esJeroglifico, temas, versionEstandar, nombreVersion);

            core?.abrirModal(`⚡ Super JSON - ${nombreIdioma} (${nivel}) - ${nombreVersion}`);
            const textarea = document.getElementById('jsonTextarea');
            if (textarea) {
                textarea.value = JSON.stringify(plantilla, null, 2);
                textarea.readOnly = false;
                textarea.style.minHeight = '500px';
                textarea.style.fontSize = '11px';
                textarea.style.fontFamily = 'monospace';
                textarea.style.lineHeight = '1.4';
            }

            // ============================================================
            // 🔥 CONFIGURAR BOTÓN IMPORTAR - CORREGIDO
            // ============================================================
            const importBtn = document.getElementById('jsonImport');
            if (importBtn) {
                const newImportBtn = importBtn.cloneNode(true);
                importBtn.parentNode.replaceChild(newImportBtn, importBtn);
                
                const self = this;
                
                newImportBtn.onclick = async function() {
                    const jsonText = document.getElementById('jsonTextarea')?.value;
                    if (!jsonText || jsonText.trim() === '') {
                        self.core?.mostrarToast('❌ No hay JSON para importar', 'error');
                        return;
                    }
                    
                    try {
                        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importando...';
                        this.disabled = true;
                        
                        const data = JSON.parse(jsonText);
                        console.log('📋 JSON parseado:', data);
                        
                        if (data._INSTRUCCIONES_PARA_IA) {
                            const tieneHistorias = data.historias && data.historias.length > 0 && 
                                                   data.historias[0].frases && data.historias[0].frases.length > 0;
                            
                            let tieneDatosReales = false;
                            if (tieneHistorias) {
                                const primeraFrase = data.historias[0].frases[0];
                                if (primeraFrase && primeraFrase.original && 
                                    !primeraFrase.original.startsWith('Frase') &&
                                    !primeraFrase.original.startsWith('[')) {
                                    tieneDatosReales = true;
                                }
                            }
                            
                            // 🔥 NUEVO: Verificar si hay datos en "temas" con contenido real
                            if (!tieneDatosReales && data.temas && data.temas.length > 0) {
                                for (const tema of data.temas) {
                                    if (tema.historias && tema.historias.length > 0) {
                                        const primeraHistoria = tema.historias[0];
                                        if (primeraHistoria.frases && primeraHistoria.frases.length > 0) {
                                            const primeraFrase = primeraHistoria.frases[0];
                                            if (primeraFrase.original && 
                                                !primeraFrase.original.startsWith('Frase') &&
                                                !primeraFrase.original.startsWith('[')) {
                                                tieneDatosReales = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            
                            if (!tieneDatosReales) {
                                self.core?.mostrarToast('⚠️ Esto es una PLANTILLA vacía. Pide a la IA que la complete y luego importa.', 'warning');
                                this.innerHTML = '<i class="fas fa-file-import"></i> Importar';
                                this.disabled = false;
                                return;
                            }
                            
                            await self._importarSuperJSON(data);
                            self.core?.cerrarModal();
                            self.core?.mostrarToast('✅ Super JSON importado correctamente', 'success');
                            
                            if (window.UITemas) {
                                setTimeout(() => {
                                    window.UITemas._renderTemas();
                                }, 300);
                            }
                            if (window.UIGrammar) {
                                setTimeout(() => {
                                    window.UIGrammar._cargarGramatica();
                                }, 300);
                            }
                            if (window.UIDashboard) {
                                window.UIDashboard._cargarDashboardInicial(self.core);
                            }
                            if (window.UIEspacio) {
                                setTimeout(() => {
                                    window.UIEspacio._renderizarMiEspacio();
                                }, 300);
                            }
                            if (window.UICaracteres) {
                                setTimeout(() => {
                                    window.UICaracteres.cargar(self.core);
                                }, 300);
                            }
                            
                        } else {
                            await self._importarSuperJSON(data);
                            self.core?.cerrarModal();
                            self.core?.mostrarToast('✅ Super JSON importado correctamente', 'success');
                            
                            if (window.UITemas) {
                                setTimeout(() => {
                                    window.UITemas._renderTemas();
                                }, 300);
                            }
                            if (window.UIDashboard) {
                                window.UIDashboard._cargarDashboardInicial(self.core);
                            }
                        }
                        
                    } catch (e) {
                        console.error('❌ Error importando:', e);
                        self.core?.mostrarToast('❌ Error: ' + e.message, 'error');
                    } finally {
                        this.innerHTML = '<i class="fas fa-file-import"></i> Importar';
                        this.disabled = false;
                    }
                };
            }

            // ============================================================
            // 🔥 CONFIGURAR BOTÓN COPIAR
            // ============================================================
            const copyBtn = document.getElementById('jsonCopy');
            if (copyBtn) {
                const newCopyBtn = copyBtn.cloneNode(true);
                copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
                
                newCopyBtn.onclick = function() {
                    const textarea = document.getElementById('jsonTextarea');
                    if (textarea) {
                        navigator.clipboard.writeText(textarea.value)
                            .then(() => self.core?.mostrarToast('📋 Copiado al portapapeles', 'success'))
                            .catch(() => {
                                textarea.select();
                                document.execCommand('copy');
                                self.core?.mostrarToast('📋 Copiado al portapapeles', 'success');
                            });
                    }
                };
            }

            // Mostrar información en el modal
            const modalContent = document.querySelector('.modal-content');
            if (modalContent) {
                const oldInfo = modalContent.querySelector('.super-json-info');
                if (oldInfo) oldInfo.remove();
                
                const infoDiv = document.createElement('div');
                infoDiv.className = 'super-json-info';
                infoDiv.style.cssText = `
                    background: var(--bg);
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin-bottom: 12px;
                    font-size: 12px;
                    color: var(--gray);
                    border-left: 4px solid var(--primary);
                `;
                infoDiv.innerHTML = `
                    <strong>📊 Resumen del Super JSON:</strong><br>
                    🌍 ${nombreIdioma} (${nivel}) · ${idiomaNativo}<br>
                    📚 ${numTemas} temas · 📖 ${numHistorias} historias · 📝 ${numFrases} frases
                    ${esJeroglifico ? ' · 🀄 Incluye caracteres y familias' : ''}
                    <br>
                    📌 Versión del estándar: <strong>${nombreVersion}</strong>
                    <br>
                    <span style="font-size:11px;color:var(--gray-light);">
                        💡 <strong>IMPORTANTE:</strong> Esta es una PLANTILLA. Pide a la IA que la complete y luego pulsa "Importar" para cargarla.
                    </span>
                    <br>
                    <span style="font-size:10px;color:var(--success);">
                        ✅ El JSON completado se importará automáticamente.
                    </span>
                `;
                const modalBody = modalContent.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.insertBefore(infoDiv, modalBody.firstChild);
                }
            }

            core?.mostrarToast(`✅ Plantilla Super JSON generada (${numTemas} temas, ${numHistorias} historias) con ${nombreVersion}`, 'success');

        } catch (error) {
            console.error('❌ Error generando Super JSON:', error);
            core?.mostrarToast('❌ Error: ' + error.message, 'error');
        } finally {
            this._generandoSuperJSON = false;
        }
    }

    // ============================================================
    // GENERAR PLANTILLA SUPER JSON
    // ============================================================

    _generarPlantillaSuperJSON(idioma, nivel, idiomaNativo, nombreIdioma, esJeroglifico, temas, versionEstandar, nombreVersion) {
        const familiasSemanticas = this._FAMILIAS_SEMANTICAS.join(', ');
        const numHistoriasPorTema = 3;
        const numFrasesPorHistoria = 6;
        const palabrasRequeridas = window.gestorIdiomas?._obtenerPalabrasPorVersion?.(idioma, versionEstandar, nivel) || 2000;

        const plantilla = {
            "_INSTRUCCIONES_PARA_IA": {
                "version": "22.0",
                "accion": `Genera un curso COMPLETO y PROFESIONAL de nivel ${nivel} para ${nombreIdioma}`,
                "idioma_objetivo": idioma,
                "nombre_idioma": nombreIdioma,
                "nivel": nivel,
                "idioma_nativo": idiomaNativo,
                "es_jeroglifico": esJeroglifico,
                "num_temas": temas.length,
                "num_historias_por_tema": numHistoriasPorTema,
                "num_frases_por_historia": numFrasesPorHistoria,
                "temas": temas.map(t => t.nombre),
                "version_estandar": versionEstandar,
                "nombre_version": nombreVersion,
                "palabras_requeridas": palabrasRequeridas,
                "instrucciones": [
                    `1. Genera ${numHistoriasPorTema} mini-historias por cada uno de los ${temas.length} temas`,
                    `2. Cada historia debe tener ${numFrasesPorHistoria} frases en ${idioma}`,
                    `3. El nivel de dificultad es ${nivel}`,
                    `4. La versión del estándar es ${nombreVersion} (${versionEstandar})`,
                    `5. Este nivel requiere aproximadamente ${palabrasRequeridas} palabras en total`,
                    `6. Cada frase debe tener: 'original', 'traduccion'`,
                    `7. Incluye 'regla_gramatical' y 'explicacion_gramatical' para cada frase`,
                    `8. Incluye 'palabras' con 'familia', 'tipo', 'significado'`,
                    `9. Clasifica TODAS las palabras en familias semánticas`,
                    `10. Genera un listado completo de vocabulario por familia semántica`,
                    `11. Genera un listado de reglas gramaticales del nivel ${nivel}`,
                    `12. Genera ejercicios para cada tema`,
                    `13. Genera logros desbloqueables para el nivel`,
                    `14. TODAS las palabras deben tener su tipo gramatical correcto`,
                    `15. Las frases deben ser NATURALES y UTILIZABLES en la vida cotidiana`,
                    `16. El vocabulario debe ser APROPIADO para el nivel ${nivel} y la versión ${nombreVersion}`
                ],
                "familias_semanticas_disponibles": this._FAMILIAS_SEMANTICAS,
                "niveles_disponibles": this._NIVELES,
                ...(esJeroglifico ? {
                    "instrucciones_adicionales": [
                        "17. ⚠️ IMPORTANTE: Para CADA frase, proporciona 'pinyin' CON TONOS",
                        "18. La 'segmentacion' debe separar CADA palabra con su pinyin",
                        "19. Genera una lista de CARACTERES CLAVE del nivel con: pinyin, significado, trazos, radical, mnemotecnia",
                        "20. Para cada carácter clave, genera PALABRAS DERIVADAS del mismo nivel",
                        "21. Para cada carácter clave, proporciona FRASES DE EJEMPLO",
                        "22. Genera FAMILIAS DE CARACTERES (carácter raíz + palabras derivadas)",
                        "23. Asegúrate de cubrir las ${palabrasRequeridas} palabras requeridas"
                    ]
                } : {})
            },
            "meta": {
                "idioma": idioma,
                "nivel": nivel,
                "idioma_nativo": idiomaNativo,
                "es_jeroglifico": esJeroglifico,
                "num_temas": temas.length,
                "num_historias_total": temas.length * numHistoriasPorTema,
                "num_frases_total": temas.length * numHistoriasPorTema * numFrasesPorHistoria,
                "version_estandar": versionEstandar,
                "nombre_version": nombreVersion,
                "palabras_requeridas": palabrasRequeridas,
                "fecha_generacion": new Date().toISOString(),
                "version": "22.0",
                "generado_por": "Pipeline Neuro - Super Power"
            },
            "temas": temas.map(tema => ({
                "id": tema.id,
                "nombre": tema.nombre,
                "descripcion": tema.descripcion,
                "icono": tema.icono,
                "historias": []
            })),
            "vocabulario": {
                "total_palabras": 0,
                "por_familia_semantica": {},
                "por_nivel": {},
                "lista_completa": []
            },
            "reglas_gramaticales": [],
            "ejercicios": [],
            "logros": [],
            ...(esJeroglifico ? {
                "caracteres_clave": [],
                "familias_caracteres": [],
                "estudios_completos": []
            } : {})
        };

        // Rellenar con placeholders
        for (const tema of plantilla.temas) {
            for (let h = 1; h <= numHistoriasPorTema; h++) {
                const historia = {
                    "titulo": `Historia ${h} sobre ${tema.nombre} (cámbialo por uno creativo)`,
                    "frases": []
                };
                for (let f = 1; f <= numFrasesPorHistoria; f++) {
                    const frase = {
                        "original": `[Frase ${f} en ${idioma} sobre ${tema.nombre}]`,
                        "traduccion": `[Traducción al ${idiomaNativo} de la frase ${f}]`,
                        "regla_gramatical": `[Regla gramatical ${f}]`,
                        "explicacion_gramatical": `[Explicación de la regla ${f} en ${idiomaNativo}, nivel ${nivel}]`,
                        "palabras": [
                            {
                                "palabra": `[palabra_clave_${f}]`,
                                "familia_semantica": `[familia_semantica]`,
                                "tipo": `[tipo_gramatical]`,
                                "significado": `[significado_en_${idiomaNativo}]`
                            }
                        ]
                    };
                    if (esJeroglifico) {
                        frase.pinyin = `[pinyin_con_tonos_frase_${f}]`;
                        frase.segmentacion = {
                            "hanzi": `[hanzi_frase_${f}]`,
                            "pinyin": `[pinyin_frase_${f}]`
                        };
                        frase.palabras[0].hanzi = `[hanzi_palabra_${f}]`;
                        frase.palabras[0].pinyin = `[pinyin_palabra_${f}]`;
                    }
                    historia.frases.push(frase);
                }
                tema.historias.push(historia);
            }
        }

        // Vocabulario placeholders
        for (const familia of this._FAMILIAS_SEMANTICAS) {
            plantilla.vocabulario.por_familia_semantica[familia] = [];
        }

        // Reglas gramaticales placeholders
        const tiposReglas = ['tiempo_verbal', 'estructura_oracional', 'concordancia', 'uso_preposicional', 'articulos', 'pronombres'];
        for (let i = 1; i <= 10; i++) {
            plantilla.reglas_gramaticales.push({
                "nombre": `[Regla gramatical ${i} del nivel ${nivel}]`,
                "explicacion": `[Explicación detallada de la regla ${i} en ${idiomaNativo}]`,
                "ejemplos": [`[Ejemplo 1 de la regla ${i}]`, `[Ejemplo 2 de la regla ${i}]`],
                "categoria": tiposReglas[i % tiposReglas.length],
                "nivel": nivel
            });
        }

        // Ejercicios placeholders
        const tiposEjercicios = ['completar', 'ordenar', 'asociacion', 'traduccion', 'multiple'];
        for (const tema of temas) {
            const tipo = tiposEjercicios[Math.floor(Math.random() * tiposEjercicios.length)];
            plantilla.ejercicios.push({
                "tema": tema.nombre,
                "tipo": tipo,
                "pregunta": `[Ejercicio de ${tipo} sobre ${tema.nombre}]`,
                "respuesta": `[Respuesta correcta]`,
                "pista": `[Pista para el ejercicio]`,
                "nivel": nivel
            });
        }

        // Logros placeholders
        const logrosTemas = temas.slice(0, 5).map(t => ({
            "nombre": `Explorador de ${t.nombre}`,
            "descripcion": `Aprende 10 palabras relacionadas con ${t.nombre}`,
            "icono": t.icono || '🌟'
        }));
        plantilla.logros = [
            ...logrosTemas,
            {
                "nombre": `Maestro del nivel ${nivel}`,
                "descripcion": `Completa todas las actividades del nivel ${nivel}`,
                "icono": "🏆"
            },
            {
                "nombre": `Vocabulario avanzado ${nivel}`,
                "descripcion": `Aprende 50 palabras del nivel ${nivel}`,
                "icono": "📚"
            }
        ];

        // Caracteres clave placeholders (si es jeroglífico)
        if (esJeroglifico) {
            const caracteresEjemplo = ['家', '人', '有', '是', '我', '你', '他', '她', '们', '的'];
            for (let i = 0; i < Math.min(10, caracteresEjemplo.length); i++) {
                const c = caracteresEjemplo[i];
                plantilla.caracteres_clave.push({
                    "simbolo": c,
                    "pinyin": `[pinyin_de_${c}]`,
                    "significado": `[significado_de_${c}_en_${idiomaNativo}]`,
                    "trazos": Math.floor(Math.random() * 8) + 3,
                    "radical": `[radical_de_${c}]`,
                    "mnemotecnia": `[mnemotecnia_para_${c}]`,
                    "palabras_derivadas": [`[palabra_derivada_1_de_${c}]`, `[palabra_derivada_2_de_${c}]`],
                    "frases_ejemplo": [`[frase_ejemplo_1_con_${c}]`, `[frase_ejemplo_2_con_${c}]`],
                    "nivel": nivel
                });
            }
        }

        return plantilla;
    }

    // ============================================================
    // 🔥 IMPORTAR SUPER JSON - CORREGIDO
    // ============================================================

    async _importarSuperJSON(data) {
        if (!data) {
            throw new Error('No hay datos para importar');
        }

        let datosReales = data;
        if (data._INSTRUCCIONES_PARA_IA) {
            // 🔥 VALIDACIÓN MEJORADA: Verifica si la plantilla tiene contenido real.
            const tieneHistorias = data.historias && data.historias.length > 0 &&
                                   data.historias[0].frases && data.historias[0].frases.length > 0;

            // 🔥 NUEVO: También verifica si hay datos en "temas" y si esos temas tienen historias.
            const tieneTemas = data.temas && data.temas.length > 0 &&
                               data.temas.some(tema => tema.historias && tema.historias.length > 0);

            // Determina si tiene datos reales basándose en historias o temas.
            let tieneDatosReales = false;
            if (tieneHistorias) {
                const primeraFrase = data.historias[0].frases[0];
                if (primeraFrase && primeraFrase.original &&
                    !primeraFrase.original.startsWith('Frase') &&
                    !primeraFrase.original.startsWith('[')) {
                    tieneDatosReales = true;
                }
            } else if (tieneTemas) {
                // Si el JSON tiene temas y al menos uno tiene historias, asumimos que contiene datos.
                // También podemos hacer una verificación más profunda, pero esta es suficiente para tu caso.
                tieneDatosReales = true;
            }

            if (!tieneDatosReales) {
                this.core?.mostrarToast('⚠️ Esto es una PLANTILLA vacía. Pide a la IA que la complete y luego importa.', 'warning');
                return; // Termina la ejecución si sigue siendo una plantilla vacía.
            }

            // Si la validación pasa, asigna los datos para continuar con la importación.
            datosReales = data;
        }

        if (!datosReales.meta || !datosReales.temas || !Array.isArray(datosReales.temas)) {
            throw new Error('JSON inválido: debe contener "meta" y "temas"');
        }

        if (datosReales.temas.length === 0) {
            throw new Error('JSON inválido: no hay temas en el JSON');
        }

        const core = this._getCore();
        const idioma = datosReales.meta.idioma || gestorIdiomas?.getIdiomaActivo() || 'es';
        const nivel = datosReales.meta.nivel || this._obtenerNivelRealUsuario();
        const esJeroglifico = datosReales.meta.es_jeroglifico || this._esJeroglifico(idioma);
        const versionEstandar = datosReales.meta.version_estandar || 'v3.0';
        const nombreVersion = datosReales.meta.nombre_version || 'HSK 3.0';

        core?.mostrarToast(`🧠 Importando Super JSON para ${idioma} (${nivel}) con ${nombreVersion}...`, 'info');

        let totalTemas = 0;
        let totalHistorias = 0;
        let totalFrases = 0;
        let totalPalabras = 0;
        let totalReglas = 0;
        let totalCaracteres = 0;

        // 1. PROCESAR TEMAS E HISTORIAS
        for (const temaData of datosReales.temas) {
            const temasExistentes = await db.obtenerTemasPorIdioma(idioma);
            let temaExistente = temasExistentes.find(t => 
                t.nombre === temaData.nombre && 
                (t._esPredefinido === true || t.origen === 'super_json')
            );

            let temaId;
            if (temaExistente) {
                temaId = temaExistente.id;
                console.log(`📂 Tema "${temaData.nombre}" ya existe (ID: ${temaId})`);
            } else {
                const nuevoTema = {
                    nombre: temaData.nombre,
                    descripcion: temaData.descripcion || '',
                    idioma: idioma,
                    nivel: nivel,
                    icono: temaData.icono || '📁',
                    fechaCreacion: new Date().toISOString(),
                    estado: 'en_curso',
                    historiasIds: [],
                    palabrasClave: [],
                    _esPredefinido: true,
                    _esImportado: true,
                    origen: 'super_json',
                    _version_estandar: versionEstandar,
                    _nombre_version: nombreVersion
                };
                temaId = await db.guardarTema(nuevoTema);
                console.log(`✅ Tema "${temaData.nombre}" creado (ID: ${temaId})`);
                totalTemas++;
            }

            const historias = temaData.historias || [];
            const historiasIds = [];

            for (const historiaData of historias) {
                const historiaObj = {
                    titulo: historiaData.titulo || 'Historia sin título',
                    temaId: temaId,
                    idioma: idioma,
                    nivel: nivel,
                    fechaCreacion: new Date().toISOString(),
                    estado: 'en_curso',
                    frases: historiaData.frases ? historiaData.frases.length : 0,
                    _version_estandar: versionEstandar,
                    _nombre_version: nombreVersion
                };

                const historiaId = await db.guardarHistoria(historiaObj);
                if (historiaId) {
                    historiasIds.push(historiaId);
                    totalHistorias++;

                    const frases = historiaData.frases || [];
                    for (const fraseData of frases) {
                        if (!fraseData.original || !fraseData.traduccion) continue;

                        const fraseObj = {
                            original: fraseData.original,
                            traduccion: fraseData.traduccion,
                            historiaId: historiaId,
                            idioma: idioma,
                            nivel: nivel,
                            esJeroglifico: esJeroglifico,
                            pinyinCompleto: esJeroglifico ? (fraseData.pinyin || '') : '',
                            segmentacion: esJeroglifico && fraseData.segmentacion ? {
                                hanzi: fraseData.segmentacion.hanzi || fraseData.original,
                                pinyin: fraseData.segmentacion.pinyin || fraseData.pinyin || ''
                            } : null,
                            palabras: [],
                            rg: 0,
                            rcn: 0,
                            activa: true,
                            reglaGramatical: fraseData.regla_gramatical || null,
                            explicacionGramatical: fraseData.explicacion_gramatical || null,
                            tipoRegla: fraseData.tipo_regla || null,
                            familiaSemantica: 'Seleccionadas por Usuario',
                            _version_estandar: versionEstandar
                        };

                        const palabras = fraseData.palabras || [];
                        const palabrasFrase = [];
                        for (const pData of palabras) {
                            const palabraText = pData.palabra || pData.hanzi || '';
                            if (!palabraText) continue;

                            const tipoGramatical = pData.tipo || pData.familia || 'sustantivo';
                            const familiaSemantica = pData.familia_semantica || 'General';

                            const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                            let palabraExistente = palabrasExistentes.find(p =>
                                (p.palabra || p.hanzi || '') === palabraText
                            );

                            let palabraId;
                            if (palabraExistente) {
                                palabraId = palabraExistente.id;
                                await db.guardarPalabra({
                                    ...palabraExistente,
                                    frecuencia: (palabraExistente.frecuencia || 0) + 1,
                                    _version_estandar: versionEstandar
                                });
                            } else {
                                const nuevaPalabra = {
                                    palabra: palabraText,
                                    hanzi: esJeroglifico ? palabraText : '',
                                    pinyin: esJeroglifico ? (pData.pinyin || '') : '',
                                    significado: pData.significado || palabraText,
                                    familia: tipoGramatical,
                                    familias: [tipoGramatical],
                                    familiaSemantica: familiaSemantica,
                                    nivel: nivel,
                                    tipo: tipoGramatical,
                                    idioma: idioma,
                                    frecuencia: 1,
                                    neuroScore: 0.5,
                                    nivelDominio: 'nuevo',
                                    fechaCreacion: Date.now(),
                                    _version_estandar: versionEstandar
                                };
                                palabraId = await db.guardarPalabra(nuevaPalabra);
                                totalPalabras++;
                            }

                            if (palabraId) {
                                palabrasFrase.push({
                                    id: palabraId,
                                    palabra: palabraText,
                                    hanzi: esJeroglifico ? palabraText : '',
                                    pinyin: esJeroglifico ? (pData.pinyin || '') : '',
                                    significado: pData.significado || palabraText,
                                    familia: tipoGramatical
                                });
                            }
                        }
                        fraseObj.palabras = palabrasFrase;

                        await db.guardarFrase(fraseObj);
                        totalFrases++;

                        if (fraseData.regla_gramatical && fraseData.explicacion_gramatical) {
                            const reglaObj = {
                                idioma: idioma,
                                nivel: nivel,
                                tipo: fraseData.tipo_regla || 'general',
                                regla: fraseData.regla_gramatical,
                                explicacion: fraseData.explicacion_gramatical,
                                ejemplos: [fraseData.original],
                                frecuencia: 1,
                                fechaCreacion: Date.now(),
                                ultimoUso: Date.now(),
                                _version_estandar: versionEstandar
                            };
                            await db.guardarReglaGramatical(reglaObj);
                            totalReglas++;
                        }
                    }

                    await db.update('historias', {
                        ...historiaObj,
                        id: historiaId,
                        frases: frases.length
                    });
                }
            }

            const temaActual = await db.obtenerTema(temaId);
            if (temaActual) {
                const todasHistoriasIds = [...new Set([...temaActual.historiasIds, ...historiasIds])];
                await db.actualizarTema(temaId, {
                    historiasIds: todasHistoriasIds,
                    frases: (temaActual.frases || 0) + totalFrases,
                    estado: 'en_curso',
                    _version_estandar: versionEstandar,
                    _nombre_version: nombreVersion
                });
            }
        }

        // 2. PROCESAR VOCABULARIO
        if (datosReales.vocabulario && datosReales.vocabulario.lista_completa) {
            for (const p of datosReales.vocabulario.lista_completa) {
                const palabraText = p.palabra || p.hanzi || '';
                if (!palabraText) continue;

                const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                const existe = palabrasExistentes.find(w =>
                    (w.palabra || w.hanzi || '') === palabraText
                );

                if (!existe) {
                    const nuevaPalabra = {
                        palabra: palabraText,
                        hanzi: esJeroglifico ? palabraText : '',
                        pinyin: esJeroglifico ? (p.pinyin || '') : '',
                        significado: p.significado || palabraText,
                        familia: p.tipo || p.familia || 'sustantivo',
                        familias: [p.tipo || p.familia || 'sustantivo'],
                        familiaSemantica: p.familia_semantica || 'General',
                        nivel: nivel,
                        tipo: p.tipo || 'sustantivo',
                        idioma: idioma,
                        frecuencia: 1,
                        neuroScore: 0.5,
                        nivelDominio: 'nuevo',
                        fechaCreacion: Date.now(),
                        _version_estandar: versionEstandar
                    };
                    await db.guardarPalabra(nuevaPalabra);
                    totalPalabras++;
                }
            }
        }

        // 3. PROCESAR REGLAS GRAMATICALES
        if (datosReales.reglas_gramaticales) {
            for (const regla of datosReales.reglas_gramaticales) {
                if (!regla.nombre || !regla.explicacion) continue;
                const reglaObj = {
                    idioma: idioma,
                    nivel: nivel,
                    tipo: regla.categoria || 'general',
                    regla: regla.nombre,
                    explicacion: regla.explicacion,
                    ejemplos: regla.ejemplos || [],
                    frecuencia: 1,
                    fechaCreacion: Date.now(),
                    ultimoUso: Date.now(),
                    _version_estandar: versionEstandar
                };
                await db.guardarReglaGramatical(reglaObj);
                totalReglas++;
            }
        }

        // 4. PROCESAR CARACTERES
        if (esJeroglifico && datosReales.caracteres_clave) {
            for (const c of datosReales.caracteres_clave) {
                const simbolo = c.simbolo || '';
                if (!simbolo) continue;

                const palabrasExistentes = await db.obtenerPalabrasPorIdioma(idioma);
                const existe = palabrasExistentes.find(p =>
                    (p.palabra || p.hanzi || '') === simbolo && p.esCaracterRaiz === true
                );

                if (!existe) {
                    const raizObj = {
                        palabra: simbolo,
                        hanzi: simbolo,
                        pinyin: c.pinyin || '',
                        significado: c.significado || simbolo,
                        familia: 'caracter_raiz',
                        familias: ['caracter_raiz'],
                        familiaSemantica: 'Caracteres Raíz',
                        nivel: nivel,
                        tipo: 'caracter_raiz',
                        idioma: idioma,
                        frecuencia: 1,
                        neuroScore: 0.5,
                        nivelDominio: 'nuevo',
                        fechaCreacion: Date.now(),
                        esCaracterRaiz: true,
                        tema: 'General',
                        numero_trazos: c.trazos || 0,
                        estructura: {
                            trazos_clave: [],
                            radicales: c.radical ? [c.radical] : [],
                            tipo_estructura: 'simple'
                        },
                        mnemotecnia: c.mnemotecnia || '',
                        variantes: null,
                        esPalabraDerivada: false,
                        caracterRaiz: null,
                        desgloseMorfologico: '',
                        desgloseCaracteres: [],
                        asociacionVisual: '',
                        ejemploFrase: c.frases_ejemplo?.[0] || '',
                        familiaSemanticaPrincipal: 'Caracteres Raíz',
                        temaFamilia: 'General',
                        _version_estandar: versionEstandar
                    };
                    await db.guardarPalabra(raizObj);
                    totalCaracteres++;

                    const derivadas = c.palabras_derivadas || [];
                    for (const d of derivadas) {
                        if (!d) continue;
                        const derivadaObj = {
                            palabra: d,
                            hanzi: d,
                            pinyin: '',
                            significado: `Relacionado con ${simbolo}`,
                            familia: 'derivada',
                            familias: ['derivada'],
                            familiaSemantica: 'Caracteres Raíz',
                            nivel: nivel,
                            tipo: 'sustantivo',
                            idioma: idioma,
                            frecuencia: 1,
                            neuroScore: 0.5,
                            nivelDominio: 'nuevo',
                            fechaCreacion: Date.now(),
                            esPalabraDerivada: true,
                            caracterRaiz: simbolo,
                            desgloseMorfologico: `Contiene el carácter "${simbolo}"`,
                            desgloseCaracteres: [
                                { caracter: simbolo, pinyin: c.pinyin || '', significado: c.significado || '' }
                            ],
                            asociacionVisual: `🔗 ${d} contiene el carácter ${simbolo}`,
                            ejemploFrase: c.frases_ejemplo?.[0] || '',
                            familiaSemanticaPrincipal: 'Caracteres Raíz',
                            temaFamilia: 'General',
                            _version_estandar: versionEstandar
                        };
                        await db.guardarPalabra(derivadaObj);
                    }
                }
            }
        }

        // 5. PROCESAR EJERCICIOS Y LOGROS
        if (datosReales.logros) {
            for (const logro of datosReales.logros) {
                if (logro.nombre) {
                    this._logrosDesbloqueados.add(logro.nombre);
                }
            }
            await this._guardarLogros();
        }

        // 6. ACTUALIZAR VIGÍA GRAMATICAL
        if (window.vigiaGramatical) {
            try {
                await window.vigiaGramatical.initGramatical();
                await window.vigiaGramatical._actualizarEdadGramatical(idioma);
            } catch (e) {}
        }

        // 7. ACTUALIZAR MÓDULOS
        if (window.gramatica) {
            await gramatica.cargarPalabras();
            await gramatica.agrupar();
        }
        if (window.pipeline) {
            await pipeline.cargarFrases();
            await pipeline.cargarProgreso();
        }

        const resumen = `✅ Super JSON importado correctamente\n\n` +
            `📚 Temas: ${totalTemas}\n` +
            `📖 Historias: ${totalHistorias}\n` +
            `📝 Frases: ${totalFrases}\n` +
            `📖 Palabras: ${totalPalabras}\n` +
            `📋 Reglas gramaticales: ${totalReglas}\n` +
            `${esJeroglifico ? `🀄 Caracteres: ${totalCaracteres}\n` : ''}` +
            `📌 Versión: ${nombreVersion}\n` +
            `🏆 Logros: ${datosReales.logros?.length || 0}\n\n` +
            `💡 Todo el contenido está disponible en sus respectivos módulos.`;

        await this._getCore()?.alert(resumen, '✅ Importación completada');

        if (window.UICaracteres) window.UICaracteres._limpiarCache();
        if (window.UITemas) window.UITemas._renderTemas();
        if (window.UIGrammar) window.UIGrammar._cargarGramatica();
        if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this._getCore());
        if (window.UIEspacio) window.UIEspacio._renderizarMiEspacio();

        return {
            totalTemas,
            totalHistorias,
            totalFrases,
            totalPalabras,
            totalReglas,
            totalCaracteres
        };
    }

    // ============================================================
    // GUARDAR LOGROS
    // ============================================================

    async _guardarLogros() {
        try {
            localStorage.setItem('pipeline_logros_caracteres', JSON.stringify({
                desbloqueados: Array.from(this._logrosDesbloqueados),
                fecha: new Date().toISOString()
            }));
        } catch (e) {
            console.warn('⚠️ Error guardando logros:', e);
        }
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UIConfig = new UIConfig();

console.log('✅ UIConfig v20.9 - CORREGIDO: BOTÓN IMPORTAR SUPER JSON');
console.log('  🔧 Botón Importar: usa self.core en lugar de window.UIConfig._core');
console.log('  🔧 Validación mejorada del JSON');
console.log('  🔧 Loading visual en el botón durante la importación');
console.log('  🔧 Mejor manejo de errores');
console.log('  📌 Recarga automática de módulos después de importar');
console.log('  📊 Progreso por nivel con mensajes informativos');
console.log('  🔄 Sincronización de versiones con Groq');
console.log('  🚀 Super Power: generación de JSON completo');