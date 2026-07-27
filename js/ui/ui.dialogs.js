// ============================================================
// UI DIALOGS v16.2 - Sistema de diálogos personalizados
// ============================================================

class UIDialogs {
    constructor() {
        this._dialogActive = false;
        this._dialogResolve = null;
        this._creado = false;
    }

    _crearDialogPersonalizado() {
        if (this._creado || document.getElementById('customDialog')) return;
        
        const dialogHTML = `
            <div id="customDialog" class="custom-dialog" style="display:none;">
                <div class="custom-dialog-overlay"></div>
                <div class="custom-dialog-box">
                    <div class="custom-dialog-header">
                        <span id="customDialogIcon">📢</span>
                        <span id="customDialogTitle">Título</span>
                        <button class="custom-dialog-close" id="customDialogClose">&times;</button>
                    </div>
                    <div class="custom-dialog-body">
                        <p id="customDialogMessage">Mensaje</p>
                        <div id="customDialogInputContainer" style="display:none;">
                            <input type="text" id="customDialogInput" placeholder="Escribe aquí...">
                        </div>
                    </div>
                    <div class="custom-dialog-footer" id="customDialogButtons"></div>
                </div>
            </div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = dialogHTML;
        document.body.appendChild(div.firstElementChild);
        
        // Estilos
        const styles = document.createElement('style');
        styles.textContent = `
            .custom-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: dialogFadeIn 0.3s ease;
            }
            .custom-dialog-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(8px);
            }
            .custom-dialog-box {
                position: relative;
                background: var(--white, #ffffff);
                border-radius: 16px;
                max-width: 480px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: dialogScaleIn 0.3s ease;
                overflow: hidden;
                max-height: 90vh;
                overflow-y: auto;
            }
            .custom-dialog-header {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 16px 20px;
                border-bottom: 1px solid var(--light, #eee);
                background: var(--bg, #f5f6fa);
                flex-shrink: 0;
            }
            .custom-dialog-header #customDialogIcon { font-size: 24px; }
            .custom-dialog-header #customDialogTitle {
                flex: 1;
                font-size: 16px;
                font-weight: 700;
                color: var(--dark, #2d3436);
            }
            .custom-dialog-close {
                background: none;
                border: none;
                font-size: 24px;
                color: var(--gray, #999);
                cursor: pointer;
                padding: 0 4px;
                transition: all 0.3s ease;
            }
            .custom-dialog-close:hover { color: var(--danger, #ff7675); transform: rotate(90deg); }
            .custom-dialog-body { 
                padding: 20px 24px; 
                min-height: 60px;
                overflow-y: auto;
            }
            .custom-dialog-body #customDialogMessage {
                font-size: 15px;
                line-height: 1.6;
                color: var(--dark, #2d3436);
                white-space: pre-wrap;
                margin: 0;
            }
            .custom-dialog-body #customDialogInputContainer { margin-top: 12px; }
            .custom-dialog-body #customDialogInput {
                width: 100%;
                padding: 10px 14px;
                border: 2px solid var(--light, #ddd);
                border-radius: 8px;
                font-size: 15px;
                font-family: var(--font, sans-serif);
                transition: all 0.3s ease;
            }
            .custom-dialog-body #customDialogInput:focus {
                border-color: var(--primary, #6C5CE7);
                outline: none;
                box-shadow: 0 0 0 4px rgba(108,92,231,0.1);
            }
            .custom-dialog-footer {
                display: flex;
                gap: 10px;
                padding: 12px 20px 20px;
                justify-content: flex-end;
                border-top: 1px solid var(--light, #eee);
                flex-wrap: wrap;
                flex-shrink: 0;
            }
            .custom-dialog-footer .dialog-btn {
                padding: 10px 24px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: var(--font, sans-serif);
                min-width: 80px;
            }
            .custom-dialog-footer .dialog-btn:hover { transform: translateY(-2px); }
            .custom-dialog-footer .dialog-btn.primary {
                background: var(--primary, #6C5CE7);
                color: white;
            }
            .custom-dialog-footer .dialog-btn.primary:hover {
                box-shadow: 0 4px 16px rgba(108,92,231,0.3);
            }
            .custom-dialog-footer .dialog-btn.secondary {
                background: var(--light, #eee);
                color: var(--dark, #2d3436);
            }
            .custom-dialog-footer .dialog-btn.secondary:hover {
                background: var(--gray-light, #ddd);
            }
            .custom-dialog-footer .dialog-btn.danger {
                background: var(--danger, #FF7675);
                color: white;
            }
            .custom-dialog-footer .dialog-btn.danger:hover {
                box-shadow: 0 4px 16px rgba(255,118,117,0.3);
            }
            .custom-dialog-footer .dialog-btn.success {
                background: var(--success, #00B894);
                color: white;
            }
            .custom-dialog-footer .dialog-btn.success:hover {
                box-shadow: 0 4px 16px rgba(0,184,148,0.3);
            }
            @keyframes dialogFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes dialogScaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @media (max-width: 480px) {
                .custom-dialog-box { width: 95%; margin: 10px; }
                .custom-dialog-footer { flex-direction: column; }
                .custom-dialog-footer .dialog-btn { width: 100%; justify-content: center; }
            }
        `;
        document.head.appendChild(styles);
        
        // Eventos
        const closeBtn = document.getElementById('customDialogClose');
        const overlay = document.querySelector('.custom-dialog-overlay');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this._cerrarDialogPersonalizado(null);
            });
        }
        if (overlay) {
            overlay.addEventListener('click', () => {
                this._cerrarDialogPersonalizado(null);
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._dialogActive) {
                this._cerrarDialogPersonalizado(null);
            }
        });
        
        this._creado = true;
    }

    _mostrarDialogPersonalizado(opciones) {
        return new Promise((resolve) => {
            this._dialogResolve = resolve;
            this._dialogActive = true;
            
            const dialog = document.getElementById('customDialog');
            const icon = document.getElementById('customDialogIcon');
            const title = document.getElementById('customDialogTitle');
            const message = document.getElementById('customDialogMessage');
            const inputContainer = document.getElementById('customDialogInputContainer');
            const input = document.getElementById('customDialogInput');
            const buttons = document.getElementById('customDialogButtons');
            
            if (icon) icon.textContent = opciones.icon || '📢';
            if (title) title.textContent = opciones.title || 'Aviso';
            if (message) message.textContent = opciones.message || '';
            
            if (opciones.input) {
                if (inputContainer) inputContainer.style.display = 'block';
                if (input) {
                    input.value = opciones.defaultValue || '';
                    input.placeholder = opciones.placeholder || 'Escribe aquí...';
                    input.type = opciones.type || 'text';
                    setTimeout(() => input.focus(), 100);
                }
            } else {
                if (inputContainer) inputContainer.style.display = 'none';
            }
            
            if (buttons) {
                buttons.innerHTML = '';
                const btns = opciones.buttons || [{ text: 'Aceptar', value: true, primary: true }];
                
                btns.forEach((btn) => {
                    const button = document.createElement('button');
                    button.textContent = btn.text;
                    button.className = 'dialog-btn ' + (btn.primary ? 'primary' : (btn.danger ? 'danger' : (btn.success ? 'success' : 'secondary')));
                    button.addEventListener('click', () => {
                        const value = opciones.input ? input.value : btn.value;
                        this._cerrarDialogPersonalizado(value);
                    });
                    buttons.appendChild(button);
                });
            }
            
            if (dialog) dialog.style.display = 'flex';
            
            if (opciones.input && input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const value = input.value;
                        this._cerrarDialogPersonalizado(value);
                    }
                });
            } else {
                const firstBtn = buttons?.querySelector('.dialog-btn');
                if (firstBtn) {
                    const handler = (e) => {
                        if (e.key === 'Enter' && this._dialogActive) {
                            firstBtn.click();
                            document.removeEventListener('keydown', handler);
                        }
                    };
                    document.addEventListener('keydown', handler);
                }
            }
        });
    }

    _cerrarDialogPersonalizado(valor) {
        const dialog = document.getElementById('customDialog');
        if (dialog) dialog.style.display = 'none';
        this._dialogActive = false;
        if (this._dialogResolve) {
            this._dialogResolve(valor);
            this._dialogResolve = null;
        }
    }

    async alert(message, title) {
        this._crearDialogPersonalizado();
        return this._mostrarDialogPersonalizado({
            icon: '📢',
            title: title || 'Aviso',
            message: message || '',
            buttons: [{ text: 'Aceptar', value: true, primary: true }]
        });
    }

    async confirm(message, title) {
        this._crearDialogPersonalizado();
        return this._mostrarDialogPersonalizado({
            icon: '❓',
            title: title || 'Confirmar',
            message: message || '',
            buttons: [
                { text: 'Cancelar', value: false, secondary: true },
                { text: 'Aceptar', value: true, primary: true }
            ]
        });
    }

    async prompt(message, defaultValue, placeholder, title) {
        this._crearDialogPersonalizado();
        return this._mostrarDialogPersonalizado({
            icon: '📝',
            title: title || 'Entrada',
            message: message || '',
            input: true,
            defaultValue: defaultValue || '',
            placeholder: placeholder || 'Escribe aquí...',
            buttons: [
                { text: 'Cancelar', value: null, secondary: true },
                { text: 'Aceptar', value: 'submit', primary: true }
            ]
        });
    }
}

// Instancia global para que otros módulos la usen
window.UIDialogs = UIDialogs;