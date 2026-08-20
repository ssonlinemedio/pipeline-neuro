// ============================================================
// UI BACKUP v3.3 - COMPLETO CON PERSISTENCIA EN INDEXEDDB
// ============================================================

class UIBackup {
    constructor() {
        this._core = null;
        this._container = null;
        this._modalAbierto = false;
        this._modalOverlay = null;
        this._escapeHandler = null;
        this._backupData = null;
        this._backupName = '';
        this._MAX_BACKUPS = 20;
        
        this._GOOGLE_CLIENT_ID = null;
        this._GOOGLE_API_KEY = null;
        this._SCOPES = 'https://www.googleapis.com/auth/drive.file';
        this._gapiInitialized = false;
        this._gapiLoaded = false;
        this._tokenClient = null;
        this._accessToken = null;
        this._googleDriveEnabled = false;
        
        this._incluirOndasCruzadas = true;
        this._cacheBackups = null;
        this._ultimaActualizacionCache = 0;
        this._tiempoCacheBackups = 5000;
        
        // ============================================================
        // CONFIGURACIÓN DE BACKUP AUTOMÁTICO (con persistencia)
        // ============================================================
        this._autoBackupConfig = {
            activo: false,
            frecuencia: 'desactivado',
            ultimoBackup: null,
            proximoBackup: null,
            intervaloMs: 0,
            maxBackups: 20,
            espacioMaximo: 500 * 1024 * 1024
        };
        
        this._cargarConfiguracionAutoBackup();
    }

    // ============================================================
    // CARGAR CONFIGURACIÓN DE BACKUP AUTOMÁTICO DESDE PERSISTENCIA
    // ============================================================

    async _cargarConfiguracionAutoBackup() {
        try {
            const localConfig = localStorage.getItem('pipeline_backup_auto_config');
            if (localConfig) {
                const parsed = JSON.parse(localConfig);
                this._autoBackupConfig = { ...this._autoBackupConfig, ...parsed };
                console.log('📂 Configuración de backup automático cargada desde localStorage');
            }

            try {
                const configs = await db.getByIndex('configuracion', 'clave', 'backup_auto_config');
                if (configs && configs.length > 0) {
                    const dbConfig = configs[0].valor;
                    this._autoBackupConfig = { ...this._autoBackupConfig, ...dbConfig };
                    console.log('📂 Configuración de backup automático cargada desde IndexedDB');
                }
            } catch (e) {
                console.warn('⚠️ Error cargando backup auto config desde DB:', e);
            }

            const autoLegacy = localStorage.getItem('pipeline_backup_auto') === 'true';
            const frecuenciaLegacy = localStorage.getItem('pipeline_backup_auto_frecuencia');
            
            if (autoLegacy && frecuenciaLegacy) {
                this._autoBackupConfig.activo = true;
                this._autoBackupConfig.frecuencia = frecuenciaLegacy;
                console.log('🔄 Configuración legacy migrada:', frecuenciaLegacy);
                await this._guardarConfiguracionAutoBackup();
            }

            this._iniciarBackupAutomatico();

        } catch (e) {
            console.warn('⚠️ Error cargando configuración de backup automático:', e);
            this._iniciarBackupAutomatico();
        }
    }

    // ============================================================
    // GUARDAR CONFIGURACIÓN DE BACKUP AUTOMÁTICO EN PERSISTENCIA
    // ============================================================

    async _guardarConfiguracionAutoBackup() {
        try {
            localStorage.setItem('pipeline_backup_auto_config', JSON.stringify(this._autoBackupConfig));
            
            if (this._autoBackupConfig.activo) {
                localStorage.setItem('pipeline_backup_auto', 'true');
                localStorage.setItem('pipeline_backup_auto_frecuencia', this._autoBackupConfig.frecuencia);
            } else {
                localStorage.removeItem('pipeline_backup_auto');
                localStorage.removeItem('pipeline_backup_auto_frecuencia');
            }

            try {
                const configs = await db.getByIndex('configuracion', 'clave', 'backup_auto_config');
                if (configs && configs.length > 0) {
                    await db.update('configuracion', { 
                        ...configs[0], 
                        valor: this._autoBackupConfig,
                        fechaActualizacion: Date.now()
                    });
                } else {
                    await db.add('configuracion', {
                        clave: 'backup_auto_config',
                        valor: this._autoBackupConfig,
                        fechaActualizacion: Date.now()
                    });
                }
                console.log('💾 Configuración de backup automático guardada en IndexedDB');
            } catch (e) {
                console.warn('⚠️ Error guardando backup auto config en DB:', e);
            }

            console.log('💾 Configuración de backup automático guardada en localStorage');
            return true;

        } catch (e) {
            console.error('❌ Error guardando configuración de backup automático:', e);
            return false;
        }
    }

    // ============================================================
    // INICIAR BACKUP AUTOMÁTICO
    // ============================================================

    _iniciarBackupAutomatico() {
        if (this._backupInterval) {
            clearInterval(this._backupInterval);
            this._backupInterval = null;
        }
        if (this._backupTimeout) {
            clearTimeout(this._backupTimeout);
            this._backupTimeout = null;
        }

        const frecuencia = this._autoBackupConfig.frecuencia;
        
        if (frecuencia === 'desactivado' || !this._autoBackupConfig.activo) {
            console.log('⏸️ Backup automático desactivado');
            this._autoBackupConfig.activo = false;
            return;
        }

        let intervaloMs = 0;
        let nombreFrecuencia = '';
        
        switch (frecuencia) {
            case 'diario':
                intervaloMs = 24 * 60 * 60 * 1000;
                nombreFrecuencia = 'diario (24h)';
                break;
            case 'semanal':
                intervaloMs = 7 * 24 * 60 * 60 * 1000;
                nombreFrecuencia = 'semanal (7 días)';
                break;
            case 'al_estudiar':
                intervaloMs = 0;
                nombreFrecuencia = 'al terminar sesión de estudio';
                break;
            case 'siempre':
                intervaloMs = 5 * 60 * 1000;
                nombreFrecuencia = 'siempre (cada 5 min)';
                break;
            default:
                console.warn('⚠️ Frecuencia desconocida:', frecuencia);
                return;
        }

        this._autoBackupConfig.intervaloMs = intervaloMs;
        this._autoBackupConfig.activo = true;
        this._autoBackupConfig.nombreFrecuencia = nombreFrecuencia;
        
        console.log(`🔄 Backup automático configurado: ${nombreFrecuencia}`);

        if (frecuencia === 'al_estudiar') {
            window.addEventListener('actividadEstudioDetectada', () => {
                console.log('📚 Actividad de estudio detectada, verificando backup...');
                this._verificarBackupAutomatico(true);
            });
            window.addEventListener('beforeunload', () => {
                console.log('📦 Ejecutando backup al terminar sesión...');
                this._ejecutarBackupAutomatico();
            });
            return;
        }

        if (frecuencia === 'siempre' && intervaloMs > 0) {
            if (this._autoBackupConfig.ultimoBackup) {
                const tiempoTranscurrido = Date.now() - this._autoBackupConfig.ultimoBackup;
                if (tiempoTranscurrido >= intervaloMs) {
                    console.log('📦 Ejecutando backup automático (tiempo transcurrido)');
                    setTimeout(() => this._ejecutarBackupAutomatico(), 1000);
                }
            }
            
            this._backupInterval = setInterval(() => {
                console.log('📦 Ejecutando backup automático programado...');
                this._ejecutarBackupAutomatico();
            }, intervaloMs);
            
            console.log(`⏱️ Backup automático cada ${intervaloMs / 1000 / 60} minutos`);
        }
    }

    // ============================================================
    // EJECUTAR BACKUP AUTOMÁTICO
    // ============================================================

    async _ejecutarBackupAutomatico() {
        if (this._ejecutandoBackup) return;
        this._ejecutandoBackup = true;
        
        try {
            console.log('📦 Iniciando backup automático...');
            
            const data = await db.exportarBackup();
            
            let ondasCruzadasData = null;
            if (window.modoOndasCruzadas) {
                try {
                    const estado = window.modoOndasCruzadas.getEstado();
                    ondasCruzadasData = {
                        grafoElipse: window.modoOndasCruzadas._grafoElipse || {},
                        recuerdoGlobal: {
                            personajes: Array.from(window.modoOndasCruzadas._recuerdoGlobal.personajes || new Set()),
                            lugares: Array.from(window.modoOndasCruzadas._recuerdoGlobal.lugares || new Set()),
                            eventosClave: window.modoOndasCruzadas._recuerdoGlobal.eventosClave || [],
                            vocabularioAcumulado: Array.from(window.modoOndasCruzadas._recuerdoGlobal.vocabularioAcumulado?.entries() || []),
                            resumenGlobal: window.modoOndasCruzadas._recuerdoGlobal.resumenGlobal || '',
                            ultimaActualizacion: window.modoOndasCruzadas._recuerdoGlobal.ultimaActualizacion || Date.now()
                        },
                        mapaInterferencias: window.modoOndasCruzadas._mapaInterferencias || {},
                        config: window.modoOndasCruzadas._config || {},
                        estadisticas: estado || {},
                        timestamp: Date.now()
                    };
                } catch (e) {
                    console.warn('⚠️ Error capturando Ondas Cruzadas:', e);
                }
            }
            
            let elipseData = null;
            if (window.modoElipse) {
                try {
                    elipseData = window.modoElipse.getEstadoCompleto();
                } catch (e) {
                    console.warn('⚠️ Error capturando Elipse:', e);
                }
            }

            const backup = {
                id: Date.now(),
                fecha: new Date().toISOString(),
                data: data,
                usuario: await db.getUsuario(),
                idiomaActivo: gestorIdiomas?.getIdiomaActivo() || 'es',
                version: '3.3',
                tamano: JSON.stringify(data).length,
                automatico: true,
                ondasCruzadas: ondasCruzadasData,
                elipse: elipseData,
                _metadata: {
                    totalOndasCruzadas: ondasCruzadasData ? 
                        Object.values(ondasCruzadasData.grafoElipse).reduce((acc, el) => acc + (el.totalOndas || 0), 0) : 0,
                    totalElipses: ondasCruzadasData ? Object.keys(ondasCruzadasData.grafoElipse).length : 0,
                    totalOndasElipse: elipseData?.historias?.length || 0
                }
            };

            await db.add('backups', backup);
            
            this._autoBackupConfig.ultimoBackup = Date.now();
            this._autoBackupConfig.proximoBackup = this._autoBackupConfig.ultimoBackup + this._autoBackupConfig.intervaloMs;
            await this._guardarConfiguracionAutoBackup();
            
            await this._limpiarBackupsAntiguos();
            
            console.log('✅ Backup automático completado (ID:', backup.id, ')');
            
            window.dispatchEvent(new CustomEvent('backupAutomaticoCompletado', {
                detail: { backupId: backup.id, timestamp: Date.now() }
            }));

        } catch (error) {
            console.error('❌ Error en backup automático:', error);
        } finally {
            this._ejecutandoBackup = false;
        }
    }

    // ============================================================
    // LIMPIAR BACKUPS ANTIGUOS
    // ============================================================

    async _limpiarBackupsAntiguos() {
        try {
            const backups = await db.getAll('backups');
            if (!backups || backups.length === 0) return;
            
            backups.sort((a, b) => b.timestamp - a.timestamp);
            
            const maxBackups = this._autoBackupConfig.maxBackups || 20;
            let espacioTotal = 0;
            let backupsAEliminar = [];
            
            for (let i = 0; i < backups.length; i++) {
                const size = backups[i].size || 0;
                espacioTotal += size;
                
                if (i >= maxBackups || espacioTotal > (this._autoBackupConfig.espacioMaximo || 500 * 1024 * 1024)) {
                    backupsAEliminar.push(backups[i]);
                }
            }
            
            for (const backup of backupsAEliminar) {
                await db.delete('backups', backup.id);
                console.log(`🗑️ Backup antiguo eliminado: ${new Date(backup.timestamp).toLocaleString()}`);
            }
            
            if (backupsAEliminar.length > 0) {
                console.log(`🗑️ Eliminados ${backupsAEliminar.length} backups antiguos`);
            }
            
        } catch (e) {
            console.warn('⚠️ Error limpiando backups antiguos:', e);
        }
    }

    // ============================================================
    // VERIFICAR BACKUP AUTOMÁTICO
    // ============================================================

    async _verificarBackupAutomatico(forzar = false) {
        if (!this._autoBackupConfig.activo) {
            console.log('ℹ️ Backup automático desactivado');
            return false;
        }

        const frecuencia = this._autoBackupConfig.frecuencia || 'diario';
        const ultimo = this._autoBackupConfig.ultimoBackup;
        const ahora = Date.now();

        if (frecuencia === 'siempre') {
            console.log('🔄 Backup "siempre" activado, ejecutando...');
            const result = await this._ejecutarBackupAutomatico();
            return result;
        }

        var intervalo = 24 * 60 * 60 * 1000;
        if (frecuencia === 'semanal') intervalo = 7 * 24 * 60 * 60 * 1000;
        
        if (frecuencia === 'al_estudiar') {
            const ultimaActividad = localStorage.getItem('pipeline_ultima_actividad');
            if (ultimaActividad && (ahora - parseInt(ultimaActividad) < 3600000)) {
                console.log('📚 Actividad reciente detectada, ejecutando backup...');
                const result = await this._ejecutarBackupAutomatico();
                return result;
            }
            return false;
        }

        const tiempoTranscurrido = ultimo ? (ahora - parseInt(ultimo)) : intervalo + 1;
        
        if (forzar || tiempoTranscurrido > intervalo) {
            console.log('🤖 Ejecutando backup automático (' + (forzar ? 'forzado' : 'programado') + ')...');
            const result = await this._ejecutarBackupAutomatico();
            console.log('✅ Backup automático completado (' + frecuencia + ')');
            return result;
        } else {
            const horasRestantes = Math.round((intervalo - tiempoTranscurrido) / 3600000);
            console.log('⏳ Próximo backup automático en ~' + horasRestantes + 'h');
            return false;
        }
    }

    // ============================================================
    // CONFIGURAR BACKUP AUTOMÁTICO (MENÚ COMPLETO)
    // ============================================================

    async _configurarBackupAutomatico() {
        const stats = await this._obtenerEstadisticasBackups();
        const frecuenciaActual = this._autoBackupConfig.frecuencia || 'desactivado';
        const activoActual = this._autoBackupConfig.activo || false;

        let ondasElipse = 0;
        let ondasCruzadas = 0;
        try {
            if (window.modoElipse) {
                const elipseEstado = window.modoElipse.getEstado();
                ondasElipse = elipseEstado?.totalOndas || 0;
            }
            if (window.modoOndasCruzadas) {
                const cruzadasEstado = window.modoOndasCruzadas.getEstado();
                ondasCruzadas = cruzadasEstado?.totalOndas || 0;
            }
        } catch (e) {}

        const opciones = [
            { id: 'desactivado', label: 'Desactivado', icon: '⏸️' },
            { id: 'diario', label: 'Diario (24h)', icon: '📅' },
            { id: 'semanal', label: 'Semanal (7 días)', icon: '📆' },
            { id: 'al_estudiar', label: 'Al terminar sesión de estudio', icon: '📚' },
            { id: 'siempre', label: 'Siempre (al abrir y al cerrar)', icon: '🔄' }
        ];

        const html = `
            <div style="background:var(--white);border-radius:16px;padding:24px;max-width:500px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="font-size:20px;font-weight:700;color:var(--dark);margin:0;">
                        🤖 Backup Automático
                    </h3>
                    <button onclick="window.UIBackup._cerrarConfiguracionBackup()" 
                            style="background:none;border:none;font-size:28px;color:var(--gray);cursor:pointer;">&times;</button>
                </div>

                <div style="background:var(--bg);border-radius:10px;padding:12px 16px;margin-bottom:16px;border:1px solid var(--light);">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;color:var(--gray);">
                        <div><span style="font-weight:600;color:var(--dark);">📦 Backups:</span> ${stats.total}</div>
                        <div><span style="font-weight:600;color:var(--dark);">💾 Espacio:</span> ${stats.espacioMB} MB</div>
                        <div><span style="font-weight:600;color:var(--dark);">🌌 Elipse:</span> ${ondasElipse}</div>
                        <div><span style="font-weight:600;color:var(--dark);">🌊 Cruzadas:</span> ${ondasCruzadas}</div>
                    </div>
                    <div style="font-size:11px;color:var(--gray-light);margin-top:4px;">
                        Último backup: ${stats.ultimoBackupFecha}
                        ${activoActual ? ` · ✅ ${frecuenciaActual}` : ' · ⏸️ Desactivado'}
                    </div>
                </div>

                <div style="margin-bottom:16px;">
                    <label style="font-size:14px;font-weight:600;color:var(--dark);display:block;margin-bottom:8px;">
                        📋 Selecciona la frecuencia:
                    </label>
                    <div style="display:flex;flex-direction:column;gap:4px;">
                        ${opciones.map(op => `
                            <label style="display:flex;align-items:center;gap:10px;padding:8px 14px;background:${frecuenciaActual === op.id && activoActual ? 'var(--primary)08' : 'var(--white)'};border-radius:8px;border:2px solid ${frecuenciaActual === op.id && activoActual ? 'var(--primary)' : 'var(--light)'};cursor:pointer;transition:all 0.2s;"
                                   onmouseover="this.style.background='${frecuenciaActual === op.id && activoActual ? 'var(--primary)10' : 'var(--bg)'}'" 
                                   onmouseout="this.style.background='${frecuenciaActual === op.id && activoActual ? 'var(--primary)08' : 'var(--white)'}'">
                                <input type="radio" name="frecuenciaBackup" value="${op.id}" 
                                       ${frecuenciaActual === op.id && activoActual ? 'checked' : ''}
                                       style="width:18px;height:18px;cursor:pointer;">
                                <span style="font-size:15px;">${op.icon}</span>
                                <span style="font-size:14px;font-weight:${frecuenciaActual === op.id && activoActual ? '700' : '400'};color:${frecuenciaActual === op.id && activoActual ? 'var(--primary)' : 'var(--dark)'};">${op.label}</span>
                                ${frecuenciaActual === op.id && activoActual ? '<span style="margin-left:auto;font-size:12px;color:var(--primary);font-weight:600;">✅ Activo</span>' : ''}
                                ${op.id === 'desactivado' && !activoActual ? '<span style="margin-left:auto;font-size:12px;color:var(--gray-light);">⏸️</span>' : ''}
                            </label>
                        `).join('')}
                    </div>
                    <div style="font-size:11px;color:var(--gray-light);margin-top:6px;">
                        💡 Los backups se guardan en IndexedDB y se sincronizan con tu cuenta.
                        <br>🔒 La configuración se guarda en tu perfil (localStorage + IndexedDB).
                    </div>
                </div>

                <div style="display:flex;gap:10px;margin-top:8px;">
                    <button onclick="window.UIBackup._guardarConfiguracionBackupUI()" 
                            class="btn-primary" 
                            style="flex:1;padding:12px 20px;font-size:15px;font-weight:700;background:linear-gradient(135deg,#6C5CE7,#A29BFE);color:white;border:none;border-radius:8px;cursor:pointer;transition:all 0.3s;">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                    <button onclick="window.UIBackup._cerrarConfiguracionBackup()" 
                            class="btn-secondary" 
                            style="padding:12px 24px;font-size:15px;background:var(--light);color:var(--gray);border:none;border-radius:8px;cursor:pointer;">
                        Cancelar
                    </button>
                </div>
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.id = 'configBackupOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            z-index: 100001;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        `;
        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        this._modalAbierto = true;
        window._backupConfigOverlay = overlay;
    }

    // ============================================================
    // GUARDAR CONFIGURACIÓN BACKUP UI
    // ============================================================

    async _guardarConfiguracionBackupUI() {
        const selected = document.querySelector('input[name="frecuenciaBackup"]:checked');
        if (!selected) {
            this._core?.mostrarToast('⚠️ Selecciona una frecuencia', 'warning');
            return;
        }

        const frecuencia = selected.value;
        const activo = frecuencia !== 'desactivado';

        this._autoBackupConfig.frecuencia = frecuencia;
        this._autoBackupConfig.activo = activo;

        if (activo) {
            switch (frecuencia) {
                case 'diario':
                    this._autoBackupConfig.intervaloMs = 24 * 60 * 60 * 1000;
                    break;
                case 'semanal':
                    this._autoBackupConfig.intervaloMs = 7 * 24 * 60 * 60 * 1000;
                    break;
                case 'al_estudiar':
                    this._autoBackupConfig.intervaloMs = 0;
                    break;
                case 'siempre':
                    this._autoBackupConfig.intervaloMs = 5 * 60 * 1000;
                    break;
                default:
                    this._autoBackupConfig.intervaloMs = 0;
            }
        } else {
            this._autoBackupConfig.intervaloMs = 0;
        }

        await this._guardarConfiguracionAutoBackup();
        this._iniciarBackupAutomatico();
        this._cerrarConfiguracionBackup();

        const mensaje = activo 
            ? `✅ Backup automático configurado: ${this._autoBackupConfig.nombreFrecuencia || frecuencia}`
            : '⏸️ Backup automático desactivado';
        this._core?.mostrarToast(mensaje, 'success');

        this._renderizarPanel();
    }

    // ============================================================
    // CERRAR CONFIGURACIÓN BACKUP
    // ============================================================

    _cerrarConfiguracionBackup() {
        const overlay = document.getElementById('configBackupOverlay');
        if (overlay) {
            overlay.remove();
        }
        window._backupConfigOverlay = null;
        this._modalAbierto = false;
    }

    // ============================================================
    // OBTENER ESTADÍSTICAS DE BACKUPS
    // ============================================================

    async _obtenerEstadisticasBackups() {
        try {
            const backups = await db.getAll('backups');
            const total = backups.length;
            let espacioTotal = 0;
            let ultimoBackup = null;
            
            for (const b of backups) {
                espacioTotal += b.size || 0;
                if (!ultimoBackup || b.timestamp > ultimoBackup) {
                    ultimoBackup = b.timestamp;
                }
            }
            
            return {
                total,
                espacioTotal,
                espacioMB: (espacioTotal / (1024 * 1024)).toFixed(2),
                ultimoBackup,
                ultimoBackupFecha: ultimoBackup ? new Date(ultimoBackup).toLocaleString() : 'Nunca',
                configuracion: this._autoBackupConfig,
                frecuencia: this._autoBackupConfig.frecuencia,
                activo: this._autoBackupConfig.activo
            };
        } catch (e) {
            console.warn('⚠️ Error obteniendo estadísticas de backups:', e);
            return {
                total: 0,
                espacioTotal: 0,
                espacioMB: '0.00',
                ultimoBackup: null,
                ultimoBackupFecha: 'Nunca',
                configuracion: this._autoBackupConfig,
                frecuencia: this._autoBackupConfig.frecuencia,
                activo: this._autoBackupConfig.activo
            };
        }
    }

    // ============================================================
    // MÉTODOS DE INICIALIZACIÓN
    // ============================================================

    async init(core) {
        this._core = core;
        
        const savedLimit = localStorage.getItem('pipeline_backup_max_limit');
        if (savedLimit) {
            this._MAX_BACKUPS = parseInt(savedLimit) || 20;
        }
        
        await this._verificarStoreBackups();
        await this._migrarBackupsDesdeLocalStorage();
        await this._cargarConfiguracionAutoBackup();
        
        console.log('✅ UIBackup v3.3 iniciado (con persistencia en IndexedDB)');
        return this;
    }

    async _verificarStoreBackups() {
        try {
            if (!db || !db._initialized) {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!db || !db._initialized) {
                    return;
                }
            }
            const backups = await db.getAll('backups');
            console.log('📂 Store backups verificado: ' + backups.length + ' registros');
        } catch (e) {
            console.log('📂 Store "backups" se creará automáticamente al guardar');
        }
    }

    async _migrarBackupsDesdeLocalStorage() {
        try {
            const localBackups = localStorage.getItem('pipeline_backups_locales');
            if (!localBackups) return;

            const backups = JSON.parse(localBackups);
            if (!backups || backups.length === 0) return;

            console.log('🔄 Migrando ' + backups.length + ' backups...');
            let migrados = 0;
            for (const backup of backups) {
                try {
                    const existentes = await db.getAll('backups');
                    const existe = existentes.some(b => b.id === backup.id);
                    if (!existe) {
                        await db.add('backups', backup);
                        migrados++;
                    }
                } catch (e) {
                    console.warn('⚠️ Error migrando backup:', e.message);
                }
            }

            if (migrados > 0) {
                console.log('✅ ' + migrados + ' backups migrados');
                localStorage.removeItem('pipeline_backups_locales');
                this._core?.mostrarToast('📦 ' + migrados + ' backups migrados', 'success');
            }
        } catch (e) {
            console.warn('⚠️ Error migrando backups:', e);
        }
    }

    // ============================================================
    // RENDERIZAR PANEL PRINCIPAL
    // ============================================================

    renderizar(container) {
        this._container = container;
        this._renderizarPanel();
    }

    async _renderizarPanel() {
        if (!this._container) return;

        const backups = await this._obtenerListaBackups();
        const totalBackups = backups.length;
        const espacioTotal = Math.round(backups.reduce((acc, b) => acc + (b.tamano || 0), 0) / 1024);
        
        let ondasCruzadasInfo = 'No disponible';
        let totalElipses = 0;
        let totalInterferencias = 0;
        let totalOndasCruzadas = 0;
        try {
            if (window.modoOndasCruzadas) {
                const estado = window.modoOndasCruzadas.getEstado();
                totalElipses = estado.grafoSize || 0;
                totalInterferencias = estado.interferencias || 0;
                totalOndasCruzadas = estado.ondasTotales || 0;
                ondasCruzadasInfo = totalElipses + ' elipses · ' + totalInterferencias + ' interferencias · ' + totalOndasCruzadas + ' ondas';
            }
        } catch (e) {
            console.warn('⚠️ Error obteniendo estado de Ondas Cruzadas:', e);
        }

        let elipseInfo = 'No disponible';
        let totalOndasElipse = 0;
        try {
            if (window.modoElipse) {
                const estado = window.modoElipse.getEstado();
                totalOndasElipse = estado.totalOndas || 0;
                elipseInfo = totalOndasElipse + ' ondas · ' + (estado.elipseActiva || 'Sin elipse activa');
            }
        } catch (e) {
            console.warn('⚠️ Error obteniendo estado de Elipse:', e);
        }

        let localStorageSize = 0;
        try {
            let totalLocalStorage = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && !key.startsWith('pipeline_backup_')) {
                    totalLocalStorage += localStorage.getItem(key).length;
                }
            }
            localStorageSize = Math.round(totalLocalStorage / 1024);
        } catch (e) {}

        var html = '';
        html += '<div class="backup-container" style="padding:0;width:100%;">';
        
        html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:10px 18px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:12px;border:2px solid var(--primary)20;box-shadow:0 4px 20px rgba(108,92,231,0.08);width:100%;box-sizing:border-box;">';
        html += '<div>';
        html += '<h2 style="font-size:18px;font-weight:800;color:var(--dark);margin:0;">💾 Sistema de Backup</h2>';
        html += '<p style="font-size:12px;color:var(--gray);margin:2px 0 0;">Protege tu progreso en cualquier dispositivo';
        html += '<span style="font-size:10px;color:var(--gray-light);margin-left:8px;">🌊 Ondas Cruzadas: ' + ondasCruzadasInfo + '</span>';
        html += '<br><span style="font-size:10px;color:var(--gray-light);margin-left:8px;">🌌 Elipse: ' + elipseInfo + '</span>';
        html += '<br><span style="font-size:10px;color:var(--success);margin-left:8px;">💾 Almacenamiento en IndexedDB (ilimitado)</span>';
        html += '<span style="font-size:10px;color:var(--gray-light);margin-left:8px;">📊 localStorage: ~' + localStorageSize + ' KB</span>';
        html += '</p></div>';
        html += '<div style="display:flex;gap:6px;flex-wrap:wrap;">';
        html += '<span style="font-size:11px;color:var(--gray-light);background:var(--bg);padding:4px 12px;border-radius:12px;">💾 ' + totalBackups + ' backups · ' + espacioTotal + ' KB</span>';
        html += '<span style="font-size:11px;color:var(--gray-light);background:var(--bg);padding:4px 12px;border-radius:12px;">' + (this._accessToken ? '🟢 Google Drive Conectado' : '⚪ Google Drive Desconectado') + '</span>';
        html += '<span style="font-size:11px;color:var(--gray-light);background:var(--bg);padding:4px 12px;border-radius:12px;">🌊 ' + totalElipses + ' elipses · ' + totalInterferencias + ' interferencias</span>';
        html += '<span style="font-size:11px;color:var(--gray-light);background:var(--bg);padding:4px 12px;border-radius:12px;">🌌 ' + totalOndasElipse + ' ondas</span>';
        html += '</div></div>';

        html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;width:100%;box-sizing:border-box;">';

        html += '<div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--primary);transition:all 0.3s;display:flex;flex-direction:column;">';
        html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">';
        html += '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;"><i class="fas fa-database"></i></div>';
        html += '<div><h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">📦 Backup Local</h3><span style="font-size:11px;color:var(--gray-light);">Almacenamiento en IndexedDB</span></div></div>';
        html += '<p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">Guarda tus datos en el dispositivo. Los backups se almacenan en IndexedDB para soportar grandes volúmenes.<br><span style="font-size:10px;color:var(--gray-light);">🌊 Incluye Ondas Cruzadas · 🌌 Incluye Elipse</span><br><span style="font-size:10px;color:var(--success);">✅ Sin límite de tamaño (IndexedDB)</span></p>';
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">';
        html += '<button class="btn-primary" onclick="window.UIBackup._generarBackupLocal()" style="padding:6px 16px;font-size:12px;cursor:pointer;"><i class="fas fa-save"></i> Generar</button>';
        html += '<button class="btn-secondary" onclick="window.UIBackup._restaurarBackupLocal()" style="padding:6px 16px;font-size:12px;cursor:pointer;"><i class="fas fa-undo"></i> Restaurar</button>';
        html += '<span style="font-size:10px;color:var(--gray-light);display:flex;align-items:center;">💾 ' + totalBackups + ' backups</span>';
        html += '</div></div>';

        html += '<div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--success);transition:all 0.3s;display:flex;flex-direction:column;cursor:pointer;" onclick="window.UIBackup._abrirBackupEmail()" onmouseover="this.style.transform=translateY(-4px);this.style.boxShadow=0 8px 30px rgba(0,0,0,0.12)" onmouseout="this.style.transform=none;this.style.boxShadow=var(--shadow)">';
        html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">';
        html += '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#00B894,#55EFC4);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;"><i class="fas fa-envelope"></i></div>';
        html += '<div><h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">📧 Backup por Correo</h3><span style="font-size:11px;color:var(--gray-light);">⭐ Recomendado para WebView</span></div></div>';
        html += '<p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">Envía tu backup a tu correo electrónico. La mejor opción para móviles y WebView.<br><span style="font-size:10px;color:var(--gray-light);">🌊 Incluye todos los datos del sistema</span></p>';
        html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">';
        html += '<span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📧 Funciona en WebView</span>';
        html += '<span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">🔒 Seguro</span></div>';
        html += '<div style="margin-top:8px;font-size:10px;color:var(--success);font-weight:600;">🖱️ Haz clic para abrir</div></div>';

        html += '<div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid ' + (this._accessToken ? 'var(--success)' : 'var(--warning)') + ';transition:all 0.3s;display:flex;flex-direction:column;">';
        html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">';
        html += '<div style="width:44px;height:44px;border-radius:12px;background:' + (this._accessToken ? 'linear-gradient(135deg,#00B894,#55EFC4)' : 'linear-gradient(135deg,#FDCB6E,#F9CA24)') + ';display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;"><i class="fab fa-google-drive"></i></div>';
        html += '<div><h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">☁️ Google Drive</h3><span style="font-size:11px;color:var(--gray-light);">' + (this._accessToken ? '✅ Conectado' : '🔴 Desconectado') + '</span></div></div>';
        html += '<p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">Guarda tus backups en la nube de Google. Accesible desde cualquier dispositivo.</p>';
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">';
        if (!this._accessToken) {
            html += '<button class="btn-primary" onclick="window.UIBackup._conectarGoogleDrive()" style="padding:6px 16px;font-size:12px;background:linear-gradient(135deg,#4285F4,#34A853);cursor:pointer;"><i class="fab fa-google"></i> Conectar</button>';
            html += '<span style="font-size:9px;color:var(--gray-light);">⚠️ Requiere credenciales</span>';
        } else {
            html += '<button class="btn-primary" onclick="window.UIBackup._backupGoogleDrive()" style="padding:6px 16px;font-size:12px;cursor:pointer;"><i class="fas fa-cloud-upload-alt"></i> Subir</button>';
            html += '<button class="btn-secondary" onclick="window.UIBackup._restaurarGoogleDrive()" style="padding:6px 16px;font-size:12px;cursor:pointer;"><i class="fas fa-cloud-download-alt"></i> Restaurar</button>';
        }
        html += '<span style="font-size:10px;color:' + (this._accessToken ? 'var(--success)' : 'var(--gray-light)') + ';display:flex;align-items:center;">' + (this._accessToken ? '🔗 Conectado' : '🔴 No conectado') + '</span>';
        html += '</div></div>';

        html += '<div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--secondary);transition:all 0.3s;display:flex;flex-direction:column;cursor:pointer;" onclick="window.UIBackup._generarQR()" onmouseover="this.style.transform=translateY(-4px);this.style.boxShadow=0 8px 30px rgba(0,0,0,0.12)" onmouseout="this.style.transform=none;this.style.boxShadow=var(--shadow)">';
        html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">';
        html += '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#00CEC9,#81ECEC);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;"><i class="fas fa-qrcode"></i></div>';
        html += '<div><h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">📱 Código QR</h3><span style="font-size:11px;color:var(--gray-light);">Transferencia rápida</span></div></div>';
        html += '<p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">Genera un código QR con tu backup para transferirlo a otro dispositivo.</p>';
        html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">';
        html += '<span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📱 Sin internet</span>';
        html += '<span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">⚡ Rápido</span></div>';
        html += '<div style="margin-top:8px;font-size:10px;color:var(--secondary);font-weight:600;">🖱️ Haz clic para generar</div></div>';

        html += '<div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--warning);transition:all 0.3s;display:flex;flex-direction:column;">';
        html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">';
        html += '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#FDCB6E,#F9CA24);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;"><i class="fas fa-file-alt"></i></div>';
        html += '<div><h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">📄 Backup Texto</h3><span style="font-size:11px;color:var(--gray-light);">Copy/Paste</span></div></div>';
        html += '<p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">Copia tu backup como texto para pegarlo en otra aplicación o dispositivo.<br><span style="font-size:10px;color:var(--gray-light);">🌊 Incluye todos los datos en formato JSON</span></p>';
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">';
        html += '<button class="btn-primary" onclick="window.UIBackup._abrirBackupTexto()" style="padding:6px 16px;font-size:12px;cursor:pointer;"><i class="fas fa-file-export"></i> Exportar Texto</button>';
        html += '<button class="btn-secondary" onclick="window.UIBackup._restaurarBackupTexto()" style="padding:6px 16px;font-size:12px;cursor:pointer;background:var(--success);color:white;border:none;border-radius:6px;"><i class="fas fa-file-import"></i> Restaurar desde Texto</button>';
        html += '<span style="font-size:10px;color:var(--gray-light);display:flex;align-items:center;">📋 Universal</span>';
        html += '</div></div>';

        html += '<div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--info);transition:all 0.3s;display:flex;flex-direction:column;">';
        html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">';
        html += '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#74B9FF,#0984E3);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;"><i class="fas fa-robot"></i></div>';
        html += '<div><h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">🤖 Backup Automático</h3><span style="font-size:11px;color:var(--gray-light);">Configurable</span></div></div>';
        html += '<p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">Configura backups automáticos para no perder tu progreso.<br><span style="font-size:10px;color:var(--gray-light);">🌊 Incluye Ondas Cruzadas automáticamente</span></p>';
        html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">';
        html += '<button class="btn-primary" onclick="window.UIBackup._configurarBackupAutomatico()" style="padding:6px 16px;font-size:12px;cursor:pointer;"><i class="fas fa-cog"></i> Configurar</button>';
        html += '<span style="font-size:10px;color:var(--gray-light);display:flex;align-items:center;">' + (this._autoBackupConfig.activo ? '✅ Activado' : '⏸️ Desactivado') + '</span></div>';
        html += '<div style="margin-top:4px;font-size:9px;color:var(--gray-light);">';
        if (this._autoBackupConfig.activo) {
            html += '📅 ' + this._autoBackupConfig.frecuencia;
        }
        if (this._autoBackupConfig.ultimoBackup) {
            html += ' · Último: ' + new Date(this._autoBackupConfig.ultimoBackup).toLocaleString();
        }
        html += '</div></div>';

        html += '<div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--danger);transition:all 0.3s;display:flex;flex-direction:column;cursor:pointer;" onclick="window.UIBackup._abrirGestorBackups()" onmouseover="this.style.transform=translateY(-4px);this.style.boxShadow=0 8px 30px rgba(0,0,0,0.12)" onmouseout="this.style.transform=none;this.style.boxShadow=var(--shadow)">';
        html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">';
        html += '<div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#FF7675,#FD79A8);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;"><i class="fas fa-trash-alt"></i></div>';
        html += '<div><h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">🗑️ Gestionar Backups</h3><span style="font-size:11px;color:var(--gray-light);">' + totalBackups + ' backups · ' + espacioTotal + ' KB</span></div></div>';
        html += '<p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">Ver, eliminar y gestionar tus backups antiguos para liberar espacio.</p>';
        html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">';
        html += '<span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📋 Listar</span>';
        html += '<span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">🗑️ Eliminar</span>';
        html += '<span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">⚙️ Límite</span></div>';
        html += '<div style="margin-top:8px;font-size:10px;color:var(--danger);font-weight:600;">🖱️ Haz clic para gestionar</div></div>';

        html += '</div>';

        html += '<div style="display:flex;flex-wrap:wrap;gap:12px;padding:6px 14px;margin-top:16px;background:var(--bg);border-radius:8px;border:1px solid var(--light);font-size:10px;color:var(--gray-light);justify-content:space-between;align-items:center;width:100%;box-sizing:border-box;">';
        html += '<div style="display:flex;gap:12px;flex-wrap:wrap;">';
        html += '<span>💾 Backups: ' + totalBackups + '</span>';
        html += '<span>📊 Espacio: ' + espacioTotal + ' KB</span>';
        html += '<span>📅 Último backup: ' + (localStorage.getItem('pipeline_ultimo_backup') || 'Nunca') + '</span>';
        html += '<span>' + (this._accessToken ? '🔗 Google Drive: Conectado' : '🔗 Google Drive: Desconectado') + '</span>';
        html += '<span>📌 Límite: ' + this._MAX_BACKUPS + '</span>';
        html += '<span>🌊 Elipses: ' + totalElipses + '</span>';
        html += '<span>🌊 Interferencias: ' + totalInterferencias + '</span>';
        html += '<span>🌊 Ondas cruzadas: ' + totalOndasCruzadas + '</span>';
        html += '<span>🌌 Ondas Elipse: ' + totalOndasElipse + '</span>';
        html += '<span style="color:var(--success);">💾 Almacenamiento: IndexedDB</span>';
        html += '</div><div><span>⚙️ Backup v3.3</span></div></div>';

        html += '</div>';

        this._container.innerHTML = html;
    }

    // ============================================================
    // OBTENER LISTA DE BACKUPS CON CACHE
    // ============================================================

    async _contarBackupsLocales() {
        try {
            const backups = await db.getAll('backups');
            return backups.length;
        } catch (e) {
            console.warn('⚠️ Error contando backups:', e);
            return 0;
        }
    }

    async _obtenerListaBackups() {
        const ahora = Date.now();
        if (this._cacheBackups && (ahora - this._ultimaActualizacionCache < this._tiempoCacheBackups)) {
            return this._cacheBackups;
        }

        try {
            const backups = await db.getAll('backups');
            backups.sort((a, b) => {
                const fechaA = new Date(a.fecha).getTime();
                const fechaB = new Date(b.fecha).getTime();
                return fechaB - fechaA;
            });

            const resultado = backups.map((b, i) => ({
                ...b,
                index: i,
                fechaLegible: new Date(b.fecha).toLocaleString(),
                tamanoKB: Math.round((b.tamano || 0) / 1024),
                esAutomatico: b.automatico || false,
                tieneOndasCruzadas: !!(b.ondasCruzadas),
                tieneElipse: !!(b.elipse),
                totalOndasCruzadas: b._metadata?.totalOndasCruzadas || 0,
                totalElipses: b._metadata?.totalElipses || 0,
                totalOndasElipse: b._metadata?.totalOndasElipse || 0,
                totalFavoritos: b._metadata?.totalFavoritos || 0
            }));

            this._cacheBackups = resultado;
            this._ultimaActualizacionCache = ahora;
            return resultado;
        } catch (e) {
            console.warn('⚠️ Error obteniendo lista de backups:', e);
            return [];
        }
    }

    // ============================================================
    // GENERAR BACKUP LOCAL
    // ============================================================

    async _generarBackupLocal(esAutomatico) {
        if (!esAutomatico) {
            this._core.mostrarToast('📦 Generando backup local...', 'info');
        }

        try {
            const data = await db.exportarBackup();
            const usuario = await db.getUsuario();
            
            let ondasCruzadasData = null;
            if (window.modoOndasCruzadas) {
                try {
                    const estado = window.modoOndasCruzadas.getEstado();
                    ondasCruzadasData = {
                        grafoElipse: window.modoOndasCruzadas._grafoElipse || {},
                        recuerdoGlobal: {
                            personajes: Array.from(window.modoOndasCruzadas._recuerdoGlobal.personajes || new Set()),
                            lugares: Array.from(window.modoOndasCruzadas._recuerdoGlobal.lugares || new Set()),
                            eventosClave: window.modoOndasCruzadas._recuerdoGlobal.eventosClave || [],
                            vocabularioAcumulado: Array.from(window.modoOndasCruzadas._recuerdoGlobal.vocabularioAcumulado?.entries() || []),
                            resumenGlobal: window.modoOndasCruzadas._recuerdoGlobal.resumenGlobal || '',
                            ultimaActualizacion: window.modoOndasCruzadas._recuerdoGlobal.ultimaActualizacion || Date.now()
                        },
                        mapaInterferencias: window.modoOndasCruzadas._mapaInterferencias || {},
                        config: window.modoOndasCruzadas._config || {},
                        estadisticas: estado || {},
                        timestamp: Date.now()
                    };
                } catch (e) {
                    console.warn('⚠️ Error capturando datos de Ondas Cruzadas:', e);
                }
            }
            
            let elipseData = null;
            if (window.modoElipse) {
                try {
                    elipseData = window.modoElipse.getEstadoCompleto();
                } catch (e) {
                    console.warn('⚠️ Error capturando datos de Elipse:', e);
                }
            }

            let favoritosData = null;
            if (window.gestorFavoritos) {
                try {
                    favoritosData = {
                        frases: window.gestorFavoritos._favoritos?.frases || [],
                        palabras: window.gestorFavoritos._favoritos?.palabras || [],
                        grupos: window.gestorFavoritos._grupos || {}
                    };
                } catch (e) {
                    console.warn('⚠️ Error capturando datos de favoritos:', e);
                }
            }

            let tutorData = null;
            if (window.tutorNeuro) {
                try {
                    tutorData = {
                        modo: window.tutorNeuro.getModo(),
                        configuracion: window.tutorNeuro._configuracion || {},
                        historialIntervenciones: window.tutorNeuro._historialIntervenciones?.slice(-50) || []
                    };
                } catch (e) {
                    console.warn('⚠️ Error capturando datos de Tutor Neuro:', e);
                }
            }

            let learningPathData = null;
            if (window.LearningPath) {
                try {
                    learningPathData = {
                        ruta: window.LearningPath.getRutaCompleta(),
                        pasoActual: window.LearningPath.getPasoActual(),
                        progreso: window.LearningPath.getProgreso()
                    };
                } catch (e) {
                    console.warn('⚠️ Error capturando datos de Learning Path:', e);
                }
            }

            const backup = {
                id: Date.now(),
                fecha: new Date().toISOString(),
                data: data,
                usuario: usuario,
                idiomaActivo: gestorIdiomas?.getIdiomaActivo() || 'es',
                version: '3.3',
                tamano: JSON.stringify(data).length,
                automatico: esAutomatico || false,
                ondasCruzadas: ondasCruzadasData,
                elipse: elipseData,
                favoritos: favoritosData,
                tutorNeuro: tutorData,
                learningPath: learningPathData,
                _metadata: {
                    totalOndasCruzadas: ondasCruzadasData ? 
                        Object.values(ondasCruzadasData.grafoElipse).reduce((acc, el) => acc + (el.totalOndas || 0), 0) : 0,
                    totalElipses: ondasCruzadasData ? Object.keys(ondasCruzadasData.grafoElipse).length : 0,
                    totalOndasElipse: elipseData?.historias?.length || 0,
                    totalFavoritos: (favoritosData?.frases?.length || 0) + (favoritosData?.palabras?.length || 0),
                    modoTutor: tutorData?.modo || 'flexible'
                }
            };

            let guardadoExitoso = false;
            let intentos = 0;
            const maxIntentos = 3;

            while (!guardadoExitoso && intentos < maxIntentos) {
                try {
                    intentos++;
                    await db.add('backups', backup);
                    guardadoExitoso = true;
                } catch (e) {
                    console.warn('⚠️ Intento ' + intentos + ' falló al guardar en IndexedDB:', e.message);
                    if (intentos < maxIntentos) {
                        await new Promise(r => setTimeout(r, 500 * intentos));
                    }
                }
            }

            if (guardadoExitoso) {
                try {
                    const todosLosBackups = await db.getAll('backups');
                    todosLosBackups.sort((a, b) => b.id - a.id);

                    const maxBackups = esAutomatico ? this._MAX_BACKUPS : this._MAX_BACKUPS;
                    const backupsAEliminar = todosLosBackups.slice(maxBackups);

                    let eliminados = 0;
                    for (const backupViejo of backupsAEliminar) {
                        await db.delete('backups', backupViejo.id);
                        eliminados++;
                    }
                    if (eliminados > 0) {
                        console.log('🗑️ ' + eliminados + ' backup(s) antiguo(s) eliminado(s) de IndexedDB.');
                    }
                } catch (e) {
                    console.warn('⚠️ Error al limpiar backups antiguos de IndexedDB:', e);
                }

                localStorage.setItem('pipeline_ultimo_backup', new Date().toLocaleString());
                if (esAutomatico) {
                    this._autoBackupConfig.ultimoBackup = Date.now();
                    await this._guardarConfiguracionAutoBackup();
                }

                this._cacheBackups = null;

                if (!esAutomatico) {
                    var msg = '✅ Backup guardado en IndexedDB';
                    if (backup._metadata.totalOndasCruzadas > 0) {
                        msg += ' · 🌊 ' + backup._metadata.totalOndasCruzadas + ' ondas cruzadas';
                    }
                    if (backup._metadata.totalOndasElipse > 0) {
                        msg += ' · 🌌 ' + backup._metadata.totalOndasElipse + ' ondas elipse';
                    }
                    this._core.mostrarToast(msg, 'success');
                    this._renderizarPanel();
                } else {
                    console.log('💾 Backup automático guardado en IndexedDB');
                    console.log('   🌊 ' + backup._metadata.totalOndasCruzadas + ' ondas cruzadas');
                    console.log('   🌌 ' + backup._metadata.totalOndasElipse + ' ondas elipse');
                }

                try {
                    const localBackups = localStorage.getItem('pipeline_backups_locales');
                    if (localBackups) {
                        localStorage.removeItem('pipeline_backups_locales');
                        console.log('🧹 Backups antiguos de localStorage eliminados');
                    }
                } catch (e) {}

                return true;
            } else {
                throw new Error('No se pudo guardar el backup en IndexedDB después de varios intentos.');
            }

        } catch (error) {
            console.error('❌ Error generando backup local:', error);
            if (!esAutomatico) {
                this._core.mostrarToast('❌ Error: ' + error.message, 'error');
            }
            return false;
        }
    }

    // ============================================================
    // RESTAURAR BACKUP LOCAL
    // ============================================================

    async _restaurarBackupLocal() {
        const backups = await this._obtenerListaBackups();

        if (backups.length === 0) {
            this._core.mostrarToast('❌ No hay backups locales disponibles', 'error');
            return;
        }

        var mensaje = '📦 Selecciona un backup para restaurar:\n\n';
        backups.forEach((b, i) => {
            const auto = b.esAutomatico ? ' (automático)' : '';
            const oc = b.tieneOndasCruzadas ? ' 🌊' : '';
            const oe = b.tieneElipse ? ' 🌌' : '';
            const ondasInfo = b.totalOndasCruzadas > 0 ? ' (' + b.totalOndasCruzadas + ' ondas cruzadas)' : '';
            const elipseInfo = b.totalOndasElipse > 0 ? ' (' + b.totalOndasElipse + ' ondas elipse)' : '';
            mensaje += (i + 1) + '. ' + b.fechaLegible + ' (' + b.tamanoKB + ' KB)' + auto + oc + oe + ondasInfo + elipseInfo + '\n';
        });

        const seleccion = await this._core.prompt(mensaje, '1', 'Número del backup...', '📦 Restaurar Backup');
        if (!seleccion) return;

        const idx = parseInt(seleccion) - 1;
        if (isNaN(idx) || idx < 0 || idx >= backups.length) {
            this._core.mostrarToast('❌ Selección inválida', 'error');
            return;
        }

        const backup = backups[idx];
        
        var infoDetalle = '📋 **Detalle del backup:**\n\n';
        infoDetalle += '📅 Fecha: ' + backup.fechaLegible + '\n';
        infoDetalle += '📊 Tamaño: ' + backup.tamanoKB + ' KB\n';
        infoDetalle += (backup.esAutomatico ? '🤖 Automático' : '👤 Manual') + '\n\n';
        infoDetalle += '📦 Contenido:\n';
        infoDetalle += '• ' + (backup.data?.frases?.length || 0) + ' frases\n';
        infoDetalle += '• ' + (backup.data?.palabras?.length || 0) + ' palabras\n';
        infoDetalle += '• ' + (backup.data?.historias?.length || 0) + ' historias\n';
        infoDetalle += '• ' + (backup.data?.temas?.length || 0) + ' temas\n';
        if (backup.tieneOndasCruzadas) {
            infoDetalle += '🌊 • ' + backup.totalOndasCruzadas + ' ondas cruzadas\n';
            infoDetalle += '🌊 • ' + backup.totalElipses + ' elipses conectadas\n';
        }
        if (backup.tieneElipse) {
            infoDetalle += '🌌 • ' + backup.totalOndasElipse + ' ondas elipse\n';
        }
        if (backup.favoritos) {
            infoDetalle += '⭐ • ' + (backup.totalFavoritos || 0) + ' favoritos\n';
        }
        infoDetalle += '🧠 • Modo Tutor: ' + (backup._metadata?.modoTutor || 'flexible') + '\n';

        const confirmar = await this._core.confirm(
            '⚠️ ¿Restaurar este backup?\n\n' + infoDetalle + '\n\n' +
            'Esto SOBRESCRIBIRÁ todos tus datos actuales.\n' +
            'Los datos de Ondas Cruzadas y Elipse también serán restaurados.\n\n' +
            '¿Continuar?',
            '⚠️ Restaurar Backup'
        );

        if (!confirmar) return;

        try {
            this._core.mostrarToast('🔄 Restaurando backup...', 'info');

            await db.importarBackup(backup.data);

            if (backup.usuario) {
                await db.guardarUsuario(backup.usuario);
            }

            if (backup.idiomaActivo) {
                localStorage.setItem('pipeline_idioma_activo', backup.idiomaActivo);
                if (window.gestorIdiomas) {
                    await window.gestorIdiomas.cambiarIdioma(backup.idiomaActivo);
                }
            }

            if (backup.ondasCruzadas && window.modoOndasCruzadas) {
                try {
                    if (backup.ondasCruzadas.grafoElipse) {
                        window.modoOndasCruzadas._grafoElipse = backup.ondasCruzadas.grafoElipse;
                    }
                    if (backup.ondasCruzadas.recuerdoGlobal) {
                        window.modoOndasCruzadas._recuerdoGlobal = {
                            personajes: new Set(backup.ondasCruzadas.recuerdoGlobal.personajes || []),
                            lugares: new Set(backup.ondasCruzadas.recuerdoGlobal.lugares || []),
                            eventosClave: backup.ondasCruzadas.recuerdoGlobal.eventosClave || [],
                            vocabularioAcumulado: new Map(backup.ondasCruzadas.recuerdoGlobal.vocabularioAcumulado || []),
                            resumenGlobal: backup.ondasCruzadas.recuerdoGlobal.resumenGlobal || '',
                            ultimaActualizacion: backup.ondasCruzadas.recuerdoGlobal.ultimaActualizacion || Date.now()
                        };
                    }
                    if (backup.ondasCruzadas.mapaInterferencias) {
                        window.modoOndasCruzadas._mapaInterferencias = backup.ondasCruzadas.mapaInterferencias;
                    }
                    if (backup.ondasCruzadas.config) {
                        window.modoOndasCruzadas._config = { 
                            ...window.modoOndasCruzadas._config, 
                            ...backup.ondasCruzadas.config 
                        };
                    }
                    await window.modoOndasCruzadas._guardarDatos();
                } catch (e) {
                    console.warn('⚠️ Error restaurando Ondas Cruzadas:', e);
                }
            }

            if (backup.elipse && window.modoElipse) {
                try {
                    if (backup.elipse.historias) {
                        window.modoElipse._historiasElipse = backup.elipse.historias;
                    }
                    if (backup.elipse.elipseActiva) {
                        window.modoElipse._elipseActiva = backup.elipse.elipseActiva;
                        localStorage.setItem('pipeline_elipse_tema_activo', backup.elipse.elipseActiva);
                    }
                    if (backup.elipse.estadisticas) {
                        window.modoElipse._estadisticas = backup.elipse.estadisticas;
                    }
                    if (backup.elipse.config) {
                        window.modoElipse._config = { ...window.modoElipse._config, ...backup.elipse.config };
                    }
                    if (backup.elipse.recuerdoOndas) {
                        window.modoElipse._recuerdoOndas = backup.elipse.recuerdoOndas;
                    }
                    await window.modoElipse._guardarEstadoElipse();
                    await window.modoElipse._guardarEnIndexedDB();
                } catch (e) {
                    console.warn('⚠️ Error restaurando Elipse:', e);
                }
            }

            if (backup.favoritos && window.gestorFavoritos) {
                try {
                    window.gestorFavoritos._favoritos = {
                        frases: backup.favoritos.frases || [],
                        palabras: backup.favoritos.palabras || []
                    };
                    window.gestorFavoritos._grupos = backup.favoritos.grupos || {};
                    await window.gestorFavoritos.guardarFavoritos();
                    await window.gestorFavoritos._guardarGrupos();
                } catch (e) {
                    console.warn('⚠️ Error restaurando favoritos:', e);
                }
            }

            if (backup.tutorNeuro && window.tutorNeuro) {
                try {
                    if (backup.tutorNeuro.modo) {
                        window.tutorNeuro.setModo(backup.tutorNeuro.modo);
                    }
                    if (backup.tutorNeuro.configuracion) {
                        window.tutorNeuro._configuracion = { 
                            ...window.tutorNeuro._configuracion, 
                            ...backup.tutorNeuro.configuracion 
                        };
                    }
                } catch (e) {
                    console.warn('⚠️ Error restaurando Tutor Neuro:', e);
                }
            }

            if (backup.learningPath && window.LearningPath) {
                try {
                    if (backup.learningPath.ruta) {
                        window.LearningPath._rutaActual = backup.learningPath.ruta;
                    }
                    if (backup.learningPath.pasoActual !== undefined) {
                        window.LearningPath._pasoActual = backup.learningPath.pasoActual;
                    }
                } catch (e) {
                    console.warn('⚠️ Error restaurando Learning Path:', e);
                }
            }

            this._cacheBackups = null;

            var msg = '✅ Backup restaurado correctamente\n';
            if (backup._metadata?.totalOndasCruzadas > 0) {
                msg += '🌊 ' + backup._metadata.totalOndasCruzadas + ' ondas cruzadas restauradas\n';
            }
            if (backup._metadata?.totalOndasElipse > 0) {
                msg += '🌌 ' + backup._metadata.totalOndasElipse + ' ondas elipse restauradas\n';
            }
            if (backup._metadata?.totalFavoritos > 0) {
                msg += '⭐ ' + backup._metadata.totalFavoritos + ' favoritos restaurados';
            }
            this._core.mostrarToast(msg, 'success');
            
            setTimeout(() => {
                location.reload();
            }, 2000);

        } catch (error) {
            console.error('❌ Error restaurando backup:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // ABRIR BACKUP POR CORREO
    // ============================================================

    async _abrirBackupEmail() {
        try {
            this._core.mostrarToast('📧 Preparando backup para correo...', 'info');

            const data = await db.exportarBackup();
            const usuario = await db.getUsuario();
            
            let ondasCruzadasData = null;
            if (window.modoOndasCruzadas) {
                try {
                    ondasCruzadasData = {
                        grafoElipse: window.modoOndasCruzadas._grafoElipse || {},
                        recuerdoGlobal: {
                            personajes: Array.from(window.modoOndasCruzadas._recuerdoGlobal.personajes || new Set()),
                            lugares: Array.from(window.modoOndasCruzadas._recuerdoGlobal.lugares || new Set()),
                            eventosClave: window.modoOndasCruzadas._recuerdoGlobal.eventosClave || [],
                            vocabularioAcumulado: Array.from(window.modoOndasCruzadas._recuerdoGlobal.vocabularioAcumulado?.entries() || []),
                            resumenGlobal: window.modoOndasCruzadas._recuerdoGlobal.resumenGlobal || '',
                            ultimaActualizacion: window.modoOndasCruzadas._recuerdoGlobal.ultimaActualizacion || Date.now()
                        },
                        mapaInterferencias: window.modoOndasCruzadas._mapaInterferencias || {},
                        config: window.modoOndasCruzadas._config || {}
                    };
                } catch (e) {
                    console.warn('⚠️ Error capturando datos de Ondas Cruzadas:', e);
                }
            }
            
            let elipseData = null;
            if (window.modoElipse) {
                try {
                    elipseData = window.modoElipse.getEstadoCompleto();
                } catch (e) {
                    console.warn('⚠️ Error capturando datos de Elipse:', e);
                }
            }

            const backup = {
                fecha: new Date().toISOString(),
                data: data,
                usuario: usuario,
                idiomaActivo: gestorIdiomas?.getIdiomaActivo() || 'es',
                version: '3.3',
                ondasCruzadas: ondasCruzadasData,
                elipse: elipseData
            };

            await this._abrirBackupEmailConDatos(backup);

        } catch (error) {
            console.error('❌ Error preparando backup por correo:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _abrirBackupEmailConDatos(backup) {
        const jsonStr = JSON.stringify(backup, null, 2);
        const nombreUsuario = backup.usuario?.nombre || 'Usuario';
        const fecha = new Date(backup.fecha).toLocaleString();
        
        let ondasCruzadasStats = '';
        if (backup.ondasCruzadas?.grafoElipse) {
            const elipses = Object.keys(backup.ondasCruzadas.grafoElipse);
            const totalOndas = Object.values(backup.ondasCruzadas.grafoElipse).reduce((acc, el) => acc + (el.totalOndas || 0), 0);
            ondasCruzadasStats = '\n🌊 Ondas Cruzadas:\n   - ' + elipses.length + ' elipses conectadas\n   - ' + totalOndas + ' ondas cruzadas\n   - ' + Object.keys(backup.ondasCruzadas.mapaInterferencias || {}).length + ' interferencias\n';
        }
        
        let elipseStats = '';
        if (backup.elipse?.historias) {
            elipseStats = '\n🌌 Modo Elipse:\n   - ' + backup.elipse.historias.length + ' ondas generadas\n   - ' + backup.elipse.historias.filter(h => h.completada).length + ' ondas completadas\n   - ' + (backup.elipse.estadisticas?.palabrasNuevas || 0) + ' palabras nuevas\n';
        }

        const subject = encodeURIComponent('📚 Pipeline Neuro - Backup Completo ' + fecha);
        const body = encodeURIComponent(
            'Hola ' + nombreUsuario + ',\n\n' +
            'Aquí tienes tu backup COMPLETO de Pipeline Neuro del ' + fecha + '.\n\n' +
            '📊 RESÚMEN DEL BACKUP:\n' +
            '- Frases: ' + (backup.data.frases?.length || 0) + '\n' +
            '- Palabras: ' + (backup.data.palabras?.length || 0) + '\n' +
            '- Historias: ' + (backup.data.historias?.length || 0) + '\n' +
            '- Temas: ' + (backup.data.temas?.length || 0) + '\n' +
            '- Progreso: ' + (backup.data.progreso?.length || 0) + '\n' +
            ondasCruzadasStats +
            elipseStats +
            '\n📎 DATOS COMPLETOS DEL BACKUP (incluye Ondas Cruzadas y Elipse):\n\n' +
            jsonStr + '\n\n' +
            '📌 INSTRUCCIONES PARA RESTAURAR:\n' +
            '1. Abre Pipeline Neuro\n' +
            '2. Ve a Herramientas > Backup\n' +
            '3. Usa "Restaurar desde Texto" y pega TODO el texto del backup\n' +
            '4. ¡Todos tus datos (incluyendo Ondas Cruzadas) serán restaurados!\n\n' +
            '🌊 Este backup incluye TODAS las ondas cruzadas y elipses generadas.\n' +
            '🌌 Incluye el estado completo del Modo Elipse.\n\n' +
            '¡Mantén tus datos seguros! 🧠\n\n' +
            '-- Pipeline Neuro v3.3'
        );

        const mailtoLink = 'mailto:?subject=' + subject + '&body=' + body;

        const opciones = [
            { id: 'abrir', label: '📧 Abrir correo', primary: true },
            { id: 'copiar', label: '📋 Copiar texto', primary: false },
            { id: 'cancelar', label: '❌ Cancelar', primary: false }
        ];

        var mensaje = 
            '📧 Backup COMPLETO para ' + nombreUsuario + '\n\n' +
            'El backup contiene:\n' +
            '• ' + (backup.data.frases?.length || 0) + ' frases\n' +
            '• ' + (backup.data.palabras?.length || 0) + ' palabras\n' +
            '• ' + (backup.data.historias?.length || 0) + ' historias\n' +
            '• ' + (backup.data.temas?.length || 0) + ' temas\n' +
            (backup.ondasCruzadas?.grafoElipse ? '• 🌊 ' + Object.keys(backup.ondasCruzadas.grafoElipse).length + ' elipses conectadas\n' : '') +
            (backup.elipse?.historias ? '• 🌌 ' + backup.elipse.historias.length + ' ondas elipse\n' : '') +
            '\nElige cómo quieres guardar tu backup:';

        const opcion = await this._mostrarOpcionesBackup(mensaje, opciones);

        if (opcion === 'cancelar' || !opcion) return;

        if (opcion === 'copiar') {
            this._mostrarBackupTextoCompleto(jsonStr, backup);
            return;
        }

        try {
            const result1 = await this._abrirCorreoConLocation(mailtoLink);
            
            if (!result1) {
                const result2 = await this._abrirCorreoConWindowOpen(mailtoLink);
                
                if (!result2) {
                    this._core.mostrarToast('⚠️ No se pudo abrir el correo. Copia el texto manualmente.', 'warning');
                    this._mostrarBackupTextoCompleto(jsonStr, backup);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error abriendo correo:', error);
            this._mostrarBackupTextoCompleto(jsonStr, backup);
        }
    }

    _abrirCorreoConLocation(mailtoLink) {
        return new Promise((resolve) => {
            try {
                const currentUrl = window.location.href;
                window.location.href = mailtoLink;
                
                setTimeout(() => {
                    if (window.location.href === currentUrl) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }, 1000);
            } catch (error) {
                resolve(false);
            }
        });
    }

    _abrirCorreoConWindowOpen(mailtoLink) {
        return new Promise((resolve) => {
            try {
                const mailWindow = window.open(mailtoLink, '_blank');
                if (mailWindow && !mailWindow.closed) {
                    setTimeout(() => {
                        try { mailWindow.close(); } catch (e) {}
                    }, 3000);
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                resolve(false);
            }
        });
    }

    _mostrarOpcionesBackup(mensaje, opciones) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(8px);
                z-index: 100001;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                animation: fadeIn 0.3s ease;
            `;

            var html = '';
            html += '<div style="background: var(--white, #ffffff); border-radius: 16px; padding: 28px 24px; max-width: 420px; width: 100%; box-shadow: 0 30px 80px rgba(0,0,0,0.4);">';
            html += '<div style="text-align: center; margin-bottom: 16px;">';
            html += '<span style="font-size: 48px;">📧</span>';
            html += '<h3 style="font-size: 18px; font-weight: 700; color: var(--dark); margin: 0 0 4px 0;">Backup por Correo</h3>';
            html += '<p style="font-size: 11px; color: var(--gray-light);">Incluye todos los datos del sistema (Ondas Cruzadas + Elipse)</p>';
            html += '</div>';
            html += '<div style="background: var(--bg); border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; font-size: 13px; color: var(--gray); white-space: pre-line; max-height: 200px; overflow-y: auto;">';
            html += mensaje;
            html += '</div>';
            html += '<div style="display: flex; flex-direction: column; gap: 8px;">';
            for (var o of opciones) {
                var style = '';
                if (o.primary) {
                    style = 'background: linear-gradient(135deg, #6C5CE7, #A29BFE); color: white;';
                } else if (o.id === 'cancelar') {
                    style = 'background: var(--light); color: var(--gray);';
                } else {
                    style = 'background: var(--bg); color: var(--dark); border: 2px solid var(--light);';
                }
                html += '<button class="backup-opcion-btn" data-value="' + o.id + '" style="padding: 12px 20px; font-size: 15px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s; font-family: var(--font, sans-serif); ' + style + '" onmouseover="this.style.transform=scale(1.02)" onmouseout="this.style.transform=none">';
                html += o.label;
                html += '</button>';
            }
            html += '</div>';
            html += '<div style="margin-top: 12px; font-size: 11px; color: var(--gray-light); text-align: center;">';
            html += '💡 Este backup incluye Ondas Cruzadas y Elipse. Es el backup más completo disponible.';
            html += '</div></div>';

            overlay.innerHTML = html;
            document.body.appendChild(overlay);

            overlay.querySelectorAll('.backup-opcion-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const value = btn.dataset.value;
                    overlay.remove();
                    resolve(value);
                });
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    resolve('cancelar');
                }
            });

            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', escapeHandler);
                    resolve('cancelar');
                }
            };
            document.addEventListener('keydown', escapeHandler);
            overlay._escapeHandler = escapeHandler;
        });
    }

    _mostrarBackupTextoCompleto(jsonStr, backup) {
        const nombreUsuario = backup.usuario?.nombre || 'Usuario';
        const fecha = new Date(backup.fecha).toLocaleString();

        var ondasStats = '';
        if (backup.ondasCruzadas?.grafoElipse) {
            const elipses = Object.keys(backup.ondasCruzadas.grafoElipse);
            const totalOndas = Object.values(backup.ondasCruzadas.grafoElipse).reduce((acc, el) => acc + (el.totalOndas || 0), 0);
            ondasStats = '🌊 ' + elipses.length + ' elipses · ' + totalOndas + ' ondas cruzadas';
        }
        var elipseStats = '';
        if (backup.elipse?.historias) {
            elipseStats = '🌌 ' + backup.elipse.historias.length + ' ondas elipse';
        }

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(8px);
            z-index: 100000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        `;

        var html = '';
        html += '<div style="background: var(--white, #ffffff); border-radius: 16px; padding: 24px; max-width: 800px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 30px 80px rgba(0,0,0,0.4);">';
        html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0;">';
        html += '<div>';
        html += '<h3 style="font-size: 18px; font-weight: 700; color: var(--dark); margin: 0;">📋 Backup Completo</h3>';
        html += '<p style="font-size: 12px; color: var(--gray); margin: 2px 0 0;">';
        html += nombreUsuario + ' · ' + fecha + ' · ' + (backup.data.frases?.length || 0) + ' frases';
        if (ondasStats) html += ' · ' + ondasStats;
        if (elipseStats) html += ' · ' + elipseStats;
        html += '</p></div>';
        html += '<button onclick="this.closest(\'div[style]\').remove()" style="background: none; border: none; font-size: 28px; color: var(--gray); cursor: pointer; transition: all 0.3s; padding: 0 8px;" onmouseover="this.style.color=var(--danger)" onmouseout="this.style.color=var(--gray)">&times;</button>';
        html += '</div>';
        html += '<div style="flex: 1; overflow-y: auto; margin-bottom: 12px;">';
        html += '<div style="background: var(--bg); border-radius: 8px; padding: 12px; border: 1px solid var(--light);">';
        html += '<div style="font-size: 11px; color: var(--gray-light); margin-bottom: 6px;">📋 COPIA TODO ESTE TEXTO</div>';
        html += '<textarea id="backupTextoCompleto" rows="15" style="width: 100%; padding: 10px; border: 1px solid var(--light); border-radius: 6px; font-size: 12px; font-family: monospace; resize: vertical; background: var(--white); color: var(--dark); line-height: 1.4;" readonly>';
        html += jsonStr;
        html += '</textarea>';
        html += '</div></div>';
        html += '<div style="display: flex; gap: 10px; flex-wrap: wrap; flex-shrink: 0; border-top: 1px solid var(--light); padding-top: 12px;">';
        html += '<button onclick="window.UIBackup._copiarBackupTexto()" class="btn-primary" style="padding: 10px 24px; font-size: 14px; font-weight: 600; background: linear-gradient(135deg, #6C5CE7, #A29BFE); color: white; border: none; border-radius: 8px; cursor: pointer; flex: 1;"><i class="fas fa-copy"></i> Copiar Todo</button>';
        html += '<button onclick="this.closest(\'div[style]\').remove()" class="btn-secondary" style="padding: 10px 24px; font-size: 14px; font-weight: 600; background: var(--light); color: var(--dark); border: none; border-radius: 8px; cursor: pointer;">Cerrar</button>';
        html += '</div>';
        html += '<div style="margin-top: 8px; font-size: 11px; color: var(--gray-light); flex-shrink: 0;">';
        html += '💡 Copia este texto y guárdalo en un lugar seguro. Para restaurar, usa "Restaurar desde Texto" en Herramientas > Backup.';
        html += '<br>🌊 Incluye TODOS los datos: Ondas Cruzadas, Elipse, Favoritos, Tutor Neuro y Learning Path.';
        html += '</div></div>';

        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        const textarea = document.getElementById('backupTextoCompleto');
        if (textarea) {
            textarea.addEventListener('click', () => {
                textarea.select();
            });
        }

        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    }

    _copiarBackupTexto() {
        const textarea = document.getElementById('backupTextoCompleto');
        if (!textarea) return;

        navigator.clipboard.writeText(textarea.value)
            .then(() => {
                this._core.mostrarToast('📋 Backup copiado al portapapeles', 'success');
            })
            .catch(() => {
                textarea.select();
                document.execCommand('copy');
                this._core.mostrarToast('📋 Backup copiado al portapapeles', 'success');
            });
    }

    // ============================================================
    // ABRIR BACKUP TEXTO
    // ============================================================

    async _abrirBackupTexto() {
        try {
            this._core.mostrarToast('📄 Generando backup como texto...', 'info');

            const data = await db.exportarBackup();
            const usuario = await db.getUsuario();
            
            let ondasCruzadasData = null;
            if (window.modoOndasCruzadas) {
                try {
                    ondasCruzadasData = {
                        grafoElipse: window.modoOndasCruzadas._grafoElipse || {},
                        recuerdoGlobal: {
                            personajes: Array.from(window.modoOndasCruzadas._recuerdoGlobal.personajes || new Set()),
                            lugares: Array.from(window.modoOndasCruzadas._recuerdoGlobal.lugares || new Set()),
                            eventosClave: window.modoOndasCruzadas._recuerdoGlobal.eventosClave || [],
                            vocabularioAcumulado: Array.from(window.modoOndasCruzadas._recuerdoGlobal.vocabularioAcumulado?.entries() || []),
                            resumenGlobal: window.modoOndasCruzadas._recuerdoGlobal.resumenGlobal || '',
                            ultimaActualizacion: window.modoOndasCruzadas._recuerdoGlobal.ultimaActualizacion || Date.now()
                        },
                        mapaInterferencias: window.modoOndasCruzadas._mapaInterferencias || {},
                        config: window.modoOndasCruzadas._config || {}
                    };
                } catch (e) {
                    console.warn('⚠️ Error capturando datos de Ondas Cruzadas:', e);
                }
            }
            
            let elipseData = null;
            if (window.modoElipse) {
                try {
                    elipseData = window.modoElipse.getEstadoCompleto();
                } catch (e) {
                    console.warn('⚠️ Error capturando datos de Elipse:', e);
                }
            }

            const backup = {
                fecha: new Date().toISOString(),
                data: data,
                usuario: usuario,
                idiomaActivo: gestorIdiomas?.getIdiomaActivo() || 'es',
                version: '3.3',
                ondasCruzadas: ondasCruzadasData,
                elipse: elipseData
            };

            const jsonStr = JSON.stringify(backup, null, 2);
            this._mostrarBackupTextoCompleto(jsonStr, backup);

        } catch (error) {
            console.error('❌ Error generando backup texto:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // RESTAURAR BACKUP TEXTO
    // ============================================================

    async _restaurarBackupTexto() {
        try {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                backdrop-filter: blur(8px);
                z-index: 100000;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                animation: fadeIn 0.3s ease;
            `;

            var html = '';
            html += '<div style="background: var(--white, #ffffff); border-radius: 16px; padding: 24px; max-width: 700px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 30px 80px rgba(0,0,0,0.4);">';
            html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0;">';
            html += '<div>';
            html += '<h3 style="font-size: 18px; font-weight: 700; color: var(--dark); margin: 0;">📥 Restaurar desde Texto</h3>';
            html += '<p style="font-size: 12px; color: var(--gray); margin: 2px 0 0;">Pega el texto del backup completo (incluye Ondas Cruzadas y Elipse)</p>';
            html += '</div>';
            html += '<button onclick="this.closest(\'div[style]\').remove()" style="background: none; border: none; font-size: 28px; color: var(--gray); cursor: pointer; transition: all 0.3s; padding: 0 8px;" onmouseover="this.style.color=var(--danger)" onmouseout="this.style.color=var(--gray)">&times;</button>';
            html += '</div>';
            html += '<div style="flex: 1; overflow-y: auto; margin-bottom: 12px;">';
            html += '<div style="background: var(--bg); border-radius: 8px; padding: 12px; border: 1px solid var(--light);">';
            html += '<div style="font-size: 11px; color: var(--gray-light); margin-bottom: 6px;">📋 PEGA AQUÍ EL TEXTO DEL BACKUP</div>';
            html += '<textarea id="restaurarBackupTexto" rows="15" style="width: 100%; padding: 10px; border: 1px solid var(--light); border-radius: 6px; font-size: 12px; font-family: monospace; resize: vertical; background: var(--white); color: var(--dark); line-height: 1.4;" placeholder="Pega aquí el texto del backup que copiaste..."></textarea>';
            html += '</div></div>';
            html += '<div style="display: flex; gap: 10px; flex-wrap: wrap; flex-shrink: 0; border-top: 1px solid var(--light); padding-top: 12px;">';
            html += '<button onclick="window.UIBackup._procesarRestauracionTexto()" class="btn-primary" style="padding: 10px 24px; font-size: 14px; font-weight: 600; background: linear-gradient(135deg, #6C5CE7, #A29BFE); color: white; border: none; border-radius: 8px; cursor: pointer; flex: 1;"><i class="fas fa-upload"></i> Restaurar Backup</button>';
            html += '<button onclick="this.closest(\'div[style]\').remove()" class="btn-secondary" style="padding: 10px 24px; font-size: 14px; font-weight: 600; background: var(--light); color: var(--dark); border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>';
            html += '</div>';
            html += '<div id="restaurarBackupResultado" style="margin-top: 8px; display: none; padding: 12px; border-radius: 8px; font-size: 13px;"></div>';
            html += '<div style="margin-top: 8px; font-size: 10px; color: var(--gray-light); flex-shrink: 0;">';
            html += '⚠️ Este proceso restaurará TODOS los datos: Base de datos, Ondas Cruzadas, Elipse, Favoritos y configuraciones.';
            html += '</div></div>';

            overlay.innerHTML = html;
            document.body.appendChild(overlay);

            const textarea = document.getElementById('restaurarBackupTexto');
            if (textarea) {
                textarea.addEventListener('paste', () => {
                    setTimeout(() => {
                        const resultado = document.getElementById('restaurarBackupResultado');
                        if (resultado) {
                            resultado.style.display = 'none';
                        }
                    }, 100);
                });
            }

            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    document.removeEventListener('keydown', escapeHandler);
                }
            });

        } catch (error) {
            console.error('❌ Error abriendo restauración desde texto:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // PROCESAR RESTAURACIÓN TEXTO
    // ============================================================

    async _procesarRestauracionTexto() {
        const textarea = document.getElementById('restaurarBackupTexto');
        const resultadoDiv = document.getElementById('restaurarBackupResultado');

        if (!textarea) return;

        const texto = textarea.value.trim();

        if (!texto) {
            resultadoDiv.style.display = 'block';
            resultadoDiv.style.background = 'rgba(255,118,117,0.1)';
            resultadoDiv.style.border = '1px solid var(--danger)';
            resultadoDiv.innerHTML = '❌ No hay texto para restaurar. Pega el backup primero.';
            return;
        }

        try {
            resultadoDiv.style.display = 'block';
            resultadoDiv.style.background = 'var(--bg)';
            resultadoDiv.style.border = '1px solid var(--light)';
            resultadoDiv.innerHTML = '🔄 Procesando backup...';

            let backupData;
            try {
                backupData = JSON.parse(texto);
            } catch (e) {
                const jsonMatch = texto.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        backupData = JSON.parse(jsonMatch[0]);
                    } catch (e2) {
                        throw new Error('No se pudo parsear el JSON. Asegúrate de que el texto sea un backup válido.');
                    }
                } else {
                    throw new Error('No se encontró un JSON válido en el texto.');
                }
            }

            if (!backupData.data || typeof backupData.data !== 'object') {
                throw new Error('Estructura de backup inválida.');
            }

            const totalFrases = backupData.data.frases?.length || 0;
            const totalPalabras = backupData.data.palabras?.length || 0;
            const totalHistorias = backupData.data.historias?.length || 0;
            const totalTemas = backupData.data.temas?.length || 0;
            const totalOndasCruzadas = backupData.ondasCruzadas?.grafoElipse ? 
                Object.values(backupData.ondasCruzadas.grafoElipse).reduce((acc, el) => acc + (el.totalOndas || 0), 0) : 0;
            const totalOndasElipse = backupData.elipse?.historias?.length || 0;
            const fecha = backupData.fecha ? new Date(backupData.fecha).toLocaleString() : 'fecha desconocida';

            var resumen = '⚠️ ¿Restaurar este backup completo?\n\n';
            resumen += '📅 Fecha: ' + fecha + '\n';
            resumen += '📊 Contenido:\n';
            resumen += '• ' + totalFrases + ' frases\n';
            resumen += '• ' + totalPalabras + ' palabras\n';
            resumen += '• ' + totalHistorias + ' historias\n';
            resumen += '• ' + totalTemas + ' temas\n';
            if (totalOndasCruzadas > 0) {
                resumen += '🌊 • ' + totalOndasCruzadas + ' ondas cruzadas\n';
                resumen += '🌊 • ' + Object.keys(backupData.ondasCruzadas?.grafoElipse || {}).length + ' elipses conectadas\n';
            }
            if (totalOndasElipse > 0) {
                resumen += '🌌 • ' + totalOndasElipse + ' ondas elipse\n';
            }
            if (backupData.favoritos) {
                const totalFavs = (backupData.favoritos.frases?.length || 0) + (backupData.favoritos.palabras?.length || 0);
                resumen += '⭐ • ' + totalFavs + ' favoritos\n';
            }
            resumen += '🧠 • Modo Tutor: ' + (backupData.tutorNeuro?.modo || 'flexible') + '\n\n';
            resumen += 'Esto SOBRESCRIBIRÁ todos tus datos actuales.\n\n¿Continuar?';

            const confirmar = await this._core.confirm(resumen, '⚠️ Restaurar Backup Completo');
            if (!confirmar) return;

            resultadoDiv.innerHTML = '🔄 Importando datos...';

            await db.importarBackup(backupData.data);

            if (backupData.usuario) {
                await db.guardarUsuario(backupData.usuario);
            }

            if (backupData.idiomaActivo) {
                localStorage.setItem('pipeline_idioma_activo', backupData.idiomaActivo);
                if (window.gestorIdiomas) {
                    await window.gestorIdiomas.cambiarIdioma(backupData.idiomaActivo);
                }
            }

            if (backupData.ondasCruzadas && window.modoOndasCruzadas) {
                try {
                    if (backupData.ondasCruzadas.grafoElipse) {
                        window.modoOndasCruzadas._grafoElipse = backupData.ondasCruzadas.grafoElipse;
                    }
                    if (backupData.ondasCruzadas.recuerdoGlobal) {
                        window.modoOndasCruzadas._recuerdoGlobal = {
                            personajes: new Set(backupData.ondasCruzadas.recuerdoGlobal.personajes || []),
                            lugares: new Set(backupData.ondasCruzadas.recuerdoGlobal.lugares || []),
                            eventosClave: backupData.ondasCruzadas.recuerdoGlobal.eventosClave || [],
                            vocabularioAcumulado: new Map(backupData.ondasCruzadas.recuerdoGlobal.vocabularioAcumulado || []),
                            resumenGlobal: backupData.ondasCruzadas.recuerdoGlobal.resumenGlobal || '',
                            ultimaActualizacion: backupData.ondasCruzadas.recuerdoGlobal.ultimaActualizacion || Date.now()
                        };
                    }
                    if (backupData.ondasCruzadas.mapaInterferencias) {
                        window.modoOndasCruzadas._mapaInterferencias = backupData.ondasCruzadas.mapaInterferencias;
                    }
                    if (backupData.ondasCruzadas.config) {
                        window.modoOndasCruzadas._config = { 
                            ...window.modoOndasCruzadas._config, 
                            ...backupData.ondasCruzadas.config 
                        };
                    }
                    await window.modoOndasCruzadas._guardarDatos();
                    resultadoDiv.innerHTML += '<br>🌊 Ondas Cruzadas restauradas (' + totalOndasCruzadas + ' ondas)';
                } catch (e) {
                    console.warn('⚠️ Error restaurando Ondas Cruzadas:', e);
                    resultadoDiv.innerHTML += '<br>⚠️ Error restaurando Ondas Cruzadas: ' + e.message;
                }
            }

            if (backupData.elipse && window.modoElipse) {
                try {
                    if (backupData.elipse.historias) {
                        window.modoElipse._historiasElipse = backupData.elipse.historias;
                    }
                    if (backupData.elipse.elipseActiva) {
                        window.modoElipse._elipseActiva = backupData.elipse.elipseActiva;
                        localStorage.setItem('pipeline_elipse_tema_activo', backupData.elipse.elipseActiva);
                    }
                    if (backupData.elipse.estadisticas) {
                        window.modoElipse._estadisticas = backupData.elipse.estadisticas;
                    }
                    if (backupData.elipse.config) {
                        window.modoElipse._config = { ...window.modoElipse._config, ...backupData.elipse.config };
                    }
                    if (backupData.elipse.recuerdoOndas) {
                        window.modoElipse._recuerdoOndas = backupData.elipse.recuerdoOndas;
                    }
                    await window.modoElipse._guardarEstadoElipse();
                    await window.modoElipse._guardarEnIndexedDB();
                    resultadoDiv.innerHTML += '<br>🌌 Elipse restaurada (' + totalOndasElipse + ' ondas)';
                } catch (e) {
                    console.warn('⚠️ Error restaurando Elipse:', e);
                    resultadoDiv.innerHTML += '<br>⚠️ Error restaurando Elipse: ' + e.message;
                }
            }

            if (backupData.favoritos && window.gestorFavoritos) {
                try {
                    window.gestorFavoritos._favoritos = {
                        frases: backupData.favoritos.frases || [],
                        palabras: backupData.favoritos.palabras || []
                    };
                    window.gestorFavoritos._grupos = backupData.favoritos.grupos || {};
                    await window.gestorFavoritos.guardarFavoritos();
                    await window.gestorFavoritos._guardarGrupos();
                    resultadoDiv.innerHTML += '<br>⭐ Favoritos restaurados';
                } catch (e) {
                    console.warn('⚠️ Error restaurando favoritos:', e);
                }
            }

            if (backupData.tutorNeuro && window.tutorNeuro) {
                try {
                    if (backupData.tutorNeuro.modo) {
                        window.tutorNeuro.setModo(backupData.tutorNeuro.modo);
                    }
                    if (backupData.tutorNeuro.configuracion) {
                        window.tutorNeuro._configuracion = { 
                            ...window.tutorNeuro._configuracion, 
                            ...backupData.tutorNeuro.configuracion 
                        };
                    }
                    resultadoDiv.innerHTML += '<br>🧠 Tutor Neuro restaurado';
                } catch (e) {
                    console.warn('⚠️ Error restaurando Tutor Neuro:', e);
                }
            }

            if (backupData.learningPath && window.LearningPath) {
                try {
                    if (backupData.learningPath.ruta) {
                        window.LearningPath._rutaActual = backupData.learningPath.ruta;
                    }
                    if (backupData.learningPath.pasoActual !== undefined) {
                        window.LearningPath._pasoActual = backupData.learningPath.pasoActual;
                    }
                    resultadoDiv.innerHTML += '<br>🧭 Learning Path restaurado';
                } catch (e) {
                    console.warn('⚠️ Error restaurando Learning Path:', e);
                }
            }

            if (window.UIDashboard) {
                window.UIDashboard._cargarDashboardInicial(this._core);
            }
            if (window.UIClipse) {
                window.UIClipse.cargar(this._core);
            }
            if (window.UIOndasCruzadas) {
                window.UIOndasCruzadas.cargar(this._core);
            }
            if (window.gestorIdiomas) {
                await window.gestorIdiomas._cargarIdiomas();
            }

            this._cacheBackups = null;

            resultadoDiv.style.background = 'rgba(0,184,148,0.1)';
            resultadoDiv.style.border = '1px solid var(--success)';
            resultadoDiv.innerHTML = '✅ Backup restaurado correctamente<br><span style="font-size: 12px; color: var(--gray);">📚 ' + totalFrases + ' frases · 📝 ' + totalPalabras + ' palabras · 📖 ' + totalHistorias + ' historias · 📂 ' + totalTemas + ' temas' + (totalOndasCruzadas > 0 ? ' · 🌊 ' + totalOndasCruzadas + ' ondas cruzadas' : '') + (totalOndasElipse > 0 ? ' · 🌌 ' + totalOndasElipse + ' ondas elipse' : '') + '<br>🔄 Recargando la aplicación...</span>';

            this._core.mostrarToast('✅ Backup restaurado correctamente', 'success');

            setTimeout(() => {
                location.reload();
            }, 2000);

        } catch (error) {
            console.error('❌ Error restaurando backup:', error);
            resultadoDiv.style.display = 'block';
            resultadoDiv.style.background = 'rgba(255,118,117,0.1)';
            resultadoDiv.style.border = '1px solid var(--danger)';
            resultadoDiv.innerHTML = '❌ Error: ' + error.message;
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // GENERAR QR
    // ============================================================

    async _generarQR() {
        try {
            this._core.mostrarToast('📱 Generando código QR...', 'info');

            const data = await db.exportarBackup();
            
            let ondasCruzadasData = null;
            if (window.modoOndasCruzadas) {
                try {
                    ondasCruzadasData = {
                        grafoElipse: window.modoOndasCruzadas._grafoElipse || {},
                        recuerdoGlobal: {
                            personajes: Array.from(window.modoOndasCruzadas._recuerdoGlobal.personajes || new Set()),
                            lugares: Array.from(window.modoOndasCruzadas._recuerdoGlobal.lugares || new Set()),
                            eventosClave: window.modoOndasCruzadas._recuerdoGlobal.eventosClave || [],
                            vocabularioAcumulado: Array.from(window.modoOndasCruzadas._recuerdoGlobal.vocabularioAcumulado?.entries() || []),
                            resumenGlobal: window.modoOndasCruzadas._recuerdoGlobal.resumenGlobal || '',
                            ultimaActualizacion: window.modoOndasCruzadas._recuerdoGlobal.ultimaActualizacion || Date.now()
                        },
                        mapaInterferencias: window.modoOndasCruzadas._mapaInterferencias || {},
                        config: window.modoOndasCruzadas._config || {}
                    };
                } catch (e) {
                    console.warn('⚠️ Error capturando datos de Ondas Cruzadas:', e);
                }
            }
            
            let elipseData = null;
            if (window.modoElipse) {
                try {
                    elipseData = window.modoElipse.getEstadoCompleto();
                } catch (e) {
                    console.warn('⚠️ Error capturando datos de Elipse:', e);
                }
            }

            const backup = {
                fecha: new Date().toISOString(),
                data: data,
                usuario: await db.getUsuario(),
                idiomaActivo: gestorIdiomas?.getIdiomaActivo() || 'es',
                version: '3.3',
                ondasCruzadas: ondasCruzadasData,
                elipse: elipseData
            };

            const jsonStr = JSON.stringify(backup);
            
            var qrText = jsonStr;
            if (qrText.length > 2800) {
                qrText = 'PIPELINE_NEURO_BACKUP_COMPLETO_' + Date.now();
                this._core.mostrarToast('⚠️ El backup es muy grande para un QR. Usa "Backup Texto".', 'warning');
                this._mostrarBackupTextoCompleto(jsonStr, backup);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
            script.onload = () => {
                this._mostrarQR(qrText);
            };
            script.onerror = () => {
                this._core.mostrarToast('❌ No se pudo cargar la librería QR. Usa "Backup Texto".', 'error');
                this._mostrarBackupTextoCompleto(jsonStr, backup);
            };
            document.head.appendChild(script);

        } catch (error) {
            console.error('❌ Error generando QR:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    _mostrarQR(texto) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(8px);
            z-index: 100000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        `;

        var html = '';
        html += '<div style="background: var(--white, #ffffff); border-radius: 16px; padding: 24px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 30px 80px rgba(0,0,0,0.4);">';
        html += '<h3 style="font-size: 18px; font-weight: 700; color: var(--dark); margin: 0 0 4px 0;">📱 Código QR</h3>';
        html += '<p style="font-size: 12px; color: var(--gray); margin: 0 0 16px 0;">Escanea con otro dispositivo para transferir el backup completo<br><span style="font-size: 10px; color: var(--gray-light);">Incluye Ondas Cruzadas y Elipse</span></p>';
        html += '<div id="qrcode-container" style="display: flex; justify-content: center; margin-bottom: 16px; background: white; padding: 16px; border-radius: 8px;"><div id="qrcode"></div></div>';
        html += '<button onclick="this.closest(\'div[style]\').remove()" class="btn-primary" style="padding: 10px 24px; font-size: 14px; font-weight: 600; background: linear-gradient(135deg, #6C5CE7, #A29BFE); color: white; border: none; border-radius: 8px; cursor: pointer; width: 100%;">Cerrar</button>';
        html += '</div>';

        overlay.innerHTML = html;
        document.body.appendChild(overlay);

        try {
            const qrContainer = document.getElementById('qrcode');
            if (qrContainer && typeof QRCode !== 'undefined') {
                new QRCode(qrContainer, {
                    text: texto,
                    width: 256,
                    height: 256,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });
            } else {
                qrContainer.innerHTML = '<div style="padding: 20px; color: var(--gray);">⚠️ No se pudo generar el QR<br><span style="font-size: 11px;">Usa "Backup Texto" como alternativa</span></div>';
            }
        } catch (error) {
            console.warn('⚠️ Error generando QR:', error);
            document.getElementById('qrcode').innerHTML = '<div style="padding: 20px; color: var(--gray);">⚠️ No se pudo generar el QR<br><span style="font-size: 11px;">Usa "Backup Texto" como alternativa</span></div>';
        }

        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    }

    // ============================================================
    // GOOGLE DRIVE
    // ============================================================

    async _conectarGoogleDrive() {
        if (!this._GOOGLE_CLIENT_ID || !this._GOOGLE_API_KEY) {
            this._core.mostrarToast(
                '❌ Google Drive no está configurado.\n\n' +
                'Para usar esta función, necesitas:\n' +
                '1. Ir a Google Cloud Console\n' +
                '2. Crear un proyecto\n' +
                '3. Habilitar Google Drive API\n' +
                '4. Crear credenciales OAuth 2.0\n' +
                '5. Configurar CLIENT_ID y API_KEY en el código',
                'error'
            );
            return;
        }

        try {
            this._googleDriveEnabled = true;
            this._core.mostrarToast('⏳ Inicializando Google Drive...', 'info');
            await this._cargarGoogleLibraries();
            await this._inicializarGoogleAPI();

            if (!this._gapiInitialized) {
                this._core.mostrarToast('❌ Google Drive no disponible.', 'error');
                return;
            }

            this._core.mostrarToast('🔐 Conectando con Google Drive...', 'info');
            await this._autenticarGoogle();

            if (this._accessToken) {
                this._core.mostrarToast('✅ Google Drive conectado correctamente', 'success');
                this._renderizarPanel();
            } else {
                this._core.mostrarToast('❌ No se pudo conectar con Google Drive', 'error');
            }

        } catch (error) {
            console.error('❌ Error conectando Google Drive:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    _cargarGoogleLibraries() {
        if (this._googleDriveEnabled === false) {
            console.log('ℹ️ Google Drive no está activado.');
            return;
        }

        if (typeof gapi !== 'undefined' && gapi.client) {
            this._gapiLoaded = true;
            this._inicializarGoogleAPI();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            console.log('✅ Google API cargada');
            this._gapiLoaded = true;
            this._inicializarGoogleAPI();
        };
        script.onerror = () => {
            console.warn('⚠️ No se pudo cargar Google API');
            this._core?.mostrarToast('⚠️ No se pudo cargar Google API. Verifica tu conexión.', 'error');
        };
        document.head.appendChild(script);
    }

    async _inicializarGoogleAPI() {
        try {
            if (!this._GOOGLE_CLIENT_ID || !this._GOOGLE_API_KEY) {
                this._core?.mostrarToast('❌ Credenciales de Google no configuradas', 'error');
                return;
            }

            if (typeof gapi === 'undefined') {
                console.warn('⚠️ gapi no definido');
                return;
            }

            await new Promise((resolve, reject) => {
                gapi.load('client:auth2', {
                    callback: resolve,
                    onerror: reject,
                    timeout: 10000
                });
            });

            await gapi.client.init({
                apiKey: this._GOOGLE_API_KEY,
                clientId: this._GOOGLE_CLIENT_ID,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                scope: this._SCOPES
            });

            this._gapiInitialized = true;
            console.log('✅ Google Drive API inicializada');
            
            if (typeof google !== 'undefined' && google.accounts) {
                this._tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: this._GOOGLE_CLIENT_ID,
                    scope: this._SCOPES,
                    callback: (tokenResponse) => {
                        this._accessToken = tokenResponse.access_token;
                        console.log('✅ Token de Google Drive obtenido');
                        this._core?.mostrarToast('✅ Google Drive conectado correctamente', 'success');
                        this._renderizarPanel();
                    },
                });
            }

        } catch (error) {
            console.warn('⚠️ Error inicializando Google API:', error);
            this._core?.mostrarToast('❌ Error conectando con Google Drive: ' + error.message, 'error');
        }
    }

    _autenticarGoogle() {
        return new Promise((resolve, reject) => {
            if (this._accessToken) {
                resolve(this._accessToken);
                return;
            }

            if (!this._gapiInitialized) {
                reject(new Error('Google Drive no está disponible.'));
                return;
            }

            if (!this._tokenClient) {
                reject(new Error('Token de Google no disponible.'));
                return;
            }

            try {
                this._tokenClient.requestAccessToken({
                    prompt: 'consent',
                });
                const checkToken = setInterval(() => {
                    if (this._accessToken) {
                        clearInterval(checkToken);
                        resolve(this._accessToken);
                    }
                }, 500);
                setTimeout(() => {
                    clearInterval(checkToken);
                    reject(new Error('Tiempo de espera agotado para autenticación'));
                }, 30000);
            } catch (error) {
                reject(error);
            }
        });
    }

    async _backupGoogleDrive() {
        try {
            if (!this._accessToken) {
                await this._conectarGoogleDrive();
            }

            if (!this._accessToken) {
                this._core.mostrarToast('❌ No se pudo conectar con Google Drive', 'error');
                return;
            }

            this._core.mostrarToast('☁️ Subiendo backup a Google Drive...', 'info');

            const data = await db.exportarBackup();
            const usuario = await db.getUsuario();
            
            let ondasCruzadasData = null;
            if (window.modoOndasCruzadas) {
                try {
                    ondasCruzadasData = {
                        grafoElipse: window.modoOndasCruzadas._grafoElipse || {},
                        recuerdoGlobal: {
                            personajes: Array.from(window.modoOndasCruzadas._recuerdoGlobal.personajes || new Set()),
                            lugares: Array.from(window.modoOndasCruzadas._recuerdoGlobal.lugares || new Set()),
                            eventosClave: window.modoOndasCruzadas._recuerdoGlobal.eventosClave || [],
                            vocabularioAcumulado: Array.from(window.modoOndasCruzadas._recuerdoGlobal.vocabularioAcumulado?.entries() || []),
                            resumenGlobal: window.modoOndasCruzadas._recuerdoGlobal.resumenGlobal || '',
                            ultimaActualizacion: window.modoOndasCruzadas._recuerdoGlobal.ultimaActualizacion || Date.now()
                        },
                        mapaInterferencias: window.modoOndasCruzadas._mapaInterferencias || {},
                        config: window.modoOndasCruzadas._config || {}
                    };
                } catch (e) {
                    console.warn('⚠️ Error capturando datos de Ondas Cruzadas:', e);
                }
            }
            
            let elipseData = null;
            if (window.modoElipse) {
                try {
                    elipseData = window.modoElipse.getEstadoCompleto();
                } catch (e) {
                    console.warn('⚠️ Error capturando datos de Elipse:', e);
                }
            }

            const backup = {
                fecha: new Date().toISOString(),
                data: data,
                usuario: usuario,
                idiomaActivo: gestorIdiomas?.getIdiomaActivo() || 'es',
                version: '3.3',
                ondasCruzadas: ondasCruzadasData,
                elipse: elipseData
            };

            const jsonStr = JSON.stringify(backup, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const metadata = {
                name: 'pipeline_backup_completo_' + new Date().toISOString().slice(0,10) + '.json',
                parents: ['root']
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', blob);

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + this._accessToken
                },
                body: form
            });

            if (!response.ok) {
                throw new Error('Error subiendo a Google Drive: ' + response.statusText);
            }

            const result = await response.json();
            this._core.mostrarToast('✅ Backup completo subido a Google Drive (ID: ' + result.id + ')', 'success');

        } catch (error) {
            console.error('❌ Error subiendo a Google Drive:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _restaurarGoogleDrive() {
        try {
            if (!this._accessToken) {
                await this._conectarGoogleDrive();
            }

            if (!this._accessToken) {
                this._core.mostrarToast('❌ No se pudo conectar con Google Drive', 'error');
                return;
            }

            this._core.mostrarToast('☁️ Buscando backups en Google Drive...', 'info');

            const response = await fetch(
                'https://www.googleapis.com/drive/v3/files?q=name contains pipeline_backup_ and trashed=false&orderBy=createdTime desc&pageSize=10',
                {
                    headers: {
                        'Authorization': 'Bearer ' + this._accessToken
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Error buscando backups: ' + response.statusText);
            }

            const result = await response.json();

            if (!result.files || result.files.length === 0) {
                this._core.mostrarToast('❌ No se encontraron backups en Google Drive', 'error');
                return;
            }

            var mensaje = '📂 Selecciona un backup para restaurar:\n\n';
            result.files.forEach((f, i) => {
                const fecha = new Date(f.createdTime).toLocaleString();
                const tamano = Math.round(f.size / 1024);
                const esCompleto = f.name.includes('completo') ? ' 🌊🌌' : '';
                mensaje += (i + 1) + '. ' + f.name + ' (' + tamano + ' KB) - ' + fecha + esCompleto + '\n';
            });

            const seleccion = await this._core.prompt(mensaje, '1', 'Número del backup...', '📂 Restaurar Backup');
            if (!seleccion) return;

            const idx = parseInt(seleccion) - 1;
            if (isNaN(idx) || idx < 0 || idx >= result.files.length) {
                this._core.mostrarToast('❌ Selección inválida', 'error');
                return;
            }

            const archivo = result.files[idx];
            
            const mensajeConfirmacion = '⚠️ ¿Restaurar backup "' + archivo.name + '"?\n\nEsto SOBRESCRIBIRÁ todos tus datos actuales.\n\n¿Continuar?';

            const confirmar = await this._core.confirm(mensajeConfirmacion, '⚠️ Restaurar Backup');
            if (!confirmar) return;

            this._core.mostrarToast('🔄 Descargando backup...', 'info');

            const downloadResponse = await fetch(
                'https://www.googleapis.com/drive/v3/files/' + archivo.id + '?alt=media',
                {
                    headers: {
                        'Authorization': 'Bearer ' + this._accessToken
                    }
                }
            );

            if (!downloadResponse.ok) {
                throw new Error('Error descargando backup: ' + downloadResponse.statusText);
            }

            const jsonText = await downloadResponse.text();
            const backup = JSON.parse(jsonText);

            const textarea = document.getElementById('restaurarBackupTexto');
            if (textarea) {
                textarea.value = jsonText;
                await this._procesarRestauracionTexto();
            } else {
                await db.importarBackup(backup.data);
                if (backup.usuario) {
                    await db.guardarUsuario(backup.usuario);
                }
                if (backup.idiomaActivo) {
                    localStorage.setItem('pipeline_idioma_activo', backup.idiomaActivo);
                }
                
                if (backup.ondasCruzadas && window.modoOndasCruzadas) {
                    try {
                        if (backup.ondasCruzadas.grafoElipse) {
                            window.modoOndasCruzadas._grafoElipse = backup.ondasCruzadas.grafoElipse;
                        }
                        if (backup.ondasCruzadas.recuerdoGlobal) {
                            window.modoOndasCruzadas._recuerdoGlobal = {
                                personajes: new Set(backup.ondasCruzadas.recuerdoGlobal.personajes || []),
                                lugares: new Set(backup.ondasCruzadas.recuerdoGlobal.lugares || []),
                                eventosClave: backup.ondasCruzadas.recuerdoGlobal.eventosClave || [],
                                vocabularioAcumulado: new Map(backup.ondasCruzadas.recuerdoGlobal.vocabularioAcumulado || []),
                                resumenGlobal: backup.ondasCruzadas.recuerdoGlobal.resumenGlobal || '',
                                ultimaActualizacion: backup.ondasCruzadas.recuerdoGlobal.ultimaActualizacion || Date.now()
                            };
                        }
                        if (backup.ondasCruzadas.mapaInterferencias) {
                            window.modoOndasCruzadas._mapaInterferencias = backup.ondasCruzadas.mapaInterferencias;
                        }
                        if (backup.ondasCruzadas.config) {
                            window.modoOndasCruzadas._config = { 
                                ...window.modoOndasCruzadas._config, 
                                ...backup.ondasCruzadas.config 
                            };
                        }
                        await window.modoOndasCruzadas._guardarDatos();
                    } catch (e) {
                        console.warn('⚠️ Error restaurando Ondas Cruzadas:', e);
                    }
                }
                
                if (backup.elipse && window.modoElipse) {
                    try {
                        if (backup.elipse.historias) {
                            window.modoElipse._historiasElipse = backup.elipse.historias;
                        }
                        if (backup.elipse.elipseActiva) {
                            window.modoElipse._elipseActiva = backup.elipse.elipseActiva;
                            localStorage.setItem('pipeline_elipse_tema_activo', backup.elipse.elipseActiva);
                        }
                        if (backup.elipse.estadisticas) {
                            window.modoElipse._estadisticas = backup.elipse.estadisticas;
                        }
                        if (backup.elipse.config) {
                            window.modoElipse._config = { ...window.modoElipse._config, ...backup.elipse.config };
                        }
                        if (backup.elipse.recuerdoOndas) {
                            window.modoElipse._recuerdoOndas = backup.elipse.recuerdoOndas;
                        }
                        await window.modoElipse._guardarEstadoElipse();
                        await window.modoElipse._guardarEnIndexedDB();
                    } catch (e) {
                        console.warn('⚠️ Error restaurando Elipse:', e);
                    }
                }
                
                this._core.mostrarToast('✅ Backup restaurado correctamente', 'success');
                setTimeout(() => {
                    location.reload();
                }, 1500);
            }

        } catch (error) {
            console.error('❌ Error restaurando de Google Drive:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // GESTOR DE BACKUPS
    // ============================================================

    async _abrirGestorBackups() {
        try {
            const backups = await this._obtenerListaBackups();

            if (backups.length === 0) {
                this._core.mostrarToast('📭 No hay backups guardados', 'info');
                return;
            }

            var mensaje = '📦 GESTIÓN DE BACKUPS\n\n';
            mensaje += 'Total: ' + backups.length + ' backups\n';
            mensaje += '📊 Espacio total: ' + Math.round(backups.reduce((acc, b) => acc + (b.tamano || 0), 0) / 1024) + ' KB\n';
            mensaje += '🌊 Backups con Ondas Cruzadas: ' + backups.filter(b => b.tieneOndasCruzadas).length + '\n';
            mensaje += '🌌 Backups con Elipse: ' + backups.filter(b => b.tieneElipse).length + '\n\n';
            mensaje += 'Selecciona una opción:\n';
            mensaje += '1. 📋 Ver lista de backups\n';
            mensaje += '2. 🗑️ Eliminar backup específico\n';
            mensaje += '3. 🧹 Eliminar backups automáticos (mantener manuales)\n';
            mensaje += '4. 💥 Eliminar TODOS los backups\n';
            mensaje += '5. ⚙️ Configurar límite de backups\n';
            mensaje += '6. 📊 Ver estadísticas de backups\n';
            mensaje += '0. ❌ Cancelar';

            const opcion = await this._core.prompt(mensaje, '0', 'Elige una opción...', '📦 Gestor de Backups');

            if (!opcion) return;

            const opcionNum = parseInt(opcion);

            switch (opcionNum) {
                case 1:
                    await this._mostrarListaBackups(backups);
                    break;
                case 2:
                    await this._eliminarBackupEspecifico(backups);
                    break;
                case 3:
                    await this._eliminarBackupsAutomaticos();
                    break;
                case 4:
                    await this._eliminarTodosBackups();
                    break;
                case 5:
                    await this._configurarLimiteBackups();
                    break;
                case 6:
                    await this._mostrarEstadisticasBackups(backups);
                    break;
                default:
                    this._core.mostrarToast('❌ Opción cancelada', 'info');
            }

        } catch (error) {
            console.error('❌ Error en gestor de backups:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _mostrarListaBackups(backups) {
        if (!backups || backups.length === 0) {
            this._core.mostrarToast('📭 No hay backups guardados', 'info');
            return;
        }

        var mensaje = '📋 LISTA DE BACKUPS\n\n';
        
        backups.forEach((b, i) => {
            const auto = b.esAutomatico ? '🤖 Automático' : '👤 Manual';
            const fecha = b.fechaLegible || new Date(b.fecha).toLocaleString();
            const oc = b.tieneOndasCruzadas ? ' 🌊' : '';
            const oe = b.tieneElipse ? ' 🌌' : '';
            mensaje += (i + 1) + '. 📅 ' + fecha + oc + oe + '\n';
            mensaje += '   📊 ' + b.tamanoKB + ' KB · ' + auto + '\n';
            mensaje += '   📁 ' + (b.data?.frases?.length || 0) + ' frases · ' + (b.data?.palabras?.length || 0) + ' palabras\n';
            if (b.totalOndasCruzadas > 0) mensaje += '   🌊 ' + b.totalOndasCruzadas + ' ondas cruzadas\n';
            if (b.totalOndasElipse > 0) mensaje += '   🌌 ' + b.totalOndasElipse + ' ondas elipse\n';
            if (b.id) mensaje += '   🆔 ' + b.id + '\n';
            mensaje += '\n';
        });

        mensaje += '\n💡 Total: ' + backups.length + ' backups';
        mensaje += '\n📊 Espacio total: ' + Math.round(backups.reduce((acc, b) => acc + (b.tamano || 0), 0) / 1024) + ' KB';
        mensaje += '\n🌊 Con Ondas Cruzadas: ' + backups.filter(b => b.tieneOndasCruzadas).length;
        mensaje += '\n🌌 Con Elipse: ' + backups.filter(b => b.tieneElipse).length;

        await this._core.alert(mensaje, '📋 Lista de Backups');
    }

    async _mostrarEstadisticasBackups(backups) {
        if (!backups || backups.length === 0) {
            this._core.mostrarToast('📭 No hay backups', 'info');
            return;
        }

        const totalOndasCruzadas = backups.reduce((acc, b) => acc + (b.totalOndasCruzadas || 0), 0);
        const totalOndasElipse = backups.reduce((acc, b) => acc + (b.totalOndasElipse || 0), 0);
        const totalFrases = backups.reduce((acc, b) => acc + (b.data?.frases?.length || 0), 0);
        const totalPalabras = backups.reduce((acc, b) => acc + (b.data?.palabras?.length || 0), 0);
        const totalHistorias = backups.reduce((acc, b) => acc + (b.data?.historias?.length || 0), 0);
        const totalTemas = backups.reduce((acc, b) => acc + (b.data?.temas?.length || 0), 0);
        const totalSize = backups.reduce((acc, b) => acc + (b.tamano || 0), 0);

        var mensaje = '📊 ESTADÍSTICAS DE BACKUPS\n\n';
        mensaje += '📦 Total de backups: ' + backups.length + '\n';
        mensaje += '💾 Espacio total: ' + Math.round(totalSize / 1024) + ' KB\n\n';
        mensaje += '📚 CONTENIDO TOTAL RESPALDADO:\n';
        mensaje += '• ' + totalFrases + ' frases\n';
        mensaje += '• ' + totalPalabras + ' palabras\n';
        mensaje += '• ' + totalHistorias + ' historias\n';
        mensaje += '• ' + totalTemas + ' temas\n\n';
        mensaje += '🌊 ONDAS CRUZADAS:\n';
        mensaje += '• ' + totalOndasCruzadas + ' ondas cruzadas\n';
        mensaje += '• ' + backups.filter(b => b.tieneOndasCruzadas).length + ' backups con ondas cruzadas\n\n';
        mensaje += '🌌 ELIPSE:\n';
        mensaje += '• ' + totalOndasElipse + ' ondas elipse\n';
        mensaje += '• ' + backups.filter(b => b.tieneElipse).length + ' backups con elipse\n\n';
        mensaje += '🤖 AUTOMÁTICOS: ' + backups.filter(b => b.esAutomatico).length + '\n';
        mensaje += '👤 MANUALES: ' + backups.filter(b => !b.esAutomatico).length + '\n';
        mensaje += '📅 Último backup: ' + (backups[0]?.fechaLegible || 'Nunca');

        await this._core.alert(mensaje, '📊 Estadísticas de Backups');
    }

    async _eliminarBackupEspecifico(backups) {
        if (!backups || backups.length === 0) {
            this._core.mostrarToast('📭 No hay backups para eliminar', 'info');
            return;
        }

        var mensaje = '🗑️ ELIMINAR BACKUP\n\n';
        mensaje += 'Selecciona el número del backup a eliminar:\n\n';
        
        backups.forEach((b, i) => {
            const auto = b.esAutomatico ? '🤖' : '👤';
            const fecha = b.fechaLegible || new Date(b.fecha).toLocaleString();
            const oc = b.tieneOndasCruzadas ? ' 🌊' : '';
            const oe = b.tieneElipse ? ' 🌌' : '';
            mensaje += (i + 1) + '. ' + auto + ' ' + fecha + ' (' + b.tamanoKB + ' KB)' + oc + oe + '\n';
        });

        mensaje += '\n0. ❌ Cancelar';

        const seleccion = await this._core.prompt(mensaje, '0', 'Número del backup...', '🗑️ Eliminar Backup');

        if (!seleccion) return;

        const idx = parseInt(seleccion) - 1;

        if (isNaN(idx) || idx < 0 || idx >= backups.length) {
            this._core.mostrarToast('❌ Selección inválida', 'error');
            return;
        }

        const backup = backups[idx];
        const tieneOndasCruzadas = backup.tieneOndasCruzadas ? '🌊 Sí' : '🌊 No';
        const tieneElipse = backup.tieneElipse ? '🌌 Sí' : '🌌 No';
        
        const confirmar = await this._core.confirm(
            '⚠️ ¿Eliminar este backup?\n\n' +
            '📅 Fecha: ' + (backup.fechaLegible || new Date(backup.fecha).toLocaleString()) + '\n' +
            '📊 Tamaño: ' + backup.tamanoKB + ' KB\n' +
            '🤖 Tipo: ' + (backup.esAutomatico ? 'Automático' : 'Manual') + '\n' +
            '📁 Frases: ' + (backup.data?.frases?.length || 0) + '\n' +
            '🌊 Ondas Cruzadas: ' + tieneOndasCruzadas + '\n' +
            '🌌 Elipse: ' + tieneElipse + '\n' +
            (backup.totalOndasCruzadas > 0 ? '🌊 Ondas cruzadas: ' + backup.totalOndasCruzadas + '\n' : '') +
            (backup.totalOndasElipse > 0 ? '🌌 Ondas elipse: ' + backup.totalOndasElipse + '\n' : '') +
            'Esta acción NO se puede deshacer.',
            '🗑️ Confirmar Eliminación'
        );

        if (!confirmar) return;

        try {
            await db.delete('backups', backup.id);
            this._cacheBackups = null;

            var msg = '🗑️ Backup eliminado';
            if (backup.tieneOndasCruzadas) msg += ' (con Ondas Cruzadas)';
            if (backup.tieneElipse) msg += ' (con Elipse)';
            this._core.mostrarToast(msg, 'warning');
            this._renderizarPanel();
            
            const verLista = await this._core.confirm('¿Quieres ver la lista actualizada?', '');
            if (verLista) {
                await this._mostrarListaBackups(await this._obtenerListaBackups());
            }

        } catch (error) {
            console.error('❌ Error eliminando backup:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _eliminarBackupsAutomaticos() {
        const backups = await this._obtenerListaBackups();
        const automaticos = backups.filter(b => b.esAutomatico === true);
        const manuales = backups.filter(b => b.esAutomatico === false);

        if (automaticos.length === 0) {
            this._core.mostrarToast('📭 No hay backups automáticos para eliminar', 'info');
            return;
        }

        const totalOndasCruzadasAuto = automaticos.reduce((acc, b) => acc + (b.totalOndasCruzadas || 0), 0);
        const totalOndasElipseAuto = automaticos.reduce((acc, b) => acc + (b.totalOndasElipse || 0), 0);

        const confirmar = await this._core.confirm(
            '⚠️ ¿Eliminar TODOS los backups automáticos?\n\n' +
            '📊 ' + automaticos.length + ' backups automáticos\n' +
            '📁 ' + manuales.length + ' backups manuales (se mantienen)\n' +
            '📊 Espacio a liberar: ' + Math.round(automaticos.reduce((acc, b) => acc + (b.tamano || 0), 0) / 1024) + ' KB\n' +
            '🌊 Ondas cruzadas afectadas: ' + totalOndasCruzadasAuto + '\n' +
            '🌌 Ondas elipse afectadas: ' + totalOndasElipseAuto + '\n\n' +
            'Esta acción NO se puede deshacer.',
            '🧹 Eliminar Backups Automáticos'
        );

        if (!confirmar) return;

        try {
            for (const b of automaticos) {
                await db.delete('backups', b.id);
            }
            this._cacheBackups = null;

            this._core.mostrarToast(
                '🧹 ' + automaticos.length + ' backups automáticos eliminados\n' +
                '🌊 ' + totalOndasCruzadasAuto + ' ondas cruzadas liberadas\n' +
                '🌌 ' + totalOndasElipseAuto + ' ondas elipse liberadas',
                'warning'
            );
            this._renderizarPanel();
        } catch (error) {
            console.error('❌ Error eliminando backups automáticos:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _eliminarTodosBackups() {
        const backups = await this._obtenerListaBackups();

        if (backups.length === 0) {
            this._core.mostrarToast('📭 No hay backups para eliminar', 'info');
            return;
        }

        const totalOndasCruzadas = backups.reduce((acc, b) => acc + (b.totalOndasCruzadas || 0), 0);
        const totalOndasElipse = backups.reduce((acc, b) => acc + (b.totalOndasElipse || 0), 0);

        const confirmar1 = await this._core.confirm(
            '⚠️ ¿ELIMINAR TODOS LOS BACKUPS?\n\n' +
            '📊 ' + backups.length + ' backups\n' +
            '📊 Espacio total: ' + Math.round(backups.reduce((acc, b) => acc + (b.tamano || 0), 0) / 1024) + ' KB\n' +
            '🌊 Ondas cruzadas: ' + totalOndasCruzadas + '\n' +
            '🌌 Ondas elipse: ' + totalOndasElipse + '\n\n' +
            '⚠️ Esta acción NO se puede deshacer.\n' +
            '⚠️ Perderás TODOS tus backups guardados.\n\n' +
            '¿Estás seguro?',
            '💥 Eliminar Todos los Backups'
        );

        if (!confirmar1) return;

        const confirmar2 = await this._core.confirm(
            '🔴 ÚLTIMA ADVERTENCIA 🔴\n\n' +
            'Se eliminarán ' + backups.length + ' backups permanentemente.\n' +
            'Incluyendo ' + totalOndasCruzadas + ' ondas cruzadas y ' + totalOndasElipse + ' ondas elipse.\n\n' +
            'Escribe "ELIMINAR" para confirmar:',
            '⚠️ Confirmación Final'
        );

        if (!confirmar2) return;

        try {
            for (const b of backups) {
                await db.delete('backups', b.id);
            }
            this._cacheBackups = null;

            this._core.mostrarToast(
                '💥 Todos los backups eliminados\n' +
                '🌊 ' + totalOndasCruzadas + ' ondas cruzadas perdidas\n' +
                '🌌 ' + totalOndasElipse + ' ondas elipse perdidas',
                'warning'
            );
            this._renderizarPanel();
        } catch (error) {
            console.error('❌ Error eliminando todos los backups:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    async _configurarLimiteBackups() {
        const backups = await this._obtenerListaBackups();
        const totalOndasCruzadas = backups.reduce((acc, b) => acc + (b.totalOndasCruzadas || 0), 0);
        const totalOndasElipse = backups.reduce((acc, b) => acc + (b.totalOndasElipse || 0), 0);

        var mensaje = '⚙️ CONFIGURAR LÍMITE DE BACKUPS\n\n';
        mensaje += 'Límite actual: ' + this._MAX_BACKUPS + ' backups\n';
        mensaje += 'Backups actuales: ' + backups.length + '\n';
        mensaje += '🌊 Ondas cruzadas: ' + totalOndasCruzadas + '\n';
        mensaje += '🌌 Ondas elipse: ' + totalOndasElipse + '\n\n';
        mensaje += 'Escribe el nuevo límite (mínimo 3, máximo 50):';

        const nuevoLimite = await this._core.prompt(mensaje, String(this._MAX_BACKUPS), 'Número (3-50)...', '⚙️ Límite de Backups');

        if (!nuevoLimite) return;

        const limite = parseInt(nuevoLimite);

        if (isNaN(limite) || limite < 3 || limite > 50) {
            this._core.mostrarToast('❌ Límite inválido. Debe ser entre 3 y 50.', 'error');
            return;
        }

        this._MAX_BACKUPS = limite;
        localStorage.setItem('pipeline_backup_max_limit', String(limite));
        this._autoBackupConfig.maxBackups = limite;
        await this._guardarConfiguracionAutoBackup();

        let allBackups = await db.getAll('backups');
        allBackups.sort((a, b) => b.id - a.id);
        
        let eliminados = 0;
        let ondasEliminadas = 0;
        let elipsesEliminadas = 0;
        
        while (allBackups.length > limite) {
            const eliminado = allBackups.pop();
            await db.delete('backups', eliminado.id);
            eliminados++;
            ondasEliminadas += eliminado._metadata?.totalOndasCruzadas || 0;
            elipsesEliminadas += eliminado._metadata?.totalOndasElipse || 0;
            console.log('🗑️ Backup antiguo eliminado por límite: ' + new Date(eliminado.fecha).toLocaleString());
        }
        
        this._cacheBackups = null;

        this._core.mostrarToast(
            '✅ Límite configurado a ' + limite + ' backups\n' +
            '🗑️ ' + eliminados + ' backups eliminados\n' +
            '🌊 ' + ondasEliminadas + ' ondas cruzadas liberadas\n' +
            '🌌 ' + elipsesEliminadas + ' ondas elipse liberadas',
            'success'
        );
        this._renderizarPanel();
    }

    // ============================================================
    // REGISTRAR ACTIVIDAD
    // ============================================================

    registrarActividad() {
        localStorage.setItem('pipeline_ultima_actividad', String(Date.now()));
    }

    _handleBackup() {
        if (this._container) {
            this._renderizarPanel();
        } else {
            const toolsContent = document.getElementById('toolsContent');
            if (toolsContent) {
                this.renderizar(toolsContent);
            }
        }
    }

    // ============================================================
    // DESTRUIR
    // ============================================================

    destroy() {
        if (this._backupInterval) {
            clearInterval(this._backupInterval);
            this._backupInterval = null;
        }
        if (this._backupTimeout) {
            clearTimeout(this._backupTimeout);
            this._backupTimeout = null;
        }
        console.log('🛑 UIBackup: Destruido');
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UIBackup = new UIBackup();
console.log('✅ UI Backup v3.3 - CON PERSISTENCIA EN INDEXEDDB');
console.log('  🔥 Configuración de backup automático en localStorage + IndexedDB');
console.log('  🔥 Persistencia entre sesiones y dispositivos');
console.log('  🔥 Migración automática de configuración legacy');
console.log('  🔥 Todas las funcionalidades originales preservadas');
console.log('  📦 Backup Local (IndexedDB)');
console.log('  📧 Backup por Correo');
console.log('  📄 Backup Texto');
console.log('  📱 Código QR');
console.log('  ☁️ Google Drive');
console.log('  🤖 Backup Automático (con persistencia)');
console.log('  🗑️ Gestión de Backups');
console.log('  🌊 SOPORTE ONDAS CRUZADAS');
console.log('  🌌 SOPORTE ELIPSE');