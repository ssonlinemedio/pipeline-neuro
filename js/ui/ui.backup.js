// ============================================================
// UI BACKUP v2.5 - SISTEMA DE BACKUP COMPLETO CON GESTIÓN
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
        this._MAX_BACKUPS = 15; // Límite máximo de backups
        
        // Configuración de Google Drive (opcional)
        this._GOOGLE_CLIENT_ID = null;
        this._GOOGLE_API_KEY = null;
        this._SCOPES = 'https://www.googleapis.com/auth/drive.file';
        this._gapiInitialized = false;
        this._gapiLoaded = false;
        this._tokenClient = null;
        this._accessToken = null;
        this._googleDriveEnabled = false;
    }

    async init(core) {
        this._core = core;
        // Cargar límite configurado
        const savedLimit = localStorage.getItem('pipeline_backup_max_limit');
        if (savedLimit) {
            this._MAX_BACKUPS = parseInt(savedLimit) || 15;
        }
        console.log('✅ UIBackup v2.5 iniciado (Google Drive desactivado por defecto)');
        return this;
    }

    // ============================================================
    // CARGA DE LIBRERÍAS GOOGLE (SOLO BAJO DEMANDA)
    // ============================================================

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

    // ============================================================
    // RENDERIZAR PANEL DE BACKUP
    // ============================================================

    renderizar(container) {
        this._container = container;
        this._renderizarPanel();
    }

    _renderizarPanel() {
        if (!this._container) return;

        const backups = this._obtenerListaBackups();
        const totalBackups = backups.length;
        const espacioTotal = Math.round(backups.reduce((acc, b) => acc + (b.tamano || 0), 0) / 1024);

        this._container.innerHTML = `
            <div class="backup-container" style="padding:0;width:100%;">

                <!-- HEADER -->
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding:10px 18px;background:linear-gradient(135deg, var(--primary)06, var(--secondary)06);border-radius:12px;border:2px solid var(--primary)20;box-shadow:0 4px 20px rgba(108,92,231,0.08);width:100%;box-sizing:border-box;">
                    <div>
                        <h2 style="font-size:18px;font-weight:800;color:var(--dark);margin:0;">💾 Sistema de Backup</h2>
                        <p style="font-size:12px;color:var(--gray);margin:2px 0 0;">Protege tu progreso en cualquier dispositivo</p>
                    </div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <span style="font-size:11px;color:var(--gray-light);background:var(--bg);padding:4px 12px;border-radius:12px;">
                            💾 ${totalBackups} backups · ${espacioTotal} KB
                        </span>
                        <span style="font-size:11px;color:var(--gray-light);background:var(--bg);padding:4px 12px;border-radius:12px;">
                            ${this._accessToken ? '🟢 Google Drive Conectado' : '⚪ Google Drive Desconectado'}
                        </span>
                    </div>
                </div>

                <!-- OPCIONES DE BACKUP -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;width:100%;box-sizing:border-box;">

                    <!-- 1. BACKUP LOCAL -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--primary);transition:all 0.3s;display:flex;flex-direction:column;">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#6C5CE7,#A29BFE);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-database"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">📦 Backup Local</h3>
                                <span style="font-size:11px;color:var(--gray-light);">Siempre disponible</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Guarda tus datos en el dispositivo. Los backups locales se almacenan en IndexedDB.
                        </p>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
                            <button class="btn-primary" onclick="window.UIBackup._generarBackupLocal()" style="padding:6px 16px;font-size:12px;cursor:pointer;">
                                <i class="fas fa-save"></i> Generar
                            </button>
                            <button class="btn-secondary" onclick="window.UIBackup._restaurarBackupLocal()" style="padding:6px 16px;font-size:12px;cursor:pointer;">
                                <i class="fas fa-undo"></i> Restaurar
                            </button>
                            <span style="font-size:10px;color:var(--gray-light);display:flex;align-items:center;">
                                💾 ${totalBackups} backups
                            </span>
                        </div>
                    </div>

                    <!-- 2. BACKUP POR CORREO (RECOMENDADO PARA WEBVIEW) -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--success);transition:all 0.3s;display:flex;flex-direction:column;cursor:pointer;" 
                         onclick="window.UIBackup._abrirBackupEmail()"
                         onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'" 
                         onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#00B894,#55EFC4);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">📧 Backup por Correo</h3>
                                <span style="font-size:11px;color:var(--gray-light);">⭐ Recomendado para WebView</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Envía tu backup a tu correo electrónico. La mejor opción para móviles y WebView.
                        </p>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📧 Funciona en WebView</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">🔒 Seguro</span>
                        </div>
                        <div style="margin-top:8px;font-size:10px;color:var(--success);font-weight:600;">
                            🖱️ Haz clic para abrir
                        </div>
                    </div>

                    <!-- 3. BACKUP GOOGLE DRIVE (OPCIONAL) -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid ${this._accessToken ? 'var(--success)' : 'var(--warning)'};transition:all 0.3s;display:flex;flex-direction:column;">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:${this._accessToken ? 'linear-gradient(135deg,#00B894,#55EFC4)' : 'linear-gradient(135deg,#FDCB6E,#F9CA24)'};display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fab fa-google-drive"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">☁️ Google Drive</h3>
                                <span style="font-size:11px;color:var(--gray-light);">${this._accessToken ? '✅ Conectado' : '🔴 Desconectado'}</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Guarda tus backups en la nube de Google. Accesible desde cualquier dispositivo.
                        </p>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
                            ${!this._accessToken ? `
                                <button class="btn-primary" onclick="window.UIBackup._conectarGoogleDrive()" style="padding:6px 16px;font-size:12px;background:linear-gradient(135deg,#4285F4,#34A853);cursor:pointer;">
                                    <i class="fab fa-google"></i> Conectar
                                </button>
                                <span style="font-size:9px;color:var(--gray-light);">⚠️ Requiere credenciales</span>
                            ` : `
                                <button class="btn-primary" onclick="window.UIBackup._backupGoogleDrive()" style="padding:6px 16px;font-size:12px;cursor:pointer;">
                                    <i class="fas fa-cloud-upload-alt"></i> Subir
                                </button>
                                <button class="btn-secondary" onclick="window.UIBackup._restaurarGoogleDrive()" style="padding:6px 16px;font-size:12px;cursor:pointer;">
                                    <i class="fas fa-cloud-download-alt"></i> Restaurar
                                </button>
                            `}
                            <span style="font-size:10px;color:${this._accessToken ? 'var(--success)' : 'var(--gray-light)'};display:flex;align-items:center;">
                                ${this._accessToken ? '🔗 Conectado' : '🔴 No conectado'}
                            </span>
                        </div>
                    </div>

                    <!-- 4. BACKUP CÓDIGO QR -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--secondary);transition:all 0.3s;display:flex;flex-direction:column;cursor:pointer;" 
                         onclick="window.UIBackup._generarQR()"
                         onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'" 
                         onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#00CEC9,#81ECEC);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-qrcode"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">📱 Código QR</h3>
                                <span style="font-size:11px;color:var(--gray-light);">Transferencia rápida</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Genera un código QR con tu backup para transferirlo a otro dispositivo.
                        </p>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📱 Sin internet</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">⚡ Rápido</span>
                        </div>
                        <div style="margin-top:8px;font-size:10px;color:var(--secondary);font-weight:600;">
                            🖱️ Haz clic para generar
                        </div>
                    </div>

                    <!-- 5. BACKUP TEXTO (COPY/PASTE) -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--warning);transition:all 0.3s;display:flex;flex-direction:column;">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#FDCB6E,#F9CA24);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-file-alt"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">📄 Backup Texto</h3>
                                <span style="font-size:11px;color:var(--gray-light);">Copy/Paste</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Copia tu backup como texto para pegarlo en otra aplicación o dispositivo.
                        </p>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
                            <button class="btn-primary" onclick="window.UIBackup._abrirBackupTexto()" style="padding:6px 16px;font-size:12px;cursor:pointer;">
                                <i class="fas fa-file-export"></i> Exportar Texto
                            </button>
                            <button class="btn-secondary" onclick="window.UIBackup._restaurarBackupTexto()" style="padding:6px 16px;font-size:12px;cursor:pointer;background:var(--success);color:white;border:none;border-radius:6px;">
                                <i class="fas fa-file-import"></i> Restaurar desde Texto
                            </button>
                            <span style="font-size:10px;color:var(--gray-light);display:flex;align-items:center;">
                                📋 Universal
                            </span>
                        </div>
                    </div>

                    <!-- 6. BACKUP AUTOMÁTICO -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--info);transition:all 0.3s;display:flex;flex-direction:column;">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#74B9FF,#0984E3);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">🤖 Backup Automático</h3>
                                <span style="font-size:11px;color:var(--gray-light);">Configurable</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Configura backups automáticos para no perder tu progreso.
                        </p>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
                            <button class="btn-primary" onclick="window.UIBackup._configurarBackupAutomatico()" style="padding:6px 16px;font-size:12px;cursor:pointer;">
                                <i class="fas fa-cog"></i> Configurar
                            </button>
                            <span style="font-size:10px;color:var(--gray-light);display:flex;align-items:center;">
                                ${localStorage.getItem('pipeline_backup_auto') ? '✅ Activado' : '⏸️ Desactivado'}
                            </span>
                        </div>
                        <div style="margin-top:4px;font-size:9px;color:var(--gray-light);">
                            ${localStorage.getItem('pipeline_backup_auto_frecuencia') ? `📅 ${localStorage.getItem('pipeline_backup_auto_frecuencia')}` : ''}
                            ${localStorage.getItem('pipeline_ultimo_backup_auto') ? ` · Último: ${new Date(parseInt(localStorage.getItem('pipeline_ultimo_backup_auto'))).toLocaleString()}` : ''}
                        </div>
                    </div>

                    <!-- 🔥 7. GESTIÓN DE BACKUPS (NUEVO) -->
                    <div class="dash-card" style="background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);border-left:4px solid var(--danger);transition:all 0.3s;display:flex;flex-direction:column;cursor:pointer;" 
                         onclick="window.UIBackup._abrirGestorBackups()"
                         onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'" 
                         onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow)'">
                        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                            <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#FF7675,#FD79A8);display:flex;align-items:center;justify-content:center;font-size:18px;color:white;flex-shrink:0;">
                                <i class="fas fa-trash-alt"></i>
                            </div>
                            <div>
                                <h3 style="font-size:14px;font-weight:700;color:var(--dark);margin:0;">🗑️ Gestionar Backups</h3>
                                <span style="font-size:11px;color:var(--gray-light);">${totalBackups} backups · ${espacioTotal} KB</span>
                            </div>
                        </div>
                        <p style="font-size:12px;color:var(--gray);margin:0 0 8px 0;line-height:1.4;flex:1;">
                            Ver, eliminar y gestionar tus backups antiguos para liberar espacio.
                        </p>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">📋 Listar</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">🗑️ Eliminar</span>
                            <span style="font-size:10px;background:var(--bg);padding:2px 12px;border-radius:12px;color:var(--gray);">⚙️ Límite</span>
                        </div>
                        <div style="margin-top:8px;font-size:10px;color:var(--danger);font-weight:600;">
                            🖱️ Haz clic para gestionar
                        </div>
                    </div>
                </div>

                <!-- FOOTER -->
                <div style="display:flex;flex-wrap:wrap;gap:12px;padding:6px 14px;margin-top:16px;background:var(--bg);border-radius:8px;border:1px solid var(--light);font-size:10px;color:var(--gray-light);justify-content:space-between;align-items:center;width:100%;box-sizing:border-box;">
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        <span>💾 Backups: ${totalBackups}</span>
                        <span>📊 Espacio: ${espacioTotal} KB</span>
                        <span>📅 Último backup: ${localStorage.getItem('pipeline_ultimo_backup') || 'Nunca'}</span>
                        <span>${this._accessToken ? '🔗 Google Drive: Conectado' : '🔗 Google Drive: Desconectado'}</span>
                        <span>📌 Límite: ${this._MAX_BACKUPS}</span>
                    </div>
                    <div><span>⚙️ Backup v2.5</span></div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // CONTAR BACKUPS LOCALES
    // ============================================================

    _contarBackupsLocales() {
        try {
            const backups = JSON.parse(localStorage.getItem('pipeline_backups_locales') || '[]');
            return backups.length;
        } catch (e) {
            return 0;
        }
    }

    // ============================================================
    // OBTENER LISTA DE BACKUPS CON INFORMACIÓN
    // ============================================================

    _obtenerListaBackups() {
        try {
            const backups = JSON.parse(localStorage.getItem('pipeline_backups_locales') || '[]');
            return backups.map((b, i) => ({
                ...b,
                index: i,
                fechaLegible: new Date(b.fecha).toLocaleString(),
                tamanoKB: Math.round((b.tamano || 0) / 1024),
                esAutomatico: b.automatico || false
            }));
        } catch (e) {
            return [];
        }
    }

    // ============================================================
    // GENERAR BACKUP LOCAL
    // ============================================================

    async _generarBackupLocal(esAutomatico = false) {
        try {
            if (!esAutomatico) {
                this._core.mostrarToast('📦 Generando backup local...', 'info');
            }

            const data = await db.exportarBackup();
            const usuario = await db.getUsuario();
            const backup = {
                id: Date.now(),
                fecha: new Date().toISOString(),
                data: data,
                usuario: usuario,
                idiomaActivo: gestorIdiomas?.getIdiomaActivo() || 'es',
                version: '2.5',
                tamano: JSON.stringify(data).length,
                automatico: esAutomatico
            };

            let backups = JSON.parse(localStorage.getItem('pipeline_backups_locales') || '[]');
            
            // 🔥 ELIMINAR BACKUPS DUPLICADOS (misma fecha)
            backups = backups.filter(b => b.fecha !== backup.fecha);
            
            backups.push(backup);
            
            // 🔥 ORDENAR POR FECHA (más reciente primero)
            backups.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            
            // 🔥 APLICAR LÍMITE MÁXIMO
            const maxBackups = esAutomatico ? this._MAX_BACKUPS : this._MAX_BACKUPS;
            while (backups.length > maxBackups) {
                const eliminado = backups.pop();
                console.log(`🗑️ Backup antiguo eliminado: ${new Date(eliminado.fecha).toLocaleString()}`);
            }
            
            localStorage.setItem('pipeline_backups_locales', JSON.stringify(backups));
            localStorage.setItem('pipeline_ultimo_backup', new Date().toLocaleString());

            if (!esAutomatico) {
                this._core.mostrarToast(`✅ Backup guardado (${backups.length}/${maxBackups} backups)`, 'success');
                this._renderizarPanel();
            } else {
                console.log(`💾 Backup automático guardado (${backups.length}/${maxBackups} backups)`);
            }

            return true;

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
        const backups = this._obtenerListaBackups();

        if (backups.length === 0) {
            this._core.mostrarToast('❌ No hay backups locales disponibles', 'error');
            return;
        }

        let mensaje = '📦 Selecciona un backup para restaurar:\n\n';
        backups.forEach((b, i) => {
            const auto = b.esAutomatico ? ' (automático)' : '';
            mensaje += `${i + 1}. ${b.fechaLegible} (${b.tamanoKB} KB)${auto}\n`;
        });

        const seleccion = await this._core.prompt(mensaje, '1', 'Número del backup...', '📦 Restaurar Backup');
        if (!seleccion) return;

        const idx = parseInt(seleccion) - 1;
        if (isNaN(idx) || idx < 0 || idx >= backups.length) {
            this._core.mostrarToast('❌ Selección inválida', 'error');
            return;
        }

        const confirmar = await this._core.confirm(
            '⚠️ ¿Restaurar backup del ' + backups[idx].fechaLegible + '?\n\n' +
            'Esto SOBRESCRIBIRÁ todos tus datos actuales.\n\n¿Continuar?',
            '⚠️ Restaurar Backup'
        );

        if (!confirmar) return;

        try {
            this._core.mostrarToast('🔄 Restaurando backup...', 'info');

            await db.importarBackup(backups[idx].data);

            if (backups[idx].usuario) {
                await db.guardarUsuario(backups[idx].usuario);
            }

            if (backups[idx].idiomaActivo) {
                localStorage.setItem('pipeline_idioma_activo', backups[idx].idiomaActivo);
            }

            this._core.mostrarToast('✅ Backup restaurado correctamente', 'success');
            
            setTimeout(() => {
                location.reload();
            }, 1500);

        } catch (error) {
            console.error('❌ Error restaurando backup:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // BACKUP POR CORREO
    // ============================================================

    async _abrirBackupEmail() {
        try {
            this._core.mostrarToast('📧 Preparando backup para correo...', 'info');

            const data = await db.exportarBackup();
            const usuario = await db.getUsuario();
            const backup = {
                fecha: new Date().toISOString(),
                data: data,
                usuario: usuario,
                idiomaActivo: gestorIdiomas?.getIdiomaActivo() || 'es',
                version: '2.5'
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

        const subject = encodeURIComponent(`📚 Pipeline Neuro - Backup ${fecha}`);
        const body = encodeURIComponent(
            `Hola ${nombreUsuario},\n\n` +
            `Aquí tienes tu backup de Pipeline Neuro del ${fecha}.\n\n` +
            `📊 Resumen:\n` +
            `- Frases: ${backup.data.frases?.length || 0}\n` +
            `- Palabras: ${backup.data.palabras?.length || 0}\n` +
            `- Historias: ${backup.data.historias?.length || 0}\n` +
            `- Temas: ${backup.data.temas?.length || 0}\n` +
            `- Progreso: ${backup.data.progreso?.length || 0}\n\n` +
            `📎 DATOS DEL BACKUP:\n\n` +
            `${jsonStr}\n\n` +
            `📌 Para restaurar:\n` +
            `1. Abre Pipeline Neuro\n` +
            `2. Ve a Herramientas > Backup\n` +
            `3. Usa "Restaurar desde Texto" y pega todo el texto del backup\n\n` +
            `¡Mantén tus datos seguros! 🧠\n\n` +
            `-- Pipeline Neuro v2.5`
        );

        const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

        const opciones = [
            { id: 'abrir', label: '📧 Abrir correo', primary: true },
            { id: 'copiar', label: '📋 Copiar texto', primary: false },
            { id: 'cancelar', label: '❌ Cancelar', primary: false }
        ];

        const mensaje = 
            `📧 Backup para ${nombreUsuario}\n\n` +
            `El backup contiene:\n` +
            `• ${backup.data.frases?.length || 0} frases\n` +
            `• ${backup.data.palabras?.length || 0} palabras\n` +
            `• ${backup.data.historias?.length || 0} historias\n` +
            `• ${backup.data.temas?.length || 0} temas\n\n` +
            `Elige cómo quieres guardar tu backup:`;

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

    // ============================================================
    // MOSTRAR OPCIONES DE BACKUP
    // ============================================================

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

            overlay.innerHTML = `
                <div style="background: var(--white, #ffffff); border-radius: 16px; padding: 28px 24px; max-width: 420px; width: 100%; box-shadow: 0 30px 80px rgba(0,0,0,0.4);">
                    <div style="text-align: center; margin-bottom: 16px;">
                        <span style="font-size: 48px;">📧</span>
                        <h3 style="font-size: 18px; font-weight: 700; color: var(--dark); margin: 8px 0 4px 0;">Backup por Correo</h3>
                    </div>
                    <div style="background: var(--bg); border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; font-size: 13px; color: var(--gray); white-space: pre-line; max-height: 200px; overflow-y: auto;">
                        ${mensaje}
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${opciones.map(o => `
                            <button class="backup-opcion-btn" data-value="${o.id}" style="
                                padding: 12px 20px;
                                font-size: 15px;
                                font-weight: 600;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                transition: all 0.3s;
                                font-family: var(--font, sans-serif);
                                ${o.primary ? `
                                    background: linear-gradient(135deg, #6C5CE7, #A29BFE);
                                    color: white;
                                ` : o.id === 'cancelar' ? `
                                    background: var(--light);
                                    color: var(--gray);
                                ` : `
                                    background: var(--bg);
                                    color: var(--dark);
                                    border: 2px solid var(--light);
                                `}
                            " 
                            onmouseover="this.style.transform='scale(1.02)'" 
                            onmouseout="this.style.transform='none'">
                                ${o.label}
                            </button>
                        `).join('')}
                    </div>
                    <div style="margin-top: 12px; font-size: 11px; color: var(--gray-light); text-align: center;">
                        💡 Si el correo no se abre, usa "Copiar texto" como alternativa.
                    </div>
                </div>
            `;

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

    // ============================================================
    // MOSTRAR BACKUP COMO TEXTO COMPLETO
    // ============================================================

    _mostrarBackupTextoCompleto(jsonStr, backup) {
        const nombreUsuario = backup.usuario?.nombre || 'Usuario';
        const fecha = new Date(backup.fecha).toLocaleString();

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

        overlay.innerHTML = `
            <div style="background: var(--white, #ffffff); border-radius: 16px; padding: 24px; max-width: 800px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 30px 80px rgba(0,0,0,0.4);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0;">
                    <div>
                        <h3 style="font-size: 18px; font-weight: 700; color: var(--dark); margin: 0;">📋 Backup para Copiar</h3>
                        <p style="font-size: 12px; color: var(--gray); margin: 2px 0 0;">
                            ${nombreUsuario} · ${fecha} · ${backup.data.frases?.length || 0} frases
                        </p>
                    </div>
                    <button onclick="this.closest('div[style]').remove()" style="
                        background: none; border: none; font-size: 28px; color: var(--gray); 
                        cursor: pointer; transition: all 0.3s; padding: 0 8px;
                    " onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--gray)'">
                        &times;
                    </button>
                </div>

                <div style="flex: 1; overflow-y: auto; margin-bottom: 12px;">
                    <div style="background: var(--bg); border-radius: 8px; padding: 12px; border: 1px solid var(--light);">
                        <div style="font-size: 11px; color: var(--gray-light); margin-bottom: 6px;">📋 COPIA TODO ESTE TEXTO</div>
                        <textarea id="backupTextoCompleto" rows="15" style="
                            width: 100%; padding: 10px; border: 1px solid var(--light); 
                            border-radius: 6px; font-size: 12px; font-family: monospace; 
                            resize: vertical; background: var(--white); color: var(--dark);
                            line-height: 1.4;
                        " readonly>${jsonStr}</textarea>
                    </div>
                </div>

                <div style="display: flex; gap: 10px; flex-wrap: wrap; flex-shrink: 0; border-top: 1px solid var(--light); padding-top: 12px;">
                    <button onclick="window.UIBackup._copiarBackupTexto()" class="btn-primary" style="
                        padding: 10px 24px; font-size: 14px; font-weight: 600; 
                        background: linear-gradient(135deg, #6C5CE7, #A29BFE);
                        color: white; border: none; border-radius: 8px; cursor: pointer; flex: 1;
                    ">
                        <i class="fas fa-copy"></i> Copiar Todo
                    </button>
                    <button onclick="this.closest('div[style]').remove()" class="btn-secondary" style="
                        padding: 10px 24px; font-size: 14px; font-weight: 600; 
                        background: var(--light); color: var(--dark); 
                        border: none; border-radius: 8px; cursor: pointer;
                    ">
                        Cerrar
                    </button>
                </div>

                <div style="margin-top: 8px; font-size: 11px; color: var(--gray-light); flex-shrink: 0;">
                    💡 Copia este texto y guárdalo en un lugar seguro. Para restaurar, usa "Restaurar desde Texto".
                </div>
            </div>
        `;

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

    // ============================================================
    // COPIAR BACKUP TEXTO
    // ============================================================

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
    // BACKUP TEXTO - EXPORTAR
    // ============================================================

    async _abrirBackupTexto() {
        try {
            this._core.mostrarToast('📄 Generando backup como texto...', 'info');

            const data = await db.exportarBackup();
            const usuario = await db.getUsuario();
            const backup = {
                fecha: new Date().toISOString(),
                data: data,
                usuario: usuario,
                idiomaActivo: gestorIdiomas?.getIdiomaActivo() || 'es',
                version: '2.5'
            };

            const jsonStr = JSON.stringify(backup, null, 2);
            this._mostrarBackupTextoCompleto(jsonStr, backup);

        } catch (error) {
            console.error('❌ Error generando backup texto:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // BACKUP TEXTO - RESTAURAR
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

            overlay.innerHTML = `
                <div style="background: var(--white, #ffffff); border-radius: 16px; padding: 24px; max-width: 700px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 30px 80px rgba(0,0,0,0.4);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0;">
                        <div>
                            <h3 style="font-size: 18px; font-weight: 700; color: var(--dark); margin: 0;">📥 Restaurar desde Texto</h3>
                            <p style="font-size: 12px; color: var(--gray); margin: 2px 0 0;">
                                Pega el texto del backup que copiaste anteriormente
                            </p>
                        </div>
                        <button onclick="this.closest('div[style]').remove()" style="
                            background: none; border: none; font-size: 28px; color: var(--gray); 
                            cursor: pointer; transition: all 0.3s; padding: 0 8px;
                        " onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--gray)'">
                            &times;
                        </button>
                    </div>

                    <div style="flex: 1; overflow-y: auto; margin-bottom: 12px;">
                        <div style="background: var(--bg); border-radius: 8px; padding: 12px; border: 1px solid var(--light);">
                            <div style="font-size: 11px; color: var(--gray-light); margin-bottom: 6px;">📋 PEGA AQUÍ EL TEXTO DEL BACKUP</div>
                            <textarea id="restaurarBackupTexto" rows="15" style="
                                width: 100%; padding: 10px; border: 1px solid var(--light); 
                                border-radius: 6px; font-size: 12px; font-family: monospace; 
                                resize: vertical; background: var(--white); color: var(--dark);
                                line-height: 1.4;
                            " placeholder="Pega aquí el texto del backup que copiaste..."></textarea>
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; flex-wrap: wrap; flex-shrink: 0; border-top: 1px solid var(--light); padding-top: 12px;">
                        <button onclick="window.UIBackup._procesarRestauracionTexto()" class="btn-primary" style="
                            padding: 10px 24px; font-size: 14px; font-weight: 600; 
                            background: linear-gradient(135deg, #6C5CE7, #A29BFE);
                            color: white; border: none; border-radius: 8px; cursor: pointer; flex: 1;
                        ">
                            <i class="fas fa-upload"></i> Restaurar Backup
                        </button>
                        <button onclick="this.closest('div[style]').remove()" class="btn-secondary" style="
                            padding: 10px 24px; font-size: 14px; font-weight: 600; 
                            background: var(--light); color: var(--dark); 
                            border: none; border-radius: 8px; cursor: pointer;
                        ">
                            Cancelar
                        </button>
                    </div>

                    <div id="restaurarBackupResultado" style="margin-top: 8px; display: none; padding: 12px; border-radius: 8px; font-size: 13px;"></div>
                </div>
            `;

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
    // PROCESAR RESTAURACIÓN DESDE TEXTO
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
            const fecha = backupData.fecha ? new Date(backupData.fecha).toLocaleString() : 'fecha desconocida';

            const confirmar = await this._core.confirm(
                `⚠️ ¿Restaurar este backup?\n\n` +
                `📅 Fecha: ${fecha}\n` +
                `📊 Contenido:\n` +
                `• ${totalFrases} frases\n` +
                `• ${totalPalabras} palabras\n` +
                `• ${totalHistorias} historias\n` +
                `• ${totalTemas} temas\n\n` +
                `Esto SOBRESCRIBIRÁ todos tus datos actuales.\n\n` +
                `¿Continuar?`,
                '⚠️ Restaurar Backup'
            );

            if (!confirmar) return;

            resultadoDiv.innerHTML = '🔄 Importando datos...';

            await db.importarBackup(backupData.data);

            if (backupData.usuario) {
                await db.guardarUsuario(backupData.usuario);
            }

            if (backupData.idiomaActivo) {
                localStorage.setItem('pipeline_idioma_activo', backupData.idiomaActivo);
            }

            if (window.gestorIdiomas) {
                await window.gestorIdiomas._cargarIdiomas();
            }

            resultadoDiv.style.background = 'rgba(0,184,148,0.1)';
            resultadoDiv.style.border = '1px solid var(--success)';
            resultadoDiv.innerHTML = `
                ✅ Backup restaurado correctamente
                <br><span style="font-size: 12px; color: var(--gray);">
                    📚 ${totalFrases} frases · 📝 ${totalPalabras} palabras
                    📖 ${totalHistorias} historias · 📂 ${totalTemas} temas
                    <br>🔄 Recargando la aplicación...
                </span>
            `;

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
    // CÓDIGO QR
    // ============================================================

    async _generarQR() {
        try {
            this._core.mostrarToast('📱 Generando código QR...', 'info');

            const data = await db.exportarBackup();
            const backup = {
                fecha: new Date().toISOString(),
                data: data,
                usuario: await db.getUsuario(),
                idiomaActivo: gestorIdiomas?.getIdiomaActivo() || 'es',
                version: '2.5'
            };

            const jsonStr = JSON.stringify(backup);
            
            let qrText = jsonStr;
            if (qrText.length > 2800) {
                qrText = `PIPELINE_NEURO_BACKUP_${Date.now()}`;
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

        overlay.innerHTML = `
            <div style="background: var(--white, #ffffff); border-radius: 16px; padding: 24px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 30px 80px rgba(0,0,0,0.4);">
                <h3 style="font-size: 18px; font-weight: 700; color: var(--dark); margin: 0 0 4px 0;">📱 Código QR</h3>
                <p style="font-size: 12px; color: var(--gray); margin: 0 0 16px 0;">
                    Escanea con otro dispositivo para transferir el backup
                </p>
                <div id="qrcode-container" style="display: flex; justify-content: center; margin-bottom: 16px; background: white; padding: 16px; border-radius: 8px;">
                    <div id="qrcode"></div>
                </div>
                <button onclick="this.closest('div[style]').remove()" class="btn-primary" style="
                    padding: 10px 24px; font-size: 14px; font-weight: 600; 
                    background: linear-gradient(135deg, #6C5CE7, #A29BFE);
                    color: white; border: none; border-radius: 8px; cursor: pointer; width: 100%;
                ">
                    Cerrar
                </button>
            </div>
        `;

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
                qrContainer.innerHTML = `
                    <div style="padding: 20px; color: var(--gray);">
                        ⚠️ No se pudo generar el QR
                        <br><span style="font-size: 11px;">Usa "Backup Texto" como alternativa</span>
                    </div>
                `;
            }
        } catch (error) {
            console.warn('⚠️ Error generando QR:', error);
            document.getElementById('qrcode').innerHTML = `
                <div style="padding: 20px; color: var(--gray);">
                    ⚠️ No se pudo generar el QR
                    <br><span style="font-size: 11px;">Usa "Backup Texto" como alternativa</span>
                </div>
            `;
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
    // GOOGLE DRIVE - CONECTAR
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

    // ============================================================
    // GOOGLE DRIVE - BACKUP
    // ============================================================

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
            const backup = {
                fecha: new Date().toISOString(),
                data: data,
                usuario: usuario,
                idiomaActivo: gestorIdiomas?.getIdiomaActivo() || 'es',
                version: '2.5'
            };

            const jsonStr = JSON.stringify(backup, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const metadata = {
                name: `pipeline_backup_${new Date().toISOString().slice(0,10)}.json`,
                parents: ['root']
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', blob);

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this._accessToken}`
                },
                body: form
            });

            if (!response.ok) {
                throw new Error('Error subiendo a Google Drive: ' + response.statusText);
            }

            const result = await response.json();
            this._core.mostrarToast(`✅ Backup subido a Google Drive (ID: ${result.id})`, 'success');

        } catch (error) {
            console.error('❌ Error subiendo a Google Drive:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // GOOGLE DRIVE - RESTAURAR
    // ============================================================

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
                `https://www.googleapis.com/drive/v3/files?q=name contains 'pipeline_backup_' and trashed=false&orderBy=createdTime desc&pageSize=10`,
                {
                    headers: {
                        'Authorization': `Bearer ${this._accessToken}`
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

            let mensaje = '📂 Selecciona un backup para restaurar:\n\n';
            result.files.forEach((f, i) => {
                const fecha = new Date(f.createdTime).toLocaleString();
                const tamano = Math.round(f.size / 1024);
                mensaje += `${i + 1}. ${f.name} (${tamano} KB) - ${fecha}\n`;
            });

            const seleccion = await this._core.prompt(mensaje, '1', 'Número del backup...', '📂 Restaurar Backup');
            if (!seleccion) return;

            const idx = parseInt(seleccion) - 1;
            if (isNaN(idx) || idx < 0 || idx >= result.files.length) {
                this._core.mostrarToast('❌ Selección inválida', 'error');
                return;
            }

            const archivo = result.files[idx];
            const confirmar = await this._core.confirm(
                '⚠️ ¿Restaurar backup "' + archivo.name + '"?\n\nEsto SOBRESCRIBIRÁ todos tus datos actuales.\n\n¿Continuar?',
                '⚠️ Restaurar Backup'
            );

            if (!confirmar) return;

            this._core.mostrarToast('🔄 Descargando backup...', 'info');

            const downloadResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files/${archivo.id}?alt=media`,
                {
                    headers: {
                        'Authorization': `Bearer ${this._accessToken}`
                    }
                }
            );

            if (!downloadResponse.ok) {
                throw new Error('Error descargando backup: ' + downloadResponse.statusText);
            }

            const jsonText = await downloadResponse.text();
            const backup = JSON.parse(jsonText);

            await db.importarBackup(backup.data);

            if (backup.usuario) {
                await db.guardarUsuario(backup.usuario);
            }

            if (backup.idiomaActivo) {
                localStorage.setItem('pipeline_idioma_activo', backup.idiomaActivo);
            }

            this._core.mostrarToast('✅ Backup restaurado correctamente', 'success');

            setTimeout(() => {
                location.reload();
            }, 1500);

        } catch (error) {
            console.error('❌ Error restaurando de Google Drive:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // 🔥 GESTIÓN DE BACKUPS - ABRIR GESTOR
    // ============================================================

    async _abrirGestorBackups() {
        try {
            const backups = this._obtenerListaBackups();

            if (backups.length === 0) {
                this._core.mostrarToast('📭 No hay backups guardados', 'info');
                return;
            }

            // Mostrar lista de backups con opciones
            let mensaje = '📦 GESTIÓN DE BACKUPS\n\n';
            mensaje += `Total: ${backups.length} backups\n`;
            mensaje += `📊 Espacio total: ${Math.round(backups.reduce((acc, b) => acc + (b.tamano || 0), 0) / 1024)} KB\n\n`;
            mensaje += 'Selecciona una opción:\n';
            mensaje += '1. 📋 Ver lista de backups\n';
            mensaje += '2. 🗑️ Eliminar backup específico\n';
            mensaje += '3. 🧹 Eliminar backups automáticos (mantener manuales)\n';
            mensaje += '4. 💥 Eliminar TODOS los backups\n';
            mensaje += '5. ⚙️ Configurar límite de backups\n';
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
                default:
                    this._core.mostrarToast('❌ Opción cancelada', 'info');
            }

        } catch (error) {
            console.error('❌ Error en gestor de backups:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // GESTIÓN - MOSTRAR LISTA DE BACKUPS
    // ============================================================

    async _mostrarListaBackups(backups) {
        if (!backups || backups.length === 0) {
            this._core.mostrarToast('📭 No hay backups guardados', 'info');
            return;
        }

        let mensaje = '📋 LISTA DE BACKUPS\n\n';
        
        backups.forEach((b, i) => {
            const auto = b.esAutomatico ? '🤖 Automático' : '👤 Manual';
            const fecha = b.fechaLegible || new Date(b.fecha).toLocaleString();
            mensaje += `${i + 1}. 📅 ${fecha}\n`;
            mensaje += `   📊 ${b.tamanoKB} KB · ${auto}\n`;
            mensaje += `   📁 ${b.data?.frases?.length || 0} frases · ${b.data?.palabras?.length || 0} palabras\n`;
            if (b.id) mensaje += `   🆔 ${b.id}\n`;
            mensaje += '\n';
        });

        mensaje += `\n💡 Total: ${backups.length} backups`;
        mensaje += `\n📊 Espacio total: ${Math.round(backups.reduce((acc, b) => acc + (b.tamano || 0), 0) / 1024)} KB`;

        await this._core.alert(mensaje, '📋 Lista de Backups');
    }

    // ============================================================
    // GESTIÓN - ELIMINAR BACKUP ESPECÍFICO
    // ============================================================

    async _eliminarBackupEspecifico(backups) {
        if (!backups || backups.length === 0) {
            this._core.mostrarToast('📭 No hay backups para eliminar', 'info');
            return;
        }

        let mensaje = '🗑️ ELIMINAR BACKUP\n\n';
        mensaje += 'Selecciona el número del backup a eliminar:\n\n';
        
        backups.forEach((b, i) => {
            const auto = b.esAutomatico ? '🤖' : '👤';
            const fecha = b.fechaLegible || new Date(b.fecha).toLocaleString();
            mensaje += `${i + 1}. ${auto} ${fecha} (${b.tamanoKB} KB)\n`;
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
        const confirmar = await this._core.confirm(
            `⚠️ ¿Eliminar este backup?\n\n` +
            `📅 Fecha: ${backup.fechaLegible || new Date(backup.fecha).toLocaleString()}\n` +
            `📊 Tamaño: ${backup.tamanoKB} KB\n` +
            `🤖 Tipo: ${backup.esAutomatico ? 'Automático' : 'Manual'}\n` +
            `📁 Frases: ${backup.data?.frases?.length || 0}\n\n` +
            `Esta acción NO se puede deshacer.`,
            '🗑️ Confirmar Eliminación'
        );

        if (!confirmar) return;

        try {
            let allBackups = JSON.parse(localStorage.getItem('pipeline_backups_locales') || '[]');
            if (backup.id) {
                allBackups = allBackups.filter(b => b.id !== backup.id);
            } else {
                allBackups = allBackups.filter(b => b.fecha !== backup.fecha);
            }
            localStorage.setItem('pipeline_backups_locales', JSON.stringify(allBackups));

            this._core.mostrarToast('🗑️ Backup eliminado correctamente', 'success');
            this._renderizarPanel();
            
            const verLista = await this._core.confirm('¿Quieres ver la lista actualizada?', '');
            if (verLista) {
                await this._mostrarListaBackups(this._obtenerListaBackups());
            }

        } catch (error) {
            console.error('❌ Error eliminando backup:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // GESTIÓN - ELIMINAR BACKUPS AUTOMÁTICOS
    // ============================================================

    async _eliminarBackupsAutomaticos() {
        const backups = this._obtenerListaBackups();
        const automaticos = backups.filter(b => b.esAutomatico === true);
        const manuales = backups.filter(b => b.esAutomatico === false);

        if (automaticos.length === 0) {
            this._core.mostrarToast('📭 No hay backups automáticos para eliminar', 'info');
            return;
        }

        const confirmar = await this._core.confirm(
            `⚠️ ¿Eliminar TODOS los backups automáticos?\n\n` +
            `📊 ${automaticos.length} backups automáticos\n` +
            `📁 ${manuales.length} backups manuales (se mantienen)\n` +
            `📊 Espacio a liberar: ${Math.round(automaticos.reduce((acc, b) => acc + (b.tamano || 0), 0) / 1024)} KB\n\n` +
            `Esta acción NO se puede deshacer.`,
            '🧹 Eliminar Backups Automáticos'
        );

        if (!confirmar) return;

        try {
            localStorage.setItem('pipeline_backups_locales', JSON.stringify(manuales));
            this._core.mostrarToast(`🧹 ${automaticos.length} backups automáticos eliminados`, 'success');
            this._renderizarPanel();
        } catch (error) {
            console.error('❌ Error eliminando backups automáticos:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // GESTIÓN - ELIMINAR TODOS LOS BACKUPS
    // ============================================================

    async _eliminarTodosBackups() {
        const backups = this._obtenerListaBackups();

        if (backups.length === 0) {
            this._core.mostrarToast('📭 No hay backups para eliminar', 'info');
            return;
        }

        const confirmar1 = await this._core.confirm(
            `⚠️ ¿ELIMINAR TODOS LOS BACKUPS?\n\n` +
            `📊 ${backups.length} backups\n` +
            `📊 Espacio total: ${Math.round(backups.reduce((acc, b) => acc + (b.tamano || 0), 0) / 1024)} KB\n\n` +
            `⚠️ Esta acción NO se puede deshacer.\n` +
            `⚠️ Perderás TODOS tus backups guardados.\n\n` +
            `¿Estás seguro?`,
            '💥 Eliminar Todos los Backups'
        );

        if (!confirmar1) return;

        const confirmar2 = await this._core.confirm(
            `🔴 ÚLTIMA ADVERTENCIA 🔴\n\n` +
            `Se eliminarán ${backups.length} backups permanentemente.\n\n` +
            `Escribe "ELIMINAR" para confirmar:`,
            '⚠️ Confirmación Final'
        );

        if (!confirmar2) return;

        try {
            localStorage.setItem('pipeline_backups_locales', '[]');
            this._core.mostrarToast('💥 Todos los backups eliminados', 'warning');
            this._renderizarPanel();
        } catch (error) {
            console.error('❌ Error eliminando todos los backups:', error);
            this._core.mostrarToast('❌ Error: ' + error.message, 'error');
        }
    }

    // ============================================================
    // GESTIÓN - CONFIGURAR LÍMITE DE BACKUPS
    // ============================================================

    async _configurarLimiteBackups() {
        const mensaje = `⚙️ CONFIGURAR LÍMITE DE BACKUPS\n\n` +
            `Límite actual: ${this._MAX_BACKUPS} backups\n` +
            `Backups actuales: ${this._obtenerListaBackups().length}\n\n` +
            `Escribe el nuevo límite (mínimo 3, máximo 50):`;

        const nuevoLimite = await this._core.prompt(mensaje, String(this._MAX_BACKUPS), 'Número (3-50)...', '⚙️ Límite de Backups');

        if (!nuevoLimite) return;

        const limite = parseInt(nuevoLimite);

        if (isNaN(limite) || limite < 3 || limite > 50) {
            this._core.mostrarToast('❌ Límite inválido. Debe ser entre 3 y 50.', 'error');
            return;
        }

        this._MAX_BACKUPS = limite;
        localStorage.setItem('pipeline_backup_max_limit', String(limite));

        // Aplicar límite inmediatamente
        let backups = JSON.parse(localStorage.getItem('pipeline_backups_locales') || '[]');
        backups.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        while (backups.length > limite) {
            const eliminado = backups.pop();
            console.log(`🗑️ Backup antiguo eliminado por límite: ${new Date(eliminado.fecha).toLocaleString()}`);
        }
        localStorage.setItem('pipeline_backups_locales', JSON.stringify(backups));

        this._core.mostrarToast(`✅ Límite configurado a ${limite} backups`, 'success');
        this._renderizarPanel();
    }

    // ============================================================
    // BACKUP AUTOMÁTICO - CONFIGURAR
    // ============================================================

    async _configurarBackupAutomatico() {
        const actual = localStorage.getItem('pipeline_backup_auto') === 'true';

        const opciones = [
            { id: 'desactivado', label: '⏸️ Desactivado' },
            { id: 'diario', label: '📅 Diario (24h)' },
            { id: 'semanal', label: '📆 Semanal (7 días)' },
            { id: 'al_estudiar', label: '📚 Al terminar sesión' },
            { id: 'siempre', label: '🔄 Siempre (al abrir y al cerrar)' }
        ];

        let mensaje = '🤖 Configurar Backup Automático\n\n';
        mensaje += 'Selecciona la frecuencia:\n';
        opciones.forEach((o, i) => {
            const marcado = (o.id === 'desactivado' && !actual) || 
                           (o.id === 'diario' && actual && localStorage.getItem('pipeline_backup_auto_frecuencia') === 'diario') ||
                           (o.id === 'semanal' && actual && localStorage.getItem('pipeline_backup_auto_frecuencia') === 'semanal') ||
                           (o.id === 'al_estudiar' && actual && localStorage.getItem('pipeline_backup_auto_frecuencia') === 'al_estudiar') ||
                           (o.id === 'siempre' && actual && localStorage.getItem('pipeline_backup_auto_frecuencia') === 'siempre') ? ' ✅' : '';
            mensaje += `${i + 1}. ${o.label}${marcado}\n`;
        });

        const seleccion = await this._core.prompt(mensaje, '1', 'Número de opción...', '🤖 Backup Automático');
        if (!seleccion) return;

        const idx = parseInt(seleccion) - 1;
        if (isNaN(idx) || idx < 0 || idx >= opciones.length) {
            this._core.mostrarToast('❌ Selección inválida', 'error');
            return;
        }

        const opcion = opciones[idx];

        if (opcion.id === 'desactivado') {
            localStorage.removeItem('pipeline_backup_auto');
            localStorage.removeItem('pipeline_backup_auto_frecuencia');
            this._core.mostrarToast('⏸️ Backup automático desactivado', 'info');
        } else {
            localStorage.setItem('pipeline_backup_auto', 'true');
            localStorage.setItem('pipeline_backup_auto_frecuencia', opcion.id);
            this._core.mostrarToast(`✅ Backup automático configurado: ${opcion.label}`, 'success');
            
            if (opcion.id === 'siempre' || opcion.id === 'al_estudiar') {
                await this._generarBackupLocal(true);
                localStorage.setItem('pipeline_ultimo_backup_auto', String(Date.now()));
            }
        }

        this._renderizarPanel();
    }

    // ============================================================
    // VERIFICAR BACKUP AUTOMÁTICO
    // ============================================================

    async verificarBackupAutomatico(forzar = false) {
        const auto = localStorage.getItem('pipeline_backup_auto') === 'true';
        
        if (!auto) {
            console.log('ℹ️ Backup automático desactivado');
            return false;
        }

        const frecuencia = localStorage.getItem('pipeline_backup_auto_frecuencia') || 'diario';
        const ultimo = localStorage.getItem('pipeline_ultimo_backup_auto');
        const ahora = Date.now();

        if (frecuencia === 'siempre') {
            console.log('🔄 Backup "siempre" activado, ejecutando...');
            const result = await this._generarBackupLocal(true);
            localStorage.setItem('pipeline_ultimo_backup_auto', String(ahora));
            return result;
        }

        let intervalo = 24 * 60 * 60 * 1000;
        if (frecuencia === 'semanal') intervalo = 7 * 24 * 60 * 60 * 1000;
        
        if (frecuencia === 'al_estudiar') {
            const ultimaActividad = localStorage.getItem('pipeline_ultima_actividad');
            if (ultimaActividad && (ahora - parseInt(ultimaActividad) < 3600000)) {
                console.log('📚 Actividad reciente detectada, ejecutando backup...');
                const result = await this._generarBackupLocal(true);
                localStorage.setItem('pipeline_ultimo_backup_auto', String(ahora));
                return result;
            }
            return false;
        }

        const tiempoTranscurrido = ultimo ? (ahora - parseInt(ultimo)) : intervalo + 1;
        
        if (forzar || tiempoTranscurrido > intervalo) {
            console.log(`🤖 Ejecutando backup automático (${forzar ? 'forzado' : 'programado'})...`);
            
            try {
                const result = await this._generarBackupLocal(true);
                localStorage.setItem('pipeline_ultimo_backup_auto', String(ahora));
                console.log(`✅ Backup automático completado (${frecuencia})`);
                return result;
            } catch (error) {
                console.error('❌ Error en backup automático:', error);
                return false;
            }
        } else {
            const horasRestantes = Math.round((intervalo - tiempoTranscurrido) / 3600000);
            console.log(`⏳ Próximo backup automático en ~${horasRestantes}h`);
            return false;
        }
    }

    // ============================================================
    // REGISTRAR ACTIVIDAD PARA "AL_ESTUDIAR"
    // ============================================================

    registrarActividad() {
        localStorage.setItem('pipeline_ultima_actividad', String(Date.now()));
    }

    // ============================================================
    // MÉTODOS DE COMPATIBILIDAD
    // ============================================================

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
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UIBackup = new UIBackup();
console.log('✅ UI Backup v2.5 - SISTEMA DE BACKUP COMPLETO CON GESTIÓN');
console.log('  📦 Backup Local (Generar + Restaurar)');
console.log('  📧 Backup por Correo (Exportar + Instrucciones)');
console.log('  📄 Backup Texto (Exportar + Restaurar desde Texto)');
console.log('  📱 Backup Código QR (Exportar)');
console.log('  ☁️ Backup Google Drive (Exportar + Restaurar)');
console.log('  🤖 Backup Automático (Configurable)');
console.log('  🗑️ Gestión de Backups (Listar, Eliminar, Límite)');
console.log('  🔧 Límite automático de backups (configurable)');
console.log('  🔄 Backup automático al iniciar, cerrar y programado');