// ============================================================
// UI TOOLS v22.9 - COMPLETO CON BALANCEADOR DE CARGA GROQ
// ============================================================

class UITools {
    constructor() {
        this._core = null;
        this._container = null;
        this._cargando = false;
        this._modalAbierto = false;
        this._modalOverlay = null;
        this._escapeHandler = null;
        this._storageData = {
            indexedDB: { usado: 0, total: 0, porcentaje: 0, items: 0 },
            localStorage: { usado: 0, total: 0, porcentaje: 0, items: 0 },
            total: { usado: 0, total: 0, porcentaje: 0 }
        };
        this._actualizandoStorage = false;
        this._storageInterval = null;
        this._STORAGE_LIMIT = 50 * 1024 * 1024; // 50MB para IndexedDB
        this._LOCAL_STORAGE_LIMIT = 5 * 1024 * 1024; // 5MB para localStorage
    }

    async init(core) {
        this._core = core;
        
        if (window.UIBackup) {
            try {
                await window.UIBackup.init(core);
                console.log('✅ UIBackup inicializado correctamente');
            } catch (e) {
                console.warn('⚠️ Error inicializando UIBackup:', e);
            }
        }
        
        return this;
    }

    cargar(core) {
        this._core = core;
        this._container = document.getElementById('toolsContent');
        
        if (this._container) {
            this._renderizarPanelConBackupMultiCapa();
            this._iniciarActualizacionStorage();
        } else {
            console.warn('⚠️ toolsContent no encontrado');
        }
    }

    _iniciarActualizacionStorage() {
        // Actualizar inmediatamente
        setTimeout(() => {
            this._actualizarIndicadorStorage();
        }, 300);
        
        if (this._storageInterval) {
            clearInterval(this._storageInterval);
        }
        this._storageInterval = setInterval(() => {
            this._actualizarIndicadorStorage();
        }, 10000);
    }

    // ============================================================
    // CALCULAR TAMAÑO REAL USANDO EXPORTAR BACKUP
    // ============================================================

    async _calcularTamanioReal() {
        try {
            // 1. Obtener todos los datos mediante exportarBackup
            let data = {};
            let totalItems = 0;
            let totalSize = 0;
            
            try {
                data = await db.exportarBackup();
                // Calcular tamaño de los datos
                const jsonStr = JSON.stringify(data);
                totalSize = jsonStr.length * 2; // UTF-16
                
                // Contar items por store
                for (const [storeName, items] of Object.entries(data)) {
                    if (Array.isArray(items)) {
                        totalItems += items.length;
                    }
                }
            } catch (e) {
                console.warn('⚠️ Error exportando backup:', e);
                // Fallback: intentar obtener datos directamente
                try {
                    const stores = ['frases', 'palabras', 'historias', 'temas', 'progreso', 'usuarios', 'configuracion', 'chat', 'checkpoints'];
                    let backupData = {};
                    for (const store of stores) {
                        try {
                            const items = await db.getAll(store);
                            if (items && items.length > 0) {
                                backupData[store] = items;
                                totalItems += items.length;
                            }
                        } catch (e2) {
                            // Ignorar stores que no existen
                        }
                    }
                    const jsonStr = JSON.stringify(backupData);
                    totalSize = jsonStr.length * 2;
                } catch (e2) {
                    console.warn('⚠️ Error en fallback:', e2);
                }
            }
            
            // 2. Calcular localStorage
            let localSize = 0;
            let localItems = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const value = localStorage.getItem(key);
                    localSize += (key.length + (value ? value.length : 0)) * 2;
                    localItems++;
                }
            }
            
            // 3. Calcular porcentajes
            const idbPorcentaje = Math.min(100, Math.round((totalSize / this._STORAGE_LIMIT) * 100));
            const localPorcentaje = Math.min(100, Math.round((localSize / this._LOCAL_STORAGE_LIMIT) * 100));
            const totalUsado = totalSize + localSize;
            const totalTotal = this._STORAGE_LIMIT + this._LOCAL_STORAGE_LIMIT;
            const totalPorcentaje = Math.min(100, Math.round((totalUsado / totalTotal) * 100));
            
            // 4. Guardar datos
            this._storageData = {
                indexedDB: {
                    usado: totalSize,
                    total: this._STORAGE_LIMIT,
                    porcentaje: idbPorcentaje,
                    items: totalItems
                },
                localStorage: {
                    usado: localSize,
                    total: this._LOCAL_STORAGE_LIMIT,
                    porcentaje: localPorcentaje,
                    items: localItems
                },
                total: {
                    usado: totalUsado,
                    total: totalTotal,
                    porcentaje: totalPorcentaje
                }
            };
            
            console.log('📊 Almacenamiento calculado:', {
                indexedDB: `${(totalSize / 1024 / 1024).toFixed(2)} MB (${totalItems} items)`,
                localStorage: `${(localSize / 1024 / 1024).toFixed(2)} MB (${localItems} items)`,
                total: `${(totalUsado / 1024 / 1024).toFixed(2)} MB`
            });
            
            return this._storageData;
            
        } catch (error) {
            console.error('❌ Error calculando almacenamiento:', error);
            return this._storageData;
        }
    }

    // ============================================================
    // ACTUALIZAR INDICADOR DE ALMACENAMIENTO
    // ============================================================

    async _actualizarIndicadorStorage() {
        if (this._actualizandoStorage) return;
        this._actualizandoStorage = true;
        
        try {
            await this._calcularTamanioReal();
            this._actualizarBarrasStorage();
        } catch (e) {
            console.warn('⚠️ Error actualizando almacenamiento:', e);
        } finally {
            this._actualizandoStorage = false;
        }
    }

    // ============================================================
    // ACTUALIZAR BARRAS DE PROGRESO EN LA UI
    // ============================================================

    _actualizarBarrasStorage() {
        const idbBar = document.getElementById('storageIndexedDBBar');
        const idbText = document.getElementById('storageIndexedDBText');
        const idbInfo = document.getElementById('storageIndexedDBInfo');
        const localBar = document.getElementById('storageLocalBar');
        const localText = document.getElementById('storageLocalText');
        const localInfo = document.getElementById('storageLocalInfo');
        const totalBar = document.getElementById('storageTotalBar');
        const totalText = document.getElementById('storageTotalText');
        
        const idbUsadoMB = (this._storageData.indexedDB.usado / (1024 * 1024)).toFixed(2);
        const idbTotalMB = (this._storageData.indexedDB.total / (1024 * 1024)).toFixed(2);
        const localUsadoMB = (this._storageData.localStorage.usado / (1024 * 1024)).toFixed(2);
        const localTotalMB = (this._storageData.localStorage.total / (1024 * 1024)).toFixed(2);
        const totalUsadoMB = (this._storageData.total.usado / (1024 * 1024)).toFixed(2);
        const totalTotalMB = (this._storageData.total.total / (1024 * 1024)).toFixed(2);
        
        // Total
        if (totalBar) {
            const pct = Math.min(100, this._storageData.total.porcentaje || 0);
            totalBar.style.width = pct + '%';
            totalBar.style.background = this._getColorPorcentaje(pct);
        }
        if (totalText) {
            totalText.textContent = `${totalUsadoMB} MB / ${totalTotalMB} MB (${this._storageData.total.porcentaje || 0}%)`;
        }
        
        // IndexedDB
        if (idbBar) {
            const pct = Math.min(100, this._storageData.indexedDB.porcentaje || 0);
            idbBar.style.width = pct + '%';
            idbBar.style.background = this._getColorPorcentaje(pct);
        }
        if (idbText) {
            idbText.textContent = `${idbUsadoMB} MB / ${idbTotalMB} MB (${this._storageData.indexedDB.porcentaje || 0}%)`;
        }
        if (idbInfo) {
            idbInfo.textContent = `📦 ${this._storageData.indexedDB.items || 0} registros`;
        }
        
        // localStorage
        if (localBar) {
            const pct = Math.min(100, this._storageData.localStorage.porcentaje || 0);
            localBar.style.width = pct + '%';
            localBar.style.background = this._getColorPorcentaje(pct);
        }
        if (localText) {
            localText.textContent = `${localUsadoMB} MB / ${localTotalMB} MB (${this._storageData.localStorage.porcentaje || 0}%)`;
        }
        if (localInfo) {
            localInfo.textContent = `📄 ${this._storageData.localStorage.items || 0} items`;
        }
        
        // Actualizar también el footer
        const storageFooter = document.getElementById('storageFooter');
        if (storageFooter) {
            storageFooter.textContent = `💾 Almacenamiento: ${this._storageData.total.porcentaje || 0}%`;
        }
    }

    // ============================================================
    // OBTENER COLOR SEGÚN PORCENTAJE
    // ============================================================

    _getColorPorcentaje(porcentaje) {
        if (porcentaje < 50) return '#00B894';
        if (porcentaje < 70) return '#FDCB6E';
        if (porcentaje < 85) return '#E17055';
        return '#FF7675';
    }

    // ============================================================
    // RENDERIZAR PANEL PRINCIPAL CON BALANCEADOR
    // ============================================================

    _renderizarPanelConBackupMultiCapa() {
        if (!this._container || this._cargando) return;
        this._cargando = true;

        const modoSimplificado = pipeline?.modoSimplificado || false;
        const estadoCentinela = centinela?.getEstado?.() || {};
        const checkpoints = window._checkpointsCount || 0;

        const vigiaEstado = window.vigia?.getEstado?.() || { enLinea: false, modelo: 'openai/gpt-oss-120b' };
        const vigiaOnline = vigiaEstado.enLinea;

        // Obtener estado del balanceador para el header
        let balanceadorEstado = '⏳ Cargando...';
        let balanceadorColor = 'var(--gray)';
        let modeloActivo = 'N/A';
        try {
            if (window.balanceadorGroq) {
                const estado = window.balanceadorGroq.getEstado();
                modeloActivo = estado.modeloActivo || 'N/A';
                const modelosDisponibles = estado.modelosDisponibles || 0;
                const totalModelos = estado.modelosTotal || 0;
                const usaPrioritario = estado.usaPrioritario;
                balanceadorEstado = usaPrioritario ? 
                    `🟢 ${modeloActivo} (prioritario)` : 
                    `🟡 ${modeloActivo} (${modelosDisponibles}/${totalModelos})`;
                balanceadorColor = usaPrioritario ? 'var(--success)' : 'var(--warning)';
            }
        } catch (e) {}

        const idbData = this._storageData.indexedDB;
        const localData = this._storageData.localStorage;
        const totalData = this._storageData.total;

        let html = `
            <div class="tools-container" style="padding:0;width:100%;">

                <!-- HEADER -->
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:10px 18px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:12px;border:2px solid var(--primary)20;box-shadow:0 4px 20px rgba(108,92,231,0.08);width:100%;box-sizing:border-box;">
                    <div>
                        <h2 style="font-size:18px;font-weight:800;color:var(--dark);margin:0;">⚙️ Herramientas</h2>
                        <p style="font-size:12px;color:var(--gray);margin:2px 0 0;">Gestiona tu sistema, backups, checkpoints y diagnóstico</p>
                    </div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <span style="font-size:11px;color:var(--gray-light);background:var(--bg);padding:4px 12px;border-radius:12px;">
                            🟢 ${estadoCentinela.estadoSalud === 'optimo' ? 'Sistema Óptimo' : estadoCentinela.estadoSalud || 'Activo'}
                        </span>
                        <span style="font-size:11px;color:${vigiaOnline ? 'var(--success)' : 'var(--danger)'};background:var(--bg);padding:4px 12px;border-radius:12px;">
                            ${vigiaOnline ? '🟢 Vigía Online' : '🔴 Vigía Offline'}
                        </span>
                        <span style="font-size:11px;color:${balanceadorColor};background:var(--bg);padding:4px 12px;border-radius:12px;border:1px solid ${balanceadorColor};">
                            ⚖️ ${balanceadorEstado}
                        </span>
                    </div>
                </div>

                <!-- INDICADOR DE ALMACENAMIENTO -->
                <div style="background:var(--white);border-radius:12px;padding:16px 20px;box-shadow:var(--shadow);border:2px solid var(--primary)20;margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
                        <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">
                            💾 Almacenamiento
                            <span style="font-size:11px;font-weight:400;color:var(--gray-light);">(actualizado en tiempo real)</span>
                        </h3>
                        <button class="btn-secondary" onclick="window.UITools._actualizarIndicadorStorage()" style="padding:4px 12px;font-size:11px;background:var(--bg);border:1px solid var(--light);border-radius:6px;cursor:pointer;">
                            <i class="fas fa-sync"></i> Refrescar
                        </button>
                    </div>

                    <!-- TOTAL -->
                    <div style="margin-bottom:10px;">
                        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--gray);margin-bottom:2px;">
                            <span>📊 Total</span>
                            <span id="storageTotalText">${(totalData.usado / (1024 * 1024)).toFixed(2)} MB / ${(totalData.total / (1024 * 1024)).toFixed(2)} MB (${totalData.porcentaje}%)</span>
                        </div>
                        <div style="height:8px;background:var(--bg);border-radius:4px;overflow:hidden;border:1px solid var(--light);">
                            <div id="storageTotalBar" style="height:100%;width:${totalData.porcentaje}%;background:${this._getColorPorcentaje(totalData.porcentaje)};border-radius:4px;transition:width 0.8s ease;"></div>
                        </div>
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <!-- INDEXEDDB -->
                        <div style="background:var(--bg);border-radius:8px;padding:10px 14px;border:1px solid var(--light);">
                            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray);margin-bottom:2px;">
                                <span>🗄️ IndexedDB</span>
                                <span id="storageIndexedDBText">${(idbData.usado / (1024 * 1024)).toFixed(2)} MB / ${(idbData.total / (1024 * 1024)).toFixed(2)} MB (${idbData.porcentaje}%)</span>
                            </div>
                            <div style="height:6px;background:var(--white);border-radius:3px;overflow:hidden;">
                                <div id="storageIndexedDBBar" style="height:100%;width:${idbData.porcentaje}%;background:${this._getColorPorcentaje(idbData.porcentaje)};border-radius:3px;transition:width 0.8s ease;"></div>
                            </div>
                            <div style="font-size:9px;color:var(--gray-light);margin-top:2px;" id="storageIndexedDBInfo">
                                📦 ${idbData.items || 0} registros
                            </div>
                        </div>

                        <!-- LOCALSTORAGE -->
                        <div style="background:var(--bg);border-radius:8px;padding:10px 14px;border:1px solid var(--light);">
                            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray);margin-bottom:2px;">
                                <span>📁 localStorage</span>
                                <span id="storageLocalText">${(localData.usado / (1024 * 1024)).toFixed(2)} MB / ${(localData.total / (1024 * 1024)).toFixed(2)} MB (${localData.porcentaje}%)</span>
                            </div>
                            <div style="height:6px;background:var(--white);border-radius:3px;overflow:hidden;">
                                <div id="storageLocalBar" style="height:100%;width:${localData.porcentaje}%;background:${this._getColorPorcentaje(localData.porcentaje)};border-radius:3px;transition:width 0.8s ease;"></div>
                            </div>
                            <div style="font-size:9px;color:var(--gray-light);margin-top:2px;" id="storageLocalInfo">
                                📄 ${localData.items || 0} items
                            </div>
                        </div>
                    </div>
                </div>

                <!-- GRID DE HERRAMIENTAS -->
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px;width:100%;box-sizing:border-box;">

                    <!-- 1. BACKUP NEURO -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--primary);cursor:pointer;transition:all 0.3s;display:flex;flex-direction:column;height:100%;"
                         onclick="window.UITools._abrirBackupMultiCapa()"
                         onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'" 
                         onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-database"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">💾 Backup Neuro</h3>
                                <span style="font-size:11px;color:var(--gray-light);">Multi-capa · WebView compatible</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Protege tu progreso con el sistema de backup avanzado
                        </p>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📧 Correo</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📱 QR</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">☁️ Drive</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📄 Texto</span>
                        </div>
                        <div style="margin-top:8px;font-size:10px;color:var(--primary);font-weight:600;">
                            🖱️ Haz clic para abrir
                        </div>
                    </div>

                    <!-- 2. CHECKPOINTS -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--secondary);cursor:pointer;transition:all 0.3s;display:flex;flex-direction:column;height:100%;"
                         onclick="window.UITools._checkpoints()"
                         onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'" 
                         onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#00CEC9,#81ECEC);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-flag"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">🏁 Checkpoints</h3>
                                <span style="font-size:11px;color:var(--gray-light);">Restaurar puntos</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Guarda y restaura puntos de control de tu progreso
                        </p>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📌 Historial</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">🔄 Restaurar</span>
                        </div>
                    </div>

                    <!-- 3. GUARDAR CHECKPOINT -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--success);cursor:pointer;transition:all 0.3s;display:flex;flex-direction:column;height:100%;"
                         onclick="window.UITools._guardarCheckpoint()"
                         onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'" 
                         onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#00B894,#55EFC4);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-save"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">💾 Guardar Checkpoint</h3>
                                <span style="font-size:11px;color:var(--gray-light);">Crear punto manual</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Crea un punto de control manual de tu progreso actual
                        </p>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📌 Manual</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">💾 Instantáneo</span>
                        </div>
                    </div>

                    <!-- 4. DIAGNÓSTICO -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--warning);cursor:pointer;transition:all 0.3s;display:flex;flex-direction:column;height:100%;"
                         onclick="window.UITools._diagnostico()"
                         onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'" 
                         onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#FDCB6E,#F9CA24);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-stethoscope"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">🩺 Diagnóstico</h3>
                                <span style="font-size:11px;color:var(--gray-light);">Estado del sistema</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Diagnóstico completo del sistema neuroadaptativo
                        </p>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">🧠 Neuro</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📊 Estadísticas</span>
                        </div>
                    </div>

                    <!-- 5. ESTADO DEL SISTEMA -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--info);cursor:pointer;transition:all 0.3s;display:flex;flex-direction:column;height:100%;"
                         onclick="window.UITools._estado()"
                         onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'" 
                         onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#74B9FF,#0984E3);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">📊 Estado</h3>
                                <span style="font-size:11px;color:var(--gray-light);">Resumen rápido</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Resumen rápido del estado de tu sistema de aprendizaje
                        </p>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📈 Progreso</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">🧠 Neuro</span>
                        </div>
                    </div>

                    <!-- 6. RECONECTAR VIGÍA -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--secondary);cursor:pointer;transition:all 0.3s;display:flex;flex-direction:column;height:100%;"
                         onclick="window.UITools._reconectarVigia()"
                         onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'" 
                         onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#A29BFE,#6C5CE7);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-wifi"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">📡 Reconectar Vigía</h3>
                                <span style="font-size:11px;color:var(--gray-light);">Forzar reconexión</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Reconecta Vigía si está offline o tiene problemas
                        </p>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">🔄 Forzar</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📡 Conexión</span>
                        </div>
                    </div>

                    <!-- 7. MODO SIMPLIFICADO -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid ${modoSimplificado ? 'var(--success)' : 'var(--light)'};cursor:pointer;transition:all 0.3s;display:flex;flex-direction:column;height:100%;"
                         onclick="window.UITools._modoSimplificado()"
                         onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'" 
                         onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:${modoSimplificado ? 'linear-gradient(135deg,#00B894,#55EFC4)' : 'linear-gradient(135deg,#636E72,#2D3436)'};display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-bolt"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">⚡ Modo Simplificado</h3>
                                <span style="font-size:11px;color:var(--gray-light);" id="toolSimplifiedStatus">${modoSimplificado ? 'Activo' : 'Inactivo'}</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Reduce la carga cognitiva simplificando el estudio
                        </p>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                            <span style="font-size:10px;background:${modoSimplificado ? 'var(--success)15' : 'var(--bg)'};padding:2px 12px;border-radius:12px;color:${modoSimplificado ? 'var(--success)' : 'var(--gray)'};">${modoSimplificado ? '🟢 Activo' : '⚪ Inactivo'}</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">🧠 Menos fases</span>
                        </div>
                    </div>

                    <!-- 8. REINICIAR FASE -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--danger);cursor:pointer;transition:all 0.3s;display:flex;flex-direction:column;height:100%;"
                         onclick="window.UITools._reiniciarFase()"
                         onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'" 
                         onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#FF7675,#FD79A8);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-redo"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">🔄 Reiniciar Fase</h3>
                                <span style="font-size:11px;color:var(--gray-light);">Reiniciar progreso</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Reinicia la fase actual de estudio si te sientes estancado
                        </p>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">🔄 Reinicio</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📖 Fase actual</span>
                        </div>
                    </div>

                    <!-- 9. BALANCEADOR GROQ (NUEVO) -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--primary);cursor:pointer;transition:all 0.3s;display:flex;flex-direction:column;height:100%;border:2px solid var(--primary);"
                         onclick="window.UITools._mostrarEstadoBalanceador()"
                         onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(108,92,231,0.15)'" 
                         onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-balance-scale"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">⚖️ Balanceador Groq</h3>
                                <span style="font-size:11px;color:var(--gray-light);" id="balanceadorToolStatus">${balanceadorEstado}</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Gestiona automáticamente los modelos de Groq y su disponibilidad
                        </p>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">🔄 Balanceo</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📊 Estado</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">🎯 Prioridad OSS</span>
                        </div>
                        <div style="margin-top:6px;font-size:10px;color:${balanceadorColor};" id="balanceadorEstadoMini">
                            ${balanceadorEstado}
                        </div>
                    </div>

                    <!-- 10. LIMPIAR DATOS -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--danger);cursor:pointer;transition:all 0.3s;display:flex;flex-direction:column;height:100%;"
                         onclick="window.UITools._reset()"
                         onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'" 
                         onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#e74c3c,#c0392b);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-trash"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">🗑️ Limpiar Datos</h3>
                                <span style="font-size:11px;color:var(--gray-light);">Eliminar todo</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            ⚠️ Elimina TODOS los datos de la aplicación
                        </p>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                            <span style="font-size:10px;background:var(--danger)15;padding:2px 12px;border-radius:12px;color:var(--danger);font-weight:600;">⚠️ Peligroso</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">💾 Backup recomendado</span>
                        </div>
                    </div>
                </div>

                <!-- FOOTER -->
                <div style="display:flex;flex-wrap:wrap;gap:12px;padding:6px 14px;background:var(--bg);border-radius:8px;border:1px solid var(--light);font-size:10px;color:var(--gray-light);justify-content:space-between;align-items:center;width:100%;box-sizing:border-box;">
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        <span>🛡️ Centinela: ${estadoCentinela.estadoSalud || 'Activo'}</span>
                        <span>🧠 NeuroScore: ${document.getElementById('neuroRCN')?.textContent || '0.0'}</span>
                        <span>📊 Racha: ${document.getElementById('neuroRacha')?.textContent || '0'}</span>
                        <span>📌 Checkpoints: ${checkpoints}</span>
                        <span>${vigiaOnline ? '🟢' : '🔴'} Vigía: ${vigiaOnline ? 'Online' : 'Offline'}</span>
                        <span id="storageFooter">💾 Almacenamiento: ${this._storageData.total.porcentaje || 0}%</span>
                        <span>⚖️ ${modeloActivo}</span>
                    </div>
                    <div><span>⚙️ Tools v22.9</span></div>
                </div>
            </div>
        `;

        this._container.innerHTML = html;
        this._cargando = false;
        
        setTimeout(() => {
            this._actualizarBarrasStorage();
        }, 100);
    }

    // ============================================================
    // ABRIR BACKUP MULTI-CAPA
    // ============================================================

    _abrirBackupMultiCapa() {
        console.log('🔓 Abriendo Backup Multi-Capa...');
        
        let container = this._container || document.getElementById('toolsContent');
        
        if (!container) {
            const moduleDiv = document.getElementById('toolsModule');
            if (moduleDiv) {
                container = document.createElement('div');
                container.id = 'toolsContent';
                moduleDiv.appendChild(container);
                this._container = container;
            }
        }
        
        if (!window.UIBackup) {
            console.error('❌ UIBackup no está disponible');
            this._core?.mostrarToast('❌ Sistema de backup no disponible', 'error');
            return;
        }
        
        if (typeof window.UIBackup.renderizar !== 'function') {
            console.error('❌ UIBackup.renderizar no es una función');
            this._core?.mostrarToast('❌ Error en el sistema de backup', 'error');
            return;
        }
        
        try {
            window.UIBackup.renderizar(container);
            this._core?.mostrarToast('✅ Backup multi-capa abierto', 'success');
        } catch (e) {
            console.error('❌ Error renderizando backup:', e);
            this._core?.mostrarToast('❌ Error al abrir backup: ' + e.message, 'error');
        }
    }

    // ============================================================
    // MÉTODOS DE LAS HERRAMIENTAS
    // ============================================================

    async _checkpoints() {
        const checkpoints = await db.getAll('checkpoints');
        window._checkpointsCount = checkpoints.length;
        
        if (checkpoints.length === 0) {
            await this._core.alert('📌 No hay checkpoints guardados.\n\nUsa "Guardar Checkpoint" para crear uno.', 'Info');
            return;
        }
        
        let mensaje = '📌 CHECKPOINTS DISPONIBLES:\n\n';
        for (let i = checkpoints.length - 1; i >= Math.max(0, checkpoints.length - 10); i--) {
            const cp = checkpoints[i];
            const fecha = new Date(cp.timestamp).toLocaleString();
            mensaje += `• ${fecha} - Fase ${cp.fase || '?'}\n`;
        }
        
        if (checkpoints.length > 10) {
            mensaje += `\n... y ${checkpoints.length - 10} más.`;
        }
        
        mensaje += '\n\n¿Restaurar el último checkpoint?';
        
        if (await this._core.confirm(mensaje, 'Checkpoints')) {
            const ultimo = checkpoints[checkpoints.length - 1];
            if (ultimo.datos) {
                await db.importarBackup(ultimo.datos);
                this._core.mostrarToast('✅ Checkpoint restaurado correctamente', 'success');
                setTimeout(() => location.reload(), 1500);
            }
        }
    }

    async _guardarCheckpoint() {
        try {
            const data = await db.exportarBackup();
            const estado = pipeline.getEstado ? pipeline.getEstado() : { faseActual: 1 };
            await db.guardarCheckpoint({
                timestamp: Date.now(),
                fase: estado.faseActual || 1,
                estado: 'completado',
                datos: data
            });
            window._checkpointsCount = (window._checkpointsCount || 0) + 1;
            this._core.mostrarToast('✅ Checkpoint guardado correctamente', 'success');
            this._renderizarPanelConBackupMultiCapa();
        } catch (error) {
            await this._core.alert('❌ Error: ' + error.message, 'Error');
        }
    }

    async _diagnostico() {
        try {
            const diag = await centinela.diagnosticar();
            const neuroDiag = await pipeline.obtenerDiagnosticoNeuro();
            const usuario = await db.getUsuario();
            const nivel = usuario?.idiomasObjetivo?.[0]?.nivel || 'A1';
            
            await this._actualizarIndicadorStorage();
            
            let mensaje = '🩺 DIAGNÓSTICO NEUROADAPTATIVO\n\n';
            mensaje += '🏆 Nivel: ' + nivel + '\n';
            mensaje += '🗄️ DB: ' + (diag.sistema && diag.sistema.db ? '✅' : '❌') + '\n';
            mensaje += '🟢 Vigía: ' + (diag.sistema && diag.sistema.vigia ? '🟢 Online' : '🔴 Offline') + '\n';
            mensaje += '🛡️ Centinela: ' + (diag.sistema && diag.sistema.estadoSalud ? diag.sistema.estadoSalud : 'Activo') + (diag.sistema && diag.sistema.modoOffline ? ' (Offline)' : '') + '\n\n';
            mensaje += '📊 DATOS:\n';
            mensaje += '- Frases: ' + (diag.datos ? diag.datos.frases : 0) + '\n';
            mensaje += '- Palabras: ' + (diag.datos ? diag.datos.palabras : 0) + '\n';
            mensaje += '- Historias: ' + (diag.datos ? diag.datos.historias : 0) + '\n\n';
            mensaje += '🧠 NEURO:\n';
            mensaje += '- RCN Promedio: ' + (neuroDiag.rcnPromedio || 0) + '\n';
            mensaje += '- Eficiencia: ' + (neuroDiag.eficiencia || 0) + '%\n';
            mensaje += '- NeuroScore: ' + (neuroDiag.neuroScore || 0) + '%';
            
            mensaje += '\n\n💾 ALMACENAMIENTO:\n';
            mensaje += `- IndexedDB: ${(this._storageData.indexedDB.usado / (1024 * 1024)).toFixed(2)} MB (${this._storageData.indexedDB.porcentaje || 0}%) - ${this._storageData.indexedDB.items || 0} registros\n`;
            mensaje += `- localStorage: ${(this._storageData.localStorage.usado / (1024 * 1024)).toFixed(2)} MB (${this._storageData.localStorage.porcentaje || 0}%) - ${this._storageData.localStorage.items || 0} items\n`;
            mensaje += `- Total: ${(this._storageData.total.usado / (1024 * 1024)).toFixed(2)} MB (${this._storageData.total.porcentaje || 0}%)`;
            
            await this._core.alert(mensaje, '🩺 Diagnóstico Neuro');
        } catch (error) {
            await this._core.alert('❌ Error: ' + error.message, 'Error');
        }
    }

    async _estado() {
        try {
            const usuario = await db.getUsuario();
            const stats = await db.obtenerEstadisticasNeuro();
            const historias = await db.obtenerHistorias();
            const temas = await db.obtenerTemas();
            const estadoVigia = vigia.getEstado ? vigia.getEstado() : { enLinea: false };
            const estadoPipeline = pipeline.getEstado ? pipeline.getEstado() : { faseActual: 1, progreso: 0 };
            const nivel = usuario?.idiomasObjetivo?.[0]?.nivel || 'A1';
            
            // Obtener estado del balanceador
            let balanceadorInfo = 'No disponible';
            try {
                if (window.balanceadorGroq) {
                    const estado = window.balanceadorGroq.getEstado();
                    balanceadorInfo = `${estado.modeloActivo} (${estado.modelosDisponibles}/${estado.modelosTotal})`;
                }
            } catch (e) {}
            
            await this._actualizarIndicadorStorage();
            
            let mensaje = '📊 ESTADO DEL SISTEMA\n';
            mensaje += '='.repeat(30) + '\n\n';
            mensaje += '👤 Usuario: ' + (usuario ? usuario.nombre : 'No registrado') + '\n';
            mensaje += '🏆 Nivel: ' + nivel + '\n';
            mensaje += '📚 Historias: ' + historias.length + '\n';
            mensaje += '📂 Temas: ' + temas.length + '\n';
            mensaje += '📝 Frases: ' + stats.totalFrases + '\n';
            mensaje += '📖 Palabras: ' + stats.totalPalabras + '\n';
            mensaje += '📈 Progreso: ' + stats.progreso + '%\n';
            mensaje += '🧠 NeuroScore: ' + stats.neuroScore + '%\n';
            mensaje += '🎯 Fase Actual: ' + estadoPipeline.faseActual + '\n';
            mensaje += '🟢 Vigía: ' + (estadoVigia.enLinea ? 'Online' : 'Offline') + '\n';
            mensaje += '📡 Modelo: ' + (estadoVigia.modelo || 'openai/gpt-oss-120b') + '\n';
            mensaje += '⚖️ Balanceador: ' + balanceadorInfo + '\n';
            mensaje += '🧩 Versión: 22.9\n';
            
            mensaje += '\n💾 ALMACENAMIENTO:\n';
            mensaje += `- IndexedDB: ${(this._storageData.indexedDB.usado / (1024 * 1024)).toFixed(2)} MB (${this._storageData.indexedDB.porcentaje || 0}%) - ${this._storageData.indexedDB.items || 0} registros\n`;
            mensaje += `- localStorage: ${(this._storageData.localStorage.usado / (1024 * 1024)).toFixed(2)} MB (${this._storageData.localStorage.porcentaje || 0}%) - ${this._storageData.localStorage.items || 0} items\n`;
            mensaje += `- Total: ${(this._storageData.total.usado / (1024 * 1024)).toFixed(2)} MB (${this._storageData.total.porcentaje || 0}%)`;
            
            await this._core.alert(mensaje, '📊 Estado del Sistema');
        } catch (error) {
            await this._core.alert('❌ Error: ' + error.message, 'Error');
        }
    }

    async _reconectarVigia() {
        if (vigia && vigia.reconectarManual) {
            this._core.mostrarToast('🔄 Intentando reconectar Vigía...', 'info');
            const resultado = await vigia.reconectarManual();
            if (resultado.exito) {
                this._core.mostrarToast('✅ ' + resultado.mensaje, 'success');
                setTimeout(() => this._renderizarPanelConBackupMultiCapa(), 500);
            } else {
                this._core.mostrarToast('❌ ' + resultado.mensaje, 'error');
            }
        } else {
            this._core.mostrarToast('❌ Vigía no disponible', 'error');
        }
    }

    _modoSimplificado() {
        if (pipeline && pipeline.toggleModoSimplificado) {
            pipeline.toggleModoSimplificado();
            this._renderizarPanelConBackupMultiCapa();
            this._core.mostrarToast(pipeline.modoSimplificado ? '⚡ Modo Simplificado Activado' : '📚 Modo Normal Activado', 'info');
        }
    }

    async _reiniciarFase() {
        const confirmar = await this._core.confirm(
            '⚠️ ¿Reiniciar la fase actual?\n\nPerderás el progreso de la fase actual.\nLas frases ya completadas se mantendrán.\n\n¿Continuar?',
            'Reiniciar Fase'
        );
        if (confirmar && pipeline && pipeline.reiniciarFase) {
            await pipeline.reiniciarFase();
            this._core.mostrarToast('🔄 Fase reiniciada', 'warning');
        }
    }

    async _reset() {
        const confirmar = await this._core.confirm(
            '⚠️ ⚠️ ⚠️ ¡ATENCIÓN! ⚠️ ⚠️ ⚠️\n\n' +
            'Vas a eliminar TODOS los datos de la aplicación:\n' +
            '• Usuario y perfil\n' +
            '• Frases, palabras e historias\n' +
            '• Progreso y niveles\n' +
            '• Checkpoints y backups\n' +
            '• Configuración y preferencias\n\n' +
            '⚠️ Esta acción NO se puede deshacer.\n\n' +
            '💡 Se recomienda hacer un Backup antes.\n\n' +
            '¿Estás SEGURO de que quieres continuar?',
            '⚠️ ELIMINAR TODOS LOS DATOS'
        );
        
        if (confirmar) {
            const segundaConfirmacion = await this._core.confirm(
                '🔴 ÚLTIMA ADVERTENCIA 🔴\n\n' +
                '¿Estás ABSOLUTAMENTE SEGURO?\n\n' +
                'Esta acción es IRREVERSIBLE.\n' +
                'Todos tus datos de aprendizaje se perderán para siempre.\n\n' +
                'Escribe "ELIMINAR" para confirmar:',
                'CONFIRMACIÓN FINAL'
            );
            
            if (segundaConfirmacion) {
                try {
                    await db.limpiarTodo();
                    indexedDB.deleteDatabase('PipelineDB');
                    localStorage.clear();
                    this._core.mostrarToast('🗑️ Todos los datos eliminados. Recargando...', 'warning');
                    setTimeout(() => { location.reload(); }, 2000);
                } catch (error) {
                    this._core.mostrarToast('❌ Error eliminando datos: ' + error.message, 'error');
                }
            }
        }
    }

    // ============================================================
    // MOSTRAR ESTADO DEL BALANCEADOR DE CARGA
    // ============================================================

    async _mostrarEstadoBalanceador() {
        const core = this._core;
        
        try {
            // Verificar que el balanceador exista
            if (!window.balanceadorGroq) {
                await core.alert(
                    '❌ El balanceador de carga no está disponible.\n\n' +
                    'Asegúrate de que el script "balanceadorGroq.js" esté cargado correctamente.',
                    '⚠️ Balanceador no disponible'
                );
                return;
            }

            const estado = window.balanceadorGroq.getEstado();
            const modeloActivo = estado.modeloActivo || 'N/A';
            const modeloPrioritario = estado.modeloPrioritario || 'openai/gpt-oss-120b';
            const modelosDisponibles = estado.modelosDisponibles || 0;
            const modelosTotal = estado.modelosTotal || 0;
            const usaPrioritario = estado.usaPrioritario;

            // Obtener información detallada de cada modelo
            let detallesModelos = '';
            if (window.balanceadorGroq._modelos) {
                for (const modelo of window.balanceadorGroq._modelos) {
                    const info = window.balanceadorGroq.getEstadoModelo(modelo);
                    if (info) {
                        const disponible = info.disponible ? '🟢' : '🔴';
                        const tokens = info.tokensDisponibles || 0;
                        const fallos = info.fallosConsecutivos || 0;
                        const esActivo = modelo === modeloActivo ? ' ✅ ACTUAL' : '';
                        const esPrioritario = modelo === modeloPrioritario ? ' ⭐ PRIORITARIO' : '';
                        detallesModelos += `  ${disponible} ${modelo}${esActivo}${esPrioritario}\n`;
                        detallesModelos += `     Tokens: ${tokens} · Fallos: ${fallos}\n`;
                    }
                }
            }

            const mensaje = `⚖️ **ESTADO DEL BALANCEADOR GROQ**\n\n` +
                `📌 **Modelo activo:** ${modeloActivo}\n` +
                `⭐ **Modelo prioritario:** ${modeloPrioritario}\n` +
                `📊 **Disponibles:** ${modelosDisponibles}/${modelosTotal} modelos\n` +
                `🎯 **Usando prioritario:** ${usaPrioritario ? '✅ Sí' : '🔴 No (balanceado)'}\n\n` +
                `📋 **Detalle de modelos:**\n${detallesModelos || '  No hay información de modelos'}\n\n` +
                `💡 **Funcionamiento:**\n` +
                `• Siempre intenta usar el modelo prioritario (OSS)\n` +
                `• Si está agotado, cambia automáticamente a otro modelo\n` +
                `• Vuelve al prioritario tan pronto como esté disponible\n` +
                `• Verifica el estado de los modelos cada 30 segundos\n` +
                `• Reintenta el prioritario cada 60 segundos\n\n` +
                `🔧 **Recomendaciones:**\n` +
                `• Si ves un modelo con 🔴, puede estar agotado o con errores\n` +
                `• El balanceador cambiará automáticamente al siguiente disponible\n` +
                `• Puedes forzar una reconexión desde "Reconectar Vigía"`;

            await core.alert(mensaje, '⚖️ Balanceador de Carga Groq');

        } catch (error) {
            console.error('❌ Error mostrando estado del balanceador:', error);
            core.mostrarToast('❌ Error al obtener el estado del balanceador', 'error');
        }
    }

    // ============================================================
    // MÉTODOS LEGACY
    // ============================================================

    async _handleBackup() { 
        this._abrirBackupMultiCapa();
    }
    async _handleCheckpoints() { this._checkpoints(); }
    async _handleGenerarCheckpoint() { this._guardarCheckpoint(); }
    async _handleDiagnostic() { this._diagnostico(); }
    async _handleEstadoSistema() { this._estado(); }
    async _handleReconectarVigia() { this._reconectarVigia(); }
    async _handleModoSimplificado() { this._modoSimplificado(); }
    async _handleReiniciarFase() { this._reiniciarFase(); }
    async _handleReset() { this._reset(); }

    destroy() {
        if (this._storageInterval) {
            clearInterval(this._storageInterval);
            this._storageInterval = null;
        }
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UITools = new UITools();
console.log('✅ UITools v22.9 - COMPLETO CON BALANCEADOR DE CARGA GROQ');
console.log('  ⚖️ Tarjeta "Balanceador Groq" en Herramientas');
console.log('  📊 Método _mostrarEstadoBalanceador()');
console.log('  💾 Cálculo real de almacenamiento con exportar');
console.log('  📊 Muestra número de registros/items');
console.log('  🔄 Actualización en tiempo real cada 10 segundos');
console.log('  🎯 Todas las funcionalidades originales preservadas');