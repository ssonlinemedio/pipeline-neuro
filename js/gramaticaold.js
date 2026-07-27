// ============================================================
// UI STUDY v17.3 - CORREGIDO: FLASHCARD MUESTRA SOLO LA FRASE
// ============================================================

class UIStudy {
    constructor() {
        this._modoEstudio = 'flashcard';
        this._pistaActual = '';
        this._opcionesMultiple = [];
        this._mostrandoRespuesta = false;
        this._ultimaRespuesta = null;
        this._confianza = 0.5;
    }

    async init(core) {
        this.core = core;
        try {
            if (vigia && vigia.getEstado) {
                const estado = vigia.getEstado();
                if (estado && estado.confianza !== undefined) {
                    this._confianza = estado.confianza / 100;
                }
            }
        } catch (e) {
            console.warn('⚠️ No se pudo cargar confianza:', e);
        }
        return this;
    }

    cargar(core) {
        this.core = core;
        if (pipeline && pipeline.frases && pipeline.frases.length > 0) {
            if (pipeline.fraseActual) {
                this._renderizarFraseInteractiva();
            } else {
                pipeline.cargarFrase(0);
            }
            this._mostrarControlesModo();
        } else {
            this.mostrarPantallaInicio();
        }
    }

    _mostrarControlesModo() {
        const container = document.querySelector('.study-controls');
        if (!container) return;
        
        if (!document.querySelector('.modo-selector')) {
            const modoHTML = `
                <div class="modo-selector" style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;justify-content:center;">
                    <button class="modo-btn ${this._modoEstudio === 'flashcard' ? 'active' : ''}" data-modo="flashcard" style="padding:4px 12px;border-radius:16px;border:2px solid var(--light);background:${this._modoEstudio === 'flashcard' ? 'var(--primary)' : 'var(--white)'};color:${this._modoEstudio === 'flashcard' ? 'white' : 'var(--dark)'};cursor:pointer;font-size:11px;font-weight:600;transition:all 0.3s;">
                        <i class="fas fa-layer-group"></i> Flashcard
                    </button>
                    <button class="modo-btn ${this._modoEstudio === 'escritura' ? 'active' : ''}" data-modo="escritura" style="padding:4px 12px;border-radius:16px;border:2px solid var(--light);background:${this._modoEstudio === 'escritura' ? 'var(--primary)' : 'var(--white)'};color:${this._modoEstudio === 'escritura' ? 'white' : 'var(--dark)'};cursor:pointer;font-size:11px;font-weight:600;transition:all 0.3s;">
                        <i class="fas fa-keyboard"></i> Escritura
                    </button>
                    <button class="modo-btn ${this._modoEstudio === 'multiple' ? 'active' : ''}" data-modo="multiple" style="padding:4px 12px;border-radius:16px;border:2px solid var(--light);background:${this._modoEstudio === 'multiple' ? 'var(--primary)' : 'var(--white)'};color:${this._modoEstudio === 'multiple' ? 'white' : 'var(--dark)'};cursor:pointer;font-size:11px;font-weight:600;transition:all 0.3s;">
                        <i class="fas fa-list-ul"></i> Múltiple
                    </button>
                    <button class="modo-btn ${this._modoEstudio === 'escucha' ? 'active' : ''}" data-modo="escucha" style="padding:4px 12px;border-radius:16px;border:2px solid var(--light);background:${this._modoEstudio === 'escucha' ? 'var(--primary)' : 'var(--white)'};color:${this._modoEstudio === 'escucha' ? 'white' : 'var(--dark)'};cursor:pointer;font-size:11px;font-weight:600;transition:all 0.3s;">
                        <i class="fas fa-volume-up"></i> Escucha
                    </button>
                </div>
            `;
            container.insertAdjacentHTML('beforebegin', modoHTML);
            this._configurarModosEstudio();
        }
    }

    _configurarModosEstudio() {
        document.querySelectorAll('.modo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const modo = btn.dataset.modo;
                if (modo) this.cambiarModoEstudio(modo);
            });
        });
    }

    cambiarModoEstudio(modo) {
        this._modoEstudio = modo;
        this._mostrandoRespuesta = false;
        this._ultimaRespuesta = null;
        this._opcionesMultiple = [];
        
        document.querySelectorAll('.modo-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.modo === modo);
            btn.style.background = btn.dataset.modo === modo ? 'var(--primary)' : 'var(--white)';
            btn.style.color = btn.dataset.modo === modo ? 'white' : 'var(--dark)';
        });
        
        this.core.mostrarToast('🔄 Modo: ' + this._getModoNombre(modo), 'info');
        
        if (pipeline && pipeline.fraseActual) {
            this._renderizarFraseInteractiva();
        }
    }

    _getModoNombre(modo) {
        const nombres = {
            'flashcard': 'Flashcard',
            'escritura': 'Escritura',
            'multiple': 'Opción Múltiple',
            'escucha': 'Escucha'
        };
        return nombres[modo] || modo;
    }

    // ============================================================
    // RENDERIZADO PRINCIPAL
    // ============================================================
    
    async _renderizarFraseInteractiva() {
        const container = document.getElementById('cardContainer');
        if (!container || !pipeline || !pipeline.fraseActual) return;
        
        const frase = pipeline.fraseActual;
        const progreso = frase.progreso || {};
        const rcn = progreso.rcn || 0;
        const fase = pipeline.fases.find(f => f.id === pipeline.faseActual);
        const esJeroglifico = frase.esJeroglifico || false;
        const semaforo = rcn <= 0 ? '🔴' : rcn < 3 ? '🟡' : rcn < 4 ? '🟢' : '🟣';
        const modo = this._modoEstudio;
        const consolidacion = pipeline._calcularConsolidacion ? pipeline._calcularConsolidacion(frase) : 0;
        const total = pipeline.frases ? pipeline.frases.length : 0;
        const actual = (pipeline.indiceFrase !== undefined) ? pipeline.indiceFrase + 1 : 0;
        
        // Obtener datos según modo inverso
        let modoData = { mostrar: frase.original, ocultar: frase.traduccion, esInverso: false };
        if (window.modoInverso) {
            modoData = window.modoInverso.getFraseParaEstudio(frase);
        }
        const isInverso = modoData.esInverso;
        
        // Verificar si la frase está en Mi Espacio
        const esFavorita = window.gestorFavoritos ? 
            window.gestorFavoritos._favoritos.frases.includes(frase.id) : false;
        
        let html = '<div class="card interactive-card" style="max-width:600px;margin:0 auto;position:relative;">';
        
        // Badge y RCN
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">';
        html += '<div class="card-badge" style="margin:0;">' + (fase ? fase.icono + ' ' + fase.nombre : 'Fase ' + pipeline.faseActual) + '</div>';
        html += '<div style="font-size:14px;font-weight:600;color:' + (rcn >= 4 ? 'var(--success)' : rcn >= 2 ? 'var(--warning)' : 'var(--danger)') + ';">' + semaforo + ' RCN: ' + rcn.toFixed(1) + '</div>';
        html += '</div>';
        
        // Barra de consolidación
        html += '<div style="height:4px;background:var(--light-gray);border-radius:2px;overflow:hidden;margin-bottom:16px;">';
        html += '<div style="height:100%;width:' + Math.min(100, consolidacion * 100) + '%;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:2px;transition:width 0.5s ease;"></div>';
        html += '</div>';
        
        // Indicador de modo inverso
        if (isInverso) {
            html += `<div style="text-align:center;font-size:11px;color:var(--secondary);margin-bottom:8px;padding:4px 12px;background:var(--secondary)15;border-radius:12px;border:1px solid var(--secondary)30;">
                🔄 Modo Inverso: ${window.modoInverso ? window.modoInverso.getTooltip() : 'Traduces al idioma objetivo'}
            </div>`;
        }
        
        // ============================================================
        // 🔥 FRASE SEGÚN MODO - CORREGIDO
        // ============================================================
        html += '<div style="text-align:center;margin-bottom:16px;">';
        
        if (modo === 'flashcard') {
            // 🔥 FLASHCARD: MOSTRAR SOLO LA FRASE ORIGINAL (ocultar traducción)
            if (isInverso && esJeroglifico) {
                // Modo inverso + jeroglífico: mostrar español
                html += `<div style="font-size:18px;color:var(--gray);margin-bottom:8px;">${modoData.mostrar}</div>`;
                const pinyin = frase.pinyinCompleto || frase.segmentacion?.pinyin || '';
                if (pinyin) {
                    html += `<div style="font-size:14px;color:var(--gray-light);margin-bottom:4px;">🔊 ${pinyin}</div>`;
                }
            } else if (esJeroglifico) {
                // Jeroglífico: mostrar hanzi + pinyin
                const hanzi = frase.segmentacion?.hanzi || frase.original || '';
                const pinyin = frase.segmentacion?.pinyin || frase.pinyinCompleto || '';
                html += `<div style="font-size:32px;font-weight:700;line-height:1.6;letter-spacing:2px;color:var(--dark);">${hanzi}</div>`;
                if (pinyin) {
                    html += `<div style="font-size:16px;color:var(--gray);margin-top:6px;font-weight:400;">${pinyin}</div>`;
                }
            } else {
                // 🔥 IDIOMAS NORMALES: mostrar SOLO la frase original
                html += `<div style="font-size:24px;font-weight:700;color:var(--dark);">${modoData.mostrar}</div>`;
            }
            
            // Si ya se mostró la respuesta, mostrar la traducción
            if (this._mostrandoRespuesta) {
                html += `<div style="margin-top:12px;padding:12px;background:rgba(108,92,231,0.06);border-radius:10px;font-size:16px;color:var(--primary);">${modoData.ocultar}</div>`;
                if (esJeroglifico && modoData.pistaFonetica) {
                    html += `<div style="font-size:13px;color:var(--gray-light);margin-top:8px;">🔊 ${modoData.pistaFonetica}</div>`;
                }
                html += '<div style="margin-top:12px;font-size:13px;color:var(--gray);">💡 ' + (this._pistaActual || '') + '</div>';
            } else {
                // 🔥 MOSTRAR "HAZ CLIC EN MOSTRAR" EN LUGAR DE LA TRADUCCIÓN
                html += `<div style="font-size:13px;color:var(--gray-light);margin-top:12px;">👆 Haz clic en "Mostrar" para ver la traducción</div>`;
            }
            
        } else if (modo === 'escritura') {
            // Modo escritura: mostrar la frase a traducir con pinyin si es jeroglífico
            if (isInverso && esJeroglifico) {
                html += `<div style="font-size:18px;color:var(--gray);margin-bottom:8px;">${modoData.mostrar}</div>`;
                const pinyin = frase.pinyinCompleto || frase.segmentacion?.pinyin || '';
                if (pinyin) {
                    html += `<div style="font-size:14px;color:var(--gray-light);margin-bottom:4px;">🔊 ${pinyin}</div>`;
                }
            } else if (esJeroglifico) {
                const hanzi = frase.segmentacion?.hanzi || frase.original || '';
                const pinyin = frase.segmentacion?.pinyin || frase.pinyinCompleto || '';
                html += `<div style="font-size:32px;font-weight:700;line-height:1.6;letter-spacing:2px;color:var(--dark);">${hanzi}</div>`;
                if (pinyin) {
                    html += `<div style="font-size:16px;color:var(--gray);margin-top:6px;font-weight:400;">${pinyin}</div>`;
                }
                html += `<div style="font-size:13px;color:var(--gray-light);margin-top:4px;">📝 Escribe la traducción al español</div>`;
            } else {
                // Idiomas normales: mostrar solo la frase original
                html += `<div style="font-size:24px;font-weight:700;color:var(--dark);">${modoData.mostrar}</div>`;
                html += `<div style="font-size:13px;color:var(--gray-light);margin-top:4px;">📝 Escribe la traducción</div>`;
            }
            
        } else if (modo === 'multiple') {
            // Modo múltiple: mostrar la frase original
            if (esJeroglifico) {
                const hanzi = frase.segmentacion?.hanzi || frase.original || '';
                const pinyin = frase.segmentacion?.pinyin || frase.pinyinCompleto || '';
                html += `<div style="font-size:32px;font-weight:700;line-height:1.6;letter-spacing:2px;color:var(--dark);">${hanzi}</div>`;
                if (pinyin) {
                    html += `<div style="font-size:16px;color:var(--gray);margin-top:6px;font-weight:400;">${pinyin}</div>`;
                }
            } else {
                html += `<div style="font-size:24px;font-weight:700;color:var(--dark);">${modoData.mostrar}</div>`;
            }
            
        } else if (modo === 'escucha') {
            // Modo escucha: mostrar el texto a escuchar
            const textoEscucha = isInverso ? modoData.ocultar : modoData.mostrar;
            if (esJeroglifico) {
                const hanzi = frase.segmentacion?.hanzi || frase.original || '';
                const pinyin = frase.segmentacion?.pinyin || frase.pinyinCompleto || '';
                html += `<div style="font-size:32px;font-weight:700;line-height:1.6;letter-spacing:2px;color:var(--dark);">${hanzi}</div>`;
                if (pinyin) {
                    html += `<div style="font-size:16px;color:var(--gray);margin-top:6px;font-weight:400;">${pinyin}</div>`;
                }
                html += `<div style="font-size:13px;color:var(--gray-light);margin-top:4px;">🔊 Escucha y repite</div>`;
            } else {
                html += `<div style="font-size:24px;font-weight:700;color:var(--dark);">${textoEscucha}</div>`;
                html += `<div style="font-size:13px;color:var(--gray-light);margin-top:4px;">🔊 Escucha y repite</div>`;
            }
        }
        
        html += '</div>';
        
        // CHECKBOX PARA MI ESPACIO
        html += `
            <div style="display:flex;justify-content:center;margin-bottom:12px;">
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:var(--gray);padding:4px 12px;border-radius:16px;background:var(--bg);border:1px solid var(--light);">
                    <input type="checkbox" ${esFavorita ? 'checked' : ''} 
                           onchange="window.UIEspacio._toggleFraseFavorita(${frase.id || 0}, this.checked)" 
                           style="width:16px;height:16px;cursor:pointer;">
                    <span>⭐ Guardar en Mi Espacio</span>
                </label>
            </div>
        `;
        
        // Contenido según modo
        if (modo === 'flashcard') {
            html += this._renderFlashcard(frase, modoData);
        } else if (modo === 'escritura') {
            html += this._renderEscritura(frase, modoData);
        } else if (modo === 'multiple') {
            if (this._opcionesMultiple.length === 0) {
                html += '<div style="text-align:center;padding:20px;color:var(--gray);"><i class="fas fa-spinner fa-spin"></i> Generando opciones...</div>';
                pipeline.generarOpcionesMultiples().then(opciones => {
                    this._opcionesMultiple = opciones;
                    this._renderizarFraseInteractiva();
                });
            } else {
                html += this._renderMultiple(frase, modoData);
            }
        } else if (modo === 'escucha') {
            html += this._renderEscucha(frase, modoData);
        }
        
        // Palabras desglosadas
        if (frase.palabras && frase.palabras.length > 0) {
            html += this._renderPalabrasDesglosadas(frase);
        }
        
        // Navegación
        html += '<div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap;">';
        html += '<button class="btn-secondary" onclick="window.UIStudy._fraseAnterior()" style="padding:8px 16px;font-size:13px;"><i class="fas fa-chevron-left"></i> Anterior</button>';
        html += '<span style="font-size:13px;color:var(--gray);padding:8px 0;">' + actual + ' / ' + total + '</span>';
        html += '<button class="btn-secondary" onclick="window.UIStudy._fraseSiguiente()" style="padding:8px 16px;font-size:13px;">Siguiente <i class="fas fa-chevron-right"></i></button>';
        html += '</div>';
        
        html += '</div>';
        container.innerHTML = html;
        
        const counter = document.getElementById('cardCounter');
        if (counter) counter.textContent = actual + ' / ' + total;
        
        // Enlazar eventos
        if (modo === 'escritura') {
            this._enlazarEventosEscritura();
        }
        if (modo === 'multiple') {
            this._enlazarEventosMultiple();
        }
    }

    // ============================================================
    // FLASHCARD
    // ============================================================
    
    _renderFlashcard(frase, modoData) {
        let html = '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:8px;">';
        html += '<button class="btn-secondary" onclick="window.UIStudy._toggleFlashcardRespuesta()" style="padding:8px 20px;font-size:13px;">';
        html += '<i class="fas ' + (this._mostrandoRespuesta ? 'fa-eye-slash' : 'fa-eye') + '"></i> ' + (this._mostrandoRespuesta ? 'Ocultar' : 'Mostrar');
        html += '</button>';
        html += '<button class="btn-secondary" onclick="window.UIStudy._generarPista()" style="padding:8px 20px;font-size:13px;">';
        html += '<i class="fas fa-lightbulb"></i> Pista';
        html += '</button>';
        html += '</div>';
        
        html += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">';
        html += '<button class="action-btn danger" onclick="window.UIStudy._responderEstudio(\'fallo\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-times"></i> Fallo</button>';
        html += '<button class="action-btn warning" onclick="window.UIStudy._responderEstudio(\'duda\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-question"></i> Duda</button>';
        html += '<button class="action-btn info" onclick="window.UIStudy._responderEstudio(\'parcial\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-minus"></i> Parcial</button>';
        html += '<button class="action-btn success" onclick="window.UIStudy._responderEstudio(\'correcto\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-check"></i> Correcto</button>';
        html += '</div>';
        
        return html;
    }

    _toggleFlashcardRespuesta() {
        this._mostrandoRespuesta = !this._mostrandoRespuesta;
        if (!this._mostrandoRespuesta) {
            this._pistaActual = '';
        }
        this._renderizarFraseInteractiva();
    }

    // ============================================================
    // ESCRITURA
    // ============================================================
    
    _renderEscritura(frase, modoData) {
        const resultado = this._ultimaRespuesta;
        const esJeroglifico = modoData.esJeroglifico;
        const esInverso = modoData.esInverso;
        
        let html = '<div style="padding:12px 0;border-top:2px solid var(--bg);border-bottom:2px solid var(--bg);margin-bottom:16px;">';
        
        // Label del input
        let label;
        if (esJeroglifico && esInverso) {
            label = `✍️ Escribe en ${frase.idioma || pipeline.idiomaObjetivo || 'idioma objetivo'} (pinyin aceptado):`;
        } else if (esJeroglifico && !esInverso) {
            label = `📝 Escribe la traducción al español:`;
        } else {
            label = esInverso ? 
                `✍️ Escribe la frase en ${frase.idioma || pipeline.idiomaObjetivo || 'idioma objetivo'}:` :
                '📝 Escribe la traducción:';
        }
        html += `<label style="font-size:13px;font-weight:600;color:var(--gray);">${label}</label>`;
        
        // Input
        let placeholder;
        if (esJeroglifico && esInverso) {
            placeholder = 'Escribe en hanzi o pinyin...';
        } else if (esJeroglifico && !esInverso) {
            placeholder = 'Escribe la traducción al español...';
        } else {
            placeholder = 'Escribe aquí...';
        }
        
        html += '<div style="display:flex;gap:10px;margin-top:6px;">';
        html += `<input type="text" id="respuestaEscritura" placeholder="${placeholder}" style="flex:1;padding:10px 14px;border:2px solid var(--light);border-radius:10px;font-size:15px;font-family:var(--font);">`;
        html += '<button class="btn-primary" id="btnValidarEscritura" style="padding:10px 20px;font-size:14px;width:auto;"><i class="fas fa-check"></i> Validar</button>';
        html += '</div>';
        
        // Resultado
        if (resultado) {
            const icono = resultado.correcto ? '✅' : resultado.aproximado ? '🟡' : '❌';
            const color = resultado.correcto ? 'var(--success)' : resultado.aproximado ? 'var(--warning)' : 'var(--danger)';
            html += '<div style="padding:12px 16px;border-radius:10px;background:' + color + '10;border-left:4px solid ' + color + ';margin-top:8px;">';
            html += '<div style="font-size:14px;font-weight:500;">' + icono + ' ' + resultado.mensaje + '</div>';
            
            if (resultado.sugerencias && resultado.sugerencias.length > 0) {
                html += '<div style="font-size:13px;color:var(--gray);margin-top:4px;">💡 ' + resultado.sugerencias.slice(0, 2).join(' ') + '</div>';
            }
            
            if (!resultado.correcto && !resultado.aproximado) {
                html += '<div style="font-size:13px;color:var(--gray);margin-top:4px;">Correcta: <strong>' + resultado.correctaEsperada + '</strong></div>';
            }
            
            if (resultado.puntuacion !== undefined && resultado.puntuacion > 0) {
                html += '<div style="font-size:12px;color:var(--gray);margin-top:2px;">🎯 Puntuación: ' + resultado.puntuacion + '%</div>';
            }
            
            html += '</div>';
            
            html += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px;">';
            if (resultado.correcto) {
                html += '<button class="action-btn success" onclick="window.UIStudy._responderEstudio(\'correcto\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-check"></i> Correcto</button>';
            } else if (resultado.aproximado) {
                html += '<button class="action-btn info" onclick="window.UIStudy._responderEstudio(\'parcial\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-minus"></i> Parcial</button>';
                html += '<button class="action-btn danger" onclick="window.UIStudy._responderEstudio(\'fallo\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-times"></i> Fallo</button>';
            } else {
                html += '<button class="action-btn danger" onclick="window.UIStudy._responderEstudio(\'fallo\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-times"></i> Fallo</button>';
            }
            html += '</div>';
        } else {
            html += '<div style="font-size:12px;color:var(--gray-light);text-align:center;margin-top:8px;">💡 Escribe tu respuesta y pulsa "Validar"</div>';
            html += '<div style="display:flex;justify-content:center;margin-top:8px;">';
            html += '<button class="btn-secondary" onclick="window.UIStudy._generarPista()" style="padding:6px 16px;font-size:12px;"><i class="fas fa-lightbulb"></i> Pista</button>';
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }

    _enlazarEventosEscritura() {
        const btnValidar = document.getElementById('btnValidarEscritura');
        const input = document.getElementById('respuestaEscritura');
        
        if (btnValidar) {
            const newBtn = btnValidar.cloneNode(true);
            btnValidar.parentNode.replaceChild(newBtn, btnValidar);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._validarRespuestaEscrita();
            });
        }
        
        if (input) {
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            newInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    this._validarRespuestaEscrita();
                }
            });
            setTimeout(() => newInput.focus(), 150);
        }
    }

    async _validarRespuestaEscrita() {
        const input = document.getElementById('respuestaEscritura');
        if (!input) return;
        
        const respuesta = input.value.trim();
        if (!respuesta) {
            this.core.mostrarToast('✏️ Escribe una respuesta primero.', 'warning');
            return;
        }
        
        if (!pipeline || !pipeline.fraseActual) return;
        
        this.core.mostrarToast('🔍 Validando respuesta...', 'info');
        
        const frase = pipeline.fraseActual;
        
        let resultado;
        
        try {
            if (window.modoInverso && window.modoInverso.isActivo()) {
                const validacion = window.modoInverso.validarRespuesta(respuesta, frase);
                
                if (validacion.correcto) {
                    resultado = {
                        correcto: true,
                        aproximado: false,
                        mensaje: '✅ ¡Perfecto! Respuesta correcta.',
                        correctaEsperada: validacion.correctaEsperada,
                        puntuacion: 100,
                        errores: [],
                        sugerencias: [],
                        aciertos: [respuesta]
                    };
                } else if (validacion.aproximado) {
                    resultado = {
                        correcto: false,
                        aproximado: true,
                        mensaje: validacion.sugerencias.length > 0 ? 
                            '🟡 ' + validacion.sugerencias[0] :
                            '🟡 Aproximado. La respuesta correcta es: ' + validacion.correctaEsperada,
                        correctaEsperada: validacion.correctaEsperada,
                        puntuacion: validacion.puntuacion || 70,
                        errores: validacion.esJeroglifico ? ['Usa caracteres hanzi para la respuesta exacta'] : ['Revisa la respuesta'],
                        sugerencias: validacion.sugerencias || [],
                        aciertos: []
                    };
                } else {
                    const similitud = pipeline._calcularSimilitudTexto(respuesta, validacion.correctaEsperada);
                    if (similitud > 0.8) {
                        resultado = {
                            correcto: false,
                            aproximado: true,
                            mensaje: '🟡 Muy cerca. Revisa pequeños detalles.',
                            correctaEsperada: validacion.correctaEsperada,
                            puntuacion: Math.round(similitud * 100),
                            errores: [],
                            sugerencias: ['Revisa la ortografía'],
                            aciertos: []
                        };
                    } else {
                        resultado = {
                            correcto: false,
                            aproximado: false,
                            mensaje: `❌ Respuesta incorrecta. La respuesta correcta es: ${validacion.correctaEsperada}`,
                            correctaEsperada: validacion.correctaEsperada,
                            puntuacion: Math.round(similitud * 100),
                            errores: ['Respuesta incorrecta'],
                            sugerencias: [],
                            aciertos: []
                        };
                    }
                }
            } else {
                const validacion = pipeline.validarRespuestaEscrita(respuesta);
                const esJeroglifico = frase.esJeroglifico || false;
                let sugerenciasExtras = [];
                if (esJeroglifico && !validacion.correcto && frase.pinyinCompleto) {
                    sugerenciasExtras.push(`💡 Pista fonética: "${frase.pinyinCompleto}"`);
                }
                
                resultado = {
                    correcto: validacion.correcto,
                    aproximado: validacion.parcial,
                    mensaje: validacion.mensaje,
                    correctaEsperada: validacion.correctaEsperada || frase.traduccion,
                    puntuacion: Math.round(validacion.similitud * 100),
                    errores: validacion.correcto ? [] : ['Revisa la traducción'],
                    sugerencias: sugerenciasExtras,
                    aciertos: []
                };
            }
            
        } catch (error) {
            console.error('❌ Error en validación:', error);
            const similitud = pipeline._calcularSimilitudTexto(respuesta, frase.traduccion || '');
            resultado = {
                correcto: similitud >= 0.9,
                aproximado: similitud >= 0.6,
                mensaje: similitud >= 0.9 ? '✅ ¡Perfecto! Respuesta correcta.' : 
                         similitud >= 0.6 ? '🟡 Casi correcto. Revisa pequeños detalles.' : 
                         `❌ Incorrecto. La respuesta correcta es: ${frase.traduccion || ''}`,
                correctaEsperada: frase.traduccion || '',
                puntuacion: Math.round(similitud * 100),
                errores: similitud < 0.6 ? ['Revisa la traducción'] : [],
                sugerencias: [],
                aciertos: []
            };
        }
        
        this._ultimaRespuesta = resultado;
        input.value = '';
        
        this._renderizarFraseInteractiva();
        
        setTimeout(() => {
            const newInput = document.getElementById('respuestaEscritura');
            if (newInput) newInput.focus();
        }, 150);
    }

    // ============================================================
    // GENERAR PISTA
    // ============================================================
    
    async _generarPista() {
        if (!pipeline || !pipeline.fraseActual) {
            this.core.mostrarToast('❌ No hay frase activa', 'error');
            return;
        }
        
        this.core.mostrarToast('🧠 Generando pista...', 'info');
        
        try {
            const pista = await pipeline.generarPista();
            this._pistaActual = pista;
            this._mostrandoRespuesta = true;
            this._renderizarFraseInteractiva();
        } catch (error) {
            console.warn('⚠️ Error generando pista:', error);
            const frase = pipeline.fraseActual;
            if (frase.esJeroglifico && frase.pinyinCompleto) {
                this._pistaActual = `💡 Pista fonética: "${frase.pinyinCompleto}"`;
            } else {
                this._pistaActual = '💡 Intenta recordar el contexto y significado de la frase.';
            }
            this._mostrandoRespuesta = true;
            this._renderizarFraseInteractiva();
        }
    }

    // ============================================================
    // OPCIÓN MÚLTIPLE
    // ============================================================
    
    _renderMultiple(frase, modoData) {
        const opciones = this._opcionesMultiple;
        const correcta = modoData.ocultar;
        const resultado = this._ultimaRespuesta;
        
        let html = '<div style="padding:12px 0;border-top:2px solid var(--bg);border-bottom:2px solid var(--bg);margin-bottom:16px;">';
        
        html += '<div style="font-size:14px;font-weight:600;color:var(--gray);margin-bottom:10px;">Selecciona la ' + (modoData.esInverso ? 'frase original' : 'traducción') + ' correcta:</div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
        
        for (let i = 0; i < opciones.length; i++) {
            const opcion = opciones[i];
            const isCorrect = opcion === correcta;
            const isSelected = resultado && opcion === resultado.opcionSeleccionada;
            let bgColor = 'var(--white)';
            let borderColor = 'var(--light)';
            let textColor = 'var(--dark)';
            
            if (resultado) {
                if (isCorrect) {
                    bgColor = 'rgba(0,184,148,0.1)';
                    borderColor = 'var(--success)';
                    textColor = 'var(--success)';
                } else if (isSelected && !isCorrect) {
                    bgColor = 'rgba(255,118,117,0.1)';
                    borderColor = 'var(--danger)';
                    textColor = 'var(--danger)';
                }
            }
            
            const disabled = resultado ? 'style="cursor:default;opacity:0.8;"' : '';
            const dataAttr = `data-texto="${opcion.replace(/'/g, "\\'")}"`;
            
            html += `<div class="multiple-opcion" ${dataAttr} ${disabled} style="padding:12px 16px;border-radius:10px;border:2px solid ${borderColor};background:${bgColor};color:${textColor};cursor:${resultado ? 'default' : 'pointer'};text-align:center;font-size:14px;font-weight:500;transition:all 0.3s;">`;
            if (resultado && isCorrect) {
                html += '✅ ';
            } else if (resultado && isSelected && !isCorrect) {
                html += '❌ ';
            }
            html += opcion;
            html += '</div>';
        }
        
        html += '</div>';
        
        if (resultado) {
            const isCorrect = resultado.opcionSeleccionada === correcta;
            const icono = isCorrect ? '✅' : '❌';
            const color = isCorrect ? 'var(--success)' : 'var(--danger)';
            html += '<div style="padding:10px 16px;border-radius:10px;background:' + color + '10;border-left:4px solid ' + color + ';margin-top:10px;">';
            html += '<div style="font-size:14px;font-weight:500;">' + icono + ' ' + resultado.mensaje + '</div>';
            html += '</div>';
            
            html += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px;">';
            if (isCorrect) {
                html += '<button class="action-btn success" onclick="window.UIStudy._responderEstudio(\'correcto\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-check"></i> Correcto</button>';
            } else {
                html += '<button class="action-btn danger" onclick="window.UIStudy._responderEstudio(\'fallo\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-times"></i> Fallo</button>';
            }
            html += '</div>';
        } else {
            html += '<div style="font-size:12px;color:var(--gray-light);text-align:center;margin-top:8px;">💡 Selecciona una opción para continuar</div>';
        }
        
        html += '</div>';
        return html;
    }

    _enlazarEventosMultiple() {
        document.querySelectorAll('.multiple-opcion').forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            
            newEl.addEventListener('click', (e) => {
                const opcion = newEl.dataset.texto;
                if (opcion && !this._ultimaRespuesta) {
                    this._seleccionarOpcionMultiple(opcion);
                }
            });
        });
    }

    async _seleccionarOpcionMultiple(opcion) {
        if (this._ultimaRespuesta) return;
        
        let correcta;
        if (window.modoInverso && window.modoInverso.isActivo()) {
            correcta = pipeline.fraseActual ? pipeline.fraseActual.original : '';
        } else {
            correcta = pipeline.fraseActual ? pipeline.fraseActual.traduccion : '';
        }
        const isCorrect = opcion === correcta;
        
        this._ultimaRespuesta = {
            opcionSeleccionada: opcion,
            correcto: isCorrect,
            aproximado: false,
            mensaje: isCorrect ? '✅ ¡Correcto! Has seleccionado la opción adecuada.' : '❌ Incorrecto. La respuesta correcta es: ' + correcta,
            correctaEsperada: correcta
        };
        
        this._renderizarFraseInteractiva();
    }

    // ============================================================
    // ESCUCHA
    // ============================================================
    
    _renderEscucha(frase, modoData) {
        const texto = modoData.esInverso ? modoData.ocultar : modoData.mostrar;
        const esJeroglifico = modoData.esJeroglifico;
        
        let html = '<div style="padding:16px 0;border-top:2px solid var(--bg);border-bottom:2px solid var(--bg);margin-bottom:16px;text-align:center;">';
        
        html += '<div style="font-size:48px;margin-bottom:12px;">🔊</div>';
        html += '<div style="font-size:16px;color:var(--gray);margin-bottom:12px;">Escucha la frase y luego intenta repetirla en voz alta.</div>';
        
        // Mostrar el texto a escuchar
        if (esJeroglifico) {
            const hanzi = frase.segmentacion?.hanzi || frase.original || '';
            const pinyin = frase.segmentacion?.pinyin || frase.pinyinCompleto || '';
            html += `<div style="font-size:22px;font-weight:700;color:var(--dark);">${hanzi}</div>`;
            if (pinyin) {
                html += `<div style="font-size:14px;color:var(--gray);">${pinyin}</div>`;
            }
        } else {
            html += `<div style="font-size:18px;font-weight:600;color:var(--dark);">${texto}</div>`;
        }
        
        html += '<button class="btn-primary" onclick="window.UIStudy._reproducirFrase(\'' + texto.replace(/'/g, "\\'") + '\', \'' + (frase.idioma || pipeline.idiomaObjetivo || 'es') + '\')" style="padding:12px 30px;font-size:16px;margin-top:8px;">';
        html += '<i class="fas fa-play"></i> Reproducir';
        html += '</button>';
        
        if (this._mostrandoRespuesta) {
            html += '<div style="margin-top:12px;padding:12px;background:rgba(108,92,231,0.06);border-radius:10px;font-size:16px;color:var(--primary);">' + modoData.ocultar + '</div>';
        } else {
            html += '<button class="btn-secondary" onclick="window.UIStudy._toggleFlashcardRespuesta()" style="margin-top:12px;padding:6px 16px;font-size:12px;">Mostrar ' + (modoData.esInverso ? 'original' : 'traducción') + '</button>';
        }
        
        html += '</div>';
        
        html += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">';
        html += '<button class="action-btn danger" onclick="window.UIStudy._responderEstudio(\'fallo\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-times"></i> Fallo</button>';
        html += '<button class="action-btn warning" onclick="window.UIStudy._responderEstudio(\'duda\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-question"></i> Duda</button>';
        html += '<button class="action-btn info" onclick="window.UIStudy._responderEstudio(\'parcial\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-minus"></i> Parcial</button>';
        html += '<button class="action-btn success" onclick="window.UIStudy._responderEstudio(\'correcto\')" style="padding:8px 14px;font-size:11px;min-width:60px;"><i class="fas fa-check"></i> Correcto</button>';
        html += '</div>';
        
        return html;
    }

    _reproducirFrase(texto, idioma) {
        if (!window.speechSynthesis) {
            this.core.mostrarToast('⚠️ Tu navegador no soporta síntesis de voz.', 'error');
            return;
        }
        
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = idioma || 'es';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        const voices = window.speechSynthesis.getVoices();
        const nativeVoice = voices.find(v => v.lang.startsWith(utterance.lang));
        if (nativeVoice) {
            utterance.voice = nativeVoice;
        }
        
        window.speechSynthesis.speak(utterance);
        this.core.mostrarToast('🔊 Reproduciendo...', 'info');
    }

    // ============================================================
    // PALABRAS DESGLOSADAS CON PINYIN
    // ============================================================
    
    _renderPalabrasDesglosadas(frase) {
        if (!frase.palabras || frase.palabras.length === 0) return '';
        
        const esJeroglifico = frase.esJeroglifico || false;
        let html = '<div style="padding:12px 0;border-top:2px solid var(--bg);margin-top:8px;">';
        html += '<div style="font-size:12px;font-weight:600;color:var(--gray);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">📖 Palabras desglosadas</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
        
        for (const p of frase.palabras) {
            const texto = p.hanzi || p.palabra || '';
            const pinyin = p.pinyin || '';
            const familia = p.familia || (p.familias && p.familias[0]) || 'sin_clasificar';
            const significado = p.significado || '';
            const color = this.core._getColorFamilia(familia);
            
            // Mostrar la palabra
            html += `<span style="display:inline-flex;flex-direction:column;align-items:center;padding:4px 12px;border-radius:12px;background:${color}15;border:1px solid ${color}30;cursor:pointer;" onclick="window.uiCore.mostrarToast('${texto}: ${significado || 'Sin definición'}\\nFamilia: ${familia}${pinyin ? '\\nPinyin: ' + pinyin : ''}', 'info')">`;
            html += `<span style="font-weight:600;color:${color};font-size:16px;">${texto}</span>`;
            if (pinyin && esJeroglifico) {
                html += `<span style="font-size:10px;color:var(--gray);">${pinyin}</span>`;
            }
            if (significado) {
                html += `<span style="font-size:10px;color:var(--gray);">${significado.substring(0, 12)}</span>`;
            }
            html += '</span>';
        }
        
        html += '</div></div>';
        return html;
    }

    // ============================================================
    // RESPUESTA Y NAVEGACIÓN
    // ============================================================
    
    _responderEstudio(tipo) {
        if (pipeline && pipeline.procesarRespuesta) {
            pipeline.procesarRespuesta(tipo);
            this._mostrandoRespuesta = false;
            this._ultimaRespuesta = null;
            this._pistaActual = '';
            this._opcionesMultiple = [];
            setTimeout(() => {
                if (window.UIDashboard) window.UIDashboard._cargarDashboardInicial(this.core);
            }, 300);
        }
    }

    _fraseAnterior() {
        if (pipeline && pipeline.anterior) {
            this._mostrandoRespuesta = false;
            this._ultimaRespuesta = null;
            this._pistaActual = '';
            this._opcionesMultiple = [];
            pipeline.anterior();
        }
    }

    _fraseSiguiente() {
        if (pipeline && pipeline.siguiente) {
            this._mostrandoRespuesta = false;
            this._ultimaRespuesta = null;
            this._pistaActual = '';
            this._opcionesMultiple = [];
            pipeline.siguiente();
        }
    }

    async mostrarPantallaInicio() {
        const container = document.getElementById('cardContainer');
        if (!container) return;
        
        try {
            const usuario = await db.getUsuario();
            const idiomaActivo = gestorIdiomas.getIdiomaActivo() || 'es';
            const infoIdioma = gestorIdiomas.getInfoIdioma(idiomaActivo);
            
            container.innerHTML = '<div class="card" style="max-width:500px;padding:40px 30px;text-align:center;">' +
                '<div style="font-size:64px;margin-bottom:16px;">📚</div>' +
                '<h2 style="font-size:22px;font-weight:800;margin-bottom:8px;">' + (usuario ? '¡Hola, ' + usuario.nombre + '!' : 'Bienvenido') + '</h2>' +
                '<p style="color:var(--gray);font-size:16px;margin-bottom:8px;line-height:1.6;">' + 
                (usuario ? 'Comienza generando o importando historias' : 'Regístrate para comenzar') + 
                '</p>' +
                (idiomaActivo ? '<p style="color:var(--gray-light);font-size:14px;margin-bottom:16px;">🌍 Idioma activo: <strong>' + idiomaActivo + '</strong>' + (infoIdioma ? ' (Nivel ' + infoIdioma.nivel + ')' : '') + '</p>' : '') +
                '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
                '<button class="btn-primary" onclick="window.UIJSON.abrirGeneradorJSON()" style="flex:1;min-width:140px;"><i class="fas fa-plus"></i> Generar</button>' +
                '<button class="btn-secondary" onclick="window.UIJSON.abrirImportadorJSON()" style="flex:1;min-width:140px;"><i class="fas fa-file-import"></i> Importar</button>' +
                '</div></div>';
        } catch (e) {
            console.warn('⚠️ Error mostrando pantalla de inicio:', e);
        }
    }
}

// ============================================================
// INSTANCIA GLOBAL
// ============================================================

window.UIStudy = new UIStudy();

console.log('✅ UIStudy v17.3 - CORREGIDO: Flashcard muestra solo la frase');
console.log('  🔥 En Flashcard: solo se ve la frase objetivo');
console.log('  🔥 Traducción aparece al hacer clic en "Mostrar"');
console.log('  🔥 Pinyin visible para jeroglíficos');